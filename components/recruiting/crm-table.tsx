/**
 * CRMTable — horizontally scrollable operations list.
 * Columns: Name | Pos | Ht | Class | KR | Tier | Status | Interest | Last Touch | Next Action | Notes
 * Default sort: Tier (Must Get first) → Last Touch (oldest first).
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { PLAYER_POOL } from '@/data/playerPool';
import { getPlayerRatings } from '@/data/playerRatings';
import {
  NEEDS_TIERS,
  NEEDS_TIER_COLORS,
  POSITION_SLOTS,
  BOARD_COLUMNS,
  BOARD_COLUMN_COLORS,
  INTEREST_COLORS,
  type BoardEntry,
  type NeedsTier,
  type PositionSlot,
  type InterestLevel,
} from '@/data/recruitingBoard';
import { getLastTouch } from '@/utils/recruiting-helpers';
import { getRecruitComms } from '@/data/mock-comms';
import type { PositionNeed } from '@/data/team-needs';

const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#9C9790';
const DIVIDER = '#0B0F14';
const BG = '#0B0F14';

const TIER_ORDER: Record<NeedsTier, number> = { 'Must Get': 0, Primary: 1, Secondary: 2, Watch: 3 };

export function CRMTable({
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
  const [posFilter, setPosFilter] = useState<PositionSlot | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<NeedsTier | null>(null);
  const [interestFilter, setInterestFilter] = useState<InterestLevel | null>(null);

  const sortedEntries = useMemo(() => {
    let list = [...entries];
    if (posFilter) list = list.filter((e) => e.slot === posFilter);
    if (classFilter) list = list.filter((e) => e.classYear === classFilter);
    if (tierFilter) list = list.filter((e) => e.tier === tierFilter);
    if (interestFilter) list = list.filter((e) => e.interest === interestFilter);

    // Default sort: tier priority → last touch (oldest first)
    list.sort((a, b) => {
      const tierA = TIER_ORDER[a.tier ?? 'Watch'];
      const tierB = TIER_ORDER[b.tier ?? 'Watch'];
      if (tierA !== tierB) return tierA - tierB;
      return a.updated.localeCompare(b.updated);
    });

    return list;
  }, [entries, posFilter, classFilter, tierFilter, interestFilter]);

  const classYears = useMemo(() => {
    const years = new Set(entries.map((e) => e.classYear));
    return [...years].sort();
  }, [entries]);

  return (
    <View>
      {/* Filter row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {/* Position */}
          {POSITION_SLOTS.map((slot) => (
            <Pressable
              key={slot}
              style={[styles.filterPill, posFilter === slot && styles.filterPillActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPosFilter(posFilter === slot ? null : slot); }}
            >
              <Text style={[styles.filterPillText, posFilter === slot && styles.filterPillTextActive]}>{slot}</Text>
            </Pressable>
          ))}
          <View style={styles.filterDivider} />
          {/* Class */}
          {classYears.map((year) => (
            <Pressable
              key={year}
              style={[styles.filterPill, classFilter === year && styles.filterPillActive]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setClassFilter(classFilter === year ? null : year); }}
            >
              <Text style={[styles.filterPillText, classFilter === year && styles.filterPillTextActive]}>{year}</Text>
            </Pressable>
          ))}
          <View style={styles.filterDivider} />
          {/* Tier */}
          {NEEDS_TIERS.map((tier) => (
            <Pressable
              key={tier}
              style={[styles.filterPill, tierFilter === tier && { backgroundColor: NEEDS_TIER_COLORS[tier], borderColor: NEEDS_TIER_COLORS[tier] }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setTierFilter(tierFilter === tier ? null : tier); }}
            >
              <Text style={[styles.filterPillText, tierFilter === tier && { color: WHITE }]}>{tier}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>

      {/* Table header */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.headerRow}>
            <Text style={[styles.headerCell, styles.cellName]}>NAME</Text>
            <Text style={[styles.headerCell, styles.cellSmall]}>POS</Text>
            <Text style={[styles.headerCell, styles.cellSmall]}>HT</Text>
            <Text style={[styles.headerCell, styles.cellSmall]}>CLS</Text>
            <Text style={[styles.headerCell, styles.cellKR]}>KR</Text>
            <Text style={[styles.headerCell, styles.cellTier]}>TIER</Text>
            <Text style={[styles.headerCell, styles.cellStatus]}>STATUS</Text>
            <Text style={[styles.headerCell, styles.cellSmall]}>INT</Text>
            <Text style={[styles.headerCell, styles.cellTouch]}>LAST TOUCH</Text>
            <Text style={[styles.headerCell, styles.cellAction]}>NEXT ACTION</Text>
            <Text style={[styles.headerCell, styles.cellNotes]}>NOTES</Text>
          </View>

          {/* Rows */}
          {sortedEntries.map((entry) => (
            <CRMRow
              key={entry.id}
              entry={entry}
              onPress={() => onEntryPress(entry)}
              onLongPress={() => onEntryLongPress(entry)}
            />
          ))}
        </View>
      </ScrollView>

      {sortedEntries.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No recruits match filters</Text>
        </View>
      )}
    </View>
  );
}

function CRMRow({
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
  const tier = entry.tier ?? 'Watch';
  const interest = entry.interest;

  return (
    <Pressable
      style={styles.tableRow}
      onPress={onPress}
      onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(); }}
      delayLongPress={400}
    >
      <Text style={[styles.cell, styles.cellName, { fontWeight: '600' }]} numberOfLines={1}>
        {player.firstName} {player.lastName}
      </Text>
      <Text style={[styles.cell, styles.cellSmall]}>{entry.slot ?? player.position}</Text>
      <Text style={[styles.cell, styles.cellSmall]}>{player.height}</Text>
      <Text style={[styles.cell, styles.cellSmall]}>{player.classYear}</Text>
      <Text style={[styles.cell, styles.cellKR, { color: kr >= 75 ? '#5A8A6E' : kr >= 60 ? '#B8943E' : GRAY, fontWeight: '800' }]}>
        {kr}
      </Text>
      <View style={[styles.cellTier, { justifyContent: 'center' }]}>
        <View style={[styles.tierChip, { backgroundColor: `${NEEDS_TIER_COLORS[tier]}20` }]}>
          <Text style={[styles.tierChipText, { color: NEEDS_TIER_COLORS[tier] }]}>{tier}</Text>
        </View>
      </View>
      <View style={[styles.cellStatus, { justifyContent: 'center' }]}>
        <View style={[styles.statusChip, { backgroundColor: `${BOARD_COLUMN_COLORS[entry.status]}20` }]}>
          <Text style={[styles.statusChipText, { color: BOARD_COLUMN_COLORS[entry.status] }]}>{entry.status}</Text>
        </View>
      </View>
      <View style={[styles.cellSmall, { justifyContent: 'center', alignItems: 'center' }]}>
        {interest && (
          <View style={[styles.interestDot, { backgroundColor: INTEREST_COLORS[interest] }]} />
        )}
      </View>
      <Text style={[styles.cell, styles.cellTouch]} numberOfLines={1}>{lastTouch || '\u2014'}</Text>
      <Text style={[styles.cell, styles.cellAction]} numberOfLines={1}>{entry.nextStep || '\u2014'}</Text>
      <Text style={[styles.cell, styles.cellNotes]} numberOfLines={1}>{entry.shortNotes || '\u2014'}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterScroll: {
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  filterPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  filterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
  },
  filterPillTextActive: {
    color: BG,
  },
  filterDivider: {
    width: 1,
    height: 16,
    backgroundColor: DIVIDER,
    marginHorizontal: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  headerCell: {
    fontSize: 9,
    fontWeight: '700',
    color: GRAY,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  cell: {
    fontSize: 12,
    color: WHITE,
  },
  cellName: { width: 130, paddingRight: 8 },
  cellSmall: { width: 40, textAlign: 'center' },
  cellKR: { width: 36, textAlign: 'center' },
  cellTier: { width: 80 },
  cellStatus: { width: 90 },
  cellTouch: { width: 80, paddingRight: 6 },
  cellAction: { width: 120, paddingRight: 6 },
  cellNotes: { width: 150 },
  tierChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  tierChipText: {
    fontSize: 9,
    fontWeight: '700',
  },
  statusChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 9,
    fontWeight: '700',
  },
  interestDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: GRAY,
  },
});
