/**
 * Education Calendar Metrics View
 * Enrollment, Academics, and Financial sections with progress bars and stats.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  ENROLLMENT_DATA,
  ACADEMIC_METRICS,
  FINANCIAL_METRICS,
} from '@/data/mock-education-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function SectionCard({ title, accent, colors, children }: { title: string; accent: string; colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: accent }]}>{title}</ThemedText>
      {children}
    </View>
  );
}

export function EduCalendarMetricsView({ colors, accent }: Props) {
  const enrollPct = ENROLLMENT_DATA.currentTotal / ENROLLMENT_DATA.target;
  const maxClassCount = Math.max(...ENROLLMENT_DATA.byClassYear.map((c) => c.count));

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Enrollment */}
      <SectionCard title="ENROLLMENT" accent={accent} colors={colors}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
              {ENROLLMENT_DATA.currentTotal.toLocaleString()}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Current Total</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
              {(ENROLLMENT_DATA.retentionRate * 100).toFixed(0)}%
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Retention Rate</ThemedText>
          </View>
        </View>

        {/* Target progress bar */}
        <ThemedText style={[styles.progressLabel, { color: colors.textSecondary }]}>
          Target: {ENROLLMENT_DATA.target.toLocaleString()} ({(enrollPct * 100).toFixed(0)}%)
        </ThemedText>
        <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
          <View
            style={[styles.progressFill, { width: `${Math.min(enrollPct * 100, 100)}%`, backgroundColor: accent }]}
          />
        </View>

        {/* Class year breakdown */}
        <ThemedText style={[styles.breakdownTitle, { color: colors.text }]}>By Class Year</ThemedText>
        {ENROLLMENT_DATA.byClassYear.map((cy) => (
          <View key={cy.label} style={styles.barRow}>
            <ThemedText style={[styles.barLabel, { color: colors.textSecondary }]}>{cy.label}</ThemedText>
            <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.barFill,
                  { width: `${(cy.count / maxClassCount) * 100}%`, backgroundColor: cy.color },
                ]}
              />
            </View>
            <ThemedText style={[styles.barCount, { color: colors.text }]}>{cy.count}</ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Academics */}
      <SectionCard title="ACADEMICS" accent={accent} colors={colors}>
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{ACADEMIC_METRICS.avgGpa.toFixed(2)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Avg GPA</ThemedText>
          </View>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{(ACADEMIC_METRICS.graduationRate4yr * 100).toFixed(0)}%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>4-Yr Grad Rate</ThemedText>
          </View>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{(ACADEMIC_METRICS.graduationRate6yr * 100).toFixed(0)}%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>6-Yr Grad Rate</ThemedText>
          </View>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{ACADEMIC_METRICS.facultyStudentRatio}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Faculty Ratio</ThemedText>
          </View>
        </View>

        <View style={[styles.accreditationRow, { borderColor: colors.border }]}>
          <ThemedText style={[styles.accreditationStatus, { color: accent }]}>{ACADEMIC_METRICS.accreditationStatus}</ThemedText>
          <ThemedText style={[styles.accreditationReview, { color: colors.textSecondary }]}>
            Next review: {ACADEMIC_METRICS.nextAccreditationReview}
          </ThemedText>
        </View>

        <ThemedText style={[styles.breakdownTitle, { color: colors.text }]}>Top Programs</ThemedText>
        {ACADEMIC_METRICS.topPrograms.map((p) => (
          <View key={p.name} style={styles.programRow}>
            <ThemedText style={[styles.programName, { color: colors.text }]}>{p.name}</ThemedText>
            <ThemedText style={[styles.programCount, { color: colors.textSecondary }]}>{p.enrollment}</ThemedText>
          </View>
        ))}
      </SectionCard>

      {/* Financial */}
      <SectionCard title="FINANCIAL" accent={accent} colors={colors}>
        <View style={styles.statsGrid}>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{formatCurrency(FINANCIAL_METRICS.tuitionRevenue)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Tuition Revenue</ThemedText>
          </View>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{formatCurrency(FINANCIAL_METRICS.aidDisbursed)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Aid Disbursed</ThemedText>
          </View>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{formatCurrency(FINANCIAL_METRICS.endowment)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Endowment</ThemedText>
          </View>
          <View style={styles.statCell}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>{formatCurrency(FINANCIAL_METRICS.operatingBudget)}</ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Operating Budget</ThemedText>
          </View>
        </View>

        <View style={[styles.accreditationRow, { borderColor: colors.border }]}>
          <ThemedText style={[styles.accreditationStatus, { color: accent }]}>Title IV: {FINANCIAL_METRICS.titleIVStatus}</ThemedText>
        </View>
      </SectionCard>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  // Summary row
  summaryRow: { flexDirection: 'row', gap: 24, marginBottom: 12 },
  summaryItem: {},
  summaryValue: { fontSize: 22, fontWeight: '700' },
  summaryLabel: { fontSize: 11, marginTop: 2 },

  // Progress bar
  progressLabel: { fontSize: 11, marginBottom: 4 },
  progressTrack: { height: 6, borderRadius: 3, marginBottom: 14 },
  progressFill: { height: 6, borderRadius: 3 },

  // Class year bars
  breakdownTitle: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barLabel: { fontSize: 11, width: 80 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, marginHorizontal: 8 },
  barFill: { height: 8, borderRadius: 4 },
  barCount: { fontSize: 11, fontWeight: '600', width: 36, textAlign: 'right' },

  // Stats grid
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 12 },
  statCell: { width: '46%' },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, marginTop: 2 },

  // Accreditation row
  accreditationRow: { borderTopWidth: 1, paddingTop: 10, marginBottom: 10 },
  accreditationStatus: { fontSize: 13, fontWeight: '600' },
  accreditationReview: { fontSize: 11, marginTop: 2 },

  // Program rows
  programRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  programName: { fontSize: 13 },
  programCount: { fontSize: 13, fontWeight: '600' },
});
