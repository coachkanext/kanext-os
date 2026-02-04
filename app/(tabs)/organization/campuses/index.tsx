/**
 * Campuses Screen
 * Church campuses list for Church mode.
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
import { CAMPUSES, formatServiceTime } from '@/data/mock-church';
import type { Campus } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface CampusCardProps {
  campus: Campus;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function CampusCard({ campus, colors, accentColor, onPress }: CampusCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.campusCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.campusBadge, { backgroundColor: accentColor }]}>
        <ThemedText style={styles.campusBadgeText}>{campus.shortName}</ThemedText>
      </View>
      <View style={styles.campusContent}>
        <ThemedText style={styles.campusName}>{campus.name}</ThemedText>
        <View style={styles.campusLocationRow}>
          <IconSymbol name="building.2" size={14} color={colors.textSecondary} />
          <ThemedText style={[styles.campusLocation, { color: colors.textSecondary }]}>
            {campus.location}
          </ThemedText>
        </View>
        {campus.address && (
          <ThemedText style={[styles.campusAddress, { color: colors.textTertiary }]}>
            {campus.address}
          </ThemedText>
        )}
        {campus.description && (
          <ThemedText style={[styles.campusDesc, { color: colors.textSecondary }]}>
            {campus.description}
          </ThemedText>
        )}
        <View style={styles.servicesSection}>
          <ThemedText style={[styles.servicesLabel, { color: colors.textTertiary }]}>
            Service Times
          </ThemedText>
          {campus.serviceTimes.map((service, index) => (
            <View key={index} style={styles.serviceRow}>
              <IconSymbol name="calendar" size={14} color={accentColor} />
              <ThemedText style={styles.serviceText}>
                {service.service} - {formatServiceTime(service)}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CampusesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.church;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleCampusPress = (campusId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/campuses/${campusId}`);
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
            Our Campuses
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {CAMPUSES.length} locations serving our community
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {CAMPUSES.map((campus) => (
          <CampusCard
            key={campus.id}
            campus={campus}
            colors={colors}
            accentColor={modeColors.primary}
            onPress={() => handleCampusPress(campus.id)}
          />
        ))}
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
    gap: Spacing.md,
  },

  // Campus Card
  campusCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
  },
  campusBadge: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  campusBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  campusContent: {
    flex: 1,
  },
  campusName: {
    fontSize: 18,
    fontWeight: '600',
  },
  campusLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  campusLocation: {
    fontSize: 14,
  },
  campusAddress: {
    fontSize: 13,
    marginTop: 2,
  },
  campusDesc: {
    fontSize: 13,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
  servicesSection: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  servicesLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  serviceText: {
    fontSize: 13,
  },
});
