/**
 * Studios Side Panel — swipe right on KayStudios.
 * 6 navigation items: Subscriptions, Downloads, Play History, Multiplayer, Reviews, Settings.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const NAV_ITEMS = [
  { icon: 'cart.fill',        label: 'Subscriptions', route: '/(tabs)/(main)/studios/subscriptions' },
  { icon: 'arrow.down.circle.fill', label: 'Downloads', route: '/(tabs)/(main)/studios/downloads' },
  { icon: 'clock.fill',       label: 'Play History',  route: '/(tabs)/(main)/studios/history' },
  { icon: 'person.2.fill',    label: 'Multiplayer',   route: '/(tabs)/(main)/studios/multiplayer' },
  { icon: 'star.fill',        label: 'Reviews',       route: '/(tabs)/(main)/studios/reviews' },
  { icon: 'gearshape.fill',   label: 'Settings',      route: '/(tabs)/(main)/studios/settings' },
] as const;

export function StudiosPanel() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>KayStudios</Text>

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
            navigateTo(item.route);
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
  container: {},
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
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
