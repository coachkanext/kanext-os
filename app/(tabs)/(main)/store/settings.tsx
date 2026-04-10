/**
 * Store — Settings (Personal Mode, Owner Only)
 * Configure payment processing, tax, shipping, digital delivery, policies, notifications, and currency.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN = '#5A8A6E';

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionHeader({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 16, marginBottom: 2 }}>
      {title}
    </Text>
  );
}

function SettingsRow({
  icon, label, value, onPress, isLast, C, rightElement,
}: {
  icon: string; label: string; value?: string;
  onPress?: () => void; isLast?: boolean;
  C: ComponentColors; rightElement?: React.ReactNode;
}) {
  return (
    <Pressable
      style={({ pressed }) => ({
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 16, paddingVertical: 13,
        backgroundColor: pressed && onPress ? C.separator : 'transparent',
        borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: C.separator,
      })}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={{ flex: 1, fontSize: 15, color: C.label }}>{label}</Text>
      {rightElement ?? (
        value != null ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 14, color: C.secondary }}>{value}</Text>
            {onPress && <IconSymbol name="chevron.right" size={13} color={C.secondary} />}
          </View>
        ) : (
          onPress && <IconSymbol name="chevron.right" size={13} color={C.secondary} />
        )
      )}
    </Pressable>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function StoreSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const router = useRouter();
  const [demoRole, cycleRole, roleCycles] = useDemoRole('personal:store');
  const isOwner = demoRole === roleCycles[0];

  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/store' as any);
  }, [isOwner]);

  // Tax
  const [taxEnabled,    setTaxEnabled]    = useState(true);
  const [autoCalcTax,   setAutoCalcTax]   = useState(true);
  const [taxRate,       setTaxRate]       = useState('8.25');
  const [taxId,         setTaxId]         = useState('');

  // Shipping
  const [freeShipping,    setFreeShipping]    = useState(false);
  const [shippingMethod,  setShippingMethod]  = useState<'flat' | 'calculated'>('flat');
  const [flatRate,        setFlatRate]        = useState('5.99');
  const [freeThreshold,   setFreeThreshold]   = useState('75');
  const [processingTime,  setProcessingTime]  = useState('3-5 business days');
  const [intlShipping,    setIntlShipping]    = useState(false);

  // Digital Delivery
  const [deliveryMethod, setDeliveryMethod] = useState<'download' | 'email' | 'library'>('download');

  // Notifications
  const [notifyNewSale,       setNotifyNewSale]       = useState(true);
  const [notifyNewSub,        setNotifyNewSub]        = useState(true);
  const [notifyRefund,        setNotifyRefund]        = useState(true);
  const [notifyLowInventory,  setNotifyLowInventory]  = useState(false);

  // Payment
  const [defaultPayment, setDefaultPayment] = useState<'kaypay' | 'stripe' | 'paypal'>('kaypay');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  function tap() { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }

  // Payment right elements
  function paymentRightElement(provider: 'kaypay' | 'stripe' | 'paypal') {
    const connected = provider === 'kaypay';
    const isDefault = defaultPayment === provider;
    if (connected) {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: GAIN }} />
          <Text style={{ fontSize: 13, color: GAIN, fontWeight: '600' }}>Connected</Text>
          {isDefault && (
            <Text style={{ fontSize: 11, color: C.secondary, marginLeft: 2 }}>Default</Text>
          )}
        </View>
      );
    }
    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 13, color: C.secondary }}>Not connected</Text>
        <IconSymbol name="chevron.right" size={13} color={C.secondary} />
      </View>
    );
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 40, alignItems: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={s.titleWrap}>
            <Text style={[s.title, { color: C.label }]}>Store Settings</Text>
          </View>
          <RolePill role={demoRole} onPress={cycleRole} accentColor="#1A1714" isPrimary={isOwner} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 20, paddingBottom: insets.bottom + 40, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── 1. Payment Processing ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Payment Processing" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SettingsRow
              icon="k.circle.fill" label="KaNeXT Pay"
              C={C}
              onPress={() => { tap(); setDefaultPayment('kaypay'); }}
              rightElement={paymentRightElement('kaypay')}
            />
            <SettingsRow
              icon="creditcard.fill" label="Stripe"
              C={C}
              onPress={() => {}}
              rightElement={paymentRightElement('stripe')}
            />
            <SettingsRow
              icon="p.circle.fill" label="PayPal"
              C={C}
              isLast
              onPress={() => {}}
              rightElement={paymentRightElement('paypal')}
            />
          </View>
        </View>

        {/* ── 2. Tax Settings ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Tax Settings" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SettingsRow
              icon="percent" label="Collect Sales Tax"
              C={C}
              rightElement={
                <Switch
                  value={taxEnabled}
                  onValueChange={v => { tap(); setTaxEnabled(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
            {taxEnabled && (
              <>
                <SettingsRow
                  icon="doc.text.fill" label="Auto-Calculate Tax"
                  C={C}
                  rightElement={
                    <Switch
                      value={autoCalcTax}
                      onValueChange={v => { tap(); setAutoCalcTax(v); }}
                      trackColor={{ true: C.label, false: C.separator }}
                      thumbColor={C.bg}
                    />
                  }
                />
                <SettingsRow
                  icon="building.2.fill" label="Tax Rate"
                  C={C}
                  value={autoCalcTax ? 'Auto' : `${taxRate}%`}
                  onPress={autoCalcTax ? undefined : () => tap()}
                />
                <SettingsRow
                  icon="number" label="Tax ID"
                  C={C}
                  isLast
                  value={taxId || 'Not set'}
                  onPress={() => {}}
                />
              </>
            )}
            {!taxEnabled && <View style={{ height: 1 }} />}
          </View>
        </View>

        {/* ── 3. Shipping (Merch only) ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Shipping" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {/* Info text */}
            <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>
                Applies to physical (Merch) products only.
              </Text>
            </View>
            {/* Domestic zone label */}
            <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Domestic
              </Text>
            </View>
            <SettingsRow
              icon="shippingbox.fill" label="Free Shipping"
              C={C}
              rightElement={
                <Switch
                  value={freeShipping}
                  onValueChange={v => { tap(); setFreeShipping(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
            {!freeShipping && (
              <>
                <SettingsRow
                  icon="arrow.triangle.branch" label="Shipping Method"
                  C={C}
                  value={shippingMethod === 'flat' ? 'Flat Rate' : 'Calculated'}
                  onPress={() => { tap(); setShippingMethod(m => m === 'flat' ? 'calculated' : 'flat'); }}
                />
                {shippingMethod === 'flat' && (
                  <SettingsRow
                    icon="dollarsign.circle" label="Flat Rate"
                    C={C}
                    value={`$${flatRate}`}
                    onPress={() => tap()}
                  />
                )}
                <SettingsRow
                  icon="cart.badge.plus" label="Free Threshold"
                  C={C}
                  value={`$${freeThreshold}+`}
                  onPress={() => tap()}
                />
              </>
            )}
            <SettingsRow
              icon="clock.fill" label="Processing Time"
              C={C}
              value={processingTime}
              onPress={() => tap()}
            />
            {/* Divider */}
            <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginVertical: 8, marginHorizontal: 16 }} />
            <SettingsRow
              icon="airplane" label="International Shipping"
              C={C}
              isLast
              rightElement={
                <Switch
                  value={intlShipping}
                  onValueChange={v => { tap(); setIntlShipping(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
          </View>
        </View>

        {/* ── 4. Digital Delivery ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Digital Delivery" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {([
              { key: 'download', label: 'Instant Download',  icon: 'arrow.down.circle.fill' },
              { key: 'email',    label: 'Email Delivery',     icon: 'envelope.fill' },
              { key: 'library',  label: 'In-App Library',     icon: 'books.vertical.fill' },
            ] as const).map((opt, idx, arr) => (
              <Pressable
                key={opt.key}
                onPress={() => { tap(); setDeliveryMethod(opt.key); }}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', gap: 12,
                  paddingHorizontal: 16, paddingVertical: 13,
                  backgroundColor: pressed ? C.separator : 'transparent',
                  borderBottomWidth: idx < arr.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                })}
              >
                <IconSymbol name={opt.icon as any} size={18} color={C.secondary} />
                <Text style={{ flex: 1, fontSize: 15, color: C.label }}>{opt.label}</Text>
                {deliveryMethod === opt.key && (
                  <IconSymbol name="checkmark" size={15} color={C.label} />
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── 5. Store Policies ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Store Policies" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SettingsRow icon="arrow.uturn.left.circle.fill" label="Refund Policy"   C={C} value="30 days" onPress={() => tap()} />
            <SettingsRow icon="doc.text.fill"                label="Terms of Service" C={C} onPress={() => tap()} />
            <SettingsRow icon="hand.raised.fill"             label="Privacy Policy"   C={C} onPress={() => tap()} isLast />
          </View>
        </View>

        {/* ── 6. Notifications ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Notifications" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SettingsRow
              icon="bag.fill" label="New Sale"
              C={C}
              rightElement={
                <Switch
                  value={notifyNewSale}
                  onValueChange={v => { tap(); setNotifyNewSale(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
            <SettingsRow
              icon="person.badge.plus" label="New Subscriber"
              C={C}
              rightElement={
                <Switch
                  value={notifyNewSub}
                  onValueChange={v => { tap(); setNotifyNewSub(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
            <SettingsRow
              icon="arrow.uturn.left" label="Refund Request"
              C={C}
              rightElement={
                <Switch
                  value={notifyRefund}
                  onValueChange={v => { tap(); setNotifyRefund(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
            <SettingsRow
              icon="exclamationmark.triangle.fill" label="Low Inventory (Merch)"
              C={C}
              isLast
              rightElement={
                <Switch
                  value={notifyLowInventory}
                  onValueChange={v => { tap(); setNotifyLowInventory(v); }}
                  trackColor={{ true: C.label, false: C.separator }}
                  thumbColor={C.bg}
                />
              }
            />
          </View>
        </View>

        {/* ── 7. Currency ── */}
        <View style={{ gap: 6 }}>
          <SectionHeader title="Currency" C={C} />
          <View style={[s.card, { backgroundColor: C.surface }]}>
            <SettingsRow
              icon="dollarsign.circle.fill" label="Store Currency"
              C={C}
              value="USD ($)"
              onPress={() => tap()}
              isLast
            />
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root:        { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titleWrap:   { flex: 1, alignItems: 'center' },
  title:       { fontSize: 15, fontWeight: '700' },
  card:        { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
});
