/**
 * KaNeXTDatabase — universe search + Add to Board flow.
 * Refactored from the old "Recruits" (players) view.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { PlayerRatingCard } from '@/components/recruiting/player-rating-card';
import {
  NEEDS_TIERS,
  NEEDS_TIER_COLORS,
  POSITION_SLOTS,
  BOARD_COLUMNS,
  type BoardEntry,
  type NeedsTier,
  type PositionSlot,
  type BoardStatus,
} from '@/data/recruitingBoard';
import type { PoolPlayer } from '@/data/playerPool';
import type { OffensiveStyle, DefensiveStyle } from '@/types';

const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';
const BG = '#0F1115';

export function KaNeXTDatabase({
  filteredPlayers,
  boardEntries,
  boardSearch,
  offStyle,
  defStyle,
  onPlayerPress,
  onAddToBoard,
  onRemoveFromBoard,
}: {
  filteredPlayers: PoolPlayer[];
  boardEntries: BoardEntry[];
  boardSearch: string;
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
  onPlayerPress: (player: PoolPlayer) => void;
  onAddToBoard: (playerId: string, slot?: PositionSlot, tier?: NeedsTier, status?: BoardStatus) => void;
  onRemoveFromBoard: (entryId: string) => void;
}) {
  const [addSheetPlayer, setAddSheetPlayer] = useState<PoolPlayer | null>(null);
  const [addSlot, setAddSlot] = useState<PositionSlot>('W');
  const [addTier, setAddTier] = useState<NeedsTier>('Watch');
  const [addStatus, setAddStatus] = useState<BoardStatus>('Watchlist');

  // Apply board search to the national pool
  const visiblePlayers = useMemo(() => {
    if (!boardSearch) return filteredPlayers;
    const q = boardSearch.toLowerCase();
    return filteredPlayers.filter((p) =>
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) ||
      p.currentSchool.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  }, [filteredPlayers, boardSearch]);

  const openAddSheet = useCallback((player: PoolPlayer) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setAddSlot('W');
    setAddTier('Watch');
    setAddStatus('Watchlist');
    setAddSheetPlayer(player);
  }, []);

  const confirmAdd = useCallback(() => {
    if (!addSheetPlayer) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToBoard(addSheetPlayer.id, addSlot, addTier, addStatus);
    setAddSheetPlayer(null);
  }, [addSheetPlayer, addSlot, addTier, addStatus, onAddToBoard]);

  return (
    <View>
      {/* Result count */}
      <Text style={styles.resultCount}>{visiblePlayers.length} players</Text>

      {/* Player list */}
      {visiblePlayers.map((player) => {
        const existingEntry = boardEntries.find((e) => e.playerId === player.id);
        const alreadyOnBoard = !!existingEntry;

        return (
          <View key={player.id} style={{ position: 'relative' }}>
            <PlayerRatingCard
              player={player}
              offStyle={offStyle}
              defStyle={defStyle}
              onPress={() => onPlayerPress(player)}
            />
            {!alreadyOnBoard ? (
              <Pressable
                style={styles.addToBoardBtn}
                onPress={() => openAddSheet(player)}
              >
                <IconSymbol name="plus.circle.fill" size={24} color="#4CAF50" />
              </Pressable>
            ) : (
              <Pressable
                style={styles.addToBoardBtn}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onRemoveFromBoard(existingEntry.id);
                }}
              >
                <IconSymbol name="checkmark.circle.fill" size={24} color={GRAY} />
              </Pressable>
            )}
          </View>
        );
      })}

      {visiblePlayers.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No players match your search</Text>
        </View>
      )}

      {/* Add to Board Sheet */}
      <BottomSheet
        visible={!!addSheetPlayer}
        onClose={() => setAddSheetPlayer(null)}
        title={addSheetPlayer ? `Add ${addSheetPlayer.firstName} ${addSheetPlayer.lastName}` : 'Add to Board'}
        useModal
      >
        {addSheetPlayer && (
          <View style={styles.addSheetContent}>
            {/* Slot picker */}
            <Text style={styles.addLabel}>POSITION SLOT</Text>
            <View style={styles.addPillRow}>
              {POSITION_SLOTS.map((slot) => (
                <Pressable
                  key={slot}
                  style={[styles.addPill, addSlot === slot && styles.addPillActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSlot(slot); }}
                >
                  <Text style={[styles.addPillText, addSlot === slot && styles.addPillTextActive]}>{slot}</Text>
                </Pressable>
              ))}
            </View>

            {/* Tier picker */}
            <Text style={styles.addLabel}>TIER</Text>
            <View style={styles.addPillRow}>
              {NEEDS_TIERS.map((tier) => (
                <Pressable
                  key={tier}
                  style={[
                    styles.addPill,
                    addTier === tier && { backgroundColor: NEEDS_TIER_COLORS[tier], borderColor: NEEDS_TIER_COLORS[tier] },
                  ]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddTier(tier); }}
                >
                  <Text style={[styles.addPillText, addTier === tier && { color: WHITE }]}>{tier}</Text>
                </Pressable>
              ))}
            </View>

            {/* Status picker */}
            <Text style={styles.addLabel}>INITIAL STATUS</Text>
            <View style={styles.addPillRow}>
              {(['Watchlist', 'Evaluating', 'Contacted'] as BoardStatus[]).map((status) => (
                <Pressable
                  key={status}
                  style={[styles.addPill, addStatus === status && styles.addPillActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddStatus(status); }}
                >
                  <Text style={[styles.addPillText, addStatus === status && styles.addPillTextActive]}>{status}</Text>
                </Pressable>
              ))}
            </View>

            {/* Confirm */}
            <Pressable style={styles.confirmBtn} onPress={confirmAdd}>
              <Text style={styles.confirmBtnText}>Add to Board</Text>
            </Pressable>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  resultCount: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
    marginBottom: 10,
  },
  addToBoardBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 10,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: GRAY,
  },
  addSheetContent: {
    gap: 12,
    paddingBottom: 20,
  },
  addLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
  },
  addPillRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  addPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  addPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  addPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAY,
  },
  addPillTextActive: {
    color: BG,
  },
  confirmBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
  },
});
