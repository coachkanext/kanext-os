/**
 * Sports Game Plan V2 — Full Game Plan OS
 * Pill tabs: Overview, Offense, Defense, Matchups, Rotation, Scout, Staff
 */

import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  GAME_PLAN_HEADER,
  OFFENSIVE_PLAN,
  DEFENSIVE_PLAN,
  KEY_MATCHUPS,
  ROTATION_PLAN,
  SCOUT_NOTES,
  STAFF_ASSIGNMENTS,
  type GamePlanHeader,
  type KeyMatchup,
  type RotationSlot,
  type ScoutNote,
  type StaffAssignment,
} from '@/data/mock-game-plan-v2';

const PILLS = ['Overview', 'Offense', 'Defense', 'Matchups', 'Rotation', 'Scout', 'Staff'] as const;
type PillTab = (typeof PILLS)[number];

const STATUS_COLORS: Record<string, string> = {
  draft: '#8F8F8F',
  'in-review': '#F59E0B',
  locked: '#22C55E',
  archived: '#424242',
};

export function SportsGamePlanV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = ModeColors.sports.primary;
  const [activeTab, setActiveTab] = useState<PillTab>('Overview');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable key={pill} style={[styles.pill, activeTab === pill && { backgroundColor: accent }]} onPress={() => setActiveTab(pill)}>
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#fff' : colors.textSecondary }]}>{pill}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === 'Overview' && <OverviewView colors={colors} accent={accent} />}
      {activeTab === 'Offense' && <OffenseView colors={colors} accent={accent} />}
      {activeTab === 'Defense' && <DefenseView colors={colors} accent={accent} />}
      {activeTab === 'Matchups' && <MatchupsView colors={colors} accent={accent} />}
      {activeTab === 'Rotation' && <RotationView colors={colors} accent={accent} />}
      {activeTab === 'Scout' && <ScoutView colors={colors} accent={accent} />}
      {activeTab === 'Staff' && <StaffView colors={colors} accent={accent} />}
    </View>
  );
}

function OverviewView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const h = GAME_PLAN_HEADER;
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.headerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.headerRow}>
          <ThemedText style={[styles.opponent, { color: colors.text }]}>vs {h.opponent}</ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[h.status] + '22' }]}>
            <ThemedText style={[styles.statusText, { color: STATUS_COLORS[h.status] }]}>{h.status.toUpperCase()}</ThemedText>
          </View>
        </View>
        <ThemedText style={[styles.dateLine, { color: colors.textSecondary }]}>{h.date} · {h.location}</ThemedText>
        <ThemedText style={[styles.versionLine, { color: colors.textSecondary }]}>v{h.version} · Last edited by {h.lastEditedBy} · {h.lastEditedAt}</ThemedText>

        <View style={styles.simRow}>
          <SimChip label="Win%" value={`${h.simWinPct}%`} color="#22C55E" colors={colors} />
          <SimChip label="Margin" value={`+${h.simMargin}`} color={accent} colors={colors} />
          <SimChip label="Confidence" value={`${h.simConfidence}%`} color="#F59E0B" colors={colors} />
        </View>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>SYSTEMS</ThemedText>
      <View style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SystemRow label="Offense" value={OFFENSIVE_PLAN.primarySystem} status={OFFENSIVE_PLAN.primaryStatus} colors={colors} />
        <SystemRow label="Defense" value={DEFENSIVE_PLAN.primarySystem} status={DEFENSIVE_PLAN.primaryStatus} colors={colors} />
        <SystemRow label="Tempo" value={OFFENSIVE_PLAN.tempoTarget} status="confirmed" colors={colors} />
        <SystemRow label="Pace Target" value={`${OFFENSIVE_PLAN.paceTarget} poss/game`} status="confirmed" colors={colors} />
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>KEY MATCHUPS</ThemedText>
      {KEY_MATCHUPS.slice(0, 3).map((m) => (
        <MatchupCard key={m.id} matchup={m} colors={colors} accent={accent} />
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function OffenseView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.systemLabel, { color: colors.textSecondary }]}>Primary System</ThemedText>
        <ThemedText style={[styles.systemValue, { color: colors.text }]}>{OFFENSIVE_PLAN.primarySystem}</ThemedText>
        <ThemedText style={[styles.systemLabel, { color: colors.textSecondary, marginTop: 8 }]}>Tempo: {OFFENSIVE_PLAN.tempoTarget} · Pace: {OFFENSIVE_PLAN.paceTarget}</ThemedText>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>EMPHASIS PLAYS</ThemedText>
      {OFFENSIVE_PLAN.emphasisPlays.map((play) => (
        <View key={play.id} style={[styles.playCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.playHeader}>
            <ThemedText style={[styles.playName, { color: colors.text }]}>{play.name}</ThemedText>
            <View style={[styles.priorityBadge, { backgroundColor: play.priority === 'primary' ? accent + '22' : play.priority === 'secondary' ? '#F59E0B22' : '#8F8F8F22' }]}>
              <ThemedText style={[styles.priorityText, { color: play.priority === 'primary' ? accent : play.priority === 'secondary' ? '#F59E0B' : '#8F8F8F' }]}>{play.priority}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.playNotes, { color: colors.textSecondary }]}>{play.notes}</ThemedText>
        </View>
      ))}

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>ADJUSTMENTS</ThemedText>
      {OFFENSIVE_PLAN.adjustments.map((adj, i) => (
        <View key={i} style={[styles.adjRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="arrow.turn.down.right" size={14} color={accent} />
          <ThemedText style={[styles.adjText, { color: colors.text }]}>{adj}</ThemedText>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function DefenseView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={[styles.systemCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.systemLabel, { color: colors.textSecondary }]}>Primary System</ThemedText>
        <ThemedText style={[styles.systemValue, { color: colors.text }]}>{DEFENSIVE_PLAN.primarySystem}</ThemedText>
        <View style={styles.defDetails}>
          <ThemedText style={[styles.defDetail, { color: colors.textSecondary }]}>PnR: {DEFENSIVE_PLAN.pnrCoverage}</ThemedText>
          <ThemedText style={[styles.defDetail, { color: colors.textSecondary }]}>Post: {DEFENSIVE_PLAN.postDefense}</ThemedText>
          <ThemedText style={[styles.defDetail, { color: colors.textSecondary }]}>Transition: {DEFENSIVE_PLAN.transitionScheme}</ThemedText>
        </View>
      </View>

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>EMPHASIS RULES</ThemedText>
      {DEFENSIVE_PLAN.emphasisRules.map((rule) => (
        <View key={rule.id} style={[styles.playCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.playHeader}>
            <ThemedText style={[styles.playName, { color: colors.text, flex: 1 }]}>{rule.rule}</ThemedText>
            <View style={[styles.priorityBadge, { backgroundColor: rule.priority === 'must' ? '#EF444422' : rule.priority === 'should' ? '#F59E0B22' : '#8F8F8F22' }]}>
              <ThemedText style={[styles.priorityText, { color: rule.priority === 'must' ? '#EF4444' : rule.priority === 'should' ? '#F59E0B' : '#8F8F8F' }]}>{rule.priority}</ThemedText>
            </View>
          </View>
        </View>
      ))}

      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>ADJUSTMENTS</ThemedText>
      {DEFENSIVE_PLAN.adjustments.map((adj, i) => (
        <View key={i} style={[styles.adjRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="arrow.turn.down.right" size={14} color={accent} />
          <ThemedText style={[styles.adjText, { color: colors.text }]}>{adj}</ThemedText>
        </View>
      ))}

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function MatchupsView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {KEY_MATCHUPS.map((m) => (
        <MatchupCard key={m.id} matchup={m} colors={colors} accent={accent} />
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function RotationView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {(['1H', '2H'] as const).map((period) => (
        <View key={period}>
          <ThemedText style={[styles.sectionTitle, { color: accent }]}>{period === '1H' ? 'FIRST HALF' : 'SECOND HALF'}</ThemedText>
          {ROTATION_PLAN.filter((s) => s.period === period).map((slot, i) => (
            <View key={i} style={[styles.rotationCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.rotationHeader}>
                <ThemedText style={[styles.rotationTime, { color: accent }]}>{slot.startMin}:00 – {slot.endMin}:00</ThemedText>
              </View>
              <View style={styles.lineupRow}>
                {slot.lineup.map((name, j) => (
                  <View key={j} style={[styles.lineupChip, { backgroundColor: colors.background }]}>
                    <ThemedText style={[styles.lineupName, { color: colors.text }]}>{name}</ThemedText>
                  </View>
                ))}
              </View>
              {slot.notes && <ThemedText style={[styles.rotationNotes, { color: colors.textSecondary }]}>{slot.notes}</ThemedText>}
            </View>
          ))}
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function ScoutView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  const catColors: Record<string, string> = { tendency: '#F59E0B', weakness: '#EF4444', strength: '#22C55E', 'key-player': accent, situational: '#8B5CF6' };
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {SCOUT_NOTES.map((note) => (
        <View key={note.id} style={[styles.scoutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.scoutHeader}>
            <View style={[styles.catBadge, { backgroundColor: (catColors[note.category] ?? '#8F8F8F') + '22' }]}>
              <ThemedText style={[styles.catText, { color: catColors[note.category] ?? '#8F8F8F' }]}>{note.category}</ThemedText>
            </View>
            <View style={[styles.confBadge, { backgroundColor: note.confidence === 'high' ? '#22C55E22' : note.confidence === 'medium' ? '#F59E0B22' : '#EF444422' }]}>
              <ThemedText style={[styles.confText, { color: note.confidence === 'high' ? '#22C55E' : note.confidence === 'medium' ? '#F59E0B' : '#EF4444' }]}>{note.confidence}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.scoutTitle, { color: colors.text }]}>{note.title}</ThemedText>
          <ThemedText style={[styles.scoutDetail, { color: colors.textSecondary }]}>{note.detail}</ThemedText>
          <ThemedText style={[styles.scoutSource, { color: colors.textSecondary }]}>Source: {note.source}</ThemedText>
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function StaffView({ colors, accent }: { colors: typeof Colors.light; accent: string }) {
  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {STAFF_ASSIGNMENTS.map((staff) => (
        <View key={staff.id} style={[styles.staffCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.staffHeader}>
            <ThemedText style={[styles.staffName, { color: colors.text }]}>{staff.staffName}</ThemedText>
            <View style={[styles.roleBadge, { backgroundColor: accent + '22' }]}>
              <ThemedText style={[styles.roleText, { color: accent }]}>{staff.role}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.staffResp, { color: colors.textSecondary }]}>{staff.responsibility}</ThemedText>
          {staff.pregameTask && (
            <View style={styles.taskRow}>
              <ThemedText style={[styles.taskLabel, { color: colors.textSecondary }]}>Pregame:</ThemedText>
              <ThemedText style={[styles.taskValue, { color: colors.text }]}>{staff.pregameTask}</ThemedText>
            </View>
          )}
          {staff.inGameTask && (
            <View style={styles.taskRow}>
              <ThemedText style={[styles.taskLabel, { color: colors.textSecondary }]}>In-Game:</ThemedText>
              <ThemedText style={[styles.taskValue, { color: colors.text }]}>{staff.inGameTask}</ThemedText>
            </View>
          )}
        </View>
      ))}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

// Sub-components
function SimChip({ label, value, color, colors }: { label: string; value: string; color: string; colors: typeof Colors.light }) {
  return (
    <View style={[styles.simChip, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.simChipValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.simChipLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function SystemRow({ label, value, status, colors }: { label: string; value: string; status: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.systemRow}>
      <ThemedText style={[styles.systemLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[styles.systemValue, { color: colors.text, flex: 1 }]}>{value}</ThemedText>
      <View style={[styles.statusDot, { backgroundColor: status === 'confirmed' ? '#22C55E' : status === 'provisional' ? '#F59E0B' : '#8F8F8F' }]} />
    </View>
  );
}

function MatchupCard({ matchup, colors, accent }: { matchup: KeyMatchup; colors: typeof Colors.light; accent: string }) {
  const advColor = matchup.advantageRating > 0 ? '#22C55E' : matchup.advantageRating < 0 ? '#EF4444' : '#F59E0B';
  const advLabel = matchup.advantageRating > 0 ? `+${matchup.advantageRating}` : `${matchup.advantageRating}`;
  return (
    <View style={[styles.matchupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.matchupHeader}>
        <ThemedText style={[styles.matchupPlayers, { color: colors.text }]}>{matchup.ourPlayer} vs {matchup.theirPlayer}</ThemedText>
        <View style={[styles.advBadge, { backgroundColor: advColor + '22' }]}>
          <ThemedText style={[styles.advText, { color: advColor }]}>{advLabel}</ThemedText>
        </View>
      </View>
      <View style={[styles.typeBadge, { backgroundColor: accent + '18' }]}>
        <ThemedText style={[styles.typeText, { color: accent }]}>{matchup.matchupType}</ThemedText>
      </View>
      <ThemedText style={[styles.matchupNotes, { color: colors.textSecondary }]}>{matchup.notes}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  pillBar: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },

  headerCard: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  opponent: { fontSize: 20, fontWeight: '800' },
  dateLine: { fontSize: 12, marginTop: 4 },
  versionLine: { fontSize: 10, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },

  simRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  simChip: { flex: 1, alignItems: 'center', padding: 10, borderRadius: 8 },
  simChipValue: { fontSize: 18, fontWeight: '800' },
  simChipLabel: { fontSize: 9, fontWeight: '600', textTransform: 'uppercase', marginTop: 2 },

  sectionTitle: { fontSize: 13, fontWeight: '700', marginTop: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },

  systemCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  systemRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 6 },
  systemLabel: { fontSize: 11, fontWeight: '600', width: 70 },
  systemValue: { fontSize: 14, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },

  playCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  playHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  playName: { fontSize: 14, fontWeight: '700' },
  playNotes: { fontSize: 12, marginTop: 6, lineHeight: 18 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  adjRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 6 },
  adjText: { fontSize: 13, flex: 1, lineHeight: 19 },

  defDetails: { marginTop: 8, gap: 4 },
  defDetail: { fontSize: 12 },

  matchupCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  matchupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  matchupPlayers: { fontSize: 14, fontWeight: '700' },
  advBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  advText: { fontSize: 12, fontWeight: '700' },
  typeBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  typeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  matchupNotes: { fontSize: 12, marginTop: 6, lineHeight: 18 },

  rotationCard: { padding: 12, borderRadius: 10, borderWidth: 1, marginBottom: 8 },
  rotationHeader: { marginBottom: 8 },
  rotationTime: { fontSize: 14, fontWeight: '700' },
  lineupRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  lineupChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  lineupName: { fontSize: 12, fontWeight: '600' },
  rotationNotes: { fontSize: 11, marginTop: 8 },

  scoutCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  scoutHeader: { flexDirection: 'row', gap: 8, marginBottom: 6 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  catText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  confBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  confText: { fontSize: 10, fontWeight: '600' },
  scoutTitle: { fontSize: 15, fontWeight: '700' },
  scoutDetail: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  scoutSource: { fontSize: 10, marginTop: 6 },

  staffCard: { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  staffHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  staffName: { fontSize: 15, fontWeight: '700' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  roleText: { fontSize: 10, fontWeight: '700' },
  staffResp: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  taskRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  taskLabel: { fontSize: 11, fontWeight: '600' },
  taskValue: { fontSize: 12, flex: 1 },
});
