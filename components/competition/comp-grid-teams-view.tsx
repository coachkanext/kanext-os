/**
 * Competition Grid — Teams View
 * Team cards with color bar, category tag, constructor, car model, drivers with
 * individual points, cap compliance, homologation badge, and 3SSB Select highlight.
 * Filter pills + sort by constructor points / team name / category.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors , MODE_ACCENT } from '@/constants/theme';
import { GRID_TEAMS, CATEGORY_LABELS, type GridTeam, type TeamCategory } from '@/data/mock-competition-home';
import { openTeamCard } from '@/utils/global-entity-sheets';


const ACCENT = MODE_ACCENT.competition;
const CATEGORY_COLORS: Record<TeamCategory, string> = {
  oem_works: '#22C55E',
  premier_tuner: ACCENT,
  league_owned: '#F59E0B',
  kanext_works: ACCENT,
};

const HOMOLOGATION_COLORS: Record<GridTeam['homologation'], string> = {
  approved: '#22C55E',
  pending: '#F59E0B',
  expired: '#EF4444',
};

const HOMOLOGATION_LABELS: Record<GridTeam['homologation'], string> = {
  approved: 'Approved',
  pending: 'Pending',
  expired: 'Expired',
};

// ---- Filter pills ----
type FilterKey = 'all' | TeamCategory;
const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'oem_works', label: CATEGORY_LABELS.oem_works },
  { key: 'premier_tuner', label: CATEGORY_LABELS.premier_tuner },
  { key: 'league_owned', label: CATEGORY_LABELS.league_owned },
  { key: 'kanext_works', label: CATEGORY_LABELS.kanext_works },
];

// ---- Sort options ----
type SortKey = 'points' | 'name' | 'category';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'points', label: 'Constructor Pts' },
  { key: 'name', label: 'Team Name' },
  { key: 'category', label: 'Category' },
];

const CATEGORY_ORDER: Record<TeamCategory, number> = {
  oem_works: 0,
  premier_tuner: 1,
  league_owned: 2,
  kanext_works: 3,
};

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompGridTeamsView({ colors, accent }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all');
  const [sort, setSort] = useState<SortKey>('points');

  const teams = useMemo(() => {
    let list = filter === 'all' ? GRID_TEAMS : GRID_TEAMS.filter((t) => t.category === filter);

    list = [...list].sort((a, b) => {
      if (sort === 'points') return b.points - a.points;
      if (sort === 'name') return a.name.localeCompare(b.name);
      return CATEGORY_ORDER[a.category] - CATEGORY_ORDER[b.category];
    });

    return list;
  }, [filter, sort]);

  return (
    <View style={styles.container}>
      {/* Filter pills */}
      <View style={styles.filterBar}>
        {FILTER_PILLS.map((fp) => (
          <Pressable
            key={fp.key}
            style={[styles.filterPill, filter === fp.key && { backgroundColor: accent }]}
            onPress={() => setFilter(fp.key)}
          >
            <ThemedText style={[styles.filterText, { color: filter === fp.key ? '#000' : colors.textSecondary }]}>
              {fp.label}
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
        <ThemedText style={[styles.sectionHeader, { color: accent }]}>
          {teams.length} TEAM{teams.length !== 1 ? 'S' : ''}
        </ThemedText>

        {teams.map((team) => {
          const catColor = CATEGORY_COLORS[team.category];
          const isKanext = team.category === 'kanext_works';
          const homoColor = HOMOLOGATION_COLORS[team.homologation];

          return (
            <Pressable
              key={team.id}
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: isKanext ? accent : colors.border },
                isKanext && { backgroundColor: accent + '08' },
              ]}
              onPress={() =>
                openTeamCard({
                  name: team.name,
                  record: `${team.points} pts`,
                  conference: CATEGORY_LABELS[team.category],
                })
              }
            >
              {/* Color bar on left */}
              <View style={[styles.colorBar, { backgroundColor: team.color }]} />

              <View style={styles.cardBody}>
                {/* Header row */}
                <View style={styles.headerRow}>
                  <ThemedText style={[styles.teamName, { color: colors.text }]}>{team.name}</ThemedText>
                  <View style={[styles.categoryBadge, { backgroundColor: catColor + '20' }]}>
                    <ThemedText style={[styles.categoryText, { color: catColor }]}>
                      {CATEGORY_LABELS[team.category]}
                    </ThemedText>
                  </View>
                </View>

                {/* Constructor + car model */}
                <ThemedText style={[styles.constructorLine, { color: colors.textSecondary }]}>
                  {team.constructor} · {team.carModel}
                </ThemedText>

                {/* Points */}
                <ThemedText style={[styles.points, { color: colors.text }]}>
                  {team.points} pts
                </ThemedText>

                {/* Drivers with individual points */}
                <View style={styles.detailRow}>
                  <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Drivers</ThemedText>
                  <View style={styles.driversList}>
                    {team.players.map((driver, idx) => (
                      <ThemedText key={idx} style={[styles.detailValue, { color: colors.text }]}>
                        {driver.name} · {driver.points} pts
                      </ThemedText>
                    ))}
                  </View>
                </View>

                {/* Crew Chief */}
                <View style={styles.detailRow}>
                  <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Crew Chief</ThemedText>
                  <ThemedText style={[styles.detailValue, { color: colors.text }]}>
                    {team.crewChief}
                  </ThemedText>
                </View>

                {/* Status row — cap compliance + homologation */}
                <View style={styles.statusRow}>
                  {/* Cap compliance */}
                  <View style={styles.statusItem}>
                    <ThemedText style={{ fontSize: 13 }}>
                      {team.capCompliance === 'green' ? '\u2705' : '\u26A0\uFE0F'}
                    </ThemedText>
                    <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
                      Cap {team.capCompliance === 'green' ? 'OK' : 'Warning'}
                    </ThemedText>
                  </View>

                  {/* Homologation badge */}
                  <View style={[styles.homoBadge, { backgroundColor: homoColor + '20' }]}>
                    <ThemedText style={[styles.homoText, { color: homoColor }]}>
                      {HOMOLOGATION_LABELS[team.homologation]}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 6, gap: 6 },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#2F3336',
  },
  filterText: { fontSize: 11, fontWeight: '600' },
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  sortLabel: { fontSize: 11, fontWeight: '600', marginRight: 2 },
  sortPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  sortText: { fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  colorBar: { width: 4 },
  cardBody: { flex: 1, padding: 14 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  teamName: { fontSize: 15, fontWeight: '700', flex: 1 },
  categoryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  categoryText: { fontSize: 10, fontWeight: '700' },
  constructorLine: { fontSize: 12, marginTop: 4 },
  points: { fontSize: 13, fontWeight: '600', marginTop: 4, marginBottom: 8 },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 3,
  },
  detailLabel: { fontSize: 12, marginTop: 2 },
  detailValue: { fontSize: 12, fontWeight: '500' },
  driversList: { alignItems: 'flex-end' },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  statusItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusLabel: { fontSize: 11 },
  homoBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  homoText: { fontSize: 10, fontWeight: '700' },
});
