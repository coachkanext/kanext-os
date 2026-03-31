/**
 * NexusAnswerSheet — Q&A Thread view.
 * Shows: resolved banner, original question, Nexus attempt, human replies,
 * and bottom input for follow-up / "Mark resolved" button.
 */

import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-messages-v3';
import type { NexusEscalationV3 } from '@/types';

interface NexusAnswerSheetProps {
  escalation: NexusEscalationV3 | null;
  onClose: () => void;
}

export function NexusAnswerSheet({ escalation, onClose }: NexusAnswerSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [followUp, setFollowUp] = useState('');

  const isResolved = escalation?.status === 'answered_by_nexus' || escalation?.status === 'answered_by_coach';

  return (
    <BottomSheet
      visible={escalation !== null}
      onClose={() => {
        setFollowUp('');
        onClose();
      }}
      title="Q&A Thread"
      useModal
    >
      {escalation && (
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Resolved banner */}
            {isResolved && escalation.resolvedAnswer && (
              <View style={[styles.resolvedBanner, { backgroundColor: '#5A8A6E15' }]}>
                <View style={styles.resolvedHeader}>
                  <IconSymbol name="checkmark.seal.fill" size={16} color="#5A8A6E" />
                  <ThemedText style={styles.resolvedTitle}>Resolved Answer</ThemedText>
                  {escalation.answeredBy && (
                    <ThemedText style={[styles.resolvedBy, { color: colors.textTertiary }]}>
                      by {escalation.answeredBy}
                    </ThemedText>
                  )}
                </View>
                <ThemedText style={[styles.resolvedText, { color: colors.text }]}>
                  {escalation.resolvedAnswer}
                </ThemedText>
              </View>
            )}

            {/* Original question card */}
            <View style={[styles.questionCard, { backgroundColor: colors.backgroundTertiary }]}>
              <View style={styles.askerRow}>
                <View style={[styles.askerAvatar, { backgroundColor: `${accent}20` }]}>
                  <ThemedText style={[styles.askerInitials, { color: accent }]}>
                    {escalation.askerInitials}
                  </ThemedText>
                </View>
                <View style={styles.askerInfo}>
                  <ThemedText style={[styles.askerName, { color: colors.text }]}>
                    {escalation.askerName}
                  </ThemedText>
                  <ThemedText style={[styles.askerMeta, { color: colors.textTertiary }]}>
                    {escalation.askerRole} · {formatMessageTime(escalation.timestamp)}
                  </ThemedText>
                </View>
              </View>

              <ThemedText style={[styles.questionText, { color: colors.text }]}>
                {escalation.question}
              </ThemedText>

              {/* Context chips */}
              {escalation.contextChips && escalation.contextChips.length > 0 && (
                <View style={styles.chipsRow}>
                  {escalation.contextChips.map((chip, i) => (
                    <View key={i} style={[styles.chip, { backgroundColor: colors.backgroundSecondary }]}>
                      <ThemedText style={[styles.chipText, { color: colors.textSecondary }]}>
                        {chip.label}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}

              <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
                Viewing: {escalation.viewingContext}
              </ThemedText>
            </View>

            {/* Nexus attempt */}
            {escalation.nexusAttempt && (
              <View style={styles.replyBlock}>
                <View style={styles.replyHeader}>
                  <View style={[styles.nexusIcon, { backgroundColor: '#1A171420' }]}>
                    <IconSymbol name="sparkles" size={14} color="#1A1714" />
                  </View>
                  <View style={styles.replyHeaderInfo}>
                    <ThemedText style={[styles.replyName, { color: colors.text }]}>
                      Nexus
                    </ThemedText>
                    <ThemedText style={[styles.replyRole, { color: colors.textTertiary }]}>
                      AI Assistant
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.replyContent, { color: colors.text }]}>
                  {escalation.nexusAttempt}
                </ThemedText>
                {escalation.escalationTarget && escalation.status === 'escalated' && (
                  <View style={[styles.escalationNote, { backgroundColor: '#B8943E15' }]}>
                    <IconSymbol name="arrow.up.right" size={12} color="#B8943E" />
                    <ThemedText style={[styles.escalationText, { color: '#B8943E' }]}>
                      Escalated to {escalation.escalationTarget}
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            {/* Human replies */}
            {escalation.humanReplies && escalation.humanReplies.map((reply, i) => (
              <View key={i} style={styles.replyBlock}>
                <View style={styles.replyHeader}>
                  <View style={[styles.humanAvatar, { backgroundColor: `${accent}20` }]}>
                    <ThemedText style={[styles.humanAvatarText, { color: accent }]}>
                      {reply.initials}
                    </ThemedText>
                  </View>
                  <View style={styles.replyHeaderInfo}>
                    <ThemedText style={[styles.replyName, { color: colors.text }]}>
                      {reply.name}
                    </ThemedText>
                    <ThemedText style={[styles.replyRole, { color: colors.textTertiary }]}>
                      {reply.role} · {formatMessageTime(reply.timestamp)}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[styles.replyContent, { color: colors.text }]}>
                  {reply.content}
                </ThemedText>
              </View>
            ))}
          </ScrollView>

          {/* Bottom actions */}
          <View style={[styles.bottomBar, { borderTopColor: colors.border }]}>
            <TextInput
              style={[styles.input, { backgroundColor: colors.backgroundSecondary, color: colors.text }]}
              placeholder="Ask a follow-up..."
              placeholderTextColor={colors.textTertiary}
              value={followUp}
              onChangeText={setFollowUp}
            />
            {!isResolved && (
              <Pressable
                style={({ pressed }) => [
                  styles.resolveBtn,
                  { backgroundColor: '#5A8A6E', opacity: pressed ? 0.8 : 1 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onClose();
                }}
              >
                <ThemedText style={styles.resolveBtnText}>Mark Resolved</ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.md,
    paddingBottom: Spacing.md,
  },

  // Resolved banner
  resolvedBanner: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#5A8A6E',
  },
  resolvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resolvedTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#5A8A6E',
  },
  resolvedBy: {
    fontSize: 12,
  },
  resolvedText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Question card
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
  askerMeta: {
    fontSize: 12,
  },
  questionText: {
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  contextLabel: {
    fontSize: 12,
  },

  // Reply blocks
  replyBlock: {
    gap: 8,
    paddingLeft: 4,
  },
  replyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nexusIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  humanAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  humanAvatarText: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyHeaderInfo: {
    flex: 1,
  },
  replyName: {
    fontSize: 14,
    fontWeight: '600',
  },
  replyRole: {
    fontSize: 12,
  },
  replyContent: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 42,
  },
  escalationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    marginLeft: 42,
    alignSelf: 'flex-start',
  },
  escalationText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  resolveBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  resolveBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});
