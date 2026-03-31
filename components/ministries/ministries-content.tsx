/**
 * Ministries — 3-page swipeable layout for church mode.
 * Page 0: Serve — summary card, ministry filter pills, ministry list.
 * Page 1: Connect — summary card, group filter pills, group list.
 * Page 2: Management — section pills, scheduling/training/background/leaders/health.
 * Identical SwipeablePages / LongPressContextMenu patterns as Roster/Team.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  SERVE_SUMMARY,
  CONNECT_SUMMARY,
  VOLUNTEER_ASSIGNMENTS,
  CHURCH_TRAINING_ENTRIES,
  BACKGROUND_CHECKS,
  LEADER_PIPELINE,
  MINISTRY_HEALTH,
  getMinistries,
  getGroups,
  getLeadersByStage,
  type MinistryItem,
  type MinistryFilter,
  type MinistryCategory,
  type StaffingStatus,
  type GroupItem,
  type GroupFilter,
  type GroupType,
  type GroupOpenness,
  type MgmtSection,
  type RsvpStatus,
  type ChurchTrainingStatus,
  type BgCheckStatus,
  type PipelineStage,
} from '@/data/mock-ministries-screen';

import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ── Color Maps ──

const MINISTRY_CATEGORY_COLORS: Record<MinistryCategory, string> = {
  worship: '#1A1714',
  children: '#B8943E',
  youth: '#5A8A6E',
  hospitality: '#1A1714',
  tech: '#6366F1',
  outreach: '#1A1714',
  custom: '#9C9790',
};

const MINISTRY_CATEGORY_LABELS: Record<MinistryCategory, string> = {
  worship: 'Worship',
  children: 'Children',
  youth: 'Youth',
  hospitality: 'Hospitality',
  tech: 'Tech',
  outreach: 'Outreach',
  custom: 'Custom',
};

const STAFFING_STATUS_COLORS: Record<StaffingStatus, string> = {
  'fully-staffed': '#5A8A6E',
  'needs-volunteers': '#B8943E',
};

const STAFFING_STATUS_LABELS: Record<StaffingStatus, string> = {
  'fully-staffed': 'Fully Staffed',
  'needs-volunteers': 'Needs Volunteers',
};

const GROUP_TYPE_COLORS: Record<GroupType, string> = {
  'life-groups': '#1A1714',
  'bible-study': '#1A1714',
  mens: '#6366F1',
  womens: '#1A1714',
  youth: '#5A8A6E',
  couples: '#B8943E',
  recovery: '#B85C5C',
  custom: '#9C9790',
};

const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  'life-groups': 'Life Groups',
  'bible-study': 'Bible Study',
  mens: "Men's",
  womens: "Women's",
  youth: 'Youth',
  couples: 'Couples',
  recovery: 'Recovery',
  custom: 'Custom',
};

const GROUP_OPENNESS_COLORS: Record<GroupOpenness, string> = {
  open: '#5A8A6E',
  closed: '#52525B',
};

const GROUP_OPENNESS_LABELS: Record<GroupOpenness, string> = {
  open: 'Open',
  closed: 'Closed',
};

const RSVP_STATUS_COLORS: Record<RsvpStatus, string> = {
  confirmed: '#5A8A6E',
  declined: '#B85C5C',
  'no-response': '#B8943E',
};

const RSVP_STATUS_LABELS: Record<RsvpStatus, string> = {
  confirmed: 'Confirmed',
  declined: 'Declined',
  'no-response': 'No Response',
};

const CHURCH_TRAINING_STATUS_COLORS: Record<ChurchTrainingStatus, string> = {
  'not-started': '#9C9790',
  'in-progress': '#1A1714',
  completed: '#5A8A6E',
  expired: '#B85C5C',
};

const CHURCH_TRAINING_STATUS_LABELS: Record<ChurchTrainingStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
  expired: 'Expired',
};

const BG_CHECK_STATUS_COLORS: Record<BgCheckStatus, string> = {
  cleared: '#5A8A6E',
  pending: '#B8943E',
  expired: '#B85C5C',
  'not-submitted': '#9C9790',
};

const BG_CHECK_STATUS_LABELS: Record<BgCheckStatus, string> = {
  cleared: 'Cleared',
  pending: 'Pending',
  expired: 'Expired',
  'not-submitted': 'Not Submitted',
};

const PIPELINE_STAGE_COLORS: Record<PipelineStage, string> = {
  serving: '#9C9790',
  identified: '#B8943E',
  mentoring: '#1A1714',
  training: '#1A1714',
  ready: '#6366F1',
  placed: '#5A8A6E',
};

const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  serving: 'Serving',
  identified: 'Identified',
  mentoring: 'Mentoring',
  training: 'Training',
  ready: 'Ready',
  placed: 'Placed',
};

const HEALTH_SCORE_COLORS: Record<string, string> = {
  healthy: '#5A8A6E',
  watch: '#B8943E',
  'at-risk': '#B85C5C',
};

const HEALTH_SCORE_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  watch: 'Watch',
  'at-risk': 'At Risk',
};

const TREND_ARROWS: Record<string, string> = {
  up: '↑',
  down: '↓',
  flat: '→',
};

const TREND_COLORS: Record<string, string> = {
  up: '#5A8A6E',
  down: '#B85C5C',
  flat: '#9C9790',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
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

// ─── Serve Summary Card ─────────────────────────────────────────────────────

function ServeSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const segments = [
    { label: 'Ministries', count: SERVE_SUMMARY.totalMinistries },
    { label: 'Volunteers', count: SERVE_SUMMARY.totalVolunteers },
    { label: 'Needs',      count: SERVE_SUMMARY.upcomingNeeds },
  ];

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>SERVE</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{SERVE_SUMMARY.totalMinistries} ministries</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        {segments.map((seg) => (
          <View key={seg.label} style={s.summaryPosItem}>
            <Text style={s.summaryPosCount}>{seg.count}</Text>
            <Text style={s.summaryPosLabel}>{seg.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Connect Summary Card ───────────────────────────────────────────────────

function ConnectSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const segments = [
    { label: 'Groups',  count: CONNECT_SUMMARY.totalGroups },
    { label: 'Members', count: CONNECT_SUMMARY.totalGroupMembers },
    { label: '% of Cong.', count: CONNECT_SUMMARY.congregationPercent },
  ];

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>CONNECT</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{CONNECT_SUMMARY.totalGroups} groups</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        {segments.map((seg) => (
          <View key={seg.label} style={s.summaryPosItem}>
            <Text style={s.summaryPosCount}>{seg.label === '% of Cong.' ? `${seg.count}%` : seg.count}</Text>
            <Text style={s.summaryPosLabel}>{seg.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── Ministry Row ───────────────────────────────────────────────────────────

function MinistryRow({
  ministry,
  onLongPress,
}: {
  ministry: MinistryItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const categoryColor = MINISTRY_CATEGORY_COLORS[ministry.category];
  const staffingColor = STAFFING_STATUS_COLORS[ministry.staffingStatus];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.squircleIcon, { backgroundColor: categoryColor + '22' }]}>
        <IconSymbol name="heart.fill" size={16} color={categoryColor} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{ministry.name}</Text>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: categoryColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: categoryColor }]}>{MINISTRY_CATEGORY_LABELS[ministry.category]}</Text>
          </View>
          <Text style={s.playerMeta}>{ministry.memberCount} volunteers</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.playerMeta}>Next: {ministry.nextServiceDate}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <Text style={s.playerMeta}>{ministry.leaderInitials} · {ministry.leaderName}</Text>
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: staffingColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: staffingColor }]}>{STAFFING_STATUS_LABELS[ministry.staffingStatus]}</Text>
      </View>
    </Pressable>
  );
}

// ─── Group Row ──────────────────────────────────────────────────────────────

function GroupRow({
  group,
  onLongPress,
}: {
  group: GroupItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = GROUP_TYPE_COLORS[group.type];
  const opennessColor = GROUP_OPENNESS_COLORS[group.openness];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.squircleIcon, { backgroundColor: typeColor + '22' }]}>
        <IconSymbol name="person.3.fill" size={16} color={typeColor} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{group.name}</Text>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: typeColor }]}>{GROUP_TYPE_LABELS[group.type]}</Text>
          </View>
          <Text style={s.playerMeta}>{group.memberCount}/{group.capacity}</Text>
          <View style={[s.statusDot, { backgroundColor: opennessColor }]} />
          <Text style={s.playerMeta}>{GROUP_OPENNESS_LABELS[group.openness]}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <Text style={s.playerMeta}>{group.leaderInitials} · {group.leaderName}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.playerMeta}>{group.meetingSchedule}</Text>
        </View>
        <Text style={[s.playerMeta, { marginTop: 1 }]}>{group.location}</Text>
      </View>
    </Pressable>
  );
}

// ─── Volunteer Assignment Row ───────────────────────────────────────────────

function VolunteerAssignmentRow({ entry }: { entry: typeof VOLUNTEER_ASSIGNMENTS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const rsvpColor = RSVP_STATUS_COLORS[entry.rsvpStatus];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.volunteerInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.volunteerName}</Text>
        <Text style={s.mgmtDescription}>{entry.ministry} · {entry.role}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{entry.date}</Text>
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: rsvpColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: rsvpColor }]}>{RSVP_STATUS_LABELS[entry.rsvpStatus]}</Text>
      </View>
    </View>
  );
}

// ─── Church Training Row ────────────────────────────────────────────────────

function ChurchTrainingRow({ entry }: { entry: typeof CHURCH_TRAINING_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = CHURCH_TRAINING_STATUS_COLORS[entry.status];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.volunteerInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.volunteerName}</Text>
        <Text style={s.mgmtDescription}>{entry.programName}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>Due {entry.dueDate}</Text>
          {entry.certification && (
            <>
              <Text style={s.mgmtDot}>·</Text>
              <View style={[s.microBadge, { backgroundColor: C.purple + '22' }]}>
                <Text style={[s.microBadgeText, { color: C.purple }]}>Cert</Text>
              </View>
            </>
          )}
        </View>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: `${entry.completionPercent}%`, backgroundColor: statusColor }]} />
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{CHURCH_TRAINING_STATUS_LABELS[entry.status]}</Text>
      </View>
    </View>
  );
}

// ─── Background Check Row ───────────────────────────────────────────────────

function BackgroundCheckRow({ entry }: { entry: typeof BACKGROUND_CHECKS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = BG_CHECK_STATUS_COLORS[entry.checkStatus];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.volunteerInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.volunteerName}</Text>
        <View style={s.mgmtMetaRow}>
          {entry.lastCheckDate ? (
            <Text style={s.mgmtMeta}>Last: {entry.lastCheckDate}</Text>
          ) : (
            <Text style={[s.mgmtMeta, { color: C.amber }]}>No check on file</Text>
          )}
          {entry.expirationDate && (
            <>
              <Text style={s.mgmtDot}>·</Text>
              <Text style={s.mgmtMeta}>Exp: {entry.expirationDate}</Text>
            </>
          )}
        </View>
        <Text style={s.mgmtDescription}>Required for: {entry.requiredFor}</Text>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{BG_CHECK_STATUS_LABELS[entry.checkStatus]}</Text>
      </View>
    </View>
  );
}

// ─── Leader Row ─────────────────────────────────────────────────────────────

function LeaderRow({ entry }: { entry: typeof LEADER_PIPELINE[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const stageColor = PIPELINE_STAGE_COLORS[entry.stage];
  const progressColor = entry.readinessPercent >= 80 ? C.green : entry.readinessPercent >= 50 ? C.amber : C.blue;

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.name}</Text>
        <Text style={s.mgmtDescription}>{entry.currentRole}</Text>
        <View style={s.mgmtMetaRow}>
          {entry.mentorName && (
            <Text style={s.mgmtMeta}>Mentor: {entry.mentorName}</Text>
          )}
        </View>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: `${entry.readinessPercent}%`, backgroundColor: progressColor }]} />
        </View>
        <Text style={[s.mgmtMeta, { marginTop: 2 }]}>{entry.readinessPercent}% ready</Text>
      </View>
      <View style={[s.statusBadge, { backgroundColor: stageColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: stageColor }]}>{PIPELINE_STAGE_LABELS[entry.stage]}</Text>
      </View>
    </View>
  );
}

// ─── Pipeline Section ───────────────────────────────────────────────────────

function PipelineSection({
  stage,
  entries,
}: {
  stage: PipelineStage;
  entries: typeof LEADER_PIPELINE;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const color = PIPELINE_STAGE_COLORS[stage];
  const label = PIPELINE_STAGE_LABELS[stage];

  if (entries.length === 0) return null;

  return (
    <View>
      <View style={s.pipelineHeader}>
        <View style={[s.statusDot, { backgroundColor: color }]} />
        <Text style={s.pipelineHeaderText}>{label}</Text>
        <View style={[s.pipelineCountBadge, { backgroundColor: color + '22' }]}>
          <Text style={[s.pipelineCountText, { color }]}>{entries.length}</Text>
        </View>
      </View>
      {entries.map((entry) => (
        <LeaderRow key={entry.id} entry={entry} />
      ))}
    </View>
  );
}

// ─── Health Row ─────────────────────────────────────────────────────────────

function HealthRow({ entry }: { entry: typeof MINISTRY_HEALTH[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const healthColor = HEALTH_SCORE_COLORS[entry.healthScore];
  const volTrendColor = TREND_COLORS[entry.volunteerTrend];
  const attTrendColor = TREND_COLORS[entry.attendanceTrend];

  return (
    <View style={s.mgmtRow}>
      <View style={[s.squircleIcon, { backgroundColor: healthColor + '22' }]}>
        <IconSymbol name="heart.fill" size={16} color={healthColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.ministryName}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{entry.volunteerCount} vol</Text>
          <Text style={[s.mgmtMeta, { color: volTrendColor }]}>{TREND_ARROWS[entry.volunteerTrend]}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>Att</Text>
          <Text style={[s.mgmtMeta, { color: attTrendColor }]}>{TREND_ARROWS[entry.attendanceTrend]}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={[s.mgmtMeta, { color: C.green }]}>+{entry.newJoins}</Text>
          <Text style={[s.mgmtMeta, { color: C.red }]}>-{entry.departures}</Text>
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: healthColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: healthColor }]}>{HEALTH_SCORE_LABELS[entry.healthScore]}</Text>
      </View>
    </View>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─── FAB ────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color={C.label} />
    </Pressable>
  );
}

// ─── Filter Data ────────────────────────────────────────────────────────────

const MINISTRY_FILTERS: { key: MinistryFilter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'worship',     label: 'Worship' },
  { key: 'children',    label: 'Children' },
  { key: 'youth',       label: 'Youth' },
  { key: 'hospitality', label: 'Hospitality' },
  { key: 'tech',        label: 'Tech' },
  { key: 'outreach',    label: 'Outreach' },
  { key: 'custom',      label: 'Custom' },
];

const GROUP_FILTERS: { key: GroupFilter; label: string }[] = [
  { key: 'all',          label: 'All' },
  { key: 'life-groups',  label: 'Life Groups' },
  { key: 'bible-study',  label: 'Bible Study' },
  { key: 'mens',         label: "Men's" },
  { key: 'womens',       label: "Women's" },
  { key: 'youth',        label: 'Youth' },
  { key: 'couples',      label: 'Couples' },
  { key: 'recovery',     label: 'Recovery' },
  { key: 'custom',       label: 'Custom' },
];

const MGMT_SECTIONS: { key: MgmtSection; label: string }[] = [
  { key: 'scheduling', label: 'Scheduling' },
  { key: 'training',   label: 'Training' },
  { key: 'background', label: 'Background' },
  { key: 'leaders',    label: 'Leaders' },
  { key: 'health',     label: 'Health' },
];

const PIPELINE_STAGES: PipelineStage[] = ['serving', 'identified', 'mentoring', 'training', 'ready', 'placed'];

// ─── Main Component ─────────────────────────────────────────────────────────

export function MinistriesContent() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [ministryFilter, setMinistryFilter] = useState<MinistryFilter>('all');
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');
  const [mgmtSection, setMgmtSection] = useState<MgmtSection>('scheduling');

  // ── Data ──
  const filteredMinistries = useMemo(() => getMinistries(ministryFilter), [ministryFilter]);
  const filteredGroups = useMemo(() => getGroups(groupFilter), [groupFilter]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Ministry ──
  const longPressMinistry = useCallback((ministry: MinistryItem, pageY: number) => {
    setMenuData({
      title: ministry.name,
      subtitle: `${MINISTRY_CATEGORY_LABELS[ministry.category]} · ${ministry.memberCount} volunteers`,
      initials: ministry.leaderInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill', destructive: true },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Group ──
  const longPressGroup = useCallback((group: GroupItem, pageY: number) => {
    setMenuData({
      title: group.name,
      subtitle: `${GROUP_TYPE_LABELS[group.type]} · ${group.memberCount}/${group.capacity}`,
      initials: group.leaderInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'pin', label: 'Pin', icon: 'pin.fill' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill', destructive: true },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}

      >
        {/* ── PAGE 0: SERVE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Serve" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <ServeSummaryCard />
            <View style={{ marginTop: 4 }}>
              <FilterPills items={MINISTRY_FILTERS} active={ministryFilter} onSelect={setMinistryFilter} />
            </View>
            {filteredMinistries.map((ministry, idx) => (
              <View key={ministry.id}>
                {idx > 0 && <View style={s.separator} />}
                <MinistryRow
                  ministry={ministry}
                  onLongPress={(pageY) => longPressMinistry(ministry, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: CONNECT ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Connect" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <ConnectSummaryCard />
            <View style={{ marginTop: 4 }}>
              <FilterPills items={GROUP_FILTERS} active={groupFilter} onSelect={setGroupFilter} />
            </View>
            {filteredGroups.map((group, idx) => (
              <View key={group.id}>
                {idx > 0 && <View style={s.separator} />}
                <GroupRow
                  group={group}
                  onLongPress={(pageY) => longPressGroup(group, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 2: MANAGEMENT ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Management" />
            <FilterPills items={MGMT_SECTIONS} active={mgmtSection} onSelect={setMgmtSection} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {mgmtSection === 'scheduling' && (
              <>
                <SectionHeader title="Volunteer Assignments" />
                {VOLUNTEER_ASSIGNMENTS.map((entry) => (
                  <VolunteerAssignmentRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'training' && (
              <>
                <SectionHeader title="Training & Certifications" />
                {CHURCH_TRAINING_ENTRIES.map((entry) => (
                  <ChurchTrainingRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'background' && (
              <>
                <SectionHeader title="Background Checks" />
                {BACKGROUND_CHECKS.map((entry) => (
                  <BackgroundCheckRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'leaders' && (
              <>
                {PIPELINE_STAGES.map((stage) => (
                  <PipelineSection
                    key={stage}
                    stage={stage}
                    entries={getLeadersByStage(stage)}
                  />
                ))}
              </>
            )}
            {mgmtSection === 'health' && (
              <>
                <SectionHeader title="Ministry Health" />
                {MINISTRY_HEALTH.map((entry) => (
                  <HealthRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
    backgroundColor: C.blue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.blue,
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

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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

  // Squircle icon
  squircleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Meta
  playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  playerMeta: { fontSize: 12, color: C.muted },
  microBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  microBadgeText: { fontSize: 9, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  // Management rows
  mgmtRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  mgmtAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mgmtInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  mgmtName: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  mgmtDescription: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  mgmtMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mgmtMeta: {
    fontSize: 12,
    color: C.muted,
  },
  mgmtDot: {
    fontSize: 12,
    color: C.muted,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Progress bar
  progressBarBg: {
    height: 4,
    backgroundColor: C.separator,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 4,
    borderRadius: 2,
  },

  // Pipeline section
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pipelineHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  pipelineCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pipelineCountText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
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
