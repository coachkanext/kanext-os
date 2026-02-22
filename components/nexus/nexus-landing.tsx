/**
 * Nexus Landing — mode-specific quote + input bar.
 * Shown when no active conversation is selected.
 */

import React from 'react';
import { View, Image, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Mode } from '@/types';

const MODE_QUOTES: Record<Mode, { text: string; attribution: string }> = {
  sports: {
    text: 'Once the deal is made, there\u2019s no negotiating with yourself.',
    attribution: '\u2014 Kobe Bryant',
  },
  church: {
    text: 'The one who is unwilling to work shall not eat.',
    attribution: '\u2014 2 Thessalonians 3:10',
  },
  business: {
    text: 'The future looks bright.',
    attribution: '\u2014 Patrick Bet-David',
  },
  education: {
    text: 'The magic you\u2019re looking for is in the work you\u2019re avoiding.',
    attribution: '\u2014 Chris Williamson',
  },
  competition: {
    text: 'Why can\u2019t you do it? Do they have two heads?',
    attribution: '\u2014 Pastor Philip Anthony Mitchell',
  },
};

interface Props {
  mode: Mode;
}

export function NexusLanding({ mode }: Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const quote = MODE_QUOTES[mode] ?? MODE_QUOTES.business;

  return (
    <View style={styles.container}>
      <View style={styles.center}>
        <Image
          source={require('@/assets/images/nexus-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <ThemedText style={[styles.quoteText, { color: colors.textSecondary }]}>
          {quote.text}
        </ThemedText>
        <ThemedText style={[styles.attribution, { color: colors.textTertiary }]}>
          {quote.attribution}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  center: {
    alignItems: 'center',
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 24,
    opacity: 0.6,
  },
  quoteText: {
    fontSize: 22,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 32,
    opacity: 0.75,
  },
  attribution: {
    fontSize: 15,
    fontStyle: 'italic',
    marginTop: Spacing.md,
    opacity: 0.5,
  },
});
