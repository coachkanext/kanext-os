/**
 * Payroll — Pastor MANAGE: staff list, run payroll, payroll history, YTD total.
 * Pastor only.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const GAIN = '#5A8A6E';


interface StaffMember {
  name: string;
  role: string;
  salary: string;
  frequency: string;
  lastPaid: string;
  nextPay: string;
}

const STAFF: StaffMember[] = [
  {
    name: 'Rev. Michael Thompson',
    role: 'Lead Pastor',
    salary: '$4,500/mo',
    frequency: 'Monthly',
    lastPaid: 'Apr 1, 2026',
    nextPay: 'May 1, 2026',
  },
  {
    name: 'Pastor Sarah Williams',
    role: 'Associate Pastor',
    salary: '$3,200/mo',
    frequency: 'Monthly',
    lastPaid: 'Apr 1, 2026',
    nextPay: 'May 1, 2026',
  },
  {
    name: 'Marcus Davis',
    role: 'Worship Director',
    salary: '$2,800/mo',
    frequency: 'Monthly',
    lastPaid: 'Apr 1, 2026',
    nextPay: 'May 1, 2026',
  },
  {
    name: 'Priscilla Chen',
    role: 'Admin',
    salary: '$2,000/mo',
    frequency: 'Monthly',
    lastPaid: 'Apr 1, 2026',
    nextPay: 'May 1, 2026',
  },
];

const PAYROLL_HISTORY = [
  { date: 'Apr 1, 2026',  total: '$12,500', staffCount: 4 },
  { date: 'Mar 1, 2026',  total: '$12,500', staffCount: 4 },
  { date: 'Feb 1, 2026',  total: '$12,200', staffCount: 4 },
];

const YTD_TOTAL = '$43,200';

export default function PayrollScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaypay');
  const isPastor = role === roleCycles[0];

  const TOP_BAR_H = insets.top + 54;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const runPayroll = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Run Payroll',
      'Preview for May 2026:\n\n4 staff members\nTotal: $12,500\n\nProceed?',
      [
        { text: 'Confirm & Send', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topTitle, { color: C.label }]}>Payroll</Text>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: TOP_BAR_H + 12,
          paddingBottom: insets.bottom + 80,
          gap: 16,
          paddingHorizontal: 16,
        }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
      >
        {/* YTD Banner */}
        <View style={[s.ytdCard, { backgroundColor: C.surface }]}>
          <Text style={[s.ytdLabel, { color: C.secondary }]}>Total Payroll YTD 2026</Text>
          <Text style={[s.ytdAmount, { color: GAIN }]}>{YTD_TOTAL}</Text>
        </View>

        {/* Staff List */}
        <Text style={[s.sectionTitle, { color: C.label }]}>Staff</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {STAFF.map((member, idx) => (
            <Pressable
              key={member.name}
              style={[
                s.staffRow,
                idx < STAFF.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(
                  member.name,
                  `Role: ${member.role}\nSalary: ${member.salary}\nFrequency: ${member.frequency}\nLast Paid: ${member.lastPaid}\nNext Pay: ${member.nextPay}`,
                  [
                    { text: 'View Pay History', onPress: () => {} },
                    { text: 'Close', style: 'cancel' },
                  ],
                );
              }}
            >
              <View style={s.staffInitialsCircle}>
                <Text style={[s.staffInitials, { color: C.bg }]}>
                  {member.name.split(' ').filter((_, i) => i === 0 || i === member.name.split(' ').length - 1).map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.staffName, { color: C.label }]}>{member.name}</Text>
                <Text style={[s.staffRole, { color: C.secondary }]}>{member.role} · {member.frequency}</Text>
                <View style={s.staffPayRow}>
                  <Text style={[s.staffSalary, { color: C.label }]}>{member.salary}</Text>
                  <Text style={[s.staffLastPaid, { color: GAIN }]}>Paid {member.lastPaid}</Text>
                </View>
                <Text style={[s.staffNextPay, { color: C.secondary }]}>Next: {member.nextPay}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Run Payroll Button */}
        <Pressable style={[s.runPayrollBtn, { backgroundColor: C.label }]} onPress={runPayroll}>
          <Text style={[s.runPayrollText, { color: C.bg }]}>Run Payroll</Text>
        </Pressable>

        {/* Payroll History */}
        <Text style={[s.sectionTitle, { color: C.label }]}>Payroll History</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {PAYROLL_HISTORY.map((entry, idx) => (
            <Pressable
              key={entry.date}
              style={[
                s.historyRow,
                idx < PAYROLL_HISTORY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert(entry.date, `Total: ${entry.total}\nStaff: ${entry.staffCount}`);
              }}
            >
              <View style={{ flex: 1 }}>
                <Text style={[s.historyDate, { color: C.label }]}>{entry.date}</Text>
                <Text style={[s.historySub, { color: C.secondary }]}>{entry.staffCount} staff</Text>
              </View>
              <Text style={[s.historyAmount, { color: C.label }]}>{entry.total}</Text>
              <Text style={[s.historyView, { color: C.secondary }]}>View</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    topTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', paddingBottom: 2 },
    rolePillWrap: { width: 44 + 32, alignItems: 'flex-end', justifyContent: 'center' },

    ytdCard:   { borderRadius: 12, padding: 16, alignItems: 'center', gap: 4 },
    ytdLabel:  { fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
    ytdAmount: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },

    sectionTitle: { fontSize: 16, fontWeight: '700' },

    card: { borderRadius: 12, overflow: 'hidden' },

    staffRow: { flexDirection: 'row', gap: 12, padding: 14, alignItems: 'flex-start' },
    staffInitialsCircle: {
      width: 40, height: 40, borderRadius: 20,
      backgroundColor: '#1A1714',
      alignItems: 'center', justifyContent: 'center',
    },
    staffInitials: { fontSize: 13, fontWeight: '700' },
    staffName:    { fontSize: 14, fontWeight: '700' },
    staffRole:    { fontSize: 12 },
    staffPayRow:  { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 2 },
    staffSalary:  { fontSize: 13, fontWeight: '600' },
    staffLastPaid:{ fontSize: 12, fontWeight: '500' },
    staffNextPay: { fontSize: 12 },

    runPayrollBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
    runPayrollText:{ fontSize: 15, fontWeight: '700' },

    historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    historyDate:   { fontSize: 14, fontWeight: '600' },
    historySub:    { fontSize: 12 },
    historyAmount: { fontSize: 14, fontWeight: '700' },
    historyView:   { fontSize: 13 },
  });
}
