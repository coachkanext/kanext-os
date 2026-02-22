/**
 * Competition Paddock / VIP Hospitality Bottom Sheet
 *
 * Per-race / season toggle -> 3 tier cards -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PADDOCK_TIERS, buildCompCommerceChain, type CourtsideTier } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';


const ACCENT = MODE_ACCENT.competition;
type Stage = 'browse' | 'confirm' | 'receipt';
type PricingMode = 'per_race' | 'season';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompPaddockSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [pricingMode, setPricingMode] = useState<PricingMode>('per_race');
  const [selectedTier, setSelectedTier] = useState<CourtsideTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const getPrice = (tier: CourtsideTier) =>
    pricingMode === 'per_race' ? tier.perGamePrice : tier.seasonPrice;

  const handleClose = useCallback(() => {
    setStage('browse');
    setPricingMode('per_race');
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((tier: CourtsideTier) => {
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedTier) return;
    const price = getPrice(selectedTier);
    const typeLabel = pricingMode === 'per_race' ? 'Per Race' : 'Season Pass';
    const result = buildCompCommerceChain(
      'Paddock Pass',
      price,
      `${selectedTier.label} — ${typeLabel}`,
      'RPD',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedTier, pricingMode]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="VIP & Hospitality" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {/* Per-Race / Season Toggle */}
          <View style={[styles.toggleBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={[styles.togglePill, pricingMode === 'per_race' && styles.togglePillActive]}
              onPress={() => setPricingMode('per_race')}
            >
              <Text style={[styles.toggleText, pricingMode === 'per_race' && styles.toggleTextActive]}>Per Race</Text>
            </Pressable>
            <Pressable
              style={[styles.togglePill, pricingMode === 'season' && styles.togglePillActive]}
              onPress={() => setPricingMode('season')}
            >
              <Text style={[styles.toggleText, pricingMode === 'season' && styles.toggleTextActive]}>Season Pass</Text>
            </Pressable>
          </View>

          {/* Tier Cards */}
          {PADDOCK_TIERS.map((tier) => (
            <Pressable
              key={tier.id}
              style={[styles.tierCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => handleSelect(tier)}
            >
              <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
              <Text style={[styles.tierDescription, { color: colors.textSecondary }]}>{tier.description}</Text>
              <Text style={[styles.tierPrice, { color: ACCENT }]}>
                ${getPrice(tier).toLocaleString()}
                {pricingMode === 'per_race' ? ' / race' : ' / season'}
              </Text>
            </Pressable>
          ))}

          <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
            Pass holders are linked to their organization role for exclusive access.
          </Text>
        </View>
      )}

      {stage === 'confirm' && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {pricingMode === 'per_race' ? 'Per Race' : 'Season Pass'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${getPrice(selectedTier).toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={styles.ctaButton} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Confirm Purchase</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {pricingMode === 'per_race' ? 'Per Race' : 'Season Pass'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${chain.amount.toLocaleString()}.00</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: '#22C55E' }]}>Settled</Text>
            </View>
          </View>

          <Text style={[styles.linkedNote, { color: colors.textTertiary }]}>
            Pass holder linked to organization role for paddock access.
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
  container: { gap: Spacing.md },

  toggleBar: {
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  togglePill: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center' },
  togglePillActive: { backgroundColor: ACCENT },
  toggleText: { fontSize: 13, fontWeight: '700', color: '#A1A1AA', letterSpacing: 0.5 },
  toggleTextActive: { color: '#fff' },

  tierCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  tierLabel: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  tierDescription: { fontSize: 12, fontWeight: '500', letterSpacing: 0.2 },
  tierPrice: { fontSize: 18, fontWeight: '800', marginTop: 4, letterSpacing: -0.3 },

  footerNote: { fontSize: 11, fontStyle: 'italic', textAlign: 'center', paddingHorizontal: Spacing.md, letterSpacing: 0.2 },
  linkedNote: { fontSize: 11, fontStyle: 'italic', textAlign: 'center', letterSpacing: 0.2 },

  confirmCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 12 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500', letterSpacing: 0.2 },
  confirmValue: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  amountText: { fontSize: 24, fontWeight: '800', letterSpacing: -0.3 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  cancelButton: { borderWidth: StyleSheet.hairlineWidth, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },

  chainCard: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1, letterSpacing: 0.2 },
});
