/**
 * Recruiting Database V2 — Real national player pool with full KR intelligence
 * Shows name, school, position/height, KR badge (color coded), archetype tag,
 * level tag, top badge indicator. Filters work against real data.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, ModeColors } from '@/constants/theme';
import { nationalPool, toGlobalPlayerCard, type NationalPlayer } from '@/data/national-pool';
import { openPlayerCard } from '@/utils/global-entity-sheets';
import {
  getKRColor,
  getKRTierLabel,
  getArchetypeDisplay,
  LEVEL_DISPLAY_SHORT,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';
import type { ClusterType } from '@/types';

// =============================================================================
// FILTER DEFINITIONS
// =============================================================================

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
  { key: 'nccaa_d1', label: 'NCCAA D1' },
  { key: 'nccaa_d2', label: 'NCCAA D2' },
];

// NCAA D1 is stored as 3 sub-levels — expand for search
const LEVEL_EXPAND: Record<string, string[]> = {
  ncaa_d1: ['ncaa_d1_high_major', 'ncaa_d1_mid_major', 'ncaa_d1_low_major'],
};
function expandLevels(keys: string[]): string[] {
  return keys.flatMap((k) => LEVEL_EXPAND[k] ?? [k]);
}

const POS_OPTIONS = ['PG', 'CG', 'W', 'F', 'B'] as const;

type SortKey = 'kr' | 'ppg' | 'rpg' | 'name' | 'height';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'ppg', label: 'PPG' },
  { key: 'rpg', label: 'RPG' },
  { key: 'name', label: 'Name' },
  { key: 'height', label: 'Height' },
];

const PAGE_SIZE = 50;

type ViewMode = 'list' | 'table';
type TableSortKey = 'name' | 'school' | 'pos' | 'kr' | 'gp' | 'ppg' | 'rpg' | 'apg' | 'spg' | 'bpg' | 'topg' | 'mpg' | 'fgPct' | 'threePct' | 'ftPct';

const TABLE_COLS: { key: TableSortKey; label: string; width: number }[] = [
  { key: 'name', label: 'Player', width: 140 },
  { key: 'school', label: 'School', width: 110 },
  { key: 'pos', label: 'Pos', width: 36 },
  { key: 'kr', label: 'KR', width: 42 },
  { key: 'gp', label: 'GP', width: 36 },
  { key: 'ppg', label: 'PPG', width: 46 },
  { key: 'rpg', label: 'RPG', width: 46 },
  { key: 'apg', label: 'APG', width: 46 },
  { key: 'spg', label: 'SPG', width: 46 },
  { key: 'bpg', label: 'BPG', width: 46 },
  { key: 'topg', label: 'TO', width: 42 },
  { key: 'mpg', label: 'MPG', width: 46 },
  { key: 'fgPct', label: 'FG%', width: 48 },
  { key: 'threePct', label: '3P%', width: 48 },
  { key: 'ftPct', label: 'FT%', width: 48 },
];

// =============================================================================
// COMPONENT
// =============================================================================

interface Props {
  colors: typeof Colors.light;
}

export function RecruitingDatabaseV2({ colors }: Props) {
  const accent = ModeColors.sports.primary;

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [posFilter, setPosFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('kr');
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minKR, setMinKR] = useState<number | undefined>();
  const [archetypeFilter, setArchetypeFilter] = useState('');
  const [conferenceFilter, setConferenceFilter] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [tableSortKey, setTableSortKey] = useState<TableSortKey>('ppg');
  const [tableSortAsc, setTableSortAsc] = useState(false);

  // Data query
  const filtered = useMemo(() => {
    return nationalPool.search({
      query: searchQuery || undefined,
      level: levelFilter.length > 0 ? expandLevels(levelFilter) : undefined,
      position: posFilter.length > 0 ? posFilter : undefined,
      minKR,
      conference: conferenceFilter || undefined,
      archetype: archetypeFilter || undefined,
      sortBy,
      sortDir: sortBy === 'name' ? 'asc' : 'desc',
      limit: displayCount,
    });
  }, [searchQuery, levelFilter, posFilter, minKR, conferenceFilter, archetypeFilter, sortBy, displayCount]);

  const totalCount = useMemo(() => {
    return nationalPool.search({
      query: searchQuery || undefined,
      level: levelFilter.length > 0 ? expandLevels(levelFilter) : undefined,
      position: posFilter.length > 0 ? posFilter : undefined,
      minKR,
      conference: conferenceFilter || undefined,
      archetype: archetypeFilter || undefined,
    }).length;
  }, [searchQuery, levelFilter, posFilter, minKR, conferenceFilter, archetypeFilter]);

  // Toggle level filter
  const toggleLevel = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLevelFilter((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setDisplayCount(PAGE_SIZE);
  }, []);

  // Toggle position filter
  const togglePos = useCallback((pos: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPosFilter((prev) =>
      prev.includes(pos) ? prev.filter((p) => p !== pos) : [...prev, pos]
    );
    setDisplayCount(PAGE_SIZE);
  }, []);

  // Load more
  const loadMore = useCallback(() => {
    if (filtered.length >= displayCount) {
      setDisplayCount((c) => c + PAGE_SIZE);
    }
  }, [filtered.length, displayCount]);

  // Get top badge for a player
  const getTopBadge = useCallback((p: NationalPlayer): PlayerBadge | null => {
    if (!p.clusters) return null;
    const clusters = p.clusters as Record<ClusterType, number>;
    const badges = computePlayerBadges(
      clusters as any,
      (clusterKey: string) => {
        const score = clusters[clusterKey as ClusterType] ?? 50;
        return [{ name: clusterKey, rating: score }];
      },
    );
    // Return highest badge (Gold > Silver > Bronze)
    return badges.find((b) => b.level === 'Gold')
      ?? badges.find((b) => b.level === 'Silver')
      ?? null;
  }, []);

  // Active filter count
  const activeFilterCount =
    levelFilter.length + posFilter.length +
    (minKR != null ? 1 : 0) +
    (archetypeFilter ? 1 : 0) +
    (conferenceFilter ? 1 : 0);

  // Open player card sheet
  const handlePlayerTap = useCallback((player: NationalPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard(toGlobalPlayerCard(player));
  }, []);

  // Table sort
  const handleTableSort = useCallback((key: TableSortKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (tableSortKey === key) setTableSortAsc((a) => !a);
    else { setTableSortKey(key); setTableSortAsc(false); }
  }, [tableSortKey]);

  const tableSorted = useMemo(() => {
    if (viewMode !== 'table') return filtered;
    const list = [...filtered];
    const mult = tableSortAsc ? 1 : -1;
    list.sort((a, b) => {
      if (tableSortKey === 'name') return mult * a.fullName.localeCompare(b.fullName);
      if (tableSortKey === 'school') return mult * a.school.localeCompare(b.school);
      if (tableSortKey === 'pos') return mult * (a.position ?? '').localeCompare(b.position ?? '');
      const av = (a[tableSortKey as keyof NationalPlayer] as number) ?? 0;
      const bv = (b[tableSortKey as keyof NationalPlayer] as number) ?? 0;
      return mult * (av - bv);
    });
    return list;
  }, [filtered, viewMode, tableSortKey, tableSortAsc]);

  const getCellValue = useCallback((player: NationalPlayer, key: TableSortKey): string => {
    switch (key) {
      case 'name': return player.fullName;
      case 'school': return player.school;
      case 'pos': return player.position ?? '—';
      case 'kr': return player.kr != null ? Math.round(player.kr).toString() : '—';
      default: {
        const v = player[key as keyof NationalPlayer] as number | null;
        return v != null ? v.toFixed(1) : '—';
      }
    }
  }, []);

  const renderRow = useCallback(({ item: player }: { item: NationalPlayer }) => {
    const krColor = getKRColor(player.kr);
    const hasKR = player.kr != null;
    const levelShort = LEVEL_DISPLAY_SHORT[player.levelKey] ?? player.levelKey;
    const archetypeName = getArchetypeDisplay(player.archetype);
    const topBadge = getTopBadge(player);

    return (
      <Pressable style={styles.row} onPress={() => handlePlayerTap(player)}>
        <View style={styles.rowInfo}>
          <View style={styles.topLine}>
            <ThemedText style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
              {player.fullName}
            </ThemedText>
            {topBadge && (
              <View style={[styles.badgeDot, { backgroundColor: topBadge.level === 'Gold' ? '#FFD700' : '#A8A9AD' }]} />
            )}
          </View>
          <ThemedText style={[styles.school, { color: colors.textSecondary }]} numberOfLines={1}>
            {[
              player.school,
              [player.position, player.height].filter(Boolean).join(' · '),
              player.classYear,
            ].filter(Boolean).join(' · ')}
          </ThemedText>
        </View>

        <View style={styles.rowRight}>
          <View style={styles.tagsRow}>
            <View style={[styles.levelTag, { backgroundColor: '#ffffff08' }]}>
              <Text style={[styles.levelText, { color: colors.textSecondary }]}>{levelShort}</Text>
            </View>
            <View style={[styles.archetypeTag, { backgroundColor: '#ffffff08' }]}>
              <Text style={[styles.archetypeText, { color: colors.textSecondary }]}>{archetypeName}</Text>
            </View>
          </View>
          {hasKR ? (
            <View style={[styles.krBadge, { backgroundColor: krColor + '22' }]}>
              <Text style={[styles.krTextScouted, { color: krColor }]}>{Math.round(player.kr!)}</Text>
            </View>
          ) : (
            <View style={[styles.krBadge, { backgroundColor: '#55555530' }]}>
              <Text style={styles.krTextUnscouted}>Unrated</Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  }, [colors, handlePlayerTap, getTopBadge]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search players, schools, conferences..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={(t) => { setSearchQuery(t); setDisplayCount(PAGE_SIZE); }}
          returnKeyType="done"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => { setSearchQuery(''); setDisplayCount(PAGE_SIZE); }}>
            <IconSymbol name="xmark.circle.fill" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Level filter pills */}
      <View style={styles.pillRow}>
        {LEVEL_OPTIONS.map(({ key, label }) => {
          const isActive = levelFilter.includes(key);
          return (
            <Pressable
              key={key}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => toggleLevel(key)}
            >
              <Text style={[styles.filterPillText, { color: isActive ? '#000' : colors.text }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Position filter pills */}
      <View style={styles.pillRow}>
        {POS_OPTIONS.map((pos) => {
          const isActive = posFilter.includes(pos);
          return (
            <Pressable
              key={pos}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => togglePos(pos)}
            >
              <Text style={[styles.filterPillText, { color: isActive ? '#000' : colors.text }]}>
                {pos}
              </Text>
            </Pressable>
          );
        })}
        {/* Advanced filters button */}
        <Pressable
          style={[styles.filterPill, { borderColor: activeFilterCount > 0 ? accent : 'rgba(255,255,255,0.20)' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdvanced(true); }}
        >
          <Text style={[styles.filterPillText, { color: activeFilterCount > 0 ? accent : colors.text }]}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* Sort & count */}
      <View style={styles.sortRow}>
        <View style={styles.sortLeft}>
          <View style={styles.viewToggle}>
            {(['list', 'table'] as ViewMode[]).map((m) => {
              const active = viewMode === m;
              return (
                <Pressable
                  key={m}
                  style={[styles.viewTogglePill, active && { backgroundColor: accent }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setViewMode(m); }}
                >
                  <Text style={[styles.viewToggleText, { color: active ? '#000' : colors.textSecondary }]}>
                    {m === 'list' ? 'List' : 'Table'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {viewMode === 'list' && (
            <View style={styles.sortPills}>
              {SORT_OPTIONS.map((opt) => {
                const isActive = sortBy === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortBy(opt.key); }}
                  >
                    <ThemedText style={[styles.sortText, { color: isActive ? accent : colors.textSecondary }]}>
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
        <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
          {totalCount.toLocaleString()} players
        </ThemedText>
      </View>

      {/* Results */}
      {viewMode === 'table' ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              {/* Header */}
              <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border }]}>
                {TABLE_COLS.map((col) => {
                  const active = tableSortKey === col.key;
                  return (
                    <Pressable key={col.key} onPress={() => handleTableSort(col.key)} style={{ width: col.width, paddingVertical: 8, paddingHorizontal: 4 }}>
                      <Text style={[styles.tHeader, { color: active ? accent : colors.textSecondary }]} numberOfLines={1}>
                        {col.label}{active ? (tableSortAsc ? ' ↑' : ' ↓') : ''}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {/* Rows */}
              {tableSorted.map((player, idx) => (
                <Pressable
                  key={`${player.id}-${idx}`}
                  style={[styles.tableDataRow, idx % 2 === 1 && styles.tableRowAlt, { borderBottomColor: colors.border }]}
                  onPress={() => handlePlayerTap(player)}
                >
                  {TABLE_COLS.map((col) => {
                    const val = getCellValue(player, col.key);
                    const isKR = col.key === 'kr';
                    const isName = col.key === 'name';
                    return (
                      <View key={col.key} style={{ width: col.width, paddingVertical: 10, paddingHorizontal: 4 }}>
                        <Text
                          style={[
                            styles.tCell,
                            { color: isKR && player.kr != null ? getKRColor(player.kr) : colors.text },
                            isName && { fontWeight: '600' },
                            isKR && player.kr == null && { color: '#777', fontStyle: 'italic' as const },
                          ]}
                          numberOfLines={1}
                        >
                          {val}
                        </Text>
                      </View>
                    );
                  })}
                </Pressable>
              ))}
            </View>
          </ScrollView>
          {filtered.length >= displayCount && (
            <Pressable style={styles.loadMoreBtn} onPress={loadMore}>
              <Text style={[styles.loadMoreText, { color: accent }]}>Load More</Text>
            </Pressable>
          )}
        </ScrollView>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p, i) => `${p.id}-${i}`}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          initialNumToRender={20}
          maxToRenderPerBatch={20}
          windowSize={10}
        />
      )}

      {/* Advanced Filters Sheet */}
      <BottomSheet
        visible={showAdvanced}
        onClose={() => setShowAdvanced(false)}
        title="Filters"
        useModal
      >
        <View style={styles.advancedContent}>
          {/* Min KR */}
          <View style={styles.advRow}>
            <ThemedText style={[styles.advLabel, { color: colors.text }]}>Min KR</ThemedText>
            <View style={styles.advInputRow}>
              {[undefined, 60, 65, 70, 75, 80].map((val) => {
                const isActive = minKR === val;
                return (
                  <Pressable
                    key={val ?? 'any'}
                    style={[styles.advPill, isActive && { backgroundColor: accent, borderColor: accent }]}
                    onPress={() => { setMinKR(val); setDisplayCount(PAGE_SIZE); }}
                  >
                    <Text style={[styles.advPillText, { color: isActive ? '#000' : colors.text }]}>
                      {val ?? 'Any'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Conference */}
          <View style={styles.advRow}>
            <ThemedText style={[styles.advLabel, { color: colors.text }]}>Conference</ThemedText>
            <TextInput
              style={[styles.advTextInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="Type conference name..."
              placeholderTextColor={colors.textSecondary}
              value={conferenceFilter}
              onChangeText={(t) => { setConferenceFilter(t); setDisplayCount(PAGE_SIZE); }}
              returnKeyType="done"
            />
          </View>

          {/* Archetype */}
          <View style={styles.advRow}>
            <ThemedText style={[styles.advLabel, { color: colors.text }]}>Archetype</ThemedText>
            <TextInput
              style={[styles.advTextInput, { color: colors.text, borderColor: colors.border }]}
              placeholder="e.g. floor_general, two_way_wing..."
              placeholderTextColor={colors.textSecondary}
              value={archetypeFilter}
              onChangeText={(t) => { setArchetypeFilter(t); setDisplayCount(PAGE_SIZE); }}
              returnKeyType="done"
            />
          </View>

          {/* Clear all */}
          <Pressable
            style={[styles.clearBtn, { borderColor: accent }]}
            onPress={() => {
              setLevelFilter([]);
              setPosFilter([]);
              setMinKR(undefined);
              setConferenceFilter('');
              setArchetypeFilter('');
              setDisplayCount(PAGE_SIZE);
              setShowAdvanced(false);
            }}
          >
            <ThemedText style={[styles.clearBtnText, { color: accent }]}>Clear All Filters</ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg,
    marginVertical: 8, borderRadius: 10, height: 38, paddingHorizontal: 12,
    gap: 8, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  pillRow: { flexDirection: 'row' as const, flexWrap: 'wrap' as const, paddingHorizontal: Spacing.lg, paddingBottom: 6, gap: 6 },
  filterPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.20)',
  },
  filterPillText: { fontSize: 13, fontWeight: '600' },
  sortRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingBottom: 4, paddingTop: 2,
  },
  sortPills: { flexDirection: 'row', gap: 12 },
  sortText: { fontSize: 11, fontWeight: '600' },
  countText: { fontSize: 11 },
  listContent: { paddingBottom: 120, paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 10,
  },
  rowInfo: { flex: 1, gap: 3 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: { fontSize: 14, fontWeight: '600', flex: 1 },
  badgeDot: { width: 8, height: 8, borderRadius: 4 },
  school: { fontSize: 11 },
  rowRight: { alignItems: 'flex-end', gap: 4 },
  tagsRow: { flexDirection: 'row', gap: 4 },
  levelTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelText: { fontSize: 9, fontWeight: '700' },
  archetypeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  archetypeText: { fontSize: 9, fontWeight: '600' },
  krBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, minWidth: 46, alignItems: 'center' },
  krTextUnscouted: { fontSize: 10, fontWeight: '600', color: '#777', fontStyle: 'italic' },
  krTextScouted: { fontSize: 13, fontWeight: '800' },
  // Advanced filters
  advancedContent: { paddingHorizontal: Spacing.lg, paddingBottom: 24, gap: 16 },
  advRow: { gap: 8 },
  advLabel: { fontSize: 13, fontWeight: '600' },
  advInputRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  advPill: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  advPillText: { fontSize: 12, fontWeight: '600' },
  advTextInput: {
    height: 38, borderRadius: 10, paddingHorizontal: 12,
    fontSize: 14, borderWidth: 1,
  },
  clearBtn: {
    paddingVertical: 14, borderRadius: 12, alignItems: 'center',
    borderWidth: 1, marginTop: 8,
  },
  clearBtnText: { fontSize: 15, fontWeight: '700' },
  // View toggle
  viewToggle: { flexDirection: 'row', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  viewTogglePill: { paddingHorizontal: 10, paddingVertical: 4 },
  viewToggleText: { fontSize: 11, fontWeight: '700' },
  sortLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  // Table
  tableHeaderRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingHorizontal: 8 },
  tHeader: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  tableDataRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, paddingHorizontal: 8 },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.03)' },
  tCell: { fontSize: 12 },
  loadMoreBtn: { paddingVertical: 16, alignItems: 'center' },
  loadMoreText: { fontSize: 13, fontWeight: '700' },
});
