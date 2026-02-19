/**
 * Competition Grid — Drivers View
 * Filterable driver list with championship position, team color dot, number,
 * name, car, points, wins, podiums, poles, and status badge.
 * Wildcard drivers get a star icon. Tap opens driver card sheet.
 * Sort by: championship position (default), wins, name, team.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { GRID_DRIVERS } from '@/data/mock-competition-home';
import { openDriverCard } from '@/utils/global-entity-sheets';

const FILTERS = ['All', 'Permanent', 'Wildcard'] as const;
type FilterTab = (typeof FILTERS)[number];

type SortKey = 'position' | 'wins' | 'name' | 'team';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'position', label: 'Position' },
  { key: 'wins', label: 'Wins' },
  { key: 'name', label: 'Name' },
  { key: 'team', label: 'Team' },
];

const STATUS_COLORS: Record<string, string> = {
  injured: '#EF4444',
  suspended: '#F59E0B',
};

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompGridDriversView({ colors, accent }: Props) {
  const [filter, setFilter] = useState<FilterTab>('All');
  const [sort, setSort] = useState<SortKey>('position');

  const filtered = useMemo(() => {
    let list = GRID_DRIVERS;
    if (filter === 'Permanent') list = list.filter((d) => d.type === 'permanent');
    else if (filter === 'Wildcard') list = list.filter((d) => d.type === 'wildcard');

    list = [...list].sort((a, b) => {
      if (sort === 'position') return a.position - b.position;
      if (sort === 'wins') return b.wins - a.wins || a.position - b.position;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return a.team.localeCompare(b.team) || a.position - b.position;
    });

    return list;
  }, [filter, sort]);

  return (
    <View style={styles.container}>
      {/* Filter pills */}
      <View style={styles.filterBar}>
        {FILTERS.map((f) => (
          <Pressable
            key={f}
            style={[styles.filterPill, filter === f && { backgroundColor: accent }]}
            onPress={() => setFilter(f)}
          >
            <ThemedText style={[styles.filterText, { color: filter === f ? '#000' : colors.textSecondary }]}>
              {f}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Sort pills */}
      <View style={styles.sortBar}>
        <ThemedText style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort:</ThemedText>
        {SORT_OPTIONS.map((s) => (
          <Pressable
            key={s.key}
            style={[styles.sortPill, sort === s.key && { backgroundColor: accent + '30' }]}
            onPress={() => setSort(s.key)}
          >
            <ThemedText style={[styles.sortText, { color: sort === s.key ? accent : colors.textSecondary }]}>
              {s.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText style={[styles.countLabel, { color: colors.textSecondary }]}>
          {filtered.length} driver{filtered.length !== 1 ? 's' : ''}
        </ThemedText>

        {filtered.map((driver) => (
          <Pressable
            key={driver.id}
            style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() =>
              openDriverCard({
                name: driver.name,
                number: driver.number,
                team: driver.team,
                points: driver.points,
                wins: driver.wins,
                podiums: driver.podiums,
                category: driver.type,
              })
            }
          >
            {/* Championship position */}
            <ThemedText style={[styles.positionText, { color: accent }]}>
              P{driver.position}
            </ThemedText>

            {/* Team color dot */}
            <View style={[styles.teamDot, { backgroundColor: driver.teamColor }]} />

            {/* Number */}
            <ThemedText style={[styles.driverNumber, { color: colors.textSecondary }]}>
              #{driver.number}
            </ThemedText>

            {/* Name + team + car */}
            <View style={styles.nameCol}>
              <View style={styles.nameRow}>
                <ThemedText style={[styles.driverName, { color: colors.text }]}>{driver.name}</ThemedText>
                {driver.type === 'wildcard' && (
                  <ThemedText style={styles.starIcon}>★</ThemedText>
                )}
                {driver.status !== 'active' && (
                  <View style={[styles.statusBadge, { backgroundColor: (STATUS_COLORS[driver.status] ?? '#6B7280') + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: STATUS_COLORS[driver.status] ?? '#6B7280' }]}>
                      {driver.status.charAt(0).toUpperCase() + driver.status.slice(1)}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[styles.teamLabel, { color: colors.textSecondary }]}>
                {driver.team} · {driver.car}
              </ThemedText>
            </View>

            {/* Stats column */}
            <View style={styles.statsCol}>
              <ThemedText style={[styles.pointsText, { color: colors.text }]}>{driver.points} pts</ThemedText>
              <View style={styles.statsRow}>
                {driver.wins > 0 && (
                  <View style={[styles.statBadge, { backgroundColor: '#22C55E20' }]}>
                    <ThemedText style={[styles.statBadgeText, { color: '#22C55E' }]}>{driver.wins}W</ThemedText>
                  </View>
                )}
                {driver.podiums > 0 && (
                  <View style={[styles.statBadge, { backgroundColor: '#3B82F620' }]}>
                    <ThemedText style={[styles.statBadgeText, { color: '#3B82F6' }]}>{driver.podiums}P</ThemedText>
                  </View>
                )}
                {driver.poles > 0 && (
                  <View style={[styles.statBadge, { backgroundColor: '#8B5CF620' }]}>
                    <ThemedText style={[styles.statBadgeText, { color: '#8B5CF6' }]}>{driver.poles}PP</ThemedText>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        ))}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 6, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  filterText: { fontSize: 12, fontWeight: '600' },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  sortLabel: { fontSize: 11, fontWeight: '600', marginRight: 2 },
  sortPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  sortText: { fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16 },
  countLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  positionText: { fontSize: 13, fontWeight: '800', width: 30 },
  teamDot: { width: 10, height: 10, borderRadius: 5 },
  driverNumber: { fontSize: 13, fontWeight: '700', width: 32 },
  nameCol: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  driverName: { fontSize: 14, fontWeight: '600' },
  starIcon: { fontSize: 12, color: '#F59E0B' },
  teamLabel: { fontSize: 11, marginTop: 2 },
  statusBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  statsCol: { alignItems: 'flex-end' },
  pointsText: { fontSize: 13, fontWeight: '600', marginBottom: 3 },
  statsRow: { flexDirection: 'row', gap: 4 },
  statBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statBadgeText: { fontSize: 10, fontWeight: '700' },
});
