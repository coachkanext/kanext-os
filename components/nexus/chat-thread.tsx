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
import type { Message, SimulationResult, SavedSimulation } from '@/types';

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatThread({ messages, isLoading = false }: ChatThreadProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList>(null);
  const { getSimulation, getSavedSimulation, openSimulation } = useNexusContext();

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
        <ThemedText style={[styles.quote, { color: colors.textSecondary }]}>
          The magic you're looking for{'\n'}is in the work you're avoiding
        </ThemedText>
        <ThemedText style={[styles.attribution, { color: colors.textTertiary }]}>
          — Chris Williamson
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
    paddingHorizontal: Spacing.xl,
  },
  quote: {
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 34,
    opacity: 0.7,
  },
  attribution: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    opacity: 0.5,
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
