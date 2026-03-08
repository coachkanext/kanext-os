/**
 * Message Bubble Component
 * Renders a single message in the Nexus chat thread.
 * Supports: v2 rich messages (link chips, structured blocks, receipts,
 * confirmations, escalations), simulation cards, saved simulation snapshots,
 * and eval cards.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SimulationCard } from './simulation-card';
import { SimulationSnapshot } from './simulation-snapshot';
import { EvalCard } from './eval-card';
import { LinkChipRow } from './link-chip';
import { StructuredBlocks } from './structured-block';
import { ReceiptBubble } from './receipt-bubble';
import { ConfirmationBubble } from './confirmation-bubble';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-nexus';
import { InlinePlayerCard } from './inline-player-card';
import { InlineStatTable } from './inline-stat-table';
import { InlineKRCard } from './inline-kr-card';
import { isMessageV2 } from '@/types/nexus-v2';
import type { Message, SimulationResult, SavedSimulation, EvalSnapshot } from '@/types';
import type { MessageV2, LinkChip } from '@/types/nexus-v2';

interface MessageBubbleProps {
  message: Message | MessageV2;
  simulation?: SimulationResult;
  savedSimulation?: SavedSimulation;
  evalSnapshot?: EvalSnapshot;
  onViewSimulation?: (sim: SimulationResult) => void;
  onRerunSimulation?: (sim: SimulationResult) => void;
  onViewSavedSimulation?: (sim: SavedSimulation) => void;
  onViewEval?: (eval_: EvalSnapshot) => void;
  onSaveEval?: (eval_: EvalSnapshot) => void;
  onChipPress?: (chip: LinkChip) => void;
  onConfirmAction?: (messageId: string) => void;
  onCancelAction?: (messageId: string) => void;
  onEscalationChoice?: (messageId: string, action: string) => void;
}

export function MessageBubble({
  message,
  simulation,
  savedSimulation,
  evalSnapshot,
  onViewSimulation,
  onRerunSimulation,
  onViewSavedSimulation,
  onViewEval,
  onSaveEval,
  onChipPress,
  onConfirmAction,
  onCancelAction,
  onEscalationChoice,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const isUser = message.role === 'user';
  const v2 = isMessageV2(message) ? message : null;

  // Legacy v1 metadata checks
  const meta = message.metadata as Record<string, any> | undefined;
  const hasSimulation = meta?.isSimulation && simulation;
  const hasSavedSimulation = meta?.isSavedSimulation && savedSimulation;
  const hasEval = meta?.isEval && evalSnapshot;

  // ── Receipt-only message (no bubble wrapper) ──
  if (v2?.messageType === 'receipt' && v2.receipt) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        <ReceiptBubble receipt={v2.receipt} onChipPress={onChipPress} />
        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatMessageTime(message.timestamp)}
        </ThemedText>
      </View>
    );
  }

  // ── Confirmation-only message (no bubble wrapper) ──
  if (v2?.messageType === 'confirmation' && v2.confirmation) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        <ConfirmationBubble
          confirmation={v2.confirmation}
          onConfirm={() => onConfirmAction?.(message.id)}
          onCancel={() => onCancelAction?.(message.id)}
        />
        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatMessageTime(message.timestamp)}
        </ThemedText>
      </View>
    );
  }

  // ── Escalation message ──
  if (v2?.messageType === 'escalation' && v2.escalation) {
    const esc = v2.escalation;
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: '#0B0F14' }]}>
          {v2.content ? (
            <ThemedText style={[styles.messageText, { color: colors.text }]}>
              {v2.content}
            </ThemedText>
          ) : null}

          <View style={[styles.escalationBox, { borderLeftColor: '#F59E0B', backgroundColor: 'rgba(245,158,11,0.06)' }]}>
            <ThemedText style={[styles.escalationReason, { color: colors.textSecondary }]}>
              {esc.reason}
            </ThemedText>
            <ThemedText style={[styles.escalationTarget, { color: colors.textTertiary }]}>
              Best route: {esc.target_room} → {esc.target_owner}
            </ThemedText>
          </View>

          {esc.options.map((opt, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.escalationOption,
                { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => onEscalationChoice?.(message.id, opt.action)}
            >
              <ThemedText style={[styles.escalationOptionNum, { color: accent }]}>
                {i + 1}
              </ThemedText>
              <ThemedText style={[styles.escalationOptionLabel, { color: colors.text }]}>
                {opt.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatMessageTime(message.timestamp)}
        </ThemedText>
      </View>
    );
  }

  // ── Inline player card message ──
  if (v2?.messageType === 'player_card' && v2.playerCard) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        {v2.content ? (
          <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: '#0B0F14' }]}>
            <ThemedText style={[styles.messageText, { color: colors.text }]}>{v2.content}</ThemedText>
          </View>
        ) : null}
        <InlinePlayerCard data={v2.playerCard} />
        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatMessageTime(message.timestamp)}
        </ThemedText>
      </View>
    );
  }

  // ── Inline stat table message ──
  if (v2?.messageType === 'stat_table' && v2.statTable) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        {v2.content ? (
          <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: '#0B0F14' }]}>
            <ThemedText style={[styles.messageText, { color: colors.text }]}>{v2.content}</ThemedText>
          </View>
        ) : null}
        <InlineStatTable data={v2.statTable} />
        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatMessageTime(message.timestamp)}
        </ThemedText>
      </View>
    );
  }

  // ── Inline KR card message ──
  if (v2?.messageType === 'kr_card' && v2.krCard) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        {v2.content ? (
          <View style={[styles.bubble, styles.assistantBubble, { backgroundColor: '#0B0F14' }]}>
            <ThemedText style={[styles.messageText, { color: colors.text }]}>{v2.content}</ThemedText>
          </View>
        ) : null}
        <InlineKRCard data={v2.krCard} />
        <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
          {formatMessageTime(message.timestamp)}
        </ThemedText>
      </View>
    );
  }

  // ── Standard message (text / v2 text with rich content) ──
  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: '#1A1F2E' }]
            : [styles.assistantBubble, { backgroundColor: '#0B0F14' }],
        ]}
      >
        {message.content ? (
          <ThemedText
            style={[
              styles.messageText,
              isUser ? styles.userText : { color: colors.text },
            ]}
          >
            {message.content}
          </ThemedText>
        ) : null}

        {/* v2 structured blocks */}
        {v2?.structuredBlocks && v2.structuredBlocks.length > 0 && (
          <StructuredBlocks blocks={v2.structuredBlocks} />
        )}

        {/* v2 link chips */}
        {v2?.linkChips && v2.linkChips.length > 0 && (
          <LinkChipRow chips={v2.linkChips} onPress={onChipPress} />
        )}
      </View>

      {/* Legacy: Simulation Card */}
      {hasSimulation && (
        <View style={styles.simulationContainer}>
          <SimulationCard
            simulation={simulation}
            onViewFull={onViewSimulation || (() => {})}
            onRerun={onRerunSimulation}
          />
        </View>
      )}

      {/* Legacy: Saved Simulation Snapshot */}
      {hasSavedSimulation && (
        <View style={styles.simulationContainer}>
          <SimulationSnapshot
            simulation={savedSimulation}
            onViewFull={onViewSavedSimulation || (() => {})}
          />
        </View>
      )}

      {/* Legacy: Eval Card */}
      {hasEval && (
        <View style={styles.simulationContainer}>
          <EvalCard
            evalSnapshot={evalSnapshot}
            onViewFull={onViewEval}
            onSave={onSaveEval}
          />
        </View>
      )}

      <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
        {formatMessageTime(message.timestamp)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    maxWidth: '85%',
  },
  userContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  userBubble: {
    borderBottomRightRadius: BorderRadius.sm,
  },
  assistantBubble: {
    borderBottomLeftRadius: BorderRadius.sm,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 11,
    marginTop: Spacing.xs,
  },
  simulationContainer: {
    marginTop: Spacing.sm,
    marginLeft: -Spacing.sm,
    marginRight: -Spacing.sm,
    maxWidth: 400,
  },

  // Escalation styles
  escalationBox: {
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm + 2,
    marginTop: 8,
    marginBottom: 8,
  },
  escalationReason: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  escalationTarget: {
    fontSize: 12,
  },
  escalationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
    gap: 10,
  },
  escalationOptionNum: {
    fontSize: 14,
    fontWeight: '700',
    width: 20,
    textAlign: 'center',
  },
  escalationOptionLabel: {
    fontSize: 13.5,
    fontWeight: '500',
  },
});
