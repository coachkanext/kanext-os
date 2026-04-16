/**
 * Recruits — Board (Head Coach default).
 * Player redirects to Program screen.
 * Kanban-style pipeline by stage. Tap prospect → detail sheet. FAB = add prospect.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';
const HEAT      = '#B85C5C';

// ── Demo prospect data ────────────────────────────────────────────────────────

type PipelineStage = 'Identified' | 'Watching' | 'Contact' | 'Evaluating' | 'Offer' | 'Committed' | 'Signed';

const PIPELINE_STAGES: PipelineStage[] = [
  'Identified', 'Watching', 'Contact', 'Evaluating', 'Offer', 'Committed', 'Signed',
];

function stageColor(stage: PipelineStage): string {
  switch (stage) {
    case 'Identified': return '#9C9790';
    case 'Watching':   return '#B8943E';
    case 'Contact':    return '#B8943E';
    case 'Evaluating': return '#5A8A6E';
    case 'Offer':      return '#1A2E4A';
    case 'Committed':  return GAIN;
    case 'Signed':     return '#1A1714';
    default:           return '#9C9790';
  }
}

type Prospect = {
  id: string; name: string; initials: string; hue: number;
  position: string; school: string; level: string; classYear: string;
  height: string; weight: number; gpa: number;
  stage: PipelineStage; kr: number; systemFit: number;
  archetype: string; notes: string; lastContact: string;
  stats: { ppg: number; rpg: number; apg: number };
};

const BOARD: Prospect[] = [
  { id: 'b1', name: 'Jaquay Randolph',  initials: 'JR', hue: 215, position: 'SF', school: 'Fresno City College', level: 'NJCAA D1', classYear: '2026', height: "6'7\"", weight: 210, gpa: 2.9, stage: 'Evaluating', kr: 88, systemFit: 98, archetype: 'Two-Way Wing', notes: 'Highest-rated prospect on board. Warm contact — coach visited 3/28. Fresno City assistant confirmed interest. Decision timeline late April.', lastContact: 'Mar 28', stats: { ppg: 16.4, rpg: 7.2, apg: 2.1 } },
  { id: 'b2', name: 'Marcus Webb',      initials: 'MW', hue: 160, position: 'SG', school: 'Fremont HS',          level: 'High School', classYear: '2027', height: "6'3\"", weight: 188, gpa: 3.1, stage: 'Watching', kr: 76, systemFit: 82, archetype: 'Shot-Creating Wing', notes: 'Watched at Bay Area showcase. Excellent IQ for a sophomore. Will track through AAU season.', lastContact: 'Mar 20', stats: { ppg: 18.2, rpg: 4.5, apg: 3.8 } },
  { id: 'b3', name: 'Isaiah Johnson',   initials: 'IJ', hue: 290, position: 'PF', school: 'LA City College',     level: 'NJCAA D2', classYear: '2026', height: "6'8\"", weight: 225, gpa: 2.7, stage: 'Watching', kr: 79, systemFit: 86, archetype: 'Versatile Forward', notes: 'LA City big with great motor. Needs to improve FT%. Assistant coach has relationship with head coach at LA City.', lastContact: 'Mar 15', stats: { ppg: 12.1, rpg: 8.4, apg: 1.2 } },
  { id: 'b4', name: 'DeShawn Coleman',  initials: 'DC', hue: 50,  position: 'PG', school: 'Lincoln HS',          level: 'High School', classYear: '2026', height: "6'0\"", weight: 175, gpa: 3.4, stage: 'Contact', kr: 71, systemFit: 79, archetype: 'Playmaking Guard', notes: 'Local Oakland kid — same school as Laolu. Strong academic profile. First call scheduled Apr 10.', lastContact: 'Apr 5', stats: { ppg: 14.7, rpg: 3.1, apg: 6.9 } },
  { id: 'b5', name: 'Brandon Okafor',   initials: 'BO', hue: 130, position: 'C',  school: 'Laney College',        level: 'NJCAA D2', classYear: '2025', height: "6'9\"", weight: 240, gpa: 2.5, stage: 'Contact', kr: 74, systemFit: 83, archetype: 'Rim Protector', notes: 'Local Laney big — immediate eligibility. Coach has existing relationship. Interested in Diagnostic Imaging program.', lastContact: 'Apr 3', stats: { ppg: 8.3, rpg: 7.9, apg: 0.7 } },
  { id: 'b6', name: 'Terrance Bell',    initials: 'TB', hue: 30,  position: 'SG', school: 'Sheldon HS',           level: 'High School', classYear: '2026', height: "6'3\"", weight: 190, gpa: 2.7, stage: 'Offer', kr: 67, systemFit: 86, archetype: 'Spot-Up Shooter', notes: 'Offer extended Feb 28. Pure shooter — exactly what system needs. Visiting Apr 18.', lastContact: 'Mar 25', stats: { ppg: 15.4, rpg: 2.8, apg: 1.4 } },
  { id: 'b7', name: 'Jordan Shaw',      initials: 'JS', hue: 200, position: 'PG', school: 'Oakland Tech HS',      level: 'High School', classYear: '2026', height: "6'1\"", weight: 180, gpa: 3.2, stage: 'Committed', kr: 72, systemFit: 84, archetype: 'Playmaking Guard', notes: 'Verbally committed 3/20. Local Oakland kid — great culture fit. NLI signing in November.', lastContact: 'Mar 24', stats: { ppg: 13.6, rpg: 3.3, apg: 5.7 } },
  { id: 'b8', name: 'Tavion Howard',    initials: 'TH', hue: 80,  position: 'PG', school: 'Mt. Eden HS',          level: 'High School', classYear: '2026', height: "5'11\"", weight: 170, gpa: 2.9, stage: 'Signed', kr: 64, systemFit: 77, archetype: 'Playmaking Guard', notes: 'Signed NLI. East Bay kid ready to contribute as freshman. Will enroll in August.', lastContact: 'Mar 20', stats: { ppg: 11.2, rpg: 2.6, apg: 4.8 } },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function krColor(kr: number): string {
  if (kr >= 85) return GAIN;
  if (kr >= 70) return CAUTION;
  return '#9C9790';
}

// ── Prospect Detail Sheet ─────────────────────────────────────────────────────

function ProspectSheet({ prospect, visible, onClose, C }: {
  prospect: Prospect | null; visible: boolean; onClose: () => void; C: ComponentColors;
}) {
  if (!prospect) return null;
  const p = prospect;
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={p.name}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: `hsl(${p.hue},50%,42%)`, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800' }}>{p.initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{p.name}</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginTop: 2 }}>{p.position} · {p.height} · {p.weight} lbs · {p.classYear}</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>{p.school} ({p.level})</Text>
        </View>
      </View>

      {/* Stage + stage selector */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[ds.secLabel, { color: C.label }]}>Pipeline Stage</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {PIPELINE_STAGES.map(st => {
              const active = st === p.stage;
              const color = stageColor(st);
              return (
                <Pressable key={st} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  style={{ paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: active ? color + '22' : C.surface, borderWidth: 1, borderColor: active ? color : C.separator }}>
                  <Text style={{ fontSize: 12, fontWeight: active ? '700' : '500', color: active ? color : C.secondary }}>{st}</Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* KR + System Fit */}
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 16 }}>
        <Text style={[ds.secLabel, { color: C.label, marginBottom: 10 }]}>KaNeXT Rating</Text>
        <View style={{ flexDirection: 'row', gap: 24, marginBottom: 12 }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 32, fontWeight: '900', color: krColor(p.kr) }}>{p.kr}</Text>
            <Text style={{ fontSize: 11, color: C.secondary }}>Overall KR</Text>
          </View>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{p.archetype}</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Archetype</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 12, color: C.secondary }}>System Fit</Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: p.systemFit >= 95 ? GAIN : p.systemFit >= 85 ? CAUTION : C.secondary }}>{p.systemFit}%</Text>
        </View>
        <View style={{ height: 6, backgroundColor: C.separator, borderRadius: 3, overflow: 'hidden' }}>
          <View style={{ width: `${p.systemFit}%` as any, height: '100%', backgroundColor: p.systemFit >= 95 ? GAIN : CAUTION, borderRadius: 3 }} />
        </View>
      </View>

      {/* Stats */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[ds.secLabel, { color: C.label }]}>Season Stats</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
          {[
            { label: 'PPG', val: p.stats.ppg },
            { label: 'RPG', val: p.stats.rpg },
            { label: 'APG', val: p.stats.apg },
          ].map(stat => (
            <View key={stat.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surface, borderRadius: 10, paddingVertical: 10 }}>
              <Text style={{ fontSize: 22, fontWeight: '900', color: C.label }}>{stat.val.toFixed(1)}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Academic */}
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        <View style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.label }}>{p.gpa.toFixed(1)}</Text>
          <Text style={{ fontSize: 11, color: C.secondary }}>GPA</Text>
        </View>
        <View style={{ flex: 2, backgroundColor: C.surface, borderRadius: 10, padding: 12 }}>
          <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 4 }}>Last Contact</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{p.lastContact}</Text>
        </View>
      </View>

      {/* Notes */}
      <View style={{ marginBottom: 16 }}>
        <Text style={[ds.secLabel, { color: C.label }]}>Coaching Notes</Text>
        <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 12, marginTop: 8 }}>
          <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{p.notes}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['Call', 'Message', 'Schedule Visit'].map((action, i) => (
          <Pressable key={action} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={{ flex: 1, paddingVertical: 11, borderRadius: 12, backgroundColor: i === 0 ? '#1A1714' : C.surface, borderWidth: i > 0 ? 1 : 0, borderColor: C.separator, alignItems: 'center' }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: i === 0 ? '#fff' : C.label }}>{action}</Text>
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}

const ds = StyleSheet.create({
  secLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, opacity: 0.55 },
});

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function BoardScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selected, setSelected]   = useState<Prospect | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isCoach) router.replace('/(tabs)/(main)/recruits/program' as any);
  }, [isCoach, router]));

  if (!isCoach) return null;

  const grouped = useMemo(() => {
    const map: Record<PipelineStage, Prospect[]> = {} as any;
    for (const stage of PIPELINE_STAGES) map[stage] = [];
    for (const p of BOARD) map[p.stage].push(p);
    return map;
  }, []);

  const toggleStage = (stage: PipelineStage) => {
    setCollapsed(prev => ({ ...prev, [stage]: !prev[stage] }));
    Haptics.selectionAsync();
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Board</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {PIPELINE_STAGES.map(stage => {
          const prospects = grouped[stage];
          const isCollapsed = collapsed[stage];
          const color = stageColor(stage);
          return (
            <View key={stage} style={{ marginBottom: 4 }}>
              {/* Stage header */}
              <Pressable style={[s.stageHeader, { backgroundColor: C.surface }]} onPress={() => toggleStage(stage)}>
                <View style={[s.stageColorDot, { backgroundColor: color }]} />
                <Text style={[s.stageName, { color: C.label }]}>{stage}</Text>
                <View style={[s.stageBadge, { backgroundColor: color + '22' }]}>
                  <Text style={[s.stageBadgeText, { color }]}>{prospects.length}</Text>
                </View>
                <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={12} color={C.secondary} />
              </Pressable>

              {/* Prospect cards */}
              {!isCollapsed && prospects.map(p => (
                <Pressable
                  key={p.id}
                  style={[s.prospectCard, { backgroundColor: C.surface }]}
                  onPress={() => { setSelected(p); setSheetOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                    <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: `hsl(${p.hue},50%,42%)`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{p.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text style={[s.prospectName, { color: C.label }]}>{p.name}</Text>
                        <View style={[s.posBadge, { backgroundColor: '#1A1714' + '18' }]}>
                          <Text style={{ fontSize: 11, fontWeight: '700', color: '#1A1714' }}>{p.position}</Text>
                        </View>
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{p.school} · {p.level}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{p.height} · Class of {p.classYear}</Text>
                    </View>
                    <Pressable hitSlop={8} onPress={() => Alert.alert(p.name, 'Move Stage, Add Note, or Archive', [{ text: 'Move Stage' }, { text: 'Add Note' }, { text: 'Archive', style: 'destructive' }, { text: 'Cancel', style: 'cancel' }])}>
                      <IconSymbol name="ellipsis" size={16} color={C.secondary} />
                    </Pressable>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: krColor(p.kr) }}>KR {p.kr}</Text>
                    <Text style={{ fontSize: 12, color: p.systemFit >= 95 ? GAIN : p.systemFit >= 85 ? CAUTION : C.secondary, fontWeight: '600' }}>Fit {p.systemFit}%</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{p.stats.ppg.toFixed(1)} PPG · {p.stats.rpg.toFixed(1)} RPG</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 'auto' as any }}>Last contact {p.lastContact}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: '#1A1714', bottom: insets.bottom + 70 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Prospect', 'Add manually or search the player pool?', [{ text: 'Search Pool' }, { text: 'Add Manually' }, { text: 'Cancel', style: 'cancel' }]); }}
      >
        <IconSymbol name="plus" size={22} color="#fff" />
      </Pressable>

      <ProspectSheet prospect={selected} visible={sheetOpen} onClose={() => setSheetOpen(false)} C={C} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },

  stageHeader:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10 },
  stageColorDot:  { width: 8, height: 8, borderRadius: 4 },
  stageName:      { flex: 1, fontSize: 13, fontWeight: '700' },
  stageBadge:     { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  stageBadgeText: { fontSize: 11, fontWeight: '700' },

  prospectCard: { marginHorizontal: 16, marginBottom: 2, borderRadius: 12, padding: 14 },
  prospectName: { fontSize: 15, fontWeight: '700' },
  posBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },

  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 6 },
});
