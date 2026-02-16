/**
 * Ask Nexus CTA — Shared contextual button that deep-links to Nexus.
 * Gold-bordered card with Nexus icon + label.
 */

import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';

interface AskNexusCTAProps {
  label: string;
  engineContext?: string;
}

export function AskNexusCTA({ label, engineContext }: AskNexusCTAProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const mode = useMode();
  const glyphColor = ModeColors[mode].nexusGlyph;
  const router = useRouter();

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/nexus' as any,
      params: engineContext ? { engine: engineContext } : undefined,
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: colors.card, borderColor: glyphColor + '40' },
        pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
      ]}
      onPress={handlePress}
    >
      <View style={[styles.iconWrap, { backgroundColor: glyphColor + '15' }]}>
        <IconSymbol name="figure.mind.and.body" size={20} color={glyphColor} />
      </View>
      <ThemedText style={[styles.label, { color: glyphColor }]}>{label}</ThemedText>
      <IconSymbol name="chevron.right" size={14} color={glyphColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginTop: Spacing.lg,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  label: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});
