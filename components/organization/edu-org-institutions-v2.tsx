/**
 * Education Organization Institutions v2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Directory | Pipeline | Coverage | Admissions | Academics | Housing | Compliance | Deadlines | Reports
 * RBAC: E0–E5 full, E6/E7 partial (Overview+Directory+Admissions+Academics+Housing), E8–E11 limited (Overview+Directory), E12/E13 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel, isStudent, isEnrolled } from '@/utils/education-rbac';
import {
  getEduInstitutionsV2Data,
  INSTITUTION_STATUS_LABELS,
  INSTITUTION_STATUS_COLORS,
  INSTITUTION_TYPE_LABELS,
  INSTITUTION_TYPE_ICONS,
  HEALTH_LEVEL_COLORS,
  HEALTH_CATEGORY_LABELS,
  HEALTH_CATEGORY_ICONS,
  PIPELINE_STAGE_LABELS,
  PIPELINE_STAGE_COLORS,
  PRIORITY_LABELS,
  PRIORITY_COLORS,
  RISK_LABELS,
  RISK_COLORS,
  TODAY_TYPE_LABELS,
  TODAY_TYPE_COLORS,
  TODAY_PRIORITY_COLORS,
} from '@/data/mock-edu-org-institutions-v2';
import type {
  EduInstitution,
  TodayItem,
  NextMilestone,
  OverviewTiles,
  HealthCategory,
} from '@/data/mock-edu-org-institutions-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'directory', label: 'Directory' },
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'coverage', label: 'Coverage' },
  { id: 'admissions', label: 'Admissions' },
  { id: 'academics', label: 'Academics' },
  { id: 'housing', label: 'Housing' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'reports', label: 'Reports' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: EducationRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

// =============================================================================
// LOCAL PRIMITIVES
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getEduInstitutionsV2Data>;
}) {
  const { overviewTiles, todayItems, nextMilestones, institutions } = data;
  const enrollPct = Math.round((overviewTiles.totalEnrollment / overviewTiles.enrollmentTarget) * 100);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{overviewTiles.totalInstitutions}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Institutions</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{overviewTiles.activeCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{overviewTiles.pipelineCount}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pipeline</ThemedText>
        </View>
      </View>

      {/* Enrollment */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="person.3.fill" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Total Enrollment</ThemedText>
          <ThemedText style={[s.percentLabel, { color: accentColor }]}>{enrollPct}%</ThemedText>
        </View>
        <ProgressBar percent={enrollPct} color={accentColor} />
        <View style={s.enrollRow}>
          <ThemedText style={[s.enrollText, { color: colors.textSecondary }]}>
            {overviewTiles.totalEnrollment.toLocaleString()} / {overviewTiles.enrollmentTarget.toLocaleString()}
          </ThemedText>
        </View>
      </View>

      {/* Admissions Funnel */}
      <View style={[s.sectionCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: Spacing.sm }]}>
        <View style={s.sectionCardHeader}>
          <IconSymbol name="person.badge.plus" size={16} color={accentColor} />
          <ThemedText style={[s.sectionCardTitle, { color: colors.text }]}>Admissions Funnel</ThemedText>
        </View>
        <View style={s.funnelRow}>
          <View style={s.funnelItem}>
            <ThemedText style={[s.funnelValue, { color: colors.text }]}>{overviewTiles.admissionsFunnel.apps.toLocaleString()}</ThemedText>
            <ThemedText style={[s.funnelLabel, { color: colors.textSecondary }]}>Apps</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          <View style={s.funnelItem}>
            <ThemedText style={[s.funnelValue, { color: colors.text }]}>{overviewTiles.admissionsFunnel.admits.toLocaleString()}</ThemedText>
            <ThemedText style={[s.funnelLabel, { color: colors.textSecondary }]}>Admits</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          <View style={s.funnelItem}>
            <ThemedText style={[s.funnelValue, { color: colors.text }]}>{overviewTiles.admissionsFunnel.deposits.toLocaleString()}</ThemedText>
            <ThemedText style={[s.funnelLabel, { color: colors.textSecondary }]}>Deposits</ThemedText>
          </View>
        </View>
      </View>

      {/* Risk Row */}
      <View style={[s.kpiRow, { marginTop: Spacing.sm }]}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{overviewTiles.housingOccupancy}%</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Housing</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: overviewTiles.complianceAlerts > 0 ? '#F59E0B' : '#22C55E' }]}>
            {overviewTiles.complianceAlerts}
          </ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Alerts</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{overviewTiles.tuitionReceivable}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Tuition AR</ThemedText>
        </View>
      </View>

      {/* Today's Items */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Today
      </ThemedText>
      {todayItems.map((item) => {
        const typeColor = TODAY_TYPE_COLORS[item.type];
        const priorityColor = TODAY_PRIORITY_COLORS[item.priority];
        return (
          <View key={item.id} style={[s.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.todayDot, { backgroundColor: typeColor }]} />
            <View style={s.todayContent}>
              <ThemedText style={[s.todayTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</ThemedText>
              <ThemedText style={[s.todayInst, { color: colors.textTertiary }]}>{item.institution}</ThemedText>
            </View>
            <StatusBadge label={item.priority.toUpperCase()} color={priorityColor} />
          </View>
        );
      })}

      {/* Next Milestones */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Next Milestones
      </ThemedText>
      {nextMilestones.map((ms) => (
        <View key={ms.id} style={[s.milestoneRow, { borderBottomColor: colors.border }]}>
          <View style={s.milestoneLeft}>
            <ThemedText style={[s.milestoneTitle, { color: colors.text }]} numberOfLines={1}>{ms.title}</ThemedText>
            <ThemedText style={[s.milestoneInst, { color: colors.textTertiary }]}>{ms.institution}</ThemedText>
          </View>
          <View style={s.milestoneRight}>
            <StatusBadge label={ms.category.toUpperCase()} color={accentColor} />
            <ThemedText style={[s.milestoneDate, { color: colors.textSecondary }]}>{formatDate(ms.date)}</ThemedText>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// DIRECTORY SUB-TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  institutions,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
  onSelect: (inst: EduInstitution) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: EduInstitution }) => {
      const statusColor = INSTITUTION_STATUS_COLORS[item.status];
      const statusLabel = INSTITUTION_STATUS_LABELS[item.status];
      const typeLabel = INSTITUTION_TYPE_LABELS[item.type];
      const typeIcon = INSTITUTION_TYPE_ICONS[item.type];
      const riskColor = RISK_COLORS[item.risk];
      const riskLabel = RISK_LABELS[item.risk];
      return (
        <Pressable
          style={[s.instCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(item);
          }}
        >
          <View style={s.instCardTop}>
            <IconSymbol name={typeIcon as any} size={18} color={accentColor} />
            <View style={s.instCardTextCol}>
              <ThemedText style={[s.instName, { color: colors.text }]} numberOfLines={1}>{item.name}</ThemedText>
              <ThemedText style={[s.instLocation, { color: colors.textTertiary }]}>{item.location}</ThemedText>
            </View>
          </View>
          <View style={s.instBadgeRow}>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
            <StatusBadge label={riskLabel.toUpperCase()} color={riskColor} />
          </View>
          {/* Health bars preview */}
          <View style={s.healthPreview}>
            {(Object.keys(item.healthBars) as HealthCategory[]).map((cat) => {
              const h = item.healthBars[cat];
              return (
                <View key={cat} style={s.healthDot}>
                  <View style={[s.healthDotInner, { backgroundColor: HEALTH_LEVEL_COLORS[h.level] }]} />
                </View>
              );
            })}
          </View>
          <View style={[s.instMeta, { borderTopColor: colors.border }]}>
            <ThemedText style={[s.instMetaText, { color: colors.textSecondary }]}>
              Enrollment: {item.enrollment.current.toLocaleString()} / {item.enrollment.target.toLocaleString()}
            </ThemedText>
            <ThemedText style={[s.instMetaText, { color: colors.textSecondary }]}>
              Deposits: {item.deposits.toLocaleString()}
            </ThemedText>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelect],
  );

  return (
    <FlatList
      data={institutions}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState icon="building.columns.fill" label="No institutions" colors={colors} />}
    />
  );
}

// =============================================================================
// PIPELINE SUB-TAB
// =============================================================================

function PipelineTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  const pipelineInsts = useMemo(
    () => institutions.filter((i) => i.status === 'pipeline' || i.pipelineStage),
    [institutions],
  );

  const stages = ['discovery', 'review', 'loi', 'active'] as const;

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {stages.map((stage) => {
        const inStage = pipelineInsts.filter((i) => i.pipelineStage === stage);
        if (inStage.length === 0) return null;
        const stageColor = PIPELINE_STAGE_COLORS[stage];
        const stageLabel = PIPELINE_STAGE_LABELS[stage];
        return (
          <View key={stage}>
            <View style={s.pipelineStageHeader}>
              <View style={[s.pipelineStageDot, { backgroundColor: stageColor }]} />
              <ThemedText style={[s.pipelineStageLabel, { color: colors.text }]}>
                {stageLabel} ({inStage.length})
              </ThemedText>
            </View>
            {inStage.map((inst) => (
              <View key={inst.id} style={[s.pipelineCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: stageColor }]}>
                <ThemedText style={[s.pipelineCardName, { color: colors.text }]}>{inst.name}</ThemedText>
                <ThemedText style={[s.pipelineCardLoc, { color: colors.textTertiary }]}>{inst.location}</ThemedText>
                <View style={s.pipelineBadgeRow}>
                  <StatusBadge label={PRIORITY_LABELS[inst.priority].toUpperCase()} color={PRIORITY_COLORS[inst.priority]} />
                  <StatusBadge label={RISK_LABELS[inst.risk].toUpperCase()} color={RISK_COLORS[inst.risk]} />
                </View>
                {inst.nextActions.length > 0 && (
                  <View style={[s.pipelineActions, { borderTopColor: colors.border }]}>
                    {inst.nextActions.map((a, i) => (
                      <View key={`${inst.id}-action-${i}`} style={s.pipelineActionRow}>
                        <ThemedText style={[s.pipelineActionText, { color: colors.textSecondary }]} numberOfLines={1}>
                          {a.action}
                        </ThemedText>
                        <ThemedText style={[s.pipelineActionDate, { color: colors.textTertiary }]}>
                          {formatDate(a.due)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        );
      })}
      {pipelineInsts.length === 0 && (
        <EmptyState icon="arrow.triangle.branch" label="No pipeline institutions" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// COVERAGE SUB-TAB
// =============================================================================

function CoverageTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  const categories = ['admissions', 'academics', 'campus', 'athletics', 'financial', 'housing', 'compliance'] as HealthCategory[];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Health Coverage Matrix</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Across all institutions
      </ThemedText>

      {categories.map((cat) => {
        const catLabel = HEALTH_CATEGORY_LABELS[cat];
        const catIcon = HEALTH_CATEGORY_ICONS[cat];
        const scores = institutions.map((inst) => inst.healthBars[cat]?.score ?? 0);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
        const avgColor = avgScore >= 75 ? '#22C55E' : avgScore >= 50 ? '#F59E0B' : '#EF4444';
        return (
          <View key={cat} style={[s.coverageRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.coverageLeft}>
              <IconSymbol name={catIcon as any} size={16} color={accentColor} />
              <ThemedText style={[s.coverageLabel, { color: colors.text }]}>{catLabel}</ThemedText>
            </View>
            <View style={s.coverageRight}>
              <View style={s.coverageDots}>
                {institutions.map((inst) => {
                  const h = inst.healthBars[cat];
                  return (
                    <View key={inst.id} style={[s.coverageDot, { backgroundColor: h ? HEALTH_LEVEL_COLORS[h.level] : '#A1A1AA' }]} />
                  );
                })}
              </View>
              <ThemedText style={[s.coverageAvg, { color: avgColor }]}>{avgScore}%</ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// ADMISSIONS SUB-TAB
// =============================================================================

function AdmissionsTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Admissions by Institution</ThemedText>
      {institutions.map((inst) => {
        const admHealth = inst.healthBars.admissions;
        const healthColor = HEALTH_LEVEL_COLORS[admHealth.level];
        const depositPct = inst.enrollment.target > 0 ? Math.round((inst.deposits / inst.enrollment.target) * 100) : 0;
        return (
          <View key={inst.id} style={[s.admCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.admHeader}>
              <ThemedText style={[s.admName, { color: colors.text }]}>{inst.shortName}</ThemedText>
              <StatusBadge label={`${admHealth.score}%`} color={healthColor} />
            </View>
            <View style={s.admKpis}>
              {inst.keyNumbers.slice(0, 4).map((kn, i) => (
                <View key={`${inst.id}-kn-${i}`} style={s.admKpi}>
                  <ThemedText style={[s.admKpiValue, { color: colors.text }]}>{kn.value}</ThemedText>
                  <ThemedText style={[s.admKpiLabel, { color: colors.textSecondary }]}>{kn.label}</ThemedText>
                </View>
              ))}
            </View>
            <View style={s.admProgressRow}>
              <ThemedText style={[s.admProgressLabel, { color: colors.textSecondary }]}>
                Deposit Yield: {depositPct}%
              </ThemedText>
            </View>
            <ProgressBar percent={depositPct} color={accentColor} />
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// ACADEMICS SUB-TAB
// =============================================================================

function AcademicsTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Academic Health</ThemedText>
      {institutions.map((inst) => {
        const acadHealth = inst.healthBars.academics;
        const healthColor = HEALTH_LEVEL_COLORS[acadHealth.level];
        const retention = inst.keyNumbers.find((k) => k.label === 'Retention Rate');
        const gpa = inst.keyNumbers.find((k) => k.label === 'Avg GPA');
        return (
          <View key={inst.id} style={[s.acadCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.acadHeader}>
              <ThemedText style={[s.acadName, { color: colors.text }]}>{inst.shortName}</ThemedText>
              <StatusBadge label={`${acadHealth.score}%`} color={healthColor} />
            </View>
            <View style={s.acadKpis}>
              {retention && (
                <View style={s.acadKpi}>
                  <ThemedText style={[s.acadKpiValue, { color: colors.text }]}>{retention.value}</ThemedText>
                  <ThemedText style={[s.acadKpiLabel, { color: colors.textSecondary }]}>Retention</ThemedText>
                </View>
              )}
              {gpa && (
                <View style={s.acadKpi}>
                  <ThemedText style={[s.acadKpiValue, { color: colors.text }]}>{gpa.value}</ThemedText>
                  <ThemedText style={[s.acadKpiLabel, { color: colors.textSecondary }]}>Avg GPA</ThemedText>
                </View>
              )}
              <View style={s.acadKpi}>
                <ThemedText style={[s.acadKpiValue, { color: colors.text }]}>{inst.enrollment.current.toLocaleString()}</ThemedText>
                <ThemedText style={[s.acadKpiLabel, { color: colors.textSecondary }]}>Enrolled</ThemedText>
              </View>
            </View>
            {inst.nextActions.filter((a) => a.action.toLowerCase().includes('accredit') || a.action.toLowerCase().includes('curriculum') || a.action.toLowerCase().includes('academic')).length > 0 && (
              <View style={[s.acadActions, { borderTopColor: colors.border }]}>
                {inst.nextActions
                  .filter((a) => a.action.toLowerCase().includes('accredit') || a.action.toLowerCase().includes('curriculum') || a.action.toLowerCase().includes('academic'))
                  .map((a, i) => (
                    <View key={`${inst.id}-acad-${i}`} style={s.acadActionRow}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
                      <ThemedText style={[s.acadActionText, { color: colors.textSecondary }]} numberOfLines={1}>
                        {a.action}
                      </ThemedText>
                    </View>
                  ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// HOUSING SUB-TAB
// =============================================================================

function HousingTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Housing Occupancy</ThemedText>
      {institutions.map((inst) => {
        const housingHealth = inst.healthBars.housing;
        const healthColor = HEALTH_LEVEL_COLORS[housingHealth.level];
        const occColor = inst.housingOccupancy >= 85 ? '#22C55E' : inst.housingOccupancy >= 60 ? '#F59E0B' : '#EF4444';
        return (
          <View key={inst.id} style={[s.housingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.housingHeader}>
              <View>
                <ThemedText style={[s.housingName, { color: colors.text }]}>{inst.shortName}</ThemedText>
                <ThemedText style={[s.housingLoc, { color: colors.textTertiary }]}>{inst.location}</ThemedText>
              </View>
              <View style={s.housingRight}>
                <ThemedText style={[s.housingOcc, { color: occColor }]}>{inst.housingOccupancy}%</ThemedText>
                <ThemedText style={[s.housingOccLabel, { color: colors.textSecondary }]}>Occupied</ThemedText>
              </View>
            </View>
            <ProgressBar percent={inst.housingOccupancy} color={occColor} />
            <View style={s.housingMeta}>
              <StatusBadge label={`HEALTH: ${housingHealth.score}%`} color={healthColor} />
              <ThemedText style={[s.housingTrend, { color: colors.textTertiary }]}>
                {housingHealth.trend === 'up' ? 'Trending Up' : housingHealth.trend === 'down' ? 'Trending Down' : 'Flat'}
              </ThemedText>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// COMPLIANCE SUB-TAB
// =============================================================================

function ComplianceTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  const sorted = useMemo(() => [...institutions].sort((a, b) => b.complianceAlerts - a.complianceAlerts), [institutions]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Compliance Alerts</ThemedText>
      {sorted.map((inst) => {
        const compHealth = inst.healthBars.compliance;
        const healthColor = HEALTH_LEVEL_COLORS[compHealth.level];
        const alertColor = inst.complianceAlerts > 3 ? '#EF4444' : inst.complianceAlerts > 0 ? '#F59E0B' : '#22C55E';
        return (
          <View key={inst.id} style={[s.compCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.compHeader}>
              <ThemedText style={[s.compName, { color: colors.text }]}>{inst.shortName}</ThemedText>
              <View style={s.compRight}>
                <ThemedText style={[s.compAlertCount, { color: alertColor }]}>{inst.complianceAlerts}</ThemedText>
                <ThemedText style={[s.compAlertLabel, { color: colors.textSecondary }]}>alerts</ThemedText>
              </View>
            </View>
            <ProgressBar percent={compHealth.score} color={healthColor} />
            <View style={s.compMeta}>
              <StatusBadge label={`HEALTH: ${compHealth.score}%`} color={healthColor} />
              <StatusBadge label={RISK_LABELS[inst.risk].toUpperCase()} color={RISK_COLORS[inst.risk]} />
            </View>
            {inst.nextActions
              .filter((a) => a.action.toLowerCase().includes('compliance') || a.action.toLowerCase().includes('sacscoc') || a.action.toLowerCase().includes('accreditation'))
              .map((a, i) => (
                <View key={`${inst.id}-comp-${i}`} style={s.compActionRow}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#F59E0B" />
                  <ThemedText style={[s.compActionText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {a.action} — {formatDate(a.due)}
                  </ThemedText>
                </View>
              ))}
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// DEADLINES SUB-TAB
// =============================================================================

function DeadlinesTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getEduInstitutionsV2Data>;
}) {
  const { overviewTiles, nextMilestones, institutions } = data;

  // Collect all action deadlines
  const allActions = useMemo(() => {
    const actions: { institution: string; action: string; owner: string; due: string }[] = [];
    institutions.forEach((inst) => {
      inst.nextActions.forEach((a) => {
        actions.push({ institution: inst.shortName, ...a });
      });
    });
    return actions.sort((a, b) => a.due.localeCompare(b.due));
  }, [institutions]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Upcoming Deadlines</ThemedText>

      {/* Major deadlines from overview */}
      {overviewTiles.deadlines.map((d, i) => (
        <View key={`deadline-${i}`} style={[s.deadlineCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.deadlineLeft}>
            <IconSymbol name="calendar.badge.exclamationmark" size={16} color="#EF4444" />
            <View style={s.deadlineTextCol}>
              <ThemedText style={[s.deadlineTitle, { color: colors.text }]}>{d.title}</ThemedText>
              <ThemedText style={[s.deadlineInst, { color: colors.textTertiary }]}>{d.institution}</ThemedText>
            </View>
          </View>
          <ThemedText style={[s.deadlineDate, { color: accentColor }]}>{formatDate(d.date)}</ThemedText>
        </View>
      ))}

      {/* All action items */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>All Action Items</ThemedText>
      {allActions.map((a, i) => (
        <View key={`action-${i}`} style={[s.actionItemRow, { borderBottomColor: colors.border }]}>
          <View style={s.actionItemLeft}>
            <ThemedText style={[s.actionItemText, { color: colors.text }]} numberOfLines={1}>{a.action}</ThemedText>
            <ThemedText style={[s.actionItemMeta, { color: colors.textTertiary }]}>
              {a.institution} — {a.owner}
            </ThemedText>
          </View>
          <ThemedText style={[s.actionItemDate, { color: colors.textSecondary }]}>{formatDate(a.due)}</ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// REPORTS SUB-TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
  institutions,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  institutions: EduInstitution[];
}) {
  const reports = [
    { id: 'r1', name: 'Enrollment Summary', icon: 'person.3.fill', desc: 'Enrollment vs target across all institutions' },
    { id: 'r2', name: 'Admissions Funnel', icon: 'person.badge.plus', desc: 'Application to deposit conversion rates' },
    { id: 'r3', name: 'Health Dashboard', icon: 'heart.text.square.fill', desc: 'Institutional health across 7 categories' },
    { id: 'r4', name: 'Compliance Summary', icon: 'checkmark.shield.fill', desc: 'Alert counts, risk levels, and deadline status' },
    { id: 'r5', name: 'Housing Occupancy', icon: 'house.fill', desc: 'Occupancy rates and trending by institution' },
    { id: 'r6', name: 'Financial Overview', icon: 'dollarsign.circle.fill', desc: 'Tuition AR, aging risk, and collection rates' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Report Packets</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Generate institution portfolio reports
      </ThemedText>

      {reports.map((report) => (
        <View key={report.id} style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.reportCardTop}>
            <IconSymbol name={report.icon as any} size={18} color={accentColor} />
            <View style={s.reportTextCol}>
              <ThemedText style={[s.reportName, { color: colors.text }]}>{report.name}</ThemedText>
              <ThemedText style={[s.reportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                {report.desc}
              </ThemedText>
            </View>
          </View>
          <Pressable
            style={[s.generateButton, { backgroundColor: accentColor + '18', borderColor: accentColor + '40' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <IconSymbol name="arrow.down.doc.fill" size={14} color={accentColor} />
            <ThemedText style={[s.generateButtonText, { color: accentColor }]}>Generate</ThemedText>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// INSTITUTION DETAIL BOTTOM SHEET
// =============================================================================

function InstitutionDetailSheet({
  visible,
  onClose,
  institution,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  institution: EduInstitution | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!institution) return null;

  const statusColor = INSTITUTION_STATUS_COLORS[institution.status];
  const statusLabel = INSTITUTION_STATUS_LABELS[institution.status];
  const riskColor = RISK_COLORS[institution.risk];
  const riskLabel = RISK_LABELS[institution.risk];
  const enrollPct = Math.round((institution.enrollment.current / institution.enrollment.target) * 100);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={institution.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        <StatusBadge label={INSTITUTION_TYPE_LABELS[institution.type].toUpperCase()} color={accentColor} />
        <StatusBadge label={riskLabel.toUpperCase()} color={riskColor} />
        <StatusBadge label={PRIORITY_LABELS[institution.priority].toUpperCase()} color={PRIORITY_COLORS[institution.priority]} />
      </View>

      {/* Location */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Location</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{institution.location}</ThemedText>
      </View>

      {/* Leadership */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Leadership</ThemedText>
        {institution.leadership.map((l, i) => (
          <View key={`leader-${i}`} style={s.sheetListRow}>
            <IconSymbol name="person.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>{l.name}</ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>{l.title}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Key Numbers */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Key Numbers</ThemedText>
        <View style={s.sheetDetailsGrid}>
          {institution.keyNumbers.map((kn, i) => (
            <View key={`kn-${i}`} style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{kn.value}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>{kn.label}</ThemedText>
            </View>
          ))}
        </View>
      </View>

      {/* Health Bars */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Health</ThemedText>
        {(Object.keys(institution.healthBars) as HealthCategory[]).map((cat) => {
          const h = institution.healthBars[cat];
          const healthColor = HEALTH_LEVEL_COLORS[h.level];
          return (
            <View key={cat} style={s.sheetHealthRow}>
              <ThemedText style={[s.sheetHealthLabel, { color: colors.textSecondary }]}>
                {HEALTH_CATEGORY_LABELS[cat]}
              </ThemedText>
              <View style={s.sheetHealthBar}>
                <ProgressBar percent={h.score} color={healthColor} />
              </View>
              <ThemedText style={[s.sheetHealthScore, { color: healthColor }]}>{h.score}%</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Enrollment */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Enrollment</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {institution.enrollment.current.toLocaleString()} / {institution.enrollment.target.toLocaleString()} ({enrollPct}%)
        </ThemedText>
        <ProgressBar percent={enrollPct} color={accentColor} />
      </View>

      {/* Next Actions */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Next Actions</ThemedText>
        {institution.nextActions.map((a, i) => (
          <View key={`action-${i}`} style={s.sheetListRow}>
            <IconSymbol name="arrow.right.circle.fill" size={14} color={accentColor} />
            <View style={s.sheetListTextCol}>
              <ThemedText style={[s.sheetListTitle, { color: colors.text }]} numberOfLines={2}>{a.action}</ThemedText>
              <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
                {a.owner} — Due {formatDate(a.due)}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduOrgInstitutionsV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: External (E12/E13) locked ===
  if (!isEnrolled(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>Institutions</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          Institution details are not available for public access
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedInstitution, setSelectedInstitution] = useState<EduInstitution | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduInstitutionsV2Data(), []);

  // === Callbacks ===
  const handleSelectInstitution = useCallback((inst: EduInstitution) => {
    setSelectedInstitution(inst);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS; // E1/E2: full 10 tabs
    if (isFacultyLevel(role)) {
      // E3: Overview + Directory + Admissions + Academics + Housing
      return SUB_TABS.filter(
        (t) => t.id === 'overview' || t.id === 'directory' || t.id === 'admissions' || t.id === 'academics' || t.id === 'housing',
      );
    }
    // E4 (Student): Overview + Directory only
    return SUB_TABS.filter((t) => t.id === 'overview' || t.id === 'directory');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} data={data} />;
      case 'directory':
        return <DirectoryTab colors={colors} accentColor={accentColor} institutions={data.institutions} onSelect={handleSelectInstitution} />;
      case 'pipeline':
        if (!isDeanLevel(role)) return null;
        return <PipelineTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      case 'coverage':
        if (!isDeanLevel(role)) return null;
        return <CoverageTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      case 'admissions':
        if (isStudent(role)) return null;
        return <AdmissionsTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      case 'academics':
        if (isStudent(role)) return null;
        return <AcademicsTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      case 'housing':
        if (isStudent(role)) return null;
        return <HousingTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      case 'compliance':
        if (!isDeanLevel(role)) return null;
        return <ComplianceTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      case 'deadlines':
        if (!isDeanLevel(role)) return null;
        return <DeadlinesTab colors={colors} accentColor={accentColor} data={data} />;
      case 'reports':
        if (!isDeanLevel(role)) return null;
        return <ReportsTab colors={colors} accentColor={accentColor} institutions={data.institutions} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />
      <View style={s.contentContainer}>
        {renderContent()}
      </View>
      <InstitutionDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        institution={selectedInstitution}
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
  container: { flex: 1 },
  contentContainer: { flex: 1 },

  // Locked
  lockedContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  lockedTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  lockedMessage: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm },

  // Sub-tab bar
  subTabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.md },
  subTab: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.xs },
  subTabText: { fontSize: 13, fontWeight: '600' },

  // Scroll containers
  tabScroll: { padding: Spacing.md, paddingBottom: 120 },
  tabListContent: { padding: Spacing.md, paddingBottom: 120 },

  // Section titles
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.xs },
  sectionSubtitle: { fontSize: 12, marginBottom: Spacing.md },

  // Empty state
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Progress bar
  progressTrack: { height: 4, backgroundColor: '#2F3336', borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: 4, borderRadius: 2 },

  // KPI
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1 },
  kpiValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  kpiLabel: { fontSize: 11, marginTop: 2 },

  // Section card
  sectionCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md },
  sectionCardHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sectionCardTitle: { fontSize: 14, fontWeight: '700', flex: 1 },
  percentLabel: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },

  // Enroll
  enrollRow: { flexDirection: 'row', justifyContent: 'center' },
  enrollText: { fontSize: 12 },

  // Funnel
  funnelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  funnelItem: { alignItems: 'center' },
  funnelValue: { fontSize: 18, fontWeight: '700', fontVariant: ['tabular-nums'] },
  funnelLabel: { fontSize: 11, marginTop: 2 },

  // Today
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  todayDot: { width: 10, height: 10, borderRadius: 5 },
  todayContent: { flex: 1 },
  todayTitle: { fontSize: 13, fontWeight: '500' },
  todayInst: { fontSize: 11, marginTop: 2 },

  // Milestones
  milestoneRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.sm },
  milestoneLeft: { flex: 1 },
  milestoneTitle: { fontSize: 13, fontWeight: '500' },
  milestoneInst: { fontSize: 11, marginTop: 2 },
  milestoneRight: { alignItems: 'flex-end', gap: 4 },
  milestoneDate: { fontSize: 11 },

  // Institution card
  instCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  instCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  instCardTextCol: { flex: 1 },
  instName: { fontSize: 14, fontWeight: '600' },
  instLocation: { fontSize: 12, marginTop: 2 },
  instBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },
  healthPreview: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  healthDot: { width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  healthDotInner: { width: 10, height: 10, borderRadius: 5 },
  instMeta: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  instMetaText: { fontSize: 11 },

  // Pipeline
  pipelineStageHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm, marginTop: Spacing.md },
  pipelineStageDot: { width: 12, height: 12, borderRadius: 6 },
  pipelineStageLabel: { fontSize: 15, fontWeight: '700' },
  pipelineCard: { borderRadius: BorderRadius.lg, borderWidth: 1, borderLeftWidth: 4, padding: Spacing.md, marginBottom: Spacing.sm },
  pipelineCardName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  pipelineCardLoc: { fontSize: 12, marginBottom: Spacing.sm },
  pipelineBadgeRow: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  pipelineActions: { paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  pipelineActionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  pipelineActionText: { flex: 1, fontSize: 12 },
  pipelineActionDate: { fontSize: 11 },

  // Coverage
  coverageRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  coverageLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  coverageLabel: { fontSize: 13, fontWeight: '600' },
  coverageRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  coverageDots: { flexDirection: 'row', gap: 4 },
  coverageDot: { width: 10, height: 10, borderRadius: 5 },
  coverageAvg: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'], width: 36, textAlign: 'right' },

  // Admissions
  admCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  admHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  admName: { fontSize: 15, fontWeight: '700' },
  admKpis: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.sm },
  admKpi: {},
  admKpiValue: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  admKpiLabel: { fontSize: 10, marginTop: 1 },
  admProgressRow: { marginBottom: 4 },
  admProgressLabel: { fontSize: 11 },

  // Academics
  acadCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  acadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  acadName: { fontSize: 15, fontWeight: '700' },
  acadKpis: { flexDirection: 'row', gap: Spacing.lg },
  acadKpi: { alignItems: 'center' },
  acadKpiValue: { fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  acadKpiLabel: { fontSize: 10, marginTop: 1 },
  acadActions: { paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  acadActionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  acadActionText: { flex: 1, fontSize: 12 },

  // Housing
  housingCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  housingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.sm },
  housingName: { fontSize: 15, fontWeight: '700' },
  housingLoc: { fontSize: 12, marginTop: 2 },
  housingRight: { alignItems: 'flex-end' },
  housingOcc: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  housingOccLabel: { fontSize: 10 },
  housingMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  housingTrend: { fontSize: 11 },

  // Compliance
  compCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  compHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.sm },
  compName: { fontSize: 15, fontWeight: '700' },
  compRight: { alignItems: 'flex-end' },
  compAlertCount: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  compAlertLabel: { fontSize: 10 },
  compMeta: { flexDirection: 'row', gap: 6, marginBottom: Spacing.sm },
  compActionRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  compActionText: { flex: 1, fontSize: 12 },

  // Deadlines
  deadlineCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  deadlineLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  deadlineTextCol: { flex: 1 },
  deadlineTitle: { fontSize: 13, fontWeight: '600' },
  deadlineInst: { fontSize: 11, marginTop: 2 },
  deadlineDate: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },

  actionItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.sm },
  actionItemLeft: { flex: 1 },
  actionItemText: { fontSize: 13, fontWeight: '500' },
  actionItemMeta: { fontSize: 11, marginTop: 2 },
  actionItemDate: { fontSize: 11 },

  // Reports
  reportCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  reportCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  reportTextCol: { flex: 1 },
  reportName: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  reportDesc: { fontSize: 12, lineHeight: 17 },
  generateButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.sm, paddingVertical: 10, borderRadius: BorderRadius.md, borderWidth: 1 },
  generateButtonText: { fontSize: 13, fontWeight: '600' },

  // Bottom Sheet
  sheetBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  sheetSection: { paddingBottom: Spacing.md, marginBottom: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetSectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  sheetBodyText: { fontSize: 13, lineHeight: 19 },
  sheetDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md },
  sheetDetailItem: { width: '45%' },
  sheetDetailValue: { fontSize: 14, fontWeight: '600' },
  sheetDetailLabel: { fontSize: 11, marginTop: 1 },
  sheetListRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6 },
  sheetListTextCol: { flex: 1 },
  sheetListTitle: { fontSize: 13, fontWeight: '500' },
  sheetListSubtitle: { fontSize: 11, marginTop: 1 },
  sheetHealthRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: 6 },
  sheetHealthLabel: { fontSize: 12, width: 80 },
  sheetHealthBar: { flex: 1 },
  sheetHealthScore: { fontSize: 12, fontWeight: '700', fontVariant: ['tabular-nums'], width: 36, textAlign: 'right' },
  sheetActions: { gap: Spacing.sm, marginTop: Spacing.sm },
  sheetGhostButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: 1 },
  sheetGhostButtonText: { fontSize: 14, fontWeight: '600' },
});
