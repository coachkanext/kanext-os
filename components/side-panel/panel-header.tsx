/**
 * Panel Header — Universal top section for all side panels.
 * Mode selector circles + org switcher.
 * Identical to the Home settings panel's top section.
 * One reusable component used everywhere.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
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
import type { Mode, ActiveContext } from '@/types';

const MODE_ITEMS: { mode: Mode; label: string; image: any }[] = [
  { mode: 'sports', label: 'Sports', image: require('@/assets/images/mode-sports.png') },
  { mode: 'business', label: 'Business', image: require('@/assets/images/mode-business.png') },
  { mode: 'church', label: 'Faith', image: require('@/assets/images/mode-church.png') },
  { mode: 'education', label: 'Education', image: require('@/assets/images/mode-education.png') },
];

export function PanelHeader() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { state, switchMode, switchContext } = useAppContext();
  const { state: authState } = useAuth();
  const currentMode = state.mode;
  const activeOrgId = state.activeContext.org_id;
  const displayName = authState.session?.displayName ?? 'User';
  const username = '@' + displayName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 16);

  const orgRows = useMemo(() => {
    const orgs = getOrgsForModeV2(currentMode);
    return orgs.map((org) => {
      const memberships = getMembershipsForOrg(org.org_id);
      const roleLabel = memberships[0]?.role_titles.join(' \u00B7 ') ?? '';
      return { org, roleLabel };
    });
  }, [currentMode]);

  const handleModeSwitch = useCallback((mode: Mode) => {
    if (mode === currentMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    switchMode(mode);
  }, [currentMode, switchMode]);

  const handleOrgSwitch = useCallback((orgId: string) => {
    if (orgId === activeOrgId) return;
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
      mode: org.mode,
      org_id: orgId,
      program_id: program.program_id,
      season_id: season.season_id,
      membership_id: membership.membership_id,
      derived_role_badge: membership.role_titles.join(' \u00B7 '),
    };
    switchContext(ctx);
  }, [activeOrgId, switchContext]);

  return (
    <View style={styles.container}>
      {/* Identity row — avatar + name + username */}
      <View style={styles.identityRow}>
        <View style={styles.avatarClip}>
          <Image
            source={require('@/assets/images/sammy-kalejaiye.jpg')}
            style={styles.avatarImage}
          />
        </View>
        <View style={styles.identityText}>
          <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
          <Text style={styles.username} numberOfLines={1}>{username}</Text>
        </View>
      </View>

      <View style={{ height: 20 }} />
      <View style={styles.divider} />
      <View style={{ height: 16 }} />

      {/* Mode switcher — horizontal row of 4 circles */}
      <View style={styles.modeRow}>
        {MODE_ITEMS.map((m) => {
          const isActive = m.mode === currentMode;
          return (
            <Pressable
              key={m.mode}
              style={({ pressed }) => [
                styles.modeCircleWrap,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => handleModeSwitch(m.mode)}
            >
              <View style={[styles.modeCircle, isActive && styles.modeCircleActive]}>
                <Image source={m.image} style={styles.modeImage} />
              </View>
              <Text style={[styles.modeLabel, isActive && styles.modeLabelActive]}>
                {m.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ height: 12 }} />

      {/* Org switcher — vertical list */}
      <View style={styles.orgSection}>
        {orgRows.map(({ org, roleLabel }) => {
          const isActive = org.org_id === activeOrgId;
          return (
            <Pressable
              key={org.org_id}
              style={({ pressed }) => [
                styles.orgRow,
                isActive && styles.orgRowActive,
                pressed && !isActive && { backgroundColor: 'rgba(255,255,255,0.04)' },
              ]}
              onPress={() => handleOrgSwitch(org.org_id)}
            >
              <Text
                style={[styles.orgName, isActive && styles.orgNameActive]}
                numberOfLines={1}
              >
                {org.org_name}
              </Text>
              <Text style={styles.orgRole} numberOfLines={1}>{roleLabel}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {},
  divider: {
    height: 1,
    backgroundColor: C.separator,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 0,
  },
  avatarClip: {
    width: 55,
    height: 55,
    borderRadius: 28,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 55,
    height: 74,
    top: -2,
    resizeMode: 'cover',
  } as any,
  identityText: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
    letterSpacing: -0.3,
  },
  username: {
    fontSize: 14,
    fontWeight: '400',
    color: C.secondary,
    marginTop: 2,
  },
  modeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  modeCircleWrap: {
    alignItems: 'center',
    gap: 6,
  },
  modeCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: C.bg,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.4,
  },
  modeCircleActive: {
    opacity: 1,
    borderColor: C.label,
  },
  modeImage: {
    width: '100%',
    height: '100%',
  },
  modeLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.35)',
  },
  modeLabelActive: {
    color: C.label,
  },
  orgSection: {
    marginBottom: 4,
  },
  orgRow: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  orgRowActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  orgName: {
    fontSize: 15,
    fontWeight: '600',
    color: C.secondary,
    marginBottom: 2,
  },
  orgNameActive: {
    color: C.label,
  },
  orgRole: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
  },
});
