/**
 * Terms of Service Screen
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';

const TOS_POINTS = [
  'KaNeXT is provided "as is" for evaluation and operational use.',
  'Users are responsible for decisions and outcomes.',
  'KaNeXT may change features without notice during development.',
  'Do not upload sensitive or regulated information unless your organization authorizes it.',
  'Misuse may result in access removal.',
];

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
        <View style={styles.content}>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            By using KaNeXT, you agree to the following terms:
          </Text>

          {TOS_POINTS.map((point, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: accent }]}>{'\u2022'}</Text>
              <Text style={[styles.bulletText, { color: colors.text }]}>{point}</Text>
            </View>
          ))}

          <Text style={[styles.footer, { color: colors.textTertiary }]}>
            Last updated: February 2026
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  intro: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.lg },
  bulletRow: { flexDirection: 'row', marginBottom: Spacing.md },
  bullet: { fontSize: 18, marginRight: Spacing.sm, lineHeight: 22 },
  bulletText: { flex: 1, fontSize: 15, lineHeight: 22 },
  footer: { fontSize: 13, marginTop: Spacing.xl },
});
