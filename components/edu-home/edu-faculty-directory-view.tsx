/**
 * Education Faculty Directory View
 * Search bar, tenure filter pills, FlatList of faculty rows.
 * Tap row -> openPersonCard().
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, TextInput, FlatList, Text } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  FACULTY_MEMBERS,
  EDU_DEPARTMENT_LABELS,
  EDU_DEPARTMENT_COLORS,
  type FacultyMember,
  type TenureStatus,
  type DepartmentCategory,
} from '@/data/mock-education-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type FilterKey = 'all' | TenureStatus;
type DeptFilterKey = 'all' | DepartmentCategory;

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'tenured', label: 'Tenured' },
  { key: 'tenure_track', label: 'Tenure-Track' },
  { key: 'adjunct', label: 'Adjunct' },
  { key: 'staff', label: 'Staff' },
  { key: 'on_leave', label: 'On Leave' },
];

const DEPT_FILTER_PILLS: { key: DeptFilterKey; label: string }[] = [
  { key: 'all', label: 'All Depts' },
  ...Object.entries(EDU_DEPARTMENT_LABELS).map(([k, v]) => ({
    key: k as DepartmentCategory,
    label: v,
  })),
];

const TENURE_COLORS: Record<TenureStatus, string> = {
  tenured: '#22C55E',
  tenure_track: '#3B82F6',
  adjunct: '#F59E0B',
  staff: '#6B7280',
  on_leave: '#EF4444',
};

const TENURE_LABELS: Record<TenureStatus, string> = {
  tenured: 'Tenured',
  tenure_track: 'Tenure-Track',
  adjunct: 'Adjunct',
  staff: 'Staff',
  on_leave: 'On Leave',
};

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  sabbatical: '#F59E0B',
  adjunct: '#3B82F6',
  on_leave: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  sabbatical: 'Sabbatical',
  adjunct: 'Adjunct',
  on_leave: 'On Leave',
};

function nameHash(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function hueFromName(name: string): string {
  const hue = nameHash(name) % 360;
  return `hsl(${hue}, 45%, 35%)`;
}

function getInitials(name: string): string {
  const parts = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s*/i, '').split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`
    : parts[0].slice(0, 2).toUpperCase();
}

export function EduFacultyDirectoryView({ colors, accent }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeDeptFilter, setActiveDeptFilter] = useState<DeptFilterKey>('all');

  const filtered = useMemo(() => {
    let result = [...FACULTY_MEMBERS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (f) => f.name.toLowerCase().includes(q) || f.department.toLowerCase().includes(q),
      );
    }

    if (activeFilter === 'on_leave') {
      result = result.filter((f) => f.status === 'on_leave' || f.status === 'sabbatical');
    } else if (activeFilter !== 'all') {
      result = result.filter((f) => f.tenureStatus === activeFilter);
    }

    if (activeDeptFilter !== 'all') {
      result = result.filter((f) => f.departmentCategory === activeDeptFilter);
    }

    return result;
  }, [searchQuery, activeFilter, activeDeptFilter]);

  const renderRow = useCallback(
    ({ item }: { item: FacultyMember }) => {
      const tenureColor = TENURE_COLORS[item.tenureStatus];
      const initials = getInitials(item.name);
      const statusColor = STATUS_COLORS[item.status] ?? '#6B7280';
      const statusLabel = STATUS_LABELS[item.status] ?? item.status;
      const deptColor = EDU_DEPARTMENT_COLORS[item.departmentCategory] ?? '#6B7280';

      return (
        <Pressable
          style={[styles.row, { borderBottomColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openPersonCard({
              name: item.name,
              role: item.title,
              ministries: [item.department],
              status: item.status,
            });
          }}
        >
          <View style={[styles.avatar, { backgroundColor: hueFromName(item.name) }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.rowInfo}>
            <View style={styles.rowTopLine}>
              <ThemedText style={[styles.name, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
                <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                  {statusLabel}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            <View style={styles.rowBottomLine}>
              <View style={[styles.deptBadge, { backgroundColor: deptColor + '18' }]}>
                <ThemedText style={[styles.deptBadgeText, { color: deptColor }]}>
                  {item.department}
                </ThemedText>
              </View>
              <View style={[styles.tenureBadge, { backgroundColor: tenureColor + '22' }]}>
                <ThemedText style={[styles.tenureText, { color: tenureColor }]}>
                  {TENURE_LABELS[item.tenureStatus]}
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors],
  );

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search faculty..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
      </View>

      {/* Tenure filter pills */}
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

      {/* Department filter pills */}
      <View style={styles.filterRow}>
        {DEPT_FILTER_PILLS.map((f) => {
          const isActive = activeDeptFilter === f.key;
          const pillColor = f.key !== 'all' ? EDU_DEPARTMENT_COLORS[f.key] : undefined;
          return (
            <Pressable
              key={f.key}
              style={[
                styles.filterPill,
                { borderColor: colors.border },
                isActive && { backgroundColor: pillColor ?? accent, borderColor: pillColor ?? accent },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveDeptFilter(f.key);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={(f) => f.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 6,
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 12,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 6, gap: 6, flexWrap: 'wrap' },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingBottom: 120, paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  rowInfo: { flex: 1, gap: 2 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name: { fontSize: 14, fontWeight: '600', flex: 1 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  subtitle: { fontSize: 11 },
  rowBottomLine: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2, flexWrap: 'wrap' },
  deptBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  deptBadgeText: { fontSize: 10, fontWeight: '600' },
  tenureBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  tenureText: { fontSize: 10, fontWeight: '700' },
});
