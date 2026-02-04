/**
 * Nexus Screen
 * Universal reasoning surface - the primary intelligence interface.
 * Per spec: Nexus answers "What does this mean?" - reasoning only, no state mutation.
 */

import React from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function NexusScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Canvas Area */}
      <View style={styles.canvas}>
        {/* Watermark */}
        <View style={styles.watermarkContainer}>
          <ThemedText style={[styles.watermark, { color: colors.textTertiary }]}>
            NEXUS
          </ThemedText>
        </View>
      </View>

      {/* Input Bar */}
      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Ask anything..."
            placeholderTextColor={colors.textTertiary}
            multiline
          />
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              { backgroundColor: Brand.nexus, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <IconSymbol name="arrow.up" size={18} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermarkContainer: {
    alignItems: 'center',
  },
  watermark: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 8,
    opacity: 0.1,
  },
  inputBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: Spacing.sm,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
