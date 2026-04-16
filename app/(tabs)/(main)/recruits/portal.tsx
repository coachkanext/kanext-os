/**
 * Recruits — Portal (Head Coach only).
 * Transfer portal live feed. Filter by position/fit. Color-coded borders.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { setPendingEvalQuery } from '@/utils/global-nexus-state';
import { nationalPool } from '@/data/national-pool';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';

const POSITIONS = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];

type PortalFilter = 'All' | 'High Fit';
const PORTAL_FILTERS: PortalFilter[] = ['All', 'High Fit'];

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function fitBorderColor(fit?: number): string | undefined {
  if (!fit) return undefined;
  if (fit >= 95) return GAIN;
  if (fit >= 85) return CAUTION;
  return undefined;
}

export default function PortalScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  const [posFilter, setPosFilter]         = useState('All');
  const [fitFilter, setFitFilter]         = useState<PortalFilter>('All');
  const [addedIds, setAddedIds]           = useState<Set<string>>(new Set());

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isCoach) router.replace('/(tabs)/(main)/recruits/program' as any);
  }, [isCoach, router]));

  const portalPlayers = useMemo(() => nationalPool.search({
    hasPortalEntry: true,
    position: posFilter !== 'All' ? posFilter : undefined,
    sortBy: 'ppg', sortDir: 'desc',
    limit: 60,
  }), [posFilter]);

  // Augment with mock systemFit for demo
  const augmented = useMemo(() => portalPlayers.map((p, i) => ({
    ...p,
    systemFit: [98, 94, 91, 87, 83, 96, 79, 88, 92, 76][i % 10],
    dipsonAlert: i < 2,
  })), [portalPlayers]);

  const filtered = useMemo(() =>
    fitFilter === 'High Fit' ? augmented.filter(p => p.systemFit >= 95) : augmented,
    [augmented, fitFilter]
  );

  if (!isCoach) return null;

  const highFitCount = augmented.filter(p => p.systemFit >= 95).length;
  const contactedCount = Math.min(3, filtered.length);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Portal</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Portal Intelligence banner */}
        <View style={[s.banner, { backgroundColor: '#1A1714', marginHorizontal: 16, marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IconSymbol name="sparkles" size={15} color={CAUTION} />
            <Text style={{ fontSize: 14, fontWeight: '800', color: '#fff' }}>Portal Intelligence</Text>
          </View>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.80)' }}>
            {highFitCount} portal entries match 95%+ System Fit for your gaps
          </Text>
          <View style={{ flexDirection: 'row', gap: 16, marginTop: 10 }}>
            {[
              { label: 'Total Entries', value: filtered.length },
              { label: 'High Fit (95%+)', value: highFitCount },
              { label: 'Contacted', value: contactedCount },
            ].map(stat => (
              <View key={stat.label}>
                <Text style={{ fontSize: 18, fontWeight: '900', color: '#fff' }}>{stat.value}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Filter pills row */}
        <View style={{ flexDirection: 'row', gap: 0 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
              {PORTAL_FILTERS.map(f => {
                const active = f === fitFilter;
                return (
                  <Pressable key={f} onPress={() => { setFitFilter(f); Haptics.selectionAsync(); }}
                    style={[s.pill, { backgroundColor: active ? '#1A1714' : C.surface, borderColor: active ? '#1A1714' : C.separator }]}>
                    <Text style={[s.pillText, { color: active ? '#fff' : C.secondary }]}>{f === 'High Fit' ? 'High Fit (95%+)' : f}</Text>
                  </Pressable>
                );
              })}
              {POSITIONS.filter(p => p !== 'All').map(pos => {
                const active = pos === posFilter;
                return (
                  <Pressable key={pos} onPress={() => { setPosFilter(active ? 'All' : pos); Haptics.selectionAsync(); }}
                    style={[s.pill, { backgroundColor: active ? '#1A1714' : C.surface, borderColor: active ? '#1A1714' : C.separator }]}>
                    <Text style={[s.pillText, { color: active ? '#fff' : C.secondary }]}>{pos}</Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Portal list */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {filtered.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <IconSymbol name="arrow.left.arrow.right" size={32} color={C.secondary} />
              <Text style={{ color: C.secondary, fontSize: 14, marginTop: 8 }}>No portal entries for this filter</Text>
            </View>
          ) : (
            filtered.map((p, idx) => {
              const initials = initialsFrom(p.fullName);
              const borderColor = fitBorderColor(p.systemFit);
              const isAdded = addedIds.has(p.id);
              return (
                <View key={`${p.id}-${idx}`} style={[s.portalCard, { backgroundColor: C.surface, borderWidth: borderColor ? 1.5 : 0, borderColor: borderColor ?? 'transparent' }]}>
                  {/* Dipson alert */}
                  {p.dipsonAlert && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8, padding: 8, backgroundColor: CAUTION + '18', borderRadius: 8 }}>
                      <IconSymbol name="sparkles" size={12} color={CAUTION} />
                      <Text style={{ fontSize: 12, color: CAUTION, fontWeight: '600', flex: 1 }} numberOfLines={2}>
                        {p.systemFit}% System Fit · Top match for your positional gap at {p.position}
                      </Text>
                    </View>
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: `hsl(${p.id.charCodeAt(0) % 360},50%,42%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{p.fullName}</Text>
                        <View style={[s.badge, { backgroundColor: '#1A1714' + '18' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1714' }}>{p.position}</Text>
                        </View>
                        {p.systemFit >= 95 ? (
                          <View style={[s.badge, { backgroundColor: GAIN + '22' }]}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: GAIN }}>Fit {p.systemFit}%</Text>
                          </View>
                        ) : p.systemFit >= 85 ? (
                          <View style={[s.badge, { backgroundColor: CAUTION + '22' }]}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: CAUTION }}>Fit {p.systemFit}%</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{p.school} · {p.conference}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <View style={[s.badge, { backgroundColor: GAIN + '18' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: GAIN }}>Portal</Text>
                        </View>
                        {p.portalEntryDate && (
                          <Text style={{ fontSize: 11, color: C.secondary }}>Entered {p.portalEntryDate}</Text>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                    {[{ label: 'PPG', val: p.ppg }, { label: 'RPG', val: p.rpg }, { label: 'APG', val: p.apg }].map(stat => (
                      <View key={stat.label} style={{ alignItems: 'center', backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{stat.val != null ? stat.val.toFixed(1) : '-'}</Text>
                        <Text style={{ fontSize: 10, color: C.secondary }}>{stat.label}</Text>
                      </View>
                    ))}
                    <View style={{ flex: 1 }} />
                    <Pressable onPress={() => { const q = `evaluate ${p.fullName} from ${p.school} (portal)`; setPendingEvalQuery(q); router.push('/nexus' as any); }}
                      style={[s.actionBtn, { backgroundColor: '#1A1714' + '18', borderColor: '#1A1714' + '40' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1714' }}>Evaluate</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setAddedIds(prev => new Set([...prev, p.id])); Alert.alert('Added to Board', `${p.fullName} added to the Identified stage.`); }}
                      style={[s.actionBtn, { backgroundColor: isAdded ? GAIN + '22' : C.bg, borderColor: isAdded ? GAIN : C.separator, flexDirection: 'row', gap: 4 }]}>
                      <IconSymbol name={isAdded ? 'checkmark' : 'plus'} size={11} color={isAdded ? GAIN : '#1A1714'} />
                      <Text style={{ fontSize: 11, fontWeight: '600', color: isAdded ? GAIN : '#1A1714' }}>{isAdded ? 'Added' : 'Add'}</Text>
                    </Pressable>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },
  banner:      { padding: 16, borderRadius: 14 },
  pill:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  pillText:    { fontSize: 12, fontWeight: '600' },
  portalCard:  { borderRadius: 12, padding: 14 },
  badge:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  actionBtn:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
});
