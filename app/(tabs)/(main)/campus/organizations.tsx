/**
 * Campus — Organizations (both roles).
 * President: management view — pending approvals, active orgs list, FAB.
 * Student: My Organizations + Browse & Join.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

type Category = 'Governance' | 'Cultural' | 'Academic' | 'Greek' | 'Athletics' | 'Arts';
type Org = { id: string; name: string; members: number; category: Category; joined: boolean; event?: string };

const ORGS: Org[] = [
  { id: '1', name: 'Student Government Association', members: 42,  category: 'Governance', joined: false, event: 'Town Hall — Apr 22' },
  { id: '2', name: 'Black Student Union',             members: 68,  category: 'Cultural',   joined: true,  event: 'Culture Night — Apr 25' },
  { id: '3', name: 'Pre-Med Society',                 members: 28,  category: 'Academic',   joined: false },
  { id: '4', name: 'Business Network Club',           members: 51,  category: 'Academic',   joined: true,  event: 'Networking Mixer — Apr 30' },
  { id: '5', name: 'Phi Beta Sigma',                  members: 15,  category: 'Greek',      joined: false },
  { id: '6', name: 'International Student Union',     members: 34,  category: 'Cultural',   joined: false, event: 'Cultural Fair — May 3' },
  { id: '7', name: 'Film & Media Club',               members: 22,  category: 'Arts',       joined: false },
  { id: '8', name: 'Basketball Boosters',             members: 90,  category: 'Athletics',  joined: false, event: 'Season Finale — Apr 18' },
];

const PENDING = [
  { name: 'Nursing Students of America', requestedBy: 'Aaliyah Brown',  members: 12, date: 'Apr 14' },
  { name: 'Debate Team',                 requestedBy: 'Marcus Osei',    members: 8,  date: 'Apr 15' },
  { name: 'Social Work Society',         requestedBy: 'Destiny Wilson', members: 6,  date: 'Apr 16' },
];

const CATEGORY_COLORS: Record<Category, string> = {
  Governance: '#1A2E4A',
  Cultural:   '#3A2E1A',
  Academic:   '#1E3A28',
  Greek:      '#3A1A2E',
  Athletics:  '#2E1A1A',
  Arts:       '#1A1A3A',
};

export default function OrganizationsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:campus');
  const isPresident = role === roleCycles[0];

  const [joined, setJoined] = useState<Set<string>>(new Set(ORGS.filter(o => o.joined).map(o => o.id)));

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const myOrgs  = ORGS.filter(o => joined.has(o.id));
  const browseOrgs = ORGS.filter(o => !joined.has(o.id));

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
              <Text style={[s.titleText, { color: C.label }]}>Organizations</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPresident} />
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
        {isPresident ? (
          <View style={{ paddingHorizontal: 16 }}>
            {/* Stats */}
            <View style={[s.statsCard, { backgroundColor: C.surface }]}>
              {[
                { label: 'Active Orgs', value: String(ORGS.length) },
                { label: 'Total Members', value: String(ORGS.reduce((a, o) => a + o.members, 0)) },
                { label: 'Pending', value: String(PENDING.length), color: '#B8943E' },
              ].map((stat, idx, arr) => (
                <View key={stat.label} style={[s.statCol, idx < arr.length - 1 && [s.statBorder, { borderRightColor: C.separator }]]}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: stat.color ?? C.label }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Pending Approvals */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Pending Approval ({PENDING.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {PENDING.map((p, idx) => (
                <View
                  key={p.name}
                  style={[s.row, idx < PENDING.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{p.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Requested by {p.requestedBy} · {p.members} members · {p.date}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      style={[s.actionBtn, { backgroundColor: '#5A8A6E22', borderColor: '#5A8A6E' }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Approved', `${p.name} has been approved.`); }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#5A8A6E' }}>Approve</Text>
                    </Pressable>
                    <Pressable
                      style={[s.actionBtn, { backgroundColor: '#B85C5C22', borderColor: '#B85C5C' }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Declined', `${p.name} has been declined.`); }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: '#B85C5C' }}>Decline</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>

            {/* All Organizations */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>All Organizations ({ORGS.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {ORGS.map((org, idx) => (
                <Pressable
                  key={org.id}
                  style={[s.row, idx < ORGS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(org.name, `Category: ${org.category}\nMembers: ${org.members}${org.event ? `\nUpcoming: ${org.event}` : ''}`)}
                >
                  <View style={[s.orgDot, { backgroundColor: CATEGORY_COLORS[org.category] + '22', borderColor: CATEGORY_COLORS[org.category] }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: CATEGORY_COLORS[org.category] }}>
                      {org.category.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{org.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{org.category} · {org.members} members</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                </Pressable>
              ))}
            </View>
          </View>
        ) : (
          /* ── Student view ── */
          <View style={{ paddingHorizontal: 16 }}>
            {/* My Organizations */}
            {myOrgs.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { color: C.secondary }]}>My Organizations ({myOrgs.length})</Text>
                <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
                  {myOrgs.map((org, idx) => (
                    <View
                      key={org.id}
                      style={[s.row, idx < myOrgs.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                    >
                      <View style={[s.orgDot, { backgroundColor: CATEGORY_COLORS[org.category] + '22', borderColor: CATEGORY_COLORS[org.category] }]}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: CATEGORY_COLORS[org.category] }}>
                          {org.category.slice(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{org.name}</Text>
                        {org.event && <Text style={{ fontSize: 12, color: C.secondary }}>{org.event}</Text>}
                      </View>
                      <Pressable
                        style={[s.actionBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
                        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setJoined(prev => { const n = new Set(prev); n.delete(org.id); return n; }); }}
                      >
                        <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary }}>Leave</Text>
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Browse */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Browse ({browseOrgs.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {browseOrgs.map((org, idx) => (
                <View
                  key={org.id}
                  style={[s.row, idx < browseOrgs.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                >
                  <View style={[s.orgDot, { backgroundColor: CATEGORY_COLORS[org.category] + '22', borderColor: CATEGORY_COLORS[org.category] }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: CATEGORY_COLORS[org.category] }}>
                      {org.category.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{org.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{org.category} · {org.members} members</Text>
                  </View>
                  <Pressable
                    style={[s.actionBtn, { backgroundColor: '#1A171422', borderColor: C.label }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setJoined(prev => new Set([...prev, org.id]));
                    }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.label }}>Join</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB — President only */}
      {isPresident && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 64 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Organization', 'Open the new organization form.'); }}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:        { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },
  statsCard:   { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  statCol:     { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder:  { borderRightWidth: StyleSheet.hairlineWidth },
  orgDot:      { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  actionBtn:   { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  fab:         { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4 },
});
