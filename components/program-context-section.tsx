/**
 * Program Context Section Component
 * Inline version of the Program Context Drawer for embedding in pages.
 * Matches the exact UI/format from the Nexus Program Context Drawer.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import {
  DEFAULT_PROGRAM_CONTEXT,
  SYSTEM_PRESETS,
  OFFENSIVE_STYLES,
  DEFENSIVE_STYLES,
  OFFENSIVE_STYLE_CLUSTERS,
  DEFENSIVE_STYLE_CLUSTERS,
  CLUSTER_LABELS,
  POSITION_LABELS,
  formatCurrency,
} from '@/data/mock-program-context';
import {
  OFFENSIVE_SYSTEM_PROFILES,
  DEFENSIVE_SYSTEM_PROFILES,
  getTierPriority,
  type Archetype,
  type ImpactModifier,
  type RequirementTier,
  type ArchetypeRequirement,
  type ModifierRequirement,
} from '@/data/system-demand-profiles';
import {
  MOCK_ROSTER,
  getRosterArchetypeCoverage,
  getRosterModifierCoverage,
} from '@/data/mock-roster';
import {
  getArchetypeFocusItem,
  getModifierFocusItem,
} from '@/data/current-focus-mappings';
import type {
  Program,
  ProgramContext,
  SystemPreset,
  OffensiveStyle,
  DefensiveStyle,
  ClusterType,
  Position,
} from '@/types';

const STORAGE_KEY = 'kx:programContextSection:v3';

// Current Focus item type
interface CurrentFocusItem {
  id: string;
  title: string;
  description: string;
  triggeredBy: string;
  status: 'Critical' | 'Need';
  tier: RequirementTier | null;
  side: 'offense' | 'defense' | 'modifier';
}

// Program options
const PROGRAMS: Program[] = [
  { id: 'varsity', name: 'Varsity', level: 'varsity' },
  { id: 'dev1', name: 'Development I', level: 'development_1' },
  { id: 'dev2', name: 'Development II', level: 'development_2' },
  { id: 'postgrad', name: 'Postgrad', level: 'postgrad' },
];

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface SectionHeaderProps {
  title: string;
  colors: typeof Colors.light;
  collapsed?: boolean;
  onToggle?: () => void;
}

function SectionHeader({ title, colors, collapsed, onToggle }: SectionHeaderProps) {
  return (
    <Pressable
      style={styles.sectionHeader}
      onPress={onToggle}
      disabled={!onToggle}
    >
      <ThemedText style={[styles.sectionLabel, { color: colors.textTertiary }]}>
        {title}
      </ThemedText>
      {onToggle && (
        <IconSymbol
          name={collapsed ? 'chevron.down' : 'chevron.up'}
          size={12}
          color={colors.textTertiary}
        />
      )}
    </Pressable>
  );
}

interface SliderProps {
  value: number;
  min?: number;
  max?: number;
  onValueChange: (value: number) => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function SimpleSlider({ value, min = 0, max = 100, onValueChange, colors, accentColor }: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;
  const trackWidth = useRef(0);
  const startValue = useRef(value);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        startValue.current = value;
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        if (trackWidth.current > 0) {
          const deltaPercent = (gestureState.dx / trackWidth.current) * 100;
          const deltaValue = (deltaPercent / 100) * (max - min);
          const newValue = Math.round(Math.max(min, Math.min(max, startValue.current + deltaValue)));
          if (newValue !== value) {
            onValueChange(newValue);
          }
        }
      },
    })
  ).current;

  return (
    <View style={styles.sliderContainer}>
      <View
        style={[styles.sliderTrack, { backgroundColor: colors.backgroundTertiary }]}
        onLayout={(e) => {
          trackWidth.current = e.nativeEvent.layout.width;
        }}
        {...panResponder.panHandlers}
      >
        <View
          style={[
            styles.sliderFill,
            { width: `${percentage}%`, backgroundColor: accentColor },
          ]}
          pointerEvents="none"
        />
      </View>
      <View style={styles.sliderButtons}>
        <Pressable
          style={[styles.sliderButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => onValueChange(Math.max(min, value - 1))}
        >
          <IconSymbol name="minus" size={12} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.sliderValue}>{value}</ThemedText>
        <Pressable
          style={[styles.sliderButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => onValueChange(Math.min(max, value + 1))}
        >
          <IconSymbol name="plus" size={12} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

interface DraggableBarProps {
  value: number;
  max: number;
  onValueChange: (value: number) => void;
  colors: typeof Colors.light;
  accentColor: string;
}

function DraggableBar({ value, max, onValueChange, colors, accentColor }: DraggableBarProps) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  const trackWidth = useRef(0);
  const startValue = useRef(value);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only capture horizontal drags, let vertical scroll through
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        startValue.current = value;
      },
      onPanResponderMove: (_, gestureState: PanResponderGestureState) => {
        if (trackWidth.current > 0) {
          const deltaPercent = (gestureState.dx / trackWidth.current) * 100;
          const deltaValue = (deltaPercent / 100) * max;
          const rawValue = startValue.current + deltaValue;
          // Round to nearest 0.5
          const newValue = Math.round(rawValue * 2) / 2;
          const clampedValue = Math.max(0, Math.min(max, newValue));
          if (clampedValue !== value) {
            Haptics.selectionAsync();
            onValueChange(clampedValue);
          }
        }
      },
    })
  ).current;

  return (
    <View
      style={[styles.resourceBar, { backgroundColor: colors.backgroundTertiary }]}
      onLayout={(e) => {
        trackWidth.current = e.nativeEvent.layout.width;
      }}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.resourceBarFill,
          { width: `${Math.min(100, percentage)}%`, backgroundColor: accentColor },
        ]}
        pointerEvents="none"
      />
    </View>
  );
}

interface DropdownProps {
  value: string;
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  colors: typeof Colors.light;
}

function Dropdown({ value, options, onSelect, colors }: DropdownProps) {
  const [expanded, setExpanded] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <View>
      <Pressable
        style={[styles.dropdownButton, { backgroundColor: colors.backgroundTertiary }]}
        onPress={() => setExpanded(!expanded)}
      >
        <ThemedText style={styles.dropdownText}>
          {selectedOption?.label ?? value}
        </ThemedText>
      </Pressable>
      {expanded && (
        <View style={[styles.dropdownList, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {options.map((option) => (
            <Pressable
              key={option.value}
              style={[
                styles.dropdownOption,
                option.value === value && { backgroundColor: colors.backgroundSecondary },
              ]}
              onPress={() => {
                onSelect(option.value);
                setExpanded(false);
              }}
            >
              <ThemedText
                style={[
                  styles.dropdownOptionText,
                  option.value === value && { fontWeight: '600' },
                ]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ProgramContextSection() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const { state, setProgram } = useAppContext();
  const navigation = useNavigation();

  // Local state for context configuration
  const [context, setContext] = useState<ProgramContext>(DEFAULT_PROGRAM_CONTEXT);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    activeProgram: true,
    teamIdentity: true,
    tempo: true,
    clusters: true,
    positions: true,
    currentFocus: true,
  });

  // Track expanded items in Current Focus (for "Triggered by:" reveal)
  const [expandedFocusItems, setExpandedFocusItems] = useState<Set<string>>(new Set());
  // Track if showing all focus items or just top 3-4
  const [showAllFocus, setShowAllFocus] = useState(false);
  const FOCUS_PREVIEW_COUNT = 4; // Show top 4 items by default

  // =============================================================================
  // SYSTEM FIT COMPUTATION (Coaching-style gap analysis)
  // =============================================================================

  // Compute current focus items based on selected systems
  const computeCurrentFocus = useCallback((): CurrentFocusItem[] => {
    const offenseProfile = OFFENSIVE_SYSTEM_PROFILES[context.offensiveStyle];
    const defenseProfile = DEFENSIVE_SYSTEM_PROFILES[context.defensiveStyle];

    // Get roster coverage
    const archetypeCoverage = getRosterArchetypeCoverage(MOCK_ROSTER);
    const modifierCoverage = getRosterModifierCoverage(MOCK_ROSTER);

    const focusItems: CurrentFocusItem[] = [];
    const seenArchetypes = new Set<string>();

    // Process archetypes from a profile
    const processArchetype = (
      req: ArchetypeRequirement,
      side: 'offense' | 'defense'
    ) => {
      if (seenArchetypes.has(req.archetype)) return;
      seenArchetypes.add(req.archetype);

      const benchmark = req.count ?? 1;
      const have = (archetypeCoverage[req.archetype] ?? []).length;

      // Only include gaps (CRITICAL or NEED)
      if (have >= benchmark) return; // Satisfied, skip

      let status: 'Critical' | 'Need';
      if (have <= benchmark - 2 || (req.tier === 'A' && have === 0)) {
        status = 'Critical';
      } else {
        status = 'Need';
      }

      const focusItem = getArchetypeFocusItem(
        req.archetype as Archetype,
        req.tier,
        status
      );

      focusItems.push({
        id: req.archetype,
        title: focusItem.title,
        description: focusItem.description,
        triggeredBy: focusItem.triggeredBy,
        status,
        tier: req.tier,
        side,
      });
    };

    // Process modifiers from a profile
    const seenModifiers = new Set<string>();
    const processModifier = (req: ModifierRequirement) => {
      if (seenModifiers.has(req.modifier)) return;
      if (req.optional) return;
      seenModifiers.add(req.modifier);

      const benchmark = req.count ?? 1;
      const have = (modifierCoverage[req.modifier] ?? []).length;

      // Only include gaps
      if (have >= benchmark) return;

      const status: 'Critical' | 'Need' = have <= benchmark - 2 ? 'Critical' : 'Need';

      const focusItem = getModifierFocusItem(req.modifier as ImpactModifier, status);

      focusItems.push({
        id: req.modifier,
        title: focusItem.title,
        description: focusItem.description,
        triggeredBy: focusItem.triggeredBy,
        status,
        tier: null,
        side: 'modifier',
      });
    };

    // Process offense archetypes
    offenseProfile.archetypes.forEach((req) => processArchetype(req, 'offense'));
    // Process defense archetypes
    defenseProfile.archetypes.forEach((req) => processArchetype(req, 'defense'));
    // Process modifiers
    offenseProfile.modifiers.forEach(processModifier);
    defenseProfile.modifiers.forEach(processModifier);

    // Sort: CRITICAL first, then NEED. Within each: Tier A before B before C
    focusItems.sort((a, b) => {
      // Status priority
      if (a.status !== b.status) {
        return a.status === 'Critical' ? -1 : 1;
      }
      // Tier priority
      return getTierPriority(a.tier ?? 'C') - getTierPriority(b.tier ?? 'C');
    });

    // Return max 6 items
    return focusItems.slice(0, 6);
  }, [context.offensiveStyle, context.defensiveStyle]);

  const currentFocus = computeCurrentFocus();

  // Toggle expanded state for a focus item
  const toggleFocusItemExpanded = (id: string) => {
    setExpandedFocusItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Load persisted state on focus, but always reset collapsed sections to closed
  useFocusEffect(
    useCallback(() => {
      // Reset all sections to closed state on every focus
      setCollapsedSections({
        activeProgram: true,
        teamIdentity: true,
        tempo: true,
        clusters: true,
        positions: true,
        currentFocus: true,
      });

      const loadData = async () => {
        try {
          const saved = await AsyncStorage.getItem(STORAGE_KEY);
          if (saved) {
            setContext(JSON.parse(saved));
          }
        } catch (e) {
          console.error('Failed to load program context section:', e);
        }
      };
      loadData();
    }, [])
  );

  // Save context whenever it changes
  const saveContext = useCallback(async (newContext: ProgramContext) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newContext));
    } catch (e) {
      console.error('Failed to save program context section:', e);
    }
  }, []);

  const currentProgram = state.program ?? PROGRAMS[0];
  const [programDropdownExpanded, setProgramDropdownExpanded] = useState(false);

  const handleProgramSelect = (program: Program) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProgram(program);
    setProgramDropdownExpanded(false);
  };

  const toggleSection = (section: string) => {
    // Check if trying to collapse with unallocated points
    if (!collapsedSections[section]) {
      // Currently expanded, trying to collapse
      if (section === 'clusters') {
        const clusterTotalCheck = context.clusterWeights.reduce((sum, cw) => sum + cw.weight, 0);
        if (clusterTotalCheck < 100) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return; // Block collapse
        }
      }
      if (section === 'positions') {
        const positionTotalCheck = context.positionImportance.reduce((sum, pi) => sum + (pi.weight ?? 20), 0);
        if (positionTotalCheck < 100) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          return; // Block collapse
        }
      }
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateContext = (updates: Partial<ProgramContext>) => {
    setContext((prev) => {
      const newContext = { ...prev, ...updates };
      saveContext(newContext);
      return newContext;
    });
  };

  // Calculate total cluster weight and available points
  const clusterTotal = context.clusterWeights.reduce((sum, cw) => sum + cw.weight, 0);
  const availablePoints = 100 - clusterTotal;

  const updateClusterWeight = (cluster: ClusterType, delta: number) => {
    setContext((prev) => {
      const currentTotal = prev.clusterWeights.reduce((sum, cw) => sum + cw.weight, 0);
      const currentAvailable = 100 - currentTotal;

      // If trying to increase and no points available, block it
      if (delta > 0 && currentAvailable <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return prev;
      }

      // If trying to increase more than available, cap it
      const actualDelta = delta > 0 ? Math.min(delta, currentAvailable) : delta;

      const newWeights = prev.clusterWeights.map((cw) => {
        if (cw.cluster === cluster) {
          return { ...cw, weight: Math.max(1, cw.weight + actualDelta) };
        }
        return cw;
      });
      const newContext = { ...prev, clusterWeights: newWeights };
      saveContext(newContext);
      return newContext;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Calculate total position weight and available points (with fallback for old data)
  const positionTotal = context.positionImportance.reduce((sum, pi) => sum + (pi.weight ?? 20), 0);
  const positionAvailablePoints = 100 - positionTotal;

  // Block navigation if there are unallocated points
  React.useEffect(() => {
    const hasUnallocatedPoints = availablePoints > 0 || positionAvailablePoints > 0;

    if (!hasUnallocatedPoints) return;

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Block navigation if points are unallocated
      e.preventDefault();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    });

    return unsubscribe;
  }, [navigation, availablePoints, positionAvailablePoints]);

  const updatePositionWeight = (position: Position, delta: number) => {
    setContext((prev) => {
      const currentTotal = prev.positionImportance.reduce((sum, pi) => sum + (pi.weight ?? 20), 0);
      const currentAvailable = 100 - currentTotal;

      // If trying to increase and no points available, block it
      if (delta > 0 && currentAvailable <= 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return prev;
      }

      // If trying to increase more than available, cap it
      const actualDelta = delta > 0 ? Math.min(delta, currentAvailable) : delta;

      const newPositions = prev.positionImportance.map((pi) => {
        if (pi.position === position) {
          return { ...pi, weight: Math.max(1, (pi.weight ?? 20) + actualDelta) };
        }
        return { ...pi, weight: pi.weight ?? 20 };
      });
      const newContext = { ...prev, positionImportance: newPositions };
      saveContext(newContext);
      return newContext;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };


  // Update offensive style and apply corresponding cluster weights
  // Sets: shooting, finishing, playmaking (sum = 53)
  const handleOffensiveStyleChange = (style: OffensiveStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const offensiveClusters = OFFENSIVE_STYLE_CLUSTERS[style];
    setContext((prev) => {
      const newWeights = prev.clusterWeights.map((cw) => {
        if (cw.cluster === 'shooting') return { ...cw, weight: offensiveClusters.shooting };
        if (cw.cluster === 'finishing') return { ...cw, weight: offensiveClusters.finishing };
        if (cw.cluster === 'playmaking') return { ...cw, weight: offensiveClusters.playmaking };
        return cw;
      });
      const newContext = { ...prev, offensiveStyle: style, clusterWeights: newWeights };
      saveContext(newContext);
      return newContext;
    });
  };

  // Update defensive style and apply corresponding cluster weights
  // Sets: perimeter_defense, interior_defense, rebounding, frame (sum = 47)
  const handleDefensiveStyleChange = (style: DefensiveStyle) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const defensiveClusters = DEFENSIVE_STYLE_CLUSTERS[style];
    setContext((prev) => {
      const newWeights = prev.clusterWeights.map((cw) => {
        if (cw.cluster === 'perimeter_defense') return { ...cw, weight: defensiveClusters.perimeter_defense };
        if (cw.cluster === 'interior_defense') return { ...cw, weight: defensiveClusters.interior_defense };
        if (cw.cluster === 'rebounding') return { ...cw, weight: defensiveClusters.rebounding };
        if (cw.cluster === 'frame') return { ...cw, weight: defensiveClusters.frame };
        return cw;
      });
      const newContext = { ...prev, defensiveStyle: style, clusterWeights: newWeights };
      saveContext(newContext);
      return newContext;
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundSecondary }]}>
      {/* System (Offensive & Defensive) */}
      <View style={styles.section}>
        <SectionHeader
          title="SYSTEM (OFFENSIVE & DEFENSIVE)"
          colors={colors}
          collapsed={collapsedSections.teamIdentity}
          onToggle={() => toggleSection('teamIdentity')}
        />
        {!collapsedSections.teamIdentity && (
          <View>
            <View style={styles.styleRow}>
              <View style={styles.styleColumn}>
                <ThemedText style={[styles.styleLabel, { color: colors.textTertiary }]}>
                  Offensive System
                </ThemedText>
                <Dropdown
                  value={context.offensiveStyle}
                  options={OFFENSIVE_STYLES}
                  onSelect={(v) => handleOffensiveStyleChange(v as OffensiveStyle)}
                  colors={colors}
                />
              </View>
              <View style={styles.styleColumn}>
                <ThemedText style={[styles.styleLabel, { color: colors.textTertiary }]}>
                  Defensive System
                </ThemedText>
                <Dropdown
                  value={context.defensiveStyle}
                  options={DEFENSIVE_STYLES}
                  onSelect={(v) => handleDefensiveStyleChange(v as DefensiveStyle)}
                  colors={colors}
                />
              </View>
            </View>

            {/* Tempo */}
            <View style={styles.tempoSection}>
              <ThemedText style={[styles.styleLabel, { color: colors.textTertiary, textAlign: 'center' }]}>
                Tempo · {context.tempo < 40 ? 'Slow' : context.tempo < 60 ? 'Moderate' : context.tempo < 80 ? 'Fast' : 'Very Fast'}
              </ThemedText>
              <SimpleSlider
                value={context.tempo}
                onValueChange={(v) => updateContext({ tempo: v })}
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          </View>
        )}
      </View>

      {/* System Emphasis (includes Tempo) */}
      <View style={styles.section}>
        <SectionHeader
          title="SYSTEM EMPHASIS"
          colors={colors}
          collapsed={collapsedSections.clusters}
          onToggle={() => toggleSection('clusters')}
        />
        {!collapsedSections.clusters && (
          <View style={styles.clusterList}>
            {context.clusterWeights.map((cw) => {
              // Handle migration: 'physical' -> 'frame'
              const clusterKey = cw.cluster === 'physical' ? 'frame' : cw.cluster;
              const clusterLabel = CLUSTER_LABELS[clusterKey as ClusterType];
              if (!clusterLabel) return null;
              return (
              <View key={cw.cluster} style={styles.clusterRow}>
                <View style={styles.clusterInfo}>
                  <ThemedText style={styles.clusterLabel}>
                    {clusterLabel.label}
                  </ThemedText>
                  <ThemedText style={[styles.clusterDesc, { color: colors.textTertiary }]}>
                    {clusterLabel.description}
                  </ThemedText>
                </View>
                <View style={styles.clusterControls}>
                  <Pressable
                    style={[styles.clusterButton, { backgroundColor: colors.background }]}
                    onPress={() => updateClusterWeight(cw.cluster, -1)}
                  >
                    <IconSymbol name="minus" size={12} color={colors.text} />
                  </Pressable>
                  <ThemedText style={[styles.clusterValue, { color: modeColors.primary }]}>
                    {cw.weight}
                  </ThemedText>
                  <Pressable
                    style={[styles.clusterButton, { backgroundColor: colors.background, opacity: availablePoints <= 0 ? 0.4 : 1 }]}
                    onPress={() => updateClusterWeight(cw.cluster, 1)}
                  >
                    <IconSymbol name="plus" size={12} color={colors.text} />
                  </Pressable>
                </View>
              </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Position Importance */}
      <View style={styles.section}>
        <SectionHeader
          title="SYSTEM POSITIONAL IMPORTANCE"
          colors={colors}
          collapsed={collapsedSections.positions}
          onToggle={() => toggleSection('positions')}
        />
        {!collapsedSections.positions && (
          <View style={styles.clusterList}>
            {context.positionImportance.map((pi) => (
              <View key={pi.position} style={styles.clusterRow}>
                <View style={styles.clusterInfo}>
                  <ThemedText style={styles.clusterLabel}>
                    {POSITION_LABELS[pi.position]}
                  </ThemedText>
                </View>
                <View style={styles.clusterControls}>
                  <Pressable
                    style={[styles.clusterButton, { backgroundColor: colors.background }]}
                    onPress={() => updatePositionWeight(pi.position, -1)}
                  >
                    <IconSymbol name="minus" size={12} color={colors.text} />
                  </Pressable>
                  <ThemedText style={[styles.clusterValue, { color: modeColors.primary }]}>
                    {pi.weight ?? 20}
                  </ThemedText>
                  <Pressable
                    style={[styles.clusterButton, { backgroundColor: colors.background, opacity: positionAvailablePoints <= 0 ? 0.4 : 1 }]}
                    onPress={() => updatePositionWeight(pi.position, 1)}
                  >
                    <IconSymbol name="plus" size={12} color={colors.text} />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* System Fit - Gap Analysis */}
      <View style={styles.section}>
        <SectionHeader
          title="SYSTEM FIT"
          colors={colors}
          collapsed={collapsedSections.currentFocus}
          onToggle={() => toggleSection('currentFocus')}
        />
        {!collapsedSections.currentFocus && (
          <View style={styles.focusList}>
            {currentFocus.length === 0 ? (
              <ThemedText style={[styles.noGapsText, { color: colors.textSecondary }]}>
                No major gaps.
              </ThemedText>
            ) : (
              <>
                {/* Show preview items (or all if expanded) */}
                {(showAllFocus ? currentFocus : currentFocus.slice(0, FOCUS_PREVIEW_COUNT)).map((item) => (
                  <Pressable
                    key={item.id}
                    style={styles.focusCard}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      toggleFocusItemExpanded(item.id);
                    }}
                  >
                    {/* Line 1: Issue Title + Status Pill */}
                    <View style={styles.focusHeader}>
                      <ThemedText style={styles.focusTitle}>
                        {item.title}
                      </ThemedText>
                      <View
                        style={[
                          styles.focusPill,
                          {
                            backgroundColor:
                              item.status === 'Critical' ? '#555555' + '15' : '#6e6e6e' + '15',
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            styles.focusPillText,
                            {
                              color: item.status === 'Critical' ? '#f5f5f5' : '#6e6e6e',
                            },
                          ]}
                        >
                          {item.status.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Line 2: Cause → Consequence */}
                    <ThemedText style={[styles.focusDescription, { color: colors.textSecondary }]}>
                      {item.description}
                    </ThemedText>

                    {/* Expanded: Triggered by (hidden by default) */}
                    {expandedFocusItems.has(item.id) && (
                      <ThemedText style={[styles.focusTriggeredBy, { color: colors.textTertiary }]}>
                        Triggered by: {item.triggeredBy}
                      </ThemedText>
                    )}
                  </Pressable>
                ))}

                {/* View all / Collapse toggle */}
                {currentFocus.length > FOCUS_PREVIEW_COUNT && (
                  <Pressable
                    style={styles.viewAllButton}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setShowAllFocus(!showAllFocus);
                    }}
                  >
                    <ThemedText style={[styles.viewAllText, { color: modeColors.primary }]}>
                      {showAllFocus
                        ? 'Show less'
                        : `View all focus (+${currentFocus.length - FOCUS_PREVIEW_COUNT})`}
                    </ThemedText>
                  </Pressable>
                )}
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  section: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Program Selector
  programGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  programChip: {
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  programChipText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Resources
  resourceCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  resourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resourceLabel: {
    fontSize: 13,
  },
  resourceValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  resourceBar: {
    height: 4,
    borderRadius: 2,
    marginTop: 4,
  },
  resourceBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  resourceValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resourceInlineInput: {
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    textAlign: 'center',
    marginLeft: 4,
  },

  // Dropdown
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dropdownOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  dropdownOptionText: {
    fontSize: 14,
  },
  presetDescription: {
    fontSize: 12,
    marginTop: Spacing.xs,
    lineHeight: 16,
  },

  // Play Style
  styleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  styleColumn: {
    flex: 1,
  },
  styleLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 4,
  },
  tempoSection: {
    marginTop: Spacing.md,
  },
  tempoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  tempoValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Slider
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sliderTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  sliderFill: {
    height: '100%',
    borderRadius: 3,
  },
  sliderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  sliderButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sliderValue: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 28,
    textAlign: 'center',
  },

  // Tempo section inside Team Identity
  tempoSection: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },

  // Clusters
  clusterList: {
    gap: Spacing.sm,
  },
  clusterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clusterInfo: {
    flex: 1,
  },
  clusterLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  clusterDesc: {
    fontSize: 11,
  },
  clusterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  clusterButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clusterValue: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },

  // Positions
  positionList: {
    gap: Spacing.xs,
  },
  positionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  positionLabel: {
    fontSize: 14,
  },
  importanceButtons: {
    flexDirection: 'row',
    gap: 4,
  },
  importanceButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  importanceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  importanceLegend: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 10,
  },

  // Current Focus
  focusList: {
    gap: Spacing.sm,
  },
  focusCard: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: 2,
  },
  focusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  focusTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  focusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  focusPillText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  focusDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  focusTriggeredBy: {
    fontSize: 11,
    marginTop: 6,
    fontStyle: 'italic',
  },
  noGapsText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.lg,
    fontWeight: '500',
  },
  viewAllButton: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
