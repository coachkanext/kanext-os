/**
 * Education Catalog Bottom Sheet
 *
 * Browse-only: school pills → programs list → expandable program detail.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { CATALOG_SCHOOLS, type CatalogSchool } from '@/data/edu-commerce-data';
import { ACADEMIC_PROGRAMS, type AcademicProgram } from '@/data/mock-education-home';
import { Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';

const STATUS_COLORS: Record<string, string> = {
  open: '#22C55E',
  waitlisted: '#F59E0B',
  closed: '#EF4444',
};

export function EduCatalogSheet({ visible, onClose, colors }: Props) {
  const [selectedSchool, setSelectedSchool] = useState<CatalogSchool>(CATALOG_SCHOOLS[0]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const handleClose = useCallback(() => {
    setExpandedId(null);
    setSearch('');
    setSelectedSchool(CATALOG_SCHOOLS[0]);
    onClose();
  }, [onClose]);

  const filteredPrograms = useMemo(() => {
    const depts = selectedSchool.departments;
    let programs = ACADEMIC_PROGRAMS.filter((p) => depts.includes(p.department));
    if (search.trim()) {
      const q = search.toLowerCase();
      programs = programs.filter(
        (p) => p.name.toLowerCase().includes(q) || p.department.toLowerCase().includes(q),
      );
    }
    return programs;
  }, [selectedSchool, search]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Course Catalog" useModal>
      <View style={styles.container}>
        {/* School pills */}
        <View style={styles.pillRow}>
          {CATALOG_SCHOOLS.map((school) => {
            const active = school.id === selectedSchool.id;
            return (
              <Pressable
                key={school.id}
                style={[
                  styles.pill,
                  active
                    ? { backgroundColor: ACCENT }
                    : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
                ]}
                onPress={() => { setSelectedSchool(school); setExpandedId(null); }}
              >
                <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]} numberOfLines={1}>
                  {school.name.replace('School of ', '')}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Search */}
        <TextInput
          style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
          placeholder="Search programs..."
          placeholderTextColor={colors.textSecondary}
          value={search}
          onChangeText={setSearch}
        />

        {/* Programs */}
        {filteredPrograms.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No programs found.</Text>
        )}
        {filteredPrograms.map((prog) => {
          const expanded = expandedId === prog.id;
          return (
            <Pressable
              key={prog.id}
              style={[styles.programCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setExpandedId(expanded ? null : prog.id)}
            >
              <View style={styles.programHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.programName, { color: colors.text }]}>{prog.name}</Text>
                  <View style={styles.badgeRow}>
                    <View style={[styles.degreeBadge, { backgroundColor: ACCENT + '22' }]}>
                      <Text style={[styles.degreeBadgeText, { color: ACCENT }]}>{prog.degreeType}</Text>
                    </View>
                    <Text style={[styles.programEnrollment, { color: colors.textSecondary }]}>
                      {prog.enrollment} enrolled
                    </Text>
                  </View>
                </View>
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[prog.status] ?? '#6B7280' }]} />
              </View>

              {expanded && (
                <View style={styles.detailSection}>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Department</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.department}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Acceptance Rate</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.acceptanceRate}%</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Avg Incoming GPA</Text>
                    <Text style={[styles.detailValue, { color: colors.text }]}>{prog.avgIncomingGPA.toFixed(2)}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>Status</Text>
                    <Text style={[styles.detailValue, { color: STATUS_COLORS[prog.status] ?? colors.text }]}>
                      {prog.status.charAt(0).toUpperCase() + prog.status.slice(1)}
                    </Text>
                  </View>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontSize: 12, fontWeight: '600' },

  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl },

  programCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  programHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  programName: { fontSize: 14, fontWeight: '700' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  degreeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  degreeBadgeText: { fontSize: 10, fontWeight: '700' },
  programEnrollment: { fontSize: 11, fontWeight: '500' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  detailSection: { marginTop: 10, gap: 6, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 10 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, fontWeight: '500' },
  detailValue: { fontSize: 12, fontWeight: '700' },
});
