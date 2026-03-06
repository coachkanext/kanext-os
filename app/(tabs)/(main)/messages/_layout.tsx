/**
 * Messages Layout — Stack navigator for list + thread views.
 * Thread view supports full-screen swipe-right to go back.
 * Gesture disabled on list root to prevent accidental pop.
 */

import { Stack } from 'expo-router';

export default function MessagesLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
        contentStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="[threadId]" />
    </Stack>
  );
}
