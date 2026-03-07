/**
 * Phone Side Panel — Three visual zones separated by dividers.
 * 1. My Numbers — mode icon + phone number, color-coded
 * 2. Activity — Dial Pad, Recent Calls, Favorites, Voicemail, Blocked
 * 3. Settings — Notifications, Ringtones, DND, Forwarding, Greeting, Wi-Fi, Caller ID
 * iOS Settings feel: scannable, generous spacing, icon + label on every row.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  MY_KANEXT_NUMBERS,
  MODE_BADGE_COLORS,
  type KanextNumber,
} from '@/data/mock-phone';
import { closeSidePanel } from '@/utils/global-side-panel';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  divider: '#2F3336',
};

/* ── Mode icons ── */
const MODE_ICONS: Record<string, string> = {
  sports: 'tshirt.fill',
  business: 'briefcase.fill',
  church: 'cross.fill',
  education: 'graduationcap.fill',
  competition: 'trophy.fill',
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

// ── Number long-press popup ──

function NumberPopup({
  visible,
  number,
  onClose,
}: {
  visible: boolean;
  number: KanextNumber | null;
  onClose: () => void;
}) {
  if (!visible || !number) return null;
  const color = MODE_BADGE_COLORS[number.mode];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          <View style={popupStyles.header}>
            <IconSymbol name={(MODE_ICONS[number.mode] ?? 'phone.fill') as any} size={20} color={color} />
            <Text style={popupStyles.num}>{number.number}</Text>
          </View>
          <View style={popupStyles.divider} />
          {[
            { label: 'Copy to Clipboard', icon: 'doc.on.doc.fill', onPress: onClose },
            { label: 'Port Existing Number', icon: 'arrow.right.arrow.left', onPress: onClose },
            { label: 'Share Number', icon: 'square.and.arrow.up', onPress: onClose },
          ].map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                popupStyles.row,
                pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                action.onPress();
              }}
            >
              <IconSymbol name={action.icon as any} size={16} color={C.secondary} />
              <Text style={popupStyles.rowLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

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
  const [popupNumber, setPopupNumber] = useState<KanextNumber | null>(null);

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── SECTION 1: MY NUMBERS ── */}
        <View style={styles.numbersSection}>
          {MY_KANEXT_NUMBERS.map((num) => {
            const color = MODE_BADGE_COLORS[num.mode];
            const icon = MODE_ICONS[num.mode] ?? 'phone.fill';
            return (
              <Pressable
                key={num.mode}
                style={({ pressed }) => [
                  styles.numberRow,
                  pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  closeSidePanel();
                  setTimeout(() => router.push({ pathname: '/(tabs)/(main)/phone/recent', params: { filterMode: num.mode } } as any), 80);
                }}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  setPopupNumber(num);
                }}
                delayLongPress={400}
              >
                <IconSymbol name={icon as any} size={24} color={color} />
                <Text style={styles.numberText}>{num.number}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* ── DIVIDER 1 ── */}
        <View style={styles.divider} />

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

      {/* Number long-press popup */}
      <NumberPopup
        visible={popupNumber !== null}
        number={popupNumber}
        onClose={() => setPopupNumber(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 32 },

  // Section 1: My Numbers
  numbersSection: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    gap: 14,
    marginVertical: 8,
  },
  numberText: {
    fontSize: 17,
    fontWeight: '400',
    color: C.label,
    fontVariant: ['tabular-nums'],
  },

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

const popupStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: '80%',
    maxWidth: 300,
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  num: {
    fontSize: 18,
    fontWeight: '500',
    color: C.label,
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: 1,
    backgroundColor: C.divider,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  rowLabel: {
    fontSize: 15,
    color: C.label,
  },
});
