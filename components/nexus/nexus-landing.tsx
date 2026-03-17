/**
 * Nexus Landing — Empty state with asterisk logo and time-aware greeting.
 * Matches the Claude mobile app home screen aesthetic.
 */

import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'How can I help you\nthis morning?';
  if (hour < 17) return 'How can I help you\nthis afternoon?';
  return 'How can I help you\nthis evening?';
}

export function NexusLanding() {
  const C = useColors();
  const greeting = useMemo(() => getGreeting(), []);
  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.center}>
        <IconSymbol name="sparkles" size={52} color={C.secondary} weight="medium" />
        <Text style={[styles.greeting, { color: C.label }]}>{greeting}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingBottom: 100,
  },
  greeting: {
    marginTop: 22,
    fontSize: 30,
    fontFamily: 'Georgia',
    textAlign: 'center',
    lineHeight: 40,
    letterSpacing: -0.3,
  },
});
