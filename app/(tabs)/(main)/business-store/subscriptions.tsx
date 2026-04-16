/**
 * Business Store — Subscriptions
 * CEO: plans + subscriber list + churn + MRR summary.
 * Client: my active subscriptions.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type Plan = {
  id: string; name: string; price: number; priceLabel: string;
  subscribers: number; mrr: number; icon: string;
};

const PLANS: Plan[] = [
  { id:'pl01', name:'KaNeXT OS Pro',                    price:29,  priceLabel:'$29/mo',  subscribers:45, mrr:1305, icon:'app.fill'   },
  { id:'pl02', name:'Basketball Intelligence API Starter', price:99, priceLabel:'$99/mo', subscribers:12, mrr:1188, icon:'curlybraces' },
  { id:'pl03', name:'Basketball Intelligence API Pro',   price:499, priceLabel:'$499/mo', subscribers:4,  mrr:1996, icon:'antenna.radiowaves.left.and.right' },
  { id:'pl04', name:'KaNeXT OS Enterprise',             price:0,   priceLabel:'Custom',  subscribers:3,  mrr:1911, icon:'building.2.fill' },
];

const MRR_TOTAL = 6400;

type Subscriber = { id: string; name: string; plan: string; since: string; status: 'Active' | 'Churned' | 'Trial' };

const SUBSCRIBERS: Subscriber[] = [
  { id:'sub01', name:'Marcus Webb',       plan:'KaNeXT OS Pro',                    since:'Jan 2026', status:'Active'  },
  { id:'sub02', name:'Sandra Ellis',      plan:'Basketball Intelligence API Starter', since:'Feb 2026', status:'Active' },
  { id:'sub03', name:'Tyler Okafor',      plan:'Basketball Intelligence API Pro',  since:'Jan 2026', status:'Active'  },
  { id:'sub04', name:'Deja Collins',      plan:'KaNeXT OS Pro',                    since:'Mar 2026', status:'Active'  },
  { id:'sub05', name:'Kevin Shaw',        plan:'KaNeXT OS Pro',                    since:'Mar 2026', status:'Trial'   },
  { id:'sub06', name:'Victoria James',    plan:'KaNeXT OS Enterprise',             since:'Nov 2025', status:'Active'  },
  { id:'sub07', name:'Jordan Lee',        plan:'KaNeXT OS Pro',                    since:'Feb 2026', status:'Churned' },
];

const SUB_STATUS_COLOR: Record<Subscriber['status'], string> = {
  Active:  GAIN,
  Churned: HEAT,
  Trial:   CAUTION,
};

// Client's own subscriptions
const MY_SUBS = [
  { id:'ms01', plan:'KaNeXT OS Pro', status:'Active', since:'Mar 15, 2026', next:'May 15, 2026', amount:'$29/mo' },
];

export default function SubscriptionsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:store');
  const isCEO = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const activeCount  = SUBSCRIBERS.filter(s => s.status === 'Active').length;
  const churnedCount = SUBSCRIBERS.filter(s => s.status === 'Churned').length;
  const trialCount   = SUBSCRIBERS.filter(s => s.status === 'Trial').length;

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
              <Text style={[s.titlePillText, { color: C.label }]}>Subscriptions</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {isCEO ? (
          <>
            {/* MRR summary */}
            <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
              {[
                { label: 'MRR',       value: `$${(MRR_TOTAL / 1000).toFixed(1)}K`,        color: GAIN    },
                { label: 'ARR',       value: `$${(MRR_TOTAL * 12 / 1000).toFixed(1)}K`, color: C.label },
                { label: 'Active',    value: `${activeCount}`,                   color: GAIN    },
                { label: 'Churned',   value: `${churnedCount}`,                  color: HEAT    },
              ].map(stat => (
                <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
                  <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
                  <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
                </GlassView>
              ))}
            </View>

            {/* Plans breakdown */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Plans</Text>
              <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
                {PLANS.map((plan, i) => {
                  const pct = Math.round((plan.mrr / MRR_TOTAL) * 100);
                  return (
                    <Pressable
                      key={plan.id}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(plan.name, `${plan.subscribers} subscribers · $${plan.mrr}/mo MRR`); }}
                      style={({ pressed }) => [
                        { paddingVertical: 13, paddingHorizontal: 14 },
                        i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                        pressed && { opacity: 0.7 },
                      ]}
                    >
                      <View style={[s.row, { marginBottom: 6 }]}>
                        <IconSymbol name={plan.icon as any} size={16} color={C.label} style={{ marginRight: 10 }} />
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={1}>{plan.name}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary, marginRight: 8 }}>{plan.subscribers} subs</Text>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>${plan.mrr}/mo</Text>
                      </View>
                      <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                        <View style={[s.progressFill, { width: `${pct}%` as any, backgroundColor: GAIN }]} />
                      </View>
                    </Pressable>
                  );
                })}
              </GlassView>
            </View>

            {/* Subscriber list */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
                <Text style={[s.sectionTitle, { color: C.label }]}>Subscribers</Text>
                {trialCount > 0 && (
                  <View style={{ backgroundColor: CAUTION + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: CAUTION }}>{trialCount} trial</Text>
                  </View>
                )}
              </View>
              <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
                {SUBSCRIBERS.map((sub, i) => (
                  <Pressable
                    key={sub.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(sub.name, `Plan: ${sub.plan}\nSince: ${sub.since}`); }}
                    style={({ pressed }) => [
                      s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{sub.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }} numberOfLines={1}>{sub.plan}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{sub.since}</Text>
                    <View style={[s.statusPill, { backgroundColor: SUB_STATUS_COLOR[sub.status] + '18', borderColor: SUB_STATUS_COLOR[sub.status] + '60' }]}>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: SUB_STATUS_COLOR[sub.status] }}>{sub.status}</Text>
                    </View>
                  </Pressable>
                ))}
              </GlassView>
            </View>
          </>
        ) : (
          <>
            {/* Client — my subscriptions */}
            <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
              <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>My Subscriptions</Text>
              {MY_SUBS.map(sub => (
                <GlassView key={sub.id} tier={1} style={{ borderRadius: 14, padding: 16, marginBottom: 12 }}>
                  <View style={[s.row, { marginBottom: 12 }]}>
                    <IconSymbol name="app.fill" size={18} color={C.label} style={{ marginRight: 10 }} />
                    <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, flex: 1 }}>{sub.plan}</Text>
                    <View style={[s.statusPill, { backgroundColor: GAIN + '18', borderColor: GAIN + '60' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: GAIN }}>{sub.status}</Text>
                    </View>
                  </View>
                  {[
                    { label: 'Plan',       value: sub.amount },
                    { label: 'Since',      value: sub.since },
                    { label: 'Next Bill',  value: sub.next },
                  ].map((item, i) => (
                    <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                      <Text style={{ fontSize: 13, color: C.secondary, width: 80 }}>{item.label}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{item.value}</Text>
                    </View>
                  ))}
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Cancel Subscription', 'Are you sure you want to cancel?'); }}
                    style={[s.cancelBtn, { borderColor: HEAT + '60', marginTop: 12 }]}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '600', color: HEAT }}>Cancel Plan</Text>
                  </Pressable>
                </GlassView>
              ))}

              {/* Upgrade CTA */}
              <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 4 }}>Upgrade to Enterprise</Text>
                <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 14 }}>Custom deployment, SSO, and a dedicated account manager.</Text>
                <Pressable
                  style={[s.upgradeBtn, { backgroundColor: C.label }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Contact Sales', 'Opening request form — coming soon'); }}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Contact Sales</Text>
                </Pressable>
              </GlassView>
            </View>
          </>
        )}

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
    cancelBtn:     { height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1 },
    upgradeBtn:    { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  });
}
