/**
 * Education Hub — Academics (President only)
 * Programs overview, courses, degree audits, accreditation.
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
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

const PROGRAMS = [
  { name: 'BA Business Administration',  level: 'Undergraduate', enrolled: 89,  retention: 76, trend: 'up'   },
  { name: 'BS Diagnostic Imaging',        level: 'Undergraduate', enrolled: 115, retention: 82, trend: 'up'   },
  { name: 'MBA',                          level: 'Graduate',      enrolled: 142, retention: 80, trend: 'flat' },
  { name: "MS Int'l Business & Finance",  level: 'Graduate',      enrolled: 68,  retention: 74, trend: 'down' },
  { name: 'Doctor of Business Admin.',    level: 'Doctoral',      enrolled: 22,  retention: 91, trend: 'up'   },
];

const COURSES = [
  { code: 'BUSN 101', name: 'Intro to Business',         dept: 'Business',          instructor: 'Dr. Chen',     enrolled: 28, avgGrade: 'B+' },
  { code: 'BUSN 301', name: 'Strategic Management',      dept: 'Business',          instructor: 'Dr. Williams', enrolled: 24, avgGrade: 'B'  },
  { code: 'DIAG 201', name: 'Radiographic Principles',   dept: 'Diagnostic Imaging',instructor: 'Dr. Santos',   enrolled: 32, avgGrade: 'A-' },
  { code: 'DIAG 310', name: 'CT & MRI Fundamentals',     dept: 'Diagnostic Imaging',instructor: 'Prof. Kim',    enrolled: 29, avgGrade: 'B+' },
  { code: 'MBA 501',  name: 'Managerial Economics',      dept: 'Graduate',          instructor: 'Dr. Okonkwo',  enrolled: 38, avgGrade: 'B'  },
  { code: 'MBA 510',  name: 'Leadership & Org Behavior', dept: 'Graduate',          instructor: 'Dr. Patel',    enrolled: 35, avgGrade: 'A-' },
];

const DEPT_FILTERS = ['All', 'Business', 'Diagnostic Imaging', 'Graduate'] as const;
type DeptFilter = typeof DEPT_FILTERS[number];

const AUDITS = [
  { program: 'BA Business Admin',          pct: 68 },
  { program: 'BS Diagnostic Imaging',      pct: 74 },
  { program: 'MBA',                         pct: 81 },
  { program: "MS Int'l Business & Finance", pct: 62 },
  { program: 'DBA',                         pct: 91 },
];

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduAcademics() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];
  const [deptFilter, setDeptFilter] = useState<DeptFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredCourses = deptFilter === 'All' ? COURSES : COURSES.filter(c => c.dept === deptFilter);

  const trendIcon = (t: string) =>
    t === 'up' ? 'chevron.up' : t === 'down' ? 'chevron.down' : 'minus';
  const trendColor = (t: string) =>
    t === 'up' ? GAIN : t === 'down' ? HEAT : C.secondary;
  const retentionColor = (r: number) =>
    r >= 80 ? GAIN : r >= 75 ? C.label : HEAT;
  const auditColor = (p: number) =>
    p >= 80 ? GAIN : p >= 65 ? C.label : CAUTION;

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
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Academics</Text>
            </View>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPresident} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {!isPresident ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <IconSymbol name="lock.fill" size={32} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12, textAlign: 'center' }}>This section is for administrators</Text>
          </View>
        ) : (
          <>
            {/* PROGRAMS OVERVIEW */}
            <SH title="Programs Overview" C={C} />
            {PROGRAMS.map((p, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{p.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{p.level}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{p.enrolled} <Text style={{ fontSize: 12, fontWeight: '400', color: C.secondary }}>students</Text></Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 12, color: retentionColor(p.retention) }}>{p.retention}% retention</Text>
                    <IconSymbol name={trendIcon(p.trend) as any} size={11} color={trendColor(p.trend)} />
                  </View>
                </View>
              </View>
            ))}

            {/* COURSES */}
            <SH title="Courses" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DEPT_FILTERS.map(f => (
                  <Pressable
                    key={f}
                    onPress={() => setDeptFilter(f)}
                    style={{ backgroundColor: f === deptFilter ? C.label : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}
                  >
                    <Text style={{ fontSize: 13, fontWeight: '500', color: f === deptFilter ? C.bg : C.secondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {filteredCourses.map((c, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, flex: 1 }}>{c.code} — {c.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Avg: {c.avgGrade}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                  <Text style={{ fontSize: 12, color: C.secondary, flex: 1 }}>{c.instructor}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{c.enrolled} enrolled</Text>
                </View>
              </View>
            ))}

            {/* DEGREE AUDITS */}
            <SH title="Degree Audits" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8 }}>
              {AUDITS.map((a, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < AUDITS.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                  <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{a.program}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: auditColor(a.pct) }}>{a.pct}%</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 4 }}> on track</Text>
                </View>
              ))}
            </View>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: C.secondary }}>Average 18 credit hours/semester <Text style={{ color: GAIN }}>↑2% vs last year</Text></Text>
            </View>

            {/* ACCREDITATION */}
            <SH title="Accreditation" C={C} />
            {[
              {
                name: 'WSCUC', status: 'Accredited', nextReview: '2028',
                items: [
                  { label: 'Institutional Report Due', done: true },
                  { label: 'Site Visit Prep', done: true },
                  { label: 'Faculty Credentials Verified', done: true },
                ],
              },
              {
                name: 'IACBE', status: 'Accredited', nextReview: '2027',
                items: [
                  { label: 'Annual Report Submitted', done: true },
                  { label: 'Outcomes Assessment Complete', done: true },
                  { label: 'Strategic Plan Update', done: false, note: 'Due in 60 days' },
                ],
              },
            ].map((acc, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1 }}>{acc.name}</Text>
                  <Text style={{ fontSize: 12, color: GAIN, fontWeight: '600' }}>{acc.status}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginLeft: 8 }}>Next review: {acc.nextReview}</Text>
                </View>
                {acc.items.map((item, j) => (
                  <View key={j} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <IconSymbol name={item.done ? 'checkmark.circle.fill' : 'clock'} size={14} color={item.done ? GAIN : CAUTION} />
                    <Text style={{ fontSize: 13, color: C.label, flex: 1 }}>{item.label}</Text>
                    {item.note && <Text style={{ fontSize: 11, color: CAUTION }}>{item.note}</Text>}
                  </View>
                ))}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
