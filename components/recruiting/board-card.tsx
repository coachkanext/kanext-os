/**
 * BoardCard — compact recruit card for Kanban columns and list view.
 * Shows: KR, identity, OFF/DEF chips, tags, last update.
 * Tap → opens PlayerSheet. Long-press → quick actions.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { PLAYER_POOL } from '@/data/playerPool';
import { getPlayerRatings } from '@/data/playerRatings';
import { TRADITIONAL_TO_HELIO } from '@/data/position-mapping';
import { BOARD_COLUMN_COLORS, type BoardEntry, type BoardStatus } from '@/data/recruitingBoard';
import type { ClusterType } from '@/types';

const CARD_BG = '#0B0F14';
const WHITE = '#FFFFFF';
const GRAY = '#A1A1AA';
const DIVIDER = '#0B0F14';

const PRIORITY_COLORS: Record<string, string> = {
  A: '#22C55E',
  B: '#F59E0B',
  C: '#A1A1AA',
};

export interface BoardCardProps {
  entry: BoardEntry;
  onPress: () => void;
  onLongPress: () => void;
  /** Full-width mode for list view */
  fullWidth?: boolean;
}

export function BoardCard({ entry, onPress, onLongPress, fullWidth }: BoardCardProps) {
  const player = useMemo(() => PLAYER_POOL.find((p) => p.id === entry.playerId), [entry.playerId]);
  const ratings = useMemo(() => getPlayerRatings(entry.playerId), [entry.playerId]);

  if (!player) return null;

  const kr = ratings?.overall ?? 0;
  const helioPos = TRADITIONAL_TO_HELIO[player.position] ?? player.position;
  const levelLabel = player.level === 'HS' ? 'Prep' : player.level;

  // OFF/DEF KR
  const offKR = ratings
    ? Math.round((ratings.clusters.shooting + ratings.clusters.finishing + ratings.clusters.playmaking) / 3)
    : null;
  const defKR = ratings
    ? Math.round(
        (ratings.clusters.perimeter_defense +
          ratings.clusters.interior_defense +
          ratings.clusters.rebounding +
          ratings.clusters.frame) / 4,
      )
    : null;

  // Last update label
  const updateLabel = (() => {
    if (!entry.updated) return '';
    const d = new Date(entry.updated);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    const weeks = Math.floor(diffDays / 7);
    return `Wk ${weeks > 0 ? weeks : 1}`;
  })();

  // Tags: show max 3, then +N
  const visibleTags = entry.tags.slice(0, 3);
  const extraTagCount = Math.max(0, entry.tags.length - 3);

  return (
    <Pressable
      style={[styles.card, fullWidth && styles.cardFullWidth]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress();
      }}
      delayLongPress={400}
    >
      {/* Row 1: Avatar placeholder + Name + KR */}
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <IconSymbol name="person.fill" size={16} color={GRAY} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {player.firstName} {player.lastName}
        </Text>
        <Text style={styles.krBig}>{kr}</Text>
      </View>

      {/* Row 2: Identity line */}
      <Text style={styles.identity} numberOfLines={1}>
        {helioPos} {'\u00B7'} {entry.classYear} {'\u00B7'} {player.currentSchool} {'\u00B7'} {levelLabel}
      </Text>

      {/* Row 3: OFF/DEF chips */}
      <View style={styles.chipRow}>
        {offKR !== null && (
          <View style={[styles.odChip, { backgroundColor: '#0B0F14' }]}>
            <Text style={[styles.odChipText, { color: '#22C55E' }]}>OFF {offKR}</Text>
          </View>
        )}
        {defKR !== null && (
          <View style={[styles.odChip, { backgroundColor: '#0B0F14' }]}>
            <Text style={[styles.odChipText, { color: '#EF4444' }]}>DEF {defKR}</Text>
          </View>
        )}
      </View>

      {/* Row 4: Priority + tags */}
      <View style={styles.tagRow}>
        <View style={[styles.tag, { backgroundColor: `${PRIORITY_COLORS[entry.priority]}20` }]}>
          <Text style={[styles.tagText, { color: PRIORITY_COLORS[entry.priority] }]}>
            Priority {entry.priority}
          </Text>
        </View>
        {visibleTags.map((t) => (
          <View key={t} style={styles.tag}>
            <Text style={styles.tagText}>{t}</Text>
          </View>
        ))}
        {extraTagCount > 0 && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>+{extraTagCount}</Text>
          </View>
        )}
      </View>

      {/* Row 5: Footer — last update + notes indicator */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>{updateLabel}</Text>
        {(entry.shortNotes || entry.longNotes) && (
          <Text style={styles.footerText}>
            {'\u00B7'} Notes: {(entry.shortNotes ? 1 : 0) + (entry.longNotes ? 1 : 0)}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
    width: 260,
  },
  cardFullWidth: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: WHITE,
  },
  krBig: {
    fontSize: 18,
    fontWeight: '800',
    color: WHITE,
    marginLeft: 8,
  },
  identity: {
    fontSize: 11,
    color: GRAY,
    marginBottom: 6,
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  odChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  odChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  tag: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '600',
    color: GRAY,
  },
  footer: {
    flexDirection: 'row',
    gap: 4,
  },
  footerText: {
    fontSize: 10,
    color: '#A1A1AA',
  },
});
