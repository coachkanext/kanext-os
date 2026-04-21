/**
 * Brand Drawer — bottom sheet for switching brands.
 *
 * Layout (top to bottom):
 *   Demo | Live segmented control
 *   Search bar + Mode filter chip
 *   [expanded] Mode pills row
 *   Brand list
 *   Settings (only persistent utility action)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDataMode, setDataMode } from '@/utils/global-demo-mode';
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

// ── Filter config ─────────────────────────────────────────────────────────────

type FilterKey = 'all' | Mode;

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'personal',  label: 'Personal' },
  { key: 'business',  label: 'Business' },
  { key: 'education', label: 'Education' },
  { key: 'community', label: 'Community' },
  { key: 'sports',    label: 'Athletics' },
];

const MODE_COLORS: Record<string, string> = {
  personal:  '#6B7280',
  business:  '#1A1714',
  education: '#1A1714',
  community: '#1A1714',
  sports:    '#1A1714',
};

const MODE_DISPLAY: Record<string, string> = {
  personal:  'Personal',
  business:  'Business',
  education: 'Education',
  community: 'Community',
  sports:    'Athletics',
};

function modeLabel(mode: string): string {
  return MODE_DISPLAY[mode] ?? (mode.charAt(0).toUpperCase() + mode.slice(1));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OrgDrawer() {
  const [visible, setVisible] = useState(false);
  const [filterKey, setFilterKey] = useState<FilterKey>('all');
  const [showModeFilter, setShowModeFilter] = useState(false);
  const [search, setSearch] = useState('');
  const dataMode = useDataMode();
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
        setShowModeFilter(false);
        setSearch('');
        setVisible(true);
      },
      () => setVisible(false),
    );
  }, []);

  // ── Filtered orgs ───────────────────────────────────────────────────────────

  const displayOrgs = useMemo(() => {
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

    const personal = orgs.filter(o => o.mode === 'personal');
    const others = orgs
      .filter(o => o.mode !== 'personal')
      .sort((a, b) => a.org_name.localeCompare(b.org_name));

    return [...personal, ...others];
  }, [filterKey, search]);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <BottomSheet visible={visible} onClose={handleClose} useModal snapPoints={['60%', '90%']} backgroundColor={C.bg}>

      {/* Search + Mode filter chip */}
      <View style={styles.searchRow}>
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
        <Pressable
          style={[styles.modeChip, filterKey !== 'all' && styles.modeChipActive]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowModeFilter(v => !v);
          }}
        >
          <Text style={[styles.modeChipText, filterKey !== 'all' && styles.modeChipTextActive]}>
            {filterKey === 'all' ? 'Mode' : modeLabel(filterKey)}
          </Text>
          <IconSymbol
            name={showModeFilter ? 'chevron.up' : 'chevron.down'}
            size={11}
            color={filterKey !== 'all' ? C.bg : C.secondary}
          />
        </Pressable>
      </View>

      {/* Mode pills — only visible when filter is open */}
      {showModeFilter && (
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
                  setShowModeFilter(false);
                }}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {p.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* Brand list */}
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

        {/* Settings — only persistent utility action */}
        <Pressable
          style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.6 }]}
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

// ── Brand badge ───────────────────────────────────────────────────────────────

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

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  // Segmented control
  segmentedWrap: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    alignItems: 'center',
  },
  segmented: {
    flexDirection: 'row',
    backgroundColor: C.surfacePressed,
    borderRadius: 10,
    padding: 2,
    width: 180,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    backgroundColor: C.bg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
  },
  segmentTextActive: {
    color: C.label,
    fontWeight: '600',
  },

  // Search row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginBottom: 10,
  },
  searchWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.surfacePressed,
    borderWidth: 1,
    borderColor: C.separator,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: C.label, padding: 0,
  },

  // Mode filter chip
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.separator,
    backgroundColor: C.bg,
  },
  modeChipActive: {
    backgroundColor: C.label,
    borderColor: C.label,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
  },
  modeChipTextActive: {
    color: C.bg,
  },

  // Mode pills (collapsed by default)
  pillsScroll: { flexShrink: 0 },
  pillsContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: C.separator,
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: C.label,
    borderColor: C.label,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: C.secondary,
  },
  pillTextActive: {
    color: C.bg,
    fontWeight: '600',
  },

  // Org list
  orgListContent: { paddingHorizontal: 12, paddingBottom: 28 },

  orgRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 13, paddingHorizontal: 12,
    borderRadius: 14, marginBottom: 2,
  },
  orgRowActive: {
    backgroundColor: C.surfacePressed,
  },
  orgAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  orgInitials: {
    fontSize: 14, fontWeight: '700',
  },
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
