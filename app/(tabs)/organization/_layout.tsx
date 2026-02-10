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
        animation: 'none',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen
        name="programs/[programId]"
        options={{}}

      />
      <Stack.Screen
        name="recruiting"
        options={{}}

      />
      <Stack.Screen
        name="donations"
        options={{}}

      />
      <Stack.Screen
        name="tickets"
        options={{}}

      />
      <Stack.Screen
        name="documents"
        options={{}}

      />
      <Stack.Screen
        name="governance"
        options={{}}

      />
      <Stack.Screen
        name="domains"
        options={{}}

      />
      {/* Church Routes */}
      <Stack.Screen
        name="campuses"
        options={{}}

      />
      <Stack.Screen
        name="ministries"
        options={{}}

      />
      <Stack.Screen
        name="messages"
        options={{}}

      />
      <Stack.Screen
        name="giving"
        options={{}}

      />
      <Stack.Screen
        name="connect"
        options={{}}

      />
      {/* Education Routes */}
      <Stack.Screen
        name="schedule"
        options={{}}

      />
      <Stack.Screen
        name="results"
        options={{}}

      />
      <Stack.Screen
        name="metrics"
        options={{}}

      />
      <Stack.Screen
        name="leadership"
        options={{}}

      />
      <Stack.Screen
        name="archive"
        options={{}}

      />
      <Stack.Screen
        name="events/[eventId]"
        options={{}}

      />
      <Stack.Screen
        name="members/[memberId]"
        options={{}}

      />
    </Stack>
  );
}
