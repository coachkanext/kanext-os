/**
 * Recruiting Portal V2 — Transfer portal view with real national pool data
 * Pre-filtered to portal entries. Shows entry date, eligibility, full KR intelligence.
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
import { Colors, Spacing, ModeColors } from '@/constants/theme';
import { nationalPool, toGlobalPlayerCard, type NationalPlayer } from '@/data/national-pool';
import { openPlayerCard } from '@/utils/global-entity-sheets';
import {
  getKRColor,
  getArchetypeDisplay,
  LEVEL_DISPLAY_SHORT,
} from '@/utils/kr-display';

// =============================================================================
// FILTER DEFINITIONS
// =============================================================================

const POS_OPTIONS = ['All', 'PG', 'SG', 'SF', 'PF', 'C'] as const;

const LEVEL_OPTIONS = nationalPool.getLevels().map((k) => ({
  key: k,
  label: LEVEL_DISPLAY_SHORT[k] ?? k,
}));

type SortKey = 'kr' | 'ppg' | 'name';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'ppg', label: 'PPG' },
  { key: 'name', label: 'Name' },
];

const PAGE_SIZE = 50;

// =============================================================================
// COMPONENT
// =============================================================================

interface Props {
  colors: typeof Colors.light;
}

export function RecruitingPortalV2({ colors }: Props) {
  const accent = ModeColors.sports.primary;
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState('All');
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortKey>('kr');
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Portal-filtered data
  const filtered = useMemo(() => {
    return nationalPool.search({
      query: searchQuery || undefined,
      hasPortalEntry: true,
      position: posFilter !== 'All' ? posFilter : undefined,
      level: levelFilter.length > 0 ? levelFilter : undefined,
      sortBy,
      sortDir: sortBy === 'name' ? 'asc' : 'desc',
      limit: displayCount,
    });
  }, [searchQuery, posFilter, levelFilter, sortBy, displayCount]);

  const totalCount = useMemo(() => {
    return nationalPool.search({
      query: searchQuery || undefined,
      hasPortalEntry: true,
      position: posFilter !== 'All' ? posFilter : undefined,
      level: levelFilter.length > 0 ? levelFilter : undefined,
    }).length;
  }, [searchQuery, posFilter, levelFilter]);

  const toggleLevel = useCallback((key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLevelFilter((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    setDisplayCount(PAGE_SIZE);
  }, []);

  const loadMore = useCallback(() => {
    if (filtered.length >= displayCount) {
      setDisplayCount((c) => c + PAGE_SIZE);
    }
  }, [filtered.length, displayCount]);

  const handlePlayerTap = useCallback((player: NationalPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard(toGlobalPlayerCard(player));
  }, []);

  const renderRow = useCallback(({ item: player }: { item: NationalPlayer }) => {
    const krColor = getKRColor(player.kr);
    const hasKR = player.kr != null;
    const levelShort = LEVEL_DISPLAY_SHORT[player.levelKey] ?? player.levelKey;
    const archetypeName = getArchetypeDisplay(player.archetype);
    const entryDate = player.portalEntryDate
      ? player.portalEntryDate.slice(5) // MM-DD
      : '';

    return (
      <Pressable style={styles.row} onPress={() => handlePlayerTap(player)}>
        <View style={styles.rowInfo}>
          <View style={styles.topLine}>
            <ThemedText style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
              {player.fullName}
            </ThemedText>
            <View style={[styles.levelTag, { backgroundColor: '#ffffff08' }]}>
              <Text style={[styles.levelText, { color: colors.textSecondary }]}>{levelShort}</Text>
            </View>
          </View>
          <ThemedText style={[styles.school, { color: colors.textSecondary }]} numberOfLines={1}>
            {player.school} · {player.position}/{player.height} · {archetypeName}
          </ThemedText>
          {entryDate && (
            <View style={styles.portalMeta}>
              <ThemedText style={[styles.portalMetaText, { color: colors.textSecondary }]}>
                Portal entry: {entryDate}
              </ThemedText>
            </View>
          )}
        </View>

        {hasKR ? (
          <View style={[styles.krBadge, { backgroundColor: krColor + '22' }]}>
            <Text style={[styles.krTextScouted, { color: krColor }]}>{Math.round(player.kr!)}</Text>
          </View>
        ) : (
          <View style={[styles.krBadge, { backgroundColor: '#55555530' }]}>
            <Text style={styles.krTextUnscouted}>--</Text>
          </View>
        )}
      </Pressable>
    );
  }, [colors, handlePlayerTap]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search portal players..."
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
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
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
      <View style={styles.filterRow}>
        {POS_OPTIONS.map((pos) => {
          const isActive = posFilter === pos;
          return (
            <Pressable
              key={pos}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPosFilter(pos);
                setDisplayCount(PAGE_SIZE);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {pos}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

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
          {totalCount} in portal
        </ThemedText>
      </View>

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
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No portal entries found
            </ThemedText>
          </View>
        }
      />
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
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingBottom: 6, gap: 6 },
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
  levelTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelText: { fontSize: 9, fontWeight: '700' },
  school: { fontSize: 11 },
  portalMeta: { marginTop: 2 },
  portalMetaText: { fontSize: 10 },
  krBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  krTextUnscouted: { fontSize: 10, fontWeight: '600', color: '#777', fontStyle: 'italic' },
  krTextScouted: { fontSize: 13, fontWeight: '800' },
  emptyState: { paddingTop: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
