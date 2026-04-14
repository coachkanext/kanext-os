/**
 * Store — Subscriptions (Personal Mode, Owner Only)
 * Manage subscription tiers with real feature access mapping.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, TextInput, Switch, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

// ── Semantic status colors (data values only) ──
const COLOR_ACTIVE  = '#5A8A6E'; // gain/green
const COLOR_PAUSED  = '#9C9790'; // drift/secondary

// ── Feature label map ──
const FEATURE_LABELS: Record<string, string> = {
  exclusivePosts:   'Exclusive posts',
  subscriberKTV:    'Subscriber-only KTV',
  dmAccess:         'DM access',
  communitySpaces:  'Community Spaces',
  monthlyCall:      'Monthly group call',
};

const FEATURE_KEYS = Object.keys(FEATURE_LABELS) as (keyof Tier['features'])[];

// ── Types ──
type Tier = {
  id: string;
  name: string;
  price: number;
  members: number;
  active: boolean;
  color: string;
  features: {
    exclusivePosts: boolean;
    subscriberKTV: boolean;
    dmAccess: boolean;
    communitySpaces: boolean;
    monthlyCall: boolean;
  };
  annualDiscount: number; // percent off, 0 = no annual option
  freeTrial: boolean;
  freeTrialDays: number;
  visibility: 'Published' | 'Hidden';
};

// ── Seed data ──
const INITIAL_TIERS: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    members: 1000,
    active: true,
    color: '#9C9790',
    features: {
      exclusivePosts:  false,
      subscriberKTV:   false,
      dmAccess:        false,
      communitySpaces: false,
      monthlyCall:     false,
    },
    annualDiscount: 0,
    freeTrial:      false,
    freeTrialDays:  0,
    visibility:     'Published',
  },
  {
    id: 'supporters',
    name: 'Supporters',
    price: 10,
    members: 197,
    active: true,
    color: '#5A8A6E',
    features: {
      exclusivePosts:  true,
      subscriberKTV:   true,
      dmAccess:        false,
      communitySpaces: false,
      monthlyCall:     false,
    },
    annualDiscount: 0,
    freeTrial:      false,
    freeTrialDays:  0,
    visibility:     'Published',
  },
  {
    id: 'inner-circle',
    name: 'Inner Circle',
    price: 25,
    members: 50,
    active: true,
    color: '#B8943E',
    features: {
      exclusivePosts:  true,
      subscriberKTV:   true,
      dmAccess:        true,
      communitySpaces: true,
      monthlyCall:     true,
    },
    annualDiscount: 0,
    freeTrial:      false,
    freeTrialDays:  0,
    visibility:     'Published',
  },
];

// ── Screen ──
export default function SubscriptionsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const router = useRouter();
  const [demoRole, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = demoRole === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(insets.top + TOP_BAR_H);

  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/store' as any);
  }, [isOwner]);

  // Data state
  const [tiers, setTiers] = useState<Tier[]>(INITIAL_TIERS);

  // Sheet state
  const [editSheet, setEditSheet] = useState(false);
  const [editTier,  setEditTier]  = useState<Tier | null>(null);

  // Form fields
  const [formName,           setFormName]           = useState('');
  const [formPrice,          setFormPrice]          = useState('');
  const [formAnnualOn,       setFormAnnualOn]       = useState(false);
  const [formAnnualDiscount, setFormAnnualDiscount] = useState('');
  const [formFreeTrial,      setFormFreeTrial]      = useState(false);
  const [formFreeTrialDays,  setFormFreeTrialDays]  = useState('');
  const [formFeatures,       setFormFeatures]       = useState<Tier['features']>({
    exclusivePosts:  false,
    subscriberKTV:   false,
    dmAccess:        false,
    communitySpaces: false,
    monthlyCall:     false,
  });
  const [formVisibility, setFormVisibility] = useState<'Published' | 'Hidden'>('Published');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // Derived metrics
  const totalMRR     = tiers.reduce((sum, t) => sum + t.price * t.members, 0);
  const totalMembers = tiers.reduce((sum, t) => sum + t.members, 0);
  const paidTiers    = tiers.filter(t => t.price > 0).length;

  // ── Edit open ──
  function openEdit(tier: Tier) {
    setEditTier(tier);
    setFormName(tier.name);
    setFormPrice(tier.price > 0 ? String(tier.price) : '');
    setFormAnnualOn(tier.annualDiscount > 0);
    setFormAnnualDiscount(tier.annualDiscount > 0 ? String(tier.annualDiscount) : '');
    setFormFreeTrial(tier.freeTrial);
    setFormFreeTrialDays(tier.freeTrialDays > 0 ? String(tier.freeTrialDays) : '');
    setFormFeatures({ ...tier.features });
    setFormVisibility(tier.visibility);
    setEditSheet(true);
  }

  // ── Save ──
  function handleSave() {
    if (editTier) {
      setTiers(prev => prev.map(t =>
        t.id !== editTier.id ? t : {
          ...t,
          name:           formName.trim() || t.name,
          price:          parseFloat(formPrice) || 0,
          annualDiscount: formAnnualOn ? (parseFloat(formAnnualDiscount) || 0) : 0,
          freeTrial:      formFreeTrial,
          freeTrialDays:  formFreeTrial ? (parseInt(formFreeTrialDays, 10) || 0) : 0,
          features:       { ...formFeatures },
          visibility:     formVisibility,
        }
      ));
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditSheet(false);
  }

  // ── Toggle a feature in the form ──
  function toggleFormFeature(key: keyof Tier['features'], val: boolean) {
    setFormFeatures(prev => ({ ...prev, [key]: val }));
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ── */}
      <Animated.View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={[s.title, { color: C.label }]}>Subscriptions</Text>
          </View>
          <RolePill role={demoRole} onPress={cycleRole} accentColor={C.label} isPrimary={isOwner} />
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <ScrollView
        contentContainerStyle={{
          paddingTop:        insets.top + TOP_BAR_H + 16,
          paddingHorizontal: 16,
          paddingBottom:     insets.bottom + 120,
          gap:               16,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >

        {/* MRR Summary Card */}
        <View style={s.summaryCard}>
          <Text style={s.summaryEyebrow}>Monthly Recurring Revenue</Text>
          <Text style={s.summaryMRR}>${totalMRR.toLocaleString()}</Text>
          <View style={s.summaryRow}>
            <View>
              <Text style={s.summaryStatVal}>{totalMembers.toLocaleString()}</Text>
              <Text style={s.summaryStatLabel}>Total Members</Text>
            </View>
            <View>
              <Text style={s.summaryStatVal}>{paidTiers}</Text>
              <Text style={s.summaryStatLabel}>Paid Tiers</Text>
            </View>
          </View>
        </View>

        {/* Section label */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>Active Tiers</Text>

        {/* Tier Cards */}
        {tiers.map(tier => (
          <View key={tier.id} style={[s.tierCard, { backgroundColor: C.surface }]}>

            {/* Header row */}
            <View style={s.tierHeader}>
              <View style={[s.tierDot, { backgroundColor: tier.color }]} />
              <Text style={[s.tierName, { color: C.label }]}>{tier.name}</Text>
              <Text style={[s.tierPrice, { color: C.label }]}>
                {tier.price === 0 ? 'Free' : `$${tier.price}/mo`}
              </Text>
              <View style={[s.statusDot, { backgroundColor: tier.active ? COLOR_ACTIVE : COLOR_PAUSED }]} />
            </View>

            {/* Member count row */}
            <View style={[s.memberRow, { borderTopColor: C.separator }]}>
              <IconSymbol name="person.2.fill" size={13} color={C.secondary} />
              <Text style={[s.memberText, { color: C.secondary }]}>
                {tier.members.toLocaleString()} members
              </Text>
            </View>

            {/* Features section */}
            <View style={s.featuresSection}>
              {FEATURE_KEYS.map(key => {
                const enabled = tier.features[key];
                return (
                  <View key={key} style={s.featureRow}>
                    {enabled
                      ? <IconSymbol name="checkmark" size={12} color={tier.color} style={{ marginTop: 2 }} />
                      : <Text style={[s.featureDash, { color: C.secondary }]}>–</Text>
                    }
                    <Text style={[s.featureLabel, { color: enabled ? C.label : C.secondary }]}>
                      {FEATURE_LABELS[key]}
                    </Text>
                  </View>
                );
              })}
            </View>

            {/* Edit button */}
            <Pressable
              style={[s.editBtn, { borderTopColor: C.separator }]}
              onPress={() => openEdit(tier)}
            >
              <Text style={[s.editBtnText, { color: C.label }]}>Edit Tier</Text>
            </Pressable>
          </View>
        ))}

        {/* Create Tier button */}
        <Pressable
          style={({ pressed }) => [
            s.createBtn,
            { borderColor: C.separator, backgroundColor: pressed ? C.surface : 'transparent' },
          ]}
          onPress={() => {}}
        >
          <IconSymbol name="plus.circle.fill" size={16} color={C.label} />
          <Text style={[s.createBtnText, { color: C.label }]}>+ Create Tier</Text>
        </Pressable>

        {/* Dipson suggestion button */}
        <Pressable
          style={({ pressed }) => [
            s.dipsonBtn,
            { backgroundColor: pressed ? C.separator : C.surface },
          ]}
          onPress={() => {}}
        >
          <IconSymbol name="sparkles" size={14} color={C.secondary} />
          <Text style={[s.dipsonText, { color: C.secondary }]}>
            Suggest tier pricing with Dipson
          </Text>
        </Pressable>

      </ScrollView>

      {/* ── Edit Tier Sheet ── */}
      <BottomSheet visible={editSheet} onClose={() => setEditSheet(false)} useModal>
        <View style={s.sheetInner}>

          <Text style={[s.sheetTitle, { color: C.label }]}>
            {editTier ? 'Edit Tier' : 'New Tier'}
          </Text>

          {/* 1. Tier Name */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Tier Name</Text>
            <TextInput
              value={formName}
              onChangeText={setFormName}
              placeholder="e.g. Inner Circle"
              placeholderTextColor={C.secondary}
              style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.bg }]}
            />
          </View>

          {/* 2. Price */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>
              {(!formPrice || parseFloat(formPrice) === 0) ? 'Free tier' : 'Price (monthly)'}
            </Text>
            <TextInput
              value={formPrice}
              onChangeText={setFormPrice}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={C.secondary}
              style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.bg }]}
            />
          </View>

          {/* 3. Annual discount toggle */}
          <View style={[s.toggleRow, { borderColor: C.separator }]}>
            <Text style={[s.toggleLabel, { color: C.label }]}>Offer annual plan</Text>
            <Switch
              value={formAnnualOn}
              onValueChange={setFormAnnualOn}
              trackColor={{ false: C.separator, true: C.label }}
              thumbColor={C.bg}
            />
          </View>
          {formAnnualOn && (
            <View style={s.formGroup}>
              <Text style={[s.formLabel, { color: C.secondary }]}>Annual discount (%)</Text>
              <TextInput
                value={formAnnualDiscount}
                onChangeText={setFormAnnualDiscount}
                keyboardType="decimal-pad"
                placeholder="e.g. 20"
                placeholderTextColor={C.secondary}
                style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.bg }]}
              />
            </View>
          )}

          {/* 4. Free trial toggle */}
          <View style={[s.toggleRow, { borderColor: C.separator }]}>
            <Text style={[s.toggleLabel, { color: C.label }]}>Free trial</Text>
            <Switch
              value={formFreeTrial}
              onValueChange={setFormFreeTrial}
              trackColor={{ false: C.separator, true: C.label }}
              thumbColor={C.bg}
            />
          </View>
          {formFreeTrial && (
            <View style={s.formGroup}>
              <Text style={[s.formLabel, { color: C.secondary }]}>Trial duration (days)</Text>
              <TextInput
                value={formFreeTrialDays}
                onChangeText={setFormFreeTrialDays}
                keyboardType="decimal-pad"
                placeholder="e.g. 7"
                placeholderTextColor={C.secondary}
                style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.bg }]}
              />
            </View>
          )}

          {/* 5. Member Access features */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Member Access</Text>
            <View style={[s.featuresBox, { borderColor: C.separator, backgroundColor: C.bg }]}>
              {FEATURE_KEYS.map((key, idx) => (
                <View
                  key={key}
                  style={[
                    s.featureToggleRow,
                    idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                  ]}
                >
                  <Text style={[s.featureToggleLabel, { color: C.label }]}>
                    {FEATURE_LABELS[key]}
                  </Text>
                  <Switch
                    value={formFeatures[key]}
                    onValueChange={val => toggleFormFeature(key, val)}
                    trackColor={{ false: C.separator, true: C.label }}
                    thumbColor={C.bg}
                  />
                </View>
              ))}
            </View>
          </View>

          {/* 6. Visibility */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Visibility</Text>
            <View style={s.visibilityRow}>
              {(['Published', 'Hidden'] as const).map(opt => {
                const active = formVisibility === opt;
                return (
                  <Pressable
                    key={opt}
                    style={[
                      s.visibilityPill,
                      {
                        backgroundColor: active ? C.activePill : C.surface,
                        borderColor:     active ? C.activePill : C.separator,
                      },
                    ]}
                    onPress={() => setFormVisibility(opt)}
                  >
                    <Text style={[s.visibilityPillText, { color: active ? C.activePillText : C.secondary }]}>
                      {opt}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Save button */}
          <Pressable style={[s.saveBtn, { backgroundColor: C.label }]} onPress={handleSave}>
            <Text style={[s.saveBtnText, { color: C.bg }]}>Save Tier</Text>
          </Pressable>

        </View>
      </BottomSheet>
    </View>
  );
}

// ── Styles ──
const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:              { flex: 1 },

  // Top bar
  topBarOuter:       { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:            { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titleWrap:         { flex: 1, alignItems: 'center' },
  title:             { fontSize: 15, fontWeight: '700' },

  // Section label
  sectionLabel:      { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },

  // MRR Summary Card
  summaryCard:       { backgroundColor: '#1A1714', borderRadius: 16, padding: 18, gap: 4 },
  summaryEyebrow:    { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.6 },
  summaryMRR:        { fontSize: 32, fontWeight: '900', color: '#FFFFFF' },
  summaryRow:        { flexDirection: 'row', gap: 24, marginTop: 6 },
  summaryStatVal:    { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  summaryStatLabel:  { fontSize: 10, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  // Tier card
  tierCard:          { borderRadius: 14, overflow: 'hidden' },
  tierHeader:        { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14 },
  tierDot:           { width: 10, height: 10, borderRadius: 5 },
  tierName:          { flex: 1, fontSize: 15, fontWeight: '700' },
  tierPrice:         { fontSize: 14, fontWeight: '700' },
  statusDot:         { width: 8, height: 8, borderRadius: 4 },

  memberRow:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, marginBottom: 6 },
  memberText:        { fontSize: 13 },

  // Features
  featuresSection:   { paddingHorizontal: 14, paddingBottom: 6, gap: 5 },
  featureRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 7 },
  featureDash:       { fontSize: 12, lineHeight: 18, width: 12, textAlign: 'center' },
  featureLabel:      { fontSize: 13, flex: 1 },

  // Edit button
  editBtn:           { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 13, alignItems: 'center', marginTop: 6 },
  editBtnText:       { fontSize: 14, fontWeight: '600' },

  // Create button
  createBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 14, borderStyle: 'dashed', paddingVertical: 16 },
  createBtnText:     { fontSize: 15, fontWeight: '600' },

  // Dipson button
  dipsonBtn:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 14, paddingVertical: 14 },
  dipsonText:        { fontSize: 14, fontWeight: '500' },

  // Sheet
  sheetInner:        { padding: 20, gap: 16, paddingBottom: 24 },
  sheetTitle:        { fontSize: 18, fontWeight: '700', marginBottom: 4 },
  formGroup:         { gap: 7 },
  formLabel:         { fontSize: 13, fontWeight: '600' },
  input:             { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 15 },

  // Toggle row
  toggleRow:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  toggleLabel:       { fontSize: 15 },

  // Features box (inside sheet)
  featuresBox:       { borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, overflow: 'hidden' },
  featureToggleRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10 },
  featureToggleLabel:{ fontSize: 15, flex: 1 },

  // Visibility pills
  visibilityRow:     { flexDirection: 'row', gap: 8 },
  visibilityPill:    { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10, borderWidth: StyleSheet.hairlineWidth },
  visibilityPillText:{ fontSize: 14, fontWeight: '600' },

  // Save button
  saveBtn:           { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText:       { fontSize: 15, fontWeight: '700' },
});
