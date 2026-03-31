/**
 * Education Faculty Departments View
 * Filter pills by category, department cards with colored left bar.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, MODE_ACCENT } from '@/constants/theme';

const ACCENT = MODE_ACCENT.education;
import { DEPARTMENTS, type Department, type DepartmentCategory } from '@/data/mock-education-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type FilterKey = 'all' | DepartmentCategory;

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'arts_sciences', label: 'Arts & Sciences' },
  { key: 'business', label: 'Business' },
  { key: 'education', label: 'Education' },
  { key: 'professional', label: 'Professional' },
];

const CATEGORY_COLORS: Record<DepartmentCategory, string> = {
  arts_sciences: ACCENT,
  business: '#B8943E',
  education: '#5A8A6E',
  professional: ACCENT,
};

const STATUS_COLORS: Record<string, string> = {
  active: '#5A8A6E',
  under_review: '#B8943E',
  probation: '#B85C5C',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  under_review: 'Under Review',
  probation: 'Probation',
};

export function EduFacultyDepartmentsView({ colors, accent }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return DEPARTMENTS;
    return DEPARTMENTS.filter((d) => d.category === activeFilter);
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

      {/* Department cards */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {filtered.map((dept) => {
          const catColor = CATEGORY_COLORS[dept.category];
          const statusColor = STATUS_COLORS[dept.status] ?? '#9C9790';
          const statusLabel = STATUS_LABELS[dept.status] ?? dept.status;

          return (
            <View
              key={dept.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              {/* Colored left bar */}
              <View style={[styles.leftBar, { backgroundColor: catColor }]} />

              <View style={styles.cardContent}>
                {/* Header row */}
                <View style={styles.cardHeader}>
                  <ThemedText style={[styles.deptName, { color: colors.text }]}>{dept.name}</ThemedText>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                    <ThemedText style={[styles.statusText, { color: statusColor }]}>{statusLabel}</ThemedText>
                  </View>
                </View>

                {/* Chair */}
                <ThemedText style={[styles.chairName, { color: colors.textSecondary }]}>
                  Chair: {dept.chairName}
                </ThemedText>

                {/* Stats */}
                <View style={styles.statsRow}>
                  <ThemedText style={[styles.stat, { color: colors.textSecondary }]}>
                    {dept.facultyCount} Faculty
                  </ThemedText>
                  <ThemedText style={[styles.statSep, { color: colors.textSecondary }]}>·</ThemedText>
                  <ThemedText style={[styles.stat, { color: colors.textSecondary }]}>
                    {dept.studentEnrollment} Students
                  </ThemedText>
                </View>

                {/* Program pills */}
                <View style={styles.programsRow}>
                  {dept.programs.map((p) => (
                    <View key={p} style={[styles.programPill, { backgroundColor: catColor + '18' }]}>
                      <ThemedText style={[styles.programText, { color: catColor }]}>{p}</ThemedText>
                    </View>
                  ))}
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
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  leftBar: { width: 4 },
  cardContent: { flex: 1, padding: 14, gap: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  deptName: { fontSize: 15, fontWeight: '700', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  chairName: { fontSize: 12 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stat: { fontSize: 11 },
  statSep: { fontSize: 11 },
  programsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  programPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  programText: { fontSize: 10, fontWeight: '600' },
});
