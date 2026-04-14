import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

type Session = {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
};

type LoginEntry = {
  id: string;
  icon: string;
  label: string;
  date: string;
};

const SESSIONS: Session[] = [
  { id: 's1', device: 'iPhone 16 Pro',    location: 'Atlanta, GA',  lastActive: 'Active now', isCurrent: true  },
  { id: 's2', device: 'MacBook Pro 16"',  location: 'Atlanta, GA',  lastActive: '2d ago',     isCurrent: false },
  { id: 's3', device: 'iPhone 14',        location: 'New York, NY', lastActive: '2wk ago',    isCurrent: false },
];

const LOGIN_HISTORY: LoginEntry[] = [
  { id: 'l1', icon: 'iphone',          label: 'iPhone 16 Pro · Atlanta, GA', date: 'Today, 9:14 AM'       },
  { id: 'l2', icon: 'desktopcomputer', label: 'MacBook Pro · Atlanta, GA',   date: 'Yesterday, 11:32 PM'  },
  { id: 'l3', icon: 'iphone',          label: 'iPhone 16 Pro · Atlanta, GA', date: 'Apr 4, 8:01 AM'       },
  { id: 'l4', icon: 'iphone',          label: 'iPhone 14 · New York, NY',    date: 'Mar 28, 3:45 PM'      },
];

export default function SecuritySettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [biometric, setBiometric] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.pillText, { color: C.label }]}>Security</Text>
            </View>
          </View>
          <View style={s.topBarBtn} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* AUTHENTICATION */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>AUTHENTICATION</Text>
        <GlassView tier={1} style={s.card}>
          {/* Row 1: Change Password */}
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="lock.rotation" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Change Password</Text>
            <IconSymbol name="chevron.right" size={13} color={C.muted} />
          </Pressable>

          {/* Row 2: Face ID */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="faceid" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Face ID</Text>
            <Pressable
              onPress={() => { haptic(); setBiometric(v => !v); }}
              style={[s.toggle, { backgroundColor: biometric ? C.label : C.separator }]}
            >
              <View style={[s.toggleThumb, { marginLeft: biometric ? 18 : 0, backgroundColor: C.bg }]} />
            </Pressable>
          </View>

          {/* Row 3: Two-Factor Authentication */}
          <View style={[s.row, s.rowBorderTop, { backgroundColor: C.surface, borderTopColor: C.separator }]}>
            <IconSymbol name="lock.shield.fill" size={18} color={C.secondary} />
            <Text style={[{ flex: 1, fontSize: 15, color: C.label }]}>Two-Factor Authentication</Text>
            <Pressable
              onPress={() => { haptic(); setTwoFactor(v => !v); }}
              style={[s.toggle, { backgroundColor: twoFactor ? C.label : C.separator }]}
            >
              <View style={[s.toggleThumb, { marginLeft: twoFactor ? 18 : 0, backgroundColor: C.bg }]} />
            </Pressable>
          </View>
        </GlassView>

        {/* ACTIVE SESSIONS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>ACTIVE SESSIONS</Text>
        <GlassView tier={1} style={s.card}>
          {SESSIONS.map((session, idx) => (
            <View
              key={session.id}
              style={[
                s.sessionRow,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              {/* Left: device info */}
              <View style={{ flex: 1 }}>
                <Text style={[s.deviceName, { color: C.label }]}>{session.device}</Text>
                <Text style={[s.deviceMeta, { color: C.secondary }]}>
                  {session.location} · {session.lastActive}
                </Text>
              </View>

              {/* Right: current badge or revoke button */}
              {session.isCurrent ? (
                <View style={[s.currentBadge, { backgroundColor: GAIN + '22', borderColor: GAIN }]}>
                  <Text style={[s.currentBadgeText, { color: GAIN }]}>Current</Text>
                </View>
              ) : (
                <Pressable onPress={() => haptic()}>
                  <Text style={[s.revokeText, { color: HEAT }]}>Revoke</Text>
                </Pressable>
              )}
            </View>
          ))}
        </GlassView>

        {/* LOGIN HISTORY */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>LOGIN HISTORY</Text>
        <GlassView tier={1} style={s.card}>
          {LOGIN_HISTORY.map((entry, idx) => (
            <View
              key={entry.id}
              style={[
                s.row,
                { backgroundColor: C.surface },
                idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <IconSymbol name={entry.icon as any} size={16} color={C.secondary} />
              <Text style={[{ flex: 1, fontSize: 13, color: C.label, marginLeft: 10 }]}>{entry.label}</Text>
              <Text style={[{ fontSize: 13, color: C.secondary }]}>{entry.date}</Text>
            </View>
          ))}
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, paddingBottom: 6, height: TOP_BAR_H,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    pillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6, marginTop: 24,
    },

    card: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },

    row: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      paddingHorizontal: 14, paddingVertical: 14,
    },
    rowBorderTop: { borderTopWidth: StyleSheet.hairlineWidth },

    toggle: {
      width: 44, height: 26, borderRadius: 13,
      padding: 2, justifyContent: 'center',
    },
    toggleThumb: {
      width: 22, height: 22, borderRadius: 11,
    },

    sessionRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 14, paddingVertical: 12,
    },
    deviceName: { fontSize: 14, fontWeight: '600' },
    deviceMeta: { fontSize: 12, marginTop: 2 },

    currentBadge: {
      borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3,
      borderWidth: StyleSheet.hairlineWidth,
    },
    currentBadgeText: { fontSize: 11, fontWeight: '700' },

    revokeText: { fontSize: 13, fontWeight: '600' },
  });
}
