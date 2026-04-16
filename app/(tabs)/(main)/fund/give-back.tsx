/**
 * Fund — Give Back (Student only).
 * Alumni giving seed page. Class gift campaign, impact stories,
 * give now form, giving history, alumni network preview.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated, Alert,
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

const CLASS_GIFT_GOAL   = 5_000;
const CLASS_GIFT_RAISED = 2_340;
const CLASS_GIFT_PCT    = Math.round((CLASS_GIFT_RAISED / CLASS_GIFT_GOAL) * 100);

const IMPACT_STORIES = [
  {
    icon: '💻',
    headline: '3 new laptops for the computer lab',
    body: "Last year's class gift funded three MacBook Pros for the Business School computer lab — used by 120+ students every week.",
  },
  {
    icon: '🎓',
    headline: '2 students received emergency aid',
    body: "Class gift funds helped two students cover unexpected expenses and stay enrolled during a difficult semester.",
  },
  {
    icon: '📚',
    headline: 'New textbooks for Diagnostic Imaging',
    body: "The Class of 2023 gift purchased an updated textbook library for the Diagnostic Imaging program — a $4,200 value.",
  },
];

const FUND_OPTS = [
  { id: 'class',      label: 'Class Gift Fund (Default)' },
  { id: 'general',    label: 'General Fund' },
  { id: 'scholarship',label: 'Scholarship Fund' },
  { id: 'athletics',  label: 'Athletics Fund' },
  { id: 'imaging',    label: 'Diagnostic Imaging Fund' },
];

const AMOUNT_PRESETS = ['$10', '$25', '$50', '$100'];

export default function GiveBackScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:fund');
  const isPresident = role === roleCycles[0];

  const [amount,    setAmount]    = useState('');
  const [fundId,    setFundId]    = useState('class');
  const [recurring, setRecurring] = useState(false);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (isPresident) router.replace('/(tabs)/(main)/fund' as any);
  }, [isPresident, router]));

  if (isPresident) return null;

  const handleGive = () => {
    const val = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (!val || val <= 0) {
      Alert.alert('Enter Amount', 'Please enter a gift amount.');
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const fundLabel = FUND_OPTS.find(f => f.id === fundId)?.label ?? 'General Fund';
    Alert.alert('Gift Processed!',
      `Thank you! Your $${val.toFixed(0)} gift to the ${fundLabel} has been submitted.${recurring ? '\n\nMonthly recurring giving set up for after graduation.' : ''}`,
      [{ text: 'OK', onPress: () => { setAmount(''); } }]
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
              <Text style={[s.titleText, { color: C.label }]}>Give Back</Text>
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
        keyboardShouldPersistTaps="handled"
      >
        {/* Class gift campaign */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <View style={[s.campaignCard, { backgroundColor: C.label }]}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: C.bg + 'AA', textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 4 }}>Class of 2026 Gift</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: C.bg, letterSpacing: -0.5, marginBottom: 4 }}>${CLASS_GIFT_RAISED.toLocaleString()} raised</Text>
            <Text style={{ fontSize: 13, color: C.bg + 'BB', marginBottom: 14 }}>of ${CLASS_GIFT_GOAL.toLocaleString()} goal · {CLASS_GIFT_PCT}% there</Text>
            <View style={{ height: 5, backgroundColor: C.bg + '30', borderRadius: 3, overflow: 'hidden', marginBottom: 16 }}>
              <View style={{ height: 5, width: `${CLASS_GIFT_PCT}%` as any, backgroundColor: C.bg, borderRadius: 3 }} />
            </View>
            <Text style={{ fontSize: 13, color: C.bg + 'CC', lineHeight: 19 }}>
              Every class leaves a legacy. Your gift supports the next generation of Oaklanders.
            </Text>
          </View>
        </View>

        {/* Why give */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Impact</Text>
          {IMPACT_STORIES.map((story, idx) => (
            <View key={idx} style={[s.impactCard, { backgroundColor: C.surface }, idx > 0 && { marginTop: 8 }]}>
              <Text style={{ fontSize: 24, marginBottom: 8 }}>{story.icon}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 6 }}>{story.headline}</Text>
              <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 19 }}>{story.body}</Text>
            </View>
          ))}
        </View>

        {/* Give now */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Give Now</Text>
          <View style={[s.giveCard, { backgroundColor: C.surface }]}>
            {/* Amount presets */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
              {AMOUNT_PRESETS.map(preset => (
                <Pressable
                  key={preset}
                  onPress={() => { setAmount(preset.replace('$', '')); Haptics.selectionAsync(); }}
                  style={[s.preset, {
                    backgroundColor: amount === preset.replace('$', '') ? C.label : C.bg,
                    borderColor: amount === preset.replace('$', '') ? C.label : C.separator,
                  }]}
                >
                  <Text style={{ fontSize: 14, fontWeight: '700', color: amount === preset.replace('$', '') ? C.bg : C.label }}>{preset}</Text>
                </Pressable>
              ))}
            </View>

            {/* Custom amount */}
            <View style={[s.amountInput, { backgroundColor: C.bg, borderColor: C.separator }]}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: C.secondary }}>$</Text>
              <TextInput
                value={amount} onChangeText={setAmount}
                placeholder="Other amount" placeholderTextColor={C.secondary}
                keyboardType="decimal-pad"
                style={{ flex: 1, fontSize: 18, fontWeight: '700', color: C.label }}
              />
            </View>

            {/* Fund designation */}
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 14, marginBottom: 8 }}>Designate to</Text>
            {FUND_OPTS.map(f => (
              <Pressable
                key={f.id}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8 }}
                onPress={() => { setFundId(f.id); Haptics.selectionAsync(); }}
              >
                <View style={[s.radio, {
                  backgroundColor: fundId === f.id ? C.label : 'transparent',
                  borderColor: fundId === f.id ? C.label : C.separator,
                }]}>
                  {fundId === f.id && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.bg }} />}
                </View>
                <Text style={{ fontSize: 14, color: fundId === f.id ? C.label : C.secondary, fontWeight: fundId === f.id ? '600' : '400' }}>{f.label}</Text>
              </Pressable>
            ))}

            {/* Recurring option */}
            <Pressable
              style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, marginTop: 4, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }}
              onPress={() => { setRecurring(r => !r); Haptics.selectionAsync(); }}
            >
              <View style={[s.checkbox, {
                backgroundColor: recurring ? C.label : 'transparent',
                borderColor: recurring ? C.label : C.separator,
              }]}>
                {recurring && <IconSymbol name="checkmark" size={11} color={C.bg} />}
              </View>
              <Text style={{ flex: 1, fontSize: 14, color: C.secondary, lineHeight: 19 }}>
                Set up monthly giving after graduation — stay connected to Lincoln
              </Text>
            </Pressable>

            <Pressable
              style={[s.giveBtn, { backgroundColor: C.label, marginTop: 8 }]}
              onPress={handleGive}
            >
              <IconSymbol name="heart.fill" size={16} color={C.bg} />
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.bg }}>Give to Lincoln</Text>
            </Pressable>
          </View>
        </View>

        {/* My giving history */}
        <View style={{ paddingHorizontal: 16, marginBottom: 20 }}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>My Giving History</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <View style={{ padding: 20, alignItems: 'center' }}>
              <IconSymbol name="heart" size={28} color={C.secondary} />
              <Text style={{ fontSize: 15, fontWeight: '600', color: C.label, marginTop: 10, marginBottom: 4 }}>No gifts yet</Text>
              <Text style={{ fontSize: 13, color: C.secondary, textAlign: 'center' }}>Your first gift will appear here. Every amount makes a difference.</Text>
            </View>
          </View>
        </View>

        {/* Alumni network preview */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={[s.alumniCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 8 }}>Lincoln Alumni Network</Text>
            <Text style={{ fontSize: 13, color: C.secondary, lineHeight: 20, marginBottom: 14 }}>
              After graduation, stay connected through the Lincoln Alumni Network. Your giving keeps the Oaklander community strong — and opens doors for the next class.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[{ icon: 'person.2.fill', label: '4,200+ alumni' }, { icon: 'briefcase.fill', label: 'Career network' }, { icon: 'calendar', label: 'Alumni events' }].map(item => (
                <View key={item.label} style={{ flex: 1, alignItems: 'center', gap: 5 }}>
                  <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
                  <Text style={{ fontSize: 11, color: C.secondary, textAlign: 'center' }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:       { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:    { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  campaignCard: { borderRadius: 16, padding: 20 },
  impactCard:   { borderRadius: 14, padding: 16 },
  giveCard:     { borderRadius: 14, padding: 16 },
  preset:       { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
  amountInput:  { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12 },
  radio:        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  checkbox:     { width: 20, height: 20, borderRadius: 5, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  giveBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 16 },
  alumniCard:   { borderRadius: 14, padding: 16, borderWidth: StyleSheet.hairlineWidth },
});
