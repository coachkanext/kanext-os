/**
 * AskNexusCta — "Ask Nexus about this" call-to-action block.
 * Placed at the bottom of scrollable video content.
 */

import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, ModeColors } from '@/constants/theme';
import { useMode } from '@/context/app-context';
import { openAskNexus } from '@/utils/global-ask-nexus';

export function AskNexusCta() {
  const mode = useMode();
  const glyphColor = ModeColors[mode].nexusGlyph;

  return (
    <Pressable
      style={({ pressed }) => [styles.container, pressed && { opacity: 0.8 }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        openAskNexus({ screen: '/nexus', mode });
      }}
    >
      <IconSymbol name="figure.mind.and.body" size={18} color={glyphColor} />
      <ThemedText style={styles.label}>Ask Nexus about this</ThemedText>
      <IconSymbol name="chevron.right" size={14} color={glyphColor + '80'} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#111',
    borderRadius: 12,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.lg,
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#f5f5f5',
  },
});
