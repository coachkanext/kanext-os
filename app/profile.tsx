/**
 * Profile — Full-screen identity + organizations + mode-specific stats.
 * Swipe right → back to Home (standard navigation).
 */

import React, { useMemo } from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppContext, useMode } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import {
  getOrgsForModeV2,
  getMembershipsForOrg,
} from '@/data/mock-memberships';
import type { Mode } from '@/types';

// ─── Demo stats per mode ───────────────────────────────────
const SPORTS_STATS = [
  { label: 'Coaching Record', value: '142–67' },
  { label: 'Championships', value: '3' },
  { label: 'Years Coaching', value: '12' },
  { label: 'Players Developed', value: '84' },
];

const BUSINESS_STATS = [
  { label: 'Company Founded', value: 'KaNeXT (2024)' },
  { label: 'Role', value: 'Founder & CEO' },
  { label: 'Milestones', value: 'Seed Round, Beta Launch' },
];

const CHURCH_STATS = [
  { label: 'Years of Membership', value: '8' },
  { label: 'Roles Served', value: 'Youth Leader, Deacon' },
  { label: 'Ministries', value: 'Music, Outreach' },
];

const EDUCATION_STATS = [
  { label: 'Degrees', value: 'B.S. Computer Science' },
  { label: 'Certifications', value: 'AWS Solutions Architect' },
  { label: 'Years in Education', value: '6' },
];

const MODE_STATS: Record<Mode, { label: string; value: string }[]> = {
  sports: SPORTS_STATS,
  business: BUSINESS_STATS,
  church: CHURCH_STATS,
  education: EDUCATION_STATS,
  competition: SPORTS_STATS,
};

const STATS_SECTION_TITLES: Record<Mode, string> = {
  sports: 'Coaching Stats',
  business: 'Career Highlights',
  church: 'Ministry & Service',
  education: 'Credentials',
  competition: 'Competition Stats',
};

const ORG_STATUS_LABELS: Record<string, string> = {
  sports_kx: 'Active',
  sports_chs: 'Active',
  sports_gsac: 'Active',
  biz_kx: 'Active',
  church_kx: 'Active',
  church_grace: 'Active',
  edu_kx: 'Active',
  comp_kx: 'Active',
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const mode = useMode();
  const { state } = useAppContext();
  const { state: authState } = useAuth();

  const displayName = authState.session?.displayName ?? 'User';
  const email = authState.session?.email ?? '';

  // All orgs for current mode with membership info
  const orgCards = useMemo(() => {
    const orgs = getOrgsForModeV2(mode);
    return orgs.map((org) => {
      const memberships = getMembershipsForOrg(org.org_id);
      const roleLabel = memberships[0]?.role_titles.join(', ') ?? '';
      const isActive = org.org_id === state.activeContext.org_id;
      const status = ORG_STATUS_LABELS[org.org_id] ?? 'Active';
      return { org, roleLabel, isActive, status };
    });
  }, [mode, state.activeContext.org_id]);

  const stats = MODE_STATS[mode] ?? [];
  const statsTitle = STATS_SECTION_TITLES[mode] ?? 'Stats';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 60 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Identity Section ─── */}
        <View style={styles.identitySection}>
          <Image
            source={require('@/assets/images/sammy-kalejaiye.jpg')}
            style={styles.avatar}
          />
          <Text style={styles.fullName}>{displayName}</Text>
          {email ? <Text style={styles.handle}>{email}</Text> : null}
          <Text style={styles.bio}>
            Building the future of organizational software. Coach, creator, and community builder.
          </Text>
        </View>

        {/* ─── Organizations Section ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Your Organizations</Text>
          {orgCards.map(({ org, roleLabel, isActive, status }) => (
            <View key={org.org_id} style={styles.orgCard}>
              <View style={styles.orgCardContent}>
                <View style={styles.orgCardTop}>
                  <Text style={styles.orgCardName} numberOfLines={1}>{org.org_name}</Text>
                  <View style={[styles.statusPill, isActive && styles.statusPillActive]}>
                    <Text style={[styles.statusText, isActive && styles.statusTextActive]}>
                      {status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orgCardRole} numberOfLines={1}>{roleLabel}</Text>
                {org.location ? (
                  <Text style={styles.orgCardLocation}>{org.location}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>

        {/* ─── Stats Section ─── */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>{statsTitle}</Text>
          <View style={styles.statsCard}>
            {stats.map((stat, i) => (
              <View key={i} style={[styles.statRow, i < stats.length - 1 && styles.statRowBorder]}>
                <Text style={styles.statLabel}>{stat.label}</Text>
                <Text style={styles.statValue}>{stat.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },

  // ─── Identity ───
  identitySection: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 32,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 16,
  },
  fullName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  handle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.45)',
    marginBottom: 12,
  },
  bio: {
    fontSize: 15,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },

  // ─── Section ───
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // ─── Org Cards ───
  orgCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  orgCardContent: {
    gap: 3,
  },
  orgCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orgCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  statusPillActive: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  statusTextActive: {
    color: '#22C55E',
  },
  orgCardRole: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
  },
  orgCardLocation: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.3)',
  },

  // ─── Stats ───
  statsCard: {
    backgroundColor: '#0B0F14',
    borderRadius: 12,
    overflow: 'hidden',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
  },
  statRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.55)',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
