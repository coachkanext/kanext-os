/**
 * Organization Entities Tab v2 — Unified Entity Directory
 *
 * 12-tab pill nav covering Companies, Departments, Projects, Tasks,
 * Opportunities, Clients/Partners, Resources, Decisions, Policies,
 * Evidence, and an Audit log. Filter + Create bottom sheets.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  ENTITIES_TABS,
  ENTITY_SCOPE_CHIPS,
  CREATE_ENTITY_TEMPLATES,
  UNIFIED_ENTITIES,
  ENTITY_AUDIT_LOG,
  getEntitiesByTab,
  filterEntities,
  sortEntities,
  STATUS_COLOR_MAP,
  TYPE_ICON_MAP,
  TYPE_COLOR_MAP,
  type UnifiedEntity,
  type EntitiesTabId,
  type EntityStatus,
  type EntityAuditEntry,
  type CreateEntityTemplate,
  type EntityFilterState,
} from '@/data/mock-entities-v2';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SORT_OPTIONS: { key: EntityFilterState['sort']; label: string }[] = [
  { key: 'recent', label: 'Recent activity' },
  { key: 'newest', label: 'Newest' },
  { key: 'az', label: 'A\u2013Z' },
  { key: 'owner', label: 'Owner' },
];

const STATUS_OPTIONS: EntityStatus[] = [
  'proposed',
  'active',
  'blocked',
  'complete',
  'archived',
];

const COMPANY_OPTIONS = ['KaNeXT', 'KaNeXT Events LLC'];

const DEPARTMENT_OPTIONS = ['Product', 'Engineering', 'Sales', 'Marketing'];

/** Audit action icon mapping */
const AUDIT_ACTION_ICON: Record<string, string> = {
  created: 'plus.circle.fill',
  status: 'arrow.triangle.2.circlepath',
  linked: 'link',
  moved: 'arrow.right',
  assigned: 'person.fill',
  attached: 'doc.badge.plus',
  updated: 'pencil',
  approved: 'checkmark.circle.fill',
  revised: 'doc.badge.arrow.up',
  default: 'circle.fill',
};

/** Derive audit action key from action string */
function getAuditActionKey(action: string): string {
  const lower = action.toLowerCase();
  if (lower.startsWith('created')) return 'created';
  if (lower.includes('status changed')) return 'status';
  if (lower.includes('linked')) return 'linked';
  if (lower.includes('moved') || lower.includes('stage moved')) return 'moved';
  if (lower.includes('owner assigned') || lower.includes('assigned')) return 'assigned';
  if (lower.includes('attached') || lower.includes('evidence attached')) return 'attached';
  if (lower.includes('updated') || lower.includes('milestone') || lower.includes('headcount') || lower.includes('value')) return 'updated';
  if (lower.includes('approved') || lower.includes('decision approved')) return 'approved';
  if (lower.includes('revised') || lower.includes('resource revised')) return 'revised';
  return 'default';
}

const AUDIT_ACTION_COLOR: Record<string, string> = {
  created: '#22C55E',
  status: '#6AA9FF',
  linked: '#14B8A6',
  moved: '#F59E0B',
  assigned: '#7A5CFF',
  attached: '#A78BFA',
  updated: '#F59E0B',
  approved: '#22C55E',
  revised: '#F472B6',
  default: '#8F8F8F',
};

// =============================================================================
// ENTITY ROW
// =============================================================================

function EntityRow({
  entity,
  colors,
  onPress,
}: {
  entity: UnifiedEntity;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const typeColor = TYPE_COLOR_MAP[entity.type];
  const typeIcon = TYPE_ICON_MAP[entity.type];
  const statusColor = STATUS_COLOR_MAP[entity.status];

  return (
    <Pressable
      style={[
        s.entityCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Top row: icon + name + status */}
      <View style={s.entityTopRow}>
        {/* Type icon circle */}
        <View style={[s.typeIconCircle, { backgroundColor: typeColor + '26' }]}>
          <IconSymbol name={typeIcon as any} size={16} color={typeColor} />
        </View>

        {/* Name + meta */}
        <View style={s.entityMidColumn}>
          <ThemedText style={[s.entityName, { color: colors.text }]} numberOfLines={1}>
            {entity.name}
          </ThemedText>

          {/* Type badge + scope line */}
          <View style={s.entityMetaRow}>
            <View style={[s.typeBadge, { backgroundColor: typeColor + '2E' }]}>
              <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                {entity.type.toUpperCase().replace('-', '/')}
              </ThemedText>
            </View>
            <ThemedText style={[s.scopeText, { color: colors.textSecondary }]} numberOfLines={1}>
              {entity.scope}
            </ThemedText>
          </View>

          {/* Owner + last activity */}
          <ThemedText style={[s.ownerLine, { color: colors.textTertiary }]} numberOfLines={1}>
            {entity.owner} · {entity.lastActivityAt}
          </ThemedText>

          {/* Context field */}
          {entity.contextField ? (
            <ThemedText
              style={[s.contextField, { color: colors.textSecondary }]}
              numberOfLines={1}
            >
              {entity.contextField}
            </ThemedText>
          ) : null}
        </View>

        {/* Status badge */}
        <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
          <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
            {entity.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Quick actions row */}
      <View style={s.quickActionsRow}>
        {entity.hasRoom ? (
          <Pressable
            style={s.quickAction}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="bubble.left.fill" size={14} color={colors.textTertiary} />
          </Pressable>
        ) : null}
        <Pressable
          style={s.quickAction}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="square.and.arrow.up" size={14} color={colors.textTertiary} />
        </Pressable>
        <Pressable
          style={s.quickAction}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="bookmark.fill" size={14} color={colors.textTertiary} />
        </Pressable>
        <Pressable
          style={s.quickAction}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="archivebox" size={14} color={colors.textTertiary} />
        </Pressable>
      </View>
    </Pressable>
  );
}

// =============================================================================
// AUDIT TIMELINE
// =============================================================================

function AuditTimeline({
  entries,
  colors,
}: {
  entries: EntityAuditEntry[];
  colors: typeof Colors.light;
}) {
  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.timestampMs - a.timestampMs),
    [entries],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const actionKey = getAuditActionKey(item.action);
        const actionColor = AUDIT_ACTION_COLOR[actionKey];
        const actionIcon = AUDIT_ACTION_ICON[actionKey] ?? AUDIT_ACTION_ICON.default;
        return (
          <View style={[s.auditRow, { borderColor: colors.border }]}>
            {/* Colored icon circle */}
            <View style={[s.auditIconCircle, { backgroundColor: actionColor + '26' }]}>
              <IconSymbol name={actionIcon as any} size={14} color={actionColor} />
            </View>

            {/* Text */}
            <View style={s.auditTextColumn}>
              <ThemedText style={[s.auditAction, { color: colors.text }]} numberOfLines={2}>
                {item.action}
              </ThemedText>
              <ThemedText style={[s.auditEntity, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.entityName}
              </ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.actor} · {item.timestamp}
              </ThemedText>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={s.emptyContainer}>
          <IconSymbol name="list.clipboard" size={32} color={colors.textTertiary} />
          <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
            No audit entries
          </ThemedText>
        </View>
      }
    />
  );
}

// =============================================================================
// ENTITY DETAIL VIEW
// =============================================================================

function EntityDetailView({
  entity,
  colors,
  accentColor,
  onBack,
}: {
  entity: UnifiedEntity;
  colors: typeof Colors.light;
  accentColor: string;
  onBack: () => void;
}) {
  const typeColor = TYPE_COLOR_MAP[entity.type];
  const statusColor = STATUS_COLOR_MAP[entity.status];
  const auditEntries = useMemo(
    () => ENTITY_AUDIT_LOG.filter((a) => a.entityId === entity.id).slice(0, 5),
    [entity.id],
  );

  // Mock linked objects for the detail view
  const linkedObjects = useMemo(() => {
    // Return a few mock linked objects based on entity type
    const linked: { id: string; name: string; type: string; status: EntityStatus }[] = [];
    if (entity.type === 'project' || entity.type === 'company' || entity.type === 'department') {
      linked.push(
        { id: 'lo-1', name: 'Quarterly Review', type: 'task', status: 'active' },
        { id: 'lo-2', name: 'Brand Guidelines v2', type: 'resource', status: 'active' },
      );
    }
    if (entity.type === 'opportunity') {
      linked.push(
        { id: 'lo-3', name: entity.owner, type: 'client-partner', status: 'active' },
      );
    }
    if (entity.type === 'decision') {
      linked.push(
        { id: 'lo-4', name: 'Board Meeting Notes', type: 'evidence', status: 'active' },
      );
    }
    return linked;
  }, [entity]);

  return (
    <View style={s.flex1}>
      {/* Header */}
      <View style={s.detailHeader}>
        <Pressable
          style={s.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
        >
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
        </Pressable>
        <View style={[s.detailAccent, { backgroundColor: typeColor }]} />
        <ThemedText style={[s.detailTitle, { color: colors.text }]} numberOfLines={1}>
          {entity.name}
        </ThemedText>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
          <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
            {entity.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.detailScroll}
      >
        {/* Identity Card */}
        <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.identityHeader}>
            <View style={[s.typeIconCircleLg, { backgroundColor: typeColor + '26' }]}>
              <IconSymbol
                name={TYPE_ICON_MAP[entity.type] as any}
                size={22}
                color={typeColor}
              />
            </View>
            <View style={s.identityInfo}>
              <ThemedText style={[s.identityName, { color: colors.text }]}>
                {entity.name}
              </ThemedText>
              <View style={s.identityBadgeRow}>
                <View style={[s.typeBadge, { backgroundColor: typeColor + '2E' }]}>
                  <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                    {entity.type.toUpperCase().replace('-', '/')}
                  </ThemedText>
                </View>
                <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
                  <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
                    {entity.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          {/* Owner row */}
          <View style={s.identityOwnerRow}>
            <View style={[s.ownerAvatar, { backgroundColor: entity.avatarColor + '30' }]}>
              <ThemedText style={[s.ownerInitials, { color: entity.avatarColor }]}>
                {entity.ownerInitials}
              </ThemedText>
            </View>
            <ThemedText style={[s.ownerName, { color: colors.textSecondary }]}>
              {entity.owner}
            </ThemedText>
          </View>

          {/* Scope */}
          <ThemedText style={[s.identityScope, { color: colors.textTertiary }]}>
            {entity.scope}
          </ThemedText>

          {/* Value for opportunities */}
          {entity.value != null ? (
            <ThemedText style={s.identityValue}>
              ${entity.value.toLocaleString()}
            </ThemedText>
          ) : null}
        </View>

        {/* Section: Summary */}
        <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Summary</ThemedText>
          <View style={s.summaryRow}>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>Scope</ThemedText>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{entity.scope}</ThemedText>
          </View>
          <View style={[s.summaryDivider, { borderColor: colors.border }]} />
          <View style={s.summaryRow}>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>Owner</ThemedText>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{entity.owner}</ThemedText>
          </View>
          <View style={[s.summaryDivider, { borderColor: colors.border }]} />
          <View style={s.summaryRow}>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>Status</ThemedText>
            <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
              <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
                {entity.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <View style={[s.summaryDivider, { borderColor: colors.border }]} />
          <View style={s.summaryRow}>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>Created</ThemedText>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{entity.createdAt}</ThemedText>
          </View>
          <View style={[s.summaryDivider, { borderColor: colors.border }]} />
          <View style={s.summaryRow}>
            <ThemedText style={[s.summaryLabel, { color: colors.textTertiary }]}>Last Activity</ThemedText>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{entity.lastActivityAt}</ThemedText>
          </View>
        </View>

        {/* Section: Linked Objects */}
        {linkedObjects.length > 0 ? (
          <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Linked Objects</ThemedText>
            {linkedObjects.map((lo) => {
              const loColor = TYPE_COLOR_MAP[lo.type as keyof typeof TYPE_COLOR_MAP] ?? '#8F8F8F';
              const loStatus = STATUS_COLOR_MAP[lo.status];
              return (
                <View key={lo.id} style={s.linkedRow}>
                  <View style={[s.linkedDot, { backgroundColor: loColor }]} />
                  <ThemedText style={[s.linkedName, { color: colors.text }]} numberOfLines={1}>
                    {lo.name}
                  </ThemedText>
                  <View style={[s.statusBadgeSm, { backgroundColor: loStatus + '2E' }]}>
                    <ThemedText style={[s.statusBadgeTextSm, { color: loStatus }]}>
                      {lo.status.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Section: Room */}
        {entity.hasRoom ? (
          <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Room</ThemedText>
            <Pressable
              style={[s.roomButton, { backgroundColor: accentColor + '18' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="bubble.left.fill" size={16} color={accentColor} />
              <ThemedText style={[s.roomButtonText, { color: accentColor }]}>
                Open Room
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        {/* Section: Audit */}
        {auditEntries.length > 0 ? (
          <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Audit</ThemedText>
            {auditEntries.map((entry) => {
              const actionKey = getAuditActionKey(entry.action);
              const actionColor = AUDIT_ACTION_COLOR[actionKey];
              return (
                <View key={entry.id} style={s.detailAuditRow}>
                  <View style={[s.detailAuditDot, { backgroundColor: actionColor }]} />
                  <View style={s.detailAuditText}>
                    <ThemedText style={[s.detailAuditAction, { color: colors.text }]} numberOfLines={1}>
                      {entry.action}
                    </ThemedText>
                    <ThemedText style={[s.detailAuditMeta, { color: colors.textTertiary }]}>
                      {entry.actor} · {entry.timestamp}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* Section: Settings */}
        <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Settings</ThemedText>
          <Pressable
            style={[s.settingsButton, { borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="gear" size={16} color={colors.textSecondary} />
            <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>
              Edit Entity
            </ThemedText>
          </Pressable>
          <Pressable
            style={[s.settingsButton, { borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="archivebox" size={16} color={colors.textSecondary} />
            <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>
              Archive
            </ThemedText>
          </Pressable>
          <Pressable
            style={[s.settingsButton, { borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
            <ThemedText style={[s.settingsButtonText, { color: '#EF4444' }]}>
              Delete
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

// =============================================================================
// FILTER BOTTOM SHEET
// =============================================================================

function FilterSheet({
  visible,
  onClose,
  colors,
  accentColor,
  filterState,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  filterState: {
    sort: EntityFilterState['sort'];
    statuses: EntityStatus[];
    companies: string[];
    departments: string[];
  };
  onApply: (state: {
    sort: EntityFilterState['sort'];
    statuses: EntityStatus[];
    companies: string[];
    departments: string[];
  }) => void;
}) {
  const [localSort, setLocalSort] = useState(filterState.sort);
  const [localStatuses, setLocalStatuses] = useState<EntityStatus[]>(filterState.statuses);
  const [localCompanies, setLocalCompanies] = useState<string[]>(filterState.companies);
  const [localDepartments, setLocalDepartments] = useState<string[]>(filterState.departments);

  const toggleStatus = useCallback((status: EntityStatus) => {
    setLocalStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  }, []);

  const toggleCompany = useCallback((company: string) => {
    setLocalCompanies((prev) =>
      prev.includes(company) ? prev.filter((c) => c !== company) : [...prev, company],
    );
  }, []);

  const toggleDepartment = useCallback((dept: string) => {
    setLocalDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept],
    );
  }, []);

  const handleClear = useCallback(() => {
    setLocalSort('recent');
    setLocalStatuses([]);
    setLocalCompanies([]);
    setLocalDepartments([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply({
      sort: localSort,
      statuses: localStatuses,
      companies: localCompanies,
      departments: localDepartments,
    });
    onClose();
  }, [localSort, localStatuses, localCompanies, localDepartments, onApply, onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Entities" useModal>
      {/* Sort */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text }]}>Sort</ThemedText>
      {SORT_OPTIONS.map((opt) => {
        const isActive = localSort === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLocalSort(opt.key);
            }}
          >
            <View
              style={[
                s.radioOuter,
                { borderColor: isActive ? accentColor : colors.textTertiary },
              ]}
            >
              {isActive ? (
                <View style={[s.radioInner, { backgroundColor: accentColor }]} />
              ) : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Status */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Status
      </ThemedText>
      {STATUS_OPTIONS.map((status) => {
        const isChecked = localStatuses.includes(status);
        const sColor = STATUS_COLOR_MAP[status];
        return (
          <Pressable
            key={status}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleStatus(status);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? (
                <IconSymbol name="checkmark" size={12} color="#000" />
              ) : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: sColor }]} />
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Company */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Company
      </ThemedText>
      {COMPANY_OPTIONS.map((company) => {
        const isChecked = localCompanies.includes(company);
        return (
          <Pressable
            key={company}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCompany(company);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? (
                <IconSymbol name="checkmark" size={12} color="#000" />
              ) : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {company}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Department */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Department
      </ThemedText>
      {DEPARTMENT_OPTIONS.map((dept) => {
        const isChecked = localDepartments.includes(dept);
        return (
          <Pressable
            key={dept}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleDepartment(dept);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? (
                <IconSymbol name="checkmark" size={12} color="#000" />
              ) : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {dept}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Action buttons */}
      <View style={s.filterActions}>
        <Pressable
          style={[s.filterGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleClear();
          }}
        >
          <ThemedText style={[s.filterGhostText, { color: colors.textSecondary }]}>
            Clear
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.filterApplyButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleApply();
          }}
        >
          <ThemedText style={s.filterApplyText}>Apply</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// CREATE ENTITY BOTTOM SHEET
// =============================================================================

function CreateEntitySheet({
  visible,
  onClose,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Entity" useModal>
      {CREATE_ENTITY_TEMPLATES.map((template) => {
        const tColor = TYPE_COLOR_MAP[template.type];
        return (
          <Pressable
            key={template.type}
            style={[s.createRow, { borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // Visual only
            }}
          >
            <View style={[s.createIconCircle, { backgroundColor: tColor + '26' }]}>
              <IconSymbol name={template.icon as any} size={18} color={tColor} />
            </View>
            <View style={s.createTextColumn}>
              <ThemedText style={[s.createLabel, { color: colors.text }]}>
                {template.label}
                {template.adminOnly ? (
                  <ThemedText style={[s.createAdmin, { color: colors.textTertiary }]}>
                    {' '}(Admin)
                  </ThemedText>
                ) : null}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>
        );
      })}
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function OrgEntitiesTab({ colors, accentColor }: Props) {
  // ── State ──
  const [activeTab, setActiveTab] = useState<EntitiesTabId>('all');
  const [activeScope, setActiveScope] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedEntity, setSelectedEntity] = useState<UnifiedEntity | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [filterSort, setFilterSort] = useState<EntityFilterState['sort']>('recent');
  const [filterStatuses, setFilterStatuses] = useState<EntityStatus[]>([]);
  const [filterCompanies, setFilterCompanies] = useState<string[]>([]);
  const [filterDepartments, setFilterDepartments] = useState<string[]>([]);

  // ── Derived data ──
  const processedEntities = useMemo(() => {
    let result = filterEntities(UNIFIED_ENTITIES, search, activeScope, filterStatuses);
    result = sortEntities(result, filterSort);
    return getEntitiesByTab(activeTab, result);
  }, [search, activeScope, filterStatuses, filterSort, activeTab]);

  const handleApplyFilter = useCallback(
    (state: {
      sort: EntityFilterState['sort'];
      statuses: EntityStatus[];
      companies: string[];
      departments: string[];
    }) => {
      setFilterSort(state.sort);
      setFilterStatuses(state.statuses);
      setFilterCompanies(state.companies);
      setFilterDepartments(state.departments);
    },
    [],
  );

  // ── If entity detail selected ──
  if (selectedEntity) {
    return (
      <EntityDetailView
        entity={selectedEntity}
        colors={colors}
        accentColor={accentColor}
        onBack={() => setSelectedEntity(null)}
      />
    );
  }

  // ── Directory view ──
  const isAuditTab = activeTab === 'audit';

  return (
    <View style={s.flex1}>
      {/* === Sticky header area === */}
      <View style={s.headerArea}>
        {/* Row: Title + filter + new */}
        <View style={s.headerRow}>
          <ThemedText style={[s.headerTitle, { color: colors.text }]}>Entities</ThemedText>
          <View style={s.headerActions}>
            <Pressable
              style={[s.iconButton, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowFilter(true);
              }}
            >
              <IconSymbol name="slider.horizontal.3" size={16} color={colors.textSecondary} />
            </Pressable>
            <Pressable
              style={[s.newButton, { backgroundColor: accentColor }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowCreate(true);
              }}
            >
              <IconSymbol name="plus" size={14} color="#000" />
              <ThemedText style={s.newButtonText}>New</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Scope chip bar */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.scopeChipRow}
        >
          {ENTITY_SCOPE_CHIPS.map((chip) => {
            const isActive = chip.key === activeScope;
            return (
              <Pressable
                key={chip.key}
                style={[
                  s.scopeChip,
                  {
                    backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary,
                    borderColor: isActive ? accentColor + '40' : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveScope(chip.key);
                }}
              >
                <ThemedText
                  style={[
                    s.scopeChipText,
                    { color: isActive ? accentColor : colors.textSecondary },
                  ]}
                >
                  {chip.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Search bar */}
        <View style={s.searchContainer}>
          <View
            style={[
              s.searchBar,
              { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
            ]}
          >
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search entities\u2026"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        {/* 12-tab pill nav */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabPillRow}
        >
          {ENTITIES_TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Pressable
                key={tab.id}
                style={[
                  s.tabPill,
                  {
                    backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.id);
                }}
              >
                <ThemedText
                  style={[
                    s.tabPillText,
                    { color: isActive ? '#000' : colors.textSecondary },
                  ]}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* === List area === */}
      {isAuditTab ? (
        <AuditTimeline entries={ENTITY_AUDIT_LOG} colors={colors} />
      ) : (
        <FlatList
          data={processedEntities}
          keyExtractor={(item) => item.id}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <EntityRow
              entity={item}
              colors={colors}
              onPress={() => setSelectedEntity(item)}
            />
          )}
          ListEmptyComponent={
            <View style={s.emptyContainer}>
              <IconSymbol name="building.2" size={32} color={colors.textTertiary} />
              <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
                No entities match your search
              </ThemedText>
            </View>
          }
        />
      )}

      {/* === Bottom Sheets === */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        colors={colors}
        accentColor={accentColor}
        filterState={{
          sort: filterSort,
          statuses: filterStatuses,
          companies: filterCompanies,
          departments: filterDepartments,
        }}
        onApply={handleApplyFilter}
      />
      <CreateEntitySheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        colors={colors}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  // ── Header area ──
  headerArea: {
    paddingTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  newButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },

  // ── Scope chips ──
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Search ──
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

  // ── Tab pills ──
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── Entity card ──
  entityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  entityTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  entityMidColumn: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  entityName: {
    fontSize: 15,
    fontWeight: '600',
  },
  entityMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scopeText: {
    fontSize: 12,
    flex: 1,
  },
  ownerLine: {
    fontSize: 12,
    marginTop: 3,
  },
  contextField: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusBadgeSm: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  statusBadgeTextSm: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  quickAction: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── List ──
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // ── Audit timeline ──
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTextColumn: {
    flex: 1,
  },
  auditAction: {
    fontSize: 14,
    fontWeight: '600',
  },
  auditEntity: {
    fontSize: 13,
    marginTop: 1,
  },
  auditMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── Detail view ──
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  detailScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  detailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // Identity card
  identityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  typeIconCircleLg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityInfo: {
    flex: 1,
  },
  identityName: {
    fontSize: 17,
    fontWeight: '700',
  },
  identityBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  identityOwnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  ownerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: {
    fontSize: 11,
    fontWeight: '700',
  },
  ownerName: {
    fontSize: 13,
  },
  identityScope: {
    fontSize: 12,
    marginTop: 2,
  },
  identityValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#22C55E',
    marginTop: 4,
    fontVariant: ['tabular-nums'],
  },

  // Summary section
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 13,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  // Linked objects
  linkedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  linkedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  linkedName: {
    fontSize: 14,
    flex: 1,
  },

  // Room button
  roomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  roomButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Detail audit
  detailAuditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  detailAuditDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  detailAuditText: {
    flex: 1,
  },
  detailAuditAction: {
    fontSize: 13,
  },
  detailAuditMeta: {
    fontSize: 11,
    marginTop: 1,
  },

  // Settings buttons
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // ── Filter sheet ──
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  filterOptionText: {
    fontSize: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  filterGhostButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  filterGhostText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterApplyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // ── Create sheet ──
  createRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  createIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createTextColumn: {
    flex: 1,
  },
  createLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  createAdmin: {
    fontSize: 12,
    fontWeight: '400',
    fontStyle: 'italic',
  },

  // ── Empty state ──
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
});
