/**
 * New Room — create a room with a name and optional members.
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
import { useAccentColor } from '@/hooks/use-accent-color';

const MEMBERS_LIST = [
  { key: 'jd', initials: 'JD', name: 'J. Dean',    role: 'CPO',        uri: 'https://i.pravatar.cc/100?img=3'  },
  { key: 'ar', initials: 'AR', name: 'A. Ramos',   role: 'CTO',        uri: 'https://i.pravatar.cc/100?img=7'  },
  { key: 'vp', initials: 'VP', name: 'V. Patel',   role: 'Investor',   uri: 'https://i.pravatar.cc/100?img=11' },
  { key: 'rc', initials: 'RC', name: 'R. Chen',    role: 'Design',     uri: 'https://i.pravatar.cc/100?img=26' },
  { key: 'tm', initials: 'TM', name: 'T. Moore',   role: 'Advisor',    uri: 'https://i.pravatar.cc/100?img=33' },
  { key: 'ct', initials: 'CT', name: 'Coach T.',   role: 'Head Coach', uri: 'https://i.pravatar.cc/100?img=15' },
];

type Member = typeof MEMBERS_LIST[number];

export default function NewChannelScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();

  const [name,     setName]     = useState('');
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    if (!query) return MEMBERS_LIST;
    const q = query.toLowerCase();
    return MEMBERS_LIST.filter(
      (m) => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q),
    );
  }, [query]);

  const toggle = (m: Member) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(m.key) ? next.delete(m.key) : next.add(m.key);
      return next;
    });
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.back();
  };

  const canCreate = name.trim().length > 0;

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
        <Text style={[s.navTitle, { color: C.label }]}>New Room</Text>
        <Pressable
          style={[s.createBtn, { backgroundColor: canCreate ? accent : C.surfacePressed }]}
          onPress={handleCreate}
          disabled={!canCreate}
        >
          <Text style={[s.createText, { color: canCreate ? '#fff' : C.muted }]}>Create</Text>
        </Pressable>
      </View>

      <ScrollView keyboardShouldPersistTaps="handled" style={s.scroll}>
        {/* ── Room name ── */}
        <View style={[s.section, { borderBottomColor: C.separator }]}>
          <View style={[s.nameRow, { borderColor: C.separator }]}>
            <IconSymbol name="number" size={18} color={C.muted} />
            <TextInput
              style={[s.nameInput, { color: C.label }]}
              placeholder="Room name"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoFocus
              returnKeyType="next"
            />
          </View>
        </View>

        {/* ── Add members ── */}
        <Text style={[s.sectionLabel, { color: C.muted }]}>ADD MEMBERS</Text>
        <View style={[s.searchRow, { borderBottomColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search people…"
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {filtered.map((m, i) => {
          const on = selected.has(m.key);
          return (
            <Pressable
              key={m.key}
              style={[s.memberRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
              onPress={() => toggle(m)}
            >
              <View style={[s.avatar, { backgroundColor: C.surfacePressed }]}>
                {m.uri
                  ? <Image source={{ uri: m.uri }} style={s.avatarImg} />
                  : <Text style={[s.initials, { color: C.secondary }]}>{m.initials}</Text>}
              </View>
              <View style={s.info}>
                <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.memberRole, { color: C.secondary }]}>{m.role}</Text>
              </View>
              <View style={[s.check, { backgroundColor: on ? accent : 'transparent', borderColor: on ? accent : C.separator }]}>
                {on && <IconSymbol name="checkmark" size={12} color="#fff" />}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flex: 1 },
  nav:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  cancel:       { paddingVertical: 4, paddingRight: 8 },
  cancelText:   { fontSize: 16 },
  navTitle:     { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  createBtn:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  createText:   { fontSize: 14, fontWeight: '600' },
  section:      { paddingHorizontal: 16, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth },
  nameRow:      { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12 },
  nameInput:    { flex: 1, fontSize: 16 },
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, paddingHorizontal: 16 },
  searchRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  searchInput:  { flex: 1, fontSize: 15 },
  memberRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg:    { width: 40, height: 40 },
  initials:     { fontSize: 14, fontWeight: '600' },
  info:         { flex: 1 },
  memberName:   { fontSize: 15, fontWeight: '500' },
  memberRole:   { fontSize: 13 },
  check:        { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
});
