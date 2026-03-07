/**
 * Program Stack Layout
 * Handles navigation within a specific program (roster, schedule, staff, etc.)
 */

import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { resetFooter } from '@/utils/global-footer-hide';

export default function ProgramLayout() {
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
      <Stack.Screen name="roster" />
      <Stack.Screen name="players/[playerId]" />
      <Stack.Screen name="staff/index" />
      <Stack.Screen name="staff/[staffId]" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="events/[eventId]" />
      <Stack.Screen name="media" />
    </Stack>
  );
}
