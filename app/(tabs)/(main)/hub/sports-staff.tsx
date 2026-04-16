import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';

type ScoutStatus = 'Complete' | 'In Progress' | 'Not Started';

const COACHING_STAFF = [
  {
    initials: 'WM',
    name: 'William Middlebrooks',
    title: 'Head Coach',
    responsibilities: 'System design, game ops, staff management',
  },
  {
    initials: 'SK',
    name: 'Sammy Kalejaiye',
    title: 'Head Assistant / Recruiting Coordinator',
    responsibilities: 'Recruiting: National · Scouting: NAIA/USCAA',
  },
  {
    initials: 'TJ',
    name: 'T. Jackson',
    title: 'Graduate Assistant',
    responsibilities: 'Video coordinator, practice film',
  },
  {
    initials: 'MR',
    name: 'Marcus Rivera',
    title: 'Team Manager',
    responsibilities: 'Operations, equipment, travel logistics',
  },
];

const SUPPORT_STAFF = [
  { initials: 'AT', role: 'Athletic Trainer', name: 'Dr. Sarah Chen' },
  { initials: 'SID', role: 'Sports Information', name: 'Kevin Park' },
  { initials: 'EQ', role: 'Equipment Manager', name: 'Rico Santos' },
];

const SCOUTING: { opponent: string; staff: string; status: ScoutStatus }[] = [
  { opponent: 'Menlo College', staff: 'Kalejaiye', status: 'Complete' },
  { opponent: 'Dominican Univ.', staff: 'Jackson', status: 'In Progress' },
  { opponent: 'Cal Maritime', staff: 'Kalejaiye', status: 'Not Started' },
  { opponent: 'Simpson Univ.', staff: 'Jackson', status: 'Not Started' },
];

function scoutStatusColor(status: ScoutStatus, C: ComponentColors) {
  if (status === 'Complete') return GAIN;
  if (status === 'In Progress') return CAUTION;
  return C.secondary;
}

export default function SportsStaff() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (!isHeadCoach) {
        router.replace('/(tabs)/(main)/hub' as any);
      }
    }, [isHeadCoach])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Staff</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* COACHING STAFF */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>COACHING STAFF</Text>
        <View style={s.staffList}>
          {COACHING_STAFF.map((member, i) => (
            <View key={i} style={[s.staffCard, { backgroundColor: C.surface }]}>
              <View style={s.staffCardRow}>
                <View style={s.avatar}>
                  <Text style={s.avatarText}>{member.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.staffName, { color: C.label }]}>{member.name}</Text>
                  <Text style={[s.staffTitle, { color: C.secondary }]}>{member.title}</Text>
                </View>
              </View>
              <Text style={[s.staffResponsibilities, { color: C.secondary }]}>{member.responsibilities}</Text>
              <View style={s.contactRow}>
                <Pressable
                  style={[s.contactBtn, { borderColor: C.separator }]}
                  onPress={() => Alert.alert('Call', `Calling ${member.name}...`)}
                >
                  <IconSymbol name="phone.fill" size={14} color={C.secondary} />
                </Pressable>
                <Pressable
                  style={[s.contactBtn, { borderColor: C.separator }]}
                  onPress={() => Alert.alert('Email', `Emailing ${member.name}...`)}
                >
                  <IconSymbol name="envelope.fill" size={14} color={C.secondary} />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

        {/* SUPPORT STAFF */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>SUPPORT STAFF</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {SUPPORT_STAFF.map((member, i) => (
            <View
              key={i}
              style={[
                s.supportRow,
                i < SUPPORT_STAFF.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={s.supportAvatar}>
                <Text style={[s.supportAvatarText, { color: C.label }]}>{member.initials}</Text>
              </View>
              <Text style={[s.supportRole, { color: C.secondary }]}>{member.role}</Text>
              <Text style={[s.supportName, { color: C.label }]}>{member.name}</Text>
            </View>
          ))}
        </View>

        {/* SCOUTING ASSIGNMENTS */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>SCOUTING ASSIGNMENTS</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {SCOUTING.map((row, i) => (
            <View
              key={i}
              style={[
                s.scoutRow,
                i < SCOUTING.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <Text style={[s.scoutOpponent, { color: C.label }]}>{row.opponent}</Text>
              <Text style={[s.scoutStaff, { color: C.secondary }]}>{row.staff}</Text>
              <View style={[s.scoutBadge, { backgroundColor: scoutStatusColor(row.status, C) === C.secondary ? C.surface : scoutStatusColor(row.status, C) }]}>
                <Text style={[s.scoutBadgeText, { color: scoutStatusColor(row.status, C) === C.secondary ? C.secondary : '#FFFFFF' }]}>
                  {row.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* RECRUITING TERRITORY */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>RECRUITING TERRITORY</Text>
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[s.territoryName, { color: C.label }]}>Kalejaiye</Text>
          <Text style={[s.territoryDetail, { color: C.secondary }]}>National (NAIA/USCAA/JUCO)</Text>
          <Text style={[s.territoryDetail, { color: C.secondary }]}>Bay Area focus</Text>
        </View>
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[s.territoryName, { color: C.label }]}>Jackson</Text>
          <Text style={[s.territoryDetail, { color: C.secondary }]}>Northern California</Text>
          <Text style={[s.territoryDetail, { color: C.secondary }]}>High School focus</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { alignItems: 'flex-end' },
    sectionHeader: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 10, marginTop: 24,
    },
    staffList: { gap: 8, marginHorizontal: 16 },
    staffCard: { borderRadius: 12, padding: 14, gap: 8 },
    staffCardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: '#1A1714',
      alignItems: 'center', justifyContent: 'center',
    },
    avatarText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    staffName: { fontSize: 14, fontWeight: '600' },
    staffTitle: { fontSize: 12, marginTop: 1 },
    staffResponsibilities: { fontSize: 12, lineHeight: 17 },
    contactRow: { flexDirection: 'row', gap: 8 },
    contactBtn: {
      width: 32, height: 32, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth,
      alignItems: 'center', justifyContent: 'center',
    },
    card: { borderRadius: 12, marginHorizontal: 16 },
    supportRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    supportAvatar: {
      width: 30, height: 30, borderRadius: 15,
      backgroundColor: '#1A1714',
      alignItems: 'center', justifyContent: 'center',
    },
    supportAvatarText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
    supportRole: { flex: 1, fontSize: 13 },
    supportName: { fontSize: 13, fontWeight: '500' },
    scoutRow: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 14, paddingVertical: 12,
    },
    scoutOpponent: { flex: 1, fontSize: 13, fontWeight: '500' },
    scoutStaff: { fontSize: 12, minWidth: 72 },
    scoutBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
    scoutBadgeText: { fontSize: 11, fontWeight: '600' },
    infoCard: { borderRadius: 12, marginHorizontal: 16, padding: 14, marginBottom: 8, gap: 2 },
    territoryName: { fontSize: 14, fontWeight: '600' },
    territoryDetail: { fontSize: 13 },
  });
}
