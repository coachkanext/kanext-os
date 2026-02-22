/**
 * Education Dashboard V2 — KaNeXT
 *
 * Full dashboard: Video Hero → Next Event → Action Row (3 text-stack cards) →
 * Institutional Metrics (2×3 grid) → Academic Health (school summaries) →
 * 4 RBAC-gated Domain Cards → 3 Bottom Sheets.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import {
  EDU_HERO,
  EDU_EVENTS,
  EDU_EVENT_CATEGORY_COLORS,
  INSTITUTIONAL_METRICS,
  SCHOOL_HEALTH,
  STUDENT_SUCCESS_SUMMARY,
  CAMPUS_LIFE_SUMMARY,
  ADVANCEMENT_SUMMARY,
  ACCREDITATION_SUMMARY,
} from '@/data/mock-education-home';
import { openPersonCard } from '@/utils/global-entity-sheets';
import {
  canSeeEduDashboardSection,
  type EducationRoleLens,
} from '@/utils/education-rbac';

import { EduApplySheet } from '@/components/commerce/edu-apply-sheet';
import { EduCatalogSheet } from '@/components/commerce/edu-catalog-sheet';
import { EduFinancialAidSheet } from '@/components/commerce/edu-financial-aid-sheet';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  role?: EducationRoleLens;
}

const TEAL = '#14B8A6';

const STATUS_DOT: Record<string, string> = {
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function EduDashboardV2({ colors, accent, role = 'E10' }: Props) {
  const nextEvent = EDU_EVENTS.find((e) => e.status === 'upcoming');

  // Bottom sheet state
  const [applyVisible, setApplyVisible] = useState(false);
  const [catalogVisible, setCatalogVisible] = useState(false);
  const [aidVisible, setAidVisible] = useState(false);

  // RBAC helper
  const canSee = useCallback(
    (section: Parameters<typeof canSeeEduDashboardSection>[0]) =>
      canSeeEduDashboardSection(section, role) !== 'hidden',
    [role],
  );

  return (
    <>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ── Video Hero ── */}
        {canSee('video_hero') && (
          <Pressable style={styles.heroContainer}>
            <LinearGradient
              colors={['#0a2e1a', '#0d1a0f', '#000']}
              style={styles.heroGradient}
            >
              <View style={styles.playButton}>
                <IconSymbol name="play.fill" size={28} color="#fff" />
              </View>
              {EDU_HERO.isLive && (
                <View style={styles.liveBadge}>
                  <ThemedText style={styles.liveText}>LIVE</ThemedText>
                </View>
              )}
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
        )}

        {/* ── Next Event Card ── */}
        {canSee('next_event') && nextEvent && (
          <View style={[styles.nextEventCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[styles.nextEventLabel, { color: accent }]}>NEXT EVENT</ThemedText>
            <ThemedText style={[styles.nextEventTitle, { color: colors.text }]}>{nextEvent.title}</ThemedText>
            <ThemedText style={[styles.nextEventMeta, { color: colors.textSecondary }]}>
              {nextEvent.date} · {nextEvent.time}
            </ThemedText>
            <View style={[styles.nextEventBadge, { backgroundColor: EDU_EVENT_CATEGORY_COLORS[nextEvent.category] + '15' }]}>
              <ThemedText style={[styles.nextEventBadgeText, { color: EDU_EVENT_CATEGORY_COLORS[nextEvent.category] }]}>
                {nextEvent.category.replace('_', ' ')}
              </ThemedText>
            </View>
          </View>
        )}

        {/* ── Action Row (3 text-stack cards) ── */}
        {canSee('action_row') && (
          <View style={styles.actionRow}>
            <Pressable style={styles.actionCard} onPress={() => setApplyVisible(true)}>
              <View style={[styles.actionTopBorder, { backgroundColor: TEAL }]} />
              <ThemedText style={styles.actionTitle}>Apply</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Start your application</ThemedText>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => setCatalogVisible(true)}>
              <View style={[styles.actionTopBorder, { backgroundColor: TEAL }]} />
              <ThemedText style={styles.actionTitle}>Catalog</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Browse programs</ThemedText>
            </Pressable>
            <Pressable style={styles.actionCard} onPress={() => setAidVisible(true)}>
              <View style={[styles.actionTopBorder, { backgroundColor: TEAL }]} />
              <ThemedText style={styles.actionTitle}>Financial Aid</ThemedText>
              <ThemedText style={styles.actionSubtitle}>Scholarships & tuition</ThemedText>
            </Pressable>
          </View>
        )}

        {/* ── Institutional Metrics (2×3 grid) ── */}
        {canSee('institutional_metrics') && (
          <View style={styles.metricsCard}>
            <ThemedText style={styles.sectionTitle}>Institutional Health</ThemedText>
            <View style={styles.metricsGrid}>
              <MetricCell label="Enrollment" value={String(INSTITUTIONAL_METRICS.enrollment.value)} trend={INSTITUTIONAL_METRICS.enrollment.trend} status={INSTITUTIONAL_METRICS.enrollment.status} />
              <MetricCell label="Retention" value={INSTITUTIONAL_METRICS.retention.value} trend={INSTITUTIONAL_METRICS.retention.trend} status={INSTITUTIONAL_METRICS.retention.status} />
              <MetricCell label="Grad Rate (4yr)" value={INSTITUTIONAL_METRICS.graduationRate.value4yr} status={INSTITUTIONAL_METRICS.graduationRate.status} />
              <MetricCell label="Student:Faculty" value={INSTITUTIONAL_METRICS.studentFacultyRatio.value} status={INSTITUTIONAL_METRICS.studentFacultyRatio.status} />
              <MetricCell label="Avg GPA" value={INSTITUTIONAL_METRICS.avgGPA.value} status={INSTITUTIONAL_METRICS.avgGPA.status} />
              <MetricCell label="Revenue Target" value={INSTITUTIONAL_METRICS.financialHealth.revenueTarget} status={INSTITUTIONAL_METRICS.financialHealth.status} />
            </View>
          </View>
        )}

        {/* ── Academic Health ── */}
        {canSee('academic_health') && (
          <View style={styles.healthCard}>
            <ThemedText style={styles.sectionTitle}>Academic Health</ThemedText>
            {SCHOOL_HEALTH.map((school) => (
              <View key={school.name} style={styles.schoolRow}>
                <View style={styles.schoolHeader}>
                  <ThemedText style={styles.schoolName}>{school.name}</ThemedText>
                  <ThemedText style={styles.schoolStats}>
                    {school.programCount} programs · {school.enrolledStudents} students · {school.avgGPA.toFixed(2)} GPA · {school.facultyCount} faculty
                  </ThemedText>
                </View>
                {school.alerts.map((alert, i) => (
                  <View key={i} style={styles.alertRow}>
                    <View style={[styles.alertDot, { backgroundColor: '#F59E0B' }]} />
                    <ThemedText style={styles.alertText}>{alert}</ThemedText>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* ── Domain Cards ── */}
        {canSee('student_success') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#3B82F6' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="person.fill.checkmark" size={18} color="#3B82F6" />
                <ThemedText style={styles.domainTitle}>Student Success</ThemedText>
              </View>
              <View style={styles.domainPills}>
                <DomainPill label={`${STUDENT_SUCCESS_SUMMARY.atRiskCount} At-Risk`} color="#EF4444" />
                <DomainPill label={`${STUDENT_SUCCESS_SUMMARY.interventionRate}% Intervention`} color="#22C55E" />
              </View>
            </View>
          </View>
        )}

        {canSee('campus_life') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#8B5CF6' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="building.2.fill" size={18} color="#8B5CF6" />
                <ThemedText style={styles.domainTitle}>Campus Life</ThemedText>
              </View>
              <View style={styles.domainPills}>
                <DomainPill label={`${CAMPUS_LIFE_SUMMARY.activeOrgs} Orgs`} color="#8B5CF6" />
              </View>
              <ThemedText style={styles.domainMeta}>{CAMPUS_LIFE_SUMMARY.nextCampusEvent}</ThemedText>
            </View>
          </View>
        )}

        {canSee('advancement') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#F59E0B' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="gift.fill" size={18} color="#F59E0B" />
                <ThemedText style={styles.domainTitle}>Advancement</ThemedText>
              </View>
              <View style={styles.domainPills}>
                <DomainPill label={`$${(ADVANCEMENT_SUMMARY.annualGivingTotal / 1_000_000).toFixed(1)}M / $${(ADVANCEMENT_SUMMARY.goal / 1_000_000).toFixed(1)}M`} color="#F59E0B" />
                <DomainPill label={`${ADVANCEMENT_SUMMARY.majorGiftProspects} Major Prospects`} color="#F59E0B" />
              </View>
            </View>
          </View>
        )}

        {canSee('accreditation') && (
          <View style={styles.domainCard}>
            <View style={[styles.domainAccent, { backgroundColor: '#10B981' }]} />
            <View style={styles.domainContent}>
              <View style={styles.domainHeader}>
                <IconSymbol name="checkmark.seal.fill" size={18} color="#10B981" />
                <ThemedText style={styles.domainTitle}>Accreditation</ThemedText>
              </View>
              <ThemedText style={styles.domainStatus}>{ACCREDITATION_SUMMARY.status}</ThemedText>
              <ThemedText style={styles.domainMeta}>{ACCREDITATION_SUMMARY.nextMilestone}</ThemedText>
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Bottom Sheets ── */}
      <EduApplySheet visible={applyVisible} onClose={() => setApplyVisible(false)} colors={colors as any} />
      <EduCatalogSheet visible={catalogVisible} onClose={() => setCatalogVisible(false)} colors={colors as any} />
      <EduFinancialAidSheet visible={aidVisible} onClose={() => setAidVisible(false)} colors={colors as any} />
    </>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function MetricCell({ label, value, trend, status }: { label: string; value: string; trend?: string; status: string }) {
  return (
    <View style={styles.metricCell}>
      <View style={styles.metricValueRow}>
        <ThemedText style={styles.metricValue}>{value}</ThemedText>
        {trend && <ThemedText style={styles.metricTrend}>{trend}</ThemedText>}
      </View>
      <View style={styles.metricLabelRow}>
        <View style={[styles.statusDot, { backgroundColor: STATUS_DOT[status] ?? '#6B7280' }]} />
        <ThemedText style={styles.metricLabel}>{label}</ThemedText>
      </View>
    </View>
  );
}

function DomainPill({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.domainPill, { backgroundColor: color + '18' }]}>
      <ThemedText style={[styles.domainPillText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrollContent: { paddingHorizontal: 16, paddingTop: 8 },

  // Hero
  heroContainer: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  heroGradient: { aspectRatio: 16 / 9, justifyContent: 'center', alignItems: 'center' },
  playButton: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  liveBadge: {
    position: 'absolute', top: 12, left: 12,
    backgroundColor: '#EF4444', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20,
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  heroOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16 },
  heroTitle: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  heroSubtitle: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2, letterSpacing: 0.2 },
  heroInstructor: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4, textDecorationLine: 'underline', letterSpacing: 0.2 },

  // Next Event
  nextEventCard: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 16 },
  nextEventLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1.2, marginBottom: 4, textTransform: 'uppercase' },
  nextEventTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  nextEventMeta: { fontSize: 12, marginBottom: 8, letterSpacing: 0.2 },
  nextEventBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  nextEventBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  // Action Row
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  actionCard: {
    flex: 1, backgroundColor: '#181616', borderRadius: 14, padding: 16,
    overflow: 'hidden',
  },
  actionTopBorder: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  actionTitle: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 },
  actionSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 3, letterSpacing: 0.2 },

  // Institutional Metrics
  metricsCard: {
    backgroundColor: '#181616', borderRadius: 14, padding: 16, marginBottom: 16,
  },
  sectionTitle: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  metricCell: { width: '33.33%', paddingVertical: 10, paddingHorizontal: 4 },
  metricValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  metricValue: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  metricTrend: { color: '#22C55E', fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  metricLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  metricLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 10, letterSpacing: 0.3 },

  // Academic Health
  healthCard: {
    backgroundColor: '#181616', borderRadius: 14, padding: 16, marginBottom: 16,
  },
  schoolRow: { marginBottom: 12 },
  schoolHeader: { marginBottom: 4 },
  schoolName: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: -0.3 },
  schoolStats: { color: 'rgba(255,255,255,0.5)', fontSize: 10, marginTop: 2, letterSpacing: 0.2 },
  alertRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 4 },
  alertDot: { width: 6, height: 6, borderRadius: 3, marginTop: 4 },
  alertText: { color: '#F59E0B', fontSize: 11, flex: 1, letterSpacing: 0.1 },

  // Domain Cards
  domainCard: {
    backgroundColor: '#181616', borderRadius: 14, overflow: 'hidden', marginBottom: 12,
  },
  domainAccent: { height: 3 },
  domainContent: { padding: 16 },
  domainHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  domainTitle: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  domainPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  domainPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  domainPillText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  domainStatus: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 2, letterSpacing: 0.1 },
  domainMeta: { color: 'rgba(255,255,255,0.4)', fontSize: 11, letterSpacing: 0.1 },
});
