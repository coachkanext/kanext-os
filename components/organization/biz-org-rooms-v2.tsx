/**
 * Business Organization Rooms Tab — V2
 * Template-based room system with immutable receipts, decisions, artifacts,
 * members, and timeline events.
 *
 * Filter chips: All | Active | My Rooms | Board-visible | Investor-visible | Restricted | Needs Attention | by Type
 * View modes: Cards (default) | List (dense)
 * Room Detail Sheet: Overview | Work | Artifacts | Decisions | Receipts | People | Timeline
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette , MODE_ACCENT } from '@/constants/theme';
import { BizCard, BizSubTabBar, BizStatusChip, BizEmptyLock, statusVariant } from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import type { BizReceipt, CrossTabLink } from '@/data/biz-org-shared-types';
import { KANEXT_HOLDCO, KANEXT_OPSCO, SEEDED_ENTITY_NAMES } from '@/data/biz-org-shared-types';
import {
  getBizRoomsData,
  getActiveRooms,
  getArchivedRooms,
  getRoomById,
  ROOM_TEMPLATES,
  TEMPLATE_COLORS,
  TEMPLATE_LABELS,
  ROOM_STATUS_COLORS,
} from '@/data/mock-biz-org-rooms';
import type {
  BizRoom,
  RoomTemplate,
  RoomTemplateInfo,
  RoomMember,
  RoomArtifact,
  RoomDecision,
  RoomTimelineEvent,
} from '@/data/mock-biz-org-rooms';


const ACCENT = MODE_ACCENT.business;
const BP = BusinessPalette;

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

// =============================================================================
// CONSTANTS
// =============================================================================

// --- Filter chip definitions ---
const FILTER_CHIPS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'my_rooms', label: 'My Rooms' },
  { id: 'board', label: 'Board' },
  { id: 'investor', label: 'Investor' },
  { id: 'restricted', label: 'Restricted' },
  { id: 'needs_attention', label: 'Attention' },
  { id: 'by_type', label: 'by Type' },
] as const;

type FilterChipId = (typeof FILTER_CHIPS)[number]['id'];
type ViewMode = 'cards' | 'list';

const DETAIL_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'work', label: 'Work' },
  { id: 'artifacts', label: 'Artifacts' },
  { id: 'decisions', label: 'Decisions' },
  { id: 'receipts', label: 'Receipts' },
  { id: 'people', label: 'People' },
  { id: 'timeline', label: 'Timeline' },
];

type DetailTabId = 'overview' | 'work' | 'artifacts' | 'decisions' | 'receipts' | 'people' | 'timeline';

// =============================================================================
// HELPERS
// =============================================================================

function templateLabel(template: RoomTemplate): string {
  return TEMPLATE_LABELS[template] ?? template;
}

function templateColor(template: RoomTemplate): string {
  return TEMPLATE_COLORS[template] ?? BP.ash;
}

function statusLabel(status: BizRoom['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'paused': return 'Paused';
    case 'archived': return 'Archived';
  }
}

function artifactIcon(type: string): string {
  switch (type) {
    case 'spreadsheet': return 'tablecells.fill';
    case 'presentation': return 'rectangle.on.rectangle.angled';
    case 'document': return 'doc.text.fill';
    case 'video': return 'play.rectangle.fill';
    default: return 'doc.fill';
  }
}

function artifactIconColor(type: string): string {
  switch (type) {
    case 'spreadsheet': return '#22C55E';
    case 'presentation': return '#F59E0B';
    case 'document': return ACCENT;
    case 'video': return ACCENT;
    default: return BP.ash;
  }
}

function decisionStatusColor(status: RoomDecision['status']): string {
  switch (status) {
    case 'approved': return '#22C55E';
    case 'open': return ACCENT;
    case 'draft': return '#F59E0B';
    case 'rejected': return '#EF4444';
  }
}

function decisionStatusLabel(status: RoomDecision['status']): string {
  switch (status) {
    case 'approved': return 'Approved';
    case 'open': return 'Open';
    case 'draft': return 'Draft';
    case 'rejected': return 'Rejected';
  }
}

function receiptTypeIcon(type: BizReceipt['type']): string {
  switch (type) {
    case 'approval': return 'checkmark.seal.fill';
    case 'release': return 'arrow.up.right.circle.fill';
    case 'decision': return 'list.bullet.clipboard.fill';
    case 'signature': return 'signature';
    case 'transfer': return 'arrow.left.arrow.right.circle.fill';
    case 'creation': return 'plus.circle.fill';
    case 'amendment': return 'pencil.circle.fill';
    case 'compliance': return 'shield.lefthalf.filled';
    default: return 'doc.fill';
  }
}

function receiptTypeColor(type: BizReceipt['type']): string {
  switch (type) {
    case 'approval': return '#22C55E';
    case 'release': return ACCENT;
    case 'decision': return ACCENT;
    case 'signature': return '#F59E0B';
    case 'transfer': return ACCENT;
    case 'creation': return ACCENT;
    case 'amendment': return '#F59E0B';
    case 'compliance': return ACCENT;
    default: return BP.ash;
  }
}

function receiptTypeLabel(type: BizReceipt['type']): string {
  switch (type) {
    case 'approval': return 'Approval';
    case 'release': return 'Release';
    case 'decision': return 'Decision';
    case 'signature': return 'Signature';
    case 'transfer': return 'Transfer';
    case 'creation': return 'Creation';
    case 'amendment': return 'Amendment';
    case 'compliance': return 'Compliance';
    default: return type;
  }
}

// --- Visibility helpers ---
function visibilityLabel(v?: BizRoom['visibility']): string {
  switch (v) {
    case 'board': return 'Board';
    case 'investor': return 'Investor';
    case 'public': return 'Public';
    case 'internal':
    default:
      return 'Internal';
  }
}

function visibilityColor(v?: BizRoom['visibility']): string {
  switch (v) {
    case 'board': return ACCENT;
    case 'investor': return ACCENT;
    case 'public': return ACCENT;
    case 'internal':
    default:
      return BP.ash;
  }
}

// --- Filter logic ---
function applyFilter(rooms: BizRoom[], filter: FilterChipId): BizRoom[] {
  switch (filter) {
    case 'all':
      return rooms;
    case 'active':
      return rooms.filter((r) => r.status === 'active');
    case 'my_rooms':
      // TODO: filter by current user membership once auth identity is wired
      return rooms;
    case 'board':
      return rooms.filter((r) => r.visibility === 'board');
    case 'investor':
      return rooms.filter((r) => r.visibility === 'investor');
    case 'restricted':
      return rooms.filter((r) => r.visibility === 'internal');
    case 'needs_attention':
      return rooms.filter((r) => r.openItems > 0);
    case 'by_type':
      // When "by Type" is selected, return all — the caller groups by template
      return rooms;
    default:
      return rooms;
  }
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={st.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={BP.ash} />
      <ThemedText style={[st.emptyText, { color: BP.ash }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// TEMPLATE BADGE (colored pill with template name)
// =============================================================================

function TemplateBadge({ template }: { template: RoomTemplate }) {
  const color = templateColor(template);
  return (
    <View style={[st.templateBadge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[st.templateBadgeText, { color }]}>{templateLabel(template)}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ status }: { status: BizRoom['status'] }) {
  const color = ROOM_STATUS_COLORS[status];
  return (
    <View style={[st.statusBadge, { backgroundColor: color + '18' }]}>
      <View style={[st.statusDot, { backgroundColor: color }]} />
      <ThemedText style={[st.statusBadgeText, { color }]}>{statusLabel(status)}</ThemedText>
    </View>
  );
}

// =============================================================================
// ROOM HEALTH STRIP — 4 mini indicators (tasks / blockers / decisions / updates)
// =============================================================================

function RoomHealthStrip({ room }: { room: BizRoom }) {
  const tasks = room.checklist?.length ?? 0;
  const done = room.checklist?.filter((c) => c.done).length ?? 0;
  const blockers = room.openItems;
  const decisions = room.decisions?.length ?? 0;
  const updates = room.timeline?.length ?? 0;

  const items: { icon: string; label: string; value: number; color: string }[] = [
    { icon: 'checklist', label: 'Tasks', value: tasks > 0 ? done : 0, color: '#22C55E' },
    { icon: 'exclamationmark.triangle.fill', label: 'Blockers', value: blockers, color: blockers > 0 ? '#F59E0B' : BP.ash },
    { icon: 'list.bullet.clipboard.fill', label: 'Decisions', value: decisions, color: ACCENT },
    { icon: 'bell.fill', label: 'Updates', value: updates, color: ACCENT },
  ];

  return (
    <View style={st.roomHealthStrip}>
      {items.map((item) => (
        <View key={item.label} style={st.healthIndicator}>
          <IconSymbol name={item.icon as any} size={10} color={item.color} />
          <ThemedText style={[st.healthIndicatorText, { color: item.color }]}>
            {item.value}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// =============================================================================
// ACCESS BADGE — small badge showing room visibility level
// =============================================================================

function AccessBadge({ visibility }: { visibility?: BizRoom['visibility'] }) {
  const label = visibilityLabel(visibility);
  const color = visibilityColor(visibility);
  return (
    <View style={[st.roomAccessBadge, { backgroundColor: color + '15', borderColor: color + '30' }]}>
      <IconSymbol name="lock.shield.fill" size={9} color={color} />
      <ThemedText style={[st.roomAccessBadgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// ACTIVE ROOMS — Card Grid
// =============================================================================

function ActiveRoomsTab({
  rooms,
  onSelectRoom,
  searchQuery,
  onSearchChange,
  isWide,
}: {
  rooms: BizRoom[];
  onSelectRoom: (room: BizRoom) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isWide: boolean;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q) ||
        templateLabel(r.template).toLowerCase().includes(q),
    );
  }, [rooms, searchQuery]);

  return (
    <View style={st.tabContent}>
      {/* Search */}
      <View style={st.searchContainer}>
        <View style={[st.searchBar, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <IconSymbol name="magnifyingglass" size={16} color={BP.ash} />
          <TextInput
            style={[st.searchInput, { color: BP.smoke }]}
            placeholder="Search active rooms..."
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

      {/* Room count */}
      <View style={st.countRow}>
        <ThemedText style={[st.countText, { color: BP.ash }]}>
          {filtered.length} active room{filtered.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {/* Cards */}
      {filtered.length === 0 ? (
        <EmptyState icon="rectangle.stack.fill" label="No active rooms found" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={isWide ? 2 : 1}
          key={isWide ? 'wide' : 'narrow'}
          columnWrapperStyle={isWide ? st.columnWrapper : undefined}
          contentContainerStyle={st.cardListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[
                st.roomCard,
                isWide && st.roomCardWide,
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectRoom(item);
              }}
            >
              {/* Template badge + status + access badge row */}
              <View style={st.cardBadgeRow}>
                <TemplateBadge template={item.template} />
                <StatusBadge status={item.status} />
                <AccessBadge visibility={item.visibility} />
              </View>

              {/* Room name */}
              <ThemedText style={[st.cardRoomName, { color: BP.smoke }]} numberOfLines={2}>
                {item.name}
              </ThemedText>

              {/* Entity */}
              <ThemedText style={[st.cardEntity, { color: BP.ash }]} numberOfLines={1}>
                {item.entityName}
              </ThemedText>

              {/* Next action line */}
              <ThemedText style={[st.roomNextAction, { color: BP.platinum }]} numberOfLines={1}>
                {item.nextAction ?? item.description ?? ''}
              </ThemedText>

              {/* Health strip — tasks / blockers / decisions / updates */}
              <RoomHealthStrip room={item} />

              {/* Metrics row */}
              <View style={[st.cardMetricsRow, { borderTopColor: BP.graphite }]}>
                <View style={st.cardMetric}>
                  <IconSymbol name="person.2.fill" size={12} color={BP.ash} />
                  <ThemedText style={[st.cardMetricText, { color: BP.ash }]}>
                    {item.memberCount}
                  </ThemedText>
                </View>
                <View style={st.cardMetric}>
                  <IconSymbol name="exclamationmark.circle.fill" size={12} color={item.openItems > 0 ? '#F59E0B' : BP.ash} />
                  <ThemedText style={[st.cardMetricText, { color: item.openItems > 0 ? '#F59E0B' : BP.ash }]}>
                    {item.openItems} open
                  </ThemedText>
                </View>
                <View style={st.cardMetricRight}>
                  <IconSymbol name="clock.fill" size={11} color={BP.ash} />
                  <ThemedText style={[st.cardMetricTimeText, { color: BP.ash }]}>
                    {item.lastActivity}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

// =============================================================================
// TEMPLATES TAB
// =============================================================================

function TemplatesTab() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={st.templatesScrollContent}
    >
      <ThemedText style={[st.sectionTitle, { color: BP.smoke }]}>
        Room Templates
      </ThemedText>
      <ThemedText style={[st.sectionSubtitle, { color: BP.ash }]}>
        9 canonical room templates. Each template provides a pre-configured structure for collaboration.
      </ThemedText>

      {ROOM_TEMPLATES.map((tmpl) => {
        const color = TEMPLATE_COLORS[tmpl.id];
        return (
          <BizCard key={tmpl.id} style={st.templateCard}>
            <View style={st.templateCardHeader}>
              <View style={[st.templateIconCircle, { backgroundColor: color + '18' }]}>
                <IconSymbol name={tmpl.icon as any} size={22} color={color} />
              </View>
              <View style={st.templateCardInfo}>
                <ThemedText style={[st.templateCardName, { color: BP.smoke }]}>
                  {tmpl.name}
                </ThemedText>
                <ThemedText style={[st.templateCardMembers, { color: BP.ash }]}>
                  Default: {tmpl.defaultMembers} member{tmpl.defaultMembers !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[st.templateCardDesc, { color: BP.ash }]}>
              {tmpl.description}
            </ThemedText>

            <Pressable
              style={[st.createRoomButton, { backgroundColor: color + '15', borderColor: color + '30' }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="plus.circle.fill" size={16} color={color} />
              <ThemedText style={[st.createRoomButtonText, { color }]}>Create Room</ThemedText>
            </Pressable>
          </BizCard>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// ARCHIVE TAB
// =============================================================================

function ArchiveTab({
  rooms,
  onSelectRoom,
  searchQuery,
  onSearchChange,
}: {
  rooms: BizRoom[];
  onSelectRoom: (room: BizRoom) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const q = searchQuery.toLowerCase();
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q) ||
        templateLabel(r.template).toLowerCase().includes(q),
    );
  }, [rooms, searchQuery]);

  return (
    <View style={st.tabContent}>
      {/* Search */}
      <View style={st.searchContainer}>
        <View style={[st.searchBar, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
          <IconSymbol name="magnifyingglass" size={16} color={BP.ash} />
          <TextInput
            style={[st.searchInput, { color: BP.smoke }]}
            placeholder="Search archived rooms..."
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

      {/* Count */}
      <View style={st.countRow}>
        <ThemedText style={[st.countText, { color: BP.ash }]}>
          {filtered.length} archived room{filtered.length !== 1 ? 's' : ''}
        </ThemedText>
      </View>

      {filtered.length === 0 ? (
        <EmptyState icon="archivebox.fill" label="No archived rooms found" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={st.cardListContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              style={[st.archivedCard]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectRoom(item);
              }}
            >
              {/* Badge row */}
              <View style={st.cardBadgeRow}>
                <TemplateBadge template={item.template} />
                <View style={[st.archivedBadge]}>
                  <IconSymbol name="archivebox.fill" size={10} color={BP.ash} />
                  <ThemedText style={[st.archivedBadgeText, { color: BP.ash }]}>Archived</ThemedText>
                </View>
              </View>

              {/* Room name */}
              <ThemedText style={[st.archivedRoomName, { color: BP.platinum }]} numberOfLines={2}>
                {item.name}
              </ThemedText>

              {/* Entity */}
              <ThemedText style={[st.cardEntity, { color: BP.ash }]} numberOfLines={1}>
                {item.entityName}
              </ThemedText>

              {/* Footer */}
              <View style={[st.archivedFooter, { borderTopColor: BP.graphite }]}>
                <View style={st.cardMetric}>
                  <IconSymbol name="person.2.fill" size={12} color={BP.ash} />
                  <ThemedText style={[st.cardMetricText, { color: BP.ash }]}>
                    {item.memberCount}
                  </ThemedText>
                </View>
                <View style={st.cardMetric}>
                  <IconSymbol name="doc.fill" size={12} color={BP.ash} />
                  <ThemedText style={[st.cardMetricText, { color: BP.ash }]}>
                    {item.artifacts.length} artifact{item.artifacts.length !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
                <View style={st.cardMetricRight}>
                  <ThemedText style={[st.cardMetricTimeText, { color: BP.ash }]}>
                    {item.lastActivity}
                  </ThemedText>
                </View>
              </View>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

// =============================================================================
// ROOM DETAIL BOTTOM SHEET — INTERNAL SUB-TABS
// =============================================================================

// ---- Overview ----
function DetailOverview({ room }: { room: BizRoom }) {
  const approvedDecisions = room.decisions.filter((d) => d.status === 'approved').length;
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      {/* Purpose */}
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>Purpose</ThemedText>
        <ThemedText style={[st.detailSectionBody, { color: BP.ash }]}>{room.description}</ThemedText>
      </View>

      {/* Status */}
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>Status</ThemedText>
        <View style={st.detailBadgeRow}>
          <StatusBadge status={room.status} />
          <TemplateBadge template={room.template} />
        </View>
      </View>

      {/* Entity */}
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>Entity</ThemedText>
        <ThemedText style={[st.detailSectionBody, { color: BP.ash }]}>{room.entityName}</ThemedText>
      </View>

      {/* Key Metrics */}
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>Key Metrics</ThemedText>
        <View style={st.metricsGrid}>
          <View style={[st.metricCard, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
            <ThemedText style={[st.metricValue, { color: BP.smoke }]}>{room.memberCount}</ThemedText>
            <ThemedText style={[st.metricLabel, { color: BP.ash }]}>Members</ThemedText>
          </View>
          <View style={[st.metricCard, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
            <ThemedText style={[st.metricValue, { color: room.openItems > 0 ? '#F59E0B' : BP.smoke }]}>{room.openItems}</ThemedText>
            <ThemedText style={[st.metricLabel, { color: BP.ash }]}>Open Items</ThemedText>
          </View>
          <View style={[st.metricCard, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
            <ThemedText style={[st.metricValue, { color: BP.smoke }]}>{approvedDecisions}</ThemedText>
            <ThemedText style={[st.metricLabel, { color: BP.ash }]}>Decisions Made</ThemedText>
          </View>
          <View style={[st.metricCard, { backgroundColor: BP.glass, borderColor: BP.graphite }]}>
            <ThemedText style={[st.metricValue, { color: BP.smoke }]}>{room.artifacts.length}</ThemedText>
            <ThemedText style={[st.metricLabel, { color: BP.ash }]}>Artifacts</ThemedText>
          </View>
        </View>
      </View>

      {/* Last Activity */}
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>Last Activity</ThemedText>
        <ThemedText style={[st.detailSectionBody, { color: BP.ash }]}>{room.lastActivity}</ThemedText>
      </View>
    </ScrollView>
  );
}

// ---- Work (placeholder) ----
function DetailWork({ room }: { room: BizRoom }) {
  const placeholderTasks = [
    { id: 'wk-1', title: 'Review outstanding deliverables', status: 'in_progress', assignee: room.members[0]?.name ?? 'Unassigned' },
    { id: 'wk-2', title: 'Follow up on pending decisions', status: 'todo', assignee: room.members[1]?.name ?? 'Unassigned' },
    { id: 'wk-3', title: 'Update project milestones', status: 'todo', assignee: room.members[0]?.name ?? 'Unassigned' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>Linked Tasks from Operations</ThemedText>
        <ThemedText style={[st.detailSectionSubtitle, { color: BP.ash }]}>
          Tasks linked to this room from the Operations tab.
        </ThemedText>
      </View>

      {placeholderTasks.map((task, index) => {
        const taskColor = task.status === 'in_progress' ? ACCENT : BP.ash;
        const taskStatusLabel = task.status === 'in_progress' ? 'In Progress' : 'To Do';
        return (
          <View
            key={task.id}
            style={[
              st.workTaskRow,
              { borderBottomColor: BP.graphite },
              index === placeholderTasks.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[st.workTaskDot, { backgroundColor: taskColor }]} />
            <View style={st.workTaskInfo}>
              <ThemedText style={[st.workTaskTitle, { color: BP.smoke }]}>{task.title}</ThemedText>
              <View style={st.workTaskMeta}>
                <View style={[st.workTaskStatusChip, { backgroundColor: taskColor + '18' }]}>
                  <ThemedText style={[st.workTaskStatusText, { color: taskColor }]}>{taskStatusLabel}</ThemedText>
                </View>
                <ThemedText style={[st.workTaskAssignee, { color: BP.ash }]}>{task.assignee}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      <View style={[st.workPlaceholder, { borderColor: BP.graphite }]}>
        <IconSymbol name="link.circle.fill" size={24} color={BP.ash} />
        <ThemedText style={[st.workPlaceholderText, { color: BP.ash }]}>
          Additional tasks will appear here when linked from Operations.
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// ---- Artifacts ----
function DetailArtifacts({ room }: { room: BizRoom }) {
  if (room.artifacts.length === 0) {
    return <EmptyState icon="doc.fill" label="No artifacts uploaded yet" />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>
          Artifacts ({room.artifacts.length})
        </ThemedText>
      </View>

      {room.artifacts.map((artifact, index) => {
        const iconName = artifactIcon(artifact.type);
        const iconColor = artifactIconColor(artifact.type);
        return (
          <View
            key={artifact.id}
            style={[
              st.artifactRow,
              { borderBottomColor: BP.graphite },
              index === room.artifacts.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[st.artifactIconCircle, { backgroundColor: iconColor + '15' }]}>
              <IconSymbol name={iconName as any} size={18} color={iconColor} />
            </View>
            <View style={st.artifactInfo}>
              <ThemedText style={[st.artifactName, { color: BP.smoke }]} numberOfLines={2}>
                {artifact.name}
              </ThemedText>
              <ThemedText style={[st.artifactMeta, { color: BP.ash }]}>
                {artifact.type} -- {artifact.uploadedBy} -- {artifact.uploadDate}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ---- Decisions ----
function DetailDecisions({ room }: { room: BizRoom }) {
  if (room.decisions.length === 0) {
    return <EmptyState icon="list.bullet.clipboard.fill" label="No decisions yet" />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>
          Decisions ({room.decisions.length})
        </ThemedText>
      </View>

      {room.decisions.map((decision) => {
        const dColor = decisionStatusColor(decision.status);
        const dLabel = decisionStatusLabel(decision.status);
        return (
          <BizCard key={decision.id} style={st.decisionCard}>
            <View style={st.decisionHeader}>
              <View style={[st.decisionStatusChip, { backgroundColor: dColor + '18' }]}>
                <View style={[st.decisionStatusDot, { backgroundColor: dColor }]} />
                <ThemedText style={[st.decisionStatusText, { color: dColor }]}>{dLabel}</ThemedText>
              </View>
              <ThemedText style={[st.decisionDate, { color: BP.ash }]}>{decision.date}</ThemedText>
            </View>

            <ThemedText style={[st.decisionTitle, { color: BP.smoke }]}>
              {decision.title}
            </ThemedText>

            <ThemedText style={[st.decisionProposer, { color: BP.ash }]}>
              Proposed by {decision.proposedBy}
            </ThemedText>

            {decision.receiptId && (
              <View style={[st.decisionReceiptLink, { backgroundColor: '#22C55E' + '10', borderColor: '#22C55E' + '25' }]}>
                <IconSymbol name="checkmark.seal.fill" size={14} color="#22C55E" />
                <ThemedText style={[st.decisionReceiptLinkText, { color: '#22C55E' }]}>
                  Receipt: {decision.receiptId}
                </ThemedText>
              </View>
            )}
          </BizCard>
        );
      })}
    </ScrollView>
  );
}

// ---- Receipts ----
function DetailReceipts({ room }: { room: BizRoom }) {
  if (room.receipts.length === 0) {
    return <EmptyState icon="checkmark.seal.fill" label="No receipts recorded" />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>
          Immutable Receipt Trail ({room.receipts.length})
        </ThemedText>
        <ThemedText style={[st.detailSectionSubtitle, { color: BP.ash }]}>
          Every action is recorded. Receipts cannot be modified or deleted.
        </ThemedText>
      </View>

      {room.receipts.map((receipt, index) => {
        const rColor = receiptTypeColor(receipt.type);
        const rIcon = receiptTypeIcon(receipt.type);
        const rLabel = receiptTypeLabel(receipt.type);
        return (
          <View
            key={receipt.id}
            style={[
              st.receiptRow,
              { borderBottomColor: BP.graphite },
              index === room.receipts.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[st.receiptIconCircle, { backgroundColor: rColor + '15' }]}>
              <IconSymbol name={rIcon as any} size={16} color={rColor} />
            </View>
            <View style={st.receiptInfo}>
              <View style={st.receiptTypeRow}>
                <View style={[st.receiptTypeChip, { backgroundColor: rColor + '15' }]}>
                  <ThemedText style={[st.receiptTypeText, { color: rColor }]}>{rLabel}</ThemedText>
                </View>
                <IconSymbol name="lock.fill" size={10} color={BP.ash} />
              </View>
              <ThemedText style={[st.receiptAction, { color: BP.smoke }]}>{receipt.action}</ThemedText>
              <ThemedText style={[st.receiptMeta, { color: BP.ash }]}>
                {receipt.actor} -- {receipt.timestamp}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// ---- People ----
function DetailPeople({ room }: { room: BizRoom }) {
  if (room.members.length === 0) {
    return <EmptyState icon="person.2.fill" label="No members in this room" />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>
          Members ({room.members.length})
        </ThemedText>
      </View>

      {room.members.map((member, index) => (
        <View
          key={member.id}
          style={[
            st.memberRow,
            { borderBottomColor: BP.graphite },
            index === room.members.length - 1 && { borderBottomWidth: 0 },
          ]}
        >
          <View style={[st.memberAvatar, { backgroundColor: templateColor(room.template) + '20' }]}>
            <ThemedText style={[st.memberAvatarText, { color: templateColor(room.template) }]}>
              {member.avatarInitials}
            </ThemedText>
          </View>
          <View style={st.memberInfo}>
            <ThemedText style={[st.memberName, { color: BP.smoke }]}>{member.name}</ThemedText>
            <View style={[st.memberRoleBadge, { backgroundColor: BP.glass }]}>
              <ThemedText style={[st.memberRoleText, { color: BP.ash }]}>{member.role}</ThemedText>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// ---- Timeline ----
function DetailTimeline({ room }: { room: BizRoom }) {
  if (room.timeline.length === 0) {
    return <EmptyState icon="clock.fill" label="No timeline events" />;
  }

  // Show in reverse chronological order
  const sortedTimeline = [...room.timeline].reverse();

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.detailScrollContent}>
      <View style={st.detailSection}>
        <ThemedText style={[st.detailSectionTitle, { color: BP.smoke }]}>
          Timeline ({room.timeline.length} events)
        </ThemedText>
      </View>

      {sortedTimeline.map((event, index) => (
        <View key={event.id} style={st.timelineRow}>
          {/* Vertical connector line */}
          <View style={st.timelineConnector}>
            <View style={[st.timelineDot, { backgroundColor: templateColor(room.template) }]} />
            {index < sortedTimeline.length - 1 && (
              <View style={[st.timelineLine, { backgroundColor: BP.graphite }]} />
            )}
          </View>

          {/* Event content */}
          <View style={st.timelineContent}>
            <ThemedText style={[st.timelineAction, { color: BP.smoke }]}>{event.action}</ThemedText>
            <ThemedText style={[st.timelineMeta, { color: BP.ash }]}>
              {event.actor} -- {event.timestamp}
            </ThemedText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// ROOM DETAIL BOTTOM SHEET
// =============================================================================

function RoomDetailSheet({
  visible,
  onClose,
  room,
}: {
  visible: boolean;
  onClose: () => void;
  room: BizRoom | null;
}) {
  const [activeDetailTab, setActiveDetailTab] = useState<DetailTabId>('overview');

  const handleDetailTabChange = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveDetailTab(id as DetailTabId);
  }, []);

  if (!room) return null;

  const renderDetailContent = () => {
    switch (activeDetailTab) {
      case 'overview':
        return <DetailOverview room={room} />;
      case 'work':
        return <DetailWork room={room} />;
      case 'artifacts':
        return <DetailArtifacts room={room} />;
      case 'decisions':
        return <DetailDecisions room={room} />;
      case 'receipts':
        return <DetailReceipts room={room} />;
      case 'people':
        return <DetailPeople room={room} />;
      case 'timeline':
        return <DetailTimeline room={room} />;
      default:
        return null;
    }
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title={room.name} useModal>
      {/* Detail sub-tab pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={st.detailTabRow}
      >
        {DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeDetailTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                st.detailTabPill,
                {
                  backgroundColor: isActive ? templateColor(room.template) + '20' : BP.glass,
                  borderColor: isActive ? templateColor(room.template) + '40' : BP.graphite,
                },
              ]}
              onPress={() => handleDetailTabChange(tab.id)}
            >
              <ThemedText
                style={[
                  st.detailTabPillText,
                  { color: isActive ? templateColor(room.template) : BP.ash },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Detail content */}
      <View style={st.detailContentContainer}>
        {renderDetailContent()}
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgRoomsV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: B3+ and B2a locked (rooms are internal) ===
  if (!isBoardLevel(role)) {
    return <BizEmptyLock title="Rooms" message="This section is restricted. Contact the Founder for access." />;
  }

  // --- Entity scope integration ---
  const { selectedEntityId } = useBusiness();
  // TODO: Apply entity filtering — when selectedEntityId changes, filter
  // allRooms by room.entityId === selectedEntityId (or show all if holdco-level)

  // --- State ---
  const [activeFilter, setActiveFilter] = useState<FilterChipId>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<BizRoom | null>(null);
  const [showRoomDetail, setShowRoomDetail] = useState(false);

  const { width } = useWindowDimensions();
  const isWide = width >= 600;

  // --- Data ---
  const allRooms = useMemo(() => getBizRoomsData(), []);

  // Apply filter chip + search query
  const filteredRooms = useMemo(() => {
    let rooms = applyFilter(allRooms, activeFilter);

    // Search within filtered results
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      rooms = rooms.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          r.entityName.toLowerCase().includes(q) ||
          templateLabel(r.template).toLowerCase().includes(q),
      );
    }

    return rooms;
  }, [allRooms, activeFilter, searchQuery]);

  // --- Callbacks ---
  const handleFilterChange = useCallback((id: FilterChipId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveFilter(id);
  }, []);

  const handleViewModeChange = useCallback((mode: ViewMode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setViewMode(mode);
  }, []);

  const handleSelectRoom = useCallback((room: BizRoom) => {
    setSelectedRoom(room);
    setShowRoomDetail(true);
  }, []);

  const handleCloseRoomDetail = useCallback(() => {
    setShowRoomDetail(false);
  }, []);

  // --- List view row renderer ---
  const renderListRow = useCallback(({ item }: { item: BizRoom }) => (
    <Pressable
      style={[st.listRow, { borderBottomColor: BP.graphite }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        handleSelectRoom(item);
      }}
    >
      <ThemedText style={[st.listRowName, { color: BP.smoke }]} numberOfLines={1}>
        {item.name}
      </ThemedText>
      <View style={[st.listRowStatusWrap]}>
        <View style={[st.statusDot, { backgroundColor: ROOM_STATUS_COLORS[item.status] }]} />
        <ThemedText style={[st.listRowStatus, { color: BP.ash }]}>
          {statusLabel(item.status)}
        </ThemedText>
      </View>
      <ThemedText style={[st.listRowAction, { color: BP.platinum }]} numberOfLines={1}>
        {item.nextAction ?? item.description ?? ''}
      </ThemedText>
    </Pressable>
  ), [handleSelectRoom]);

  // --- Render ---
  return (
    <View style={st.container}>
      {/* Filter chips row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={st.filterChipRow}
      >
        {FILTER_CHIPS.map((chip) => {
          const isActive = chip.id === activeFilter;
          return (
            <Pressable
              key={chip.id}
              style={[
                st.filterChip,
                isActive && st.filterChipActive,
              ]}
              onPress={() => handleFilterChange(chip.id)}
            >
              <ThemedText
                style={[
                  st.filterChipText,
                  { color: isActive ? BP.smoke : BP.ash },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* View toggle + count row */}
      <View style={st.viewToggleRow}>
        <ThemedText style={[st.countText, { color: BP.ash }]}>
          {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''}
        </ThemedText>
        <View style={{ flexDirection: 'row', gap: 4 }}>
          <Pressable
            style={[st.viewToggleBtn, viewMode === 'cards' && st.viewToggleBtnActive]}
            onPress={() => handleViewModeChange('cards')}
          >
            <IconSymbol
              name="square.grid.2x2.fill"
              size={14}
              color={viewMode === 'cards' ? BP.smoke : BP.ash}
            />
          </Pressable>
          <Pressable
            style={[st.viewToggleBtn, viewMode === 'list' && st.viewToggleBtnActive]}
            onPress={() => handleViewModeChange('list')}
          >
            <IconSymbol
              name="list.bullet"
              size={14}
              color={viewMode === 'list' ? BP.smoke : BP.ash}
            />
          </Pressable>
        </View>
      </View>

      {/* Content area */}
      <View style={st.contentContainer}>
        {viewMode === 'cards' ? (
          <ActiveRoomsTab
            rooms={filteredRooms}
            onSelectRoom={handleSelectRoom}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isWide={isWide}
          />
        ) : (
          /* List (dense) view */
          <View style={st.tabContent}>
            {/* Search */}
            <View style={st.searchContainer}>
              <View style={[st.searchBar, { backgroundColor: BP.carbon, borderColor: BP.graphite }]}>
                <IconSymbol name="magnifyingglass" size={16} color={BP.ash} />
                <TextInput
                  style={[st.searchInput, { color: BP.smoke }]}
                  placeholder="Search rooms..."
                  placeholderTextColor={BP.ash}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                    <IconSymbol name="xmark.circle.fill" size={16} color={BP.ash} />
                  </Pressable>
                )}
              </View>
            </View>

            {filteredRooms.length === 0 ? (
              <EmptyState icon="rectangle.stack.fill" label="No rooms match this filter" />
            ) : (
              <FlatList
                data={filteredRooms}
                keyExtractor={(item) => item.id}
                contentContainerStyle={st.cardListContent}
                showsVerticalScrollIndicator={false}
                renderItem={renderListRow}
              />
            )}
          </View>
        )}
      </View>

      {/* Room Detail Sheet */}
      <RoomDetailSheet
        visible={showRoomDetail}
        onClose={handleCloseRoomDetail}
        room={selectedRoom}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const st = StyleSheet.create({
  // --- Layout ---
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
  },

  // --- Search ---
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
    height: '100%' as any,
  },

  // --- Count row ---
  countRow: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  // --- Card list ---
  cardListContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
  },
  columnWrapper: {
    gap: Spacing.sm,
  },

  // --- Room Card (Active) ---
  roomCard: {
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  roomCardWide: {
    flex: 1,
  },
  cardBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  cardRoomName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
    lineHeight: 20,
  },
  cardEntity: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  cardMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  cardMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardMetricText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  cardMetricRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
  },
  cardMetricTimeText: {
    fontSize: 11,
  },

  // --- Template Badge ---
  templateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  templateBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // --- Status Badge ---
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // --- Templates Tab ---
  templatesScrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },
  templateCard: {
    marginBottom: Spacing.sm,
  },
  templateCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  templateIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateCardInfo: {
    flex: 1,
  },
  templateCardName: {
    fontSize: 15,
    fontWeight: '700',
  },
  templateCardMembers: {
    fontSize: 12,
    marginTop: 2,
  },
  templateCardDesc: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  createRoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  createRoomButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // --- Archive Tab ---
  archivedCard: {
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    opacity: 0.75,
  },
  archivedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(156,163,175,0.12)',
  },
  archivedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  archivedRoomName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    lineHeight: 20,
  },
  archivedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },

  // --- Empty State ---
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // --- Detail Sheet ---
  detailTabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  detailTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  detailTabPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  detailContentContainer: {
    flex: 1,
    minHeight: 200,
  },

  // --- Detail Sections (shared) ---
  detailScrollContent: {
    paddingBottom: 40,
  },
  detailSection: {
    marginBottom: Spacing.md,
  },
  detailSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailSectionSubtitle: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  detailSectionBody: {
    fontSize: 13,
    lineHeight: 19,
  },
  detailBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    flexWrap: 'wrap',
  },

  // --- Overview Metrics ---
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    flexGrow: 1,
    flexBasis: '45%',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // --- Work Tab ---
  workTaskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  workTaskDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  workTaskInfo: {
    flex: 1,
  },
  workTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  workTaskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workTaskStatusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  workTaskStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  workTaskAssignee: {
    fontSize: 12,
  },
  workPlaceholder: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  workPlaceholderText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },

  // --- Artifacts Tab ---
  artifactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  artifactIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artifactInfo: {
    flex: 1,
  },
  artifactName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  artifactMeta: {
    fontSize: 11,
  },

  // --- Decisions Tab ---
  decisionCard: {
    marginBottom: Spacing.sm,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  decisionStatusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  decisionStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  decisionStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  decisionDate: {
    fontSize: 11,
  },
  decisionTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 4,
  },
  decisionProposer: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  decisionReceiptLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  decisionReceiptLinkText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // --- Receipts Tab ---
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  receiptIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  receiptInfo: {
    flex: 1,
  },
  receiptTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  receiptTypeChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  receiptTypeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  receiptAction: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    marginBottom: 2,
  },
  receiptMeta: {
    fontSize: 11,
    lineHeight: 16,
  },

  // --- People Tab ---
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3,
  },
  memberRoleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  memberRoleText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // --- Timeline Tab ---
  timelineRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    minHeight: 50,
  },
  timelineConnector: {
    alignItems: 'center',
    width: 20,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  timelineContent: {
    flex: 1,
    paddingBottom: Spacing.md,
  },
  timelineAction: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 2,
  },
  timelineMeta: {
    fontSize: 11,
    lineHeight: 16,
  },

  // --- Filter Chips ---
  filterChipRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: BP.glass,
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipActive: {
    backgroundColor: BP.champagneGold + '20',
    borderColor: BP.champagneGold + '40',
  },

  // --- View Toggle ---
  viewToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  viewToggleBtn: {
    width: 30,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BP.glass,
    borderWidth: 1,
    borderColor: BP.graphite,
  },
  viewToggleBtnActive: {
    backgroundColor: BP.champagneGold + '18',
    borderColor: BP.champagneGold + '35',
  },

  // --- Room Health Strip ---
  roomHealthStrip: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingVertical: 6,
  },
  healthIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  healthIndicatorText: {
    fontSize: 10,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // --- Room Access Badge ---
  roomAccessBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  roomAccessBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // --- Room Next Action ---
  roomNextAction: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },

  // --- List View (dense) ---
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  listRowName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  listRowStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  listRowStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  listRowAction: {
    flex: 1,
    fontSize: 11,
    textAlign: 'right',
  },
});
