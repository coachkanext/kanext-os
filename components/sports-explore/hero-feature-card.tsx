/**
 * HeroFeatureCard — Large featured content card at top of explore pages.
 * Shows matchup/school info, league badge, hook text, and Watch CTA.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface HeroFeatureCardProps {
  title: string;
  subtitle: string;
  hookText: string;
  badgeText: string;
  ctaLabel: string;
  thumbnailColor: string;
  leftInitials?: string;
  rightInitials?: string;
}

export function HeroFeatureCard({
  title,
  subtitle,
  hookText,
  badgeText,
  ctaLabel,
  thumbnailColor,
  leftInitials,
  rightInitials,
}: HeroFeatureCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Pressable
      style={[styles.container, { backgroundColor: thumbnailColor }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
    >
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.85)']}
        style={styles.gradient}
      />

      {/* Badge */}
      <View style={styles.badgeRow}>
        <View style={styles.badge}>
          <ThemedText style={styles.badgeText}>{badgeText}</ThemedText>
        </View>
      </View>

      {/* Matchup initials */}
      {leftInitials && rightInitials && (
        <View style={styles.matchupRow}>
          <View style={styles.teamCircle}>
            <ThemedText style={styles.teamInitials}>{leftInitials}</ThemedText>
          </View>
          <ThemedText style={styles.vsText}>vs</ThemedText>
          <View style={styles.teamCircle}>
            <ThemedText style={styles.teamInitials}>{rightInitials}</ThemedText>
          </View>
        </View>
      )}

      {/* Bottom content */}
      <View style={styles.bottomContent}>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
        <ThemedText style={styles.title} numberOfLines={2}>{title}</ThemedText>
        <ThemedText style={styles.hookText} numberOfLines={2}>{hookText}</ThemedText>
        <View style={styles.ctaRow}>
          <View style={styles.ctaButton}>
            <IconSymbol name="play.fill" size={12} color="#000" />
            <ThemedText style={styles.ctaText}>{ctaLabel}</ThemedText>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    aspectRatio: 16 / 9,
    marginBottom: Spacing.lg,
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  badgeRow: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.8,
  },
  matchupRow: {
    position: 'absolute',
    top: '30%',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  teamCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  teamInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
  },
  vsText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
  },
  bottomContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  hookText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
    marginBottom: 10,
  },
  ctaRow: {
    flexDirection: 'row',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 6,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },
});
