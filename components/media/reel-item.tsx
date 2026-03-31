/**
 * Reel Item — TikTok-style full-screen reel in vertical feed.
 * Tap to pause/play. Creator row. Side action column. Bottom overlay with caption.
 * Premium design with Luxury Control Room palette.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Reel } from '@/data/mock-video';

const ACCENT_GOLD = '#FFFFFF';
const SCREEN_WIDTH = Dimensions.get('window').width;

interface ReelItemProps {
  reel: Reel;
  height: number;
  onShare?: () => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function ReelItem({ reel, height, onShare }: ReelItemProps) {
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaused(!paused);
  };

  const creatorName = reel.playerTag?.name ?? 'Carroll Athletics';
  const creatorInitials = reel.playerTag
    ? reel.playerTag.name.split(' ').map((w) => w[0]).join('')
    : 'FL';
  const commentCount = Math.floor(reel.likes * 0.3);
  const shareCount = Math.floor(reel.likes * 0.15);

  return (
    <Pressable
      style={[styles.container, { height, backgroundColor: reel.thumbnailColor }]}
      onPress={togglePause}
    >
      {/* Multi-stop gradient overlay for readability */}
      <LinearGradient
        colors={[
          'rgba(0,0,0,0.4)',
          'transparent',
          'transparent',
          'rgba(0,0,0,0.6)',
        ]}
        locations={[0, 0.2, 0.55, 1]}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Paused indicator */}
      {paused && (
        <View style={styles.pauseOverlay}>
          <View style={styles.pauseIcon}>
            <IconSymbol name="play.fill" size={44} color="rgba(255,255,255,0.9)" />
          </View>
        </View>
      )}

      {/* Duration badge (top-right) */}
      <View style={styles.durationBadge}>
        <ThemedText style={styles.durationText}>
          {formatDuration(reel.duration)}
        </ThemedText>
      </View>

      {/* Right-side action column */}
      <View style={styles.actions}>
        {/* Creator avatar */}
        <View style={styles.creatorAvatar}>
          <View style={styles.creatorAvatarCircle}>
            <ThemedText style={styles.creatorAvatarText}>{creatorInitials}</ThemedText>
          </View>
          <View style={styles.followBadge}>
            <IconSymbol name="plus" size={8} color="#fff" />
          </View>
        </View>

        {/* Like */}
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLiked(!liked);
          }}
        >
          <IconSymbol
            name="heart.fill"
            size={28}
            color={liked ? '#B85C5C' : '#fff'}
          />
          <ThemedText style={styles.actionCount}>
            {liked ? reel.likes + 1 : reel.likes}
          </ThemedText>
        </Pressable>

        {/* Comment */}
        <Pressable
          style={styles.actionBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="bubble.right.fill" size={26} color="#fff" />
          <ThemedText style={styles.actionCount}>{commentCount}</ThemedText>
        </Pressable>

        {/* Bookmark */}
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSaved(!saved);
          }}
        >
          <IconSymbol
            name="bookmark.fill"
            size={26}
            color={saved ? ACCENT_GOLD : '#fff'}
          />
          <ThemedText style={styles.actionCount}>
            {saved ? reel.saves + 1 : reel.saves}
          </ThemedText>
        </Pressable>

        {/* Share */}
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare?.();
          }}
        >
          <IconSymbol name="arrowshape.turn.up.right.fill" size={26} color="#fff" />
          <ThemedText style={styles.actionCount}>{shareCount}</ThemedText>
        </Pressable>

        {/* Spinning disc placeholder */}
        <View style={styles.discContainer}>
          <View style={styles.disc}>
            <View style={styles.discInner}>
              <IconSymbol name="music.note" size={10} color="#fff" />
            </View>
          </View>
        </View>
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        {/* Creator row */}
        <View style={styles.creatorRow}>
          <ThemedText style={styles.creatorName}>@{creatorName.replace(/\s/g, '')}</ThemedText>
          {reel.playerTag && (
            <View style={styles.creatorBadge}>
              <ThemedText style={styles.creatorBadgeText}>
                #{reel.playerTag.number}
              </ThemedText>
            </View>
          )}
        </View>

        {/* Caption */}
        <ThemedText style={styles.caption} numberOfLines={2}>
          {reel.caption}
        </ThemedText>

        {/* Tags */}
        <View style={styles.tagRow}>
          {reel.playerTag && (
            <View style={styles.tag}>
              <ThemedText style={styles.tagText}>
                #{reel.playerTag.number} {reel.playerTag.name}
              </ThemedText>
            </View>
          )}
          {reel.teamTag && (
            <View style={styles.tag}>
              <ThemedText style={styles.tagText}>{reel.teamTag}</ThemedText>
            </View>
          )}
        </View>

        {/* Sound row */}
        <View style={styles.soundRow}>
          <IconSymbol name="music.note" size={11} color="rgba(255,255,255,0.7)" />
          <ThemedText style={styles.soundText} numberOfLines={1}>
            Original Sound — {creatorName}
          </ThemedText>
        </View>
      </View>

      {/* Progress bar at very bottom */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: paused ? '45%' : '100%' }]} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pauseIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    zIndex: 5,
  },
  durationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },

  // Right-side action column
  actions: {
    position: 'absolute',
    right: 10,
    bottom: 140,
    alignItems: 'center',
    gap: 18,
    zIndex: 5,
  },
  creatorAvatar: {
    marginBottom: 6,
    position: 'relative',
  },
  creatorAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
  followBadge: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#B85C5C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionBtn: {
    alignItems: 'center',
    gap: 3,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  discContainer: {
    marginTop: 4,
  },
  disc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0B0F14',
    borderWidth: 2,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  discInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom overlay
  bottomOverlay: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingRight: 80,
  },
  creatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  creatorName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  creatorBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creatorBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  caption: {
    fontSize: 14,
    fontWeight: '500',
    color: '#fff',
    lineHeight: 20,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  soundRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  soundText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    flex: 1,
  },

  // Progress bar
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
});
