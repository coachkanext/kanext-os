/**
 * Admissions — My Application (Student only)
 * Application status, checklist, timeline, decision, next steps, messages.
 */

import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const APP_STATUS = {
  label:     'Under Review',
  color:     CAUTION,
  submitted: 'Feb 1, 2026',
  program:   'Business Administration',
  icon:      'clock.fill' as const,
};

type CheckStatus = 'submitted' | 'pending' | 'missing';
const CHECKLIST: { label: string; status: CheckStatus }[] = [
  { label: 'Application Form',          status: 'submitted' },
  { label: 'Official Transcripts',      status: 'submitted' },
  { label: 'Personal Statement',        status: 'submitted' },
  { label: 'Letter of Recommendation 1', status: 'submitted' },
  { label: 'Letter of Recommendation 2', status: 'pending'   },
  { label: 'Application Fee ($50)',      status: 'submitted' },
];

const CHECK_COLOR: Record<CheckStatus, string> = {
  submitted: GAIN,
  pending:   CAUTION,
  missing:   HEAT,
};
const CHECK_ICON: Record<CheckStatus, string> = {
  submitted: 'checkmark.circle.fill',
  pending:   'clock.fill',
  missing:   'exclamationmark.circle.fill',
};

const TIMELINE: { label: string; date: string; done: boolean; current: boolean }[] = [
  { label: 'Applied',      date: 'Feb 1',  done: true,  current: false },
  { label: 'Under Review', date: 'Feb 8',  done: false, current: true  },
  { label: 'Decision',     date: 'Apr 1',  done: false, current: false },
  { label: 'Deposit',      date: 'May 1',  done: false, current: false },
  { label: 'Enrolled',     date: 'Aug 20', done: false, current: false },
];

const MESSAGES = [
  { from: 'Sarah Chen · Admissions', date: 'Feb 8, 2026', msg: "Hi! Your application is now under review. We'll reach out within 4–6 weeks. Please make sure your second letter of recommendation is submitted." },
  { from: 'Lincoln University',      date: 'Feb 1, 2026', msg: "We've received your application for Business Administration. Confirmation #LU-2026-04821." },
];

export default function MyApplicationScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('education:admissions');
  const isPresident = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (isPresident) router.replace('/(tabs)/(main)/admissions/pipeline' as any);
  }, [isPresident, router]);

  if (isPresident) return null;

  const pendingCount = CHECKLIST.filter(c => c.status !== 'submitted').length;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>My Application</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={!isPresident} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Status card */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <GlassView tier={1} style={{ borderRadius: 16, padding: 20, alignItems: 'center' }}>
            <View style={[s.statusIcon, { backgroundColor: APP_STATUS.color + '18' }]}>
              <IconSymbol name={APP_STATUS.icon} size={28} color={APP_STATUS.color} />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '900', color: APP_STATUS.color, marginTop: 12 }}>{APP_STATUS.label}</Text>
            <Text style={{ fontSize: 14, color: C.label, fontWeight: '600', marginTop: 4 }}>{APP_STATUS.program}</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>Submitted {APP_STATUS.submitted} · Lincoln University CA</Text>
          </GlassView>
        </View>

        {/* Application checklist */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={[s.sectionTitle, { color: C.label }]}>Application Checklist</Text>
            {pendingCount > 0 && (
              <View style={{ backgroundColor: CAUTION + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: CAUTION }}>{pendingCount} pending</Text>
              </View>
            )}
          </View>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {CHECKLIST.map((item, i) => (
              <View key={item.label} style={[
                s.row, { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}>
                <IconSymbol name={CHECK_ICON[item.status] as any} size={18} color={CHECK_COLOR[item.status]} />
                <Text style={{ fontSize: 14, color: C.label, flex: 1 }}>{item.label}</Text>
                {item.status !== 'submitted' && (
                  <Pressable
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Upload', `Upload ${item.label} — coming soon`); }}
                    style={[s.uploadBtn, { borderColor: C.separator }]}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.label }}>Upload</Text>
                  </Pressable>
                )}
              </View>
            ))}
          </GlassView>
        </View>

        {/* Timeline */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 16 }]}>Application Journey</Text>
          <View style={{ paddingHorizontal: 8 }}>
            {TIMELINE.map((step, i) => (
              <View key={step.label} style={[s.row, { alignItems: 'flex-start', marginBottom: i < TIMELINE.length - 1 ? 0 : 0 }]}>
                {/* Dot + line */}
                <View style={{ alignItems: 'center', width: 24, marginRight: 12 }}>
                  <View style={[s.timelineDot, {
                    backgroundColor: step.done ? GAIN : step.current ? CAUTION : C.separator,
                    borderColor:     step.done ? GAIN : step.current ? CAUTION : C.separator,
                  }]} />
                  {i < TIMELINE.length - 1 && (
                    <View style={{ width: 2, height: 28, backgroundColor: step.done ? GAIN : C.separator }} />
                  )}
                </View>
                <View style={{ paddingBottom: 28 }}>
                  <Text style={{ fontSize: 14, fontWeight: step.current ? '700' : '500', color: step.done || step.current ? C.label : C.secondary }}>{step.label}</Text>
                  <Text style={{ fontSize: 11, color: step.current ? CAUTION : C.secondary }}>{step.date}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Messages */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Messages</Text>
          <View style={{ gap: 10 }}>
            {MESSAGES.map((msg, i) => (
              <GlassView key={i} tier={1} style={{ borderRadius: 14, padding: 14 }}>
                <View style={[s.row, { justifyContent: 'space-between', marginBottom: 6 }]}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{msg.from}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{msg.date}</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{msg.msg}</Text>
              </GlassView>
            ))}
          </View>
          <Pressable
            style={({ pressed }) => [s.replyBtn, { backgroundColor: C.label, marginTop: 10, opacity: pressed ? 0.8 : 1 }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Message Admissions', 'Compose message — coming soon'); }}
          >
            <IconSymbol name="envelope.fill" size={14} color={C.bg} style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Message Admissions</Text>
          </Pressable>
        </View>

      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    statusIcon:    { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
    timelineDot:   { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
    uploadBtn:     { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth },
    replyBtn:      { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  });
}
