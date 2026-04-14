/**
 * Blocked — List of blocked callers. Swipe left = unblock. Add button.
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
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// Mock blocked contacts
const BLOCKED = [
  { id: 'b1', name: 'Unknown Caller', number: '+1 (555) 000-1234', initials: '?' },
  { id: 'b2', name: 'Spam Likely', number: '+1 (555) 999-0000', initials: 'S' },
];

const TOP_BAR_H = 56;

export default function BlockedScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [blocked, setBlocked] = useState(BLOCKED);

  const unblock = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View style={[styles.container]}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Blocked</Text>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={styles.list}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Add button */}
        <Pressable style={styles.addRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <IconSymbol name="plus.circle.fill" size={20} color={accent} />
          <Text style={[styles.addLabel, { color: accent }]}>Block a Number</Text>
        </Pressable>

        {blocked.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.avatar}>
              <Text style={styles.initials}>{item.initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.number}>{item.number}</Text>
            </View>
            <Pressable
              style={styles.unblockBtn}
              onPress={() => unblock(item.id)}
            >
              <Text style={styles.unblockText}>Unblock</Text>
            </Pressable>
          </View>
        ))}

        {blocked.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="hand.raised.fill" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No blocked numbers</Text>
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
  addRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  addLabel: { fontSize: 16, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '600', color: C.label },
  number: { fontSize: 13, color: C.muted, marginTop: 2, fontVariant: ['tabular-nums'] },
  unblockBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.separator },
  unblockText: { fontSize: 13, fontWeight: '600', color: C.red },
  empty: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },
});