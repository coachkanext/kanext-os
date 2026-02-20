/**
 * Tickets Bottom Sheet
 *
 * Browse upcoming home games → select seat tier → confirm → receipt.
 * State machine: browse | confirm | receipt
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { FMU_GAMES, type FMUGame } from '@/data/fmu';
import { SEAT_TIERS, buildCommerceChain, type SeatTier, type PaymentChain } from '@/data/commerce-data';
import { Spacing } from '@/constants/theme';

type Stage = 'browse' | 'confirm' | 'receipt';

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: Record<string, string>;
}

export function TicketsSheet({ visible, onClose, colors }: Props) {
  const [stage, setStage] = useState<Stage>('browse');
  const [expandedGameId, setExpandedGameId] = useState<string | null>(null);
  const [selectedGame, setSelectedGame] = useState<FMUGame | null>(null);
  const [selectedTier, setSelectedTier] = useState<SeatTier | null>(null);
  const [chain, setChain] = useState<PaymentChain | null>(null);

  const upcomingHomeGames = FMU_GAMES.filter(g => g.location === 'Home' && g.status === 'upcoming');

  const handleClose = useCallback(() => {
    setStage('browse');
    setExpandedGameId(null);
    setSelectedGame(null);
    setSelectedTier(null);
    setChain(null);
    onClose();
  }, [onClose]);

  const handleSelectTier = useCallback((game: FMUGame, tier: SeatTier) => {
    setSelectedGame(game);
    setSelectedTier(tier);
    setStage('confirm');
  }, []);

  const handleConfirm = useCallback(() => {
    if (!selectedGame || !selectedTier) return;
    const result = buildCommerceChain(
      'Ticket Purchase',
      selectedTier.price,
      `${selectedTier.label} — vs ${selectedGame.opponent}`,
      'TKT',
    );
    setChain(result);
    setStage('receipt');
  }, [selectedGame, selectedTier]);

  const handleBack = useCallback(() => {
    setStage('browse');
    setSelectedGame(null);
    setSelectedTier(null);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title="Tickets" useModal>
      {stage === 'browse' && (
        <View style={styles.container}>
          {upcomingHomeGames.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming home games.</Text>
          )}
          {upcomingHomeGames.map(game => {
            const expanded = expandedGameId === game.id;
            return (
              <View key={game.id} style={[styles.gameCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Pressable onPress={() => setExpandedGameId(expanded ? null : game.id)}>
                  <Text style={[styles.gameOpponent, { color: colors.text }]}>vs {game.opponent}</Text>
                  <Text style={[styles.gameMeta, { color: colors.textSecondary }]}>
                    {game.date}{game.gameTime ? ` · ${game.gameTime}` : ''} · {game.venue ?? 'Home'}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.tierList}>
                    {SEAT_TIERS.map(tier => (
                      <Pressable
                        key={tier.id}
                        style={[styles.tierRow, { borderColor: colors.border }]}
                        onPress={() => handleSelectTier(game, tier)}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.tierLabel, { color: colors.text }]}>{tier.label}</Text>
                          <Text style={[styles.tierPrice, { color: colors.textSecondary }]}>${tier.price}</Text>
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

      {stage === 'confirm' && selectedGame && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>CONFIRM PURCHASE</Text>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Game</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>vs {selectedGame.opponent}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Date</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedGame.date}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.amountText, { color: colors.text }]}>${selectedTier.price.toFixed(2)}</Text>
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

      {stage === 'receipt' && chain && selectedGame && selectedTier && (
        <View style={styles.container}>
          <View style={[styles.confirmCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECEIPT</Text>

            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Transaction</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{chain.transactionId}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Game</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>vs {selectedGame.opponent}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={[styles.confirmLabel, { color: colors.textSecondary }]}>Seat Tier</Text>
              <Text style={[styles.confirmValue, { color: colors.text }]}>{selectedTier.label}</Text>
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
    gap: 14,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
    letterSpacing: 0.2,
  },

  // Game cards
  gameCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
  },
  gameOpponent: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  gameMeta: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.3,
  },

  // Tier selection
  tierList: {
    marginTop: Spacing.sm,
    gap: 10,
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
  },
  tierLabel: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  tierPrice: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.3,
  },
  selectBtn: {
    backgroundColor: '#1E40AF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Confirm / Receipt
  confirmCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
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
    letterSpacing: 0.1,
  },
  confirmValue: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  amountText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // CTA
  ctaButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  cancelButton: {
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },

  // Payment chain
  chainCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
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
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  chainDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
