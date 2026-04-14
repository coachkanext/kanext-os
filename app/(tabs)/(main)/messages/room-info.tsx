/**
 * Room Info — tap room name/icon in thread header to open.
 * Shows: icon (editable), name (editable admin), description (editable admin),
 * members, pinned messages, notifications toggle, Leave Room, Delete Room (admin).
 * RBAC controls edit permissions.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Image,
  Switch,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';
import { BottomSheet } from '@/components/ui/bottom-sheet';

// ── RBAC ─────────────────────────────────────────────────────────────────────

const ADMIN_ROLES = [
  'System Owner', 'Head Coach', 'Lead Pastor', 'Administrator',
  'Admin', 'CEO', 'CPO', 'CTO', 'Director', 'Owner', 'Coach',
  'Pastor', 'Manager', 'Coordinator',
];

function isAdmin(roleBadge: string): boolean {
  if (!roleBadge) return false;
  const r = roleBadge.toLowerCase();
  return ADMIN_ROLES.some(role => r.includes(role.toLowerCase()));
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const ROOM_ICONS = [
  { name: 'number',            label: 'Channel'  },
  { name: 'megaphone.fill',    label: 'Announce' },
  { name: 'sportscourt.fill',  label: 'Court'    },
  { name: 'figure.run',        label: 'Training' },
  { name: 'trophy.fill',       label: 'Trophy'   },
  { name: 'book.fill',         label: 'Study'    },
  { name: 'music.note',        label: 'Music'    },
  { name: 'camera.fill',       label: 'Media'    },
  { name: 'briefcase.fill',    label: 'Business' },
  { name: 'heart.fill',        label: 'Community'},
  { name: 'star.fill',         label: 'Featured' },
  { name: 'lock.fill',         label: 'Private'  },
];

const MOCK_MEMBERS = [
  { key: 'me', initials: 'ME', name: 'You',             username: '@me',     role: 'Owner',      uri: '' },
  { key: 'jd', initials: 'JD', name: 'Jordan Dean',     username: '@jdean',  role: 'CPO',        uri: 'https://i.pravatar.cc/100?img=3'  },
  { key: 'ar', initials: 'AR', name: 'Alex Ramos',      username: '@aramos', role: 'CTO',        uri: 'https://i.pravatar.cc/100?img=7'  },
  { key: 'vp', initials: 'VP', name: 'Vikram Patel',    username: '@vpatel', role: 'Investor',   uri: 'https://i.pravatar.cc/100?img=11' },
  { key: 'rc', initials: 'RC', name: 'Rachel Chen',     username: '@rchen',  role: 'Design',     uri: 'https://i.pravatar.cc/100?img=26' },
  { key: 'tm', initials: 'TM', name: 'Tyler Moore',     username: '@tmoore', role: 'Advisor',    uri: 'https://i.pravatar.cc/100?img=33' },
];

const MOCK_PINNED = [
  { id: 'p1', sender: 'Jordan Dean', content: 'Practice moved to 4 PM tomorrow — don\'t forget!', time: '2h ago' },
  { id: 'p2', sender: 'Alex Ramos',  content: 'Q2 report is uploaded to the shared drive.',       time: 'Yesterday' },
];

// ── Screen ────────────────────────────────────────────────────────────────────

export default function RoomInfoScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const accent = useAccentColor();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const { state } = useAppContext();

  const { threadId, title: routeTitle, memberCount } = useLocalSearchParams<{
    threadId: string;
    title: string;
    memberCount: string;
  }>();

  const roleBadge = state.activeView?.derived_role_badge ?? state.activeContext.derived_role_badge ?? '';
  const admin = isAdmin(roleBadge);

  const initials = (routeTitle ?? '').substring(0, 2).toUpperCase();

  const [roomIcon,      setRoomIcon]      = useState('number');
  const [name,          setName]          = useState(routeTitle ?? '');
  const [description,   setDescription]   = useState('Team communication and updates.');
  const [editingName,   setEditingName]   = useState(false);
  const [editingDesc,   setEditingDesc]   = useState(false);
  const [notifOn,       setNotifOn]       = useState(true);
  const [iconSheet,     setIconSheet]     = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const displayCount = parseInt(memberCount ?? '0', 10) || MOCK_MEMBERS.length;
  const visibleMembers = showAllMembers ? MOCK_MEMBERS : MOCK_MEMBERS.slice(0, 4);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Nav bar ── */}
      <Animated.View style={[s.nav, { paddingTop: insets.top, opacity }]}>
        <Pressable
          style={s.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[s.backBubble, { backgroundColor: C.surfacePressed }]}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </View>
        </Pressable>
        <Text style={[s.navTitle, { color: C.label }]}>Room Info</Text>
        <View style={{ width: 40 }} />
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >

        {/* ── Hero: icon + name + description ── */}
        <View style={s.heroSection}>
          {/* Icon */}
          <Pressable
            style={[s.heroIcon, { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              if (!admin) return;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIconSheet(true);
            }}
            disabled={!admin}
          >
            <IconSymbol name={roomIcon as any} size={32} color={accent} />
            {admin && (
              <View style={[s.editBadge, { backgroundColor: accent }]}>
                <IconSymbol name="pencil" size={9} color="#fff" />
              </View>
            )}
          </Pressable>

          {/* Name */}
          {editingName && admin ? (
            <TextInput
              style={[s.heroNameInput, { color: C.label, borderBottomColor: accent }]}
              value={name}
              onChangeText={setName}
              autoFocus
              onBlur={() => setEditingName(false)}
              returnKeyType="done"
              onSubmitEditing={() => setEditingName(false)}
            />
          ) : (
            <Pressable onPress={() => admin && setEditingName(true)} disabled={!admin}>
              <Text style={[s.heroName, { color: C.label }]}>{name}</Text>
            </Pressable>
          )}

          <Text style={[s.heroMeta, { color: C.muted }]}>{displayCount} members</Text>

          {/* Description */}
          {editingDesc && admin ? (
            <TextInput
              style={[s.heroDescInput, { color: C.secondary, borderColor: C.separator }]}
              value={description}
              onChangeText={setDescription}
              autoFocus
              multiline
              onBlur={() => setEditingDesc(false)}
              returnKeyType="done"
            />
          ) : (
            <Pressable onPress={() => admin && setEditingDesc(true)} disabled={!admin}>
              <Text style={[s.heroDesc, { color: C.secondary }]}>
                {description || (admin ? 'Add a description…' : '')}
              </Text>
            </Pressable>
          )}
          {admin && !editingDesc && (
            <Text style={[s.editHint, { color: C.muted }]}>Tap to edit</Text>
          )}
        </View>

        {/* ── Notifications ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.cardRow}>
            <IconSymbol name="bell.fill" size={16} color={C.label} />
            <Text style={[s.cardRowLabel, { color: C.label }]}>Notifications</Text>
            <Switch
              value={notifOn}
              onValueChange={(v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setNotifOn(v); }}
              trackColor={{ false: C.separator, true: accent }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* ── Members ── */}
        <Text style={[s.sectionLabel, { color: C.muted }]}>MEMBERS</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {visibleMembers.map((m, i) => (
            <View
              key={m.key}
              style={[
                s.memberRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <View style={[s.memberAvatar, { backgroundColor: C.surfacePressed }]}>
                {m.uri
                  ? <Image source={{ uri: m.uri }} style={s.memberAvatarImg} />
                  : <Text style={[s.memberInitials, { color: C.secondary }]}>{m.initials}</Text>}
              </View>
              <View style={s.memberInfo}>
                <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.memberHandle, { color: C.muted }]}>{m.username}</Text>
              </View>
              <Text style={[s.memberRole, { color: C.secondary }]}>{m.role}</Text>
            </View>
          ))}

          {MOCK_MEMBERS.length > 4 && (
            <Pressable
              style={[s.showMoreRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAllMembers(v => !v); }}
            >
              <Text style={[s.showMoreText, { color: accent }]}>
                {showAllMembers ? 'Show less' : `Show all ${displayCount} members`}
              </Text>
              <IconSymbol name={showAllMembers ? 'chevron.up' : 'chevron.down'} size={13} color={accent} />
            </Pressable>
          )}
        </View>

        {/* ── Pinned messages ── */}
        <Text style={[s.sectionLabel, { color: C.muted }]}>PINNED MESSAGES</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {MOCK_PINNED.map((p, i) => (
            <View
              key={p.id}
              style={[
                s.pinnedRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
              ]}
            >
              <View style={[s.pinIcon, { backgroundColor: accent + '22' }]}>
                <IconSymbol name="pin.fill" size={12} color={accent} />
              </View>
              <View style={s.pinnedInfo}>
                <Text style={[s.pinnedSender, { color: C.label }]}>{p.sender}</Text>
                <Text style={[s.pinnedContent, { color: C.secondary }]} numberOfLines={2}>{p.content}</Text>
              </View>
              <Text style={[s.pinnedTime, { color: C.muted }]}>{p.time}</Text>
            </View>
          ))}
        </View>

        {/* ── Actions ── */}
        <View style={[s.card, { backgroundColor: C.surface, marginTop: 24 }]}>
          <Pressable
            style={s.actionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              Alert.alert('Leave Room', `Leave "${name}"?`, [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Leave', style: 'destructive', onPress: () => router.back() },
              ]);
            }}
          >
            <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color={C.red} />
            <Text style={[s.actionLabel, { color: C.red }]}>Leave Room</Text>
          </Pressable>

          {admin && (
            <Pressable
              style={[s.actionRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert('Delete Room', `Permanently delete "${name}"? This cannot be undone.`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => router.back() },
                ]);
              }}
            >
              <IconSymbol name="trash.fill" size={18} color={C.red} />
              <Text style={[s.actionLabel, { color: C.red }]}>Delete Room</Text>
            </Pressable>
          )}
        </View>

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
                style={[s.iconCell, {
                  backgroundColor: active ? accent + '22' : C.surfacePressed,
                  borderColor: active ? accent : 'transparent',
                }]}
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
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:       { flex: 1 },

  // Nav
  nav: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  backBtn:    { width: 40 },
  backBubble: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  navTitle:   { fontSize: 17, fontWeight: '600' },

  // Hero
  heroSection: { alignItems: 'center', paddingTop: 24, paddingBottom: 20, paddingHorizontal: 20, gap: 6 },
  heroIcon: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  editBadge: {
    position: 'absolute', bottom: -4, right: -4,
    width: 20, height: 20, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  heroName:       { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  heroNameInput:  { fontSize: 22, fontWeight: '700', textAlign: 'center', borderBottomWidth: 1.5, paddingBottom: 2, minWidth: 200 },
  heroMeta:       { fontSize: 13 },
  heroDesc:       { fontSize: 14, textAlign: 'center', lineHeight: 20, marginTop: 2 },
  heroDescInput:  { fontSize: 14, textAlign: 'center', lineHeight: 20, borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, padding: 8, marginTop: 2, minWidth: 260 },
  editHint:       { fontSize: 11, marginTop: 2 },

  // Card
  card: { marginHorizontal: 16, borderRadius: 16, marginBottom: 8, overflow: 'hidden' },
  cardRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  cardRowLabel: { flex: 1, fontSize: 15 },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginTop: 16, marginBottom: 8, paddingHorizontal: 16 },

  // Members
  memberRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 12 },
  memberAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  memberAvatarImg: { width: 38, height: 38 },
  memberInitials: { fontSize: 13, fontWeight: '600' },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: '500' },
  memberHandle: { fontSize: 12 },
  memberRole: { fontSize: 12 },
  showMoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13 },
  showMoreText: { fontSize: 14, fontWeight: '500' },

  // Pinned
  pinnedRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  pinIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 },
  pinnedInfo: { flex: 1 },
  pinnedSender: { fontSize: 13, fontWeight: '600', marginBottom: 2 },
  pinnedContent: { fontSize: 13, lineHeight: 18 },
  pinnedTime: { fontSize: 11, marginTop: 2 },

  // Actions
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, gap: 12 },
  actionLabel: { fontSize: 15, fontWeight: '500' },

  // Icon grid
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingBottom: 24, gap: 10 },
  iconCell: { width: '22%', aspectRatio: 1, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', gap: 4 },
  iconLabel: { fontSize: 10, fontWeight: '500' },
});
