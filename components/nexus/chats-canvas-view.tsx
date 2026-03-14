/**
 * Chats Canvas View
 * Full-canvas conversation list. Shown when canvasView === 'chats'.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { formatTimestamp } from '@/data/mock-nexus';
import type { Conversation } from '@/types';

interface ChatsCanvasViewProps {
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

export function ChatsCanvasView({ conversations, onSelectConversation }: ChatsCanvasViewProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {conversations.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No conversations yet</Text>
        </View>
      ) : (
        conversations.map((conv) => (
          <Pressable
            key={conv.id}
            style={({ pressed }) => [
              styles.row,
              { backgroundColor: pressed ? C.separator : 'transparent' },
            ]}
            onPress={() => onSelectConversation(conv.id)}
          >
            <View style={styles.rowContent}>
              <Text style={styles.rowTitle} numberOfLines={1}>{conv.title}</Text>
              <Text style={styles.rowMeta} numberOfLines={1}>
                {formatTimestamp(conv.updatedAt)}
                {conv.workspace ? ` · ${conv.workspace}` : ''}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: 16, paddingBottom: 40 },
    empty: { paddingTop: 80, alignItems: 'center' },
    emptyText: { fontSize: 15, color: C.secondary },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.divider,
      gap: 8,
    },
    rowContent: { flex: 1, gap: 3 },
    rowTitle: { fontSize: 15, fontWeight: '500', color: C.label },
    rowMeta: { fontSize: 12, color: C.secondary },
  });
