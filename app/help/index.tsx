/**
 * Help / Support Screen
 * Quick help, contact options, and diagnostics.
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, Linking, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: 'How do I switch modes?',
    answer: 'Use the mode dropdown in the header.',
  },
  {
    question: 'How do I switch programs?',
    answer: 'Open the avatar drawer (tap your avatar) and select Current Program.',
  },
  {
    question: 'How do I switch seasons?',
    answer: 'Open the avatar drawer (tap your avatar) and select Season.',
  },
];

export default function HelpScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const handleEmailSupport = () => {
    const email = 'support@kanext.com';
    const subject = encodeURIComponent('Support Request');
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  const appVersion = Constants.expoConfig?.version ?? '1.0.0';
  const buildNumber = Constants.expoConfig?.ios?.buildNumber ?? Constants.expoConfig?.android?.versionCode ?? '1';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Help / Support</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}>
        {/* Quick Help Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>QUICK HELP</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            {FAQ_ITEMS.map((item, index) => (
              <React.Fragment key={index}>
                {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                <Pressable
                  style={styles.faqItem}
                  onPress={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                >
                  <View style={styles.faqHeader}>
                    <Text style={[styles.faqQuestion, { color: colors.text }]}>{item.question}</Text>
                    <IconSymbol
                      name={expandedFAQ === index ? 'chevron.up' : 'chevron.down'}
                      size={16}
                      color={colors.textTertiary}
                    />
                  </View>
                  {expandedFAQ === index && (
                    <Text style={[styles.faqAnswer, { color: colors.textSecondary }]}>{item.answer}</Text>
                  )}
                </Pressable>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>CONTACT</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Pressable style={styles.row} onPress={handleEmailSupport}>
              <View style={styles.rowContent}>
                <IconSymbol name="envelope.fill" size={20} color={accent} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Email Support</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Pressable style={styles.row} onPress={() => router.push('/help/bug-report')}>
              <View style={styles.rowContent}>
                <IconSymbol name="ant.fill" size={20} color={accent} />
                <Text style={[styles.rowLabel, { color: colors.text }]}>Report a Bug</Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
            </Pressable>
          </View>
        </View>

        {/* Diagnostics Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>DIAGNOSTICS</Text>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <View style={styles.row}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Current Mode</Text>
              <Text style={[styles.diagValue, { color: colors.text }]}>
                {state.mode.charAt(0).toUpperCase() + state.mode.slice(1)}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Current Program</Text>
              <Text style={[styles.diagValue, { color: colors.text }]}>{state.program?.name ?? '—'}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Current Season</Text>
              <Text style={[styles.diagValue, { color: colors.text }]}>{state.cycle?.name ?? '—'}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>Platform</Text>
              <Text style={[styles.diagValue, { color: colors.text }]}>{Platform.OS}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.row}>
              <Text style={[styles.diagLabel, { color: colors.textSecondary }]}>App Version</Text>
              <Text style={[styles.diagValue, { color: colors.text }]}>{appVersion} ({buildNumber})</Text>
            </View>
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
  sectionTitle: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, marginBottom: Spacing.sm, marginLeft: Spacing.sm },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: Spacing.md },
  rowContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  rowLabel: { fontSize: 16 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  faqItem: { paddingVertical: 14, paddingHorizontal: Spacing.md },
  faqHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  faqQuestion: { fontSize: 16, flex: 1, marginRight: Spacing.sm },
  faqAnswer: { fontSize: 14, marginTop: Spacing.sm, lineHeight: 20 },
  diagLabel: { fontSize: 14 },
  diagValue: { fontSize: 14, fontWeight: '500' },
});
