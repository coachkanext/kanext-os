/**
 * Program Context Drawer Component
 * Right slide-in drawer for viewing/editing program context settings.
 * Configures AI reasoning parameters for player evaluation and simulation.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppContext } from '@/context/app-context';
import {
  DEFAULT_PROGRAM_CONTEXT,
  SYSTEM_PRESETS,
  OFFENSIVE_STYLES,
  DEFENSIVE_STYLES,
  CLUSTER_LABELS,
  POSITION_LABELS,
  BIAS_LABELS,
  getImportanceColor,
  formatCurrency,
} from '@/data/mock-program-context';
import { saveProgramContextVersion } from '@/utils/program-context-versioning';
import type {
  Program,
  ProgramContext,
  SystemPreset,
  OffensiveStyle,
  DefensiveStyle,
  ClusterWeight,
  PositionImportance,
  ProgramBias,
  ImportanceLevel,
  ClusterType,
  Position,
} from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(360, SCREEN_WIDTH * 0.92);

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

  return (
    <View style={styles.sliderContainer}>
      <View style={[styles.sliderTrack, { backgroundColor: colors.backgroundTertiary }]}>
        <View
          style={[
            styles.sliderFill,
            { width: `${percentage}%`, backgroundColor: accentColor },
          ]}
        />
      </View>
      <View style={styles.sliderButtons}>
        <Pressable
          style={[styles.sliderButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => onValueChange(Math.max(min, value - 5))}
        >
          <IconSymbol name="minus" size={12} color={colors.text} />
        </Pressable>
        <ThemedText style={styles.sliderValue}>{value}</ThemedText>
        <Pressable
          style={[styles.sliderButton, { backgroundColor: colors.backgroundSecondary }]}
          onPress={() => onValueChange(Math.min(max, value + 5))}
        >
          <IconSymbol name="plus" size={12} color={colors.text} />
        </Pressable>
      </View>
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
        style={[styles.dropdownButton, { backgroundColor: colors.backgroundSecondary }]}
        onPress={() => setExpanded(!expanded)}
      >
        <ThemedText style={styles.dropdownText}>
          {selectedOption?.label ?? value}
        </ThemedText>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={14}
          color={colors.textTertiary}
        />
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

interface ProgramContextDrawerProps {
  visible: boolean;
  onClose: () => void;
}

export function ProgramContextDrawer({
  visible,
  onClose,
}: ProgramContextDrawerProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const modeColors = ModeColors.sports;
  const insets = useSafeAreaInsets();
  const { state, setProgram } = useAppContext();

  // Local state for context configuration
  const [context, setContext] = useState<ProgramContext>(DEFAULT_PROGRAM_CONTEXT);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    clusters: false,
    positions: true,
    biases: true,
  });

  const slideAnim = useRef(new Animated.Value(DRAWER_WIDTH)).current;
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
          toValue: DRAWER_WIDTH,
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

  const currentProgram = state.program ?? PROGRAMS[0];

  const handleProgramSelect = (program: Program) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProgram(program);
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateClusterWeight = (cluster: ClusterType, delta: number) => {
    setContext((prev) => {
      const newWeights = prev.clusterWeights.map((cw) => {
        if (cw.cluster === cluster) {
          return { ...cw, weight: Math.max(0, Math.min(100, cw.weight + delta)) };
        }
        return cw;
      });
      return { ...prev, clusterWeights: newWeights };
    });
  };

  const updatePositionImportance = (position: Position, importance: ImportanceLevel) => {
    setContext((prev) => ({
      ...prev,
      positionImportance: prev.positionImportance.map((pi) =>
        pi.position === position ? { ...pi, importance } : pi
      ),
    }));
  };

  const toggleBias = (biasType: string) => {
    setContext((prev) => ({
      ...prev,
      biases: prev.biases.map((b) =>
        b.type === biasType ? { ...b, enabled: !b.enabled } : b
      ),
    }));
  };

  // Auto-save indicator
  const [savedIndicator, setSavedIndicator] = useState(false);
  const savedFadeAnim = useRef(new Animated.Value(0)).current;
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialContextRef = useRef(JSON.stringify(context));

  // Auto-save with 500ms debounce
  useEffect(() => {
    const currentJson = JSON.stringify(context);
    if (currentJson === initialContextRef.current) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('kx:programContext', currentJson);
        await saveProgramContextVersion(context);

        // Show saved indicator
        setSavedIndicator(true);
        Animated.sequence([
          Animated.timing(savedFadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(1200),
          Animated.timing(savedFadeAnim, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]).start(() => setSavedIndicator(false));
      } catch (error) {
        console.error('Failed to auto-save program context:', error);
      }
    }, 500);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [context, savedFadeAnim]);

  if (!visible) return null;

  const importanceLevels: ImportanceLevel[] = ['critical', 'high', 'medium', 'low'];

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
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <ThemedText style={styles.headerTitle}>Team System</ThemedText>
          <Pressable
            style={({ pressed }) => [
              styles.closeButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={onClose}
          >
            <IconSymbol name="xmark" size={20} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Program Selector */}
          <View style={styles.section}>
            <SectionHeader title="ACTIVE PROGRAM" colors={colors} />
            <View style={styles.programGrid}>
              {PROGRAMS.map((program) => {
                const isSelected = program.id === currentProgram.id;
                return (
                  <Pressable
                    key={program.id}
                    style={[
                      styles.programChip,
                      {
                        backgroundColor: isSelected ? modeColors.primary : colors.backgroundSecondary,
                        borderColor: isSelected ? modeColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => handleProgramSelect(program)}
                  >
                    <ThemedText
                      style={[
                        styles.programChipText,
                        { color: isSelected ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {program.name}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Program Resources */}
          <View style={styles.section}>
            <SectionHeader title="PROGRAM RESOURCES" colors={colors} />
            <View style={[styles.resourceCard, { backgroundColor: colors.backgroundSecondary }]}>
              <View style={styles.resourceRow}>
                <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
                  Scholarships
                </ThemedText>
                <ThemedText style={styles.resourceValue}>
                  {context.scholarshipsUsed} / {context.scholarships}
                </ThemedText>
              </View>
              <View style={[styles.resourceBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    styles.resourceBarFill,
                    {
                      width: `${(context.scholarshipsUsed / context.scholarships) * 100}%`,
                      backgroundColor: modeColors.primary,
                    },
                  ]}
                />
              </View>
              <View style={[styles.resourceRow, { marginTop: Spacing.sm }]}>
                <ThemedText style={[styles.resourceLabel, { color: colors.textSecondary }]}>
                  NIL Budget
                </ThemedText>
                <ThemedText style={styles.resourceValue}>
                  {formatCurrency(context.nilUsed)} / {formatCurrency(context.nilBudget)}
                </ThemedText>
              </View>
              <View style={[styles.resourceBar, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    styles.resourceBarFill,
                    {
                      width: `${(context.nilUsed / context.nilBudget) * 100}%`,
                      backgroundColor: '#f5f5f5',
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* System Preset */}
          <View style={styles.section}>
            <SectionHeader title="SYSTEM PRESET" colors={colors} />
            <Dropdown
              value={context.systemPreset}
              options={SYSTEM_PRESETS.map((p) => ({ value: p.value, label: p.label }))}
              onSelect={(v) => setContext((prev) => ({ ...prev, systemPreset: v as SystemPreset }))}
              colors={colors}
            />
            <ThemedText style={[styles.presetDescription, { color: colors.textSecondary }]}>
              {SYSTEM_PRESETS.find((p) => p.value === context.systemPreset)?.description}
            </ThemedText>
          </View>

          {/* Play Style */}
          <View style={styles.section}>
            <SectionHeader title="PLAY STYLE" colors={colors} />
            <View style={styles.styleRow}>
              <View style={styles.styleColumn}>
                <ThemedText style={[styles.styleLabel, { color: colors.textTertiary }]}>
                  Offensive
                </ThemedText>
                <Dropdown
                  value={context.offensiveStyle}
                  options={OFFENSIVE_STYLES}
                  onSelect={(v) => setContext((prev) => ({ ...prev, offensiveStyle: v as OffensiveStyle }))}
                  colors={colors}
                />
              </View>
              <View style={styles.styleColumn}>
                <ThemedText style={[styles.styleLabel, { color: colors.textTertiary }]}>
                  Defensive
                </ThemedText>
                <Dropdown
                  value={context.defensiveStyle}
                  options={DEFENSIVE_STYLES}
                  onSelect={(v) => setContext((prev) => ({ ...prev, defensiveStyle: v as DefensiveStyle }))}
                  colors={colors}
                />
              </View>
            </View>

            {/* Tempo Slider */}
            <View style={styles.tempoSection}>
              <View style={styles.tempoHeader}>
                <ThemedText style={[styles.styleLabel, { color: colors.textTertiary }]}>
                  Tempo
                </ThemedText>
                <ThemedText style={[styles.tempoValue, { color: modeColors.primary }]}>
                  {context.tempo < 40 ? 'Slow' : context.tempo < 60 ? 'Moderate' : context.tempo < 80 ? 'Fast' : 'Very Fast'}
                </ThemedText>
              </View>
              <SimpleSlider
                value={context.tempo}
                onValueChange={(v) => setContext((prev) => ({ ...prev, tempo: v }))}
                colors={colors}
                accentColor={modeColors.primary}
              />
            </View>
          </View>

          {/* Cluster Weighting */}
          <View style={styles.section}>
            <SectionHeader
              title="CLUSTER WEIGHTING"
              colors={colors}
              collapsed={collapsedSections.clusters}
              onToggle={() => toggleSection('clusters')}
            />
            {!collapsedSections.clusters && (
              <View style={styles.clusterList}>
                {context.clusterWeights.map((cw) => (
                  <View key={cw.cluster} style={styles.clusterRow}>
                    <View style={styles.clusterInfo}>
                      <ThemedText style={styles.clusterLabel}>
                        {CLUSTER_LABELS[cw.cluster].label}
                      </ThemedText>
                      <ThemedText style={[styles.clusterDesc, { color: colors.textTertiary }]}>
                        {CLUSTER_LABELS[cw.cluster].description}
                      </ThemedText>
                    </View>
                    <View style={styles.clusterControls}>
                      <Pressable
                        style={[styles.clusterButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => updateClusterWeight(cw.cluster, -2)}
                      >
                        <IconSymbol name="minus" size={12} color={colors.text} />
                      </Pressable>
                      <ThemedText style={[styles.clusterValue, { color: modeColors.primary }]}>
                        {cw.weight}
                      </ThemedText>
                      <Pressable
                        style={[styles.clusterButton, { backgroundColor: colors.backgroundSecondary }]}
                        onPress={() => updateClusterWeight(cw.cluster, 2)}
                      >
                        <IconSymbol name="plus" size={12} color={colors.text} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Position Importance */}
          <View style={styles.section}>
            <SectionHeader
              title="POSITION IMPORTANCE"
              colors={colors}
              collapsed={collapsedSections.positions}
              onToggle={() => toggleSection('positions')}
            />
            {!collapsedSections.positions && (
              <View style={styles.positionList}>
                {context.positionImportance.map((pi) => (
                  <View key={pi.position} style={styles.positionRow}>
                    <ThemedText style={styles.positionLabel}>
                      {POSITION_LABELS[pi.position]}
                    </ThemedText>
                    <View style={styles.importanceButtons}>
                      {importanceLevels.map((level) => (
                        <Pressable
                          key={level}
                          style={[
                            styles.importanceButton,
                            pi.importance === level && {
                              backgroundColor: getImportanceColor(level),
                            },
                          ]}
                          onPress={() => updatePositionImportance(pi.position, level)}
                        >
                          <ThemedText
                            style={[
                              styles.importanceText,
                              { color: pi.importance === level ? '#FFFFFF' : colors.textTertiary },
                            ]}
                          >
                            {level.charAt(0).toUpperCase()}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
                <View style={styles.importanceLegend}>
                  <ThemedText style={[styles.legendText, { color: colors.textTertiary }]}>
                    C = Critical • H = High • M = Medium • L = Low
                  </ThemedText>
                </View>
              </View>
            )}
          </View>

          {/* Program Biases */}
          <View style={styles.section}>
            <SectionHeader
              title="PROGRAM BIASES"
              colors={colors}
              collapsed={collapsedSections.biases}
              onToggle={() => toggleSection('biases')}
            />
            {!collapsedSections.biases && (
              <View style={styles.biasList}>
                {context.biases.map((bias) => (
                  <Pressable
                    key={bias.type}
                    style={[
                      styles.biasRow,
                      {
                        backgroundColor: bias.enabled ? modeColors.primary + '15' : colors.backgroundSecondary,
                        borderColor: bias.enabled ? modeColors.primary : colors.border,
                      },
                    ]}
                    onPress={() => toggleBias(bias.type)}
                  >
                    <View style={styles.biasInfo}>
                      <ThemedText style={[styles.biasLabel, bias.enabled && { color: modeColors.primary }]}>
                        {BIAS_LABELS[bias.type].label}
                      </ThemedText>
                      <ThemedText style={[styles.biasDesc, { color: colors.textTertiary }]}>
                        {BIAS_LABELS[bias.type].description}
                      </ThemedText>
                    </View>
                    <View
                      style={[
                        styles.biasToggle,
                        { backgroundColor: bias.enabled ? modeColors.primary : colors.backgroundTertiary },
                      ]}
                    >
                      <View
                        style={[
                          styles.biasToggleKnob,
                          { transform: [{ translateX: bias.enabled ? 14 : 0 }] },
                        ]}
                      />
                    </View>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer with auto-save indicator */}
        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          {savedIndicator && (
            <Animated.View style={[styles.savedIndicator, { opacity: savedFadeAnim }]}>
              <IconSymbol name="checkmark.circle.fill" size={14} color={Brand.success} />
              <ThemedText style={[styles.savedText, { color: Brand.success }]}>Saved</ThemedText>
            </Animated.View>
          )}
          <Pressable
            style={[styles.footerButton, { backgroundColor: colors.backgroundSecondary }]}
            onPress={onClose}
          >
            <ThemedText style={styles.footerButtonText}>Close</ThemedText>
          </Pressable>
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
  drawer: {
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
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  closeButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.sm,
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

  // Biases
  biasList: {
    gap: Spacing.xs,
  },
  biasRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  biasInfo: {
    flex: 1,
  },
  biasLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  biasDesc: {
    fontSize: 11,
  },
  biasToggle: {
    width: 36,
    height: 22,
    borderRadius: 11,
    padding: 2,
  },
  biasToggleKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  savedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  footerButton: {
    flex: 1,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  footerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
