/**
 * Org Drawer — bottom sheet for switching orgs and modes.
 * Triggered by swipe-up on Home footer icon.
 *
 * Layout (top to bottom):
 *   Drag handle (cosmetic)
 *   Mode pills row: All · Sports · Business · Faith · Education · Personal
 *   Search bar
 *   Org list with sub-orgs (indented, visible only when parent is active)
 *
 * Tap org → dismiss drawer, switch context (mode switches silently if different).
 * Sub-orgs visible only when parent org is the active org.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import type { Mode, ActiveContext } from '@/types';

// ── Filter pill config ───────────────────────────────────────────────────────

type FilterKey = 'all' | Mode;

const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'sports',    label: 'Sports' },
  { key: 'business',  label: 'Business' },
  { key: 'community', label: 'Community' },
  { key: 'education', label: 'Education' },
  { key: 'personal',  label: 'Personal' },
];

// ── Org type → display label ─────────────────────────────────────────────────

const ORG_TYPE_LABEL: Record<string, string> = {
  college_athletics:      'Athletics',
  high_school:            'Athletics',
  conference:             'Association',
  platform:               'Office',
  faith:                  'Parish',
  university:             'Campus',
  grassroots_basketball:  'Association',
  personal:               'Personal',
};

// ── Sub-org data (display only — tap routes to parent's context) ─────────────

type SubOrg = { id: string; name: string; initials: string };

const SUB_ORGS: Record<string, SubOrg[]> = {
  sports_kx: [
    { id: 'sports_kx__athletics',  name: 'Athletics',  initials: 'AT' },
    { id: 'sports_kx__recruiting', name: 'Recruiting', initials: 'RC' },
  ],
  edu_kx: [
    { id: 'edu_kx__admissions', name: 'Admissions', initials: 'AD' },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Two-letter initials from an org name */
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
  const [selectedSubOrgId, setSelectedSubOrgId] = useState<string | null>(null);

  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state, switchContext } = useAppContext();
  const router = useRouter();
  const currentMode = state.mode;
  const activeOrgId = state.activeContext.org_id;

  useEffect(() => {
    registerOrgDrawerHandlers(
      () => {
        setFilterKey('all');
        setSearch('');
        setSelectedSubOrgId(null);
        setVisible(true);
      },
      () => setVisible(false),
    );
  }, []);

  // ── Filtered orgs ──────────────────────────────────────────────────────────

  const displayOrgs = useMemo(() => {
    // Personal pill → no orgs
    if (filterKey === 'pulse') return [];

    let orgs = V2_ORGANIZATIONS.filter(o => o.mode !== 'pulse' && o.mode !== 'competition');

    if (filterKey !== 'all') {
      orgs = orgs.filter(o => o.mode === filterKey);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      orgs = orgs.filter(o => o.org_name.toLowerCase().includes(q));
    }

    return orgs;
  }, [filterKey, search]);

  // ── Org press ──────────────────────────────────────────────────────────────

  const handleOrgPress = useCallback((orgId: string, orgMode: Mode, subOrgId?: string) => {
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

    setSelectedSubOrgId(subOrgId ?? null);
    setVisible(false);
  }, [currentMode, switchContext]);

  const handleClose = useCallback(() => setVisible(false), []);

  const handleSettings = useCallback(() => {
    setVisible(false);
    router.push('/settings');
  }, [router]);

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <BottomSheet visible={visible} onClose={handleClose} useModal snapPoints={['50%', '90%']}>
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
        <IconSymbol name="magnifyingglass" size={16} color="rgba(0,0,0,0.30)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search organizations..."
          placeholderTextColor="rgba(0,0,0,0.30)"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Org list — rendered flat; outer BottomSheetScrollView handles all scrolling */}
      <View style={styles.orgListContent}>
        {filterKey === 'pulse' && (
          <Text style={styles.emptyText}>No organizations in Personal mode</Text>
        )}

        {filterKey !== 'pulse' && displayOrgs.length === 0 && (
          <Text style={styles.emptyText}>No organizations found</Text>
        )}

        {displayOrgs.map(org => {
          const isActiveOrg = org.org_id === activeOrgId;
          const orgTypeLabel = ORG_TYPE_LABEL[org.org_type] ?? org.org_type;
          const orgMode = org.mode as Mode;
          const subOrgs = isActiveOrg ? (SUB_ORGS[org.org_id] ?? []) : [];

          return (
            <React.Fragment key={org.org_id}>
              {/* Parent org row */}
              <Pressable
                style={({ pressed }) => [
                  styles.orgRow,
                  isActiveOrg && styles.orgRowActive,
                  pressed && !isActiveOrg && { backgroundColor: 'rgba(0,0,0,0.03)' },
                ]}
                onPress={() => handleOrgPress(org.org_id, orgMode)}
              >
                <View style={[styles.orgAvatar, isActiveOrg && styles.orgAvatarActive]}>
                  <Text style={[styles.orgInitials, isActiveOrg && styles.orgInitialsActive]}>
                    {getInitials(org.org_name)}
                  </Text>
                </View>
                <View style={styles.orgInfo}>
                  <Text style={[styles.orgName, isActiveOrg && styles.orgNameActive]} numberOfLines={1}>
                    {org.org_name}
                  </Text>
                  <Text style={styles.orgMeta} numberOfLines={1}>{orgTypeLabel}</Text>
                </View>
                <RadioCircle active={isActiveOrg && !selectedSubOrgId} />
              </Pressable>

              {/* Sub-org rows — only when parent is active */}
              {subOrgs.map(sub => {
                const isActiveSub = selectedSubOrgId === sub.id;
                return (
                  <Pressable
                    key={sub.id}
                    style={({ pressed }) => [
                      styles.orgRow,
                      styles.subOrgRow,
                      isActiveSub && styles.orgRowActive,
                      pressed && !isActiveSub && { backgroundColor: 'rgba(0,0,0,0.03)' },
                    ]}
                    onPress={() => handleOrgPress(org.org_id, orgMode, sub.id)}
                  >
                    <View style={[styles.subAvatar, isActiveSub && styles.orgAvatarActive]}>
                      <Text style={[styles.subInitials, isActiveSub && styles.orgInitialsActive]}>
                        {sub.initials}
                      </Text>
                    </View>
                    <View style={styles.orgInfo}>
                      <Text style={[styles.orgName, isActiveSub && styles.orgNameActive]} numberOfLines={1}>
                        {sub.name}
                      </Text>
                      <Text style={styles.orgMeta}>Sub-org</Text>
                    </View>
                    <RadioCircle active={isActiveSub} />
                  </Pressable>
                );
              })}
            </React.Fragment>
          );
        })}
      </View>

      {/* Settings footer */}
      <View style={styles.settingsFooter}>
        <Pressable
          style={({ pressed }) => [styles.settingsRow, pressed && { opacity: 0.6 }]}
          onPress={handleSettings}
        >
          <View style={styles.settingsIcon}>
            <IconSymbol name="gearshape" size={16} color="rgba(0,0,0,0.50)" />
          </View>
          <Text style={styles.settingsLabel}>Settings</Text>
          <IconSymbol name="chevron.right" size={14} color="rgba(0,0,0,0.25)" />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// ── Radio circle ─────────────────────────────────────────────────────────────

function RadioCircle({ active }: { active: boolean }) {
  return (
    <View style={[radioStyles.circle, active && radioStyles.circleActive]}>
      {active && (
        <IconSymbol name="checkmark" size={10} color="#FFFFFF" />
      )}
    </View>
  );
}

const radioStyles = StyleSheet.create({
  circle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: 'rgba(0,0,0,0.06)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  circleActive: {
    backgroundColor: '#111111', borderColor: '#111111',
  },
});

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
    borderColor: 'rgba(0,0,0,0.06)',
    flexShrink: 0,
  },
  pillActive: {
    backgroundColor: '#111111', borderColor: '#111111',
  },
  pillText: {
    fontSize: 14, fontWeight: '500', color: 'rgba(0,0,0,0.52)',
  },
  pillTextActive: {
    color: '#FFFFFF', fontWeight: '600',
  },

  // Search
  searchWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    marginHorizontal: 20, marginBottom: 12,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1, borderColor: 'rgba(0,0,0,0.06)',
    borderRadius: 14, paddingVertical: 11, paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1, fontSize: 14, color: '#111111', padding: 0,
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
    backgroundColor: 'rgba(0,0,0,0.04)',
  },

  // Parent avatar
  orgAvatar: {
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  orgAvatarActive: {
    backgroundColor: '#111111',
  },
  orgInitials: {
    fontSize: 14, fontWeight: '700', color: 'rgba(0,0,0,0.52)',
  },
  orgInitialsActive: { color: '#FFFFFF' },

  // Sub-org
  subOrgRow: { marginLeft: 20 },
  subAvatar: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  subInitials: {
    fontSize: 12, fontWeight: '700', color: 'rgba(0,0,0,0.52)',
  },

  // Org info
  orgInfo: { flex: 1, minWidth: 0 },
  orgName: { fontSize: 15, fontWeight: '500', color: '#111111' },
  orgNameActive: { fontWeight: '600' },
  orgMeta: { fontSize: 12, color: 'rgba(0,0,0,0.30)', marginTop: 1 },

  emptyText: {
    textAlign: 'center', fontSize: 14,
    color: 'rgba(0,0,0,0.30)', paddingVertical: 32,
  },

  settingsFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingHorizontal: 24,
    paddingVertical: 4,
    paddingBottom: 8,
  },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 14,
  },
  settingsIcon: {
    width: 32, height: 32, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center', justifyContent: 'center',
  },
  settingsLabel: {
    flex: 1, fontSize: 15, fontWeight: '500', color: 'rgba(0,0,0,0.70)',
  },
});
