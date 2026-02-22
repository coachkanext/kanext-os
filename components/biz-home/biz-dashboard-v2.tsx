/**
 * Biz Dashboard V2 — Full rewrite
 *
 * 7 RBAC-gated blocks + 3 bottom sheets + domain card drill-downs.
 * Luxury dark card aesthetic — investor-grade visual polish.
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
import { Colors , MODE_ACCENT } from '@/constants/theme';
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
  DEAL_STAGE_LABELS,

  type BizActionCardId,
  type BizDomainCardId,
  type BizDealStage,
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

const ACCENT = MODE_ACCENT.business;

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  INVESTOR: '#22C55E',
  PARTNER: ACCENT,
  INTERNAL: '#A1A1AA',
  DEMO: ACCENT,
};

const ATTENDEE_ROLE_COLORS: Record<string, string> = {
  founder: '#F59E0B',
  investor: '#22C55E',
  advisor: ACCENT,
  board: ACCENT,
  partner: ACCENT,
  staff: '#A1A1AA',
  press: '#EF4444',
  legal: '#A1A1AA',
};

const STAGE_COLORS: Record<string, string> = {
  lead: '#A1A1AA',
  contacted: ACCENT,
  meeting_set: ACCENT,
  proposal_sent: '#F59E0B',
  negotiating: '#F59E0B',
  due_diligence: ACCENT,
  closed_won: '#22C55E',
  closed_lost: '#EF4444',
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
            <LinearGradient colors={['#0B0F14', '#0B0F14', '#0B0F14']} style={styles.heroGradient}>
              {/* Subtle inner vignette */}
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.heroScrim}
              />
              {BIZ_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <View style={styles.liveDot} />
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
              <Pressable style={styles.playButton}>
                <View style={styles.playRing}>
                  <IconSymbol name="play.fill" size={24} color="rgba(255,255,255,0.9)" />
                </View>
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
          <View style={styles.darkCard}>
            <View style={[styles.cardAccentStripe, { backgroundColor: accent }]} />
            <View style={styles.eventHeader}>
              <ThemedText style={[styles.sectionLabel, { color: accent }]}>NEXT EVENT</ThemedText>
              <View style={[styles.eventTypeBadge, { backgroundColor: (EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#A1A1AA') + '18' }]}>
                <View style={[styles.microDot, { backgroundColor: EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#A1A1AA' }]} />
                <ThemedText style={[styles.eventTypeText, { color: EVENT_TYPE_COLORS[nextEvent.eventType] ?? '#A1A1AA' }]}>
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
                <View key={a.name} style={[styles.attendeePill, { backgroundColor: (ATTENDEE_ROLE_COLORS[a.role] ?? '#A1A1AA') + '12' }]}>
                  <View style={[styles.attendeeDot, { backgroundColor: ATTENDEE_ROLE_COLORS[a.role] ?? '#A1A1AA' }]} />
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
                <View style={[styles.actionIconWrap, { backgroundColor: card.color + '18' }]}>
                  <IconSymbol name={card.icon as any} size={22} color={card.color} />
                </View>
                <ThemedText style={styles.actionTitle}>{card.title}</ThemedText>
                <ThemedText style={styles.actionDetail} numberOfLines={2}>{card.detail}</ThemedText>
              </Pressable>
            ))}
          </View>
        )}

        {/* ── Block 4: Pipeline ── */}
        {isDashboardBlockVisible('pipeline', viewAsRole) && (
          <View style={styles.darkCard}>
            <View style={[styles.cardAccentStripe, { backgroundColor: '#22C55E' }]} />
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
                color={ACCENT}
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
          <View style={styles.darkCard}>
            <View style={[styles.cardAccentStripe, { backgroundColor: '#F59E0B' }]} />
            <ThemedText style={[styles.sectionLabel, { color: accent }]}>TOP DEALS</ThemedText>
            {DEALS.filter((d) => d.priority === 'high').slice(0, 3).map((deal, i, arr) => {
              const isAnonymized = viewAsRole === 'B2b';
              const stageColor = STAGE_COLORS[deal.stage] ?? '#A1A1AA';
              const stageLabel = DEAL_STAGE_LABELS[deal.stage] ?? deal.stage;
              return (
                <Pressable
                  key={deal.id}
                  style={[styles.dealRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                  onPress={() => openPersonCard({
                    name: isAnonymized ? 'Undisclosed' : deal.contactName,
                    role: isAnonymized ? 'Investor' : deal.company,
                  })}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.dealName}>
                      {isAnonymized ? 'Undisclosed Investor' : deal.contactName}
                    </ThemedText>
                    <View style={styles.dealSubRow}>
                      <ThemedText style={styles.dealCompany}>
                        {isAnonymized ? 'Confidential' : deal.company}
                      </ThemedText>
                      <View style={[styles.stagePill, { backgroundColor: stageColor + '18' }]}>
                        <View style={[styles.stageDot, { backgroundColor: stageColor }]} />
                        <ThemedText style={[styles.stageText, { color: stageColor }]}>
                          {isAnonymized ? 'Active' : stageLabel}
                        </ThemedText>
                      </View>
                    </View>
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
                style={styles.domainCard}
                onPress={() => handleDomainCard(card.id)}
              >
                <View style={[styles.cardAccentStripe, { backgroundColor: card.accent }]} />
                <View style={styles.domainHeader}>
                  <View style={[styles.domainIconWrap, { backgroundColor: card.accent + '18' }]}>
                    <IconSymbol name={card.icon as any} size={16} color={card.accent} />
                  </View>
                  <ThemedText style={styles.domainTitle}>{card.title}</ThemedText>
                  <IconSymbol name="chevron.right" size={12} color="rgba(255,255,255,0.25)" />
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

  // ─── Video Hero ───
  heroWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
  },
  heroGradient: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroScrim: {
    ...StyleSheet.absoluteFillObject,
    top: '40%',
  },
  liveBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  playButton: { zIndex: 1 },
  playRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 3,
  },
  heroOverlay: { position: 'absolute', bottom: 18, left: 18, right: 18 },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  // ─── Dark Card (shared) ───
  darkCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2F3336',
    padding: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardAccentStripe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // ─── Next Event ───
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  eventTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  microDot: { width: 5, height: 5, borderRadius: 2.5 },
  eventTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  eventTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  eventMeta: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 12,
  },
  attendeeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  attendeePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  attendeeDot: { width: 5, height: 5, borderRadius: 2.5 },
  attendeeName: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    fontWeight: '600',
  },
  attendeeMore: { color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: '500' },

  // ─── Action Row ───
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  actionCard: {
    flex: 1,
    backgroundColor: '#0B0F14',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2F3336',
    padding: 14,
    alignItems: 'center',
    gap: 8,
  },
  actionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionDetail: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ─── Pipeline ───
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 2 },
  metricsItem: { alignItems: 'center', flex: 1 },
  metricsValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  metricsLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ─── Proof ───
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBlock: {
    flex: 1,
    backgroundColor: '#0B0F14',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2F3336',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -1,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginTop: 4,
    textTransform: 'uppercase',
  },

  // ─── Top Deals ───
  dealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  dealName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  dealSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 3,
  },
  dealCompany: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '500' },
  dealValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginLeft: 10,
  },
  stagePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stageDot: { width: 4, height: 4, borderRadius: 2 },
  stageText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },

  // ─── Domain Cards ───
  domainSection: { gap: 8, marginBottom: 12 },
  domainCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#2F3336',
    padding: 16,
    overflow: 'hidden',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  domainIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  domainTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  domainPreview: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
    marginLeft: 40,
  },
});
