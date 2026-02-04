/**
 * Chat Thread Component
 * Renders the list of messages in a Nexus conversation.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MessageBubble } from './message-bubble';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNexusContext } from '@/context/nexus-context';
import { useMode } from '@/context/app-context';
import type { Message, SimulationResult, SavedSimulation, Mode } from '@/types';

// Mode-specific empty state prompts
function getModePrompt(mode: Mode): string {
  switch (mode) {
    case 'sports':
      return 'Ask anything. Simulate matchups. Explore scenarios.';
    case 'enterprise':
      return 'Ask about company data, metrics, and strategies.';
    case 'church':
      return 'Plan events, explore ministries, and coordinate activities.';
    case 'education':
      return 'Ask about academics, schedules, and institutional data.';
    default:
      return 'Ask anything. Explore scenarios.';
  }
}

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatThread({ messages, isLoading = false }: ChatThreadProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList>(null);
  const { getSimulation, getSavedSimulation, openSimulation, sendMessage } = useNexusContext();
  const mode = useMode();

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleViewSimulation = useCallback(
    (sim: SimulationResult) => {
      openSimulation(sim.id);
    },
    [openSimulation]
  );

  const handleRerunSimulation = useCallback(
    (sim: SimulationResult) => {
      // In a real app, this would rerun with the same parameters
      console.log('Rerun simulation:', sim.id);
    },
    []
  );

  const handleViewSavedSimulation = useCallback(
    (sim: SavedSimulation) => {
      openSimulation(sim.id);
    },
    [openSimulation]
  );

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const simulation = item.metadata?.simulationId
        ? getSimulation(item.metadata.simulationId)
        : undefined;

      const savedSimulation = item.metadata?.isSavedSimulation && item.metadata?.simulationId
        ? getSavedSimulation(item.metadata.simulationId)
        : undefined;

      return (
        <MessageBubble
          message={item}
          simulation={simulation}
          savedSimulation={savedSimulation}
          onViewSimulation={handleViewSimulation}
          onRerunSimulation={handleRerunSimulation}
          onViewSavedSimulation={handleViewSavedSimulation}
        />
      );
    },
    [getSimulation, getSavedSimulation, handleViewSimulation, handleRerunSimulation, handleViewSavedSimulation]
  );

  if (messages.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.watermark, { color: colors.textTertiary }]}>
          NEXUS
        </ThemedText>
        <ThemedText style={[styles.emptyPrompt, { color: colors.textSecondary }]}>
          {getModePrompt(mode)}
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={renderMessage}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.textTertiary} />
          </View>
        ) : null
      }
    />
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watermark: {
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: 8,
    opacity: 0.1,
  },
  emptyPrompt: {
    fontSize: 15,
    marginTop: Spacing.md,
    textAlign: 'center',
    opacity: 0.6,
  },
  listContent: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
