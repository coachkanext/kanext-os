/**
 * Gap Analysis Screen — Sports Mode · Roster Tile
 * Head Coach view only — NBA 2K-style Roster Needs Assessment
 */

import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

type DemandLevel = 'High' | 'Med' | 'Low';
type GapSeverity = 'Critical' | 'Moderate' | 'Minor';

interface GapInfo {
  severity: GapSeverity;
  desc: string;
  currentKR: number;
  neededKR: number;
}

interface PositionGap {
  position: string;
  demand: DemandLevel;
  coverage: number;
  gap: GapInfo | null;
}

interface Archetype {
  name: string;
  count: number;
}

const POSITION_GAPS: PositionGap[] = [
  { position: 'PG', demand: 'High', coverage: 88, gap: null },
  { position: 'SG', demand: 'Med',  coverage: 72, gap: { severity: 'Moderate', desc: 'Need a catch-and-shoot specialist', currentKR: 73, neededKR: 80 } },
  { position: 'SF', demand: 'High', coverage: 76, gap: { severity: 'Moderate', desc: 'Backup wing with length + athleticism', currentKR: 69, neededKR: 78 } },
  { position: 'PF', demand: 'Low',  coverage: 64, gap: { severity: 'Critical', desc: 'No true stretch 4; offensive system requires floor spacing', currentKR: 61, neededKR: 82 } },
  { position: 'C',  demand: 'Med',  coverage: 94, gap: null },
];

const ARCHETYPES: Archetype[] = [
  { name: 'Playmaker',   count: 3 },
  { name: 'Scorer',      count: 4 },
  { name: 'Defender',    count: 2 },
  { name: 'Facilitator', count: 1 },
  { name: 'Two-Way',     count: 2 },
];

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function demandColor(level: DemandLevel): string {
  if (level === 'High') return HEAT;
  if (level === 'Med')  return CAUTION;
  return GAIN;
}

function severityColor(severity: GapSeverity): string {
  if (severity === 'Critical') return HEAT;
  if (severity === 'Moderate') return CAUTION;
  return GAIN;
}

function krDotColor(kr: number): string {
  if (kr >= 80) return CAUTION;
  if (kr >= 75) return GAIN;
  if (kr >= 65) return '#9C9790';
  return HEAT;
}

function coverageBarColor(coverage: number): string {
  if (coverage >= 85) return GAIN;
  if (coverage >= 70) return CAUTION;
  return HEAT;
}

// ---------------------------------------------------------------------------
// DemandChip
// ---------------------------------------------------------------------------

function DemandChip({ level }: { level: DemandLevel }) {
  const color = demandColor(level);
  return (
    <View style={[dc.wrap, { backgroundColor: color + '1A', borderColor: color + '40' }]}>
      <Text style={[dc.txt, { color }]}>{level}</Text>
    </View>
  );
}

const dc = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  txt:  { fontSize: 11, fontWeight: '700' },
});

// ---------------------------------------------------------------------------
// SeverityChip
// ---------------------------------------------------------------------------

function SeverityChip({ severity }: { severity: GapSeverity }) {
  const color = severityColor(severity);
  return (
    <View style={[sc.wrap, { backgroundColor: color + '1A', borderColor: color + '40' }]}>
      <Text style={[sc.txt, { color }]}>{severity}</Text>
    </View>
  );
}

const sc = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  txt:  { fontSize: 11, fontWeight: '700' },
});

// ---------------------------------------------------------------------------
// PositionCoverageRow
// ---------------------------------------------------------------------------

function PositionCoverageRow({ item, C }: { item: PositionGap; C: ComponentColors }) {
  const barColor = coverageBarColor(item.coverage);
  return (
    <View style={[pcr.wrap, { backgroundColor: C.surface }]}>
      <View style={pcr.posWrap}>
        <Text style={[pcr.posText, { color: C.label }]}>{item.position}</Text>
      </View>
      <View style={pcr.demandWrap}>
        <DemandChip level={item.demand} />
      </View>
      <View style={pcr.barSection}>
        <View style={[pcr.barTrack, { backgroundColor: C.separator }]}>
          <View style={[pcr.barFill, { width: item.coverage + '%' as any, backgroundColor: barColor }]} />
        </View>
        <Text style={[pcr.coveragePct, { color: barColor }]}>{item.coverage}%</Text>
      </View>
    </View>
  );
}

const pcr = StyleSheet.create({
  wrap:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8 },
  posWrap:     { width: 32 },
  posText:     { fontSize: 14, fontWeight: '800' },
  demandWrap:  { width: 68 },
  barSection:  { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  barTrack:    { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill:     { height: 8, borderRadius: 4 },
  coveragePct: { fontSize: 12, fontWeight: '700', width: 36, textAlign: 'right' },
});

// ---------------------------------------------------------------------------
// KRComparisonBar
// ---------------------------------------------------------------------------

function KRComparisonBar({ currentKR, neededKR, C }: { currentKR: number; neededKR: number; C: ComponentColors }) {
  const currentColor = krDotColor(currentKR);
  const neededColor  = krDotColor(neededKR);
  const MIN = 55, MAX = 95;
  const currentPct = ((currentKR - MIN) / (MAX - MIN)) * 100;
  const neededPct  = ((neededKR  - MIN) / (MAX - MIN)) * 100;
  const gapLeft    = Math.min(currentPct, neededPct);
  const gapWidth   = Math.abs(neededPct - currentPct);

  return (
    <View style={krb.wrap}>
      <View style={[krb.track, { backgroundColor: C.separator }]}>
        <View style={[krb.gapFill, { left: gapLeft + '%' as any, width: gapWidth + '%' as any, backgroundColor: HEAT + '28' }]} />
        <View style={[krb.dotWrap, { left: currentPct + '%' as any }]}>
          <View style={[krb.dot, { backgroundColor: currentColor, borderColor: C.bg }]} />
        </View>
        <View style={[krb.dotWrap, { left: neededPct + '%' as any }]}>
          <View style={[krb.dot, { backgroundColor: neededColor, borderColor: C.bg }]} />
        </View>
      </View>
      <View style={krb.labelRow}>
        <Text style={[krb.label, { color: C.secondary }]}>
          <Text style={{ color: currentColor }}>{'\u25CF'}</Text>
          {'  '}Current: <Text style={[krb.bold, { color: currentColor }]}>{currentKR}</Text>
        </Text>
        <Text style={[krb.label, { color: C.secondary }]}>
          Needed: <Text style={[krb.bold, { color: neededColor }]}>{neededKR}+</Text>
          {'  '}<Text style={{ color: neededColor }}>{'\u25CF'}</Text>
        </Text>
      </View>
    </View>
  );
}

const krb = StyleSheet.create({
  wrap:     { marginTop: 10 },
  track:    { height: 6, borderRadius: 3, marginBottom: 10, position: 'relative', overflow: 'visible' },
  gapFill:  { position: 'absolute', height: 6, borderRadius: 3, top: 0 },
  dotWrap:  { position: 'absolute', top: -5, marginLeft: -8 },
  dot:      { width: 16, height: 16, borderRadius: 8, borderWidth: 2.5 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label:    { fontSize: 12 },
  bold:     { fontWeight: '700' },
});

// ---------------------------------------------------------------------------
// GapCard
// ---------------------------------------------------------------------------

function GapCard({ item, C, onFindPlayers }: { item: PositionGap & { gap: GapInfo }; C: ComponentColors; onFindPlayers: () => void }) {
  const sColor = severityColor(item.gap.severity);
  return (
    <View style={[gc.card, { backgroundColor: C.surface, borderLeftColor: sColor }]}>
      <View style={gc.headerRow}>
        <View style={[gc.posBadge, { backgroundColor: C.label }]}>
          <Text style={[gc.posText, { color: C.bg }]}>{item.position}</Text>
        </View>
        <SeverityChip severity={item.gap.severity} />
      </View>
      <Text style={[gc.desc, { color: C.label }]}>{item.gap.desc}</Text>
      <KRComparisonBar currentKR={item.gap.currentKR} neededKR={item.gap.neededKR} C={C} />
      <Pressable onPress={onFindPlayers} style={[gc.findBtn, { backgroundColor: C.activePill }]}>
        <Text style={[gc.findBtnText, { color: C.activePillText }]}>Find Players</Text>
      </Pressable>
    </View>
  );
}

const gc = StyleSheet.create({
  card:        { borderRadius: 16, marginBottom: 12, padding: 16, borderLeftWidth: 4, gap: 10 },
  headerRow:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  posBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  posText:     { fontSize: 13, fontWeight: '800' },
  desc:        { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  findBtn:     { alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 9, borderRadius: 20, marginTop: 4 },
  findBtnText: { fontSize: 13, fontWeight: '700' },
});

// ---------------------------------------------------------------------------
// ArchetypeRow
// ---------------------------------------------------------------------------

function ArchetypeRow({ item, maxCount, C }: { item: Archetype; maxCount: number; C: ComponentColors }) {
  const fillPct = (item.count / maxCount) * 100;
  return (
    <View style={ar.wrap}>
      <Text style={[ar.name, { color: C.label }]}>{item.name}</Text>
      <View style={ar.barSection}>
        <View style={[ar.track, { backgroundColor: C.separator }]}>
          <View style={[ar.fill, { width: fillPct + '%' as any, backgroundColor: C.label }]} />
        </View>
        <Text style={[ar.count, { color: C.secondary }]}>{item.count}</Text>
      </View>
    </View>
  );
}

const ar = StyleSheet.create({
  wrap:      { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
  name:      { width: 100, fontSize: 13, fontWeight: '600' },
  barSection:{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  track:     { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill:      { height: 8, borderRadius: 4 },
  count:     { fontSize: 13, fontWeight: '700', width: 20, textAlign: 'right' },
});

// ---------------------------------------------------------------------------
// SectionHeader
// ---------------------------------------------------------------------------

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return <Text style={[sh.title, { color: C.secondary }]}>{title}</Text>;
}

const sh = StyleSheet.create({
  title: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 12 },
});

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function GapAnalysisScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scrollFooter = useScrollFooter();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const s = useMemo(() => makeStyles(C), [C]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const gapPositions = useMemo(
    () => POSITION_GAPS.filter((p): p is PositionGap & { gap: GapInfo } => p.gap !== null),
    [],
  );

  const maxArchetypeCount = useMemo(() => Math.max(...ARCHETYPES.map(a => a.count)), []);

  const handleFindPlayers = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/(main)/recruits' as any);
  }, [router]);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {/* Fixed top bar */}
      <Animated.View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8} style={s.topBarSide}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Gap Analysis</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </Animated.View>

      <ScrollView
        {...scrollFooter}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={[s.scrollContent, { paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 24 }]}
      >
        {/* Position Coverage */}
        <SectionHeader title="POSITION COVERAGE" C={C} />
        {POSITION_GAPS.map(item => (
          <PositionCoverageRow key={item.position} item={item} C={C} />
        ))}

        {/* Roster Gaps */}
        <View style={s.sectionSpacing} />
        <SectionHeader title="ROSTER GAPS" C={C} />
        {gapPositions.length === 0 ? (
          <View style={[s.emptyState, { backgroundColor: C.surface }]}>
            <Text style={[s.emptyText, { color: C.secondary }]}>No critical gaps — roster is well-covered.</Text>
          </View>
        ) : (
          gapPositions.map(item => (
            <GapCard key={item.position} item={item} C={C} onFindPlayers={handleFindPlayers} />
          ))
        )}

        {/* Archetype Distribution */}
        <View style={s.sectionSpacing} />
        <SectionHeader title="ARCHETYPE DISTRIBUTION" C={C} />
        <View style={[s.archetypeCard, { backgroundColor: C.surface }]}>
          {ARCHETYPES.map(item => (
            <ArchetypeRow key={item.name} item={item} maxCount={maxArchetypeCount} C={C} />
          ))}
          <View style={[s.archetypeFooter, { borderTopColor: C.separator }]}>
            <Text style={[s.archetypeTotalLabel, { color: C.secondary }]}>Total Players</Text>
            <Text style={[s.archetypeTotalCount, { color: C.label }]}>
              {ARCHETYPES.reduce((sum, a) => sum + a.count, 0)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen:               { flex: 1 },
    topBarWrap:           { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    topBar:               { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
    topBarSide:           { width: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:            { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText:        { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    scrollContent:        { paddingHorizontal: 14 },
    sectionSpacing:       { height: 24 },
    emptyState:           { borderRadius: 12, padding: 16, alignItems: 'center' },
    emptyText:            { fontSize: 14, fontWeight: '500' },
    archetypeCard:        { borderRadius: 16, padding: 16 },
    archetypeFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth },
    archetypeTotalLabel:  { fontSize: 12, fontWeight: '600' },
    archetypeTotalCount:  { fontSize: 16, fontWeight: '800' },
  });
}
