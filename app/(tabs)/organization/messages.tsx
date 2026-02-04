/**
 * Messages Screen
 * Church sermons/messages for Church mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MESSAGES, formatMessageDate } from '@/data/mock-church';
import type { ChurchMessage } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface MessageCardProps {
  message: ChurchMessage;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function MessageCard({ message, colors, accentColor, onPress }: MessageCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.messageCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.playButton, { backgroundColor: accentColor }]}>
        <IconSymbol
          name={message.mediaType === 'video' ? 'play.fill' : 'headphones'}
          size={20}
          color="#FFFFFF"
        />
      </View>
      <View style={styles.messageContent}>
        <ThemedText style={styles.messageTitle} numberOfLines={1}>
          {message.title}
        </ThemedText>
        <ThemedText style={[styles.messageSpeaker, { color: colors.textSecondary }]}>
          {message.speaker}
        </ThemedText>
        <View style={styles.messageMeta}>
          <ThemedText style={[styles.messageDate, { color: colors.textTertiary }]}>
            {formatMessageDate(message.date)}
          </ThemedText>
          {message.duration && (
            <>
              <View style={[styles.metaDot, { backgroundColor: colors.textTertiary }]} />
              <ThemedText style={[styles.messageDuration, { color: colors.textTertiary }]}>
                {message.duration}
              </ThemedText>
            </>
          )}
        </View>
        {message.seriesName && (
          <View style={[styles.seriesBadge, { backgroundColor: accentColor + '15' }]}>
            <ThemedText style={[styles.seriesText, { color: accentColor }]}>
              {message.seriesName}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MessagesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.church;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleMessagePress = (message: ChurchMessage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (message.externalUrl) {
      Linking.openURL(message.externalUrl);
    } else {
      // In production, would open message player
      console.log('Play message:', message.title);
    }
  };

  // Get unique series names
  const seriesNames = [...new Set(MESSAGES.filter((m) => m.seriesName).map((m) => m.seriesName))];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Messages
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {MESSAGES.length} sermons available
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Series */}
        {seriesNames.length > 0 && (
          <View style={styles.seriesSection}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              CURRENT SERIES
            </ThemedText>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.seriesScroll}
            >
              {seriesNames.map((series) => (
                <Pressable
                  key={series}
                  style={[styles.seriesCard, { backgroundColor: modeColors.primary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <IconSymbol name="book.fill" size={24} color="#FFFFFF" />
                  <ThemedText style={styles.seriesCardTitle}>{series}</ThemedText>
                  <ThemedText style={styles.seriesCardCount}>
                    {MESSAGES.filter((m) => m.seriesName === series).length} messages
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recent Messages */}
        <View style={styles.messagesSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            RECENT MESSAGES
          </ThemedText>
          {MESSAGES.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              colors={colors}
              accentColor={modeColors.primary}
              onPress={() => handleMessagePress(message)}
            />
          ))}
        </View>

        {/* Watch Live Banner */}
        <Pressable
          style={[styles.liveBanner, { backgroundColor: modeColors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <View style={styles.liveBannerContent}>
            <View style={styles.liveIndicator}>
              <View style={styles.liveDot} />
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
            <ThemedText style={styles.liveBannerTitle}>Watch Live Sundays</ThemedText>
            <ThemedText style={styles.liveBannerSubtitle}>
              8:00 AM & 10:30 AM PT
            </ThemedText>
          </View>
          <IconSymbol name="play.circle.fill" size={40} color="#FFFFFF" />
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },

  // Series Section
  seriesSection: {
    marginBottom: Spacing.lg,
  },
  seriesScroll: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  seriesCard: {
    width: 140,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  seriesCardTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: Spacing.sm,
    textAlign: 'center',
  },
  seriesCardCount: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 2,
  },

  // Messages Section
  messagesSection: {
    marginBottom: Spacing.lg,
  },

  // Message Card
  messageCard: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  messageContent: {
    flex: 1,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageSpeaker: {
    fontSize: 14,
    marginTop: 2,
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  messageDate: {
    fontSize: 12,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 6,
  },
  messageDuration: {
    fontSize: 12,
  },
  seriesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  seriesText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Live Banner
  liveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  liveBannerContent: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveBannerTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  liveBannerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 2,
  },
});
