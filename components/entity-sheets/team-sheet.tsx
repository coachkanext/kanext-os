/**
 * Team Sheet — Universal 4-tab team profile bottom sheet.
 * Tabs: Overview | Roster | Stats | Video
 * Header (team name, record, level/conf) + Sticky Rating Strip always visible.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [lens, setLens] = useState<LensKey>('overall');

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
            <Text style={[styles.teamName, { color: colors.text }]}>{data.name}</Text>
            <Text style={[styles.subline, { color: colors.textSecondary }]}>
              {[data.level, data.conference].filter(Boolean).join(' · ') || '—'}
            </Text>
            {data.record && (
              <Text style={[styles.recordText, { color: colors.textSecondary }]}>{data.record}</Text>
            )}
          </View>
        </View>

        {/* ── STICKY TEAM RATING STRIP ── */}
        <View style={[styles.ratingStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ratingStripMain}>
            {data.teamKR != null && (
              <View style={[styles.ratingBadge, { backgroundColor: krColor + '20' }]}>
                <Text style={[styles.ratingBadgeVal, { color: krColor }]}>{Math.round(data.teamKR)}</Text>
                <Text style={[styles.ratingBadgeLabel, { color: colors.textTertiary }]}>KR</Text>
              </View>
            )}
            {data.offKR != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: getKRColor(data.offKR) }]}>{Math.round(data.offKR)}</Text>
                <Text style={[styles.ratingMiniLabel, { color: colors.textTertiary }]}>OFF</Text>
              </View>
            )}
            {data.defKR != null && (
              <View style={styles.ratingMini}>
                <Text style={[styles.ratingMiniVal, { color: getKRColor(data.defKR) }]}>{Math.round(data.defKR)}</Text>
                <Text style={[styles.ratingMiniLabel, { color: colors.textTertiary }]}>DEF</Text>
              </View>
            )}
          </View>
          {/* Systems summary */}
          <View style={styles.systemsSummaryRow}>
            {(data.osie || teamSystem?.offSystem) && (
              <Text style={[styles.systemsTag, { color: colors.textTertiary }]}>
                OFF: {data.osie || teamSystem?.offSystem || '—'}
              </Text>
            )}
            {(data.dsie || teamSystem?.defSystem) && (
              <Text style={[styles.systemsTag, { color: colors.textTertiary }]}>
                DEF: {data.dsie || teamSystem?.defSystem || '—'}
              </Text>
            )}
            {teamSystem?.paceBand && (
              <Text style={[styles.systemsTag, { color: colors.textTertiary }]}>
                TEMPO: {teamSystem.paceBand}
              </Text>
            )}
          </View>
        </View>

        {/* ── TAB PILLS ── */}
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
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
                <Text style={[styles.tabText, { color: active ? accent : colors.textSecondary }]}>
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
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SYSTEM IDENTITY</Text>
                <View style={styles.systemPair}>
                  <View style={styles.systemHalf}>
                    <Text style={[styles.systemLabel, { color: colors.textTertiary }]}>OFFENSE</Text>
                    <Text style={[styles.systemValue, { color: colors.text }]}>{data.osie || teamSystem?.offSystem || '—'}</Text>
                    {(data.osieScore ?? teamSystem?.offSystemScore) != null && (
                      <Text style={[styles.systemScore, { color: getKRColor(data.osieScore ?? teamSystem?.offSystemScore) }]}>
                        {Math.round((data.osieScore ?? teamSystem?.offSystemScore)!)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.systemHalf}>
                    <Text style={[styles.systemLabel, { color: colors.textTertiary }]}>DEFENSE</Text>
                    <Text style={[styles.systemValue, { color: colors.text }]}>{data.dsie || teamSystem?.defSystem || '—'}</Text>
                    {(data.dsieScore ?? teamSystem?.defSystemScore) != null && (
                      <Text style={[styles.systemScore, { color: getKRColor(data.dsieScore ?? teamSystem?.defSystemScore) }]}>
                        {Math.round((data.dsieScore ?? teamSystem?.defSystemScore)!)}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Record */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECORD</Text>
                <View style={styles.recordRow}>
                  <View style={styles.recordItem}>
                    <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>OVERALL</Text>
                    <Text style={[styles.recordValue, { color: colors.text }]}>{data.record || '—'}</Text>
                  </View>
                  {data.confRecord && (
                    <View style={styles.recordItem}>
                      <Text style={[styles.recordLabel, { color: colors.textTertiary }]}>CONF</Text>
                      <Text style={[styles.recordValue, { color: colors.text }]}>{data.confRecord}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Rotation Snapshot */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ROTATION SNAPSHOT</Text>
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
                        <Text style={[styles.rotationRank, { color: colors.textTertiary }]}>{i + 1}</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.rotationName, { color: colors.text }]}>{p.name}</Text>
                          <Text style={[styles.rotationPos, { color: colors.textSecondary }]}>{p.position}</Text>
                        </View>
                        {p.kr != null && (
                          <Text style={[styles.rotationKR, { color: pKrColor }]}>{Math.round(p.kr)}</Text>
                        )}
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No roster data available for rotation snapshot.
                  </Text>
                )}
              </View>

              {/* Strengths / Risks */}
              {data.strengths && data.strengths.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>STRENGTHS</Text>
                  {data.strengths.map((s, i) => (
                    <View key={i} style={styles.listRow}>
                      <Text style={[styles.bullet, { color: '#22C55E' }]}>{'\u2022'}</Text>
                      <Text style={[styles.listText, { color: colors.text }]}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
              {data.risks && data.risks.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RISKS</Text>
                  {data.risks.map((r, i) => (
                    <View key={i} style={styles.listRow}>
                      <Text style={[styles.bullet, { color: '#EF4444' }]}>{'\u2022'}</Text>
                      <Text style={[styles.listText, { color: colors.text }]}>{r}</Text>
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
                        <Text style={[styles.lensPillText, { color: active ? accent : colors.textSecondary }]}>
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>

              {/* Coaching staff */}
              {data.coaches && data.coaches.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>COACHING STAFF</Text>
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
                        <Text style={[styles.personName, { color: colors.text }]}>{coach.name}</Text>
                        <Text style={[styles.personRole, { color: colors.textSecondary }]}>{coach.title}</Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {/* Player roster */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>
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
                          <Text style={[styles.rosterName, { color: colors.text }]}>{p.name}</Text>
                          <Text style={[styles.rosterMeta, { color: colors.textSecondary }]}>
                            {p.position} · {p.height}{p.weight ? ` · ${p.weight}` : ''} · {p.classYear}
                          </Text>
                        </View>
                        {score != null ? (
                          <Text style={[styles.rosterScore, { color: scoreColor }]}>{Math.round(score)}</Text>
                        ) : (
                          <Text style={[styles.rosterScore, { color: colors.textTertiary }]}>—</Text>
                        )}
                      </Pressable>
                    );
                  })
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
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
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>TEAM KR</Text>
                <View style={styles.krBreakdownRow}>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>OFF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.offKR) }]}>
                      {data.offKR != null ? Math.round(data.offKR) : '—'}
                    </Text>
                  </View>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>DEF KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: getKRColor(data.defKR) }]}>
                      {data.defKR != null ? Math.round(data.defKR) : '—'}
                    </Text>
                  </View>
                  <View style={styles.krBreakdownItem}>
                    <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>TEAM KR</Text>
                    <Text style={[styles.krBreakdownValue, { color: krColor }]}>
                      {data.teamKR != null ? Math.round(data.teamKR) : '—'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Stat Leaders */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>STAT LEADERS</Text>
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
                        <Text style={[styles.leaderCategory, { color: colors.textTertiary }]}>PPG</Text>
                        <Text style={[styles.leaderName, { color: colors.text }]}>{statLeaders.ppg.name}</Text>
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
                        <Text style={[styles.leaderCategory, { color: colors.textTertiary }]}>RPG</Text>
                        <Text style={[styles.leaderName, { color: colors.text }]}>{statLeaders.rpg.name}</Text>
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
                        <Text style={[styles.leaderCategory, { color: colors.textTertiary }]}>APG</Text>
                        <Text style={[styles.leaderName, { color: colors.text }]}>{statLeaders.apg.name}</Text>
                        <Text style={[styles.leaderValue, { color: accent }]}>{statLeaders.apg.apg?.toFixed(1)}</Text>
                      </Pressable>
                    )}
                  </>
                ) : (
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
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
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>RECENT VIDEOS</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  No video clips available yet.
                </Text>
              </View>

              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SHORTCUTS</Text>
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

const styles = StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  initialsCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  initialsText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  teamName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  subline: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 2 },
  recordText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3, marginTop: 2 },

  // Sticky Rating Strip
  ratingStrip: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.sm, gap: 6 },
  ratingStripMain: { flexDirection: 'row', alignItems: 'center', gap: 16, justifyContent: 'center' },
  ratingBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, alignItems: 'center' },
  ratingBadgeVal: { fontSize: 24, fontWeight: '900', letterSpacing: -0.5 },
  ratingBadgeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  ratingMini: { alignItems: 'center' },
  ratingMiniVal: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  ratingMiniLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  systemsSummaryRow: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  systemsTag: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3 },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // System
  systemPair: { flexDirection: 'row', justifyContent: 'space-around' },
  systemHalf: { alignItems: 'center', gap: 3 },
  systemLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  systemValue: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  systemScore: { fontSize: 12, fontWeight: '700' },

  // Record
  recordRow: { flexDirection: 'row', justifyContent: 'space-around' },
  recordItem: { alignItems: 'center', gap: 4 },
  recordLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  recordValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },

  // Rotation snapshot
  rotationRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 },
  rotationRank: { width: 20, fontSize: 12, fontWeight: '700', textAlign: 'center' },
  rotationName: { fontSize: 13, fontWeight: '700' },
  rotationPos: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  rotationKR: { fontSize: 14, fontWeight: '800', width: 30, textAlign: 'right' },

  // KR breakdown
  krBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around' },
  krBreakdownItem: { alignItems: 'center', gap: 2 },
  krBreakdownLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  krBreakdownValue: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  // Lens
  lensScroll: { marginBottom: 4 },
  lensRow: { flexDirection: 'row', gap: 6, paddingHorizontal: 2 },
  lensPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  lensPillText: { fontSize: 12, fontWeight: '700' },

  // Roster
  rosterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.05)' },
  rosterName: { fontSize: 14, fontWeight: '700' },
  rosterMeta: { fontSize: 11, fontWeight: '600', marginTop: 1 },
  rosterScore: { fontSize: 16, fontWeight: '800', width: 34, textAlign: 'right' },

  // Stat Leaders
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  leaderCategory: { width: 30, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  leaderName: { fontSize: 13, fontWeight: '700', flex: 1 },
  leaderValue: { fontSize: 14, fontWeight: '800', width: 36, textAlign: 'right' },

  // Lists
  listRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet: { fontSize: 13, lineHeight: 18 },
  listText: { fontSize: 13, fontWeight: '600', lineHeight: 18, flex: 1 },

  // People
  personRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  personAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  personInitials: { fontSize: 14, fontWeight: '800', color: '#fff' },
  personName: { fontSize: 14, fontWeight: '700' },
  personRole: { fontSize: 12, fontWeight: '600', marginTop: 1 },

  // Video shortcuts
  shortcutBtn: { paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth, alignItems: 'center' },
  shortcutBtnText: { fontSize: 14, fontWeight: '700' },

  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
