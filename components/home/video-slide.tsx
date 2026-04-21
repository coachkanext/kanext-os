/**
 * Single video slide — auto-playing, muted, looping.
 * Full-bleed with gradient overlay and optional headline/subline.
 * Uses expo-av with graceful fallback if native module unavailable.
 */

import React, { useEffect, useRef, useState, useMemo, Component } from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// Graceful fallback if expo-av native module isn't linked
let Video: any = null;
let ResizeMode: any = {};
try {
  const av = require('expo-av');
  Video = av.Video;
  ResizeMode = av.ResizeMode;
} catch {
  // Native module unavailable — poster image only
}

import type { HeroVideo } from './home-types';

/** Catches native view registration errors (EXVideo not found) */
class VideoBoundary extends Component<
  { children: React.ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

interface VideoSlideProps {
  video: HeroVideo;
  muted?: boolean;
}

export function VideoSlide({ video, muted = true }: VideoSlideProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [videoFailed, setVideoFailed] = useState(!Video);

  return (
    <View style={styles.container}>
      {/* Auto-playing video */}
      {!videoFailed && Video && (
        <Video
          source={typeof video.source === 'number' ? video.source : { uri: video.source }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay={true}
          isLooping={true}
          isMuted={muted}
          onError={(e: any) => { console.warn('Video error:', e); setVideoFailed(true); }}
          onPlaybackStatusUpdate={(s: any) => {
            if (s.isLoaded && !s.isPlaying && s.shouldPlay) {
              console.log('Video loaded but not playing, status:', JSON.stringify(s));
            }
          }}
        />
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)']}
        locations={[0.3, 0.65, 1]}
        style={styles.gradient}
      />

      {/* Text overlay */}
      {(video.headline || video.subline || video.badge) && (
        <View style={styles.overlay}>
          {video.badge && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{video.badge}</Text>
            </View>
          )}
          {video.headline && (
            <Text style={styles.headline}>{video.headline}</Text>
          )}
          {video.subline && (
            <Text style={styles.subline}>{video.subline}</Text>
          )}
        </View>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    backgroundColor: '#B85C5C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headline: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  subline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '500',
  },
});
