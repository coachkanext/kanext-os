/**
 * Education Organization Resources v2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Library | Packs | Templates | SOPs / Playbooks | Policies | Role Kits | Requests | Updates | Admin
 * RBAC: E0–E5 full, E6/E7 all except Admin, E8–E11 limited, E12/E13 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel, isPresident, isStudent, isEnrolled } from '@/utils/education-rbac';
import {
  getEduResourcesData,
  RESOURCE_TYPE_LABELS,
  RESOURCE_TYPE_COLORS,
  RESOURCE_STATUS_LABELS,
  RESOURCE_STATUS_COLORS,
  RESOURCE_AUDIENCE_LABELS,
  RESOURCE_AUDIENCE_COLORS,
  DEPARTMENT_SCOPE_LABELS,
  DEPARTMENT_SCOPE_COLORS,
  PACK_STATUS_LABELS,
  PACK_STATUS_COLORS,
  PACK_AUDIENCE_LABELS,
  PACK_AUDIENCE_COLORS,
  SOP_STATUS_LABELS,
  SOP_STATUS_COLORS,
  ROLE_KIT_TYPE_LABELS,
  ROLE_KIT_TYPE_COLORS,
  REQUEST_TYPE_LABELS,
  REQUEST_TYPE_COLORS,
  REQUEST_STATUS_LABELS,
  REQUEST_STATUS_COLORS,
  REQUEST_PRIORITY_LABELS,
  REQUEST_PRIORITY_COLORS,
  CHANGE_TYPE_LABELS,
  CHANGE_TYPE_COLORS,
} from '@/data/mock-edu-org-resources-v2';
import type {
  Resource,
  ResourcePack,
  Template,
  SOP,
  PolicyShortcut,
  RoleKit,
  ResourceRequest,
  ChangelogEntry,
  AdminCategory,
  DepartmentScope,
  ResourceAudience,
} from '@/data/mock-edu-org-resources-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.education;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'library', label: 'Library' },
  { id: 'packs', label: 'Packs' },
  { id: 'templates', label: 'Templates' },
  { id: 'sops', label: 'SOPs / Playbooks' },
  { id: 'policies', label: 'Policies' },
  { id: 'rolekits', label: 'Role Kits' },
  { id: 'requests', label: 'Requests' },
  { id: 'updates', label: 'Updates' },
  { id: 'admin', label: 'Admin' },
];

const LIBRARY_FILTER_CHIPS: { id: DepartmentScope | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'academics', label: 'Academics' },
  { id: 'housing', label: 'Housing' },
  { id: 'finance', label: 'Finance' },
  { id: 'athletics', label: 'Athletics' },
  { id: 'admin', label: 'Admin' },
  { id: 'institution', label: 'Institution' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: EducationRoleLens;
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
  data: ReturnType<typeof getEduResourcesData>;
  role: EducationRoleLens;
}) {
  const pinnedResources = data.resources.filter((r) => r.pinned);
  const recentChanges = data.changelog.slice(0, 5);
  const publishedCount = data.resources.filter((r) => r.status === 'canonical').length;
  const draftCount = data.resources.filter((r) => r.status === 'draft').length;
  const newRequests = data.requests.filter((r) => r.status === 'new').length;

  // Find the role kit matching the current user role
  const roleKitForUser = useMemo(() => {
    if (isPresident(role)) return data.roleKits.find((k) => k.type === 'admissions_counselor') || data.roleKits[0]; // president-level sees top kit
    if (isDeanLevel(role)) return data.roleKits.find((k) => k.type === 'registrar') || data.roleKits[1];
    if (isFacultyLevel(role)) return data.roleKits.find((k) => k.type === 'faculty') || data.roleKits[4];
    if (isStudent(role)) return data.roleKits.find((k) => k.type === 'faculty') || data.roleKits[4]; // students see faculty kit preview
    return data.roleKits[0];
  }, [role, data.roleKits]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Quick Stats Strip */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tileStrip}
      >
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: ACCENT }]}>{data.resources.length}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Resources</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#22C55E' }]}>{publishedCount}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Published</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#F59E0B' }]}>{draftCount}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Drafts</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: ACCENT }]}>{data.sops.length}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Active SOPs</ThemedText>
        </View>
        <View style={[s.tileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.tileValue, { color: '#EF4444' }]}>{newRequests}</ThemedText>
          <ThemedText style={[s.tileLabel, { color: colors.textSecondary }]}>Open Requests</ThemedText>
        </View>
      </ScrollView>

      {/* Start Here — Pinned Resources */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Start Here</ThemedText>

      {pinnedResources.map((item) => {
        const deptColor = DEPARTMENT_SCOPE_COLORS[item.department] || '#A1A1AA';
        const typeColor = RESOURCE_TYPE_COLORS[item.type] || '#A1A1AA';
        return (
          <View
            key={item.id}
            style={[s.startCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.pinnedIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name="pin.fill" size={14} color={typeColor} />
            </View>
            <View style={s.startCardTextCol}>
              <ThemedText style={[s.startCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.startCardBadgeRow}>
                <StatusBadge label={RESOURCE_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
                <StatusBadge label={DEPARTMENT_SCOPE_LABELS[item.department].toUpperCase()} color={deptColor} />
              </View>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
        );
      })}

      {/* Role Kit Preview */}
      {roleKitForUser && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Your Role Kit
          </ThemedText>
          <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.sectionCardHeader}>
              <IconSymbol name="person.text.rectangle.fill" size={16} color={accentColor} />
              <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>
                {roleKitForUser.label}
              </ThemedText>
            </View>
            <View style={s.summaryRow}>
              <View style={s.summaryItem}>
                <ThemedText style={[s.summaryValue, { color: colors.text }]}>
                  {roleKitForUser.policies.length}
                </ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Policies</ThemedText>
              </View>
              <View style={s.summaryItem}>
                <ThemedText style={[s.summaryValue, { color: colors.text }]}>
                  {roleKitForUser.sops.length}
                </ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>SOPs</ThemedText>
              </View>
              <View style={s.summaryItem}>
                <ThemedText style={[s.summaryValue, { color: colors.text }]}>
                  {roleKitForUser.templates.length}
                </ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Templates</ThemedText>
              </View>
              <View style={s.summaryItem}>
                <ThemedText style={[s.summaryValue, { color: colors.text }]}>
                  {roleKitForUser.emergencyActions.length}
                </ThemedText>
                <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Emergency</ThemedText>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Recently Updated */}
      {isFacultyLevel(role) && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Recently Updated
          </ThemedText>
          {recentChanges.map((entry) => {
            const changeColor = CHANGE_TYPE_COLORS[entry.type];
            return (
              <View
                key={entry.id}
                style={[s.activityRow, { borderBottomColor: colors.border }]}
              >
                <View style={[s.activityDot, { backgroundColor: changeColor }]} />
                <View style={s.activityTextCol}>
                  <ThemedText style={[s.activityTitle, { color: colors.text }]} numberOfLines={1}>
                    {entry.resourceTitle}
                  </ThemedText>
                  <ThemedText style={[s.activityMeta, { color: colors.textTertiary }]}>
                    {entry.actor} — {formatDate(entry.date)}
                  </ThemedText>
                </View>
                <StatusBadge label={CHANGE_TYPE_LABELS[entry.type].toUpperCase()} color={changeColor} />
              </View>
            );
          })}
        </>
      )}

      {/* Missing / Needed Flags */}
      {isDeanLevel(role) && newRequests > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Missing / Needed
          </ThemedText>
          <View style={[s.alertCard, { backgroundColor: '#F59E0B10', borderColor: '#F59E0B30' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#F59E0B" />
            <View style={s.alertTextCol}>
              <ThemedText style={[s.alertTitle, { color: colors.text }]}>
                {newRequests} New Resource Requests
              </ThemedText>
              <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]}>
                Departments have identified resource gaps that need attention
              </ThemedText>
            </View>
          </View>

          {data.requests
            .filter((r) => r.status === 'new')
            .slice(0, 3)
            .map((req) => {
              const priorityColor = REQUEST_PRIORITY_COLORS[req.priority];
              return (
                <View
                  key={req.id}
                  style={[s.missingRow, { borderBottomColor: colors.border }]}
                >
                  <View style={[s.missingDot, { backgroundColor: priorityColor }]} />
                  <View style={s.missingTextCol}>
                    <ThemedText style={[s.missingTitle, { color: colors.text }]} numberOfLines={1}>
                      {req.title}
                    </ThemedText>
                    <ThemedText style={[s.missingMeta, { color: colors.textTertiary }]}>
                      {req.requestedBy} — {REQUEST_PRIORITY_LABELS[req.priority]}
                    </ThemedText>
                  </View>
                </View>
              );
            })}
        </>
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
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{data.sops.length}</ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>SOPs</ThemedText>
          </View>
          <View style={s.summaryItem}>
            <ThemedText style={[s.summaryValue, { color: colors.text }]}>{data.roleKits.length}</ThemedText>
            <ThemedText style={[s.summaryLabel, { color: colors.textSecondary }]}>Role Kits</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
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
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  resources: Resource[];
  filterTag: DepartmentScope | 'all';
  onFilterChange: (tag: DepartmentScope | 'all') => void;
  onSelectResource: (resource: Resource) => void;
  role: EducationRoleLens;
}) {
  const filtered = useMemo(() => {
    let list = resources;
    // Student (E11): filter to only 'students' or 'public' audience resources
    if (isStudent(role)) {
      list = list.filter((r) => r.audience === 'students' || r.audience === 'public');
    }
    if (filterTag === 'all') return list;
    return list.filter((r) => r.department === filterTag);
  }, [resources, filterTag, role]);

  const renderItem = useCallback(
    ({ item }: { item: Resource }) => {
      const statusColor = RESOURCE_STATUS_COLORS[item.status];
      const deptColor = DEPARTMENT_SCOPE_COLORS[item.department] || '#A1A1AA';
      const typeColor = RESOURCE_TYPE_COLORS[item.type] || '#A1A1AA';
      const audienceColor = RESOURCE_AUDIENCE_COLORS[item.audience] || '#A1A1AA';
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
            <View style={[s.resourceIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name="doc.text.fill" size={18} color={typeColor} />
            </View>
            <View style={s.resourceNameCol}>
              <ThemedText style={[s.resourceName, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <View style={s.resourceBadgeRow}>
                <StatusBadge label={RESOURCE_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
                <StatusBadge label={RESOURCE_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
                <StatusBadge label={RESOURCE_AUDIENCE_LABELS[item.audience].toUpperCase()} color={audienceColor} />
              </View>
            </View>
          </View>

          {/* Department Tag */}
          <View style={s.deptTagRow}>
            <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
              <ThemedText style={[s.deptChipText, { color: deptColor }]}>
                {DEPARTMENT_SCOPE_LABELS[item.department]}
              </ThemedText>
            </View>
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
      const audienceColor = PACK_AUDIENCE_COLORS[item.audience] || '#A1A1AA';
      const deptColor = DEPARTMENT_SCOPE_COLORS[item.department] || '#A1A1AA';
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
            </View>
            <StatusBadge label={PACK_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
          </View>

          <View style={s.packBadgeStrip}>
            <StatusBadge label={PACK_AUDIENCE_LABELS[item.audience].toUpperCase()} color={audienceColor} />
            <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
              <ThemedText style={[s.deptChipText, { color: deptColor }]}>
                {DEPARTMENT_SCOPE_LABELS[item.department]}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[s.packDescription, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>

          <View style={s.packMetaRow}>
            <ThemedText style={[s.packMetaText, { color: colors.textTertiary }]}>
              {item.itemCount} resources
            </ThemedText>
            <ThemedText style={[s.packMetaText, { color: colors.textTertiary }]}>
              Updated {formatDate(item.lastUpdated)}
            </ThemedText>
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
// TEMPLATES SUB-TAB
// =============================================================================

function TemplatesTab({
  colors,
  accentColor,
  templates,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  templates: Template[];
}) {
  const renderItem = useCallback(
    ({ item }: { item: Template }) => {
      const deptColor = DEPARTMENT_SCOPE_COLORS[item.department] || '#A1A1AA';
      return (
        <View style={[s.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.templateHeader}>
            <IconSymbol name="doc.on.doc.fill" size={18} color={accentColor} />
            <View style={s.templateNameCol}>
              <ThemedText style={[s.templateName, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.templateBadgeRow}>
                <StatusBadge label={item.category.toUpperCase()} color={accentColor} />
                <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
                  <ThemedText style={[s.deptChipText, { color: deptColor }]}>
                    {DEPARTMENT_SCOPE_LABELS[item.department]}
                  </ThemedText>
                </View>
                {item.outdated && (
                  <StatusBadge label="OUTDATED" color="#F59E0B" />
                )}
              </View>
            </View>
          </View>

          <View style={[s.templateMetaRow, { borderTopColor: colors.border }]}>
            <View style={s.templateMetaItem}>
              <ThemedText style={[s.templateMetaValue, { color: colors.text }]}>v{item.version}</ThemedText>
              <ThemedText style={[s.templateMetaLabel, { color: colors.textTertiary }]}>Version</ThemedText>
            </View>
            <View style={s.templateMetaItem}>
              <ThemedText style={[s.templateMetaValue, { color: colors.text }]}>{formatDate(item.lastUpdated)}</ThemedText>
              <ThemedText style={[s.templateMetaLabel, { color: colors.textTertiary }]}>Updated</ThemedText>
            </View>
            <View style={s.templateMetaItem}>
              <Pressable
                style={[s.copyButton, { backgroundColor: accentColor + '18' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <ThemedText style={[s.copyButtonText, { color: accentColor }]}>Make a copy</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={templates}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="doc.on.doc.fill" label="No templates available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SOPs / PLAYBOOKS SUB-TAB
// =============================================================================

function SOPsTab({
  colors,
  accentColor,
  sops,
  onSelectSOP,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  sops: SOP[];
  onSelectSOP: (sop: SOP) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: SOP }) => {
      const statusColor = SOP_STATUS_COLORS[item.status];
      const deptColor = DEPARTMENT_SCOPE_COLORS[item.department] || '#A1A1AA';
      return (
        <Pressable
          style={[s.sopCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectSOP(item);
          }}
        >
          <View style={s.sopHeader}>
            <View style={s.sopNameCol}>
              <ThemedText style={[s.sopName, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={s.sopBadgeRow}>
                <StatusBadge label={SOP_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
                <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
                  <ThemedText style={[s.deptChipText, { color: deptColor }]}>
                    {DEPARTMENT_SCOPE_LABELS[item.department]}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <View style={s.sopMetaRow}>
            <View style={s.sopMetaItem}>
              <IconSymbol name="list.number" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sopMetaText, { color: colors.textTertiary }]}>
                {item.stepsCount} steps
              </ThemedText>
            </View>
            <View style={s.sopMetaItem}>
              <IconSymbol name="clock.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.sopMetaText, { color: colors.textTertiary }]}>
                ~{item.estimatedMinutes} min
              </ThemedText>
            </View>
          </View>

          {/* Failure Points preview */}
          {item.failurePoints.length > 0 && (
            <View style={s.sopFailurePreview}>
              <ThemedText style={[s.sopFailureLabel, { color: '#EF4444' }]}>
                {item.failurePoints.length} failure points identified
              </ThemedText>
            </View>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, onSelectSOP],
  );

  return (
    <FlatList
      data={sops}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="list.bullet.clipboard.fill" label="No SOPs available" colors={colors} />
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
  policies: PolicyShortcut[];
}) {
  // Sort by referenced count (most referenced first)
  const sorted = useMemo(() => {
    return [...policies].sort((a, b) => b.referencedCount - a.referencedCount);
  }, [policies]);

  // Recently updated (last 30 days)
  const recentlyUpdated = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return sorted.filter((p) => new Date(p.lastUpdated) >= thirtyDaysAgo);
  }, [sorted]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Recently Updated Alerts */}
      {recentlyUpdated.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Recently Updated</ThemedText>
          <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
            Policies updated in the last 30 days
          </ThemedText>
          {recentlyUpdated.slice(0, 3).map((policy) => {
            const deptColor = DEPARTMENT_SCOPE_COLORS[policy.department] || '#A1A1AA';
            return (
              <View
                key={`recent-${policy.id}`}
                style={[s.alertCard, { backgroundColor: `${ACCENT}10`, borderColor: `${ACCENT}30` }]}
              >
                <IconSymbol name="arrow.triangle.2.circlepath" size={14} color={ACCENT} />
                <View style={s.alertTextCol}>
                  <ThemedText style={[s.alertTitle, { color: colors.text }]} numberOfLines={1}>
                    {policy.title}
                  </ThemedText>
                  <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]}>
                    Updated {formatDate(policy.lastUpdated)}
                  </ThemedText>
                </View>
              </View>
            );
          })}
        </>
      )}

      {/* Policy Index */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Policy Index
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by most referenced
      </ThemedText>

      {sorted.map((policy) => {
        const deptColor = DEPARTMENT_SCOPE_COLORS[policy.department] || '#A1A1AA';
        return (
          <View
            key={policy.id}
            style={[s.policyCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.policyHeader}>
              <View style={s.policyNameCol}>
                <ThemedText style={[s.policyName, { color: colors.text }]} numberOfLines={1}>
                  {policy.title}
                </ThemedText>
                <View style={s.policyBadgeRow}>
                  <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
                    <ThemedText style={[s.deptChipText, { color: deptColor }]}>
                      {DEPARTMENT_SCOPE_LABELS[policy.department]}
                    </ThemedText>
                  </View>
                </View>
              </View>
              <View style={s.policyRefCount}>
                <ThemedText style={[s.policyRefValue, { color: accentColor }]}>
                  {policy.referencedCount}
                </ThemedText>
                <ThemedText style={[s.policyRefLabel, { color: colors.textTertiary }]}>refs</ThemedText>
              </View>
            </View>

            <View style={s.policyMeta}>
              <ThemedText style={[s.policyMetaText, { color: colors.textTertiary }]}>
                Updated {formatDate(policy.lastUpdated)}
              </ThemedText>
            </View>
          </View>
        );
      })}

      {sorted.length === 0 && (
        <EmptyState icon="doc.text.fill" label="No policies found" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ROLE KITS SUB-TAB
// =============================================================================

function RoleKitsTab({
  colors,
  accentColor,
  kits,
  onSelectKit,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  kits: RoleKit[];
  onSelectKit: (kit: RoleKit) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: RoleKit }) => {
      const typeColor = ROLE_KIT_TYPE_COLORS[item.type] || '#A1A1AA';
      return (
        <Pressable
          style={[s.kitCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectKit(item);
          }}
        >
          <View style={s.kitHeader}>
            <View style={[s.kitIconCircle, { backgroundColor: typeColor + '18' }]}>
              <IconSymbol name="person.text.rectangle.fill" size={18} color={typeColor} />
            </View>
            <View style={s.kitNameCol}>
              <ThemedText style={[s.kitName, { color: colors.text }]} numberOfLines={1}>
                {item.label}
              </ThemedText>
              <StatusBadge label={ROLE_KIT_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
            </View>
          </View>

          <View style={s.kitStatsGrid}>
            <View style={s.kitStatItem}>
              <ThemedText style={[s.kitStatValue, { color: ACCENT }]}>
                {item.policies.length}
              </ThemedText>
              <ThemedText style={[s.kitStatLabel, { color: colors.textSecondary }]}>
                Must-Know Policies
              </ThemedText>
            </View>
            <View style={s.kitStatItem}>
              <ThemedText style={[s.kitStatValue, { color: ACCENT }]}>
                {item.sops.length}
              </ThemedText>
              <ThemedText style={[s.kitStatLabel, { color: colors.textSecondary }]}>
                Core SOPs
              </ThemedText>
            </View>
            <View style={s.kitStatItem}>
              <ThemedText style={[s.kitStatValue, { color: '#22C55E' }]}>
                {item.templates.length}
              </ThemedText>
              <ThemedText style={[s.kitStatLabel, { color: colors.textSecondary }]}>
                Templates
              </ThemedText>
            </View>
            <View style={s.kitStatItem}>
              <ThemedText style={[s.kitStatValue, { color: '#EF4444' }]}>
                {item.emergencyActions.length}
              </ThemedText>
              <ThemedText style={[s.kitStatLabel, { color: colors.textSecondary }]}>
                Emergency
              </ThemedText>
            </View>
            <View style={s.kitStatItem}>
              <ThemedText style={[s.kitStatValue, { color: '#F59E0B' }]}>
                {item.contacts.length}
              </ThemedText>
              <ThemedText style={[s.kitStatLabel, { color: colors.textSecondary }]}>
                Contacts
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectKit],
  );

  return (
    <FlatList
      data={kits}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.text.rectangle.fill" label="No role kits available" colors={colors} />
      }
    />
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
      const typeColor = REQUEST_TYPE_COLORS[item.type] || '#A1A1AA';
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
              <StatusBadge label={REQUEST_TYPE_LABELS[item.type].toUpperCase()} color={typeColor} />
              <StatusBadge label={REQUEST_PRIORITY_LABELS[item.priority].toUpperCase()} color={priorityColor} />
            </View>

            <View style={s.requestFooter}>
              <View style={s.requestMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.requestMetaText, { color: colors.textTertiary }]}>
                  {item.requestedBy}
                </ThemedText>
              </View>
              <View style={s.requestMetaItem}>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.requestMetaText, { color: colors.textTertiary }]}>
                  {formatDate(item.requestedDate)}
                </ThemedText>
              </View>
              {item.dueDate && (
                <View style={s.requestMetaItem}>
                  <IconSymbol name="flag.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.requestMetaText, { color: colors.textTertiary }]}>
                    Due {formatDate(item.dueDate)}
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
// UPDATES / CHANGELOG SUB-TAB
// =============================================================================

function UpdatesTab({
  colors,
  accentColor,
  changelog,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  changelog: ChangelogEntry[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Changelog</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Resource changes, publications, and retirements
      </ThemedText>

      {changelog.map((entry, index) => {
        const changeColor = CHANGE_TYPE_COLORS[entry.type];
        return (
          <View key={entry.id} style={s.auditEntry}>
            {/* Timeline */}
            <View style={s.auditTimeline}>
              <View style={[s.auditDot, { backgroundColor: changeColor }]} />
              {index < changelog.length - 1 && (
                <View style={[s.auditLine, { backgroundColor: colors.border }]} />
              )}
            </View>

            {/* Content */}
            <View style={[s.auditContent, { borderBottomColor: colors.border }]}>
              <View style={s.auditContentHeader}>
                <ThemedText style={[s.auditResourceTitle, { color: colors.text }]} numberOfLines={1}>
                  {entry.resourceTitle}
                </ThemedText>
                <StatusBadge label={CHANGE_TYPE_LABELS[entry.type].toUpperCase()} color={changeColor} />
              </View>
              <ThemedText style={[s.auditDetails, { color: colors.textSecondary }]} numberOfLines={2}>
                {entry.notes}
              </ThemedText>
              <View style={s.auditMetaRow}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                  {entry.actor}
                </ThemedText>
                <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.auditMetaText, { color: colors.textTertiary }]}>
                  {formatDate(entry.date)}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {changelog.length === 0 && (
        <EmptyState icon="clock.fill" label="No changelog entries available" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ADMIN SUB-TAB (E1 only)
// =============================================================================

function AdminTab({
  colors,
  accentColor,
  categories,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  categories: AdminCategory[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Category Taxonomy */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Category Taxonomy</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Resource categories and their current counts
      </ThemedText>

      {categories.map((cat) => (
        <View
          key={cat.id}
          style={[s.adminCatCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.adminCatHeader}>
            <ThemedText style={[s.adminCatName, { color: colors.text }]} numberOfLines={1}>
              {cat.name}
            </ThemedText>
            <View style={[s.adminCatCountBadge, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[s.adminCatCountText, { color: accentColor }]}>
                {cat.resourceCount}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[s.adminCatDesc, { color: colors.textSecondary }]} numberOfLines={2}>
            {cat.description}
          </ThemedText>
        </View>
      ))}

      {/* Permission Packages */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Permission Packages
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Access level definitions for resource visibility
      </ThemedText>

      {(['staff', 'students', 'public', 'restricted'] as ResourceAudience[]).map((level) => (
        <View
          key={level}
          style={[s.permissionRow, { borderBottomColor: colors.border }]}
        >
          <View style={[s.permissionDot, { backgroundColor: RESOURCE_AUDIENCE_COLORS[level] }]} />
          <View style={s.permissionTextCol}>
            <ThemedText style={[s.permissionLabel, { color: colors.text }]}>
              {RESOURCE_AUDIENCE_LABELS[level]}
            </ThemedText>
            <ThemedText style={[s.permissionDesc, { color: colors.textSecondary }]}>
              {getAudienceDescription(level)}
            </ThemedText>
          </View>
        </View>
      ))}

      {/* Publishing Workflow */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Publishing Workflow
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Resource lifecycle stages
      </ThemedText>

      {(['draft', 'canonical', 'archived'] as const).map((status) => (
        <View
          key={status}
          style={[s.workflowRow, { borderBottomColor: colors.border }]}
        >
          <View style={[s.workflowDot, { backgroundColor: RESOURCE_STATUS_COLORS[status] }]} />
          <View style={s.workflowTextCol}>
            <ThemedText style={[s.workflowLabel, { color: colors.text }]}>
              {RESOURCE_STATUS_LABELS[status]}
            </ThemedText>
            <ThemedText style={[s.workflowDesc, { color: colors.textSecondary }]}>
              {getStatusDescription(status)}
            </ThemedText>
          </View>
        </View>
      ))}

      {/* Audit Log Placeholder */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Audit Log
      </ThemedText>
      <View style={[s.adminPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="clock.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.adminPlaceholderText, { color: colors.textSecondary }]}>
          Full audit log coming soon. View recent changes in the Updates tab.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

function getAudienceDescription(level: ResourceAudience): string {
  const map: Record<ResourceAudience, string> = {
    staff: 'Visible to all faculty, staff, and administrators',
    students: 'Visible to enrolled students and above',
    public: 'Visible to everyone, including visitors',
    restricted: 'Visible only to specific roles with explicit access',
  };
  return map[level] || '';
}

function getStatusDescription(status: string): string {
  const map: Record<string, string> = {
    draft: 'Resource is being authored and is not yet visible to its audience',
    canonical: 'Resource is approved, published, and the authoritative version',
    archived: 'Resource has been retired and is no longer actively maintained',
  };
  return map[status] || '';
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
  resource: Resource | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!resource) return null;

  const statusColor = RESOURCE_STATUS_COLORS[resource.status];
  const typeColor = RESOURCE_TYPE_COLORS[resource.type] || '#A1A1AA';
  const deptColor = DEPARTMENT_SCOPE_COLORS[resource.department] || '#A1A1AA';
  const audienceColor = RESOURCE_AUDIENCE_COLORS[resource.audience] || '#A1A1AA';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={resource.title} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={RESOURCE_TYPE_LABELS[resource.type].toUpperCase()} color={typeColor} />
        <StatusBadge label={RESOURCE_STATUS_LABELS[resource.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={RESOURCE_AUDIENCE_LABELS[resource.audience].toUpperCase()} color={audienceColor} />
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
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {DEPARTMENT_SCOPE_LABELS[resource.department]}
            </ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Department</ThemedText>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Summary</ThemedText>
        <ThemedText style={[s.sheetDescriptionText, { color: colors.textSecondary }]}>
          {resource.summary}
        </ThemedText>
      </View>

      {/* Department */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Department</ThemedText>
        <View style={s.sheetTagsGrid}>
          <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
            <ThemedText style={[s.deptChipText, { color: deptColor }]}>
              {DEPARTMENT_SCOPE_LABELS[resource.department]}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Version History Placeholder */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Version History</ThemedText>
        <ThemedText style={[s.sheetMetaText, { color: colors.textSecondary }]}>
          Current: v{resource.version} — Updated {formatDate(resource.lastUpdated)}
        </ThemedText>
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
// PACK DETAIL BOTTOM SHEET
// =============================================================================

function PackDetailSheet({
  visible,
  onClose,
  pack,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  pack: ResourcePack | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!pack) return null;

  const statusColor = PACK_STATUS_COLORS[pack.status];
  const audienceColor = PACK_AUDIENCE_COLORS[pack.audience] || '#A1A1AA';
  const deptColor = DEPARTMENT_SCOPE_COLORS[pack.department] || '#A1A1AA';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={pack.name} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={PACK_STATUS_LABELS[pack.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={PACK_AUDIENCE_LABELS[pack.audience].toUpperCase()} color={audienceColor} />
        <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
          <ThemedText style={[s.deptChipText, { color: deptColor }]}>
            {DEPARTMENT_SCOPE_LABELS[pack.department]}
          </ThemedText>
        </View>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetDescriptionText, { color: colors.textSecondary }]}>
          {pack.description}
        </ThemedText>
      </View>

      {/* Table of Contents */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Contents ({pack.items.length})
        </ThemedText>
        {pack.items.map((item) => {
          const itemTypeColor = RESOURCE_TYPE_COLORS[item.type] || '#A1A1AA';
          return (
            <View key={item.resourceId} style={s.sheetListRow}>
              <View style={[s.sheetListDot, { backgroundColor: itemTypeColor }]} />
              <View style={s.sheetListTextCol}>
                <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <View style={s.sheetListBadgeRow}>
                  <StatusBadge label={RESOURCE_TYPE_LABELS[item.type].toUpperCase()} color={itemTypeColor} />
                  {item.required ? (
                    <StatusBadge label="REQUIRED" color="#EF4444" />
                  ) : (
                    <StatusBadge label="OPTIONAL" color="#A1A1AA" />
                  )}
                </View>
              </View>
            </View>
          );
        })}
        {pack.items.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No items in this pack
          </ThemedText>
        )}
      </View>

      {/* Export Options */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Export</ThemedText>
        <View style={s.sheetExportRow}>
          <Pressable
            style={[s.sheetExportButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="doc.fill" size={14} color={accentColor} />
            <ThemedText style={[s.sheetExportText, { color: colors.text }]}>PDF</ThemedText>
          </Pressable>
          <Pressable
            style={[s.sheetExportButton, { backgroundColor: colors.background, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="square.and.arrow.up" size={14} color={accentColor} />
            <ThemedText style={[s.sheetExportText, { color: colors.text }]}>Share</ThemedText>
          </Pressable>
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
// SOP DETAIL BOTTOM SHEET
// =============================================================================

function SOPDetailSheet({
  visible,
  onClose,
  sop,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  sop: SOP | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!sop) return null;

  const statusColor = SOP_STATUS_COLORS[sop.status];
  const deptColor = DEPARTMENT_SCOPE_COLORS[sop.department] || '#A1A1AA';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={sop.title} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={SOP_STATUS_LABELS[sop.status].toUpperCase()} color={statusColor} />
        <View style={[s.deptChip, { backgroundColor: deptColor + '18' }]}>
          <ThemedText style={[s.deptChipText, { color: deptColor }]}>
            {DEPARTMENT_SCOPE_LABELS[sop.department]}
          </ThemedText>
        </View>
        <StatusBadge label={`${sop.stepsCount} STEPS`} color={accentColor} />
        <StatusBadge label={`~${sop.estimatedMinutes} MIN`} color="#A1A1AA" />
      </View>

      {/* Preconditions */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Preconditions</ThemedText>
        {sop.preconditions.map((pre, idx) => (
          <View key={idx} style={s.sheetChecklistRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
            <ThemedText style={[s.sheetChecklistText, { color: colors.textSecondary }]}>
              {pre}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Step-by-Step Checklist */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Steps ({sop.steps.length})
        </ThemedText>
        {sop.steps.map((step) => (
          <View key={step.order} style={s.sheetStepRow}>
            <View style={[s.sheetStepNumber, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[s.sheetStepNumberText, { color: accentColor }]}>
                {step.order}
              </ThemedText>
            </View>
            <View style={s.sheetStepTextCol}>
              <ThemedText style={[s.sheetStepTitle, { color: colors.text }]}>
                {step.title}
              </ThemedText>
              <ThemedText style={[s.sheetStepDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                {step.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Failure Points */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Failure Points</ThemedText>
        {sop.failurePoints.map((fp, idx) => (
          <View key={idx} style={s.sheetChecklistRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
            <ThemedText style={[s.sheetChecklistText, { color: colors.textSecondary }]}>
              {fp}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Escalation Path */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Escalation Path</ThemedText>
        <ThemedText style={[s.sheetDescriptionText, { color: colors.textSecondary }]}>
          {sop.escalationPath}
        </ThemedText>
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
// ROLE KIT DETAIL BOTTOM SHEET
// =============================================================================

function RoleKitDetailSheet({
  visible,
  onClose,
  kit,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  kit: RoleKit | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!kit) return null;

  const typeColor = ROLE_KIT_TYPE_COLORS[kit.type] || '#A1A1AA';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={kit.label} useModal>
      {/* Status Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={ROLE_KIT_TYPE_LABELS[kit.type].toUpperCase()} color={typeColor} />
      </View>

      {/* Policies */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Must-Know Policies ({kit.policies.length})
        </ThemedText>
        {kit.policies.map((policy, idx) => (
          <View key={idx} style={s.sheetListRow}>
            <IconSymbol name="doc.text.fill" size={14} color={ACCENT} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {policy}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* SOPs */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Core SOPs ({kit.sops.length})
        </ThemedText>
        {kit.sops.map((sopName, idx) => (
          <View key={idx} style={s.sheetListRow}>
            <IconSymbol name="list.bullet.clipboard.fill" size={14} color={ACCENT} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {sopName}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Templates */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Templates ({kit.templates.length})
        </ThemedText>
        {kit.templates.map((tmpl, idx) => (
          <View key={idx} style={s.sheetListRow}>
            <IconSymbol name="doc.on.doc.fill" size={14} color="#22C55E" />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {tmpl}
              </ThemedText>
            </View>
          </View>
        ))}
        {kit.templates.length === 0 && (
          <ThemedText style={[s.sheetEmptyText, { color: colors.textSecondary }]}>
            No templates in this kit
          </ThemedText>
        )}
      </View>

      {/* Emergency Actions */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Emergency Actions ({kit.emergencyActions.length})
        </ThemedText>
        {kit.emergencyActions.map((action, idx) => (
          <View key={idx} style={s.sheetChecklistRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
            <ThemedText style={[s.sheetChecklistText, { color: colors.textSecondary }]}>
              {action}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Contacts */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Key Contacts ({kit.contacts.length})
        </ThemedText>
        {kit.contacts.map((contact, idx) => (
          <View key={idx} style={s.sheetListRow}>
            <IconSymbol name="person.fill" size={14} color="#F59E0B" />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={1}>
                {contact}
              </ThemedText>
            </View>
          </View>
        ))}
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

export function EduOrgResourcesV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: External (E12/E13) locked ===
  if (!isEnrolled(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Resources</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          This section is restricted. Contact the institution for access.
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [selectedPack, setSelectedPack] = useState<ResourcePack | null>(null);
  const [selectedSOP, setSelectedSOP] = useState<SOP | null>(null);
  const [selectedKit, setSelectedKit] = useState<RoleKit | null>(null);
  const [resourceSheetVisible, setResourceSheetVisible] = useState(false);
  const [packSheetVisible, setPackSheetVisible] = useState(false);
  const [sopSheetVisible, setSOPSheetVisible] = useState(false);
  const [kitSheetVisible, setKitSheetVisible] = useState(false);
  const [filterTag, setFilterTag] = useState<DepartmentScope | 'all'>('all');

  // === Data ===
  const data = useMemo(() => getEduResourcesData(), []);

  // === Callbacks ===
  const handleSelectResource = useCallback((resource: Resource) => {
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

  const handleSelectSOP = useCallback((sop: SOP) => {
    setSelectedSOP(sop);
    setSOPSheetVisible(true);
  }, []);

  const handleCloseSOPSheet = useCallback(() => {
    setSOPSheetVisible(false);
  }, []);

  const handleSelectKit = useCallback((kit: RoleKit) => {
    setSelectedKit(kit);
    setKitSheetVisible(true);
  }, []);

  const handleCloseKitSheet = useCallback(() => {
    setKitSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS; // E1/E2: full 10 tabs
    if (isFacultyLevel(role)) {
      // E3 (Faculty/Staff): all except Admin
      return SUB_TABS.filter((t) => t.id !== 'admin');
    }
    // E4 (Student): Overview + Library (student-facing only) + Role Kits
    return SUB_TABS.filter((t) =>
      t.id === 'overview' ||
      t.id === 'library' ||
      t.id === 'rolekits'
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
            role={role}
          />
        );
      case 'packs':
        if (!isFacultyLevel(role)) return null;
        return (
          <PacksTab
            colors={colors}
            accentColor={accentColor}
            packs={data.packs}
            onSelectPack={handleSelectPack}
          />
        );
      case 'templates':
        if (!isFacultyLevel(role)) return null;
        return (
          <TemplatesTab
            colors={colors}
            accentColor={accentColor}
            templates={data.templates}
          />
        );
      case 'sops':
        if (!isFacultyLevel(role)) return null;
        return (
          <SOPsTab
            colors={colors}
            accentColor={accentColor}
            sops={data.sops}
            onSelectSOP={handleSelectSOP}
          />
        );
      case 'policies':
        if (!isFacultyLevel(role)) return null;
        return (
          <PoliciesTab
            colors={colors}
            accentColor={accentColor}
            policies={data.policyShortcuts}
          />
        );
      case 'rolekits':
        return (
          <RoleKitsTab
            colors={colors}
            accentColor={accentColor}
            kits={data.roleKits}
            onSelectKit={handleSelectKit}
          />
        );
      case 'requests':
        if (!isFacultyLevel(role)) return null;
        return (
          <RequestsTab
            colors={colors}
            accentColor={accentColor}
            requests={data.requests}
          />
        );
      case 'updates':
        if (!isFacultyLevel(role)) return null;
        return (
          <UpdatesTab
            colors={colors}
            accentColor={accentColor}
            changelog={data.changelog}
          />
        );
      case 'admin':
        if (!isPresident(role) && !isDeanLevel(role)) return null;
        return (
          <AdminTab
            colors={colors}
            accentColor={accentColor}
            categories={data.adminCategories}
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
        colors={colors}
        accentColor={accentColor}
      />

      {/* SOP Detail Bottom Sheet */}
      <SOPDetailSheet
        visible={sopSheetVisible}
        onClose={handleCloseSOPSheet}
        sop={selectedSOP}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Role Kit Detail Bottom Sheet */}
      <RoleKitDetailSheet
        visible={kitSheetVisible}
        onClose={handleCloseKitSheet}
        kit={selectedKit}
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

  // -- Pinned Icon Circle --
  pinnedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
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
  startCardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
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

  // -- Missing / Needed Rows --
  missingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  missingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  missingTextCol: {
    flex: 1,
  },
  missingTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  missingMeta: {
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
  deptTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  deptChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  deptChipText: {
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
  packBadgeStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  packDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  packMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  packMetaText: {
    fontSize: 11,
  },

  // -- Template Card --
  templateCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  templateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  templateNameCol: {
    flex: 1,
  },
  templateName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  templateMetaRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  templateMetaItem: {
    flex: 1,
    alignItems: 'center',
  },
  templateMetaValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  templateMetaLabel: {
    fontSize: 10,
    marginTop: 1,
  },
  copyButton: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  copyButtonText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // -- SOP Card --
  sopCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sopHeader: {
    marginBottom: Spacing.sm,
  },
  sopNameCol: {
    flex: 1,
  },
  sopName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  sopBadgeRow: {
    flexDirection: 'row',
    gap: 4,
  },
  sopMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sopMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sopMetaText: {
    fontSize: 11,
  },
  sopFailurePreview: {
    marginTop: 4,
  },
  sopFailureLabel: {
    fontSize: 11,
    fontWeight: '600',
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
  policyRefCount: {
    alignItems: 'center',
  },
  policyRefValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  policyRefLabel: {
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  policyMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyMetaText: {
    fontSize: 11,
  },

  // -- Role Kit Card --
  kitCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  kitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kitIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kitNameCol: {
    flex: 1,
  },
  kitName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  kitStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kitStatItem: {
    width: '30%',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  kitStatValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kitStatLabel: {
    fontSize: 9,
    marginTop: 2,
    textAlign: 'center',
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

  // -- Audit Timeline (Updates) --
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

  // -- Admin Tab --
  adminCatCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  adminCatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminCatName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  adminCatCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  adminCatCountText: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  adminCatDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  permissionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  permissionTextCol: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  permissionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  workflowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  workflowDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  workflowTextCol: {
    flex: 1,
  },
  workflowLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  workflowDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  adminPlaceholder: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  adminPlaceholderText: {
    fontSize: 13,
    textAlign: 'center',
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
  sheetListDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
  sheetListBadgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 2,
  },
  sheetEmptyText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  sheetChecklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetChecklistText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  sheetStepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetStepNumberText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sheetStepTextCol: {
    flex: 1,
  },
  sheetStepTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sheetStepDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  sheetExportRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  sheetExportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetExportText: {
    fontSize: 13,
    fontWeight: '600',
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
