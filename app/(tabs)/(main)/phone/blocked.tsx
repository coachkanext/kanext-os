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
} from 'react-native';
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

export default function BlockedScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [blocked, setBlocked] = useState(BLOCKED);

  const unblock = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setBlocked((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Blocked</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
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
