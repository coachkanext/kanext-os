/**
 * Community Congregation — ICCLA.
 * Pastor-only: Attendance trend, New Visitors, At-Risk members, Care Requests.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

// ─── Data ─────────────────────────────────────────────────────────────────────

const ATTENDANCE = {
  thisWeek: 462,
  lastWeek: 440,
  changeP:  5,
  average:  438,
  trend: [
    { label: 'Jan', val: 398 },
    { label: 'Feb', val: 412 },
    { label: 'Mar', val: 388 },
    { label: 'Apr', val: 425 },
    { label: 'May', val: 441 },
    { label: 'Jun', val: 418 },
    { label: 'Jul', val: 395 },
    { label: 'Aug', val: 430 },
    { label: 'Sep', val: 448 },
    { label: 'Oct', val: 460 },
    { label: 'Nov', val: 440 },
    { label: 'Dec', val: 462 },
  ],
};

const NEW_VISITORS = [
  { name: 'Amara Johnson',     date: 'Apr 20', status: 'Contacted'      },
  { name: 'David & Linda Kim', date: 'Apr 20', status: 'Not Yet'        },
  { name: 'Marcus Thompson',   date: 'Apr 13', status: 'Returned'       },
  { name: 'Fatima Al-Hassan',  date: 'Apr 13', status: 'Contacted'      },
  { name: 'Robert Chen',       date: 'Apr 6',  status: 'Did Not Return' },
  { name: 'Priya Patel',       date: 'Apr 6',  status: 'Contacted'      },
  { name: 'James & Mary Osei', date: 'Apr 6',  status: 'Returned'       },
  { name: 'Chloe Williams',    date: 'Mar 30', status: 'Not Yet'        },
  { name: 'Kenji Tanaka',      date: 'Mar 30', status: 'Contacted'      },
  { name: 'Ana Rivera',        date: 'Mar 23', status: 'Did Not Return' },
  { name: 'Samuel Okonkwo',    date: 'Mar 23', status: 'Returned'       },
  { name: 'Grace Mensah',      date: 'Mar 23', status: 'Not Yet'        },
];

const AT_RISK = [
  { name: 'Emmanuel Okafor', lastAttended: 'Mar 24', weeksMissed: 3, trend: 'down' },
  { name: 'Sarah Mitchell',  lastAttended: 'Mar 17', weeksMissed: 4, trend: 'down' },
  { name: 'James Adeyemi',   lastAttended: 'Mar 10', weeksMissed: 5, trend: 'down' },
  { name: 'Linda Chen',      lastAttended: 'Mar 24', weeksMissed: 3, trend: 'flat' },
];

const CARE_REQUESTS = [
  { type: 'Prayer Request',       member: 'Anonymous',        date: 'Apr 18', status: 'New',         icon: 'hands.sparkles.fill'      },
  { type: 'Hospital Visit',       member: 'Mama Grace Addo',  date: 'Apr 16', status: 'In Progress', icon: 'cross.fill'               },
  { type: 'Counseling Request',   member: 'Anonymous',        date: 'Apr 14', status: 'New',         icon: 'person.fill.questionmark' },
  { type: 'Prayer Request',       member: 'Bro. Emeka',       date: 'Apr 13', status: 'In Progress', icon: 'hands.sparkles.fill'      },
  { type: 'Financial Assistance', member: 'Anonymous',        date: 'Apr 10', status: 'New',         icon: 'dollarsign.circle.fill'   },
  { type: 'Hospital Visit',       member: 'Sister Ruth Osei', date: 'Apr 8',  status: 'Resolved',    icon: 'cross.fill'               },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
      {title}
    </Text>
  );
}

function visitorStatusColor(status: string): string {
  if (status === 'Returned')       return GAIN;
  if (status === 'Contacted')      return GAIN;
  if (status === 'Not Yet')        return CAUTION;
  if (status === 'Did Not Return') return HEAT;
  return '#8A837C';
}

function careStatusColor(status: string): string {
  if (status === 'Resolved')    return GAIN;
  if (status === 'In Progress') return CAUTION;
  return HEAT;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ComCongregationScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const trendMax = Math.max(...ATTENDANCE.trend.map(t => t.val));

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Congregation</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 120, paddingHorizontal: 16 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >

        {/* ── ATTENDANCE ── */}
        <View style={{ marginTop: 20, marginBottom: 28 }}>
          <SH title="Attendance" C={C} />
          <View style={styles.card}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 6 }}>
              <Text style={{ fontSize: 32, fontWeight: '800', color: C.label }}>{ATTENDANCE.thisWeek}</Text>
              <View style={{ backgroundColor: GAIN + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>+{ATTENDANCE.changeP}% this week</Text>
              </View>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 18 }}>
              Avg:{' '}
              <Text style={{ fontWeight: '600', color: C.label }}>{ATTENDANCE.average}</Text>
              {' · '}Last week:{' '}
              <Text style={{ fontWeight: '600', color: C.label }}>{ATTENDANCE.lastWeek}</Text>
            </Text>
            {/* 12-month trend */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 72, gap: 3, marginBottom: 6 }}>
              {ATTENDANCE.trend.map((item, i) => {
                const barH = Math.max(6, (item.val / trendMax) * 72);
                const isLast = i === ATTENDANCE.trend.length - 1;
                return (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{ width: '100%', height: barH, borderRadius: 3, backgroundColor: isLast ? C.label : C.separator }} />
                  </View>
                );
              })}
            </View>
            <View style={{ flexDirection: 'row', gap: 3 }}>
              {ATTENDANCE.trend.map((item, i) => (
                <Text key={i} style={{ flex: 1, fontSize: 8, color: C.muted, textAlign: 'center' }}>{item.label}</Text>
              ))}
            </View>
          </View>
        </View>

        {/* ── NEW VISITORS ── */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              New Visitors
            </Text>
            <View style={{ backgroundColor: C.separator, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>{NEW_VISITORS.length} this month</Text>
            </View>
          </View>
          {NEW_VISITORS.map((v, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.card, { marginBottom: 6, flexDirection: 'row', alignItems: 'center' }, pressed && { opacity: 0.8 }]}
            >
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>
                  {v.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{v.name}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>Visited {v.date}</Text>
              </View>
              <View style={{ backgroundColor: visitorStatusColor(v.status) + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: visitorStatusColor(v.status) }}>{v.status}</Text>
              </View>
            </Pressable>
          ))}
          <Pressable style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}>
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: C.secondary }}>View full outreach pipeline</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>
        </View>

        {/* ── AT-RISK ── */}
        <View style={{ marginBottom: 28 }}>
          <SH title="At-Risk Members" C={C} />
          <View style={{ backgroundColor: CAUTION + '18', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color={CAUTION} />
            <Text style={{ flex: 1, fontSize: 13, color: CAUTION, fontWeight: '600' }}>Members who haven't attended in 3+ weeks</Text>
          </View>
          {AT_RISK.map((m, i) => (
            <View key={i} style={[styles.card, { marginBottom: 8 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: C.label }}>
                    {m.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{m.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>Last: {m.lastAttended} · {m.weeksMissed} wks missed</Text>
                </View>
                <Text style={{ fontSize: 20, color: m.trend === 'down' ? HEAT : m.trend === 'flat' ? CAUTION : GAIN }}>
                  {m.trend === 'down' ? '↓' : m.trend === 'flat' ? '→' : '↑'}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable style={[styles.outlineBtn, { borderColor: C.separator, flex: 1 }]}>
                  <IconSymbol name="phone.fill" size={13} color={C.label} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Call</Text>
                </Pressable>
                <Pressable style={[styles.outlineBtn, { borderColor: C.separator, flex: 1 }]}>
                  <IconSymbol name="message.fill" size={13} color={C.label} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Message</Text>
                </Pressable>
                <Pressable style={[styles.outlineBtn, { borderColor: C.separator, flex: 1 }]}>
                  <IconSymbol name="person.badge.plus" size={13} color={C.label} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Assign</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* ── CARE REQUESTS ── */}
        <View style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>
              Care Requests
            </Text>
            <View style={{ backgroundColor: HEAT + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: HEAT }}>
                {CARE_REQUESTS.filter(r => r.status === 'New').length} New
              </Text>
            </View>
          </View>
          {CARE_REQUESTS.map((req, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [styles.card, { marginBottom: 6 }, pressed && { opacity: 0.8 }]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name={req.icon as any} size={16} color={C.label} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{req.type}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{req.member} · {req.date}</Text>
                </View>
                <View style={{ backgroundColor: careStatusColor(req.status) + '22', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: careStatusColor(req.status) }}>{req.status}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1 },
  topBar:    { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  card:      { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 },
  outlineBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderRadius: 10, paddingVertical: 9,
  },
});
