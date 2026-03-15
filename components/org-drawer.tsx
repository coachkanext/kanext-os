/**
 * Org Drawer — bottom sheet for switching orgs and modes.
 * Triggered by swipe-up on Profile footer icon.
 *
 * Layout (top to bottom):
 *   Drag handle pill (built into @gorhom/bottom-sheet)
 *   4 mode glyphs row: Trophy | Briefcase | Cross | Grad Cap
 *   Search bar
 *   Org list for selected mode filter
 *
 * Tapping an org:
 *   Same mode → switch org, dismiss, stay on screen
 *   Different mode → switch mode + org, dismiss, go Home
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Image, TextInput, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { BottomSheet } from '@/components/ui/bottom-sheet';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import {
  getOrgsForModeV2,
  getMembershipsForOrg,
  getOrgById,
  getProgramsForOrg,
  getCurrentSeasonForOrg,
  getMembershipsForOrgProgram,
} from '@/data/mock-memberships';
import { popInnerToHome } from '@/utils/global-inner-nav';
import { registerOrgDrawerHandlers } from '@/utils/global-org-drawer';
import type { Mode, ActiveContext } from '@/types';

const MODE_GLYPHS: { mode: Mode; image: any }[] = [
  { mode: 'sports', image: require('@/assets/images/mode-sports.png') },
  { mode: 'business', image: require('@/assets/images/mode-business.png') },
  { mode: 'church', image: require('@/assets/images/mode-church.png') },
  { mode: 'education', image: require('@/assets/images/mode-education.png') },
  { mode: 'pulse', image: require('@/assets/images/icon-portfolio.png') },
];

export function OrgDrawer() {
  const [visible, setVisible] = useState(false);
  const [filterMode, setFilterMode] = useState<Mode>('sports');
  const [search, setSearch] = useState('');
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state, switchContext } = useAppContext();
  const currentMode = state.mode;
  const activeOrgId = state.activeContext.org_id;

  useEffect(() => {
    registerOrgDrawerHandlers(
      () => {
        setFilterMode(currentMode);
        setSearch('');
        setVisible(true);
      },
      () => setVisible(false),
    );
  }, [currentMode]);

  const orgRows = useMemo(() => {
    const orgs = getOrgsForModeV2(filterMode);
    return orgs.map((org) => {
      const memberships = getMembershipsForOrg(org.org_id);
      const roleLabel = memberships[0]?.role_titles.join(' \u00B7 ') ?? '';
      return { org, roleLabel };
    });
  }, [filterMode]);

  const filteredOrgs = useMemo(() => {
    if (!search.trim()) return orgRows;
    const q = search.toLowerCase();
    return orgRows.filter(({ org }) => org.org_name.toLowerCase().includes(q));
  }, [orgRows, search]);

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

    if (orgMode !== currentMode) {
      switchContext(ctx);
      popInnerToHome();
    } else {
      switchContext(ctx);
    }
    setVisible(false);
  }, [currentMode, switchContext]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <BottomSheet visible={visible} onClose={handleClose} useModal>
      {/* Mode filter glyphs */}
      <View style={styles.modeRow}>
        {MODE_GLYPHS.map((m) => {
          const isActive = m.mode === filterMode;
          return (
            <Pressable
              key={m.mode}
              style={[styles.modeGlyph, !isActive && styles.modeGlyphInactive]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilterMode(m.mode);
              }}
            >
              <Image source={m.image} style={styles.modeGlyphImage} />
            </Pressable>
          );
        })}
      </View>

      {/* Search bar */}
      <View style={[styles.searchWrap, { backgroundColor: C.surface }]}>
        <IconSymbol name="magnifyingglass" size={16} color={C.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: C.text }]}
          placeholder="Search orgs..."
          placeholderTextColor={C.textSecondary + '80'}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Org list */}
      {filteredOrgs.map(({ org, roleLabel }) => {
        const isActive = org.org_id === activeOrgId && filterMode === currentMode;
        return (
          <Pressable
            key={org.org_id}
            style={({ pressed }) => [
              styles.orgRow,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleOrgPress(org.org_id, org.mode)}
          >
            {/* Org avatar placeholder */}
            <View style={[styles.orgAvatar, { backgroundColor: C.surface }]}>
              <Text style={styles.orgInitial}>
                {org.org_name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.orgInfo}>
              <Text style={[styles.orgName, { color: C.text }]} numberOfLines={1}>
                {org.org_name}
              </Text>
              {roleLabel ? (
                <Text style={[styles.orgRole, { color: C.textSecondary }]} numberOfLines={1}>
                  {roleLabel}
                </Text>
              ) : null}
            </View>
            {isActive && (
              <IconSymbol name="checkmark" size={18} color={C.text} />
            )}
          </Pressable>
        );
      })}

      {filteredOrgs.length === 0 && (
        <Text style={[styles.emptyText, { color: C.textSecondary }]}>
          No organizations found
        </Text>
      )}
    </BottomSheet>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 12,
    marginBottom: 8,
  },
  modeGlyph: {
    padding: 8,
  },
  modeGlyphInactive: {
    opacity: 0.3,
  },
  modeGlyphImage: {
    width: 64,
    height: 64,
    resizeMode: 'contain',
  } as any,
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  orgAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orgInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textSecondary,
  },
  orgInfo: {
    flex: 1,
  },
  orgName: {
    fontSize: 16,
    fontWeight: '600',
  },
  orgRole: {
    fontSize: 13,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 14,
    paddingVertical: 24,
  },
});
