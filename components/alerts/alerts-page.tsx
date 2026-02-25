/**
 * Alerts Page — Program-level alerts & decisions (Blocks 0–3 + Detail)
 *
 * Route: SportsHomeDashboard → AlertsPage
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Can: View all alerts, tap into detail, navigate to linked objects,
 *      open in Nexus for resolution.
 * Cannot: Inline-edit alert status, modify constraints, override
 *         compliance flags. Resolution happens via Nexus Propose→Confirm→Commit
 *         or by authorized users.
 *
 * Alert data is read-only here. No inline edits.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  ALERTS,
  type Alert,
  type AlertSeverity,
  type AlertCategory,
} from '@/data/mock-alerts-v2';

// =============================================================================
// HELPERS
// =============================================================================

function getSeverityColor(severity: AlertSeverity): string {
  switch (severity) {
    case 'High': return Brand.error;
    case 'Medium': return Brand.warning;
    case 'Low': return '#A1A1AA';
  }
}

function getCategoryIcon(category: AlertCategory): string {
  switch (category) {
    case 'Roster': return 'person.2.fill';
    case 'Recruiting': return 'magnifyingglass';
    case 'Game Prep': return 'sportscourt.fill';
    case 'Ops': return 'dollarsign.circle.fill';
  }
}

// =============================================================================
// CONSTANTS
// =============================================================================

type CategoryFilter = 'All' | AlertCategory;
const CATEGORY_FILTERS: CategoryFilter[] = ['All', 'Roster', 'Recruiting', 'Game Prep', 'Ops'];

// =============================================================================
// PROPS
// =============================================================================

interface AlertsPageProps {
  onBack: () => void;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function AlertsPage({ onBack }: AlertsPageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();

  // ── State ──
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('All');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // ── Derived ──
  const openAlerts = useMemo(() => ALERTS.filter(a => a.status === 'Open'), []);

  const counts = useMemo(() => ({
    High: openAlerts.filter(a => a.severity === 'High').length,
    Medium: openAlerts.filter(a => a.severity === 'Medium').length,
    Low: openAlerts.filter(a => a.severity === 'Low').length,
  }), [openAlerts]);

  const filteredAlerts = useMemo(() => {
    let list = openAlerts;
    if (severityFilter) list = list.filter(a => a.severity === severityFilter);
    if (categoryFilter !== 'All') list = list.filter(a => a.category === categoryFilter);
    // Sort: High first, then due date soonest
    const severityOrder: Record<AlertSeverity, number> = { High: 0, Medium: 1, Low: 2 };
    return [...list].sort((a, b) => {
      const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (sevDiff !== 0) return sevDiff;
      if (a.dueAt && b.dueAt) return a.dueAt.localeCompare(b.dueAt);
      if (a.dueAt) return -1;
      if (b.dueAt) return 1;
      return 0;
    });
  }, [openAlerts, severityFilter, categoryFilter]);

  const toggleSeverity = useCallback((sev: AlertSeverity) => {
    setSeverityFilter(prev => prev === sev ? null : sev);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // ══════════════════════════════════════════════════════════════════════════════
  // ALERT DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════════

  if (selectedAlert) {
    const alert = selectedAlert;
    const sevColor = getSeverityColor(alert.severity);

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Block 0 — Header */}
        <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => setSelectedAlert(null)}
            hitSlop={12}
            style={styles.backBtn}
          >
            <IconSymbol name="chevron.left" size={20} color={accent} />
          </Pressable>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {alert.title}
            </Text>
          </View>
          <View style={[styles.severityChip, { backgroundColor: sevColor + '20' }]}>
            <Text style={[styles.severityChipText, { color: sevColor }]}>{alert.severity}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Block 1 — Context (linked object) */}
          <BlockHeader title="Linked Object" colors={colors} />
          <Pressable
            style={[styles.contextCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={getCategoryIcon(alert.category) as any} size={16} color={accent} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.contextType, { color: colors.textTertiary }]}>{alert.linkedType}</Text>
              <Text style={[styles.contextLabel, { color: colors.text }]}>{alert.linkedLabel}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </Pressable>

          {/* Block 2 — Why this alert exists */}
          <BlockHeader title="Why This Alert Exists" colors={colors} />
          <View style={[styles.reasonsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {alert.reasons.map((reason, i) => (
              <View key={i} style={styles.reasonRow}>
                <View style={[styles.reasonDot, { backgroundColor: sevColor }]} />
                <Text style={[styles.reasonText, { color: colors.textSecondary }]}>{reason}</Text>
              </View>
            ))}
          </View>

          {/* Next Action */}
          {alert.nextAction && (
            <>
              <BlockHeader title="Next Action" colors={colors} />
              <View style={[styles.nextActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <IconSymbol name="arrow.right.circle.fill" size={16} color={accent} />
                <Text style={[styles.nextActionText, { color: colors.text }]}>{alert.nextAction}</Text>
              </View>
            </>
          )}

          {/* Due date */}
          {alert.dueAt && (
            <View style={[styles.dueRow, { marginTop: Spacing.sm }]}>
              <IconSymbol name="clock.fill" size={12} color={Brand.warning} />
              <Text style={[styles.dueText, { color: Brand.warning }]}>Due: {alert.dueAt}</Text>
            </View>
          )}

          {/* Block 3 — Actions */}
          <BlockHeader title="Actions" colors={colors} />
          <View style={styles.actionsContainer}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="arrow.up.forward.square" size={16} color={accent} />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>Open Linked Object</Text>
            </Pressable>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: accent, borderColor: accent }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="brain" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Open in Nexus</Text>
            </Pressable>
            {alert.dueAt && (
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="calendar" size={16} color={accent} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Go to Schedule</Text>
              </Pressable>
            )}
          </View>

          {/* Meta */}
          <View style={[styles.metaRow, { marginTop: Spacing.lg }]}>
            <Text style={[styles.metaText, { color: colors.textTertiary }]}>
              Created {alert.createdAt} · {alert.category} · {alert.status}
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN LIST VIEW
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ═══════ BLOCK 0 — HEADER (sticky) ═══════ */}
      <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
          <IconSymbol name="chevron.left" size={20} color={accent} />
        </Pressable>
        <Text style={[styles.headerTitleCenter, { color: colors.text }]}>Alerts</Text>
        <View style={[styles.chip, { backgroundColor: colors.card }]}>
          <Text style={[styles.chipText, { color: colors.textSecondary }]}>2025–26</Text>
        </View>
      </View>

      {/* ═══════ BLOCK 1 — SUMMARY STRIP (sticky under header) ═══════ */}
      <View style={[styles.summaryStrip, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        {(['High', 'Medium', 'Low'] as AlertSeverity[]).map(sev => {
          const isActive = severityFilter === sev;
          const count = counts[sev];
          const sevColor = getSeverityColor(sev);
          return (
            <Pressable
              key={sev}
              style={[
                styles.summaryChip,
                {
                  backgroundColor: isActive ? sevColor + '20' : colors.card,
                  borderColor: isActive ? sevColor : colors.border,
                },
              ]}
              onPress={() => toggleSeverity(sev)}
            >
              <View style={[styles.summaryDot, { backgroundColor: sevColor }]} />
              <Text style={[styles.summaryLabel, { color: isActive ? sevColor : colors.textSecondary }]}>
                {sev}
              </Text>
              <Text style={[styles.summaryCount, { color: isActive ? sevColor : colors.textTertiary }]}>
                {count}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ═══════ BLOCK 2 — CATEGORY TABS ═══════ */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.categoryBar, { borderBottomColor: colors.border }]}
        contentContainerStyle={styles.categoryBarContent}
      >
        {CATEGORY_FILTERS.map(cat => {
          const isActive = categoryFilter === cat;
          return (
            <Pressable
              key={cat}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isActive ? accent + '20' : 'transparent',
                  borderColor: isActive ? accent : colors.border,
                },
              ]}
              onPress={() => {
                setCategoryFilter(cat);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.categoryPillText, { color: isActive ? accent : colors.textSecondary }]}>
                {cat === 'Ops' ? 'Ops / Money' : cat}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ═══════ BLOCK 3 — ALERTS LIST ═══════ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="checkmark.circle.fill" size={40} color={Brand.success} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>All clear</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              No {severityFilter ? severityFilter.toLowerCase() + ' ' : ''}{categoryFilter !== 'All' ? categoryFilter.toLowerCase() + ' ' : ''}alerts right now.
            </Text>
          </View>
        ) : (
          filteredAlerts.map(alert => {
            const sevColor = getSeverityColor(alert.severity);
            return (
              <Pressable
                key={alert.alertId}
                style={[styles.alertRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  setSelectedAlert(alert);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                {/* Severity accent bar */}
                <View style={[styles.alertAccent, { backgroundColor: sevColor }]} />

                <View style={styles.alertContent}>
                  {/* Title + chips */}
                  <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={1}>
                    {alert.title}
                  </Text>
                  <View style={styles.alertChips}>
                    <View style={[styles.severityChip, { backgroundColor: sevColor + '20' }]}>
                      <Text style={[styles.severityChipText, { color: sevColor }]}>{alert.severity}</Text>
                    </View>
                    <View style={[styles.categoryChip, { backgroundColor: colors.background }]}>
                      <Text style={[styles.categoryChipText, { color: colors.textSecondary }]}>
                        {alert.category === 'Ops' ? 'Ops / Money' : alert.category}
                      </Text>
                    </View>
                    {alert.dueAt && (
                      <Text style={[styles.alertDue, { color: Brand.warning }]}>Due {alert.dueAt}</Text>
                    )}
                  </View>
                  {/* Next action */}
                  <Text style={[styles.alertAction, { color: colors.textTertiary }]} numberOfLines={1}>
                    {alert.nextAction}
                  </Text>
                </View>

                <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function BlockHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <View style={styles.blockHeader}>
      <Text style={[styles.blockTitle, { color: colors.text }]}>{title}</Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Header ──
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitleCenter: { fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },
  headerCenter: { flex: 1, marginHorizontal: 8 },
  headerTitle: { fontSize: 15, fontWeight: '700' },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  chipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // ── Summary Strip ──
  summaryStrip: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  summaryDot: { width: 8, height: 8, borderRadius: 4 },
  summaryLabel: { fontSize: 12, fontWeight: '600' },
  summaryCount: { fontSize: 13, fontWeight: '800' },

  // ── Category Bar ──
  categoryBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexGrow: 0,
  },
  categoryBarContent: {
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  categoryPillText: { fontSize: 12, fontWeight: '600' },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // ── Block Header ──
  blockHeader: { marginTop: Spacing.lg, marginBottom: Spacing.sm },
  blockTitle: { fontSize: 16, fontWeight: '700' },

  // ── Alert Row ──
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    overflow: 'hidden',
  },
  alertAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  alertContent: {
    flex: 1,
    padding: 14,
  },
  alertTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  alertChips: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  severityChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  severityChipText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  categoryChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryChipText: { fontSize: 10, fontWeight: '600' },
  alertDue: { fontSize: 10, fontWeight: '600' },
  alertAction: { fontSize: 12 },

  // ── Empty State ──
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },

  // ── Detail — Context Card ──
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  contextType: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  contextLabel: { fontSize: 14, fontWeight: '600' },

  // ── Detail — Reasons ──
  reasonsCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  reasonDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  reasonText: { fontSize: 13, lineHeight: 20, flex: 1 },

  // ── Detail — Next Action ──
  nextActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  nextActionText: { fontSize: 13, fontWeight: '600', flex: 1 },

  // ── Detail — Due ──
  dueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dueText: { fontSize: 12, fontWeight: '600' },

  // ── Detail — Actions ──
  actionsContainer: { gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },

  // ── Meta ──
  metaRow: { alignItems: 'center' },
  metaText: { fontSize: 11 },
});
