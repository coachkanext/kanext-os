/**
 * Archived — Archived channels and DMs with restore option.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// Mock archived items
const MOCK_ARCHIVED = [
  { id: 'a1', name: '#old-announcements', initials: 'OA', isChannel: true, date: 'Feb 12' },
  { id: 'a2', name: '#2024-season', initials: '24', isChannel: true, date: 'Jan 30' },
  { id: 'a3', name: 'David Park', initials: 'DP', isChannel: false, date: 'Jan 15' },
];

const TOP_BAR_H = 52;

export default function ArchivedScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);
  const [archived, setArchived] = useState(MOCK_ARCHIVED);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    if (isOwnerRef.current === isOwner) return;
    isOwnerRef.current = isOwner;
    router.navigate('/(tabs)/(main)/messages' as any);
  }, [isOwner]);
  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const restore = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setArchived((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Archived</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}>
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
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
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
