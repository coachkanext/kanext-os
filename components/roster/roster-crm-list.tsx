/**
 * Roster CRM List View — Enhanced with universal KR intelligence
 * Compact, filterable, sortable player rows with KR badges (universal color bands),
 * level-aware tier labels, archetype tags, status tags, portal risk dots, and flag icons.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme'
;
import { TEAM_COLORS, ROSTER_META, computePortalRisk, getPortalRiskColor } from '@/data/roster-data';
import { jerseyArchetypeMap } from '@/data/fmu';
import { getKRColor, getKRTierLabel, getArchetypeDisplay } from '@/utils/kr-display';
import type { RosterFilterCategory, RosterSortKey } from '@/types';

type RosterPlayer = {
  id: string;
  number: string;
  firstName: string;
  lastName: string;
  position: string;
  listPos: string;
  height: string;
  weight: number;
  classYear: string;
  ppg: number;
  rpg: number;
  apg: number;
  kr: number;
  usage: number;
  minutes: number;
  role: string;
};

const FILTER_PILLS: { key: RosterFilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'starters', label: 'Starters' },
  { key: 'guards', label: 'Guards' },
  { key: 'wings', label: 'Wings' },
  { key: 'forwards', label: 'Forwards' },
  { key: 'bigs', label: 'Bigs' },
  { key: 'flagged', label: 'Flagged' },
];

const SORT_OPTIONS: { key: RosterSortKey; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'name', label: 'Name' },
  { key: 'position', label: 'Position' },
  { key: 'minutes', label: 'Minutes' },
  { key: 'nil', label: 'NIL Amount' },
  { key: 'ppg', label: 'PPG' },
];

const POS_GROUPS: Record<string, RosterFilterCategory> = {
  PG: 'guards',
  CG: 'guards',
  W: 'wings',
  F: 'forwards',
  B: 'bigs',
};

const STATUS_LABEL: Record<string, string> = {
  starter: 'Starter',
  rotation: 'Rotation',
  bench: 'Bench',
  injured: 'Injured',
  redshirt: 'Redshirt',
  out: 'Out',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  starter: { bg: '#22c55e22', text: '#22c55e' },
  rotation: { bg: `${accent}22`, text: accent },
  bench: { bg: '#0B0F1480', text: '#999' },
  injured: { bg: '#ef444430', text: '#ef4444' },
  redshirt: { bg: '#f59e0b30', text: '#f59e0b' },
  out: { bg: '#ef444430', text: '#ef4444' },
};

interface Props {
  roster: RosterPlayer[];
  onPlayerTap: (jersey: string) => void;
}

export function RosterCRMList({ roster, onPlayerTap }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<RosterFilterCategory>('all');
  const [sortKey, setSortKey] = useState<RosterSortKey>('kr');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [localFlags, setLocalFlags] = useState<Set<string>>(() => {
    const set = new Set<string>();
    Object.entries(ROSTER_META).forEach(([jersey, meta]) => {
      if (meta.flagged) set.add(jersey);
    });
    return set;
  });

  const toggleFlag = useCallback((jersey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLocalFlags((prev) => {
      const next = new Set(prev);
      if (next.has(jersey)) next.delete(jersey);
      else next.add(jersey);
      return next;
    });
  }, []);

  const filteredSorted = useMemo(() => {
    let result = [...roster];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((p) => `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.number.includes(q));
    }

    // Filter
    if (activeFilter === 'starters') {
      result = result.filter((p) => p.role === 'starter');
    } else if (activeFilter === 'flagged') {
      result = result.filter((p) => localFlags.has(p.number));
    } else if (activeFilter !== 'all') {
      result = result.filter((p) => POS_GROUPS[p.listPos] === activeFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortKey) {
        case 'kr': return b.kr - a.kr;
        case 'name': return `${a.lastName}${a.firstName}`.localeCompare(`${b.lastName}${b.firstName}`);
        case 'position': {
          const order: Record<string, number> = { PG: 1, CG: 2, W: 3, F: 4, B: 5 };
          return (order[a.listPos] ?? 9) - (order[b.listPos] ?? 9);
        }
        case 'minutes': return b.minutes - a.minutes;
        case 'nil': return (ROSTER_META[b.number]?.nilAmount ?? 0) - (ROSTER_META[a.number]?.nilAmount ?? 0);
        case 'ppg': return b.ppg - a.ppg;
        default: return 0;
      }
    });

    return result;
  }, [roster, searchQuery, activeFilter, sortKey, localFlags]);

  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'KR';

  // Stat label changes based on sort key
  const getStatValue = (player: RosterPlayer): string => {
    switch (sortKey) {
      case 'ppg': return `${player.ppg} PPG`;
      case 'minutes': return `${player.minutes} MPG`;
      case 'nil': {
        const nil = ROSTER_META[player.number]?.nilAmount ?? 0;
        return nil > 0 ? `$${nil.toLocaleString()}` : '\u2014';
      }
      default: return `${player.ppg} PPG`;
    }
  };

  const renderRow = useCallback(({ item: player }: { item: RosterPlayer }) => {
    const meta = ROSTER_META[player.number];
    const effectiveRole = meta?.status === 'injured' ? 'injured' : meta?.status === 'redshirt' ? 'redshirt' : meta?.status === 'out' ? 'out' : player.role;
    const statusColor = STATUS_COLORS[effectiveRole] ?? STATUS_COLORS.bench;
    const portalRisk = computePortalRisk(player.number, player.kr, player.minutes, meta?.nilAmount ?? 0);
    const isFlagged = localFlags.has(player.number);
    const initials = `${player.firstName[0]}${player.lastName[0]}`;

    // Universal KR display
    const krColor = getKRColor(player.kr);
    const krTier = getKRTierLabel(player.kr, 'naia'); // KaNeXT is NAIA

    // Archetype from KaNeXT data
    const archetypeKey = jerseyArchetypeMap.get(player.number);
    const archetypeLabel = archetypeKey ? getArchetypeDisplay(archetypeKey) : null;

    return (
      <Pressable
        style={styles.row}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPlayerTap(player.number);
        }}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        {/* Main info */}
        <View style={styles.rowInfo}>
          <View style={styles.rowTopLine}>
            <Text style={styles.jersey}>#{player.number}</Text>
            <Text style={styles.playerName} numberOfLines={1}>{player.firstName} {player.lastName}</Text>
            <View style={styles.posPill}>
              <Text style={styles.posPillText}>{player.listPos}</Text>
            </View>
          </View>
          <View style={styles.rowBottomLine}>
            <View style={[styles.krBadge, { backgroundColor: krColor + '22' }]}>
              <Text style={[styles.krText, { color: krColor }]}>{player.kr}</Text>
            </View>
            <View style={[styles.statusTag, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>{STATUS_LABEL[effectiveRole] ?? effectiveRole}</Text>
            </View>
            {archetypeLabel && (
              <View style={styles.archetypeTag}>
                <Text style={styles.archetypeText}>{archetypeLabel}</Text>
              </View>
            )}
            <Text style={styles.statValue}>{getStatValue(player)}</Text>
          </View>
          {/* KR tier label */}
          <Text style={[styles.krTierLabel, { color: krColor }]}>{krTier}</Text>
        </View>

        {/* Right column: portal risk + flag */}
        <View style={styles.rowRight}>
          <View style={[styles.riskDot, { backgroundColor: getPortalRiskColor(portalRisk) }]} />
          <Pressable
            hitSlop={12}
            onPress={(e) => {
              e.stopPropagation?.();
              toggleFlag(player.number);
            }}
          >
            <IconSymbol
              name={isFlagged ? 'flag.fill' : 'flag'}
              size={14}
              color={isFlagged ? '#f59e0b' : '#555'}
            />
          </Pressable>
        </View>
      </Pressable>
    );
  }, [localFlags, sortKey, onPlayerTap, toggleFlag]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchBar}>
        <IconSymbol name="magnifyingglass" size={14} color={TEAM_COLORS.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search roster..."
          placeholderTextColor={TEAM_COLORS.gray}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color={TEAM_COLORS.gray} />
          </Pressable>
        )}
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTER_PILLS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.filterPill, isActive && styles.filterPillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(f.key);
              }}
            >
              <Text style={[styles.filterPillText, isActive && styles.filterPillTextActive]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Sort row */}
      <View style={styles.sortRow}>
        <Pressable
          style={styles.sortPill}
          onPress={() => setSortDropdownOpen(true)}
        >
          <Text style={styles.sortPillLabel}>Sort: </Text>
          <Text style={styles.sortPillValue}>{sortLabel}</Text>
          <Text style={styles.sortPillArrow}> ▾</Text>
        </Pressable>
        <Text style={styles.countLabel}>{filteredSorted.length} players</Text>
      </View>

      {/* Sort dropdown */}
      {sortDropdownOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setSortDropdownOpen(false)}>
          <Pressable style={styles.dropdownOverlay} onPress={() => setSortDropdownOpen(false)}>
            <View style={styles.dropdown}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.key === sortKey;
                return (
                  <Pressable
                    key={opt.key}
                    style={[styles.dropdownItem, isSelected && styles.dropdownItemActive]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSortKey(opt.key);
                      setSortDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownText, isSelected && styles.dropdownTextActive]}>{opt.label}</Text>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Player rows */}
      <FlatList
        data={filteredSorted}
        keyExtractor={(p) => p.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: 8,
    marginBottom: 6,
    backgroundColor: '#0B0F14',
    borderRadius: 8,
    height: 36,
    paddingHorizontal: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 6,
    gap: 6,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
    borderColor: '#ffffff08',
  },
  filterPillActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  filterPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  filterPillTextActive: {
    color: '#111',
    fontWeight: '700',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 4,
  },
  sortPill: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#0B0F14',
  },
  sortPillLabel: { fontSize: 12, fontWeight: '500', color: TEAM_COLORS.gray },
  sortPillValue: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  sortPillArrow: { fontSize: 12, color: TEAM_COLORS.gray },
  countLabel: { fontSize: 11, color: TEAM_COLORS.gray },
  dropdownOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dropdown: {
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    paddingVertical: 4,
    minWidth: 160,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16 },
  dropdownItemActive: { backgroundColor: '#FFFFFF' },
  dropdownText: { fontSize: 14, fontWeight: '500', color: '#999' },
  dropdownTextActive: { color: '#111', fontWeight: '700' },
  listContent: { paddingBottom: 120, paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: TEAM_COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#fff' },
  rowInfo: { flex: 1, gap: 3 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jersey: { fontSize: 12, fontWeight: '700', color: TEAM_COLORS.gray },
  playerName: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', flex: 1 },
  posPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#0B0F14',
  },
  posPillText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },
  rowBottomLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  krBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  krText: { fontSize: 11, fontWeight: '800' },
  statusTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  archetypeTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#ffffff08',
  },
  archetypeText: { fontSize: 9, fontWeight: '600', color: '#aaa' },
  statValue: { fontSize: 11, color: TEAM_COLORS.gray },
  krTierLabel: { fontSize: 9, fontWeight: '600', marginTop: 1 },
  rowRight: { alignItems: 'center', gap: 8, paddingLeft: 4 },
  riskDot: { width: 8, height: 8, borderRadius: 4 },
});
