/**
 * Recruit Clip Card — recruit result card with Watch / Open Profile / Save to Board / Thread actions.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { formatDuration } from '@/data/mock-video';
import type { RecruitClip } from '@/data/mock-video';

interface RecruitClipCardProps {
  clip: RecruitClip;
}

export function RecruitClipCard({ clip }: RecruitClipCardProps) {
  const router = useRouter();

  return (
    <View style={styles.card}>
      {/* Thumbnail */}
      <Pressable
        style={[styles.thumb, { backgroundColor: clip.thumbnailColor }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <View style={styles.playCircle}>
          <IconSymbol name="play.fill" size={14} color="#fff" />
        </View>
        <View style={styles.durationBadge}>
          <ThemedText style={styles.durationText}>{formatDuration(clip.duration)}</ThemedText>
        </View>
      </Pressable>

      {/* Info */}
      <View style={styles.info}>
        <ThemedText style={styles.recruitName}>{clip.recruitName}</ThemedText>
        <ThemedText style={styles.meta}>
          {clip.position} · {clip.school} · {clip.classYear}
        </ThemedText>
        {clip.krOverall != null && (
          <ThemedText style={styles.kr}>KR {clip.krOverall}</ThemedText>
        )}
        <ThemedText style={styles.clipTitle} numberOfLines={1}>{clip.title}</ThemedText>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol name="play.fill" size={12} color="#9C9790" />
          <ThemedText style={styles.actionLabel}>Watch</ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/coach/player-detail?id=${clip.recruitId}` as any);
          }}
        >
          <IconSymbol name="person.fill" size={12} color="#9C9790" />
          <ThemedText style={styles.actionLabel}>Profile</ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Saved', `${clip.recruitName} saved to board`);
          }}
        >
          <IconSymbol name="bookmark.fill" size={12} color="#9C9790" />
          <ThemedText style={styles.actionLabel}>Save</ThemedText>
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Alert.alert('Coming Soon', 'Thread messaging coming soon');
          }}
        >
          <IconSymbol name="bubble.left.fill" size={12} color="#9C9790" />
          <ThemedText style={styles.actionLabel}>Thread</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
    gap: 10,
  },
  thumb: {
    width: 64,
    height: 80,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  playCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 3,
  },
  durationText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#fff',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  recruitName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: '#9C9790',
    marginBottom: 2,
  },
  kr: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  clipTitle: {
    fontSize: 11,
    color: '#555',
  },
  actions: {
    flexDirection: 'column',
    gap: 6,
    justifyContent: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: '#111',
    borderRadius: 6,
  },
  actionLabel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#9C9790',
  },
});
