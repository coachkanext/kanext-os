/**
 * Player Sheet — Universal 4-tab player profile bottom sheet.
 * Tabs: Overview | Bio | Stats | Development
 * Header (name, #, position, status, team) always visible above tabs.
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { PlayerCardData } from '@/utils/global-entity-sheets';
import {
  getKRColor,
  getKRTierLabel,
  getKRBandLabel,
  getKRPercentileLabel,
  getArchetypeDisplay,
  CLUSTER_ORDER,
  CLUSTER_LABELS,
  BADGE_COLORS,
  BADGE_BG_COLORS,
  LEVEL_DISPLAY_SHORT,
} from '@/utils/kr-display';
import { computePlayerBadges, type PlayerBadge } from '@/utils/player-badges';

function nameToHue(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return Math.abs(h) % 360;
}

type Tab = 'overview' | 'bio' | 'stats' | 'development';

const TABS: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'bio', label: 'Bio' },
  { key: 'stats', label: 'Stats' },
  { key: 'development', label: 'Dev' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PlayerCardData | null;
}

export function PlayerSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Reset tab when sheet reopens
  React.useEffect(() => {
    if (visible) setActiveTab('overview');
  }, [visible]);

  if (!data) return null;

  const hue = data.teamColor ? nameToHue(data.teamColor) : nameToHue(data.name);
  const initials = data.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const kr = data.kr;
  const krColor = getKRColor(kr);
  const tierLabel = data.levelKey ? getKRTierLabel(kr!, data.levelKey) : getKRBandLabel(kr);
  const archDisplay = getArchetypeDisplay(data.archetype);
  const levelTag = data.levelKey ? (LEVEL_DISPLAY_SHORT[data.levelKey] || data.levelDisplay || '') : '';

  // Compute badges
  const badges: PlayerBadge[] = data.clusters
    ? computePlayerBadges(
        data.clusters as any,
        (clusterKey: string) => {
          const score = (data.clusters as Record<string, number>)?.[clusterKey] ?? 50;
          return [{ name: clusterKey, rating: score }];
        },
      )
    : [];

  const goldCount = badges.filter(b => b.level === 'Gold').length;
  const silverCount = badges.filter(b => b.level === 'Silver').length;
  const bronzeCount = badges.filter(b => b.level === 'Bronze').length;

  // Status chip color
  const statusColor = data.status === 'Injured' ? '#EF4444' : data.status === 'Out' ? '#A1A1AA' : '#22C55E';

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.headerSection}>
        {/* ── HEADER — always visible ── */}
        <View style={styles.identityRow}>
          <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={[styles.playerName, { color: colors.text }]}>{data.name}</Text>
              {data.number ? (
                <Text style={[styles.jerseyBadge, { color: colors.textSecondary }]}>#{data.number}</Text>
              ) : null}
            </View>
            <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
              {data.position} · {data.height}{data.weight ? ` · ${data.weight} lbs` : ''} · {data.classYear}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
              {data.school ? (
                <View style={[styles.teamChip, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.teamChipText, { color: colors.text }]}>{data.school}</Text>
                </View>
              ) : null}
              {data.status ? (
                <View style={[styles.statusChip, { backgroundColor: statusColor + '20' }]}>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[styles.statusChipText, { color: statusColor }]}>{data.status}</Text>
                </View>
              ) : null}
              {levelTag ? (
                <View style={[styles.levelBadge, { backgroundColor: colors.border }]}>
                  <Text style={[styles.levelBadgeText, { color: colors.text }]}>{levelTag}</Text>
                </View>
              ) : null}
            </View>
          </View>
          {/* KR chip */}
          {kr != null && (
            <View style={[styles.krChip, { backgroundColor: krColor + '20' }]}>
              <Text style={[styles.krChipVal, { color: krColor }]}>{Math.round(kr)}</Text>
            </View>
          )}
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
              {/* KR Card */}
              {kr != null && (
                <View style={[styles.krCard, { backgroundColor: krColor + '15', borderColor: krColor + '40' }]}>
                  <View style={styles.krRow}>
                    <View style={[styles.krBadge, { backgroundColor: krColor }]}>
                      <Text style={styles.krNumber}>{Math.round(kr)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.krTierLabel, { color: krColor }]}>{tierLabel}</Text>
                      {data.levelKey && (
                        <Text style={[styles.krPercentile, { color: colors.textSecondary }]}>
                          {getKRPercentileLabel(kr, data.levelKey)} {levelTag ? `in ${levelTag}` : 'nationally'}
                        </Text>
                      )}
                    </View>
                    {data.bprAvg != null && (
                      <View style={styles.bprWrap}>
                        <Text style={[styles.bprLabel, { color: colors.textTertiary }]}>BPR</Text>
                        <Text style={[styles.bprValue, { color: colors.text }]}>{data.bprAvg.toFixed(1)}</Text>
                      </View>
                    )}
                  </View>
                  {data.offKR != null && data.defKR != null && (
                    <View style={styles.krBreakdownRow}>
                      <View style={styles.krBreakdownItem}>
                        <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>OFF KR</Text>
                        <Text style={[styles.krBreakdownValue, { color: getKRColor(data.offKR) }]}>
                          {Math.round(data.offKR)}
                        </Text>
                      </View>
                      <View style={styles.krBreakdownItem}>
                        <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>DEF KR</Text>
                        <Text style={[styles.krBreakdownValue, { color: getKRColor(data.defKR) }]}>
                          {Math.round(data.defKR)}
                        </Text>
                      </View>
                      {data.overallFitPct != null && (
                        <View style={styles.krBreakdownItem}>
                          <Text style={[styles.krBreakdownLabel, { color: colors.textTertiary }]}>FIT</Text>
                          <Text style={[styles.krBreakdownValue, { color: getKRColor(data.overallFitPct) }]}>
                            {Math.round(data.overallFitPct)}%
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              )}

              {/* Archetype */}
              {data.archetype ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ARCHETYPE</Text>
                  <Text style={[styles.archetypeText, { color: colors.text }]}>{archDisplay}</Text>
                  {data.confidence != null && (
                    <Text style={[styles.archetypeConf, { color: colors.textSecondary }]}>
                      {Math.round(data.confidence)}% confidence
                    </Text>
                  )}
                </View>
              ) : null}

              {/* Skill Clusters */}
              {data.clusters && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SKILL CLUSTERS</Text>
                  {CLUSTER_ORDER.map(key => {
                    const score = (data.clusters as Record<string, number>)[key] ?? 50;
                    const clusterColor = getKRColor(score);
                    const label = CLUSTER_LABELS[key]?.label ?? key;
                    const pct = Math.min(100, Math.max(0, score));
                    return (
                      <View key={key} style={styles.clusterRow}>
                        <Text style={[styles.clusterLabel, { color: colors.textSecondary }]}>{label}</Text>
                        <View style={styles.clusterBarContainer}>
                          <View style={[styles.clusterBarBg, { backgroundColor: colors.border }]}>
                            <View style={[styles.clusterBarFill, { width: `${pct}%`, backgroundColor: clusterColor }]} />
                          </View>
                        </View>
                        <Text style={[styles.clusterScore, { color: clusterColor }]}>{score}</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Badges */}
              {badges.length > 0 && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.badgeHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BADGES</Text>
                    <Text style={[styles.badgeSummary, { color: colors.textSecondary }]}>
                      {goldCount > 0 ? `${goldCount} Gold · ` : ''}{silverCount > 0 ? `${silverCount} Silver · ` : ''}{bronzeCount} Bronze
                    </Text>
                  </View>
                  <View style={styles.badgeGrid}>
                    {badges.map((badge, i) => (
                      <View
                        key={`${badge.name}-${i}`}
                        style={[styles.badgeChip, { backgroundColor: BADGE_BG_COLORS[badge.level], borderColor: BADGE_COLORS[badge.level] + '60' }]}
                      >
                        <View style={[styles.badgeDot, { backgroundColor: BADGE_COLORS[badge.level] }]} />
                        <Text style={[styles.badgeName, { color: colors.text }]}>{badge.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 2 — BIO
              ════════════════════════════════════════════ */}
          {activeTab === 'bio' && (
            <>
              {/* Background */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BACKGROUND</Text>
                <InfoRow label="Hometown" value={data.hometown || '—'} colors={colors} />
                <InfoRow label="Previous School" value={data.previousSchool || '—'} colors={colors} />
                {data.portalEntryDate && (
                  <InfoRow label="Portal Entry" value={data.portalEntryDate} colors={colors} />
                )}
                <InfoRow label="Class" value={data.classYear} colors={colors} />
                <InfoRow label="Height" value={data.height} colors={colors} />
                {data.weight ? <InfoRow label="Weight" value={`${data.weight} lbs`} colors={colors} /> : null}
              </View>

              {/* Conference / Level */}
              {(data.conference || levelTag) && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>AFFILIATION</Text>
                  {data.conference && <InfoRow label="Conference" value={data.conference} colors={colors} />}
                  {levelTag && <InfoRow label="Level" value={levelTag} colors={colors} />}
                </View>
              )}

              {/* Scholarship / NIL */}
              {(data.scholarshipPct != null || data.nilAmount != null) && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SCHOLARSHIP & NIL</Text>
                  {data.scholarshipPct != null && (
                    <InfoRow label="Scholarship" value={`${Math.round(data.scholarshipPct)}%`} colors={colors} />
                  )}
                  {data.nilAmount != null && (
                    <InfoRow label="NIL Allocation" value={`$${Math.round(data.nilAmount).toLocaleString()}`} colors={colors} />
                  )}
                </View>
              )}

              {/* Awards placeholder */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>AWARDS & HONORS</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  No awards data available yet.
                </Text>
              </View>
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 3 — STATS
              ════════════════════════════════════════════ */}
          {activeTab === 'stats' && (
            <>
              {/* Season selector chip */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={[styles.seasonChip, { backgroundColor: accent + '20', borderColor: accent + '40' }]}>
                  <Text style={[styles.seasonChipText, { color: accent }]}>2025-26</Text>
                </View>
              </View>

              {/* Season averages */}
              {data.ppg != null ? (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SEASON AVERAGES</Text>
                  <View style={styles.statsGrid}>
                    <StatCell label="PPG" value={data.ppg?.toFixed(1)} colors={colors} />
                    <StatCell label="RPG" value={data.rpg?.toFixed(1)} colors={colors} />
                    <StatCell label="APG" value={data.apg?.toFixed(1)} colors={colors} />
                    <StatCell label="SPG" value={data.spg?.toFixed(1)} colors={colors} />
                    <StatCell label="BPG" value={data.bpg?.toFixed(1)} colors={colors} />
                    <StatCell label="MPG" value={data.mpg?.toFixed(1)} colors={colors} />
                    <StatCell label="FG%" value={data.fgPct != null ? `${(data.fgPct * 100).toFixed(0)}` : undefined} colors={colors} />
                    <StatCell label="3P%" value={data.threePct != null ? `${(data.threePct * 100).toFixed(0)}` : undefined} colors={colors} />
                    <StatCell label="FT%" value={data.ftPct != null ? `${(data.ftPct * 100).toFixed(0)}` : undefined} colors={colors} />
                    <StatCell label="TO" value={data.topg?.toFixed(1)} colors={colors} />
                  </View>
                  {data.gp != null && (
                    <Text style={[styles.gpNote, { color: colors.textTertiary }]}>{data.gp} games played</Text>
                  )}
                </View>
              ) : (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                    No season stats available.
                  </Text>
                </View>
              )}

              {/* Shooting splits */}
              {data.fgPct != null && (
                <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SHOOTING SPLITS</Text>
                  <View style={styles.splitsRow}>
                    <SplitBar label="FG" pct={data.fgPct} colors={colors} accent={accent} />
                    {data.threePct != null && <SplitBar label="3PT" pct={data.threePct} colors={colors} accent={accent} />}
                    {data.ftPct != null && <SplitBar label="FT" pct={data.ftPct} colors={colors} accent={accent} />}
                  </View>
                </View>
              )}
            </>
          )}

          {/* ════════════════════════════════════════════
              TAB 4 — DEVELOPMENT
              ════════════════════════════════════════════ */}
          {activeTab === 'development' && (
            <>
              {/* Focus areas */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>FOCUS AREAS</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  Development plan not yet generated. Open in Nexus to create one.
                </Text>
              </View>

              {/* Weekly plan */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>WEEKLY PLAN</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  No weekly plan assigned. Generate via Nexus.
                </Text>
              </View>

              {/* Evidence log */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>EVIDENCE LOG</Text>
                <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  No scouting notes yet. Attach film clips, game notes, or evaluation tags here.
                </Text>
              </View>
            </>
          )}

        </View>
      </ScrollView>
    </BottomSheet>
  );
}

// ── Helper Components ──

function StatCell({ label, value, colors }: { label: string; value?: string; colors: typeof Colors.light }) {
  if (value == null) return null;
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statCellLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.statCellValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function SplitBar({ label, pct, colors, accent }: { label: string; pct: number; colors: typeof Colors.light; accent: string }) {
  const width = Math.min(100, Math.max(0, pct * 100));
  return (
    <View style={styles.splitBarItem}>
      <Text style={[styles.splitBarLabel, { color: colors.textTertiary }]}>{label}</Text>
      <View style={[styles.splitBarBg, { backgroundColor: colors.border }]}>
        <View style={[styles.splitBarFill, { width: `${width}%`, backgroundColor: accent }]} />
      </View>
      <Text style={[styles.splitBarPct, { color: colors.text }]}>{(pct * 100).toFixed(0)}%</Text>
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  headerSection: { padding: Spacing.md, paddingBottom: 0, gap: Spacing.sm },
  scroll: { maxHeight: '100%' },
  tabContent: { padding: Spacing.md, paddingTop: Spacing.sm, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  playerName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  jerseyBadge: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  playerMeta: { fontSize: 13, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 },

  // Chips
  teamChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: StyleSheet.hairlineWidth },
  teamChipText: { fontSize: 11, fontWeight: '700' },
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  levelBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  levelBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

  // KR chip (header)
  krChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, alignItems: 'center' },
  krChipVal: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },

  // Tab pills
  tabRow: { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 4 },
  tabPill: { flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center' },
  tabPillActive: {},
  tabText: { fontSize: 13, fontWeight: '700' },

  // KR Card
  krCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  krRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  krBadge: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  krNumber: { fontSize: 20, fontWeight: '900', color: '#000', letterSpacing: -0.3 },
  krTierLabel: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  krPercentile: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  bprWrap: { alignItems: 'center' },
  bprLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },
  bprValue: { fontSize: 16, fontWeight: '800' },
  krBreakdownRow: { flexDirection: 'row', justifyContent: 'space-around', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 8 },
  krBreakdownItem: { alignItems: 'center', gap: 2 },
  krBreakdownLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  krBreakdownValue: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },

  // Cards
  card: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Archetype
  archetypeText: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  archetypeConf: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Clusters
  clusterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 24 },
  clusterLabel: { width: 80, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  clusterBarContainer: { flex: 1 },
  clusterBarBg: { height: 6, borderRadius: 6, overflow: 'hidden' },
  clusterBarFill: { height: 6, borderRadius: 6 },
  clusterScore: { width: 26, fontSize: 12, fontWeight: '800', textAlign: 'right', letterSpacing: -0.3 },

  // Badges
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeSummary: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeName: { fontSize: 11, fontWeight: '700' },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statCell: { width: '18%', alignItems: 'center', paddingVertical: 6 },
  statCellLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statCellValue: { fontSize: 14, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  gpNote: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 4 },

  // Season chip
  seasonChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
  seasonChipText: { fontSize: 12, fontWeight: '700' },

  // Shooting splits
  splitsRow: { gap: 10 },
  splitBarItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  splitBarLabel: { width: 28, fontSize: 11, fontWeight: '700', letterSpacing: 0.3, textAlign: 'right' },
  splitBarBg: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  splitBarFill: { height: 8, borderRadius: 4 },
  splitBarPct: { width: 36, fontSize: 12, fontWeight: '800', textAlign: 'right' },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '700' },

  // Placeholder
  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
