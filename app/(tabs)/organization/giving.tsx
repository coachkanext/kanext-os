/**
 * Giving Screen
 * Church giving options for Church mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { GIVING_OPTIONS, getGivingTypeLabel } from '@/data/mock-church';
import type { GivingOption } from '@/types';

// =============================================================================
// HELPERS
// =============================================================================

function getGivingIcon(type: GivingOption['type']): IconSymbolName {
  const icons: Record<GivingOption['type'], IconSymbolName> = {
    tithe: 'heart.fill',
    offering: 'gift.fill',
    donation: 'hand.raised.fill',
    fundraiser: 'building.columns.fill',
    missions: 'globe',
  };
  return icons[type] || 'dollarsign.circle.fill';
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface GivingCardProps {
  option: GivingOption;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function GivingCard({ option, colors, accentColor, onPress }: GivingCardProps) {
  const iconName = getGivingIcon(option.type);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.givingCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.givingIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={iconName} size={24} color={accentColor} />
      </View>
      <View style={styles.givingContent}>
        <ThemedText style={styles.givingName}>{option.name}</ThemedText>
        {option.description && (
          <ThemedText style={[styles.givingDesc, { color: colors.textSecondary }]}>
            {option.description}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="arrow.up.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function GivingScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.church;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGivingPress = (option: GivingOption) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (option.externalUrl) {
      Linking.openURL(option.externalUrl);
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Give
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            Support the work of the ministry
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Scripture */}
        <View style={[styles.scriptureCard, { backgroundColor: modeColors.primary }]}>
          <IconSymbol name="book.fill" size={24} color="#FFFFFF" />
          <ThemedText style={styles.scriptureText}>
            "Each of you should give what you have decided in your heart to give, not reluctantly
            or under compulsion, for God loves a cheerful giver."
          </ThemedText>
          <ThemedText style={styles.scriptureReference}>2 Corinthians 9:7</ThemedText>
        </View>

        {/* Giving Options */}
        <View style={styles.givingSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            GIVING OPTIONS
          </ThemedText>
          {GIVING_OPTIONS.map((option) => (
            <GivingCard
              key={option.id}
              option={option}
              colors={colors}
              accentColor={modeColors.primary}
              onPress={() => handleGivingPress(option)}
            />
          ))}
        </View>

        {/* Other Ways to Give */}
        <View style={styles.otherSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            OTHER WAYS TO GIVE
          </ThemedText>
          <View style={[styles.otherCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.otherRow}>
              <IconSymbol name="envelope.fill" size={18} color={modeColors.primary} />
              <View style={styles.otherContent}>
                <ThemedText style={styles.otherTitle}>Mail a Check</ThemedText>
                <ThemedText style={[styles.otherDesc, { color: colors.textSecondary }]}>
                  2361 W. 76th Street, Los Angeles, CA 90043
                </ThemedText>
              </View>
            </View>
            <View style={[styles.otherDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.otherRow}>
              <IconSymbol name="building.columns.fill" size={18} color={modeColors.primary} />
              <View style={styles.otherContent}>
                <ThemedText style={styles.otherTitle}>Give In Person</ThemedText>
                <ThemedText style={[styles.otherDesc, { color: colors.textSecondary }]}>
                  During any service at our campuses
                </ThemedText>
              </View>
            </View>
            <View style={[styles.otherDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.otherRow}>
              <IconSymbol name="phone.fill" size={18} color={modeColors.primary} />
              <View style={styles.otherContent}>
                <ThemedText style={styles.otherTitle}>Give by Phone</ThemedText>
                <ThemedText style={[styles.otherDesc, { color: colors.textSecondary }]}>
                  Call (800) ICC-GIVE
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Recurring Giving */}
        <Pressable
          style={[styles.recurringCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <IconSymbol name="arrow.triangle.2.circlepath" size={24} color={modeColors.primary} />
          <View style={styles.recurringContent}>
            <ThemedText style={styles.recurringTitle}>Set Up Recurring Giving</ThemedText>
            <ThemedText style={[styles.recurringDesc, { color: colors.textSecondary }]}>
              Make giving easy with automatic weekly or monthly contributions
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

  // Scripture Card
  scriptureCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  scriptureText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: Spacing.sm,
  },
  scriptureReference: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Giving Section
  givingSection: {
    marginBottom: Spacing.lg,
  },

  // Giving Card
  givingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  givingIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  givingContent: {
    flex: 1,
  },
  givingName: {
    fontSize: 16,
    fontWeight: '600',
  },
  givingDesc: {
    fontSize: 13,
    marginTop: 2,
  },

  // Other Section
  otherSection: {
    marginBottom: Spacing.lg,
  },
  otherCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  otherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  otherContent: {
    flex: 1,
  },
  otherTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  otherDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  otherDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 18 + Spacing.md,
  },

  // Recurring Card
  recurringCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  recurringContent: {
    flex: 1,
  },
  recurringTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  recurringDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});
