/**
 * Recruits — Search (Head Coach only).
 * 250K+ player pool. Search, filter by position/level, evaluate, add to board.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated, TextInput, Platform,
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

const TOP_BAR_H   = 52;
const GAIN        = '#5A8A6E';
const CAUTION     = '#B8943E';
const PAGE_SIZE   = 50;
const DEBOUNCE_MS = 200;

const POSITIONS = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];

const LEVEL_PILLS = ['All', 'D1 HM', 'D1 MM', 'D1 LM', 'D2', 'D3', 'NAIA', 'JUCO', 'USCAA'];
const LEVEL_MAP: Record<string, string | string[]> = {
  'D1 HM': 'ncaa_d1_high_major', 'D1 MM': 'ncaa_d1_mid_major', 'D1 LM': 'ncaa_d1_low_major',
  'D2': 'ncaa_d2', 'D3': 'ncaa_d3', 'NAIA': 'naia',
  'JUCO': ['njcaa_d1', 'njcaa_d2', 'njcaa_d3'], 'USCAA': 'uscaa',
};

const SAVED_SEARCHES = [
  "6'5+ wings, NJCAA, Fit 90%+",
  "PG Portal, KR 70+, Immediate eligible",
  "NAIA bigs, 6'8+, GPA 2.5+",
];

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export default function SearchScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  const [query, setQuery]         = useState('');
  const [debQuery, setDebQuery]   = useState('');
  const [posFilter, setPosFilter] = useState('All');
  const [lvlFilter, setLvlFilter] = useState('All');
  const [page, setPage]           = useState(0);

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const toastRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isCoach) router.replace('/(tabs)/(main)/recruits/program' as any);
  }, [isCoach, router]));

  useEffect(() => {
    const t = setTimeout(() => setDebQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => { setPage(0); }, [debQuery, posFilter, lvlFilter]);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastRef.current) clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToastMsg(null), 2000);
  }, []);

  const levelKey = useMemo(() => lvlFilter === 'All' ? undefined : LEVEL_MAP[lvlFilter] ?? lvlFilter, [lvlFilter]);

  const results = useMemo(() => nationalPool.search({
    query: debQuery || undefined,
    position: posFilter !== 'All' ? posFilter : undefined,
    level: levelKey,
    sortBy: 'ppg', sortDir: 'desc',
    limit: PAGE_SIZE * (page + 1),
  }), [debQuery, posFilter, levelKey, page]);

  const total = useMemo(() => nationalPool.count({
    query: debQuery || undefined,
    position: posFilter !== 'All' ? posFilter : undefined,
    level: levelKey,
  }), [debQuery, posFilter, levelKey]);

  if (!isCoach) return null;

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
              <Text style={[s.titleText, { color: C.label }]}>Search</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Dipson suggestion */}
        <View style={[s.dipsonCard, { backgroundColor: '#1A1714', marginHorizontal: 16, marginBottom: 12 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconSymbol name="sparkles" size={16} color={CAUTION} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff', marginBottom: 2 }}>Ask Dipson to find prospects</Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>Find a rim protector who fits our switch defense →</Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color="rgba(255,255,255,0.5)" />
          </View>
        </View>

        {/* Search bar */}
        <View style={{ paddingHorizontal: 16, marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 6 }}>{total.toLocaleString()} players in pool</Text>
          <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
            <TextInput
              value={query} onChangeText={setQuery}
              placeholder="Search players..."
              placeholderTextColor={C.secondary}
              style={{ flex: 1, fontSize: 14, color: C.label, marginLeft: 8, paddingVertical: Platform.OS === 'ios' ? 0 : 2 }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Position filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 6 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
            {POSITIONS.map(pos => {
              const active = pos === posFilter;
              return (
                <Pressable key={pos} onPress={() => { setPosFilter(pos); Haptics.selectionAsync(); }}
                  style={[s.pill, { backgroundColor: active ? '#1A1714' : C.surface, borderColor: active ? '#1A1714' : C.separator }]}>
                  <Text style={[s.pillText, { color: active ? '#fff' : C.secondary }]}>{pos}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Level filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16 }}>
            {LEVEL_PILLS.map(lvl => {
              const active = lvl === lvlFilter;
              return (
                <Pressable key={lvl} onPress={() => { setLvlFilter(lvl); Haptics.selectionAsync(); }}
                  style={[s.pill, { backgroundColor: active ? '#1A1714' + '18' : C.surface, borderColor: active ? '#1A1714' : C.separator }]}>
                  <Text style={[s.pillText, { color: active ? '#1A1714' : C.secondary, fontWeight: active ? '700' : '500' }]}>{lvl}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        {/* Saved searches */}
        {debQuery === '' && posFilter === 'All' && lvlFilter === 'All' && (
          <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Saved Searches</Text>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {SAVED_SEARCHES.map((ss, idx) => (
                <Pressable key={ss} style={[s.savedRow, idx < SAVED_SEARCHES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => { setQuery(ss); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
                  <IconSymbol name="bookmark.fill" size={13} color={C.secondary} />
                  <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{ss}</Text>
                  <IconSymbol name="chevron.right" size={12} color={C.secondary} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Results */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {results.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 48 }}>
              <IconSymbol name="person.2" size={32} color={C.secondary} />
              <Text style={{ color: C.secondary, fontSize: 14, marginTop: 8 }}>No players found</Text>
            </View>
          ) : (
            results.map((p, idx) => {
              const initials = initialsFrom(p.fullName);
              return (
                <View key={`${p.id}-${idx}`} style={[s.resultCard, { backgroundColor: C.surface }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                    <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: `hsl(${p.id.charCodeAt(0) % 360},50%,42%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ color: '#fff', fontSize: 13, fontWeight: '800' }}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{p.fullName}</Text>
                        <View style={[s.badge, { backgroundColor: '#1A1714' + '18' }]}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#1A1714' }}>{p.position}</Text>
                        </View>
                        <View style={[s.badge, { backgroundColor: C.separator }]}>
                          <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{p.levelDisplay}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{p.school} · {p.classYear} · {p.height}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {[{ label: 'PPG', val: p.ppg }, { label: 'RPG', val: p.rpg }, { label: 'APG', val: p.apg }].map(stat => (
                        <View key={stat.label} style={{ alignItems: 'center', backgroundColor: C.bg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 }}>
                          <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{stat.val != null ? stat.val.toFixed(1) : '-'}</Text>
                          <Text style={{ fontSize: 10, color: C.secondary }}>{stat.label}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      <Pressable onPress={() => { const q = `evaluate ${p.fullName} from ${p.school} (${p.levelDisplay})`; setPendingEvalQuery(q); router.push('/nexus' as any); }}
                        style={[s.actionBtn, { backgroundColor: '#1A1714' + '18', borderColor: '#1A1714' + '40' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1714' }}>Evaluate</Text>
                      </Pressable>
                      <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); showToast(`${p.fullName} added to Board`); }}
                        style={[s.actionBtn, { backgroundColor: C.bg, borderColor: C.separator, flexDirection: 'row', gap: 4 }]}>
                        <IconSymbol name="plus" size={11} color="#1A1714" />
                        <Text style={{ fontSize: 11, fontWeight: '600', color: '#1A1714' }}>Add</Text>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          )}
          {results.length < total && (
            <Pressable onPress={() => { setPage(p => p + 1); Haptics.selectionAsync(); }}
              style={[s.loadMoreBtn, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Load more · {(total - results.length).toLocaleString()} remaining</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>

      {toastMsg && (
        <View style={[s.toast, { backgroundColor: C.label, bottom: insets.bottom + 80 }]}>
          <IconSymbol name="checkmark.circle.fill" size={14} color={GAIN} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg, marginLeft: 6 }}>{toastMsg}</Text>
        </View>
      )}
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

  dipsonCard:  { padding: 14, borderRadius: 14 },
  searchBar:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  pill:        { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  pillText:    { fontSize: 12, fontWeight: '600' },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:        { borderRadius: 14, overflow: 'hidden' },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },
  savedRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  resultCard:  { borderRadius: 12, padding: 14 },
  badge:       { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  actionBtn:   { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  loadMoreBtn: { paddingVertical: 14, alignItems: 'center', borderRadius: 12, borderWidth: 1, marginTop: 4 },
  toast:       { position: 'absolute', left: 20, right: 20, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10, elevation: 8 },
});
