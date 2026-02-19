/**
 * Business Organization Compliance Tab -- V3
 * 3-pill ViewBar: Corporate | Legal | IP
 * KaNeXT founder view. All data inline.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'corporate' | 'legal' | 'ip';

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// INLINE DATA
// =============================================================================

const VIEWS: { id: ViewMode; label: string }[] = [
  { id: 'corporate', label: 'Corporate' },
  { id: 'legal', label: 'Legal' },
  { id: 'ip', label: 'IP' },
];

// Corporate
const ANNUAL_FILINGS = [
  { id: 'af1', entity: 'OSK Group LLC', state: 'Delaware', dueDate: 'Jun 1, 2025', status: 'upcoming' as const },
  { id: 'af2', entity: 'KaNeXT Operations LLC', state: 'Florida', dueDate: 'May 1, 2025', status: 'upcoming' as const },
  { id: 'af3', entity: 'KaNeXT IP Holdings LLC', state: 'Delaware', dueDate: 'Jun 1, 2025', status: 'upcoming' as const },
];

const INSURANCE_POLICIES = [
  { id: 'ins1', type: 'General Liability', provider: 'Hiscox', annual: '$1,200', expiration: 'Dec 2025', status: 'active' as const },
  { id: 'ins2', type: 'D&O Insurance', provider: 'Embroker', annual: '$2,800', expiration: 'Mar 2026', status: 'active' as const },
];

const OPERATING_AGREEMENTS = [
  { id: 'oa1', entity: 'OSK Group LLC', status: 'executed' as const, lastUpdated: 'Mar 2024' },
  { id: 'oa2', entity: 'KaNeXT Operations LLC', status: 'executed' as const, lastUpdated: 'Apr 2024' },
  { id: 'oa3', entity: 'KaNeXT IP Holdings LLC', status: 'executed' as const, lastUpdated: 'Apr 2024' },
];

const BOARD_MINUTES = [
  { id: 'bm1', title: 'Q4 2024 Board Meeting', date: 'Dec 15, 2024', status: 'approved' as const },
  { id: 'bm2', title: 'Q1 2025 Board Meeting', date: 'Mar 20, 2025', status: 'draft' as const },
  { id: 'bm3', title: 'Special Resolution: Pre-Seed', date: 'Jan 10, 2025', status: 'approved' as const },
];

// Legal
const CONTRACTS = [
  { id: 'ct1', title: 'NDA - Velocity Ventures', type: 'NDA', parties: 'OSK Group LLC / Velocity Ventures', effective: 'May 2024', expiration: 'May 2026', status: 'active' as const },
  { id: 'ct2', title: 'NDA - Horizon Capital', type: 'NDA', parties: 'OSK Group LLC / Horizon Capital', effective: 'Aug 2024', expiration: 'Aug 2026', status: 'active' as const },
  { id: 'ct3', title: 'NAIA Beta Partnership', type: 'Partnership', parties: 'KaNeXT Ops / NAIA Conference', effective: 'Jan 2025', expiration: 'Dec 2025', status: 'active' as const },
  { id: 'ct4', title: 'AWS Enterprise Agreement', type: 'Vendor', parties: 'KaNeXT Ops / AWS', effective: 'Mar 2024', expiration: 'Mar 2025', status: 'renewal' as const },
  { id: 'ct5', title: 'Employment - Marcus Chen', type: 'Employment', parties: 'KaNeXT Ops / Marcus Chen', effective: 'Jun 2024', expiration: 'N/A', status: 'active' as const },
  { id: 'ct6', title: 'Employment - Aisha Williams', type: 'Employment', parties: 'KaNeXT Ops / Aisha Williams', effective: 'Aug 2024', expiration: 'N/A', status: 'active' as const },
];

// IP
const TRADEMARKS = [
  { id: 'tm1', title: 'KaNeXT', type: 'Trademark', filingDate: 'Sep 2024', status: 'pending' as const, serialNumber: '98/123456' },
  { id: 'tm2', title: 'Nexus', type: 'Trademark', filingDate: 'Oct 2024', status: 'pending' as const, serialNumber: '98/234567' },
];

const PATENT = {
  id: 'pt1', title: 'Institutional Operating System Architecture', type: 'Patent (Utility)', filingDate: 'Nov 2024', status: 'filed' as const, applicationNumber: '18/456,789',
};

const STRATEGIC_DOCS = 26;
const DOMAIN_NAMES = [
  { id: 'dn1', name: 'kanext.io', registrar: 'Namecheap', expiration: 'Mar 2026' },
  { id: 'dn2', name: 'kanextos.com', registrar: 'Namecheap', expiration: 'Mar 2026' },
  { id: 'dn3', name: 'oskgroup.io', registrar: 'GoDaddy', expiration: 'Jun 2026' },
];

const STATUS_COLORS: Record<string, string> = {
  active: '#22C55E',
  upcoming: '#F59E0B',
  executed: '#22C55E',
  approved: '#22C55E',
  draft: '#3B82F6',
  pending: '#F59E0B',
  filed: '#3B82F6',
  renewal: '#EF4444',
};

const STATUS_LABELS: Record<string, string> = {
  active: 'ACTIVE',
  upcoming: 'UPCOMING',
  executed: 'EXECUTED',
  approved: 'APPROVED',
  draft: 'DRAFT',
  pending: 'PENDING',
  filed: 'FILED',
  renewal: 'RENEWAL DUE',
};

const TYPE_COLORS: Record<string, string> = {
  NDA: '#8B5CF6',
  Partnership: '#3B82F6',
  Vendor: '#F59E0B',
  Employment: '#14B8A6',
  Trademark: '#EC4899',
  'Patent (Utility)': '#6366F1',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function BizCompliance({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewMode>('corporate');

  const handleViewPress = useCallback((id: ViewMode) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  // ---------------------------------------------------------------------------
  // CORPORATE
  // ---------------------------------------------------------------------------
  const renderCorporate = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Annual Filings */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ANNUAL FILINGS</ThemedText>
      {ANNUAL_FILINGS.map((filing) => {
        const stColor = STATUS_COLORS[filing.status];
        return (
          <View key={filing.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.filingHeader}>
              <View style={s.filingInfo}>
                <ThemedText style={[s.filingEntity, { color: colors.text }]}>{filing.entity}</ThemedText>
                <ThemedText style={[s.filingMeta, { color: colors.textSecondary }]}>
                  {filing.state} · Due: {filing.dueDate}
                </ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[filing.status]}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {/* Insurance Policies */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>INSURANCE POLICIES</ThemedText>
      {INSURANCE_POLICIES.map((policy) => {
        const stColor = STATUS_COLORS[policy.status];
        return (
          <View key={policy.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.policyHeader}>
              <View style={s.policyInfo}>
                <ThemedText style={[s.policyType, { color: colors.text }]}>{policy.type}</ThemedText>
                <ThemedText style={[s.policyProvider, { color: colors.textSecondary }]}>{policy.provider}</ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[policy.status]}</ThemedText>
              </View>
            </View>
            <View style={[s.policyDetailRow, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={s.policyDetailItem}>
                <ThemedText style={[s.policyDetailLabel, { color: colors.textSecondary }]}>Annual</ThemedText>
                <ThemedText style={[s.policyDetailValue, { color: colors.text }]}>{policy.annual}</ThemedText>
              </View>
              <View style={s.policyDetailItem}>
                <ThemedText style={[s.policyDetailLabel, { color: colors.textSecondary }]}>Expires</ThemedText>
                <ThemedText style={[s.policyDetailValue, { color: colors.text }]}>{policy.expiration}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}

      {/* Operating Agreements */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>OPERATING AGREEMENTS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {OPERATING_AGREEMENTS.map((oa, idx) => {
          const stColor = STATUS_COLORS[oa.status];
          return (
            <View
              key={oa.id}
              style={[
                s.oaRow,
                idx < OPERATING_AGREEMENTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.oaInfo}>
                <ThemedText style={[s.oaEntity, { color: colors.text }]}>{oa.entity}</ThemedText>
                <ThemedText style={[s.oaDate, { color: colors.textSecondary }]}>Updated: {oa.lastUpdated}</ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[oa.status]}</ThemedText>
              </View>
            </View>
          );
        })}
      </View>

      {/* Board Minutes */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>BOARD MINUTES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BOARD_MINUTES.map((bm, idx) => {
          const stColor = STATUS_COLORS[bm.status];
          return (
            <View
              key={bm.id}
              style={[
                s.minuteRow,
                idx < BOARD_MINUTES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <IconSymbol name="doc.text.fill" size={16} color={colors.textTertiary} />
              <View style={s.minuteInfo}>
                <ThemedText style={[s.minuteTitle, { color: colors.text }]}>{bm.title}</ThemedText>
                <ThemedText style={[s.minuteDate, { color: colors.textSecondary }]}>{bm.date}</ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[bm.status]}</ThemedText>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // LEGAL
  // ---------------------------------------------------------------------------
  const renderLegal = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CONTRACTS ({CONTRACTS.length})</ThemedText>
      {CONTRACTS.map((contract) => {
        const stColor = STATUS_COLORS[contract.status];
        const typeColor = TYPE_COLORS[contract.type] ?? colors.textSecondary;
        return (
          <View key={contract.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.contractHeader}>
              <ThemedText style={[s.contractTitle, { color: colors.text }]}>{contract.title}</ThemedText>
              <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[contract.status]}</ThemedText>
              </View>
            </View>

            <View style={s.contractBadges}>
              <View style={[s.typeBadge, { backgroundColor: typeColor + '20' }]}>
                <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>{contract.type.toUpperCase()}</ThemedText>
              </View>
            </View>

            <View style={[s.contractDetails, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <View style={s.contractDetailRow}>
                <ThemedText style={[s.contractDetailLabel, { color: colors.textSecondary }]}>Parties</ThemedText>
                <ThemedText style={[s.contractDetailValue, { color: colors.text }]} numberOfLines={1}>{contract.parties}</ThemedText>
              </View>
              <View style={s.contractDetailRow}>
                <ThemedText style={[s.contractDetailLabel, { color: colors.textSecondary }]}>Effective</ThemedText>
                <ThemedText style={[s.contractDetailValue, { color: colors.text }]}>{contract.effective}</ThemedText>
              </View>
              <View style={s.contractDetailRow}>
                <ThemedText style={[s.contractDetailLabel, { color: colors.textSecondary }]}>Expiration</ThemedText>
                <ThemedText style={[s.contractDetailValue, { color: colors.text }]}>{contract.expiration}</ThemedText>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // IP
  // ---------------------------------------------------------------------------
  const renderIP = () => (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Trademarks */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TRADEMARKS</ThemedText>
      {TRADEMARKS.map((tm) => {
        const stColor = STATUS_COLORS[tm.status];
        const typeColor = TYPE_COLORS[tm.type] ?? colors.textSecondary;
        return (
          <View key={tm.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: Spacing.sm }]}>
            <View style={s.ipHeader}>
              <View style={s.ipInfo}>
                <ThemedText style={[s.ipTitle, { color: colors.text }]}>{tm.title}</ThemedText>
                <View style={s.ipBadges}>
                  <View style={[s.typeBadge, { backgroundColor: typeColor + '20' }]}>
                    <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>{tm.type.toUpperCase()}</ThemedText>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: stColor + '20' }]}>
                    <ThemedText style={[s.statusBadgeText, { color: stColor }]}>{STATUS_LABELS[tm.status]}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
            <View style={[s.ipMeta, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
              <ThemedText style={[s.ipMetaText, { color: colors.textSecondary }]}>Filed: {tm.filingDate}</ThemedText>
              <ThemedText style={[s.ipMetaText, { color: colors.textSecondary }]}>Serial: {tm.serialNumber}</ThemedText>
            </View>
          </View>
        );
      })}

      {/* Patent */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>PATENTS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.ipHeader}>
          <View style={s.ipInfo}>
            <ThemedText style={[s.ipTitle, { color: colors.text }]}>{PATENT.title}</ThemedText>
            <View style={s.ipBadges}>
              <View style={[s.typeBadge, { backgroundColor: (TYPE_COLORS[PATENT.type] ?? '#6366F1') + '20' }]}>
                <ThemedText style={[s.typeBadgeText, { color: TYPE_COLORS[PATENT.type] ?? '#6366F1' }]}>{PATENT.type.toUpperCase()}</ThemedText>
              </View>
              <View style={[s.statusBadge, { backgroundColor: STATUS_COLORS[PATENT.status] + '20' }]}>
                <ThemedText style={[s.statusBadgeText, { color: STATUS_COLORS[PATENT.status] }]}>{STATUS_LABELS[PATENT.status]}</ThemedText>
              </View>
            </View>
          </View>
        </View>
        <View style={[s.ipMeta, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
          <ThemedText style={[s.ipMetaText, { color: colors.textSecondary }]}>Filed: {PATENT.filingDate}</ThemedText>
          <ThemedText style={[s.ipMetaText, { color: colors.textSecondary }]}>App #: {PATENT.applicationNumber}</ThemedText>
        </View>
      </View>

      {/* Strategic Documents */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>STRATEGIC DOCUMENTS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.docsRow}>
          <IconSymbol name="folder.fill" size={20} color={accentColor} />
          <View style={s.docsInfo}>
            <ThemedText style={[s.docsCount, { color: colors.text }]}>{STRATEGIC_DOCS} documents</ThemedText>
            <ThemedText style={[s.docsDesc, { color: colors.textSecondary }]}>
              Spec documents, architecture diagrams, competitive analyses, pitch materials
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Domain Names */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: Spacing.md }]}>DOMAIN NAMES</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {DOMAIN_NAMES.map((domain, idx) => (
          <View
            key={domain.id}
            style={[
              s.domainRow,
              idx < DOMAIN_NAMES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name="globe" size={14} color={colors.textTertiary} />
            <View style={s.domainInfo}>
              <ThemedText style={[s.domainName, { color: colors.text }]}>{domain.name}</ThemedText>
              <ThemedText style={[s.domainMeta, { color: colors.textSecondary }]}>
                {domain.registrar} · Exp: {domain.expiration}
              </ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: '#22C55E20' }]}>
              <ThemedText style={[s.statusBadgeText, { color: '#22C55E' }]}>ACTIVE</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.viewPill,
                { backgroundColor: isActive ? accentColor : 'rgba(255,255,255,0.08)' },
              ]}
              onPress={() => handleViewPress(v.id)}
            >
              <ThemedText style={[s.viewPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {activeView === 'corporate' && renderCorporate()}
      {activeView === 'legal' && renderLegal()}
      {activeView === 'ip' && renderIP()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  // ViewBar
  viewBar: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  viewPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  viewPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Card
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: Spacing.sm,
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Type badge
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Filings
  filingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  filingInfo: {
    flex: 1,
  },
  filingEntity: {
    fontSize: 14,
    fontWeight: '600',
  },
  filingMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Insurance
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  policyInfo: {
    flex: 1,
  },
  policyType: {
    fontSize: 14,
    fontWeight: '600',
  },
  policyProvider: {
    fontSize: 12,
    marginTop: 2,
  },
  policyDetailRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  policyDetailItem: {
    gap: 2,
  },
  policyDetailLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  policyDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Operating Agreements
  oaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  oaInfo: {
    flex: 1,
  },
  oaEntity: {
    fontSize: 13,
    fontWeight: '600',
  },
  oaDate: {
    fontSize: 11,
    marginTop: 2,
  },

  // Board Minutes
  minuteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  minuteInfo: {
    flex: 1,
  },
  minuteTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  minuteDate: {
    fontSize: 11,
    marginTop: 2,
  },

  // Contracts
  contractHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  contractTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  contractBadges: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  contractDetails: {
    paddingTop: Spacing.sm,
    gap: 6,
  },
  contractDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contractDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  contractDetailValue: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },

  // IP
  ipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  ipInfo: {
    flex: 1,
    gap: 6,
  },
  ipTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  ipBadges: {
    flexDirection: 'row',
    gap: 6,
  },
  ipMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  ipMetaText: {
    fontSize: 12,
  },

  // Docs
  docsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  docsInfo: {
    flex: 1,
  },
  docsCount: {
    fontSize: 16,
    fontWeight: '700',
  },
  docsDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },

  // Domains
  domainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  domainInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 14,
    fontWeight: '600',
  },
  domainMeta: {
    fontSize: 11,
    marginTop: 2,
  },
});
