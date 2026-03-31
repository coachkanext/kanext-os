/**
 * Engine Detail Sheet — Bottom sheet for Engine 00-06 detail.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Engine } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

interface EngineDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  engine: Engine;
}

export function EngineDetailSheet({ visible, onClose, engine }: EngineDetailSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={engine.name} useModal>
      <View style={styles.container}>
        {/* Purpose */}
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Purpose</ThemedText>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {engine.purpose}
        </ThemedText>

        {/* Inputs */}
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Inputs</ThemedText>
        {engine.inputs.map((input, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bulletIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
              <IconSymbol name="arrow.right" size={10} color={ACCENT_GOLD} />
            </View>
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{input}</ThemedText>
          </View>
        ))}

        {/* Outputs */}
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Outputs</ThemedText>
        {engine.outputs.map((output, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bulletIcon, { backgroundColor: '#5A8A6E15' }]}>
              <IconSymbol name="arrow.right" size={10} color="#5A8A6E" />
            </View>
            <ThemedText style={[styles.bulletText, { color: colors.text }]}>{output}</ThemedText>
          </View>
        ))}

        {/* Why It Matters */}
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>Why It Matters</ThemedText>
        {engine.whyItMatters.map((reason, i) => (
          <View key={i} style={styles.bulletRow}>
            <View style={[styles.bullet, { backgroundColor: ACCENT_GOLD }]} />
            <ThemedText style={[styles.bulletText, { color: colors.textSecondary }]}>{reason}</ThemedText>
          </View>
        ))}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  bulletIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
    marginRight: Spacing.sm,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
