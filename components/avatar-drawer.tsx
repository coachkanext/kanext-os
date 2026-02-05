/**
 * KaNeXT OS Avatar Drawer
 * Slide-in drawer from left with viewer vs owner layouts.
 *
 * Viewer: Generic identity, context rows, Log in action
 * Owner: Full identity, context selectors, Account links, Log out
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Role, Program, Cycle } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface AvatarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// Programs available in Sports mode
const SPORTS_PROGRAMS: Program[] = [
  { id: 'varsity', name: 'Varsity', level: 'varsity' },
  { id: 'dev-1', name: 'Development I', level: 'development_1' },
  { id: 'dev-2', name: 'Development II', level: 'development_2' },
  { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
];

// Seasons available
const SEASONS: Cycle[] = [
  { id: '2025-26', name: '2025-26', startDate: new Date('2025-10-01'), endDate: new Date('2026-04-01'), isCurrent: true },
  { id: '2024-25', name: '2024-25', startDate: new Date('2024-10-01'), endDate: new Date('2025-04-01'), isCurrent: false },
  { id: '2023-24', name: '2023-24', startDate: new Date('2023-10-01'), endDate: new Date('2024-04-01'), isCurrent: false },
];

// Role display names
const ROLE_LABELS: Partial<Record<Role, string>> = {
  head_coach: 'Head Coach',
  assistant_coach: 'Assistant Coach',
  gm: 'General Manager',
  founder: 'Founder & CEO',
  investor: 'Investor',
  member: 'Member',
  faculty: 'Faculty',
  student: 'Student',
  staff: 'Staff',
};

export function AvatarDrawer({ visible, onClose }: AvatarDrawerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, setProgram, setCycle, setAuthState, logout } = useAppContext();

  const isOwner = state.authState === 'owner';

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [showProgramModal, setShowProgramModal] = useState(false);
  const [showSeasonModal, setShowSeasonModal] = useState(false);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const formatRole = (role: Role): string => {
    return ROLE_LABELS[role] || role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const handleProgramSelect = (program: Program) => {
    setProgram(program);
    setShowProgramModal(false);
  };

  const handleSeasonSelect = (season: Cycle) => {
    setCycle(season);
    setShowSeasonModal(false);
  };

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogin = () => {
    setAuthState('owner');
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        {/* Scrim */}
        <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Drawer */}
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              backgroundColor: colors.background,
              transform: [{ translateX: slideAnim }],
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ============================================= */}
            {/* IDENTITY HEADER */}
            {/* ============================================= */}
            <View style={styles.section}>
              <View
                style={[
                  styles.avatarLarge,
                  { backgroundColor: colors.backgroundTertiary },
                ]}
              >
                <IconSymbol name="person.fill" size={40} color={colors.icon} />
              </View>
              {isOwner ? (
                <>
                  <Text style={[styles.userName, { color: colors.text }]}>
                    Sammy Kalejaiye
                  </Text>
                  <Text style={[styles.userRole, { color: colors.textSecondary }]}>
                    {formatRole(state.operatingRole)}
                  </Text>
                  <Text style={[styles.userOrg, { color: colors.textTertiary }]}>
                    {state.organization?.name}
                  </Text>
                </>
              ) : (
                <Text style={[styles.userName, { color: colors.text }]}>
                  Viewer
                </Text>
              )}
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* ============================================= */}
            {/* SPORTS MODE CONTEXT */}
            {/* ============================================= */}
            {state.mode === 'sports' && (
              <>
                {/* Organization (read-only for viewer) */}
                {!isOwner && (
                  <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                      ORGANIZATION
                    </Text>
                    <View style={styles.contextRowStatic}>
                      <Text style={[styles.contextValue, { color: colors.text }]}>
                        {state.organization?.name ?? 'Lincoln University'}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Program (tappable) */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    PROGRAM
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.contextRow,
                      { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
                    ]}
                    onPress={() => setShowProgramModal(true)}
                  >
                    <Text style={[styles.contextValue, { color: colors.text }]}>
                      {state.program?.name ?? 'Varsity'}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>

                {/* Season (tappable) */}
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    SEASON
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.contextRow,
                      { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
                    ]}
                    onPress={() => setShowSeasonModal(true)}
                  >
                    <Text style={[styles.contextValue, { color: colors.text }]}>
                      {state.cycle?.name ?? '2025-26'}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              </>
            )}

            {/* ============================================= */}
            {/* ACTION ROWS */}
            {/* ============================================= */}
            <View style={styles.section}>
              {isOwner ? (
                <>
                  {/* Owner actions */}
                  <MenuItem
                    icon="gear"
                    label="Account Settings"
                    colors={colors}
                    onPress={() => handleNavigation('/account/settings')}
                  />
                  <MenuItem
                    icon="questionmark.circle"
                    label="Help / Support"
                    colors={colors}
                    onPress={() => handleNavigation('/help')}
                  />
                  <MenuItem
                    icon="info.circle"
                    label="Terms & Policies"
                    colors={colors}
                    onPress={() => handleNavigation('/terms')}
                  />
                </>
              ) : (
                <>
                  {/* Viewer actions */}
                  <MenuItem
                    icon="person.crop.circle.badge.plus"
                    label="Log in"
                    colors={colors}
                    onPress={handleLogin}
                  />
                  <MenuItem
                    icon="questionmark.circle"
                    label="Help / Support"
                    colors={colors}
                    onPress={() => handleNavigation('/help')}
                  />
                  <MenuItem
                    icon="info.circle"
                    label="Terms & Policies"
                    colors={colors}
                    onPress={() => handleNavigation('/terms')}
                  />
                </>
              )}
            </View>

            {/* Log Out (owner only) */}
            {isOwner && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <View style={styles.section}>
                  <MenuItem
                    icon="rectangle.portrait.and.arrow.right"
                    label="Log Out"
                    colors={colors}
                    destructive
                    onPress={handleLogout}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>

        {/* Program Selector Modal (centered card) */}
        <SelectorModal
          visible={showProgramModal}
          title="Select Program"
          options={SPORTS_PROGRAMS.map(p => p.name)}
          selectedValue={state.program?.name ?? 'Varsity'}
          onSelect={(name) => {
            const program = SPORTS_PROGRAMS.find(p => p.name === name);
            if (program) handleProgramSelect(program);
          }}
          onClose={() => setShowProgramModal(false)}
          colors={colors}
        />

        {/* Season Selector Modal (centered card) */}
        <SelectorModal
          visible={showSeasonModal}
          title="Select Season"
          options={SEASONS.map(s => s.name)}
          selectedValue={state.cycle?.name ?? '2025-26'}
          onSelect={(name) => {
            const season = SEASONS.find(s => s.name === name);
            if (season) handleSeasonSelect(season);
          }}
          onClose={() => setShowSeasonModal(false)}
          colors={colors}
        />
      </View>
    </Modal>
  );
}

// Centered card selector modal
function SelectorModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  colors: typeof Colors.light;
}) {
  if (!visible) return null;

  return (
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
        <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
        {options.map((option) => {
          const isSelected = option === selectedValue;
          return (
            <Pressable
              key={option}
              style={[
                styles.modalOption,
                isSelected && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={() => onSelect(option)}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  { color: colors.text },
                  isSelected && { fontWeight: '600' },
                ]}
              >
                {option}
              </Text>
              {isSelected && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
            </Pressable>
          );
        })}
      </View>
    </Pressable>
  );
}

// Menu item helper
function MenuItem({
  icon,
  label,
  colors,
  destructive,
  onPress,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
  destructive?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
      ]}
      onPress={onPress}
    >
      <IconSymbol
        name={icon as any}
        size={20}
        color={destructive ? colors.error : colors.icon}
      />
      <Text
        style={[
          styles.menuLabel,
          { color: destructive ? colors.error : colors.text },
        ]}
      >
        {label}
      </Text>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.xs,
  },
  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
  },
  userRole: {
    fontSize: 15,
    marginTop: 2,
  },
  userOrg: {
    fontSize: 13,
    marginTop: 2,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  contextRowStatic: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  contextValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  menuLabel: {
    fontSize: 16,
    marginLeft: Spacing.md,
    flex: 1,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: 280,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  modalOptionText: {
    fontSize: 16,
  },
});
