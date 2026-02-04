/**
 * Campus Detail Screen
 * Individual campus information for Church mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getCampusById, formatServiceTime } from '@/data/mock-church';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CampusDetailScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { campusId } = useLocalSearchParams<{ campusId: string }>();
  const modeColors = ModeColors.church;

  const campus = getCampusById(campusId);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleGetDirections = () => {
    if (campus?.address) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const encodedAddress = encodeURIComponent(campus.address);
      Linking.openURL(`https://maps.apple.com/?q=${encodedAddress}`);
    }
  };

  if (!campus) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <ThemedText type="title">Campus Not Found</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="building.2" size={48} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            This campus could not be found.
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
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            {campus.name}
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {campus.location}
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Campus Badge */}
        <View style={[styles.campusBadge, { backgroundColor: modeColors.primary }]}>
          <ThemedText style={styles.campusBadgeText}>{campus.shortName}</ThemedText>
        </View>

        {/* Description */}
        {campus.description && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ABOUT
            </ThemedText>
            <ThemedText style={styles.description}>{campus.description}</ThemedText>
          </View>
        )}

        {/* Address & Directions */}
        {campus.address && (
          <View style={[styles.section, { borderColor: colors.border }]}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              LOCATION
            </ThemedText>
            <ThemedText style={styles.address}>{campus.address}</ThemedText>
            <Pressable
              style={[styles.directionsButton, { backgroundColor: modeColors.primary }]}
              onPress={handleGetDirections}
            >
              <IconSymbol name="map" size={16} color="#FFFFFF" />
              <ThemedText style={styles.directionsButtonText}>Get Directions</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Service Times */}
        <View style={[styles.section, { borderColor: colors.border }]}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            SERVICE TIMES
          </ThemedText>
          {campus.serviceTimes.map((service, index) => (
            <View
              key={index}
              style={[styles.serviceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.serviceIconContainer, { backgroundColor: modeColors.primary + '15' }]}>
                <IconSymbol name="calendar" size={20} color={modeColors.primary} />
              </View>
              <View style={styles.serviceInfo}>
                <ThemedText style={styles.serviceName}>{service.service}</ThemedText>
                <ThemedText style={[styles.serviceTime, { color: colors.textSecondary }]}>
                  {formatServiceTime(service)}
                </ThemedText>
              </View>
            </View>
          ))}
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
              <IconSymbol name="phone.fill" size={20} color={modeColors.primary} />
              <ThemedText style={styles.contactButtonText}>Call</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.contactButton, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <IconSymbol name="envelope.fill" size={20} color={modeColors.primary} />
              <ThemedText style={styles.contactButtonText}>Email</ThemedText>
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

  // Campus Badge
  campusBadge: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: Spacing.lg,
  },
  campusBadgeText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
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
  address: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },

  // Directions
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  directionsButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },

  // Service Times
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '600',
  },
  serviceTime: {
    fontSize: 14,
    marginTop: 2,
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
