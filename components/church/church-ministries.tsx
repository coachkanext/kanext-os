/**
 * Church Ministries — Directory tab
 *
 * Purpose: "Where do I belong?" — structural directory of ministries.
 * Not schedule. Not people. Not chat.
 *
 * Layout: Single vertical scroll
 *   Block 1 — Header (title, search, All/My filter)
 *   Block 2 — My Ministries (user's ministries at this campus)
 *   Block 3 — All Ministries (campus directory)
 *
 * Tap → Ministry Detail Sheet
 * Campus-scoped. No inline editing. Writes via Nexus only.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Pressable, ScrollView, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { CHURCH_MINISTRIES, type Ministry } from '@/data/mock-church-home';
import { ChurchMinistryDetailSheet } from '@/components/church/church-ministry-detail-sheet';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
  /** Church role: 'member' | 'teacher' | 'admin' etc. */
  role: string;
}

type FilterMode = 'all' | 'my';

// =============================================================================
// USER MINISTRY MEMBERSHIP (demo data)
// =============================================================================

interface UserMinistryMembership {
  ministryId: string;
  role: string;
}

/** ICCLA: user belongs to Formation Kids (Teacher) + Single & Purposeful (Member) */
const USER_MEMBERSHIPS_ICCLA: UserMinistryMembership[] = [
  { ministryId: 'min-002', role: 'Teacher' },
  { ministryId: 'min-singles', role: 'Member' },
];

/** ICCIE: user belongs to Formation Kids (Teacher) only */
const USER_MEMBERSHIPS_ICCIE: UserMinistryMembership[] = [
  { ministryId: 'min-002', role: 'Teacher' },
];

/**
 * Single & Purposeful ministry — not in CHURCH_MINISTRIES (it's a campus-specific ministry).
 * Added here as a supplemental ministry for the user's "My Ministries" view.
 */
const SINGLES_MINISTRY: Ministry = {
  id: 'min-singles',
  name: 'Single & Purposeful',
  icon: 'person.2.fill',
  mission: 'Fellowship, community, and spiritual growth for singles — building faith-centered friendships and purpose.',
  leader: 'Minister Desiree Hamilton',
  volunteers: 16,
  meetingDay: 'Fridays',
  meetingTime: '7:00 PM',
  status: 'active',
  category: 'fellowship',
  color: '#B8943E',
};

/** All ministries including supplemental ones for directory display */
const ALL_CAMPUS_MINISTRIES: Ministry[] = [...CHURCH_MINISTRIES, SINGLES_MINISTRY];

// =============================================================================
// HELPERS
// =============================================================================

function getChurchRoleLevel(role: string): string {
  if (role === 'admin' || role === 'pastor' || role === 'elder') return 'A3+';
  if (role === 'teacher' || role === 'deacon' || role === 'minister') return 'A2';
  return 'A1';
}

// =============================================================================
// MINISTRY CARD
// =============================================================================

function MinistryCard({
  ministry,
  colors,
  accent,
  userRole,
  onPress,
}: {
  ministry: Ministry;
  colors: typeof Colors.light;
  accent: string;
  userRole?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.card,
        { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
        pressed && { opacity: 0.7 },
      ]}
      onPress={onPress}
    >
      <View style={s.cardTop}>
        <View style={[s.cardIcon, { backgroundColor: ministry.color + '20' }]}>
          <IconSymbol
            name={ministry.icon as IconSymbolName}
            size={18}
            color={ministry.color}
          />
        </View>
        <View style={s.cardTitleArea}>
          <ThemedText style={[s.cardName, { color: colors.text }]} numberOfLines={1}>
            {ministry.name}
          </ThemedText>
          {userRole && (
            <View style={[s.cardRoleBadge, { backgroundColor: accent + '18' }]}>
              <ThemedText style={[s.cardRoleText, { color: accent }]}>{userRole}</ThemedText>
            </View>
          )}
        </View>
        <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
      </View>

      <ThemedText style={[s.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
        {ministry.mission}
      </ThemedText>

      <View style={s.cardMeta}>
        {ministry.meetingDay && (
          <View style={s.cardMetaItem}>
            <IconSymbol name="calendar" size={10} color={colors.textTertiary} />
            <ThemedText style={[s.cardMetaText, { color: colors.textSecondary }]}>
              {ministry.meetingDay}{ministry.meetingTime ? ` · ${ministry.meetingTime}` : ''}
            </ThemedText>
          </View>
        )}
        {ministry.leader && (
          <View style={s.cardMetaItem}>
            <IconSymbol name="person.fill" size={10} color={colors.textTertiary} />
            <ThemedText style={[s.cardMetaText, { color: colors.textSecondary }]} numberOfLines={1}>
              {ministry.leader}
            </ThemedText>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchMinistries({ colors, accent, role }: Props) {
  const [filter, setFilter] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [selectedUserRole, setSelectedUserRole] = useState<string | null>(null);
  const [selectedIsMember, setSelectedIsMember] = useState(false);

  // Demo: active campus is ICCLA
  const campus: 'ICCLA' | 'ICCIE' = 'ICCLA';
  const userMemberships = campus === 'ICCLA' ? USER_MEMBERSHIPS_ICCLA : USER_MEMBERSHIPS_ICCIE;
  const membershipMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of userMemberships) map.set(m.ministryId, m.role);
    return map;
  }, [userMemberships]);

  const churchRoleLevel = getChurchRoleLevel(role);

  // My ministries
  const myMinistries = useMemo(() => {
    return userMemberships
      .map((um) => ALL_CAMPUS_MINISTRIES.find((m) => m.id === um.ministryId))
      .filter(Boolean) as Ministry[];
  }, [userMemberships]);

  // Filtered + searched ministries
  const displayMinistries = useMemo(() => {
    const base = filter === 'my' ? myMinistries : ALL_CAMPUS_MINISTRIES;
    if (!search.trim()) return base;
    const q = search.toLowerCase();
    return base.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.leader.toLowerCase().includes(q) ||
        m.mission.toLowerCase().includes(q),
    );
  }, [filter, search, myMinistries]);

  const handleFilterPress = useCallback((mode: FilterMode) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setFilter(mode);
  }, []);

  const handleMinistryPress = useCallback(
    (ministry: Ministry) => {
      Haptics.impactAsync(ImpactFeedbackStyle.Light);
      setSelectedMinistry(ministry);
      setSelectedUserRole(membershipMap.get(ministry.id) || null);
      setSelectedIsMember(membershipMap.has(ministry.id));
      setDetailVisible(true);
    },
    [membershipMap],
  );

  return (
    <ThemedView style={s.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Block 1 — Header ── */}
        <View style={s.header}>
          <ThemedText style={[s.title, { color: colors.text }]}>Ministries</ThemedText>

          {/* Search */}
          <View style={[s.searchBar, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
            <IconSymbol name="magnifyingglass" size={14} color={colors.textTertiary} />
            <TextInput
              style={[s.searchInput, { color: colors.text }]}
              placeholder="Search ministries"
              placeholderTextColor={colors.textTertiary}
              value={search}
              onChangeText={setSearch}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')}>
                <IconSymbol name="xmark.circle.fill" size={14} color={colors.textTertiary} />
              </Pressable>
            )}
          </View>

          {/* Filter chips */}
          <View style={s.filterRow}>
            {(['all', 'my'] as FilterMode[]).map((mode) => {
              const isActive = filter === mode;
              return (
                <Pressable
                  key={mode}
                  style={[s.filterChip, isActive && { backgroundColor: accent }]}
                  onPress={() => handleFilterPress(mode)}
                >
                  <ThemedText
                    style={[s.filterText, { color: isActive ? '#000' : colors.textSecondary }]}
                  >
                    {mode === 'all' ? 'All' : 'My Ministries'}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Block 2 — My Ministries (only when filter is 'all') ── */}
        {filter === 'all' && !search.trim() && myMinistries.length > 0 && (
          <View style={s.section}>
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
              My Ministries
            </ThemedText>
            {myMinistries.map((ministry) => (
              <MinistryCard
                key={ministry.id}
                ministry={ministry}
                colors={colors}
                accent={accent}
                userRole={membershipMap.get(ministry.id)}
                onPress={() => handleMinistryPress(ministry)}
              />
            ))}
          </View>
        )}

        {/* ── Block 3 — All Ministries / Filtered Results ── */}
        <View style={s.section}>
          {filter === 'all' && !search.trim() && (
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
              All Ministries
            </ThemedText>
          )}
          {filter === 'my' && (
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
              My Ministries
            </ThemedText>
          )}
          {search.trim() && (
            <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
              Results ({displayMinistries.length})
            </ThemedText>
          )}

          {displayMinistries.length === 0 ? (
            <View style={s.empty}>
              <IconSymbol name="magnifyingglass" size={24} color="#9C9790" />
              <ThemedText style={[s.emptyTitle, { color: colors.text }]}>No Ministries Found</ThemedText>
              <ThemedText style={[s.emptyDesc, { color: colors.textSecondary }]}>
                {filter === 'my'
                  ? 'You are not part of any ministries at this campus.'
                  : 'No ministries match your search.'}
              </ThemedText>
            </View>
          ) : (
            displayMinistries.map((ministry) => (
              <MinistryCard
                key={`${filter}-${ministry.id}`}
                ministry={ministry}
                colors={colors}
                accent={accent}
                userRole={filter === 'my' || search.trim() ? membershipMap.get(ministry.id) : undefined}
                onPress={() => handleMinistryPress(ministry)}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Ministry Detail Sheet ── */}
      <ChurchMinistryDetailSheet
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        ministry={selectedMinistry}
        colors={colors}
        accent={accent}
        userRole={selectedUserRole}
        isMember={selectedIsMember}
        churchRole={churchRoleLevel}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 80 },

  // Header
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 12,
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#2F3336',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Section
  section: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 10,
  },

  // Ministry Card
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  cardIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitleArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    flexShrink: 1,
  },
  cardRoleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardRoleText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  cardDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 8,
  },
  cardMeta: {
    gap: 4,
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardMetaText: {
    fontSize: 11,
    flex: 1,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptyDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
});
