/**
 * Sports People V3 — A2 (Assistant Coach) Single-Scroll Directory
 * 4 sections: Leadership | Coaching Staff | Support Staff | Players
 *
 * Interactive: Staff rows → Coach Sheet, Player rows → Player Sheet.
 * No salary, contract, NIL, compliance data visible.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { openCoachCard, openPlayerCard } from '@/utils/global-entity-sheets';
import { getKRColor } from '@/utils/kr-display';
import { AVAILABILITY, AVAILABILITY_STATUS_COLORS } from '@/data/mock-program-page';
import type { RotationPlayer } from '@/data/mock-program-page';

// =============================================================================
// TYPES
// =============================================================================

interface LeaderEntry {
  id: string;
  name: string;
  title: string;
  roleTag: string;
}

interface CoachEntry {
  id: string;
  name: string;
  primaryRole: string;
  secondaryTags: string[];
}

interface SupportEntry {
  id: string;
  name: string;
  role: string;
}

type SupportCategory =
  | 'Strength & Conditioning'
  | 'Athletic Training'
  | 'Video / Analytics'
  | 'Player Development'
  | 'Academics'
  | 'Operations';

interface PlayerEntry {
  id: string;
  number: string;
  name: string;
  position: string;
  classYear: string;
  kr: number;
  status: RotationPlayer['status'];
}

// =============================================================================
// MOCK DATA
// =============================================================================

const LEADERSHIP: LeaderEntry[] = [
  { id: 'l1', name: 'Dan Pearson', title: 'Head Coach', roleTag: 'Tactical Authority' },
  { id: 'l2', name: 'James Whitfield', title: 'GM / Program Director', roleTag: 'Program Operations' },
];

const COACHING_STAFF: CoachEntry[] = [
  { id: 'c1', name: 'Andre Mitchell', primaryRole: 'Assistant Coach', secondaryTags: ['Player Dev', 'Film'] },
  { id: 'c2', name: 'Darius Hill', primaryRole: 'Recruiting Coordinator', secondaryTags: ['Recruiting', 'Scouting'] },
  { id: 'c3', name: 'Terrence Williams', primaryRole: 'Operations Coordinator', secondaryTags: ['Travel', 'Logistics'] },
  { id: 'c4', name: 'Marcus Lane', primaryRole: 'Defensive Coordinator', secondaryTags: ['Film', 'Scouting'] },
];

const SUPPORT_STAFF: Record<SupportCategory, SupportEntry[]> = {
  'Strength & Conditioning': [
    { id: 'ss1', name: 'Devon Clark', role: 'Head S&C Coach' },
    { id: 'ss2', name: 'Ray Thompson', role: 'Assistant S&C' },
  ],
  'Athletic Training': [
    { id: 'ss3', name: 'Lisa Perkins', role: 'Head Athletic Trainer' },
    { id: 'ss4', name: 'Keisha Brown', role: 'Assistant Athletic Trainer' },
  ],
  'Video / Analytics': [
    { id: 'ss5', name: 'Jamal Foster', role: 'Video Coordinator' },
    { id: 'ss6', name: 'Brian Chen', role: 'Analytics Assistant' },
  ],
  'Player Development': [
    { id: 'ss7', name: 'Carlos Rivera', role: 'Player Development Coach' },
  ],
  'Academics': [
    { id: 'ss8', name: 'Tamara Hughes', role: 'Academic Advisor' },
  ],
  'Operations': [
    { id: 'ss9', name: 'Patricia Simmons', role: 'Team Operations Manager' },
    { id: 'ss10', name: 'Kevin Wright', role: 'Equipment Manager' },
  ],
};

const SUPPORT_CATEGORIES = Object.keys(SUPPORT_STAFF) as SupportCategory[];

const PLAYERS: PlayerEntry[] = [
  { id: 'p1', number: '3', name: 'Marcus Johnson', position: 'PG', classYear: 'Jr.', kr: 78, status: 'available' },
  { id: 'p2', number: '5', name: 'Chris Davis', position: 'SG', classYear: 'So.', kr: 71, status: 'injured' },
  { id: 'p3', number: '11', name: 'DeShawn Carter', position: 'SG', classYear: 'Sr.', kr: 75, status: 'available' },
  { id: 'p4', number: '15', name: 'Jordan Taylor', position: 'PF', classYear: 'Jr.', kr: 69, status: 'injured' },
  { id: 'p5', number: '22', name: 'Malik Robinson', position: 'SF', classYear: 'So.', kr: 73, status: 'available' },
  { id: 'p6', number: '24', name: 'Jamal Williams', position: 'SF', classYear: 'Sr.', kr: 74, status: 'available' },
  { id: 'p7', number: '32', name: 'Tyler Brooks', position: 'PF', classYear: 'Jr.', kr: 72, status: 'available' },
  { id: 'p8', number: '33', name: 'Isaiah Owens', position: 'PF', classYear: 'Fr.', kr: 62, status: 'redshirt' },
  { id: 'p9', number: '40', name: 'DeMarcus Hall', position: 'C', classYear: 'So.', kr: 66, status: 'available' },
  { id: 'p10', number: '44', name: 'Robert Jenkins Jr.', position: 'SF', classYear: 'Fr.', kr: 64, status: 'available' },
  { id: 'p11', number: '50', name: 'Andre Mitchell Jr.', position: 'C', classYear: 'Sr.', kr: 76, status: 'available' },
  { id: 'p12', number: '1', name: 'Jaylen Moore', position: 'PG', classYear: 'Fr.', kr: 60, status: 'available' },
  { id: 'p13', number: '10', name: 'Terrell Davis', position: 'SG', classYear: 'Jr.', kr: 70, status: 'available' },
  { id: 'p14', number: '21', name: 'Brandon Carter', position: 'SF', classYear: 'So.', kr: 67, status: 'available' },
  { id: 'p15', number: '35', name: 'Kyle Henderson', position: 'PF', classYear: 'Jr.', kr: 68, status: 'out' },
  { id: 'p16', number: '45', name: 'DeAndre White', position: 'C', classYear: 'So.', kr: 65, status: 'available' },
];

const SUPPORT_CATEGORY_ICONS: Record<SupportCategory, string> = {
  'Strength & Conditioning': 'dumbbell.fill',
  'Athletic Training': 'cross.case.fill',
  'Video / Analytics': 'video.fill',
  'Player Development': 'figure.run',
  'Academics': 'book.fill',
  'Operations': 'gearshape.fill',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function SectionHeader({ label, colors, count }: { label: string; colors: typeof Colors.light; count?: number }) {
  return (
    <View style={s.sectionHeaderRow}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      {count !== undefined && (
        <ThemedText style={[s.sectionCount, { color: colors.textTertiary }]}>{count}</ThemedText>
      )}
    </View>
  );
}

function Avatar({ name, accentColor, size = 38 }: { name: string; accentColor: string; size?: number }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <View style={[s.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: accentColor + '25' }]}>
      <ThemedText style={[s.avatarText, { color: accentColor, fontSize: size * 0.36 }]}>{initials}</ThemedText>
    </View>
  );
}

function RoleTag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.roleTag, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.roleTagText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// SECTION 1 — LEADERSHIP
// =============================================================================

function LeadershipSection({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const handleTap = (leader: LeaderEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openCoachCard({
      name: leader.name,
      title: leader.title,
      tendencies: leader.roleTag,
    });
  };

  return (
    <>
      <SectionHeader label="LEADERSHIP" colors={colors} count={LEADERSHIP.length} />
      {LEADERSHIP.map((leader) => (
        <Pressable
          key={leader.id}
          style={({ pressed }) => [s.card, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          onPress={() => handleTap(leader)}
        >
          <View style={s.personRow}>
            <Avatar name={leader.name} accentColor={accentColor} size={42} />
            <View style={s.personInfo}>
              <ThemedText style={[s.personName, { color: colors.text }]}>{leader.name}</ThemedText>
              <ThemedText style={[s.personTitle, { color: colors.textSecondary }]}>{leader.title}</ThemedText>
            </View>
            <RoleTag label={leader.roleTag} color={accentColor} />
          </View>
          <View style={s.cardChevron}>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </View>
        </Pressable>
      ))}
    </>
  );
}

// =============================================================================
// SECTION 2 — COACHING STAFF
// =============================================================================

function CoachingStaffSection({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const handleTap = (coach: CoachEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openCoachCard({
      name: coach.name,
      title: coach.primaryRole,
      tendencies: coach.secondaryTags.join(', '),
    });
  };

  return (
    <>
      <SectionHeader label="COACHING STAFF" colors={colors} count={COACHING_STAFF.length} />
      {COACHING_STAFF.map((coach) => (
        <Pressable
          key={coach.id}
          style={({ pressed }) => [s.card, { backgroundColor: colors.card, borderColor: colors.border }, pressed && { opacity: 0.7 }]}
          onPress={() => handleTap(coach)}
        >
          <View style={s.personRow}>
            <Avatar name={coach.name} accentColor={accentColor} />
            <View style={s.personInfo}>
              <ThemedText style={[s.personName, { color: colors.text }]}>{coach.name}</ThemedText>
              <ThemedText style={[s.personTitle, { color: colors.textSecondary }]}>{coach.primaryRole}</ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </View>
          <View style={s.tagsRow}>
            {coach.secondaryTags.map((tag) => (
              <RoleTag key={tag} label={tag} color={colors.textSecondary} />
            ))}
          </View>
        </Pressable>
      ))}
    </>
  );
}

// =============================================================================
// SECTION 3 — SUPPORT STAFF
// =============================================================================

function SupportStaffSection({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (cat: SupportCategory) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpanded((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleStaffTap = (entry: SupportEntry, category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openCoachCard({
      name: entry.name,
      title: entry.role,
      tendencies: category,
    });
  };

  const totalStaff = SUPPORT_CATEGORIES.reduce((sum, cat) => sum + SUPPORT_STAFF[cat].length, 0);

  return (
    <>
      <SectionHeader label="SUPPORT STAFF" colors={colors} count={totalStaff} />
      {SUPPORT_CATEGORIES.map((cat) => {
        const isExpanded = !!expanded[cat];
        const members = SUPPORT_STAFF[cat];
        return (
          <View key={cat} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Pressable
              style={({ pressed }) => [s.categoryHeader, pressed && { opacity: 0.7 }]}
              onPress={() => toggle(cat)}
            >
              <IconSymbol name={SUPPORT_CATEGORY_ICONS[cat] as any} size={16} color={accentColor} />
              <ThemedText style={[s.categoryTitle, { color: colors.text }]}>{cat}</ThemedText>
              <ThemedText style={[s.categoryCount, { color: colors.textTertiary }]}>{members.length}</ThemedText>
              <IconSymbol
                name={isExpanded ? 'chevron.down' : 'chevron.right'}
                size={12}
                color={colors.textTertiary}
              />
            </Pressable>
            {isExpanded && members.map((entry, idx) => (
              <Pressable
                key={entry.id}
                style={({ pressed }) => [
                  s.supportRow,
                  idx === 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => handleStaffTap(entry, cat)}
              >
                <Avatar name={entry.name} accentColor={accentColor} size={32} />
                <View style={s.supportInfo}>
                  <ThemedText style={[s.supportName, { color: colors.text }]}>{entry.name}</ThemedText>
                  <ThemedText style={[s.supportRole, { color: colors.textSecondary }]}>{entry.role}</ThemedText>
                </View>
                <RoleTag label="Active" color="#22C55E" />
              </Pressable>
            ))}
          </View>
        );
      })}
    </>
  );
}

// =============================================================================
// SECTION 4 — PLAYERS (DIRECTORY)
// =============================================================================

function PlayersSection({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  const handlePlayerTap = (player: PlayerEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openPlayerCard({
      name: player.name,
      number: player.number,
      position: player.position,
      height: '',
      weight: 0,
      classYear: player.classYear,
      kr: player.kr,
      teamColor: accentColor,
      status: player.status,
    });
  };

  return (
    <>
      <SectionHeader label="PLAYERS" colors={colors} count={PLAYERS.length} />
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {/* Status summary */}
        <View style={s.statusSummary}>
          {(['available', 'injured', 'out', 'redshirt'] as const).map((status) => {
            const count = PLAYERS.filter((p) => p.status === status).length;
            return (
              <View key={status} style={s.statusItem}>
                <View style={[s.statusDot, { backgroundColor: AVAILABILITY_STATUS_COLORS[status] }]} />
                <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </ThemedText>
                <ThemedText style={[s.statusCount, { color: colors.text }]}>{count}</ThemedText>
              </View>
            );
          })}
        </View>

        {/* Player rows */}
        {PLAYERS.map((player, idx) => (
          <Pressable
            key={player.id}
            style={({ pressed }) => [
              s.playerRow,
              idx === 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handlePlayerTap(player)}
          >
            <ThemedText style={[s.playerNumber, { color: colors.textTertiary }]}>
              #{player.number}
            </ThemedText>
            <View style={s.playerInfo}>
              <ThemedText style={[s.playerName, { color: colors.text }]} numberOfLines={1}>
                {player.name}
              </ThemedText>
              <ThemedText style={[s.playerMeta, { color: colors.textSecondary }]}>
                {player.position} · {player.classYear}
              </ThemedText>
            </View>
            <ThemedText style={[s.playerKR, { color: getKRColor(player.kr) }]}>
              {player.kr}
            </ThemedText>
            <View style={[s.playerStatusDot, { backgroundColor: AVAILABILITY_STATUS_COLORS[player.status] }]} />
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsPeople({ colors, accentColor, role }: Props) {
  return (
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={s.scroll}
    >
      <LeadershipSection colors={colors} accentColor={accentColor} />
      <CoachingStaffSection colors={colors} accentColor={accentColor} />
      <SupportStaffSection colors={colors} accentColor={accentColor} />
      <PlayersSection colors={colors} accentColor={accentColor} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md, paddingBottom: 120 },

  // ── Section Header ──
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 20,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },

  // ── Card ──
  card: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: 14,
    marginBottom: 10,
  },
  cardChevron: {
    position: 'absolute',
    right: 14,
    top: '50%',
    marginTop: -6,
  },

  // ── Avatar ──
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontWeight: '700',
  },

  // ── Role Tag ──
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roleTagText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
  },

  // ── Person Row (Leadership + Coaching) ──
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
  },
  personTitle: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── Tags Row ──
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
  },

  // ── Support Staff ──
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  supportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 10,
    marginTop: 10,
  },
  supportInfo: {
    flex: 1,
  },
  supportName: {
    fontSize: 13,
    fontWeight: '600',
  },
  supportRole: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Players ──
  statusSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    gap: 8,
  },
  playerNumber: {
    fontSize: 12,
    fontWeight: '600',
    width: 30,
    fontVariant: ['tabular-nums'],
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 13,
    fontWeight: '600',
  },
  playerMeta: {
    fontSize: 11,
    marginTop: 1,
  },
  playerKR: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    width: 28,
    textAlign: 'right',
  },
  playerStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
