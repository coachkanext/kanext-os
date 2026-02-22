/**
 * Chat Composer — In-thread input bar with quick actions (Clip/Poll/Share Game).
 */

import React from 'react';
import { View, StyleSheet, Pressable, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius } from '@/constants/theme';

interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
}

export function ChatComposer({ value, onChangeText, onSend }: ChatComposerProps) {
  const handleSend = () => {
    if (!value.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  };

  const handleQuickAction = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      {/* Quick actions */}
      <View style={styles.quickActions}>
        <Pressable style={styles.quickBtn} onPress={handleQuickAction}>
          <IconSymbol name="play.rectangle.fill" size={18} color="#555" />
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={handleQuickAction}>
          <IconSymbol name="chart.bar.fill" size={18} color="#555" />
        </Pressable>
        <Pressable style={styles.quickBtn} onPress={handleQuickAction}>
          <IconSymbol name="sportscourt.fill" size={18} color="#555" />
        </Pressable>
      </View>

      {/* Input row */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#555"
          value={value}
          onChangeText={onChangeText}
        />
        <Pressable
          style={({ pressed }) => [styles.sendBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={handleSend}
        >
          <IconSymbol
            name="arrow.up.circle.fill"
            size={28}
            color={value.trim() ? '#FFFFFF' : '#333'}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: Spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  quickBtn: {
    padding: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: BorderRadius.lg,
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  sendBtn: {
    padding: 2,
  },
});
