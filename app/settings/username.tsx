import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const TAKEN = ['admin', 'kaynext', 'coachwilliams'];

export default function UsernameScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [handle, setHandle] = useState('');
  const available = handle.length > 2 && !TAKEN.includes(handle.toLowerCase());
  const taken = handle.length > 2 && TAKEN.includes(handle.toLowerCase());

  return (
    <KeyboardAvoidingView
      style={[styles.container, { paddingTop: insets.top }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Username</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.currentHandle, { color: C.label }]}>@coachwilliams</Text>

        <View style={[styles.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[styles.infoText, { color: C.secondary }]}>
            You can change your username once per year. Your old username will be locked for 90 days
            and cannot be claimed by anyone else.
          </Text>
        </View>

        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.inputRow}>
            <Text style={[styles.atSign, { color: C.label }]}>@</Text>
            <TextInput
              style={[styles.input, { color: C.label }]}
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              autoCorrect={false}
              placeholder="new username"
              placeholderTextColor={C.muted}
            />
            {available && <IconSymbol name="checkmark.circle.fill" size={20} color="#34C759" />}
            {taken && <IconSymbol name="xmark.circle.fill" size={20} color="#FF3B30" />}
          </View>
        </View>

        <Text style={[styles.lastChanged, { color: C.muted }]}>Last changed: Never changed.</Text>
      </ScrollView>

      <View style={[styles.saveWrap, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          style={[styles.saveBtn, !available && styles.saveBtnDisabled]}
          disabled={!available}
          onPress={() => router.back()}
        >
          <Text style={styles.saveBtnText}>Save Username</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 24, paddingHorizontal: 16 },
  currentHandle: { fontSize: 28, fontWeight: '700', textAlign: 'center', marginBottom: 20 },
  infoCard: { borderRadius: 14, padding: 16, marginBottom: 20 },
  infoText: { fontSize: 14, lineHeight: 20 },
  group: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 4,
  },
  atSign: { fontSize: 17, fontWeight: '500' },
  input: { flex: 1, fontSize: 17 },
  lastChanged: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  saveWrap: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: '#F6F6F6' },
  saveBtn: { backgroundColor: '#111111', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#C7C7CC' },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});
