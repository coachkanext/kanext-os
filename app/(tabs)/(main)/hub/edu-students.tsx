/**
 * Education Hub — Students (President only)
 * Enrollment snapshot, at-risk students, directory, retention analytics.
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

const AT_RISK = [
  { name: 'Marcus Thompson', program: 'BA Business Admin',     issue: 'Low GPA',       gpa: 1.8, severity: 'high'   },
  { name: 'Aisha Oduya',     program: 'BS Diagnostic Imaging', issue: 'Attendance',    gpa: 2.4, severity: 'medium' },
  { name: 'Kevin Park',      program: 'MBA',                   issue: 'Financial Hold', gpa: 3.1, severity: 'medium' },
  { name: 'Sofia Reyes',     program: 'BA Business Admin',     issue: 'Incomplete',    gpa: 2.7, severity: 'low'    },
  { name: 'Jordan Williams', program: "MS Int'l Business",     issue: 'Low GPA',       gpa: 1.6, severity: 'high'   },
];

const STUDENTS = [
  { name: 'Emily Rodriguez', program: 'MBA',                    year: 'Year 2', gpa: 3.8, status: 'Honors'   },
  { name: 'Tyler Johnson',   program: 'BA Business Admin',      year: 'Year 3', gpa: 2.9, status: 'Active'   },
  { name: 'Fatima Malik',    program: 'BS Diagnostic Imaging',  year: 'Year 2', gpa: 3.5, status: 'Active'   },
  { name: 'Carlos Rivera',   program: "MS Int'l Business",      year: 'Year 1', gpa: 1.9, status: 'At-Risk'  },
  { name: 'Zoe Anderson',    program: 'DBA',                    year: 'Year 3', gpa: 3.9, status: 'Honors'   },
];

const ISSUE_FILTERS = ['All', 'Low GPA', 'Attendance', 'Financial Hold', 'Incomplete'] as const;
const DIR_FILTERS = ['All', 'Undergraduate', 'Graduate', 'At-Risk', 'Honors'] as const;

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduStudents() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];
  const [issueFilter, setIssueFilter] = useState<typeof ISSUE_FILTERS[number]>('All');
  const [dirFilter, setDirFilter] = useState<typeof DIR_FILTERS[number]>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filteredAtRisk = issueFilter === 'All' ? AT_RISK : AT_RISK.filter(s => s.issue === issueFilter);
  const filteredStudents = dirFilter === 'All' ? STUDENTS : STUDENTS.filter(s => {
    if (dirFilter === 'At-Risk') return s.status === 'At-Risk';
    if (dirFilter === 'Honors') return s.status === 'Honors';
    if (dirFilter === 'Undergraduate') return ['BA Business Admin', 'BS Diagnostic Imaging'].includes(s.program);
    if (dirFilter === 'Graduate') return ['MBA', "MS Int'l Business", 'DBA'].includes(s.program);
    return true;
  });

  const severityStyle = (severity: string, C: any) => {
    if (severity === 'high')   return { bg: HEAT + '26',    text: HEAT    };
    if (severity === 'medium') return { bg: CAUTION + '26', text: CAUTION };
    return { bg: C.separator, text: C.secondary };
  };

  const gpaColor = (gpa: number) => gpa >= 3.5 ? GAIN : gpa < 2.0 ? HEAT : C.label;
  const statusStyle = (status: string, C: any) => {
    if (status === 'Honors')  return { bg: GAIN + '26',    text: GAIN    };
    if (status === 'At-Risk') return { bg: HEAT + '26',    text: HEAT    };
    return { bg: C.separator, text: C.secondary };
  };

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
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Students</Text>
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
            {/* ENROLLMENT SNAPSHOT */}
            <View style={{ marginTop: 16 }} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', marginBottom: 4 }}>
                <Text style={{ fontSize: 28, fontWeight: '800', color: C.label }}>436</Text>
                <Text style={{ fontSize: 14, color: C.secondary, marginLeft: 8 }}>Students Enrolled</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 20, marginBottom: 8 }}>
                <Text style={{ fontSize: 13, color: C.secondary }}>204 Undergrad</Text>
                <Text style={{ fontSize: 13, color: C.secondary }}>232 Graduate</Text>
              </View>
              <Text style={{ fontSize: 13, color: GAIN }}>78% retention rate <Text style={{ fontSize: 12 }}>↑3% vs last year</Text></Text>
            </View>

            {/* AT-RISK STUDENTS */}
            <SH title="At-Risk Students" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ISSUE_FILTERS.map(f => (
                  <Pressable key={f} onPress={() => setIssueFilter(f)} style={{ backgroundColor: f === issueFilter ? C.label : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: f === issueFilter ? C.bg : C.secondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {filteredAtRisk.map((s, i) => {
              const sev = severityStyle(s.severity, C);
              return (
                <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{initials(s.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{s.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{s.program}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={{ backgroundColor: sev.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: sev.text }}>{s.issue}</Text>
                    </View>
                    {s.issue === 'Low GPA' && <Text style={{ fontSize: 11, color: C.muted }}>GPA: {s.gpa}</Text>}
                  </View>
                </View>
              );
            })}

            {/* STUDENT DIRECTORY */}
            <SH title="Student Directory" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {DIR_FILTERS.map(f => (
                  <Pressable key={f} onPress={() => setDirFilter(f)} style={{ backgroundColor: f === dirFilter ? C.label : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: f === dirFilter ? C.bg : C.secondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {filteredStudents.map((s, i) => {
              const st = statusStyle(s.status, C);
              return (
                <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{initials(s.name)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{s.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{s.program} · {s.year}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: gpaColor(s.gpa) }}>{s.gpa.toFixed(1)}</Text>
                    <View style={{ backgroundColor: st.bg, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: st.text }}>{s.status}</Text>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted} />
                </View>
              );
            })}

            {/* RETENTION ANALYTICS */}
            <SH title="Retention Analytics" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8 }}>
              {[
                { program: 'BA Business Admin',          pct: 76 },
                { program: 'BS Diagnostic Imaging',      pct: 82 },
                { program: 'MBA',                         pct: 80 },
                { program: "MS Int'l Business & Finance", pct: 74 },
                { program: 'DBA',                         pct: 91 },
              ].map((r, i, arr) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                  <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{r.program}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: r.pct >= 80 ? GAIN : r.pct < 75 ? CAUTION : C.label }}>{r.pct}%</Text>
                </View>
              ))}
            </View>
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: GAIN, marginBottom: 6 }}>Overall retention up 3% from last year (75% → 78%)</Text>
              <Text style={{ fontSize: 13, color: C.secondary }}>Highest drop-off: end of Year 1 — 14% of Year 1 students do not return for Year 2</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
