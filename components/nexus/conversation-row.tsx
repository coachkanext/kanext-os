/**
 * Conversation Row Component
 * Single row in the conversations list panel.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { ThreadTypePill } from './thread-type-pill';
import { Colors, Spacing, BorderRadius, Brand, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { formatTimestamp } from '@/data/mock-nexus';
import type { Conversation, ConversationType } from '@/types';

const TYPE_ICONS: Record<ConversationType, IconSymbolName> = {
  chat: 'sparkles',
  eval: 'person.text.rectangle',
  sim: 'chart.bar.fill',
  'game-ops': 'basketball.fill',
};

const TYPE_COLORS: Record<ConversationType, string> = {
  chat: '#FFFFFF',
  eval: '#FFFFFF',
  sim: '#FFFFFF',
  'game-ops': '#A1A1AA',
};

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

  const conversationType = conversation.type ?? 'chat';
  const avatarIcon = TYPE_ICONS[conversationType];
  const avatarColor = TYPE_COLORS[conversationType];

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
          // Single avatar - icon based on conversation type
          <View
            style={[
              styles.avatar,
              { backgroundColor: avatarColor },
            ]}
          >
            <IconSymbol name={avatarIcon} size={18} color="#FFFFFF" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.titleRow}>
            <ThemedText
              style={[
                styles.title,
                isActive && { fontWeight: '700' },
              ]}
              numberOfLines={1}
            >
              {conversation.title}
            </ThemedText>
            {conversation.isPinned && (
              <IconSymbol name="pin.fill" size={12} color={colors.textTertiary} />
            )}
          </View>
          <View style={styles.metaRow}>
            {conversationType !== 'chat' && (
              <ThreadTypePill type={conversationType} size="small" />
            )}
            <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
              {formatTimestamp(conversation.updatedAt)}
            </ThemedText>
          </View>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    flexShrink: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
