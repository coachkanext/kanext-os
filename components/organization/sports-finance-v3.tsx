/**
 * Sports Finance V3 — A2 (Assistant Coach) Constraint Surface
 * 6 blocks: Header, Budget Summary (restricted), Scholarships, NIL Budget,
 *           Operating Budgets (RBAC-gated), Quick Links
 *
 * Finance = Budgets + Constraints (read-only summary)
 * Ledger  = Transactions + Audit (separate tab)
 *
 * RBAC: A2/R4 — no transaction detail, no contracts, no booster data.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// MOCK DATA
// =============================================================================

const SEASON = '2025–26';

/** Scholarship allocation summary (visible to R4) */
const SCHOLARSHIP_DATA = {
  equivalencies: 13,
  used: 12,
  remaining: 1,
  playersOnAid: 12,
};

/** NIL pool summary (visible to R4) */
const NIL_DATA = {
  poolTotal: 45000,
  allocated: 32500,
  remaining: 12500,
  topAllocations: [
    { name: 'Marcus Johnson', amount: 8500 },
    { name: 'Andre Mitchell Jr.', amount: 7000 },
    { name: 'DeShawn Carter', amount: 6500 },
    { name: 'Jamal Williams', amount: 5500 },
    { name: 'Tyler Brooks', amount: 5000 },
  ],
};

/** Operating budget totals (RBAC-gated, shown if permitted) */
const OPERATING_DATA = {
  travel: 48000,
  gearEquipment: 22000,
  staffOps: 35000,
};

/**
 * R4 permission flags.
 * In production these come from RBAC context. For now, A2 defaults:
 * - Budget detail: restricted (cannot see total program budget)
 * - Operating budgets: visible (totals only)
 */
const R4_PERMISSIONS = {
  canSeeBudgetDetail: false,
  canSeeOperatingBudgets: true,
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function fmt(amount: number): string {
  if (amount >= 1000) return '$' + (amount / 1000).toFixed(amount % 1000 === 0 ? 0 : 1) + 'K';
  return '$' + amount.toLocaleString('en-US');
}

function fmtFull(amount: number): string {
  return '$' + amount.toLocaleString('en-US');
}

function SectionHeader({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children, style }: { colors: typeof Colors.light; children: React.ReactNode; style?: object }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

function ProgressBar({ value, max, color, colors }: { value: number; max: number; color: string; colors: typeof Colors.light }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <View style={[s.progressTrack, { backgroundColor: colors.border }]}>
      <View style={[s.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// BLOCK 0 — HEADER
// =============================================================================

function HeaderBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <View style={s.headerBlock}>
      <ThemedText style={[s.headerTitle, { color: colors.text }]}>Finance</ThemedText>
      <View style={[s.seasonChip, { backgroundColor: accentColor + '20' }]}>
        <ThemedText style={[s.seasonChipText, { color: accentColor }]}>{SEASON}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — BUDGET SUMMARY (RBAC-gated)
// =============================================================================

function BudgetSummaryBlock({ colors }: { colors: typeof Colors.light }) {
  if (R4_PERMISSIONS.canSeeBudgetDetail) {
    // A3/A4+ view — not shown for A2
    return null;
  }

  return (
    <>
      <SectionHeader label="PROGRAM BUDGET" colors={colors} />
      <Card colors={colors}>
        <View style={s.restrictedRow}>
          <IconSymbol name="lock.fill" size={16} color={colors.textTertiary} />
          <ThemedText style={[s.restrictedText, { color: colors.textSecondary }]}>
            Program budget details restricted.
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 2 — SCHOLARSHIPS
// =============================================================================

function ScholarshipsBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const d = SCHOLARSHIP_DATA;
  const pct = d.used / d.equivalencies;
  const barColor = pct >= 0.9 ? '#F59E0B' : '#22C55E';

  return (
    <>
      <SectionHeader label="SCHOLARSHIPS" colors={colors} />
      <Card colors={colors}>
        {/* Summary row */}
        <View style={s.metricRow}>
          <View style={s.metricItem}>
            <ThemedText style={[s.metricValue, { color: accentColor }]}>{d.equivalencies}</ThemedText>
            <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Equivalencies</ThemedText>
          </View>
          <View style={s.metricItem}>
            <ThemedText style={[s.metricValue, { color: colors.text }]}>{d.used}</ThemedText>
            <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Used</ThemedText>
          </View>
          <View style={s.metricItem}>
            <ThemedText style={[s.metricValue, { color: d.remaining > 0 ? '#22C55E' : '#EF4444' }]}>{d.remaining}</ThemedText>
            <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Remaining</ThemedText>
          </View>
        </View>

        <ProgressBar value={d.used} max={d.equivalencies} color={barColor} colors={colors} />

        {/* Players on aid */}
        <View style={[s.aidRow, { borderTopColor: colors.border }]}>
          <IconSymbol name="person.2.fill" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.aidText, { color: colors.textSecondary }]}>
            {d.playersOnAid} players on athletic aid
          </ThemedText>
        </View>

        {/* Helper note */}
        <ThemedText style={[s.helperText, { color: colors.textTertiary }]}>
          Aid details per player shown in Roster (read-only).
        </ThemedText>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 3 — NIL BUDGET
// =============================================================================

function NILBudgetBlock({ colors, accentColor, onOpenSheet }: { colors: typeof Colors.light; accentColor: string; onOpenSheet: () => void }) {
  const d = NIL_DATA;
  const allocatedPct = d.allocated / d.poolTotal;
  const barColor = allocatedPct >= 0.85 ? '#F59E0B' : accentColor;

  return (
    <>
      <SectionHeader label="NIL BUDGET" colors={colors} />
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onOpenSheet();
        }}
        style={({ pressed }) => pressed && { opacity: 0.7 }}
      >
        <Card colors={colors}>
          <View style={s.metricRow}>
            <View style={s.metricItem}>
              <ThemedText style={[s.metricValue, { color: accentColor }]}>{fmt(d.poolTotal)}</ThemedText>
              <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Pool Total</ThemedText>
            </View>
            <View style={s.metricItem}>
              <ThemedText style={[s.metricValue, { color: colors.text }]}>{fmt(d.allocated)}</ThemedText>
              <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Allocated</ThemedText>
            </View>
            <View style={s.metricItem}>
              <ThemedText style={[s.metricValue, { color: d.remaining > 5000 ? '#22C55E' : '#F59E0B' }]}>{fmt(d.remaining)}</ThemedText>
              <ThemedText style={[s.metricLabel, { color: colors.textSecondary }]}>Remaining</ThemedText>
            </View>
          </View>
          <ProgressBar value={d.allocated} max={d.poolTotal} color={barColor} colors={colors} />

          <View style={[s.tapHintRow, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.tapHintText, { color: colors.textSecondary }]}>View NIL Summary</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </View>
        </Card>
      </Pressable>
    </>
  );
}

// =============================================================================
// NIL SUMMARY SHEET (v1 Minimal)
// =============================================================================

function NILSummarySheet({ visible, onClose, colors, accentColor }: { visible: boolean; onClose: () => void; colors: typeof Colors.light; accentColor: string }) {
  const d = NIL_DATA;

  return (
    <BottomSheet visible={visible} onClose={onClose} title="NIL Summary" useModal>
      <BottomSheetScrollView contentContainerStyle={s.sheetScroll}>
        {/* Pool overview */}
        <View style={s.sheetMetrics}>
          <View style={s.sheetMetricItem}>
            <ThemedText style={[s.sheetMetricValue, { color: accentColor }]}>{fmtFull(d.poolTotal)}</ThemedText>
            <ThemedText style={[s.sheetMetricLabel, { color: colors.textSecondary }]}>Total NIL Pool</ThemedText>
          </View>
          <View style={s.sheetMetricItem}>
            <ThemedText style={[s.sheetMetricValue, { color: colors.text }]}>{fmtFull(d.allocated)}</ThemedText>
            <ThemedText style={[s.sheetMetricLabel, { color: colors.textSecondary }]}>Allocated Total</ThemedText>
          </View>
          <View style={s.sheetMetricItem}>
            <ThemedText style={[s.sheetMetricValue, { color: d.remaining > 5000 ? '#22C55E' : '#F59E0B' }]}>{fmtFull(d.remaining)}</ThemedText>
            <ThemedText style={[s.sheetMetricLabel, { color: colors.textSecondary }]}>Remaining Available</ThemedText>
          </View>
        </View>

        <ProgressBar value={d.allocated} max={d.poolTotal} color={accentColor} colors={colors} />

        {/* Top allocations */}
        <ThemedText style={[s.sheetSectionHeader, { color: colors.textSecondary }]}>
          TOP ALLOCATIONS
        </ThemedText>
        {d.topAllocations.map((alloc, idx) => (
          <View
            key={alloc.name}
            style={[
              s.allocRow,
              idx < d.topAllocations.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.allocRank, { color: colors.textTertiary }]}>{idx + 1}</ThemedText>
            <ThemedText style={[s.allocName, { color: colors.text }]}>{alloc.name}</ThemedText>
            <ThemedText style={[s.allocAmount, { color: accentColor }]}>{fmtFull(alloc.amount)}</ThemedText>
          </View>
        ))}

        {/* Bottom note */}
        <View style={[s.sheetNote, { borderTopColor: colors.border }]}>
          <IconSymbol name="info.circle.fill" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.sheetNoteText, { color: colors.textTertiary }]}>
            Detailed NIL transactions available in Ledger (restricted).
          </ThemedText>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

// =============================================================================
// BLOCK 4 — OPERATING BUDGETS (RBAC-gated)
// =============================================================================

function OperatingBudgetsBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  if (!R4_PERMISSIONS.canSeeOperatingBudgets) return null;

  const items = [
    { label: 'Travel', amount: OPERATING_DATA.travel, icon: 'airplane' },
    { label: 'Gear / Equipment', amount: OPERATING_DATA.gearEquipment, icon: 'tshirt.fill' },
    { label: 'Staff / Ops', amount: OPERATING_DATA.staffOps, icon: 'person.3.fill' },
  ];

  return (
    <>
      <SectionHeader label="OPERATING BUDGETS" colors={colors} />
      <View style={s.opsGrid}>
        {items.map((item) => (
          <View key={item.label} style={[s.opsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IconSymbol name={item.icon as any} size={20} color={accentColor} />
            <ThemedText style={[s.opsAmount, { color: colors.text }]}>{fmt(item.amount)}</ThemedText>
            <ThemedText style={[s.opsLabel, { color: colors.textSecondary }]}>{item.label}</ThemedText>
          </View>
        ))}
      </View>
      <ThemedText style={[s.opsTotalsOnly, { color: colors.textTertiary }]}>
        Totals only. Breakdown available at higher authority level.
      </ThemedText>
    </>
  );
}

// =============================================================================
// BLOCK 5 — QUICK LINKS
// =============================================================================

function QuickLinksBlock({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const links = [
    { label: 'Open Ledger', icon: 'doc.text', description: 'Transaction & audit trail' },
    { label: 'Open Compliance', icon: 'shield.checkmark.fill', description: 'Compliance records' },
  ];

  return (
    <>
      <SectionHeader label="QUICK LINKS" colors={colors} />
      {links.map((link) => (
        <Pressable
          key={link.label}
          style={({ pressed }) => [s.linkCard, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name={link.icon as any} size={18} color={accentColor} />
          <View style={s.linkInfo}>
            <ThemedText style={[s.linkLabel, { color: colors.text }]}>{link.label}</ThemedText>
            <ThemedText style={[s.linkDescription, { color: colors.textSecondary }]}>{link.description}</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </Pressable>
      ))}
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsFinance({ colors, accentColor, role }: Props) {
  const [nilSheetVisible, setNilSheetVisible] = useState(false);

  const openNilSheet = useCallback(() => setNilSheetVisible(true), []);
  const closeNilSheet = useCallback(() => setNilSheetVisible(false), []);

  return (
    <>
      <ScrollView
        style={s.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <HeaderBlock colors={colors} accentColor={accentColor} />
        <BudgetSummaryBlock colors={colors} />
        <ScholarshipsBlock colors={colors} accentColor={accentColor} />
        <NILBudgetBlock colors={colors} accentColor={accentColor} onOpenSheet={openNilSheet} />
        <OperatingBudgetsBlock colors={colors} accentColor={accentColor} />
        <QuickLinksBlock colors={colors} accentColor={accentColor} />
      </ScrollView>

      <NILSummarySheet
        visible={nilSheetVisible}
        onClose={closeNilSheet}
        colors={colors}
        accentColor={accentColor}
      />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  // ── Section Header ──
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginTop: 20,
    textTransform: 'uppercase',
  },

  // ── Card ──
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 12,
  },

  // ── Header ──
  headerBlock: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  seasonChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  seasonChipText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Restricted ──
  restrictedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 4,
  },
  restrictedText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // ── Progress Bar ──
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },

  // ── Metric Row ──
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
  },

  // ── Scholarships ──
  aidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  aidText: {
    fontSize: 12,
    fontWeight: '500',
  },
  helperText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 8,
  },

  // ── NIL tap hint ──
  tapHintRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tapHintText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // ── Operating Budgets ──
  opsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  opsCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    alignItems: 'center',
    gap: 6,
  },
  opsAmount: {
    fontSize: 16,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  opsLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  opsTotalsOnly: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 12,
  },

  // ── Quick Links ──
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 10,
  },
  linkInfo: {
    flex: 1,
  },
  linkLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  linkDescription: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── NIL Summary Sheet ──
  sheetScroll: {
    padding: Spacing.md,
    paddingBottom: 40,
  },
  sheetMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sheetMetricItem: {
    alignItems: 'center',
    flex: 1,
  },
  sheetMetricValue: {
    fontSize: 18,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  sheetMetricLabel: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sheetSectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  allocRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  allocRank: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    width: 18,
  },
  allocName: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  allocAmount: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sheetNoteText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
});
