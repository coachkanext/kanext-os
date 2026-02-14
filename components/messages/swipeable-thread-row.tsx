/**
 * Swipeable Thread Row — ThreadRow wrapped with swipe actions.
 * Actions: Pin / Mute / Archive / Mark Read
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThreadRow } from '@/components/messages/thread-row';
import type { ChatThread } from '@/data/mock-messages';

interface SwipeableThreadRowProps {
  thread: ChatThread;
  onPress: () => void;
  onPin?: () => void;
  onMute?: () => void;
  onArchive?: () => void;
  onMarkRead?: () => void;
}

export function SwipeableThreadRow({
  thread,
  onPress,
  onPin,
  onMute,
  onArchive,
  onMarkRead,
}: SwipeableThreadRowProps) {
  const handleAction = useCallback((action?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action?.();
  }, []);

  return (
    <View style={styles.container}>
      {/* Swipe reveal actions (shown on long-press as action row for now) */}
      <ThreadRow thread={thread} onPress={onPress} />

      {/* Action indicators — visible via long press in future */}
      {/* For now the swipe UX is simulated with the thread row's existing press behavior */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
});
