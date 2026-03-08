/**
 * PinnedBubblesRow — shared horizontal scroll row for pinned items.
 * Used by Messages (pinned channels/DMs) and Phone (favorites).
 * Returns null if items array is empty.
 */

import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

export interface PinnedBubble {
  id: string;
  initials: string;
  name: string;
  isSquircle?: boolean;
  unread?: boolean;
  online?: boolean;
}

interface PinnedBubblesRowProps {
  items: PinnedBubble[];
  onPress?: (id: string) => void;
}

export function PinnedBubblesRow({ items, onPress }: PinnedBubblesRowProps) {
  if (items.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {items.map((item) => (
        <Pressable
          key={item.id}
          style={styles.cell}
          onPress={() => onPress?.(item.id)}
        >
          <View
            style={[
              styles.avatar,
              item.isSquircle && styles.squircle,
              item.unread && styles.unreadRing,
            ]}
          >
            <Text style={styles.initials}>{item.initials}</Text>
            {item.online && <View style={styles.onlineDot} />}
          </View>
          <Text style={styles.name} numberOfLines={1}>
            {item.name.replace(/^#/, '').split(' ')[0]}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 16,
    gap: 14,
    paddingBottom: 16,
  },
  cell: {
    alignItems: 'center',
    width: 64,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  squircle: {
    borderRadius: 12,
    backgroundColor: '#0B1220',
  },
  unreadRing: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  initials: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#000000',
  },
});
