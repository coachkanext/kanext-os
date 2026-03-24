/**
 * Home — video hero + org name + 9-icon grid + footer.
 * Video bleeds under status bar. Grid swipe left → Nexus.
 */

import React, { useMemo, useCallback } from 'react';
import { View, Text, Pressable, PanResponder, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { VideoHero } from '@/components/home/video-hero';
import { IconGrid } from '@/components/home/icon-grid';
import { useAppContext, useMode } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { getOrgById, getProgramById, getProgramsForOrg } from '@/data/mock-memberships';
import { enableSlideAnimation } from '@/utils/global-footer-swipe';
import { pushNexusFromInner } from '@/utils/global-inner-nav';
import { openOrgDrawer } from '@/utils/global-org-drawer';
import { resetFooter } from '@/utils/global-footer-hide';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const C = useColors();
  const { state } = useAppContext();
  const mode = useMode();
  const { state: authState } = useAuth();
  const displayName = authState.session?.displayName ?? 'My Brand';

  const orgLabel = useMemo(() => {
    if (mode === 'pulse') return displayName;
    const org = getOrgById(state.activeContext.org_id);
    if (!org) return '';
    const programs = getProgramsForOrg(org.org_id);
    if (programs.length <= 1) return org.org_name;
    const program = getProgramById(state.activeContext.program_id);
    if (!program) return org.org_name;
    return `${org.org_name} - ${program.program_name}`;
  }, [mode, displayName, state.activeContext.org_id, state.activeContext.program_id]);

  useFocusEffect(useCallback(() => {
    resetFooter();
  }, []));

  const gridPanResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_evt, gs) =>
          gs.dx < -25 && Math.abs(gs.dx) > Math.abs(gs.dy) * 2,
        onPanResponderRelease: (_evt, gs) => {
          if (gs.dx < -60) {
            enableSlideAnimation();
            pushNexusFromInner();
          }
        },
      }),
    [],
  );

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      {/* Video hero — flush to top, bleeds under status bar */}
      <VideoHero />

      {/* Org context pill — tap → org drawer */}
      <View style={styles.orgPillWrap}>
        <Pressable
          style={styles.orgPill}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openOrgDrawer();
          }}
        >
          <Text style={styles.orgPillText} numberOfLines={1}>
            {orgLabel}
          </Text>
        </Pressable>
      </View>

      {/* Icon grid fills remaining space */}
      <View style={styles.gridWrapper} {...gridPanResponder.panHandlers}>
        <IconGrid />
        <View style={{ height: 90 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  orgPillWrap: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 6,
  },
  orgPill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: 'rgba(139,99,67,0.08)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  orgPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8C7B6E',
    textAlign: 'center',
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});
