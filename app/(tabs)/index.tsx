/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext, useMode } from '@/context/app-context';

// Mock data imports
import { PROGRAMS, INSTITUTION } from '@/data/mock-sports';
import { COMPANY_METRICS, formatCurrency } from '@/data/mock-enterprise';
import { CAMPUSES, MESSAGES } from '@/data/mock-church';
import { getCurrentTerm, getUpcomingEvents, INSTITUTIONAL_METRICS } from '@/data/mock-education';

// =============================================================================
// SHARED COMPONENTS
// =============================================================================

interface QuickStatProps {
  label: string;
  value: string;
  icon: IconSymbolName;
  color: string;
  colors: typeof Colors.light;
}

function QuickStat({ label, value, icon, color, colors }: QuickStatProps) {
  return (
    <View style={[styles.quickStat, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.quickStatIcon, { backgroundColor: color + '15' }]}>
        <IconSymbol name={icon} size={20} color={color} />
      </View>
      <ThemedText style={[styles.quickStatValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.quickStatLabel, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: IconSymbolName;
  color: string;
  colors: typeof Colors.light;
  onPress: () => void;
}

function ActionCard({ title, subtitle, icon, color, colors, onPress }: ActionCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionCard,
        { backgroundColor: colors.card, borderColor: colors.border },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <View style={[styles.actionIcon, { backgroundColor: color + '15' }]}>
        <IconSymbol name={icon} size={22} color={color} />
      </View>
      <View style={styles.actionContent}>
        <ThemedText style={styles.actionTitle}>{title}</ThemedText>
        <ThemedText style={[styles.actionSubtitle, { color: colors.textSecondary }]}>
          {subtitle}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={16} color={colors.textTertiary} />
    </Pressable>
  );
}

// =============================================================================
// SPORTS HOME (v1.1 Spec - Team Hub Home / Coach HQ)
// Mental model: Video-game hub for a coach.
// NOT a SaaS dashboard. NOT a chatbot entry point.
// Shows: state, identity, and motion — nothing else.
// =============================================================================

// Team Hub Tabs - ESPN-style header row (appears ONLY on Sports Home)
const TEAM_HUB_TABS = [
  { id: 'home', label: 'Home', route: null }, // Stay on home
  { id: 'roster', label: 'Roster', route: '/coach/roster' },
  { id: 'stats', label: 'Stats', route: '/coach/stats' },
  { id: 'schedule', label: 'Schedule', route: '/coach/schedule' },
  { id: 'depth-chart', label: 'Depth Chart', route: '/coach/depth-chart' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Program Context', route: '/coach/program-context' },
  { id: 'recruiting', label: 'Recruiting', route: '/coach/recruiting' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];

// Demo data for v1.1
const DEMO_TEAM_STATE = {
  rating: 84,
  offensiveSystem: 'Spread PnR',
  defensiveSystem: 'Pressure Man',
  tempo: 'Fast',
  record: '6–6',
  confStanding: '4th',
};

// Program Context storage key (shared with program-context.tsx)
const PROGRAM_CONTEXT_KEY = 'kx:programContext';

// Offensive system labels for display
const OFFENSIVE_SYSTEM_LABELS: Record<string, string> = {
  'spread-pnr': 'Spread Pick-and-Roll',
  '5-out': '5-Out Motion',
  'pace-space': 'Pace & Space',
  'motion': 'Motion / Read & React',
  'dribble-drive': 'Dribble Drive',
  'princeton': 'Princeton',
  'post-centric': 'Post-Centric / Inside-Out',
  'moreyball': 'Moreyball',
  'heliocentric': 'Heliocentric',
};

// Defensive system labels for display
const DEFENSIVE_SYSTEM_LABELS: Record<string, string> = {
  'containment': 'Containment Man',
  'pack-line': 'Pack Line',
  'pressure-man': 'Pressure Man / Denial',
  'switch': 'Switch Everything',
  'ice': 'ICE / No-Middle',
  'zone': 'Zone (Structured)',
  'matchup-zone': 'Matchup Zone / Hybrid',
  'press': 'Press / Pressure Defense',
};

// Default program context (matches program-context.tsx defaults)
const DEFAULT_PROGRAM_CONTEXT = {
  scholarships: 13,
  nilBudget: 150000,
  offensiveSystem: 'spread-pnr',
  defensiveSystem: 'pressure-man',
  tempo: 'Fast',
};

// Recent changes: evaluation, roster, or decision activity
const DEMO_RECENT_CHANGES = [
  { id: '1', text: 'KR ↑ +1 since last eval' },
  { id: '2', text: 'Rotation shift: 2 players moved into core rotation' },
  { id: '3', text: 'Recruit added to board' },
  { id: '4', text: 'New film added: vs Missouri Western' },
  { id: '5', text: 'Injury status updated' },
];

// Team Hub Tabs Component (ESPN-style header row)
function TeamHubTabs({
  colors,
  onTabPress,
}: {
  colors: typeof Colors.light;
  onTabPress: (route: string | null) => void;
}) {
  return (
    <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.hubTabsContent}
      >
        {TEAM_HUB_TABS.map((tab, index) => {
          // Home tab is always "active" on this screen
          const isActive = tab.id === 'home';
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.hubTab,
                isActive && [styles.hubTabActive, { borderBottomColor: colors.text }],
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onTabPress(tab.route);
              }}
            >
              <ThemedText
                style={[
                  styles.hubTabLabel,
                  { color: isActive ? colors.text : colors.textTertiary },
                  isActive && styles.hubTabLabelActive,
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function SportsHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  // Program Context state (loaded from AsyncStorage)
  const [programContext, setProgramContext] = useState(DEFAULT_PROGRAM_CONTEXT);

  // Load program context on focus (so it updates after editing)
  useFocusEffect(
    useCallback(() => {
      const loadContext = async () => {
        try {
          const saved = await AsyncStorage.getItem(PROGRAM_CONTEXT_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            setProgramContext({
              scholarships: parsed.scholarships ?? DEFAULT_PROGRAM_CONTEXT.scholarships,
              nilBudget: parsed.nilBudget ?? DEFAULT_PROGRAM_CONTEXT.nilBudget,
              offensiveSystem: parsed.offensiveSystem ?? DEFAULT_PROGRAM_CONTEXT.offensiveSystem,
              defensiveSystem: parsed.defensiveSystem ?? DEFAULT_PROGRAM_CONTEXT.defensiveSystem,
              tempo: parsed.tempo ?? DEFAULT_PROGRAM_CONTEXT.tempo,
            });
          }
        } catch (e) {
          console.error('Failed to load program context:', e);
        }
      };
      loadContext();
    }, [])
  );

  // Format currency for display
  const formatCurrencyValue = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleTabPress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
    // If route is null (Home tab), stay on current screen
  };

  return (
    <>
      {/* ===== ESPN-STYLE HEADER TABS (only on Sports Home) ===== */}
      <TeamHubTabs colors={colors} onTabPress={handleTabPress} />

      {/* ===== 1) TEAM IDENTITY BLOCK (centered) ===== */}
      <View style={styles.teamStateSection}>
        {/* Team Logo Placeholder */}
        <View style={[styles.teamLogo, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={[styles.teamLogoText, { color: colors.textSecondary }]}>
            LU
          </ThemedText>
        </View>

        {/* Big Rating */}
        <ThemedText style={styles.ratingLine}>
          {DEMO_TEAM_STATE.rating}KR
        </ThemedText>

        {/* Meta Line */}
        <ThemedText style={[styles.metaLine, { color: colors.textSecondary }]}>
          Independent · SWS · 25–26
        </ThemedText>

        {/* Record Line */}
        <ThemedText style={[styles.recordLine, { color: colors.textTertiary }]}>
          Overall 9–8 · Conf 7–0 · Place 1st
        </ThemedText>
      </View>

      {/* ===== 2) PROGRAM CONTEXT MIRROR (read-only) ===== */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        PROGRAM CONTEXT
      </ThemedText>
      <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
        <View style={styles.contextRow}>
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Scholarships
          </ThemedText>
          <ThemedText style={[styles.contextValue, { color: colors.text }]}>
            {programContext.scholarships}
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.contextRow}>
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            NIL Budget
          </ThemedText>
          <ThemedText style={[styles.contextValue, { color: colors.text }]}>
            {formatCurrencyValue(programContext.nilBudget)}
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.contextRow}>
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Offensive System
          </ThemedText>
          <ThemedText style={[styles.contextValue, { color: colors.text }]}>
            {OFFENSIVE_SYSTEM_LABELS[programContext.offensiveSystem] || programContext.offensiveSystem}
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.contextRow}>
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Defensive System
          </ThemedText>
          <ThemedText style={[styles.contextValue, { color: colors.text }]}>
            {DEFENSIVE_SYSTEM_LABELS[programContext.defensiveSystem] || programContext.defensiveSystem}
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        <View style={styles.contextRow}>
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Tempo
          </ThemedText>
          <ThemedText style={[styles.contextValue, { color: colors.text }]}>
            {programContext.tempo}
          </ThemedText>
        </View>
      </View>

      {/* Edit Program Context CTA */}
      <Pressable
        style={({ pressed }) => [
          styles.editContextButton,
          { backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/coach/program-context' as any);
        }}
      >
        <ThemedText style={[styles.editContextText, { color: colors.tint }]}>
          Edit Program Context
        </ThemedText>
        <IconSymbol name="chevron.right" size={14} color={colors.tint} />
      </Pressable>

      {/* ===== 3) RECENT CHANGE (alive system feed) ===== */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        RECENT CHANGE
      </ThemedText>
      <View style={[styles.changesCard, { backgroundColor: colors.backgroundSecondary }]}>
        {DEMO_RECENT_CHANGES.map((change, index) => (
          <View key={change.id}>
            {index > 0 && (
              <View style={[styles.changeDivider, { backgroundColor: colors.divider }]} />
            )}
            <View style={styles.changeRow}>
              <ThemedText style={styles.changeText}>{change.text}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

// =============================================================================
// ENTERPRISE HOME
// =============================================================================

function EnterpriseHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.enterprise;
  const { state } = useAppContext();

  const roleLabel = state.operatingRole === 'founder' ? 'Founder' :
                    state.operatingRole === 'investor' ? 'Investor' : 'Viewer';

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Welcome back,</ThemedText>
        <ThemedText style={styles.welcomeName}>{roleLabel}</ThemedText>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="MRR"
          value={formatCurrency(COMPANY_METRICS.mrr)}
          icon="chart.bar.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Customers"
          value={COMPANY_METRICS.customers.toString()}
          icon="person.3.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Runway"
          value={`${COMPANY_METRICS.runway}mo`}
          icon="calendar"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        DATA ROOM
      </ThemedText>
      <ActionCard
        title="Documents"
        subtitle="Investor materials and governance"
        icon="doc.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/documents');
        }}
      />
      <ActionCard
        title="Governance"
        subtitle="Board and advisors"
        icon="person.3.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/governance');
        }}
      />
      <ActionCard
        title="Run Scenario"
        subtitle="AI-powered analysis"
        icon="sparkles"
        color={Brand.nexus}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/nexus');
        }}
      />

      {/* Company Info */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        COMPANY STATUS
      </ThemedText>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Stage</ThemedText>
          <ThemedText style={styles.infoValue}>Pre-Seed</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Raised</ThemedText>
          <ThemedText style={styles.infoValue}>{formatCurrency(COMPANY_METRICS.raised)}</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Team</ThemedText>
          <ThemedText style={styles.infoValue}>{COMPANY_METRICS.teamSize} members</ThemedText>
        </View>
      </View>
    </>
  );
}

// =============================================================================
// CHURCH HOME
// =============================================================================

function ChurchHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.church;

  const mainCampus = CAMPUSES[0];
  const nextService = mainCampus?.serviceTimes[0];

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Welcome home,</ThemedText>
        <ThemedText style={styles.welcomeName}>Friend</ThemedText>
      </View>

      {/* Next Service */}
      <View style={[styles.highlightCard, { backgroundColor: modeColors.primary }]}>
        <IconSymbol name="calendar" size={24} color="#FFFFFF" />
        <View style={styles.highlightContent}>
          <ThemedText style={styles.highlightTitle}>Next Service</ThemedText>
          <ThemedText style={styles.highlightSubtitle}>
            {nextService ? `${nextService.day} at ${nextService.time}` : 'Sunday at 10:00 AM'}
          </ThemedText>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="Campuses"
          value={CAMPUSES.length.toString()}
          icon="building.2.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Messages"
          value={MESSAGES.length.toString()}
          icon="play.circle.fill"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </ThemedText>
      <ActionCard
        title="Watch Messages"
        subtitle="Recent sermons and teachings"
        icon="play.circle.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/messages');
        }}
      />
      <ActionCard
        title="Give"
        subtitle="Tithes, offerings, and donations"
        icon="heart.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/giving');
        }}
      />
      <ActionCard
        title="Connect"
        subtitle="Get involved in our community"
        icon="person.badge.plus"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/connect');
        }}
      />

      {/* Campus Info */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        MY CAMPUS
      </ThemedText>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Campus</ThemedText>
          <ThemedText style={styles.infoValue}>{mainCampus?.shortName || 'ICCLA'}</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Location</ThemedText>
          <ThemedText style={styles.infoValue}>{mainCampus?.location || 'Los Angeles, CA'}</ThemedText>
        </View>
      </View>
    </>
  );
}

// =============================================================================
// EDUCATION HOME
// =============================================================================

function EducationHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.education;

  const currentTerm = getCurrentTerm();
  const upcomingEvents = getUpcomingEvents(2);

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Good morning,</ThemedText>
        <ThemedText style={styles.welcomeName}>Dr. Hart</ThemedText>
      </View>

      {/* Current Term */}
      <View style={[styles.highlightCard, { backgroundColor: modeColors.primary }]}>
        <IconSymbol name="graduationcap.fill" size={24} color="#FFFFFF" />
        <View style={styles.highlightContent}>
          <ThemedText style={styles.highlightTitle}>{currentTerm?.name || 'Spring 2026'}</ThemedText>
          <ThemedText style={styles.highlightSubtitle}>Current Term</ThemedText>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="Enrollment"
          value={INSTITUTIONAL_METRICS.enrollment.total.toString()}
          icon="person.3.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Programs"
          value={INSTITUTIONAL_METRICS.academics.programs.toString()}
          icon="rectangle.stack.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Faculty"
          value={INSTITUTIONAL_METRICS.academics.facultyCount.toString()}
          icon="person.fill"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            UPCOMING
          </ThemedText>
          {upcomingEvents.map((event) => (
            <View
              key={event.id}
              style={[styles.eventRow, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <View style={[styles.eventDate, { backgroundColor: modeColors.primary + '15' }]}>
                <ThemedText style={[styles.eventMonth, { color: modeColors.primary }]}>
                  {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                </ThemedText>
                <ThemedText style={[styles.eventDay, { color: modeColors.primary }]}>
                  {event.date.getDate()}
                </ThemedText>
              </View>
              <View style={styles.eventInfo}>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                {event.description && (
                  <ThemedText style={[styles.eventDesc, { color: colors.textSecondary }]}>
                    {event.description}
                  </ThemedText>
                )}
              </View>
            </View>
          ))}
        </>
      )}

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </ThemedText>
      <ActionCard
        title="Academic Calendar"
        subtitle="View full schedule"
        icon="calendar"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/schedule');
        }}
      />
      <ActionCard
        title="Institutional Metrics"
        subtitle="Enrollment and outcomes"
        icon="chart.bar.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/metrics');
        }}
      />
      <ActionCard
        title="Archive"
        subtitle="Past academic years"
        icon="archivebox.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/archive');
        }}
      />
    </>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = useMode();

  const renderModeContent = () => {
    switch (mode) {
      case 'sports':
        return <SportsHome />;
      case 'enterprise':
        return <EnterpriseHome />;
      case 'church':
        return <ChurchHome />;
      case 'education':
        return <EducationHome />;
      default:
        return <SportsHome />;
    }
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderModeContent()}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Welcome
  welcomeSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  welcomeGreeting: {
    fontSize: 16,
    opacity: 0.7,
  },
  welcomeName: {
    fontSize: 28,
    fontWeight: '700',
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  quickStat: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  quickStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Section Title
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },

  // ===== SPORTS HOME STYLES (v1.1) =====

  // Team Hub Tabs (ESPN-style header row)
  hubTabsContainer: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginHorizontal: -Spacing.md,
  },
  hubTabsContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.lg,
  },
  hubTab: {
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  hubTabActive: {
    borderBottomWidth: 2,
  },
  hubTabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  hubTabLabelActive: {
    fontWeight: '600',
  },

  // Team state: centered system readout, open, generous whitespace
  teamStateSection: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  teamLogo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  teamLogoText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ratingLine: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 56,
    textAlign: 'center',
  },
  metaLine: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    lineHeight: 20,
    textAlign: 'center',
  },
  recordLine: {
    fontSize: 13,
    fontWeight: '400',
    marginTop: 4,
    lineHeight: 18,
    textAlign: 'center',
  },

  // Program Context Card
  contextCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  contextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 12,
  },
  contextLabel: {
    fontSize: 14,
    fontWeight: '500',
    flexShrink: 0,
  },
  contextValue: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Edit Program Context CTA
  editContextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    gap: 6,
  },
  editContextText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Changes Card
  changesCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  changeRow: {
    paddingVertical: 14,
    paddingHorizontal: Spacing.md,
  },
  changeText: {
    fontSize: 15,
    fontWeight: '400',
  },
  changeDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Action Card
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Info Card
  infoCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Highlight Card
  highlightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  highlightContent: {
    marginLeft: Spacing.sm,
  },
  highlightTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  highlightSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 2,
  },

  // Event Row
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  eventDate: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  eventDesc: {
    fontSize: 13,
    marginTop: 2,
  },
});
