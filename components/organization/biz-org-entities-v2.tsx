/**
 * Business Organization Entities V2 — Health-centric entity management.
 * Sub-tabs: Overview | Entity List | Requirements | Activity
 * Traffic-light health model (Governance / Finance / Rails / Compliance).
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import {
  BizCard,
  BizSubTabBar,
  BizStatusChip,
  BizAlertCard,
  BizEmptyLock,
  statusVariant,
  statusColor,
} from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import type {
  TrafficLight,
  BizEntityType,
  EntityHealth,
  CrossTabLink,
} from '@/data/biz-org-shared-types';
import {
  TRAFFIC_LIGHT_COLORS,
  BIZ_ENTITY_TYPE_LABELS,
  BIZ_ENTITY_TYPE_COLORS,
  worstHealth,
  triageSortHealth,
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SPONSOR_BANK,
  PAYMENT_PROCESSOR,
  VALUETAINMENT,
  SLIEMA_WANDERERS,
  TARGET_BANK,
  SEEDED_ENTITY_NAMES,
  SEEDED_ENTITY_TYPES,
} from '@/data/biz-org-shared-types';
import {
  getBizEntitiesData,
  getEntityById,
  getRequirementsByEntity,
  getCompletionPct,
} from '@/data/mock-biz-org-entities';
import type {
  BizEntity,
  EntityRequirement,
  EntityActivityEvent,
} from '@/data/mock-biz-org-entities';

// =============================================================================
// CONSTANTS
// =============================================================================

const BP = BusinessPalette;

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'entity-list', label: 'Entity List' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'activity', label: 'Activity' },
];

const FILTER_CHIPS: { id: BizEntityType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'internal', label: 'Internal' },
  { id: 'holdco', label: 'HoldCo' },
  { id: 'partner', label: 'Partner' },
  { id: 'relationship', label: 'Relationship' },
  { id: 'asset', label: 'Asset' },
  { id: 'deal_acquisition', label: 'Deal' },
  { id: 'project', label: 'Project' },
];

const HEALTH_DIMENSIONS: { key: keyof EntityHealth; label: string; icon: string }[] = [
  { key: 'governance', label: 'Gov', icon: 'building.columns.fill' },
  { key: 'finance', label: 'Fin', icon: 'dollarsign.circle.fill' },
  { key: 'rails', label: 'Rails', icon: 'arrow.left.arrow.right' },
  { key: 'compliance', label: 'Comp', icon: 'checkmark.shield.fill' },
];

const CATEGORY_LABELS: Record<EntityRequirement['category'], string> = {
  formation: 'Formation',
  compliance: 'Compliance',
  finance: 'Finance',
  ops: 'Operations',
};

const CATEGORY_ICONS: Record<EntityRequirement['category'], string> = {
  formation: 'doc.text.fill',
  compliance: 'checkmark.shield.fill',
  finance: 'dollarsign.circle.fill',
  ops: 'gear',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function statusLabel(status: BizEntity['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'inactive': return 'Inactive';
    case 'pending': return 'Pending';
    case 'dissolved': return 'Dissolved';
  }
}

function statusChipVariant(status: BizEntity['status']): 'success' | 'warning' | 'error' | 'neutral' {
  switch (status) {
    case 'active': return 'success';
    case 'pending': return 'warning';
    case 'inactive': return 'neutral';
    case 'dissolved': return 'error';
  }
}

function formatTimestamp(ts: string): string {
  // Input: "2026-02-16 14:30" or "2026-02-16"
  const parts = ts.split(' ');
  const dateParts = parts[0].split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(dateParts[1], 10) - 1] || dateParts[1];
  const day = parseInt(dateParts[2], 10);
  const time = parts[1] || '';
  if (time) {
    return `${month} ${day}, ${time}`;
  }
  return `${month} ${day}`;
}

function relativeTime(ts: string): string {
  const now = new Date('2026-02-17T12:00:00');
  const then = new Date(ts.replace(' ', 'T') + ':00');
  const diffMs = now.getTime() - then.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays === 1) return '1d ago';
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatTimestamp(ts);
}

// =============================================================================
// TRAFFIC LIGHT DOT
// =============================================================================

function TrafficLightDot({ value, size = 10 }: { value: TrafficLight; size?: number }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: TRAFFIC_LIGHT_COLORS[value],
      }}
    />
  );
}

// =============================================================================
// HEALTH STRIP — 4 inline dots with labels
// =============================================================================

function HealthStrip({ health, compact = false }: { health: EntityHealth; compact?: boolean }) {
  return (
    <View style={s.healthStrip}>
      {HEALTH_DIMENSIONS.map((dim) => (
        <View key={dim.key} style={s.healthStripItem}>
          <TrafficLightDot value={health[dim.key]} size={compact ? 8 : 10} />
          {!compact && (
            <ThemedText style={[s.healthStripLabel, { color: BP.ash }]}>
              {dim.label}
            </ThemedText>
          )}
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// HEALTH SUMMARY — 4 traffic lights in a row with labels and icons
// =============================================================================

function HealthSummary({ health }: { health: EntityHealth }) {
  return (
    <View style={s.healthSummaryRow}>
      {HEALTH_DIMENSIONS.map((dim) => {
        const color = TRAFFIC_LIGHT_COLORS[health[dim.key]];
        return (
          <View key={dim.key} style={s.healthSummaryItem}>
            <View style={[s.healthSummaryDot, { backgroundColor: color + '20' }]}>
              <IconSymbol name={dim.icon as any} size={16} color={color} />
            </View>
            <ThemedText style={[s.healthSummaryLabel, { color: BP.ash }]}>
              {dim.label}
            </ThemedText>
            <ThemedText style={[s.healthSummaryValue, { color }]}>
              {health[dim.key].charAt(0).toUpperCase() + health[dim.key].slice(1)}
            </ThemedText>
          </View>
        );
      })}
    </View>
  );
}

// =============================================================================
// TYPE BADGE
// =============================================================================

function EntityTypeBadge({ type }: { type: BizEntityType }) {
  const color = BIZ_ENTITY_TYPE_COLORS[type];
  const label = BIZ_ENTITY_TYPE_LABELS[type];
  return (
    <View style={[s.typeBadge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.typeBadgeText, { color }]}>{label.toUpperCase()}</ThemedText>
    </View>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={BP.ash} />
      <ThemedText style={[s.emptyText, { color: BP.ash }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  entities,
  onSelectEntity,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  entities: BizEntity[];
  onSelectEntity: (entity: BizEntity) => void;
}) {
  // Triage sort: worst health first
  const sortedEntities = useMemo(() => {
    return [...entities].sort((a, b) => triageSortHealth(a.health, b.health));
  }, [entities]);

  // Alert cards for entities with red health
  const redEntities = useMemo(() => {
    return sortedEntities.filter((e) => worstHealth(e.health) === 'red');
  }, [sortedEntities]);

  // Stats
  const totalCount = entities.length;
  const activeCount = entities.filter((e) => e.status === 'active').length;
  const pendingCount = entities.filter((e) => e.status === 'pending').length;
  const yellowCount = entities.filter((e) => worstHealth(e.health) === 'yellow').length;
  const redCount = redEntities.length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
    >
      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <ThemedText style={[s.kpiValue, { color: BP.smoke }]}>{totalCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: BP.ash }]}>Total</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <ThemedText style={[s.kpiValue, { color: BP.emerald }]}>{activeCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: BP.ash }]}>Active</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <ThemedText style={[s.kpiValue, { color: BP.amber }]}>{pendingCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: BP.ash }]}>Pending</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <ThemedText style={[s.kpiValue, { color: BP.red }]}>{redCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: BP.ash }]}>Critical</ThemedText>
        </View>
      </View>

      {/* Alerts for red entities */}
      {redEntities.length > 0 && (
        <View style={s.alertSection}>
          <ThemedText style={[s.sectionTitle, { color: BP.smoke }]}>Requires Attention</ThemedText>
          {redEntities.map((entity) => (
            <BizAlertCard
              key={entity.id}
              icon="exclamationmark.triangle.fill"
              title={entity.name}
              subtitle={entity.nextAction}
              variant="error"
            />
          ))}
        </View>
      )}

      {/* Entity Health Grid */}
      <ThemedText style={[s.sectionTitle, { color: BP.smoke, marginTop: Spacing.md }]}>
        Entity Health Grid
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: BP.ash }]}>
        Triage-sorted: worst health first
      </ThemedText>

      {sortedEntities.map((entity) => (
        <Pressable
          key={entity.id}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectEntity(entity);
          }}
        >
          <BizCard>
            {/* Header: Name + Type */}
            <View style={s.overviewCardHeader}>
              <View style={s.overviewCardNameCol}>
                <ThemedText style={[s.overviewCardName, { color: BP.smoke }]} numberOfLines={1}>
                  {entity.name}
                </ThemedText>
                <EntityTypeBadge type={entity.type} />
              </View>
              <BizStatusChip label={statusLabel(entity.status)} variant={statusChipVariant(entity.status)} />
            </View>

            {/* Health Dots Row */}
            <View style={s.overviewHealthRow}>
              {HEALTH_DIMENSIONS.map((dim) => {
                const color = TRAFFIC_LIGHT_COLORS[entity.health[dim.key]];
                return (
                  <View key={dim.key} style={s.overviewHealthItem}>
                    <View style={[s.overviewHealthDot, { backgroundColor: color }]} />
                    <ThemedText style={[s.overviewHealthLabel, { color: BP.ash }]}>
                      {dim.label}
                    </ThemedText>
                  </View>
                );
              })}
            </View>

            {/* Next Action */}
            <View style={s.overviewNextAction}>
              <IconSymbol name="arrow.right.circle" size={12} color={BP.ash} />
              <ThemedText style={[s.overviewNextActionText, { color: BP.ash }]} numberOfLines={1}>
                {entity.nextAction}
              </ThemedText>
            </View>
          </BizCard>
        </Pressable>
      ))}

      {sortedEntities.length === 0 && (
        <EmptyState icon="building.2.fill" label="No entities found" />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ENTITY LIST SUB-TAB
// =============================================================================

function EntityListTab({
  colors,
  accentColor,
  entities,
  filterType,
  searchQuery,
  onFilterChange,
  onSearchChange,
  onSelectEntity,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  entities: BizEntity[];
  filterType: BizEntityType | 'all';
  searchQuery: string;
  onFilterChange: (type: BizEntityType | 'all') => void;
  onSearchChange: (q: string) => void;
  onSelectEntity: (entity: BizEntity) => void;
}) {
  // Filtered list
  const filteredEntities = useMemo(() => {
    let list = entities;
    if (filterType !== 'all') {
      list = list.filter((e) => e.type === filterType);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          BIZ_ENTITY_TYPE_LABELS[e.type].toLowerCase().includes(q) ||
          e.nextAction.toLowerCase().includes(q),
      );
    }
    return list;
  }, [entities, filterType, searchQuery]);

  const renderItem = useCallback(
    ({ item }: { item: BizEntity }) => {
      const typeColor = BIZ_ENTITY_TYPE_COLORS[item.type];
      return (
        <Pressable
          style={[s.entityListCard, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectEntity(item);
          }}
        >
          {/* Top Row: Type badge + Name */}
          <View style={s.entityListTop}>
            <View style={[s.entityListTypeDot, { backgroundColor: typeColor }]} />
            <View style={s.entityListNameCol}>
              <ThemedText style={[s.entityListName, { color: BP.smoke }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <EntityTypeBadge type={item.type} />
            </View>
            <BizStatusChip label={statusLabel(item.status)} variant={statusChipVariant(item.status)} />
          </View>

          {/* Health Strip */}
          <View style={s.entityListHealthRow}>
            <HealthStrip health={item.health} />
          </View>

          {/* Next Action */}
          <View style={[s.entityListFooter, { borderTopColor: BP.graphite }]}>
            <IconSymbol name="arrow.right.circle" size={12} color={BP.ash} />
            <ThemedText style={[s.entityListNextAction, { color: BP.ash }]} numberOfLines={1}>
              {item.nextAction}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [onSelectEntity],
  );

  return (
    <View style={s.flex1}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === filterType;
          return (
            <Pressable
              key={chip.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? BP.champagneGold + '20' : BP.glass,
                  borderColor: isActive ? BP.champagneGold + '40' : BP.graphite,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilterChange(chip.id);
              }}
            >
              <ThemedText
                style={[
                  s.filterChipText,
                  { color: isActive ? BP.champagneGold : BP.ash },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search */}
      <View style={s.searchContainer}>
        <View style={[s.searchBar, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <IconSymbol name="magnifyingglass" size={16} color={BP.ash} />
          <TextInput
            style={[s.searchInput, { color: BP.smoke }]}
            placeholder="Search entities..."
            placeholderTextColor={BP.ash}
            value={searchQuery}
            onChangeText={onSearchChange}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => onSearchChange('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={BP.ash} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Entity FlatList */}
      <FlatList
        data={filteredEntities}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="building.2.fill" label="No entities match filter" />
        }
      />
    </View>
  );
}

// =============================================================================
// REQUIREMENTS SUB-TAB
// =============================================================================

function RequirementsTab({
  colors,
  accentColor,
  entities,
  requirements,
  reqOverrides,
  onToggleReq,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  entities: BizEntity[];
  requirements: EntityRequirement[];
  reqOverrides: Record<string, boolean>;
  onToggleReq: (reqId: string) => void;
}) {
  // Expandable state for categories within entities
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // Group requirements by entity, then category
  const grouped = useMemo(() => {
    return entities.map((entity) => {
      const entityReqs = requirements.filter((r) => r.entityId === entity.id);
      const categories: EntityRequirement['category'][] = ['formation', 'compliance', 'finance', 'ops'];
      const catGroups = categories
        .map((cat) => ({
          category: cat,
          reqs: entityReqs.filter((r) => r.category === cat),
        }))
        .filter((g) => g.reqs.length > 0);

      const totalReqs = entityReqs.length;
      const completedReqs = entityReqs.filter((r) => {
        const override = reqOverrides[r.id];
        return override !== undefined ? override : r.completed;
      }).length;
      const pct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 100;

      return { entity, catGroups, totalReqs, completedReqs, pct };
    });
  }, [entities, requirements, reqOverrides]);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.tabScroll}
    >
      {grouped.map(({ entity, catGroups, totalReqs, completedReqs, pct }) => (
        <View key={entity.id} style={s.reqEntitySection}>
          {/* Entity Header */}
          <View style={s.reqEntityHeader}>
            <View style={s.reqEntityNameCol}>
              <ThemedText style={[s.reqEntityName, { color: BP.smoke }]} numberOfLines={1}>
                {entity.name}
              </ThemedText>
              <ThemedText style={[s.reqEntityPctText, { color: BP.ash }]}>
                {completedReqs}/{totalReqs} complete
              </ThemedText>
            </View>
            <ThemedText style={[s.reqEntityPct, { color: pct === 100 ? BP.emerald : pct >= 70 ? BP.amber : BP.red }]}>
              {pct}%
            </ThemedText>
          </View>

          {/* Progress Bar */}
          <ProgressBar
            percent={pct}
            color={pct === 100 ? BP.emerald : pct >= 70 ? BP.amber : BP.red}
          />

          {/* Category Groups */}
          {catGroups.map(({ category, reqs }) => {
            const sectionKey = `${entity.id}-${category}`;
            const isExpanded = expandedSections[sectionKey] !== false; // default expanded
            const catCompleted = reqs.filter((r) => {
              const override = reqOverrides[r.id];
              return override !== undefined ? override : r.completed;
            }).length;
            return (
              <View key={sectionKey} style={s.reqCatGroup}>
                {/* Category Header */}
                <Pressable
                  style={s.reqCatHeader}
                  onPress={() => toggleSection(sectionKey)}
                >
                  <IconSymbol
                    name={CATEGORY_ICONS[category] as any}
                    size={14}
                    color={BP.ash}
                  />
                  <ThemedText style={[s.reqCatTitle, { color: BP.smoke }]}>
                    {CATEGORY_LABELS[category]}
                  </ThemedText>
                  <ThemedText style={[s.reqCatCount, { color: BP.ash }]}>
                    {catCompleted}/{reqs.length}
                  </ThemedText>
                  <IconSymbol
                    name={isExpanded ? 'chevron.down' : 'chevron.right'}
                    size={12}
                    color={BP.ash}
                  />
                </Pressable>

                {/* Requirements List */}
                {isExpanded && reqs.map((req) => {
                  const isCompleted = reqOverrides[req.id] !== undefined
                    ? reqOverrides[req.id]
                    : req.completed;
                  return (
                    <Pressable
                      key={req.id}
                      style={s.reqItem}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onToggleReq(req.id);
                      }}
                    >
                      <IconSymbol
                        name={isCompleted ? 'checkmark.circle.fill' : 'circle'}
                        size={20}
                        color={isCompleted ? BP.emerald : BP.ash}
                      />
                      <View style={s.reqItemTextCol}>
                        <ThemedText
                          style={[
                            s.reqItemLabel,
                            { color: isCompleted ? BP.ash : BP.smoke },
                            isCompleted && s.reqItemStrikethrough,
                          ]}
                          numberOfLines={2}
                        >
                          {req.label}
                        </ThemedText>
                        <ThemedText style={[s.reqItemDetail, { color: BP.ash }]} numberOfLines={2}>
                          {req.detail}
                        </ThemedText>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      ))}

      {grouped.length === 0 && (
        <EmptyState icon="checklist" label="No requirements found" />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ACTIVITY SUB-TAB
// =============================================================================

function ActivityTab({
  colors,
  accentColor,
  events,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  events: EntityActivityEvent[];
}) {
  const renderItem = useCallback(
    ({ item, index }: { item: EntityActivityEvent; index: number }) => {
      const isLast = index === events.length - 1;
      const entityColor = SEEDED_ENTITY_TYPES[item.entityId]
        ? BIZ_ENTITY_TYPE_COLORS[SEEDED_ENTITY_TYPES[item.entityId]]
        : BP.ash;

      return (
        <View style={s.timelineItem}>
          {/* Timeline line + dot */}
          <View style={s.timelineLeft}>
            <View style={[s.timelineDot, { backgroundColor: entityColor }]} />
            {!isLast && <View style={[s.timelineLine, { backgroundColor: BP.graphite }]} />}
          </View>

          {/* Content */}
          <View style={s.timelineContent}>
            {/* Timestamp + Actor */}
            <View style={s.timelineMetaRow}>
              <ThemedText style={[s.timelineTimestamp, { color: BP.ash }]}>
                {relativeTime(item.timestamp)}
              </ThemedText>
              <ThemedText style={[s.timelineActor, { color: BP.platinum }]}>
                {item.actor}
              </ThemedText>
            </View>

            {/* Action */}
            <ThemedText style={[s.timelineAction, { color: BP.smoke }]} numberOfLines={3}>
              {item.action}
            </ThemedText>

            {/* Entity Badge */}
            <View style={[s.timelineEntityBadge, { backgroundColor: entityColor + '15' }]}>
              <ThemedText style={[s.timelineEntityName, { color: entityColor }]} numberOfLines={1}>
                {item.entityName}
              </ThemedText>
            </View>

            {/* Linked Tab */}
            {item.linkedTab && (
              <View style={s.timelineLinkedRow}>
                <IconSymbol name="arrow.right.circle" size={10} color={BP.ash} />
                <ThemedText style={[s.timelineLinkedText, { color: BP.ash }]}>
                  {item.linkedTab.charAt(0).toUpperCase() + item.linkedTab.slice(1).replace('-', ' ')}
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      );
    },
    [events.length],
  );

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="clock.fill" label="No activity events" />
      }
    />
  );
}

// =============================================================================
// ENTITY DETAIL BOTTOM SHEET
// =============================================================================

function EntityDetailSheet({
  visible,
  onClose,
  entity,
  requirements,
  events,
  reqOverrides,
  onToggleReq,
}: {
  visible: boolean;
  onClose: () => void;
  entity: BizEntity | null;
  requirements: EntityRequirement[];
  events: EntityActivityEvent[];
  reqOverrides: Record<string, boolean>;
  onToggleReq: (reqId: string) => void;
}) {
  if (!entity) return null;

  const entityReqs = requirements.filter((r) => r.entityId === entity.id);
  const entityEvents = events.filter((e) => e.entityId === entity.id).slice(0, 5);
  const parentEntity = entity.parentId ? getEntityById(entity.parentId) : null;
  const childEntities = entity.childIds
    .map((id) => getEntityById(id))
    .filter(Boolean) as BizEntity[];

  const completedReqs = entityReqs.filter((r) => {
    const override = reqOverrides[r.id];
    return override !== undefined ? override : r.completed;
  }).length;
  const totalReqs = entityReqs.length;
  const pct = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 100;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={entity.name} useModal>
      {/* Status + Type Row */}
      <View style={s.sheetBadgeRow}>
        <BizStatusChip label={statusLabel(entity.status)} variant={statusChipVariant(entity.status)} />
        <EntityTypeBadge type={entity.type} />
      </View>

      {/* Section 1: Health Summary */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Health Summary</ThemedText>
        <HealthSummary health={entity.health} />
      </View>

      {/* Section 2: Structure (Parent / Children) */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Structure</ThemedText>
        {parentEntity ? (
          <View style={s.sheetStructureRow}>
            <IconSymbol name="arrow.up" size={12} color={BP.ash} />
            <ThemedText style={[s.sheetStructureText, { color: BP.ash }]}>
              Parent: {parentEntity.name}
            </ThemedText>
          </View>
        ) : (
          <View style={s.sheetStructureRow}>
            <IconSymbol name="arrow.up" size={12} color={BP.ash} />
            <ThemedText style={[s.sheetStructureText, { color: BP.ash }]}>
              No parent (top-level entity)
            </ThemedText>
          </View>
        )}
        {childEntities.length > 0 ? (
          childEntities.map((child) => (
            <View key={child.id} style={s.sheetStructureRow}>
              <IconSymbol name="arrow.down" size={12} color={BP.ash} />
              <ThemedText style={[s.sheetStructureText, { color: BP.ash }]}>
                Child: {child.name}
              </ThemedText>
            </View>
          ))
        ) : (
          <View style={s.sheetStructureRow}>
            <IconSymbol name="arrow.down" size={12} color={BP.ash} />
            <ThemedText style={[s.sheetStructureText, { color: BP.ash }]}>
              No child entities
            </ThemedText>
          </View>
        )}
      </View>

      {/* Section 3: Key Requirements Checklist */}
      <View style={s.sheetSection}>
        <View style={s.sheetSectionTitleRow}>
          <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>
            Requirements
          </ThemedText>
          <ThemedText style={[s.sheetSectionCount, { color: pct === 100 ? BP.emerald : BP.amber }]}>
            {pct}% complete
          </ThemedText>
        </View>
        <ProgressBar
          percent={pct}
          color={pct === 100 ? BP.emerald : pct >= 70 ? BP.amber : BP.red}
        />
        <View style={s.sheetReqList}>
          {entityReqs.slice(0, 8).map((req) => {
            const isCompleted = reqOverrides[req.id] !== undefined
              ? reqOverrides[req.id]
              : req.completed;
            return (
              <Pressable
                key={req.id}
                style={s.sheetReqItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onToggleReq(req.id);
                }}
              >
                <IconSymbol
                  name={isCompleted ? 'checkmark.circle.fill' : 'circle'}
                  size={18}
                  color={isCompleted ? BP.emerald : BP.ash}
                />
                <ThemedText
                  style={[
                    s.sheetReqLabel,
                    { color: isCompleted ? BP.ash : BP.smoke },
                    isCompleted && s.reqItemStrikethrough,
                  ]}
                  numberOfLines={1}
                >
                  {req.label}
                </ThemedText>
              </Pressable>
            );
          })}
          {entityReqs.length === 0 && (
            <ThemedText style={[s.sheetEmptyText, { color: BP.ash }]}>
              No requirements defined
            </ThemedText>
          )}
        </View>
      </View>

      {/* Section 4: Cross-Tab Links */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Cross-Tab Links</ThemedText>
        {entity.crossTabLinks.map((link, i) => (
          <Pressable
            key={`link-${i}`}
            style={s.sheetLinkRow}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="arrow.right.circle.fill" size={16} color={BP.champagneGold} />
            <View style={s.sheetLinkTextCol}>
              <ThemedText style={[s.sheetLinkLabel, { color: BP.smoke }]}>
                {link.label}
              </ThemedText>
              <ThemedText style={[s.sheetLinkTarget, { color: BP.ash }]}>
                {link.targetTab.charAt(0).toUpperCase() + link.targetTab.slice(1).replace('-', ' ')}
                {link.targetSubTab ? ` > ${link.targetSubTab}` : ''}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={12} color={BP.ash} />
          </Pressable>
        ))}
        {entity.crossTabLinks.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: BP.ash }]}>
            No cross-tab links
          </ThemedText>
        )}
      </View>

      {/* Section 5: Recent Activity */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Recent Activity</ThemedText>
        {entityEvents.map((evt) => (
          <View key={evt.id} style={s.sheetActivityRow}>
            <View style={s.sheetActivityDot} />
            <View style={s.sheetActivityTextCol}>
              <ThemedText style={[s.sheetActivityAction, { color: BP.smoke }]} numberOfLines={2}>
                {evt.action}
              </ThemedText>
              <View style={s.sheetActivityMeta}>
                <ThemedText style={[s.sheetActivityActor, { color: BP.ash }]}>
                  {evt.actor}
                </ThemedText>
                <ThemedText style={[s.sheetActivityTime, { color: BP.ash }]}>
                  {relativeTime(evt.timestamp)}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
        {entityEvents.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: BP.ash }]}>
            No recent activity
          </ThemedText>
        )}
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: BP.champagneGold }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Entity</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: BP.graphite }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: BP.ash }]}>
            Close
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgEntitiesV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: B3+ locked ===
  if (!isFounder(role) && !isBoardLevel(role) && role !== 'B2a') {
    return <BizEmptyLock title="Entities" message="This section is restricted. Contact the Founder for access." />;
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedEntity, setSelectedEntity] = useState<BizEntity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [filterType, setFilterType] = useState<BizEntityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [reqOverrides, setReqOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const data = useMemo(() => getBizEntitiesData(), []);

  // === Callbacks ===
  const handleSelectEntity = useCallback((entity: BizEntity) => {
    setSelectedEntity(entity);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleFilterChange = useCallback((type: BizEntityType | 'all') => {
    Haptics.selectionAsync();
    setFilterType(type);
  }, []);

  const handleSearchChange = useCallback((q: string) => {
    setSearchQuery(q);
  }, []);

  const handleToggleReq = useCallback((reqId: string) => {
    setReqOverrides((prev) => {
      const req = data.requirements.find((r) => r.id === reqId);
      const currentVal = prev[reqId] !== undefined ? prev[reqId] : (req?.completed ?? false);
      return { ...prev, [reqId]: !currentVal };
    });
  }, [data.requirements]);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isFounder(role)) return SUB_TABS;
    if (isBoardLevel(role)) return SUB_TABS; // Board sees all tabs (read-only)
    // B2a: overview only
    return SUB_TABS.filter((t) => t.id === 'overview');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return (
          <OverviewTab
            colors={colors}
            accentColor={accentColor}
            entities={data.entities}
            onSelectEntity={handleSelectEntity}
          />
        );
      case 'entity-list':
        if (!isBoardLevel(role)) return null;
        return (
          <EntityListTab
            colors={colors}
            accentColor={accentColor}
            entities={data.entities}
            filterType={filterType}
            searchQuery={searchQuery}
            onFilterChange={handleFilterChange}
            onSearchChange={handleSearchChange}
            onSelectEntity={handleSelectEntity}
          />
        );
      case 'requirements':
        if (!isBoardLevel(role)) return null;
        return (
          <RequirementsTab
            colors={colors}
            accentColor={accentColor}
            entities={data.entities}
            requirements={data.requirements}
            reqOverrides={reqOverrides}
            onToggleReq={handleToggleReq}
          />
        );
      case 'activity':
        if (!isBoardLevel(role)) return null;
        return (
          <ActivityTab
            colors={colors}
            accentColor={accentColor}
            events={data.activityEvents}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <BizSubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Entity Detail Bottom Sheet */}
      <EntityDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        entity={selectedEntity}
        requirements={data.requirements}
        events={data.activityEvents}
        reqOverrides={reqOverrides}
        onToggleReq={handleToggleReq}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // -- KPI Row --
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Alert section --
  alertSection: {
    marginBottom: Spacing.md,
  },

  // -- Overview entity cards --
  overviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  overviewCardNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  overviewCardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  overviewHealthRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  overviewHealthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  overviewHealthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  overviewHealthLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  overviewNextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  overviewNextActionText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Health strip --
  healthStrip: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  healthStripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  healthStripLabel: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Health summary (sheet) --
  healthSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  healthSummaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  healthSummaryDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthSummaryLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  healthSummaryValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // -- Type badge --
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Filter chips (Entity List) --
  filterChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Search --
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  // -- Entity List cards --
  entityListCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  entityListTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  entityListTypeDot: {
    width: 4,
    height: 32,
    borderRadius: 2,
  },
  entityListNameCol: {
    flex: 1,
  },
  entityListName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  entityListHealthRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  entityListFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  entityListNextAction: {
    fontSize: 12,
    flex: 1,
  },

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: BP.graphite,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Requirements --
  reqEntitySection: {
    marginBottom: Spacing.lg,
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.md,
  },
  reqEntityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  reqEntityNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  reqEntityName: {
    fontSize: 15,
    fontWeight: '700',
  },
  reqEntityPctText: {
    fontSize: 11,
    marginTop: 2,
  },
  reqEntityPct: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reqCatGroup: {
    marginTop: Spacing.sm,
  },
  reqCatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  reqCatTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  reqCatCount: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingLeft: 4,
  },
  reqItemTextCol: {
    flex: 1,
  },
  reqItemLabel: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  reqItemStrikethrough: {
    textDecorationLine: 'line-through',
  },
  reqItemDetail: {
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },

  // -- Activity timeline --
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  timelineLeft: {
    alignItems: 'center',
    width: 24,
    paddingTop: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.lg,
    paddingLeft: Spacing.sm,
  },
  timelineMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineTimestamp: {
    fontSize: 11,
    fontWeight: '500',
  },
  timelineActor: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineAction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
  },
  timelineEntityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  timelineEntityName: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  timelineLinkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  timelineLinkedText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sheetSectionCount: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetStructureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetStructureText: {
    fontSize: 13,
    flex: 1,
  },
  sheetReqList: {
    marginTop: Spacing.xs,
  },
  sheetReqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 5,
  },
  sheetReqLabel: {
    fontSize: 13,
    flex: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetLinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: BP.graphite,
  },
  sheetLinkTextCol: {
    flex: 1,
  },
  sheetLinkLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetLinkTarget: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetActivityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetActivityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: BP.champagneGold,
    marginTop: 6,
  },
  sheetActivityTextCol: {
    flex: 1,
  },
  sheetActivityAction: {
    fontSize: 13,
    lineHeight: 18,
  },
  sheetActivityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sheetActivityActor: {
    fontSize: 11,
    fontWeight: '500',
  },
  sheetActivityTime: {
    fontSize: 11,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
