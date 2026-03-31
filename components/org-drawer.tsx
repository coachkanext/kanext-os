/**
 * Brand Drawer — bottom sheet for switching brands and modes.
 * Triggered by long-press on Home footer icon.
 *
 * Layout (top to bottom):
 *   Drag handle (cosmetic)
 *   Mode pills row: All · Personal · Business · Education · Sports · Community
 *   Search bar
 *   Brand list
 *
 * Tap brand → dismiss drawer, switch context (mode switches silently if different).
 * Right badge: checkmark (selected) · count (unread activity) · empty radio (none).
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import {
  V2_ORGANIZATIONS,
  getOrgById,
  getProgramsForOrg,
  getCurrentSeasonForOrg,
  getMembershipsForOrgProgram,
} from '@/data/mock-memberships';
import { registerOrgDrawerHandlers } from '@/utils/global-org-drawer';
import { subscribePulseOrgBadges } from '@/utils/global-pulse-badge';
import type { Mode, ActiveContext } from '@/types';

// ── Filter pill config ───────────────────────────────────────────────────────

type FilterKey = 'all' | Mode;

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'personal',  label: 'Personal' },
  { key: 'business',  label: 'Business' },
  { key: 'education', label: 'Education' },
  { key: 'community', label: 'Community' },
  { key: 'sports',    label: 'Sports' },
];

const MODE_COLORS: Record<string, string> = {
  personal:  '#6B7280',
  business:  '#1A1714',
  education: '#1A1714',
  community: '#1A1714',
  sports:    '#1A1714',
};

function modeLabel(mode: string): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Two-letter initials from a brand name */
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Component ────────────────────────────────────────────────────────────────

export function OrgDrawer() {
  const [visible, setVisible] = useState(false);
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [pulseCounts, setPulseCounts] = useState<Record<string, number>>({});

  useEffect(() => subscribePulseOrgBadges(setPulseCounts), []);

  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state, switchContext } = useAppContext();
  const router = useRouter();
  const activeOrgId = state.activeContext.org_id;

  useEffect(() => {
    registerOrgDrawerHandlers(
      () => {
        setFilterKey('all');
        setSearch('');
        setVisible(true);
      },
      () => setVisible(false),
    );
  }, []);

  // ── Filtered orgs ──────────────────────────────────────────────────────────

  const displayOrgs = useMemo(() => {
    // Personal only shows on All or Personal filter
    let orgs = V2_ORGANIZATIONS.filter(o =>
      filterKey === 'all' || filterKey === 'personal'
        ? true
        : o.mode !== 'personal'
    );

    if (filterKey !== 'all') {
      orgs = orgs.filter(o => o.mode === filterKey);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      orgs = orgs.filter(o => o.org_name.toLowerCase().includes(q));
    }

    // Personal pinned first, rest alphabetical
    const personal = orgs.filter(o => o.mode === 'personal');
    const others = orgs
      .filter(o => o.mode !== 'personal')
      .sort((a, b) => a.org_name.localeCompare(b.org_name));

    return [...personal, ...others];
  }, [filterKey, search]);

  // ── Org press ──────────────────────────────────────────────────────────────

  const handleOrgPress = useCallback((orgId: string, orgMode: Mode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const org = getOrgById(orgId);
    if (!org) return;
    const programs = getProgramsForOrg(orgId);
    const program = programs[0];
    if (!program) return;
    const season = getCurrentSeasonForOrg(orgId);
    if (!season) return;
    const memberships = getMembershipsForOrgProgram(orgId, program.program_id);
    const membership = memberships[0];
    if (!membership) return;

    const ctx: ActiveContext = {
      mode: orgMode,
      org_id: orgId,
      program_id: program.program_id,
      season_id: season.season_id,
      membership_id: membership.membership_id,
      derived_role_badge: membership.role_titles.join(' \u00B7 '),
    };

    switchContext(ctx);
    setVisible(false);
  }, [switchContext]);

  const handleClose = useCallback(() => setVisible(false), []);

  const handleSettings = useCallback(() => {
    setVisible(false);
    router.push('/settings');
  }, [router]);

  const handleCreateBrand = useCallback(() => {
    setVisible(false);
    router.push('/settings/create-org');
  }, [router]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <BottomSheet visible={visible} onClose={handleClose} useModal snapPoints={['50%', '90%']} backgroundColor={C.bg}>
      {/* Mode pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.pillsScroll}
        contentContainerStyle={styles.pillsContent}
      >
        {FILTER_PILLS.map(p => {
          const active = p.key === filterKey;
          return (
            <Pressable
              key={p.key}
              style={[styles.pill, active && styles.pillActive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterKey(p.key);
              }}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <View style={styles.searchWrap}>
        <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search brands..."
          placeholderTextColor={C.muted}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Brand list — rendered flat; outer BottomSheetScrollView handles all scrolling */}
      <View style={styles.orgListContent}>
        {displayOrgs.length === 0 && (
          <Text style={styles.emptyText}>No brands found</Text>
        )}

        {displayOrgs.map(org => {
          const isActiveOrg = org.org_id === activeOrgId;
          const orgMode = org.mode as Mode;
          const avatarColor = isActiveOrg ? C.accent : (MODE_COLORS[org.mode] ?? C.secondary);
          return (
            <Pressable
              key={org.org_id}
              style={({ pressed }) => [
                styles.orgRow,
                isActiveOrg && styles.orgRowActive,
                pressed && !isActiveOrg && { backgroundColor: C.surfacePressed },
              ]}
              onPress={() => handleOrgPress(org.org_id, orgMode)}
            >
              <View style={[styles.orgAvatar, { backgroundColor: avatarColor + '22' }]}>
                <Text style={[styles.orgInitials, { color: avatarColor }]}>
                  {org.initials ?? getInitials(org.org_name)}
                </Text>
              </View>
              <View style={styles.orgInfo}>
                <Text style={[styles.orgName, isActiveOrg && styles.orgNameActive]} numberOfLines={1}>
                  {org.org_name}
                </Text>
                <Text style={styles.orgMode}>{modeLabel(org.mode)}</Text>
              </View>
              <BrandBadge active={isActiveOrg} activityCount={pulseCounts[org.org_id] ?? 0} C={C} />
            </Pressable>
          );
        })}
        {/* Create Brand — above Settings */}
        <Pressable
          style={({ pressed }) => [styles.settingsRow, { marginTop: 4 }, pressed && { opacity: 0.6 }]}
          onPress={handleCreateBrand}
        >
          <View style={[styles.settingsIcon, { backgroundColor: C.accent + '18' }]}>
            <IconSymbol name="plus" size={16} color={C.accent} />
          </View>
          <Text style={[styles.settingsLabel, { color: C.label, fontWeight: '500' }]}>Create Brand</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>

        {/* Settings — last item */}
        <Pressable
          style={({ pressed }) => [styles.settingsRow, { borderTopWidth: 0, marginTop: 2 }, pressed && { opacity: 0.6 }]}
          onPress={handleSettings}
        >
          <View style={styles.settingsIcon}>
            <IconSymbol name="gearshape.fill" size={16} color={C.secondary} />
          </View>
          <Text style={styles.settingsLabel}>Settings</Text>
          <IconSymbol name="chevron.right" size={14} color={C.muted} />
        </Pressable>
      </View>

    </BottomSheet>
  );
}

// ── Brand badge (right slot) ──────────────────────────────────────────────────
// Selected → checkmark. Unselected + activity → count number. Otherwise → empty radio.

function BrandBadge({ active, activityCount, C }: { active: boolean; activityCount: number; C: ComponentColors }) {
  if (active) {
    return (
      <View style={[
        { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
        { backgroundColor: C.accent, borderColor: C.accent },
      ]}>
        <IconSymbol name="checkmark" size={10} color={C.bg} />
      </View>
    );
  }
  if (activityCount > 0) {
    return (
      <View style={{
        minWidth: 20, height: 20, borderRadius: 10,
        backgroundColor: C.accent, paddingHorizontal: 5,
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#FFFFFF' }}>
          {activityCount > 99 ? '99+' : activityCount}
        </Text>
      </View>
    );
  }
  return (
    <View style={{
      width: 20, height: 20, borderRadius: 10,
      borderWidth: 2, borderColor: C.separator, flexShrink: 0,
    }} />
  );
}

// ── Styles ───────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  // Mode pills
  pillsScroll: { flexShrink: 0 },
  pillsContent: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 20, paddingBottom: 14,
  },
  pill: {
    paddingVertical: 10, paddingHorizontal: 20,
    borderRadius: 24, borderWidth: 1.5,
    borderColor: C.separator,
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: C.label, borderColor: C.label,
  },
  pillText: {
    fontSize: 14, fontWeight: '500', color: C.secondary,
  },
  pillTextActive: {
    color: C.bg, fontWeight: '600',
  },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: C.surfacePressed,
    borderWidth: 1, borderColor: C.separator,
    borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: C.label, padding: 0,
  },

  // Org list
  orgListContent: { paddingHorizontal: 12, paddingBottom: 28 },

  // Org row
  orgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 12,
    borderRadius: 14, marginBottom: 2,
  },
  orgRowActive: {
    backgroundColor: C.surfacePressed,
  },

  // Avatar — circle with mode color
  orgAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  orgInitials: {
    fontSize: 14, fontWeight: '700',
  },

  // Org info
  orgInfo: { flex: 1, minWidth: 0, gap: 1 },
  orgName: { fontSize: 15, fontWeight: '500', color: C.label },
  orgNameActive: { fontWeight: '700' },
  orgMode: { fontSize: 12, color: C.muted },

  emptyText: {
    textAlign: 'center', fontSize: 14,
    color: C.muted, paddingVertical: 32,
  },

  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14, marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.separator,
  },
  settingsIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: C.surfacePressed,
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1, fontSize: 15, fontWeight: '500', color: C.secondary,
  },
});
