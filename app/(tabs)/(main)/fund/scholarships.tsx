/**
 * Fund — Scholarships (Student default).
 * Browse and apply for scholarships. My Scholarships, Browse, My Applications.
 * President → redirect to Fund Dashboard.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type RenewalType = 'Auto-Renew' | 'GPA Conditional' | 'One-Time';
type AppStatus = 'Applied' | 'Under Review' | 'Awarded' | 'Not Selected';
type BrowseFilter = 'all' | 'program' | 'amount' | 'deadline';

const MY_SCHOLARSHIPS = [
  {
    id: 's1', name: 'Oaklanders Athletic Scholarship', amount: '$5,000/year',
    renewal: 'GPA Conditional' as RenewalType, renewalNote: 'Maintain 3.0+ GPA',
    expiration: 'May 2027', hasDonor: true, donorName: 'Oakland Community Foundation',
  },
];

const BROWSE = [
  {
    id: 'b1', name: 'Dr. Brodsky Leadership Award', amount: '$2,500', duration: 'One-Time',
    eligibility: 'Junior or Senior · GPA 3.2+ · Essay required',
    deadline: 'May 31', programs: 'All programs',
    description: 'Named for Dr. Theodore Brodsky, a lifelong Lincoln supporter. Awarded to a student demonstrating exceptional community leadership and academic achievement.',
    requirements: ['Personal statement (500 words)', 'Faculty recommendation letter', 'Unofficial transcript'],
  },
  {
    id: 'b2', name: 'Business Administration Merit Scholarship', amount: '$3,000/year', duration: 'Renewable',
    eligibility: 'Business Administration majors · GPA 3.5+ · Sophomore or above',
    deadline: 'Jun 15', programs: 'Business Administration',
    description: 'Merit-based award for high-achieving Business Administration students. Renewable annually with maintained GPA.',
    requirements: ['Academic plan statement', 'Unofficial transcript'],
  },
  {
    id: 'b3', name: 'International Student Grant', amount: '$2,000/semester', duration: 'Auto-Renew',
    eligibility: 'International students (F-1 visa) · Any program · Any year',
    deadline: 'Rolling', programs: 'All programs',
    description: 'Supports international students with tuition costs. Automatically renewed each semester with maintained enrollment.',
    requirements: ['Copy of I-20 or visa documentation', 'Enrollment verification'],
  },
  {
    id: 'b4', name: 'STEM Excellence Award', amount: '$2,000/year', duration: 'Renewable',
    eligibility: 'Diagnostic Imaging or Health Sciences · GPA 3.0+ · Any year',
    deadline: 'May 15', programs: 'Diagnostic Imaging, Health Sciences',
    description: 'Recognizes outstanding students in Lincoln\'s health sciences programs. Supports clinical training costs and textbooks.',
    requirements: ['Faculty nomination', 'Unofficial transcript', 'Short essay on career goals'],
  },
  {
    id: 'b5', name: 'Alumni Legacy Scholarship', amount: '$1,500/year', duration: 'Renewable',
    eligibility: 'Parent/guardian is Lincoln alumnus · Any program · GPA 2.8+',
    deadline: 'Jun 1', programs: 'All programs',
    description: 'Celebrates the Lincoln family legacy. Available to students whose parent or guardian graduated from Lincoln.',
    requirements: ['Alumni verification (parent/guardian name, grad year)', 'Enrollment verification'],
  },
];

const MY_APPS: { id: string; name: string; appliedDate: string; status: AppStatus }[] = [
  { id: 'a1', name: 'Dr. Brodsky Leadership Award', appliedDate: 'Apr 10', status: 'Under Review' },
  { id: 'a2', name: 'STEM Excellence Award',         appliedDate: 'Mar 28', status: 'Not Selected' },
];

const APP_STATUS_COLOR: Record<AppStatus, string> = {
  'Applied':       CAUTION,
  'Under Review':  CAUTION,
  'Awarded':       GAIN,
  'Not Selected':  '#9C9790',
};

export default function ScholarshipsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isPresident = role === roleCycles[0];
  const [browseFilter, setBrowseFilter] = useState<BrowseFilter>('all');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isPresident) router.replace('/(tabs)/(main)/fund' as any);
  }, [isPresident, router]));

  if (isPresident) return null;

  const openScholarshipDetail = (item: typeof BROWSE[0]) => {
    Alert.alert(item.name,
      `Amount: ${item.amount} (${item.duration})\nEligibility: ${item.eligibility}\nDeadline: ${item.deadline}\n\n${item.description}\n\nRequirements:\n${item.requirements.map(r => `• ${r}`).join('\n')}`,
      [
        {
          text: 'Apply Now', onPress: () => Alert.alert('Application Started',
            `Your application for ${item.name} has been started. Complete and submit before ${item.deadline}.`,
            [{ text: 'OK' }]
          )
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Scholarships</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* My Scholarships */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>My Scholarships ({MY_SCHOLARSHIPS.length})</Text>
          {MY_SCHOLARSHIPS.map(sch => (
            <View key={sch.id} style={[s.activeCard, { backgroundColor: C.surface, borderColor: GAIN + '60' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1, marginRight: 8 }}>{sch.name}</Text>
                <View style={[s.badge, { backgroundColor: GAIN + '22', borderColor: GAIN }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: GAIN }}>ACTIVE</Text>
                </View>
              </View>
              <Text style={{ fontSize: 20, fontWeight: '800', color: C.label, marginBottom: 4 }}>{sch.amount}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 12, color: C.secondary }}>{sch.renewal} · Expires {sch.expiration}</Text>
                  {sch.renewal === 'GPA Conditional' && (
                    <Text style={{ fontSize: 12, color: CAUTION }}>{sch.renewalNote}</Text>
                  )}
                </View>
                {sch.hasDonor && (
                  <Pressable
                    style={[s.thankBtn, { backgroundColor: C.label }]}
                    onPress={() => Alert.alert('Thank You Note', `Send a thank-you message to ${sch.donorName} for this scholarship.`)}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Thank Donor</Text>
                  </Pressable>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Browse filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {([
            { key: 'all' as BrowseFilter, label: 'All' },
            { key: 'program' as BrowseFilter, label: 'By Program' },
            { key: 'amount' as BrowseFilter, label: 'By Amount' },
            { key: 'deadline' as BrowseFilter, label: 'Deadline Soon' },
          ]).map(f => (
            <Pressable key={f.key} onPress={() => { setBrowseFilter(f.key); Haptics.selectionAsync(); }}
              style={[s.filterPill, { backgroundColor: browseFilter === f.key ? C.label : C.surface, borderColor: C.separator }]}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: browseFilter === f.key ? C.bg : C.secondary }}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Browse scholarships */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Browse Scholarships ({BROWSE.length})</Text>
          {BROWSE.map((sch, idx) => (
            <Pressable
              key={sch.id}
              style={[s.browseCard, { backgroundColor: C.surface }, idx > 0 && { marginTop: 8 }]}
              onPress={() => openScholarshipDetail(sch)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1, marginRight: 8 }}>{sch.name}</Text>
                <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flexShrink: 0 }}>{sch.amount}</Text>
              </View>
              <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 10, lineHeight: 17 }}>{sch.eligibility}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {sch.deadline === 'Rolling' ? (
                  <View style={[s.badge, { backgroundColor: GAIN + '22', borderColor: GAIN }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: GAIN }}>ROLLING</Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    <IconSymbol name="calendar" size={12} color={C.secondary} />
                    <Text style={{ fontSize: 12, color: C.secondary }}>Due {sch.deadline}</Text>
                  </View>
                )}
                <Pressable
                  style={[s.applyBtn, { backgroundColor: C.label }]}
                  onPress={() => openScholarshipDetail(sch)}
                >
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Apply</Text>
                </Pressable>
              </View>
            </Pressable>
          ))}
        </View>

        {/* My Applications */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>My Applications ({MY_APPS.length})</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {MY_APPS.map((app, idx) => (
              <View key={app.id} style={[s.row, idx < MY_APPS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{app.name}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary }}>Applied {app.appliedDate}</Text>
                </View>
                <View style={[s.badge, { backgroundColor: APP_STATUS_COLOR[app.status] + '22', borderColor: APP_STATUS_COLOR[app.status] }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: APP_STATUS_COLOR[app.status] }}>{app.status.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },
  sectionLabel:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:        { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:   { borderBottomWidth: StyleSheet.hairlineWidth },
  activeCard:  { borderRadius: 14, padding: 16, borderLeftWidth: 3, marginBottom: 0 },
  browseCard:  { borderRadius: 14, padding: 16 },
  badge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, flexShrink: 0 },
  filterPill:  { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
  applyBtn:    { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  thankBtn:    { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
});
