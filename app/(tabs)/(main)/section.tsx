/**
 * Section — Generic Coming Soon screen for Home icon grid taps.
 * Always-dark. Back arrow top-left. No title in header.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
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
  Phone: 'phone.fill',
  Schedule: 'calendar',
  Athletes: 'person.badge.plus',
  Film: 'play.rectangle.fill',
  Social: 'newspaper.fill',
  Season: 'calendar',
};

export default function SectionScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { title } = useLocalSearchParams<{ title: string }>();
  const sectionTitle = title ?? 'Section';
  const icon = SECTION_ICONS[sectionTitle] ?? 'sparkles';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Empty state */}
      <View style={styles.emptyContainer}>
        <View style={styles.iconCircle}>
          <IconSymbol name={icon} size={36} color={C.secondary} />
        </View>
        <Text style={styles.emptyTitle}>{sectionTitle}</Text>
        <Text style={styles.emptyDescription}>Coming Soon</Text>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: 15,
    color: C.muted,
  },
});
