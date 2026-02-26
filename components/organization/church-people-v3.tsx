/**
 * Church People V3 — Campus Directory + Structure (Single-Scroll)
 * 5 sections: Leadership, Ministry Leaders, Staff, Volunteers, Member Directory
 *
 * Campus-scoped, RBAC-aware, read-only. No phone/email for A1/A2.
 * No salary, contract, compliance, giving, or governance data.
 * Messaging via Messages tab (DM route).
 */
import React from 'react';
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
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  const cleaned = name.replace(/^(Pastor|Elder|Dr\.?|Minister|Min\.|Deacon|Brother|Bro\.|Sister|Sis\.)\s+/i, '');
  const parts = cleaned.split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

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

// =============================================================================
// MOCK DATA — ICCLA (ICC Los Angeles)
// =============================================================================

interface PersonCard {
  id: string;
  name: string;
  role: string;
  description?: string;
  ministry?: string;
  campus: string;
}

// --- Section 1: Leadership ---
const LEADERSHIP: PersonCard[] = [
  { id: 'ldr-1', name: 'Pastor Philip Anthony Mitchell', role: 'Campus Pastor', description: 'Senior pastor and campus lead for ICCLA. Oversees all ministries and operations.', campus: 'ICCLA' },
  { id: 'ldr-2', name: 'Tatjuana Phillips', role: 'Associate Pastor', description: 'Oversees Connect Groups and campus-wide discipleship.', campus: 'ICCLA' },
  { id: 'ldr-3', name: 'Sister Angela Davis', role: "Children's Director", description: "Leads 2819 Kids and all children's ministry programming.", campus: 'ICCLA' },
  { id: 'ldr-4', name: 'Minister Lisa Brooks', role: 'Worship Director', description: 'Leads worship team, choir, and all music ministries.', campus: 'ICCLA' },
];

// --- Section 2: Ministry Leaders ---
interface MinistryLeaderGroup {
  ministry: string;
  leaders: { id: string; name: string; role: string }[];
}

const MINISTRY_LEADERS: MinistryLeaderGroup[] = [
  {
    ministry: "Children's Ministry (2819 Kids)",
    leaders: [
      { id: 'ml-1', name: 'Sister Angela Davis', role: 'Director' },
      { id: 'ml-2', name: 'Chioma Eze', role: 'Assistant Director' },
    ],
  },
  {
    ministry: 'Singles Ministry (Single & Purposeful)',
    leaders: [
      { id: 'ml-3', name: 'Deacon Robert Davis', role: 'Ministry Leader' },
    ],
  },
  {
    ministry: 'Youth Ministry (Ignite Youth)',
    leaders: [
      { id: 'ml-4', name: 'Pastor Ryan Mitchell', role: 'Youth Pastor' },
    ],
  },
  {
    ministry: 'Young Adults (Catalyst)',
    leaders: [
      { id: 'ml-5', name: 'Brother Michael Scott', role: 'Ministry Leader' },
    ],
  },
  {
    ministry: 'Discipleship (Rooted)',
    leaders: [
      { id: 'ml-6', name: 'Elder Mary Thompson', role: 'Elder / Lead Facilitator' },
    ],
  },
  {
    ministry: 'Worship Team',
    leaders: [
      { id: 'ml-7', name: 'Minister Lisa Brooks', role: 'Worship Leader' },
    ],
  },
  {
    ministry: 'Connect Groups',
    leaders: [
      { id: 'ml-8', name: 'Tatjuana Phillips', role: 'Overseer' },
    ],
  },
  {
    ministry: 'Community Outreach',
    leaders: [
      { id: 'ml-9', name: 'Brother Michael Scott', role: 'Outreach Lead' },
    ],
  },
];

// --- Section 3: Staff ---
const STAFF: PersonCard[] = [
  { id: 'stf-1', name: 'Janet Williams', role: 'Administrative Assistant', campus: 'ICCLA' },
  { id: 'stf-2', name: 'David Mensah', role: 'Operations Manager', campus: 'ICCLA' },
  { id: 'stf-3', name: 'Rachel Boateng', role: 'Communications Coordinator', campus: 'ICCLA' },
  { id: 'stf-4', name: 'Henry Okafor', role: 'Facilities Manager', campus: 'ICCLA' },
];

// --- Section 4: Volunteers (RBAC-gated) ---
interface VolunteerGroup {
  ministry: string;
  ministryId: string;
  count: number;
  volunteers: { id: string; name: string; role: string }[];
}

const VOLUNTEER_GROUPS: VolunteerGroup[] = [
  {
    ministry: "Children's Volunteers",
    ministryId: 'children',
    count: 12,
    volunteers: [
      { id: 'vol-1', name: 'Funmi Adeyemi', role: 'Sunday Teacher' },
      { id: 'vol-2', name: 'Grace Amponsah', role: 'Nursery Helper' },
      { id: 'vol-3', name: 'Kezia Boateng', role: 'Sunday Teacher' },
      { id: 'vol-4', name: 'Esther Nwankwo', role: 'Check-In Lead' },
      { id: 'vol-5', name: 'Lola Adebisi', role: 'Arts & Crafts' },
    ],
  },
  {
    ministry: 'Worship Volunteers',
    ministryId: 'worship',
    count: 20,
    volunteers: [
      { id: 'vol-6', name: 'Ifeoma Chukwu', role: 'Vocalist' },
      { id: 'vol-7', name: 'Joseph Davis', role: 'Sound Tech' },
      { id: 'vol-8', name: 'Adebayo Oluwaseun', role: 'Keyboardist' },
    ],
  },
  {
    ministry: 'Singles Volunteers',
    ministryId: 'singles',
    count: 8,
    volunteers: [
      { id: 'vol-9', name: 'Francis Adjei', role: 'Events Coordinator' },
      { id: 'vol-10', name: 'Nnamdi Ugochukwu', role: 'Group Facilitator' },
    ],
  },
  {
    ministry: 'Operations Volunteers',
    ministryId: 'operations',
    count: 10,
    volunteers: [
      { id: 'vol-11', name: 'Daniel Kwame', role: 'Parking Lot' },
      { id: 'vol-12', name: 'Brian Asante', role: 'Greeter' },
    ],
  },
];

// Mock: user is A2 (Teacher) in Children's, A1 (Member) in Singles
const USER_MINISTRY_ACCESS = new Set(['children']);

// --- Section 5: Member Directory (RBAC-gated) ---
interface DirectoryMember {
  id: string;
  name: string;
  ministry?: string;
}

const DIRECTORY_MEMBERS: DirectoryMember[] = [
  { id: 'dir-1', name: 'Adebayo Oluwaseun', ministry: 'Catalyst' },
  { id: 'dir-2', name: 'Chioma Eze', ministry: "2819 Kids" },
  { id: 'dir-3', name: 'Daniel Kwame', ministry: 'Connect Groups' },
  { id: 'dir-4', name: 'Esther Nwankwo', ministry: 'Rooted' },
  { id: 'dir-5', name: 'Francis Adjei', ministry: 'Community Outreach' },
  { id: 'dir-6', name: 'Grace Amponsah' },
  { id: 'dir-7', name: 'Henry Okafor', ministry: 'Operations' },
  { id: 'dir-8', name: 'Ifeoma Chukwu', ministry: 'Worship Team' },
  { id: 'dir-9', name: 'Joseph Davis', ministry: 'Sound/Media' },
  { id: 'dir-10', name: 'Kezia Boateng', ministry: 'Single & Purposeful' },
];

// =============================================================================
// SECTION 1 — LEADERSHIP
// =============================================================================

function LeadershipSection({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="LEADERSHIP" colors={colors} />
      {LEADERSHIP.map((leader) => (
        <Card key={leader.id} colors={colors}>
          <View style={s.personRow}>
            <View style={[s.avatar, { backgroundColor: ACCENT + '20' }]}>
              <ThemedText style={[s.avatarText, { color: ACCENT }]}>{getInitials(leader.name)}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.personName, { color: colors.text }]}>{leader.name}</ThemedText>
              <ThemedText style={[s.personRole, { color: ACCENT }]}>{leader.role}</ThemedText>
            </View>
          </View>
          {leader.description && (
            <ThemedText style={[s.personDesc, { color: colors.textSecondary }]}>{leader.description}</ThemedText>
          )}
          <Pressable
            style={({ pressed }) => [s.messageBtn, { backgroundColor: ACCENT + '15' }, pressed && { opacity: 0.7 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="bubble.left.fill" size={13} color={ACCENT} />
            <ThemedText style={[s.messageBtnText, { color: ACCENT }]}>Message</ThemedText>
          </Pressable>
        </Card>
      ))}
    </>
  );
}

// =============================================================================
// SECTION 2 — MINISTRY LEADERS
// =============================================================================

function MinistryLeadersSection({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="MINISTRY LEADERS" colors={colors} />
      <Card colors={colors}>
        {MINISTRY_LEADERS.map((group, gIdx) => (
          <View
            key={group.ministry}
            style={[
              s.ministryGroup,
              gIdx < MINISTRY_LEADERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.ministryGroupName, { color: colors.textSecondary }]}>{group.ministry}</ThemedText>
            {group.leaders.map((leader) => (
              <Pressable
                key={leader.id}
                style={({ pressed }) => [s.leaderRow, pressed && { opacity: 0.7 }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <View style={[s.avatarSmall, { backgroundColor: ACCENT + '15' }]}>
                  <ThemedText style={[s.avatarSmallText, { color: ACCENT }]}>{getInitials(leader.name)}</ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.leaderName, { color: colors.text }]}>{leader.name}</ThemedText>
                  <ThemedText style={[s.leaderRole, { color: colors.textTertiary }]}>{leader.role}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
              </Pressable>
            ))}
          </View>
        ))}
      </Card>
    </>
  );
}

// =============================================================================
// SECTION 3 — STAFF
// =============================================================================

function StaffSection({ colors }: { colors: typeof Colors.light }) {
  return (
    <>
      <SectionLabel label="STAFF" colors={colors} />
      <Card colors={colors}>
        {STAFF.map((person, idx) => (
          <View
            key={person.id}
            style={[
              s.staffRow,
              idx < STAFF.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.avatarSmall, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.avatarSmallText, { color: colors.textSecondary }]}>{getInitials(person.name)}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.staffName, { color: colors.text }]}>{person.name}</ThemedText>
              <ThemedText style={[s.staffRole, { color: colors.textTertiary }]}>{person.role}</ThemedText>
            </View>
            <Pressable
              style={({ pressed }) => [s.messageBtnSmall, { backgroundColor: ACCENT + '15' }, pressed && { opacity: 0.7 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="bubble.left.fill" size={11} color={ACCENT} />
            </Pressable>
          </View>
        ))}
      </Card>
    </>
  );
}

// =============================================================================
// SECTION 4 — VOLUNTEERS (RBAC-gated)
// =============================================================================

function VolunteersSection({ colors, isA2 }: { colors: typeof Colors.light; isA2: boolean }) {
  return (
    <>
      <SectionLabel label="VOLUNTEERS" colors={colors} />
      <Card colors={colors}>
        {VOLUNTEER_GROUPS.map((group, gIdx) => {
          const canSeeList = isA2 && USER_MINISTRY_ACCESS.has(group.ministryId);
          return (
            <View
              key={group.ministryId}
              style={[
                s.volGroup,
                gIdx < VOLUNTEER_GROUPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
            >
              <View style={s.volGroupHeader}>
                <ThemedText style={[s.volGroupName, { color: colors.text }]}>{group.ministry}</ThemedText>
                <View style={[s.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <ThemedText style={[s.countBadgeText, { color: colors.textSecondary }]}>{group.count}</ThemedText>
                </View>
              </View>
              {canSeeList ? (
                group.volunteers.map((vol) => (
                  <Pressable
                    key={vol.id}
                    style={({ pressed }) => [s.volRow, pressed && { opacity: 0.7 }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <View style={[s.volDot, { backgroundColor: ACCENT }]} />
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[s.volName, { color: colors.text }]}>{vol.name}</ThemedText>
                      <ThemedText style={[s.volRole, { color: colors.textTertiary }]}>{vol.role}</ThemedText>
                    </View>
                    <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                  </Pressable>
                ))
              ) : (
                <View style={s.restrictedRow}>
                  <IconSymbol name="lock.fill" size={11} color={colors.textTertiary} />
                  <ThemedText style={[s.restrictedText, { color: colors.textTertiary }]}>
                    {isA2 ? 'Not in your ministry' : 'Counts only'}
                  </ThemedText>
                </View>
              )}
            </View>
          );
        })}
      </Card>
    </>
  );
}

// =============================================================================
// SECTION 5 — MEMBER DIRECTORY (RBAC-gated)
// =============================================================================

function MemberDirectorySection({ colors, canSee }: { colors: typeof Colors.light; canSee: boolean }) {
  if (!canSee) return null;

  return (
    <>
      <SectionLabel label="MEMBER DIRECTORY" colors={colors} />
      <Card colors={colors}>
        <View style={s.directorySummary}>
          <ThemedText style={[s.directorySummaryText, { color: colors.textSecondary }]}>
            {DIRECTORY_MEMBERS.length} members visible in your ministry
          </ThemedText>
        </View>
        {DIRECTORY_MEMBERS.map((member, idx) => (
          <Pressable
            key={member.id}
            style={({ pressed }) => [
              s.directoryRow,
              idx < DIRECTORY_MEMBERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.avatarSmall, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.avatarSmallText, { color: colors.textSecondary }]}>{getInitials(member.name)}</ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.directoryName, { color: colors.text }]}>{member.name}</ThemedText>
              {member.ministry && (
                <ThemedText style={[s.directoryMinistry, { color: colors.textTertiary }]}>{member.ministry}</ThemedText>
              )}
            </View>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function ChurchPeople({ colors, accentColor, role }: Props) {
  const churchRole = (role ?? 'C8') as ChurchRoleLens;
  const isA2OrHigher = isStaffLevel(churchRole);
  const canSeeDirectory = isA2OrHigher || isPastoralLevel(churchRole);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      <LeadershipSection colors={colors} />
      <MinistryLeadersSection colors={colors} />
      <StaffSection colors={colors} />
      <VolunteersSection colors={colors} isA2={isA2OrHigher} />
      <MemberDirectorySection colors={colors} canSee={canSeeDirectory} />
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
    marginBottom: Spacing.sm,
  },

  // -- Avatar --
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
  },
  avatarSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarSmallText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // -- Section 1: Leadership --
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  personName: {
    fontSize: 16,
    fontWeight: '700',
  },
  personRole: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 1,
  },
  personDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  messageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  messageBtnText: {
    fontSize: 13,
    fontWeight: '600',
  },
  messageBtnSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // -- Section 2: Ministry Leaders --
  ministryGroup: {
    paddingVertical: 10,
  },
  ministryGroupName: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 8,
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  leaderName: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaderRole: {
    fontSize: 12,
    marginTop: 1,
  },

  // -- Section 3: Staff --
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '600',
  },
  staffRole: {
    fontSize: 12,
    marginTop: 1,
  },

  // -- Section 4: Volunteers --
  volGroup: {
    paddingVertical: 10,
  },
  volGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  volGroupName: {
    fontSize: 14,
    fontWeight: '600',
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  volRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 4,
  },
  volDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  volName: {
    fontSize: 13,
    fontWeight: '500',
  },
  volRole: {
    fontSize: 11,
    marginTop: 1,
  },
  restrictedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingLeft: 4,
  },
  restrictedText: {
    fontSize: 12,
  },

  // -- Section 5: Member Directory --
  directorySummary: {
    paddingBottom: 8,
    marginBottom: 4,
  },
  directorySummaryText: {
    fontSize: 12,
    fontWeight: '500',
  },
  directoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  directoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  directoryMinistry: {
    fontSize: 11,
    marginTop: 1,
  },
});
