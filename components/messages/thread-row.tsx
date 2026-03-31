/**
 * Thread Row — inbox thread list item.
 * V2: avatar stacks, pin/mute indicators.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing } from '@/constants/theme';
import { formatMessageTime } from '@/data/mock-messages';
import type { InboxThread } from '@/data/mock-messages';

interface ThreadRowProps {
  thread: InboxThread & { context?: { type: string; subtitle?: string } };
  onPress: () => void;
}

export function ThreadRow({ thread, onPress }: ThreadRowProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Pressable
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: pressed ? '#0B0F14' : 'transparent' },
        thread.muted && styles.muted,
      ]}
      onPress={handlePress}
    >
      {/* Avatar Stack or Icon Circle */}
      {thread.avatarStack && thread.avatarStack.length > 1 ? (
        <View style={styles.avatarStack}>
          {thread.avatarStack.slice(0, 3).map((initials, i) => (
            <View
              key={i}
              style={[
                styles.stackCircle,
                { left: i * 12, zIndex: 3 - i },
              ]}
            >
              <ThemedText style={styles.stackText}>{initials}</ThemedText>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.iconCircle}>
          <IconSymbol name={thread.icon as any} size={20} color="#FFFFFF" />
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <ThemedText style={styles.title} numberOfLines={1}>
            {thread.title}
          </ThemedText>
          <View style={styles.countChip}>
            <ThemedText style={styles.countText}>{thread.participants.length}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.preview} numberOfLines={1}>
          {thread.lastMessage}
        </ThemedText>
        {thread.context?.subtitle && (
          <ThemedText style={styles.contextSub} numberOfLines={1}>
            {thread.context.subtitle}
          </ThemedText>
        )}
      </View>

      {/* Right Column */}
      <View style={styles.rightCol}>
        <View style={styles.rightTopRow}>
          {thread.pinned && (
            <IconSymbol name="pin.fill" size={10} color="#9C9790" />
          )}
          {thread.muted && (
            <IconSymbol name="bell.slash.fill" size={10} color="#555" />
          )}
          <ThemedText style={styles.timestamp}>{formatMessageTime(thread.timestamp)}</ThemedText>
        </View>
        {thread.unread > 0 && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#0B0F14',
  },
  muted: {
    opacity: 0.6,
  },

  // Avatar Stack
  avatarStack: {
    width: 40,
    height: 28,
    marginRight: Spacing.sm + 4,
    position: 'relative',
  },
  stackCircle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    top: 2,
  },
  stackText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Icon Circle
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm + 4,
  },

  content: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  countChip: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 6,
  },
  countText: {
    fontSize: 11,
    color: '#9C9790',
    fontWeight: '500',
  },
  preview: {
    fontSize: 14,
    color: '#9C9790',
    lineHeight: 18,
  },
  contextSub: {
    fontSize: 12,
    color: '#555',
    marginTop: 2,
  },
  rightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  rightTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#9C9790',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
});
