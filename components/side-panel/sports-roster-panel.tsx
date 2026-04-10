/**
 * Sports Roster Side Panel — coach/player/fan roster quick nav.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  PLAYERS, COACHING_STAFF, rosterHealthSummary, getUpcomingGames,
} from '@/data/mock-sports-hub';

export function SportsRosterPanel() {
  const router = useRouter();
  const C = useColors();
  const health = rosterHealthSummary();
  const scholarship = PLAYERS.filter(p => p.isScholarship && !p.isRedshirt).length;
  const walkOns     = PLAYERS.filter(p => !p.isScholarship).length;
  const redshirts   = PLAYERS.filter(p => p.isRedshirt).length;
  const upcoming    = getUpcomingGames().slice(0, 2);
  const warningPlayers = PLAYERS.filter(p => p.eligibility === 'warning');

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

      {/* ── Home ── */}
      <Pressable
        style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          closeSidePanel();
          router.setParams({ manage: undefined });
        }}
      >
        <IconSymbol name="house.fill" size={18} color={C.secondary} />
        <Text style={[s.navLabel, { color: C.label }]}>Home</Text>
      </Pressable>

      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />

      {/* Roster summary */}
      <View style={{ backgroundColor: '#1A1714', borderRadius: 12, padding: 14 }}>
        <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Roster</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Scholarship', value: scholarship },
            { label: 'Walk-On',     value: walkOns },
            { label: 'Redshirt',    value: redshirts },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff' }}>{item.value}</Text>
              <Text style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Roster health */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Health Status</Text>
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

      {/* Academic alert */}
      {warningPlayers.length > 0 && (
        <>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Academic Alert</Text>
          <View style={{ backgroundColor: '#B85C5C18', borderRadius: 12, borderWidth: 1, borderColor: '#B85C5C40', padding: 12, gap: 4 }}>
            {warningPlayers.map(p => (
              <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#B85C5C' }} />
                <Text style={{ flex: 1, fontSize: 13, fontWeight: '500', color: C.label }}>{p.name}</Text>
                <Text style={{ fontSize: 12, color: '#B85C5C', fontWeight: '600' }}>GPA {p.gpa}</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Upcoming schedule */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Upcoming</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {upcoming.map((g, i) => (
          <Pressable
            key={g.id}
            style={({ pressed }) => [
              s.navRow,
              i < upcoming.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              pressed && { backgroundColor: C.surfacePressed },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: `hsl(${g.oppHue},40%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 9, fontWeight: '700', color: '#fff' }}>{g.location}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{g.opponent}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{g.date} · {g.time}</Text>
            </View>
            <IconSymbol name="chevron.right" size={12} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* Quick actions */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('plus.circle.fill',  'Add Player')}
        {navRow('chart.bar.fill',    'Depth Chart')}
        {navRow('square.and.arrow.up', 'Export Roster')}
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
