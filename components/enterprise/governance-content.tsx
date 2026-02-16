/**
 * Governance Content — Company info, mailbox, structure, board, policy.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEnterprise } from '@/context/enterprise-context';
import { COMPANIES, BOARD_MEMBERS, LEADERSHIP_TEAM } from '@/data/mock-enterprise';
import type { BoardMember } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

function SectionLabel({ text, colors }: { text: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</ThemedText>
  );
}

function MemberCard({ member, colors }: { member: BoardMember; colors: typeof Colors.light }) {
  return (
    <View style={styles.memberRow}>
      <View style={[styles.memberAvatar, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name="person.fill" size={20} color={colors.textTertiary} />
      </View>
      <View style={styles.memberInfo}>
        <ThemedText style={styles.memberName}>{member.name}</ThemedText>
        <ThemedText style={[styles.memberRole, { color: colors.textSecondary }]}>
          {member.role}
          {member.company && member.company !== 'KaNeXT' ? ` — ${member.company}` : ''}
        </ThemedText>
      </View>
    </View>
  );
}

const POLICIES = [
  { title: 'IP Assignment', description: 'All IP assigned to operating entity' },
  { title: 'Open Source Posture', description: 'Proprietary core with selective OSS contributions' },
  { title: 'Data Rights', description: 'Customer data owned by customer; aggregated insights by KaNeXT' },
];

export function GovernanceContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { activeCompany } = useEnterprise();

  return (
    <View style={styles.container}>
      {/* 1. Company Info */}
      <SectionLabel text="Company Information" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>Legal Name</ThemedText>
          <ThemedText style={styles.infoValue}>{activeCompany.legalName}</ThemedText>
        </View>
        {activeCompany.dbaName && (
          <View style={styles.infoRow}>
            <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>DBA</ThemedText>
            <ThemedText style={styles.infoValue}>{activeCompany.dbaName}</ThemedText>
          </View>
        )}
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>Entity Type</ThemedText>
          <ThemedText style={styles.infoValue}>{activeCompany.entityType}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>Jurisdiction</ThemedText>
          <ThemedText style={styles.infoValue}>{activeCompany.jurisdiction}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>Status</ThemedText>
          <ThemedText style={styles.infoValue}>{activeCompany.status}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>Primary Contact</ThemedText>
          <ThemedText style={styles.infoValue}>
            {activeCompany.primaryContact.name} — {activeCompany.primaryContact.role}
          </ThemedText>
        </View>
      </View>

      {/* 2. Mailbox Address */}
      <SectionLabel text="Registered Agent / Mailbox" colors={colors} />
      <View style={[styles.card, styles.addressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {activeCompany.addressBlock.map((line, i) => (
          <ThemedText key={i} style={[styles.addressLine, { color: colors.text }]}>
            {line}
          </ThemedText>
        ))}
      </View>

      {/* 3. Corporate Structure */}
      <SectionLabel text="Corporate Structure" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.structureRow}>
          <View style={[styles.structureIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
            <IconSymbol name="building.2.fill" size={16} color={ACCENT_GOLD} />
          </View>
          <View>
            <ThemedText style={styles.structureParent}>OSK Group LLC</ThemedText>
            <ThemedText style={[styles.structureLabel, { color: colors.textTertiary }]}>
              Parent / Holding Company
            </ThemedText>
          </View>
        </View>
        <View style={styles.structureTree}>
          <View style={[styles.treeLine, { borderLeftColor: colors.border }]} />
          <View style={styles.structureChild}>
            <View style={[styles.structureIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
              <IconSymbol name="building.fill" size={14} color={ACCENT_GOLD} />
            </View>
            <View>
              <ThemedText style={styles.structureChildName}>KaNeXT Operations LLC</ThemedText>
              <ThemedText style={[styles.structureLabel, { color: colors.textTertiary }]}>
                Operating Entity (DBA "KaNeXT")
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* 4. Board / Advisory */}
      <SectionLabel text="Board & Advisory" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BOARD_MEMBERS.map((member, index) => (
          <View key={member.id}>
            <MemberCard member={member} colors={colors} />
            {index < BOARD_MEMBERS.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}
      </View>

      {/* 5. Policy & Compliance */}
      <SectionLabel text="Policy & Compliance" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {POLICIES.map((policy, index) => (
          <View key={policy.title}>
            <View style={styles.policyRow}>
              <View style={styles.policyInfo}>
                <ThemedText style={styles.policyTitle}>{policy.title}</ThemedText>
                <ThemedText style={[styles.policyDesc, { color: colors.textSecondary }]}>
                  {policy.description}
                </ThemedText>
              </View>
              <View style={[styles.placeholderBadge, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.placeholderText, { color: colors.textTertiary }]}>
                  Set
                </ThemedText>
              </View>
            </View>
            {index < POLICIES.length - 1 && (
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}
      </View>
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
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  addressCard: {
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_GOLD,
  },
  addressLine: {
    fontSize: 14,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  infoLabel: {
    fontSize: 13,
    flex: 1,
  },
  infoValue: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1.5,
    textAlign: 'right',
  },

  // Structure
  structureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  structureIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  structureParent: {
    fontSize: 15,
    fontWeight: '600',
  },
  structureLabel: {
    fontSize: 12,
    marginTop: 1,
  },
  structureTree: {
    marginLeft: 16,
    paddingTop: Spacing.sm,
  },
  treeLine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 16,
    borderLeftWidth: 1.5,
  },
  structureChild: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingLeft: Spacing.md,
  },
  structureChildName: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Board
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 15,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: 13,
    marginTop: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 40 + Spacing.sm,
  },

  // Policy
  policyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  policyInfo: {
    flex: 1,
  },
  policyTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  policyDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  placeholderBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
