/**
 * Generic Coming Soon screen for Home icon grid taps.
 * Outside (tabs) group — tab bar is auto-hidden.
 */

import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/themed-view';
import { EmptyState } from '@/components/ui/empty-state';
import type { IconSymbolName } from '@/components/ui/icon-symbol';

const SECTION_ICONS: Record<string, IconSymbolName> = {
  Messages: 'bubble.left.and.bubble.right',
  Roster: 'person.3.fill',
  Recruiting: 'person.badge.plus',
  Calendar: 'calendar',
  Media: 'play.rectangle.fill',
  Feed: 'newspaper.fill',
  Store: 'bag.fill',
  Program: 'building.2.fill',
  Profile: 'person.circle',
  Schedule: 'calendar',
};

export default function SectionScreen() {
  const { title } = useLocalSearchParams<{ title: string }>();
  const sectionTitle = title ?? 'Section';
  const icon = SECTION_ICONS[sectionTitle] ?? 'sparkles';

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: sectionTitle,
          headerBackTitle: 'Home',
        }}
      />
      <EmptyState
        icon={icon}
        title={sectionTitle}
        description="Coming Soon"
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
