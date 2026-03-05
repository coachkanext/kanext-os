/**
 * Home — Auto-playing video area + 3x3 icon grid.
 * Video = 25% of usable screen height (status bar to tab bar).
 * Grid centered in remaining space.
 */

import React from 'react';
import { View, StyleSheet, Platform, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { VisualArea } from '@/components/home/visual-area';
import { IconGrid } from '@/components/home/icon-grid';
import { Layout } from '@/constants/theme';

export default function HomeScreen() {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tabBarHeight = Platform.OS === 'ios' ? Layout.tabBarHeight : 60;

  // Usable height = screen minus status bar minus tab bar
  const usableHeight = height - insets.top - tabBarHeight;
  const videoHeight = usableHeight * 0.35;

  return (
    <View style={styles.container}>
      <View style={{ height: videoHeight + insets.top }}>
        <VisualArea />
      </View>
      <View style={styles.gridWrapper}>
        <IconGrid />
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
    justifyContent: 'space-evenly',
  },
});
