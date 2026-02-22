/**
 * Calendar Standings View — 3-tier standings
 * Tier 1: Conference (KaNeXT Conference)
 * Tier 2: NAIA Top 25
 * Tier 3: KaNeXT National Rankings (cross-level by KR)
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  getStandings,
  NAIA_TOP_25,
  KaNeXT_NAIA_POSITION,
  KANEXT_NATIONAL_TOP_50,
  KaNeXT_NATIONAL_POSITION,
  type RankingRow,
} from '@/data/mock-calendar-v2';
import { openTeamCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function TeamRow({ row, colors, accent }: { row: RankingRow; colors: typeof Colors.light; accent: string }) {
  return (
    <Pressable
      style={[styles.row, row.isUs && { backgroundColor: accent + '18' }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        openTeamCard({ name: row.team, conference: '', record: row.record, kr: row.kr ?? 0 });
      }}
    >
      <ThemedText style={[styles.rank, { color: colors.textSecondary }]}>{row.rank}</ThemedText>
      <View style={{ flex: 1 }}>
        <ThemedText style={[styles.teamName, { color: row.isUs ? accent : colors.text, fontWeight: row.isUs ? '700' : '400' }]}>
          {row.team}
        </ThemedText>
      </View>
      {row.level && (
        <View style={[styles.levelBadge, { backgroundColor: '#ffffff08' }]}>
          <ThemedText style={[styles.levelText, { color: colors.textSecondary }]}>{row.level}</ThemedText>
        </View>
      )}
      <ThemedText style={[styles.record, { color: colors.text }]}>{row.record}</ThemedText>
      {row.kr != null && (
        <View style={styles.krBadge}>
          <ThemedText style={styles.krText}>{row.kr}</ThemedText>
        </View>
      )}
    </Pressable>
  );
}

export function CalendarStandingsView({ colors, accent }: Props) {
  const confStandings = getStandings();

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Tier 1: Conference */}
      <ThemedText style={[styles.tierHeader, { color: accent }]}>SUN CONFERENCE</ThemedText>
      <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tableHeader}>
          <ThemedText style={[styles.thText, { flex: 0.08, color: colors.textSecondary }]}>#</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.4, color: colors.textSecondary }]}>Team</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.15, textAlign: 'center', color: colors.textSecondary }]}>Conf</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.2, textAlign: 'center', color: colors.textSecondary }]}>Overall</ThemedText>
          <ThemedText style={[styles.thText, { flex: 0.15, textAlign: 'center', color: colors.textSecondary }]}>Strk</ThemedText>
        </View>
        {confStandings.map((row) => (
          <Pressable
            key={row.team}
            style={[styles.confRow, row.isUs && { backgroundColor: accent + '18' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openTeamCard({ name: row.team, conference: 'KaNeXT Conference', record: `${row.overallW}-${row.overallL}`, kr: 0 });
            }}
          >
            <ThemedText style={[styles.srText, { flex: 0.08, color: colors.text }]}>{row.rank}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.4, color: row.isUs ? accent : colors.text, fontWeight: row.isUs ? '700' : '400' }]}>{row.team}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.15, textAlign: 'center', color: colors.text }]}>{row.confW}-{row.confL}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.2, textAlign: 'center', color: colors.text }]}>{row.overallW}-{row.overallL}</ThemedText>
            <ThemedText style={[styles.srText, { flex: 0.15, textAlign: 'center', color: colors.text }]}>{row.streak}</ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Tier 2: NAIA Top 25 */}
      <ThemedText style={[styles.tierHeader, { color: accent, marginTop: 24 }]}>NAIA TOP 25</ThemedText>
      <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {NAIA_TOP_25.map((row) => (
          <TeamRow key={row.rank} row={row} colors={colors} accent={accent} />
        ))}
        {/* KaNeXT separator */}
        <View style={styles.separator}>
          <ThemedText style={[styles.separatorText, { color: colors.textSecondary }]}>
            ··· {FMU_NAIA_POSITION.rank}. {FMU_NAIA_POSITION.team} · {FMU_NAIA_POSITION.record} · KR {FMU_NAIA_POSITION.kr}
          </ThemedText>
        </View>
      </View>

      {/* Tier 3: KaNeXT National */}
      <ThemedText style={[styles.tierHeader, { color: accent, marginTop: 24 }]}>KANEXT NATIONAL</ThemedText>
      <ThemedText style={[styles.tierSubheader, { color: colors.textSecondary }]}>Cross-level rankings by KR</ThemedText>
      <View style={[styles.table, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {KANEXT_NATIONAL_TOP_50.map((row) => (
          <TeamRow key={row.rank} row={row} colors={colors} accent={accent} />
        ))}
        {/* KaNeXT separator */}
        <View style={styles.separator}>
          <ThemedText style={[styles.separatorText, { color: colors.textSecondary }]}>
            ··· {FMU_NATIONAL_POSITION.rank}. {FMU_NATIONAL_POSITION.team} · {FMU_NATIONAL_POSITION.record} · KR {FMU_NATIONAL_POSITION.kr} · {FMU_NATIONAL_POSITION.level}
          </ThemedText>
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  tierHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  tierSubheader: { fontSize: 11, marginBottom: 8, marginTop: -4 },
  table: { borderRadius: 12, borderWidth: 1, overflow: 'hidden' },
  tableHeader: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  thText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  confRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10 },
  srText: { fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  rank: { width: 28, fontSize: 12, fontWeight: '600' },
  teamName: { fontSize: 13 },
  record: { fontSize: 12, width: 50, textAlign: 'right' },
  levelBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelText: { fontSize: 9, fontWeight: '700' },
  krBadge: { backgroundColor: '#ffffff0C', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginLeft: 4 },
  krText: { fontSize: 12, fontWeight: '700', color: '#f5f5f5' },
  separator: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    borderStyle: 'dashed',
  },
  separatorText: { fontSize: 12, fontStyle: 'italic' },
});
