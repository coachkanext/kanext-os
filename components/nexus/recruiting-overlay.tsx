/**
 * Recruiting Board Overlay Component
 * Full-height right-side overlay for viewing recruiting targets.
 * Supports status tabs, position/division filters, and prospect details.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
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
  getRecruitingTargets,
  getRecruitingStatusColor,
  getRecruitingStatusLabel,
  getDivisionLabel,
  getPositionName,
  getClassYearName,
  formatStatValue,
  formatPercentage,
  type RecruitingTarget,
  type RecruitingStatus,
  type Division,
} from '@/data/mock-sports';
import { formatCurrency } from '@/data/mock-program-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const OVERLAY_WIDTH = Math.min(420, SCREEN_WIDTH * 0.95);

// =============================================================================
// TYPES
// =============================================================================

type StatusTab = RecruitingStatus | 'all';
type PositionFilter = 'PG' | 'CG' | 'W' | 'F' | 'B' | 'all';
type DivisionFilter = Division | 'all';

interface ProspectPanelData {
  target: RecruitingTarget;
  visible: boolean;
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface StatusTabsProps {
  tabs: { value: StatusTab; label: string; count: number }[];
  selected: StatusTab;
  onSelect: (value: StatusTab) => void;
  colors: typeof Colors.light;
}

function StatusTabs({ tabs, selected, onSelect, colors }: StatusTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabsContainer}
    >
      {tabs.map((tab) => (
        <Pressable
          key={tab.value}
          style={[
            styles.tab,
            {
              borderBottomColor:
                selected === tab.value
                  ? getRecruitingStatusColor(tab.value === 'all' ? 'priority' : (tab.value as RecruitingStatus))
                  : 'transparent',
            },
          ]}
          onPress={() => onSelect(tab.value)}
        >
          <ThemedText
            style={[
              styles.tabText,
              { color: selected === tab.value ? colors.text : colors.textSecondary },
            ]}
          >
            {tab.label}
          </ThemedText>
          <View
            style={[
              styles.tabBadge,
              {
                backgroundColor:
                  selected === tab.value
                    ? getRecruitingStatusColor(tab.value === 'all' ? 'priority' : (tab.value as RecruitingStatus))
                    : colors.backgroundTertiary,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabBadgeText,
                { color: selected === tab.value ? '#FFFFFF' : colors.textSecondary },
              ]}
            >
              {tab.count}
            </ThemedText>
          </View>
        </Pressable>
      ))}
    </ScrollView>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function FilterChip({ label, selected, onPress, colors, accentColor }: FilterChipProps) {
  return (
    <Pressable
      style={[
        styles.filterChip,
        {
          backgroundColor: selected ? accentColor : colors.backgroundTertiary,
        },
      ]}
      onPress={onPress}
    >
      <ThemedText
        style={[styles.filterChipText, { color: selected ? '#FFFFFF' : colors.textSecondary }]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

interface ProspectRowProps {
  target: RecruitingTarget;
  onPress: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function ProspectRow({ target, onPress, colors, accentColor }: ProspectRowProps) {
  const { player } = target;
  const statusColor = getRecruitingStatusColor(target.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.prospectRow,
        {
          backgroundColor: pressed ? colors.backgroundSecondary : 'transparent',
          borderBottomColor: colors.border,
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.prospectMain}>
        <View style={styles.prospectNameRow}>
          <ThemedText style={styles.prospectName}>{player.name}</ThemedText>
          {target.priority === 'A' && (
            <View style={[styles.priorityBadge, { backgroundColor: '#FFFFFF' }]}>
              <ThemedText style={styles.priorityBadgeText}>A</ThemedText>
            </View>
          )}
          {target.priority === 'B' && (
            <View style={[styles.priorityBadge, { backgroundColor: '#A1A1AA' }]}>
              <ThemedText style={styles.priorityBadgeText}>B</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={[styles.prospectMeta, { color: colors.textSecondary }]}>
          {player.position} • {player.height} • {getClassYearName(player.classYear)}
        </ThemedText>
        <ThemedText style={[styles.prospectTeam, { color: colors.textSecondary }]}>
          {player.currentTeam} ({getDivisionLabel(player.currentDivision)})
        </ThemedText>
      </View>
      <View style={styles.prospectRight}>
        {target.fitPercent && (
          <View style={styles.fitBadge}>
            <ThemedText style={[styles.fitText, { color: accentColor }]}>
              {target.fitPercent}%
            </ThemedText>
          </View>
        )}
        <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
      </View>
    </Pressable>
  );
}

interface ProspectPanelProps {
  target: RecruitingTarget | null;
  visible: boolean;
  onClose: () => void;
  onAddToSandbox: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function ProspectPanel({ target, visible, onClose, onAddToSandbox, colors, accentColor }: ProspectPanelProps) {
  if (!visible || !target) return null;

  const { player } = target;
  const statusColor = getRecruitingStatusColor(target.status);

  return (
    <View style={[styles.prospectPanel, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.panelHeader}>
        <View style={styles.panelHeaderLeft}>
          <ThemedText style={styles.panelTitle}>{player.name}</ThemedText>
          <View style={[styles.panelStatus, { backgroundColor: statusColor }]}>
            <ThemedText style={styles.panelStatusText}>
              {getRecruitingStatusLabel(target.status)}
            </ThemedText>
          </View>
        </View>
        <Pressable onPress={onClose}>
          <IconSymbol name="xmark" size={18} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Content */}
      <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
        {/* Player Info */}
        <View style={styles.panelSection}>
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
              Height / Weight
            </ThemedText>
            <ThemedText style={styles.panelValue}>
              {player.height} / {player.weight}
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
              Current Team
            </ThemedText>
            <ThemedText style={styles.panelValue}>
              {player.currentTeam}
            </ThemedText>
          </View>
          <View style={styles.panelRow}>
            <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
              Division
            </ThemedText>
            <ThemedText style={styles.panelValue}>
              {getDivisionLabel(player.currentDivision)}
            </ThemedText>
          </View>
        </View>

        <View style={[styles.panelDivider, { backgroundColor: colors.divider }]} />

        {/* Stats */}
        <View style={styles.panelSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Stats</ThemedText>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: accentColor }]}>
                {formatStatValue(player.stats.ppg)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>PPG</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: accentColor }]}>
                {formatStatValue(player.stats.rpg)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>RPG</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: accentColor }]}>
                {formatStatValue(player.stats.apg)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>APG</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: accentColor }]}>
                {formatPercentage(player.stats.fgPct)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>FG%</ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: accentColor }]}>
                {player.stats.threePct > 0 ? formatPercentage(player.stats.threePct) : '-'}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>3P%</ThemedText>
            </View>
          </View>
        </View>

        <View style={[styles.panelDivider, { backgroundColor: colors.divider }]} />

        {/* Recruiting Info */}
        <View style={styles.panelSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Recruiting</ThemedText>
          <View style={styles.panelRow}>
            <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
              Priority
            </ThemedText>
            <ThemedText style={[styles.panelValue, { fontWeight: '700' }]}>
              {target.priority}
            </ThemedText>
          </View>
          {target.fitPercent && (
            <View style={styles.panelRow}>
              <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
                Fit Score
              </ThemedText>
              <ThemedText style={[styles.panelValue, { color: accentColor }]}>
                {target.fitPercent}%
              </ThemedText>
            </View>
          )}
          {target.recruiter && (
            <View style={styles.panelRow}>
              <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
                Recruiter
              </ThemedText>
              <ThemedText style={styles.panelValue}>{target.recruiter}</ThemedText>
            </View>
          )}
          {target.nextStep && (
            <View style={styles.panelRow}>
              <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
                Next Step
              </ThemedText>
              <ThemedText style={styles.panelValue}>{target.nextStep}</ThemedText>
            </View>
          )}
        </View>

        {/* Planned Resources */}
        {(target.plannedScholarship || target.plannedNil) && (
          <>
            <View style={[styles.panelDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.panelSection}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>
                Planned Offer
              </ThemedText>
              {target.plannedScholarship && (
                <View style={styles.panelRow}>
                  <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
                    Scholarship
                  </ThemedText>
                  <ThemedText style={styles.panelValue}>{target.plannedScholarship}%</ThemedText>
                </View>
              )}
              {target.plannedNil && (
                <View style={styles.panelRow}>
                  <ThemedText style={[styles.panelLabel, { color: colors.textSecondary }]}>
                    NIL
                  </ThemedText>
                  <ThemedText style={styles.panelValue}>{formatCurrency(target.plannedNil)}</ThemedText>
                </View>
              )}
            </View>
          </>
        )}

        {/* Notes */}
        {target.notes && (
          <>
            <View style={[styles.panelDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.panelSection}>
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Notes</ThemedText>
              <ThemedText style={[styles.notesText, { color: colors.textSecondary }]}>
                {target.notes}
              </ThemedText>
            </View>
          </>
        )}
      </ScrollView>

      {/* Actions */}
      <View style={styles.panelActions}>
        <Pressable
          style={[styles.panelButton, { backgroundColor: accentColor }]}
          onPress={onAddToSandbox}
        >
          <IconSymbol name="plus" size={14} color="#FFFFFF" />
          <ThemedText style={styles.panelButtonText}>Add to Roster Sandbox</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface RecruitingOverlayProps {
  visible: boolean;
  onClose: () => void;
  onOpenRosterSandbox?: () => void;
}

export function RecruitingOverlay({ visible, onClose, onOpenRosterSandbox }: RecruitingOverlayProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();

  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all');
  const [divisionFilter, setDivisionFilter] = useState<DivisionFilter>('all');
  const [selectedProspect, setSelectedProspect] = useState<ProspectPanelData>({
    target: null as any,
    visible: false,
  });

  const slideAnim = useRef(new Animated.Value(OVERLAY_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Get all recruiting targets
  const allTargets = getRecruitingTargets();

  // Tab counts
  const tabCounts = useMemo(() => {
    const counts: Record<StatusTab, number> = {
      all: allTargets.length,
      watching: 0,
      priority: 0,
      contacted: 0,
      offered: 0,
      committed: 0,
      archived: 0,
    };
    allTargets.forEach((t) => {
      counts[t.status]++;
    });
    return counts;
  }, [allTargets]);

  // Filter targets
  const filteredTargets = useMemo(() => {
    return allTargets.filter((target) => {
      // Status filter
      if (activeTab !== 'all' && target.status !== activeTab) return false;

      // Position filter
      if (positionFilter !== 'all' && target.player.position !== positionFilter) return false;

      // Division filter
      if (divisionFilter !== 'all' && target.player.currentDivision !== divisionFilter) return false;

      return true;
    });
  }, [allTargets, activeTab, positionFilter, divisionFilter]);

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
      setSelectedProspect({ target: null as any, visible: false });
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleProspectPress = (target: RecruitingTarget) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedProspect({ target, visible: true });
  };

  const handleClosePanel = () => {
    setSelectedProspect({ target: null as any, visible: false });
  };

  const handleAddToSandbox = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Close this panel and open roster sandbox
    setSelectedProspect({ target: null as any, visible: false });
    if (onOpenRosterSandbox) {
      onClose();
      onOpenRosterSandbox();
    }
  };

  const tabs: { value: StatusTab; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: tabCounts.all },
    { value: 'priority', label: 'Priority', count: tabCounts.priority },
    { value: 'contacted', label: 'Contacted', count: tabCounts.contacted },
    { value: 'offered', label: 'Offered', count: tabCounts.offered },
    { value: 'watching', label: 'Watching', count: tabCounts.watching },
    { value: 'committed', label: 'Committed', count: tabCounts.committed },
  ];

  const positions: { value: PositionFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'PG', label: 'PG' },
    { value: 'CG', label: 'CG' },
    { value: 'W', label: 'W' },
    { value: 'F', label: 'F' },
    { value: 'B', label: 'B' },
  ];

  const divisions: { value: DivisionFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'NCAA_D2', label: 'D2' },
    { value: 'NAIA', label: 'NAIA' },
    { value: 'NJCAA', label: 'JUCO' },
  ];

  if (!visible) return null;

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
            <ThemedText style={styles.headerTitle}>Recruiting Board</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {state.program?.name ?? 'Varsity'} • {filteredTargets.length} prospects
            </ThemedText>
          </View>
          <Pressable
            style={({ pressed }) => [styles.closeButton, { opacity: pressed ? 0.7 : 1 }]}
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </Pressable>
        </View>

        {/* Status Tabs */}
        <View style={[styles.tabsWrapper, { borderBottomColor: colors.border }]}>
          <StatusTabs tabs={tabs} selected={activeTab} onSelect={setActiveTab} colors={colors} />
        </View>

        {/* Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.filterGroup}>
            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>
              Position
            </ThemedText>
            <View style={styles.filterChips}>
              {positions.map((pos) => (
                <FilterChip
                  key={pos.value}
                  label={pos.label}
                  selected={positionFilter === pos.value}
                  onPress={() => setPositionFilter(pos.value)}
                  colors={colors}
                  accentColor={modeColors.primary}
                />
              ))}
            </View>
          </View>
          <View style={styles.filterGroup}>
            <ThemedText style={[styles.filterLabel, { color: colors.textSecondary }]}>
              Division
            </ThemedText>
            <View style={styles.filterChips}>
              {divisions.map((div) => (
                <FilterChip
                  key={div.value}
                  label={div.label}
                  selected={divisionFilter === div.value}
                  onPress={() => setDivisionFilter(div.value)}
                  colors={colors}
                  accentColor={modeColors.primary}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredTargets.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="person.2" size={40} color={colors.textTertiary} />
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                No prospects match your filters
              </ThemedText>
            </View>
          ) : (
            filteredTargets.map((target) => (
              <ProspectRow
                key={target.id}
                target={target}
                onPress={() => handleProspectPress(target)}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))
          )}
        </ScrollView>

        {/* Prospect Panel */}
        <ProspectPanel
          target={selectedProspect.target}
          visible={selectedProspect.visible}
          onClose={handleClosePanel}
          onAddToSandbox={handleAddToSandbox}
          colors={colors}
          accentColor={modeColors.primary}
        />
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

  // Tabs
  tabsWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderBottomWidth: 2,
    marginRight: Spacing.xs,
    gap: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabBadge: {
    minWidth: 20,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // Filters
  filtersRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  filterGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: '500',
    width: 50,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  filterChip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // List
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
  },

  // Prospect Row
  prospectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  prospectMain: {
    flex: 1,
  },
  prospectNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  prospectName: {
    fontSize: 15,
    fontWeight: '600',
  },
  priorityBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  prospectMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  prospectTeam: {
    fontSize: 11,
    marginTop: 1,
  },
  prospectRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  fitBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  fitText: {
    fontSize: 13,
    fontWeight: '700',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Panel
  prospectPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '75%',
    borderTopWidth: 1,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  panelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  panelStatus: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  panelStatusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  panelScroll: {
    maxHeight: 350,
    paddingHorizontal: Spacing.md,
  },
  panelSection: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
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

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },

  // Notes
  notesText: {
    fontSize: 13,
    lineHeight: 18,
  },

  // Actions
  panelActions: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  panelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  panelButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
