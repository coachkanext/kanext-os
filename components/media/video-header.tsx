/**
 * VideoHeader — shared header for all Video tab screens.
 * Title + optional right content + Search/Bell icons.
 */

import React, { type ReactNode } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface VideoHeaderProps {
  title: string;
  rightContent?: ReactNode;
  onSearch?: () => void;
  onNotifications?: () => void;
}

export function VideoHeader({ title, rightContent, onSearch, onNotifications }: VideoHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm }]}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <View style={styles.right}>
        {rightContent}
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSearch?.();
          }}
          style={styles.iconBtn}
        >
          <IconSymbol name="magnifyingglass" size={16} color="#A1A1AA" />
        </Pressable>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNotifications?.();
          }}
          style={styles.iconBtn}
        >
          <IconSymbol name="bell.fill" size={16} color="#A1A1AA" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBtn: {
    padding: 4,
  },
});
