/**
 * Team Header — team logo + name + quick actions (Share, Invite).
 * Used in My Team tab of Video Home.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface TeamHeaderProps {
  teamName: string;
  teamInitials: string;
  teamColor: string;
  onShare?: () => void;
}

export function TeamHeader({ teamName, teamInitials, teamColor, onShare }: TeamHeaderProps) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/coach/team-channel' as any);
      }}
    >
      <View style={[styles.logo, { backgroundColor: teamColor }]}>
        <ThemedText style={styles.logoText}>{teamInitials}</ThemedText>
      </View>
      <View style={styles.info}>
        <ThemedText style={styles.name}>{teamName}</ThemedText>
        <ThemedText style={styles.sub}>Team Channel</ThemedText>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.actionBtn}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onShare?.();
          }}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color="#6e6e6e" />
        </Pressable>
        <Pressable
          style={styles.actionBtn}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol name="person.badge.plus" size={16} color="#6e6e6e" />
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#111',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 12,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },
  logoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 2,
  },
  sub: {
    fontSize: 13,
    color: '#6e6e6e',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
