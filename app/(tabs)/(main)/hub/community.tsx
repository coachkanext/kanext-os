/**
 * Community Hub — operational center for community/church brands.
 * RBAC demo: Pastor sees full dashboard + service planning + member mgmt;
 * Member sees upcoming events, groups, announcements, prayer wall.
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

const ACCENT = '#7B68A0';

type CommunityTab  = 'Overview' | 'Departments' | 'Groups';
type CommunityRole = 'Pastor' | 'Member';

const OVERVIEW_PILLS_ADMIN   = ['All', 'Attendance', 'Giving', 'Volunteers', 'Care'];
const DEPT_PILLS             = ['All', 'Worship', 'Youth', 'Hospitality', 'Outreach', 'Education'];
const GROUPS_PILLS_ADMIN     = ['All', 'Active', 'Inactive'];
const GROUPS_PILLS_MEMBER    = ['All', 'Open', 'My Groups', 'Full'];

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const BAR_MAX_H  = 100;

function pillsForTab(tab: CommunityTab, role: CommunityRole): string[] {
  if (tab === 'Overview')    return role === 'Pastor' ? OVERVIEW_PILLS_ADMIN : [];
  if (tab === 'Departments') return DEPT_PILLS;
  return role === 'Pastor' ? GROUPS_PILLS_ADMIN : GROUPS_PILLS_MEMBER;
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
                backgroundColor: volNeeded > 0 ? '#3B82F6' : '#5A8A6E' }
            ]} />
          </View>
          <Text style={[evS.volText, { color: volNeeded > 0 ? '#3B82F6' : '#5A8A6E' }]}>
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
  const statusColor = item.status === 'pending' ? '#3B82F6'
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
  dept, isAdmin, onPress, C,
}: {
  dept: CommunityDepartment; isAdmin: boolean;
  onPress: () => void; C: ComponentColors;
}) {
  const totalNeeded = dept.volunteerNeeds.reduce((s, n) => s + n.needed, 0);
  const totalFilled = dept.volunteerNeeds.reduce((s, n) => s + n.filled, 0);
  const hasGap = totalFilled < totalNeeded;

  return (
    <Pressable onPress={onPress} style={[deptS.card, { backgroundColor: C.surface }]}>
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
            <View style={[deptS.gapBadge, { backgroundColor: '#3B82F618' }]}>
              <Text style={deptS.gapText}>vol gap</Text>
            </View>
          )}
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </View>
      </View>
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
  gapText:     { fontSize: 10, fontWeight: '700', color: '#3B82F6' },
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
  group, onPress, C,
}: {
  group: CommunityGroup; onPress: () => void; C: ComponentColors;
}) {
  const fillPct   = group.memberCount / group.capacity;
  const isFull    = group.memberCount >= group.capacity;
  const isPaused  = group.status === 'paused';
  const isNew     = group.status === 'new';
  const showBadge = isFull || isPaused || isNew;

  const badgeLabel = isPaused ? 'Paused' : isNew ? 'New' : 'Full';
  const badgeBg    = isPaused ? C.surfacePressed : isNew ? '#5A8A6E22' : '#B85C5C22';
  const badgeColor = isPaused ? C.muted          : isNew ? '#5A8A6E'   : '#B85C5C';
  const barColor   = fillPct >= 0.9 ? '#B85C5C' : C.accent;

  return (
    <Pressable onPress={onPress} style={[grpS.card, { backgroundColor: C.surface }]}>
      <View style={grpS.row}>
        <View style={grpS.info}>
          <View style={grpS.titleRow}>
            <Text style={[grpS.name, { color: C.label }]}>{group.name}</Text>
            {showBadge && (
              <View style={[grpS.statusBadge, { backgroundColor: badgeBg }]}>
                <Text style={[grpS.statusText, { color: badgeColor }]}>{badgeLabel}</Text>
              </View>
            )}
          </View>
          <Text style={[grpS.sub, { color: C.secondary }]}>
            {group.leaderName} · {group.schedule}
          </Text>
          <Text style={[grpS.dept, { color: C.muted }]}>
            {group.departmentName} · {group.memberCount}/{group.capacity} members
          </Text>
          <View style={[grpS.capTrack, { backgroundColor: C.separator }]}>
            <View style={[grpS.capFill, { width: `${Math.min(100, fillPct * 100)}%` as any, backgroundColor: barColor }]} />
          </View>
        </View>
        <IconSymbol name="chevron.right" size={14} color={C.muted} />
      </View>
    </Pressable>
  );
}

const grpS = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, marginBottom: 10 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  info:        { flex: 1, gap: 3 },
  titleRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name:        { fontSize: 15, fontWeight: '700' },
  statusBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  statusText:  { fontSize: 10, fontWeight: '700' },
  sub:         { fontSize: 12 },
  dept:        { fontSize: 11 },
  capTrack:    { height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 5 },
  capFill:     { height: 3, borderRadius: 2 },
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

  const [role, setRole]                 = useState<CommunityRole>('Pastor');
  const [activeTab, setActiveTab]       = useState<CommunityTab>('Overview');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [filterPillsVisible, setFilterPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const [chartMetric, setChartMetric]   = useState<CommunityChartMetric>('attendance');
  const [expandedDeptId, setExpandedDeptId] = useState<string | null>(null);
  const [joinedGroups, setJoinedGroups]     = useState<Set<string>>(new Set(['grp1']));

  const pillsRevealAnim = useRef(new Animated.Value(0)).current;
  const lastScrollY     = useRef(0);

  const topBarH         = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + (filterPillsVisible ? PILL_ROW_H : 0) + 8;

  const isAdmin = role === 'Pastor';
  const pills = pillsForTab(activeTab, role);

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

  const cycleRole = useCallback(() => {
    Haptics.selectionAsync();
    setRole(r => r === 'Pastor' ? 'Member' : 'Pastor');
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
            <View style={[s.section, { backgroundColor: '#3B82F612' }]}>
              {volGaps.map((dept, idx) => {
                const open = dept.volunteerNeeds.filter(n => n.filled < n.needed);
                return (
                  <View
                    key={dept.id}
                    style={[s.gapRow, idx < volGaps.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(217,119,87,0.2)' }]}
                  >
                    <Text style={[s.gapDept, { color: C.label }]}>{dept.name}</Text>
                    <Text style={[s.gapNeeds, { color: '#3B82F6' }]}>
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
              <Text style={[s.pendingBadge, { color: '#3B82F6' }]}>
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
    const myGroups = COMMUNITY_GROUPS.filter(g => joinedGroups.has(g.id));
    const [prayerSubmitted, setPrayerSubmitted] = React.useState(false);

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {/* Next Service Card */}
        <View style={[s.nextServiceCard, { backgroundColor: ACCENT }]}>
          <Text style={s.nextServiceLabel}>Next Service</Text>
          <Text style={s.nextServiceTitle}>{p.name}</Text>
          <Text style={s.nextServiceTime}>Sunday, Apr 5 · 10:00 AM</Text>
          <View style={s.nextServiceLocation}>
            <IconSymbol name="mappin.circle.fill" size={13} color="rgba(255,255,255,0.7)" />
            <Text style={s.nextServiceLocationText}>{p.location}</Text>
          </View>
          <View style={s.nextServiceActions}>
            <Pressable style={s.nextServiceBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={s.nextServiceBtnText}>RSVP</Text>
            </Pressable>
            <Pressable style={[s.nextServiceBtn, { backgroundColor: 'rgba(255,255,255,0.15)' }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Text style={s.nextServiceBtnText}>Get Directions</Text>
            </Pressable>
          </View>
        </View>

        {/* Upcoming Special Events */}
        <SecHeader title="Upcoming Events" C={C} />
        {COMMUNITY_EVENTS.filter(e => e.isPublic).slice(0, 3).map(ev => (
          <EventCard key={ev.id} event={ev} isAdmin={false} C={C} />
        ))}

        {/* My Groups */}
        {myGroups.length > 0 && (
          <>
            <SecHeader title="My Groups" C={C} />
            <View style={[s.section, { backgroundColor: C.surface }]}>
              {myGroups.map((g, idx) => (
                <Pressable
                  key={g.id}
                  style={[
                    s.myGroupRow,
                    idx < myGroups.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/(tabs)/(main)/hub/group-detail', params: { id: g.id } } as any);
                  }}
                >
                  <View style={[s.myGroupDot, { backgroundColor: `hsl(${g.hue},42%,28%)` }]}>
                    <Text style={s.myGroupInitials}>{g.leaderInitials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.myGroupName, { color: C.label }]}>{g.name}</Text>
                    <Text style={[s.myGroupNext, { color: C.accent }]}>{g.nextMeeting}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Announcements */}
        <SecHeader title="Announcements" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {[
            { title: 'Easter Sunday Service', detail: 'Join us April 20 for a special resurrection celebration with live worship.', time: '1d ago' },
            { title: 'Food Drive — Apr 12–19', detail: 'Bring non-perishable items to the welcome desk. Every donation counts.', time: '2d ago' },
            { title: 'Youth Summer Camp Registration', detail: 'Registration for Camp Hope is now open. Limited spots available.', time: '3d ago' },
          ].map((ann, idx) => (
            <View key={ann.title} style={[s.annRow, idx < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <View style={[s.annIcon, { backgroundColor: `${C.accent}18` }]}>
                <IconSymbol name="megaphone.fill" size={14} color={C.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.annTitle, { color: C.label }]}>{ann.title}</Text>
                <Text style={[s.annDetail, { color: C.secondary }]}>{ann.detail}</Text>
                <Text style={[s.annTime, { color: C.muted }]}>{ann.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Prayer Wall */}
        <SecHeader title="Prayer Wall" C={C} />
        <View style={[s.section, { backgroundColor: C.surface }]}>
          {[
            { name: 'Anonymous', request: 'Please pray for healing in my family.' },
            { name: 'Marcus T.', request: 'Praying for a new job opportunity and direction.' },
            { name: 'Keisha W.', request: 'Grateful for answered prayers — please pray for continued health.' },
          ].map((p, idx) => (
            <View key={p.name} style={[s.prayerRow, idx < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
              <IconSymbol name="hands.sparkles.fill" size={15} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[s.prayerName, { color: C.secondary }]}>{p.name}</Text>
                <Text style={[s.prayerText, { color: C.label }]}>{p.request}</Text>
              </View>
            </View>
          ))}
          <Pressable
            style={[s.prayerSubmitBtn, { backgroundColor: prayerSubmitted ? C.surfacePressed : C.accent, marginTop: 12 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setPrayerSubmitted(true); }}
          >
            <IconSymbol name="plus" size={14} color={prayerSubmitted ? C.secondary : '#fff'} />
            <Text style={[s.prayerSubmitText, { color: prayerSubmitted ? C.secondary : '#fff' }]}>
              {prayerSubmitted ? 'Request Submitted' : 'Submit Prayer Request'}
            </Text>
          </Pressable>
        </View>

        {/* Quick Give */}
        <Pressable
          style={[s.giveBtn, { backgroundColor: `${C.accent}15`, borderColor: C.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="dollarsign.circle.fill" size={20} color={C.accent} />
          <Text style={[s.giveBtnText, { color: C.accent }]}>Give Online</Text>
          <IconSymbol name="chevron.right" size={14} color={C.accent} />
        </Pressable>
      </ScrollView>
    );
  };

  // ── Dept sections (below dept list) ──────────────────────────────────────
  const renderDeptSections = (showAdmin: boolean) => {
    const volGapDepts = COMMUNITY_DEPARTMENTS.filter(d =>
      d.volunteerNeeds.some(n => n.filled < n.needed)
    );
    const upcomingEvents = COMMUNITY_EVENTS.slice(0, 3);
    const DEPT_ACTIVITY = [
      { id: 'a1', text: 'Nia Sanders added 3 new members to Youth', time: '2h ago', icon: 'person.badge.plus' },
      { id: 'a2', text: 'Elder Chen posted worship setlist for Sunday', time: '5h ago', icon: 'doc.text' },
      { id: 'a3', text: 'Jordan Williams updated Hospitality schedule', time: '1d ago', icon: 'calendar.badge.clock' },
      { id: 'a4', text: 'Deacon Keisha completed food drive prep', time: '2d ago', icon: 'checkmark.circle.fill' },
    ];
    const sortedByMember = [...COMMUNITY_DEPARTMENTS].sort((a, b) => b.memberCount - a.memberCount);

    return (
      <>
        {/* Volunteer gaps */}
        {volGapDepts.length > 0 && (
          <>
            <SecHeader title={`${volGapDepts.length} Departments Need Volunteers`} C={C} />
            <View style={[s.section, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {volGapDepts.map((dept, idx) => {
                const gaps = dept.volunteerNeeds.filter(n => n.filled < n.needed);
                return (
                  <View
                    key={dept.id}
                    style={[
                      s.volGapRow,
                      idx < volGapDepts.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.volGapDept, { color: C.label }]}>{dept.name}</Text>
                      <Text style={[s.volGapNeeds, { color: C.secondary }]}>
                        {gaps.map(g => `${g.needed - g.filled} ${g.role}`).join(' · ')}
                      </Text>
                    </View>
                    <Pressable
                      style={[s.volSignUpBtn, { borderColor: C.accent }]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <Text style={[s.volSignUpText, { color: C.accent }]}>Sign Up</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Upcoming events */}
        <SecHeader title="Upcoming Events" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {upcomingEvents.map((ev, idx) => (
            <View
              key={ev.id}
              style={[
                s.eventRow,
                idx < upcomingEvents.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.eventTitle, { color: C.label }]}>{ev.title}</Text>
                <Text style={[s.eventMeta, { color: C.secondary }]}>{ev.date} · {ev.time} · {ev.location}</Text>
              </View>
              {ev.volunteersNeeded > 0 && (
                <Text style={[s.eventVol, { color: ev.volunteersFilled < ev.volunteersNeeded ? C.accent : '#5A8A6E' }]}>
                  {ev.volunteersFilled}/{ev.volunteersNeeded}
                </Text>
              )}
            </View>
          ))}
        </View>

        {/* Activity feed — admin only */}
        {showAdmin && (
          <>
            <SecHeader title="Department Activity" C={C} />
            <View style={[s.section, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {DEPT_ACTIVITY.map((item, idx) => (
                <View
                  key={item.id}
                  style={[
                    s.activityRow,
                    idx < DEPT_ACTIVITY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                  ]}
                >
                  <IconSymbol name={item.icon as any} size={16} color={C.accent} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.activityText, { color: C.label }]}>{item.text}</Text>
                    <Text style={[s.activityTime, { color: C.muted }]}>{item.time}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Dept health — admin only */}
        {showAdmin && (
          <>
            <SecHeader title="Department Health" C={C} />
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
              {[
                { label: 'Most Active', value: sortedByMember[0].name, sub: `${sortedByMember[0].memberCount} members` },
                { label: 'Needs Attention', value: sortedByMember[sortedByMember.length - 1].name, sub: `${sortedByMember[sortedByMember.length - 1].memberCount} members` },
                { label: 'Vol Gaps', value: `${volGapDepts.length} depts`, sub: 'need volunteers' },
              ].map(card => (
                <View key={card.label} style={[s.healthCard, { backgroundColor: C.surface }]}>
                  <Text style={[s.healthLabel, { color: C.muted }]}>{card.label}</Text>
                  <Text style={[s.healthValue, { color: C.label }]}>{card.value}</Text>
                  <Text style={[s.healthSub, { color: C.secondary }]}>{card.sub}</Text>
                </View>
              ))}
            </View>
          </>
        )}
      </>
    );
  };

  // ── Group sections (below group list) ────────────────────────────────────
  const renderGroupSections = (showAdmin: boolean) => {
    const myGroups   = COMMUNITY_GROUPS.filter(g => joinedGroups.has(g.id));
    const openGroups = COMMUNITY_GROUPS.filter(g => g.isOpen && !joinedGroups.has(g.id) && g.memberCount < g.capacity && g.status !== 'paused');
    const GROUP_ACTIVITY = [
      { id: 'ga1', text: "Pastor Davis posted new curriculum in Men's Fellowship", time: '2h ago', icon: 'doc.text' },
      { id: 'ga2', text: 'Young Adults planned a game night this Friday', time: '5h ago', icon: 'gamecontroller' },
      { id: 'ga3', text: 'Nia Sanders welcomed 2 new members to Young Adults', time: '1d ago', icon: 'person.badge.plus' },
      { id: 'ga4', text: 'Prayer Warriors completed their 30-day prayer challenge', time: '2d ago', icon: 'checkmark.circle.fill' },
    ];
    const GROUP_HIGHLIGHTS = [
      { id: 'h1', group: "Men's Fellowship", title: 'This Week: Identity in Christ', preview: 'Exploring what it means to be rooted in who God says you are — not what the world defines.', time: '3 days ago', hue: 220 },
      { id: 'h2', group: 'Young Adults', title: 'Game Night This Friday!', preview: 'Join us for a night of fun, food, and community. Bring a friend. 8pm at the Fellowship Hall.', time: '1 day ago', hue: 40 },
    ];

    return (
      <>
        {/* My Groups — next meeting highlight (member view only) */}
        {!showAdmin && myGroups.length > 0 && (
          <>
            <SecHeader title="My Groups" C={C} />
            <View style={[s.section, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {myGroups.map((g, idx) => (
                <Pressable
                  key={g.id}
                  style={[
                    s.myGroupRow,
                    idx < myGroups.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/(tabs)/(main)/hub/group-detail', params: { id: g.id } } as any);
                  }}
                >
                  <View style={[s.myGroupDot, { backgroundColor: `hsl(${g.hue},42%,28%)` }]}>
                    <Text style={s.myGroupInitials}>{g.leaderInitials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.myGroupName, { color: C.label }]}>{g.name}</Text>
                    <Text style={[s.myGroupNext, { color: C.accent }]}>{g.nextMeeting}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted} />
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Open Groups — available spots (member view only) */}
        {!showAdmin && openGroups.length > 0 && (
          <>
            <SecHeader title="Open Groups" C={C} />
            <View style={[s.section, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {openGroups.map((g, idx) => {
                const spotsLeft = g.capacity - g.memberCount;
                return (
                  <View
                    key={g.id}
                    style={[
                      s.openGroupRow,
                      idx < openGroups.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[s.openGroupName, { color: C.label }]}>{g.name}</Text>
                      <Text style={[s.openGroupMeta, { color: C.secondary }]}>{g.leaderName} · {g.schedule}</Text>
                    </View>
                    <Pressable
                      style={[s.joinBtn, { backgroundColor: C.accent }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setJoinedGroups(prev => new Set([...prev, g.id]));
                      }}
                    >
                      <Text style={s.joinBtnText}>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} — Join</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </>
        )}

        {/* Group Activity */}
        <SecHeader title="Group Activity" C={C} />
        <View style={[s.section, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {GROUP_ACTIVITY.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.activityRow,
                idx < GROUP_ACTIVITY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <IconSymbol name={item.icon as any} size={16} color={C.accent} />
              <View style={{ flex: 1 }}>
                <Text style={[s.activityText, { color: C.label }]}>{item.text}</Text>
                <Text style={[s.activityTime, { color: C.muted }]}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Group Highlights */}
        <SecHeader title="Group Highlights" C={C} />
        {GROUP_HIGHLIGHTS.map(h => (
          <Pressable
            key={h.id}
            style={[s.highlightCard, { backgroundColor: C.surface }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.highlightHeader}>
              <View style={[s.highlightDot, { backgroundColor: `hsl(${h.hue},42%,28%)` }]} />
              <Text style={[s.highlightGroup, { color: C.secondary }]}>{h.group}</Text>
              <Text style={[s.highlightTime, { color: C.muted }]}>{h.time}</Text>
            </View>
            <Text style={[s.highlightTitle, { color: C.label }]}>{h.title}</Text>
            <Text style={[s.highlightPreview, { color: C.secondary }]} numberOfLines={2}>{h.preview}</Text>
          </Pressable>
        ))}
      </>
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
        {filtered.map(dept => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            isAdmin
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/(tabs)/(main)/hub/dept-detail', params: { id: dept.id } } as any);
            }}
            C={C}
          />
        ))}
        {renderDeptSections(true)}
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
        {filtered.map(dept => (
          <DepartmentCard
            key={dept.id}
            dept={dept}
            isAdmin={false}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/(tabs)/(main)/hub/dept-detail', params: { id: dept.id } } as any);
            }}
            C={C}
          />
        ))}
        {renderDeptSections(false)}
      </ScrollView>
    );
  };

  // ── Admin Groups ──────────────────────────────────────────────────────────

  const renderAdminGroups = () => {
    const filtered = selectedPill === 'All'
      ? COMMUNITY_GROUPS
      : selectedPill === 'Active'
        ? COMMUNITY_GROUPS.filter(g => g.status === 'active')
        : COMMUNITY_GROUPS.filter(g => g.status !== 'active');

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {filtered.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/(tabs)/(main)/hub/group-detail', params: { id: group.id } } as any);
            }}
            C={C}
          />
        ))}
        {renderGroupSections(true)}
      </ScrollView>
    );
  };

  // ── Member Groups ─────────────────────────────────────────────────────────

  const renderMemberGroups = () => {
    let filtered = COMMUNITY_GROUPS;
    if (selectedPill === 'Open')      filtered = filtered.filter(g => g.isOpen && g.memberCount < g.capacity);
    if (selectedPill === 'My Groups') filtered = filtered.filter(g => joinedGroups.has(g.id));
    if (selectedPill === 'Full')      filtered = filtered.filter(g => !g.isOpen || g.memberCount >= g.capacity);

    return (
      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingHorizontal: 16, paddingBottom: 120 }}
      >
        {filtered.map(group => (
          <GroupCard
            key={group.id}
            group={group}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push({ pathname: '/(tabs)/(main)/hub/group-detail', params: { id: group.id } } as any);
            }}
            C={C}
          />
        ))}
        {renderGroupSections(false)}
      </ScrollView>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const renderContent = () => {
    if (activeTab === 'Overview')    return isAdmin ? renderAdminOverview()  : renderMemberOverview();
    if (activeTab === 'Departments') return isAdmin ? renderAdminDepts()     : renderMemberDepts();
    return isAdmin ? renderAdminGroups() : renderMemberGroups();
  };

  // alias used below for FABs / buttons
  const isPastor = role === 'Pastor';

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

          <View style={[s.topBarSide, { alignItems: 'flex-end', flexDirection: 'row', gap: 8 }]}>
            <Pressable
              style={[s.roleToggle, { backgroundColor: isAdmin ? C.activePill : C.surfacePressed }]}
              onPress={cycleRole}
            >
              <Text style={[s.roleToggleText, { color: isAdmin ? C.activePillText : C.secondary }]}>{role}</Text>
            </Pressable>
            {pills.length > 0 && (
              <Pressable onPress={toggleFilterPills} hitSlop={12}>
                <IconSymbol
                  name={filterPillsVisible || selectedPill !== 'All'
                    ? 'line.3.horizontal.decrease.circle.fill'
                    : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={filterPillsVisible || selectedPill !== 'All' ? C.activePill : C.label}
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
                  style={[s.pill, active ? { backgroundColor: C.activePill } : { borderColor: C.separator }]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                >
                  <Text style={[s.pillText, { color: active ? C.activePillText : C.secondary }, active && { fontWeight: '600' }]}>
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

      {/* ── Context-aware FAB (Pastor) ── */}
      {isPastor && activeTab === 'Overview' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.accent }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            router.push('/(tabs)/(main)/hub/announcement-compose' as any);
          }}
        >
          <IconSymbol name="megaphone.fill" size={20} color="#fff" />
        </Pressable>
      )}
      {isPastor && activeTab === 'Departments' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}
      {isPastor && activeTab === 'Groups' && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.accent }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
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

  // Member Overview new components
  nextServiceCard:       { borderRadius: 16, padding: 16, marginBottom: 20 },
  nextServiceLabel:      { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase' as const, letterSpacing: 0.8, marginBottom: 4 },
  nextServiceTitle:      { fontSize: 20, fontWeight: '800', color: '#fff', marginBottom: 4 },
  nextServiceTime:       { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  nextServiceLocation:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 },
  nextServiceLocationText: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  nextServiceActions:    { flexDirection: 'row', gap: 10 },
  nextServiceBtn:        { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center' },
  nextServiceBtnText:    { fontSize: 13, fontWeight: '700', color: '#fff' },
  annRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12 },
  annIcon:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  annTitle:  { fontSize: 14, fontWeight: '600' },
  annDetail: { fontSize: 12, marginTop: 2, lineHeight: 18 },
  annTime:   { fontSize: 11, marginTop: 2 },
  prayerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 11 },
  prayerName:{ fontSize: 11, fontWeight: '700', marginBottom: 2 },
  prayerText:{ fontSize: 13, lineHeight: 19 },
  prayerSubmitBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 11, borderRadius: 12 },
  prayerSubmitText: { fontSize: 13, fontWeight: '700' },
  giveBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, marginBottom: 24 },
  giveBtnText:{ fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'center' },
  myGroupRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  myGroupDot:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  myGroupInitials:{ fontSize: 12, fontWeight: '700', color: '#fff' },
  myGroupName:    { fontSize: 14, fontWeight: '600' },
  myGroupNext:    { fontSize: 12, marginTop: 1 },

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

  // Dept sections
  volGapRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 12 },
  volGapDept:   { fontSize: 13, fontWeight: '700' },
  volGapNeeds:  { fontSize: 12, marginTop: 2 },
  volSignUpBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1.5 },
  volSignUpText:{ fontSize: 12, fontWeight: '600' },
  eventRow:     { paddingVertical: 11, gap: 4 },
  eventTitle:   { fontSize: 13, fontWeight: '600' },
  eventMeta:    { fontSize: 12 },
  eventVol:     { fontSize: 11, fontWeight: '700' },
  activityRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 10 },
  activityText: { fontSize: 13 },
  activityTime: { fontSize: 11 },
  healthCard:   { flex: 1, borderRadius: 12, padding: 12, gap: 3 },
  healthLabel:  { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' as const, letterSpacing: 0.5 },
  healthValue:  { fontSize: 13, fontWeight: '700' },
  healthSub:    { fontSize: 11 },

  // Group sections
  myGroupRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  myGroupDot:     { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  myGroupInitials:{ fontSize: 12, fontWeight: '700', color: '#fff' },
  myGroupName:    { fontSize: 14, fontWeight: '600' },
  myGroupNext:    { fontSize: 12, marginTop: 1 },
  openGroupRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
  openGroupName:  { fontSize: 14, fontWeight: '600' },
  openGroupMeta:  { fontSize: 12, marginTop: 1 },
  joinBtn:        { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  joinBtnText:    { fontSize: 12, fontWeight: '700', color: '#fff' },
  highlightCard:  { borderRadius: 14, padding: 14, marginBottom: 10, gap: 6 },
  highlightHeader:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  highlightDot:   { width: 8, height: 8, borderRadius: 4 },
  highlightGroup: { fontSize: 12, fontWeight: '600', flex: 1 },
  highlightTime:  { fontSize: 11 },
  highlightTitle: { fontSize: 14, fontWeight: '700' },
  highlightPreview: { fontSize: 13, lineHeight: 19 },

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
