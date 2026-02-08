/**
 * Input Bar Component
 * ChatGPT-style bottom input with pill shape, attachment, and send buttons.
 */

import React, { useRef, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet, Platform, KeyboardAvoidingView, Animated } from 'react-native';
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
  onFocus?: () => void;
  placeholder?: string;
  isListening?: boolean;
}

export function InputBar({
  value,
  onChangeText,
  onSend,
  onMicPress,
  onAttachPress,
  onFocus,
  placeholder = 'Ask Nexus',
  isListening = false,
}: InputBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const isDark = colorScheme === 'dark';
  const inputRef = useRef<TextInputType>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const hasText = value.trim().length > 0;

  useEffect(() => {
    if (isListening) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      animation.start();
      return () => animation.stop();
    }
    pulseAnim.setValue(1);
  }, [isListening, pulseAnim]);

  const showMic = onMicPress && (!hasText || isListening);

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
              backgroundColor: isDark ? '#2F2F2F' : '#F4F4F4',
              borderColor: isDark ? '#3F3F3F' : '#E5E5E5',
            },
          ]}
          onPress={handleContainerPress}
        >
          {/* Attach Button */}
          <Pressable
            style={({ pressed }) => [
              styles.attachButton,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={onAttachPress}
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
            {/* Mic / Stop Button */}
            {showMic && (
              isListening ? (
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  onPress={onMicPress}
                  accessibilityLabel="Stop voice input"
                  accessibilityRole="button"
                >
                  <Animated.View
                    style={[
                      styles.micActiveBackground,
                      { transform: [{ scale: pulseAnim }] },
                    ]}
                  >
                    <IconSymbol name="stop.fill" size={14} color="#FFFFFF" />
                  </Animated.View>
                </Pressable>
              ) : (
                <Pressable
                  style={({ pressed }) => [
                    styles.iconButton,
                    { opacity: pressed ? 0.6 : 1 },
                  ]}
                  onPress={onMicPress}
                  accessibilityLabel="Voice input"
                  accessibilityRole="button"
                >
                  <IconSymbol name="mic.fill" size={20} color={colors.textSecondary} />
                </Pressable>
              )
            )}

            {/* Send Button */}
            <Pressable
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor: hasText
                    ? (isDark ? '#FFFFFF' : '#000000')
                    : (isDark ? '#4A4A4A' : '#D9D9D9'),
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
                  ? (isDark ? '#000000' : '#FFFFFF')
                  : (isDark ? '#7A7A7A' : '#A0A0A0')
                }
              />
            </Pressable>
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
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
    minHeight: 48,
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
  iconButton: {
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
  micActiveBackground: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Brand.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
