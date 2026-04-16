/**
 * Education Hub — Registration (Student only)
 * Schedule, course search, drop/add, waitlist.
 */

import React, { useCallback, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN = '#5A8A6E';
const CAUTION = '#B8943E';

const SCHEDULE = [
  { code: 'BUSN 301', name: 'Strategic Management',      days: 'Mon/Wed', time: '10:00 – 11:15 AM', room: 'BUS 204' },
  { code: 'MBA 501',  name: 'Managerial Economics',       days: 'Tue/Thu', time: '2:00 – 3:15 PM',   room: 'GRD 101' },
  { code: 'MBA 510',  name: 'Leadership & Org Behavior',  days: 'Mon/Wed', time: '1:00 – 2:15 PM',   room: 'GRD 105' },
];

const AVAILABLE = [
  { code: 'BUSN 401', name: 'Business Law',                   instructor: 'Prof. Martinez', days: 'Tue/Thu', time: '10:00 AM', seats: '4 of 30',  credits: 3 },
  { code: 'MBA 520',  name: 'Financial Reporting',             instructor: 'Dr. Okonkwo',   days: 'Wed',     time: '6:00 PM',  seats: '11 of 35', credits: 3 },
  { code: 'DIAG 410', name: 'Advanced Imaging Tech',          instructor: 'Dr. Santos',    days: 'Fri',     time: '9:00 AM',  seats: '2 of 28',  credits: 4 },
  { code: 'BUSN 450', name: 'Entrepreneurship & Innovation',  instructor: 'Dr. Williams',  days: 'Mon/Wed', time: '3:30 PM',  seats: '8 of 25',  credits: 3 },
];

const SEARCH_FILTERS = ['All', 'By Department', 'Open Seats Only'] as const;

function seatsColor(seats: string, C: any) {
  const available = parseInt(seats.split(' ')[0]);
  if (available <= 3) return CAUTION;
  return C.secondary;
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduRegistration() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];
  const [searchFilter, setSearchFilter] = useState<typeof SEARCH_FILTERS[number]>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredAvailable = searchFilter === 'Open Seats Only'
    ? AVAILABLE.filter(c => parseInt(c.seats.split(' ')[0]) > 5)
    : AVAILABLE;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={{ backgroundColor: C.bg, paddingTop: insets.top }}>
        <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: C.label }}>K</Text>
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Registration</Text>
            </View>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPresident} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {isPresident ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <IconSymbol name="lock.fill" size={32} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12, textAlign: 'center' }}>Switch to Student role to manage registration</Text>
          </View>
        ) : (
          <>
            {/* REGISTRATION STATUS */}
            <View style={{ marginTop: 16, backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <View style={{ backgroundColor: GAIN + '26', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: GAIN }}>Open</Text>
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Spring 2026 Add/Drop</Text>
              </View>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 10 }}>Registration window: Apr 1 – Apr 30, 2026</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <IconSymbol name="checkmark.circle.fill" size={14} color={GAIN} />
                <Text style={{ fontSize: 13, color: GAIN }}>No registration holds</Text>
              </View>
            </View>

            {/* CURRENT SCHEDULE */}
            <SH title="Current Schedule" C={C} />
            {SCHEDULE.map((s, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 3, borderLeftColor: C.separator }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 4 }}>{s.code} — {s.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{s.days} · {s.time} · {s.room}</Text>
                </View>
                <Pressable style={{ borderWidth: 1, borderColor: C.separator, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginLeft: 10 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#B85C5C' }}>Drop</Text>
                </Pressable>
              </View>
            ))}

            {/* COURSE SEARCH */}
            <SH title="Course Search" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
              <Text style={{ fontSize: 14, color: C.muted }}>Search courses, departments, instructors...</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {SEARCH_FILTERS.map(f => (
                  <Pressable key={f} onPress={() => setSearchFilter(f)} style={{ backgroundColor: f === searchFilter ? C.label : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: f === searchFilter ? C.bg : C.secondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {filteredAvailable.map((c, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, marginBottom: 3 }}>{c.code}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 4 }}>{c.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{c.instructor} · {c.days} {c.time}</Text>
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                    <Text style={{ fontSize: 12, color: seatsColor(c.seats, C) }}>{c.seats} seats</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{c.credits} credits</Text>
                  </View>
                </View>
                <Pressable style={{ backgroundColor: C.label, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 5 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.bg }}>Add</Text>
                </Pressable>
              </View>
            ))}

            {/* WAITLIST */}
            <SH title="Waitlist" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 4 }}>BUSN 310 — Marketing Fundamentals</Text>
              <Text style={{ fontSize: 13, color: CAUTION }}>Position #3 of 5 on waitlist</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
