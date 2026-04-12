/**
 * Education Hub — Lincoln University Oakland Institutional Overview.
 * Matches Personal Hub profile page pattern exactly.
 * President: ENROLLMENT, PROGRAMS, ACCREDITATION, LEADERSHIP, CAMPUS.
 * Student: MY ACADEMICS, CURRENT COURSES, RESOURCES.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H   = 52;
const AVATAR_SIZE = 80;
const AVATAR_OVR  = AVATAR_SIZE / 2;

// ─── Data ─────────────────────────────────────────────────────────────────────

const INST = {
  name:    'Lincoln University',
  sub:     'Oakland, California · Est. 1919',
  bio:     'WSCUC Accredited · IACBE · Nonprofit, private institution',
  enrolled: 436,
  programs: 5,
  retention: 78,
};

const ENROLLMENT_CARDS = [
  { label: 'Undergraduate', value: '204', icon: 'person.fill',        good: false },
  { label: 'Graduate',      value: '232', icon: 'graduationcap.fill', good: false },
  { label: 'Retention',     value: '78%', icon: 'arrow.up.right',     good: true  },
];

const PROGRAMS = [
  { name: 'BA Business Administration',     level: 'Undergraduate', students: 89  },
  { name: 'BS Diagnostic Imaging',          level: 'Undergraduate', students: 115 },
  { name: 'MBA',                             level: 'Graduate',      students: 142 },
  { name: "MS Int'l Business & Finance",    level: 'Graduate',      students: 68  },
  { name: 'Doctor of Business Admin.',      level: 'Doctoral',      students: 22  },
];

const ACCREDITATION = [
  { body: 'WSCUC', status: 'Accredited', nextReview: 'Spring 2028' },
  { body: 'IACBE', status: 'Accredited', nextReview: 'Fall 2026'   },
];

const LEADERSHIP = [
  { name: 'Gengatharen Munsamy', role: 'President'          },
  { name: 'Monika Kamil Bhatt',  role: 'Provost'            },
  { name: 'Sammy Kalejaiye',     role: 'Athletic Director'  },
];

// Student
const MY_COURSES = [
  { code: 'BUS 401', name: 'Strategic Management',    credits: 3, grade: 'A-' },
  { code: 'FIN 312', name: 'Corporate Finance',        credits: 3, grade: 'B+' },
  { code: 'MKT 320', name: 'Digital Marketing',        credits: 3, grade: 'A'  },
  { code: 'MGT 415', name: 'Organizational Behavior', credits: 3, grade: 'B+' },
];

function gradeColor(g: string): string {
  if (g.startsWith('A')) return GAIN;
  if (g.startsWith('B')) return CAUTION;
  return HEAT;
}

function SH({ title, C }: { title: string; C: any }) {
  return <Text style={[s.sh, { color: C.secondary }]}>{title}</Text>;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EducationHub() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, toggleRole, roleCycles] = useDemoRole('education');
  const isPresident = role === roleCycles[0];

  const COVER_H = 220 + insets.top + TOP_BAR_H;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Floating top bar */}
      <View style={[s.topBar, { paddingTop: insets.top, height: insets.top + TOP_BAR_H }]}>
        <KMenuButton onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} />
        <View style={s.topCenter}>
          <Text style={s.topTitle}>Hub</Text>
        </View>
        <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Cover + avatar */}
        <View style={{ position: 'relative', marginBottom: AVATAR_OVR + 12 }}>
          <View style={{ height: COVER_H, overflow: 'hidden' }}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/university-campus/900/500' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 70, backgroundColor: 'rgba(0,0,0,0.40)' }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.20)' }} />
          </View>
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <View style={[s.avatar, { backgroundColor: C.surface, borderColor: C.bg }]}>
              <Text style={s.avatarEmoji}>🏛️</Text>
            </View>
          </View>
        </View>

        {/* Identity */}
        <View style={[s.identity, { paddingHorizontal: 20 }]}>
          <Text style={[s.name, { color: C.label }]}>{INST.name}</Text>
          <Text style={[s.handle, { color: C.secondary }]}>{INST.sub}</Text>
          <Text style={[s.bio, { color: C.label }]}>{INST.bio}</Text>
        </View>

        {/* Metrics + action */}
        <View style={[s.metricActionRow, { paddingHorizontal: 20, borderColor: C.separator }]}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{INST.enrolled}</Text>{' enrolled  ·  '}
            <Text style={{ fontWeight: '700', color: C.label }}>{INST.programs}</Text>{' programs  ·  '}
            <Text style={{ fontWeight: '700', color: GAIN }}>{INST.retention}%</Text>{' retention'}
          </Text>
          <Pressable
            style={[s.editBtn, { borderColor: C.separator }]}
            onPress={() => isPresident ? go('/(tabs)/(main)/hub/edu-announcement') : go('/(tabs)/(main)/hub/campus')}
          >
            <Text style={[s.editBtnText, { color: C.label }]}>{isPresident ? 'Announce' : 'Campus'}</Text>
          </Pressable>
        </View>

        {/* Accreditation badge row */}
        <View style={[s.badgeRow, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
          {ACCREDITATION.map(a => (
            <View key={a.body} style={[s.badge, { backgroundColor: GAIN + '18', borderColor: GAIN + '44' }]}>
              <Text style={[s.badgeText, { color: GAIN }]}>✓ {a.body} Accredited</Text>
            </View>
          ))}
        </View>

        {isPresident ? (
          <>
            {/* ENROLLMENT */}
            <View style={s.section}>
              <SH title="Enrollment" C={C} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {ENROLLMENT_CARDS.map(e => (
                  <View key={e.label} style={[s.enrollCard, { backgroundColor: C.surface }]}>
                    <IconSymbol name={e.icon as any} size={16} color={C.secondary} />
                    <Text style={[{ fontSize: 20, fontWeight: '800', color: e.good ? GAIN : C.label }]}>{e.value}</Text>
                    <Text style={[{ fontSize: 11, fontWeight: '500', color: C.secondary, textAlign: 'center' }]}>{e.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* PROGRAMS */}
            <View style={s.section}>
              <SH title="Programs" C={C} />
              {PROGRAMS.map((p, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => {}}
                >
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name="book.fill" size={16} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{p.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{p.level} · {p.students} students</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
                </Pressable>
              ))}
            </View>

            {/* LEADERSHIP */}
            <View style={s.section}>
              <SH title="Leadership" C={C} />
              {LEADERSHIP.map((l, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>{l.name.split(' ').slice(0, 2).map(w => w[0]).join('')}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{l.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{l.role}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* CAMPUS */}
            <View style={s.section}>
              <SH title="Campus" C={C} />
              {[
                { icon: 'mappin.fill', label: '401 15th Street, Oakland, CA 94612' },
                { icon: 'clock.fill',  label: 'Mon–Fri 8:00 AM – 6:00 PM'         },
                { icon: 'phone.fill',  label: '(510) 628-8010'                     },
                { icon: 'globe',       label: 'lincolnuca.edu'                     },
              ].map((row, i) => (
                <Pressable key={i} style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]} onPress={() => {}}>
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name={row.icon as any} size={16} color={C.label} />
                  </View>
                  <Text style={[s.cardTitle, { color: C.label, flex: 1 }]}>{row.label}</Text>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* STUDENT: MY ACADEMICS */}
            <View style={s.section}>
              <SH title="My Academics" C={C} />
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[
                  { label: 'GPA',      value: '3.6' },
                  { label: 'Credits',  value: '87'  },
                  { label: 'Remain',   value: '33'  },
                  { label: 'Progress', value: '73%' },
                ].map(st => (
                  <View key={st.label} style={[s.statPill, { backgroundColor: C.surface }]}>
                    <Text style={[s.statPillValue, { color: C.label }]}>{st.value}</Text>
                    <Text style={[s.statPillLabel, { color: C.secondary }]}>{st.label}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* CURRENT COURSES */}
            <View style={s.section}>
              <SH title="Current Courses" C={C} />
              {MY_COURSES.map((c, i) => (
                <Pressable key={i} style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]} onPress={() => {}}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{c.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{c.code} · {c.credits} credits</Text>
                  </View>
                  <View style={[{ borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: gradeColor(c.grade) + '22' }]}>
                    <Text style={[{ fontSize: 13, fontWeight: '800', color: gradeColor(c.grade) }]}>{c.grade}</Text>
                  </View>
                </Pressable>
              ))}
            </View>

            {/* RESOURCES */}
            <View style={s.section}>
              <SH title="Resources" C={C} />
              {[
                { icon: 'mappin.fill',   label: 'Campus Map',        sub: '401 15th St, Oakland',    route: '/(tabs)/(main)/hub/campus' },
                { icon: 'calendar',      label: 'Academic Calendar', sub: 'Spring 2026 schedule',    route: '' },
                { icon: 'person.2.fill', label: 'Student Services',  sub: 'Advising & support',      route: '' },
                { icon: 'book.fill',     label: 'Library',           sub: 'Online & on-campus',      route: '' },
              ].map(item => (
                <Pressable key={item.label} style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]} onPress={() => item.route ? go(item.route) : null}>
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name={item.icon as any} size={16} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{item.label}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{item.sub}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle:  { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },

  identity: { marginBottom: 14 },
  name:     { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  handle:   { fontSize: 14, marginBottom: 6 },
  bio:      { fontSize: 14, lineHeight: 20, opacity: 0.85 },

  metricActionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editBtn:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  editBtnText: { fontSize: 13, fontWeight: '600' },

  badgeRow: {
    flexDirection: 'row', gap: 8, flexWrap: 'wrap',
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  badge:     { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12, fontWeight: '700' },

  section: { paddingHorizontal: 20, marginBottom: 28 },

  sh: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 12, marginTop: 4,
  },

  card: { borderRadius: 12, padding: 14 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardMeta:  { fontSize: 12 },

  iconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },

  enrollCard: {
    flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', gap: 4,
  },

  statPill: {
    flex: 1, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 8,
    alignItems: 'center', gap: 2,
  },
  statPillValue: { fontSize: 18, fontWeight: '800' },
  statPillLabel: { fontSize: 10, fontWeight: '600', textAlign: 'center' },

  personAvatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  personInitials: { fontSize: 12, fontWeight: '700' },
});
