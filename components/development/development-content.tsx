/**
 * Development Content — Player development tracking dashboard hub tab.
 * Shows development plans per rostered player with focus areas and progress.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MOCK_ROSTER } from '@/data/mock-roster';
import { ENGINES } from '@/data/mock-enterprise-v2';

const ACCENT_GOLD = '#FFFFFF';

type ProgressLevel = 'needs-work' | 'progressing' | 'achieved';

interface DevelopmentPlan {
  playerId: string;
  focusAreas: string[];
  progress: ProgressLevel;
  coachNote: string;
}

const PLAYER_DEVELOPMENT_PLANS: DevelopmentPlan[] = [
  { playerId: '1', focusAreas: ['PnR Decision-Making', 'Transition D', 'Free Throws'], progress: 'progressing', coachNote: 'Elite court vision, tightening turnover rate in late-clock situations.' },
  { playerId: '2', focusAreas: ['Off-Screen Movement', 'Ball Screen D'], progress: 'progressing', coachNote: 'Improved catch-and-shoot consistency. Needs lateral quickness on switches.' },
  { playerId: '3', focusAreas: ['3PT Shooting', 'Post Footwork'], progress: 'needs-work', coachNote: 'Athletic upside is there, but perimeter shot needs mechanical work.' },
  { playerId: '10', focusAreas: ['Defensive Positioning', 'Conditioning'], progress: 'needs-work', coachNote: 'Showing promise in practice reps. Building toward rotation minutes.' },
  { playerId: '4', focusAreas: ['Rim Protection', 'Pick & Pop'], progress: 'progressing', coachNote: 'Stretching the floor effectively. Block timing improving.' },
  { playerId: '5', focusAreas: ['Rim Finishing', 'FT Shooting', 'Passing'], progress: 'achieved', coachNote: 'Anchor of the defense. FT% up 12 points from last year.' },
  { playerId: '6', focusAreas: ['Ball Handling', 'Leadership'], progress: 'progressing', coachNote: 'Vocal leader. Working on tighter handle in full-court pressure.' },
  { playerId: '7', focusAreas: ['Defensive Awareness', 'Pull-Up 3s'], progress: 'needs-work', coachNote: 'Pure shooter. Adding off-dribble dimension to his game.' },
  { playerId: '8', focusAreas: ['On-Ball D', 'Rebounding', 'Transition'], progress: 'achieved', coachNote: 'Defensive stopper. Versatile enough to guard 1-through-4.' },
  { playerId: '9', focusAreas: ['Post Moves', 'Conditioning', 'FT Shooting'], progress: 'progressing', coachNote: 'Double-double machine. Needs to stay on the floor late in games.' },
];

const PROGRESS_CONFIG: Record<ProgressLevel, { label: string; color: string; icon: string }> = {
  'needs-work': { label: 'Needs Work', color: Brand.error, icon: 'circle' },
  'progressing': { label: 'Progressing', color: ACCENT_GOLD, icon: 'circle.lefthalf.filled' },
  'achieved': { label: 'Achieved', color: Brand.success, icon: 'checkmark.circle.fill' },
};

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

export function DevelopmentContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const engine06 = ENGINES.find((e) => e.id === 'engine-06');
  const activePlans = PLAYER_DEVELOPMENT_PLANS.length;

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Overview Card */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.overviewHeader}>
          <View style={[styles.overviewIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
            <IconSymbol name="arrow.up.right" size={20} color={ACCENT_GOLD} />
          </View>
          <View style={styles.overviewInfo}>
            <ThemedText style={styles.overviewTitle}>Development Intelligence</ThemedText>
            <ThemedText style={[styles.overviewSub, { color: colors.textSecondary }]}>
              {engine06?.purpose || 'Tracks player growth and recommends development priorities.'}
            </ThemedText>
          </View>
        </View>
        <View style={[styles.overviewFooter, { borderTopColor: colors.border }]}>
          <View style={styles.overviewStat}>
            <ThemedText style={[styles.overviewStatValue, { color: ACCENT_GOLD }]}>{activePlans}</ThemedText>
            <ThemedText style={[styles.overviewStatLabel, { color: colors.textTertiary }]}>Active Plans</ThemedText>
          </View>
          <View style={styles.overviewStat}>
            <ThemedText style={[styles.overviewStatValue, { color: Brand.success }]}>
              {PLAYER_DEVELOPMENT_PLANS.filter((p) => p.progress === 'achieved').length}
            </ThemedText>
            <ThemedText style={[styles.overviewStatLabel, { color: colors.textTertiary }]}>Achieved</ThemedText>
          </View>
          <View style={styles.overviewStat}>
            <ThemedText style={[styles.overviewStatValue, { color: Brand.error }]}>
              {PLAYER_DEVELOPMENT_PLANS.filter((p) => p.progress === 'needs-work').length}
            </ThemedText>
            <ThemedText style={[styles.overviewStatLabel, { color: colors.textTertiary }]}>Needs Work</ThemedText>
          </View>
        </View>
      </View>

      {/* Player Development Cards */}
      <SectionLabel title="PLAYER DEVELOPMENT PLANS" colors={colors} />
      {PLAYER_DEVELOPMENT_PLANS.map((plan) => {
        const player = MOCK_ROSTER.find((p) => p.id === plan.playerId);
        if (!player) return null;
        const progressConfig = PROGRESS_CONFIG[plan.progress];

        return (
          <View key={plan.playerId} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Header */}
            <View style={styles.playerHeader}>
              <View style={styles.playerNameRow}>
                <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                <ThemedText style={[styles.playerMeta, { color: colors.textTertiary }]}>
                  #{player.number} • {player.position}
                </ThemedText>
              </View>
              <View style={[styles.progressBadge, { backgroundColor: progressConfig.color + '20' }]}>
                <IconSymbol name={progressConfig.icon as any} size={12} color={progressConfig.color} />
                <ThemedText style={[styles.progressText, { color: progressConfig.color }]}>
                  {progressConfig.label}
                </ThemedText>
              </View>
            </View>

            {/* Focus Areas */}
            <View style={styles.focusTags}>
              {plan.focusAreas.map((area, i) => (
                <View key={i} style={[styles.focusTag, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[styles.focusTagText, { color: colors.textSecondary }]}>{area}</ThemedText>
                </View>
              ))}
            </View>

            {/* Coach Note */}
            <ThemedText style={[styles.coachNote, { color: colors.textTertiary }]}>
              {plan.coachNote}
            </ThemedText>
          </View>
        );
      })}

      {/* Ask Nexus */}
      <AskNexusCTA label="Get Development Recommendations" engineContext="development" />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },

  // Overview
  overviewHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  overviewIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  overviewInfo: { flex: 1 },
  overviewTitle: { fontSize: 16, fontWeight: '700' },
  overviewSub: { fontSize: 13, lineHeight: 18, marginTop: 4 },
  overviewFooter: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    justifyContent: 'space-around',
  },
  overviewStat: { alignItems: 'center' },
  overviewStatValue: { fontSize: 20, fontWeight: '800' },
  overviewStatLabel: { fontSize: 11, marginTop: 2, textTransform: 'uppercase', letterSpacing: 0.3 },

  // Player Card
  playerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  playerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  playerNameRow: {},
  playerName: { fontSize: 15, fontWeight: '600' },
  playerMeta: { fontSize: 12, marginTop: 2 },
  progressBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  progressText: { fontSize: 11, fontWeight: '700' },

  // Focus Tags
  focusTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: Spacing.sm },
  focusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  focusTagText: { fontSize: 12, fontWeight: '500' },

  // Coach Note
  coachNote: { fontSize: 13, lineHeight: 18, marginTop: Spacing.sm },
});
