/**
 * Metrics Screen
 * Institutional metrics for Education mode.
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
import { INSTITUTIONAL_METRICS, KANEXT_UNIVERSITY_ORGANIZATION } from '@/data/mock-education';

// =============================================================================
// COMPONENTS
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  colors: typeof Colors.light;
  accentColor: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  trend,
  trendPositive,
  colors,
  accentColor,
}: MetricCardProps) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.metricTitle, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.metricValue, { color: accentColor }]}>{value}</ThemedText>
      {subtitle && (
        <ThemedText style={[styles.metricSubtitle, { color: colors.textTertiary }]}>
          {subtitle}
        </ThemedText>
      )}
      {trend && (
        <View style={styles.trendRow}>
          <IconSymbol
            name={trendPositive ? 'arrow.up' : 'arrow.up'}
            size={12}
            color={trendPositive ? '#22C55E' : '#EF4444'}
          />
          <ThemedText
            style={[
              styles.trendText,
              { color: trendPositive ? '#22C55E' : '#EF4444' },
            ]}
          >
            {trend}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

interface MetricRowProps {
  label: string;
  value: string | number;
  colors: typeof Colors.light;
}

function MetricRow({ label, value, colors }: MetricRowProps) {
  return (
    <View style={styles.metricRow}>
      <ThemedText style={[styles.metricRowLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={styles.metricRowValue}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MetricsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.education;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
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
            Institutional Metrics
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {KANEXT_UNIVERSITY_ORGANIZATION.name}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enrollment Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ENROLLMENT
        </ThemedText>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Total Enrollment"
            value={INSTITUTIONAL_METRICS.enrollment.total.toLocaleString()}
            trend={`+${INSTITUTIONAL_METRICS.enrollment.yearOverYearChange}% YoY`}
            trendPositive={INSTITUTIONAL_METRICS.enrollment.yearOverYearChange > 0}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <MetricCard
            title="Undergraduate"
            value={INSTITUTIONAL_METRICS.enrollment.undergraduate.toLocaleString()}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <MetricCard
            title="Graduate"
            value={INSTITUTIONAL_METRICS.enrollment.graduate.toLocaleString()}
            colors={colors}
            accentColor={modeColors.primary}
          />
        </View>

        {/* Academics Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          ACADEMICS
        </ThemedText>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MetricRow
            label="Academic Programs"
            value={INSTITUTIONAL_METRICS.academics.programs}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MetricRow
            label="Full-Time Faculty"
            value={INSTITUTIONAL_METRICS.academics.facultyCount}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MetricRow
            label="Student-Faculty Ratio"
            value={INSTITUTIONAL_METRICS.academics.studentFacultyRatio}
            colors={colors}
          />
        </View>

        {/* Outcomes Section */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          STUDENT OUTCOMES
        </ThemedText>
        <View style={styles.metricsGrid}>
          <MetricCard
            title="Graduation Rate"
            value={`${INSTITUTIONAL_METRICS.outcomes.graduationRate}%`}
            subtitle="6-year rate"
            colors={colors}
            accentColor={modeColors.primary}
          />
          <MetricCard
            title="Retention Rate"
            value={`${INSTITUTIONAL_METRICS.outcomes.retentionRate}%`}
            subtitle="First to second year"
            colors={colors}
            accentColor={modeColors.primary}
          />
          <MetricCard
            title="Employment Rate"
            value={`${INSTITUTIONAL_METRICS.outcomes.employmentRate}%`}
            subtitle="Within 6 months"
            colors={colors}
            accentColor={modeColors.primary}
          />
        </View>

        {/* Institution Details */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          INSTITUTION DETAILS
        </ThemedText>
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MetricRow label="Founded" value={KANEXT_UNIVERSITY_ORGANIZATION.founded || 'N/A'} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MetricRow label="Type" value={KANEXT_UNIVERSITY_ORGANIZATION.institutionType} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MetricRow
            label="Accreditation"
            value={KANEXT_UNIVERSITY_ORGANIZATION.accreditation || 'N/A'}
            colors={colors}
          />
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <MetricRow
            label="Program Formats"
            value={KANEXT_UNIVERSITY_ORGANIZATION.programFormats?.join(', ') || 'N/A'}
            colors={colors}
          />
        </View>
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

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '30%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  metricTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  metricSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 2,
  },
  trendText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Detail Card
  detailCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  metricRowLabel: {
    fontSize: 14,
  },
  metricRowValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
});
