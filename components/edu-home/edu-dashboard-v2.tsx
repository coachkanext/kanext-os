/**
 * Education Dashboard V2 — FMU
 * Video Hero + Next Event + Commerce Row + Quick Stats
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  EDU_HERO,
  EDU_COMMERCE,
  EDU_EVENTS,
  ENROLLMENT_DATA,
  ACADEMIC_METRICS,
  EDU_EVENT_CATEGORY_COLORS,
  type EduCommerceItem,
} from '@/data/mock-education-home';
import { openPersonCard } from '@/utils/global-entity-sheets';
import { openAskNexus } from '@/utils/global-ask-nexus';

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function EduDashboardV2({ colors, accent }: Props) {
  const nextEvent = EDU_EVENTS.find((e) => e.status === 'upcoming');
  const gradRate = (ACADEMIC_METRICS.graduationRate4yr * 100).toFixed(0);

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Video Hero */}
      <Pressable style={styles.heroContainer}>
        <LinearGradient
          colors={['#0a2e1a', '#0d1a0f', '#000']}
          style={styles.heroGradient}
        >
          {/* Play button */}
          <View style={styles.playButton}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </View>

          {/* LIVE badge */}
          {EDU_HERO.isLive && (
            <View style={styles.liveBadge}>
              <ThemedText style={styles.liveText}>LIVE</ThemedText>
            </View>
          )}

          {/* Title overlay */}
          <View style={styles.heroOverlay}>
            <ThemedText style={styles.heroTitle}>{EDU_HERO.title}</ThemedText>
            <ThemedText style={styles.heroSubtitle}>{EDU_HERO.subtitle}</ThemedText>
            {EDU_HERO.instructor && (
              <Pressable
                onPress={() =>
                  openPersonCard({ name: EDU_HERO.instructor!, role: 'Speaker', status: 'active' })
                }
              >
                <ThemedText style={styles.heroInstructor}>{EDU_HERO.instructor}</ThemedText>
              </Pressable>
            )}
          </View>
        </LinearGradient>
      </Pressable>

      {/* Next Event Card */}
      {nextEvent && (
        <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[styles.nextEventLabel, { color: accent }]}>NEXT EVENT</ThemedText>
          <ThemedText style={[styles.nextEventTitle, { color: colors.text }]}>{nextEvent.title}</ThemedText>
          <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
            {nextEvent.date} · {nextEvent.time}
          </ThemedText>
          <View style={[styles.nextEventBadge, { backgroundColor: EDU_EVENT_CATEGORY_COLORS[nextEvent.category] + '22' }]}>
            <ThemedText style={[styles.nextEventBadgeText, { color: EDU_EVENT_CATEGORY_COLORS[nextEvent.category] }]}>
              {nextEvent.category.replace('_', ' ')}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Commerce Row */}
      <View style={styles.commerceRow}>
        {EDU_COMMERCE.map((item: EduCommerceItem) => (
          <Pressable
            key={item.id}
            style={[styles.commerceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.commerceIcon, { backgroundColor: item.color + '22' }]}>
              <IconSymbol name={item.icon as any} size={20} color={item.color} />
            </View>
            <ThemedText style={[styles.commerceLabel, { color: colors.text }]} numberOfLines={1}>
              {item.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Quick Stats */}
      <View style={[styles.quickStats, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.quickStatItem}>
          <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
            {ENROLLMENT_DATA.currentTotal.toLocaleString()}
          </ThemedText>
          <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Enrollment</ThemedText>
        </View>
        <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
        <View style={styles.quickStatItem}>
          <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
            {(ENROLLMENT_DATA.retentionRate * 100).toFixed(0)}%
          </ThemedText>
          <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Retention</ThemedText>
        </View>
        <View style={[styles.quickStatDivider, { backgroundColor: colors.border }]} />
        <View style={styles.quickStatItem}>
          <ThemedText style={[styles.quickStatValue, { color: colors.text }]}>
            {gradRate}%
          </ThemedText>
          <ThemedText style={[styles.quickStatLabel, { color: colors.textSecondary }]}>Grad Rate</ThemedText>
        </View>
      </View>

      {/* Ask Nexus CTA */}
      <Pressable
        style={[styles.nexusCta, { backgroundColor: accent + '18' }]}
        onPress={() => openAskNexus({ screen: '/nexus', mode: 'education', prefill: 'Tell me about FMU' })}
      >
        <IconSymbol name="sparkles" size={16} color={accent} />
        <ThemedText style={[styles.nexusCtaText, { color: accent }]}>
          Ask Nexus about FMU
        </ThemedText>
      </Pressable>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroContainer: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  heroGradient: {
    aspectRatio: 16 / 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800' },
  heroOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 14,
  },
  heroTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  heroInstructor: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, textDecorationLine: 'underline' },

  // Next Event
  nextEventCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  nextEventTitle: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  nextEventMeta: { fontSize: 12, marginBottom: 8 },
  nextEventBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  nextEventBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // Commerce Row
  commerceRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  commerceCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
  },
  commerceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  commerceLabel: { fontSize: 12, fontWeight: '600', textAlign: 'center' },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    alignItems: 'center',
  },
  quickStatItem: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 20, fontWeight: '700' },
  quickStatLabel: { fontSize: 10, marginTop: 2 },
  quickStatDivider: { width: 1, height: 32 },

  // Nexus CTA
  nexusCta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 12,
  },
  nexusCtaText: { fontSize: 15, fontWeight: '600' },
});
