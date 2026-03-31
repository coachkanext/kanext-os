/**
 * NeedsBoard — position-slot × tier grid view.
 * 5 position slots (PG/CG/W/F/B), each with 4 tier sub-sections.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { PLAYER_POOL } from '@/data/playerPool';
import { getPlayerRatings } from '@/data/playerRatings';
import {
  NEEDS_TIERS,
  NEEDS_TIER_COLORS,
  POSITION_SLOTS,
  BOARD_COLUMN_COLORS,
  type BoardEntry,
  type NeedsTier,
  type PositionSlot,
} from '@/data/recruitingBoard';
import { HELIO_POSITION_LABELS } from '@/data/position-mapping';
import { getLastTouch, computeMomentum, getMomentumLabel, getMomentumColor } from '@/utils/recruiting-helpers';
import { getRecruitComms } from '@/data/mock-comms';
import { TARGET_DEPTH, type PositionNeed } from '@/data/team-needs';

const BG = '#0B0F14';
const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#9C9790';
const DIVIDER = '#0B0F14';

export function NeedsBoard({
  entries,
  teamNeeds,
  onEntryPress,
  onEntryLongPress,
}: {
  entries: BoardEntry[];
  teamNeeds: PositionNeed[];
  onEntryPress: (entry: BoardEntry) => void;
  onEntryLongPress: (entry: BoardEntry) => void;
}) {
  const [expandedSlots, setExpandedSlots] = useState<Set<PositionSlot>>(new Set());

  const grouped = useMemo(() => {
    const map: Record<PositionSlot, Record<NeedsTier, BoardEntry[]>> = {} as any;
    for (const slot of POSITION_SLOTS) {
      map[slot] = { 'Must Get': [], Primary: [], Secondary: [], Watch: [] };
    }
    for (const entry of entries) {
      const slot = entry.slot ?? 'W';
      const tier = entry.tier ?? 'Watch';
      if (map[slot] && map[slot][tier]) {
        map[slot][tier].push(entry);
      }
    }
    return map;
  }, [entries]);

  const toggleSlot = (slot: PositionSlot) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(slot)) next.delete(slot); else next.add(slot);
      return next;
    });
  };

  return (
    <View>
      {/* Position slot pills strip */}
      <View style={styles.slotStrip}>
        {POSITION_SLOTS.map((slot) => {
          const need = teamNeeds.find((n) => n.pos === slot);
          const have = need?.projected ?? 0;
          const target = TARGET_DEPTH[slot] ?? 0;
          return (
            <Pressable
              key={slot}
              style={[styles.slotPill, expandedSlots.has(slot) && styles.slotPillActive]}
              onPress={() => toggleSlot(slot)}
            >
              <Text style={[styles.slotPillText, expandedSlots.has(slot) && styles.slotPillTextActive]}>
                {slot}
              </Text>
              <Text style={[styles.slotPillCount, expandedSlots.has(slot) && { color: BG }]}>
                {have}/{target}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Slot sections */}
      {POSITION_SLOTS.map((slot) => {
        const isExpanded = expandedSlots.has(slot);
        const need = teamNeeds.find((n) => n.pos === slot);
        const slotEntries = entries.filter((e) => e.slot === slot);
        if (slotEntries.length === 0 && !isExpanded) return null;

        return (
          <View key={slot} style={styles.slotSection}>
            <Pressable style={styles.slotHeader} onPress={() => toggleSlot(slot)}>
              <IconSymbol
                name={isExpanded ? 'chevron.down' : 'chevron.right'}
                size={12}
                color={GRAY}
              />
              <Text style={styles.slotTitle}>{slot} — {HELIO_POSITION_LABELS[slot]}</Text>
              {(() => {
                const have = need?.projected ?? 0;
                const target = TARGET_DEPTH[slot] ?? 0;
                const satisfied = have >= target;
                return (
                  <View style={[styles.needBadge, satisfied && styles.needBadgeSatisfied]}>
                    <Text style={[styles.needBadgeText, satisfied && styles.needBadgeTextSatisfied]}>
                      {have}/{target}
                    </Text>
                  </View>
                );
              })()}
            </Pressable>

            {isExpanded && NEEDS_TIERS.map((tier) => {
              const tierEntries = grouped[slot][tier];
              if (tierEntries.length === 0) return null;

              return (
                <View key={tier} style={styles.tierSection}>
                  <View style={styles.tierHeader}>
                    <View style={[styles.tierDot, { backgroundColor: NEEDS_TIER_COLORS[tier] }]} />
                    <Text style={[styles.tierLabel, { color: NEEDS_TIER_COLORS[tier] }]}>{tier}</Text>
                    <Text style={styles.tierCount}>{tierEntries.length}</Text>
                  </View>
                  {tierEntries.map((entry) => (
                    <NeedsBoardRow
                      key={entry.id}
                      entry={entry}
                      onPress={() => onEntryPress(entry)}
                      onLongPress={() => onEntryLongPress(entry)}
                    />
                  ))}
                </View>
              );
            })}

            {isExpanded && slotEntries.length === 0 && (
              <Text style={styles.emptyText}>No recruits in this slot</Text>
            )}
          </View>
        );
      })}

      {entries.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No recruits on board yet</Text>
        </View>
      )}
    </View>
  );
}

function NeedsBoardRow({
  entry,
  onPress,
  onLongPress,
}: {
  entry: BoardEntry;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const player = PLAYER_POOL.find((p) => p.id === entry.playerId);
  if (!player) return null;

  const ratings = getPlayerRatings(player.id);
  const kr = ratings?.overall ?? 0;
  const comms = getRecruitComms(entry.playerId);
  const lastTouch = getLastTouch(comms);

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(); }}
      delayLongPress={400}
    >
      {/* Name + pos + height + class */}
      <View style={styles.rowLeft}>
        <Text style={styles.rowName} numberOfLines={1}>
          {player.firstName} {player.lastName}
        </Text>
        <Text style={styles.rowMeta}>
          {player.position} {'\u00B7'} {player.height} {'\u00B7'} {player.classYear}
        </Text>
      </View>

      {/* KR */}
      <Text style={[styles.rowKR, { color: kr >= 75 ? '#5A8A6E' : kr >= 60 ? '#B8943E' : GRAY }]}>
        {kr}
      </Text>

      {/* Tags (max 2) */}
      <View style={styles.tagRow}>
        {entry.tags.slice(0, 2).map((tag) => (
          <View key={tag} style={styles.tagChip}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>

      {/* Status chip */}
      <View style={[styles.statusChip, { backgroundColor: `${BOARD_COLUMN_COLORS[entry.status]}20` }]}>
        <Text style={[styles.statusText, { color: BOARD_COLUMN_COLORS[entry.status] }]}>
          {entry.status}
        </Text>
      </View>

      {/* Last touch */}
      <Text style={styles.rowTouch} numberOfLines={1}>{lastTouch || '\u2014'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slotStrip: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  slotPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  slotPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  slotPillText: {
    fontSize: 13,
    fontWeight: '800',
    color: WHITE,
  },
  slotPillTextActive: {
    color: BG,
  },
  slotPillCount: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
    marginTop: 1,
  },
  slotSection: {
    marginBottom: 12,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  slotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
    flex: 1,
  },
  needBadge: {
    backgroundColor: '#B8943E20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  needBadgeSatisfied: {
    backgroundColor: '#5A8A6E20',
  },
  needBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B8943E',
  },
  needBadgeTextSatisfied: {
    color: '#5A8A6E',
  },
  tierSection: {
    marginLeft: 12,
    marginTop: 8,
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  tierDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tierLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tierCount: {
    fontSize: 11,
    fontWeight: '600',
    color: GRAY,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 10,
    marginBottom: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
    gap: 8,
  },
  rowLeft: {
    flex: 1,
    minWidth: 0,
  },
  rowName: {
    fontSize: 13,
    fontWeight: '600',
    color: WHITE,
  },
  rowMeta: {
    fontSize: 10,
    color: GRAY,
    marginTop: 1,
  },
  rowKR: {
    fontSize: 16,
    fontWeight: '800',
    width: 30,
    textAlign: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    gap: 3,
  },
  tagChip: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 9,
    fontWeight: '600',
    color: GRAY,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
  },
  rowTouch: {
    fontSize: 10,
    color: GRAY,
    width: 54,
    textAlign: 'right',
  },
  emptyText: {
    fontSize: 12,
    color: GRAY,
    paddingVertical: 12,
    paddingLeft: 16,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: GRAY,
  },
});
