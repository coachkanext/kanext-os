/**
 * Booster — NIL Management (Coach only)
 * NIL pool balance, player allocation table, Dipson recommendations, compliance.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { PLAYERS, NIL_OPPORTUNITIES } from '@/data/mock-sports-hub';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const POOL_BALANCE = 48500;
const INFLOWS_MONTH = 6200;
const OUTFLOWS_MONTH = 4800;

// Player Transaction Value by player id
const PTV: Record<string, number> = {
  p01: 94, p05: 82, p06: 74, p03: 73, p04: 68,
  p02: 66, p08: 62, p07: 58, p09: 54, p10: 50,
  p11: 44, p12: 42, p13: 38, p14: 36, p15: 40,
};

// Monthly allocation by player id
const ALLOCATION: Record<string, number> = {
  p01: 2400, p05: 1800, p06: 1200, p03: 1100, p04: 900,
  p02: 800, p08: 600, p07: 600,
};

const DIPSON_RECS = [
  { player: 'Laolu Kalejaiye',  ptv: 94, rec: 2400, note: 'Highest PTV · First Team All-Conference' },
  { player: 'Paul Diomande',    ptv: 82, rec: 1800, note: 'Elite rim protector · high social reach'  },
  { player: 'Brandon Williams', ptv: 74, rec: 1200, note: 'Floor general · rising PTV'               },
  { player: 'Samuel Manzo',     ptv: 73, rec: 1100, note: 'Strong social engagement · Jordan deal'   },
];

const COMPLIANCE_ITEMS = [
  { label: 'Disclosure filings current',  status: 'ok'      },
  { label: 'NAIA registration on file',   status: 'ok'      },
  { label: 'Agent contact restrictions',  status: 'ok'      },
  { label: 'Q2 report due Apr 30',        status: 'pending' },
];

type SortKey = 'PTV' | 'KR' | 'Alloc' | 'Name';

export default function NILScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('sports:booster');
  const isCoach = role === roleCycles[0];
  const [sortKey, setSortKey] = useState<SortKey>('PTV');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/booster/my-nil' as any);
  }, [isCoach, router]);

  if (!isCoach) return null;

  const SORT_KEYS: SortKey[] = ['PTV', 'KR', 'Alloc', 'Name'];

  const rosterWithAlloc = useMemo(() => {
    const list = PLAYERS.map(p => ({
      ...p,
      ptv:   PTV[p.id]   ?? 0,
      alloc: ALLOCATION[p.id] ?? 0,
    }));
    if (sortKey === 'PTV')   return [...list].sort((a, b) => b.ptv - a.ptv);
    if (sortKey === 'KR')    return [...list].sort((a, b) => b.kr.overall - a.kr.overall);
    if (sortKey === 'Alloc') return [...list].sort((a, b) => b.alloc - a.alloc);
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }, [sortKey]);

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
              <Text style={[s.titlePillText, { color: C.label }]}>NIL</Text>
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

        {/* Pool balance */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'Pool Balance', value: `$${(POOL_BALANCE / 1000).toFixed(1)}K`, color: C.label },
            { label: 'Inflows',      value: `+$${(INFLOWS_MONTH / 1000).toFixed(1)}K`, color: GAIN },
            { label: 'Outflows',     value: `-$${(OUTFLOWS_MONTH / 1000).toFixed(1)}K`, color: HEAT },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Dipson recommendations */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={[s.sectionTitle, { color: C.label }]}>Dipson Recommendations</Text>
            <View style={{ backgroundColor: C.label + '14', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: C.label }}>AI</Text>
            </View>
          </View>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {DIPSON_RECS.map((rec, i) => (
              <View key={rec.player} style={[
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{rec.player}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{rec.note}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: GAIN }}>${rec.rec.toLocaleString()}/mo</Text>
                  <Text style={{ fontSize: 10, color: C.secondary }}>PTV {rec.ptv}</Text>
                </View>
              </View>
            ))}
          </GlassView>
          <Pressable
            style={[s.approveBtn, { backgroundColor: C.label, marginTop: 10 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Allocations Approved', 'NIL pool allocations have been applied.'); }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Approve Allocations</Text>
          </Pressable>
        </View>

        {/* Allocation table */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={[s.sectionTitle, { color: C.label }]}>Allocation Table</Text>
            <Pressable
              style={[s.sortPill, { backgroundColor: C.surface, borderColor: C.separator }]}
              onPress={() => {
                Haptics.selectionAsync();
                const idx = SORT_KEYS.indexOf(sortKey);
                setSortKey(SORT_KEYS[(idx + 1) % SORT_KEYS.length]);
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{sortKey}</Text>
              <IconSymbol name="chevron.down" size={10} color={C.secondary} />
            </Pressable>
          </View>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {/* Header row */}
            <View style={[s.row, { paddingVertical: 8, paddingHorizontal: 14, gap: 8 }]}>
              <Text style={[s.tableHeader, { flex: 1, color: C.secondary }]}>PLAYER</Text>
              <Text style={[s.tableHeader, { width: 36, textAlign: 'center', color: C.secondary }]}>PTV</Text>
              <Text style={[s.tableHeader, { width: 36, textAlign: 'center', color: C.secondary }]}>KR</Text>
              <Text style={[s.tableHeader, { width: 72, textAlign: 'right', color: C.secondary }]}>ALLOC/MO</Text>
            </View>
            {rosterWithAlloc.map((p, i) => (
              <View key={p.id} style={[
                s.row, { paddingVertical: 11, paddingHorizontal: 14, gap: 8 },
                { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{p.name}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{p.position} · {p.classYear}</Text>
                </View>
                <Text style={{ width: 36, textAlign: 'center', fontSize: 13, fontWeight: '700', color: p.ptv >= 70 ? GAIN : C.secondary }}>{p.ptv}</Text>
                <Text style={{ width: 36, textAlign: 'center', fontSize: 13, fontWeight: '700', color: C.secondary }}>{Math.round(p.kr.overall)}</Text>
                <Text style={{ width: 72, textAlign: 'right', fontSize: 13, fontWeight: '700', color: p.alloc > 0 ? C.label : C.secondary }}>
                  {p.alloc > 0 ? `$${p.alloc.toLocaleString()}` : '—'}
                </Text>
              </View>
            ))}
          </GlassView>
        </View>

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
                  size={16}
                  color={item.status === 'ok' ? GAIN : CAUTION}
                />
                <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{item.label}</Text>
                <View style={[s.statusPill, { backgroundColor: (item.status === 'ok' ? GAIN : CAUTION) + '18', borderColor: (item.status === 'ok' ? GAIN : CAUTION) + '60' }]}>
                  <Text style={{ fontSize: 10, fontWeight: '600', color: item.status === 'ok' ? GAIN : CAUTION }}>
                    {item.status === 'ok' ? 'Filed' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}
          </GlassView>
        </View>

        {/* NIL Opportunities */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Open Opportunities</Text>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {NIL_OPPORTUNITIES.map((opp, i) => (
              <Pressable
                key={opp.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(opp.brand, `${opp.description}\n\n$${opp.amount.toLocaleString()} · Due ${opp.deadline}`); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{opp.brand}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{opp.type} · Due {opp.deadline}</Text>
                </View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: GAIN }}>${opp.amount.toLocaleString()}</Text>
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              </Pressable>
            ))}
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
    tableHeader:   { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
    sortPill:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
    approveBtn:    { height: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  });
}
