/**
 * Church Dashboard V2 — Hero + Next Event + Commerce Row + Quick Stats
 * Top-level Dashboard content for Church Home.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  CHURCH_HERO,
  CHURCH_COMMERCE,
  CHURCH_SERVICES,
  GROWTH_METRICS,
  ACTIVE_CAMPAIGN,
} from '@/data/mock-church-home';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function ChurchDashboardV2({ colors, accent }: Props) {
  const nextService = CHURCH_SERVICES.find((s) => s.status === 'upcoming');

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Video Hero ── */}
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={['#1a1030', '#0d0d1a', '#000']}
          style={styles.heroGradient}
        >
          {/* Play Button */}
          <Pressable style={styles.playButton}>
            <IconSymbol name="play.circle.fill" size={56} color="rgba(255,255,255,0.7)" />
          </Pressable>

          {/* LIVE badge */}
          {CHURCH_HERO.isLive && (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          )}

          {/* Hero text */}
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

      {/* ── Next Event Card ── */}
      {nextService && (
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

      {/* ── Commerce Row ── */}
      <View style={styles.commerceRow}>
        {CHURCH_COMMERCE.map((card) => (
          <Pressable
            key={card.id}
            style={[styles.commerceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.commerceIconWrap, { backgroundColor: card.color + '22' }]}>
              <IconSymbol name={card.icon as any} size={20} color={card.color} />
            </View>
            <ThemedText style={[styles.commerceLabel, { color: colors.text }]}>
              {card.title}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* ── Quick Stats ── */}
      <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.statsHeader, { color: accent }]}>
          {GROWTH_METRICS.period}
        </ThemedText>
        <View style={styles.statsRow}>
          {[
            { label: 'Baptisms', value: GROWTH_METRICS.baptisms },
            { label: 'Visitors', value: GROWTH_METRICS.firstTimeVisitors },
            { label: 'New Members', value: GROWTH_METRICS.newMembers },
          ].map((stat) => (
            <View key={stat.label} style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: colors.text }]}>
                {stat.value}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
                {stat.label}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* ── Attendance: Volunteers + Connect Group Rate ── */}
        <View style={[styles.statsRow, { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border }]}>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>
              {GROWTH_METRICS.volunteerCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Volunteers
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={[styles.statValue, { color: colors.text }]}>
              {Math.round(GROWTH_METRICS.connectGroupRate * 100)}%
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>
              Connect Group Rate
            </ThemedText>
          </View>
        </View>
      </View>

      {/* ── Building Fund Campaign ── */}
      <View style={[styles.campaignCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[styles.campaignTitle, { color: colors.text }]}>
          {ACTIVE_CAMPAIGN.name}
        </ThemedText>
        <View style={styles.campaignAmounts}>
          <ThemedText style={[styles.campaignRaised, { color: accent }]}>
            ${(ACTIVE_CAMPAIGN.raised / 1000).toFixed(0)}K raised
          </ThemedText>
          <ThemedText style={[styles.campaignTarget, { color: colors.textSecondary }]}>
            of ${(ACTIVE_CAMPAIGN.target / 1000).toFixed(0)}K goal
          </ThemedText>
        </View>
        <View style={[styles.campaignTrack, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.campaignFill,
              {
                backgroundColor: accent,
                width: `${Math.min((ACTIVE_CAMPAIGN.raised / ACTIVE_CAMPAIGN.target) * 100, 100)}%`,
              },
            ]}
          />
        </View>
        <ThemedText style={[styles.campaignPct, { color: colors.textSecondary }]}>
          {Math.round((ACTIVE_CAMPAIGN.raised / ACTIVE_CAMPAIGN.target) * 100)}% funded
        </ThemedText>
      </View>

      {/* ── Ask Nexus CTA ── */}
      <Pressable style={[styles.askNexusCta, { backgroundColor: accent + '15', borderColor: accent + '33' }]}>
        <ThemedText style={[styles.askNexusText, { color: accent }]}>
          Ask Nexus about ICCLA
        </ThemedText>
      </Pressable>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },
  heroContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 14 },
  heroGradient: { aspectRatio: 16 / 9, justifyContent: 'flex-end', alignItems: 'center', padding: 20 },
  playButton: { position: 'absolute', top: '35%' },
  liveBadge: { position: 'absolute', top: 14, right: 14, backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroTextBlock: { width: '100%', alignItems: 'center' },
  seriesLabel: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', marginBottom: 4 },
  heroTitle: { color: '#fff', fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  heroSpeaker: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  nextEventCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 14 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  nextEventTitle: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  nextEventMeta: { fontSize: 12, marginTop: 2 },
  nextEventSpeaker: { fontSize: 12, marginTop: 2 },
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  commerceCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: 'center', gap: 8 },
  commerceIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  commerceLabel: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  statsCard: { borderRadius: 12, borderWidth: 1, padding: 16 },
  statsHeader: { fontSize: 10, fontWeight: '800', letterSpacing: 1, textAlign: 'center', marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 10, marginTop: 2 },
  nextEventSeries: { fontSize: 11, fontWeight: '600', fontStyle: 'italic', marginTop: 4 },
  campaignCard: { borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 14 },
  campaignTitle: { fontSize: 14, fontWeight: '700', marginBottom: 6 },
  campaignAmounts: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  campaignRaised: { fontSize: 16, fontWeight: '800' },
  campaignTarget: { fontSize: 12 },
  campaignTrack: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 6 },
  campaignFill: { height: 8, borderRadius: 4 },
  campaignPct: { fontSize: 11, textAlign: 'right' },
  askNexusCta: { borderRadius: 12, borderWidth: 1, padding: 16, marginTop: 14, alignItems: 'center' },
  askNexusText: { fontSize: 14, fontWeight: '700' },
});
