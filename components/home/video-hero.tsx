/**
 * Video Hero — looping muted video at top of Home screen.
 * Bleeds under status bar, edge-to-edge. ~22% of screen height.
 * Tap → opens KayTV.
 *
 * Uses dynamic require so it gracefully falls back to a dark placeholder
 * when expo-video's native module isn't available (e.g. Expo Go).
 */

import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';

// Swap for real content when ready
const MOCK_VIDEO_URI =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';

// Dynamic require — falls back if native module isn't linked
let VideoView: any = null;
let useVideoPlayer: any = null;
try {
  const mod = require('expo-video');
  VideoView = mod.VideoView;
  useVideoPlayer = mod.useVideoPlayer;
} catch {}

// Inner component when expo-video is available
function VideoHeroPlayer({ totalHeight, topInset }: { totalHeight: number; topInset: number }) {
  const router = useRouter();
  const player = useVideoPlayer(MOCK_VIDEO_URI, (p: any) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  return (
    <Pressable
      style={[styles.container, { height: totalHeight, marginTop: -topInset }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.navigate('/(tabs)/(main)/kaytv' as any);
      }}
    >
      <VideoView
        player={player}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        nativeControls={false}
      />
      <View style={styles.playHint}>
        <View style={styles.playButton}>
          <IconSymbol name="play.fill" size={16} color="rgba(255,255,255,0.7)" />
        </View>
      </View>
    </Pressable>
  );
}

// Fallback placeholder when expo-video isn't available
function VideoHeroPlaceholder({ totalHeight, topInset }: { totalHeight: number; topInset: number }) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.container, { height: totalHeight, marginTop: -topInset }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.navigate('/(tabs)/(main)/kaytv' as any);
      }}
    >
      <View style={styles.placeholder}>
        <View style={styles.playButton}>
          <IconSymbol name="play.fill" size={16} color="rgba(255,255,255,0.65)" />
        </View>
      </View>
    </Pressable>
  );
}

export function VideoHero() {
  const { height: screenHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroHeight = Math.round(screenHeight * 0.40);
  const totalHeight = heroHeight + insets.top;

  if (VideoView && useVideoPlayer) {
    return <VideoHeroPlayer totalHeight={totalHeight} topInset={insets.top} />;
  }
  return <VideoHeroPlaceholder totalHeight={totalHeight} topInset={insets.top} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0D1520',
    overflow: 'hidden',
  },
  placeholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playHint: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    padding: 12,
  },
  playButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
