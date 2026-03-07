/**
 * Phone Side Panel — Pinned KaNeXT numbers at top, divider, menu rows.
 * Each menu row opens a full page. Numbers are always visible.
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
  separator: 'rgba(255,255,255,0.08)',
};

const MENU_ITEMS = [
  { icon: 'circle.grid.3x3.fill', label: 'Dial Pad', route: '/(tabs)/(main)/phone/dialpad' },
  { icon: 'clock.fill', label: 'Recent Calls', route: '/(tabs)/(main)/phone/recent' },
  { icon: 'star.fill', label: 'Favorites', route: '/(tabs)/(main)/phone/favorites' },
  { icon: 'recordingtape', label: 'Voicemail', route: '/(tabs)/(main)/phone/voicemail' },
  { icon: 'hand.raised.fill', label: 'Blocked', route: '/(tabs)/(main)/phone/blocked' },
  { icon: 'gearshape.fill', label: 'Settings', route: '/(tabs)/(main)/phone/settings' },
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

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          <Text style={popupStyles.title}>{number.label}</Text>
          <Text style={popupStyles.num}>{number.number}</Text>
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
      {/* Pinned: My KaNeXT Numbers (always visible, no scroll) */}
      <View style={styles.pinnedSection}>
        <Text style={styles.pinnedTitle}>My Numbers</Text>
        {MY_KANEXT_NUMBERS.map((num) => {
          const color = MODE_BADGE_COLORS[num.mode];
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
              <View style={[styles.modeDot, { backgroundColor: color }]} />
              <Text style={styles.modeLabel}>{num.label}</Text>
              <Text style={styles.numberText}>{num.number}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.divider} />

      {/* Menu rows (scrollable) */}
      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menuContent}
        showsVerticalScrollIndicator={false}
      >
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [
              styles.menuRow,
              pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigateTo(item.route);
            }}
          >
            <IconSymbol name={item.icon as any} size={18} color={C.secondary} />
            <Text style={styles.menuLabel}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.25)" />
          </Pressable>
        ))}
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

  // Pinned numbers
  pinnedSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  pinnedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 8,
    gap: 8,
  },
  modeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
    width: 72,
  },
  numberText: {
    fontSize: 13,
    color: C.secondary,
    fontVariant: ['tabular-nums'],
  },

  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginHorizontal: 16,
    marginBottom: 8,
  },

  // Menu
  menuScroll: { flex: 1 },
  menuContent: { paddingBottom: 40 },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
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
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    marginBottom: 4,
  },
  num: {
    fontSize: 18,
    fontWeight: '500',
    color: C.label,
    fontVariant: ['tabular-nums'],
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: C.separator,
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
