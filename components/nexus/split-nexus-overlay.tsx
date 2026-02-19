/**
 * Split Nexus Overlay — bottom-half Nexus chat over current screen.
 * Triggered from Nexus tab double-tap.
 * Ephemeral: conversations from split are NOT saved to sidebar.
 * Has its own local state (not connected to main NexusProvider).
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sendToGPT, type ChatMessage } from '@/utils/openai';
import { useMode, useAppContext } from '@/context/app-context';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SPLIT_HEIGHT = SCREEN_HEIGHT * 0.5;
const DISMISS_THRESHOLD = 80;

interface SplitMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function SplitNexusOverlay({ visible, onClose }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const { state: appState } = useAppContext();

  const [messages, setMessages] = useState<SplitMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const historyRef = useRef<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const slideAnim = useRef(new Animated.Value(SPLIT_HEIGHT)).current;

  // Slide up on open, slide down on close
  useEffect(() => {
    if (visible) {
      setMessages([]);
      setInputText('');
      historyRef.current = [];
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start(() => {
        inputRef.current?.focus();
      });
    } else {
      Animated.timing(slideAnim, {
        toValue: SPLIT_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Pan responder for drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dx) < 20,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) {
          slideAnim.setValue(gs.dy);
        }
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dy > DISMISS_THRESHOLD) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: SPLIT_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  }, [onClose, slideAnim]);

  const handleSend = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg: SplitMessage = { id: `u-${Date.now()}`, role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    historyRef.current.push({ role: 'user', content: text });

    try {
      const response = await sendToGPT({
        messages: historyRef.current,
        context: {
          mode,
          organization: appState.organization,
          operatingRole: appState.operatingRole,
          program: appState.program,
          cycleName: appState.cycle?.name ?? null,
        },
      });

      historyRef.current.push({ role: 'assistant', content: response });
      const assistantMsg: SplitMessage = { id: `a-${Date.now()}`, role: 'assistant', content: response };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const errMsg: SplitMessage = { id: `e-${Date.now()}`, role: 'assistant', content: 'Something went wrong.' };
      setMessages((prev) => [...prev, errMsg]);
    }

    setIsLoading(false);
  }, [inputText, isLoading, mode, appState]);

  // Auto-scroll
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      {/* Drag handle */}
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={[styles.handle, { backgroundColor: colors.textTertiary }]} />
      </View>

      <View style={[styles.container, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.role === 'user' ? styles.userRow : styles.assistantRow]}>
              <View
                style={[
                  styles.msgBubble,
                  item.role === 'user'
                    ? [styles.userBubble, { backgroundColor: colors.backgroundTertiary }]
                    : [styles.assistantBubble, { backgroundColor: colors.backgroundSecondary }],
                ]}
              >
                <ThemedText style={[styles.msgText, { color: colors.text }]}>{item.content}</ThemedText>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
                Ask Nexus about what's on screen
              </ThemedText>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={colors.textTertiary} />
              </View>
            ) : null
          }
        />

        {/* Input */}
        <View style={[styles.inputRow, { borderTopColor: colors.border, paddingBottom: insets.bottom || Spacing.sm }]}>
          <TextInput
            ref={inputRef}
            style={[styles.input, { color: colors.text, backgroundColor: colors.backgroundSecondary }]}
            placeholder="Ask Nexus..."
            placeholderTextColor={colors.textTertiary}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <IconSymbol
              name="arrow.up.circle.fill"
              size={28}
              color={inputText.trim() ? colors.tint : colors.textTertiary}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SPLIT_HEIGHT,
    zIndex: 998,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  container: {
    flex: 1,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  listContent: {
    padding: Spacing.sm,
    flexGrow: 1,
  },
  msgRow: {
    marginVertical: 3,
    maxWidth: '85%',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  assistantRow: {
    alignSelf: 'flex-start',
  },
  msgBubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  loadingRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  sendBtn: {
    padding: 2,
  },
});
