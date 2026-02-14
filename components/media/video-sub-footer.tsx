/**
 * Video Sub-Footer — 5 icon-only tab bar for nested media tabs.
 * Tabs: Home | Reels | Create | Inbox | You
 * Stacks above the main app tab bar.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';

interface TabDef {
  name: string;
  label: string;
  icon: IconSymbolName;
}

const TABS: TabDef[] = [
  { name: 'index', label: 'Home', icon: 'music.note.house' },
  { name: 'reels', label: 'Reels', icon: 'film.stack' },
  { name: 'create', label: 'Create', icon: 'plus' },
  { name: 'inbox', label: 'Inbox', icon: 'paperplane.fill' },
  { name: 'you', label: 'You', icon: 'person.circle.fill' },
];

interface VideoSubFooterProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export function VideoSubFooter({ state, descriptors, navigation }: VideoSubFooterProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconRow}>
        {state.routes.map((route: any, index: number) => {
          const tabDef = TABS.find((t) => t.name === route.name);
          if (!tabDef) return null;

          const isFocused = state.index === index;

          const onPress = () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <Pressable
              key={route.key}
              style={styles.iconBtn}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={tabDef.label}
            >
              <IconSymbol
                name={tabDef.icon}
                size={24}
                color={isFocused ? '#f5f5f5' : '#555'}
              />
              {isFocused && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const SUB_FOOTER_HEIGHT = 64;

const styles = StyleSheet.create({
  container: {
    height: SUB_FOOTER_HEIGHT,
    backgroundColor: '#000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
  },
  iconRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  iconBtn: {
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  activeIndicator: {
    width: 20,
    height: 2.5,
    borderRadius: 1.25,
    backgroundColor: '#f5f5f5',
    marginTop: 6,
  },
});
