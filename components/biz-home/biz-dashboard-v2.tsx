/**
 * Biz Dashboard V2 — Full rewrite
 *
 * 7 RBAC-gated blocks + 3 bottom sheets + domain card drill-downs.
 * Dark card aesthetic matching Sports mode.
 *
 * Blocks:
 *  1. Video Hero (all roles)
 *  2. Next Event (RBAC)
 *  3. Action Row — Deck / Data Room / Invest (per-card RBAC)
 *  4. Pipeline — 4 metrics with exact/banded/hidden per role
 *  5. Proof — Institutions, Active Views, IP Docs
 *  6. Top Deals (RBAC, B2b anonymized)
 *  7. Domain Cards — Cap Table, Metrics, Updates (per-card RBAC)
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useBusiness } from '@/context/business-context';
import {
  BIZ_HERO,
  BIZ_EVENTS,
  BIZ_ACTION_ROW,
  BIZ_DOMAIN_CARDS,
  TRACTION_METRICS,
  FUNDRAISE_METRICS,
  PIPELINE_SUMMARY,
  DEALS,
  type BizActionCardId,
  type BizDomainCardId,
} from '@/data/mock-business-home';
import {
  isDashboardBlockVisible,
  isActionCardVisible,
  getPipelineMetricVisibility,
  isBizDomainCardVisible,
  type BusinessRoleLens,
} from '@/utils/business-rbac';
import { openPersonCard } from '@/utils/global-entity-sheets';

import { BizDeckSheet } from '@/components/commerce/biz-deck-sheet';
import { BizDataRoomSheet } from '@/components/commerce/biz-data-room-sheet';
import { BizInvestSheet } from '@/components/commerce/biz-invest-sheet';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  INVESTOR: '#22C55E',
  PARTNER: '#3B82F6',
  INTERNAL: '#6B7280',
  DEMO: '#8B5CF6',
};

const ATTENDEE_ROLE_COLORS: Record<string, string> = {
  founder: '#F59E0B',
  investor: '#22C55E',
  advisor: '#8B5CF6',
  board: '#3B82F6',
  partner: '#EC4899',
  staff: '#6B7280',
  press: '#EF4444',
  legal: '#6B7280',
};

export function BizDashboardV2({ colors, accent }: Props) {
  const { viewAsRole } = useBusiness();

  // Sheet state
  const [showDeck, setShowDeck] = useState(false);
  const [showDataRoom, setShowDataRoom] = useState(false);
  const [showInvest, setShowInvest] = useState(false);
  const [drillDown, setDrillDown] = useState<BizDomainCardId | null>(null);

  const nextEvent = BIZ_EVENTS.find((e) => e.status === 'upcoming');

  const handleActionCard = useCallback((id: BizActionCardId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (id) {
      case 'deck': setShowDeck(true); break;
      case 'data_room': setShowDataRoom(true); break;
      case 'invest': setShowInvest(true); break;
    }
  }, []);

  const handleDomainCard = useCallback((id: BizDomainCardId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setDrillDown(id);
  }, []);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Block 1: Video Hero ── */}
        {isDashboardBlockVisible('video_hero', viewAsRole) && (
          <View style={styles.heroWrapper}>
            <LinearGradient colors={['#1a0a2e', '#0d0d1a', '#000']} style={styles.heroGradient}>
              {BIZ_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              <Pressable style={styles.playButton}>
                <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
              </Pressable>
              <View style={styles.heroOverlay}>
                <ThemedText style={styles.heroTitle}>{BIZ_HERO.title}</ThemedText>
                <ThemedText style={styles.heroSubtitle}>{BIZ_HERO.subtitle}</ThemedText>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Block 2: Next Event ── */}
        {isDashboardBlockVisible('next_event', viewAsRole) && nextEvent && (
          <View style={[styles.darkCard, { borderTopColor: accent }]}>
            <View style={styles.eventHeader}>
              <ThemedText style={[styles.sectionLabel, { color: accent }]}>NEXT EVENT</ThemedText>
              <View style={[styles.eventTypeBadge, { backgroundColor: (EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#6B7280') + '22' }]}>
                <ThemedText style={[styles.eventTypeText, { color: EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#6B7280' }]}>
                  {nextEvent.eventType}
                </ThemedText>
              </View>
            </View>
            <ThemedText style={styles.eventTitle}>{nextEvent.title}</ThemedText>
            <ThemedText style={styles.eventMeta}>
              {nextEvent.date} · {nextEvent.time} · {nextEvent.location}
            </ThemedText>
            <View style={styles.attendeeRow}>
              {nextEvent.attendees.slice(0, 4).map((a) => (
                <View key={a.name} style={styles.attendeePill}>
                  <View style={[styles.attendeeDot, { backgroundColor: ATTENDEE_ROLE_COLORS[a.role] ?? '#6B7280' }]} />
                  <ThemedText style={styles.attendeeName}>{a.name}</ThemedText>
                </View>
              ))}
              {nextEvent.attendees.length > 4 && (
                <ThemedText style={styles.attendeeMore}>+{nextEvent.attendees.length - 4} more</ThemedText>
              )}
            </View>
          </View>
        )}

        {/* ── Block 3: Action Row ── */}
        {isDashboardBlockVisible('action_row', viewAsRole) && (
          <View style={styles.actionRow}>
            {BIZ_ACTION_ROW.filter((card) => isActionCardVisible(card.id, viewAsRole)).map((card) => (
              <Pressable
                key={card.id}
                style={styles.actionCard}
                onPress={() => handleActionCard(card.id)}
              >
                <View style={[styles.actionIconWrap, { backgroundColor: card.color + '22' }]}>
                  <IconSymbol name={card.icon as any} size={20} color={card.color} />
                </View>
                <ThemedText style={styles.actionTitle}>{card.title}</ThemedText>
                <ThemedText style={styles.actionDetail} numberOfLines={2}>{card.detail}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Block 4: Pipeline ── */}
        {isDashboardBlockVisible('pipeline', viewAsRole) && (
          <View style={[styles.darkCard, { borderTopColor: '#22C55E' }]}>
            <ThemedText style={[styles.sectionLabel, { color: accent }]}>PIPELINE</ThemedText>
            <View style={styles.metricsRow}>
              <PipelineMetric
                label="Total Value"
                value={formatValue(PIPELINE_SUMMARY.totalPipelineValue)}
                color="#22C55E"
                metric="total_value"
                role={viewAsRole}
              />
              <PipelineMetric
                label="Active Deals"
                value={String(PIPELINE_SUMMARY.activeDeals)}
                color={accent}
                metric="active_deals"
                role={viewAsRole}
              />
              <PipelineMetric
                label="Win Rate"
                value={`${(PIPELINE_SUMMARY.winRate * 100).toFixed(0)}%`}
                color="#fff"
                metric="win_rate"
                role={viewAsRole}
              />
              <PipelineMetric
                label="Raised"
                value={`$${(FUNDRAISE_METRICS.raised / 1_000).toFixed(0)}K`}
                color="#3B82F6"
                metric="raised"
                role={viewAsRole}
              />
            </View>
          </View>
        )}

        {/* ── Block 5: Proof ── */}
        {isDashboardBlockVisible('proof', viewAsRole) && (
          <View style={styles.statsRow}>
            <StatBlock label="Institutions" value={String(TRACTION_METRICS.institutions)} accent={accent} />
            <StatBlock label="Active Views" value={String(TRACTION_METRICS.activeViews)} accent={accent} />
            <StatBlock label="IP Docs" value={String(TRACTION_METRICS.ipDocs)} accent={accent} />
          </View>
        )}

        {/* ── Block 6: Top Deals ── */}
        {isDashboardBlockVisible('top_deals', viewAsRole) && (
          <View style={[styles.darkCard, { borderTopColor: '#F59E0B' }]}>
            <ThemedText style={[styles.sectionLabel, { color: accent }]}>TOP DEALS</ThemedText>
            {DEALS.filter((d) => d.priority === 'high').slice(0, 3).map((deal) => {
              const isAnonymized = viewAsRole === 'B2b';
              return (
                <Pressable
                  key={deal.id}
                  style={styles.dealRow}
                  onPress={() => openPersonCard({
                    name: isAnonymized ? 'Undisclosed' : deal.contactName,
                    role: isAnonymized ? 'Investor' : deal.company,
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.dealName}>
                      {isAnonymized ? 'Undisclosed Investor' : deal.contactName}
                    </ThemedText>
                    <ThemedText style={styles.dealCompany}>
                      {isAnonymized ? 'Confidential' : deal.company}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.dealValue, { color: accent }]}>
                    {deal.value != null ? formatValue(deal.value) : '--'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* ── Block 7: Domain Cards ── */}
        {isDashboardBlockVisible('domain_cards', viewAsRole) && (
          <View style={styles.domainSection}>
            {BIZ_DOMAIN_CARDS.filter((card) => isBizDomainCardVisible(card.id, viewAsRole)).map((card) => (
              <Pressable
                key={card.id}
                style={[styles.domainCard, { borderTopColor: card.accent }]}
                onPress={() => handleDomainCard(card.id)}
              >
                <View style={styles.domainHeader}>
                  <IconSymbol name={card.icon as any} size={18} color={card.accent} />
                  <ThemedText style={styles.domainTitle}>{card.title}</ThemedText>
                </View>
                <ThemedText style={styles.domainPreview} numberOfLines={2}>{card.preview}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <BizDeckSheet visible={showDeck} onClose={() => setShowDeck(false)} colors={colors} />
      <BizDataRoomSheet visible={showDataRoom} onClose={() => setShowDataRoom(false)} colors={colors} role={viewAsRole} />
      <BizInvestSheet visible={showInvest} onClose={() => setShowInvest(false)} colors={colors} />
    </>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function PipelineMetric({
  label, value, color, metric, role,
}: {
  label: string; value: string; color: string;
  metric: 'total_value' | 'active_deals' | 'win_rate' | 'raised';
  role: BusinessRoleLens;
}) {
  const vis = getPipelineMetricVisibility(metric, role);
  if (vis === 'hidden') return null;

  const displayValue = vis === 'banded' ? bandValue(value) : value;

  return (
    <View style={styles.metricsItem}>
      <ThemedText style={[styles.metricsValue, { color }]}>{displayValue}</ThemedText>
      <ThemedText style={styles.metricsLabel}>{label}</ThemedText>
    </View>
  );
}

function StatBlock({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color: accent }]}>{value}</ThemedText>
      <ThemedText style={styles.statLabel}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatValue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function bandValue(v: string): string {
  // Replace exact numbers with ranges
  const num = parseFloat(v.replace(/[$%KM,]/g, ''));
  if (isNaN(num)) return v;
  if (v.includes('M')) {
    const lower = Math.floor(num);
    return `$${lower}-${lower + 1}M`;
  }
  if (v.includes('K')) {
    const lower = Math.floor(num / 50) * 50;
    return `$${lower}-${lower + 50}K`;
  }
  if (v.includes('%')) {
    const lower = Math.floor(num / 5) * 5;
    return `${lower}-${lower + 5}%`;
  }
  return `~${v}`;
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroWrapper: { borderRadius: 16, overflow: 'hidden', marginBottom: 12 },
  heroGradient: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  liveBadge: {
    position: 'absolute',
    top: 12, right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  playButton: { zIndex: 1 },
  heroOverlay: { position: 'absolute', bottom: 16, left: 16, right: 16 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

  // Dark Card (shared)
  darkCard: {
    backgroundColor: '#181616',
    borderRadius: 12,
    borderTopWidth: 3,
    padding: 14,
    marginBottom: 12,
  },
  sectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },

  // Next Event
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  eventTypeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  eventTypeText: { fontSize: 9, fontWeight: '700' },
  eventTitle: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  eventMeta: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginBottom: 10 },
  attendeeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attendeePill: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attendeeDot: { width: 6, height: 6, borderRadius: 3 },
  attendeeName: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600' },
  attendeeMore: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },

  // Action Row
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#181616',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 6,
  },
  actionIconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  actionTitle: { color: '#fff', fontSize: 12, fontWeight: '700' },
  actionDetail: { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '500', textAlign: 'center' },

  // Pipeline
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricsItem: { alignItems: 'center' },
  metricsValue: { fontSize: 16, fontWeight: '800' },
  metricsLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: '600', marginTop: 2 },

  // Proof
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBlock: {
    flex: 1,
    backgroundColor: '#181616',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 4 },

  // Top Deals
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  dealName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  dealCompany: { color: 'rgba(255,255,255,0.5)', fontSize: 11, marginTop: 2 },
  dealValue: { fontSize: 14, fontWeight: '800', marginLeft: 8 },

  // Domain Cards
  domainSection: { gap: 8, marginBottom: 12 },
  domainCard: {
    backgroundColor: '#181616',
    borderRadius: 12,
    borderTopWidth: 3,
    padding: 14,
  },
  domainHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  domainTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  domainPreview: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '500' },
});
