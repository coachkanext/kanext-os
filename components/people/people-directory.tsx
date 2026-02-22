/**
 * People Directory — Mode-aware, searchable list with group filter pills.
 * Reads the current mode from app context and renders the matching person list.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, Pressable, FlatList, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import { PEOPLE_DIRECTORY, PEOPLE_GROUPS } from '@/data/mock-people-v2';
import type { Person, PersonStatus } from '@/data/mock-people-v2';

// =============================================================================
// STATUS HELPERS
// =============================================================================

const STATUS_COLORS: Record<PersonStatus, string> = {
  active: '#22C55E',
  inactive: '#A1A1AA',
  pending: '#F59E0B',
  away: '#1D9BF0',
};

const STATUS_LABELS: Record<PersonStatus, string> = {
  active: 'Active',
  inactive: 'Inactive',
  pending: 'Pending',
  away: 'Away',
};

// =============================================================================
// PERSON ROW
// =============================================================================

function PersonRow({
  person,
  colors,
  onPress,
}: {
  person: Person;
  colors: typeof Colors.dark;
  onPress?: (person: Person) => void;
}) {
  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(person);
  }, [person, onPress]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.personRow,
        { borderBottomColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={handlePress}
    >
      {/* Avatar */}
      <View style={[styles.avatar, { backgroundColor: person.avatarColor }]}>
        <ThemedText style={styles.avatarText}>{person.initials}</ThemedText>
      </View>

      {/* Info */}
      <View style={styles.personInfo}>
        <ThemedText style={[styles.personName, { color: colors.text }]}>
          {person.name}
        </ThemedText>
        <ThemedText style={[styles.personRole, { color: colors.textSecondary }]}>
          {person.role}
        </ThemedText>
        <ThemedText style={[styles.personDept, { color: colors.textTertiary }]}>
          {person.department}
        </ThemedText>
      </View>

      {/* Status dot + chevron */}
      <View style={styles.rowTrailing}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[person.status] }]} />
        <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

// =============================================================================
// PEOPLE DIRECTORY
// =============================================================================

export function PeopleDirectory({
  onSelectPerson,
}: {
  onSelectPerson?: (person: Person) => void;
} = {}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const allPeople = PEOPLE_DIRECTORY[mode];
  const groups = PEOPLE_GROUPS[mode];

  // ---------- Filtering ----------
  const filteredPeople = useMemo(() => {
    let result = allPeople;

    // Filter by group
    if (activeGroup) {
      result = result.filter((p) => p.department === activeGroup);
    }

    // Filter by search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q),
      );
    }

    return result;
  }, [allPeople, activeGroup, searchQuery]);

  // ---------- Handlers ----------
  const handleGroupPress = useCallback(
    (label: string) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setActiveGroup((prev) => (prev === label ? null : label));
    },
    [],
  );

  // ---------- Renderers ----------
  const renderPerson = useCallback(
    ({ item }: { item: Person }) => (
      <PersonRow person={item} colors={colors} onPress={onSelectPerson} />
    ),
    [colors, onSelectPerson],
  );

  const keyExtractor = useCallback((item: Person) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Search bar */}
      <View style={[styles.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.textTertiary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search people..."
          placeholderTextColor={colors.textTertiary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Group filter pills */}
      <View style={styles.pillRow}>
        {groups.map((group) => {
          const isActive = activeGroup === group.label;
          return (
            <Pressable
              key={group.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                },
              ]}
              onPress={() => handleGroupPress(group.label)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {group.label} ({group.count})
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Summary row */}
      <View style={[styles.summaryRow, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.summaryText, { color: colors.textSecondary }]}>
          {filteredPeople.length} {filteredPeople.length === 1 ? 'person' : 'people'}
        </ThemedText>
      </View>

      {/* Person list */}
      <FlatList
        data={filteredPeople}
        renderItem={renderPerson}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    lineHeight: 20,
    padding: 0,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: Spacing.xxl,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  personInfo: {
    flex: 1,
    gap: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  personRole: {
    fontSize: 13,
    lineHeight: 18,
  },
  personDept: {
    fontSize: 12,
    lineHeight: 16,
  },
  rowTrailing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
