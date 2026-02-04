/**
 * Input Bar Component
 * Bottom input area for Nexus chat with text input, mic, and send buttons.
 */

import React from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform, KeyboardAvoidingView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface InputBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onMicPress?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputBar({
  value,
  onChangeText,
  onSend,
  onMicPress,
  disabled = false,
  placeholder = 'Ask anything...',
}: InputBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();

  const hasText = value.trim().length > 0;

  const handleSend = () => {
    if (hasText && !disabled) {
      onSend();
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + Spacing.sm,
          },
        ]}
      >
        <View
          style={[
            styles.inputContainer,
            { backgroundColor: colors.backgroundSecondary },
          ]}
        >
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder={placeholder}
            placeholderTextColor={colors.textTertiary}
            value={value}
            onChangeText={onChangeText}
            multiline
            maxLength={2000}
            editable={!disabled}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          {/* Mic Button */}
          {onMicPress && !hasText && (
            <Pressable
              style={({ pressed }) => [
                styles.iconButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={onMicPress}
              accessibilityLabel="Voice input"
              accessibilityRole="button"
            >
              <IconSymbol name="mic.fill" size={20} color={colors.textTertiary} />
            </Pressable>
          )}

          {/* Send Button */}
          <Pressable
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: hasText ? Brand.nexus : colors.backgroundTertiary,
                opacity: pressed && hasText ? 0.8 : 1,
              },
            ]}
            onPress={handleSend}
            disabled={!hasText || disabled}
            accessibilityLabel="Send message"
            accessibilityRole="button"
          >
            <IconSymbol
              name="arrow.up"
              size={18}
              color={hasText ? '#FFFFFF' : colors.textTertiary}
            />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: BorderRadius.lg,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.xs,
    paddingVertical: Spacing.xs,
    minHeight: 44,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
    paddingVertical: Spacing.sm,
    paddingRight: Spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  sendButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
