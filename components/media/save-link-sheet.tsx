/**
 * Save Link Sheet — bottom sheet form for saving an external coaching link.
 * URL, title, timestamp, notes, tags, target roles, visibility, assign toggle.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Spacing, BorderRadius } from '@/constants/theme';
import type { TargetRole, LinkVisibility } from '@/data/mock-coach-library';

interface SaveLinkSheetProps {
  visible: boolean;
  onClose: () => void;
}

const TARGET_OPTIONS: TargetRole[] = ['Guards', 'Wings', 'Bigs', 'All'];
const VISIBILITY_OPTIONS: LinkVisibility[] = ['Staff', 'Team', 'Player', '1:1'];
const TAG_OPTIONS = ['offense', 'defense', 'shooting', 'finishing', 'PnR', 'transition', 'rebounding', 'conditioning', 'system'];

export function SaveLinkSheet({ visible, onClose }: SaveLinkSheetProps) {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [targetRole, setTargetRole] = useState<TargetRole>('All');
  const [visibility, setVisibility] = useState<LinkVisibility>('Team');

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Keyboard.dismiss();
    // Mock save — in production, persist to backend
    setUrl('');
    setTitle('');
    setTimestamp('');
    setNotes('');
    setSelectedTags(new Set());
    setTargetRole('All');
    setVisibility('Team');
    onClose();
  };

  const canSave = url.trim().length > 0 && title.trim().length > 0;

  return (
    <BottomSheet useModal visible={visible} onClose={onClose} title="Save Link">
      {/* URL */}
      <View style={styles.field}>
        <Text style={styles.label}>URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://..."
          placeholderTextColor="#52525B"
          autoCapitalize="none"
          keyboardType="url"
        />
      </View>

      {/* Title */}
      <View style={styles.field}>
        <Text style={styles.label}>TITLE</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Video or article title"
          placeholderTextColor="#52525B"
        />
      </View>

      {/* Timestamp */}
      <View style={styles.field}>
        <Text style={styles.label}>TIMESTAMP (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          value={timestamp}
          onChangeText={setTimestamp}
          placeholder="e.g. 2:30"
          placeholderTextColor="#52525B"
          keyboardType="numbers-and-punctuation"
        />
      </View>

      {/* Notes */}
      <View style={styles.field}>
        <Text style={styles.label}>NOTES</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Add context or teaching points..."
          placeholderTextColor="#52525B"
          multiline
        />
      </View>

      {/* Tags */}
      <View style={styles.field}>
        <Text style={styles.label}>TAGS</Text>
        <View style={styles.chipRow}>
          {TAG_OPTIONS.map((tag) => {
            const active = selectedTags.has(tag);
            return (
              <Pressable
                key={tag}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleTag(tag);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{tag}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Target roles */}
      <View style={styles.field}>
        <Text style={styles.label}>TARGET</Text>
        <View style={styles.chipRow}>
          {TARGET_OPTIONS.map((role) => {
            const active = targetRole === role;
            return (
              <Pressable
                key={role}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setTargetRole(role);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{role}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Visibility */}
      <View style={styles.field}>
        <Text style={styles.label}>VISIBILITY</Text>
        <View style={styles.chipRow}>
          {VISIBILITY_OPTIONS.map((vis) => {
            const active = visibility === vis;
            return (
              <Pressable
                key={vis}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setVisibility(vis);
                }}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{vis}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Save button */}
      <Pressable
        style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
        onPress={handleSave}
        disabled={!canSave}
      >
        <Text style={[styles.saveText, !canSave && styles.saveTextDisabled]}>Save Link</Text>
      </Pressable>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 9,
    fontWeight: '700',
    color: '#A1A1AA',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0B0F14',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 10,
    fontSize: 14,
    color: '#FFFFFF',
  },
  textArea: {
    minHeight: 60,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
  },
  chipActive: {
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  chipTextActive: {
    color: '#111',
  },
  saveBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnDisabled: {
    backgroundColor: '#0B0F14',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  saveTextDisabled: {
    color: '#555',
  },
});
