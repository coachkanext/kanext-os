/**
 * Reel Item — full-screen reel in vertical feed.
 * Tap to pause/play. Side action column. Bottom overlay with caption.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { Reel } from '@/data/mock-video';

interface ReelItemProps {
  reel: Reel;
  height: number;
  onShare?: () => void;
}

export function ReelItem({ reel, height, onShare }: ReelItemProps) {
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  const togglePause = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaused(!paused);
  };

  return (
    <Pressable
      style={[styles.container, { height, backgroundColor: reel.thumbnailColor }]}
      onPress={togglePause}
    >
      {/* Paused indicator */}
      {paused && (
        <View style={styles.pauseOverlay}>
          <IconSymbol name="play.fill" size={48} color="rgba(255,255,255,0.8)" />
        </View>
      )}

      {/* Right-side action column */}
      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setLiked(!liked);
          }}
        >
          <IconSymbol name="heart.fill" size={24} color={liked ? '#EF4444' : '#fff'} />
          <ThemedText style={styles.actionCount}>{liked ? reel.likes + 1 : reel.likes}</ThemedText>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSaved(!saved);
          }}
        >
          <IconSymbol name="bookmark.fill" size={24} color={saved ? '#f5f5f5' : '#fff'} />
          <ThemedText style={styles.actionCount}>{saved ? reel.saves + 1 : reel.saves}</ThemedText>
        </Pressable>

        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare?.();
          }}
        >
          <IconSymbol name="square.and.arrow.up" size={24} color="#fff" />
        </Pressable>
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        <ThemedText style={styles.caption}>{reel.caption}</ThemedText>
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
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 10,
  },
  actions: {
    position: 'absolute',
    right: 12,
    bottom: 120,
    alignItems: 'center',
    gap: 20,
    zIndex: 5,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 2,
  },
  actionCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  bottomOverlay: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  caption: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#fff',
  },
});
