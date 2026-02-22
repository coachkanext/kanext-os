/**
 * HomeHeroVideoCard — Large hero video card for Sports Dashboard top.
 * RBAC-aware CTA: Coach → "Open Film Room", Player → "Watch Team Film", Fan → "Watch Latest".
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SportsRoleLens } from '@/utils/sports-rbac';

// =============================================================================
// TYPES
// =============================================================================

export interface HeroVideo {
  id: string;
  title: string;
  subtitle: string;
  thumbnailColor: string;
  duration: string;
  isLive?: boolean;
  isPinned?: boolean;
  source: 'pinned' | 'coach_shared' | 'practice' | 'scout' | 'placeholder';
}

interface HomeHeroVideoCardProps {
  role: SportsRoleLens;
  heroVideo?: HeroVideo;
  onPress?: () => void;
}

// =============================================================================
// HERO VIDEO SELECTION (deterministic priority)
// =============================================================================

const PINNED_HERO: HeroVideo = {
  id: 'hero-pinned',
  title: 'Providence Scout Breakdown — Transition Defense',
  subtitle: 'Staff Film · Uploaded 2h ago',
  thumbnailColor: '#1D9BF0',
  duration: '8:42',
  isPinned: true,
  source: 'pinned',
};

const COACH_SHARED_HERO: HeroVideo = {
  id: 'hero-shared',
  title: 'Tuesday Practice — Half-Court Sets',
  subtitle: 'Carroll Film · 5h ago',
  thumbnailColor: '#0B0F14',
  duration: '14:20',
  source: 'coach_shared',
};

const PLACEHOLDER_HERO: HeroVideo = {
  id: 'hero-placeholder',
  title: 'No Film Pinned Yet',
  subtitle: 'Pin a video to feature it here',
  thumbnailColor: '#0B0F14',
  duration: '',
  source: 'placeholder',
};

function selectHeroVideo(): HeroVideo {
  // Priority: Pinned → Coach Shared (last 7d) → Practice/Scout → Placeholder
  if (PINNED_HERO) return PINNED_HERO;
  if (COACH_SHARED_HERO) return COACH_SHARED_HERO;
  return PLACEHOLDER_HERO;
}

// =============================================================================
// CTA LABEL BY ROLE
// =============================================================================

function getHeroCTA(role: SportsRoleLens): string {
  switch (role) {
    case 'R1':
    case 'R3':
      return 'Open Film Room';
    case 'R2':
      return 'Watch Team Film';
    case 'R4':
    case 'R5':
    default:
      return 'Watch Latest';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function HomeHeroVideoCard({ role, heroVideo, onPress }: HomeHeroVideoCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const video = heroVideo ?? selectHeroVideo();
  const ctaLabel = getHeroCTA(role);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.heroCard,
          { backgroundColor: video.thumbnailColor, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={handlePress}
      >
        {/* LIVE badge */}
        {video.isLive && (
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <ThemedText style={styles.liveText}>LIVE</ThemedText>
          </View>
        )}

        {/* Pinned badge */}
        {video.isPinned && !video.isLive && (
          <View style={styles.pinnedBadge}>
            <IconSymbol name="pin.fill" size={10} color="#fff" />
            <ThemedText style={styles.pinnedText}>PINNED</ThemedText>
          </View>
        )}

        {/* Center play icon */}
        <View style={styles.playOverlay}>
          <View style={styles.playCircle}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </View>
        </View>

        {/* Duration badge */}
        {video.duration !== '' && (
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>{video.duration}</ThemedText>
          </View>
        )}

        {/* Bottom gradient area */}
        <View style={styles.bottomOverlay}>
          <ThemedText style={styles.heroTitle} numberOfLines={2}>
            {video.title}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle} numberOfLines={1}>
            {video.subtitle}
          </ThemedText>
        </View>
      </Pressable>

      {/* CTA row */}
      <Pressable
        style={({ pressed }) => [
          styles.ctaRow,
          { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handlePress}
      >
        <IconSymbol name="play.rectangle.fill" size={16} color={colors.text} />
        <ThemedText style={[styles.ctaText, { color: colors.text }]}>{ctaLabel}</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  heroCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinnedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2,
  },
  pinnedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 52,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 30,
    zIndex: 2,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 3,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  ctaText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});
