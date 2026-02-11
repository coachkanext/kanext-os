/**
 * Input Bar Component
 * ChatGPT-style bottom input with pill shape, attachment, and send buttons.
 * Mic button is tap-to-activate: opens full-screen voice overlay.
 */

import React, { useRef } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import type { TextInput as TextInputType } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand, Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onMicPress?: () => void;
  onAttachPress?: () => void;
  onPlusLongPress?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  isVoiceActive?: boolean;
  contextPill?: { icon: string; label: string } | null;
}

export function InputBar({
  value,
  onChangeText,
  onSend,
  onMicPress,
  onAttachPress,
  onPlusLongPress,
  onFocus,
  placeholder = 'Ask Nexus',
  isVoiceActive = false,
  contextPill = null,
}: InputBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<TextInputType>(null);

  const hasText = value.trim().length > 0;

  const showMic = !!onMicPress && !hasText && !isVoiceActive;

  const handleSend = () => {
    if (hasText) {
      onSend();
    }
  };

  const handleContainerPress = () => {
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    onFocus?.();
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <Pressable
          style={[
            styles.inputContainer,
            {
              backgroundColor: colors.backgroundTertiary,
              borderColor: colors.border,
            },
          ]}
          onPress={handleContainerPress}
        >
          {/* Context Pill (e.g. Game Ops) */}
          {contextPill && (
            <View style={styles.contextPillRow}>
              <View style={[styles.contextPill, { backgroundColor: colors.backgroundSecondary }]}>
                <IconSymbol name={contextPill.icon as any} size={14} color={colors.textSecondary} />
                <Text style={[styles.contextPillText, { color: colors.textSecondary }]}>
                  {contextPill.label}
                </Text>
              </View>
            </View>
          )}

          {/* Input Row */}
          <View style={styles.inputRow}>
            {/* Attach Button */}
            <Pressable
              style={({ pressed }) => [
                styles.attachButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
              onPress={onAttachPress}
              onLongPress={onPlusLongPress}
              accessibilityLabel="Attach file"
              accessibilityRole="button"
            >
              <IconSymbol name="plus" size={20} color={colors.textSecondary} />
            </Pressable>

            {/* Text Input */}
            <TextInput
              ref={inputRef}
              style={[styles.input, { color: colors.text }]}
              placeholder={placeholder}
              placeholderTextColor={colors.textTertiary}
              value={value}
              onChangeText={onChangeText}
              onFocus={handleFocus}
              multiline
              maxLength={4000}
              returnKeyType="default"
              blurOnSubmit={false}
              autoCapitalize="sentences"
              autoCorrect
            />

            {/* Right Actions */}
            <View style={styles.rightActions}>
              {/* Mic Button — tap to activate voice mode */}
              {showMic && (
                <Pressable
                  onPress={onMicPress}
                  style={({ pressed }) => [
                    styles.micButton,
                    {
                      backgroundColor: pressed
                        ? colors.tint
                        : colors.backgroundSecondary,
                    },
                  ]}
                  accessibilityLabel="Voice input"
                  accessibilityRole="button"
                >
                  <IconSymbol
                    name="mic.fill"
                    size={18}
                    color={colors.text}
                  />
                </Pressable>
              )}

              {/* Send Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.sendButton,
                  {
                    backgroundColor: hasText
                      ? '#ffffff'
                      : colors.backgroundSecondary,
                    opacity: pressed && hasText ? 0.8 : 1,
                  },
                ]}
                onPress={handleSend}
                disabled={!hasText}
                accessibilityLabel="Send message"
                accessibilityRole="button"
              >
                <IconSymbol
                  name="arrow.up"
                  size={16}
                  weight="semibold"
                  color={hasText
                    ? '#000000'
                    : colors.textTertiary
                  }
                />
              </Pressable>
            </View>
          </View>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputContainer: {
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
  },
  contextPillRow: {
    paddingLeft: 8,
    paddingTop: 4,
    paddingBottom: 2,
    flexDirection: 'row',
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  contextPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 150,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  micButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
