import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

const RECENT_GAMES = [
  { opp: 'MCE', result: 'W', score: '78-65', pts: 34 },
  { opp: 'DCU', result: 'W', score: '84-71', pts: 28 },
  { opp: 'STU', result: 'W', score: '91-75', pts: 31 },
  { opp: 'SIM', result: 'L', score: '68-74', pts: 22 },
  { opp: 'LMU', result: 'L', score: '58-82', pts: 12 },
];

export default function SportsPlayerDashboard() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];
  const s = useMemo(() => makeStyles(C), [C]);
  const topBarHeight = insets.top + 56;

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (isHeadCoach) {
        router.replace('/(tabs)/(main)/hub/sports-program-overview' as any);
      }
    }, [isHeadCoach])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable
          style={s.kBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          hitSlop={8}
        >
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>MY DASHBOARD</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarHeight + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Hero Card */}
        <View style={s.heroCard}>
          <View style={s.heroTop}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>LK</Text>
            </View>
            <View style={s.heroRight}>
              <Text style={s.heroPosition}>#11 · Guard</Text>
              <Text style={s.heroName}>Laolu Kalejaiye</Text>
              <Text style={s.heroTeam}>Lincoln University Oaklanders</Text>
            </View>
          </View>
          <View style={s.heroSeparator} />
          <View style={s.heroBottomRow}>
            <View style={s.krBlock}>
              <Text style={s.krLabel}>KR</Text>
              <Text style={[s.krValue, { color: GAIN }]}>86</Text>
              <Text style={[s.krTier, { color: GAIN }]}>HIGH-IMPACT STARTER</Text>
            </View>
            <View style={s.heroDivider} />
            <View style={s.fitBlock}>
              <Text style={s.krLabel}>SYS FIT</Text>
              <Text style={s.fitValue}>94%</Text>
              <View style={s.fitLeaguesRow}>
                <View style={s.fitBadge}><Text style={s.fitBadgeText}>GAAC</Text></View>
                <View style={s.fitBadge}><Text style={s.fitBadgeText}>USCAA</Text></View>
              </View>
            </View>
          </View>
        </View>

        {/* Season Stats */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>MY SEASON STATS</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.statGrid}>
            {[
              { label: 'PPG', value: '29.8', color: C.label },
              { label: 'RPG', value: '3.1', color: C.label },
              { label: 'APG', value: '3.6', color: C.label },
              { label: 'SPG', value: '2.1', color: C.label },
            ].map((stat) => (
              <View key={stat.label} style={s.statCell}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <View style={[s.cardInnerSep, { backgroundColor: C.separator }]} />
          <View style={s.statGrid}>
            {[
              { label: 'FG%', value: '.430', color: C.label },
              { label: '3P%', value: '.474', color: GAIN },
              { label: 'FT%', value: '.871', color: C.label },
              { label: 'TO/G', value: '4.4', color: C.label },
            ].map((stat) => (
              <View key={stat.label} style={s.statCell}>
                <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
          <View style={[s.vsD1Card, { backgroundColor: '#1A1714' }]}>
            <View style={s.vsD1Header}>
              <Text style={s.vsD1Title}>vs D1 (5 GP)</Text>
              <View style={s.vsD1Stats}>
                <Text style={s.vsD1Stat}>PPG: 22.4</Text>
                <Text style={s.vsD1Stat}>3P%: .372</Text>
                <Text style={s.vsD1Stat}>FTA/G: 1.4</Text>
              </View>
            </View>
            <Text style={[s.vsD1Note, { color: C.secondary }]}>Suppression indicator — see development</Text>
          </View>
        </View>

        {/* Next Game */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>NEXT GAME</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={[s.nextGameInner, { backgroundColor: '#1A1714' }]}>
            <Text style={s.nextGameOpponent}>vs Menlo College</Text>
            <View style={s.nextGameMeta}>
              <Text style={s.nextGameMetaText}>Apr 5</Text>
              <Text style={s.nextGameMetaDot}>·</Text>
              <Text style={s.nextGameMetaText}>6:00 PM</Text>
              <Text style={s.nextGameMetaDot}>·</Text>
              <Text style={s.nextGameMetaText}>Home</Text>
            </View>
          </View>
          <View style={s.matchupRow}>
            <Text style={[s.matchupLabel, { color: C.secondary }]}>My Matchup</Text>
            <Text style={[s.matchupPlayer, { color: C.label }]}>vs Marcus Reed #3 · KR:81</Text>
          </View>
          <View style={s.advantageRow}>
            <Text style={[s.advantageLabel, { color: C.secondary }]}>KR Advantage</Text>
            <Text style={[s.advantageValue, { color: GAIN }]}>+5 (LK 86 vs MR 81)</Text>
          </View>
          <View style={[s.scoutingBadge, { backgroundColor: GAIN + '22' }]}>
            <IconSymbol name="checkmark.circle.fill" size={12} color={GAIN} />
            <Text style={[s.scoutingBadgeText, { color: GAIN }]}>Scouting notes loaded</Text>
          </View>
        </View>

        {/* Recent Performances */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>RECENT PERFORMANCES</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.recentScroll}>
          {RECENT_GAMES.map((game, i) => (
            <View
              key={i}
              style={[
                s.recentCard,
                { backgroundColor: '#1A1714', borderLeftColor: game.result === 'W' ? GAIN : HEAT },
              ]}
            >
              <Text style={s.recentOpp}>vs {game.opp}</Text>
              <Text style={[s.recentResult, { color: game.result === 'W' ? GAIN : HEAT }]}>
                {game.result} {game.score}
              </Text>
              <Text style={s.recentPts}>{game.pts} pts</Text>
            </View>
          ))}
        </ScrollView>

        {/* Development Snapshot */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>DEVELOPMENT</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.devKrRow}>
            <Text style={[s.devKrLabel, { color: C.secondary }]}>KR Trajectory</Text>
            <Text style={[s.devKrDelta, { color: GAIN }]}>+4 ↑</Text>
          </View>
          <Text style={[s.devKrSub, { color: C.label }]}>KR 82 → 86 this season</Text>
          <View style={[s.devBar, { backgroundColor: C.separator }]}>
            <View style={[s.devBarFill, { backgroundColor: GAIN, width: '50%' }]} />
          </View>
          <Pressable
            style={[s.devGoalsBtn, { borderColor: C.separator }]}
            onPress={() => router.push('/(tabs)/(main)/hub/sports-player-development' as any)}
          >
            <Text style={[s.devGoalsBtnText, { color: C.label }]}>3 active goals</Text>
            <IconSymbol name="chevron.right" size={12} color={C.secondary} />
          </Pressable>
          <View style={s.devGoalsList}>
            {[
              { text: '3P Consistency: 68 → 75', status: 'Done', color: GAIN },
              { text: 'FT Rate: 1.4 → 4.0 APG at next level', status: 'In Progress', color: CAUTION },
              { text: 'Rim Finishing', status: 'In Progress', color: CAUTION },
            ].map((goal, i) => (
              <View key={i} style={s.devGoalRow}>
                <Text style={[s.devGoalText, { color: C.label }]}>{goal.text}</Text>
                <Text style={[s.devGoalStatus, { color: goal.color }]}>{goal.status}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Team News */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>TEAM</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {[
            { icon: 'sportscourt' as const, text: 'Practice today 2:30 PM — Transition Defense focus' },
            { icon: 'trophy.fill' as const, text: 'Team KR: 78 · System Fit: 94%' },
            { icon: 'person.3.fill' as const, text: 'Roster health: 6 available, 1 limited, 1 out' },
          ].map((item, i) => (
            <View
              key={i}
              style={[
                s.teamRow,
                i < 2 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <IconSymbol name={item.icon} size={16} color={C.secondary} />
              <Text style={[s.teamRowText, { color: C.label }]}>{item.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
    sectionHeader: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 8, marginTop: 20,
    },
    card: { borderRadius: 12, marginHorizontal: 16, padding: 14, overflow: 'hidden' },
    heroCard: { backgroundColor: '#1A1714', borderRadius: 16, marginHorizontal: 16, padding: 16 },
    heroTop: { flexDirection: 'row', gap: 12, alignItems: 'center' },
    avatar: {
      width: 56, height: 56, borderRadius: 28,
      backgroundColor: '#2A2420', justifyContent: 'center', alignItems: 'center',
    },
    avatarText: { fontSize: 20, fontWeight: '700', color: '#FFFFFF' },
    heroRight: { flex: 1 },
    heroPosition: { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 2 },
    heroName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 2 },
    heroTeam: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    heroSeparator: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: 'rgba(255,255,255,0.15)',
      marginVertical: 12,
    },
    heroBottomRow: { flexDirection: 'row', alignItems: 'center' },
    krBlock: { flex: 1, alignItems: 'center' },
    krLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', marginBottom: 4 },
    krValue: { fontSize: 36, fontWeight: '700', lineHeight: 40 },
    krTier: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
    heroDivider: { width: StyleSheet.hairlineWidth, height: 60, backgroundColor: 'rgba(255,255,255,0.15)' },
    fitBlock: { flex: 1, alignItems: 'center' },
    fitValue: { fontSize: 26, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
    fitLeaguesRow: { flexDirection: 'row', gap: 6 },
    fitBadge: {
      backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4,
      paddingHorizontal: 6, paddingVertical: 2,
    },
    fitBadgeText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    statGrid: { flexDirection: 'row' },
    statCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
    statValue: { fontSize: 22, fontWeight: '700', marginBottom: 2 },
    statLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
    cardInnerSep: { height: StyleSheet.hairlineWidth, marginVertical: 10 },
    vsD1Card: { borderRadius: 8, padding: 10, marginTop: 10 },
    vsD1Header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    vsD1Title: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)' },
    vsD1Stats: { flexDirection: 'row', gap: 10 },
    vsD1Stat: { fontSize: 11, color: 'rgba(255,255,255,0.6)' },
    vsD1Note: { fontSize: 11, fontStyle: 'italic' },
    nextGameInner: { borderRadius: 8, padding: 12, marginBottom: 12 },
    nextGameOpponent: { fontSize: 16, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
    nextGameMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    nextGameMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    nextGameMetaDot: { fontSize: 12, color: 'rgba(255,255,255,0.3)' },
    matchupRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 6,
    },
    matchupLabel: { fontSize: 11, fontWeight: '600' },
    matchupPlayer: { fontSize: 13, fontWeight: '600' },
    advantageRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', marginBottom: 10,
    },
    advantageLabel: { fontSize: 11, fontWeight: '600' },
    advantageValue: { fontSize: 13, fontWeight: '700' },
    scoutingBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    },
    scoutingBadgeText: { fontSize: 11, fontWeight: '600' },
    recentScroll: { paddingHorizontal: 16, gap: 10 },
    recentCard: { width: 90, borderRadius: 10, padding: 8, borderLeftWidth: 3 },
    recentOpp: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
    recentResult: { fontSize: 10, fontWeight: '700', marginBottom: 4 },
    recentPts: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
    devKrRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    devKrLabel: { fontSize: 12, fontWeight: '600' },
    devKrDelta: { fontSize: 14, fontWeight: '700' },
    devKrSub: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
    devBar: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
    devBarFill: { height: 8, borderRadius: 4 },
    devGoalsBtn: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      borderWidth: StyleSheet.hairlineWidth, borderRadius: 8,
      paddingHorizontal: 12, paddingVertical: 8, marginBottom: 10,
    },
    devGoalsBtnText: { fontSize: 13, fontWeight: '600' },
    devGoalsList: { gap: 6 },
    devGoalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    devGoalText: { fontSize: 12, flex: 1, marginRight: 8 },
    devGoalStatus: { fontSize: 11, fontWeight: '700' },
    teamRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
    teamRowText: { fontSize: 13, flex: 1 },
  });
}
