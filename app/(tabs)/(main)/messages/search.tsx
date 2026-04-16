/**
 * Messages Search — Full-page search for messages, channels, DMs.
 * Type to search, results filter in real-time.
 */

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';
import { getRooms, getGlobalDMs } from '@/data/mock-messages-v3';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;

export default function MessagesSearchScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const mode = useMode();
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);
  const [search, setSearch] = useState('');

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    if (isOwnerRef.current === isOwner) return;
    isOwnerRef.current = isOwner;
    router.navigate('/(tabs)/(main)/messages' as any);
  }, [isOwner]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const channels = useMemo(() => getRooms(mode), [mode]);
  const dms = useMemo(() => getGlobalDMs(), []);

  const results = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase();
    return {
      channels: channels.filter((r) => r.name.toLowerCase().includes(q) || r.lastMessage.toLowerCase().includes(q)),
      dms: dms.filter((t) => t.name.toLowerCase().includes(q) || t.preview.toLowerCase().includes(q)),
    };
  }, [search, channels, dms]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Search</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <View style={{ height: insets.top + TOP_BAR_H }} />
      <View style={styles.searchWrap}>
        <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search messages, rooms, DMs"
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => setSearch('')} hitSlop={8}>
            <IconSymbol name="xmark.circle.fill" size={16} color={C.muted} />
          </Pressable>
        )}
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}>
        {!results && (
          <View style={styles.hint}>
            <IconSymbol name="magnifyingglass" size={40} color={C.muted} />
            <Text style={styles.hintText}>Search rooms, DMs, and messages</Text>
          </View>
        )}

        {results && results.channels.length === 0 && results.dms.length === 0 && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>No results for "{search}"</Text>
          </View>
        )}

        {results && results.channels.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Rooms</Text>
            {results.channels.map((ch) => (
              <Pressable
                key={ch.id}
                style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/messages/[threadId]', params: { threadId: ch.id, type: 'channel', title: ch.name } });
                }}
              >
                <View style={styles.channelIcon}>
                  <Text style={styles.channelInitials}>{ch.initials}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>{ch.name}</Text>
                  <Text style={styles.resultPreview} numberOfLines={1}>{ch.lastMessage}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}

        {results && results.dms.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Direct Messages</Text>
            {results.dms.map((dm) => (
              <Pressable
                key={dm.id}
                style={({ pressed }) => [styles.resultRow, pressed && { backgroundColor: 'rgba(255,255,255,0.04)' }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push({ pathname: '/messages/[threadId]', params: { threadId: dm.id, type: 'dm', title: dm.name } });
                }}
              >
                <View style={styles.dmIcon}>
                  <Text style={styles.dmInitials}>{dm.initials}</Text>
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>{dm.name}</Text>
                  <Text style={styles.resultPreview} numberOfLines={1}>{dm.preview}</Text>
                </View>
              </Pressable>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface,
    borderRadius: 10, marginHorizontal: 16, marginBottom: 16, paddingHorizontal: 12, height: 42, gap: 8,
  },
  searchInput: { flex: 1, fontSize: 16, color: C.label, padding: 0 },
  list: { flex: 1 },
  hint: { alignItems: 'center', paddingTop: 80, gap: 12 },
  hintText: { fontSize: 16, color: C.muted, textAlign: 'center' },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 8, marginTop: 12,
  },
  resultRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 12 },
  channelIcon: { width: 40, height: 40, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  channelInitials: { fontSize: 13, fontWeight: '700', color: C.label },
  dmIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1C1410', alignItems: 'center', justifyContent: 'center' },
  dmInitials: { fontSize: 13, fontWeight: '600', color: C.label },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 16, fontWeight: '600', color: C.label },
  resultPreview: { fontSize: 13, color: C.muted, marginTop: 2 },
});
