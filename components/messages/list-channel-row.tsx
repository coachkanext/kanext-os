/**
 * ListChannelRow — Channel row item for the Lists screen.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { IconSymbolName } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface ListChannelRowProps {
  icon: IconSymbolName;
  title: string;
  description: string;
  unreadCount?: number;
  onPress: () => void;
}

export function ListChannelRow({
  icon,
  title,
  description,
  unreadCount,
  onPress,
}: ListChannelRowProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? '#191919' : 'transparent' },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      <View style={styles.iconCircle}>
        <IconSymbol name={icon} size={20} color="#6e6e6e" />
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.description} numberOfLines={1}>
          {description}
        </ThemedText>
      </View>
      {unreadCount != null && unreadCount > 0 && (
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{unreadCount}</ThemedText>
        </View>
      )}
      <IconSymbol name="chevron.right" size={16} color="#555" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f5f5f5',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#6e6e6e',
  },
  badge: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },
});
