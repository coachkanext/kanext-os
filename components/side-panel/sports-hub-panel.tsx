/**
 * Sports Hub Side Panel — Coach/Player quick nav + KR + next game.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  TEAM_INFO, TEAM_KR, NEXT_GAME, rosterHealthSummary, PLAYERS,
  RECRUITS_BOARD, getStageCounts, TODAY_PRACTICE,
} from '@/data/mock-sports-hub';

export function SportsHubPanel() {
  const C = useColors();
  const health = rosterHealthSummary();
  const stageCounts = getStageCounts();
  const newCommits  = (stageCounts['Committed'] ?? 0) + (stageCounts['Verbal'] ?? 0);

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

      {/* Team KR */}
      <View style={{ backgroundColor: '#1A1714', borderRadius: 12, padding: 14, gap: 4 }}>
        <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Team KR</Text>
        <Text style={{ fontSize: 36, fontWeight: '900', color: '#fff', lineHeight: 40 }}>{TEAM_KR.overall}</Text>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Off {TEAM_KR.offensive}</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Def {TEAM_KR.defensive}</Text>
          <Text style={{ fontSize: 12, color: '#5A8A6E' }}>▲ +{TEAM_KR.delta} vs last game</Text>
        </View>
      </View>

      {/* Next game */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Next Game</Text>
      <View style={{ backgroundColor: `hsl(${NEXT_GAME.oppHue},40%,28%)`, borderRadius: 12, padding: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>{NEXT_GAME.opponent}</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
              {NEXT_GAME.date} · {NEXT_GAME.time} · {NEXT_GAME.location === 'A' ? 'Away' : 'Home'}
            </Text>
          </View>
          <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{NEXT_GAME.countdown}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{NEXT_GAME.oppRecord} · {NEXT_GAME.oppConfRec} {TEAM_INFO.conference}</Text>
      </View>

      {/* Roster health */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Roster Health</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Available', value: health.available, color: '#5A8A6E' },
            { label: 'Limited',   value: health.limited,   color: '#1A1714' },
            { label: 'Out',       value: health.out,       color: '#B85C5C' },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed, borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: item.color }}>{item.value}</Text>
              <Text style={{ fontSize: 9, color: C.secondary, marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Navigate */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('chart.bar.fill',           'Dashboard')}
        {navRow('brain',                    'Intelligence', 'Team KR 78.4')}
        {navRow('gearshape.fill',           'Operations')}
      </View>

      {/* Today's practice */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Today</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <IconSymbol name="sportscourt" size={14} color={C.accent} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>Practice {TODAY_PRACTICE.time}</Text>
        </View>
        <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 22 }}>Focus: {TODAY_PRACTICE.focus}</Text>
        <Text style={{ fontSize: 11, color: C.muted, marginLeft: 22 }}>{TODAY_PRACTICE.venue}</Text>
      </View>

      {/* Recruiting */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Recruiting</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', padding: 12, gap: 8 }}>
          {[
            { label: 'Board',     value: RECRUITS_BOARD.length.toString() },
            { label: 'Committed', value: newCommits.toString(), color: '#5A8A6E' },
            { label: 'Offered',   value: (stageCounts['Offered'] ?? 0).toString(), color: '#1A1714' },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed, borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 16, fontWeight: '800', color: (item as any).color ?? C.label }}>{item.value}</Text>
              <Text style={{ fontSize: 9, color: C.secondary, marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Quick actions */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Quick Actions</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('plus.circle.fill',         'Create Practice Plan')}
        {navRow('film.fill',                'Upload Film')}
        {navRow('arrow.triangle.2.circlepath', 'Run Simulation')}
        {navRow('doc.text.magnifyingglass', 'View Scout Report')}
      </View>

      {/* Settings */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Settings</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('person.2.fill',    'Staff Access')}
        {navRow('bell',             'Notifications')}
        {navRow('slider.horizontal.3', 'Intelligence Prefs')}
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
