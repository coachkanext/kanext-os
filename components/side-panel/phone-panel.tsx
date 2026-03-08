/**
 * Phone Side Panel — FINAL spec.
 * No scroll. Everything visible at once.
 * Top: number-based filter pills (single row).
 * Bottom: 7 menu rows — 6 nav + 1 inline toggle.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { NumberFilterPills } from '@/components/side-panel/number-filter-pills';
import { useMode } from '@/context/app-context';
import { closeSidePanel } from '@/utils/global-side-panel';
import type { Mode } from '@/types';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
};

const NAV_ITEMS = [
  { icon: 'circle.grid.3x3.fill', label: 'Dial Pad', route: '/(tabs)/(main)/phone/dialpad' },
  { icon: 'clock.fill', label: 'Recent Calls', route: '/(tabs)/(main)/phone/recent' },
  { icon: 'star.fill', label: 'Favorites', route: '/(tabs)/(main)/phone/favorites' },
  { icon: 'waveform', label: 'Voicemail', route: '/(tabs)/(main)/phone/voicemail' },
  { icon: 'hand.raised.fill', label: 'Blocked', route: '/(tabs)/(main)/phone/blocked' },
] as const;

export function PhonePanel() {
  const router = useRouter();
  const currentMode = useMode();
  const [activeMode, setActiveMode] = useState<Mode | null>(currentMode);
  const [notifications, setNotifications] = useState(true);

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      {/* ── NUMBER FILTER PILLS ── */}
      <NumberFilterPills activeMode={activeMode} onFilterChange={setActiveMode} />

      {/* ── 20px SPACER ── */}
      <View style={{ height: 20 }} />

      {/* ── NAV ROWS ── */}
      {NAV_ITEMS.map((item) => (
        <Pressable
          key={item.label}
          style={({ pressed }) => [
            styles.menuRow,
            pressed && styles.menuRowPressed,
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigateTo(item.route);
          }}
        >
          <IconSymbol name={item.icon as any} size={20} color={C.label} />
          <Text style={styles.menuLabel}>{item.label}</Text>
        </Pressable>
      ))}

      {/* ── NOTIFICATIONS TOGGLE ROW ── */}
      <View style={styles.menuRow}>
        <IconSymbol name={'bell.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Notifications</Text>
        <View style={styles.toggleSpacer} />
        <Switch
          value={notifications}
          onValueChange={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setNotifications(!notifications);
          }}
          trackColor={{ false: '#39393D', true: '#FFFFFF' }}
          thumbColor={notifications ? '#000000' : '#808080'}
          ios_backgroundColor="#39393D"
        />
      </View>

      {/* ── SETTINGS NAV ROW ── */}
      <Pressable
        style={({ pressed }) => [
          styles.menuRow,
          pressed && styles.menuRowPressed,
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateTo('/(tabs)/(main)/phone/settings');
        }}
      >
        <IconSymbol name={'gearshape.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Settings</Text>
      </Pressable>

      {/* ── 32px BOTTOM PADDING ── */}
      <View style={{ height: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuRowPressed: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  menuLabel: {
    fontSize: 16,
    color: C.label,
  },
  toggleSpacer: {
    flex: 1,
  },
});
