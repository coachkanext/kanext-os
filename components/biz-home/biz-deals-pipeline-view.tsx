/**
 * Biz Deals Pipeline View — Summary card, stage pills, deal rows
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import {
  DEALS,
  DEAL_STAGES,
  PIPELINE_SUMMARY,
  type Deal,
} from '@/data/mock-business-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type StageFilter = 'all' | string;

const DEAL_TYPE_COLORS: Record<string, string> = {
  investor: '#22C55E',
  partner: '#3B82F6',
  client: '#8B5CF6',
  licensing: '#F59E0B',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: '#EF4444',
  medium: '#F59E0B',
  low: '#6B7280',
};

function formatValue(value?: number): string {
  if (value == null) return '--';
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatPipelineTotal(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

export function BizDealsPipelineView({ colors, accent }: Props) {
  const [stageFilter, setStageFilter] = useState<StageFilter>('all');

  const filteredDeals = useMemo(() => {
    if (stageFilter === 'all') return DEALS;
    return DEALS.filter((d: Deal) => d.stage === stageFilter);
  }, [stageFilter]);

  const stageColorMap = useMemo(() => {
    const map: Record<string, string> = {};
    DEAL_STAGES.forEach((s) => { map[s.key] = s.color; });
    return map;
  }, []);

  const stageLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    DEAL_STAGES.forEach((s) => { map[s.key] = s.label; });
    return map;
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: accent }]}>{PIPELINE_SUMMARY.activeDeals}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Active</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: '#8B5CF6' }]}>{PIPELINE_SUMMARY.proposalStage}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Proposal</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: '#F97316' }]}>{PIPELINE_SUMMARY.negotiating}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Negotiating</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: '#22C55E' }]}>
              {formatPipelineTotal(PIPELINE_SUMMARY.totalPipelineValue)}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Pipeline</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: colors.text }]}>
              {typeof PIPELINE_SUMMARY.winRate === 'number' && PIPELINE_SUMMARY.winRate < 1
                ? `${(PIPELINE_SUMMARY.winRate * 100).toFixed(0)}%`
                : `${PIPELINE_SUMMARY.winRate}%`}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Win Rate</ThemedText>
          </View>
        </View>
      </View>

      {/* Stage pills */}
      <View style={styles.stagePills}>
        <Pressable
          style={[styles.stagePill, stageFilter === 'all' && { backgroundColor: accent }]}
          onPress={() => setStageFilter('all')}
        >
          <ThemedText style={[styles.stagePillText, { color: stageFilter === 'all' ? '#000' : colors.textSecondary }]}>
            All ({DEALS.length})
          </ThemedText>
        </Pressable>
        {DEAL_STAGES.map((stage) => {
          const isActive = stageFilter === stage.key;
          return (
            <Pressable
              key={stage.key}
              style={[styles.stagePill, isActive && { backgroundColor: stage.color }]}
              onPress={() => setStageFilter(stage.key)}
            >
              <ThemedText style={[styles.stagePillText, { color: isActive ? '#000' : colors.textSecondary }]}>
                {stage.label} ({stage.count})
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Deal rows */}
      {filteredDeals.map((deal: Deal) => {
        const typeColor = DEAL_TYPE_COLORS[deal.dealType] ?? '#6B7280';
        const sColor = stageColorMap[deal.stage] ?? '#6B7280';
        const sLabel = stageLabelMap[deal.stage] ?? deal.stage;
        const priColor = PRIORITY_COLORS[deal.priority] ?? '#6B7280';

        return (
          <Pressable
            key={deal.id}
            style={[styles.dealRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openPersonCard({ name: deal.contactName, role: deal.company });
            }}
          >
            <View style={styles.dealTop}>
              <View style={{ flex: 1 }}>
                <View style={styles.dealNameRow}>
                  <View style={[styles.priorityDot, { backgroundColor: priColor }]} />
                  <ThemedText style={[styles.dealContact, { color: colors.text }]}>
                    {deal.contactName}
                  </ThemedText>
                </View>
                <ThemedText style={[styles.dealCompany, { color: colors.textSecondary }]}>
                  {deal.company}
                </ThemedText>
              </View>
              <ThemedText style={[styles.dealValue, { color: accent }]}>
                {formatValue(deal.value)}
              </ThemedText>
            </View>

            <View style={styles.dealBadges}>
              <View style={[styles.typeBadge, { backgroundColor: typeColor + '22' }]}>
                <ThemedText style={[styles.typeBadgeText, { color: typeColor }]}>
                  {deal.dealType.toUpperCase()}
                </ThemedText>
              </View>
              <View style={[styles.stageBadge, { backgroundColor: sColor + '22' }]}>
                <ThemedText style={[styles.stageBadgeText, { color: sColor }]}>
                  {sLabel}
                </ThemedText>
              </View>
            </View>

            {/* Valuation */}
            {deal.valuation != null && (
              <ThemedText style={[styles.dealMeta, { color: colors.textSecondary }]}>
                Valuation: {formatValue(deal.valuation)}
              </ThemedText>
            )}

            {/* Last Activity */}
            {deal.lastActivity ? (
              <ThemedText style={[styles.dealMeta, { color: colors.textSecondary }]}>
                Last activity: {deal.lastActivity}
              </ThemedText>
            ) : (
              <ThemedText style={[styles.dealMeta, { color: colors.textSecondary }]}>
                Last contact: {deal.lastContact}
              </ThemedText>
            )}

            {/* Assigned To (tappable) */}
            {deal.assignedTo && (
              <View style={styles.assignedRow}>
                <ThemedText style={[styles.assignedLabel, { color: colors.textSecondary }]}>Assigned: </ThemedText>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    openPersonCard({ name: deal.assignedTo!, role: 'Owner' });
                  }}
                >
                  <ThemedText style={[styles.assignedLink, { color: '#6AA9FF' }]}>{deal.assignedTo}</ThemedText>
                </Pressable>
              </View>
            )}

            <ThemedText style={[styles.nextAction, { color: colors.textSecondary }]}>
              Next: {deal.nextAction}
            </ThemedText>
          </Pressable>
        );
      })}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  summaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 16, fontWeight: '800' },
  summaryLabel: { fontSize: 9, fontWeight: '600', marginTop: 2 },
  stagePills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  stagePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  stagePillText: { fontSize: 10, fontWeight: '600' },
  dealRow: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  dealTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  dealNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  dealContact: { fontSize: 14, fontWeight: '700' },
  dealCompany: { fontSize: 12, marginTop: 2, marginLeft: 12 },
  dealValue: { fontSize: 16, fontWeight: '800', marginLeft: 8 },
  dealBadges: { flexDirection: 'row', gap: 6, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeBadgeText: { fontSize: 10, fontWeight: '700' },
  stageBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  stageBadgeText: { fontSize: 10, fontWeight: '700' },
  dealMeta: { fontSize: 11, marginBottom: 2 },
  assignedRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  assignedLabel: { fontSize: 11 },
  assignedLink: { fontSize: 11, fontWeight: '700' },
  nextAction: { fontSize: 11, fontStyle: 'italic' },
});
