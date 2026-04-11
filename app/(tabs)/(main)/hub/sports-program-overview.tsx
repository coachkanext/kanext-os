/**
 * Sports Program Overview — White & Silver
 * Platinum metallic hero, clean white cards, dark bold type.
 * Apple × premium sports editorial × silver trophy.
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, ScrollView, Alert, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ─── Palette ──────────────────────────────────────────────────────────────────
const BG       = '#EEF0F7';          // cool near-white
const SURFACE  = '#FFFFFF';          // pure white cards
const BORDER   = 'rgba(0,0,0,0.06)';
const DEEP     = '#0A0C14';          // near-black — primary text
const SUB      = '#6B7080';          // medium gray — secondary
const MUTED    = '#A8AABC';          // silver gray — tertiary
const SILVER   = '#9BA5B8';          // steel-silver accent
const CHROME   = '#C8CDD8';          // lighter chrome

// Data colors — deeper variants, crisp on white
const GAIN     = '#1A7A4A';
const HEAT     = '#B83030';
const CAUTION  = '#B07B00';
const ELITE    = '#9A7500';          // dark gold

// Hero metallic gradient — platinum silver
const HERO_GRAD: readonly [string, string, string, string] =
  ['#D6D9E4', '#E4E8F4', '#EEF0F8', '#FAFBFF'];

// Card shadow helper (applied inline)
const CARD_SHADOW = {
  shadowColor: '#0A0C1A',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 14,
  elevation: 3,
};

const TOP_BAR_H = 52;

// ─── KR colors for white bg ───────────────────────────────────────────────────
function krColor(kr: number): string {
  if (kr >= 90) return ELITE;
  if (kr >= 80) return GAIN;
  if (kr >= 70) return DEEP;
  if (kr >= 60) return CAUTION;
  return HEAT;
}
function healthColor(s: 'available' | 'limited' | 'out') {
  return s === 'available' ? GAIN : s === 'limited' ? CAUTION : HEAT;
}
function trendColor(up: boolean | null, invertGood: boolean): string {
  if (up === null) return MUTED;
  return invertGood ? (up ? HEAT : GAIN) : (up ? GAIN : HEAT);
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const TEAM_KR = { overall: 78, offKR: 81, defKR: 74, tempo: 91, sysFit: 94 };

const ROSTER_HEALTH = [
  { initials: 'LK', status: 'available' as const, name: 'Laolu Kalejaiye' },
  { initials: 'BW', status: 'available' as const, name: 'Brandon Williams' },
  { initials: 'CM', status: 'available' as const, name: 'Claude McKesey' },
  { initials: 'NC', status: 'available' as const, name: 'Nathan Chatelain' },
  { initials: 'AH', status: 'available' as const, name: 'Adrian Hernandez' },
  { initials: 'CP', status: 'available' as const, name: 'Chris Plantey' },
  { initials: 'SW', status: 'limited'   as const, name: 'Samuel Wall' },
  { initials: 'PD', status: 'out'       as const, name: 'Paul Diomande' },
];

const RECENT_RESULTS = [
  { opp: 'MPE', score: '78-65', result: 'W' as const, krDelta: '+3' },
  { opp: 'DCU', score: '84-71', result: 'W' as const, krDelta: '+2' },
  { opp: 'STU', score: '91-75', result: 'W' as const, krDelta: '+4' },
  { opp: 'SIM', score: '68-74', result: 'L' as const, krDelta: '-1' },
  { opp: 'LMU', score: '58-82', result: 'L' as const, krDelta: '-3' },
];

const PERF_TRENDS = [
  { label: 'ORTG',    value: '108.4', delta: '+3.2',  up: true  as const, invertGood: false, spark: [102, 104, 105, 106, 107, 108.4] },
  { label: 'DRTG',    value: '98.7',  delta: '-1.4',  up: false as const, invertGood: true,  spark: [103, 102, 101, 100, 99, 98.7]  },
  { label: 'PACE',    value: '91.2',  delta: '—',     up: null,           invertGood: false, spark: [90, 91, 90, 92, 91, 91.2]      },
  { label: '3P%',     value: '38.4%', delta: '+2.1%', up: true  as const, invertGood: false, spark: [34, 35, 36, 37, 37.5, 38.4]   },
  { label: 'TO RATE', value: '12.1',  delta: '-1.8',  up: false as const, invertGood: true,  spark: [15, 14, 13.5, 13, 12.5, 12.1] },
  { label: 'REB MAR', value: '+6.2',  delta: '+1.4',  up: true  as const, invertGood: false, spark: [3, 4, 4.5, 5, 5.8, 6.2]       },
];

const QUICK_ACTIONS = [
  { icon: 'film.fill',                label: 'Film',       route: '/(tabs)/(main)/hub/sports-film-room'      },
  { icon: 'doc.text.magnifyingglass', label: 'Scouting',   route: '/(tabs)/(main)/hub/sports-scouting'       },
  { icon: 'list.clipboard.fill',      label: 'Practice',   route: '/(tabs)/(main)/hub/sports-practice-plans' },
  { icon: 'person.badge.plus',        label: 'Recruiting', route: null                                       },
  { icon: 'gamecontroller.fill',      label: 'Game Day',   route: '/(tabs)/(main)/hub/sports-game-day'       },
];

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: string }) {
  return (
    <View style={s.sectionHeader}>
      <LinearGradient
        colors={[SILVER, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={s.sectionLine}
      />
      <Text style={s.sectionLabel}>{children}</Text>
    </View>
  );
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 18, gap: 2, marginTop: 6 }}>
      {data.map((v, i) => {
        const h = Math.max(2, ((v - min) / range) * 13 + 2);
        const isLast = i === data.length - 1;
        return (
          <View
            key={i}
            style={{
              width: 4,
              height: h,
              borderRadius: 2,
              backgroundColor: isLast ? color : 'rgba(0,0,0,0.10)',
            }}
          />
        );
      })}
    </View>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SportsProgramOverview() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isHeadCoach) {
      router.replace('/(tabs)/(main)/hub/sports-player-dashboard' as any);
    }
  }, [isHeadCoach]));

  const nav = (route: string | null) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (route) router.push(route as any);
    else Alert.alert('Recruiting', 'Opening recruiting board...');
  };

  const overallColor = krColor(TEAM_KR.overall);

  return (
    <View style={s.root}>
      {/* Cool white background */}
      <LinearGradient
        colors={['#EAECf4', '#EEF0F7', '#F2F4FA']}
        style={StyleSheet.absoluteFill}
      />

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View style={[s.topBar, { paddingTop: insets.top }]}>
        <Pressable
          style={s.kBtn}
          hitSlop={8}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
        >
          <KMenuButton />
        </Pressable>
        <View style={s.titlePillWrap}>
          <BlurView intensity={70} tint="light" style={s.titleBlur}>
            <Text style={s.titleText}>Program Overview</Text>
          </BlurView>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 80,
        }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Team KR Hero — Platinum metallic ─────────────────────────── */}
        {/* Chrome border outer ring */}
        <LinearGradient
          colors={[CHROME, 'rgba(200,205,216,0.4)', CHROME]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.heroBorderWrap}
        >
          <LinearGradient
            colors={HERO_GRAD}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.heroGradient}
          >
            {/* Program name + SysFit ring */}
            <View style={s.heroProgramRow}>
              <View>
                <Text style={s.heroProgramName}>LU BASKETBALL</Text>
                <Text style={s.heroProgramSub}>2025–26 · GAAC · 1ST PLACE</Text>
              </View>
              {/* SysFit ring — chrome ring */}
              <LinearGradient
                colors={[CHROME, SILVER, CHROME]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={s.fitRingBorder}
              >
                <View style={s.fitRingInner}>
                  <Text style={[s.fitPct, { color: DEEP }]}>{TEAM_KR.sysFit}%</Text>
                  <Text style={s.fitSub}>SYS FIT</Text>
                </View>
              </LinearGradient>
            </View>

            {/* KR number — massive, bold, dark */}
            <View style={s.krBlock}>
              <Text style={s.krMeta}>TEAM KR</Text>
              <Text
                style={[s.heroKR, {
                  color: overallColor,
                  shadowColor: overallColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.18,
                  shadowRadius: 8,
                }]}
              >
                {TEAM_KR.overall}
              </Text>
              <Text style={s.krOverall}>OVERALL</Text>
            </View>

            {/* Silver separator */}
            <LinearGradient
              colors={['transparent', CHROME, 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={s.heroSep}
            />

            {/* Off / Def / Tempo */}
            <View style={s.heroStats}>
              {(
                [
                  ['OFF KR', TEAM_KR.offKR],
                  ['DEF KR', TEAM_KR.defKR],
                  ['TEMPO',  TEAM_KR.tempo],
                ] as [string, number][]
              ).map(([lbl, val], i) => (
                <React.Fragment key={lbl}>
                  {i > 0 && <View style={s.heroStatDivider} />}
                  <View style={s.heroStatCell}>
                    <Text style={s.heroStatLabel}>{lbl}</Text>
                    <Text style={[s.heroStatVal, { color: krColor(val) }]}>{val}</Text>
                  </View>
                </React.Fragment>
              ))}
            </View>
          </LinearGradient>
        </LinearGradient>

        {/* ── Season Record Strip ──────────────────────────────────────── */}
        <View style={s.recordStrip}>
          <Text style={s.recordWL}>22-6</Text>
          <View style={s.recordDot} />
          <Text style={s.recordConf}>14-2 GAAC</Text>
          <View style={s.recordDot} />
          <Text style={[s.recordPlace, { color: GAIN }]}>1st Place</Text>
          <View style={s.recordDot} />
          <Text style={[s.recordStreak, { color: CAUTION }]}>🔥 W5</Text>
        </View>

        {/* ── Next Game ────────────────────────────────────────────────── */}
        <SectionLabel>NEXT GAME</SectionLabel>
        <Pressable
          style={({ pressed }) => [s.nextGame, CARD_SHADOW, pressed && { opacity: 0.88 }]}
          onPress={() => Alert.alert('Scouting Report', 'Opening opponent analysis...')}
        >
          {/* Silver top accent stripe */}
          <LinearGradient
            colors={[CHROME, 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.nextTopStripe}
          />
          <View style={s.nextContent}>
            <View style={s.nextHeader}>
              <View style={[s.nextBadge, { backgroundColor: DEEP }]}>
                <Text style={s.nextBadgeText}>NEXT GAME</Text>
              </View>
              <Text style={s.nextDate}>Sat Apr 12 · 3:00 PM</Text>
            </View>

            <View style={s.vsRow}>
              <View style={s.vsTeamBlock}>
                <Text style={[s.vsTeam, { color: DEEP }]}>LU</Text>
                <Text style={s.vsTeamSub}>LINCOLN</Text>
              </View>
              <View style={s.vsCenterBlock}>
                <View style={[s.vsChip, { backgroundColor: BG }]}>
                  <Text style={[s.vsLabel, { color: SUB }]}>VS</Text>
                </View>
              </View>
              <View style={[s.vsTeamBlock, { alignItems: 'flex-end' }]}>
                <Text style={[s.vsTeam, { color: SUB }]}>MU</Text>
                <Text style={s.vsTeamSub}>MENLO</Text>
              </View>
            </View>

            {/* KR comparison — silver fill on left, light on right */}
            <View style={s.krBarRow}>
              <Text style={[s.krBarNum, { color: DEEP }]}>78</Text>
              <View style={s.krBarTrack}>
                <LinearGradient
                  colors={[DEEP, '#3A3D52']}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={[s.krBarSeg, { flex: 78 }]}
                />
                <View style={[s.krBarSeg, { flex: 72, backgroundColor: 'rgba(0,0,0,0.08)' }]} />
              </View>
              <Text style={[s.krBarNum, { color: MUTED, textAlign: 'right' }]}>72</Text>
            </View>

            <Text style={s.nextHint}>Tap for Scouting Report →</Text>
          </View>
        </Pressable>

        {/* ── Roster Health ────────────────────────────────────────────── */}
        <SectionLabel>ROSTER HEALTH</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.healthRow}
        >
          {ROSTER_HEALTH.map(p => {
            const hc = healthColor(p.status);
            return (
              <Pressable
                key={p.initials}
                onPress={() => {
                  Haptics.selectionAsync();
                  Alert.alert(p.name, p.status.charAt(0).toUpperCase() + p.status.slice(1));
                }}
              >
                <View style={[s.healthAvatar, { borderColor: hc }]}>
                  <Text style={[s.healthText, { color: DEEP }]}>{p.initials}</Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <View style={s.healthLegend}>
          {([
            ['available', GAIN, 6],
            ['limited',   CAUTION, 1],
            ['out',       HEAT, 1],
          ] as [string, string, number][]).map(([lbl, col, cnt]) => (
            <View key={lbl} style={s.legendItem}>
              <View style={[s.legendDot, { backgroundColor: col }]} />
              <Text style={s.legendText}>{cnt} {lbl}</Text>
            </View>
          ))}
        </View>

        {/* ── Recent Results ───────────────────────────────────────────── */}
        <SectionLabel>RECENT RESULTS</SectionLabel>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.resultsRow}
        >
          {RECENT_RESULTS.map((g, i) => {
            const rc = g.result === 'W' ? GAIN : HEAT;
            return (
              <View
                key={i}
                style={[s.resultCard, CARD_SHADOW, { borderTopColor: rc }]}
              >
                <Text style={[s.resultWL, { color: rc }]}>{g.result}</Text>
                <Text style={s.resultOpp}>vs {g.opp}</Text>
                <Text style={s.resultScore}>{g.score}</Text>
                <Text style={[s.resultKR, { color: rc }]}>{g.krDelta} KR</Text>
              </View>
            );
          })}
        </ScrollView>

        {/* ── Performance Trends ──────────────────────────────────────── */}
        <SectionLabel>PERFORMANCE TRENDS</SectionLabel>
        <View style={s.trendsOuter}>
          {([[0, 1], [2, 3], [4, 5]] as [number, number][]).map((pair, ri) => (
            <View key={ri} style={s.trendsRow}>
              {pair.map(ti => {
                const t = PERF_TRENDS[ti];
                const dc = trendColor(t.up, t.invertGood);
                return (
                  <View key={t.label} style={[s.trendCell, CARD_SHADOW]}>
                    <Text style={s.trendLabel}>{t.label}</Text>
                    <Text style={[s.trendValue, { color: dc === MUTED ? DEEP : dc }]}>
                      {t.value}
                    </Text>
                    <MiniSparkline data={t.spark} color={dc} />
                    <Text style={[s.trendDelta, { color: dc }]}>
                      {t.up === null ? '→' : t.up ? '↑' : '↓'} {t.delta}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* ── Today's Practice ─────────────────────────────────────────── */}
        <SectionLabel>TODAY'S PRACTICE</SectionLabel>
        <Pressable
          style={({ pressed }) => [s.practiceCard, CARD_SHADOW, pressed && { opacity: 0.8 }]}
          onPress={() => Alert.alert('Practice Plan', 'Opening full practice plan...')}
        >
          {/* Silver left stripe */}
          <LinearGradient
            colors={[DEEP, SILVER]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={s.practiceStripe}
          />
          <View style={s.practiceBody}>
            <Text style={s.practiceFocus}>Transition Defense + Half-Court Sets</Text>
            <Text style={s.practiceTime}>2:30 PM — 4:30 PM · 2 hours</Text>
            <Text style={s.practiceDrills}>Shell Drill · Scramble D · Iowa Drill · 5-on-5</Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={MUTED} />
        </Pressable>

        {/* ── Quick Actions ─────────────────────────────────────────────── */}
        <SectionLabel>QUICK ACTIONS</SectionLabel>
        <View style={s.quickRow}>
          {QUICK_ACTIONS.map(a => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [s.quickItem, pressed && { opacity: 0.5 }]}
              onPress={() => nav(a.route)}
            >
              <LinearGradient
                colors={[SURFACE, BG]}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={[s.quickCircle, CARD_SHADOW]}
              >
                <IconSymbol name={a.icon as any} size={20} color={DEEP} />
              </LinearGradient>
              <Text style={s.quickLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Dipson Banner ────────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [s.dipsonCard, CARD_SHADOW, pressed && { opacity: 0.8 }]}
          onPress={() => Alert.alert('Dipson', 'Opening Nexus Basketball Intelligence...')}
        >
          <LinearGradient
            colors={[CHROME, 'rgba(200,205,216,0.2)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={s.dipsonStripe}
          />
          <View style={s.dipsonBody}>
            <View style={s.dipsonLeft}>
              <IconSymbol name="sparkles" size={18} color={SILVER} />
              <View>
                <Text style={s.dipsonTitle}>Ask Dipson</Text>
                <Text style={s.dipsonSub}>AI-powered team intelligence</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={14} color={MUTED} />
          </View>
        </Pressable>

      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },

  // Top Bar
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingBottom: 10, paddingHorizontal: 16,
  },
  kBtn:          { width: 44, height: 36, justifyContent: 'center' },
  titlePillWrap: { flex: 1, height: 30, marginHorizontal: 8, borderRadius: 15, overflow: 'hidden' },
  titleBlur:     { flex: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 15, borderWidth: 1, borderColor: BORDER },
  titleText:     { fontSize: 13, fontWeight: '700', color: DEEP, letterSpacing: 0.1 },
  rolePillWrap:  { width: 80, alignItems: 'flex-end', justifyContent: 'center', height: 36 },

  // Section label
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 20, marginTop: 28, marginBottom: 12,
  },
  sectionLine:  { width: 18, height: 1.5, borderRadius: 1 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.4, textTransform: 'uppercase', color: SUB },

  // ── Hero — platinum silver
  heroBorderWrap: {
    marginHorizontal: 16, borderRadius: 18, padding: 1.5,
    shadowColor: '#C0C4D0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  heroGradient: { borderRadius: 17, padding: 22 },

  heroProgramRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 14,
  },
  heroProgramName: { fontSize: 11, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', color: SUB },
  heroProgramSub:  { fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: MUTED, marginTop: 2 },

  fitRingBorder: { width: 72, height: 72, borderRadius: 36, padding: 2.5 },
  fitRingInner:  {
    flex: 1, borderRadius: 34, backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  fitPct:  { fontSize: 19, fontWeight: '800' },
  fitSub:  { fontSize: 7, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: MUTED, marginTop: 1 },

  krBlock:   { alignItems: 'center', marginBottom: 18 },
  krMeta:    { fontSize: 9, fontWeight: '700', letterSpacing: 1.6, textTransform: 'uppercase', color: MUTED, marginBottom: 2 },
  heroKR:    { fontSize: 100, fontWeight: '900', lineHeight: 104, letterSpacing: -4 },
  krOverall: { fontSize: 9, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', color: MUTED, marginTop: 2 },

  heroSep:         { height: 1, marginBottom: 14 },
  heroStats:       { flexDirection: 'row' },
  heroStatCell:    { flex: 1, alignItems: 'center' },
  heroStatLabel:   { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: MUTED, marginBottom: 4 },
  heroStatVal:     { fontSize: 26, fontWeight: '800' },
  heroStatDivider: { width: 1, backgroundColor: CHROME, marginVertical: 4 },

  // ── Season Record
  recordStrip: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 18,
    gap: 10, flexWrap: 'wrap',
  },
  recordWL:     { fontSize: 38, fontWeight: '900', color: DEEP, letterSpacing: -1.5 },
  recordDot:    { width: 4, height: 4, borderRadius: 2, backgroundColor: MUTED },
  recordConf:   { fontSize: 15, color: SUB },
  recordPlace:  { fontSize: 15, fontWeight: '700' },
  recordStreak: { fontSize: 15, fontWeight: '700' },

  // ── Next Game
  nextGame:      { marginHorizontal: 16, borderRadius: 14, backgroundColor: SURFACE, overflow: 'hidden' },
  nextTopStripe: { height: 2 },
  nextContent:   { padding: 16 },
  nextHeader:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  nextBadge:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  nextBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.8 },
  nextDate:      { fontSize: 12, color: MUTED },
  vsRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  vsTeamBlock:   { flex: 1 },
  vsTeam:        { fontSize: 42, fontWeight: '900', letterSpacing: -2 },
  vsTeamSub:     { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: MUTED },
  vsCenterBlock: { flex: 0, paddingHorizontal: 10 },
  vsChip:        { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  vsLabel:       { fontSize: 12, fontWeight: '600' },
  krBarRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  krBarNum:      { fontSize: 13, fontWeight: '700', width: 28 },
  krBarTrack:    { flex: 1, height: 6, borderRadius: 3, flexDirection: 'row', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.06)' },
  krBarSeg:      { height: 6 },
  nextHint:      { fontSize: 11, color: MUTED, textAlign: 'center' },

  // ── Roster Health
  healthRow:    { paddingHorizontal: 20, gap: 12, paddingVertical: 4 },
  healthAvatar: {
    width: 52, height: 52, borderRadius: 26, borderWidth: 2.5,
    backgroundColor: SURFACE, alignItems: 'center', justifyContent: 'center',
    ...CARD_SHADOW,
  },
  healthText:   { fontSize: 13, fontWeight: '700' },
  healthLegend: { flexDirection: 'row', gap: 18, paddingHorizontal: 20, marginTop: 12 },
  legendItem:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot:    { width: 7, height: 7, borderRadius: 4 },
  legendText:   { fontSize: 11, color: SUB },

  // ── Recent Results
  resultsRow: { paddingHorizontal: 20, gap: 8 },
  resultCard: {
    width: 82, borderRadius: 12, padding: 10,
    alignItems: 'center', gap: 3,
    backgroundColor: SURFACE,
    borderTopWidth: 3,
  },
  resultWL:    { fontSize: 22, fontWeight: '900' },
  resultOpp:   { fontSize: 11, color: MUTED },
  resultScore: { fontSize: 11, fontWeight: '600', color: DEEP },
  resultKR:    { fontSize: 10, fontWeight: '700' },

  // ── Performance Trends
  trendsOuter: { paddingHorizontal: 16 },
  trendsRow:   { flexDirection: 'row', gap: 8, marginBottom: 8 },
  trendCell:   {
    flex: 1, borderRadius: 12, padding: 14,
    backgroundColor: SURFACE,
  },
  trendLabel:  { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', color: MUTED },
  trendValue:  { fontSize: 26, fontWeight: '800', letterSpacing: -0.5, marginTop: 4 },
  trendDelta:  { fontSize: 11, fontWeight: '600', marginTop: 4 },

  // ── Practice
  practiceCard: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, borderRadius: 12,
    backgroundColor: SURFACE, overflow: 'hidden', paddingRight: 14,
  },
  practiceStripe: { width: 4, alignSelf: 'stretch' },
  practiceBody:   { flex: 1, paddingVertical: 14, paddingLeft: 14, paddingRight: 8, gap: 4 },
  practiceFocus:  { fontSize: 14, fontWeight: '700', color: DEEP },
  practiceTime:   { fontSize: 12, color: SUB },
  practiceDrills: { fontSize: 11, color: MUTED, lineHeight: 16 },

  // ── Quick Actions
  quickRow:    { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16 },
  quickItem:   { alignItems: 'center', gap: 7 },
  quickCircle: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: BORDER,
  },
  quickLabel:  { fontSize: 10, color: SUB, textAlign: 'center' },

  // ── Dipson
  dipsonCard:   {
    marginHorizontal: 16, marginTop: 12,
    borderRadius: 12, backgroundColor: SURFACE,
    overflow: 'hidden',
  },
  dipsonStripe: { height: 2 },
  dipsonBody:   {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  dipsonLeft:   { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dipsonTitle:  { fontSize: 15, fontWeight: '700', color: DEEP },
  dipsonSub:    { fontSize: 12, color: SUB, marginTop: 2 },
});
