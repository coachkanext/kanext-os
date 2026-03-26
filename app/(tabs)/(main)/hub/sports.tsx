/**
 * Sports Hub — LU Men's Basketball operational center.
 * Tabs: Overview / Schedule / Scouting / Analytics
 * Roles: Coach / Fan (cycle via top-right pill)
 *
 * Overview:  season record banner, next game countdown, recent results, news
 * Schedule:  full season game list with filter pills
 * Scouting:  opponent intel (coach-gated), key players, counters
 * Analytics: team stats, per-player breakdown, KR intelligence
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView,
  StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView }  from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { hideFooter, showFooter, resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  PLAYERS, COACHING_STAFF, SEASON_SCHEDULE,
  TEAM_INFO, TEAM_KR, TEAM_SYSTEM, NEXT_GAME,
  SCOUT_HOWARD, RECRUITS_BOARD,
  getUpcomingGames, krTierColor,
  type Player, type Game,
} from '@/data/mock-sports-hub';

// Inline news items (no RECENT_NEWS export in mock)
const RECENT_NEWS = [
  { id: 'n1', headline: 'LU Clinches MEAC Regular Season Title After Wire-to-Wire Win', source: 'MEAC Sports', date: 'Mar 22' },
  { id: 'n2', headline: 'Marcus Johnson Named MEAC Player of the Week for Second Time This Season', source: 'Lincoln Athletics', date: 'Mar 20' },
  { id: 'n3', headline: 'Lions Set Program Record for Three-Pointers in Season Opener vs Savannah State', source: 'HBCU Gameday', date: 'Mar 1' },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const NAVY       = '#003A63';

type SportsTab  = 'Overview' | 'Schedule' | 'Scouting' | 'Analytics';
type SportsRole = 'Coach' | 'Fan';

const SCHEDULE_PILLS  = ['All', 'Home', 'Away', 'Conference', 'Upcoming'];
const ANALYTICS_PILLS = ['Team', 'Players', 'Advanced'];

function pillsForTab(tab: SportsTab, role: SportsRole): string[] {
  if (tab === 'Schedule')  return SCHEDULE_PILLS;
  if (tab === 'Analytics') return ANALYTICS_PILLS;
  return [];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRecord(): { wins: number; losses: number } {
  // Parse from TEAM_INFO.record "18-9"
  const parts = TEAM_INFO.record.split('-');
  return { wins: parseInt(parts[0], 10), losses: parseInt(parts[1], 10) };
}

function resultColor(result?: string): string {
  if (result === 'W') return '#5A8A6E';
  if (result === 'L') return '#B85C5C';
  return '#888';
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionTitle({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={[sc.sectionTitle, { color: C.secondary }]}>{title}</Text>
  );
}

function GameRow({ game, C }: { game: Game; C: ComponentColors }) {
  const isHome = game.location === 'H';
  const isNeutral = game.location === 'N';
  const played = !!game.result;
  return (
    <Pressable
      style={({ pressed }) => [
        sc.gameRow,
        { borderBottomColor: C.separator },
        pressed && { backgroundColor: C.surfacePressed },
      ]}
    >
      <View style={[sc.locBadge, { backgroundColor: isHome ? NAVY : isNeutral ? '#888' : C.surfacePressed }]}>
        <Text style={[sc.locText, { color: isHome || isNeutral ? '#fff' : C.secondary }]}>
          {isHome ? 'H' : isNeutral ? 'N' : 'A'}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[sc.gameOpp, { color: C.label }]} numberOfLines={1}>
          {game.opponent}
        </Text>
        <Text style={[sc.gameMeta, { color: C.secondary }]}>
          {game.date} · {game.time}
          {game.tv ? ` · ${game.tv}` : ''}
        </Text>
      </View>
      {played ? (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[sc.resultBadge, { color: resultColor(game.result) }]}>
            {game.result}
          </Text>
          <Text style={[sc.scoreText, { color: C.secondary }]}>
            {game.score}–{game.oppScore}
          </Text>
        </View>
      ) : (
        <IconSymbol name="chevron.right" size={12} color={C.muted} />
      )}
    </Pressable>
  );
}

function PlayerStatRow({
  player, rank, C,
}: { player: Player; rank: number; C: ComponentColors }) {
  const ppg = player.stats.ppg.toFixed(1);
  const rpg = player.stats.rpg.toFixed(1);
  const apg = player.stats.apg.toFixed(1);
  return (
    <View style={[sc.playerStatRow, { borderBottomColor: C.separator }]}>
      <Text style={[sc.rankNum, { color: C.muted }]}>{rank}</Text>
      <View style={[sc.avatar, { backgroundColor: `hsl(${player.hue},40%,30%)` }]}>
        <Text style={sc.avatarText}>{player.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[sc.playerName, { color: C.label }]} numberOfLines={1}>
          {player.name}
        </Text>
        <Text style={[sc.gameMeta, { color: C.secondary }]}>
          #{player.number} · {player.position}
        </Text>
      </View>
      <View style={sc.statCells}>
        {[{ v: ppg, l: 'PPG' }, { v: rpg, l: 'RPG' }, { v: apg, l: 'APG' }].map(s => (
          <View key={s.l} style={sc.statCell}>
            <Text style={[sc.statVal, { color: C.label }]}>{s.v}</Text>
            <Text style={[sc.statLbl, { color: C.muted }]}>{s.l}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SportsHubScreen() {
  const C       = useColors();
  const styles  = useMemo(() => makeStyles(C), [C]);
  const insets  = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<SportsTab>('Overview');
  const [role,      setRole]      = useState<SportsRole>('Coach');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(true);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(1)).current;

  const pills = pillsForTab(activeTab, role);
  const topBarH = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + (pills.length > 0 && pillsVisible ? PILL_ROW_H : 0) + 8;

  // Footer hide/show on scroll
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y   = e.nativeEvent.contentOffset.y;
    const dir = y - lastScrollY.current;
    lastScrollY.current = y;
    if (y < 40) { showFooter(); return; }
    if (dir > 4) hideFooter(); else if (dir < -4) showFooter();
  }, []);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const changeTab = useCallback((tab: SportsTab) => {
    setActiveTab(tab);
    setDropdownOpen(false);
    setSelectedPill('All');
    const newPills = pillsForTab(tab, role);
    const show = newPills.length > 0;
    Animated.timing(pillsAnim, {
      toValue: show ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [role, pillsAnim]);

  const togglePills = useCallback(() => {
    setPillsVisible(v => {
      Animated.timing(pillsAnim, {
        toValue: v ? 0 : 1,
        duration: 180,
        useNativeDriver: false,
      }).start();
      return !v;
    });
  }, [pillsAnim]);

  const cycleRole = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole(r => r === 'Coach' ? 'Fan' : 'Coach');
  }, []);

  // ── Derived data ──────────────────────────────────────────────────────────

  const { wins, losses } = useMemo(() => getRecord(), []);
  const upcoming = useMemo(() => getUpcomingGames().slice(0, 3), []);
  const nextGame = upcoming[0];
  const recentGames = useMemo(() =>
    SEASON_SCHEDULE.filter(g => g.result).slice(-3).reverse(), []);
  const starters = useMemo(() =>
    PLAYERS.filter(p => p.role === 'Starter').slice(0, 5), []);
  const headCoach = COACHING_STAFF.find(s => s.role === 'head-coach');

  // ── Schedule filter ───────────────────────────────────────────────────────

  const filteredGames = useMemo(() => {
    if (selectedPill === 'All')        return SEASON_SCHEDULE;
    if (selectedPill === 'Home')       return SEASON_SCHEDULE.filter(g => g.location === 'H');
    if (selectedPill === 'Away')       return SEASON_SCHEDULE.filter(g => g.location === 'A');
    if (selectedPill === 'Conference') return SEASON_SCHEDULE.filter(g => g.isConference);
    if (selectedPill === 'Upcoming')   return SEASON_SCHEDULE.filter(g => !g.result);
    return SEASON_SCHEDULE;
  }, [selectedPill]);

  // ── Tab: Overview ─────────────────────────────────────────────────────────

  const renderOverview = () => (
    <View style={{ gap: 12 }}>

      {/* Team banner */}
      <View style={[styles.teamBanner, { backgroundColor: NAVY }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.teamName}>LU Men's Basketball</Text>
          <Text style={styles.teamConf}>MEAC · John B. Anderson Arena</Text>
          <View style={styles.recordRow}>
            <Text style={styles.recordText}>{wins}–{losses}</Text>
            <View style={[styles.confBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Text style={styles.confBadgeText}>MEAC #2</Text>
            </View>
          </View>
        </View>
        <View style={styles.coachCircle}>
          <Text style={styles.coachInitials}>
            {headCoach?.name.split(' ').map(p => p[0]).join('') ?? 'HC'}
          </Text>
        </View>
      </View>

      {/* Next game card */}
      {nextGame && (
        <>
          <SectionTitle title="Next Game" C={C} />
          <Pressable style={[styles.nextGameCard, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
            <View style={[styles.locBadgeLg, { backgroundColor: nextGame.location === 'H' ? NAVY : C.surfacePressed }]}>
              <Text style={[styles.locTextLg, { color: nextGame.location === 'H' ? '#fff' : C.secondary }]}>
                {nextGame.location === 'H' ? 'HOME' : nextGame.location === 'N' ? 'NEUT' : 'AWAY'}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextOpp, { color: C.label }]}>{nextGame.opponent}</Text>
              <Text style={[styles.nextMeta, { color: C.secondary }]}>
                {nextGame.date} · {nextGame.time}
              </Text>
              <Text style={[styles.nextVenue, { color: C.muted }]}>{nextGame.venue}</Text>
            </View>
            {nextGame.tv && (
              <View style={[styles.tvBadge, { backgroundColor: '#1D9BF020' }]}>
                <Text style={[styles.tvText, { color: '#1D9BF0' }]}>{nextGame.tv}</Text>
              </View>
            )}
          </Pressable>
        </>
      )}

      {/* Recent results */}
      <SectionTitle title="Recent Results" C={C} />
      <View style={[styles.card, { backgroundColor: C.surface, overflow: 'hidden' }]}>
        {recentGames.map((g, i) => (
          <View key={g.id}
            style={[
              styles.resultRow,
              { borderBottomColor: C.separator },
              i === recentGames.length - 1 && { borderBottomWidth: 0 },
            ]}
          >
            <View style={[styles.resultBadge, { backgroundColor: resultColor(g.result) + '20' }]}>
              <Text style={[styles.resultLetter, { color: resultColor(g.result) }]}>
                {g.result}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.gameOpp, { color: C.label }]} numberOfLines={1}>
                vs {g.opponent}
              </Text>
              <Text style={[styles.gameMeta, { color: C.secondary }]}>{g.date}</Text>
            </View>
            <Text style={[styles.scoreChip, { color: resultColor(g.result) }]}>
              {g.score}–{g.oppScore}
            </Text>
          </View>
        ))}
      </View>

      {/* Season stats quick — derived from starters */}
      <SectionTitle title="Season Stats" C={C} />
      <View style={styles.statsRow}>
        {(() => {
          const sp = PLAYERS.filter(p => p.role === 'Starter');
          const ppg = (sp.reduce((s, p) => s + p.stats.ppg, 0) / Math.max(sp.length, 1)).toFixed(1);
          const rpg = (sp.reduce((s, p) => s + p.stats.rpg, 0) / Math.max(sp.length, 1)).toFixed(1);
          const apg = (sp.reduce((s, p) => s + p.stats.apg, 0) / Math.max(sp.length, 1)).toFixed(1);
          const fg  = (sp.reduce((s, p) => s + p.stats.fgPct, 0) / Math.max(sp.length, 1)).toFixed(1);
          return [
            { label: 'PPG', value: ppg },
            { label: 'RPG', value: rpg },
            { label: 'APG', value: apg },
            { label: 'FG%', value: `${fg}%` },
          ].map(s => (
            <View key={s.label} style={[styles.statChip, { backgroundColor: C.surface }]}>
              <Text style={[styles.statVal, { color: C.label }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: C.secondary }]}>{s.label}</Text>
            </View>
          ));
        })()}
      </View>

      {/* Recruiting summary (Coach only) */}
      {role === 'Coach' && (
        <>
          <SectionTitle title="Recruiting" C={C} />
          <View style={[styles.card, { backgroundColor: C.surface, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 12, alignItems: 'center' }]}>
            {[
              { label: 'Total',     value: RECRUITS_BOARD.length.toString(),                                          color: C.label },
              { label: 'Committed', value: RECRUITS_BOARD.filter(r => ['Committed','Signed','Verbal'].includes(r.stage)).length.toString(), color: '#5A8A6E' },
              { label: 'Offered',   value: RECRUITS_BOARD.filter(r => r.stage === 'Offered').length.toString(),       color: '#1D9BF0' },
            ].map(item => (
              <View key={item.label} style={{ flex: 1, alignItems: 'center' }}>
                <Text style={[styles.statVal, { color: item.color, fontSize: 20 }]}>{item.value}</Text>
                <Text style={[styles.statLabel, { color: C.secondary }]}>{item.label}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* News */}
      <SectionTitle title="News" C={C} />
      {RECENT_NEWS.map((item: NewsItem) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [
            styles.newsRow,
            { backgroundColor: C.surface, borderColor: C.inputBorder },
            pressed && { backgroundColor: C.surfacePressed },
          ]}
        >
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.newsTitle, { color: C.label }]} numberOfLines={2}>
              {item.headline}
            </Text>
            <Text style={[styles.gameMeta, { color: C.muted }]}>
              {item.source} · {item.date}
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={12} color={C.muted} />
        </Pressable>
      ))}

      <View style={{ height: 20 }} />
    </View>
  );

  // ── Tab: Schedule ─────────────────────────────────────────────────────────

  const renderSchedule = () => {
    const played   = filteredGames.filter(g => g.result);
    const upcoming = filteredGames.filter(g => !g.result);
    const filtWins = played.filter(g => g.result === 'W').length;
    return (
      <View style={{ gap: 12 }}>

        {/* Summary chips */}
        <View style={[styles.card, { backgroundColor: NAVY, flexDirection: 'row', gap: 0 }]}>
          {[
            { label: 'Played',   value: played.length.toString() },
            { label: 'Wins',     value: filtWins.toString() },
            { label: 'Losses',   value: (played.length - filtWins).toString() },
            { label: 'Upcoming', value: upcoming.length.toString() },
          ].map((s, i) => (
            <View
              key={s.label}
              style={[
                { flex: 1, alignItems: 'center', paddingVertical: 10 },
                i < 3 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: 'rgba(255,255,255,0.2)' },
              ]}
            >
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>{s.value}</Text>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Upcoming section */}
        {upcoming.length > 0 && (
          <>
            <Text style={[sc.sectionTitle, { color: C.secondary }]}>Upcoming</Text>
            <View style={[styles.card, { backgroundColor: C.surface, overflow: 'hidden', padding: 0 }]}>
              {upcoming.map((g, i) => (
                <View key={g.id} style={i < upcoming.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator } : {}}>
                  <GameRow game={g} C={C} />
                </View>
              ))}
            </View>
          </>
        )}

        {/* Played section */}
        {played.length > 0 && (
          <>
            <Text style={[sc.sectionTitle, { color: C.secondary }]}>Results</Text>
            <View style={[styles.card, { backgroundColor: C.surface, overflow: 'hidden', padding: 0 }]}>
              {[...played].reverse().map((g, i) => (
                <View key={g.id} style={i < played.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator } : {}}>
                  <GameRow game={g} C={C} />
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </View>
    );
  };

  // ── Tab: Scouting ─────────────────────────────────────────────────────────

  const renderScouting = () => {
    if (role !== 'Coach') {
      return (
        <View style={styles.lockWrap}>
          <GlassView tier={1} radius={20} style={styles.lockCard}>
            <IconSymbol name="lock.fill" size={36} color={C.muted} />
            <Text style={[styles.lockTitle, { color: C.label }]}>Coach Access Only</Text>
            <Text style={[styles.lockSub, { color: C.secondary }]}>
              Scouting reports are restricted to coaching staff.
            </Text>
          </GlassView>
        </View>
      );
    }

    const sc2 = SCOUT_HOWARD;
    return (
      <View style={{ gap: 12 }}>

        {/* Opponent header */}
        <View style={[styles.card, { backgroundColor: NAVY, gap: 6 }]}>
          <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Next Opponent
          </Text>
          <Text style={{ fontSize: 22, fontWeight: '900', color: '#fff' }}>
            {sc2.team}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {[
              { l: 'Record',   v: sc2.record },
              { l: 'Conf',     v: sc2.confRecord },
              { l: 'Standing', v: sc2.standing },
            ].map(item => (
              <View key={item.l} style={{ backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#fff' }}>{item.v}</Text>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{item.l}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 4 }}>
            <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>Data Conf: {sc2.dataConf}%</Text>
            </View>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Tier {sc2.dataTier}</Text>
          </View>
        </View>

        {/* Offense */}
        <SectionTitle title="Their Offense" C={C} />
        <View style={[styles.card, { backgroundColor: C.surface, gap: 10 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[styles.subLabel, { color: C.label }]}>{sc2.offense.systemName}</Text>
            <View style={{ backgroundColor: '#D9775720', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: '#D97757' }}>Pace {sc2.offense.pace}</Text>
            </View>
          </View>
          <Text style={[styles.scoutDesc, { color: C.secondary }]}>{sc2.offense.description}</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
            {Object.entries(sc2.offense.shotDiet).map(([k, v]) => (
              <View key={k} style={{ backgroundColor: C.surfacePressed, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>{v}% {k}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Defense */}
        <SectionTitle title="Their Defense" C={C} />
        <View style={[styles.card, { backgroundColor: C.surface, gap: 8 }]}>
          <Text style={[styles.subLabel, { color: C.label }]}>{sc2.defense.systemName}</Text>
          <Text style={[styles.scoutDesc, { color: C.secondary }]}>{sc2.defense.helpRules}</Text>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {sc2.defense.coverages.map(c => (
              <View key={c} style={{ backgroundColor: C.surfacePressed, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, color: C.secondary }}>{c}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top actions */}
        <SectionTitle title="Their Top Actions" C={C} />
        <View style={[styles.card, { backgroundColor: C.surface, overflow: 'hidden', padding: 0 }]}>
          {sc2.topActions.map((action, i) => (
            <View
              key={action.rank}
              style={[
                styles.actionRow,
                { borderBottomColor: C.separator },
                i === sc2.topActions.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.rankCircle, { backgroundColor: NAVY + '30' }]}>
                <Text style={{ fontSize: 11, fontWeight: '800', color: NAVY }}>{action.rank}</Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[styles.actionName, { color: C.label }]}>{action.name}</Text>
                  <Text style={[styles.freqText, { color: C.accent }]}>{action.freq}</Text>
                </View>
                <Text style={[styles.counterText, { color: '#5A8A6E' }]} numberOfLines={1}>
                  Counter: {action.our_counter}
                </Text>
                <Text style={[styles.riskText, { color: C.muted }]} numberOfLines={1}>
                  Risk: {action.risk}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Attack / Deny */}
        <SectionTitle title="Game Plan" C={C} />
        <View style={{ gap: 8 }}>
          <View style={[styles.card, { backgroundColor: '#5A8A6E18', gap: 6 }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#5A8A6E', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Attack
            </Text>
            {sc2.attacks.map((a, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Text style={{ color: '#5A8A6E', fontSize: 14, lineHeight: 20 }}>•</Text>
                <Text style={[styles.planItem, { color: C.label }]}>{a}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.card, { backgroundColor: '#B85C5C18', gap: 6 }]}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#B85C5C', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Deny
            </Text>
            {sc2.deny.map((d, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
                <Text style={{ color: '#B85C5C', fontSize: 14, lineHeight: 20 }}>•</Text>
                <Text style={[styles.planItem, { color: C.label }]}>{d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Key opponents */}
        <SectionTitle title="Their Key Players" C={C} />
        <View style={[styles.card, { backgroundColor: C.surface, overflow: 'hidden', padding: 0 }]}>
          {sc2.rotation.map((p, i) => (
            <View
              key={p.name}
              style={[
                styles.oppPlayerRow,
                { borderBottomColor: C.separator },
                i === sc2.rotation.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[styles.posBadge, { backgroundColor: NAVY + '20' }]}>
                <Text style={{ fontSize: 10, fontWeight: '800', color: NAVY }}>{p.pos}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.playerName, { color: C.label }]}>{p.name}</Text>
                <Text style={[styles.gameMeta, { color: C.secondary }]}>{p.archetype}</Text>
              </View>
              <Text style={[styles.threatText, { color: C.accent }]} numberOfLines={1}>
                {p.threat}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ height: 20 }} />
      </View>
    );
  };

  // ── Tab: Analytics ────────────────────────────────────────────────────────

  const renderAnalytics = () => {
    const pill = selectedPill || 'Team';
    return (
      <View style={{ gap: 12 }}>

        {pill === 'Team' && (() => {
          const sp = PLAYERS.filter(p => p.role === 'Starter');
          const avg = (fn: (p: Player) => number) => (sp.reduce((s, p) => s + fn(p), 0) / Math.max(sp.length, 1));
          const ppg = avg(p => p.stats.ppg).toFixed(1);
          const rpg = avg(p => p.stats.rpg).toFixed(1);
          const apg = avg(p => p.stats.apg).toFixed(1);
          const fgPct = avg(p => p.stats.fgPct) / 100;
          const fg3Pct = avg(p => p.stats.fg3Pct) / 100;
          const ftPct = avg(p => p.stats.ftPct) / 100;
          const spg = avg(p => p.stats.spg).toFixed(1);
          const bpg = avg(p => p.stats.bpg).toFixed(1);
          return (
            <>
              <SectionTitle title="Season Averages" C={C} />
              <View style={[styles.card, { backgroundColor: NAVY }]}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {[
                    { l: 'PPG', v: ppg },
                    { l: 'RPG', v: rpg },
                    { l: 'APG', v: apg },
                    { l: 'KR',  v: TEAM_KR.overall.toFixed(1) },
                  ].map(s => (
                    <View key={s.l} style={{ flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.12)' }}>
                      <Text style={{ fontSize: 20, fontWeight: '900', color: '#fff' }}>{s.v}</Text>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{s.l}</Text>
                    </View>
                  ))}
                </View>
              </View>

              <SectionTitle title="Shooting" C={C} />
              <View style={[styles.card, { backgroundColor: C.surface, gap: 12 }]}>
                {[
                  { label: 'Field Goal %',  value: fgPct,  color: '#5A8A6E' },
                  { label: 'Three-Point %', value: fg3Pct, color: '#1D9BF0' },
                  { label: 'Free Throw %',  value: ftPct,  color: '#D97757' },
                ].map(s => (
                  <View key={s.label} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={[styles.gameMeta, { color: C.secondary }]}>{s.label}</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: s.color }}>
                        {(s.value * 100).toFixed(1)}%
                      </Text>
                    </View>
                    <View style={{ height: 6, backgroundColor: C.surfacePressed, borderRadius: 3, overflow: 'hidden' }}>
                      <View style={{ height: 6, borderRadius: 3, backgroundColor: s.color, width: `${s.value * 100}%` as any }} />
                    </View>
                  </View>
                ))}
              </View>

              <SectionTitle title="Other" C={C} />
              <View style={styles.gridRow}>
                {[
                  { label: 'SPG',  value: spg },
                  { label: 'BPG',  value: bpg },
                  { label: 'Pace', value: TEAM_SYSTEM.offense.pace.toString() },
                  { label: 'Conf', value: TEAM_INFO.conferenceRec },
                ].map(s => (
                  <View key={s.label} style={[styles.gridChip, { backgroundColor: C.surface }]}>
                    <Text style={[styles.statVal, { color: C.label }]}>{s.value}</Text>
                    <Text style={[styles.statLabel, { color: C.secondary }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </>
          );
        })()}

        {pill === 'Players' && (
          <>
            <SectionTitle title="Player Stats" C={C} />
            <View style={[styles.card, { backgroundColor: C.surface, overflow: 'hidden', padding: 0 }]}>
              {starters.map((p, i) => (
                <View key={p.id} style={i < starters.length - 1 ? { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator } : {}}>
                  <PlayerStatRow player={p} rank={i + 1} C={C} />
                </View>
              ))}
            </View>
          </>
        )}

        {pill === 'Advanced' && (
          <>
            <SectionTitle title="KR Intelligence" C={C} />
            <View style={[styles.card, { backgroundColor: NAVY, gap: 8 }]}>
              <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                KR Player Ratings
              </Text>
              {PLAYERS.filter(p => p.kr).slice(0, 5).sort((a, b) => (b.kr?.overall ?? 0) - (a.kr?.overall ?? 0)).map(p => (
                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: `hsl(${p.hue},40%,30%)`, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{p.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff' }} numberOfLines={1}>{p.name}</Text>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{p.position} · #{p.number}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '900', color: krTierColor(p.kr?.overall ?? 0) }}>
                      {p.kr?.overall.toFixed(1)}
                    </Text>
                    <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>KR</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Team KR */}
            <SectionTitle title="Team KR" C={C} />
            <View style={[styles.card, { backgroundColor: C.surface, gap: 10 }]}>
              {[
                { label: 'Overall KR',   value: TEAM_KR.overall.toFixed(1),   color: '#D97757' },
                { label: 'Offensive KR', value: TEAM_KR.offensive.toFixed(1), color: '#5A8A6E' },
                { label: 'Defensive KR', value: TEAM_KR.defensive.toFixed(1), color: '#B85C5C' },
              ].map(s => (
                <View key={s.label} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: C.secondary }}>{s.label}</Text>
                  <Text style={{ fontSize: 18, fontWeight: '800', color: s.color }}>{s.value}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </View>
    );
  };

  // ── Render content ────────────────────────────────────────────────────────

  const renderContent = () => {
    if (activeTab === 'Overview')  return renderOverview();
    if (activeTab === 'Schedule')  return renderSchedule();
    if (activeTab === 'Scouting')  return renderScouting();
    return renderAnalytics();
  };

  // ── Main return ───────────────────────────────────────────────────────────

  return (
    <View style={[styles.screen, { backgroundColor: C.bg }]}>

      {/* Scrollable content */}
      <ScrollView
        key={activeTab}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: contentPaddingTop,
          paddingHorizontal: 16,
          paddingBottom: 120,
        }}
        keyboardShouldPersistTaps="handled"
      >
        {renderContent()}
      </ScrollView>

      {/* Fixed top bar */}
      <View
        style={[
          styles.topBarOuter,
          { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator },
        ]}
      >
        <View style={styles.topBar}>
          {/* Hamburger */}
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={styles.iconBtn}
            hitSlop={8}
          >
            <IconSymbol name="line.3.horizontal" size={20} color={C.label} />
          </Pressable>

          {/* Dropdown tab pill */}
          <Pressable
            onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            style={[styles.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator }]}
          >
            <Text style={[styles.dropdownText, { color: C.label }]}>{activeTab}</Text>
            <IconSymbol
              name={dropdownOpen ? 'chevron.up' : 'chevron.down'}
              size={12}
              color={C.secondary as string}
              style={{ marginLeft: 4 }}
            />
          </Pressable>

          {/* Filter + role */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={8} style={styles.iconBtn}>
                <IconSymbol
                  name={pillsVisible ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={20}
                  color={pillsVisible ? C.accent : C.label}
                />
              </Pressable>
            )}
            <Pressable
              onPress={cycleRole}
              style={[styles.rolePill, { backgroundColor: role === 'Coach' ? NAVY : C.surface, borderColor: C.separator }]}
            >
              <Text style={[styles.rolePillText, { color: role === 'Coach' ? '#fff' : C.accent }]}>
                {role}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Pills row */}
        {pills.length > 0 && (
          <Animated.View
            style={[
              styles.pillsRow,
              {
                height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
                opacity: pillsAnim,
                overflow: 'hidden',
                borderBottomColor: C.separator,
              },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}
            >
              {pills.map(pill => {
                const active = selectedPill === pill;
                return (
                  <Pressable
                    key={pill}
                    onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                    style={[
                      styles.pill,
                      {
                        borderColor:     active ? C.accent : C.inputBorder,
                        backgroundColor: active ? C.accent : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.pillText, { color: active ? '#fff' : C.secondary }]}>
                      {pill}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Dropdown overlay */}
      {dropdownOpen && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFill, { zIndex: 150 }]}
            onPress={() => setDropdownOpen(false)}
          />
          <View
            style={[
              styles.dropdown,
              { backgroundColor: C.surface, borderColor: C.separator, top: topBarH, zIndex: 200 },
            ]}
          >
            {(['Overview', 'Schedule', 'Scouting', 'Analytics'] as SportsTab[]).map(tab => (
              <Pressable
                key={tab}
                onPress={() => changeTab(tab)}
                style={[
                  styles.dropdownItem,
                  {
                    borderBottomColor: C.separator,
                    backgroundColor:   activeTab === tab ? (C.surfacePressed as string) : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>
                  {tab}
                </Text>
                {activeTab === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
                {tab === 'Scouting' && role !== 'Coach' && (
                  <IconSymbol name="lock.fill" size={12} color={C.muted} />
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const sc = StyleSheet.create({
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 4 },
  gameRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  locBadge: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  locText:  { fontSize: 10, fontWeight: '800' },
  gameOpp:  { fontSize: 13, fontWeight: '600' },
  gameMeta: { fontSize: 11 },
  resultBadge: { fontSize: 13, fontWeight: '800' },
  scoreText:   { fontSize: 11 },
  playerStatRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  rankNum:  { fontSize: 12, width: 16, textAlign: 'center' },
  avatar:   { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  playerName: { fontSize: 13, fontWeight: '600' },
  statCells:  { flexDirection: 'row', gap: 8 },
  statCell:   { alignItems: 'center', minWidth: 38 },
  statVal:    { fontSize: 13, fontWeight: '700' },
  statLbl:    { fontSize: 9, marginTop: 1 },
});

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:       { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  iconBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flex: 1, marginHorizontal: 10, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  dropdownText: { fontSize: 14, fontWeight: '700' },
  rolePill:     { paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rolePillText: { fontSize: 12, fontWeight: '700' },
  pillsRow:     { borderBottomWidth: StyleSheet.hairlineWidth },
  pill:         { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillText:     { fontSize: 13, fontWeight: '600' },
  dropdown:     { position: 'absolute', left: 60, right: 60, zIndex: 200, borderRadius: 14, borderWidth: 1, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownItemText: { fontSize: 15, fontWeight: '600' },

  // Cards
  card:         { borderRadius: 16, padding: 14 },
  teamBanner:   { borderRadius: 16, padding: 18, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  teamName:     { fontSize: 18, fontWeight: '900', color: '#fff' },
  teamConf:     { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  recordRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  recordText:   { fontSize: 28, fontWeight: '900', color: '#fff' },
  confBadge:    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  confBadgeText:{ fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  coachCircle:  { width: 52, height: 52, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  coachInitials:{ fontSize: 16, fontWeight: '800', color: '#fff' },

  nextGameCard: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1 },
  locBadgeLg:   { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  locTextLg:    { fontSize: 11, fontWeight: '800' },
  nextOpp:      { fontSize: 15, fontWeight: '700' },
  nextMeta:     { fontSize: 12, marginTop: 2 },
  nextVenue:    { fontSize: 11, marginTop: 1 },
  tvBadge:      { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  tvText:       { fontSize: 11, fontWeight: '700' },

  resultRow:     { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  resultBadge:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resultLetter:  { fontSize: 12, fontWeight: '800' },
  gameOpp:       { fontSize: 13, fontWeight: '600' },
  gameMeta:      { fontSize: 11, marginTop: 1 },
  scoreChip:     { fontSize: 14, fontWeight: '800' },

  statsRow:      { flexDirection: 'row', gap: 8 },
  statChip:      { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },
  statVal:       { fontSize: 18, fontWeight: '800' },
  statLabel:     { fontSize: 11 },
  gridRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridChip:      { width: '47%', borderRadius: 12, padding: 12, alignItems: 'center', gap: 4 },

  newsRow:       { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, marginBottom: 6 },
  newsTitle:     { fontSize: 14, fontWeight: '600', lineHeight: 20 },

  lockWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingHorizontal: 40 },
  lockCard: { padding: 28, alignItems: 'center', gap: 12, maxWidth: 280 },
  lockTitle:{ fontSize: 17, fontWeight: '700' },
  lockSub:  { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  subLabel:    { fontSize: 14, fontWeight: '700' },
  scoutDesc:   { fontSize: 13, lineHeight: 18 },
  actionRow:   { flexDirection: 'row', alignItems: 'flex-start', padding: 14, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  rankCircle:  { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  actionName:  { fontSize: 13, fontWeight: '700' },
  freqText:    { fontSize: 12, fontWeight: '700' },
  counterText: { fontSize: 12, fontWeight: '500' },
  riskText:    { fontSize: 11 },
  planItem:    { fontSize: 13, lineHeight: 20, flex: 1 },
  oppPlayerRow:{ flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  posBadge:    { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  playerName:  { fontSize: 13, fontWeight: '600' },
  threatText:  { fontSize: 11, fontWeight: '600', maxWidth: 100, textAlign: 'right' },
});
