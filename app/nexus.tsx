/**
 * Nexus — AI chat screen.
 * Empty state: centered icon + time-based greeting.
 * Chat state: streaming message bubbles + input bar.
 *
 * Intelligence routing (Section 7, INTELLIGENCE_INTEGRATION_SPEC.md):
 *   1. User message → classifyQuery() (router.ts) — detect intent
 *   2. Basketball query → routeQuery() — run available engines
 *   3. buildNexusPrompt() — assemble system prompt with engine results
 *   4. SKILL_SYSTEM_PROMPT prepended — inject basketball intelligence framing
 *   5. Stream response from claude-sonnet-4-6 via Anthropic API
 *   6. Tokens render progressively into the assistant bubble
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NexusPageTopBar } from '@/components/nexus/nexus-page-top-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { GlassView } from '@/components/ui/glass-view';
import { classifyQuery, routeQuery } from '@/services/intelligence/router';
import { buildNexusPrompt } from '@/services/intelligence/nexus-prompt-builder';
import { SKILL_SYSTEM_PROMPT } from '@/services/intelligence/skill-prompt';

// ── Constants ─────────────────────────────────────────────────────────────────

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_MODEL   = 'claude-sonnet-4-6';
const ANTHROPIC_VERSION = '2023-06-01';
const MAX_TOKENS        = 2048;

const GENERIC_SYSTEM_PROMPT =
  `You are Nexus, KaNeXT's intelligent AI assistant. You help coaches, athletes, and administrators with any question — scheduling, operations, program management, and more. Be concise, direct, and useful.`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id:         string;
  text:       string;
  isMe:       boolean;
  streaming?: boolean; // true while Claude is generating this message
}

type ApiMessage = { role: 'user' | 'assistant'; content: string };

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  return 'evening';
}

/** Detect whether a query should get basketball intelligence framing */
function isBasketballQuery(message: string): boolean {
  const qt = classifyQuery(message);
  if (qt !== 'unknown') return true;
  // Catch general basketball terms the specific patterns don't cover
  return /\b(basketball|player|roster|recruit|transfer|kr|klvn|archetype|scoring|defense|rebounding|assist|turnover|minutes|season|game|coach|program|scholarship|nil|draft|pro)\b/i.test(message);
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NexusScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const S      = makeStyles(C);

  const [text,         setText]         = useState('');
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [isStreaming,  setIsStreaming]   = useState(false);
  const [addSheetOpen, setAddSheetOpen] = useState(false);

  const scrollRef     = useRef<ScrollView>(null);
  const abortRef      = useRef<boolean>(false); // signals active stream to stop

  const hasMessages = messages.length > 0;
  const canSend     = text.trim().length > 0 && !isStreaming;

  // Pause/abort stream on screen blur
  useFocusEffect(
    useCallback(() => {
      abortRef.current = false;
      return () => { abortRef.current = true; };
    }, [])
  );

  // ── Send ────────────────────────────────────────────────────────────────────

  const handleSend = async () => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userText   = text.trim();
    const userMsgId  = `u_${Date.now()}`;
    const assistantId = `a_${Date.now() + 1}`;

    // Snapshot history before adding new messages (excludes streaming placeholders)
    const historySnapshot: ApiMessage[] = messages
      .filter(m => m.text.length > 0)
      .map(m => ({ role: m.isMe ? 'user' : 'assistant', content: m.text }));
    historySnapshot.push({ role: 'user', content: userText });

    // Update UI
    setText('');
    setIsStreaming(true);
    setMessages(prev => [
      ...prev,
      { id: userMsgId,   text: userText, isMe: true  },
      { id: assistantId, text: '',        isMe: false, streaming: true },
    ]);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

    // ── Build system prompt ──
    const basketball = isBasketballQuery(userText);
    let systemPrompt: string;

    if (basketball) {
      const result = routeQuery({ message: userText });
      const { systemPrompt: engineBlock } = buildNexusPrompt({
        result,
        coachContext: null, // TODO: inject from program context when bound
        userMessage: userText,
      });
      systemPrompt = SKILL_SYSTEM_PROMPT + '\n\n---\n\n' + engineBlock;
    } else {
      systemPrompt = GENERIC_SYSTEM_PROMPT;
    }

    // ── Stream from Claude ──
    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method:  'POST',
        headers: {
          'Content-Type':    'application/json',
          'x-api-key':       process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '',
          'anthropic-version': ANTHROPIC_VERSION,
        },
        body: JSON.stringify({
          model:      ANTHROPIC_MODEL,
          max_tokens: MAX_TOKENS,
          stream:     true,
          system:     systemPrompt,
          messages:   historySnapshot,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader  = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = '';
      let buffer      = '';

      while (true) {
        if (abortRef.current) { reader.cancel(); break; }

        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? ''; // hold incomplete last line

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') continue;

          try {
            const evt = JSON.parse(data);
            if (
              evt.type === 'content_block_delta' &&
              evt.delta?.type === 'text_delta' &&
              typeof evt.delta.text === 'string'
            ) {
              accumulated += evt.delta.text;
              setMessages(prev =>
                prev.map(m => m.id === assistantId ? { ...m, text: accumulated } : m)
              );
            }
          } catch {
            // malformed SSE chunk — skip
          }
        }
      }

      // Finalize
      setMessages(prev =>
        prev.map(m => m.id === assistantId ? { ...m, streaming: false } : m)
      );

    } catch (err) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantId
            ? { ...m, text: `Something went wrong — ${errMsg}. Please try again.`, streaming: false }
            : m
        )
      );
    }

    setIsStreaming(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
  };

  // ── New Chat ─────────────────────────────────────────────────────────────────

  const handleNewChat = () => {
    abortRef.current = true; // stop any active stream
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages([]);
    setText('');
    setIsStreaming(false);
    setTimeout(() => { abortRef.current = false; }, 100);
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <View style={[S.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <View style={{ paddingTop: insets.top }}>
        <NexusPageTopBar view="home" onNewChat={handleNewChat} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* ── Empty state ── */}
        {!hasMessages && (
          <View style={S.emptyState}>
            <IconSymbol name="sparkles" size={54} color={C.accent} />
            <Text style={[S.greeting, { color: C.label }]}>
              {'How can I help you\nthis ' + timeOfDay() + '?'}
            </Text>
          </View>
        )}

        {/* ── Message list ── */}
        {hasMessages && (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={S.messageList}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="interactive"
          >
            {messages.map(m => (
              <View key={m.id} style={[S.bubbleRow, m.isMe ? S.bubbleRowRight : S.bubbleRowLeft]}>
                <View style={[
                  S.bubble,
                  { backgroundColor: m.isMe ? C.accent : C.surface },
                ]}>
                  {/* Typing indicator: streaming and no text yet */}
                  {m.streaming && m.text === '' ? (
                    <ActivityIndicator
                      size="small"
                      color={C.secondary}
                      style={{ marginHorizontal: 4, marginVertical: 2 }}
                    />
                  ) : (
                    <Text style={[S.bubbleText, { color: m.isMe ? '#fff' : C.label }]}>
                      {m.text}
                      {/* Blinking cursor while streaming */}
                      {m.streaming && m.text.length > 0 && (
                        <Text style={{ color: C.accent }}>▋</Text>
                      )}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ── Input bar ── */}
        <View style={[S.inputBar, { marginBottom: insets.bottom + 49 + 10 }]}>

          {/* Plus button */}
          <Pressable
            style={[S.plusCircle, { backgroundColor: C.secondary + '99' }]}
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setAddSheetOpen(true);
            }}
          >
            <IconSymbol name="plus" size={20} color={C.bg} />
          </Pressable>

          {/* Input strip */}
          <View style={[S.inputStrip, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
            <TextInput
              style={[S.textInput, { color: C.label }]}
              placeholder="Chat with Nexus"
              placeholderTextColor={C.muted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={4000}
              returnKeyType="default"
              editable={!isStreaming}
            />
            <Pressable hitSlop={10} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="mic" size={20} color={C.secondary} />
            </Pressable>
            <Pressable
              style={[S.sendBtn, { backgroundColor: canSend ? C.label : C.secondary + '55' }]}
              onPress={handleSend}
              disabled={!canSend}
            >
              {isStreaming ? (
                <ActivityIndicator size="small" color={C.bg} />
              ) : (
                <IconSymbol
                  name={canSend ? 'arrow.up' : 'waveform'}
                  size={17}
                  color={canSend ? C.bg : C.secondary}
                />
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* ── Add to Chat sheet ── */}
      <BottomSheet
        visible={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        useModal
        backgroundColor={C.bg}
        title="Add to Chat"
      >
        <View style={S.sheetContent}>
          {/* Top row: Camera · Photos · Files */}
          <View style={S.tileRow}>
            {([
              { icon: 'camera.fill', label: 'Camera'  },
              { icon: 'photo.fill',  label: 'Photos'  },
              { icon: 'doc.fill',    label: 'Files'   },
            ] as const).map(({ icon, label }) => (
              <Pressable
                key={label}
                style={S.tileWrap}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setAddSheetOpen(false);
                }}
              >
                <GlassView tier={1} style={S.tile}>
                  <IconSymbol name={icon as any} size={26} color={C.label} />
                  <Text style={[S.tileLabel, { color: C.label }]}>{label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </View>

          {/* Coming soon features */}
          <View style={[S.comingSection, { borderTopColor: C.separator }]}>
            {([
              { icon: 'globe',                    label: 'Web Search'    },
              { icon: 'doc.text.magnifyingglass', label: 'Research'      },
              { icon: 'folder.fill',              label: 'Projects'      },
              { icon: 'building.2.fill',          label: 'Brand Context' },
              { icon: 'bolt.horizontal.fill',     label: 'Connectors'    },
            ] as const).map(({ icon, label }, i) => (
              <View key={label}>
                {i > 0 && (
                  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 54 }} />
                )}
                <View style={S.comingRow}>
                  <View style={[S.comingIconWrap, { backgroundColor: C.surfacePressed }]}>
                    <IconSymbol name={icon as any} size={17} color={C.muted} />
                  </View>
                  <Text style={[S.comingLabel, { color: C.muted }]}>{label}</Text>
                  <View style={[S.soonBadge, { backgroundColor: C.surfacePressed }]}>
                    <Text style={[S.soonText, { color: C.muted }]}>Soon</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ReturnType<typeof import('@/hooks/use-colors').useColors>) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Empty state
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 36,
      paddingBottom: 100,
      gap: 20,
    },
    greeting: {
      fontSize: 34,
      fontWeight: '300',
      textAlign: 'center',
      lineHeight: 44,
    },

    // Messages
    messageList:    { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
    bubbleRow:      { marginBottom: 8 },
    bubbleRowLeft:  { alignItems: 'flex-start' },
    bubbleRowRight: { alignItems: 'flex-end' },
    bubble: {
      maxWidth: '82%',
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 10,
      minWidth: 44,
      minHeight: 40,
      justifyContent: 'center',
    },
    bubbleText: { fontSize: 16, lineHeight: 23 },

    // Input
    inputBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      gap: 8,
    },
    plusCircle: {
      width: 34, height: 34, borderRadius: 17,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },
    inputStrip: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 22,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 14,
      paddingVertical: 8,
      gap: 8,
    },
    textInput: {
      flex: 1,
      fontSize: 16,
      lineHeight: 22,
      maxHeight: 120,
      paddingVertical: 0,
    },
    sendBtn: {
      width: 30, height: 30, borderRadius: 15,
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
    },

    // Add to Chat sheet
    sheetContent: { paddingHorizontal: 16, paddingBottom: 32 },
    tileRow:      { flexDirection: 'row', gap: 12, marginBottom: 20 },
    tileWrap:     { flex: 1 },
    tile:         { alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, borderRadius: 16 },
    tileLabel:    { fontSize: 13, fontWeight: '500' },

    comingSection:  { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4 },
    comingRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
    comingIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    comingLabel:    { flex: 1, fontSize: 15 },
    soonBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    soonText:       { fontSize: 11, fontWeight: '600' },
  });
}
