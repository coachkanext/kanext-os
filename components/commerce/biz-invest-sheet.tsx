/**
 * Business Invest Bottom Sheet
 *
 * 4-stage: overview → tier_select → confirm → receipt.
 * SAFE investment flow with payment chain.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  CURRENT_ROUND,
  INVEST_TIERS,
  SAFE_TERMS,
  buildInvestChain,
  type InvestTier,
} from '@/data/mock-business-home';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'overview' | 'tier_select' | 'confirm' | 'receipt';

const ACCENT = '#10B981';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function BizInvestSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('overview');
  const [selectedTier, setSelectedTier] = useState<InvestTier | null>(null);
  const [investorName, setInvestorName] = useState('');
  const [isAccredited, setIsAccredited] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [receipt, setReceipt] = useState<ReturnType<typeof buildInvestChain> | null>(null);

  const handleClose = useCallback(() => {
    setStage('overview');
    setSelectedTier(null);
    setInvestorName('');
    setIsAccredited(false);
    setTermsAccepted(false);
    setReceipt(null);
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    if (!selectedTier) return;
    const chain = buildInvestChain(selectedTier.amount, selectedTier.label);
    setReceipt(chain);
    setStage('receipt');
  }, [selectedTier]);

  const canConfirm = isAccredited && termsAccepted && investorName.trim().length > 0;

  const progressPct = Math.min(100, (CURRENT_ROUND.raised / CURRENT_ROUND.target) * 100);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Invest" useModal>
      {/* ─── Stage 1: Overview ─── */}
      {stage === 'overview' && (
        <View style={styles.container}>
          <View style={[styles.roundCard, { backgroundColor: ACCENT + '12', borderColor: ACCENT + '33' }]}>
            <Text style={[styles.roundName, { color: colors.text }]}>{CURRENT_ROUND.name}</Text>
            <Text style={[styles.roundInstrument, { color: ACCENT }]}>{CURRENT_ROUND.instrument}</Text>

            {/* Progress */}
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                ${(CURRENT_ROUND.raised / 1_000).toFixed(0)}K raised
              </Text>
              <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
                ${(CURRENT_ROUND.target / 1_000_000).toFixed(0)}M target
              </Text>
            </View>
            <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
              <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: ACCENT }]} />
            </View>

            {/* Terms */}
            <View style={styles.termsGrid}>
              <TermRow label="Valuation Cap" value={SAFE_TERMS.cap} colors={colors} />
              <TermRow label="Discount" value={SAFE_TERMS.discount} colors={colors} />
              <TermRow label="MFN" value={SAFE_TERMS.mfn ? 'Yes' : 'No'} colors={colors} />
              <TermRow label="Pro-Rata" value={SAFE_TERMS.proRata ? 'Yes' : 'No'} colors={colors} />
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={() => setStage('tier_select')}>
            <Text style={styles.ctaButtonText}>Select Investment Tier</Text>
          </Pressable>
        </View>
      )}

      {/* ─── Stage 2: Tier Select ─── */}
      {stage === 'tier_select' && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={() => setStage('overview')}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Overview</Text>
          </Pressable>

          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SELECT TIER</Text>
          {INVEST_TIERS.map((tier) => (
            <Pressable
              key={tier.id}
              style={[
                styles.tierRow,
                { backgroundColor: colors.card, borderColor: colors.border },
                selectedTier?.id === tier.id && { borderColor: ACCENT, backgroundColor: ACCENT + '12' },
              ]}
              onPress={() => setSelectedTier(tier)}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                <Text style={[styles.tierDesc, { color: colors.textSecondary }]}>{tier.description}</Text>
              </View>
              {selectedTier?.id === tier.id && (
                <IconSymbol name="checkmark.circle.fill" size={22} color={ACCENT} />
              )}
            </Pressable>
          ))}

          <Pressable
            style={[styles.ctaButton, { backgroundColor: selectedTier ? ACCENT : colors.border }]}
            onPress={() => selectedTier && setStage('confirm')}
            disabled={!selectedTier}
          >
            <Text style={[styles.ctaButtonText, { color: selectedTier ? '#fff' : colors.textTertiary }]}>
              Continue
            </Text>
          </Pressable>
        </View>
      )}

      {/* ─── Stage 3: Confirm ─── */}
      {stage === 'confirm' && selectedTier && (
        <View style={styles.container}>
          <Pressable style={styles.backBar} onPress={() => setStage('tier_select')}>
            <IconSymbol name="chevron.left" size={14} color={ACCENT} />
            <Text style={[styles.backText, { color: ACCENT }]}>Tiers</Text>
          </Pressable>

          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM INVESTMENT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label} — {selectedTier.description}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Instrument</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.instrument}</Text>
            </View>
          </View>

          {/* Name */}
          <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>INVESTOR NAME</Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="Full legal name"
            placeholderTextColor={colors.textTertiary}
            value={investorName}
            onChangeText={setInvestorName}
          />

          {/* Checkboxes */}
          <Pressable style={styles.checkRow} onPress={() => setIsAccredited(!isAccredited)}>
            <View style={[styles.checkbox, { borderColor: colors.border }, isAccredited && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
              {isAccredited && <IconSymbol name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>
              I am an accredited investor as defined by SEC Rule 501
            </Text>
          </Pressable>
          <Pressable style={styles.checkRow} onPress={() => setTermsAccepted(!termsAccepted)}>
            <View style={[styles.checkbox, { borderColor: colors.border }, termsAccepted && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
              {termsAccepted && <IconSymbol name="checkmark" size={12} color="#fff" />}
            </View>
            <Text style={[styles.checkLabel, { color: colors.text }]}>
              I have read and accept the SAFE terms and conditions
            </Text>
          </Pressable>

          {/* RegD Disclaimer */}
          <View style={[styles.disclaimerBox, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.disclaimerText, { color: '#F59E0B' }]}>
              {SAFE_TERMS.regDDisclaimer}
            </Text>
          </View>

          <Pressable
            style={[styles.ctaButton, { backgroundColor: canConfirm ? ACCENT : colors.border }]}
            onPress={handleConfirm}
            disabled={!canConfirm}
          >
            <Text style={[styles.ctaButtonText, { color: canConfirm ? '#fff' : colors.textTertiary }]}>
              Invest ${selectedTier.amount.toLocaleString()}
            </Text>
          </Pressable>
        </View>
      )}

      {/* ─── Stage 4: Receipt ─── */}
      {stage === 'receipt' && receipt && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{receipt.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Instrument</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.instrument}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${receipt.amount.toLocaleString()}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Cap</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{SAFE_TERMS.cap}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Status</Text>
              <Text style={[styles.statusText, { color: ACCENT }]}>Settled</Text>
            </View>
          </View>

          {/* Payment Chain */}
          <View style={[styles.chainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT CHAIN</Text>
            {receipt.chain.map((step, i) => (
              <View key={i} style={styles.chainRow}>
                <View style={[styles.chainDot, { backgroundColor: ACCENT }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.chainStage, { color: colors.text }]}>{step.stage}</Text>
                  <Text style={[styles.chainDetail, { color: colors.textSecondary }]}>{step.detail}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* RegD Footer */}
          <View style={[styles.disclaimerBox, { backgroundColor: '#F59E0B15' }]}>
            <Text style={[styles.disclaimerText, { color: '#F59E0B' }]}>
              Securities offered under Regulation D Rule 506(b). Not a public offering.
            </Text>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

function TermRow({ label, value, colors }: { label: string; value: string; colors: Record<string, string> }) {
  return (
    <View style={styles.termRow}>
      <Text style={[styles.termLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.termValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.md },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  roundCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, gap: 10 },
  roundName: { fontSize: 18, fontWeight: '800' },
  roundInstrument: { fontSize: 13, fontWeight: '700' },

  progressRow: { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel: { fontSize: 11, fontWeight: '600' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },

  termsGrid: { gap: 6, marginTop: 4 },
  termRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  termLabel: { fontSize: 12, fontWeight: '500' },
  termValue: { fontSize: 12, fontWeight: '700' },

  backBar: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 },
  backText: { fontSize: 13, fontWeight: '600' },

  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tierLabel: { fontSize: 16, fontWeight: '800' },
  tierDesc: { fontSize: 12, fontWeight: '500', marginTop: 2 },

  confirmCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 10,
  },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },

  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkLabel: { flex: 1, fontSize: 13, fontWeight: '500', lineHeight: 18 },

  disclaimerBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  disclaimerText: { fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 16 },

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  chainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 8,
  },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});
