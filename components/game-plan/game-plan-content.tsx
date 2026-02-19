/**
 * Game Plan V2 — 11-section pregame command center orchestrator.
 * Layout: fixed header → collapsible staff strip → scrollable sections
 */

import React, { useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FMU_NEXT_GAME_ID } from '@/data/fmu';
import { getGamePlanV2 } from '@/data/game-plan-v2';

import { GamePlanHeader } from './game-plan-header';
import { GamePlanStaffStrip } from './game-plan-staff-strip';
import { SECTION_NAMES } from './game-plan-types';

// Section components
import { S01DecisionSummary } from './sections/s01-decision-summary';
import { S02OppOffense } from './sections/s02-opp-offense';
import { S03OppDefense } from './sections/s03-opp-defense';
import { S04ShotProfile } from './sections/s04-shot-profile';
import { S05ActionsTriggers } from './sections/s05-actions-triggers';
import { S06SituationsPackage } from './sections/s06-situations-package';
import { S07RotationBoard } from './sections/s07-rotation-board';
import { S08PlayerCards } from './sections/s08-player-cards';
import { S09ConstraintsRisk } from './sections/s09-constraints-risk';
import { S10ScoutConfidence } from './sections/s10-scout-confidence';
import { S11PracticeTranslation } from './sections/s11-practice-translation';

function SectionLabel({ number, title, colors }: { number: number; title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {String(number).padStart(2, '0')}  {title}
    </ThemedText>
  );
}

export function GamePlanContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const scrollRef = useRef<ScrollView>(null);
  const sectionYs = useRef<Record<number, number>>({});

  const packet = FMU_NEXT_GAME_ID ? getGamePlanV2(FMU_NEXT_GAME_ID) : null;

  const registerSection = useCallback((section: number, y: number) => {
    sectionYs.current[section] = y;
  }, []);

  const scrollToSection = useCallback((section: number) => {
    const y = sectionYs.current[section];
    if (y != null && scrollRef.current) {
      scrollRef.current.scrollTo({ y, animated: true });
    }
  }, []);

  // Empty state
  if (!packet) {
    return (
      <View style={styles.emptyState}>
        <IconSymbol name="sportscourt.fill" size={48} color={colors.textTertiary} />
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No upcoming game
        </ThemedText>
        <ThemedText style={[styles.emptySubtext, { color: colors.textTertiary }]}>
          Game plan will appear when the next game is scheduled.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Fixed Header */}
      <GamePlanHeader
        opponent={packet.opponent}
        date={packet.date}
        homeAway={packet.homeAway}
        scoutConfidence={packet.scoutConfidence}
      />

      {/* Staff Strip */}
      <GamePlanStaffStrip
        assignments={packet.staffAssignments}
        onRoleTap={scrollToSection}
      />

      {/* Scrollable Sections */}
      <ScrollView
        ref={scrollRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {/* S01: Decision Summary */}
        <SectionLabel number={1} title={SECTION_NAMES[1]} colors={colors} />
        <S01DecisionSummary
          bullets={packet.decisionSummary.bullets}
          doNotBreak={packet.decisionSummary.doNotBreak}
          onLayout={(y) => registerSection(1, y)}
        />

        {/* S02: Opp Offense → Our D */}
        <SectionLabel number={2} title={SECTION_NAMES[2]} colors={colors} />
        <S02OppOffense
          data={packet.oppOffense}
          onLayout={(y) => registerSection(2, y)}
        />

        {/* S03: Opp Defense → Our O */}
        <SectionLabel number={3} title={SECTION_NAMES[3]} colors={colors} />
        <S03OppDefense
          data={packet.oppDefense}
          onLayout={(y) => registerSection(3, y)}
        />

        {/* S04: Shot Profile */}
        <SectionLabel number={4} title={SECTION_NAMES[4]} colors={colors} />
        <S04ShotProfile
          data={packet.shotProfile}
          onLayout={(y) => registerSection(4, y)}
        />

        {/* S05: Actions Library */}
        <SectionLabel number={5} title={SECTION_NAMES[5]} colors={colors} />
        <S05ActionsTriggers
          actions={packet.actionsLibrary}
          onLayout={(y) => registerSection(5, y)}
        />

        {/* S06: Situations Package */}
        <SectionLabel number={6} title={SECTION_NAMES[6]} colors={colors} />
        <S06SituationsPackage
          plays={packet.situationsPackage}
          onLayout={(y) => registerSection(6, y)}
        />

        {/* S07: Rotation Board */}
        <SectionLabel number={7} title={SECTION_NAMES[7]} colors={colors} />
        <S07RotationBoard
          players={packet.rotationBoard}
          onLayout={(y) => registerSection(7, y)}
        />

        {/* S08: Player Cards */}
        <SectionLabel number={8} title={SECTION_NAMES[8]} colors={colors} />
        <S08PlayerCards
          cards={packet.playerCards}
          onLayout={(y) => registerSection(8, y)}
        />

        {/* S09: Constraints & Risk */}
        <SectionLabel number={9} title={SECTION_NAMES[9]} colors={colors} />
        <S09ConstraintsRisk
          data={packet.constraintsRisk}
          onLayout={(y) => registerSection(9, y)}
        />

        {/* S10: Scout Confidence */}
        <SectionLabel number={10} title={SECTION_NAMES[10]} colors={colors} />
        <S10ScoutConfidence
          data={packet.scoutConfidence}
          onLayout={(y) => registerSection(10, y)}
        />

        {/* S11: Practice Translation */}
        <SectionLabel number={11} title={SECTION_NAMES[11]} colors={colors} />
        <S11PracticeTranslation
          drills={packet.practiceTranslation}
          onLayout={(y) => registerSection(11, y)}
        />

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
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

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100, paddingHorizontal: Spacing.lg },
  emptyText: { fontSize: 16, fontWeight: '600', marginTop: Spacing.md },
  emptySubtext: { fontSize: 13, marginTop: Spacing.xs, textAlign: 'center' },
});
