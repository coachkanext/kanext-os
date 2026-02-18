/**
 * Governance Screen
 * Business board, advisors, and legal structure.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  KANEXT_ORGANIZATION,
  BOARD_MEMBERS,
  LEADERSHIP_TEAM,
} from '@/data/mock-business-investor';
import type { BoardMember } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface MemberCardProps {
  member: BoardMember;
  colors: typeof Colors.light;
  accentColor: string;
}

function MemberCard({ member, colors, accentColor }: MemberCardProps) {
  return (
    <View style={[styles.memberCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.memberAvatar, { backgroundColor: accentColor + '15' }]}>
        <ThemedText style={[styles.memberInitial, { color: accentColor }]}>
          {member.name.charAt(0)}
        </ThemedText>
      </View>
      <View style={styles.memberInfo}>
        <ThemedText style={styles.memberName}>{member.name}</ThemedText>
        <ThemedText style={[styles.memberRole, { color: accentColor }]}>{member.role}</ThemedText>
        {member.company && (
          <ThemedText style={[styles.memberCompany, { color: colors.textSecondary }]}>
            {member.title ? `${member.title} • ` : ''}{member.company}
          </ThemedText>
        )}
        {member.bio && (
          <ThemedText style={[styles.memberBio, { color: colors.textSecondary }]}>
            {member.bio}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

interface InfoRowProps {
  label: string;
  value: string;
  colors: typeof Colors.light;
}

function InfoRow({ label, value, colors }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
      <ThemedText style={styles.infoValue}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function GovernanceScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.business;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Filter board members by role
  const boardMembers = BOARD_MEMBERS.filter(
    (m) => m.role.includes('Board') || m.role.includes('CEO')
  );
  const advisors = BOARD_MEMBERS.filter((m) => m.role.includes('Advisor'));

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Governance
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Board, advisors & legal structure
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Legal Structure */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Legal Structure
          </ThemedText>
          <View style={[styles.legalCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow
              label="Entity Type"
              value={KANEXT_ORGANIZATION.legalStructure}
              colors={colors}
            />
            <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
            <InfoRow
              label="State of Formation"
              value={KANEXT_ORGANIZATION.stateOfFormation}
              colors={colors}
            />
            <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
            <InfoRow
              label="Status"
              value={KANEXT_ORGANIZATION.status}
              colors={colors}
            />
          </View>
        </View>

        {/* Board of Directors */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Board of Directors
          </ThemedText>
          <View style={styles.membersList}>
            {boardMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>
        </View>

        {/* Advisors */}
        {advisors.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Advisors
            </ThemedText>
            <View style={styles.membersList}>
              {advisors.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  colors={colors}
                  accentColor={modeColors.primary}
                />
              ))}
            </View>
          </View>
        )}

        {/* Executive Team */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Executive Team
          </ThemedText>
          <View style={styles.membersList}>
            {LEADERSHIP_TEAM.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>
        </View>

        {/* Key Documents Link */}
        <Pressable
          style={({ pressed }) => [
            styles.documentsLink,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.8 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/organization/documents');
          }}
        >
          <View style={[styles.documentsIcon, { backgroundColor: modeColors.primary + '15' }]}>
            <IconSymbol name="doc.fill" size={20} color={modeColors.primary} />
          </View>
          <View style={styles.documentsInfo}>
            <ThemedText style={styles.documentsTitle}>Governance Documents</ThemedText>
            <ThemedText style={[styles.documentsSubtitle, { color: colors.textSecondary }]}>
              Bylaws, board minutes, agreements
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Legal Card
  legalCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.xs,
  },

  // Member Cards
  membersList: {
    gap: Spacing.sm,
  },
  memberCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  memberAvatar: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  memberInitial: {
    fontSize: 20,
    fontWeight: '600',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
  },
  memberRole: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  memberCompany: {
    fontSize: 13,
    marginTop: 2,
  },
  memberBio: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.xs,
  },

  // Documents Link
  documentsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  documentsIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  documentsInfo: {
    flex: 1,
  },
  documentsTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  documentsSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
});
