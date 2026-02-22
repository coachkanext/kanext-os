/**
 * Program Overview — Identity, snapshot, today/next, health, pinned intel.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  PROGRAM_IDENTITY,
  PROGRAM_SNAPSHOT,
  QUICK_ACTIONS,
  TODAY_NEXT,
  PROGRAM_HEALTH,
  PINNED_INTEL,
} from '@/data/mock-program-v2';
import type { PinnedIntel } from '@/data/mock-program-v2';

const ACCENT = '#FFFFFF';

const INTEL_ICONS: Record<PinnedIntel['type'], string> = {
  sim: 'wand.and.stars',
  'game-plan': 'doc.text.fill',
  'dev-plan': 'arrow.up.right',
};

function SectionLabel({ text, colors }: { text: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</ThemedText>
  );
}

function getHealthColor(value: number): string {
  if (value >= 80) return '#22C55E';
  if (value >= 60) return '#F59E0B';
  return '#EF4444';
}

function getComplianceColor(status: string): string {
  if (status === 'compliant') return '#22C55E';
  if (status === 'warning') return '#F59E0B';
  return '#EF4444';
}

function getComplianceLabel(status: string): string {
  if (status === 'compliant') return 'COMPLIANT';
  if (status === 'warning') return 'WARNING';
  return 'VIOLATION';
}

export function ProgramOverview() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Program Identity Header */}
      <View style={[styles.identityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.identityRow}>
          <View style={styles.initialsCircle}>
            <ThemedText style={styles.initialsText}>{PROGRAM_IDENTITY.initials}</ThemedText>
          </View>
          <View style={styles.identityInfo}>
            <ThemedText style={styles.orgName}>{PROGRAM_IDENTITY.organization}</ThemedText>
            <View style={styles.identityMeta}>
              <View style={[styles.levelBadge, { backgroundColor: ACCENT + '15' }]}>
                <ThemedText style={[styles.levelText, { color: ACCENT }]}>
                  {PROGRAM_IDENTITY.level}
                </ThemedText>
              </View>
              <ThemedText style={[styles.metaText, { color: colors.textSecondary }]}>
                {PROGRAM_IDENTITY.conference}
              </ThemedText>
            </View>
            <ThemedText style={[styles.metaText, { color: colors.textTertiary }]}>
              {PROGRAM_IDENTITY.governingBody} {'\u00B7'} {PROGRAM_IDENTITY.location}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Active Season / Active Team */}
      <ThemedText style={[styles.seasonLine, { color: colors.textSecondary }]}>
        2025-26 {'\u00B7'} Varsity + JV
      </ThemedText>

      {/* Quick Actions */}
      <SectionLabel text="QUICK ACTIONS" colors={colors} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsRow}
        style={styles.quickActionsScroll}
      >
        {QUICK_ACTIONS.map((action) => (
          <Pressable
            key={action.id}
            style={[styles.quickActionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={action.icon as any} size={20} color={ACCENT} />
            <ThemedText style={[styles.quickActionLabel, { color: colors.text }]}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Program Snapshot */}
      <SectionLabel text="PROGRAM SNAPSHOT" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.snapshotRow}>
          {[
            { label: 'Teams', value: String(PROGRAM_SNAPSHOT.teamsCount) },
            { label: 'Roster', value: String(PROGRAM_SNAPSHOT.rosterTotal) },
            { label: 'Staff', value: String(PROGRAM_SNAPSHOT.staffCount) },
            { label: 'Updated', value: PROGRAM_SNAPSHOT.lastUpdated },
          ].map((stat) => (
            <View key={stat.label} style={styles.snapshotStat}>
              <ThemedText style={[styles.snapshotValue, { color: ACCENT }]}>{stat.value}</ThemedText>
              <ThemedText style={[styles.snapshotLabel, { color: colors.textTertiary }]}>
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Today / Next */}
      <SectionLabel text="TODAY / NEXT" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.todayRow}>
          <View style={[styles.todayIcon, { backgroundColor: ACCENT + '20' }]}>
            <IconSymbol name="calendar" size={16} color={ACCENT} />
          </View>
          <View style={styles.todayInfo}>
            <ThemedText style={styles.todayLabel}>Next Event</ThemedText>
            <ThemedText style={[styles.todayValue, { color: colors.text }]}>
              {TODAY_NEXT.nextEvent}
            </ThemedText>
            <ThemedText style={[styles.todayMeta, { color: colors.textTertiary }]}>
              {TODAY_NEXT.nextEventTime}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.todayRow}>
          <View style={[styles.todayIcon, { backgroundColor: ACCENT + '15' }]}>
            <IconSymbol name="sportscourt.fill" size={16} color={ACCENT} />
          </View>
          <View style={styles.todayInfo}>
            <ThemedText style={styles.todayLabel}>Next Game</ThemedText>
            <ThemedText style={[styles.todayValue, { color: colors.text }]}>
              {TODAY_NEXT.nextGame}
            </ThemedText>
            <ThemedText style={[styles.todayMeta, { color: colors.textTertiary }]}>
              {TODAY_NEXT.nextGameDate}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.divider }]} />
        <View style={styles.todayRow}>
          <View style={[styles.todayIcon, { backgroundColor: '#22C55E' + '20' }]}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
          </View>
          <View style={styles.todayInfo}>
            <ThemedText style={styles.todayLabel}>Last Result</ThemedText>
            <ThemedText style={[styles.todayValue, { color: colors.text }]}>
              {TODAY_NEXT.lastResult}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Program Health */}
      <SectionLabel text="PROGRAM HEALTH" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Availability */}
        <View style={styles.healthRow}>
          <ThemedText style={[styles.healthLabel, { color: colors.textSecondary }]}>
            Availability
          </ThemedText>
          <ThemedText style={[styles.healthValue, { color: getHealthColor(PROGRAM_HEALTH.availability) }]}>
            {PROGRAM_HEALTH.availability}%
          </ThemedText>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${PROGRAM_HEALTH.availability}%`,
                backgroundColor: getHealthColor(PROGRAM_HEALTH.availability),
              },
            ]}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: Spacing.sm }]} />

        {/* Compliance */}
        <View style={styles.healthRow}>
          <ThemedText style={[styles.healthLabel, { color: colors.textSecondary }]}>
            Compliance
          </ThemedText>
          <View style={[styles.complianceBadge, { backgroundColor: getComplianceColor(PROGRAM_HEALTH.compliance) + '20' }]}>
            <ThemedText style={[styles.complianceText, { color: getComplianceColor(PROGRAM_HEALTH.compliance) }]}>
              {getComplianceLabel(PROGRAM_HEALTH.compliance)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.divider, { backgroundColor: colors.divider, marginVertical: Spacing.sm }]} />

        {/* Rotation Stability */}
        <View style={styles.healthRow}>
          <ThemedText style={[styles.healthLabel, { color: colors.textSecondary }]}>
            Rotation Stability
          </ThemedText>
          <ThemedText style={[styles.healthValue, { color: getHealthColor(PROGRAM_HEALTH.rotationStability) }]}>
            {PROGRAM_HEALTH.rotationStability}%
          </ThemedText>
        </View>
        <View style={styles.barTrack}>
          <View
            style={[
              styles.barFill,
              {
                width: `${PROGRAM_HEALTH.rotationStability}%`,
                backgroundColor: getHealthColor(PROGRAM_HEALTH.rotationStability),
              },
            ]}
          />
        </View>
      </View>

      {/* Pinned Intelligence */}
      <SectionLabel text="PINNED INTELLIGENCE" colors={colors} />
      {PINNED_INTEL.map((item) => (
        <Pressable
          key={item.id}
          style={[styles.pinnedRow, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <View style={[styles.pinnedIcon, { backgroundColor: ACCENT + '10' }]}>
            <IconSymbol name={INTEL_ICONS[item.type] as any} size={16} color={ACCENT} />
          </View>
          <View style={styles.pinnedInfo}>
            <ThemedText style={styles.pinnedTitle}>{item.title}</ThemedText>
            <ThemedText style={[styles.pinnedDate, { color: colors.textTertiary }]}>
              {item.date}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Identity
  identityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  initialsCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ACCENT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initialsText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  identityInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  identityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },
  levelBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  levelText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  metaText: {
    fontSize: 13,
  },

  // Season
  seasonLine: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },

  // Section label
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // Quick Actions
  quickActionsScroll: {
    marginBottom: Spacing.sm,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickActionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    minWidth: 80,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Card
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Snapshot
  snapshotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  snapshotStat: {
    alignItems: 'center',
    flex: 1,
  },
  snapshotValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  snapshotLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },

  // Today / Next
  todayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  todayIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayInfo: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    color: '#A1A1AA',
  },
  todayValue: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 1,
  },
  todayMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },

  // Health
  healthRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  healthLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  healthValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2F3336',
    overflow: 'hidden',
  },
  barFill: {
    height: 6,
    borderRadius: 3,
  },
  complianceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  complianceText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Pinned Intel
  pinnedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pinnedIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinnedInfo: {
    flex: 1,
  },
  pinnedTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  pinnedDate: {
    fontSize: 12,
    marginTop: 1,
  },
});
