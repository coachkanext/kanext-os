/**
 * Competition Grid — Crew View
 * Crew list with championship position, points, initials circle, name, team,
 * role badge, pit score bar, operational discipline score, and unsafe releases count.
 * Sort by: crew championship position (default), pit performance, team name.
 * Tap opens crew card sheet.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors , MODE_ACCENT } from '@/constants/theme';
import { GRID_CREW } from '@/data/mock-competition-home';
import { openCrewCard } from '@/utils/global-entity-sheets';


const ACCENT = MODE_ACCENT.competition;
type SortKey = 'position' | 'pitScore' | 'team';
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'position', label: 'Position' },
  { key: 'pitScore', label: 'Pit Score' },
  { key: 'team', label: 'Team' },
];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w.charAt(0))
    .join('')
    .slice(0, 2);
}

function getPitScoreColor(score: number): string {
  if (score >= 93) return '#22C55E';
  if (score >= 88) return ACCENT;
  return '#F59E0B';
}

export function CompGridCrewView({ colors, accent }: Props) {
  const [sort, setSort] = useState<SortKey>('position');

  const sorted = useMemo(() => {
    return [...GRID_CREW].sort((a, b) => {
      if (sort === 'position') return a.position - b.position;
      if (sort === 'pitScore') return b.pitScore - a.pitScore;
      return a.team.localeCompare(b.team) || a.position - b.position;
    });
  }, [sort]);

  return (
    <View style={styles.container}>
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
          {sorted.length} CREW MEMBERS
        </ThemedText>

        {sorted.map((crew) => {
          const scoreColor = getPitScoreColor(crew.pitScore);
          return (
            <Pressable
              key={crew.id}
              style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() =>
                openCrewCard({
                  name: crew.name,
                  role: crew.role,
                  team: crew.team,
                  pitScore: crew.pitScore,
                })
              }
            >
              {/* Position badge */}
              <ThemedText style={[styles.positionText, { color: accent }]}>
                P{crew.position}
              </ThemedText>

              {/* Initials circle */}
              <View style={[styles.initialsCircle, { backgroundColor: accent + '20' }]}>
                <ThemedText style={[styles.initialsText, { color: accent }]}>
                  {getInitials(crew.name)}
                </ThemedText>
              </View>

              {/* Info */}
              <View style={styles.infoCol}>
                <ThemedText style={[styles.crewName, { color: colors.text }]}>{crew.name}</ThemedText>
                <ThemedText style={[styles.teamLabel, { color: colors.textSecondary }]}>{crew.team}</ThemedText>
                {/* Operational discipline + unsafe releases */}
                <View style={styles.metaRow}>
                  <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                    OD: {crew.operationalDiscipline}
                  </ThemedText>
                  <ThemedText style={[styles.metaDot, { color: colors.textSecondary }]}>·</ThemedText>
                  <ThemedText
                    style={[
                      styles.metaText,
                      { color: crew.unsafeReleases > 0 ? '#EF4444' : colors.textSecondary },
                    ]}
                  >
                    UR: {crew.unsafeReleases}
                  </ThemedText>
                </View>
              </View>

              {/* Role badge */}
              <View style={[styles.roleBadge, { backgroundColor: colors.border + '40' }]}>
                <ThemedText style={[styles.roleText, { color: colors.textSecondary }]}>{crew.role}</ThemedText>
              </View>

              {/* Points + Pit score */}
              <View style={styles.pitScoreCol}>
                <ThemedText style={[styles.pointsValue, { color: colors.text }]}>{crew.points} pts</ThemedText>
                <ThemedText style={[styles.pitScoreValue, { color: scoreColor }]}>{crew.pitScore}</ThemedText>
                <View style={[styles.pitScoreBarBg, { backgroundColor: colors.border }]}>
                  <View
                    style={[
                      styles.pitScoreBarFill,
                      { backgroundColor: scoreColor, width: `${crew.pitScore}%` },
                    ]}
                  />
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
  sortBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10, gap: 6 },
  sortLabel: { fontSize: 11, fontWeight: '600', marginRight: 2 },
  sortPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  sortText: { fontSize: 11, fontWeight: '600' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  positionText: { fontSize: 13, fontWeight: '800', width: 28 },
  initialsCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: { fontSize: 14, fontWeight: '700' },
  infoCol: { flex: 1 },
  crewName: { fontSize: 14, fontWeight: '600' },
  teamLabel: { fontSize: 11, marginTop: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3, gap: 4 },
  metaText: { fontSize: 10, fontWeight: '500' },
  metaDot: { fontSize: 10 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '600' },
  pitScoreCol: { alignItems: 'flex-end', width: 52 },
  pointsValue: { fontSize: 11, fontWeight: '600', marginBottom: 2 },
  pitScoreValue: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  pitScoreBarBg: { width: 44, height: 4, borderRadius: 2, overflow: 'hidden' },
  pitScoreBarFill: { height: 4, borderRadius: 2 },
});
