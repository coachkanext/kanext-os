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

const ACCENT = '#1D9BF0';

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
                <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[prog.status] ?? '#A1A1AA' }]} />
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
  container: { gap: 12 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  pillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  searchInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },

  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl, fontWeight: '500' },

  programCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  programHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  programName: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  degreeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  degreeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  programEnrollment: { fontSize: 11, fontWeight: '500', letterSpacing: 0.1 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  detailSection: { marginTop: 12, gap: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#2F3336', paddingTop: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
  detailLabel: { fontSize: 12, fontWeight: '500', letterSpacing: 0.1 },
  detailValue: { fontSize: 12, fontWeight: '700', letterSpacing: -0.2 },
});
