/**
 * SharedSpaceRow — list row for Shared Spaces (Nexus Page 1).
 * Square squircle icon with initials, name, member count, last message, timestamp.
 * Long press → context menu.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { ContextMenuData } from '@/components/ui/long-press-context-menu';
import type { SharedSpace } from '@/data/mock-nexus-spaces';

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

interface SharedSpaceRowProps {
  space: SharedSpace;
  onShowPreview: (data: ContextMenuData) => void;
}

export function SharedSpaceRow({ space, onShowPreview }: SharedSpaceRowProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const rowRef = useRef<View>(null);

  const handleLongPress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    rowRef.current?.measureInWindow((_x, y) => {
      onShowPreview({
        title: space.name,
        subtitle: `${space.memberCount} members`,
        initials: space.initials,
        isSquircle: true,
        pageY: y,
        actions: [
          { key: 'pin', label: space.pinned ? 'Unpin' : 'Pin', icon: 'pin.fill' },
          { key: 'mute', label: space.muted ? 'Unmute' : 'Mute', icon: 'bell.slash.fill' },
          { key: 'leave', label: 'Leave', icon: 'arrow.right.square' },
          { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
        ],
        onAction: (key) => {
          console.log('Space action:', key, space.id);
        },
      });
    });
  }, [space, onShowPreview]);

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
        {/* Unread dot column */}
        <View style={styles.dotColumn}>
          {space.unread && <View style={styles.unreadDot} />}
        </View>

        {/* Squircle icon */}
        <View style={styles.icon}>
          <Text style={styles.iconText}>{space.initials}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.topLine}>
            <View style={styles.nameRow}>
              <Text
                style={[styles.name, space.unread && styles.nameUnread]}
                numberOfLines={1}
              >
                {space.name}
              </Text>
              {space.pinned && (
                <IconSymbol name="pin.fill" size={11} color={C.secondary} />
              )}
              {space.muted && (
                <IconSymbol name="bell.slash.fill" size={11} color={C.secondary} />
              )}
            </View>
            <Text style={styles.time}>{formatTime(space.timestamp)}</Text>
          </View>

          <Text style={styles.members}>{space.memberCount} members</Text>

          <Text style={styles.preview} numberOfLines={1}>
            <Text style={styles.sender}>{space.lastSender}: </Text>
            {space.lastMessage}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  row: {
    paddingVertical: 12,
    paddingRight: 16,
  },
  rowPressed: {
    backgroundColor: C.separator,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  dotColumn: {
    width: 16,
    alignItems: 'center',
    paddingTop: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1D9BF0',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 15,
    fontWeight: '700',
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
    gap: 5,
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
  time: {
    fontSize: 12,
    color: C.secondary,
    marginLeft: 8,
  },
  members: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 1,
  },
  preview: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 19,
    marginTop: 3,
  },
  sender: {
    color: C.secondary,
    fontWeight: '500',
  },
});
