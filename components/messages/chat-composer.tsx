/**
 * Chat Composer — iOS Messages-style input bar.
 * + button, capsule text field, send button.
 */

import React from 'react';
import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';

interface ChatComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  accent?: string;
}

export function ChatComposer({
  value,
  onChangeText,
  onSend,
  accent = '#0A84FF',
}: ChatComposerProps) {
  const hasText = value.trim().length > 0;

  const handleSend = () => {
    if (!hasText) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSend();
  };

  return (
    <View style={styles.bar}>
      <Pressable style={styles.addBtn}>
        <IconSymbol name="plus.circle.fill" size={30} color="#8E8E93" />
      </Pressable>

      <View style={styles.inputWrap}>
        <TextInput
          style={styles.input}
          placeholder="Message"
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={onChangeText}
          multiline
        />
      </View>

      {hasText && (
        <Pressable onPress={handleSend} style={styles.sendBtn}>
          <IconSymbol name="arrow.up.circle.fill" size={30} color={accent} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
    paddingVertical: 6,
  },
  addBtn: {
    paddingBottom: 2,
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#38383A',
    paddingHorizontal: 14,
    paddingVertical: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  input: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 2,
  },
  sendBtn: {
    paddingBottom: 2,
  },
});
