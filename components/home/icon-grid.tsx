/**
 * Home icon grid — 3×3 (9 icons).
 * Messages, Media, Organization in universal footer bar.
 * All icons visible to ALL roles. No RBAC gating on visibility.
 * 3 columns always. Deep navy rounded-square backgrounds with white glyphs.
 * Positions 2, 3, 6 shift per mode; rest universal.
 * Tap → scale 1.05 lift + soft glow, 150ms.
 * Profile tile long-press → org picker popup.
 */

import React, { useRef, useCallback, useState, useMemo } from 'react';
import { View, Text, Image, StyleSheet, useWindowDimensions, Animated, Pressable, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useAppContext } from '@/context/app-context';
import { useMode } from '@/context/app-context';
import { useMultitasking } from '@/context/multitasking-context';
import {
  getOrgsForModeV2,
  getMembershipsForOrg,
  getOrgById,
  getProgramsForOrg,
  getCurrentSeasonForOrg,
  getMembershipsForOrgProgram,
} from '@/data/mock-memberships';
import type { Mode, ActiveContext } from '@/types';
import type { GridIcon } from './home-types';

const C = {
  icon: '#FFFFFF',
  label: '#A1A1AA',
  badgeText: '#FFFFFF',
  tileBg: '#0B1220',
};

/** Mode-dependent labels for icons that change per mode (positions 2, 3, 6) */
const MODE_LABELS: Record<string, Record<Mode, string>> = {
  season:  { sports: 'Season',   business: 'Office',  church: 'Parish',     education: 'Term',      competition: 'Season' },
  roster:  { sports: 'Team',     business: 'Team',    church: 'Ministries', education: 'Community', competition: 'Roster' },
  recruits:{ sports: 'Recruits', business: 'Recruits',church: 'Outreach',   education: 'Admissions',competition: 'Recruits' },
  store:   { sports: 'Store',    business: 'Store',   church: 'Give',       education: 'Store',     competition: 'Store' },
};

/** Mode-dependent images for icons that swap per mode */
const MODE_IMAGES: Record<string, Partial<Record<Mode, any>>> = {
  season: {
    church: require('@/assets/images/icon-parish.png'),
    business: require('@/assets/images/icon-office.png'),
    education: require('@/assets/images/icon-term.png'),
  },
  roster: {
    sports: require('@/assets/images/icon-team-sports.png'),
    business: require('@/assets/images/icon-team-sports.png'),
    church: require('@/assets/images/icon-ministries.png'),
    competition: require('@/assets/images/icon-roster.png'),
    education: require('@/assets/images/icon-community.png'),
  },
  recruits: {
    church: require('@/assets/images/icon-outreach.png'),
    education: require('@/assets/images/icon-admissions.png'),
  },
  store: {
    church: require('@/assets/images/icon-give.png'),
  },
};

const ROWS: GridIcon[][] = [
  [
    { id: 'agenda',   icon: 'calendar.badge.clock', label: 'Agenda',   route: '/section?title=Agenda',   image: require('@/assets/images/icon-agenda.png') },
    { id: 'season',   icon: 'calendar',             label: 'Season',   route: '/section?title=Season',   image: require('@/assets/images/icon-season.png') },
    { id: 'roster',   icon: 'person.3.fill',        label: 'Team',     route: '/section?title=Team',     image: require('@/assets/images/icon-team.png') },
  ],
  [
    { id: 'recruits', icon: 'person.badge.plus',    label: 'Recruits', route: '/section?title=Recruits', image: require('@/assets/images/icon-recruits.png') },
    { id: 'social',   icon: 'newspaper.fill',       label: 'Social',   route: '/section?title=Social',   image: require('@/assets/images/icon-social.png') },
    { id: 'store',    icon: 'bag.fill',             label: 'Store',    route: '/section?title=Store',    image: require('@/assets/images/icon-store.png') },
  ],
  [
    { id: 'gm',       icon: 'gamecontroller.fill',  label: 'GM',       route: '/section?title=GM',       image: require('@/assets/images/icon-gm.png') },
    { id: 'wallet',   icon: 'creditcard.fill',      label: 'Wallet',   route: '/wallet',                 image: require('@/assets/images/icon-wallet.png') },
    { id: 'profile',  icon: 'person.circle',        label: 'Profile',  route: '/profile',                image: require('@/assets/images/icon-profile.png') },
  ],
];

/** Single grid tile with scale-up glow on press */
function GridTile({
  item,
  cellWidth,
  accent,
  onPress,
  onLongPress,
}: {
  item: GridIcon;
  cellWidth: number;
  accent: string;
  onPress: (item: GridIcon) => void;
  onLongPress?: (item: GridIcon) => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 1.05,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const handlePressOut = useCallback(() => {
    Animated.timing(scale, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Pressable
      style={[styles.cell, { width: cellWidth }]}
      onPress={() => onPress(item)}
      onLongPress={onLongPress ? () => onLongPress(item) : undefined}
      delayLongPress={400}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          item.image && styles.iconContainerImage,
          {
            transform: [{ scale }],
            shadowColor: accent,
            shadowOpacity: 0.0,
          },
        ]}
      >
        {item.image ? (
          <Image source={item.image} style={styles.tileImage} />
        ) : (
          <IconSymbol name={item.icon} size={28} color={C.icon} />
        )}
        {item.badgeCount != null && item.badgeCount > 0 && (
          <View style={[styles.badge, { backgroundColor: accent }]}>
            <Text style={styles.badgeText}>{item.badgeCount}</Text>
          </View>
        )}
      </Animated.View>
      <Text style={styles.label} numberOfLines={1}>
        {item.label}
      </Text>
    </Pressable>
  );
}

/** Org picker popup — shown on profile icon long-press */
function OrgPickerPopup({
  visible,
  onClose,
  onSelect,
  activeOrgId,
  mode,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (orgId: string) => void;
  activeOrgId: string;
  mode: Mode;
}) {
  const insets = useSafeAreaInsets();

  const orgRows = useMemo(() => {
    const orgs = getOrgsForModeV2(mode);
    return orgs.map((org) => {
      const memberships = getMembershipsForOrg(org.org_id);
      const roleLabel = memberships[0]?.role_titles.join(' · ') ?? '';
      return { org, roleLabel };
    });
  }, [mode]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={pickerStyles.backdrop} onPress={onClose}>
        <View style={[pickerStyles.card, { marginBottom: insets.bottom + 80 }]}>
          <Text style={pickerStyles.header}>Switch Organization</Text>
          {orgRows.map(({ org, roleLabel }) => {
            const isActive = org.org_id === activeOrgId;
            return (
              <Pressable
                key={org.org_id}
                style={({ pressed }) => [
                  pickerStyles.row,
                  isActive && pickerStyles.rowActive,
                  pressed && !isActive && { backgroundColor: 'rgba(255,255,255,0.04)' },
                ]}
                onPress={() => {
                  onSelect(org.org_id);
                  onClose();
                }}
              >
                <View style={pickerStyles.rowContent}>
                  <Text
                    style={[pickerStyles.orgName, isActive && pickerStyles.orgNameActive]}
                    numberOfLines={1}
                  >
                    {org.org_name}
                  </Text>
                  <Text style={pickerStyles.roleLabel} numberOfLines={1}>{roleLabel}</Text>
                </View>
                {isActive && (
                  <View style={pickerStyles.checkCircle} />
                )}
              </Pressable>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}

export function IconGrid() {
  const accent = useAccentColor();
  const router = useRouter();
  const mode = useMode();
  const { state, switchContext } = useAppContext();
  const { width: screenWidth } = useWindowDimensions();
  const { addScreen } = useMultitasking();
  const cellWidth = screenWidth / 3;

  const [orgPickerVisible, setOrgPickerVisible] = useState(false);

  const handlePress = useCallback((item: GridIcon) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addScreen({
      id: item.id,
      route: item.route,
      title: item.label,
      icon: item.icon,
    });
    router.navigate(item.route as any);
  }, [addScreen, router]);

  const handleLongPress = useCallback((item: GridIcon) => {
    if (item.id === 'profile') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setOrgPickerVisible(true);
    }
  }, []);

  const handleOrgSelect = useCallback((orgId: string) => {
    if (orgId === state.activeContext.org_id) return;
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
      derived_role_badge: membership.role_titles.join(' · '),
    };
    switchContext(ctx);
  }, [state.activeContext.org_id, switchContext]);

  return (
    <View style={styles.container}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item) => {
            const label = MODE_LABELS[item.id]?.[mode] ?? item.label;
            const image = MODE_IMAGES[item.id]?.[mode] ?? item.image;
            return (
              <GridTile
                key={item.id}
                item={{ ...item, label, image }}
                cellWidth={cellWidth}
                accent={accent}
                onPress={handlePress}
                onLongPress={item.id === 'profile' ? handleLongPress : undefined}
              />
            );
          })}
        </View>
      ))}

      <OrgPickerPopup
        visible={orgPickerVisible}
        onClose={() => setOrgPickerVisible(false)}
        onSelect={handleOrgSelect}
        activeOrgId={state.activeContext.org_id}
        mode={mode}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-evenly',
    paddingBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: C.tileBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // Glow on press (shadow animates with scale)
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainerImage: {
    backgroundColor: '#000000',
  },
  tileImage: {
    width: 56,
    height: 56,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.badgeText,
  },
  label: {
    fontSize: 11,
    marginTop: 12,
    textAlign: 'center',
    color: C.label,
  },
});

const pickerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  card: {
    width: '85%',
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    padding: 16,
    maxWidth: 340,
  },
  header: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 2,
  },
  rowActive: {
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  rowContent: {
    flex: 1,
  },
  orgName: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  orgNameActive: {
    color: '#FFFFFF',
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.35)',
  },
  checkCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginLeft: 12,
  },
});
