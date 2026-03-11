/**
 * Nexus Side Panel — contextual panel for the Nexus screen.
 *
 * Top: Recents — last 5-8 recent conversations inline (quick access).
 *      Each row: type icon + topic summary + timestamp. Tap = loads immediately.
 *
 * Divider
 *
 * Bottom: 6 nav rows → full pages (no-op for now):
 *   History, Spaces, Threads, Voice Settings, Nexus Preferences, Settings
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { getRecents, type ConversationHistoryItem } from '@/data/mock-nexus-history';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

/** Icon name per conversation type */
const TYPE_ICONS: Record<ConversationHistoryItem['type'], string> = {
  nexus: 'bubble.left.fill',
  simulation: 'chart.bar.fill',
  space: 'square.grid.2x2.fill',
  thread: 'bubble.left.and.bubble.right.fill',
};

function formatTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const NAV_ITEMS = [
  { icon: 'clock.fill', label: 'History' },
  { icon: 'square.grid.2x2.fill', label: 'Spaces' },
  { icon: 'bubble.left.and.bubble.right.fill', label: 'Threads' },
  { icon: 'mic.fill', label: 'Voice Settings' },
  { icon: 'brain', label: 'Nexus Preferences' },
  { icon: 'gearshape.fill', label: 'Settings' },
] as const;

export function NexusPanel() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const recents = getRecents();

  return (
    <View style={styles.content}>
      <Text style={styles.title}>Nexus</Text>

      {/* ── RECENTS ── */}
      <Text style={styles.sectionLabel}>Recents</Text>
      {recents.map((item) => (
        <Pressable
          key={item.id}
          style={({ pressed }) => [styles.recentRow, pressed && styles.recentRowPressed]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            console.log('Load conversation:', item.id);
          }}
        >
          <IconSymbol
            name={TYPE_ICONS[item.type] as any}
            size={14}
            color={C.secondary}
          />
          <Text style={styles.recentText} numberOfLines={1}>{item.summary}</Text>
          <Text style={styles.recentTime}>{formatTime(item.timestamp)}</Text>
        </Pressable>
      ))}

      {/* ── DIVIDER ── */}
      <View style={styles.divider} />

      {/* ── NAV ROWS → FULL PAGES ── */}
      {NAV_ITEMS.map((item, idx) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.navRow,
            pressed && styles.navRowPressed,
            idx < NAV_ITEMS.length - 1 && styles.navRowBorder,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            console.log('Navigate to:', item.label);
          }}
        >
          <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
          <Text style={styles.navLabel}>{item.label}</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
        </Pressable>
      ))}

      <View style={{ height: 32 }} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  content: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  // Recents section
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  recentRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  recentText: {
    flex: 1,
    fontSize: 14,
    color: C.label,
  },
  recentTime: {
    fontSize: 11,
    color: C.secondary,
    marginLeft: 6,
    flexShrink: 0,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginVertical: 12,
    marginHorizontal: 16,
  },

  // Nav rows
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  navRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  navRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  navLabel: {
    flex: 1,
    fontSize: 16,
    color: C.label,
  },
});
