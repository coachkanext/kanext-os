/**
 * Recruiting Player Sheet — spec-compliant bottom sheet for pool players.
 * Header with identity line, base/fit KR, off/def split, fit/clusters tabs,
 * role block, editable notes, season stats.
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Spacing, BorderRadius } from '@/constants/theme';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { CLUSTER_SUBCLUSTERS, type ClusterRatings } from '@/data/roster-data';
import { ARCHETYPE_LABELS } from '@/data/system-demand-profiles';
import type { Archetype } from '@/data/system-demand-profiles';
import { CLUSTER_LABELS } from '@/data/mock-program-context';
import type { OffensiveStyle, DefensiveStyle, ClusterType } from '@/types';
import { TRADITIONAL_TO_HELIO } from '@/data/position-mapping';
import { HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { getPlayerRatings } from '@/data/playerRatings';
import { getPlayerSeasons } from '@/data/playerSeasons';
import { computeFitKR, computeOffDefKR, getFitReasons } from '@/utils/fit-kr';
import { OFFENSIVE_STYLES, DEFENSIVE_STYLES } from '@/data/mock-program-context';
import type { PoolPlayer } from '@/data/playerPool';

// ─── Constants ───
const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

type SheetTab = 'fit' | 'clusters';

const ALL_CLUSTER_KEYS: (keyof ClusterRatings)[] = [
  'shooting', 'finishing', 'playmaking',
  'perimeter_defense', 'interior_defense', 'rebounding', 'frame',
];

// Deterministic hash for stable subcluster generation (same as roster-data)
function simpleHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function getPoolPlayerSubclusters(
  playerId: string,
  clusterKey: keyof ClusterRatings,
  baseRating: number,
): { name: string; rating: number }[] {
  const subs = CLUSTER_SUBCLUSTERS[clusterKey];
  return subs.map((name, i) => {
    const seed = simpleHash(`${playerId}-${clusterKey}-${i}`);
    const variation = (seed % 17) - 8;
    const rating = Math.max(15, Math.min(98, baseRating + variation));
    return { name, rating };
  });
}

// ─── Archetype → usage/touches mapping ───
const HIGH_USAGE_ARCHETYPES = new Set<Archetype>([
  'pick_and_roll_operator', 'primary_ball_handler', 'dho_handoff_hub',
  'secondary_creator_wing', 'connector_guard_wing',
]);
const MED_USAGE_ARCHETYPES = new Set<Archetype>([
  'two_way_wing', 'three_and_d_wing', 'slasher_rim_pressure_wing',
  'switchable_defender_wing', 'off_ball_shooter',
]);

function getUsageTouches(archetype: Archetype): { usage: string; touches: string } {
  if (HIGH_USAGE_ARCHETYPES.has(archetype)) return { usage: 'High', touches: 'High' };
  if (MED_USAGE_ARCHETYPES.has(archetype)) return { usage: 'Med', touches: 'Med' };
  return { usage: 'Low', touches: 'Low' };
}

function getLineupSlot(fitKR: number): string {
  if (fitKR >= 80) return 'Starter';
  if (fitKR >= 65) return 'Rotation Anchor';
  if (fitKR >= 50) return 'Specialist';
  return 'Depth';
}

// Complementary archetype pairings by position category
const PAIRING_MAP: Record<string, Archetype[]> = {
  PG: ['spot_up_specialist', 'vertical_spacer'],
  SG: ['pick_and_roll_operator', 'two_way_wing'],
  SF: ['primary_ball_handler', 'stretch_big'],
  PF: ['connector_guard_wing', 'three_and_d_wing'],
  C: ['pick_and_roll_operator', 'three_and_d_wing'],
};

// ── Cluster Bar ──

function ClusterBar({
  clusterKey,
  value,
  playerId,
  expanded,
  onToggle,
}: {
  clusterKey: keyof ClusterRatings;
  value: number;
  playerId: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  const label = CLUSTER_LABELS[clusterKey as ClusterType]?.label ?? clusterKey;
  const barColor = value >= 70 ? '#4CAF50' : value >= 55 ? '#FF9800' : '#EF4444';
  const pct = Math.min(value, 100);
  const subclusters = expanded ? getPoolPlayerSubclusters(playerId, clusterKey, value) : [];

  return (
    <View>
      <Pressable style={barStyles.row} onPress={onToggle}>
        <View style={barStyles.labelCol}>
          <Text style={barStyles.label}>{label}</Text>
        </View>
        <View style={barStyles.barTrack}>
          <View style={[barStyles.barFill, { width: `${pct}%`, backgroundColor: barColor }]} />
        </View>
        <Text style={[barStyles.value, { color: barColor }]}>{value}</Text>
        <Text style={barStyles.chevron}>{expanded ? '\u25BE' : '\u203A'}</Text>
      </Pressable>

      {expanded && subclusters.map((sc) => {
        const scColor = sc.rating >= 70 ? '#4CAF50' : sc.rating >= 55 ? '#FF9800' : '#EF4444';
        const scPct = Math.min(sc.rating, 100);
        return (
          <View key={sc.name} style={barStyles.subRow}>
            <Text style={barStyles.subLabel}>{sc.name}</Text>
            <View style={barStyles.subBarTrack}>
              <View style={[barStyles.barFill, { width: `${scPct}%`, backgroundColor: scColor }]} />
            </View>
            <Text style={[barStyles.subValue, { color: scColor }]}>{sc.rating}</Text>
          </View>
        );
      })}
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, paddingVertical: 2 },
  labelCol: { width: 72 },
  label: { fontSize: 11, fontWeight: '600', color: '#f5f5f5' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#2a2a2a', borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 },
  barFill: { height: '100%', borderRadius: 4 },
  value: { fontSize: 13, fontWeight: '700', width: 28, textAlign: 'right' },
  chevron: { fontSize: 11, color: '#6e6e6e', width: 16, textAlign: 'center', marginLeft: 2 },
  subRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 20, marginBottom: 6 },
  subLabel: { fontSize: 10, color: '#999', width: 100 },
  subBarTrack: { flex: 1, height: 5, backgroundColor: '#222', borderRadius: 3, overflow: 'hidden', marginHorizontal: 6 },
  subValue: { fontSize: 11, fontWeight: '600', width: 24, textAlign: 'right' },
});

// ── Main Sheet ──

export interface RecruitingPlayerSheetProps {
  visible: boolean;
  onClose: () => void;
  player: PoolPlayer | null;
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
  onOffStyleChange: (style: OffensiveStyle) => void;
  onDefStyleChange: (style: DefensiveStyle) => void;
  fitNote: string;
  onFitNoteChange: (text: string) => void;
  coachNote: string;
  onCoachNoteChange: (text: string) => void;
}

export function RecruitingPlayerSheet({
  visible,
  onClose,
  player,
  offStyle,
  defStyle,
  onOffStyleChange,
  onDefStyleChange,
  fitNote,
  onFitNoteChange,
  coachNote,
  onCoachNoteChange,
}: RecruitingPlayerSheetProps) {
  const [activeTab, setActiveTab] = useState<SheetTab>('fit');
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  const toggleCluster = (key: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  useEffect(() => {
    if (visible && player) {
      setActiveTab('fit');
      setExpandedClusters(new Set());
    }
  }, [visible, player]);

  const ratings = useMemo(() => player ? getPlayerRatings(player.id) : null, [player?.id]);
  const clusters = ratings?.clusters ?? null;

  const fitKR = useMemo(() => {
    if (!clusters) return 0;
    return computeFitKR(clusters, offStyle, defStyle);
  }, [clusters, offStyle, defStyle]);

  const offDef = useMemo(() => {
    if (!clusters) return null;
    return computeOffDefKR(clusters, offStyle, defStyle);
  }, [clusters, offStyle, defStyle]);

  const fitReasons = useMemo(() => {
    if (!clusters) return [];
    return getFitReasons(clusters, player ? [player.archetype] : [], offStyle, defStyle);
  }, [clusters, player?.archetype, offStyle, defStyle]);

  const seasons = useMemo(() => player ? getPlayerSeasons(player.id) : [], [player?.id]);

  if (!player) return null;

  const baseKR = ratings?.overall ?? 0;
  const delta = fitKR - baseKR;
  const deltaColor = delta > 0 ? '#4CAF50' : delta < 0 ? '#EF4444' : '#6e6e6e';
  const deltaText = delta > 0 ? `+${delta}` : `${delta}`;

  // Identity line
  const helioPos = TRADITIONAL_TO_HELIO[player.position];
  const posLabel = HELIO_POSITION_LABELS[helioPos] ?? player.position;
  const levelLabel = player.level === 'HS' ? 'Prep' : player.level;
  const archetypeLabel = ARCHETYPE_LABELS[player.archetype] ?? player.archetype;

  // Role block
  const { usage, touches } = getUsageTouches(player.archetype);
  const lineupSlot = getLineupSlot(fitKR);
  const pairings = PAIRING_MAP[player.position] ?? ['two_way_wing', 'spot_up_specialist'];
  const pairingLabels = pairings.map((a) => ARCHETYPE_LABELS[a] ?? a);

  // Off/Def deltas
  const offDelta = offDef ? offDef.fitOff - offDef.baseOff : 0;
  const defDelta = offDef ? offDef.fitDef - offDef.baseDef : 0;

  return (
    <BottomSheet useModal visible={visible} onClose={onClose} mode="full">
      {/* §1 Header + §2 Rating */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerName}>
            {player.firstName} {player.lastName}
          </Text>
          <Text style={styles.headerIdentity}>
            Class {player.classYear} {'\u00B7'} {player.currentSchool}
          </Text>
        </View>
        <View style={styles.headerBadges}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{levelLabel}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>{helioPos}</Text>
          </View>
        </View>
      </View>

      {/* Rating block */}
      <View style={styles.ratingRow}>
        <View style={styles.krBlock}>
          <Text style={styles.krLabel}>BASE</Text>
          <Text style={styles.krNum}>{baseKR}</Text>
        </View>
        <View style={styles.krBlock}>
          <Text style={styles.krLabel}>FIT</Text>
          <Text style={[styles.krNum, { color: deltaColor }]}>{fitKR}</Text>
        </View>
        <View style={[styles.deltaBadge, { backgroundColor: `${deltaColor}20` }]}>
          <Text style={[styles.deltaText, { color: deltaColor }]}>{deltaText}</Text>
        </View>
      </View>

      {/* Off/Def compact row */}
      {offDef && (
        <View style={styles.offDefRow}>
          <Text style={styles.offDefText}>
            OFF {offDef.baseOff} {'\u2192'} {offDef.fitOff}{' '}
            <Text style={{ color: offDelta >= 0 ? '#4CAF50' : '#EF4444' }}>
              ({offDelta >= 0 ? '+' : ''}{offDelta})
            </Text>
          </Text>
          <View style={styles.offDefDivider} />
          <Text style={styles.offDefText}>
            DEF {offDef.baseDef} {'\u2192'} {offDef.fitDef}{' '}
            <Text style={{ color: defDelta >= 0 ? '#4CAF50' : '#EF4444' }}>
              ({defDelta >= 0 ? '+' : ''}{defDelta})
            </Text>
          </Text>
        </View>
      )}

      {/* System selectors */}
      <View style={styles.systemRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.systemScroll}>
          <Text style={styles.systemLabel}>OFF</Text>
          {OFFENSIVE_STYLES.map((s) => {
            const active = s.value === offStyle;
            return (
              <Pressable
                key={s.value}
                style={[styles.systemPill, active && styles.systemPillActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onOffStyleChange(s.value);
                }}
              >
                <Text style={[styles.systemPillText, active && styles.systemPillTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <View style={styles.systemRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.systemScroll}>
          <Text style={styles.systemLabel}>DEF</Text>
          {DEFENSIVE_STYLES.map((s) => {
            const active = s.value === defStyle;
            return (
              <Pressable
                key={s.value}
                style={[styles.systemPill, active && styles.systemPillActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onDefStyleChange(s.value);
                }}
              >
                <Text style={[styles.systemPillText, active && styles.systemPillTextActive]}>{s.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* §3 Toggle pills */}
      <View style={styles.tabRow}>
        {(['fit', 'clusters'] as SheetTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              style={[styles.tabPill, isActive && styles.tabPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab);
              }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab === 'fit' ? 'Fit' : 'Clusters'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* §4 Fit tab */}
      {activeTab === 'fit' && (
        <View style={styles.fitContent}>
          {/* Fit reasons */}
          {fitReasons.length > 0 ? (
            fitReasons.map((r, i) => (
              <View key={i} style={styles.reasonRow}>
                <Text style={styles.reasonBullet}>{'\u2022'}</Text>
                <Text style={styles.reasonText}>
                  <Text style={{ fontWeight: '700', color: r.delta >= 0 ? '#4CAF50' : '#EF4444' }}>
                    {r.driver}
                  </Text>
                  {' '}({r.cluster}, {r.delta >= 0 ? '+' : ''}{r.delta}) {'\u2014'} {r.reason}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.reasonText}>No cluster data available.</Text>
          )}

          {/* §5 Role block */}
          <View style={styles.roleBox}>
            <Text style={styles.roleLabel}>ROLE</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleValue}>Primary: {archetypeLabel}</Text>
            </View>
            <View style={styles.roleRow}>
              <Text style={styles.roleDetail}>Usage: {usage}</Text>
              <Text style={styles.roleDetail}> {'\u00B7'} Touches: {touches}</Text>
            </View>
            <View style={styles.roleRow}>
              <Text style={styles.roleDetail}>Lineup Slot: {lineupSlot}</Text>
            </View>
            <View style={[styles.roleRow, { marginTop: 6 }]}>
              <Text style={styles.roleDetailLabel}>Best Pairings: </Text>
              <Text style={styles.roleDetail}>{pairingLabels.join(', ')}</Text>
            </View>
          </View>

          {/* §6 Notes */}
          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>FIT NOTE</Text>
            <TextInput
              style={styles.noteInput}
              value={fitNote}
              onChangeText={onFitNoteChange}
              placeholder="Add fit-specific note for this system\u2026"
              placeholderTextColor="#4A4D55"
              multiline
            />
          </View>

          <View style={styles.noteBox}>
            <Text style={styles.noteLabel}>COACH NOTE</Text>
            <TextInput
              style={styles.noteInput}
              value={coachNote}
              onChangeText={onCoachNoteChange}
              placeholder="Add universal coach note\u2026"
              placeholderTextColor="#4A4D55"
              multiline
            />
          </View>

          {/* Season stats */}
          {seasons.map((season) => (
            <View key={season.season} style={styles.seasonCard}>
              <Text style={styles.seasonLabel}>{season.season} Stats</Text>
              <View style={styles.seasonRow}>
                {[
                  { v: season.ppg, l: 'PPG' },
                  { v: season.rpg, l: 'RPG' },
                  { v: season.apg, l: 'APG' },
                  { v: `${season.fgPct}%`, l: 'FG%' },
                  ...(season.threePct > 0 ? [{ v: `${season.threePct}%`, l: '3P%' }] : []),
                ].map((s) => (
                  <View key={s.l} style={{ alignItems: 'center' }}>
                    <Text style={styles.seasonValue}>{s.v}</Text>
                    <Text style={styles.seasonSublabel}>{s.l}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.seasonMeta}>{season.gp} GP {'\u00B7'} {season.mpg} MPG {'\u00B7'} {season.school}</Text>
            </View>
          ))}
        </View>
      )}

      {/* §7 Clusters tab */}
      {activeTab === 'clusters' && clusters && (
        <View style={styles.clusterContent}>
          {ALL_CLUSTER_KEYS.map((key) => (
            <ClusterBar
              key={key}
              clusterKey={key}
              value={clusters[key]}
              playerId={player.id}
              expanded={expandedClusters.has(key)}
              onToggle={() => toggleCluster(key)}
            />
          ))}

          {/* Coach note visible on clusters tab too */}
          <View style={[styles.noteBox, { marginTop: 16 }]}>
            <Text style={styles.noteLabel}>COACH NOTE</Text>
            <TextInput
              style={styles.noteInput}
              value={coachNote}
              onChangeText={onCoachNoteChange}
              placeholder="Add universal coach note\u2026"
              placeholderTextColor="#4A4D55"
              multiline
            />
          </View>
        </View>
      )}

      {activeTab === 'clusters' && !clusters && (
        <Text style={styles.reasonText}>No cluster data available.</Text>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  headerArchetype: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8A8F98',
  },
  headerIdentity: {
    fontSize: 12,
    color: GRAY,
    marginTop: 4,
    lineHeight: 16,
  },

  headerBadges: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  headerBadge: {
    backgroundColor: '#2A2D35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  headerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#f5f5f5',
    letterSpacing: 0.3,
  },

  // Rating row
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 6,
  },
  krBlock: {
    alignItems: 'center',
  },
  krLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
  },
  krNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#f5f5f5',
  },
  deltaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  deltaText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Off/Def compact row
  offDefRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 10,
    gap: 10,
  },
  offDefText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ccc',
  },
  offDefDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#3A3D45',
  },

  // System selectors
  systemRow: {
    paddingBottom: 6,
  },
  systemScroll: {
    paddingHorizontal: Spacing.lg,
    gap: 6,
    alignItems: 'center',
  },
  systemLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  systemPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#2a2a2a',
  },
  systemPillActive: {
    backgroundColor: '#f5f5f5',
  },
  systemPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  systemPillTextActive: {
    color: '#111',
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  tabPill: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#2a2a2a',
  },
  tabPillActive: {
    backgroundColor: '#f5f5f5',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6e6e6e',
  },
  tabTextActive: {
    color: '#111',
  },

  // Fit tab
  fitContent: {
    paddingBottom: 40,
  },
  reasonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  reasonBullet: {
    fontSize: 14,
    color: '#6e6e6e',
    lineHeight: 18,
  },
  reasonText: {
    fontSize: 13,
    color: '#ccc',
    flex: 1,
    lineHeight: 18,
  },

  // Role block
  roleBox: {
    marginTop: 14,
    padding: Spacing.sm,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
  },
  roleLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  roleValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  roleDetail: {
    fontSize: 12,
    color: '#ccc',
    lineHeight: 16,
  },
  roleDetailLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },

  // Notes
  noteBox: {
    marginTop: 12,
    padding: Spacing.sm,
    backgroundColor: '#1a1a1a',
    borderRadius: BorderRadius.md,
  },
  noteLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#6e6e6e',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  noteInput: {
    fontSize: 13,
    color: '#f5f5f5',
    minHeight: 36,
    lineHeight: 18,
    padding: 0,
  },

  // Season stats
  seasonCard: {
    backgroundColor: BG,
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  seasonLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  seasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  seasonValue: {
    fontSize: 18,
    fontWeight: '700',
    color: WHITE,
  },
  seasonSublabel: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
    marginTop: 2,
  },
  seasonMeta: {
    fontSize: 12,
    color: GRAY,
    textAlign: 'center',
  },

  // Clusters tab
  clusterContent: {
    paddingTop: 4,
    paddingBottom: 40,
  },
});
