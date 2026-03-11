/**
 * Home — Auto-playing video area + icon grid.
 * Video = 42% of usable screen height (status bar to bottom safe area).
 * Grid centered in remaining space.
 * Video hero has 3 self-contained swipe pages (default = middle). Dead ends at edges.
 * Grid swipes: right → open settings panel, left → go to Nexus.
 */

import React, { useMemo } from 'react';
import { View, PanResponder, StyleSheet, useWindowDimensions } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VisualArea } from '@/components/home/visual-area';
import { IconGrid } from '@/components/home/icon-grid';
import { openSettingsPanel } from '@/utils/global-settings-panel';
import { enableSlideAnimation } from '@/utils/global-footer-swipe';
import { pushNexusFromInner } from '@/utils/global-inner-nav';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const C = useColors();
  // Swipe on grid area → open panel (right) or Nexus (left)
  const gridPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          Math.abs(gs.dx) > 25 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dx > 60) {
            // Swipe right → open settings panel
            openSettingsPanel();
          } else if (gs.dx < -60) {
            // Swipe left → go to Nexus
            enableSlideAnimation();
            pushNexusFromInner();
          }
        },
      }),
    [],
  );

  // Usable height = screen minus status bar minus bottom safe area (no tab bar)
  const usableHeight = height - insets.top - insets.bottom;
  const videoHeight = usableHeight * 0.42;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={{ height: videoHeight + insets.top }}>
        <VisualArea />
      </View>
      <View style={styles.gridWrapper} {...gridPanResponder.panHandlers}>
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
});
