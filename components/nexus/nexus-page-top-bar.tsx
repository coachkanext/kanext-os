/**
 * NexusPageTopBar — single top bar for the Nexus screen.
 * Left: "Nexus 1.0" in light gray. Right: "+" button in white.
 * "+" clears current conversation and starts fresh.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

interface NexusPageTopBarProps {
  onPlusPress: () => void;
}

export function NexusPageTopBar({ onPlusPress }: NexusPageTopBarProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nexus 1.0</Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPlusPress();
        }}
        hitSlop={8}
      >
        <IconSymbol name="plus" size={22} color={C.label} />
      </Pressable>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
  },
});
