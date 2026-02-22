/**
 * Compose Sheet — bottom sheet for composing new feed posts.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { FeedPostType, FeedFilter } from '@/data/mock-messages';

const POST_TYPES: { key: FeedPostType; label: string }[] = [
  { key: 'update', label: 'Update' },
  { key: 'clip', label: 'Clip' },
  { key: 'practice', label: 'Practice' },
  { key: 'culture', label: 'Culture' },
  { key: 'poll', label: 'Poll' },
];

const AUDIENCES: { key: FeedFilter; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'staff', label: 'Staff Only' },
  { key: 'players', label: 'Players' },
  { key: 'parents', label: 'Parents' },
];

export function ComposeSheet() {
  const [postType, setPostType] = useState<FeedPostType>('update');
  const [audience, setAudience] = useState<FeedFilter>('team');
  const [text, setText] = useState('');

  const handlePost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Mock — no persistence
    setText('');
  };

  return (
    <View style={styles.container}>
      {/* Post Type Selector */}
      <ThemedText style={styles.label}>Post Type</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {POST_TYPES.map((pt) => {
          const isActive = postType === pt.key;
          return (
            <Pressable
              key={pt.key}
              style={[styles.pill, { backgroundColor: isActive ? '#FFFFFF' : '#0B0F14' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setPostType(pt.key);
              }}
            >
              <ThemedText style={[styles.pillText, { color: isActive ? '#000' : '#A1A1AA' }]}>
                {pt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Text Input */}
      <TextInput
        style={styles.input}
        placeholder="What's on your mind?"
        placeholderTextColor="#555"
        multiline
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />

      {/* Audience Selector */}
      <ThemedText style={styles.label}>Audience</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {AUDIENCES.map((a) => {
          const isActive = audience === a.key;
          return (
            <Pressable
              key={a.key}
              style={[styles.pill, { backgroundColor: isActive ? '#FFFFFF' : '#0B0F14' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setAudience(a.key);
              }}
            >
              <ThemedText style={[styles.pillText, { color: isActive ? '#000' : '#A1A1AA' }]}>
                {a.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Post Button */}
      <Pressable
        style={({ pressed }) => [
          styles.postBtn,
          { opacity: pressed ? 0.7 : 1, backgroundColor: text.trim() ? '#FFFFFF' : '#333' },
        ]}
        onPress={handlePost}
        disabled={!text.trim()}
      >
        <ThemedText style={[styles.postBtnText, { color: text.trim() ? '#000' : '#666' }]}>
          Post
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: Spacing.xs,
  },
  pillScroll: {
    flexGrow: 0,
    marginBottom: Spacing.md,
  },
  pillRow: {
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 15,
    color: '#FFFFFF',
    minHeight: 100,
    marginBottom: Spacing.md,
  },
  postBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
  },
  postBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
