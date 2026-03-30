/**
 * Roster Screen — Sports Mode · LU Men's Basketball
 * Tabs: Players / Depth Chart / Staff
 * Roles: Fan / Coach / Player (cycle via top-right pill)
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, Pressable, ScrollView, TextInput,
  StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol }   from '@/components/ui/icon-symbol';
import { GlassView }    from '@/components/ui/glass-view';
import { BottomSheet }  from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter, hideFooter, showFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import {
  PLAYERS, COACHING_STAFF, TEAM_INFO,
  DEVELOPMENT_PRIORITIES,
  getUpcomingGames, krTierColor,
  type Player, type StaffMember,
} from '@/data/mock-sports-hub';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H  = 52;
const PILL_ROW_H = 48;
const NAVY       = '#990000';

type RosterTab   = 'Players' | 'Depth Chart' | 'Staff';
type RosterRole  = 'Fan' | 'Coach' | 'Player';
type PosFilter   = 'All' | 'PG' | 'SG' | 'SF' | 'PF' | 'C';

const ROSTER_TABS: RosterTab[]  = ['Players', 'Depth Chart', 'Staff'];
const ROLES: RosterRole[]       = ['Fan', 'Coach', 'Player'];
const POS_FILTERS: PosFilter[]  = ['All', 'PG', 'SG', 'SF', 'PF', 'C'];

const DEPTH_CHART: { pos: string; players: string[] }[] = [
  { pos: 'PG', players: ['Marcus Reed',    'Devon Carter',   'Elijah Santos']  },
  { pos: 'SG', players: ['Claude McKesey', 'Chris Plantey',  'Tyler Quinn']    },
  { pos: 'SF', players: ['Samuel Manzo',   'Nicholas Bansraj', 'Marcus Webb']  },
  { pos: 'PF', players: ['Samuel Wall',    'Jordan Blake',   'Kofi Mensah']    },
  { pos: 'C',  players: ['Paul Diomande',  'Jordan Blake',   'Andre Voss']     },
];

// Player bio snippets
const PLAYER_BIOS: Record<string, string> = {
  p01: "Marcus is the engine of the Oaklanders offense, leading the team in scoring and assists. The junior PG from the Bay Area is one of the premier PNR creators in the GAAC.",
  p02: "Claude brings length and two-way ability to the wing position. The Oakland native is a cornerstone of the Oaklanders switch-heavy defensive scheme.",
  p03: "Samuel Manzo is a versatile guard-forward who creates off the bounce and hits the three. His GAAC experience gives the Oaklanders a steady secondary ball-handler.",
  p04: "Samuel Wall is a physical forward who anchors the Oaklanders frontcourt. His mid-range game and screen-setting are crucial to the team's half-court execution.",
  p05: "Paul leads the GAAC in blocks and is the defensive anchor of the Oaklanders frontcourt. The big man from Oakland is in the running for All-GAAC honors.",
  p06: "Devon brings playmaking and pressure defense as the backup PG. His vision and pace give the Oaklanders a different look in two-guard lineups.",
  p07: "Chris is the Oaklanders' designated spot-up shooter, shooting efficiently from distance. His off-ball movement and catch-and-shoot ability stretch opposing defenses.",
  p08: "Tyler Quinn is a reliable two-way guard off the bench. His IQ and consistent three-point shooting make him a trusted rotation piece.",
  p09: "Nicholas brings switchable defense and hustle off the bench. The sophomore wing can guard one through four and provides energy on both ends.",
  p10: "Jordan is an athletic rim-running big who finishes above the rim. The sophomore is developing a face-up game to complement his interior presence.",
  p11: "Darius Osei is a freshman guard working his way into the rotation. His burst and scoring instincts project real upside at the next level.",
  p12: "Marcus Webb is an athletic wing in his freshman year who shows flashes of real upside. Developing his shot selection is his primary focus.",
  p13: "Elijah Santos is a crafty sophomore PG who provides pace and ball security. His high basketball IQ makes him a reliable option in pick-and-roll situations.",
  p14: "Kofi is a redshirting sophomore developing as a stretch four. His shooting mechanics have improved dramatically during the year away from competition.",
  p15: "Andre is recovering from an ankle injury and projecting as a high-ceiling big with shot-blocking instincts.",
};

const SCHOLARSHIP_PCT: Record<string, number> = {
  p01: 100, p02: 100, p05: 100,
  p03: 80,  p04: 80,  p07: 60,
  p06: 60,  p08: 40,  p09: 40,
  p10: 60,  p12: 40,  p14: 50,
  p15: 80,
};

// ── Helper Functions ──────────────────────────────────────────────────────────

function medicalDot(status: Player['medical']): string {
  if (status === 'available') return '#5A8A6E';
  if (status === 'limited')   return '#3B82F6';
  return '#B85C5C';
}

function eligDot(status: Player['eligibility']): string {
  if (status === 'eligible')   return '#5A8A6E';
  if (status === 'warning')    return '#3B82F6';
  return '#B85C5C';
}

function gpaColor(gpa: number): string {
  if (gpa >= 2.5) return '#5A8A6E';
  if (gpa >= 2.0) return '#3B82F6';
  return '#B85C5C';
}

function staffRoleBadgeColor(role: StaffMember['role']): string {
  if (role === 'head-coach') return NAVY;
  if (role === 'asst-coach') return '#1D9BF0';
  if (role === 'grad-asst')  return '#3B82F6';
  if (role === 'trainer')    return '#5A8A6E';
  if (role === 'strength')   return '#3B82F6';
  if (role === 'sid')        return '#8B6340';
  return '#8B6340';
}

function staffRoleLabel(role: StaffMember['role']): string {
  if (role === 'head-coach') return 'Head Coach';
  if (role === 'asst-coach') return 'Asst. Coach';
  if (role === 'grad-asst')  return 'Grad Asst.';
  if (role === 'trainer')    return 'Trainer';
  if (role === 'strength')   return 'S&C';
  if (role === 'sid')        return 'SID';
  return role;
}

// ── Sub-Components ────────────────────────────────────────────────────────────

// ── Section Header ──

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={[sh.title, { color: C.label }]}>{title}</Text>
  );
}
const sh = StyleSheet.create({
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10, marginTop: 6 },
});

// ── Player Avatar ──

function PlayerAvatar({ p, size = 44 }: { p: Player; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${p.hue},45%,35%)`,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.32, fontWeight: '700' }}>{p.initials}</Text>
    </View>
  );
}

// ── Staff Avatar ──

function StaffAvatar({ s: staff, size = 44 }: { s: StaffMember; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: `hsl(${staff.hue},40%,35%)`,
      alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Text style={{ color: '#fff', fontSize: size * 0.32, fontWeight: '700' }}>{staff.initials}</Text>
    </View>
  );
}

// ── Position Badge ──

function PosBadge({ pos }: { pos: string }) {
  return (
    <View style={[pb.badge, { backgroundColor: NAVY + '20' }]}>
      <Text style={[pb.text, { color: NAVY }]}>{pos}</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  text:  { fontSize: 11, fontWeight: '700' },
});

// ── Eligibility Badge ──

function EligBadge({ status }: { status: Player['eligibility'] }) {
  const color = eligDot(status);
  const label = status === 'eligible' ? 'Eligible' : status === 'warning' ? 'Warning' : 'Ineligible';
  return (
    <View style={[elb.badge, { backgroundColor: color + '22' }]}>
      <Text style={[elb.text, { color }]}>{label}</Text>
    </View>
  );
}
const elb = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  text:  { fontSize: 11, fontWeight: '700' },
});

// ── Stat Chip ──

function StatChip({ label, value, C }: { label: string; value: string; C: ComponentColors }) {
  return (
    <View style={[sc.chip, { backgroundColor: C.surfacePressed }]}>
      <Text style={[sc.val, { color: C.label }]}>{value}</Text>
      <Text style={[sc.lbl, { color: C.muted }]}>{label}</Text>
    </View>
  );
}
const sc = StyleSheet.create({
  chip: { alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10, minWidth: 52 },
  val:  { fontSize: 15, fontWeight: '800' },
  lbl:  { fontSize: 10, fontWeight: '500', marginTop: 1 },
});

// ── Progress Bar ──

function ProgressBar({ pct, color, C }: { pct: number; color: string; C: ComponentColors }) {
  return (
    <View style={[prg.track, { backgroundColor: C.surfacePressed }]}>
      <View style={[prg.fill, { width: `${Math.min(pct * 100, 100)}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const prg = StyleSheet.create({
  track: { height: 6, borderRadius: 3, overflow: 'hidden', flex: 1 },
  fill:  { height: 6, borderRadius: 3 },
});

// ── Player Card (Fan / Coach / Player) ────────────────────────────────────────

function PlayerCard({
  player, role, onPress, C,
}: { player: Player; role: RosterRole; onPress: () => void; C: ComponentColors }) {
  const isCoach = role === 'Coach';
  const krColor = krTierColor(player.kr.overall);

  return (
    <Pressable
      style={({ pressed }) => [
        plc.card,
        { backgroundColor: C.surface, opacity: pressed ? 0.82 : 1 },
      ]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    >
      {/* Main Row */}
      <View style={plc.mainRow}>
        {/* Jersey Number */}
        <View style={[plc.numberWrap, { backgroundColor: NAVY + '15' }]}>
          <Text style={[plc.number, { color: NAVY }]}>#{player.number}</Text>
        </View>

        {/* Avatar */}
        <PlayerAvatar p={player} />

        {/* Info */}
        <View style={plc.info}>
          <View style={plc.nameRow}>
            <Text style={[plc.name, { color: C.label }]} numberOfLines={1}>{player.name}</Text>
            {player.isRedshirt && (
              <View style={[plc.rsBadge, { backgroundColor: '#3B82F622' }]}>
                <Text style={[plc.rsText, { color: '#3B82F6' }]}>RS</Text>
              </View>
            )}
          </View>
          <View style={plc.detailRow}>
            <PosBadge pos={player.position} />
            <Text style={[plc.detail, { color: C.secondary }]}>{player.classYear}</Text>
            <Text style={[plc.detail, { color: C.muted }]}>·</Text>
            <Text style={[plc.detail, { color: C.secondary }]}>{player.heightFt}</Text>
            <Text style={[plc.detail, { color: C.muted }]}>·</Text>
            <Text style={[plc.detail, { color: C.secondary }]}>{player.weight} lbs</Text>
          </View>
          <Text style={[plc.hometown, { color: C.muted }]} numberOfLines={1}>{player.hometown}</Text>
        </View>

        {/* Right side */}
        <View style={plc.rightCol}>
          {isCoach ? (
            <>
              <View style={[plc.krBubble, { backgroundColor: krColor + '20' }]}>
                <Text style={[plc.krNum, { color: krColor }]}>{player.kr.overall.toFixed(0)}</Text>
              </View>
              <View style={plc.dotsRow}>
                <View style={[plc.dot, { backgroundColor: eligDot(player.eligibility) }]} />
                <View style={[plc.dot, { backgroundColor: medicalDot(player.medical) }]} />
              </View>
            </>
          ) : (
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          )}
        </View>
      </View>

      {/* Coach Operational Row */}
      {isCoach && (
        <View style={[plc.opRow, { borderTopColor: C.separator }]}>
          <Text style={[plc.opLabel, { color: C.muted }]}>KR</Text>
          <Text style={[plc.opVal, { color: krColor }]}>{player.kr.overall.toFixed(1)}</Text>
          <Text style={[plc.opSep, { color: C.separator }]}>|</Text>
          <Text style={[plc.opLabel, { color: C.muted }]}>Elig</Text>
          <View style={[plc.smallDot, { backgroundColor: eligDot(player.eligibility) }]} />
          <Text style={[plc.opSep, { color: C.separator }]}>|</Text>
          <Text style={[plc.opLabel, { color: C.muted }]}>Med</Text>
          <View style={[plc.smallDot, { backgroundColor: medicalDot(player.medical) }]} />
          <Text style={[plc.opSep, { color: C.separator }]}>|</Text>
          <Text style={[plc.opLabel, { color: C.muted }]}>Schol</Text>
          <Text style={[plc.opVal, { color: C.secondary }]}>{SCHOLARSHIP_PCT[player.id] ?? 0}%</Text>
        </View>
      )}
    </Pressable>
  );
}

const plc = StyleSheet.create({
  card:       { borderRadius: 14, padding: 12, marginBottom: 10 },
  mainRow:    { flexDirection: 'row', alignItems: 'center', gap: 10 },
  numberWrap: { width: 34, height: 34, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  number:     { fontSize: 13, fontWeight: '800' },
  info:       { flex: 1, gap: 3 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  name:       { fontSize: 15, fontWeight: '700', flexShrink: 1 },
  rsBadge:    { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 5 },
  rsText:     { fontSize: 10, fontWeight: '700' },
  detailRow:  { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  detail:     { fontSize: 12 },
  hometown:   { fontSize: 11 },
  rightCol:   { alignItems: 'center', gap: 6 },
  krBubble:   { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  krNum:      { fontSize: 13, fontWeight: '800' },
  dotsRow:    { flexDirection: 'row', gap: 5 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  opRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 8, borderTopWidth: StyleSheet.hairlineWidth },
  opLabel:    { fontSize: 11 },
  opVal:      { fontSize: 12, fontWeight: '700' },
  opSep:      { fontSize: 12 },
  smallDot:   { width: 7, height: 7, borderRadius: 3.5 },
});

// ── Player Detail Sheet ───────────────────────────────────────────────────────

function PlayerSheet({
  player, role, visible, onClose, C,
}: {
  player: Player | null; role: RosterRole;
  visible: boolean; onClose: () => void; C: ComponentColors;
}) {
  if (!player) return null;
  const isCoach   = role === 'Coach';
  const krColor   = krTierColor(player.kr.overall);
  const devPrios  = DEVELOPMENT_PRIORITIES.find(d => d.playerId === player.id)?.priorities ?? [];

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal backgroundColor={C.bg} title={player.name}>
      {/* Header */}
      <View style={pds.header}>
        <PlayerAvatar p={player} size={64} />
        <View style={pds.headerInfo}>
          <View style={pds.headerTopRow}>
            <View style={[pds.numBadge, { backgroundColor: NAVY + '18' }]}>
              <Text style={[pds.numText, { color: NAVY }]}>#{player.number}</Text>
            </View>
            <PosBadge pos={player.position} />
            <Text style={[pds.classText, { color: C.secondary }]}>{player.classYear}</Text>
          </View>
          <Text style={[pds.archetype, { color: C.muted }]}>{player.archetype}</Text>
          <Text style={[pds.info, { color: C.secondary }]}>{player.heightFt} · {player.weight} lbs</Text>
          <Text style={[pds.info, { color: C.muted }]}>{player.hometown}</Text>
        </View>
      </View>

      {/* Badges */}
      {player.badges.length > 0 && (
        <View style={pds.badgesRow}>
          {player.badges.map(b => (
            <View key={b} style={[pds.badge, { backgroundColor: NAVY + '12', borderColor: NAVY + '30', borderWidth: 1 }]}>
              <Text style={[pds.badgeText, { color: NAVY }]}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Season Stats */}
      <Text style={[pds.sectionLabel, { color: C.label }]}>Season Stats</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
        <View style={pds.statsRow}>
          <StatChip label="PPG"  value={player.stats.ppg.toFixed(1)}  C={C} />
          <StatChip label="RPG"  value={player.stats.rpg.toFixed(1)}  C={C} />
          <StatChip label="APG"  value={player.stats.apg.toFixed(1)}  C={C} />
          <StatChip label="FG%"  value={`${player.stats.fgPct.toFixed(1)}%`}  C={C} />
          <StatChip label="MPG"  value={player.stats.mpg.toFixed(1)}  C={C} />
          {isCoach && <StatChip label="3P%"  value={`${player.stats.fg3Pct.toFixed(1)}%`} C={C} />}
          {isCoach && <StatChip label="FT%"  value={`${player.stats.ftPct.toFixed(1)}%`}  C={C} />}
          {isCoach && <StatChip label="GP"   value={String(player.stats.gp)} C={C} />}
        </View>
      </ScrollView>

      {/* Bio */}
      <Text style={[pds.sectionLabel, { color: C.label }]}>About</Text>
      <Text style={[pds.bio, { color: C.secondary }]}>{PLAYER_BIOS[player.id] ?? ''}</Text>

      {/* Coach-only sections */}
      {isCoach && (
        <>
          {/* KaNeXT Rating */}
          <Text style={[pds.sectionLabel, { color: C.label }]}>KaNeXT Rating</Text>
          <View style={[pds.krCard, { backgroundColor: C.surface }]}>
            <View style={pds.krRow}>
              <View style={pds.krItem}>
                <Text style={[pds.krVal, { color: krColor }]}>{player.kr.overall.toFixed(1)}</Text>
                <Text style={[pds.krLbl, { color: C.muted }]}>Overall</Text>
              </View>
              <View style={[pds.krDivider, { backgroundColor: C.separator }]} />
              <View style={pds.krItem}>
                <Text style={[pds.krVal, { color: C.label }]}>{player.kr.offensive.toFixed(1)}</Text>
                <Text style={[pds.krLbl, { color: C.muted }]}>Offense</Text>
              </View>
              <View style={[pds.krDivider, { backgroundColor: C.separator }]} />
              <View style={pds.krItem}>
                <Text style={[pds.krVal, { color: C.label }]}>{player.kr.defensive.toFixed(1)}</Text>
                <Text style={[pds.krLbl, { color: C.muted }]}>Defense</Text>
              </View>
            </View>
            <View style={pds.krFooter}>
              <Text style={[pds.krTier, { color: NAVY }]}>Tier {player.kr.tier}</Text>
              <Text style={[pds.krTrend, {
                color: player.kr.trend === 'up'
                  ? '#5A8A6E'
                  : player.kr.trend === 'down'
                  ? '#B85C5C'
                  : C.muted,
              }]}>
                {player.kr.trend === 'up' ? '▲' : player.kr.trend === 'down' ? '▼' : '—'}
                {' '}{Math.abs(player.kr.delta).toFixed(1)} last 5
              </Text>
            </View>
          </View>

          {/* Academic */}
          <Text style={[pds.sectionLabel, { color: C.label }]}>Academic Status</Text>
          <View style={[pds.infoCard, { backgroundColor: C.surface }]}>
            <View style={pds.infoRow}>
              <Text style={[pds.infoKey, { color: C.muted }]}>GPA</Text>
              <Text style={[pds.infoVal, { color: gpaColor(player.gpa), fontWeight: '800' }]}>
                {player.gpa.toFixed(2)}
              </Text>
            </View>
            <View style={[pds.infoRowInner, { borderTopColor: C.separator }]}>
              <Text style={[pds.infoKey, { color: C.muted }]}>Credits</Text>
              <Text style={[pds.infoVal, { color: C.label }]}>{player.credits} / 120</Text>
            </View>
            <View style={pds.creditBarRow}>
              <ProgressBar pct={player.credits / 120} color={gpaColor(player.gpa)} C={C} />
            </View>
            <View style={[pds.infoRowInner, { borderTopColor: C.separator }]}>
              <Text style={[pds.infoKey, { color: C.muted }]}>Eligibility</Text>
              <EligBadge status={player.eligibility} />
            </View>
          </View>

          {/* Medical */}
          <Text style={[pds.sectionLabel, { color: C.label }]}>Medical Status</Text>
          <View style={[pds.infoCard, { backgroundColor: C.surface }]}>
            <View style={pds.infoRow}>
              <Text style={[pds.infoKey, { color: C.muted }]}>Status</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={[pds.statusDot, { backgroundColor: medicalDot(player.medical) }]} />
                <Text style={[pds.infoVal, { color: medicalDot(player.medical) }]}>
                  {player.medical.charAt(0).toUpperCase() + player.medical.slice(1)}
                </Text>
              </View>
            </View>
            {player.medicalNote && (
              <View style={[pds.infoRowInner, { borderTopColor: C.separator }]}>
                <Text style={[pds.infoKey, { color: C.muted }]}>Note</Text>
                <Text style={[pds.infoNote, { color: C.secondary }]}>{player.medicalNote}</Text>
              </View>
            )}
          </View>

          {/* Scholarship */}
          <Text style={[pds.sectionLabel, { color: C.label }]}>Scholarship</Text>
          <View style={[pds.infoCard, { backgroundColor: C.surface }]}>
            <View style={pds.infoRow}>
              <Text style={[pds.infoKey, { color: C.muted }]}>Allocation</Text>
              <Text style={[pds.infoVal, { color: C.label, fontWeight: '700' }]}>
                {SCHOLARSHIP_PCT[player.id] ?? 0}%
              </Text>
            </View>
          </View>

          {/* Development Priorities */}
          {devPrios.length > 0 && (
            <>
              <Text style={[pds.sectionLabel, { color: C.label }]}>Development Priorities</Text>
              <View style={[pds.infoCard, { backgroundColor: C.surface }]}>
                {devPrios.map((dp, i) => (
                  <View
                    key={dp.trait}
                    style={[
                      pds.devRow,
                      i < devPrios.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: C.separator,
                      },
                    ]}
                  >
                    <Text style={[pds.devTrait, { color: C.label }]}>{dp.trait}</Text>
                    <View style={pds.devRight}>
                      <Text style={[pds.devNums, { color: C.secondary }]}>{dp.current} → {dp.target}</Text>
                      <View style={{ width: 80 }}>
                        <ProgressBar pct={dp.current / 100} color={C.accent} C={C} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Notes */}
          <Text style={[pds.sectionLabel, { color: C.label }]}>Coaching Notes</Text>
          <View style={[pds.notesPlaceholder, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
            <Text style={[pds.notesHint, { color: C.muted }]}>No notes yet. Tap to add...</Text>
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </BottomSheet>
  );
}

const pds = StyleSheet.create({
  header:          { flexDirection: 'row', gap: 14, marginBottom: 14, paddingHorizontal: 20, alignItems: 'flex-start' },
  headerInfo:      { flex: 1, gap: 4 },
  headerTopRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  numBadge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  numText:         { fontSize: 13, fontWeight: '800' },
  classText:       { fontSize: 13 },
  archetype:       { fontSize: 13, fontStyle: 'italic' },
  info:            { fontSize: 13 },
  badgesRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14, paddingHorizontal: 20 },
  badge:           { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText:       { fontSize: 11, fontWeight: '600' },
  sectionLabel:    { fontSize: 14, fontWeight: '700', marginBottom: 8, marginTop: 6, paddingHorizontal: 20 },
  statsRow:        { flexDirection: 'row', gap: 8, paddingHorizontal: 20 },
  bio:             { fontSize: 14, lineHeight: 20, marginBottom: 14, paddingHorizontal: 20 },
  krCard:          { borderRadius: 12, marginHorizontal: 20, marginBottom: 14, padding: 14 },
  krRow:           { flexDirection: 'row', alignItems: 'center' },
  krItem:          { flex: 1, alignItems: 'center', gap: 2 },
  krVal:           { fontSize: 22, fontWeight: '800' },
  krLbl:           { fontSize: 11 },
  krDivider:       { width: 1, height: 36 },
  krFooter:        { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  krTier:          { fontSize: 12, fontWeight: '700' },
  krTrend:         { fontSize: 12, fontWeight: '600' },
  infoCard:        { borderRadius: 12, marginHorizontal: 20, marginBottom: 14, overflow: 'hidden' },
  infoRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  infoRowInner:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderTopWidth: StyleSheet.hairlineWidth },
  infoKey:         { fontSize: 13 },
  infoVal:         { fontSize: 14 },
  infoNote:        { fontSize: 13, flex: 1, textAlign: 'right' },
  creditBarRow:    { paddingHorizontal: 12, paddingBottom: 10 },
  statusDot:       { width: 8, height: 8, borderRadius: 4 },
  devRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12 },
  devTrait:        { fontSize: 13, fontWeight: '600', flex: 1 },
  devRight:        { alignItems: 'flex-end', gap: 4 },
  devNums:         { fontSize: 12 },
  notesPlaceholder:{ borderRadius: 12, marginHorizontal: 20, marginBottom: 14, padding: 16, borderWidth: 1, borderStyle: 'dashed' },
  notesHint:       { fontSize: 13, fontStyle: 'italic' },
});

// ── Staff Card ────────────────────────────────────────────────────────────────

function StaffCard({
  member, onPress, C,
}: { member: StaffMember; onPress: () => void; C: ComponentColors }) {
  const badgeColor = staffRoleBadgeColor(member.role);
  return (
    <Pressable
      style={({ pressed }) => [stc.card, { backgroundColor: C.surface, opacity: pressed ? 0.82 : 1 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
    >
      <StaffAvatar s={member} />
      <View style={stc.info}>
        <Text style={[stc.name, { color: C.label }]}>{member.name}</Text>
        <Text style={[stc.title, { color: C.secondary }]}>{member.title}</Text>
      </View>
      <View style={[stc.badge, { backgroundColor: badgeColor + '20' }]}>
        <Text style={[stc.badgeText, { color: badgeColor }]}>{staffRoleLabel(member.role)}</Text>
      </View>
    </Pressable>
  );
}

const stc = StyleSheet.create({
  card:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 14, marginBottom: 8 },
  info:      { flex: 1 },
  name:      { fontSize: 15, fontWeight: '700' },
  title:     { fontSize: 13, marginTop: 2 },
  badge:     { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});

// ── Staff Detail Sheet ────────────────────────────────────────────────────────

function StaffSheet({
  member, visible, onClose, C,
}: { member: StaffMember | null; visible: boolean; onClose: () => void; C: ComponentColors }) {
  if (!member) return null;
  const badgeColor = staffRoleBadgeColor(member.role);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal backgroundColor={C.bg} title={member.name}>
      <View style={sds.header}>
        <StaffAvatar s={member} size={64} />
        <View style={sds.info}>
          <Text style={[sds.title, { color: C.secondary }]}>{member.title}</Text>
          <View style={[sds.badge, { backgroundColor: badgeColor + '20' }]}>
            <Text style={[sds.badgeText, { color: badgeColor }]}>{staffRoleLabel(member.role)}</Text>
          </View>
        </View>
      </View>

      <Text style={[sds.sectionLabel, { color: C.label }]}>Contact</Text>
      <View style={[sds.contactCard, { backgroundColor: C.surface }]}>
        <View style={sds.contactRow}>
          <IconSymbol name="phone.fill" size={16} color={C.accent} />
          <Text style={[sds.contactText, { color: C.label }]}>{member.phone}</Text>
        </View>
        <View style={[sds.contactRowInner, { borderTopColor: C.separator }]}>
          <IconSymbol name="envelope.fill" size={16} color={C.accent} />
          <Text style={[sds.contactText, { color: C.label }]}>{member.email}</Text>
        </View>
      </View>

      <Pressable
        style={[sds.msgBtn, { backgroundColor: C.accent }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
      >
        <IconSymbol name="message.fill" size={16} color="#fff" />
        <Text style={sds.msgBtnText}>Message</Text>
      </Pressable>

      <View style={{ height: 32 }} />
    </BottomSheet>
  );
}

const sds = StyleSheet.create({
  header:          { flexDirection: 'row', gap: 14, marginBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  info:            { flex: 1, gap: 6 },
  title:           { fontSize: 14 },
  badge:           { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8 },
  badgeText:       { fontSize: 12, fontWeight: '700' },
  sectionLabel:    { fontSize: 14, fontWeight: '700', marginBottom: 8, paddingHorizontal: 20 },
  contactCard:     { borderRadius: 12, marginHorizontal: 20, marginBottom: 16, overflow: 'hidden' },
  contactRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  contactRowInner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderTopWidth: StyleSheet.hairlineWidth },
  contactText:     { fontSize: 14 },
  msgBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, padding: 14, borderRadius: 12 },
  msgBtnText:      { color: '#fff', fontSize: 15, fontWeight: '700' },
});

// ── Depth Chart ───────────────────────────────────────────────────────────────

function DepthChartSection({ C }: { C: ComponentColors }) {
  return (
    <View style={{ marginTop: 6 }}>
      <SectionHeader title="Depth Chart" C={C} />
      <GlassView tier={1} style={dc.card}>
        {DEPTH_CHART.map((row, i) => (
          <View
            key={row.pos}
            style={[
              dc.row,
              i < DEPTH_CHART.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: C.separator,
              },
            ]}
          >
            <View style={[dc.posBadge, { backgroundColor: NAVY + '18' }]}>
              <Text style={[dc.posText, { color: NAVY }]}>{row.pos}</Text>
            </View>
            <View style={dc.namesCol}>
              {row.players.map((name, idx) => (
                <View key={name} style={dc.nameRow}>
                  <Text style={[dc.rank, { color: C.muted }]}>{idx + 1}</Text>
                  <Text style={[
                    dc.playerName,
                    { color: idx === 0 ? C.label : C.secondary },
                    idx === 0 && { fontWeight: '600' },
                  ]}>{name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </GlassView>
    </View>
  );
}

const dc = StyleSheet.create({
  card:       { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  row:        { flexDirection: 'row', alignItems: 'flex-start', padding: 12, gap: 10 },
  posBadge:   { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  posText:    { fontSize: 13, fontWeight: '800' },
  namesCol:   { flex: 1, gap: 4 },
  nameRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rank:       { fontSize: 12, fontWeight: '600', width: 14, textAlign: 'center' },
  playerName: { fontSize: 14 },
});

// ── Upcoming Schedule ─────────────────────────────────────────────────────────

function UpcomingSchedule({ C }: { C: ComponentColors }) {
  const upcoming = getUpcomingGames().slice(0, 5);
  if (upcoming.length === 0) return null;

  return (
    <View style={{ marginTop: 6 }}>
      <SectionHeader title="Upcoming Games" C={C} />
      <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {upcoming.map((game, i) => (
          <View
            key={game.id}
            style={[
              ug.row,
              i < upcoming.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: C.separator,
              },
            ]}
          >
            <Text style={[ug.date, { color: C.secondary }]}>{game.date}</Text>
            <View style={[ug.locBadge, {
              backgroundColor:
                game.location === 'H' ? '#5A8A6E22' :
                game.location === 'A' ? '#B85C5C22' :
                '#3B82F622',
            }]}>
              <Text style={[ug.locText, {
                color:
                  game.location === 'H' ? '#5A8A6E' :
                  game.location === 'A' ? '#B85C5C' :
                  '#3B82F6',
              }]}>
                {game.location === 'H' ? 'HOME' : game.location === 'A' ? 'AWAY' : 'NEUT'}
              </Text>
            </View>
            <Text style={[ug.opponent, { color: C.label }]} numberOfLines={1}>{game.opponent}</Text>
            <Text style={[ug.time, { color: C.muted }]}>{game.time}</Text>
          </View>
        ))}
      </GlassView>
    </View>
  );
}

const ug = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 8 },
  date:     { fontSize: 12, width: 48, flexShrink: 0 },
  locBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, flexShrink: 0 },
  locText:  { fontSize: 10, fontWeight: '800' },
  opponent: { fontSize: 14, fontWeight: '600', flex: 1 },
  time:     { fontSize: 12 },
});

// ── Team Banner ───────────────────────────────────────────────────────────────

function TeamBanner({ C }: { C: ComponentColors }) {
  return (
    <View style={[bnr.banner, { backgroundColor: NAVY }]}>
      <View style={bnr.inner}>
        <View>
          <Text style={bnr.teamName}>LU Oaklanders Basketball</Text>
          <Text style={bnr.record}>{TEAM_INFO.record} · {TEAM_INFO.conference} · {TEAM_INFO.confStanding}</Text>
        </View>
        <View style={bnr.rightCol}>
          <View style={[bnr.confBadge, { backgroundColor: '#ffffff20' }]}>
            <Text style={bnr.confText}>{TEAM_INFO.conference}</Text>
          </View>
          <Text style={bnr.confRec}>{TEAM_INFO.conferenceRec} conf</Text>
        </View>
      </View>
    </View>
  );
}

const bnr = StyleSheet.create({
  banner:   { borderRadius: 14, padding: 16, marginBottom: 14 },
  inner:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  teamName: { color: '#fff', fontSize: 17, fontWeight: '800' },
  record:   { color: 'rgba(255,255,255,0.72)', fontSize: 13, marginTop: 3 },
  rightCol: { alignItems: 'flex-end', gap: 4 },
  confBadge:{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 7 },
  confText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  confRec:  { color: 'rgba(255,255,255,0.60)', fontSize: 12 },
});

// ── Eligibility Player Card ───────────────────────────────────────────────────

function EligPlayerCard({ player, C }: { player: Player; C: ComponentColors }) {
  const isWarning = player.eligibility === 'warning';

  return (
    <View style={[
      epc.card,
      { backgroundColor: C.surface },
      isWarning && { borderColor: '#B85C5C', borderWidth: 1.5 },
    ]}>
      {isWarning && (
        <View style={epc.warningTag}>
          <IconSymbol name="exclamationmark.triangle.fill" size={13} color="#B85C5C" />
          <Text style={epc.warningText}>Academic Advisor Alert</Text>
        </View>
      )}

      <View style={epc.mainRow}>
        <PlayerAvatar p={player} size={40} />
        <View style={epc.infoCol}>
          <Text style={[epc.name, { color: C.label }]}>{player.name}</Text>
          <View style={epc.subRow}>
            <PosBadge pos={player.position} />
            <Text style={[epc.classYear, { color: C.secondary }]}>{player.classYear}</Text>
          </View>
        </View>
        <View style={epc.rightCol}>
          <Text style={[epc.gpa, { color: gpaColor(player.gpa) }]}>{player.gpa.toFixed(2)}</Text>
          <Text style={[epc.gpaLabel, { color: C.muted }]}>GPA</Text>
        </View>
      </View>

      <View style={epc.creditsRow}>
        <Text style={[epc.creditsLabel, { color: C.muted }]}>Credits: {player.credits}/120</Text>
        <View style={{ flex: 1, marginLeft: 10 }}>
          <ProgressBar pct={player.credits / 120} color={gpaColor(player.gpa)} C={C} />
        </View>
      </View>

      <View style={epc.statusRow}>
        <EligBadge status={player.eligibility} />
      </View>
    </View>
  );
}

const epc = StyleSheet.create({
  card:         { borderRadius: 14, padding: 12, marginBottom: 10 },
  warningTag:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#B85C5C15', borderRadius: 7, paddingHorizontal: 8, paddingVertical: 4, marginBottom: 10, alignSelf: 'flex-start' },
  warningText:  { fontSize: 11, fontWeight: '700', color: '#B85C5C' },
  mainRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoCol:      { flex: 1, gap: 4 },
  name:         { fontSize: 15, fontWeight: '700' },
  subRow:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  classYear:    { fontSize: 12 },
  rightCol:     { alignItems: 'center' },
  gpa:          { fontSize: 22, fontWeight: '800' },
  gpaLabel:     { fontSize: 11 },
  creditsRow:   { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  creditsLabel: { fontSize: 12, width: 108 },
  statusRow:    { marginTop: 8 },
});

// ── Eligibility Summary Bar ───────────────────────────────────────────────────

function EligSummaryBar({ C }: { C: ComponentColors }) {
  const eligible   = PLAYERS.filter(p => p.eligibility === 'eligible').length;
  const warning    = PLAYERS.filter(p => p.eligibility === 'warning').length;
  const ineligible = PLAYERS.filter(p => p.eligibility === 'ineligible').length;

  return (
    <View style={esb.row}>
      <View style={[esb.chip, { backgroundColor: '#5A8A6E20' }]}>
        <View style={[esb.dot, { backgroundColor: '#5A8A6E' }]} />
        <Text style={[esb.count, { color: '#5A8A6E' }]}>{eligible}</Text>
        <Text style={[esb.label, { color: '#5A8A6E' }]}>eligible</Text>
      </View>
      <View style={[esb.chip, { backgroundColor: '#3B82F620' }]}>
        <View style={[esb.dot, { backgroundColor: '#3B82F6' }]} />
        <Text style={[esb.count, { color: '#3B82F6' }]}>{warning}</Text>
        <Text style={[esb.label, { color: '#3B82F6' }]}>warning</Text>
      </View>
      <View style={[esb.chip, { backgroundColor: '#B85C5C20' }]}>
        <View style={[esb.dot, { backgroundColor: '#B85C5C' }]} />
        <Text style={[esb.count, { color: '#B85C5C' }]}>{ineligible}</Text>
        <Text style={[esb.label, { color: '#B85C5C' }]}>ineligible</Text>
      </View>
    </View>
  );
}

const esb = StyleSheet.create({
  row:   { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  dot:   { width: 7, height: 7, borderRadius: 3.5 },
  count: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 12 },
});

// ── Academic Calendar ─────────────────────────────────────────────────────────

function AcademicCalendarSection({ C }: { C: ComponentColors }) {
  const events = [
    { label: 'Midterm Grades', date: 'Apr 3',  icon: 'calendar' },
    { label: 'Registration',   date: 'Apr 14', icon: 'list.bullet.clipboard' },
    { label: 'Final Grades',   date: 'May 8',  icon: 'calendar.badge.checkmark' },
  ];
  return (
    <View style={{ marginTop: 6 }}>
      <SectionHeader title="Academic Calendar" C={C} />
      <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {events.map((ev, i) => (
          <View
            key={ev.label}
            style={[
              acal.row,
              i < events.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: C.separator,
              },
            ]}
          >
            <IconSymbol name={ev.icon as any} size={16} color={C.accent} />
            <Text style={[acal.label, { color: C.label }]}>{ev.label}</Text>
            <Text style={[acal.date, { color: C.secondary }]}>{ev.date}</Text>
          </View>
        ))}
      </GlassView>
    </View>
  );
}

const acal = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  label: { flex: 1, fontSize: 14 },
  date:  { fontSize: 13, fontWeight: '600' },
});

// ── CARA Hours ────────────────────────────────────────────────────────────────

function CARASection({ C }: { C: ComponentColors }) {
  return (
    <View style={{ marginTop: 6 }}>
      <SectionHeader title="CARA Hours" C={C} />
      <GlassView tier={1} style={{ borderRadius: 14, padding: 14, marginBottom: 20 }}>
        <View style={cara.labelRow}>
          <Text style={[cara.label, { color: C.label }]}>This Week</Text>
          <Text style={[cara.sub, { color: C.muted }]}>14 of 20 hours used</Text>
          <Text style={[cara.pct, { color: C.accent }]}>70%</Text>
        </View>
        <ProgressBar pct={14 / 20} color={C.accent} C={C} />

        <View style={[cara.divider, { backgroundColor: C.separator }]} />

        <View style={cara.labelRow}>
          <Text style={[cara.label, { color: C.label }]}>This Semester</Text>
          <Text style={[cara.sub, { color: C.muted }]}>142 of 168 hours used</Text>
          <Text style={[cara.pct, { color: C.accent }]}>85%</Text>
        </View>
        <ProgressBar pct={142 / 168} color={C.accent} C={C} />
      </GlassView>
    </View>
  );
}

const cara = StyleSheet.create({
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 4 },
  label:    { fontSize: 14, fontWeight: '600', flex: 1 },
  sub:      { fontSize: 12 },
  pct:      { fontSize: 14, fontWeight: '800' },
  divider:  { height: StyleSheet.hairlineWidth, marginVertical: 12 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function RosterScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();

  // ── Navigation state ──
  const [activeTab, setActiveTab]       = useState<RosterTab>('Players');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [role, setRole]                 = useState<RosterRole>('Fan');

  // ── Filter state ──
  const [filterVisible, setFilterVisible] = useState(false);
  const [posFilter, setPosFilter]         = useState<PosFilter>('All');
  const [searchQuery, setSearchQuery]     = useState('');

  // ── Sheet state ──
  const [selectedPlayer, setSelectedPlayer]     = useState<Player | null>(null);
  const [playerSheetOpen, setPlayerSheetOpen]   = useState(false);
  const [selectedStaff, setSelectedStaff]       = useState<StaffMember | null>(null);
  const [staffSheetOpen, setStaffSheetOpen]     = useState(false);

  // ── Animation ──
  const pillsAnim   = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  // ── Layout ──
  const topBarH       = insets.top + TOP_BAR_H;
  const contentPadTop = topBarH + (filterVisible ? PILL_ROW_H : 0) + 8;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10)      hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const toggleFilter = useCallback(() => {
    setFilterVisible(prev => {
      const next = !prev;
      Animated.timing(pillsAnim, {
        toValue: next ? 1 : 0, duration: 200, useNativeDriver: false,
      }).start();
      return next;
    });
  }, [pillsAnim]);

  const handleTabSelect = useCallback((tab: RosterTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
    setDropdownOpen(false);
    setPosFilter('All');
    setSearchQuery('');
    setFilterVisible(false);
    pillsAnim.setValue(0);
  }, [pillsAnim]);

  const cycleRole = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRole(prev => {
      const idx = ROLES.indexOf(prev);
      return ROLES[(idx + 1) % ROLES.length];
    });
  }, []);

  // ── Filtered players ──
  const sortedPlayers = [...PLAYERS].sort((a, b) => a.number - b.number);
  const filteredPlayers = sortedPlayers.filter(p => {
    const posOk  = posFilter === 'All' || p.position === posFilter;
    const srchOk = searchQuery.trim() === ''
      || p.name.toLowerCase().includes(searchQuery.toLowerCase())
      || String(p.number).includes(searchQuery)
      || p.position.toLowerCase().includes(searchQuery.toLowerCase());
    return posOk && srchOk;
  });

  // ── Staff grouping ──
  const coachingStaff = COACHING_STAFF.filter(s =>
    ['head-coach', 'asst-coach', 'grad-asst'].includes(s.role)
  );
  const supportStaff = COACHING_STAFF.filter(s =>
    ['trainer', 'strength', 'sid'].includes(s.role)
  );

  // ── Role pill color ──
  const rolePillBg = (r: RosterRole) => {
    if (r === 'Coach')  return NAVY;
    if (r === 'Player') return '#5A8A6E';
    return C.accent;
  };

  // ── Render Roster Tab ──────────────────────────────────────────────────────

  const renderRosterTab = () => (
    <ScrollView
      key="roster"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: contentPadTop,
        paddingHorizontal: 16,
        paddingBottom: 120,
      }}
      keyboardShouldPersistTaps="handled"
    >
      <TeamBanner C={C} />

      {/* Search bar */}
      <View style={[rs.searchBar, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
        <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
        <TextInput
          style={[rs.searchInput, { color: C.label }]}
          placeholder="Search players..."
          placeholderTextColor={C.muted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>

      {/* Coach action row */}
      {role === 'Coach' && (
        <View style={rs.coachActions}>
          <Pressable
            style={[rs.actionBtn, { backgroundColor: NAVY }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="person.badge.plus" size={15} color="#fff" />
            <Text style={rs.actionBtnWhiteText}>Add Player</Text>
          </Pressable>
          <Pressable
            style={[rs.actionBtn, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="square.and.arrow.up" size={15} color={C.label} />
            <Text style={[rs.actionBtnText, { color: C.label }]}>Export</Text>
          </Pressable>
        </View>
      )}

      {/* Count */}
      <Text style={[rs.countText, { color: C.muted }]}>
        {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
        {posFilter !== 'All' ? ` · ${posFilter}` : ''}
      </Text>

      {/* Player list */}
      {filteredPlayers.map(player => (
        <PlayerCard
          key={player.id}
          player={player}
          role={role}
          C={C}
          onPress={() => {
            setSelectedPlayer(player);
            setPlayerSheetOpen(true);
          }}
        />
      ))}

      {filteredPlayers.length === 0 && (
        <View style={rs.emptyState}>
          <IconSymbol name="person.slash" size={36} color={C.muted} />
          <Text style={[rs.emptyText, { color: C.muted }]}>No players found</Text>
        </View>
      )}

      {/* Upcoming schedule (Fan / Player) */}
      {(role === 'Fan' || role === 'Player') && <UpcomingSchedule C={C} />}
    </ScrollView>
  );

  // ── Render Staff Tab ───────────────────────────────────────────────────────

  const renderStaffTab = () => (
    <ScrollView
      key="staff"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: contentPadTop,
        paddingHorizontal: 16,
        paddingBottom: 120,
      }}
    >
      {role === 'Coach' && (
        <Pressable
          style={[rs.actionBtn, { backgroundColor: NAVY, marginBottom: 16, alignSelf: 'flex-start' }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
        >
          <IconSymbol name="person.badge.plus" size={15} color="#fff" />
          <Text style={rs.actionBtnWhiteText}>Manage Staff</Text>
        </Pressable>
      )}

      <SectionHeader title="Coaching Staff" C={C} />
      {coachingStaff.map(member => (
        <StaffCard
          key={member.id}
          member={member}
          C={C}
          onPress={() => {
            setSelectedStaff(member);
            setStaffSheetOpen(true);
          }}
        />
      ))}

      <SectionHeader title="Support Staff" C={C} />
      {supportStaff.map(member => (
        <StaffCard
          key={member.id}
          member={member}
          C={C}
          onPress={() => {
            setSelectedStaff(member);
            setStaffSheetOpen(true);
          }}
        />
      ))}
    </ScrollView>
  );

  // ── Render Depth Chart Tab ─────────────────────────────────────────────────

  const renderDepthChartTab = () => (
    <ScrollView
      key="depth-chart"
      onScroll={handleScroll}
      scrollEventThrottle={16}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingTop: contentPadTop,
        paddingHorizontal: 16,
        paddingBottom: 120,
      }}
    >
      <DepthChartSection C={C} />
    </ScrollView>
  );

  const renderContent = () => {
    if (activeTab === 'Players')     return renderRosterTab();
    if (activeTab === 'Depth Chart') return renderDepthChartTab();
    return renderStaffTab();
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {renderContent()}

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          {/* Left: hamburger */}
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidePanel();
              }}
              hitSlop={12}
            >
              <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
            </Pressable>
          </View>

          {/* Center: dropdown pill */}
          <View style={s.dropdownWrap}>
            <Pressable
              style={[s.dropdownPill, { backgroundColor: C.surfacePressed }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDropdownOpen(v => !v);
              }}
            >
              <Text style={[s.dropdownText, { color: C.label }]}>{activeTab}</Text>
              <IconSymbol name="chevron.down" size={12} color={C.secondary} />
            </Pressable>
          </View>

          {/* Right: filter toggle + role pill */}
          <View style={[s.topBarSide, s.topBarRight]}>
            {activeTab === 'Players' && (
              <Pressable onPress={toggleFilter} hitSlop={12}>
                <IconSymbol
                  name={filterVisible || posFilter !== 'All'
                    ? 'line.3.horizontal.decrease.circle.fill'
                    : 'line.3.horizontal.decrease.circle'}
                  size={22}
                  color={filterVisible || posFilter !== 'All' ? C.accent : C.label}
                />
              </Pressable>
            )}
            <Pressable
              style={[s.rolePill, { backgroundColor: rolePillBg(role) }]}
              onPress={cycleRole}
            >
              <Text style={s.rolePillText}>{role}</Text>
            </Pressable>
          </View>
        </View>

        {/* Filter Pills (Roster tab only) */}
        {activeTab === 'Players' && (
          <Animated.View style={{
            height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] }),
            opacity: pillsAnim,
            overflow: 'hidden',
          }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.pillsContent}
              style={[s.pillsRow, { borderTopColor: C.separator }]}
            >
              {POS_FILTERS.map(pos => {
                const active = pos === posFilter;
                return (
                  <Pressable
                    key={pos}
                    style={[
                      s.pill,
                      active
                        ? { backgroundColor: C.label }
                        : { borderColor: C.separator },
                    ]}
                    onPress={() => { Haptics.selectionAsync(); setPosFilter(pos); }}
                  >
                    <Text style={[
                      s.pillText,
                      { color: active ? C.bg : C.secondary },
                      active && { fontWeight: '700' },
                    ]}>
                      {pos}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* ── Tab Dropdown ── */}
      {dropdownOpen && (
        <>
          <Pressable
            style={[StyleSheet.absoluteFillObject, { zIndex: 98 }]}
            onPress={() => setDropdownOpen(false)}
          />
          <View style={[
            s.dropdown,
            { top: insets.top + 56, backgroundColor: C.bg, borderColor: C.separator },
          ]}>
            {ROSTER_TABS.map(tab => (
              <Pressable
                key={tab}
                style={s.dropdownOption}
                onPress={() => handleTabSelect(tab)}
              >
                <Text style={[
                  s.dropdownOptionText,
                  { color: tab === activeTab ? C.label : C.secondary },
                  tab === activeTab && { fontWeight: '700' },
                ]}>
                  {tab}
                </Text>
                {tab === 'Depth Chart' && role !== 'Coach' && (
                  <IconSymbol name="lock.fill" size={12} color={C.muted} />
                )}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* ── Bottom Sheets ── */}
      <PlayerSheet
        player={selectedPlayer}
        role={role}
        visible={playerSheetOpen}
        onClose={() => setPlayerSheetOpen(false)}
        C={C}
      />
      <StaffSheet
        member={selectedStaff}
        visible={staffSheetOpen}
        onClose={() => setStaffSheetOpen(false)}
        C={C}
      />
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const rs = StyleSheet.create({
  searchBar:          { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1, marginBottom: 12 },
  searchInput:        { flex: 1, fontSize: 14 },
  coachActions:       { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionBtn:          { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  actionBtnText:      { fontSize: 13, fontWeight: '700' },
  actionBtnWhiteText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  countText:          { fontSize: 12, marginBottom: 8 },
  emptyState:         { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText:          { fontSize: 15 },
});

const lk = StyleSheet.create({
  card:  { borderRadius: 16, padding: 28, alignItems: 'center', gap: 12, maxWidth: 280 },
  title: { fontSize: 17, fontWeight: '700' },
  sub:   { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});

const s = StyleSheet.create({
  screen:            { flex: 1 },
  topBarWrap:        { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:            { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:        { width: 90, justifyContent: 'center' },
  topBarRight:       { alignItems: 'flex-end', flexDirection: 'row', gap: 8, justifyContent: 'flex-end' },
  dropdownWrap:      { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dropdownPill:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 6 },
  dropdownText:      { fontSize: 15, fontWeight: '700' },
  rolePill:          { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14 },
  rolePillText:      { color: '#fff', fontSize: 12, fontWeight: '700' },
  pillsRow:          { height: PILL_ROW_H, borderTopWidth: StyleSheet.hairlineWidth },
  pillsContent:      { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  pill:              { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
  pillText:          { fontSize: 13 },
  dropdown:          { position: 'absolute', left: 16, right: 16, borderRadius: 14, borderWidth: 1, overflow: 'hidden', zIndex: 99 },
  dropdownOption:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 14 },
  dropdownOptionText:{ fontSize: 15 },
});
