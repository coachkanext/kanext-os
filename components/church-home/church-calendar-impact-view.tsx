/**
 * Church Calendar — Impact View
 * 3 sections: Attendance, Giving, Growth metrics.
 * 6-month historical data with summary cards and breakdowns.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { ATTENDANCE_DATA, GIVING_DATA, GROWTH_METRICS } from '@/data/mock-church-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

function fmt(n: number): string {
  return n.toLocaleString('en-US');
}

function fmtCurrency(n: number): string {
  return '$' + n.toLocaleString('en-US');
}

export function ChurchCalendarImpactView({ colors, accent }: Props) {
  const latestAttendance = ATTENDANCE_DATA[ATTENDANCE_DATA.length - 1];
  const prevAttendance = ATTENDANCE_DATA[ATTENDANCE_DATA.length - 2];
  const attendanceTrend = latestAttendance.total >= prevAttendance.total ? 'up' : 'down';
  const attendanceDelta = latestAttendance.total - prevAttendance.total;

  const latestGiving = GIVING_DATA[GIVING_DATA.length - 1];

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* ── ATTENDANCE ── */}
      <ThemedText style={[styles.sectionHeader, { color: accent }]}>ATTENDANCE</ThemedText>
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          {latestAttendance.month} Total
        </ThemedText>
        <View style={styles.summaryRow}>
          <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
            {fmt(latestAttendance.total)}
          </ThemedText>
          <ThemedText style={[styles.trendText, { color: attendanceTrend === 'up' ? '#22C55E' : '#EF4444' }]}>
            {attendanceTrend === 'up' ? '\u2191' : '\u2193'} {Math.abs(attendanceDelta)}
          </ThemedText>
        </View>
      </View>

      {ATTENDANCE_DATA.map((m) => {
        const inPersonPct = Math.round((m.inPerson / m.total) * 100);
        const onlinePct = 100 - inPersonPct;
        return (
          <View key={m.month} style={[styles.barRow, { borderColor: colors.border }]}>
            <ThemedText style={[styles.barLabel, { color: colors.textSecondary }]}>{m.month}</ThemedText>
            <View style={styles.barTrack}>
              <View style={[styles.barFill, { width: `${inPersonPct}%`, backgroundColor: accent }]} />
              <View style={[styles.barFill, { width: `${onlinePct}%`, backgroundColor: '#3B82F6' }]} />
            </View>
            <ThemedText style={[styles.barValue, { color: colors.text }]}>{fmt(m.total)}</ThemedText>
          </View>
        );
      })}
      <View style={styles.legendRow}>
        <View style={[styles.legendDot, { backgroundColor: accent }]} />
        <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>In-Person</ThemedText>
        <View style={[styles.legendDot, { backgroundColor: '#3B82F6', marginLeft: 12 }]} />
        <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>Online</ThemedText>
      </View>

      {/* ── GIVING ── */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 24 }]}>GIVING</ThemedText>
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>
          {latestGiving.month} Total
        </ThemedText>
        <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
          {fmtCurrency(latestGiving.total)}
        </ThemedText>
      </View>

      {GIVING_DATA.map((m) => (
        <View key={m.month} style={[styles.givingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.givingMonth, { color: colors.text }]}>{m.month}</ThemedText>
          <View style={styles.givingBreakdown}>
            <ThemedText style={[styles.givingItem, { color: colors.textSecondary }]}>
              Tithes: {fmtCurrency(m.tithes)}
            </ThemedText>
            <ThemedText style={[styles.givingItem, { color: colors.textSecondary }]}>
              Offerings: {fmtCurrency(m.offerings)}
            </ThemedText>
            <ThemedText style={[styles.givingItem, { color: colors.textSecondary }]}>
              Missions: {fmtCurrency(m.missions)}
            </ThemedText>
          </View>
          <ThemedText style={[styles.givingTotal, { color: accent }]}>{fmtCurrency(m.total)}</ThemedText>
        </View>
      ))}

      {/* ── GROWTH ── */}
      <ThemedText style={[styles.sectionHeader, { color: accent, marginTop: 24 }]}>GROWTH</ThemedText>
      <View style={[styles.growthCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.growthPeriod, { color: colors.textSecondary }]}>
          {GROWTH_METRICS.period}
        </ThemedText>
        <View style={styles.growthGrid}>
          {[
            { label: 'Baptisms', value: GROWTH_METRICS.baptisms },
            { label: 'Visitors', value: GROWTH_METRICS.firstTimeVisitors },
            { label: 'New Members', value: GROWTH_METRICS.newMembers },
            { label: 'Salvations', value: GROWTH_METRICS.salvationDecisions },
          ].map((item) => (
            <View key={item.label} style={styles.growthItem}>
              <ThemedText style={[styles.growthValue, { color: colors.text }]}>{item.value}</ThemedText>
              <ThemedText style={[styles.growthLabel, { color: colors.textSecondary }]}>
                {item.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  sectionHeader: { fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  summaryValue: { fontSize: 28, fontWeight: '800' },
  trendText: { fontSize: 14, fontWeight: '700' },
  barRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 8 },
  barLabel: { width: 72, fontSize: 11 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.04)' },
  barFill: { height: 8 },
  barValue: { width: 48, fontSize: 11, fontWeight: '600', textAlign: 'right' },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, marginBottom: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  legendText: { fontSize: 10 },
  givingRow: { borderRadius: 10, borderWidth: 1, padding: 12, marginBottom: 6 },
  givingMonth: { fontSize: 13, fontWeight: '700', marginBottom: 4 },
  givingBreakdown: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  givingItem: { fontSize: 11 },
  givingTotal: { fontSize: 14, fontWeight: '700' },
  growthCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  growthPeriod: { fontSize: 11, marginBottom: 12, textAlign: 'center' },
  growthGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  growthItem: { alignItems: 'center' },
  growthValue: { fontSize: 24, fontWeight: '800' },
  growthLabel: { fontSize: 10, marginTop: 2 },
});
