/**
 * KaNeXT OS Avatar Drawer
 * Single authority surface for identity and context.
 * X/Twitter-style slide-in drawer from left.
 *
 * Per spec: Avatar Drawer is the only place where:
 * - Identity is shown (read-only)
 * - Context is switched (mode, role)
 * - Account settings are accessed
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

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import type { Mode, Role, Campus, AcademicTerm } from '@/types';
import { CAMPUSES } from '@/data/mock-church';
import { ACADEMIC_TERMS } from '@/data/mock-education';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(320, SCREEN_WIDTH * 0.85);

interface AvatarDrawerProps {
  visible: boolean;
  onClose: () => void;
}

// Mode display configuration
const MODE_CONFIG: Record<Mode, { label: string; icon: string }> = {
  sports: { label: 'Sports', icon: 'sportscourt.fill' },
  enterprise: { label: 'Enterprise', icon: 'building.2.fill' },
  church: { label: 'Church', icon: 'building.columns.fill' },
  education: { label: 'Education', icon: 'graduationcap.fill' },
};

// Role display names
const ROLE_LABELS: Partial<Record<Role, string>> = {
  founder: 'Founder & CEO',
  investor: 'Investor',
  viewer: 'Viewer',
  admin: 'Admin',
  head_coach: 'Head Coach',
  assistant_coach: 'Assistant Coach',
  gm: 'General Manager',
  student_athlete: 'Student-Athlete',
  fan: 'Fan',
  agent: 'Agent',
  scout: 'Scout',
  donor: 'Donor',
  media: 'Media',
  member: 'Member',
  staff: 'Staff',
  leadership: 'Leadership',
  faculty: 'Faculty',
  student: 'Student',
};

export function AvatarDrawer({ visible, onClose }: AvatarDrawerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state, setMode, setRole } = useAppContext();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  const handleModeSelect = (mode: Mode) => {
    setMode(mode);
  };

  const handleRoleSelect = (role: Role) => {
    setRole(role);
  };

  if (!visible) return null;

  return (
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
            {/* Avatar */}
            <View
              style={[
                styles.avatarLarge,
                { backgroundColor: colors.backgroundTertiary },
              ]}
            >
              <IconSymbol name="person.fill" size={40} color={colors.icon} />
            </View>

            {/* Name */}
            <Text style={[styles.userName, { color: colors.text }]}>
              Sammy Kalejaiye
            </Text>

            {/* Primary Role */}
            <Text style={[styles.userRole, { color: colors.textSecondary }]}>
              {formatRole(state.operatingRole)}
            </Text>

            {/* Organization */}
            {state.organization && (
              <Text style={[styles.userOrg, { color: colors.textTertiary }]}>
                {state.organization.name}
              </Text>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* ============================================= */}
          {/* ACTIVE CONTEXT */}
          {/* ============================================= */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              ACTIVE CONTEXT
            </Text>

            {/* Mode Selector */}
            <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
              Mode
            </Text>
            <View style={styles.optionsList}>
              {(Object.keys(MODE_CONFIG) as Mode[]).map((mode) => (
                <Pressable
                  key={mode}
                  style={({ pressed }) => [
                    styles.optionRow,
                    {
                      backgroundColor:
                        state.mode === mode
                          ? colors.backgroundSecondary
                          : pressed
                          ? colors.backgroundSecondary
                          : 'transparent',
                    },
                  ]}
                  onPress={() => handleModeSelect(mode)}
                >
                  <View style={styles.radioOuter}>
                    {state.mode === mode && (
                      <View
                        style={[styles.radioInner, { backgroundColor: colors.tint }]}
                      />
                    )}
                  </View>
                  <Text style={[styles.optionLabel, { color: colors.text }]}>
                    {MODE_CONFIG[mode].label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* Organization (Read-only display) */}
            <Text style={[styles.fieldLabel, { color: colors.textTertiary, marginTop: Spacing.md }]}>
              Organization
            </Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {state.organization?.name ?? getDefaultOrgName(state.mode)}
            </Text>

            {/* Role / Viewing As */}
            <Text style={[styles.fieldLabel, { color: colors.textTertiary, marginTop: Spacing.md }]}>
              Operating Role
            </Text>
            <Text style={[styles.fieldValue, { color: colors.text }]}>
              {formatRole(state.operatingRole)}
            </Text>

            {/* Cycle (if applicable) */}
            {state.cycle && (
              <>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary, marginTop: Spacing.md }]}>
                  {state.mode === 'sports' ? 'Season' : state.mode === 'education' ? 'Academic Year' : 'Cycle'}
                </Text>
                <Text style={[styles.fieldValue, { color: colors.text }]}>
                  {state.cycle.name}
                </Text>
              </>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* ============================================= */}
          {/* PROGRAM (Sports mode only, display only) */}
          {/* ============================================= */}
          {state.mode === 'sports' && (
            <>
              <View style={styles.section}>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
                  Current Program
                </Text>
                <Text style={[styles.fieldValue, { color: colors.text }]}>
                  {state.program?.name ?? 'Varsity'}
                </Text>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </>
          )}

          {/* ============================================= */}
          {/* ENTERPRISE ROLE SWITCHER (Enterprise mode) */}
          {/* ============================================= */}
          {state.mode === 'enterprise' && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  VIEWING AS
                </Text>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
                  Select Role
                </Text>
                <View style={styles.optionsList}>
                  {(['founder', 'investor', 'viewer'] as Role[]).map((role) => (
                    <Pressable
                      key={role}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor:
                            state.operatingRole === role
                              ? colors.backgroundSecondary
                              : pressed
                              ? colors.backgroundSecondary
                              : 'transparent',
                        },
                      ]}
                      onPress={() => handleRoleSelect(role)}
                    >
                      <View style={styles.radioOuter}>
                        {state.operatingRole === role && (
                          <View
                            style={[styles.radioInner, { backgroundColor: colors.tint }]}
                          />
                        )}
                      </View>
                      <View style={styles.roleOption}>
                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                          {formatRole(role)}
                        </Text>
                        <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>
                          {getEnterpriseRoleDesc(role)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </>
          )}

          {/* ============================================= */}
          {/* CHURCH CAMPUS & ROLE SWITCHER (Church mode) */}
          {/* ============================================= */}
          {state.mode === 'church' && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  MY CAMPUS
                </Text>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
                  Select Campus
                </Text>
                <View style={styles.optionsList}>
                  {CAMPUSES.map((campus) => (
                    <Pressable
                      key={campus.id}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor: pressed
                            ? colors.backgroundSecondary
                            : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        // Campus selection - could be persisted
                      }}
                    >
                      <View style={styles.radioOuter}>
                        {campus.id === 'iccla' && (
                          <View
                            style={[styles.radioInner, { backgroundColor: colors.tint }]}
                          />
                        )}
                      </View>
                      <View style={styles.roleOption}>
                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                          {campus.shortName}
                        </Text>
                        <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>
                          {campus.location}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  VIEWING AS
                </Text>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
                  Select Role
                </Text>
                <View style={styles.optionsList}>
                  {(['member', 'staff', 'leadership'] as Role[]).map((role) => (
                    <Pressable
                      key={role}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor:
                            state.operatingRole === role
                              ? colors.backgroundSecondary
                              : pressed
                              ? colors.backgroundSecondary
                              : 'transparent',
                        },
                      ]}
                      onPress={() => handleRoleSelect(role)}
                    >
                      <View style={styles.radioOuter}>
                        {state.operatingRole === role && (
                          <View
                            style={[styles.radioInner, { backgroundColor: colors.tint }]}
                          />
                        )}
                      </View>
                      <View style={styles.roleOption}>
                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                          {formatRole(role)}
                        </Text>
                        <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>
                          {getChurchRoleDesc(role)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </>
          )}

          {/* ============================================= */}
          {/* EDUCATION TERM & ROLE SWITCHER (Education mode) */}
          {/* ============================================= */}
          {state.mode === 'education' && (
            <>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  ACADEMIC TERM
                </Text>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
                  Current Term
                </Text>
                <View style={styles.optionsList}>
                  {ACADEMIC_TERMS.filter((t) => t.status !== 'completed').map((term) => (
                    <Pressable
                      key={term.id}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor:
                            term.status === 'current'
                              ? colors.backgroundSecondary
                              : pressed
                              ? colors.backgroundSecondary
                              : 'transparent',
                        },
                      ]}
                      onPress={() => {
                        // Term selection - could be persisted
                      }}
                    >
                      <View style={styles.radioOuter}>
                        {term.status === 'current' && (
                          <View
                            style={[styles.radioInner, { backgroundColor: colors.tint }]}
                          />
                        )}
                      </View>
                      <View style={styles.roleOption}>
                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                          {term.name}
                        </Text>
                        <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>
                          {term.academicYear}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                  VIEWING AS
                </Text>
                <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>
                  Select Role
                </Text>
                <View style={styles.optionsList}>
                  {(['faculty', 'student', 'staff'] as Role[]).map((role) => (
                    <Pressable
                      key={role}
                      style={({ pressed }) => [
                        styles.optionRow,
                        {
                          backgroundColor:
                            state.operatingRole === role
                              ? colors.backgroundSecondary
                              : pressed
                              ? colors.backgroundSecondary
                              : 'transparent',
                        },
                      ]}
                      onPress={() => handleRoleSelect(role)}
                    >
                      <View style={styles.radioOuter}>
                        {state.operatingRole === role && (
                          <View
                            style={[styles.radioInner, { backgroundColor: colors.tint }]}
                          />
                        )}
                      </View>
                      <View style={styles.roleOption}>
                        <Text style={[styles.optionLabel, { color: colors.text }]}>
                          {formatRole(role)}
                        </Text>
                        <Text style={[styles.roleDesc, { color: colors.textTertiary }]}>
                          {getEducationRoleDesc(role)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            </>
          )}

          {/* ============================================= */}
          {/* ACCOUNT & SYSTEM */}
          {/* ============================================= */}
          <View style={styles.section}>
            <MenuItem
              icon="gear"
              label="Account Settings"
              colors={colors}
              onPress={() => {
                onClose();
                // TODO: Navigate to account settings
              }}
            />
            <MenuItem
              icon="questionmark.circle"
              label="Help / Support"
              colors={colors}
              onPress={() => {
                onClose();
                // TODO: Navigate to support
              }}
            />
            <MenuItem
              icon="info.circle"
              label="Terms & Policies"
              colors={colors}
              onPress={() => {
                onClose();
                // TODO: Navigate to legal
              }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Log Out */}
          <View style={styles.section}>
            <MenuItem
              icon="xmark"
              label="Log Out"
              colors={colors}
              destructive
              onPress={() => {
                onClose();
                // TODO: Handle log out
              }}
            />
          </View>
        </ScrollView>
      </Animated.View>
    </View>
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
  icon: 'gear' | 'questionmark.circle' | 'info.circle' | 'xmark';
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
        name={icon}
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
    </Pressable>
  );
}

// Get default organization name by mode
function getDefaultOrgName(mode: Mode): string {
  switch (mode) {
    case 'sports':
      return 'Lincoln University';
    case 'enterprise':
      return 'KaNeXT';
    case 'church':
      return 'International Christian Center';
    case 'education':
      return 'San Diego Christian College';
    default:
      return 'Organization';
  }
}

// Get enterprise role description
function getEnterpriseRoleDesc(role: Role): string {
  switch (role) {
    case 'founder':
      return 'Full access to all documents and features';
    case 'investor':
      return 'Access to investor materials and updates';
    case 'viewer':
      return 'Public documents only';
    default:
      return '';
  }
}

// Get church role description
function getChurchRoleDesc(role: Role): string {
  switch (role) {
    case 'member':
      return 'Church member access';
    case 'staff':
      return 'Ministry staff with administrative access';
    case 'leadership':
      return 'Full access to all church features';
    default:
      return '';
  }
}

// Get education role description
function getEducationRoleDesc(role: Role): string {
  switch (role) {
    case 'faculty':
      return 'Full academic access and administrative features';
    case 'student':
      return 'Student portal and course information';
    case 'staff':
      return 'Administrative staff access';
    default:
      return '';
  }
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
    marginBottom: Spacing.md,
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
  userOrg: {
    fontSize: 13,
    marginTop: 2,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionsList: {
    marginTop: Spacing.xs,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginVertical: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#888',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionLabel: {
    fontSize: 16,
  },
  roleOption: {
    flex: 1,
  },
  roleDesc: {
    fontSize: 12,
    marginTop: 2,
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
  },
});
