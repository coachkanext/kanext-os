/**
 * Favorites — Pinned contacts. Tap = call. Long press = remove.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  getFavoriteContacts,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  type PhoneContact,
} from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const TOP_BAR_H = 56;

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [favorites] = useState(getFavoriteContacts);

  const handleCall = useCallback((contact: PhoneContact) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({
      contactName: contact.name,
      contactInitials: contact.initials,
      mode: contact.mode,
      type: 'audio',
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Favorites</Text>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={styles.list}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {favorites.map((contact) => {
          const badgeColor = MODE_BADGE_COLORS[contact.mode];
          return (
            <Pressable
              key={contact.id}
              style={({ pressed }) => [styles.row, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
              onPress={() => handleCall(contact)}
              onLongPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                // Remove from favorites placeholder
              }}
              delayLongPress={400}
            >
              <View style={styles.avatar}>
                <Text style={styles.initials}>{contact.initials}</Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{contact.name}</Text>
                <View style={styles.meta}>
                  <Text style={styles.username}>{contact.username}</Text>
                  <View style={[styles.badge, { backgroundColor: badgeColor + '22' }]}>
                    <Text style={[styles.badgeText, { color: badgeColor }]}>{MODE_BADGE_LABELS[contact.mode]}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.callBtns}>
                <Pressable
                  hitSlop={8}
                  onPress={() => handleCall(contact)}
                >
                  <IconSymbol name="phone.fill" size={18} color={accent} />
                </Pressable>
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    initiateCall({ contactName: contact.name, contactInitials: contact.initials, mode: contact.mode, type: 'video' });
                  }}
                >
                  <IconSymbol name="video.fill" size={18} color={accent} />
                </Pressable>
              </View>
            </Pressable>
          );
        })}

        {favorites.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="star.fill" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptyHint}>Long press a contact to add them</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingBottom: 12, paddingTop: 8 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 15, fontWeight: '700', color: C.secondary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: C.label },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 },
  username: { fontSize: 13, color: C.muted },
  badge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  callBtns: { flexDirection: 'row', gap: 16 },
  empty: { alignItems: 'center', paddingTop: 120, gap: 10 },
  emptyText: { fontSize: 16, color: C.muted },
  emptyHint: { fontSize: 13, color: C.muted },
});