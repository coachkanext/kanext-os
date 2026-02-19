/**
 * Search Overlay — full-screen ephemeral query interface.
 * Triggered from Nexus tab long-press.
 * Auto-focused search bar + mic icon, compact card answer.
 * NOT saved as conversation.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { sendToGPT } from '@/utils/openai';
import { useMode, useAppContext } from '@/context/app-context';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SearchOverlay({ visible, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const { state: appState } = useAppContext();

  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-60)).current;

  // Speech recognition for mic
  const { voiceState, startListening, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string) => {
      setQuery(text);
    }, []),
  });

  useEffect(() => {
    if (visible) {
      setQuery('');
      setAnswer('');
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: -60, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    Keyboard.dismiss();
    setIsLoading(true);
    setAnswer('');

    try {
      const response = await sendToGPT({
        messages: [{ role: 'user', content: trimmed }],
        context: {
          mode,
          organization: appState.organization,
          operatingRole: appState.operatingRole,
          program: appState.program,
          cycleName: appState.cycle?.name ?? null,
        },
      });
      setAnswer(response);
    } catch {
      setAnswer('Something went wrong. Please try again.');
    }

    setIsLoading(false);
  };

  const handleMicPress = () => {
    if (voiceState !== 'idle') {
      stopListening();
    } else {
      Keyboard.dismiss();
      startListening();
    }
  };

  const handleClose = () => {
    Keyboard.dismiss();
    if (voiceState !== 'idle') stopListening();
    onClose();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Search bar */}
      <Animated.View
        style={[
          styles.searchCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
            marginTop: insets.top + 8,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={[styles.searchRow, { backgroundColor: colors.backgroundSecondary }]}>
          <IconSymbol name="magnifyingglass" size={18} color={colors.textTertiary} />
          <TextInput
            ref={inputRef}
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Ask Nexus anything..."
            placeholderTextColor={colors.textTertiary}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable onPress={handleMicPress} style={styles.micBtn}>
            <IconSymbol
              name={voiceState !== 'idle' ? 'mic.fill' : 'mic'}
              size={20}
              color={voiceState !== 'idle' ? '#EF4444' : colors.textSecondary}
            />
          </Pressable>
          <Pressable onPress={handleClose} style={styles.closeBtn}>
            <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Answer card */}
        {isLoading && (
          <View style={styles.answerCard}>
            <ActivityIndicator size="small" color={colors.textTertiary} />
          </View>
        )}
        {!isLoading && answer.length > 0 && (
          <View style={[styles.answerCard, { borderTopColor: colors.border }]}>
            <ThemedText style={[styles.answerText, { color: colors.text }]}>
              {answer}
            </ThemedText>
          </View>
        )}
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  searchCard: {
    marginHorizontal: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  micBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },
  answerCard: {
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
