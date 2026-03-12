/**
 * Season — 3-page swipeable layout. Home grid position 2 (row 1 center).
 * Page 0 (default): Games — season record, stat leaders, KR, full schedule.
 * Page 1: Film — filter pills, film library with PlayVision badges.
 * Page 2: Development — practice plans, player dev, health, eligibility.
 * 3 dots at top. Swipe right on page 0 = side panel.
 * FAB on pages 1 and 2.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { OfficeContent } from '@/components/office/office-content';
import { CampusContent } from '@/components/campus/campus-content';
import { ParishContent } from '@/components/parish/parish-content';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  SEASON_RECORD,
  STAT_LEADERS,
  TEAM_KR,
  GAMES,
  FILM_ITEMS,
  PRACTICE_PLANS,
  DEV_PLAYERS,
  HEALTH_ROSTER,
  ELIGIBILITY_ROSTER,
  type GameItem,
  type FilmCategory,
  type FilmItem,
  type DevSection,
  type PracticePlan,
  type DevPlayer,
  type HealthEntry,
  type EligibilityEntry,
} from '@/data/mock-season';

import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ─── Film Filter data ──────────────────────────────────────────────────────

const FILM_FILTERS: { key: FilmCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'game', label: 'Game Film' },
  { key: 'practice', label: 'Practice' },
  { key: 'scouting', label: 'Scouting' },
  { key: 'clips', label: 'Clips' },
];

// ─── Dev Section data ───────────────────────────────────────────────────────

const DEV_SECTIONS: { key: DevSection; label: string }[] = [
  { key: 'practice', label: 'Practice' },
  { key: 'players', label: 'Players' },
  { key: 'health', label: 'Health' },
  { key: 'eligibility', label: 'Eligibility' },
];

// ─── Health / Eligibility labels ────────────────────────────────────────────

const HEALTH_LABELS: Record<string, string> = {
  healthy: 'Healthy',
  'day-to-day': 'Day-to-Day',
  out: 'Out',
  'season-ending': 'Season',
};

const ELIG_LABELS: Record<string, string> = {
  eligible: 'Eligible',
  warning: 'Warning',
  ineligible: 'Ineligible',
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SeasonScreen() {
  const mode = useMode();
  if (mode === 'business') return <OfficeContent />;
  if (mode === 'education') return <CampusContent />;
  if (mode === 'church') return <ParishContent />;
  return <SportsSeasonContent />;
}

function SportsSeasonContent() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [filmFilter, setFilmFilter] = useState<FilmCategory>('all');
  const [devSection, setDevSection] = useState<DevSection>('practice');

  // Health / eligibility color maps (derived from C)
  const HEALTH_COLORS: Record<string, string> = useMemo(() => ({
    healthy: C.green,
    'day-to-day': C.amber,
    out: C.orange,
    'season-ending': C.red,
  }), [C]);

  const ELIG_COLORS: Record<string, string> = useMemo(() => ({
    eligible: C.green,
    warning: C.amber,
    ineligible: C.red,
  }), [C]);

  // ── Data ──
  const filteredFilm = useMemo(() => {
    if (filmFilter === 'all') return FILM_ITEMS;
    return FILM_ITEMS.filter((f) => f.category === filmFilter);
  }, [filmFilter]);

  const practicePlans = useMemo(() => PRACTICE_PLANS, []);
  const devPlayers = useMemo(() => DEV_PLAYERS, []);
  const healthRoster = useMemo(() => HEALTH_ROSTER, []);
  const eligibilityRoster = useMemo(() => ELIGIBILITY_ROSTER, []);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Game (completed) ──
  const longPressGameCompleted = useCallback((game: GameItem, pageY: number) => {
    setMenuData({
      title: game.opponent,
      subtitle: `${game.result} ${game.score}-${game.opponentScore}`,
      initials: game.opponentInitials,
      pageY,
      actions: [
        { key: 'boxscore', label: 'View Box Score', icon: 'list.number' },
        { key: 'film', label: 'View Film', icon: 'film.fill' },
        { key: 'share', label: 'Share Result', icon: 'square.and.arrow.up' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Game (upcoming) ──
  const longPressGameUpcoming = useCallback((game: GameItem, pageY: number) => {
    setMenuData({
      title: game.opponent,
      subtitle: `${game.date} · ${game.time}`,
      initials: game.opponentInitials,
      pageY,
      actions: [
        { key: 'scout', label: 'View Scouting Report', icon: 'scope' },
        { key: 'note', label: 'Add Game Plan Note', icon: 'note.text' },
        { key: 'share', label: 'Share Preview', icon: 'square.and.arrow.up' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Game (live) ──
  const longPressGameLive = useCallback((game: GameItem, pageY: number) => {
    setMenuData({
      title: game.opponent,
      subtitle: `LIVE · ${game.liveScore}`,
      initials: game.opponentInitials,
      pageY,
      actions: [
        { key: 'watch', label: 'Watch Live', icon: 'play.fill' },
        { key: 'stats', label: 'Live Stats', icon: 'chart.bar.fill' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
      ],
      onAction: () => {},
    });
  }, []);

  const longPressGame = useCallback((game: GameItem, pageY: number) => {
    if (game.status === 'completed') longPressGameCompleted(game, pageY);
    else if (game.status === 'upcoming') longPressGameUpcoming(game, pageY);
    else if (game.status === 'live') longPressGameLive(game, pageY);
  }, [longPressGameCompleted, longPressGameUpcoming, longPressGameLive]);

  // ── Long press: Film ──
  const longPressFilm = useCallback((film: FilmItem, pageY: number) => {
    setMenuData({
      title: film.title,
      subtitle: `${film.date} · ${film.duration}`,
      initials: film.category.charAt(0).toUpperCase() + film.category.charAt(1),
      pageY,
      actions: [
        { key: 'play', label: 'Play', icon: 'play.fill' },
        { key: 'playlist', label: 'Add to Playlist', icon: 'plus.rectangle.on.rectangle' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Dev Player ──
  const longPressDevPlayer = useCallback((player: DevPlayer, pageY: number) => {
    setMenuData({
      title: player.name,
      subtitle: `#${player.number} · ${player.position} · KR ${player.krRating}`,
      initials: player.initials,
      pageY,
      actions: [
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'goals', label: 'Set Dev Goals', icon: 'target' },
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'remove', label: 'Remove', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Health ──
  const longPressHealth = useCallback((entry: HealthEntry, pageY: number) => {
    setMenuData({
      title: entry.playerName,
      subtitle: entry.injury ?? 'Healthy',
      initials: entry.initials,
      pageY,
      actions: [
        { key: 'update', label: 'Update Status', icon: 'pencil' },
        { key: 'history', label: 'View History', icon: 'clock.fill' },
        { key: 'message', label: 'Message Player', icon: 'bubble.left.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Eligibility ──
  const longPressEligibility = useCallback((entry: EligibilityEntry, pageY: number) => {
    setMenuData({
      title: entry.playerName,
      subtitle: `GPA ${entry.gpa} · ${entry.credits} credits`,
      initials: entry.initials,
      pageY,
      actions: [
        { key: 'details', label: 'View Details', icon: 'doc.text.fill' },
        { key: 'update', label: 'Update Status', icon: 'pencil' },
        { key: 'advisor', label: 'Contact Academic Advisor', icon: 'envelope.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // Team KR trend
  const trendIcon = TEAM_KR.trend === 'rising' ? '\u25B2' : TEAM_KR.trend === 'falling' ? '\u25BC' : '\u2500';
  const trendColor = TEAM_KR.trend === 'rising' ? C.green : TEAM_KR.trend === 'falling' ? C.red : C.secondary;

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}

      >
        {/* ── PAGE 0: GAMES ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Games</Text>
            </View>
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Record Header */}
            <View style={s.recordCard}>
              <View style={s.recordRow}>
                <View style={s.recordStat}>
                  <Text style={s.recordValue}>{SEASON_RECORD.wins}-{SEASON_RECORD.losses}</Text>
                  <Text style={s.recordLabel}>Overall</Text>
                </View>
                <View style={[s.recordStat, s.recordStatBorder]}>
                  <Text style={s.recordValue}>{SEASON_RECORD.confWins}-{SEASON_RECORD.confLosses}</Text>
                  <Text style={s.recordLabel}>Conference</Text>
                </View>
                <View style={s.recordStat}>
                  <Text style={s.recordValue}>{SEASON_RECORD.confStanding}</Text>
                  <Text style={s.recordLabel}>Standing</Text>
                </View>
              </View>
            </View>

            {/* Stat Leaders Strip */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.leadersScroll}
            >
              {STAT_LEADERS.map((leader) => (
                <Pressable key={leader.label} style={s.leaderCard}>
                  <View style={s.leaderAvatar}>
                    <Text style={s.leaderInitials}>{leader.initials}</Text>
                  </View>
                  <View style={s.leaderInfo}>
                    <Text style={s.leaderStatLabel}>{leader.label}</Text>
                    <Text style={s.leaderStatValue}>{leader.value}</Text>
                    <Text style={s.leaderName} numberOfLines={1}>{leader.playerName}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>

            {/* Team KR Badge */}
            <View style={s.krRow}>
              <Text style={s.krLabel}>Team KR</Text>
              <View style={s.krBadge}>
                <Text style={s.krValue}>{TEAM_KR.rating}</Text>
                <Text style={[s.krTrend, { color: trendColor }]}>{trendIcon}</Text>
              </View>
            </View>

            {GAMES.map((game, idx) => (
              <View key={game.id}>
                {idx > 0 && <View style={s.separator} />}
                <Pressable
                  style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                  onLongPress={(e) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    longPressGame(game, e.nativeEvent.pageY);
                  }}
                  delayLongPress={400}
                >
                  {/* Opponent avatar */}
                  <View style={s.gameAvatar}>
                    <Text style={s.gameAvatarText}>{game.opponentInitials}</Text>
                  </View>

                  {/* Info */}
                  <View style={s.rowContent}>
                    <View style={s.gameNameRow}>
                      <Text style={s.rowName} numberOfLines={1}>{game.opponent}</Text>
                      <View style={[s.hwBadge, { backgroundColor: game.homeAway === 'home' ? C.green + '22' : C.amber + '22' }]}>
                        <Text style={[s.hwBadgeText, { color: game.homeAway === 'home' ? C.green : C.amber }]}>
                          {game.homeAway === 'home' ? 'HOME' : 'AWAY'}
                        </Text>
                      </View>
                      {game.conference && (
                        <View style={s.confBadge}>
                          <Text style={s.confBadgeText}>Conf</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.gameMeta}>{game.date} · {game.time}</Text>
                  </View>

                  {/* Right: result / upcoming / live */}
                  <View style={s.gameRight}>
                    {game.status === 'completed' && (
                      <>
                        <Text style={[s.gameResult, { color: game.result === 'W' ? C.green : C.red }]}>
                          {game.result}
                        </Text>
                        <Text style={s.gameScore}>{game.score}-{game.opponentScore}</Text>
                      </>
                    )}
                    {game.status === 'upcoming' && (
                      <>
                        <Text style={s.gameKR}>KR {game.opponentKR}</Text>
                        <Text style={s.gameProb}>{game.winProbability}%</Text>
                      </>
                    )}
                    {game.status === 'live' && (
                      <>
                        <View style={s.liveBadge}>
                          <Text style={s.liveBadgeText}>LIVE</Text>
                        </View>
                        <Text style={s.liveScore}>{game.liveScore}</Text>
                        <Text style={s.livePeriod}>{game.livePeriod}</Text>
                      </>
                    )}
                  </View>
                </Pressable>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: FILM ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Film</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterRow}
            >
              {FILM_FILTERS.map((f) => {
                const isActive = filmFilter === f.key;
                return (
                  <Pressable
                    key={f.key}
                    style={[s.filterPill, isActive && s.filterPillActive]}
                    onPress={() => setFilmFilter(f.key)}
                  >
                    <Text style={[s.filterText, isActive && s.filterTextActive]}>{f.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {filteredFilm.length === 0 ? (
              <View style={s.emptyState}>
                <IconSymbol name="film.fill" size={36} color={C.muted} />
                <Text style={s.emptyText}>No film</Text>
              </View>
            ) : (
              filteredFilm.map((film, idx) => {
                const categoryLabel = film.category.charAt(0).toUpperCase() + film.category.slice(1);
                return (
                  <View key={film.id}>
                    {idx > 0 && <View style={s.separator} />}
                    <Pressable
                      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                      onLongPress={(e) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        longPressFilm(film, e.nativeEvent.pageY);
                      }}
                      delayLongPress={400}
                    >
                      {/* Thumbnail */}
                      <View style={[s.filmThumb, { backgroundColor: film.thumbnailColor }]}>
                        <Image
                          source={{ uri: film.thumbnailUri }}
                          style={s.filmThumbImage}
                          resizeMode="cover"
                        />
                        <View style={s.filmOverlayContainer}>
                          <View style={s.filmPlayOverlay}>
                            <IconSymbol name="play.fill" size={14} color={C.label} />
                          </View>
                        </View>
                        <View style={s.filmDurationBadge}>
                          <Text style={s.filmDurationText}>{film.duration}</Text>
                        </View>
                      </View>

                      <View style={s.rowContent}>
                        <View style={s.filmTitleRow}>
                          <Text style={s.rowName} numberOfLines={1}>{film.title}</Text>
                        </View>
                        <View style={s.filmMetaRow}>
                          <View style={s.filmTypeBadge}>
                            <Text style={s.filmTypeBadgeText}>{categoryLabel}</Text>
                          </View>
                          <Text style={s.filmMetaText}>{film.date}</Text>
                          {film.hasPlayVision && (
                            <View style={s.pvBadge}>
                              <Text style={s.pvBadgeText}>PV</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  </View>
                );
              })
            )}
          </ScrollView>

          {pageIndex === 1 && (
            <Pressable
              style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <IconSymbol name="plus" size={24} color={C.label} />
            </Pressable>
          )}
        </View>

        {/* ── PAGE 2: DEVELOPMENT ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Development</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterRow}
            >
              {DEV_SECTIONS.map((sec) => {
                const isActive = devSection === sec.key;
                return (
                  <Pressable
                    key={sec.key}
                    style={[s.filterPill, isActive && s.filterPillActive]}
                    onPress={() => setDevSection(sec.key)}
                  >
                    <Text style={[s.filterText, isActive && s.filterTextActive]}>{sec.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Practice Plans */}
            {devSection === 'practice' && practicePlans.map((plan, idx) => (
              <View key={plan.id}>
                {idx > 0 && <View style={s.separator} />}
                <Pressable
                  style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                  onLongPress={(e) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setMenuData({
                      title: plan.focusArea,
                      subtitle: `${plan.date} · ${plan.duration}`,
                      initials: 'PP',
                      pageY: e.nativeEvent.pageY,
                      actions: [
                        { key: 'view', label: 'View Plan', icon: 'doc.text.fill' },
                        { key: 'edit', label: 'Edit', icon: 'pencil' },
                        { key: 'duplicate', label: 'Duplicate', icon: 'doc.on.doc.fill' },
                        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
                      ],
                      onAction: () => {},
                    });
                  }}
                  delayLongPress={400}
                >
                  <View style={s.practiceIcon}>
                    <IconSymbol name="sportscourt.fill" size={18} color={C.secondary} />
                  </View>
                  <View style={s.rowContent}>
                    <View style={s.practiceNameRow}>
                      <Text style={s.rowName}>{plan.focusArea}</Text>
                      {plan.upcoming && (
                        <View style={s.upcomingBadge}>
                          <Text style={s.upcomingBadgeText}>Upcoming</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.practiceMeta}>{plan.date} · {plan.duration} · {plan.drillCount} drills</Text>
                  </View>
                </Pressable>
              </View>
            ))}

            {/* Players */}
            {devSection === 'players' && devPlayers.map((player, idx) => {
              const pTrendIcon = player.krTrend === 'rising' ? '\u25B2' : player.krTrend === 'falling' ? '\u25BC' : '\u2500';
              const pTrendColor = player.krTrend === 'rising' ? C.green : player.krTrend === 'falling' ? C.red : C.secondary;
              return (
                <View key={player.id}>
                  {idx > 0 && <View style={s.separator} />}
                  <Pressable
                    style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                    onLongPress={(e) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      longPressDevPlayer(player, e.nativeEvent.pageY);
                    }}
                    delayLongPress={400}
                  >
                    <View style={s.devAvatar}>
                      <Text style={s.devInitials}>{player.initials}</Text>
                    </View>
                    <View style={s.rowContent}>
                      <View style={s.devNameRow}>
                        <Text style={s.rowName} numberOfLines={1}>{player.name}</Text>
                        <Text style={s.devNumber}>#{player.number}</Text>
                        <Text style={s.devPosition}>{player.position}</Text>
                      </View>
                      <View style={s.devMetaRow}>
                        <Text style={s.devKR}>KR {player.krRating}</Text>
                        <Text style={[s.devTrend, { color: pTrendColor }]}>{pTrendIcon}</Text>
                        <View style={s.devFocusTag}>
                          <Text style={s.devFocusText}>{player.devFocus}</Text>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                </View>
              );
            })}

            {/* Health */}
            {devSection === 'health' && healthRoster.map((entry, idx) => {
              const hColor = HEALTH_COLORS[entry.status];
              const hLabel = HEALTH_LABELS[entry.status];
              return (
                <View key={entry.id}>
                  {idx > 0 && <View style={s.separator} />}
                  <Pressable
                    style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                    onLongPress={(e) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      longPressHealth(entry, e.nativeEvent.pageY);
                    }}
                    delayLongPress={400}
                  >
                    <View style={s.healthAvatar}>
                      <Text style={s.healthInitials}>{entry.initials}</Text>
                    </View>
                    <View style={s.rowContent}>
                      <Text style={s.rowName} numberOfLines={1}>{entry.playerName}</Text>
                      <View style={s.healthMetaRow}>
                        {entry.injury && <Text style={s.healthInjury}>{entry.injury}</Text>}
                        {entry.returnTimeline && <Text style={s.healthTimeline}>{entry.returnTimeline}</Text>}
                      </View>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: hColor + '22' }]}>
                      <Text style={[s.statusBadgeText, { color: hColor }]}>{hLabel}</Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}

            {/* Eligibility */}
            {devSection === 'eligibility' && eligibilityRoster.map((entry, idx) => {
              const eColor = ELIG_COLORS[entry.eligStatus];
              const eLabel = ELIG_LABELS[entry.eligStatus];
              return (
                <View key={entry.id}>
                  {idx > 0 && <View style={s.separator} />}
                  <Pressable
                    style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                    onLongPress={(e) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                      longPressEligibility(entry, e.nativeEvent.pageY);
                    }}
                    delayLongPress={400}
                  >
                    <View style={s.eligAvatar}>
                      <Text style={s.eligInitials}>{entry.initials}</Text>
                    </View>
                    <View style={s.rowContent}>
                      <Text style={s.rowName} numberOfLines={1}>{entry.playerName}</Text>
                      <View style={s.eligMetaRow}>
                        <Text style={s.eligMeta}>GPA {entry.gpa}</Text>
                        <Text style={s.eligMeta}>{entry.credits} credits</Text>
                      </View>
                    </View>
                    <View style={[s.statusBadge, { backgroundColor: eColor + '22' }]}>
                      <Text style={[s.statusBadgeText, { color: eColor }]}>{eLabel}</Text>
                    </View>
                  </Pressable>
                </View>
              );
            })}
          </ScrollView>

          {pageIndex === 2 && (
            <Pressable
              style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
            >
              <IconSymbol name="plus" size={24} color={C.label} />
            </Pressable>
          )}
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: C.bg,
  },

  // Record header
  recordCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  recordStat: {
    alignItems: 'center',
    flex: 1,
  },
  recordStatBorder: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: C.separator,
  },
  recordValue: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  recordLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: C.secondary,
    marginTop: 2,
  },

  // Stat leaders strip
  leadersScroll: {
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 12,
  },
  leaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.surface,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  leaderAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  leaderInfo: {
    alignItems: 'flex-start',
  },
  leaderStatLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.3,
  },
  leaderStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: C.label,
  },
  leaderName: {
    fontSize: 11,
    color: C.muted,
  },

  // Team KR
  krRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  krLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.secondary,
  },
  krBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  krValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
  },
  krTrend: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Game row
  gameAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameAvatarText: { fontSize: 12, fontWeight: '700', color: C.secondary },
  gameNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gameMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
  hwBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  hwBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  confBadge: { backgroundColor: C.separator, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  confBadgeText: { fontSize: 9, fontWeight: '600', color: C.secondary },
  gameRight: { alignItems: 'flex-end' },
  gameResult: { fontSize: 16, fontWeight: '700' },
  gameScore: { fontSize: 12, color: C.secondary, marginTop: 1 },
  gameKR: { fontSize: 12, fontWeight: '600', color: C.secondary },
  gameProb: { fontSize: 11, color: C.muted, marginTop: 1 },
  liveBadge: { backgroundColor: C.red, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  liveBadgeText: { fontSize: 10, fontWeight: '700', color: C.label, letterSpacing: 0.3 },
  liveScore: { fontSize: 14, fontWeight: '700', color: C.label, marginTop: 2 },
  livePeriod: { fontSize: 11, color: C.secondary, marginTop: 1 },

  // Film row
  filmThumb: {
    width: 60,
    height: 80,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  filmThumbImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filmOverlayContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmPlayOverlay: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filmDurationBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 3,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  filmDurationText: {
    fontSize: 9,
    fontWeight: '600',
    color: C.label,
  },
  filmTitleRow: { flexDirection: 'row', alignItems: 'center' },
  filmMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  filmTypeBadge: { backgroundColor: C.separator, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  filmTypeBadgeText: { fontSize: 10, fontWeight: '600', color: C.secondary },
  filmMetaText: { fontSize: 12, color: C.muted },
  pvBadge: { backgroundColor: C.blue + '22', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  pvBadgeText: { fontSize: 9, fontWeight: '700', color: C.blue },

  // Practice plan row
  practiceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  practiceMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
  upcomingBadge: { backgroundColor: C.blue + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  upcomingBadgeText: { fontSize: 10, fontWeight: '600', color: C.blue },

  // Dev player row
  devAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  devInitials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  devNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  devNumber: { fontSize: 13, fontWeight: '600', color: C.muted },
  devPosition: { fontSize: 13, fontWeight: '500', color: C.muted },
  devMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  devKR: { fontSize: 12, fontWeight: '600', color: C.secondary },
  devTrend: { fontSize: 12, fontWeight: '700' },
  devFocusTag: { backgroundColor: C.separator, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  devFocusText: { fontSize: 10, fontWeight: '600', color: C.secondary },

  // Health row
  healthAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  healthMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  healthInjury: { fontSize: 13, color: C.muted },
  healthTimeline: { fontSize: 12, color: C.secondary },

  // Eligibility row
  eligAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eligInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  eligMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  eligMeta: { fontSize: 13, color: C.muted },

  // Status badge (shared by health + eligibility)
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
