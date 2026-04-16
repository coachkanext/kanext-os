/**
 * Community Members — Directory.
 * Pastor: stats, search, filter pills (All/Active/New/At-Risk/Visitors/Leaders), full list + FAB.
 * Member: search + simplified directory.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView,
  TextInput, Alert, Animated,
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

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type MemberStatus = 'active' | 'new' | 'at-risk' | 'visitor' | 'leader';

type Member = {
  id: string;
  initials: string;
  name: string;
  hue: number;
  title?: string;
  ministry: string;
  lastAttended: string;
  status: MemberStatus;
};

// ── Mock Data ──────────────────────────────────────────────────────────────────

const MEMBERS: Member[] = [
  { id: 'm01', initials: 'EK', name: 'Emmanuel Kalejaiye', hue: 210, title: 'Senior Pastor',     ministry: 'Leadership',           lastAttended: 'Apr 13', status: 'leader'  },
  { id: 'm02', initials: 'KP', name: 'Dr. Kunle Pinmiloye',hue: 45,  title: 'Worship Director',  ministry: 'Vineyard Voices',      lastAttended: 'Apr 13', status: 'leader'  },
  { id: 'm03', initials: 'DE', name: 'David Eze',           hue: 160, title: 'Ministry Leader',   ministry: 'T.O.R.C.H. Nation',   lastAttended: 'Apr 13', status: 'leader'  },
  { id: 'm04', initials: 'NJ', name: 'Nia Johnson',         hue: 150, title: 'Deacon',            ministry: 'Sheepfold',           lastAttended: 'Apr 13', status: 'active'  },
  { id: 'm05', initials: 'OA', name: 'Ola Adebayo',         hue: 0,   title: 'Ministry Leader',   ministry: 'Men Wondered At',     lastAttended: 'Apr 6',  status: 'leader'  },
  { id: 'm06', initials: 'FA', name: 'Funke Adebayo',       hue: 340, title: 'Ministry Leader',   ministry: 'Virtuous Women\'s',   lastAttended: 'Apr 6',  status: 'leader'  },
  { id: 'm07', initials: 'DS', name: 'David Santos',        hue: 30,  title: 'Volunteer',         ministry: 'ICC Connect Groups',  lastAttended: 'Apr 13', status: 'active'  },
  { id: 'm08', initials: 'LP', name: 'Lydia Park',          hue: 260, title: 'Ministry Leader',   ministry: 'Fresh Fire Teens',    lastAttended: 'Apr 13', status: 'leader'  },
  { id: 'm09', initials: 'FS', name: 'Faith Stewart',       hue: 180, title: 'Volunteer',         ministry: 'Single Saved Serving',lastAttended: 'Apr 6',  status: 'active'  },
  { id: 'm10', initials: 'GW', name: 'Grace Wilson',        hue: 120,                             ministry: 'Rooted',              lastAttended: 'Mar 30', status: 'active'  },
  { id: 'm11', initials: 'JO', name: 'James Osei',          hue: 60,                              ministry: 'The Harvesters',      lastAttended: 'Apr 13', status: 'active'  },
  { id: 'm12', initials: 'AO', name: 'Adaeze Okonkwo',      hue: 200,                             ministry: 'Rooted',              lastAttended: 'Apr 6',  status: 'new'     },
  { id: 'm13', initials: 'TL', name: 'Terrence Lyles',      hue: 90,                              ministry: 'Men Wondered At',     lastAttended: 'Mar 29', status: 'new'     },
  { id: 'm14', initials: 'BF', name: 'Blessing Femi',       hue: 20,                              ministry: 'Virtuous Women\'s',   lastAttended: 'Mar 22', status: 'new'     },
  { id: 'm15', initials: 'MJ', name: 'Marcus Johnson',      hue: 260,                             ministry: 'Men Wondered At',     lastAttended: 'Feb 8',  status: 'at-risk' },
  { id: 'm16', initials: 'SW', name: 'Sandra Williams',     hue: 0,                               ministry: 'Virtuous Women\'s',   lastAttended: 'Feb 1',  status: 'at-risk' },
  { id: 'm17', initials: 'DP', name: 'David Park',          hue: 180,                             ministry: 'ICC Connect Groups',  lastAttended: 'Jan 25', status: 'at-risk' },
  { id: 'm18', initials: 'KM', name: 'Kevin Mensah',        hue: 120,                             ministry: 'Visitor',             lastAttended: 'Mar 30', status: 'visitor' },
  { id: 'm19', initials: 'RA', name: 'Rachel Adeyemi',      hue: 60,                              ministry: 'Visitor',             lastAttended: 'Mar 23', status: 'visitor' },
];

const FILTER_PILLS = ['All', 'Active', 'New', 'At-Risk', 'Visitors', 'Leaders'] as const;
type FilterPill = typeof FILTER_PILLS[number];

function engagementColor(status: MemberStatus): string {
  if (status === 'at-risk') return HEAT;
  if (status === 'new')     return CAUTION;
  return GAIN;
}

// ── Screen ─────────────────────────────────────────────────────────────────────

export default function CommunityMembersScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [search,       setSearch]  = useState('');
  const [activeFilter, setFilter]  = useState<FilterPill>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let list = MEMBERS;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.ministry.toLowerCase().includes(q));
    }
    switch (activeFilter) {
      case 'Active':   list = list.filter(m => m.status === 'active');  break;
      case 'New':      list = list.filter(m => m.status === 'new');     break;
      case 'At-Risk':  list = list.filter(m => m.status === 'at-risk'); break;
      case 'Visitors': list = list.filter(m => m.status === 'visitor'); break;
      case 'Leaders':  list = list.filter(m => m.status === 'leader');  break;
    }
    return list;
  }, [search, activeFilter]);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
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
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {isPastor ? (
          <>
            {/* Stats */}
            <View style={[s.statsRow, { paddingHorizontal: 16 }]}>
              {[
                { label: 'Total',    value: '1,247', color: C.label  },
                { label: 'Active',   value: '1,089', color: GAIN     },
                { label: 'At-Risk',  value: '94',    color: HEAT     },
                { label: 'New',      value: '15',    color: CAUTION  },
              ].map(stat => (
                <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }]}>
                  <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
                  <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Search */}
            <View style={[s.searchBar, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
              <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
              <TextInput style={[s.searchInput, { color: C.label }]} placeholder="Search members..." placeholderTextColor={C.secondary} value={search} onChangeText={setSearch} />
              {search.length > 0 && <Pressable onPress={() => setSearch('')} hitSlop={8}><IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} /></Pressable>}
            </View>

            {/* Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
              {FILTER_PILLS.map(pill => {
                const active = pill === activeFilter;
                return (
                  <Pressable key={pill} style={[s.filterPill, active ? { backgroundColor: C.label } : { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]} onPress={() => { Haptics.selectionAsync(); setFilter(pill); }}>
                    <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Member list */}
            <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
              {filtered.map((m, idx) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [s.memberRow, pressed && { backgroundColor: C.bg }, idx < filtered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(m.name, `${m.title ? m.title + '\n' : ''}Ministry: ${m.ministry}\nLast attended: ${m.lastAttended}`)}
                >
                  <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                    <Text style={s.avatarText}>{m.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                    <Text style={[s.memberSub, { color: C.secondary }]} numberOfLines={1}>
                      {m.title ? `${m.title} · ` : ''}{m.ministry}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[s.engageDot, { backgroundColor: engagementColor(m.status) }]} />
                    <Text style={[s.lastAttended, { color: C.secondary }]}>{m.lastAttended}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Member view — search + simplified list */}
            <View style={[s.searchBar, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
              <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
              <TextInput style={[s.searchInput, { color: C.label }]} placeholder="Search members..." placeholderTextColor={C.secondary} value={search} onChangeText={setSearch} />
              {search.length > 0 && <Pressable onPress={() => setSearch('')} hitSlop={8}><IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} /></Pressable>}
            </View>
            <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
              {filtered.filter(m => m.status !== 'visitor').map((m, idx, arr) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [s.memberRow, pressed && { backgroundColor: C.bg }, idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(m.name, `Ministry: ${m.ministry}`, [{ text: 'Message', onPress: () => {} }, { text: 'Close', style: 'cancel' }])}
                >
                  <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                    <Text style={s.avatarText}>{m.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                    <Text style={[s.memberSub, { color: C.secondary }]}>{m.ministry}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                </Pressable>
              ))}
            </View>
          </>
        )}

      </ScrollView>

      {/* FAB — Pastor only */}
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

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },

  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statCard:  { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2, textAlign: 'center' },

  searchBar:   { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 8, marginBottom: 12, height: 44 },
  searchInput: { flex: 1, fontSize: 15 },

  filterPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  card:      { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },

  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  memberName:   { fontSize: 15, fontWeight: '600' },
  memberSub:    { fontSize: 12, marginTop: 2 },
  engageDot:    { width: 8, height: 8, borderRadius: 4 },
  lastAttended: { fontSize: 10 },

  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18, shadowRadius: 8, elevation: 6,
  },
});
