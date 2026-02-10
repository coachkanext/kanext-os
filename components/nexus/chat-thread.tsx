/**
 * Chat Thread Component
 * Renders the list of messages in a Nexus conversation.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MessageBubble } from './message-bubble';
import { EvalThreadHeader } from './eval-thread-header';
import { SimThreadHeader } from './sim-thread-header';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNexusContext } from '@/context/nexus-context';
import type { Message, SimulationResult, SavedSimulation, Conversation, PlayerEvalConfig, SimulationThreadConfig } from '@/types';

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
  conversation?: Conversation | null;
}

export function ChatThread({ messages, isLoading = false, conversation }: ChatThreadProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList>(null);
  const { getSimulation, getSavedSimulation, openSimulation, getEvalSnapshot, updateConversationConfig, generatePlayerEval } = useNexusContext();

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

  // Eval thread handlers
  const handleEvalConfigChange = useCallback(
    (config: PlayerEvalConfig) => {
      if (conversation) {
        updateConversationConfig(conversation.id, config, undefined);
      }
    },
    [conversation, updateConversationConfig]
  );

  const handleGenerateEval = useCallback(() => {
    if (conversation?.evalConfig?.playerId && conversation.evalConfig.playerName && conversation.evalConfig.role) {
      generatePlayerEval(
        conversation.evalConfig.playerId,
        conversation.evalConfig.playerName,
        conversation.evalConfig.role
      );
    }
  }, [conversation, generatePlayerEval]);

  // Sim thread handlers
  const handleSimConfigChange = useCallback(
    (config: SimulationThreadConfig) => {
      if (conversation) {
        updateConversationConfig(conversation.id, undefined, config);
      }
    },
    [conversation, updateConversationConfig]
  );

  const handleRunSimulation = useCallback(() => {
    // This will trigger the simulation through the existing message flow
    // by sending a message with the simulation intent
    // In a real app this would be more sophisticated
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: Message }) => {
      const simulation = item.metadata?.simulationId
        ? getSimulation(item.metadata.simulationId)
        : undefined;

      const savedSimulation = item.metadata?.isSavedSimulation && item.metadata?.simulationId
        ? getSavedSimulation(item.metadata.simulationId)
        : undefined;

      const evalSnapshot = item.metadata?.evalSnapshotId
        ? getEvalSnapshot(item.metadata.evalSnapshotId)
        : undefined;

      return (
        <MessageBubble
          message={item}
          simulation={simulation}
          savedSimulation={savedSimulation}
          evalSnapshot={evalSnapshot}
          onViewSimulation={handleViewSimulation}
          onRerunSimulation={handleRerunSimulation}
          onViewSavedSimulation={handleViewSavedSimulation}
        />
      );
    },
    [getSimulation, getSavedSimulation, getEvalSnapshot, handleViewSimulation, handleRerunSimulation, handleViewSavedSimulation]
  );

  // Render empty state with header if needed
  const renderEmptyContent = () => {
    // Game Ops: show matchup instead of quote
    if (conversation?.type === 'game-ops' && conversation.gameOpsConfig) {
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={[styles.quote, { color: colors.textSecondary }]}>
            Lincoln{'\n'}vs {conversation.gameOpsConfig.opponent}
          </ThemedText>
          <ThemedText style={[styles.attribution, { color: colors.textTertiary }]}>
            {dateStr}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.quote, { color: colors.textSecondary }]}>
          The magic you&apos;re looking for{'\n'}is in the work you&apos;re avoiding
        </ThemedText>
        <ThemedText style={[styles.attribution, { color: colors.textTertiary }]}>
          — Chris Williamson
        </ThemedText>
      </View>
    );
  };

  // Render the thread header based on conversation type
  const renderThreadHeader = () => {
    if (!conversation) return null;

    if (conversation.type === 'eval' && conversation.evalConfig) {
      return (
        <EvalThreadHeader
          config={conversation.evalConfig}
          onConfigChange={handleEvalConfigChange}
          onGenerateEval={handleGenerateEval}
          isLoading={isLoading}
        />
      );
    }

    if (conversation.type === 'sim' && conversation.simConfig) {
      return (
        <SimThreadHeader
          config={conversation.simConfig}
          onConfigChange={handleSimConfigChange}
          onRunSimulation={handleRunSimulation}
          isLoading={isLoading}
        />
      );
    }

    return null;
  };

  // Game Ops: matchup header shown above messages
  const renderGameOpsHeader = useCallback(() => {
    if (conversation?.type !== 'game-ops' || !conversation.gameOpsConfig) return null;
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    return (
      <View style={styles.gameOpsMatchup}>
        <ThemedText style={[styles.quote, { color: colors.textSecondary }]}>
          Lincoln{'\n'}vs {conversation.gameOpsConfig.opponent}
        </ThemedText>
        <ThemedText style={[styles.attribution, { color: colors.textTertiary }]}>
          {dateStr}
        </ThemedText>
      </View>
    );
  }, [conversation, colors]);

  if (messages.length === 0 && !isLoading) {
    return (
      <View style={styles.fullContainer}>
        {renderThreadHeader()}
        {renderEmptyContent()}
      </View>
    );
  }

  return (
    <View style={styles.fullContainer}>
      {renderThreadHeader()}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={renderGameOpsHeader}
        ListFooterComponent={
          isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={colors.textTertiary} />
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fullContainer: {
    flex: 1,
  },
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
  gameOpsMatchup: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.xl,
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
