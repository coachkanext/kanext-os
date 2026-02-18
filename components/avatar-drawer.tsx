/**
 * KaNeXT OS Avatar Drawer — V3
 *
 * Global Control Plane with RBCA, inline mode switching, 21-view matrix,
 * permissions panel, contextual fast actions, and ViewDetailsSheet.
 *
 * Section layout:
 * A — Identity Header (avatar, name, primary badge, demo chip)
 * B — Current Context Block (mode, org, role+scope, season chip)
 * C1 — Mode Switch Row (5 horizontal chips)
 * C2 — My Views (filtered by selected mode)
 * D — Permissions Panel (collapsible)
 * E — Fast Actions (4 buttons)
 * F — Global Items (Settings, Help, Terms, Sign Out)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';
import { getOrgById, getMembershipById } from '@/data/mock-memberships';
import { CANONICAL_VIEWS, getViewsForMode, DRAWER_MODES, MODE_CHIP_CONFIG } from '@/data/views';
import { TIER_LABELS, derivePrimaryBadge, deriveRBCATier, PERMISSION_BULLETS, FAST_ACTIONS } from '@/data/rbca';
import { deriveRoleBadge } from '@/utils/role-badge';
import type { ActiveContext } from '@/types';
import type { ViewDefinition } from '@/data/views';
import type { RBCATier } from '@/data/rbca';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(300, SCREEN_WIDTH * 0.82);

export const AVATAR_DRAWER_WIDTH = DRAWER_WIDTH;

// Mode display labels
const MODE_LABELS: Record<string, string> = {
  sports: 'Sports',
  competition: 'Competition',
  church: 'Church',
  education: 'Education',
  business: 'Business',
};

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
  const { state, switchContext } = useAppContext();
  const { state: authState, signOut } = useAuth();

  const isLoggedIn = authState.isAuthenticated;
  const { activeContext } = state;

  // Local state
  const [selectedMode, setSelectedMode] = useState(activeContext.mode);
  const [permissionsExpanded, setPermissionsExpanded] = useState(false);
  const [detailsView, setDetailsView] = useState<ViewDefinition | null>(null);

  // Reset selected mode to active context when drawer opens
  useEffect(() => {
    if (visible) {
      setSelectedMode(activeContext.mode);
      setPermissionsExpanded(false);
    }
  }, [visible, activeContext.mode]);

  // Animation refs
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
        ...(contentSlideAnim
          ? [
              Animated.spring(contentSlideAnim, {
                toValue: DRAWER_WIDTH,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
              }),
            ]
          : []),
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
        ...(contentSlideAnim
          ? [
              Animated.timing(contentSlideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
              }),
            ]
          : []),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim, contentSlideAnim]);

  // Derive highest RBCA tier across all 21 views for primary badge
  const highestTier = useMemo<RBCATier>(() => {
    let max: RBCATier = 0;
    for (const view of CANONICAL_VIEWS) {
      if (view.rbca_tier > max) max = view.rbca_tier;
    }
    return max;
  }, []);

  const primaryBadge = derivePrimaryBadge(highestTier);

  // Get views for the selected mode chip
  const filteredViews = useMemo(() => {
    return getViewsForMode(selectedMode);
  }, [selectedMode]);

  // View counts per mode for disabling empty chips
  const viewCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const m of DRAWER_MODES) {
      counts[m] = getViewsForMode(m).length;
    }
    return counts;
  }, []);

  // Current context display info
  const currentOrg = getOrgById(activeContext.org_id);
  const currentModeLabel = MODE_LABELS[activeContext.mode] ?? activeContext.mode;

  // Current view (from canonical views)
  const currentView = useMemo(() => {
    return CANONICAL_VIEWS.find((v) => v.membership_id === activeContext.membership_id);
  }, [activeContext.membership_id]);

  // Permission bullets for current view
  const permissionBullets = PERMISSION_BULLETS[activeContext.membership_id] ?? [];

  // Fast actions for current view
  const fastActions = FAST_ACTIONS[activeContext.membership_id] ?? [];

  // Handlers
  const handleNavigation = useCallback(
    (route: string) => {
      onClose();
      setTimeout(() => {
        router.push(route as any);
      }, 250);
    },
    [onClose, router],
  );

  const handleViewSwitch = useCallback(
    (view: ViewDefinition) => {
      const badge = deriveRoleBadge(view.membership_id, view.program_id);
      const newContext: ActiveContext = {
        mode: view.mode,
        org_id: view.org_id,
        program_id: view.program_id,
        season_id: view.season_id,
        membership_id: view.membership_id,
        derived_role_badge: badge,
      };
      switchContext(newContext);
      onClose();
    },
    [switchContext, onClose],
  );

  const handleViewLongPress = useCallback((view: ViewDefinition) => {
    setDetailsView(view);
  }, []);

  const togglePermissions = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPermissionsExpanded((prev) => !prev);
  }, []);

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
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ===== A. IDENTITY HEADER ===== */}
          <View style={styles.identityBlock}>
            <View style={styles.identityRow}>
              <Image
                source={require('@/assets/images/sammy-kalejaiye.jpg')}
                style={styles.avatarImage}
              />
              <View style={styles.identityChips}>
                <View style={[styles.badgePill, { backgroundColor: colors.backgroundTertiary }]}>
                  <Text style={[styles.badgePillText, { color: colors.text }]}>{primaryBadge}</Text>
                </View>
                <View style={[styles.demoPill, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
                  <Text style={[styles.demoPillText, { color: colors.textSecondary }]}>Demo</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.identityName, { color: colors.text }]}>
              {isLoggedIn ? authState.session?.displayName ?? 'User' : 'Viewer'}
            </Text>
          </View>

          {/* ===== B. CURRENT CONTEXT BLOCK ===== */}
          <View
            style={[
              styles.activeContextBlock,
              { backgroundColor: colors.backgroundSecondary, borderColor: colors.border },
            ]}
          >
            <View style={styles.activeContextContent}>
              <Text style={[styles.contextLine1, { color: colors.textSecondary }]}>
                {currentModeLabel}
              </Text>
              <Text style={[styles.contextLine2, { color: colors.text }]} numberOfLines={1}>
                {currentView?.org_display_name ?? currentOrg?.org_name ?? ''}
              </Text>
              <Text style={[styles.contextLine3, { color: colors.textSecondary }]} numberOfLines={2}>
                {currentView?.role_title ?? activeContext.derived_role_badge} {'\u00b7'} {currentView?.scope_line ?? ''}
              </Text>
            </View>
            <View style={[styles.seasonChip, { backgroundColor: colors.backgroundTertiary }]}>
              <Text style={[styles.seasonChipText, { color: colors.text }]}>
                {currentView?.season_chip ?? ''}
              </Text>
            </View>
          </View>

          {/* ===== C1. MODE SWITCH ROW ===== */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.modeChipScroll}
            contentContainerStyle={styles.modeChipContainer}
          >
            {MODE_CHIP_CONFIG.map((chip) => {
              const isActive = chip.mode === selectedMode;
              const count = viewCounts[chip.mode] ?? 0;
              const isDisabled = count === 0;
              return (
                <Pressable
                  key={chip.mode}
                  style={[
                    styles.modeChip,
                    isActive
                      ? { backgroundColor: colors.text }
                      : { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1 },
                    isDisabled && { opacity: 0.3 },
                  ]}
                  onPress={() => !isDisabled && setSelectedMode(chip.mode)}
                  disabled={isDisabled}
                >
                  <IconSymbol
                    name={chip.icon as any}
                    size={14}
                    color={isActive ? colors.background : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.modeChipLabel,
                      { color: isActive ? colors.background : colors.textSecondary },
                    ]}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ===== C2. MY VIEWS ===== */}
          <View style={styles.viewsSection}>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>MY VIEWS</Text>
            {filteredViews.map((view) => {
              const isCurrentView = view.membership_id === activeContext.membership_id;
              const tierLabel = TIER_LABELS[view.rbca_tier];
              return (
                <Pressable
                  key={view.view_id}
                  style={({ pressed }) => [
                    styles.viewRow,
                    isCurrentView && { backgroundColor: colors.backgroundSecondary },
                    pressed && !isCurrentView && { backgroundColor: colors.backgroundSecondary },
                  ]}
                  onPress={() => handleViewSwitch(view)}
                  onLongPress={() => handleViewLongPress(view)}
                  delayLongPress={300}
                >
                  <View style={styles.viewRowContent}>
                    <View style={styles.viewRowTop}>
                      <Text style={[styles.viewOrgName, { color: colors.text }]} numberOfLines={1}>
                        {view.org_display_name}
                      </Text>
                      {isCurrentView && (
                        <IconSymbol name="checkmark" size={14} color={colors.tint} />
                      )}
                    </View>
                    <Text style={[styles.viewRoleTitle, { color: colors.textSecondary }]} numberOfLines={1}>
                      {view.role_title}
                    </Text>
                    <View style={styles.viewRowBottom}>
                      <View style={[styles.tierPill, { backgroundColor: colors.backgroundTertiary }]}>
                        <Text style={[styles.tierPillText, { color: colors.textSecondary }]}>
                          {tierLabel}
                        </Text>
                      </View>
                      <Text style={[styles.viewScope, { color: colors.textTertiary }]}>
                        {view.scope_line}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* ===== D. PERMISSIONS PANEL ===== */}
          {permissionBullets.length > 0 && (
            <View style={styles.permissionsSection}>
              <Pressable style={styles.permissionsHeader} onPress={togglePermissions}>
                <Text style={[styles.permissionsTitle, { color: colors.textSecondary }]}>
                  Your access in this view
                </Text>
                <IconSymbol
                  name={permissionsExpanded ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  color={colors.textTertiary}
                />
              </Pressable>
              {permissionsExpanded && (
                <View style={styles.permissionsList}>
                  {permissionBullets.map((bullet, i) => (
                    <View key={i} style={styles.permissionBullet}>
                      <Text style={[styles.bulletDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
                      <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{bullet}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* ===== E. FAST ACTIONS ===== */}
          {fastActions.length > 0 && (
            <>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              <View style={styles.fastActionsRow}>
                {fastActions.map((action, i) => (
                  <Pressable
                    key={i}
                    style={({ pressed }) => [
                      styles.fastActionButton,
                      pressed && { opacity: 0.6 },
                    ]}
                    onPress={() => handleNavigation(action.route)}
                  >
                    <View style={[styles.fastActionIconWrap, { backgroundColor: colors.backgroundSecondary }]}>
                      <IconSymbol name={action.icon as any} size={18} color={colors.icon} />
                    </View>
                    <Text style={[styles.fastActionLabel, { color: colors.textSecondary }]} numberOfLines={1}>
                      {action.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* ===== F. GLOBAL ITEMS ===== */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
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

      {/* View Details Sheet (long-press) */}
      <ViewDetailsSheet
        view={detailsView}
        onClose={() => setDetailsView(null)}
      />
    </View>
  );
}

// =============================================
// VIEW DETAILS SHEET (long-press on a view row)
// =============================================
function ViewDetailsSheet({
  view,
  onClose,
}: {
  view: ViewDefinition | null;
  onClose: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!view) return null;

  const bullets = PERMISSION_BULLETS[view.membership_id] ?? [];
  const actions = FAST_ACTIONS[view.membership_id] ?? [];
  const tierLabel = TIER_LABELS[view.rbca_tier];

  return (
    <BottomSheet visible={!!view} onClose={onClose} useModal title={view.org_display_name}>
      <View style={detailStyles.section}>
        <Text style={[detailStyles.roleTitle, { color: colors.text }]}>{view.role_title}</Text>
        <View style={detailStyles.metaRow}>
          <View style={[styles.tierPill, { backgroundColor: colors.backgroundTertiary }]}>
            <Text style={[styles.tierPillText, { color: colors.textSecondary }]}>{tierLabel}</Text>
          </View>
          <Text style={[detailStyles.scope, { color: colors.textTertiary }]}>{view.scope_line}</Text>
          <Text style={[detailStyles.season, { color: colors.textTertiary }]}>{view.season_chip}</Text>
        </View>
      </View>

      {bullets.length > 0 && (
        <View style={detailStyles.section}>
          <Text style={[detailStyles.sectionTitle, { color: colors.textTertiary }]}>PERMISSIONS</Text>
          {bullets.map((b, i) => (
            <View key={i} style={styles.permissionBullet}>
              <Text style={[styles.bulletDot, { color: colors.textTertiary }]}>{'\u2022'}</Text>
              <Text style={[styles.bulletText, { color: colors.textSecondary }]}>{b}</Text>
            </View>
          ))}
        </View>
      )}

      {actions.length > 0 && (
        <View style={detailStyles.section}>
          <Text style={[detailStyles.sectionTitle, { color: colors.textTertiary }]}>SHORTCUTS</Text>
          {actions.map((a, i) => (
            <View key={i} style={detailStyles.shortcutRow}>
              <IconSymbol name={a.icon as any} size={16} color={colors.icon} />
              <Text style={[detailStyles.shortcutLabel, { color: colors.textSecondary }]}>{a.label}</Text>
            </View>
          ))}
        </View>
      )}
    </BottomSheet>
  );
}

// =============================================
// UTILITY NAV ITEM
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

// =============================================
// STYLES
// =============================================
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
    paddingBottom: 24,
  },

  // ===== A. IDENTITY BLOCK =====
  identityBlock: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  identityChips: {
    flexDirection: 'row',
    gap: 6,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  demoPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  demoPillText: {
    fontSize: 11,
    fontWeight: '500',
  },
  identityName: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  // ===== B. ACTIVE CONTEXT BLOCK =====
  activeContextBlock: {
    marginHorizontal: 12,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeContextContent: {
    flex: 1,
  },
  contextLine1: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  contextLine2: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  contextLine3: {
    fontSize: 12,
    fontWeight: '400',
  },
  seasonChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginLeft: 8,
  },
  seasonChipText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // ===== C1. MODE CHIP ROW =====
  modeChipScroll: {
    marginBottom: 12,
  },
  modeChipContainer: {
    paddingHorizontal: 12,
    gap: 6,
  },
  modeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
    gap: 5,
  },
  modeChipLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ===== C2. VIEWS LIST =====
  viewsSection: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    paddingHorizontal: 8,
    marginBottom: 6,
  },
  viewRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  viewRowContent: {
    gap: 2,
  },
  viewRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewOrgName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  viewRoleTitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  viewRowBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  tierPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  tierPillText: {
    fontSize: 10,
    fontWeight: '600',
  },
  viewScope: {
    fontSize: 11,
    fontWeight: '400',
  },

  // ===== D. PERMISSIONS PANEL =====
  permissionsSection: {
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  permissionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  permissionsTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  permissionsList: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  permissionBullet: {
    flexDirection: 'row',
    paddingVertical: 3,
    gap: 6,
  },
  bulletDot: {
    fontSize: 12,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },

  // ===== E. FAST ACTIONS =====
  fastActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  fastActionButton: {
    alignItems: 'center',
    width: 60,
    gap: 6,
  },
  fastActionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fastActionLabel: {
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
  },

  // ===== DIVIDER =====
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 20,
    marginVertical: 8,
  },

  // ===== F. UTILITY NAVIGATION =====
  utilityNav: {
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  utilityNavItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
  },
  utilityNavLabel: {
    fontSize: 15,
    fontWeight: '400',
    marginLeft: 14,
  },
});

// ===== VIEW DETAILS SHEET STYLES =====
const detailStyles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scope: {
    fontSize: 12,
  },
  season: {
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  shortcutLabel: {
    fontSize: 13,
    fontWeight: '400',
  },
});
