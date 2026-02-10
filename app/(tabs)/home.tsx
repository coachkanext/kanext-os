/**
 * Sports Home Screen (Front Page)
 *
 * Layout:
 * 1) Header Block - Team name, KR rating, records
 * 2) Current Status Card - Next/Last game, Today, Availability
 * 3) Program Context Preview - Roster/Scholarships/NIL + View button
 */

import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { TopBar } from '@/components/top-bar';
import { AvatarDrawer } from '@/components/avatar-drawer';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// =============================================================================
// DEMO DATA
// =============================================================================

const TEAM_DATA = {
  name: 'Lincoln Blue Tigers',
  season: '2025–26',
  kr: 84,
  record: {
    overall: '9–8',
    conference: '7–0',
    standing: '1st Place',
  },
};

const CURRENT_STATUS = {
  nextGame: {
    opponent: 'Cal Miramar',
    date: 'Sat, Feb 8',
    time: '2:00 PM',
    location: 'Home',
  },
  lastGame: {
    result: 'W',
    score: '78–65',
    opponent: 'Cal State East Bay',
  },
  today: 'Practice 3:30 PM • Film 6:00 PM',
  availability: {
    available: 12,
    out: 2,
    questionable: 1,
  },
};

const PROGRAM_CONTEXT = {
  rosterSpots: { current: 12, max: 15 },
  scholarships: { used: 11, available: 13 },
  nilPool: { total: 150000, committed: 50000 },
};

// =============================================================================
// HELPERS
// =============================================================================

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
};

// =============================================================================
// COMPONENT
// =============================================================================

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [drawerVisible, setDrawerVisible] = useState(false);

  const nilRemaining = PROGRAM_CONTEXT.nilPool.total - PROGRAM_CONTEXT.nilPool.committed;

  const handleViewProgramContext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/coach/more-resources' as never);
  }, [router]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TopBar onAvatarPress={() => setDrawerVisible(true)} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1) HEADER BLOCK ===== */}
        <View style={styles.headerBlock}>
          {/* Team Name + Season */}
          <View style={styles.teamRow}>
            <Text style={[styles.teamName, { color: colors.text }]}>
              {TEAM_DATA.name}
            </Text>
            <Text style={[styles.season, { color: colors.textSecondary }]}>
              {TEAM_DATA.season}
            </Text>
          </View>

          {/* KR Rating - Big number with small badge */}
          <View style={styles.krRow}>
            <Text style={[styles.krNumber, { color: colors.text }]}>
              {TEAM_DATA.kr}
            </Text>
            <View style={[styles.krBadge, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.krLabel, { color: colors.textSecondary }]}>KR</Text>
            </View>
          </View>

          {/* Records */}
          <Text style={[styles.recordsLine, { color: colors.textSecondary }]}>
            Overall: {TEAM_DATA.record.overall} · Conf: {TEAM_DATA.record.conference} · {TEAM_DATA.record.standing}
          </Text>
        </View>

        {/* ===== 2) CURRENT STATUS CARD ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            CURRENT STATUS
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Next Game */}
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Next Game
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {CURRENT_STATUS.nextGame.opponent} · {CURRENT_STATUS.nextGame.date} {CURRENT_STATUS.nextGame.time} · {CURRENT_STATUS.nextGame.location}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Last Game */}
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Last Game
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {CURRENT_STATUS.lastGame.result} {CURRENT_STATUS.lastGame.score} vs {CURRENT_STATUS.lastGame.opponent}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Today */}
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Today
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {CURRENT_STATUS.today}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Availability */}
            <View style={styles.statusRow}>
              <Text style={[styles.statusLabel, { color: colors.textSecondary }]}>
                Availability
              </Text>
              <Text style={[styles.statusValue, { color: colors.text }]}>
                {CURRENT_STATUS.availability.available} Available · {CURRENT_STATUS.availability.out} Out · {CURRENT_STATUS.availability.questionable} Questionable
              </Text>
            </View>
          </View>
        </View>

        {/* ===== 3) PROGRAM CONTEXT PREVIEW ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            TEAM SYSTEM
          </Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Roster Spots */}
            <View style={styles.contextRow}>
              <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
                Roster Spots
              </Text>
              <Text style={[styles.contextValue, { color: colors.text }]}>
                {PROGRAM_CONTEXT.rosterSpots.current} / {PROGRAM_CONTEXT.rosterSpots.max}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Scholarships */}
            <View style={styles.contextRow}>
              <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
                Scholarships
              </Text>
              <Text style={[styles.contextValue, { color: colors.text }]}>
                {PROGRAM_CONTEXT.scholarships.used} / {PROGRAM_CONTEXT.scholarships.available}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* NIL Pool */}
            <View style={styles.contextRow}>
              <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
                NIL Pool
              </Text>
              <Text style={[styles.contextValue, { color: colors.text }]}>
                {formatCurrency(PROGRAM_CONTEXT.nilPool.total)} / {formatCurrency(PROGRAM_CONTEXT.nilPool.committed)} / {formatCurrency(nilRemaining)}
              </Text>
            </View>
          </View>

          {/* View Program Context Button */}
          <Pressable
            style={({ pressed }) => [
              styles.viewButton,
              {
                backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary,
              },
            ]}
            onPress={handleViewProgramContext}
          >
            <Text style={[styles.viewButtonText, { color: colors.text }]}>
              View Team System
            </Text>
            <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>

      {/* Avatar Drawer */}
      <AvatarDrawer visible={drawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
  },

  // ===== HEADER BLOCK =====
  headerBlock: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 17,
    fontWeight: '600',
  },
  season: {
    fontSize: 14,
    fontWeight: '400',
  },
  krRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  krNumber: {
    fontSize: 56,
    fontWeight: '700',
    lineHeight: 64,
  },
  krBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  krLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  recordsLine: {
    fontSize: 14,
    fontWeight: '400',
  },

  // ===== SECTIONS =====
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // ===== CURRENT STATUS =====
  statusRow: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '400',
  },

  // ===== PROGRAM CONTEXT =====
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  contextLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  contextValue: {
    fontSize: 14,
    fontWeight: '400',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: 6,
  },
  viewButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
