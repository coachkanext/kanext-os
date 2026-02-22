/**
 * Game Card — game film card with thumbnail overlay.
 * Shows opponent, score, date, clip count, duration.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { VideoThumbnail } from '@/components/media/video-thumbnail';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatDuration, getResultColor } from '@/data/mock-video';
import type { VideoGame } from '@/data/mock-video';

interface GameCardProps {
  game: VideoGame;
  onPress: () => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const resultColor = getResultColor(game.result);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? '#0B0F14' : '#111' },
      ]}
      onPress={handlePress}
    >
      {/* Thumbnail with overlay */}
      <View style={styles.thumbnailWrapper}>
        <VideoThumbnail
          color={game.thumbnailColor}
          duration={game.duration}
          tags={game.tags}
        />
        {/* Score overlay */}
        <View style={styles.scoreOverlay}>
          <ThemedText style={styles.overlayOpponent}>vs {game.opponent}</ThemedText>
          <View style={styles.scoreRow}>
            <ThemedText style={[styles.resultBadge, { color: resultColor }]}>
              {game.result}
            </ThemedText>
            <ThemedText style={styles.scoreText}>{game.score}</ThemedText>
          </View>
        </View>
      </View>

      {/* Bottom Info */}
      <View style={styles.info}>
        <ThemedText style={styles.date}>{game.date}</ThemedText>
        <View style={styles.statsRow}>
          <ThemedText style={styles.stat}>{game.clipCount} clips</ThemedText>
          <ThemedText style={styles.statDivider}>·</ThemedText>
          <ThemedText style={styles.stat}>{formatDuration(game.duration)}</ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  thumbnailWrapper: {
    position: 'relative',
  },
  scoreOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  overlayOpponent: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resultBadge: {
    fontSize: 13,
    fontWeight: '700',
  },
  scoreText: {
    fontSize: 13,
    color: '#ccc',
  },
  info: {
    padding: Spacing.sm + 2,
  },
  date: {
    fontSize: 13,
    color: '#A1A1AA',
    marginBottom: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stat: {
    fontSize: 12,
    color: '#555',
  },
  statDivider: {
    fontSize: 12,
    color: '#555',
  },
});
