/**
 * Social Side Panel — swipe right on Social feed (page 0).
 * 6 navigation items: Your Posts, Saved, Drafts, Analytics, Following, Settings.
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
  { icon: 'square.grid.2x2.fill', label: 'Your Posts', route: '/(tabs)/(main)/social/your-posts' },
  { icon: 'bookmark.fill',        label: 'Saved',      route: '/(tabs)/(main)/social/saved' },
  { icon: 'doc.text.fill',        label: 'Drafts',     route: '/(tabs)/(main)/social/drafts' },
  { icon: 'chart.bar.fill',       label: 'Analytics',  route: '/(tabs)/(main)/social/analytics' },
  { icon: 'person.2.fill',        label: 'Following',  route: '/(tabs)/(main)/social/following' },
  { icon: 'gearshape.fill',       label: 'Settings',   route: '/(tabs)/(main)/social/settings' },
] as const;

export function SocialPanel() {
  const router = useRouter();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const navigateTo = (route: string) => {
    closeSidePanel();
    setTimeout(() => router.push(route as any), 80);
  };

  return (
    <View style={styles.container}>
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
