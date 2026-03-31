/**
 * Competition Organization Compliance Tab — 10-tab Compliance Hub.
 * Dashboard, Rules, Eligibility, Drug Testing, Equipment Standards,
 * Incidents, Appeals, Certifications, Reports, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import {
  COMP_COMPLIANCE_TABS,
  COMP_COMPLIANCE_SCOPE_CHIPS,
  RULE_STATUS_COLOR,
  ELIGIBILITY_STATUS_COLOR,
  TEST_RESULT_COLOR,
  EQUIPMENT_STATUS_COLOR,
  INCIDENT_SEVERITY_COLOR,
  INCIDENT_STATUS_COLOR,
  APPEAL_STATUS_COLOR,
  CERT_STATUS_COLOR,
  REPORT_FORMAT_COLOR,
  getCompComplianceData,
} from '@/data/mock-comp-org-compliance';
import type {
  CompComplianceTabId,
  ComplianceDashBlock,
  CompRule,
  EligibilityRecord,
  DrugTest,
  EquipmentStandard,
  ComplianceIncident,
  Appeal,
  Certification,
  ComplianceReport,
  ComplianceSettingToggle,
} from '@/data/mock-comp-org-compliance';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function severityLabel(severity: ComplianceIncident['severity']): string {
  switch (severity) {
    case 'minor': return 'MINOR';
    case 'major': return 'MAJOR';
    case 'critical': return 'CRITICAL';
  }
}

function incidentTypeLabel(type: ComplianceIncident['type']): string {
  switch (type) {
    case 'rule-violation': return 'RULE VIOLATION';
    case 'doping': return 'DOPING';
    case 'equipment': return 'EQUIPMENT';
    case 'conduct': return 'CONDUCT';
    case 'eligibility': return 'ELIGIBILITY';
  }
}

function certTypeLabel(type: Certification['type']): string {
  switch (type) {
    case 'official': return 'OFFICIAL';
    case 'venue': return 'VENUE';
    case 'equipment': return 'EQUIPMENT';
    case 'medical': return 'MEDICAL';
  }
}

function ruleCategoryLabel(category: CompRule['category']): string {
  switch (category) {
    case 'gameplay': return 'GAMEPLAY';
    case 'conduct': return 'CONDUCT';
    case 'eligibility': return 'ELIGIBILITY';
    case 'equipment': return 'EQUIPMENT';
    case 'venue': return 'VENUE';
    case 'media': return 'MEDIA';
  }
}

function ruleCategoryColor(category: CompRule['category']): string {
  switch (category) {
    case 'gameplay': return ACCENT;
    case 'conduct': return '#B8943E';
    case 'eligibility': return '#5A8A6E';
    case 'equipment': return ACCENT;
    case 'venue': return ACCENT;
    case 'media': return '#9C9790';
  }
}

function testTypeLabel(type: DrugTest['testType']): string {
  switch (type) {
    case 'random': return 'RANDOM';
    case 'scheduled': return 'SCHEDULED';
    case 'targeted': return 'TARGETED';
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
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompComplianceData>;
}) {
  // Recent incidents for dashboard summary
  const recentIncidents = data.incidents.slice(0, 4);
  const expiringCerts = data.certifications.filter(
    (c) => c.status === 'expiring-soon' || c.status === 'expired',
  );
  const pendingTests = data.drugTests.filter((t) => t.result === 'pending');
  const openAppeals = data.appeals.filter(
    (a) => a.status === 'filed' || a.status === 'hearing-scheduled',
  );

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Compliance Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: ComplianceDashBlock) => (
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

      {/* Recent Incidents */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Incidents
      </ThemedText>
      <View style={[s.dashListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {recentIncidents.map((inc, index) => {
          const sevColor = INCIDENT_SEVERITY_COLOR[inc.severity];
          const stColor = INCIDENT_STATUS_COLOR[inc.status];
          return (
            <View
              key={inc.id}
              style={[
                s.dashListRow,
                index < recentIncidents.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={[s.dashListDot, { backgroundColor: sevColor }]} />
              <View style={s.dashListTextCol}>
                <ThemedText style={[s.dashListTitle, { color: colors.text }]} numberOfLines={1}>
                  {inc.description.substring(0, 60)}...
                </ThemedText>
                <View style={s.dashListBadgeRow}>
                  <StatusBadge label={severityLabel(inc.severity)} color={sevColor} />
                  <StatusBadge label={inc.status.toUpperCase()} color={stColor} />
                </View>
              </View>
              <ThemedText style={[s.dashListDate, { color: colors.textTertiary }]}>
                {formatDateShort(inc.date)}
              </ThemedText>
            </View>
          );
        })}
      </View>

      {/* Pending Drug Tests */}
      {pendingTests.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Pending Drug Tests
          </ThemedText>
          <View style={[s.dashListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {pendingTests.map((test, index) => (
              <View
                key={test.id}
                style={[
                  s.dashListRow,
                  index < pendingTests.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: colors.border,
                  },
                ]}
              >
                <View style={[s.dashListDot, { backgroundColor: TEST_RESULT_COLOR.pending }]} />
                <View style={s.dashListTextCol}>
                  <ThemedText style={[s.dashListTitle, { color: colors.text }]} numberOfLines={1}>
                    {test.athlete}
                  </ThemedText>
                  <ThemedText style={[s.dashListSubtitle, { color: colors.textTertiary }]}>
                    {test.series} — {testTypeLabel(test.testType)}
                  </ThemedText>
                </View>
                <ThemedText style={[s.dashListDate, { color: colors.textTertiary }]}>
                  {formatDateShort(test.date)}
                </ThemedText>
              </View>
            ))}
          </View>
        </>
      )}

      {/* Expiring Certifications */}
      {expiringCerts.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Expiring / Expired Certifications
          </ThemedText>
          <View style={[s.dashListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {expiringCerts.map((cert, index) => {
              const certColor = CERT_STATUS_COLOR[cert.status];
              return (
                <View
                  key={cert.id}
                  style={[
                    s.dashListRow,
                    index < expiringCerts.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[s.dashListDot, { backgroundColor: certColor }]} />
                  <View style={s.dashListTextCol}>
                    <ThemedText style={[s.dashListTitle, { color: colors.text }]} numberOfLines={1}>
                      {cert.name}
                    </ThemedText>
                    <ThemedText style={[s.dashListSubtitle, { color: colors.textTertiary }]}>
                      {cert.holder}
                    </ThemedText>
                  </View>
                  <StatusBadge label={cert.status.toUpperCase()} color={certColor} />
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Open Appeals */}
      {openAppeals.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Open Appeals
          </ThemedText>
          <View style={[s.dashListCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {openAppeals.map((appeal, index) => {
              const apColor = APPEAL_STATUS_COLOR[appeal.status];
              return (
                <View
                  key={appeal.id}
                  style={[
                    s.dashListRow,
                    index < openAppeals.length - 1 && {
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <View style={[s.dashListDot, { backgroundColor: apColor }]} />
                  <View style={s.dashListTextCol}>
                    <ThemedText style={[s.dashListTitle, { color: colors.text }]} numberOfLines={1}>
                      {appeal.incident}
                    </ThemedText>
                    <ThemedText style={[s.dashListSubtitle, { color: colors.textTertiary }]}>
                      {appeal.appellant} — Hearing: {formatDateShort(appeal.hearingDate)}
                    </ThemedText>
                  </View>
                  <StatusBadge label={appeal.status.toUpperCase()} color={apColor} />
                </View>
              );
            })}
          </View>
        </>
      )}
    </ScrollView>
  );
}

// =============================================================================
// RULES TAB
// =============================================================================

function RulesTab({
  colors,
  accentColor,
  data,
  onSelectRule,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: CompRule[];
  onSelectRule: (rule: CompRule) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = RULE_STATUS_COLOR[item.status];
        const catColor = ruleCategoryColor(item.category);
        return (
          <Pressable
            style={[s.ruleCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectRule(item);
            }}
          >
            {/* Top: code + status */}
            <View style={s.ruleCardTop}>
              <View style={s.ruleCardInfo}>
                <View style={[s.ruleCodeBadge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.ruleCodeText, { color: accentColor }]}>
                    {item.code}
                  </ThemedText>
                </View>
                <View style={s.ruleCardBadgeRow}>
                  <StatusBadge label={ruleCategoryLabel(item.category)} color={catColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>
            </View>

            {/* Title */}
            <ThemedText style={[s.ruleTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>

            {/* Description */}
            <ThemedText style={[s.ruleDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            {/* Footer: dates */}
            <View style={[s.ruleCardFooter, { borderTopColor: colors.border }]}>
              <View style={s.ruleFooterItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.ruleFooterText, { color: colors.textTertiary }]}>
                  Effective: {formatDateShort(item.effectiveDate)}
                </ThemedText>
              </View>
              <View style={s.ruleFooterItem}>
                <IconSymbol name="pencil" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.ruleFooterText, { color: colors.textTertiary }]}>
                  Amended: {formatDateShort(item.lastAmended)}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="book.fill" label="No rules found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ELIGIBILITY TAB
// =============================================================================

function EligibilityTab({
  colors,
  accentColor,
  data,
  onSelectRecord,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EligibilityRecord[];
  onSelectRecord: (record: EligibilityRecord) => void;
}) {
  // Group by entrant
  const grouped = useMemo(() => {
    const groups: { entrant: string; records: EligibilityRecord[] }[] = [];
    const entrantMap = new Map<string, EligibilityRecord[]>();
    data.forEach((rec) => {
      if (!entrantMap.has(rec.entrant)) {
        entrantMap.set(rec.entrant, []);
      }
      entrantMap.get(rec.entrant)!.push(rec);
    });
    entrantMap.forEach((records, entrant) => {
      groups.push({ entrant, records });
    });
    return groups;
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.entrant}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.eligibilityGroup}>
          {/* Entrant header */}
          <View style={s.eligGroupHeader}>
            <View style={[s.eligGroupDot, { backgroundColor: accentColor }]} />
            <ThemedText style={[s.eligGroupTitle, { color: colors.text }]}>
              {group.entrant}
            </ThemedText>
            <ThemedText style={[s.eligGroupCount, { color: colors.textTertiary }]}>
              {group.records.length} player{group.records.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>

          {/* Player cards */}
          {group.records.map((rec) => {
            const stColor = ELIGIBILITY_STATUS_COLOR[rec.status];
            return (
              <Pressable
                key={rec.id}
                style={[s.eligCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectRecord(rec);
                }}
              >
                <View style={s.eligCardTop}>
                  <View style={s.eligCardNameCol}>
                    <ThemedText style={[s.eligPlayerName, { color: colors.text }]} numberOfLines={1}>
                      {rec.player}
                    </ThemedText>
                    <ThemedText style={[s.eligSeries, { color: colors.textTertiary }]}>
                      {rec.series}
                    </ThemedText>
                  </View>
                  <StatusBadge label={rec.status.toUpperCase()} color={stColor} />
                </View>
                <ThemedText style={[s.eligReason, { color: colors.textSecondary }]} numberOfLines={2}>
                  {rec.reason}
                </ThemedText>
                <View style={s.eligCardFooter}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.eligReviewDate, { color: colors.textTertiary }]}>
                    Review: {formatDateShort(rec.reviewDate)}
                  </ThemedText>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="person.badge.shield.checkmark.fill" label="No eligibility records" colors={colors} />
      }
    />
  );
}

// =============================================================================
// DRUG TESTING TAB
// =============================================================================

function DrugTestingTab({
  colors,
  accentColor,
  data,
  onSelectTest,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: DrugTest[];
  onSelectTest: (test: DrugTest) => void;
}) {
  // Summary stats
  const stats = useMemo(() => {
    const total = data.length;
    const negative = data.filter((t) => t.result === 'negative').length;
    const positive = data.filter((t) => t.result === 'positive').length;
    const pending = data.filter((t) => t.result === 'pending').length;
    const inconclusive = data.filter((t) => t.result === 'inconclusive').length;
    return { total, negative, positive, pending, inconclusive };
  }, [data]);

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={s.testSummaryContainer}>
          {/* Summary bar */}
          <View style={[s.testSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.testSummaryTitle, { color: colors.text }]}>
              Testing Summary
            </ThemedText>
            <View style={s.testSummaryGrid}>
              <View style={s.testSummaryItem}>
                <ThemedText style={[s.testSummaryValue, { color: colors.text }]}>
                  {stats.total}
                </ThemedText>
                <ThemedText style={[s.testSummaryLabel, { color: colors.textTertiary }]}>
                  Total
                </ThemedText>
              </View>
              <View style={s.testSummaryItem}>
                <ThemedText style={[s.testSummaryValue, { color: TEST_RESULT_COLOR.negative }]}>
                  {stats.negative}
                </ThemedText>
                <ThemedText style={[s.testSummaryLabel, { color: colors.textTertiary }]}>
                  Negative
                </ThemedText>
              </View>
              <View style={s.testSummaryItem}>
                <ThemedText style={[s.testSummaryValue, { color: TEST_RESULT_COLOR.positive }]}>
                  {stats.positive}
                </ThemedText>
                <ThemedText style={[s.testSummaryLabel, { color: colors.textTertiary }]}>
                  Positive
                </ThemedText>
              </View>
              <View style={s.testSummaryItem}>
                <ThemedText style={[s.testSummaryValue, { color: TEST_RESULT_COLOR.pending }]}>
                  {stats.pending}
                </ThemedText>
                <ThemedText style={[s.testSummaryLabel, { color: colors.textTertiary }]}>
                  Pending
                </ThemedText>
              </View>
              <View style={s.testSummaryItem}>
                <ThemedText style={[s.testSummaryValue, { color: TEST_RESULT_COLOR.inconclusive }]}>
                  {stats.inconclusive}
                </ThemedText>
                <ThemedText style={[s.testSummaryLabel, { color: colors.textTertiary }]}>
                  Inconclusive
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const resultColor = TEST_RESULT_COLOR[item.result];
        return (
          <Pressable
            style={[s.testCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectTest(item);
            }}
          >
            <View style={[s.testCardStripe, { backgroundColor: resultColor }]} />
            <View style={s.testCardContent}>
              <View style={s.testCardTop}>
                <View style={s.testCardNameCol}>
                  <ThemedText style={[s.testAthleteName, { color: colors.text }]} numberOfLines={1}>
                    {item.athlete}
                  </ThemedText>
                  <ThemedText style={[s.testSeriesName, { color: colors.textTertiary }]}>
                    {item.series}
                  </ThemedText>
                </View>
                <View style={s.testCardBadges}>
                  <StatusBadge label={item.result.toUpperCase()} color={resultColor} />
                  <StatusBadge label={testTypeLabel(item.testType)} color={accentColor} />
                </View>
              </View>
              <View style={[s.testCardFooter, { borderTopColor: colors.border }]}>
                <View style={s.testFooterItem}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.testFooterText, { color: colors.textTertiary }]}>
                    {formatDate(item.date)}
                  </ThemedText>
                </View>
                <View style={s.testFooterItem}>
                  <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.testFooterText, { color: colors.textTertiary }]} numberOfLines={1}>
                    {item.lab}
                  </ThemedText>
                </View>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="testtube.2" label="No drug tests recorded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// EQUIPMENT STANDARDS TAB
// =============================================================================

function EquipmentTab({
  colors,
  accentColor,
  data,
  onSelectEquipment,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: EquipmentStandard[];
  onSelectEquipment: (eq: EquipmentStandard) => void;
}) {
  // Group by category
  const grouped = useMemo(() => {
    const catMap = new Map<string, EquipmentStandard[]>();
    data.forEach((eq) => {
      if (!catMap.has(eq.category)) {
        catMap.set(eq.category, []);
      }
      catMap.get(eq.category)!.push(eq);
    });
    const groups: { category: string; items: EquipmentStandard[] }[] = [];
    catMap.forEach((items, category) => {
      groups.push({ category, items });
    });
    return groups;
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.category}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.equipGroup}>
          {/* Category header */}
          <View style={s.equipGroupHeader}>
            <View style={[s.equipGroupDot, { backgroundColor: accentColor }]} />
            <ThemedText style={[s.equipGroupTitle, { color: colors.text }]}>
              {group.category}
            </ThemedText>
            <ThemedText style={[s.equipGroupCount, { color: colors.textTertiary }]}>
              {group.items.length}
            </ThemedText>
          </View>

          {/* Equipment items */}
          {group.items.map((eq) => {
            const stColor = EQUIPMENT_STATUS_COLOR[eq.status];
            return (
              <Pressable
                key={eq.id}
                style={[s.equipCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelectEquipment(eq);
                }}
              >
                <View style={s.equipCardTop}>
                  <ThemedText style={[s.equipName, { color: colors.text }]} numberOfLines={1}>
                    {eq.name}
                  </ThemedText>
                  <StatusBadge label={eq.status.toUpperCase()} color={stColor} />
                </View>
                <ThemedText style={[s.equipSpec, { color: colors.textSecondary }]} numberOfLines={2}>
                  {eq.specification}
                </ThemedText>
                <View style={[s.equipCardMeta, { borderTopColor: colors.border }]}>
                  {eq.maxAllowed !== 'N/A' && (
                    <View style={s.equipMetaItem}>
                      <IconSymbol name="ruler" size={12} color={colors.textTertiary} />
                      <ThemedText style={[s.equipMetaText, { color: colors.textTertiary }]}>
                        Max: {eq.maxAllowed}
                      </ThemedText>
                    </View>
                  )}
                  <View style={s.equipMetaItem}>
                    <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.equipMetaText, { color: colors.textTertiary }]}>
                      Inspected: {formatDateShort(eq.lastInspected)}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="wrench.fill" label="No equipment standards" colors={colors} />
      }
    />
  );
}

// =============================================================================
// INCIDENTS TAB
// =============================================================================

function IncidentsTab({
  colors,
  accentColor,
  data,
  onSelectIncident,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ComplianceIncident[];
  onSelectIncident: (incident: ComplianceIncident) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const sevColor = INCIDENT_SEVERITY_COLOR[item.severity];
        const stColor = INCIDENT_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.incidentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectIncident(item);
            }}
          >
            {/* Severity stripe */}
            <View style={[s.incidentStripe, { backgroundColor: sevColor }]} />
            <View style={s.incidentCardBody}>
              {/* Top row: badges */}
              <View style={s.incidentCardTop}>
                <View style={s.incidentBadgeRow}>
                  <StatusBadge label={severityLabel(item.severity)} color={sevColor} />
                  <StatusBadge label={incidentTypeLabel(item.type)} color={accentColor} />
                  <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                </View>
              </View>

              {/* Description */}
              <ThemedText style={[s.incidentDescription, { color: colors.text }]} numberOfLines={3}>
                {item.description}
              </ThemedText>

              {/* Party */}
              <View style={s.incidentPartyRow}>
                <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.incidentPartyText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.party}
                </ThemedText>
              </View>

              {/* Footer: date + penalty */}
              <View style={[s.incidentCardFooter, { borderTopColor: colors.border }]}>
                <View style={s.incidentFooterItem}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText style={[s.incidentFooterText, { color: colors.textTertiary }]}>
                    {formatDate(item.date)}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.incidentPenalty, { color: colors.textSecondary }]} numberOfLines={2}>
                Penalty: {item.penalty}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="exclamationmark.triangle.fill" label="No incidents recorded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// APPEALS TAB
// =============================================================================

function AppealsTab({
  colors,
  accentColor,
  data,
  onSelectAppeal,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Appeal[];
  onSelectAppeal: (appeal: Appeal) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = APPEAL_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.appealCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectAppeal(item);
            }}
          >
            <View style={s.appealCardTop}>
              <View style={s.appealCardInfo}>
                <ThemedText style={[s.appealIncident, { color: colors.text }]} numberOfLines={1}>
                  {item.incident}
                </ThemedText>
                <ThemedText style={[s.appealAppellant, { color: colors.textSecondary }]}>
                  {item.appellant}
                </ThemedText>
              </View>
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>

            {/* Grounds */}
            <ThemedText style={[s.appealGrounds, { color: colors.textSecondary }]} numberOfLines={3}>
              {item.grounds}
            </ThemedText>

            {/* Footer: dates */}
            <View style={[s.appealCardFooter, { borderTopColor: colors.border }]}>
              <View style={s.appealFooterItem}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.appealFooterText, { color: colors.textTertiary }]}>
                  Filed: {formatDateShort(item.date)}
                </ThemedText>
              </View>
              <View style={s.appealFooterItem}>
                <IconSymbol name="person.crop.rectangle" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.appealFooterText, { color: colors.textTertiary }]}>
                  Hearing: {formatDateShort(item.hearingDate)}
                </ThemedText>
              </View>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="doc.text.magnifyingglass" label="No appeals filed" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CERTIFICATIONS TAB
// =============================================================================

function CertificationsTab({
  colors,
  accentColor,
  data,
  onSelectCert,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Certification[];
  onSelectCert: (cert: Certification) => void;
}) {
  // Group by type
  const grouped = useMemo(() => {
    const types: Certification['type'][] = ['official', 'venue', 'equipment', 'medical'];
    return types
      .map((type) => ({
        type,
        certs: data.filter((c) => c.type === type),
      }))
      .filter((g) => g.certs.length > 0);
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.type}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => {
        const typeColor =
          group.type === 'official' ? ACCENT
          : group.type === 'venue' ? ACCENT
          : group.type === 'equipment' ? ACCENT
          : '#5A8A6E';
        return (
          <View style={s.certGroup}>
            <View style={s.certGroupHeader}>
              <View style={[s.certGroupDot, { backgroundColor: typeColor }]} />
              <ThemedText style={[s.certGroupTitle, { color: colors.text }]}>
                {certTypeLabel(group.type)} Certifications
              </ThemedText>
              <ThemedText style={[s.certGroupCount, { color: colors.textTertiary }]}>
                {group.certs.length}
              </ThemedText>
            </View>

            {group.certs.map((cert) => {
              const stColor = CERT_STATUS_COLOR[cert.status];
              return (
                <Pressable
                  key={cert.id}
                  style={[s.certCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelectCert(cert);
                  }}
                >
                  <View style={s.certCardTop}>
                    <View style={[s.certIconCircle, { backgroundColor: typeColor + '18' }]}>
                      <IconSymbol name="checkmark.seal.fill" size={16} color={typeColor} />
                    </View>
                    <View style={s.certCardInfo}>
                      <ThemedText style={[s.certName, { color: colors.text }]} numberOfLines={1}>
                        {cert.name}
                      </ThemedText>
                      <ThemedText style={[s.certHolder, { color: colors.textSecondary }]} numberOfLines={1}>
                        {cert.holder}
                      </ThemedText>
                    </View>
                    <StatusBadge label={cert.status.toUpperCase()} color={stColor} />
                  </View>
                  <View style={s.certCardMeta}>
                    <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                    <ThemedText style={[s.certExpiryText, { color: colors.textTertiary }]}>
                      Expires: {formatDate(cert.expiryDate)}
                    </ThemedText>
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="checkmark.seal.fill" label="No certifications found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// REPORTS TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ComplianceReport[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const fmtColor = REPORT_FORMAT_COLOR[item.format];
        return (
          <Pressable
            style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.reportCardLeft}>
              <View style={[s.reportFormatBadge, { backgroundColor: fmtColor + '18' }]}>
                <ThemedText style={[s.reportFormatText, { color: fmtColor }]}>
                  {item.format}
                </ThemedText>
              </View>
            </View>
            <View style={s.reportCardContent}>
              <ThemedText style={[s.reportName, { color: colors.text }]} numberOfLines={2}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.reportType, { color: colors.textSecondary }]}>
                {item.type}
              </ThemedText>
              <View style={s.reportDateRow}>
                <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.reportDateText, { color: colors.textTertiary }]}>
                  {formatDate(item.date)}
                </ThemedText>
              </View>
            </View>
            <View style={s.reportCardAction}>
              <IconSymbol name="arrow.down.circle" size={22} color={accentColor} />
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="chart.bar.doc.horizontal" label="No reports available" colors={colors} />
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
  data: ComplianceSettingToggle[];
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
        <EmptyState icon="gearshape.fill" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RULE DETAIL BOTTOM SHEET
// =============================================================================

function RuleDetailSheet({
  visible,
  onClose,
  rule,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  rule: CompRule | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!rule) return null;

  const stColor = RULE_STATUS_COLOR[rule.status];
  const catColor = ruleCategoryColor(rule.category);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={rule.code} useModal>
      {/* Status + category badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={rule.status.toUpperCase()} color={stColor} />
        <StatusBadge label={ruleCategoryLabel(rule.category)} color={catColor} />
      </View>

      {/* Title */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Title</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {rule.title}
        </ThemedText>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {rule.description}
        </ThemedText>
      </View>

      {/* Dates */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDateShort(rule.effectiveDate)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Effective</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDateShort(rule.lastAmended)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Last Amended</ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Rule</ThemedText>
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
// INCIDENT DETAIL BOTTOM SHEET
// =============================================================================

function IncidentDetailSheet({
  visible,
  onClose,
  incident,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  incident: ComplianceIncident | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!incident) return null;

  const sevColor = INCIDENT_SEVERITY_COLOR[incident.severity];
  const stColor = INCIDENT_STATUS_COLOR[incident.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Incident Detail" useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={severityLabel(incident.severity)} color={sevColor} />
        <StatusBadge label={incidentTypeLabel(incident.type)} color={accentColor} />
        <StatusBadge label={incident.status.toUpperCase()} color={stColor} />
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {incident.description}
        </ThemedText>
      </View>

      {/* Party */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Party</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {incident.party}
        </ThemedText>
      </View>

      {/* Penalty */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Penalty</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {incident.penalty}
        </ThemedText>
      </View>

      {/* Date */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDate(incident.date)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Date</ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Incident</ThemedText>
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
// ELIGIBILITY DETAIL BOTTOM SHEET
// =============================================================================

function EligibilityDetailSheet({
  visible,
  onClose,
  record,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  record: EligibilityRecord | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!record) return null;

  const stColor = ELIGIBILITY_STATUS_COLOR[record.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Eligibility Detail" useModal>
      {/* Player + status */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={record.status.toUpperCase()} color={stColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{record.player}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Player</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{record.entrant}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Entrant</ThemedText>
        </View>
      </View>

      {/* Series */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {record.series}
        </ThemedText>
      </View>

      {/* Reason */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Reason</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {record.reason}
        </ThemedText>
      </View>

      {/* Review date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Review Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {formatDate(record.reviewDate)}
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
          <ThemedText style={s.sheetActionButtonText}>View Full Record</ThemedText>
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
// DRUG TEST DETAIL BOTTOM SHEET
// =============================================================================

function DrugTestDetailSheet({
  visible,
  onClose,
  test,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  test: DrugTest | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!test) return null;

  const resultColor = TEST_RESULT_COLOR[test.result];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Drug Test Detail" useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={test.result.toUpperCase()} color={resultColor} />
        <StatusBadge label={testTypeLabel(test.testType)} color={accentColor} />
      </View>

      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{test.athlete}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Athlete</ThemedText>
        </View>
      </View>

      {/* Series */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Series</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {test.series}
        </ThemedText>
      </View>

      {/* Lab */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Laboratory</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {test.lab}
        </ThemedText>
      </View>

      {/* Date */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Test Date</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {formatDate(test.date)}
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
// EQUIPMENT DETAIL BOTTOM SHEET
// =============================================================================

function EquipmentDetailSheet({
  visible,
  onClose,
  equipment,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  equipment: EquipmentStandard | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!equipment) return null;

  const stColor = EQUIPMENT_STATUS_COLOR[equipment.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Equipment Standard" useModal>
      {/* Status badge */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={equipment.status.toUpperCase()} color={stColor} />
        <StatusBadge label={equipment.category.toUpperCase()} color={accentColor} />
      </View>

      {/* Name */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Equipment</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {equipment.name}
        </ThemedText>
      </View>

      {/* Specification */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Specification</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {equipment.specification}
        </ThemedText>
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {equipment.maxAllowed}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Max Allowed</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDateShort(equipment.lastInspected)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Last Inspected</ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Standard</ThemedText>
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
// APPEAL DETAIL BOTTOM SHEET
// =============================================================================

function AppealDetailSheet({
  visible,
  onClose,
  appeal,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  appeal: Appeal | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!appeal) return null;

  const stColor = APPEAL_STATUS_COLOR[appeal.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Appeal Detail" useModal>
      {/* Status badge */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={appeal.status.toUpperCase()} color={stColor} />
      </View>

      {/* Incident */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Incident</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {appeal.incident}
        </ThemedText>
      </View>

      {/* Appellant */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Appellant</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {appeal.appellant}
        </ThemedText>
      </View>

      {/* Grounds */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Grounds</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {appeal.grounds}
        </ThemedText>
      </View>

      {/* Dates */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDateShort(appeal.date)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Filed</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDateShort(appeal.hearingDate)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Hearing</ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Appeal</ThemedText>
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
// CERTIFICATION DETAIL BOTTOM SHEET
// =============================================================================

function CertDetailSheet({
  visible,
  onClose,
  cert,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  cert: Certification | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!cert) return null;

  const stColor = CERT_STATUS_COLOR[cert.status];
  const typeColor =
    cert.type === 'official' ? ACCENT
    : cert.type === 'venue' ? ACCENT
    : cert.type === 'equipment' ? ACCENT
    : '#5A8A6E';

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Certification Detail" useModal>
      {/* Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={cert.status.toUpperCase()} color={stColor} />
        <StatusBadge label={certTypeLabel(cert.type)} color={typeColor} />
      </View>

      {/* Name */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Certification</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {cert.name}
        </ThemedText>
      </View>

      {/* Holder */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Holder</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {cert.holder}
        </ThemedText>
      </View>

      {/* Expiry */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>
            {formatDate(cert.expiryDate)}
          </ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Expiry Date</ThemedText>
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
          <ThemedText style={s.sheetActionButtonText}>View Full Certification</ThemedText>
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

export function CompComplianceV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompComplianceTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Bottom sheet states
  const [selectedRule, setSelectedRule] = useState<CompRule | null>(null);
  const [showRuleDetail, setShowRuleDetail] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<ComplianceIncident | null>(null);
  const [showIncidentDetail, setShowIncidentDetail] = useState(false);
  const [selectedEligibility, setSelectedEligibility] = useState<EligibilityRecord | null>(null);
  const [showEligibilityDetail, setShowEligibilityDetail] = useState(false);
  const [selectedTest, setSelectedTest] = useState<DrugTest | null>(null);
  const [showTestDetail, setShowTestDetail] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentStandard | null>(null);
  const [showEquipmentDetail, setShowEquipmentDetail] = useState(false);
  const [selectedAppeal, setSelectedAppeal] = useState<Appeal | null>(null);
  const [showAppealDetail, setShowAppealDetail] = useState(false);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);
  const [showCertDetail, setShowCertDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_COMPLIANCE_SCOPE_CHIPS[activeScope] ?? 'All Compliance';
  const data = useMemo(() => getCompComplianceData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // === Filtered data based on search ===
  const filteredRules = useMemo(() => {
    if (!searchQuery.trim()) return data.rules;
    const q = searchQuery.toLowerCase();
    return data.rules.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q),
    );
  }, [data.rules, searchQuery]);

  const filteredEligibility = useMemo(() => {
    if (!searchQuery.trim()) return data.eligibility;
    const q = searchQuery.toLowerCase();
    return data.eligibility.filter(
      (e) =>
        e.player.toLowerCase().includes(q) ||
        e.entrant.toLowerCase().includes(q) ||
        e.series.toLowerCase().includes(q) ||
        e.reason.toLowerCase().includes(q),
    );
  }, [data.eligibility, searchQuery]);

  const filteredDrugTests = useMemo(() => {
    if (!searchQuery.trim()) return data.drugTests;
    const q = searchQuery.toLowerCase();
    return data.drugTests.filter(
      (t) =>
        t.athlete.toLowerCase().includes(q) ||
        t.series.toLowerCase().includes(q) ||
        t.lab.toLowerCase().includes(q) ||
        t.result.toLowerCase().includes(q),
    );
  }, [data.drugTests, searchQuery]);

  const filteredEquipment = useMemo(() => {
    if (!searchQuery.trim()) return data.equipmentStandards;
    const q = searchQuery.toLowerCase();
    return data.equipmentStandards.filter(
      (eq) =>
        eq.name.toLowerCase().includes(q) ||
        eq.category.toLowerCase().includes(q) ||
        eq.specification.toLowerCase().includes(q),
    );
  }, [data.equipmentStandards, searchQuery]);

  const filteredIncidents = useMemo(() => {
    if (!searchQuery.trim()) return data.incidents;
    const q = searchQuery.toLowerCase();
    return data.incidents.filter(
      (inc) =>
        inc.description.toLowerCase().includes(q) ||
        inc.party.toLowerCase().includes(q) ||
        inc.type.toLowerCase().includes(q) ||
        inc.penalty.toLowerCase().includes(q),
    );
  }, [data.incidents, searchQuery]);

  const filteredAppeals = useMemo(() => {
    if (!searchQuery.trim()) return data.appeals;
    const q = searchQuery.toLowerCase();
    return data.appeals.filter(
      (a) =>
        a.incident.toLowerCase().includes(q) ||
        a.appellant.toLowerCase().includes(q) ||
        a.grounds.toLowerCase().includes(q),
    );
  }, [data.appeals, searchQuery]);

  const filteredCertifications = useMemo(() => {
    if (!searchQuery.trim()) return data.certifications;
    const q = searchQuery.toLowerCase();
    return data.certifications.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.holder.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [data.certifications, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery.trim()) return data.reports;
    const q = searchQuery.toLowerCase();
    return data.reports.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.format.toLowerCase().includes(q),
    );
  }, [data.reports, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompComplianceTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectRule = useCallback((rule: CompRule) => {
    setSelectedRule(rule);
    setShowRuleDetail(true);
  }, []);

  const handleSelectIncident = useCallback((incident: ComplianceIncident) => {
    setSelectedIncident(incident);
    setShowIncidentDetail(true);
  }, []);

  const handleSelectEligibility = useCallback((record: EligibilityRecord) => {
    setSelectedEligibility(record);
    setShowEligibilityDetail(true);
  }, []);

  const handleSelectTest = useCallback((test: DrugTest) => {
    setSelectedTest(test);
    setShowTestDetail(true);
  }, []);

  const handleSelectEquipment = useCallback((eq: EquipmentStandard) => {
    setSelectedEquipment(eq);
    setShowEquipmentDetail(true);
  }, []);

  const handleSelectAppeal = useCallback((appeal: Appeal) => {
    setSelectedAppeal(appeal);
    setShowAppealDetail(true);
  }, []);

  const handleSelectCert = useCallback((cert: Certification) => {
    setSelectedCert(cert);
    setShowCertDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((st) => st.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'rules':
        return (
          <RulesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredRules}
            onSelectRule={handleSelectRule}
          />
        );
      case 'eligibility':
        return (
          <EligibilityTab
            colors={colors}
            accentColor={accentColor}
            data={filteredEligibility}
            onSelectRecord={handleSelectEligibility}
          />
        );
      case 'drug-testing':
        return (
          <DrugTestingTab
            colors={colors}
            accentColor={accentColor}
            data={filteredDrugTests}
            onSelectTest={handleSelectTest}
          />
        );
      case 'equipment-standards':
        return (
          <EquipmentTab
            colors={colors}
            accentColor={accentColor}
            data={filteredEquipment}
            onSelectEquipment={handleSelectEquipment}
          />
        );
      case 'incidents':
        return (
          <IncidentsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredIncidents}
            onSelectIncident={handleSelectIncident}
          />
        );
      case 'appeals':
        return (
          <AppealsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredAppeals}
            onSelectAppeal={handleSelectAppeal}
          />
        );
      case 'certifications':
        return (
          <CertificationsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredCertifications}
            onSelectCert={handleSelectCert}
          />
        );
      case 'reports':
        return (
          <ReportsTab
            colors={colors}
            accentColor={accentColor}
            data={filteredReports}
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
        {COMP_COMPLIANCE_TABS.map((tab) => {
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
        {COMP_COMPLIANCE_SCOPE_CHIPS.map((chip, index) => {
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
            placeholder="Search\u2026"
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
      <RuleDetailSheet
        visible={showRuleDetail}
        onClose={() => setShowRuleDetail(false)}
        rule={selectedRule}
        colors={colors}
        accentColor={accentColor}
      />
      <IncidentDetailSheet
        visible={showIncidentDetail}
        onClose={() => setShowIncidentDetail(false)}
        incident={selectedIncident}
        colors={colors}
        accentColor={accentColor}
      />
      <EligibilityDetailSheet
        visible={showEligibilityDetail}
        onClose={() => setShowEligibilityDetail(false)}
        record={selectedEligibility}
        colors={colors}
        accentColor={accentColor}
      />
      <DrugTestDetailSheet
        visible={showTestDetail}
        onClose={() => setShowTestDetail(false)}
        test={selectedTest}
        colors={colors}
        accentColor={accentColor}
      />
      <EquipmentDetailSheet
        visible={showEquipmentDetail}
        onClose={() => setShowEquipmentDetail(false)}
        equipment={selectedEquipment}
        colors={colors}
        accentColor={accentColor}
      />
      <AppealDetailSheet
        visible={showAppealDetail}
        onClose={() => setShowAppealDetail(false)}
        appeal={selectedAppeal}
        colors={colors}
        accentColor={accentColor}
      />
      <CertDetailSheet
        visible={showCertDetail}
        onClose={() => setShowCertDetail(false)}
        cert={selectedCert}
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

  // -- Dashboard: List cards --
  dashListCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dashListRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  dashListDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  dashListTextCol: {
    flex: 1,
  },
  dashListTitle: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  dashListSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  dashListBadgeRow: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  dashListDate: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Rules --
  ruleCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  ruleCardTop: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  ruleCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ruleCodeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  ruleCodeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ruleCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  ruleCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  ruleFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ruleFooterText: {
    fontSize: 11,
  },

  // -- Eligibility --
  eligibilityGroup: {
    marginBottom: Spacing.lg,
  },
  eligGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  eligGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  eligGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  eligGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  eligCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  eligCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  eligCardNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  eligPlayerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  eligSeries: {
    fontSize: 12,
    marginTop: 2,
  },
  eligReason: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  eligCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  eligReviewDate: {
    fontSize: 11,
  },

  // -- Drug Testing --
  testSummaryContainer: {
    marginBottom: Spacing.md,
  },
  testSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  testSummaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  testSummaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  testSummaryItem: {
    alignItems: 'center',
  },
  testSummaryValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  testSummaryLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  testCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  testCardStripe: {
    width: 4,
  },
  testCardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  testCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  testCardNameCol: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  testAthleteName: {
    fontSize: 15,
    fontWeight: '600',
  },
  testSeriesName: {
    fontSize: 12,
    marginTop: 2,
  },
  testCardBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  testCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  testFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  testFooterText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Equipment Standards --
  equipGroup: {
    marginBottom: Spacing.lg,
  },
  equipGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  equipGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  equipGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  equipGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  equipCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  equipCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  equipName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  equipSpec: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  equipCardMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  equipMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  equipMetaText: {
    fontSize: 11,
  },

  // -- Incidents --
  incidentCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  incidentStripe: {
    width: 4,
  },
  incidentCardBody: {
    flex: 1,
    padding: Spacing.md,
  },
  incidentCardTop: {
    marginBottom: Spacing.sm,
  },
  incidentBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  incidentDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  incidentPartyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  incidentPartyText: {
    fontSize: 12,
    flex: 1,
  },
  incidentCardFooter: {
    flexDirection: 'row',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  incidentFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  incidentFooterText: {
    fontSize: 11,
  },
  incidentPenalty: {
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },

  // -- Appeals --
  appealCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  appealCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  appealCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  appealIncident: {
    fontSize: 15,
    fontWeight: '600',
  },
  appealAppellant: {
    fontSize: 13,
    marginTop: 2,
  },
  appealGrounds: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  appealCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  appealFooterItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  appealFooterText: {
    fontSize: 11,
  },

  // -- Certifications --
  certGroup: {
    marginBottom: Spacing.lg,
  },
  certGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  certGroupDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  certGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  certGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  certCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  certCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  certIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certCardInfo: {
    flex: 1,
  },
  certName: {
    fontSize: 14,
    fontWeight: '600',
  },
  certHolder: {
    fontSize: 13,
    marginTop: 1,
  },
  certCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  certExpiryText: {
    fontSize: 11,
  },

  // -- Reports --
  reportCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    alignItems: 'center',
  },
  reportCardLeft: {
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportFormatBadge: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportFormatText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reportCardContent: {
    flex: 1,
    paddingVertical: Spacing.sm,
  },
  reportName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    marginBottom: 4,
  },
  reportDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reportDateText: {
    fontSize: 11,
  },
  reportCardAction: {
    paddingHorizontal: Spacing.md,
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
    fontSize: 16,
    fontWeight: '700',
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
