/**
 * Sports Program Overview — LU Men's Basketball.
 * Head Coach command center per spec §18.1.
 * Head Coach only (player role redirects to player dashboard).
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet, Animated,
} from 'react-native';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { BottomSheet } from '@/components/ui/bottom-sheet';


// ─── Data ─────────────────────────────────────────────────────────────────────

const TEAM = {
  name:      "LU Men's Basketball",
  conf:      'SWS (GAAC) · Laney College, Oakland',
  staff:     'HC: Middlebrooks · AC: Kalejaiye',
  kr:        72,
  offKR:     74.2,
  defKR:     70.8,
  pace:      98,
  paceLabel: '98+',
  sysFit:    53.3,
  record:    '15-8',
  d1Record:  '0-6',
  tier:      'National Title Favorite',
  offSystem: 'Spread PnR (75%) + Moreyball (25%)',
  defSystem: 'Pressure Man (80%) + Zone (20%)',
};

const ATTENTION: { label: string; detail: string; accent: 'gain' | 'caution' | 'heat' | null; route: string }[] = [
  { label: 'Williams (#1)', detail: 'Knee — cleared for offseason workouts', accent: 'caution', route: '/(tabs)/(main)/roster' },
  { label: 'McKesey (#3)', detail: 'Eligibility ended — final season complete', accent: null, route: '/(tabs)/(main)/roster' },
  { label: 'Transfer portal open', detail: '3 prospects match Spread PnR system (KR 72+)', accent: 'gain', route: '/(tabs)/(main)/recruits' },
];

type HealthStatus = 'available' | 'limited' | 'out';
interface Player {
  initials: string; name: string; firstName: string; number: string;
  pos: string; ht: string; wt: string; classYear: string;
  kr: number; archetype: string;
  status: HealthStatus; statusNote?: string;
  eligibility: string;
  stats: { ppg: number; rpg: number; apg: number; fgPct: string };
}

const STARTERS: Player[] = [
  { initials: 'LK', name: 'Kalejaiye',  firstName: 'Laolu',        number: '11', pos: 'PG',    ht: "5'10", wt: '180', classYear: 'RS Sophomore', kr: 86, archetype: 'PnR Operator',           status: 'available', eligibility: '2 years',  stats: { ppg: 27.3, rpg: 2.9, apg: 2.9, fgPct: '.395' } },
  { initials: 'BW', name: 'Williams',   firstName: 'Brandon',      number: '1',  pos: 'SG',    ht: "6'4",  wt: '185', classYear: 'Junior',       kr: 76, archetype: 'Off Wing Scorer',         status: 'limited',   statusNote: 'Knee', eligibility: '1+ years', stats: { ppg: 19.3, rpg: 6.5, apg: 3.2, fgPct: '.606' } },
  { initials: 'CM', name: 'McKesey',    firstName: 'Claude',       number: '3',  pos: 'SG',    ht: "5'10", wt: '190', classYear: 'Grad Senior',  kr: 71, archetype: 'Combo Guard',             status: 'available', eligibility: '0 (final)', stats: { ppg: 12.4, rpg: 6.3, apg: 4.7, fgPct: '.411' } },
  { initials: 'NC', name: 'Chatelain',  firstName: 'Nathan',       number: '15', pos: 'C',     ht: "6'7",  wt: '200', classYear: 'Freshman',     kr: 71, archetype: 'Stretch Big',             status: 'available', eligibility: '3 years',  stats: { ppg: 10.5, rpg: 6.6, apg: 1.1, fgPct: '.520' } },
  { initials: 'AH', name: 'Hernandez',  firstName: 'Adrian',       number: '10', pos: 'SG',    ht: "5'11", wt: '185', classYear: 'RS Senior',    kr: 62, archetype: 'Sit. Shooter (streaky)', status: 'available', eligibility: '1 year',   stats: { ppg: 7.6,  rpg: 2.1, apg: 1.4, fgPct: '.414' } },
];

const BENCH: Player[] = [
  { initials: 'CP', name: 'Plantey',   firstName: 'Chris',        number: '2',  pos: 'G',     ht: "5'8",  wt: '170', classYear: 'RS Sophomore', kr: 61, archetype: 'Def Specialist',          status: 'available', eligibility: '2 years',  stats: { ppg: 3.2,  rpg: 1.1, apg: 1.5, fgPct: '.314' } },
  { initials: 'SW', name: 'Wall',      firstName: 'Samuel',       number: '6',  pos: 'G',     ht: "6'0",  wt: '190', classYear: 'Freshman',     kr: 60, archetype: 'Sit. Shooter',            status: 'available', eligibility: '3 years',  stats: { ppg: 5.1,  rpg: 2.1, apg: 1.1, fgPct: '.500' } },
  { initials: 'PD', name: 'Diomande',  firstName: 'Paul-Ismael',  number: '21', pos: 'PF',    ht: "6'6",  wt: '215', classYear: 'RS Junior',    kr: 55, archetype: 'Developmental',           status: 'available', eligibility: '1 year',   stats: { ppg: 3.2,  rpg: 2.6, apg: 0.2, fgPct: '.395' } },
];


type PerfTab = 'uscaa' | 'naia' | 'd1';
type Leader = { name: string; val: number };
interface LevelStats {
  record: string; gp: number;
  ppg: number; oppPpg: number; margin: string;
  fgPct: string; threePct: string; ftPct: string;
  rpg: number; apg: number; topg: number;
  leaders: { pts: Leader[]; reb: Leader[]; ast: Leader[]; stl: Leader[] };
}

const LEVEL_STATS: Record<PerfTab, LevelStats> = {
  uscaa: {
    record: '12-0', gp: 12,
    ppg: 100.2, oppPpg: 75.0, margin: '+25.2',
    fgPct: '.510', threePct: '.327', ftPct: '.783',
    rpg: 36.2, apg: 19.4, topg: 13.4,
    leaders: {
      pts: [{ name: 'Kalejaiye', val: 27.8 }, { name: 'Williams', val: 22.0 }, { name: 'McKesey', val: 14.2 }, { name: 'Chatelain', val: 11.4 }],
      reb: [{ name: 'Williams',  val: 10.4 }, { name: 'Chatelain', val: 9.0  }, { name: 'McKesey',  val: 8.2  }, { name: 'Wall',      val: 4.3  }],
      ast: [{ name: 'McKesey',   val: 6.2  }, { name: 'Kalejaiye', val: 4.0  }, { name: 'Williams', val: 3.2  }],
      stl: [{ name: 'Kalejaiye', val: 2.8  }, { name: 'Williams',  val: 2.4  }, { name: 'McKesey',  val: 1.8  }],
    },
  },
  naia: {
    record: '3-2', gp: 5,
    ppg: 98.0, oppPpg: 96.8, margin: '+1.2',
    fgPct: '.438', threePct: '.303', ftPct: '.766',
    rpg: 31.2, apg: 16.2, topg: 13.4,
    leaders: {
      pts: [{ name: 'Kalejaiye', val: 31.8 }, { name: 'Williams',  val: 22.0 }, { name: 'McKesey',   val: 15.8 }, { name: 'Hernandez', val: 11.6 }],
      reb: [{ name: 'Williams',  val: 7.5  }, { name: 'McKesey',   val: 7.2  }, { name: 'Chatelain', val: 6.4  }, { name: 'Kalejaiye', val: 4.0  }],
      ast: [{ name: 'McKesey',   val: 4.4  }, { name: 'Williams',  val: 3.8  }, { name: 'Kalejaiye', val: 2.6  }],
      stl: [{ name: 'Williams',  val: 3.5  }, { name: 'McKesey',   val: 1.8  }, { name: 'Hernandez', val: 1.4  }],
    },
  },
  d1: {
    record: '0-6', gp: 6,
    ppg: 64.6, oppPpg: 119.2, margin: '-54.6',
    fgPct: '.370', threePct: '.321', ftPct: '.843',
    rpg: 19.6, apg: 12.4, topg: 17.8,
    leaders: {
      pts: [{ name: 'Kalejaiye', val: 22.4 }, { name: 'Williams',  val: 14.6 }, { name: 'Chatelain', val: 10.2 }, { name: 'McKesey',  val: 7.2 }],
      reb: [{ name: 'Chatelain', val: 4.4  }, { name: 'McKesey',   val: 3.6  }, { name: 'Kalejaiye', val: 2.2  }, { name: 'Williams', val: 2.0 }],
      ast: [{ name: 'McKesey',   val: 3.6  }, { name: 'Williams',  val: 2.8  }, { name: 'Kalejaiye', val: 2.0  }],
      stl: [{ name: 'Williams',  val: 2.0  }, { name: 'McKesey',   val: 1.0  }, { name: 'Kalejaiye', val: 0.4  }],
    },
  },
};

function healthColor(s: HealthStatus, C: ComponentColors): string {
  return s === 'available' ? C.gain : s === 'limited' ? C.caution : C.heat;
}
function krColor(kr: number, C: ComponentColors): string {
  return kr >= 80 ? C.accent : kr >= 70 ? C.label : kr >= 60 ? C.secondary : C.heat;
}

// ─── PlayerCircle ─────────────────────────────────────────────────────────────

function PlayerCircle({ player, onPress }: { player: Player; onPress: (p: Player) => void }) {
  const C = useColors();
  return (
    <Pressable
      style={{ alignItems: 'center', gap: 4, width: 64 }}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(player); }}
    >
      <View style={{
        width: 52, height: 52, borderRadius: 26, borderWidth: 2.5,
        borderColor: healthColor(player.status, C), backgroundColor: C.bg,
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 14, fontWeight: '800', color: C.label }}>{player.initials}</Text>
        <Text style={{ fontSize: 9, color: C.secondary, marginTop: 1 }}>#{player.number}</Text>
      </View>
      <Text style={{ fontSize: 10, fontWeight: '600', color: C.label, textAlign: 'center' }} numberOfLines={1}>
        {player.name}
      </Text>
      <Text style={{ fontSize: 9, color: C.accent, fontWeight: '700' }}>KR {player.kr}</Text>
    </Pressable>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SportsProgramOverview() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];
  const s = useMemo(() => makeStyles(C), [C]);
  const TOP_BAR_H = insets.top + 54;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isHeadCoach) {
      router.replace('/(tabs)/(main)/hub/sports-player-dashboard' as any);
    }
  }, [isHeadCoach]));

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [perfSheetVisible, setPerfSheetVisible] = useState(false);
  const [perfTab, setPerfTab] = useState<PerfTab>('uscaa');

  const allPlayers = [...STARTERS, ...BENCH];
  const healthy    = allPlayers.filter(p => p.status === 'available').length;
  const limited    = allPlayers.filter(p => p.status === 'limited');
  const out        = allPlayers.filter(p => p.status === 'out').length;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>{TEAM.name.toUpperCase()}</Text>
            </View>
          </View>
          <RolePill role={role} onPress={cycleRole} isPrimary={false} />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: TOP_BAR_H + 16, paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >

        {/* ── Card 1: Team KR ──────────────────────────────────────────── */}
        <View style={s.section}>
          <Pressable
            style={({ pressed }) => [s.krCard, { backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }, pressed && { opacity: 0.85 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPerfSheetVisible(true); }}
          >
            <View style={s.krCardTop}>
              {/* KR Ring */}
              <View style={s.krRingWrap}>
                <View style={[s.krRing, { borderColor: C.accent }]}>
                  <Text style={[s.krRingNumber, { color: C.accent }]}>{TEAM.kr}</Text>
                  <Text style={[s.krRingLabel, { color: C.secondary }]}>TEAM KR</Text>
                </View>
              </View>
              {/* Right side */}
              <View style={s.krCardRight}>
                <Text style={[s.krTierLabel, { color: C.accent }]}>{TEAM.tier}</Text>
                <Text style={[s.krSystemText, { color: C.secondary }]}>(USCAA)</Text>
              </View>
            </View>
            <View style={[s.krCardDivider, { backgroundColor: C.separator }]} />
            {/* Bottom metric row */}
            <View style={s.krMetricRow}>
              {[
                { label: 'OFF KR',     value: TEAM.offKR, display: String(TEAM.offKR) },
                { label: 'DEF KR',     value: TEAM.defKR, display: String(TEAM.defKR) },
                { label: 'CONFIDENCE', value: 60,         display: '60%'              },
              ].map((m, i, arr) => (
                <React.Fragment key={m.label}>
                  <View style={s.krMetricCell}>
                    <Text style={[s.krMetricValue, { color: krColor(m.value, C) }]}>{m.display}</Text>
                    <Text style={[s.krMetricLabel, { color: C.secondary }]}>{m.label}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={[s.krMetricDivider, { backgroundColor: C.separator }]} />}
                </React.Fragment>
              ))}
            </View>
            {/* Tap hint */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', marginTop: 10 }}>
              <Text style={[{ fontSize: 10, color: C.secondary }]}>Full breakdown</Text>
              <IconSymbol name="chevron.right" size={10} color={C.secondary} style={{ marginLeft: 3 }} />
            </View>
          </Pressable>
        </View>

        {/* ── Card 2: Season complete (contextual next action) ─────────── */}
        <View style={s.section}>
          <Text style={[s.sh, { color: C.secondary }]}>SEASON STATUS</Text>
          <View style={[s.fightCard, { backgroundColor: C.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }]}>
            {/* Header row */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <Text style={[{ fontSize: 16, fontWeight: '700', color: C.label }]}>Season complete</Text>
              <View style={[s.levelPill, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <Text style={[s.levelPillText, { color: C.secondary }]}>Game 23 · Mar 8</Text>
              </View>
            </View>
            {/* Final record row */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <View style={[s.recordPill, { backgroundColor: C.gainBg, borderColor: C.gain + '44' }]}>
                <Text style={[s.recordPillText, { color: C.gain }]}>15-8 Final</Text>
              </View>
              <View style={[s.recordPill, { backgroundColor: C.gainBg, borderColor: C.gain + '44' }]}>
                <Text style={[s.recordPillText, { color: C.gain }]}>15-2 Non-D1</Text>
              </View>
              <View style={[s.recordPill, { backgroundColor: C.heatBg, borderColor: C.heat + '44' }]}>
                <Text style={[s.recordPillText, { color: C.heat }]}>0-6 D1</Text>
              </View>
            </View>
            {/* Championship row */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <View style={[s.recordPill, { backgroundColor: C.cautionBg, borderColor: C.caution + '44' }]}>
                <Text style={[s.recordPillText, { color: C.caution }]}>🏆 SWS Regular Season (Back-to-Back)</Text>
              </View>
              <View style={[s.recordPill, { backgroundColor: C.cautionBg, borderColor: C.caution + '44' }]}>
                <Text style={[s.recordPillText, { color: C.caution }]}>🏆 GAAC Tournament Champions</Text>
              </View>
            </View>
            {/* Offseason link */}
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
              onPress={() => go('/(tabs)/(main)/recruits')}
            >
              <Text style={[{ fontSize: 13, fontWeight: '600', color: C.label }]}>Offseason mode</Text>
              <Text style={[{ fontSize: 12, color: C.secondary }]}>· Portal & recruiting open</Text>
              <IconSymbol name="chevron.right" size={11} color={C.secondary} />
            </Pressable>
          </View>
        </View>

        {/* ── Card 3: Roster strip ─────────────────────────────────────── */}
        <View style={s.section}>
          <Text style={[s.sh, { color: C.secondary }]}>ROSTER</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>

            {/* Horizontal strip — starters | divider | bench */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                {STARTERS.map(p => (
                  <PlayerCircle key={p.initials} player={p} onPress={setSelectedPlayer} />
                ))}
                {/* Starter / bench divider */}
                <View style={[{ width: StyleSheet.hairlineWidth, alignSelf: 'stretch', marginHorizontal: 4, backgroundColor: C.separator }]} />
                {BENCH.map(p => (
                  <PlayerCircle key={p.initials} player={p} onPress={setSelectedPlayer} />
                ))}
              </View>
            </ScrollView>

            {/* Health summary */}
            <Text style={[s.healthSummary, { color: C.secondary, marginTop: 12 }]}>
              {healthy} healthy
              {limited.length > 0 && ` · ${limited.length} questionable: ${limited.map(p => `${p.name} (#${p.number}) - ${p.statusNote ?? 'limited'}`).join(', ')}`}
              {out > 0 && ` · ${out} out`}
            </Text>
          </View>
        </View>

        {/* ── Player detail bottom sheet ─────────────────────────────────── */}
        <BottomSheet
          visible={selectedPlayer !== null}
          onClose={() => setSelectedPlayer(null)}
          useModal
        >
          {selectedPlayer && (
            <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
              {/* Header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <View style={[s.sheetAvatar, { borderColor: healthColor(selectedPlayer.status, C), backgroundColor: C.bg }]}>
                  <Text style={[{ fontSize: 22, fontWeight: '800', color: C.label }]}>{selectedPlayer.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 20, fontWeight: '800', color: C.label }]}>
                    #{selectedPlayer.number} {selectedPlayer.firstName} {selectedPlayer.name}
                  </Text>
                  <Text style={[{ fontSize: 13, color: C.secondary, marginTop: 2 }]}>
                    {selectedPlayer.pos} · {selectedPlayer.ht} / {selectedPlayer.wt} lbs · {selectedPlayer.classYear}
                  </Text>
                </View>
              </View>

              {/* KR + archetype */}
              <View style={[s.sheetKrRow, { backgroundColor: C.bg, borderColor: C.separator }]}>
                <View style={[s.sheetKrRing, { borderColor: C.accent }]}>
                  <Text style={[{ fontSize: 22, fontWeight: '900', color: C.accent }]}>{selectedPlayer.kr}</Text>
                  <Text style={[{ fontSize: 8, fontWeight: '700', color: C.secondary, letterSpacing: 0.8 }]}>KR</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 13, fontWeight: '700', color: C.label }]}>{selectedPlayer.archetype}</Text>
                  <Text style={[{ fontSize: 11, color: C.secondary, marginTop: 2 }]}>Eligibility: {selectedPlayer.eligibility}</Text>
                </View>
                {selectedPlayer.status !== 'available' && (
                  <View style={[{ borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: healthColor(selectedPlayer.status, C) + '22' }]}>
                    <Text style={[{ fontSize: 11, fontWeight: '700', color: healthColor(selectedPlayer.status, C) }]}>
                      {selectedPlayer.status === 'limited' ? `Questionable · ${selectedPlayer.statusNote}` : 'Out'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <Text style={[s.sh, { color: C.secondary, marginTop: 16, marginBottom: 10 }]}>SEASON STATS (ALL LEVELS)</Text>
              <View style={[{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 12 }]}>
                {[
                  { label: 'PPG', value: selectedPlayer.stats.ppg },
                  { label: 'RPG', value: selectedPlayer.stats.rpg },
                  { label: 'APG', value: selectedPlayer.stats.apg },
                  { label: 'FG%', value: selectedPlayer.stats.fgPct },
                ].map((stat, i, arr) => (
                  <View
                    key={stat.label}
                    style={[
                      { flex: 1, alignItems: 'center', paddingVertical: 14 },
                      i < arr.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator },
                    ]}
                  >
                    <Text style={[{ fontSize: 20, fontWeight: '800', color: C.label }]}>{stat.value}</Text>
                    <Text style={[{ fontSize: 10, fontWeight: '600', color: C.secondary, letterSpacing: 0.5, marginTop: 2 }]}>{stat.label}</Text>
                  </View>
                ))}
              </View>

              {/* View full profile CTA */}
              <Pressable
                style={[s.sheetCta, { backgroundColor: C.label }]}
                onPress={() => {
                  setSelectedPlayer(null);
                  go('/(tabs)/(main)/roster');
                }}
              >
                <Text style={[{ fontSize: 15, fontWeight: '700', color: C.bg }]}>View full profile</Text>
                <IconSymbol name="chevron.right" size={14} color={C.bg} />
              </Pressable>
            </BottomSheetScrollView>
          )}
        </BottomSheet>

        {/* ── Card 4: Attention items ──────────────────────────────────── */}
        <View style={s.section}>
          <Text style={[s.sh, { color: C.secondary }]}>NEEDS ATTENTION</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {ATTENTION.map((item, i) => (
              <Pressable
                key={item.label}
                style={[
                  { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 10 },
                  i < ATTENTION.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                ]}
                onPress={() => go(item.route)}
              >
                <View style={[{ width: 6, height: 6, borderRadius: 3, backgroundColor: item.accent ? C[item.accent] : C.secondary, marginLeft: 2 }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[{ fontSize: 13, fontWeight: '600', color: C.label }]}>{item.label}</Text>
                  <Text style={[{ fontSize: 12, color: C.secondary, marginTop: 1 }]}>{item.detail}</Text>
                </View>
                <IconSymbol name="chevron.right" size={11} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── Season stats bottom sheet (from KR card tap) ──────────── */}
        <BottomSheet
          visible={perfSheetVisible}
          onClose={() => setPerfSheetVisible(false)}
          useModal
        >
          <BottomSheetScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
            <Text style={[{ fontSize: 18, fontWeight: '800', color: C.label, marginBottom: 16 }]}>Season statistics</Text>

            {/* Level tabs */}
            <View style={[{ flexDirection: 'row', backgroundColor: C.bg, borderRadius: 12, padding: 3, marginBottom: 20, gap: 2 }]}>
              {([['uscaa', 'USCAA/JC'], ['naia', 'NAIA'], ['d1', 'D1']] as [PerfTab, string][]).map(([key, label]) => (
                <Pressable
                  key={key}
                  style={[{
                    flex: 1, paddingVertical: 8, borderRadius: 10, alignItems: 'center',
                    backgroundColor: perfTab === key ? C.label : 'transparent',
                  }]}
                  onPress={() => setPerfTab(key)}
                >
                  <Text style={[{ fontSize: 12, fontWeight: '700', color: perfTab === key ? C.bg : C.secondary }]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            {/* Level stats block */}
            {(() => {
              const ls = LEVEL_STATS[perfTab];
              const marginColor = ls.margin.startsWith('+') ? C.gain : C.heat;
              return (
                <>
                  {/* Record + margin */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <View style={[s.recordPill, { backgroundColor: ls.record.startsWith('0') ? C.heatBg : C.gainBg, borderColor: (ls.record.startsWith('0') ? C.heat : C.gain) + '44' }]}>
                      <Text style={[s.recordPillText, { color: ls.record.startsWith('0') ? C.heat : C.gain }]}>{ls.record} · {ls.gp} GP</Text>
                    </View>
                    <Text style={[{ fontSize: 13, fontWeight: '700', color: marginColor }]}>{ls.margin} margin</Text>
                  </View>

                  {/* Team scoring */}
                  <View style={[{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 12, marginBottom: 12 }]}>
                    {[
                      { label: 'PPG', value: ls.ppg },
                      { label: 'OPP PPG', value: ls.oppPpg },
                      { label: 'RPG', value: ls.rpg },
                    ].map((stat, i, arr) => (
                      <View key={stat.label} style={[{ flex: 1, alignItems: 'center', paddingVertical: 14 }, i < arr.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator }]}>
                        <Text style={[{ fontSize: 22, fontWeight: '800', color: C.label }]}>{stat.value}</Text>
                        <Text style={[{ fontSize: 10, fontWeight: '600', color: C.secondary, letterSpacing: 0.5, marginTop: 2 }]}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Shooting + misc */}
                  <View style={[{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 12, marginBottom: 20 }]}>
                    {[
                      { label: 'FG%', value: ls.fgPct },
                      { label: '3P%', value: ls.threePct },
                      { label: 'FT%', value: ls.ftPct },
                      { label: 'TO/G', value: ls.topg },
                      { label: 'APG', value: ls.apg },
                    ].map((stat, i, arr) => (
                      <View key={stat.label} style={[{ flex: 1, alignItems: 'center', paddingVertical: 12 }, i < arr.length - 1 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: C.separator }]}>
                        <Text style={[{ fontSize: 14, fontWeight: '800', color: C.label }]}>{stat.value}</Text>
                        <Text style={[{ fontSize: 9, fontWeight: '600', color: C.secondary, letterSpacing: 0.5, marginTop: 2 }]}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Player leaderboards */}
                  {([
                    { key: 'pts' as const, label: 'Scoring' },
                    { key: 'reb' as const, label: 'Rebounds' },
                    { key: 'ast' as const, label: 'Assists' },
                    { key: 'stl' as const, label: 'Steals' },
                  ]).map(cat => (
                    <View key={cat.key} style={{ marginBottom: 14 }}>
                      <Text style={[s.sh, { color: C.secondary, marginBottom: 8 }]}>{cat.label.toUpperCase()}</Text>
                      {ls.leaders[cat.key].map((p, i) => (
                        <View key={p.name} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: i < ls.leaders[cat.key].length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                          <Text style={[{ fontSize: 13, color: C.secondary, width: 20 }]}>{i + 1}.</Text>
                          <Text style={[{ fontSize: 13, fontWeight: '600', color: C.label, flex: 1 }]}>{p.name}</Text>
                          <Text style={[{ fontSize: 14, fontWeight: '800', color: C.label }]}>{p.val}</Text>
                        </View>
                      ))}
                    </View>
                  ))}
                </>
              );
            })()}
          </BottomSheetScrollView>
        </BottomSheet>


      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },

    section: { paddingHorizontal: 16, marginBottom: 24 },
    sh: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
    card: { borderRadius: 12, padding: 14 },

    // Program header
    programHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 12 },
    programLogoWrap: { width: 64, height: 64, borderRadius: 32, overflow: 'hidden' },
    programLogo: { width: '100%', height: '100%' },
    programName: { fontSize: 18, fontWeight: '700', marginBottom: 2 },
    programSub: { fontSize: 12, lineHeight: 18 },
    recordStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    recordPill: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
    recordPillText: { fontSize: 12, fontWeight: '700' },

    // KR hero card
    krCard: { borderRadius: 16, padding: 16, overflow: 'hidden' },
    krCardTop: { flexDirection: 'row', gap: 16, alignItems: 'center', marginBottom: 14 },
    krRingWrap: { alignItems: 'center', justifyContent: 'center' },
    krRing: {
      width: 90, height: 90, borderRadius: 45, borderWidth: 3,
      alignItems: 'center', justifyContent: 'center',
    },
    krRingNumber: { fontSize: 36, fontWeight: '900', lineHeight: 40, letterSpacing: -1 },
    krRingLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, marginTop: 2 },
    krCardRight: { flex: 1, gap: 4 },
    krTierLabel: { fontSize: 14, fontWeight: '700' },
    krSystemText: { fontSize: 12, lineHeight: 17 },
    krFitRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
    krFitLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
    krFitValue: { fontSize: 18, fontWeight: '700' },
    krCardDivider: { height: StyleSheet.hairlineWidth, marginBottom: 14 },
    krMetricRow: { flexDirection: 'row' },
    krMetricCell: { flex: 1, alignItems: 'center', gap: 3 },
    krMetricValue: { fontSize: 22, fontWeight: '800' },
    krMetricLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },
    krMetricDivider: { width: StyleSheet.hairlineWidth },

    // Fight poster
    fightCard: { borderRadius: 14, padding: 14 },
    fightCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
    fightCardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
    fightPoster: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
    fightSide: { flex: 1, alignItems: 'flex-start', gap: 6 },
    fightLogo: { width: 48, height: 48, borderRadius: 24, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    fightTeamName: { fontSize: 13, fontWeight: '700', lineHeight: 18 },
    fightKR: { fontSize: 13, fontWeight: '700' },
    fightCenter: { alignItems: 'center', gap: 3, paddingHorizontal: 4 },
    fightVS: { fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    fightMeta: { fontSize: 11, fontWeight: '500' },
    fightBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    advPill: { borderRadius: 20, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4 },
    advPillText: { fontSize: 12, fontWeight: '700' },
    h2hText: { fontSize: 12, fontWeight: '600' },

    // Nav grid
    navGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    navCard: { borderRadius: 14, padding: 14, width: '47.5%' },
    navCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    navIconBox: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    navBadge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2, minWidth: 18, alignItems: 'center' },
    navBadgeText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    navCardLabel: { fontSize: 14, fontWeight: '700', marginBottom: 4 },
    navCardContext: { fontSize: 12, lineHeight: 17 },

    // Depth chart
    healthSummary: { fontSize: 12, lineHeight: 18 },

    // Player sheet
    sheetAvatar: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
    sheetKrRow: { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 12, padding: 14, borderWidth: StyleSheet.hairlineWidth },
    sheetKrRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center' },
    sheetCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 14, paddingVertical: 14, marginTop: 20 },

    // Performance
    perfGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    perfCell: { width: '33.33%', alignItems: 'center', paddingVertical: 10 },
    perfValue: { fontSize: 20, fontWeight: '700', marginBottom: 2 },
    perfLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 },
    perfDelta: { fontSize: 11, fontWeight: '600' },
    perfRowDivider: { width: '100%', height: StyleSheet.hairlineWidth, marginVertical: 4 },

    // Recent results
    resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10 },
    resultBadge: { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, minWidth: 26, alignItems: 'center' },
    resultBadgeText: { fontSize: 11, fontWeight: '800' },
    resultOpp: { flex: 1, fontSize: 13, fontWeight: '500' },
    resultScore: { fontSize: 13, fontWeight: '600' },
    levelPill: { borderRadius: 8, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
    levelPillText: { fontSize: 10, fontWeight: '700' },
  });
}
