/**
 * Universal Entrant Sheet — Team / Entry truth page for Competition Mode.
 *
 * 6 canonical tabs gated by CompetitionRoleLens (C1-C4).
 * Overview | Roster / Personnel | Performance | Compliance | Payouts | Media Obligations
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

import type { EntrantObject } from '@/data/mock-competition-v2';
import {
  type CompetitionRoleLens,
  type EntrantTab,
  getEntrantSheetTabs,
  isFullAccess,
} from '@/utils/competition-rbac';

// =============================================================================
// PROPS
// =============================================================================

export interface UniversalEntrantSheetProps {
  entrant: EntrantObject;
  roleLens: CompetitionRoleLens;
  onClose: () => void;
}

// =============================================================================
// HELPERS
// =============================================================================

function getStatusColor(status: EntrantObject['status']): string {
  switch (status) {
    case 'active': return '#22C55E';
    case 'under_review': return '#F59E0B';
    case 'suspended': return '#EF4444';
    case 'withdrawn': return '#A1A1AA';
  }
}

function getStatusLabel(status: EntrantObject['status']): string {
  switch (status) {
    case 'active': return 'Active';
    case 'under_review': return 'Under Review';
    case 'suspended': return 'Suspended';
    case 'withdrawn': return 'Withdrawn';
  }
}

function getPayoutStatusColor(status: EntrantObject['payoutStatus']): string {
  switch (status) {
    case 'released': return '#22C55E';
    case 'pending': return '#F59E0B';
    case 'hold': return '#EF4444';
    case 'locked': return '#A1A1AA';
  }
}

function getPayoutStatusLabel(status: EntrantObject['payoutStatus']): string {
  switch (status) {
    case 'released': return 'Released';
    case 'pending': return 'Pending';
    case 'hold': return 'Hold';
    case 'locked': return 'Locked';
  }
}

function getCredentialColor(status: EntrantObject['credentialsStatus']): string {
  switch (status) {
    case 'complete': return '#22C55E';
    case 'pending': return '#F59E0B';
    case 'missing': return '#EF4444';
  }
}

function getFinishOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
}

function getConsistencyTrend(results: { event: string; finish: number }[]): string {
  if (results.length < 2) return 'N/A';
  const diffs = results.slice(1).map((r, i) => Math.abs(r.finish - results[i].finish));
  const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  if (avg <= 1) return 'Very Consistent';
  if (avg <= 2) return 'Consistent';
  if (avg <= 4) return 'Variable';
  return 'Volatile';
}

// =============================================================================
// MOCK INLINE DATA (entrant-level detail not in the object)
// =============================================================================

const MOCK_PERSONNEL = [
  { id: 'p-1', name: 'Lead Driver', role: 'Driver', credential: 'complete' as const },
  { id: 'p-2', name: 'Team Principal', role: 'Principal', credential: 'complete' as const },
  { id: 'p-3', name: 'Chief Engineer', role: 'Engineer', credential: 'complete' as const },
  { id: 'p-4', name: 'Mechanic 1', role: 'Mechanic', credential: 'complete' as const },
  { id: 'p-5', name: 'Mechanic 2', role: 'Mechanic', credential: 'pending' as const },
  { id: 'p-6', name: 'Physio / Trainer', role: 'Support Staff', credential: 'complete' as const },
];

const MOCK_COMPLIANCE_DOCS = [
  { id: 'cd-1', label: 'Entry Application', status: 'complete' as const },
  { id: 'cd-2', label: 'Insurance Certificate', status: 'complete' as const },
  { id: 'cd-3', label: 'Tech Homologation', status: 'complete' as const },
  { id: 'cd-4', label: 'Safety Certification', status: 'complete' as const },
  { id: 'cd-5', label: 'Driver Medical', status: 'pending' as const },
  { id: 'cd-6', label: 'Fire Suppression Cert', status: 'complete' as const },
  { id: 'cd-7', label: 'Cost Cap Submission', status: 'complete' as const },
  { id: 'cd-8', label: 'Sponsor Conflict Declaration', status: 'complete' as const },
];

const MOCK_INCIDENTS = [
  { id: 'mi-1', event: 'Rd 1', description: 'Unsafe pit release — 5s time penalty', severity: 'minor' as const },
  { id: 'mi-2', event: 'Rd 2', description: 'Engine seal protest filed against entry', severity: 'major' as const },
];

const MOCK_MEDIA_OBLIGATIONS = [
  { id: 'mo-1', title: 'Pre-race press conference', dueDate: 'Sat 12:00 PM', status: 'delivered' as const },
  { id: 'mo-2', title: 'Post-qualifying interview', dueDate: 'Sat 4:00 PM', status: 'delivered' as const },
  { id: 'mo-3', title: 'Broadcast in-car segment', dueDate: 'Sun 1:00 PM', status: 'on_track' as const },
  { id: 'mo-4', title: 'Podium ceremony appearance', dueDate: 'Sun 4:30 PM', status: 'on_track' as const },
  { id: 'mo-5', title: 'Social media recap post', dueDate: 'Sun 8:00 PM', status: 'at_risk' as const },
];

const MOCK_PAYOUT_GATES = [
  { id: 'pg-1', label: 'Results Certified', cleared: true },
  { id: 'pg-2', label: 'Tech Inspection Passed', cleared: true },
  { id: 'pg-3', label: 'Protests Resolved', cleared: false },
  { id: 'pg-4', label: 'Compliance Cleared', cleared: true },
  { id: 'pg-5', label: 'Finance Approved', cleared: false },
];

// =============================================================================
// REUSABLE SUB-COMPONENTS
// =============================================================================

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
      {label}
    </Text>
  );
}

function Card({ children, colors }: { children: React.ReactNode; colors: typeof Colors.light }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
      {children}
    </View>
  );
}

function StatRow({
  label,
  value,
  colors,
  valueColor,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  valueColor?: string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor ?? colors.text }]}>{value}</Text>
    </View>
  );
}

function Divider({ colors }: { colors: typeof Colors.light }) {
  return <View style={[styles.divider, { backgroundColor: colors.divider }]} />;
}

function ChecklistRow({
  label,
  done,
  colors,
}: {
  label: string;
  done: boolean;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.checklistRow}>
      <IconSymbol
        name={done ? 'checkmark.circle.fill' : 'circle.fill'}
        size={16}
        color={done ? '#22C55E' : colors.textTertiary}
      />
      <Text style={[styles.checklistLabel, { color: done ? colors.text : colors.textSecondary }]}>
        {label}
      </Text>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalEntrantSheet({
  entrant,
  roleLens,
  onClose,
}: UniversalEntrantSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fullAccess = isFullAccess(roleLens);

  const tabs = useMemo(() => getEntrantSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<EntrantTab>('overview');

  // Reset to first available tab when entrant or role changes
  useEffect(() => {
    const firstTab = tabs[0]?.id ?? 'overview';
    setActiveTab(firstTab);
  }, [entrant.id, tabs]);

  // Derived
  const avgFinish = useMemo(() => {
    if (entrant.recentResults.length === 0) return 'N/A';
    const sum = entrant.recentResults.reduce((a, r) => a + r.finish, 0);
    return (sum / entrant.recentResults.length).toFixed(1);
  }, [entrant.recentResults]);

  const bestFinish = useMemo(() => {
    if (entrant.recentResults.length === 0) return 'N/A';
    return getFinishOrdinal(Math.min(...entrant.recentResults.map((r) => r.finish)));
  }, [entrant.recentResults]);

  const worstFinish = useMemo(() => {
    if (entrant.recentResults.length === 0) return 'N/A';
    return getFinishOrdinal(Math.max(...entrant.recentResults.map((r) => r.finish)));
  }, [entrant.recentResults]);

  const penaltiesCount = useMemo(() => {
    return MOCK_INCIDENTS.filter((i) => i.severity !== 'minor').length;
  }, []);

  const consistency = useMemo(() => {
    return getConsistencyTrend(entrant.recentResults);
  }, [entrant.recentResults]);

  // Compliance docs derived from entrant data
  const complianceDocs = useMemo(() => {
    return MOCK_COMPLIANCE_DOCS.map((doc, i) => ({
      ...doc,
      status: i < entrant.complianceDocsComplete ? 'complete' as const : 'pending' as const,
    }));
  }, [entrant.complianceDocsComplete]);

  return (
    <View style={styles.container}>
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            {/* Colored team badge */}
            <View style={[styles.teamBadge, { backgroundColor: entrant.teamColor + '25' }]}>
              <Text style={[styles.teamBadgeText, { color: entrant.teamColor }]}>
                {entrant.name.charAt(0)}
              </Text>
            </View>

            <View style={styles.headerInfo}>
              <Text style={[styles.entrantName, { color: colors.text }]}>
                {entrant.name}
              </Text>
              <View style={styles.headerMeta}>
                {/* Type pill */}
                <View style={[styles.typePill, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.typePillText, { color: colors.textSecondary }]}>
                    {entrant.type === 'team' ? 'Team' : 'Entry'}
                  </Text>
                </View>

                {/* Rank + Points */}
                <Text style={[styles.rankText, { color: colors.textSecondary }]}>
                  P{entrant.rank} · {entrant.points} pts
                </Text>
              </View>
            </View>
          </View>

          {/* Close */}
          <Pressable onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={colors.textSecondary} />
          </Pressable>
        </View>

        {/* Status pill */}
        <View style={styles.statusRow}>
          <View style={[styles.statusPill, { backgroundColor: getStatusColor(entrant.status) + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor(entrant.status) }]} />
            <Text style={[styles.statusText, { color: getStatusColor(entrant.status) }]}>
              {getStatusLabel(entrant.status)}
            </Text>
          </View>

          {/* At-risk badge */}
          {entrant.atRiskFlags.length > 0 && (
            <View style={[styles.statusPill, { backgroundColor: '#EF4444' + '20' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
              <Text style={[styles.statusText, { color: '#EF4444' }]}>
                {entrant.atRiskFlags.length} Flag{entrant.atRiskFlags.length > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>

        {/* Action buttons (C1/C2 only for Message + Create Request) */}
        <View style={styles.actionsRow}>
          {fullAccess && (
            <>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="envelope.fill" size={14} color={colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Message</Text>
              </Pressable>
              <Pressable
                style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="doc.badge.plus" size={14} color={colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: colors.text }]}>Create Request</Text>
              </Pressable>
            </>
          )}
          <Pressable
            style={[styles.actionBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="doc.text.fill" size={14} color={colors.textSecondary} />
            <Text style={[styles.actionBtnText, { color: colors.text }]}>View Obligations</Text>
          </Pressable>
        </View>
      </View>

      {/* ================================================================= */}
      {/* TAB PILLS                                                         */}
      {/* ================================================================= */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabRow}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabPill,
                { borderColor: colors.border },
                isActive && { backgroundColor: colors.text, borderColor: colors.text },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <Text style={[
                styles.tabText,
                { color: colors.textSecondary },
                isActive && { color: colors.background },
              ]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================================================================= */}
      {/* TAB CONTENT                                                       */}
      {/* ================================================================= */}
      <ScrollView
        style={styles.contentScroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── OVERVIEW ─── */}
        {activeTab === 'overview' && (
          <View style={styles.tabContent}>
            <SectionLabel label="IDENTITY" colors={colors} />
            <Card colors={colors}>
              <StatRow label="Name" value={entrant.name} colors={colors} />
              <StatRow label="Type" value={entrant.type === 'team' ? 'Team' : 'Entry'} colors={colors} />
              <StatRow label="Championship Rank" value={`P${entrant.rank}`} colors={colors} />
              <StatRow label="Points" value={`${entrant.points}`} colors={colors} />
              <StatRow
                label="Status"
                value={getStatusLabel(entrant.status)}
                colors={colors}
                valueColor={getStatusColor(entrant.status)}
              />
            </Card>

            <SectionLabel label="CONTACT REPRESENTATIVE" colors={colors} />
            <Card colors={colors}>
              <View style={styles.contactRow}>
                <View style={[styles.contactAvatar, { backgroundColor: entrant.teamColor + '30' }]}>
                  <Text style={[styles.contactInitial, { color: entrant.teamColor }]}>
                    {entrant.contactRep.charAt(0)}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.contactName, { color: colors.text }]}>
                    {entrant.contactRep}
                  </Text>
                  <Text style={[styles.contactRole, { color: colors.textSecondary }]}>
                    Team Representative
                  </Text>
                </View>
                {fullAccess && (
                  <Pressable hitSlop={8}>
                    <IconSymbol name="envelope.fill" size={16} color={colors.textSecondary} />
                  </Pressable>
                )}
              </View>
            </Card>

            <SectionLabel label="RECENT RESULTS" colors={colors} />
            <Card colors={colors}>
              {entrant.recentResults.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No results yet
                </Text>
              ) : (
                entrant.recentResults.map((r, i) => (
                  <StatRow
                    key={`result-${i}`}
                    label={r.event}
                    value={getFinishOrdinal(r.finish)}
                    colors={colors}
                    valueColor={r.finish <= 3 ? '#22C55E' : undefined}
                  />
                ))
              )}
            </Card>

            {/* At-risk flags */}
            {entrant.atRiskFlags.length > 0 && (
              <>
                <SectionLabel label="AT-RISK FLAGS" colors={colors} />
                <Card colors={colors}>
                  {entrant.atRiskFlags.map((flag, i) => (
                    <View key={`flag-${i}`} style={styles.flagRow}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
                      <Text style={[styles.flagText, { color: '#EF4444' }]}>{flag}</Text>
                    </View>
                  ))}
                </Card>
              </>
            )}
          </View>
        )}

        {/* ─── ROSTER / PERSONNEL ─── */}
        {activeTab === 'roster' && (
          <View style={styles.tabContent}>
            <SectionLabel label="STAFF / DRIVER LIST" colors={colors} />
            <Card colors={colors}>
              {MOCK_PERSONNEL.map((person) => (
                <View key={person.id} style={styles.personnelRow}>
                  <View style={[styles.personnelAvatar, { backgroundColor: entrant.teamColor + '20' }]}>
                    <Text style={[styles.personnelInitial, { color: entrant.teamColor }]}>
                      {person.name.charAt(0)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.personnelName, { color: colors.text }]}>{person.name}</Text>
                    <Text style={[styles.personnelRole, { color: colors.textSecondary }]}>{person.role}</Text>
                  </View>
                  <View style={[
                    styles.credentialBadge,
                    { backgroundColor: getCredentialColor(person.credential) + '20' },
                  ]}>
                    <Text style={[styles.credentialText, { color: getCredentialColor(person.credential) }]}>
                      {person.credential === 'complete' ? 'Credentialed' : person.credential === 'pending' ? 'Pending' : 'Missing'}
                    </Text>
                  </View>
                </View>
              ))}
            </Card>

            <SectionLabel label="CREDENTIALS STATUS" colors={colors} />
            <Card colors={colors}>
              <StatRow
                label="Overall"
                value={entrant.credentialsStatus === 'complete' ? 'Complete' : entrant.credentialsStatus === 'pending' ? 'Pending' : 'Missing'}
                colors={colors}
                valueColor={getCredentialColor(entrant.credentialsStatus)}
              />
              <StatRow
                label="Personnel Credentialed"
                value={`${MOCK_PERSONNEL.filter((p) => p.credential === 'complete').length}/${MOCK_PERSONNEL.length}`}
                colors={colors}
              />
            </Card>

            {/* Emergency contacts — C1/C2 only */}
            {fullAccess && (
              <>
                <SectionLabel label="EMERGENCY CONTACTS" colors={colors} />
                <Card colors={colors}>
                  <StatRow label="Primary" value={entrant.contactRep} colors={colors} />
                  <StatRow label="Phone" value="+1 (555) 012-3456" colors={colors} />
                  <Divider colors={colors} />
                  <StatRow label="Backup" value="Operations Manager" colors={colors} />
                  <StatRow label="Phone" value="+1 (555) 789-0123" colors={colors} />
                </Card>
              </>
            )}
          </View>
        )}

        {/* ─── PERFORMANCE ─── */}
        {activeTab === 'performance' && (
          <View style={styles.tabContent}>
            <SectionLabel label="EVENT-BY-EVENT FINISHES" colors={colors} />
            <Card colors={colors}>
              {entrant.recentResults.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No results yet
                </Text>
              ) : (
                <>
                  {entrant.recentResults.map((r, i) => (
                    <View key={`perf-${i}`} style={styles.finishRow}>
                      <Text style={[styles.finishEvent, { color: colors.textSecondary }]}>{r.event}</Text>
                      <View style={[
                        styles.finishBadge,
                        { backgroundColor: r.finish <= 3 ? '#22C55E' + '20' : colors.backgroundTertiary },
                      ]}>
                        <Text style={[
                          styles.finishBadgeText,
                          { color: r.finish <= 3 ? '#22C55E' : colors.text },
                        ]}>
                          {getFinishOrdinal(r.finish)}
                        </Text>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </Card>

            <SectionLabel label="SUMMARY" colors={colors} />
            <Card colors={colors}>
              <StatRow label="Average Finish" value={avgFinish} colors={colors} />
              <StatRow label="Best Finish" value={bestFinish} colors={colors} valueColor="#22C55E" />
              <StatRow label="Worst Finish" value={worstFinish} colors={colors} />
              <Divider colors={colors} />
              <StatRow label="Total Penalties" value={`${penaltiesCount}`} colors={colors} valueColor={penaltiesCount > 0 ? '#EF4444' : undefined} />
            </Card>

            <SectionLabel label="CONSISTENCY TREND" colors={colors} />
            <Card colors={colors}>
              <View style={styles.trendRow}>
                <IconSymbol
                  name={consistency === 'Very Consistent' || consistency === 'Consistent' ? 'checkmark.circle.fill' : 'exclamationmark.triangle.fill'}
                  size={18}
                  color={consistency === 'Very Consistent' || consistency === 'Consistent' ? '#22C55E' : '#F59E0B'}
                />
                <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                  <Text style={[styles.trendLabel, { color: colors.text }]}>{consistency}</Text>
                  <Text style={[styles.trendDescription, { color: colors.textSecondary }]}>
                    Based on position variance across {entrant.recentResults.length} event{entrant.recentResults.length !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </Card>
          </View>
        )}

        {/* ─── COMPLIANCE (C1/C2/C3 read-only) ─── */}
        {activeTab === 'compliance' && (
          <View style={styles.tabContent}>
            <SectionLabel label="DOCUMENT CHECKLIST" colors={colors} />
            <Card colors={colors}>
              <StatRow
                label="Completion"
                value={`${entrant.complianceDocsComplete}/${entrant.complianceDocsTotal}`}
                colors={colors}
                valueColor={entrant.complianceDocsComplete === entrant.complianceDocsTotal ? '#22C55E' : '#F59E0B'}
              />
              <Divider colors={colors} />
              {complianceDocs.map((doc) => (
                <ChecklistRow
                  key={doc.id}
                  label={doc.label}
                  done={doc.status === 'complete'}
                  colors={colors}
                />
              ))}
            </Card>

            <SectionLabel label="INCIDENT HISTORY" colors={colors} />
            <Card colors={colors}>
              {MOCK_INCIDENTS.length === 0 ? (
                <Text style={[styles.emptyText, { color: colors.textTertiary }]}>
                  No incidents on record
                </Text>
              ) : (
                MOCK_INCIDENTS.map((inc) => (
                  <View key={inc.id} style={styles.incidentRow}>
                    <View style={styles.incidentHeader}>
                      <Text style={[styles.incidentEvent, { color: colors.textSecondary }]}>{inc.event}</Text>
                      <View style={[
                        styles.severityBadge,
                        {
                          backgroundColor: inc.severity === 'major' ? '#EF4444' + '20'
                            : inc.severity === 'moderate' ? '#F59E0B' + '20'
                            : colors.backgroundTertiary,
                        },
                      ]}>
                        <Text style={[
                          styles.severityText,
                          {
                            color: inc.severity === 'major' ? '#EF4444'
                              : inc.severity === 'moderate' ? '#F59E0B'
                              : colors.textSecondary,
                          },
                        ]}>
                          {inc.severity.charAt(0).toUpperCase() + inc.severity.slice(1)}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.incidentDesc, { color: colors.text }]}>{inc.description}</Text>
                  </View>
                ))
              )}
            </Card>

            {/* Holds / Sanctions */}
            <SectionLabel label="HOLDS / SANCTIONS" colors={colors} />
            <Card colors={colors}>
              {entrant.status === 'under_review' || entrant.status === 'suspended' ? (
                <View style={styles.holdRow}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={[styles.holdTitle, { color: '#EF4444' }]}>
                      {entrant.status === 'suspended' ? 'Suspension Active' : 'Under Review'}
                    </Text>
                    <Text style={[styles.holdSub, { color: colors.textSecondary }]}>
                      {entrant.atRiskFlags.length > 0
                        ? entrant.atRiskFlags.join('; ')
                        : 'Pending steward review'}
                    </Text>
                  </View>
                </View>
              ) : (
                <View style={styles.clearRow}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
                  <Text style={[styles.clearText, { color: colors.textSecondary }]}>
                    No active holds or sanctions
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* ─── PAYOUTS (C1/C2 only) ─── */}
        {activeTab === 'payouts' && (
          <View style={styles.tabContent}>
            <SectionLabel label="PAYOUT SUMMARY" colors={colors} />
            <Card colors={colors}>
              <StatRow label="Eligible Amount" value={entrant.payoutEligible} colors={colors} />
              <StatRow
                label="Status"
                value={getPayoutStatusLabel(entrant.payoutStatus)}
                colors={colors}
                valueColor={getPayoutStatusColor(entrant.payoutStatus)}
              />
              <Divider colors={colors} />
              <StatRow
                label="Holds"
                value={entrant.payoutStatus === 'hold' ? '1 Active' : 'None'}
                colors={colors}
                valueColor={entrant.payoutStatus === 'hold' ? '#EF4444' : '#22C55E'}
              />
            </Card>

            <SectionLabel label="RELEASE STATUS" colors={colors} />
            <Card colors={colors}>
              <View style={styles.releaseStatusRow}>
                <View style={[
                  styles.releaseIndicator,
                  { backgroundColor: getPayoutStatusColor(entrant.payoutStatus) },
                ]} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.releaseTitle, { color: colors.text }]}>
                    {entrant.payoutStatus === 'released'
                      ? 'Funds Released'
                      : entrant.payoutStatus === 'hold'
                      ? 'Payout Held'
                      : entrant.payoutStatus === 'pending'
                      ? 'Awaiting Release'
                      : 'Payout Locked'}
                  </Text>
                  <Text style={[styles.releaseSub, { color: colors.textSecondary }]}>
                    {entrant.payoutStatus === 'released'
                      ? 'Settlement complete — funds transferred'
                      : entrant.payoutStatus === 'hold'
                      ? 'Blocked by outstanding protest or compliance issue'
                      : entrant.payoutStatus === 'pending'
                      ? 'Pending results certification and gate clearance'
                      : 'Not yet eligible for release'}
                  </Text>
                </View>
              </View>
            </Card>

            <SectionLabel label="SETTLEMENT TIMELINE (GATES)" colors={colors} />
            <Card colors={colors}>
              {MOCK_PAYOUT_GATES.map((gate) => (
                <ChecklistRow
                  key={gate.id}
                  label={gate.label}
                  done={gate.cleared}
                  colors={colors}
                />
              ))}
              <Divider colors={colors} />
              <StatRow
                label="Gates Cleared"
                value={`${MOCK_PAYOUT_GATES.filter((g) => g.cleared).length}/${MOCK_PAYOUT_GATES.length}`}
                colors={colors}
                valueColor={
                  MOCK_PAYOUT_GATES.every((g) => g.cleared) ? '#22C55E' : '#F59E0B'
                }
              />
            </Card>
          </View>
        )}

        {/* ─── MEDIA OBLIGATIONS (C1/C2/C3) ─── */}
        {activeTab === 'media_obligations' && (
          <View style={styles.tabContent}>
            <SectionLabel label="REQUIRED APPEARANCES" colors={colors} />
            <Card colors={colors}>
              {MOCK_MEDIA_OBLIGATIONS.map((ob) => {
                const isDone = ob.status === 'delivered';
                const isRisk = ob.status === 'at_risk';
                return (
                  <View key={ob.id} style={styles.obligationRow}>
                    <IconSymbol
                      name={isDone ? 'checkmark.circle.fill' : isRisk ? 'exclamationmark.triangle.fill' : 'clock.fill'}
                      size={16}
                      color={isDone ? '#22C55E' : isRisk ? '#EF4444' : '#F59E0B'}
                    />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={[styles.obligationTitle, { color: colors.text }]}>
                        {ob.title}
                      </Text>
                      <Text style={[styles.obligationDue, { color: colors.textSecondary }]}>
                        Due: {ob.dueDate}
                      </Text>
                    </View>
                    <View style={[
                      styles.obligationStatusBadge,
                      {
                        backgroundColor: isDone ? '#22C55E' + '20'
                          : isRisk ? '#EF4444' + '20'
                          : '#F59E0B' + '20',
                      },
                    ]}>
                      <Text style={[
                        styles.obligationStatusText,
                        {
                          color: isDone ? '#22C55E'
                            : isRisk ? '#EF4444'
                            : '#F59E0B',
                        },
                      ]}>
                        {isDone ? 'Delivered' : isRisk ? 'At Risk' : 'On Track'}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>

            <SectionLabel label="MISSED DELIVERABLES" colors={colors} />
            <Card colors={colors}>
              {entrant.sponsorDeliverablesDue === 0 ? (
                <View style={styles.clearRow}>
                  <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
                  <Text style={[styles.clearText, { color: colors.textSecondary }]}>
                    No missed deliverables
                  </Text>
                </View>
              ) : (
                <View style={styles.holdRow}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <Text style={[styles.holdTitle, { color: '#EF4444' }]}>
                      {entrant.sponsorDeliverablesDue} Overdue Deliverable{entrant.sponsorDeliverablesDue > 1 ? 's' : ''}
                    </Text>
                    <Text style={[styles.holdSub, { color: colors.textSecondary }]}>
                      Sponsor content obligations past due date
                    </Text>
                  </View>
                </View>
              )}
            </Card>

            <SectionLabel label="SUMMARY" colors={colors} />
            <Card colors={colors}>
              <StatRow
                label="Total Obligations"
                value={`${MOCK_MEDIA_OBLIGATIONS.length}`}
                colors={colors}
              />
              <StatRow
                label="Delivered"
                value={`${MOCK_MEDIA_OBLIGATIONS.filter((o) => o.status === 'delivered').length}`}
                colors={colors}
                valueColor="#22C55E"
              />
              <StatRow
                label="At Risk"
                value={`${MOCK_MEDIA_OBLIGATIONS.filter((o) => o.status === 'at_risk').length}`}
                colors={colors}
                valueColor={MOCK_MEDIA_OBLIGATIONS.some((o) => o.status === 'at_risk') ? '#EF4444' : undefined}
              />
              <StatRow
                label="Sponsor Deliverables Due"
                value={`${entrant.sponsorDeliverablesDue}`}
                colors={colors}
                valueColor={entrant.sponsorDeliverablesDue > 0 ? '#EF4444' : '#22C55E'}
              />
            </Card>
          </View>
        )}

        {/* Bottom spacer */}
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
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

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teamBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  teamBadgeText: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  entrantName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 24,
  },
  headerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  typePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  rankText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Status
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.sm,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Actions
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Tab pills
  tabScroll: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Content
  contentScroll: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  statLabel: {
    fontSize: 13,
    flex: 1,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 8,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: Spacing.sm,
  },

  // Contact
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitial: {
    fontSize: 16,
    fontWeight: '700',
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
  },
  contactRole: {
    fontSize: 12,
    marginTop: 1,
  },

  // Flags
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  flagText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // Personnel
  personnelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: Spacing.sm,
  },
  personnelAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personnelInitial: {
    fontSize: 14,
    fontWeight: '700',
  },
  personnelName: {
    fontSize: 13,
    fontWeight: '600',
  },
  personnelRole: {
    fontSize: 11,
    marginTop: 1,
  },
  credentialBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  credentialText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Performance
  finishRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  finishEvent: {
    fontSize: 13,
  },
  finishBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  finishBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  trendLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  trendDescription: {
    fontSize: 12,
    marginTop: 2,
  },

  // Compliance
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
  },
  checklistLabel: {
    fontSize: 13,
    flex: 1,
  },
  incidentRow: {
    paddingVertical: 8,
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  incidentEvent: {
    fontSize: 12,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  severityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  incidentDesc: {
    fontSize: 13,
    lineHeight: 18,
  },
  holdRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  holdTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  holdSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },
  clearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  clearText: {
    fontSize: 13,
  },

  // Payouts
  releaseStatusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  releaseIndicator: {
    width: 4,
    borderRadius: 2,
    height: 40,
    marginTop: 2,
  },
  releaseTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  releaseSub: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // Media obligations
  obligationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 0,
  },
  obligationTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  obligationDue: {
    fontSize: 11,
    marginTop: 1,
  },
  obligationStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  obligationStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
