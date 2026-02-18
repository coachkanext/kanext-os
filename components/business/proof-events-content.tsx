/**
 * Proof Events Content — Company-scoped proof event list with expandable detail.
 */

import React, { useState } from 'react';
import { View, FlatList, Pressable, ScrollView, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useBusiness } from '@/context/business-context';
import {
  getProofEventsByCompany,
  getStageColor,
  getMilestoneStatusColor,
  getRiskSeverityColor,
} from '@/data/mock-business-investor-v2';
import type { ProofEvent } from '@/types';

const ACCENT_GOLD = '#FFFFFF';

const DETAIL_TABS = ['Overview', 'KPIs', 'Milestones', 'Ops Plan', 'Risk', 'Constraints'];

function ProofEventCard({ event }: { event: ProofEvent }) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [expanded, setExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const stageColor = getStageColor(event.stage);

  const renderTabContent = () => {
    switch (activeTab) {
      case 0: // Overview
        return (
          <ThemedText style={[styles.overviewText, { color: colors.textSecondary }]}>
            {event.overview}
          </ThemedText>
        );
      case 1: // KPIs
        return (
          <View style={styles.kpiGrid}>
            {event.kpis.map((kpi) => (
              <View key={kpi.id} style={[styles.kpiCard, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[styles.kpiValue, { color: ACCENT_GOLD }]}>{kpi.value}</ThemedText>
                <ThemedText style={[styles.kpiLabel, { color: colors.textTertiary }]}>{kpi.label}</ThemedText>
                {kpi.target && (
                  <ThemedText style={[styles.kpiTarget, { color: colors.textTertiary }]}>
                    Target: {kpi.target}
                  </ThemedText>
                )}
                {kpi.trend && (
                  <IconSymbol
                    name={kpi.trend === 'up' ? 'arrow.up.right' : kpi.trend === 'down' ? 'arrow.down.right' : 'arrow.right'}
                    size={12}
                    color={kpi.trend === 'up' ? '#22C55E' : kpi.trend === 'down' ? '#EF4444' : colors.textTertiary}
                  />
                )}
              </View>
            ))}
          </View>
        );
      case 2: // Milestones
        return (
          <View>
            {event.milestones.map((ms) => (
              <View key={ms.id} style={styles.milestoneRow}>
                <View style={[styles.milestoneDot, { backgroundColor: getMilestoneStatusColor(ms.status) }]} />
                <View style={styles.milestoneInfo}>
                  <ThemedText style={styles.milestoneTitle}>{ms.title}</ThemedText>
                  <ThemedText style={[styles.milestoneStatus, { color: getMilestoneStatusColor(ms.status) }]}>
                    {ms.status.replace('_', ' ').toUpperCase()}
                    {ms.completedDate ? ` — ${ms.completedDate}` : ms.targetDate ? ` — Target: ${ms.targetDate}` : ''}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        );
      case 3: // Ops Plan
        return (
          <View>
            {event.opsActions.map((action, i) => (
              <View key={i} style={styles.opsRow}>
                <View style={[styles.opsBullet, { backgroundColor: ACCENT_GOLD }]} />
                <ThemedText style={[styles.opsText, { color: colors.textSecondary }]}>{action}</ThemedText>
              </View>
            ))}
          </View>
        );
      case 4: // Risk
        return (
          <View>
            {event.risks.map((risk) => (
              <View key={risk.id} style={styles.riskRow}>
                <View style={[styles.riskSeverity, { backgroundColor: getRiskSeverityColor(risk.severity) + '20' }]}>
                  <ThemedText style={[styles.riskSeverityText, { color: getRiskSeverityColor(risk.severity) }]}>
                    {risk.severity.toUpperCase()}
                  </ThemedText>
                </View>
                <View style={styles.riskInfo}>
                  <ThemedText style={styles.riskTitle}>{risk.title}</ThemedText>
                  {risk.mitigation && (
                    <ThemedText style={[styles.riskMitigation, { color: colors.textSecondary }]} numberOfLines={2}>
                      Mitigation: {risk.mitigation}
                    </ThemedText>
                  )}
                </View>
              </View>
            ))}
          </View>
        );
      case 5: // Constraints
        return (
          <View>
            {event.constraints.map((c, i) => (
              <View key={i} style={styles.opsRow}>
                <View style={[styles.opsBullet, { backgroundColor: colors.textTertiary }]} />
                <ThemedText style={[styles.opsText, { color: colors.textSecondary }]}>{c}</ThemedText>
              </View>
            ))}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.eventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Pressable
        style={styles.eventHeader}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(!expanded);
        }}
      >
        <View style={styles.eventHeaderLeft}>
          <ThemedText style={styles.eventName}>{event.name}</ThemedText>
          <View style={styles.eventMeta}>
            <View style={[styles.stageBadge, { backgroundColor: stageColor + '20' }]}>
              <ThemedText style={[styles.stageText, { color: stageColor }]}>
                {event.stage.toUpperCase()}
              </ThemedText>
            </View>
            <ThemedText style={[styles.eventKpiSummary, { color: colors.textTertiary }]}>
              {event.kpis.length} KPIs • {event.milestones.filter(m => m.status === 'completed').length}/{event.milestones.length} milestones
            </ThemedText>
          </View>
          <ThemedText style={[styles.eventUpdated, { color: colors.textTertiary }]}>
            Updated {event.lastUpdated.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </ThemedText>
        </View>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={16}
          color={colors.textTertiary}
        />
      </Pressable>

      {expanded && (
        <View style={styles.eventDetail}>
          {/* Tab pills */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabPills}
          >
            {DETAIL_TABS.map((tab, index) => {
              const isActive = index === activeTab;
              return (
                <Pressable
                  key={tab}
                  style={[
                    styles.tabPill,
                    { backgroundColor: isActive ? ACCENT_GOLD : colors.backgroundTertiary },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveTab(index);
                  }}
                >
                  <ThemedText
                    style={[
                      styles.tabPillText,
                      { color: isActive ? '#FFFFFF' : colors.textSecondary },
                    ]}
                  >
                    {tab}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
          {/* Tab content */}
          <View style={styles.tabContent}>
            {renderTabContent()}
          </View>
        </View>
      )}
    </View>
  );
}

export function ProofEventsContent() {
  const { activeCompanyId } = useBusiness();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const proofEvents = getProofEventsByCompany(activeCompanyId);

  if (proofEvents.length === 0) {
    return (
      <View style={styles.empty}>
        <IconSymbol name="checkmark.seal" size={40} color={colors.textTertiary} />
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          No proof events for this company.
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={proofEvents}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => <ProofEventCard event={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.sm,
  },
  eventCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  eventHeaderLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  eventName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
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
  eventKpiSummary: {
    fontSize: 12,
  },
  eventUpdated: {
    fontSize: 11,
  },

  // Detail
  eventDetail: {
    marginTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.06)',
    paddingTop: Spacing.sm,
  },
  tabPills: {
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
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
  tabContent: {
    paddingTop: Spacing.sm,
  },

  // Overview
  overviewText: {
    fontSize: 14,
    lineHeight: 22,
  },

  // KPIs
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    minWidth: '30%',
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  kpiLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
    textAlign: 'center',
  },
  kpiTarget: {
    fontSize: 10,
    marginTop: 2,
  },

  // Milestones
  milestoneRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  milestoneDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: Spacing.sm,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  milestoneStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // Ops
  opsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  opsBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: Spacing.sm,
  },
  opsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Risk
  riskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  riskSeverity: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    marginTop: 2,
  },
  riskSeverityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  riskInfo: {
    flex: 1,
  },
  riskTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  riskMitigation: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
});
