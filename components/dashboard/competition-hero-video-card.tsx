/**
 * CompetitionHeroVideoCard — Large broadcast hero card for Competition Dashboard top.
 * RBAC-aware CTA: Admin → "Open Live Broadcast/Ops", Team → "Watch + Team Ops",
 * Driver/Fan → "Watch Live".
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { CompetitionRoleLens } from '@/utils/competition-rbac';

// =============================================================================
// TYPES
// =============================================================================

export type BroadcastStatus = 'live' | 'upcoming' | 'replay';

export interface BroadcastHero {
  id: string;
  title: string;
  subtitle: string;
  thumbnailColor: string;
  status: BroadcastStatus;
  broadcastUrl?: string;
  nextSessionLabel?: string;
  nextSessionTime?: string;
  trackName?: string;
  duration?: string;
}

interface CompetitionHeroVideoCardProps {
  roleLens: CompetitionRoleLens;
  broadcast?: BroadcastHero;
  onPress?: () => void;
}

// =============================================================================
// MOCK BROADCAST DATA (deterministic selection)
// =============================================================================

const LIVE_BROADCAST: BroadcastHero = {
  id: 'bcast-live',
  title: 'KaNeXT League — Round 2 LIVE',
  subtitle: 'Portland International Raceway · Main Race',
  thumbnailColor: '#0B0F14',
  status: 'live',
  trackName: 'Portland International Raceway',
};

const UPCOMING_BROADCAST: BroadcastHero = {
  id: 'bcast-upcoming',
  title: 'KaNeXT League — Round 2',
  subtitle: 'Portland International Raceway',
  thumbnailColor: '#0B0F14',
  status: 'upcoming',
  nextSessionLabel: 'Qualifying',
  nextSessionTime: '12:30 PM',
  trackName: 'Portland International Raceway',
};

const REPLAY_BROADCAST: BroadcastHero = {
  id: 'bcast-replay',
  title: 'K-1 Round 1 — Austin Replay',
  subtitle: 'Circuit of the Americas · Main Race',
  thumbnailColor: '#0B0F14',
  status: 'replay',
  trackName: 'Circuit of the Americas',
  duration: '1:42:08',
};

function selectBroadcast(): BroadcastHero {
  // Priority: LIVE → Upcoming within 24h → Latest replay
  // For demo, return upcoming (most common pre-race state)
  return UPCOMING_BROADCAST;
}

// =============================================================================
// CTA LABEL BY ROLE
// =============================================================================

function getBroadcastCTA(role: CompetitionRoleLens, status: BroadcastStatus): string {
  if (status === 'live') {
    switch (role) {
      case 'CO1':
        return 'Open Live Broadcast';
      case 'CO2':
        return 'Watch + Team Ops';
      case 'CO3':
      case 'CO4':
      case 'CO5':
      case 'CO10':
      case 'CO11':
      default:
        return 'Watch Live';
    }
  }
  if (status === 'upcoming') {
    switch (role) {
      case 'CO1':
        return 'Open Live Ops';
      case 'CO2':
        return 'Watch + Team Ops';
      case 'CO3':
      case 'CO4':
      case 'CO5':
      case 'CO10':
      case 'CO11':
      default:
        return 'Watch Live';
    }
  }
  // replay
  return 'Watch Replay';
}

// =============================================================================
// STATUS LABEL + COLOR
// =============================================================================

function getStatusConfig(status: BroadcastStatus): { label: string; color: string; bgColor: string } {
  switch (status) {
    case 'live':
      return { label: 'LIVE', color: '#fff', bgColor: '#EF4444' };
    case 'upcoming':
      return { label: 'UPCOMING', color: '#fff', bgColor: '#F59E0B' };
    case 'replay':
      return { label: 'REPLAY', color: '#fff', bgColor: '#1D9BF0' };
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function CompetitionHeroVideoCard({ roleLens, broadcast, onPress }: CompetitionHeroVideoCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const bcast = broadcast ?? selectBroadcast();
  const ctaLabel = getBroadcastCTA(roleLens, bcast.status);
  const statusConfig = getStatusConfig(bcast.status);

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.();
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={({ pressed }) => [
          styles.heroCard,
          { backgroundColor: bcast.thumbnailColor, opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={handlePress}
      >
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bgColor }]}>
          {bcast.status === 'live' && <View style={styles.liveDot} />}
          <ThemedText style={[styles.statusText, { color: statusConfig.color }]}>
            {statusConfig.label}
          </ThemedText>
        </View>

        {/* Center play icon */}
        <View style={styles.playOverlay}>
          <View style={styles.playCircle}>
            <IconSymbol
              name={bcast.status === 'live' ? 'antenna.radiowaves.left.and.right' : 'play.fill'}
              size={28}
              color="#fff"
            />
          </View>
        </View>

        {/* Duration badge (replay only) */}
        {bcast.duration && (
          <View style={styles.durationBadge}>
            <ThemedText style={styles.durationText}>{bcast.duration}</ThemedText>
          </View>
        )}

        {/* Bottom info */}
        <View style={styles.bottomOverlay}>
          <ThemedText style={styles.heroTitle} numberOfLines={2}>
            {bcast.title}
          </ThemedText>
          <ThemedText style={styles.heroSubtitle} numberOfLines={1}>
            {bcast.subtitle}
          </ThemedText>
          {/* Next session info (upcoming only) */}
          {bcast.status === 'upcoming' && bcast.nextSessionLabel && (
            <View style={styles.nextSessionRow}>
              <IconSymbol name="clock.fill" size={12} color="rgba(255,255,255,0.7)" />
              <ThemedText style={styles.nextSessionText}>
                Next: {bcast.nextSessionLabel} {bcast.nextSessionTime}
              </ThemedText>
            </View>
          )}
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
        <IconSymbol
          name={bcast.status === 'live' ? 'antenna.radiowaves.left.and.right' : 'play.rectangle.fill'}
          size={16}
          color={colors.text}
        />
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
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  heroCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
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
  statusText: {
    fontSize: 10,
    fontWeight: '800',
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
    paddingLeft: 2,
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
  nextSessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  nextSessionText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '600',
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
