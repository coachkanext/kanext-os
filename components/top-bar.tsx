/**
 * KaNeXT OS Top Bar
 * Global navigation bar with Avatar (left), KaNeXT wordmark (center), Search icon (right).
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Layout, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface TopBarProps {
  onAvatarPress?: () => void;
}

export function TopBar({ onAvatarPress }: TopBarProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleSearchPress = () => {
    router.push('/search');
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top,
          borderBottomColor: colors.border,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left: Avatar */}
        <Pressable
          onPress={onAvatarPress}
          style={({ pressed }) => [
            styles.avatarButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Open avatar drawer"
          accessibilityRole="button"
        >
          <View
            style={[
              styles.avatar,
              { backgroundColor: colors.backgroundTertiary },
            ]}
          >
            <IconSymbol
              name="person.fill"
              size={18}
              color={colors.icon}
            />
          </View>
        </Pressable>

        {/* Center: KaNeXT Wordmark */}
        <View style={styles.wordmarkContainer}>
          <Text style={[styles.wordmark, { color: colors.text }]}>
            KaNeXT
          </Text>
        </View>

        {/* Right: Search Icon */}
        <Pressable
          onPress={handleSearchPress}
          style={({ pressed }) => [
            styles.searchButton,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          accessibilityLabel="Open search"
          accessibilityRole="button"
        >
          <IconSymbol
            name="magnifyingglass"
            size={22}
            color={colors.icon}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    height: Layout.topBarHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
  },
  avatarButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  avatar: {
    width: Layout.avatarSize,
    height: Layout.avatarSize,
    borderRadius: Layout.avatarSize / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmarkContainer: {
    flex: 1,
    alignItems: 'center',
  },
  wordmark: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});
