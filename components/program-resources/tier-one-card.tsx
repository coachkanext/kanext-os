/**
 * TierOneCard Component
 *
 * Displays Tier 1 Program Resources (always visible on home screen):
 * - Roster Spots: current / max
 * - Scholarships: used / available
 * - NIL Pool: total / committed / remaining (derived)
 *
 * Supports inline edit mode with validation.
 */

import React from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { ExtendedProgramResources } from '@/types';

// =============================================================================
// TYPES
// =============================================================================

interface TierOneCardProps {
  isEditMode: boolean;
  resources: ExtendedProgramResources;
  onUpdate: (updates: Partial<ExtendedProgramResources>) => void;
  onMorePress: () => void;
  colors: typeof Colors.light;
}

// =============================================================================
// HELPERS
// =============================================================================

const formatCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${Math.round(value / 1000)}K`;
  }
  return `$${value}`;
};

// Clamp a value between min and max
const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// =============================================================================
// COMPONENT
// =============================================================================

export function TierOneCard({
  isEditMode,
  resources,
  onUpdate,
  onMorePress,
  colors,
}: TierOneCardProps) {
  const { rosterSpots, scholarships, nilPool } = resources;
  const nilRemaining = nilPool.total - nilPool.committed;

  // Handle roster spots update with validation
  const handleRosterSpotsChange = (field: 'current' | 'max', text: string) => {
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    const newRosterSpots = { ...rosterSpots };

    if (field === 'current') {
      // current <= max, >= 0
      newRosterSpots.current = clamp(num, 0, newRosterSpots.max);
    } else {
      // max >= current, >= 0
      newRosterSpots.max = Math.max(num, 0);
      // If current > new max, adjust current
      if (newRosterSpots.current > newRosterSpots.max) {
        newRosterSpots.current = newRosterSpots.max;
      }
    }

    onUpdate({ rosterSpots: newRosterSpots });
  };

  // Handle scholarships update with validation
  const handleScholarshipsChange = (field: 'used' | 'available', text: string) => {
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    const newScholarships = { ...scholarships };

    if (field === 'used') {
      // used <= available, >= 0
      newScholarships.used = clamp(num, 0, newScholarships.available);
    } else {
      // available >= used, >= 0
      newScholarships.available = Math.max(num, 0);
      // If used > new available, adjust used
      if (newScholarships.used > newScholarships.available) {
        newScholarships.used = newScholarships.available;
      }
    }

    onUpdate({ scholarships: newScholarships });
  };

  // Handle NIL pool update with validation
  const handleNilPoolChange = (field: 'total' | 'committed', text: string) => {
    const num = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
    const newNilPool = { ...nilPool };

    if (field === 'total') {
      // total >= committed, >= 0
      newNilPool.total = Math.max(num, 0);
      // If committed > new total, adjust committed
      if (newNilPool.committed > newNilPool.total) {
        newNilPool.committed = newNilPool.total;
      }
    } else {
      // committed <= total, >= 0
      newNilPool.committed = clamp(num, 0, newNilPool.total);
    }

    onUpdate({ nilPool: newNilPool });
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      {/* Roster Spots Row */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Roster Spots
        </Text>
        {isEditMode ? (
          <View style={styles.editInputGroup}>
            <TextInput
              style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
              value={rosterSpots.current.toString()}
              onChangeText={(text) => handleRosterSpotsChange('current', text)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.separator, { color: colors.textSecondary }]}>/</Text>
            <TextInput
              style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
              value={rosterSpots.max.toString()}
              onChangeText={(text) => handleRosterSpotsChange('max', text)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        ) : (
          <Text style={[styles.value, { color: colors.text }]}>
            {rosterSpots.current} / {rosterSpots.max}
          </Text>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* Scholarships Row */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Scholarships
        </Text>
        {isEditMode ? (
          <View style={styles.editInputGroup}>
            <TextInput
              style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
              value={scholarships.used.toString()}
              onChangeText={(text) => handleScholarshipsChange('used', text)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
            <Text style={[styles.separator, { color: colors.textSecondary }]}>/</Text>
            <TextInput
              style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
              value={scholarships.available.toString()}
              onChangeText={(text) => handleScholarshipsChange('available', text)}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        ) : (
          <Text style={[styles.value, { color: colors.text }]}>
            {scholarships.used} / {scholarships.available}
          </Text>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* NIL Pool Row */}
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          NIL Pool
        </Text>
        {isEditMode ? (
          <View style={styles.editInputGroupNil}>
            <View style={styles.nilInputWrapper}>
              <Text style={[styles.nilInputLabel, { color: colors.textTertiary }]}>Total</Text>
              <TextInput
                style={[styles.numericInputNil, { color: colors.text, borderColor: colors.border }]}
                value={nilPool.total.toString()}
                onChangeText={(text) => handleNilPoolChange('total', text)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.nilInputWrapper}>
              <Text style={[styles.nilInputLabel, { color: colors.textTertiary }]}>Committed</Text>
              <TextInput
                style={[styles.numericInputNil, { color: colors.text, borderColor: colors.border }]}
                value={nilPool.committed.toString()}
                onChangeText={(text) => handleNilPoolChange('committed', text)}
                keyboardType="number-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>
        ) : (
          <Text style={[styles.value, { color: colors.text }]}>
            {formatCurrency(nilPool.total)} / {formatCurrency(nilPool.committed)} / {formatCurrency(nilRemaining)}
          </Text>
        )}
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      {/* More Program Resources Row */}
      <Pressable
        style={({ pressed }) => [
          styles.moreRow,
          pressed && { backgroundColor: colors.backgroundTertiary },
        ]}
        onPress={onMorePress}
      >
        <View style={styles.moreContent}>
          <Text style={[styles.moreLabel, { color: colors.text }]}>
            More Program Resources
          </Text>
          <Text style={[styles.moreSummary, { color: colors.textSecondary }]}>
            Systems, Emphasis, Budgets, Staff
          </Text>
        </View>
        <IconSymbol name="chevron.right" size={14} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    minHeight: 48,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 0,
  },
  value: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
  editInputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editInputGroupNil: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  nilInputWrapper: {
    alignItems: 'center',
  },
  nilInputLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  separator: {
    fontSize: 14,
    fontWeight: '500',
  },
  numericInput: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    minWidth: 50,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  numericInputNil: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  moreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  moreContent: {
    flex: 1,
  },
  moreLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  moreSummary: {
    fontSize: 12,
    marginTop: 2,
  },
});
