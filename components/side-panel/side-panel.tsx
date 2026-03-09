/**
 * Side Panel Shell — Universal side panel for all screens.
 * Position: absolute left, jet black background.
 *
 * Layout:
 *   TOP: PanelHeader (mode circles + org switcher) — same on every screen
 *   DIVIDER
 *   BOTTOM: Screen-specific content based on pathname
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { usePathname } from 'expo-router';

import { PanelHeader } from './panel-header';
import { MessagesPanel } from './messages-panel';
import { PhonePanel } from './phone-panel';
import { NexusPanel } from './nexus-panel';
import { ModePanel } from './mode-panel';
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
  const isPhone = pathname.includes('phone');
  const isNexus = pathname.includes('nexus');
  const isMode = pathname.includes('mode');

  return (
    <View
      style={[styles.container, { width: SIDE_PANEL_WIDTH }]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Universal top: mode circles + org switcher */}
        <PanelHeader />

        {/* Divider */}
        <View style={styles.divider} />

        {/* Screen-specific content */}
        {isMessages
          ? <MessagesPanel />
          : isPhone
            ? <PhonePanel />
            : isNexus
              ? <NexusPanel />
              : isMode
                ? <ModePanel />
                : <DefaultPanel pathname={pathname} />
        }
      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#2F3336',
    marginVertical: 8,
  },
});
