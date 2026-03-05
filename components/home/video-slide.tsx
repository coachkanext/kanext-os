/**
 * Single video slide — auto-playing, muted, looping.
 * Full-bleed with gradient overlay and text at bottom-left.
 * Three states: LIVE (red dot), RECAP (score), HYPE (branding).
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { VideoPage } from './home-types';

const C = {
  text: '#FFFFFF',
  secondary: 'rgba(255,255,255,0.7)',
  error: '#EF4444',
  surface: '#0B0F14',
};

const STATE_LABELS: Record<string, string> = {
  live: 'LIVE',
  recap: 'RECAP',
  hype: 'HYPE',
};

interface VideoSlideProps {
  page: VideoPage;
  isActive: boolean;
}

export function VideoSlide({ page, isActive }: VideoSlideProps) {
  const videoRef = useRef<Video>(null);
  const insets = useSafeAreaInsets();

  // Play/pause based on active page
  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync();
    } else {
      videoRef.current.pauseAsync();
    }
  }, [isActive]);

  return (
    <View style={styles.container}>
      {/* Poster image fallback */}
      {page.poster && (
        <Image
          source={page.poster}
          style={styles.background}
          resizeMode="cover"
        />
      )}

      {/* Auto-playing video */}
      <Video
        ref={videoRef}
        source={{ uri: page.source }}
        style={styles.background}
        resizeMode={ResizeMode.COVER}
        shouldPlay={isActive}
        isLooping
        isMuted
        posterSource={page.poster}
        usePoster={!!page.poster}
      />

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)']}
        locations={[0.2, 0.6, 1]}
        style={styles.gradient}
      />

      {/* Text overlay at bottom-left */}
      <View style={[styles.content, { paddingTop: insets.top + 8 }]}>
        {/* State label */}
        <View style={styles.header}>
          {page.state === 'live' && <View style={styles.liveDot} />}
          <Text style={[styles.stateLabel, page.state === 'live' && styles.liveLabel]}>
            {STATE_LABELS[page.state]}
          </Text>
        </View>

        <Text style={styles.title}>{page.title}</Text>
        {page.subtitle && <Text style={styles.subtitle}>{page.subtitle}</Text>}
        {page.meta && <Text style={styles.meta}>{page.meta}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.surface,
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  stateLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: C.secondary,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.error,
  },
  liveLabel: {
    color: C.error,
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: C.text,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: C.secondary,
    marginBottom: 2,
  },
  meta: {
    fontSize: 13,
    color: C.secondary,
  },
});
