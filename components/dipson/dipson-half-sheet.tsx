/**
 * Dipson Half-Sheet — Instagram comments-style contextual AI assistant.
 * Opens after sidebar dismisses (sequential, not simultaneous).
 * Portal-based via BottomSheetModal — renders on top of everything.
 *
 * Input bar uses footerComponent so it anchors to the current snap point,
 * not the maximum snap point height.
 */

import React, { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import {
  View, Text, Image, TextInput, Pressable, StyleSheet,
} from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetBackdrop,
  BottomSheetFooter,
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps, BottomSheetFooterProps } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { registerDipsonSheet } from '@/utils/global-dipson-sheet';

// ── Types ─────────────────────────────────────────────────────────────────────

type Message = { role: 'dipson' | 'user' | 'member'; text: string; id: number; sender?: string };

type BrandMember = { handle: string; name: string; initials: string; role: string };

// ── Mock brand members ────────────────────────────────────────────────────────

const BRAND_MEMBERS: BrandMember[] = [
  { handle: 'dipson',    name: 'Dipson',           initials: 'D',  role: 'AI Assistant' },
  { handle: 'sammyk',    name: 'Sammy Kalejaiye',  initials: 'SK', role: 'Owner'        },
  { handle: 'alex_m',   name: 'Alex Martin',       initials: 'AM', role: 'Manager'      },
  { handle: 'jess_r',   name: 'Jessica Reid',      initials: 'JR', role: 'Collaborator' },
  { handle: 'brand_co', name: 'BrandCo Partner',   initials: 'BC', role: 'Partner'      },
];

// ── Context-aware greeting ─────────────────────────────────────────────────────

function greetingFor(ctx: string): string {
  if (ctx.includes('Content'))
    return "Hi! I can help with content strategy, scheduling, or ideas. What do you need?";
  if (ctx.includes('Analytics'))
    return "Hi! I can help you read your analytics and spot opportunities. What would you like to dig into?";
  if (ctx.includes('Media Kit'))
    return "Hi! I can help tailor your media kit for a specific brand. What are you working on?";
  if (ctx.includes('Earn') || ctx.includes('Store'))
    return "Hi! I can help with pricing, tiers, or monetization strategy. What's on your mind?";
  return "Hi! I'm Dipson. I know what's on your screen — ask me anything about it.";
}

function mockReply(text: string): string {
  if (text.toLowerCase().includes('content'))
    return "Based on your content calendar, your best posting days are Tue and Thu. Want me to suggest ideas for next week?";
  if (text.toLowerCase().includes('analytic') || text.toLowerCase().includes('follow'))
    return "Your follower growth is up 12% this month. The spike on Apr 9 came from the reel you posted — it hit 6x your average reach.";
  return "Got it. Let me think through that for you.";
}

// ── Snap points ───────────────────────────────────────────────────────────────

const SNAP_POINTS = ['50%', '93%'];

// Footer height constant (inputBar paddingVertical:10*2 + height:36 = 56, plus bottom inset)
const FOOTER_BASE_H = 56;

// ── Component ─────────────────────────────────────────────────────────────────

export function DipsonHalfSheet() {
  const C        = useColors();
  const insets   = useSafeAreaInsets();
  const ref      = useRef<BottomSheetModal>(null);
  const inputRef = useRef<TextInput>(null);
  const idRef    = useRef(0);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput]       = useState('');
  const [sending, setSending]   = useState(false);

  // ── @mention state ─────────────────────────────────────────────────────────
  const atMatch      = input.match(/@(\w*)$/);
  const mentionQuery = atMatch ? atMatch[1].toLowerCase() : null;
  const showMentions = mentionQuery !== null;

  const filteredMembers = useMemo(() =>
    showMentions
      ? BRAND_MEMBERS.filter(m =>
          m.handle.includes(mentionQuery!) ||
          m.name.toLowerCase().includes(mentionQuery!)
        )
      : [],
    [mentionQuery, showMentions]
  );

  // ── Registration ──────────────────────────────────────────────────────────
  useEffect(() => {
    registerDipsonSheet((ctx = '') => {
      idRef.current = 0;
      setMessages([{ role: 'dipson', text: greetingFor(ctx), id: idRef.current++ }]);
      setInput('');
      ref.current?.present();
    });
  }, []);

  // ── Send ──────────────────────────────────────────────────────────────────
  const send = useCallback(() => {
    const text = input.trim();
    if (!text || sending) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const isDipsonMessage = !text.startsWith('@') || text.includes('@dipson');
    setMessages(prev => [...prev, { role: 'user', text, id: idRef.current++ }]);
    setInput('');
    if (isDipsonMessage) {
      setSending(true);
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'dipson', text: mockReply(text), id: idRef.current++ }]);
        setSending(false);
      }, 900);
    }
  }, [input, sending]);

  // ── @mention select ───────────────────────────────────────────────────────
  const selectMention = useCallback((member: BrandMember) => {
    Haptics.selectionAsync();
    setInput(prev => prev.replace(/@\w*$/, `@${member.handle} `));
    inputRef.current?.focus();
  }, []);

  // ── Backdrop ──────────────────────────────────────────────────────────────
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.4}
        pressBehavior="close"
      />
    ),
    []
  );

  // ── Footer — anchors to current snap point bottom ─────────────────────────
  const renderFooter = useCallback(
    (props: BottomSheetFooterProps) => (
      <BottomSheetFooter {...props} bottomInset={0}>
        <View style={{ backgroundColor: C.bg }}>
          {/* @mention picker */}
          {showMentions && filteredMembers.length > 0 && (
            <View style={[styles.mentionPicker, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
              {filteredMembers.map(member => (
                <Pressable
                  key={member.handle}
                  style={({ pressed }) => [styles.mentionRow, { borderBottomColor: C.separator }, pressed && { backgroundColor: C.surface }]}
                  onPress={() => selectMention(member)}
                >
                  <View style={[styles.mentionAvatar, { backgroundColor: member.handle === 'dipson' ? C.label : C.separator }]}>
                    <Text style={[styles.mentionAvatarText, { color: member.handle === 'dipson' ? C.bg : C.label }]}>{member.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mentionName, { color: C.label }]}>{member.name}</Text>
                    <Text style={[styles.mentionRole, { color: C.secondary }]}>{member.role}</Text>
                  </View>
                  <Text style={[styles.mentionHandle, { color: C.secondary }]}>@{member.handle}</Text>
                </Pressable>
              ))}
            </View>
          )}
          {/* Input bar */}
          <View style={[styles.inputBar, {
            borderTopColor: C.separator,
            paddingBottom: Math.max(insets.bottom, 8),
          }]}>
            <View style={[styles.userAvatar, { backgroundColor: C.separator }]}>
              <Text style={[styles.avatarText, { color: C.secondary, fontSize: 10 }]}>S</Text>
            </View>
            <TextInput
              ref={inputRef}
              style={[styles.input, { backgroundColor: C.surface, borderColor: C.separator, color: C.label }]}
              placeholder="Ask Dipson or @mention someone..."
              placeholderTextColor={C.secondary}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={send}
              returnKeyType="send"
              multiline={false}
            />
            <Pressable
              onPress={send}
              style={({ pressed }) => [styles.sendBtn, { backgroundColor: input.trim() ? C.label : C.separator }, pressed && { opacity: 0.7 }]}
              hitSlop={8}
            >
              <IconSymbol name="arrow.up" size={14} color={input.trim() ? C.bg : C.secondary} />
            </Pressable>
          </View>
        </View>
      </BottomSheetFooter>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [showMentions, filteredMembers, input, C, insets, send, selectMention]
  );

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={SNAP_POINTS}
      index={0}
      enablePanDownToClose
      enableDynamicSizing={false}
      backdropComponent={renderBackdrop}
      footerComponent={renderFooter}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={{ backgroundColor: C.bg }}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
      android_keyboardInputMode="adjustResize"
    >
      {/* ── Title ── */}
      <View style={[styles.titleBar, { borderBottomColor: C.separator }]}>
        <Image
          source={require('@/assets/nexus-icon.png')}
          style={{ width: 28, height: 28, tintColor: C.label }}
          resizeMode="contain"
        />
      </View>

      {/* ── Messages — paddingBottom reserves space for the footer ── */}
      <BottomSheetScrollView
        contentContainerStyle={[styles.messages, { paddingBottom: FOOTER_BASE_H + Math.max(insets.bottom, 8) + 8 }]}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.role === 'user' ? styles.msgRowUser : styles.msgRowDipson]}>
            {msg.role === 'dipson' && (
              <View style={[styles.dipsonAvatar, { backgroundColor: C.label }]}>
                <Text style={[styles.avatarText, { color: C.bg }]}>D</Text>
              </View>
            )}
            <View style={[styles.bubble, msg.role === 'user'
              ? [styles.bubbleUser,   { backgroundColor: C.label }]
              : [styles.bubbleDipson, { backgroundColor: C.surface }],
            ]}>
              <Text style={[styles.bubbleText, { color: msg.role === 'user' ? C.bg : C.label }]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
        {sending && (
          <View style={[styles.msgRow, styles.msgRowDipson]}>
            <View style={[styles.dipsonAvatar, { backgroundColor: C.label }]}>
              <Text style={[styles.avatarText, { color: C.bg }]}>D</Text>
            </View>
            <View style={[styles.bubble, styles.bubbleDipson, { backgroundColor: C.surface }]}>
              <Text style={{ color: C.secondary, fontSize: 18, letterSpacing: 3 }}>···</Text>
            </View>
          </View>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  handle: { backgroundColor: '#C7C7C7', width: 36, height: 4 },

  titleBar: {
    alignItems: 'center', paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  messages: { padding: 16, gap: 4 },

  msgRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 8 },
  msgRowUser:   { justifyContent: 'flex-end' },
  msgRowDipson: { justifyContent: 'flex-start' },

  dipsonAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText: { fontSize: 11, fontWeight: '800' },

  bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 18 },
  bubbleUser:   { borderBottomRightRadius: 4 },
  bubbleDipson: { borderBottomLeftRadius: 4 },
  bubbleText:   { fontSize: 14, lineHeight: 20 },

  // @mention picker
  mentionPicker: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    maxHeight: 220,
  },
  mentionRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  mentionAvatar: {
    width: 34, height: 34, borderRadius: 17,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  mentionAvatarText: { fontSize: 11, fontWeight: '700' },
  mentionName:  { fontSize: 14, fontWeight: '600' },
  mentionRole:  { fontSize: 12, marginTop: 1 },
  mentionHandle: { fontSize: 12 },

  // Input bar
  inputBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1, height: 36, borderRadius: 20,
    paddingHorizontal: 14, fontSize: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  sendBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
});
