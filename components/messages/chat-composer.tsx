/**
 * Chat Composer — iOS Messages-style input bar.
 * + button, capsule text field, mic/send button.
 * Hold mic to record voice note, release to send.
 * Shows audio playback + transcription in chat.
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import { View, Text, TextInput, Pressable, Animated, Modal, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const ATTACH_OPTIONS = [
  { key: 'camera',   label: 'Camera',   icon: 'camera.fill',            color: '#1C1C1E' },
  { key: 'photos',   label: 'Photos',   icon: 'photo.fill',             color: '#BF5AF2' },
  { key: 'files',    label: 'Files',    icon: 'doc.fill',               color: '#007AFF' },
  { key: 'location', label: 'Location', icon: 'location.fill',          color: '#34C759' },
  { key: 'contact',  label: 'Contact',  icon: 'person.crop.circle.fill',color: '#636366' },
  { key: 'kaypay',   label: 'KayPay',   icon: 'dollarsign.circle.fill', color: '#30D158' },
  { key: 'polls',    label: 'Polls',    icon: 'chart.bar.fill',         color: '#FF9F0A' },
  { key: 'audio',    label: 'Audio',    icon: 'waveform.circle.fill',   color: '#FF453A' },
] as const;

export interface VoiceNotePayload {
  uri: string;
  duration: number;
  transcript?: string;
}

interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onVoiceNote?: (note: VoiceNotePayload) => void;
  accent?: string;
  /** Current text for @mentions detection */
  onMentionTrigger?: (query: string | null) => void;
}

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  onVoiceNote,
  accent,
  onMentionTrigger,
}: ChatComposerProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const resolvedAccent = accent ?? C.accent;

  const hasText = value.trim().length > 0;
  const [showAttach, setShowAttach] = useState(false);
  const attachAnim = useRef(new Animated.Value(400)).current;

  const openAttach = () => {
    setShowAttach(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(attachAnim, { toValue: 0, tension: 80, friction: 14, useNativeDriver: true }).start();
  };
  const closeAttach = () => {
    Animated.timing(attachAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start(() => setShowAttach(false));
  };

  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recordStartRef = useRef(0);

  const handleSend = () => {
    if (!hasText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  };

  const handleTextChange = useCallback((text: string) => {
    onChangeText(text);

    if (onMentionTrigger) {
      const lastAt = text.lastIndexOf('@');
      if (lastAt !== -1) {
        const afterAt = text.slice(lastAt + 1);
        const charBefore = lastAt > 0 ? text[lastAt - 1] : ' ';
        if (charBefore === ' ' || charBefore === '\n' || lastAt === 0) {
          if (!afterAt.includes(' ')) {
            onMentionTrigger(afterAt);
            return;
          }
        }
      }
      onMentionTrigger(null);
    }
  }, [onChangeText, onMentionTrigger]);

  const startRecording = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsRecording(true);
    setRecordDuration(0);
    recordStartRef.current = Date.now();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start();

    timerRef.current = setInterval(() => {
      setRecordDuration(Math.floor((Date.now() - recordStartRef.current) / 1000));
    }, 1000);
  };

  const stopRecording = () => {
    setIsRecording(false);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const duration = Math.max(1, Math.floor((Date.now() - recordStartRef.current) / 1000));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (duration >= 1 && onVoiceNote) {
      onVoiceNote({
        uri: `voice://recording-${Date.now()}`,
        duration,
        transcript: '(Voice note transcription would appear here)',
      });
    }
  };

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  if (isRecording) {
    return (
      <View style={styles.bar}>
        <View style={styles.recordingBar}>
          <Animated.View style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.recordingText}>Recording... {formatDuration(recordDuration)}</Text>
        </View>
        <Pressable
          onPressOut={stopRecording}
          style={[styles.micBtn, { backgroundColor: resolvedAccent }]}
        >
          <IconSymbol name="stop.fill" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  return (
    <>
    <Modal visible={showAttach} transparent animationType="none" onRequestClose={closeAttach}>
      <Pressable style={styles.attachBackdrop} onPress={closeAttach} />
      <Animated.View style={[styles.attachSheet, { transform: [{ translateY: attachAnim }] }]}>
        <BlurView intensity={80} tint="light" style={styles.attachBlur}>
          {ATTACH_OPTIONS.map((opt, i) => (
            <Pressable
              key={opt.key}
              style={[styles.attachRow, i < ATTACH_OPTIONS.length - 1 && styles.attachRowBorder]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeAttach(); }}
            >
              <View style={[styles.attachIconWrap, { backgroundColor: opt.color }]}>
                <IconSymbol name={opt.icon as any} size={20} color="#fff" />
              </View>
              <Text style={styles.attachLabel}>{opt.label}</Text>
            </Pressable>
          ))}
        </BlurView>
      </Animated.View>
    </Modal>
    <View style={styles.bar}>
      <Pressable style={styles.addBtn} onPress={openAttach}>
        <IconSymbol name="plus.circle.fill" size={30} color={C.secondary} />
      </Pressable>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor={C.muted}
          value={value}
          onChangeText={handleTextChange}
          multiline
        />
        {hasText ? (
          <Pressable onPress={handleSend} style={styles.inputAction}>
            <IconSymbol name="arrow.up.circle.fill" size={28} color={resolvedAccent} />
          </Pressable>
        ) : (
          <Pressable
            onLongPress={startRecording}
            delayLongPress={200}
            style={styles.inputAction}
          >
            <IconSymbol name="mic.fill" size={20} color={C.secondary} />
          </Pressable>
        )}
      </View>
    </View>
    </>
  );
}

/** Inline voice note playback bubble */
export function VoiceNoteBubble({
  duration,
  transcript,
  accent,
}: {
  duration: number;
  transcript?: string;
  accent?: string;
}) {
  const C = useColors();
  const vnStyles = useMemo(() => makeVnStyles(C), [C]);
  const resolvedAccent = accent ?? C.accent;

  const [isPlaying, setIsPlaying] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const togglePlay = () => {
    if (isPlaying) {
      progressAnim.stopAnimation();
      progressAnim.setValue(0);
      setIsPlaying(false);
      return;
    }
    setIsPlaying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: duration * 1000,
      useNativeDriver: false,
    }).start(() => {
      setIsPlaying(false);
      progressAnim.setValue(0);
    });
  };

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={vnStyles.container}>
      <View style={vnStyles.playbackRow}>
        <Pressable onPress={togglePlay} style={[vnStyles.playBtn, { backgroundColor: resolvedAccent }]}>
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={14}
            color="#FFFFFF"
          />
        </Pressable>
        <View style={vnStyles.waveformWrap}>
          <View style={vnStyles.waveformTrack}>
            <Animated.View
              style={[vnStyles.waveformProgress, { width: progressWidth, backgroundColor: resolvedAccent }]}
            />
          </View>
          <Text style={vnStyles.durationText}>{formatDuration(duration)}</Text>
        </View>
      </View>
      {transcript ? (
        <Text style={vnStyles.transcript}>{transcript}</Text>
      ) : null}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingVertical: 6,
  },
  addBtn: {
    paddingBottom: 2,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: C.surface,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: C.inputBorder,
    paddingLeft: 14,
    paddingRight: 6,
    paddingVertical: 6,
    minHeight: 36,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: C.label,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 2,
  },
  inputAction: {
    paddingBottom: 2,
    paddingLeft: 4,
  },
  micBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  recordingBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 36,
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.accent,
  },
  recordingText: {
    fontSize: 15,
    color: C.accent,
    fontWeight: '500',
  },
  // Attach sheet
  attachBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  attachSheet: {
    position: 'absolute',
    bottom: 80,
    left: 12,
    width: 260,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  attachBlur: {
    paddingVertical: 4,
  },
  attachRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 14,
  },
  attachRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  attachIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: C.label,
  },
});

const makeVnStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    gap: 6,
  },
  playbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformWrap: {
    flex: 1,
    gap: 2,
  },
  waveformTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: C.separator,
    overflow: 'hidden',
  },
  waveformProgress: {
    height: '100%',
    borderRadius: 2,
  },
  durationText: {
    fontSize: 11,
    color: C.secondary,
  },
  transcript: {
    fontSize: 13,
    color: C.muted,
    fontStyle: 'italic',
    lineHeight: 17,
  },
});
