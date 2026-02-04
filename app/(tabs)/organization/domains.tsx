/**
 * Domains Screen
 * KaNeXT product verticals and operational modes.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import { DOMAINS, KANEXT_ORGANIZATION, getDomainStatusColor } from '@/data/mock-enterprise';
import type { Domain, Mode } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface DomainCardProps {
  domain: Domain;
  isCurrentMode: boolean;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}

function DomainCard({ domain, isCurrentMode, colors, accentColor, onPress }: DomainCardProps) {
  const statusColor = getDomainStatusColor(domain.status);
  const modeColors = ModeColors[domain.mode];

  return (
    <Pressable
      style={({ pressed }) => [
        styles.domainCard,
        {
          backgroundColor: colors.card,
          borderColor: isCurrentMode ? modeColors.primary : colors.border,
          borderWidth: isCurrentMode ? 2 : 1,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      {isCurrentMode && (
        <View style={[styles.currentBadge, { backgroundColor: modeColors.primary }]}>
          <ThemedText style={styles.currentBadgeText}>Current</ThemedText>
        </View>
      )}
      <View style={styles.domainHeader}>
        <View style={[styles.domainIcon, { backgroundColor: modeColors.primary + '15' }]}>
          <IconSymbol name={domain.icon as IconSymbolName} size={28} color={modeColors.primary} />
        </View>
        <View style={styles.domainHeaderInfo}>
          <ThemedText style={styles.domainName}>{domain.name}</ThemedText>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <ThemedText style={[styles.statusText, { color: colors.textSecondary }]}>
              {domain.status.charAt(0).toUpperCase() + domain.status.slice(1)}
            </ThemedText>
          </View>
        </View>
      </View>
      <ThemedText style={[styles.domainDesc, { color: colors.textSecondary }]}>
        {domain.description}
      </ThemedText>
      {domain.status === 'active' && (
        <View style={styles.domainFooter}>
          <ThemedText style={[styles.switchText, { color: modeColors.primary }]}>
            Switch to {domain.name} Mode
          </ThemedText>
          <IconSymbol name="arrow.right" size={14} color={modeColors.primary} />
        </View>
      )}
    </Pressable>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function DomainsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { state, setMode } = useAppContext();
  const modeColors = ModeColors.enterprise;

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleDomainPress = (domain: Domain) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (domain.status === 'active') {
      setMode(domain.mode);
      router.push('/');
    }
  };

  // Separate active and upcoming domains
  const activeDomains = DOMAINS.filter((d) => d.status === 'active');
  const upcomingDomains = DOMAINS.filter((d) => d.status !== 'active');

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Domains
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            KaNeXT product verticals
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Overview */}
        <View style={[styles.overviewCard, { backgroundColor: modeColors.primary }]}>
          <IconSymbol name="square.grid.2x2.fill" size={32} color="#FFFFFF" />
          <ThemedText style={styles.overviewTitle}>Multi-Domain Platform</ThemedText>
          <ThemedText style={styles.overviewText}>
            KaNeXT OS serves {KANEXT_ORGANIZATION.operationalScope.length} distinct verticals,
            each with purpose-built interfaces and domain-specific intelligence.
          </ThemedText>
        </View>

        {/* Active Domains */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Active Domains
          </ThemedText>
          <View style={styles.domainsList}>
            {activeDomains.map((domain) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                isCurrentMode={domain.mode === state.mode}
                colors={colors}
                accentColor={modeColors.primary}
                onPress={() => handleDomainPress(domain)}
              />
            ))}
          </View>
        </View>

        {/* Upcoming Domains */}
        {upcomingDomains.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Coming Soon
            </ThemedText>
            <View style={styles.domainsList}>
              {upcomingDomains.map((domain) => (
                <DomainCard
                  key={domain.id}
                  domain={domain}
                  isCurrentMode={false}
                  colors={colors}
                  accentColor={modeColors.primary}
                  onPress={() => handleDomainPress(domain)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Scope */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Operational Scope
          </ThemedText>
          <View style={[styles.scopeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {KANEXT_ORGANIZATION.operationalScope.map((scope, index) => (
              <View key={scope} style={styles.scopeItem}>
                <View style={[styles.scopeDot, { backgroundColor: modeColors.primary }]} />
                <ThemedText style={styles.scopeText}>{scope}</ThemedText>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Overview
  overviewCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  overviewTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginTop: Spacing.sm,
  },
  overviewText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 20,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Domain Cards
  domainsList: {
    gap: Spacing.sm,
  },
  domainCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  currentBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderBottomLeftRadius: BorderRadius.md,
  },
  currentBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  domainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  domainIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  domainHeaderInfo: {
    flex: 1,
  },
  domainName: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
  },
  domainDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  domainFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    gap: 4,
  },
  switchText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Scope
  scopeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  scopeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  scopeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.sm,
  },
  scopeText: {
    fontSize: 15,
  },
});
