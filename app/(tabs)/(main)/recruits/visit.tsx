/**
 * Recruits — Visit (Player only).
 * Schedule and prepare for a campus visit. Head Coach redirects to Board.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
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
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';

const VISIT_TYPES = [
  {
    type: 'Unofficial Visit',
    icon: 'person.fill',
    description: 'Self-arranged. You pay your own travel and lodging. No restrictions on timing or number of visits. Great way to see the campus on your schedule.',
  },
  {
    type: 'Official Visit',
    icon: 'star.fill',
    description: 'Program-arranged. Lincoln covers your travel, lodging, and meals. Limited to 1 per school. Requires written offer or invitation from coaching staff.',
  },
];

const CHECKLIST = [
  'Valid photo ID',
  'Transcripts (unofficial OK)',
  'Highlight film link ready',
  'List of questions for coaches',
  'Questions for current players',
  'Academic catalog / program interest noted',
];

const ITINERARY = [
  { time: '9:00 AM',  item: 'Campus tour with student ambassador' },
  { time: '10:30 AM', item: 'Meet coaching staff · Q&A session' },
  { time: '12:00 PM', item: 'Lunch with current players' },
  { time: '1:30 PM',  item: 'Watch practice (or game if in season)' },
  { time: '3:00 PM',  item: 'Academic advising meeting' },
  { time: '4:00 PM',  item: 'Facility tour (gym, weight room, locker room)' },
  { time: '5:00 PM',  item: 'Wrap-up with head coach' },
];

const VISIT_FAQ = [
  { q: 'Can I bring my parents?',         a: 'Yes — and encouraged! Parents can attend all program activities.' },
  { q: 'Is there a dress code?',           a: 'Business casual for coach meetings. Athletic wear for practice observation.' },
  { q: 'Will I meet current players?',     a: 'Absolutely. Lunch is always with the team.' },
];

export default function VisitScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('sports:recruits');
  const isCoach = role === roleCycles[0];

  const [checklistDone, setChecklistDone] = useState<Set<string>>(new Set());

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isCoach) router.replace('/(tabs)/(main)/recruits' as any);
  }, [isCoach, router]));

  if (isCoach) return null;

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
              <Text style={[s.titleText, { color: C.label }]}>Visit</Text>
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
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Request a Visit button */}
        <Pressable
          style={[s.requestBtn, { backgroundColor: '#1A1714', marginBottom: 24 }]}
          onPress={() => Alert.alert('Request a Visit', 'Which type of visit would you like to request?', [
            { text: 'Unofficial Visit', onPress: () => Alert.alert('Request Sent', 'Your unofficial visit request has been sent to Coach Middlebrooks.') },
            { text: 'Official Visit',   onPress: () => Alert.alert('Request Sent', 'Your official visit request has been sent. You will hear back within 48 hours.') },
            { text: 'Cancel', style: 'cancel' },
          ])}
        >
          <IconSymbol name="calendar.badge.plus" size={16} color="#fff" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Request a Visit</Text>
        </Pressable>

        {/* Visit types */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Visit Types</Text>
        {VISIT_TYPES.map(vt => (
          <View key={vt.type} style={[s.card, { backgroundColor: C.surface, padding: 14, marginBottom: 10 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: '#1A2E4A' + '18', alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={vt.icon as any} size={16} color="#1A2E4A" />
              </View>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{vt.type}</Text>
            </View>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{vt.description}</Text>
          </View>
        ))}

        {/* Sample itinerary */}
        <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 12 }]}>Sample Visit Itinerary</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {ITINERARY.map((item, idx) => (
            <View key={item.time} style={[s.row, idx < ITINERARY.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, width: 68 }}>{item.time}</Text>
              <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{item.item}</Text>
            </View>
          ))}
        </View>

        {/* Checklist */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>What to Bring</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {CHECKLIST.map((item, idx) => {
            const done = checklistDone.has(item);
            return (
              <Pressable key={item}
                style={[s.row, idx < CHECKLIST.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                onPress={() => { setChecklistDone(prev => { const next = new Set(prev); done ? next.delete(item) : next.add(item); return next; }); Haptics.selectionAsync(); }}>
                <IconSymbol name={done ? 'checkmark.circle.fill' : 'circle'} size={18} color={done ? GAIN : C.secondary} />
                <Text style={{ flex: 1, fontSize: 14, color: done ? C.secondary : C.label, textDecorationLine: done ? 'line-through' : 'none' }}>{item}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Campus info */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Getting Here</Text>
        <View style={[s.card, { backgroundColor: C.surface, padding: 14, marginBottom: 20 }]}>
          {[
            { icon: 'location.fill',     label: 'Address',  value: '401 15th St, Oakland, CA 94612' },
            { icon: 'car.fill',          label: 'Parking',  value: 'Free parking on campus. Enter from 14th St.' },
            { icon: 'airplane',          label: 'Airport',  value: 'OAK (20 min) · SFO (35 min)' },
            { icon: 'bed.double.fill',   label: 'Hotels',   value: 'Hilton Oakland, Marriott City Center (nearby)' },
          ].map((row, idx, arr) => (
            <View key={row.label} style={[{ flexDirection: 'row', gap: 12, paddingVertical: 10 }, idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <IconSymbol name={row.icon as any} size={15} color={C.secondary} style={{ marginTop: 1 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 }}>{row.label}</Text>
                <Text style={{ fontSize: 13, color: C.label }}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* FAQ */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>FAQ</Text>
        <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
          {VISIT_FAQ.map((faq, idx) => (
            <View key={faq.q} style={[{ padding: 14 }, idx < VISIT_FAQ.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginBottom: 4 }}>{faq.q}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{faq.a}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:       { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:   { width: 80, justifyContent: 'center' },
  titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:    { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  requestBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
});
