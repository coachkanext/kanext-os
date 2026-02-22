/**
 * Full Simulation View Overlay
 * Detailed simulation results with drivers, player impact, and box score.
 */

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { SimulationResult, PlayerImpact } from '@/types';
import {
  getConfidenceColor,
  getVolatilityColor,
  getWinProbabilityColor,
  getConfidenceLabel,
  getVolatilityLabel,
  formatMargin,
} from '@/data/mock-simulations';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const OVERLAY_WIDTH = Math.min(440, SCREEN_WIDTH * 0.95);

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  valueColor?: string;
  large?: boolean;
  colors: typeof Colors.light;
}

function StatCard({ label, value, sublabel, valueColor, large, colors }: StatCardProps) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.backgroundSecondary }]}>
      <ThemedText style={[styles.statCardLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText
        style={[
          large ? styles.statCardValueLarge : styles.statCardValue,
          valueColor ? { color: valueColor } : undefined,
        ]}
      >
        {value}
      </ThemedText>
      {sublabel && (
        <ThemedText style={[styles.statCardSublabel, { color: colors.textTertiary }]}>
          {sublabel}
        </ThemedText>
      )}
    </View>
  );
}

interface DriverRowProps {
  driver: string;
  index: number;
  colors: typeof Colors.light;
  accentColor: string;
}

function DriverRow({ driver, index, colors, accentColor }: DriverRowProps) {
  return (
    <View style={styles.driverRow}>
      <View style={[styles.driverBullet, { backgroundColor: accentColor }]}>
        <ThemedText style={styles.driverBulletText}>{index + 1}</ThemedText>
      </View>
      <ThemedText style={[styles.driverText, { color: colors.text }]}>{driver}</ThemedText>
    </View>
  );
}

interface PlayerImpactRowProps {
  player: PlayerImpact;
  colors: typeof Colors.light;
  accentColor: string;
}

function PlayerImpactRow({ player, colors, accentColor }: PlayerImpactRowProps) {
  const impactColor =
    player.impactRating >= 70 ? '#FFFFFF' : player.impactRating >= 50 ? '#A1A1AA' : '#A1A1AA';

  return (
    <View style={[styles.playerRow, { borderBottomColor: colors.border }]}>
      <View style={styles.playerInfo}>
        <ThemedText style={styles.playerName}>{player.playerName}</ThemedText>
        <ThemedText style={[styles.playerPosition, { color: colors.textSecondary }]}>
          {player.position}
        </ThemedText>
      </View>
      <View style={styles.playerStats}>
        <View style={styles.playerStat}>
          <ThemedText style={styles.playerStatValue}>
            {player.projectedPoints.toFixed(1)}
          </ThemedText>
          <ThemedText style={[styles.playerStatLabel, { color: colors.textTertiary }]}>
            PTS
          </ThemedText>
        </View>
        <View style={styles.playerStat}>
          <ThemedText style={styles.playerStatValue}>
            {player.projectedRebounds.toFixed(1)}
          </ThemedText>
          <ThemedText style={[styles.playerStatLabel, { color: colors.textTertiary }]}>
            REB
          </ThemedText>
        </View>
        <View style={styles.playerStat}>
          <ThemedText style={styles.playerStatValue}>
            {player.projectedAssists.toFixed(1)}
          </ThemedText>
          <ThemedText style={[styles.playerStatLabel, { color: colors.textTertiary }]}>
            AST
          </ThemedText>
        </View>
      </View>
      <View style={[styles.impactBadge, { backgroundColor: impactColor + '20' }]}>
        <ThemedText style={[styles.impactValue, { color: impactColor }]}>
          {player.impactRating}
        </ThemedText>
      </View>
    </View>
  );
}

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  colors: typeof Colors.light;
}

function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  colors,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <View style={styles.collapsibleSection}>
      <Pressable
        style={[styles.collapsibleHeader, { borderBottomColor: colors.border }]}
        onPress={() => setExpanded(!expanded)}
      >
        <ThemedText style={styles.collapsibleTitle}>{title}</ThemedText>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={16}
          color={colors.textSecondary}
        />
      </Pressable>
      {expanded && <View style={styles.collapsibleContent}>{children}</View>}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface SimulationOverlayProps {
  simulation: SimulationResult | null;
  visible: boolean;
  onClose: () => void;
  onSave?: (simulation: SimulationResult) => void;
  onRerun?: (simulation: SimulationResult) => void;
}

export function SimulationOverlay({
  simulation,
  visible,
  onClose,
  onSave,
  onRerun,
}: SimulationOverlayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const insets = useSafeAreaInsets();

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
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

  const handleSave = () => {
    if (simulation && onSave) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSave(simulation);
    }
  };

  const handleRerun = () => {
    if (simulation && onRerun) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onRerun(simulation);
    }
  };

  if (!visible || !simulation) return null;

  const winProbColor = getWinProbabilityColor(simulation.winProbability);
  const confidenceColor = getConfidenceColor(simulation.confidence);
  const volatilityColor = getVolatilityColor(simulation.volatility);
  const isWinning = simulation.winProbability >= 50;

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            backgroundColor: colors.background,
            transform: [{ translateY: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <IconSymbol name="chart.bar.fill" size={20} color={modeColors.primary} />
            <ThemedText style={styles.headerTitle}>Simulation Details</ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Matchup Section */}
          <View style={styles.matchupSection}>
            <ThemedText style={styles.matchupText}>{simulation.matchupText}</ThemedText>
            <View style={styles.matchupMeta}>
              <View
                style={[
                  styles.rosterBadge,
                  {
                    backgroundColor:
                      simulation.rosterUsed === 'official'
                        ? modeColors.primary + '20'
                        : '#A1A1AA' + '20',
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.rosterBadgeText,
                    {
                      color:
                        simulation.rosterUsed === 'official' ? modeColors.primary : '#A1A1AA',
                    },
                  ]}
                >
                  {simulation.rosterUsed === 'official' ? 'Official Roster' : 'Sandbox Roster'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.timestamp, { color: colors.textSecondary }]}>
                {simulation.timestamp.toLocaleString()}
              </ThemedText>
            </View>
          </View>

          {/* Primary Outputs */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Projected Outcome
            </ThemedText>
            <View style={styles.statsRow}>
              <StatCard
                label="Win Probability"
                value={`${simulation.winProbability}%`}
                valueColor={winProbColor}
                large
                colors={colors}
              />
              <StatCard
                label="Projected Score"
                value={`${simulation.projectedScore.home}-${simulation.projectedScore.away}`}
                sublabel={`Margin: ${formatMargin(simulation.projectedMargin)}`}
                large
                colors={colors}
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                label="Total Points"
                value={simulation.projectedTotal.toString()}
                colors={colors}
              />
              <StatCard
                label="Confidence"
                value={getConfidenceLabel(simulation.confidence)}
                valueColor={confidenceColor}
                colors={colors}
              />
              <StatCard
                label="Volatility"
                value={getVolatilityLabel(simulation.volatility)}
                valueColor={volatilityColor}
                colors={colors}
              />
            </View>
          </View>

          {/* Drivers Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Key Drivers
            </ThemedText>
            <View style={[styles.driversCard, { backgroundColor: colors.backgroundSecondary }]}>
              {simulation.drivers.map((driver, index) => (
                <DriverRow
                  key={index}
                  driver={driver}
                  index={index}
                  colors={colors}
                  accentColor={modeColors.primary}
                />
              ))}
            </View>
          </View>

          {/* Player Impact Section */}
          <View style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
              Player Impact
            </ThemedText>
            <View style={[styles.playerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.playerHeader, { borderBottomColor: colors.border }]}>
                <ThemedText style={[styles.playerHeaderText, { color: colors.textSecondary }]}>
                  Player
                </ThemedText>
                <ThemedText style={[styles.playerHeaderText, { color: colors.textSecondary }]}>
                  Projected Stats
                </ThemedText>
                <ThemedText style={[styles.playerHeaderText, { color: colors.textSecondary }]}>
                  Impact
                </ThemedText>
              </View>
              {simulation.playerImpact.slice(0, 5).map((player) => (
                <PlayerImpactRow
                  key={player.playerId}
                  player={player}
                  colors={colors}
                  accentColor={modeColors.primary}
                />
              ))}
            </View>
          </View>

          {/* Box Score Section */}
          {simulation.boxScoreProjection && (
            <CollapsibleSection title="Projected Box Score" colors={colors}>
              <View style={[styles.boxScoreCard, { backgroundColor: colors.backgroundSecondary }]}>
                <View style={styles.boxScoreRow}>
                  <ThemedText style={[styles.boxScoreLabel, { color: colors.textSecondary }]}>
                    Points
                  </ThemedText>
                  <ThemedText style={styles.boxScoreValue}>
                    {simulation.boxScoreProjection.teamStats.points}
                  </ThemedText>
                </View>
                <View style={styles.boxScoreRow}>
                  <ThemedText style={[styles.boxScoreLabel, { color: colors.textSecondary }]}>
                    Rebounds
                  </ThemedText>
                  <ThemedText style={styles.boxScoreValue}>
                    {simulation.boxScoreProjection.teamStats.rebounds}
                  </ThemedText>
                </View>
                <View style={styles.boxScoreRow}>
                  <ThemedText style={[styles.boxScoreLabel, { color: colors.textSecondary }]}>
                    Assists
                  </ThemedText>
                  <ThemedText style={styles.boxScoreValue}>
                    {simulation.boxScoreProjection.teamStats.assists}
                  </ThemedText>
                </View>
                <View style={styles.boxScoreRow}>
                  <ThemedText style={[styles.boxScoreLabel, { color: colors.textSecondary }]}>
                    FG%
                  </ThemedText>
                  <ThemedText style={styles.boxScoreValue}>
                    {simulation.boxScoreProjection.teamStats.fgPct.toFixed(1)}%
                  </ThemedText>
                </View>
                <View style={styles.boxScoreRow}>
                  <ThemedText style={[styles.boxScoreLabel, { color: colors.textSecondary }]}>
                    3P%
                  </ThemedText>
                  <ThemedText style={styles.boxScoreValue}>
                    {simulation.boxScoreProjection.teamStats.threePct.toFixed(1)}%
                  </ThemedText>
                </View>
                <View style={styles.boxScoreRow}>
                  <ThemedText style={[styles.boxScoreLabel, { color: colors.textSecondary }]}>
                    Turnovers
                  </ThemedText>
                  <ThemedText style={styles.boxScoreValue}>
                    {simulation.boxScoreProjection.teamStats.turnovers}
                  </ThemedText>
                </View>
              </View>
            </CollapsibleSection>
          )}
        </ScrollView>

        {/* Footer Actions */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {onRerun && (
            <Pressable
              style={[styles.footerButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handleRerun}
            >
              <IconSymbol name="arrow.clockwise" size={16} color={colors.text} />
              <ThemedText style={[styles.footerButtonText, { color: colors.text }]}>
                Re-run
              </ThemedText>
            </Pressable>
          )}
          {onSave && (
            <Pressable
              style={[styles.footerButton, styles.primaryButton, { backgroundColor: modeColors.primary }]}
              onPress={handleSave}
            >
              <IconSymbol name="square.and.arrow.down" size={16} color="#FFFFFF" />
              <ThemedText style={[styles.footerButtonText, { color: '#FFFFFF' }]}>
                Save Simulation
              </ThemedText>
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  // Matchup
  matchupSection: {
    marginBottom: Spacing.lg,
  },
  matchupText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  matchupMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rosterBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  rosterBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 12,
  },

  // Sections
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: Spacing.sm,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  statCardLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  statCardValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statCardValueLarge: {
    fontSize: 22,
    fontWeight: '700',
  },
  statCardSublabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Drivers
  driversCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  driverBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  driverBulletText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  driverText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },

  // Player Impact
  playerCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  playerHeader: {
    flexDirection: 'row',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerHeaderText: {
    flex: 1,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
  },
  playerPosition: {
    fontSize: 11,
  },
  playerStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  playerStat: {
    alignItems: 'center',
  },
  playerStatValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  playerStatLabel: {
    fontSize: 9,
    textTransform: 'uppercase',
  },
  impactBadge: {
    width: 36,
    height: 24,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing.sm,
  },
  impactValue: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Collapsible
  collapsibleSection: {
    marginBottom: Spacing.md,
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  collapsibleTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  collapsibleContent: {
    paddingTop: Spacing.sm,
  },

  // Box Score
  boxScoreCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  boxScoreRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  boxScoreLabel: {
    fontSize: 13,
  },
  boxScoreValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  primaryButton: {},
  footerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
