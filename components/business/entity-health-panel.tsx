/**
 * EntityHealthPanel — Compact entity health mini-panel with 5 status chips.
 * Shows Governance, Compliance, Rails, Docs, and Next Action at a glance.
 * Color-coded dots (green/yellow/red) for rapid visual triage.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

export interface BusinessEntity {
  id: string;
  name: string;
  type: string;
  status: string;
  governance: 'green' | 'yellow' | 'red';
  compliance: 'green' | 'yellow' | 'red';
  rails: {
    status: 'connected' | 'limited' | 'offline';
    exceptions: number;
  };
  docs: {
    complete: number;
    missing: number;
  };
  nextAction: string;
}

interface EntityHealthPanelProps {
  entity: BusinessEntity;
  colors: typeof Colors.light;
}

// =============================================================================
// STATUS HELPERS
// =============================================================================

const TRAFFIC_LIGHT: Record<string, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

const RAILS_STATUS_COLOR: Record<string, string> = {
  connected: '#22C55E',
  limited: '#F59E0B',
  offline: '#EF4444',
};

const RAILS_LABEL: Record<string, string> = {
  connected: 'Connected',
  limited: 'Limited',
  offline: 'Offline',
};

function trafficLabel(value: 'green' | 'yellow' | 'red'): string {
  switch (value) {
    case 'green': return 'Green';
    case 'yellow': return 'Yellow';
    case 'red': return 'Red';
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatusChip({
  label,
  dotColor,
  detail,
  colors,
}: {
  label: string;
  dotColor: string;
  detail: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[s.chip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
      <View style={s.chipHeader}>
        <View style={[s.chipDot, { backgroundColor: dotColor }]} />
        <ThemedText style={[s.chipLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      </View>
      <ThemedText style={[s.chipDetail, { color: colors.text }]} numberOfLines={1}>
        {detail}
      </ThemedText>
    </View>
  );
}

function NextActionChip({
  text,
  colors,
}: {
  text: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[s.nextActionChip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
      <View style={s.chipHeader}>
        <IconSymbol name="arrow.right.circle.fill" size={12} color={colors.textSecondary} />
        <ThemedText style={[s.chipLabel, { color: colors.textSecondary }]}>Next</ThemedText>
      </View>
      <ThemedText style={[s.chipDetail, { color: colors.text }]} numberOfLines={2}>
        {text}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function EntityHealthPanel({ entity, colors }: EntityHealthPanelProps) {
  const railsDetail =
    RAILS_LABEL[entity.rails.status] +
    (entity.rails.exceptions > 0 ? ` \u00B7 ${entity.rails.exceptions} exc` : '');

  const docsDetail = `${entity.docs.complete} done / ${entity.docs.missing} missing`;

  return (
    <View style={s.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
      >
        {/* Governance */}
        <StatusChip
          label="Governance"
          dotColor={TRAFFIC_LIGHT[entity.governance]}
          detail={trafficLabel(entity.governance)}
          colors={colors}
        />

        {/* Compliance */}
        <StatusChip
          label="Compliance"
          dotColor={TRAFFIC_LIGHT[entity.compliance]}
          detail={trafficLabel(entity.compliance)}
          colors={colors}
        />

        {/* Rails */}
        <StatusChip
          label="Rails"
          dotColor={RAILS_STATUS_COLOR[entity.rails.status]}
          detail={railsDetail}
          colors={colors}
        />

        {/* Docs */}
        <StatusChip
          label="Docs"
          dotColor={entity.docs.missing > 0 ? '#F59E0B' : '#22C55E'}
          detail={docsDetail}
          colors={colors}
        />

        {/* Next action */}
        <NextActionChip text={entity.nextAction} colors={colors} />
      </ScrollView>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    marginBottom: Spacing.sm,
  },
  scrollContent: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  chip: {
    minWidth: 100,
    paddingHorizontal: 10,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  chipDetail: {
    fontSize: 12,
    fontWeight: '500',
  },
  nextActionChip: {
    minWidth: 140,
    maxWidth: 200,
    paddingHorizontal: 10,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
