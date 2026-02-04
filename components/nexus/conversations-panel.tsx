/**
 * Conversations Panel Component
 * Left slide-in drawer showing the list of Nexus conversations.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ConversationRow } from './conversation-row';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Conversation } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface ConversationsPanelProps {
  visible: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId: string | null;
  onConversationSelect: (id: string) => void;
  onNewChat: () => void;
  onAvatarPress: () => void;
}

export function ConversationsPanel({
  visible,
  onClose,
  conversations,
  activeConversationId,
  onConversationSelect,
  onNewChat,
  onAvatarPress,
}: ConversationsPanelProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const [searchQuery, setSearchQuery] = useState('');

  const slideAnim = useRef(new Animated.Value(-PANEL_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -PANEL_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // Filter conversations by search query
  const filteredConversations = searchQuery
    ? conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleConversationPress = (id: string) => {
    onConversationSelect(id);
  };

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim / Backdrop */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            width: PANEL_WIDTH,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          {/* Avatar Button */}
          <Pressable
            style={({ pressed }) => [
              styles.avatarButton,
              { backgroundColor: colors.backgroundTertiary, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={onAvatarPress}
            accessibilityLabel="Open avatar menu"
            accessibilityRole="button"
          >
            <IconSymbol name="person.fill" size={20} color={colors.icon} />
          </Pressable>

          {/* Search Input */}
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: colors.backgroundSecondary },
            ]}
          >
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search conversations"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* New Chat Button */}
          <Pressable
            style={({ pressed }) => [
              styles.newChatButton,
              { backgroundColor: Brand.nexus, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={onNewChat}
            accessibilityLabel="Start new conversation"
            accessibilityRole="button"
          >
            <IconSymbol name="plus" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Conversations List */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredConversations.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
                {searchQuery ? 'No conversations found' : 'No conversations yet'}
              </ThemedText>
            </View>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onPress={() => handleConversationPress(conversation.id)}
              />
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 36,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: Spacing.xs,
    paddingVertical: 0,
  },
  newChatButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
  },
});
