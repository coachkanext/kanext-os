/**
 * Store — Coupons (Personal Mode, Owner Only, MANAGE)
 * Discount code manager with full creation flow.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, TextInput,
  Switch, ActionSheetIOS, Platform, Alert, Animated,
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

// ─── Types ────────────────────────────────────────────────────────────────────

type CouponStatus   = 'active' | 'paused' | 'expired';
type DiscountType   = 'percent' | 'fixed' | 'trial';
type AppliesTo      = 'All Products' | 'Specific Products' | 'Subscriptions' | 'Specific Tier';

type Coupon = {
  id:               string;
  code:             string;
  discountType:     DiscountType;
  value:            number;        // percent, dollar amount, or days (for trial)
  appliesTo:        AppliesTo;
  timesUsed:        number;
  revenueImpact:    number;        // dollars saved by customers
  limitTotal:       number | null; // null = unlimited
  limitPerCustomer: 'once' | 'unlimited';
  minPurchase:      number | null; // null = no minimum
  status:           CouponStatus;
  expires:          string | null;
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<CouponStatus, { label: string; dot: string }> = {
  active:  { label: 'Active',  dot: '#5A8A6E' },
  paused:  { label: 'Paused',  dot: '#B8943E' },
  expired: { label: 'Expired', dot: '#9C9790' },
};

// ─── Seed data ────────────────────────────────────────────────────────────────

const INITIAL_COUPONS: Coupon[] = [
  {
    id: '1', code: 'LAUNCH20',      discountType: 'percent', value: 20,
    appliesTo: 'All Products',      timesUsed: 84,  revenueImpact: 336.00,
    limitTotal: null, limitPerCustomer: 'unlimited', minPurchase: null,
    status: 'active',  expires: null,
  },
  {
    id: '2', code: 'INNERCIRCLE50', discountType: 'percent', value: 50,
    appliesTo: 'Subscriptions',     timesUsed: 12,  revenueImpact: 60.00,
    limitTotal: 20,   limitPerCustomer: 'once',      minPurchase: null,
    status: 'active',  expires: 'Aug 31, 2026',
  },
  {
    id: '3', code: 'SUMMER10',      discountType: 'percent', value: 10,
    appliesTo: 'All Products',      timesUsed: 31,  revenueImpact: 124.50,
    limitTotal: 50,   limitPerCustomer: 'unlimited', minPurchase: 25.00,
    status: 'paused',  expires: 'Sep 1, 2026',
  },
  {
    id: '4', code: 'BLUEPRINT',     discountType: 'fixed',   value: 15,
    appliesTo: 'Specific Products', timesUsed: 57,  revenueImpact: 855.00,
    limitTotal: null, limitPerCustomer: 'unlimited', minPurchase: null,
    status: 'expired', expires: 'Apr 1, 2026',
  },
];

const APPLIES_TO_OPTIONS: AppliesTo[] = [
  'All Products',
  'Specific Products',
  'Subscriptions',
  'Specific Tier',
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function discountLabel(c: Coupon): string {
  if (c.discountType === 'percent') return `${c.value}% off`;
  if (c.discountType === 'fixed')   return `$${c.value} off`;
  return `+${c.value}-day trial`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function CouponsScreen() {
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

  // List state
  const [coupons,     setCoupons]     = useState<Coupon[]>(INITIAL_COUPONS);
  const [createSheet, setCreateSheet] = useState(false);

  // Form state
  const [formCode,        setFormCode]        = useState('');
  const [formDiscountType, setFormDiscountType] = useState<DiscountType>('percent');
  const [formValue,       setFormValue]       = useState('');
  const [formAppliesTo,   setFormAppliesTo]   = useState<AppliesTo>('All Products');
  const [formLimitType,   setFormLimitType]   = useState<'unlimited' | 'limited'>('unlimited');
  const [formLimit,       setFormLimit]       = useState('');
  const [formPerCustomer, setFormPerCustomer] = useState<'once' | 'unlimited'>('unlimited');
  const [formMinPurchase, setFormMinPurchase] = useState('');
  const [formHasExpiry,   setFormHasExpiry]   = useState(false);
  const [formExpiry,      setFormExpiry]      = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Form helpers ──────────────────────────────────────────────────────────

  function resetForm() {
    setFormCode('');
    setFormDiscountType('percent');
    setFormValue('');
    setFormAppliesTo('All Products');
    setFormLimitType('unlimited');
    setFormLimit('');
    setFormPerCustomer('unlimited');
    setFormMinPurchase('');
    setFormHasExpiry(false);
    setFormExpiry('');
  }

  function openCreate() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    resetForm();
    setCreateSheet(true);
  }

  function handleCreate() {
    if (!formCode.trim() || !formValue.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const newCoupon: Coupon = {
      id:               Date.now().toString(),
      code:             formCode.toUpperCase().trim(),
      discountType:     formDiscountType,
      value:            parseFloat(formValue) || 0,
      appliesTo:        formAppliesTo,
      timesUsed:        0,
      revenueImpact:    0,
      limitTotal:       formLimitType === 'limited' && formLimit ? parseInt(formLimit, 10) : null,
      limitPerCustomer: formPerCustomer,
      minPurchase:      formMinPurchase ? parseFloat(formMinPurchase) : null,
      status:           'active',
      expires:          formHasExpiry && formExpiry ? formExpiry : null,
    };
    setCoupons(prev => [newCoupon, ...prev]);
    resetForm();
    setCreateSheet(false);
  }

  // ── 3-dot menu ───────────────────────────────────────────────────────────

  function openMenu(coupon: Coupon) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isActive      = coupon.status === 'active';
    const toggleLabel   = isActive ? 'Pause' : 'Activate';

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Edit', toggleLabel, 'Duplicate', 'Delete'],
          destructiveButtonIndex: 4,
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 2) {
            // Pause / Activate
            setCoupons(prev => prev.map(c =>
              c.id === coupon.id
                ? { ...c, status: isActive ? 'paused' : 'active' }
                : c
            ));
          }
          if (idx === 3) {
            // Duplicate
            const dup: Coupon = {
              ...coupon,
              id:        Date.now().toString(),
              code:      coupon.code + '_COPY',
              timesUsed: 0,
              revenueImpact: 0,
              status:    'paused',
            };
            setCoupons(prev => [dup, ...prev]);
          }
          if (idx === 4) {
            // Delete
            setCoupons(prev => prev.filter(c => c.id !== coupon.id));
          }
        }
      );
    } else {
      Alert.alert(coupon.code, undefined, [
        {
          text: toggleLabel,
          onPress: () => setCoupons(prev => prev.map(c =>
            c.id === coupon.id
              ? { ...c, status: isActive ? 'paused' : 'active' }
              : c
          )),
        },
        {
          text: 'Duplicate',
          onPress: () => {
            const dup: Coupon = {
              ...coupon,
              id:        Date.now().toString(),
              code:      coupon.code + '_COPY',
              timesUsed: 0,
              revenueImpact: 0,
              status:    'paused',
            };
            setCoupons(prev => [dup, ...prev]);
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setCoupons(prev => prev.filter(c => c.id !== coupon.id)),
        },
        { text: 'Cancel', style: 'cancel' },
      ]);
    }
  }

  // ── Sub-components ────────────────────────────────────────────────────────

  function CouponCard({ coupon }: { coupon: Coupon }) {
    const cfg = STATUS_CONFIG[coupon.status];
    return (
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {/* Row 1: code + status */}
        <View style={s.cardRow1}>
          <Text style={[s.codeText, { color: C.label }]}>{coupon.code}</Text>
          <View style={s.statusBadge}>
            <View style={[s.statusDot, { backgroundColor: cfg.dot }]} />
            <Text style={[s.statusLabel, { color: cfg.dot }]}>{cfg.label}</Text>
          </View>
        </View>

        {/* Row 2: discount label */}
        <Text style={[s.discountLabel, { color: C.label }]}>{discountLabel(coupon)}</Text>

        {/* Row 3: applies to */}
        <Text style={[s.appliesToText, { color: C.secondary }]}>{coupon.appliesTo}</Text>

        {/* Row 4: stats */}
        <View style={s.statsRow}>
          <Text style={[s.statItem, { color: C.secondary }]}>
            {coupon.timesUsed} uses
          </Text>
          <Text style={[s.statItem, { color: '#B85C5C' }]}>
            {'-$' + coupon.revenueImpact.toFixed(2) + ' rev impact'}
          </Text>
          <Text style={[s.statItem, { color: C.secondary }]}>
            {'Limit: ' + (coupon.limitTotal !== null ? coupon.limitTotal : 'Unlimited')}
          </Text>
        </View>

        {/* Row 5: expiry */}
        <Text style={[s.expiryText, { color: C.secondary }]}>
          {coupon.expires ? `Expires ${coupon.expires}` : 'No expiration'}
        </Text>

        {/* Row 6: separator + 3-dot */}
        <View style={[s.cardFooter, { borderTopColor: C.separator }]}>
          <Pressable
            onPress={() => openMenu(coupon)}
            hitSlop={12}
            style={s.ellipsisBtn}
          >
            <IconSymbol name="ellipsis" size={16} color={C.secondary} />
          </Pressable>
        </View>
      </View>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  const isEmpty = coupons.length === 0;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={[s.title, { color: C.label }]}>Coupons</Text>
          </View>
          <RolePill role={demoRole} onPress={cycleRole} accentColor="#1A1714" isPrimary={isOwner} />
        </View>
      </Animated.View>

      {/* List */}
      <ScrollView
        contentContainerStyle={{
          paddingTop:        insets.top + TOP_BAR_H + 16,
          paddingHorizontal: 16,
          paddingBottom:     insets.bottom + 100,
          gap:               12,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Empty state */}
        {isEmpty && (
          <View style={s.emptyWrap}>
            <IconSymbol name="tag.fill" size={40} color={C.secondary} />
            <Text style={[s.emptyTitle, { color: C.label }]}>No coupons yet</Text>
            <Text style={[s.emptyBody, { color: C.secondary }]}>
              Create a discount code to boost sales.
            </Text>
          </View>
        )}

        {/* Coupon cards */}
        {coupons.map(c => <CouponCard key={c.id} coupon={c} />)}

        {/* Create button */}
        <Pressable
          style={({ pressed }) => [
            s.createBtn,
            { borderColor: C.separator, backgroundColor: pressed ? C.surface : 'transparent' },
          ]}
          onPress={openCreate}
        >
          <IconSymbol name="plus.circle.fill" size={16} color={C.label} />
          <Text style={[s.createBtnText, { color: C.label }]}>+ Create Coupon</Text>
        </Pressable>
      </ScrollView>

      {/* Create Coupon BottomSheet */}
      <BottomSheet visible={createSheet} onClose={() => setCreateSheet(false)} useModal>
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 48 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[s.sheetTitle, { color: C.label }]}>New Coupon</Text>

          {/* 1. Code field */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Discount Code</Text>
            <View style={s.codeRow}>
              <TextInput
                value={formCode}
                onChangeText={t => setFormCode(t.toUpperCase())}
                placeholder="LAUNCH20"
                placeholderTextColor={C.secondary}
                autoCapitalize="characters"
                autoCorrect={false}
                style={[
                  s.input,
                  { borderColor: C.separator, color: C.label, backgroundColor: C.surface, flex: 1, fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
                ]}
              />
              <Pressable
                onPress={() => setFormCode(generateCode())}
                style={[s.generateBtn, { backgroundColor: C.surface, borderColor: C.separator }]}
              >
                <Text style={[s.generateBtnText, { color: C.label }]}>Generate</Text>
              </Pressable>
            </View>
          </View>

          {/* 2. Discount Type pills */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Discount Type</Text>
            <View style={s.pillRow}>
              {(['percent', 'fixed', 'trial'] as DiscountType[]).map(dt => {
                const active = formDiscountType === dt;
                const label  = dt === 'percent' ? '% Off' : dt === 'fixed' ? '$ Off' : 'Free Trial Extension';
                return (
                  <Pressable
                    key={dt}
                    onPress={() => setFormDiscountType(dt)}
                    style={[
                      s.typePill,
                      active
                        ? { backgroundColor: C.label, borderColor: C.label }
                        : { backgroundColor: C.surface, borderColor: C.separator },
                    ]}
                  >
                    <Text style={[s.typePillText, { color: active ? C.bg : C.label }]}>{label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 3. Value */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>
              {formDiscountType === 'percent' ? 'Discount %' : formDiscountType === 'fixed' ? 'Amount ($)' : 'Trial Days'}
            </Text>
            <TextInput
              value={formValue}
              onChangeText={setFormValue}
              keyboardType="decimal-pad"
              placeholder={formDiscountType === 'percent' ? '20' : formDiscountType === 'fixed' ? '15' : '7'}
              placeholderTextColor={C.secondary}
              style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.surface }]}
            />
          </View>

          {/* 4. Applies To */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Applies To</Text>
            <View style={[s.selectorContainer, { borderColor: C.separator, backgroundColor: C.surface }]}>
              {APPLIES_TO_OPTIONS.map((opt, idx) => {
                const selected = formAppliesTo === opt;
                const isLast   = idx === APPLIES_TO_OPTIONS.length - 1;
                return (
                  <Pressable
                    key={opt}
                    onPress={() => setFormAppliesTo(opt)}
                    style={[
                      s.selectorRow,
                      !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                    ]}
                  >
                    <Text style={[s.selectorText, { color: selected ? C.label : C.secondary, fontWeight: selected ? '600' : '400' }]}>
                      {opt}
                    </Text>
                    {selected && <IconSymbol name="checkmark" size={14} color={C.label} />}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 5. Usage Limit */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Usage Limit</Text>
            <View style={s.pillRow}>
              {(['unlimited', 'limited'] as const).map(lt => {
                const active = formLimitType === lt;
                return (
                  <Pressable
                    key={lt}
                    onPress={() => setFormLimitType(lt)}
                    style={[
                      s.togglePill,
                      active
                        ? { backgroundColor: C.label, borderColor: C.label }
                        : { backgroundColor: C.surface, borderColor: C.separator },
                    ]}
                  >
                    <Text style={[s.togglePillText, { color: active ? C.bg : C.label }]}>
                      {lt === 'unlimited' ? 'Unlimited' : 'Limited'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            {formLimitType === 'limited' && (
              <TextInput
                value={formLimit}
                onChangeText={setFormLimit}
                keyboardType="number-pad"
                placeholder="e.g. 100"
                placeholderTextColor={C.secondary}
                style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.surface, marginTop: 8 }]}
              />
            )}
          </View>

          {/* 6. Per-Customer Limit */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Per-Customer Limit</Text>
            <View style={s.pillRow}>
              {(['once', 'unlimited'] as const).map(pc => {
                const active = formPerCustomer === pc;
                return (
                  <Pressable
                    key={pc}
                    onPress={() => setFormPerCustomer(pc)}
                    style={[
                      s.togglePill,
                      active
                        ? { backgroundColor: C.label, borderColor: C.label }
                        : { backgroundColor: C.surface, borderColor: C.separator },
                    ]}
                  >
                    <Text style={[s.togglePillText, { color: active ? C.bg : C.label }]}>
                      {pc === 'once' ? 'Once' : 'Unlimited'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* 7. Minimum Purchase */}
          <View style={s.formGroup}>
            <Text style={[s.formLabel, { color: C.secondary }]}>Minimum Purchase (optional)</Text>
            <TextInput
              value={formMinPurchase}
              onChangeText={setFormMinPurchase}
              keyboardType="decimal-pad"
              placeholder="No minimum"
              placeholderTextColor={C.secondary}
              style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.surface }]}
            />
          </View>

          {/* 8. Expiration Date */}
          <View style={s.formGroup}>
            <View style={s.expiryToggleRow}>
              <Text style={[s.formLabel, { color: C.secondary }]}>Expiration Date</Text>
              <Switch
                value={formHasExpiry}
                onValueChange={setFormHasExpiry}
                trackColor={{ false: C.separator, true: C.label }}
                thumbColor={C.bg}
                ios_backgroundColor={C.separator}
              />
            </View>
            {formHasExpiry && (
              <TextInput
                value={formExpiry}
                onChangeText={setFormExpiry}
                placeholder="MMM DD, YYYY"
                placeholderTextColor={C.secondary}
                style={[s.input, { borderColor: C.separator, color: C.label, backgroundColor: C.surface, marginTop: 8 }]}
              />
            )}
          </View>

          {/* 9. Save & Activate */}
          <Pressable
            style={({ pressed }) => [s.saveBtn, { backgroundColor: C.label, opacity: pressed ? 0.85 : 1 }]}
            onPress={handleCreate}
          >
            <Text style={[s.saveBtnText, { color: C.bg }]}>Save &amp; Activate</Text>
          </Pressable>
        </ScrollView>
      </BottomSheet>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:         { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titleWrap:    { flex: 1, alignItems: 'center' },
  title:        { fontSize: 15, fontWeight: '700' },

  // ── Empty state
  emptyWrap:    { alignItems: 'center', paddingVertical: 72, gap: 12 },
  emptyTitle:   { fontSize: 17, fontWeight: '700' },
  emptyBody:    { fontSize: 14, textAlign: 'center', lineHeight: 20 },

  // ── Coupon card
  card:         { borderRadius: 12, padding: 14, gap: 6 },
  cardRow1:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  codeText:     { fontSize: 15, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  statusDot:    { width: 8, height: 8, borderRadius: 4 },
  statusLabel:  { fontSize: 12, fontWeight: '600' },
  discountLabel:{ fontSize: 18, fontWeight: '700' },
  appliesToText:{ fontSize: 12 },
  statsRow:     { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginTop: 2 },
  statItem:     { fontSize: 12 },
  expiryText:   { fontSize: 12, marginTop: 2 },
  cardFooter:   { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 6, paddingTop: 8, flexDirection: 'row', justifyContent: 'flex-end' },
  ellipsisBtn:  { padding: 4 },

  // ── Create button
  createBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderRadius: 14, borderStyle: 'dashed', paddingVertical: 16, marginTop: 4 },
  createBtnText:{ fontSize: 15, fontWeight: '600' },

  // ── Sheet
  sheetTitle:   { fontSize: 18, fontWeight: '700' },
  formGroup:    { gap: 6 },
  formLabel:    { fontSize: 13, fontWeight: '600' },
  input:        { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 },

  // Code row
  codeRow:      { flexDirection: 'row', gap: 8 },
  generateBtn:  { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  generateBtnText: { fontSize: 12, fontWeight: '600' },

  // Pills
  pillRow:      { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  typePill:     { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  typePillText: { fontSize: 12, fontWeight: '600' },
  togglePill:   { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10, borderWidth: 1 },
  togglePillText:{ fontSize: 13, fontWeight: '600' },

  // Applies-to selector
  selectorContainer: { borderWidth: 1, borderRadius: 10, overflow: 'hidden' },
  selectorRow:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  selectorText:      { fontSize: 14 },

  // Expiry toggle
  expiryToggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  // Save button
  saveBtn:      { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 4 },
  saveBtnText:  { fontSize: 15, fontWeight: '700' },
});
