/**
 * Phone Side Panel — Three visual zones separated by dividers.
 * 1. My Numbers — reusable component with phone-number + colored pills
 * 2. Activity — Dial Pad, Recent Calls, Favorites, Voicemail, Blocked
 * 3. Settings — Notifications, Ringtones, DND, Forwarding, Greeting, Wi-Fi, Caller ID
 * iOS Settings feel: scannable, generous spacing, icon + label on every row.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { MyNumbersSection } from '@/components/side-panel/my-numbers-section';
import { closeSidePanel } from '@/utils/global-side-panel';
import type { Mode } from '@/types';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  divider: '#2F3336',
};

/* ── Activity rows ── */
const ACTIVITY_ITEMS = [
  { icon: 'circle.grid.3x3.fill', label: 'Dial Pad', route: '/(tabs)/(main)/phone/dialpad' },
  { icon: 'clock.fill', label: 'Recent Calls', route: '/(tabs)/(main)/phone/recent' },
  { icon: 'star.fill', label: 'Favorites', route: '/(tabs)/(main)/phone/favorites' },
  { icon: 'waveform', label: 'Voicemail', route: '/(tabs)/(main)/phone/voicemail' },
  { icon: 'circle.slash', label: 'Blocked', route: '/(tabs)/(main)/phone/blocked' },
] as const;

/* ── Settings rows ── */
const SETTINGS_ITEMS = [
  { icon: 'bell.fill', label: 'Notifications', route: '/(tabs)/(main)/phone/settings' },
  { icon: 'speaker.wave.2.fill', label: 'Ringtones', route: '/(tabs)/(main)/phone/settings' },
  { icon: 'moon.fill', label: 'Do Not Disturb', route: '/(tabs)/(main)/phone/settings' },
  { icon: 'arrow.uturn.forward', label: 'Call Forwarding', route: '/(tabs)/(main)/phone/settings' },
  { icon: 'mic.fill', label: 'Voicemail Greeting', route: '/(tabs)/(main)/phone/settings' },
  { icon: 'wifi', label: 'Wi-Fi Calling', route: '/(tabs)/(main)/phone/settings' },
  { icon: 'eye.slash.fill', label: 'Caller ID', route: '/(tabs)/(main)/phone/settings' },
] as const;

// ── Row component ──

function PanelRow({ icon, label, onPress }: { icon: string; label: string; onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <IconSymbol name={icon as any} size={20} color={C.label} />
      <Text style={styles.rowLabel}>{label}</Text>
    </Pressable>
  );
}

// ── Main panel ──

export function PhonePanel() {
  const router = useRouter();

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const handleFilter = (mode: Mode) => {
    closeSidePanel();
    setTimeout(() => router.push({ pathname: '/(tabs)/(main)/phone/recent', params: { filterMode: mode } } as any), 80);
  };

  return (
    <View style={styles.container}>
      {/* ── MY NUMBERS (pinned) ── */}
      <MyNumbersSection onFilter={handleFilter} />

      {/* ── DIVIDER ── */}
      <View style={styles.divider} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTION 2: ACTIVITY ── */}
        <View style={styles.menuSection}>
          {ACTIVITY_ITEMS.map((item) => (
            <PanelRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={() => navigateTo(item.route)}
            />
          ))}
        </View>

        {/* ── DIVIDER 2 ── */}
        <View style={styles.divider} />

        {/* ── SECTION 3: SETTINGS ── */}
        <View style={styles.menuSection}>
          {SETTINGS_ITEMS.map((item) => (
            <PanelRow
              key={item.label}
              icon={item.icon}
              label={item.label}
              onPress={() => navigateTo(item.route)}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Dividers
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginVertical: 24,
  },

  // Section 2 & 3: Activity + Settings
  menuSection: {
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  rowLabel: {
    fontSize: 16,
    color: C.label,
  },
});
