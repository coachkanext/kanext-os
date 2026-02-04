/**
 * Member Profile Screen
 * Shows faculty/staff profile details for Education mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getFacultyById,
  getDepartmentById,
  getFacultyRoleLabel,
  SDCC_ORGANIZATION,
} from '@/data/mock-education';
import type { FacultyMember, Department } from '@/types';

// =============================================================================
// HELPERS
// =============================================================================

function getRoleIcon(role: FacultyMember['role']): IconSymbolName {
  const icons: Record<FacultyMember['role'], IconSymbolName> = {
    president: 'star.fill',
    provost: 'building.columns.fill',
    dean: 'person.badge.shield.checkmark.fill',
    chair: 'person.fill.checkmark',
    professor: 'graduationcap.fill',
    instructor: 'book.fill',
    staff: 'person.fill',
  };
  return icons[role] || 'person.fill';
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface InfoCardProps {
  icon: IconSymbolName;
  label: string;
  value: string;
  colors: typeof Colors.light;
  modeColor: string;
  onPress?: () => void;
}

function InfoCard({ icon, label, value, colors, modeColor, onPress }: InfoCardProps) {
  const content = (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
      <View style={[styles.infoIcon, { backgroundColor: modeColor + '15' }]}>
        <IconSymbol name={icon} size={18} color={modeColor} />
      </View>
      <View style={styles.infoContent}>
        <ThemedText style={[styles.infoLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
        <ThemedText style={styles.infoValue}>{value}</ThemedText>
      </View>
      {onPress && <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />}
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={({ pressed }) => pressed && { opacity: 0.8 }} onPress={onPress}>
        {content}
      </Pressable>
    );
  }
  return content;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MemberProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const modeColor = ModeColors.education.primary;

  const faculty = getFacultyById(memberId);
  const department = faculty?.departmentId ? getDepartmentById(faculty.departmentId) : null;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleEmailPress = () => {
    if (faculty?.email) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(`mailto:${faculty.email}`);
    }
  };

  // Not found state
  if (!faculty) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>Not Found</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="person.fill.questionmark" size={48} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            Member not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Profile</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <View style={[styles.avatar, { backgroundColor: modeColor + '15' }]}>
            <IconSymbol name="person.fill" size={48} color={modeColor} />
          </View>
          <ThemedText style={styles.profileName}>{faculty.name}</ThemedText>
          <ThemedText style={[styles.profileTitle, { color: colors.textSecondary }]}>
            {faculty.title}
          </ThemedText>

          {/* Role Badge */}
          <View style={[styles.roleBadge, { backgroundColor: modeColor + '15' }]}>
            <IconSymbol name={getRoleIcon(faculty.role)} size={14} color={modeColor} />
            <ThemedText style={[styles.roleText, { color: modeColor }]}>
              {getFacultyRoleLabel(faculty.role)}
            </ThemedText>
          </View>
        </View>

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {/* Institution */}
          <InfoCard
            icon="building.2.fill"
            label="Institution"
            value={SDCC_ORGANIZATION.name}
            colors={colors}
            modeColor={modeColor}
          />

          {/* Department */}
          {department && (
            <InfoCard
              icon="folder.fill"
              label="Department"
              value={department.name}
              colors={colors}
              modeColor={modeColor}
            />
          )}

          {/* Email */}
          {faculty.email && (
            <InfoCard
              icon="envelope.fill"
              label="Email"
              value={faculty.email}
              colors={colors}
              modeColor={modeColor}
              onPress={handleEmailPress}
            />
          )}
        </View>

        {/* Bio Section */}
        {faculty.bio && (
          <View style={styles.bioSection}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ABOUT
            </ThemedText>
            <View style={[styles.bioCard, { backgroundColor: colors.card }]}>
              <ThemedText style={[styles.bioText, { color: colors.textSecondary }]}>
                {faculty.bio}
              </ThemedText>
            </View>
          </View>
        )}

        {/* Department Info */}
        {department && (
          <View style={styles.deptSection}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              DEPARTMENT
            </ThemedText>
            <View style={[styles.deptCard, { backgroundColor: colors.card }]}>
              <View style={[styles.deptIcon, { backgroundColor: modeColor + '15' }]}>
                <IconSymbol name="folder.fill" size={24} color={modeColor} />
              </View>
              <View style={styles.deptContent}>
                <ThemedText style={styles.deptName}>{department.name}</ThemedText>
                {department.description && (
                  <ThemedText style={[styles.deptDesc, { color: colors.textSecondary }]}>
                    {department.description}
                  </ThemedText>
                )}
                <View style={styles.deptStats}>
                  <View style={styles.deptStat}>
                    <ThemedText style={[styles.deptStatValue, { color: modeColor }]}>
                      {department.programCount}
                    </ThemedText>
                    <ThemedText style={[styles.deptStatLabel, { color: colors.textTertiary }]}>
                      Programs
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Profile Header
  profileHeader: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  profileTitle: {
    fontSize: 16,
    marginTop: 4,
    textAlign: 'center',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.md,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Info Cards
  infoSection: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 2,
  },

  // Bio Section
  bioSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  bioCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Department Section
  deptSection: {
    marginBottom: Spacing.lg,
  },
  deptCard: {
    flexDirection: 'row',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  deptContent: {
    flex: 1,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deptDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  deptStats: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  deptStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  deptStatValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  deptStatLabel: {
    fontSize: 12,
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.md,
  },
});
