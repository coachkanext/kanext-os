/**
 * Sports Recruits Side Panel — coach/recruit recruiting board quick nav.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  RECRUITS_BOARD, PORTAL_PLAYERS, getStageCounts, stageColor,
} from '@/data/mock-sports-hub';

export function SportsRecruitsPanel() {
  const C = useColors();
  const stageCounts = getStageCounts();

  const committed  = (stageCounts['Committed'] ?? 0) + (stageCounts['Signed'] ?? 0) + (stageCounts['Verbal'] ?? 0);
  const offered    = stageCounts['Offered'] ?? 0;
  const evaluating = stageCounts['Evaluating'] ?? 0;
  const targets    = RECRUITS_BOARD.filter(r => r.priority === 'Target' && r.stage !== 'Declined');
  const topTargets = targets.slice(0, 4);
  const portalTargets = PORTAL_PLAYERS.filter(p => p.systemFit >= 80).slice(0, 3);

  const navRow = (icon: string, label: string, detail?: string) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
    >
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>

      {/* Board summary */}
      <View style={{ backgroundColor: '#003A63', borderRadius: 12, padding: 14 }}>
        <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Recruiting Board</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Committed', value: committed, color: '#5A8A6E' },
            { label: 'Offered',   value: offered,   color: '#1D9BF0' },
            { label: 'Eval',      value: evaluating, color: '#D97757' },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: item.color }}>{item.value}</Text>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Priority targets */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Priority Targets</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {topTargets.map((r, i) => (
          <Pressable
            key={r.id}
            style={({ pressed }) => [
              s.navRow,
              i < topTargets.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              pressed && { backgroundColor: C.surfacePressed },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `hsl(${r.hue},45%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{r.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{r.name}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{r.position} · {r.classYear} · {r.school}</Text>
            </View>
            <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, backgroundColor: stageColor(r.stage) + '20' }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: stageColor(r.stage) }}>{r.stage}</Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Transfer portal */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Portal Targets</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {portalTargets.map((p, i) => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [
              s.navRow,
              i < portalTargets.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              pressed && { backgroundColor: C.surfacePressed },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `hsl(${p.hue},45%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{p.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{p.name}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{p.position} · {p.prevSchool} · Fit {p.systemFit}</Text>
            </View>
            <View style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, backgroundColor: p.eligible === 'immediately' ? '#5A8A6E18' : '#D9775718' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: p.eligible === 'immediately' ? '#5A8A6E' : '#D97757' }}>
                {p.eligible === 'immediately' ? 'IMMED' : 'SIT'}
              </Text>
            </View>
          </Pressable>
        ))}
      </View>

      {/* Navigate */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('list.bullet.clipboard', 'Board',  `${RECRUITS_BOARD.length} prospects`)}
        {navRow('person.badge.plus',     'Pool',   `${PORTAL_PLAYERS.length} in portal`)}
        {navRow('arrow.triangle.2.circlepath', 'Portal', `${PORTAL_PLAYERS.filter(p => p.eligible === 'immediately').length} eligible`)}
      </View>

      {/* Quick actions */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('plus.circle.fill',         'Add Prospect')}
        {navRow('envelope.fill',            'Send Offer Letter')}
        {navRow('calendar.badge.plus',      'Schedule Visit')}
        {navRow('film.fill',                'Upload Film')}
      </View>

    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 6 },
  navRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:     { fontSize: 12 },
});
