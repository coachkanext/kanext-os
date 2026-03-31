/**
 * Upload Form — Create form with link input, caption, tags, share toggles.
 * All actions show Alert.alert('Coming Soon') placeholder.
 */

import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';

export function UploadForm() {
  const [link, setLink] = useState('');
  const [caption, setCaption] = useState('');
  const [shareTeam, setShareTeam] = useState(true);
  const [sharePublic, setSharePublic] = useState(false);

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Coming Soon', 'Video upload will be available in a future update.');
  };

  const handleCreateReel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Coming Soon', 'Reel creation will be available in a future update.');
  };

  return (
    <View style={styles.container}>
      {/* Link Input */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Video Link</ThemedText>
        <View style={styles.inputRow}>
          <IconSymbol name="link" size={16} color="#555" />
          <TextInput
            style={styles.input}
            placeholder="Paste Hudl, YouTube, or Synergy link..."
            placeholderTextColor="#555"
            value={link}
            onChangeText={setLink}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {/* Caption */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Caption</ThemedText>
        <TextInput
          style={[styles.input, styles.captionInput]}
          placeholder="Add a caption..."
          placeholderTextColor="#555"
          value={caption}
          onChangeText={setCaption}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Tags */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Tags</ThemedText>
        <View style={styles.tagRow}>
          {['Offense', 'Defense', 'Highlight', 'Drill', 'Scout'].map((tag) => (
            <Pressable
              key={tag}
              style={styles.tagPill}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText style={styles.tagText}>{tag}</ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Share Toggles */}
      <View style={styles.field}>
        <ThemedText style={styles.label}>Share With</ThemedText>
        <View style={styles.toggleRow}>
          <Pressable
            style={[styles.togglePill, shareTeam && styles.toggleActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setShareTeam(!shareTeam);
            }}
          >
            <ThemedText style={[styles.toggleText, shareTeam && styles.toggleActiveText]}>
              Team
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.togglePill, sharePublic && styles.toggleActive]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSharePublic(!sharePublic);
            }}
          >
            <ThemedText style={[styles.toggleText, sharePublic && styles.toggleActiveText]}>
              Public
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={handleCreate}>
          <IconSymbol name="arrow.up" size={16} color="#000" />
          <ThemedText style={styles.primaryText}>Upload Video</ThemedText>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={handleCreateReel}>
          <IconSymbol name="play.rectangle.fill" size={16} color="#FFFFFF" />
          <ThemedText style={styles.secondaryText}>Create Reel</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  field: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9C9790',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 10,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: 10,
  },
  captionInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#0B0F14',
  },
  tagText: {
    fontSize: 13,
    color: '#9C9790',
    fontWeight: '500',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  togglePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#0B0F14',
  },
  toggleActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9C9790',
  },
  toggleActiveText: {
    color: '#000',
  },
  actions: {
    gap: 10,
    marginTop: Spacing.sm,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0B0F14',
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
  },
  secondaryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
