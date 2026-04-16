/**
 * New Message — DM compose screen.
 * Search / select a contact, then type your message.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChatComposer } from '@/components/messages/chat-composer';
import { useAccentColor } from '@/hooks/use-accent-color';
import { BottomSheet } from '@/components/ui/bottom-sheet';

const SCHEDULE_OPTIONS = ['In 30 min', 'Tonight 8 PM', 'Tomorrow 9 AM', 'Monday 9 AM'] as const;

const SUGGESTIONS = [
  { key: 'jd', initials: 'JD', name: 'Jordan Dean',      role: 'CPO',        username: '@jdean',    uri: 'https://i.pravatar.cc/100?img=3'  },
  { key: 'ar', initials: 'AR', name: 'Alex Ramos',       role: 'CTO',        username: '@aramos',   uri: 'https://i.pravatar.cc/100?img=7'  },
  { key: 'vp', initials: 'VP', name: 'Vikram Patel',     role: 'Investor',   username: '@vpatel',   uri: 'https://i.pravatar.cc/100?img=11' },
  { key: 'rc', initials: 'RC', name: 'Rachel Chen',      role: 'Design',     username: '@rchen',    uri: 'https://i.pravatar.cc/100?img=26' },
  { key: 'tm', initials: 'TM', name: 'Tyler Moore',      role: 'Advisor',    username: '@tmoore',   uri: 'https://i.pravatar.cc/100?img=33' },
  { key: 'ct', initials: 'CT', name: 'Coach Thompson',   role: 'Head Coach', username: '@coacht',   uri: 'https://i.pravatar.cc/100?img=15' },
  { key: 'pk', initials: 'PK', name: 'Pastor King',      role: 'Lead Pastor',username: '@pastork',  uri: 'https://i.pravatar.cc/100?img=40' },
];

type Contact = typeof SUGGESTIONS[number];

export default function NewMessageScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [query,        setQuery]        = useState('');
  const [to,           setTo]           = useState<Contact | null>(null);
  const [body,         setBody]         = useState('');
  const [scheduledFor, setScheduledFor] = useState<string | null>(null);
  const [scheduleSheetVisible, setScheduleSheetVisible] = useState(false);

  const filtered = useMemo(() => {
    if (!query) return [];
    const q = query.toLowerCase();
    return SUGGESTIONS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q),
    );
  }, [query]);

  const handleSelect = (c: Contact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTo(c);
    setQuery('');
  };

  const handleSend = () => {
    if (!to || !body.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setScheduledFor(null);
    router.replace({
      pathname: '/(tabs)/(main)/messages/[threadId]',
      params: {
        threadId: `dm-new-${to.key}`,
        type: 'dm',
        title: to.name,
        username: to.username,
        initialBody: body.trim(),
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Nav bar ── */}
      <Animated.View style={[s.nav, { paddingTop: insets.top, opacity }]}>
        <Pressable onPress={() => router.back()} style={s.cancel}>
          <Text style={[s.cancelText, { color: accent }]}>Cancel</Text>
        </Pressable>
        <View style={s.navCenter}>
          <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>New Message</Text>
          </View>
          {scheduledFor && (
            <Text style={[s.scheduledLabel, { color: accent }]}>{scheduledFor}</Text>
          )}
        </View>
        <Pressable
          style={s.clockBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setScheduleSheetVisible(true);
          }}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol
            name="clock"
            size={22}
            color={scheduledFor ? accent : C.muted}
          />
        </Pressable>
        <Pressable
          style={[s.sendBtn, { backgroundColor: to && body.trim() ? accent : C.surfacePressed }]}
          onPress={handleSend}
          disabled={!to || !body.trim()}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: to && body.trim() ? '#fff' : C.muted }}>
            {scheduledFor ? 'Schedule' : 'Send'}
          </Text>
        </Pressable>
      </Animated.View>

      {/* ── To field ── */}
      <View style={[s.toRow, { borderBottomColor: C.separator }]}>
        <Text style={[s.toLabel, { color: C.muted }]}>To:</Text>
        {to ? (
          <Pressable style={[s.chip, { backgroundColor: C.surfacePressed }]} onPress={() => setTo(null)}>
            {to.uri
              ? <Image source={{ uri: to.uri }} style={s.chipAvatar} />
              : <Text style={[s.chipInitials, { color: C.secondary }]}>{to.initials}</Text>}
            <Text style={[s.chipName, { color: C.label }]}>{to.name}</Text>
            <IconSymbol name="xmark" size={10} color={C.muted} />
          </Pressable>
        ) : (
          <TextInput
            style={[s.toInput, { color: C.label }]}
            placeholder="Search people…"
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            autoFocus
            returnKeyType="search"
          />
        )}
      </View>

      {/* ── Contact list ── */}
      {!to && (
        <ScrollView style={s.list} keyboardShouldPersistTaps="handled" onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>
          {filtered.map((c, i) => (
            <Pressable
              key={c.key}
              style={[s.contactRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
              onPress={() => handleSelect(c)}
            >
              <View style={[s.avatar, { backgroundColor: C.surfacePressed }]}>
                {c.uri
                  ? <Image source={{ uri: c.uri }} style={s.avatarImg} />
                  : <Text style={[s.initials, { color: C.secondary }]}>{c.initials}</Text>}
              </View>
              <View style={s.contactInfo}>
                <Text style={[s.contactName, { color: C.label }]} numberOfLines={1}>{c.name}</Text>
                {c.username ? (
                  <Text style={[s.contactRole, { color: C.muted }]} numberOfLines={1}>{c.username}</Text>
                ) : (
                  <Text style={[s.contactRole, { color: C.secondary }]}>{c.role}</Text>
                )}
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {/* ── Spacer (pushes composer to bottom) ── */}
      <View style={s.spacer} />

      {/* ── Composer (only once recipient is chosen) ── */}
      {to && (
        <View style={[s.composer, { paddingBottom: (insets.bottom || 12) + 49, borderTopColor: C.separator }]}>
          <ChatComposer
            value={body}
            onChangeText={setBody}
            onSend={handleSend}
            accent={accent}
          />
        </View>
      )}

      {/* ── Schedule send sheet ── */}
      <BottomSheet
        visible={scheduleSheetVisible}
        onClose={() => setScheduleSheetVisible(false)}
        useModal
        backgroundColor={C.bg}
        title="Schedule send"
      >
        <View style={{ paddingBottom: 24 }}>
          {SCHEDULE_OPTIONS.map((opt, i) => (
            <React.Fragment key={opt}>
              {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 20 }} />}
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 20, paddingVertical: 16,
                  backgroundColor: pressed ? C.surfacePressed : 'transparent',
                })}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setScheduledFor(opt);
                  setScheduleSheetVisible(false);
                }}
              >
                <IconSymbol name="clock.fill" size={18} color={accent} />
                <Text style={{ flex: 1, fontSize: 16, color: C.label, marginLeft: 14 }}>{opt}</Text>
                {scheduledFor === opt && (
                  <IconSymbol name="checkmark" size={16} color={accent} />
                )}
              </Pressable>
            </React.Fragment>
          ))}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1 },
  nav:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  cancel:         { paddingVertical: 4, paddingRight: 8 },
  cancelText:     { fontSize: 16 },
  navCenter:      { flex: 1, alignItems: 'center' },
  navTitle:       { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  scheduledLabel: { fontSize: 11, fontWeight: '500', marginTop: 2 },
  clockBtn:       { padding: 4 },
  sendBtn:        { minWidth: 60, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  toRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, gap: 8 },
  toLabel:      { fontSize: 15, fontWeight: '500', width: 26 },
  toInput:      { flex: 1, fontSize: 15 },
  chip:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  chipAvatar:   { width: 20, height: 20, borderRadius: 10 },
  chipInitials: { fontSize: 11, fontWeight: '600' },
  chipName:     { fontSize: 14, fontWeight: '500' },
  list:         { flex: 1 },
  contactRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg:    { width: 40, height: 40 },
  initials:     { fontSize: 14, fontWeight: '600' },
  contactInfo:  { flex: 1 },
  contactName:  { fontSize: 15, fontWeight: '500' },
  contactRole:  { fontSize: 13 },
  spacer:       { flex: 1 },
  composer:     { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingTop: 6 },
});
