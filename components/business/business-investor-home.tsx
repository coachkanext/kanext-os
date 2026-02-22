/**
 * Business Investor Home — Investor Room
 * 8 card sections scoped by active company.
 */

import React, { useState } from 'react';
import { View, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBusiness } from '@/context/business-context';
import {
  getProofEventsByCompany,
  ENGINES,
  REVENUE_STREAMS,
  COMPETITIVE_ADVANTAGES,
  FUNDRAISING,
  ARCHITECTURE_LAYERS,
  RECENT_UPDATES,
  getStageColor,
} from '@/data/mock-business-investor-v2';
import { formatCurrency, COMPANY_METRICS } from '@/data/mock-business-investor';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { CompanyProfileSheet } from '@/components/business/company-profile-sheet';
import { EngineDetailSheet } from '@/components/business/engine-detail-sheet';
import type { Engine } from '@/types';

// Domain data for inline section
interface DomainItem {
  id: string;
  name: string;
  icon: string;
  description: string;
  status: 'live' | 'read-only' | 'v2';
  objects: string[];
  purpose: string;
}

const ACTIVE_DOMAINS: DomainItem[] = [
  {
    id: 'domain-sports',
    name: 'Sports',
    icon: 'sportscourt.fill',
    description: 'Athletic program management for universities, clubs, and leagues.',
    status: 'live',
    objects: ['Programs', 'Rosters', 'Games', 'Recruiting', 'Evaluations', 'Simulations'],
    purpose: 'Unified operational intelligence for basketball programs — recruiting, game ops, player evaluation, team analytics.',
  },
  {
    id: 'domain-enterprise',
    name: 'Enterprise',
    icon: 'building.2.fill',
    description: 'Investor data room and corporate intelligence platform.',
    status: 'live',
    objects: ['Companies', 'Documents', 'Proof Events', 'Engines', 'Governance', 'Fundraising'],
    purpose: 'Premium investor-facing app with data room, proof events, governance, and multi-company management.',
  },
  {
    id: 'domain-church',
    name: 'Church',
    icon: 'heart.fill',
    description: 'Ministry management and congregation engagement.',
    status: 'read-only',
    objects: ['Campuses', 'Ministries', 'Messages', 'Giving', 'Connect Groups'],
    purpose: 'Multi-campus ministry operations — service management, ministry coordination, giving, and congregation engagement.',
  },
  {
    id: 'domain-education',
    name: 'Education',
    icon: 'graduationcap.fill',
    description: 'Academic administration and student services.',
    status: 'read-only',
    objects: ['Departments', 'Terms', 'Calendar', 'Faculty', 'Enrollment'],
    purpose: 'Institutional oversight — academic calendar management, department coordination, and enrollment analytics.',
  },
  {
    id: 'domain-community',
    name: 'Competition',
    icon: 'flag.checkered',
    description: 'League management and competition operations.',
    status: 'live',
    objects: ['Teams', 'Drivers', 'Events', 'Standings', 'Rules', 'Race Ops'],
    purpose: 'Competition league operations — team management, event scheduling, standings tracking, and race operations.',
  },
];

const V2_DOMAINS: DomainItem[] = [
  {
    id: 'domain-video',
    name: 'Video',
    icon: 'play.rectangle.fill',
    description: 'Film room, video tagging, and media intelligence.',
    status: 'v2',
    objects: ['Film Sessions', 'Tags', 'Playlists', 'Clips'],
    purpose: 'Integrated video intelligence — tagging, breakdown, and AI-powered film analysis.',
  },
  {
    id: 'domain-identity',
    name: 'Identity',
    icon: 'person.crop.circle.fill',
    description: 'Unified identity and credential management.',
    status: 'v2',
    objects: ['Profiles', 'Credentials', 'Permissions', 'SSO'],
    purpose: 'Cross-domain identity layer — single sign-on, role-based access, and credential management.',
  },
  {
    id: 'domain-rails',
    name: 'Payments',
    icon: 'creditcard.fill',
    description: 'Financial rails, billing, and transaction processing.',
    status: 'v2',
    objects: ['Subscriptions', 'Invoices', 'Payouts', 'Ledger'],
    purpose: 'Payment infrastructure — subscription billing, NIL payouts, giving processing, and financial ledger.',
  },
];

function getDomainStatusColor(status: string): string {
  switch (status) {
    case 'live': return '#22C55E';
    case 'read-only': return '#F59E0B';
    case 'v2': return '#A1A1AA';
    default: return '#A1A1AA';
  }
}

function getDomainStatusLabel(status: string): string {
  switch (status) {
    case 'live': return 'LIVE';
    case 'read-only': return 'READ-ONLY';
    case 'v2': return 'V2';
    default: return status.toUpperCase();
  }
}

const ACCENT_GOLD = '#FFFFFF';

// Collapsible section helper
function CollapsibleCard({
  title,
  children,
  colors,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  colors: typeof Colors.light;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        style={styles.collapsibleHeader}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setOpen(!open);
        }}
      >
        <ThemedText style={styles.cardTitle}>{title}</ThemedText>
        <IconSymbol
          name={open ? 'chevron.up' : 'chevron.down'}
          size={14}
          color={colors.textTertiary}
        />
      </Pressable>
      {open && children}
    </View>
  );
}

interface BusinessInvestorHomeProps {
  onSwitchTab?: (index: number) => void;
}

export function BusinessInvestorHome({ onSwitchTab }: BusinessInvestorHomeProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const { activeCompany, activeCompanyId } = useBusiness();

  const [companySheetVisible, setCompanySheetVisible] = useState(false);
  const [engineSheetVisible, setEngineSheetVisible] = useState(false);
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null);
  const [domainSheetVisible, setDomainSheetVisible] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainItem | null>(null);

  const proofEvents = getProofEventsByCompany(activeCompanyId);
  const primaryProof = proofEvents[0];

  return (
    <View style={styles.container}>
      {/* 1. Company Header */}
      <Pressable
        style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setCompanySheetVisible(true);
        }}
      >
        <View style={styles.companyHeaderRow}>
          <View style={[styles.companyBadge, { backgroundColor: ACCENT_GOLD }]}>
            <ThemedText style={styles.companyBadgeText}>{activeCompany.initials}</ThemedText>
          </View>
          <View style={styles.companyInfo}>
            <ThemedText style={styles.companyDisplayName}>{activeCompany.displayName}</ThemedText>
            <ThemedText style={[styles.companyLegal, { color: colors.textSecondary }]}>
              {activeCompany.legalName}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
        </View>
        <View style={styles.companyMeta}>
          <View style={[styles.jurisdictionPill, { backgroundColor: ACCENT_GOLD + '20' }]}>
            <ThemedText style={[styles.jurisdictionText, { color: ACCENT_GOLD }]}>
              {activeCompany.jurisdiction} {activeCompany.entityType}
            </ThemedText>
          </View>
          <ThemedText style={[styles.companyStatus, { color: colors.textTertiary }]}>
            {activeCompany.status}
          </ThemedText>
        </View>
      </Pressable>

      {/* 2. Proof Snapshot */}
      {primaryProof && (
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.proofHeader}>
            <ThemedText style={styles.cardTitle}>Proof Snapshot</ThemedText>
            <View style={[styles.stageBadge, { backgroundColor: getStageColor(primaryProof.stage) + '20' }]}>
              <ThemedText style={[styles.stageText, { color: getStageColor(primaryProof.stage) }]}>
                {primaryProof.stage.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.proofName, { color: colors.text }]}>
            {primaryProof.name}
          </ThemedText>
          <View style={styles.kpiRow}>
            {primaryProof.kpis.slice(0, 3).map((kpi) => (
              <View key={kpi.id} style={[styles.kpiTile, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.kpiValue, { color: ACCENT_GOLD }]}>
                  {kpi.value}
                </ThemedText>
                <ThemedText style={[styles.kpiLabel, { color: colors.textTertiary }]}>
                  {kpi.label}
                </ThemedText>
              </View>
            ))}
          </View>
          {onSwitchTab && (
            <Pressable
              style={[styles.ctaButton, { backgroundColor: ACCENT_GOLD + '15' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSwitchTab(1);
              }}
            >
              <ThemedText style={[styles.ctaText, { color: ACCENT_GOLD }]}>
                Open Proof Event
              </ThemedText>
              <IconSymbol name="arrow.right" size={14} color={ACCENT_GOLD} />
            </Pressable>
          )}
        </View>
      )}

      {/* 3. Metrics Dashboard */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={styles.cardTitle}>Key Metrics</ThemedText>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricTile, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.metricValue, { color: ACCENT_GOLD }]}>
              ${(COMPANY_METRICS.mrr / 1000).toFixed(0)}K
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>MRR</ThemedText>
            <ThemedText style={[styles.metricDelta, { color: '#22C55E' }]}>
              +{COMPANY_METRICS.mrrGrowth}%
            </ThemedText>
          </View>
          <View style={[styles.metricTile, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.metricValue, { color: ACCENT_GOLD }]}>
              {COMPANY_METRICS.customers}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Customers</ThemedText>
            <ThemedText style={[styles.metricDelta, { color: colors.textSecondary }]}>
              +{COMPANY_METRICS.pilots} pilots
            </ThemedText>
          </View>
          <View style={[styles.metricTile, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.metricValue, { color: ACCENT_GOLD }]}>
              {COMPANY_METRICS.runway}mo
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Runway</ThemedText>
          </View>
          <View style={[styles.metricTile, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.metricValue, { color: ACCENT_GOLD }]}>
              {COMPANY_METRICS.teamSize}
            </ThemedText>
            <ThemedText style={[styles.metricLabel, { color: colors.textTertiary }]}>Team Size</ThemedText>
          </View>
        </View>
      </View>

      {/* 4. Architecture */}
      <CollapsibleCard title="Architecture" colors={colors} defaultOpen>
        {ARCHITECTURE_LAYERS.map((layer) => (
          <View key={layer.id} style={styles.archRow}>
            <View style={[styles.archIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
              <IconSymbol name={layer.icon as any} size={18} color={ACCENT_GOLD} />
            </View>
            <View style={styles.archInfo}>
              <ThemedText style={styles.archName}>{layer.name}</ThemedText>
              <ThemedText style={[styles.archDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {layer.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </CollapsibleCard>

      {/* 4. Engines 00-06 */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={styles.cardTitle}>Canonical Engines</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.enginesRow}
        >
          {ENGINES.map((engine) => (
            <Pressable
              key={engine.id}
              style={[styles.engineChip, { backgroundColor: ACCENT_GOLD + '15' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedEngine(engine);
                setEngineSheetVisible(true);
              }}
            >
              <ThemedText style={[styles.engineChipText, { color: ACCENT_GOLD }]}>
                {engine.name.split(' — ')[0]}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* 5. Business Model */}
      <CollapsibleCard title="Business Model" colors={colors}>
        {REVENUE_STREAMS.map((stream) => (
          <View key={stream.id} style={styles.revenueRow}>
            <View style={styles.revenueHeader}>
              <ThemedText style={styles.revenueName}>{stream.name}</ThemedText>
              <View style={[styles.revenueStatusPill, { backgroundColor: stream.status === 'beta' ? '#22C55E20' : colors.backgroundTertiary }]}>
                <ThemedText style={[styles.revenueStatusText, { color: stream.status === 'beta' ? '#22C55E' : colors.textTertiary }]}>
                  {stream.status.toUpperCase()}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.revenueDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {stream.description}
            </ThemedText>
            {stream.pricing && (
              <ThemedText style={[styles.revenuePricing, { color: colors.textTertiary }]}>
                {stream.pricing}
              </ThemedText>
            )}
          </View>
        ))}
      </CollapsibleCard>

      {/* 6. Moat / Differentiation */}
      <CollapsibleCard title="Moat & Differentiation" colors={colors}>
        <ThemedText style={[styles.moatHeadline, { color: ACCENT_GOLD }]}>
          Global Intelligence Index (GII)
        </ThemedText>
        {COMPETITIVE_ADVANTAGES.map((adv) => (
          <View key={adv.id} style={styles.moatItem}>
            <View style={[styles.moatBullet, { backgroundColor: ACCENT_GOLD }]} />
            <View style={styles.moatContent}>
              <ThemedText style={styles.moatTitle}>{adv.title}</ThemedText>
              <ThemedText style={[styles.moatDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                {adv.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </CollapsibleCard>

      {/* 7. Fundraising */}
      {FUNDRAISING.map((round) => (
        <View key={round.id} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.fundraiseHeader}>
            <ThemedText style={styles.cardTitle}>Fundraising</ThemedText>
            <View style={[styles.stageBadge, { backgroundColor: getStageColor(round.status) + '20' }]}>
              <ThemedText style={[styles.stageText, { color: getStageColor(round.status) }]}>
                {round.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.roundName, { color: colors.text }]}>{round.name}</ThemedText>
          <View style={styles.fundraiseRow}>
            <View>
              <ThemedText style={[styles.fundraiseValue, { color: ACCENT_GOLD }]}>
                {round.targetAmount ? formatCurrency(round.targetAmount) : '—'}
              </ThemedText>
              <ThemedText style={[styles.fundraiseLabel, { color: colors.textTertiary }]}>Target</ThemedText>
            </View>
            <View>
              <ThemedText style={[styles.fundraiseValue, { color: ACCENT_GOLD }]}>
                {round.raisedAmount !== undefined ? formatCurrency(round.raisedAmount) : '—'}
              </ThemedText>
              <ThemedText style={[styles.fundraiseLabel, { color: colors.textTertiary }]}>Raised</ThemedText>
            </View>
            {round.closingDate && (
              <View>
                <ThemedText style={[styles.fundraiseValue, { color: colors.text }]}>
                  {round.closingDate}
                </ThemedText>
                <ThemedText style={[styles.fundraiseLabel, { color: colors.textTertiary }]}>Target Close</ThemedText>
              </View>
            )}
          </View>
          {round.summary && (
            <ThemedText style={[styles.fundraiseSummary, { color: colors.textSecondary }]}>
              {round.summary}
            </ThemedText>
          )}
          {onSwitchTab && (
            <Pressable
              style={[styles.ctaButton, { backgroundColor: ACCENT_GOLD + '15' }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSwitchTab(2);
              }}
            >
              <ThemedText style={[styles.ctaText, { color: ACCENT_GOLD }]}>
                Investor Docs
              </ThemedText>
              <IconSymbol name="arrow.right" size={14} color={ACCENT_GOLD} />
            </Pressable>
          )}
        </View>
      ))}

      {/* 8. Domains */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={styles.cardTitle}>Product Domains</ThemedText>
        <View style={styles.domainsGrid}>
          {ACTIVE_DOMAINS.map((domain) => (
            <Pressable
              key={domain.id}
              style={[styles.domainTile, { backgroundColor: colors.backgroundTertiary }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedDomain(domain);
                setDomainSheetVisible(true);
              }}
            >
              <View style={[styles.domainTileIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
                <IconSymbol name={domain.icon as any} size={18} color={ACCENT_GOLD} />
              </View>
              <ThemedText style={styles.domainTileName}>{domain.name}</ThemedText>
              <View style={styles.domainTileStatusRow}>
                <View style={[styles.domainStatusDot, { backgroundColor: getDomainStatusColor(domain.status) }]} />
                <ThemedText style={[styles.domainTileStatus, { color: colors.textTertiary }]}>
                  {getDomainStatusLabel(domain.status)}
                </ThemedText>
              </View>
            </Pressable>
          ))}
        </View>
        <ThemedText style={[styles.domainV2Label, { color: colors.textTertiary }]}>Coming in V2</ThemedText>
        <View style={styles.domainsGrid}>
          {V2_DOMAINS.map((domain) => (
            <View
              key={domain.id}
              style={[styles.domainTile, { backgroundColor: colors.backgroundTertiary, opacity: 0.4 }]}
            >
              <View style={styles.domainTileHeader}>
                <View style={[styles.domainTileIcon, { backgroundColor: ACCENT_GOLD + '15' }]}>
                  <IconSymbol name={domain.icon as any} size={18} color={ACCENT_GOLD} />
                </View>
                <View style={[styles.v2Badge, { backgroundColor: colors.backgroundSecondary }]}>
                  <ThemedText style={[styles.v2BadgeText, { color: colors.textTertiary }]}>V2</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.domainTileName}>{domain.name}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* 9. Recent Updates */}
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={styles.cardTitle}>Recent Updates</ThemedText>
        {RECENT_UPDATES.map((update, index) => (
          <View key={update.id}>
            <View style={styles.updateRow}>
              <View style={[styles.updateDot, { backgroundColor: ACCENT_GOLD }]} />
              <View style={styles.updateInfo}>
                <ThemedText style={styles.updateTitle}>{update.title}</ThemedText>
                <ThemedText style={[styles.updateDesc, { color: colors.textSecondary }]} numberOfLines={1}>
                  {update.description}
                </ThemedText>
                <ThemedText style={[styles.updateTime, { color: colors.textTertiary }]}>
                  {update.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </ThemedText>
              </View>
            </View>
            {index < RECENT_UPDATES.length - 1 && (
              <View style={[styles.updateDivider, { backgroundColor: colors.divider }]} />
            )}
          </View>
        ))}
      </View>

      {/* Bottom Sheets */}
      <CompanyProfileSheet
        visible={companySheetVisible}
        onClose={() => setCompanySheetVisible(false)}
      />
      {selectedEngine && (
        <EngineDetailSheet
          visible={engineSheetVisible}
          onClose={() => setEngineSheetVisible(false)}
          engine={selectedEngine}
        />
      )}
      <BottomSheet
        visible={domainSheetVisible}
        onClose={() => setDomainSheetVisible(false)}
        title={selectedDomain?.name ?? ''}
        useModal
      >
        {selectedDomain && (
          <View style={{ padding: Spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: Spacing.md }}>
              <View style={[styles.domainStatusDot, { backgroundColor: getDomainStatusColor(selectedDomain.status) }]} />
              <ThemedText style={{ fontSize: 13, fontWeight: '700', color: getDomainStatusColor(selectedDomain.status) }}>
                {getDomainStatusLabel(selectedDomain.status)}
              </ThemedText>
            </View>
            <ThemedText style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.textSecondary, marginBottom: Spacing.sm }}>
              Purpose
            </ThemedText>
            <ThemedText style={{ fontSize: 15, lineHeight: 22, color: colors.text, marginBottom: Spacing.md }}>
              {selectedDomain.purpose}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: colors.textSecondary, marginBottom: Spacing.sm }}>
              Objects Managed
            </ThemedText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm }}>
              {selectedDomain.objects.map((obj) => (
                <View key={obj} style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, backgroundColor: ACCENT_GOLD + '15' }}>
                  <ThemedText style={{ fontSize: 13, fontWeight: '600', color: ACCENT_GOLD }}>{obj}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        )}
      </BottomSheet>
    </View>
  );
}

// Backward-compat alias (temporary)
export { BusinessInvestorHome as EnterpriseHomeContent };

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Company Header
  companyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  companyBadge: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  companyBadgeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  companyInfo: {
    flex: 1,
  },
  companyDisplayName: {
    fontSize: 20,
    fontWeight: '700',
  },
  companyLegal: {
    fontSize: 13,
    marginTop: 2,
  },
  companyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  jurisdictionPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  jurisdictionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  companyStatus: {
    fontSize: 12,
  },

  // Proof Snapshot
  proofHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  proofName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  stageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  stageText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  kpiTile: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  // Metrics
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metricTile: {
    width: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  metricDelta: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Architecture
  archRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  archIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  archInfo: {
    flex: 1,
  },
  archName: {
    fontSize: 14,
    fontWeight: '600',
  },
  archDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  // Engines
  enginesRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  engineChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  engineChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Revenue
  revenueRow: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
  },
  revenueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  revenueName: {
    fontSize: 15,
    fontWeight: '600',
  },
  revenueStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  revenueStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  revenueDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  revenuePricing: {
    fontSize: 12,
    marginTop: 4,
  },

  // Moat
  moatHeadline: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  moatItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  moatBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  moatContent: {
    flex: 1,
  },
  moatTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  moatDesc: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },

  // Fundraise
  fundraiseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  roundName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  fundraiseRow: {
    flexDirection: 'row',
    gap: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  fundraiseValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  fundraiseLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },
  fundraiseSummary: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },

  // Updates
  updateRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
    marginRight: Spacing.sm,
  },
  updateInfo: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  updateDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  updateTime: {
    fontSize: 11,
    marginTop: 2,
  },
  updateDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 8 + Spacing.sm,
  },

  // Domains
  domainsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  domainTile: {
    width: '48%',
    flexGrow: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  domainTileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  domainTileIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  domainTileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  domainTileStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  domainStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  domainTileStatus: {
    fontSize: 10,
    fontWeight: '600',
  },
  domainV2Label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  v2Badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  v2BadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
});
