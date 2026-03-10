/**
 * Outreach — 3-page swipeable layout for church mode.
 * Page 0: Visitors — Kanban board with 5 stages.
 * Page 1: Community — filterable outreach initiatives list.
 * Page 2: Missions — mission trips + supported missionaries.
 * Identical SwipeablePages / LongPressContextMenu patterns as Admissions.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  VISITOR_STAGES,
  VISITOR_SUMMARY,
  getVisitorsByStage,
  getStageConversion,
  getInitiatives,
  getMissions,
  getSupportedMissionaries,
  formatMoney,
  type VisitorCard as VisitorCardType,
  type VisitorStage,
  type VisitorSource,
  type CommunityFilter,
  type OutreachInitiative,
  type MissionFilter,
  type MissionItem,
  type SupportedMissionary,
  type InitiativeType,
  type MissionType,
} from '@/data/mock-outreach';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: 'rgba(255,255,255,0.08)',
  green: '#22C55E',
  red: '#EF4444',
  amber: '#F59E0B',
  blue: '#3B82F6',
  purple: '#8B5CF6',
  teal: '#14B8A6',
};

const COLUMN_WIDTH = Dimensions.get('window').width * 0.72;

const SOURCE_LABELS: Record<VisitorSource, string> = {
  'walked-in': 'Walked In',
  'invited-by-member': 'Invited',
  'online': 'Online',
  'event': 'Event',
  'community-outreach': 'Outreach',
};

const SOURCE_COLORS: Record<VisitorSource, string> = {
  'walked-in': C.blue,
  'invited-by-member': C.green,
  'online': C.purple,
  'event': C.amber,
  'community-outreach': C.teal,
};

const FAMILY_ICONS: Record<string, string> = {
  single: 'person.fill',
  couple: 'person.2.fill',
  family: 'person.3.fill',
};

const INITIATIVE_TYPE_LABELS: Record<InitiativeType, string> = {
  'service-project': 'Service Project',
  'event': 'Event',
  'canvassing': 'Canvassing',
  'partner-program': 'Partner Program',
};

const INITIATIVE_TYPE_COLORS: Record<InitiativeType, string> = {
  'service-project': C.green,
  'event': C.amber,
  'canvassing': C.blue,
  'partner-program': C.purple,
};

const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  'short-term-trip': 'Short-Term Trip',
  'long-term': 'Long-Term',
  'partner-support': 'Partner Support',
  'local-mission': 'Local Mission',
};

const MISSION_TYPE_COLORS: Record<MissionType, string> = {
  'short-term-trip': C.blue,
  'long-term': C.purple,
  'partner-support': C.teal,
  'local-mission': C.amber,
};

// ─── Page Top Bar ──────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ───────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── FAB ───────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

// ─── Visitor Summary Card ────────────────────────────────────────────────

function VisitorSummaryCard() {
  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>VISITOR PIPELINE</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{VISITOR_SUMMARY.conversionRate}% conversion</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{VISITOR_SUMMARY.newThisWeek}</Text>
          <Text style={s.summaryPosLabel}>New This Week</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{VISITOR_SUMMARY.totalInPipeline}</Text>
          <Text style={s.summaryPosLabel}>In Pipeline</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{VISITOR_SUMMARY.becameMembers}</Text>
          <Text style={s.summaryPosLabel}>New Members</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Visitor Kanban Card ─────────────────────────────────────────────────

function VisitorKanbanCard({
  visitor,
  onLongPress,
}: {
  visitor: VisitorCardType;
  onLongPress: (pageY: number) => void;
}) {
  const sourceColor = SOURCE_COLORS[visitor.source];
  const sourceLabel = SOURCE_LABELS[visitor.source];
  const familyIcon = FAMILY_ICONS[visitor.familyIndicator];

  return (
    <Pressable
      style={({ pressed }) => [s.dealCard, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.dealCardHeader}>
        <View style={s.visitorAvatar}>
          <Text style={s.visitorAvatarText}>{visitor.initials}</Text>
        </View>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={s.dealCardContact} numberOfLines={1}>{visitor.name}</Text>
          <Text style={s.dealCardCompany} numberOfLines={1}>{visitor.firstVisitDate}</Text>
        </View>
        <IconSymbol name={familyIcon as any} size={14} color={C.muted} />
      </View>
      <View style={s.visitorSourceRow}>
        <View style={[s.sourcePill, { backgroundColor: sourceColor + '22' }]}>
          <Text style={[s.sourcePillText, { color: sourceColor }]}>{sourceLabel}</Text>
        </View>
      </View>
      <Text style={s.visitorAssigned} numberOfLines={1}>{visitor.assignedTo}</Text>
      <Text style={s.visitorNotes} numberOfLines={1}>{visitor.notesPreview}</Text>
      <View style={s.dealCardFooter}>
        <Text style={s.dealCardMeta}>{visitor.lastContact}</Text>
      </View>
    </Pressable>
  );
}

// ─── Initiative Row ──────────────────────────────────────────────────────

function InitiativeRow({
  item,
  onLongPress,
}: {
  item: OutreachInitiative;
  onLongPress: (pageY: number) => void;
}) {
  const typeColor = INITIATIVE_TYPE_COLORS[item.type];
  const typeLabel = INITIATIVE_TYPE_LABELS[item.type];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.initiativeIcon, { backgroundColor: typeColor + '22' }]}>
        <IconSymbol
          name={item.type === 'service-project' ? 'heart.fill' : item.type === 'event' ? 'star.fill' : item.type === 'canvassing' ? 'figure.walk' : 'handshake.fill' as any}
          size={18}
          color={typeColor}
        />
      </View>
      <View style={s.rowContent}>
        <View style={s.contactNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
          {item.isRecurring && (
            <IconSymbol name="arrow.clockwise" size={12} color={C.muted} />
          )}
        </View>
        <View style={s.initiativeMetaRow}>
          <View style={[s.typeBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>
        <Text style={s.initiativeDate}>{item.date}</Text>
        <View style={s.initiativeStatsRow}>
          <View style={s.contactAvatar}>
            <Text style={s.contactInitials}>{item.teamLeadInitials}</Text>
          </View>
          <Text style={s.initiativeLeadName}>{item.teamLead}</Text>
          <Text style={s.dealCardDot}>&middot;</Text>
          <Text style={[s.volunteerCount, item.volunteerCount >= item.volunteersNeeded && { color: C.green }]}>
            {item.volunteerCount}/{item.volunteersNeeded} volunteers
          </Text>
        </View>
        {(item.impactMetrics.mealsServed || item.impactMetrics.familiesHelped || item.impactMetrics.peopleReached) && (
          <View style={s.impactRow}>
            {item.impactMetrics.mealsServed != null && (
              <Text style={s.impactText}>{item.impactMetrics.mealsServed} meals</Text>
            )}
            {item.impactMetrics.familiesHelped != null && (
              <Text style={s.impactText}>{item.impactMetrics.familiesHelped} families</Text>
            )}
            {item.impactMetrics.peopleReached != null && (
              <Text style={s.impactText}>{item.impactMetrics.peopleReached} reached</Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Mission Row ─────────────────────────────────────────────────────────

function MissionRow({
  item,
  onLongPress,
}: {
  item: MissionItem;
  onLongPress: (pageY: number) => void;
}) {
  const typeColor = MISSION_TYPE_COLORS[item.type];
  const typeLabel = MISSION_TYPE_LABELS[item.type];
  const progress = item.fundraisingGoal > 0 ? Math.round((item.fundraisingRaised / item.fundraisingGoal) * 100) : 0;

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.initiativeIcon, { backgroundColor: typeColor + '22' }]}>
        <IconSymbol name="globe.americas.fill" size={18} color={typeColor} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
        <View style={s.initiativeMetaRow}>
          <View style={[s.typeBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.typeBadgeText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>
        <Text style={s.missionLocation}>{item.location}</Text>
        <Text style={s.initiativeDate}>{item.dateRange}</Text>
        {item.teamCapacity > 0 && (
          <Text style={s.volunteerCount}>{item.teamSize}/{item.teamCapacity} team members</Text>
        )}
        {/* Fundraising progress bar */}
        <View style={s.fundraisingRow}>
          <View style={s.fundraisingBar}>
            <View style={[s.fundraisingFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: progress >= 100 ? C.green : C.amber }]} />
          </View>
          <Text style={s.fundraisingText}>{formatMoney(item.fundraisingRaised)}/{formatMoney(item.fundraisingGoal)} ({progress}%)</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Missionary Row ──────────────────────────────────────────────────────

function MissionaryRow({
  item,
  onLongPress,
}: {
  item: SupportedMissionary;
  onLongPress: (pageY: number) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.missionaryAvatar}>
        <Text style={s.contactInitials}>{item.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={s.missionLocation}>{item.location}</Text>
        <Text style={s.missionaryMinistry}>{item.ministry}</Text>
        <View style={s.missionaryMetaRow}>
          <Text style={s.missionarySupport}>{formatMoney(item.monthlySupport)}/mo</Text>
          <Text style={s.dealCardDot}>&middot;</Text>
          <Text style={s.missionaryUpdate}>Updated {item.lastUpdate}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Filter Data ──────────────────────────────────────────────────────────

const COMMUNITY_FILTERS: { key: CommunityFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

const MISSION_FILTERS: { key: MissionFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'upcoming',  label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
  { key: 'ongoing',   label: 'Ongoing' },
];

// ─── Main Component ──────────────────────────────────────────────────────

export function OutreachContent() {
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  // Community state
  const [communityFilter, setCommunityFilter] = useState<CommunityFilter>('all');

  // Missions state
  const [missionFilter, setMissionFilter] = useState<MissionFilter>('all');

  // ── Data ──
  const initiatives = useMemo(
    () => getInitiatives(communityFilter),
    [communityFilter],
  );

  const missions = useMemo(
    () => getMissions(missionFilter),
    [missionFilter],
  );

  const missionaries = useMemo(() => getSupportedMissionaries(), []);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Visitor ──
  const longPressVisitor = useCallback((visitor: VisitorCardType, pageY: number) => {
    setMenuData({
      title: visitor.name,
      subtitle: `${SOURCE_LABELS[visitor.source]} · ${visitor.firstVisitDate} · ${visitor.assignedTo}`,
      initials: visitor.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'assign', label: 'Assign Follow-Up', icon: 'person.badge.plus' },
        { key: 'note', label: 'Add Note', icon: 'note.text' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Initiative ──
  const longPressInitiative = useCallback((item: OutreachInitiative, pageY: number) => {
    setMenuData({
      title: item.name,
      subtitle: `${INITIATIVE_TYPE_LABELS[item.type]} · ${item.date}`,
      initials: item.teamLeadInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'duplicate', label: 'Duplicate', icon: 'doc.on.doc' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Mission ──
  const longPressMission = useCallback((item: MissionItem, pageY: number) => {
    setMenuData({
      title: item.name,
      subtitle: `${MISSION_TYPE_LABELS[item.type]} · ${item.location}`,
      initials: item.leaderInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Missionary ──
  const longPressMissionary = useCallback((item: SupportedMissionary, pageY: number) => {
    setMenuData({
      title: item.name,
      subtitle: `${item.ministry} · ${item.location}`,
      initials: item.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'give', label: 'Give', icon: 'dollarsign.circle.fill' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: VISITORS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Visitors" />
          </View>

          {/* Summary card */}
          <VisitorSummaryCard />

          {/* Horizontal Kanban */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.kanbanScroll}
            decelerationRate="fast"
            snapToInterval={COLUMN_WIDTH + 12}
          >
            {VISITOR_STAGES.map(({ stage, color }, stageIdx) => {
              const visitors = getVisitorsByStage(stage);
              const conversion = getStageConversion(stageIdx);
              return (
                <View key={stage} style={[s.column, { width: COLUMN_WIDTH }]}>
                  {/* Column header */}
                  <View style={s.columnHeader}>
                    <View style={[s.stageIndicator, { backgroundColor: color }]} />
                    <Text style={s.columnTitle}>{stage}</Text>
                    <View style={[s.countBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[s.countText, { color }]}>{visitors.length}</Text>
                    </View>
                    {conversion !== null && (
                      <Text style={s.columnValue}>{conversion}%</Text>
                    )}
                  </View>

                  {/* Visitor cards */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.columnContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {visitors.length === 0 ? (
                      <View style={s.emptyColumn}>
                        <Text style={s.emptyText}>No visitors</Text>
                      </View>
                    ) : (
                      visitors.map((visitor) => (
                        <VisitorKanbanCard
                          key={visitor.id}
                          visitor={visitor}
                          onLongPress={(pageY) => longPressVisitor(visitor, pageY)}
                        />
                      ))
                    )}
                    <View style={{ height: 100 }} />
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: COMMUNITY ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Community" />
            <FilterPills items={COMMUNITY_FILTERS} active={communityFilter} onSelect={setCommunityFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {initiatives.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={s.separator} />}
                <InitiativeRow
                  item={item}
                  onLongPress={(pageY) => longPressInitiative(item, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 2: MISSIONS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Missions" />
            <FilterPills items={MISSION_FILTERS} active={missionFilter} onSelect={setMissionFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {missions.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={s.separator} />}
                <MissionRow
                  item={item}
                  onLongPress={(pageY) => longPressMission(item, pageY)}
                />
              </View>
            ))}

            {/* Supported Missionaries section */}
            <View style={s.sectionDivider}>
              <Text style={s.sectionDividerText}>SUPPORTED MISSIONARIES</Text>
            </View>
            {missionaries.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={s.separator} />}
                <MissionaryRow
                  item={item}
                  onLongPress={(pageY) => longPressMissionary(item, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Summary card
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  summaryBadge: {
    backgroundColor: C.green + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.green,
  },
  summaryPositions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryPosItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryPosCount: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryPosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },

  // Kanban
  kanbanScroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  column: { flex: 1 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 2 },
  stageIndicator: { width: 4, height: 16, borderRadius: 2 },
  columnTitle: { fontSize: 13, fontWeight: '700', color: C.label, flex: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '800' },
  columnValue: { fontSize: 11, fontWeight: '600', color: C.muted },
  columnContent: { gap: 8 },
  emptyColumn: { padding: 20, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: C.separator, alignItems: 'center' },
  emptyText: { fontSize: 12, color: C.muted },

  // Visitor card (kanban)
  dealCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  dealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  visitorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorAvatarText: { fontSize: 10, fontWeight: '700', color: C.secondary },
  dealCardContact: { fontSize: 14, fontWeight: '600', color: C.label },
  dealCardCompany: { fontSize: 12, color: C.muted },
  visitorSourceRow: { flexDirection: 'row', marginBottom: 4 },
  sourcePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  sourcePillText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  visitorAssigned: { fontSize: 12, color: C.secondary, marginBottom: 2 },
  visitorNotes: { fontSize: 11, color: C.muted, marginBottom: 4 },
  dealCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dealCardMeta: { fontSize: 11, color: C.muted },
  dealCardDot: { fontSize: 11, color: C.muted },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  // Initiative row
  initiativeIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  initiativeMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  initiativeDate: { fontSize: 12, color: C.muted, marginTop: 2 },
  initiativeStatsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  contactAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: { fontSize: 8, fontWeight: '700', color: C.secondary },
  initiativeLeadName: { fontSize: 12, color: C.secondary },
  volunteerCount: { fontSize: 12, color: C.secondary },
  impactRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  impactText: { fontSize: 11, fontWeight: '600', color: C.teal },

  // Mission row
  missionLocation: { fontSize: 12, color: C.secondary, marginTop: 2 },
  fundraisingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  fundraisingBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.surface },
  fundraisingFill: { height: 4, borderRadius: 2 },
  fundraisingText: { fontSize: 10, fontWeight: '600', color: C.muted, minWidth: 90 },

  // Missionary row
  missionaryAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  missionaryMinistry: { fontSize: 12, color: C.muted, marginTop: 1 },
  missionaryMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  missionarySupport: { fontSize: 12, fontWeight: '600', color: C.green },
  missionaryUpdate: { fontSize: 11, color: C.muted },

  // Section divider
  sectionDivider: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.separator,
  },
  sectionDividerText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
