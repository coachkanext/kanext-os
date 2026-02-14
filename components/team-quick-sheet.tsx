/**
 * Team Quick Sheet
 * Comprehensive "whole team in 5 seconds" bottom sheet.
 * Opens on logo tap/long-press from Home and Roster headers.
 * Traditional / KaNeXT toggle switches the stats section.
 */

import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { FMU_GAMES, FMU_RECORD, FMU_STANDINGS } from '@/data/fmu';
import { coachingStaff } from '@/data/sun-conference/coaching-staff';
import { teamStats } from '@/data/sun-conference/florida-memorial/team-stats';
import { PLAYER_CLUSTERS, CLUSTER_SUBCLUSTERS, getPlayerSubclusters } from '@/data/roster-data';
import type { ClusterRatings } from '@/data/roster-data';

// FMU seal
const FMU_SEAL = require('@/assets/images/fmu-seal.png');

// ── Staff data ──
const fmuStaff = coachingStaff.find((s) => s.program_id === 'florida-memorial');
const headCoach = fmuStaff?.head_coach_name ?? 'TBD';
const assistants = fmuStaff?.assistant_coaches
  .map((a) => {
    const parts = a.name.split(' ');
    return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
  })
  .join(', ') ?? '';

// ── Season stats (2025-26) ──
const stats2526 = teamStats.find((s) => s.season === '2025-26');
const G = stats2526?.games ?? 1;
const PTS = stats2526?.points ?? 0;
const FG = stats2526?.fg ?? 0;
const FGA = stats2526?.fga ?? 1;
const TPT = stats2526?.three_pt ?? 0;
const TPA = stats2526?.three_pa ?? 1;
const FT = stats2526?.ft ?? 0;
const FTA = stats2526?.fta ?? 1;
const OREB = stats2526?.offensive_rebounds ?? 0;
const DREB = stats2526?.defensive_rebounds ?? 0;
const AST = stats2526?.assists ?? 0;
const TO = stats2526?.turnovers ?? 0;
const STL = stats2526?.steals ?? 0;
const BLK = stats2526?.blocks ?? 0;

// Derived stats
const PPG = (PTS / G).toFixed(1);
const eFGPct = (((FG + 0.5 * TPT) / FGA) * 100).toFixed(1);
const possessions = FGA - OREB + TO + 0.475 * FTA;
const TOPct = ((TO / possessions) * 100).toFixed(1);
const threePtPct = ((TPT / TPA) * 100).toFixed(1);
const FTPct = ((FT / FTA) * 100).toFixed(1);
const APG = (AST / G).toFixed(1);
const RPG = ((OREB + DREB) / G).toFixed(1);
const SPG = (STL / G).toFixed(1);
const BPG = (BLK / G).toFixed(1);

// Mock defensive stats (seeded from conf hash)
const confHash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0; return Math.abs(h); };
const dh = confHash('Florida Memorial Def');
const OPP_PPG = (68 + (dh % 12)).toFixed(1);
const OPP_eFG = (42 + (dh % 10)).toFixed(1);
const ForceTOPct = (18 + ((dh >> 4) % 8)).toFixed(1);
const OPP_3Pct = (30 + ((dh >> 8) % 8)).toFixed(1);

// ── Conference position ──
const FMU_CONF_POSITION = FMU_STANDINGS.findIndex((r) => r.team === 'Florida Memorial') + 1;
const fmuStreak = FMU_STANDINGS.find((r) => r.team === 'Florida Memorial')?.streak ?? '—';

// ── Team cluster averages ──
const clusterKeys: (keyof ClusterRatings)[] = ['shooting', 'finishing', 'playmaking', 'perimeter_defense', 'interior_defense', 'rebounding', 'frame'];
const clusterLabels: Record<keyof ClusterRatings, string> = {
  shooting: 'Shooting',
  finishing: 'Finishing',
  playmaking: 'Playmaking',
  perimeter_defense: 'On-Ball Defense',
  interior_defense: 'Team Defense',
  rebounding: 'Rebounding',
  frame: 'Physical',
};

const playerEntries = Object.values(PLAYER_CLUSTERS);
const teamClusterAvg: Record<keyof ClusterRatings, number> = {} as any;
for (const key of clusterKeys) {
  const sum = playerEntries.reduce((acc, p) => acc + p[key], 0);
  teamClusterAvg[key] = Math.round(sum / playerEntries.length);
}

// Derive "Keys" from strongest/weakest clusters
function deriveKeys(): string[] {
  const sorted = clusterKeys.map((k) => ({ key: k, avg: teamClusterAvg[k] })).sort((a, b) => b.avg - a.avg);
  const keys: string[] = [];
  keys.push(`${clusterLabels[sorted[0].key]} is the team's strongest area (${sorted[0].avg})`);
  keys.push(`${clusterLabels[sorted[sorted.length - 1].key]} needs the most development (${sorted[sorted.length - 1].avg})`);
  const offAvg = Math.round((teamClusterAvg.shooting + teamClusterAvg.finishing + teamClusterAvg.playmaking) / 3);
  const defAvg = Math.round((teamClusterAvg.perimeter_defense + teamClusterAvg.interior_defense + teamClusterAvg.rebounding + teamClusterAvg.frame) / 4);
  keys.push(offAvg > defAvg ? 'Offense-first identity — defense is the growth edge' : 'Defense-first identity — offense is the growth edge');
  return keys;
}
const CLUSTER_KEYS = deriveKeys();

// ── Team subcluster averages (avg each player's subcluster rating per cluster) ──
const playerNumbers = Object.keys(PLAYER_CLUSTERS);
const teamSubclusterAvg: Record<keyof ClusterRatings, { name: string; rating: number }[]> = {} as any;
for (const clusterKey of clusterKeys) {
  const subNames = CLUSTER_SUBCLUSTERS[clusterKey];
  teamSubclusterAvg[clusterKey] = subNames.map((subName, subIdx) => {
    const sum = playerNumbers.reduce((acc, pn) => {
      const subs = getPlayerSubclusters(pn, clusterKey);
      return acc + (subs[subIdx]?.rating ?? 0);
    }, 0);
    return { name: subName, rating: Math.round(sum / playerNumbers.length) };
  });
}

// ── Games helpers ──
const upcomingGames = FMU_GAMES.filter((g) => g.status === 'upcoming').slice(0, 2);
const recentGames = [...FMU_GAMES].filter((g) => g.status === 'final').reverse().slice(0, 2);

// ── Sim win % (logistic from KR gap) ──
function simWinPct(teamKR: number, oppKR: number): number {
  const gap = teamKR - oppKR;
  const pct = 1 / (1 + Math.exp(-0.08 * gap));
  return Math.round(pct * 100);
}

// ── Bar color ──
function barColor(v: number): string {
  if (v >= 75) return '#4ade80';
  if (v >= 60) return '#facc15';
  return '#f87171';
}

// ── Props ──
export interface TeamQuickSheetProps {
  visible: boolean;
  onClose: () => void;
  teamKR: number;
  offKR: number;
  defKR: number;
  offSystemName: string;
  defSystemName: string;
}

export function TeamQuickSheet({
  visible,
  onClose,
  teamKR,
  offKR,
  defKR,
  offSystemName,
  defSystemName,
}: TeamQuickSheetProps) {
  const [activeView, setActiveView] = useState<'traditional' | 'kanext'>('traditional');
  const [expandedCluster, setExpandedCluster] = useState<keyof ClusterRatings | null>(null);

  return (
    <BottomSheet visible={visible} onClose={onClose}>
      {visible && (
        <>
          {/* ===== SECTION 1: IDENTITY HEADER ===== */}
          <View style={s.identityRow}>
            <Image source={FMU_SEAL} style={s.logo} resizeMode="contain" />
            <View style={s.identityText}>
              <Text style={s.teamName}>Florida Memorial</Text>
              <Text style={s.teamSubline}>NAIA {'\u00B7'} Sun Conference {'\u00B7'} Miami Gardens, FL</Text>
            </View>
            <View style={s.krBadge}>
              <Text style={s.krValue}>{teamKR}</Text>
              <View style={s.krSubRow}>
                <Text style={s.krSubLabel}>O {offKR}</Text>
                <Text style={s.krSubSep}>{'\u00B7'}</Text>
                <Text style={s.krSubLabel}>D {defKR}</Text>
              </View>
            </View>
          </View>

          {/* ===== SECTION 2: STAFF SNAPSHOT ===== */}
          <Text style={s.sectionLabel}>STAFF</Text>
          <View style={s.card}>
            <Text style={s.staffHead}>Head Coach: {headCoach}</Text>
            <Text style={s.staffAssistants}>Assistants: {assistants}</Text>
          </View>

          {/* ===== SECTION 3: SEASON SNAPSHOT ===== */}
          <Text style={s.sectionLabel}>SEASON</Text>
          <View style={s.seasonRow}>
            <SnapshotItem value={FMU_RECORD.overall} label="Overall" />
            <SnapshotItem value={FMU_RECORD.conference} label="Conference" />
            <SnapshotItem value={fmuStreak} label="Streak" isStreak />
            <SnapshotItem value={`#${FMU_CONF_POSITION}`} label="Conf Rank" />
          </View>

          {/* ===== TOGGLE: Traditional / KaNeXT ===== */}
          <View style={s.toggleRow}>
            <Text style={s.sectionLabel}>TEAM STATS</Text>
            <View style={s.togglePills}>
              <Pressable
                style={[s.pill, activeView === 'traditional' && s.pillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveView('traditional'); }}
              >
                <Text style={[s.pillText, activeView === 'traditional' && s.pillTextActive]}>Traditional</Text>
              </Pressable>
              <Pressable
                style={[s.pill, activeView === 'kanext' && s.pillActive]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveView('kanext'); }}
              >
                <Text style={[s.pillText, activeView === 'kanext' && s.pillTextActive]}>KaNeXT</Text>
              </Pressable>
            </View>
          </View>

          {/* ===== SECTION 4: STATS ===== */}
          {activeView === 'traditional' ? (
            <View style={s.card}>
              <View style={s.statColumns}>
                {/* Offense column */}
                <View style={s.statCol}>
                  <Text style={s.statColHeader}>OFFENSE</Text>
                  <StatRow label="PPG" value={PPG} />
                  <StatRow label="eFG%" value={`${eFGPct}%`} />
                  <StatRow label="3PT%" value={`${threePtPct}%`} />
                  <StatRow label="TO%" value={`${TOPct}%`} />
                  <StatRow label="APG" value={APG} />
                </View>
                {/* Defense column */}
                <View style={s.statCol}>
                  <Text style={s.statColHeader}>DEFENSE</Text>
                  <StatRow label="Opp PPG" value={OPP_PPG} />
                  <StatRow label="Opp eFG%" value={`${OPP_eFG}%`} />
                  <StatRow label="Opp 3PT%" value={`${OPP_3Pct}%`} />
                  <StatRow label="Force TO%" value={`${ForceTOPct}%`} />
                  <StatRow label="BPG" value={BPG} />
                </View>
              </View>
              {/* Rebounding row */}
              <View style={s.rebRow}>
                <Text style={s.statColHeader}>REBOUNDING</Text>
                <View style={s.rebStats}>
                  <StatRow label="RPG" value={RPG} />
                  <StatRow label="SPG" value={SPG} />
                  <StatRow label="FT%" value={`${FTPct}%`} />
                </View>
              </View>
            </View>
          ) : (
            <View style={s.card}>
              {clusterKeys.map((key) => {
                const avg = teamClusterAvg[key];
                const isExpanded = expandedCluster === key;
                const subs = teamSubclusterAvg[key];
                return (
                  <View key={key}>
                    <Pressable
                      style={s.clusterRow}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setExpandedCluster(isExpanded ? null : key);
                      }}
                    >
                      <View style={s.clusterLabelRow}>
                        <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={10} color="#555" />
                        <Text style={s.clusterLabel}>{clusterLabels[key]}</Text>
                      </View>
                      <View style={s.clusterBarBg}>
                        <View style={[s.clusterBarFill, { width: `${avg}%`, backgroundColor: barColor(avg) }]} />
                      </View>
                      <Text style={[s.clusterValue, { color: barColor(avg) }]}>{avg}</Text>
                    </Pressable>
                    {isExpanded && (
                      <View style={s.subclusterContainer}>
                        {subs.map((sub) => (
                          <View key={sub.name} style={s.subclusterRow}>
                            <Text style={s.subclusterLabel}>{sub.name}</Text>
                            <View style={s.subclusterBarBg}>
                              <View style={[s.subclusterBarFill, { width: `${sub.rating}%`, backgroundColor: barColor(sub.rating) }]} />
                            </View>
                            <Text style={[s.subclusterValue, { color: barColor(sub.rating) }]}>{sub.rating}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
              {/* Keys */}
              <View style={s.keysSection}>
                <Text style={s.keysTitle}>KEYS</Text>
                {CLUSTER_KEYS.map((k, i) => (
                  <View key={i} style={s.keyRow}>
                    <Text style={s.keyBullet}>{i + 1}.</Text>
                    <Text style={s.keyText}>{k}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* ===== SECTION 5: UPCOMING / RECENT ===== */}
          {upcomingGames.length > 0 && (
            <>
              <Text style={s.sectionLabel}>UPCOMING</Text>
              <View style={s.card}>
                {upcomingGames.map((g) => {
                  const sim = simWinPct(teamKR, g.opponentKR ?? 70);
                  return (
                    <View key={g.id} style={s.gameRow}>
                      <Text style={s.gameDate}>{g.date}</Text>
                      <Text style={s.gameSep}>{'\u00B7'}</Text>
                      <Text style={s.gameOpp}>{g.location === 'Away' ? '@ ' : 'vs '}{g.opponent}</Text>
                      <Text style={[s.simPct, { color: sim >= 50 ? '#4ade80' : '#f87171' }]}>{sim}%</Text>
                      <Text style={s.gameTime}>{g.gameTime}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
          {recentGames.length > 0 && (
            <>
              <Text style={s.sectionLabel}>RECENT</Text>
              <View style={s.card}>
                {recentGames.map((g) => {
                  const isWin = g.score?.startsWith('W');
                  const sim = simWinPct(teamKR, g.opponentKR ?? 70);
                  return (
                    <View key={g.id} style={s.gameRow}>
                      <Text style={[s.gameResult, { color: isWin ? '#4ade80' : '#f87171' }]}>{g.score}</Text>
                      <Text style={s.gameSep}>{'\u00B7'}</Text>
                      <Text style={s.gameOpp}>{g.location === 'Away' ? '@ ' : 'vs '}{g.opponent}</Text>
                      <Text style={[s.simPct, { color: sim >= 50 ? '#4ade80' : '#f87171' }]}>{sim}%</Text>
                      <Text style={s.gameDateSmall}>{g.date}</Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}

        </>
      )}
    </BottomSheet>
  );
}

// ── Subcomponents ──

function SnapshotItem({ value, label, isStreak }: { value: string; label: string; isStreak?: boolean }) {
  const streakColor = isStreak
    ? value.startsWith('W') ? '#4ade80' : value.startsWith('L') ? '#f87171' : '#fff'
    : '#fff';
  return (
    <View style={s.snapItem}>
      <Text style={[s.snapValue, isStreak && { color: streakColor }]}>{value}</Text>
      <Text style={s.snapLabel}>{label}</Text>
    </View>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statRow}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={s.statValue}>{value}</Text>
    </View>
  );
}

// ── Styles ──

const s = StyleSheet.create({
  // Identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 48,
    height: 48,
    marginRight: 12,
  },
  identityText: {
    flex: 1,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  teamSubline: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  krBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  krValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    lineHeight: 26,
  },
  krSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  krSubLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
  },
  krSubSep: {
    fontSize: 12,
    color: '#555',
  },

  // Section labels
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: '#6e6e6e',
    marginBottom: 8,
    marginTop: 4,
  },

  // Card
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 16,
  },

  // Staff
  staffHead: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  staffAssistants: {
    fontSize: 13,
    fontWeight: '400',
    color: '#888',
    marginTop: 4,
  },

  // Season snapshot
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 14,
    marginBottom: 16,
  },
  snapItem: {
    alignItems: 'center',
    flex: 1,
  },
  snapValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  snapLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    marginTop: 4,
  },

  // Toggle
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  togglePills: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 2,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  pillActive: {
    backgroundColor: '#333',
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  pillTextActive: {
    color: '#fff',
  },

  // Traditional stats
  statColumns: {
    flexDirection: 'row',
    gap: 16,
  },
  statCol: {
    flex: 1,
  },
  statColHeader: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: '#6e6e6e',
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'right',
    minWidth: 44,
  },
  rebRow: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 12,
  },
  rebStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 8,
  },

  // KaNeXT clusters
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  clusterLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 108,
    gap: 4,
  },
  clusterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  clusterBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  clusterBarFill: {
    height: 8,
    borderRadius: 4,
  },
  clusterValue: {
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },

  // Subclusters
  subclusterContainer: {
    marginLeft: 18,
    paddingLeft: 10,
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255,255,255,0.06)',
    marginBottom: 6,
  },
  subclusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  subclusterLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888',
    width: 110,
  },
  subclusterBarBg: {
    flex: 1,
    height: 5,
    backgroundColor: '#222',
    borderRadius: 3,
    marginHorizontal: 8,
    overflow: 'hidden',
  },
  subclusterBarFill: {
    height: 5,
    borderRadius: 3,
  },
  subclusterValue: {
    fontSize: 11,
    fontWeight: '600',
    width: 24,
    textAlign: 'right',
  },

  // Keys
  keysSection: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: 10,
  },
  keysTitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.0,
    color: '#6e6e6e',
    marginBottom: 8,
  },
  keyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  keyBullet: {
    fontSize: 12,
    fontWeight: '700',
    color: '#888',
    width: 18,
  },
  keyText: {
    fontSize: 12,
    color: '#ccc',
    flex: 1,
    lineHeight: 17,
  },

  // Games
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 6,
  },
  gameDate: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    width: 50,
  },
  gameSep: {
    fontSize: 12,
    color: '#444',
  },
  gameOpp: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  gameTime: {
    fontSize: 12,
    fontWeight: '500',
    color: '#888',
  },
  gameResult: {
    fontSize: 13,
    fontWeight: '700',
    width: 66,
  },
  simPct: {
    fontSize: 12,
    fontWeight: '700',
    minWidth: 32,
    textAlign: 'right',
  },
  gameDateSmall: {
    fontSize: 11,
    color: '#666',
  },

});
