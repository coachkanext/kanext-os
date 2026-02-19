/**
 * Recruiting Database V2 — Compact search + filter rows from player pool
 * Shows name, school, position/height, KR badge, archetype tag, level tag.
 * Unscouted players show gray estimated badge.
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

// Mock database entries (simplified player pool)
interface DatabasePlayer {
  id: string;
  name: string;
  school: string;
  position: string;
  height: string;
  kr: number | null; // null = unscouted
  archetype: string;
  level: string;
  classYear: string;
}

const MOCK_DATABASE: DatabasePlayer[] = [
  { id: 'db-1', name: 'Marcus Thompson', school: 'Chipola CC', position: 'PG', height: '6-2', kr: 78, archetype: 'Playmaker', level: 'NJCAA', classYear: '2026' },
  { id: 'db-2', name: 'Jaylen Harris', school: 'Tallahassee CC', position: 'SG', height: '6-3', kr: 82, archetype: 'Shooter', level: 'NJCAA', classYear: '2025' },
  { id: 'db-3', name: 'Darius Okafor', school: 'Palm Beach Atlantic', position: 'PF', height: '6-7', kr: 76, archetype: 'High Motor', level: 'D2', classYear: '2025' },
  { id: 'db-4', name: 'Terrell Washington', school: 'Webber International', position: 'SF', height: '6-6', kr: 80, archetype: 'Versatile', level: 'NAIA', classYear: '2025' },
  { id: 'db-5', name: 'Kendrick Brooks', school: 'Chipola College', position: 'C', height: '6-10', kr: 71, archetype: 'Rim Protector', level: 'NJCAA', classYear: '2025' },
  { id: 'db-6', name: 'Devon Williams', school: 'Miami Norland HS', position: 'PG', height: '5-11', kr: 74, archetype: 'Playmaker', level: 'HS', classYear: '2025' },
  { id: 'db-7', name: 'Andre Mitchell', school: 'Indian River State', position: 'PF', height: '6-8', kr: 77, archetype: 'Stretch Big', level: 'NJCAA', classYear: '2025' },
  { id: 'db-8', name: 'Tyler Jackson', school: 'Daytona State', position: 'SG', height: '6-4', kr: 79, archetype: 'Shooter', level: 'NJCAA', classYear: '2025' },
  { id: 'db-9', name: 'Carlos Mendez', school: 'Broward College', position: 'W', height: '6-5', kr: null, archetype: 'Athletic', level: 'NJCAA', classYear: '2025' },
  { id: 'db-10', name: 'James Porter', school: 'Eastern Florida', position: 'B', height: '6-9', kr: null, archetype: 'Rim Protector', level: 'NJCAA', classYear: '2025' },
  { id: 'db-11', name: 'Ryan Cooper', school: 'Hillsborough CC', position: 'CG', height: '6-3', kr: null, archetype: 'Two-Way', level: 'NJCAA', classYear: '2025' },
  { id: 'db-12', name: 'Brandon Scott', school: 'College of Central FL', position: 'SF', height: '6-7', kr: 73, archetype: 'Versatile', level: 'NJCAA', classYear: '2025' },
  { id: 'db-13', name: 'Isaiah Thomas', school: 'Santa Fe College', position: 'PG', height: '6-0', kr: null, archetype: 'Speed', level: 'NJCAA', classYear: '2026' },
  { id: 'db-14', name: 'Michael Brown', school: 'Miami Dade College', position: 'F', height: '6-6', kr: 70, archetype: 'High Motor', level: 'NJCAA', classYear: '2025' },
  { id: 'db-15', name: 'Luis Fernandez', school: 'CB Marbella (Spain)', position: 'B', height: '6-11', kr: null, archetype: 'Project', level: 'Int\'l', classYear: '2025' },
];

interface Props {
  colors: typeof Colors.light;
}

export function RecruitingDatabaseV2({ colors }: Props) {
  const accent = ModeColors.sports.primary;
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<DatabasePlayer | null>(null);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return MOCK_DATABASE;
    const q = searchQuery.toLowerCase();
    return MOCK_DATABASE.filter((p) =>
      p.name.toLowerCase().includes(q) || p.school.toLowerCase().includes(q) || p.position.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const renderRow = useCallback(({ item: player }: { item: DatabasePlayer }) => {
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
            {player.school} · {player.position}/{player.height} · {player.classYear}
          </ThemedText>
        </View>

        <View style={styles.rowRight}>
          <View style={[styles.archetypeTag, { backgroundColor: '#ffffff08' }]}>
            <ThemedText style={[styles.archetypeText, { color: colors.textSecondary }]}>{player.archetype}</ThemedText>
          </View>
          {isUnscouted ? (
            <View style={[styles.krBadge, { backgroundColor: '#55555530' }]}>
              <Text style={styles.krTextUnscouted}>Est. 68-74</Text>
            </View>
          ) : (
            <View style={[styles.krBadge, { backgroundColor: accent + '22' }]}>
              <Text style={[styles.krTextScouted, { color: accent }]}>{player.kr}</Text>
            </View>
          )}
        </View>
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
          placeholder="Search players, schools..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="done"
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery('')}>
            <IconSymbol name="xmark.circle.fill" size={16} color={colors.textSecondary} />
          </Pressable>
        )}
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
        title="Player Card"
        useModal
      >
        {selectedPlayer && (
          <View style={styles.sheetContent}>
            <ThemedText style={[styles.sheetName, { color: colors.text }]}>{selectedPlayer.name}</ThemedText>
            <ThemedText style={[styles.sheetDetail, { color: colors.textSecondary }]}>
              {selectedPlayer.position} · {selectedPlayer.height} · {selectedPlayer.school} · {selectedPlayer.level}
            </ThemedText>
            {selectedPlayer.kr != null ? (
              <ThemedText style={[styles.sheetKR, { color: accent }]}>KR: {selectedPlayer.kr}</ThemedText>
            ) : (
              <ThemedText style={[styles.sheetKR, { color: colors.textSecondary }]}>Unscouted — Est. 68-74</ThemedText>
            )}
            <View style={styles.sheetActions}>
              {selectedPlayer.kr == null && (
                <Pressable style={[styles.actionBtn, { backgroundColor: accent }]}>
                  <ThemedText style={styles.actionBtnText}>Scout via Nexus</ThemedText>
                </Pressable>
              )}
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
  rowRight: { alignItems: 'flex-end', gap: 4 },
  archetypeTag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  archetypeText: { fontSize: 9, fontWeight: '600' },
  krBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, minWidth: 46, alignItems: 'center' },
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
