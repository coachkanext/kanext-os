/**
 * sports-scouting.tsx
 * Head Coach only — ESPN pregame analysis meets broadcast graphics.
 */
import React, { useMemo, useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
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
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;


const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';
const DARK_PREMIUM = '#1A1714';

type ScoutingStatus = 'Complete' | 'In Progress' | 'Not Started';

interface Opponent {
  id: string;
  name: string;
  date: string;
  status: ScoutingStatus;
}

const OPPONENTS: Opponent[] = [
  { id: '1', name: 'Menlo College',    date: 'Apr 5',  status: 'Complete'    },
  { id: '2', name: 'Dominican Univ.',  date: 'Apr 9',  status: 'In Progress' },
  { id: '3', name: 'Cal Maritime',     date: 'Apr 13', status: 'Not Started' },
  { id: '4', name: 'Simpson Univ.',    date: 'Apr 17', status: 'Not Started' },
];

interface PlayType {
  name: string;
  freq: number;
  ppp: number;
  color: string;
}

const OFFENSIVE_PLAYS: PlayType[] = [
  { name: 'Horns',      freq: 34, ppp: 1.12, color: CAUTION },
  { name: 'PnR',        freq: 28, ppp: 0.98, color: GAIN    },
  { name: 'Transition', freq: 22, ppp: 1.24, color: GAIN    },
  { name: 'Post-Up',    freq: 10, ppp: 0.87, color: HEAT    },
  { name: 'BLOB',       freq: 6,  ppp: 0.94, color: '#8A837C' },
];

interface KeyPlayer {
  id: string;
  name: string;
  number: string;
  pos: string;
  kr: number;
  ppg: number;
  rpg: number;
  apg: number;
  gamePlan: string;
}

const KEY_PLAYERS: KeyPlayer[] = [
  { id: 'p1', name: 'Marcus Reed',  number: '3',  pos: 'G', kr: 81, ppg: 18.4, rpg: 4.2, apg: 5.1, gamePlan: 'Deny ball screen, force left'   },
  { id: 'p2', name: 'Kyle Johnson', number: '22', pos: 'F', kr: 74, ppg: 12.1, rpg: 7.8, apg: 2.3, gamePlan: 'Stay attached on cuts'            },
  { id: 'p3', name: 'Devon Mills',  number: '15', pos: 'C', kr: 69, ppg: 8.4,  rpg: 9.2, apg: 1.1, gamePlan: 'Front in post, help early'       },
];

interface MatchupRow {
  ourInitials: string;
  ourKr: number;
  theirName: string;
  theirKr: number;
  diff: number;
}

const MATCHUP_DATA: MatchupRow[] = [
  { ourInitials: 'LK', ourKr: 86, theirName: 'Marcus Reed',  theirKr: 81, diff: 5  },
  { ourInitials: 'BW', ourKr: 79, theirName: 'K.Johnson',    theirKr: 74, diff: 5  },
  { ourInitials: 'CM', ourKr: 73, theirName: 'T.Williams',   theirKr: 71, diff: 2  },
  { ourInitials: 'NC', ourKr: 73, theirName: 'Devon Mills',  theirKr: 69, diff: 4  },
  { ourInitials: 'AH', ourKr: 66, theirName: 'R.Carter',     theirKr: 68, diff: -2 },
];

const DIPSON_SUGGESTIONS = [
  'Run Horns action vs their zone — they struggle rotating on skip passes.',
  'Attack transition early; their back-line defense gives up layups in first 4 seconds.',
  'Target Devon Mills (C) in pick-and-roll — he hedges hard, leaving roll-man open.',
];

function scoutingStatusStyle(status: ScoutingStatus, C: ComponentColors): { bg: string; text: string } {
  switch (status) {
    case 'Complete':    return { bg: GAIN,       text: '#FFFFFF'   };
    case 'In Progress': return { bg: CAUTION,    text: '#FFFFFF'   };
    case 'Not Started': return { bg: C.separator, text: C.secondary };
  }
}

function krColor(kr: number): string {
  if (kr >= 80) return GAIN;
  if (kr >= 70) return CAUTION;
  return HEAT;
}

export default function SportsScouting() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [selectedOpponent, setSelectedOpponent] = useState<Opponent | null>(null);

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (!isHeadCoach) {
        router.replace('/(tabs)/(main)/hub' as any);
      }
    }, [isHeadCoach])
  );

  const styles = useMemo(() => makeStyles(C, insets), [C, insets]);

  const handleOpponentPress = useCallback((opp: Opponent) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSelectedOpponent((prev) => (prev?.id === opp.id ? null : opp));
  }, []);

  const handleImplement = useCallback((suggestion: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Dipson', `Implementing: "${suggestion}"`);
  }, []);

  return (
    <View style={styles.root}>
      <Animated.View style={[styles.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={styles.topBar}>
          <KMenuButton onPress={() => openSidePanel()} />
          <View style={[styles.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[styles.titlePillText, { color: C.label }]}>Scouting</Text>
          </View>
          <RolePill role={role} onPress={cycleRole} />
        </View>
      </Animated.View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + TOP_BAR_H + 8 }]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* UPCOMING OPPONENTS */}
        <Text style={[styles.sectionHeader, { color: C.secondary }]}>UPCOMING OPPONENTS</Text>
        {OPPONENTS.map((opp) => {
          const ss = scoutingStatusStyle(opp.status, C);
          const isSelected = selectedOpponent?.id === opp.id;
          return (
            <Pressable
              key={opp.id}
              style={[styles.opponentCard, { backgroundColor: C.surface }]}
              onPress={() => handleOpponentPress(opp)}
            >
              {/* LU badge */}
              <View style={[styles.teamBadge, { backgroundColor: GAIN }]}>
                <Text style={styles.teamBadgeText}>LU</Text>
              </View>

              <Text style={[styles.vsText, { color: C.secondary }]}>VS</Text>

              {/* Opponent badge */}
              <View style={[styles.teamBadge, { backgroundColor: C.label }]}>
                <Text style={[styles.teamBadgeText, { color: C.bg }]}>
                  {opp.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                </Text>
              </View>

              <View style={styles.opponentInfo}>
                <Text style={[styles.opponentName, { color: C.label }]}>vs {opp.name}</Text>
                <Text style={[styles.opponentDate, { color: C.secondary }]}>{opp.date}</Text>
              </View>

              <View style={[styles.scoutingBadge, { backgroundColor: ss.bg }]}>
                <Text style={[styles.scoutingBadgeText, { color: ss.text }]}>{opp.status}</Text>
              </View>

              <IconSymbol
                name={isSelected ? 'chevron.down' : 'chevron.right'}
                size={14}
                color={C.secondary}
              />
            </Pressable>
          );
        })}

        {/* FULL SCOUTING REPORT */}
        {selectedOpponent && (
          <View style={styles.reportContainer}>
            {/* Dark header card */}
            <View style={styles.reportHeader}>
              <View style={styles.reportHeaderTop}>
                <View>
                  <Text style={styles.reportOpponentName}>vs {selectedOpponent.name}</Text>
                  <Text style={styles.reportRecord}>Season Record: 18-9</Text>
                </View>
                <View style={[styles.teamKrCircle, { borderColor: GAIN }]}>
                  <Text style={styles.teamKrLabel}>KR</Text>
                  <Text style={styles.teamKrValue}>74</Text>
                </View>
              </View>
              <View style={styles.reportBadgeRow}>
                <View style={styles.systemBadge}>
                  <Text style={styles.systemBadgeText}>Spread PnR</Text>
                </View>
                <View style={styles.systemBadge}>
                  <Text style={styles.systemBadgeText}>Pressure Man</Text>
                </View>
              </View>
            </View>

            {/* OFFENSIVE SYSTEM */}
            <View style={[styles.reportSection, { backgroundColor: C.surface }]}>
              <Text style={[styles.reportSectionHeader, { color: C.secondary }]}>OFFENSIVE SYSTEM</Text>
              {OFFENSIVE_PLAYS.map((play) => (
                <View key={play.name} style={styles.playRow}>
                  <Text style={[styles.playName, { color: C.label }]}>{play.name}</Text>
                  <View style={styles.playBarContainer}>
                    <View
                      style={[
                        styles.playBarFill,
                        { width: `${play.freq}%` as any, backgroundColor: play.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.playFreq, { color: C.secondary }]}>{play.freq}%</Text>
                  <Text style={[styles.playPpp, { color: play.ppp >= 1.0 ? GAIN : HEAT }]}>
                    {play.ppp.toFixed(2)}
                  </Text>
                  <Text style={[styles.playPppLabel, { color: C.secondary }]}>PPP</Text>
                </View>
              ))}
            </View>

            {/* KEY PLAYERS */}
            <Text style={[styles.reportInlineHeader, { color: C.secondary }]}>KEY PLAYERS</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.playerScroll}
              contentContainerStyle={styles.playerScrollContent}
            >
              {KEY_PLAYERS.map((player) => (
                <View key={player.id} style={styles.playerCard}>
                  <View style={[styles.playerKrCircle, { borderColor: krColor(player.kr) }]}>
                    <Text style={[styles.playerKrValue, { color: krColor(player.kr) }]}>{player.kr}</Text>
                  </View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <View style={styles.playerPosBadge}>
                    <Text style={styles.playerPosText}>#{player.number} · {player.pos}</Text>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={styles.playerStatText}>{player.ppg} PPG</Text>
                    <Text style={styles.playerStatText}>{player.rpg} RPG</Text>
                    <Text style={styles.playerStatText}>{player.apg} APG</Text>
                  </View>
                  <View style={styles.gamePlanBox}>
                    <Text style={styles.gamePlanLabel}>GAME PLAN:</Text>
                    <Text style={styles.gamePlanText}>{player.gamePlan}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* MATCHUP MATRIX */}
            <View style={[styles.reportSection, { backgroundColor: C.surface }]}>
              <Text style={[styles.reportSectionHeader, { color: C.secondary }]}>MATCHUP MATRIX</Text>
              {MATCHUP_DATA.map((row, idx) => {
                const weWin = row.diff > 0;
                return (
                  <View key={idx} style={styles.matchupRow}>
                    <View
                      style={[
                        styles.matchupBadge,
                        { borderColor: weWin ? GAIN : HEAT, borderWidth: 2 },
                      ]}
                    >
                      <Text style={[styles.matchupInitials, { color: C.label }]}>{row.ourInitials}</Text>
                      <Text style={[styles.matchupKr, { color: weWin ? GAIN : HEAT }]}>{row.ourKr}</Text>
                    </View>

                    <Text style={[styles.matchupVs, { color: C.secondary }]}>vs</Text>

                    <View
                      style={[
                        styles.matchupBadge,
                        { borderColor: weWin ? HEAT : GAIN, borderWidth: 2 },
                      ]}
                    >
                      <Text style={[styles.matchupInitials, { color: C.label }]}>
                        {row.theirName.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </Text>
                      <Text style={[styles.matchupKr, { color: weWin ? HEAT : GAIN }]}>{row.theirKr}</Text>
                    </View>

                    <View style={styles.matchupResult}>
                      <Text style={[styles.matchupArrow, { color: weWin ? GAIN : HEAT }]}>
                        {weWin ? '↑' : '↓'}
                      </Text>
                      <Text style={[styles.matchupLabel, { color: weWin ? GAIN : HEAT }]}>
                        {weWin ? `WE WIN +${row.diff}` : `WATCH ${row.diff}`}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* DIPSON GAME PLAN */}
            <View style={styles.dipsonCard}>
              <View style={styles.dipsonHeader}>
                <IconSymbol name="sparkles" size={18} color={CAUTION} />
                <Text style={styles.dipsonHeaderText}>Dipson Game Plan Suggestions</Text>
              </View>
              {DIPSON_SUGGESTIONS.map((s, idx) => (
                <View key={idx} style={styles.dipsonSuggestion}>
                  <Text style={styles.dipsonSuggestionText}>{s}</Text>
                  <Pressable
                    style={styles.implementBtn}
                    onPress={() => handleImplement(s)}
                  >
                    <Text style={[styles.implementBtnText, { color: C.bg }]}>IMPLEMENT</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* SELF SCOUT */}
        <Text style={[styles.sectionHeader, { color: C.secondary }]}>SELF SCOUT</Text>
        <Pressable
          style={[styles.selfScoutCard, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Self-Scout', 'Loading self-scout analysis…');
          }}
        >
          <View style={styles.selfScoutInfo}>
            <Text style={[styles.selfScoutTitle, { color: C.label }]}>Self-Scout Analysis</Text>
            <Text style={[styles.selfScoutSub, { color: C.secondary }]}>
              Identify tendencies opponents exploit
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={14} color={C.secondary} />
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors, insets: ReturnType<typeof useSafeAreaInsets>) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: C.bg,
    },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    titlePill: {
      borderRadius: 18,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    titlePillText: {
      fontSize: 13,
      fontWeight: '700',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: insets.bottom + 80,
    },
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginHorizontal: 16,
      marginTop: 24,
      marginBottom: 10,
    },

    /* Opponent cards */
    opponentCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 14,
      gap: 8,
    },
    teamBadge: {
      width: 34,
      height: 34,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamBadgeText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    vsText: {
      fontSize: 10,
      fontWeight: '700',
    },
    opponentInfo: {
      flex: 1,
    },
    opponentName: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 1,
    },
    opponentDate: {
      fontSize: 12,
    },
    scoutingBadge: {
      borderRadius: 6,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    scoutingBadgeText: {
      fontSize: 10,
      fontWeight: '700',
    },

    /* Report container */
    reportContainer: {
      marginTop: 8,
      gap: 12,
    },

    /* Report header card */
    reportHeader: {
      backgroundColor: DARK_PREMIUM,
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 16,
    },
    reportHeaderTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    reportOpponentName: {
      fontSize: 18,
      fontWeight: '700',
      color: '#F0E8DC',
      marginBottom: 4,
    },
    reportRecord: {
      fontSize: 13,
      color: '#8A837C',
    },
    teamKrCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    teamKrLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: '#8A837C',
      letterSpacing: 1,
    },
    teamKrValue: {
      fontSize: 18,
      fontWeight: '800',
      color: GAIN,
    },
    reportBadgeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    systemBadge: {
      borderRadius: 6,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: '#261D17',
    },
    systemBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#F0E8DC',
    },

    /* Report section */
    reportSection: {
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 14,
    },
    reportSectionHeader: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginBottom: 12,
    },
    reportInlineHeader: {
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 1.2,
      marginHorizontal: 16,
      marginBottom: 8,
    },

    /* Play type bars */
    playRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 6,
    },
    playName: {
      width: 72,
      fontSize: 12,
      fontWeight: '600',
    },
    playBarContainer: {
      flex: 1,
      height: 8,
      backgroundColor: C.separator,
      borderRadius: 4,
      overflow: 'hidden',
    },
    playBarFill: {
      height: '100%',
      borderRadius: 4,
    },
    playFreq: {
      width: 32,
      fontSize: 11,
      fontWeight: '600',
      textAlign: 'right',
    },
    playPpp: {
      width: 34,
      fontSize: 11,
      fontWeight: '700',
      textAlign: 'right',
    },
    playPppLabel: {
      fontSize: 10,
    },

    /* Key players scroll */
    playerScroll: {
      marginHorizontal: 0,
    },
    playerScrollContent: {
      paddingHorizontal: 16,
      gap: 10,
    },
    playerCard: {
      width: 140,
      backgroundColor: DARK_PREMIUM,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 6,
    },
    playerKrCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playerKrValue: {
      fontSize: 16,
      fontWeight: '800',
    },
    playerName: {
      fontSize: 12,
      fontWeight: '700',
      color: '#F0E8DC',
      textAlign: 'center',
    },
    playerPosBadge: {
      borderRadius: 4,
      paddingHorizontal: 6,
      paddingVertical: 2,
      backgroundColor: '#261D17',
    },
    playerPosText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#8A837C',
    },
    playerStats: {
      flexDirection: 'row',
      gap: 4,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    playerStatText: {
      fontSize: 10,
      color: '#8A837C',
    },
    gamePlanBox: {
      borderTopWidth: 1,
      borderTopColor: '#3D352E',
      paddingTop: 6,
      width: '100%',
    },
    gamePlanLabel: {
      fontSize: 9,
      fontWeight: '700',
      color: CAUTION,
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    gamePlanText: {
      fontSize: 10,
      color: '#8A837C',
      lineHeight: 13,
    },

    /* Matchup matrix */
    matchupRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      gap: 8,
    },
    matchupBadge: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: DARK_PREMIUM,
      alignItems: 'center',
      justifyContent: 'center',
    },
    matchupInitials: {
      fontSize: 12,
      fontWeight: '700',
    },
    matchupKr: {
      fontSize: 10,
      fontWeight: '800',
    },
    matchupVs: {
      fontSize: 11,
      fontWeight: '600',
    },
    matchupResult: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    matchupArrow: {
      fontSize: 18,
      fontWeight: '800',
    },
    matchupLabel: {
      fontSize: 12,
      fontWeight: '700',
    },

    /* Dipson game plan */
    dipsonCard: {
      backgroundColor: DARK_PREMIUM,
      marginHorizontal: 16,
      borderRadius: 14,
      padding: 14,
    },
    dipsonHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    dipsonHeaderText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#F0E8DC',
    },
    dipsonSuggestion: {
      backgroundColor: '#261D17',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
      gap: 8,
    },
    dipsonSuggestionText: {
      fontSize: 13,
      color: '#F0E8DC',
      lineHeight: 18,
    },
    implementBtn: {
      alignSelf: 'flex-start',
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 5,
      backgroundColor: '#F0E8DC',
    },
    implementBtnText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
    },

    /* Self scout */
    selfScoutCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 14,
      marginHorizontal: 16,
      marginBottom: 8,
      padding: 16,
    },
    selfScoutInfo: {
      flex: 1,
    },
    selfScoutTitle: {
      fontSize: 15,
      fontWeight: '600',
      marginBottom: 3,
    },
    selfScoutSub: {
      fontSize: 13,
    },
  });
}
