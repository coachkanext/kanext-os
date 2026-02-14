/**
 * You — personal media hub.
 * Profile header, My Uploads, My Reels, Saved, Watch History sections.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ReelCard } from '@/components/media/reel-card';
import { ClipCard } from '@/components/media/clip-card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { useOperatingRole } from '@/context/app-context';
import {
  MOCK_REELS,
  MOCK_VIDEO_CLIPS,
  MOCK_WATCH_HISTORY,
} from '@/data/mock-video';

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
      <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
        <ThemedText style={styles.seeAll}>See All</ThemedText>
      </Pressable>
    </View>
  );
}

export default function YouScreen() {
  const insets = useSafeAreaInsets();
  const role = useOperatingRole();

  // Mock profile data
  const displayName = role === 'head_coach' ? 'Coach Williams' : 'User';
  const initials = role === 'head_coach' ? 'CW' : 'U';

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <ThemedText style={styles.avatarText}>{initials}</ThemedText>
          </View>
          <View style={styles.profileInfo}>
            <ThemedText style={styles.profileName}>{displayName}</ThemedText>
            <View style={styles.roleBadge}>
              <ThemedText style={styles.roleText}>{role.replace('_', ' ')}</ThemedText>
            </View>
          </View>
        </View>

        {/* My Uploads */}
        <SectionHeader title="My Uploads" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
          style={styles.hScrollWrap}
        >
          {MOCK_VIDEO_CLIPS.filter((c) => c.source === 'Hudl').slice(0, 4).map((clip) => (
            <View key={clip.id} style={styles.clipWrap}>
              <ClipCard clip={clip} variant="grid" />
            </View>
          ))}
        </ScrollView>

        {/* My Reels */}
        <SectionHeader title="My Reels" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
          style={styles.hScrollWrap}
        >
          {MOCK_REELS.slice(0, 5).map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </ScrollView>

        {/* Saved */}
        <SectionHeader title="Saved" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hScroll}
          style={styles.hScrollWrap}
        >
          {MOCK_VIDEO_CLIPS.slice(0, 4).map((clip) => (
            <View key={clip.id} style={styles.clipWrap}>
              <ClipCard clip={clip} variant="grid" />
            </View>
          ))}
        </ScrollView>

        {/* Watch History */}
        <SectionHeader title="Watch History" />
        {MOCK_WATCH_HISTORY.slice(0, 5).map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.historyRow,
              { backgroundColor: pressed ? '#191919' : 'transparent' },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[styles.historyThumb, { backgroundColor: item.thumbnailColor }]}>
              <IconSymbol name="play.fill" size={10} color="#fff" />
            </View>
            <View style={styles.historyInfo}>
              <ThemedText style={styles.historyTitle} numberOfLines={1}>{item.title}</ThemedText>
              <ThemedText style={styles.historyMeta}>
                {item.contentType} · {item.progress}% watched
              </ThemedText>
            </View>
            <View style={styles.historyProgress}>
              <View style={styles.historyProgressBar}>
                <View style={[styles.historyProgressFill, { width: `${item.progress}%` }]} />
              </View>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    paddingBottom: 120,
  },

  // Profile
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#191919',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#191919',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6e6e6e',
    textTransform: 'capitalize',
  },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#f5f5f5',
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6e6e6e',
  },

  // Horizontal scrolls
  hScrollWrap: {
    flexGrow: 0,
    marginBottom: Spacing.xs,
  },
  hScroll: {
    paddingHorizontal: Spacing.md,
  },
  clipWrap: {
    width: 160,
  },

  // Watch history
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#1a1a1a',
  },
  historyThumb: {
    width: 40,
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  historyInfo: {
    flex: 1,
    marginRight: 10,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#f5f5f5',
    marginBottom: 2,
  },
  historyMeta: {
    fontSize: 12,
    color: '#6e6e6e',
    textTransform: 'capitalize',
  },
  historyProgress: {
    width: 48,
  },
  historyProgressBar: {
    height: 3,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
  },
  historyProgressFill: {
    height: 3,
    backgroundColor: '#f5f5f5',
    borderRadius: 2,
  },
});
