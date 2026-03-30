/**
 * Schedule Hub
 * Extracted from app/(tabs)/index.tsx.
 * Contains: Games feed, Calendar, Standings (Traditional + KR), News.
 * Game cards use 3-zone tap model: KaNeXT logo | card body | opponent logo.
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Image, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme'
;
import { LiveGamePanel } from '@/components/live-game-panel';
import { DepthChartView, DEPTH_CHART_BY_SEASON, CURRENT_SEASON } from '@/components/roster-content';
import { UnitsView } from '@/components/depth-chart/depth-chart-units';
import { CalendarHub } from '@/components/schedule/calendar-hub';
import { GameTeamContextSheet } from '@/components/schedule/game-team-context-sheet';
import { openTeamSheet } from '@/utils/global-team-sheet';
import { GOVERNING_BODIES } from '@/data/governing-bodies';
import type { Archetype } from '@/data/system-demand-profiles';
import type { OffensiveStyle, DefensiveStyle } from '@/types';
import {
  KaNeXT_GAMES, KaNeXT_GAMES_BY_ID, KaNeXT_LEADERS, KaNeXT_STANDINGS, KaNeXT_NEWS,
  KaNeXT_GAME_IMPACT, KaNeXT_PREGAME, ROSTER_KR,
  POSITIVE_IMPACT, NEGATIVE_IMPACT,
  type PregameSnapshot, type ClusterRating, type KaNeXTGame,
} from '@/data/fmu';

// =============================================================================
// Tab config
// =============================================================================

type ScheduleTab = 'feed' | 'calendar' | 'standings' | 'news';
const SCHEDULE_TABS: { key: ScheduleTab; label: string }[] = [
  { key: 'calendar', label: 'Agenda' },
  { key: 'feed', label: 'Schedule' },
  { key: 'standings', label: 'Standings' },
  { key: 'news', label: 'News' },
];

// =============================================================================
// Helpers
// =============================================================================

const confHash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

// KaNeXT seal logo
const KaNeXT_LOGO = require('@/assets/images/kx-logo.png');

// Opponent depth chart helpers
const OPP_ARCHETYPE_MAP: Record<string, Archetype> = {
  'Shot Creator': 'pick_and_roll_operator', 'Floor General': 'primary_ball_handler',
  'Scoring Wing': 'secondary_creator_wing', 'Stretch Big': 'stretch_big',
  'Rim Runner': 'vertical_spacer', 'Two-Way Wing': 'two_way_wing',
  '3&D Guard': 'three_and_d_wing', 'Post Anchor': 'rim_protector_anchor',
  'Slasher': 'slasher_rim_pressure_wing', 'Playmaking Guard': 'connector_guard_wing',
};
const DNA_OFF_MAP: Record<string, OffensiveStyle> = {
  'Spread Pick & Roll': 'spread_pick_and_roll', 'Five-Out Motion': 'five_out_motion',
  'Motion Read & React': 'motion_read_react', 'Pace & Space': 'pace_and_space',
  'Dribble Drive': 'dribble_drive', 'Princeton': 'princeton', 'Flex': 'flex',
  'Swing': 'swing', 'Post-Centric': 'post_centric', 'Moreyball': 'moreyball', 'Heliocentric': 'heliocentric',
};
const DNA_DEF_MAP: Record<string, DefensiveStyle> = {
  'Containment Man': 'containment_man', 'Pack Line': 'pack_line', 'Pressure Man': 'pressure_man',
  'Switch Everything': 'switch_everything', 'Ice / No Middle': 'ice_no_middle',
  'Zone (Structured)': 'zone_structured', 'Matchup Zone': 'matchup_zone', 'Press': 'press', 'Junk / Special': 'junk_special',
};
const OPP_POSITIONS = ['Point Guard', 'Combo Guard', 'Wing', 'Forward', 'Big'] as const;
const OPP_EXTRA_NAMES = ['J. Williams', 'D. Harris', 'M. Johnson', 'T. Davis', 'K. Robinson', 'C. Taylor', 'R. Clark', 'A. Moore'];
const OPP_CLUSTER_MAP: Record<string, keyof import('@/data/roster-data').ClusterRatings> = {
  'Shooting': 'shooting', 'Finishing': 'finishing', 'Playmaking': 'playmaking',
  'OB Defense': 'on_ball_defense', 'Team Defense': 'team_defense', 'Rebounding': 'rebounding', 'Physical': 'physical',
};

function buildOpponentDepthChart(pregame: PregameSnapshot) {
  type CR = import('@/data/roster-data').ClusterRatings;
  const teamClusters: CR = { shooting: 60, finishing: 60, playmaking: 60, on_ball_defense: 60, team_defense: 60, rebounding: 60, physical: 60 };
  for (const cr of pregame.clusterRatings) { const key = OPP_CLUSTER_MAP[cr.cluster]; if (key) teamClusters[key] = cr.rating; }
  const threats = pregame.oppThreats.slice(0, 3);
  const playerClusters: Record<string, CR> = {};
  const playerPhysicals: Record<string, { height: string; weight: number }> = {};
  const depthChart: { position: string; players: any[] }[] = [];
  const POS_HT = [74, 75, 78, 80, 82], POS_WT = [180, 190, 205, 220, 240];
  for (let i = 0; i < 5; i++) {
    const pos = OPP_POSITIONS[i]; const t = threats[i]; const sn = `${i+1}`; const bn = `${i+6}`;
    const name = t?.name ?? OPP_EXTRA_NAMES[i % 8]; const kr = t?.kr ?? pregame.oppKR - i*2;
    const arch = t ? (OPP_ARCHETYPE_MAP[t.archetype] ?? 'two_way_wing') : 'two_way_wing';
    const v = (i*7+3)%11-5;
    const sc: CR = { shooting: Math.max(20,Math.min(98,teamClusters.shooting+v)), finishing: Math.max(20,Math.min(98,teamClusters.finishing-v+2)), playmaking: Math.max(20,Math.min(98,teamClusters.playmaking+(i<2?8:-4))), on_ball_defense: Math.max(20,Math.min(98,teamClusters.on_ball_defense+v-1)), team_defense: Math.max(20,Math.min(98,teamClusters.team_defense+(i>=3?6:-3))), rebounding: Math.max(20,Math.min(98,teamClusters.rebounding+(i>=3?5:-2))), physical: Math.max(20,Math.min(98,teamClusters.physical+(i>=3?7:-3))) };
    playerClusters[sn] = sc;
    const bc: CR = { shooting: Math.max(20,sc.shooting-8), finishing: Math.max(20,sc.finishing-6), playmaking: Math.max(20,sc.playmaking-7), on_ball_defense: Math.max(20,sc.on_ball_defense-5), team_defense: Math.max(20,sc.team_defense-6), rebounding: Math.max(20,sc.rebounding-5), physical: Math.max(20,sc.physical-4) };
    playerClusters[bn] = bc;
    const hi = POS_HT[i]+((i*3+1)%5)-2; const hf = Math.floor(hi/12); const hr = hi%12;
    playerPhysicals[sn] = { height: `${hf}-${hr}`, weight: POS_WT[i]+((i*7)%15)-5 };
    playerPhysicals[bn] = { height: `${hf}-${Math.max(0,hr-1)}`, weight: POS_WT[i]-10+((i*5)%10) };
    depthChart.push({ position: pos, players: [
      { name, number: sn, kr, minutes: 28-i, archetypes: [arch], roleDefinition: '', coachNote: '' },
      { name: OPP_EXTRA_NAMES[(i+3)%8], number: bn, kr: Math.max(40,kr-10), minutes: 12+i, archetypes: ['two_way_wing'], roleDefinition: '', coachNote: '' },
    ]});
  }
  return { depthChart, playerClusters, playerPhysicals };
}

function parseDNASystems(dna: string[]): { off: OffensiveStyle; def: DefensiveStyle; tempo: string } {
  let off: OffensiveStyle = 'motion_read_react'; let def: DefensiveStyle = 'containment_man'; let tempo = 'Moderate';
  for (const line of dna) {
    if (line.startsWith('Offense: ')) off = DNA_OFF_MAP[line.replace('Offense: ', '')] ?? off;
    else if (line.startsWith('Defense: ')) def = DNA_DEF_MAP[line.replace('Defense: ', '')] ?? def;
    else if (line.startsWith('Tempo: ')) tempo = line.replace('Tempo: ', '');
  }
  return { off, def, tempo };
}

// =============================================================================
// Game Card — 3-zone tap model
// =============================================================================

function GameCard({
  game,
  colors,
  onPrimaryPress,
  onLogoPress,
  onLogoLongPress,
  children,
}: {
  game: KaNeXTGame;
  colors: typeof Colors.light;
  onPrimaryPress: () => void;
  onLogoPress: (team: 'fmu' | 'opponent') => void;
  onLogoLongPress: (team: 'fmu' | 'opponent') => void;
  children: React.ReactNode;
}) {
  // Opponent letter circle
  const initial = game.opponent.charAt(0).toUpperCase();
  const oppColor = `hsl(${confHash(game.opponent) % 360}, 55%, 45%)`;

  return (
    <View style={s.gameCardRow}>
      {/* KaNeXT logo zone */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLogoPress('fmu'); }}
        onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLogoLongPress('fmu'); }}
        delayLongPress={400}
        style={s.logoZone}
      >
        <Image source={KaNeXT_LOGO} style={s.teamLogo} resizeMode="contain" />
      </Pressable>

      {/* Primary tap zone — card body */}
      <Pressable
        style={({ pressed }) => [{ flex: 1 }, pressed && { opacity: 0.7 }]}
        onPress={onPrimaryPress}
      >
        {children}
      </Pressable>

      {/* Opponent logo zone */}
      <Pressable
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onLogoPress('opponent'); }}
        onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLogoLongPress('opponent'); }}
        delayLongPress={400}
        style={s.logoZone}
      >
        <View style={[s.oppLetterCircle, { backgroundColor: oppColor }]}>
          <Text style={s.oppLetterText}>{initial}</Text>
        </View>
      </Pressable>
    </View>
  );
}

// =============================================================================
// ScheduleHub Component
// =============================================================================

interface ScheduleHubProps {
  colors: typeof Colors.light;
  router: any;
  openLiveTrigger?: number;
  jumpToStandings?: number;
}

export function ScheduleHub({ colors, router, openLiveTrigger, jumpToStandings }: ScheduleHubProps) {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<ScheduleTab>('calendar');
  // Standings V2 state
  const [standingsMode, setStandingsMode] = useState<'traditional' | 'kr'>('traditional');
  const [standingsScope, setStandingsScope] = useState<'college' | 'global'>('college');
  const [standingsView, setStandingsView] = useState<'conference' | 'division' | 'national'>('conference');
  const [globalView, setGlobalView] = useState<'country' | 'league' | 'world'>('country');
  const [selectedDivisions, setSelectedDivisions] = useState<string[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLeague, setSelectedLeague] = useState<string | null>(null);
  const [expandedKRTeam, setExpandedKRTeam] = useState<string | null>(null);
  const standingsLoaded = useRef(false);

  // Persist standings selections
  const STANDINGS_STORAGE_KEY = 'kx:standings_prefs';
  useEffect(() => {
    if (!standingsLoaded.current) return;
    AsyncStorage.setItem(STANDINGS_STORAGE_KEY, JSON.stringify({
      mode: standingsMode, scope: standingsScope, view: standingsView,
      globalView, selectedDivisions, selectedCountry, selectedLeague,
    })).catch(() => {});
  }, [standingsMode, standingsScope, standingsView, globalView, selectedDivisions, selectedCountry, selectedLeague]);

  useEffect(() => {
    AsyncStorage.getItem(STANDINGS_STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const p = JSON.parse(raw);
          if (p.mode) setStandingsMode(p.mode);
          if (p.scope) setStandingsScope(p.scope);
          if (p.view) setStandingsView(p.view);
          if (p.globalView) setGlobalView(p.globalView);
          if (p.selectedDivisions) setSelectedDivisions(p.selectedDivisions);
          if (p.selectedCountry) setSelectedCountry(p.selectedCountry);
          if (p.selectedLeague) setSelectedLeague(p.selectedLeague);
        } catch {}
      }
      standingsLoaded.current = true;
    }).catch(() => { standingsLoaded.current = true; });
  }, []);

  const [search, setSearch] = useState('');
  const [expandedLeader, setExpandedLeader] = useState<string | null>(null);
  const [expandedLive, setExpandedLive] = useState(false);

  // Game Team Context Sheet state
  const [contextSheet, setContextSheet] = useState<{ game: KaNeXTGame; team: 'fmu' | 'opponent' } | null>(null);

  // Old opponent KR sheet (for legacy bottom-sheet content inside games)
  const [oppKRSheet, setOppKRSheet] = useState<{ opponent: string; kr: number; record: string; gameId?: string; gameStatus?: string; score?: string } | null>(null);
  const [activePGIS, setActivePGIS] = useState(0);
  const [fullPGISOpen, setFullPGISOpen] = useState(false);

  // When parent triggers live open, switch to feed tab and expand
  useEffect(() => {
    if (openLiveTrigger && openLiveTrigger > 0) {
      setActiveTab('feed');
      setExpandedLive(true);
    }
  }, [openLiveTrigger]);

  // When parent triggers jump-to-standings, switch to standings tab with conference view
  useEffect(() => {
    if (jumpToStandings && jumpToStandings > 0) {
      setActiveTab('standings');
      setStandingsScope('college');
      setStandingsView('conference');
    }
  }, [jumpToStandings]);

  const openSheet = useCallback((data: { opponent: string; kr: number; record: string; gameId?: string; gameStatus?: string; score?: string }) => {
    setOppKRSheet(data);
  }, []);

  const closeSheet = useCallback(() => {
    setOppKRSheet(null);
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = q
    ? KaNeXT_GAMES.filter((g) =>
        g.opponent.toLowerCase().includes(q) ||
        g.date.toLowerCase().includes(q) ||
        g.location.toLowerCase().includes(q))
    : KaNeXT_GAMES;

  // Sort: live games first, then original order
  const sortedGames = [...filtered].sort((a, b) => {
    if (a.status === 'live' && b.status !== 'live') return -1;
    if (a.status !== 'live' && b.status === 'live') return 1;
    return 0;
  });

  // 3-zone tap handlers
  const handlePrimaryPress = useCallback((game: KaNeXTGame) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (game.status === 'final') {
      router.push({ pathname: '/coach/game-detail', params: { gameId: game.id, tab: 'report', espnTab: 'gamecast' } } as any);
    } else {
      router.push({ pathname: '/coach/game-detail', params: { gameId: game.id } } as any);
    }
  }, [router]);

  const handleLogoPress = useCallback((game: KaNeXTGame, team: 'fmu' | 'opponent') => {
    setContextSheet({ game, team });
  }, []);

  const handleLogoLongPress = useCallback((game: KaNeXTGame, team: 'fmu' | 'opponent') => {
    if (team === 'fmu') {
      openTeamSheet();
    } else {
      // No universal opponent profile yet — open context sheet
      setContextSheet({ game, team });
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Inner Tab Pills */}
      <View style={[s.tabRow, { backgroundColor: colors.background }]}>
        {SCHEDULE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[s.tabPill, { backgroundColor: isActive ? colors.text + 'E0' : colors.backgroundSecondary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
            >
              <ThemedText style={[s.tabText, { color: isActive ? colors.background : colors.textSecondary }]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Calendar tab renders its own scroll — no outer ScrollView */}
      {activeTab === 'calendar' ? (
        <CalendarHub colors={colors} router={router} />
      ) : (
        <ScrollView
          contentContainerStyle={s.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
        >
          {/* ── Feed Tab ── */}
          {activeTab === 'feed' && (
            <View>
              {/* Pinned Live Game — Media Card with Screen */}
              {sortedGames.filter((g) => g.status === 'live').map((game) => (
                <View key={game.id} style={{ marginBottom: Spacing.md }}>
                  <Pressable
                    style={({ pressed }) => [{ backgroundColor: '#000', borderRadius: BorderRadius.lg, overflow: 'hidden' as const }, pressed && { opacity: 0.85 }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setExpandedLive((prev) => !prev);
                    }}
                  >
                    <View style={{ height: 180, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' }}>
                      <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' }}>
                        <IconSymbol name="play.fill" size={24} color="#fff" />
                      </View>
                    </View>
                    <View style={{ padding: 12 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444', marginRight: 6 }} />
                        <Text style={{ fontSize: 11, fontWeight: '800', letterSpacing: 0.5, color: '#EF4444' }}>LIVE</Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View style={{ flex: 1, flexShrink: 1, marginRight: 12 }}>
                          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }} numberOfLines={1}>
                            {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                          </Text>
                          {game.opponentRecord ? <Text style={{ fontSize: 13, color: '#999', marginTop: 2 }}>{game.opponentRecord}</Text> : null}
                        </View>
                        <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                          {game.score ? <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{game.score}</Text> : null}
                          {game.clock ? <Text style={{ fontSize: 12, color: '#999', marginTop: 4 }}>{game.clock}</Text> : null}
                        </View>
                      </View>
                    </View>
                  </Pressable>
                  {expandedLive && <LiveGamePanel gameId={game.id} game={KaNeXT_GAMES_BY_ID[game.id]} colors={colors} />}
                </View>
              ))}

              {/* Upcoming Games */}
              {(() => {
                const upcoming = sortedGames.filter((g) => g.status === 'upcoming').slice(0, 2);
                if (upcoming.length === 0) return null;
                return (
                  <>
                    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>UPCOMING</ThemedText>
                    <View style={[s.card, { backgroundColor: colors.backgroundSecondary, marginBottom: Spacing.md }]}>
                      {upcoming.map((game, index) => (
                        <View key={game.id}>
                          {index > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                          <GameCard
                            game={game}
                            colors={colors}
                            onPrimaryPress={() => handlePrimaryPress(game)}
                            onLogoPress={(team) => handleLogoPress(game, team)}
                            onLogoLongPress={(team) => handleLogoLongPress(game, team)}
                          >
                            <View style={{ paddingVertical: 12 }}>
                              <ThemedText style={[s.opponentText, { color: colors.text }]}>
                                {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                              </ThemedText>
                              {game.opponentRecord && (
                                <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
                                  {game.opponentRecord}
                                </ThemedText>
                              )}
                              <ThemedText style={[s.metaText, { color: colors.textTertiary }]}>
                                {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                              </ThemedText>
                              <ThemedText style={[s.dateTimeText, { color: '#FFFFFF' }]}>
                                {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''}
                              </ThemedText>
                              {(() => { const sw = 50 + (confHash(game.opponent ?? '') % 30); return (
                                <Text style={{ fontSize: 11, fontWeight: '600', color: sw >= 50 ? '#22C55E' : '#EF4444', marginTop: 2 }}>Sim {sw}%</Text>
                              ); })()}
                            </View>
                          </GameCard>
                        </View>
                      ))}
                    </View>
                  </>
                );
              })()}

              {/* Search between upcoming and completed */}
              <View style={[s.searchBar, { backgroundColor: colors.backgroundSecondary }]}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
                <TextInput
                  style={[s.searchInput, { color: colors.text }]}
                  placeholder="Search games..."
                  placeholderTextColor={colors.textTertiary}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              {/* Completed Games */}
              {(() => {
                const completed = sortedGames.filter((g) => g.status === 'final' && g.score);
                if (completed.length === 0) return null;
                const last3 = completed.slice(0, 3).map((g) => g.score?.charAt(0));
                const allWin = last3.length === 3 && last3.every((r) => r === 'W');
                const allLoss = last3.length === 3 && last3.every((r) => r === 'L');
                const streakBadge = allWin ? '3W' : allLoss ? '3L' : null;

                return (
                  <>
                    <View style={s.recentHeader}>
                      <ThemedText style={[s.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>COMPLETED</ThemedText>
                      {streakBadge && (
                        <View style={[s.miniStreakBadge, { backgroundColor: allWin ? '#22C55E18' : '#EF444418' }]}>
                          <ThemedText style={[s.miniStreakText, { color: allWin ? '#22C55E' : '#EF4444' }]}>
                            {streakBadge}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
                      {completed.map((game, index) => {
                        const isWin = game.score?.startsWith('W');
                        const isLoss = game.score?.startsWith('L');
                        const scoreDisplay = game.score?.replace('-', '\u2013') ?? '';
                        return (
                          <View key={game.id}>
                            {index > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                            <GameCard
                              game={game}
                              colors={colors}
                              onPrimaryPress={() => handlePrimaryPress(game)}
                              onLogoPress={(team) => handleLogoPress(game, team)}
                              onLogoLongPress={(team) => handleLogoLongPress(game, team)}
                            >
                              <View style={s.completedCardBody}>
                                <View style={{ flex: 1 }}>
                                  <ThemedText style={[s.recentOpponent, { color: colors.text }]}>
                                    {game.location === 'Home' ? 'vs' : '@'} {game.opponent}{game.opponentKR ? ` (${game.opponentKR})` : ''}
                                  </ThemedText>
                                  {game.opponentRecord && (
                                    <ThemedText style={[s.recentMeta, { color: colors.textTertiary }]}>
                                      {game.opponentRecord}
                                    </ThemedText>
                                  )}
                                  <ThemedText style={[s.recentMeta, { color: colors.textTertiary }]}>
                                    {game.date} · {game.gameType ?? 'NON-CONF'} · {game.venue ?? game.location}
                                  </ThemedText>
                                  {(() => { const sw = 50 + (confHash(game.opponent ?? '') % 30); return (
                                    <Text style={{ fontSize: 11, fontWeight: '600', color: sw >= 50 ? '#22C55E' : '#EF4444', marginTop: 2 }}>Sim {sw}%</Text>
                                  ); })()}
                                </View>
                                <View style={s.recentRight}>
                                  <View style={[s.recentPill, { backgroundColor: '#FFFFFF18' }]}>
                                    <ThemedText style={[s.recentPillText, { color: '#FFFFFF' }]}>FINAL</ThemedText>
                                  </View>
                                  <ThemedText style={[s.recentScore, { color: isWin ? '#FFFFFF' : isLoss ? '#EF4444' : colors.text }]}>
                                    {scoreDisplay}
                                  </ThemedText>
                                </View>
                              </View>
                            </GameCard>
                          </View>
                        );
                      })}
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* ── Standings Tab ── */}
          {activeTab === 'standings' && (() => {
            const hashStr = (str: string) => { let h = 0; for (let i = 0; i < str.length; i++) h = ((h << 5) - h + str.charCodeAt(i)) | 0; return Math.abs(h); };

            // ── Mock data ──

            const MOCK_TEAM_NAMES = [
              'Montana Tech', 'MSU-Northern', 'Montana Tech', 'Providence', 'Valley City',
              'Rocky Mtn', 'Dakota St', 'Bellevue', 'Dickinson', 'Mayville St',
              'Riverside', 'Summit Valley', 'Pinehurst', 'Oakdale', 'Brookfield',
            ];

            const generateDivisionStandings = (divisionId: string) => {
              return MOCK_TEAM_NAMES.map((team) => {
                const h = hashStr(divisionId + team);
                const overallW = 10 + (h % 16);
                const overallL = 4 + ((h >> 4) % 14);
                const confW = Math.min(overallW, 3 + ((h >> 2) % 10));
                const confL = Math.min(overallL, 1 + ((h >> 6) % 7));
                const streaks = ['W1','W2','W3','W4','L1','L2','L3'];
                const streak = streaks[(h >> 8) % streaks.length];
                const kr = 55 + ((h >> 3) % 35);
                const trend = (h % 5 === 0) ? (1 + ((h >> 4) % 4)) : (h % 3 === 0) ? -(1 + ((h >> 4) % 3)) : 0;
                return { rank: 0, team, confW, confL, overallW, overallL, streak, kr, trend };
              }).sort((a, b) => b.overallW - a.overallW || a.overallL - b.overallL)
                .map((r, i) => ({ ...r, rank: i + 1 }));
            };

            const NAIA_POLL = [
              { rank: 1, team: 'Loyola (LA)', record: '22-2', prev: 1 },
              { rank: 2, team: 'College of Idaho', record: '21-3', prev: 2 },
              { rank: 3, team: 'Oklahoma City', record: '20-3', prev: 4 },
              { rank: 4, team: 'Life Pacific', record: '20-4', prev: 3 },
              { rank: 5, team: 'Benedictine (KS)', record: '19-4', prev: 8 },
              { rank: 6, team: 'Freed-Hardeman', record: '19-4', prev: 6 },
              { rank: 7, team: 'Georgetown (KY)', record: '18-5', prev: 5 },
              { rank: 8, team: 'William Penn', record: '18-5', prev: 9 },
              { rank: 9, team: 'Summit', record: '18-5', prev: 7 },
              { rank: 10, team: 'Carroll (MT)', record: '19-4', prev: 10 },
              { rank: 11, team: 'Olivet Nazarene', record: '18-5', prev: 12 },
              { rank: 12, team: 'Concordia (NE)', record: '18-5', prev: 11 },
              { rank: 13, team: 'Northside (IN)', record: '17-6', prev: 14 },
              { rank: 14, team: 'Jamestown', record: '17-5', prev: 16 },
              { rank: 15, team: 'MidAmerica Nazarene', record: '17-6', prev: 13 },
              { rank: 16, team: 'Science & Arts (OK)', record: '17-6', prev: 15 },
              { rank: 17, team: 'Campbellsville', record: '16-6', prev: 18 },
              { rank: 18, team: 'Marian (IN)', record: '16-7', prev: 17 },
              { rank: 19, team: 'Wayland Baptist', record: '16-6', prev: 20 },
              { rank: 20, team: 'IU South Bend', record: '16-7', prev: 22 },
              { rank: 21, team: 'Thomas More', record: '16-7', prev: 19 },
              { rank: 22, team: 'Vanguard', record: '15-7', prev: 21 },
              { rank: 23, team: 'Cornerstone', record: '15-7', prev: 24 },
              { rank: 24, team: 'Grace (IN)', record: '15-7', prev: 23 },
              { rank: 25, team: 'Lindsey Wilson', record: '15-8', prev: 25 },
            ];

            const KR_NATIONAL = [
              { rank: 1, team: 'Loyola (LA)', kr: 91, trend: 2 },
              { rank: 2, team: 'College of Idaho', kr: 89, trend: 0 },
              { rank: 3, team: 'Oklahoma City', kr: 88, trend: 1 },
              { rank: 4, team: 'Life Pacific', kr: 87, trend: -1 },
              { rank: 5, team: 'Benedictine (KS)', kr: 86, trend: 3 },
              { rank: 6, team: 'Freed-Hardeman', kr: 85, trend: 0 },
              { rank: 7, team: 'Georgetown (KY)', kr: 84, trend: -2 },
              { rank: 8, team: 'William Penn', kr: 84, trend: 1 },
              { rank: 9, team: 'Lindsey Wilson', kr: 83, trend: 0 },
              { rank: 10, team: 'Westmont', kr: 82, trend: 4 },
              { rank: 11, team: 'Carroll (MT)', kr: 82, trend: -1 },
              { rank: 12, team: 'Olivet Nazarene', kr: 81, trend: 2 },
              { rank: 13, team: 'Concordia (NE)', kr: 81, trend: 0 },
              { rank: 14, team: 'Northside (IN)', kr: 80, trend: 3 },
              { rank: 15, team: 'Jamestown', kr: 80, trend: 1 },
              { rank: 16, team: 'MidAmerica Nazarene', kr: 79, trend: -2 },
              { rank: 17, team: 'Science & Arts (OK)', kr: 79, trend: 0 },
              { rank: 18, team: 'Campbellsville', kr: 78, trend: 1 },
              { rank: 19, team: 'Marian (IN)', kr: 78, trend: -1 },
              { rank: 20, team: 'Wayland Baptist', kr: 77, trend: 2 },
              { rank: 21, team: 'IU South Bend', kr: 77, trend: 0 },
              { rank: 22, team: 'Thomas More', kr: 76, trend: -3 },
              { rank: 23, team: 'Vanguard', kr: 76, trend: 1 },
              { rank: 24, team: 'Cornerstone', kr: 75, trend: 0 },
              { rank: 25, team: 'Grace (IN)', kr: 75, trend: -1 },
              { rank: 38, team: 'Carroll College', kr: 74, trend: 3 },
            ];

            const KR_CONF = KaNeXT_STANDINGS.map((row) => {
              const h = hashStr(row.team);
              const kr = row.team === 'Carroll College' ? 74 : 58 + (h % 28);
              const trend = row.team === 'Carroll College' ? 3 : h % 5 === 0 ? (1 + ((h >> 4) % 4)) : h % 3 === 0 ? -(1 + ((h >> 4) % 3)) : 0;
              return { rank: 0, team: row.team, kr, trend };
            }).sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 }));

            // ── Global mock data ──

            const GLOBAL_COUNTRIES = [
              { code: 'ES', name: 'Spain' }, { code: 'FR', name: 'France' },
              { code: 'AU', name: 'Australia' }, { code: 'PH', name: 'Philippines' },
              { code: 'CA', name: 'Canada' }, { code: 'RS', name: 'Serbia' },
              { code: 'LT', name: 'Lithuania' }, { code: 'DE', name: 'Germany' },
              { code: 'IT', name: 'Italy' }, { code: 'GR', name: 'Greece' },
              { code: 'TR', name: 'Turkey' }, { code: 'BR', name: 'Brazil' },
              { code: 'AR', name: 'Argentina' }, { code: 'NG', name: 'Nigeria' },
              { code: 'SN', name: 'Senegal' },
            ];

            const GLOBAL_LEAGUES: { id: string; name: string; country: string }[] = [
              { id: 'acb', name: 'Liga ACB', country: 'ES' },
              { id: 'lnb', name: 'LNB Pro A', country: 'FR' },
              { id: 'nbl', name: 'NBL', country: 'AU' },
              { id: 'pba', name: 'PBA', country: 'PH' },
              { id: 'cebl', name: 'CEBL', country: 'CA' },
              { id: 'aba', name: 'ABA Liga', country: 'RS' },
              { id: 'lkl', name: 'LKL', country: 'LT' },
              { id: 'bbl', name: 'BBL', country: 'DE' },
              { id: 'lba', name: 'Lega Basket Serie A', country: 'IT' },
              { id: 'gbl', name: 'GBL A1', country: 'GR' },
              { id: 'bsl', name: 'BSL', country: 'TR' },
              { id: 'nbb', name: 'NBB', country: 'BR' },
              { id: 'lnb_ar', name: 'LNB Argentina', country: 'AR' },
              { id: 'nbl_ng', name: 'NBL Nigeria', country: 'NG' },
              { id: 'nbl_sn', name: 'NBL Senegal', country: 'SN' },
            ];

            const generateLeagueStandings = (leagueId: string) => {
              const leagueTeamNames = [
                'Olimpia', 'Dynamo', 'Real', 'Partizan', 'Fenerbahce',
                'Maccabi', 'Panathinaikos', 'CSKA', 'Virtus', 'Barcelona',
                'Zalgiris', 'Monaco', 'Bayern', 'Anadolu', 'Estrella',
              ];
              return leagueTeamNames.map((team) => {
                const h = hashStr(leagueId + team);
                const overallW = 8 + (h % 18);
                const overallL = 3 + ((h >> 4) % 15);
                const confW = Math.min(overallW, 2 + ((h >> 2) % 12));
                const confL = Math.min(overallL, 1 + ((h >> 6) % 8));
                const streaks = ['W1','W2','W3','W4','L1','L2','L3'];
                const streak = streaks[(h >> 8) % streaks.length];
                const kr = 50 + ((h >> 3) % 40);
                const trend = (h % 5 === 0) ? (1 + ((h >> 4) % 4)) : (h % 3 === 0) ? -(1 + ((h >> 4) % 3)) : 0;
                return { rank: 0, team, confW, confL, overallW, overallL, streak, kr, trend };
              }).sort((a, b) => b.overallW - a.overallW || a.overallL - b.overallL)
                .map((r, i) => ({ ...r, rank: i + 1 }));
            };

            const generateCountryKR = (countryCode: string) => {
              const names = [
                'United FC', 'Metro Stars', 'Capital BC', 'Northern Tigers', 'Coastal Eagles',
                'Southern Hawks', 'Valley Kings', 'Embry-Riddles', 'Central Blazers', 'Eastern Force',
              ];
              return names.map((team) => {
                const h = hashStr(countryCode + team);
                const kr = 45 + ((h >> 3) % 45);
                const trend = (h % 5 === 0) ? (1 + ((h >> 4) % 4)) : (h % 3 === 0) ? -(1 + ((h >> 4) % 3)) : 0;
                return { rank: 0, team, kr, trend };
              }).sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 }));
            };

            const KR_WORLD = [
              { rank: 1, team: 'Real Madrid', kr: 95, trend: 0 },
              { rank: 2, team: 'Barcelona', kr: 94, trend: 1 },
              { rank: 3, team: 'Fenerbahce', kr: 92, trend: -1 },
              { rank: 4, team: 'Olympiacos', kr: 91, trend: 2 },
              { rank: 5, team: 'Partizan', kr: 90, trend: 0 },
              { rank: 6, team: 'Anadolu Efes', kr: 89, trend: -2 },
              { rank: 7, team: 'Maccabi Tel Aviv', kr: 88, trend: 1 },
              { rank: 8, team: 'Virtus Bologna', kr: 87, trend: 3 },
              { rank: 9, team: 'Monaco', kr: 87, trend: 0 },
              { rank: 10, team: 'Bayern Munich', kr: 86, trend: -1 },
              { rank: 11, team: 'Zalgiris', kr: 85, trend: 2 },
              { rank: 12, team: 'Panathinaikos', kr: 85, trend: 0 },
              { rank: 13, team: 'CSKA Moscow', kr: 84, trend: -3 },
              { rank: 14, team: 'Baskonia', kr: 83, trend: 1 },
              { rank: 15, team: 'Alba Berlin', kr: 82, trend: 0 },
              { rank: 16, team: 'Joventut', kr: 81, trend: 2 },
              { rank: 17, team: 'Valencia', kr: 81, trend: -1 },
              { rank: 18, team: 'ASVEL', kr: 80, trend: 0 },
              { rank: 19, team: 'Melbourne United', kr: 79, trend: 1 },
              { rank: 20, team: 'San Miguel Beermen', kr: 78, trend: 0 },
            ];

            // ── Helpers ──

            const trendDisplay = (t: number) => {
              if (t > 0) return { text: `\u25B2 ${t}`, color: '#22C55E' };
              if (t < 0) return { text: `\u25BC ${Math.abs(t)}`, color: '#EF4444' };
              return { text: '\u2014', color: colors.textTertiary };
            };

            const divisionChips: { id: string; label: string }[] = [];
            for (const body of GOVERNING_BODIES) {
              if (body.divisions) {
                for (const div of body.divisions) {
                  divisionChips.push({ id: div.id, label: `${body.label} ${div.label}` });
                }
              } else {
                divisionChips.push({ id: body.id, label: body.label });
              }
            }

            const sectionLabel = standingsView === 'conference'
              ? 'SUN CONFERENCE'
              : standingsView === 'national'
                ? 'NAIA'
                : selectedDivisions.length > 0
                  ? selectedDivisions.map(id => (divisionChips.find((c) => c.id === id)?.label ?? '').toUpperCase()).join('  /  ')
                  : '';

            const divStandings = standingsView === 'division' && selectedDivisions.length > 0
              ? selectedDivisions.flatMap(id => generateDivisionStandings(id).map(r => ({ ...r, divId: id })))
              : [];

            const filteredLeagues = selectedCountry
              ? GLOBAL_LEAGUES.filter((l) => l.country === selectedCountry)
              : GLOBAL_LEAGUES;

            // ── Renderers ──

            const renderKRTable = (krData: { rank: number; team: string; kr: number; trend: number }[], showFmuGap: boolean) => (
              <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[s.krHeaderRow, { borderBottomColor: colors.divider, backgroundColor: colors.backgroundSecondary }]}>
                  <ThemedText style={[s.krHeaderRank, { color: colors.textTertiary }]}>#</ThemedText>
                  <ThemedText style={[s.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>KR</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>TREND</ThemedText>
                </View>
                {krData.map((row, index) => {
                  const isFmu = row.team === 'Carroll College';
                  const showGap = showFmuGap && index === krData.length - 1 && row.rank > 10;
                  const td = trendDisplay(row.trend);
                  const isExpanded = expandedKRTeam === row.team;
                  const h = hashStr(row.team);
                  const offKR = Math.min(100, Math.max(0, Math.round(row.kr * 0.53 + h % 5)));
                  const defKR = Math.min(100, Math.max(0, Math.round(row.kr * 0.47 + h % 4)));
                  return (
                    <View key={`${index}-${row.team}`}>
                      {isFmu && <View style={[s.krFmuDivider, { backgroundColor: colors.text + '20' }]} />}
                      {!isFmu && index > 0 && !showGap && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                      {showGap && (
                        <View style={[s.krGapRow, { borderColor: colors.divider }]}>
                          <ThemedText style={[s.krGapText, { color: colors.textTertiary }]}>{'\u00B7\u00B7\u00B7'}</ThemedText>
                        </View>
                      )}
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setExpandedKRTeam(isExpanded ? null : row.team);
                        }}
                        style={[s.krRow, isFmu && { backgroundColor: colors.text + '0A' }]}
                      >
                        <ThemedText style={[s.krRankNum, { color: isFmu ? colors.text : colors.textTertiary }]}>{row.rank}</ThemedText>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[s.krTeamName, { color: colors.text, fontWeight: isFmu ? '700' : '500' }]}>{row.team}</ThemedText>
                        </View>
                        <ThemedText style={[s.krScore, { color: isFmu ? colors.text : colors.textSecondary }]}>{row.kr}</ThemedText>
                        <ThemedText style={[s.krTrend, { color: td.color }]}>{td.text}</ThemedText>
                      </Pressable>
                      {isExpanded && (
                        <View style={{ flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 6, paddingLeft: Spacing.md + 38, gap: 20, backgroundColor: colors.backgroundSecondary }}>
                          <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Off KR: <ThemedText style={{ fontWeight: '700', color: colors.text }}>{offKR}</ThemedText></ThemedText>
                          <ThemedText style={{ fontSize: 12, color: colors.textSecondary }}>Def KR: <ThemedText style={{ fontWeight: '700', color: colors.text }}>{defKR}</ThemedText></ThemedText>
                        </View>
                      )}
                      {isFmu && index < krData.length - 1 && <View style={[s.krFmuDivider, { backgroundColor: colors.text + '20' }]} />}
                    </View>
                  );
                })}
              </View>
            );

            const renderTraditionalConfTable = (rows: { team: string; confW: number; confL: number; overallW: number; overallL: number; streak: string }[]) => (
              <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[s.standingsHeaderRow, { borderBottomColor: colors.divider }]}>
                  <ThemedText style={[s.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>CONF</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>OVR</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>STK</ThemedText>
                </View>
                {rows.map((row, index) => {
                  const isFmu = row.team === 'Carroll College';
                  return (
                    <View key={`${index}-${row.team}`}>
                      {index > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                      <View style={[s.standingsRow, isFmu && { backgroundColor: colors.text + '08' }]}>
                        <View style={s.standingsTeamCol}>
                          <ThemedText style={[s.standingsRank, { color: colors.textTertiary }]}>{index + 1}</ThemedText>
                          <ThemedText style={[s.standingsTeamName, { color: colors.text, fontWeight: isFmu ? '700' : '500' }]}>{row.team}</ThemedText>
                        </View>
                        <ThemedText style={[s.standingsRecord, { color: colors.text }]}>{row.confW}-{row.confL}</ThemedText>
                        <ThemedText style={[s.standingsRecord, { color: colors.textSecondary }]}>{row.overallW}-{row.overallL}</ThemedText>
                        <ThemedText style={[s.standingsStreak, { color: row.streak.startsWith('W') ? '#22C55E' : '#EF4444' }]}>{row.streak}</ThemedText>
                      </View>
                    </View>
                  );
                })}
              </View>
            );

            const renderPollTable = (rows: { rank: number; team: string; record: string; prev: number }[]) => (
              <View style={[s.card, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={[s.standingsHeaderRow, { borderBottomColor: colors.divider }]}>
                  <ThemedText style={[s.krHeaderRank, { color: colors.textTertiary }]}>#</ThemedText>
                  <ThemedText style={[s.standingsTeamHeader, { color: colors.textTertiary }]}>TEAM</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>REC</ThemedText>
                  <ThemedText style={[s.standingsColHeader, { color: colors.textTertiary }]}>PV</ThemedText>
                </View>
                {rows.map((row, index) => (
                  <View key={row.team}>
                    {index > 0 && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
                    <View style={s.standingsRow}>
                      <View style={s.standingsTeamCol}>
                        <ThemedText style={[s.standingsRank, { color: colors.textTertiary }]}>{row.rank}</ThemedText>
                        <ThemedText style={[s.standingsTeamName, { color: colors.text }]}>{row.team}</ThemedText>
                      </View>
                      <ThemedText style={[s.standingsRecord, { color: colors.text }]}>{row.record}</ThemedText>
                      <ThemedText style={[s.standingsRecord, { color: colors.textTertiary }]}>{row.prev}</ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            );

            const renderEmptyState = (title: string, subtitle: string, cta?: string, onCta?: () => void) => (
              <View style={[s.card, { backgroundColor: colors.backgroundSecondary, padding: 32, alignItems: 'center', gap: 8 }]}>
                <IconSymbol name="chart.bar.xaxis" size={28} color={colors.textTertiary} />
                <ThemedText style={{ fontSize: 16, fontWeight: '700', color: colors.text, textAlign: 'center' }}>{title}</ThemedText>
                <ThemedText style={{ fontSize: 13, color: colors.textTertiary, textAlign: 'center' }}>{subtitle}</ThemedText>
                {cta && onCta && (
                  <Pressable
                    style={{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14, backgroundColor: Brand.primary }}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCta(); }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>{cta}</Text>
                  </Pressable>
                )}
              </View>
            );

            // ── Row C labels ──
            const collegeScopes = ['conference', 'division', 'national'] as const;
            const globalScopes = ['country', 'league', 'world'] as const;

            return (
              <View>
                {/* Row A — Type */}
                <View style={s.standingsToggleRow}>
                  {(['traditional', 'kr'] as const).map((m) => {
                    const active = standingsMode === m;
                    return (
                      <Pressable
                        key={m}
                        style={[s.standingsTogglePill, { backgroundColor: active ? colors.text + 'E0' : colors.backgroundSecondary }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStandingsMode(m); setExpandedKRTeam(null); }}
                      >
                        <ThemedText style={[s.standingsToggleText, { color: active ? colors.background : colors.textSecondary }]}>
                          {m === 'traditional' ? 'Traditional' : 'KR Rating'}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* Row B — Universe */}
                <View style={s.krScopeRow}>
                  {(['college', 'global'] as const).map((sc) => {
                    const active = standingsScope === sc;
                    return (
                      <Pressable
                        key={sc}
                        style={[s.krScopePill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setStandingsScope(sc);
                          setExpandedKRTeam(null);
                          // Reset Row C to default for new universe
                          if (sc === 'college') setStandingsView('conference');
                          if (sc === 'global') setGlobalView('country');
                        }}
                      >
                        <ThemedText style={[s.krScopePillText, { color: active ? colors.background : colors.textSecondary }]}>
                          {sc === 'college' ? 'College' : 'Global'}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>

                {/* ═══ COLLEGE UNIVERSE ═══ */}
                {standingsScope === 'college' && (
                  <View>
                    {/* Row C — College context */}
                    <View style={s.krScopeRow}>
                      {collegeScopes.map((v) => {
                        const active = standingsView === v;
                        return (
                          <Pressable
                            key={v}
                            style={[s.krScopePill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setStandingsView(v); setExpandedKRTeam(null); }}
                          >
                            <ThemedText style={[s.krScopePillText, { color: active ? colors.background : colors.textSecondary }]}>
                              {v === 'conference' ? 'Conference' : v === 'division' ? 'Division' : 'National'}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* Division selector chips */}
                    {standingsView === 'division' && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm }}>
                        {divisionChips.map((chip) => {
                          const active = selectedDivisions.includes(chip.id);
                          return (
                            <Pressable
                              key={chip.id}
                              style={[s.krScopePill, { backgroundColor: active ? Brand.primary : colors.backgroundSecondary }]}
                              onPress={() => {
                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                setSelectedDivisions(prev => active ? prev.filter(id => id !== chip.id) : [...prev, chip.id]);
                                setExpandedKRTeam(null);
                              }}
                            >
                              <ThemedText style={[s.krScopePillText, { color: active ? '#fff' : colors.textSecondary }]}>
                                {chip.label}
                              </ThemedText>
                            </Pressable>
                          );
                        })}
                      </View>
                    )}

                    {/* College content */}
                    {standingsView === 'division' && selectedDivisions.length === 0 ? (
                      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                        <ThemedText style={{ fontSize: 14, color: colors.textTertiary }}>Select a division</ThemedText>
                      </View>
                    ) : (
                      <>
                        {sectionLabel !== '' && (
                          <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>{sectionLabel}</ThemedText>
                        )}

                        {standingsMode === 'traditional' && (
                          <>
                            {standingsView === 'conference' && renderTraditionalConfTable(KaNeXT_STANDINGS)}
                            {standingsView === 'division' && selectedDivisions.length > 0 && renderTraditionalConfTable(divStandings)}
                            {standingsView === 'national' && renderPollTable(NAIA_POLL)}
                          </>
                        )}

                        {standingsMode === 'kr' && (
                          <>
                            {standingsView === 'conference' && renderKRTable(KR_CONF, false)}
                            {standingsView === 'division' && selectedDivisions.length > 0 && (() => {
                              const divKR = divStandings.map((r) => ({
                                rank: r.rank, team: r.team, kr: r.kr, trend: r.trend,
                              })).sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 }));
                              return renderKRTable(divKR, false);
                            })()}
                            {standingsView === 'national' && renderKRTable(KR_NATIONAL, true)}
                          </>
                        )}
                      </>
                    )}
                  </View>
                )}

                {/* ═══ GLOBAL UNIVERSE ═══ */}
                {standingsScope === 'global' && (
                  <View>
                    {/* Row C — Global context */}
                    <View style={s.krScopeRow}>
                      {globalScopes.map((v) => {
                        const active = globalView === v;
                        return (
                          <Pressable
                            key={v}
                            style={[s.krScopePill, { backgroundColor: active ? colors.text : colors.backgroundSecondary }]}
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setGlobalView(v); setExpandedKRTeam(null); }}
                          >
                            <ThemedText style={[s.krScopePillText, { color: active ? colors.background : colors.textSecondary }]}>
                              {v === 'country' ? 'Country' : v === 'league' ? 'League' : 'World'}
                            </ThemedText>
                          </Pressable>
                        );
                      })}
                    </View>

                    {/* ── Global → Country ── */}
                    {globalView === 'country' && (
                      <View>
                        {/* Country picker */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm }}>
                          {GLOBAL_COUNTRIES.map((c) => {
                            const active = selectedCountry === c.code;
                            return (
                              <Pressable
                                key={c.code}
                                style={[s.krScopePill, { backgroundColor: active ? Brand.primary : colors.backgroundSecondary }]}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setSelectedCountry(active ? null : c.code);
                                  setSelectedLeague(null);
                                  setExpandedKRTeam(null);
                                }}
                              >
                                <ThemedText style={[s.krScopePillText, { color: active ? '#fff' : colors.textSecondary }]}>
                                  {c.name}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>

                        {!selectedCountry ? (
                          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <ThemedText style={{ fontSize: 14, color: colors.textTertiary }}>Select a country</ThemedText>
                          </View>
                        ) : standingsMode === 'kr' ? (
                          <>
                            <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
                              {GLOBAL_COUNTRIES.find((c) => c.code === selectedCountry)?.name.toUpperCase() ?? ''} BY KR
                            </ThemedText>
                            {renderKRTable(generateCountryKR(selectedCountry), false)}
                          </>
                        ) : (
                          /* Traditional + Country: need a league */
                          (() => {
                            const countryLeagues = GLOBAL_LEAGUES.filter((l) => l.country === selectedCountry);
                            if (selectedLeague) {
                              const league = countryLeagues.find((l) => l.id === selectedLeague);
                              return (
                                <>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary, marginBottom: 0 }]}>
                                      {league?.name.toUpperCase() ?? ''}
                                    </ThemedText>
                                    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedLeague(null); }}>
                                      <ThemedText style={{ fontSize: 12, fontWeight: '600', color: Brand.primary }}>Change</ThemedText>
                                    </Pressable>
                                  </View>
                                  {renderTraditionalConfTable(generateLeagueStandings(selectedLeague))}
                                </>
                              );
                            }
                            return (
                              <View>
                                <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>CHOOSE A LEAGUE</ThemedText>
                                {countryLeagues.length > 0 ? countryLeagues.map((l) => (
                                  <Pressable
                                    key={l.id}
                                    style={[s.krScopePill, { backgroundColor: colors.backgroundSecondary, marginBottom: 6, alignSelf: 'flex-start' }]}
                                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedLeague(l.id); }}
                                  >
                                    <ThemedText style={[s.krScopePillText, { color: colors.text }]}>{l.name}</ThemedText>
                                  </Pressable>
                                )) : (
                                  renderEmptyState('No leagues available', 'No league data for this country yet.')
                                )}
                              </View>
                            );
                          })()
                        )}
                      </View>
                    )}

                    {/* ── Global → League ── */}
                    {globalView === 'league' && (
                      <View>
                        {/* League picker */}
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm }}>
                          {filteredLeagues.map((l) => {
                            const active = selectedLeague === l.id;
                            return (
                              <Pressable
                                key={l.id}
                                style={[s.krScopePill, { backgroundColor: active ? Brand.primary : colors.backgroundSecondary }]}
                                onPress={() => {
                                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                  setSelectedLeague(active ? null : l.id);
                                  setExpandedKRTeam(null);
                                }}
                              >
                                <ThemedText style={[s.krScopePillText, { color: active ? '#fff' : colors.textSecondary }]}>
                                  {l.name}
                                </ThemedText>
                              </Pressable>
                            );
                          })}
                        </View>

                        {!selectedLeague ? (
                          <View style={{ paddingVertical: 24, alignItems: 'center' }}>
                            <ThemedText style={{ fontSize: 14, color: colors.textTertiary }}>Select a league</ThemedText>
                          </View>
                        ) : (() => {
                          const league = GLOBAL_LEAGUES.find((l) => l.id === selectedLeague);
                          const leagueStandings = generateLeagueStandings(selectedLeague);
                          return (
                            <>
                              <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
                                {league?.name.toUpperCase() ?? ''}
                              </ThemedText>
                              {standingsMode === 'traditional'
                                ? renderTraditionalConfTable(leagueStandings)
                                : renderKRTable(
                                    leagueStandings.map((r) => ({ rank: r.rank, team: r.team, kr: r.kr, trend: r.trend }))
                                      .sort((a, b) => b.kr - a.kr).map((r, i) => ({ ...r, rank: i + 1 })),
                                    false,
                                  )
                              }
                            </>
                          );
                        })()}
                      </View>
                    )}

                    {/* ── Global → World ── */}
                    {globalView === 'world' && (
                      <View>
                        {standingsMode === 'traditional' ? (
                          renderEmptyState(
                            'World standings require a league table.',
                            'Select a league to view traditional standings.',
                            'Select League',
                            () => { setGlobalView('league'); },
                          )
                        ) : (
                          <>
                            <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>TOP WORLDWIDE BY KR</ThemedText>
                            {renderKRTable(KR_WORLD, false)}
                          </>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>
            );
          })()}

          {/* ── News Tab ── */}
          {activeTab === 'news' && (
            <View style={s.newsFeed}>
              {KaNeXT_NEWS.length > 0 ? (
                KaNeXT_NEWS.map((item) => {
                  const isHighlights = item.type === 'Highlights';
                  return (
                    <View
                      key={item.id}
                      style={[s.newsCard, { backgroundColor: colors.backgroundSecondary }]}
                    >
                      {/* Video Hero */}
                      <View style={s.newsHero}>
                        <View style={s.newsPlayCircle}>
                          <IconSymbol name="play.fill" size={22} color="#fff" />
                        </View>
                        {/* Type Badge */}
                        <View style={[
                          s.newsTypeBadge,
                          { backgroundColor: isHighlights ? 'rgba(255,180,0,0.9)' : 'rgba(0,0,0,0.65)' },
                        ]}>
                          <Text style={[
                            s.newsTypeBadgeText,
                            { color: isHighlights ? '#000' : '#fff' },
                          ]}>
                            {item.type.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      {/* Headline + Date */}
                      <View style={s.newsBody}>
                        <ThemedText
                          style={[s.newsHeadline, { color: colors.text }]}
                          numberOfLines={2}
                        >
                          {item.headline}
                        </ThemedText>
                        <ThemedText style={[s.newsDate, { color: colors.textTertiary }]}>
                          {item.date}
                        </ThemedText>
                      </View>
                    </View>
                  );
                })
              ) : (
                /* Empty State */
                <View style={[s.newsEmptyCard, { backgroundColor: colors.backgroundSecondary }]}>
                  <IconSymbol name="newspaper.fill" size={32} color={colors.textTertiary} />
                  <ThemedText style={[s.newsEmptyTitle, { color: colors.text }]}>
                    No news yet
                  </ThemedText>
                  <ThemedText style={[s.newsEmptySubtitle, { color: colors.textTertiary }]}>
                    Upload your first recap or highlights
                  </ThemedText>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      )}

      {/* Game Team Context Sheet — replaces oppKRSheet for logo taps */}
      <GameTeamContextSheet
        visible={!!contextSheet}
        onClose={() => setContextSheet(null)}
        game={contextSheet?.game ?? null}
        team={contextSheet?.team ?? 'opponent'}
        colors={colors}
        router={router}
      />

      {/* Legacy Opponent KR Bottom Sheet (kept for backward compat) */}
      <BottomSheet visible={!!oppKRSheet} onClose={closeSheet} useModal>
        {oppKRSheet && (() => {
          const opp = oppKRSheet.opponent;
          const sheetGameId = oppKRSheet.gameId ?? '';
          const impact = oppKRSheet.gameStatus === 'final' && sheetGameId ? KaNeXT_GAME_IMPACT[sheetGameId] : null;
          const pregame = oppKRSheet.gameStatus === 'upcoming' && sheetGameId ? KaNeXT_PREGAME[sheetGameId] : null;

          return (
            <>
              {(() => {
                const sheetGame = sheetGameId ? KaNeXT_GAMES.find((g) => g.id === sheetGameId) : null;
                return (
                  <View style={{ alignItems: 'center', marginBottom: Spacing.md }}>
                    <ThemedText style={{ fontSize: 17, fontWeight: '700', color: colors.text }}>
                      {sheetGame ? `${sheetGame.location === 'Home' ? 'vs' : '@'} ` : ''}{opp}{oppKRSheet.kr ? ` (${oppKRSheet.kr})` : ''}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>{oppKRSheet.record}</ThemedText>
                    {sheetGame && (
                      <ThemedText style={{ fontSize: 12, color: colors.textTertiary, marginTop: 4 }}>
                        {sheetGame.date}{sheetGame.gameTime ? ` \u00B7 ${sheetGame.gameTime}` : ''} \u00B7 {sheetGame.gameType ?? 'NON-CONF'} \u00B7 {sheetGame.venue ?? sheetGame.location}
                      </ThemedText>
                    )}
                  </View>
                );
              })()}

              {impact ? (
                <>
                  {(() => {
                    const pg = sheetGameId ? KaNeXT_PREGAME[sheetGameId] : null;
                    const sm = oppKRSheet.score?.match(/(\d+)-(\d+)/);
                    const fmuS = sm ? parseInt(sm[1]) : 0;
                    const oppS = sm ? parseInt(sm[2]) : 0;
                    const isW = fmuS > oppS;
                    const actualMargin = fmuS - oppS;
                    const actualTotal = fmuS + oppS;
                    const spread = pg ? Math.round(pg.krGap * 0.4) : 0;
                    const spreadStr = spread > 0 ? `Carroll -${Math.abs(spread)}.5` : spread < 0 ? `Carroll +${Math.abs(spread)}.5` : 'PK';
                    const preWinPct = pg ? Math.min(92, Math.max(28, Math.round(50 + pg.krGap * 0.8))) : 50;
                    const ourKR = pg ? pg.oppKR + pg.krGap : 74;
                    const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                    const oppProj = pg ? Math.round(72 + (pg.oppKR - 60) * 0.3) : 72;
                    const preTotal = fmuProj + oppProj;
                    const simConf = pg ? Math.min(95, Math.max(55, Math.round(70 + Math.abs(pg.krGap) * 0.6))) : 70;
                    const projMargin = fmuProj - oppProj;
                    const miss = actualMargin - projMargin;
                    const atsMargin = actualMargin + (spread > 0 ? -spread - 0.5 : -spread + 0.5);
                    const atsCover = spread > 0 ? actualMargin > spread + 0.5 : actualMargin > spread - 0.5;
                    const atsStr = `${atsMargin > 0 ? '+' : ''}${atsMargin.toFixed(1)}`;
                    const ouDiff = actualTotal - (preTotal + 0.5);
                    const ouStr = `${actualTotal > preTotal + 0.5 ? 'Over' : 'Under'} (${ouDiff > 0 ? '+' : ''}${ouDiff.toFixed(1)})`;
                    return (
                      <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#0B0F14', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{spreadStr}</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{preWinPct}%</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>{preTotal}.5</Text>
                          </View>
                          <View style={{ alignItems: 'center' }}>
                            <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                            <Text style={{ fontSize: 13, fontWeight: '800', color: '#aaa' }}>Sim {simConf}%</Text>
                          </View>
                        </View>
                        <View style={{ backgroundColor: '#0B0F14', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: atsCover ? '#22C55E' : '#EF4444' }}>ATS: {atsStr}</Text>
                            <Text style={{ fontSize: 12, fontWeight: '700', color: actualTotal > preTotal + 0.5 ? accent : accent }}>O/U: {ouStr}</Text>
                          </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                          <Text style={{ fontSize: 11, color: '#888' }}>Pre Proj: <Text style={{ fontWeight: '700', color: '#ccc' }}>{fmuProj}\u2013{oppProj} ({projMargin > 0 ? '+' : ''}{projMargin})</Text></Text>
                          <Text style={{ fontSize: 11, color: '#888' }}>Actual: <Text style={{ fontWeight: '700', color: isW ? '#22C55E' : '#EF4444' }}>{fmuS}\u2013{oppS} ({actualMargin > 0 ? '+' : ''}{actualMargin})</Text></Text>
                        </View>
                        <Text style={{ fontSize: 11, color: '#888' }}>Miss: <Text style={{ fontWeight: '700', color: Math.abs(miss) <= 3 ? '#22C55E' : Math.abs(miss) <= 7 ? accent : '#EF4444' }}>{miss > 0 ? '+' : ''}{miss} pts</Text></Text>
                        <Text style={{ fontSize: 10, color: '#666', marginTop: 6, lineHeight: 14 }}>
                          {isW === (projMargin > 0) ? 'Model called it correctly' : `Model favored ${projMargin > 0 ? 'Carroll' : 'opponent'}`}; missed by {Math.abs(miss)} pts.
                        </Text>
                      </View>
                    );
                  })()}
                  <UnitsView
                    depthChart={DEPTH_CHART_BY_SEASON[CURRENT_SEASON]}
                    gameImpact={impact ?? undefined}
                    hideSystems
                    statLeaders={[...impact.starters, ...impact.bench]
                      .sort((a, b) => b.bpr - a.bpr)
                      .slice(0, 3)
                      .map((p) => ({ label: 'BPR', name: p.name.split(' ').slice(1).join(' ') || p.name, value: `${p.bpr > 0 ? '+' : ''}${p.bpr}` }))}
                  />
                </>
              ) : pregame ? (() => {
                const oppData = buildOpponentDepthChart(pregame);
                const oppSys = parseDNASystems(pregame.theirDNA);
                const threats = pregame.oppThreats ?? [];
                const oppStatLeaders = [
                  { label: 'PPG', name: threats[0]?.name.split(' ').slice(1).join(' ') ?? '\u2014', value: ((threats[0]?.kr ?? 60) * 0.28 + 3.5).toFixed(1) },
                  { label: 'RPG', name: threats[2]?.name.split(' ').slice(1).join(' ') ?? threats[1]?.name.split(' ').slice(1).join(' ') ?? '\u2014', value: ((threats[2]?.kr ?? threats[1]?.kr ?? 60) * 0.09 + 2.0).toFixed(1) },
                  { label: 'APG', name: threats[1]?.name.split(' ').slice(1).join(' ') ?? '\u2014', value: ((threats[1]?.kr ?? 60) * 0.06 + 1.5).toFixed(1) },
                ];
                return (
                  <>
                    {(() => {
                      const ourKR = pregame.oppKR + pregame.krGap;
                      const spread = Math.round(pregame.krGap * 0.4);
                      const spreadStr = spread > 0 ? `Carroll -${Math.abs(spread)}.5` : spread < 0 ? `Carroll +${Math.abs(spread)}.5` : 'PK';
                      const winPct = Math.min(92, Math.max(28, Math.round(50 + pregame.krGap * 0.8)));
                      const fmuProj = Math.round(72 + (ourKR - 60) * 0.3);
                      const oppProj = Math.round(72 + (pregame.oppKR - 60) * 0.3);
                      const simConf = Math.min(95, Math.max(55, Math.round(70 + Math.abs(pregame.krGap) * 0.6)));
                      const keys = (pregame.ourEdge ?? []).slice(0, 3);
                      return (
                        <View style={{ marginHorizontal: Spacing.lg, marginBottom: Spacing.md, backgroundColor: '#0B0F14', borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>LINE</Text>
                              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>{spreadStr}</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>WIN%</Text>
                              <Text style={{ fontSize: 14, fontWeight: '800', color: winPct >= 60 ? '#22C55E' : winPct <= 40 ? '#EF4444' : accent }}>{winPct}%</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>TOTAL</Text>
                              <Text style={{ fontSize: 14, fontWeight: '800', color: '#FFFFFF' }}>{fmuProj + oppProj}.5</Text>
                            </View>
                            <View style={{ alignItems: 'center' }}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#888', letterSpacing: 0.5, marginBottom: 2 }}>CONF</Text>
                              <View style={{ backgroundColor: `${accent}20`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 }}>
                                <Text style={{ fontSize: 13, fontWeight: '800', color: accent }}>Sim {simConf}%</Text>
                              </View>
                            </View>
                          </View>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0B0F14', borderRadius: 8, paddingVertical: 6, marginBottom: 10 }}>
                            <Text style={{ fontSize: 15, fontWeight: '800', color: fmuProj >= oppProj ? '#22C55E' : '#EF4444' }}>{fmuProj >= oppProj ? 'W' : 'L'} {fmuProj}\u2013{oppProj}</Text>
                          </View>
                          {keys.length > 0 && keys.map((key: string, i: number) => (
                            <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: i < keys.length - 1 ? 6 : 0 }}>
                              <Text style={{ fontSize: 12, fontWeight: '800', color: '#888', width: 18 }}>{i + 1})</Text>
                              <Text style={{ fontSize: 12, color: '#ccc', flex: 1, lineHeight: 17 }}>{key}</Text>
                            </View>
                          ))}
                        </View>
                      );
                    })()}
                    <UnitsView
                      depthChart={oppData.depthChart}
                      playerClusters={oppData.playerClusters}
                      playerPhysicals={oppData.playerPhysicals}
                      initialOffStyle={oppSys.off}
                      initialDefStyle={oppSys.def}
                      initialTempo={oppSys.tempo}
                      hideSystems
                      statLeaders={oppStatLeaders}
                    />
                  </>
                );
              })() : null}
            </>
          );
        })()}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// Styles
// =============================================================================

const s = StyleSheet.create({
  // Tab row
  tabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 16, gap: 6 },
  tabPill: { flex: 1, paddingVertical: 6, borderRadius: 18, alignItems: 'center' },
  tabText: { fontSize: 13, fontWeight: '600' },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 40 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: BorderRadius.md, paddingHorizontal: 12, paddingVertical: 10, gap: 8, marginBottom: Spacing.md },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },

  // Cards
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4 },
  opponentText: { fontSize: 15, fontWeight: '600' },
  metaText: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  dateTimeText: { fontSize: 14, fontWeight: '800', marginTop: 4 },

  // 3-zone game card
  gameCardRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 },
  logoZone: { width: 36, alignItems: 'center', justifyContent: 'center' },
  teamLogo: { width: 28, height: 28 },
  oppLetterCircle: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  oppLetterText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  // Completed card body
  completedCardBody: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },

  // Recent / completed styles
  recentHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  miniStreakBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginTop: Spacing.md },
  miniStreakText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  recentOpponent: { fontSize: 15, fontWeight: '600', letterSpacing: -0.2 },
  recentMeta: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  recentRight: { alignItems: 'flex-end', gap: 5, marginLeft: 12 },
  recentPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  recentPillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  recentScore: { fontSize: 15, fontWeight: '800' },

  // Standings
  standingsHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  standingsTeamHeader: { flex: 1, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  standingsColHeader: { width: 50, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center' },
  standingsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10 },
  standingsTeamCol: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  standingsRank: { fontSize: 13, fontWeight: '600', width: 24, textAlign: 'right' as const, fontVariant: ['tabular-nums'] as any },
  standingsTeamName: { fontSize: 14, fontWeight: '500' },
  standingsRecord: { width: 50, fontSize: 13, fontWeight: '500', textAlign: 'center', fontVariant: ['tabular-nums'] as any },
  standingsStreak: { width: 50, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  standingsToggleRow: { flexDirection: 'row', gap: 8, marginBottom: Spacing.sm },
  standingsTogglePill: { flex: 1, paddingVertical: 8, borderRadius: 18, alignItems: 'center' },
  standingsToggleText: { fontSize: 13, fontWeight: '600' },

  // KR
  krScopeRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  krScopePill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 },
  krScopePillText: { fontSize: 12, fontWeight: '600' },
  krHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  krHeaderRank: { width: 28, fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textAlign: 'right' as const, marginRight: 10 },
  krRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 9 },
  krRankNum: { width: 28, fontSize: 13, fontWeight: '600', textAlign: 'right' as const, marginRight: 10, fontVariant: ['tabular-nums'] as any },
  krTeamName: { fontSize: 14 },
  krScore: { width: 50, fontSize: 14, fontWeight: '700', textAlign: 'center', fontVariant: ['tabular-nums'] as any },
  krTrend: { width: 50, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  krFmuDivider: { height: 2 },
  krGapRow: { alignItems: 'center', paddingVertical: 4, borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },
  krGapText: { fontSize: 14, letterSpacing: 4 },

  // News
  newsFeed: { gap: Spacing.md },
  newsCard: { borderRadius: BorderRadius.lg, overflow: 'hidden' as const },
  newsHero: { height: 180, backgroundColor: '#111', justifyContent: 'center', alignItems: 'center' },
  newsPlayCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  newsTypeBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  newsTypeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  newsBody: { padding: 12 },
  newsHeadline: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
  newsDate: { fontSize: 12, fontWeight: '500', marginTop: 4 },
  newsEmptyCard: { borderRadius: BorderRadius.lg, padding: 40, alignItems: 'center', gap: 8 },
  newsEmptyTitle: { fontSize: 16, fontWeight: '700' },
  newsEmptySubtitle: { fontSize: 13, fontWeight: '500' },
});
