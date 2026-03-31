/**
 * Video Hero Card — Universal autoplay hero at the top of every mode's Dashboard.
 * 16:9 aspect ratio, autoplay + loop + muted, inline playback.
 * Falls back to a static poster image when no video source is provided.
 */

import React, { useRef, useCallback, useState, Component } from 'react';
import { View, Pressable, StyleSheet, Image, type ImageSourcePropType } from 'react-native';
import { useFocusEffect } from '@react-navigation/core';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BorderRadius, Spacing } from '@/constants/theme';

// Graceful fallback if expo-av native module isn't linked
let Video: any = null;
let ResizeMode: any = {};
try {
  const av = require('expo-av');
  Video = av.Video;
  ResizeMode = av.ResizeMode;
} catch {}

/** Catches native view registration errors (EXVideo not found) */
class VideoBoundary extends Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface VideoHeroCardProps {
  title: string;
  subtitle: string;
  /** Remote or local video URI. If omitted, shows poster only. */
  videoUri?: string;
  /** Static poster image shown while loading or when videoUri is absent. */
  posterSource?: ImageSourcePropType;
  /** Optional live badge text (e.g., "LIVE") */
  liveBadge?: string;
  onPress?: () => void;
}

export function VideoHeroCard({ title, subtitle, videoUri, posterSource, liveBadge, onPress }: VideoHeroCardProps) {
  const videoRef = useRef<any>(null);

  // Pause when screen loses focus, resume when it gains focus
  useFocusEffect(
    useCallback(() => {
      if (videoUri && videoRef.current) {
        videoRef.current.playAsync();
      }
      return () => {
        videoRef.current?.pauseAsync();
      };
    }, [videoUri])
  );

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && { opacity: 0.9 },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
    >
      {/* 16:9 video / poster area */}
      <View style={styles.mediaArea}>
        {videoUri && Video ? (
          <VideoBoundary
            fallback={
              posterSource ? (
                <Image source={posterSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
              ) : (
                <View style={[StyleSheet.absoluteFill, styles.posterFallback]}>
                  <View style={styles.playButton}>
                    <IconSymbol name="play.fill" size={28} color="#fff" />
                  </View>
                </View>
              )
            }
          >
            <Video
              ref={videoRef}
              source={{ uri: videoUri }}
              style={StyleSheet.absoluteFill}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
              isMuted
            />
          </VideoBoundary>
        ) : posterSource ? (
          <Image source={posterSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.posterFallback]}>
            <View style={styles.playButton}>
              <IconSymbol name="play.fill" size={28} color="#fff" />
            </View>
          </View>
        )}
      </View>

      {/* Info strip below the video */}
      <View style={styles.infoArea}>
        {liveBadge && (
          <View style={styles.liveBadgeRow}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveBadgeText}>{liveBadge}</ThemedText>
          </View>
        )}
        <ThemedText style={styles.title} numberOfLines={1}>{title}</ThemedText>
        <ThemedText style={styles.subtitle} numberOfLines={1}>{subtitle}</ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginHorizontal: -Spacing.xs,
  },
  mediaArea: {
    aspectRatio: 16 / 9,
    backgroundColor: '#111',
    overflow: 'hidden',
  },
  posterFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoArea: {
    padding: 12,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#B85C5C',
  },
  liveBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#B85C5C',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});
