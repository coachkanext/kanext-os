/**
 * Education Hub — Faculty (President only)
 * Directory, hiring, workload, evaluations.
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

const FACULTY = [
  { name: 'Dr. Mikhail Brodsky', dept: 'Administration',  type: 'Full-Time', courses: 0, evalScore: null },
  { name: 'Dr. Chen',            dept: 'Business',         type: 'Full-Time', courses: 2, evalScore: 4.6  },
  { name: 'Dr. Williams',        dept: 'Business',         type: 'Full-Time', courses: 2, evalScore: 4.3  },
  { name: 'Dr. Santos',          dept: 'Diagnostic Img',   type: 'Full-Time', courses: 2, evalScore: 4.8  },
  { name: 'Prof. Kim',           dept: 'Diagnostic Img',   type: 'Full-Time', courses: 2, evalScore: 4.5  },
  { name: 'Dr. Okonkwo',         dept: 'Graduate',         type: 'Full-Time', courses: 2, evalScore: 4.4  },
  { name: 'Dr. Patel',           dept: 'Graduate',         type: 'Full-Time', courses: 2, evalScore: 4.7  },
  { name: 'Dr. Pantos',          dept: 'Administration',   type: 'Full-Time', courses: 1, evalScore: null },
  { name: 'Prof. Martinez',      dept: 'Business',         type: 'Part-Time', courses: 1, evalScore: 4.1  },
  { name: 'Prof. Thompson',      dept: 'Business',         type: 'Part-Time', courses: 1, evalScore: 3.9  },
  { name: 'Prof. Garcia',        dept: 'Diagnostic Img',   type: 'Part-Time', courses: 1, evalScore: 4.2  },
];

const FACULTY_FILTERS = ['All', 'Full-Time', 'Part-Time'] as const;

function initials(name: string) {
  return name.split(' ').filter(w => w.length > 1).map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function evalColor(score: number) {
  if (score >= 4.5) return GAIN;
  if (score >= 4.0) return '#1A1714';
  return CAUTION;
}

function SH({ title, C }: { title: string; C: any }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginTop: 24 }}>
      <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase' }}>{title}</Text>
    </View>
  );
}

export default function EduFaculty() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];
  const [filter, setFilter] = useState<typeof FACULTY_FILTERS[number]>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = filter === 'All' ? FACULTY : FACULTY.filter(f => f.type === filter);

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
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Faculty</Text>
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
            {/* FACULTY DIRECTORY */}
            <SH title="Faculty Directory" C={C} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {FACULTY_FILTERS.map(f => (
                  <Pressable key={f} onPress={() => setFilter(f)} style={{ backgroundColor: f === filter ? C.label : C.surface, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 }}>
                    <Text style={{ fontSize: 13, fontWeight: '500', color: f === filter ? C.bg : C.secondary }}>{f}</Text>
                  </Pressable>
                ))}
              </View>
            </ScrollView>
            {filtered.map((f, i) => (
              <Pressable key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{initials(f.name)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{f.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{f.dept} · {f.type}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  {f.evalScore !== null ? (
                    <Text style={{ fontSize: 13, fontWeight: '600', color: evalColor(f.evalScore) }}>{f.evalScore.toFixed(1)} ★</Text>
                  ) : null}
                  <Text style={{ fontSize: 12, color: C.secondary }}>{f.courses} course{f.courses !== 1 ? 's' : ''}</Text>
                </View>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            ))}

            {/* HIRING */}
            <SH title="Hiring" C={C} />
            {[
              { title: 'Assistant Professor — Business Administration', type: 'Full-Time', status: 'Interviewing', applicants: 12 },
              { title: 'Adjunct Instructor — Diagnostic Imaging',       type: 'Part-Time', status: 'Applications Open', applicants: 7 },
            ].map((pos, i) => (
              <View key={i} style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 4 }}>{pos.title}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{pos.type} · {pos.applicants} applicants</Text>
                </View>
                <View style={{ backgroundColor: pos.status === 'Interviewing' ? CAUTION + '26' : C.separator, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: pos.status === 'Interviewing' ? CAUTION : C.secondary }}>{pos.status}</Text>
                </View>
              </View>
            ))}

            {/* WORKLOAD */}
            <SH title="Workload" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 8 }}>
              {[
                { label: 'Full-Time avg credit hours', value: '6.2 / semester' },
                { label: 'Part-Time avg credit hours', value: '3.4 / semester' },
                { label: 'Student-faculty ratio (Business)', value: '18:1' },
                { label: 'Student-faculty ratio (Diagnostic Img)', value: '14:1' },
                { label: 'Student-faculty ratio (Graduate)', value: '22:1' },
              ].map((w, i, arr) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: i < arr.length - 1 ? StyleSheet.hairlineWidth : 0, borderBottomColor: C.separator }}>
                  <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{w.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{w.value}</Text>
                </View>
              ))}
            </View>

            {/* EVALUATIONS */}
            <SH title="Evaluations" C={C} />
            <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 10 }}>
                Fall 2025 avg: 4.38/5.0 → Spring 2026 avg: <Text style={{ color: GAIN }}>4.47/5.0 ↑</Text>
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <IconSymbol name="star.fill" size={14} color={GAIN} />
                <Text style={{ fontSize: 13, color: C.label }}>Top-rated: Dr. Santos <Text style={{ color: GAIN }}>4.8/5.0</Text></Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color={CAUTION} />
                <Text style={{ fontSize: 13, color: C.label }}>Needs attention: Prof. Thompson <Text style={{ color: CAUTION }}>3.9/5.0</Text></Text>
              </View>
              <Text style={{ fontSize: 12, color: C.secondary }}>Evaluations collected via Dipson at end of each module</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
