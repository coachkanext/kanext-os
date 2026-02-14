/**
 * Video Sub-Footer — custom tab bar for nested media tabs.
 * Renders 5 icons + labels, stacks above the main app tab bar.
 * Height: 52px.
 */

import React from 'react';
import { View, Pressable, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';

interface TabDef {
  name: string;
  label: string;
  icon: IconSymbolName;
}

const TABS: TabDef[] = [
  { name: 'index', label: 'Home', icon: 'house.fill' },
  { name: 'reels', label: 'Reels', icon: 'play.rectangle.fill' },
  { name: 'create', label: 'Create', icon: 'plus.app.fill' },
  { name: 'library', label: 'Library', icon: 'books.vertical.fill' },
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
      {state.routes.map((route: any, index: number) => {
        const descriptor = descriptors[route.key];
        if (!descriptor) return null;

        // Skip hidden tabs (href: null)
        const options = descriptor.options;
        if (options.href === null) return null;

        const isFocused = state.index === index;
        const tabDef = TABS.find((t) => t.name === route.name);
        if (!tabDef) return null;

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
            style={styles.tab}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={tabDef.label}
          >
            <IconSymbol
              name={tabDef.icon}
              size={20}
              color={isFocused ? '#f5f5f5' : '#6e6e6e'}
            />
            <ThemedText
              style={[
                styles.label,
                { color: isFocused ? '#f5f5f5' : '#6e6e6e' },
              ]}
            >
              {tabDef.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const SUB_FOOTER_HEIGHT = 52;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: SUB_FOOTER_HEIGHT,
    backgroundColor: '#000',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: Platform.OS === 'ios' ? 2 : 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
