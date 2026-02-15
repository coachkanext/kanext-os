/**
 * National Player Profile
 * Career view for any player in the national pool (not just roster players).
 * Includes Context Strip showing current team and Action Panel for recruiting.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, SymbolViewProps } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getNationalPlayerById,
  getRecruitingTargetForPlayer,
  getDivisionLabel,
  getPositionName,
  getClassYearName,
  getRecruitingStatusLabel,
  getRecruitingStatusColor,
  formatStatValue,
  formatPercentage,
  INSTITUTION,
  type NationalPlayer,
  type RecruitingTarget,
} from '@/data/mock-sports';

// =============================================================================
// COMPONENTS
// =============================================================================

interface BackButtonProps {
  onPress: () => void;
  colors: typeof Colors.light;
}

function BackButton({ onPress, colors }: BackButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.backButton, pressed && { opacity: 0.7 }]}
      onPress={onPress}
    >
      <IconSymbol name="chevron.left" size={20} color={colors.tint} />
      <ThemedText style={[styles.backButtonText, { color: colors.tint }]}>
        Back
      </ThemedText>
    </Pressable>
  );
}

interface ContextStripProps {
  player: NationalPlayer;
  colors: typeof Colors.light;
  accentColor: string;
}

function ContextStrip({ player, colors, accentColor }: ContextStripProps) {
  return (
    <View style={[styles.contextStrip, { backgroundColor: accentColor + '10', borderColor: accentColor + '30' }]}>
      <IconSymbol name="building.2.fill" size={14} color={accentColor} />
      <ThemedText style={[styles.contextText, { color: accentColor }]}>
        Currently at {player.currentTeam} ({getDivisionLabel(player.currentDivision)})
      </ThemedText>
      {player.transferStatus && (
        <View style={[styles.transferBadge, { backgroundColor: accentColor }]}>
          <ThemedText style={styles.transferBadgeText}>
            {player.transferStatus === 'available' ? 'In Portal' :
             player.transferStatus === 'exploring' ? 'Exploring' : 'Committed'}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  isHighlight?: boolean;
  colors: typeof Colors.light;
  accentColor: string;
}

function StatBox({ label, value, isHighlight, colors, accentColor }: StatBoxProps) {
  return (
    <View style={styles.statBox}>
      <ThemedText style={[styles.statValue, isHighlight && { color: accentColor }]}>
        {value}
      </ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textTertiary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

interface ActionButtonProps {
  icon: SymbolViewProps['name'];
  label: string;
  onPress: () => void;
  variant: 'primary' | 'secondary';
  colors: typeof Colors.light;
  accentColor: string;
}

function ActionButton({ icon, label, onPress, variant, colors, accentColor }: ActionButtonProps) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      style={({ pressed }) => [
        styles.actionButton,
        {
          backgroundColor: isPrimary ? accentColor : colors.backgroundTertiary,
          borderColor: isPrimary ? accentColor : colors.border,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={onPress}
    >
      <IconSymbol name={icon} size={16} color={isPrimary ? '#FFFFFF' : colors.text} />
      <ThemedText
        style={[
          styles.actionButtonText,
          { color: isPrimary ? '#FFFFFF' : colors.text },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface RecruitingStatusCardProps {
  target: RecruitingTarget;
  colors: typeof Colors.light;
}

function RecruitingStatusCard({ target, colors }: RecruitingStatusCardProps) {
  const statusColor = getRecruitingStatusColor(target.status);

  return (
    <View style={[styles.recruitingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.recruitingHeader}>
        <View style={styles.recruitingHeaderLeft}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.statusBadgeText}>
              {getRecruitingStatusLabel(target.status)}
            </ThemedText>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[styles.priorityBadgeText, { color: colors.text }]}>
              Priority {target.priority}
            </ThemedText>
          </View>
        </View>
        {target.fitPercent && (
          <ThemedText style={[styles.fitPercent, { color: Colors.light.success }]}>
            {target.fitPercent}% Fit
          </ThemedText>
        )}
      </View>

      {target.notes && (
        <ThemedText style={[styles.recruitingNotes, { color: colors.textSecondary }]}>
          {target.notes}
        </ThemedText>
      )}

      {target.nextStep && (
        <View style={[styles.nextStepRow, { borderTopColor: colors.divider }]}>
          <IconSymbol name="arrow.right.circle.fill" size={14} color={colors.tint} />
          <ThemedText style={[styles.nextStepText, { color: colors.text }]}>
            {target.nextStep}
          </ThemedText>
          {target.nextStepDate && (
            <ThemedText style={[styles.nextStepDate, { color: colors.textTertiary }]}>
              {target.nextStepDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </ThemedText>
          )}
        </View>
      )}

      <View style={[styles.recruitingFooter, { borderTopColor: colors.divider }]}>
        {target.recruiter && (
          <View style={styles.footerItem}>
            <ThemedText style={[styles.footerLabel, { color: colors.textTertiary }]}>Recruiter</ThemedText>
            <ThemedText style={styles.footerValue}>{target.recruiter}</ThemedText>
          </View>
        )}
        {target.plannedScholarship !== undefined && (
          <View style={styles.footerItem}>
            <ThemedText style={[styles.footerLabel, { color: colors.textTertiary }]}>Scholarship</ThemedText>
            <ThemedText style={styles.footerValue}>{target.plannedScholarship}%</ThemedText>
          </View>
        )}
        {target.plannedNil !== undefined && (
          <View style={styles.footerItem}>
            <ThemedText style={[styles.footerLabel, { color: colors.textTertiary }]}>NIL</ThemedText>
            <ThemedText style={styles.footerValue}>${target.plannedNil.toLocaleString()}</ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function NationalPlayerProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { playerId } = useLocalSearchParams<{ playerId: string }>();

  const modeColors = ModeColors.sports;
  const player = getNationalPlayerById(playerId);
  const recruitingTarget = getRecruitingTargetForPlayer(playerId);

  if (!player) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <BackButton onPress={() => router.back()} colors={colors} />
        </View>
        <View style={styles.errorState}>
          <ThemedText style={[styles.errorText, { color: colors.textSecondary }]}>
            Player not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handleAddToBoard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In real app, this would open a form to add player to recruiting board
    console.log('Add to board:', player.id);
  };

  const handleAddToRoster = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In real app, this would open roster sandbox
    console.log('Add to roster sandbox:', player.id);
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => router.back()} colors={colors} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Player Header */}
        <View style={styles.playerHeader}>
          <View style={[styles.avatarPlaceholder, { backgroundColor: modeColors.primary }]}>
            <ThemedText style={styles.avatarText}>
              {player.name.split(' ').map((n) => n[0]).join('')}
            </ThemedText>
          </View>
          <View style={styles.playerHeaderInfo}>
            <ThemedText type="title" style={styles.playerName}>
              {player.name}
            </ThemedText>
            <ThemedText style={[styles.playerPosition, { color: colors.textSecondary }]}>
              {getPositionName(player.position)} • {player.height} • {player.weight}
            </ThemedText>
            <View style={styles.playerMeta}>
              <View style={[styles.classBadge, { backgroundColor: modeColors.primary + '20' }]}>
                <ThemedText style={[styles.classBadgeText, { color: modeColors.primary }]}>
                  {getClassYearName(player.classYear)}
                </ThemedText>
              </View>
              <ThemedText style={[styles.hometown, { color: colors.textTertiary }]}>
                {player.hometown}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Context Strip */}
        <ContextStrip player={player} colors={colors} accentColor={modeColors.primary} />

        {/* Current Season Stats */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Current Season Stats
          </ThemedText>
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statsRow}>
              <StatBox
                label="PPG"
                value={formatStatValue(player.stats.ppg)}
                isHighlight
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="RPG"
                value={formatStatValue(player.stats.rpg)}
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="APG"
                value={formatStatValue(player.stats.apg)}
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="MPG"
                value={formatStatValue(player.stats.mpg)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
            <View style={[styles.statsDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statsRow}>
              <StatBox
                label="FG%"
                value={formatPercentage(player.stats.fgPct)}
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="3P%"
                value={formatPercentage(player.stats.threePct)}
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="FT%"
                value={formatPercentage(player.stats.ftPct)}
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="GP"
                value={player.stats.gp.toString()}
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          </View>
        </View>

        {/* Defensive Stats */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Defensive Stats
          </ThemedText>
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.statsRow}>
              <StatBox
                label="SPG"
                value={formatStatValue(player.stats.spg)}
                colors={colors}
                accentColor={modeColors.primary}
              />
              <StatBox
                label="BPG"
                value={formatStatValue(player.stats.bpg)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          </View>
        </View>

        {/* Recruiting Status (if on board) */}
        {recruitingTarget && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              Recruiting Status
            </ThemedText>
            <RecruitingStatusCard target={recruitingTarget} colors={colors} />
          </View>
        )}

        {/* Action Panel */}
        <View style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            Actions
          </ThemedText>
          <View style={styles.actionPanel}>
            {!recruitingTarget ? (
              <ActionButton
                icon="plus.circle.fill"
                label="Add to Recruiting Board"
                onPress={handleAddToBoard}
                variant="primary"
                colors={colors}
                accentColor={modeColors.primary}
              />
            ) : (
              <ActionButton
                icon="person.badge.plus"
                label="Add to Roster Sandbox"
                onPress={handleAddToRoster}
                variant="primary"
                colors={colors}
                accentColor={modeColors.primary}
              />
            )}
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    marginLeft: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 16,
  },

  // Player Header
  playerHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  avatarPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  playerHeaderInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 24,
    fontWeight: '700',
  },
  playerPosition: {
    fontSize: 14,
    marginTop: 2,
  },
  playerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  classBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  classBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  hometown: {
    fontSize: 13,
  },

  // Context Strip
  contextStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  contextText: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  transferBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  transferBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
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

  // Stats Card
  statsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statsDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.md,
  },
  statBox: {
    alignItems: 'center',
    minWidth: 60,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Recruiting Card
  recruitingCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recruitingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  recruitingHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  fitPercent: {
    fontSize: 14,
    fontWeight: '700',
  },
  recruitingNotes: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  nextStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.xs,
  },
  nextStepText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  nextStepDate: {
    fontSize: 12,
  },
  recruitingFooter: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    padding: Spacing.md,
    gap: Spacing.lg,
  },
  footerItem: {},
  footerLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  footerValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },

  // Action Panel
  actionPanel: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
