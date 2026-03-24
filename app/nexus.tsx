/**
 * Nexus — AI chat screen.
 * Empty state: centered icon + time-based greeting.
 * Chat state: message bubbles + input bar.
 */

import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { NexusPageTopBar } from '@/components/nexus/nexus-page-top-bar';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { GlassView } from '@/components/ui/glass-view';

// ── Helpers ───────────────────────────────────────────────────────────────────

function timeOfDay(): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  return 'evening';
}

type Message = { id: string; text: string; isMe: boolean };

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NexusScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();

  const [text,           setText]           = useState('');
  const [messages,       setMessages]       = useState<Message[]>([]);
  const [addSheetOpen,   setAddSheetOpen]   = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const hasMessages = messages.length > 0;
  const canSend     = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const userMsg: Message = { id: `${Date.now()}`, text: text.trim(), isMe: true };
    setMessages(p => [...p, userMsg]);
    setText('');
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    setTimeout(() => {
      setMessages(p => [...p, {
        id: `${Date.now() + 1}`,
        text: "I'm Nexus, your KaNeXT AI. Full responses are coming soon — stay tuned.",
        isMe: false,
      }]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);
    }, 900);
  };

  const handleNewChat = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMessages([]);
    setText('');
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
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
          <View style={s.emptyState}>
            <IconSymbol name="sparkles" size={54} color={C.accent} />
            <Text style={[s.greeting, { color: C.label }]}>
              {'How can I help you\nthis ' + timeOfDay() + '?'}
            </Text>
          </View>
        )}

        {/* ── Message list ── */}
        {hasMessages && (
          <ScrollView
            ref={scrollRef}
            style={{ flex: 1 }}
            contentContainerStyle={s.messageList}
            showsVerticalScrollIndicator={false}
          >
            {messages.map(m => (
              <View key={m.id} style={[s.bubbleRow, m.isMe ? s.bubbleRowRight : s.bubbleRowLeft]}>
                <View style={[s.bubble, { backgroundColor: m.isMe ? C.accent : C.surface }]}>
                  <Text style={[s.bubbleText, { color: m.isMe ? '#fff' : C.label }]}>{m.text}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ── Input bar ── */}
        <View style={[s.inputBar, { marginBottom: insets.bottom + 49 + 10 }]}>
          {/* Plus — outside the strip */}
          <Pressable
            style={[s.plusCircle, { backgroundColor: C.secondary + '99' }]}
            hitSlop={8}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSheetOpen(true); }}
          >
            <IconSymbol name="plus" size={20} color={C.bg} />
          </Pressable>

          {/* Input strip */}
          <View style={[s.inputStrip, { backgroundColor: C.surface, borderColor: C.inputBorder }]}>
            <TextInput
              style={[s.textInput, { color: C.label }]}
              placeholder="Chat with Nexus"
              placeholderTextColor={C.muted}
              value={text}
              onChangeText={setText}
              multiline
              maxLength={2000}
              returnKeyType="default"
            />
            <Pressable hitSlop={10} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="mic" size={20} color={C.secondary} />
            </Pressable>
            <Pressable
              style={[s.sendBtn, { backgroundColor: canSend ? C.label : C.secondary + '55' }]}
              onPress={handleSend}
              disabled={!canSend}
            >
              <IconSymbol
                name={canSend ? 'arrow.up' : 'waveform'}
                size={17}
                color={canSend ? C.bg : C.secondary}
              />
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
        <View style={s.sheetContent}>
          {/* Top row: Camera · Photos · Files */}
          <View style={s.tileRow}>
            {([
              { icon: 'camera.fill',      label: 'Camera' },
              { icon: 'photo.fill',       label: 'Photos' },
              { icon: 'doc.fill',         label: 'Files'  },
            ] as const).map(({ icon, label }) => (
              <Pressable
                key={label}
                style={s.tileWrap}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddSheetOpen(false); }}
              >
                <GlassView tier={1} style={s.tile}>
                  <IconSymbol name={icon as any} size={26} color={C.label} />
                  <Text style={[s.tileLabel, { color: C.label }]}>{label}</Text>
                </GlassView>
              </Pressable>
            ))}
          </View>

          {/* TBD features */}
          <View style={[s.comingSection, { borderTopColor: C.separator }]}>
            {([
              { icon: 'globe',                    label: 'Web Search'     },
              { icon: 'doc.text.magnifyingglass', label: 'Research'       },
              { icon: 'folder.fill',              label: 'Projects'       },
              { icon: 'building.2.fill',          label: 'Brand Context'  },
              { icon: 'bolt.horizontal.fill',     label: 'Connectors'     },
            ] as const).map(({ icon, label }, i) => (
              <View key={label}>
                {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 54 }} />}
                <View style={s.comingRow}>
                  <View style={[s.comingIconWrap, { backgroundColor: C.surfacePressed }]}>
                    <IconSymbol name={icon as any} size={17} color={C.muted} />
                  </View>
                  <Text style={[s.comingLabel, { color: C.muted }]}>{label}</Text>
                  <View style={[s.soonBadge, { backgroundColor: C.surfacePressed }]}>
                    <Text style={[s.soonText, { color: C.muted }]}>Soon</Text>
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

const s = StyleSheet.create({
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
  messageList:   { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  bubbleRow:     { marginBottom: 8 },
  bubbleRowLeft: { alignItems: 'flex-start' },
  bubbleRowRight:{ alignItems: 'flex-end' },
  bubble:        { maxWidth: '82%', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText:    { fontSize: 16, lineHeight: 23 },

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
    maxHeight: 100,
    paddingVertical: 0,
  },
  sendBtn: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  // Add to Chat sheet
  sheetContent:   { paddingHorizontal: 16, paddingBottom: 32 },

  tileRow:        { flexDirection: 'row', gap: 12, marginBottom: 20 },
  tileWrap:       { flex: 1 },
  tile:           { alignItems: 'center', justifyContent: 'center', paddingVertical: 18, gap: 8, borderRadius: 16 },
  tileLabel:      { fontSize: 13, fontWeight: '500' },

  comingSection:  { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 4 },
  comingRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, gap: 12 },
  comingIconWrap: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  comingLabel:    { flex: 1, fontSize: 15 },
  soonBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  soonText:       { fontSize: 11, fontWeight: '600' },
});
