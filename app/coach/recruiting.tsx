/**
 * Coach Recruiting Screen — National Pool
 * Single "Filter" pill opens an iOS bottom sheet with accordion sections:
 * Division, Conference & Teams, Position, Sort By (clusters + sub-traits).
 * Uses draft-based filtering — changes commit only on "Apply Filters".
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
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
import { getPlayerRatings } from '@/data/playerRatings';
import { HELIO_TO_TRADITIONAL, TRADITIONAL_TO_HELIO, HELIO_POSITIONS, HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { SORT_CLUSTER_LABELS, CLUSTER_ORDER, TRAIT_LIBRARY } from '@/data/trait-library';
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
import { RecruitingPlayerSheet } from '@/components/recruiting/player-sheet';

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
  const [listMode, setListMode] = useState<'player' | 'team'>('player');
  const [divSheetOpen, setDivSheetOpen] = useState(false);
  const [divExpandedGroups, setDivExpandedGroups] = useState<Set<string>>(new Set());

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
      filters.sortCluster !== null
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

    // Sort by cluster KR or default Overall KR
    if (filters.sortCluster) {
      const cluster = filters.sortCluster;
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.id);
        const bR = getPlayerRatings(b.id);
        const aVal = aR ? aR.clusters[cluster] : -1;
        const bVal = bR ? bR.clusters[cluster] : -1;
        return bVal - aVal;
      });
    } else {
      // Default: sort by Overall KR descending
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.id);
        const bR = getPlayerRatings(b.id);
        const aVal = aR ? aR.overall : -1;
        const bVal = bR ? bR.overall : -1;
        return bVal - aVal;
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
    const teamMap = new Map<string, { name: string; conference: string; level: string; totalKR: number; count: number }>();
    const pool = filters.division.length > 0
      ? PLAYER_POOL.filter((p) => filters.division.some((d) => matchesDivision(p.level, d)))
      : PLAYER_POOL;
    pool.forEach((p) => {
      const ratings = getPlayerRatings(p.id);
      const kr = ratings ? ratings.overall : 0;
      if (!teamMap.has(p.currentSchool)) {
        teamMap.set(p.currentSchool, { name: p.currentSchool, conference: p.conference, level: p.level, totalKR: 0, count: 0 });
      }
      const t = teamMap.get(p.currentSchool)!;
      t.totalKR += kr;
      t.count += 1;
    });
    return [...teamMap.values()]
      .map((t) => ({ ...t, kr: t.count > 0 ? Math.round(t.totalKR / t.count) : 0 }))
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

        {/* Quick filter pills */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 16, marginBottom: 8, gap: 8 }}>
          <Pressable
            style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: WHITE, backgroundColor: filters.division.length === 0 ? WHITE : 'transparent' }}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDivSheetOpen(true);
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '700', color: filters.division.length === 0 ? BG : WHITE }}>
              {filters.division.length === 0 ? 'ALL' : filters.division.join(', ')}
            </Text>
          </Pressable>
        </View>

        {/* Meta row below hero */}
        <View style={styles.metaRow}>
          <Text style={styles.resultCountText}>
            {listMode === 'player' ? `${resultCount} players` : `${teamRankings.length} teams`}
          </Text>
          {hasActiveFilters && (
            <Pressable onPress={handleResetAll}>
              <Text style={styles.resetLink}>Reset all</Text>
            </Pressable>
          )}
          <View style={{ flex: 1 }} />
        </View>

        {/* Player / Team toggle */}
        <View style={styles.ratingCardList}>
          <View style={{ flexDirection: 'row', marginBottom: 12 }}>
            {(['player', 'team'] as const).map((mode) => {
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

          {listMode === 'player' ? (
            <>
              {filteredPlayers.map((player) => (
                <PlayerRatingCard
                  key={player.id}
                  player={player}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPeekPlayer(player);
                  }}
                />
              ))}
              {filteredPlayers.length === 0 && (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No players match your filters</Text>
                </View>
              )}
            </>
          ) : (
            <>
              {teamRankings.map((team, index) => (
                <View key={team.name}>
                  {index > 0 && <View style={{ height: 1, backgroundColor: DIVIDER }} />}
                  <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8 }}>
                    <Text style={{ width: 28, fontSize: 13, color: GRAY, fontWeight: '600' }}>{index + 1}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: WHITE }}>{team.name}</Text>
                      <Text style={{ fontSize: 12, color: GRAY, marginTop: 2 }}>{team.conference} · {team.level}</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: WHITE, marginRight: 8 }}>{team.kr}</Text>
                  </View>
                </View>
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
      <RecruitingPlayerSheet
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

      {/* ─── Filter Panel ─── */}
      <FilterSheet
        visible={filterPanelOpen}
        onClose={closePanel}
        title="Filters"
        footer={
          <>
            <Pressable style={styles.footerResetBtn} onPress={resetDraft}>
              <Text style={styles.footerResetText}>Reset Filters</Text>
            </Pressable>
            <Pressable style={styles.footerApplyBtn} onPress={applyFilters}>
              <Text style={styles.footerApplyText}>Apply Filters</Text>
            </Pressable>
          </>
        }
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
          </View>
        )}
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

// ─── Cluster abbreviations for rating boxes ───
const CLUSTER_ABBREVS: { key: string; abbrev: string; full: string }[] = [
  { key: 'shooting', abbrev: 'SHT', full: 'Shooting' },
  { key: 'finishing', abbrev: 'FIN', full: 'Finishing' },
  { key: 'playmaking', abbrev: 'PLY', full: 'Playmaking' },
  { key: 'perimeter_defense', abbrev: 'OBD', full: 'On-Ball Defense' },
  { key: 'interior_defense', abbrev: 'TMD', full: 'Team Defense' },
  { key: 'rebounding', abbrev: 'REB', full: 'Rebounding' },
  { key: 'frame', abbrev: 'PHY', full: 'Physical' },
];

// ─── EA-Style Player Rating Card ───
function PlayerRatingCard({
  player,
  onPress,
}: {
  player: PoolPlayer;
  onPress: () => void;
}) {
  const ratings = useMemo(() => getPlayerRatings(player.id), [player.id]);
  const [tooltip, setTooltip] = useState<string | null>(null);

  const showTooltip = useCallback((full: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTooltip(full);
    setTimeout(() => setTooltip(null), 1500);
  }, []);

  return (
    <Pressable style={styles.ratingCard} onPress={onPress}>
      {/* Top row: avatar, name, badges */}
      <View style={styles.ratingCardTop}>
        <View style={styles.ratingAvatar}>
          <IconSymbol name="person.fill" size={22} color={GRAY} />
        </View>
        <Text style={styles.ratingName} numberOfLines={1}>
          {player.firstName} {player.lastName}
        </Text>
        <View style={styles.ratingBadges}>
          <View style={styles.ratingLevelBadge}>
            <Text style={styles.ratingLevelText}>{player.level}</Text>
          </View>
          <View style={styles.ratingPosBadge}>
            <Text style={styles.ratingPosText}>{TRADITIONAL_TO_HELIO[player.position] ?? player.position}</Text>
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
            {ratings ? ratings.overall : '—'}
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
                <Text style={styles.ratingBoxSplitValue}>{oKR ?? '—'}</Text>
              </Pressable>
              <View style={styles.ratingBoxSplitDivider} />
              <Pressable
                style={styles.ratingBoxSplitHalf}
                onLongPress={() => showTooltip('Defensive KR')}
                onPress={() => {}}
              >
                <Text style={styles.ratingBoxLabel}>D</Text>
                <Text style={styles.ratingBoxSplitValue}>{dKR ?? '—'}</Text>
              </Pressable>
            </View>
          );
        })()}
        {/* 7 cluster boxes */}
        {CLUSTER_ABBREVS.map((c) => {
          const val = ratings ? ratings.clusters[c.key as ClusterType] : null;
          return (
            <Pressable
              key={c.key}
              style={styles.ratingBox}
              onLongPress={() => showTooltip(c.full)}
              onPress={() => {}}
            >
              <Text style={styles.ratingBoxLabel}>{c.abbrev}</Text>
              <Text style={styles.ratingBoxValue}>{val ?? '—'}</Text>
            </Pressable>
          );
        })}
      </View>
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
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: WHITE,
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

  // Footer buttons
  footerResetBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1.5, borderColor: '#4A4D55', alignItems: 'center' as const },
  footerResetText: { fontSize: 14, fontWeight: '600' as const, color: GRAY },
  footerApplyBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: WHITE, alignItems: 'center' as const },
  footerApplyText: { fontSize: 14, fontWeight: '600' as const, color: BG },

  emptyState: { padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 14, color: GRAY },
});
