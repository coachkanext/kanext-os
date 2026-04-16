/**
 * Booster — Dashboard (Coach only)
 * Program revenue health: total revenue, revenue by source, monthly trend, top boosters, alerts.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';
import { BOOSTER_CAMPAIGNS, FAN_REWARDS } from '@/data/mock-sports-hub';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const REVENUE = { month: 12400, season: 84600, year: 112800 };

const SOURCES = [
  { label: 'Booster Giving',       amount: 42000, pct: 50, icon: 'heart.fill'              },
  { label: 'NIL Pool Contributions', amount: 18500, pct: 22, icon: 'person.crop.circle.fill' },
  { label: 'Ticket Sales',         amount: 14200, pct: 17, icon: 'ticket.fill'              },
  { label: 'Merch Sales',          amount:  7400, pct:  9, icon: 'bag.fill'                 },
  { label: 'Sponsorships',         amount:  2500, pct:  3, icon: 'building.2.fill'          },
];

const MONTHLY = [
  { month: 'Nov', rev:  4200 },
  { month: 'Dec', rev:  6800 },
  { month: 'Jan', rev:  9400 },
  { month: 'Feb', rev: 11200 },
  { month: 'Mar', rev: 14400 },
  { month: 'Apr', rev: 12400 },
];

const ALERTS = [
  { type: 'warning', msg: '2026-27 Travel Fund at 53% — 10 days to deadline' },
  { type: 'info',    msg: 'Senior Night Celebration in 3 days — 180 RSVPs' },
  { type: 'success', msg: 'New Scoreboard Campaign fully funded!' },
];

const QUICK_LINKS = [
  { label: 'Create Campaign', icon: 'plus.circle.fill', route: 'campaigns' },
  { label: 'Schedule Event',  icon: 'calendar.badge.plus', route: 'events' },
  { label: 'View NIL Pool',   icon: 'person.crop.circle.fill', route: 'nil' },
];

export default function BoosterDashboardScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('sports:booster');
  const isCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/booster/my-nil' as any);
  }, [isCoach, router]);

  if (!isCoach) return null;

  const maxRev = Math.max(...MONTHLY.map(m => m.rev));

  const alertIcon = (type: string) => {
    if (type === 'warning') return 'exclamationmark.triangle.fill';
    if (type === 'success') return 'checkmark.circle.fill';
    return 'info.circle.fill';
  };
  const alertColor = (type: string) => {
    if (type === 'warning') return CAUTION;
    if (type === 'success') return GAIN;
    return C.label;
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Booster Dashboard</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Revenue summary */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'This Month', value: `$${(REVENUE.month / 1000).toFixed(1)}K`, color: C.label },
            { label: 'This Season', value: `$${(REVENUE.season / 1000).toFixed(0)}K`, color: GAIN },
            { label: 'This Year', value: `$${(REVENUE.year / 1000).toFixed(0)}K`, color: C.label },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Revenue by source */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue by Source</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {SOURCES.map((src, i) => (
              <View
                key={src.label}
                style={[
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                ]}
              >
                <IconSymbol name={src.icon as any} size={16} color={C.secondary} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>{src.label}</Text>
                <Text style={{ fontSize: 12, color: C.secondary, marginRight: 8 }}>{src.pct}%</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>${src.amount.toLocaleString()}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Monthly revenue chart */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Monthly Revenue</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 72 }}>
              {MONTHLY.map((m, i) => {
                const barH = (m.rev / maxRev) * 72;
                const isLast = i === MONTHLY.length - 1;
                return (
                  <View key={m.month} style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <View style={{ width: '100%', height: barH, borderRadius: 3, backgroundColor: isLast ? C.label : C.separator }} />
                    <Text style={{ fontSize: 9, color: C.secondary }}>{m.month}</Text>
                  </View>
                );
              })}
            </View>
          </GlassView>
        </View>

        {/* Alerts */}
        {ALERTS.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Alerts</Text>
            <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
              {ALERTS.map((a, i) => (
                <View
                  key={i}
                  style={[
                    s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  ]}
                >
                  <IconSymbol name={alertIcon(a.type) as any} size={16} color={alertColor(a.type)} />
                  <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{a.msg}</Text>
                </View>
              ))}
            </GlassView>
          </View>
        )}

        {/* Top boosters */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Top Boosters</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {FAN_REWARDS.map((f, i) => (
              <Pressable
                key={f.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(f.name, `Total given: $${f.points.toLocaleString()}`); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={[s.avatarCircle, { backgroundColor: `hsl(${f.hue},40%,75%)` }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{f.name.split(' ').map((n: string) => n[0]).join('')}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{f.name}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 1 }}>Monthly donor</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>${f.points.toLocaleString()}</Text>
              </Pressable>
            ))}
          </GlassView>
        </View>

        {/* Quick links */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Quick Actions</Text>
          <View style={s.row}>
            {QUICK_LINKS.map(ql => (
              <Pressable
                key={ql.label}
                style={({ pressed }) => [s.quickBtn, { backgroundColor: C.surface, borderColor: C.separator, flex: 1, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(`/(tabs)/(main)/booster/${ql.route}` as any);
                }}
              >
                <IconSymbol name={ql.icon as any} size={20} color={C.label} />
                <Text style={{ fontSize: 11, fontWeight: '600', color: C.label, textAlign: 'center', marginTop: 6 }}>{ql.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    statCard:      { alignItems: 'center', padding: 12, borderRadius: 12 },
    avatarCircle:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    quickBtn:      { alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, gap: 2, marginHorizontal: 4 },
  });
}
