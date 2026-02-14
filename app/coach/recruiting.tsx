/**
 * Coach Recruiting Screen — National Pool
 * Single "Filter" pill opens an iOS bottom sheet with accordion sections:
 * Division, Conference & Teams, Position, Sort By (clusters + sub-traits).
 * Uses draft-based filtering — changes commit only on "Apply Filters".
 */

import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing, BorderRadius } from '@/constants/theme';
import { PLAYER_POOL, type PoolLevel, type PoolPlayer } from '@/data/playerPool';
import { getPlayerRatings, getPoolPlayerSubclusters, getTeamClusterAverages, WEEKLY_UPDATE_OPTIONS } from '@/data/playerRatings';
import { HELIO_TO_TRADITIONAL, TRADITIONAL_TO_HELIO, HELIO_POSITIONS, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { SORT_CLUSTER_LABELS, CLUSTER_ORDER, TRAIT_LIBRARY } from '@/data/trait-library';
import { ARCHETYPE_OPTIONS } from '@/data/archetype-options';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import {
  FilterSheet,
  SectionHeader,
  RadioRow,
  CheckboxRow,
  ConferenceRow,
  DEFAULT_FILTERS,
  type NationalPoolFilters,
} from '@/components/recruiting/filter-sort-panel';
import type { ClusterType } from '@/types';
import { PlayerSheet } from '@/components/player-sheet';

// Board imports
import {
  BOARD_COLUMNS,
  BOARD_COLUMN_COLORS,
  type BoardEntry,
  type BoardStatus,
  type Priority as BoardPriority,
} from '@/data/recruitingBoard';
import { BoardColumn } from '@/components/recruiting/board-column';
import {
  BoardFilters,
  DEFAULT_BOARD_FILTERS,
  type BoardFilterState,
} from '@/components/recruiting/board-filters';
import {
  loadBoard,
  useBoardPersistence,
  moveEntry,
  removeEntry,
  addEntry,
  updateEntry,
} from '@/utils/recruiting-board-store';

// ─── Constants ───
const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

const HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'recruiting', label: 'Recruiting' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System', route: '/coach/program-context' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];


// ─── Division hierarchy for filter panel ───
interface DivisionItem {
  label: string;
  value?: PoolLevel;
  children?: { value: PoolLevel; label: string }[];
}

const DIVISION_HIERARCHY: DivisionItem[] = [
  { label: 'NCAA', value: 'NCAA', children: [
    { value: 'NCAA D1', label: 'D1' },
    { value: 'NCAA D2', label: 'D2' },
    { value: 'NCAA D3', label: 'D3' },
  ]},
  { label: 'NAIA', value: 'NAIA' },
  { label: 'JUCO', value: 'JUCO', children: [
    { value: 'JUCO D1', label: 'D1' },
    { value: 'JUCO D2', label: 'D2' },
    { value: 'JUCO D3', label: 'D3' },
  ]},
  { label: 'USCAA', value: 'USCAA' },
  { label: 'NCCAA', value: 'NCCAA', children: [
    { value: 'NCCAA D1', label: 'D1' },
    { value: 'NCCAA D2', label: 'D2' },
  ]},
  { label: '3C2A', value: '3C2A' },
  { label: 'International', value: 'International' },
];

// Parent division values that match all sub-levels (e.g. 'JUCO' matches 'JUCO', 'JUCO D1', 'JUCO D2', 'JUCO D3')
const PARENT_DIVISIONS = new Set(
  DIVISION_HIERARCHY.filter((d) => d.children && d.value).map((d) => d.value!),
);

function matchesDivision(playerLevel: PoolLevel, filterDiv: PoolLevel): boolean {
  if (filterDiv === playerLevel) return true;
  if (PARENT_DIVISIONS.has(filterDiv)) return playerLevel.startsWith(filterDiv);
  return false;
}

// ─── Board cluster/subcluster sort helper ───
function getSubclusterRating(playerId: string, subclusterId: string): number {
  const ratings = getPlayerRatings(playerId);
  if (!ratings) return 0;
  // Find which cluster this subcluster belongs to
  for (const clusterKey of CLUSTER_ORDER) {
    const subs = TRAIT_LIBRARY[clusterKey];
    const subIndex = subs.findIndex((s) => s.id === subclusterId);
    if (subIndex >= 0) {
      const subRatings = getPoolPlayerSubclusters(playerId, clusterKey, ratings.clusters[clusterKey]);
      return subRatings[subIndex]?.rating ?? 0;
    }
  }
  return 0;
}

// ─── Reusable core content (used in home PagerView AND standalone screen) ───
export function PlayerPoolContent() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // State
  const [filters, setFilters] = useState<NationalPoolFilters>({ ...DEFAULT_FILTERS });
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [draft, setDraft] = useState<NationalPoolFilters>({ ...DEFAULT_FILTERS });
  const [peekPlayer, setPeekPlayer] = useState<PoolPlayer | null>(null);
  const [fitNotes, setFitNotes] = useState<Record<string, string>>({});
  const [coachNotes, setCoachNotes] = useState<Record<string, string>>({});
  const [sheetOffStyle, setSheetOffStyle] = useState<import('@/types').OffensiveStyle>('motion_read_react');
  const [sheetDefStyle, setSheetDefStyle] = useState<import('@/types').DefensiveStyle>('pack_line');
  const [listMode, setListMode] = useState<'board' | 'player' | 'team'>('board');
  const [divSheetOpen, setDivSheetOpen] = useState(false);
  const [divExpandedGroups, setDivExpandedGroups] = useState<Set<string>>(new Set());

  // ── Board state ──
  const [boardEntries, setBoardEntries] = useState<BoardEntry[]>([]);
  const [boardLoaded, setBoardLoaded] = useState(false);
  const [boardFilters, setBoardFilters] = useState<BoardFilterState>({ ...DEFAULT_BOARD_FILTERS });
  const [boardViewMode, setBoardViewMode] = useState<'kanban' | 'list'>('kanban');
  const [boardSearch, setBoardSearch] = useState('');
  const [boardSortKey, setBoardSortKey] = useState<'rank' | 'kr' | 'fit' | 'position' | 'updated' | 'priority'>('rank');
  const [quickActionsEntry, setQuickActionsEntry] = useState<BoardEntry | null>(null);
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [addSelectionMode, setAddSelectionMode] = useState(false);

  // Load board from AsyncStorage
  useEffect(() => {
    loadBoard().then((entries) => {
      setBoardEntries(entries);
      setBoardLoaded(true);
    });
  }, []);

  // Auto-save
  useBoardPersistence(boardEntries);

  // Board entries filtered by board-specific filters + search
  const filteredBoardEntries = useMemo(() => {
    let list = boardEntries;
    if (boardSearch) {
      const q = boardSearch.toLowerCase();
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p) return false;
        return (
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.currentSchool.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
    }
    if (boardFilters.year) list = list.filter((e) => e.classYear === boardFilters.year);
    if (boardFilters.division) {
      const div = boardFilters.division;
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p) return false;
        // Exact match or parent-level match (e.g. 'NCAA' matches 'NCAA', 'NCAA D1', 'NCAA D2')
        return p.level === div || p.level.startsWith(div + ' ');
      });
    }
    if (boardFilters.status) list = list.filter((e) => e.status === boardFilters.status);
    if (boardFilters.position) list = list.filter((e) => e.position === boardFilters.position);

    // Sort by cluster/subcluster when selected
    if (boardFilters.cluster) {
      const clusterKey = boardFilters.cluster;
      const isCluster = CLUSTER_ORDER.includes(clusterKey as ClusterType);
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.playerId);
        const bR = getPlayerRatings(b.playerId);
        if (isCluster) {
          return (bR?.clusters[clusterKey as ClusterType] ?? 0) - (aR?.clusters[clusterKey as ClusterType] ?? 0);
        }
        // Subcluster — find which cluster it belongs to and get subcluster rating
        const aVal = getSubclusterRating(a.playerId, clusterKey);
        const bVal = getSubclusterRating(b.playerId, clusterKey);
        return bVal - aVal;
      });
    }

    return list;
  }, [boardEntries, boardSearch, boardFilters]);

  // Board summary stats
  const boardSummary = useMemo(() => {
    const total = boardEntries.length;
    const priorityA = boardEntries.filter((e) => e.priority === 'A').length;
    const avgKR = (() => {
      const krs = boardEntries
        .map((e) => getPlayerRatings(e.playerId)?.overall)
        .filter((v): v is number => v !== undefined && v !== null);
      return krs.length > 0 ? Math.round(krs.reduce((a, b) => a + b, 0) / krs.length) : 0;
    })();
    return { total, priorityA, avgKR };
  }, [boardEntries]);

  // Board list view sorted entries
  const sortedBoardList = useMemo(() => {
    const list = [...filteredBoardEntries];
    switch (boardSortKey) {
      case 'kr':
        return list.sort((a, b) => (getPlayerRatings(b.playerId)?.overall ?? 0) - (getPlayerRatings(a.playerId)?.overall ?? 0));
      case 'priority':
        return list.sort((a, b) => a.priority.localeCompare(b.priority));
      case 'position':
        return list.sort((a, b) => a.position.localeCompare(b.position));
      case 'updated':
        return list.sort((a, b) => b.updated.localeCompare(a.updated));
      default: // rank — group by status, sort by rank
        return list.sort((a, b) => {
          const statusOrder = BOARD_COLUMNS.indexOf(a.status) - BOARD_COLUMNS.indexOf(b.status);
          return statusOrder !== 0 ? statusOrder : a.rank - b.rank;
        });
    }
  }, [filteredBoardEntries, boardSortKey]);

  // Quick action handlers
  const handleMoveEntry = useCallback((entryId: string, newStatus: BoardStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardEntries((prev) => moveEntry(prev, entryId, newStatus));
    setQuickActionsEntry(null);
  }, []);

  const handleSetPriority = useCallback((entryId: string, priority: BoardPriority) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setBoardEntries((prev) => updateEntry(prev, entryId, { priority }));
    setQuickActionsEntry(null);
  }, []);

  const handleRemoveEntry = useCallback((entryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardEntries((prev) => removeEntry(prev, entryId));
    setQuickActionsEntry(null);
  }, []);

  const handleAddToBoard = useCallback((playerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardEntries((prev) => addEntry(prev, playerId));
  }, []);

  // Accordion state
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [expandedDivisionGroups, setExpandedDivisionGroups] = useState<Set<string>>(new Set());
  const [expandedConferences, setExpandedConferences] = useState<Set<string>>(new Set());
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  // Division multi-select: single-tap selects (temporary), double-tap "sticks" it
  const [stuckDivisions, setStuckDivisions] = useState<Set<string>>(new Set());
  const lastDivTapRef = useRef<{ time: number; item: string }>({ time: 0, item: '' });

  // Check if any filters active
  const hasActiveFilters = useMemo(() => {
    return (
      filters.division.length > 0 ||
      filters.conference !== null ||
      filters.teams.length > 0 ||
      filters.positions.length > 0 ||
      filters.sortCluster !== null ||
      filters.sortDirection !== 'desc' ||
      filters.archetypes.length > 0 ||
      filters.weeklyUpdate.length > 0
    );
  }, [filters]);

  // Filtering + sorting logic
  const filteredPlayers = useMemo(() => {
    let list = PLAYER_POOL;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.currentSchool.toLowerCase().includes(q)
      );
    }

    if (filters.division.length > 0) {
      list = list.filter((p) => filters.division.some((d) => matchesDivision(p.level, d)));
    }

    if (filters.conference) {
      list = list.filter((p) => p.conference === filters.conference);
    }

    if (filters.teams.length > 0) {
      list = list.filter((p) => filters.teams.includes(p.currentSchool));
    }

    if (filters.positions.length > 0) {
      const traditionalPositions = filters.positions.map((hp) => HELIO_TO_TRADITIONAL[hp]);
      list = list.filter((p) => traditionalPositions.includes(p.position));
    }

    if (filters.archetypes.length > 0) {
      list = list.filter((p) => filters.archetypes.includes(p.archetype));
    }

    // Sort direction multiplier (1 = desc, -1 = asc)
    const dir = filters.sortDirection === 'asc' ? -1 : 1;

    // Sort by cluster KR or default Overall KR
    if (filters.sortCluster) {
      const cluster = filters.sortCluster;
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.id);
        const bR = getPlayerRatings(b.id);
        const aVal = aR ? aR.clusters[cluster] : -1;
        const bVal = bR ? bR.clusters[cluster] : -1;
        return (bVal - aVal) * dir;
      });
    } else {
      // Default: sort by Overall KR
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.id);
        const bR = getPlayerRatings(b.id);
        const aVal = aR ? aR.overall : -1;
        const bVal = bR ? bR.overall : -1;
        return (bVal - aVal) * dir;
      });
    }

    return list;
  }, [filters]);

  // Derive conferences + teams for the filter panel (based on draft.division)
  const draftConferences = useMemo(() => {
    let pool = PLAYER_POOL;
    if (draft.division.length > 0) {
      pool = pool.filter((p) => draft.division.some((d) => matchesDivision(p.level, d)));
    }
    const confMap = new Map<string, string[]>();
    pool.forEach((p) => {
      if (!confMap.has(p.conference)) confMap.set(p.conference, []);
      const teams = confMap.get(p.conference)!;
      if (!teams.includes(p.currentSchool)) teams.push(p.currentSchool);
    });
    return [...confMap.entries()]
      .map(([conf, teams]) => ({ conference: conf, teams: teams.sort() }))
      .sort((a, b) => a.conference.localeCompare(b.conference));
  }, [draft.division]);

  // Panel handlers
  const openPanel = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ ...filters });
    setExpandedSections({});
    setExpandedDivisionGroups(new Set());
    setExpandedConferences(new Set());
    setExpandedClusters(new Set());
    setStuckDivisions(new Set(filters.division));
    lastDivTapRef.current = { time: 0, item: '' };
    setFilterPanelOpen(true);
  }, [filters]);

  const closePanel = useCallback(() => {
    setFilterPanelOpen(false);
  }, []);

  const applyFilters = useCallback(() => {
    setFilters((prev) => ({ ...draft, search: prev.search }));
    setFilterPanelOpen(false);
  }, [draft]);

  const resetDraft = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraft({ ...DEFAULT_FILTERS });
  }, []);

  const handleResetAll = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters({ ...DEFAULT_FILTERS });
  }, []);

  const toggleSection = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const toggleDivisionGroup = useCallback((group: string) => {
    setExpandedDivisionGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group); else next.add(group);
      return next;
    });
  }, []);

  const toggleConference = useCallback((conf: string) => {
    setExpandedConferences((prev) => {
      const next = new Set(prev);
      if (next.has(conf)) next.delete(conf); else next.add(conf);
      return next;
    });
  }, []);

  const toggleCluster = useCallback((cluster: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(cluster)) next.delete(cluster); else next.add(cluster);
      return next;
    });
  }, []);

  const resultCount = filteredPlayers.length;

  // Derive team rankings from player pool
  const teamRankings = useMemo(() => {
    const teamMap = new Map<string, { name: string; conference: string; level: string; playerIds: string[] }>();
    const pool = filters.division.length > 0
      ? PLAYER_POOL.filter((p) => filters.division.some((d) => matchesDivision(p.level, d)))
      : PLAYER_POOL;
    pool.forEach((p) => {
      if (!teamMap.has(p.currentSchool)) {
        teamMap.set(p.currentSchool, { name: p.currentSchool, conference: p.conference, level: p.level, playerIds: [] });
      }
      teamMap.get(p.currentSchool)!.playerIds.push(p.id);
    });
    return [...teamMap.values()]
      .map((t) => {
        const avg = getTeamClusterAverages(t.playerIds);
        // Top 3 players sorted by overall KR
        const topPlayers = t.playerIds
          .map((id) => {
            const r = getPlayerRatings(id);
            const p = PLAYER_POOL.find((pp) => pp.id === id)!;
            return { id, name: `${p.firstName} ${p.lastName}`, position: p.position, kr: r?.overall ?? 0 };
          })
          .sort((a, b) => b.kr - a.kr)
          .slice(0, 3);
        return { ...t, kr: avg.overall, offKR: avg.offKR, defKR: avg.defKR, clusters: avg.clusters, topPlayers };
      })
      .sort((a, b) => b.kr - a.kr);
  }, [filters.division]);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* ─── Hero Card ─── */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>NATIONAL POOL</Text>
          <Text style={styles.heroSubtitle}>
            Explore every player in the KaNeXT National Player Pool.
          </Text>

          {/* Search bar (pill) */}
          <View style={styles.heroSearchBar}>
            <TextInput
              style={styles.heroSearchInput}
              placeholder="Search Player"
              placeholderTextColor="#6B7080"
              value={filters.search}
              onChangeText={(text) => setFilters((prev) => ({ ...prev, search: text }))}
            />
            {filters.search.length > 0 ? (
              <Pressable onPress={() => setFilters((prev) => ({ ...prev, search: '' }))}>
                <IconSymbol name="xmark.circle.fill" size={18} color="#6B7080" />
              </Pressable>
            ) : (
              <IconSymbol name="magnifyingglass" size={18} color="#6B7080" />
            )}
          </View>

          {/* Filter pill */}
          <Pressable
            style={[styles.heroFilterPill, hasActiveFilters && styles.heroFilterPillActive]}
            onPress={openPanel}
          >
            <Text style={[styles.heroFilterText, hasActiveFilters && styles.heroFilterTextActive]}>
              FILTER
            </Text>
            <IconSymbol name="line.3.horizontal.decrease" size={14} color={hasActiveFilters ? BG : WHITE} />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </Pressable>
        </View>

        {/* Meta row below hero */}
        <View style={styles.metaRow}>
          <Text style={styles.resultCountText}>
            {listMode === 'team' ? `${teamRankings.length} teams` : `${resultCount} players`}
          </Text>
          {hasActiveFilters && (
            <Pressable onPress={handleResetAll}>
              <Text style={styles.resetLink}>Reset all</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
        </View>

        {/* Board / Player / Team toggle */}
        <View style={styles.ratingCardList}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {(['board', 'player', 'team'] as const).map((mode) => {
              const active = listMode === mode;
              return (
                <Pressable
                  key={mode}
                  style={{ flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: active ? WHITE : 'transparent' }}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setListMode(mode); }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', letterSpacing: 0.5, color: active ? WHITE : GRAY }}>{mode.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>

          {listMode === 'board' ? (
            <RecruitingBoardWorkspace
              entries={filteredBoardEntries}
              allEntries={boardEntries}
              loaded={boardLoaded}
              boardSearch={boardSearch}
              onBoardSearchChange={setBoardSearch}
              boardFilters={boardFilters}
              onBoardFiltersChange={setBoardFilters}
              viewMode={boardViewMode}
              onViewModeChange={setBoardViewMode}
              sortKey={boardSortKey}
              onSortKeyChange={setBoardSortKey}
              sortedList={sortedBoardList}
              summary={boardSummary}
              onCardPress={(entry) => {
                const player = PLAYER_POOL.find((p) => p.id === entry.playerId);
                if (player) {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPeekPlayer(player);
                }
              }}
              onCardLongPress={(entry) => {
                setQuickActionsEntry(entry);
              }}
              onAddPress={() => setAddSheetOpen(true)}
            />
          ) : listMode === 'player' ? (
            <>
              {addSelectionMode && (
                <Pressable
                  style={styles.addSelectionBanner}
                  onPress={() => { setAddSelectionMode(false); setListMode('board'); }}
                >
                  <Text style={styles.addSelectionText}>Tap + to add players to your board</Text>
                  <Text style={styles.addSelectionDone}>Done</Text>
                </Pressable>
              )}
              {filteredPlayers.map((player) => {
                const alreadyOnBoard = boardEntries.some((e) => e.playerId === player.id);
                return (
                  <View key={player.id} style={{ position: 'relative' }}>
                    <PlayerRatingCard
                      player={player}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPeekPlayer(player);
                      }}
                    />
                    {addSelectionMode && !alreadyOnBoard && (
                      <Pressable
                        style={styles.addToBoardBtn}
                        onPress={() => handleAddToBoard(player.id)}
                      >
                        <IconSymbol name="plus.circle.fill" size={24} color="#4CAF50" />
                      </Pressable>
                    )}
                    {addSelectionMode && alreadyOnBoard && (
                      <View style={styles.addToBoardBtn}>
                        <IconSymbol name="checkmark.circle.fill" size={24} color={GRAY} />
                      </View>
                    )}
                  </View>
                );
              })}
              {filteredPlayers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No players match your filters</Text>
                </View>
              )}
            </>
          ) : (
            <>
              {teamRankings.map((team, index) => (
                <TeamRatingCard
                  key={team.name}
                  team={team}
                  rank={index + 1}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    router.push({ pathname: '/coach/team-detail', params: { team: team.name } } as any);
                  }}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Division Picker Sheet */}
      <BottomSheet visible={divSheetOpen} onClose={() => setDivSheetOpen(false)} title="Select Division">
        {/* All option */}
        <Pressable
          style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: DIVIDER }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setFilters((prev) => ({ ...prev, division: [] })); setDivSheetOpen(false); }}
        >
          <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: filters.division.length === 0 ? WHITE : GRAY }}>All Divisions</Text>
          {filters.division.length === 0 && <IconSymbol name="checkmark" size={16} color={WHITE} />}
        </Pressable>
        {/* Division options with expandable sub-divisions */}
        {([
          { label: 'NCAA', value: 'NCAA' as PoolLevel, children: [
            { label: 'D1', value: 'NCAA D1' as PoolLevel },
            { label: 'D2', value: 'NCAA D2' as PoolLevel },
            { label: 'D3', value: 'NCAA D3' as PoolLevel },
          ]},
          { label: 'NAIA', value: 'NAIA' as PoolLevel },
          { label: 'JUCO', value: 'JUCO' as PoolLevel, children: [
            { label: 'D1', value: 'JUCO D1' as PoolLevel },
            { label: 'D2', value: 'JUCO D2' as PoolLevel },
            { label: 'D3', value: 'JUCO D3' as PoolLevel },
          ]},
          { label: 'USCAA', value: 'USCAA' as PoolLevel },
          { label: 'NCCAA', value: 'NCCAA' as PoolLevel, children: [
            { label: 'D1', value: 'NCCAA D1' as PoolLevel },
            { label: 'D2', value: 'NCCAA D2' as PoolLevel },
          ]},
          { label: '3C2A', value: '3C2A' as PoolLevel },
          { label: 'High School', value: 'HS' as PoolLevel },
          { label: 'International', value: 'International' as PoolLevel },
        ] as { label: string; value: PoolLevel; children?: { label: string; value: PoolLevel }[] }[]).map((div) => {
          const parentSelected = filters.division.includes(div.value);
          const hasChildren = div.children && div.children.length > 0;
          const expanded = divExpandedGroups.has(div.label);
          const anyChildSelected = hasChildren && div.children!.some((c) => filters.division.includes(c.value));
          return (
            <View key={div.value}>
              <View style={{ flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: DIVIDER }}>
                <Pressable
                  style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: 14 }}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFilters((prev) => {
                      const current = prev.division;
                      if (parentSelected) {
                        const childValues = div.children?.map((c) => c.value) ?? [];
                        return { ...prev, division: current.filter((d) => d !== div.value && !childValues.includes(d)) };
                      }
                      const childValues = div.children?.map((c) => c.value) ?? [];
                      return { ...prev, division: [...current.filter((d) => !childValues.includes(d)), div.value] };
                    });
                  }}
                >
                  <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: parentSelected || anyChildSelected ? WHITE : GRAY }}>{div.label}</Text>
                  {parentSelected && <IconSymbol name="checkmark" size={16} color={WHITE} />}
                </Pressable>
                {hasChildren && (
                  <Pressable
                    style={{ paddingHorizontal: 12, paddingVertical: 14 }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDivExpandedGroups((prev) => {
                        const next = new Set(prev);
                        if (next.has(div.label)) next.delete(div.label); else next.add(div.label);
                        return next;
                      });
                    }}
                  >
                    <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={14} color={GRAY} />
                  </Pressable>
                )}
              </View>
              {hasChildren && expanded && div.children!.map((child) => {
                const childSelected = filters.division.includes(child.value);
                return (
                  <Pressable
                    key={child.value}
                    style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingLeft: 24, borderBottomWidth: 1, borderBottomColor: DIVIDER }}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFilters((prev) => {
                        const current = prev.division;
                        const withoutParent = current.filter((d) => d !== div.value);
                        if (childSelected) {
                          return { ...prev, division: withoutParent.filter((d) => d !== child.value) };
                        }
                        return { ...prev, division: [...withoutParent, child.value] };
                      });
                    }}
                  >
                    <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: childSelected || parentSelected ? WHITE : GRAY }}>{child.label}</Text>
                    {(childSelected || parentSelected) && <IconSymbol name="checkmark" size={14} color={WHITE} />}
                  </Pressable>
                );
              })}
            </View>
          );
        })}
      </BottomSheet>

      {/* Recruiting Player Sheet */}
      <PlayerSheet
        visible={!!peekPlayer}
        onClose={() => setPeekPlayer(null)}
        player={peekPlayer}
        offStyle={sheetOffStyle}
        defStyle={sheetDefStyle}
        onOffStyleChange={setSheetOffStyle}
        onDefStyleChange={setSheetDefStyle}
        fitNote={peekPlayer ? (fitNotes[peekPlayer.id] ?? '') : ''}
        onFitNoteChange={(text) => {
          if (peekPlayer) setFitNotes((prev) => ({ ...prev, [peekPlayer.id]: text }));
        }}
        coachNote={peekPlayer ? (coachNotes[peekPlayer.id] ?? '') : ''}
        onCoachNoteChange={(text) => {
          if (peekPlayer) setCoachNotes((prev) => ({ ...prev, [peekPlayer.id]: text }));
        }}
      />

      {/* Quick Actions Sheet */}
      <BottomSheet
        visible={!!quickActionsEntry}
        onClose={() => setQuickActionsEntry(null)}
        title={(() => {
          if (!quickActionsEntry) return 'Actions';
          const p = PLAYER_POOL.find((pp) => pp.id === quickActionsEntry.playerId);
          return p ? `${p.firstName} ${p.lastName}` : 'Actions';
        })()}
      >
        {quickActionsEntry && (
          <View style={{ gap: 2 }}>
            {/* Move to... */}
            <Text style={styles.qaSection}>MOVE TO</Text>
            {BOARD_COLUMNS.filter((s) => s !== quickActionsEntry.status).map((status) => (
              <Pressable
                key={status}
                style={styles.qaRow}
                onPress={() => handleMoveEntry(quickActionsEntry.id, status)}
              >
                <View style={[styles.qaDot, { backgroundColor: BOARD_COLUMN_COLORS[status] }]} />
                <Text style={styles.qaRowText}>{status}</Text>
              </Pressable>
            ))}

            {/* Set Priority */}
            <Text style={[styles.qaSection, { marginTop: 12 }]}>SET PRIORITY</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['A', 'B', 'C'] as BoardPriority[]).map((p) => {
                const active = quickActionsEntry.priority === p;
                return (
                  <Pressable
                    key={p}
                    style={[styles.qaPriorityPill, active && styles.qaPriorityPillActive]}
                    onPress={() => handleSetPriority(quickActionsEntry.id, p)}
                  >
                    <Text style={[styles.qaPriorityText, active && styles.qaPriorityTextActive]}>{p}</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Open in National Pool */}
            <Pressable
              style={[styles.qaRow, { marginTop: 12 }]}
              onPress={() => {
                const player = PLAYER_POOL.find((pp) => pp.id === quickActionsEntry.playerId);
                if (player) {
                  setQuickActionsEntry(null);
                  setPeekPlayer(player);
                }
              }}
            >
              <IconSymbol name="person.fill" size={14} color={GRAY} />
              <Text style={styles.qaRowText}>View Full Profile</Text>
            </Pressable>

            {/* Remove */}
            <Pressable
              style={[styles.qaRow, { marginTop: 4 }]}
              onPress={() => handleRemoveEntry(quickActionsEntry.id)}
            >
              <IconSymbol name="trash" size={14} color="#EF4444" />
              <Text style={[styles.qaRowText, { color: '#EF4444' }]}>Remove from Board</Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>

      {/* Add to Board Sheet */}
      <BottomSheet
        visible={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        title="Add to Board"
      >
        <Pressable
          style={styles.qaRow}
          onPress={() => {
            setAddSheetOpen(false);
            setAddSelectionMode(true);
            setListMode('player');
          }}
        >
          <IconSymbol name="magnifyingglass" size={14} color={WHITE} />
          <Text style={styles.qaRowText}>Add from National Pool</Text>
        </Pressable>
      </BottomSheet>

      {/* ─── Filter Panel ─── */}
      <FilterSheet
        visible={filterPanelOpen}
        onClose={closePanel}
        title="Filters"
      >
        {/* Division */}
        <SectionHeader
          label="Division"
          expanded={!!expandedSections.division}
          onToggle={() => toggleSection('division')}
          summary={draft.division.length === 0 ? 'All' : draft.division.join(', ')}
        />
        {expandedSections.division && (
          <View>
            <View style={styles.pillGrid}>
              {/* All pill */}
              <Pressable
                style={[styles.divPill, draft.division.length === 0 && styles.divPillSelected]}
                onPress={() => {
                  setDraft((prev) => ({ ...prev, division: [], conference: null, teams: [] }));
                  setExpandedDivisionGroups(new Set());
                  setStuckDivisions(new Set());
                  lastDivTapRef.current = { time: 0, item: '' };
                }}
              >
                <Text style={[styles.divPillText, draft.division.length === 0 && styles.divPillTextSelected]}>All</Text>
              </Pressable>

              {DIVISION_HIERARCHY.map((item) =>
                item.children ? (
                  <Pressable
                    key={item.label}
                    style={[
                      styles.divPill,
                      (draft.division.includes(item.value!) || item.children.some((c) => draft.division.includes(c.value))) && styles.divPillSelected,
                    ]}
                    onPress={() => {
                      const itemVal = item.value!;
                      const relatedValues: PoolLevel[] = [itemVal, ...item.children!.map((c) => c.value)];
                      const now = Date.now();
                      const last = lastDivTapRef.current;
                      const isDoubleTap = now - last.time < 400 && last.item === itemVal;
                      lastDivTapRef.current = { time: now, item: itemVal };

                      if (isDoubleTap) {
                        // Double-tap: toggle stuck state
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        const isStuck = [...stuckDivisions].some((d) => relatedValues.includes(d));
                        if (isStuck) {
                          // Unstick and remove
                          setStuckDivisions((prev) => { const n = new Set(prev); relatedValues.forEach((v) => n.delete(v)); return n; });
                          setDraft((prev) => ({ ...prev, division: prev.division.filter((d) => !relatedValues.includes(d)), conference: null, teams: [] }));
                          setExpandedDivisionGroups((prev) => { const n = new Set(prev); n.delete(item.label); return n; });
                        } else {
                          // Stick it (already in division from first tap)
                          setStuckDivisions((prev) => new Set([...prev, itemVal]));
                        }
                        lastDivTapRef.current = { time: 0, item: '' };
                      } else {
                        // Single tap: select temporarily (keep stuck items, replace temp)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const stuck = draft.division.filter((d) => stuckDivisions.has(d));
                        const newDiv = stuck.some((d) => relatedValues.includes(d)) ? stuck : [...stuck, itemVal];
                        setDraft((prev) => ({ ...prev, division: newDiv, conference: null, teams: [] }));
                        setExpandedDivisionGroups(new Set([item.label]));
                      }
                    }}
                  >
                    <Text style={[
                      styles.divPillText,
                      (draft.division.includes(item.value!) || item.children.some((c) => draft.division.includes(c.value))) && styles.divPillTextSelected,
                    ]}>
                      {item.children.find((c) => draft.division.includes(c.value))?.value ?? item.label}
                    </Text>
                  </Pressable>
                ) : (
                  <Pressable
                    key={item.value}
                    style={[styles.divPill, draft.division.includes(item.value!) && styles.divPillSelected]}
                    onPress={() => {
                      const itemVal = item.value!;
                      const now = Date.now();
                      const last = lastDivTapRef.current;
                      const isDoubleTap = now - last.time < 400 && last.item === itemVal;
                      lastDivTapRef.current = { time: now, item: itemVal };

                      if (isDoubleTap) {
                        // Double-tap: toggle stuck state
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if (stuckDivisions.has(itemVal)) {
                          // Unstick and remove
                          setStuckDivisions((prev) => { const n = new Set(prev); n.delete(itemVal); return n; });
                          setDraft((prev) => ({ ...prev, division: prev.division.filter((d) => d !== itemVal), conference: null, teams: [] }));
                        } else {
                          // Stick it (already in division from first tap)
                          setStuckDivisions((prev) => new Set([...prev, itemVal]));
                        }
                        lastDivTapRef.current = { time: 0, item: '' };
                      } else {
                        // Single tap: select temporarily (keep stuck items, replace temp)
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        const stuck = draft.division.filter((d) => stuckDivisions.has(d));
                        const newDiv = stuckDivisions.has(itemVal) ? stuck : [...stuck, itemVal];
                        setDraft((prev) => ({ ...prev, division: newDiv, conference: null, teams: [] }));
                      }
                    }}
                  >
                    <Text style={[styles.divPillText, draft.division.includes(item.value!) && styles.divPillTextSelected]}>{item.label}</Text>
                  </Pressable>
                )
              )}
            </View>

            <Text style={styles.sheetHelper}>Double-tap to lock selection</Text>

            {/* Inline sub-options for expanded group */}
            {DIVISION_HIERARCHY.map((item) =>
              item.children && expandedDivisionGroups.has(item.label) ? (
                <View key={`${item.label}-sub`} style={styles.pillSubGrid}>
                  {/* "All" sub-pill to select the parent division */}
                  <Pressable
                    style={[styles.divSubPill, draft.division.includes(item.value!) && styles.divSubPillSelected]}
                    onPress={() => {
                      // Replace any children with the parent value
                      const childValues = item.children!.map((c) => c.value);
                      setDraft((prev) => ({
                        ...prev,
                        division: [...prev.division.filter((d) => !childValues.includes(d) && d !== item.value!), item.value!],
                        conference: null,
                        teams: [],
                      }));
                    }}
                  >
                    <Text style={[styles.divSubPillText, draft.division.includes(item.value!) && styles.divSubPillTextSelected]}>
                      All
                    </Text>
                  </Pressable>
                  {item.children.map((child) => (
                    <Pressable
                      key={child.value}
                      style={[styles.divSubPill, draft.division.includes(child.value) && styles.divSubPillSelected]}
                      onPress={() => {
                        setDraft((prev) => {
                          const parentVal = item.value!;
                          if (prev.division.includes(child.value)) {
                            // Deselect child, revert to parent
                            return { ...prev, division: prev.division.map((d) => d === child.value ? parentVal : d), conference: null, teams: [] };
                          }
                          // Replace parent with this specific child
                          if (prev.division.includes(parentVal)) {
                            return { ...prev, division: prev.division.map((d) => d === parentVal ? child.value : d), conference: null, teams: [] };
                          }
                          // Add child directly
                          return { ...prev, division: [...prev.division, child.value], conference: null, teams: [] };
                        });
                      }}
                    >
                      <Text style={[styles.divSubPillText, draft.division.includes(child.value) && styles.divSubPillTextSelected]}>
                        {child.label}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ) : null
            )}
          </View>
        )}

        {/* Conference */}
        <SectionHeader
          label="Conference"
          expanded={!!expandedSections.conference}
          onToggle={() => toggleSection('conference')}
          summary={draft.conference ?? 'All'}
        />
        {expandedSections.conference && (
          <View>
            <RadioRow
              label="All"
              selected={draft.conference === null}
              onPress={() => setDraft((prev) => ({ ...prev, conference: null }))}
              indent
            />
            {draftConferences.map(({ conference }) => (
              <RadioRow
                key={conference}
                label={conference}
                selected={draft.conference === conference}
                onPress={() => setDraft((prev) => ({ ...prev, conference }))}
                indent
              />
            ))}
          </View>
        )}

        {/* Position */}
        <SectionHeader
          label="Position"
          expanded={!!expandedSections.position}
          onToggle={() => toggleSection('position')}
        />
        {expandedSections.position && (
          <View>
            <View style={styles.pillGrid}>
              <Pressable
                style={[styles.divPill, draft.positions.length === 0 && styles.divPillSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraft((prev) => ({ ...prev, positions: [] }));
                }}
              >
                <Text style={[styles.divPillText, draft.positions.length === 0 && styles.divPillTextSelected]}>All</Text>
              </Pressable>
            </View>
            {HELIO_POSITIONS.map((pos) => (
              <CheckboxRow
                key={pos}
                label={`${pos} — ${HELIO_POSITION_LABELS[pos]}`}
                checked={draft.positions.includes(pos)}
                indent
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraft((prev) => {
                    const next = prev.positions.includes(pos)
                      ? prev.positions.filter((p) => p !== pos)
                      : [...prev.positions, pos];
                    return { ...prev, positions: next };
                  });
                }}
              />
            ))}
          </View>
        )}

        {/* Sort By */}
        <SectionHeader
          label="Sort By"
          expanded={!!expandedSections.sort}
          onToggle={() => toggleSection('sort')}
        />
        {expandedSections.sort && (
          <View>
            <View style={styles.pillGrid}>
              <Pressable
                style={[styles.divPill, draft.sortCluster === null && styles.divPillSelected]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraft((prev) => ({ ...prev, sortCluster: null, sortSubTrait: null }));
                }}
              >
                <Text style={[styles.divPillText, draft.sortCluster === null && styles.divPillTextSelected]}>KaNeXT Sort</Text>
              </Pressable>
            </View>
            {CLUSTER_ORDER.map((cluster) => (
              <View key={cluster}>
                <RadioRow
                  label={SORT_CLUSTER_LABELS[cluster]}
                  selected={draft.sortCluster === cluster && !draft.sortSubTrait}
                  hasChevron
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDraft((prev) => ({ ...prev, sortCluster: cluster, sortSubTrait: null }));
                    toggleCluster(cluster);
                  }}
                  indent
                />
                {expandedClusters.has(cluster) && (
                  <View>
                    {(TRAIT_LIBRARY[cluster] ?? []).map((sub) => (
                      <RadioRow
                        key={sub.id}
                        label={sub.label}
                        selected={draft.sortCluster === cluster && draft.sortSubTrait === sub.id}
                        onPress={() => {
                          setDraft((prev) => ({
                            ...prev,
                            sortCluster: cluster,
                            sortSubTrait: sub.id,
                          }));
                        }}
                        indent
                      />
                    ))}
                  </View>
                )}
              </View>
            ))}

            {/* Sort Direction */}
            <View style={[styles.pillGrid, { paddingTop: 6 }]}>
              {([['desc', 'High \u2192 Low'], ['asc', 'Low \u2192 High']] as const).map(([val, label]) => (
                <Pressable
                  key={val}
                  style={[styles.divPill, draft.sortDirection === val && styles.divPillSelected]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setDraft((prev) => ({ ...prev, sortDirection: val }));
                  }}
                >
                  <Text style={[styles.divPillText, draft.sortDirection === val && styles.divPillTextSelected]}>{label}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Archetype (Players mode only) */}
        {listMode === 'player' && (
          <>
            <SectionHeader
              label="Archetype"
              expanded={!!expandedSections.archetype}
              onToggle={() => toggleSection('archetype')}
              summary={draft.archetypes.length === 0 ? 'All' : `${draft.archetypes.length} selected`}
            />
            {expandedSections.archetype && (
              <View>
                {ARCHETYPE_OPTIONS.map((opt) => (
                  <CheckboxRow
                    key={opt.value}
                    label={opt.label}
                    checked={draft.archetypes.includes(opt.value)}
                    indent
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setDraft((prev) => {
                        const next = prev.archetypes.includes(opt.value)
                          ? prev.archetypes.filter((a) => a !== opt.value)
                          : [...prev.archetypes, opt.value];
                        return { ...prev, archetypes: next };
                      });
                    }}
                  />
                ))}
              </View>
            )}
          </>
        )}

        {/* Weekly Updates */}
        <SectionHeader
          label="Weekly Updates"
          expanded={!!expandedSections.weekly}
          onToggle={() => toggleSection('weekly')}
          summary={draft.weeklyUpdate.length === 0 ? 'All' : `${draft.weeklyUpdate.length} selected`}
        />
        {expandedSections.weekly && (
          <View>
            {WEEKLY_UPDATE_OPTIONS.map((opt) => (
              <CheckboxRow
                key={opt.value}
                label={opt.label}
                checked={draft.weeklyUpdate.includes(opt.value)}
                indent
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDraft((prev) => {
                    const next = prev.weeklyUpdate.includes(opt.value)
                      ? prev.weeklyUpdate.filter((w) => w !== opt.value)
                      : [...prev.weeklyUpdate, opt.value];
                    return { ...prev, weeklyUpdate: next };
                  });
                }}
              />
            ))}
          </View>
        )}

        {/* Team (Players mode only) */}
        {listMode === 'player' && (
          <>
            <SectionHeader
              label="Team"
              expanded={!!expandedSections.team}
              onToggle={() => toggleSection('team')}
              summary={draft.teams.length === 0 ? 'All' : `${draft.teams.length} selected`}
            />
            {expandedSections.team && (
              <View>
                {draftConferences.map(({ conference, teams }) => (
                  <View key={conference}>
                    <ConferenceRow
                      label={conference}
                      teamCount={teams.length}
                      expanded={expandedConferences.has(conference)}
                      onToggle={() => toggleConference(conference)}
                    />
                    {expandedConferences.has(conference) && teams.map((teamName) => (
                      <CheckboxRow
                        key={teamName}
                        label={teamName}
                        checked={draft.teams.includes(teamName)}
                        indent
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setDraft((prev) => {
                            const next = prev.teams.includes(teamName)
                              ? prev.teams.filter((t) => t !== teamName)
                              : [...prev.teams, teamName];
                            return { ...prev, teams: next };
                          });
                        }}
                      />
                    ))}
                  </View>
                ))}
              </View>
            )}
          </>
        )}

        {/* Inline footer buttons */}
        <View style={styles.inlineFooter}>
          <Pressable style={styles.footerResetBtn} onPress={resetDraft}>
            <Text style={styles.footerResetText}>Reset Filters</Text>
          </Pressable>
          <Pressable style={styles.footerApplyBtn} onPress={applyFilters}>
            <Text style={styles.footerApplyText}>Apply Filters</Text>
          </Pressable>
        </View>
      </FilterSheet>
    </View>
  );
}

// ─── Standalone Screen ───
export default function CoachRecruitingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { backgroundColor: BG }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { paddingTop: insets.top, borderBottomColor: DIVIDER }]}>
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
                    router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
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

// ─── Recruiting Board Workspace ───
const SORT_OPTIONS: { key: string; label: string }[] = [
  { key: 'rank', label: 'Board Rank' },
  { key: 'kr', label: 'KR Overall' },
  { key: 'priority', label: 'Priority' },
  { key: 'position', label: 'Position' },
  { key: 'updated', label: 'Updated' },
];

function RecruitingBoardWorkspace({
  entries,
  allEntries,
  loaded,
  boardSearch,
  onBoardSearchChange,
  boardFilters,
  onBoardFiltersChange,
  viewMode,
  onViewModeChange,
  sortKey,
  onSortKeyChange,
  sortedList,
  summary,
  onCardPress,
  onCardLongPress,
  onAddPress,
}: {
  entries: BoardEntry[];
  allEntries: BoardEntry[];
  loaded: boolean;
  boardSearch: string;
  onBoardSearchChange: (text: string) => void;
  boardFilters: BoardFilterState;
  onBoardFiltersChange: (f: BoardFilterState) => void;
  viewMode: 'kanban' | 'list';
  onViewModeChange: (m: 'kanban' | 'list') => void;
  sortKey: string;
  onSortKeyChange: (k: any) => void;
  sortedList: BoardEntry[];
  summary: { total: number; priorityA: number; avgKR: number };
  onCardPress: (entry: BoardEntry) => void;
  onCardLongPress: (entry: BoardEntry) => void;
  onAddPress: () => void;
}) {
  if (!loaded) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Loading board...</Text>
      </View>
    );
  }

  return (
    <View>
      {/* Board Header */}
      <View style={styles.boardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.boardTitle}>RECRUITING BOARD</Text>
          <Text style={styles.boardSubtitle}>Shortlist, rank, and track targets.</Text>
        </View>
        <Pressable style={styles.addBtn} onPress={onAddPress}>
          <IconSymbol name="plus" size={14} color={WHITE} />
          <Text style={styles.addBtnText}>Add</Text>
        </Pressable>
      </View>

      {/* Board Search */}
      <View style={styles.boardSearchBar}>
        <IconSymbol name="magnifyingglass" size={14} color="#6B7080" />
        <TextInput
          style={styles.boardSearchInput}
          placeholder="Search player, team, archetype..."
          placeholderTextColor="#6B7080"
          value={boardSearch}
          onChangeText={onBoardSearchChange}
        />
        {boardSearch.length > 0 && (
          <Pressable onPress={() => onBoardSearchChange('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color="#6B7080" />
          </Pressable>
        )}
      </View>

      {/* Filters */}
      <BoardFilters filters={boardFilters} onFiltersChange={onBoardFiltersChange} />

      {/* Summary strip */}
      <View style={styles.summaryStrip}>
        <Text style={styles.summaryText}>Targets: {summary.total}</Text>
        <Text style={styles.summaryDot}>{'\u00B7'}</Text>
        <Text style={styles.summaryText}>Priority A: {summary.priorityA}</Text>
        <Text style={styles.summaryDot}>{'\u00B7'}</Text>
        <Text style={styles.summaryText}>Avg KR: {summary.avgKR}</Text>
      </View>

      {/* Board / List toggle */}
      <View style={styles.viewToggleRow}>
        {(['kanban', 'list'] as const).map((mode) => {
          const active = viewMode === mode;
          return (
            <Pressable
              key={mode}
              style={[styles.viewTogglePill, active && styles.viewTogglePillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onViewModeChange(mode);
              }}
            >
              <Text style={[styles.viewToggleText, active && styles.viewToggleTextActive]}>
                {mode === 'kanban' ? 'Board' : 'List'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Kanban or List */}
      {viewMode === 'kanban' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kanbanScroll}
          nestedScrollEnabled
        >
          {BOARD_COLUMNS.map((status) => {
            const colEntries = entries.filter((e) => e.status === status).sort((a, b) => a.rank - b.rank);
            return (
              <BoardColumn key={status} status={status} count={colEntries.length}>
                {colEntries.map((entry) => {
                  const p = PLAYER_POOL.find((pp) => pp.id === entry.playerId);
                  if (!p) return null;
                  return (
                    <PlayerRatingCard
                      key={entry.id}
                      player={p}
                      boardEntry={entry}
                      onPress={() => onCardPress(entry)}
                      onLongPress={() => onCardLongPress(entry)}
                    />
                  );
                })}
              </BoardColumn>
            );
          })}
        </ScrollView>
      ) : (
        <View>
          {/* Sort row */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, marginBottom: 10 }}>
            {SORT_OPTIONS.map((opt) => {
              const active = sortKey === opt.key;
              return (
                <Pressable
                  key={opt.key}
                  style={[styles.sortPill, active && styles.sortPillActive]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSortKeyChange(opt.key);
                  }}
                >
                  <Text style={[styles.sortPillText, active && styles.sortPillTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Flat list */}
          {sortedList.map((entry) => {
            const p = PLAYER_POOL.find((pp) => pp.id === entry.playerId);
            if (!p) return null;
            return (
              <PlayerRatingCard
                key={entry.id}
                player={p}
                boardEntry={entry}
                onPress={() => onCardPress(entry)}
                onLongPress={() => onCardLongPress(entry)}
              />
            );
          })}
          {sortedList.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No recruits match your filters</Text>
            </View>
          )}
        </View>
      )}

      {allEntries.length === 0 && (
        <View style={styles.emptyBoardCta}>
          <Text style={styles.emptyBoardTitle}>Your board is empty</Text>
          <Text style={styles.emptyBoardSub}>Tap "+ Add" to add recruits from the National Pool.</Text>
        </View>
      )}
    </View>
  );
}

// ─── Cluster abbreviations for rating boxes ───
const CLUSTER_ABBREVS: { key: string; abbrev: string; full: string }[] = [
  { key: 'shooting', abbrev: 'SHT', full: 'Shooting' },
  { key: 'finishing', abbrev: 'FIN', full: 'Finishing' },
  { key: 'playmaking', abbrev: 'PLY', full: 'Playmaking' },
  { key: 'perimeter_defense', abbrev: 'OBD', full: 'OB Defense' },
  { key: 'interior_defense', abbrev: 'TMD', full: 'Team Defense' },
  { key: 'rebounding', abbrev: 'REB', full: 'Rebounding' },
  { key: 'frame', abbrev: 'PHY', full: 'Physical' },
];

// ─── Priority badge colors ───
const PRIORITY_COLORS: Record<string, string> = { A: '#4CAF50', B: '#FF9800', C: '#8A8F98' };

// ─── EA-Style Player Rating Card ───
function PlayerRatingCard({
  player,
  onPress,
  onLongPress,
  boardEntry,
}: {
  player: PoolPlayer;
  onPress: () => void;
  onLongPress?: () => void;
  boardEntry?: BoardEntry;
}) {
  const ratings = useMemo(() => getPlayerRatings(player.id), [player.id]);
  const [tooltip, setTooltip] = useState<string | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  const showTooltip = useCallback((full: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTooltip(full);
    setTimeout(() => setTooltip(null), 1500);
  }, []);

  const helioPos = TRADITIONAL_TO_HELIO[player.position] ?? player.position;
  const archetypeLabel = ARCHETYPE_LABELS[player.archetype] ?? player.archetype;

  return (
    <Pressable
      style={styles.ratingCard}
      onPress={onPress}
      onLongPress={onLongPress ? () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(); } : undefined}
      delayLongPress={400}
    >
      {/* Board info strip (only when rendered on board) */}
      {boardEntry && (
        <View style={styles.boardInfoStrip}>
          <View style={[styles.boardPriorityBadge, { backgroundColor: `${PRIORITY_COLORS[boardEntry.priority]}20` }]}>
            <Text style={[styles.boardPriorityText, { color: PRIORITY_COLORS[boardEntry.priority] }]}>
              {boardEntry.priority}
            </Text>
          </View>
          <View style={[styles.boardStatusBadge, { backgroundColor: `${BOARD_COLUMN_COLORS[boardEntry.status]}20` }]}>
            <Text style={[styles.boardStatusText, { color: BOARD_COLUMN_COLORS[boardEntry.status] }]}>
              {boardEntry.status}
            </Text>
          </View>
          {boardEntry.tags.slice(0, 2).map((t) => (
            <View key={t} style={styles.boardTagChip}>
              <Text style={styles.boardTagText}>{t}</Text>
            </View>
          ))}
          {boardEntry.tags.length > 2 && (
            <Text style={styles.boardTagMore}>+{boardEntry.tags.length - 2}</Text>
          )}
        </View>
      )}

      {/* Top row: avatar, name, badges */}
      <View style={styles.ratingCardTop}>
        <View style={styles.ratingAvatar}>
          <IconSymbol name="person.fill" size={22} color={GRAY} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.ratingName} numberOfLines={1}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={styles.ratingIdentity} numberOfLines={1}>
            {player.classYear} {'\u00B7'} {player.currentSchool} {'\u00B7'} {player.height}{player.weight ? ` ${player.weight}` : ''}
          </Text>
        </View>
        <View style={styles.ratingBadges}>
          <View style={styles.ratingLevelBadge}>
            <Text style={styles.ratingLevelText}>{player.level}</Text>
          </View>
          <View style={styles.ratingPosBadge}>
            <Text style={styles.ratingPosText}>{helioPos}</Text>
          </View>
        </View>
      </View>

      {/* Tooltip */}
      {tooltip && (
        <View style={styles.tooltipBubble}>
          <Text style={styles.tooltipText}>{tooltip}</Text>
        </View>
      )}

      {/* Rating boxes row */}
      <View style={styles.ratingBoxRow}>
        {/* KR box (highlighted) */}
        <Pressable
          style={styles.ratingBoxOvr}
          onLongPress={() => showTooltip('KaNeXT Rating')}
          onPress={() => {}}
        >
          <Text style={styles.ratingBoxLabel}>KR</Text>
          <Text style={styles.ratingBoxValueOvr}>
            {ratings ? ratings.overall : '\u2014'}
          </Text>
        </Pressable>
        {/* O/D KR split card */}
        {(() => {
          const oKR = ratings ? Math.round((ratings.clusters.shooting + ratings.clusters.finishing + ratings.clusters.playmaking) / 3) : null;
          const dKR = ratings ? Math.round((ratings.clusters.perimeter_defense + ratings.clusters.interior_defense + ratings.clusters.rebounding + ratings.clusters.frame) / 4) : null;
          return (
            <View style={styles.ratingBoxSplit}>
              <Pressable
                style={styles.ratingBoxSplitHalf}
                onLongPress={() => showTooltip('Offensive KR')}
                onPress={() => {}}
              >
                <Text style={styles.ratingBoxLabel}>O</Text>
                <Text style={styles.ratingBoxSplitValue}>{oKR ?? '\u2014'}</Text>
              </Pressable>
              <View style={styles.ratingBoxSplitDivider} />
              <Pressable
                style={styles.ratingBoxSplitHalf}
                onLongPress={() => showTooltip('Defensive KR')}
                onPress={() => {}}
              >
                <Text style={styles.ratingBoxLabel}>D</Text>
                <Text style={styles.ratingBoxSplitValue}>{dKR ?? '\u2014'}</Text>
              </Pressable>
            </View>
          );
        })()}
        {/* 7 cluster boxes — tappable */}
        {CLUSTER_ABBREVS.map((c) => {
          const val = ratings ? ratings.clusters[c.key as ClusterType] : null;
          const isExpanded = expandedCluster === c.key;
          return (
            <Pressable
              key={c.key}
              style={[styles.ratingBox, isExpanded && styles.ratingBoxExpanded]}
              onLongPress={() => showTooltip(c.full)}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedCluster(isExpanded ? null : c.key);
              }}
            >
              <Text style={styles.ratingBoxLabel}>{c.abbrev}</Text>
              <Text style={[styles.ratingBoxValue, isExpanded && { color: WHITE }]}>{val ?? '\u2014'}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Expanded subclusters */}
      {expandedCluster && ratings && (
        <View style={styles.subclusterStrip}>
          <Text style={styles.subclusterTitle}>
            {CLUSTER_ABBREVS.find((c) => c.key === expandedCluster)?.full ?? expandedCluster}
          </Text>
          {getPoolPlayerSubclusters(player.id, expandedCluster as keyof typeof ratings.clusters, ratings.clusters[expandedCluster as ClusterType]).map((sc) => (
            <View key={sc.name} style={styles.subclusterRow}>
              <Text style={styles.subclusterName}>{sc.name}</Text>
              <Text style={[styles.subclusterVal, { color: sc.rating >= 70 ? '#4CAF50' : sc.rating >= 55 ? '#FF9800' : '#EF4444' }]}>{sc.rating}</Text>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

// ─── Team Rating Card ───
function TeamRatingCard({
  team,
  rank,
  onPress,
}: {
  team: {
    name: string;
    conference: string;
    level: string;
    kr: number;
    offKR: number;
    defKR: number;
    clusters: Record<ClusterType, number>;
    topPlayers: { id: string; name: string; position: string; kr: number }[];
  };
  rank: number;
  onPress: () => void;
}) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  return (
    <Pressable style={styles.ratingCard} onPress={onPress}>
      {/* Team header */}
      <View style={styles.ratingCardTop}>
        <Text style={{ width: 28, fontSize: 15, fontWeight: '700', color: GRAY }}>{rank}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.ratingName}>{team.name}</Text>
          <Text style={styles.ratingIdentity}>{team.conference} {'\u00B7'} {team.level}</Text>
        </View>
        <View style={styles.ratingBadges}>
          <View style={styles.ratingBoxOvr}>
            <Text style={styles.ratingBoxLabel}>KR</Text>
            <Text style={styles.ratingBoxValueOvr}>{team.kr}</Text>
          </View>
          <View style={styles.ratingBoxSplit}>
            <View style={styles.ratingBoxSplitHalf}>
              <Text style={styles.ratingBoxLabel}>O</Text>
              <Text style={styles.ratingBoxSplitValue}>{team.offKR}</Text>
            </View>
            <View style={styles.ratingBoxSplitDivider} />
            <View style={styles.ratingBoxSplitHalf}>
              <Text style={styles.ratingBoxLabel}>D</Text>
              <Text style={styles.ratingBoxSplitValue}>{team.defKR}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* 7 cluster boxes */}
      <View style={styles.ratingBoxRow}>
        {CLUSTER_ABBREVS.map((c) => {
          const val = team.clusters[c.key as ClusterType];
          const isExpanded = expandedCluster === c.key;
          return (
            <Pressable
              key={c.key}
              style={[styles.ratingBox, { flex: 1 }, isExpanded && styles.ratingBoxExpanded]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedCluster(isExpanded ? null : c.key);
              }}
            >
              <Text style={styles.ratingBoxLabel}>{c.abbrev}</Text>
              <Text style={[styles.ratingBoxValue, isExpanded && { color: WHITE }]}>{val}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Expanded: top contributors for this cluster */}
      {expandedCluster && (
        <View style={styles.subclusterStrip}>
          <Text style={styles.subclusterTitle}>
            Top Contributors — {CLUSTER_ABBREVS.find((c) => c.key === expandedCluster)?.full}
          </Text>
          {team.topPlayers.map((p) => {
            const r = getPlayerRatings(p.id);
            const clusterVal = r ? r.clusters[expandedCluster as ClusterType] : 0;
            return (
              <View key={p.id} style={styles.subclusterRow}>
                <Text style={styles.subclusterName}>{p.name} ({p.position})</Text>
                <Text style={[styles.subclusterVal, { color: clusterVal >= 70 ? '#4CAF50' : clusterVal >= 55 ? '#FF9800' : '#EF4444' }]}>{clusterVal}</Text>
              </View>
            );
          })}
        </View>
      )}
    </Pressable>
  );
}


// ─── Styles ───
const styles = StyleSheet.create({
  container: { flex: 1 },

  hubTabsContainer: { borderBottomWidth: StyleSheet.hairlineWidth, backgroundColor: BG },
  hubTabsContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  hubTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  hubTabActive: { borderBottomWidth: 2 },
  hubTabLabel: { fontSize: 14, fontWeight: '500' },
  hubTabLabelActive: { fontWeight: '600' },

  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md },

  // Hero card
  heroCard: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 22,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1A1D23',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: WHITE,
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#B0B4BC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  heroSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1D23',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 44,
    width: '100%',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#2A2D35',
  },
  heroSearchInput: {
    flex: 1,
    fontSize: 15,
    color: WHITE,
    paddingVertical: 0,
  },
  heroFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#4A4D55',
  },
  heroFilterPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  heroFilterText: {
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 1.2,
  },
  heroFilterTextActive: {
    color: BG,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
    marginLeft: 2,
  },

  // Meta row
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  resultCountText: { fontSize: 13, fontWeight: '500', color: GRAY },
  resetLink: { fontSize: 12, fontWeight: '500', color: WHITE, textDecorationLine: 'underline' },

  // Rating card list
  ratingCardList: {
    gap: 0,
  },
  ratingListHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 1,
    marginBottom: 10,
  },
  ratingCard: {
    backgroundColor: CARD_BG,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
  },
  ratingCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2D35',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  ratingName: {
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
  },
  ratingIdentity: {
    fontSize: 11,
    color: GRAY,
    marginTop: 2,
  },
  ratingBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingLevelBadge: {
    backgroundColor: '#2A2D35',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingLevelText: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.3,
  },
  ratingPosBadge: {
    backgroundColor: '#3A3D45',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingPosText: {
    fontSize: 10,
    fontWeight: '700',
    color: WHITE,
  },
  ratingBoxRow: {
    flexDirection: 'row',
    gap: 4,
  },
  ratingBoxOvr: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2D35',
    borderRadius: 8,
    paddingVertical: 6,
    minWidth: 42,
    borderWidth: 1,
    borderColor: '#4A4D55',
  },
  ratingBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  ratingBoxLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  ratingBoxValueOvr: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
  },
  ratingBoxValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7080',
  },
  ratingBoxExpanded: {
    backgroundColor: '#2A2D35',
    borderRadius: 6,
  },
  ratingBoxSplit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2D35',
    borderRadius: 8,
    minWidth: 72,
    borderWidth: 1,
    borderColor: '#4A4D55',
  },
  ratingBoxSplitHalf: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  ratingBoxSplitDivider: {
    width: StyleSheet.hairlineWidth,
    height: '60%',
    backgroundColor: '#4A4D55',
  },
  ratingBoxSplitValue: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },
  subclusterStrip: {
    marginTop: 10,
    backgroundColor: '#1A1D23',
    borderRadius: 8,
    padding: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
  },
  subclusterTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  subclusterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  subclusterName: {
    fontSize: 12,
    color: '#B0B4BC',
  },
  subclusterVal: {
    fontSize: 12,
    fontWeight: '700',
  },
  tooltipBubble: {
    position: 'absolute',
    top: 42,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipText: {
    backgroundColor: '#000000',
    color: WHITE,
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    overflow: 'hidden',
  },

  // Division group rows
  // Division pill grid
  pillGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, paddingVertical: 10, paddingHorizontal: 4 },
  divPill: { backgroundColor: '#2A2D35', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16 },
  divPillSelected: { backgroundColor: WHITE },
  divPillOpen: { backgroundColor: '#3A3D45' },
  divPillText: { fontSize: 13, fontWeight: '600' as const, color: GRAY },
  divPillTextSelected: { color: BG },
  pillSubGrid: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8, paddingHorizontal: 4, paddingBottom: 10 },
  divSubPill: { backgroundColor: '#2A2D35', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: '#3A3D45' },
  divSubPillSelected: { backgroundColor: WHITE, borderColor: WHITE },
  divSubPillText: { fontSize: 12, fontWeight: '600' as const, color: GRAY },
  divSubPillTextSelected: { color: BG },

  // Panel helper
  sheetHelper: { fontSize: 12, color: GRAY, marginBottom: Spacing.sm },

  // Footer buttons (inline at bottom of scroll)
  inlineFooter: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },
  footerResetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#4A4D55', alignItems: 'center' as const },
  footerResetText: { fontSize: 14, fontWeight: '600' as const, color: GRAY },
  footerApplyBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center' as const },
  footerApplyText: { fontSize: 14, fontWeight: '600' as const, color: BG },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: GRAY },

  // ── Recruiting Board Workspace ──
  boardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  boardTitle: { fontSize: 20, fontWeight: '800', color: WHITE, letterSpacing: 1 },
  boardSubtitle: { fontSize: 13, color: GRAY, marginTop: 2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#2A2D35', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { fontSize: 13, fontWeight: '700', color: WHITE },
  boardSearchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1D23', borderRadius: 20, paddingHorizontal: 14, height: 38, borderWidth: 1, borderColor: '#2A2D35', gap: 8, marginBottom: 4 },
  boardSearchInput: { flex: 1, fontSize: 14, color: WHITE, paddingVertical: 0 },
  summaryStrip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6 },
  summaryText: { fontSize: 12, fontWeight: '500', color: GRAY },
  summaryDot: { fontSize: 12, color: '#4A4D55' },
  viewToggleRow: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  viewTogglePill: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 16, backgroundColor: '#2A2D35' },
  viewTogglePillActive: { backgroundColor: WHITE },
  viewToggleText: { fontSize: 12, fontWeight: '700', color: GRAY },
  viewToggleTextActive: { color: BG },
  kanbanScroll: { paddingBottom: 16 },
  sortPill: { backgroundColor: '#2A2D35', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  sortPillActive: { backgroundColor: WHITE },
  sortPillText: { fontSize: 11, fontWeight: '600', color: GRAY },
  sortPillTextActive: { color: BG },
  emptyBoardCta: { alignItems: 'center', paddingVertical: 40 },
  emptyBoardTitle: { fontSize: 16, fontWeight: '700', color: WHITE, marginBottom: 6 },
  emptyBoardSub: { fontSize: 13, color: GRAY, textAlign: 'center' },

  // Quick actions sheet
  qaSection: { fontSize: 10, fontWeight: '700', color: GRAY, letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  qaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DIVIDER },
  qaRowText: { fontSize: 15, fontWeight: '500', color: WHITE },
  qaDot: { width: 8, height: 8, borderRadius: 4 },
  qaPriorityPill: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12, backgroundColor: '#2A2D35' },
  qaPriorityPillActive: { backgroundColor: WHITE },
  qaPriorityText: { fontSize: 14, fontWeight: '700', color: GRAY },
  qaPriorityTextActive: { color: BG },

  // Add selection mode
  addSelectionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1B2A1B', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 10 },
  addSelectionText: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  addSelectionDone: { fontSize: 13, fontWeight: '700', color: WHITE },
  addToBoardBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10 },

  // Board info strip on PlayerRatingCard
  boardInfoStrip: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  boardPriorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  boardPriorityText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  boardStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  boardStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  boardTagChip: { backgroundColor: '#2A2D35', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  boardTagText: { fontSize: 10, fontWeight: '600', color: GRAY },
  boardTagMore: { fontSize: 10, fontWeight: '600', color: GRAY },
});
