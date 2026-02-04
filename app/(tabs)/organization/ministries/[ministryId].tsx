/**
 * Ministry Detail Screen
 * Individual ministry information for Church mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MINISTRIES, getMinistryTypeLabel } from '@/data/mock-church';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MinistryDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { ministryId } = useLocalSearchParams<{ ministryId: string }>();
  const modeColors = ModeColors.church;

  const ministry = MINISTRIES.find((m) => m.id === ministryId);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  if (!ministry) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <ThemedText type="title">Ministry Not Found</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="person.3.fill" size={48} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            This ministry could not be found.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const iconName = (ministry.icon || 'person.3.fill') as IconSymbolName;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            {ministry.name}
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {getMinistryTypeLabel(ministry.type)} Ministry
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Ministry Icon */}
        <View style={[styles.ministryBadge, { backgroundColor: modeColors.primary }]}>
          <IconSymbol name={iconName} size={40} color="#FFFFFF" />
        </View>

        {/* Description */}
        {ministry.description && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ABOUT
            </ThemedText>
            <ThemedText style={styles.description}>{ministry.description}</ThemedText>
          </View>
        )}

        {/* Access Methods (for ministries like Prayer that have them) */}
        {ministry.accessMethods && ministry.accessMethods.length > 0 && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              HOW TO CONNECT
            </ThemedText>
            {ministry.accessMethods.map((method, index) => (
              <View
                key={index}
                style={[styles.accessCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <IconSymbol name="checkmark.circle.fill" size={20} color={modeColors.primary} />
                <ThemedText style={styles.accessText}>{method}</ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Get Involved */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            GET INVOLVED
          </ThemedText>
          <Pressable
            style={[styles.involvedButton, { backgroundColor: modeColors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="hand.raised.fill" size={20} color="#FFFFFF" />
            <ThemedText style={styles.involvedButtonText}>Sign Up to Volunteer</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.learnMoreButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="info.circle" size={20} color={modeColors.primary} />
            <ThemedText style={[styles.learnMoreButtonText, { color: modeColors.primary }]}>
              Learn More
            </ThemedText>
          </Pressable>
        </View>

        {/* Contact */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            CONTACT
          </ThemedText>
          <View style={styles.contactActions}>
            <Pressable
              style={[styles.contactButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <IconSymbol name="envelope.fill" size={20} color={modeColors.primary} />
              <ThemedText style={styles.contactButtonText}>Email Ministry</ThemedText>
            </Pressable>
          </View>
        </View>
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

  // Ministry Badge
  ministryBadge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: Spacing.lg,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Access Methods
  accessCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  accessText: {
    fontSize: 14,
    flex: 1,
  },

  // Get Involved
  involvedButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  involvedButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  learnMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  learnMoreButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Contact
  contactActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  contactButtonText: {
    fontSize: 15,
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.sm,
  },
});
