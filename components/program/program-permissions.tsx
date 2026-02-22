/**
 * Program Permissions — Role matrix + governance.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PERMISSION_ROLES, STAFF_MEMBERS } from '@/data/mock-program-v2';
import type { PermissionTier } from '@/data/mock-program-v2';

const TIER_COLORS: Record<PermissionTier, string> = {
  admin: '#FFFFFF',
  coach: '#1D9BF0',
  staff: '#F59E0B',
  viewer: '#52525B',
};

function SectionLabel({ text, colors }: { text: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[styles.sectionLabel, { color: colors.textSecondary }]}>{text}</ThemedText>
  );
}

export function ProgramPermissions() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Role Matrix */}
      <SectionLabel text="ROLE MATRIX" colors={colors} />
      {PERMISSION_ROLES.map((role) => {
        const tierColor = TIER_COLORS[role.tier];

        return (
          <View
            key={role.tier}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Header */}
            <View style={styles.roleHeader}>
              <View style={[styles.tierBadge, { backgroundColor: tierColor + '20' }]}>
                <ThemedText style={[styles.tierText, { color: tierColor }]}>
                  {role.label.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={[styles.memberCount, { color: colors.textTertiary }]}>
                {role.memberCount} {role.memberCount === 1 ? 'member' : 'members'}
              </ThemedText>
            </View>

            {/* Description */}
            <ThemedText style={[styles.roleDesc, { color: colors.textSecondary }]}>
              {role.description}
            </ThemedText>

            {/* Capabilities */}
            <View style={styles.capList}>
              {role.capabilities.map((cap) => (
                <View key={cap} style={styles.capRow}>
                  <View style={[styles.capBullet, { backgroundColor: tierColor }]} />
                  <ThemedText style={[styles.capText, { color: colors.text }]}>{cap}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      })}

      {/* Current Assignments */}
      <SectionLabel text="CURRENT ASSIGNMENTS" colors={colors} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {STAFF_MEMBERS.map((member, index) => {
          const tierColor = TIER_COLORS[member.permissionTier];

          return (
            <View key={member.id}>
              <View style={styles.assignmentRow}>
                <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[styles.avatarText, { color: colors.textSecondary }]}>
                    {member.initials}
                  </ThemedText>
                </View>
                <View style={styles.assignmentInfo}>
                  <ThemedText style={styles.assignmentName}>{member.name}</ThemedText>
                  <ThemedText style={[styles.assignmentRole, { color: colors.textSecondary }]}>
                    {member.role}
                  </ThemedText>
                </View>
                <View style={[styles.tierPill, { backgroundColor: tierColor + '20' }]}>
                  <ThemedText style={[styles.tierPillText, { color: tierColor }]}>
                    {member.permissionTier.charAt(0).toUpperCase() + member.permissionTier.slice(1)}
                  </ThemedText>
                </View>
              </View>
              {index < STAFF_MEMBERS.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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

  // Role cards
  roleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  tierBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  memberCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  capList: {
    gap: 6,
  },
  capRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  capBullet: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  capText: {
    fontSize: 13,
  },

  // Assignments
  assignmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '600',
  },
  assignmentInfo: {
    flex: 1,
  },
  assignmentName: {
    fontSize: 14,
    fontWeight: '500',
  },
  assignmentRole: {
    fontSize: 12,
    marginTop: 1,
  },
  tierPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  tierPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 36 + Spacing.sm,
  },
});
