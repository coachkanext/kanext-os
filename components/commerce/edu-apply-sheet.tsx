/**
 * Education Apply Bottom Sheet
 *
 * 3-stage: browse application types → confirm → receipt with payment chain.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  APPLICATION_TYPES,
  buildEduCommerceChain,
  type ApplicationType,
} from '@/data/edu-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';

export function EduApplySheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [selected, setSelected] = useState<ApplicationType | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setStage('browse');
    setSelected(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelect = useCallback((app: ApplicationType) => {
    setSelected(app);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selected) return;
    const result = buildEduCommerceChain(
      'Application Fee',
      selected.fee,
      `${selected.label} Application`,
      'APP',
    );
    setChain(result);
    setStage('receipt');
  }, [selected]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelected(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Apply to FMU" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {APPLICATION_TYPES.map((app) => (
            <View key={app.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardLabel, { color: colors.text }]}>{app.label}</Text>
                <Text style={[styles.cardFee, { color: ACCENT }]}>${app.fee}</Text>
              </View>
              <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{app.description}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Deadline: {app.deadline}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Requirements: {app.requirements}</Text>
              <Pressable style={[styles.selectBtn, { backgroundColor: ACCENT }]} onPress={() => handleSelect(app)}>
                <Text style={styles.selectBtnText}>Select</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {stage === 'confirm' && selected && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM APPLICATION</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Deadline</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.deadline}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Application Fee</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selected.fee.toFixed(2)}</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirm}>
            <Text style={styles.ctaButtonText}>Submit & Pay</Text>
          </Pressable>
          <Pressable style={[styles.cancelButton, { borderColor: colors.border }]} onPress={handleBack}>
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {stage === 'receipt' && chain && selected && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Type</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selected.label} Application</Text>
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

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleClose}>
            <Text style={styles.ctaButtonText}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { gap: 14 },

  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLabel: { fontSize: 15, fontWeight: '800', letterSpacing: -0.5 },
  cardFee: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  cardDesc: { fontSize: 12, fontWeight: '500', letterSpacing: 0.1 },
  cardMeta: { fontSize: 11, fontWeight: '500', letterSpacing: 0.1 },
  selectBtn: {
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    marginTop: 6,
  },
  selectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },

  confirmCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 6 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500', letterSpacing: 0.1 },
  confirmValue: { fontSize: 13, fontWeight: '700', letterSpacing: -0.2 },
  amountText: { fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  statusText: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },

  ctaButton: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
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
});
