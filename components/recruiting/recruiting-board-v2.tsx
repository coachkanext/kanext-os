/**
 * Recruiting Board V2 — CRM-style board view enhanced with real KR intelligence
 * Team needs bar, capacity indicator, filter pills, sort, FlatList rows.
 * Board entries are the coach's pipeline — enriched with KR data from national pool.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import {
  RECRUITING_BOARD,
  STAGE_MIGRATION,
  STAGE_COLORS,
  BOARD_COLUMN_COLORS,
  type BoardEntry,
  type PipelineStageV2,
} from '@/data/recruitingBoard';
import { getKRColor, getArchetypeDisplay, LEVEL_DISPLAY_SHORT } from '@/utils/kr-display';
import { nationalPool, toGlobalPlayerCard } from '@/data/national-pool';
import { openPlayerCard } from '@/utils/global-entity-sheets';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
}

type FilterKey = 'all' | 'Prospect' | 'Contact Made' | 'Eval Sent' | 'Visit Scheduled' | 'Offer Out' | 'Committed';
type SortKey = 'kr' | 'position' | 'stage' | 'lastContact' | 'name' | 'fitScore';

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'Prospect', label: 'Prospects' },
  { key: 'Contact Made', label: 'Contacted' },
  { key: 'Visit Scheduled', label: 'Visits' },
  { key: 'Offer Out', label: 'Offers' },
  { key: 'Committed', label: 'Committed' },
];

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'kr', label: 'KR' },
  { key: 'position', label: 'Position' },
  { key: 'stage', label: 'Stage' },
  { key: 'lastContact', label: 'Last Contact' },
  { key: 'name', label: 'Name' },
  { key: 'fitScore', label: 'Fit Score' },
];

const NEED_PRIORITIES: Record<string, { color: string; label: string }> = {
  PG: { color: '#ef4444', label: 'Critical' },
  CG: { color: '#f59e0b', label: 'Moderate' },
  W: { color: '#ef4444', label: 'Critical' },
  F: { color: '#f59e0b', label: 'Moderate' },
  B: { color: '#22c55e', label: 'Low' },
};

function getV2Stage(entry: BoardEntry): PipelineStageV2 {
  return STAGE_MIGRATION[entry.status] ?? 'Prospect';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function RecruitingBoardV2({ colors }: Props) {
  const accent = useAccentColor();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [sortKey, setSortKey] = useState<SortKey>('kr');
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<BoardEntry | null>(null);

  const entries = useMemo(() => {
    let result = [...RECRUITING_BOARD];

    // Filter
    if (activeFilter !== 'all') {
      result = result.filter((e) => getV2Stage(e) === activeFilter);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortKey) {
        case 'kr': return (b.bigBoardRank ?? 999) < (a.bigBoardRank ?? 999) ? 1 : -1;
        case 'position': return a.position.localeCompare(b.position);
        case 'stage': return STAGE_MIGRATION[a.status].localeCompare(STAGE_MIGRATION[b.status]);
        case 'lastContact': return b.updated.localeCompare(a.updated);
        case 'name': return a.shortNotes.localeCompare(b.shortNotes);
        case 'fitScore': return (b.fitScore ?? 0) - (a.fitScore ?? 0);
        default: return 0;
      }
    });

    return result;
  }, [activeFilter, sortKey]);

  const activeCount = RECRUITING_BOARD.filter((e) => !['Missed', 'Signed'].includes(e.status)).length;
  const sortLabel = SORT_OPTIONS.find((o) => o.key === sortKey)?.label ?? 'KR';

  // Try to look up real player data from national pool when viewing details
  const handleEntryTap = useCallback((entry: BoardEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Try to find this player in the national pool by name search
    const nameFromNotes = entry.shortNotes.split(',')[0].replace('Committed! ', '').replace('Lost to ', '').trim();
    const results = nationalPool.search({ query: nameFromNotes, limit: 1 });
    if (results.length > 0) {
      // Found real data — open full intelligence player card
      openPlayerCard(toGlobalPlayerCard(results[0]));
    } else {
      // Fallback to local sheet with board entry info
      setSelectedEntry(entry);
    }
  }, []);

  const renderRow = useCallback(({ item: entry }: { item: BoardEntry }) => {
    const stage = getV2Stage(entry);
    const stageColor = STAGE_COLORS[stage];
    const nameFromNotes = entry.shortNotes.split(',')[0].replace('Committed! ', '').replace('Lost to ', '');

    // Try matching to real player for KR color
    const krValue = entry.bigBoardRank != null ? entry.bigBoardRank : null;
    const krColor = getKRColor(krValue);

    return (
      <Pressable
        style={styles.row}
        onPress={() => handleEntryTap(entry)}
      >
        {/* Avatar with position */}
        <View style={[styles.avatar, { backgroundColor: BOARD_COLUMN_COLORS[entry.status] }]}>
          <Text style={styles.avatarText}>{entry.position}</Text>
        </View>

        {/* Info */}
        <View style={styles.rowInfo}>
          <View style={styles.rowTopLine}>
            <Text style={[styles.entryName, { color: colors.text }]} numberOfLines={1}>{nameFromNotes}</Text>
            <View style={[styles.posPill, { backgroundColor: '#ffffff08' }]}>
              <Text style={[styles.posText, { color: colors.textSecondary }]}>{entry.position}/{entry.classYear}</Text>
            </View>
          </View>
          <View style={styles.rowBottomLine}>
            {krValue != null && (
              <View style={[styles.krBadge, { backgroundColor: krColor + '22' }]}>
                <Text style={[styles.krText, { color: krColor }]}>KR {krValue}</Text>
              </View>
            )}
            <View style={[styles.stagePill, { backgroundColor: stageColor + '22' }]}>
              <Text style={[styles.stageText, { color: stageColor }]}>{stage}</Text>
            </View>
            {entry.fitScore != null && (
              <Text style={[styles.fitText, { color: colors.textSecondary }]}>Fit {entry.fitScore}%</Text>
            )}
            {entry.motivations && entry.motivations.length > 0 && (
              <View style={styles.motivationsRow}>
                {entry.motivations.slice(0, 2).map((m) => (
                  <View key={m} style={[styles.motivationTag, { backgroundColor: '#ffffff08' }]}>
                    <Text style={[styles.motivationText, { color: colors.textSecondary }]}>{m}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Last contact */}
        <Text style={[styles.lastContact, { color: colors.textSecondary }]}>{entry.updated.slice(5)}</Text>
      </Pressable>
    );
  }, [colors, handleEntryTap]);

  return (
    <View style={styles.container}>
      {/* Team Needs Bar */}
      <View style={styles.needsBar}>
        <ThemedText style={[styles.needsLabel, { color: colors.textSecondary }]}>Team Needs</ThemedText>
        <View style={styles.needsPills}>
          {Object.entries(NEED_PRIORITIES).map(([pos, { color }]) => (
            <View key={pos} style={[styles.needPill, { borderColor: color + '44' }]}>
              <Text style={[styles.needPillText, { color }]}>{pos}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Capacity */}
      <View style={styles.capacityRow}>
        <ThemedText style={[styles.capacityText, { color: colors.textSecondary }]}>
          Active Recruits: {activeCount}/20 · Scholarships: 12/15 available
        </ThemedText>
      </View>

      {/* Filter pills */}
      <View style={styles.filterRow}>
        {FILTER_PILLS.map((f) => {
          const isActive = activeFilter === f.key;
          return (
            <Pressable
              key={f.key}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveFilter(f.key);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Sort */}
      <View style={styles.sortRow}>
        <Pressable style={[styles.sortPill, { backgroundColor: colors.card }]} onPress={() => setSortDropdownOpen(true)}>
          <ThemedText style={[styles.sortLabel, { color: colors.textSecondary }]}>Sort: </ThemedText>
          <ThemedText style={[styles.sortValue, { color: colors.text }]}>{sortLabel}</ThemedText>
          <ThemedText style={[styles.sortArrow, { color: colors.textSecondary }]}> ▾</ThemedText>
        </Pressable>
        <ThemedText style={[styles.countText, { color: colors.textSecondary }]}>{entries.length} recruits</ThemedText>
      </View>

      {/* Sort dropdown */}
      {sortDropdownOpen && (
        <Modal visible transparent animationType="none" onRequestClose={() => setSortDropdownOpen(false)}>
          <Pressable style={styles.dropdownOverlay} onPress={() => setSortDropdownOpen(false)}>
            <View style={[styles.dropdown, { backgroundColor: colors.card }]}>
              {SORT_OPTIONS.map((opt) => {
                const isSelected = opt.key === sortKey;
                return (
                  <Pressable
                    key={opt.key}
                    style={[styles.dropdownItem, isSelected && { backgroundColor: accent }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSortKey(opt.key);
                      setSortDropdownOpen(false);
                    }}
                  >
                    <ThemedText style={[styles.dropdownText, { color: isSelected ? '#000' : colors.text }]}>
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Modal>
      )}

      {/* Rows */}
      <FlatList
        data={entries}
        keyExtractor={(e) => e.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Fallback Prospect Card sheet (when player not in national pool) */}
      <BottomSheet
        visible={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="Prospect Card"
        useModal
      >
        {selectedEntry && (
          <View style={styles.sheetContent}>
            <ThemedText style={[styles.sheetName, { color: colors.text }]}>
              {selectedEntry.shortNotes.split(',')[0].replace('Committed! ', '')}
            </ThemedText>
            <ThemedText style={[styles.sheetDetail, { color: colors.textSecondary }]}>
              {selectedEntry.position} · {selectedEntry.classYear} · {getV2Stage(selectedEntry)}
            </ThemedText>
            {selectedEntry.bigBoardRank != null && (
              <View style={styles.sheetKRRow}>
                <View style={[styles.sheetKRBadge, { backgroundColor: getKRColor(selectedEntry.bigBoardRank) + '22' }]}>
                  <Text style={[styles.sheetKRText, { color: getKRColor(selectedEntry.bigBoardRank) }]}>
                    KR {selectedEntry.bigBoardRank}
                  </Text>
                </View>
              </View>
            )}
            {selectedEntry.fitScore != null && (
              <ThemedText style={[styles.sheetDetail, { color: colors.textSecondary }]}>
                Fit Score: {selectedEntry.fitScore}%
              </ThemedText>
            )}
            {selectedEntry.motivations && (
              <ThemedText style={[styles.sheetDetail, { color: colors.textSecondary }]}>
                Motivations: {selectedEntry.motivations.join(', ')}
              </ThemedText>
            )}
            <ThemedText style={[styles.sheetNotes, { color: colors.text }]}>
              {selectedEntry.longNotes}
            </ThemedText>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  needsBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 6, gap: 8 },
  needsLabel: { fontSize: 11, fontWeight: '600' },
  needsPills: { flexDirection: 'row', gap: 4 },
  needPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  needPillText: { fontSize: 11, fontWeight: '700' },
  capacityRow: { paddingHorizontal: Spacing.lg, paddingBottom: 4 },
  capacityText: { fontSize: 11 },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: 6, gap: 6, flexWrap: 'wrap' },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: '#2F3336',
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  sortRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingBottom: 4 },
  sortPill: { flexDirection: 'row', alignItems: 'center', height: 30, paddingHorizontal: 10, borderRadius: 8 },
  sortLabel: { fontSize: 12, fontWeight: '500' },
  sortValue: { fontSize: 12, fontWeight: '700' },
  sortArrow: { fontSize: 12 },
  countText: { fontSize: 11 },
  dropdownOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dropdown: { borderRadius: 12, paddingVertical: 4, minWidth: 160, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 16 },
  dropdownText: { fontSize: 14, fontWeight: '500' },
  listContent: { paddingBottom: 120, paddingHorizontal: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#2F3336', gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  rowInfo: { flex: 1, gap: 4 },
  rowTopLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  entryName: { fontSize: 14, fontWeight: '600', flex: 1 },
  posPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  posText: { fontSize: 10, fontWeight: '600' },
  rowBottomLine: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  krBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  krText: { fontSize: 11, fontWeight: '800' },
  stagePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  stageText: { fontSize: 10, fontWeight: '700' },
  fitText: { fontSize: 10 },
  motivationsRow: { flexDirection: 'row', gap: 4 },
  motivationTag: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  motivationText: { fontSize: 9, fontWeight: '600' },
  lastContact: { fontSize: 10, width: 40, textAlign: 'right' },
  sheetContent: { paddingHorizontal: Spacing.lg, paddingBottom: 24, gap: 8 },
  sheetName: { fontSize: 18, fontWeight: '700' },
  sheetDetail: { fontSize: 13 },
  sheetKRRow: { flexDirection: 'row', marginTop: 4 },
  sheetKRBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  sheetKRText: { fontSize: 14, fontWeight: '800' },
  sheetNotes: { fontSize: 13, lineHeight: 20, marginTop: 4 },
});
