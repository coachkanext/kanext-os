/**
 * Sports Hub — Game Day Live Operations Center.
 * Head Coach only. Redirects Player to hub root.
 * Phases: Pregame / Live / Halftime / Postgame
 */

import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const DARK    = '#1A1714';
const TOP_BAR_H = 52;

type GamePhase   = 'pregame' | 'live' | 'halftime' | 'postgame';
type ActivePanel = 'offense' | 'defense' | 'matchups' | 'lineup';

const PHASES: GamePhase[] = ['pregame', 'live', 'halftime', 'postgame'];

const PHASE_LABELS: Record<GamePhase, string> = {
  pregame: 'Pre-Game',
  live: 'Live',
  halftime: 'Halftime',
  postgame: 'Postgame',
};

export default function SportsGameDayScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  const [gamePhase,   setGamePhase]   = useState<GamePhase>('live');
  const [activePanel, setActivePanel] = useState<ActivePanel>('offense');
  const [possession,  setPossession]  = useState<'us' | 'them'>('us');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isHeadCoach) {
      router.replace('/(tabs)/(main)/hub' as any);
    }
  }, [isHeadCoach]));

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={[s.sectionHeader, { color: C.secondary }]}>{title}</Text>
  );

  // ── PREGAME ───────────────────────────────────────────────────────────────────
  const renderPregame = () => (
    <View style={{ gap: 16 }}>
      <SectionHeader title="STARTING LINEUP" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {[
          { id: 'LK', kr: 86, pos: 'G', fouls: 0 },
          { id: 'BW', kr: 79, pos: 'G', fouls: 0 },
          { id: 'CM', kr: 73, pos: 'G', fouls: 0 },
          { id: 'NC', kr: 73, pos: 'F', fouls: 0 },
          { id: 'AH', kr: 66, pos: 'G', fouls: 0 },
        ].map(p => (
          <View key={p.id} style={[s.miniPlayerCard, { backgroundColor: DARK }]}>
            <Text style={s.miniPlayerKR}>{p.kr}</Text>
            <Text style={s.miniPlayerInit}>{p.id}</Text>
            <Text style={s.miniPlayerPos}>{p.pos}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="GAME PLAN LOADED" />
      <View style={[s.darkCard, { marginHorizontal: 16 }]}>
        <View style={s.rowBetween}>
          <Text style={s.darkCardTitle}>vs Dominican University</Text>
          <View style={[s.badge, { backgroundColor: GAIN }]}>
            <Text style={s.badgeText}>READY</Text>
          </View>
        </View>
        <Text style={[s.darkCardSub, { marginTop: 6 }]}>System: Spread PnR · Key Threat: Marcus Reed #3</Text>
        <Text style={[s.darkCardSub, { color: CAUTION }]}>Dipson: "Deny ball screen, force left hand, switch all actions"</Text>
      </View>

      <SectionHeader title="MATCHUP ASSIGNMENTS" />
      {[
        { us: 'LK', them: 'M. Reed', krUs: 86, krThem: 81, edge: '+5' },
        { us: 'BW', them: 'K. Johnson', krUs: 79, krThem: 74, edge: '+5' },
        { us: 'CM', them: 'T. Williams', krUs: 73, krThem: 71, edge: '+2' },
        { us: 'NC', them: 'D. Mills', krUs: 73, krThem: 69, edge: '+4' },
        { us: 'AH', them: 'R. Carter', krUs: 66, krThem: 68, edge: '-2' },
      ].map(m => {
        const win = !m.edge.startsWith('-');
        return (
          <View key={m.us} style={[s.matchupRow, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
            <View style={[s.matchupBadge, { borderColor: win ? GAIN : HEAT }]}>
              <Text style={[s.matchupBadgeText, { color: C.label }]}>{m.us}</Text>
              <Text style={[s.matchupKR, { color: GAIN }]}>{m.krUs}</Text>
            </View>
            <Text style={[s.matchupVs, { color: C.secondary }]}>vs</Text>
            <View style={[s.matchupBadge, { borderColor: win ? HEAT : GAIN }]}>
              <Text style={[s.matchupBadgeText, { color: C.label }]}>{m.them}</Text>
              <Text style={[s.matchupKR, { color: C.secondary }]}>{m.krThem}</Text>
            </View>
            <Text style={[s.matchupEdge, { color: win ? GAIN : HEAT }]}>{m.edge}</Text>
          </View>
        );
      })}
    </View>
  );

  // ── LIVE ─────────────────────────────────────────────────────────────────────
  const renderLive = () => (
    <View style={{ gap: 16 }}>
      {/* Situation Strip */}
      <View style={[s.situationStrip, { marginHorizontal: 16 }]}>
        <Text style={s.situationScore}>
          <Text style={{ color: GAIN }}>LU </Text>
          <Text style={s.situationBig}>58</Text>
          <Text style={s.situationDash}> — </Text>
          <Text style={s.situationBig}>54</Text>
          <Text style={{ color: 'rgba(255,255,255,0.6)' }}> DCU</Text>
        </Text>
        <View style={s.situationMeta}>
          <Text style={s.situationMetaText}>2nd · 12:34</Text>
          <Pressable onPress={() => setPossession(p => p === 'us' ? 'them' : 'us')}
            style={[s.possArrow, { backgroundColor: possession === 'us' ? GAIN + '33' : 'transparent' }]}>
            <Text style={{ color: possession === 'us' ? GAIN : C.secondary, fontSize: 16 }}>
              {possession === 'us' ? '▶' : '◀'}
            </Text>
          </Pressable>
          <Text style={s.situationMetaText}>Fouls: 8</Text>
          <View style={[s.badge, { backgroundColor: CAUTION }]}>
            <Text style={s.badgeText}>BONUS</Text>
          </View>
          <View style={s.timeoutDots}>
            {[0,1,2].map(i => <View key={i} style={[s.timeoutDot, { backgroundColor: i < 2 ? GAIN : C.separator }]} />)}
          </View>
        </View>
      </View>

      {/* Run Tracker */}
      <View style={{ paddingHorizontal: 16 }}>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>RUN TRACKER</Text>
        <View style={{ flexDirection: 'row', gap: 5, marginTop: 6 }}>
          {[GAIN, GAIN, HEAT, HEAT, GAIN, GAIN, GAIN, C.separator].map((color, i) => (
            <View key={i} style={[s.runSquare, { backgroundColor: color }]} />
          ))}
        </View>
      </View>

      {/* Panel tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {(['offense', 'defense', 'matchups', 'lineup'] as ActivePanel[]).map(p => {
          const labels = { offense: 'Our Offense', defense: 'Their Actions', matchups: 'Matchups', lineup: 'Lineup' };
          const active = activePanel === p;
          return (
            <Pressable key={p}
              style={[s.panelTab, { backgroundColor: active ? C.label : C.separator }]}
              onPress={() => { Haptics.selectionAsync(); setActivePanel(p); }}>
              <Text style={[s.panelTabText, { color: active ? C.bg : C.secondary }]}>{labels[p]}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Panel content */}
      {activePanel === 'offense' && (
        <View style={{ gap: 8, paddingHorizontal: 16 }}>
          {[
            { name: 'Horns PnR',   runs: 6, ppp: '1.18', pppVal: 1.18, trend: '↑ Working' },
            { name: 'Transition',  runs: 8, ppp: '1.31', pppVal: 1.31, trend: '↑ Keep running' },
            { name: 'Post-Up',     runs: 3, ppp: '0.72', pppVal: 0.72, trend: '↓ Stop' },
            { name: 'BLOB',        runs: 2, ppp: '0.95', pppVal: 0.95, trend: '→ Neutral' },
          ].map(a => (
            <View key={a.name} style={[s.actionCard, { backgroundColor: DARK }]}>
              <View style={s.rowBetween}>
                <Text style={s.actionName}>{a.name}</Text>
                <Text style={[s.actionPPP, { color: a.pppVal >= 1.0 ? GAIN : HEAT }]}>{a.ppp} PPP</Text>
              </View>
              <View style={s.rowBetween}>
                <Text style={s.actionRuns}>{a.runs} runs</Text>
                <Text style={[s.actionTrend, { color: a.pppVal >= 1.0 ? GAIN : HEAT }]}>{a.trend}</Text>
              </View>
            </View>
          ))}
          <View style={[s.dipsonCard, { backgroundColor: DARK }]}>
            <IconSymbol name="sparkles" size={16} color={GAIN} />
            <Text style={[s.dipsonText, { color: 'rgba(255,255,255,0.8)' }]}>
              Transition offense scoring 1.31 PPP — push pace after every defensive stop
            </Text>
          </View>
        </View>
      )}

      {activePanel === 'defense' && (
        <View style={{ gap: 8, paddingHorizontal: 16 }}>
          {[
            { name: 'Horns',      runs: 8,  ppp: '1.30', pppVal: 1.30, note: '⚠️ WATCH — Run 4× in Q4' },
            { name: 'PnR Marcus', runs: 5,  ppp: '1.10', pppVal: 1.10, note: '→ Contained' },
            { name: 'Transition', runs: 12, ppp: '0.90', pppVal: 0.90, note: '✓ Stopping it' },
            { name: 'SLOB',       runs: 2,  ppp: '1.40', pppVal: 1.40, note: '⚠️ Timeout if they run it' },
          ].map(a => (
            <View key={a.name} style={[s.actionCard, { backgroundColor: DARK }]}>
              <View style={s.rowBetween}>
                <Text style={s.actionName}>{a.name}</Text>
                <Text style={[s.actionPPP, { color: a.pppVal >= 1.0 ? HEAT : GAIN }]}>{a.ppp} PPP</Text>
              </View>
              <View style={s.rowBetween}>
                <Text style={s.actionRuns}>{a.runs} runs</Text>
                <Text style={[s.actionTrend, { color: a.pppVal >= 1.1 ? HEAT : GAIN }]}>{a.note}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {activePanel === 'matchups' && (
        <View style={{ gap: 8, paddingHorizontal: 16 }}>
          {[
            { us: 'LK', them: 'Reed',     pm: '+6', fouls: 1, mins: 18, border: GAIN },
            { us: 'BW', them: 'Johnson',  pm: '+3', fouls: 2, mins: 16, border: GAIN },
            { us: 'CM', them: 'Williams', pm:  '0', fouls: 1, mins: 14, border: C.separator },
            { us: 'NC', them: 'Mills',    pm: '+2', fouls: 3, mins: 12, border: CAUTION },
            { us: 'AH', them: 'Carter',   pm: '-4', fouls: 1, mins: 10, border: HEAT },
          ].map(m => (
            <View key={m.us} style={[s.liveMatchupRow, { backgroundColor: C.surface, borderLeftColor: m.border }]}>
              <View style={s.matchupNames}>
                <Text style={[s.liveMatchupUs, { color: C.label }]}>{m.us}</Text>
                <Text style={[s.liveMatchupVs, { color: C.secondary }]}>vs {m.them}</Text>
              </View>
              <Text style={[s.liveMatchupPM, { color: m.pm.startsWith('-') ? HEAT : m.pm === '0' ? C.secondary : GAIN }]}>{m.pm}</Text>
              <Text style={[s.liveMatchupFouls, { color: m.fouls >= 3 ? CAUTION : C.secondary }]}>{m.fouls}F</Text>
              <Text style={[s.liveMatchupMins, { color: C.secondary }]}>{m.mins}m</Text>
            </View>
          ))}
        </View>
      )}

      {activePanel === 'lineup' && (
        <View style={{ gap: 12 }}>
          <Text style={[s.sectionHeader, { color: C.secondary, paddingHorizontal: 16 }]}>ON COURT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
            {[
              { id: 'LK', kr: 86, fouls: 1, pm: '+6', border: GAIN },
              { id: 'BW', kr: 79, fouls: 2, pm: '+3', border: GAIN },
              { id: 'CM', kr: 73, fouls: 1, pm:  '0', border: C.separator },
              { id: 'NC', kr: 73, fouls: 3, pm: '+2', border: CAUTION },
              { id: 'AH', kr: 66, fouls: 1, pm: '-4', border: HEAT },
            ].map(p => (
              <View key={p.id} style={[s.lineupCard, { backgroundColor: DARK, borderColor: p.border }]}>
                <Text style={[s.lineupKR, { color: GAIN }]}>{p.kr}</Text>
                <Text style={s.lineupInit}>{p.id}</Text>
                <Text style={[s.lineupFouls, { color: p.fouls >= 3 ? CAUTION : 'rgba(255,255,255,0.5)' }]}>{p.fouls}F</Text>
                <Text style={[s.lineupPM, { color: p.pm.startsWith('-') ? HEAT : GAIN }]}>{p.pm}</Text>
              </View>
            ))}
          </ScrollView>

          <Text style={[s.sectionHeader, { color: C.secondary, paddingHorizontal: 16 }]}>BENCH</Text>
          <View style={{ paddingHorizontal: 16, gap: 8 }}>
            {[
              { id: 'SW', name: 'S. Wall',    kr: 61 },
              { id: 'CP', name: 'C. Plantey', kr: 63 },
              { id: 'PD', name: 'P. Diomande',kr: 59 },
            ].map(p => (
              <View key={p.id} style={[s.benchRow, { backgroundColor: C.surface }]}>
                <View style={[s.benchAvatar, { backgroundColor: DARK }]}>
                  <Text style={s.benchInit}>{p.id}</Text>
                </View>
                <Text style={[s.benchName, { color: C.label }]}>{p.name}</Text>
                <Text style={[s.benchKR, { color: C.secondary }]}>KR {p.kr}</Text>
                <Pressable style={[s.subBtn, { backgroundColor: C.label }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Substitution', `Subbing in ${p.name}. Projected impact: +2 KR delta.`); }}>
                  <Text style={[s.subBtnText, { color: C.bg }]}>SUB IN</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  // ── HALFTIME ─────────────────────────────────────────────────────────────────
  const renderHalftime = () => (
    <View style={{ gap: 16 }}>
      <View style={{ paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={[s.badge, { backgroundColor: CAUTION }]}>
          <Text style={s.badgeText}>HALFTIME STAFF PACKET</Text>
        </View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Auto-generated by Dipson</Text>
      </View>

      <SectionHeader title="TOP-3 ADJUSTMENTS" />
      {[
        { problem: "Their Horns action scoring 1.3 PPP", fix: "Switch all ball screens, don't go under" },
        { problem: "NC in foul trouble (3 fouls)",       fix: "Insert PD at center, go zone to protect NC" },
        { problem: "Transition defense breaking down",   fix: "Call 'Get Back' on every made basket" },
      ].map((adj, i) => (
        <View key={i} style={[s.adjCard, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
          <Text style={[s.adjProblem, { color: HEAT }]}>⚠ {adj.problem}</Text>
          <Text style={[s.adjFix, { color: GAIN }]}>→ {adj.fix}</Text>
          <Pressable style={[s.implementBtn, { backgroundColor: C.label }]}
            onPress={() => { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); Alert.alert('Implemented', adj.fix); }}>
            <Text style={[s.implementBtnText, { color: C.bg }]}>IMPLEMENT</Text>
          </Pressable>
        </View>
      ))}

      <SectionHeader title="GAME STATE" />
      <View style={[s.statGrid, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
        {[
          { label: 'Score', value: '58–54 LU' },
          { label: 'Pace',  value: '94.2' },
          { label: 'Fouls', value: 'LU 8 · 11 OPP' },
          { label: 'TOs',   value: 'LU 4 · 7 OPP' },
          { label: 'OREB',  value: '6 vs 4' },
          { label: 'PPP',   value: '1.09 vs 0.97' },
        ].map(s2 => (
          <View key={s2.label} style={s.statGridCell}>
            <Text style={[{ fontSize: 10, color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.4 }]}>{s2.label}</Text>
            <Text style={[{ fontSize: 15, fontWeight: '700', color: C.label, marginTop: 2 }]}>{s2.value}</Text>
          </View>
        ))}
      </View>

      <SectionHeader title="FIVE FACTORS" />
      <View style={[{ backgroundColor: C.surface, borderRadius: 12, marginHorizontal: 16, padding: 14, gap: 10 }]}>
        {[
          { name: 'eFG%',    us: 52, them: 48, usLabel: '52%', themLabel: '48%', usWins: true },
          { name: 'TOV%',    us: 82, them: 100, usLabel: '12%', themLabel: '18%', usWins: true },
          { name: 'OREB%',   us: 38, them: 31, usLabel: '38%', themLabel: '31%', usWins: true },
          { name: 'FT Rate', us: 28, them: 22, usLabel: '.28', themLabel: '.22', usWins: true },
          { name: '3P%',     us: 35, them: 40, usLabel: '35%', themLabel: '40%', usWins: false },
        ].map(f => (
          <View key={f.name}>
            <View style={s.rowBetween}>
              <Text style={[{ fontSize: 11, color: C.label, fontWeight: '600', width: 70 }]}>{f.usLabel}</Text>
              <Text style={[{ fontSize: 10, color: C.secondary, flex: 1, textAlign: 'center' }]}>{f.name}</Text>
              <Text style={[{ fontSize: 11, color: C.label, fontWeight: '600', width: 70, textAlign: 'right' }]}>{f.themLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', height: 6, borderRadius: 3, overflow: 'hidden', marginTop: 4, backgroundColor: C.separator }}>
              <View style={{ flex: f.us, backgroundColor: f.usWins ? GAIN : HEAT }} />
              <View style={{ flex: f.them, backgroundColor: f.usWins ? HEAT : GAIN }} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // ── POSTGAME ──────────────────────────────────────────────────────────────────
  const renderPostgame = () => (
    <View style={{ gap: 16 }}>
      <View style={[s.finalScoreCard, { backgroundColor: DARK }]}>
        <View style={[s.badge, { backgroundColor: GAIN, alignSelf: 'center', marginBottom: 8 }]}>
          <Text style={s.badgeText}>POSTGAME STAFF PACKET</Text>
        </View>
        <Text style={s.finalScoreText}>LU 84 — 71 Dominican</Text>
        <Text style={[s.finalScoreSub, { color: 'rgba(255,255,255,0.5)' }]}>W · Regular Season · GAAC</Text>
      </View>

      <SectionHeader title="PLAYER GRADES" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
        {[
          { id: 'LK', grade: 'A+', color: GAIN,    note: 'Career-high effort' },
          { id: 'BW', grade: 'A',  color: GAIN,    note: 'Dominated inside' },
          { id: 'CM', grade: 'B+', color: C.label, note: 'Steady all game' },
          { id: 'NC', grade: 'B',  color: CAUTION, note: 'Foul trouble' },
          { id: 'AH', grade: 'C+', color: CAUTION, note: 'Struggled vs pressure' },
        ].map(p => (
          <View key={p.id} style={[s.gradeCard, { backgroundColor: DARK }]}>
            <Text style={[s.gradeLetter, { color: p.color }]}>{p.grade}</Text>
            <Text style={s.gradeInit}>{p.id}</Text>
            <Text style={s.gradeNote}>{p.note}</Text>
          </View>
        ))}
      </ScrollView>

      <SectionHeader title="DIPSON MEDIA REPORT" />
      <View style={[s.mediaCard, { backgroundColor: DARK, marginHorizontal: 16 }]}>
        <Text style={s.mediaHeadline}>Oaklanders Roll Past Dominican, 84-71, to Clinch 1st Place</Text>
        <Text style={s.mediaSummary}>Lincoln University extended their winning streak to 6 games with a dominant 84-71 victory over Dominican University, clinching first place in the GAAC standings...</Text>
        <View style={s.mediaActions}>
          {['Share to Social', 'Export PDF', 'Post to KTV'].map(action => (
            <Pressable key={action}
              style={[s.mediaActionBtn, { backgroundColor: C.surface }]}
              onPress={() => Alert.alert(action, `${action} — generating...`)}>
              <Text style={[s.mediaActionText, { color: C.label }]}>{action}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  const renderPhaseContent = () => {
    switch (gamePhase) {
      case 'pregame':  return renderPregame();
      case 'live':     return renderLive();
      case 'halftime': return renderHalftime();
      case 'postgame': return renderPostgame();
    }
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Game Day</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 80, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Phase selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {PHASES.map(phase => {
            const active = gamePhase === phase;
            return (
              <Pressable key={phase}
                style={[s.phasePill, { backgroundColor: active ? C.label : C.separator }]}
                onPress={() => { Haptics.selectionAsync(); setGamePhase(phase); }}>
                <Text style={[s.phasePillText, { color: active ? C.bg : C.secondary }]}>{PHASE_LABELS[phase]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {renderPhaseContent()}
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', paddingHorizontal: 16 },

    phasePill:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    phasePillText: { fontSize: 13, fontWeight: '600' },

    // Situation strip
    situationStrip: { backgroundColor: '#0A0806', borderRadius: 12, padding: 12, gap: 6 },
    situationScore: { fontSize: 14, fontWeight: '700', color: '#fff' },
    situationBig:   { fontSize: 24, fontWeight: '900', color: '#fff' },
    situationDash:  { fontSize: 18, color: 'rgba(255,255,255,0.4)' },
    situationMeta:  { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    situationMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    possArrow:      { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    timeoutDots:    { flexDirection: 'row', gap: 3 },
    timeoutDot:     { width: 8, height: 8, borderRadius: 4 },

    runSquare: { width: 28, height: 28, borderRadius: 4 },

    panelTab:     { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
    panelTabText: { fontSize: 12, fontWeight: '600' },

    // Action cards (dark)
    darkCard:      { backgroundColor: '#1A1714', borderRadius: 12, padding: 14 },
    darkCardTitle: { fontSize: 15, fontWeight: '700', color: '#fff' },
    darkCardSub:   { fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 2 },

    actionCard:  { borderRadius: 12, padding: 12, gap: 4 },
    actionName:  { fontSize: 14, fontWeight: '700', color: '#fff' },
    actionRuns:  { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    actionPPP:   { fontSize: 14, fontWeight: '700' },
    actionTrend: { fontSize: 12 },
    rowBetween:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    dipsonCard: { borderRadius: 12, padding: 12, flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
    dipsonText: { flex: 1, fontSize: 13, lineHeight: 18 },

    badge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#fff', textTransform: 'uppercase', letterSpacing: 0.4 },

    // Matchup rows
    matchupRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, padding: 10 },
    matchupBadge:     { width: 52, alignItems: 'center', borderRadius: 8, borderWidth: 1.5, padding: 6 },
    matchupBadgeText: { fontSize: 12, fontWeight: '700' },
    matchupKR:        { fontSize: 11, fontWeight: '600' },
    matchupVs:        { fontSize: 11 },
    matchupEdge:      { flex: 1, textAlign: 'right', fontSize: 14, fontWeight: '800' },

    // Live matchup rows
    liveMatchupRow:   { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, borderLeftWidth: 3, gap: 10 },
    matchupNames:     { flex: 1 },
    liveMatchupUs:    { fontSize: 14, fontWeight: '700' },
    liveMatchupVs:    { fontSize: 12 },
    liveMatchupPM:    { fontSize: 16, fontWeight: '800', width: 36, textAlign: 'center' },
    liveMatchupFouls: { fontSize: 12, width: 24, textAlign: 'center' },
    liveMatchupMins:  { fontSize: 12, width: 28, textAlign: 'right' },

    // Lineup
    miniPlayerCard: { width: 70, alignItems: 'center', borderRadius: 10, padding: 10 },
    miniPlayerKR:   { fontSize: 20, fontWeight: '900', color: '#5A8A6E' },
    miniPlayerInit: { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 2 },
    miniPlayerPos:  { fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 },

    lineupCard:  { width: 76, alignItems: 'center', borderRadius: 10, padding: 10, borderWidth: 2 },
    lineupKR:    { fontSize: 18, fontWeight: '900' },
    lineupInit:  { fontSize: 13, fontWeight: '700', color: '#fff', marginTop: 2 },
    lineupFouls: { fontSize: 11, marginTop: 2 },
    lineupPM:    { fontSize: 13, fontWeight: '700', marginTop: 2 },

    benchRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 10, padding: 10 },
    benchAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    benchInit:   { fontSize: 12, fontWeight: '700', color: '#fff' },
    benchName:   { flex: 1, fontSize: 14, fontWeight: '600' },
    benchKR:     { fontSize: 12 },
    subBtn:      { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5 },
    subBtnText:  { fontSize: 11, fontWeight: '700' },

    // Halftime
    adjCard:        { borderRadius: 12, padding: 14, gap: 6 },
    adjProblem:     { fontSize: 13, fontWeight: '600' },
    adjFix:         { fontSize: 13 },
    implementBtn:   { borderRadius: 8, paddingVertical: 8, alignItems: 'center', marginTop: 4 },
    implementBtnText: { fontSize: 12, fontWeight: '700' },

    statGrid:     { borderRadius: 12, padding: 14, flexDirection: 'row', flexWrap: 'wrap' },
    statGridCell: { width: '33.33%', padding: 8, alignItems: 'center' },

    // Postgame
    finalScoreCard: { borderRadius: 16, marginHorizontal: 16, padding: 20, alignItems: 'center' },
    finalScoreText: { fontSize: 26, fontWeight: '900', color: '#5A8A6E', marginTop: 4 },
    finalScoreSub:  { fontSize: 12, marginTop: 4 },

    gradeCard:   { width: 100, alignItems: 'center', backgroundColor: '#1A1714', borderRadius: 12, padding: 12, gap: 4 },
    gradeLetter: { fontSize: 28, fontWeight: '900' },
    gradeInit:   { fontSize: 13, fontWeight: '700', color: '#fff' },
    gradeNote:   { fontSize: 10, color: 'rgba(255,255,255,0.5)', textAlign: 'center' },

    mediaCard:     { borderRadius: 14, padding: 16, gap: 10 },
    mediaHeadline: { fontSize: 16, fontWeight: '800', color: '#fff', lineHeight: 22 },
    mediaSummary:  { fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 18 },
    mediaActions:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
    mediaActionBtn:  { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
    mediaActionText: { fontSize: 12, fontWeight: '600' },
  });
}
