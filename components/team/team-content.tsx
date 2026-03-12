/**
 * Team — 3-page swipeable layout for business mode.
 * Page 0: Members — summary card, department filter pills, member list.
 * Page 1: Management — section pills, performance/goals/onboarding/time-off/training.
 * Page 2: Hiring — pipeline stages as vertical sections with candidate cards.
 * Identical SwipeablePages / LongPressContextMenu patterns as Roster/Parish/Campus/Office.
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
  TEAM_SUMMARY,
  REVIEW_ENTRIES,
  GOAL_ENTRIES,
  ONBOARDING_ENTRIES,
  TIME_OFF_REQUESTS,
  TRAINING_ENTRIES,
  getMembers,
  getCandidatesByStage,
  type TeamMemberItem,
  type MemberFilter,
  type MemberSort,
  type ManagementSection,
  type HiringFilter,
  type HiringStage,
  type Department,
  type MemberStatus,
  type ReviewCycleStatus,
  type GoalLevel,
  type GoalStatus,
  type TimeOffType,
  type TimeOffRequestStatus,
  type TrainingStatus,
  type CandidateSource,
  type CandidateCard as CandidateCardType,
} from '@/data/mock-team';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ── Color Maps ──

const DEPARTMENT_COLORS: Record<Department, string> = {
  product: '#3B82F6',
  sales: '#22C55E',
  marketing: '#8B5CF6',
  operations: '#F59E0B',
  leadership: '#EF4444',
  engineering: '#6366F1',
  design: '#EC4899',
};

const DEPARTMENT_LABELS: Record<Department, string> = {
  product: 'Product',
  sales: 'Sales',
  marketing: 'Marketing',
  operations: 'Operations',
  leadership: 'Leadership',
  engineering: 'Engineering',
  design: 'Design',
};

const MEMBER_STATUS_COLORS: Record<MemberStatus, string> = {
  active: '#22C55E',
  'on-leave': '#F59E0B',
  probation: '#EF4444',
  remote: '#3B82F6',
  'in-office': '#22C55E',
};

const MEMBER_STATUS_LABELS: Record<MemberStatus, string> = {
  active: 'Active',
  'on-leave': 'On Leave',
  probation: 'Probation',
  remote: 'Remote',
  'in-office': 'In Office',
};

const REVIEW_CYCLE_COLORS: Record<ReviewCycleStatus, string> = {
  upcoming: '#F59E0B',
  'in-progress': '#3B82F6',
  completed: '#22C55E',
};

const REVIEW_CYCLE_LABELS: Record<ReviewCycleStatus, string> = {
  upcoming: 'Upcoming',
  'in-progress': 'In Progress',
  completed: 'Completed',
};

const GOAL_STATUS_COLORS: Record<GoalStatus, string> = {
  'on-track': '#22C55E',
  'at-risk': '#F59E0B',
  behind: '#EF4444',
  completed: '#3B82F6',
};

const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  'on-track': 'On Track',
  'at-risk': 'At Risk',
  behind: 'Behind',
  completed: 'Completed',
};

const GOAL_LEVEL_COLORS: Record<GoalLevel, string> = {
  company: '#8B5CF6',
  department: '#3B82F6',
  individual: '#A1A1AA',
};

const GOAL_LEVEL_LABELS: Record<GoalLevel, string> = {
  company: 'Company',
  department: 'Department',
  individual: 'Individual',
};

const TIME_OFF_TYPE_COLORS: Record<TimeOffType, string> = {
  pto: '#3B82F6',
  sick: '#EF4444',
  personal: '#F59E0B',
  parental: '#8B5CF6',
};

const TIME_OFF_TYPE_LABELS: Record<TimeOffType, string> = {
  pto: 'PTO',
  sick: 'Sick',
  personal: 'Personal',
  parental: 'Parental',
};

const TIME_OFF_REQUEST_COLORS: Record<TimeOffRequestStatus, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  denied: '#EF4444',
};

const TIME_OFF_REQUEST_LABELS: Record<TimeOffRequestStatus, string> = {
  pending: 'Pending',
  approved: 'Approved',
  denied: 'Denied',
};

const TRAINING_STATUS_COLORS: Record<TrainingStatus, string> = {
  'not-started': '#A1A1AA',
  'in-progress': '#3B82F6',
  completed: '#22C55E',
  overdue: '#EF4444',
};

const TRAINING_STATUS_LABELS: Record<TrainingStatus, string> = {
  'not-started': 'Not Started',
  'in-progress': 'In Progress',
  completed: 'Completed',
  overdue: 'Overdue',
};

const HIRING_STAGE_COLORS: Record<HiringStage, string> = {
  posted: '#A1A1AA',
  applications: '#F59E0B',
  screened: '#3B82F6',
  interviewed: '#8B5CF6',
  offered: '#6366F1',
  hired: '#22C55E',
};

const HIRING_STAGE_LABELS: Record<HiringStage, string> = {
  posted: 'Posted',
  applications: 'Applications',
  screened: 'Screened',
  interviewed: 'Interviewed',
  offered: 'Offered',
  hired: 'Hired',
};

const SOURCE_COLORS: Record<CandidateSource, string> = {
  referral: '#22C55E',
  'job-board': '#3B82F6',
  inbound: '#8B5CF6',
  recruiter: '#F59E0B',
};

const SOURCE_LABELS: Record<CandidateSource, string> = {
  referral: 'Referral',
  'job-board': 'Job Board',
  inbound: 'Inbound',
  recruiter: 'Recruiter',
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

// ─── Team Summary Card ──────────────────────────────────────────────────────

function TeamSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const departments: { key: Department; label: string; count: number }[] = [
    { key: 'engineering', label: 'Eng',   count: TEAM_SUMMARY.departmentBreakdown.engineering },
    { key: 'product',     label: 'Prod',  count: TEAM_SUMMARY.departmentBreakdown.product },
    { key: 'sales',       label: 'Sales', count: TEAM_SUMMARY.departmentBreakdown.sales },
    { key: 'marketing',   label: 'Mktg',  count: TEAM_SUMMARY.departmentBreakdown.marketing },
    { key: 'operations',  label: 'Ops',   count: TEAM_SUMMARY.departmentBreakdown.operations },
    { key: 'leadership',  label: 'Lead',  count: TEAM_SUMMARY.departmentBreakdown.leadership },
    { key: 'design',      label: 'Dsgn',  count: TEAM_SUMMARY.departmentBreakdown.design },
  ];

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>TEAM</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{TEAM_SUMMARY.totalHeadcount} people</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        {departments.map((d) => (
          <View key={d.key} style={s.summaryPosItem}>
            <Text style={s.summaryPosCount}>{d.count}</Text>
            <Text style={s.summaryPosLabel}>{d.label}</Text>
          </View>
        ))}
      </View>
      <View style={s.summaryFooter}>
        <Text style={s.summaryScholarship}>
          {TEAM_SUMMARY.newHiresThisMonth} new hires this month
        </Text>
      </View>
    </View>
  );
}

// ─── Member Row ─────────────────────────────────────────────────────────────

function MemberRow({
  member,
  onLongPress,
}: {
  member: TeamMemberItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const deptColor = DEPARTMENT_COLORS[member.department];
  const statusColor = MEMBER_STATUS_COLORS[member.status];
  const onlineColor = member.isOnline ? '#22C55E' : '#52525B';

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.memberAvatarContainer}>
        <View style={s.playerAvatar}>
          <Text style={s.playerInitials}>{member.initials}</Text>
        </View>
        <View style={[s.onlineDot, { backgroundColor: onlineColor }]} />
      </View>
      <View style={s.rowContent}>
        <View style={s.playerNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{member.name}</Text>
          <Text style={s.username}>@{member.username}</Text>
        </View>
        <Text style={s.memberTitle} numberOfLines={1}>{member.title}</Text>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: deptColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: deptColor }]}>{DEPARTMENT_LABELS[member.department]}</Text>
          </View>
          <View style={[s.statusDot, { backgroundColor: statusColor }]} />
          <Text style={s.playerMeta}>{MEMBER_STATUS_LABELS[member.status]}</Text>
        </View>
      </View>
      <View style={s.tenureContainer}>
        <Text style={s.tenureValue}>{member.tenure}</Text>
        <Text style={s.tenureLabel}>{member.startDate}</Text>
      </View>
    </Pressable>
  );
}

// ─── Review Row ─────────────────────────────────────────────────────────────

function ReviewRow({ entry }: { entry: typeof REVIEW_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const cycleColor = REVIEW_CYCLE_COLORS[entry.cycleStatus];
  const selfColor = entry.selfAssessment === 'submitted' ? '#22C55E' : '#F59E0B';
  const mgrColor = entry.managerAssessment === 'submitted' ? '#22C55E' : '#F59E0B';

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.employeeName}</Text>
        <Text style={s.mgmtDescription}>Reviewer: {entry.reviewer}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: selfColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: selfColor }]}>Self: {entry.selfAssessment === 'submitted' ? 'Done' : 'Pending'}</Text>
          </View>
          <View style={[s.microBadge, { backgroundColor: mgrColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: mgrColor }]}>Mgr: {entry.managerAssessment === 'submitted' ? 'Done' : 'Pending'}</Text>
          </View>
          {entry.score !== null && (
            <Text style={[s.mgmtMeta, { color: '#FFFFFF', fontWeight: '600' }]}>{entry.score.toFixed(1)}</Text>
          )}
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: cycleColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: cycleColor }]}>{REVIEW_CYCLE_LABELS[entry.cycleStatus]}</Text>
      </View>
    </View>
  );
}

// ─── Goal Row ───────────────────────────────────────────────────────────────

function GoalRow({ entry }: { entry: typeof GOAL_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = GOAL_STATUS_COLORS[entry.status];
  const levelColor = GOAL_LEVEL_COLORS[entry.level];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.ownerInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.title}</Text>
        <Text style={s.mgmtDescription}>{entry.ownerName}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: levelColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: levelColor }]}>{GOAL_LEVEL_LABELS[entry.level]}</Text>
          </View>
          <Text style={s.mgmtMeta}>{entry.deadline}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{entry.keyResultsCompleted}/{entry.keyResults} KRs</Text>
        </View>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: `${entry.progressPercent}%`, backgroundColor: statusColor }]} />
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{GOAL_STATUS_LABELS[entry.status]}</Text>
      </View>
    </View>
  );
}

// ─── Onboarding Row ─────────────────────────────────────────────────────────

function OnboardingRow({ entry }: { entry: typeof ONBOARDING_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const pct = Math.round((entry.tasksCompleted / entry.tasksTotal) * 100);
  const progressColor = pct >= 80 ? '#22C55E' : pct >= 50 ? '#F59E0B' : '#3B82F6';

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.employeeName}</Text>
        <Text style={s.mgmtDescription}>Started {entry.startDate}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{entry.tasksCompleted}/{entry.tasksTotal} tasks</Text>
          {entry.buddyName && (
            <>
              <Text style={s.mgmtDot}>·</Text>
              <Text style={s.mgmtMeta}>Buddy: {entry.buddyName}</Text>
            </>
          )}
        </View>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: `${pct}%`, backgroundColor: progressColor }]} />
        </View>
      </View>
    </View>
  );
}

// ─── Time Off Row ───────────────────────────────────────────────────────────

function TimeOffRow({ entry }: { entry: typeof TIME_OFF_REQUESTS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = TIME_OFF_TYPE_COLORS[entry.type];
  const statusColor = TIME_OFF_REQUEST_COLORS[entry.status];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.employeeName}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: typeColor }]}>{TIME_OFF_TYPE_LABELS[entry.type]}</Text>
          </View>
          <Text style={s.mgmtMeta}>{entry.startDate} – {entry.endDate}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{entry.days}d</Text>
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{TIME_OFF_REQUEST_LABELS[entry.status]}</Text>
      </View>
    </View>
  );
}

// ─── Training Row ───────────────────────────────────────────────────────────

function TrainingRow({ entry }: { entry: typeof TRAINING_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = TRAINING_STATUS_COLORS[entry.status];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.employeeName}</Text>
        <Text style={s.mgmtDescription}>{entry.programName}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>Due {entry.dueDate}</Text>
          {entry.certification && (
            <>
              <Text style={s.mgmtDot}>·</Text>
              <View style={[s.microBadge, { backgroundColor: '#8B5CF6' + '22' }]}>
                <Text style={[s.microBadgeText, { color: '#8B5CF6' }]}>Cert</Text>
              </View>
            </>
          )}
        </View>
        <View style={s.progressBarBg}>
          <View style={[s.progressBarFill, { width: `${entry.completionPercent}%`, backgroundColor: statusColor }]} />
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{TRAINING_STATUS_LABELS[entry.status]}</Text>
      </View>
    </View>
  );
}

// ─── Candidate Card View ────────────────────────────────────────────────────

function CandidateCardView({
  candidate,
  onLongPress,
}: {
  candidate: CandidateCardType;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const sourceColor = SOURCE_COLORS[candidate.source];

  return (
    <Pressable
      style={({ pressed }) => [s.prospectCard, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.prospectAvatar}>
        <Text style={s.prospectInitials}>{candidate.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.playerNameRow}>
          <Text style={s.mgmtName}>{candidate.name}</Text>
        </View>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{candidate.position}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <View style={[s.microBadge, { backgroundColor: sourceColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: sourceColor }]}>{SOURCE_LABELS[candidate.source]}</Text>
          </View>
        </View>
        <View style={s.mgmtMetaRow}>
          <Text style={s.prospectAction}>{candidate.lastAction}</Text>
        </View>
      </View>
      {candidate.rating !== null && (
        <View style={s.ratingContainer}>
          <Text style={s.ratingValue}>{candidate.rating}</Text>
          <Text style={s.ratingLabel}>rating</Text>
        </View>
      )}
    </Pressable>
  );
}

// ─── Pipeline Section ───────────────────────────────────────────────────────

function PipelineSection({
  stage,
  candidates,
  onLongPress,
}: {
  stage: HiringStage;
  candidates: CandidateCardType[];
  onLongPress: (candidate: CandidateCardType, pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const color = HIRING_STAGE_COLORS[stage];
  const label = HIRING_STAGE_LABELS[stage];

  if (candidates.length === 0) return null;

  return (
    <View>
      <View style={s.pipelineHeader}>
        <View style={[s.statusDot, { backgroundColor: color }]} />
        <Text style={s.pipelineHeaderText}>{label}</Text>
        <View style={[s.pipelineCountBadge, { backgroundColor: color + '22' }]}>
          <Text style={[s.pipelineCountText, { color }]}>{candidates.length}</Text>
        </View>
      </View>
      {candidates.map((candidate) => (
        <CandidateCardView
          key={candidate.id}
          candidate={candidate}
          onLongPress={(pageY) => onLongPress(candidate, pageY)}
        />
      ))}
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

const MEMBER_FILTERS: { key: MemberFilter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'product',     label: 'Product' },
  { key: 'sales',       label: 'Sales' },
  { key: 'marketing',   label: 'Marketing' },
  { key: 'operations',  label: 'Operations' },
  { key: 'leadership',  label: 'Leadership' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'design',      label: 'Design' },
];

const MGMT_SECTIONS: { key: ManagementSection; label: string }[] = [
  { key: 'performance', label: 'Performance' },
  { key: 'goals',       label: 'Goals' },
  { key: 'onboarding',  label: 'Onboarding' },
  { key: 'time-off',    label: 'Time Off' },
  { key: 'training',    label: 'Training' },
];

const HIRING_FILTERS: { key: HiringFilter; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'by-department', label: 'By Department' },
  { key: 'by-priority',   label: 'By Priority' },
  { key: 'by-status',     label: 'By Status' },
];

const HIRING_STAGES: HiringStage[] = ['posted', 'applications', 'screened', 'interviewed', 'offered', 'hired'];

// ─── Main Component ─────────────────────────────────────────────────────────

export function TeamContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>('all');
  const [memberSort] = useState<MemberSort>('name');
  const [mgmtSection, setMgmtSection] = useState<ManagementSection>('performance');
  const [hiringFilter, setHiringFilter] = useState<HiringFilter>('all');

  // ── Data ──
  const filteredMembers = useMemo(() => getMembers(memberFilter, memberSort), [memberFilter, memberSort]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Member ──
  const longPressMember = useCallback((member: TeamMemberItem, pageY: number) => {
    setMenuData({
      title: member.name,
      subtitle: `${member.title} · ${DEPARTMENT_LABELS[member.department]}`,
      initials: member.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'edit-role', label: 'Edit Role', icon: 'pencil' },
        { key: 'change-dept', label: 'Change Department', icon: 'arrow.right.arrow.left' },
        { key: 'offboard', label: 'Offboard', icon: 'person.badge.minus', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Candidate ──
  const longPressCandidate = useCallback((candidate: CandidateCardType, pageY: number) => {
    setMenuData({
      title: candidate.name,
      subtitle: `${candidate.position} · ${DEPARTMENT_LABELS[candidate.department]}`,
      initials: candidate.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'notes', label: 'Add Notes', icon: 'doc.badge.plus' },
        { key: 'reject', label: 'Reject', icon: 'xmark.circle.fill', destructive: true },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill', destructive: true },
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
        {/* ── PAGE 0: MEMBERS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Members" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <TeamSummaryCard />
            <View style={{ marginTop: 4 }}>
              <FilterPills items={MEMBER_FILTERS} active={memberFilter} onSelect={setMemberFilter} />
            </View>
            {filteredMembers.map((member, idx) => (
              <View key={member.id}>
                {idx > 0 && <View style={s.separator} />}
                <MemberRow
                  member={member}
                  onLongPress={(pageY) => longPressMember(member, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: MANAGEMENT ── */}
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
            {mgmtSection === 'performance' && (
              <>
                <SectionHeader title="Performance Reviews" />
                {REVIEW_ENTRIES.map((entry) => (
                  <ReviewRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'goals' && (
              <>
                <SectionHeader title="Goals & OKRs" />
                {GOAL_ENTRIES.map((entry) => (
                  <GoalRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'onboarding' && (
              <>
                <SectionHeader title="Onboarding" />
                {ONBOARDING_ENTRIES.map((entry) => (
                  <OnboardingRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'time-off' && (
              <>
                <SectionHeader title="Time Off Requests" />
                {TIME_OFF_REQUESTS.map((entry) => (
                  <TimeOffRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'training' && (
              <>
                <SectionHeader title="Training & Development" />
                {TRAINING_ENTRIES.map((entry) => (
                  <TrainingRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
          </ScrollView>
        </View>

        {/* ── PAGE 2: HIRING ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Hiring" />
            <FilterPills items={HIRING_FILTERS} active={hiringFilter} onSelect={setHiringFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {HIRING_STAGES.map((stage) => (
              <PipelineSection
                key={stage}
                stage={stage}
                candidates={getCandidatesByStage(stage)}
                onLongPress={longPressCandidate}
              />
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
    marginBottom: 12,
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
  summaryFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.separator,
    paddingTop: 10,
  },
  summaryScholarship: {
    fontSize: 13,
    color: C.muted,
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

  // Member row
  memberAvatarContainer: {
    position: 'relative',
  },
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: C.bg,
  },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  username: { fontSize: 13, fontWeight: '500', color: C.muted },
  memberTitle: { fontSize: 13, color: C.secondary, marginTop: 1 },
  playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  playerMeta: { fontSize: 12, color: C.muted },
  microBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  microBadgeText: { fontSize: 9, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  tenureContainer: { alignItems: 'flex-end', minWidth: 50 },
  tenureValue: { fontSize: 13, fontWeight: '600', color: C.label },
  tenureLabel: { fontSize: 10, color: C.muted, marginTop: 1 },

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

  // Candidate / prospect card
  prospectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  prospectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prospectInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  prospectAction: { fontSize: 11, color: C.muted },
  ratingContainer: { alignItems: 'center', minWidth: 36 },
  ratingValue: { fontSize: 18, fontWeight: '700', color: C.label },
  ratingLabel: { fontSize: 9, fontWeight: '600', color: C.muted },

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

