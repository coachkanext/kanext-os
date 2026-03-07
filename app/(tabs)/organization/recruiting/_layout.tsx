/**
 * Recruiting Stack Layout
 * Handles navigation within recruiting section (board, player pool, profiles).
 */

import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { resetFooter } from '@/utils/global-footer-hide';

export default function RecruitingLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
      screenListeners={{ focus: () => resetFooter() }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="pool/index" />
      <Stack.Screen name="pool/[playerId]" />
    </Stack>
  );
}
