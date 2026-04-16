/**
 * Community Members — Ministries.
 * Pastor: all ministries with health indicators, filter pills, manage.
 * Member: My Ministries + Browse Ministries.
 * Two access points (Members sidebar + Dashboard sidebar) — same screen.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
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
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type MinistryHealth = 'healthy' | 'attention' | 'inactive';

type Ministry = {
  id: string;
  initials: string;
  hue: number;
  name: string;
  leader: string;
  memberCount: number;
  nextMeeting: string;
  health: MinistryHealth;
  description: string;
  category: 'Fellowship' | 'Worship' | 'Youth' | 'Service';
  isMine?: boolean;
};

const MINISTRIES: Ministry[] = [
  { id: 'mn1', initials: 'MW', hue: 210, name: 'Men Wondered At Fellowship',   leader: 'Ola Adebayo',          memberCount: 48, nextMeeting: 'Sat Apr 19, 9am',  health: 'healthy',   description: 'Men\'s discipleship and fellowship group meeting weekly.', category: 'Fellowship' },
  { id: 'mn2', initials: 'VW', hue: 330, name: 'Virtuous Women\'s Ministry',   leader: 'Funke Adebayo',        memberCount: 62, nextMeeting: 'Sat Apr 19, 10am', health: 'healthy',   description: 'Women\'s empowerment through faith and fellowship.', category: 'Fellowship' },
  { id: 'mn3', initials: 'TR', hue: 160, name: 'T.O.R.C.H. Nation',            leader: 'David Eze',            memberCount: 31, nextMeeting: 'Fri Apr 18, 7pm',  health: 'healthy',   description: 'Youth discipleship movement focused on purpose and identity.', category: 'Youth', isMine: true },
  { id: 'mn4', initials: 'SF', hue: 45,  name: 'Sheepfold',                    leader: 'Nia Johnson',          memberCount: 24, nextMeeting: 'Sun Apr 20, 1pm',  health: 'attention', description: 'Child safety and nursery ministry. Requires background check.', category: 'Service' },
  { id: 'mn5', initials: 'FF', hue: 20,  name: 'Fresh Fire Teens Church',      leader: 'Lydia Park',           memberCount: 55, nextMeeting: 'Sun Apr 20, 10am', health: 'healthy',   description: 'Dynamic teen church experience every Sunday.', category: 'Youth' },
  { id: 'mn6', initials: 'RT', hue: 140, name: 'Rooted',                       leader: 'Grace Wilson',         memberCount: 38, nextMeeting: 'Wed Apr 16, 7pm',  health: 'healthy',   description: 'Foundation course for new and growing believers.', category: 'Fellowship', isMine: true },
  { id: 'mn7', initials: 'CG', hue: 200, name: 'ICC Connect Groups',           leader: 'David Santos',         memberCount: 87, nextMeeting: 'Various',          health: 'healthy',   description: 'Small groups throughout the city for community and growth.', category: 'Fellowship' },
  { id: 'mn8', initials: 'VV', hue: 60,  name: 'Vineyard Voices',              leader: 'Dr. Kunle Pinmiloye',  memberCount: 29, nextMeeting: 'Wed Apr 16, 6pm',  health: 'attention', description: 'Worship and creative arts ministry.', category: 'Worship' },
  { id: 'mn9', initials: 'SS', hue: 270, name: 'Single Saved Serving',         leader: 'Faith Stewart',        memberCount: 19, nextMeeting: 'Fri Apr 18, 8pm',  health: 'inactive',  description: 'Ministry for single adults — community, growth, service.', category: 'Fellowship' },
  { id: 'mn10',initials: 'TH', hue: 100, name: 'The Harvesters',               leader: 'James Osei',           memberCount: 33, nextMeeting: 'Sat Apr 19, 8am',  health: 'healthy',   description: 'Outreach and evangelism team for community impact.', category: 'Service' },
];

const PASTOR_FILTERS = ['All', 'Active', 'Needs Attention'] as const;
const MEMBER_FILTERS = ['All', 'Fellowship', 'Worship', 'Youth', 'Service'] as const;

function healthColor(h: MinistryHealth) {
  if (h === 'healthy')   return GAIN;
  if (h === 'attention') return CAUTION;
  return HEAT;
}

function healthLabel(h: MinistryHealth) {
  if (h === 'healthy')   return 'Healthy';
  if (h === 'attention') return 'Needs Attention';
  return 'Inactive';
}

export default function MinistriesScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [filter, setFilter] = useState('All');

  useFocusEffect(useCallback(() => {
    resetFooter();
    setFilter('All');
  }, []));

  const pastorFiltered = useMemo(() => {
    if (filter === 'Active')         return MINISTRIES.filter(m => m.health === 'healthy');
    if (filter === 'Needs Attention') return MINISTRIES.filter(m => m.health !== 'healthy');
    return MINISTRIES;
  }, [filter]);

  const memberFiltered = useMemo(() => {
    if (filter === 'All') return MINISTRIES;
    return MINISTRIES.filter(m => m.category === filter);
  }, [filter]);

  const myMinistries  = MINISTRIES.filter(m => m.isMine);
  const browseList    = memberFiltered.filter(m => !m.isMine);

  const filters = isPastor ? PASTOR_FILTERS : MEMBER_FILTERS;

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
              <Text style={[s.titleText, { color: C.label }]}>Ministries</Text>
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
      >

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {filters.map(f => {
            const active = f === filter;
            return (
              <Pressable key={f} style={[s.filterPill, active ? { backgroundColor: C.label } : { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]} onPress={() => { Haptics.selectionAsync(); setFilter(f); }}>
                <Text style={[s.filterPillText, { color: active ? C.bg : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {isPastor ? (
          <>
            {/* Pastor: all ministries */}
            <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
              {pastorFiltered.map((m, idx) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [s.ministryRow, pressed && { backgroundColor: C.bg }, idx < pastorFiltered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(m.name, `Leader: ${m.leader}\n${m.memberCount} members\nNext: ${m.nextMeeting}\n\n${m.description}`, [{ text: 'Edit', onPress: () => {} }, { text: 'Close', style: 'cancel' }])}
                >
                  <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                    <Text style={s.avatarText}>{m.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.ministryName, { color: C.label }]} numberOfLines={1}>{m.name}</Text>
                    <Text style={[s.ministrySub, { color: C.secondary }]}>{m.leader} · {m.memberCount} members</Text>
                    <Text style={[s.ministrySub, { color: C.secondary }]}>{m.nextMeeting}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[s.healthDot, { backgroundColor: healthColor(m.health) }]} />
                    <Text style={[s.healthLabel, { color: healthColor(m.health) }]}>{healthLabel(m.health)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* Create Ministry */}
            <Pressable
              style={[s.createBtn, { backgroundColor: C.surface, marginHorizontal: 16 }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Create Ministry', 'Set up a new ministry?', [{ text: 'Cancel' }, { text: 'Create' }]); }}
            >
              <IconSymbol name="plus" size={16} color={C.label} />
              <Text style={[s.createBtnText, { color: C.label }]}>Create Ministry</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Member: My Ministries */}
            {myMinistries.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { color: C.secondary }]}>My Ministries</Text>
                <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 24 }]}>
                  {myMinistries.map((m, idx) => (
                    <Pressable
                      key={m.id}
                      style={({ pressed }) => [s.ministryRow, pressed && { backgroundColor: C.bg }, idx < myMinistries.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                      onPress={() => Alert.alert(m.name, `Leader: ${m.leader}\nNext: ${m.nextMeeting}\n\n${m.description}`, [{ text: 'Group Chat', onPress: () => {} }, { text: 'Close', style: 'cancel' }])}
                    >
                      <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                        <Text style={s.avatarText}>{m.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.ministryName, { color: C.label }]} numberOfLines={1}>{m.name}</Text>
                        <Text style={[s.ministrySub, { color: C.secondary }]}>{m.leader}</Text>
                        <Text style={[s.ministrySub, { color: C.secondary }]}>{m.nextMeeting}</Text>
                      </View>
                      <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                    </Pressable>
                  ))}
                </View>
              </>
            )}

            {/* Member: Browse */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Browse Ministries</Text>
            <View style={[s.card, { backgroundColor: C.surface, marginHorizontal: 16 }]}>
              {browseList.map((m, idx) => (
                <Pressable
                  key={m.id}
                  style={({ pressed }) => [s.ministryRow, pressed && { backgroundColor: C.bg }, idx < browseList.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(m.name, `Leader: ${m.leader}\n${m.memberCount} members\nNext: ${m.nextMeeting}\n\n${m.description}`, [{ text: 'Join', onPress: () => {} }, { text: 'Close', style: 'cancel' }])}
                >
                  <View style={[s.avatar, { backgroundColor: `hsl(${m.hue},42%,32%)` }]}>
                    <Text style={s.avatarText}>{m.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.ministryName, { color: C.label }]} numberOfLines={1}>{m.name}</Text>
                    <Text style={[s.ministrySub, { color: C.secondary }]}>{m.leader} · {m.memberCount} members</Text>
                    <Text style={[s.ministrySub, { color: C.secondary }]}>{m.nextMeeting}</Text>
                  </View>
                  <Pressable
                    style={[s.joinBtn, { backgroundColor: C.label }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Join Ministry', `Request to join ${m.name}?`, [{ text: 'Cancel' }, { text: 'Join' }]); }}
                  >
                    <Text style={[s.joinBtnText, { color: C.bg }]}>Join</Text>
                  </Pressable>
                </Pressable>
              ))}
            </View>
          </>
        )}

      </ScrollView>
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

  filterPill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 8 },

  card:        { borderRadius: 14, overflow: 'hidden', marginBottom: 16 },
  ministryRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },

  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  ministryName: { fontSize: 14, fontWeight: '600' },
  ministrySub:  { fontSize: 11, marginTop: 1 },
  healthDot:    { width: 8, height: 8, borderRadius: 4 },
  healthLabel:  { fontSize: 9, fontWeight: '600' },

  joinBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexShrink: 0 },
  joinBtnText: { fontSize: 12, fontWeight: '700' },

  createBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, padding: 14 },
  createBtnText: { fontSize: 15, fontWeight: '600' },
});
