/**
 * KaNeXT OS Avatar Drawer
 * Single authority surface for identity and context.
 * X/Twitter-style slide-in drawer from left.
 *
 * Sports mode layout:
 * - Identity header (read-only)
 * - Program switcher
 * - Season switcher
 * - Account links (Settings, Help, Terms)
 * - Logout
 *
 * Mode switching is ONLY in the global header dropdown.
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
  Alert,
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
  const { state, setProgram, setCycle, setFirstRun, clearPersistedState } = useAppContext();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const [showProgramSheet, setShowProgramSheet] = useState(false);
  const [showSeasonSheet, setShowSeasonSheet] = useState(false);

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
    setShowProgramSheet(false);
  };

  const handleSeasonSelect = (season: Cycle) => {
    setCycle(season);
    setShowSeasonSheet(false);
  };

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out?',
      "You'll need to sign in again to access your programs.",
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: async () => {
            onClose();
            await clearPersistedState();
            setFirstRun(true);
          },
        },
      ]
    );
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
        {/* Scrim / Backdrop */}
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
            {/* IDENTITY HEADER (Read-Only) */}
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
              <Text style={[styles.userName, { color: colors.text }]}>
                Sammy Kalejaiye
              </Text>
              <Text style={[styles.userRole, { color: colors.textSecondary }]}>
                {formatRole(state.operatingRole)}
              </Text>
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* ============================================= */}
            {/* SPORTS MODE: PROGRAM SWITCHER */}
            {/* ============================================= */}
            {state.mode === 'sports' && (
              <>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    CURRENT PROGRAM
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.contextRow,
                      { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
                    ]}
                    onPress={() => setShowProgramSheet(true)}
                  >
                    <Text style={[styles.contextValue, { color: colors.text }]}>
                      {state.program?.name ?? 'Varsity'}
                    </Text>
                    <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
                  </Pressable>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              </>
            )}

            {/* ============================================= */}
            {/* SPORTS MODE: SEASON SWITCHER */}
            {/* ============================================= */}
            {state.mode === 'sports' && (
              <>
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    SEASON
                  </Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.contextRow,
                      { backgroundColor: pressed ? colors.backgroundSecondary : 'transparent' },
                    ]}
                    onPress={() => setShowSeasonSheet(true)}
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
            {/* ACCOUNT & SYSTEM LINKS */}
            {/* ============================================= */}
            <View style={styles.section}>
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
            </View>

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Log Out */}
            <View style={styles.section}>
              <MenuItem
                icon="rectangle.portrait.and.arrow.right"
                label="Log Out"
                colors={colors}
                destructive
                onPress={handleLogout}
              />
            </View>
          </ScrollView>
        </Animated.View>

        {/* Program Picker Sheet */}
        {showProgramSheet && (
          <Pressable style={styles.sheetOverlay} onPress={() => setShowProgramSheet(false)}>
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.card, paddingBottom: insets.bottom + Spacing.md },
              ]}
            >
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Program</Text>
              {SPORTS_PROGRAMS.map((program) => {
                const isSelected = state.program?.id === program.id;
                return (
                  <Pressable
                    key={program.id}
                    style={[
                      styles.sheetOption,
                      isSelected && { backgroundColor: colors.backgroundSecondary },
                    ]}
                    onPress={() => handleProgramSelect(program)}
                  >
                    <Text style={[styles.sheetOptionText, { color: colors.text }]}>
                      {program.name}
                    </Text>
                    {isSelected && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        )}

        {/* Season Picker Sheet */}
        {showSeasonSheet && (
          <Pressable style={styles.sheetOverlay} onPress={() => setShowSeasonSheet(false)}>
            <View
              style={[
                styles.sheet,
                { backgroundColor: colors.card, paddingBottom: insets.bottom + Spacing.md },
              ]}
            >
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Select Season</Text>
              {SEASONS.map((season) => {
                const isSelected = state.cycle?.id === season.id;
                return (
                  <Pressable
                    key={season.id}
                    style={[
                      styles.sheetOption,
                      isSelected && { backgroundColor: colors.backgroundSecondary },
                    ]}
                    onPress={() => handleSeasonSelect(season)}
                  >
                    <Text style={[styles.sheetOptionText, { color: colors.text }]}>
                      {season.name}
                    </Text>
                    {isSelected && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        )}
      </View>
    </Modal>
  );
}

// Helper component for menu items
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
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: Spacing.md,
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
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
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
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  sheetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  sheetOptionText: {
    fontSize: 16,
  },
});
