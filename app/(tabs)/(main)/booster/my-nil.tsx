/**
 * Booster — My NIL (Player only)
 * Player's NIL earnings, pool allocation, active deals, compliance, tax summary.
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
import { NIL_DEALS } from '@/data/mock-sports-hub';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const MY_PLAYER_ID = 'p01'; // Laolu Kalejaiye

const EARNINGS = {
  thisMonth: 3600,
  season:    14200,
  year:      14200,
};

const POOL_ALLOCATION = {
  amount:   1200,
  period:   'April 2026',
  status:   'Scheduled',
  payDate:  'Apr 25, 2026',
};

const PAYMENT_HISTORY = [
  { month: 'Mar 2026', amount: 1200, status: 'Paid' },
  { month: 'Feb 2026', amount: 1200, status: 'Paid' },
  { month: 'Jan 2026', amount: 1000, status: 'Paid' },
  { month: 'Dec 2025', amount: 800,  status: 'Paid' },
];

const COMPLIANCE_ITEMS = [
  { label: 'Gatorade ambassador — disclosure filed',   status: 'ok'      },
  { label: 'NAIA eligibility form on file',           status: 'ok'      },
  { label: 'Q2 self-report due Apr 30',               status: 'pending' },
  { label: 'Agent contact restrictions acknowledged', status: 'ok'      },
];

export default function MyNILScreen() {
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
    if (isCoach) router.replace('/(tabs)/(main)/booster/dashboard' as any);
  }, [isCoach, router]);

  if (isCoach) return null;

  const myDeals = NIL_DEALS.filter(d => d.playerId === MY_PLAYER_ID);

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
              <Text style={[s.titlePillText, { color: C.label }]}>My NIL</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={!isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Earnings summary */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'This Month', value: `$${(EARNINGS.thisMonth / 1000).toFixed(1)}K`, color: GAIN },
            { label: 'Season',     value: `$${(EARNINGS.season / 1000).toFixed(1)}K`,    color: C.label },
            { label: 'This Year',  value: `$${(EARNINGS.year / 1000).toFixed(1)}K`,      color: C.label },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Earnings breakdown */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>This Month</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {[
              { label: 'Pool Allocation',  amount: 1200, icon: 'person.2.fill' },
              { label: 'Personal Deals',   amount: 2400, icon: 'dollarsign.circle.fill' },
            ].map((item, i) => (
              <View key={item.label} style={[
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <IconSymbol name={item.icon as any} size={16} color={C.secondary} />
                <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{item.label}</Text>
                <Text style={{ fontSize: 14, fontWeight: '700', color: GAIN }}>${item.amount.toLocaleString()}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Pool allocation card */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Pool Allocation</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            <View style={[s.row, { marginBottom: 12 }]}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>${POOL_ALLOCATION.amount.toLocaleString()}</Text>
              <View style={[s.statusPill, { backgroundColor: GAIN + '18', borderColor: GAIN + '60', marginLeft: 10 }]}>
                <Text style={{ fontSize: 10, fontWeight: '600', color: GAIN }}>{POOL_ALLOCATION.status}</Text>
              </View>
            </View>
            {[
              { label: 'Period',   value: POOL_ALLOCATION.period  },
              { label: 'Pay Date', value: POOL_ALLOCATION.payDate },
            ].map((item, i) => (
              <View key={item.label} style={[s.row, { paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 13, color: C.secondary, width: 80 }}>{item.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{item.value}</Text>
              </View>
            ))}

            {/* Payment history */}
            <View style={{ marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, paddingTop: 12 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>PAYMENT HISTORY</Text>
              {PAYMENT_HISTORY.map((p, i) => (
                <View key={p.month} style={[s.row, { paddingVertical: 7 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                  <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{p.month}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginRight: 12 }}>{p.status}</Text>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>${p.amount.toLocaleString()}</Text>
                </View>
              ))}
            </View>
          </GlassView>
        </View>

        {/* Active deals */}
        {myDeals.length > 0 && (
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Active Deals</Text>
            <View style={{ gap: 12 }}>
              {myDeals.map(deal => (
                <GlassView key={deal.id} tier={1} style={{ borderRadius: 14, padding: 14 }}>
                  <View style={[s.row, { marginBottom: 8 }]}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }}>{deal.brand}</Text>
                    <View style={[s.statusPill, {
                      backgroundColor: deal.status === 'completed' ? GAIN + '18' : CAUTION + '18',
                      borderColor:     deal.status === 'completed' ? GAIN + '60' : CAUTION + '60',
                    }]}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: deal.status === 'completed' ? GAIN : CAUTION }}>
                        {deal.status === 'completed' ? 'Completed' : 'In Progress'}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10 }}>
                    {deal.type} · {deal.startDate} – {deal.endDate}
                  </Text>

                  {/* Progress bar */}
                  <View style={[s.progressTrack, { backgroundColor: C.separator, marginBottom: 6 }]}>
                    <View style={[s.progressFill, { width: `${deal.completed}%` as any, backgroundColor: deal.completed === 100 ? GAIN : CAUTION }]} />
                  </View>
                  <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 10 }}>{deal.completed}% complete</Text>

                  {/* Deliverables */}
                  {deal.deliverables.map(d => (
                    <View key={d} style={[s.row, { gap: 8, marginBottom: 4 }]}>
                      <IconSymbol name="checkmark.circle.fill" size={13} color={deal.completed === 100 ? GAIN : C.separator} />
                      <Text style={{ fontSize: 12, color: C.secondary }}>{d}</Text>
                    </View>
                  ))}

                  <View style={[s.row, { justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Deal Value</Text>
                    <Text style={{ fontSize: 14, fontWeight: '800', color: GAIN }}>${deal.amount.toLocaleString()}</Text>
                  </View>
                </GlassView>
              ))}
            </View>
          </View>
        )}

        {/* Compliance */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Compliance</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {COMPLIANCE_ITEMS.map((item, i) => (
              <View key={item.label} style={[
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <IconSymbol
                  name={item.status === 'ok' ? 'checkmark.circle.fill' : 'clock.fill'}
                  size={15}
                  color={item.status === 'ok' ? GAIN : CAUTION}
                />
                <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{item.label}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Tax summary */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Tax Summary</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            {[
              { label: 'YTD Earnings',     value: `$${EARNINGS.year.toLocaleString()}` },
              { label: 'Est. Tax (~20%)',   value: `~$${Math.round(EARNINGS.year * 0.2).toLocaleString()}` },
            ].map((item, i) => (
              <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={{ fontSize: 13, color: C.secondary, flex: 1 }}>{item.label}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{item.value}</Text>
              </View>
            ))}
            <Pressable
              style={({ pressed }) => [s.downloadBtn, { borderColor: C.separator, marginTop: 12, opacity: pressed ? 0.7 : 1 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Tax Summary', 'Download PDF — coming soon'); }}
            >
              <IconSymbol name="arrow.down.circle.fill" size={15} color={C.label} style={{ marginRight: 6 }} />
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Download Tax Summary</Text>
            </Pressable>
          </GlassView>
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
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill:  { height: 4, borderRadius: 2 },
    downloadBtn:   { height: 42, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  });
}
