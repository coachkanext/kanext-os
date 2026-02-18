/**
 * Competition Organization Reports Tab — 10-tab Reports Hub.
 * Dashboard, Operational, Financial, Compliance, Performance,
 * Attendance, Media, Custom, Scheduled, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  COMP_REPORTS_TABS,
  COMP_REPORTS_SCOPE_CHIPS,
  REPORT_STATUS_COLOR,
  FINANCIAL_STATUS_COLOR,
  COMPLIANCE_STATUS_COLOR,
  FORMAT_COLOR,
  FREQUENCY_COLOR,
  MEDIA_TYPE_COLOR,
  formatCurrency,
  getCompReportsData,
} from '@/data/mock-comp-org-reports';
import type {
  CompReportsTabId,
  ReportsDashboardBlock,
  OperationalReport,
  FinancialReport,
  ComplianceReport,
  PerformanceReport,
  AttendanceReport,
  MediaReport,
  CustomReport,
  ScheduledReport,
  ReportSettingToggle,
} from '@/data/mock-comp-org-reports';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function complianceTypeLabel(type: ComplianceReport['type']): string {
  switch (type) {
    case 'eligibility-audit': return 'ELIGIBILITY';
    case 'drug-test-summary': return 'DRUG TEST';
    case 'incident-log': return 'INCIDENTS';
    case 'rules-review': return 'RULES';
    case 'certification-status': return 'CERTIFICATION';
  }
}

function performanceTypeLabel(type: PerformanceReport['type']): string {
  switch (type) {
    case 'standings': return 'STANDINGS';
    case 'statistics': return 'STATISTICS';
    case 'player-rankings': return 'RANKINGS';
    case 'team-analytics': return 'ANALYTICS';
    case 'historical-trends': return 'TRENDS';
  }
}

function financialTypeLabel(type: FinancialReport['type']): string {
  switch (type) {
    case 'p&l': return 'P&L';
    case 'balance-sheet': return 'BALANCE SHEET';
    case 'cash-flow': return 'CASH FLOW';
    case 'budget-variance': return 'BUDGET VAR.';
    case 'revenue-breakdown': return 'REVENUE';
  }
}

function mediaTypeLabel(type: MediaReport['type']): string {
  switch (type) {
    case 'broadcast-reach': return 'BROADCAST';
    case 'social-engagement': return 'SOCIAL';
    case 'press-coverage': return 'PRESS';
    case 'content-performance': return 'CONTENT';
  }
}

function frequencyLabel(freq: ScheduledReport['frequency']): string {
  switch (freq) {
    case 'daily': return 'DAILY';
    case 'weekly': return 'WEEKLY';
    case 'bi-weekly': return 'BI-WEEKLY';
    case 'monthly': return 'MONTHLY';
    case 'quarterly': return 'QUARTERLY';
  }
}

function utilizationColor(pct: number): string {
  if (pct >= 90) return '#22C55E';
  if (pct >= 70) return '#F59E0B';
  if (pct >= 50) return '#3B82F6';
  return '#EF4444';
}

function changeColor(change: number): string {
  if (change > 0) return '#22C55E';
  if (change < 0) return '#EF4444';
  return '#6B7280';
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
// FORMAT BADGE
// =============================================================================

function FormatBadge({ format }: { format: 'PDF' | 'CSV' | 'XLSX' | 'Dashboard' }) {
  const color = FORMAT_COLOR[format];
  return (
    <View style={[s.formatBadge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.formatBadgeText, { color }]}>{format}</ThemedText>
    </View>
  );
}

// =============================================================================
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompReportsData>;
}) {
  // Compute summary stats for the dashboard
  const totalOperational = data.operational.length;
  const totalFinancial = data.financial.length;
  const totalCompliance = data.compliance.length;
  const totalPerformance = data.performance.length;
  const issuesFound = data.compliance.filter((c) => c.status === 'issues-found').length;
  const scheduledActive = data.scheduled.filter((sc) => sc.enabled).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: ReportsDashboardBlock) => (
          <View
            key={block.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={block.icon as any} size={18} color={block.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {block.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{block.value}</ThemedText>
            <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>{block.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Category Breakdown */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Reports by Category
      </ThemedText>
      <View style={[s.breakdownCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {[
          { label: 'Operational', count: totalOperational, color: '#6AA9FF', icon: 'gearshape.2' },
          { label: 'Financial', count: totalFinancial, color: '#22C55E', icon: 'dollarsign.circle' },
          { label: 'Compliance', count: totalCompliance, color: '#F59E0B', icon: 'checkmark.shield' },
          { label: 'Performance', count: totalPerformance, color: '#8B5CF6', icon: 'chart.line.uptrend.xyaxis' },
        ].map((cat, idx, arr) => (
          <View
            key={cat.label}
            style={[
              s.breakdownRow,
              idx < arr.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            <View style={s.breakdownRowLeft}>
              <View style={[s.breakdownIconCircle, { backgroundColor: cat.color + '18' }]}>
                <IconSymbol name={cat.icon as any} size={16} color={cat.color} />
              </View>
              <ThemedText style={[s.breakdownLabel, { color: colors.text }]}>{cat.label}</ThemedText>
            </View>
            <ThemedText style={[s.breakdownCount, { color: colors.text }]}>{cat.count}</ThemedText>
          </View>
        ))}
      </View>

      {/* Quick Stats */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Stats
      </ThemedText>
      <View style={s.quickStatsGrid}>
        <View style={[s.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.quickStatValue, { color: '#EF4444' }]}>{issuesFound}</ThemedText>
          <ThemedText style={[s.quickStatLabel, { color: colors.textTertiary }]}>
            Compliance Issues
          </ThemedText>
        </View>
        <View style={[s.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.quickStatValue, { color: '#22C55E' }]}>{scheduledActive}</ThemedText>
          <ThemedText style={[s.quickStatLabel, { color: colors.textTertiary }]}>
            Scheduled Active
          </ThemedText>
        </View>
        <View style={[s.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.quickStatValue, { color: '#8B5CF6' }]}>
            {data.custom.length}
          </ThemedText>
          <ThemedText style={[s.quickStatLabel, { color: colors.textTertiary }]}>
            Custom Reports
          </ThemedText>
        </View>
        <View style={[s.quickStatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.quickStatValue, { color: '#6AA9FF' }]}>
            {data.media.length}
          </ThemedText>
          <ThemedText style={[s.quickStatLabel, { color: colors.textTertiary }]}>
            Media Reports
          </ThemedText>
        </View>
      </View>

      {/* Recent Reports */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recently Generated
      </ThemedText>
      <View style={[s.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.operational.slice(0, 5).map((report, index) => {
          const stColor = REPORT_STATUS_COLOR[report.status];
          return (
            <View
              key={report.id}
              style={[
                s.recentRow,
                index < 4 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={s.recentRowLeft}>
                <View style={[s.recentDot, { backgroundColor: stColor }]} />
                <View style={s.recentTextCol}>
                  <ThemedText style={[s.recentName, { color: colors.text }]} numberOfLines={1}>
                    {report.name}
                  </ThemedText>
                  <ThemedText style={[s.recentMeta, { color: colors.textTertiary }]}>
                    {report.generatedDate} {report.generatedDate ? '\u00B7' : ''} {report.author}
                  </ThemedText>
                </View>
              </View>
              <View style={s.recentRowRight}>
                <FormatBadge format={report.format} />
                <StatusBadge label={report.status.toUpperCase()} color={stColor} />
              </View>
            </View>
          );
        })}
      </View>

      {/* Attendance Highlights */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Top Attendance Events
      </ThemedText>
      <View style={[s.recentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.attendance
          .sort((a, b) => b.attendance - a.attendance)
          .slice(0, 4)
          .map((att, index) => {
            const utColor = utilizationColor(att.utilization);
            return (
              <View
                key={att.id}
                style={[
                  s.recentRow,
                  index < 3 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={s.recentRowLeft}>
                  <View style={[s.recentDot, { backgroundColor: utColor }]} />
                  <View style={s.recentTextCol}>
                    <ThemedText style={[s.recentName, { color: colors.text }]} numberOfLines={1}>
                      {att.event}
                    </ThemedText>
                    <ThemedText style={[s.recentMeta, { color: colors.textTertiary }]}>
                      {att.date} {'\u00B7'} {att.utilization}% capacity
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.attendanceFigure, { color: colors.text }]}>
                  {att.attendance.toLocaleString()}
                </ThemedText>
              </View>
            );
          })}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// OPERATIONAL TAB
// =============================================================================

function OperationalTab({
  colors,
  accentColor,
  data,
  onSelectReport,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: OperationalReport[];
  onSelectReport: (report: OperationalReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = REPORT_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectReport(item);
            }}
          >
            {/* Top row: name */}
            <ThemedText style={[s.reportCardName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </ThemedText>

            {/* Badge row */}
            <View style={s.reportCardBadgeRow}>
              <FormatBadge format={item.format} />
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>

            {/* Series + period */}
            <View style={s.reportCardMetaRow}>
              <View style={s.reportCardMetaItem}>
                <IconSymbol name="folder.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                  {item.series}
                </ThemedText>
              </View>
              <View style={s.reportCardMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                  {item.period}
                </ThemedText>
              </View>
            </View>

            {/* Footer */}
            <View style={[s.reportCardFooter, { borderTopColor: colors.border }]}>
              <View style={s.reportCardFooterLeft}>
                <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary }]}>
                  {item.author}
                </ThemedText>
              </View>
              <View style={s.reportCardFooterRight}>
                {item.generatedDate ? (
                  <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary }]}>
                    {item.generatedDate}
                  </ThemedText>
                ) : null}
                {item.pageCount > 0 && (
                  <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary }]}>
                    {item.pageCount} pages
                  </ThemedText>
                )}
                {item.downloads > 0 && (
                  <View style={s.downloadIndicator}>
                    <IconSymbol name="arrow.down.circle.fill" size={12} color={accentColor} />
                    <ThemedText style={[s.downloadCount, { color: accentColor }]}>
                      {item.downloads}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text.fill" label="No operational reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FINANCIAL TAB
// =============================================================================

function FinancialTab({
  colors,
  accentColor,
  data,
  onSelectFinancial,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: FinancialReport[];
  onSelectFinancial: (report: FinancialReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = FINANCIAL_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectFinancial(item);
            }}
          >
            {/* Name */}
            <ThemedText style={[s.reportCardName, { color: colors.text }]} numberOfLines={2}>
              {item.name}
            </ThemedText>

            {/* Badge row */}
            <View style={s.reportCardBadgeRow}>
              <FormatBadge format={item.format} />
              <StatusBadge label={financialTypeLabel(item.type)} color={accentColor} />
              <StatusBadge label={item.status.replace('-', ' ').toUpperCase()} color={stColor} />
            </View>

            {/* Amount + Period */}
            <View style={s.financialAmountRow}>
              {item.amount > 0 && (
                <ThemedText style={[s.financialAmount, { color: colors.text }]}>
                  {formatCurrency(item.amount)}
                </ThemedText>
              )}
              <ThemedText style={[s.financialPeriod, { color: colors.textSecondary }]}>
                {item.period}
              </ThemedText>
            </View>

            {/* Footer */}
            <View style={[s.reportCardFooter, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary }]}>
                Generated {item.generatedDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="dollarsign.circle.fill" label="No financial reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// COMPLIANCE TAB
// =============================================================================

function ComplianceTab({
  colors,
  accentColor,
  data,
  onSelectCompliance,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ComplianceReport[];
  onSelectCompliance: (report: ComplianceReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = COMPLIANCE_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectCompliance(item);
            }}
          >
            {/* Status stripe for visual urgency */}
            <View style={[s.complianceStripe, { backgroundColor: stColor }]} />

            <View style={s.complianceContent}>
              {/* Name */}
              <ThemedText style={[s.reportCardName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>

              {/* Badge row */}
              <View style={s.reportCardBadgeRow}>
                <StatusBadge label={complianceTypeLabel(item.type)} color={accentColor} />
                <StatusBadge
                  label={item.status.replace('-', ' ').toUpperCase()}
                  color={stColor}
                />
              </View>

              {/* Period + Findings */}
              <View style={s.complianceMeta}>
                <View style={s.reportCardMetaItem}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                    {item.period}
                  </ThemedText>
                </View>
                {item.findings > 0 && (
                  <View style={s.findingsContainer}>
                    <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
                    <ThemedText style={[s.findingsText, { color: '#EF4444' }]}>
                      {item.findings} finding{item.findings !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                )}
              </View>

              {/* Date */}
              <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary, marginTop: 6 }]}>
                Generated {item.generatedDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="checkmark.shield.fill" label="No compliance reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PERFORMANCE TAB
// =============================================================================

function PerformanceTab({
  colors,
  accentColor,
  data,
  onSelectPerformance,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: PerformanceReport[];
  onSelectPerformance: (report: PerformanceReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPerformance(item);
          }}
        >
          {/* Name */}
          <ThemedText style={[s.reportCardName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </ThemedText>

          {/* Badge row */}
          <View style={s.reportCardBadgeRow}>
            <FormatBadge format={item.format} />
            <StatusBadge label={performanceTypeLabel(item.type)} color={accentColor} />
          </View>

          {/* Series + Period */}
          <View style={s.reportCardMetaRow}>
            <View style={s.reportCardMetaItem}>
              <IconSymbol name="sportscourt.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                {item.series}
              </ThemedText>
            </View>
            <View style={s.reportCardMetaItem}>
              <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                {item.period}
              </ThemedText>
            </View>
          </View>

          {/* Date */}
          <View style={[s.reportCardFooter, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary }]}>
              Generated {item.generatedDate}
            </ThemedText>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState icon="chart.line.uptrend.xyaxis" label="No performance reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ATTENDANCE TAB
// =============================================================================

function AttendanceTab({
  colors,
  accentColor,
  data,
  onSelectAttendance,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: AttendanceReport[];
  onSelectAttendance: (report: AttendanceReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const utColor = utilizationColor(item.utilization);
        return (
          <Pressable
            style={[s.attendanceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectAttendance(item);
            }}
          >
            {/* Event name */}
            <ThemedText style={[s.attendanceEventName, { color: colors.text }]} numberOfLines={2}>
              {item.event}
            </ThemedText>

            {/* Venue + Date */}
            <View style={s.attendanceVenueRow}>
              <View style={s.reportCardMetaItem}>
                <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                  {item.venue}
                </ThemedText>
              </View>
              <View style={s.reportCardMetaItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
                  {item.date}
                </ThemedText>
              </View>
            </View>

            {/* Stats row */}
            <View style={[s.attendanceStatsRow, { borderTopColor: colors.border }]}>
              <View style={s.attendanceStat}>
                <ThemedText style={[s.attendanceStatValue, { color: colors.text }]}>
                  {item.attendance.toLocaleString()}
                </ThemedText>
                <ThemedText style={[s.attendanceStatLabel, { color: colors.textTertiary }]}>
                  Attended
                </ThemedText>
              </View>
              <View style={s.attendanceStat}>
                <ThemedText style={[s.attendanceStatValue, { color: colors.text }]}>
                  {item.capacity.toLocaleString()}
                </ThemedText>
                <ThemedText style={[s.attendanceStatLabel, { color: colors.textTertiary }]}>
                  Capacity
                </ThemedText>
              </View>
              <View style={s.attendanceStat}>
                <ThemedText style={[s.attendanceStatValue, { color: utColor }]}>
                  {item.utilization}%
                </ThemedText>
                <ThemedText style={[s.attendanceStatLabel, { color: colors.textTertiary }]}>
                  Util.
                </ThemedText>
              </View>
              <View style={s.attendanceStat}>
                <ThemedText style={[s.attendanceStatValue, { color: '#22C55E' }]}>
                  {formatCurrency(item.revenue)}
                </ThemedText>
                <ThemedText style={[s.attendanceStatLabel, { color: colors.textTertiary }]}>
                  Revenue
                </ThemedText>
              </View>
            </View>

            {/* Utilization bar */}
            <View style={[s.utilizationBarBg, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={[
                  s.utilizationBarFill,
                  { width: `${Math.min(item.utilization, 100)}%`, backgroundColor: utColor },
                ]}
              />
            </View>

            {/* Notes */}
            {item.notes.length > 0 && (
              <ThemedText style={[s.attendanceNotes, { color: colors.textTertiary }]}>
                {item.notes}
              </ThemedText>
            )}
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="person.3.fill" label="No attendance reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MEDIA TAB
// =============================================================================

function MediaTab({
  colors,
  accentColor,
  data,
  onSelectMedia,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: MediaReport[];
  onSelectMedia: (report: MediaReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const typeColor = MEDIA_TYPE_COLOR[item.type];
        const chgColor = changeColor(item.change);
        return (
          <Pressable
            style={[s.mediaCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectMedia(item);
            }}
          >
            {/* Accent stripe */}
            <View style={[s.mediaStripe, { backgroundColor: typeColor }]} />

            <View style={s.mediaContent}>
              {/* Name */}
              <ThemedText style={[s.mediaName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>

              {/* Type badge + period */}
              <View style={s.mediaBadgeRow}>
                <StatusBadge label={mediaTypeLabel(item.type)} color={typeColor} />
                <ThemedText style={[s.mediaPeriod, { color: colors.textTertiary }]}>
                  {item.period}
                </ThemedText>
              </View>

              {/* Metric + value */}
              <View style={s.mediaMetricRow}>
                <ThemedText style={[s.mediaMetricLabel, { color: colors.textSecondary }]}>
                  {item.metric}
                </ThemedText>
                <ThemedText style={[s.mediaMetricValue, { color: colors.text }]}>
                  {item.value}
                </ThemedText>
              </View>

              {/* Change indicator */}
              <View style={s.mediaChangeRow}>
                <IconSymbol
                  name={
                    item.change > 0
                      ? 'arrow.up.right' as any
                      : item.change < 0
                        ? 'arrow.down.right' as any
                        : 'arrow.right' as any
                  }
                  size={14}
                  color={chgColor}
                />
                <ThemedText style={[s.mediaChangeText, { color: chgColor }]}>
                  {item.change > 0 ? '+' : ''}{item.change}%
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="play.rectangle.fill" label="No media reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CUSTOM TAB
// =============================================================================

function CustomTab({
  colors,
  accentColor,
  data,
  onSelectCustom,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: CustomReport[];
  onSelectCustom: (report: CustomReport) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <Pressable
          style={[s.customCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectCustom(item);
          }}
        >
          {/* Name */}
          <ThemedText style={[s.reportCardName, { color: colors.text }]} numberOfLines={2}>
            {item.name}
          </ThemedText>

          {/* Format + schedule */}
          <View style={s.reportCardBadgeRow}>
            <FormatBadge format={item.format} />
            <StatusBadge label={item.schedule.toUpperCase()} color={accentColor} />
          </View>

          {/* Creator */}
          <View style={s.customCreatorRow}>
            <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.reportCardMetaText, { color: colors.textSecondary }]}>
              {item.creator}
            </ThemedText>
          </View>

          {/* Data sources */}
          <View style={s.customChipRow}>
            {item.dataSources.map((src) => (
              <View key={src} style={[s.customChip, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.customChipText, { color: colors.textSecondary }]}>
                  {src}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Filters */}
          {item.filters.length > 0 && (
            <View style={s.customFiltersRow}>
              <IconSymbol name="line.3.horizontal.decrease.circle" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.customFiltersText, { color: colors.textTertiary }]}>
                {item.filters.join(' \u00B7 ')}
              </ThemedText>
            </View>
          )}

          {/* Footer */}
          <View style={[s.reportCardFooter, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.reportCardFooterText, { color: colors.textTertiary }]}>
              Last run: {item.lastRun}
            </ThemedText>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        <EmptyState icon="slider.horizontal.3" label="No custom reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SCHEDULED TAB
// =============================================================================

function ScheduledTab({
  colors,
  accentColor,
  data,
  onSelectScheduled,
  onToggleScheduled,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ScheduledReport[];
  onSelectScheduled: (report: ScheduledReport) => void;
  onToggleScheduled: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const freqColor = FREQUENCY_COLOR[item.frequency];
        return (
          <Pressable
            style={[
              s.scheduledCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              !item.enabled && { opacity: 0.55 },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectScheduled(item);
            }}
          >
            <View style={s.scheduledCardTop}>
              <View style={s.scheduledCardInfo}>
                {/* Name */}
                <ThemedText style={[s.scheduledName, { color: colors.text }]} numberOfLines={2}>
                  {item.name}
                </ThemedText>

                {/* Badge row */}
                <View style={s.reportCardBadgeRow}>
                  <StatusBadge label={frequencyLabel(item.frequency)} color={freqColor} />
                  <FormatBadge format={item.format} />
                  {!item.enabled && (
                    <StatusBadge label="PAUSED" color="#6B7280" />
                  )}
                </View>
              </View>

              {/* Toggle */}
              <Switch
                value={item.enabled}
                onValueChange={() => onToggleScheduled(item.id)}
                trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
                thumbColor={item.enabled ? accentColor : colors.textTertiary}
              />
            </View>

            {/* Next run */}
            <View style={s.scheduledNextRun}>
              <IconSymbol name="clock.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.scheduledNextRunText, { color: colors.textSecondary }]}>
                Next: {item.nextRun}
              </ThemedText>
            </View>

            {/* Recipients */}
            <View style={[s.scheduledRecipientsRow, { borderTopColor: colors.border }]}>
              <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
              <ThemedText
                style={[s.scheduledRecipientsText, { color: colors.textTertiary }]}
                numberOfLines={1}
              >
                {item.recipients.join(', ')}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="clock.arrow.2.circlepath" label="No scheduled reports" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
  data,
  onToggle,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReportSettingToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.settingRow, { borderBottomColor: colors.border }]}>
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.settingDescription, { color: colors.textTertiary }]}>
              {item.description}
            </ThemedText>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={item.enabled ? accentColor : colors.textTertiary}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="gearshape" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// OPERATIONAL DETAIL BOTTOM SHEET
// =============================================================================

function OperationalDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: OperationalReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const stColor = REPORT_STATUS_COLOR[report.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Status + format */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={report.status.toUpperCase()} color={stColor} />
        <FormatBadge format={report.format} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{report.pageCount}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Pages</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{report.downloads}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Downloads</ThemedText>
        </View>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.series}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Author</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.author}
        </ThemedText>
      </View>

      {report.generatedDate ? (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Generated</ThemedText>
          <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
            {report.generatedDate}
          </ThemedText>
        </View>
      ) : null}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>Download Report</ThemedText>
        </Pressable>
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
// FINANCIAL DETAIL BOTTOM SHEET
// =============================================================================

function FinancialDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: FinancialReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const stColor = FINANCIAL_STATUS_COLOR[report.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Status + format + type */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={report.status.replace('-', ' ').toUpperCase()} color={stColor} />
        <FormatBadge format={report.format} />
        <StatusBadge label={financialTypeLabel(report.type)} color={accentColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {report.amount > 0 ? formatCurrency(report.amount) : '\u2014'}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Amount</ThemedText>
        </View>
      </View>

      {/* Period */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Generated</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.generatedDate}
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
          <ThemedText style={s.sheetActionButtonText}>Download Report</ThemedText>
        </Pressable>
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
// COMPLIANCE DETAIL BOTTOM SHEET
// =============================================================================

function ComplianceDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: ComplianceReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const stColor = COMPLIANCE_STATUS_COLOR[report.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Status + type */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={report.status.replace('-', ' ').toUpperCase()} color={stColor} />
        <StatusBadge label={complianceTypeLabel(report.type)} color={accentColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: report.findings > 0 ? '#EF4444' : '#22C55E' }]}>
            {report.findings}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Findings</ThemedText>
        </View>
      </View>

      {/* Period */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Generated</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.generatedDate}
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
          <ThemedText style={s.sheetActionButtonText}>View Full Report</ThemedText>
        </Pressable>
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
// PERFORMANCE DETAIL BOTTOM SHEET
// =============================================================================

function PerformanceDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: PerformanceReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <FormatBadge format={report.format} />
        <StatusBadge label={performanceTypeLabel(report.type)} color={accentColor} />
      </View>

      {/* Series */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.series}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Generated</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.generatedDate}
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
          <ThemedText style={s.sheetActionButtonText}>Open Report</ThemedText>
        </Pressable>
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
// ATTENDANCE DETAIL BOTTOM SHEET
// =============================================================================

function AttendanceDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: AttendanceReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const utColor = utilizationColor(report.utilization);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.event} useModal>
      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {report.attendance.toLocaleString()}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Attendance</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: utColor }]}>
            {report.utilization}%
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Utilization</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: '#22C55E' }]}>
            {formatCurrency(report.revenue)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Revenue</ThemedText>
        </View>
      </View>

      {/* Venue */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Venue</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.venue} ({report.capacity.toLocaleString()} capacity)
        </ThemedText>
      </View>

      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.date}
        </ThemedText>
      </View>

      {report.notes.length > 0 && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
          <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
            {report.notes}
          </ThemedText>
        </View>
      )}

      {/* Utilization bar */}
      <View style={s.sheetUtilBarContainer}>
        <ThemedText style={[s.sheetUtilBarLabel, { color: colors.textTertiary }]}>
          Capacity Utilization
        </ThemedText>
        <View style={[s.utilizationBarBg, { backgroundColor: colors.backgroundTertiary, marginTop: 6 }]}>
          <View
            style={[
              s.utilizationBarFill,
              { width: `${Math.min(report.utilization, 100)}%`, backgroundColor: utColor },
            ]}
          />
        </View>
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
          <ThemedText style={s.sheetActionButtonText}>Export Attendance Data</ThemedText>
        </Pressable>
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
// MEDIA DETAIL BOTTOM SHEET
// =============================================================================

function MediaDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: MediaReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const typeColor = MEDIA_TYPE_COLOR[report.type];
  const chgColor = changeColor(report.change);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Type badge */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={mediaTypeLabel(report.type)} color={typeColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {report.value}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>
            {report.metric}
          </ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: chgColor }]}>
            {report.change > 0 ? '+' : ''}{report.change}%
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Change</ThemedText>
        </View>
      </View>

      {/* Period */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Period</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.period}
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
          <ThemedText style={s.sheetActionButtonText}>View Full Report</ThemedText>
        </Pressable>
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
// CUSTOM DETAIL BOTTOM SHEET
// =============================================================================

function CustomDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: CustomReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Format + schedule */}
      <View style={s.sheetBadgeRow}>
        <FormatBadge format={report.format} />
        <StatusBadge label={report.schedule.toUpperCase()} color={accentColor} />
      </View>

      {/* Creator */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Creator</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.creator}
        </ThemedText>
      </View>

      {/* Data Sources */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Data Sources</ThemedText>
        <View style={s.sheetChipRow}>
          {report.dataSources.map((src) => (
            <View key={src} style={[s.customChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.customChipText, { color: colors.textSecondary }]}>
                {src}
              </ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Filters */}
      {report.filters.length > 0 && (
        <View style={[s.sheetSection, { borderColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Filters</ThemedText>
          {report.filters.map((filter) => (
            <View key={filter} style={s.sheetFilterRow}>
              <IconSymbol name="line.3.horizontal.decrease.circle" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
                {filter}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Last run */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Last Run</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.lastRun}
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
          <ThemedText style={s.sheetActionButtonText}>Run Report Now</ThemedText>
        </Pressable>
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
// SCHEDULED DETAIL BOTTOM SHEET
// =============================================================================

function ScheduledDetailSheet({
  visible,
  onClose,
  report,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  report: ScheduledReport | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!report) return null;

  const freqColor = FREQUENCY_COLOR[report.frequency];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={report.name} useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={frequencyLabel(report.frequency)} color={freqColor} />
        <FormatBadge format={report.format} />
        {!report.enabled && <StatusBadge label="PAUSED" color="#6B7280" />}
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {report.recipients.length}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Recipients</ThemedText>
        </View>
      </View>

      {/* Next run */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Next Run</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {report.nextRun}
        </ThemedText>
      </View>

      {/* Recipients */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Recipients</ThemedText>
        {report.recipients.map((r) => (
          <View key={r} style={s.sheetRecipientRow}>
            <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
              {r}
            </ThemedText>
          </View>
        ))}
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
          <ThemedText style={s.sheetActionButtonText}>Run Now</ThemedText>
        </Pressable>
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
// MAIN EXPORT
// =============================================================================

export function CompReportsV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompReportsTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Bottom sheet states
  const [selectedOperational, setSelectedOperational] = useState<OperationalReport | null>(null);
  const [showOperationalDetail, setShowOperationalDetail] = useState(false);

  const [selectedFinancial, setSelectedFinancial] = useState<FinancialReport | null>(null);
  const [showFinancialDetail, setShowFinancialDetail] = useState(false);

  const [selectedCompliance, setSelectedCompliance] = useState<ComplianceReport | null>(null);
  const [showComplianceDetail, setShowComplianceDetail] = useState(false);

  const [selectedPerformance, setSelectedPerformance] = useState<PerformanceReport | null>(null);
  const [showPerformanceDetail, setShowPerformanceDetail] = useState(false);

  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceReport | null>(null);
  const [showAttendanceDetail, setShowAttendanceDetail] = useState(false);

  const [selectedMedia, setSelectedMedia] = useState<MediaReport | null>(null);
  const [showMediaDetail, setShowMediaDetail] = useState(false);

  const [selectedCustom, setSelectedCustom] = useState<CustomReport | null>(null);
  const [showCustomDetail, setShowCustomDetail] = useState(false);

  const [selectedScheduled, setSelectedScheduled] = useState<ScheduledReport | null>(null);
  const [showScheduledDetail, setShowScheduledDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});
  // Scheduled enabled overrides
  const [scheduledOverrides, setScheduledOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_REPORTS_SCOPE_CHIPS[activeScope] ?? 'All Reports';
  const data = useMemo(() => getCompReportsData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // Scheduled with overrides applied
  const scheduledWithOverrides = useMemo(() => {
    return data.scheduled.map((sc) => ({
      ...sc,
      enabled: scheduledOverrides[sc.id] !== undefined
        ? scheduledOverrides[sc.id]
        : sc.enabled,
    }));
  }, [data.scheduled, scheduledOverrides]);

  // === Filtered data based on search ===
  const filteredOperational = useMemo(() => {
    if (!searchQuery.trim()) return data.operational;
    const q = searchQuery.toLowerCase();
    return data.operational.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q) ||
        r.author.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q),
    );
  }, [data.operational, searchQuery]);

  const filteredFinancial = useMemo(() => {
    if (!searchQuery.trim()) return data.financial;
    const q = searchQuery.toLowerCase();
    return data.financial.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.period.toLowerCase().includes(q),
    );
  }, [data.financial, searchQuery]);

  const filteredCompliance = useMemo(() => {
    if (!searchQuery.trim()) return data.compliance;
    const q = searchQuery.toLowerCase();
    return data.compliance.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.status.toLowerCase().includes(q),
    );
  }, [data.compliance, searchQuery]);

  const filteredPerformance = useMemo(() => {
    if (!searchQuery.trim()) return data.performance;
    const q = searchQuery.toLowerCase();
    return data.performance.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.series.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [data.performance, searchQuery]);

  const filteredAttendance = useMemo(() => {
    if (!searchQuery.trim()) return data.attendance;
    const q = searchQuery.toLowerCase();
    return data.attendance.filter(
      (r) =>
        r.event.toLowerCase().includes(q) ||
        r.venue.toLowerCase().includes(q),
    );
  }, [data.attendance, searchQuery]);

  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return data.media;
    const q = searchQuery.toLowerCase();
    return data.media.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.metric.toLowerCase().includes(q),
    );
  }, [data.media, searchQuery]);

  const filteredCustom = useMemo(() => {
    if (!searchQuery.trim()) return data.custom;
    const q = searchQuery.toLowerCase();
    return data.custom.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.creator.toLowerCase().includes(q) ||
        r.dataSources.some((src) => src.toLowerCase().includes(q)),
    );
  }, [data.custom, searchQuery]);

  const filteredScheduled = useMemo(() => {
    if (!searchQuery.trim()) return scheduledWithOverrides;
    const q = searchQuery.toLowerCase();
    return scheduledWithOverrides.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.frequency.toLowerCase().includes(q) ||
        r.recipients.some((rec) => rec.toLowerCase().includes(q)),
    );
  }, [scheduledWithOverrides, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompReportsTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectOperational = useCallback((report: OperationalReport) => {
    setSelectedOperational(report);
    setShowOperationalDetail(true);
  }, []);

  const handleSelectFinancial = useCallback((report: FinancialReport) => {
    setSelectedFinancial(report);
    setShowFinancialDetail(true);
  }, []);

  const handleSelectCompliance = useCallback((report: ComplianceReport) => {
    setSelectedCompliance(report);
    setShowComplianceDetail(true);
  }, []);

  const handleSelectPerformance = useCallback((report: PerformanceReport) => {
    setSelectedPerformance(report);
    setShowPerformanceDetail(true);
  }, []);

  const handleSelectAttendance = useCallback((report: AttendanceReport) => {
    setSelectedAttendance(report);
    setShowAttendanceDetail(true);
  }, []);

  const handleSelectMedia = useCallback((report: MediaReport) => {
    setSelectedMedia(report);
    setShowMediaDetail(true);
  }, []);

  const handleSelectCustom = useCallback((report: CustomReport) => {
    setSelectedCustom(report);
    setShowCustomDetail(true);
  }, []);

  const handleSelectScheduled = useCallback((report: ScheduledReport) => {
    setSelectedScheduled(report);
    setShowScheduledDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((st) => st.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  const handleToggleScheduled = useCallback((id: string) => {
    setScheduledOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.scheduled.find((sc) => sc.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.scheduled]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'operational':
        return (
          <OperationalTab
            colors={colors}
            accentColor={accentColor}
            data={filteredOperational}
            onSelectReport={handleSelectOperational}
          />
        );
      case 'financial':
        return (
          <FinancialTab
            colors={colors}
            accentColor={accentColor}
            data={filteredFinancial}
            onSelectFinancial={handleSelectFinancial}
          />
        );
      case 'compliance':
        return (
          <ComplianceTab
            colors={colors}
            accentColor={accentColor}
            data={filteredCompliance}
            onSelectCompliance={handleSelectCompliance}
          />
        );
      case 'performance':
        return (
          <PerformanceTab
            colors={colors}
            accentColor={accentColor}
            data={filteredPerformance}
            onSelectPerformance={handleSelectPerformance}
          />
        );
      case 'attendance':
        return (
          <AttendanceTab
            colors={colors}
            accentColor={accentColor}
            data={filteredAttendance}
            onSelectAttendance={handleSelectAttendance}
          />
        );
      case 'media':
        return (
          <MediaTab
            colors={colors}
            accentColor={accentColor}
            data={filteredMedia}
            onSelectMedia={handleSelectMedia}
          />
        );
      case 'custom':
        return (
          <CustomTab
            colors={colors}
            accentColor={accentColor}
            data={filteredCustom}
            onSelectCustom={handleSelectCustom}
          />
        );
      case 'scheduled':
        return (
          <ScheduledTab
            colors={colors}
            accentColor={accentColor}
            data={filteredScheduled}
            onSelectScheduled={handleSelectScheduled}
            onToggleScheduled={handleToggleScheduled}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            colors={colors}
            accentColor={accentColor}
            data={settingsWithOverrides}
            onToggle={handleToggleSetting}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_REPORTS_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <ThemedText
                style={[
                  s.tabPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Scope chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.scopeChipRow}
      >
        {COMP_REPORTS_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
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
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Bottom Sheets */}
      <OperationalDetailSheet
        visible={showOperationalDetail}
        onClose={() => setShowOperationalDetail(false)}
        report={selectedOperational}
        colors={colors}
        accentColor={accentColor}
      />
      <FinancialDetailSheet
        visible={showFinancialDetail}
        onClose={() => setShowFinancialDetail(false)}
        report={selectedFinancial}
        colors={colors}
        accentColor={accentColor}
      />
      <ComplianceDetailSheet
        visible={showComplianceDetail}
        onClose={() => setShowComplianceDetail(false)}
        report={selectedCompliance}
        colors={colors}
        accentColor={accentColor}
      />
      <PerformanceDetailSheet
        visible={showPerformanceDetail}
        onClose={() => setShowPerformanceDetail(false)}
        report={selectedPerformance}
        colors={colors}
        accentColor={accentColor}
      />
      <AttendanceDetailSheet
        visible={showAttendanceDetail}
        onClose={() => setShowAttendanceDetail(false)}
        report={selectedAttendance}
        colors={colors}
        accentColor={accentColor}
      />
      <MediaDetailSheet
        visible={showMediaDetail}
        onClose={() => setShowMediaDetail(false)}
        report={selectedMedia}
        colors={colors}
        accentColor={accentColor}
      />
      <CustomDetailSheet
        visible={showCustomDetail}
        onClose={() => setShowCustomDetail(false)}
        report={selectedCustom}
        colors={colors}
        accentColor={accentColor}
      />
      <ScheduledDetailSheet
        visible={showScheduledDetail}
        onClose={() => setShowScheduledDetail(false)}
        report={selectedScheduled}
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

  // -- Tab pills --
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scope chips --
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 12,
    fontWeight: '600',
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
  formatBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  formatBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
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
  },

  // -- Dashboard: KPI --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Dashboard: Category breakdown --
  breakdownCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  breakdownRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  breakdownIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  breakdownCount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Dashboard: Quick stats --
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickStatCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '46%',
  },
  quickStatValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },

  // -- Dashboard: Recent reports --
  recentCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: Spacing.sm,
  },
  recentRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  recentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  recentTextCol: {
    flex: 1,
  },
  recentName: {
    fontSize: 13,
    fontWeight: '500',
  },
  recentMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  recentRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: Spacing.sm,
  },
  attendanceFigure: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginLeft: Spacing.sm,
  },

  // -- Report card (shared across Operational, Financial, Performance, etc.) --
  reportCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  reportCardName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  reportCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  reportCardMetaRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 6,
  },
  reportCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportCardMetaText: {
    fontSize: 12,
  },
  reportCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  reportCardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportCardFooterRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reportCardFooterText: {
    fontSize: 11,
  },
  downloadIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  downloadCount: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Financial --
  financialAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  financialAmount: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  financialPeriod: {
    fontSize: 12,
  },

  // -- Compliance --
  complianceStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    borderTopLeftRadius: BorderRadius.lg,
    borderBottomLeftRadius: BorderRadius.lg,
  },
  complianceContent: {
    paddingLeft: 8,
  },
  complianceMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 4,
    alignItems: 'center',
  },
  findingsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  findingsText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Attendance card --
  attendanceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  attendanceEventName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  attendanceVenueRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: 8,
  },
  attendanceStatsRow: {
    flexDirection: 'row',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  attendanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  attendanceStatValue: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  attendanceStatLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  utilizationBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  utilizationBarFill: {
    height: 6,
    borderRadius: 3,
  },
  attendanceNotes: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },

  // -- Media card --
  mediaCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  mediaStripe: {
    width: 4,
  },
  mediaContent: {
    flex: 1,
    padding: Spacing.md,
  },
  mediaName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  mediaBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 8,
  },
  mediaPeriod: {
    fontSize: 11,
  },
  mediaMetricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  mediaMetricLabel: {
    fontSize: 12,
  },
  mediaMetricValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  mediaChangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mediaChangeText: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // -- Custom card --
  customCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  customCreatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  customChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  customChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  customChipText: {
    fontSize: 11,
    fontWeight: '500',
  },
  customFiltersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  customFiltersText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Scheduled card --
  scheduledCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    padding: Spacing.md,
  },
  scheduledCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  scheduledCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  scheduledName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  scheduledNextRun: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
    marginBottom: 4,
  },
  scheduledNextRunText: {
    fontSize: 12,
  },
  scheduledRecipientsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  scheduledRecipientsText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Settings --
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // -- Bottom Sheet shared --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpiItem: {
    alignItems: 'center',
  },
  sheetKpiValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
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
  sheetChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  sheetFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sheetRecipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sheetUtilBarContainer: {
    marginBottom: Spacing.md,
  },
  sheetUtilBarLabel: {
    fontSize: 12,
    fontWeight: '600',
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
});
