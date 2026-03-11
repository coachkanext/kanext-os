/**
 * SplitThreadRow — list row for Split Screen Threads (Nexus Page 2).
 * Circular avatar, name + @username, question preview, context badge, status.
 * Long press → context menu.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { ContextMenuData } from '@/components/ui/long-press-context-menu';
import type { SplitThread } from '@/data/mock-nexus-threads';

function formatTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

interface SplitThreadRowProps {
  thread: SplitThread;
  onShowPreview: (data: ContextMenuData) => void;
}

export function SplitThreadRow({ thread, onShowPreview }: SplitThreadRowProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const rowRef = useRef<View>(null);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        title: thread.name,
        subtitle: `@${thread.username}`,
        initials: thread.initials,
        isSquircle: false,
        pageY: y,
        actions: [
          { key: 'pin', label: thread.pinned ? 'Unpin' : 'Pin', icon: 'pin.fill' },
          { key: 'mute', label: thread.muted ? 'Unmute' : 'Mute', icon: 'bell.slash.fill' },
          { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
        ],
        onAction: (key) => {
          console.log('Thread action:', key, thread.id);
        },
      });
    });
  }, [thread, onShowPreview]);

  return (
    <Pressable
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        styles.row,
        pressed && styles.rowPressed,
      ]}
    >
      <View ref={rowRef} collapsable={false} style={styles.inner}>
        {/* Circular avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{thread.initials}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topLine}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.name, thread.unread && styles.nameUnread]}
                numberOfLines={1}
              >
                {thread.name}
              </Text>
              <Text style={styles.username} numberOfLines={1}>
                @{thread.username}
              </Text>
            </View>
            <Text style={styles.statusText}>
              {thread.status === 'waiting' ? 'Waiting...' : formatTime(thread.timestamp)}
            </Text>
          </View>

          <Text style={styles.preview} numberOfLines={1}>
            {thread.questionPreview}
          </Text>

          {/* Context badge */}
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{thread.contextBadge}</Text>
            </View>
          </View>
        </View>

        {/* Unread dot */}
        {thread.unread && <View style={styles.unreadDot} />}
      </View>
    </Pressable>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  rowPressed: {
    backgroundColor: C.separator,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.label,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
    flexShrink: 1,
  },
  nameUnread: {
    fontWeight: '700',
  },
  username: {
    fontSize: 13,
    color: C.secondary,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 12,
    color: C.secondary,
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 19,
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  badge: {
    backgroundColor: C.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.label,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1D9BF0',
    marginTop: 4,
  },
});
