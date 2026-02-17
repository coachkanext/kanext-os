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
import { getPlayerRatings, getPoolPlayerSubclusters, WEEKLY_UPDATE_OPTIONS } from '@/data/playerRatings';
import { HELIO_TO_TRADITIONAL, TRADITIONAL_TO_HELIO, HELIO_POSITIONS, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { RecruitingHeader, type RecruitingViewMode } from '@/components/recruiting/recruiting-header';
import { NeedsBoard } from '@/components/recruiting/needs-board';
import { BigBoard } from '@/components/recruiting/big-board';
import { CRMTable } from '@/components/recruiting/crm-table';
import { KaNeXTDatabase } from '@/components/recruiting/kanext-database';
import { type NeedsTier, type PositionSlot } from '@/data/recruitingBoard';
import { SORT_CLUSTER_LABELS, CLUSTER_ORDER, TRAIT_LIBRARY } from '@/data/trait-library';
import { ARCHETYPE_OPTIONS } from '@/data/archetype-options';
import { getPlayerStats, type StatKey } from '@/data/player-stats';
import {
  TARGET_DEPTH,
  ROSTER_MAX,
  TOTAL_SCHOLARSHIPS,
  NIL_BUDGET,
  NEED_PRIORITY_ORDER,
  TARGET_STAGES,
  COV_STAGES,
  COV_TEMPS,
  type PositionNeed,
} from '@/data/team-needs';
import { PLAYER_CLUSTERS, PLAYER_PHYSICALS } from '@/data/roster-data';
import { ROSTER } from '@/components/roster-content';
import { computePlayerBadges } from '@/utils/player-badges';
import {
  getPlayerRegion,
  parseHeightToInches,
  computeWingspan,
  computeVertical,
} from '@/utils/recruiting-helpers';
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
  TEMPERATURE_COLORS,
  RISK_LEVEL_COLORS,
  RISK_FLAG_OPTIONS,
  DUE_DILIGENCE_LABELS,
  LOG_TYPE_META,
  type BoardEntry,
  type BoardStatus,
  type Temperature,
  type RiskLevel,
  type RiskFlag,
  type LogEntryType,
  type RecruitingLogEntry,
} from '@/data/recruitingBoard';
import {
  DEFAULT_BOARD_FILTERS,
  KR_TIERS,
  getDivisionAnchor,
  getKRTiersForDivision,
  type BoardFilterState,
} from '@/components/recruiting/board-filters';
import { INSTITUTION } from '@/data/mock-sports';
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
const ACCENT = '#3B82F6';

const PROGRAM_ANCHOR = getDivisionAnchor(INSTITUTION.division);
const PROGRAM_TIERS = getKRTiersForDivision(PROGRAM_ANCHOR);
const AID_LABEL = PROGRAM_ANCHOR === 'high_major' || PROGRAM_ANCHOR === 'mid_major'
  ? 'Scholarships Available' : 'Athletic Aid Available';

function getKRTier(kr: number) {
  return PROGRAM_TIERS.find((t) => kr >= t.min && kr <= t.max) ?? PROGRAM_TIERS[PROGRAM_TIERS.length - 1];
}

function getDueDateStatus(dueDate: string): 'overdue' | 'soon' | 'ok' | 'none' {
  if (!dueDate) return 'none';
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  if (diff < 0) return 'overdue';
  if (diff < 3 * 24 * 60 * 60 * 1000) return 'soon';
  return 'ok';
}

// Stages that require confirmation modal when moving to
const CONFIRM_STAGES: BoardStatus[] = ['Committed', 'Signed'];

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

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

const PORTAL_LEVELS = new Set(['NCAA D1', 'NCAA D2', 'NCAA D3', 'NAIA', 'USCAA', 'NCCAA D1', 'NCCAA D2', '3C2A']);

function matchesDivision(playerLevel: PoolLevel, filterDiv: PoolLevel | 'Portal'): boolean {
  if (filterDiv === 'Portal') return PORTAL_LEVELS.has(playerLevel);
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
  const [peekJerseyNumber, setPeekJerseyNumber] = useState<string | undefined>(undefined);
  const [fitNotes, setFitNotes] = useState<Record<string, string>>({});
  const [coachNotes, setCoachNotes] = useState<Record<string, string>>({});
  const [sheetOffStyle, setSheetOffStyle] = useState<import('@/types').OffensiveStyle>('motion_read_react');
  const [sheetDefStyle, setSheetDefStyle] = useState<import('@/types').DefensiveStyle>('pack_line');
  const [divSheetOpen, setDivSheetOpen] = useState(false);
  const [divExpandedGroups, setDivExpandedGroups] = useState<Set<string>>(new Set());

  // ── Board state ──
  const [boardEntries, setBoardEntries] = useState<BoardEntry[]>([]);
  const [boardLoaded, setBoardLoaded] = useState(false);
  const [boardFilters, setBoardFilters] = useState<BoardFilterState>({ ...DEFAULT_BOARD_FILTERS });
  const [boardViewMode, setBoardViewMode] = useState<RecruitingViewMode>('needs');
  const [boardSearch, setBoardSearch] = useState('');
  const [quickActionsEntry, setQuickActionsEntry] = useState<BoardEntry | null>(null);
  const [qaMode, setQaMode] = useState<'actions' | 'log'>('actions');
  const [qaSubSheet, setQaSubSheet] = useState<'offer' | 'nil' | 'visit' | null>(null);
  const [qaConfirmTarget, setQaConfirmTarget] = useState<BoardStatus | null>(null);
  const [qaLogComposerOpen, setQaLogComposerOpen] = useState(false);
  const [qaLogType, setQaLogType] = useState<LogEntryType>('Note');
  const [qaLogSummary, setQaLogSummary] = useState('');
  const [addSheetOpen, setAddSheetOpen] = useState(false);

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
    if (boardFilters.tier.length > 0) {
      const selectedTiers = KR_TIERS.filter((t) => boardFilters.tier.includes(t.short));
      list = list.filter((e) => {
        const ratings = getPlayerRatings(e.playerId);
        if (!ratings) return false;
        return selectedTiers.some((t) => ratings.overall >= t.min && ratings.overall <= t.max);
      });
    }
    if (boardFilters.year.length > 0) list = list.filter((e) => boardFilters.year.includes(e.classYear));
    if (boardFilters.division.length > 0) {
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p) return false;
        return boardFilters.division.some((div) => matchesDivision(p.level, div as PoolLevel));
      });
    }
    if (boardFilters.status.length > 0) list = list.filter((e) => boardFilters.status.includes(e.status));
    if (boardFilters.position.length > 0) {
      const tradPositions = boardFilters.position
        .map((pos) => HELIO_TO_TRADITIONAL[pos as import('@/types').HeliocentricPosition])
        .filter(Boolean) as string[];
      if (tradPositions.length > 0) list = list.filter((e) => tradPositions.includes(e.position));
    }
    if (boardFilters.archetype) {
      const arch = boardFilters.archetype;
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        return p?.archetype === arch;
      });
    }
    if (boardFilters.region.length > 0) {
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        return p ? boardFilters.region.includes(getPlayerRegion(p.state)) : false;
      });
    }
    if (boardFilters.heightRange) {
      const [minH, maxH] = boardFilters.heightRange;
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p) return false;
        const inches = parseHeightToInches(p.height);
        return inches >= minH && inches <= maxH;
      });
    }
    if (boardFilters.weightRange) {
      const [minW, maxW] = boardFilters.weightRange;
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p?.weight) return false;
        return p.weight >= minW && p.weight <= maxW;
      });
    }
    if (boardFilters.wingspanRange) {
      const [minWs, maxWs] = boardFilters.wingspanRange;
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p) return false;
        const ws = computeWingspan(p.id, parseHeightToInches(p.height), p.position);
        return ws >= minWs && ws <= maxWs;
      });
    }
    if (boardFilters.verticalRange) {
      const [minV, maxV] = boardFilters.verticalRange;
      list = list.filter((e) => {
        const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
        if (!p) return false;
        const vert = computeVertical(p.id, p.position);
        return vert >= minV && vert <= maxV;
      });
    }

    // Badge filter: match players who have badges matching selected names and/or levels
    if (boardFilters.badge.length > 0 || boardFilters.badgeLevel.length > 0) {
      list = list.filter((e) => {
        const ratings = getPlayerRatings(e.playerId);
        if (!ratings) return false;
        const badges = computePlayerBadges(
          ratings.clusters as import('@/data/roster-data').ClusterRatings,
          (key) => getPoolPlayerSubclusters(e.playerId, key as ClusterType, ratings.clusters[key as ClusterType]),
        );
        return badges.some((b) => {
          const nameMatch = boardFilters.badge.length === 0 || boardFilters.badge.includes(b.name);
          const levelMatch = boardFilters.badgeLevel.length === 0 || boardFilters.badgeLevel.includes(b.level);
          return nameMatch && levelMatch;
        });
      });
    }

    // Sort by cluster/subcluster when selected
    if (boardFilters.cluster) {
      const clusterKey = boardFilters.cluster;
      const OFF_CLUSTERS: ClusterType[] = ['shooting', 'finishing', 'playmaking'];
      const DEF_CLUSTERS: ClusterType[] = ['perimeter_defense', 'interior_defense', 'rebounding', 'frame'];

      if (clusterKey === 'offense' || clusterKey === 'defense') {
        // KR group — average of constituent clusters
        const group = clusterKey === 'offense' ? OFF_CLUSTERS : DEF_CLUSTERS;
        list = [...list].sort((a, b) => {
          const aR = getPlayerRatings(a.playerId);
          const bR = getPlayerRatings(b.playerId);
          const aAvg = aR ? group.reduce((s, k) => s + (aR.clusters[k] ?? 0), 0) / group.length : 0;
          const bAvg = bR ? group.reduce((s, k) => s + (bR.clusters[k] ?? 0), 0) / group.length : 0;
          return bAvg - aAvg;
        });
      } else {
        const isCluster = CLUSTER_ORDER.includes(clusterKey as ClusterType);
        list = [...list].sort((a, b) => {
          const aR = getPlayerRatings(a.playerId);
          const bR = getPlayerRatings(b.playerId);
          if (isCluster) {
            return (bR?.clusters[clusterKey as ClusterType] ?? 0) - (aR?.clusters[clusterKey as ClusterType] ?? 0);
          }
          const aVal = getSubclusterRating(a.playerId, clusterKey);
          const bVal = getSubclusterRating(b.playerId, clusterKey);
          return bVal - aVal;
        });
      }
    }

    // Sort by traditional stat when selected (descending, except TO/PF ascending)
    if (boardFilters.stat) {
      const sk = boardFilters.stat as StatKey;
      const lowerIsBetter = sk === 'to' || sk === 'pf';
      list = [...list].sort((a, b) => {
        const aS = getPlayerStats(a.playerId);
        const bS = getPlayerStats(b.playerId);
        const aVal = aS?.[sk] ?? 0;
        const bVal = bS?.[sk] ?? 0;
        return lowerIsBetter ? aVal - bVal : bVal - aVal;
      });
    }

    return list;
  }, [boardEntries, boardSearch, boardFilters]);

  // Team needs — positional roster projection
  // ── Team Needs (deterministic) ──
  const getEntryHelio = useCallback((e: BoardEntry) => {
    const p = PLAYER_POOL.find((pp) => pp.id === e.playerId);
    return p ? TRADITIONAL_TO_HELIO[p.position as import('@/data/playerPool').PoolPosition] : null;
  }, []);

  const teamNeeds = useMemo((): PositionNeed[] => {
    const positions: import('@/types').HeliocentricPosition[] = ['PG', 'CG', 'W', 'F', 'B'];
    return positions.map((pos) => {
      const rosterAtPos = ROSTER.filter((p) => p.listPos === pos);
      const ret = rosterAtPos.filter((p) => p.classYear !== 'Senior').length;
      const lv = rosterAtPos.filter((p) => p.classYear === 'Senior').length;
      const cmt = boardEntries.filter((e) => e.status === 'Committed' && getEntryHelio(e) === pos).length;
      const sgn = boardEntries.filter((e) => e.status === 'Signed' && getEntryHelio(e) === pos).length;
      const tgt = boardEntries.filter((e) => (TARGET_STAGES as readonly string[]).includes(e.status) && getEntryHelio(e) === pos).length;
      const cov = boardEntries.filter((e) =>
        (COV_STAGES as readonly string[]).includes(e.status) &&
        (COV_TEMPS as readonly string[]).includes(e.temperature) &&
        getEntryHelio(e) === pos
      ).length;
      const projected = ret - lv + cmt + sgn;
      const need = Math.max(0, TARGET_DEPTH[pos] - projected);
      return { pos, ret, lv, cmt, sgn, tgt, need, cov, projected };
    });
  }, [boardEntries, getEntryHelio]);

  // (Team needs / roster spots / scholarships / NIL — derived values kept for potential future use but not passed to workspace)

  // Quick action handlers
  const handleMoveEntry = useCallback((entryId: string, newStatus: BoardStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardEntries((prev) => moveEntry(prev, entryId, newStatus));
    setQuickActionsEntry(null);
  }, []);

  const handleRemoveEntry = useCallback((entryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardEntries((prev) => removeEntry(prev, entryId));
    setQuickActionsEntry(null);
  }, []);

  const handleAddToBoard = useCallback((playerId: string, slot?: PositionSlot, tier?: NeedsTier, status?: import('@/data/recruitingBoard').BoardStatus, bigBoardRank?: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardEntries((prev) => addEntry(prev, playerId, status ?? 'Watchlist', 'C', slot, tier, bigBoardRank));
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

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        <View style={{ height: 16 }} />
        <View style={styles.ratingCardList}>
          <RecruitingBoardWorkspace
            entries={filteredBoardEntries}
            allEntries={boardEntries}
            loaded={boardLoaded}
            boardSearch={boardSearch}
            onBoardSearchChange={setBoardSearch}
            viewMode={boardViewMode}
            onViewModeChange={setBoardViewMode}
            teamNeeds={teamNeeds}
            filteredPlayers={filteredPlayers}
            boardEntries={boardEntries}
            offStyle={sheetOffStyle}
            defStyle={sheetDefStyle}
            onPlayerPress={(player) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPeekJerseyNumber(undefined);
              setPeekPlayer(player);
            }}
            onAddToBoard={handleAddToBoard}
            onRemoveFromBoard={(entryId) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setBoardEntries((prev) => removeEntry(prev, entryId));
            }}
            onCardPress={(entry) => {
              const player = PLAYER_POOL.find((p) => p.id === entry.playerId);
              if (player) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPeekJerseyNumber(undefined);
                setPeekPlayer(player);
              }
            }}
            onCardLongPress={(entry) => {
              setQaMode('actions');
              setQuickActionsEntry(entry);
            }}
            onAddPress={() => setAddSheetOpen(true)}
          />
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
        onClose={() => { setPeekPlayer(null); setPeekJerseyNumber(undefined); }}
        player={peekPlayer}
        jerseyNumber={peekJerseyNumber}
        physicals={peekJerseyNumber ? PLAYER_PHYSICALS[peekJerseyNumber] : undefined}
        clusterOverride={peekJerseyNumber ? PLAYER_CLUSTERS[peekJerseyNumber] : undefined}
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
        boardEntry={peekPlayer ? boardEntries.find((e) => e.playerId === peekPlayer.id) ?? null : null}
        teamNeeds={teamNeeds}
        onMoveOnBoard={handleMoveEntry}
        onRemoveFromBoard={(entryId) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setBoardEntries((prev) => removeEntry(prev, entryId));
        }}
        defaultTabOverride="recruiting"
      />

      {/* ═══ AVATAR SHEET — Recruiting CRM Surface ═══ */}
      <BottomSheet
        visible={!!quickActionsEntry}
        onClose={() => { setQuickActionsEntry(null); setQaSubSheet(null); setQaConfirmTarget(null); setQaLogComposerOpen(false); }}
        title={(() => {
          if (!quickActionsEntry) return 'Actions';
          const p = PLAYER_POOL.find((pp) => pp.id === quickActionsEntry.playerId);
          return p ? `${p.firstName} ${p.lastName}` : 'Actions';
        })()}
      >
        {quickActionsEntry && (() => {
          const entry = quickActionsEntry;
          const player = PLAYER_POOL.find((pp) => pp.id === entry.playerId);
          if (!player) return null;
          const ratings = getPlayerRatings(entry.playerId);
          const kr = ratings?.overall ?? 0;
          const tier = getKRTier(kr);
          const dueStatus = getDueDateStatus(entry.dueDate);
          const lastLogTouch = entry.log.filter((l) => l.type === 'Call' || l.type === 'Text' || l.type === 'Visit').sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
          const pinnedLogs = entry.log.filter((l) => l.isPinned);
          const posNeed = teamNeeds.find((n) => {
            const helio = TRADITIONAL_TO_HELIO[player.position as import('@/data/playerPool').PoolPosition];
            return helio === n.pos;
          });

          return (
          <ScrollView style={{ maxHeight: 600 }} showsVerticalScrollIndicator={false} nestedScrollEnabled>
          <View style={{ gap: 2 }}>
            {/* ─── Header meta line ─── */}
            <Text style={styles.qaHeaderMeta}>
              {player.position} \u00B7 {player.classYear} \u00B7 {player.currentSchool} \u00B7 {player.state}
            </Text>

            {/* ─── Toggle Row: Actions | Log ─── */}
            <View style={styles.qaToggleRow}>
              <Pressable
                style={[styles.qaTogglePill, qaMode === 'actions' && styles.qaTogglePillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQaMode('actions'); }}
              >
                <Text style={[styles.qaToggleText, qaMode === 'actions' && styles.qaToggleTextActive]}>Actions</Text>
              </Pressable>
              <Pressable
                style={[styles.qaTogglePill, qaMode === 'log' && styles.qaTogglePillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setQaMode('log'); }}
              >
                <Text style={[styles.qaToggleText, qaMode === 'log' && styles.qaToggleTextActive]}>Log</Text>
              </Pressable>
            </View>

            {/* ═══════════════════════════════════════════════════════════════
                ACTIONS TAB
               ═══════════════════════════════════════════════════════════════ */}
            {qaMode === 'actions' && (
              <>
                {/* ─── A) Recruiting Snapshot Card ─── */}
                <View style={styles.qaSnapshotCard}>
                  {/* Status + Temperature row */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={[styles.qaPipelinePill, { backgroundColor: `${BOARD_COLUMN_COLORS[entry.status]}30`, borderColor: BOARD_COLUMN_COLORS[entry.status] }]}>
                      <View style={[styles.qaDot, { backgroundColor: BOARD_COLUMN_COLORS[entry.status] }]} />
                      <Text style={[styles.qaPipelinePillText, { color: BOARD_COLUMN_COLORS[entry.status] }]}>{entry.status}</Text>
                    </View>
                    <View style={[styles.qaTempPill, { backgroundColor: TEMPERATURE_COLORS[entry.temperature] + '25' }]}>
                      <Text style={[styles.qaTempText, { color: TEMPERATURE_COLORS[entry.temperature] }]}>{entry.temperature}</Text>
                    </View>
                  </View>

                  {/* KR + Tier */}
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: tier.color }}>{kr}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: tier.color }}>{tier.label}</Text>
                  </View>

                  {/* Need */}
                  {posNeed && posNeed.need > 0 && (
                    <Text style={styles.qaNeedsText}>Need: {posNeed.pos} ({posNeed.need})</Text>
                  )}

                  {/* Recruiter + Last Touch + Next Action Due */}
                  <View style={{ gap: 4 }}>
                    <Text style={styles.qaMetaLine}>
                      <Text style={{ fontWeight: '700' }}>Recruiter: </Text>{entry.recruiter || 'Unassigned'}
                    </Text>
                    <Text style={styles.qaMetaLine}>
                      <Text style={{ fontWeight: '700' }}>Last Touch: </Text>
                      {lastLogTouch
                        ? `${lastLogTouch.type} \u00B7 ${getRelativeTime(lastLogTouch.timestamp)}`
                        : 'No contact yet'}
                    </Text>
                    <Text style={[styles.qaMetaLine, dueStatus === 'overdue' && { color: '#EF4444' }]}>
                      <Text style={{ fontWeight: '700' }}>Next Action: </Text>
                      {entry.nextStep || 'None set'}
                      {entry.dueDate ? ` \u00B7 ${dueStatus === 'overdue' ? 'OVERDUE' : entry.dueDate}` : ''}
                    </Text>
                  </View>
                </View>

                {/* ─── B) Quick Action Icons Row ─── */}
                <View style={styles.qaActionsRow}>
                  {[
                    { icon: 'doc.text.fill' as const, label: 'Offer', color: '#4CAF50', key: 'offer' as const },
                    { icon: 'dollarsign.circle.fill' as const, label: 'NIL', color: '#FF9800', key: 'nil' as const },
                    { icon: 'mappin.and.ellipse' as const, label: 'Visit', color: '#3B82F6', key: 'visit' as const },
                    { icon: 'note.text' as const, label: 'Log', color: '#A855F7', key: 'log' as const },
                  ].map((action) => (
                    <Pressable
                      key={action.label}
                      style={styles.qaActionBtn}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        if (action.key === 'log') { setQaMode('log'); }
                        else { setQaSubSheet(qaSubSheet === action.key ? null : action.key); }
                      }}
                    >
                      <View style={[styles.qaActionIconWrap, { backgroundColor: action.color + '20' }, qaSubSheet === action.key && { borderWidth: 2, borderColor: action.color }]}>
                        <IconSymbol name={action.icon} size={18} color={action.color} />
                      </View>
                      <Text style={styles.qaActionLabel}>{action.label}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* ─── Sub-Sheet: Offer ─── */}
                {qaSubSheet === 'offer' && (
                  <View style={styles.qaDetailBlock}>
                    <Text style={styles.qaSection}>OFFER DETAILS</Text>
                    {entry.offer ? (
                      <View style={{ gap: 6 }}>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Scholarship: </Text>{entry.offer.scholarshipPct}%</Text>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Type: </Text>{entry.offer.offerType}</Text>
                        {entry.offer.offerDate && <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Offered: </Text>{entry.offer.offerDate}</Text>}
                        {entry.offer.expirationDate && <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Expires: </Text>{entry.offer.expirationDate}</Text>}
                        {entry.offer.conditions ? <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Conditions: </Text>{entry.offer.conditions}</Text> : null}
                      </View>
                    ) : (
                      <Text style={styles.qaEmptyText}>No offer extended yet</Text>
                    )}
                  </View>
                )}

                {/* ─── Sub-Sheet: NIL ─── */}
                {qaSubSheet === 'nil' && (
                  <View style={styles.qaDetailBlock}>
                    <Text style={styles.qaSection}>NIL DETAILS</Text>
                    {entry.nil ? (
                      <View style={{ gap: 6 }}>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Amount: </Text>{entry.nil.amount}</Text>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Structure: </Text>{entry.nil.structure}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={styles.qaDetailLabel}>Status: </Text>
                          <View style={[styles.qaTempPill, { backgroundColor: entry.nil.status === 'Approved' ? '#4CAF5025' : entry.nil.status === 'Pending' ? '#FF980025' : '#75757525' }]}>
                            <Text style={{ fontSize: 11, fontWeight: '600', color: entry.nil.status === 'Approved' ? '#4CAF50' : entry.nil.status === 'Pending' ? '#FF9800' : GRAY }}>{entry.nil.status}</Text>
                          </View>
                        </View>
                        {entry.nil.complianceNotes ? <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Compliance: </Text>{entry.nil.complianceNotes}</Text> : null}
                      </View>
                    ) : (
                      <Text style={styles.qaEmptyText}>No NIL package set</Text>
                    )}
                  </View>
                )}

                {/* ─── Sub-Sheet: Visit ─── */}
                {qaSubSheet === 'visit' && (
                  <View style={styles.qaDetailBlock}>
                    <Text style={styles.qaSection}>VISIT DETAILS</Text>
                    {entry.visit ? (
                      <View style={{ gap: 6 }}>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Type: </Text>{entry.visit.visitType}</Text>
                        {entry.visit.confirmedDate && <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Confirmed: </Text>{entry.visit.confirmedDate}</Text>}
                        {entry.visit.proposedDate && !entry.visit.confirmedDate && <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Proposed: </Text>{entry.visit.proposedDate}</Text>}
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Host: </Text>{entry.visit.host}</Text>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Transport: </Text>{entry.visit.transportation}</Text>
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Lodging: </Text>{entry.visit.lodging}</Text>
                      </View>
                    ) : (
                      <Text style={styles.qaEmptyText}>No visit scheduled</Text>
                    )}
                  </View>
                )}

                {/* ─── C) Relationship Tracking ─── */}
                {entry.relationships && (
                  <View style={styles.qaDetailBlock}>
                    <Text style={styles.qaSection}>RELATIONSHIPS</Text>
                    <View style={{ gap: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <View style={[styles.qaRelBadge, { backgroundColor: '#3B82F625' }]}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: '#3B82F6' }}>PRIMARY</Text>
                        </View>
                        <Text style={styles.qaDetailRow}>{entry.relationships.primaryDecisionMaker.name} ({entry.relationships.primaryDecisionMaker.role})</Text>
                      </View>
                      {entry.relationships.primaryDecisionMaker.commPref && (
                        <Text style={styles.qaDetailRow}>
                          <Text style={styles.qaDetailLabel}>Pref: </Text>
                          {entry.relationships.primaryDecisionMaker.commPref}
                          {entry.relationships.primaryDecisionMaker.bestTime ? ` \u00B7 ${entry.relationships.primaryDecisionMaker.bestTime}` : ''}
                        </Text>
                      )}
                      {entry.relationships.primaryDecisionMaker.staffOwner && (
                        <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Staff: </Text>{entry.relationships.primaryDecisionMaker.staffOwner}</Text>
                      )}
                      {entry.relationships.influencers.map((inf, i) => (
                        <View key={i} style={{ marginTop: 6, gap: 2 }}>
                          <Text style={styles.qaDetailRow}>{inf.name} ({inf.role})</Text>
                          {inf.staffOwner && <Text style={{ fontSize: 11, color: GRAY }}>Staff: {inf.staffOwner}</Text>}
                        </View>
                      ))}
                      {entry.relationships.trustNotes.length > 0 && (
                        <View style={{ marginTop: 6 }}>
                          <Text style={[styles.qaDetailLabel, { marginBottom: 4 }]}>Trust Notes:</Text>
                          {entry.relationships.trustNotes.map((note, i) => (
                            <Text key={i} style={{ fontSize: 12, color: '#d0d0d0', lineHeight: 17 }}>{'\u2022'} {note}</Text>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* ─── D) Risk + Due Diligence ─── */}
                <View style={styles.qaDetailBlock}>
                  <Text style={styles.qaSection}>RISK + DUE DILIGENCE</Text>
                  <View style={{ gap: 8 }}>
                    {/* Risk Level */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={styles.qaDetailLabel}>Risk:</Text>
                      <View style={[styles.qaTempPill, { backgroundColor: RISK_LEVEL_COLORS[entry.riskLevel] + '25' }]}>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: RISK_LEVEL_COLORS[entry.riskLevel] }}>{entry.riskLevel}</Text>
                      </View>
                    </View>

                    {/* Risk Flags */}
                    {entry.riskFlags.length > 0 && (
                      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                        {entry.riskFlags.map((flag) => (
                          <View key={flag} style={styles.qaRiskChip}>
                            <Text style={styles.qaRiskChipText}>{flag}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    {/* Due Diligence Checklist */}
                    <View style={{ gap: 4, marginTop: 4 }}>
                      <Text style={[styles.qaDetailLabel, { marginBottom: 2 }]}>Due Diligence ({entry.dueDiligence.filter((d) => d.completed).length}/{entry.dueDiligence.length})</Text>
                      {entry.dueDiligence.map((item, i) => (
                        <Pressable
                          key={i}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 3 }}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            const updated = [...entry.dueDiligence];
                            updated[i] = {
                              ...updated[i],
                              completed: !updated[i].completed,
                              ...(updated[i].completed ? {} : { completedBy: 'You', completedDate: new Date().toISOString().slice(0, 10) }),
                            };
                            setBoardEntries((prev) => updateEntry(prev, entry.id, { dueDiligence: updated }));
                            setQuickActionsEntry({ ...entry, dueDiligence: updated });
                          }}
                        >
                          <View style={[styles.qaDdCheck, item.completed && styles.qaDdCheckDone]}>
                            {item.completed && <Text style={{ fontSize: 10, color: WHITE }}>{'\u2713'}</Text>}
                          </View>
                          <Text style={[styles.qaDetailRow, item.completed && { textDecorationLine: 'line-through', color: GRAY }]}>{item.label}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                </View>

                {/* ─── E) Move To Stage Buttons ─── */}
                <Text style={[styles.qaSection, { marginTop: 4 }]}>MOVE TO</Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  {BOARD_COLUMNS.filter((col) => col !== entry.status).map((col) => (
                    <Pressable
                      key={col}
                      style={[styles.qaMovePill, { borderColor: BOARD_COLUMN_COLORS[col] + '60' }]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        if (CONFIRM_STAGES.includes(col)) {
                          setQaConfirmTarget(col);
                        } else {
                          handleMoveEntry(entry.id, col);
                        }
                      }}
                    >
                      <View style={[styles.qaDot, { backgroundColor: BOARD_COLUMN_COLORS[col] }]} />
                      <Text style={styles.qaMovePillText}>{col}</Text>
                    </Pressable>
                  ))}
                </View>

                {/* ─── Confirmation Modal (Committed / Signed) ─── */}
                {qaConfirmTarget && (
                  <View style={styles.qaConfirmBox}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: WHITE, marginBottom: 8 }}>
                      Confirm move to {qaConfirmTarget}?
                    </Text>
                    <View style={{ gap: 4, marginBottom: 10 }}>
                      <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>KR: </Text>{kr} \u00B7 {tier.label}</Text>
                      {entry.offer && <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Offer: </Text>{entry.offer.scholarshipPct}% ({entry.offer.offerType})</Text>}
                      <Text style={styles.qaDetailRow}><Text style={styles.qaDetailLabel}>Risk: </Text>{entry.riskLevel}</Text>
                      <Text style={styles.qaDetailRow}>
                        <Text style={styles.qaDetailLabel}>Last Touch: </Text>
                        {lastLogTouch ? `${lastLogTouch.type} \u00B7 ${getRelativeTime(lastLogTouch.timestamp)}` : 'None'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <Pressable
                        style={[styles.qaConfirmBtn, { backgroundColor: '#2A2D35' }]}
                        onPress={() => setQaConfirmTarget(null)}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '600', color: WHITE }}>Cancel</Text>
                      </Pressable>
                      <Pressable
                        style={[styles.qaConfirmBtn, { backgroundColor: BOARD_COLUMN_COLORS[qaConfirmTarget] }]}
                        onPress={() => {
                          handleMoveEntry(entry.id, qaConfirmTarget);
                          setQaConfirmTarget(null);
                        }}
                      >
                        <Text style={{ fontSize: 13, fontWeight: '700', color: WHITE }}>Confirm</Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* ─── F) Footer Actions ─── */}
                <Pressable
                  style={[styles.qaRow, { marginTop: 12 }]}
                  onPress={() => {
                    setQuickActionsEntry(null);
                    setPeekJerseyNumber(undefined);
                    setPeekPlayer(player);
                  }}
                >
                  <IconSymbol name="person.fill" size={14} color={GRAY} />
                  <Text style={styles.qaRowText}>View Full Profile</Text>
                </Pressable>

                <Pressable
                  style={[styles.qaRow, { marginTop: 4 }]}
                  onPress={() => handleRemoveEntry(entry.id)}
                >
                  <IconSymbol name="trash" size={14} color="#EF4444" />
                  <Text style={[styles.qaRowText, { color: '#EF4444' }]}>Remove from Board</Text>
                </Pressable>
              </>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                LOG TAB
               ═══════════════════════════════════════════════════════════════ */}
            {qaMode === 'log' && (
              <>
                {/* ─── Log Composer ─── */}
                <View style={styles.qaLogComposer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', gap: 6 }}>
                      {(Object.keys(LOG_TYPE_META) as LogEntryType[]).map((type) => {
                        const meta = LOG_TYPE_META[type];
                        const active = qaLogType === type;
                        return (
                          <Pressable
                            key={type}
                            style={[styles.qaLogTypeChip, active && { backgroundColor: meta.color + '30', borderColor: meta.color }]}
                            onPress={() => setQaLogType(type)}
                          >
                            <Text style={{ fontSize: 11, color: active ? meta.color : GRAY, fontWeight: '600' }}>{type}</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </ScrollView>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <TextInput
                      style={styles.qaLogInput}
                      placeholder={`Add ${qaLogType.toLowerCase()} entry...`}
                      placeholderTextColor="#555"
                      value={qaLogSummary}
                      onChangeText={setQaLogSummary}
                      multiline
                    />
                    <Pressable
                      style={[styles.qaLogSendBtn, !qaLogSummary.trim() && { opacity: 0.4 }]}
                      disabled={!qaLogSummary.trim()}
                      onPress={() => {
                        if (!qaLogSummary.trim()) return;
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        const newLog: RecruitingLogEntry = {
                          id: `log-${Date.now()}`,
                          type: qaLogType,
                          timestamp: new Date(),
                          author: 'You',
                          summary: qaLogSummary.trim(),
                        };
                        const updatedLog = [newLog, ...entry.log];
                        setBoardEntries((prev) => updateEntry(prev, entry.id, { log: updatedLog }));
                        setQuickActionsEntry({ ...entry, log: updatedLog });
                        setQaLogSummary('');
                      }}
                    >
                      <IconSymbol name="arrow.up.circle.fill" size={28} color={ACCENT} />
                    </Pressable>
                  </View>
                </View>

                {/* ─── Smart Pins (pinned entries) ─── */}
                {pinnedLogs.length > 0 && (
                  <View style={{ marginBottom: 8 }}>
                    <Text style={[styles.qaSection, { marginBottom: 4 }]}>PINNED</Text>
                    {pinnedLogs.map((logEntry) => {
                      const meta = LOG_TYPE_META[logEntry.type];
                      return (
                        <View key={logEntry.id} style={[styles.qaLogRow, { backgroundColor: '#1a1d2380' }]}>
                          <View style={[styles.qaLogIcon, { backgroundColor: meta.color + '25' }]}>
                            <Text style={[styles.qaLogIconText, { color: meta.color }]}>{meta.icon}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.qaLogBody} numberOfLines={2}>{logEntry.summary}</Text>
                            <Text style={styles.qaLogTime}>{logEntry.author} \u00B7 {getRelativeTime(logEntry.timestamp)}</Text>
                          </View>
                          <View style={[styles.qaLogTag, { backgroundColor: meta.color + '20' }]}>
                            <Text style={[styles.qaLogTagText, { color: meta.color }]}>{logEntry.type}</Text>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* ─── Log Timeline ─── */}
                {entry.log.length === 0 ? (
                  <Text style={styles.qaEmptyText}>No recruiting activity yet.</Text>
                ) : (
                  entry.log
                    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                    .filter((l) => !l.isPinned)
                    .map((logEntry) => {
                      const meta = LOG_TYPE_META[logEntry.type];
                      return (
                        <View key={logEntry.id} style={styles.qaLogRow}>
                          <View style={[styles.qaLogIcon, { backgroundColor: meta.color + '25' }]}>
                            <Text style={[styles.qaLogIconText, { color: meta.color }]}>{meta.icon}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.qaLogBody} numberOfLines={2}>{logEntry.summary}</Text>
                            <Text style={styles.qaLogTime}>{logEntry.author} \u00B7 {getRelativeTime(logEntry.timestamp)}</Text>
                          </View>
                          <View style={[styles.qaLogTag, { backgroundColor: meta.color + '20' }]}>
                            <Text style={[styles.qaLogTagText, { color: meta.color }]}>{logEntry.type}</Text>
                          </View>
                        </View>
                      );
                    })
                )}
              </>
            )}
          </View>
          </ScrollView>
          );
        })()}
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

        {/* Archetype */}
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

        {/* Team */}
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

function RecruitingBoardWorkspace({
  entries,
  allEntries,
  loaded,
  boardSearch,
  onBoardSearchChange,
  viewMode,
  onViewModeChange,
  teamNeeds,
  filteredPlayers,
  boardEntries,
  offStyle,
  defStyle,
  onPlayerPress,
  onAddToBoard,
  onRemoveFromBoard,
  onCardPress,
  onCardLongPress,
  onAddPress,
}: {
  entries: BoardEntry[];
  allEntries: BoardEntry[];
  loaded: boolean;
  boardSearch: string;
  onBoardSearchChange: (text: string) => void;
  viewMode: RecruitingViewMode;
  onViewModeChange: (m: RecruitingViewMode) => void;
  teamNeeds: PositionNeed[];
  filteredPlayers: PoolPlayer[];
  boardEntries: BoardEntry[];
  offStyle: import('@/types').OffensiveStyle;
  defStyle: import('@/types').DefensiveStyle;
  onPlayerPress: (player: PoolPlayer) => void;
  onAddToBoard: (playerId: string, slot?: PositionSlot, tier?: NeedsTier, status?: BoardStatus, bigBoardRank?: number) => void;
  onRemoveFromBoard: (entryId: string) => void;
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
      {/* Persistent header: season, search, add, 4-mode switcher */}
      <RecruitingHeader
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
        search={boardSearch}
        onSearchChange={onBoardSearchChange}
        onAddPress={onAddPress}
      />

      {/* 4-view router */}
      {viewMode === 'needs' && (
        <NeedsBoard
          entries={entries}
          teamNeeds={teamNeeds}
          onEntryPress={onCardPress}
          onEntryLongPress={onCardLongPress}
        />
      )}

      {viewMode === 'bigboard' && (
        <BigBoard
          entries={entries}
          offStyle={offStyle}
          defStyle={defStyle}
          onEntryPress={onCardPress}
          onEntryLongPress={onCardLongPress}
        />
      )}

      {viewMode === 'crm' && (
        <CRMTable
          entries={entries}
          teamNeeds={teamNeeds}
          onEntryPress={onCardPress}
          onEntryLongPress={onCardLongPress}
        />
      )}

      {viewMode === 'database' && (
        <KaNeXTDatabase
          filteredPlayers={filteredPlayers}
          boardEntries={boardEntries}
          boardSearch={boardSearch}
          offStyle={offStyle}
          defStyle={defStyle}
          onPlayerPress={onPlayerPress}
          onAddToBoard={onAddToBoard}
          onRemoveFromBoard={onRemoveFromBoard}
        />
      )}

      {allEntries.length === 0 && viewMode !== 'database' && (
        <View style={styles.emptyBoardCta}>
          <Text style={styles.emptyBoardTitle}>Your board is empty</Text>
          <Text style={styles.emptyBoardSub}>Tap "+" to add recruits from the Database.</Text>
        </View>
      )}
    </View>
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
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },
  statCell: {
    alignItems: 'center',
    minWidth: 32,
  },
  statCellLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.3,
  },
  statCellValue: {
    fontSize: 12,
    fontWeight: '600',
    color: WHITE,
    marginTop: 1,
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
  needsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 8, flexWrap: 'wrap' },
  needsDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF9800', marginRight: 2 },
  needsLabel: { fontSize: 12, fontWeight: '600', color: WHITE },
  needsSep: { fontSize: 12, color: '#4A4D55', marginHorizontal: 2 },
  needsPrimaryText: { fontSize: 12, fontWeight: '700', color: '#FF9800' },
  needsTotalText: { fontSize: 12, fontWeight: '600', color: GRAY },
  needsMetric: { fontSize: 11, color: GRAY },
  needsPanel: { backgroundColor: '#1A1D23', borderRadius: 10, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: DIVIDER },
  needsTableHeader: { flexDirection: 'row', alignItems: 'center', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: DIVIDER, marginBottom: 4 },
  needsTableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5 },
  needsCell: { fontSize: 9, fontWeight: '700', color: GRAY, textTransform: 'uppercase', letterSpacing: 0.3 },
  needsCellVal: { fontSize: 12, fontWeight: '500', color: WHITE },
  needsCellPos: { width: 32 },
  needsCellNum: { flex: 1, textAlign: 'center' },
  needsCellNeed: { width: 36, textAlign: 'center' },
  needsCellCov: { width: 36, textAlign: 'center' },
  needsFooter: { borderTopWidth: 1, borderTopColor: DIVIDER, marginTop: 6, paddingTop: 8, gap: 4 },
  needsFooterText: { fontSize: 11, color: GRAY },
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
  teamRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: CARD_BG, borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: DIVIDER },
  teamLogo: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  teamLogoText: { fontSize: 13, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  teamName: { fontSize: 15, fontWeight: '700', color: WHITE },
  teamMeta: { fontSize: 12, color: GRAY, marginTop: 2 },
  teamBadge: { backgroundColor: '#2A2D35', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  teamBadgeText: { fontSize: 13, fontWeight: '700', color: WHITE },
  teamSheetLogo: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  teamSheetLogoText: { fontSize: 18, fontWeight: '800', color: WHITE, letterSpacing: 0.5 },
  teamSheetStat: { flex: 1, backgroundColor: '#1A1D23', borderRadius: 10, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: DIVIDER },
  teamSheetStatValue: { fontSize: 20, fontWeight: '800', color: WHITE },
  teamSheetStatLabel: { fontSize: 10, fontWeight: '600', color: GRAY, letterSpacing: 0.3, marginTop: 2 },
  teamSheetPlayerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DIVIDER },
  emptyBoardCta: { alignItems: 'center', paddingVertical: 40 },
  emptyBoardTitle: { fontSize: 16, fontWeight: '700', color: WHITE, marginBottom: 6 },
  emptyBoardSub: { fontSize: 13, color: GRAY, textAlign: 'center' },

  // Quick actions sheet
  qaToggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  qaTogglePill: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#2a2a2a', alignItems: 'center' },
  qaTogglePillActive: { backgroundColor: '#f5f5f5' },
  qaToggleText: { fontSize: 13, fontWeight: '600', color: '#6e6e6e' },
  qaToggleTextActive: { color: '#111' },
  qaSection: { fontSize: 10, fontWeight: '700', color: GRAY, letterSpacing: 0.5, marginBottom: 6, marginTop: 4 },
  qaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DIVIDER },
  qaRowText: { fontSize: 15, fontWeight: '500', color: WHITE },
  qaDot: { width: 8, height: 8, borderRadius: 4 },
  qaPipelinePill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#2A2D35', borderWidth: 1, borderColor: 'transparent' },
  qaPipelinePillText: { fontSize: 12, fontWeight: '600', color: GRAY },
  qaSnapshotCard: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 14, gap: 8 },
  qaNeedsText: { fontSize: 12, color: '#FF9800', fontWeight: '500' },
  qaLastTouchText: { fontSize: 12, color: GRAY },
  qaActionsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 18 },
  qaActionBtn: { alignItems: 'center', gap: 6 },
  qaActionIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaActionLabel: { fontSize: 11, fontWeight: '600', color: '#f5f5f5' },
  qaLogRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: DIVIDER, gap: 10 },
  qaLogIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  qaLogIconText: { fontSize: 13, fontWeight: '700' },
  qaLogBody: { fontSize: 13, fontWeight: '500', color: '#f5f5f5', lineHeight: 18 },
  qaLogTime: { fontSize: 11, color: '#6e6e6e', marginTop: 1 },
  qaLogTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  qaLogTagText: { fontSize: 10, fontWeight: '700' },
  qaMovePill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12, borderWidth: 1, backgroundColor: '#1a1a1a' },
  qaMovePillText: { fontSize: 12, fontWeight: '600', color: '#f5f5f5' },
  qaEmptyText: { fontSize: 13, color: GRAY, paddingVertical: 12 },
  qaHeaderMeta: { fontSize: 12, color: GRAY, marginBottom: 8 },
  qaMetaLine: { fontSize: 12, color: '#c0c0c0', lineHeight: 18 },
  qaTempPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  qaTempText: { fontSize: 11, fontWeight: '700' },
  qaDetailBlock: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 14, marginBottom: 10, gap: 6 },
  qaDetailRow: { fontSize: 12, color: '#e0e0e0', lineHeight: 18 },
  qaDetailLabel: { fontWeight: '700', color: GRAY, fontSize: 11 },
  qaRelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  qaRiskChip: { backgroundColor: '#EF444425', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#EF444440' },
  qaRiskChipText: { fontSize: 10, fontWeight: '600', color: '#EF4444' },
  qaDdCheck: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, borderColor: GRAY, alignItems: 'center' as const, justifyContent: 'center' as const },
  qaDdCheckDone: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  qaConfirmBox: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: '#FF980060' },
  qaConfirmBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' as const },
  qaLogComposer: { backgroundColor: '#1a1a1a', borderRadius: 12, padding: 12, marginBottom: 10 },
  qaLogTypeChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: DIVIDER, backgroundColor: '#2A2D35' },
  qaLogInput: { flex: 1, backgroundColor: '#2A2D35', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, color: WHITE, fontSize: 13, maxHeight: 80 },
  qaLogSendBtn: { alignSelf: 'flex-end' as const, paddingBottom: 4 },

  // Add selection mode
  addSelectionBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1B2A1B', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, marginBottom: 10 },
  addSelectionText: { fontSize: 13, fontWeight: '600', color: '#4CAF50' },
  addSelectionDone: { fontSize: 13, fontWeight: '700', color: WHITE },
  addToBoardBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10 },

  // Card v2: 3-metric bar
  metricBar: {
    flexDirection: 'row',
    backgroundColor: '#2A2D35',
    borderRadius: 10,
    marginTop: 10,
    overflow: 'hidden',
  },
  metricBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#4A4D55',
    marginVertical: 8,
  },

  // Card v2: Pipeline + Momentum row
  pipelineMomentumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  pipelinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pipelinePillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  momentumText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card v2: CRM fields row
  crmRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: DIVIDER,
  },
  crmField: {
    flex: 1,
  },
  crmFieldLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  crmFieldValue: {
    fontSize: 12,
    fontWeight: '500',
    color: WHITE,
  },

  // Board info strip on PlayerRatingCard (kept for backwards compat)
  boardInfoStrip: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  boardPriorityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  boardPriorityText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  boardStatusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  boardStatusText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  boardTagChip: { backgroundColor: '#2A2D35', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 4 },
  boardTagText: { fontSize: 10, fontWeight: '600', color: GRAY },
  boardTagMore: { fontSize: 10, fontWeight: '600', color: GRAY },
});
