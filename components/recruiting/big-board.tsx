/**
 * BigBoard — ranked sections view (Top 10, 11-25, 26-50, 51-100).
 * Filter row: Position pills + Class pills + Sort picker.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { PLAYER_POOL } from '@/data/playerPool';
import { getPlayerRatings } from '@/data/playerRatings';
import {
  BIG_BOARD_SECTIONS,
  POSITION_SLOTS,
  INTEREST_COLORS,
  type BoardEntry,
  type PositionSlot,
  type InterestLevel,
} from '@/data/recruitingBoard';
import { computeFitKR } from '@/utils/fit-kr';
import type { OffensiveStyle, DefensiveStyle } from '@/types';

const BG = '#0F1115';
const CARD_BG = '#1A1D23';
const WHITE = '#FFFFFF';
const GRAY = '#8A8F98';
const DIVIDER = '#2A2D35';

type SortKey = 'kr' | 'fit' | 'rank';

export function BigBoard({
  entries,
  offStyle,
  defStyle,
  onEntryPress,
  onEntryLongPress,
}: {
  entries: BoardEntry[];
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
  onEntryPress: (entry: BoardEntry) => void;
  onEntryLongPress: (entry: BoardEntry) => void;
}) {
  const [posFilter, setPosFilter] = useState<PositionSlot | null>(null);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('rank');
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  // Only show entries that have a bigBoardRank
  const rankedEntries = useMemo(() => {
    let list = entries.filter((e) => e.bigBoardRank !== undefined);
    if (posFilter) list = list.filter((e) => e.slot === posFilter);
    if (classFilter) list = list.filter((e) => e.classYear === classFilter);

    if (sortKey === 'kr') {
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.playerId)?.overall ?? 0;
        const bR = getPlayerRatings(b.playerId)?.overall ?? 0;
        return bR - aR;
      });
    } else if (sortKey === 'fit') {
      list = [...list].sort((a, b) => {
        const aR = getPlayerRatings(a.playerId);
        const bR = getPlayerRatings(b.playerId);
        const aFit = aR ? computeFitKR(aR.clusters, offStyle, defStyle) : 0;
        const bFit = bR ? computeFitKR(bR.clusters, offStyle, defStyle) : 0;
        return bFit - aFit;
      });
    } else {
      list = [...list].sort((a, b) => (a.bigBoardRank ?? 999) - (b.bigBoardRank ?? 999));
    }

    return list;
  }, [entries, posFilter, classFilter, sortKey, offStyle, defStyle]);

  // Class years for filter
  const classYears = useMemo(() => {
    const years = new Set(entries.map((e) => e.classYear));
    return [...years].sort();
  }, [entries]);

  const toggleSection = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsedSections((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label); else next.add(label);
      return next;
    });
  };

  return (
    <View>
      {/* Filter row */}
      <View style={styles.filterRow}>
        {/* Position pills */}
        <Pressable
          style={[styles.filterPill, !posFilter && styles.filterPillActive]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPosFilter(null); }}
        >
          <Text style={[styles.filterPillText, !posFilter && styles.filterPillTextActive]}>All</Text>
        </Pressable>
        {POSITION_SLOTS.map((slot) => (
          <Pressable
            key={slot}
            style={[styles.filterPill, posFilter === slot && styles.filterPillActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setPosFilter(posFilter === slot ? null : slot); }}
          >
            <Text style={[styles.filterPillText, posFilter === slot && styles.filterPillTextActive]}>{slot}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.filterRow}>
        {/* Class pills */}
        {classYears.map((year) => (
          <Pressable
            key={year}
            style={[styles.filterPill, classFilter === year && styles.filterPillActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setClassFilter(classFilter === year ? null : year); }}
          >
            <Text style={[styles.filterPillText, classFilter === year && styles.filterPillTextActive]}>{year}</Text>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        {/* Sort picker */}
        {(['rank', 'kr', 'fit'] as SortKey[]).map((key) => (
          <Pressable
            key={key}
            style={[styles.sortPill, sortKey === key && styles.sortPillActive]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSortKey(key); }}
          >
            <Text style={[styles.sortPillText, sortKey === key && styles.sortPillTextActive]}>
              {key === 'rank' ? 'Rank' : key === 'kr' ? 'KR' : 'Fit'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Sections */}
      {BIG_BOARD_SECTIONS.map(({ label, min, max }) => {
        const sectionEntries = rankedEntries.filter((e) => {
          const rank = sortKey === 'rank' ? (e.bigBoardRank ?? 999) : rankedEntries.indexOf(e) + 1;
          return rank >= min && rank <= max;
        });
        // For rank sort, use bigBoardRank range; for other sorts, use position in sorted list
        const displayEntries = sortKey === 'rank'
          ? rankedEntries.filter((e) => (e.bigBoardRank ?? 999) >= min && (e.bigBoardRank ?? 999) <= max)
          : rankedEntries.slice(min - 1, max);

        if (displayEntries.length === 0) return null;
        const isCollapsed = collapsedSections.has(label);

        return (
          <View key={label} style={styles.section}>
            <Pressable style={styles.sectionHeader} onPress={() => toggleSection(label)}>
              <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={12} color={GRAY} />
              <Text style={styles.sectionTitle}>{label}</Text>
              <Text style={styles.sectionCount}>{displayEntries.length}</Text>
            </Pressable>
            {!isCollapsed && displayEntries.map((entry, idx) => {
              const displayRank = sortKey === 'rank' ? entry.bigBoardRank ?? 0 : min + idx;
              return (
                <BigBoardRow
                  key={entry.id}
                  entry={entry}
                  rank={displayRank}
                  offStyle={offStyle}
                  defStyle={defStyle}
                  onPress={() => onEntryPress(entry)}
                  onLongPress={() => onEntryLongPress(entry)}
                />
              );
            })}
          </View>
        );
      })}

      {rankedEntries.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No ranked recruits{posFilter ? ` at ${posFilter}` : ''}</Text>
        </View>
      )}
    </View>
  );
}

function BigBoardRow({
  entry,
  rank,
  offStyle,
  defStyle,
  onPress,
  onLongPress,
}: {
  entry: BoardEntry;
  rank: number;
  offStyle: OffensiveStyle;
  defStyle: DefensiveStyle;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const player = PLAYER_POOL.find((p) => p.id === entry.playerId);
  if (!player) return null;

  const ratings = getPlayerRatings(player.id);
  const kr = ratings?.overall ?? 0;
  const interest = entry.interest;

  return (
    <Pressable
      style={styles.row}
      onPress={onPress}
      onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(); }}
      delayLongPress={400}
    >
      <Text style={styles.rankNum}>{rank}</Text>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName} numberOfLines={1}>
          {player.firstName} {player.lastName}
        </Text>
        <Text style={styles.rowMeta}>
          {entry.slot ?? player.position} {'\u00B7'} {player.height} {'\u00B7'} {player.classYear} {'\u00B7'} {player.currentSchool}
        </Text>
      </View>
      <Text style={[styles.rowKR, { color: kr >= 75 ? '#4CAF50' : kr >= 60 ? '#FF9800' : GRAY }]}>
        {kr}
      </Text>
      {interest && (
        <View style={[styles.interestPill, { backgroundColor: `${INTEREST_COLORS[interest]}20` }]}>
          <Text style={[styles.interestText, { color: INTEREST_COLORS[interest] }]}>{interest}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: DIVIDER,
  },
  filterPillActive: {
    backgroundColor: WHITE,
    borderColor: WHITE,
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY,
  },
  filterPillTextActive: {
    color: BG,
  },
  sortPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: CARD_BG,
  },
  sortPillActive: {
    backgroundColor: WHITE,
  },
  sortPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAY,
  },
  sortPillTextActive: {
    color: BG,
  },
  section: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DIVIDER,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
    flex: 1,
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 10,
    marginTop: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
    gap: 10,
  },
  rankNum: {
    fontSize: 16,
    fontWeight: '800',
    color: GRAY,
    width: 26,
    textAlign: 'center',
  },
  rowInfo: {
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
  interestPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  interestText: {
    fontSize: 9,
    fontWeight: '700',
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
