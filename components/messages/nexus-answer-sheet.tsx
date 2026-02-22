/**
 * NexusAnswerSheet — BottomSheet for answering a Nexus escalation.
 * Shows question + context at top, TextInput for answer,
 * two buttons: "Add to Nexus" (primary) / "Private Reply" (secondary).
 */

import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { NexusEscalationV3 } from '@/types';

interface NexusAnswerSheetProps {
  escalation: NexusEscalationV3 | null;
  onClose: () => void;
  onAddToNexus?: (answer: string) => void;
  onPrivateReply?: (answer: string) => void;
}

export function NexusAnswerSheet({ escalation, onClose, onAddToNexus, onPrivateReply }: NexusAnswerSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [answer, setAnswer] = useState('');

  const handleAddToNexus = () => {
    if (!answer.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onAddToNexus?.(answer.trim());
    setAnswer('');
    onClose();
  };

  const handlePrivateReply = () => {
    if (!answer.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPrivateReply?.(answer.trim());
    setAnswer('');
    onClose();
  };

  return (
    <BottomSheet
      visible={escalation !== null}
      onClose={() => {
        setAnswer('');
        onClose();
      }}
      title="Answer Question"
      useModal
    >
      {escalation && (
        <View style={styles.container}>
          {/* Question context */}
          <View style={[styles.questionCard, { backgroundColor: colors.backgroundTertiary }]}>
            <View style={styles.askerRow}>
              <View style={[styles.askerAvatar, { backgroundColor: '#1D9BF020' }]}>
                <ThemedText style={[styles.askerInitials, { color: '#1D9BF0' }]}>
                  {escalation.askerInitials}
                </ThemedText>
              </View>
              <View style={styles.askerInfo}>
                <ThemedText style={[styles.askerName, { color: colors.text }]}>
                  {escalation.askerName}
                </ThemedText>
                <ThemedText style={[styles.askerRole, { color: colors.textTertiary }]}>
                  {escalation.askerRole}
                </ThemedText>
              </View>
            </View>

            <ThemedText style={[styles.questionText, { color: colors.text }]}>
              {escalation.question}
            </ThemedText>

            <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
              Viewing: {escalation.viewingContext}
            </ThemedText>
          </View>

          {/* Answer input */}
          <TextInput
            style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text, borderColor: colors.border }]}
            placeholder="Type your answer..."
            placeholderTextColor={colors.textTertiary}
            value={answer}
            onChangeText={setAnswer}
            multiline
            textAlignVertical="top"
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryBtn,
                { opacity: pressed ? 0.8 : 1, backgroundColor: answer.trim() ? '#1D9BF0' : '#1D9BF040' },
              ]}
              onPress={handleAddToNexus}
              disabled={!answer.trim()}
            >
              <ThemedText style={styles.primaryBtnText}>Add to Nexus</ThemedText>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.secondaryBtn,
                { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={handlePrivateReply}
              disabled={!answer.trim()}
            >
              <ThemedText style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                Private Reply
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  questionCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 10,
  },
  askerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  askerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  askerInitials: {
    fontSize: 13,
    fontWeight: '600',
  },
  askerInfo: {
    flex: 1,
  },
  askerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  askerRole: {
    fontSize: 12,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  contextLabel: {
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontSize: 15,
    lineHeight: 21,
    minHeight: 100,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
