/**
 * Company Profile Sheet — Full company details + mailbox address.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBusiness } from '@/context/business-context';

const ACCENT_GOLD = '#FFFFFF';

interface CompanyProfileSheetProps {
  visible: boolean;
  onClose: () => void;
}

export function CompanyProfileSheet({ visible, onClose }: CompanyProfileSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { activeCompany } = useBusiness();

  return (
    <BottomSheet visible={visible} onClose={onClose} title={activeCompany.displayName} useModal>
      <View style={styles.container}>
        {/* Company badge */}
        <View style={styles.headerRow}>
          <View style={[styles.badge, { backgroundColor: ACCENT_GOLD }]}>
            <ThemedText style={styles.badgeText}>{activeCompany.initials}</ThemedText>
          </View>
          <View style={styles.headerInfo}>
            <ThemedText style={styles.displayName}>{activeCompany.displayName}</ThemedText>
            <ThemedText style={[styles.legalName, { color: colors.textSecondary }]}>
              {activeCompany.legalName}
            </ThemedText>
          </View>
        </View>

        {/* Status pill */}
        <View style={[styles.statusPill, { backgroundColor: ACCENT_GOLD + '20' }]}>
          <ThemedText style={[styles.statusText, { color: ACCENT_GOLD }]}>
            {activeCompany.status}
          </ThemedText>
        </View>

        {/* Info fields */}
        <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {activeCompany.dbaName && (
            <InfoRow label="DBA" value={activeCompany.dbaName} colors={colors} />
          )}
          <InfoRow label="Entity Type" value={activeCompany.entityType} colors={colors} />
          <InfoRow label="Jurisdiction" value={activeCompany.jurisdiction} colors={colors} />
          <InfoRow label="Contact" value={activeCompany.primaryContact.name} colors={colors} />
          <InfoRow label="Email" value={activeCompany.primaryContact.email} colors={colors} />
          <InfoRow label="Role" value={activeCompany.primaryContact.role} colors={colors} />
        </View>

        {/* Mailbox */}
        <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
          Registered Mailbox
        </ThemedText>
        <View style={[styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {activeCompany.addressBlock.map((line, i) => (
            <ThemedText key={i} style={[styles.addressLine, { color: colors.text }]}>
              {line}
            </ThemedText>
          ))}
        </View>

        {/* Last updated */}
        <ThemedText style={[styles.updated, { color: colors.textTertiary }]}>
          Last updated {activeCompany.lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </ThemedText>
      </View>
    </BottomSheet>
  );
}

function InfoRow({ label, value, colors }: { label: string; value: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
      <ThemedText style={[styles.infoValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
  },
  legalName: {
    fontSize: 14,
    marginTop: 2,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  addressCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_GOLD,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  addressLine: {
    fontSize: 14,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  updated: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});
