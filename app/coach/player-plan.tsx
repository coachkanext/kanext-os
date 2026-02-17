/**
 * Player Plan Detail Screen — Full development plan for a single player.
 * Accessed from Development hub → Position Groups → Player card.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PLAYER_PLANS } from '@/data/mock-development-v2';
import type { ProgressLevel } from '@/data/mock-development-v2';

const ACCENT = '#FFFFFF';

const PROGRESS_CONFIG: Record<ProgressLevel, { label: string; color: string }> = {
  'needs-work': { label: 'Needs Work', color: Brand.error },
  'progressing': { label: 'Progressing', color: ACCENT },
  'achieved': { label: 'Achieved', color: Brand.success },
};

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{title}</ThemedText>
  );
}

export default function PlayerPlanScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { playerId } = useLocalSearchParams<{ playerId: string }>();

  const plan = PLAYER_PLANS.find(p => p.playerId === playerId);

  if (!plan) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Player Plan</ThemedText>
          <View style={{ width: 20 }} />
        </View>
        <View style={styles.empty}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>Player plan not found.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const prog = PROGRESS_CONFIG[plan.progress];

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <ThemedText style={[styles.headerTitle, { color: colors.text }]}>Player Plan</ThemedText>
        <View style={{ width: 20 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Identity */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.identityRow}>
            <View style={[styles.avatar, { backgroundColor: ACCENT + '15' }]}>
              <ThemedText style={[styles.avatarText, { color: ACCENT }]}>#{plan.number}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.playerName, { color: colors.text }]}>{plan.playerName}</ThemedText>
              <ThemedText style={[styles.playerMeta, { color: colors.textTertiary }]}>{plan.position} • {plan.roleTarget}</ThemedText>
            </View>
            <View style={[styles.progressBadge, { backgroundColor: prog.color + '20' }]}>
              <ThemedText style={[styles.progressText, { color: prog.color }]}>{prog.label}</ThemedText>
            </View>
          </View>
        </View>

        {/* Top Gaps */}
        <SectionLabel title="TOP GAPS" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {plan.topGaps.map((gap, i) => (
            <View key={i} style={[styles.gapRow, i < plan.topGaps.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <View style={[styles.gapDot, { backgroundColor: Brand.error }]} />
              <ThemedText style={[styles.gapText, { color: colors.text }]}>{gap}</ThemedText>
            </View>
          ))}
        </View>

        {/* Plan Blocks */}
        <SectionLabel title="DEVELOPMENT PLAN" colors={colors} />
        {plan.planBlocks.map((block) => {
          const blockProg = PROGRESS_CONFIG[block.status];
          return (
            <View key={block.id} style={[styles.card, styles.blockCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.blockHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.blockTitle, { color: colors.text }]}>{block.title}</ThemedText>
                  <ThemedText style={[styles.blockMeta, { color: colors.textTertiary }]}>{block.cluster} • {block.trait}</ThemedText>
                </View>
                <View style={[styles.progressBadge, { backgroundColor: blockProg.color + '20' }]}>
                  <ThemedText style={[styles.progressText, { color: blockProg.color }]}>{blockProg.label}</ThemedText>
                </View>
              </View>
              <ThemedText style={[styles.blockTarget, { color: colors.textTertiary }]}>Target: {block.targetDate}</ThemedText>
              <View style={styles.drillTags}>
                {block.drills.map((drill, i) => (
                  <View key={i} style={[styles.drillTag, { backgroundColor: colors.backgroundTertiary }]}>
                    <ThemedText style={[styles.drillTagText, { color: colors.textSecondary }]}>{drill}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          );
        })}

        {/* Measurables */}
        <SectionLabel title="KEY MEASURABLES" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {plan.measurables.map((m, i) => (
            <View key={i} style={[styles.measRow, i < plan.measurables.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
              <ThemedText style={[styles.measName, { color: colors.text }]}>{m.name}</ThemedText>
              <ThemedText style={[styles.measCurrent, { color: colors.textSecondary }]}>{m.current}</ThemedText>
              <IconSymbol name="arrow.right" size={10} color={colors.textTertiary} />
              <ThemedText style={[styles.measTarget, { color: ACCENT }]}>{m.target}</ThemedText>
              <ThemedText style={[styles.measDelta, { color: Brand.success }]}>{m.delta}</ThemedText>
            </View>
          ))}
        </View>

        {/* Progress Timeline */}
        <SectionLabel title="PROGRESS TIMELINE" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.timelineRow}>
            {plan.progressTimeline.map((pt, i) => (
              <View key={i} style={styles.timelineItem}>
                <View style={[styles.timelineBar, { height: `${pt.score}%`, backgroundColor: Brand.precision }]} />
                <ThemedText style={[styles.timelineLabel, { color: colors.textTertiary }]}>{pt.week}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        {/* Coach Note */}
        <SectionLabel title="COACH NOTE" colors={colors} />
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.coachNote, { color: colors.textSecondary }]}>{plan.coachNote}</ThemedText>
        </View>

        <AskNexusCTA label={`Development Advice for ${plan.playerName}`} engineContext="development" />
        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: { fontSize: 16, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 15 },

  sectionLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: Spacing.lg, marginBottom: Spacing.sm },

  card: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800' },
  playerName: { fontSize: 17, fontWeight: '700' },
  playerMeta: { fontSize: 12, marginTop: 2 },
  progressBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  progressText: { fontSize: 11, fontWeight: '700' },

  // Gaps
  gapRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 10 },
  gapDot: { width: 6, height: 6, borderRadius: 3 },
  gapText: { flex: 1, fontSize: 14 },

  // Plan blocks
  blockCard: { marginBottom: Spacing.sm },
  blockHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  blockTitle: { fontSize: 15, fontWeight: '600' },
  blockMeta: { fontSize: 12, marginTop: 2 },
  blockTarget: { fontSize: 11, marginTop: 8 },
  drillTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  drillTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: BorderRadius.sm },
  drillTagText: { fontSize: 12, fontWeight: '500' },

  // Measurables
  measRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 },
  measName: { flex: 1, fontSize: 13, fontWeight: '600' },
  measCurrent: { fontSize: 13 },
  measTarget: { fontSize: 13, fontWeight: '700' },
  measDelta: { fontSize: 12, fontWeight: '600', minWidth: 40, textAlign: 'right' },

  // Timeline
  timelineRow: { flexDirection: 'row', height: 80, alignItems: 'flex-end', gap: 6 },
  timelineItem: { flex: 1, alignItems: 'center' },
  timelineBar: { width: '100%', borderRadius: 3, minHeight: 4 },
  timelineLabel: { fontSize: 9, fontWeight: '600', marginTop: 4, textTransform: 'uppercase' },

  // Coach note
  coachNote: { fontSize: 14, lineHeight: 20, fontStyle: 'italic' },
});
