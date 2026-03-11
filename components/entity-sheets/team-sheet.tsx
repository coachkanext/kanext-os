/**
 * Team Sheet — Universal 4-tab team profile bottom sheet.
 * Tabs: Overview | Roster | Stats | Video
 * Header (team name, record, level/conf) + Sticky Rating Strip always visible.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { getKRColor, CLUSTER_ORDER, CLUSTER_LABELS } from '@/utils/kr-display';
import type { TeamCardData } from '@/utils/global-entity-sheets';
import { openPlayerSheet, openCoachSheet } from '@/utils/global-entity-sheets';
import { nationalPool, toGlobalPlayerCard } from '@/data/national-pool';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

type Tab = 'overview' | 'roster' | 'stats' | 'video';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'roster', label: 'Roster' },
  { key: 'stats', label: 'Stats' },
  { key: 'video', label: 'Video' },
];

type LensKey = 'overall' | 'shooting' | 'finishing' | 'playmaking' | 'on_ball_defense' | 'team_defense' | 'rebounding' | 'physical';

const LENS_OPTIONS: { key: LensKey; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'shooting', label: 'Shooting' },
  { key: 'finishing', label: 'Finishing' },
  { key: 'playmaking', label: 'Playmaking' },
  { key: 'on_ball_defense', label: 'On-Ball D' },
  { key: 'team_defense', label: 'Team D' },
  { key: 'rebounding', label: 'Rebound' },
  { key: 'physical', label: 'Frame' },
];

function getLensScore(player: any, lens: LensKey): number | undefined {
  if (lens === 'overall') return player.kr;
  return player.clusters?.[lens];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  data: TeamCardData | null;
}

export function TeamSheet({ visible, onClose, data }: Props) {
  const C = useColors();
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lens, setLens] = useState<LensKey>('overall');
  const styles = useMemo(() => makeStyles(C), [C]);

  // Reset tab when sheet reopens
  React.useEffect(() => {
    if (visible) {
      setActiveTab('overview');
      setLens('overall');
    }
  }, [visible]);

  // Get team roster from nationalPool
  const roster = useMemo(() => {
    if (!data?.name) return [];
    return nationalPool.getTeamRoster(data.name);
  }, [data?.name]);

  // Get team system
  const teamSystem = useMemo(() => {
    if (!data?.name) return null;
    return nationalPool.getTeamSystem(data.name);
  }, [data?.name]);

  // Rotation snapshot (top 5-8 by KR)
  const rotationSnapshot = useMemo(() => {
    return [...roster]
      .filter(p => p.kr != null)
      .sort((a, b) => (b.kr ?? 0) - (a.kr ?? 0))
      .slice(0, 8);
  }, [roster]);

  // Stat leaders
  const statLeaders = useMemo(() => {
    if (roster.length === 0) return null;
    const byPpg = [...roster].sort((a, b) => (b.ppg ?? 0) - (a.ppg ?? 0));
    const byRpg = [...roster].sort((a, b) => (b.rpg ?? 0) - (a.rpg ?? 0));
    const byApg = [...roster].sort((a, b) => (b.apg ?? 0) - (a.apg ?? 0));
    return {
      ppg: byPpg[0],
      rpg: byRpg[0],
      apg: byApg[0],
    };
  }, [roster]);

  // Sort roster by active lens
  const sortedRoster = useMemo(() => {
    return [...roster].sort((a, b) => {
      const sa = getLensScore(a, lens) ?? -1;
      const sb = getLensScore(b, lens) ?? -1;
      return sb - sa;
    });
  }, [roster, lens]);

  if (!data) return null;

  const hue = nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const krColor = getKRColor(data.teamKR);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.headerSection}>
        {/* ── HEADER — always visible ── */}
        <View style={styles.identityRow}>
          <View style={[styles.initialsCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.initialsText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.teamName}>{data.name}</Text>
            <Text style={styles.subline}>
              {[data.level, data.conference].filter(Boolean).join(' · ') || '—'}
            </Text>
            {data.record && (
              <Text style={styles.recordText}>{data.record}</Text>
            )}
          </View>
        </View>

        {/* ── STICKY TEAM RATING STRIP ── */}
        <View style={styles.ratingStrip}>
          <View style={styles.ratingStripMain}>
            {data.teamKR != null && (
              <View style={[styles.ratingBadge, { backgroundColor: krColor + '20' }]}>
                <Text style={[styles.ratingBadgeVal, { color: krColor }]}>{Math.round(data.teamKR)}</Text>
                <Text style={styles.ratingBadgeLabel}>KR</Text>
              </View>
            )}
            {data.offKR != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: getKRColor(data.offKR) }]}>{Math.round(data.offKR)}</Text>
                <Text style={styles.ratingMiniLabel}>OFF</Text>
              </View>
            )}
            {data.defKR != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: getKRColor(data.defKR) }]}>{Math.round(data.defKR)}</Text>
                <Text style={styles.ratingMiniLabel}>DEF</Text>
              </View>
            )}
          </View>
          {/* Systems summary */}
          <View style={styles.systemsSummaryRow}>
            {(data.osie || teamSystem?.offSystem) && (
              <Text style={styles.systemsTag}>
                OFF: {data.osie || teamSystem?.offSystem || '—'}
              </Text>
            )}
            {(data.dsie || teamSystem?.defSystem) && (
              <Text style={styles.systemsTag}>
                DEF: {data.dsie || teamSystem?.defSystem || '—'}
              </Text>
            )}
            {teamSystem?.paceBand && (
              <Text style={styles.systemsTag}>
                TEMPO: {teamSystem.paceBand}
              </Text>
            )}
          </View>
        </View>

        {/* ── TAB PILLS ── */}
        <View style={styles.tabRow}>
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[styles.tabPill, active && [styles.tabPillActive, { backgroundColor: accent + '30' }]]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveTab(tab.key);
                }}
              >
                <Text style={[styles.tabText, { color: active ? accent : C.secondary }]}>
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>

          {/* ════════════════════════════════════════════
              TAB 1 — OVERVIEW
              ════════════════════════════════════════════ */}
          {activeTab === 'overview' && (
            <>
              {/* System Identity */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>SYSTEM IDENTITY</Text>
                <View style={styles.systemPair}>
                  <View style={styles.systemHalf}>
                    <Text style={styles.systemLabel}>OFFENSE</Text>
                    <Text style={styles.systemValue}>{data.osie || teamSystem?.offSystem || '—'}</Text>
                    {(data.osieScore ?? teamSystem?.offSystemScore) != null && (
                      <Text style={[styles.systemScore, { color: getKRColor(data.osieScore ?? teamSystem?.offSystemScore) }]}>
                        {Math.round((data.osieScore ?? teamSystem?.offSystemScore)!)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.systemHalf}>
                    <Text style={styles.systemLabel}>DEFENSE</Text>
                    <Text style={styles.systemValue}>{data.dsie || teamSystem?.defSystem || '—'}</Text>
                    {(data.dsieScore ?? teamSystem?.defSystemScore) != null && (
                      <Text style={[styles.systemScore, { color: getKRColor(data.dsieScore ?? teamSystem?.defSystemScore) }]}>
                        {Math.round((data.dsieScore ?? teamSystem?.defSystemScore)!)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Record */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>RECORD</Text>
                <View style={styles.recordRow}>
                  <View style={styles.recordItem}>
                    <Text style={styles.recordLabel}>OVERALL</Text>
                    <Text style={styles.recordValue}>{data.record || '—'}</Text>
                  </View>
                  {data.confRecord && (
                    <View style={styles.recordItem}>
                      <Text style={styles.recordLabel}>CONF</Text>
                      <Text style={styles.recordValue}>{data.confRecord}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Rotation Snapshot */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>ROTATION SNAPSHOT</Text>
                {rotationSnapshot.length > 0 ? (
                  rotationSnapshot.map((p, i) => {
                    const pKrColor = getKRColor(p.kr);
                    return (
                      <Pressable
                        key={p.id || i}
                        style={styles.rotationRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openPlayerSheet(toGlobalPlayerCard(p));
                        }}
                      >
                        <Text style={styles.rotationRank}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rotationName}>{p.name}</Text>
                          <Text style={styles.rotationPos}>{p.position}</Text>
                        </View>
                        {p.kr != null && (
                          <Text style={[styles.rotationKR, { color: pKrColor }]}>{Math.round(p.kr)}</Text>
                        )}
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={styles.placeholderText}>
                    No roster data available for rotation snapshot.
                  </Text>
                )}
              </View>

              {/* Strengths / Risks */}
              {data.strengths && data.strengths.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>STRENGTHS</Text>
                  {data.strengths.map((s, i) => (
                    <View key={i} style={styles.listRow}>
                      <Text style={[styles.bullet, { color: C.green }]}>{'\u2022'}</Text>
                      <Text style={styles.listText}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
              {data.risks && data.risks.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>RISKS</Text>
                  {data.risks.map((r, i) => (
                    <View key={i} style={styles.listRow}>
                      <Text style={[styles.bullet, { color: C.red }]}>{'\u2022'}</Text>
                      <Text style={styles.listText}>{r}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 2 — ROSTER
              ════════════════════════════════════════════ */}
          {activeTab === 'roster' && (
            <>
              {/* Lens toggle */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.lensScroll}>
                <View style={styles.lensRow}>
                  {LENS_OPTIONS.map(opt => {
                    const active = lens === opt.key;
                    return (
                      <Pressable
                        key={opt.key}
                        style={[styles.lensPill, active && { backgroundColor: accent + '20' }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setLens(opt.key);
                        }}
                      >
                        <Text style={[styles.lensPillText, { color: active ? accent : C.secondary }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Coaching staff */}
              {data.coaches && data.coaches.length > 0 && (
                <View style={styles.card}>
                  <Text style={styles.sectionTitle}>COACHING STAFF</Text>
                  {data.coaches.map((coach, i) => (
                    <Pressable
                      key={i}
                      style={styles.personRow}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        openCoachSheet({ name: coach.name, title: coach.title, tendencies: coach.tendencies });
                      }}
                    >
                      <View style={[styles.personAvatar, { backgroundColor: `hsl(${nameToHue(coach.name)}, 40%, 30%)` }]}>
                        <Text style={styles.personInitials}>
                          {coach.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.personName}>{coach.name}</Text>
                        <Text style={styles.personRole}>{coach.title}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Player roster */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>
                  ROSTER ({sortedRoster.length})
                </Text>
                {sortedRoster.length > 0 ? (
                  sortedRoster.map((p, i) => {
                    const score = getLensScore(p, lens);
                    const scoreColor = getKRColor(score);
                    return (
                      <Pressable
                        key={p.id || i}
                        style={styles.rosterRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openPlayerSheet(toGlobalPlayerCard(p));
                        }}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.rosterName}>{p.name}</Text>
                          <Text style={styles.rosterMeta}>
                            {p.position} · {p.height}{p.weight ? ` · ${p.weight}` : ''} · {p.classYear}
                          </Text>
                        </View>
                        {score != null ? (
                          <Text style={[styles.rosterScore, { color: scoreColor }]}>{Math.round(score)}</Text>
                        ) : (
                          <Text style={styles.rosterScoreMuted}>—</Text>
                        )}
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={styles.placeholderText}>
                    No roster data available.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 3 — STATS
              ════════════════════════════════════════════ */}
          {activeTab === 'stats' && (
            <>
              {/* KR Breakdown */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>TEAM KR</Text>
                <View style={styles.krBreakdownRow}>
                  <View style={styles.krBreakdownItem}>
                    <Text style={styles.krBreakdownLabel}>OFF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.offKR) }]}>
                      {data.offKR != null ? Math.round(data.offKR) : '—'}
                    </Text>
                  </View>
                  <View style={styles.krBreakdownItem}>
                    <Text style={styles.krBreakdownLabel}>DEF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.defKR) }]}>
                      {data.defKR != null ? Math.round(data.defKR) : '—'}
                    </Text>
                  </View>
                  <View style={styles.krBreakdownItem}>
                    <Text style={styles.krBreakdownLabel}>TEAM KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: krColor }]}>
                      {data.teamKR != null ? Math.round(data.teamKR) : '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stat Leaders */}
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>STAT LEADERS</Text>
                {statLeaders ? (
                  <>
                    {statLeaders.ppg && statLeaders.ppg.ppg != null && (
                      <Pressable
                        style={styles.leaderRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openPlayerSheet(toGlobalPlayerCard(statLeaders.ppg));
                        }}
                      >
                        <Text style={styles.leaderCategory}>PPG</Text>
                        <Text style={styles.leaderName}>{statLeaders.ppg.name}</Text>
                        <Text style={[styles.leaderValue, { color: accent }]}>{statLeaders.ppg.ppg?.toFixed(1)}</Text>
                      </Pressable>
                    )}
                    {statLeaders.rpg && statLeaders.rpg.rpg != null && (
                      <Pressable
                        style={styles.leaderRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openPlayerSheet(toGlobalPlayerCard(statLeaders.rpg));
                        }}
                      >
                        <Text style={styles.leaderCategory}>RPG</Text>
                        <Text style={styles.leaderName}>{statLeaders.rpg.name}</Text>
                        <Text style={[styles.leaderValue, { color: accent }]}>{statLeaders.rpg.rpg?.toFixed(1)}</Text>
                      </Pressable>
                    )}
                    {statLeaders.apg && statLeaders.apg.apg != null && (
                      <Pressable
                        style={styles.leaderRow}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          openPlayerSheet(toGlobalPlayerCard(statLeaders.apg));
                        }}
                      >
                        <Text style={styles.leaderCategory}>APG</Text>
                        <Text style={styles.leaderName}>{statLeaders.apg.name}</Text>
                        <Text style={[styles.leaderValue, { color: accent }]}>{statLeaders.apg.apg?.toFixed(1)}</Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <Text style={styles.placeholderText}>
                    No stat data available.
                  </Text>
                )}
              </View>
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 4 — VIDEO
              ════════════════════════════════════════════ */}
          {activeTab === 'video' && (
            <>
              <View style={styles.card}>
                <Text style={styles.sectionTitle}>RECENT VIDEOS</Text>
                <Text style={styles.placeholderText}>
                  No video clips available yet.
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.sectionTitle}>SHORTCUTS</Text>
                <Pressable
                  style={[styles.shortcutBtn, { backgroundColor: accent + '10', borderColor: accent + '30' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Text style={[styles.shortcutBtnText, { color: accent }]}>Game Room</Text>
                </Pressable>
                <Pressable
                  style={[styles.shortcutBtn, { backgroundColor: accent + '10', borderColor: accent + '30' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <Text style={[styles.shortcutBtnText, { color: accent }]}>Scout Room</Text>
                </Pressable>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  initialsCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 20, fontWeight: '800', color: C.label, letterSpacing: 1 },
  teamName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5, color: C.label },
  subline: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2, color: C.secondary },
  recordText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginTop: 2, color: C.secondary },

  // Sticky Rating Strip
  ratingStrip: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.sm, gap: 6, backgroundColor: C.surface, borderColor: C.separator },
  ratingStripMain: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  ratingBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  ratingBadgeVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  ratingBadgeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, color: C.muted },
  ratingMini: { alignItems: 'center' },
  ratingMiniVal: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  ratingMiniLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, color: C.muted },
  systemsSummaryRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  systemsTag: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, color: C.muted },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4, backgroundColor: C.surface },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8, backgroundColor: C.surface, borderColor: C.separator },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.muted },

  // System
  systemPair: { flexDirection: 'row', justifyContent: 'space-around' },
  systemHalf: { alignItems: 'center', gap: 3 },
  systemLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  systemValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3, color: C.label },
  systemScore: { fontSize: 12, fontWeight: '700' },

  // Record
  recordRow: { flexDirection: 'row', justifyContent: 'space-around' },
  recordItem: { alignItems: 'center', gap: 4 },
  recordLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  recordValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3, color: C.label },

  // Rotation snapshot
  rotationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  rotationRank: { width: 20, fontSize: 12, fontWeight: '700', textAlign: 'center', color: C.muted },
  rotationName: { fontSize: 13, fontWeight: '700', color: C.label },
  rotationPos: { fontSize: 11, fontWeight: '600', marginTop: 1, color: C.secondary },
  rotationKR: { fontSize: 14, fontWeight: '800', width: 30, textAlign: 'right' },

  // KR breakdown
  krBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around' },
  krBreakdownItem: { alignItems: 'center', gap: 2 },
  krBreakdownLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: C.muted },
  krBreakdownValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  // Lens
  lensScroll: { marginBottom: 4 },
  lensRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  lensPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  lensPillText: { fontSize: 12, fontWeight: '700' },

  // Roster
  rosterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
  rosterName: { fontSize: 14, fontWeight: '700', color: C.label },
  rosterMeta: { fontSize: 11, fontWeight: '600', marginTop: 1, color: C.secondary },
  rosterScore: { fontSize: 16, fontWeight: '800', width: 34, textAlign: 'right' },
  rosterScoreMuted: { fontSize: 16, fontWeight: '800', width: 34, textAlign: 'right', color: C.muted },

  // Stat Leaders
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  leaderCategory: { width: 30, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, color: C.muted },
  leaderName: { fontSize: 13, fontWeight: '700', flex: 1, color: C.label },
  leaderValue: { fontSize: 14, fontWeight: '800', width: 36, textAlign: 'right' },

  // Lists
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 18 },
  listText: { fontSize: 13, fontWeight: '600', lineHeight: 18, flex: 1, color: C.label },

  // People
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  personInitials: { fontSize: 14, fontWeight: '800', color: C.label },
  personName: { fontSize: 14, fontWeight: '700', color: C.label },
  personRole: { fontSize: 12, fontWeight: '600', marginTop: 1, color: C.secondary },

  // Video shortcuts
  shortcutBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  shortcutBtnText: { fontSize: 14, fontWeight: '700' },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic', color: C.muted },
});
