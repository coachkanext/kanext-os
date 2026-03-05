/**
 * Messages Layout — Stack navigator for list + thread views.
 * Swipe gestures disabled — swipe is reserved for tab switching.
 */

import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[threadId]" />
    </Stack>
  );
}
