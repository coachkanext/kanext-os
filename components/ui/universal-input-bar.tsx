/**
 * Universal Input Bar — ONE component used everywhere.
 * Dark capsule, white text/icons, consistent height.
 * Layout: [+ button (conditional)] [Text field] [Mic / Send button]
 *
 * Props that vary per screen:
 *   showPlus    — show attachment + button (Messages chat, Nexus full page)
 *   placeholder — gray placeholder text ("Message...", "Ask Nexus...", "Search...")
 *
 * Mic button: hold to record voice, release to send.
 * When text is typed: mic becomes send arrow. Tap to send.
 * When text field empties: send arrow becomes mic again (smooth crossfade).
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import type { TextInput as TextInputType } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';

// ── Colors ──

const C = {
  surface: '#0B0F14',
  white: '#FFFFFF',
  placeholder: '#A1A1AA',
  recording: '#FF3B30',
};

// ── Types ──

export interface VoiceNotePayload {
  uri: string;
  duration: number;
}

interface UniversalInputBarProps {
  /** Show the + attachment button on the left */
  showPlus: boolean;
  /** Placeholder text for the input field */
  placeholder: string;
  /** Controlled text value */
  value: string;
  /** Text change handler */
  onChangeText: (text: string) => void;
  /** Called when send arrow is tapped (text must be non-empty) */
  onSend: () => void;
  /** Called when + button is tapped */
  onAttachPress?: () => void;
  /** Called when a voice note recording finishes */
  onVoiceNote?: (note: VoiceNotePayload) => void;
}

export function UniversalInputBar({
  showPlus,
  placeholder,
  value,
  onChangeText,
  onSend,
  onAttachPress,
  onVoiceNote,
}: UniversalInputBarProps) {
  const inputRef = useRef<TextInputType>(null);
  const hasText = value.trim().length > 0;

  // ── Mic / Send crossfade ──
  const crossfade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(crossfade, {
      toValue: hasText ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [hasText]);

  // ── Voice recording state ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordStartRef = useRef(0);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const startRecording = useCallback(() => {
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
  }, []);

  const stopRecording = useCallback(() => {
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
      onVoiceNote({ uri: `voice://recording-${Date.now()}`, duration });
    }
  }, [onVoiceNote]);

  const formatDuration = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (!hasText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  };

  // ── Recording state UI ──
  if (isRecording) {
    return (
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.capsule}>
          <View style={styles.recordingInner}>
            <Animated.View style={[styles.recordDot, { transform: [{ scale: pulseAnim }] }]} />
            <Text style={styles.recordingText}>Recording... {formatDuration(recordDuration)}</Text>
          </View>
          <Pressable
            onPressOut={stopRecording}
            style={styles.stopBtn}
          >
            <IconSymbol name="stop.fill" size={16} color={C.white} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // ── Default UI ──
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View style={styles.capsule}>
        {/* Plus button */}
        {showPlus && (
          <Pressable
            style={({ pressed }) => [styles.circleBtn, pressed && { opacity: 0.6 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onAttachPress?.();
            }}
            accessibilityLabel="Attach"
            accessibilityRole="button"
          >
            <IconSymbol name="plus" size={18} color={C.white} />
          </Pressable>
        )}

        {/* Text input */}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          value={value}
          onChangeText={onChangeText}
          multiline
          maxLength={4000}
          returnKeyType="default"
          blurOnSubmit={false}
          autoCapitalize="sentences"
          autoCorrect
          selectionColor={C.white}
        />

        {/* Mic / Send — crossfade */}
        <View style={styles.actionWrap}>
          {/* Mic (fades out when text present) */}
          <Animated.View
            style={[styles.actionLayer, { opacity: Animated.subtract(1, crossfade) }]}
            pointerEvents={hasText ? 'none' : 'auto'}
          >
            <Pressable
              style={styles.circleBtn}
              onLongPress={startRecording}
              delayLongPress={200}
              accessibilityLabel="Voice input"
              accessibilityRole="button"
            >
              <IconSymbol name="mic.fill" size={18} color={C.white} />
            </Pressable>
          </Animated.View>

          {/* Send arrow (fades in when text present) */}
          <Animated.View
            style={[styles.actionLayer, { opacity: crossfade }]}
            pointerEvents={hasText ? 'auto' : 'none'}
          >
            <Pressable
              style={[styles.circleBtn, styles.sendBtn]}
              onPress={handleSend}
              accessibilityLabel="Send"
              accessibilityRole="button"
            >
              <IconSymbol name="arrow.up" size={16} weight="semibold" color="#000000" />
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  capsule: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: C.surface,
    borderRadius: 24,
    minHeight: 46,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    backgroundColor: C.white,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    color: C.white,
    maxHeight: 120,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  actionWrap: {
    width: 36,
    height: 36,
  },
  actionLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  // Recording state
  recordingInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
  },
  recordDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: C.recording,
  },
  recordingText: {
    fontSize: 15,
    color: C.recording,
    fontWeight: '500',
  },
  stopBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.recording,
    marginRight: 2,
  },
});
