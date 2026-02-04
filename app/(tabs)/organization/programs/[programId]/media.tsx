/**
 * Media Page
 * Displays external links to highlights, videos, articles, and other media content.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getProgramById,
  getMediaItems,
  INSTITUTION,
  type MediaItem,
} from '@/data/mock-sports';

// =============================================================================
// COMPONENTS
// =============================================================================

interface BackButtonProps {
  onPress: () => void;
  colors: typeof Colors.light;
}

function BackButton({ onPress, colors }: BackButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <IconSymbol name="chevron.left" size={20} color={colors.tint} />
      <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

function getMediaIcon(type: MediaItem['type']): SymbolViewProps['name'] {
  switch (type) {
    case 'video':
      return 'play.rectangle.fill';
    case 'article':
      return 'doc.text.fill';
    case 'photo_gallery':
      return 'photo.on.rectangle.angled';
    case 'audio':
      return 'waveform';
    default:
      return 'link';
  }
}

function getMediaTypeLabel(type: MediaItem['type']): string {
  switch (type) {
    case 'video':
      return 'Video';
    case 'article':
      return 'Article';
    case 'photo_gallery':
      return 'Photos';
    case 'audio':
      return 'Audio';
    default:
      return 'Media';
  }
}

interface MediaCardProps {
  item: MediaItem;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function MediaCard({ item, onPress, colors, accentColor }: MediaCardProps) {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.mediaCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {/* Thumbnail placeholder */}
      <View style={[styles.thumbnail, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={getMediaIcon(item.type)} size={32} color={accentColor} />
      </View>

      {/* Content */}
      <View style={styles.mediaContent}>
        <View style={styles.mediaHeader}>
          <View style={[styles.typeBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[styles.typeBadgeText, { color: accentColor }]}>
              {getMediaTypeLabel(item.type)}
            </ThemedText>
          </View>
          {item.duration && (
            <ThemedText style={[styles.duration, { color: colors.textTertiary }]}>
              {item.duration}
            </ThemedText>
          )}
        </View>

        <ThemedText style={styles.mediaTitle} numberOfLines={2}>
          {item.title}
        </ThemedText>

        {item.description && (
          <ThemedText
            style={[styles.mediaDescription, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {item.description}
          </ThemedText>
        )}

        <View style={styles.mediaFooter}>
          <ThemedText style={[styles.mediaSource, { color: colors.textTertiary }]}>
            {item.source}
          </ThemedText>
          <ThemedText style={[styles.mediaDate, { color: colors.textTertiary }]}>
            {formatDate(item.date)}
          </ThemedText>
        </View>
      </View>

      <IconSymbol name="arrow.up.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MediaScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { programId } = useLocalSearchParams<{ programId: string }>();

  const modeColors = ModeColors.sports;
  const program = getProgramById(programId);
  const mediaItems = getMediaItems();

  if (!program) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Program not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleMediaPress = async (item: MediaItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(item.url);
    } catch (error) {
      console.log('Could not open URL:', item.url);
    }
  };

  // Group media by type for potential filtering
  const videoItems = mediaItems.filter((m) => m.type === 'video');
  const articleItems = mediaItems.filter((m) => m.type === 'article');
  const otherItems = mediaItems.filter(
    (m) => m.type !== 'video' && m.type !== 'article'
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Media
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {INSTITUTION.nickname} {program.name} • Highlights & News
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {mediaItems.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="play.circle.fill"
              size={48}
              color={colors.textTertiary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No media available yet
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Videos Section */}
            {videoItems.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    name="play.rectangle.fill"
                    size={16}
                    color={modeColors.primary}
                  />
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Videos ({videoItems.length})
                  </ThemedText>
                </View>
                <View style={styles.mediaList}>
                  {videoItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onPress={() => handleMediaPress(item)}
                      colors={colors}
                      accentColor={modeColors.primary}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Articles Section */}
            {articleItems.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    name="doc.text.fill"
                    size={16}
                    color={modeColors.primary}
                  />
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Articles ({articleItems.length})
                  </ThemedText>
                </View>
                <View style={styles.mediaList}>
                  {articleItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onPress={() => handleMediaPress(item)}
                      colors={colors}
                      accentColor={modeColors.primary}
                    />
                  ))}
                </View>
              </>
            )}

            {/* Other Media Section */}
            {otherItems.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <IconSymbol
                    name="photo.on.rectangle.angled"
                    size={16}
                    color={modeColors.primary}
                  />
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Other Media ({otherItems.length})
                  </ThemedText>
                </View>
                <View style={styles.mediaList}>
                  {otherItems.map((item) => (
                    <MediaCard
                      key={item.id}
                      item={item}
                      onPress={() => handleMediaPress(item)}
                      colors={colors}
                      accentColor={modeColors.primary}
                    />
                  ))}
                </View>
              </>
            )}
          </>
        )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  titleContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mediaList: {
    gap: Spacing.sm,
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  mediaContent: {
    flex: 1,
  },
  mediaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  duration: {
    fontSize: 11,
    marginLeft: Spacing.xs,
  },
  mediaTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  mediaDescription: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  mediaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  mediaSource: {
    fontSize: 11,
  },
  mediaDate: {
    fontSize: 11,
    marginLeft: Spacing.sm,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
  },
});
