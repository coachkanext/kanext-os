/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
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
// SPORTS HOME
// =============================================================================

function SportsHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const modeColors = ModeColors.sports;
  const { state } = useAppContext();

  const varsity = PROGRAMS.find((p) => p.level === 'varsity');
  const record = varsity?.record.overall;

  return (
    <>
      {/* Welcome */}
      <View style={styles.welcomeSection}>
        <ThemedText style={styles.welcomeGreeting}>Good afternoon,</ThemedText>
        <ThemedText style={styles.welcomeName}>Coach</ThemedText>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <QuickStat
          label="Record"
          value={record ? `${record.wins}-${record.losses}` : '0-0'}
          icon="sportscourt.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Players"
          value={varsity?.roster.length.toString() || '0'}
          icon="person.3.fill"
          color={modeColors.primary}
          colors={colors}
        />
        <QuickStat
          label="Programs"
          value={PROGRAMS.length.toString()}
          icon="rectangle.stack.fill"
          color={modeColors.primary}
          colors={colors}
        />
      </View>

      {/* Quick Actions */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        QUICK ACTIONS
      </ThemedText>
      <ActionCard
        title="View Roster"
        subtitle="Varsity • 15 players"
        icon="person.3.fill"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/programs/varsity');
        }}
      />
      <ActionCard
        title="Recruiting Board"
        subtitle="Track prospects and pipeline"
        icon="person.badge.plus"
        color={modeColors.primary}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/organization/recruiting');
        }}
      />
      <ActionCard
        title="Ask Nexus"
        subtitle="Get AI-powered insights"
        icon="sparkles"
        color={Brand.nexus}
        colors={colors}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push('/nexus');
        }}
      />

      {/* Season Info */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        CURRENT SEASON
      </ThemedText>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Season</ThemedText>
          <ThemedText style={styles.infoValue}>{state.cycle?.name || '2025-26'}</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Conference</ThemedText>
          <ThemedText style={styles.infoValue}>{INSTITUTION.conference}</ThemedText>
        </View>
        <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.infoRow}>
          <ThemedText style={[styles.infoLabel, { color: colors.textSecondary }]}>Division</ThemedText>
          <ThemedText style={styles.infoValue}>{INSTITUTION.division}</ThemedText>
        </View>
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
