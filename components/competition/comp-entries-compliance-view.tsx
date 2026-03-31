/**
 * Competition Entries -- Compliance View
 * Table-style list with status indicators for homologation, cap compliance, scrutineering, and tech delegate.
 */

import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { COMPLIANCE_DATA, type ComplianceRow } from '@/data/mock-competition-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type FilterKey = 'all' | 'issues' | 'clear';

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'issues', label: 'Issues' },
  { key: 'clear', label: 'Clear' },
];

function getHomologationColor(status: ComplianceRow['homologation']): string {
  switch (status) {
    case 'approved': return '#5A8A6E';
    case 'pending': return '#B8943E';
    case 'expired': return '#B85C5C';
  }
}

function getHomologationLabel(status: ComplianceRow['homologation']): string {
  switch (status) {
    case 'approved': return 'Approved';
    case 'pending': return 'Pending';
    case 'expired': return 'Expired';
  }
}

function getCapColor(status: ComplianceRow['capCompliance']): string {
  switch (status) {
    case 'green': return '#5A8A6E';
    case 'under_review': return '#B8943E';
    case 'flagged': return '#B85C5C';
  }
}

function getCapLabel(status: ComplianceRow['capCompliance']): string {
  switch (status) {
    case 'green': return 'Green';
    case 'under_review': return 'Under Review';
    case 'flagged': return 'Flagged';
  }
}

function getScrutColor(status: ComplianceRow['scrutineering']): string {
  switch (status) {
    case 'passed': return '#5A8A6E';
    case 'pending': return '#B8943E';
    case 'failed': return '#B85C5C';
  }
}

function getScrutLabel(status: ComplianceRow['scrutineering']): string {
  switch (status) {
    case 'passed': return 'Passed';
    case 'pending': return 'Pending';
    case 'failed': return 'Failed';
  }
}

function isFullyCompliant(row: ComplianceRow): boolean {
  return (
    row.homologation === 'approved' &&
    row.capCompliance === 'green' &&
    row.scrutineering === 'passed' &&
    row.techDelegateSignoff
  );
}

export function CompEntriesComplianceView({ colors, accent }: Props) {
  const [filter, setFilter] = useState<FilterKey>('all');

  const compliantCount = useMemo(() => COMPLIANCE_DATA.filter(isFullyCompliant).length, []);

  const filteredData = useMemo(() => {
    switch (filter) {
      case 'issues': return COMPLIANCE_DATA.filter((r) => !isFullyCompliant(r));
      case 'clear': return COMPLIANCE_DATA.filter(isFullyCompliant);
      default: return COMPLIANCE_DATA;
    }
  }, [filter]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Summary header */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.summaryTitle, { color: colors.text }]}>
          Compliance Overview
        </ThemedText>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: '#5A8A6E' }]}>{compliantCount}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Compliant</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: '#B85C5C' }]}>
              {COMPLIANCE_DATA.length - compliantCount}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Issues</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>{COMPLIANCE_DATA.length}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Total</ThemedText>
          </View>
        </View>
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
      >
        {FILTER_PILLS.map((pill) => {
          const active = filter === pill.key;
          return (
            <Pressable
              key={pill.key}
              style={[
                styles.filterPill,
                { borderColor: active ? accent : colors.border },
                active && { backgroundColor: accent + '18' },
              ]}
              onPress={() => setFilter(pill.key)}
            >
              <ThemedText
                style={[
                  styles.filterPillText,
                  { color: active ? accent : colors.textSecondary },
                ]}
              >
                {pill.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Table header */}
      <View style={[styles.tableHeader, { borderColor: colors.border }]}>
        <ThemedText style={[styles.thTeam, { color: colors.textSecondary }]}>Driver / Team</ThemedText>
        <ThemedText style={[styles.thCol, { color: colors.textSecondary }]}>Homolog.</ThemedText>
        <ThemedText style={[styles.thCol, { color: colors.textSecondary }]}>Cap</ThemedText>
        <ThemedText style={[styles.thCol, { color: colors.textSecondary }]}>Scrut.</ThemedText>
        <ThemedText style={[styles.thCol, { color: colors.textSecondary }]}>Tech Del.</ThemedText>
      </View>

      {/* Table rows */}
      {filteredData.map((row) => (
        <Pressable
          key={row.id}
          style={[
            styles.tableRow,
            { backgroundColor: colors.card, borderColor: colors.border },
            !isFullyCompliant(row) && styles.tableRowIssue,
          ]}
        >
          {/* Driver + Team */}
          <View style={styles.driverCol}>
            <ThemedText style={[styles.driverName, { color: colors.text }]}>{row.driver}</ThemedText>
            <ThemedText style={[styles.teamName, { color: colors.textSecondary }]}>{row.team}</ThemedText>
          </View>

          {/* Homologation */}
          <View style={styles.dotCol}>
            <View style={[styles.statusDot, { backgroundColor: getHomologationColor(row.homologation) }]} />
            <ThemedText style={[styles.dotLabel, { color: getHomologationColor(row.homologation) }]}>
              {getHomologationLabel(row.homologation)}
            </ThemedText>
          </View>

          {/* Cap Compliance */}
          <View style={styles.dotCol}>
            <View style={[styles.statusDot, { backgroundColor: getCapColor(row.capCompliance) }]} />
            <ThemedText style={[styles.dotLabel, { color: getCapColor(row.capCompliance) }]}>
              {getCapLabel(row.capCompliance)}
            </ThemedText>
          </View>

          {/* Scrutineering */}
          <View style={styles.dotCol}>
            <View style={[styles.statusDot, { backgroundColor: getScrutColor(row.scrutineering) }]} />
            <ThemedText style={[styles.dotLabel, { color: getScrutColor(row.scrutineering) }]}>
              {getScrutLabel(row.scrutineering)}
            </ThemedText>
          </View>

          {/* Tech Delegate */}
          <View style={styles.dotCol}>
            <View style={[styles.statusDot, { backgroundColor: row.techDelegateSignoff ? '#5A8A6E' : '#B85C5C' }]} />
            <ThemedText style={[styles.dotLabel, { color: row.techDelegateSignoff ? '#5A8A6E' : '#B85C5C' }]}>
              {row.techDelegateSignoff ? 'Yes' : 'No'}
            </ThemedText>
          </View>
        </Pressable>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  summaryTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 24, fontWeight: '700' },
  summaryLabel: { fontSize: 11, marginTop: 2 },
  filterScroll: { marginBottom: 14 },
  filterRow: { gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    marginBottom: 2,
  },
  thTeam: { flex: 1, fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  thCol: { width: 52, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  tableRowIssue: { borderLeftWidth: 3, borderLeftColor: '#B85C5C' },
  driverCol: { flex: 1 },
  driverName: { fontSize: 13, fontWeight: '600' },
  teamName: { fontSize: 10, marginTop: 1 },
  dotCol: { width: 52, alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotLabel: { fontSize: 7, fontWeight: '600', marginTop: 2, textAlign: 'center' },
});
