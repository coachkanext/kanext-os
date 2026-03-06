/**
 * Home Stack — nested inside the Home tab.
 * Pushing icon screens (messages, section) within this Stack.
 * Full-screen swipe-back enabled — swipe left from anywhere to go back.
 * Gesture disabled on the stack root (home) to prevent swipe-left
 * from popping back to a non-existent previous screen.
 */

import { Stack } from 'expo-router';

export default function HomeLayout() {
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
    </Stack>
  );
}
