/**
 * Groups — Community Hub screen.
 * Pastor: filter pills, full groups list with type/status badges, + FAB.
 * Member: My Groups section, Browse Groups with Join button.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Static mock data ──────────────────────────────────────────────────────────

type GroupType   = 'Small Group' | 'Ministry' | 'Bible Study' | 'Class';
type GroupStatus = 'Active' | 'Paused';

const MOCK_GROUPS = [
  { id: 'g1', name: "Men's Fellowship",      leader: 'Pastor Davis',   type: 'Small Group' as GroupType, members: 18, capacity: 25, day: 'Saturdays',  time: '8:00 AM',  status: 'Active' as GroupStatus,  isOpen: true,  myGroup: false },
  { id: 'g2', name: 'Young Adults',           leader: 'Nia Sanders',    type: 'Small Group' as GroupType, members: 22, capacity: 30, day: 'Fridays',    time: '8:00 PM',  status: 'Active' as GroupStatus,  isOpen: true,  myGroup: true  },
  { id: 'g3', name: 'Prayer Warriors',        leader: 'Deacon Williams',type: 'Ministry'   as GroupType, members: 31, capacity: 50, day: 'Tuesdays',   time: '6:00 AM',  status: 'Active' as GroupStatus,  isOpen: true,  myGroup: true  },
  { id: 'g4', name: 'Foundations Class',      leader: 'Elder Johnson',  type: 'Class'      as GroupType, members: 12, capacity: 20, day: 'Sundays',    time: '9:00 AM',  status: 'Active' as GroupStatus,  isOpen: true,  myGroup: false },
  { id: 'g5', name: 'Romans Deep Dive',       leader: 'Dr. Kalejaiye',  type: 'Bible Study'as GroupType, members: 15, capacity: 20, day: 'Wednesdays', time: '7:00 PM',  status: 'Active' as GroupStatus,  isOpen: true,  myGroup: false },
  { id: 'g6', name: "Women's Circle",         leader: 'Minister Grace', type: 'Small Group'as GroupType, members: 24, capacity: 24, day: 'Thursdays',  time: '6:30 PM',  status: 'Paused' as GroupStatus,  isOpen: false, myGroup: false },
];

const FILTER_PILLS = ['All', 'Small Groups', 'Ministries', 'Bible Studies', 'Classes'];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function GroupsScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const [activePill, setActivePill] = useState('All');
  const [joinedIds, setJoinedIds]   = useState<Set<string>>(new Set(['g2', 'g3']));

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const topBarH        = insets.top + TOP_BAR_H;
  const scrollPaddingTop = topBarH + 16;

  // ── Filtering ────────────────────────────────────────────────────────────────

  const filteredGroups = useMemo(() => {
    if (activePill === 'All')         return MOCK_GROUPS;
    if (activePill === 'Small Groups') return MOCK_GROUPS.filter(g => g.type === 'Small Group');
    if (activePill === 'Ministries')  return MOCK_GROUPS.filter(g => g.type === 'Ministry');
    if (activePill === 'Bible Studies') return MOCK_GROUPS.filter(g => g.type === 'Bible Study');
    if (activePill === 'Classes')     return MOCK_GROUPS.filter(g => g.type === 'Class');
    return MOCK_GROUPS;
  }, [activePill]);

  const myGroups     = useMemo(() => MOCK_GROUPS.filter(g => joinedIds.has(g.id)), [joinedIds]);
  const browseGroups = useMemo(() => MOCK_GROUPS.filter(g => !joinedIds.has(g.id) && g.isOpen && g.status === 'Active'), [joinedIds]);

  // ── Pastor View ──────────────────────────────────────────────────────────────

  const renderPastor = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingBottom: insets.bottom + 100 }}
    >
      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 14 }}
      >
        {FILTER_PILLS.map(pill => {
          const active = pill === activePill;
          return (
            <Pressable
              key={pill}
              style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator, borderWidth: 1 }]}
              onPress={() => { Haptics.selectionAsync(); setActivePill(pill); }}
            >
              <Text style={[s.pillText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Groups List */}
      <View style={{ paddingHorizontal: 16 }}>
        {filteredGroups.map(group => {
          const fillPct = group.members / group.capacity;
          return (
            <Pressable
              key={group.id}
              style={[s.groupCard, { backgroundColor: C.surface }]}
              onPress={() => Alert.alert(group.name, `Leader: ${group.leader}\nMembers: ${group.members}/${group.capacity}\nMeets: ${group.day} at ${group.time}`)}
            >
              <View style={s.groupTop}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.groupName, { color: C.label }]}>{group.name}</Text>
                  <Text style={[s.groupLeader, { color: C.secondary }]}>{group.leader}</Text>
                  <Text style={[s.groupSchedule, { color: C.secondary }]}>{group.day} · {group.time}</Text>
                </View>
                <View style={s.groupBadges}>
                  <View style={[s.typeBadge, { backgroundColor: C.surfacePressed }]}>
                    <Text style={[s.typeBadgeText, { color: C.secondary }]}>{group.type}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: group.status === 'Active' ? GAIN + '22' : C.surfacePressed }]}>
                    <Text style={[s.statusBadgeText, { color: group.status === 'Active' ? GAIN : C.secondary }]}>{group.status}</Text>
                  </View>
                </View>
              </View>
              <View style={s.groupFooter}>
                <Text style={[s.memberCount, { color: C.secondary }]}>{group.members}/{group.capacity} members</Text>
                <View style={[s.fillTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.fillBar, { width: `${Math.min(100, fillPct * 100)}%` as any, backgroundColor: fillPct >= 1 ? HEAT : C.label }]} />
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );

  // ── Member View ──────────────────────────────────────────────────────────────

  const renderMember = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
    >
      {/* My Groups */}
      <Text style={[s.secHeader, { color: C.label }]}>My Groups</Text>
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {myGroups.length === 0 ? (
          <View style={s.emptyRow}>
            <Text style={[s.emptyText, { color: C.secondary }]}>You haven't joined any groups yet.</Text>
          </View>
        ) : (
          myGroups.map((group, idx) => (
            <View
              key={group.id}
              style={[
                s.myGroupRow,
                idx < myGroups.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.groupName, { color: C.label }]}>{group.name}</Text>
                <Text style={[s.groupLeader, { color: C.secondary }]}>{group.leader}</Text>
                <Text style={[s.groupSchedule, { color: C.secondary }]}>
                  Next: {group.day} · {group.time}
                </Text>
              </View>
              <Pressable
                style={[s.viewBtn, { borderColor: C.separator }]}
                onPress={() => Alert.alert(group.name, `Leader: ${group.leader}\nNext meeting: ${group.day} at ${group.time}`)}
              >
                <Text style={[s.viewBtnText, { color: C.label }]}>View</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>

      {/* Browse Groups */}
      <Text style={[s.secHeader, { color: C.label }]}>Browse Groups</Text>
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {browseGroups.length === 0 ? (
          <View style={s.emptyRow}>
            <Text style={[s.emptyText, { color: C.secondary }]}>No open groups available right now.</Text>
          </View>
        ) : (
          browseGroups.map((group, idx) => {
            const spotsLeft = group.capacity - group.members;
            return (
              <View
                key={group.id}
                style={[
                  s.browseRow,
                  idx < browseGroups.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.groupName, { color: C.label }]}>{group.name}</Text>
                  <Text style={[s.groupLeader, { color: C.secondary }]}>{group.leader} · {group.day}</Text>
                  <Text style={[s.groupSchedule, { color: C.secondary }]}>{spotsLeft} spot{spotsLeft !== 1 ? 's' : ''} open</Text>
                </View>
                <Pressable
                  style={[s.joinBtn, { backgroundColor: C.label }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setJoinedIds(prev => new Set([...prev, group.id]));
                  }}
                >
                  <Text style={[s.joinBtnText, { color: C.bg }]}>Join</Text>
                </Pressable>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {isPastor ? renderPastor() : renderMember()}

      {/* Top Bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Groups</Text>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      {/* FAB — Pastor only */}
      {isPastor && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Group', 'Group creation coming soon.'); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}
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

    pill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    pillText: { fontSize: 13, fontWeight: '500' },

    groupCard:    { borderRadius: 12, padding: 14, marginBottom: 10, gap: 10 },
    groupTop:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    groupName:    { fontSize: 15, fontWeight: '700', marginBottom: 2 },
    groupLeader:  { fontSize: 12, marginBottom: 2 },
    groupSchedule:{ fontSize: 12 },
    groupBadges:  { gap: 4, alignItems: 'flex-end' },
    typeBadge:    { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    typeBadgeText:{ fontSize: 10, fontWeight: '600' },
    statusBadge:  { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
    statusBadgeText:{ fontSize: 10, fontWeight: '600' },
    groupFooter:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
    memberCount:  { fontSize: 11, width: 110 },
    fillTrack:    { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden' },
    fillBar:      { height: 3, borderRadius: 2 },

    secHeader: { fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },

    card:      { borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

    emptyRow:  { padding: 16 },
    emptyText: { fontSize: 14 },

    myGroupRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    viewBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
    viewBtnText: { fontSize: 12, fontWeight: '600' },

    browseRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    joinBtn:   { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
    joinBtnText:{ fontSize: 12, fontWeight: '700' },

    fab: {
      position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
    },
  });
}
