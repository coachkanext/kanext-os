/**
 * Roster Sandbox Overlay Component
 * Full-height right-side overlay for viewing/editing rosters.
 * Supports Official vs Sandbox mode, depth chart view, and player management.
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
import { useAppContext } from '@/context/app-context';
import {
  getVarsityProgram,
  getPositionName,
  getClassYearName,
  type RosterEntry,
  type Player,
} from '@/data/mock-sports';
import { formatCurrency } from '@/data/mock-program-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_WIDTH = Math.min(420, SCREEN_WIDTH * 0.95);

// =============================================================================
// TYPES
// =============================================================================

type ViewMode = 'roster' | 'depth';
type RosterMode = 'official' | 'sandbox';

interface PlayerPanelData {
  entry: RosterEntry;
  visible: boolean;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SegmentToggleProps {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function SegmentToggle({ options, selected, onSelect, colors, accentColor }: SegmentToggleProps) {
  return (
    <View style={[styles.segmentToggle, { backgroundColor: colors.backgroundTertiary }]}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.segmentOption,
            selected === option.value && { backgroundColor: accentColor },
          ]}
          onPress={() => onSelect(option.value)}
        >
          <ThemedText
            style={[
              styles.segmentText,
              { color: selected === option.value ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {option.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );
}

interface PlayerRowProps {
  entry: RosterEntry;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  isSandbox: boolean;
}

function PlayerRow({ entry, onPress, colors, accentColor, isSandbox }: PlayerRowProps) {
  const { player } = entry;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.playerRow,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.playerNumber}>
        <ThemedText style={[styles.numberText, { color: accentColor }]}>
          #{player.number}
        </ThemedText>
      </View>
      <View style={styles.playerInfo}>
        <View style={styles.playerNameRow}>
          <ThemedText style={styles.playerName}>{player.name}</ThemedText>
          {entry.role === 'starter' && (
            <View style={[styles.roleBadge, { backgroundColor: accentColor }]}>
              <ThemedText style={styles.roleBadgeText}>S</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.playerMeta, { color: colors.textSecondary }]}>
          {player.position} • {player.height} • {getClassYearName(player.classYear)}
        </ThemedText>
      </View>
      <View style={styles.playerResources}>
        <ThemedText style={[styles.resourceText, { color: colors.textSecondary }]}>
          {entry.scholarshipPercent}%
        </ThemedText>
      </View>
      {isSandbox && (
        <IconSymbol name="line.3.horizontal" size={16} color={colors.textTertiary} />
      )}
      {!isSandbox && (
        <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
      )}
    </Pressable>
  );
}

interface DepthChartRowProps {
  position: string;
  players: RosterEntry[];
  colors: typeof Colors.light;
  accentColor: string;
}

function DepthChartRow({ position, players, colors, accentColor }: DepthChartRowProps) {
  return (
    <View style={[styles.depthRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.depthPosition, { backgroundColor: accentColor + '15' }]}>
        <ThemedText style={[styles.depthPositionText, { color: accentColor }]}>
          {position}
        </ThemedText>
      </View>
      <View style={styles.depthPlayers}>
        {players.length === 0 ? (
          <ThemedText style={[styles.depthEmpty, { color: colors.textTertiary }]}>
            No players
          </ThemedText>
        ) : (
          players.map((entry, index) => (
            <View key={entry.player.id} style={styles.depthPlayer}>
              <ThemedText style={[styles.depthRank, { color: colors.textTertiary }]}>
                {index + 1}.
              </ThemedText>
              <ThemedText style={styles.depthName}>
                {entry.player.name}
              </ThemedText>
              {entry.role === 'starter' && (
                <IconSymbol name="star.fill" size={10} color={accentColor} />
              )}
            </View>
          ))
        )}
      </View>
    </View>
  );
}

interface PlayerPanelProps {
  entry: RosterEntry | null;
  visible: boolean;
  onClose: () => void;
  onRemove: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  isSandbox: boolean;
}

function PlayerPanel({ entry, visible, onClose, onRemove, colors, accentColor, isSandbox }: PlayerPanelProps) {
  if (!visible || !entry) return null;

  const { player } = entry;

  return (
    <View style={[styles.playerPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.panelHeader}>
        <ThemedText style={styles.panelTitle}>{player.name}</ThemedText>
        <Pressable onPress={onClose}>
          <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      <View style={styles.panelContent}>
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            Position
          </ThemedText>
          <ThemedText style={styles.panelValue}>
            {getPositionName(player.position)}
          </ThemedText>
        </View>
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            Class
          </ThemedText>
          <ThemedText style={styles.panelValue}>
            {getClassYearName(player.classYear)}
          </ThemedText>
        </View>
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            Height / Weight
          </ThemedText>
          <ThemedText style={styles.panelValue}>
            {player.height} / {player.weight}
          </ThemedText>
        </View>
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            Hometown
          </ThemedText>
          <ThemedText style={styles.panelValue}>
            {player.hometown}
          </ThemedText>
        </View>
        <View style={[styles.panelDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            Scholarship
          </ThemedText>
          <ThemedText style={styles.panelValue}>
            {entry.scholarshipPercent}%
          </ThemedText>
        </View>
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            NIL
          </ThemedText>
          <ThemedText style={styles.panelValue}>
            {formatCurrency(entry.nilAmount)}
          </ThemedText>
        </View>
        <View style={styles.panelRow}>
          <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
            Role
          </ThemedText>
          <ThemedText style={[styles.panelValue, { color: accentColor }]}>
            {entry.role.charAt(0).toUpperCase() + entry.role.slice(1)}
          </ThemedText>
        </View>
      </View>

      {isSandbox && (
        <View style={styles.panelActions}>
          <Pressable
            style={[styles.panelButton, { backgroundColor: Colors.light.error }]}
            onPress={onRemove}
          >
            <IconSymbol name="trash" size={14} color="#FFFFFF" />
            <ThemedText style={styles.panelButtonText}>Remove</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface RosterOverlayProps {
  visible: boolean;
  onClose: () => void;
}

export function RosterOverlay({ visible, onClose }: RosterOverlayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();

  const [rosterMode, setRosterMode] = useState<RosterMode>('official');
  const [viewMode, setViewMode] = useState<ViewMode>('roster');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerPanelData>({ entry: null as any, visible: false });

  const slideAnim = useRef(new Animated.Value(OVERLAY_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get roster data
  const program = getVarsityProgram();
  const roster = program.roster;

  // Calculate resources
  const totalScholarships = 10;
  const usedScholarships = roster.reduce((sum, e) => sum + (e.scholarshipPercent / 100), 0);
  const totalNil = 250000;
  const usedNil = roster.reduce((sum, e) => sum + e.nilAmount, 0);

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
          toValue: OVERLAY_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      // Reset state when closing
      setSelectedPlayer({ entry: null as any, visible: false });
    }
  }, [visible, slideAnim, fadeAnim]);

  const handlePlayerPress = (entry: RosterEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPlayer({ entry, visible: true });
  };

  const handleClosePanel = () => {
    setSelectedPlayer({ entry: null as any, visible: false });
  };

  const handleRemovePlayer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    // In real app, this would remove from sandbox
    setSelectedPlayer({ entry: null as any, visible: false });
  };

  const handleApplyToOfficial = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRosterMode('official');
  };

  const handleAddPlayer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // In real app, this would open player pool picker
    console.log('Add player from pool');
  };

  // Group by position for depth chart
  const positions = ['PG', 'CG', 'W', 'F', 'B'];
  const rosterByPosition = positions.map((pos) => ({
    position: pos,
    players: roster.filter((e) => e.player.position === pos),
  }));

  if (!visible) return null;

  const isSandbox = rosterMode === 'sandbox';

  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Scrim / Backdrop */}
      <Animated.View style={[styles.scrim, { opacity: fadeAnim }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Overlay */}
      <Animated.View
        style={[
          styles.overlay,
          {
            width: OVERLAY_WIDTH,
            backgroundColor: colors.background,
            transform: [{ translateX: slideAnim }],
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Roster</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {state.program?.name ?? 'Varsity'} • {state.cycle?.name ?? '2025-26'}
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Mode Toggle */}
        <View style={styles.toggleRow}>
          <SegmentToggle
            options={[
              { value: 'official', label: 'Official' },
              { value: 'sandbox', label: 'Sandbox' },
            ]}
            selected={rosterMode}
            onSelect={(v) => setRosterMode(v as RosterMode)}
            colors={colors}
            accentColor={modeColors.primary}
          />
          <SegmentToggle
            options={[
              { value: 'roster', label: 'List' },
              { value: 'depth', label: 'Depth' },
            ]}
            selected={viewMode}
            onSelect={(v) => setViewMode(v as ViewMode)}
            colors={colors}
            accentColor={modeColors.primary}
          />
        </View>

        {/* Resource Bar */}
        <View style={[styles.resourceBar, { backgroundColor: colors.backgroundSecondary }]}>
          <View style={styles.resourceItem}>
            <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
              Players
            </ThemedText>
            <ThemedText style={[styles.resourceValue, { color: modeColors.primary }]}>
              {roster.length}
            </ThemedText>
          </View>
          <View style={[styles.resourceDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.resourceItem}>
            <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
              Scholarships
            </ThemedText>
            <ThemedText style={styles.resourceValue}>
              {usedScholarships.toFixed(1)} / {totalScholarships}
            </ThemedText>
            <View style={[styles.resourceProgress, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={[
                  styles.resourceProgressFill,
                  {
                    width: `${(usedScholarships / totalScholarships) * 100}%`,
                    backgroundColor: modeColors.primary,
                  },
                ]}
              />
            </View>
          </View>
          <View style={[styles.resourceDivider, { backgroundColor: colors.divider }]} />
          <View style={styles.resourceItem}>
            <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
              NIL Budget
            </ThemedText>
            <ThemedText style={styles.resourceValue}>
              {formatCurrency(usedNil)}
            </ThemedText>
            <View style={[styles.resourceProgress, { backgroundColor: colors.backgroundTertiary }]}>
              <View
                style={[
                  styles.resourceProgressFill,
                  {
                    width: `${(usedNil / totalNil) * 100}%`,
                    backgroundColor: '#FFFFFF',
                  },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {viewMode === 'roster' ? (
            // Roster List View
            roster.map((entry) => (
              <PlayerRow
                key={entry.player.id}
                entry={entry}
                onPress={() => handlePlayerPress(entry)}
                colors={colors}
                accentColor={modeColors.primary}
                isSandbox={isSandbox}
              />
            ))
          ) : (
            // Depth Chart View
            rosterByPosition.map(({ position, players }) => (
              <DepthChartRow
                key={position}
                position={position}
                players={players}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))
          )}
        </ScrollView>

        {/* Player Panel */}
        <PlayerPanel
          entry={selectedPlayer.entry}
          visible={selectedPlayer.visible}
          onClose={handleClosePanel}
          onRemove={handleRemovePlayer}
          colors={colors}
          accentColor={modeColors.primary}
          isSandbox={isSandbox}
        />

        {/* Footer Actions */}
        {isSandbox && (
          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <Pressable
              style={[styles.footerButton, { backgroundColor: colors.backgroundSecondary }]}
              onPress={handleAddPlayer}
            >
              <IconSymbol name="plus" size={16} color={colors.text} />
              <ThemedText style={styles.footerButtonText}>Add Player</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.footerButton, styles.primaryButton, { backgroundColor: modeColors.primary }]}
              onPress={handleApplyToOfficial}
            >
              <IconSymbol name="checkmark" size={16} color="#FFFFFF" />
              <ThemedText style={[styles.footerButtonText, { color: '#FFFFFF' }]}>
                Apply to Official
              </ThemedText>
            </Pressable>
          </View>
        )}
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
    right: 0,
    bottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Toggle Row
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  segmentToggle: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  segmentOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Resource Bar
  resourceBar: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  resourceItem: {
    flex: 1,
    alignItems: 'center',
  },
  resourceLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  resourceValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  resourceDivider: {
    width: 1,
    marginVertical: 4,
  },
  resourceProgress: {
    width: '80%',
    height: 3,
    borderRadius: 1.5,
    marginTop: 4,
  },
  resourceProgressFill: {
    height: '100%',
    borderRadius: 1.5,
  },

  // Roster List
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  playerNumber: {
    width: 44,
  },
  numberText: {
    fontSize: 14,
    fontWeight: '700',
  },
  playerInfo: {
    flex: 1,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playerName: {
    fontSize: 15,
    fontWeight: '600',
  },
  roleBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  playerMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  playerResources: {
    marginRight: Spacing.sm,
  },
  resourceText: {
    fontSize: 12,
  },

  // Depth Chart
  depthRow: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 60,
  },
  depthPosition: {
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
  },
  depthPositionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  depthPlayers: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  depthPlayer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    gap: 4,
  },
  depthRank: {
    fontSize: 12,
    width: 18,
  },
  depthName: {
    fontSize: 14,
  },
  depthEmpty: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Player Panel
  playerPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  panelContent: {
    gap: Spacing.xs,
  },
  panelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  panelLabel: {
    fontSize: 14,
  },
  panelValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  panelDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.sm,
  },
  panelActions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  panelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  panelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
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
