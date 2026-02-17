/**
 * Compliance Hub — v2
 * Mode-aware compliance management hub with pill navigation.
 * Tabs: Home | Policies | Audits | Incidents | Training | Reports
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode } from '@/context/app-context';
import {
  COMPLIANCE_POLICIES,
  COMPLIANCE_AUDITS,
  COMPLIANCE_INCIDENTS,
  COMPLIANCE_TRAINING,
  COMPLIANCE_SNAPSHOTS,
  type ComplianceStatus,
  type PolicyCategory,
  type AuditStatus,
  type CompliancePolicy,
  type ComplianceAudit,
  type ComplianceIncident,
  type ComplianceTraining,
} from '@/data/mock-compliance';

// =============================================================================
// CONSTANTS
// =============================================================================

type HubTab = 'home' | 'policies' | 'audits' | 'incidents' | 'training' | 'reports';

const HUB_TABS: { id: HubTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'policies', label: 'Policies' },
  { id: 'audits', label: 'Audits' },
  { id: 'incidents', label: 'Incidents' },
  { id: 'training', label: 'Training' },
  { id: 'reports', label: 'Reports' },
];

const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, string> = {
  compliant: '#22C55E',
  warning: '#F59E0B',
  violation: '#EF4444',
  'pending-review': '#6AA9FF',
};

const AUDIT_STATUS_COLORS: Record<AuditStatus, string> = {
  passed: '#22C55E',
  failed: '#EF4444',
  'in-progress': '#6AA9FF',
  scheduled: '#F59E0B',
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#EF4444',
  major: '#F59E0B',
  minor: '#F5D90B',
};

const INCIDENT_STATUS_COLORS: Record<string, string> = {
  open: '#EF4444',
  investigating: '#F59E0B',
  resolved: '#22C55E',
  closed: '#8F8F8F',
};

const CATEGORY_LABELS: Record<PolicyCategory, string> = {
  eligibility: 'Eligibility',
  financial: 'Financial',
  safety: 'Safety',
  conduct: 'Conduct',
  reporting: 'Reporting',
  privacy: 'Privacy',
  governance: 'Governance',
};

// =============================================================================
// SHARED UI
// =============================================================================

function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }, style]}>
      {children}
    </View>
  );
}

function SectionHeader({ title }: { title: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <ThemedText style={[styles.sectionHeader, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[styles.badgeText, { color }]}>
        {label.toUpperCase().replace('-', ' ')}
      </ThemedText>
    </View>
  );
}

function FilterPills({ options, active, onSelect }: { options: string[]; active: string; onSelect: (v: string) => void }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
      <View style={styles.filterRow}>
        {options.map((opt) => {
          const isActive = opt === active;
          return (
            <Pressable
              key={opt}
              style={[
                styles.filterPill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onSelect(opt);
              }}
            >
              <ThemedText style={[styles.filterPillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {opt}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

function EmptyState({ message }: { message: string }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  return (
    <View style={styles.emptyState}>
      <IconSymbol name="tray.fill" size={28} color={colors.textTertiary} />
      <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>{message}</ThemedText>
    </View>
  );
}

// =============================================================================
// HOME VIEW
// =============================================================================

function HomeView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const snapshot = COMPLIANCE_SNAPSHOTS[mode];
  const policies = COMPLIANCE_POLICIES[mode];
  const incidents = COMPLIANCE_INCIDENTS[mode];
  const audits = COMPLIANCE_AUDITS[mode];
  const training = COMPLIANCE_TRAINING[mode];

  const statusColor = COMPLIANCE_STATUS_COLORS[snapshot.overallStatus];
  const statusLabel = snapshot.overallStatus.replace('-', ' ');

  // Action required items
  const actionItems = useMemo(() => {
    const items: { id: string; text: string; severity: string }[] = [];
    incidents.filter((i) => i.status === 'open' || i.status === 'investigating').forEach((i) => {
      items.push({ id: `inc-${i.id}`, text: `Incident: ${i.title}`, severity: i.severity });
    });
    training.filter((t) => t.required && t.completionRate < 85).forEach((t) => {
      items.push({ id: `trn-${t.id}`, text: `Training below target: ${t.title} (${t.completionRate}%)`, severity: 'minor' });
    });
    audits.filter((a) => a.status === 'scheduled').forEach((a) => {
      items.push({ id: `aud-${a.id}`, text: `Upcoming audit: ${a.title} — ${a.date}`, severity: 'minor' });
    });
    return items;
  }, [incidents, training, audits]);

  // Recent activity (last 4 compliance events)
  const recentActivity = useMemo(() => {
    const activity: { id: string; text: string; date: string; type: string }[] = [];
    policies.forEach((p) => {
      activity.push({ id: `pol-${p.id}`, text: `Policy reviewed: ${p.title}`, date: p.lastReviewed, type: 'policy' });
    });
    audits.forEach((a) => {
      activity.push({ id: `aud-${a.id}`, text: `Audit: ${a.title} — ${a.status}`, date: a.date, type: 'audit' });
    });
    incidents.forEach((i) => {
      activity.push({ id: `inc-${i.id}`, text: `Incident reported: ${i.title}`, date: i.reportedDate, type: 'incident' });
    });
    return activity.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);
  }, [policies, audits, incidents]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {/* Overall Status Badge */}
      <Card style={styles.statusCard}>
        <View style={[styles.statusIndicator, { backgroundColor: statusColor + '18' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[styles.statusLabel, { color: statusColor }]}>
            {statusLabel.toUpperCase()}
          </ThemedText>
        </View>
        <ThemedText style={[styles.statusSubtitle, { color: colors.textSecondary }]}>
          Overall Compliance Status
        </ThemedText>
      </Card>

      {/* Metric Cards */}
      <View style={styles.metricsGrid}>
        <Card style={styles.metricCard}>
          <ThemedText style={[styles.metricValue, { color: colors.text }]}>{snapshot.policiesCount}</ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Policies</ThemedText>
        </Card>
        <Card style={styles.metricCard}>
          <ThemedText style={[styles.metricValue, { color: snapshot.openIncidents > 0 ? '#F59E0B' : '#22C55E' }]}>
            {snapshot.openIncidents}
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Open Incidents</ThemedText>
        </Card>
        <Card style={styles.metricCard}>
          <ThemedText style={[styles.metricValue, { color: '#6AA9FF' }]}>{snapshot.upcomingAudits}</ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Upcoming Audits</ThemedText>
        </Card>
        <Card style={styles.metricCard}>
          <ThemedText style={[styles.metricValue, { color: snapshot.trainingCompliance >= 90 ? '#22C55E' : '#F59E0B' }]}>
            {snapshot.trainingCompliance}%
          </ThemedText>
          <ThemedText style={[styles.metricLabel, { color: colors.textSecondary }]}>Training</ThemedText>
        </Card>
      </View>

      {/* Action Required */}
      {actionItems.length > 0 && (
        <>
          <SectionHeader title="Action Required" />
          <Card>
            {actionItems.map((item, i) => {
              const sevColor = SEVERITY_COLORS[item.severity] ?? '#F59E0B';
              return (
                <View key={item.id} style={[styles.actionRow, i < actionItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
                  <View style={[styles.actionDot, { backgroundColor: sevColor }]} />
                  <ThemedText style={[styles.actionText, { color: colors.text }]} numberOfLines={2}>
                    {item.text}
                  </ThemedText>
                </View>
              );
            })}
          </Card>
        </>
      )}

      {/* Recent Activity */}
      <SectionHeader title="Recent Activity" />
      <Card>
        {recentActivity.map((item, i) => (
          <View key={item.id} style={[styles.activityRow, i < recentActivity.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }]}>
            <View style={styles.activityLeft}>
              <ThemedText style={[styles.activityText, { color: colors.text }]} numberOfLines={2}>
                {item.text}
              </ThemedText>
              <ThemedText style={[styles.activityDate, { color: colors.textTertiary }]}>{item.date}</ThemedText>
            </View>
          </View>
        ))}
      </Card>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// POLICIES VIEW
// =============================================================================

function PoliciesView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState('All');
  const policies = COMPLIANCE_POLICIES[mode];

  const categoryOptions = useMemo(() => {
    const categories = [...new Set(policies.map((p) => p.category))];
    return ['All', ...categories.map((c) => CATEGORY_LABELS[c])];
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    if (filter === 'All') return policies;
    const categoryKey = Object.entries(CATEGORY_LABELS).find(([_, v]) => v === filter)?.[0] as PolicyCategory | undefined;
    if (!categoryKey) return policies;
    return policies.filter((p) => p.category === categoryKey);
  }, [policies, filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <FilterPills options={categoryOptions} active={filter} onSelect={setFilter} />
      {filteredPolicies.length === 0 ? (
        <Card><EmptyState message="No policies match this filter." /></Card>
      ) : (
        filteredPolicies.map((policy) => {
          const statusColor = COMPLIANCE_STATUS_COLORS[policy.status];
          return (
            <Card key={policy.id}>
              <View style={styles.policyHeader}>
                <ThemedText style={[styles.policyTitle, { color: colors.text }]} numberOfLines={2}>
                  {policy.title}
                </ThemedText>
                <StatusBadge label={policy.status} color={statusColor} />
              </View>
              <View style={styles.policyBadgeRow}>
                <StatusBadge label={CATEGORY_LABELS[policy.category]} color={colors.textSecondary} />
              </View>
              <ThemedText style={[styles.policyDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                {policy.description}
              </ThemedText>
              <View style={styles.policyDates}>
                <ThemedText style={[styles.policyDate, { color: colors.textTertiary }]}>
                  Reviewed: {policy.lastReviewed}
                </ThemedText>
                <ThemedText style={[styles.policyDate, { color: colors.textTertiary }]}>
                  Next: {policy.nextReview}
                </ThemedText>
              </View>
            </Card>
          );
        })
      )}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// AUDITS VIEW
// =============================================================================

function AuditsView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const audits = COMPLIANCE_AUDITS[mode];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {audits.map((audit) => {
        const statusColor = AUDIT_STATUS_COLORS[audit.status];
        return (
          <Card key={audit.id}>
            <View style={styles.auditHeader}>
              <ThemedText style={[styles.auditTitle, { color: colors.text }]} numberOfLines={2}>
                {audit.title}
              </ThemedText>
              <StatusBadge label={audit.status} color={statusColor} />
            </View>
            <ThemedText style={[styles.auditAuditor, { color: colors.textSecondary }]}>
              {audit.auditor}
            </ThemedText>
            <ThemedText style={[styles.auditDate, { color: colors.textTertiary }]}>
              {audit.date}
            </ThemedText>
            <View style={styles.auditFindings}>
              <View style={styles.auditFindingItem}>
                <ThemedText style={[styles.auditFindingValue, { color: audit.findings > 0 ? '#F59E0B' : '#22C55E' }]}>
                  {audit.findings}
                </ThemedText>
                <ThemedText style={[styles.auditFindingLabel, { color: colors.textSecondary }]}>
                  Findings
                </ThemedText>
              </View>
              <View style={styles.auditFindingItem}>
                <ThemedText style={[styles.auditFindingValue, { color: audit.criticalFindings > 0 ? '#EF4444' : '#22C55E' }]}>
                  {audit.criticalFindings}
                </ThemedText>
                <ThemedText style={[styles.auditFindingLabel, { color: colors.textSecondary }]}>
                  Critical
                </ThemedText>
              </View>
            </View>
          </Card>
        );
      })}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// INCIDENTS VIEW
// =============================================================================

function IncidentsView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [filter, setFilter] = useState('All');
  const incidents = COMPLIANCE_INCIDENTS[mode];

  const filteredIncidents = useMemo(() => {
    if (filter === 'All') return incidents;
    return incidents.filter((i) => i.status === filter.toLowerCase());
  }, [incidents, filter]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <FilterPills options={['All', 'Open', 'Investigating', 'Resolved']} active={filter} onSelect={setFilter} />
      {filteredIncidents.length === 0 ? (
        <Card><EmptyState message="No incidents match this filter." /></Card>
      ) : (
        filteredIncidents.map((incident) => {
          const sevColor = SEVERITY_COLORS[incident.severity] ?? '#F59E0B';
          const incStatusColor = INCIDENT_STATUS_COLORS[incident.status] ?? '#8F8F8F';
          return (
            <Card key={incident.id}>
              <View style={styles.incidentHeader}>
                <ThemedText style={[styles.incidentTitle, { color: colors.text }]} numberOfLines={2}>
                  {incident.title}
                </ThemedText>
              </View>
              <View style={styles.incidentBadgeRow}>
                <StatusBadge label={incident.severity} color={sevColor} />
                <StatusBadge label={incident.status} color={incStatusColor} />
              </View>
              <ThemedText style={[styles.incidentDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                {incident.description}
              </ThemedText>
              <View style={styles.incidentMeta}>
                <ThemedText style={[styles.incidentDate, { color: colors.textTertiary }]}>
                  Reported: {incident.reportedDate}
                </ThemedText>
                <ThemedText style={[styles.incidentAssignee, { color: colors.textTertiary }]}>
                  Assignee: {incident.assignee}
                </ThemedText>
              </View>
            </Card>
          );
        })
      )}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// TRAINING VIEW
// =============================================================================

function TrainingView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const training = COMPLIANCE_TRAINING[mode];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      {training.map((item) => {
        const progressColor = item.completionRate >= 90 ? '#22C55E' : item.completionRate >= 75 ? '#F59E0B' : '#EF4444';
        return (
          <Card key={item.id}>
            <View style={styles.trainingHeader}>
              <ThemedText style={[styles.trainingTitle, { color: colors.text }]} numberOfLines={2}>
                {item.title}
              </ThemedText>
              {item.required && (
                <StatusBadge label="Required" color="#6AA9FF" />
              )}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View style={[styles.progressFill, { width: `${item.completionRate}%`, backgroundColor: progressColor }]} />
              </View>
              <ThemedText style={[styles.progressText, { color: progressColor }]}>
                {item.completionRate}%
              </ThemedText>
            </View>

            <View style={styles.trainingMeta}>
              <ThemedText style={[styles.trainingDate, { color: colors.textTertiary }]}>
                Due: {item.dueDate}
              </ThemedText>
              <StatusBadge label={item.category} color={colors.textSecondary} />
            </View>
          </Card>
        );
      })}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// REPORTS VIEW
// =============================================================================

function ReportsView() {
  const mode = useMode();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const snapshot = COMPLIANCE_SNAPSHOTS[mode];
  const policies = COMPLIANCE_POLICIES[mode];
  const training = COMPLIANCE_TRAINING[mode];
  const incidents = COMPLIANCE_INCIDENTS[mode];

  const compliantPolicies = policies.filter((p) => p.status === 'compliant').length;
  const policyAdherence = policies.length > 0 ? Math.round((compliantPolicies / policies.length) * 100) : 100;

  const avgTraining = training.length > 0
    ? Math.round(training.reduce((sum, t) => sum + t.completionRate, 0) / training.length)
    : 100;

  const totalIncidents = incidents.length;
  const openIncidents = incidents.filter((i) => i.status === 'open' || i.status === 'investigating').length;

  const reportCards = [
    {
      title: 'Compliance Score',
      value: snapshot.overallStatus === 'compliant' ? '95' : snapshot.overallStatus === 'warning' ? '78' : '52',
      suffix: '/100',
      color: COMPLIANCE_STATUS_COLORS[snapshot.overallStatus],
    },
    {
      title: 'Policy Adherence',
      value: String(policyAdherence),
      suffix: '%',
      color: policyAdherence >= 90 ? '#22C55E' : policyAdherence >= 75 ? '#F59E0B' : '#EF4444',
    },
    {
      title: 'Training Completion',
      value: String(avgTraining),
      suffix: '%',
      color: avgTraining >= 90 ? '#22C55E' : avgTraining >= 75 ? '#F59E0B' : '#EF4444',
    },
    {
      title: 'Incident Rate',
      value: `${openIncidents}/${totalIncidents}`,
      suffix: ' open',
      color: openIncidents === 0 ? '#22C55E' : '#F59E0B',
    },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
      <SectionHeader title="Compliance Summary" />
      <View style={styles.reportGrid}>
        {reportCards.map((card) => (
          <Card key={card.title} style={styles.reportCard}>
            <ThemedText style={[styles.reportCardTitle, { color: colors.textSecondary }]}>
              {card.title}
            </ThemedText>
            <View style={styles.reportValueRow}>
              <ThemedText style={[styles.reportValue, { color: card.color }]}>
                {card.value}
              </ThemedText>
              <ThemedText style={[styles.reportSuffix, { color: card.color }]}>
                {card.suffix}
              </ThemedText>
            </View>
          </Card>
        ))}
      </View>

      {/* Visual indicator */}
      <Card>
        <View style={styles.reportSummaryRow}>
          <View style={[styles.reportStatusDot, { backgroundColor: COMPLIANCE_STATUS_COLORS[snapshot.overallStatus] }]} />
          <ThemedText style={[styles.reportSummaryText, { color: colors.text }]}>
            {snapshot.overallStatus === 'compliant'
              ? 'Organization is in good standing across all compliance domains.'
              : snapshot.overallStatus === 'warning'
                ? 'Attention needed on upcoming reviews and training targets.'
                : 'Critical compliance issues require immediate remediation.'}
          </ThemedText>
        </View>
      </Card>

      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ComplianceHub() {
  const [activeTab, setActiveTab] = useState<HubTab>('home');
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeView />;
      case 'policies': return <PoliciesView />;
      case 'audits': return <AuditsView />;
      case 'incidents': return <IncidentsView />;
      case 'training': return <TrainingView />;
      case 'reports': return <ReportsView />;
      default: return <HomeView />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Navigation */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillNavContent}
        style={styles.pillNav}
      >
        {HUB_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <ThemedText style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Pill Nav
  pillNav: {
    flexGrow: 0,
  },
  pillNavContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },

  // Card
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  // Section Header
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // Badge
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Filters
  filterScroll: {
    marginBottom: Spacing.md,
    flexGrow: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
  },

  // Home — Status
  statusCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statusSubtitle: {
    fontSize: 13,
  },

  // Home — Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
    textAlign: 'center',
  },

  // Home — Actions
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Home — Activity
  activityRow: {
    paddingVertical: 10,
  },
  activityLeft: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityDate: {
    fontSize: 11,
    marginTop: 2,
  },

  // Policies
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  policyBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  policyDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  policyDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  policyDate: {
    fontSize: 11,
  },

  // Audits
  auditHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  auditTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  auditAuditor: {
    fontSize: 13,
    marginBottom: 2,
  },
  auditDate: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  auditFindings: {
    flexDirection: 'row',
    gap: Spacing.xl,
  },
  auditFindingItem: {
    alignItems: 'center',
  },
  auditFindingValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  auditFindingLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
  },

  // Incidents
  incidentHeader: {
    marginBottom: 4,
  },
  incidentTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  incidentBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  incidentDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: Spacing.sm,
  },
  incidentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incidentDate: {
    fontSize: 11,
  },
  incidentAssignee: {
    fontSize: 11,
  },

  // Training
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  trainingTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 40,
    textAlign: 'right',
  },
  trainingMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trainingDate: {
    fontSize: 11,
  },

  // Reports
  reportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  reportCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  reportCardTitle: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  reportValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  reportValue: {
    fontSize: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  reportSuffix: {
    fontSize: 14,
    fontWeight: '600',
  },
  reportSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reportStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportSummaryText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },
});
