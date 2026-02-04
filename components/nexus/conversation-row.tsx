/**
 * Conversation Row Component
 * Single row in the conversations list panel.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTimestamp } from '@/data/mock-nexus';
import type { Conversation } from '@/types';

interface ConversationRowProps {
  conversation: Conversation;
  isActive: boolean;
  onPress: () => void;
}

export function ConversationRow({
  conversation,
  isActive,
  onPress,
}: ConversationRowProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const previewText = conversation.lastMessage?.content ?? 'No messages yet';
  const truncatedPreview =
    previewText.length > 50 ? previewText.slice(0, 50) + '...' : previewText;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isActive
            ? colors.backgroundSecondary
            : pressed
            ? colors.backgroundSecondary
            : 'transparent',
        },
      ]}
      onPress={onPress}
    >
      {/* Avatar(s) */}
      <View style={styles.avatarContainer}>
        {conversation.isGroup ? (
          // Group avatar - stacked circles
          <View style={styles.groupAvatars}>
            <View
              style={[
                styles.groupAvatarBack,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              <IconSymbol name="person.fill" size={14} color={colors.icon} />
            </View>
            <View
              style={[
                styles.groupAvatarFront,
                { backgroundColor: colors.backgroundSecondary, borderColor: colors.background },
              ]}
            >
              <IconSymbol name="person.fill" size={14} color={colors.icon} />
            </View>
          </View>
        ) : (
          // Single avatar - Nexus icon for assistant conversations
          <View
            style={[
              styles.avatar,
              { backgroundColor: Brand.nexus },
            ]}
          >
            <IconSymbol name="sparkles" size={18} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <ThemedText
            style={[
              styles.title,
              isActive && { fontWeight: '700' },
            ]}
            numberOfLines={1}
          >
            {conversation.title}
          </ThemedText>
          <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
            {formatTimestamp(conversation.updatedAt)}
          </ThemedText>
        </View>
        <View style={styles.bottomRow}>
          <ThemedText
            style={[styles.preview, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {truncatedPreview}
          </ThemedText>
          {conversation.unreadCount > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: Brand.nexus }]}>
              <ThemedText style={styles.unreadText}>
                {conversation.unreadCount}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginVertical: 1,
  },
  avatarContainer: {
    marginRight: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupAvatars: {
    width: 40,
    height: 40,
    position: 'relative',
  },
  groupAvatarBack: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  groupAvatarFront: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  timestamp: {
    fontSize: 12,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  preview: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
