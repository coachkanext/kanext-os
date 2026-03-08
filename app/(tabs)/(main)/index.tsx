/**
 * Home — Auto-playing video area + icon grid.
 * Video = 42% of usable screen height (status bar to bottom safe area).
 * Grid centered in remaining space.
 * Video hero has 3 fluid-swipe pages (default = center).
 * Edge overscroll on video hero opens Settings (left) / Nexus (right).
 * Grid area has no horizontal swipe gestures.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { VisualArea } from '@/components/home/visual-area';
import { IconGrid } from '@/components/home/icon-grid';
import { openSettingsPanel } from '@/utils/global-settings-panel';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Edge callbacks for video hero overscroll
  const handleEdgeLeft = useCallback(() => {
    openSettingsPanel();
  }, []);

  const handleEdgeRight = useCallback(() => {
    router.push('/nexus' as any);
  }, [router]);

  // Usable height = screen minus status bar minus bottom safe area (no tab bar)
  const usableHeight = height - insets.top - insets.bottom;
  const videoHeight = usableHeight * 0.42;

  return (
    <View style={styles.container}>
      <View style={{ height: videoHeight + insets.top }}>
        <VisualArea onEdgeLeft={handleEdgeLeft} onEdgeRight={handleEdgeRight} />
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
});
