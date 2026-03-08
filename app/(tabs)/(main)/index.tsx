/**
 * Home — Auto-playing video area + icon grid.
 * Video = 42% of usable screen height (status bar to bottom safe area).
 * Grid centered in remaining space.
 * Video hero has 3 fluid-swipe pages (default = center).
 * Swiping left/right ANYWHERE on the home screen (video or grid) pages the video.
 * Edge overscroll (past page 0 or page 2) opens Settings (left) / Nexus (right).
 */

import React, { useCallback, useMemo } from 'react';
import { View, PanResponder, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { VisualArea } from '@/components/home/visual-area';
import { IconGrid } from '@/components/home/icon-grid';
import { openSettingsPanel } from '@/utils/global-settings-panel';
import { getVideoPage, getMaxVideoPage, nextVideoPage, prevVideoPage } from '@/utils/global-video-pager';
import { enableSlideAnimation } from '@/utils/global-footer-swipe';
import { pushNexusFromInner } from '@/utils/global-inner-nav';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  // Edge callbacks for video hero overscroll
  const handleEdgeLeft = useCallback(() => {
    enableSlideAnimation();
    openSettingsPanel();
  }, []);

  const handleEdgeRight = useCallback(() => {
    enableSlideAnimation();
    pushNexusFromInner();
  }, []);

  // Swipe on grid area → page video first, then settings/Nexus at edges
  const gridPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          Math.abs(gs.dx) > 25 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dx > 60) {
            // Swipe right: page video backward, or open settings at edge
            const page = getVideoPage();
            if (page > 0) {
              prevVideoPage();
            } else {
              openSettingsPanel();
            }
          } else if (gs.dx < -60) {
            // Swipe left: page video forward, or go to Nexus at edge
            const page = getVideoPage();
            const maxPage = getMaxVideoPage();
            if (page < maxPage) {
              nextVideoPage();
            } else {
              enableSlideAnimation();
              pushNexusFromInner();
            }
          }
        },
      }),
    [],
  );

  // Usable height = screen minus status bar minus bottom safe area (no tab bar)
  const usableHeight = height - insets.top - insets.bottom;
  const videoHeight = usableHeight * 0.42;

  return (
    <View style={styles.container}>
      <View style={{ height: videoHeight + insets.top }}>
        <VisualArea onEdgeLeft={handleEdgeLeft} onEdgeRight={handleEdgeRight} />
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
