/**
 * New Room — create a room with name, description, icon, and members.
 * RBAC: only System Owner / admin-tier roles can create rooms.
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
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';
import { BottomSheet } from '@/components/ui/bottom-sheet';

// ── RBAC ─────────────────────────────────────────────────────────────────────

const ROOM_CREATOR_ROLES = [
  'System Owner', 'Head Coach', 'Lead Pastor', 'Administrator',
  'Admin', 'CEO', 'CPO', 'CTO', 'Director', 'Owner', 'Coach',
  'Pastor', 'Manager', 'Coordinator',
];

function canCreateRoom(roleBadge: string): boolean {
  if (!roleBadge) return false;
  const r = roleBadge.toLowerCase();
  return ROOM_CREATOR_ROLES.some(role => r.includes(role.toLowerCase()));
}

// ── Data ─────────────────────────────────────────────────────────────────────

const ROOM_ICONS: Array<{ name: string; label: string }> = [
  { name: 'number',               label: 'Channel'   },
  { name: 'megaphone.fill',       label: 'Announce'  },
  { name: 'sportscourt.fill',     label: 'Court'     },
  { name: 'figure.run',           label: 'Training'  },
  { name: 'trophy.fill',          label: 'Trophy'    },
  { name: 'book.fill',            label: 'Study'     },
  { name: 'music.note',           label: 'Music'     },
  { name: 'camera.fill',          label: 'Media'     },
  { name: 'briefcase.fill',       label: 'Business'  },
  { name: 'heart.fill',           label: 'Community' },
  { name: 'star.fill',            label: 'Featured'  },
  { name: 'lock.fill',            label: 'Private'   },
];

const MEMBERS_LIST = [
  { key: 'jd', initials: 'JD', name: 'Jordan Dean',    role: 'CPO',        username: '@jdean',  uri: 'https://i.pravatar.cc/100?img=3'  },
  { key: 'ar', initials: 'AR', name: 'Alex Ramos',     role: 'CTO',        username: '@aramos', uri: 'https://i.pravatar.cc/100?img=7'  },
  { key: 'vp', initials: 'VP', name: 'Vikram Patel',   role: 'Investor',   username: '@vpatel', uri: 'https://i.pravatar.cc/100?img=11' },
  { key: 'rc', initials: 'RC', name: 'Rachel Chen',    role: 'Design',     username: '@rchen',  uri: 'https://i.pravatar.cc/100?img=26' },
  { key: 'tm', initials: 'TM', name: 'Tyler Moore',    role: 'Advisor',    username: '@tmoore', uri: 'https://i.pravatar.cc/100?img=33' },
  { key: 'ct', initials: 'CT', name: 'Coach Thompson', role: 'Head Coach', username: '@coacht', uri: 'https://i.pravatar.cc/100?img=15' },
];

type Member = typeof MEMBERS_LIST[number];

// ── Screen ───────────────────────────────────────────────────────────────────

export default function NewChannelScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();
  const { state } = useAppContext();

  const roleBadge = state.activeView?.derived_role_badge ?? state.activeContext.derived_role_badge ?? '';
  const hasPermission = canCreateRoom(roleBadge);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [roomIcon,    setRoomIcon]    = useState('number');
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [query,       setQuery]       = useState('');
  const [selected,    setSelected]    = useState<Set<string>>(new Set());
  const [iconSheet,   setIconSheet]   = useState(false);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return MEMBERS_LIST;
    return MEMBERS_LIST.filter(
      m => m.name.toLowerCase().includes(q) || m.username.toLowerCase().includes(q),
    );
  }, [query]);

  const selectedMembers = useMemo(
    () => MEMBERS_LIST.filter(m => selected.has(m.key)),
    [selected],
  );

  const toggle = (m: Member) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(prev => {
      const next = new Set(prev);
      next.has(m.key) ? next.delete(m.key) : next.add(m.key);
      return next;
    });
  };

  const canCreate = hasPermission && name.trim().length > 0 && selected.size > 0;

  const handleCreate = () => {
    if (!canCreate) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const roomId = `room-new-${Date.now()}`;
    router.replace({
      pathname: '/(tabs)/(main)/messages/[threadId]',
      params: {
        threadId: roomId,
        type: 'channel',
        title: name.trim(),
        memberCount: String(selected.size),
      },
    });
  };

  // ── RBAC gate ──
  if (!hasPermission) {
    return (
      <View style={[s.root, { backgroundColor: C.bg }]}>
        <Animated.View style={[s.nav, { paddingTop: insets.top, opacity }]}>
          <Pressable onPress={() => router.back()} style={s.cancel}>
            <Text style={[s.cancelText, { color: accent }]}>Cancel</Text>
          </Pressable>
          <Text style={[s.navTitle, { color: C.label }]}>New Room</Text>
          <View style={s.createBtn} />
        </Animated.View>
        <View style={s.rbacWrap}>
          <View style={[s.rbacIcon, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="lock.fill" size={28} color={C.muted} />
          </View>
          <Text style={[s.rbacTitle, { color: C.label }]}>Permission Required</Text>
          <Text style={[s.rbacSub, { color: C.secondary }]}>
            Only administrators and team leads can create rooms.{'\n'}
            Your current role: <Text style={{ fontWeight: '600' }}>{roleBadge || 'Member'}</Text>
          </Text>
        </View>
      </View>
    );
  }

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
        <Text style={[s.navTitle, { color: C.label }]}>New Room</Text>
        <Pressable
          style={[s.createBtn, { backgroundColor: canCreate ? accent : C.surfacePressed }]}
          onPress={handleCreate}
          disabled={!canCreate}
        >
          <Text style={[s.createText, { color: canCreate ? '#fff' : C.muted }]}>Create</Text>
        </Pressable>
      </Animated.View>

      <ScrollView keyboardShouldPersistTaps="handled" style={s.scroll} onScroll={onScroll} scrollEventThrottle={scrollEventThrottle}>

        {/* ── Room identity ── */}
        <View style={[s.identityCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
          {/* Icon picker button */}
          <Pressable
            style={[s.iconBtn, { backgroundColor: C.surfacePressed }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIconSheet(true); }}
          >
            <IconSymbol name={roomIcon as any} size={22} color={accent} />
          </Pressable>

          <View style={s.identityFields}>
            {/* Room name */}
            <TextInput
              style={[s.nameInput, { color: C.label, borderBottomColor: C.separator }]}
              placeholder="Room name"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
              autoCapitalize="none"
              autoFocus
              returnKeyType="next"
            />
            {/* Description */}
            <TextInput
              style={[s.descInput, { color: C.label }]}
              placeholder="Description (optional)"
              placeholderTextColor={C.muted}
              value={description}
              onChangeText={setDescription}
              returnKeyType="done"
            />
          </View>
        </View>

        {/* ── Selected pills ── */}
        {selectedMembers.length > 0 && (
          <View style={s.pillsWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
              {selectedMembers.map(m => (
                <Pressable
                  key={m.key}
                  style={[s.pill, { backgroundColor: C.surfacePressed }]}
                  onPress={() => toggle(m)}
                >
                  {m.uri
                    ? <Image source={{ uri: m.uri }} style={s.pillAvatar} />
                    : <Text style={[s.pillInitials, { color: C.secondary }]}>{m.initials}</Text>}
                  <Text style={[s.pillName, { color: C.label }]} numberOfLines={1}>{m.name.split(' ')[0]}</Text>
                  <IconSymbol name="xmark" size={9} color={C.muted} />
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Add members ── */}
        <Text style={[s.sectionLabel, { color: C.muted }]}>ADD MEMBERS</Text>

        {/* Search */}
        <View style={[s.searchRow, { borderColor: C.separator, backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.muted} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search by name or @handle…"
            placeholderTextColor={C.muted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
            </Pressable>
          )}
        </View>

        {/* Member rows */}
        {filtered.length === 0 ? (
          <View style={s.emptySearch}>
            <Text style={[s.emptySearchText, { color: C.muted }]}>No results for "{query}"</Text>
          </View>
        ) : (
          filtered.map((m, i) => {
            const on = selected.has(m.key);
            return (
              <Pressable
                key={m.key}
                style={[
                  s.memberRow,
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                ]}
                onPress={() => toggle(m)}
              >
                <View style={[s.avatar, { backgroundColor: C.surfacePressed }]}>
                  {m.uri
                    ? <Image source={{ uri: m.uri }} style={s.avatarImg} />
                    : <Text style={[s.initials, { color: C.secondary }]}>{m.initials}</Text>}
                </View>
                <View style={s.info}>
                  <Text style={[s.memberName, { color: C.label }]} numberOfLines={1}>{m.name}</Text>
                  <Text style={[s.memberHandle, { color: C.muted }]} numberOfLines={1}>{m.username}</Text>
                </View>
                {/* Checkbox */}
                <View style={[s.check, {
                  backgroundColor: on ? accent : 'transparent',
                  borderColor: on ? accent : C.separator,
                }]}>
                  {on && <IconSymbol name="checkmark" size={12} color="#fff" />}
                </View>
              </Pressable>
            );
          })
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── Icon picker sheet ── */}
      <BottomSheet
        visible={iconSheet}
        onClose={() => setIconSheet(false)}
        useModal
        backgroundColor={C.bg}
        title="Room Icon"
      >
        <View style={s.iconGrid}>
          {ROOM_ICONS.map(ic => {
            const active = roomIcon === ic.name;
            return (
              <Pressable
                key={ic.name}
                style={[s.iconCell, { backgroundColor: active ? accent + '22' : C.surfacePressed, borderColor: active ? accent : 'transparent' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setRoomIcon(ic.name);
                  setIconSheet(false);
                }}
              >
                <IconSymbol name={ic.name as any} size={24} color={active ? accent : C.secondary} />
                <Text style={[s.iconLabel, { color: active ? accent : C.secondary }]}>{ic.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </KeyboardAvoidingView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:         { flex: 1 },
  scroll:       { flex: 1 },

  // Nav
  nav:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  cancel:       { paddingVertical: 4, paddingRight: 4, minWidth: 60 },
  cancelText:   { fontSize: 16 },
  navTitle:     { flex: 1, fontSize: 17, fontWeight: '600', textAlign: 'center' },
  createBtn:    { minWidth: 60, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, alignItems: 'center' },
  createText:   { fontSize: 14, fontWeight: '600' },

  // Identity card
  identityCard: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    marginHorizontal: 16, marginTop: 8, marginBottom: 4,
    padding: 14, borderRadius: 16, borderWidth: StyleSheet.hairlineWidth,
  },
  iconBtn: {
    width: 48, height: 48, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  identityFields: { flex: 1, gap: 0 },
  nameInput:    { fontSize: 16, fontWeight: '500', paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  descInput:    { fontSize: 14, paddingVertical: 6, color: '#888' },

  // Pills
  pillsWrap:    { marginTop: 12, marginBottom: 4 },
  pillsRow:     { paddingHorizontal: 16, gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingLeft: 6, paddingRight: 10, paddingVertical: 5, borderRadius: 20,
  },
  pillAvatar:   { width: 22, height: 22, borderRadius: 11 },
  pillInitials: { fontSize: 10, fontWeight: '600', width: 22, height: 22, textAlign: 'center', lineHeight: 22 },
  pillName:     { fontSize: 13, fontWeight: '500', maxWidth: 80 },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginTop: 20, marginBottom: 8, paddingHorizontal: 16 },

  // Search
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 16, marginBottom: 4,
    paddingHorizontal: 12, paddingVertical: 10,
    borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput:  { flex: 1, fontSize: 15 },

  // Empty
  emptySearch:      { paddingHorizontal: 16, paddingVertical: 24, alignItems: 'center' },
  emptySearchText:  { fontSize: 14 },

  // Member row
  memberRow:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg:    { width: 40, height: 40 },
  initials:     { fontSize: 14, fontWeight: '600' },
  info:         { flex: 1 },
  memberName:   { fontSize: 15, fontWeight: '500' },
  memberHandle: { fontSize: 13 },
  check:        { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },

  // Icon grid
  iconGrid:     { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  iconCell: {
    width: '22%', aspectRatio: 1, borderRadius: 14, borderWidth: 1.5,
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  iconLabel:    { fontSize: 10, fontWeight: '500' },

  // RBAC gate
  rbacWrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 12 },
  rbacIcon:     { width: 72, height: 72, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  rbacTitle:    { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  rbacSub:      { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
