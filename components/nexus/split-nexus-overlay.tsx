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
 *
 * Fixes applied:
 *   Fix 1 — Auto-dismiss when user navigates to a different screen
 *   Fix 2 — iOS-standard sheet: backdrop dim, rounded corners, correct handle
 *   Fix 3 — Input bar flush to footer (no gap)
 *   Feature 5 — Escalation: detect low-confidence replies, append notice, log to AsyncStorage
 */

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
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
import AsyncStorage from '@react-native-async-storage/async-storage';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode, useAppContext } from '@/context/app-context';
import { startGlobalVoice } from '@/utils/global-voice';
import { consumeSplitNexusPendingQuery } from '@/utils/global-split-nexus';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const FOOTER_HEIGHT = 49;
const SPLIT_HEIGHT = Math.round(SCREEN_HEIGHT * 0.45);
const DISMISS_THRESHOLD = 80;

// ── Feature 5: Escalation detection ──────────────────────────────────────────

const LOW_CONFIDENCE_PHRASES = [
  "i'm not sure", "i don't have enough information", "i can't determine",
  "i don't know", "i cannot be certain", "i'm unable to", "i don't have access",
  "i cannot verify", "i'm not certain", "not sure about", "i cannot confirm",
  "insufficient data", "not enough context",
];

function isLowConfidence(text: string): boolean {
  const lower = text.toLowerCase();
  return LOW_CONFIDENCE_PHRASES.some((phrase) => lower.includes(phrase));
}

async function logEscalation(question: string, context: string, answer: string): Promise<void> {
  try {
    const entry = {
      id: `esc-${Date.now()}`,
      question,
      context,
      answer: answer.slice(0, 500),
      timestamp: new Date().toISOString(),
    };
    const raw = await AsyncStorage.getItem('@nexus_escalations');
    const list: object[] = raw ? JSON.parse(raw) : [];
    list.unshift(entry);
    await AsyncStorage.setItem('@nexus_escalations', JSON.stringify(list.slice(0, 50)));
  } catch {
    // Silent — escalation logging failure shouldn't surface to user
  }
}

const ESCALATION_NOTICE =
  "I'm not fully confident in this answer — I've flagged it for Coach K to review. You'll get an updated response once confirmed.";

// ── Anthropic helper ──────────────────────────────────────────────────────────

interface ChatMessage { role: 'user' | 'assistant'; content: string; }

async function sendToAnthropic(messages: ChatMessage[], system: string): Promise<string> {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      system,
      messages,
      max_tokens: 512,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? 'Anthropic error');
  return data.content[0]?.text ?? '';
}

function buildOverlaySystem(
  mode: string,
  orgName: string | null,
  program: string | null,
  cycleName: string | null,
  screenContext: string,
): string {
  const screen = screenContext.replace(/.*\//, '') || 'home';
  const lines = [
    `You are Nexus, KaNeXT's AI assistant. Answer a quick question — the user is on the ${screen} screen.`,
    `Mode: ${mode}  ·  Org: ${orgName ?? 'KaNeXT'}`,
  ];
  if (program) lines.push(`Program: ${program}`);
  if (cycleName) lines.push(`Season: ${cycleName}`);
  lines.push('Be concise (2-4 sentences). Direct and actionable.');
  return lines.join('\n');
}

// ── Contextual suggestion chips by screen ─────────────────────────────────────

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
  if (lower.includes('message'))                                                      return SCREEN_CHIPS.messages;
  if (lower.includes('season') || lower.includes('calendar') || lower.includes('agenda')) return SCREEN_CHIPS.season;
  if (lower.includes('roster') || lower.includes('team'))                            return SCREEN_CHIPS.roster;
  if (lower.includes('recruit') || lower.includes('prospect'))                       return SCREEN_CHIPS.recruits;
  if (lower.includes('store') || lower.includes('give'))                             return SCREEN_CHIPS.store;
  if (lower.includes('media'))                                                        return SCREEN_CHIPS.media;
  if (lower.includes('gm'))                                                           return SCREEN_CHIPS.gm;
  if (lower.includes('organization') || lower.includes('org'))                       return SCREEN_CHIPS.organization;
  return SCREEN_CHIPS.home;
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SplitMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  escalated?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

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

  // Fix 3: flush to footer — no +1 gap
  const footerTotal = FOOTER_HEIGHT + insets.bottom;

  // Derive chips from current screen context
  const screenContext = title ?? pathname;
  const chips = useMemo(() => getChipsForScreen(screenContext), [screenContext]);

  // ── Keyboard tracking ──────────────────────────────────────────────────────

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, (e) => {
      LayoutAnimation.configureNext(LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'));
      setKbHeight(e.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      LayoutAnimation.configureNext(LayoutAnimation.create(200, 'easeInEaseOut', 'opacity'));
      setKbHeight(0);
    });

    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  // ── Computed layout dimensions ─────────────────────────────────────────────

  const keyboardUp = kbHeight > 0;
  const overlayBottom = keyboardUp ? kbHeight : footerTotal;
  const overlayHeight = keyboardUp
    ? SCREEN_HEIGHT - insets.top - Math.round(SCREEN_HEIGHT * 0.22) - kbHeight
    : SPLIT_HEIGHT;

  // ── Open / close animation ─────────────────────────────────────────────────

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

  // Consume pending query from voice handoff
  useEffect(() => {
    if (visible) {
      const pending = consumeSplitNexusPendingQuery();
      if (pending) sendQuery(pending);
    }
  }, [visible, sendQuery]);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    Animated.timing(slideAnim, {
      toValue: SPLIT_HEIGHT,
      duration: 200,
      useNativeDriver: true,
    }).start(() => onClose());
  }, [onClose, slideAnim]);

  // Fix 1: Auto-dismiss when user navigates to a different screen
  const visibleRef = useRef(visible);
  useEffect(() => { visibleRef.current = visible; }, [visible]);

  const prevPathnameRef = useRef(pathname);
  useEffect(() => {
    const prev = prevPathnameRef.current;
    prevPathnameRef.current = pathname;
    if (prev !== pathname && visibleRef.current) {
      Keyboard.dismiss();
      Animated.timing(slideAnim, {
        toValue: SPLIT_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }).start(() => onClose());
    }
  }, [pathname, onClose, slideAnim]);

  // ── Drag-to-dismiss ────────────────────────────────────────────────────────

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
    }),
  ).current;

  // ── Send query (Feature 5: escalation detection) ───────────────────────────

  const sendQuery = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    Keyboard.dismiss();

    const userMsg: SplitMessage = { id: `u-${Date.now()}`, role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    historyRef.current.push({ role: 'user', content: trimmed });

    try {
      const system = buildOverlaySystem(
        mode,
        appState.organization?.name ?? null,
        appState.program?.name ?? null,
        appState.cycle?.name ?? null,
        screenContext,
      );
      const response = await sendToAnthropic(historyRef.current, system);
      historyRef.current.push({ role: 'assistant', content: response });

      const escalated = isLowConfidence(response);
      if (escalated) {
        logEscalation(trimmed, screenContext, response); // fire-and-forget
      }

      setMessages((prev) => [...prev, {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: response,
        escalated,
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: `e-${Date.now()}`,
        role: 'assistant',
        content: 'Something went wrong.',
      }]);
    }

    setIsLoading(false);
  }, [isLoading, mode, appState, screenContext]);

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
    <>
      {/* Fix 2: Backdrop — dims content above sheet, tap to dismiss */}
      <Pressable style={styles.backdrop} onPress={handleClose} />

      {/* Fix 2: Sheet — rounded top corners, surface bg, overflow:hidden for clean clip */}
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
        {/* Grab handle */}
        <View {...panResponder.panHandlers} style={styles.handleArea}>
          <View style={styles.handle} />
        </View>

        {/* Header */}
        <View style={styles.overlayHeader}>
          <Image
            source={require('@/assets/nexus-icon.png')}
            style={{ width: 18, height: 18, tintColor: C.label }}
            resizeMode="contain"
          />
          <Text style={[styles.overlayTitle, { color: C.label }]}>Nexus</Text>
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
                  {/* Feature 5: Escalation notice — visually distinct, lighter text */}
                  {item.escalated && (
                    <>
                      <View style={styles.escalationDivider} />
                      <View style={styles.escalationRow}>
                        <IconSymbol name="flag" size={12} color={C.secondary} />
                        <Text style={styles.escalationText}>{ESCALATION_NOTICE}</Text>
                      </View>
                    </>
                  )}
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

          {/* Contextual suggestion chips */}
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

          {/* Input bar — Fix 3: sits flush against footer */}
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
              autoCapitalize="sentences"
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
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  // Fix 2: Backdrop — full screen, 40% black dim, tap-to-dismiss
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 997,
  },

  // Fix 2: Sheet — surface bg, rounded top corners, clipped overflow
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 998,
    backgroundColor: C.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },

  handleArea: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  // Fix 2: Correct grab handle — 5×36, C.muted, borderRadius 2.5
  handle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.muted,
  },

  overlayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  overlayTitle: {
    fontSize: 14,
    fontWeight: '600',
  },

  container: {
    flex: 1,
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
    backgroundColor: C.bubbleSent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: C.bubbleReceived,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 14,
    lineHeight: 20,
    color: C.label,
  },

  // Feature 5: Escalation notice
  escalationDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginTop: 8,
    marginBottom: 6,
  },
  escalationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  escalationText: {
    fontSize: 12,
    lineHeight: 17,
    color: C.secondary,
    flex: 1,
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
    backgroundColor: C.surfacePressed,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
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
    backgroundColor: C.surfacePressed,
  },
  sendBtn: {
    padding: 2,
  },
});
