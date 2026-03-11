/**
 * Call Overlay — Full-screen audio/video call UI + minimized pill.
 * Renders globally via root layout. Subscribes to global-call state.
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  subscribeCall,
  endCall,
  toggleCallMinimize,
  toggleCallType,
  type ActiveCall,
} from '@/utils/global-call';
import { MODE_BADGE_COLORS, MODE_BADGE_LABELS } from '@/data/mock-phone';

// ── Duration timer hook ──

function useCallTimer(startedAt: number, state: string) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (state !== 'connected') { setElapsed(0); return; }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt, state]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ── Minimized call pill ──

function CallPill({ call }: { call: ActiveCall }) {
  const C = useColors();
  const pillStyles = useMemo(() => makePillStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const timer = useCallTimer(call.startedAt, call.state);
  const badgeColor = MODE_BADGE_COLORS[call.mode];

  return (
    <Pressable
      style={[pillStyles.pill, { top: insets.top + 4 }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        toggleCallMinimize();
      }}
    >
      <View style={[pillStyles.dot, { backgroundColor: C.green }]} />
      <Text style={pillStyles.name} numberOfLines={1}>{call.contactName}</Text>
      <Text style={pillStyles.timer}>{timer}</Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          endCall();
        }}
        hitSlop={8}
      >
        <View style={pillStyles.endBtn}>
          <IconSymbol name="phone.down.fill" size={12} color="#FFFFFF" />
        </View>
      </Pressable>
    </Pressable>
  );
}

// ── Full-screen call UI ──

function FullCallScreen({ call }: { call: ActiveCall }) {
  const C = useColors();
  const fullStyles = useMemo(() => makeFullStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const timer = useCallTimer(call.startedAt, call.state);
  const badgeColor = MODE_BADGE_COLORS[call.mode];
  const badgeLabel = MODE_BADGE_LABELS[call.mode];

  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);

  const isVideo = call.type === 'video';
  const isRinging = call.state === 'ringing';

  return (
    <View style={[fullStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Video background placeholder */}
      {isVideo && call.state === 'connected' && (
        <View style={fullStyles.videoBg}>
          <Text style={fullStyles.videoPlaceholder}>Video Feed</Text>
        </View>
      )}

      {/* Self-view PiP (video only) */}
      {isVideo && call.state === 'connected' && (
        <View style={[fullStyles.pip, { top: insets.top + 60 }]}>
          <Text style={fullStyles.pipText}>You</Text>
        </View>
      )}

      {/* Center content */}
      <View style={fullStyles.centerContent}>
        {/* Avatar */}
        <View style={fullStyles.avatar}>
          <Text style={fullStyles.avatarInitials}>{call.contactInitials}</Text>
        </View>

        {/* Name + username */}
        <Text style={fullStyles.name}>{call.contactName}</Text>

        {/* Mode badge */}
        <View style={[fullStyles.badge, { backgroundColor: badgeColor + '33' }]}>
          <Text style={[fullStyles.badgeText, { color: badgeColor }]}>
            {badgeLabel} Call
          </Text>
        </View>

        {/* Status */}
        <Text style={fullStyles.status}>
          {isRinging ? 'Calling...' : timer}
        </Text>
      </View>

      {/* Bottom controls */}
      <View style={fullStyles.controls}>
        <View style={fullStyles.controlRow}>
          {/* Mute */}
          <Pressable
            style={[fullStyles.controlBtn, muted && fullStyles.controlBtnActive]}
            onPress={() => { setMuted((v) => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol
              name={muted ? 'mic.slash.fill' : 'mic.fill'}
              size={22}
              color={muted ? C.bg : C.label}
            />
            <Text style={[fullStyles.controlLabel, muted && { color: C.bg }]}>Mute</Text>
          </Pressable>

          {/* Speaker */}
          <Pressable
            style={[fullStyles.controlBtn, speaker && fullStyles.controlBtnActive]}
            onPress={() => { setSpeaker((v) => !v); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol
              name={speaker ? 'speaker.wave.3.fill' : 'speaker.fill'}
              size={22}
              color={speaker ? C.bg : C.label}
            />
            <Text style={[fullStyles.controlLabel, speaker && { color: C.bg }]}>Speaker</Text>
          </Pressable>

          {/* Video toggle */}
          <Pressable
            style={[fullStyles.controlBtn, isVideo && fullStyles.controlBtnActive]}
            onPress={() => { toggleCallType(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          >
            <IconSymbol
              name={isVideo ? 'video.fill' : 'video.slash.fill'}
              size={22}
              color={isVideo ? C.bg : C.label}
            />
            <Text style={[fullStyles.controlLabel, isVideo && { color: C.bg }]}>Video</Text>
          </Pressable>
        </View>

        <View style={fullStyles.controlRow}>
          {/* Flip camera (video only) */}
          {isVideo && (
            <Pressable style={fullStyles.controlBtn}>
              <IconSymbol name="camera.rotate.fill" size={22} color={C.label} />
              <Text style={fullStyles.controlLabel}>Flip</Text>
            </Pressable>
          )}

          {/* Keypad */}
          <Pressable style={fullStyles.controlBtn}>
            <IconSymbol name="circle.grid.3x3.fill" size={22} color={C.label} />
            <Text style={fullStyles.controlLabel}>Keypad</Text>
          </Pressable>

          {/* Add person */}
          <Pressable style={fullStyles.controlBtn}>
            <IconSymbol name="person.badge.plus" size={22} color={C.label} />
            <Text style={fullStyles.controlLabel}>Add</Text>
          </Pressable>
        </View>

        {/* End call + minimize */}
        <View style={fullStyles.bottomRow}>
          <Pressable
            style={fullStyles.minimizeBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCallMinimize();
            }}
          >
            <IconSymbol name="arrow.down.right.and.arrow.up.left" size={18} color={C.label} />
          </Pressable>

          <Pressable
            style={fullStyles.endBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              endCall();
            }}
          >
            <IconSymbol name="phone.down.fill" size={24} color="#FFFFFF" />
          </Pressable>

          <View style={{ width: 48 }} />
        </View>
      </View>
    </View>
  );
}

// ── Root component (subscribes to call state) ──

export function CallOverlay() {
  const [call, setCall] = useState<ActiveCall | null>(null);

  useEffect(() => subscribeCall(setCall), []);

  if (!call) return null;

  if (call.minimized) {
    return <CallPill call={call} />;
  }

  return <FullCallScreen call={call} />;
}

// ── Styles ──

const makePillStyles = (C: ComponentColors) => StyleSheet.create({
  pill: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 8,
    zIndex: 20000,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },
  timer: {
    fontSize: 13,
    fontWeight: '500',
    color: C.green,
    fontVariant: ['tabular-nums'],
  },
  endBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const makeFullStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.bg,
    zIndex: 20000,
    justifyContent: 'space-between',
  },
  videoBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    fontSize: 16,
    color: C.muted,
  },
  pip: {
    position: 'absolute',
    right: 16,
    width: 100,
    height: 140,
    borderRadius: 12,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  pipText: {
    fontSize: 12,
    color: C.muted,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: '700',
    color: C.secondary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: C.label,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  status: {
    fontSize: 16,
    color: C.secondary,
    fontVariant: ['tabular-nums'],
  },
  controls: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    gap: 20,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  controlBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  controlBtnActive: {
    backgroundColor: C.label,
  },
  controlLabel: {
    fontSize: 10,
    color: C.secondary,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  minimizeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  endBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: C.red,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
