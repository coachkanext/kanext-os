/**
 * BoardColumn — single Kanban column with header, count badge, and card list.
 * Accepts children (card components) to allow flexible card rendering.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import { BOARD_COLUMN_COLORS, type BoardStatus } from '@/data/recruitingBoard';

const WHITE = '#FFFFFF';
const GRAY = '#9C9790';
const DIVIDER = '#0B0F14';

export interface BoardColumnProps {
  status: BoardStatus;
  count: number;
  children: React.ReactNode;
  isDropTarget?: boolean;
}

export function BoardColumn({
  status,
  count,
  children,
  isDropTarget,
}: BoardColumnProps) {
  const color = BOARD_COLUMN_COLORS[status];

  return (
    <View style={[styles.column, isDropTarget && { borderColor: color, borderWidth: 1.5 }]}>
      {/* Column header */}
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.title}>{status}</Text>
        <View style={[styles.countBadge, { backgroundColor: `${color}30` }]}>
          <Text style={[styles.countText, { color }]}>{count}</Text>
        </View>
      </View>

      {/* Card list */}
      <ScrollView
        style={styles.cardScroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {children}
        {count === 0 && (
          <View style={styles.emptyZone}>
            <Text style={styles.emptyText}>No recruits</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    width: 340,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#0B0F14',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DIVIDER,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: DIVIDER,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.3,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardScroll: {
    padding: 10,
    maxHeight: 500,
  },
  emptyZone: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 12,
    color: GRAY,
  },
});
