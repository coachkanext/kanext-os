/**
 * KaNeXT OS Avatar Drawer
 *
 * Twitter/X-style navigation drawer with push animation.
 * Main content slides right when drawer opens.
 *
 * Structure:
 * - Identity Header (large, dominant)
 * - Primary Nav: Profile, Video, Open Nexus
 * - Divider
 * - Utility Nav: Settings & Privacy, Help / Support, Terms & Policies
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

// Export for use in layout to animate content
export const AVATAR_DRAWER_WIDTH = DRAWER_WIDTH;

interface AvatarDrawerProps {
  visible: boolean;
  onClose: () => void;
  contentSlideAnim?: Animated.Value;
}

export function AvatarDrawer({ visible, onClose, contentSlideAnim }: AvatarDrawerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const { state: authState, signOut } = useAuth();

  const isLoggedIn = authState.isAuthenticated;

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 11,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Animate content to slide right
        ...(contentSlideAnim ? [
          Animated.spring(contentSlideAnim, {
            toValue: DRAWER_WIDTH,
            tension: 65,
            friction: 11,
            useNativeDriver: true,
          }),
        ] : []),
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
        // Animate content back
        ...(contentSlideAnim ? [
          Animated.timing(contentSlideAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ] : []),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, contentSlideAnim]);

  // Build context lines
  const modeLine = state.mode
    ? `${state.mode.charAt(0).toUpperCase() + state.mode.slice(1)}${state.organization?.name ? ` · ${state.organization.name}` : ''}`
    : '';

  const detailLine =
    state.mode === 'sports' && state.program?.name
      ? `${state.program.name}${state.cycle?.name ? ` · ${state.cycle.name}` : ''}`
      : state.cycle?.name || '';

  const handleNavigation = (route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 250);
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={visible ? 'auto' : 'none'}>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]} pointerEvents={visible ? 'auto' : 'none'}>
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
          {/* ===== IDENTITY HEADER (Large, Dominant) ===== */}
          <Pressable
            style={({ pressed }) => [
              styles.identityHeader,
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => handleNavigation('/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name="person.fill" size={32} color={colors.icon} />
            </View>

            {/* Name - Headline sized */}
            <Text style={[styles.identityName, { color: colors.text }]}>
              {isLoggedIn ? (authState.session?.displayName ?? 'User') : 'Viewer'}
            </Text>

            {/* Mode · Organization - Body text, clearly readable */}
            {modeLine && (
              <Text style={[styles.identityMode, { color: colors.textSecondary }]}>
                {modeLine}
              </Text>
            )}

            {/* Program · Season - Smaller but readable */}
            {detailLine && (
              <Text style={[styles.identityDetail, { color: colors.textTertiary }]}>
                {detailLine}
              </Text>
            )}
          </Pressable>

          {/* ===== PRIMARY NAVIGATION ===== */}
          <View style={styles.primaryNav}>
            <PrimaryNavItem
              icon="person.circle"
              label="Profile"
              colors={colors}
              onPress={() => handleNavigation('/profile')}
            />
            <PrimaryNavItem
              icon="play.rectangle"
              label="Video"
              colors={colors}
              onPress={() => handleNavigation('/video')}
            />
            <PrimaryNavItem
              icon="sparkles"
              label="Open Nexus"
              colors={colors}
              onPress={() => handleNavigation('/(tabs)/nexus')}
            />
          </View>

          {/* ===== SINGLE DIVIDER ===== */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* ===== UTILITY NAVIGATION ===== */}
          <View style={styles.utilityNav}>
            <UtilityNavItem
              icon="gear"
              label="Settings & Privacy"
              colors={colors}
              onPress={() => handleNavigation('/settings')}
            />
            <UtilityNavItem
              icon="questionmark.circle"
              label="Help / Support"
              colors={colors}
              onPress={() => handleNavigation('/help')}
            />
            <UtilityNavItem
              icon="doc.text"
              label="Terms & Policies"
              colors={colors}
              onPress={() => handleNavigation('/terms')}
            />
            {isLoggedIn && (
              <UtilityNavItem
                icon="rectangle.portrait.and.arrow.right"
                label="Sign Out"
                colors={colors}
                onPress={() => {
                  onClose();
                  signOut();
                }}
              />
            )}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

// =============================================
// PRIMARY NAV ITEM (Large tap targets)
// =============================================
function PrimaryNavItem({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryNavItem,
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={24} color={colors.text} />
      <Text style={[styles.primaryNavLabel, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

// =============================================
// UTILITY NAV ITEM (Normal sized)
// =============================================
function UtilityNavItem({
  icon,
  label,
  colors,
  onPress,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.utilityNavItem,
        pressed && { backgroundColor: colors.backgroundSecondary },
      ]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={20} color={colors.icon} />
      <Text style={[styles.utilityNavLabel, { color: colors.text }]}>{label}</Text>
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
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ===== IDENTITY HEADER =====
  identityHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  identityName: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  identityMode: {
    fontSize: 16,
    fontWeight: '400',
    marginBottom: 4,
  },
  identityDetail: {
    fontSize: 14,
    fontWeight: '400',
  },

  // ===== PRIMARY NAVIGATION =====
  primaryNav: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  primaryNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.lg,
  },
  primaryNavLabel: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 16,
  },

  // ===== DIVIDER =====
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginVertical: 12,
  },

  // ===== UTILITY NAVIGATION =====
  utilityNav: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  utilityNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
  },
  utilityNavLabel: {
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 14,
  },
});
