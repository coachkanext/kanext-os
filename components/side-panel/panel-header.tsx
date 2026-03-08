/**
 * Panel Header — Universal top section for all side panels.
 * Mode selector circles + org switcher.
 * Identical to the Home settings panel's top section.
 * One reusable component used everywhere.
 */

import React, { useCallback, useMemo } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useAppContext } from '@/context/app-context';
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
  const { state, switchMode, switchContext } = useAppContext();
  const currentMode = state.mode;
  const activeOrgId = state.activeContext.org_id;

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

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
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
    backgroundColor: '#0B0F14',
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.4,
  },
  modeCircleActive: {
    opacity: 1,
    borderColor: '#FFFFFF',
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
    color: '#FFFFFF',
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
    color: '#A1A1AA',
    marginBottom: 2,
  },
  orgNameActive: {
    color: '#FFFFFF',
  },
  orgRole: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
  },
});
