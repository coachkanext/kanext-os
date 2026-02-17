/**
 * Chat Thread Component
 * Renders the list of messages in a Nexus conversation.
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { MessageBubble } from './message-bubble';
import { EvalThreadHeader } from './eval-thread-header';
import { SimThreadHeader } from './sim-thread-header';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useNexusContext } from '@/context/nexus-context';
import type { Message, SimulationResult, SavedSimulation, Conversation, PlayerEvalConfig, SimulationThreadConfig } from '@/types';
import type { MessageV2, LinkChip } from '@/types/nexus-v2';

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
  conversation?: Conversation | null;
}

const NEXUS_QUOTES = [
  { text: 'The hand of the diligent will rule,\nbut the slothful will be put to forced labor.', attribution: '— Prov 12:24' },
  { text: 'Whatever your hand finds to do,\ndo it with your might.', attribution: '— Eccl 9:10' },
  { text: 'In all hard work there is profit,\nbut mere talk leads only to poverty.', attribution: '— Prov 14:23' },
  { text: 'If anyone is unwilling to work,\nhe shall not eat.', attribution: '— 2 Thess 3:10' },
  { text: 'A slack hand causes poverty,\nbut the hand of the diligent makes rich.', attribution: '— Prov 10:4' },
  { text: 'By wisdom a house is built,\nand by understanding it is established.', attribution: '— Prov 24:3' },
  { text: 'The wise store up knowledge,\nbut the mouth of a fool brings ruin near.', attribution: '— Prov 10:14' },
  { text: 'It is better to live in a desert land\nthan with a quarrelsome and fretful wife.', attribution: '— Prov 21:19' },
];

const QUOTE_STORAGE_KEY = 'kx:nexusLastQuoteIndex';
const QUOTE_ROTATE_MS = 6_000;

export function ChatThread({ messages, isLoading = false, conversation }: ChatThreadProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList>(null);
  const {
    getSimulation, getSavedSimulation, openSimulation, getEvalSnapshot,
    updateConversationConfig, generatePlayerEval,
    confirmAction: ctxConfirmAction,
    cancelAction: ctxCancelAction,
    handleEscalationChoice: ctxHandleEscalation,
  } = useNexusContext();

  // ── Quote rotation ──
  const [quoteIndex, setQuoteIndex] = useState(0);
  const lastPersistedRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isEmptyState = messages.length === 0 && !isLoading && conversation?.type !== 'game-ops';

  // Pick a random starting quote that differs from the last one shown
  useEffect(() => {
    if (!isEmptyState) return;
    (async () => {
      const stored = await AsyncStorage.getItem(QUOTE_STORAGE_KEY);
      const lastIndex = stored != null ? parseInt(stored, 10) : -1;
      let next: number;
      do {
        next = Math.floor(Math.random() * NEXUS_QUOTES.length);
      } while (next === lastIndex && NEXUS_QUOTES.length > 1);
      setQuoteIndex(next);
      lastPersistedRef.current = next;
      await AsyncStorage.setItem(QUOTE_STORAGE_KEY, String(next));
    })();
  }, [isEmptyState]);

  // Auto-rotate every 10s while on empty state
  useEffect(() => {
    if (!isEmptyState) {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setQuoteIndex((prev) => {
        const next = (prev + 1) % NEXUS_QUOTES.length;
        AsyncStorage.setItem(QUOTE_STORAGE_KEY, String(next));
        return next;
      });
    }, QUOTE_ROTATE_MS);
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [isEmptyState]);

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

  const handleChipPress = useCallback((chip: LinkChip) => {
    // TODO: Navigate to linked object
    console.log('Link chip pressed:', chip.objectType, chip.objectId);
  }, []);

  const handleConfirmAction = useCallback((messageId: string) => {
    ctxConfirmAction(messageId);
  }, [ctxConfirmAction]);

  const handleCancelAction = useCallback((messageId: string) => {
    ctxCancelAction(messageId);
  }, [ctxCancelAction]);

  const handleEscalationChoice = useCallback((messageId: string, action: string) => {
    ctxHandleEscalation(messageId, action);
  }, [ctxHandleEscalation]);

  const renderMessage = useCallback(
    ({ item }: { item: Message | MessageV2 }) => {
      const simulation = item.metadata?.simulationId
        ? getSimulation(item.metadata.simulationId as string)
        : undefined;

      const savedSimulation = item.metadata?.isSavedSimulation && item.metadata?.simulationId
        ? getSavedSimulation(item.metadata.simulationId as string)
        : undefined;

      const evalSnapshot = item.metadata?.evalSnapshotId
        ? getEvalSnapshot(item.metadata.evalSnapshotId as string)
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
          onChipPress={handleChipPress}
          onConfirmAction={handleConfirmAction}
          onCancelAction={handleCancelAction}
          onEscalationChoice={handleEscalationChoice}
        />
      );
    },
    [getSimulation, getSavedSimulation, getEvalSnapshot, handleViewSimulation, handleRerunSimulation, handleViewSavedSimulation, handleChipPress, handleConfirmAction, handleCancelAction, handleEscalationChoice]
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

    const q = NEXUS_QUOTES[quoteIndex] ?? NEXUS_QUOTES[0];
    return (
      <Pressable
        style={styles.emptyContainer}
        onPress={() => {
          const next = (quoteIndex + 1) % NEXUS_QUOTES.length;
          setQuoteIndex(next);
          AsyncStorage.setItem(QUOTE_STORAGE_KEY, String(next));
          // Reset rotation timer on tap
          if (timerRef.current) clearInterval(timerRef.current);
          timerRef.current = setInterval(() => {
            setQuoteIndex((prev) => {
              const n = (prev + 1) % NEXUS_QUOTES.length;
              AsyncStorage.setItem(QUOTE_STORAGE_KEY, String(n));
              return n;
            });
          }, QUOTE_ROTATE_MS);
        }}
      >
        <ThemedText style={[styles.quote, { color: colors.textSecondary }]}>
          {q.text}
        </ThemedText>
        <ThemedText style={[styles.attribution, { color: colors.textTertiary }]}>
          {q.attribution}
        </ThemedText>
      </Pressable>
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
    fontSize: 28,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 40,
    opacity: 0.8,
  },
  attribution: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    opacity: 0.6,
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
