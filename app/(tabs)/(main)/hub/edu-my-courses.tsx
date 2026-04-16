/**
 * Education Hub — My Courses (Student only)
 * Current courses, assignments due, GPA card, past courses.
 */

import React, { useCallback } from 'react';
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

const COURSES = [
  { code: 'BUSN 301', name: 'Strategic Management',     instructor: 'Dr. Williams', grade: 'A-', nextDue: 'Case Study 4 — Apr 18',      credits: 3 },
  { code: 'MBA 501',  name: 'Managerial Economics',      instructor: 'Dr. Okonkwo',  grade: 'B+', nextDue: 'Problem Set 7 — Apr 16',     credits: 3 },
  { code: 'MBA 510',  name: 'Leadership & Org Behavior', instructor: 'Dr. Patel',    grade: 'A',  nextDue: 'Reflection Paper — Apr 22',  credits: 3 },
];

const ASSIGNMENTS = [
  { name: 'Problem Set 7',    course: 'MBA 501',  due: 'Apr 16', status: 'In Progress' },
  { name: 'Case Study 4',     course: 'BUSN 301', due: 'Apr 18', status: 'Not Started' },
  { name: 'Quiz 5',           course: 'MBA 501',  due: 'Apr 20', status: 'Not Started' },
  { name: 'Reflection Paper', course: 'MBA 510',  due: 'Apr 22', status: 'In Progress' },
  { name: 'Final Project',    course: 'BUSN 301', due: 'May 2',  status: 'Not Started' },
];

const PAST = [
  { semester: 'Fall 2025',   courses: ['BUSN 201 — A', 'MBA 401 — B+', 'BUSN 225 — A-'] },
  { semester: 'Spring 2025', courses: ['BUSN 101 — A', 'BUSN 150 — B+', 'BUSN 175 — A-'] },
];

function gradeColor(grade: string) {
  if (grade.startsWith('A')) return GAIN;
  if (grade.startsWith('B')) return '#1A1714';
  return HEAT;
}

function assignmentStatusStyle(status: string, C: any) {
  if (status === 'In Progress') return { bg: CAUTION + '26', text: CAUTION };
  if (status === 'Submitted')   return { bg: GAIN + '26',    text: GAIN    };
  return { bg: C.separator, text: C.secondary };
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduMyCourses() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

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
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>My Courses</Text>
            </View>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPresident} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {isPresident ? (
          <View style={{ marginTop: 60, alignItems: 'center' }}>
            <IconSymbol name="lock.fill" size={32} color={C.secondary} />
            <Text style={{ fontSize: 15, color: C.secondary, marginTop: 12, textAlign: 'center' }}>Switch to Student role to view courses</Text>
          </View>
        ) : (
          <>
            {/* CURRENT COURSES */}
            <SH title="Spring 2026" C={C} />
            {COURSES.map((course, i) => (
              <Pressable key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary, letterSpacing: 0.4, marginBottom: 3 }}>{course.code}</Text>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: C.label }}>{course.name}</Text>
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '700', color: gradeColor(course.grade), marginLeft: 12 }}>{course.grade}</Text>
                </View>
                <View style={{ flexDirection: 'row', marginBottom: 8 }}>
                  <Text style={{ fontSize: 13, color: C.secondary, flex: 1 }}>{course.instructor}</Text>
                  <Text style={{ fontSize: 13, color: C.secondary }}>{course.credits} credits</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="calendar" size={12} color={C.secondary} />
                  <Text style={{ fontSize: 12, color: C.secondary }}>Next: {course.nextDue}</Text>
                </View>
              </Pressable>
            ))}

            {/* ASSIGNMENTS DUE SOON */}
            <SH title="Assignments Due Soon" C={C} />
            {ASSIGNMENTS.map((a, i) => {
              const st = assignmentStatusStyle(a.status, C);
              return (
                <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{a.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{a.course}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{a.due}</Text>
                    <View style={{ backgroundColor: st.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: st.text }}>{a.status}</Text>
                    </View>
                  </View>
                </View>
              );
            })}

            {/* GPA CARD */}
            <SH title="Academic Standing" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 8 }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: C.label, marginBottom: 4 }}>3.62</Text>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>Current GPA</Text>
              <View style={{ flexDirection: 'row', gap: 0 }}>
                {[
                  { label: 'Credits Done',  value: '42'       },
                  { label: 'Remaining',     value: '48'       },
                  { label: 'Graduation',    value: 'May 2027' },
                ].map((s, i) => (
                  <View key={i} style={{ flex: 1, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{s.value}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* PAST COURSES */}
            <SH title="Past Semesters" C={C} />
            {PAST.map((sem, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 }}>{sem.semester}</Text>
                {sem.courses.map((c, j) => {
                  const parts = c.split(' — ');
                  return (
                    <View key={j} style={{ flexDirection: 'row', paddingVertical: 6, borderTopWidth: j > 0 ? StyleSheet.hairlineWidth : 0, borderTopColor: C.separator }}>
                      <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{parts[0]}</Text>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: gradeColor(parts[1]) }}>{parts[1]}</Text>
                    </View>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
