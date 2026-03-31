/**
 * Archived — Archived channels and DMs with restore option.
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

// Mock archived items
const MOCK_ARCHIVED = [
  { id: 'a1', name: '#old-announcements', initials: 'OA', isChannel: true, date: 'Feb 12' },
  { id: 'a2', name: '#2024-season', initials: '24', isChannel: true, date: 'Jan 30' },
  { id: 'a3', name: 'David Park', initials: 'DP', isChannel: false, date: 'Jan 15' },
];

export default function ArchivedScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [archived, setArchived] = useState(MOCK_ARCHIVED);

  const restore = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setArchived((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Archived</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {archived.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={[styles.icon, item.isChannel ? styles.channelShape : styles.dmShape]}>
              <Text style={styles.initials}>{item.initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.date}>Archived {item.date}</Text>
            </View>
            <Pressable style={styles.restoreBtn} onPress={() => restore(item.id)}>
              <Text style={[styles.restoreText, { color: accent }]}>Restore</Text>
            </Pressable>
          </View>
        ))}

        {archived.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="archivebox.fill" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No archived items</Text>
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
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, gap: 12 },
  icon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', opacity: 0.6 },
  channelShape: { borderRadius: 10, backgroundColor: C.surface },
  dmShape: { borderRadius: 20, backgroundColor: '#1C1410' },
  initials: { fontSize: 13, fontWeight: '700', color: C.label },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: '500', color: C.label },
  date: { fontSize: 12, color: C.muted, marginTop: 2 },
  restoreBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.separator },
  restoreText: { fontSize: 13, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },
});
