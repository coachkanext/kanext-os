/**
 * Message Bubble Component
 * Renders a single message in the Nexus chat thread.
 * Supports simulation cards for simulation-type messages.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SimulationCard } from './simulation-card';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatMessageTime } from '@/data/mock-nexus';
import type { Message, SimulationResult } from '@/types';

interface MessageBubbleProps {
  message: Message;
  simulation?: SimulationResult;
  onViewSimulation?: (sim: SimulationResult) => void;
  onRerunSimulation?: (sim: SimulationResult) => void;
}

export function MessageBubble({
  message,
  simulation,
  onViewSimulation,
  onRerunSimulation,
}: MessageBubbleProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isUser = message.role === 'user';
  const hasSimulation = message.metadata?.isSimulation && simulation;

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.userBubble, { backgroundColor: Brand.nexus }]
            : [styles.assistantBubble, { backgroundColor: colors.backgroundSecondary }],
        ]}
      >
        <ThemedText
          style={[
            styles.messageText,
            isUser ? styles.userText : { color: colors.text },
          ]}
        >
          {message.content}
        </ThemedText>
      </View>

      {/* Simulation Card */}
      {hasSimulation && (
        <View style={styles.simulationContainer}>
          <SimulationCard
            simulation={simulation}
            onViewFull={onViewSimulation || (() => {})}
            onRerun={onRerunSimulation}
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
});
