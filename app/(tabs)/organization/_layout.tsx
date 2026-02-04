/**
 * Organization Stack Layout
 * Handles navigation within the Organization tab.
 */

import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function OrganizationLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="programs/[programId]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="recruiting"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="donations"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="tickets"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="documents"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="governance"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="domains"
        options={{
          presentation: 'card',
        }}
      />
      {/* Church Routes */}
      <Stack.Screen
        name="campuses"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="ministries"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="messages"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="giving"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="connect"
        options={{
          presentation: 'card',
        }}
      />
      {/* Education Routes */}
      <Stack.Screen
        name="schedule"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="results"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="metrics"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="leadership"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="archive"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="events/[eventId]"
        options={{
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="members/[memberId]"
        options={{
          presentation: 'card',
        }}
      />
    </Stack>
  );
}
