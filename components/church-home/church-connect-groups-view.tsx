/**
 * Church Connect — Groups View
 * Group directory cards with category badges and capacity progress bars.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CONNECT_GROUPS, type ConnectGroup } from '@/data/mock-church-home';
import { openLeaderCard } from '@/utils/global-entity-sheets';

const CATEGORY_COLORS: Record<ConnectGroup['category'], string> = {
  young_adults: '#1D9BF0',
  married: '#1D9BF0',
  men: '#1D9BF0',
  women: '#1D9BF0',
  mixed: '#22C55E',
  seniors: '#F59E0B',
};

const CATEGORY_LABELS: Record<ConnectGroup['category'], string> = {
  young_adults: 'Young Adults',
  married: 'Married',
  men: 'Men',
  women: 'Women',
  mixed: 'Mixed',
  seniors: 'Seniors',
};

const STATUS_COLORS: Record<ConnectGroup['status'], string> = {
  open: '#22C55E',
  full: '#EF4444',
  forming: '#F59E0B',
};

const GROUP_CATEGORY_FILTERS: { key: 'all' | ConnectGroup['category']; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'young_adults', label: 'Young Adults' },
  { key: 'married', label: 'Married' },
  { key: 'men', label: 'Men' },
  { key: 'women', label: 'Women' },
  { key: 'mixed', label: 'Mixed' },
  { key: 'seniors', label: 'Seniors' },
];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function ChurchConnectGroupsView({ colors, accent }: Props) {
  const [catFilter, setCatFilter] = useState<'all' | ConnectGroup['category']>('all');

  const filtered = useMemo(() => {
    if (catFilter === 'all') return CONNECT_GROUPS;
    return CONNECT_GROUPS.filter((g) => g.category === catFilter);
  }, [catFilter]);

  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      {/* Category Filter Pills */}
      <View style={styles.filterRow}>
        {GROUP_CATEGORY_FILTERS.map((cf) => {
          const active = cf.key === catFilter;
          return (
            <Pressable
              key={cf.key}
              style={[
                styles.filterPill,
                { backgroundColor: active ? accent + '22' : colors.card, borderColor: active ? accent : colors.border },
              ]}
              onPress={() => setCatFilter(cf.key)}
            >
              <ThemedText style={[styles.filterText, { color: active ? accent : colors.textSecondary }]}>
                {cf.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {filtered.map((group) => {
        const catColor = CATEGORY_COLORS[group.category];
        const pct = Math.min(group.members / group.capacity, 1);
        return (
          <View
            key={group.id}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={styles.cardHeader}>
              <ThemedText style={[styles.groupName, { color: colors.text }]}>
                {group.name}
              </ThemedText>
              <View style={styles.badgeRow}>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[group.status] + '22' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: STATUS_COLORS[group.status] }]}>
                    {group.status.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={[styles.categoryBadge, { backgroundColor: catColor + '22' }]}>
                  <ThemedText style={[styles.categoryText, { color: catColor }]}>
                    {CATEGORY_LABELS[group.category]}
                  </ThemedText>
                </View>
              </View>
            </View>

            <Pressable
              onPress={() => openLeaderCard({ name: group.leader, title: '' })}
              hitSlop={6}
            >
              <ThemedText style={[styles.leaderLink, { color: accent }]}>
                Led by {group.leader}
              </ThemedText>
            </Pressable>

            <View style={styles.detailRow}>
              <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                {group.day} · {group.time}
              </ThemedText>
              <ThemedText style={[styles.detailDot, { color: colors.textTertiary }]}>·</ThemedText>
              <ThemedText style={[styles.detailText, { color: colors.textSecondary }]}>
                {group.location}
              </ThemedText>
            </View>

            {/* Capacity Bar */}
            <View style={styles.capacityRow}>
              <View style={[styles.barTrack, { backgroundColor: colors.border }]}>
                <View
                  style={[
                    styles.barFill,
                    {
                      backgroundColor: pct >= 0.9 ? '#EF4444' : catColor,
                      width: `${pct * 100}%`,
                    },
                  ]}
                />
              </View>
              <ThemedText style={[styles.capacityText, { color: colors.textSecondary }]}>
                {group.members}/{group.capacity}
              </ThemedText>
            </View>
          </View>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: 16, paddingTop: 4 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: '600' },
  groupName: { fontSize: 15, fontWeight: '700', flex: 1, marginRight: 8 },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusBadgeText: { fontSize: 10, fontWeight: '700' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '700' },
  leaderLink: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { fontSize: 11 },
  detailDot: { fontSize: 11, marginHorizontal: 4 },
  capacityRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: { height: 6, borderRadius: 3 },
  capacityText: { fontSize: 11, fontWeight: '600', width: 42, textAlign: 'right' },
});
