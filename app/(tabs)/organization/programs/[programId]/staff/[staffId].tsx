/**
 * Staff Profile Page
 * Detailed view of a staff member with bio and contact info.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  getProgramById,
  INSTITUTION,
  type Staff,
} from '@/data/mock-sports';

// =============================================================================
// COMPONENTS
// =============================================================================

interface BackButtonProps {
  onPress: () => void;
  colors: typeof Colors.light;
}

function BackButton({ onPress, colors }: BackButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <IconSymbol name="chevron.left" size={20} color={accent} />
      <ThemedText style={[styles.backButtonText, { color: accent }]}>
        Staff
      </ThemedText>
    </Pressable>
  );
}

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    head_coach: 'Head Coach',
    assistant_coach: 'Assistant Coach',
    coordinator: 'Coordinator',
    trainer: 'Athletic Trainer',
    director: 'Director',
  };
  return labels[role] || role;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function StaffProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { programId, staffId } = useLocalSearchParams<{
    programId: string;
    staffId: string;
  }>();

  const modeColors = ModeColors.sports;
  const program = getProgramById(programId);
  const staff = program?.staff.find((s) => s.id === staffId);

  if (!staff) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Staff member not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const isHeadCoach = staff.role === 'head_coach';

  const handleEmailPress = () => {
    if (staff.email) {
      Linking.openURL(`mailto:${staff.email}`);
    }
  };

  const handlePhonePress = () => {
    if (staff.phone) {
      Linking.openURL(`tel:${staff.phone}`);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Staff Header */}
        <View style={styles.staffHeader}>
          <View
            style={[
              styles.staffAvatar,
              { backgroundColor: isHeadCoach ? modeColors.primary : colors.backgroundTertiary },
            ]}
          >
            <IconSymbol
              name="person.fill"
              size={40}
              color={isHeadCoach ? '#FFFFFF' : colors.textTertiary}
            />
          </View>
          <View style={styles.staffInfo}>
            <ThemedText style={styles.staffName}>{staff.name}</ThemedText>
            <ThemedText style={[styles.staffTitle, { color: colors.textSecondary }]}>
              {staff.title}
            </ThemedText>
            <View style={styles.teamRow}>
              <ThemedText style={[styles.teamName, { color: modeColors.primary }]}>
                {INSTITUTION.nickname}
              </ThemedText>
              {program && (
                <ThemedText style={[styles.programName, { color: colors.textTertiary }]}>
                  {' '}• {program.name}
                </ThemedText>
              )}
            </View>
          </View>
        </View>

        {/* Role Badge */}
        <View style={[styles.roleCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.roleBadge, { backgroundColor: modeColors.primary + '15' }]}>
            <IconSymbol name="person.badge.shield.checkmark.fill" size={20} color={modeColors.primary} />
          </View>
          <View style={styles.roleInfo}>
            <ThemedText style={styles.roleLabel}>Position</ThemedText>
            <ThemedText style={[styles.roleValue, { color: modeColors.primary }]}>
              {getRoleLabel(staff.role)}
            </ThemedText>
          </View>
        </View>

        {/* Bio */}
        {staff.bio && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                About
              </ThemedText>
            </View>
            <View style={[styles.bioCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[styles.bioText, { color: colors.textSecondary }]}>
                {staff.bio}
              </ThemedText>
            </View>
          </>
        )}

        {/* Contact Info */}
        {(staff.email || staff.phone) && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Contact
              </ThemedText>
            </View>
            <View style={[styles.contactCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {staff.email && (
                <Pressable
                  style={({ pressed }) => [
                    styles.contactRow,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={handleEmailPress}
                >
                  <View style={[styles.contactIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <IconSymbol name="envelope.fill" size={16} color={modeColors.primary} />
                  </View>
                  <View style={styles.contactInfo}>
                    <ThemedText style={[styles.contactLabel, { color: colors.textTertiary }]}>
                      Email
                    </ThemedText>
                    <ThemedText style={[styles.contactValue, { color: modeColors.primary }]}>
                      {staff.email}
                    </ThemedText>
                  </View>
                  <IconSymbol name="arrow.up.right" size={14} color={colors.textTertiary} />
                </Pressable>
              )}
              {staff.email && staff.phone && (
                <View style={[styles.contactDivider, { backgroundColor: colors.divider }]} />
              )}
              {staff.phone && (
                <Pressable
                  style={({ pressed }) => [
                    styles.contactRow,
                    pressed && { opacity: 0.7 },
                  ]}
                  onPress={handlePhonePress}
                >
                  <View style={[styles.contactIcon, { backgroundColor: colors.backgroundTertiary }]}>
                    <IconSymbol name="phone.fill" size={16} color={modeColors.primary} />
                  </View>
                  <View style={styles.contactInfo}>
                    <ThemedText style={[styles.contactLabel, { color: colors.textTertiary }]}>
                      Phone
                    </ThemedText>
                    <ThemedText style={[styles.contactValue, { color: modeColors.primary }]}>
                      {staff.phone}
                    </ThemedText>
                  </View>
                  <IconSymbol name="arrow.up.right" size={14} color={colors.textTertiary} />
                </Pressable>
              )}
            </View>
          </>
        )}

        {/* Program Info */}
        {program && (
          <>
            <View style={styles.sectionHeader}>
              <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                Program
              </ThemedText>
            </View>
            <View style={[styles.programCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.programRow}>
                <ThemedText style={[styles.programLabel, { color: colors.textTertiary }]}>
                  Team
                </ThemedText>
                <ThemedText style={styles.programValue}>
                  {INSTITUTION.name} {program.sport}
                </ThemedText>
              </View>
              <View style={styles.programRow}>
                <ThemedText style={[styles.programLabel, { color: colors.textTertiary }]}>
                  Level
                </ThemedText>
                <ThemedText style={styles.programValue}>{program.name}</ThemedText>
              </View>
              <View style={styles.programRow}>
                <ThemedText style={[styles.programLabel, { color: colors.textTertiary }]}>
                  Conference
                </ThemedText>
                <ThemedText style={styles.programValue}>{INSTITUTION.conference}</ThemedText>
              </View>
            </View>
          </>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },

  // Staff Header
  staffHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  staffAvatar: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 24,
    fontWeight: '700',
  },
  staffTitle: {
    fontSize: 16,
    marginTop: 2,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
  },
  programName: {
    fontSize: 14,
  },

  // Role Card
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  roleBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  roleInfo: {
    flex: 1,
  },
  roleLabel: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  roleValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },

  // Section Header
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Bio Card
  bioCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  bioText: {
    fontSize: 15,
    lineHeight: 24,
  },

  // Contact Card
  contactCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.lg,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  contactIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 12,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 1,
  },
  contactDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 36 + Spacing.sm,
  },

  // Program Card
  programCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  programRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  programLabel: {
    fontSize: 14,
  },
  programValue: {
    fontSize: 14,
    fontWeight: '500',
  },
});
