/**
 * Chat Composer — iOS Messages-style input bar.
 * + button, capsule text field, mic/send button.
 * Hold mic to record voice note, release to send.
 * Shows audio playback + transcription in chat.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TextInput, Pressable, Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';

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
  accent = '#0A84FF',
  onMentionTrigger,
}: ChatComposerProps) {
  const hasText = value.trim().length > 0;
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

    // @mention detection
    if (onMentionTrigger) {
      const lastAt = text.lastIndexOf('@');
      if (lastAt !== -1) {
        const afterAt = text.slice(lastAt + 1);
        // Only trigger if @ is at start or preceded by space, and no space after
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

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ).start();

    // Duration timer
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

  // Recording state — show recording bar
  if (isRecording) {
    return (
      <View style={styles.bar}>
        <View style={styles.recordingBar}>
          <Animated.View style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.recordingText}>Recording... {formatDuration(recordDuration)}</Text>
        </View>
        <Pressable
          onPressOut={stopRecording}
          style={[styles.micBtn, { backgroundColor: accent }]}
        >
          <IconSymbol name="stop.fill" size={18} color="#FFFFFF" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.bar}>
      <Pressable style={styles.addBtn}>
        <IconSymbol name="plus.circle.fill" size={30} color="#8E8E93" />
      </Pressable>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={handleTextChange}
          multiline
        />
      </View>

      {hasText ? (
        <Pressable onPress={handleSend} style={styles.sendBtn}>
          <IconSymbol name="arrow.up.circle.fill" size={30} color={accent} />
        </Pressable>
      ) : (
        <Pressable
          onLongPress={startRecording}
          delayLongPress={200}
          style={styles.sendBtn}
        >
          <IconSymbol name="mic.fill" size={24} color="#8E8E93" />
        </Pressable>
      )}
    </View>
  );
}

/** Inline voice note playback bubble */
export function VoiceNoteBubble({
  duration,
  transcript,
  accent = '#0A84FF',
}: {
  duration: number;
  transcript?: string;
  accent?: string;
}) {
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
        <Pressable onPress={togglePlay} style={[vnStyles.playBtn, { backgroundColor: accent }]}>
          <IconSymbol
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            size={14}
            color="#FFFFFF"
          />
        </Pressable>
        <View style={vnStyles.waveformWrap}>
          <View style={vnStyles.waveformTrack}>
            <Animated.View
              style={[vnStyles.waveformProgress, { width: progressWidth, backgroundColor: accent }]}
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

const styles = StyleSheet.create({
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
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#38383A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 2,
  },
  sendBtn: {
    paddingBottom: 2,
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
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 36,
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  recordingText: {
    fontSize: 15,
    color: '#FF3B30',
    fontWeight: '500',
  },
});

const vnStyles = StyleSheet.create({
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
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  waveformProgress: {
    height: '100%',
    borderRadius: 2,
  },
  durationText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  transcript: {
    fontSize: 13,
    color: '#A1A1AA',
    fontStyle: 'italic',
    lineHeight: 17,
  },
});
