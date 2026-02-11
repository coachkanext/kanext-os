/**
 * Coach Recruiting Screen — Global Player Pool
 * Single-purpose scoutable database of all national prospects.
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PLAYER_POOL, type PoolLevel, type PoolPosition, type PoolPlayer } from '@/data/playerPool';
import { getLatestSeason } from '@/data/playerSeasons';

// ─── Constants ───
const SCREEN_HEIGHT = Dimensions.get('window').height;
const SHEET_HEIGHT = Math.round(SCREEN_HEIGHT * 0.6);

const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

const HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];

const LEVELS: (PoolLevel | 'All')[] = ['All', 'HS', 'JUCO', 'NCAA D1', 'NCAA D2', 'NCAA D3', 'International', 'NAIA'];
const SEASONS = ['2025-26', '2024-25', '2023-24'];
const POSITIONS: PoolPosition[] = ['PG', 'SG', 'SF', 'PF', 'C'];
const CLASS_YEARS = ['2025', '2026', '2027'];
const MIN_MPG_OPTIONS = [0, 10, 20, 30];

type ViewMode = 'list' | 'cards' | 'compare';

const VIEW_OPTIONS: { key: ViewMode; icon: string; label: string }[] = [
  { key: 'list', icon: 'rectangle.stack', label: 'List' },
  { key: 'cards', icon: 'square.grid.2x2.fill', label: 'Cards' },
  { key: 'compare', icon: 'arrow.left.arrow.right', label: 'Compare' },
];

// Derive unique conferences from data
const ALL_CONFERENCES = [...new Set(PLAYER_POOL.map((p) => p.conference))].sort();
// Derive unique states from data
const ALL_STATES = [...new Set(PLAYER_POOL.map((p) => p.state))].sort();

// ─── PoolHeader ───
function PoolHeader({
  search,
  onSearchChange,
  levelFilter,
  onLevelChange,
  seasonFilter,
  onSeasonChange,
}: {
  search: string;
  onSearchChange: (v: string) => void;
  levelFilter: PoolLevel | null;
  onLevelChange: (v: PoolLevel | null) => void;
  seasonFilter: string;
  onSeasonChange: (v: string) => void;
}) {
  return (
    <View style={styles.poolHeader}>
      {/* Title row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Player Pool</Text>
        <View style={styles.contextPill}>
          <Text style={styles.contextPillText}>FMU Lions · 2025-26</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={16} color={GRAY} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search name or school..."
          placeholderTextColor={GRAY}
          value={search}
          onChangeText={onSearchChange}
        />
        {search.length > 0 && (
          <Pressable onPress={() => onSearchChange('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color={GRAY} />
          </Pressable>
        )}
      </View>

      {/* Level + Season dropdowns */}
      <View style={styles.dropdownRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
          {LEVELS.map((lv) => {
            const isActive = lv === 'All' ? levelFilter === null : levelFilter === lv;
            return (
              <Pressable
                key={lv}
                style={[styles.dropdownChip, isActive && styles.dropdownChipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onLevelChange(lv === 'All' ? null : (lv as PoolLevel));
                }}
              >
                <Text style={[styles.dropdownChipText, isActive && styles.dropdownChipTextActive]}>
                  {lv === 'All' ? 'All Levels' : lv}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.seasonRow}>
          {SEASONS.map((s) => {
            const isActive = seasonFilter === s;
            return (
              <Pressable
                key={s}
                style={[styles.seasonChip, isActive && styles.seasonChipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSeasonChange(s);
                }}
              >
                <Text style={[styles.seasonChipText, isActive && styles.seasonChipTextActive]}>
                  {s}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── FilterRow (collapsible) ───
function FilterRow({
  expanded,
  onToggle,
  conferenceFilter,
  onConferenceChange,
  posFilter,
  onPosChange,
  classFilter,
  onClassChange,
  stateFilter,
  onStateChange,
  minMpg,
  onMinMpgChange,
  filmOnly,
  onFilmOnlyChange,
}: {
  expanded: boolean;
  onToggle: () => void;
  conferenceFilter: string | null;
  onConferenceChange: (v: string | null) => void;
  posFilter: PoolPosition | null;
  onPosChange: (v: PoolPosition | null) => void;
  classFilter: string | null;
  onClassChange: (v: string | null) => void;
  stateFilter: string | null;
  onStateChange: (v: string | null) => void;
  minMpg: number;
  onMinMpgChange: (v: number) => void;
  filmOnly: boolean;
  onFilmOnlyChange: (v: boolean) => void;
}) {
  const hasActiveFilters = conferenceFilter || posFilter || classFilter || stateFilter || minMpg > 0 || filmOnly;

  return (
    <View style={styles.filterSection}>
      <Pressable
        style={styles.filterToggle}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle();
        }}
      >
        <Text style={[styles.filterToggleText, hasActiveFilters && { color: WHITE }]}>
          Filters{hasActiveFilters ? ' (active)' : ''}
        </Text>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={12}
          color={hasActiveFilters ? WHITE : GRAY}
        />
      </Pressable>

      {expanded && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChipsScroll}>
          {/* Conference */}
          {ALL_CONFERENCES.map((conf) => (
            <Pressable
              key={conf}
              style={[styles.filterChip, conferenceFilter === conf && styles.filterChipActive]}
              onPress={() => onConferenceChange(conferenceFilter === conf ? null : conf)}
            >
              <Text style={[styles.filterChipText, conferenceFilter === conf && styles.filterChipTextActive]}>
                {conf}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDividerV} />

          {/* Position */}
          {POSITIONS.map((pos) => (
            <Pressable
              key={pos}
              style={[styles.filterChip, posFilter === pos && styles.filterChipActive]}
              onPress={() => onPosChange(posFilter === pos ? null : pos)}
            >
              <Text style={[styles.filterChipText, posFilter === pos && styles.filterChipTextActive]}>
                {pos}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDividerV} />

          {/* Class Year */}
          {CLASS_YEARS.map((yr) => (
            <Pressable
              key={yr}
              style={[styles.filterChip, classFilter === yr && styles.filterChipActive]}
              onPress={() => onClassChange(classFilter === yr ? null : yr)}
            >
              <Text style={[styles.filterChipText, classFilter === yr && styles.filterChipTextActive]}>
                {yr}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDividerV} />

          {/* State */}
          {ALL_STATES.slice(0, 8).map((st) => (
            <Pressable
              key={st}
              style={[styles.filterChip, stateFilter === st && styles.filterChipActive]}
              onPress={() => onStateChange(stateFilter === st ? null : st)}
            >
              <Text style={[styles.filterChipText, stateFilter === st && styles.filterChipTextActive]}>
                {st}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDividerV} />

          {/* Min MPG */}
          {MIN_MPG_OPTIONS.map((mpg) => (
            <Pressable
              key={`mpg-${mpg}`}
              style={[styles.filterChip, minMpg === mpg && mpg > 0 && styles.filterChipActive]}
              onPress={() => onMinMpgChange(minMpg === mpg ? 0 : mpg)}
            >
              <Text style={[styles.filterChipText, minMpg === mpg && mpg > 0 && styles.filterChipTextActive]}>
                {mpg === 0 ? 'Any MPG' : `${mpg}+ MPG`}
              </Text>
            </Pressable>
          ))}

          <View style={styles.filterDividerV} />

          {/* Film toggle */}
          <Pressable
            style={[styles.filterChip, filmOnly && styles.filterChipActive]}
            onPress={() => onFilmOnlyChange(!filmOnly)}
          >
            <Text style={[styles.filterChipText, filmOnly && styles.filterChipTextActive]}>
              Has Film
            </Text>
          </Pressable>
        </ScrollView>
      )}
    </View>
  );
}

// ─── ViewToggle ───
function ViewToggle({
  activeView,
  onViewChange,
}: {
  activeView: ViewMode;
  onViewChange: (v: ViewMode) => void;
}) {
  return (
    <View style={styles.viewToggleContainer}>
      <View style={styles.viewToggle}>
        {VIEW_OPTIONS.map((v) => {
          const isActive = activeView === v.key;
          return (
            <Pressable
              key={v.key}
              style={[styles.viewToggleBtn, isActive && styles.viewToggleBtnActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onViewChange(v.key);
              }}
            >
              <IconSymbol
                name={v.icon as any}
                size={16}
                color={isActive ? WHITE : GRAY}
              />
            </Pressable>
          );
        })}
      </View>
      <Text style={styles.resultCount}>
        {/* Filled by parent — we'll just show view label */}
      </Text>
    </View>
  );
}

// ─── PoolListView ───
function PoolListView({
  players,
  onPlayerPress,
}: {
  players: PoolPlayer[];
  onPlayerPress: (p: PoolPlayer) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        {/* Header */}
        <View style={styles.poolHeaderRow}>
          <Text style={[styles.poolHeaderCell, styles.poolColName]}>PLAYER</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColPos]}>POS</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColHt]}>HT</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColClass]}>CLASS</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColSchool]}>SCHOOL</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColLevel]}>LEVEL</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColStats]}>KEY STATS</Text>
          <Text style={[styles.poolHeaderCell, styles.poolColFilm]}>FILM</Text>
        </View>
        {/* Rows */}
        {players.map((player, idx) => (
          <Pressable
            key={player.id}
            style={[styles.poolRow, idx % 2 === 1 && { backgroundColor: CARD_BG }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onPlayerPress(player);
            }}
          >
            <Text style={[styles.poolCellName, styles.poolColName]} numberOfLines={1}>
              {player.firstName} {player.lastName}
            </Text>
            <Text style={[styles.poolCell, styles.poolColPos]}>{player.position}</Text>
            <Text style={[styles.poolCell, styles.poolColHt]}>{player.height}</Text>
            <Text style={[styles.poolCell, styles.poolColClass]}>{player.classYear}</Text>
            <Text style={[styles.poolCell, styles.poolColSchool]} numberOfLines={1}>{player.currentSchool}</Text>
            <Text style={[styles.poolCell, styles.poolColLevel]}>{player.level}</Text>
            <Text style={[styles.poolCell, styles.poolColStats]} numberOfLines={1}>{player.keyStatLine}</Text>
            <View style={styles.poolColFilm}>
              {player.hasFilm && (
                <IconSymbol name="film" size={14} color={GRAY} />
              )}
            </View>
          </Pressable>
        ))}
        {players.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No players match your filters</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// ─── PoolCardsView ───
function PoolCardsView({
  players,
  onPlayerPress,
}: {
  players: PoolPlayer[];
  onPlayerPress: (p: PoolPlayer) => void;
}) {
  return (
    <View style={styles.cardsGrid}>
      {players.map((player) => (
        <Pressable
          key={player.id}
          style={styles.playerCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPlayerPress(player);
          }}
        >
          {/* Position badge */}
          <View style={styles.cardPosBadge}>
            <Text style={styles.cardPosBadgeText}>{player.position}</Text>
          </View>

          <Text style={styles.cardName} numberOfLines={1}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={styles.cardSchool} numberOfLines={1}>
            {player.currentSchool}
          </Text>
          <Text style={styles.cardMeta}>
            {player.classYear} · {player.level}
          </Text>
          <Text style={styles.cardStats} numberOfLines={1}>
            {player.keyStatLine}
          </Text>
          {player.hasFilm && (
            <View style={styles.cardFilmBadge}>
              <IconSymbol name="film" size={10} color={GRAY} />
              <Text style={styles.cardFilmText}>Film</Text>
            </View>
          )}
        </Pressable>
      ))}
      {players.length === 0 && (
        <View style={[styles.emptyState, { width: '100%' }]}>
          <Text style={styles.emptyText}>No players match your filters</Text>
        </View>
      )}
    </View>
  );
}

// ─── PlayerQuickPeek (bottom sheet) ───
function PlayerQuickPeek({
  player,
  onClose,
}: {
  player: PoolPlayer;
  onClose: () => void;
}) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const season = useMemo(() => getLatestSeason(player.id), [player.id]);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [slideAnim, fadeAnim]);

  const dismiss = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      </Animated.View>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            height: SHEET_HEIGHT,
            paddingBottom: insets.bottom + Spacing.md,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.sheetContent}>
          {/* Player identity */}
          <Text style={styles.peekName}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={styles.peekMeta}>
            {player.position} · Class {player.classYear} · {player.currentSchool}
          </Text>
          <Text style={styles.peekLevel}>
            {player.level}{player.conference !== player.level ? ` · ${player.conference}` : ''} · {player.state}
          </Text>

          {/* Key stat line */}
          <View style={styles.peekStatHero}>
            <Text style={styles.peekStatHeroText}>{player.keyStatLine}</Text>
          </View>

          {/* Season stats if available */}
          {season && (
            <View style={styles.peekSeasonCard}>
              <Text style={styles.peekSeasonTitle}>{season.season} Stats</Text>
              <View style={styles.peekStatsRow}>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.ppg}</Text>
                  <Text style={styles.peekStatLabel}>PPG</Text>
                </View>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.rpg}</Text>
                  <Text style={styles.peekStatLabel}>RPG</Text>
                </View>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.apg}</Text>
                  <Text style={styles.peekStatLabel}>APG</Text>
                </View>
                <View style={styles.peekStatItem}>
                  <Text style={styles.peekStatValue}>{season.fgPct}%</Text>
                  <Text style={styles.peekStatLabel}>FG%</Text>
                </View>
                {season.threePct > 0 && (
                  <View style={styles.peekStatItem}>
                    <Text style={styles.peekStatValue}>{season.threePct}%</Text>
                    <Text style={styles.peekStatLabel}>3P%</Text>
                  </View>
                )}
              </View>
              <Text style={styles.peekSeasonMeta}>
                {season.gp} GP · {season.mpg} MPG · {season.school}
              </Text>
            </View>
          )}

          {/* Action buttons */}
          <View style={styles.peekActions}>
            <Pressable
              style={styles.peekActionPrimary}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                dismiss();
                router.push({ pathname: '/coach/player-profile', params: { id: player.id } });
              }}
            >
              <Text style={styles.peekActionPrimaryText}>Full Profile</Text>
            </Pressable>
            <Pressable
              style={styles.peekActionSecondary}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={styles.peekActionSecondaryText}>Ask Nexus</Text>
            </Pressable>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// ─── Reusable Player Pool Content (embedded in Coach Hub PagerView) ───
export function PlayerPoolContent() {
  const insets = useSafeAreaInsets();

  // State
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<PoolLevel | null>(null);
  const [seasonFilter, setSeasonFilter] = useState('2025-26');
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [conferenceFilter, setConferenceFilter] = useState<string | null>(null);
  const [posFilter, setPosFilter] = useState<PoolPosition | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [minMpg, setMinMpg] = useState(0);
  const [filmOnly, setFilmOnly] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('list');
  const [peekPlayer, setPeekPlayer] = useState<PoolPlayer | null>(null);

  // Filtering logic
  const filtered = useMemo(() => {
    let list = PLAYER_POOL;

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.currentSchool.toLowerCase().includes(q)
      );
    }
    if (levelFilter) list = list.filter((p) => p.level === levelFilter);
    if (conferenceFilter) list = list.filter((p) => p.conference === conferenceFilter);
    if (posFilter) list = list.filter((p) => p.position === posFilter);
    if (classFilter) list = list.filter((p) => p.classYear === classFilter);
    if (stateFilter) list = list.filter((p) => p.state === stateFilter);
    if (minMpg > 0) {
      list = list.filter((p) => {
        const season = getLatestSeason(p.id);
        return season && season.mpg >= minMpg;
      });
    }
    if (filmOnly) list = list.filter((p) => p.hasFilm);

    return list;
  }, [search, levelFilter, conferenceFilter, posFilter, classFilter, stateFilter, minMpg, filmOnly]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <PoolHeader
          search={search}
          onSearchChange={setSearch}
          levelFilter={levelFilter}
          onLevelChange={setLevelFilter}
          seasonFilter={seasonFilter}
          onSeasonChange={setSeasonFilter}
        />

        <FilterRow
          expanded={filtersExpanded}
          onToggle={() => setFiltersExpanded(!filtersExpanded)}
          conferenceFilter={conferenceFilter}
          onConferenceChange={setConferenceFilter}
          posFilter={posFilter}
          onPosChange={setPosFilter}
          classFilter={classFilter}
          onClassChange={setClassFilter}
          stateFilter={stateFilter}
          onStateChange={setStateFilter}
          minMpg={minMpg}
          onMinMpgChange={setMinMpg}
          filmOnly={filmOnly}
          onFilmOnlyChange={setFilmOnly}
        />

        <View style={styles.viewToggleRow}>
          <Text style={styles.resultCountText}>{filtered.length} players</Text>
          <ViewToggle activeView={activeView} onViewChange={setActiveView} />
        </View>

        {activeView === 'list' && (
          <PoolListView players={filtered} onPlayerPress={setPeekPlayer} />
        )}

        {activeView === 'cards' && (
          <PoolCardsView players={filtered} onPlayerPress={setPeekPlayer} />
        )}

        {activeView === 'compare' && (
          <View style={styles.comingSoon}>
            <IconSymbol name="arrow.left.arrow.right" size={32} color={GRAY} />
            <Text style={styles.comingSoonText}>Compare View</Text>
            <Text style={styles.comingSoonSub}>Coming Soon</Text>
          </View>
        )}
      </ScrollView>

      {/* Quick Peek Sheet */}
      {peekPlayer && (
        <PlayerQuickPeek
          player={peekPlayer}
          onClose={() => setPeekPlayer(null)}
        />
      )}
    </View>
  );
}

// ─── Standalone Screen (navigated from coach hub tabs on other screens) ───
export default function CoachRecruitingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: DIVIDER }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubTabsContent}>
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === 'recruiting';
            return (
              <Pressable
                key={tab.id}
                style={[styles.hubTab, isActive && [styles.hubTabActive, { borderBottomColor: WHITE }]]}
                onPress={() => {
                  if (tab.id === 'recruiting') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.id === 'home' || tab.id === 'roster') {
                    router.back();
                  } else if (tab.route) {
                    router.replace(tab.route as any);
                  }
                }}
              >
                <ThemedText style={[styles.hubTabLabel, { color: isActive ? WHITE : GRAY }, isActive && styles.hubTabLabelActive]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <PlayerPoolContent />

      <TabFooter activeTab="Home" />
    </View>
  );
}

// ─── Styles ───
const styles = StyleSheet.create({
  container: { flex: 1 },

  // Hub tabs
  hubTabsContainer: { borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: BG },
  hubTabsContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  hubTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  hubTabActive: { borderBottomWidth: 2 },
  hubTabLabel: { fontSize: 14, fontWeight: '500' },
  hubTabLabelActive: { fontWeight: '600' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },

  // ── Pool Header ──
  poolHeader: { marginTop: 8 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  title: { fontSize: 22, fontWeight: '700', color: WHITE },
  contextPill: { backgroundColor: CARD_BG, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  contextPillText: { fontSize: 12, fontWeight: '500', color: GRAY },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    height: 40,
    marginBottom: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: WHITE, paddingVertical: 0 },

  dropdownRow: { gap: 8, marginBottom: 8 },
  dropdownChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: CARD_BG,
  },
  dropdownChipActive: { backgroundColor: WHITE },
  dropdownChipText: { fontSize: 12, fontWeight: '500', color: GRAY },
  dropdownChipTextActive: { color: BG },

  seasonRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  seasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: CARD_BG,
  },
  seasonChipActive: { backgroundColor: DIVIDER },
  seasonChipText: { fontSize: 11, fontWeight: '500', color: GRAY },
  seasonChipTextActive: { color: WHITE },

  // ── Filters ──
  filterSection: { marginBottom: 8 },
  filterToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  filterToggleText: { fontSize: 13, fontWeight: '600', color: GRAY },
  filterChipsScroll: { marginTop: 6, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 6,
    backgroundColor: CARD_BG,
  },
  filterChipActive: { backgroundColor: WHITE },
  filterChipText: { fontSize: 12, fontWeight: '500', color: GRAY },
  filterChipTextActive: { color: BG },
  filterDividerV: { width: 1, height: 20, backgroundColor: DIVIDER, marginHorizontal: 4, alignSelf: 'center' },

  // ── View Toggle ──
  viewToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  resultCountText: { fontSize: 13, fontWeight: '500', color: GRAY },
  viewToggleContainer: { flexDirection: 'row', alignItems: 'center' },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: CARD_BG,
    borderRadius: 8,
    height: 32,
    alignItems: 'center',
    padding: 2,
  },
  viewToggleBtn: {
    width: 30,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  viewToggleBtnActive: { backgroundColor: DIVIDER },
  resultCount: {},

  // ── Pool List Table ──
  poolHeaderRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: DIVIDER, paddingBottom: 8, marginBottom: 4 },
  poolHeaderCell: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, paddingHorizontal: 4, color: GRAY },
  poolColName: { width: 160 },
  poolColPos: { width: 44, textAlign: 'center' },
  poolColHt: { width: 52, textAlign: 'center' },
  poolColClass: { width: 52, textAlign: 'center' },
  poolColSchool: { width: 140 },
  poolColLevel: { width: 80, textAlign: 'center' },
  poolColStats: { width: 160 },
  poolColFilm: { width: 40, alignItems: 'center', justifyContent: 'center' },
  poolRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  poolCell: { fontSize: 13, paddingHorizontal: 4, color: WHITE },
  poolCellName: { fontSize: 14, fontWeight: '500', paddingHorizontal: 4, color: WHITE },

  // ── Cards Grid ──
  cardsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  playerCard: {
    width: '48%',
    backgroundColor: CARD_BG,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  cardPosBadge: {
    alignSelf: 'flex-start',
    backgroundColor: DIVIDER,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  cardPosBadgeText: { fontSize: 10, fontWeight: '700', color: WHITE },
  cardName: { fontSize: 15, fontWeight: '600', color: WHITE },
  cardSchool: { fontSize: 12, color: GRAY },
  cardMeta: { fontSize: 11, color: GRAY },
  cardStats: { fontSize: 12, fontWeight: '500', color: WHITE, marginTop: 4 },
  cardFilmBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  cardFilmText: { fontSize: 10, color: GRAY },

  // ── Compare Coming Soon ──
  comingSoon: { alignItems: 'center', paddingVertical: 60, gap: 8 },
  comingSoonText: { fontSize: 18, fontWeight: '600', color: WHITE },
  comingSoonSub: { fontSize: 14, color: GRAY },

  // ── Quick Peek Sheet ──
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: CARD_BG,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  handleContainer: { alignItems: 'center', paddingVertical: Spacing.sm },
  handle: { width: 36, height: 4, borderRadius: 2, backgroundColor: DIVIDER },
  sheetContent: { flex: 1 },

  peekName: { fontSize: 22, fontWeight: '700', color: WHITE, marginBottom: 2 },
  peekMeta: { fontSize: 14, color: GRAY, marginBottom: 2 },
  peekLevel: { fontSize: 13, color: GRAY, marginBottom: 12 },
  peekStatHero: {
    backgroundColor: BG,
    borderRadius: BorderRadius.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    marginBottom: 14,
  },
  peekStatHeroText: { fontSize: 20, fontWeight: '700', color: WHITE },

  peekSeasonCard: {
    backgroundColor: BG,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: 16,
  },
  peekSeasonTitle: { fontSize: 12, fontWeight: '700', color: GRAY, letterSpacing: 0.5, marginBottom: 10 },
  peekStatsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  peekStatItem: { alignItems: 'center' },
  peekStatValue: { fontSize: 18, fontWeight: '700', color: WHITE },
  peekStatLabel: { fontSize: 10, fontWeight: '600', color: GRAY, marginTop: 2 },
  peekSeasonMeta: { fontSize: 12, color: GRAY, textAlign: 'center' },

  peekActions: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  peekActionPrimary: {
    flex: 1,
    backgroundColor: WHITE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  peekActionPrimaryText: { fontSize: 15, fontWeight: '600', color: BG },
  peekActionSecondary: {
    flex: 1,
    backgroundColor: DIVIDER,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  peekActionSecondaryText: { fontSize: 15, fontWeight: '600', color: WHITE },

  // ── Empty State ──
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: GRAY },
});
