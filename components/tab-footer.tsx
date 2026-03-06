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
import { requestHomeReset } from '@/utils/global-home';

const FOOTER_TABS: { name: string; icon: SymbolViewProps['name']; route: string }[] = [
  { name: 'Home', icon: 'house.fill', route: '/(tabs)' },
  { name: 'Media', icon: 'play.rectangle.fill', route: '/(tabs)/media' },
  { name: 'Nexus', icon: 'sparkles', route: '/nexus' },
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
          borderTopColor: '#2F3336',
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
              if (tab.name === 'Home') {
                console.log('[TabFooter] Home pressed, setting requestHomeReset flag');
                requestHomeReset();
              }
              // Dismiss coach stack back to tabs, then navigate to target tab
              if (router.canDismiss()) {
                router.dismissAll();
              }
              setTimeout(() => {
                if (tab.route === '/nexus') {
                  router.push(tab.route as any);
                } else {
                  router.navigate(tab.route as any);
                }
              }, 50);
            }}
          >
            <IconSymbol
              name={tab.icon}
              size={26}
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
    alignItems: 'center',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
