/**
 * Business Shared — Reusable primitives for all Business Mode tabs.
 * BizCard | BizCardTitle | BizSubTabBar | BizStatusChip | BizAlertCard | BizEmptyLock
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';

const BP = BusinessPalette;

// =============================================================================
// BIZ CARD
// =============================================================================

interface BizCardProps {
  children: React.ReactNode;
  style?: any;
}

export function BizCard({ children, style }: BizCardProps) {
  return <View style={[s.card, style]}>{children}</View>;
}

// =============================================================================
// BIZ CARD TITLE
// =============================================================================

export function BizCardTitle({ text }: { text: string }) {
  return <ThemedText style={s.cardTitle}>{text}</ThemedText>;
}

// =============================================================================
// BIZ SUB-TAB BAR (horizontal scrollable pills)
// =============================================================================

interface SubTab {
  id: string;
  label: string;
}

interface BizSubTabBarProps {
  tabs: SubTab[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function BizSubTabBar({ tabs, activeId, onSelect }: BizSubTabBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
    >
      {tabs.map((t) => {
        const isActive = t.id === activeId;
        return (
          <Pressable
            key={t.id}
            style={[
              s.subTabPill,
              {
                backgroundColor: isActive ? BP.champagneGold + '20' : BP.glass,
                borderColor: isActive ? BP.champagneGold + '40' : BP.graphite,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(t.id);
            }}
          >
            <ThemedText
              style={[s.subTabText, { color: isActive ? BP.champagneGold : BP.ash }]}
            >
              {t.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// BIZ STATUS CHIP
// =============================================================================

type ChipVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

const CHIP_COLORS: Record<ChipVariant, string> = {
  success: BP.emerald,
  warning: BP.amber,
  error: BP.red,
  info: BP.champagneGold,
  neutral: BP.ash,
};

interface BizStatusChipProps {
  label: string;
  variant: ChipVariant;
}

export function BizStatusChip({ label, variant }: BizStatusChipProps) {
  const color = CHIP_COLORS[variant];
  return (
    <View style={[s.statusChip, { backgroundColor: color + '15' }]}>
      <ThemedText style={[s.statusChipText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// BIZ ALERT CARD
// =============================================================================

interface BizAlertCardProps {
  icon: string;
  title: string;
  subtitle: string;
  variant: ChipVariant;
}

export function BizAlertCard({ icon, title, subtitle, variant }: BizAlertCardProps) {
  const color = CHIP_COLORS[variant];
  return (
    <View style={[s.alertCard, { borderLeftColor: color }]}>
      <View style={[s.alertIconWrap, { backgroundColor: color + '15' }]}>
        <IconSymbol name={icon as any} size={16} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={[s.alertTitle, { color: BP.smoke }]}>{title}</ThemedText>
        <ThemedText style={[s.alertSubtitle, { color: BP.ash }]}>{subtitle}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// BIZ EMPTY LOCK (RBAC gated empty state)
// =============================================================================

interface BizEmptyLockProps {
  title: string;
  message: string;
}

export function BizEmptyLock({ title, message }: BizEmptyLockProps) {
  return (
    <BizCard>
      <View style={s.emptyLock}>
        <IconSymbol name="lock.fill" size={32} color={BP.ash} />
        <ThemedText style={[s.emptyLockTitle, { color: BP.smoke }]}>{title}</ThemedText>
        <ThemedText style={[s.emptyLockText, { color: BP.ash }]}>{message}</ThemedText>
      </View>
    </BizCard>
  );
}

// =============================================================================
// HELPER: Status color mapper
// =============================================================================

export function statusColor(status: string): string {
  switch (status) {
    case 'on_track':
    case 'active':
    case 'done':
    case 'settled':
    case 'approved':
    case 'healthy':
    case 'compliant':
      return BP.emerald;
    case 'at_risk':
    case 'warning':
    case 'pending':
    case 'in_review':
    case 'upcoming':
    case 'draft':
      return BP.amber;
    case 'behind':
    case 'blocked':
    case 'critical':
    case 'overdue':
    case 'failed':
    case 'rejected':
      return BP.red;
    default:
      return BP.ash;
  }
}

export function statusVariant(status: string): ChipVariant {
  switch (status) {
    case 'on_track':
    case 'active':
    case 'done':
    case 'settled':
    case 'approved':
    case 'healthy':
    case 'compliant':
      return 'success';
    case 'at_risk':
    case 'warning':
    case 'pending':
    case 'in_review':
    case 'upcoming':
    case 'draft':
      return 'warning';
    case 'behind':
    case 'blocked':
    case 'critical':
    case 'overdue':
    case 'failed':
    case 'rejected':
      return 'error';
    default:
      return 'neutral';
  }
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  card: {
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    color: BP.ash,
    marginBottom: Spacing.sm,
  },
  subTabRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  subTabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    borderLeftWidth: 3,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  alertIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  alertSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyLock: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyLockTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  emptyLockText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: Spacing.md,
  },
});
