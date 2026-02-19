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

const LEVEL_OPTIONS = nationalPool.getLevels().map((k) => ({
  key: k,
  label: LEVEL_DISPLAY_SHORT[k] ?? k,
}));

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

  // Data query
  const filtered = useMemo(() => {
    return nationalPool.search({
      query: searchQuery || undefined,
      level: levelFilter.length > 0 ? levelFilter : undefined,
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
      level: levelFilter.length > 0 ? levelFilter : undefined,
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
            {player.school} · {player.position}/{player.height} · {player.classYear}
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
        {LEVEL_OPTIONS.map(({ key, label }) => {
          const isActive = levelFilter.includes(key);
          return (
            <Pressable
              key={key}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => toggleLevel(key)}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Position filter pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
        {POS_OPTIONS.map((pos) => {
          const isActive = posFilter.includes(pos);
          return (
            <Pressable
              key={pos}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => togglePos(pos)}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {pos}
              </ThemedText>
            </Pressable>
          );
        })}
        {/* Advanced filters button */}
        <Pressable
          style={[styles.filterPill, { borderColor: activeFilterCount > 0 ? accent : 'rgba(255,255,255,0.08)' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAdvanced(true); }}
        >
          <ThemedText style={[styles.filterPillText, { color: activeFilterCount > 0 ? accent : colors.textSecondary }]}>
            Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </ThemedText>
        </Pressable>
      </ScrollView>

      {/* Sort & count */}
      <View style={styles.sortRow}>
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
        <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>
          {totalCount.toLocaleString()} players
        </ThemedText>
      </View>

      {/* Results */}
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        initialNumToRender={20}
        maxToRenderPerBatch={20}
        windowSize={10}
      />

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
                    <Text style={[styles.advPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
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
  pillRow: { paddingHorizontal: Spacing.lg, paddingBottom: 6, gap: 6 },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
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
});
