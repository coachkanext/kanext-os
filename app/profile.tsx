/**
 * Profile Screen — Read-Only Context Mirror (v1 Locked)
 *
 * No edit buttons in v1. This screen is a mirror only:
 * identity + context + access tier.
 *
 * Route: Drawer → Profile
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import { useAuth } from '@/context/auth-context';

// Access tier display labels
const TIER_LABELS: Record<string, string> = {
  founder: 'Founder',
  cofounder: 'CoFounder',
  investor: 'Investor',
  public: 'Public',
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state } = useAppContext();
  const { state: authState } = useAuth();

  const isLoggedIn = authState.isAuthenticated;
  const displayName = isLoggedIn ? (authState.session?.displayName ?? 'User') : 'Viewer';
  const tier = authState.session?.tier ?? 'public';
  const tierLabel = TIER_LABELS[tier] ?? 'Public';

  // Mode display
  const modeName = state.mode.charAt(0).toUpperCase() + state.mode.slice(1);
  const orgName = state.organization?.name ?? '—';
  const roleName = state.operatingRole
    ? state.operatingRole.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : '—';

  // Workspace / program
  const workspace = state.mode === 'sports' && state.program?.name
    ? state.program.name
    : 'Default';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profile</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
      >
        {/* ===== IDENTITY BLOCK (read-only) ===== */}
        <View style={styles.identitySection}>
          <View style={[styles.avatarLarge, { backgroundColor: colors.backgroundTertiary }]}>
            <IconSymbol name="person.fill" size={40} color={colors.icon} />
          </View>
          <Text style={[styles.identityName, { color: colors.text }]}>
            {displayName}
          </Text>
          <Text style={[styles.identityRole, { color: colors.textSecondary }]}>
            {roleName}
          </Text>
        </View>

        {/* ===== ACTIVE CONTEXT CARD (read-only table) ===== */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            ACTIVE CONTEXT
          </Text>
          <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
            <ContextRow label="Mode" value={modeName} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <ContextRow label="Organization" value={orgName} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <ContextRow label="Workspace" value={workspace} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <ContextRow label="Role" value={roleName} colors={colors} />
            <View style={[styles.rowDivider, { backgroundColor: colors.divider }]} />
            <ContextRow label="Access" value={tierLabel} colors={colors} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// =============================================
// CONTEXT ROW (Read-only, no tap action)
// =============================================
function ContextRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.contextRow}>
      <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.contextValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },

  // Identity Section
  identitySection: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: Spacing.lg,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  identityName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  identityRole: {
    fontSize: 15,
  },

  // Section
  section: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Context Card
  contextCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  contextLabel: {
    fontSize: 15,
  },
  contextValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },
});
