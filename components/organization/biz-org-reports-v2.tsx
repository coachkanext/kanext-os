/**
 * Business Organization Reports Tab — V2
 * 13-tab Reports Hub: Overview, Library, Dashboards, Finance, Rails, Operations,
 * Compliance & Legal, People, Assets, Media & Proof, Data Room, Pack Builder, Exports.
 *
 * Cross-tab report aggregation, Data Room with access-level badges,
 * Pack Builder for board/investor/bank packets, and full export audit log.
 */
import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { BizCard, BizSubTabBar, BizStatusChip, BizEmptyLock, statusVariant } from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import type { BizReceipt, CrossTabLink } from '@/data/biz-org-shared-types';
import { KANEXT_HOLDCO, KANEXT_OPSCO, SEEDED_ENTITY_NAMES } from '@/data/biz-org-shared-types';
import {
  BIZ_REPORTS_V2_TABS,
  REPORT_STATUS_COLOR,
  REPORT_CATEGORY_COLOR,
  REPORT_CATEGORY_LABEL,
  REPORT_FORMAT_COLOR,
  ACCESS_LEVEL_COLOR,
  ACCESS_LEVEL_LABEL,
  REPORT_TEMPLATES,
  DATA_ROOM_SECTIONS,
  getBizReportsData,
} from '@/data/mock-biz-org-reports';
import type {
  BizReportsV2TabId,
  ReportItem,
  ReportCategory,
  DashboardTile,
  DataRoomDocument,
  PackSection,
  PackTemplate,
  ExportLogEntry,
  ReportOverviewStats,
  ReportTemplate,
} from '@/data/mock-biz-org-reports';

const BP = BusinessPalette;

// =============================================================================
// STATIC DATA — TIME RANGES, OVERVIEW ENHANCEMENTS, DASHBOARDS, AUDIT LOG
// =============================================================================

const TIME_RANGES = [
  { id: '7d', label: '7D' },
  { id: '30d', label: '30D' },
  { id: 'qtd', label: 'QTD' },
  { id: 'ytd', label: 'YTD' },
  { id: 'custom', label: 'Custom' },
];

const TRUTH_STRIP = [
  { label: 'Finance', status: 'green' as const },
  { label: 'Rails', status: 'yellow' as const },
  { label: 'Compliance', status: 'yellow' as const },
  { label: 'Ops', status: 'green' as const },
];

const WHAT_CHANGED = [
  { id: 'wc-1', date: 'Feb 17', description: 'Payment Rails Launch initiative moved to In Progress', tab: 'Operations' },
  { id: 'wc-2', date: 'Feb 16', description: 'OCC charter application submitted for Target Bank', tab: 'Compliance' },
  { id: 'wc-3', date: 'Feb 15', description: 'Q1 board package draft uploaded', tab: 'Reports' },
  { id: 'wc-4', date: 'Feb 14', description: 'Delaware franchise tax payment processed', tab: 'Finance' },
  { id: 'wc-5', date: 'Feb 13', description: 'Bank Charter App moved to Under Review', tab: 'Operations' },
  { id: 'wc-6', date: 'Feb 12', description: 'IP assignment agreement sent to new contractors', tab: 'Legal' },
];

const TOP_RISKS = [
  { id: 'tr-1', label: 'Malta FA compliance docs overdue — could affect club license', severity: 'high' as const, source: 'Compliance' },
  { id: 'tr-2', label: 'PCI-DSS recertification deadline approaching (Mar 31)', severity: 'high' as const, source: 'Compliance' },
  { id: 'tr-3', label: 'OCC charter approval timeline uncertain', severity: 'medium' as const, source: 'Legal' },
  { id: 'tr-4', label: 'Revenue share reconciliation delayed', severity: 'low' as const, source: 'Finance' },
];

const DASHBOARDS_READINESS = [
  { id: 'dash-ceo', label: 'CEO Dashboard', audience: 'Founder', readiness: 95, lastUpdated: 'Feb 17' },
  { id: 'dash-board', label: 'Board Pack', audience: 'Board', readiness: 78, lastUpdated: 'Feb 15' },
  { id: 'dash-investor', label: 'Investor Update', audience: 'Investor', readiness: 60, lastUpdated: 'Feb 10' },
  { id: 'dash-bank', label: 'Bank Readiness', audience: 'Regulatory', readiness: 45, lastUpdated: 'Feb 8' },
];

const AUDIT_LOG = [
  { id: 'al-1', action: 'exported' as const, actor: 'Alex Morgan', timestamp: 'Feb 17 09:30', reportLabel: 'CEO Dashboard' },
  { id: 'al-2', action: 'published' as const, actor: 'Jordan Blake', timestamp: 'Feb 15 16:00', reportLabel: 'Q1 Board Pack' },
  { id: 'al-3', action: 'accessed' as const, actor: 'Rachel Kim', timestamp: 'Feb 14 11:00', reportLabel: 'Compliance Summary' },
  { id: 'al-4', action: 'ran' as const, actor: 'Tom Bradley', timestamp: 'Feb 13 14:30', reportLabel: 'Financial Health Report' },
  { id: 'al-5', action: 'exported' as const, actor: 'Liam Chen', timestamp: 'Feb 12 10:00', reportLabel: 'Investor Update' },
];

const TRUTH_STATUS_COLOR: Record<string, string> = {
  green: '#22C55E',
  yellow: '#F59E0B',
  red: '#EF4444',
};

const SEVERITY_BORDER_COLOR: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#9CA3AF',
};

const AUDIT_ACTION_ICON: Record<string, string> = {
  exported: 'arrow.down.doc',
  published: 'paperplane',
  accessed: 'eye',
  ran: 'play.circle',
};

function readinessColor(value: number): string {
  if (value >= 80) return '#22C55E';
  if (value >= 50) return '#F59E0B';
  return '#EF4444';
}

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDateStr(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function statusLabel(status: ReportItem['status']): string {
  switch (status) {
    case 'generated': return 'Generated';
    case 'generating': return 'Generating';
    case 'scheduled': return 'Scheduled';
    case 'draft': return 'Draft';
    case 'failed': return 'Failed';
  }
}

function categoryForTab(tabId: BizReportsV2TabId): ReportCategory | null {
  switch (tabId) {
    case 'finance': return 'finance';
    case 'rails': return 'rails';
    case 'operations': return 'operations';
    case 'compliance_legal': return 'compliance_legal';
    case 'people': return 'people';
    case 'assets': return 'assets';
    case 'media_proof': return 'media_proof';
    default: return null;
  }
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  stats,
  reports,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  stats: ReportOverviewStats;
  reports: ReportItem[];
}) {
  const statCards: { label: string; value: number; icon: string; color: string }[] = [
    { label: 'Total Reports', value: stats.totalReports, icon: 'doc.text.fill', color: '#6AA9FF' },
    { label: 'Recently Generated', value: stats.recentlyGenerated, icon: 'checkmark.circle.fill', color: '#22C55E' },
    { label: 'Scheduled', value: stats.scheduled, icon: 'clock.arrow.2.circlepath', color: '#6366F1' },
    { label: 'Data Room Docs', value: stats.dataRoomDocs, icon: 'folder.fill', color: '#F59E0B' },
    { label: 'Pack Templates', value: stats.packTemplates, icon: 'doc.on.doc.fill', color: '#8B5CF6' },
  ];

  // Category quick links
  const categories: { cat: ReportCategory; count: number }[] = useMemo(() => {
    const cats: ReportCategory[] = ['finance', 'rails', 'operations', 'compliance_legal', 'people', 'assets', 'media_proof'];
    return cats.map((cat) => ({
      cat,
      count: reports.filter((r) => r.category === cat).length,
    }));
  }, [reports]);

  // Recent generation status (last 5 generated or generating)
  const recentReports = useMemo(() => {
    return [...reports]
      .filter((r) => r.status === 'generated' || r.status === 'generating')
      .sort((a, b) => {
        if (!a.generatedDate) return 1;
        if (!b.generatedDate) return -1;
        return b.generatedDate.localeCompare(a.generatedDate);
      })
      .slice(0, 5);
  }, [reports]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Truth Strip */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Health</ThemedText>
      <View style={s.truthStrip}>
        {TRUTH_STRIP.map((item) => (
          <View key={item.label} style={s.truthStripItem}>
            <View style={[s.truthStripDot, { backgroundColor: TRUTH_STATUS_COLOR[item.status] }]} />
            <ThemedText style={[{ color: colors.textSecondary, fontSize: 12, fontWeight: '600' }]}>
              {item.label}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* What Changed (7D) */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        What Changed (7D)
      </ThemedText>
      <View style={[s.changeLogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {WHAT_CHANGED.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.changeLogRow,
              idx < WHAT_CHANGED.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.changeLogDate, { color: colors.text }]}>{item.date}</ThemedText>
            <ThemedText style={[s.changeLogDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
            <View style={[s.changeLogTab, { backgroundColor: accentColor + '15' }]}>
              <ThemedText style={{ fontSize: 9, fontWeight: '700', color: accentColor, letterSpacing: 0.3 }}>
                {item.tab.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Top Risks */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Top Risks
      </ThemedText>
      <View style={[s.riskCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {TOP_RISKS.map((risk, idx) => (
          <View
            key={risk.id}
            style={[
              s.riskRow,
              { borderLeftColor: SEVERITY_BORDER_COLOR[risk.severity] },
              idx < TOP_RISKS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.riskLabel, { color: colors.text }]} numberOfLines={2}>
                {risk.label}
              </ThemedText>
            </View>
            <View style={s.riskSeverity}>
              <View style={[s.riskSource, { backgroundColor: SEVERITY_BORDER_COLOR[risk.severity] + '18' }]}>
                <ThemedText style={{ fontSize: 9, fontWeight: '700', color: SEVERITY_BORDER_COLOR[risk.severity], letterSpacing: 0.3 }}>
                  {risk.source.toUpperCase()}
                </ThemedText>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Stat cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>At a Glance</ThemedText>
      <View style={s.statGrid}>
        {statCards.map((card, idx) => (
          <View
            key={idx}
            style={[s.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.statCardHeader}>
              <IconSymbol name={card.icon as any} size={18} color={card.color} />
              <ThemedText style={[s.statCardLabel, { color: colors.textSecondary }]}>
                {card.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.statCardValue, { color: colors.text }]}>
              {card.value}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Category quick links */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        By Category
      </ThemedText>
      <View style={[s.categoryList, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {categories.map((item, idx) => (
          <View
            key={item.cat}
            style={[
              s.categoryRow,
              idx < categories.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.categoryDot, { backgroundColor: REPORT_CATEGORY_COLOR[item.cat] }]} />
            <ThemedText style={[s.categoryLabel, { color: colors.text }]}>
              {REPORT_CATEGORY_LABEL[item.cat]}
            </ThemedText>
            <ThemedText style={[s.categoryCount, { color: colors.textTertiary }]}>
              {item.count} report{item.count !== 1 ? 's' : ''}
            </ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </View>
        ))}
      </View>

      {/* Recent generation status */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Generation
      </ThemedText>
      <View style={[s.recentList, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {recentReports.map((report, idx) => {
          const stColor = REPORT_STATUS_COLOR[report.status];
          return (
            <View
              key={report.id}
              style={[
                s.recentRow,
                idx < recentReports.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.recentRowLeft}>
                <View style={[s.recentStatusDot, { backgroundColor: stColor }]} />
                <View style={s.recentRowInfo}>
                  <ThemedText style={[s.recentTitle, { color: colors.text }]} numberOfLines={1}>
                    {report.title}
                  </ThemedText>
                  <ThemedText style={[s.recentMeta, { color: colors.textTertiary }]}>
                    {report.generatedDate ? formatDateStr(report.generatedDate) : 'In progress'} · {report.format.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <StatusBadge label={statusLabel(report.status).toUpperCase()} color={stColor} />
            </View>
          );
        })}
        {recentReports.length === 0 && (
          <View style={s.recentRow}>
            <ThemedText style={[s.recentMeta, { color: colors.textTertiary }]}>
              No recently generated reports
            </ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// LIBRARY TAB
// =============================================================================

function LibraryTab({
  colors,
  accentColor,
  reports,
  searchQuery,
  categoryFilter,
  onSelectReport,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  reports: ReportItem[];
  searchQuery: string;
  categoryFilter: ReportCategory | 'all';
  onSelectReport: (report: ReportItem) => void;
}) {
  const filtered = useMemo(() => {
    let result = reports;
    if (categoryFilter !== 'all') {
      result = result.filter((r) => r.category === categoryFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.entityName.toLowerCase().includes(q) ||
          r.period.toLowerCase().includes(q),
      );
    }
    return result;
  }, [reports, searchQuery, categoryFilter]);

  return (
    <FlatList
      data={filtered}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = REPORT_STATUS_COLOR[item.status];
        const catColor = REPORT_CATEGORY_COLOR[item.category];
        const fmtColor = REPORT_FORMAT_COLOR[item.format];
        return (
          <Pressable
            style={[s.libraryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectReport(item);
            }}
          >
            <View style={s.libraryCardTop}>
              <ThemedText style={[s.libraryCardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
              <View style={s.badgeRow}>
                <StatusBadge label={REPORT_CATEGORY_LABEL[item.category].toUpperCase()} color={catColor} />
                <StatusBadge label={statusLabel(item.status).toUpperCase()} color={stColor} />
                <StatusBadge label={item.format.toUpperCase()} color={fmtColor} />
              </View>
            </View>
            <View style={[s.libraryCardMeta, { borderTopColor: colors.border }]}>
              <View style={s.libraryMetaLeft}>
                <ThemedText style={[s.libraryMetaText, { color: colors.textSecondary }]}>
                  {item.entityName}
                </ThemedText>
                <ThemedText style={[s.libraryMetaDot, { color: colors.textTertiary }]}>·</ThemedText>
                <ThemedText style={[s.libraryMetaText, { color: colors.textSecondary }]}>
                  {item.period}
                </ThemedText>
              </View>
              <View style={s.libraryMetaRight}>
                {item.generatedDate && (
                  <ThemedText style={[s.libraryMetaDate, { color: colors.textTertiary }]}>
                    {formatDateStr(item.generatedDate)}
                  </ThemedText>
                )}
                {item.size && (
                  <ThemedText style={[s.libraryMetaSize, { color: colors.textTertiary }]}>
                    {item.size}
                  </ThemedText>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text" label="No reports found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DASHBOARDS TAB
// =============================================================================

function DashboardsTab({
  colors,
  accentColor,
  tiles,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  tiles: DashboardTile[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Readiness Indicators */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Readiness
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Track how complete each dashboard or deliverable is before sharing.
      </ThemedText>
      {DASHBOARDS_READINESS.map((dash) => {
        const barColor = readinessColor(dash.readiness);
        return (
          <View
            key={dash.id}
            style={[s.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <ThemedText style={[{ fontSize: 14, fontWeight: '700', color: colors.text }]}>
                {dash.label}
              </ThemedText>
              <StatusBadge label={dash.audience.toUpperCase()} color={barColor} />
            </View>
            {/* Progress bar */}
            <View style={[s.dashboardReadiness, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={{
                  width: `${dash.readiness}%`,
                  height: '100%',
                  backgroundColor: barColor,
                  borderRadius: BorderRadius.full,
                }}
              />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <ThemedText style={{ fontSize: 11, fontWeight: '600', color: barColor }}>
                {dash.readiness}%
              </ThemedText>
              <ThemedText style={{ fontSize: 11, color: colors.textTertiary }}>
                Updated {dash.lastUpdated}
              </ThemedText>
            </View>
          </View>
        );
      })}

      {/* Configurable Tiles */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Configurable Dashboards
      </ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Quick-access tiles linking to live data views across all organization tabs.
      </ThemedText>

      <View style={s.dashTileGrid}>
        {tiles.map((tile) => (
          <Pressable
            key={tile.id}
            style={[s.dashTile, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.dashTileIconWrap, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name={tile.icon as any} size={22} color={accentColor} />
            </View>
            <ThemedText style={[s.dashTileTitle, { color: colors.text }]} numberOfLines={1}>
              {tile.title}
            </ThemedText>
            <ThemedText style={[s.dashTileDesc, { color: colors.textSecondary }]} numberOfLines={3}>
              {tile.description}
            </ThemedText>
            <View style={s.dashTileLink}>
              <ThemedText style={[s.dashTileLinkText, { color: colors.textTertiary }]}>
                {tile.linkedTab} / {tile.linkedSubTab}
              </ThemedText>
              <IconSymbol name="arrow.right" size={10} color={colors.textTertiary} />
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// CATEGORY TAB (Finance, Rails, Operations, Compliance & Legal, People, Assets, Media & Proof)
// =============================================================================

function CategoryTab({
  colors,
  accentColor,
  category,
  reports,
  templates,
  searchQuery,
  onSelectReport,
  onGenerate,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  category: ReportCategory;
  reports: ReportItem[];
  templates: ReportTemplate[];
  searchQuery: string;
  onSelectReport: (report: ReportItem) => void;
  onGenerate: (template: ReportTemplate) => void;
}) {
  const catReports = useMemo(() => {
    let result = reports.filter((r) => r.category === category);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          r.period.toLowerCase().includes(q),
      );
    }
    return result;
  }, [reports, category, searchQuery]);

  const catTemplates = useMemo(
    () => templates.filter((t) => t.category === category),
    [templates, category],
  );

  const catColor = REPORT_CATEGORY_COLOR[category];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Report templates */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
        Report Templates
      </ThemedText>
      {catTemplates.map((tmpl) => (
        <View
          key={tmpl.id}
          style={[s.templateCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.templateCardTop}>
            <View style={[s.templateIconWrap, { backgroundColor: catColor + '15' }]}>
              <IconSymbol name={tmpl.icon as any} size={18} color={catColor} />
            </View>
            <View style={s.templateInfo}>
              <ThemedText style={[s.templateTitle, { color: colors.text }]} numberOfLines={1}>
                {tmpl.title}
              </ThemedText>
              <ThemedText style={[s.templateDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {tmpl.description}
              </ThemedText>
            </View>
          </View>
          <View style={[s.templateCardBottom, { borderTopColor: colors.border }]}>
            <View style={s.templateMetaRow}>
              <StatusBadge label={tmpl.defaultFormat.toUpperCase()} color={REPORT_FORMAT_COLOR[tmpl.defaultFormat]} />
              <ThemedText style={[s.templateTime, { color: colors.textTertiary }]}>
                ~{tmpl.estimatedTime}
              </ThemedText>
            </View>
            <Pressable
              style={[s.generateButton, { backgroundColor: accentColor }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onGenerate(tmpl);
              }}
            >
              <IconSymbol name="play.fill" size={10} color="#000" />
              <ThemedText style={s.generateButtonText}>Generate</ThemedText>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Existing reports */}
      {catReports.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Generated Reports ({catReports.length})
          </ThemedText>
          {catReports.map((report) => {
            const stColor = REPORT_STATUS_COLOR[report.status];
            const fmtColor = REPORT_FORMAT_COLOR[report.format];
            return (
              <Pressable
                key={report.id}
                style={[s.libraryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectReport(report);
                }}
              >
                <View style={s.libraryCardTop}>
                  <ThemedText style={[s.libraryCardTitle, { color: colors.text }]} numberOfLines={2}>
                    {report.title}
                  </ThemedText>
                  <View style={s.badgeRow}>
                    <StatusBadge label={report.type.toUpperCase()} color={catColor} />
                    <StatusBadge label={statusLabel(report.status).toUpperCase()} color={stColor} />
                    <StatusBadge label={report.format.toUpperCase()} color={fmtColor} />
                  </View>
                </View>
                <View style={[s.libraryCardMeta, { borderTopColor: colors.border }]}>
                  <ThemedText style={[s.libraryMetaText, { color: colors.textSecondary }]}>
                    {report.entityName} · {report.period}
                  </ThemedText>
                  <View style={s.libraryMetaRight}>
                    {report.generatedDate && (
                      <ThemedText style={[s.libraryMetaDate, { color: colors.textTertiary }]}>
                        {formatDateStr(report.generatedDate)}
                      </ThemedText>
                    )}
                    {report.size && (
                      <ThemedText style={[s.libraryMetaSize, { color: colors.textTertiary }]}>
                        {report.size}
                      </ThemedText>
                    )}
                  </View>
                </View>
              </Pressable>
            );
          })}
        </>
      )}

      {catReports.length === 0 && catTemplates.length > 0 && (
        <View style={s.emptyContainer}>
          <IconSymbol name="doc.text" size={32} color={colors.textTertiary} />
          <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
            No generated reports yet. Use a template above to create one.
          </ThemedText>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// DATA ROOM TAB
// =============================================================================

function DataRoomTab({
  colors,
  accentColor,
  documents,
  searchQuery,
  onSelectDocument,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  documents: DataRoomDocument[];
  searchQuery: string;
  onSelectDocument: (doc: DataRoomDocument) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.section.toLowerCase().includes(q) ||
        d.format.toLowerCase().includes(q),
    );
  }, [documents, searchQuery]);

  // Group by section
  const grouped = useMemo(() => {
    const groups: { section: string; docs: DataRoomDocument[] }[] = [];
    for (const sec of DATA_ROOM_SECTIONS) {
      const docs = filtered.filter((d) => d.section === sec);
      if (docs.length > 0) {
        groups.push({ section: sec, docs });
      }
    }
    return groups;
  }, [filtered]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.section}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.dataRoomGroup}>
          <View style={s.dataRoomGroupHeader}>
            <IconSymbol name="folder.fill" size={14} color={accentColor} />
            <ThemedText style={[s.dataRoomGroupTitle, { color: colors.text }]}>
              {group.section}
            </ThemedText>
            <ThemedText style={[s.dataRoomGroupCount, { color: colors.textTertiary }]}>
              {group.docs.length}
            </ThemedText>
          </View>
          {group.docs.map((doc) => {
            const accessColor = ACCESS_LEVEL_COLOR[doc.accessLevel];
            return (
              <Pressable
                key={doc.id}
                style={[s.dataRoomCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectDocument(doc);
                }}
              >
                <View style={s.dataRoomCardTop}>
                  <ThemedText style={[s.dataRoomDocName, { color: colors.text }]} numberOfLines={2}>
                    {doc.name}
                  </ThemedText>
                  <View style={s.badgeRow}>
                    <StatusBadge label={ACCESS_LEVEL_LABEL[doc.accessLevel].toUpperCase()} color={accessColor} />
                    <StatusBadge label={doc.format} color={accentColor} />
                  </View>
                </View>
                <View style={[s.dataRoomCardMeta, { borderTopColor: colors.border }]}>
                  <View style={s.dataRoomMetaLeft}>
                    <ThemedText style={[s.dataRoomMetaText, { color: colors.textSecondary }]}>
                      {doc.version}
                    </ThemedText>
                    <ThemedText style={[s.libraryMetaDot, { color: colors.textTertiary }]}>·</ThemedText>
                    <ThemedText style={[s.dataRoomMetaText, { color: colors.textTertiary }]}>
                      {formatDateStr(doc.lastUpdated)}
                    </ThemedText>
                  </View>
                  <ThemedText style={[s.dataRoomMetaSize, { color: colors.textTertiary }]}>
                    {doc.size}
                  </ThemedText>
                </View>
                {/* Action indicators */}
                <View style={s.dataRoomActions}>
                  <View style={s.dataRoomActionChip}>
                    <IconSymbol name="square.and.arrow.up" size={11} color={colors.textSecondary} />
                    <ThemedText style={[s.dataRoomActionText, { color: colors.textSecondary }]}>
                      Share
                    </ThemedText>
                  </View>
                  <View style={s.dataRoomActionChip}>
                    <IconSymbol name="arrow.down.circle" size={11} color={colors.textSecondary} />
                    <ThemedText style={[s.dataRoomActionText, { color: colors.textSecondary }]}>
                      Download
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="folder" label="No data room documents found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PACK BUILDER TAB
// =============================================================================

function PackBuilderTab({
  colors,
  accentColor,
  templates,
  selectedPackId,
  sectionOverrides,
  onSelectPack,
  onToggleSection,
  onPreview,
  onExport,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  templates: PackTemplate[];
  selectedPackId: string;
  sectionOverrides: Record<string, Record<string, boolean>>;
  onSelectPack: (id: string) => void;
  onToggleSection: (packId: string, sectionId: string) => void;
  onPreview: () => void;
  onExport: () => void;
}) {
  const selectedPack = useMemo(
    () => templates.find((t) => t.id === selectedPackId) ?? templates[0],
    [templates, selectedPackId],
  );

  const sectionsWithOverrides = useMemo(() => {
    if (!selectedPack) return [];
    const overrides = sectionOverrides[selectedPack.id] ?? {};
    return selectedPack.sections.map((sec) => ({
      ...sec,
      selected: overrides[sec.id] !== undefined ? overrides[sec.id] : sec.selected,
    }));
  }, [selectedPack, sectionOverrides]);

  const selectedCount = sectionsWithOverrides.filter((s) => s.selected).length;

  if (!selectedPack) return <EmptyState icon="doc.on.doc" label="No pack templates" colors={colors} />;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Pack selector */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Select Pack Template</ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.packSelectorRow}
      >
        {templates.map((tmpl) => {
          const isActive = tmpl.id === selectedPack.id;
          return (
            <Pressable
              key={tmpl.id}
              style={[
                s.packSelectorPill,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelectPack(tmpl.id);
              }}
            >
              <ThemedText
                style={[s.packSelectorText, { color: isActive ? accentColor : colors.textSecondary }]}
              >
                {tmpl.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pack info */}
      <View style={[s.packInfoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.packInfoTitle, { color: colors.text }]}>
          {selectedPack.name}
        </ThemedText>
        <ThemedText style={[s.packInfoDesc, { color: colors.textSecondary }]}>
          {selectedPack.description}
        </ThemedText>
        {selectedPack.lastBuilt && (
          <View style={s.packInfoMeta}>
            <IconSymbol name="clock" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.packInfoMetaText, { color: colors.textTertiary }]}>
              Last built: {formatDateStr(selectedPack.lastBuilt)}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Section checklist */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.md }]}>
        Sections ({selectedCount} / {sectionsWithOverrides.length} selected)
      </ThemedText>
      {sectionsWithOverrides.map((section) => (
        <View
          key={section.id}
          style={[s.sectionCheckRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <Switch
            value={section.selected}
            onValueChange={() => onToggleSection(selectedPack.id, section.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={section.selected ? accentColor : colors.textTertiary}
            style={s.sectionSwitch}
          />
          <View style={s.sectionCheckInfo}>
            <ThemedText style={[s.sectionCheckTitle, { color: colors.text }]}>
              {section.title}
            </ThemedText>
            <ThemedText style={[s.sectionCheckDesc, { color: colors.textTertiary }]} numberOfLines={2}>
              {section.description}
            </ThemedText>
            <ThemedText style={[s.sectionCheckSource, { color: colors.textTertiary }]}>
              Source: {section.sourceTab}
            </ThemedText>
          </View>
        </View>
      ))}

      {/* Bottom actions */}
      <View style={s.packActions}>
        <Pressable
          style={[s.packActionButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPreview();
          }}
        >
          <IconSymbol name="eye" size={16} color={colors.textSecondary} />
          <ThemedText style={[s.packActionButtonText, { color: colors.textSecondary }]}>
            Preview
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.packActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onExport();
          }}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color="#000" />
          <ThemedText style={[s.packActionButtonText, { color: '#000' }]}>
            Export PDF
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// EXPORTS TAB
// =============================================================================

function ExportsTab({
  colors,
  accentColor,
  exportLog,
  searchQuery,
  onExportAll,
  role = 'B1',
}: {
  colors: typeof Colors.light;
  accentColor: string;
  exportLog: ExportLogEntry[];
  searchQuery: string;
  onExportAll: () => void;
  role?: BusinessRoleLens;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return exportLog;
    const q = searchQuery.toLowerCase();
    return exportLog.filter(
      (e) =>
        e.reportTitle.toLowerCase().includes(q) ||
        e.exportedBy.toLowerCase().includes(q) ||
        e.format.toLowerCase().includes(q),
    );
  }, [exportLog, searchQuery]);

  return (
    <View style={s.exportsContainer}>
      {/* Export All button */}
      <View style={s.exportAllRow}>
        <Pressable
          style={[s.exportAllButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onExportAll();
          }}
        >
          <IconSymbol name="square.and.arrow.up" size={16} color="#000" />
          <ThemedText style={s.exportAllButtonText}>Export All Reports</ThemedText>
        </Pressable>
      </View>

      {/* Export log */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[s.exportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.exportCardTop}>
              <ThemedText style={[s.exportCardTitle, { color: colors.text }]} numberOfLines={2}>
                {item.reportTitle}
              </ThemedText>
              <StatusBadge label={item.format} color={REPORT_FORMAT_COLOR[item.format.toLowerCase() as ReportItem['format']] ?? accentColor} />
            </View>

            <View style={s.exportCardMeta}>
              <View style={s.exportMetaRow}>
                <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.exportMetaText, { color: colors.textSecondary }]}>
                  {item.exportedBy}
                </ThemedText>
              </View>
              <View style={s.exportMetaRow}>
                <IconSymbol name="clock" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.exportMetaText, { color: colors.textTertiary }]}>
                  {item.timestamp}
                </ThemedText>
              </View>
            </View>

            {/* Accessed by */}
            {item.accessedBy.length > 0 && (
              <View style={[s.exportAccessedSection, { borderTopColor: colors.border }]}>
                <ThemedText style={[s.exportAccessedLabel, { color: colors.textTertiary }]}>
                  Accessed by:
                </ThemedText>
                <View style={s.exportAccessedList}>
                  {item.accessedBy.map((person, idx) => (
                    <View key={idx} style={s.exportAccessedRow}>
                      <View style={[s.exportAccessedDot, { backgroundColor: accentColor }]} />
                      <ThemedText style={[s.exportAccessedName, { color: colors.textSecondary }]}>
                        {person}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <EmptyState icon="square.and.arrow.up" label="No export history" colors={colors} />
        }
        ListFooterComponent={
          isFounder(role) ? (
            <View style={{ marginTop: Spacing.lg }}>
              <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Audit Log</ThemedText>
              <View style={[s.changeLogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {AUDIT_LOG.map((entry, idx) => (
                  <View
                    key={entry.id}
                    style={[
                      s.auditLogRow,
                      idx < AUDIT_LOG.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                    ]}
                  >
                    <View style={[s.auditLogIcon, { backgroundColor: accentColor + '15' }]}>
                      <IconSymbol
                        name={AUDIT_ACTION_ICON[entry.action] as any}
                        size={14}
                        color={accentColor}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[s.auditLogText, { color: colors.text }]}>
                        <ThemedText style={{ fontWeight: '700', color: colors.text }}>{entry.actor}</ThemedText>
                        {' '}{entry.action}{' '}
                        <ThemedText style={{ fontWeight: '600', color: colors.text }}>{entry.reportLabel}</ThemedText>
                      </ThemedText>
                      <ThemedText style={{ fontSize: 11, color: colors.textTertiary, marginTop: 2 }}>
                        {entry.timestamp}
                      </ThemedText>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// =============================================================================
// REPORT DETAIL SHEET
// =============================================================================

function ReportDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: ReportItem | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const stColor = REPORT_STATUS_COLOR[report.status];
  const catColor = REPORT_CATEGORY_COLOR[report.category];
  const fmtColor = REPORT_FORMAT_COLOR[report.format];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.title} useModal>
      {/* Status + format badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={REPORT_CATEGORY_LABEL[report.category].toUpperCase()} color={catColor} />
        <StatusBadge label={statusLabel(report.status).toUpperCase()} color={stColor} />
        <StatusBadge label={report.format.toUpperCase()} color={fmtColor} />
      </View>

      {/* Type */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Report Type</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.type}
        </ThemedText>
      </View>

      {/* Entity */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Entity</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.entityName}
        </ThemedText>
      </View>

      {/* Period */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
        </ThemedText>
      </View>

      {/* Generated date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Generated</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.generatedDate ? formatDateStr(report.generatedDate) : 'Not yet generated'}
        </ThemedText>
      </View>

      {/* Size */}
      {report.size && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>File Size</ThemedText>
          <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
            {report.size}
          </ThemedText>
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        {report.status === 'generated' && (
          <Pressable
            style={[s.sheetActionButton, { backgroundColor: accentColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <ThemedText style={s.sheetActionButtonText}>View Full Report</ThemedText>
          </Pressable>
        )}
        {report.status === 'draft' && (
          <Pressable
            style={[s.sheetActionButton, { backgroundColor: accentColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <ThemedText style={s.sheetActionButtonText}>Continue Editing</ThemedText>
          </Pressable>
        )}
        {report.status === 'failed' && (
          <Pressable
            style={[s.sheetActionButton, { backgroundColor: '#EF4444' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onClose();
            }}
          >
            <ThemedText style={s.sheetActionButtonText}>Retry Generation</ThemedText>
          </Pressable>
        )}
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// DATA ROOM DETAIL SHEET
// =============================================================================

function DataRoomDetailSheet({
  visible,
  onClose,
  doc,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  doc: DataRoomDocument | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!doc) return null;

  const accessColor = ACCESS_LEVEL_COLOR[doc.accessLevel];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={doc.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={doc.section.toUpperCase()} color={accentColor} />
        <StatusBadge label={ACCESS_LEVEL_LABEL[doc.accessLevel].toUpperCase()} color={accessColor} />
        <StatusBadge label={doc.format} color={accentColor} />
      </View>

      {/* Version */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Version</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {doc.version}
        </ThemedText>
      </View>

      {/* Last Updated */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Last Updated</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {formatDateStr(doc.lastUpdated)}
        </ThemedText>
      </View>

      {/* Size */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>File Size</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {doc.size}
        </ThemedText>
      </View>

      {/* Access Level */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Access Level</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: accessColor }]}>
          {ACCESS_LEVEL_LABEL[doc.accessLevel]}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Download</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Share
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// PACK PREVIEW SHEET
// =============================================================================

function PackPreviewSheet({
  visible,
  onClose,
  pack,
  sections,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  pack: PackTemplate | null;
  sections: PackSection[];
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!pack) return null;

  const selectedSections = sections.filter((s) => s.selected);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={`${pack.name} — Preview`} useModal>
      <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
        {pack.description}
      </ThemedText>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>
          Included Sections ({selectedSections.length})
        </ThemedText>
        {selectedSections.map((section, idx) => (
          <View key={section.id} style={s.sheetSectionListItem}>
            <ThemedText style={[s.sheetSectionListIndex, { color: colors.textTertiary }]}>
              {idx + 1}.
            </ThemedText>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.sheetSectionBody, { color: colors.text }]}>
                {section.title}
              </ThemedText>
              <ThemedText style={[s.previewSectionDesc, { color: colors.textTertiary }]}>
                {section.description}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      {selectedSections.length === 0 && (
        <ThemedText style={[s.sheetSectionBody, { color: colors.textTertiary, textAlign: 'center' }]}>
          No sections selected. Toggle sections on the Pack Builder tab.
        </ThemedText>
      )}

      {pack.lastBuilt && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Last Built</ThemedText>
          <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
            {formatDateStr(pack.lastBuilt)}
          </ThemedText>
        </View>
      )}

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Export PDF</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Close Preview
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// GENERATE CONFIRMATION SHEET
// =============================================================================

function GenerateSheet({
  visible,
  onClose,
  template,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  template: ReportTemplate | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!template) return null;

  const catColor = REPORT_CATEGORY_COLOR[template.category];
  const fmtColor = REPORT_FORMAT_COLOR[template.defaultFormat];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Generate Report" useModal>
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={REPORT_CATEGORY_LABEL[template.category].toUpperCase()} color={catColor} />
        <StatusBadge label={template.defaultFormat.toUpperCase()} color={fmtColor} />
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Template</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {template.title}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {template.description}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Estimated Time</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          ~{template.estimatedTime}
        </ThemedText>
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Start Generation</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Cancel
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function BizOrgReportsV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: B3/B4 locked ===
  if (!isFounder(role) && !isInvestor(role) && role !== 'B5') {
    return <BizEmptyLock title="Reports" message="This section is restricted. Contact the Founder for access." />;
  }

  // === Entity scope integration ===
  const { selectedEntityId } = useBusiness();
  // TODO: Filter reports / dashboards / data room by selectedEntityId when backend is ready

  // === Time range & compare state ===
  const [timeRange, setTimeRange] = useState('30d');
  const [comparePrior, setComparePrior] = useState(false);

  // === Sub-tab state ===
  const [activeTab, setActiveTab] = useState<BizReportsV2TabId>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ReportCategory | 'all'>('all');

  // Detail sheet states
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);
  const [showReportDetail, setShowReportDetail] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DataRoomDocument | null>(null);
  const [showDocumentDetail, setShowDocumentDetail] = useState(false);

  // Pack builder state
  const [selectedPackId, setSelectedPackId] = useState('pack-01');
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, Record<string, boolean>>>({});
  const [showPackPreview, setShowPackPreview] = useState(false);

  // Generate sheet state
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showGenerateSheet, setShowGenerateSheet] = useState(false);

  // === Data ===
  const data = useMemo(() => getBizReportsData(), []);

  // === Category filter chips ===
  const categoryFilterChips: { id: ReportCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'finance', label: 'Finance' },
    { id: 'rails', label: 'Rails' },
    { id: 'operations', label: 'Ops' },
    { id: 'compliance_legal', label: 'Compliance' },
    { id: 'people', label: 'People' },
    { id: 'assets', label: 'Assets' },
    { id: 'media_proof', label: 'Media' },
  ];

  // Pack sections with overrides for preview
  const currentPackSections = useMemo(() => {
    const pack = data.packTemplates.find((t) => t.id === selectedPackId) ?? data.packTemplates[0];
    if (!pack) return [];
    const overrides = sectionOverrides[pack.id] ?? {};
    return pack.sections.map((sec) => ({
      ...sec,
      selected: overrides[sec.id] !== undefined ? overrides[sec.id] : sec.selected,
    }));
  }, [data.packTemplates, selectedPackId, sectionOverrides]);

  const currentPack = useMemo(
    () => data.packTemplates.find((t) => t.id === selectedPackId) ?? data.packTemplates[0],
    [data.packTemplates, selectedPackId],
  );

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId as BizReportsV2TabId);
    setSearchQuery('');
  }, []);

  const handleSelectReport = useCallback((report: ReportItem) => {
    setSelectedReport(report);
    setShowReportDetail(true);
  }, []);

  const handleSelectDocument = useCallback((doc: DataRoomDocument) => {
    setSelectedDocument(doc);
    setShowDocumentDetail(true);
  }, []);

  const handleSelectPack = useCallback((id: string) => {
    setSelectedPackId(id);
  }, []);

  const handleToggleSection = useCallback((packId: string, sectionId: string) => {
    setSectionOverrides((prev) => {
      const packOverrides = prev[packId] ?? {};
      const pack = data.packTemplates.find((t) => t.id === packId);
      const section = pack?.sections.find((s) => s.id === sectionId);
      const currentVal = packOverrides[sectionId] !== undefined
        ? packOverrides[sectionId]
        : section?.selected ?? false;
      return {
        ...prev,
        [packId]: {
          ...packOverrides,
          [sectionId]: !currentVal,
        },
      };
    });
  }, [data.packTemplates]);

  const handlePreviewPack = useCallback(() => {
    setShowPackPreview(true);
  }, []);

  const handleExportPack = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleExportAll = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const handleGenerate = useCallback((template: ReportTemplate) => {
    setSelectedTemplate(template);
    setShowGenerateSheet(true);
  }, []);

  const handleCategoryFilter = useCallback((id: ReportCategory | 'all') => {
    Haptics.selectionAsync();
    setCategoryFilter(id);
  }, []);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <OverviewTab
            colors={colors}
            accentColor={accentColor}
            stats={data.overviewStats}
            reports={data.reports}
          />
        );

      case 'library':
        return (
          <View style={s.libraryContainer}>
            {/* Category filter chips */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ flexGrow: 0 }}
              contentContainerStyle={s.filterChipRow}
            >
              {categoryFilterChips.map((chip) => {
                const isActive = chip.id === categoryFilter;
                return (
                  <Pressable
                    key={chip.id}
                    style={[
                      s.filterChip,
                      {
                        backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary,
                        borderColor: isActive ? accentColor + '40' : 'transparent',
                      },
                    ]}
                    onPress={() => handleCategoryFilter(chip.id)}
                  >
                    <ThemedText
                      style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}
                    >
                      {chip.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
            <LibraryTab
              colors={colors}
              accentColor={accentColor}
              reports={data.reports}
              searchQuery={searchQuery}
              categoryFilter={categoryFilter}
              onSelectReport={handleSelectReport}
            />
          </View>
        );

      case 'dashboards':
        return (
          <DashboardsTab
            colors={colors}
            accentColor={accentColor}
            tiles={data.dashboardTiles}
          />
        );

      case 'finance':
      case 'rails':
      case 'operations':
      case 'compliance_legal':
      case 'people':
      case 'assets':
      case 'media_proof': {
        const cat = categoryForTab(activeTab);
        if (!cat) return null;
        return (
          <CategoryTab
            colors={colors}
            accentColor={accentColor}
            category={cat}
            reports={data.reports}
            templates={data.reportTemplates}
            searchQuery={searchQuery}
            onSelectReport={handleSelectReport}
            onGenerate={handleGenerate}
          />
        );
      }

      case 'data_room':
        return (
          <DataRoomTab
            colors={colors}
            accentColor={accentColor}
            documents={data.dataRoom}
            searchQuery={searchQuery}
            onSelectDocument={handleSelectDocument}
          />
        );

      case 'pack_builder':
        return (
          <PackBuilderTab
            colors={colors}
            accentColor={accentColor}
            templates={data.packTemplates}
            selectedPackId={selectedPackId}
            sectionOverrides={sectionOverrides}
            onSelectPack={handleSelectPack}
            onToggleSection={handleToggleSection}
            onPreview={handlePreviewPack}
            onExport={handleExportPack}
          />
        );

      case 'exports':
        return (
          <ExportsTab
            colors={colors}
            accentColor={accentColor}
            exportLog={data.exportLog}
            searchQuery={searchQuery}
            onExportAll={handleExportAll}
            role={role}
          />
        );

      default:
        return null;
    }
  };

  // === Sub-tab pill data for BizSubTabBar (RBAC-aware) ===
  const subTabs = useMemo(() => {
    const all = BIZ_REPORTS_V2_TABS.map((t) => ({ id: t.id, label: t.label }));
    if (isFounder(role)) return all;
    if (isBoardLevel(role)) return all; // Board: full access
    // B2a / B5: overview + data_room only
    return all.filter((t) => t.id === 'overview' || t.id === 'data_room');
  }, [role]);

  // === Render ===
  return (
    <View style={s.container}>
      {/* Time Range Selector */}
      <View style={s.timeRangeRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={{ gap: 6, paddingRight: Spacing.sm }}
        >
          {TIME_RANGES.map((tr) => {
            const isActive = tr.id === timeRange;
            return (
              <Pressable
                key={tr.id}
                style={[
                  s.timeRangePill,
                  isActive && [s.timeRangePillActive, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }],
                ]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setTimeRange(tr.id);
                }}
              >
                <ThemedText
                  style={[
                    s.timeRangePillText,
                    { color: isActive ? accentColor : colors.textSecondary },
                  ]}
                >
                  {tr.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          style={[
            s.compareToggle,
            comparePrior && [s.compareToggleActive, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }],
          ]}
          onPress={() => {
            Haptics.selectionAsync();
            setComparePrior((prev) => !prev);
          }}
        >
          <ThemedText
            style={[
              s.timeRangePillText,
              { color: comparePrior ? accentColor : colors.textSecondary },
            ]}
          >
            vs Prior
          </ThemedText>
        </Pressable>
      </View>

      {/* Sub-tab bar */}
      <BizSubTabBar
        tabs={subTabs}
        activeId={activeTab}
        onSelect={handleTabPress}
      />

      {/* Search bar (visible on Library, category tabs, Data Room, Exports) */}
      {(activeTab === 'library' ||
        activeTab === 'data_room' ||
        activeTab === 'exports' ||
        activeTab === 'finance' ||
        activeTab === 'rails' ||
        activeTab === 'operations' ||
        activeTab === 'compliance_legal' ||
        activeTab === 'people' ||
        activeTab === 'assets' ||
        activeTab === 'media_proof') && (
        <View style={s.searchContainer}>
          <View
            style={[
              s.searchBar,
              { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
            ]}
          >
            <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search reports\u2026"
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Detail Bottom Sheets */}
      <ReportDetailSheet
        visible={showReportDetail}
        onClose={() => setShowReportDetail(false)}
        report={selectedReport}
        colors={colors}
        accentColor={accentColor}
      />
      <DataRoomDetailSheet
        visible={showDocumentDetail}
        onClose={() => setShowDocumentDetail(false)}
        doc={selectedDocument}
        colors={colors}
        accentColor={accentColor}
      />
      <PackPreviewSheet
        visible={showPackPreview}
        onClose={() => setShowPackPreview(false)}
        pack={currentPack}
        sections={currentPackSections}
        colors={colors}
        accentColor={accentColor}
      />
      <GenerateSheet
        visible={showGenerateSheet}
        onClose={() => setShowGenerateSheet(false)}
        template={selectedTemplate}
        colors={colors}
        accentColor={accentColor}
      />
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
  contentContainer: {
    flex: 1,
  },

  // -- Search --
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.md,
  },

  // -- Badges --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // =========================================================================
  // OVERVIEW TAB
  // =========================================================================
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  statCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  statCardLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statCardValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Category links
  categoryList: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
  },

  // Recent generation
  recentList: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  recentRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.sm,
    marginRight: Spacing.sm,
  },
  recentStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentRowInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  recentMeta: {
    fontSize: 11,
    marginTop: 2,
  },

  // =========================================================================
  // LIBRARY TAB
  // =========================================================================
  libraryContainer: {
    flex: 1,
  },
  filterChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  libraryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  libraryCardTop: {
    padding: Spacing.md,
  },
  libraryCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  libraryCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  libraryMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 4,
  },
  libraryMetaRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  libraryMetaText: {
    fontSize: 12,
  },
  libraryMetaDot: {
    fontSize: 12,
  },
  libraryMetaDate: {
    fontSize: 11,
  },
  libraryMetaSize: {
    fontSize: 11,
  },

  // =========================================================================
  // DASHBOARDS TAB
  // =========================================================================
  dashTileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dashTile: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  dashTileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  dashTileTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  dashTileDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },
  dashTileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dashTileLinkText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // =========================================================================
  // CATEGORY TAB — TEMPLATES
  // =========================================================================
  templateCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  templateCardTop: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  templateIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  templateCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  templateMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  templateTime: {
    fontSize: 11,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  generateButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000',
  },

  // =========================================================================
  // DATA ROOM TAB
  // =========================================================================
  dataRoomGroup: {
    marginBottom: Spacing.lg,
  },
  dataRoomGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  dataRoomGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  dataRoomGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  dataRoomCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  dataRoomCardTop: {
    padding: Spacing.md,
  },
  dataRoomDocName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  dataRoomCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  dataRoomMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataRoomMetaText: {
    fontSize: 12,
  },
  dataRoomMetaSize: {
    fontSize: 11,
  },
  dataRoomActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  dataRoomActionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataRoomActionText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // =========================================================================
  // PACK BUILDER TAB
  // =========================================================================
  packSelectorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  packSelectorPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  packSelectorText: {
    fontSize: 13,
    fontWeight: '600',
  },
  packInfoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  packInfoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  packInfoDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  packInfoMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  packInfoMetaText: {
    fontSize: 12,
  },

  // Section checklist
  sectionCheckRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionSwitch: {
    marginTop: 2,
  },
  sectionCheckInfo: {
    flex: 1,
  },
  sectionCheckTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionCheckDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  sectionCheckSource: {
    fontSize: 11,
    marginTop: 4,
  },

  // Pack actions
  packActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  packActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  packActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // =========================================================================
  // EXPORTS TAB
  // =========================================================================
  exportsContainer: {
    flex: 1,
  },
  exportAllRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  exportAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  exportAllButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  exportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  exportCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: Spacing.md,
  },
  exportCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  exportCardMeta: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: 4,
  },
  exportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportMetaText: {
    fontSize: 12,
  },
  exportAccessedSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  exportAccessedLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  exportAccessedList: {
    gap: 2,
  },
  exportAccessedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  exportAccessedDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  exportAccessedName: {
    fontSize: 12,
  },

  // =========================================================================
  // BOTTOM SHEET STYLES
  // =========================================================================
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetSection: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetSectionListItem: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  sheetSectionListIndex: {
    fontSize: 13,
    fontWeight: '600',
    width: 22,
    textAlign: 'right',
  },
  previewSectionDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // =========================================================================
  // TIME RANGE SELECTOR
  // =========================================================================
  timeRangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  timeRangePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timeRangePillActive: {
    // backgroundColor and borderColor applied inline
  },
  timeRangePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  compareToggle: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  compareToggleActive: {
    // backgroundColor and borderColor applied inline
  },

  // =========================================================================
  // TRUTH STRIP
  // =========================================================================
  truthStrip: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  truthStripItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  truthStripDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // =========================================================================
  // WHAT CHANGED (CHANGE LOG)
  // =========================================================================
  changeLogCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  changeLogRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  changeLogDate: {
    fontSize: 12,
    fontWeight: '700',
    width: 48,
  },
  changeLogDesc: {
    fontSize: 12,
    lineHeight: 17,
    flex: 1,
  },
  changeLogTab: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  // =========================================================================
  // TOP RISKS
  // =========================================================================
  riskCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  riskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderLeftWidth: 3,
    gap: Spacing.sm,
  },
  riskSeverity: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riskLabel: {
    fontSize: 12,
    lineHeight: 17,
  },
  riskSource: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  // =========================================================================
  // DASHBOARD READINESS CARDS
  // =========================================================================
  dashboardCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dashboardReadiness: {
    height: 6,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },

  // =========================================================================
  // AUDIT LOG
  // =========================================================================
  auditLogRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  auditLogIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  auditLogText: {
    fontSize: 13,
    lineHeight: 18,
  },
});
