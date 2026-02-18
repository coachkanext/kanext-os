/**
 * Business Organization Entities V2 — Health-centric entity management.
 * New layout: Fixed header + Filter chips + View toggle (Cards/List) +
 * Enhanced entity cards + Triage-first sorting + Entity detail bottom sheet.
 * RBAC: B1 full, B2b read-only exact, B2a curated, B3/B4 public profiles only.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import {
  BizCard,
  BizStatusChip,
  BizAlertCard,
  BizEmptyLock,
  statusVariant,
  statusColor,
} from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import type {
  TrafficLight,
  BizEntityType,
  EntityHealth,
  EntityStatus,
  SnapshotMetrics,
  CrossTabLink,
} from '@/data/biz-org-shared-types';
import {
  TRAFFIC_LIGHT_COLORS,
  BIZ_ENTITY_TYPE_LABELS,
  BIZ_ENTITY_TYPE_COLORS,
  ENTITY_STATUS_LABELS,
  ENTITY_STATUS_COLORS,
  worstHealth,
  triageSortHealth,
  formatCurrency,
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

type FilterChipId = 'all' | EntityStatus | 'partner' | 'acquisition_target' | 'asset';

const FILTER_CHIPS: { id: FilterChipId; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'under_evaluation', label: 'Evaluation' },
  { id: 'partner', label: 'Partner' },
  { id: 'acquisition_target', label: 'Acquisition' },
  { id: 'asset', label: 'Asset' },
  { id: 'dormant', label: 'Dormant' },
  { id: 'flagged', label: 'Flagged' },
];

const HEALTH_DIMENSIONS: { key: keyof EntityHealth; label: string; icon: string }[] = [
  { key: 'governance', label: 'Gov', icon: 'building.columns.fill' },
  { key: 'finance', label: 'Fin', icon: 'dollarsign.circle.fill' },
  { key: 'rails', label: 'Rails', icon: 'arrow.left.arrow.right' },
  { key: 'compliance', label: 'Comp', icon: 'checkmark.shield.fill' },
];

const CATEGORY_LABELS: Record<EntityRequirement['category'], string> = {
  formation: 'Governance',
  compliance: 'Compliance',
  finance: 'Finance',
  ops: 'Operations',
};

const CATEGORY_ICONS: Record<EntityRequirement['category'], string> = {
  formation: 'building.columns.fill',
  compliance: 'checkmark.shield.fill',
  finance: 'dollarsign.circle.fill',
  ops: 'gear',
};

const DEEP_LINKS = [
  { label: 'Open Finance', icon: 'dollarsign.circle.fill', tab: 'finance' },
  { label: 'Open Rails', icon: 'arrow.left.arrow.right', tab: 'payment-rails' },
  { label: 'Open People', icon: 'person.2.fill', tab: 'people' },
  { label: 'Open Legal', icon: 'doc.text.fill', tab: 'legal' },
  { label: 'Open Compliance', icon: 'checkmark.shield.fill', tab: 'compliance' },
  { label: 'Open Ops', icon: 'gear', tab: 'operations' },
];

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

function formatTimestamp(ts: string): string {
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

/** Top reason string for a non-green health dimension */
function healthReason(entity: BizEntity, dim: keyof EntityHealth): string | null {
  const val = entity.health[dim];
  if (val === 'green') return null;
  // Derive a brief reason from the entity's nextRequiredAction
  const action = entity.nextRequiredAction || entity.nextAction;
  const dimLabel = dim.charAt(0).toUpperCase() + dim.slice(1);
  if (action.toLowerCase().includes(dim)) return action;
  return `${dimLabel} status: ${val}`;
}

/** Entity status to chip variant */
function entityStatusVariant(status: EntityStatus): 'success' | 'warning' | 'error' | 'neutral' | 'info' {
  switch (status) {
    case 'active': return 'success';
    case 'under_evaluation': return 'warning';
    case 'negotiating': return 'info';
    case 'flagged': return 'error';
    case 'dormant': return 'neutral';
    case 'closed': return 'neutral';
    default: return 'neutral';
  }
}

/**
 * Triage-first sorting:
 * Flagged -> Rails Offline (rails=red) -> Governance Red -> Under Evaluation -> Active -> Rest
 */
function triageSortEntities(a: BizEntity, b: BizEntity): number {
  const score = (e: BizEntity): number => {
    let s = 0;
    // Highest priority: flagged
    if (e.entityStatus === 'flagged') s += 1000;
    // Rails offline (red)
    if (e.health.rails === 'red') s += 500;
    // Governance red
    if (e.health.governance === 'red') s += 250;
    // Any other red
    if (worstHealth(e.health) === 'red') s += 100;
    // Under evaluation
    if (e.entityStatus === 'under_evaluation') s += 50;
    // Active gets a small bump over the rest
    if (e.entityStatus === 'active') s += 10;
    // Any yellow
    if (worstHealth(e.health) === 'yellow') s += 5;
    return s;
  };
  return score(b) - score(a);
}

/** Filter entities by chip ID */
function filterByChip(entities: BizEntity[], chip: FilterChipId): BizEntity[] {
  if (chip === 'all') return entities;
  if (chip === 'partner') return entities.filter((e) => e.type === 'partner' || e.type === 'relationship');
  if (chip === 'acquisition_target') return entities.filter((e) => e.type === 'deal_acquisition');
  if (chip === 'asset') return entities.filter((e) => e.type === 'asset');
  // EntityStatus filters
  if (chip === 'flagged') {
    return entities.filter((e) => e.entityStatus === 'flagged' || worstHealth(e.health) === 'red');
  }
  return entities.filter((e) => e.entityStatus === chip);
}

/** RBAC: can view snapshot metrics? B1 and B2b yes, B2a no, B3/B4 no */
function canSeeMetrics(role: BusinessRoleLens): boolean {
  return isBoardLevel(role);
}

/** RBAC: can see health strip? B1, B2b, B2a yes, B3/B4 no */
function canSeeHealth(role: BusinessRoleLens): boolean {
  return role === 'B1' || role === 'B2b' || role === 'B2a';
}

/** RBAC: can create/edit entities? B1 only */
function canCreateEntity(role: BusinessRoleLens): boolean {
  return isFounder(role);
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
// HEALTH SUMMARY — 4 traffic lights with icons + top reason per non-green
// =============================================================================

function HealthSummary({ health, entity }: { health: EntityHealth; entity: BizEntity }) {
  return (
    <View style={s.healthSummaryContainer}>
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
      {/* Top reason per non-green dimension */}
      {HEALTH_DIMENSIONS.map((dim) => {
        const reason = healthReason(entity, dim.key);
        if (!reason) return null;
        const color = TRAFFIC_LIGHT_COLORS[health[dim.key]];
        return (
          <View key={`reason-${dim.key}`} style={s.healthReasonRow}>
            <TrafficLightDot value={health[dim.key]} size={6} />
            <ThemedText style={[s.healthReasonText, { color }]} numberOfLines={2}>
              {reason}
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
// ENTITY STATUS BADGE (uses EntityStatus enum)
// =============================================================================

function EntityStatusBadge({ status }: { status: EntityStatus }) {
  const color = ENTITY_STATUS_COLORS[status];
  const label = ENTITY_STATUS_LABELS[status];
  return (
    <View style={[s.entityStatusBadge, { backgroundColor: color + '15' }]}>
      <ThemedText style={[s.entityStatusBadgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// SNAPSHOT METRICS STRIP
// =============================================================================

function SnapshotStrip({ snapshot }: { snapshot: SnapshotMetrics }) {
  const items: { label: string; value: string; color: string }[] = [
    { label: 'In 30d', value: formatCurrency(snapshot.moneyIn30d), color: BP.emerald },
    { label: 'Out 30d', value: formatCurrency(snapshot.moneyOut30d), color: BP.red },
    { label: 'Exceptions', value: String(snapshot.exceptions), color: snapshot.exceptions > 0 ? BP.amber : BP.ash },
    {
      label: 'Docs',
      value: `${snapshot.docsComplete}/${snapshot.docsComplete + snapshot.docsMissing}`,
      color: snapshot.docsMissing > 0 ? BP.amber : BP.emerald,
    },
    {
      label: 'People',
      value: `${snapshot.peopleFilled}/${snapshot.peopleFilled + snapshot.peopleGaps}`,
      color: snapshot.peopleGaps > 0 ? BP.amber : BP.emerald,
    },
    { label: 'Deals', value: String(snapshot.activeDeals), color: snapshot.activeDeals > 0 ? BP.champagneGold : BP.ash },
  ];

  return (
    <View style={s.snapshotStrip}>
      {items.map((item) => (
        <View key={item.label} style={s.snapshotItem}>
          <ThemedText style={[s.snapshotValue, { color: item.color }]}>{item.value}</ThemedText>
          <ThemedText style={[s.snapshotLabel, { color: BP.ash }]}>{item.label}</ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// ENTITY CARD (Enhanced — Cards View)
// =============================================================================

function EntityCardView({
  entity,
  role,
  onPress,
}: {
  entity: BizEntity;
  role: BusinessRoleLens;
  onPress: () => void;
}) {
  const showMetrics = canSeeMetrics(role);
  const showHealth = canSeeHealth(role);
  const isPublic = role === 'B3' || role === 'B4';

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <BizCard>
        {/* A) Identity block */}
        <View style={s.cardIdentityRow}>
          <View style={s.cardIdentityLeft}>
            <ThemedText style={[s.cardName, { color: BP.smoke }]} numberOfLines={1}>
              {entity.name}
            </ThemedText>
            <View style={s.cardBadgeRow}>
              <EntityTypeBadge type={entity.type} />
              <EntityStatusBadge status={entity.entityStatus} />
            </View>
          </View>
          <IconSymbol name="chevron.right" size={14} color={BP.ash} />
        </View>

        {/* Owner + Last Updated (visible to B1, B2b, B2a) */}
        {!isPublic && (
          <View style={s.cardMetaRow}>
            <View style={s.cardMetaItem}>
              <IconSymbol name="person.fill" size={10} color={BP.ash} />
              <ThemedText style={[s.cardMetaText, { color: BP.ash }]} numberOfLines={1}>
                {entity.owner}
              </ThemedText>
            </View>
            <View style={s.cardMetaItem}>
              <IconSymbol name="clock" size={10} color={BP.ash} />
              <ThemedText style={[s.cardMetaText, { color: BP.ash }]}>
                {relativeTime(entity.lastUpdated)}
              </ThemedText>
            </View>
          </View>
        )}

        {/* B) Health strip — hidden for B3/B4 */}
        {showHealth && (
          <View style={s.cardHealthSection}>
            <HealthStrip health={entity.health} />
          </View>
        )}

        {/* C) Snapshot metrics — hidden for B2a, B3, B4 */}
        {showMetrics && (
          <View style={s.cardSnapshotSection}>
            <SnapshotStrip snapshot={entity.snapshot} />
          </View>
        )}

        {/* D) Next Required Action */}
        {!isPublic && (
          <View style={s.cardNextAction}>
            <IconSymbol name="arrow.right.circle" size={12} color={BP.ash} />
            <ThemedText style={[s.cardNextActionText, { color: BP.ash }]} numberOfLines={1}>
              {entity.nextRequiredAction || entity.nextAction}
            </ThemedText>
          </View>
        )}
      </BizCard>
    </Pressable>
  );
}

// =============================================================================
// ENTITY LIST ROW (Dense / List View)
// =============================================================================

function EntityListRow({
  entity,
  role,
  onPress,
}: {
  entity: BizEntity;
  role: BusinessRoleLens;
  onPress: () => void;
}) {
  const showHealth = canSeeHealth(role);
  const isPublic = role === 'B3' || role === 'B4';
  const statusColor = ENTITY_STATUS_COLORS[entity.entityStatus];

  return (
    <Pressable
      style={[s.listRow, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Status dot */}
      <View style={[s.listStatusDot, { backgroundColor: statusColor }]} />

      {/* Name */}
      <ThemedText style={[s.listName, { color: BP.smoke }]} numberOfLines={1}>
        {entity.name}
      </ThemedText>

      {/* Type badge */}
      <EntityTypeBadge type={entity.type} />

      {/* Compact health strip */}
      {showHealth && (
        <View style={s.listHealthWrap}>
          <HealthStrip health={entity.health} compact />
        </View>
      )}

      {/* Next action (truncated) */}
      {!isPublic && (
        <ThemedText style={[s.listNextAction, { color: BP.ash }]} numberOfLines={1}>
          {entity.nextRequiredAction || entity.nextAction}
        </ThemedText>
      )}

      <IconSymbol name="chevron.right" size={12} color={BP.ash} />
    </Pressable>
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
  role,
}: {
  visible: boolean;
  onClose: () => void;
  entity: BizEntity | null;
  requirements: EntityRequirement[];
  events: EntityActivityEvent[];
  reqOverrides: Record<string, boolean>;
  onToggleReq: (reqId: string) => void;
  role: BusinessRoleLens;
}) {
  // Expandable categories
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});

  const toggleCat = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedCats((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

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

  // Group requirements by category
  const categories: EntityRequirement['category'][] = ['formation', 'compliance', 'finance', 'ops'];
  const catGroups = categories
    .map((cat) => ({
      category: cat,
      reqs: entityReqs.filter((r) => r.category === cat),
    }))
    .filter((g) => g.reqs.length > 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={entity.name} useModal>
      {/* Status + Type Row */}
      <View style={s.sheetBadgeRow}>
        <EntityStatusBadge status={entity.entityStatus} />
        <EntityTypeBadge type={entity.type} />
      </View>

      {/* Section 1: Health Summary (4 traffic lights with icons + top reason per non-green) */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Health Summary</ThemedText>
        <HealthSummary health={entity.health} entity={entity} />
      </View>

      {/* Section 2: Structure (type, parent/children, owner) */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Structure</ThemedText>

        {/* Type */}
        <View style={s.sheetStructureRow}>
          <IconSymbol name="tag.fill" size={12} color={BP.ash} />
          <ThemedText style={[s.sheetStructureText, { color: BP.ash }]}>
            Type: {BIZ_ENTITY_TYPE_LABELS[entity.type]}
          </ThemedText>
        </View>

        {/* Owner */}
        <View style={s.sheetStructureRow}>
          <IconSymbol name="person.fill" size={12} color={BP.ash} />
          <ThemedText style={[s.sheetStructureText, { color: BP.ash }]}>
            Owner: {entity.owner}
          </ThemedText>
        </View>

        {/* Parent */}
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

        {/* Children */}
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

      {/* Section 3: Key Requirements Checklist (grouped, toggleable) */}
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
        {catGroups.map(({ category, reqs }) => {
          const catKey = `${entity.id}-${category}`;
          const isExpanded = expandedCats[catKey] !== false; // default expanded
          const catCompleted = reqs.filter((r) => {
            const override = reqOverrides[r.id];
            return override !== undefined ? override : r.completed;
          }).length;

          return (
            <View key={catKey} style={s.reqCatGroup}>
              <Pressable style={s.reqCatHeader} onPress={() => toggleCat(catKey)}>
                <IconSymbol name={CATEGORY_ICONS[category] as any} size={14} color={BP.ash} />
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

              {isExpanded && reqs.map((req) => {
                const isCompleted = reqOverrides[req.id] !== undefined
                  ? reqOverrides[req.id]
                  : req.completed;
                return (
                  <Pressable
                    key={req.id}
                    style={s.sheetReqItem}
                    onPress={() => {
                      if (isFounder(role)) {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        onToggleReq(req.id);
                      }
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
                      numberOfLines={2}
                    >
                      {req.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          );
        })}
        {entityReqs.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: BP.ash }]}>
            No requirements defined
          </ThemedText>
        )}
      </View>

      {/* Section 4: Deep links row */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: BP.smoke }]}>Deep Links</ThemedText>
        <View style={s.deepLinkRow}>
          {DEEP_LINKS.map((link) => (
            <Pressable
              key={link.tab}
              style={[s.deepLinkChip, { backgroundColor: BP.glass, borderColor: BP.graphite }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={link.icon as any} size={14} color={BP.champagneGold} />
              <ThemedText style={[s.deepLinkText, { color: BP.smoke }]} numberOfLines={1}>
                {link.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Section 5: Recent Activity (last 5 events) */}
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
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgEntitiesV2({ colors, accentColor, role = 'B1' }: Props) {
  // === State ===
  const [selectedEntity, setSelectedEntity] = useState<BizEntity | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterChipId>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [reqOverrides, setReqOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const data = useMemo(() => getBizEntitiesData(), []);

  // === RBAC: determine visible entities ===
  const rbacEntities = useMemo(() => {
    const isPublic = role === 'B3' || role === 'B4';
    const isRetail = role === 'B2a';

    if (isPublic) {
      // B3/B4: public entity profiles only (active entities, name/type/status)
      return data.entities.filter((e) => e.entityStatus === 'active');
    }
    if (isRetail) {
      // B2a: curated list — active entities only, no snapshot metrics
      return data.entities.filter((e) => e.entityStatus === 'active');
    }
    // B1/B2b: all entities
    return data.entities;
  }, [data.entities, role]);

  // === Filtered + triage-sorted entities ===
  const displayEntities = useMemo(() => {
    const filtered = filterByChip(rbacEntities, activeFilter);
    return [...filtered].sort(triageSortEntities);
  }, [rbacEntities, activeFilter]);

  // === Callbacks ===
  const handleSelectEntity = useCallback((entity: BizEntity) => {
    setSelectedEntity(entity);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  const handleToggleReq = useCallback((reqId: string) => {
    setReqOverrides((prev) => {
      const req = data.requirements.find((r) => r.id === reqId);
      const currentVal = prev[reqId] !== undefined ? prev[reqId] : (req?.completed ?? false);
      return { ...prev, [reqId]: !currentVal };
    });
  }, [data.requirements]);

  // === Render item for FlatList ===
  const renderCardItem = useCallback(
    ({ item }: { item: BizEntity }) => (
      <EntityCardView
        entity={item}
        role={role}
        onPress={() => handleSelectEntity(item)}
      />
    ),
    [role, handleSelectEntity],
  );

  const renderListItem = useCallback(
    ({ item }: { item: BizEntity }) => (
      <EntityListRow
        entity={item}
        role={role}
        onPress={() => handleSelectEntity(item)}
      />
    ),
    [role, handleSelectEntity],
  );

  return (
    <View style={s.container}>
      {/* 1) Fixed header block */}
      <View style={s.headerBlock}>
        <View style={s.headerTitleRow}>
          <ThemedText style={[s.headerTitle, { color: BP.smoke }]}>Entities</ThemedText>
          {canCreateEntity(role) && (
            <View style={s.headerActions}>
              <Pressable
                style={[s.headerActionBtn, { backgroundColor: BP.champagneGold }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="plus" size={14} color="#000" />
                <ThemedText style={s.headerActionBtnText}>Create Entity</ThemedText>
              </Pressable>
              <Pressable
                style={[s.headerActionBtnGhost, { borderColor: BP.graphite }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="square.and.arrow.up" size={14} color={BP.ash} />
                <ThemedText style={[s.headerActionBtnGhostText, { color: BP.ash }]}>Export</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </View>

      {/* 2) Filter chips (horizontal scroll) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.filterChipRow}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === activeFilter;
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
                setActiveFilter(chip.id);
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

      {/* 3) View toggle: Cards / List */}
      <View style={s.viewToggleRow}>
        <ThemedText style={[s.viewToggleLabel, { color: BP.ash }]}>
          {displayEntities.length} {displayEntities.length === 1 ? 'entity' : 'entities'}
        </ThemedText>
        <View style={s.viewToggleIcons}>
          <Pressable
            style={[
              s.viewToggleBtn,
              viewMode === 'cards' && { backgroundColor: BP.champagneGold + '20' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode('cards');
            }}
          >
            <IconSymbol
              name="square.grid.2x2"
              size={16}
              color={viewMode === 'cards' ? BP.champagneGold : BP.ash}
            />
          </Pressable>
          <Pressable
            style={[
              s.viewToggleBtn,
              viewMode === 'list' && { backgroundColor: BP.champagneGold + '20' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setViewMode('list');
            }}
          >
            <IconSymbol
              name="list.bullet"
              size={16}
              color={viewMode === 'list' ? BP.champagneGold : BP.ash}
            />
          </Pressable>
        </View>
      </View>

      {/* 4) Entity list (Cards or List view) */}
      <FlatList
        data={displayEntities}
        keyExtractor={(item) => item.id}
        renderItem={viewMode === 'cards' ? renderCardItem : renderListItem}
        contentContainerStyle={s.entityListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="building.2.fill" label="No entities match filter" />
        }
      />

      {/* Entity Detail Bottom Sheet */}
      <EntityDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        entity={selectedEntity}
        requirements={data.requirements}
        events={data.activityEvents}
        reqOverrides={reqOverrides}
        onToggleReq={handleToggleReq}
        role={role}
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

  // -- Header block --
  headerBlock: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  headerActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  headerActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },
  headerActionBtnGhost: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  headerActionBtnGhostText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Filter chips --
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

  // -- View toggle --
  viewToggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  viewToggleLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  viewToggleIcons: {
    flexDirection: 'row',
    gap: 4,
  },
  viewToggleBtn: {
    padding: 6,
    borderRadius: BorderRadius.sm,
  },

  // -- Entity list content --
  entityListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Card view styles --
  cardIdentityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  cardIdentityLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },
  cardMetaRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardHealthSection: {
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  cardSnapshotSection: {
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  cardNextAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: BP.graphite,
  },
  cardNextActionText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Snapshot strip --
  snapshotStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  snapshotItem: {
    alignItems: 'center',
    minWidth: 48,
  },
  snapshotValue: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  snapshotLabel: {
    fontSize: 9,
    fontWeight: '500',
    marginTop: 1,
  },

  // -- Entity status badge --
  entityStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  entityStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- List view styles --
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  listStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listName: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    maxWidth: 120,
  },
  listHealthWrap: {
    flexShrink: 0,
  },
  listNextAction: {
    fontSize: 11,
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
  healthSummaryContainer: {
    marginTop: Spacing.xs,
  },
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
  healthReasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 3,
    paddingHorizontal: Spacing.sm,
  },
  healthReasonText: {
    fontSize: 11,
    flex: 1,
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

  // -- Requirement category groups (sheet) --
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
  reqItemStrikethrough: {
    textDecorationLine: 'line-through',
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
  sheetReqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 5,
    paddingLeft: 4,
  },
  sheetReqLabel: {
    fontSize: 13,
    flex: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },

  // -- Deep links --
  deepLinkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  deepLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  deepLinkText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // -- Activity (sheet) --
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
});
