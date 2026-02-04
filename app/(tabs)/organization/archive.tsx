/**
 * Archive Screen
 * Past academic years for Education mode.
 */

import React from 'react';
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
  getArchivedYears,
  formatTermDates,
  type AcademicYearSummary,
} from '@/data/mock-education';

// =============================================================================
// COMPONENTS
// =============================================================================

interface YearCardProps {
  yearData: AcademicYearSummary;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function YearCard({ yearData, colors, accentColor, onPress }: YearCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.yearCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {/* Year Header */}
      <View style={styles.yearHeader}>
        <View style={[styles.yearBadge, { backgroundColor: accentColor + '15' }]}>
          <IconSymbol name="calendar" size={20} color={accentColor} />
        </View>
        <View style={styles.yearInfo}>
          <ThemedText style={styles.yearTitle}>{yearData.year}</ThemedText>
          <ThemedText style={[styles.yearTerms, { color: colors.textSecondary }]}>
            {yearData.terms.length} terms completed
          </ThemedText>
        </View>
        <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: accentColor }]}>
            {yearData.enrollment.toLocaleString()}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
            Enrollment
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: accentColor }]}>
            {yearData.graduates}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
            Graduates
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: accentColor }]}>
            {yearData.graduationRate}%
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
            Grad Rate
          </ThemedText>
        </View>
      </View>

      {/* Highlights */}
      {yearData.highlights.length > 0 && (
        <View style={styles.highlightsSection}>
          <ThemedText style={[styles.highlightsLabel, { color: colors.textSecondary }]}>
            Highlights
          </ThemedText>
          {yearData.highlights.slice(0, 2).map((highlight, idx) => (
            <View key={idx} style={styles.highlightRow}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={colors.success} />
              <ThemedText
                style={[styles.highlightText, { color: colors.textSecondary }]}
                numberOfLines={1}
              >
                {highlight}
              </ThemedText>
            </View>
          ))}
        </View>
      )}
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ArchiveScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.education;

  const archivedYears = getArchivedYears();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleYearPress = (year: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // In a full implementation, this would navigate to a year detail page
    console.log('View year:', year);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Archive
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Past academic years
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: modeColors.primary + '10' }]}>
          <IconSymbol name="info.circle" size={18} color={modeColors.primary} />
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            Access historical academic year data including enrollment, graduation rates, and
            institutional milestones.
          </ThemedText>
        </View>

        {/* Archived Years */}
        <View style={styles.yearsList}>
          {archivedYears.map((yearData) => (
            <YearCard
              key={yearData.year}
              yearData={yearData}
              colors={colors}
              accentColor={modeColors.primary}
              onPress={() => handleYearPress(yearData.year)}
            />
          ))}
        </View>

        {/* Empty State */}
        {archivedYears.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="archivebox" size={48} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyTitle, { color: colors.textSecondary }]}>
              No Archives Available
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              Past academic year records will appear here.
            </ThemedText>
          </View>
        )}
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Info Banner
  infoBanner: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },

  // Year Card
  yearsList: {
    gap: Spacing.md,
  },
  yearCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  yearHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  yearBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  yearInfo: {
    flex: 1,
  },
  yearTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  yearTerms: {
    fontSize: 13,
    marginTop: 2,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  statDivider: {
    width: 1,
    height: 32,
  },

  // Highlights
  highlightsSection: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
  },
  highlightsLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 4,
  },
  highlightText: {
    flex: 1,
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
