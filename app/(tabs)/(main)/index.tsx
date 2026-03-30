/**
 * Home — video hero + org name + 9-icon grid + footer.
 * Video bleeds under status bar. Grid swipe left → Nexus.
 */

import React, { useMemo, useCallback, useReducer, useEffect } from 'react';
import { View, Text, Pressable, PanResponder, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/use-colors';
import { VideoHero } from '@/components/home/video-hero';
import { IconGrid } from '@/components/home/icon-grid';
import { useAppContext, useMode } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { getOrgById, getProgramById, getProgramsForOrg, getOrgsForModeV2 } from '@/data/mock-memberships';
import { enableSlideAnimation } from '@/utils/global-footer-swipe';
import { pushNexusFromInner } from '@/utils/global-inner-nav';
import { openOrgDrawer } from '@/utils/global-org-drawer';
import { resetFooter } from '@/utils/global-footer-hide';
import { registerContextSwitchListener } from '@/utils/global-context-switch';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

const FOOTER_H = 49;

export default function HomeScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = useMode();
  const isLoading = state.isLoading;
  const { state: authState } = useAuth();
  const displayName = authState.session?.displayName ?? 'My Brand';

  const orgLabel = useMemo(() => {
    if (mode === 'personal') return displayName;
    const org = getOrgById(state.activeContext.org_id);
    // Guard against stale context mismatch (e.g. legacy restore sets mode without updating org)
    if (!org || org.mode !== mode) {
      if (state.activeView?.mode === mode) return state.activeView.org_name;
      const [fallback] = getOrgsForModeV2(mode);
      return fallback?.org_name ?? '';
    }
    const programs = getProgramsForOrg(org.org_id);
    if (programs.length <= 1) return org.org_name;
    const program = getProgramById(state.activeContext.program_id);
    if (!program) return org.org_name;
    return `${org.org_name} - ${program.program_name}`;
  }, [mode, displayName, state.activeView, state.activeContext.org_id, state.activeContext.program_id]);

  // Force re-render when context switches (guards against React Compiler memoization)
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    registerContextSwitchListener(forceUpdate);
    return () => registerContextSwitchListener(null);
  }, []);

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

      {/* Icon grid fills remaining space — only render once mode is known */}
      <View style={styles.gridWrapper} {...gridPanResponder.panHandlers}>
        {!isLoading && <IconGrid key={mode} />}
        <View style={{ height: FOOTER_H + insets.bottom + 12 }} />
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
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.75,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  orgPillText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#111111',
    textAlign: 'center',
  },
  gridWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
});
