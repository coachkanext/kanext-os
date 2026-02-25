/**
 * Recruiting Page — Database + Portal + Board sub-tabs
 *
 * Route: SportsHome → Recruiting tab (PagerView page)
 *
 * Database: Team-centric player browsing (Level → Conference → Team → Roster).
 * Portal: Transfer portal player universe, filtered by status/level/position.
 * Board: Internal CRM — stages, NIL, scholarships, KR intelligence.
 *
 * RBAC: Assistant Coach / Recruiting Coordinator. Read-only.
 * Player Sheet opens on tap. Long-press on Portal → Add to Board.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Text,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { nationalPool, toGlobalPlayerCard, type NationalPlayer } from '@/data/national-pool';
import { NIL_BUDGET, TOTAL_SCHOLARSHIPS, ROSTER_MAX } from '@/data/team-needs';
import { openPlayerCard, openTeamCard } from '@/utils/global-entity-sheets';
import { getKRColor, LEVEL_DISPLAY_SHORT, CLUSTER_LABELS } from '@/utils/kr-display';
import { RECRUITING_BOARD, type BoardEntry, type BoardStatus } from '@/data/recruitingBoard';

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type SubTab = 'database' | 'portal' | 'board';

type LensKey =
  | 'overall' | 'shooting' | 'finishing' | 'playmaking'
  | 'onBallD' | 'teamD' | 'rebounding' | 'frame';

const LENS_OPTIONS: { key: LensKey; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'playmaking', label: 'Playmaking' },
  { key: 'onBallD', label: 'On-Ball D' },
  { key: 'teamD', label: 'Team D' },
  { key: 'rebounding', label: 'Rebounding' },
  { key: 'frame', label: 'Frame' },
];

/** Map lens key to cluster key in NationalPlayer.clusters */
function getLensScore(p: NationalPlayer, lens: LensKey): number | null {
  switch (lens) {
    case 'overall': return p.kr;
    case 'shooting': return p.clusters?.shooting ?? null;
    case 'finishing': return p.clusters?.finishing ?? null;
    case 'playmaking': return p.clusters?.playmaking ?? null;
    case 'onBallD': return p.clusters?.on_ball_defense ?? null;
    case 'teamD': return p.clusters?.team_defense ?? null;
    case 'rebounding': return p.clusters?.rebounding ?? null;
    case 'frame': return p.clusters?.physical ?? null;
  }
}

const LEVEL_OPTIONS: { key: string; label: string }[] = [
  { key: 'ncaa_d1', label: 'NCAA D1' },
  { key: 'ncaa_d2', label: 'NCAA D2' },
  { key: 'ncaa_d3', label: 'NCAA D3' },
  { key: 'naia', label: 'NAIA' },
  { key: 'njcaa_d1', label: 'JUCO D1' },
  { key: 'njcaa_d2', label: 'JUCO D2' },
  { key: 'njcaa_d3', label: 'JUCO D3' },
  { key: 'cccaa', label: 'CCCAA' },
  { key: 'uscaa', label: 'USCAA' },
];

// Exported data uses flat level keys (ncaa_d1, not sub-levels)
function expandLevel(key: string): string[] {
  return [key];
}

type PickerTarget = 'level' | 'conference' | 'team' | null;

// =============================================================================
// PORTAL CONSTANTS
// =============================================================================

type PortalStatus = 'available' | 'committed' | 'withdrawn';

const PORTAL_STATUS_OPTIONS: { key: PortalStatus; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'committed', label: 'Committed' },
  { key: 'withdrawn', label: 'Withdrawn' },
];

const PORTAL_STATUS_COLORS: Record<PortalStatus, string> = {
  available: '#22C55E',
  committed: '#F59E0B',
  withdrawn: '#A1A1AA',
};

const POS_OPTIONS: { key: string; label: string }[] = [
  { key: 'PG', label: 'PG' },
  { key: 'CG', label: 'CG' },
  { key: 'W', label: 'Wing' },
  { key: 'F', label: 'Forward' },
  { key: 'B', label: 'Big' },
];

type PortalPickerTarget = 'level' | 'position' | null;

// =============================================================================
// BOARD CONSTANTS
// =============================================================================

type BoardColumnId = 'Watchlist' | 'Contacted' | 'Warm' | 'Visit' | 'Committed' | 'Signed';

const BOARD_COLUMN_DEFS: { id: BoardColumnId; label: string; color: string }[] = [
  { id: 'Watchlist', label: 'Watchlist', color: '#F59E0B' },
  { id: 'Contacted', label: 'Contacted', color: '#1D9BF0' },
  { id: 'Warm', label: 'Warm', color: '#F59E0B' },
  { id: 'Visit', label: 'Visit', color: '#1D9BF0' },
  { id: 'Committed', label: 'Committed', color: '#22C55E' },
  { id: 'Signed', label: 'Signed', color: '#1D9BF0' },
];

/** Map old 10-stage statuses to new 6-column layout */
const STATUS_TO_COLUMN: Record<BoardStatus, BoardColumnId | null> = {
  Watchlist: 'Watchlist',
  Evaluating: 'Watchlist',
  Contacted: 'Contacted',
  Priority: 'Contacted',
  'Visit Planned': 'Visit',
  Visited: 'Visit',
  'Offer Out': 'Warm',
  Committed: 'Committed',
  Signed: 'Signed',
  Missed: null, // excluded
};

/** Parse NIL amount string like "$5K" → 5000 */
function parseNIL(amount?: string): number {
  if (!amount) return 0;
  const m = amount.match(/\$?([\d.]+)\s*K/i);
  if (m) return parseFloat(m[1]) * 1000;
  const m2 = amount.match(/\$?([\d,]+)/);
  if (m2) return parseInt(m2[1].replace(/,/g, ''), 10);
  return 0;
}

// =============================================================================
// COMPONENT
// =============================================================================

interface Props {
  colors: typeof Colors.light;
}

export function RecruitingPage({ colors }: Props) {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();

  // Sub-tab state
  const [activeTab, setActiveTab] = useState<SubTab>('database');

  // Filter state
  const [search, setSearch] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedConference, setSelectedConference] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [activePicker, setActivePicker] = useState<PickerTarget>(null);

  // Lens state (shared across Database + Portal)
  const [lens, setLens] = useState<LensKey>('overall');

  // Portal state
  const [portalSearch, setPortalSearch] = useState('');
  const [portalStatus, setPortalStatus] = useState<PortalStatus>('available');
  const [portalLevel, setPortalLevel] = useState<string | null>(null);
  const [portalPosition, setPortalPosition] = useState<string | null>(null);
  const [portalPicker, setPortalPicker] = useState<PortalPickerTarget>(null);
  const [longPressPlayer, setLongPressPlayer] = useState<NationalPlayer | null>(null);

  // Board state
  const [boardSearch, setBoardSearch] = useState('');
  const [boardEntries, setBoardEntries] = useState<BoardEntry[]>(() => RECRUITING_BOARD);
  const [boardLongPress, setBoardLongPress] = useState<BoardEntry | null>(null);
  const [showMovePicker, setShowMovePicker] = useState(false);

  // ── Derived: all players at selected level ──
  const allPlayers = useMemo(() => nationalPool.getAll(), []);

  const expandedLevels = useMemo(
    () => selectedLevel ? expandLevel(selectedLevel) : null,
    [selectedLevel],
  );

  const playersAtLevel = useMemo(() => {
    if (!expandedLevels) return allPlayers;
    return allPlayers.filter(p => expandedLevels.includes(p.levelKey));
  }, [allPlayers, expandedLevels]);

  // ── Derived: conferences at level ──
  const conferences = useMemo(() => {
    const set = new Set<string>();
    for (const p of playersAtLevel) {
      if (p.conference) set.add(p.conference);
    }
    return Array.from(set).sort();
  }, [playersAtLevel]);

  // ── Derived: teams at level + conference ──
  const teams = useMemo(() => {
    let pool = playersAtLevel;
    if (selectedConference) {
      pool = pool.filter(p => p.conference === selectedConference);
    }
    const set = new Set<string>();
    for (const p of pool) {
      if (p.school) set.add(p.school);
    }
    return Array.from(set).sort();
  }, [playersAtLevel, selectedConference]);

  // ── Derived: team roster ──
  const teamRoster = useMemo(() => {
    if (!selectedTeam) return [];
    const roster = nationalPool.getTeamRoster(selectedTeam);
    // Sort by active lens score descending
    return [...roster].sort((a, b) => {
      const sa = getLensScore(a, lens) ?? -1;
      const sb = getLensScore(b, lens) ?? -1;
      return sb - sa;
    });
  }, [selectedTeam, lens]);

  // ── Derived: search results ──
  const searchResults = useMemo(() => {
    if (!search || search.length < 2) return null;
    return nationalPool.search({ query: search, limit: 50, sortBy: 'kr', sortDir: 'desc' });
  }, [search]);

  // ── Derived: team system ──
  const teamSystem = useMemo(
    () => selectedTeam ? nationalPool.getTeamSystem(selectedTeam) : undefined,
    [selectedTeam],
  );

  // ── Derived: portal players ──
  const allPortalPlayers = useMemo(
    () => allPlayers.filter(p => p.portalEntryDate != null),
    [allPlayers],
  );

  const portalResults = useMemo(() => {
    let pool = allPortalPlayers;

    // Search filter
    if (portalSearch && portalSearch.length >= 2) {
      const q = portalSearch.toLowerCase();
      pool = pool.filter(p =>
        p.fullName.toLowerCase().includes(q) ||
        p.school.toLowerCase().includes(q),
      );
    }

    // Level filter
    if (portalLevel) {
      pool = pool.filter(p => p.levelKey === portalLevel);
    }

    // Position filter
    if (portalPosition) {
      pool = pool.filter(p => p.position === portalPosition);
    }

    // Sort by active lens score descending, tie-break by overall KR
    return [...pool].sort((a, b) => {
      const sa = getLensScore(a, lens) ?? -1;
      const sb = getLensScore(b, lens) ?? -1;
      if (sb !== sa) return sb - sa;
      return (b.kr ?? 0) - (a.kr ?? 0);
    });
  }, [allPortalPlayers, portalSearch, portalLevel, portalPosition, lens]);

  // ── Derived: board columns ──
  const boardColumns = useMemo(() => {
    const q = boardSearch.toLowerCase();
    const active = boardEntries.filter(e => {
      const col = STATUS_TO_COLUMN[e.status];
      if (!col) return false; // exclude Missed
      if (q.length >= 2) {
        // Extract name from shortNotes or use playerId
        const name = e.shortNotes.toLowerCase();
        const id = e.playerId.toLowerCase();
        if (!name.includes(q) && !id.includes(q)) return false;
      }
      return true;
    });
    const map = new Map<BoardColumnId, BoardEntry[]>();
    for (const def of BOARD_COLUMN_DEFS) map.set(def.id, []);
    for (const e of active) {
      const col = STATUS_TO_COLUMN[e.status]!;
      map.get(col)!.push(e);
    }
    // Sort each column by rank
    for (const [, entries] of map) entries.sort((a, b) => a.rank - b.rank);
    return map;
  }, [boardEntries, boardSearch]);

  // ── Derived: board budget ──
  const boardBudget = useMemo(() => {
    const committed = boardEntries.filter(e => {
      const col = STATUS_TO_COLUMN[e.status];
      return col === 'Committed' || col === 'Signed';
    });
    const committedNIL = committed.reduce((s, e) => s + parseNIL(e.nil?.amount), 0);
    const committedAid = committed.reduce((s, e) => s + (e.offer?.scholarshipPct ?? 0), 0) / 100;
    return {
      nilBudget: NIL_BUDGET,
      committedNIL,
      remainingNIL: NIL_BUDGET - committedNIL,
      scholarshipsUsed: committedAid,
      totalScholarships: TOTAL_SCHOLARSHIPS,
      remainingScholarships: TOTAL_SCHOLARSHIPS - committedAid,
    };
  }, [boardEntries]);

  // ── Handlers ──
  const handleLevelSelect = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedLevel(key);
    setSelectedConference(null);
    setSelectedTeam(null);
    setActivePicker(null);
  }, []);

  const handleConferenceSelect = useCallback((conf: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConference(conf);
    setSelectedTeam(null);
    setActivePicker(null);
  }, []);

  const handleTeamSelect = useCallback((team: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTeam(team);
    setActivePicker(null);
  }, []);

  const handlePlayerTap = useCallback((player: NationalPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard(toGlobalPlayerCard(player));
  }, []);

  const handleTeamSheetTap = useCallback(() => {
    if (!selectedTeam) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const sys = nationalPool.getTeamSystem(selectedTeam);
    const roster = nationalPool.getTeamRoster(selectedTeam);
    const first = roster[0];
    openTeamCard({
      name: selectedTeam,
      conference: first?.conference,
      level: first?.levelDisplay,
      teamKR: sys ? Math.round(((sys.offSystemScore ?? 0) + (sys.defSystemScore ?? 0)) / 2) || undefined : undefined,
      osie: sys?.offSystem ?? undefined,
      osieScore: sys?.offSystemScore ?? undefined,
      dsie: sys?.defSystem ?? undefined,
      dsieScore: sys?.defSystemScore ?? undefined,
    });
  }, [selectedTeam]);

  const clearFilters = useCallback(() => {
    setSelectedLevel(null);
    setSelectedConference(null);
    setSelectedTeam(null);
    setSearch('');
    setActivePicker(null);
  }, []);

  const togglePicker = useCallback((target: PickerTarget) => {
    setActivePicker(prev => prev === target ? null : target);
  }, []);

  // Portal handlers
  const clearPortalFilters = useCallback(() => {
    setPortalSearch('');
    setPortalLevel(null);
    setPortalPosition(null);
    setPortalPicker(null);
  }, []);

  const togglePortalPicker = useCallback((target: PortalPickerTarget) => {
    setPortalPicker(prev => prev === target ? null : target);
  }, []);

  const handleLongPress = useCallback((player: NationalPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLongPressPlayer(player);
  }, []);

  const handleAddToBoard = useCallback(() => {
    // TODO: integrate with Board data when Board tab is implemented
    setLongPressPlayer(null);
  }, []);

  // Board handlers
  const handleBoardCardTap = useCallback((entry: BoardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Open player sheet with available data
    openPlayerCard({
      name: entry.shortNotes.split('!')[0].trim() || entry.playerId,
      number: '',
      position: entry.position,
      height: '',
      weight: 0,
      classYear: entry.classYear,
      kr: undefined,
      school: entry.longNotes.match(/from (.+?)[\.\,]/)?.[1],
      scholarshipPct: entry.offer?.scholarshipPct,
      nilAmount: parseNIL(entry.nil?.amount),
    });
  }, []);

  const handleBoardLongPress = useCallback((entry: BoardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBoardLongPress(entry);
    setShowMovePicker(false);
  }, []);

  const handleBoardMove = useCallback((entry: BoardEntry, toColumn: BoardColumnId) => {
    // Find a BoardStatus that maps to the target column
    const statusMap: Record<BoardColumnId, BoardStatus> = {
      Watchlist: 'Watchlist',
      Contacted: 'Contacted',
      Warm: 'Offer Out',
      Visit: 'Visited',
      Committed: 'Committed',
      Signed: 'Signed',
    };
    setBoardEntries(prev => prev.map(e =>
      e.id === entry.id ? { ...e, status: statusMap[toColumn] } : e,
    ));
    setBoardLongPress(null);
    setShowMovePicker(false);
  }, []);

  const handleBoardRemove = useCallback((entry: BoardEntry) => {
    setBoardEntries(prev => prev.filter(e => e.id !== entry.id));
    setBoardLongPress(null);
  }, []);

  // ── Render helpers ──
  const isSearchMode = searchResults !== null;
  const displayPlayers = isSearchMode ? searchResults : teamRoster;
  const levelLabel = selectedLevel
    ? LEVEL_OPTIONS.find(l => l.key === selectedLevel)?.label ?? selectedLevel
    : 'Level';

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── Header ── */}
      <View style={styles.header}>
        {/* Sub-tab pills */}
        <View style={styles.subTabRow}>
          {(['database', 'portal', 'board'] as SubTab[]).map(tab => {
            const isActive = activeTab === tab;
            return (
              <Pressable
                key={tab}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab);
                }}
                style={[
                  styles.subTabPill,
                  { backgroundColor: isActive ? accent : colors.card, borderColor: isActive ? accent : colors.border },
                ]}
              >
                <Text style={[styles.subTabLabel, { color: isActive ? '#fff' : colors.textSecondary }]}>
                  {tab === 'database' ? 'Database' : tab === 'portal' ? 'Portal' : 'Board'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* ── Board Tab ── */}
      {activeTab === 'board' && (
        <View style={{ flex: 1 }}>
          {/* Search bar */}
          <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search board"
              placeholderTextColor={colors.textTertiary}
              value={boardSearch}
              onChangeText={setBoardSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {boardSearch.length > 0 && (
              <Pressable onPress={() => setBoardSearch('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Budget Bar (Always Visible) */}
          <View style={[styles.budgetBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.budgetRow}>
              <View style={styles.budgetCol}>
                <Text style={[styles.budgetColTitle, { color: colors.textSecondary }]}>NIL</Text>
                <View style={styles.budgetLine}>
                  <Text style={[styles.budgetLabel, { color: colors.textTertiary }]}>Budget</Text>
                  <Text style={[styles.budgetValue, { color: colors.text }]}>${boardBudget.nilBudget.toLocaleString()}</Text>
                </View>
                <View style={styles.budgetLine}>
                  <Text style={[styles.budgetLabel, { color: colors.textTertiary }]}>Committed</Text>
                  <Text style={[styles.budgetValue, { color: '#F59E0B' }]}>${boardBudget.committedNIL.toLocaleString()}</Text>
                </View>
                <View style={styles.budgetLine}>
                  <Text style={[styles.budgetLabel, { color: colors.textTertiary }]}>Remaining</Text>
                  <Text style={[styles.budgetValue, { color: '#22C55E' }]}>${boardBudget.remainingNIL.toLocaleString()}</Text>
                </View>
              </View>
              <View style={[styles.budgetDivider, { backgroundColor: colors.border }]} />
              <View style={styles.budgetCol}>
                <Text style={[styles.budgetColTitle, { color: colors.textSecondary }]}>Scholarships</Text>
                <View style={styles.budgetLine}>
                  <Text style={[styles.budgetLabel, { color: colors.textTertiary }]}>Used</Text>
                  <Text style={[styles.budgetValue, { color: colors.text }]}>{boardBudget.scholarshipsUsed.toFixed(1)} / {boardBudget.totalScholarships}</Text>
                </View>
                <View style={styles.budgetLine}>
                  <Text style={[styles.budgetLabel, { color: colors.textTertiary }]}>Remaining</Text>
                  <Text style={[styles.budgetValue, { color: '#22C55E' }]}>{boardBudget.remainingScholarships.toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Column headers (horizontal scroll) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.boardColumnsContainer}
          >
            {BOARD_COLUMN_DEFS.map(col => {
              const entries = boardColumns.get(col.id) ?? [];
              return (
                <View key={col.id} style={[styles.boardColumn, { borderColor: colors.border }]}>
                  {/* Column header */}
                  <View style={[styles.boardColumnHeader, { borderBottomColor: colors.border }]}>
                    <View style={[styles.boardColumnDot, { backgroundColor: col.color }]} />
                    <Text style={[styles.boardColumnTitle, { color: colors.text }]}>{col.label}</Text>
                    <Text style={[styles.boardColumnCount, { color: colors.textTertiary }]}>{entries.length}</Text>
                  </View>

                  {/* Cards */}
                  <ScrollView style={styles.boardColumnScroll} nestedScrollEnabled>
                    {entries.map(entry => (
                      <BoardCard
                        key={entry.id}
                        entry={entry}
                        colors={colors}
                        accent={accent}
                        onPress={() => handleBoardCardTap(entry)}
                        onLongPress={() => handleBoardLongPress(entry)}
                      />
                    ))}
                    {entries.length === 0 && (
                      <Text style={[styles.boardEmpty, { color: colors.textTertiary }]}>
                        No recruits in this stage.
                      </Text>
                    )}
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* ── Board Long-Press Action Sheet ── */}
      {boardLongPress && (
        <Pressable
          style={styles.actionOverlay}
          onPress={() => { setBoardLongPress(null); setShowMovePicker(false); }}
        >
          <View style={[styles.actionSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.actionSheetTitle, { color: colors.text }]} numberOfLines={1}>
              {boardLongPress.shortNotes.split('!')[0].trim() || boardLongPress.playerId}
            </Text>

            {!showMovePicker ? (
              <>
                <Pressable
                  onPress={() => setShowMovePicker(true)}
                  style={[styles.actionItem, { borderBottomColor: colors.border }]}
                >
                  <IconSymbol name="arrow.right.circle.fill" size={18} color={accent} />
                  <Text style={[styles.actionItemText, { color: colors.text }]}>Move to...</Text>
                </Pressable>
                <Pressable
                  onPress={() => setBoardLongPress(null)}
                  style={[styles.actionItem, { borderBottomColor: colors.border }]}
                >
                  <IconSymbol name="note.text" size={18} color={accent} />
                  <Text style={[styles.actionItemText, { color: colors.text }]}>Add Note</Text>
                </Pressable>
                <Pressable
                  onPress={() => handleBoardRemove(boardLongPress)}
                  style={[styles.actionItem, { borderBottomColor: colors.border }]}
                >
                  <IconSymbol name="trash" size={18} color="#EF4444" />
                  <Text style={[styles.actionItemText, { color: '#EF4444' }]}>Remove from Board</Text>
                </Pressable>
                <Pressable
                  onPress={() => { setBoardLongPress(null); setShowMovePicker(false); }}
                  style={styles.actionItem}
                >
                  <IconSymbol name="xmark" size={16} color={colors.textTertiary} />
                  <Text style={[styles.actionItemText, { color: colors.textSecondary }]}>Cancel</Text>
                </Pressable>
              </>
            ) : (
              <>
                {BOARD_COLUMN_DEFS.map(col => {
                  const currentCol = STATUS_TO_COLUMN[boardLongPress.status];
                  const isCurrent = col.id === currentCol;
                  return (
                    <Pressable
                      key={col.id}
                      onPress={() => { if (!isCurrent) handleBoardMove(boardLongPress, col.id); }}
                      style={[styles.actionItem, { borderBottomColor: colors.border, opacity: isCurrent ? 0.4 : 1 }]}
                    >
                      <View style={[styles.boardColumnDot, { backgroundColor: col.color }]} />
                      <Text style={[styles.actionItemText, { color: isCurrent ? colors.textTertiary : colors.text }]}>
                        {col.label}{isCurrent ? ' (current)' : ''}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setShowMovePicker(false)}
                  style={styles.actionItem}
                >
                  <IconSymbol name="chevron.left" size={14} color={colors.textTertiary} />
                  <Text style={[styles.actionItemText, { color: colors.textSecondary }]}>Back</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      )}

      {/* ── Portal Tab ── */}
      {activeTab === 'portal' && (
        <FlatList
          data={portalResults}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Search bar */}
              <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search player / school"
                  placeholderTextColor={colors.textTertiary}
                  value={portalSearch}
                  onChangeText={setPortalSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {portalSearch.length > 0 && (
                  <Pressable onPress={() => setPortalSearch('')} hitSlop={8}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              {/* Status pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                keyboardShouldPersistTaps="always"
                contentContainerStyle={styles.portalStatusRow}
              >
                {PORTAL_STATUS_OPTIONS.map(opt => {
                  const isActive = portalStatus === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setPortalStatus(opt.key);
                      }}
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: isActive ? PORTAL_STATUS_COLORS[opt.key] + '20' : colors.card,
                          borderColor: isActive ? PORTAL_STATUS_COLORS[opt.key] : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.statusPillText, { color: isActive ? PORTAL_STATUS_COLORS[opt.key] : colors.textSecondary }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Level + Position filters */}
              <View style={styles.filterSection}>
                <View style={styles.filterRow}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.filterScrollContent}>
                    {/* Level */}
                    <Pressable
                      onPress={() => togglePortalPicker('level')}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: portalLevel ? accent + '20' : colors.card,
                          borderColor: portalLevel ? accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.filterPillText, { color: portalLevel ? accent : colors.textSecondary }]}>
                        {portalLevel ? LEVEL_OPTIONS.find(l => l.key === portalLevel)?.label ?? portalLevel : 'Level'}
                      </Text>
                      <IconSymbol name="chevron.down" size={10} color={portalLevel ? accent : colors.textTertiary} />
                    </Pressable>

                    {/* Position */}
                    <Pressable
                      onPress={() => togglePortalPicker('position')}
                      style={[
                        styles.filterPill,
                        {
                          backgroundColor: portalPosition ? accent + '20' : colors.card,
                          borderColor: portalPosition ? accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.filterPillText, { color: portalPosition ? accent : colors.textSecondary }]}>
                        {portalPosition ? POS_OPTIONS.find(p => p.key === portalPosition)?.label ?? portalPosition : 'Position'}
                      </Text>
                      <IconSymbol name="chevron.down" size={10} color={portalPosition ? accent : colors.textTertiary} />
                    </Pressable>
                  </ScrollView>

                  {/* Clear */}
                  {(portalLevel || portalPosition) && (
                    <Pressable onPress={clearPortalFilters} hitSlop={8} style={[styles.filterPill, { borderColor: colors.border, backgroundColor: colors.card, marginLeft: 8 }]}>
                      <Text style={[styles.filterPillText, { color: '#EF4444' }]}>Clear</Text>
                    </Pressable>
                  )}
                </View>

                {/* Picker dropdowns */}
                {portalPicker === 'level' && (
                  <PickerDropdown
                    items={LEVEL_OPTIONS}
                    selected={portalLevel}
                    onSelect={(key) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPortalLevel(key);
                      setPortalPicker(null);
                    }}
                    colors={colors}
                    accent={accent}
                  />
                )}
                {portalPicker === 'position' && (
                  <PickerDropdown
                    items={POS_OPTIONS}
                    selected={portalPosition}
                    onSelect={(key) => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setPortalPosition(key);
                      setPortalPicker(null);
                    }}
                    colors={colors}
                    accent={accent}
                  />
                )}
              </View>

              {/* Lens toggle */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.lensRow}
              >
                {LENS_OPTIONS.map(opt => {
                  const isActive = lens === opt.key;
                  return (
                    <Pressable
                      key={opt.key}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setLens(opt.key);
                      }}
                      style={[
                        styles.lensPill,
                        {
                          backgroundColor: isActive ? accent : colors.card,
                          borderColor: isActive ? accent : colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.lensPillText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Results count */}
              {portalResults.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                    {portalResults.length} player{portalResults.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {/* Empty states */}
              {allPortalPlayers.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="arrow.left.arrow.right" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    Portal data not available.
                  </Text>
                </View>
              )}
              {allPortalPlayers.length > 0 && portalResults.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="magnifyingglass" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No portal matches.
                  </Text>
                  <Pressable onPress={clearPortalFilters} style={[styles.clearBtn, { borderColor: colors.border }]}>
                    <Text style={{ fontSize: 13, color: accent }}>Clear Filters</Text>
                  </Pressable>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <PortalPlayerRow
              player={item}
              lens={lens}
              colors={colors}
              onPress={() => handlePlayerTap(item)}
              onLongPress={() => handleLongPress(item)}
            />
          )}
        />
      )}

      {/* ── Long-press Quick Action Sheet ── */}
      {longPressPlayer && (
        <Pressable
          style={styles.actionOverlay}
          onPress={() => setLongPressPlayer(null)}
        >
          <View style={[styles.actionSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.actionSheetTitle, { color: colors.text }]} numberOfLines={1}>
              {longPressPlayer.fullName}
            </Text>
            <Pressable
              onPress={handleAddToBoard}
              style={[styles.actionItem, { borderBottomColor: colors.border }]}
            >
              <IconSymbol name="plus.circle.fill" size={18} color={accent} />
              <Text style={[styles.actionItemText, { color: colors.text }]}>Add to Board</Text>
              <Text style={[styles.actionItemSub, { color: colors.textTertiary }]}>Watchlist</Text>
            </Pressable>
            <Pressable
              onPress={() => setLongPressPlayer(null)}
              style={styles.actionItem}
            >
              <IconSymbol name="xmark" size={16} color={colors.textTertiary} />
              <Text style={[styles.actionItemText, { color: colors.textSecondary }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* ── Database Tab ── */}
      {activeTab === 'database' && (
        <FlatList
          data={displayPlayers}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <>
              {/* Search bar */}
              <View style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search player / team"
                  placeholderTextColor={colors.textTertiary}
                  value={search}
                  onChangeText={setSearch}
                  autoCorrect={false}
                  autoCapitalize="none"
                />
                {search.length > 0 && (
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <IconSymbol name="xmark.circle.fill" size={18} color={colors.textTertiary} />
                  </Pressable>
                )}
              </View>

              {/* Filter row — 3 cascading pills */}
              {!isSearchMode && (
                <View style={styles.filterSection}>
                  <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="always" contentContainerStyle={styles.filterScrollContent}>
                      {/* Level */}
                      <Pressable
                        onPress={() => togglePicker('level')}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: selectedLevel ? accent + '20' : colors.card,
                            borderColor: selectedLevel ? accent : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.filterPillText, { color: selectedLevel ? accent : colors.textSecondary }]}>
                          {levelLabel}
                        </Text>
                        <IconSymbol name="chevron.down" size={10} color={selectedLevel ? accent : colors.textTertiary} />
                      </Pressable>

                      {/* Conference */}
                      <Pressable
                        onPress={() => { if (selectedLevel) togglePicker('conference'); }}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: selectedConference ? accent + '20' : colors.card,
                            borderColor: selectedConference ? accent : colors.border,
                            opacity: selectedLevel ? 1 : 0.4,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.filterPillText, { color: selectedConference ? accent : colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {selectedConference ?? 'Conference'}
                        </Text>
                        <IconSymbol name="chevron.down" size={10} color={selectedConference ? accent : colors.textTertiary} />
                      </Pressable>

                      {/* Team */}
                      <Pressable
                        onPress={() => { if (selectedLevel) togglePicker('team'); }}
                        style={[
                          styles.filterPill,
                          {
                            backgroundColor: selectedTeam ? accent + '20' : colors.card,
                            borderColor: selectedTeam ? accent : colors.border,
                            opacity: selectedLevel ? 1 : 0.4,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.filterPillText, { color: selectedTeam ? accent : colors.textSecondary }]}
                          numberOfLines={1}
                        >
                          {selectedTeam ?? 'Team'}
                        </Text>
                        <IconSymbol name="chevron.down" size={10} color={selectedTeam ? accent : colors.textTertiary} />
                      </Pressable>
                    </ScrollView>

                    {/* Clear — outside ScrollView so touch always works */}
                    {(selectedLevel || selectedConference || selectedTeam) && (
                      <Pressable onPress={clearFilters} hitSlop={8} style={[styles.filterPill, { borderColor: colors.border, backgroundColor: colors.card, marginLeft: 8 }]}>
                        <Text style={[styles.filterPillText, { color: '#EF4444' }]}>Clear</Text>
                      </Pressable>
                    )}
                  </View>

                  {/* Inline picker dropdown */}
                  {activePicker === 'level' && (
                    <PickerDropdown
                      items={LEVEL_OPTIONS.map(l => ({ key: l.key, label: l.label }))}
                      selected={selectedLevel}
                      onSelect={handleLevelSelect}
                      colors={colors}
                      accent={accent}
                    />
                  )}
                  {activePicker === 'conference' && (
                    <PickerDropdown
                      items={conferences.map(c => ({ key: c, label: c }))}
                      selected={selectedConference}
                      onSelect={handleConferenceSelect}
                      colors={colors}
                      accent={accent}
                    />
                  )}
                  {activePicker === 'team' && (
                    <PickerDropdown
                      items={teams.map(t => ({ key: t, label: t }))}
                      selected={selectedTeam}
                      onSelect={handleTeamSelect}
                      colors={colors}
                      accent={accent}
                    />
                  )}
                </View>
              )}

              {/* Recruiting Constraints */}
              <View style={[styles.constraintsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.constraintsRow}>
                  <View style={styles.constraintCol}>
                    <Text style={[styles.constraintLabel, { color: colors.textSecondary }]}>NIL Budget</Text>
                    <Text style={[styles.constraintValue, { color: colors.text }]}>
                      ${NIL_BUDGET.toLocaleString()}
                    </Text>
                  </View>
                  <View style={[styles.constraintDivider, { backgroundColor: colors.border }]} />
                  <View style={styles.constraintCol}>
                    <Text style={[styles.constraintLabel, { color: colors.textSecondary }]}>Scholarships</Text>
                    <Text style={[styles.constraintValue, { color: colors.text }]}>
                      {TOTAL_SCHOLARSHIPS} / {ROSTER_MAX}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Team Header (when team selected) */}
              {selectedTeam && !isSearchMode && (
                <View style={[styles.teamHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.teamHeaderTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.teamName, { color: colors.text }]}>{selectedTeam}</Text>
                      <View style={styles.teamMeta}>
                        <View style={[styles.levelBadge, { backgroundColor: accent + '20' }]}>
                          <Text style={[styles.levelBadgeText, { color: accent }]}>{levelLabel}</Text>
                        </View>
                        {teamRoster[0]?.conference && (
                          <Text style={[styles.teamConf, { color: colors.textSecondary }]}>
                            {teamRoster[0].conference}
                          </Text>
                        )}
                      </View>
                    </View>
                    {teamSystem && (teamSystem.offSystemScore || teamSystem.defSystemScore) && (
                      <View style={styles.teamKRBadge}>
                        <Text style={[styles.teamKRLabel, { color: colors.textSecondary }]}>Team KR</Text>
                        <Text style={[styles.teamKRValue, { color: getKRColor(Math.round(((teamSystem.offSystemScore ?? 0) + (teamSystem.defSystemScore ?? 0)) / 2)) }]}>
                          {Math.round(((teamSystem.offSystemScore ?? 0) + (teamSystem.defSystemScore ?? 0)) / 2)}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Pressable
                    onPress={handleTeamSheetTap}
                    style={[styles.teamSheetChip, { backgroundColor: accent + '15', borderColor: accent + '40' }]}
                  >
                    <Text style={[styles.teamSheetChipText, { color: accent }]}>Open Team Sheet</Text>
                    <IconSymbol name="chevron.right" size={11} color={accent} />
                  </Pressable>
                </View>
              )}

              {/* Lens toggle */}
              {(selectedTeam || isSearchMode) && displayPlayers.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.lensRow}
                >
                  {LENS_OPTIONS.map(opt => {
                    const isActive = lens === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLens(opt.key);
                        }}
                        style={[
                          styles.lensPill,
                          {
                            backgroundColor: isActive ? accent : colors.card,
                            borderColor: isActive ? accent : colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.lensPillText, { color: isActive ? '#fff' : colors.textSecondary }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </ScrollView>
              )}

              {/* Section header for search results */}
              {isSearchMode && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                  </Text>
                  <Pressable onPress={() => setSearch('')} hitSlop={8}>
                    <Text style={{ fontSize: 13, color: accent }}>Clear</Text>
                  </Pressable>
                </View>
              )}

              {/* Roster count when team selected */}
              {selectedTeam && !isSearchMode && teamRoster.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                    Roster ({teamRoster.length})
                  </Text>
                </View>
              )}

              {/* Empty states */}
              {!isSearchMode && !selectedTeam && (
                <View style={styles.emptyState}>
                  <IconSymbol name="line.3.horizontal.decrease.circle" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    Select Level → Conference → Team to view roster.
                  </Text>
                </View>
              )}
              {isSearchMode && searchResults.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="magnifyingglass" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No matches found.
                  </Text>
                  <Pressable onPress={() => setSearch('')} style={[styles.clearBtn, { borderColor: colors.border }]}>
                    <Text style={{ fontSize: 13, color: accent }}>Clear Search</Text>
                  </Pressable>
                </View>
              )}
              {selectedTeam && !isSearchMode && teamRoster.length === 0 && (
                <View style={styles.emptyState}>
                  <IconSymbol name="person.2.slash" size={32} color={colors.textTertiary} />
                  <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                    No player data available for this team.
                  </Text>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <PlayerRow
              player={item}
              lens={lens}
              colors={colors}
              onPress={() => handlePlayerTap(item)}
              showSchool={isSearchMode}
            />
          )}
        />
      )}
    </View>
  );
}

// =============================================================================
// PICKER DROPDOWN
// =============================================================================

function PickerDropdown({
  items,
  selected,
  onSelect,
  colors,
  accent,
}: {
  items: { key: string; label: string }[];
  selected: string | null;
  onSelect: (key: string) => void;
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <View style={[styles.pickerDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ScrollView style={styles.pickerScroll} nestedScrollEnabled>
        {items.map(item => {
          const isSelected = item.key === selected;
          return (
            <Pressable
              key={item.key}
              onPress={() => onSelect(item.key)}
              style={[
                styles.pickerItem,
                isSelected && { backgroundColor: accent + '15' },
              ]}
            >
              <Text
                style={[styles.pickerItemText, { color: isSelected ? accent : colors.text }]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
              {isSelected && <IconSymbol name="checkmark" size={14} color={accent} />}
            </Pressable>
          );
        })}
        {items.length === 0 && (
          <Text style={[styles.pickerEmpty, { color: colors.textTertiary }]}>No options available</Text>
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// PLAYER ROW
// =============================================================================

function PlayerRow({
  player,
  lens,
  colors,
  onPress,
  showSchool,
}: {
  player: NationalPlayer;
  lens: LensKey;
  colors: typeof Colors.light;
  onPress: () => void;
  showSchool?: boolean;
}) {
  const score = getLensScore(player, lens);
  const scoreColor = getKRColor(score);

  return (
    <Pressable onPress={onPress} style={[styles.playerRow, { borderBottomColor: colors.border }]}>
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: colors.text }]}>{player.fullName}</Text>
        <Text style={[styles.playerPos, { color: colors.textSecondary }]}>{player.position}</Text>
        <Text style={[styles.playerSub, { color: colors.textTertiary }]}>
          {player.height}{player.weight ? ` / ${player.weight} lbs` : ''}
          {player.classYear ? ` · ${player.classYear}` : ''}
          {showSchool ? ` · ${player.school}` : ''}
        </Text>
      </View>
      <View style={styles.playerScore}>
        {score != null ? (
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{Math.round(score)}</Text>
        ) : (
          <Text style={[styles.scoreDash, { color: colors.textTertiary }]}>—</Text>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// PORTAL PLAYER ROW
// =============================================================================

function PortalPlayerRow({
  player,
  lens,
  colors,
  onPress,
  onLongPress,
}: {
  player: NationalPlayer;
  lens: LensKey;
  colors: typeof Colors.light;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const score = getLensScore(player, lens);
  const scoreColor = getKRColor(score);
  // Derive portal status — all current portal entries are "Available"
  const status: PortalStatus = 'available';
  const statusColor = PORTAL_STATUS_COLORS[status];

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[styles.playerRow, { borderBottomColor: colors.border }]}
    >
      <View style={styles.playerInfo}>
        <Text style={[styles.playerName, { color: colors.text }]}>{player.fullName}</Text>
        <Text style={[styles.playerPos, { color: colors.textSecondary }]}>{player.position}</Text>
        <Text style={[styles.playerSub, { color: colors.textTertiary }]}>
          {player.height}{player.weight ? ` / ${player.weight} lbs` : ''}
          {player.classYear ? ` · ${player.classYear}` : ''}
        </Text>
        <Text style={[styles.playerSub, { color: colors.textTertiary }]}>{player.school}</Text>
      </View>
      <View style={styles.portalRight}>
        {score != null ? (
          <Text style={[styles.scoreValue, { color: scoreColor }]}>{Math.round(score)}</Text>
        ) : (
          <Text style={[styles.scoreDash, { color: colors.textTertiary }]}>—</Text>
        )}
        <View style={[styles.statusChip, { backgroundColor: statusColor + '18' }]}>
          <Text style={[styles.statusChipText, { color: statusColor }]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

// =============================================================================
// BOARD CARD
// =============================================================================

function BoardCard({
  entry,
  colors,
  accent,
  onPress,
  onLongPress,
}: {
  entry: BoardEntry;
  colors: typeof Colors.light;
  accent: string;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const nilAmount = parseNIL(entry.nil?.amount);
  const aidPct = entry.offer?.scholarshipPct;
  const noteCount = entry.log.filter(l => l.type === 'Note').length;
  // Pick up to 2 tags
  const tags = entry.tags.slice(0, 2);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={400}
      style={[styles.boardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={styles.boardCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.boardCardName, { color: colors.text }]} numberOfLines={1}>
            {entry.shortNotes.replace(/^(Committed! |Lost to .+ — )/, '').split(',')[0].trim()}
          </Text>
          <Text style={[styles.boardCardPos, { color: colors.textSecondary }]}>{entry.position}</Text>
          <Text style={[styles.boardCardSub, { color: colors.textTertiary }]}>
            Class {entry.classYear}
          </Text>
        </View>
        <View style={styles.boardCardRight}>
          {entry.bigBoardRank != null && (
            <Text style={[styles.boardCardKR, { color: getKRColor(90 - entry.bigBoardRank) }]}>
              #{entry.bigBoardRank}
            </Text>
          )}
          {(aidPct != null || nilAmount > 0) && (
            <View style={styles.boardCardFinancial}>
              {aidPct != null && (
                <Text style={[styles.boardCardFinText, { color: colors.textTertiary }]}>{aidPct}% aid</Text>
              )}
              {nilAmount > 0 && (
                <Text style={[styles.boardCardFinText, { color: colors.textTertiary }]}>${(nilAmount / 1000).toFixed(0)}K</Text>
              )}
            </View>
          )}
        </View>
      </View>

      {/* Tags */}
      {tags.length > 0 && (
        <View style={styles.boardCardTags}>
          {tags.map(tag => (
            <View key={tag} style={[styles.boardCardTag, { backgroundColor: accent + '15' }]}>
              <Text style={[styles.boardCardTagText, { color: accent }]}>{tag}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Notes count */}
      {noteCount > 0 && (
        <Text style={[styles.boardCardNotes, { color: colors.textTertiary }]}>
          {noteCount} Note{noteCount !== 1 ? 's' : ''}
        </Text>
      )}
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: 8,
  },
  subTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  subTabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Coming soon
  comingSoon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  comingSoonSub: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },

  // Filters
  filterSection: {
    marginBottom: Spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  filterScrollContent: {
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    gap: 6,
    maxWidth: 160,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },

  // Picker dropdown
  pickerDropdown: {
    marginHorizontal: Spacing.lg,
    marginTop: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pickerScroll: {
    maxHeight: 240,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  pickerEmpty: {
    padding: 14,
    fontSize: 13,
    textAlign: 'center',
  },

  // Constraints
  constraintsCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  constraintsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  constraintCol: {
    flex: 1,
    alignItems: 'center',
  },
  constraintLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  constraintValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  constraintDivider: {
    width: 1,
    height: 32,
    marginHorizontal: Spacing.md,
  },

  // Team header
  teamHeader: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  teamHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  teamName: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  teamMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  teamConf: {
    fontSize: 13,
    fontWeight: '500',
  },
  teamKRBadge: {
    alignItems: 'center',
  },
  teamKRLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  teamKRValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  teamSheetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
  },
  teamSheetChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Lens
  lensRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: 8,
  },
  lensPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
  },
  lensPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty states
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },

  // Player row
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerInfo: {
    flex: 1,
    marginRight: 12,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  playerPos: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  playerSub: {
    fontSize: 12,
  },
  playerScore: {
    width: 48,
    alignItems: 'flex-end',
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  scoreDash: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Portal-specific
  portalStatusRow: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  portalRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Quick action sheet
  actionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 100,
  },
  actionSheet: {
    marginHorizontal: Spacing.lg,
    marginBottom: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  actionSheetTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionItemText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  actionItemSub: {
    fontSize: 12,
  },

  // Board
  budgetBar: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  budgetRow: {
    flexDirection: 'row',
  },
  budgetCol: {
    flex: 1,
    gap: 4,
  },
  budgetColTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  budgetLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
  },
  budgetValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  budgetDivider: {
    width: 1,
    marginHorizontal: Spacing.md,
    alignSelf: 'stretch',
  },
  boardColumnsContainer: {
    paddingHorizontal: Spacing.lg,
    gap: 12,
    paddingBottom: 20,
  },
  boardColumn: {
    width: 220,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
  },
  boardColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  boardColumnDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  boardColumnTitle: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  boardColumnCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  boardColumnScroll: {
    maxHeight: 500,
    padding: 8,
  },
  boardEmpty: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 20,
  },
  boardCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: 10,
    marginBottom: 8,
  },
  boardCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  boardCardName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  boardCardPos: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 1,
  },
  boardCardSub: {
    fontSize: 11,
  },
  boardCardRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  boardCardKR: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 2,
  },
  boardCardFinancial: {
    alignItems: 'flex-end',
    gap: 1,
  },
  boardCardFinText: {
    fontSize: 10,
    fontWeight: '600',
  },
  boardCardTags: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  boardCardTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  boardCardTagText: {
    fontSize: 10,
    fontWeight: '600',
  },
  boardCardNotes: {
    fontSize: 10,
    marginTop: 4,
  },
});
