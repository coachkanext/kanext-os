/**
 * Education Financial Aid Bottom Sheet
 *
 * 3-section tabbed: Scholarships | FAFSA | Tuition & Fees
 * Tuition section has "Make Payment" → confirm → receipt flow.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  SCHOLARSHIPS,
  FMU_FAFSA,
  TUITION_RATES,
  buildEduCommerceChain,
} from '@/data/edu-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Section = 'scholarships' | 'fafsa' | 'tuition';
type TuitionStage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

const ACCENT = '#14B8A6';
const SECTIONS: { id: Section; label: string }[] = [
  { id: 'scholarships', label: 'Scholarships' },
  { id: 'fafsa', label: 'FAFSA' },
  { id: 'tuition', label: 'Tuition & Fees' },
];

export function EduFinancialAidSheet({ visible, onClose, colors }: Props) {
  const [section, setSection] = useState<Section>('scholarships');
  const [tuitionStage, setTuitionStage] = useState<TuitionStage>('browse');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const handleClose = useCallback(() => {
    setSection('scholarships');
    setTuitionStage('browse');
    setSelectedPlan(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleMakePayment = useCallback(() => {
    setTuitionStage('confirm');
  }, []);

  const handleConfirmPayment = useCallback(() => {
    const result = buildEduCommerceChain(
      'Tuition Payment',
      TUITION_RATES.perSemester,
      'Spring 2026 Semester Tuition',
      'TUI',
    );
    setChain(result);
    setTuitionStage('receipt');
  }, []);

  const totalFees = TUITION_RATES.fees.technology + TUITION_RATES.fees.activity + TUITION_RATES.fees.lab;

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Financial Aid" useModal>
      {/* Section toggle pills */}
      <View style={styles.pillRow}>
        {SECTIONS.map((s) => {
          const active = s.id === section;
          return (
            <Pressable
              key={s.id}
              style={[
                styles.pill,
                active
                  ? { backgroundColor: ACCENT }
                  : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth },
              ]}
              onPress={() => { setSection(s.id); setTuitionStage('browse'); setChain(null); }}
            >
              <Text style={[styles.pillText, { color: active ? '#fff' : colors.text }]}>{s.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Scholarships */}
      {section === 'scholarships' && (
        <View style={styles.container}>
          {SCHOLARSHIPS.map((sch) => (
            <View key={sch.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardName, { color: colors.text }]}>{sch.name}</Text>
                <Text style={[styles.cardAmount, { color: ACCENT }]}>${sch.amount.toLocaleString()}</Text>
              </View>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{sch.eligibility}</Text>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Deadline: {sch.deadline}</Text>
            </View>
          ))}
        </View>
      )}

      {/* FAFSA */}
      {section === 'fafsa' && (
        <View style={styles.container}>
          <View style={[styles.codeCard, { backgroundColor: ACCENT + '15' }]}>
            <Text style={[styles.codeLabel, { color: ACCENT }]}>FMU School Code</Text>
            <Text style={[styles.codeValue, { color: colors.text }]}>{FMU_FAFSA.schoolCode}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>DEADLINES</Text>
            <View style={styles.deadlineRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Priority</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>{FMU_FAFSA.priority}</Text>
            </View>
            <View style={styles.deadlineRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Final</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>{FMU_FAFSA.final}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>STEPS TO COMPLETE</Text>
            {FMU_FAFSA.steps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={[styles.stepNumber, { backgroundColor: ACCENT }]}>
                  <Text style={styles.stepNumberText}>{i + 1}</Text>
                </View>
                <Text style={[styles.stepText, { color: colors.text }]}>{step}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Tuition & Fees */}
      {section === 'tuition' && tuitionStage === 'browse' && (
        <View style={styles.container}>
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>TUITION RATES</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Per Credit Hour</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.perCreditHour}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Per Semester (15 credits)</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.perSemester.toLocaleString()}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Annual</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.annual.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>FEES (PER SEMESTER)</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Technology Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.technology}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Activity Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.activity}</Text>
            </View>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Lab Fee</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.fees.lab}</Text>
            </View>
            <View style={[styles.rateRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 }]}>
              <Text style={[styles.cardMetaBold, { color: colors.textSecondary }]}>Total Fees</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${totalFees}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ROOM & BOARD</Text>
            <View style={styles.rateRow}>
              <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>Annual</Text>
              <Text style={[styles.cardMetaBold, { color: colors.text }]}>${TUITION_RATES.roomAndBoard.toLocaleString()}</Text>
            </View>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAYMENT PLANS</Text>
            {TUITION_RATES.paymentPlans.map((plan) => (
              <Pressable
                key={plan.id}
                style={[
                  styles.planRow,
                  { borderColor: selectedPlan === plan.id ? ACCENT : colors.border },
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                <View style={[styles.radioOuter, { borderColor: selectedPlan === plan.id ? ACCENT : colors.border }]}>
                  {selectedPlan === plan.id && <View style={[styles.radioInner, { backgroundColor: ACCENT }]} />}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.planLabel, { color: colors.text }]}>{plan.label}</Text>
                  <Text style={[styles.cardMeta, { color: colors.textSecondary }]}>{plan.description}</Text>
                </View>
              </Pressable>
            ))}
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleMakePayment}>
            <Text style={styles.ctaButtonText}>Make Payment</Text>
          </Pressable>
        </View>
      )}

      {section === 'tuition' && tuitionStage === 'confirm' && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PAYMENT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Description</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>Spring 2026 Tuition</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Plan</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>
                {TUITION_RATES.paymentPlans.find((p) => p.id === selectedPlan)?.label ?? 'Full Pay'}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${TUITION_RATES.perSemester.toLocaleString()}.00</Text>
            </View>
          </View>

          <Pressable style={[styles.ctaButton, { backgroundColor: ACCENT }]} onPress={handleConfirmPayment}>
            <Text style={styles.ctaButtonText}>Confirm Payment</Text>
          </Pressable>
          <Pressable
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => setTuitionStage('browse')}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Back</Text>
          </Pressable>
        </View>
      )}

      {section === 'tuition' && tuitionStage === 'receipt' && chain && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
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
  pillRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full },
  pillText: { fontSize: 12, fontWeight: '600' },

  container: { gap: Spacing.md },

  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: 6,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName: { fontSize: 14, fontWeight: '700', flex: 1 },
  cardAmount: { fontSize: 15, fontWeight: '800' },
  cardMeta: { fontSize: 12, fontWeight: '500' },
  cardMetaBold: { fontSize: 12, fontWeight: '700' },

  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },

  deadlineRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  codeCard: { borderRadius: BorderRadius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  codeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  codeValue: { fontSize: 28, fontWeight: '800', letterSpacing: 2 },

  stepRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginTop: 4 },
  stepNumber: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  stepText: { fontSize: 13, fontWeight: '500', flex: 1 },

  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: 4,
  },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  planLabel: { fontSize: 13, fontWeight: '700' },

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

  ctaButton: { paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

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
