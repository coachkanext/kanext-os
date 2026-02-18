/**
 * Mode Selector Component
 * Modal dropdown for switching between app modes.
 */

import React from 'react';
import { View, Pressable, Modal, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';

const MODES: { id: Mode; label: string }[] = [
  { id: 'sports', label: 'Sports' },
  { id: 'competition', label: 'Competition' },
  { id: 'church', label: 'Church' },
  { id: 'education', label: 'Education' },
  { id: 'business', label: 'Business' },
];

interface ModeSelectorProps {
  visible: boolean;
  currentMode: Mode;
  onSelect: (mode: Mode) => void;
  onClose: () => void;
}

export function ModeSelector({
  visible,
  currentMode,
  onSelect,
  onClose,
}: ModeSelectorProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const handleSelect = (mode: Mode) => {
    onSelect(mode);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View
          style={[
            styles.container,
            { backgroundColor: colors.card },
          ]}
        >
          <ThemedText style={styles.title}>Select Mode</ThemedText>

          {MODES.map((mode) => {
            const isSelected = mode.id === currentMode;
            const modeColor = ModeColors[mode.id].primary;

            return (
              <Pressable
                key={mode.id}
                style={({ pressed }) => [
                  styles.option,
                  {
                    backgroundColor: isSelected
                      ? colors.backgroundSecondary
                      : pressed
                      ? colors.backgroundSecondary
                      : 'transparent',
                  },
                ]}
                onPress={() => handleSelect(mode.id)}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.modeIndicator,
                      { backgroundColor: modeColor },
                    ]}
                  />
                  <ThemedText
                    style={[
                      styles.optionText,
                      isSelected && { fontWeight: '600' },
                    ]}
                  >
                    {mode.label}
                  </ThemedText>
                </View>
                {isSelected && (
                  <IconSymbol
                    name="chevron.right"
                    size={16}
                    color={modeColor}
                  />
                )}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 320,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  optionText: {
    fontSize: 16,
  },
});
