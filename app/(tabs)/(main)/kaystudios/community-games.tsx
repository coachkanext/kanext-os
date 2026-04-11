/**
 * Community Games — Member games hub (featured, active challenges, leaderboard, browse).
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

const ACTIVE_CHALLENGES = [
  {
    name: 'Books of the Bible Speed Challenge',
    description: 'Name all 66 books as fast as you can.',
    participants: 234,
    timeLeft: '2 days left',
  },
  {
    name: '30-Day Prayer Challenge',
    description: 'Log a daily prayer for 30 consecutive days.',
    participants: 156,
    timeLeft: '18 days left',
  },
];

const LEADERBOARD = [
  { rank: 1, initials: 'MJ', name: 'Marcus Johnson', points: 4820 },
  { rank: 2, initials: 'AW', name: 'Aisha Williams', points: 4310 },
  { rank: 3, initials: 'DC', name: 'David Chen',     points: 3990 },
  { rank: 4, initials: 'ST', name: 'Sarah Thompson', points: 3540 },
  { rank: 5, initials: 'JO', name: 'James Okafor',   points: 3120 },
];

// Simulated "you" index in leaderboard
const MY_RANK_IDX = 3;

const BROWSE_GAMES = [
  { name: 'Bible Books Trivia',     type: 'Trivia',    plays: 1820 },
  { name: 'Scripture Fill-In-Blank', type: 'Quiz',      plays: 940  },
  { name: 'Sermon Notes Challenge', type: 'Challenge', plays: 612  },
  { name: 'Apostle Journeys Quiz',  type: 'Quiz',      plays: 408  },
];

function GameTypeBadge({ type, C }: { type: string; C: any }) {
  let bg: string;
  let textColor: string;
  switch (type) {
    case 'Trivia':    bg = GAIN + '22';    textColor = GAIN;    break;
    case 'Quiz':      bg = C.separator;   textColor = C.secondary; break;
    case 'Challenge': bg = CAUTION + '22'; textColor = CAUTION; break;
    default:          bg = C.separator;   textColor = C.secondary; break;
  }
  return (
    <View style={{ backgroundColor: bg, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, alignSelf: 'flex-start' }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: textColor }}>{type}</Text>
    </View>
  );
}

export default function CommunityGamesScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaystudios');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Games</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 12,
          paddingBottom: insets.bottom + 80,
          gap: 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Featured Game Banner */}
        <Pressable
          style={[s.featuredBanner, { backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('ICCLA Bible Trivia', 'Starting game with 50 questions.');
          }}
        >
          <Text style={s.featuredTitle}>ICCLA Bible Trivia</Text>
          <Text style={s.featuredSub}>50 Questions</Text>
          <View style={s.playBtn}>
            <Text style={s.playBtnText}>▶  Play Now</Text>
          </View>
        </Pressable>

        {/* Active Challenges */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Active Challenges</Text>
          {ACTIVE_CHALLENGES.map(ch => (
            <View key={ch.name} style={[s.card, { backgroundColor: C.surface }]}>
              <View style={s.challengeHeader}>
                <Text style={[s.challengeName, { color: C.label }]}>{ch.name}</Text>
                <View style={[s.timeBadge, { backgroundColor: CAUTION + '22' }]}>
                  <Text style={[s.timeBadgeText, { color: CAUTION }]}>{ch.timeLeft}</Text>
                </View>
              </View>
              <Text style={[s.challengeDesc, { color: C.secondary }]}>{ch.description}</Text>
              <View style={s.challengeFooter}>
                <View style={s.participantsRow}>
                  <IconSymbol name="person.fill" size={12} color={C.secondary} />
                  <Text style={[s.participantsText, { color: C.secondary }]}>{ch.participants} participants</Text>
                </View>
                <Pressable
                  style={[s.joinBtn, { backgroundColor: C.label }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Join Challenge', `You joined "${ch.name}".`);
                  }}
                >
                  <Text style={[s.joinBtnText, { color: C.bg }]}>Join</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* Leaderboard */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Leaderboard</Text>
          <View style={[s.leaderboardCard, { backgroundColor: C.surface }]}>
            {LEADERBOARD.map((entry, idx) => {
              const isMe = idx === MY_RANK_IDX;
              return (
                <View
                  key={entry.name}
                  style={[
                    s.leaderRow,
                    isMe && { backgroundColor: C.surface },
                    idx < LEADERBOARD.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                  ]}
                >
                  <Text style={[s.rankNum, { color: C.secondary }]}>{entry.rank}</Text>
                  <View style={[s.initialsCircle, { backgroundColor: C.label }]}>
                    <Text style={[s.initialsText, { color: C.bg }]}>{entry.initials}</Text>
                  </View>
                  <Text style={[s.leaderName, { color: C.label, fontWeight: isMe ? '700' : '400' }]}>
                    {entry.name}{isMe ? ' (You)' : ''}
                  </Text>
                  <Text style={[s.pointsText, { color: GAIN }]}>{entry.points.toLocaleString()} pts</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Browse Games */}
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Browse Games</Text>
          {BROWSE_GAMES.map(g => (
            <Pressable
              key={g.name}
              style={[s.card, { backgroundColor: C.surface }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(g.name, `${g.plays.toLocaleString()} plays. Start playing?`, [
                  { text: 'Play', onPress: () => {} },
                  { text: 'Cancel', style: 'cancel' },
                ]);
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={[s.gameName, { color: C.label }]}>{g.name}</Text>
                  <GameTypeBadge type={g.type} C={C} />
                </View>
                <Text style={[s.playsText, { color: C.secondary }]}>{g.plays.toLocaleString()} plays</Text>
                <IconSymbol name="chevron.right" size={14} color={C.secondary} />
              </View>
            </Pressable>
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
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    featuredBanner: {
      marginHorizontal: 16, height: 140, borderRadius: 16,
      alignItems: 'center', justifyContent: 'center', gap: 6,
    },
    featuredTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
    featuredSub:   { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    playBtn: {
      marginTop: 8, backgroundColor: 'rgba(255,255,255,0.18)',
      borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8,
    },
    playBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

    sectionTitle: { fontSize: 16, fontWeight: '700' },

    card: { borderRadius: 12, padding: 14, gap: 10 },

    challengeHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    challengeName:    { flex: 1, fontSize: 14, fontWeight: '700' },
    challengeDesc:    { fontSize: 13 },
    challengeFooter:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    participantsRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
    participantsText: { fontSize: 12 },
    timeBadge:        { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
    timeBadgeText:    { fontSize: 11, fontWeight: '700' },
    joinBtn:          { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 6 },
    joinBtnText:      { fontSize: 13, fontWeight: '600' },

    leaderboardCard: { borderRadius: 12, overflow: 'hidden' },
    leaderRow: {
      flexDirection: 'row', alignItems: 'center', gap: 10,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    rankNum:      { width: 20, textAlign: 'center', fontSize: 13, fontWeight: '600' },
    initialsCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    initialsText:   { fontSize: 13, fontWeight: '700' },
    leaderName:     { flex: 1, fontSize: 14 },
    pointsText:     { fontSize: 14, fontWeight: '700' },

    gameName:  { fontSize: 14, fontWeight: '600' },
    playsText: { fontSize: 12 },
  });
}
