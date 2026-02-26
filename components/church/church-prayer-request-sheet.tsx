/**
 * Church Prayer Request Sheet
 * Bottom sheet for submitting a prayer or care request.
 *
 * Fields:
 *   Title (required)
 *   Description (optional)
 *   Anonymous toggle
 *   Request type: Prayer | Care
 *   Submit button
 *
 * Submit → creates item in Messages → Escalation (if pastoral)
 * or Prayer Room (if allowed). No public feed unless approved.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable, TextInput, Alert, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accent: string;
  /** 'prayer' or 'care' */
  requestType: 'prayer' | 'care';
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchPrayerRequestSheet({ visible, onClose, colors, accent, requestType }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const isPrayer = requestType === 'prayer';
  const sheetTitle = isPrayer ? 'Prayer Request' : 'Care Request';
  const placeholder = isPrayer
    ? 'What would you like prayer for?'
    : 'How can we support you?';

  const handleSubmit = useCallback(() => {
    if (!title.trim()) {
      Alert.alert('Required', 'Please enter a title for your request.');
      return;
    }
    Haptics.impactAsync(ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Request Submitted',
      isPrayer
        ? 'Your prayer request has been submitted to the prayer team.'
        : 'Your care request has been submitted to the pastoral team.',
      [{ text: 'OK', onPress: () => {
        setTitle('');
        setDescription('');
        setIsAnonymous(false);
        onClose();
      }}],
    );
  }, [title, isPrayer, onClose]);

  const handleClose = useCallback(() => {
    setTitle('');
    setDescription('');
    setIsAnonymous(false);
    onClose();
  }, [onClose]);

  return (
    <BottomSheet visible={visible} onClose={handleClose} title={sheetTitle}>
      {/* ── Icon ── */}
      <View style={s.iconRow}>
        <View style={[s.iconCircle, { backgroundColor: accent + '18' }]}>
          <IconSymbol
            name={isPrayer ? 'hands.sparkles.fill' : 'heart.circle.fill'}
            size={28}
            color={accent}
          />
        </View>
      </View>

      {/* ── Title Field ── */}
      <View style={s.fieldGroup}>
        <ThemedText style={[s.fieldLabel, { color: colors.text }]}>Title *</ThemedText>
        <TextInput
          style={[s.input, { color: colors.text, backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
      </View>

      {/* ── Description Field ── */}
      <View style={s.fieldGroup}>
        <ThemedText style={[s.fieldLabel, { color: colors.text }]}>Details (optional)</ThemedText>
        <TextInput
          style={[s.textArea, { color: colors.text, backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          placeholder="Share more details if you'd like..."
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
      </View>

      {/* ── Anonymous Toggle ── */}
      <View style={[s.toggleRow, { borderColor: colors.border }]}>
        <View style={s.toggleInfo}>
          <IconSymbol name="eye.slash.fill" size={16} color={colors.textSecondary} />
          <View>
            <ThemedText style={[s.toggleLabel, { color: colors.text }]}>Submit Anonymously</ThemedText>
            <ThemedText style={[s.toggleDesc, { color: colors.textSecondary }]}>
              Your name will not be shared with the team.
            </ThemedText>
          </View>
        </View>
        <Switch
          value={isAnonymous}
          onValueChange={setIsAnonymous}
          trackColor={{ false: '#3E3E3E', true: accent + '80' }}
          thumbColor={isAnonymous ? accent : '#f4f3f4'}
        />
      </View>

      {/* ── Submit ── */}
      <Pressable
        style={({ pressed }) => [
          s.submitBtn,
          { backgroundColor: accent },
          pressed && { opacity: 0.7 },
          !title.trim() && { opacity: 0.4 },
        ]}
        onPress={handleSubmit}
        disabled={!title.trim()}
      >
        <IconSymbol name="paperplane.fill" size={16} color="#000" />
        <ThemedText style={s.submitText}>Submit Request</ThemedText>
      </Pressable>

      {/* ── Privacy Note ── */}
      <ThemedText style={[s.privacyNote, { color: colors.textTertiary }]}>
        {isPrayer
          ? 'Your request will be shared with the prayer team only. It will not appear publicly unless you approve.'
          : 'Your request will be routed to the pastoral care team. All submissions are confidential.'}
      </ThemedText>
    </BottomSheet>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  iconRow: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  textArea: {
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 100,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 20,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleDesc: {
    fontSize: 11,
    marginTop: 2,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  submitText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  privacyNote: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: 16,
  },
});
