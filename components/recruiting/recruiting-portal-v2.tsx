/**
 * Recruiting Portal V2 — Transfer portal view
 * Same layout as Database, pre-filtered to portal entries.
 * Additional fields: entry date, eligibility remaining.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, ModeColors } from '@/constants/theme';

interface PortalPlayer {
  id: string;
  name: string;
  fromSchool: string;
  position: string;
  height: string;
  kr: number | null;
  level: string;
  entryDate: string;
  eligibilityRemaining: number;
  classYear: string;
  conference: string;
}

const MOCK_PORTAL: PortalPlayer[] = [
  { id: 'pp-1', name: 'Terrell Washington', fromSchool: 'Webber International', position: 'SF', height: '6-6', kr: 80, level: 'NAIA', entryDate: '2026-01-05', eligibilityRemaining: 2, classYear: 'Junior', conference: 'Sun Conference' },
  { id: 'pp-2', name: 'Darius Okafor', fromSchool: 'Palm Beach Atlantic', position: 'PF', height: '6-7', kr: 76, level: 'D2', entryDate: '2025-12-20', eligibilityRemaining: 2, classYear: 'Sophomore', conference: 'SSC' },
  { id: 'pp-3', name: 'Andre Mitchell', fromSchool: 'Indian River State', position: 'PF', height: '6-8', kr: 77, level: 'NJCAA', entryDate: '2026-01-10', eligibilityRemaining: 2, classYear: 'Sophomore', conference: 'FCSAA' },
  { id: 'pp-4', name: 'Marcus Cole', fromSchool: 'Ave Maria', position: 'SG', height: '6-3', kr: 75, level: 'NAIA', entryDate: '2026-01-15', eligibilityRemaining: 1, classYear: 'Senior', conference: 'Sun Conference' },
  { id: 'pp-5', name: 'DeShawn Harris', fromSchool: 'Southeastern', position: 'PG', height: '6-1', kr: 73, level: 'NAIA', entryDate: '2026-01-20', eligibilityRemaining: 2, classYear: 'Sophomore', conference: 'Sun Conference' },
  { id: 'pp-6', name: 'Kevin Park', fromSchool: 'Warner', position: 'C', height: '6-10', kr: 72, level: 'NAIA', entryDate: '2026-02-01', eligibilityRemaining: 1, classYear: 'Junior', conference: 'Sun Conference' },
  { id: 'pp-7', name: 'Jamal Wright', fromSchool: 'Keiser', position: 'W', height: '6-5', kr: null, level: 'NAIA', entryDate: '2026-02-05', eligibilityRemaining: 3, classYear: 'Freshman', conference: 'Sun Conference' },
  { id: 'pp-8', name: 'Chris Adams', fromSchool: 'St. Thomas', position: 'F', height: '6-7', kr: 71, level: 'NAIA', entryDate: '2026-02-08', eligibilityRemaining: 2, classYear: 'Sophomore', conference: 'Sun Conference' },
  { id: 'pp-9', name: 'Dominic Ray', fromSchool: 'William Carey', position: 'SG', height: '6-4', kr: 78, level: 'NAIA', entryDate: '2026-01-25', eligibilityRemaining: 1, classYear: 'Senior', conference: 'SSAC' },
  { id: 'pp-10', name: 'Elijah Stone', fromSchool: 'Campbellsville', position: 'B', height: '6-9', kr: null, level: 'NAIA', entryDate: '2026-02-10', eligibilityRemaining: 2, classYear: 'Sophomore', conference: 'MSC' },
];

type PositionFilter = 'All' | 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'W' | 'F' | 'B';

const POS_FILTERS: PositionFilter[] = ['All', 'PG', 'SG', 'W', 'F', 'B'];

interface Props {
  colors: typeof Colors.light;
}

export function RecruitingPortalV2({ colors }: Props) {
  const accent = ModeColors.sports.primary;
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState<PositionFilter>('All');
  const [selectedPlayer, setSelectedPlayer] = useState<PortalPlayer | null>(null);

  const filtered = useMemo(() => {
    let result = MOCK_PORTAL;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) =>
        p.name.toLowerCase().includes(q) || p.fromSchool.toLowerCase().includes(q)
      );
    }
    if (posFilter !== 'All') {
      result = result.filter((p) => p.position === posFilter || p.position.includes(posFilter));
    }
    return result;
  }, [searchQuery, posFilter]);

  const renderRow = useCallback(({ item: player }: { item: PortalPlayer }) => {
    const isUnscouted = player.kr == null;
    return (
      <Pressable
        style={styles.row}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setSelectedPlayer(player);
        }}
      >
        <View style={styles.rowInfo}>
          <View style={styles.topLine}>
            <ThemedText style={[styles.playerName, { color: colors.text }]} numberOfLines={1}>
              {player.name}
            </ThemedText>
            <View style={[styles.levelTag, { backgroundColor: '#ffffff08' }]}>
              <ThemedText style={[styles.levelText, { color: colors.textSecondary }]}>{player.level}</ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.school, { color: colors.textSecondary }]} numberOfLines={1}>
            {player.fromSchool} · {player.position}/{player.height}
          </ThemedText>
          <View style={styles.portalMeta}>
            <ThemedText style={[styles.portalMetaText, { color: colors.textSecondary }]}>
              Entered: {player.entryDate.slice(5)} · {player.eligibilityRemaining}yr remaining
            </ThemedText>
          </View>
        </View>

        {isUnscouted ? (
          <View style={[styles.krBadge, { backgroundColor: '#55555530' }]}>
            <Text style={styles.krTextUnscouted}>Est.</Text>
          </View>
        ) : (
          <View style={[styles.krBadge, { backgroundColor: accent + '22' }]}>
            <Text style={[styles.krTextScouted, { color: accent }]}>{player.kr}</Text>
          </View>
        )}
      </Pressable>
    );
  }, [colors, accent]);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="magnifyingglass" size={14} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search portal players..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
      </View>

      {/* Position filter */}
      <View style={styles.filterRow}>
        {POS_FILTERS.map((pos) => {
          const isActive = posFilter === pos;
          return (
            <Pressable
              key={pos}
              style={[styles.filterPill, isActive && { backgroundColor: accent, borderColor: accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPosFilter(pos);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {pos}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        renderItem={renderRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Player card sheet */}
      <BottomSheet
        visible={!!selectedPlayer}
        onClose={() => setSelectedPlayer(null)}
        title="Portal Player"
        useModal
      >
        {selectedPlayer && (
          <View style={styles.sheetContent}>
            <ThemedText style={[styles.sheetName, { color: colors.text }]}>{selectedPlayer.name}</ThemedText>
            <ThemedText style={[styles.sheetDetail, { color: colors.textSecondary }]}>
              {selectedPlayer.position} · {selectedPlayer.height} · {selectedPlayer.fromSchool}
            </ThemedText>
            <ThemedText style={[styles.sheetDetail, { color: colors.textSecondary }]}>
              Portal entry: {selectedPlayer.entryDate} · {selectedPlayer.eligibilityRemaining} years remaining
            </ThemedText>
            {selectedPlayer.kr != null ? (
              <ThemedText style={[styles.sheetKR, { color: accent }]}>KR: {selectedPlayer.kr}</ThemedText>
            ) : (
              <ThemedText style={[styles.sheetKR, { color: colors.textSecondary }]}>Unscouted</ThemedText>
            )}
            <View style={styles.sheetActions}>
              <Pressable style={[styles.actionBtn, { backgroundColor: '#ffffff10', borderWidth: 1, borderColor: accent }]}>
                <ThemedText style={[styles.actionBtnText, { color: accent }]}>Add to Board</ThemedText>
              </Pressable>
              <Pressable style={[styles.actionBtn, { backgroundColor: '#ffffff10' }]}>
                <ThemedText style={[styles.actionBtnText, { color: colors.text }]}>Ask Nexus</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg,
    marginVertical: 8, borderRadius: 10, height: 38, paddingHorizontal: 12,
    gap: 8, borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0 },
  filterRow: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingBottom: 6, gap: 6 },
  filterPill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  filterPillText: { fontSize: 12, fontWeight: '600' },
  listContent: { paddingBottom: 120, paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)', gap: 10,
  },
  rowInfo: { flex: 1, gap: 3 },
  topLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  playerName: { fontSize: 14, fontWeight: '600', flex: 1 },
  levelTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  levelText: { fontSize: 9, fontWeight: '700' },
  school: { fontSize: 11 },
  portalMeta: { marginTop: 2 },
  portalMetaText: { fontSize: 10 },
  krBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, minWidth: 40, alignItems: 'center' },
  krTextUnscouted: { fontSize: 10, fontWeight: '600', color: '#777', fontStyle: 'italic' },
  krTextScouted: { fontSize: 12, fontWeight: '800' },
  sheetContent: { paddingHorizontal: Spacing.lg, paddingBottom: 24, gap: 8 },
  sheetName: { fontSize: 18, fontWeight: '700' },
  sheetDetail: { fontSize: 13 },
  sheetKR: { fontSize: 15, fontWeight: '700', marginTop: 4 },
  sheetActions: { marginTop: 16, gap: 10 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionBtnText: { fontSize: 15, fontWeight: '700', color: '#000' },
});
