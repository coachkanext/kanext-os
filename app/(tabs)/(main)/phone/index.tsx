/**
 * Phone — Contacts landing screen.
 * Searchable, organized by mode. Tap = popup, long press = add to favorites.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  PHONE_CONTACTS,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  type PhoneContact,
} from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
};

function ContactPopup({
  visible,
  contact,
  onClose,
  accent,
}: {
  visible: boolean;
  contact: PhoneContact | null;
  onClose: () => void;
  accent: string;
}) {
  if (!visible || !contact) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          <View style={popupStyles.header}>
            <View style={popupStyles.avatar}>
              <Text style={popupStyles.initials}>{contact.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={popupStyles.name}>{contact.name}</Text>
              <Text style={popupStyles.role}>{contact.role}</Text>
            </View>
          </View>
          <View style={popupStyles.divider} />
          {[
            { icon: 'phone.fill', label: 'Audio Call', color: '#34D399', onPress: () => { initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: 'audio' }); onClose(); } },
            { icon: 'video.fill', label: 'Video Call', color: '#34D399', onPress: () => { initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: 'video' }); onClose(); } },
            { icon: 'bubble.left.fill', label: 'Message', color: accent, onPress: onClose },
            { icon: 'person.circle', label: 'View Profile', color: C.secondary, onPress: onClose },
          ].map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [popupStyles.row, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
              onPress={a.onPress}
            >
              <IconSymbol name={a.icon as any} size={18} color={a.color} />
              <Text style={[popupStyles.rowLabel, { color: a.color }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const [search, setSearch] = useState('');
  const [popup, setPopup] = useState<PhoneContact | null>(null);

  const contacts = useMemo(() => {
    if (!search.trim()) return PHONE_CONTACTS;
    const q = search.toLowerCase();
    return PHONE_CONTACTS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Phone</Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {contacts.map((contact) => {
          const badgeColor = MODE_BADGE_COLORS[contact.mode];
          return (
            <Pressable
              key={contact.id}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPopup(contact);
              }}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              delayLongPress={400}
            >
              <View style={styles.avatar}>
                <Text style={styles.initials}>{contact.initials}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.nameRow}>
                  <Text style={styles.name} numberOfLines={1}>{contact.name}</Text>
                  {contact.isFavorite && <IconSymbol name="star.fill" size={10} color="#F59E0B" />}
                </View>
                <View style={styles.meta}>
                  <Text style={styles.username}>{contact.username}</Text>
                  <View style={[styles.badge, { backgroundColor: badgeColor + '22' }]}>
                    <Text style={[styles.badgeText, { color: badgeColor }]}>{MODE_BADGE_LABELS[contact.mode]}</Text>
                  </View>
                </View>
              </View>
              <Text style={styles.role}>{contact.role}</Text>
            </Pressable>
          );
        })}
        {contacts.length === 0 && (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No contacts found</Text>
          </View>
        )}
      </ScrollView>

      <ContactPopup visible={popup !== null} contact={popup} onClose={() => setPopup(null)} accent={accent} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: 10, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 12, height: 38, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.label, padding: 0 },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  name: { fontSize: 16, fontWeight: '600', color: C.label, flexShrink: 1 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  username: { fontSize: 13, color: C.muted },
  badge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  role: { fontSize: 12, color: C.muted },
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyText: { fontSize: 16, color: C.muted },
});

const popupStyles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { width: '80%', maxWidth: 320, backgroundColor: '#0B0F14', borderRadius: 16, padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  name: { fontSize: 16, fontWeight: '600', color: C.label },
  role: { fontSize: 13, color: C.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8 },
  rowLabel: { fontSize: 15, fontWeight: '500' },
});
