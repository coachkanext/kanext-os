/**
 * Church Organization Resources v2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Library | Packs | Policies | Training | Forms | Media | Permissions | Audit | Requests
 * RBAC: C1/C2 full, C3 all except Permissions+Audit, C4 limited, C5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isElderLevel, isStaffLevel, isMember } from '@/utils/church-rbac';
import {
  getChurchResourcesV2Data,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_ICONS,
  RESOURCE_STATUS_LABELS,
  RESOURCE_STATUS_COLORS,
  VISIBILITY_LABELS,
  MINISTRY_TAG_LABELS,
  MINISTRY_TAG_COLORS,
  PACK_STATUS_LABELS,
  PACK_STATUS_COLORS,
  TRAINING_STATUS_LABELS,
  TRAINING_STATUS_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_PRIORITY_COLORS,
  AUDIENCE_LABELS,
} from '@/data/mock-church-org-resources-v2';
import type {
  ChurchResource,
  ResourcePack,
  PolicyPlaybook,
  TrainingModule,
  FormTemplate,
  MediaAsset,
  PublishingQueueItem,
  VersionHistoryEntry,
  ResourceRequest,
  MinistryTag,
  ResourceStatus,
} from '@/data/mock-church-org-resources-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'library', label: 'Library' },
  { id: 'packs', label: 'Packs' },
  { id: 'policies', label: 'Policies' },
  { id: 'training', label: 'Training' },
  { id: 'forms', label: 'Forms' },
  { id: 'media', label: 'Media' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'audit', label: 'Audit' },
  { id: 'requests', label: 'Requests' },
];

const LIBRARY_FILTER_CHIPS: { id: MinistryTag | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'worship', label: 'Worship' },
  { id: 'kids', label: 'Kids' },
  { id: 'youth', label: 'Youth' },
  { id: 'outreach', label: 'Outreach' },
  { id: 'admin', label: 'Admin' },
  { id: 'facilities', label: 'Facilities' },
  { id: 'prayer', label: 'Prayer' },
  { id: 'discipleship', label: 'Discipleship' },
  { id: 'general', label: 'General' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCHours().toString().padStart(2, '0')}:${d.getUTCMinutes().toString().padStart(2, '0')}`;
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
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
// SUB-TAB BAR
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  data,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getChurchResourcesV2Data>;
  role: ChurchRoleLens;
}) {
  const tiles = data.overviewTiles;
  const publishedCount = data.resources.filter((r) => r.status === 'published').length;
  const draftCount = data.resources.filter((r) => r.status === 'draft').length;
  const activePacks = data.packs.filter((p) => p.status === 'published').length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Quick Stats Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tileStrip}
      >
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: ACCENT }]}>{tiles.newResources7d}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>New (7d)</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#F59E0B' }]}>{tiles.policiesAwaitingApproval}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Policies Pending</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#22C55E' }]}>{tiles.trainingCompletion30d}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Training (30d)</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: accentColor }]} numberOfLines={1}>
            {tiles.topPack}
          </ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Top Pack</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#EF4444' }]}>{tiles.expiringItems}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Expiring</ThemedText>
        </View>
      </ScrollView>

      {/* Start Here Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Start Here</ThemedText>

      {isElderLevel(role) && (
        <View style={[s.startCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="checkmark.seal.fill" size={18} color={accentColor} />
          <View style={s.startCardTextCol}>
            <ThemedText style={[s.startCardTitle, { color: colors.text }]}>Review Publishing Queue</ThemedText>
            <ThemedText style={[s.startCardSubtitle, { color: colors.textSecondary }]}>
              {data.publishingQueue.filter((q) => q.status === 'pending').length} items awaiting approval
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      )}

      {isStaffLevel(role) && (
        <View style={[s.startCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="doc.text.fill" size={18} color={ACCENT} />
          <View style={s.startCardTextCol}>
            <ThemedText style={[s.startCardTitle, { color: colors.text }]}>Browse Resource Library</ThemedText>
            <ThemedText style={[s.startCardSubtitle, { color: colors.textSecondary }]}>
              {publishedCount} published, {draftCount} in draft
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      )}

      {isMember(role) && (
        <View style={[s.startCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="tray.full.fill" size={18} color="#22C55E" />
          <View style={s.startCardTextCol}>
            <ThemedText style={[s.startCardTitle, { color: colors.text }]}>Explore Resource Packs</ThemedText>
            <ThemedText style={[s.startCardSubtitle, { color: colors.textSecondary }]}>
              {activePacks} active packs ready for your ministry
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      )}

      {/* Resource Summary */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.lg }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="folder.fill" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Resource Summary</ThemedText>
        </View>
        <View style={s.summaryRow}>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{data.resources.length}</ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Resources</ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{data.packs.length}</ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Packs</ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{data.policies.length}</ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Policies</ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{data.training.length}</ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Training</ThemedText>
          </View>
        </View>
      </View>

      {/* Gap Detector */}
      {isStaffLevel(role) && data.requests.filter((r) => r.status === 'new').length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Gap Detector
          </ThemedText>
          <View style={[s.alertCard, { backgroundColor: '#F59E0B10', borderColor: '#F59E0B30' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F59E0B" />
            <View style={s.alertTextCol}>
              <ThemedText style={[s.alertTitle, { color: colors.text }]}>
                {data.requests.filter((r) => r.status === 'new').length} New Resource Requests
              </ThemedText>
              <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]}>
                Teams have identified resource gaps that need attention
              </ThemedText>
            </View>
          </View>
        </>
      )}

      {/* Recent Activity */}
      {isStaffLevel(role) && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Recent Activity
          </ThemedText>
          {data.versionHistory.slice(0, 4).map((entry) => (
            <View
              key={entry.id}
              style={[s.activityRow, { borderBottomColor: colors.border }]}
            >
              <View style={[s.activityDot, { backgroundColor: getAuditActionColor(entry.action) }]} />
              <View style={s.activityTextCol}>
                <ThemedText style={[s.activityTitle, { color: colors.text }]} numberOfLines={1}>
                  {entry.resourceTitle}
                </ThemedText>
                <ThemedText style={[s.activityMeta, { color: colors.textTertiary }]}>
                  {entry.performedBy} — {formatTimestamp(entry.timestamp)}
                </ThemedText>
              </View>
              <StatusBadge label={getAuditActionLabel(entry.action)} color={getAuditActionColor(entry.action)} />
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

function getAuditActionLabel(action: string): string {
  const map: Record<string, string> = {
    published: 'PUBLISHED',
    version_bump: 'UPDATED',
    visibility_changed: 'VISIBILITY',
    acknowledged: 'ACKNOWLEDGED',
  };
  return map[action] || action.toUpperCase();
}

function getAuditActionColor(action: string): string {
  const map: Record<string, string> = {
    published: '#22C55E',
    version_bump: ACCENT,
    visibility_changed: '#F59E0B',
    acknowledged: ACCENT,
  };
  return map[action] || '#A1A1AA';
}

// =============================================================================
// LIBRARY SUB-TAB
// =============================================================================

function LibraryTab({
  colors,
  accentColor,
  resources,
  filterTag,
  onFilterChange,
  onSelectResource,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  resources: ChurchResource[];
  filterTag: MinistryTag | 'all';
  onFilterChange: (tag: MinistryTag | 'all') => void;
  onSelectResource: (resource: ChurchResource) => void;
}) {
  const filtered = useMemo(() => {
    if (filterTag === 'all') return resources;
    return resources.filter((r) => r.tags.includes(filterTag));
  }, [resources, filterTag]);

  const renderItem = useCallback(
    ({ item }: { item: ChurchResource }) => {
      const statusColor = RESOURCE_STATUS_COLORS[item.status];
      return (
        <Pressable
          style={[s.resourceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectResource(item);
          }}
        >
          {/* Top Row */}
          <View style={s.resourceCardTop}>
            <View style={[s.resourceIconCircle, { backgroundColor: accentColor + '18' }]}>
              <IconSymbol name={RESOURCE_TYPE_ICONS[item.type] as any} size={18} color={accentColor} />
            </View>
            <View style={s.resourceNameCol}>
              <ThemedText style={[s.resourceName, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <View style={s.resourceBadgeRow}>
                <StatusBadge label={RESOURCE_TYPE_LABELS[item.type].toUpperCase()} color={accentColor} />
                <StatusBadge label={RESOURCE_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
                <StatusBadge label={VISIBILITY_LABELS[item.visibility].toUpperCase()} color={getVisibilityColor(item.visibility)} />
              </View>
            </View>
          </View>

          {/* Ministry Tags */}
          <View style={s.ministryTagRow}>
            {item.tags.map((tag) => (
              <View
                key={tag}
                style={[s.ministryChip, { backgroundColor: (MINISTRY_TAG_COLORS[tag] || '#A1A1AA') + '18' }]}
              >
                <ThemedText style={[s.ministryChipText, { color: MINISTRY_TAG_COLORS[tag] || '#A1A1AA' }]}>
                  {MINISTRY_TAG_LABELS[tag] || tag}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Details Row */}
          <View style={[s.resourceDetails, { borderTopColor: colors.border }]}>
            <View style={s.resourceDetailItem}>
              <ThemedText style={[s.resourceDetailValue, { color: colors.text }]}>{item.owner}</ThemedText>
              <ThemedText style={[s.resourceDetailLabel, { color: colors.textTertiary }]}>Owner</ThemedText>
            </View>
            <View style={s.resourceDetailItem}>
              <ThemedText style={[s.resourceDetailValue, { color: colors.text }]}>v{item.version}</ThemedText>
              <ThemedText style={[s.resourceDetailLabel, { color: colors.textTertiary }]}>Version</ThemedText>
            </View>
            <View style={s.resourceDetailItem}>
              <ThemedText style={[s.resourceDetailValue, { color: colors.text }]}>{formatDate(item.lastUpdated)}</ThemedText>
              <ThemedText style={[s.resourceDetailLabel, { color: colors.textTertiary }]}>Updated</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectResource],
  );

  return (
    <View style={s.flex1}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
      >
        {LIBRARY_FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === filterTag;
          return (
            <Pressable
              key={chip.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onFilterChange(chip.id);
              }}
            >
              <ThemedText
                style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Resource FlatList */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="doc.text.fill" label="No resources match filter" colors={colors} />
        }
      />
    </View>
  );
}

function getVisibilityColor(visibility: string): string {
  const map: Record<string, string> = {
    public: '#22C55E',
    org: ACCENT,
    ministry: '#F59E0B',
    role_specific: ACCENT,
    restricted: '#EF4444',
  };
  return map[visibility] || '#A1A1AA';
}

// =============================================================================
// PACKS SUB-TAB
// =============================================================================

function PacksTab({
  colors,
  accentColor,
  packs,
  onSelectPack,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  packs: ResourcePack[];
  onSelectPack: (pack: ResourcePack) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ResourcePack }) => {
      const statusColor = PACK_STATUS_COLORS[item.status];
      const ministryColor = MINISTRY_TAG_COLORS[item.ministry] || '#A1A1AA';
      return (
        <Pressable
          style={[s.packCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPack(item);
          }}
        >
          <View style={s.packCardHeader}>
            <View style={s.packNameCol}>
              <ThemedText style={[s.packName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.packOwner, { color: colors.textSecondary }]}>
                {item.owner}
              </ThemedText>
            </View>
            <StatusBadge label={PACK_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
          </View>

          <ThemedText style={[s.packDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={s.packMetaRow}>
            <View style={[s.ministryChip, { backgroundColor: ministryColor + '18' }]}>
              <ThemedText style={[s.ministryChipText, { color: ministryColor }]}>
                {MINISTRY_TAG_LABELS[item.ministry] || item.ministry}
              </ThemedText>
            </View>
            <ThemedText style={[s.packMetaText, { color: colors.textTertiary }]}>
              {item.resourceCount} resources
            </ThemedText>
            {item.lastUsedDate && (
              <ThemedText style={[s.packMetaText, { color: colors.textTertiary }]}>
                Used {formatDate(item.lastUsedDate)}
              </ThemedText>
            )}
          </View>

          <View style={s.packRolesRow}>
            {item.intendedRoles.map((role) => (
              <View key={role} style={[s.roleChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={[s.roleChipText, { color: colors.textSecondary }]}>{role}</ThemedText>
              </View>
            ))}
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectPack],
  );

  return (
    <FlatList
      data={packs}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="tray.full.fill" label="No resource packs available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// POLICIES SUB-TAB
// =============================================================================

function PoliciesTab({
  colors,
  accentColor,
  policies,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  policies: PolicyPlaybook[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: PolicyPlaybook }) => {
      const statusColor = RESOURCE_STATUS_COLORS[item.status] || '#A1A1AA';
      const ackPercent = item.totalRequired > 0
        ? Math.round((item.acknowledgedCount / item.totalRequired) * 100)
        : 0;
      return (
        <View style={[s.policyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.policyHeader}>
            <View style={s.policyNameCol}>
              <ThemedText style={[s.policyName, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.policyBadgeRow}>
                <StatusBadge label={item.section.toUpperCase()} color={accentColor} />
                <StatusBadge label={RESOURCE_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
              </View>
            </View>
            {item.status === 'in_review' && (
              <View style={[s.approvalFlag, { backgroundColor: '#F59E0B20' }]}>
                <ThemedText style={[s.approvalFlagText, { color: '#F59E0B' }]}>NEEDS APPROVAL</ThemedText>
              </View>
            )}
          </View>

          <View style={s.policyMeta}>
            <ThemedText style={[s.policyMetaText, { color: colors.textTertiary }]}>
              v{item.version} — {item.owner}
            </ThemedText>
            <ThemedText style={[s.policyMetaText, { color: colors.textTertiary }]}>
              Effective {formatDate(item.effectiveDate)}
            </ThemedText>
          </View>

          {item.acknowledgmentRequired && item.totalRequired > 0 && (
            <View style={s.policyAckSection}>
              <View style={s.policyAckLabelRow}>
                <ThemedText style={[s.policyAckLabel, { color: colors.textSecondary }]}>
                  Acknowledged
                </ThemedText>
                <ThemedText style={[s.policyAckCount, { color: colors.text }]}>
                  {item.acknowledgedCount}/{item.totalRequired}
                </ThemedText>
              </View>
              <ProgressBar percent={ackPercent} color={ackPercent >= 100 ? '#22C55E' : accentColor} />
            </View>
          )}
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={policies}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No policies found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// TRAINING SUB-TAB
// =============================================================================

function TrainingTab({
  colors,
  accentColor,
  modules,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  modules: TrainingModule[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: TrainingModule }) => {
      const statusColor = RESOURCE_STATUS_COLORS[item.status] || '#A1A1AA';
      const completionPercent = item.totalAssigned > 0
        ? Math.round((item.completionCount / item.totalAssigned) * 100)
        : 0;
      return (
        <View style={[s.trainingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.trainingHeader}>
            <ThemedText style={[s.trainingName, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            <StatusBadge label={RESOURCE_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
          </View>

          <ThemedText style={[s.trainingDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={s.trainingMetaRow}>
            <View style={s.trainingMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.trainingMetaText, { color: colors.textTertiary }]}>
                {item.estimatedTime}
              </ThemedText>
            </View>
            {item.renewalCadence && (
              <StatusBadge label={item.renewalCadence.toUpperCase()} color={ACCENT} />
            )}
          </View>

          <View style={s.trainingRolesRow}>
            {item.requiredRoles.map((role) => (
              <View key={role} style={[s.roleChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <ThemedText style={[s.roleChipText, { color: colors.textSecondary }]}>{role}</ThemedText>
              </View>
            ))}
          </View>

          <View style={s.trainingProgressSection}>
            <View style={s.trainingProgressLabelRow}>
              <ThemedText style={[s.trainingProgressLabel, { color: colors.textSecondary }]}>
                Completion
              </ThemedText>
              <ThemedText style={[s.trainingProgressCount, { color: colors.text }]}>
                {item.completionCount}/{item.totalAssigned}
              </ThemedText>
            </View>
            <ProgressBar percent={completionPercent} color={completionPercent >= 100 ? '#22C55E' : accentColor} />
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={modules}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="graduationcap.fill" label="No training modules available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FORMS SUB-TAB
// =============================================================================

function FormsTab({
  colors,
  accentColor,
  forms,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  forms: FormTemplate[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: FormTemplate }) => {
      const statusColor = item.status === 'published' ? '#22C55E' : '#F59E0B';
      return (
        <View style={[s.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.formHeader}>
            <IconSymbol name="doc.plaintext.fill" size={18} color={accentColor} />
            <View style={s.formNameCol}>
              <ThemedText style={[s.formName, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.formBadgeRow}>
                <StatusBadge label={item.status.toUpperCase()} color={statusColor} />
                <StatusBadge label={VISIBILITY_LABELS[item.visibility].toUpperCase()} color={getVisibilityColor(item.visibility)} />
                {item.requiredAttachments && (
                  <StatusBadge label="ATTACHMENTS" color={ACCENT} />
                )}
              </View>
            </View>
          </View>

          <ThemedText style={[s.formPurpose, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.purpose}
          </ThemedText>

          <View style={[s.formMetaRow, { borderTopColor: colors.border }]}>
            <View style={s.formMetaItem}>
              <ThemedText style={[s.formMetaValue, { color: colors.text }]}>{item.owner}</ThemedText>
              <ThemedText style={[s.formMetaLabel, { color: colors.textTertiary }]}>Owner</ThemedText>
            </View>
            <View style={s.formMetaItem}>
              <ThemedText style={[s.formMetaValue, { color: colors.text }]} numberOfLines={1}>
                {item.routingRule}
              </ThemedText>
              <ThemedText style={[s.formMetaLabel, { color: colors.textTertiary }]}>Routing</ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={forms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.plaintext.fill" label="No form templates available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MEDIA SUB-TAB
// =============================================================================

function MediaTab({
  colors,
  accentColor,
  assets,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  assets: MediaAsset[];
}) {
  const getMediaTypeIcon = (type: string): string => {
    const map: Record<string, string> = {
      logo: 'paintbrush.fill',
      slide_template: 'rectangle.on.rectangle.angled',
      lyric_template: 'music.note.list',
      photo_guideline: 'camera.fill',
      announcement_graphic: 'megaphone.fill',
      audio_reference: 'waveform',
    };
    return map[type] || 'photo.fill';
  };

  const getMediaTypeColor = (type: string): string => {
    const map: Record<string, string> = {
      logo: ACCENT,
      slide_template: ACCENT,
      lyric_template: '#F59E0B',
      photo_guideline: '#22C55E',
      announcement_graphic: ACCENT,
      audio_reference: '#EF4444',
    };
    return map[type] || '#A1A1AA';
  };

  const renderItem = useCallback(
    ({ item }: { item: MediaAsset }) => {
      const statusColor = RESOURCE_STATUS_COLORS[item.status] || '#A1A1AA';
      const typeColor = getMediaTypeColor(item.type);
      return (
        <View style={[s.mediaCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.mediaCardTop}>
            <View style={[s.mediaIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name={getMediaTypeIcon(item.type) as any} size={18} color={typeColor} />
            </View>
            <View style={s.mediaNameCol}>
              <ThemedText style={[s.mediaName, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.mediaBadgeRow}>
                <StatusBadge label={item.type.replace(/_/g, ' ').toUpperCase()} color={typeColor} />
                <StatusBadge label={RESOURCE_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
              </View>
            </View>
          </View>

          <ThemedText style={[s.mediaDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={s.mediaMetaRow}>
            <ThemedText style={[s.mediaMetaText, { color: colors.textTertiary }]}>
              {item.owner}
            </ThemedText>
            <ThemedText style={[s.mediaMetaText, { color: colors.textTertiary }]}>
              Updated {formatDate(item.lastUpdated)}
            </ThemedText>
          </View>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={assets}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="photo.fill" label="No media assets available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PERMISSIONS SUB-TAB (C1/C2 only)
// =============================================================================

function PermissionsTab({
  colors,
  accentColor,
  queue,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  queue: PublishingQueueItem[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Visibility Levels */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Visibility Levels</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Resource access tiers used across the library
      </ThemedText>

      {(['public', 'org', 'ministry', 'role_specific', 'restricted'] as const).map((level) => (
        <View
          key={level}
          style={[s.visibilityRow, { borderBottomColor: colors.border }]}
        >
          <View style={[s.visibilityDot, { backgroundColor: getVisibilityColor(level) }]} />
          <View style={s.visibilityTextCol}>
            <ThemedText style={[s.visibilityLabel, { color: colors.text }]}>
              {VISIBILITY_LABELS[level]}
            </ThemedText>
            <ThemedText style={[s.visibilityDesc, { color: colors.textSecondary }]}>
              {getVisibilityDescription(level)}
            </ThemedText>
          </View>
        </View>
      ))}

      {/* Publishing Queue */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Publishing Queue
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Items awaiting review and approval
      </ThemedText>

      {queue.map((item) => {
        const statusColor = item.status === 'pending' ? '#F59E0B' : item.status === 'approved' ? '#22C55E' : '#EF4444';
        return (
          <View
            key={item.id}
            style={[s.queueCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.queueHeader}>
              <ThemedText style={[s.queueTitle, { color: colors.text }]} numberOfLines={1}>
                {item.resourceTitle}
              </ThemedText>
              <StatusBadge label={item.status.toUpperCase()} color={statusColor} />
            </View>
            <View style={s.queueMeta}>
              <ThemedText style={[s.queueMetaText, { color: colors.textTertiary }]}>
                {item.type}
              </ThemedText>
              <ThemedText style={[s.queueMetaText, { color: colors.textTertiary }]}>
                by {item.submittedBy}
              </ThemedText>
              <ThemedText style={[s.queueMetaText, { color: colors.textTertiary }]}>
                {formatDate(item.submittedDate)}
              </ThemedText>
            </View>
            <ThemedText style={[s.queueApprover, { color: colors.textSecondary }]}>
              Requires: {item.requiredApprover}
            </ThemedText>
          </View>
        );
      })}

      {queue.length === 0 && (
        <EmptyState icon="checkmark.seal.fill" label="No items in publishing queue" colors={colors} />
      )}
    </ScrollView>
  );
}

function getVisibilityDescription(level: string): string {
  const map: Record<string, string> = {
    public: 'Visible to everyone, including visitors',
    org: 'Visible to all organization members',
    ministry: 'Visible only to the assigned ministry team',
    role_specific: 'Visible only to specific roles',
    restricted: 'Leadership and admin access only',
  };
  return map[level] || '';
}

// =============================================================================
// AUDIT SUB-TAB (C1/C2 only)
// =============================================================================

function AuditTab({
  colors,
  accentColor,
  history,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  history: VersionHistoryEntry[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Version History</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Resource changes, publications, and acknowledgments
      </ThemedText>

      {history.map((entry, index) => {
        const actionColor = getAuditActionColor(entry.action);
        return (
          <View key={entry.id} style={s.auditEntry}>
            {/* Timeline */}
            <View style={s.auditTimeline}>
              <View style={[s.auditDot, { backgroundColor: actionColor }]} />
              {index < history.length - 1 && (
                <View style={[s.auditLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            {/* Content */}
            <View style={[s.auditContent, { borderBottomColor: colors.border }]}>
              <View style={s.auditContentHeader}>
                <ThemedText style={[s.auditResourceTitle, { color: colors.text }]} numberOfLines={1}>
                  {entry.resourceTitle}
                </ThemedText>
                <StatusBadge label={getAuditActionLabel(entry.action)} color={actionColor} />
              </View>
              <ThemedText style={[s.auditDetails, { color: colors.textSecondary }]} numberOfLines={2}>
                {entry.details}
              </ThemedText>
              <View style={s.auditMetaRow}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                  {entry.performedBy}
                </ThemedText>
                <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                  {formatTimestamp(entry.timestamp)}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {history.length === 0 && (
        <EmptyState icon="clock.fill" label="No audit history available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// REQUESTS SUB-TAB
// =============================================================================

function RequestsTab({
  colors,
  accentColor,
  requests,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  requests: ResourceRequest[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: ResourceRequest }) => {
      const statusColor = REQUEST_STATUS_COLORS[item.status];
      const priorityColor = REQUEST_PRIORITY_COLORS[item.priority];
      const ministryColor = MINISTRY_TAG_COLORS[item.ministry] || '#A1A1AA';
      return (
        <View style={[s.requestCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Priority bar */}
          <View style={[s.requestPriorityBar, { backgroundColor: priorityColor }]} />
          <View style={s.requestContent}>
            <View style={s.requestHeader}>
              <ThemedText style={[s.requestTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <StatusBadge label={REQUEST_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
            </View>

            <ThemedText style={[s.requestDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            <View style={s.requestMetaRow}>
              <StatusBadge label={item.type.replace(/_/g, ' ').toUpperCase()} color={accentColor} />
              <StatusBadge label={item.priority.toUpperCase()} color={priorityColor} />
              <View style={[s.ministryChip, { backgroundColor: ministryColor + '18' }]}>
                <ThemedText style={[s.ministryChipText, { color: ministryColor }]}>
                  {MINISTRY_TAG_LABELS[item.ministry] || item.ministry}
                </ThemedText>
              </View>
            </View>

            <View style={s.requestFooter}>
              <View style={s.requestMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.requestMetaText, { color: colors.textTertiary }]}>
                  {item.requestedBy}
                </ThemedText>
              </View>
              {item.ownerAssigned && (
                <View style={s.requestMetaItem}>
                  <IconSymbol name="arrow.right" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.requestMetaText, { color: colors.textTertiary }]}>
                    {item.ownerAssigned}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={requests}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="paperplane.fill" label="No resource requests" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RESOURCE DETAIL BOTTOM SHEET
// =============================================================================

function ResourceDetailSheet({
  visible,
  onClose,
  resource,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  resource: ChurchResource | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!resource) return null;

  const statusColor = RESOURCE_STATUS_COLORS[resource.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={resource.title} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={RESOURCE_TYPE_LABELS[resource.type].toUpperCase()} color={accentColor} />
        <StatusBadge label={RESOURCE_STATUS_LABELS[resource.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={VISIBILITY_LABELS[resource.visibility].toUpperCase()} color={getVisibilityColor(resource.visibility)} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{resource.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>v{resource.version}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Version</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(resource.lastUpdated)}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Updated</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{AUDIENCE_LABELS[resource.audience]}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Audience</ThemedText>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetDescriptionText, { color: colors.textSecondary }]}>
          {resource.description}
        </ThemedText>
      </View>

      {/* Ministry Tags */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Ministry Tags</ThemedText>
        <View style={s.sheetTagsGrid}>
          {resource.tags.map((tag) => (
            <View
              key={tag}
              style={[s.ministryChip, { backgroundColor: (MINISTRY_TAG_COLORS[tag] || '#A1A1AA') + '18' }]}
            >
              <ThemedText style={[s.ministryChipText, { color: MINISTRY_TAG_COLORS[tag] || '#A1A1AA' }]}>
                {MINISTRY_TAG_LABELS[tag] || tag}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* File info */}
      {(resource.fileSize || resource.duration) && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>File Info</ThemedText>
          {resource.fileSize && (
            <ThemedText style={[s.sheetMetaText, { color: colors.textSecondary }]}>
              Size: {resource.fileSize}
            </ThemedText>
          )}
          {resource.duration && (
            <ThemedText style={[s.sheetMetaText, { color: colors.textSecondary }]}>
              Duration: {resource.duration}
            </ThemedText>
          )}
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PACK DETAIL BOTTOM SHEET
// =============================================================================

function PackDetailSheet({
  visible,
  onClose,
  pack,
  resources,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  pack: ResourcePack | null;
  resources: ChurchResource[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!pack) return null;

  const statusColor = PACK_STATUS_COLORS[pack.status];
  const ministryColor = MINISTRY_TAG_COLORS[pack.ministry] || '#A1A1AA';
  const includedResources = resources.filter((r) => pack.includedResourceIds.includes(r.id));

  return (
    <BottomSheet visible={visible} onClose={onClose} title={pack.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={PACK_STATUS_LABELS[pack.status].toUpperCase()} color={statusColor} />
        <View style={[s.ministryChip, { backgroundColor: ministryColor + '18' }]}>
          <ThemedText style={[s.ministryChipText, { color: ministryColor }]}>
            {MINISTRY_TAG_LABELS[pack.ministry] || pack.ministry}
          </ThemedText>
        </View>
      </View>

      {/* Purpose */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Purpose</ThemedText>
        <ThemedText style={[s.sheetDescriptionText, { color: colors.textSecondary }]}>
          {pack.description}
        </ThemedText>
      </View>

      {/* Intended Roles */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Intended Roles</ThemedText>
        <View style={s.sheetTagsGrid}>
          {pack.intendedRoles.map((role) => (
            <View key={role} style={[s.roleChip, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <ThemedText style={[s.roleChipText, { color: colors.textSecondary }]}>{role}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Included Resources */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Included Resources ({includedResources.length})
        </ThemedText>
        {includedResources.map((res) => (
          <View key={res.id} style={s.sheetListRow}>
            <IconSymbol name={RESOURCE_TYPE_ICONS[res.type] as any} size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {res.title}
              </ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {RESOURCE_TYPE_LABELS[res.type]} — v{res.version}
              </ThemedText>
            </View>
          </View>
        ))}
        {includedResources.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No resources in this pack
          </ThemedText>
        )}
      </View>

      {/* Pack Info */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Info</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{pack.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          {pack.lastUsedDate && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{formatDate(pack.lastUsedDate)}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Used</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Details</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchOrgResourcesV2({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C9-C11 locked (hidden per RBAC matrix) ===
  if (role === 'C9' || role === 'C10' || role === 'C11') {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Resources</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact church staff for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedResource, setSelectedResource] = useState<ChurchResource | null>(null);
  const [selectedPack, setSelectedPack] = useState<ResourcePack | null>(null);
  const [resourceSheetVisible, setResourceSheetVisible] = useState(false);
  const [packSheetVisible, setPackSheetVisible] = useState(false);
  const [filterTag, setFilterTag] = useState<MinistryTag | 'all'>('all');

  // === Data ===
  const data = useMemo(() => getChurchResourcesV2Data(), []);

  // === Callbacks ===
  const handleSelectResource = useCallback((resource: ChurchResource) => {
    setSelectedResource(resource);
    setResourceSheetVisible(true);
  }, []);

  const handleCloseResourceSheet = useCallback(() => {
    setResourceSheetVisible(false);
  }, []);

  const handleSelectPack = useCallback((pack: ResourcePack) => {
    setSelectedPack(pack);
    setPackSheetVisible(true);
  }, []);

  const handleClosePackSheet = useCallback(() => {
    setPackSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS; // C1/C2: full 10 tabs
    if (isStaffLevel(role)) {
      // C3 (Ministry Leader): all except Permissions + Audit
      return SUB_TABS.filter((t) => t.id !== 'permissions' && t.id !== 'audit');
    }
    // C4 (Volunteer): Overview + Library (public) + Packs (assigned) + Training (my training) + Forms (published)
    return SUB_TABS.filter((t) =>
      t.id === 'overview' ||
      t.id === 'library' ||
      t.id === 'packs' ||
      t.id === 'training' ||
      t.id === 'forms'
    );
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} role={role} />;
      case 'library':
        return (
          <LibraryTab
            colors={colors}
            accentColor={accentColor}
            resources={data.resources}
            filterTag={filterTag}
            onFilterChange={setFilterTag}
            onSelectResource={handleSelectResource}
          />
        );
      case 'packs':
        return (
          <PacksTab
            colors={colors}
            accentColor={accentColor}
            packs={data.packs}
            onSelectPack={handleSelectPack}
          />
        );
      case 'policies':
        if (!isStaffLevel(role)) return null;
        return (
          <PoliciesTab
            colors={colors}
            accentColor={accentColor}
            policies={data.policies}
          />
        );
      case 'training':
        return (
          <TrainingTab
            colors={colors}
            accentColor={accentColor}
            modules={data.training}
          />
        );
      case 'forms':
        return (
          <FormsTab
            colors={colors}
            accentColor={accentColor}
            forms={data.forms}
          />
        );
      case 'media':
        if (!isStaffLevel(role)) return null;
        return (
          <MediaTab
            colors={colors}
            accentColor={accentColor}
            assets={data.mediaAssets}
          />
        );
      case 'permissions':
        if (!isElderLevel(role)) return null;
        return (
          <PermissionsTab
            colors={colors}
            accentColor={accentColor}
            queue={data.publishingQueue}
          />
        );
      case 'audit':
        if (!isElderLevel(role)) return null;
        return (
          <AuditTab
            colors={colors}
            accentColor={accentColor}
            history={data.versionHistory}
          />
        );
      case 'requests':
        return (
          <RequestsTab
            colors={colors}
            accentColor={accentColor}
            requests={data.requests}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Resource Detail Bottom Sheet */}
      <ResourceDetailSheet
        visible={resourceSheetVisible}
        onClose={handleCloseResourceSheet}
        resource={selectedResource}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Pack Detail Bottom Sheet */}
      <PackDetailSheet
        visible={packSheetVisible}
        onClose={handleClosePackSheet}
        pack={selectedPack}
        resources={data.resources}
        colors={colors}
        accentColor={accentColor}
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

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
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

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Tile Strip (Overview) --
  tileStrip: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  tileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 100,
  },
  tileValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  tileLabel: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Start Card --
  startCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  startCardTextCol: {
    flex: 1,
  },
  startCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  startCardSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Section Card --
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sectionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },

  // -- Summary Row --
  summaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryLabel: {
    fontSize: 10,
    marginTop: 2,
  },

  // -- Alert Card --
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Activity Row --
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activityTextCol: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  activityMeta: {
    fontSize: 11,
    marginTop: 1,
  },

  // -- Filter Chips --
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

  // -- Resource Card (Library) --
  resourceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  resourceCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  resourceIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceNameCol: {
    flex: 1,
  },
  resourceName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  resourceBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  ministryTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  ministryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  ministryChipText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resourceDetails: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  resourceDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  resourceDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  resourceDetailLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Pack Card --
  packCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  packCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  packName: {
    fontSize: 15,
    fontWeight: '600',
  },
  packOwner: {
    fontSize: 12,
    marginTop: 2,
  },
  packDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  packMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  packMetaText: {
    fontSize: 11,
  },
  packRolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  roleChipText: {
    fontSize: 10,
    fontWeight: '500',
  },

  // -- Policy Card --
  policyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  policyNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  policyName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  policyBadgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  approvalFlag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  approvalFlagText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  policyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  policyMetaText: {
    fontSize: 11,
  },
  policyAckSection: {
    marginTop: 4,
  },
  policyAckLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  policyAckLabel: {
    fontSize: 11,
  },
  policyAckCount: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Training Card --
  trainingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  trainingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  trainingName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  trainingDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  trainingMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  trainingMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trainingMetaText: {
    fontSize: 11,
  },
  trainingRolesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  trainingProgressSection: {
    marginTop: 4,
  },
  trainingProgressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  trainingProgressLabel: {
    fontSize: 11,
  },
  trainingProgressCount: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Form Card --
  formCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  formNameCol: {
    flex: 1,
  },
  formName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  formBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  formPurpose: {
    fontSize: 12,
    lineHeight: 17,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  formMetaRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  formMetaItem: {
    flex: 1,
  },
  formMetaValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  formMetaLabel: {
    fontSize: 10,
    marginTop: 1,
  },

  // -- Media Card --
  mediaCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  mediaCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  mediaIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mediaNameCol: {
    flex: 1,
  },
  mediaName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  mediaBadgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  mediaDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  mediaMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mediaMetaText: {
    fontSize: 11,
  },

  // -- Visibility Row (Permissions) --
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  visibilityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  visibilityTextCol: {
    flex: 1,
  },
  visibilityLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  visibilityDesc: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Queue Card (Permissions) --
  queueCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  queueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  queueTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  queueMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
  },
  queueMetaText: {
    fontSize: 11,
  },
  queueApprover: {
    fontSize: 12,
    fontWeight: '500',
  },

  // -- Audit Timeline --
  auditEntry: {
    flexDirection: 'row',
    marginBottom: 0,
  },
  auditTimeline: {
    alignItems: 'center',
    width: 24,
    paddingTop: 6,
  },
  auditDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  auditLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  auditContent: {
    flex: 1,
    paddingBottom: Spacing.md,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  auditContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  auditResourceTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  auditDetails: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  auditMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  auditMetaText: {
    fontSize: 11,
  },

  // -- Request Card --
  requestCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  requestPriorityBar: {
    width: 4,
  },
  requestContent: {
    flex: 1,
    padding: Spacing.md,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  requestTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  requestDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  requestMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  requestFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  requestMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestMetaText: {
    fontSize: 11,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetDescriptionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sheetTagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  sheetMetaText: {
    fontSize: 12,
    marginBottom: 4,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
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
