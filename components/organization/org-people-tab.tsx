/**
 * Organization People Tab — universal across all modes.
 * Search bar + Leadership / Staff / Members sections.
 */
import React, { useState, useMemo } from 'react';
import { View, ScrollView, TextInput, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { getOrgPeople, type OrgPerson } from '@/data/mock-org-people';
import type { Mode } from '@/types';

interface Props {
  mode: Mode;
  colors: typeof Colors.light;
  accentColor: string;
}

function PersonRow({ person, colors, isLast }: { person: OrgPerson; colors: typeof Colors.light; isLast: boolean }) {
  const initials = person.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2);

  return (
    <>
      <View style={s.personRow}>
        <View style={[s.avatar, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[s.avatarText, { color: colors.textSecondary }]}>{initials}</ThemedText>
        </View>
        <View style={s.personInfo}>
          <ThemedText style={s.personName}>{person.name}</ThemedText>
          <ThemedText style={[s.personTitle, { color: colors.textSecondary }]}>{person.title}</ThemedText>
        </View>
        {person.status && (
          <View style={[s.statusDot, { backgroundColor: person.status === 'active' ? '#22C55E' : colors.textTertiary }]} />
        )}
      </View>
      {!isLast && <View style={[s.divider, { backgroundColor: colors.divider }]} />}
    </>
  );
}

function SectionCard({ title, people, colors }: { title: string; people: OrgPerson[]; colors: typeof Colors.light }) {
  if (people.length === 0) return null;
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {people.map((p, i) => (
          <PersonRow key={p.id} person={p} colors={colors} isLast={i === people.length - 1} />
        ))}
      </View>
    </View>
  );
}

export function OrgPeopleTab({ mode, colors, accentColor }: Props) {
  const [query, setQuery] = useState('');
  const allPeople = useMemo(() => getOrgPeople(mode), [mode]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allPeople;
    const q = query.toLowerCase();
    return allPeople.filter((p) => p.name.toLowerCase().includes(q) || p.title.toLowerCase().includes(q));
  }, [allPeople, query]);

  const leadership = filtered.filter((p) => p.section === 'leadership');
  const staff = filtered.filter((p) => p.section === 'staff');
  const members = filtered.filter((p) => p.section === 'members');

  return (
    <ScrollView nestedScrollEnabled showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Search */}
      <View style={[s.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: colors.text }]}
          placeholder="Search people..."
          placeholderTextColor={colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>

      <SectionCard title="Leadership" people={leadership} colors={colors} />
      <SectionCard title="Staff" people={staff} colors={colors} />
      <SectionCard title="Members" people={members} colors={colors} />

      {filtered.length === 0 && (
        <View style={s.empty}>
          <ThemedText style={[s.emptyText, { color: colors.textTertiary }]}>No results</ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '600',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '500',
  },
  personTitle: {
    fontSize: 13,
    marginTop: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 40 + Spacing.sm,
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
  },
  emptyText: {
    fontSize: 15,
  },
});
