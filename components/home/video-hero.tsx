/**
 * Video Hero — single looping muted video at top of Home screen.
 * Bleeds under status bar, edge-to-edge. ~22% of screen height.
 * Tap → opens KayTV. No swiping, no dots, no pages.
 *
 * Mode-aware: each mode has a default video/poster.
 * Falls back to dark placeholder if expo-video isn't available.
 */

import React from 'react';
import { View, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useMode } from '@/context/app-context';
import type { Mode } from '@/types';

let VideoView: any = null;
let useVideoPlayer: any = null;
try {
  const mod = require('expo-video');
  VideoView = mod.VideoView;
  useVideoPlayer = mod.useVideoPlayer;
} catch {}

const MODE_VIDEO: Record<Mode, string> = {
  sports: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  business: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
  church: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
  education: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
};

function VideoHeroInner({ heroHeight }: { heroHeight: number }) {
  const router = useRouter();
  const mode = useMode();
  const videoUri = MODE_VIDEO[mode];

  const player = useVideoPlayer?.(videoUri, (p: any) => {
    p.loop = true;
    p.muted = true;
    p.play();
  });

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/(tabs)/(main)/kaytv' as any);
  };

  return (
    <Pressable style={[styles.container, { height: heroHeight }]} onPress={handlePress}>
      {VideoView && player ? (
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
      ) : (
        <View style={StyleSheet.absoluteFill} />
      )}
    </Pressable>
  );
}

export function VideoHero() {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.round(screenHeight * 0.22);

  return <VideoHeroInner heroHeight={heroHeight} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0B1220',
    overflow: 'hidden',
  },
});
