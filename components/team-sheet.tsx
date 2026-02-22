/**
 * Universal Team Sheet V2 — 10 canonical tabs + RBAC gating
 *
 * "One sheet, many lenses" — never create per-role UI pages.
 * Tabs hide/show based on the active sports role lens.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, Colors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

// RBAC
import {
  getSportsRole,
  getTeamSheetTabs,
  getKRVisibility,
  formatKR,
  canSeeSensitive,
  type TeamTab,
  type SportsRoleLens,
} from '@/utils/sports-rbac';

// Data
import {
  KaNeXT_GAMES,
  KaNeXT_RECORD,
  KaNeXT_STANDINGS,
  KaNeXT_KR,
  KaNeXT_NEWS,
  KaNeXT_LEADERS,
  KaNeXT_PLAYER_BIOS,
  KaNeXT_GAME_STATS,
  type KaNeXTGame,
  type NewsItem,
} from '@/data/fmu';
import {
  PLAYER_CLUSTERS,
  ROSTER_META,
  computeOffKR,
  computeDefKR,
  type ClusterRatings,
} from '@/data/roster-data';
import { OFFENSIVE_STYLES, DEFENSIVE_STYLES } from '@/data/mock-program-context';
import {
  KaNeXT_STAFF,
  KaNeXT_OPERATIONS,
  KaNeXT_FINANCE,
  KaNeXT_COMPLIANCE,
  KaNeXT_LINEUPS,
  KaNeXT_SYSTEMS,
  type StaffMember,
  type LineupPreset,
  type BudgetLine,
  type ComplianceItem,
} from '@/data/mock-team-operations';

// =============================================================================
// TYPES
// =============================================================================

export interface TeamSheetProps {
  visible: boolean;
  onClose: () => void;
  teamId?: string;
  membershipId?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

function formatPct(spent: number, allocated: number): string {
  if (allocated === 0) return '0%';
  return `${Math.round((spent / allocated) * 100)}%`;
}

function getComplianceColor(status: string): string {
  switch (status) {
    case 'clear': return '#22C55E';
    case 'pending': return '#F59E0B';
    case 'violation': return '#EF4444';
    default: return '#A1A1AA';
  }
}

function getNetRatingColor(nr: number): string {
  if (nr >= 5) return '#22C55E';
  if (nr >= 0) return '#F59E0B';
  return '#EF4444';
}

// =============================================================================
// SECTION LABEL
// =============================================================================

function SectionLabel({ label, colors }: { label: string; colors: any }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
      {label}
    </Text>
  );
}

// =============================================================================
// CARD
// =============================================================================

function Card({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      {children}
    </View>
  );
}

// =============================================================================
// STAT ROW
// =============================================================================

function StatRow({ label, value, colors, valueColor }: { label: string; value: string; colors: any; valueColor?: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TeamSheet({
  visible,
  onClose,
  teamId,
  membershipId,
}: TeamSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const { state } = useAppContext();

  const effectiveMembership = membershipId ?? state.activeContext.membership_id;
  const role = useMemo(() => getSportsRole(effectiveMembership), [effectiveMembership]);
  const krVisibility = useMemo(() => getKRVisibility(role), [role]);
  const sensitive = useMemo(() => canSeeSensitive(role), [role]);

  const tabs = useMemo(() => getTeamSheetTabs(role), [role]);
  const [activeTab, setActiveTab] = useState<TeamTab>('overview');

  // Reset tab when sheet opens
  useEffect(() => {
    if (visible) {
      const firstTab = tabs[0]?.key ?? 'overview';
      setActiveTab(firstTab);
    }
  }, [visible, tabs]);

  // Team data
  const record = KaNeXT_RECORD;
  const teamKR = KaNeXT_KR;
  const offKRs = Object.values(PLAYER_CLUSTERS).map(computeOffKR);
  const defKRs = Object.values(PLAYER_CLUSTERS).map(computeDefKR);
  const avgOffKR = Math.round(offKRs.reduce((a, b) => a + b, 0) / offKRs.length);
  const avgDefKR = Math.round(defKRs.reduce((a, b) => a + b, 0) / defKRs.length);

  // Streak
  const streak = useMemo(() => {
    const finalGames = KaNeXT_GAMES.filter((g) => g.status === 'final' && g.score);
    if (finalGames.length === 0) return 'N/A';
    let count = 0;
    let type: 'W' | 'L' | null = null;
    for (let i = finalGames.length - 1; i >= 0; i--) {
      const score = finalGames[i].score!;
      const won = score.startsWith('W');
      const t = won ? 'W' : 'L';
      if (type === null) { type = t; count = 1; }
      else if (t === type) count++;
      else break;
    }
    return type ? `${type}${count}` : 'N/A';
  }, []);

  // Next game
  const nextGame = useMemo(() => {
    return KaNeXT_GAMES.find((g) => g.status === 'upcoming') ?? null;
  }, []);

  // Standings position
  const standingsPos = useMemo(() => {
    const fmuEntry = KaNeXT_STANDINGS.find((s: any) => s.school?.includes('Carroll College'));
    return fmuEntry ? `${KaNeXT_STANDINGS.indexOf(fmuEntry) + 1}/${KaNeXT_STANDINGS.length}` : '—';
  }, []);

  // Roster summary
  const rosterPlayers = useMemo(() => {
    return Object.entries(KaNeXT_PLAYER_BIOS).map(([jersey, bio]) => {
      const clusters = PLAYER_CLUSTERS[jersey];
      const meta = ROSTER_META[jersey];
      const kr = clusters
        ? Math.round((computeOffKR(clusters) * 0.53 + computeDefKR(clusters) * 0.47))
        : 0;
      return { jersey, bio, clusters, meta, kr };
    }).sort((a, b) => b.kr - a.kr);
  }, []);

  // Team averages from leaders
  const teamAvgs = useMemo(() => {
    if (KaNeXT_LEADERS.length === 0) return null;
    const count = KaNeXT_LEADERS.length;
    const ppg = KaNeXT_LEADERS.reduce((s, l) => s + l.ppg, 0) / count;
    const rpg = KaNeXT_LEADERS.reduce((s, l) => s + l.rpg, 0) / count;
    const apg = KaNeXT_LEADERS.reduce((s, l) => s + l.apg, 0) / count;
    return {
      ppg: ppg.toFixed(1),
      rpg: rpg.toFixed(1),
      apg: apg.toFixed(1),
    };
  }, []);

  // Upcoming schedule
  const upcomingGames = useMemo(() => {
    return KaNeXT_GAMES.filter((g) => g.status === 'upcoming').slice(0, 5);
  }, []);

  // Recent results
  const recentResults = useMemo(() => {
    return KaNeXT_GAMES.filter((g) => g.status === 'final').slice(-5).reverse();
  }, []);

  return (
    <BottomSheet useModal visible={visible} onClose={onClose}>
      {/* ═══════════ HEADER ═══════════ */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.teamName, { color: colors.text }]}>
              Carroll College Fighting Saints
            </Text>
            <Text style={[styles.teamSub, { color: colors.textSecondary }]}>
              NAIA · Frontier Conference · Men's Basketball
            </Text>
          </View>
          <Pressable onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Record + Streak */}
        <View style={styles.recordRow}>
          <View style={styles.recordBlock}>
            <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>RECORD</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>
              {record.overall} ({record.conference})
            </Text>
          </View>
          <View style={styles.recordBlock}>
            <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>STREAK</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>{streak}</Text>
          </View>
          <View style={styles.recordBlock}>
            <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>CONF</Text>
            <Text style={[styles.recordValue, { color: colors.text }]}>{standingsPos}</Text>
          </View>
        </View>

        {/* Team KR strip (RBAC-gated) */}
        {krVisibility !== 'hidden' && (
          <View style={styles.krStrip}>
            <View style={styles.krBlock}>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
              <Text style={[styles.krNum, { color: colors.text }]}>{formatKR(teamKR, krVisibility)}</Text>
            </View>
            <View style={styles.krBlock}>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>OFF KR</Text>
              <Text style={[styles.krNum, { color: colors.text }]}>{formatKR(avgOffKR, krVisibility)}</Text>
            </View>
            <View style={styles.krBlock}>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>DEF KR</Text>
              <Text style={[styles.krNum, { color: colors.text }]}>{formatKR(avgDefKR, krVisibility)}</Text>
            </View>
          </View>
        )}

        {/* Next game */}
        {nextGame && (
          <View style={[styles.nextGame, { borderTopColor: colors.divider }]}>
            <Text style={[styles.nextGameLabel, { color: colors.textTertiary }]}>NEXT</Text>
            <Text style={[styles.nextGameText, { color: colors.text }]}>
              {nextGame.opponent} · {nextGame.date}
            </Text>
          </View>
        )}
      </View>

      {/* ═══════════ TAB PILLS ═══════════ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tabPill,
                { borderColor: colors.border },
                isActive && { backgroundColor: colors.text, borderColor: colors.text },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
            >
              <Text style={[
                styles.tabText,
                { color: colors.textSecondary },
                isActive && { color: colors.background },
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ═══════════ TAB CONTENT ═══════════ */}

      {/* ─── OVERVIEW ─── */}
      {activeTab === 'overview' && (
        <View style={styles.tabContent}>
          <SectionLabel label="SEASON SNAPSHOT" colors={colors} />
          <Card colors={colors}>
            <StatRow label="Overall Record" value={record.overall} colors={colors} />
            <StatRow label="Conference Record" value={record.conference} colors={colors} />
            <StatRow label="Current Streak" value={streak} colors={colors} />
            <StatRow label="Conference Standing" value={standingsPos} colors={colors} />
            {teamAvgs && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <StatRow label="Team PPG (avg)" value={teamAvgs.ppg} colors={colors} />
                <StatRow label="Team RPG (avg)" value={teamAvgs.rpg} colors={colors} />
                <StatRow label="Team APG (avg)" value={teamAvgs.apg} colors={colors} />
              </>
            )}
          </Card>

          {/* Recent News */}
          {KaNeXT_NEWS.length > 0 && (
            <>
              <SectionLabel label="RECENT NEWS" colors={colors} />
              <Card colors={colors}>
                {KaNeXT_NEWS.slice(0, 3).map((item: NewsItem, i: number) => (
                  <View key={i} style={i > 0 ? { marginTop: 10 } : undefined}>
                    <Text style={[styles.newsTitle, { color: colors.text }]}>{item.headline}</Text>
                    <Text style={[styles.newsSub, { color: colors.textSecondary }]} numberOfLines={2}>
                      {item.date} · {item.type}
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </View>
      )}

      {/* ─── ROSTER ─── */}
      {activeTab === 'roster' && (
        <View style={styles.tabContent}>
          <SectionLabel label={`ROSTER (${rosterPlayers.length})`} colors={colors} />
          <Card colors={colors}>
            {/* Header */}
            <View style={styles.rosterHeader}>
              <Text style={[styles.rosterColName, { color: colors.textTertiary }]}>#</Text>
              <Text style={[styles.rosterColNameWide, { color: colors.textTertiary }]}>NAME</Text>
              <Text style={[styles.rosterColName, { color: colors.textTertiary }]}>POS</Text>
              <Text style={[styles.rosterColName, { color: colors.textTertiary }]}>YR</Text>
              {krVisibility !== 'hidden' && (
                <Text style={[styles.rosterColName, { color: colors.textTertiary }]}>KR</Text>
              )}
              <Text style={[styles.rosterColName, { color: colors.textTertiary }]}>STATUS</Text>
            </View>
            {rosterPlayers.map((p) => {
              const statusColor =
                p.meta?.status === 'available' ? '#22C55E' :
                p.meta?.status === 'injured' ? '#EF4444' :
                p.meta?.status === 'out' ? '#EF4444' :
                p.meta?.status === 'redshirt' ? accent : '#A1A1AA';
              return (
                <View key={p.jersey} style={[styles.rosterRow, { borderTopColor: colors.divider }]}>
                  <Text style={[styles.rosterCol, { color: colors.textSecondary }]}>{p.jersey}</Text>
                  <Text style={[styles.rosterColWide, { color: colors.text }]} numberOfLines={1}>
                    {p.bio.firstName} {p.bio.lastName}
                  </Text>
                  <Text style={[styles.rosterCol, { color: colors.textSecondary }]}>{p.bio.position}</Text>
                  <Text style={[styles.rosterCol, { color: colors.textSecondary }]}>
                    {p.bio.classYear?.substring(0, 2) ?? '—'}
                  </Text>
                  {krVisibility !== 'hidden' && (
                    <Text style={[styles.rosterCol, { color: colors.text, fontWeight: '700' }]}>
                      {formatKR(p.kr, krVisibility)}
                    </Text>
                  )}
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>
              );
            })}
          </Card>
        </View>
      )}

      {/* ─── SYSTEMS ─── */}
      {activeTab === 'systems' && (
        <View style={styles.tabContent}>
          <SectionLabel label="OFFENSIVE SYSTEM" colors={colors} />
          <Card colors={colors}>
            <Text style={[styles.systemLabel, { color: colors.text }]}>{KaNeXT_SYSTEMS.offensiveSystem.label}</Text>
            <Text style={[styles.systemDesc, { color: colors.textSecondary }]}>
              {KaNeXT_SYSTEMS.offensiveSystem.description}
            </Text>
          </Card>

          <SectionLabel label="DEFENSIVE SYSTEM" colors={colors} />
          <Card colors={colors}>
            <Text style={[styles.systemLabel, { color: colors.text }]}>{KaNeXT_SYSTEMS.defensiveSystem.label}</Text>
            <Text style={[styles.systemDesc, { color: colors.textSecondary }]}>
              {KaNeXT_SYSTEMS.defensiveSystem.description}
            </Text>
          </Card>

          <SectionLabel label="TEMPO" colors={colors} />
          <Card colors={colors}>
            <StatRow label="Style" value={KaNeXT_SYSTEMS.tempo.label} colors={colors} />
            <StatRow label="Possessions / Game" value={KaNeXT_SYSTEMS.tempo.possPerGame.toFixed(1)} colors={colors} />
          </Card>
        </View>
      )}

      {/* ─── PERFORMANCE ─── */}
      {activeTab === 'performance' && (
        <View style={styles.tabContent}>
          <SectionLabel label="TEAM AVERAGES" colors={colors} />
          <Card colors={colors}>
            {teamAvgs && (
              <>
                <StatRow label="Points Per Game" value={teamAvgs.ppg} colors={colors} />
                <StatRow label="Rebounds Per Game" value={teamAvgs.rpg} colors={colors} />
                <StatRow label="Assists Per Game" value={teamAvgs.apg} colors={colors} />
              </>
            )}
          </Card>

          <SectionLabel label="RECENT RESULTS" colors={colors} />
          <Card colors={colors}>
            {recentResults.map((g, i) => (
              <View key={g.id} style={[styles.gameRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[styles.gameOpp, { color: colors.text }]} numberOfLines={1}>{g.opponent}</Text>
                <Text style={[styles.gameScore, { color: g.score?.startsWith('W') ? '#22C55E' : '#EF4444' }]}>
                  {g.score ?? '—'}
                </Text>
              </View>
            ))}
          </Card>

          {/* Top Performers */}
          <SectionLabel label="STATISTICAL LEADERS" colors={colors} />
          <Card colors={colors}>
            {KaNeXT_LEADERS.slice(0, 5).map((l, i) => (
              <View key={l.number} style={[styles.leaderRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[styles.leaderName, { color: colors.text }]}>#{l.number} {l.name}</Text>
                <View style={styles.leaderStats}>
                  <Text style={[styles.leaderStat, { color: colors.textSecondary }]}>{l.ppg.toFixed(1)} PPG</Text>
                  <Text style={[styles.leaderStat, { color: colors.textSecondary }]}>{l.rpg.toFixed(1)} RPG</Text>
                  <Text style={[styles.leaderStat, { color: colors.textSecondary }]}>{l.apg.toFixed(1)} APG</Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* ─── LINEUPS ─── */}
      {activeTab === 'lineups' && (
        <View style={styles.tabContent}>
          <SectionLabel label="LINEUP PRESETS" colors={colors} />
          {KaNeXT_LINEUPS.map((lineup, li) => (
            <Card key={li} colors={colors}>
              <View style={styles.lineupHeader}>
                <Text style={[styles.lineupName, { color: colors.text }]}>{lineup.name}</Text>
                <Text style={[styles.lineupRating, { color: getNetRatingColor(lineup.netRating) }]}>
                  {lineup.netRating > 0 ? '+' : ''}{lineup.netRating.toFixed(1)} NET
                </Text>
              </View>
              <Text style={[styles.lineupMins, { color: colors.textTertiary }]}>
                {lineup.minutesTogether} min together
              </Text>
              {lineup.players.map((p, pi) => (
                <View key={pi} style={[styles.lineupPlayer, pi > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <Text style={[styles.lineupJersey, { color: colors.textSecondary }]}>#{p.jersey}</Text>
                  <Text style={[styles.lineupPlayerName, { color: colors.text }]}>{p.name}</Text>
                  <Text style={[styles.lineupPos, { color: colors.textTertiary }]}>{p.position}</Text>
                  <Text style={[styles.lineupPlayerMins, { color: colors.textSecondary }]}>{p.minutes} min</Text>
                </View>
              ))}
            </Card>
          ))}
        </View>
      )}

      {/* ─── SCHEDULE ─── */}
      {activeTab === 'schedule' && (
        <View style={styles.tabContent}>
          {upcomingGames.length > 0 && (
            <>
              <SectionLabel label="UPCOMING" colors={colors} />
              <Card colors={colors}>
                {upcomingGames.map((g, i) => (
                  <View key={g.id} style={[styles.gameRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.gameOpp, { color: colors.text }]}>{g.opponent}</Text>
                      <Text style={[styles.gameSub, { color: colors.textTertiary }]}>{g.date} · {g.location}</Text>
                    </View>
                    {g.opponentKR != null && krVisibility !== 'hidden' && (
                      <Text style={[styles.gameKR, { color: colors.textSecondary }]}>
                        KR {formatKR(g.opponentKR, krVisibility)}
                      </Text>
                    )}
                  </View>
                ))}
              </Card>
            </>
          )}

          <SectionLabel label="RECENT RESULTS" colors={colors} />
          <Card colors={colors}>
            {recentResults.map((g, i) => (
              <View key={g.id} style={[styles.gameRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.gameOpp, { color: colors.text }]}>{g.opponent}</Text>
                  <Text style={[styles.gameSub, { color: colors.textTertiary }]}>{g.date}</Text>
                </View>
                <Text style={[styles.gameScore, { color: g.score?.startsWith('W') ? '#22C55E' : '#EF4444' }]}>
                  {g.score ?? '—'}
                </Text>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* ─── STAFF ─── */}
      {activeTab === 'staff' && (
        <View style={styles.tabContent}>
          <SectionLabel label={`STAFF (${KaNeXT_STAFF.length})`} colors={colors} />
          <Card colors={colors}>
            {KaNeXT_STAFF.map((s, i) => (
              <View key={i} style={[styles.staffRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.staffName, { color: colors.text }]}>{s.name}</Text>
                  <Text style={[styles.staffTitle, { color: colors.textSecondary }]}>{s.title}</Text>
                </View>
                {sensitive && (
                  <View style={styles.staffContact}>
                    <Text style={[styles.staffContactText, { color: colors.textTertiary }]}>{s.email}</Text>
                  </View>
                )}
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* ─── OPERATIONS (R1 only) ─── */}
      {activeTab === 'operations' && sensitive && (
        <View style={styles.tabContent}>
          {/* Travel */}
          <SectionLabel label="TRAVEL SCHEDULE" colors={colors} />
          <Card colors={colors}>
            {KaNeXT_OPERATIONS.travel.map((t, i) => (
              <View key={i} style={[styles.travelRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.travelOpp, { color: colors.text }]}>vs {t.opponent}</Text>
                  <Text style={[styles.travelDetail, { color: colors.textSecondary }]}>
                    {t.date} · Depart {t.departure}
                  </Text>
                  {t.hotel && (
                    <Text style={[styles.travelDetail, { color: colors.textTertiary }]}>{t.hotel}</Text>
                  )}
                </View>
                <View style={[styles.travelStatus, { backgroundColor: t.status === 'confirmed' ? '#22C55E20' : '#F59E0B20' }]}>
                  <Text style={[styles.travelStatusText, { color: t.status === 'confirmed' ? '#22C55E' : '#F59E0B' }]}>
                    {t.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Facilities */}
          <SectionLabel label="FACILITIES" colors={colors} />
          <Card colors={colors}>
            {KaNeXT_OPERATIONS.facilities.map((f, i) => (
              <View key={i} style={[styles.facilityRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[styles.facilityName, { color: colors.text }]}>{f.name}</Text>
                <View style={[styles.facilityStatus, {
                  backgroundColor: f.status === 'available' ? '#22C55E20' : f.status === 'maintenance' ? '#EF444420' : '#F59E0B20'
                }]}>
                  <Text style={[styles.facilityStatusText, {
                    color: f.status === 'available' ? '#22C55E' : f.status === 'maintenance' ? '#EF4444' : '#F59E0B'
                  }]}>
                    {f.status}
                  </Text>
                </View>
              </View>
            ))}
          </Card>

          {/* Equipment */}
          <SectionLabel label="EQUIPMENT" colors={colors} />
          <Card colors={colors}>
            {KaNeXT_OPERATIONS.equipment.map((e, i) => (
              <View key={i} style={[styles.equipRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.equipItem, { color: colors.text }]}>{e.item}</Text>
                  <Text style={[styles.equipCategory, { color: colors.textTertiary }]}>{e.category} · Qty: {e.quantity}</Text>
                </View>
                <View style={[styles.equipCondition, {
                  backgroundColor: e.condition === 'good' ? '#22C55E20' : e.condition === 'fair' ? '#F59E0B20' : '#EF444420'
                }]}>
                  <Text style={[styles.equipConditionText, {
                    color: e.condition === 'good' ? '#22C55E' : e.condition === 'fair' ? '#F59E0B' : '#EF4444'
                  }]}>
                    {e.condition}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* ─── FINANCE (R1 only) ─── */}
      {activeTab === 'finance' && sensitive && (
        <View style={styles.tabContent}>
          <SectionLabel label="BUDGET OVERVIEW" colors={colors} />
          <Card colors={colors}>
            <StatRow label="Total Budget" value={formatCurrency(KaNeXT_FINANCE.totalBudget)} colors={colors} />
            <StatRow label="Total Spent" value={formatCurrency(KaNeXT_FINANCE.breakdown.reduce((s, b) => s + b.spent, 0))} colors={colors} />
            <StatRow label="Scholarship Allocation" value={formatCurrency(KaNeXT_FINANCE.scholarshipTotal)} colors={colors} />
            <StatRow label="NIL Pool" value={formatCurrency(KaNeXT_FINANCE.nilPoolTotal)} colors={colors} />
            <StatRow label="Revenue YTD" value={formatCurrency(KaNeXT_FINANCE.revenueYTD)} colors={colors} valueColor="#22C55E" />
          </Card>

          <SectionLabel label="BUDGET BREAKDOWN" colors={colors} />
          <Card colors={colors}>
            {KaNeXT_FINANCE.breakdown.map((b, i) => (
              <View key={i} style={[styles.budgetRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <Text style={[styles.budgetCat, { color: colors.text }]}>{b.category}</Text>
                <View style={styles.budgetNums}>
                  <Text style={[styles.budgetSpent, { color: colors.textSecondary }]}>
                    {formatCurrency(b.spent)} / {formatCurrency(b.allocated)}
                  </Text>
                  <View style={styles.budgetBar}>
                    <View style={[styles.budgetBarFill, {
                      width: `${Math.min((b.spent / b.allocated) * 100, 100)}%`,
                      backgroundColor: b.spent / b.allocated > 0.9 ? '#EF4444' : b.spent / b.allocated > 0.7 ? '#F59E0B' : '#22C55E',
                    }]} />
                  </View>
                </View>
              </View>
            ))}
          </Card>
        </View>
      )}

      {/* ─── COMPLIANCE (R1 only) ─── */}
      {activeTab === 'compliance' && sensitive && (
        <View style={styles.tabContent}>
          <SectionLabel label="COMPLIANCE CHECKLIST" colors={colors} />
          <Card colors={colors}>
            {KaNeXT_COMPLIANCE.checklist.map((c, i) => (
              <View key={c.id} style={[styles.compRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                <View style={[styles.compDot, { backgroundColor: getComplianceColor(c.status) }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.compLabel, { color: colors.text }]}>{c.label}</Text>
                  {c.note && <Text style={[styles.compNote, { color: colors.textTertiary }]}>{c.note}</Text>}
                </View>
                <Text style={[styles.compDate, { color: colors.textTertiary }]}>{c.date}</Text>
              </View>
            ))}
          </Card>

          {KaNeXT_COMPLIANCE.incidentLog.length > 0 && (
            <>
              <SectionLabel label="INCIDENT LOG" colors={colors} />
              <Card colors={colors}>
                {KaNeXT_COMPLIANCE.incidentLog.map((c, i) => (
                  <View key={c.id} style={[styles.compRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                    <View style={[styles.compDot, { backgroundColor: getComplianceColor(c.status) }]} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.compLabel, { color: colors.text }]}>{c.label}</Text>
                      {c.note && <Text style={[styles.compNote, { color: colors.textTertiary }]}>{c.note}</Text>}
                    </View>
                    <Text style={[styles.compDate, { color: colors.textTertiary }]}>{c.date}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}
        </View>
      )}
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  // Header
  header: {
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  teamName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  teamSub: {
    fontSize: 12,
    marginTop: 2,
  },
  recordRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  recordBlock: {
    alignItems: 'center',
  },
  recordLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  recordValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  krStrip: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 12,
    paddingTop: 10,
  },
  krBlock: {
    alignItems: 'center',
  },
  krLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  krNum: {
    fontSize: 18,
    fontWeight: '700',
  },
  nextGame: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextGameLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  nextGameText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Tabs
  tabScroll: {
    marginTop: 8,
    marginBottom: 12,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Tab content
  tabContent: {
    gap: 6,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: 12,
    marginBottom: 4,
  },

  // Card
  card: {
    borderRadius: BorderRadius.lg,
    padding: 14,
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  statLabel: {
    fontSize: 13,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },

  // News
  newsTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  newsSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Roster
  rosterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
  },
  rosterColName: {
    width: 36,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  rosterColNameWide: {
    flex: 1,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  rosterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  rosterCol: {
    width: 36,
    fontSize: 12,
    textAlign: 'center',
  },
  rosterColWide: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 4,
  },

  // Systems
  systemLabel: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  systemDesc: {
    fontSize: 13,
    lineHeight: 19,
  },

  // Games
  gameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  gameOpp: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  gameSub: {
    fontSize: 11,
    marginTop: 1,
  },
  gameScore: {
    fontSize: 13,
    fontWeight: '700',
  },
  gameKR: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Leaders
  leaderRow: {
    paddingVertical: 8,
  },
  leaderName: {
    fontSize: 13,
    fontWeight: '600',
  },
  leaderStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 3,
  },
  leaderStat: {
    fontSize: 12,
  },

  // Lineups
  lineupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineupName: {
    fontSize: 14,
    fontWeight: '700',
  },
  lineupRating: {
    fontSize: 13,
    fontWeight: '700',
  },
  lineupMins: {
    fontSize: 11,
    marginTop: 2,
    marginBottom: 8,
  },
  lineupPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  lineupJersey: {
    width: 32,
    fontSize: 12,
  },
  lineupPlayerName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  lineupPos: {
    width: 28,
    fontSize: 11,
    textAlign: 'center',
  },
  lineupPlayerMins: {
    width: 42,
    fontSize: 12,
    textAlign: 'right',
  },

  // Staff
  staffRow: {
    paddingVertical: 8,
  },
  staffName: {
    fontSize: 13,
    fontWeight: '600',
  },
  staffTitle: {
    fontSize: 12,
    marginTop: 1,
  },
  staffContact: {
    alignItems: 'flex-end',
  },
  staffContactText: {
    fontSize: 11,
  },

  // Travel
  travelRow: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelOpp: {
    fontSize: 13,
    fontWeight: '600',
  },
  travelDetail: {
    fontSize: 12,
    marginTop: 1,
  },
  travelStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  travelStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Facilities
  facilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
  },
  facilityName: {
    fontSize: 13,
    flex: 1,
  },
  facilityStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  facilityStatusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Equipment
  equipRow: {
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  equipItem: {
    fontSize: 13,
  },
  equipCategory: {
    fontSize: 11,
    marginTop: 1,
  },
  equipCondition: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  equipConditionText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Budget
  budgetRow: {
    paddingVertical: 8,
  },
  budgetCat: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  budgetNums: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  budgetSpent: {
    fontSize: 12,
    width: 110,
  },
  budgetBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#0B0F14',
    borderRadius: 3,
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Compliance
  compRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    gap: 8,
  },
  compDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  compLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  compNote: {
    fontSize: 12,
    marginTop: 2,
  },
  compDate: {
    fontSize: 11,
  },
});
