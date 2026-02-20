/**
 * Church Dashboard V2 — ICCLA
 *
 * Layout: Video Hero → Next Service → Commerce Row (3 text-stack cards) →
 * Ministry Health → Growth Metrics (2×2) → 3 Bottom Sheets.
 * All sections RBAC-gated via canSeeChurchDashboardSection().
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  CHURCH_HERO,
  CHURCH_SERVICES,
  MINISTRY_HEALTH_SUMMARY,
  GROWTH_DASHBOARD,
  RECENT_SERMONS,
  PRAYER_REQUESTS,
  ACTIVE_CAMPAIGN,
} from '@/data/mock-church-home';
import {
  canSeeChurchDashboardSection,
  type ChurchRoleLens,
  type ChurchDashboardSection,
} from '@/utils/church-rbac';

import { ChurchGiveSheet } from '@/components/commerce/church-give-sheet';
import { ChurchSermonsSheet } from '@/components/commerce/church-sermons-sheet';
import { ChurchPrayerSheet } from '@/components/commerce/church-prayer-sheet';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: ChurchRoleLens;
}

const GOLD = '#FBBF24';

const STATUS_DOT: Record<string, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

const TREND_DIR_ICON: Record<string, string> = {
  up: 'arrow.up.right',
  flat: 'arrow.right',
  down: 'arrow.down.right',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchDashboardV2({ colors, accent, role = 'C1' }: Props) {
  const nextService = CHURCH_SERVICES.find((s) => s.status === 'upcoming');

  // Bottom sheet state
  const [giveVisible, setGiveVisible] = useState(false);
  const [sermonsVisible, setSermonsVisible] = useState(false);
  const [prayerVisible, setPrayerVisible] = useState(false);

  // RBAC helper
  const canSee = useCallback(
    (section: ChurchDashboardSection) =>
      canSeeChurchDashboardSection(section, role) !== 'hidden',
    [role],
  );

  // Derived data for commerce row subtitles
  const latestSermon = RECENT_SERMONS[0];
  const activePrayerCount = PRAYER_REQUESTS.filter((p) => !p.isPraise).length;
  const buildingFundPct = Math.round((ACTIVE_CAMPAIGN.raised / ACTIVE_CAMPAIGN.target) * 100);

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Video Hero ── */}
        {canSee('video_hero') && (
          <View style={styles.heroContainer}>
            <LinearGradient
              colors={['#1a1030', '#0d0d1a', '#000']}
              style={styles.heroGradient}
            >
              <Pressable style={styles.playButton}>
                <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
              </Pressable>

              {CHURCH_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}

              <View style={styles.heroTextBlock}>
                {CHURCH_HERO.seriesName && (
                  <ThemedText style={[styles.seriesLabel, { color: accent }]}>
                    {CHURCH_HERO.seriesName}
                  </ThemedText>
                )}
                <ThemedText style={styles.heroTitle}>{CHURCH_HERO.title}</ThemedText>
                <ThemedText style={styles.heroSpeaker}>{CHURCH_HERO.subtitle}</ThemedText>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* ── Next Service Card ── */}
        {canSee('next_service') && nextService && (
          <Pressable
            style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <ThemedText style={[styles.nextEventLabel, { color: accent }]}>NEXT SERVICE</ThemedText>
            <ThemedText style={[styles.nextEventTitle, { color: colors.text }]}>
              {nextService.title}
            </ThemedText>
            <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
              {nextService.date} · {nextService.time}
            </ThemedText>
            {nextService.speaker && (
              <ThemedText style={[styles.nextEventSpeaker, { color: colors.textSecondary }]}>
                {nextService.speaker}
              </ThemedText>
            )}
            {nextService.seriesName && (
              <ThemedText style={[styles.nextEventSeries, { color: accent }]}>
                {nextService.seriesName}
              </ThemedText>
            )}
          </Pressable>
        )}

        {/* ── Commerce Row (3 text-stack cards) ── */}
        {canSee('commerce_row') && (
          <View style={styles.commerceRow}>
            <Pressable style={styles.commerceCard} onPress={() => setGiveVisible(true)}>
              <View style={[styles.commerceTopBorder, { backgroundColor: GOLD }]} />
              <ThemedText style={styles.commerceTitle}>Give</ThemedText>
              <ThemedText style={styles.commerceSubtitle}>Building Fund 2026</ThemedText>
              <ThemedText style={styles.commerceDetail}>{buildingFundPct}% to goal</ThemedText>
            </Pressable>
            <Pressable style={styles.commerceCard} onPress={() => setSermonsVisible(true)}>
              <View style={[styles.commerceTopBorder, { backgroundColor: GOLD }]} />
              <ThemedText style={styles.commerceTitle}>Sermons</ThemedText>
              <ThemedText style={styles.commerceSubtitle} numberOfLines={1}>
                {latestSermon?.title ?? 'Latest sermon'}
              </ThemedText>
              <ThemedText style={styles.commerceDetail}>
                {latestSermon?.date ?? ''}
              </ThemedText>
            </Pressable>
            <Pressable style={styles.commerceCard} onPress={() => setPrayerVisible(true)}>
              <View style={[styles.commerceTopBorder, { backgroundColor: GOLD }]} />
              <ThemedText style={styles.commerceTitle}>Prayer</ThemedText>
              <ThemedText style={styles.commerceSubtitle}>
                {activePrayerCount} active requests
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* ── Ministry Health ── */}
        {canSee('ministry_health') && (
          <View style={styles.darkCard}>
            <View style={[styles.darkCardAccent, { backgroundColor: GOLD }]} />
            <View style={styles.darkCardContent}>
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>Ministry Health</ThemedText>
                <ThemedText style={styles.sectionBadge}>
                  {MINISTRY_HEALTH_SUMMARY.activeCount} Active
                </ThemedText>
              </View>

              {/* Top 3 */}
              {MINISTRY_HEALTH_SUMMARY.top3.map((m) => (
                <View key={m.name} style={styles.ministryRow}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.ministryName}>{m.name}</ThemedText>
                    <ThemedText style={styles.ministryLeader}>{m.leader}</ThemedText>
                  </View>
                  <View style={styles.ministryStats}>
                    <ThemedText style={styles.ministryMembers}>{m.members}</ThemedText>
                    <View style={styles.trendPill}>
                      <IconSymbol
                        name={TREND_DIR_ICON[m.trendDir] as any}
                        size={10}
                        color={m.trendDir === 'up' ? '#22C55E' : m.trendDir === 'down' ? '#EF4444' : '#6B7280'}
                      />
                      <ThemedText style={[
                        styles.trendText,
                        { color: m.trendDir === 'up' ? '#22C55E' : m.trendDir === 'down' ? '#EF4444' : '#6B7280' },
                      ]}>
                        {m.trend}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              ))}

              {/* Flagged Alerts */}
              {MINISTRY_HEALTH_SUMMARY.flagged.length > 0 && (
                <View style={styles.alertSection}>
                  {MINISTRY_HEALTH_SUMMARY.flagged.map((f) => (
                    <View key={f.name} style={styles.alertRow}>
                      <View style={[styles.alertDot, { backgroundColor: '#F59E0B' }]} />
                      <ThemedText style={styles.alertText}>
                        <ThemedText style={styles.alertName}>{f.name}: </ThemedText>
                        {f.alert}
                      </ThemedText>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* ── Growth Metrics (2×2) ── */}
        {canSee('growth_metrics') && (
          <View style={styles.darkCard}>
            <View style={[styles.darkCardAccent, { backgroundColor: GOLD }]} />
            <View style={styles.darkCardContent}>
              <ThemedText style={styles.sectionTitle}>Growth Metrics</ThemedText>
              <View style={styles.metricsGrid}>
                {GROWTH_DASHBOARD.map((metric) => (
                  <View key={metric.label} style={styles.metricCell}>
                    <ThemedText style={styles.metricValue}>{metric.value}</ThemedText>
                    <View style={styles.metricLabelRow}>
                      <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[metric.status] ?? '#6B7280' }]} />
                      <ThemedText style={styles.metricLabel}>{metric.label}</ThemedText>
                    </View>
                    <ThemedText style={styles.metricDetail}>{metric.detail}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <ChurchGiveSheet visible={giveVisible} onClose={() => setGiveVisible(false)} colors={colors as any} />
      <ChurchSermonsSheet visible={sermonsVisible} onClose={() => setSermonsVisible(false)} colors={colors as any} />
      <ChurchPrayerSheet visible={prayerVisible} onClose={() => setPrayerVisible(false)} colors={colors as any} />
    </>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  heroGradient: { aspectRatio: 16 / 9, justifyContent: 'flex-end', alignItems: 'center', padding: 20 },
  playButton: { position: 'absolute', top: '35%' },
  liveBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroTextBlock: { width: '100%', alignItems: 'center' },
  seriesLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  heroSpeaker: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },

  // Next Event
  nextEventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  nextEventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  nextEventMeta: { fontSize: 12, marginTop: 2 },
  nextEventSpeaker: { fontSize: 12, marginTop: 2 },
  nextEventSeries: { fontSize: 11, fontWeight: '600', fontStyle: 'italic', marginTop: 4 },

  // Commerce Row (text-stack)
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  commerceCard: {
    flex: 1, backgroundColor: '#181616', borderRadius: 12, padding: 12,
    overflow: 'hidden',
  },
  commerceTopBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  commerceTitle: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 2 },
  commerceSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3 },
  commerceDetail: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 },

  // Dark card (Ministry Health, Growth Metrics)
  darkCard: {
    backgroundColor: '#181616', borderRadius: 12, overflow: 'hidden', marginBottom: 12,
  },
  darkCardAccent: { height: 3 },
  darkCardContent: { padding: 14 },

  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sectionBadge: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },

  // Ministry Health rows
  ministryRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  ministryName: { color: '#fff', fontSize: 13, fontWeight: '700' },
  ministryLeader: { color: 'rgba(255,255,255,0.4)', fontSize: 10, marginTop: 1 },
  ministryStats: { alignItems: 'flex-end', gap: 2 },
  ministryMembers: { color: '#fff', fontSize: 16, fontWeight: '800' },
  trendPill: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  trendText: { fontSize: 10, fontWeight: '700' },

  // Flagged alerts
  alertSection: { marginTop: 10 },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 6 },
  alertDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  alertText: { color: '#F59E0B', fontSize: 11, flex: 1 },
  alertName: { fontWeight: '700' },

  // Growth Metrics 2x2
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  metricCell: { width: '50%', paddingVertical: 8, paddingHorizontal: 4 },
  metricValue: { color: '#fff', fontSize: 20, fontWeight: '800' },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10 },
  metricDetail: { color: 'rgba(255,255,255,0.35)', fontSize: 9, marginTop: 2 },
});
