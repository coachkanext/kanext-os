/**
 * Volunteers — Community Hub screen. Pastor only.
 * Members are redirected to hub/community via useFocusEffect.
 *
 * Stat cards, volunteer gaps, ministry list, + FAB.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Static mock data ──────────────────────────────────────────────────────────

const VOL_STATS = { total: 47, activeThisMonth: 31, newThisMonth: 3 };

const VOL_GAPS = [
  { id: 'vg1', ministry: "Children's Ministry",  roles: "3 Safety Monitors",        description: 'Background checks required.' },
  { id: 'vg2', ministry: 'Media Ministry',        roles: '1 Sound Engineer',          description: 'Experience with live audio preferred.' },
  { id: 'vg3', ministry: 'Hospitality',           roles: '2 Parking Volunteers',      description: 'Sunday morning availability needed.' },
  { id: 'vg4', ministry: 'Worship',               roles: '1 Keyboard Player',         description: 'Rehearsal Saturdays 10am.' },
];

const MINISTRY_LIST = [
  { id: 'm1', name: "Children's Ministry",  leader: 'Keisha Brown',    count: 9,  nextServing: 'Sun Apr 13' },
  { id: 'm2', name: 'Media Ministry',        leader: 'Marcus Adeyemi', count: 6,  nextServing: 'Sun Apr 13' },
  { id: 'm3', name: 'Hospitality',           leader: 'Jordan Williams', count: 12, nextServing: 'Sun Apr 13' },
  { id: 'm4', name: 'Worship Team',          leader: 'Tanya Smith',     count: 7,  nextServing: 'Sun Apr 13' },
  { id: 'm5', name: 'Prayer Team',           leader: 'Grace Okonkwo',  count: 8,  nextServing: 'Tue Apr 15' },
  { id: 'm6', name: 'Parking & Safety',      leader: 'David Chen',      count: 5,  nextServing: 'Sun Apr 13' },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function VolunteersScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/hub/community' as any);
    }
  }, [isPastor, router]));

  const topBarH        = insets.top + TOP_BAR_H;
  const scrollPaddingTop = topBarH + 16;

  if (!isPastor) return <View style={[s.screen, { backgroundColor: C.bg }]} />;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
      >
        {/* Stat Cards */}
        <View style={s.statRow}>
          <View style={[s.statCard, { backgroundColor: C.surface }]}>
            <Text style={[s.statValue, { color: C.label }]}>{VOL_STATS.total}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Total Volunteers</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: C.surface }]}>
            <Text style={[s.statValue, { color: C.label }]}>{VOL_STATS.activeThisMonth}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>Active This Month</Text>
          </View>
          <View style={[s.statCard, { backgroundColor: C.surface }]}>
            <Text style={[s.statValue, { color: GAIN }]}>{VOL_STATS.newThisMonth}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>New This Month</Text>
          </View>
        </View>

        {/* Volunteer Gaps */}
        <Text style={[s.secHeader, { color: C.label }]}>Volunteer Gaps</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {VOL_GAPS.map((gap, idx) => (
            <View
              key={gap.id}
              style={[
                s.gapRow,
                idx < VOL_GAPS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.gapMinistry, { color: C.label }]}>{gap.ministry}</Text>
                <Text style={[s.gapRoles, { color: C.secondary }]}>{gap.roles}</Text>
              </View>
              <Pressable
                style={[s.findBtn, { borderColor: C.separator }]}
                onPress={() => Alert.alert('Find Volunteer', `Looking for ${gap.roles} for ${gap.ministry}.\n\n${gap.description}`)}
              >
                <Text style={[s.findBtnText, { color: C.label }]}>Find Volunteer</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Ministry List */}
        <Text style={[s.secHeader, { color: C.label }]}>Ministries</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {MINISTRY_LIST.map((min, idx) => (
            <Pressable
              key={min.id}
              style={[
                s.ministryRow,
                idx < MINISTRY_LIST.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => Alert.alert(min.name, `Leader: ${min.leader}\nVolunteers: ${min.count}\nNext Serving: ${min.nextServing}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.ministryName, { color: C.label }]}>{min.name}</Text>
                <Text style={[s.ministryMeta, { color: C.secondary }]}>{min.leader} · {min.count} volunteers</Text>
                <Text style={[s.ministryNext, { color: C.secondary }]}>Next: {min.nextServing}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Top Bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Volunteers</Text>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      {/* FAB */}
      <Pressable
        style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Volunteer', 'Volunteer onboarding coming soon.'); }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen:     { flex: 1 },
    topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    topBarTitle:{ fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },

    statRow:   { flexDirection: 'row', gap: 8, marginBottom: 20 },
    statCard:  { flex: 1, borderRadius: 12, padding: 12, gap: 4 },
    statValue: { fontSize: 22, fontWeight: '800' },
    statLabel: { fontSize: 11 },

    secHeader: { fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },

    card:     { borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    rowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },

    gapRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    gapMinistry: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    gapRoles:    { fontSize: 12 },
    findBtn:     { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    findBtnText: { fontSize: 11, fontWeight: '600' },

    ministryRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    ministryName: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    ministryMeta: { fontSize: 12, marginBottom: 1 },
    ministryNext: { fontSize: 12 },

    fab: {
      position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
    },
  });
}
