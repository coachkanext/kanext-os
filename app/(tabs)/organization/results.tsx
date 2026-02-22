/**
 * Results Screen
 * Completed academic terms for Education mode.
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
import { ACADEMIC_TERMS, formatTermDates, getTermStatusLabel } from '@/data/mock-education';
import type { AcademicTerm } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface TermResultCardProps {
  term: AcademicTerm;
  colors: typeof Colors.light;
  accentColor: string;
}

function TermResultCard({ term, colors, accentColor }: TermResultCardProps) {
  const isCompleted = term.status === 'completed';

  return (
    <View
      style={[
        styles.termCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={styles.termHeader}>
        <View style={[styles.termIcon, { backgroundColor: accentColor + '15' }]}>
          <IconSymbol
            name={isCompleted ? 'checkmark.circle.fill' : 'calendar'}
            size={24}
            color={isCompleted ? accentColor : colors.textTertiary}
          />
        </View>
        <View style={styles.termInfo}>
          <ThemedText style={styles.termName}>{term.name}</ThemedText>
          <ThemedText style={[styles.termDates, { color: colors.textSecondary }]}>
            {formatTermDates(term)}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: isCompleted ? '#22C55E' + '20' : colors.backgroundSecondary,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.statusText,
              { color: isCompleted ? '#22C55E' : colors.textSecondary },
            ]}
          >
            {getTermStatusLabel(term.status)}
          </ThemedText>
        </View>
      </View>

      {isCompleted && (
        <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: accentColor }]}>
              892
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Enrolled
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: accentColor }]}>
              3.24
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Avg GPA
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: accentColor }]}>
              96%
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
              Completed
            </ThemedText>
          </View>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ResultsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.education;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const completedTerms = ACADEMIC_TERMS.filter((t) => t.status === 'completed');
  const currentTerm = ACADEMIC_TERMS.find((t) => t.status === 'current');
  const upcomingTerms = ACADEMIC_TERMS.filter((t) => t.status === 'upcoming');

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Academic Results
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Term completion and outcomes
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: modeColors.primary }]}>
          <ThemedText style={styles.summaryTitle}>2025-2026 Academic Year</ThemedText>
          <View style={styles.summaryStats}>
            <View style={styles.summaryStat}>
              <ThemedText style={styles.summaryValue}>
                {completedTerms.length}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Completed</ThemedText>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.summaryStat}>
              <ThemedText style={styles.summaryValue}>
                {currentTerm ? 1 : 0}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>In Progress</ThemedText>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />
            <View style={styles.summaryStat}>
              <ThemedText style={styles.summaryValue}>
                {upcomingTerms.length}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Upcoming</ThemedText>
            </View>
          </View>
        </View>

        {/* Current Term */}
        {currentTerm && (
          <>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              CURRENT TERM
            </ThemedText>
            <TermResultCard
              term={currentTerm}
              colors={colors}
              accentColor={modeColors.primary}
            />
          </>
        )}

        {/* Completed Terms */}
        {completedTerms.length > 0 && (
          <>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              COMPLETED TERMS
            </ThemedText>
            {completedTerms.map((term) => (
              <TermResultCard
                key={term.id}
                term={term}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </>
        )}

        {/* Upcoming Terms */}
        {upcomingTerms.length > 0 && (
          <>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              UPCOMING TERMS
            </ThemedText>
            {upcomingTerms.map((term) => (
              <TermResultCard
                key={term.id}
                term={term}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </>
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

  // Summary Card
  summaryCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  summaryTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 40,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // Term Card
  termCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  termIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  termInfo: {
    flex: 1,
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
  },
  termDates: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
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
  },
});
