/**
 * Home — Auto-playing video area + 4-row icon grid.
 * Video = 35% of usable screen height (status bar to bottom safe area).
 * Grid centered in remaining space. Semi-circle sits at bottom center.
 * Horizontal swipes anywhere on the screen page through videos.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet, useWindowDimensions, PanResponder } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VisualArea } from '@/components/home/visual-area';
import { IconGrid } from '@/components/home/icon-grid';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMode } from '@/context/app-context';
import { nextVideoPage, prevVideoPage } from '@/utils/global-video-pager';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const mode = useMode();

  // Horizontal swipe → page through videos
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) => {
          // Only claim horizontal swipes (not vertical scroll or taps)
          return Math.abs(gs.dx) > 25 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5;
        },
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dx < -60) {
            // Swipe left → next video
            nextVideoPage();
          } else if (gs.dx > 60) {
            // Swipe right → previous video
            prevVideoPage();
          }
        },
      }),
    [],
  );

  // Non-Sports modes: full-screen Coming Soon
  if (mode !== 'sports') {
    return (
      <View style={[styles.container, styles.comingSoonContainer, { paddingTop: insets.top }]}>
        <View style={styles.comingSoonCircle}>
          <IconSymbol name="sparkles" size={36} color="#A1A1AA" />
        </View>
        <Text style={styles.comingSoonTitle}>Coming Soon</Text>
        <Text style={styles.comingSoonSub}>This mode is not yet available.</Text>
      </View>
    );
  }

  // Usable height = screen minus status bar minus bottom safe area (no tab bar)
  const usableHeight = height - insets.top - insets.bottom;
  const videoHeight = usableHeight * 0.35;

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <View style={{ height: videoHeight + insets.top }}>
        <VisualArea />
      </View>
      <View style={styles.gridWrapper}>
        <IconGrid />
        {/* Space for the universal footer bar (49px + divider) */}
        <View style={{ height: 50 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  comingSoonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  comingSoonCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  comingSoonSub: {
    fontSize: 15,
    color: '#52525B',
  },
});
