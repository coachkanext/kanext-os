/**
 * Church Program V3 — Campus Control Plane (Single-Scroll)
 * 7 blocks: Header, Campus Snapshot, Service Rhythm, Ministry Structure,
 *           Volunteer Snapshot, Operational Health, Quick Links
 *
 * Campus-scoped, RBAC-aware, read-only. No inline editing.
 * All edits go through Nexus (propose → confirm → commit).
 */
import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, MODE_ACCENT } from '@/constants/theme';
import { isStaffLevel, isPastoralLevel, type ChurchRoleLens } from '@/utils/rbac/church-registry';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

const ACCENT = MODE_ACCENT.church;

// =============================================================================
// MOCK DATA — ICCLA (ICC Los Angeles)
// =============================================================================

const CAMPUS = {
  name: 'ICC Los Angeles',
  abbreviation: 'ICCLA',
  city: 'Los Angeles, CA',
  status: 'Active' as const,
  founded: '2003',
  leadPastor: 'Pastor Philip Anthony Mitchell',
  serviceSummary: 'Sun 10 AM · Sun 6 PM · Wed 7 PM',
};

const SNAPSHOT = {
  weeklyServices: 3,
  activeMinistries: 9,
  activeVolunteers: 85,
  upcomingEvent: 'Kingdom Conference — Jun 14',
};

const SERVICES = [
  { label: 'Sunday Morning Service', day: 'Sunday', time: '10:00 AM', type: 'recurring' as const },
  { label: 'Sunday Evening Service', day: 'Sunday', time: '6:00 PM', type: 'recurring' as const },
  { label: 'Midweek Bible Study', day: 'Wednesday', time: '7:00 PM', type: 'recurring' as const },
];

interface MinistryItem {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  leader: string;
  yours: boolean;
  yourRole?: string;
}

const MINISTRIES: MinistryItem[] = [
  { id: 'm1', name: 'Catalyst', category: 'Young Adults', memberCount: 45, leader: 'Bro. Michael Scott', yours: false },
  { id: 'm2', name: '2819 Kids', category: 'Children', memberCount: 30, leader: 'Sis. Angela Davis', yours: true, yourRole: 'Teacher' },
  { id: 'm3', name: 'Ignite Youth', category: 'Teens', memberCount: 25, leader: 'Pastor Ryan Mitchell', yours: false },
  { id: 'm4', name: 'Rooted', category: 'Discipleship', memberCount: 60, leader: 'Elder Mary Thompson', yours: false },
  { id: 'm5', name: 'Connect Groups', category: 'Small Groups', memberCount: 8, leader: 'Tatjuana Phillips', yours: false },
  { id: 'm6', name: 'Worship Team', category: 'Music/Worship', memberCount: 20, leader: 'Min. Lisa Brooks', yours: false },
  { id: 'm7', name: 'Single & Purposeful', category: 'Singles', memberCount: 35, leader: 'Deacon Robert Davis', yours: true, yourRole: 'Member' },
  { id: 'm8', name: 'Community Outreach', category: 'Evangelism', memberCount: 15, leader: 'Bro. Michael Scott', yours: false },
  { id: 'm9', name: 'Morning Prayer Line', category: 'Radio', memberCount: 0, leader: 'Pastor Philip Anthony Mitchell', yours: false },
];

const VOLUNTEER_SNAPSHOT = {
  total: 85,
  childrenTeam: 12,
  worshipTeam: 20,
  openPositions: 4,
};

type HealthStatus = 'Healthy' | 'Review' | 'Restricted' | 'Good' | 'Pending Docs' | 'Risk' | 'Operational' | 'Issue Logged';

const OPS_HEALTH: { label: string; status: HealthStatus; targetTab: number }[] = [
  { label: 'Finance Status', status: 'Healthy', targetTab: 2 },
  { label: 'Compliance Status', status: 'Good', targetTab: 3 },
  { label: 'Facilities Status', status: 'Operational', targetTab: 4 },
];

const QUICK_LINKS: { label: string; icon: string; targetTab: number }[] = [
  { label: 'People', icon: 'person.2.fill', targetTab: 1 },
  { label: 'Finance', icon: 'dollarsign.circle.fill', targetTab: 2 },
  { label: 'Compliance', icon: 'shield.checkmark.fill', targetTab: 3 },
  { label: 'Facilities', icon: 'mappin.and.ellipse', targetTab: 4 },
  { label: 'Ledger', icon: 'doc.text', targetTab: 5 },
];

// =============================================================================
// HELPERS
// =============================================================================

const HEALTH_COLOR: Record<HealthStatus, string> = {
  Healthy: '#5A8A6E',
  Good: '#5A8A6E',
  Operational: '#5A8A6E',
  Review: '#B8943E',
  'Pending Docs': '#B8943E',
  'Issue Logged': '#B8943E',
  Restricted: '#B85C5C',
  Risk: '#B85C5C',
};

function SectionLabel({ label, colors }: { label: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
      {label}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function StatCell({ label, value, colors, accent }: { label: string; value: string | number; colors: typeof Colors.light; accent?: string }) {
  return (
    <View style={s.statCell}>
      <ThemedText style={[s.statValue, { color: accent ?? colors.text }]}>{value}</ThemedText>
      <ThemedText style={[s.statLabel, { color: colors.textTertiary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// BLOCK 0 — HEADER
// =============================================================================

function HeaderBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.headerBlock}>
      <View style={[s.campusIcon, { backgroundColor: ACCENT + '20' }]}>
        <IconSymbol name="building.2.fill" size={28} color={ACCENT} />
      </View>
      <ThemedText style={[s.campusName, { color: colors.text }]}>{CAMPUS.name}</ThemedText>
      <ThemedText style={[s.campusCity, { color: colors.textSecondary }]}>{CAMPUS.city}</ThemedText>
      <ThemedText style={[s.campusServices, { color: colors.textTertiary }]}>{CAMPUS.serviceSummary}</ThemedText>
      <View style={[s.statusPill, { backgroundColor: '#5A8A6E20' }]}>
        <View style={[s.statusDot, { backgroundColor: '#5A8A6E' }]} />
        <ThemedText style={[s.statusPillText, { color: '#5A8A6E' }]}>{CAMPUS.status}</ThemedText>
      </View>
      <View style={s.headerMeta}>
        <ThemedText style={[s.headerMetaText, { color: colors.textTertiary }]}>
          Founded {CAMPUS.founded} · Lead Pastor: {CAMPUS.leadPastor}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — CAMPUS SNAPSHOT (Truth Card)
// =============================================================================

function SnapshotBlock({ colors, canSeeVolunteers }: { colors: typeof Colors.light; canSeeVolunteers: boolean }) {
  return (
    <>
      <SectionLabel label="CAMPUS SNAPSHOT" colors={colors} />
      <Card colors={colors}>
        <View style={s.statRow}>
          <StatCell label="Weekly Services" value={SNAPSHOT.weeklyServices} colors={colors} accent={ACCENT} />
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <StatCell label="Active Ministries" value={SNAPSHOT.activeMinistries} colors={colors} accent={ACCENT} />
          {canSeeVolunteers && (
            <>
              <View style={[s.statDivider, { backgroundColor: colors.border }]} />
              <StatCell label="Active Volunteers" value={SNAPSHOT.activeVolunteers} colors={colors} accent={ACCENT} />
            </>
          )}
        </View>
        <View style={[s.eventBanner, { backgroundColor: ACCENT + '10', borderColor: ACCENT + '30' }]}>
          <IconSymbol name="calendar" size={14} color={ACCENT} />
          <ThemedText style={[s.eventBannerText, { color: colors.text }]}>
            {SNAPSHOT.upcomingEvent}
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 2 — SERVICE RHYTHM
// =============================================================================

function ServiceRhythmBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="SERVICE RHYTHM" colors={colors} />
      <Card colors={colors}>
        {SERVICES.map((svc, idx) => (
          <View
            key={idx}
            style={[
              s.serviceRow,
              idx < SERVICES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.serviceLabel, { color: colors.text }]}>{svc.label}</ThemedText>
              <ThemedText style={[s.serviceTime, { color: colors.textSecondary }]}>{svc.day} · {svc.time}</ThemedText>
            </View>
            <IconSymbol name="calendar" size={14} color={colors.textTertiary} />
          </View>
        ))}
        <View style={s.lockedRow}>
          <View style={[s.lockedChip, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="lock.fill" size={10} color={colors.textTertiary} />
            <ThemedText style={[s.lockedText, { color: colors.textTertiary }]}>LOCKED</ThemedText>
          </View>
          <ThemedText style={[s.helperText, { color: colors.textTertiary }]}>
            Use Nexus to propose service adjustments.
          </ThemedText>
        </View>
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 3 — MINISTRY STRUCTURE
// =============================================================================

function MinistryStructureBlock({ colors }: { colors: typeof Colors.light }) {
  const yourMinistries = MINISTRIES.filter((m) => m.yours);
  return (
    <>
      <SectionLabel label="MINISTRY STRUCTURE" colors={colors} />
      <Card colors={colors}>
        <View style={s.ministrySummary}>
          <ThemedText style={[s.ministrySummaryText, { color: colors.textSecondary }]}>
            {MINISTRIES.length} Total Ministries · {yourMinistries.length} Yours
          </ThemedText>
        </View>
        {MINISTRIES.map((ministry, idx) => (
          <Pressable
            key={ministry.id}
            style={({ pressed }) => [
              s.ministryRow,
              idx < MINISTRIES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.ministryDot, { backgroundColor: ministry.yours ? ACCENT : colors.textTertiary }]} />
            <View style={{ flex: 1 }}>
              <View style={s.ministryNameRow}>
                <ThemedText style={[s.ministryName, { color: colors.text }]}>{ministry.name}</ThemedText>
                {ministry.yours && (
                  <View style={[s.yourBadge, { backgroundColor: ACCENT + '20' }]}>
                    <ThemedText style={[s.yourBadgeText, { color: ACCENT }]}>You: {ministry.yourRole}</ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[s.ministryMeta, { color: colors.textTertiary }]}>
                {ministry.category} · {ministry.leader}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 4 — VOLUNTEER SNAPSHOT
// =============================================================================

function VolunteerSnapshotBlock({ colors, canSeeDetail }: { colors: typeof Colors.light; canSeeDetail: boolean }) {
  return (
    <>
      <SectionLabel label="VOLUNTEER SNAPSHOT" colors={colors} />
      <Card colors={colors}>
        <View style={s.statRow}>
          <StatCell label="Total Volunteers" value={VOLUNTEER_SNAPSHOT.total} colors={colors} accent={ACCENT} />
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <StatCell label="Children's Team" value={VOLUNTEER_SNAPSHOT.childrenTeam} colors={colors} />
          <View style={[s.statDivider, { backgroundColor: colors.border }]} />
          <StatCell label="Worship Team" value={VOLUNTEER_SNAPSHOT.worshipTeam} colors={colors} />
        </View>
        {VOLUNTEER_SNAPSHOT.openPositions > 0 && (
          <View style={[s.openPositions, { backgroundColor: '#B8943E10', borderColor: '#B8943E30' }]}>
            <IconSymbol name="exclamationmark.triangle" size={13} color="#B8943E" />
            <ThemedText style={[s.openPositionsText, { color: colors.text }]}>
              {VOLUNTEER_SNAPSHOT.openPositions} open positions
            </ThemedText>
            {canSeeDetail && (
              <ThemedText style={[s.openPositionsHint, { color: colors.textTertiary }]}>
                in your ministry
              </ThemedText>
            )}
          </View>
        )}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 5 — OPERATIONAL HEALTH
// =============================================================================

function OperationalHealthBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="OPERATIONAL HEALTH" colors={colors} />
      <Card colors={colors}>
        {OPS_HEALTH.map((item, idx) => {
          const color = HEALTH_COLOR[item.status];
          return (
            <Pressable
              key={idx}
              style={({ pressed }) => [
                s.healthRow,
                idx < OPS_HEALTH.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <ThemedText style={[s.healthLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <View style={[s.healthChip, { backgroundColor: color + '20' }]}>
                <View style={[s.healthDot, { backgroundColor: color }]} />
                <ThemedText style={[s.healthChipText, { color }]}>{item.status}</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          );
        })}
      </Card>
    </>
  );
}

// =============================================================================
// BLOCK 6 — QUICK LINKS
// =============================================================================

function QuickLinksBlock({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="QUICK LINKS" colors={colors} />
      <View style={s.quickLinksGrid}>
        {QUICK_LINKS.map((link) => (
          <Pressable
            key={link.label}
            style={({ pressed }) => [
              s.quickLinkCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={link.icon as any} size={20} color={ACCENT} />
            <ThemedText style={[s.quickLinkLabel, { color: colors.text }]}>{link.label}</ThemedText>
          </Pressable>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchProgram({ colors, accentColor, role }: Props) {
  const churchRole = (role ?? 'C8') as ChurchRoleLens;
  const canSeeVolunteers = isStaffLevel(churchRole) || isPastoralLevel(churchRole);
  const canSeeMinistryDetail = isStaffLevel(churchRole);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      <HeaderBlock colors={colors} />
      <SnapshotBlock colors={colors} canSeeVolunteers={canSeeVolunteers} />
      <ServiceRhythmBlock colors={colors} />
      <MinistryStructureBlock colors={colors} />
      <VolunteerSnapshotBlock colors={colors} canSeeDetail={canSeeMinistryDetail} />
      <OperationalHealthBlock colors={colors} />
      <QuickLinksBlock colors={colors} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Label --
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginTop: Spacing.lg,
    marginBottom: 8,
  },

  // -- Card --
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
  },

  // -- Block 0: Header --
  headerBlock: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 4,
  },
  campusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  campusName: {
    fontSize: 22,
    fontWeight: '700',
  },
  campusCity: {
    fontSize: 14,
  },
  campusServices: {
    fontSize: 12,
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerMeta: {
    marginTop: 4,
  },
  headerMetaText: {
    fontSize: 12,
    textAlign: 'center',
  },

  // -- Block 1: Campus Snapshot --
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statCell: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
  },
  eventBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  eventBannerText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // -- Block 2: Service Rhythm --
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  serviceLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  serviceTime: {
    fontSize: 12,
    marginTop: 1,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
  },
  lockedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lockedText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  helperText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Block 3: Ministry Structure --
  ministrySummary: {
    paddingBottom: 10,
    marginBottom: 4,
  },
  ministrySummaryText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ministryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  ministryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ministryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ministryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  yourBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  yourBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  ministryMeta: {
    fontSize: 12,
    marginTop: 1,
  },

  // -- Block 4: Volunteer Snapshot --
  openPositions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  openPositionsText: {
    fontSize: 13,
    fontWeight: '500',
  },
  openPositionsHint: {
    fontSize: 11,
  },

  // -- Block 5: Operational Health --
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 8,
  },
  healthLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  healthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  healthDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  healthChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Block 6: Quick Links --
  quickLinksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickLinkCard: {
    width: '30%',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  quickLinkLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
