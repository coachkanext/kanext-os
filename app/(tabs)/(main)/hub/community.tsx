/**
 * Church Overview — Community Hub home screen.
 * Pastor: stat cards, trend chart, volunteer gaps, upcoming this week, recent activity.
 * Member: church info card, stat cards, upcoming events, announcements.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Static mock data ──────────────────────────────────────────────────────────

const CHURCH_INFO = {
  name:        'Grace Covenant Church',
  location:    '4201 MLK Jr Way, Oakland, CA',
  serviceTimes:['Sunday 9:00 AM', 'Sunday 11:30 AM', 'Wednesday 7:00 PM'],
  pastor:      'Dr. Oladipo Kalejaiye',
  founded:     2008,
};

const PASTOR_STATS = {
  memberCount:     1247,
  memberChange:    3,
  attendanceLast:  612,
  attendanceTrend: 5,
  givingMonth:     48320,
  givingTrend:     8,
  careOpen:        7,
};

const MEMBER_STATS = {
  memberCount: 1247,
  nextService: 'Sun Apr 13',
  myGroups:    2,
};

const CHART_DATA = [
  { label: 'W1', attendance: 581, giving: 41000, volunteers: 38 },
  { label: 'W2', attendance: 594, giving: 44200, volunteers: 41 },
  { label: 'W3', attendance: 568, giving: 39800, volunteers: 36 },
  { label: 'W4', attendance: 602, giving: 46100, volunteers: 43 },
  { label: 'W5', attendance: 579, giving: 42500, volunteers: 39 },
  { label: 'W6', attendance: 618, giving: 47300, volunteers: 44 },
  { label: 'W7', attendance: 596, giving: 45000, volunteers: 40 },
  { label: 'W8', attendance: 612, giving: 48320, volunteers: 47 },
];

type ChartMetric = 'attendance' | 'giving' | 'volunteers';

function getMax(metric: ChartMetric): number {
  return Math.max(...CHART_DATA.map(d => d[metric]));
}

const VOL_GAPS = [
  { ministry: "Children's Ministry", roles: "3 Safety Monitors, 1 Nursery Lead" },
  { ministry: 'Media Ministry',      roles: '1 Sound Engineer, 2 Camera Operators' },
  { ministry: 'Hospitality',         roles: '2 Parking Volunteers' },
];

const UPCOMING_EVENTS = [
  { id: 'e1', date: 'Sun Apr 13', time: '10:00 AM', title: 'Sunday Morning Service', type: 'Service',    isPublic: true  },
  { id: 'e2', date: 'Wed Apr 16', time: '7:00 PM',  title: 'Bible Study — Romans 9', type: 'Bible Study', isPublic: true  },
  { id: 'e3', date: 'Sat Apr 19', time: '10:00 AM', title: 'Easter Prep Meeting',     type: 'Internal',   isPublic: false },
  { id: 'e4', date: 'Sun Apr 20', time: '10:00 AM', title: 'Easter Sunday Service',   type: 'Service',    isPublic: true  },
];

const RECENT_ACTIVITY = [
  { id: 'a1', icon: 'person.badge.plus',       text: '3 new members joined this week',                    time: '1d ago' },
  { id: 'a2', icon: 'heart.text.square.fill',  text: '2 new care requests submitted',                    time: '4h ago' },
  { id: 'a3', icon: 'dollarsign.circle.fill',  text: 'April giving milestone reached — $48K',             time: '2d ago' },
  { id: 'a4', icon: 'person.3.fill',           text: 'Young Adults group added 4 members',               time: '3d ago' },
];

const ANNOUNCEMENTS = [
  { id: 'n1', title: 'Easter Sunday Service', body: 'Join us April 20 for a special resurrection celebration with live worship and community breakfast.', date: '1d ago' },
  { id: 'n2', title: 'Food Drive — Apr 12–19', body: 'Bring non-perishable items to the welcome desk. Every donation counts for our community.', date: '2d ago' },
  { id: 'n3', title: 'Youth Summer Camp Registration', body: 'Registration for Camp Hope is now open. Limited spots available — sign up today.', date: '3d ago' },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H  = 52;
const BAR_MAX_H  = 80;
const GAIN       = '#5A8A6E';
const HEAT       = '#B85C5C';
const CAUTION    = '#B8943E';

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ value, label, trend, alertColor, C }: {
  value: string; label: string; trend?: number; alertColor?: string; C: ComponentColors;
}) {
  const up = (trend ?? 0) >= 0;
  const trendColor = alertColor ?? (up ? GAIN : HEAT);
  return (
    <View style={[sc.card, { backgroundColor: C.surface }]}>
      <Text style={[sc.value, { color: C.label }]}>{value}</Text>
      <Text style={[sc.label, { color: C.secondary }]}>{label}</Text>
      {trend !== undefined && trend !== 0 && (
        <View style={[sc.badge, { backgroundColor: trendColor + '22' }]}>
          <Text style={[sc.badgeText, { color: trendColor }]}>
            {up ? '+' : ''}{trend}%
          </Text>
        </View>
      )}
    </View>
  );
}

const sc = StyleSheet.create({
  card:      { flex: 1, minWidth: 80, backgroundColor: '#F5F0EA', borderRadius: 12, padding: 12, gap: 4 },
  value:     { fontSize: 20, fontWeight: '800' },
  label:     { fontSize: 11 },
  badge:     { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText: { fontSize: 10, fontWeight: '700' },
});

function SecHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={[sh.title, { color: C.label }]}>{title}</Text>
  );
}

const sh = StyleSheet.create({
  title: { fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ChurchOverviewScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const [chartMetric, setChartMetric] = useState<ChartMetric>('attendance');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const topBarH       = insets.top + TOP_BAR_H;
  const scrollPaddingTop = topBarH + 16;

  // ── Pastor View ─────────────────────────────────────────────────────────────

  const renderPastor = () => {
    const a = PASTOR_STATS;
    const maxVal = getMax(chartMetric);

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
      >
        {/* Stat Cards */}
        <View style={s.statRow}>
          <StatCard
            value={a.memberCount.toLocaleString()}
            label="Members"
            trend={a.memberChange}
            C={C}
          />
          <StatCard
            value={String(a.attendanceLast)}
            label="Attendance"
            trend={a.attendanceTrend}
            C={C}
          />
          <StatCard
            value={`$${(a.givingMonth / 1000).toFixed(0)}K`}
            label="Giving"
            trend={a.givingTrend}
            alertColor={GAIN}
            C={C}
          />
          <StatCard
            value={String(a.careOpen)}
            label="Care Reqs"
            trend={a.careOpen > 0 ? 0 : undefined}
            alertColor={a.careOpen > 0 ? HEAT : undefined}
            C={C}
          />
        </View>

        {/* Trend Chart */}
        <SecHeader title="Trend" C={C} />
        <View style={s.chartPillRow}>
          {(['attendance', 'giving', 'volunteers'] as ChartMetric[]).map(m => {
            const active = chartMetric === m;
            return (
              <Pressable
                key={m}
                style={[s.chartPill, active ? { backgroundColor: C.label } : { borderColor: C.separator, borderWidth: 1 }]}
                onPress={() => { Haptics.selectionAsync(); setChartMetric(m); }}
              >
                <Text style={[s.chartPillText, { color: active ? C.bg : C.secondary }]}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={[s.chartWrap, { backgroundColor: C.surface }]}>
          <View style={s.chartBars}>
            {CHART_DATA.map(pt => {
              const h = maxVal > 0 ? Math.round((pt[chartMetric] / maxVal) * BAR_MAX_H) : 4;
              const valLabel = chartMetric === 'giving'
                ? `$${(pt[chartMetric] / 1000).toFixed(0)}K`
                : String(pt[chartMetric]);
              return (
                <View key={pt.label} style={s.barCol}>
                  <Text style={[s.barValLabel, { color: C.secondary }]}>{valLabel}</Text>
                  <View style={s.barTrack}>
                    <View style={[s.bar, { height: h, backgroundColor: C.label }]} />
                  </View>
                  <Text style={[s.barXLabel, { color: C.secondary }]}>{pt.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Volunteer Gaps */}
        <SecHeader title="Volunteer Gaps" C={C} />
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {VOL_GAPS.map((gap, idx) => (
            <Pressable
              key={gap.ministry}
              style={[
                s.gapRow,
                idx < VOL_GAPS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => Alert.alert(gap.ministry, `Open roles: ${gap.roles}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.gapMinistry, { color: C.label }]}>{gap.ministry}</Text>
                <Text style={[s.gapRoles, { color: C.secondary }]}>{gap.roles}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Upcoming This Week */}
        <SecHeader title="Upcoming This Week" C={C} />
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {UPCOMING_EVENTS.map((ev, idx) => (
            <View
              key={ev.id}
              style={[
                s.eventRow,
                idx < UPCOMING_EVENTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.eventTitle, { color: C.label }]}>{ev.title}</Text>
                <Text style={[s.eventMeta, { color: C.secondary }]}>{ev.date} · {ev.time}</Text>
              </View>
              {!ev.isPublic && (
                <View style={[s.privateBadge, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[s.privateBadgeText, { color: C.secondary }]}>Internal</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Recent Activity */}
        <SecHeader title="Recent Activity" C={C} />
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {RECENT_ACTIVITY.map((item, idx) => (
            <View
              key={item.id}
              style={[
                s.activityRow,
                idx < RECENT_ACTIVITY.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <IconSymbol name={item.icon as any} size={16} color={C.secondary} />
              <View style={{ flex: 1 }}>
                <Text style={[s.activityText, { color: C.label }]}>{item.text}</Text>
                <Text style={[s.activityTime, { color: C.secondary }]}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ── Member View ──────────────────────────────────────────────────────────────

  const renderMember = () => {
    const ms = MEMBER_STATS;
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
      >
        {/* Church Info Card */}
        <View style={[s.churchCard, { backgroundColor: C.surface }]}>
          <Text style={[s.churchName, { color: C.label }]}>{CHURCH_INFO.name}</Text>
          <View style={s.churchRow}>
            <IconSymbol name="mappin" size={13} color={C.secondary} />
            <Text style={[s.churchMeta, { color: C.secondary }]}>{CHURCH_INFO.location}</Text>
          </View>
          <View style={[s.churchDivider, { backgroundColor: C.separator }]} />
          {CHURCH_INFO.serviceTimes.map(t => (
            <View key={t} style={s.churchRow}>
              <IconSymbol name="clock.fill" size={13} color={C.secondary} />
              <Text style={[s.churchMeta, { color: C.secondary }]}>{t}</Text>
            </View>
          ))}
          <View style={[s.churchDivider, { backgroundColor: C.separator }]} />
          <View style={s.churchRow}>
            <IconSymbol name="person.fill" size={13} color={C.secondary} />
            <Text style={[s.churchMeta, { color: C.secondary }]}>Pastor: {CHURCH_INFO.pastor}</Text>
          </View>
        </View>

        {/* Stat Cards */}
        <View style={s.statRow}>
          <StatCard value={ms.memberCount.toLocaleString()} label="Members" C={C} />
          <StatCard value={ms.nextService} label="Next Service" C={C} />
          <StatCard value={String(ms.myGroups)} label="My Groups" C={C} />
        </View>

        {/* Upcoming This Week (public events only) */}
        <SecHeader title="Upcoming This Week" C={C} />
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {UPCOMING_EVENTS.filter(e => e.isPublic).map((ev, idx, arr) => (
            <View
              key={ev.id}
              style={[
                s.eventRow,
                idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.eventTitle, { color: C.label }]}>{ev.title}</Text>
                <Text style={[s.eventMeta, { color: C.secondary }]}>{ev.date} · {ev.time}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Announcements */}
        <SecHeader title="Announcements" C={C} />
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {ANNOUNCEMENTS.map((ann, idx) => (
            <View
              key={ann.id}
              style={[
                s.annRow,
                idx < ANNOUNCEMENTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={[s.annIcon, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name="megaphone.fill" size={14} color={C.secondary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.annTitle, { color: C.label }]}>{ann.title}</Text>
                <Text style={[s.annBody, { color: C.secondary }]} numberOfLines={2}>{ann.body}</Text>
                <Text style={[s.annDate, { color: C.secondary }]}>{ann.date}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Content */}
      {isPastor ? renderPastor() : renderMember()}

      {/* Top Bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, height: topBarH }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Church Overview</Text>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen: { flex: 1 },

    topBarWrap: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    topBarTitle: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },

    statRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },

    chartPillRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    chartPill:    { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    chartPillText:{ fontSize: 12, fontWeight: '600' },

    chartWrap: { borderRadius: 12, padding: 14, marginBottom: 20 },
    chartBars: { flexDirection: 'row', alignItems: 'flex-end', height: BAR_MAX_H + 40, gap: 2 },
    barCol:    { flex: 1, alignItems: 'center', gap: 3 },
    barValLabel: { fontSize: 8, fontWeight: '500', textAlign: 'center' },
    barTrack:  { flex: 1, justifyContent: 'flex-end', width: '100%', alignItems: 'center' },
    bar:       { width: '75%', borderRadius: 3, minHeight: 4 },
    barXLabel: { fontSize: 9, fontWeight: '500' },

    card:     { borderRadius: 12, marginHorizontal: 0, marginBottom: 20, overflow: 'hidden' },
    rowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },

    gapRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, gap: 10 },
    gapMinistry: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    gapRoles:    { fontSize: 12 },

    eventRow:   { paddingVertical: 12, paddingHorizontal: 14, gap: 3 },
    eventTitle: { fontSize: 14, fontWeight: '600' },
    eventMeta:  { fontSize: 12 },
    privateBadge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    privateBadgeText: { fontSize: 10, fontWeight: '600' },

    activityRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 11, paddingHorizontal: 14 },
    activityText: { fontSize: 13 },
    activityTime: { fontSize: 11, marginTop: 2 },

    // Member
    churchCard:   { borderRadius: 12, padding: 16, marginBottom: 16 },
    churchName:   { fontSize: 20, fontWeight: '800', marginBottom: 10 },
    churchRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
    churchMeta:   { fontSize: 13 },
    churchDivider:{ height: StyleSheet.hairlineWidth, marginVertical: 8 },

    annRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 12, paddingHorizontal: 14 },
    annIcon: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    annTitle:{ fontSize: 14, fontWeight: '600', marginBottom: 3 },
    annBody: { fontSize: 12, lineHeight: 17 },
    annDate: { fontSize: 11, marginTop: 4 },
  });
}
