/**
 * Search Overlay — bottom-anchored ephemeral query interface.
 * Triggered from Nexus tab long-press. Appears ABOVE the footer.
 * Voice-first: mic activates immediately on open.
 * Results grow upward above the search bar.
 * NOT saved as conversation.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { sendToGPT } from '@/utils/openai';
import { useMode, useAppContext } from '@/context/app-context';

const FOOTER_HEIGHT = 49;

// Dark-only palette (matches app dark theme)
const dk = {
  surface: '#0B0F14',
  surfaceSecondary: '#151A22',
  text: '#FFFFFF',
  textSecondary: '#A1A1AA',
  textTertiary: '#71717A',
  border: 'rgba(255,255,255,0.1)',
};

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SearchOverlay({ visible, onClose }: Props) {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const { state: appState } = useAppContext();

  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(60)).current;

  // Speech recognition for mic
  const { voiceState, startListening, stopListening } = useSpeechRecognition({
    onTranscript: useCallback((text: string) => {
      setQuery(text);
    }, []),
  });

  const footerTotal = FOOTER_HEIGHT + insets.bottom + 1;

  useEffect(() => {
    if (visible) {
      setQuery('');
      setAnswer('');
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start(() => {
        // Voice-first: start listening immediately on open
        startListening();
      });
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 60, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim]);

  const handleSubmit = async () => {
    const trimmed = query.trim();
    if (!trimmed || isLoading) return;

    Keyboard.dismiss();
    if (voiceState !== 'idle') stopListening();
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

  /** Tap search input → stop voice, focus text input */
  const handleInputFocus = () => {
    if (voiceState !== 'idle') stopListening();
  };

  const handleClose = () => {
    Keyboard.dismiss();
    if (voiceState !== 'idle') stopListening();
    onClose();
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
      {/* Backdrop — tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Bottom-anchored container: results above, search bar at bottom */}
      <KeyboardAvoidingView
        style={[styles.bottomContainer, { bottom: footerTotal }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={footerTotal}
      >
        {/* Results area — grows upward */}
        {(isLoading || answer.length > 0) && (
          <Animated.View
            style={[
              styles.resultsCard,
              { transform: [{ translateY: slideAnim }] },
            ]}
          >
            {isLoading && (
              <View style={styles.answerCard}>
                <ActivityIndicator size="small" color={dk.textTertiary} />
              </View>
            )}
            {!isLoading && answer.length > 0 && (
              <View style={styles.answerCard}>
                <Text style={styles.answerText}>{answer}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Search bar — fixed above footer */}
        <Animated.View
          style={[
            styles.searchCard,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          {/* Listening indicator */}
          {voiceState !== 'idle' && (
            <View style={styles.listeningRow}>
              <View style={styles.listeningDot} />
              <Text style={styles.listeningText}>Listening...</Text>
            </View>
          )}

          <View style={styles.searchRow}>
            <IconSymbol name="magnifyingglass" size={18} color={dk.textTertiary} />
            <TextInput
              ref={inputRef}
              style={styles.searchInput}
              placeholder="Ask Nexus anything..."
              placeholderTextColor={dk.textTertiary}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSubmit}
              onFocus={handleInputFocus}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardAppearance="dark"
            />
            <Pressable onPress={handleMicPress} style={styles.micBtn}>
              <IconSymbol
                name={voiceState !== 'idle' ? 'mic.fill' : 'mic'}
                size={20}
                color={voiceState !== 'idle' ? '#EF4444' : dk.textSecondary}
              />
            </Pressable>
            <Pressable onPress={handleClose} style={styles.closeBtn}>
              <IconSymbol name="xmark" size={18} color={dk.textSecondary} />
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
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
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    justifyContent: 'flex-end',
  },
  searchCard: {
    marginHorizontal: 12,
    backgroundColor: dk.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: dk.border,
    overflow: 'hidden',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    height: 48,
    gap: 8,
    backgroundColor: dk.surfaceSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
    color: dk.text,
  },
  micBtn: {
    padding: 6,
  },
  closeBtn: {
    padding: 6,
  },
  listeningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: 10,
    paddingBottom: 4,
    gap: 8,
  },
  listeningDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  listeningText: {
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '500',
  },
  resultsCard: {
    marginHorizontal: 12,
    marginBottom: 6,
    backgroundColor: dk.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: dk.border,
    overflow: 'hidden',
  },
  answerCard: {
    padding: Spacing.md,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: dk.text,
  },
});
