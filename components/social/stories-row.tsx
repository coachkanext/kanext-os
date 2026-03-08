/**
 * StoriesRow — horizontal scrollable row of story avatars.
 * White ring = unseen, gray ring = seen. First item = "You" with blue "+" badge.
 */

import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import type { StoryUser } from '@/data/mock-social';

const C = {
  unseenRing: '#FFFFFF',
  seenRing: '#52525B',
  avatarBg: '#1C1C1E',
  avatarText: '#FFFFFF',
  nameText: '#A1A1AA',
  youBadgeBg: '#1D9BF0',
  youBadgeIcon: '#FFFFFF',
};

interface StoriesRowProps {
  stories: StoryUser[];
  onStoryPress: (user: StoryUser) => void;
}

export function StoriesRow({ stories, onStoryPress }: StoriesRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {stories.map((user) => (
        <Pressable
          key={user.id}
          style={styles.storyItem}
          onPress={() => onStoryPress(user)}
        >
          <View
            style={[
              styles.ringContainer,
              {
                borderColor: user.isYou
                  ? 'transparent'
                  : user.hasUnseenStory
                    ? C.unseenRing
                    : C.seenRing,
              },
            ]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user.initials}</Text>
            </View>
          </View>
          {user.isYou && (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>+</Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={1}>
            {user.isYou ? 'You' : user.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  ringContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.avatarBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.avatarText,
  },
  youBadge: {
    position: 'absolute',
    bottom: 18,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.youBadgeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  youBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.youBadgeIcon,
    marginTop: -1,
  },
  name: {
    fontSize: 12,
    color: C.nameText,
    marginTop: 4,
    textAlign: 'center',
    width: 68,
  },
});
