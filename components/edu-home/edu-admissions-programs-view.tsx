/**
 * Education Admissions Programs View
 * Filter pills (All/Undergrad/Graduate/Online), program cards sorted by enrollment.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { ACADEMIC_PROGRAMS, type AcademicProgram } from '@/data/mock-education-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type FilterKey = 'all' | 'undergraduate' | 'graduate' | 'online';

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'undergraduate', label: 'Undergraduate' },
  { key: 'graduate', label: 'Graduate' },
  { key: 'online', label: 'Online' },
];

const STATUS_COLORS: Record<string, string> = {
  open: '#22C55E',
  waitlisted: '#F59E0B',
  waitlist: '#F59E0B',
  closed: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  waitlisted: 'Waitlist',
  waitlist: 'Waitlist',
  closed: 'Closed',
};

const DEGREE_BADGE_COLOR: Record<string, string> = {
  'B.A.': '#3B82F6',
  'B.S.': '#8B5CF6',
  'M.A.': '#10B981',
  'M.S.': '#10B981',
  'M.B.A.': '#F59E0B',
  'Ed.D.': '#EF4444',
  Certificate: '#6B7280',
};

export function EduAdmissionsProgramsView({ colors, accent }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    let result = activeFilter === 'all'
      ? [...ACADEMIC_PROGRAMS]
      : ACADEMIC_PROGRAMS.filter((p) => p.level === activeFilter);

    // Sort by enrollment descending
    result.sort((a, b) => b.enrollment - a.enrollment);
    return result;
  }, [activeFilter]);

  return (
    <View style={styles.container}>
      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTER_PILLS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[
                styles.filterPill,
                { borderColor: colors.border },
                isActive && { backgroundColor: accent, borderColor: accent },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(f.key);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Program cards */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.map((prog) => {
          const enrollStatus = prog.enrollmentStatus ?? prog.status;
          const statusColor = STATUS_COLORS[enrollStatus] ?? '#6B7280';
          const statusLabel = STATUS_LABELS[enrollStatus] ?? enrollStatus;
          const degreeColor = DEGREE_BADGE_COLOR[prog.degreeType] ?? '#6B7280';

          return (
            <View
              key={prog.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {/* Header row */}
              <View style={styles.cardHeader}>
                <View style={styles.headerLeft}>
                  <ThemedText style={[styles.progName, { color: colors.text }]}>{prog.name}</ThemedText>
                  <View style={[styles.degreeBadge, { backgroundColor: degreeColor + '22' }]}>
                    <ThemedText style={[styles.degreeText, { color: degreeColor }]}>
                      {prog.degreeType}
                    </ThemedText>
                  </View>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                  <ThemedText style={[styles.statusText, { color: statusColor }]}>{statusLabel}</ThemedText>
                </View>
              </View>

              {/* Department */}
              <ThemedText style={[styles.department, { color: colors.textSecondary }]}>
                {prog.department}
              </ThemedText>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.text }]}>{prog.enrollment}</ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Enrolled</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.text }]}>{prog.acceptanceRate}%</ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Accept</ThemedText>
                </View>
                <View style={styles.statItem}>
                  <ThemedText style={[styles.statValue, { color: colors.text }]}>{prog.avgIncomingGPA.toFixed(2)}</ThemedText>
                  <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>Avg GPA</ThemedText>
                </View>
              </View>
            </View>
          );
        })}
        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, gap: 6, flexWrap: 'wrap' },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, marginRight: 8 },
  progName: { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  degreeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  degreeText: { fontSize: 10, fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  department: { fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 20, marginTop: 4 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 1 },
});
