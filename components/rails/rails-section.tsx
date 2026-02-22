/**
 * Rails Section — Payment rails for sports mode Ops tab.
 * Shows Tickets, Donations summary cards + Ledger demo.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT_GOLD = '#FFFFFF';

// Simple mock ledger data
const MOCK_LEDGER = [
  { id: '1', description: 'Season Ticket Package — Basketball', amount: 2400, type: 'revenue' as const, date: 'Feb 10' },
  { id: '2', description: 'Alumni Donation — Scholarship Fund', amount: 5000, type: 'revenue' as const, date: 'Feb 8' },
  { id: '3', description: 'Equipment Purchase — Training Facility', amount: -1200, type: 'expense' as const, date: 'Feb 6' },
  { id: '4', description: 'Single Game Tickets — vs Summit', amount: 840, type: 'revenue' as const, date: 'Feb 4' },
  { id: '5', description: 'Travel — Away Game Transport', amount: -680, type: 'expense' as const, date: 'Feb 2' },
];

function SectionLabel({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

export function RailsSection() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleTickets = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/organization/tickets' as any);
  };

  const handleDonations = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/(tabs)/organization/donations' as any);
  };

  return (
    <View style={styles.container}>
      <SectionLabel title="Payment Rails" colors={colors} />

      {/* Tickets + Donations row */}
      <View style={styles.cardsRow}>
        <Pressable
          style={({ pressed }) => [
            styles.railCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleTickets}
        >
          <View style={[styles.railIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
            <IconSymbol name="ticket.fill" size={22} color={ACCENT_GOLD} />
          </View>
          <ThemedText style={styles.railTitle}>Tickets</ThemedText>
          <ThemedText style={[styles.railSub, { color: colors.textSecondary }]}>
            Manage game tickets
          </ThemedText>
          <View style={styles.railCTA}>
            <ThemedText style={[styles.railCTAText, { color: ACCENT_GOLD }]}>Manage</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={ACCENT_GOLD} />
          </View>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.railCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleDonations}
        >
          <View style={[styles.railIcon, { backgroundColor: Brand.success + '15' }]}>
            <IconSymbol name="heart.fill" size={22} color={Brand.success} />
          </View>
          <ThemedText style={styles.railTitle}>Donations</ThemedText>
          <ThemedText style={[styles.railSub, { color: colors.textSecondary }]}>
            View contributions
          </ThemedText>
          <View style={styles.railCTA}>
            <ThemedText style={[styles.railCTAText, { color: Brand.success }]}>View</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={Brand.success} />
          </View>
        </Pressable>
      </View>

      {/* Ledger */}
      <View style={[styles.ledgerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.ledgerHeader}>
          <IconSymbol name="list.bullet.rectangle" size={16} color={ACCENT_GOLD} />
          <ThemedText style={styles.ledgerTitle}>Ledger</ThemedText>
        </View>
        {MOCK_LEDGER.map((tx, i) => (
          <View key={tx.id} style={[styles.ledgerRow, i < MOCK_LEDGER.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <View style={styles.ledgerInfo}>
              <ThemedText style={styles.ledgerDesc} numberOfLines={1}>{tx.description}</ThemedText>
              <ThemedText style={[styles.ledgerDate, { color: colors.textTertiary }]}>{tx.date}</ThemedText>
            </View>
            <ThemedText style={[styles.ledgerAmount, { color: tx.type === 'revenue' ? Brand.success : Brand.error }]}>
              {tx.type === 'revenue' ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
            </ThemedText>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: Spacing.md },

  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  cardsRow: { flexDirection: 'row', gap: Spacing.sm },

  railCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  railIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  railTitle: { fontSize: 15, fontWeight: '600', marginTop: 4 },
  railSub: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  railCTA: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  railCTAText: { fontSize: 13, fontWeight: '600' },

  ledgerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  ledgerHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: Spacing.sm },
  ledgerTitle: { fontSize: 15, fontWeight: '600' },
  ledgerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  ledgerInfo: { flex: 1 },
  ledgerDesc: { fontSize: 13, fontWeight: '500' },
  ledgerDate: { fontSize: 11, marginTop: 2 },
  ledgerAmount: { fontSize: 14, fontWeight: '700' },
});
