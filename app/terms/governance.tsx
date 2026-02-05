/**
 * Data & Governance Principles Screen
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const GOVERNANCE_POINTS = [
  'KaNeXT separates records ("truth") from judgments ("recommendations").',
  'History is preserved; outputs should be attributable to inputs.',
  'Context (mode, program, season) determines what you see and do.',
  'KaNeXT recommends; humans execute.',
  'Data access is permissioned by role and organization policies.',
];

export default function GovernanceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Data & Governance</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
        <View style={styles.content}>
          <Text style={[styles.intro, { color: colors.textSecondary }]}>
            Our principles for handling data and making recommendations:
          </Text>

          {GOVERNANCE_POINTS.map((point, index) => (
            <View key={index} style={styles.bulletRow}>
              <Text style={[styles.bullet, { color: colors.tint }]}>{'\u2022'}</Text>
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
