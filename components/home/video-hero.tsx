/**
 * Video Hero — dark branded banner at top of Home screen.
 * Bleeds under status bar, edge-to-edge. ~38% of screen height.
 * Tap          → pause / play
 * Long press   → mute / unmute
 * Rotate landscape → full-screen modal auto-opens
 * Zoom button  → toggle contentFit cover ↔ contain
 */

import React, { useState, useEffect } from 'react';
import {
  View, Text, Pressable, StyleSheet, useWindowDimensions, Modal, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';

const KAYTV_VIDEO = require('@/assets/videos/kaytv-preview.mp4');

let VideoView: any = null;
let useVideoPlayer: any = null;
try {
  const mod = require('expo-video');
  VideoView = mod.VideoView;
  useVideoPlayer = mod.useVideoPlayer;
} catch {}

function VideoHeroPlayer({
  uri, totalHeight,
}: { uri: string | number; totalHeight: number }) {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const [muted,    setMuted]    = useState(true);
  const [paused,   setPaused]   = useState(false);
  const [zoomed,   setZoomed]   = useState(false); // false = cover, true = contain
  const [fullscreen, setFullscreen] = useState(false);

  const player = useVideoPlayer(uri, (p: any) => {
    p.loop  = true;
    p.muted = true;
    p.play();
  });

  // Auto full-screen on landscape rotation
  useEffect(() => {
    if (isLandscape) {
      setFullscreen(true);
    } else {
      setFullscreen(false);
    }
  }, [isLandscape]);

  const togglePlay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (paused) { player.play();  setPaused(false); }
    else        { player.pause(); setPaused(true);  }
  };

  const toggleMute = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    player.muted = !muted;
    setMuted(m => !m);
  };

  const toggleZoom = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setZoomed(z => !z);
  };

  const fit = zoomed ? 'contain' : 'cover';

  // ── Controls overlay (shared between inline and fullscreen) ──
  function Controls({ fs }: { fs: boolean }) {
    return (
      <>
        <View style={styles.gradient} />

        {/* Top-right: zoom toggle */}
        <Pressable style={styles.zoomBtn} onPress={toggleZoom}>
          <IconSymbol
            name={zoomed ? 'arrow.up.left.and.arrow.down.right' : 'arrow.down.right.and.arrow.up.left'}
            size={13}
            color="rgba(255,255,255,0.85)"
          />
        </Pressable>

        {/* Bottom-right: mute / play-pause state */}
        <Pressable style={styles.playHint} onPress={toggleMute}>
          <View style={styles.iconBtn}>
            <IconSymbol
              name={paused ? 'pause.fill' : (muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill')}
              size={13}
              color="rgba(255,255,255,0.85)"
            />
          </View>
        </Pressable>

        {/* Bottom-left: Open KayTV (only in inline, not fullscreen) */}
        {!fs && (
          <Pressable
            style={styles.kaytvLink}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.navigate('/(tabs)/(main)/kaytv' as any);
            }}
          >
            <Text style={styles.kaytvLinkText}>Open KayTV ›</Text>
          </Pressable>
        )}

        {/* Fullscreen: close button top-left */}
        {fs && (
          <Pressable
            style={styles.closeBtn}
            onPress={() => { setFullscreen(false); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol name="xmark" size={14} color="rgba(255,255,255,0.9)" />
          </Pressable>
        )}
      </>
    );
  }

  return (
    <>
      {/* ── Inline hero ── */}
      <Pressable
        style={[styles.container, { height: totalHeight }]}
        onPress={togglePlay}
        onLongPress={toggleMute}
        delayLongPress={400}
      >
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit={fit}
          nativeControls={false}
        />
        <Controls fs={false} />
      </Pressable>

      {/* ── Full-screen modal (landscape rotation) ── */}
      <Modal
        visible={fullscreen}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => setFullscreen(false)}
      >
        <StatusBar hidden />
        <Pressable
          style={styles.fsContainer}
          onPress={togglePlay}
          onLongPress={toggleMute}
          delayLongPress={400}
        >
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit={fit}
            nativeControls={false}
          />
          <Controls fs={true} />
        </Pressable>
      </Modal>
    </>
  );
}

// Dark branded placeholder (fallback)
function VideoHeroPlaceholder({ totalHeight }: { totalHeight: number }) {
  const router = useRouter();
  return (
    <Pressable
      style={[styles.container, { height: totalHeight }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.navigate('/(tabs)/(main)/kaytv' as any);
      }}
    >
      <View style={styles.placeholderBg} />
      <View style={styles.placeholderCenter}>
        <View style={styles.iconBtn}>
          <IconSymbol name="play.fill" size={18} color="rgba(255,255,255,0.85)" />
        </View>
        <Text style={styles.placeholderLabel}>KayTV</Text>
        <Text style={styles.placeholderSub}>Tap to watch</Text>
      </View>
      <View style={styles.liveTag}>
        <View style={styles.liveDot} />
        <Text style={styles.liveText}>LIVE</Text>
      </View>
    </Pressable>
  );
}

export function VideoHero() {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.round(screenHeight * 0.38);
  return <VideoHeroPlayer uri={KAYTV_VIDEO} totalHeight={heroHeight} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#0D1520',
    overflow: 'hidden',
  },
  fsContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },

  // Top-right zoom toggle
  zoomBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom-right mute/pause indicator
  playHint: {
    position: 'absolute',
    bottom: 12,
    right: 12,
  },

  // Close button (fullscreen)
  closeBtn: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Open KayTV link
  kaytvLink: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  kaytvLinkText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.75)',
  },

  // Shared icon button
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Placeholder
  placeholderBg: { ...StyleSheet.absoluteFillObject, backgroundColor: '#0D1828' },
  placeholderCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderLabel: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.90)', letterSpacing: 1 },
  placeholderSub:   { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 },

  liveTag: {
    position: 'absolute', bottom: 14, right: 14,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
  },
  liveDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E05252' },
  liveText: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.75)', letterSpacing: 1 },
});
