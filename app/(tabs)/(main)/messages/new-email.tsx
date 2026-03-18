/**
 * New Email — compose and send an email.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';

export default function NewEmailScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();

  const [to,      setTo]      = useState('');
  const [subject, setSubject] = useState('');
  const [body,    setBody]    = useState('');

  const canSend = to.trim().length > 0 && subject.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
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
        <Text style={[s.navTitle, { color: C.label }]}>New Email</Text>
        <Pressable
          style={[s.sendBtn, { backgroundColor: canSend ? accent : C.surfacePressed }]}
          onPress={handleSend}
          disabled={!canSend}
        >
          <IconSymbol name="arrow.up" size={16} color={canSend ? '#fff' : C.muted} />
        </Pressable>
      </View>

      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled">
        {/* ── To ── */}
        <View style={[s.fieldRow, { borderBottomColor: C.separator }]}>
          <Text style={[s.fieldLabel, { color: C.muted }]}>To</Text>
          <TextInput
            style={[s.fieldInput, { color: C.label }]}
            placeholder="recipient@email.com"
            placeholderTextColor={C.muted}
            value={to}
            onChangeText={setTo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoFocus
            returnKeyType="next"
          />
        </View>

        {/* ── Subject ── */}
        <View style={[s.fieldRow, { borderBottomColor: C.separator }]}>
          <Text style={[s.fieldLabel, { color: C.muted }]}>Subject</Text>
          <TextInput
            style={[s.fieldInput, { color: C.label }]}
            placeholder="Subject"
            placeholderTextColor={C.muted}
            value={subject}
            onChangeText={setSubject}
            returnKeyType="next"
          />
        </View>

        {/* ── Body ── */}
        <TextInput
          style={[s.body, { color: C.label }]}
          placeholder="Write your message…"
          placeholderTextColor={C.muted}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:       { flex: 1 },
  scroll:     { flex: 1 },
  nav:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  cancel:     { paddingVertical: 4, paddingRight: 8 },
  cancelText: { fontSize: 16 },
  navTitle:   { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  sendBtn:    { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  fieldRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth, gap: 12 },
  fieldLabel: { fontSize: 15, fontWeight: '500', width: 54 },
  fieldInput: { flex: 1, fontSize: 15 },
  body:       { flex: 1, paddingHorizontal: 16, paddingTop: 14, fontSize: 15, lineHeight: 22, minHeight: 300 },
});
