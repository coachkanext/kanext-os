/**
 * Competition Calendar — Standings View
 * 4 toggles: Driver | Constructor | Crew | Wildcard Cup
 * Each shows a ranked table with position, name, points, delta indicators.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { openDriverCard, openTeamCard, openCrewCard } from '@/utils/global-entity-sheets';
import {
  DRIVER_STANDINGS,
  CONSTRUCTOR_STANDINGS,
  CREW_STANDINGS,
  WILDCARD_CUP_STANDINGS,
  type DriverStanding,
  type ConstructorStanding,
  type CrewStanding,
  type WildcardStanding,
} from '@/data/mock-competition-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const TOGGLES = ['Driver', 'Constructor', 'Crew', 'Wildcard Cup'] as const;
type StandingsToggle = (typeof TOGGLES)[number];

function DeltaIndicator({ delta, colors }: { delta: number; colors: typeof Colors.light }) {
  if (delta > 0) {
    return <ThemedText style={[styles.delta, { color: '#22C55E' }]}>{'\u25B2'} {delta}</ThemedText>;
  }
  if (delta < 0) {
    return <ThemedText style={[styles.delta, { color: '#EF4444' }]}>{'\u25BC'} {Math.abs(delta)}</ThemedText>;
  }
  return <ThemedText style={[styles.delta, { color: colors.textTertiary }]}>{'\u2014'}</ThemedText>;
}

function DriverTable({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.thText, { width: 28, color: colors.textSecondary }]}>#</ThemedText>
        <ThemedText style={[styles.thText, { flex: 1, color: colors.textSecondary }]}>Driver</ThemedText>
        <ThemedText style={[styles.thText, { width: 32, textAlign: 'center', color: colors.textSecondary }]}>W</ThemedText>
        <ThemedText style={[styles.thText, { width: 32, textAlign: 'center', color: colors.textSecondary }]}>POD</ThemedText>
        <ThemedText style={[styles.thText, { width: 32, textAlign: 'center', color: colors.textSecondary }]}>POL</ThemedText>
        <ThemedText style={[styles.thText, { width: 28, textAlign: 'center', color: colors.textSecondary }]}>FL</ThemedText>
        <ThemedText style={[styles.thText, { width: 44, textAlign: 'right', color: colors.textSecondary }]}>PTS</ThemedText>
        <ThemedText style={[styles.thText, { width: 36, textAlign: 'right', color: colors.textSecondary }]}>{'\u0394'}</ThemedText>
      </View>
      {DRIVER_STANDINGS.map((d) => (
        <Pressable
          key={d.position}
          style={[styles.row, d.position === 1 && { backgroundColor: accent + '12' }]}
          onPress={() => openDriverCard({ name: d.name, number: '', team: d.team, points: d.points, wins: d.wins, podiums: d.podiums })}
        >
          <ThemedText style={[styles.cellText, { width: 28, color: colors.textSecondary }]}>{d.position}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.cellText, { color: d.position === 1 ? accent : colors.text, fontWeight: d.position <= 3 ? '700' : '400' }]}>
              {d.name}
            </ThemedText>
            <ThemedText style={[styles.teamLabel, { color: colors.textSecondary }]}>{d.team}</ThemedText>
          </View>
          <ThemedText style={[styles.cellText, { width: 32, textAlign: 'center', color: colors.text }]}>{d.wins}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 32, textAlign: 'center', color: colors.text }]}>{d.podiums}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 32, textAlign: 'center', color: colors.text }]}>{d.poles}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 28, textAlign: 'center', color: colors.text }]}>{d.fastestLaps}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 44, textAlign: 'right', fontWeight: '700', color: colors.text }]}>{d.points}</ThemedText>
          <View style={{ width: 36, alignItems: 'flex-end' }}>
            <DeltaIndicator delta={d.delta} colors={colors} />
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const CATEGORY_LABELS: Record<ConstructorStanding['category'], string> = {
  oem_works: 'OEM',
  premier_tuner: 'Tuner',
  league_owned: 'League',
  kanext_works: 'KaNeXT',
};

const CATEGORY_COLORS: Record<ConstructorStanding['category'], string> = {
  oem_works: '#1D9BF0',
  premier_tuner: '#F59E0B',
  league_owned: '#A1A1AA',
  kanext_works: '#1D9BF0',
};

function ConstructorTable({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.thText, { width: 28, color: colors.textSecondary }]}>#</ThemedText>
        <ThemedText style={[styles.thText, { flex: 1, color: colors.textSecondary }]}>Constructor</ThemedText>
        <ThemedText style={[styles.thText, { width: 32, textAlign: 'center', color: colors.textSecondary }]}>W</ThemedText>
        <ThemedText style={[styles.thText, { width: 32, textAlign: 'center', color: colors.textSecondary }]}>1-2</ThemedText>
        <ThemedText style={[styles.thText, { width: 50, textAlign: 'right', color: colors.textSecondary }]}>PTS</ThemedText>
      </View>
      {CONSTRUCTOR_STANDINGS.map((c) => (
        <Pressable
          key={c.position}
          style={[styles.row, c.position === 1 && { backgroundColor: accent + '12' }]}
          onPress={() => openTeamCard({ name: c.name, category: c.category })}
        >
          <ThemedText style={[styles.cellText, { width: 28, color: colors.textSecondary }]}>{c.position}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.cellText, { color: c.position === 1 ? accent : colors.text, fontWeight: c.position <= 3 ? '700' : '400' }]}>
              {c.name}
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 }}>
              <ThemedText style={[styles.teamLabel, { color: colors.textSecondary }]}>
                {c.drivers.join(' · ')}
              </ThemedText>
              <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[c.category] + '22' }]}>
                <ThemedText style={[styles.categoryText, { color: CATEGORY_COLORS[c.category] }]}>
                  {CATEGORY_LABELS[c.category]}
                </ThemedText>
              </View>
            </View>
          </View>
          <ThemedText style={[styles.cellText, { width: 32, textAlign: 'center', color: colors.text }]}>{c.wins}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 32, textAlign: 'center', color: colors.text }]}>{c.oneTwo}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 50, textAlign: 'right', fontWeight: '700', color: colors.text }]}>{c.points}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function CrewTable({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.thText, { width: 28, color: colors.textSecondary }]}>#</ThemedText>
        <ThemedText style={[styles.thText, { flex: 1, color: colors.textSecondary }]}>Crew Chief</ThemedText>
        <ThemedText style={[styles.thText, { width: 44, textAlign: 'center', color: colors.textSecondary }]}>Pit Avg</ThemedText>
        <ThemedText style={[styles.thText, { width: 32, textAlign: 'center', color: colors.textSecondary }]}>OD</ThemedText>
        <ThemedText style={[styles.thText, { width: 40, textAlign: 'center', color: colors.textSecondary }]}>Score</ThemedText>
        <ThemedText style={[styles.thText, { width: 40, textAlign: 'right', color: colors.textSecondary }]}>PTS</ThemedText>
      </View>
      {CREW_STANDINGS.map((cr) => (
        <Pressable
          key={cr.position}
          style={[styles.row, cr.position === 1 && { backgroundColor: accent + '12' }]}
          onPress={() => openCrewCard({ name: cr.name, role: cr.role, team: cr.team, pitScore: cr.pitScore })}
        >
          <ThemedText style={[styles.cellText, { width: 28, color: colors.textSecondary }]}>{cr.position}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.cellText, { color: cr.position === 1 ? accent : colors.text, fontWeight: cr.position <= 3 ? '700' : '400' }]}>
              {cr.name}
            </ThemedText>
            <ThemedText style={[styles.teamLabel, { color: colors.textSecondary }]}>
              {cr.team} · {cr.role}
            </ThemedText>
          </View>
          <ThemedText style={[styles.cellText, { width: 44, textAlign: 'center', color: colors.text }]}>{cr.avgPitTime}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 32, textAlign: 'center', color: colors.text }]}>{cr.operationalDiscipline}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 40, textAlign: 'center', fontWeight: '700', color: colors.text }]}>{cr.pitScore}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 40, textAlign: 'right', fontWeight: '700', color: colors.text }]}>{cr.points}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

function WildcardTable({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const statusColor = (status: string) => {
    if (status === 'qualified') return '#22C55E';
    if (status === 'active') return '#1D9BF0';
    return '#A1A1AA';
  };

  return (
    <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.thText, { width: 28, color: colors.textSecondary }]}>#</ThemedText>
        <ThemedText style={[styles.thText, { flex: 1, color: colors.textSecondary }]}>Driver</ThemedText>
        <ThemedText style={[styles.thText, { width: 36, textAlign: 'center', color: colors.textSecondary }]}>Rds</ThemedText>
        <ThemedText style={[styles.thText, { width: 36, textAlign: 'center', color: colors.textSecondary }]}>Best</ThemedText>
        <ThemedText style={[styles.thText, { width: 50, textAlign: 'right', color: colors.textSecondary }]}>PTS</ThemedText>
      </View>
      {WILDCARD_CUP_STANDINGS.map((w) => (
        <Pressable
          key={w.position}
          style={[styles.row, w.position === 1 && { backgroundColor: accent + '12' }]}
          onPress={() => openDriverCard({ name: w.name, number: '', team: 'Wildcard', points: w.points })}
        >
          <ThemedText style={[styles.cellText, { width: 28, color: colors.textSecondary }]}>{w.position}</ThemedText>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.cellText, { color: w.position === 1 ? accent : colors.text, fontWeight: w.position <= 3 ? '700' : '400' }]}>
              {w.name}
            </ThemedText>
            <ThemedText style={[styles.teamLabel, { color: colors.textSecondary }]}>{w.car}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusColor(w.status) + '22' }]}>
              <ThemedText style={[styles.statusText, { color: statusColor(w.status) }]}>
                {w.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.cellText, { width: 36, textAlign: 'center', color: colors.text }]}>{w.rounds}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 36, textAlign: 'center', color: colors.text }]}>P{w.bestFinish}</ThemedText>
          <ThemedText style={[styles.cellText, { width: 50, textAlign: 'right', fontWeight: '700', color: colors.text }]}>{w.points}</ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

export function CompCalendarStandingsView({ colors, accent }: Props) {
  const [activeToggle, setActiveToggle] = useState<StandingsToggle>('Driver');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Toggle Bar */}
      <View style={styles.toggleBar}>
        {TOGGLES.map((t) => (
          <Pressable
            key={t}
            style={[styles.togglePill, activeToggle === t && { backgroundColor: accent }]}
            onPress={() => setActiveToggle(t)}
          >
            <ThemedText style={[styles.toggleText, { color: activeToggle === t ? '#000' : colors.textSecondary }]}>
              {t}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Standings Tables */}
      {activeToggle === 'Driver' && <DriverTable colors={colors} accent={accent} />}
      {activeToggle === 'Constructor' && <ConstructorTable colors={colors} accent={accent} />}
      {activeToggle === 'Crew' && <CrewTable colors={colors} accent={accent} />}
      {activeToggle === 'Wildcard Cup' && <WildcardTable colors={colors} accent={accent} />}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  toggleBar: { flexDirection: 'row', gap: 6, marginBottom: 14, flexWrap: 'wrap' },
  togglePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2F3336',
  },
  toggleText: { fontSize: 12, fontWeight: '600' },
  table: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  thText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  cellText: { fontSize: 13 },
  teamLabel: { fontSize: 10, marginTop: 1 },
  delta: { fontSize: 10, fontWeight: '600' },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    marginTop: 2,
  },
  statusText: { fontSize: 8, fontWeight: '700' },
  categoryBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  categoryText: { fontSize: 8, fontWeight: '700' },
});
