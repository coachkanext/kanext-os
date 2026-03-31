/**
 * EntityScopeBar — Reusable entity scope bar shown at the top of all Business pages.
 * Displays the active entity pill (name + type badge + status dot), search icon, and switch icon.
 * Tapping the pill or switch icon triggers the onSwitch callback for entity switching.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

interface EntityScopeBarProps {
  entityId: string;
  entityName: string;
  entityType: string;
  status: string;
  onSwitch?: () => void;
  colors: typeof Colors.light;
}

// =============================================================================
// STATUS COLOR MAPPING
// =============================================================================

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'green':
    case 'healthy':
    case 'operational':
      return '#5A8A6E';
    case 'warning':
    case 'yellow':
    case 'at_risk':
    case 'review':
      return '#B8943E';
    case 'critical':
    case 'red':
    case 'blocked':
    case 'inactive':
      return '#B85C5C';
    default:
      return '#5A8A6E';
  }
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EntityScopeBar({
  entityId: _entityId,
  entityName,
  entityType,
  status,
  onSwitch,
  colors,
}: EntityScopeBarProps) {
  const statusColor = getStatusColor(status);

  return (
    <View style={[s.container, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
      {/* Entity pill — tappable */}
      <Pressable
        style={({ pressed }) => [s.entityPill, { opacity: pressed ? 0.7 : 1 }]}
        onPress={onSwitch}
      >
        {/* Status dot */}
        <View style={[s.statusDot, { backgroundColor: statusColor }]} />

        {/* Entity name */}
        <ThemedText style={[s.entityName, { color: colors.text }]} numberOfLines={1}>
          {entityName}
        </ThemedText>

        {/* Type badge */}
        <View style={[s.typeBadge, { backgroundColor: colors.border }]}>
          <ThemedText style={[s.typeBadgeText, { color: colors.textSecondary }]}>
            {entityType.toUpperCase()}
          </ThemedText>
        </View>
      </Pressable>

      {/* Right-side icons */}
      <View style={s.iconRow}>
        {/* Search icon */}
        <Pressable
          style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.6 : 1 }]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textSecondary} />
        </Pressable>

        {/* Switch icon */}
        <Pressable
          style={({ pressed }) => [s.iconButton, { opacity: pressed ? 0.6 : 1 }]}
          onPress={onSwitch}
        >
          <IconSymbol name="arrow.left.arrow.right" size={16} color={colors.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  entityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    marginRight: Spacing.sm,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  entityName: {
    fontSize: 14,
    fontWeight: '600',
    flexShrink: 1,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
