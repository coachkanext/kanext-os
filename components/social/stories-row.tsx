/**
 * StoriesRow — horizontal scrollable row of story avatars.
 * White ring = unseen, gray ring = seen. First item = "You" with blue "+" badge.
 */

import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { StoryUser } from '@/data/mock-social';

interface StoriesRowProps {
  stories: StoryUser[];
  onStoryPress: (user: StoryUser) => void;
}

export function StoriesRow({ stories, onStoryPress }: StoriesRowProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

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
          {user.isYou ? (
            <View style={styles.plainContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.initials}</Text>
              </View>
            </View>
          ) : user.hasUnseenStory ? (
            <LinearGradient
              colors={['#f09433', '#e6683c', '#dc2743', '#cc2366', '#bc1888']}
              start={{ x: 0.0, y: 1.0 }}
              end={{ x: 1.0, y: 0.0 }}
              style={styles.gradientRing}
            >
              <View style={[styles.ringInner, { backgroundColor: C.bg }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{user.initials}</Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={[styles.ringContainer, { borderColor: C.muted }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user.initials}</Text>
              </View>
            </View>
          )}
          {user.isYou ? (
            <View style={styles.youBadge}>
              <Text style={styles.youBadgeText}>+</Text>
            </View>
          ) : null}
          <Text style={styles.name} numberOfLines={1}>
            {user.isYou ? 'You' : user.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
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
  gradientRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plainContainer: {
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
  },
  youBadge: {
    position: 'absolute',
    bottom: 18,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1D9BF0',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.bg,
  },
  youBadgeText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.label,
    marginTop: -1,
  },
  name: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 4,
    textAlign: 'center',
    width: 68,
  },
});
