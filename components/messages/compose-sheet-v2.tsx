/**
 * Compose Sheet V2 — 5 post types + required target selector + role gating.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';
import { COMPOSE_POST_TYPES } from '@/data/mock-messages';
import { useOperatingRole } from '@/context/app-context';
import { getAvailablePostTypes } from '@/utils/messages-permissions';
import type { ComposePostType, FeedFilter } from '@/data/mock-messages';

const AUDIENCES: { key: FeedFilter; label: string }[] = [
  { key: 'team', label: 'Team' },
  { key: 'staff', label: 'Staff Only' },
  { key: 'players', label: 'Players' },
  { key: 'parents', label: 'Parents' },
  { key: 'recruiting', label: 'Recruiting' },
];

interface ComposeSheetV2Props {
  onClose: () => void;
}

export function ComposeSheetV2({ onClose }: ComposeSheetV2Props) {
  const role = useOperatingRole();
  const availableTypes = getAvailablePostTypes(role);
  const visibleTypes = COMPOSE_POST_TYPES.filter((pt) => availableTypes.includes(pt.key));

  const [postType, setPostType] = useState<ComposePostType>(availableTypes[0] ?? 'update');
  const [audience, setAudience] = useState<FeedFilter>('team');
  const [text, setText] = useState('');

  const handlePost = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setText('');
    onClose();
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
        {visibleTypes.map((pt) => {
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
              <IconSymbol
                name={pt.icon as any}
                size={14}
                color={isActive ? '#000' : '#A1A1AA'}
              />
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
        placeholder={postType === 'staff_note' ? 'Staff-only note...' : "What's on your mind?"}
        placeholderTextColor="#555"
        multiline
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />

      {/* Audience Selector */}
      <ThemedText style={styles.label}>Target Audience (required)</ThemedText>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
