/**
 * Sports Hub — Recruiting. Head Coach only.
 * Pipeline stages, prospect cards, portal alerts, gap analysis.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';

type Stage = 'Watch List' | 'Evaluating' | 'In Contact' | 'Offered';

interface Prospect {
  name: string;
  pos: string;
  year: string;
  school: string;
  height: string;
  kr: number;
  stage: Stage;
  stars: number;
  note: string;
}

const PROSPECTS: Prospect[] = [
  { name: 'Jaylen Brooks',   pos: 'SG', year: "Fr",   school: 'Roosevelt HS',    height: "6'4\"",  kr: 74, stage: 'Watch List',  stars: 3, note: 'Strong finisher. Film eval requested.'    },
  { name: 'Marcus Webb',     pos: 'PF', year: "Jr",   school: 'Georgia Perimeter',height: "6'7\"",  kr: 81, stage: 'Watch List',  stars: 4, note: 'Transferred from Div I. Academic review.' },
  { name: 'Devon Price',     pos: 'PG', year: "So",   school: 'JUCO - Coastal',   height: "6'1\"",  kr: 78, stage: 'Evaluating',  stars: 3, note: 'High IQ. Need to see full season film.'   },
  { name: 'Tre Williams',    pos: 'SF', year: "Fr",   school: 'Lincoln Prep',     height: "6'6\"",  kr: 72, stage: 'Evaluating',  stars: 3, note: 'Local recruit. Scholarship conversation.'  },
  { name: 'Chris Okafor',    pos: 'C',  year: "Jr",   school: 'Norfolk Transfer', height: "6'10\"", kr: 83, stage: 'In Contact',  stars: 4, note: 'Called coach Tue. Visit TBD.'             },
  { name: 'Isaiah Jackson',  pos: 'PG', year: "So",   school: 'Atlanta North',    height: "6'0\"",  kr: 76, stage: 'In Contact',  stars: 3, note: 'Consistent contact. OV scheduled Apr 22.' },
  { name: 'Aaron Kelley',    pos: 'SG', year: "Fr",   school: 'Memphis Central',  height: "6'3\"",  kr: 80, stage: 'Offered',     stars: 4, note: 'Offer extended Apr 10. Decision by May 1.'},
  { name: 'Dominic Reeves',  pos: 'PF', year: "Jr",   school: 'JUCO - Talladega', height: "6'8\"",  kr: 85, stage: 'Offered',     stars: 4, note: 'Verbal commitment expected. Top choice.'  },
];

const STAGES: Stage[] = ['Watch List', 'Evaluating', 'In Contact', 'Offered'];
const STAGE_COLORS: Record<Stage, string> = {
  'Watch List':  '#9C9790',
  'Evaluating':  '#B8943E',
  'In Contact':  '#5A8A6E',
  'Offered':     '#1A1714',
};

interface PortalAlert { name: string; pos: string; from: string; kr: number; note: string }
const PORTAL_ALERTS: PortalAlert[] = [
  { name: 'Terrance Moore', pos: 'C',  from: 'Tennessee State',   kr: 82, note: 'Grad transfer. Eligible immediately.' },
  { name: 'Malik Foster',   pos: 'SG', from: 'Savannah State',    kr: 77, note: 'Mid-major guard. PrestoSports film available.' },
  { name: 'Caleb Newton',   pos: 'PG', from: 'Kentucky Christian', kr: 79, note: 'NAIA standout. 28 PPG last season.' },
];

interface GapItem { pos: string; need: string; note: string }
const GAP_ANALYSIS: GapItem[] = [
  { pos: 'C',  need: 'Critical', note: '2 seniors graduating. Need a true rim protector.' },
  { pos: 'PG', need: 'Moderate', note: 'Depth — backup averaged 4 MPG this season.' },
  { pos: 'SF', need: 'Low',      note: 'Returning starter + strong development prospect.' },
];

const NEED_COLORS: Record<string, string> = {
  Critical: '#B85C5C',
  Moderate: '#B8943E',
  Low: '#5A8A6E',
};

export default function SportsRecruiting() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isCoach = role === roleCycles[0];
  const [activeStage, setActiveStage] = useState<Stage | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCoach) router.replace('/(tabs)/(main)/hub/sports-program-overview' as any);
  }, [isCoach]);

  const filtered = useMemo(() => {
    let list = activeStage === 'All' ? PROSPECTS : PROSPECTS.filter(p => p.stage === activeStage);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.pos.toLowerCase().includes(q) || p.school.toLowerCase().includes(q));
    }
    return list;
  }, [activeStage, searchQuery]);

  const stageCounts = useMemo(() => {
    const counts: Record<Stage, number> = { 'Watch List': 0, 'Evaluating': 0, 'In Contact': 0, 'Offered': 0 };
    PROSPECTS.forEach(p => { counts[p.stage]++; });
    return counts;
  }, []);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Recruiting</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCoach} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        keyboardShouldPersistTaps="handled"
      >
        {/* PIPELINE SUMMARY */}
        <View style={[s.pipelineCard, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          {STAGES.map((stage, i) => (
            <Pressable
              key={stage}
              style={[
                s.stageCell,
                i < STAGES.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveStage(stage); setSearchQuery(''); }}
            >
              <Text style={[s.stageCount, { color: C.label }]}>{stageCounts[stage]}</Text>
              <Text style={[s.stageLabel, { color: activeStage === stage ? STAGE_COLORS[stage] : C.secondary }]} numberOfLines={1}>{stage}</Text>
            </Pressable>
          ))}
        </View>

        {/* SEARCH + FILTER */}
        <View style={s.searchRow}>
          <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
            <TextInput
              style={[s.searchInput, { color: C.label }]}
              placeholder="Search prospects..."
              placeholderTextColor={C.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
              </Pressable>
            )}
          </View>
          <Pressable
            style={[s.dipsonBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); openDipsonSheet('Athletics'); }}
          >
            <IconSymbol name="sparkles" size={16} color={C.label} />
          </Pressable>
        </View>

        {/* STAGE FILTER PILLS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {(['All', ...STAGES] as const).map(stage => (
            <Pressable
              key={stage}
              style={[s.filterPill, { backgroundColor: activeStage === stage ? C.label : C.surface, borderColor: C.separator }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveStage(stage); }}
            >
              <Text style={[s.filterPillText, { color: activeStage === stage ? C.bg : C.label }]}>{stage}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* PROSPECTS */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginHorizontal: 16 }]}>
          {activeStage === 'All' ? 'ALL PROSPECTS' : activeStage.toUpperCase()} ({filtered.length})
        </Text>
        {filtered.map((p, i) => (
          <Pressable
            key={i}
            style={[s.prospectCard, { backgroundColor: C.surface, marginHorizontal: 16 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.prospectTopRow}>
              <View style={[s.initialsCircle, { backgroundColor: C.separator }]}>
                <Text style={[s.initials, { color: C.label }]}>{p.name.split(' ').map(n => n[0]).join('')}</Text>
              </View>
              <View style={s.prospectInfo}>
                <View style={s.prospectNameRow}>
                  <Text style={[s.prospectName, { color: C.label }]}>{p.name}</Text>
                  <View style={[s.stageBadge, { backgroundColor: STAGE_COLORS[p.stage] + (p.stage === 'Offered' ? '' : '22') }]}>
                    <Text style={[s.stageBadgeText, { color: p.stage === 'Offered' ? C.bg : STAGE_COLORS[p.stage] }]}>{p.stage}</Text>
                  </View>
                </View>
                <Text style={[s.prospectMeta, { color: C.secondary }]}>{p.pos} · {p.year} · {p.school} · {p.height}</Text>
                <View style={s.prospectKrRow}>
                  <Text style={[s.prospectKr, { color: C.label }]}>KR Est. {p.kr}</Text>
                  <View style={s.stars}>
                    {Array.from({ length: p.stars }).map((_, si) => (
                      <Text key={si} style={[s.star, { color: CAUTION }]}>★</Text>
                    ))}
                  </View>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </View>
            <View style={[s.prospectDivider, { backgroundColor: C.separator }]} />
            <Text style={[s.prospectNote, { color: C.secondary }]}>{p.note}</Text>
          </Pressable>
        ))}

        {/* PORTAL ALERTS */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginHorizontal: 16, marginTop: 28 }]}>PORTAL ALERTS</Text>
        <View style={[s.portalCard, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          {PORTAL_ALERTS.map((alert, i) => (
            <View key={i}>
              {i > 0 && <View style={[s.hairline, { backgroundColor: C.separator }]} />}
              <Pressable
                style={s.portalRow}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={s.portalLeft}>
                  <Text style={[s.portalName, { color: C.label }]}>{alert.name}</Text>
                  <Text style={[s.portalMeta, { color: C.secondary }]}>{alert.pos} · {alert.from} · KR Est. {alert.kr}</Text>
                  <Text style={[s.portalNote, { color: C.secondary }]}>{alert.note}</Text>
                </View>
                <Pressable
                  style={[s.evaluateBtn, { borderColor: C.separator }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <Text style={[s.evaluateBtnText, { color: C.label }]}>Evaluate</Text>
                </Pressable>
              </Pressable>
            </View>
          ))}
        </View>

        {/* GAP ANALYSIS */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginHorizontal: 16, marginTop: 28 }]}>GAP ANALYSIS</Text>
        <View style={[s.gapCard, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          {GAP_ANALYSIS.map((gap, i) => (
            <View key={i}>
              {i > 0 && <View style={[s.hairline, { backgroundColor: C.separator }]} />}
              <View style={s.gapRow}>
                <View style={[s.posBadge, { backgroundColor: C.bg }]}>
                  <Text style={[s.posBadgeText, { color: C.label }]}>{gap.pos}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={s.gapNeedRow}>
                    <View style={[s.needBadge, { backgroundColor: NEED_COLORS[gap.need] + '22' }]}>
                      <Text style={[s.needBadgeText, { color: NEED_COLORS[gap.need] }]}>{gap.need}</Text>
                    </View>
                  </View>
                  <Text style={[s.gapNote, { color: C.secondary }]}>{gap.note}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:          { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { alignItems: 'flex-end' },
  sectionHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  hairline:      { height: StyleSheet.hairlineWidth },

  pipelineCard:  { borderRadius: 14, flexDirection: 'row', overflow: 'hidden', marginBottom: 16 },
  stageCell:     { flex: 1, alignItems: 'center', paddingVertical: 14 },
  stageCount:    { fontSize: 22, fontWeight: '800' },
  stageLabel:    { fontSize: 10, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 },

  searchRow:     { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 10 },
  searchBar:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput:   { flex: 1, fontSize: 14, padding: 0 },
  dipsonBtn:     { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  filterRow:     { paddingHorizontal: 16, gap: 8, marginBottom: 16 },
  filterPill:    { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1 },
  filterPillText:{ fontSize: 13, fontWeight: '600' },

  prospectCard:     { borderRadius: 14, padding: 14, marginBottom: 10 },
  prospectTopRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  initialsCircle:   { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  initials:         { fontSize: 14, fontWeight: '800' },
  prospectInfo:     { flex: 1, gap: 3 },
  prospectNameRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prospectName:     { fontSize: 15, fontWeight: '700' },
  stageBadge:       { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  stageBadgeText:   { fontSize: 11, fontWeight: '700' },
  prospectMeta:     { fontSize: 12 },
  prospectKrRow:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  prospectKr:       { fontSize: 12, fontWeight: '600' },
  stars:            { flexDirection: 'row' },
  star:             { fontSize: 11 },
  prospectDivider:  { height: StyleSheet.hairlineWidth, marginVertical: 10 },
  prospectNote:     { fontSize: 13 },

  portalCard:   { borderRadius: 14, paddingHorizontal: 14 },
  portalRow:    { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  portalLeft:   { flex: 1, gap: 2 },
  portalName:   { fontSize: 15, fontWeight: '700' },
  portalMeta:   { fontSize: 12 },
  portalNote:   { fontSize: 12 },
  evaluateBtn:  { borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  evaluateBtnText: { fontSize: 13, fontWeight: '600' },

  gapCard:     { borderRadius: 14, paddingHorizontal: 14 },
  gapRow:      { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 12 },
  posBadge:    { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, minWidth: 44, alignItems: 'center' },
  posBadgeText:{ fontSize: 14, fontWeight: '800' },
  gapNeedRow:  { flexDirection: 'row', marginBottom: 4 },
  needBadge:   { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  needBadgeText: { fontSize: 11, fontWeight: '700' },
  gapNote:     { fontSize: 13 },
});
