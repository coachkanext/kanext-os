/**
 * Tab Footer
 * Reusable bottom tab bar for screens outside the (tabs) navigator
 * (e.g. coach screens) so the footer stays visible everywhere.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FOOTER_TABS: { name: string; icon: SymbolViewProps['name']; route: string }[] = [
  { name: 'Home', icon: 'house.fill', route: '/(tabs)' },
  { name: 'Media', icon: 'play.rectangle.fill', route: '/(tabs)/media' },
  { name: 'Nexus', icon: 'sparkles', route: '/(tabs)/nexus' },
  { name: 'Activity', icon: 'bell.fill', route: '/(tabs)/activity' },
  { name: 'Organization', icon: 'building.2.fill', route: '/(tabs)/organization' },
];

interface TabFooterProps {
  activeTab?: string;
}

export function TabFooter({ activeTab = 'Home' }: TabFooterProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.border,
          paddingBottom: insets.bottom,
          height: Platform.OS === 'ios' ? Layout.tabBarHeight : 60,
        },
      ]}
    >
      {FOOTER_TABS.map((tab) => {
        const isActive = tab.name === activeTab;
        return (
          <Pressable
            key={tab.name}
            style={styles.tab}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace(tab.route as any);
            }}
          >
            <IconSymbol
              name={tab.icon}
              size={24}
              color={isActive ? colors.tabIconSelected : colors.tabIconDefault}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: 'flex-start',
    paddingTop: 10,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
