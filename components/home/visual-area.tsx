/**
 * Video Hero — single auto-playing video, edge-to-edge.
 * No carousel, no dots, no horizontal swiping.
 * Tap → toggle mute. Tap (future) → expand to KayTV.
 * Content is mode-aware and context-aware.
 */

import React, { useState, useCallback } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { getHeroVideo } from '@/utils/home-widgets';
import { useMode } from '@/context/app-context';
import { VideoSlide } from './video-slide';

export function VisualArea() {
  const [muted, setMuted] = useState(true);
  const mode = useMode();
  const video = getHeroVideo(mode);

  const toggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMuted((m) => !m);
  }, []);

  return (
    <Pressable style={styles.container} onPress={toggleMute}>
      <VideoSlide video={video} muted={muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
