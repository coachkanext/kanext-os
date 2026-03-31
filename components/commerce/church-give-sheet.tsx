/**
 * Church Giving Page — Personal giving center (v1)
 *
 * 5-block vertical scroll inside a bottom sheet:
 *   Block 0 — Header (Give title, campus badge)
 *   Block 1 — Quick Give Card (presets, fund, payment, Give Now)
 *   Block 2 — Recurring Giving (active plans, edit/pause/cancel)
 *   Block 3 — Giving History (chronological, tap → detail)
 *   Block 4 — Payment Methods (saved cards, add/remove/default)
 *
 * UX: Quiet, private, intentional. Not analytics-heavy. Not gamified.
 * RBAC: V1 — personal only. No campus totals, no leaderboard.
 * Give Now follows Propose → Confirm → Commit (Alert confirmation).
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing, MODE_ACCENT } from '@/constants/theme';
import {
  GIVING_FUNDS,
  QUICK_GIVE_AMOUNTS,
  GIVING_HISTORY,
  RECURRING_GIFTS,
  PAYMENT_METHODS,
  formatCents,
  formatCentsDollars,
  formatFrequency,
  type GivingFund,
  type GivingTransaction,
  type RecurringGift,
  type PaymentMethod,
} from '@/data/mock-church-giving';

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATUS_COLOR: Record<string, string> = {
  SETTLED: '#5A8A6E',
  PENDING: '#B8943E',
  FAILED: '#B85C5C',
  ACTIVE: '#5A8A6E',
  PAUSED: '#B8943E',
  CANCELLED: '#9C9790',
};

const CARD_ICON: Record<string, IconSymbolName> = {
  visa: 'creditcard.fill',
  mastercard: 'creditcard.fill',
  amex: 'creditcard.fill',
  ach: 'building.columns.fill',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchGiveSheet({ visible, onClose, colors }: Props) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedFund, setSelectedFund] = useState<GivingFund>('General Fund');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(
    PAYMENT_METHODS.find((p) => p.isDefault) || PAYMENT_METHODS[0],
  );
  const [showFundPicker, setShowFundPicker] = useState(false);
  const [detailTransaction, setDetailTransaction] = useState<GivingTransaction | null>(null);

  const resolvedAmount = selectedAmount || 0;

  // ── Give Now: Propose → Confirm → Commit ──
  const handleGiveNow = () => {
    if (resolvedAmount <= 0) return;
    Haptics.impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Confirm Gift',
      `You are giving $${resolvedAmount} to ${selectedFund} at 2819 Church.\n\nPayment: ${selectedPayment.label}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Give Now',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Thank You', 'Thank you for your gift.');
            setSelectedAmount(null);
          },
        },
      ],
    );
  };

  // ── Recurring actions ──
  const handleRecurringAction = (gift: RecurringGift, action: 'edit' | 'pause' | 'cancel') => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    const labels = { edit: 'Edit', pause: gift.status === 'PAUSED' ? 'Resume' : 'Pause', cancel: 'Cancel' };
    Alert.alert(
      `${labels[action]} Recurring Gift`,
      `${labels[action]} ${formatCentsDollars(gift.amountCents)} ${formatFrequency(gift.frequency)} to ${gift.fund}?`,
      [
        { text: 'Not Now', style: 'cancel' },
        { text: 'Confirm', onPress: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success) },
      ],
    );
  };

  // ── Transaction detail ──
  const handleTransactionTap = (tx: GivingTransaction) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setDetailTransaction(tx);
  };

  // ── Payment method actions ──
  const handleAddCard = () => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert('Add Payment Method', 'Secure payment form coming soon.');
  };

  const handleRemoveCard = (pm: PaymentMethod) => {
    if (pm.isDefault) {
      Alert.alert('Cannot Remove', 'Set another card as default first.');
      return;
    }
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    Alert.alert('Remove Card', `Remove ${pm.label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive' },
    ]);
  };

  return (
    <>
      <BottomSheet visible={visible} onClose={onClose} useModal>
        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 0 — HEADER
            ════════════════════════════════════════════════════════════════════ */}
        <View style={s.headerRow}>
          <ThemedText style={[s.headerTitle, { color: colors.text }]}>Give</ThemedText>
          <View style={[s.campusBadge, { borderColor: ACCENT }]}>
            <ThemedText style={[s.campusBadgeText, { color: ACCENT }]}>2819 Church</ThemedText>
          </View>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 1 — QUICK GIVE CARD
            ════════════════════════════════════════════════════════════════════ */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Quick Give</ThemedText>

          {/* Amount presets */}
          <View style={s.presetRow}>
            {QUICK_GIVE_AMOUNTS.map((amt) => (
              <Pressable
                key={amt}
                style={[
                  s.presetBtn,
                  { borderColor: colors.border },
                  selectedAmount === amt && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setSelectedAmount(amt)}
              >
                <ThemedText
                  style={[
                    s.presetText,
                    { color: colors.text },
                    selectedAmount === amt && { color: '#000' },
                  ]}
                >
                  ${amt}
                </ThemedText>
              </Pressable>
            ))}
            <Pressable
              style={[
                s.presetBtn,
                { borderColor: colors.border },
                selectedAmount !== null &&
                  !QUICK_GIVE_AMOUNTS.includes(selectedAmount as any) && {
                    backgroundColor: ACCENT,
                    borderColor: ACCENT,
                  },
              ]}
              onPress={() => {
                Haptics.impactAsync(ImpactFeedbackStyle.Light);
                Alert.prompt?.(
                  'Custom Amount',
                  'Enter amount in dollars',
                  (text: string) => {
                    const val = parseFloat(text);
                    if (val > 0) setSelectedAmount(val);
                  },
                  'plain-text',
                  '',
                  'decimal-pad',
                ) ??
                  Alert.alert('Custom Amount', 'Custom amount input coming soon.');
              }}
            >
              <ThemedText style={[s.presetText, { color: colors.text }]}>Custom</ThemedText>
            </Pressable>
          </View>

          {/* Fund selector */}
          <Pressable
            style={[s.selector, { borderColor: colors.border }]}
            onPress={() => setShowFundPicker(!showFundPicker)}
          >
            <ThemedText style={[s.selectorLabel, { color: colors.textSecondary }]}>Fund</ThemedText>
            <View style={s.selectorValue}>
              <ThemedText style={[s.selectorText, { color: colors.text }]}>
                {selectedFund}
              </ThemedText>
              <IconSymbol
                name={showFundPicker ? 'chevron.up' : 'chevron.down'}
                size={12}
                color={colors.textSecondary}
              />
            </View>
          </Pressable>

          {showFundPicker && (
            <View style={[s.fundPicker, { borderColor: colors.border }]}>
              {GIVING_FUNDS.map((fund) => (
                <Pressable
                  key={fund}
                  style={({ pressed }) => [
                    s.fundOption,
                    selectedFund === fund && { backgroundColor: ACCENT + '15' },
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={() => {
                    setSelectedFund(fund);
                    setShowFundPicker(false);
                  }}
                >
                  <ThemedText
                    style={[
                      s.fundOptionText,
                      { color: colors.text },
                      selectedFund === fund && { color: ACCENT, fontWeight: '700' },
                    ]}
                  >
                    {fund}
                  </ThemedText>
                  {selectedFund === fund && (
                    <IconSymbol name="checkmark" size={14} color={ACCENT} />
                  )}
                </Pressable>
              ))}
            </View>
          )}

          {/* Payment method */}
          <Pressable style={[s.selector, { borderColor: colors.border }]} onPress={() => {
            Haptics.impactAsync(ImpactFeedbackStyle.Light);
            const options = PAYMENT_METHODS.map((pm) => pm.label);
            options.push('Cancel');
            Alert.alert('Payment Method', 'Select a payment method',
              PAYMENT_METHODS.map((pm) => ({
                text: `${pm.label}${pm.isDefault ? ' (Default)' : ''}`,
                onPress: () => setSelectedPayment(pm),
              })).concat([{ text: 'Cancel', onPress: () => {}, style: 'cancel' } as any]),
            );
          }}>
            <ThemedText style={[s.selectorLabel, { color: colors.textSecondary }]}>
              Payment
            </ThemedText>
            <View style={s.selectorValue}>
              <IconSymbol name={CARD_ICON[selectedPayment.type]} size={14} color={colors.text} />
              <ThemedText style={[s.selectorText, { color: colors.text }]}>
                {selectedPayment.label}
              </ThemedText>
            </View>
          </Pressable>

          {/* Give Now button */}
          <Pressable
            style={[
              s.giveNowBtn,
              { backgroundColor: resolvedAmount > 0 ? ACCENT : colors.border },
            ]}
            onPress={handleGiveNow}
            disabled={resolvedAmount <= 0}
          >
            <ThemedText
              style={[
                s.giveNowText,
                { color: resolvedAmount > 0 ? '#000' : colors.textTertiary },
              ]}
            >
              {resolvedAmount > 0 ? `Give $${resolvedAmount}` : 'Give Now'}
            </ThemedText>
          </Pressable>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 2 — RECURRING GIVING
            ════════════════════════════════════════════════════════════════════ */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Recurring Gifts</ThemedText>

          {RECURRING_GIFTS.map((gift) => (
            <View
              key={gift.id}
              style={[s.recurringItem, { borderColor: colors.border }]}
            >
              <View style={s.recurringTop}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.recurringAmount, { color: colors.text }]}>
                    {formatCentsDollars(gift.amountCents)} \u2014{' '}
                    {formatFrequency(gift.frequency)} \u2014 {gift.fund}
                  </ThemedText>
                  <ThemedText style={[s.recurringMeta, { color: colors.textSecondary }]}>
                    Next charge: {gift.nextChargeDate}
                  </ThemedText>
                </View>
                <View
                  style={[
                    s.statusChip,
                    { backgroundColor: (STATUS_COLOR[gift.status] || '#9C9790') + '20' },
                  ]}
                >
                  <ThemedText
                    style={[
                      s.statusChipText,
                      { color: STATUS_COLOR[gift.status] || '#9C9790' },
                    ]}
                  >
                    {gift.status}
                  </ThemedText>
                </View>
              </View>

              <View style={s.recurringActions}>
                <Pressable
                  style={({ pressed }) => [s.miniBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => handleRecurringAction(gift, 'edit')}
                >
                  <ThemedText style={[s.miniBtnText, { color: ACCENT }]}>Edit</ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.miniBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => handleRecurringAction(gift, 'pause')}
                >
                  <ThemedText style={[s.miniBtnText, { color: colors.textSecondary }]}>
                    {gift.status === 'PAUSED' ? 'Resume' : 'Pause'}
                  </ThemedText>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.miniBtn, pressed && { opacity: 0.7 }]}
                  onPress={() => handleRecurringAction(gift, 'cancel')}
                >
                  <ThemedText style={[s.miniBtnText, { color: '#B85C5C' }]}>Cancel</ThemedText>
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              s.addRecurringBtn,
              { backgroundColor: colors.backgroundSecondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              Haptics.impactAsync(ImpactFeedbackStyle.Light);
              Alert.alert('New Recurring Gift', 'Recurring gift setup coming soon.');
            }}
          >
            <IconSymbol name="plus.circle.fill" size={16} color={ACCENT} />
            <ThemedText style={[s.addRecurringText, { color: ACCENT }]}>
              New Recurring Gift
            </ThemedText>
          </Pressable>
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 3 — GIVING HISTORY
            ════════════════════════════════════════════════════════════════════ */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Giving History</ThemedText>

          {GIVING_HISTORY.map((tx) => (
            <Pressable
              key={tx.id}
              style={({ pressed }) => [
                s.historyItem,
                { borderColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleTransactionTap(tx)}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.historyAmount, { color: colors.text }]}>
                  {formatCents(tx.amountCents)}
                </ThemedText>
                <ThemedText style={[s.historyMeta, { color: colors.textSecondary }]}>
                  {tx.fund} \u00B7 {tx.createdAt}
                </ThemedText>
              </View>
              <View style={s.historyRight}>
                <View
                  style={[
                    s.statusDot,
                    { backgroundColor: STATUS_COLOR[tx.status] || '#9C9790' },
                  ]}
                />
                <ThemedText
                  style={[s.historyStatus, { color: STATUS_COLOR[tx.status] || '#9C9790' }]}
                >
                  {tx.status}
                </ThemedText>
                <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
              </View>
            </Pressable>
          ))}
        </View>

        {/* ════════════════════════════════════════════════════════════════════
            BLOCK 4 — PAYMENT METHODS
            ════════════════════════════════════════════════════════════════════ */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Payment Methods</ThemedText>

          {PAYMENT_METHODS.map((pm) => (
            <View
              key={pm.id}
              style={[s.paymentItem, { borderColor: colors.border }]}
            >
              <IconSymbol name={CARD_ICON[pm.type]} size={20} color={colors.text} />
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.paymentLabel, { color: colors.text }]}>
                  {pm.label}
                </ThemedText>
                {pm.expiry && (
                  <ThemedText style={[s.paymentExpiry, { color: colors.textSecondary }]}>
                    Expires {pm.expiry}
                  </ThemedText>
                )}
              </View>
              {pm.isDefault && (
                <View style={[s.defaultBadge, { backgroundColor: ACCENT + '20' }]}>
                  <ThemedText style={[s.defaultBadgeText, { color: ACCENT }]}>Default</ThemedText>
                </View>
              )}
              <Pressable
                style={({ pressed }) => [pressed && { opacity: 0.7 }]}
                onPress={() => handleRemoveCard(pm)}
              >
                <IconSymbol name="trash" size={14} color={colors.textTertiary} />
              </Pressable>
            </View>
          ))}

          <Pressable
            style={({ pressed }) => [
              s.addCardBtn,
              { backgroundColor: colors.backgroundSecondary },
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleAddCard}
          >
            <IconSymbol name="plus.circle.fill" size={16} color={ACCENT} />
            <ThemedText style={[s.addCardText, { color: ACCENT }]}>Add Payment Method</ThemedText>
          </Pressable>
        </View>

        <View style={{ height: 20 }} />
      </BottomSheet>

      {/* ── Transaction Detail Sub-Sheet ── */}
      <BottomSheet
        visible={detailTransaction !== null}
        onClose={() => setDetailTransaction(null)}
        title="Transaction Detail"
        useModal
      >
        {detailTransaction && (
          <View style={s.detailContainer}>
            <View style={[s.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Amount
                </ThemedText>
                <ThemedText style={[s.detailAmount, { color: colors.text }]}>
                  {formatCents(detailTransaction.amountCents)}
                </ThemedText>
              </View>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Fund
                </ThemedText>
                <ThemedText style={[s.detailValue, { color: colors.text }]}>
                  {detailTransaction.fund}
                </ThemedText>
              </View>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Campus
                </ThemedText>
                <ThemedText style={[s.detailValue, { color: colors.text }]}>2819 Church</ThemedText>
              </View>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Date
                </ThemedText>
                <ThemedText style={[s.detailValue, { color: colors.text }]}>
                  {detailTransaction.createdAt}
                </ThemedText>
              </View>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Status
                </ThemedText>
                <ThemedText
                  style={[
                    s.detailValue,
                    { color: STATUS_COLOR[detailTransaction.status], fontWeight: '700' },
                  ]}
                >
                  {detailTransaction.status}
                </ThemedText>
              </View>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Reference ID
                </ThemedText>
                <ThemedText style={[s.detailValue, { color: colors.text }]}>
                  {detailTransaction.referenceId}
                </ThemedText>
              </View>
              <View style={s.detailRow}>
                <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                  Payment
                </ThemedText>
                <ThemedText style={[s.detailValue, { color: colors.text }]}>
                  \u2022\u2022\u2022\u2022 {detailTransaction.paymentMethodLast4}
                </ThemedText>
              </View>
            </View>

            <Pressable
              style={({ pressed }) => [
                s.receiptBtn,
                { backgroundColor: colors.backgroundSecondary },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => {
                Haptics.impactAsync(ImpactFeedbackStyle.Light);
                Alert.alert('Download Receipt', 'Receipt download coming soon.');
              }}
            >
              <IconSymbol name="arrow.down.doc.fill" size={16} color={ACCENT} />
              <ThemedText style={[s.receiptBtnText, { color: ACCENT }]}>
                Download Receipt
              </ThemedText>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  campusBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  campusBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Card
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    marginBottom: 12,
  },

  // Section title
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Quick Give — presets
  presetRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  presetBtn: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  presetText: { fontSize: 14, fontWeight: '700' },

  // Selectors
  selector: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  selectorLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  selectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  selectorText: { fontSize: 14, fontWeight: '700' },

  // Fund picker
  fundPicker: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    marginBottom: 10,
    overflow: 'hidden',
  },
  fundOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  fundOptionText: { fontSize: 14 },

  // Give Now
  giveNowBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  giveNowText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  // Recurring
  recurringItem: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  recurringTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  recurringAmount: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  recurringMeta: { fontSize: 11, marginTop: 2 },
  recurringActions: { flexDirection: 'row', gap: 12, marginTop: 8 },
  miniBtn: { paddingVertical: 2 },
  miniBtnText: { fontSize: 12, fontWeight: '700' },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusChipText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5 },

  addRecurringBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  addRecurringText: { fontSize: 13, fontWeight: '700' },

  // History
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  historyAmount: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  historyMeta: { fontSize: 11, marginTop: 1 },
  historyRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyStatus: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  // Payment Methods
  paymentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
  },
  paymentLabel: { fontSize: 14, fontWeight: '700' },
  paymentExpiry: { fontSize: 11, marginTop: 1 },
  defaultBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  defaultBadgeText: { fontSize: 9, fontWeight: '700' },
  addCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginTop: 8,
  },
  addCardText: { fontSize: 13, fontWeight: '700' },

  // Transaction Detail
  detailContainer: { gap: 12 },
  detailCard: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, fontWeight: '500' },
  detailAmount: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  detailValue: { fontSize: 13, fontWeight: '600' },
  receiptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  receiptBtnText: { fontSize: 14, fontWeight: '700' },
});
