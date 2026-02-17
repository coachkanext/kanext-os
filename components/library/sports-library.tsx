/**
 * SportsLibrary — RBAC-gated library with 4 collapsible sections.
 * Search bar + filter pills (Access Level, Type) + sections.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { LibrarySection } from '@/components/library/library-section';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getVideoSectionVisibility, type SportsRoleLens } from '@/utils/sports-rbac';
import {
  SPORTS_LIBRARY_SECTIONS,
  SPORTS_LIBRARY_RECORDS,
  type AccessLevel,
  type LibraryRecordType,
} from '@/data/mock-sports-library';

const ACCESS_FILTERS: ('All' | AccessLevel)[] = ['All', 'public', 'team', 'staff', 'ad_only'];
const TYPE_FILTERS: ('All' | LibraryRecordType)[] = ['All', 'game_film', 'practice', 'install', 'dev_clip', 'highlight', 'interview'];

const ACCESS_LABELS: Record<string, string> = {
  All: 'All Access',
  public: 'Public',
  team: 'Team',
  staff: 'Staff',
  ad_only: 'AD Only',
};

const TYPE_LABELS: Record<string, string> = {
  All: 'All Types',
  game_film: 'Game Film',
  practice: 'Practice',
  install: 'Install',
  dev_clip: 'Dev Clip',
  highlight: 'Highlight',
  interview: 'Interview',
};

const DEFAULT_ROLE: SportsRoleLens = 'R1';

export function SportsLibrary() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const role = DEFAULT_ROLE;
  const [search, setSearch] = useState('');
  const [accessFilter, setAccessFilter] = useState<'All' | AccessLevel>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | LibraryRecordType>('All');

  const visibleSections = useMemo(() => {
    return SPORTS_LIBRARY_SECTIONS.filter(
      (s) => getVideoSectionVisibility(s.rbacSection, role) !== 'hidden',
    );
  }, [role]);

  const filteredRecords = useMemo(() => {
    let records = SPORTS_LIBRARY_RECORDS;
    if (accessFilter !== 'All') {
      records = records.filter((r) => r.accessLevel === accessFilter);
    }
    if (typeFilter !== 'All') {
      records = records.filter((r) => r.type === typeFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      records = records.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.tags.some((t) => t.toLowerCase().includes(q)) ||
          (r.opponent && r.opponent.toLowerCase().includes(q)),
      );
    }
    return records;
  }, [search, accessFilter, typeFilter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search Bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search library..."
          placeholderTextColor={colors.textTertiary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {ACCESS_FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterPill,
              { backgroundColor: accessFilter === f ? '#fff' : colors.backgroundTertiary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAccessFilter(f);
            }}
          >
            <ThemedText
              style={[styles.filterText, { color: accessFilter === f ? '#000' : colors.textSecondary }]}
            >
              {ACCESS_LABELS[f]}
            </ThemedText>
          </Pressable>
        ))}
        <View style={[styles.filterDivider, { backgroundColor: colors.border }]} />
        {TYPE_FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[
              styles.filterPill,
              { backgroundColor: typeFilter === f ? '#fff' : colors.backgroundTertiary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setTypeFilter(f);
            }}
          >
            <ThemedText
              style={[styles.filterText, { color: typeFilter === f ? '#000' : colors.textSecondary }]}
            >
              {TYPE_LABELS[f]}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Sections */}
      <ScrollView
        contentContainerStyle={styles.sectionList}
        showsVerticalScrollIndicator={false}
      >
        {visibleSections.map((section) => {
          const sectionRecords = filteredRecords.filter((r) => r.section === section.id);
          if (sectionRecords.length === 0) return null;
          return (
            <LibrarySection key={section.id} config={section} records={sectionRecords} />
          );
        })}

        {filteredRecords.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="doc.text.magnifyingglass" size={28} color={colors.textTertiary} />
            <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
              No matching records
            </ThemedText>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 6,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
  },
  sectionList: {
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
  },
});
