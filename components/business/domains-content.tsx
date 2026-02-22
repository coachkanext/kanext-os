/**
 * Domains Content — Active grid + V2 dimmed grid with detail sheet.
 */

import React, { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const ACCENT_GOLD = '#FFFFFF';

interface DomainItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'live' | 'read-only' | 'v2';
  objects: string[];
  purpose: string;
}

const ACTIVE_DOMAINS: DomainItem[] = [
  {
    id: 'domain-sports',
    name: 'Sports',
    icon: 'sportscourt.fill',
    description: 'Athletic program management for universities, clubs, and leagues.',
    status: 'live',
    objects: ['Programs', 'Rosters', 'Games', 'Recruiting', 'Evaluations', 'Simulations'],
    purpose: 'Unified operational intelligence for basketball programs — recruiting, game ops, player evaluation, team analytics.',
  },
  {
    id: 'domain-enterprise',
    name: 'Enterprise',
    icon: 'building.2.fill',
    description: 'Investor data room and corporate intelligence platform.',
    status: 'live',
    objects: ['Companies', 'Documents', 'Proof Events', 'Engines', 'Governance', 'Fundraising'],
    purpose: 'Premium investor-facing app with data room, proof events, governance, and multi-company management.',
  },
  {
    id: 'domain-church',
    name: 'Church',
    icon: 'heart.fill',
    description: 'Ministry management and congregation engagement.',
    status: 'read-only',
    objects: ['Campuses', 'Ministries', 'Messages', 'Giving', 'Connect Groups'],
    purpose: 'Multi-campus ministry operations — service management, ministry coordination, giving, and congregation engagement.',
  },
  {
    id: 'domain-education',
    name: 'Education',
    icon: 'graduationcap.fill',
    description: 'Academic administration and student services.',
    status: 'read-only',
    objects: ['Departments', 'Terms', 'Calendar', 'Faculty', 'Enrollment'],
    purpose: 'Institutional oversight — academic calendar management, department coordination, and enrollment analytics.',
  },
];

const V2_DOMAINS: DomainItem[] = [
  {
    id: 'domain-video',
    name: 'Video',
    icon: 'play.rectangle.fill',
    description: 'Film room, video tagging, and media intelligence.',
    status: 'v2',
    objects: ['Film Sessions', 'Tags', 'Playlists', 'Clips'],
    purpose: 'Integrated video intelligence — tagging, breakdown, and AI-powered film analysis.',
  },
  {
    id: 'domain-identity',
    name: 'Identity',
    icon: 'person.crop.circle.fill',
    description: 'Unified identity and credential management.',
    status: 'v2',
    objects: ['Profiles', 'Credentials', 'Permissions', 'SSO'],
    purpose: 'Cross-domain identity layer — single sign-on, role-based access, and credential management.',
  },
  {
    id: 'domain-rails',
    name: 'Payments',
    icon: 'creditcard.fill',
    description: 'Financial rails, billing, and transaction processing.',
    status: 'v2',
    objects: ['Subscriptions', 'Invoices', 'Payouts', 'Ledger'],
    purpose: 'Payment infrastructure — subscription billing, NIL payouts, giving processing, and financial ledger.',
  },
];

function getStatusColor(status: string): string {
  switch (status) {
    case 'live': return '#22C55E';
    case 'read-only': return '#F59E0B';
    case 'v2': return '#A1A1AA';
    default: return '#A1A1AA';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'live': return 'LIVE';
    case 'read-only': return 'READ-ONLY';
    case 'v2': return 'V2';
    default: return status.toUpperCase();
  }
}

export function DomainsContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  const handleDomainPress = (domain: DomainItem) => {
    if (domain.status === 'v2') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDomain(domain);
    setSheetVisible(true);
  };

  const renderDomainTile = (domain: DomainItem, dimmed = false) => (
    <Pressable
      key={domain.id}
      style={[
        styles.tile,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: dimmed ? 0.4 : 1 },
      ]}
      onPress={() => handleDomainPress(domain)}
      disabled={dimmed}
    >
      <View style={styles.tileHeader}>
        <View style={[styles.tileIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
          <IconSymbol name={domain.icon as any} size={20} color={ACCENT_GOLD} />
        </View>
        {dimmed && (
          <View style={[styles.v2Badge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.v2BadgeText, { color: colors.textTertiary }]}>V2</ThemedText>
          </View>
        )}
      </View>
      <ThemedText style={styles.tileName}>{domain.name}</ThemedText>
      <View style={styles.tileStatusRow}>
        <View style={[styles.statusDot, { backgroundColor: getStatusColor(domain.status) }]} />
        <ThemedText style={[styles.tileStatus, { color: colors.textSecondary }]}>
          {getStatusLabel(domain.status)}
        </ThemedText>
      </View>
      <ThemedText style={[styles.tileDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {domain.description}
      </ThemedText>
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {/* Active Domains */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        Active Domains
      </ThemedText>
      <View style={styles.grid}>
        {ACTIVE_DOMAINS.map((d) => renderDomainTile(d))}
      </View>

      {/* V2 Domains */}
      <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>
        Coming in V2
      </ThemedText>
      <View style={styles.grid}>
        {V2_DOMAINS.map((d) => renderDomainTile(d, true))}
      </View>

      {/* Domain Detail Sheet */}
      <BottomSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title={selectedDomain?.name ?? ''}
        useModal
      >
        {selectedDomain && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetStatusRow}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(selectedDomain.status) }]} />
              <ThemedText style={[styles.sheetStatus, { color: getStatusColor(selectedDomain.status) }]}>
                {getStatusLabel(selectedDomain.status)}
              </ThemedText>
            </View>

            <ThemedText style={[styles.sheetSectionLabel, { color: colors.textSecondary }]}>
              Purpose
            </ThemedText>
            <ThemedText style={[styles.sheetBody, { color: colors.text }]}>
              {selectedDomain.purpose}
            </ThemedText>

            <ThemedText style={[styles.sheetSectionLabel, { color: colors.textSecondary }]}>
              Objects Managed
            </ThemedText>
            <View style={styles.objectsGrid}>
              {selectedDomain.objects.map((obj) => (
                <View key={obj} style={[styles.objectChip, { backgroundColor: ACCENT_GOLD + '15' }]}>
                  <ThemedText style={[styles.objectChipText, { color: ACCENT_GOLD }]}>{obj}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  tileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  v2Badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  v2BadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  tileStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tileStatus: {
    fontSize: 11,
    fontWeight: '600',
  },
  tileDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Sheet
  sheetContent: {
    padding: Spacing.md,
  },
  sheetStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  sheetStatus: {
    fontSize: 13,
    fontWeight: '700',
  },
  sheetSectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  objectsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  objectChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  objectChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
