/**
 * Reel Viewer — full-screen overlay for a single reel.
 * Back button (top-left). Same layout as Reels feed item but standalone.
 */

import React, { useState, useMemo } from 'react';
import { View, Pressable, StyleSheet, Dimensions, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ShareSheet } from '@/components/media/share-sheet';
import { MOCK_REELS } from '@/data/mock-video';

const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function ReelViewerScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { reelId } = useLocalSearchParams<{ reelId: string }>();

  const reel = useMemo(
    () => MOCK_REELS.find((r) => r.id === reelId) ?? MOCK_REELS[0],
    [reelId],
  );

  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareVisible, setShareVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.fullScreen, { backgroundColor: reel.thumbnailColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setPaused(!paused);
        }}
      >
        {/* Back button */}
        <Pressable
          style={[styles.backBtn, { top: insets.top + 8 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <IconSymbol name="chevron.left" size={20} color="#fff" />
        </Pressable>

        {/* Paused indicator */}
        {paused && (
          <View style={styles.pauseOverlay}>
            <IconSymbol name="play.fill" size={48} color="rgba(255,255,255,0.8)" />
          </View>
        )}

        {/* Right-side actions */}
        <View style={styles.actions}>
          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLiked(!liked);
            }}
          >
            <IconSymbol name="heart.fill" size={28} color={liked ? '#B85C5C' : '#fff'} />
            <ThemedText style={styles.actionCount}>{liked ? reel.likes + 1 : reel.likes}</ThemedText>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSaved(!saved);
            }}
          >
            <IconSymbol name="bookmark.fill" size={28} color={saved ? '#FFFFFF' : '#fff'} />
            <ThemedText style={styles.actionCount}>{saved ? reel.saves + 1 : reel.saves}</ThemedText>
          </Pressable>

          <Pressable
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShareVisible(true);
            }}
          >
            <IconSymbol name="square.and.arrow.up" size={28} color="#fff" />
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

      <ShareSheet
        visible={shareVisible}
        onClose={() => setShareVisible(false)}
        title={reel.caption}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute',
    left: 16,
    zIndex: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
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
    right: 16,
    bottom: 140,
    alignItems: 'center',
    gap: 24,
    zIndex: 5,
  },
  actionBtn: {
    alignItems: 'center',
    gap: 4,
  },
  actionCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  bottomOverlay: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 60,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  caption: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
    marginBottom: 10,
  },
  tagRow: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  tagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#fff',
  },
});
