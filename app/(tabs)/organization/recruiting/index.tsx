/**
 * Recruiting Board
 * Read-only view of tracked prospects with status badges and priority grouping.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  getRecruitingTargets,
  getDivisionLabel,
  getRecruitingStatusLabel,
  getRecruitingStatusColor,
  INSTITUTION,
  type RecruitingTarget,
  type RecruitingStatus,
  type RecruitingPriority,
} from '@/data/mock-sports';

// =============================================================================
// TYPES
// =============================================================================

type GroupBy = 'status' | 'priority';

interface SectionData {
  title: string;
  data: RecruitingTarget[];
  color?: string;
}

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
      <IconSymbol name="chevron.left" size={20} color={accent} />
      <ThemedText style={[styles.backButtonText, { color: accent }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

interface SegmentControlProps {
  options: { value: GroupBy; label: string }[];
  selected: GroupBy;
  onSelect: (value: GroupBy) => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function SegmentControl({ options, selected, onSelect, colors, accentColor }: SegmentControlProps) {
  return (
    <View style={[styles.segmentControl, { backgroundColor: colors.backgroundTertiary }]}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.segmentButton,
            selected === option.value && { backgroundColor: accentColor },
          ]}
          onPress={() => onSelect(option.value)}
        >
          <ThemedText
            style={[
              styles.segmentButtonText,
              { color: selected === option.value ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {option.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

interface ProspectCardProps {
  target: RecruitingTarget;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function ProspectCard({ target, onPress, colors, accentColor }: ProspectCardProps) {
  const { player } = target;
  const statusColor = getRecruitingStatusColor(target.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.prospectCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {/* Header Row */}
      <View style={styles.prospectHeader}>
        <View style={styles.prospectInfo}>
          <View style={styles.prospectNameRow}>
            <ThemedText style={styles.prospectName}>{player.name}</ThemedText>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <ThemedText style={[styles.prospectMeta, { color: colors.textSecondary }]}>
            {player.position} • {player.height} • {player.classYear}
          </ThemedText>
        </View>
        {target.fitPercent && (
          <View style={[styles.fitBadge, { backgroundColor: Colors.light.success + '20' }]}>
            <ThemedText style={[styles.fitBadgeText, { color: Colors.light.success }]}>
              {target.fitPercent}%
            </ThemedText>
          </View>
        )}
      </View>

      {/* Team & Division */}
      <View style={styles.teamRow}>
        <IconSymbol name="building.2" size={12} color={colors.textTertiary} />
        <ThemedText style={[styles.teamText, { color: colors.textTertiary }]}>
          {player.currentTeam} • {getDivisionLabel(player.currentDivision)}
        </ThemedText>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: accentColor }]}>
            {player.stats.ppg.toFixed(1)}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>PPG</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{player.stats.rpg.toFixed(1)}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>RPG</ThemedText>
        </View>
        <View style={styles.statItem}>
          <ThemedText style={styles.statValue}>{player.stats.apg.toFixed(1)}</ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>APG</ThemedText>
        </View>
        {target.plannedScholarship !== undefined && (
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{target.plannedScholarship}%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>Schol</ThemedText>
          </View>
        )}
      </View>

      {/* Next Step (if exists) */}
      {target.nextStep && (
        <View style={[styles.nextStepRow, { borderTopColor: colors.divider }]}>
          <IconSymbol name="arrow.right.circle" size={12} color={accent} />
          <ThemedText style={[styles.nextStepText, { color: colors.text }]} numberOfLines={1}>
            {target.nextStep}
          </ThemedText>
          {target.nextStepDate && (
            <ThemedText style={[styles.nextStepDate, { color: colors.textTertiary }]}>
              {target.nextStepDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </ThemedText>
          )}
        </View>
      )}

      <IconSymbol
        name="chevron.right"
        size={14}
        color={colors.textTertiary}
        style={styles.chevron}
      />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function RecruitingBoardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const modeColors = ModeColors.sports;
  const allTargets = getRecruitingTargets();

  const [groupBy, setGroupBy] = useState<GroupBy>('status');

  const handleProspectPress = (playerId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/recruiting/pool/${playerId}`);
  };

  const handleViewPool = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/organization/recruiting/pool');
  };

  // Group targets by status or priority
  const getSections = (): SectionData[] => {
    if (groupBy === 'status') {
      const statusOrder: RecruitingStatus[] = ['offered', 'priority', 'contacted', 'watching', 'committed', 'archived'];
      return statusOrder
        .map((status) => ({
          title: getRecruitingStatusLabel(status),
          data: allTargets.filter((t) => t.status === status),
          color: getRecruitingStatusColor(status),
        }))
        .filter((section) => section.data.length > 0);
    } else {
      const priorityOrder: RecruitingPriority[] = ['A', 'B', 'C'];
      return priorityOrder
        .map((priority) => ({
          title: `Priority ${priority}`,
          data: allTargets.filter((t) => t.priority === priority),
        }))
        .filter((section) => section.data.length > 0);
    }
  };

  const sections = getSections();

  // Summary stats
  const offeredCount = allTargets.filter((t) => t.status === 'offered').length;
  const priorityACount = allTargets.filter((t) => t.priority === 'A').length;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Recruiting Board
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {INSTITUTION.nickname} Basketball • {allTargets.length} prospects
        </ThemedText>
      </View>

      {/* Summary Strip */}
      <View style={[styles.summaryStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryItem}>
          <ThemedText style={[styles.summaryValue, { color: modeColors.primary }]}>
            {allTargets.length}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>
            Total
          </ThemedText>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.summaryItem}>
          <ThemedText style={[styles.summaryValue, { color: getRecruitingStatusColor('offered') }]}>
            {offeredCount}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>
            Offered
          </ThemedText>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.summaryItem}>
          <ThemedText style={[styles.summaryValue, { color: '#9C9790' }]}>
            {priorityACount}
          </ThemedText>
          <ThemedText style={[styles.summaryLabel, { color: colors.textTertiary }]}>
            Priority A
          </ThemedText>
        </View>
      </View>

      {/* Group By Toggle */}
      <View style={styles.controlRow}>
        <SegmentControl
          options={[
            { value: 'status', label: 'By Status' },
            { value: 'priority', label: 'By Priority' },
          ]}
          selected={groupBy}
          onSelect={setGroupBy}
          colors={colors}
          accentColor={modeColors.primary}
        />
        <Pressable
          style={({ pressed }) => [
            styles.poolButton,
            { backgroundColor: modeColors.primary },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleViewPool}
        >
          <IconSymbol name="person.3.fill" size={14} color="#FFFFFF" />
          <ThemedText style={styles.poolButtonText}>Player Pool</ThemedText>
        </Pressable>
      </View>

      {/* Prospects List */}
      {allTargets.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol
            name="person.badge.plus"
            size={48}
            color={colors.textTertiary}
            style={styles.emptyIcon}
          />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            No prospects on board
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Add players from the Player Pool
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProspectCard
              target={item}
              onPress={() => handleProspectPress(item.playerId)}
              colors={colors}
              accentColor={modeColors.primary}
            />
          )}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              {section.color && (
                <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
              )}
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                {section.title}
              </ThemedText>
              <ThemedText style={[styles.sectionCount, { color: colors.textTertiary }]}>
                ({section.data.length})
              </ThemedText>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
        />
      )}
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

  // Summary Strip
  summaryStrip: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    marginVertical: 4,
  },

  // Control Row
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  segmentControl: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  segmentButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  poolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    gap: 4,
  },
  poolButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },

  // Section List
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 12,
  },

  // Prospect Card
  prospectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  prospectHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  prospectInfo: {
    flex: 1,
  },
  prospectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prospectName: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.xs,
  },
  prospectMeta: {
    fontSize: 13,
    marginTop: 1,
  },
  fitBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  fitBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  teamText: {
    fontSize: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  nextStepText: {
    fontSize: 13,
    flex: 1,
  },
  nextStepDate: {
    fontSize: 11,
  },
  chevron: {
    position: 'absolute',
    right: Spacing.sm,
    top: '50%',
    marginTop: -7,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
