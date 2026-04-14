/**
 * Check-In — Community Hub MANAGE screen. Pastor only.
 * Members are redirected to hub/community via useFocusEffect.
 *
 * Active toggle, check-in methods, today's list, children's section, history.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, Switch, StyleSheet, Animated,
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
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Static mock data ──────────────────────────────────────────────────────────

const TODAYS_CHECKINS = [
  { id: 'ci1', name: 'Jordan Williams',  time: '9:02 AM',  service: 'Sunday 9:00 AM'  },
  { id: 'ci2', name: 'Keisha Brown',     time: '9:08 AM',  service: 'Sunday 9:00 AM'  },
  { id: 'ci3', name: 'Marcus Adeyemi',   time: '9:12 AM',  service: 'Sunday 9:00 AM'  },
  { id: 'ci4', name: 'Tanya Smith',      time: '9:15 AM',  service: 'Sunday 9:00 AM'  },
  { id: 'ci5', name: 'Grace Okonkwo',    time: '9:21 AM',  service: 'Sunday 9:00 AM'  },
  { id: 'ci6', name: 'David Chen',       time: '11:05 AM', service: 'Sunday 11:30 AM' },
];

const CHECKIN_HISTORY = [
  { id: 'h1', date: 'Sun Apr 6',  service: 'Easter Sunday',  attendance: 612 },
  { id: 'h2', date: 'Sun Mar 30', service: 'Sunday Service', attendance: 589 },
  { id: 'h3', date: 'Wed Mar 26', service: 'Bible Study',    attendance: 184 },
  { id: 'h4', date: 'Sun Mar 23', service: 'Sunday Service', attendance: 602 },
];

const CHECKIN_METHODS = [
  { id: 'qr',     icon: 'qrcode',                label: 'QR Code',       description: 'Show QR for self check-in' },
  { id: 'manual', icon: 'person.text.rectangle', label: 'Manual Search', description: 'Search and check in manually' },
  { id: 'kiosk',  icon: 'display',               label: 'Kiosk Mode',    description: 'Full-screen kiosk for lobby' },
];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CheckInScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [checkInOpen, setCheckInOpen] = useState(true);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/hub/community' as any);
    }
  }, [isPastor, router]));

  const handleMethodTap = (method: typeof CHECKIN_METHODS[0]) => {
    if (method.id === 'qr') {
      Alert.alert('QR Code', 'QR check-in overlay coming soon.');
    } else if (method.id === 'manual') {
      Alert.alert('Manual Search', 'Manual attendee search coming soon.');
    } else {
      Alert.alert('Kiosk Mode', 'Kiosk mode coming soon.');
    }
  };

  if (!isPastor) return <View style={[s.screen, { backgroundColor: C.bg }]} />;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Check-In</Text>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
      >
        {/* Active Check-In Toggle */}
        <View style={[s.toggleCard, { backgroundColor: C.surface }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.toggleLabel, { color: C.label }]}>
              Check-In {checkInOpen ? 'Open' : 'Closed'}
            </Text>
            {checkInOpen && (
              <View style={s.liveRow}>
                <View style={[s.liveDot, { backgroundColor: GAIN }]} />
                <Text style={[s.liveCount, { color: GAIN }]}>
                  {TODAYS_CHECKINS.length + 41} checked in today
                </Text>
              </View>
            )}
            {!checkInOpen && (
              <Text style={[s.toggleSub, { color: C.secondary }]}>Enable to allow attendees to check in</Text>
            )}
          </View>
          <Switch
            value={checkInOpen}
            onValueChange={val => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setCheckInOpen(val);
            }}
            trackColor={{ false: C.separator, true: GAIN + '88' }}
            thumbColor={checkInOpen ? GAIN : C.secondary}
          />
        </View>

        {/* Check-In Methods */}
        <Text style={[s.secHeader, { color: C.label }]}>Check-In Methods</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {CHECKIN_METHODS.map((method, idx) => (
            <Pressable
              key={method.id}
              style={[
                s.methodRow,
                idx < CHECKIN_METHODS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
              onPress={() => handleMethodTap(method)}
            >
              <View style={[s.methodIcon, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name={method.icon as any} size={18} color={C.label} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.methodLabel, { color: C.label }]}>{method.label}</Text>
                <Text style={[s.methodDesc, { color: C.secondary }]}>{method.description}</Text>
              </View>
              <IconSymbol name="chevron.right" size={14} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* Today's Check-Ins */}
        <Text style={[s.secHeader, { color: C.label }]}>Today's Check-Ins</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {TODAYS_CHECKINS.map((ci, idx) => (
            <View
              key={ci.id}
              style={[
                s.checkInRow,
                idx < TODAYS_CHECKINS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={[s.avatar, { backgroundColor: C.label }]}>
                <Text style={[s.avatarText, { color: C.bg }]}>
                  {ci.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.ciName, { color: C.label }]}>{ci.name}</Text>
                <Text style={[s.ciService, { color: C.secondary }]}>{ci.service}</Text>
              </View>
              <Text style={[s.ciTime, { color: C.secondary }]}>{ci.time}</Text>
            </View>
          ))}
        </View>

        {/* Children's Check-In */}
        <Text style={[s.secHeader, { color: C.label }]}>Children's Check-In</Text>
        <View style={[s.childrenCard, { backgroundColor: C.surface }]}>
          <Text style={[s.childrenDesc, { color: C.secondary }]}>
            Children's check-in uses security labels and guardian matching. Requires separate activation.
          </Text>
          <Pressable
            style={[s.childrenBtn, { borderColor: C.label }]}
            onPress={() => Alert.alert("Children's Check-In", "Children's check-in module coming soon.")}
          >
            <IconSymbol name="figure.and.child.holdinghands" size={16} color={C.label} />
            <Text style={[s.childrenBtnText, { color: C.label }]}>Open Children's Check-In</Text>
          </Pressable>
        </View>

        {/* Check-In History */}
        <Text style={[s.secHeader, { color: C.label }]}>Check-In History</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {CHECKIN_HISTORY.map((entry, idx) => (
            <View
              key={entry.id}
              style={[
                s.historyRow,
                idx < CHECKIN_HISTORY.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
              ]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.historyService, { color: C.label }]}>{entry.service}</Text>
                <Text style={[s.historyDate, { color: C.secondary }]}>{entry.date}</Text>
              </View>
              <Text style={[s.historyCount, { color: C.label }]}>{entry.attendance}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen:     { flex: 1 },
    topBarOuter:{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    topBarTitle:{ fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },

    toggleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 16, marginBottom: 20 },
    toggleLabel:{ fontSize: 17, fontWeight: '700', marginBottom: 4 },
    toggleSub:  { fontSize: 13 },
    liveRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
    liveDot:    { width: 7, height: 7, borderRadius: 3.5 },
    liveCount:  { fontSize: 13, fontWeight: '600' },

    secHeader: { fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },

    card:     { borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    rowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },

    methodRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
    methodIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    methodLabel:{ fontSize: 14, fontWeight: '600', marginBottom: 2 },
    methodDesc: { fontSize: 12 },

    checkInRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 14 },
    avatar:     { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
    avatarText: { fontSize: 11, fontWeight: '700' },
    ciName:     { fontSize: 13, fontWeight: '600', marginBottom: 2 },
    ciService:  { fontSize: 11 },
    ciTime:     { fontSize: 12, fontWeight: '500' },

    childrenCard:   { borderRadius: 12, padding: 16, marginBottom: 20, gap: 14 },
    childrenDesc:   { fontSize: 13, lineHeight: 20 },
    childrenBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
    childrenBtnText:{ fontSize: 14, fontWeight: '700' },

    historyRow:     { flexDirection: 'row', alignItems: 'center', padding: 14 },
    historyService: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    historyDate:    { fontSize: 12 },
    historyCount:   { fontSize: 18, fontWeight: '700' },
  });
}
