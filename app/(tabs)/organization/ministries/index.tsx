/**
 * Ministries Screen
 * Church ministries list for Church mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MINISTRIES, getMinistryTypeLabel } from '@/data/mock-church';
import type { Ministry } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface MinistryCardProps {
  ministry: Ministry;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function MinistryCard({ ministry, colors, accentColor, onPress }: MinistryCardProps) {
  const iconName = (ministry.icon || 'person.3.fill') as IconSymbolName;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.ministryCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.ministryIcon, { backgroundColor: accentColor + '15' }]}>
        <IconSymbol name={iconName} size={24} color={accentColor} />
      </View>
      <View style={styles.ministryContent}>
        <ThemedText style={styles.ministryName}>{ministry.name}</ThemedText>
        <ThemedText style={[styles.ministryType, { color: colors.textTertiary }]}>
          {getMinistryTypeLabel(ministry.type)}
        </ThemedText>
        {ministry.description && (
          <ThemedText
            style={[styles.ministryDesc, { color: colors.textSecondary }]}
            numberOfLines={2}
          >
            {ministry.description}
          </ThemedText>
        )}
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function MinistriesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.church;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleMinistryPress = (ministryId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/organization/ministries/${ministryId}`);
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
            Ministries
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            {MINISTRIES.length} ministries to get involved
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {MINISTRIES.map((ministry) => (
          <MinistryCard
            key={ministry.id}
            ministry={ministry}
            colors={colors}
            accentColor={modeColors.primary}
            onPress={() => handleMinistryPress(ministry.id)}
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
    gap: Spacing.sm,
  },

  // Ministry Card
  ministryCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  ministryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  ministryContent: {
    flex: 1,
  },
  ministryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  ministryType: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  ministryDesc: {
    fontSize: 13,
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});
