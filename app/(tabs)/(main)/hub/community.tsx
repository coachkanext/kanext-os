/**
 * Community Hub — operational center for community/church brands.
 * RBAC flip: admin sees dashboard, member sees public-facing community page.
 * Three views: Overview / Departments / Groups via centered dropdown pill.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  COMMUNITY_PROFILE, COMMUNITY_LEADERSHIP, COMMUNITY_ANALYTICS,
  COMMUNITY_CHART_DATA, COMMUNITY_DEPARTMENTS, COMMUNITY_GROUPS,
  COMMUNITY_EVENTS, COMMUNITY_CARE_REQUESTS, COMMUNITY_ANNOUNCEMENTS,
  getCommunityChartMax,
  type CommunityChartMetric, type CommunityDepartment, type CommunityGroup,
} from '@/data/mock-community-hub';

type CommunityTab = 'Overview' | 'Departments' | 'Groups';

const OVERVIEW_PILLS_ADMIN   = ['All', 'Attendance', 'Giving', 'Volunteers', 'Care'];
const DEPT_PILLS             = ['All', 'Worship', 'Youth', 'Hospitality', 'Outreach', 'Education'];
const GROUPS_PILLS_ADMIN     = ['All', 'Active', 'Inactive'];
const GROUPS_PILLS_MEMBER    = ['All', 'Open', 'My Groups', 'Full'];

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const BAR_MAX_H  = 100;

function pillsForTab(tab: CommunityTab, isAdmin: boolean): string[] {
  if (tab === 'Overview')    return isAdmin ? OVERVIEW_PILLS_ADMIN : [];
  if (tab === 'Departments') return DEPT_PILLS;
  return isAdmin ? GROUPS_PILLS_ADMIN : GROUPS_PILLS_MEMBER;
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ icon, value, label, trend, alert, C }: {
  icon: string; value: string; label: string; trend: number; alert?: boolean; C: ComponentColors;
}) {
  const up = trend >= 0;
  return (
    <View style={[cStyles.statCard, { backgroundColor: C.surface }]}>
      <IconSymbol name={icon as any} size={20} color={alert ? '#B85C5C' : C.accent} />
      <Text style={[cStyles.statValue, { color: C.label }]}>{value}</Text>
      <Text style={[cStyles.statLabel, { color: C.secondary }]}>{label}</Text>
      {trend !== 0 && (
        <View style={[cStyles.trendBadge, { backgroundColor: up ? '#5A8A6E22' : '#B85C5C22' }]}>
          <Text style={[cStyles.trendText, { color: up ? '#5A8A6E' : '#B85C5C' }]}>
            {up ? '+' : ''}{trend}%
          </Text>
        </View>
      )}
    </View>
  );
}

const cStyles = StyleSheet.create({
  statCard: {
    width: 120, borderRadius: 14, padding: 14, gap: 6, marginRight: 10,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 12 },
  trendBadge: { borderRadius: 8, paddingHorizontal: 7, paddingVertical: 3 },
  trendText: { fontSize: 11, fontWeight: '700' },
});

// ── Community Bar Chart ───────────────────────────────────────────────────────

function CommunityBarChart({ metric, C }: { metric: CommunityChartMetric; C: ComponentColors }) {
  const max = getCommunityChartMax(metric);
  return (
    <View style={[chartS.wrap, { backgroundColor: C.surface }]}>
      <View style={chartS.bars}>
        {COMMUNITY_CHART_DATA.map(pt => {
          const h = max > 0 ? Math.round((pt[metric] / max) * BAR_MAX_H) : 4;
          return (
            <View key={pt.label} style={chartS.barCol}>
              <View style={chartS.barTrack}>
                <View style={[chartS.bar, { height: h, backgroundColor: C.accent }]} />
              </View>
              <Text style={[chartS.barLabel, { color: C.muted }]}>{pt.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const chartS = StyleSheet.create({
  wrap:    { borderRadius: 14, padding: 14, marginBottom: 20 },
  bars:    { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 24, gap: 4 },
  barCol:  { flex: 1, alignItems: 'center', gap: 4 },
  barTrack:{ flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
  bar:     { width: '80%', borderRadius: 4, minHeight: 4 },
  barLabel:{ fontSize: 9, fontWeight: '500' },
});

// ── Event Card ────────────────────────────────────────────────────────────────

function EventCard({ event, isAdmin, C }: {
  event: typeof COMMUNITY_EVENTS[0]; isAdmin: boolean; C: ComponentColors;
}) {
  const volFilled = event.volunteersNeeded > 0;
  const volNeeded = event.volunteersNeeded - event.volunteersFilled;
  return (
    <View style={[evS.card, { backgroundColor: C.surface }]}>
      <View style={evS.header}>
        <View style={evS.headerLeft}>
          <Text style={[evS.title, { color: C.label }]}>{event.title}</Text>
          <Text style={[evS.meta, { color: C.secondary }]}>
            {event.date} · {event.time}
          </Text>
          <View style={evS.locRow}>
            <IconSymbol name="mappin" size={12} color={C.muted} />
            <Text style={[evS.loc, { color: C.muted }]}>{event.location}</Text>
          </View>
        </View>
        {!event.isPublic && (
          <View style={[evS.privateBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[evS.privateBadgeText, { color: C.muted }]}>Private</Text>
          </View>
        )}
      </View>
      {volFilled && (
        <View style={evS.volRow}>
          <View style={[evS.volTrack, { backgroundColor: C.surfacePressed }]}>
            <View style={[
              evS.volFill,
              { width: `${(event.volunteersFilled / event.volunteersNeeded) * 100}%` as any,
                backgroundColor: volNeeded > 0 ? '#D97757' : '#5A8A6E' }
            ]} />
          </View>
          <Text style={[evS.volText, { color: volNeeded > 0 ? '#D97757' : '#5A8A6E' }]}>
            {volNeeded > 0 ? `${volNeeded} vol needed` : 'Fully staffed'}
          </Text>
        </View>
      )}
      {!isAdmin && event.isPublic && (
        <Pressable
          style={[evS.rsvpBtn, { borderColor: C.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <Text style={[evS.rsvpText, { color: C.accent }]}>RSVP</Text>
        </Pressable>
      )}
    </View>
  );
}

const evS = StyleSheet.create({
  card:          { borderRadius: 14, padding: 14, marginBottom: 10, gap: 10 },
  header:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft:    { flex: 1, gap: 3 },
  title:         { fontSize: 15, fontWeight: '700' },
  meta:          { fontSize: 12 },
  locRow:        { flexDirection: 'row', alignItems: 'center', gap: 4 },
  loc:           { fontSize: 12 },
  privateBadge:  { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  privateBadgeText: { fontSize: 10, fontWeight: '600' },
  volRow:        { flexDirection: 'row', alignItems: 'center', gap: 10 },
  volTrack:      { flex: 1, height: 5, borderRadius: 3, overflow: 'hidden' },
  volFill:       { height: 5, borderRadius: 3 },
  volText:       { fontSize: 11, fontWeight: '600', width: 90 },
  rsvpBtn:       { paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, alignItems: 'center' },
  rsvpText:      { fontSize: 13, fontWeight: '700' },
});

// ── Care Request Row ──────────────────────────────────────────────────────────

function CareRow({ item, C, last }: {
  item: typeof COMMUNITY_CARE_REQUESTS[0]; C: ComponentColors; last: boolean;
}) {
  const statusColor = item.status === 'pending' ? '#D97757'
    : item.status === 'in-progress' ? '#1D9BF0' : '#5A8A6E';
  return (
    <View style={[crS.row, !last && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
      <View style={[crS.typeBadge, { backgroundColor: C.surfacePressed }]}>
        <Text style={[crS.typeText, { color: C.secondary }]}>{item.type}</Text>
      </View>
      <View style={crS.info}>
        <Text style={[crS.summary, { color: C.label }]} numberOfLines={1}>{item.summary}</Text>
        <Text style={[crS.meta, { color: C.muted }]}>
          {item.anonymous ? 'Anonymous' : item.submitterName} · {item.submittedAgo}
        </Text>
      </View>
      <View style={[crS.statusDot, { backgroundColor: statusColor }]} />
    </View>
  );
}

const crS = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12 },
  typeBadge:{ borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  typeText: { fontSize: 10, fontWeight: '700' },
  info:     { flex: 1 },
  summary:  { fontSize: 13, fontWeight: '500' },
  meta:     { fontSize: 11, marginTop: 2 },
  statusDot:{ width: 8, height: 8, borderRadius: 4 },
});

// ── Leader Card ───────────────────────────────────────────────────────────────

function LeaderCard({ leader, C }: { leader: typeof COMMUNITY_LEADERSHIP[0]; C: ComponentColors }) {
  return (
    <View style={[ldrS.card, { backgroundColor: C.surface }]}>
      <View style={[ldrS.avatar, { backgroundColor: `hsl(${leader.hue},42%,28%)` }]}>
        <Text style={ldrS.avatarText}>{leader.initials}</Text>
      </View>
      <Text style={[ldrS.name, { color: C.label }]} numberOfLines={1}>{leader.name}</Text>
      <Text style={[ldrS.role, { color: C.secondary }]} numberOfLines={1}>{leader.role}</Text>
    </View>
  );
}

const ldrS = StyleSheet.create({
  card:      { width: 110, alignItems: 'center', gap: 6, marginRight: 12 },
  avatar:    { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText:{ fontSize: 18, fontWeight: '700', color: '#fff' },
  name:      { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  role:      { fontSize: 11, textAlign: 'center' },
});

// ── Department Card ───────────────────────────────────────────────────────────

function DepartmentCard({
  dept, isAdmin, expanded, onToggle, C,
}: {
  dept: CommunityDepartment; isAdmin: boolean;
  expanded: boolean; onToggle: () => void; C: ComponentColors;
}) {
  const totalNeeded = dept.volunteerNeeds.reduce((s, n) => s + n.needed, 0);
  const totalFilled = dept.volunteerNeeds.reduce((s, n) => s + n.filled, 0);
  const hasGap = totalFilled < totalNeeded;

  return (
    <Pressable onPress={onToggle} style={[deptS.card, { backgroundColor: C.surface }]}>
      <View style={deptS.row}>
        <View style={[deptS.iconWrap, { backgroundColor: `hsl(${dept.hue},42%,28%)` }]}>
          <IconSymbol name={dept.icon as any} size={18} color="#fff" />
        </View>
        <View style={deptS.info}>
          <Text style={[deptS.name, { color: C.label }]}>{dept.name}</Text>
          <Text style={[deptS.sub, { color: C.secondary }]}>
            {dept.leaderName} · {dept.memberCount} members
          </Text>
          <Text style={[deptS.meeting, { color: C.muted }]}>{dept.nextMeeting}</Text>
        </View>
        <View style={deptS.right}>
          {isAdmin && hasGap && (
            <View style={[deptS.gapBadge, { backgroundColor: '#D9775718' }]}>
              <Text style={deptS.gapText}>vol gap</Text>
            </View>
          )}
          <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
        </View>
      </View>

      {expanded && (
        <View style={[deptS.detail, { borderTopColor: C.separator }]}>
          <Text style={[deptS.description, { color: C.secondary }]}>{dept.description}</Text>

          {isAdmin && dept.volunteerNeeds.length > 0 && (
            <View style={deptS.volSection}>
              <Text style={[deptS.volTitle, { color: C.label }]}>Volunteer Needs</Text>
              {dept.volunteerNeeds.map(vn => (
                <View key={vn.role} style={deptS.volNeedRow}>
                  <Text style={[deptS.volRole, { color: C.secondary }]}>{vn.role}</Text>
                  <Text style={[deptS.volCount, { color: vn.filled < vn.needed ? '#D97757' : '#5A8A6E' }]}>
                    {vn.filled}/{vn.needed}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <Pressable
            style={[deptS.actionBtn, { borderColor: C.accent }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[deptS.actionBtnText, { color: C.accent }]}>
              {isAdmin ? 'Manage Dept' : 'Join / Volunteer'}
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
}

const deptS = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:         { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  iconWrap:    { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  info:        { flex: 1, gap: 2 },
  name:        { fontSize: 15, fontWeight: '700' },
  sub:         { fontSize: 12 },
  meeting:     { fontSize: 11 },
  right:       { alignItems: 'flex-end', gap: 6 },
  gapBadge:    { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  gapText:     { fontSize: 10, fontWeight: '700', color: '#D97757' },
  detail:      { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 12 },
  description: { fontSize: 13, lineHeight: 19 },
  volSection:  { gap: 6 },
  volTitle:    { fontSize: 13, fontWeight: '700' },
  volNeedRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  volRole:     { fontSize: 13 },
  volCount:    { fontSize: 13, fontWeight: '700' },
  actionBtn:   { paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', marginTop: 2 },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
});

// ── Group Card ────────────────────────────────────────────────────────────────

function GroupCard({
  group, isAdmin, expanded, onToggle, isJoined, onJoin, router, C,
}: {
  group: CommunityGroup; isAdmin: boolean;
  expanded: boolean; onToggle: () => void;
  isJoined: boolean; onJoin: () => void;
  router: any; C: ComponentColors;
}) {
  const spotsLeft = group.capacity - group.memberCount;
  return (
    <Pressable onPress={onToggle} style={[grpS.card, { backgroundColor: C.surface }]}>
      <View style={grpS.row}>
        <View style={grpS.info}>
          <View style={grpS.titleRow}>
            <Text style={[grpS.name, { color: C.label }]}>{group.name}</Text>
            {!isAdmin && (
              <View style={[
                grpS.statusBadge,
                { backgroundColor: group.isOpen ? '#5A8A6E22' : '#B85C5C22' },
              ]}>
                <Text style={[grpS.statusText, { color: group.isOpen ? '#5A8A6E' : '#B85C5C' }]}>
                  {group.isOpen ? 'Open' : 'Full'}
                </Text>
              </View>
            )}
            {isAdmin && (
              <View style={[
                grpS.statusBadge,
                { backgroundColor: group.status === 'active' ? '#5A8A6E22' : C.surfacePressed },
              ]}>
                <Text style={[grpS.statusText, {
                  color: group.status === 'active' ? '#5A8A6E' : C.muted,
                }]}>{group.status}</Text>
              </View>
            )}
          </View>
          <Text style={[grpS.sub, { color: C.secondary }]}>
            {group.leaderName} · {group.schedule}
          </Text>
          <Text style={[grpS.dept, { color: C.muted }]}>
            {group.departmentName} · {group.memberCount}/{group.capacity} members
          </Text>
        </View>
        <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.muted} />
      </View>

      {expanded && (
        <View style={[grpS.detail, { borderTopColor: C.separator }]}>
          <Text style={[grpS.description, { color: C.secondary }]}>{group.description}</Text>
          <View style={grpS.actions}>
            {!isAdmin && (
              <Pressable
                style={[
                  grpS.btn,
                  isJoined
                    ? { backgroundColor: C.surfacePressed }
                    : group.isOpen
                      ? { backgroundColor: C.accent }
                      : { borderWidth: 1.5, borderColor: C.separator },
                ]}
                onPress={() => {
                  if (group.isOpen && !isJoined) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onJoin(); }
                }}
              >
                <Text style={[grpS.btnText, {
                  color: isJoined ? C.secondary : group.isOpen ? '#fff' : C.muted,
                }]}>
                  {isJoined ? 'Joined' : group.isOpen ? 'Join Group' : 'Group Full'}
                </Text>
              </Pressable>
            )}
            {(isJoined || isAdmin) && (
              <Pressable
                style={[grpS.btn, { borderWidth: 1.5, borderColor: C.separator }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push('/(tabs)/(main)/messages' as any);
                }}
              >
                <IconSymbol name="bubble.left.fill" size={14} color={C.secondary} />
                <Text style={[grpS.btnText, { color: C.secondary }]}>Group Room</Text>
              </Pressable>
            )}
          </View>
          {!isAdmin && !group.isOpen && (
            <Text style={[grpS.fullNote, { color: C.muted }]}>
              {spotsLeft === 0 ? 'This group is full. ' : ''}Request to join when a spot opens.
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}

const grpS = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:         { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  info:        { flex: 1, gap: 3 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:        { fontSize: 15, fontWeight: '700' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  sub:         { fontSize: 12 },
  dept:        { fontSize: 11 },
  detail:      { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, gap: 10 },
  description: { fontSize: 13, lineHeight: 19 },
  actions:     { flexDirection: 'row', gap: 8 },
  btn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                 gap: 6, paddingVertical: 9, borderRadius: 10 },
  btnText:     { fontSize: 13, fontWeight: '700' },
  fullNote:    { fontSize: 11, textAlign: 'center' },
});

// ── Section Header ────────────────────────────────────────────────────────────

function SecHeader({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={[secS.title, { color: C.label }]}>{title}</Text>;
}
const secS = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', marginBottom: 12, marginTop: 4 },
});

// ── Community Screen ──────────────────────────────────────────────────────────

export default function CommunityHubScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [isAdmin, setIsAdmin]           = useState(true);
  const [activeTab, setActiveTab]       = useState<CommunityTab>('Overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [chartMetric, setChartMetric]   = useState<CommunityChartMetric>('attendance');
  const [expandedDeptId, setExpandedDeptId]   = useState<string | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [joinedGroups, setJoinedGroups] = useState<Set<string>>(new Set(['grp1']));

  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY     = useRef(0);

  const topBarH         = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + PILL_ROW_H + 8;

  const pills = pillsForTab(activeTab, isAdmin);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const toggleFilterPills = useCallback(() => {
    setFilterPillsVisible(prev => {
      const next = !prev;
      Animated.timing(pillsRevealAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
      return next;
    });
  }, [pillsRevealAnim]);

  const handleTabSelect = useCallback((tab: CommunityTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill('All');
    setFilterPillsVisible(false);
    pillsRevealAnim.setValue(0);
  }, [pillsRevealAnim]);

  // ── Admin Overview ─────────────────────────────────────────────────────────

  const renderAdminOverview = () => {
    const a = COMMUNITY_ANALYTICS;
    const showAll  = selectedPill === 'All';
    const showAttn = showAll || selectedPill === 'Attendance';
    const showGive = showAll || selectedPill === 'Giving';
    const showVol  = showAll || selectedPill === 'Volunteers';
    const showCare = showAll || selectedPill === 'Care';

    // volunteer gaps: depts where total filled < total needed
    const volGaps = COMMUNITY_DEPARTMENTS.filter(d =>
      d.volunteerNeeds.some(n => n.filled < n.needed)
    );

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Stats */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {(showAll || showAttn) && (
            <StatCard icon="person.3.fill" value={a.memberCount.toLocaleString()} label="Members" trend={a.memberTrend} C={C} />
          )}
          {showAttn && (
            <StatCard icon="calendar.badge.checkmark" value={String(a.attendance)} label="Attendance" trend={a.attendanceTrend} C={C} />
          )}
          {showGive && (
            <StatCard icon="dollarsign.circle.fill" value={`$${a.giving.toLocaleString()}`} label="Giving" trend={a.givingTrend} C={C} />
          )}
          {showVol && (
            <StatCard icon="hands.and.sparkles.fill" value={String(a.volunteers)} label="Volunteers" trend={a.volunteerTrend} C={C} />
          )}
          {(showAll || showCare) && (
            <StatCard icon="heart.text.square.fill" value={String(a.careRequests)} label="Care Requests" trend={a.careRequestsTrend} alert C={C} />
          )}
        </ScrollView>

        {/* Chart */}
        {(showAttn || showGive || showVol) && (
          <>
            <SecHeader title="Trend" C={C} />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
              {(['attendance', 'giving', 'volunteers'] as CommunityChartMetric[]).map(m => (
                <Pressable
                  key={m}
                  style={[
                    s.metricBtn,
                    chartMetric === m ? { backgroundColor: C.label } : { borderColor: C.separator, borderWidth: 1 },
                  ]}
                  onPress={() => { Haptics.selectionAsync(); setChartMetric(m); }}
                >
                  <Text style={[s.metricBtnText, { color: chartMetric === m ? C.bg : C.secondary }]}>
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
            <CommunityBarChart metric={chartMetric} C={C} />
          </>
        )}

        {/* Volunteer Gaps */}
        {(showAll || showVol) && volGaps.length > 0 && (
          <>
            <SecHeader title="Volunteer Gaps" C={C} />
            <View style={[s.section, { backgroundColor: '#D9775712' }]}>
              {volGaps.map((dept, idx) => {
                const open = dept.volunteerNeeds.filter(n => n.filled < n.needed);
                return (
                  <View
                    key={dept.id}
                    style={[s.gapRow, idx < volGaps.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(217,119,87,0.2)' }]}
                  >
                    <Text style={[s.gapDept, { color: C.label }]}>{dept.name}</Text>
                    <Text style={[s.gapNeeds, { color: '#D97757' }]}>
                      {open.map(n => `${n.needed - n.filled} ${n.role}`).join(', ')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Upcoming Events */}
        {(showAll || showAttn) && (
          <>
            <SecHeader title="Upcoming Events" C={C} />
            {COMMUNITY_EVENTS.map(ev => (
              <EventCard key={ev.id} event={ev} isAdmin C={C} />
            ))}
          </>
        )}

        {/* Care Requests */}
        {(showAll || showCare) && (
          <>
            <View style={s.sectionTitleRow}>
              <SecHeader title="Care Requests" C={C} />
              <Text style={[s.pendingBadge, { color: '#D97757' }]}>
                {COMMUNITY_CARE_REQUESTS.filter(r => r.status === 'pending').length} pending
              </Text>
            </View>
            <View style={[s.section, { backgroundColor: C.surface }]}>
              {COMMUNITY_CARE_REQUESTS.slice(0, 4).map((item, idx) => (
                <CareRow key={item.id} item={item} C={C} last={idx === 3 || idx === COMMUNITY_CARE_REQUESTS.length - 1} />
              ))}
            </View>
          </>
        )}

        {/* Quick Actions */}
        {showAll && (
          <>
            <SecHeader title="Quick Actions" C={C} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Create Event',   icon: 'calendar.badge.plus',    action: () => {} },
                { label: 'Announce',       icon: 'megaphone.fill',         action: () => router.push('/(tabs)/(main)/hub/announcement-compose' as any) },
                { label: 'Giving Report',  icon: 'dollarsign.circle.fill', action: () => {} },
              ].map(btn => (
                <Pressable
                  key={btn.label}
                  style={[s.actionBtn, { backgroundColor: C.surface }]}
                  onPress={btn.action}
                >
                  <IconSymbol name={btn.icon as any} size={20} color={C.accent} />
                  <Text style={[s.actionBtnText, { color: C.label }]}>{btn.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  // ── Member Overview ───────────────────────────────────────────────────────

  const renderMemberOverview = () => {
    const p = COMMUNITY_PROFILE;
    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Hero */}
        <View style={s.heroCenter}>
          <View style={[s.heroAvatar, { backgroundColor: `hsl(${p.coverHue},55%,30%)` }]}>
            <Text style={s.heroAvatarText}>{p.avatarInitials}</Text>
          </View>
          <Text style={[s.heroName, { color: C.label }]}>{p.name}</Text>
          <Text style={[s.heroTagline, { color: C.secondary }]}>{p.tagline}</Text>
          <View style={s.heroLocation}>
            <IconSymbol name="mappin.circle.fill" size={14} color={C.muted} />
            <Text style={[s.heroLocationText, { color: C.muted }]}>{p.location}</Text>
          </View>
        </View>

        {/* Get Connected buttons */}
        <View style={s.connectRow}>
          {[
            { label: 'Plan a Visit', icon: 'calendar' },
            { label: 'Join a Group', icon: 'person.3' },
            { label: 'Volunteer',    icon: 'hands.and.sparkles' },
            { label: 'Contact Us',   icon: 'envelope' },
          ].map(btn => (
            <Pressable
              key={btn.label}
              style={[s.connectBtn, { backgroundColor: C.surface }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={btn.icon as any} size={20} color={C.accent} />
              <Text style={[s.connectBtnText, { color: C.label }]}>{btn.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* Service Times */}
        <SecHeader title="Service Times" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {p.serviceTimes.map((st, idx) => (
            <View
              key={st.label}
              style={[
                s.serviceRow,
                idx < p.serviceTimes.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <Text style={[s.serviceLabel, { color: C.label }]}>{st.label}</Text>
              <Text style={[s.serviceTime, { color: C.secondary }]}>{st.time}</Text>
            </View>
          ))}
        </View>

        {/* Leadership */}
        <SecHeader title="Leadership" C={C} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 24 }}>
          {COMMUNITY_LEADERSHIP.map(l => (
            <LeaderCard key={l.id} leader={l} C={C} />
          ))}
        </ScrollView>

        {/* About */}
        <SecHeader title="About" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          <Text style={[s.aboutText, { color: C.secondary }]}>{p.description}</Text>
        </View>

        {/* What We Believe */}
        <SecHeader title="What We Believe" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {p.beliefs.map(b => (
            <View key={b} style={s.beliefRow}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#5A8A6E" />
              <Text style={[s.beliefText, { color: C.secondary }]}>{b}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming Public Events */}
        <SecHeader title="Upcoming Events" C={C} />
        {COMMUNITY_EVENTS.filter(e => e.isPublic).map(ev => (
          <EventCard key={ev.id} event={ev} isAdmin={false} C={C} />
        ))}
      </ScrollView>
    );
  };

  // ── Admin Departments ─────────────────────────────────────────────────────

  const renderAdminDepts = () => {
    const filtered = selectedPill === 'All'
      ? COMMUNITY_DEPARTMENTS
      : COMMUNITY_DEPARTMENTS.filter(d => d.name === selectedPill);

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        <SecHeader title="Departments" C={C} />
        {filtered.map(dept => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            isAdmin
            expanded={expandedDeptId === dept.id}
            onToggle={() => setExpandedDeptId(expandedDeptId === dept.id ? null : dept.id)}
            C={C}
          />
        ))}
        <Pressable
          style={[s.createBtn, { borderColor: C.separator }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={16} color={C.accent} />
          <Text style={[s.createBtnText, { color: C.accent }]}>Create Department</Text>
        </Pressable>
      </ScrollView>
    );
  };

  // ── Member Departments ────────────────────────────────────────────────────

  const renderMemberDepts = () => {
    const filtered = selectedPill === 'All'
      ? COMMUNITY_DEPARTMENTS
      : COMMUNITY_DEPARTMENTS.filter(d => d.name === selectedPill);

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        <SecHeader title="Departments" C={C} />
        {filtered.map(dept => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            isAdmin={false}
            expanded={expandedDeptId === dept.id}
            onToggle={() => setExpandedDeptId(expandedDeptId === dept.id ? null : dept.id)}
            C={C}
          />
        ))}
      </ScrollView>
    );
  };

  // ── Admin Groups ──────────────────────────────────────────────────────────

  const renderAdminGroups = () => {
    const filtered = selectedPill === 'All'
      ? COMMUNITY_GROUPS
      : selectedPill === 'Active'
        ? COMMUNITY_GROUPS.filter(g => g.status === 'active')
        : COMMUNITY_GROUPS.filter(g => g.status === 'inactive');

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        <SecHeader title="Groups" C={C} />
        {filtered.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            isAdmin
            expanded={expandedGroupId === group.id}
            onToggle={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
            isJoined={false}
            onJoin={() => {}}
            router={router}
            C={C}
          />
        ))}
        <Pressable
          style={[s.createBtn, { borderColor: C.separator }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={16} color={C.accent} />
          <Text style={[s.createBtnText, { color: C.accent }]}>Create Group</Text>
        </Pressable>
      </ScrollView>
    );
  };

  // ── Member Groups ─────────────────────────────────────────────────────────

  const renderMemberGroups = () => {
    let filtered = COMMUNITY_GROUPS;
    if (selectedPill === 'Open')      filtered = filtered.filter(g => g.isOpen);
    if (selectedPill === 'My Groups') filtered = filtered.filter(g => joinedGroups.has(g.id));
    if (selectedPill === 'Full')      filtered = filtered.filter(g => !g.isOpen);

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {joinedGroups.size > 0 && selectedPill !== 'My Groups' && (
          <>
            <SecHeader title="My Groups" C={C} />
            {COMMUNITY_GROUPS.filter(g => joinedGroups.has(g.id)).map(group => (
              <GroupCard
                key={group.id}
                group={group}
                isAdmin={false}
                expanded={expandedGroupId === group.id}
                onToggle={() => setExpandedGroupId(expandedGroupId === group.id ? null : group.id)}
                isJoined
                onJoin={() => {}}
                router={router}
                C={C}
              />
            ))}
            <SecHeader title="All Groups" C={C} />
          </>
        )}
        {filtered.map(group => (
          <GroupCard
            key={group.id + '_b'}
            group={group}
            isAdmin={false}
            expanded={expandedGroupId === group.id + '_b'}
            onToggle={() => setExpandedGroupId(expandedGroupId === group.id + '_b' ? null : group.id + '_b')}
            isJoined={joinedGroups.has(group.id)}
            onJoin={() => setJoinedGroups(prev => new Set([...prev, group.id]))}
            router={router}
            C={C}
          />
        ))}
      </ScrollView>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (activeTab === 'Overview')    return isAdmin ? renderAdminOverview()  : renderMemberOverview();
    if (activeTab === 'Departments') return isAdmin ? renderAdminDepts()     : renderMemberDepts();
    return isAdmin ? renderAdminGroups() : renderMemberGroups();
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {renderContent()}

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            {isAdmin ? (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
                hitSlop={12}
              >
                <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
              </Pressable>
            ) : null}
          </View>

          {/* Center dropdown pill */}
          <View style={s.dropdownPillWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDropdownOpen(v => !v); }}
            >
              <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', gap: 10 }]}>
            <Pressable
              style={[s.roleToggle, { backgroundColor: isAdmin ? C.accent : C.surfacePressed }]}
              onPress={() => { Haptics.selectionAsync(); setIsAdmin(v => !v); }}
            >
              <Text style={[s.roleToggleText, { color: isAdmin ? '#fff' : C.secondary }]}>
                {isAdmin ? 'Admin' : 'Member'}
              </Text>
            </Pressable>
            {pills.length > 0 && (
              <Pressable onPress={toggleFilterPills} hitSlop={12}>
                <IconSymbol
                  name={filterPillsVisible || selectedPill !== 'All'
                    ? 'line.3.horizontal.decrease.circle.fill'
                    : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={filterPillsVisible || selectedPill !== 'All' ? C.accent : C.label}
                />
              </Pressable>
            )}
          </View>
        </View>

        {/* Filter Pills */}
        <Animated.View style={{
          height: pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
          opacity: pillsRevealAnim,
          overflow: 'hidden',
        }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.pillsContent}
            style={[s.pillsRow, { borderTopColor: C.separator }]}
          >
            {pills.map(pill => {
              const active = pill === selectedPill;
              return (
                <Pressable
                  key={pill}
                  style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[s.pillText, { color: active ? C.bg : C.secondary }, active && { fontWeight: '600' }]}>
                    {pill}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>

      {/* ── Dropdown ── */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[s.dropdown, { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator, zIndex: 99 }]}>
            {(['Overview', 'Departments', 'Groups'] as CommunityTab[]).map(tab => (
              <Pressable key={tab} style={s.dropdownOption} onPress={() => handleTabSelect(tab)}>
                <Text style={[s.dropdownOptionText, { color: tab === activeTab ? C.label : C.secondary }, tab === activeTab && { fontWeight: '600' }]}>
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Announcement FAB (admin) ── */}
      {isAdmin && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(tabs)/(main)/hub/announcement-compose' as any);
          }}
        >
          <IconSymbol name="megaphone.fill" size={20} color={C.bg} />
        </Pressable>
      )}

      {/* ── Care Request Submit button (member) ── */}
      {!isAdmin && (
        <Pressable
          style={[s.careBtn, { bottom: insets.bottom + 49 + 16, backgroundColor: C.surface, borderColor: C.separator }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/(tabs)/(main)/hub/care-request' as any);
          }}
        >
          <IconSymbol name="heart.fill" size={16} color={C.accent} />
          <Text style={[s.careBtnText, { color: C.label }]}>Submit Care Request</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  screen: { flex: 1 },

  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 86, justifyContent: 'center' },

  dropdownPillWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownPillText: { fontSize: 15, fontWeight: '700', letterSpacing: 0.2 },

  dropdown: {
    position: 'absolute', left: '50%', marginLeft: -110, minWidth: 220,
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10, shadowRadius: 12, elevation: 8, overflow: 'hidden',
  },
  dropdownOption:     { paddingVertical: 14, paddingHorizontal: 20 },
  dropdownOptionText: { fontSize: 15 },

  pillsRow:     { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent: { paddingHorizontal: 12, alignItems: 'center', gap: 8 },
  pill:         { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  pillText:     { fontSize: 13 },

  roleToggle:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  roleToggleText: { fontSize: 11, fontWeight: '700' },

  section:       { borderRadius: 16, padding: 16, marginBottom: 20 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pendingBadge:  { fontSize: 12, fontWeight: '700', marginBottom: 12 },

  metricBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  metricBtnText: { fontSize: 12, fontWeight: '600' },

  actionBtn:     { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 6 },
  actionBtnText: { fontSize: 12, fontWeight: '600' },

  gapRow:    { paddingVertical: 10 },
  gapDept:   { fontSize: 13, fontWeight: '700' },
  gapNeeds:  { fontSize: 12, marginTop: 2 },

  // Member Overview
  heroCenter:     { alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  heroAvatar:     { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  heroAvatarText: { fontSize: 26, fontWeight: '800', color: '#fff' },
  heroName:       { fontSize: 24, fontWeight: '800', marginBottom: 6 },
  heroTagline:    { fontSize: 14, lineHeight: 20, textAlign: 'center', paddingHorizontal: 24, marginBottom: 8 },
  heroLocation:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  heroLocationText: { fontSize: 13 },

  connectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  connectBtn: { width: '47%', borderRadius: 14, padding: 14, alignItems: 'center', gap: 6 },
  connectBtnText: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  serviceRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  serviceLabel:{ fontSize: 14, fontWeight: '600' },
  serviceTime: { fontSize: 14 },

  aboutText:  { fontSize: 14, lineHeight: 21 },
  beliefRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  beliefText: { fontSize: 13, lineHeight: 19, flex: 1 },

  createBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, padding: 14, borderRadius: 14, borderWidth: 1.5, borderStyle: 'dashed', marginTop: 4, marginBottom: 24,
  },
  createBtnText: { fontSize: 14, fontWeight: '600' },

  fab: {
    position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
  },
  careBtn: {
    position: 'absolute', right: 16, left: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderRadius: 14, borderWidth: 1,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 3, zIndex: 20,
  },
  careBtnText: { fontSize: 14, fontWeight: '700' },
});
