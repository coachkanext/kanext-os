/**
 * Visibility Picker — radio pill row for share visibility levels.
 * Options: Public / Org / Team / Staff / Assigned.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import type { ShareVisibility } from '@/data/mock-video';

const OPTIONS: { key: ShareVisibility; label: string }[] = [
  { key: 'public', label: 'Public' },
  { key: 'org', label: 'Org' },
  { key: 'team', label: 'Team' },
  { key: 'staff', label: 'Staff' },
  { key: 'assigned', label: 'Assigned' },
];

interface VisibilityPickerProps {
  value: ShareVisibility;
  onChange: (value: ShareVisibility) => void;
}

export function VisibilityPicker({ value, onChange }: VisibilityPickerProps) {
  return (
    <View style={styles.container}>
      {OPTIONS.map((opt) => {
        const isActive = value === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={[styles.pill, isActive && styles.activePill]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(opt.key);
            }}
          >
            <ThemedText style={[styles.label, isActive && styles.activeLabel]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#0B0F14',
  },
  activePill: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9C9790',
  },
  activeLabel: {
    color: '#000',
  },
});
