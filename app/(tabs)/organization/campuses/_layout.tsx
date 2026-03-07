/**
 * Campuses Stack Layout
 * Handles navigation within campuses section for Church mode.
 */

import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { resetFooter } from '@/utils/global-footer-hide';

export default function CampusesLayout() {
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
      <Stack.Screen name="[campusId]" />
    </Stack>
  );
}
