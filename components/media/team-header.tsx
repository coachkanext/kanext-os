/**
 * Team Header — full team identity card with KR badge, record strip, and channel actions.
 * Used in My Team tab of Video Home.
 */

import React from 'react';
import { View, Pressable, Image, StyleSheet } from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';

interface TeamHeaderProps {
  teamName: string;
  teamLogo: ImageSourcePropType;
  level: string;
  conference: string;
  teamKR: number;
  offKR: number;
  defKR: number;
  record: string;
  confRecord: string;
  streak: string;
  tier: string;
  onShare?: () => void;
}

export function TeamHeader({
  teamName,
  teamLogo,
  level,
  conference,
  teamKR,
  offKR,
  defKR,
  record,
  confRecord,
  streak,
  tier,
  onShare,
}: TeamHeaderProps) {
  const router = useRouter();

  const isWinStreak = streak.startsWith('W');

  return (
    <Pressable
      style={styles.container}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/coach/team-channel' as any);
      }}
    >
      {/* Row 1: Identity + KR badge */}
      <View style={styles.identityRow}>
        <Image source={teamLogo} style={styles.logo} resizeMode="contain" />
        <View style={styles.nameBlock}>
          <ThemedText style={styles.name}>{teamName}</ThemedText>
          <ThemedText style={styles.subtitle}>
            {level} {'\u00B7'} {conference}
          </ThemedText>
        </View>
        <View style={styles.krBadge}>
          <ThemedText style={styles.krNumber}>{teamKR}</ThemedText>
          <ThemedText style={styles.krSplit}>
            O {offKR} · D {defKR}
          </ThemedText>
        </View>
      </View>

      {/* Row 2: Record strip */}
      <View style={styles.recordRow}>
        <ThemedText style={styles.record}>{record}</ThemedText>
        <ThemedText style={styles.confRecord}>({confRecord} conf)</ThemedText>
        <View
          style={[
            styles.streakChip,
            { backgroundColor: isWinStreak ? '#5A8A6E20' : '#B85C5C20' },
          ]}
        >
          <ThemedText
            style={[
              styles.streakText,
              { color: isWinStreak ? '#5A8A6E' : '#B85C5C' },
            ]}
          >
            {streak}
          </ThemedText>
        </View>
        <View style={styles.tierChip}>
          <ThemedText style={styles.tierText}>{tier}</ThemedText>
        </View>
      </View>

      {/* Row 3: Channel label + actions */}
      <View style={styles.channelRow}>
        <ThemedText style={styles.channelLabel}>Team Channel</ThemedText>
        <View style={styles.actions}>
          <Pressable
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onShare?.();
            }}
          >
            <IconSymbol name="square.and.arrow.up" size={16} color="#9C9790" />
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="person.badge.plus" size={16} color="#9C9790" />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: '#111',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: 12,
    gap: 12,
  },

  // Row 1 — identity
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginRight: 14,
  },
  nameBlock: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
    marginTop: 2,
  },
  krBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,245,245,0.06)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  krNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 30,
  },
  krSplit: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    marginTop: 2,
  },

  // Row 2 — record strip
  recordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  record: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  confRecord: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  streakChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tierChip: {
    backgroundColor: 'rgba(245,245,245,0.06)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },

  // Row 3 — channel + actions
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#0B0F14',
    paddingTop: 10,
  },
  channelLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#9C9790',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
