/**
 * Church Give Bottom Sheet
 *
 * 3-stage: browse (category + amount + frequency) → confirm → receipt with payment chain + EIN.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  GIVING_CATEGORIES,
  GIVING_AMOUNTS,
  RECURRING_OPTIONS,
  CHURCH_EIN,
  buildChurchCommerceChain,
  type GivingCategory,
  type RecurringOption,
} from '@/data/church-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#1D9BF0';

export function ChurchGiveSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selectedCategory, setSelectedCategory] = useState<GivingCategory | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringOption>(RECURRING_OPTIONS[0]);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelectedCategory(null);
    setAmount(null);
    setCustomAmount('');
    setFrequency(RECURRING_OPTIONS[0]);
    setChain(null);
    onClose();
  }, [onClose]);

  const resolvedAmount = amount ?? (customAmount ? parseFloat(customAmount) : 0);
  const canProceed = selectedCategory && resolvedAmount > 0;

  const handleConfirmStage = useCallback(() => {
    if (!canProceed) return;
    setStage('confirm');
  }, [canProceed]);

  const handleConfirm = useCallback(() => {
    if (!selectedCategory) return;
    const result = buildChurchCommerceChain(
      'Giving',
      resolvedAmount,
      `${selectedCategory.label} — ${frequency.label}`,
      'GIV',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedCategory, resolvedAmount, frequency]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Give" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Category */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CATEGORY</Text>
          <View style={styles.pillRow}>
            {GIVING_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  selectedCategory?.id === cat.id && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setSelectedCategory(cat)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  selectedCategory?.id === cat.id && { color: '#000' },
                ]}>
                  {cat.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Amount */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AMOUNT</Text>
          <View style={styles.pillRow}>
            {GIVING_AMOUNTS.map((a) => (
              <Pressable
                key={a}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  amount === a && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => { setAmount(a); setCustomAmount(''); }}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  amount === a && { color: '#000' },
                ]}>
                  ${a}
                </Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            style={[styles.customInput, { borderColor: colors.border, color: colors.text }]}
            placeholder="Custom amount"
            placeholderTextColor={colors.textTertiary}
            keyboardType="decimal-pad"
            value={customAmount}
            onChangeText={(v) => { setCustomAmount(v); setAmount(null); }}
          />

          {/* Frequency */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FREQUENCY</Text>
          <View style={styles.pillRow}>
            {RECURRING_OPTIONS.map((opt) => (
              <Pressable
                key={opt.id}
                style={[
                  styles.pill,
                  { borderColor: colors.border },
                  frequency.id === opt.id && { backgroundColor: ACCENT, borderColor: ACCENT },
                ]}
                onPress={() => setFrequency(opt)}
              >
                <Text style={[
                  styles.pillText,
                  { color: colors.text },
                  frequency.id === opt.id && { color: '#000' },
                ]}>
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.ctaButton, { backgroundColor: canProceed ? ACCENT : colors.border }]}
            onPress={handleConfirmStage}
            disabled={!canProceed}
          >
            <Text style={[styles.ctaButtonText, { color: canProceed ? '#000' : colors.textTertiary }]}>
              Continue
            </Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && selectedCategory && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM GIFT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedCategory.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${resolvedAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{frequency.label}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
            <Text style={[styles.ctaButtonText, { color: '#000' }]}>Give ${resolvedAmount.toFixed(2)}</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedCategory && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Category</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedCategory.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{frequency.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          {/* Payment Chain */}
          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {chain.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: '#22C55E' }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Tax Note */}
          <View style={[styles.taxNote, { backgroundColor: ACCENT + '15' }]}>
            <Text style={[styles.taxNoteText, { color: ACCENT }]}>
              Tax-deductible contribution. 2819 Church EIN: {CHURCH_EIN}
            </Text>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={[styles.ctaButtonText, { color: '#000' }]}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  pill: {
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  pillText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },

  customInput: {
    borderWidth: StyleSheet.hairlineWidth, borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, marginBottom: 14,
  },

  confirmCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500', letterSpacing: 0.1 },
  confirmValue: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  amountText: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },

  ctaButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaButtonText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cancelButton: { borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  chainCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 2 },

  taxNote: {
    borderRadius: 14,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  taxNoteText: { fontSize: 11, fontWeight: '700', textAlign: 'center', letterSpacing: 0.2 },
});
