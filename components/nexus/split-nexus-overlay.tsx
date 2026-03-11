/**
 * Split Nexus Overlay — bottom-half Nexus chat over current screen.
 * Triggered from Nexus tab double-tap.
 *
 * Keyboard behavior:
 * - Hidden: top ~50% screen, bottom ~50% Nexus area + chips + input
 * - Visible: top compresses to ~20-25%, chips + input rise with keyboard
 * - Send/enter: keyboard auto-dismisses, screen expands back
 * - Chip tap: sends immediately, no keyboard
 * - NO dividers anywhere — seamless continuous surface
 * - Everything moves together, fluid LayoutAnimation transitions
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  Dimensions,
  FlatList,
  Keyboard,
  LayoutAnimation,
  Platform,
  ActivityIndicator,
  PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname, useGlobalSearchParams } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { sendToGPT, type ChatMessage } from '@/utils/openai';
import { useMode, useAppContext } from '@/context/app-context';
import { startGlobalVoice } from '@/utils/global-voice';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FOOTER_HEIGHT = 49;
const SPLIT_HEIGHT = Math.round(SCREEN_HEIGHT * 0.45);
const DISMISS_THRESHOLD = 80;

/* ── Contextual suggestion chips by screen ── */
const SCREEN_CHIPS: Record<string, string[]> = {
  season:       ['Sim next game', 'Season stats', 'Compare records'],
  roster:       ['Rate this player', 'Depth chart', 'Injury report'],
  recruits:     ['Evaluate prospect', 'Compare to roster', 'Recruiting status'],
  messages:     ['Summarize this channel', 'Find last message from...', 'Draft a reply'],
  store:        ['Sales this week', 'Top selling merch', 'Revenue report'],
  media:        ['Clip highlights', 'Share this', 'Tag players'],
  gm:           ['Run simulation', 'Trade scenarios', 'Roster moves'],
  organization: ['Team overview', 'Compliance check', 'Financial summary'],
  home:         ['What can you help with?', 'Summarize my day', 'Quick stats'],
};

function getChipsForScreen(context: string): string[] {
  const lower = context.toLowerCase();
  if (lower.includes('message'))                         return SCREEN_CHIPS.messages;
  if (lower.includes('season') || lower.includes('calendar') || lower.includes('agenda')) return SCREEN_CHIPS.season;
  if (lower.includes('roster') || lower.includes('team')) return SCREEN_CHIPS.roster;
  if (lower.includes('recruit') || lower.includes('prospect')) return SCREEN_CHIPS.recruits;
  if (lower.includes('store') || lower.includes('give')) return SCREEN_CHIPS.store;
  if (lower.includes('media'))                           return SCREEN_CHIPS.media;
  if (lower.includes('gm'))                              return SCREEN_CHIPS.gm;
  if (lower.includes('organization') || lower.includes('org')) return SCREEN_CHIPS.organization;
  return SCREEN_CHIPS.home;
}

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
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const { state: appState } = useAppContext();
  const pathname = usePathname();
  const { title } = useGlobalSearchParams<{ title?: string }>();

  const [messages, setMessages] = useState<SplitMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kbHeight, setKbHeight] = useState(0);
  const historyRef = useRef<ChatMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const slideAnim = useRef(new Animated.Value(SPLIT_HEIGHT)).current;

  const footerTotal = FOOTER_HEIGHT + insets.bottom + 1;

  // Derive chips from current screen context
  const screenContext = title ?? pathname;
  const chips = useMemo(() => getChipsForScreen(screenContext), [screenContext]);

  // ── Keyboard tracking ──
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'),
      );
      setKbHeight(e.endCoordinates.height);
    });

    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(
        LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'),
      );
      setKbHeight(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // ── Computed layout dimensions ──
  // Keyboard hidden: overlay takes ~45%, sits above footer
  // Keyboard visible: overlay expands, top screen compresses to ~22%
  const keyboardUp = kbHeight > 0;
  const overlayBottom = keyboardUp ? kbHeight : footerTotal;
  const overlayHeight = keyboardUp
    ? SCREEN_HEIGHT - insets.top - Math.round(SCREEN_HEIGHT * 0.22) - kbHeight
    : SPLIT_HEIGHT;

  // Slide up on open, slide down on close — conversation persists (no clearing)
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }).start();
    } else {
      Keyboard.dismiss();
      Animated.timing(slideAnim, {
        toValue: SPLIT_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  // Drag-to-dismiss
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) => gs.dy > 10 && Math.abs(gs.dx) < 20,
      onPanResponderMove: (_, gs) => {
        if (gs.dy > 0) slideAnim.setValue(gs.dy);
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
    }).start(() => onClose());
  }, [onClose, slideAnim]);

  // Send a query (from input or chip tap)
  const sendQuery = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    // Dismiss keyboard immediately on send
    Keyboard.dismiss();

    const userMsg: SplitMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    historyRef.current.push({ role: 'user', content: trimmed });

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
      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: response }]);
    } catch {
      setMessages((prev) => [...prev, { id: `e-${Date.now()}`, role: 'assistant', content: 'Something went wrong.' }]);
    }

    setIsLoading(false);
  }, [isLoading, mode, appState]);

  const handleSend = useCallback(() => sendQuery(inputText), [inputText, sendQuery]);
  const handleChipPress = useCallback((chip: string) => sendQuery(chip), [sendQuery]);
  const handleMicPress = useCallback(() => startGlobalVoice(), []);

  // Auto-scroll on new messages
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
        {
          bottom: overlayBottom,
          height: overlayHeight,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Drag handle — seamless, no borders */}
      <View {...panResponder.panHandlers} style={styles.handleArea}>
        <View style={styles.handle} />
      </View>

      <View style={styles.container}>
        {/* Conversation */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <View style={[styles.msgRow, item.role === 'user' ? styles.userRow : styles.assistantRow]}>
              <View style={[styles.msgBubble, item.role === 'user' ? styles.userBubble : styles.assistantBubble]}>
                <Text style={styles.msgText}>{item.content}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Ask Nexus about what's on screen</Text>
            </View>
          }
          ListFooterComponent={
            isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={C.muted} />
              </View>
            ) : null
          }
        />

        {/* Contextual suggestion chips — no divider above */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
          keyboardShouldPersistTaps="handled"
        >
          {chips.map((chip) => (
            <Pressable
              key={chip}
              style={({ pressed }) => [styles.chip, pressed && styles.chipPressed]}
              onPress={() => handleChipPress(chip)}
            >
              <Text style={styles.chipText}>{chip}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Input bar — no divider above */}
        <View style={styles.inputRow}>
          <Pressable style={styles.micBtn} onPress={handleMicPress}>
            <IconSymbol name="mic.fill" size={20} color={C.muted} />
          </Pressable>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Ask Nexus..."
            placeholderTextColor={C.muted}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            blurOnSubmit
          />
          <Pressable
            style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.6 : 1 }]}
            onPress={handleSend}
            disabled={!inputText.trim()}
          >
            <IconSymbol
              name="arrow.up.circle.fill"
              size={28}
              color={inputText.trim() ? accent : C.muted}
            />
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 998,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: C.surface,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  container: {
    flex: 1,
    backgroundColor: C.surface,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    color: C.label,
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
    color: C.muted,
  },
  loadingRow: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  chipsScroll: {
    maxHeight: 44,
  },
  chipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  chip: {
    backgroundColor: C.separator,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  chipPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 8,
  },
  micBtn: {
    padding: 6,
  },
  input: {
    flex: 1,
    height: 36,
    borderRadius: 18,
    paddingHorizontal: 14,
    fontSize: 15,
    color: C.label,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  sendBtn: {
    padding: 2,
  },
});
