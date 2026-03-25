/**
 * Campus Side Panel — shows admin tools or student quick nav.
 * Role determined by RBAC toggle on the campus screen.
 * Uses same navRow pattern as education-hub-panel.tsx.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { MY_HOUSING, CLUBS, CAMPUS_ALERTS } from '@/data/mock-campus-hub';

const NAV_ITEMS = [
  { icon: 'map',              label: 'Map',       tab: 'Map'       },
  { icon: 'figure.walk',      label: 'Life',      tab: 'Life'      },
  { icon: 'list.bullet',      label: 'Resources', tab: 'Resources' },
] as const;

export function CampusPanel() {
  const C = useColors();
  const router = useRouter();
  const styles = useMemo(() => makeStyles(C), [C]);

  // Joined clubs for student section
  const joinedClubs = CLUBS.filter(c => c.joined);

  const navigate = (tab: string) => {
    closeSidePanel();
    setTimeout(() => router.push({ pathname: '/(tabs)/(main)/hub/campus' as any, params: { tab } }), 80);
  };

  return (
    <View style={styles.container}>
      {/* ── Admin Section ── */}
      <>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: `hsl(28,55%,30%)` }]}>
            <Text style={styles.avatarText}>LU</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: C.label }]}>Lincoln University Campus</Text>
            <Text style={[styles.headerSub, { color: C.secondary }]}>Admin</Text>
          </View>
        </View>

        {/* Navigate */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Navigate</Text>
        {NAV_ITEMS.map((item, idx) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx < NAV_ITEMS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigate(item.tab); }}
          >
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Alerts */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Alerts</Text>
        <Pressable style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
          <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#C4872A" />
          <Text style={[styles.navLabel, { color: C.label }]}>Post Alert</Text>
        </Pressable>
        {CAMPUS_ALERTS.map((alert, idx) => (
          <Pressable key={alert.id}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx < CAMPUS_ALERTS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
            <View style={[styles.alertDot, { backgroundColor: alert.color }]} />
            <Text style={[styles.navLabel, { color: C.label }]} numberOfLines={1}>{alert.title}</Text>
          </Pressable>
        ))}

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Queue */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Queue</Text>
        {[
          { icon: 'wrench.and.screwdriver', label: 'Maintenance Requests', badge: '3' },
          { icon: 'person.badge.plus',      label: 'Club Requests',        badge: '2' },
        ].map((item, idx) => (
          <Pressable key={item.label}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx === 0 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
            <IconSymbol name={item.icon as any} size={18} color={C.accent} />
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <View style={[styles.badge, { backgroundColor: C.accent }]}>
              <Text style={styles.badgeTxt}>{item.badge}</Text>
            </View>
          </Pressable>
        ))}

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Settings */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Settings</Text>
        {[
          { icon: 'building.2',         label: 'Building Directory' },
          { icon: 'list.bullet.indent', label: 'Org Types' },
          { icon: 'clock',              label: 'Resource Hours' },
        ].map((item, idx) => (
          <Pressable key={item.label}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx < 2 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </>

      <View style={[styles.divider, { backgroundColor: C.separator }]} />

      {/* ── Student Section ── */}
      <>
        {/* Student header */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: `hsl(28,55%,30%)` }]}>
            <Text style={styles.avatarText}>SK</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerName, { color: C.label }]}>Sammy Kalejaiye</Text>
            <Text style={[styles.headerSub, { color: C.secondary }]}>{MY_HOUSING.building} {MY_HOUSING.room}</Text>
          </View>
        </View>

        {/* Student Navigate */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Navigate</Text>
        {NAV_ITEMS.map((item, idx) => (
          <Pressable
            key={`stu-${item.label}`}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx < NAV_ITEMS.length - 1 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigate(item.tab); }}
          >
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* My Housing */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>My Housing</Text>
        {[
          { label: 'Room',     value: `${MY_HOUSING.building}, ${MY_HOUSING.room}` },
          { label: 'Roommate', value: MY_HOUSING.roommate },
          { label: 'RA',       value: MY_HOUSING.ra },
        ].map((row, idx) => (
          <View key={row.label}
            style={[
              styles.infoRow,
              idx < 2 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}>
            <Text style={[styles.infoLabel, { color: C.secondary }]}>{row.label}</Text>
            <Text style={[styles.infoValue, { color: C.label }]}>{row.value}</Text>
          </View>
        ))}
        <Pressable
          style={({ pressed }) => [styles.navRow, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
          <IconSymbol name="wrench.and.screwdriver" size={18} color={C.accent} />
          <Text style={[styles.navLabel, { color: C.accent }]}>Submit Maintenance Request</Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* My Orgs */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>My Organizations</Text>
        {joinedClubs.slice(0, 2).map((club, idx) => (
          <Pressable key={club.id}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx === 0 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigate('Life'); }}>
            <View style={[styles.clubDot, { backgroundColor: `hsl(${club.hue},50%,35%)` }]} />
            <Text style={[styles.navLabel, { color: C.label }]}>{club.name}</Text>
          </Pressable>
        ))}

        {/* Meal Plan */}
        <View style={[styles.divider, { backgroundColor: C.separator }]} />
        <View style={[styles.navRow, { backgroundColor: C.surfacePressed, borderRadius: 10 }]}>
          <IconSymbol name="fork.knife" size={18} color={C.secondary} />
          <Text style={[styles.navLabel, { color: C.label }]}>Meal Plan</Text>
          <Text style={[styles.infoValue, { color: '#5A8A6E' }]}>12 swipes left</Text>
        </View>

        <View style={[styles.divider, { backgroundColor: C.separator }]} />

        {/* Campus Safety */}
        <Text style={[styles.sectionLabel, { color: C.secondary }]}>Campus Safety</Text>
        {[
          { icon: 'phone.fill', label: 'Emergency: (555) 421-9111', accent: '#B85C5C' },
          { icon: 'person.fill.questionmark', label: 'Request Escort', accent: C.secondary },
        ].map((item, idx) => (
          <Pressable key={item.label}
            style={({ pressed }) => [
              styles.navRow,
              pressed && { backgroundColor: C.surfacePressed },
              idx === 0 && [styles.navRowBorder, { borderBottomColor: C.separator }],
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
            <IconSymbol name={item.icon as any} size={18} color={item.accent} />
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
          </Pressable>
        ))}
      </>

      <View style={{ height: 24 }} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container:    {},
  header:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, marginBottom: 16 },
  avatar:       { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:   { fontSize: 13, fontWeight: '800', color: '#fff' },
  headerInfo:   { flex: 1 },
  headerName:   { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  headerSub:    { fontSize: 12, marginTop: 1 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingHorizontal: 16, marginBottom: 4, marginTop: 4 },
  divider:      { height: StyleSheet.hairlineWidth, marginVertical: 16 },
  navRow:       { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 8 },
  navRowBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  navLabel:     { flex: 1, fontSize: 15 },
  badge:        { minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  badgeTxt:     { fontSize: 11, fontWeight: '700', color: '#fff' },
  alertDot:     { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  clubDot:      { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  infoRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  infoLabel:    { fontSize: 13 },
  infoValue:    { fontSize: 13, fontWeight: '600' },
});
