/**
 * Player Sheet — Full intelligence player profile bottom sheet.
 * Shows KR (level-aware), archetype, badges, clusters, stats, system fit, notes.
 * Renamed from player-card-sheet.tsx for v2 universal sheet system.
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing } from '@/constants/theme';
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

interface Props {
  visible: boolean;
  onClose: () => void;
  data: PlayerCardData | null;
}

export function PlayerSheet({ visible, onClose, data }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
  const tierLabel = data.levelKey ? getKRTierLabel(kr, data.levelKey) : getKRBandLabel(kr);
  const archDisplay = getArchetypeDisplay(data.archetype);
  const levelTag = data.levelKey ? (LEVEL_DISPLAY_SHORT[data.levelKey] || data.levelDisplay || '') : '';

  // Compute badges if we have cluster data
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

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* ── HEADER ── */}
          <View style={styles.identityRow}>
            <View style={[styles.avatarCircle, { backgroundColor: `hsl(${hue}, 50%, 35%)` }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[styles.playerName, { color: colors.text }]}>
                  {data.name}
                </Text>
                {data.number ? (
                  <Text style={[styles.jerseyBadge, { color: colors.textSecondary }]}>#{data.number}</Text>
                ) : null}
              </View>
              <Text style={[styles.playerMeta, { color: colors.textSecondary }]}>
                {data.position} · {data.height}{data.weight ? ` · ${data.weight} lbs` : ''} · {data.classYear}
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                {data.school ? (
                  <Text style={[styles.schoolText, { color: colors.textSecondary }]}>{data.school}</Text>
                ) : null}
                {data.conference ? (
                  <Text style={[styles.confText, { color: colors.textTertiary }]}>· {data.conference}</Text>
                ) : null}
                {levelTag ? (
                  <View style={[styles.levelBadge, { backgroundColor: colors.border }]}>
                    <Text style={[styles.levelBadgeText, { color: colors.text }]}>{levelTag}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>

          {/* ── KR SECTION ── */}
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
              {/* Off/Def KR breakdown */}
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

          {/* ── ARCHETYPE SECTION ── */}
          {data.archetype ? (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>ARCHETYPE</Text>
              <Text style={[styles.archetypeText, { color: colors.text }]}>{archDisplay}</Text>
              {data.confidence != null && (
                <Text style={[styles.archetypeConfidence, { color: colors.textSecondary }]}>
                  {Math.round(data.confidence)}% confidence
                </Text>
              )}
            </View>
          ) : null}

          {/* ── BADGES SECTION ── */}
          {badges.length > 0 && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

          {/* ── CLUSTERS SECTION ── */}
          {data.clusters && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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

          {/* ── STATS SECTION ── */}
          {data.ppg != null && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
          )}

          {/* ── BACKGROUND ── */}
          {(data.hometown || data.previousSchool || data.portalEntryDate) && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>BACKGROUND</Text>
              {data.hometown && <InfoRow label="Hometown" value={data.hometown} colors={colors} />}
              {data.previousSchool && <InfoRow label="Previous School" value={data.previousSchool} colors={colors} />}
              {data.portalEntryDate && <InfoRow label="Portal Entry" value={data.portalEntryDate} colors={colors} />}
            </View>
          )}

          {/* ── SCHOLARSHIP / NIL ── */}
          {(data.scholarshipPct != null || data.nilAmount != null) && (
            <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>SCHOLARSHIP & NIL</Text>
              {data.scholarshipPct != null && (
                <InfoRow label="Scholarship" value={`${Math.round(data.scholarshipPct)}%`} colors={colors} />
              )}
              {data.nilAmount != null && (
                <InfoRow label="NIL Allocation" value={`$${Math.round(data.nilAmount).toLocaleString()}`} colors={colors} />
              )}
            </View>
          )}

          {/* ── NOTES / EVIDENCE ── */}
          <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>NOTES & EVIDENCE</Text>
            <Text style={[styles.placeholderText, { color: colors.textTertiary }]}>
              No scouting notes yet. Attach film clips, game notes, or evaluation tags here.
            </Text>
          </View>

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

// ── Styles ──

const styles = StyleSheet.create({
  scroll: { maxHeight: '100%' },
  container: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 30 },

  // Identity
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatarCircle: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 20, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  playerName: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  jerseyBadge: { fontSize: 14, fontWeight: '700', letterSpacing: 0.5 },
  playerMeta: { fontSize: 13, fontWeight: '600', marginTop: 2, letterSpacing: 0.3 },
  schoolText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  confText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  levelBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  levelBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },

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

  // Sections
  sectionCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  sectionTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },

  // Archetype
  archetypeText: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  archetypeConfidence: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  // Badges
  badgeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeSummary: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  badgeChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeName: { fontSize: 11, fontWeight: '700' },

  // Clusters
  clusterRow: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 24 },
  clusterLabel: { width: 80, fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  clusterBarContainer: { flex: 1 },
  clusterBarBg: { height: 6, borderRadius: 6, overflow: 'hidden' },
  clusterBarFill: { height: 6, borderRadius: 6 },
  clusterScore: { width: 26, fontSize: 12, fontWeight: '800', textAlign: 'right', letterSpacing: -0.3 },

  // Stats
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  statCell: { width: '18%', alignItems: 'center', paddingVertical: 6 },
  statCellLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  statCellValue: { fontSize: 14, fontWeight: '800', marginTop: 2, letterSpacing: -0.3 },
  gpNote: { fontSize: 11, fontWeight: '500', textAlign: 'center', marginTop: 4 },

  // Info rows
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  infoValue: { fontSize: 13, fontWeight: '700' },

  // Notes placeholder
  placeholderText: { fontSize: 13, fontWeight: '500', fontStyle: 'italic' },
});
