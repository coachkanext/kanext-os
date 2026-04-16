/**
 * Savings Goals — Track, manage, and grow personal savings targets.
 * Owner view with goal progress, auto-save config, and smart tips.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Switch, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useMode } from '@/context/app-context';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

// ── Mock data ─────────────────────────────────────────────────────────────────

const GOALS = [
  { id: 'g1', emoji: '🏠', name: 'Emergency Fund',    current: 2500, target: 5000, due: 'Dec 2026', autosave: '$100/wk', onTrack: true  },
  { id: 'g2', emoji: '✈️', name: 'Travel — Japan',    current: 847,  target: 3000, due: 'Sep 2026', autosave: '$75/wk',  onTrack: false },
  { id: 'g3', emoji: '💻', name: 'New MacBook Pro',   current: 600,  target: 2499, due: 'Jun 2026', autosave: '$50/wk',  onTrack: false },
  { id: 'g4', emoji: '🎓', name: 'Online Course Fund', current: 339, target: 500,  due: 'May 2026', autosave: '$25/wk',  onTrack: true  },
];

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function SavingsGoalsPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const TOP_BAR_H = insets.top + 54;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);

  const mode = useMode();
  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:kaypay' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:kaypay';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [roundUp,      setRoundUp]      = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(true);

  const styles = useMemo(() => makeStyles(C), [C]);

  // ── Derived overview stats ─────────────────────────────────────────────────

  const totalSaved   = GOALS.reduce((s, g) => s + g.current, 0);
  const totalToGo    = GOALS.reduce((s, g) => s + Math.max(0, g.target - g.current), 0);
  const activeGoals  = GOALS.length;
  const latestTarget = 'Apr 2027';

  // ── Render helpers ────────────────────────────────────────────────────────

  const formatMoney = (n: number) =>
    n >= 1000
      ? `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`
      : `$${n.toLocaleString()}`;

  const renderGoalCard = (goal: typeof GOALS[number]) => {
    const pct        = Math.min(100, Math.round((goal.current / goal.target) * 100));
    const fillWidth  = `${pct}%` as `${number}%`;
    const trackColor = goal.onTrack ? GAIN : CAUTION;

    return (
      <GlassView key={goal.id} tier={1} style={styles.goalCard}>
        {/* Top row: name + badge */}
        <View style={styles.goalTopRow}>
          <Text style={styles.goalName}>{goal.emoji}  {goal.name}</Text>
          <View style={[styles.trackBadge, { backgroundColor: trackColor + '22' }]}>
            <Text style={[styles.trackBadgeText, { color: trackColor }]}>
              {goal.onTrack ? 'On Track' : 'Behind'}
            </Text>
          </View>
        </View>

        {/* Current / Target */}
        <Text style={styles.goalAmounts}>
          <Text style={{ color: C.label }}>${goal.current.toLocaleString()}</Text>
          <Text style={{ color: C.secondary }}> / ${goal.target.toLocaleString()}</Text>
        </Text>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: C.separator }]}>
          <View style={[styles.progressFill, { width: fillWidth, backgroundColor: trackColor }]} />
        </View>

        {/* Bottom row: due date + auto-save + add funds */}
        <View style={styles.goalBottomRow}>
          <View style={{ gap: 2 }}>
            <Text style={styles.goalMeta}>Due Date: {goal.due}</Text>
            <Text style={styles.goalMeta}>Auto-save: {goal.autosave}</Text>
          </View>
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[styles.addFundsBtn, { borderColor: C.separator }]}
          >
            <Text style={[styles.addFundsBtnText, { color: C.label }]}>Add Funds</Text>
          </Pressable>
        </View>
      </GlassView>
    );
  };

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBarOuter, { height: TOP_BAR_H, paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            style={styles.topBarLeft}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.titlePillText, { color: C.label }]}>Savings Goals</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ───────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={{ paddingTop: TOP_BAR_H + 16, paddingHorizontal: 16, paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
      >

        {/* 1. Overview Card */}
        <GlassView tier={1} style={styles.overviewCard}>
          {/* Total Saved row */}
          <View style={styles.overviewTopRow}>
            <Text style={styles.overviewLabel}>Total Saved</Text>
            <Text style={styles.overviewValue}>${totalSaved.toLocaleString()}</Text>
          </View>

          {/* Stat pills */}
          <View style={styles.statPillsRow}>
            <View style={[styles.statPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.statPillText, { color: C.label }]}>{activeGoals} Active goals</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.statPillText, { color: C.label }]}>${totalToGo.toLocaleString()} to go</Text>
            </View>
            <View style={[styles.statPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.statPillText, { color: C.label }]}>{latestTarget} target</Text>
            </View>
          </View>
        </GlassView>

        {/* 2. Goals List */}
        <View style={styles.sectionSpacing}>
          {GOALS.map(renderGoalCard)}
        </View>

        {/* 3. Add New Goal — dashed card */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={[styles.dashedCard, { borderColor: C.separator }]}
        >
          <IconSymbol name="plus.circle" size={28} color={C.secondary} />
          <Text style={[styles.dashedCardTitle, { color: C.label }]}>Add New Goal</Text>
          <Text style={[styles.dashedCardSub, { color: C.secondary }]}>
            Set a target, timeline &amp; auto-save amount
          </Text>
        </Pressable>

        {/* 4. Tips Section */}
        <View style={[styles.sectionSpacing, { marginTop: 28 }]}>
          <Text style={[styles.sectionTitle, { color: C.secondary }]}>SMART SAVINGS TIPS</Text>

          {/* Tip 1: Round-Up Savings */}
          <GlassView tier={1} style={styles.tipCard}>
            <View style={styles.tipRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.tipTitle, { color: C.label }]}>Round-Up Savings</Text>
                <Text style={[styles.tipDesc, { color: C.secondary }]}>
                  Automatically round up every purchase to the nearest dollar and save the difference.
                </Text>
              </View>
              <Switch
                value={roundUp}
                onValueChange={(v) => {
                  Haptics.selectionAsync();
                  setRoundUp(v);
                }}
                trackColor={{ false: C.separator, true: C.label }}
                thumbColor={C.bg}
              />
            </View>
          </GlassView>

          {/* Tip 2: Weekly Auto-Save Review */}
          <GlassView tier={1} style={styles.tipCard}>
            <View style={styles.tipRow}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.tipTitle, { color: C.label }]}>Weekly Auto-Save Review</Text>
                <Text style={[styles.tipDesc, { color: C.secondary }]}>
                  Get a weekly summary of your savings progress every Monday.
                </Text>
              </View>
              <Switch
                value={weeklyReview}
                onValueChange={(v) => {
                  Haptics.selectionAsync();
                  setWeeklyReview(v);
                }}
                trackColor={{ false: C.separator, true: C.label }}
                thumbColor={C.bg}
              />
            </View>
          </GlassView>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    // Top bar
    topBarOuter: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 10,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
      flex: 1,
    },
    topBarLeft: {
      width: 44,
      height: 44,
      alignItems: 'flex-start',
      justifyContent: 'center',
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    // Overview card
    overviewCard: {
      padding: 16,
      marginBottom: 20,
      gap: 12,
    },
    overviewTopRow: {
      gap: 2,
    },
    overviewLabel: {
      fontSize: 12,
      color: C.secondary,
    },
    overviewValue: {
      fontSize: 24,
      fontWeight: '700',
      color: C.label,
    },
    statPillsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },
    statPill: {
      borderWidth: 1,
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    statPillText: {
      fontSize: 12,
      fontWeight: '500',
    },

    // Section
    sectionSpacing: {
      gap: 10,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.5,
      marginBottom: 10,
    },

    // Goal card
    goalCard: {
      padding: 14,
      gap: 10,
    },
    goalTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    goalName: {
      fontSize: 16,
      fontWeight: '700',
      color: C.label,
      flex: 1,
      marginRight: 8,
    },
    trackBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    trackBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },
    goalAmounts: {
      fontSize: 13,
    },
    progressTrack: {
      height: 6,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressFill: {
      height: 6,
      borderRadius: 3,
    },
    goalBottomRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    goalMeta: {
      fontSize: 11,
      color: C.secondary,
    },
    addFundsBtn: {
      borderWidth: 1,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 6,
    },
    addFundsBtnText: {
      fontSize: 12,
      fontWeight: '500',
    },

    // Dashed add card
    dashedCard: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: 12,
      padding: 20,
      alignItems: 'center',
      gap: 8,
    },
    dashedCardTitle: {
      fontSize: 15,
      fontWeight: '600',
    },
    dashedCardSub: {
      fontSize: 12,
      textAlign: 'center',
    },

    // Tip card
    tipCard: {
      padding: 14,
      marginBottom: 8,
    },
    tipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: '600',
    },
    tipDesc: {
      fontSize: 13,
      lineHeight: 18,
    },
  });
}
