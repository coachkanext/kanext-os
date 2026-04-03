/**
 * Video Hero — YouTube-style video player at top of Home screen.
 * Bleeds under status bar, edge-to-edge. ~38% of screen height.
 *
 * Tap              → show / hide controls (3-second auto-hide)
 * Double-tap left  → rewind 10s (with ripple)
 * Double-tap right → forward 10s (with ripple)
 * Rotate landscape → automatic fullscreen
 * Swipe down (FS)  → exit fullscreen
 * Fullscreen btn   → enter/exit fullscreen from button
 */

import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import {
  View, Text, Pressable, StyleSheet, useWindowDimensions,
  Modal, StatusBar, Animated, ScrollView, PanResponder,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMode } from '@/context/app-context';
import { forceHideFooter, releaseForceHide, resetFooter } from '@/utils/global-footer-hide';

// ── Video sources ─────────────────────────────────────────────────────────────
const KAYTV_VIDEO = require('@/assets/videos/kaytv-preview.mp4');
const V_LB      = require('@/assets/videos/lb-state.mp4');
const V_WEBER   = require('@/assets/videos/weber-st.mp4');
const V_IRVINE  = require('@/assets/videos/irvine.mp4');
const V_LMU     = require('@/assets/videos/lmu.mp4');
const V_SIMPSON = require('@/assets/videos/simpson.mp4');
const V_MAR_W   = require('@/assets/videos/maritime-w.mp4');
const V_MAR_L   = require('@/assets/videos/maritime-l.mp4');

const MODE_VIDEO_LISTS: Partial<Record<string, (string | number)[]>> = {
  sports:    [V_LB, V_WEBER, V_IRVINE, V_LMU, V_SIMPSON, V_MAR_W, V_MAR_L],
  personal:  [V_LMU, V_SIMPSON, V_LB, V_WEBER, V_IRVINE, V_MAR_W, V_MAR_L],
  community: [V_IRVINE, V_LMU, V_LB, V_WEBER, V_SIMPSON, V_MAR_W, V_MAR_L],
  education: [V_WEBER, V_LB, V_IRVINE, V_LMU, V_SIMPSON, V_MAR_W, V_MAR_L],
  business:  [KAYTV_VIDEO, V_LB, V_WEBER, V_IRVINE, V_LMU, V_SIMPSON, V_MAR_W, V_MAR_L],
};

// ── expo-video (lazy require, graceful fallback) ──────────────────────────────
let VideoView: any    = null;
let useVideoPlayer: any = null;
try {
  const mod = require('expo-video');
  VideoView      = mod.VideoView;
  useVideoPlayer = mod.useVideoPlayer;
} catch {}

// ── Overlay color constants (always dark regardless of theme) ─────────────────
const PAPER        = '#FFF8F0';
const EMBER        = '#E05252';
const CTRL_BG      = 'rgba(26,23,20,0.76)';
const SCRUB_TRACK  = 'rgba(255,255,255,0.28)';
const SCRUB_FILL   = 'rgba(255,255,255,0.90)';

function fmt(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
}

// ── KayTV branded slate shown between playlist videos ─────────────────────────
function KayTVSlate({ opacity }: { opacity: Animated.Value }) {
  return (
    <Animated.View style={[styles.slate, { opacity }]} pointerEvents="none">
      <View style={styles.slateInner}>
        <View style={styles.slateIconWrap}>
          <IconSymbol name="play.tv.fill" size={22} color="#1A1714" />
        </View>
        <Text style={styles.slateTitle}>
          <Text style={styles.slateTitleWhite}>Kay</Text>
          <Text style={styles.slateTitleCoral}>TV</Text>
        </Text>
        <Text style={styles.slateNext}>Up next</Text>
      </View>
    </Animated.View>
  );
}

// ── Double-tap ripple (rewind / forward feedback) ─────────────────────────────
function DoubleTapRipple({ side }: { side: 'left' | 'right' }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale   = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1.5, useNativeDriver: true, tension: 80, friction: 10 }),
    ]).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.ripple,
        side === 'left' ? styles.rippleLeft : styles.rippleRight,
        { opacity, transform: [{ scale }] },
      ]}
    >
      <IconSymbol
        name={side === 'left' ? 'gobackward.10' : 'goforward.10'}
        size={30}
        color="rgba(255,255,255,0.85)"
      />
    </Animated.View>
  );
}

// ── Main player ───────────────────────────────────────────────────────────────
// ── VideoControls — module-level memo component (stable type, no unmount/remount) ──
interface ControlsProps {
  fs: boolean;
  ctrlsOpacity: Animated.Value;
  ctrlsVisible: boolean;
  isLive: boolean;
  muted: boolean;
  paused: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  urisCount: number;
  videoIndex: number;
  scrubWidthRef: React.MutableRefObject<number>;
  onTogglePlay: () => void;
  onToggleMute: () => void;
  onRewind: () => void;
  onForward: () => void;
  onSwitchVideo: (idx: number) => void;
  onToggleFullscreen: () => void;
  onExitFullscreen: () => void;
  onSeekToX: (x: number) => void;
  onShowCtrls: () => void;
  onOpenKayTV: () => void;
}

const VideoControls = memo(function VideoControls(p: ControlsProps) {
  const btnSize  = p.fs ? 26 : 22;
  const playSize = p.fs ? 34 : 28;

  return (
    <Animated.View
      style={[styles.ctrlsOverlay, { opacity: p.ctrlsOpacity }]}
      pointerEvents={p.ctrlsVisible ? 'box-none' : 'none'}
    >
      <View style={styles.ctrlsDim} pointerEvents="none" />

      {/* Top row */}
      <View style={styles.ctrlTopRow}>
        {!p.fs ? (
          <Pressable style={styles.kaytvPill} onPress={p.onOpenKayTV}>
            <Text style={styles.kaytvPillText}>Open KayTV ›</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.ctrlIconBtn} onPress={p.onExitFullscreen}>
            <IconSymbol name="arrow.down.right.and.arrow.up.left" size={btnSize} color={PAPER} />
          </Pressable>
        )}
        {p.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Center playback controls — overlaid on video */}
      <View style={styles.centerControls} pointerEvents="box-none">
        <Pressable style={styles.ctrlSideBtn} onPress={p.onRewind}>
          <IconSymbol name="gobackward.5" size={btnSize} color={PAPER} />
        </Pressable>
        <Pressable style={[styles.ctrlCircleBtn, styles.ctrlCircleBtnLg]} onPress={p.onTogglePlay}>
          <IconSymbol name={p.paused ? 'play.fill' : 'pause.fill'} size={playSize} color={PAPER} />
        </Pressable>
        <Pressable style={[styles.ctrlSideBtn, p.isLive && styles.ctrlBtnDisabled]} onPress={p.isLive ? undefined : p.onForward}>
          <IconSymbol name="goforward.5" size={btnSize} color={p.isLive ? 'rgba(255,255,255,0.30)' : PAPER} />
        </Pressable>
      </View>

      {/* Bottom controls */}
      <View style={styles.ctrlsBottom}>
        {!p.isLive && (
          <View style={styles.scrubberRow}>
            <Text style={styles.timeText}>{fmt(p.currentTime)}</Text>
            <View
              style={styles.scrubberTrack}
              onLayout={(e) => { p.scrubWidthRef.current = e.nativeEvent.layout.width; }}
              onStartShouldSetResponder={() => true}
              onMoveShouldSetResponder={() => true}
              onResponderGrant={(e) => { p.onSeekToX(e.nativeEvent.locationX); p.onShowCtrls(); }}
              onResponderMove={(e) => { p.onSeekToX(e.nativeEvent.locationX); }}
            >
              <View style={[styles.scrubFill, { width: `${p.progress * 100}%` as any }]} />
              <View style={[styles.scrubThumb, { left: `${p.progress * 100}%` as any, marginLeft: -6 }]} />
            </View>
            <Text style={[styles.timeText, styles.timeRight]}>{fmt(p.duration)}</Text>
          </View>
        )}

        <View style={styles.playbackRow}>
          {p.urisCount > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContent}>
              {Array.from({ length: p.urisCount }, (_, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => p.onSwitchVideo(idx)}
                  style={[styles.sourcePill, idx === p.videoIndex ? styles.sourcePillOn : styles.sourcePillOff]}
                >
                  <Text style={[styles.sourcePillText, idx === p.videoIndex ? styles.sourcePillTextOn : styles.sourcePillTextOff]}>
                    {idx + 1}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <View style={{ flex: 1 }} />
          <Pressable style={styles.ctrlBtn} onPress={p.onToggleMute}>
            <IconSymbol name={p.muted ? 'speaker.slash.fill' : 'speaker.wave.2.fill'} size={btnSize - 6} color={PAPER} />
          </Pressable>
          <Pressable style={styles.ctrlBtn} onPress={p.onToggleFullscreen}>
            <IconSymbol
              name={p.fs ? 'arrow.down.right.and.arrow.up.left' : 'arrow.up.left.and.arrow.down.right'}
              size={btnSize - 10}
              color={PAPER}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
});

// ── Main player ───────────────────────────────────────────────────────────────
function VideoHeroPlayer({
  uris, totalHeight,
}: { uris: (string | number)[]; totalHeight: number }) {
  const router            = useRouter();
  const { width: winW, height: winH } = useWindowDimensions();
  const isLandscape       = winW > winH;
  const isPlaylist        = uris.length > 1;
  const isLive            = false; // TODO: wire to live game detection

  // Playback
  const [muted,      setMuted]      = useState(true);
  const [paused,     setPaused]     = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);

  // Progress
  const [currentTime, setCurrentTime] = useState(0);
  const [duration,    setDuration]    = useState(0);

  // Controls visibility
  const [ctrlsVisible, setCtrlsVisible] = useState(false);
  const ctrlsOpacity  = useRef(new Animated.Value(0)).current;
  const ctrlsTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ctrlsVisRef   = useRef(false);
  ctrlsVisRef.current = ctrlsVisible;

  // Gestures
  const [ripple, setRipple] = useState<'left' | 'right' | null>(null);
  const lastTapRef = useRef({ time: 0, timer: null as any });
  const scrubWidthRef = useRef(0);

  const slateOpacity = useRef(new Animated.Value(0)).current;

  const player = useVideoPlayer(uris[0], (p: any) => {
    p.loop  = !isPlaylist;
    p.muted = true;
    p.play();
  });

  // ── Poll current time / duration ──────────────────────────────────────────
  useEffect(() => {
    if (!player) return;
    const id = setInterval(() => {
      const ct  = player.currentTime ?? 0;
      const dur = player.duration   ?? 0;
      setCurrentTime(ct);
      if (dur > 0) setDuration(dur);
    }, 500);
    return () => clearInterval(id);
  }, [player]);

  // ── Playlist: advance with KayTV slate ────────────────────────────────────
  useEffect(() => {
    if (!isPlaylist || !player?.addListener) return;
    const sub = player.addListener('playToEnd', () => {
      Animated.timing(slateOpacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
      setTimeout(() => {
        setVideoIndex(prev => {
          const next = (prev + 1) % uris.length;
          player.replace(uris[next]);
          setTimeout(() => player.play(), 400);
          return next;
        });
        Animated.timing(slateOpacity, { toValue: 0, duration: 500, useNativeDriver: true }).start();
      }, 1200);
    });
    return () => sub.remove();
  }, [player, uris, isPlaylist]);

  // ── Auto fullscreen on landscape rotation + footer management ────────────
  useEffect(() => {
    setFullscreen(isLandscape);
    if (isLandscape) {
      forceHideFooter();
    } else {
      releaseForceHide();
      resetFooter();
    }
  }, [isLandscape]);

  // ── Controls show / hide ──────────────────────────────────────────────────
  const showCtrlsFor3s = useCallback(() => {
    setCtrlsVisible(true);
    Animated.timing(ctrlsOpacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
    if (ctrlsTimer.current) clearTimeout(ctrlsTimer.current);
    ctrlsTimer.current = setTimeout(() => {
      Animated.timing(ctrlsOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
        .start(() => setCtrlsVisible(false));
    }, 3000);
  }, [ctrlsOpacity]);

  const hideCtrlsNow = useCallback(() => {
    if (ctrlsTimer.current) clearTimeout(ctrlsTimer.current);
    Animated.timing(ctrlsOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
      .start(() => setCtrlsVisible(false));
  }, [ctrlsOpacity]);

  // ── Playback actions ──────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (paused) { player.play(); setPaused(false); }
    else        { player.pause(); setPaused(true); }
    showCtrlsFor3s();
  }, [paused, player, showCtrlsFor3s]);

  const toggleMute = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    player.muted = !muted;
    setMuted(m => !m);
    showCtrlsFor3s();
  }, [muted, player, showCtrlsFor3s]);

  const rewind10 = useCallback(() => {
    if (!player) return;
    player.currentTime = Math.max(0, (player.currentTime ?? 0) - 5);
    showCtrlsFor3s();
  }, [player, showCtrlsFor3s]);

  const forward10 = useCallback(() => {
    if (!player || isLive) return;
    player.currentTime = Math.min(duration || 0, (player.currentTime ?? 0) + 5);
    showCtrlsFor3s();
  }, [player, isLive, duration, showCtrlsFor3s]);

  const switchVideo = useCallback((idx: number) => {
    setVideoIndex(idx);
    player.replace(uris[idx]);
    setTimeout(() => player.play(), 300);
    setPaused(false);
    setCurrentTime(0);
    showCtrlsFor3s();
  }, [player, uris, showCtrlsFor3s]);

  // ── Tap / double-tap detection ────────────────────────────────────────────
  const handleVideoPress = useCallback((e: any) => {
    const now = Date.now();
    const x   = e.nativeEvent.locationX;
    if (now - lastTapRef.current.time < 310 && lastTapRef.current.time > 0) {
      clearTimeout(lastTapRef.current.timer);
      lastTapRef.current = { time: 0, timer: null };
      const side: 'left' | 'right' = x < winW / 2 ? 'left' : 'right';
      if (side === 'left') rewind10(); else forward10();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setRipple(side);
      setTimeout(() => setRipple(null), 700);
    } else {
      lastTapRef.current.time = now;
      lastTapRef.current.timer = setTimeout(() => {
        if (Date.now() - lastTapRef.current.time >= 300) {
          ctrlsVisRef.current ? hideCtrlsNow() : showCtrlsFor3s();
        }
        lastTapRef.current = { time: 0, timer: null };
      }, 310);
    }
  }, [winW, rewind10, forward10, hideCtrlsNow, showCtrlsFor3s]);

  // ── Scrubber seek ─────────────────────────────────────────────────────────
  const seekToX = useCallback((x: number) => {
    if (!duration || isLive || !player) return;
    const ratio   = Math.max(0, Math.min(1, x / (scrubWidthRef.current || 1)));
    const newTime = ratio * duration;
    player.currentTime = newTime;
    setCurrentTime(newTime);
  }, [duration, isLive, player]);

  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const openKayTV = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate('/(tabs)/(main)/kaytv' as any);
  }, [router]);

  const exitFullscreen = useCallback(() => {
    setFullscreen(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const toggleFullscreen = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFullscreen(f => !f);
  }, []);

  // ── Swipe-down gesture (fullscreen exit) ──────────────────────────────────
  const swipeDown = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, s) => s.dy > 20 && Math.abs(s.dy) > Math.abs(s.dx) * 1.5,
      onPanResponderRelease: (_, s) => {
        if (s.dy > 70) {
          setFullscreen(false);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
    })
  ).current;



  return (
    <>
      {/* Inline (portrait) */}
      <View style={[styles.container, { height: totalHeight }]}>
        {!fullscreen && (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        )}
        <Pressable style={StyleSheet.absoluteFill} onPress={handleVideoPress} />
        <VideoControls
          fs={false} ctrlsOpacity={ctrlsOpacity} ctrlsVisible={ctrlsVisible}
          isLive={isLive} muted={muted} paused={paused} progress={progress}
          currentTime={currentTime} duration={duration}
          urisCount={uris.length} videoIndex={videoIndex}
          scrubWidthRef={scrubWidthRef}
          onTogglePlay={togglePlay} onToggleMute={toggleMute}
          onRewind={rewind10} onForward={forward10}
          onSwitchVideo={switchVideo} onToggleFullscreen={toggleFullscreen}
          onExitFullscreen={exitFullscreen} onSeekToX={seekToX}
          onShowCtrls={showCtrlsFor3s} onOpenKayTV={openKayTV}
        />
        {ripple && <DoubleTapRipple side={ripple} />}
        <KayTVSlate opacity={slateOpacity} />
      </View>

      {/* Fullscreen modal — no animation to avoid rotation flash */}
      <Modal
        visible={fullscreen}
        animationType="none"
        statusBarTranslucent
        onRequestClose={() => { releaseForceHide(); resetFooter(); setFullscreen(false); }}
      >
        <StatusBar hidden />
        <View style={styles.fsContainer} {...swipeDown.panHandlers}>
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
          <Pressable style={StyleSheet.absoluteFill} onPress={handleVideoPress} />
          <VideoControls
            fs={true} ctrlsOpacity={ctrlsOpacity} ctrlsVisible={ctrlsVisible}
            isLive={isLive} muted={muted} paused={paused} progress={progress}
            currentTime={currentTime} duration={duration}
            urisCount={uris.length} videoIndex={videoIndex}
            scrubWidthRef={scrubWidthRef}
            onTogglePlay={togglePlay} onToggleMute={toggleMute}
            onRewind={rewind10} onForward={forward10}
            onSwitchVideo={switchVideo} onToggleFullscreen={toggleFullscreen}
            onExitFullscreen={exitFullscreen} onSeekToX={seekToX}
            onShowCtrls={showCtrlsFor3s} onOpenKayTV={openKayTV}
          />
          {ripple && <DoubleTapRipple side={ripple} />}
          <KayTVSlate opacity={slateOpacity} />
        </View>
      </Modal>
    </>
  );
}

// ── Fallback placeholder ──────────────────────────────────────────────────────
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
        <View style={styles.ctrlIconBtn}>
          <IconSymbol name="play.fill" size={18} color="rgba(255,255,255,0.85)" />
        </View>
        <Text style={styles.placeholderLabel}>KayTV</Text>
        <Text style={styles.placeholderSub}>Tap to watch</Text>
      </View>
    </Pressable>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function VideoHero() {
  const { height: screenHeight } = useWindowDimensions();
  const heroHeight = Math.round(screenHeight * 0.38);
  const mode = useMode();
  const uris = MODE_VIDEO_LISTS[mode] ?? [KAYTV_VIDEO];
  if (!useVideoPlayer || !VideoView) return <VideoHeroPlaceholder totalHeight={heroHeight} />;
  return <VideoHeroPlayer uris={uris} totalHeight={heroHeight} />;
}

// ── Styles ────────────────────────────────────────────────────────────────────
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

  // ── Controls overlay ──────────────────────────────────────────────────────
  ctrlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  ctrlsDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.20)',
  },
  ctrlTopRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctrlsBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 4,
  },

  // Playback row (rewind · play · forward · mute · fullscreen)
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 6,
    gap: 2,
  },
  ctrlBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlBtnDisabled: {
    opacity: 0.35,
  },

  // Center playback controls (Safari-style, overlaid on video)
  centerControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  ctrlCircleBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: CTRL_BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlSideBtn: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctrlCircleBtnLg: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },

  // Scrubber
  scrubberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 2,
    gap: 8,
  },
  scrubberTrack: {
    flex: 1,
    height: 4,
    backgroundColor: SCRUB_TRACK,
    borderRadius: 2,
  },
  scrubFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: 4,
    backgroundColor: SCRUB_FILL,
    borderRadius: 2,
  },
  scrubThumb: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: PAPER,
    top: -4,
    borderWidth: 1,
    borderColor: 'rgba(224,219,212,0.6)',
  },
  // Mist-colored track drawn via scrubberTrack background
  timeText: {
    fontSize: 11,
    color: PAPER,
    fontVariant: ['tabular-nums' as any],
    minWidth: 34,
    textAlign: 'left',
  },
  timeRight: {
    textAlign: 'right',
  },

  // ── Source pills ──────────────────────────────────────────────────────────
  pillsRow: {
    // inline: just sits in flow
  },
  pillsRowFs: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pillsContent: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 6,
  },
  sourcePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    minWidth: 30,
    alignItems: 'center',
  },
  sourcePillOn: {
    backgroundColor: PAPER,
    borderColor: PAPER,
  },
  sourcePillOff: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255,255,255,0.35)',
  },
  sourcePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sourcePillTextOn:  { color: '#1A1714' },
  sourcePillTextOff: { color: 'rgba(255,255,255,0.55)' },

  // ── LIVE badge ────────────────────────────────────────────────────────────
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(26,23,20,0.72)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: EMBER,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '700',
    color: PAPER,
    letterSpacing: 0.5,
  },

  // ── Open KayTV pill ───────────────────────────────────────────────────────
  kaytvPill: {
    backgroundColor: 'rgba(26,23,20,0.58)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  kaytvPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: PAPER,
  },

  // Generic icon button (fullscreen close, placeholder play)
  ctrlIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Double-tap ripple ─────────────────────────────────────────────────────
  ripple: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    top: '35%' as any,
  },
  rippleLeft:  { left: '10%' as any },
  rippleRight: { right: '10%' as any },

  // ── KayTV branded slate ───────────────────────────────────────────────────
  slate: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0D1520',
    alignItems: 'center',
    justifyContent: 'center',
  },
  slateInner:    { alignItems: 'center', gap: 8 },
  slateIconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(217,119,87,0.15)',
    borderWidth: 1, borderColor: 'rgba(217,119,87,0.30)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  slateTitle:      { fontSize: 26, fontWeight: '800', letterSpacing: 1 },
  slateTitleWhite: { color: 'rgba(255,255,255,0.95)' },
  slateTitleCoral: { color: '#1A1714' },
  slateNext:       { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.40)', letterSpacing: 1.5, textTransform: 'uppercase' },

  // ── Placeholder ───────────────────────────────────────────────────────────
  placeholderBg:     { ...StyleSheet.absoluteFillObject, backgroundColor: '#0D1828' },
  placeholderCenter: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderLabel:  { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.90)', letterSpacing: 1 },
  placeholderSub:    { fontSize: 12, fontWeight: '500', color: 'rgba(255,255,255,0.45)', letterSpacing: 0.5 },
});
