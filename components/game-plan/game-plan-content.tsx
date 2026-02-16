/**
 * Game Plan Content — Pregame scout packet hub tab.
 * Shows opponent scouting data, cluster matchups, keys to game, and model notes.
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AskNexusCTA } from '@/components/ui/ask-nexus-cta';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  FMU_NEXT_GAME,
  FMU_NEXT_GAME_ID,
  FMU_PREGAME,
  FMU_SCOUTING_NOTES,
  FMU_KEYS_TO_GAME,
  FMU_GAMES_BY_ID,
  ROSTER_KR,
  type PregameSnapshot,
  type ClusterRating,
} from '@/data/fmu';

const ACCENT_GOLD = '#FFFFFF';

// Compute team-level KR from roster KRs
const TEAM_KR = Math.round(
  Object.values(ROSTER_KR).reduce((sum, v) => sum + v, 0) / Math.max(Object.values(ROSTER_KR).length, 1)
);

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

function ExpectationBadge({ snapshot, colors }: { snapshot: PregameSnapshot; colors: typeof Colors.light }) {
  const badgeColor =
    snapshot.expectation === 'FAVORED' ? Brand.success :
    snapshot.expectation === 'UNDERDOG' ? Brand.error : ACCENT_GOLD;

  const krGapText = snapshot.krGap > 0
    ? `+${snapshot.krGap} KR edge`
    : snapshot.krGap < 0
    ? `${snapshot.krGap} KR deficit`
    : 'Even KR';

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.expectationRow}>
        <View style={[styles.expectationBadge, { backgroundColor: badgeColor + '20' }]}>
          <ThemedText style={[styles.expectationText, { color: badgeColor }]}>
            {snapshot.expectation}
          </ThemedText>
        </View>
        <ThemedText style={[styles.krGapText, { color: colors.textSecondary }]}>
          LU {TEAM_KR} vs OPP {snapshot.oppKR} • {krGapText}
        </ThemedText>
      </View>
    </View>
  );
}

const OUR_CLUSTER_RATINGS: Record<string, number> = {
  'Shooting': 72, 'Finishing': 68, 'Playmaking': 70,
  'OB Defense': 65, 'Team Defense': 67, 'Rebounding': 63, 'Physical': 71,
};

function ClusterMatchupGrid({ snapshot, colors }: { snapshot: PregameSnapshot; colors: typeof Colors.light }) {
  const [expandedCluster, setExpandedCluster] = useState<string | null>(null);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {snapshot.clusterRatings.map((cr) => {
        const ourRating = OUR_CLUSTER_RATINGS[cr.cluster] ?? 70;
        const delta = ourRating - cr.rating;
        const deltaColor = delta > 0 ? Brand.success : delta < 0 ? Brand.error : colors.textSecondary;
        const isExpanded = expandedCluster === cr.cluster;

        return (
          <View key={cr.cluster}>
            <Pressable
              style={styles.clusterRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setExpandedCluster(isExpanded ? null : cr.cluster);
              }}
            >
              <ThemedText style={[styles.clusterName, { flex: 1 }]}>{cr.cluster}</ThemedText>
              <ThemedText style={[styles.clusterRating, { color: Brand.precision }]}>{ourRating}</ThemedText>
              <ThemedText style={[styles.clusterVs, { color: colors.textTertiary }]}>vs</ThemedText>
              <ThemedText style={[styles.clusterRating, { color: colors.textSecondary }]}>{cr.rating}</ThemedText>
              <View style={[styles.deltaBadge, { backgroundColor: deltaColor + '20' }]}>
                <ThemedText style={[styles.deltaText, { color: deltaColor }]}>
                  {delta > 0 ? '+' : ''}{delta}
                </ThemedText>
              </View>
              <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={12} color={colors.textTertiary} />
            </Pressable>
            {isExpanded && cr.subclusters && (
              <View style={styles.subclusterWrap}>
                {cr.subclusters.map((sc) => (
                  <View key={sc.name} style={styles.subclusterRow}>
                    <ThemedText style={[styles.subclusterName, { color: colors.textTertiary }]}>{sc.name}</ThemedText>
                    <ThemedText style={[styles.subclusterRating, { color: colors.textSecondary }]}>{sc.rating}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

function BulletList({ items, colors, accent }: { items: string[]; colors: typeof Colors.light; accent?: string }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {items.map((item, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={[styles.bulletDot, { backgroundColor: accent || colors.textSecondary }]} />
          <ThemedText style={[styles.bulletText, { color: colors.text }]}>{item}</ThemedText>
        </View>
      ))}
    </View>
  );
}

function PlayerCards({
  players,
  colors,
  type,
}: {
  players: { name: string; position: string; note: string }[];
  colors: typeof Colors.light;
  type: 'swing' | 'threat';
}) {
  const accent = type === 'threat' ? Brand.error : ACCENT_GOLD;
  return (
    <View style={styles.playerCardsWrap}>
      {players.map((p, i) => (
        <View key={i} style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.playerCardHeader}>
            <ThemedText style={styles.playerCardName}>{p.name}</ThemedText>
            <ThemedText style={[styles.playerCardPos, { color: accent }]}>{p.position}</ThemedText>
          </View>
          <ThemedText style={[styles.playerCardNote, { color: colors.textSecondary }]}>{p.note}</ThemedText>
        </View>
      ))}
    </View>
  );
}

function AssignmentsTable({
  assignments,
  colors,
}: {
  assignments: { player: string; title: string; constraint: string }[];
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.assignmentHeader, { borderBottomColor: colors.border }]}>
        <ThemedText style={[styles.assignmentHeaderText, { color: colors.textTertiary, flex: 1 }]}>PLAYER</ThemedText>
        <ThemedText style={[styles.assignmentHeaderText, { color: colors.textTertiary, flex: 1 }]}>TITLE</ThemedText>
        <ThemedText style={[styles.assignmentHeaderText, { color: colors.textTertiary, flex: 1.5 }]}>CONSTRAINT</ThemedText>
      </View>
      {assignments.map((a, i) => (
        <View key={i} style={styles.assignmentRow}>
          <ThemedText style={[styles.assignmentCell, { flex: 1 }]}>{a.player}</ThemedText>
          <ThemedText style={[styles.assignmentCell, { flex: 1, color: colors.textSecondary }]}>{a.title}</ThemedText>
          <ThemedText style={[styles.assignmentCell, { flex: 1.5, color: colors.textTertiary, fontSize: 12 }]}>{a.constraint}</ThemedText>
        </View>
      ))}
    </View>
  );
}

export function GamePlanContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [notesExpanded, setNotesExpanded] = useState(false);

  // Determine next game opponent
  const nextGame = FMU_NEXT_GAME_ID ? FMU_GAMES_BY_ID[FMU_NEXT_GAME_ID] : null;
  const opponent = nextGame?.opponent;
  const snapshot = opponent ? FMU_PREGAME[opponent] : null;
  const scoutingNotes = opponent ? FMU_SCOUTING_NOTES[opponent] : null;
  const keysToGame = opponent ? FMU_KEYS_TO_GAME[opponent] : null;

  if (!nextGame || !snapshot || !opponent) {
    return (
      <View style={styles.emptyState}>
        <IconSymbol name="sportscourt.fill" size={48} color={colors.textTertiary} />
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No upcoming game
        </ThemedText>
      </View>
    );
  }

  const gameDate = nextGame.date ?? '';
  const location = nextGame.location ?? 'TBD';

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Game Header Card */}
      <View style={[styles.card, styles.gameHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.oppLogo, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[styles.oppLogoText, { color: colors.textSecondary }]}>
            {opponent.charAt(0)}
          </ThemedText>
        </View>
        <View style={styles.gameHeaderInfo}>
          <ThemedText style={styles.oppName}>vs {opponent}</ThemedText>
          <ThemedText style={[styles.gameMeta, { color: colors.textSecondary }]}>
            {gameDate}
          </ThemedText>
          <View style={[styles.locationBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="mappin" size={12} color={colors.textTertiary} />
            <ThemedText style={[styles.locationText, { color: colors.textTertiary }]}>{location}</ThemedText>
          </View>
        </View>
      </View>

      {/* Expectation */}
      <SectionLabel title="GAME EXPECTATION" colors={colors} />
      <ExpectationBadge snapshot={snapshot} colors={colors} />

      {/* Cluster Matchup Grid */}
      <SectionLabel title="CLUSTER MATCHUP" colors={colors} />
      <ClusterMatchupGrid snapshot={snapshot} colors={colors} />

      {/* Their DNA */}
      {snapshot.theirDNA.length > 0 && (
        <>
          <SectionLabel title="THEIR DNA" colors={colors} />
          <BulletList items={snapshot.theirDNA} colors={colors} accent={Brand.error} />
        </>
      )}

      {/* Our Edge */}
      {snapshot.ourEdge.length > 0 && (
        <>
          <SectionLabel title="OUR EDGE" colors={colors} />
          <BulletList items={snapshot.ourEdge} colors={colors} accent={Brand.success} />
        </>
      )}

      {/* Swing Players */}
      {snapshot.swingPlayers.length > 0 && (
        <>
          <SectionLabel title="SWING PLAYERS" colors={colors} />
          <PlayerCards
            players={snapshot.swingPlayers.map((sp) => ({ name: sp.name, position: sp.archetype, note: sp.ifHeHits }))}
            colors={colors}
            type="swing"
          />
        </>
      )}

      {/* Opponent Threats */}
      {snapshot.oppThreats.length > 0 && (
        <>
          <SectionLabel title="OPPONENT THREATS" colors={colors} />
          <PlayerCards
            players={snapshot.oppThreats.map((ot) => ({ name: ot.name, position: ot.archetype, note: ot.rule }))}
            colors={colors}
            type="threat"
          />
        </>
      )}

      {/* Assignments */}
      {snapshot.assignments.length > 0 && (
        <>
          <SectionLabel title="MATCHUP ASSIGNMENTS" colors={colors} />
          <AssignmentsTable assignments={snapshot.assignments} colors={colors} />
        </>
      )}

      {/* Keys to Game */}
      {keysToGame && (
        <>
          <SectionLabel title="KEYS TO GAME" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {keysToGame.map((key, i) => (
              <View key={i} style={styles.keyRow}>
                <View style={[styles.keyNumber, { backgroundColor: ACCENT_GOLD + '20' }]}>
                  <ThemedText style={[styles.keyNumberText, { color: ACCENT_GOLD }]}>{i + 1}</ThemedText>
                </View>
                <ThemedText style={styles.keyText}>{key}</ThemedText>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Scouting Notes */}
      {scoutingNotes && scoutingNotes.length > 0 && (
        <>
          <SectionLabel title="SCOUTING NOTES" colors={colors} />
          <Pressable
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setNotesExpanded(!notesExpanded);
            }}
          >
            <View style={styles.expandHeader}>
              <ThemedText style={styles.expandTitle}>
                {scoutingNotes.length} Notes
              </ThemedText>
              <IconSymbol name={notesExpanded ? 'chevron.down' : 'chevron.right'} size={14} color={colors.textTertiary} />
            </View>
            {notesExpanded && scoutingNotes.map((note, i) => (
              <View key={i} style={styles.bulletRow}>
                <View style={[styles.bulletDot, { backgroundColor: colors.textTertiary }]} />
                <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>{note}</ThemedText>
              </View>
            ))}
          </Pressable>
        </>
      )}

      {/* Model Notes */}
      <SectionLabel title="NEXUS MODEL NOTES" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.modelRow}>
          <ThemedText style={[styles.modelLabel, { color: Brand.precision }]}>Upset Path</ThemedText>
          <ThemedText style={[styles.modelValue, { color: colors.text }]}>{snapshot.modelNotes.upsetPath}</ThemedText>
        </View>
        <View style={[styles.modelDivider, { backgroundColor: colors.border }]} />
        <View style={styles.modelRow}>
          <ThemedText style={[styles.modelLabel, { color: Brand.error }]}>Risk</ThemedText>
          <ThemedText style={[styles.modelValue, { color: colors.text }]}>{snapshot.modelNotes.risk}</ThemedText>
        </View>
      </View>

      {/* Ask Nexus CTA */}
      <AskNexusCTA label="Ask Nexus About This Game" engineContext="scouting" />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md, paddingBottom: 40 },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  // Card base
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },

  // Game Header
  gameHeader: { flexDirection: 'row', alignItems: 'center' },
  oppLogo: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  oppLogoText: { fontSize: 22, fontWeight: '700' },
  gameHeaderInfo: { flex: 1 },
  oppName: { fontSize: 18, fontWeight: '700' },
  gameMeta: { fontSize: 13, marginTop: 2 },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginTop: 6,
    gap: 4,
  },
  locationText: { fontSize: 11, fontWeight: '500' },

  // Expectation
  expectationRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  expectationBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: BorderRadius.sm },
  expectationText: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  krGapText: { fontSize: 13 },

  // Cluster Grid
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
  },
  clusterName: { fontSize: 14, fontWeight: '600' },
  clusterRating: { fontSize: 14, fontWeight: '700', width: 28, textAlign: 'center' },
  clusterVs: { fontSize: 11 },
  deltaBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, minWidth: 36, alignItems: 'center' },
  deltaText: { fontSize: 12, fontWeight: '700' },
  subclusterWrap: { paddingLeft: 20, paddingBottom: 4 },
  subclusterRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  subclusterName: { fontSize: 12 },
  subclusterRating: { fontSize: 12, fontWeight: '600' },

  // Bullet lists
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4 },
  bulletDot: { width: 5, height: 5, borderRadius: 3, marginTop: 6, marginRight: 10 },
  bulletText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Player cards
  playerCardsWrap: { gap: Spacing.sm },
  playerCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md },
  playerCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  playerCardName: { fontSize: 15, fontWeight: '600' },
  playerCardPos: { fontSize: 13, fontWeight: '700' },
  playerCardNote: { fontSize: 13, marginTop: 4, lineHeight: 18 },

  // Assignments
  assignmentHeader: { flexDirection: 'row', paddingBottom: 8, marginBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth },
  assignmentHeaderText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  assignmentRow: { flexDirection: 'row', paddingVertical: 6 },
  assignmentCell: { fontSize: 13 },

  // Keys to Game
  keyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: Spacing.sm },
  keyNumber: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  keyNumberText: { fontSize: 13, fontWeight: '800' },
  keyText: { flex: 1, fontSize: 14, lineHeight: 20 },

  // Scouting Notes
  expandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  expandTitle: { fontSize: 14, fontWeight: '600' },

  // Model Notes
  modelRow: { paddingVertical: 4 },
  modelLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  modelValue: { fontSize: 14, lineHeight: 20, marginTop: 2 },
  modelDivider: { height: StyleSheet.hairlineWidth, marginVertical: 8 },

  // Empty state
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
  emptyText: { fontSize: 16, marginTop: Spacing.md },
});
