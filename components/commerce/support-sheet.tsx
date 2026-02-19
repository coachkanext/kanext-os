/**
 * Support Bottom Sheet
 *
 * Three giving tiers + custom amount + one-time/recurring toggle → confirm → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { SUPPORT_TIERS, buildCommerceChain, type SupportTier, type PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';
type Frequency = 'one-time' | 'recurring';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function SupportSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selectedTier, setSelectedTier] = useState<SupportTier | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('one-time');
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const effectiveAmount = selectedTier
    ? selectedTier.amount
    : parseFloat(customAmount) || 0;

  const effectiveLabel = selectedTier
    ? `${selectedTier.label} — ${selectedTier.description}`
    : 'Custom Donation';

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelectedTier(null);
    setCustomAmount('');
    setFrequency('one-time');
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((tier: SupportTier) => {
    setSelectedTier(tier);
    setCustomAmount('');
  }, []);

  const handleCustomFocus = useCallback(() => {
    setSelectedTier(null);
  }, []);

  const handleGive = useCallback(() => {
    if (effectiveAmount <= 0) return;
    setStage('confirm');
  }, [effectiveAmount]);

  const handleConfirm = useCallback(() => {
    const desc = `${effectiveLabel} (${frequency})`;
    const result = buildCommerceChain('Donation', effectiveAmount, desc, 'DON');
    setChain(result);
    setStage('receipt');
  }, [effectiveAmount, effectiveLabel, frequency]);

  const handleBack = useCallback(() => {
    setStage('browse');
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Support FMU Lions" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Tiers */}
          {SUPPORT_TIERS.map(tier => {
            const isActive = selectedTier?.id === tier.id;
            return (
              <Pressable
                key={tier.id}
                style={[
                  styles.tierCard,
                  { backgroundColor: colors.card, borderColor: isActive ? '#1E40AF' : colors.border },
                  isActive && styles.tierCardActive,
                ]}
                onPress={() => handleSelectTier(tier)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                  <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.description}</Text>
                </View>
                <Text style={[styles.tierAmount, { color: colors.text }]}>${tier.amount}</Text>
              </Pressable>
            );
          })}

          {/* Custom amount */}
          <View style={[styles.customRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dollarSign, { color: colors.textSecondary }]}>$</Text>
            <TextInput
              style={[styles.customInput, { color: colors.text }]}
              placeholder="Custom amount"
              placeholderTextColor={colors.textTertiary}
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              onFocus={handleCustomFocus}
            />
          </View>

          {/* Frequency toggle */}
          <View style={[styles.freqRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[
                styles.freqPill,
                frequency === 'one-time' && styles.freqPillActive,
              ]}
              onPress={() => setFrequency('one-time')}
            >
              <Text style={[
                styles.freqPillText,
                { color: frequency === 'one-time' ? '#fff' : colors.textSecondary },
              ]}>
                One-Time
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.freqPill,
                frequency === 'recurring' && styles.freqPillActive,
              ]}
              onPress={() => setFrequency('recurring')}
            >
              <Text style={[
                styles.freqPillText,
                { color: frequency === 'recurring' ? '#fff' : colors.textSecondary },
              ]}>
                Recurring
              </Text>
            </Pressable>
          </View>

          {/* Give button */}
          <Pressable
            style={[styles.ctaButton, effectiveAmount <= 0 && styles.ctaDisabled]}
            onPress={handleGive}
            disabled={effectiveAmount <= 0}
          >
            <Text style={styles.ctaButtonText}>
              {effectiveAmount > 0 ? `Give $${effectiveAmount.toFixed(2)}` : 'Give Now'}
            </Text>
          </Pressable>
        </View>
      )}

      {stage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM DONATION</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{effectiveLabel}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {frequency === 'one-time' ? 'One-Time' : 'Monthly Recurring'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${effectiveAmount.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Donation</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{effectiveLabel}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Frequency</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {frequency === 'one-time' ? 'One-Time' : 'Monthly Recurring'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toFixed(2)}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <Text style={[styles.donorNote, { color: colors.textTertiary }]}>
            Donor linked to Booster/NIL Collective
          </Text>

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

          <Pressable style={styles.ctaButton} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },

  // Tier cards
  tierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
  },
  tierCardActive: {
    borderWidth: 2,
  },
  tierLabel: {
    fontSize: 15,
    fontWeight: '700',
  },
  tierDesc: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  tierAmount: {
    fontSize: 20,
    fontWeight: '800',
  },

  // Custom amount
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  dollarSign: {
    fontSize: 18,
    fontWeight: '700',
    marginRight: 6,
  },
  customInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    paddingVertical: 4,
  },

  // Frequency toggle
  freqRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  freqPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  freqPillActive: {
    backgroundColor: '#1E40AF',
  },
  freqPillText: {
    fontSize: 13,
    fontWeight: '700',
  },

  // CTA
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  ctaDisabled: {
    opacity: 0.4,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButton: {
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Confirm / Receipt
  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confirmLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'right',
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
  },
  donorNote: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // Payment chain
  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  chainDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  chainStage: {
    fontSize: 12,
    fontWeight: '700',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
});
