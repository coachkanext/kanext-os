/**
 * BizProgram — Company Informational Surface (Program Tab)
 * Single vertical scroll. Structured blocks. Minimal. Document-like.
 * Describes the entity. Does not evaluate it.
 * Navigation happens via Organization tabs — not inline.
 */
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA — Structured facts only
// =============================================================================

const COMPANY = {
  name: 'Valuetainment',
  entityType: 'LLC',
  jurisdiction: 'Delaware',
  formationDate: 'March 2023',
  fiscalYear: 'FY 2025',
};

const OVERVIEW = {
  mission: 'Build the institutional operating system that unifies sports, church, education, business, and competition under one platform.',
  primaryActivity: 'Enterprise SaaS — cross-platform mobile application with 5 institutional modes',
  operatingMarkets: 'United States',
  headquarters: 'Miami, FL',
  website: 'valuetainment.com',
};

const CAPITAL = {
  totalRaised: '$1.2M',
  currentRound: 'Pre-Seed (Active)',
  sharesOutstanding: '10,000,000',
  debtOutstanding: '$0',
};

const ORG_STRUCTURE = {
  headcount: 12,
  departments: ['Engineering', 'Product', 'Operations', 'Legal', 'Finance', 'Marketing'],
  executives: [
    { title: 'Chief Executive Officer' },
    { title: 'Chief Technology Officer' },
    { title: 'Chief Operating Officer' },
    { title: 'General Counsel' },
    { title: 'Chief Financial Officer' },
  ],
};

const DEALS = {
  active: 3,
  closedThisFY: 1,
};

const COMPLIANCE = {
  registeredIn: ['Delaware', 'Tennessee', 'Florida'],
  activeLicenses: 4,
  upcomingFilings: 2,
};

const FACILITIES = {
  owned: 0,
  leased: 2,
  shared: 1,
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BizProgram({ colors }: Props) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Block 0 — Header */}
      <View style={[s.block, { borderColor: colors.border }]}>
        <View style={s.headerRow}>
          <View style={[s.logoPlaceholder, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.logoText, { color: colors.textSecondary }]}>V</ThemedText>
          </View>
          <View style={s.headerInfo}>
            <ThemedText style={[s.companyName, { color: colors.text }]}>{COMPANY.name}</ThemedText>
            <ThemedText style={[s.entityType, { color: colors.textSecondary }]}>{COMPANY.entityType}</ThemedText>
          </View>
        </View>
        <FieldRow label="Jurisdiction" value={COMPANY.jurisdiction} colors={colors} />
        <FieldRow label="Formation Date" value={COMPANY.formationDate} colors={colors} />
        <FieldRow label="Fiscal Year" value={COMPANY.fiscalYear} colors={colors} />
      </View>

      {/* Block 1 — Company Overview */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>COMPANY OVERVIEW</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        <FieldRow label="Mission" value={OVERVIEW.mission} colors={colors} multiline />
        <FieldRow label="Primary Business Activity" value={OVERVIEW.primaryActivity} colors={colors} multiline />
        <FieldRow label="Operating Markets" value={OVERVIEW.operatingMarkets} colors={colors} />
        <FieldRow label="Headquarters" value={OVERVIEW.headquarters} colors={colors} />
        <FieldRow label="Website" value={OVERVIEW.website} colors={colors} />
      </View>

      {/* Block 2 — Capital Structure */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>CAPITAL STRUCTURE</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        <FieldRow label="Total Capital Raised" value={CAPITAL.totalRaised} colors={colors} />
        <FieldRow label="Current Round" value={CAPITAL.currentRound} colors={colors} />
        <FieldRow label="Shares Outstanding" value={CAPITAL.sharesOutstanding} colors={colors} />
        <FieldRow label="Debt Outstanding" value={CAPITAL.debtOutstanding} colors={colors} />
      </View>

      {/* Block 3 — Organizational Structure */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ORGANIZATIONAL STRUCTURE</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        <FieldRow label="Total Headcount" value={String(ORG_STRUCTURE.headcount)} colors={colors} />
        <FieldRow
          label={`Departments (${ORG_STRUCTURE.departments.length})`}
          value={ORG_STRUCTURE.departments.join(', ')}
          colors={colors}
          multiline
        />
        <View style={s.fieldGroup}>
          <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>Executive Roles</ThemedText>
          {ORG_STRUCTURE.executives.map((exec) => (
            <ThemedText key={exec.title} style={[s.fieldValue, { color: colors.text }]}>
              {exec.title}
            </ThemedText>
          ))}
        </View>
      </View>

      {/* Block 4 — Active Deals */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>ACTIVE DEALS</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        <FieldRow label="Active Deals" value={String(DEALS.active)} colors={colors} />
        <FieldRow label="Closed This Fiscal Year" value={String(DEALS.closedThisFY)} colors={colors} />
      </View>

      {/* Block 5 — Compliance Summary */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>COMPLIANCE SUMMARY</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        <FieldRow label="Registered In" value={COMPLIANCE.registeredIn.join(', ')} colors={colors} multiline />
        <FieldRow label="Active Licenses" value={String(COMPLIANCE.activeLicenses)} colors={colors} />
        <FieldRow label="Upcoming Filings" value={String(COMPLIANCE.upcomingFilings)} colors={colors} />
      </View>

      {/* Block 6 — Facilities */}
      <ThemedText style={[s.sectionLabel, { color: colors.textTertiary }]}>FACILITIES</ThemedText>
      <View style={[s.block, { borderColor: colors.border }]}>
        <FieldRow label="Owned Locations" value={String(FACILITIES.owned)} colors={colors} />
        <FieldRow label="Leased Locations" value={String(FACILITIES.leased)} colors={colors} />
        <FieldRow label="Shared Locations" value={String(FACILITIES.shared)} colors={colors} />
      </View>
    </ScrollView>
  );
}

// =============================================================================
// HELPER COMPONENTS
// =============================================================================

function FieldRow({
  label,
  value,
  colors,
  multiline,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  multiline?: boolean;
}) {
  return (
    <View style={[s.fieldRow, multiline && s.fieldRowMultiline]}>
      <ThemedText style={[s.fieldLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
      <ThemedText style={[s.fieldValue, { color: colors.text }, multiline && s.fieldValueMultiline]}>
        {value}
      </ThemedText>
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

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '700',
  },
  entityType: {
    fontSize: 13,
    marginTop: 2,
  },

  // Field rows
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldRowMultiline: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
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
  fieldValueMultiline: {
    textAlign: 'left',
    maxWidth: '100%',
    lineHeight: 19,
  },
  fieldGroup: {
    paddingVertical: 8,
    gap: 4,
  },
});
