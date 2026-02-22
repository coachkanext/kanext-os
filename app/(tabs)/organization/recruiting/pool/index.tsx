/**
 * National Player Pool
 * Browse available players from various schools with filters and sortable table.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getNationalPlayers,
  getDivisionLabel,
  getRecruitingTargetForPlayer,
  getRecruitingStatusColor,
  type NationalPlayer,
  type Division,
} from '@/data/mock-sports';

// =============================================================================
// TYPES
// =============================================================================

type SortField = 'name' | 'ppg' | 'rpg' | 'apg' | 'height';
type SortDirection = 'asc' | 'desc';
type PositionFilter = 'ALL' | 'PG' | 'CG' | 'W' | 'F' | 'B';
type DivisionFilter = 'ALL' | Division;
type ClassFilter = 'ALL' | 'FR' | 'SO' | 'JR' | 'SR' | 'GR';

// =============================================================================
// COMPONENTS
// =============================================================================

interface BackButtonProps {
  onPress: () => void;
  colors: typeof Colors.light;
}

function BackButton({ onPress, colors }: BackButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <IconSymbol name="chevron.left" size={20} color={colors.tint} />
      <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

interface FilterChipProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function FilterChip({ label, isSelected, onPress, colors, accentColor }: FilterChipProps) {
  return (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: isSelected ? accentColor : colors.backgroundTertiary,
          borderColor: isSelected ? accentColor : colors.border,
        },
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.filterChipText,
          { color: isSelected ? '#FFFFFF' : colors.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface SortHeaderProps {
  label: string;
  field: SortField;
  currentSort: SortField;
  direction: SortDirection;
  onPress: () => void;
  colors: typeof Colors.light;
  width?: number;
  flex?: number;
}

function SortHeader({
  label,
  field,
  currentSort,
  direction,
  onPress,
  colors,
  width,
  flex,
}: SortHeaderProps) {
  const isActive = currentSort === field;
  return (
    <Pressable
      style={[styles.headerCell, width ? { width } : { flex }]}
      onPress={onPress}
    >
      <ThemedText
        style={[
          styles.headerText,
          { color: isActive ? colors.text : colors.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
      {isActive && (
        <IconSymbol
          name={direction === 'asc' ? 'chevron.up' : 'chevron.down'}
          size={10}
          color={colors.text}
        />
      )}
    </Pressable>
  );
}

interface PlayerRowProps {
  player: NationalPlayer;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  isOnBoard: boolean;
}

function PlayerRow({ player, onPress, colors, accentColor, isOnBoard }: PlayerRowProps) {
  const target = isOnBoard ? getRecruitingTargetForPlayer(player.id) : null;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.playerRow,
        { backgroundColor: pressed ? colors.backgroundTertiary : 'transparent' },
      ]}
      onPress={onPress}
    >
      {/* Name & Team */}
      <View style={styles.playerNameCell}>
        <View style={styles.playerNameRow}>
          <ThemedText style={styles.playerName} numberOfLines={1}>
            {player.name}
          </ThemedText>
          {isOnBoard && target && (
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getRecruitingStatusColor(target.status) },
              ]}
            />
          )}
        </View>
        <ThemedText style={[styles.playerTeam, { color: colors.textSecondary }]} numberOfLines={1}>
          {player.currentTeam}
        </ThemedText>
      </View>

      {/* Position */}
      <View style={styles.posCell}>
        <ThemedText style={[styles.cellText, { color: colors.text }]}>
          {player.position}
        </ThemedText>
      </View>

      {/* Class */}
      <View style={styles.classCell}>
        <ThemedText style={[styles.cellText, { color: colors.textSecondary }]}>
          {player.classYear}
        </ThemedText>
      </View>

      {/* Height */}
      <View style={styles.heightCell}>
        <ThemedText style={[styles.cellText, { color: colors.text }]}>
          {player.height}
        </ThemedText>
      </View>

      {/* PPG */}
      <View style={styles.statCell}>
        <ThemedText style={[styles.statText, { color: accentColor }]}>
          {player.stats.ppg.toFixed(1)}
        </ThemedText>
      </View>

      {/* RPG */}
      <View style={styles.statCell}>
        <ThemedText style={[styles.cellText, { color: colors.text }]}>
          {player.stats.rpg.toFixed(1)}
        </ThemedText>
      </View>

      {/* APG */}
      <View style={styles.statCell}>
        <ThemedText style={[styles.cellText, { color: colors.text }]}>
          {player.stats.apg.toFixed(1)}
        </ThemedText>
      </View>

      <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function NationalPlayerPoolScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const modeColors = ModeColors.sports;
  const allPlayers = getNationalPlayers();

  // Filters
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('ALL');
  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>('ALL');
  const [classFilter, setClassFilter] = useState<ClassFilter>('ALL');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('ppg');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const filteredAndSortedPlayers = useMemo(() => {
    let result = [...allPlayers];

    // Apply filters
    if (positionFilter !== 'ALL') {
      result = result.filter((p) => p.position === positionFilter);
    }
    if (divisionFilter !== 'ALL') {
      result = result.filter((p) => p.currentDivision === divisionFilter);
    }
    if (classFilter !== 'ALL') {
      result = result.filter((p) => p.classYear === classFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'ppg':
          comparison = a.stats.ppg - b.stats.ppg;
          break;
        case 'rpg':
          comparison = a.stats.rpg - b.stats.rpg;
          break;
        case 'apg':
          comparison = a.stats.apg - b.stats.apg;
          break;
        case 'height':
          // Parse height for comparison (e.g., "6'4"" -> 76 inches)
          const parseHeight = (h: string) => {
            const match = h.match(/(\d+)'(\d+)/);
            if (match) return parseInt(match[1]) * 12 + parseInt(match[2]);
            return 0;
          };
          comparison = parseHeight(a.height) - parseHeight(b.height);
          break;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [allPlayers, positionFilter, divisionFilter, classFilter, sortField, sortDirection]);

  const handlePlayerPress = (playerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/recruiting/pool/${playerId}`);
  };

  const positions: PositionFilter[] = ['ALL', 'PG', 'CG', 'W', 'F', 'B'];
  const divisions: DivisionFilter[] = ['ALL', 'NCAA_D2', 'NAA', 'NJCAA'];
  const classes: ClassFilter[] = ['ALL', 'FR', 'SO', 'JR', 'SR', 'GR'];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Player Pool
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {filteredAndSortedPlayers.length} players available
        </ThemedText>
      </View>

      {/* Filter Rail */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRail}
        contentContainerStyle={styles.filterRailContent}
      >
        {/* Position */}
        <View style={styles.filterGroup}>
          <ThemedText style={[styles.filterLabel, { color: colors.textTertiary }]}>
            Position
          </ThemedText>
          <View style={styles.filterChips}>
            {positions.map((pos) => (
              <FilterChip
                key={pos}
                label={pos}
                isSelected={positionFilter === pos}
                onPress={() => setPositionFilter(pos)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>
        </View>

        {/* Division */}
        <View style={styles.filterGroup}>
          <ThemedText style={[styles.filterLabel, { color: colors.textTertiary }]}>
            Division
          </ThemedText>
          <View style={styles.filterChips}>
            {divisions.map((div) => (
              <FilterChip
                key={div}
                label={div === 'ALL' ? 'All' : getDivisionLabel(div)}
                isSelected={divisionFilter === div}
                onPress={() => setDivisionFilter(div)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>
        </View>

        {/* Class */}
        <View style={styles.filterGroup}>
          <ThemedText style={[styles.filterLabel, { color: colors.textTertiary }]}>
            Class
          </ThemedText>
          <View style={styles.filterChips}>
            {classes.map((cls) => (
              <FilterChip
                key={cls}
                label={cls}
                isSelected={classFilter === cls}
                onPress={() => setClassFilter(cls)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Table */}
      <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Table Header */}
        <View style={[styles.tableHeader, { backgroundColor: colors.backgroundSecondary }]}>
          <SortHeader
            label="Player"
            field="name"
            currentSort={sortField}
            direction={sortDirection}
            onPress={() => handleSort('name')}
            colors={colors}
            flex={1}
          />
          <View style={styles.posCell}>
            <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
              POS
            </ThemedText>
          </View>
          <View style={styles.classCell}>
            <ThemedText style={[styles.headerText, { color: colors.textSecondary }]}>
              YR
            </ThemedText>
          </View>
          <SortHeader
            label="HT"
            field="height"
            currentSort={sortField}
            direction={sortDirection}
            onPress={() => handleSort('height')}
            colors={colors}
            width={48}
          />
          <SortHeader
            label="PPG"
            field="ppg"
            currentSort={sortField}
            direction={sortDirection}
            onPress={() => handleSort('ppg')}
            colors={colors}
            width={44}
          />
          <SortHeader
            label="RPG"
            field="rpg"
            currentSort={sortField}
            direction={sortDirection}
            onPress={() => handleSort('rpg')}
            colors={colors}
            width={44}
          />
          <SortHeader
            label="APG"
            field="apg"
            currentSort={sortField}
            direction={sortDirection}
            onPress={() => handleSort('apg')}
            colors={colors}
            width={44}
          />
          <View style={{ width: 16 }} />
        </View>

        {/* Table Body */}
        <ScrollView style={styles.tableBody} showsVerticalScrollIndicator={false}>
          {filteredAndSortedPlayers.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No players match filters
              </ThemedText>
            </View>
          ) : (
            filteredAndSortedPlayers.map((player, index) => (
              <React.Fragment key={player.id}>
                <PlayerRow
                  player={player}
                  onPress={() => handlePlayerPress(player.id)}
                  colors={colors}
                  accentColor={modeColors.primary}
                  isOnBoard={!!getRecruitingTargetForPlayer(player.id)}
                />
                {index < filteredAndSortedPlayers.length - 1 && (
                  <View style={[styles.rowSeparator, { backgroundColor: colors.divider }]} />
                )}
              </React.Fragment>
            ))
          )}
        </ScrollView>
      </View>
    </ThemedView>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  titleContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  filterRail: {
    maxHeight: 80,
  },
  filterRailContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.lg,
  },
  filterGroup: {
    marginRight: Spacing.md,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  filterChips: {
    flexDirection: 'row',
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tableContainer: {
    flex: 1,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  headerCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  headerText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  tableBody: {
    flex: 1,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  playerNameCell: {
    flex: 1,
    marginRight: Spacing.xs,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 6,
  },
  playerTeam: {
    fontSize: 11,
    marginTop: 1,
  },
  posCell: {
    width: 36,
    alignItems: 'center',
  },
  classCell: {
    width: 28,
    alignItems: 'center',
  },
  heightCell: {
    width: 48,
    alignItems: 'center',
  },
  statCell: {
    width: 44,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
  },
  statText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rowSeparator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.sm,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
