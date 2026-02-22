/**
 * KaNeXTDatabase — universe search + Slice Bar filters + Add to Board flow.
 *
 * Canonical filter taxonomy (Database-only):
 *   Source (All/Portal/Prep/College/International/Pro) →
 *   Level (depends on Source) → League (label varies: Conference/Circuit/League) →
 *   Year → Pos → More (advanced) → Sort
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PlayerRatingCard } from '@/components/recruiting/player-rating-card';
import {
  NEEDS_TIERS,
  NEEDS_TIER_COLORS,
  POSITION_SLOTS,
  type BoardEntry,
  type NeedsTier,
  type PositionSlot,
  type BoardStatus,
} from '@/data/recruitingBoard';
import type { PoolPlayer, PoolLevel } from '@/data/playerPool';
import type { OffensiveStyle, DefensiveStyle } from '@/types';
import { TRADITIONAL_TO_HELIO } from '@/data/position-mapping';
import { getPlayerRatings } from '@/data/playerRatings';
import { computeFitKR } from '@/utils/fit-kr';
import { computeConfidence, parseHeightToInches, HEIGHT_RANGES, REGION_OPTIONS, getPlayerRegion } from '@/utils/recruiting-helpers';
import { ARCHETYPE_OPTIONS } from '@/data/archetype-options';

const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#A1A1AA';
const DIVIDER = '#0B0F14';
const BG = '#0B0F14';

// ─── Source Taxonomy ───

type SourceKey = 'all' | 'portal' | 'prep' | 'college' | 'international' | 'pro';

const SOURCE_OPTIONS: { key: SourceKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'portal', label: 'Portal' },
  { key: 'prep', label: 'Prep' },
  { key: 'college', label: 'College' },
  { key: 'international', label: 'Intl' },
  { key: 'pro', label: 'Pro' },
];

const COLLEGE_POOL_LEVELS: ReadonlySet<string> = new Set([
  'NCAA', 'NCAA D1', 'NCAA D2', 'NCAA D3', 'NAIA',
  'JUCO', 'JUCO D1', 'JUCO D2', 'JUCO D3',
  'USCAA', 'NCCAA', 'NCCAA D1', 'NCCAA D2', '3C2A',
]);

function matchesSource(player: PoolPlayer, source: SourceKey): boolean {
  switch (source) {
    case 'all': return true;
    case 'portal': return COLLEGE_POOL_LEVELS.has(player.level);
    case 'college': return COLLEGE_POOL_LEVELS.has(player.level);
    case 'prep': return player.level === 'HS';
    case 'international': return player.level === 'International';
    case 'pro': return false;
  }
}

// ─── Level Taxonomy — Canonical KLVN Competitive Levels (v1) ───

interface LevelDef {
  label: string;
  match: (p: PoolPlayer) => boolean;
}

interface LevelGroup {
  group: string;
  levels: LevelDef[];
}

// Four-Year College (KLVN §2.1)
const FOUR_YEAR_LEVELS: LevelDef[] = [
  { label: 'NCAA D1', match: (p) => p.level === 'NCAA D1' || p.level === 'NCAA' },
  { label: 'NCAA D2', match: (p) => p.level === 'NCAA D2' },
  { label: 'NCAA D3', match: (p) => p.level === 'NCAA D3' },
  { label: 'NAIA', match: (p) => p.level === 'NAIA' },
  { label: 'USCAA', match: (p) => p.level === 'USCAA' },
  { label: 'NCCAA D1', match: (p) => p.level === 'NCCAA D1' || p.level === 'NCCAA' },
  { label: 'NCCAA D2', match: (p) => p.level === 'NCCAA D2' },
];

// Two-Year College (KLVN §2.1)
const TWO_YEAR_LEVELS: LevelDef[] = [
  { label: 'NJCAA D1', match: (p) => p.level === 'JUCO' || p.level === 'JUCO D1' },
  { label: 'NJCAA D2', match: (p) => p.level === 'JUCO D2' },
  { label: 'NJCAA D3', match: (p) => p.level === 'JUCO D3' },
  { label: '3C2A North', match: (p) => p.level === '3C2A' && p.conference.includes('North') },
  { label: '3C2A South', match: (p) => p.level === '3C2A' && p.conference.includes('South') },
];

// Grouped college levels (College / Portal sources)
const COLLEGE_LEVEL_GROUPS: LevelGroup[] = [
  { group: 'Four-Year', levels: FOUR_YEAR_LEVELS },
  { group: 'Two-Year', levels: TWO_YEAR_LEVELS },
];

// Pre-College (KLVN §2.1 — Prep source)
const PREP_LEVEL_GROUPS: LevelGroup[] = [
  { group: 'Pre-College', levels: [
    { label: 'HS', match: (p) => p.level === 'HS' },
    { label: 'Prep', match: (p) => (p.level as string) === 'Prep' },
    { label: 'Postgrad', match: (p) => (p.level as string) === 'Postgrad' },
  ]},
];

function buildIntlLevelGroups(players: PoolPlayer[]): LevelGroup[] {
  const countries = new Set<string>();
  players.filter((p) => p.level === 'International').forEach((p) => countries.add(p.state));
  if (countries.size === 0) return [];
  return [{
    group: 'International',
    levels: [...countries].sort().map((c) => ({
      label: c,
      match: (p: PoolPlayer) => p.state === c,
    })),
  }];
}

// ─── League chip label (varies by Source) ───

function leagueChipLabel(source: SourceKey): string {
  switch (source) {
    case 'college': case 'portal': return 'Conference';
    case 'prep': return 'Circuit';
    case 'international': case 'pro': return 'League';
    default: return 'League';
  }
}

// ─── Helio position for a pool player ───

type HelioPos = 'PG' | 'CG' | 'W' | 'F' | 'B';

function playerHelio(player: PoolPlayer): HelioPos {
  return (TRADITIONAL_TO_HELIO as Record<string, string>)[player.position] as HelioPos ?? 'W';
}

// ─── Slice state ───

type SortKey = 'kr' | 'fit' | 'conf' | 'height' | 'updated';

interface DatabaseSliceState {
  source: SourceKey;
  level: string[];
  league: string[];
  classYear: string[];
  position: string[];
  sort: SortKey;
}

const DEFAULT_SLICE: DatabaseSliceState = {
  source: 'all',
  level: [],
  league: [],
  classYear: [],
  position: [],
  sort: 'kr',
};

// ─── More-sheet filter state ───

interface MoreFilters {
  archetype: string | null;
  region: string[];
  heightRange: [number, number] | null;
  updatedWithin: string | null;
}

const DEFAULT_MORE: MoreFilters = {
  archetype: null,
  region: [],
  heightRange: null,
  updatedWithin: null,
};

const UPDATED_OPTIONS: { key: string; label: string; days: number }[] = [
  { key: 'week', label: 'This week', days: 7 },
  { key: 'month', label: 'This month', days: 30 },
  { key: '3months', label: 'Last 3 months', days: 90 },
];

type AddDestination = 'needs' | 'bigboard' | 'crm';

type ChipKey = 'source' | 'level' | 'league' | 'year' | 'position' | 'sort';

// ─── Helpers ───

function multiLabel(base: string, arr: string[]): string {
  if (arr.length === 0) return base;
  if (arr.length === 1) return arr[0];
  return `${base} (${arr.length})`;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

// ─── Sort options ───

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'fit', label: 'Fit' },
  { key: 'conf', label: 'Conf' },
  { key: 'height', label: 'Height' },
  { key: 'updated', label: 'Updated' },
];

// ─── Component ───

export function KaNeXTDatabase({
  filteredPlayers,
  boardEntries,
  boardSearch,
  offStyle,
  defStyle,
  onPlayerPress,
  onAddToBoard,
  onRemoveFromBoard,
}: {
  filteredPlayers: PoolPlayer[];
  boardEntries: BoardEntry[];
  boardSearch: string;
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
  onPlayerPress: (player: PoolPlayer) => void;
  onAddToBoard: (playerId: string, slot?: PositionSlot, tier?: NeedsTier, status?: BoardStatus, bigBoardRank?: number) => void;
  onRemoveFromBoard: (entryId: string) => void;
}) {
  // ── Add sheet state ──
  const [addSheetPlayer, setAddSheetPlayer] = useState<PoolPlayer | null>(null);
  const [addSlot, setAddSlot] = useState<PositionSlot>('W');
  const [addTier, setAddTier] = useState<NeedsTier>('Watch');
  const [addStatus, setAddStatus] = useState<BoardStatus>('Watchlist');
  const [addDestination, setAddDestination] = useState<AddDestination>('crm');
  const [addBigBoardRank, setAddBigBoardRank] = useState('');
  const lastDestinationRef = useRef<AddDestination>('crm');

  // ── Slice bar state ──
  const [slice, setSlice] = useState<DatabaseSliceState>(DEFAULT_SLICE);
  const [expandedChip, setExpandedChip] = useState<ChipKey | null>(null);

  // ── More sheet state ──
  const [moreOpen, setMoreOpen] = useState(false);
  const [more, setMore] = useState<MoreFilters>(DEFAULT_MORE);

  // ── Derive level options based on source (canonical KLVN groups) ──

  const intlLevelGroups = useMemo(() => buildIntlLevelGroups(filteredPlayers), [filteredPlayers]);

  const levelGroupsForSource = useMemo((): LevelGroup[] => {
    switch (slice.source) {
      case 'college': case 'portal': return COLLEGE_LEVEL_GROUPS;
      case 'prep': return PREP_LEVEL_GROUPS;
      case 'international': return intlLevelGroups;
      case 'pro': return [];
      case 'all': return [];
    }
  }, [slice.source, intlLevelGroups]);

  // Flat list of all level defs for filtering logic
  const levelDefsForSource = useMemo(
    (): LevelDef[] => levelGroupsForSource.flatMap((g) => g.levels),
    [levelGroupsForSource],
  );

  // Only show levels/groups with ≥1 matching player in the source pool
  const availableLevelGroups = useMemo(() => {
    const sourcePool = filteredPlayers.filter((p) => matchesSource(p, slice.source));
    return levelGroupsForSource
      .map((g) => ({ ...g, levels: g.levels.filter((ld) => sourcePool.some(ld.match)) }))
      .filter((g) => g.levels.length > 0);
  }, [filteredPlayers, levelGroupsForSource, slice.source]);

  const availableLevels = useMemo(
    () => availableLevelGroups.flatMap((g) => g.levels),
    [availableLevelGroups],
  );

  // Auto-clear selected levels that no longer exist in available options
  const effectiveLevel = useMemo(() => {
    if (slice.level.length === 0) return [];
    const available = new Set(availableLevels.map((l) => l.label));
    return slice.level.filter((l) => available.has(l));
  }, [slice.level, availableLevels]);

  // ── Derive league/conference options (from player.conference) ──

  const availableLeagues = useMemo(() => {
    let pool = filteredPlayers.filter((p) => matchesSource(p, slice.source));
    // Apply level filter to narrow league options
    if (effectiveLevel.length > 0) {
      const matchers = levelDefsForSource.filter((ld) => effectiveLevel.includes(ld.label));
      pool = pool.filter((p) => matchers.some((m) => m.match(p)));
    }
    const conferences = new Set<string>();
    pool.forEach((p) => {
      if (p.conference && p.conference !== 'International') conferences.add(p.conference);
    });
    return [...conferences].sort();
  }, [filteredPlayers, slice.source, effectiveLevel, levelDefsForSource]);

  // Auto-clear selected leagues that no longer exist in available options
  const effectiveLeague = useMemo(() => {
    if (slice.league.length === 0) return [];
    const available = new Set(availableLeagues);
    return slice.league.filter((l) => available.has(l));
  }, [slice.league, availableLeagues]);

  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    filteredPlayers.forEach((p) => set.add(p.classYear));
    return [...set].sort();
  }, [filteredPlayers]);

  // ── Filtering + sorting ──

  const visiblePlayers = useMemo(() => {
    let list = filteredPlayers;

    // Text search
    if (boardSearch) {
      const q = boardSearch.toLowerCase();
      list = list.filter((p) =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
        p.currentSchool.toLowerCase().includes(q) ||
        p.position.toLowerCase().includes(q)
      );
    }

    // Source
    if (slice.source !== 'all') {
      list = list.filter((p) => matchesSource(p, slice.source));
    }

    // Level
    if (effectiveLevel.length > 0) {
      const matchers = levelDefsForSource.filter((ld) => effectiveLevel.includes(ld.label));
      list = list.filter((p) => matchers.some((m) => m.match(p)));
    }

    // League / Conference / Circuit
    if (effectiveLeague.length > 0) {
      list = list.filter((p) => effectiveLeague.includes(p.conference));
    }

    // Class year
    if (slice.classYear.length > 0) {
      list = list.filter((p) => slice.classYear.includes(p.classYear));
    }

    // Position (Helio)
    if (slice.position.length > 0) {
      list = list.filter((p) => slice.position.includes(playerHelio(p)));
    }

    // More: archetype
    if (more.archetype) {
      list = list.filter((p) => p.archetype === more.archetype);
    }

    // More: region
    if (more.region.length > 0) {
      list = list.filter((p) => {
        const region = p.state.length === 2 ? getPlayerRegion(p.state) : 'International';
        return more.region.includes(region);
      });
    }

    // More: height range
    if (more.heightRange) {
      const [min, max] = more.heightRange;
      list = list.filter((p) => {
        const inches = parseHeightToInches(p.height);
        return inches >= min && inches <= max;
      });
    }

    // More: updated within
    if (more.updatedWithin) {
      const opt = UPDATED_OPTIONS.find((o) => o.key === more.updatedWithin);
      if (opt) {
        const cutoff = daysAgoISO(opt.days);
        list = list.filter((p) => p.lastUpdated >= cutoff);
      }
    }

    // Sort
    list = [...list].sort((a, b) => {
      switch (slice.sort) {
        case 'kr': {
          const aR = getPlayerRatings(a.id);
          const bR = getPlayerRatings(b.id);
          return (bR?.overall ?? 0) - (aR?.overall ?? 0);
        }
        case 'fit': {
          const aR = getPlayerRatings(a.id);
          const bR = getPlayerRatings(b.id);
          const aFit = aR ? computeFitKR(aR.clusters, offStyle, defStyle) : 0;
          const bFit = bR ? computeFitKR(bR.clusters, offStyle, defStyle) : 0;
          return bFit - aFit;
        }
        case 'conf':
          return computeConfidence(b) - computeConfidence(a);
        case 'height':
          return parseHeightToInches(b.height) - parseHeightToInches(a.height);
        case 'updated':
          return b.lastUpdated.localeCompare(a.lastUpdated);
        default:
          return 0;
      }
    });

    return list;
  }, [filteredPlayers, boardSearch, slice.source, effectiveLevel, levelDefsForSource, effectiveLeague, slice.classYear, slice.position, slice.sort, more, offStyle, defStyle]);

  // ── Active filters ──

  const hasMoreActive = more.archetype !== null || more.region.length > 0 || more.heightRange !== null || more.updatedWithin !== null;
  const hasActiveFilters = slice.source !== 'all' || effectiveLevel.length > 0 || effectiveLeague.length > 0 || slice.classYear.length > 0 || slice.position.length > 0 || hasMoreActive;

  const activeFilterPills = useMemo(() => {
    const pills: { key: string; label: string; clear: () => void }[] = [];
    if (slice.source !== 'all') {
      const lbl = SOURCE_OPTIONS.find((s) => s.key === slice.source)?.label ?? slice.source;
      pills.push({ key: 'source', label: lbl, clear: () => setSlice((s) => ({ ...s, source: 'all', level: [], league: [] })) });
    }
    effectiveLevel.forEach((v) => pills.push({ key: `level-${v}`, label: v, clear: () => setSlice((s) => ({ ...s, level: s.level.filter((x) => x !== v) })) }));
    effectiveLeague.forEach((v) => pills.push({ key: `league-${v}`, label: v, clear: () => setSlice((s) => ({ ...s, league: s.league.filter((x) => x !== v) })) }));
    slice.classYear.forEach((v) => pills.push({ key: `year-${v}`, label: v, clear: () => setSlice((s) => ({ ...s, classYear: s.classYear.filter((x) => x !== v) })) }));
    slice.position.forEach((v) => pills.push({ key: `pos-${v}`, label: v, clear: () => setSlice((s) => ({ ...s, position: s.position.filter((x) => x !== v) })) }));
    if (more.archetype) {
      const label = ARCHETYPE_OPTIONS.find((a) => a.value === more.archetype)?.label ?? more.archetype;
      pills.push({ key: 'arch', label, clear: () => setMore((m) => ({ ...m, archetype: null })) });
    }
    more.region.forEach((v) => pills.push({ key: `reg-${v}`, label: v, clear: () => setMore((m) => ({ ...m, region: m.region.filter((x) => x !== v) })) }));
    if (more.heightRange) {
      const hr = HEIGHT_RANGES.find((r) => r.min === more.heightRange![0] && r.max === more.heightRange![1]);
      pills.push({ key: 'ht', label: hr ? `Ht ${hr.label}` : 'Height', clear: () => setMore((m) => ({ ...m, heightRange: null })) });
    }
    if (more.updatedWithin) {
      const opt = UPDATED_OPTIONS.find((o) => o.key === more.updatedWithin);
      pills.push({ key: 'upd', label: opt?.label ?? 'Updated', clear: () => setMore((m) => ({ ...m, updatedWithin: null })) });
    }
    return pills;
  }, [slice.source, effectiveLevel, effectiveLeague, slice.classYear, slice.position, more]);

  const clearAllFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlice(DEFAULT_SLICE);
    setMore(DEFAULT_MORE);
    setExpandedChip(null);
  }, []);

  // ── Chip interactions ──

  const toggleChip = useCallback((key: ChipKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedChip((prev) => (prev === key ? null : key));
  }, []);

  const selectSource = useCallback((source: SourceKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Changing source resets level + league
    setSlice((prev) => ({ ...prev, source, level: [], league: [] }));
    setExpandedChip(null);
  }, []);

  const toggleLevel = useCallback((val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlice((prev) => {
      const next = prev.level.includes(val) ? prev.level.filter((v) => v !== val) : [...prev.level, val];
      return { ...prev, level: next, league: [] };
    });
  }, []);

  const toggleLeague = useCallback((val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlice((prev) => {
      const next = prev.league.includes(val) ? prev.league.filter((v) => v !== val) : [...prev.league, val];
      return { ...prev, league: next };
    });
  }, []);

  const toggleMulti = useCallback((key: 'classYear' | 'position', val: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlice((prev) => {
      const arr = prev[key];
      const next = arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val];
      return { ...prev, [key]: next };
    });
  }, []);

  const selectSort = useCallback((val: SortKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSlice((prev) => ({ ...prev, sort: val }));
    setExpandedChip(null);
  }, []);

  // ── Add sheet ──

  const openAddSheet = useCallback((player: PoolPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddSlot(playerHelio(player) as PositionSlot);
    setAddTier('Watch');
    setAddStatus('Watchlist');
    setAddDestination(lastDestinationRef.current);
    setAddBigBoardRank('');
    setAddSheetPlayer(player);
  }, []);

  const confirmAdd = useCallback(() => {
    if (!addSheetPlayer) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    lastDestinationRef.current = addDestination;
    switch (addDestination) {
      case 'needs':
        onAddToBoard(addSheetPlayer.id, addSlot, addTier, 'Watchlist');
        break;
      case 'bigboard': {
        const rank = parseInt(addBigBoardRank, 10) || undefined;
        onAddToBoard(addSheetPlayer.id, addSlot, 'Watch', 'Watchlist', rank);
        break;
      }
      case 'crm':
        onAddToBoard(addSheetPlayer.id, addSlot, addTier, addStatus);
        break;
    }
    setAddSheetPlayer(null);
  }, [addSheetPlayer, addDestination, addSlot, addTier, addStatus, addBigBoardRank, onAddToBoard]);

  // ── Chip labels ──
  const sourceLabel = slice.source !== 'all' ? SOURCE_OPTIONS.find((s) => s.key === slice.source)?.label ?? 'Source' : 'Source';
  const leagueLabel = leagueChipLabel(slice.source);

  return (
    <View>
      {/* ── Slice Bar ── */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sliceBarScroll} contentContainerStyle={styles.sliceBarContent}>
        {/* Source */}
        {(() => {
          const active = slice.source !== 'all';
          const expanded = expandedChip === 'source';
          return (
            <Pressable style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]} onPress={() => toggleChip('source')}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{sourceLabel}</Text>
              <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={active ? BG : GRAY} />
            </Pressable>
          );
        })()}

        {/* Level */}
        {(() => {
          const active = effectiveLevel.length > 0;
          const expanded = expandedChip === 'level';
          return (
            <Pressable style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]} onPress={() => toggleChip('level')}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{multiLabel('Level', effectiveLevel)}</Text>
              <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={active ? BG : GRAY} />
            </Pressable>
          );
        })()}

        {/* League / Conference / Circuit */}
        {(() => {
          const active = effectiveLeague.length > 0;
          const expanded = expandedChip === 'league';
          return (
            <Pressable style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]} onPress={() => toggleChip('league')}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{multiLabel(leagueLabel, effectiveLeague)}</Text>
              <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={active ? BG : GRAY} />
            </Pressable>
          );
        })()}

        {/* Year */}
        {(() => {
          const active = slice.classYear.length > 0;
          const expanded = expandedChip === 'year';
          return (
            <Pressable style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]} onPress={() => toggleChip('year')}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{multiLabel('Year', slice.classYear)}</Text>
              <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={active ? BG : GRAY} />
            </Pressable>
          );
        })()}

        {/* Pos */}
        {(() => {
          const active = slice.position.length > 0;
          const expanded = expandedChip === 'position';
          return (
            <Pressable style={[styles.chip, active && styles.chipActive, expanded && styles.chipExpanded]} onPress={() => toggleChip('position')}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{multiLabel('Pos', slice.position)}</Text>
              <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={active ? BG : GRAY} />
            </Pressable>
          );
        })()}

        {/* More */}
        <Pressable
          style={[styles.chip, hasMoreActive && styles.chipActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setExpandedChip(null); setMoreOpen(true); }}
        >
          <IconSymbol name="line.3.horizontal.decrease" size={12} color={hasMoreActive ? BG : GRAY} />
          <Text style={[styles.chipText, hasMoreActive && styles.chipTextActive]}>More</Text>
        </Pressable>

        {/* Sort */}
        {(() => {
          const expanded = expandedChip === 'sort';
          const sortLabel = SORT_OPTIONS.find((o) => o.key === slice.sort)?.label ?? 'KR';
          return (
            <Pressable style={[styles.chip, expanded && styles.chipExpanded]} onPress={() => toggleChip('sort')}>
              <IconSymbol name="arrow.up.arrow.down" size={10} color={GRAY} />
              <Text style={styles.chipText}>{sortLabel}</Text>
              <IconSymbol name={expanded ? 'chevron.up' : 'chevron.down'} size={10} color={GRAY} />
            </Pressable>
          );
        })()}
      </ScrollView>

      {/* ── Expanded sub-rows ── */}

      {expandedChip === 'source' && (
        <View style={styles.subRow}>
          {SOURCE_OPTIONS.map((opt) => {
            const selected = slice.source === opt.key;
            return (
              <Pressable key={opt.key} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => selectSource(opt.key)}>
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {expandedChip === 'level' && (
        <View style={styles.subRow}>
          {availableLevelGroups.length === 0 ? (
            <Text style={styles.subPillText}>{slice.source === 'all' ? 'Select a Source first' : 'No sub-levels'}</Text>
          ) : (
            <>
              <Pressable
                style={[styles.subPill, effectiveLevel.length === 0 && styles.subPillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSlice((s) => ({ ...s, level: [], league: [] })); setExpandedChip(null); }}
              >
                <Text style={[styles.subPillText, effectiveLevel.length === 0 && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {availableLevelGroups.map((group) => (
                <React.Fragment key={group.group}>
                  {availableLevelGroups.length > 1 && (
                    <Text style={styles.groupLabel}>{group.group}</Text>
                  )}
                  {group.levels.map((ld) => {
                    const selected = effectiveLevel.includes(ld.label);
                    return (
                      <Pressable key={ld.label} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => toggleLevel(ld.label)}>
                        <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{ld.label}</Text>
                      </Pressable>
                    );
                  })}
                </React.Fragment>
              ))}
            </>
          )}
        </View>
      )}

      {expandedChip === 'league' && (
        <View style={styles.subRow}>
          {availableLeagues.length === 0 ? (
            <Text style={styles.subPillText}>{slice.source === 'all' ? 'Select a Source first' : `No ${leagueLabel.toLowerCase()}s`}</Text>
          ) : (
            <>
              <Pressable
                style={[styles.subPill, effectiveLeague.length === 0 && styles.subPillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSlice((s) => ({ ...s, league: [] })); setExpandedChip(null); }}
              >
                <Text style={[styles.subPillText, effectiveLeague.length === 0 && styles.subPillTextActive]}>All</Text>
              </Pressable>
              {availableLeagues.map((conf) => {
                const selected = effectiveLeague.includes(conf);
                return (
                  <Pressable key={conf} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => toggleLeague(conf)}>
                    <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{conf}</Text>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      )}

      {expandedChip === 'year' && (
        <View style={styles.subRow}>
          <Pressable
            style={[styles.subPill, slice.classYear.length === 0 && styles.subPillActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSlice((s) => ({ ...s, classYear: [] })); setExpandedChip(null); }}
          >
            <Text style={[styles.subPillText, slice.classYear.length === 0 && styles.subPillTextActive]}>All</Text>
          </Pressable>
          {yearOptions.map((opt) => {
            const selected = slice.classYear.includes(opt);
            return (
              <Pressable key={opt} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => toggleMulti('classYear', opt)}>
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {expandedChip === 'position' && (
        <View style={styles.subRow}>
          <Pressable
            style={[styles.subPill, slice.position.length === 0 && styles.subPillActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSlice((s) => ({ ...s, position: [] })); setExpandedChip(null); }}
          >
            <Text style={[styles.subPillText, slice.position.length === 0 && styles.subPillTextActive]}>All</Text>
          </Pressable>
          {(['PG', 'CG', 'W', 'F', 'B'] as const).map((pos) => {
            const selected = slice.position.includes(pos);
            return (
              <Pressable key={pos} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => toggleMulti('position', pos)}>
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{pos}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {expandedChip === 'sort' && (
        <View style={styles.subRow}>
          {SORT_OPTIONS.map((opt) => {
            const selected = slice.sort === opt.key;
            return (
              <Pressable key={opt.key} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => selectSort(opt.key)}>
                <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Active filter pills ── */}
      {hasActiveFilters && (
        <View style={styles.activePillsRow}>
          {activeFilterPills.map((pill) => (
            <Pressable key={pill.key} style={styles.activePill} onPress={pill.clear}>
              <Text style={styles.activePillText}>{pill.label}</Text>
              <IconSymbol name="xmark" size={8} color={WHITE} />
            </Pressable>
          ))}
          <Pressable onPress={clearAllFilters}>
            <Text style={styles.clearAllText}>Clear all</Text>
          </Pressable>
        </View>
      )}

      {/* Result count */}
      <Text style={styles.resultCount}>{visiblePlayers.length} players</Text>

      {/* Player list */}
      {visiblePlayers.map((player) => {
        const existingEntry = boardEntries.find((e) => e.playerId === player.id);
        const alreadyOnBoard = !!existingEntry;
        return (
          <View key={player.id} style={{ position: 'relative' }}>
            <PlayerRatingCard player={player} offStyle={offStyle} defStyle={defStyle} onPress={() => onPlayerPress(player)} />
            {!alreadyOnBoard ? (
              <Pressable style={styles.addToBoardBtn} onPress={() => openAddSheet(player)}>
                <IconSymbol name="plus.circle.fill" size={24} color="#22C55E" />
              </Pressable>
            ) : (
              <Pressable style={styles.addToBoardBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onRemoveFromBoard(existingEntry.id); }}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={GRAY} />
              </Pressable>
            )}
          </View>
        );
      })}

      {visiblePlayers.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No players match your filters</Text>
        </View>
      )}

      {/* ── More Filters Sheet ── */}
      <BottomSheet visible={moreOpen} onClose={() => setMoreOpen(false)} title="More Filters" useModal>
        <View style={styles.addSheetContent}>
          {/* Archetype */}
          <Text style={styles.addLabel}>ARCHETYPE</Text>
          <View style={styles.addPillRow}>
            <Pressable
              style={[styles.subPill, more.archetype === null && styles.subPillActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, archetype: null })); }}
            >
              <Text style={[styles.subPillText, more.archetype === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {ARCHETYPE_OPTIONS.map((a) => {
              const selected = more.archetype === a.value;
              return (
                <Pressable key={a.value} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, archetype: selected ? null : a.value })); }}>
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]} numberOfLines={1}>{a.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Region */}
          <Text style={[styles.addLabel, { marginTop: 8 }]}>REGION</Text>
          <View style={styles.addPillRow}>
            <Pressable
              style={[styles.subPill, more.region.length === 0 && styles.subPillActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, region: [] })); }}
            >
              <Text style={[styles.subPillText, more.region.length === 0 && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {REGION_OPTIONS.map((r) => {
              const selected = more.region.includes(r);
              return (
                <Pressable key={r} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, region: selected ? m.region.filter((x) => x !== r) : [...m.region, r] })); }}>
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{r}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Height range */}
          <Text style={[styles.addLabel, { marginTop: 8 }]}>HEIGHT</Text>
          <View style={styles.addPillRow}>
            <Pressable
              style={[styles.subPill, more.heightRange === null && styles.subPillActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, heightRange: null })); }}
            >
              <Text style={[styles.subPillText, more.heightRange === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {HEIGHT_RANGES.map((r) => {
              const selected = more.heightRange !== null && more.heightRange[0] === r.min && more.heightRange[1] === r.max;
              return (
                <Pressable key={r.label} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, heightRange: selected ? null : [r.min, r.max] })); }}>
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Updated within */}
          <Text style={[styles.addLabel, { marginTop: 8 }]}>UPDATED</Text>
          <View style={styles.addPillRow}>
            <Pressable
              style={[styles.subPill, more.updatedWithin === null && styles.subPillActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, updatedWithin: null })); }}
            >
              <Text style={[styles.subPillText, more.updatedWithin === null && styles.subPillTextActive]}>All</Text>
            </Pressable>
            {UPDATED_OPTIONS.map((opt) => {
              const selected = more.updatedWithin === opt.key;
              return (
                <Pressable key={opt.key} style={[styles.subPill, selected && styles.subPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore((m) => ({ ...m, updatedWithin: selected ? null : opt.key })); }}>
                  <Text style={[styles.subPillText, selected && styles.subPillTextActive]}>{opt.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Reset */}
          {hasMoreActive && (
            <Pressable style={styles.resetBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMore(DEFAULT_MORE); }}>
              <Text style={styles.resetBtnText}>Reset</Text>
            </Pressable>
          )}
        </View>
      </BottomSheet>

      {/* ── Add to Board Sheet ── */}
      <BottomSheet
        visible={!!addSheetPlayer}
        onClose={() => setAddSheetPlayer(null)}
        title={addSheetPlayer ? `Add ${addSheetPlayer.firstName} ${addSheetPlayer.lastName}` : 'Add to Board'}
        useModal
      >
        {addSheetPlayer && (
          <View style={styles.addSheetContent}>
            <Text style={styles.addLabel}>DESTINATION</Text>
            <View style={styles.addPillRow}>
              {([
                { key: 'needs' as const, label: 'Needs' },
                { key: 'bigboard' as const, label: 'Big Board' },
                { key: 'crm' as const, label: 'CRM' },
              ]).map(({ key, label }) => (
                <Pressable key={key} style={[styles.addPill, addDestination === key && styles.addPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddDestination(key); }}>
                  <Text style={[styles.addPillText, addDestination === key && styles.addPillTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.addLabel}>POSITION SLOT</Text>
            <View style={styles.addPillRow}>
              {POSITION_SLOTS.map((slot) => (
                <Pressable key={slot} style={[styles.addPill, addSlot === slot && styles.addPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSlot(slot); }}>
                  <Text style={[styles.addPillText, addSlot === slot && styles.addPillTextActive]}>{slot}</Text>
                </Pressable>
              ))}
            </View>

            {(addDestination === 'needs' || addDestination === 'crm') && (
              <>
                <Text style={styles.addLabel}>TIER</Text>
                <View style={styles.addPillRow}>
                  {NEEDS_TIERS.map((tier) => (
                    <Pressable key={tier} style={[styles.addPill, addTier === tier && { backgroundColor: NEEDS_TIER_COLORS[tier], borderColor: NEEDS_TIER_COLORS[tier] }]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddTier(tier); }}>
                      <Text style={[styles.addPillText, addTier === tier && { color: WHITE }]}>{tier}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {addDestination === 'bigboard' && (
              <>
                <Text style={styles.addLabel}>BOARD RANK</Text>
                <TextInput
                  style={styles.rankInput}
                  value={addBigBoardRank}
                  onChangeText={setAddBigBoardRank}
                  placeholder="e.g. 12"
                  placeholderTextColor="#555"
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </>
            )}

            {addDestination === 'crm' && (
              <>
                <Text style={styles.addLabel}>INITIAL STATUS</Text>
                <View style={styles.addPillRow}>
                  {(['Watchlist', 'Evaluating', 'Contacted'] as BoardStatus[]).map((status) => (
                    <Pressable key={status} style={[styles.addPill, addStatus === status && styles.addPillActive]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddStatus(status); }}>
                      <Text style={[styles.addPillText, addStatus === status && styles.addPillTextActive]}>{status}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            <Pressable style={styles.confirmBtn} onPress={confirmAdd}>
              <Text style={styles.confirmBtnText}>
                {addDestination === 'needs' ? 'Add to Needs' : addDestination === 'bigboard' ? 'Add to Big Board' : 'Add to Board'}
              </Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  sliceBarScroll: { marginBottom: 4 },
  sliceBarContent: { flexDirection: 'row', gap: 6, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0B0F14', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  chipActive: { backgroundColor: WHITE },
  chipExpanded: { borderWidth: 1.5, borderColor: '#52525B' },
  chipText: { fontSize: 12, fontWeight: '600', color: GRAY },
  chipTextActive: { color: BG },
  subRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingVertical: 8, paddingHorizontal: 2, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: DIVIDER },
  groupLabel: { width: '100%', fontSize: 10, fontWeight: '700', color: GRAY, letterSpacing: 0.5, marginTop: 4, marginBottom: -2 },
  subPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 14, backgroundColor: CARD_BG, borderWidth: 1, borderColor: DIVIDER },
  subPillActive: { backgroundColor: WHITE, borderColor: WHITE },
  subPillText: { fontSize: 12, fontWeight: '600', color: GRAY },
  subPillTextActive: { color: BG },
  activePillsRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 4 },
  activePill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1D9BF0', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  activePillText: { fontSize: 11, fontWeight: '600', color: WHITE },
  clearAllText: { fontSize: 11, fontWeight: '600', color: GRAY, marginLeft: 4 },
  resultCount: { fontSize: 12, fontWeight: '600', color: GRAY, marginBottom: 10, marginTop: 4 },
  addToBoardBtn: { position: 'absolute', top: 14, right: 14, zIndex: 10 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: GRAY },
  addSheetContent: { gap: 12, paddingBottom: 20 },
  addLabel: { fontSize: 10, fontWeight: '700', color: GRAY, letterSpacing: 0.5 },
  addPillRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  addPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, backgroundColor: CARD_BG, borderWidth: 1, borderColor: DIVIDER },
  addPillActive: { backgroundColor: WHITE, borderColor: WHITE },
  addPillText: { fontSize: 12, fontWeight: '700', color: GRAY },
  addPillTextActive: { color: BG },
  rankInput: { backgroundColor: CARD_BG, borderWidth: 1, borderColor: DIVIDER, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, fontWeight: '600', color: WHITE },
  confirmBtn: { backgroundColor: '#1D9BF0', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: WHITE },
  resetBtn: { borderWidth: 1, borderColor: DIVIDER, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  resetBtnText: { fontSize: 13, fontWeight: '600', color: GRAY },
});
