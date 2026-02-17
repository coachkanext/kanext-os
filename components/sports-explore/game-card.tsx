/**
 * GameCard — Compact game card with team initials, score/date, badge, duration.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BorderRadius } from '@/constants/theme';

interface GameCardProps {
  homeInitials: string;
  awayInitials: string;
  score?: string;
  date: string;
  badge?: string;
  duration: string;
  thumbnailColor: string;
  isLive?: boolean;
}

export function GameCard({
  homeInitials,
  awayInitials,
  score,
  date,
  badge,
  duration,
  thumbnailColor,
  isLive,
}: GameCardProps) {
  return (
    <Pressable
      style={[styles.container, { backgroundColor: thumbnailColor }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        style={styles.gradient}
      />

      {/* Badge */}
      {badge && (
        <View style={[styles.badge, isLive && styles.liveBadge]}>
          <ThemedText style={styles.badgeText}>{badge}</ThemedText>
        </View>
      )}

      {/* Duration */}
      <View style={styles.durationBadge}>
        <ThemedText style={styles.durationText}>{duration}</ThemedText>
      </View>

      {/* Teams */}
      <View style={styles.teamsRow}>
        <View style={styles.teamBubble}>
          <ThemedText style={styles.teamText}>{homeInitials}</ThemedText>
        </View>
        <ThemedText style={styles.vs}>vs</ThemedText>
        <View style={styles.teamBubble}>
          <ThemedText style={styles.teamText}>{awayInitials}</ThemedText>
        </View>
      </View>

      {/* Bottom */}
      <View style={styles.bottom}>
        {score ? (
          <ThemedText style={styles.score}>{score}</ThemedText>
        ) : (
          <ThemedText style={styles.dateText}>{date}</ThemedText>
        )}
        {score && <ThemedText style={styles.dateSmall}>{date}</ThemedText>}
      </View>

      {/* Play icon overlay */}
      {score && (
        <View style={styles.playOverlay}>
          <IconSymbol name="play.fill" size={16} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    aspectRatio: 4 / 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  badge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  liveBadge: {
    backgroundColor: '#EF4444',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  durationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  teamsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  teamBubble: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  teamText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  vs: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  bottom: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    right: 8,
    alignItems: 'center',
  },
  score: {
    fontSize: 15,
    fontWeight: '800',
    color: '#fff',
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  dateSmall: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },
  playOverlay: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});
