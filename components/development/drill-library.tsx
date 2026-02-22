/**
 * DrillLibrary — Searchable/filterable drill list.
 * Search bar at top, cluster filter chips, expandable drill cards
 * with coaching cues revealed on tap.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DRILL_LIBRARY, type DrillDifficulty } from '@/data/mock-development-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const CLUSTER_FILTERS = [
  'All',
  'Shooting',
  'Finishing',
  'Playmaking',
  'On-Ball Defense',
  'Team Defense',
  'Rebounding',
  'Physical',
];

const DIFFICULTY_COLORS: Record<DrillDifficulty, string> = {
  beginner: Brand.success,
  intermediate: Brand.warning,
  advanced: Brand.error,
};

const CLUSTER_BADGE_COLORS: Record<string, string> = {
  Shooting: Brand.precision,
  Finishing: Brand.warning,
  Playmaking: accent,
  'On-Ball Defense': Brand.error,
  'Team Defense': '#EF4444',
  Rebounding: '#F59E0B',
  Physical: '#A1A1AA',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function DrillLibrary() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [expandedDrill, setExpandedDrill] = useState<string | null>(null);

  const filteredDrills = useMemo(() => {
    return DRILL_LIBRARY.filter((drill) => {
      const matchesSearch =
        searchQuery.length === 0 ||
        drill.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCluster =
        selectedCluster === 'All' || drill.cluster === selectedCluster;
      return matchesSearch && matchesCluster;
    });
  }, [searchQuery, selectedCluster]);

  const handleChipPress = (cluster: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedCluster(cluster);
  };

  const handleDrillPress = (drillId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedDrill(expandedDrill === drillId ? null : drillId);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search drills..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark" size={14} color={colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* Cluster Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipRowContent}
        style={styles.chipRow}
      >
        {CLUSTER_FILTERS.map((cluster) => {
          const isActive = cluster === selectedCluster;
          return (
            <Pressable
              key={cluster}
              style={[
                styles.chip,
                { backgroundColor: colors.card, borderColor: colors.border },
                isActive && styles.chipActive,
              ]}
              onPress={() => handleChipPress(cluster)}
            >
              <ThemedText style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cluster}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Results Count */}
      <ThemedText style={[styles.resultsCount, { color: colors.textTertiary }]}>
        {filteredDrills.length} drill{filteredDrills.length !== 1 ? 's' : ''}
      </ThemedText>

      {/* Drill Cards */}
      {filteredDrills.map((drill) => {
        const isExpanded = expandedDrill === drill.id;
        const clusterColor = CLUSTER_BADGE_COLORS[drill.cluster] ?? Brand.precision;
        const diffColor = DIFFICULTY_COLORS[drill.difficulty];

        return (
          <Pressable
            key={drill.id}
            style={[styles.drillCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleDrillPress(drill.id)}
          >
            {/* Top Row */}
            <View style={styles.drillHeader}>
              <ThemedText style={[styles.drillName, { color: colors.text }]} numberOfLines={1}>
                {drill.name}
              </ThemedText>
              <IconSymbol
                name={isExpanded ? 'chevron.up' : 'chevron.down'}
                size={14}
                color={colors.textTertiary}
              />
            </View>

            {/* Badges Row */}
            <View style={styles.badgesRow}>
              <View style={[styles.clusterBadge, { backgroundColor: clusterColor + '20' }]}>
                <ThemedText style={[styles.clusterBadgeText, { color: clusterColor }]}>
                  {drill.cluster}
                </ThemedText>
              </View>
              <View style={[styles.traitBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.traitBadgeText, { color: colors.textSecondary }]}>
                  {drill.trait}
                </ThemedText>
              </View>
              <View style={[styles.diffBadge, { backgroundColor: diffColor + '20' }]}>
                <ThemedText style={[styles.diffBadgeText, { color: diffColor }]}>
                  {drill.difficulty}
                </ThemedText>
              </View>
            </View>

            {/* Meta Row */}
            <View style={styles.metaRow}>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                {drill.repPrescription}
              </ThemedText>
              <ThemedText style={[styles.metaDot, { color: colors.textTertiary }]}>{'\u00B7'}</ThemedText>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                {drill.duration}
              </ThemedText>
            </View>

            {/* Expanded: Coaching Cues */}
            {isExpanded && (
              <View style={[styles.cuesContainer, { borderTopColor: colors.border }]}>
                <ThemedText style={[styles.cuesLabel, { color: colors.textTertiary }]}>
                  COACHING CUES
                </ThemedText>
                {drill.coachingCues.map((cue, i) => (
                  <View key={i} style={styles.cueRow}>
                    <View style={[styles.cueBullet, { backgroundColor: clusterColor }]} />
                    <ThemedText style={[styles.cueText, { color: colors.textSecondary }]}>
                      {cue}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Pressable>
        );
      })}

      {filteredDrills.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No drills match your search
          </ThemedText>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },

  // Chips
  chipRow: {
    marginBottom: Spacing.sm,
  },
  chipRowContent: {
    gap: 6,
    paddingRight: Spacing.md,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  chipTextActive: {
    color: '#000000',
  },

  // Results count
  resultsCount: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  // Drill card
  drillCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  drillName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 8,
  },
  clusterBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  clusterBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  traitBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  traitBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  diffBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  diffBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  metaDot: {
    fontSize: 12,
  },

  // Coaching cues
  cuesContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cuesLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  cueRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  cueBullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 5,
  },
  cueText: {
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },

  // Empty
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
