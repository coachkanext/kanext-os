/**
 * Biz Dashboard V2 — KaNeXT startup dashboard
 * Video Hero + Next Event + Commerce Row + Quick Stats
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  BIZ_HERO,
  BIZ_COMMERCE,
  BIZ_EVENTS,
  TRACTION_METRICS,
  FUNDRAISE_METRICS,
  PIPELINE_SUMMARY,
  DEALS,
} from '@/data/mock-business-home';
import { openPersonCard } from '@/utils/global-entity-sheets';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizDashboardV2({ colors, accent }: Props) {
  const nextEvent = BIZ_EVENTS.find((e) => e.status === 'upcoming');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* ── Video Hero ── */}
      <View style={styles.heroWrapper}>
        <LinearGradient colors={['#2e1a0a', '#1a150d', '#000']} style={styles.heroGradient}>
          {/* LIVE badge */}
          {BIZ_HERO.isLive && (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          )}

          {/* Play button */}
          <Pressable style={styles.playButton}>
            <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* Title overlay */}
          <View style={styles.heroOverlay}>
            <ThemedText style={styles.heroTitle}>{BIZ_HERO.title}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{BIZ_HERO.subtitle}</ThemedText>
          </View>
        </LinearGradient>
      </View>

      {/* ── Next Event Card ── */}
      {nextEvent && (
        <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.nextEventLabel, { color: accent }]}>NEXT EVENT</ThemedText>
          <ThemedText style={[styles.nextEventTitle, { color: colors.text }]}>{nextEvent.title}</ThemedText>
          <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
            {nextEvent.date} · {nextEvent.time} · {nextEvent.location}
          </ThemedText>
          <View style={styles.attendeePreview}>
            {nextEvent.attendees.slice(0, 3).map((name) => (
              <ThemedText key={name} style={[styles.attendeeName, { color: colors.textSecondary }]}>
                {name}
              </ThemedText>
            ))}
            {nextEvent.attendees.length > 3 && (
              <ThemedText style={[styles.attendeeName, { color: colors.textSecondary }]}>
                +{nextEvent.attendees.length - 3} more
              </ThemedText>
            )}
          </View>
        </View>
      )}

      {/* ── Commerce Row ── */}
      <View style={styles.commerceRow}>
        {BIZ_COMMERCE.map((card) => (
          <Pressable
            key={card.id}
            style={[styles.commerceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.commerceIcon, { backgroundColor: card.color + '22' }]}>
              <IconSymbol name={card.icon as any} size={20} color={card.color} />
            </View>
            <ThemedText style={[styles.commerceLabel, { color: colors.text }]} numberOfLines={2}>
              {card.title}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* ── Revenue / Pipeline Metrics ── */}
      <View style={[styles.metricsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.metricsSectionLabel, { color: accent }]}>PIPELINE</ThemedText>
        <View style={styles.metricsRow}>
          <View style={styles.metricsItem}>
            <ThemedText style={[styles.metricsValue, { color: '#22C55E' }]}>
              {PIPELINE_SUMMARY.totalPipelineValue >= 1_000_000
                ? `$${(PIPELINE_SUMMARY.totalPipelineValue / 1_000_000).toFixed(1)}M`
                : `$${(PIPELINE_SUMMARY.totalPipelineValue / 1_000).toFixed(0)}K`}
            </ThemedText>
            <ThemedText style={[styles.metricsLabel, { color: colors.textSecondary }]}>Total Value</ThemedText>
          </View>
          <View style={styles.metricsItem}>
            <ThemedText style={[styles.metricsValue, { color: accent }]}>{PIPELINE_SUMMARY.activeDeals}</ThemedText>
            <ThemedText style={[styles.metricsLabel, { color: colors.textSecondary }]}>Active Deals</ThemedText>
          </View>
          <View style={styles.metricsItem}>
            <ThemedText style={[styles.metricsValue, { color: colors.text }]}>
              {typeof PIPELINE_SUMMARY.winRate === 'number' && PIPELINE_SUMMARY.winRate < 1
                ? `${(PIPELINE_SUMMARY.winRate * 100).toFixed(0)}%`
                : `${PIPELINE_SUMMARY.winRate}%`}
            </ThemedText>
            <ThemedText style={[styles.metricsLabel, { color: colors.textSecondary }]}>Win Rate</ThemedText>
          </View>
          <View style={styles.metricsItem}>
            <ThemedText style={[styles.metricsValue, { color: '#3B82F6' }]}>
              ${(FUNDRAISE_METRICS.raised / 1_000).toFixed(0)}K
            </ThemedText>
            <ThemedText style={[styles.metricsLabel, { color: colors.textSecondary }]}>Raised</ThemedText>
          </View>
        </View>
      </View>

      {/* ── Quick Stats ── */}
      <View style={styles.statsRow}>
        <StatBlock label="Institutions" value={String(TRACTION_METRICS.institutions)} colors={colors} accent={accent} />
        <StatBlock label="Active Views" value={String(TRACTION_METRICS.activeViews)} colors={colors} accent={accent} />
        <StatBlock label="IP Docs" value={String(TRACTION_METRICS.ipDocs)} colors={colors} accent={accent} />
      </View>

      {/* ── Quick Deal Summary ── */}
      <View style={[styles.dealSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.metricsSectionLabel, { color: accent }]}>TOP DEALS</ThemedText>
        {DEALS.filter((d) => d.priority === 'high').slice(0, 3).map((deal) => (
          <Pressable
            key={deal.id}
            style={styles.dealSummaryRow}
            onPress={() => openPersonCard({ name: deal.contactName, role: deal.company })}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.dealSummaryName, { color: colors.text }]}>{deal.contactName}</ThemedText>
              <ThemedText style={[styles.dealSummaryCompany, { color: colors.textSecondary }]}>{deal.company}</ThemedText>
            </View>
            <ThemedText style={[styles.dealSummaryValue, { color: accent }]}>
              {deal.value != null
                ? deal.value >= 1_000_000
                  ? `$${(deal.value / 1_000_000).toFixed(1)}M`
                  : `$${(deal.value / 1_000).toFixed(0)}K`
                : '--'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* ── Ask Nexus CTA ── */}
      <Pressable style={[styles.nexusCta, { backgroundColor: accent + '18' }]}>
        <ThemedText style={[styles.nexusCtaText, { color: accent }]}>
          Ask Nexus about KaNeXT OS {'\u2192'}
        </ThemedText>
      </Pressable>

      {/* Bottom spacer */}
      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

function StatBlock({
  label,
  value,
  colors,
  accent,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <View style={[styles.statBlock, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.statValue, { color: accent }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

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
    top: 12,
    right: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  playButton: { zIndex: 1 },
  heroOverlay: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800' },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  nextEventTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  nextEventMeta: { fontSize: 11, marginBottom: 8 },
  attendeePreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  attendeeName: { fontSize: 11 },

  // Commerce Row
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  commerceCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  commerceIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  commerceLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },

  // Revenue / Pipeline Metrics
  metricsCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  metricsSectionLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 10 },
  metricsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  metricsItem: { alignItems: 'center' },
  metricsValue: { fontSize: 16, fontWeight: '800' },
  metricsLabel: { fontSize: 9, fontWeight: '600', marginTop: 2 },

  // Quick Stats
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statBlock: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 4 },

  // Quick Deal Summary
  dealSummaryCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 12 },
  dealSummaryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: 'rgba(255,255,255,0.06)' },
  dealSummaryName: { fontSize: 13, fontWeight: '700' },
  dealSummaryCompany: { fontSize: 11, marginTop: 2 },
  dealSummaryValue: { fontSize: 14, fontWeight: '800', marginLeft: 8 },

  // Ask Nexus CTA
  nexusCta: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 12 },
  nexusCtaText: { fontSize: 14, fontWeight: '700' },
});
