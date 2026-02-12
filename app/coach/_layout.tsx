/**
 * Coach Screens Layout
 * Stack navigator for coach destination screens.
 * These screens are accessed from the Sports Home header tabs.
 */

import { Stack } from 'expo-router';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function CoachLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'none',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="roster" />
      <Stack.Screen name="games" />
      <Stack.Screen name="game-detail" />
      <Stack.Screen name="injuries" />
      <Stack.Screen name="more-resources" />
      <Stack.Screen name="recruiting" />
      <Stack.Screen name="film" />
      <Stack.Screen name="player-bio" />
      <Stack.Screen name="player-profile" />
      <Stack.Screen name="game-ops" />
      <Stack.Screen name="box-score" />
      <Stack.Screen name="play-by-play" />
      <Stack.Screen name="key-plays" />
      <Stack.Screen name="team-stats" />
      <Stack.Screen name="program-context" />
      <Stack.Screen name="program-resources" />
      <Stack.Screen name="player-detail" />
    </Stack>
  );
}
