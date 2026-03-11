/**
 * Messages Side Panel — FINAL spec.
 * No scroll. Everything visible at once.
 * Top: number-based filter pills (single row).
 * Bottom: 7 menu rows — 2 nav + 5 inline toggles.
 */

import React, { useState, useMemo } from 'react';
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
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const DND_OPTIONS = ['1 hour', '4 hours', '8 hours', 'Until tomorrow', 'Custom'] as const;

export function MessagesPanel() {
  const router = useRouter();
  const currentMode = useMode();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [activeMode, setActiveMode] = useState<Mode | null>(currentMode);

  // Toggle states
  const [notifications, setNotifications] = useState(true);
  const [readReceipts, setReadReceipts] = useState(true);
  const [muteAll, setMuteAll] = useState(false);
  const [dnd, setDnd] = useState(false);
  const [dndDuration, setDndDuration] = useState<string>('1 hour');

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  const toggleWithHaptic = (setter: (v: boolean) => void, value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setter(!value);
  };

  return (
    <View style={styles.container}>
      {/* ── NUMBER FILTER PILLS ── */}
      <NumberFilterPills activeMode={activeMode} onFilterChange={setActiveMode} />

      {/* ── 20px SPACER ── */}
      <View style={{ height: 20 }} />

      {/* ── NAV ROWS ── */}
      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateTo('/(tabs)/(main)/messages/archived');
        }}
      >
        <IconSymbol name={'archivebox.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Archived</Text>
      </Pressable>

      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateTo('/(tabs)/(main)/messages/blocked');
        }}
      >
        <IconSymbol name={'hand.raised.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Blocked</Text>
      </Pressable>

      {/* ── TOGGLE ROWS ── */}
      <View style={styles.menuRow}>
        <IconSymbol name={'bell.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Notifications</Text>
        <View style={styles.toggleSpacer} />
        <Switch
          value={notifications}
          onValueChange={() => toggleWithHaptic(setNotifications, notifications)}
          trackColor={{ false: '#39393D', true: '#FFFFFF' }}
          thumbColor={notifications ? '#000000' : '#808080'}
          ios_backgroundColor="#39393D"
        />
      </View>

      <View style={styles.menuRow}>
        <IconSymbol name={'checkmark.circle.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Read Receipts</Text>
        <View style={styles.toggleSpacer} />
        <Switch
          value={readReceipts}
          onValueChange={() => toggleWithHaptic(setReadReceipts, readReceipts)}
          trackColor={{ false: '#39393D', true: '#FFFFFF' }}
          thumbColor={readReceipts ? '#000000' : '#808080'}
          ios_backgroundColor="#39393D"
        />
      </View>

      <View style={styles.menuRow}>
        <IconSymbol name={'moon.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Mute All</Text>
        <View style={styles.toggleSpacer} />
        <Switch
          value={muteAll}
          onValueChange={() => toggleWithHaptic(setMuteAll, muteAll)}
          trackColor={{ false: '#39393D', true: '#FFFFFF' }}
          thumbColor={muteAll ? '#000000' : '#808080'}
          ios_backgroundColor="#39393D"
        />
      </View>

      {/* DND row + timer options */}
      <View>
        <View style={styles.menuRow}>
          <IconSymbol name={'clock.fill' as any} size={20} color={C.label} />
          <Text style={styles.menuLabel}>Do Not Disturb</Text>
          <View style={styles.toggleSpacer} />
          <Switch
            value={dnd}
            onValueChange={() => toggleWithHaptic(setDnd, dnd)}
            trackColor={{ false: '#39393D', true: '#FFFFFF' }}
            thumbColor={dnd ? '#000000' : '#808080'}
            ios_backgroundColor="#39393D"
          />
        </View>
        {dnd && (
          <View style={styles.dndOptions}>
            {DND_OPTIONS.map((opt) => (
              <Pressable
                key={opt}
                style={[
                  styles.dndPill,
                  dndDuration === opt && styles.dndPillActive,
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setDndDuration(opt);
                }}
              >
                <Text
                  style={[
                    styles.dndPillText,
                    dndDuration === opt && styles.dndPillTextActive,
                  ]}
                >
                  {opt}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.menuRow, pressed && styles.menuRowPressed]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigateTo('/(tabs)/(main)/messages/display');
        }}
      >
        <IconSymbol name={'paintbrush.fill' as any} size={20} color={C.label} />
        <Text style={styles.menuLabel}>Display</Text>
      </Pressable>

      {/* ── 32px BOTTOM PADDING ── */}
      <View style={{ height: 32 }} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
  dndOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 54,
    paddingBottom: 8,
  },
  dndPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  dndPillActive: {
    backgroundColor: '#FFFFFF',
  },
  dndPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },
  dndPillTextActive: {
    color: C.bg,
  },
});
