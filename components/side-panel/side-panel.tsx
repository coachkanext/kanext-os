/**
 * Side Panel Shell — Contextual right-side panel.
 * Position: absolute right, jet black background.
 * Routes to per-screen content based on pathname.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';

import { MessagesPanel } from './messages-panel';
import { DefaultPanel } from './default-panel';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
export const SIDE_PANEL_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

interface SidePanelProps {
  visible: boolean;
}

export function SidePanel({ visible }: SidePanelProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();

  const isMessages = pathname.includes('messages');

  return (
    <View
      style={[styles.container, { width: SIDE_PANEL_WIDTH }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <View style={[styles.inner, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }]}>
        {isMessages ? (
          <MessagesPanel />
        ) : (
          <DefaultPanel pathname={pathname} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#000000',
    zIndex: 0,
  },
  inner: {
    flex: 1,
  },
});
