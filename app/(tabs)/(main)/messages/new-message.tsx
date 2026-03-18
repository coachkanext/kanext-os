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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ChatComposer } from '@/components/messages/chat-composer';
import { useAccentColor } from '@/hooks/use-accent-color';

const SUGGESTIONS = [
  { key: 'jd', initials: 'JD', name: 'J. Dean',     role: 'CPO',       uri: 'https://i.pravatar.cc/100?img=3'  },
  { key: 'ar', initials: 'AR', name: 'A. Ramos',    role: 'CTO',       uri: 'https://i.pravatar.cc/100?img=7'  },
  { key: 'vp', initials: 'VP', name: 'V. Patel',    role: 'Investor',  uri: 'https://i.pravatar.cc/100?img=11' },
  { key: 'rc', initials: 'RC', name: 'R. Chen',     role: 'Design',    uri: 'https://i.pravatar.cc/100?img=26' },
  { key: 'tm', initials: 'TM', name: 'T. Moore',    role: 'Advisor',   uri: 'https://i.pravatar.cc/100?img=33' },
  { key: 'ct', initials: 'CT', name: 'Coach T.',    role: 'Head Coach',uri: 'https://i.pravatar.cc/100?img=15' },
  { key: 'pk', initials: 'PK', name: 'Pastor K.',   role: 'Lead Pastor',uri:'https://i.pravatar.cc/100?img=40' },
];

type Contact = typeof SUGGESTIONS[number];

export default function NewMessageScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();

  const [query,    setQuery]    = useState('');
  const [to,       setTo]       = useState<Contact | null>(null);
  const [body,     setBody]     = useState('');

  const filtered = useMemo(() => {
    if (!query) return SUGGESTIONS;
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
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={[s.root, { backgroundColor: C.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* ── Nav bar ── */}
      <View style={[s.nav, { paddingTop: insets.top }]}>
        <Pressable onPress={() => router.back()} style={s.cancel}>
          <Text style={[s.cancelText, { color: accent }]}>Cancel</Text>
        </Pressable>
        <Text style={[s.navTitle, { color: C.label }]}>New Message</Text>
        <Pressable
          style={[s.sendBtn, { backgroundColor: to && body.trim() ? accent : C.surfacePressed }]}
          onPress={handleSend}
          disabled={!to || !body.trim()}
        >
          <IconSymbol name="arrow.up" size={16} color={to && body.trim() ? '#fff' : C.muted} />
        </Pressable>
      </View>

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
        <ScrollView style={s.list} keyboardShouldPersistTaps="handled">
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
                <Text style={[s.contactName, { color: C.label }]}>{c.name}</Text>
                <Text style={[s.contactRole, { color: C.secondary }]}>{c.role}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      )}

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
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1 },
  nav:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  cancel:       { paddingVertical: 4, paddingRight: 8 },
  cancelText:   { fontSize: 16 },
  navTitle:     { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  sendBtn:      { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
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
  composer:     { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingTop: 6 },
});
