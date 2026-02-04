/**
 * Chat Thread Component
 * Renders the list of messages in a Nexus conversation.
 */

import React, { useRef, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MessageBubble } from './message-bubble';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Message } from '@/types';

interface ChatThreadProps {
  messages: Message[];
  isLoading?: boolean;
}

export function ChatThread({ messages, isLoading = false }: ChatThreadProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const flatListRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  if (messages.length === 0 && !isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ThemedText style={[styles.watermark, { color: colors.textTertiary }]}>
          NEXUS
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      ref={flatListRef}
      data={messages}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <MessageBubble message={item} />}
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
  listContent: {
    paddingVertical: Spacing.md,
    flexGrow: 1,
  },
  loadingContainer: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
});
