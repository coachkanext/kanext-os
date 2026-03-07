/**
 * Single video slide — auto-playing, muted, looping.
 * Full-bleed with gradient overlay and text at bottom-left.
 * Three states: LIVE (red dot), RECAP (score), HYPE (branding).
 */

import React, { useEffect, useRef, useState, Component } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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

import type { VideoPage } from './home-types';

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

const C = {
  surface: '#0B0F14',
};

interface VideoSlideProps {
  page: VideoPage;
  isActive: boolean;
  muted?: boolean;
}

export function VideoSlide({ page, isActive, muted = true }: VideoSlideProps) {
  const videoRef = useRef<any>(null);
  const [videoFailed, setVideoFailed] = useState(!Video);

  // Play/pause based on active page — catch promise rejections from broken native module
  useEffect(() => {
    if (!videoRef.current) return;
    try {
      if (isActive) {
        videoRef.current.playAsync?.()?.catch?.(() => setVideoFailed(true));
      } else {
        videoRef.current.pauseAsync?.()?.catch?.(() => {});
      }
    } catch {
      setVideoFailed(true);
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

      {/* Auto-playing video (graceful fallback to poster if native module unavailable) */}
      {!videoFailed && Video && (
        <VideoBoundary onError={() => setVideoFailed(true)}>
          <Video
            ref={videoRef}
            source={{ uri: page.source }}
            style={styles.background}
            resizeMode={ResizeMode.COVER}
            shouldPlay={isActive}
            isLooping
            isMuted={muted}
            posterSource={page.poster}
            usePoster={!!page.poster}
            onError={() => setVideoFailed(true)}
          />
        </VideoBoundary>
      )}

      {/* Gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.92)']}
        locations={[0.2, 0.6, 1]}
        style={styles.gradient}
      />

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
});
