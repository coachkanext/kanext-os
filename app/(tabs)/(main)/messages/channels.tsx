/**
 * Room Management — Create room, list all with mute toggles, archive.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useMode } from '@/context/app-context';
import { getRooms } from '@/data/mock-messages-v3';

export default function ChannelManagementScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const mode = useMode();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const channels = useMemo(() => getRooms(mode), [mode]);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());

  const toggleMute = useCallback((id: string) => {
    setMutedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }, []);

  const activeChannels = channels.filter((ch) => !archivedIds.has(ch.id));
  const archivedChannels = channels.filter((ch) => archivedIds.has(ch.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Rooms</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Create channel button */}
        <Pressable
          style={styles.createRow}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus.circle.fill" size={20} color={accent} />
          <Text style={[styles.createLabel, { color: accent }]}>Create Room</Text>
        </Pressable>

        {/* Active rooms */}
        <Text style={styles.sectionLabel}>Active Rooms</Text>
        {activeChannels.map((ch) => (
          <View key={ch.id} style={styles.channelRow}>
            <View style={styles.channelIcon}>
              <Text style={styles.channelInitials}>{ch.initials}</Text>
              {ch.locked && (
                <View style={styles.lockBadge}>
                  <IconSymbol name="lock.fill" size={7} color={C.secondary} />
                </View>
              )}
            </View>
            <View style={styles.channelInfo}>
              <Text style={styles.channelName} numberOfLines={1}>{ch.name}</Text>
              <Text style={styles.channelMeta}>{ch.memberCount} members</Text>
            </View>
            <Switch
              value={!mutedIds.has(ch.id)}
              onValueChange={() => toggleMute(ch.id)}
              trackColor={{ false: '#3D352E', true: accent }}
              thumbColor="#FFFFFF"
              style={styles.miniSwitch}
            />
            <Pressable
              hitSlop={8}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setArchivedIds((prev) => new Set(prev).add(ch.id));
              }}
            >
              <IconSymbol name="archivebox.fill" size={16} color={C.muted} />
            </Pressable>
          </View>
        ))}

        {/* Archived channels */}
        {archivedChannels.length > 0 && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionLabel}>Archived</Text>
            {archivedChannels.map((ch) => (
              <View key={ch.id} style={styles.channelRow}>
                <View style={[styles.channelIcon, { opacity: 0.5 }]}>
                  <Text style={styles.channelInitials}>{ch.initials}</Text>
                </View>
                <Text style={[styles.channelName, { flex: 1, opacity: 0.5 }]} numberOfLines={1}>{ch.name}</Text>
                <Pressable
                  style={styles.restoreBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setArchivedIds((prev) => { const n = new Set(prev); n.delete(ch.id); return n; });
                  }}
                >
                  <Text style={styles.restoreText}>Restore</Text>
                </Pressable>
              </View>
            ))}
          </>
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
  createRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 14 },
  createLabel: { fontSize: 16, fontWeight: '600' },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', color: C.secondary, textTransform: 'uppercase',
    letterSpacing: 0.5, paddingHorizontal: 20, marginBottom: 8, marginTop: 8,
  },
  channelRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  channelIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  channelInitials: { fontSize: 12, fontWeight: '700', color: C.label },
  lockBadge: {
    position: 'absolute', bottom: -2, right: -2, width: 14, height: 14, borderRadius: 7,
    backgroundColor: '#261D17', alignItems: 'center', justifyContent: 'center',
  },
  channelInfo: { flex: 1 },
  channelName: { fontSize: 15, fontWeight: '600', color: C.label },
  channelMeta: { fontSize: 12, color: C.muted, marginTop: 2 },
  miniSwitch: { transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }] },
  divider: { height: 1, backgroundColor: C.separator, marginHorizontal: 20, marginVertical: 8 },
  restoreBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: C.separator },
  restoreText: { fontSize: 13, fontWeight: '600', color: C.secondary },
});
