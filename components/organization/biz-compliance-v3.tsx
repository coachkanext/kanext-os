/**
 * BizCompliance — Regulatory Status + Obligation Surface (Compliance Tab)
 * Single vertical scroll. Status + Deadline visibility only.
 * No legal case management. No document storage. No risk scoring.
 * Compliance = Status + Deadline Surface.
 */
import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
  onNavigateTab?: (tabIndex: number) => void;
}

// =============================================================================
// INLINE DATA — Status + obligations only
// =============================================================================

const FISCAL_YEARS = ['FY 2025', 'FY 2024'];

// Tab indices: 0=Program, 1=People, 2=Finance, 3=Compliance, 4=Facilities, 5=Ledger
const TAB_LEDGER = 5;

// Block 1 — Entity Registration Snapshot
const REGISTRATION = {
  jurisdictions: [
    { state: 'Delaware', status: 'Active' as const },
    { state: 'Tennessee', status: 'In Good Standing' as const },
    { state: 'Florida', status: 'Active' as const },
  ],
  registeredAgent: 'Corporation Service Company',
  nextAnnualFiling: 'Jun 1, 2025',
};

// Block 2 — Filing & Deadline Queue (soonest first)
type FilingStatus = 'Pending' | 'Submitted' | 'Accepted' | 'Overdue';
const FILINGS: {
  id: string;
  name: string;
  jurisdiction: string;
  type: string;
  status: FilingStatus;
  dueDate: string;
}[] = [
  { id: 'f1', name: 'Annual Report — Delaware', jurisdiction: 'Delaware', type: 'Annual Report', status: 'Pending', dueDate: 'Mar 1, 2025' },
  { id: 'f2', name: 'Franchise Tax — Delaware', jurisdiction: 'Delaware', type: 'Tax Filing', status: 'Pending', dueDate: 'Jun 1, 2025' },
  { id: 'f3', name: 'Annual Report — Tennessee', jurisdiction: 'Tennessee', type: 'Annual Report', status: 'Submitted', dueDate: 'May 1, 2025' },
  { id: 'f4', name: 'Business License Renewal', jurisdiction: 'Florida', type: 'License Renewal', status: 'Pending', dueDate: 'Sep 30, 2025' },
  { id: 'f5', name: 'Q4 2024 Tax Filing', jurisdiction: 'Federal', type: 'Tax Filing', status: 'Accepted', dueDate: 'Jan 15, 2025' },
];

// Block 3 — Licenses & Permits
type LicenseStatus = 'Active' | 'Expiring' | 'Expired' | 'Renewal Required';
const LICENSES: {
  id: string;
  name: string;
  issuingAuthority: string;
  status: LicenseStatus;
  expirationDate: string;
}[] = [
  { id: 'l1', name: 'Business License — Miami-Dade', issuingAuthority: 'Miami-Dade County', status: 'Active', expirationDate: 'Dec 31, 2025' },
  { id: 'l2', name: 'State Business Registration', issuingAuthority: 'State of Florida', status: 'Active', expirationDate: 'Sep 30, 2025' },
  { id: 'l3', name: 'Foreign LLC Registration', issuingAuthority: 'State of Tennessee', status: 'Active', expirationDate: 'Apr 1, 2026' },
  { id: 'l4', name: 'Data Privacy Compliance Cert', issuingAuthority: 'TrustArc', status: 'Expiring', expirationDate: 'Mar 15, 2025' },
];

// Block 4 — Insurance Coverage
type InsuranceStatus = 'Active' | 'Expiring';
const INSURANCE: {
  id: string;
  provider: string;
  coverageType: string;
  status: InsuranceStatus;
  renewalDate: string;
}[] = [
  { id: 'i1', provider: 'Hiscox', coverageType: 'General Liability', status: 'Active', renewalDate: 'Dec 15, 2025' },
  { id: 'i2', provider: 'Embroker', coverageType: 'Directors & Officers', status: 'Active', renewalDate: 'Mar 1, 2026' },
  { id: 'i3', provider: 'Hartford', coverageType: 'Property', status: 'Active', renewalDate: 'Jun 1, 2026' },
  { id: 'i4', provider: 'Hiscox', coverageType: 'Cyber Liability', status: 'Expiring', renewalDate: 'Apr 1, 2025' },
];

// Block 5 — Legal Matters (Status Only)
type LegalStatus = 'Open' | 'Under Review' | 'Resolved';
const LEGAL_MATTERS: {
  id: string;
  caseName: string;
  category: string;
  status: LegalStatus;
  courtDate?: string;
}[] = [
  { id: 'lm1', caseName: 'Vendor Contract Dispute — CloudOps', category: 'Contract', status: 'Under Review' },
  { id: 'lm2', caseName: 'Trademark Opposition — KaNeXT', category: 'Regulatory', status: 'Open', courtDate: 'May 12, 2025' },
  { id: 'lm3', caseName: 'Employment Separation — J. Rivera', category: 'Employment', status: 'Resolved' },
];

// Status color mapping
const STATUS_COLOR: Record<string, string> = {
  // Filing
  Pending: '#B8943E',
  Submitted: '#1A1714',
  Accepted: '#5A8A6E',
  Overdue: '#B85C5C',
  // License
  Active: '#5A8A6E',
  Expiring: '#B8943E',
  Expired: '#B85C5C',
  'Renewal Required': '#B8943E',
  // Insurance (reuses Active, Expiring)
  // Legal
  Open: '#B8943E',
  'Under Review': '#1A1714',
  Resolved: '#5A8A6E',
  // Registration
  'In Good Standing': '#5A8A6E',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BizCompliance({ colors, onNavigateTab }: Props) {
  const [fiscalYear, setFiscalYear] = useState(FISCAL_YEARS[0]);

  const navigate = (tabIndex: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onNavigateTab?.(tabIndex);
  };

  const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Block 0 — Header */}
      <View style={[s.block, { borderColor: colors.border }]}>
        <ThemedText style={[s.pageTitle, { color: colors.text }]}>Compliance</ThemedText>
        <View style={s.fyRow}>
          {FISCAL_YEARS.map((fy) => (
            <Pressable
              key={fy}
              style={[
                s.fyPill,
                { backgroundColor: fy === fiscalYear ? colors.text : colors.backgroundTertiary },
              ]}
              onPress={() => {
                Haptics.selectionAsync();
                setFiscalYear(fy);
              }}
            >
              <ThemedText
                style={[
                  s.fyText,
                  { color: fy === fiscalYear ? colors.background : colors.textSecondary },
                ]}
              >
                {fy}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Block 1 — Entity Registration Snapshot */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ENTITY REGISTRATION</ThemedText>
      <Pressable
        style={({ pressed }) => [
          s.block,
          { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={tap}
      >
        <ThemedText style={[s.subLabel, { color: colors.textSecondary }]}>Registered Jurisdictions</ThemedText>
        {REGISTRATION.jurisdictions.map((j) => {
          const color = STATUS_COLOR[j.status] ?? '#5A8A6E';
          return (
            <View key={j.state} style={s.jurisdictionRow}>
              <ThemedText style={[s.fieldValue, { color: colors.text }]}>{j.state}</ThemedText>
              <StatusChip label={j.status} color={color} />
            </View>
          );
        })}
        <View style={[s.divider, { backgroundColor: colors.border }]} />
        <FieldRow label="Registered Agent" value={REGISTRATION.registeredAgent} colors={colors} />
        <FieldRow label="Next Annual Filing" value={REGISTRATION.nextAnnualFiling} colors={colors} />
        <View style={s.tapHintRow}>
          <ThemedText style={[s.tapHint, { color: colors.textTertiary }]}>View Filing Queue</ThemedText>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </View>
      </Pressable>

      {/* Block 2 — Filing & Deadline Queue */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>FILING & DEADLINE QUEUE</ThemedText>
      {FILINGS.map((filing) => {
        const color = STATUS_COLOR[filing.status] ?? '#B8943E';
        return (
          <Pressable
            key={filing.id}
            style={({ pressed }) => [
              s.block,
              s.rowBlock,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={tap}
          >
            <View style={s.rowHeader}>
              <View style={s.rowInfo}>
                <ThemedText style={[s.rowTitle, { color: colors.text }]}>{filing.name}</ThemedText>
                <ThemedText style={[s.rowMeta, { color: colors.textTertiary }]}>
                  {filing.jurisdiction} · {filing.type}
                </ThemedText>
              </View>
              <StatusChip label={filing.status} color={color} />
            </View>
            <View style={s.rowFooter}>
              <ThemedText style={[s.dueDate, { color: colors.textSecondary }]}>
                Due: {filing.dueDate}
              </ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </View>
          </Pressable>
        );
      })}

      {/* Block 3 — Licenses & Permits */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>LICENSES & PERMITS</ThemedText>
      {LICENSES.map((license) => {
        const color = STATUS_COLOR[license.status] ?? '#5A8A6E';
        return (
          <Pressable
            key={license.id}
            style={({ pressed }) => [
              s.block,
              s.rowBlock,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={tap}
          >
            <View style={s.rowHeader}>
              <View style={s.rowInfo}>
                <ThemedText style={[s.rowTitle, { color: colors.text }]}>{license.name}</ThemedText>
                <ThemedText style={[s.rowMeta, { color: colors.textTertiary }]}>
                  {license.issuingAuthority}
                </ThemedText>
              </View>
              <StatusChip label={license.status} color={color} />
            </View>
            <View style={s.rowFooter}>
              <ThemedText style={[s.dueDate, { color: colors.textSecondary }]}>
                Expires: {license.expirationDate}
              </ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </View>
          </Pressable>
        );
      })}

      {/* Block 4 — Insurance Coverage */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>INSURANCE COVERAGE</ThemedText>
      {INSURANCE.map((policy) => {
        const color = STATUS_COLOR[policy.status] ?? '#5A8A6E';
        return (
          <Pressable
            key={policy.id}
            style={({ pressed }) => [
              s.block,
              s.rowBlock,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={tap}
          >
            <View style={s.rowHeader}>
              <View style={s.rowInfo}>
                <ThemedText style={[s.rowTitle, { color: colors.text }]}>{policy.coverageType}</ThemedText>
                <ThemedText style={[s.rowMeta, { color: colors.textTertiary }]}>
                  {policy.provider}
                </ThemedText>
              </View>
              <StatusChip label={policy.status} color={color} />
            </View>
            <View style={s.rowFooter}>
              <ThemedText style={[s.dueDate, { color: colors.textSecondary }]}>
                Renewal: {policy.renewalDate}
              </ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </View>
          </Pressable>
        );
      })}

      {/* Block 5 — Legal Matters (Status Only) */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>LEGAL MATTERS</ThemedText>
      {LEGAL_MATTERS.map((matter) => {
        const color = STATUS_COLOR[matter.status] ?? '#B8943E';
        return (
          <Pressable
            key={matter.id}
            style={({ pressed }) => [
              s.block,
              s.rowBlock,
              { borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={tap}
          >
            <View style={s.rowHeader}>
              <View style={s.rowInfo}>
                <ThemedText style={[s.rowTitle, { color: colors.text }]}>{matter.caseName}</ThemedText>
                <ThemedText style={[s.rowMeta, { color: colors.textTertiary }]}>
                  {matter.category}
                </ThemedText>
              </View>
              <StatusChip label={matter.status} color={color} />
            </View>
            {matter.courtDate && (
              <View style={s.rowFooter}>
                <ThemedText style={[s.dueDate, { color: colors.textSecondary }]}>
                  Court Date: {matter.courtDate}
                </ThemedText>
                <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
              </View>
            )}
            {!matter.courtDate && (
              <View style={s.rowFooterEnd}>
                <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function StatusChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.statusChip, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.statusChipText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function FieldRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.fieldRow}>
      <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.fieldValue, { color: colors.text }]}>{value}</ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  block: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },

  rowBlock: {
    marginBottom: Spacing.sm,
  },

  // Header
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },
  fyRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fyPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  fyText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Sub-label
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },

  // Jurisdiction rows
  jurisdictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  // Divider
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 10,
  },

  // Tap hint
  tapHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
    marginTop: 8,
    paddingTop: 8,
  },
  tapHint: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Row cards (filings, licenses, insurance, legal)
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  rowInfo: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  rowMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  rowFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  rowFooterEnd: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  dueDate: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Status chip
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Field rows
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    maxWidth: '55%',
  },
});
