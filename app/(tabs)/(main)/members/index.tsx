/**
 * Community Members — Directory page.
 * Pastor: stat cards, new members, at-risk, visitor follow-up, search, filter pills, full member list, FAB.
 * Member: search + simplified member list.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ──────────────────────────────────────────────────────────────────

const GAIN   = '#5A8A6E';
const HEAT   = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H = 52;

const FILTER_PILLS = ['All', 'Admin', 'Staff', 'Leaders', 'Volunteers', 'Members'] as const;

// ── Mock data ─────────────────────────────────────────────────────────────────

const NEW_MEMBERS = [
  { id: 'nm1', initials: 'AO', name: 'Adaeze Okonkwo',   joinDate: 'Mar 28',  hue: 210 },
  { id: 'nm2', initials: 'TL', name: 'Terrence Lyles',   joinDate: 'Mar 22',  hue: 150 },
  { id: 'nm3', initials: 'BF', name: 'Blessing Femi',    joinDate: 'Mar 15',  hue: 30  },
];

const AT_RISK_MEMBERS = [
  { id: 'ar1', initials: 'MJ', name: 'Marcus Johnson',   lastActive: 'Feb 12', hue: 260 },
  { id: 'ar2', initials: 'SW', name: 'Sandra Williams',  lastActive: 'Feb 5',  hue: 0   },
  { id: 'ar3', initials: 'DP', name: 'David Park',       lastActive: 'Jan 28', hue: 180 },
];

const VISITOR_FOLLOWUP = [
  { id: 'vf1', initials: 'KM', name: 'Kevin Mensah',     visitDate: 'Mar 30', hue: 120 },
  { id: 'vf2', initials: 'RA', name: 'Rachel Adeyemi',   visitDate: 'Mar 23', hue: 60  },
];

const MEMBER_LIST = [
  { id: 'm1',  initials: 'EK', name: 'Emmanuel Kalejaiye', role: 'Admin',     ministry: 'Senior Pastor',  lastActive: '2026-04-08', hue: 210 },
  { id: 'm2',  initials: 'NJ', name: 'Nia Johnson',         role: 'Staff',     ministry: 'Worship',        lastActive: '2026-04-09', hue: 150 },
  { id: 'm3',  initials: 'DS', name: 'David Santos',        role: 'Staff',     ministry: 'Deacons',        lastActive: '2026-04-07', hue: 30  },
  { id: 'm4',  initials: 'LP', name: 'Lydia Park',          role: 'Leader',    ministry: 'Youth Ministry', lastActive: '2026-04-01', hue: 260 },
  { id: 'm5',  initials: 'OA', name: 'Ola Adebayo',         role: 'Leader',    ministry: 'Hospitality',    lastActive: '2026-03-30', hue: 0   },
  { id: 'm6',  initials: 'FS', name: 'Faith Stewart',       role: 'Volunteer', ministry: 'Media Ministry', lastActive: '2026-04-09', hue: 180 },
  { id: 'm7',  initials: 'GW', name: 'Grace Wilson',        role: 'Member',    ministry: 'Prayer Ministry',lastActive: '2026-03-15', hue: 120 },
  { id: 'm8',  initials: 'JO', name: 'James Osei',          role: 'Member',    ministry: "Women's Ministry",lastActive: '2026-04-10', hue: 60  },
];

function isActiveRecent(lastActive: string): boolean {
  // active in last 7 days relative to 2026-04-10
  return lastActive >= '2026-04-03';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function CommunityMembersScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [search,      setSearch]      = useState('');
  const [activeFilter, setFilter]     = useState<string>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredMembers = useMemo(() => {
    let list = MEMBER_LIST;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.ministry.toLowerCase().includes(q));
    }
    if (activeFilter !== 'All') {
      list = list.filter(m => m.role === activeFilter.slice(0, -1) || m.role === activeFilter);
    }
    return list;
  }, [search, activeFilter]);

  const topBarH = insets.top + TOP_BAR_H;

  // ── Pastor View ────────────────────────────────────────────────────────────

  function renderPastorView() {
    return (
      <>
        {/* Stat cards */}
        <View style={s.statsRow}>
          {[
            { label: 'Total Members', value: '247',  color: C.label   },
            { label: 'Active',        value: '198',  color: GAIN      },
            { label: 'At-Risk',       value: '23',   color: HEAT      },
            { label: 'New This Month',value: '8',    color: CAUTION   },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }]}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* New Members */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>New Members</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {NEW_MEMBERS.map((m, idx) => (
            <View
              key={m.id}
              style={[
                s.alertRow,
                idx < NEW_MEMBERS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                <Text style={s.avatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.alertSub, { color: C.secondary }]}>Joined {m.joinDate}</Text>
              </View>
              <Pressable
                style={[s.actionBtn, { backgroundColor: C.label }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Welcome', `Send a welcome message to ${m.name}?`, [{ text: 'Cancel' }, { text: 'Send' }]); }}
              >
                <Text style={[s.actionBtnText, { color: C.bg }]}>Welcome</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* At-Risk */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>At-Risk</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {AT_RISK_MEMBERS.map((m, idx) => (
            <View
              key={m.id}
              style={[
                s.alertRow,
                idx < AT_RISK_MEMBERS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                <Text style={s.avatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.alertSub, { color: HEAT }]}>Last active {m.lastActive}</Text>
              </View>
              <Pressable
                style={[s.actionBtn, { backgroundColor: C.label }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Reach Out', `Start a conversation with ${m.name}?`, [{ text: 'Cancel' }, { text: 'Message' }]); }}
              >
                <Text style={[s.actionBtnText, { color: C.bg }]}>Reach Out</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Visitor Follow-Up */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Visitor Follow-Up</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {VISITOR_FOLLOWUP.map((v, idx) => (
            <View
              key={v.id}
              style={[
                s.alertRow,
                idx < VISITOR_FOLLOWUP.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={[s.avatar, { backgroundColor: `hsl(${v.hue},42%,32%)` }]}>
                <Text style={s.avatarText}>{v.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.alertName, { color: C.label }]}>{v.name}</Text>
                <Text style={[s.alertSub, { color: C.secondary }]}>Visited {v.visitDate}</Text>
              </View>
              <Pressable
                style={[s.actionBtn, { backgroundColor: C.label }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Invite', `Invite ${v.name} to a group or service?`, [{ text: 'Cancel' }, { text: 'Invite' }]); }}
              >
                <Text style={[s.actionBtnText, { color: C.bg }]}>Invite</Text>
              </Pressable>
            </View>
          ))}
        </View>

        {/* Divider */}
        <View style={[s.divider, { backgroundColor: C.separator }]} />

        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search members..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 0 }}>
          {FILTER_PILLS.map(pill => {
            const active = pill === activeFilter;
            return (
              <Pressable
                key={pill}
                style={[s.filterPill, active ? { backgroundColor: C.label } : { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]}
                onPress={() => { Haptics.selectionAsync(); setFilter(pill); }}
              >
                <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Member list */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {filteredMembers.map((m, idx) => {
            const active = isActiveRecent(m.lastActive);
            return (
              <Pressable
                key={m.id}
                style={({ pressed }) => [
                  s.memberRow,
                  pressed && { backgroundColor: C.bg },
                  idx < filteredMembers.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                ]}
                onPress={() => Alert.alert(m.name, `Role: ${m.role}\nMinistry: ${m.ministry}\nLast active: ${m.lastActive}`)}
              >
                <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                  <Text style={s.avatarText}>{m.initials}</Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <View style={[s.roleBadge, { backgroundColor: C.separator }]}>
                      <Text style={[s.roleBadgeText, { color: C.label }]}>{m.role}</Text>
                    </View>
                    <Text style={[s.memberMinistry, { color: C.secondary }]}>{m.ministry}</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {active && <View style={[s.activeDot, { backgroundColor: GAIN }]} />}
                  <Text style={[s.lastActive, { color: C.secondary }]}>{m.lastActive.slice(5).replace('-', '/')}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={{ height: 100 }} />
      </>
    );
  }

  // ── Member View ────────────────────────────────────────────────────────────

  function renderMemberView() {
    return (
      <>
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search directory..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        <View style={[s.card, { backgroundColor: C.surface }]}>
          {filteredMembers.map((m, idx) => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                s.memberRow,
                pressed && { backgroundColor: C.bg },
                idx < filteredMembers.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => Alert.alert(m.name, `Ministry: ${m.ministry}`, [
                { text: 'Message', onPress: () => {} },
                { text: 'Close', style: 'cancel' },
              ])}
            >
              <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                <Text style={s.avatarText}>{m.initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.memberMinistry, { color: C.secondary }]}>{m.ministry}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        <View style={{ height: 100 }} />
      </>
    );
  }

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: topBarH + 12, paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isPastor ? renderPastorView() : renderMemberView()}
      </ScrollView>

      {/* Top bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Directory</Text>
            </View>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </View>

      {/* + FAB (Pastor only) */}
      {isPastor && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Member', 'Open member intake form?', [{ text: 'Cancel' }, { text: 'Open' }]); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarWrap:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },

  statsRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  statCard:   { flex: 1, minWidth: '44%', borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue:  { fontSize: 22, fontWeight: '800' },
  statLabel:  { fontSize: 11, marginTop: 3, textAlign: 'center' },

  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8, marginTop: 4 },
  divider:      { height: StyleSheet.hairlineWidth, marginVertical: 20 },

  card:      { borderRadius: 14, marginBottom: 16, overflow: 'hidden' },
  alertRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  alertName: { fontSize: 14, fontWeight: '600' },
  alertSub:  { fontSize: 12, marginTop: 2 },

  actionBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontWeight: '700' },

  searchBar:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 8, marginBottom: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 15 },

  filterPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  memberRow:     { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  memberName:    { fontSize: 15, fontWeight: '600' },
  memberMinistry:{ fontSize: 12, marginTop: 2 },
  roleBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  roleBadgeText: { fontSize: 10, fontWeight: '600' },
  activeDot:     { width: 7, height: 7, borderRadius: 4 },
  lastActive:    { fontSize: 10 },

  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
