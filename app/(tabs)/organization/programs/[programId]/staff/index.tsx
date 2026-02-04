/**
 * Staff List Page
 * List of coaching staff for a program.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
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
      <IconSymbol name="chevron.left" size={20} color={colors.tint} />
      <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

interface StaffCardProps {
  staff: Staff;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  isHeadCoach: boolean;
}

function StaffCard({ staff, onPress, colors, accentColor, isHeadCoach }: StaffCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.staffCard,
        {
          backgroundColor: colors.card,
          borderColor: isHeadCoach ? accentColor : colors.border,
          borderWidth: isHeadCoach ? 2 : 1,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.staffAvatar, { backgroundColor: isHeadCoach ? accentColor : colors.backgroundTertiary }]}>
        <IconSymbol
          name="person.fill"
          size={28}
          color={isHeadCoach ? '#FFFFFF' : colors.textTertiary}
        />
      </View>
      <View style={styles.staffInfo}>
        <ThemedText style={styles.staffName}>{staff.name}</ThemedText>
        <ThemedText style={[styles.staffTitle, { color: colors.textSecondary }]}>
          {staff.title}
        </ThemedText>
        {isHeadCoach && (
          <View style={[styles.headCoachBadge, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[styles.headCoachBadgeText, { color: accentColor }]}>
              Head Coach
            </ThemedText>
          </View>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function StaffListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { programId } = useLocalSearchParams<{ programId: string }>();

  const modeColors = ModeColors.sports;
  const program = getProgramById(programId);

  if (!program) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Program not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleStaffPress = (staffId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/programs/${programId}/staff/${staffId}`);
  };

  // Separate head coach from assistants
  const headCoach = program.staff.find((s) => s.role === 'head_coach');
  const assistants = program.staff.filter((s) => s.role !== 'head_coach');

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <ThemedText type="title" style={styles.title}>
          Coaching Staff
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: colors.textSecondary }]}>
          {INSTITUTION.nickname} {program.name} • {program.staff.length} coaches
        </ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {program.staff.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol
              name="person.badge.shield.checkmark"
              size={48}
              color={colors.textTertiary}
              style={styles.emptyIcon}
            />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
              No staff listed
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Head Coach */}
            {headCoach && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Head Coach
                  </ThemedText>
                </View>
                <StaffCard
                  staff={headCoach}
                  onPress={() => handleStaffPress(headCoach.id)}
                  colors={colors}
                  accentColor={modeColors.primary}
                  isHeadCoach
                />
              </>
            )}

            {/* Assistant Coaches */}
            {assistants.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    Assistant Coaches ({assistants.length})
                  </ThemedText>
                </View>
                <View style={styles.staffGrid}>
                  {assistants.map((staff) => (
                    <StaffCard
                      key={staff.id}
                      staff={staff}
                      onPress={() => handleStaffPress(staff.id)}
                      colors={colors}
                      accentColor={modeColors.primary}
                      isHeadCoach={false}
                    />
                  ))}
                </View>
              </>
            )}
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
  titleContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionHeader: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  staffGrid: {
    gap: Spacing.sm,
  },
  staffCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  staffAvatar: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 17,
    fontWeight: '600',
  },
  staffTitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headCoachBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  headCoachBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 15,
  },
});
