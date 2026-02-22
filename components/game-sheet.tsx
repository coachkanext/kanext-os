/**
 * Universal Game Sheet V2 — 5 canonical tabs + RBAC gating
 *
 * Pregame · Live · Postgame · AD Overlay · Incidents
 * "One sheet, many lenses" — tabs hide/show based on role.
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
import { Spacing, BorderRadius, Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';

// RBAC
import {
  getSportsRole,
  getGameSheetTabs,
  getKRVisibility,
  formatKR,
  canSeeSensitive,
  type GameTab,
  type SportsRoleLens,
} from '@/utils/sports-rbac';

// Data
import {
  KaNeXT_GAMES,
  KaNeXT_PREGAME,
  KaNeXT_BOX_SCORES,
  KaNeXT_GAME_STATS,
  KaNeXT_GAME_IMPACT,
  KaNeXT_GAME_FLOW,
  KaNeXT_GAME_BPR,
  KaNeXT_KR,
  getOpponentKR,
  getPGISColor,
  getTGISColor,
  type BoxScoreLine,
  type PregameSnapshot,
  type TeamGameImpact,
} from '@/data/fmu';
import {
  getGameDayRevenue,
  getGameIncidents,
  type GameDayRevenue,
  type IncidentReport,
} from '@/data/mock-team-operations';

// =============================================================================
// TYPES
// =============================================================================

export interface GameSheetProps {
  visible: boolean;
  onClose: () => void;
  gameId: string;
  membershipId?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatCurrency(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n}`;
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'live': return '#22C55E';
    case 'final': return '#A1A1AA';
    case 'upcoming': return '#1D9BF0';
    default: return '#A1A1AA';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'live': return 'LIVE';
    case 'final': return 'FINAL';
    case 'upcoming': return 'UPCOMING';
    default: return status.toUpperCase();
  }
}

function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'high': return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low': return '#22C55E';
    default: return '#A1A1AA';
  }
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

export function GameSheet({
  visible,
  onClose,
  gameId,
  membershipId,
}: GameSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { state } = useAppContext();

  const effectiveMembership = membershipId ?? state.activeContext.membership_id;
  const role = useMemo(() => getSportsRole(effectiveMembership), [effectiveMembership]);
  const krVisibility = useMemo(() => getKRVisibility(role), [role]);
  const sensitive = useMemo(() => canSeeSensitive(role), [role]);

  const tabs = useMemo(() => getGameSheetTabs(role), [role]);

  // Auto-select appropriate default tab based on game status
  const game = KaNeXT_GAMES.find(g => g.id === gameId) ?? null;
  const defaultTab = useMemo((): GameTab => {
    if (!game) return 'pregame';
    switch (game.status) {
      case 'upcoming': return 'pregame';
      case 'live': return 'live';
      case 'final': return 'postgame';
      default: return 'pregame';
    }
  }, [game?.status]);

  const [activeTab, setActiveTab] = useState<GameTab>(defaultTab);

  useEffect(() => {
    if (visible) {
      setActiveTab(defaultTab);
    }
  }, [visible, defaultTab]);

  // Pregame data
  const pregame: PregameSnapshot | null = KaNeXT_PREGAME[gameId] ?? null;

  // Box score
  const boxScore: BoxScoreLine[] = KaNeXT_BOX_SCORES[gameId] ?? [];

  // Game stats
  const gameStats = KaNeXT_GAME_STATS[gameId] ?? null;

  // Game impact
  const gameImpact = KaNeXT_GAME_IMPACT[gameId] ?? null;

  // Game flow
  const gameFlow = KaNeXT_GAME_FLOW[gameId] ?? [];

  // BPR
  const gameBPR = KaNeXT_GAME_BPR[gameId] ?? [];

  // Revenue (AD Overlay)
  const revenue = useMemo(() => getGameDayRevenue(gameId), [gameId]);

  // Incidents
  const incidents = useMemo(() => getGameIncidents(gameId), [gameId]);

  // Opponent KR
  const oppKR = game ? getOpponentKR(game.opponent) : 0;

  if (!game) return null;

  return (
    <BottomSheet useModal visible={visible} onClose={onClose}>
      {/* ═══════════ HEADER ═══════════ */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.matchup, { color: colors.text }]}>
              KaNeXT vs {game.opponent}
            </Text>
            <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
              {game.date} · {game.location}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.statusPill, { backgroundColor: `${getStatusColor(game.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(game.status) }]}>
                {getStatusLabel(game.status)}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={8} style={{ marginLeft: 8 }}>
              <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>

        {/* Score (if available) */}
        {game.score && (
          <View style={styles.scoreRow}>
            <Text style={[styles.score, { color: game.score.startsWith('W') ? '#22C55E' : '#EF4444' }]}>
              {game.score}
            </Text>
            {game.clock && game.status === 'live' && (
              <Text style={[styles.clock, { color: '#22C55E' }]}>{game.clock}</Text>
            )}
          </View>
        )}

        {/* KR matchup strip */}
        {krVisibility !== 'hidden' && (
          <View style={styles.krStrip}>
            <View style={styles.krBlock}>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>KaNeXT KR</Text>
              <Text style={[styles.krNum, { color: colors.text }]}>{formatKR(KaNeXT_KR, krVisibility)}</Text>
            </View>
            <Text style={[styles.krVs, { color: colors.textTertiary }]}>vs</Text>
            <View style={styles.krBlock}>
              <Text style={[styles.krLabel, { color: colors.textTertiary }]}>OPP KR</Text>
              <Text style={[styles.krNum, { color: colors.text }]}>{formatKR(oppKR, krVisibility)}</Text>
            </View>
          </View>
        )}

        {/* AD overlay chips (R1 only) */}
        {sensitive && (
          <View style={styles.adChips}>
            <View style={[styles.adChip, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.adChipText, { color: colors.textSecondary }]}>
                {revenue.attendance}/{revenue.capacity} Attendance
              </Text>
            </View>
            <View style={[styles.adChip, { backgroundColor: colors.backgroundSecondary }]}>
              <Text style={[styles.adChipText, { color: colors.textSecondary }]}>
                {formatCurrency(revenue.total)} Revenue
              </Text>
            </View>
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

      {/* ─── PREGAME ─── */}
      {activeTab === 'pregame' && (
        <View style={styles.tabContent}>
          {pregame ? (
            <>
              {/* Expectation + KR Gap */}
              <SectionLabel label="MATCHUP OVERVIEW" colors={colors} />
              <Card colors={colors}>
                <StatRow label="Expectation" value={pregame.expectation} colors={colors} />
                {krVisibility !== 'hidden' && (
                  <>
                    <StatRow label="KR Gap" value={`${pregame.krGap > 0 ? '+' : ''}${pregame.krGap}`} colors={colors} />
                    <StatRow label="Opponent KR" value={formatKR(pregame.oppKR, krVisibility)} colors={colors} />
                  </>
                )}
              </Card>

              {/* Their DNA */}
              {pregame.theirDNA.length > 0 && (
                <>
                  <SectionLabel label="THEIR DNA" colors={colors} />
                  <Card colors={colors}>
                    {pregame.theirDNA.map((d, i) => (
                      <Text key={i} style={[styles.dnaItem, { color: colors.textSecondary }]}>• {d}</Text>
                    ))}
                  </Card>
                </>
              )}

              {/* Our Edge */}
              {pregame.ourEdge.length > 0 && (
                <>
                  <SectionLabel label="OUR EDGE" colors={colors} />
                  <Card colors={colors}>
                    {pregame.ourEdge.map((e, i) => (
                      <Text key={i} style={[styles.dnaItem, { color: '#22C55E' }]}>▲ {e}</Text>
                    ))}
                  </Card>
                </>
              )}

              {/* Cluster Ratings */}
              {pregame.clusterRatings.length > 0 && (
                <>
                  <SectionLabel label="CLUSTER RATINGS" colors={colors} />
                  <Card colors={colors}>
                    {pregame.clusterRatings.map((cr, i) => {
                      const barColor = cr.rating >= 70 ? '#22C55E' : cr.rating >= 55 ? '#F59E0B' : '#EF4444';
                      const pct = Math.min(cr.rating, 100);
                      return (
                        <View key={i} style={styles.clusterRow}>
                          <Text style={[styles.clusterLabel, { color: colors.textSecondary }]}>{cr.cluster}</Text>
                          <View style={styles.clusterBarTrack}>
                            <View style={[styles.clusterBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                          </View>
                          {krVisibility !== 'hidden' && (
                            <Text style={[styles.clusterValue, { color: barColor }]}>
                              {formatKR(cr.rating, krVisibility)}
                            </Text>
                          )}
                        </View>
                      );
                    })}
                  </Card>
                </>
              )}

              {/* Swing Players */}
              {pregame.swingPlayers.length > 0 && (
                <>
                  <SectionLabel label="SWING PLAYERS" colors={colors} />
                  <Card colors={colors}>
                    {pregame.swingPlayers.map((sp, i) => (
                      <View key={i} style={[styles.swingRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.swingName, { color: colors.text }]}>
                            {sp.name} — {sp.roleTag}
                          </Text>
                          <Text style={[styles.swingReason, { color: colors.textSecondary }]}>
                            {sp.ifHeHits}
                          </Text>
                        </View>
                        {krVisibility !== 'hidden' && (
                          <Text style={[styles.swingImpact, { color: colors.text }]}>
                            KR {formatKR(sp.kr, krVisibility)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {/* Opponent Threats */}
              {pregame.oppThreats.length > 0 && (
                <>
                  <SectionLabel label="OPPONENT THREATS" colors={colors} />
                  <Card colors={colors}>
                    {pregame.oppThreats.map((t, i) => (
                      <View key={i} style={[styles.threatRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                        <Text style={[styles.threatName, { color: colors.text }]}>
                          {t.name} — {t.archetype}
                        </Text>
                        <Text style={[styles.threatRule, { color: '#EF4444' }]}>{t.rule}</Text>
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {/* Assignments */}
              {pregame.assignments.length > 0 && (
                <>
                  <SectionLabel label="ASSIGNMENTS" colors={colors} />
                  <Card colors={colors}>
                    {pregame.assignments.map((a, i) => (
                      <View key={i} style={[styles.assignRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                        <Text style={[styles.assignPlayer, { color: colors.text }]}>{a.player}</Text>
                        <Text style={[styles.assignTitle, { color: colors.textSecondary }]}>{a.title}</Text>
                        <Text style={[styles.assignConstraint, { color: colors.textTertiary }]}>{a.constraint}</Text>
                      </View>
                    ))}
                  </Card>
                </>
              )}

              {/* Model Notes */}
              <SectionLabel label="MODEL NOTES" colors={colors} />
              <Card colors={colors}>
                <StatRow label="Upset Path" value={pregame.modelNotes.upsetPath} colors={colors} />
                <StatRow label="Risk" value={pregame.modelNotes.risk} colors={colors} valueColor="#EF4444" />
              </Card>
            </>
          ) : (
            <Card colors={colors}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Pregame data not yet available for this game.
              </Text>
            </Card>
          )}
        </View>
      )}

      {/* ─── LIVE ─── */}
      {activeTab === 'live' && (
        <View style={styles.tabContent}>
          {game.status === 'live' ? (
            <>
              <SectionLabel label="SCORE" colors={colors} />
              <Card colors={colors}>
                <View style={styles.liveScoreBlock}>
                  <Text style={[styles.liveScore, { color: colors.text }]}>
                    {game.score ?? '0-0'}
                  </Text>
                  {game.clock && (
                    <Text style={[styles.liveClock, { color: '#22C55E' }]}>{game.clock}</Text>
                  )}
                </View>
              </Card>

              {/* Game Flow */}
              {gameFlow.length > 0 && (
                <>
                  <SectionLabel label="GAME FLOW" colors={colors} />
                  <Card colors={colors}>
                    <View style={styles.flowRow}>
                      {gameFlow.slice(-10).map((snap, i) => (
                        <View key={i} style={styles.flowPoint}>
                          <View style={[styles.flowDot, {
                            backgroundColor: snap.fmu > snap.opp ? '#22C55E' : snap.fmu < snap.opp ? '#EF4444' : '#F59E0B'
                          }]} />
                          <Text style={[styles.flowScore, { color: colors.textSecondary }]}>
                            {snap.fmu}-{snap.opp}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </Card>
                </>
              )}
            </>
          ) : game.status === 'upcoming' ? (
            <Card colors={colors}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                Game has not started yet. Live data will appear here during the game.
              </Text>
            </Card>
          ) : (
            <>
              <SectionLabel label="FINAL SCORE" colors={colors} />
              <Card colors={colors}>
                <Text style={[styles.liveScore, { color: colors.text, textAlign: 'center' }]}>
                  {game.score ?? '—'}
                </Text>
              </Card>
            </>
          )}
        </View>
      )}

      {/* ─── POSTGAME ─── */}
      {activeTab === 'postgame' && (
        <View style={styles.tabContent}>
          {/* Box Score */}
          {boxScore.length > 0 && (
            <>
              <SectionLabel label="BOX SCORE" colors={colors} />
              <Card colors={colors}>
                {/* Header */}
                <View style={styles.boxHeader}>
                  <Text style={[styles.boxColName, { color: colors.textTertiary }]}>PLAYER</Text>
                  <Text style={[styles.boxCol, { color: colors.textTertiary }]}>MIN</Text>
                  <Text style={[styles.boxCol, { color: colors.textTertiary }]}>PTS</Text>
                  <Text style={[styles.boxCol, { color: colors.textTertiary }]}>REB</Text>
                  <Text style={[styles.boxCol, { color: colors.textTertiary }]}>AST</Text>
                  <Text style={[styles.boxCol, { color: colors.textTertiary }]}>FG</Text>
                </View>
                {boxScore.slice(0, 10).map((line, i) => (
                  <View key={i} style={[styles.boxRow, { borderTopColor: colors.divider }]}>
                    <Text style={[styles.boxColName, { color: colors.text }]} numberOfLines={1}>
                      {line.name}
                    </Text>
                    <Text style={[styles.boxCol, { color: colors.textSecondary }]}>{line.min}</Text>
                    <Text style={[styles.boxCol, { color: colors.text, fontWeight: '600' }]}>{line.pts}</Text>
                    <Text style={[styles.boxCol, { color: colors.textSecondary }]}>{line.reb}</Text>
                    <Text style={[styles.boxCol, { color: colors.textSecondary }]}>{line.ast}</Text>
                    <Text style={[styles.boxCol, { color: colors.textSecondary }]}>{line.fg}</Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {/* Game Stats */}
          {gameStats && (
            <>
              <SectionLabel label="TEAM STATS" colors={colors} />
              <Card colors={colors}>
                <StatRow label="Field Goals" value={gameStats.teamFG} colors={colors} />
                <StatRow label="3-Pointers" value={gameStats.team3P} colors={colors} />
                <StatRow label="Free Throws" value={gameStats.teamFT} colors={colors} />
                <StatRow label="Total Rebounds" value={gameStats.teamReb} colors={colors} />
                <StatRow label="Turnovers" value={gameStats.teamTO} colors={colors} />
              </Card>
            </>
          )}

          {/* Game Impact */}
          {gameImpact && (
            <>
              <SectionLabel label="GAME IMPACT" colors={colors} />
              <Card colors={colors}>
                <StatRow
                  label="Team Game Impact (TGIS)"
                  value={gameImpact.tgis.toFixed(1)}
                  colors={colors}
                  valueColor={getTGISColor(gameImpact.tgis)}
                />
                {[...gameImpact.starters, ...gameImpact.bench]
                  .sort((a, b) => b.pgis - a.pgis)
                  .slice(0, 5)
                  .map((pi, i) => (
                  <View key={i} style={[styles.impactRow, { borderTopColor: colors.divider }]}>
                    <Text style={[styles.impactName, { color: colors.text }]}>
                      {pi.name}
                    </Text>
                    <Text style={[styles.impactValue, { color: getPGISColor(pi.pgis) }]}>
                      {pi.pgis > 0 ? '+' : ''}{pi.pgis.toFixed(1)} PGIS
                    </Text>
                  </View>
                ))}
              </Card>
            </>
          )}

          {/* BPR */}
          {gameBPR.length > 0 && (
            <>
              <SectionLabel label="PLAYER PERFORMANCE (BPR)" colors={colors} />
              <Card colors={colors}>
                {gameBPR.slice(0, 5).map((p, i) => {
                  const bprColor = p.bpr >= 5 ? '#22C55E' : p.bpr >= 0 ? '#F59E0B' : '#EF4444';
                  return (
                    <View key={i} style={[styles.bprRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                      <Text style={[styles.bprName, { color: colors.text }]}>{p.name}</Text>
                      <Text style={[styles.bprValue, { color: bprColor }]}>
                        {p.bpr > 0 ? '+' : ''}{p.bpr.toFixed(1)}
                      </Text>
                    </View>
                  );
                })}
              </Card>
            </>
          )}

          {/* Game Flow */}
          {gameFlow.length > 0 && (
            <>
              <SectionLabel label="GAME FLOW" colors={colors} />
              <Card colors={colors}>
                <View style={styles.flowRow}>
                  {gameFlow.map((snap, i) => (
                    <View key={i} style={styles.flowPoint}>
                      <View style={[styles.flowDot, {
                        backgroundColor: snap.fmu > snap.opp ? '#22C55E' : snap.fmu < snap.opp ? '#EF4444' : '#F59E0B'
                      }]} />
                      <Text style={[styles.flowScore, { color: colors.textSecondary }]}>
                        {snap.fmu}-{snap.opp}
                      </Text>
                    </View>
                  ))}
                </View>
              </Card>
            </>
          )}
        </View>
      )}

      {/* ─── AD OVERLAY (R1 only) ─── */}
      {activeTab === 'ad_overlay' && sensitive && (
        <View style={styles.tabContent}>
          <SectionLabel label="GAME DAY REVENUE" colors={colors} />
          <Card colors={colors}>
            <StatRow label="Ticket Sales" value={formatCurrency(revenue.ticketSales)} colors={colors} />
            <StatRow label="Concessions" value={formatCurrency(revenue.concessions)} colors={colors} />
            <StatRow label="Merchandise" value={formatCurrency(revenue.merchandise)} colors={colors} />
            <StatRow label="Sponsor Activations" value={formatCurrency(revenue.sponsorActivations)} colors={colors} />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <StatRow label="Total Revenue" value={formatCurrency(revenue.total)} colors={colors} valueColor="#22C55E" />
          </Card>

          <SectionLabel label="ATTENDANCE" colors={colors} />
          <Card colors={colors}>
            <StatRow label="Attendance" value={`${revenue.attendance}`} colors={colors} />
            <StatRow label="Capacity" value={`${revenue.capacity}`} colors={colors} />
            <StatRow
              label="Fill Rate"
              value={`${Math.round((revenue.attendance / revenue.capacity) * 100)}%`}
              colors={colors}
              valueColor={revenue.attendance / revenue.capacity > 0.7 ? '#22C55E' : '#F59E0B'}
            />
            {/* Fill bar */}
            <View style={styles.fillBar}>
              <View style={[styles.fillBarTrack, { backgroundColor: colors.border }]}>
                <View style={[styles.fillBarFill, {
                  width: `${Math.min((revenue.attendance / revenue.capacity) * 100, 100)}%`,
                  backgroundColor: revenue.attendance / revenue.capacity > 0.7 ? '#22C55E' : '#F59E0B',
                }]} />
              </View>
            </View>
          </Card>
        </View>
      )}

      {/* ─── INCIDENTS (R1 only) ─── */}
      {activeTab === 'incidents' && sensitive && (
        <View style={styles.tabContent}>
          <SectionLabel label="INCIDENTS + COMPLIANCE" colors={colors} />
          {incidents.length > 0 ? (
            <Card colors={colors}>
              {incidents.map((inc, i) => (
                <View key={inc.id} style={[styles.incidentRow, i > 0 && { borderTopColor: colors.divider, borderTopWidth: StyleSheet.hairlineWidth }]}>
                  <View style={[styles.incidentDot, { backgroundColor: getSeverityColor(inc.severity) }]} />
                  <View style={{ flex: 1 }}>
                    <View style={styles.incidentHeader}>
                      <Text style={[styles.incidentType, { color: colors.text }]}>
                        {inc.type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Text>
                      <View style={[styles.severityPill, { backgroundColor: `${getSeverityColor(inc.severity)}20` }]}>
                        <Text style={[styles.severityText, { color: getSeverityColor(inc.severity) }]}>
                          {inc.severity}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.incidentDesc, { color: colors.textSecondary }]}>
                      {inc.description}
                    </Text>
                    <View style={styles.incidentMeta}>
                      <Text style={[styles.incidentTime, { color: colors.textTertiary }]}>{inc.time}</Text>
                      <Text style={[styles.incidentResolved, {
                        color: inc.resolved ? '#22C55E' : '#F59E0B'
                      }]}>
                        {inc.resolved ? 'Resolved' : 'Open'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          ) : (
            <Card colors={colors}>
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No incidents reported for this game.
              </Text>
            </Card>
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchup: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: '800',
  },
  clock: {
    fontSize: 14,
    fontWeight: '600',
  },
  krStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 10,
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
  krVs: {
    fontSize: 11,
    fontWeight: '600',
  },
  adChips: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  adChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  adChipText: {
    fontSize: 11,
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

  // Empty text
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 16,
  },

  // Pregame clusters
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 2,
  },
  clusterLabel: {
    width: 72,
    fontSize: 11,
    fontWeight: '600',
  },
  clusterBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#0B0F14',
    borderRadius: 4,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  clusterBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  clusterValue: {
    fontSize: 13,
    fontWeight: '700',
    width: 28,
    textAlign: 'right',
  },

  // DNA items
  dnaItem: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 2,
  },

  // Threats
  threatRow: {
    paddingVertical: 8,
  },
  threatName: {
    fontSize: 13,
    fontWeight: '600',
  },
  threatRule: {
    fontSize: 12,
    marginTop: 2,
  },

  // Assignments
  assignRow: {
    paddingVertical: 7,
  },
  assignPlayer: {
    fontSize: 13,
    fontWeight: '600',
  },
  assignTitle: {
    fontSize: 12,
    marginTop: 1,
  },
  assignConstraint: {
    fontSize: 11,
    marginTop: 1,
  },

  // Swing players
  swingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  swingName: {
    fontSize: 13,
    fontWeight: '600',
  },
  swingReason: {
    fontSize: 12,
    marginTop: 1,
  },
  swingImpact: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Leverage bullets
  leverageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  leverageDot: {
    fontSize: 12,
    marginTop: 1,
  },
  leverageText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 19,
  },

  // Live
  liveScoreBlock: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  liveScore: {
    fontSize: 32,
    fontWeight: '800',
  },
  liveClock: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },

  // Game flow
  flowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  flowPoint: {
    alignItems: 'center',
    gap: 2,
  },
  flowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  flowScore: {
    fontSize: 9,
  },

  // Box score
  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
  },
  boxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  boxColName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  boxCol: {
    width: 36,
    fontSize: 11,
    textAlign: 'center',
  },

  // Impact
  impactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  impactName: {
    fontSize: 13,
    fontWeight: '500',
  },
  impactValue: {
    fontSize: 13,
    fontWeight: '700',
  },

  // BPR
  bprRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  bprName: {
    fontSize: 13,
    fontWeight: '500',
  },
  bprValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // AD Overlay
  fillBar: {
    marginTop: 8,
  },
  fillBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  fillBarFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Incidents
  incidentRow: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 10,
  },
  incidentDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 3,
  },
  incidentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  incidentType: {
    fontSize: 13,
    fontWeight: '600',
  },
  severityPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  incidentDesc: {
    fontSize: 12,
    marginTop: 4,
    lineHeight: 18,
  },
  incidentMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  incidentTime: {
    fontSize: 11,
  },
  incidentResolved: {
    fontSize: 11,
    fontWeight: '600',
  },
});
