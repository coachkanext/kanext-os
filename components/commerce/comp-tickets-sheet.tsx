/**
 * Competition Tickets Bottom Sheet
 *
 * Browse upcoming races -> select seat tier -> confirm -> receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { RACE_ROUNDS, type RaceRound } from '@/data/mock-competition-home';
import { COMP_SEAT_TIERS, buildCompCommerceChain, type CompSeatTier } from '@/data/comp-commerce-data';
import type { PaymentChain } from '@/data/commerce-data';
import { Spacing, BorderRadius } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function CompTicketsSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [expandedRaceId, setExpandedRaceId] = useState<string | null>(null);
  const [selectedRace, setSelectedRace] = useState<RaceRound | null>(null);
  const [selectedTier, setSelectedTier] = useState<CompSeatTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const upcomingRaces = RACE_ROUNDS.filter((r) => r.status !== 'completed');

  const handleClose = useCallback(() => {
    setStage('browse');
    setExpandedRaceId(null);
    setSelectedRace(null);
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((race: RaceRound, tier: CompSeatTier) => {
    setSelectedRace(race);
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedRace || !selectedTier) return;
    const result = buildCompCommerceChain(
      'Race Ticket',
      selectedTier.price,
      `${selectedTier.label} — ${selectedRace.name}`,
      'RTK',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedRace, selectedTier]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedRace(null);
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Tickets" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {upcomingRaces.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming races.</Text>
          )}
          {upcomingRaces.map((race) => {
            const expanded = expandedRaceId === race.id;
            return (
              <View key={race.id} style={[styles.raceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedRaceId(expanded ? null : race.id)}>
                  <Text style={[styles.raceName, { color: colors.text }]}>{race.name}</Text>
                  <Text style={[styles.raceMeta, { color: colors.textSecondary }]}>
                    {race.venue}, {race.city} {'\u00B7'} {race.date}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.tierList}>
                    {COMP_SEAT_TIERS.map((tier) => (
                      <Pressable
                        key={tier.id}
                        style={[styles.tierRow, { borderColor: colors.border }]}
                        onPress={() => handleSelectTier(race, tier)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                          <Text style={[styles.tierPrice, { color: colors.textSecondary }]}>${tier.price.toLocaleString()}</Text>
                        </View>
                        <View style={styles.selectBtn}>
                          <Text style={styles.selectBtnText}>Select</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {stage === 'confirm' && selectedRace && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Race</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Venue</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.city}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.date}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.price.toLocaleString()}.00</Text>
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

      {stage === 'receipt' && chain && selectedRace && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Race</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedRace.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
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
  emptyText: { fontSize: 14, textAlign: 'center', paddingVertical: Spacing.xl },

  raceCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md },
  raceName: { fontSize: 15, fontWeight: '700' },
  raceMeta: { fontSize: 12, fontWeight: '500', marginTop: 4 },

  tierList: { marginTop: Spacing.sm, gap: Spacing.sm },
  tierRow: { flexDirection: 'row', alignItems: 'center', borderWidth: StyleSheet.hairlineWidth, borderRadius: BorderRadius.md, padding: Spacing.sm },
  tierLabel: { fontSize: 14, fontWeight: '600' },
  tierPrice: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  selectBtn: { backgroundColor: '#FF5555', paddingHorizontal: 14, paddingVertical: 6, borderRadius: BorderRadius.md },
  selectBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  confirmCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 10 },
  sectionLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  confirmLabel: { fontSize: 13, fontWeight: '500' },
  confirmValue: { fontSize: 13, fontWeight: '700' },
  amountText: { fontSize: 24, fontWeight: '800' },
  statusText: { fontSize: 13, fontWeight: '700' },

  ctaButton: { backgroundColor: '#22C55E', paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  ctaButtonText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  cancelButton: { borderWidth: 1, paddingVertical: 12, borderRadius: BorderRadius.md, alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },

  chainCard: { borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth, padding: Spacing.md, gap: 8 },
  chainRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  chainDot: { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  chainStage: { fontSize: 12, fontWeight: '700' },
  chainDetail: { fontSize: 11, fontWeight: '500', marginTop: 1 },
});
