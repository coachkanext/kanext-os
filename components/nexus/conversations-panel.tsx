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
import { Colors, Spacing, BorderRadius, Brand, Layout } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Conversation } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.7;

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

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : -PANEL_WIDTH,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  // Filter conversations by search query
  const filteredConversations = searchQuery
    ? conversations.filter((conv) =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const handleConversationPress = (id: string) => {
    onConversationSelect(id);
  };

  if (!visible && slideAnim._value === -PANEL_WIDTH) return null;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          width: PANEL_WIDTH,
          backgroundColor: colors.background,
          paddingTop: insets.top,
          borderRightColor: colors.border,
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
        {/* Header - Search Only */}
        <View style={styles.header}>
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

        {/* Footer - Avatar, Name, New Chat */}
        <View style={[styles.footer, { marginBottom: Spacing.sm }]}>
          <Pressable
            style={({ pressed }) => [
              styles.userRow,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onAvatarPress}
            accessibilityLabel="Open profile"
            accessibilityRole="button"
          >
            <View
              style={[
                styles.avatarButton,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              <IconSymbol name="person.fill" size={18} color={colors.icon} />
            </View>
            <ThemedText style={styles.userName}>Sammy Kalejaiye</ThemedText>
          </Pressable>

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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    borderRightWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
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
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 48,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '500',
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
