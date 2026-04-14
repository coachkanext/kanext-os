/**
 * Blocked Users — Manage blocked users who cannot DM you.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const MOCK_BLOCKED = [
  { id: 'mb1', name: 'Spam Account', username: '@spammer123', initials: 'SA' },
  { id: 'mb2', name: 'Unknown User', username: '@unknown_x', initials: 'UU' },
];

export default function BlockedUsersScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const TOP_BAR_H = insets.top + 54;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);
  const [blocked, setBlocked] = useState(MOCK_BLOCKED);

  const unblock = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Blocked Users</Text>
        </View>
      </Animated.View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingTop: TOP_BAR_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}>
        {blocked.map((user) => (
          <View key={user.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{user.initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{user.name}</Text>
              <Text style={styles.username}>{user.username}</Text>
            </View>
            <Pressable style={styles.unblockBtn} onPress={() => unblock(user.id)}>
              <Text style={styles.unblockText}>Unblock</Text>
            </Pressable>
          </View>
        ))}

        {blocked.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="hand.raised.fill" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No blocked users</Text>
          </View>
        )}

        <Text style={styles.note}>
          Blocked users cannot send you direct messages or see your online status.
        </Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  list: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: C.label },
  username: { fontSize: 13, color: C.muted, marginTop: 2 },
  unblockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.separator },
  unblockText: { fontSize: 13, fontWeight: '600', color: C.red },
  empty: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },
  note: { fontSize: 13, color: C.muted, paddingHorizontal: 20, marginTop: 24, lineHeight: 18 },
});
