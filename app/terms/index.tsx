/**
 * Terms & Policies Screen
 * Links to TOS, Privacy, and Governance.
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface PolicyLink {
  label: string;
  route: '/terms/tos' | '/terms/privacy' | '/terms/governance';
}

const POLICY_LINKS: PolicyLink[] = [
  { label: 'Terms of Service', route: '/terms/tos' },
  { label: 'Privacy Policy', route: '/terms/privacy' },
  { label: 'Data & Governance Principles', route: '/terms/governance' },
];

export default function TermsScreen() {
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms & Policies</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
        <View style={styles.section}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {POLICY_LINKS.map((link, index) => (
              <React.Fragment key={link.route}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                <Pressable
                  style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.backgroundSecondary }]}
                  onPress={() => router.push(link.route)}
                >
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{link.label}</Text>
                  <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                </Pressable>
              </React.Fragment>
            ))}
          </View>
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
  section: { marginTop: Spacing.lg, paddingHorizontal: Spacing.md },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: Spacing.md },
  rowLabel: { fontSize: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
});
