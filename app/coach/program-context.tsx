/**
 * Coach Program Context Screen
 * Canonical Program Context editor per KaNeXT spec.
 *
 * SYSTEM EMPHASIS (7 clusters in 2 groups)
 * - Offense (53%): Shooting, Finishing, Playmaking
 * - Defense (47%): On-Ball, Team, Rebounding, Frame
 * - Total always = 100
 * - Presets set exact cluster values
 */

import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { ThemedText } from '@/components/themed-text';
import { TabFooter } from '@/components/tab-footer';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const HUB_TABS = [
  { id: 'home', label: 'Home' },
  { id: 'recruiting', label: 'Recruiting', route: '/coach/recruiting' },
  { id: 'roster', label: 'Roster' },
  { id: 'games', label: 'Games', route: '/coach/games' },
  { id: 'injuries', label: 'Injuries', route: '/coach/injuries' },
  { id: 'program-context', label: 'Team System' },
  { id: 'film', label: 'Film', route: '/coach/film' },
];

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'kx:programContext';

const MIN_VALUE = 0.0; // Allow zero
const TARGET_TOTAL = 100.0;

// UI Emphasis Groups (7 clusters in 2 groups)
type EmphasisGroup = 'offense' | 'defense';

// Fixed section totals (53/47 split, always sum to 100)
const OFFENSE_TOTAL = 53;
const DEFENSE_TOTAL = 47;

// UI sliders per group (7 total)
const UI_SLIDERS = {
  offense: [
    { id: 'shooting', label: 'Shooting' },
    { id: 'finishing', label: 'Finishing' },
    { id: 'playmaking', label: 'Playmaking' },
  ],
  defense: [
    { id: 'onBallDefense', label: 'On-Ball' },
    { id: 'teamDefense', label: 'Team' },
    { id: 'rebounding', label: 'Rebounding' },
    { id: 'frame', label: 'Frame' },
  ],
} as const;

type UIEmphasisId = 'shooting' | 'finishing' | 'playmaking' | 'onBallDefense' | 'teamDefense' | 'rebounding' | 'frame';

// Default section totals (locked at 53/47)
const DEFAULT_SECTION_TOTALS = {
  offense: OFFENSE_TOTAL,
  defense: DEFENSE_TOTAL,
};

// Offensive System presets (sum = 53)
const OFFENSIVE_SYSTEMS = [
  { id: 'spread-pnr', label: 'Spread Pick-and-Roll', weights: { shooting: 18, finishing: 16, playmaking: 19 } },
  { id: '5-out', label: '5-Out Motion', weights: { shooting: 18, finishing: 17, playmaking: 18 } },
  { id: 'motion', label: 'Motion / Read & React', weights: { shooting: 17, finishing: 16, playmaking: 20 } },
  { id: 'pace-space', label: 'Pace & Space', weights: { shooting: 20, finishing: 17, playmaking: 16 } },
  { id: 'dribble-drive', label: 'Dribble Drive', weights: { shooting: 15, finishing: 21, playmaking: 17 } },
  { id: 'princeton', label: 'Princeton', weights: { shooting: 15, finishing: 18, playmaking: 20 } },
  { id: 'flex', label: 'Flex', weights: { shooting: 16, finishing: 20, playmaking: 17 } },
  { id: 'swing', label: 'Swing', weights: { shooting: 17, finishing: 18, playmaking: 18 } },
  { id: 'post-centric', label: 'Post-Centric / Inside-Out', weights: { shooting: 13, finishing: 25, playmaking: 15 } },
  { id: 'moreyball', label: 'Moreyball', weights: { shooting: 22, finishing: 21, playmaking: 10 } },
  { id: 'heliocentric', label: 'Heliocentric', weights: { shooting: 16, finishing: 16, playmaking: 21 } },
];

// Defensive System presets (sum = 47)
const DEFENSIVE_SYSTEMS = [
  { id: 'containment', label: 'Containment Man', weights: { onBallDefense: 18, teamDefense: 15, rebounding: 8, frame: 6 } },
  { id: 'pack-line', label: 'Pack Line', weights: { onBallDefense: 12, teamDefense: 18, rebounding: 10, frame: 7 } },
  { id: 'pressure-man', label: 'Pressure Man (Denial)', weights: { onBallDefense: 20, teamDefense: 15, rebounding: 5, frame: 7 } },
  { id: 'switch', label: 'Switch Everything', weights: { onBallDefense: 16, teamDefense: 15, rebounding: 7, frame: 9 } },
  { id: 'ice', label: 'ICE / No-Middle', weights: { onBallDefense: 17, teamDefense: 16, rebounding: 7, frame: 7 } },
  { id: 'zone', label: 'Zone (Structured)', weights: { onBallDefense: 10, teamDefense: 20, rebounding: 10, frame: 7 } },
  { id: 'matchup-zone', label: 'Matchup Zone / Hybrid', weights: { onBallDefense: 13, teamDefense: 19, rebounding: 8, frame: 7 } },
  { id: 'press', label: 'Press', weights: { onBallDefense: 19, teamDefense: 16, rebounding: 5, frame: 7 } },
  { id: 'junk-special', label: 'Junk / Special', weights: { onBallDefense: 14, teamDefense: 18, rebounding: 8, frame: 7 } },
];

const TEMPO_OPTIONS = ['Slow', 'Medium', 'Fast'];
const PRIMARY_ENGINE_POSITIONS = ['PG', 'CG', 'Wing', 'Forward', 'Big'];

// =============================================================================
// TYPES
// =============================================================================

// Backend storage format (7 clusters)
interface EmphasisProfile {
  shooting: number;
  finishing: number;
  playmaking: number;
  onBallDefense: number;
  teamDefense: number;
  rebounding: number;
  frame: number;
}

// UI display format (same as backend - 7 sliders)
interface UIEmphasisProfile {
  shooting: number;
  finishing: number;
  playmaking: number;
  onBallDefense: number;
  teamDefense: number;
  rebounding: number;
  frame: number;
}

// Section totals (locked at 53/47)
interface SectionTotals {
  offense: number;  // Always 53
  defense: number;  // Always 47
}

interface ProgramContextState {
  scholarships: number;
  nilBudget: number;
  offensiveSystem: string;
  defensiveSystem: string;
  tempo: string;
  primaryEnginePosition: string;
  emphasis: EmphasisProfile;
  // Section totals (locked at 53/47)
  sectionTotals?: SectionTotals;
}

// =============================================================================
// NORMALIZATION FUNCTIONS
// =============================================================================

/**
 * Apply offensive preset - sets offense cluster values directly.
 * Defense clusters stay unchanged.
 */
function applyOffensePreset(
  systemId: string,
  _currentSectionTotals: SectionTotals,
  currentUIEmphasis: UIEmphasisProfile
): { sectionTotals: SectionTotals; uiEmphasis: UIEmphasisProfile; emphasis: EmphasisProfile } {
  const system = OFFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? OFFENSIVE_SYSTEMS[0];
  const { weights } = system;

  // Section totals are always fixed at 53/47
  const newSectionTotals: SectionTotals = {
    offense: OFFENSE_TOTAL,
    defense: DEFENSE_TOTAL,
  };

  // Apply offense weights directly, keep defense unchanged
  const newUIEmphasis: UIEmphasisProfile = {
    shooting: weights.shooting,
    finishing: weights.finishing,
    playmaking: weights.playmaking,
    onBallDefense: currentUIEmphasis.onBallDefense,
    teamDefense: currentUIEmphasis.teamDefense,
    rebounding: currentUIEmphasis.rebounding,
    frame: currentUIEmphasis.frame,
  };

  return {
    sectionTotals: newSectionTotals,
    uiEmphasis: newUIEmphasis,
    emphasis: newUIEmphasis, // UI and backend are now the same
  };
}

/**
 * Apply defensive preset - sets defense cluster values directly.
 * Offense clusters stay unchanged.
 */
function applyDefensePreset(
  systemId: string,
  _currentSectionTotals: SectionTotals,
  currentUIEmphasis: UIEmphasisProfile
): { sectionTotals: SectionTotals; uiEmphasis: UIEmphasisProfile; emphasis: EmphasisProfile } {
  const system = DEFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? DEFENSIVE_SYSTEMS[0];
  const { weights } = system;

  // Section totals are always fixed at 53/47
  const newSectionTotals: SectionTotals = {
    offense: OFFENSE_TOTAL,
    defense: DEFENSE_TOTAL,
  };

  // Apply defense weights directly, keep offense unchanged
  const newUIEmphasis: UIEmphasisProfile = {
    shooting: currentUIEmphasis.shooting,
    finishing: currentUIEmphasis.finishing,
    playmaking: currentUIEmphasis.playmaking,
    onBallDefense: weights.onBallDefense,
    teamDefense: weights.teamDefense,
    rebounding: weights.rebounding,
    frame: weights.frame,
  };

  return {
    sectionTotals: newSectionTotals,
    uiEmphasis: newUIEmphasis,
    emphasis: newUIEmphasis, // UI and backend are now the same
  };
}

/**
 * Redistribute slider values within a section to maintain section total.
 * When one slider increases, others decrease proportionally.
 */
function redistributeWithinSection(
  sliderId: UIEmphasisId,
  newValue: number,
  currentEmphasis: UIEmphasisProfile,
  sectionTotals: SectionTotals
): UIEmphasisProfile {
  const result = { ...currentEmphasis };

  // Determine which section this slider belongs to
  const offenseSliders: UIEmphasisId[] = ['shooting', 'finishing', 'playmaking'];
  const defenseSliders: UIEmphasisId[] = ['onBallDefense', 'teamDefense', 'rebounding', 'frame'];

  let sectionSliders: UIEmphasisId[];
  let sectionTotal: number;

  if (offenseSliders.includes(sliderId)) {
    sectionSliders = offenseSliders;
    sectionTotal = sectionTotals.offense;
  } else {
    sectionSliders = defenseSliders;
    sectionTotal = sectionTotals.defense;
  }

  // Clamp new value to valid range
  const clampedValue = Math.max(MIN_VALUE, Math.min(sectionTotal, newValue));
  result[sliderId] = Math.round(clampedValue * 10) / 10;

  // Get other sliders in the section
  const otherSliders = sectionSliders.filter((id) => id !== sliderId);

  // Calculate how much we need to redistribute
  const currentOtherSum = otherSliders.reduce((sum, id) => sum + currentEmphasis[id], 0);
  const targetOtherSum = Math.round((sectionTotal - result[sliderId]) * 10) / 10;

  if (currentOtherSum > 0 && otherSliders.length > 0) {
    // Redistribute proportionally
    const scale = targetOtherSum / currentOtherSum;
    let redistributedSum = 0;

    for (let i = 0; i < otherSliders.length - 1; i++) {
      const id = otherSliders[i];
      result[id] = Math.max(MIN_VALUE, Math.round(currentEmphasis[id] * scale * 10) / 10);
      redistributedSum += result[id];
    }

    // Last slider gets the remainder to ensure exact sum
    const lastId = otherSliders[otherSliders.length - 1];
    result[lastId] = Math.max(MIN_VALUE, Math.round((targetOtherSum - redistributedSum) * 10) / 10);
  } else if (otherSliders.length > 0) {
    // If other sliders are all zero, distribute evenly
    const evenShare = Math.round((targetOtherSum / otherSliders.length) * 10) / 10;
    let distributedSum = 0;

    for (let i = 0; i < otherSliders.length - 1; i++) {
      result[otherSliders[i]] = evenShare;
      distributedSum += evenShare;
    }

    result[otherSliders[otherSliders.length - 1]] = Math.round((targetOtherSum - distributedSum) * 10) / 10;
  }

  return result;
}

function getDefaultSectionTotals(): SectionTotals {
  return { offense: OFFENSE_TOTAL, defense: DEFENSE_TOTAL };
}

function getDefaultEmphasis(): EmphasisProfile {
  // Default: Motion / Read & React + Containment Man
  return {
    shooting: 17,
    finishing: 16,
    playmaking: 20,
    onBallDefense: 18,
    teamDefense: 15,
    rebounding: 8,
    frame: 6,
  };
}

function getDefaultUIEmphasis(): UIEmphasisProfile {
  // Same as backend
  return getDefaultEmphasis();
}

function getDefaultState(): ProgramContextState {
  return {
    scholarships: 13,
    nilBudget: 150000,
    offensiveSystem: 'motion',
    defensiveSystem: 'containment',
    tempo: 'Fast',
    primaryEnginePosition: 'PG',
    emphasis: getDefaultEmphasis(),
    sectionTotals: getDefaultSectionTotals(),
  };
}

// =============================================================================
// UI <-> BACKEND CONVERSION (now identical)
// =============================================================================

/**
 * Convert backend to UI format (now identical)
 */
function backendToUI(emphasis: EmphasisProfile, _reboundingSplit?: number): UIEmphasisProfile {
  return { ...emphasis };
}

/**
 * Convert UI to backend format (now identical)
 */
function uiToBackend(uiEmphasis: UIEmphasisProfile): EmphasisProfile {
  return { ...uiEmphasis };
}

/**
 * Calculate group totals from UI emphasis
 */
function getGroupTotals(uiEmphasis: UIEmphasisProfile): SectionTotals {
  return {
    offense: Math.round((uiEmphasis.shooting + uiEmphasis.finishing + uiEmphasis.playmaking) * 10) / 10,
    defense: Math.round((uiEmphasis.onBallDefense + uiEmphasis.teamDefense + uiEmphasis.rebounding + uiEmphasis.frame) * 10) / 10,
  };
}

// =============================================================================
// COMPONENT
// =============================================================================

export default function CoachProgramContextScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [state, setState] = useState<ProgramContextState>(getDefaultState);
  // UI emphasis state (8 sliders)
  const [uiEmphasis, setUIEmphasis] = useState<UIEmphasisProfile>(getDefaultUIEmphasis);
  // Section totals (locked by preset, only change when preset applied)
  const [sectionTotals, setSectionTotals] = useState<SectionTotals>(getDefaultSectionTotals);
  // Inline accordion pickers for Offensive/Defensive systems (not modals)
  const [expandedSystemPicker, setExpandedSystemPicker] = useState<'offensive' | 'defensive' | null>(null);
  // Preview states for system pickers (null = list view, string = preview that system)
  const [previewOffenseSystem, setPreviewOffenseSystem] = useState<string | null>(null);
  const [previewDefenseSystem, setPreviewDefenseSystem] = useState<string | null>(null);
  const [showTempoPicker, setShowTempoPicker] = useState(false);
  const [showEnginePicker, setShowEnginePicker] = useState(false);
  const [emphasisExpanded, setEmphasisExpanded] = useState(false); // Start collapsed by default
  const [expandedEmphasisGroup, setExpandedEmphasisGroup] = useState<EmphasisGroup | null>(null);
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load persisted state on mount
  useEffect(() => {
    const loadState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migrate from old formats
          if (!parsed.emphasis || parsed.emphasis.shooting === undefined) {
            const newState = { ...getDefaultState(), ...parsed, emphasis: getDefaultEmphasis() };
            setState(newState);
            setUIEmphasis(backendToUI(newState.emphasis, newState.reboundingSplit ?? 0.5));
            setSectionTotals(newState.sectionTotals ?? getDefaultSectionTotals());
          } else {
            const loadedState = { ...getDefaultState(), ...parsed };
            setState(loadedState);
            setUIEmphasis(backendToUI(parsed.emphasis, parsed.reboundingSplit ?? 0.5));
            // Load section totals or derive from UI emphasis
            if (parsed.sectionTotals) {
              setSectionTotals(parsed.sectionTotals);
            } else {
              // Derive from emphasis values for migration
              const uiEmp = backendToUI(parsed.emphasis, parsed.reboundingSplit ?? 0.5);
              setSectionTotals(getGroupTotals(uiEmp));
            }
          }
        }
      } catch (e) {
        console.error('Failed to load program context:', e);
      }
    };
    loadState();
  }, []);

  // Format currency for display
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Show toast and auto-hide after 2 seconds
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // Calculate preview values for offensive preset
  const calculateOffensePreview = useCallback((systemId: string) => {
    const result = applyOffensePreset(systemId, sectionTotals, uiEmphasis);
    return result.emphasis;
  }, [sectionTotals, uiEmphasis]);

  // Calculate preview values for defensive preset
  const calculateDefensePreview = useCallback((systemId: string) => {
    const result = applyDefensePreset(systemId, sectionTotals, uiEmphasis);
    return result.emphasis;
  }, [sectionTotals, uiEmphasis]);

  // Toggle inline accordion for system pickers (only one open at a time)
  // When opening, immediately show preview with current system (preview-first UX)
  const toggleSystemPicker = useCallback((picker: 'offensive' | 'defensive') => {
    setExpandedSystemPicker((prev) => {
      if (prev === picker) {
        // Closing - reset preview states
        setPreviewOffenseSystem(null);
        setPreviewDefenseSystem(null);
        return null;
      } else {
        // Opening - immediately show preview with current system
        if (picker === 'offensive') {
          setPreviewOffenseSystem(state.offensiveSystem);
          setPreviewDefenseSystem(null);
        } else {
          setPreviewDefenseSystem(state.defensiveSystem);
          setPreviewOffenseSystem(null);
        }
        return picker;
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [state.offensiveSystem, state.defensiveSystem]);

  // Handle offensive system option tap - enters preview mode (does NOT apply yet)
  const handleOffensiveSystemTap = useCallback((systemId: string) => {
    setPreviewOffenseSystem(systemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Apply offensive system preset (from preview) - hard reset
  const handleOffensiveSystemApply = useCallback(() => {
    if (!previewOffenseSystem) return;

    const oldEmphasis = state.emphasis;
    const result = applyOffensePreset(previewOffenseSystem, sectionTotals, uiEmphasis);

    // Calculate deltas for toast
    const deltas: string[] = [];
    const shootingDelta = Math.round((result.emphasis.shooting - oldEmphasis.shooting) * 10) / 10;
    const finishingDelta = Math.round((result.emphasis.finishing - oldEmphasis.finishing) * 10) / 10;
    const playmakingDelta = Math.round((result.emphasis.playmaking - oldEmphasis.playmaking) * 10) / 10;

    if (Math.abs(shootingDelta) >= 0.1) {
      deltas.push(`Shooting ${shootingDelta >= 0 ? '+' : ''}${shootingDelta}`);
    }
    if (Math.abs(finishingDelta) >= 0.1) {
      deltas.push(`Finishing ${finishingDelta >= 0 ? '+' : ''}${finishingDelta}`);
    }
    if (Math.abs(playmakingDelta) >= 0.1) {
      deltas.push(`Playmaking ${playmakingDelta >= 0 ? '+' : ''}${playmakingDelta}`);
    }

    // Hard reset: apply new section totals + slider values
    setState((prev) => ({
      ...prev,
      offensiveSystem: previewOffenseSystem,
      emphasis: result.emphasis,
      sectionTotals: result.sectionTotals,
    }));
    setUIEmphasis(result.uiEmphasis);
    setSectionTotals(result.sectionTotals);
    setPreviewOffenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show toast with section total info
    if (deltas.length > 0) {
      showToast(`Offense ${result.sectionTotals.offense}% applied`);
    } else {
      showToast(`Offense ${result.sectionTotals.offense}% (no changes)`);
    }
  }, [previewOffenseSystem, state.emphasis, sectionTotals, uiEmphasis, showToast]);

  // Cancel offensive preview (close accordion)
  const handleOffensiveSystemCancel = useCallback(() => {
    setPreviewOffenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle defensive system option tap - enters preview mode (does NOT apply yet)
  const handleDefensiveSystemTap = useCallback((systemId: string) => {
    setPreviewDefenseSystem(systemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Apply defensive system preset (from preview) - hard reset
  const handleDefensiveSystemApply = useCallback(() => {
    if (!previewDefenseSystem) return;

    const oldEmphasis = state.emphasis;
    const result = applyDefensePreset(previewDefenseSystem, sectionTotals, uiEmphasis);

    // Calculate deltas for toast
    const deltas: string[] = [];
    const obdDelta = Math.round((result.emphasis.onBallDefense - oldEmphasis.onBallDefense) * 10) / 10;
    const tdDelta = Math.round((result.emphasis.teamDefense - oldEmphasis.teamDefense) * 10) / 10;

    if (Math.abs(obdDelta) >= 0.1) {
      deltas.push(`OBD ${obdDelta >= 0 ? '+' : ''}${obdDelta}`);
    }
    if (Math.abs(tdDelta) >= 0.1) {
      deltas.push(`Team Defense ${tdDelta >= 0 ? '+' : ''}${tdDelta}`);
    }

    // Hard reset: apply new section totals + slider values
    setState((prev) => ({
      ...prev,
      defensiveSystem: previewDefenseSystem,
      emphasis: result.emphasis,
      sectionTotals: result.sectionTotals,
    }));
    setUIEmphasis(result.uiEmphasis);
    setSectionTotals(result.sectionTotals);
    setPreviewDefenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Show toast with section total info
    if (deltas.length > 0) {
      showToast(`Defense ${result.sectionTotals.defense}% applied`);
    } else {
      showToast(`Defense ${result.sectionTotals.defense}% (no changes)`);
    }
  }, [previewDefenseSystem, state.emphasis, sectionTotals, uiEmphasis, showToast]);

  // Cancel defensive preview (close accordion)
  const handleDefensiveSystemCancel = useCallback(() => {
    setPreviewDefenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle UI slider change - redistributes within section to maintain locked section total
  const handleSliderChange = useCallback((sliderId: UIEmphasisId, newValue: number) => {
    const newEmphasis = redistributeWithinSection(sliderId, newValue, uiEmphasis, sectionTotals);
    setUIEmphasis(newEmphasis);
  }, [uiEmphasis, sectionTotals]);

  // Toggle emphasis group accordion
  const toggleEmphasisGroup = useCallback((group: EmphasisGroup) => {
    setExpandedEmphasisGroup((prev) => (prev === group ? null : group));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle save - persist state
  const handleSave = async () => {
    try {
      const stateToSave = {
        ...state,
        emphasis: uiEmphasis,
        sectionTotals,
      };

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
    } catch (e) {
      console.error('Failed to save program context:', e);
    }
  };

  const offensiveSystemLabel =
    OFFENSIVE_SYSTEMS.find((s) => s.id === state.offensiveSystem)?.label || 'Select';
  const defensiveSystemLabel =
    DEFENSIVE_SYSTEMS.find((s) => s.id === state.defensiveSystem)?.label || 'Select';
  const isHeliocentric = state.offensiveSystem === 'heliocentric';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hub Tabs */}
      <View style={[styles.hubTabsContainer, { borderBottomColor: colors.divider, backgroundColor: colors.background }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hubTabsContent}>
          {HUB_TABS.map((tab) => {
            const isActive = tab.id === 'program-context';
            return (
              <Pressable
                key={tab.id}
                style={[styles.hubTab, isActive && [styles.hubTabActive, { borderBottomColor: colors.text }]]}
                onPress={() => {
                  if (tab.id === 'program-context') return;
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (tab.id === 'home' || tab.id === 'roster') {
                    router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
                  } else if (tab.route) {
                    router.replace(tab.route as any);
                  }
                }}
              >
                <ThemedText style={[styles.hubTabLabel, { color: isActive ? colors.text : colors.textTertiary }, isActive && styles.hubTabLabelActive]}>
                  {tab.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== PROGRAM RESOURCES ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PROGRAM RESOURCES</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Scholarships</Text>
              <TextInput
                style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
                value={state.scholarships.toString()}
                onChangeText={(text) => {
                  const num = parseFloat(text) || 0;
                  setState((prev) => ({ ...prev, scholarships: num }));
                }}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.inputRow}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>NIL Budget</Text>
              <TextInput
                style={[styles.numericInput, { color: colors.text, borderColor: colors.border }]}
                value={state.nilBudget.toString()}
                onChangeText={(text) => {
                  const num = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                  setState((prev) => ({ ...prev, nilBudget: num }));
                }}
                keyboardType="number-pad"
                placeholder="$0"
                placeholderTextColor={colors.textTertiary}
              />
              <Text style={[styles.currencyPreview, { color: colors.textTertiary }]}>
                {formatCurrency(state.nilBudget)}
              </Text>
            </View>
          </View>

          {/* ===== SYSTEMS ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SYSTEMS</Text>
          <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Offensive System - Inline Accordion */}
            <Pressable
              style={styles.selectorRow}
              onPress={() => toggleSystemPicker('offensive')}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Offensive System</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{offensiveSystemLabel}</Text>
            </Pressable>

            {/* Inline Offensive System Options OR Preview */}
            {expandedSystemPicker === 'offensive' && (
              <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
                {previewOffenseSystem === null ? (
                  // List view - show all options
                  OFFENSIVE_SYSTEMS.map((system) => (
                    <Pressable
                      key={system.id}
                      style={[
                        styles.inlineOption,
                        state.offensiveSystem === system.id && { backgroundColor: colors.background },
                      ]}
                      onPress={() => handleOffensiveSystemTap(system.id)}
                    >
                      <Text
                        style={[
                          styles.inlineOptionText,
                          { color: state.offensiveSystem === system.id ? colors.tint : colors.text },
                        ]}
                      >
                        {system.label}
                      </Text>
                      {state.offensiveSystem === system.id && (
                        <IconSymbol name="checkmark" size={16} color={colors.tint} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  // Preview view - show what would change
                  <PresetPreview
                    type="offensive"
                    systemId={previewOffenseSystem}
                    systemLabel={OFFENSIVE_SYSTEMS.find((s) => s.id === previewOffenseSystem)?.label || ''}
                    currentEmphasis={state.emphasis}
                    newEmphasis={calculateOffensePreview(previewOffenseSystem)}
                    onCancel={handleOffensiveSystemCancel}
                    onApply={handleOffensiveSystemApply}
                    onSelectDifferent={handleOffensiveSystemTap}
                    colors={colors}
                  />
                )}
              </View>
            )}

            {isHeliocentric && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <Pressable
                  style={styles.selectorRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowEnginePicker(true);
                  }}
                >
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Primary Engine Position</Text>
                  <Text style={[styles.selectorText, { color: colors.text }]}>{state.primaryEnginePosition}</Text>
                </Pressable>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />

            {/* Defensive System - Inline Accordion */}
            <Pressable
              style={styles.selectorRow}
              onPress={() => toggleSystemPicker('defensive')}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Defensive System</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{defensiveSystemLabel}</Text>
            </Pressable>

            {/* Inline Defensive System Options OR Preview */}
            {expandedSystemPicker === 'defensive' && (
              <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
                {previewDefenseSystem === null ? (
                  // List view - show all options
                  DEFENSIVE_SYSTEMS.map((system) => (
                    <Pressable
                      key={system.id}
                      style={[
                        styles.inlineOption,
                        state.defensiveSystem === system.id && { backgroundColor: colors.background },
                      ]}
                      onPress={() => handleDefensiveSystemTap(system.id)}
                    >
                      <Text
                        style={[
                          styles.inlineOptionText,
                          { color: state.defensiveSystem === system.id ? colors.tint : colors.text },
                        ]}
                      >
                        {system.label}
                      </Text>
                      {state.defensiveSystem === system.id && (
                        <IconSymbol name="checkmark" size={16} color={colors.tint} />
                      )}
                    </Pressable>
                  ))
                ) : (
                  // Preview view - show what would change
                  <PresetPreview
                    type="defensive"
                    systemId={previewDefenseSystem}
                    systemLabel={DEFENSIVE_SYSTEMS.find((s) => s.id === previewDefenseSystem)?.label || ''}
                    currentEmphasis={state.emphasis}
                    newEmphasis={calculateDefensePreview(previewDefenseSystem)}
                    onCancel={handleDefensiveSystemCancel}
                    onApply={handleDefensiveSystemApply}
                    onSelectDifferent={handleDefensiveSystemTap}
                    colors={colors}
                  />
                )}
              </View>
            )}

            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.selectorRow}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowTempoPicker((prev) => !prev);
              }}
            >
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Tempo</Text>
              <Text style={[styles.selectorText, { color: colors.text }]}>{state.tempo}</Text>
            </Pressable>

            {/* Inline Tempo Options */}
            {showTempoPicker && (
              <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
                {TEMPO_OPTIONS.map((tempo) => (
                  <Pressable
                    key={tempo}
                    style={[
                      styles.inlineOption,
                      state.tempo === tempo && { backgroundColor: colors.background },
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setState((prev) => ({ ...prev, tempo }));
                      setShowTempoPicker(false);
                    }}
                  >
                    <Text
                      style={[
                        styles.inlineOptionText,
                        { color: state.tempo === tempo ? colors.tint : colors.text },
                      ]}
                    >
                      {tempo}
                    </Text>
                    {state.tempo === tempo && (
                      <IconSymbol name="checkmark" size={16} color={colors.tint} />
                    )}
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {/* ===== SYSTEM EMPHASIS - Nested Accordion ===== */}
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SYSTEM EMPHASIS</Text>

          {/* Collapsible Header Card */}
          <Pressable
            style={[styles.card, styles.emphasisHeaderCard, { backgroundColor: colors.backgroundSecondary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setEmphasisExpanded((prev) => !prev);
              if (emphasisExpanded) {
                setExpandedEmphasisGroup(null); // Collapse all groups when collapsing main
              }
            }}
          >
            <View style={styles.emphasisHeaderRow}>
              <Text style={[styles.emphasisHeaderTitle, { color: colors.text }]}>System Emphasis</Text>
              <Text style={[styles.emphasisTotalText, { color: colors.textSecondary }]}>
                100%
              </Text>
            </View>
          </Pressable>

          {/* Expanded Content - 3 Group Accordions */}
          {emphasisExpanded && (
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary, marginTop: Spacing.sm }]}>
              {/* Offense Group (53%) - 3 sliders */}
              <Pressable
                style={styles.groupRow}
                onPress={() => toggleEmphasisGroup('offense')}
              >
                <Text style={[styles.groupLabel, { color: colors.text }]}>Offense</Text>
                <Text style={[styles.groupValue, { color: colors.textSecondary }]}>
                  {OFFENSE_TOTAL}%
                </Text>
              </Pressable>
              {expandedEmphasisGroup === 'offense' && (
                <View style={[styles.groupSliders, { borderTopColor: colors.divider }]}>
                  {UI_SLIDERS.offense.map((slider, index) => (
                    <View key={slider.id}>
                      {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                      <View style={styles.sliderRow}>
                        <View style={styles.sliderHeader}>
                          <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{slider.label}</Text>
                          <Text style={[styles.sliderValue, { color: colors.text }]}>
                            {Math.round(uiEmphasis[slider.id as UIEmphasisId])}%
                          </Text>
                        </View>
                        <Slider
                          style={styles.slider}
                          minimumValue={MIN_VALUE}
                          maximumValue={OFFENSE_TOTAL}
                          step={1}
                          value={uiEmphasis[slider.id as UIEmphasisId]}
                          onValueChange={(value) => handleSliderChange(slider.id as UIEmphasisId, value)}
                          minimumTrackTintColor={colorScheme === 'dark' ? '#ffffff' : '#1A1A1A'}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor="#ffffff"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={[styles.divider, { backgroundColor: colors.divider }]} />

              {/* Defense Group (47%) - 4 sliders */}
              <Pressable
                style={styles.groupRow}
                onPress={() => toggleEmphasisGroup('defense')}
              >
                <Text style={[styles.groupLabel, { color: colors.text }]}>Defense</Text>
                <Text style={[styles.groupValue, { color: colors.textSecondary }]}>
                  {DEFENSE_TOTAL}%
                </Text>
              </Pressable>
              {expandedEmphasisGroup === 'defense' && (
                <View style={[styles.groupSliders, { borderTopColor: colors.divider }]}>
                  {UI_SLIDERS.defense.map((slider, index) => (
                    <View key={slider.id}>
                      {index > 0 && <View style={[styles.divider, { backgroundColor: colors.divider }]} />}
                      <View style={styles.sliderRow}>
                        <View style={styles.sliderHeader}>
                          <Text style={[styles.sliderLabel, { color: colors.textSecondary }]}>{slider.label}</Text>
                          <Text style={[styles.sliderValue, { color: colors.text }]}>
                            {Math.round(uiEmphasis[slider.id as UIEmphasisId])}%
                          </Text>
                        </View>
                        <Slider
                          style={styles.slider}
                          minimumValue={MIN_VALUE}
                          maximumValue={DEFENSE_TOTAL}
                          step={1}
                          value={uiEmphasis[slider.id as UIEmphasisId]}
                          onValueChange={(value) => handleSliderChange(slider.id as UIEmphasisId, value)}
                          minimumTrackTintColor={colorScheme === 'dark' ? '#ffffff' : '#1A1A1A'}
                          maximumTrackTintColor={colors.border}
                          thumbTintColor="#ffffff"
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

            </View>
          )}

          {/* Spacer for save button */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button (sticky) */}
      <View
        style={[
          styles.saveContainer,
          { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md, borderTopColor: colors.divider },
        ]}
      >
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            {
              backgroundColor: colorScheme === 'dark'
                ? pressed ? '#d4d4d4' : '#ffffff'
                : pressed ? '#2A2A2A' : '#1A1A1A',
            },
          ]}
          onPress={handleSave}
        >
          <Text style={[styles.saveButtonText, { color: colorScheme === 'dark' ? '#1A1A1A' : '#FFFFFF' }]}>
            Save
          </Text>
        </Pressable>
      </View>

      {/* Modal for Primary Engine Position only */}
      <PickerModal
        visible={showEnginePicker}
        title="Primary Engine Position"
        options={PRIMARY_ENGINE_POSITIONS.map((p) => ({ id: p, label: p }))}
        selected={state.primaryEnginePosition}
        onSelect={(id) => {
          setState((prev) => ({ ...prev, primaryEnginePosition: id }));
          setShowEnginePicker(false);
        }}
        onClose={() => setShowEnginePicker(false)}
        colors={colors}
      />

      {/* Toast notification */}
      {toastMessage && <Toast message={toastMessage} colors={colors} />}

      <TabFooter activeTab="Home" />
    </View>
  );
}

// =============================================================================
// PRESET PREVIEW COMPONENT
// =============================================================================

interface PresetPreviewProps {
  type: 'offensive' | 'defensive';
  systemId: string;
  systemLabel: string;
  currentEmphasis: EmphasisProfile;
  newEmphasis: EmphasisProfile;
  onCancel: () => void;
  onApply: () => void;
  onSelectDifferent: (systemId: string) => void;
  colors: typeof Colors.light;
}

function PresetPreview({
  type,
  systemId,
  systemLabel,
  currentEmphasis,
  newEmphasis,
  onCancel,
  onApply,
  onSelectDifferent,
  colors,
}: PresetPreviewProps) {
  const systems = type === 'offensive' ? OFFENSIVE_SYSTEMS : DEFENSIVE_SYSTEMS;
  // Determine which clusters to show based on type
  const clusters =
    type === 'offensive'
      ? [
          { id: 'shooting' as const, label: 'Shooting' },
          { id: 'finishing' as const, label: 'Finishing' },
          { id: 'playmaking' as const, label: 'Playmaking' },
        ]
      : [
          { id: 'onBallDefense' as const, label: 'On-Ball' },
          { id: 'teamDefense' as const, label: 'Team' },
          { id: 'rebounding' as const, label: 'Rebounding' },
          { id: 'frame' as const, label: 'Frame' },
        ];

  // Calculate totals (always 100 for both)
  const currentTotal = 100;
  const newTotal = 100;

  return (
    <View style={styles.previewContainer}>
      {/* Header */}
      <View style={styles.previewHeader}>
        <Text style={[styles.previewTitle, { color: colors.text }]}>Preview changes</Text>
        <Text style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
          Current → New (Totals stay 100)
        </Text>
      </View>

      {/* System selector (tap different to update preview) */}
      <View style={styles.previewSystemSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.previewSystemList}>
          {systems.map((system) => (
            <Pressable
              key={system.id}
              style={[
                styles.previewSystemChip,
                {
                  backgroundColor: system.id === systemId ? colors.tint : colors.background,
                  borderColor: system.id === systemId ? colors.tint : colors.border,
                },
              ]}
              onPress={() => {
                if (system.id !== systemId) {
                  onSelectDifferent(system.id);
                }
              }}
            >
              <Text
                style={[
                  styles.previewSystemChipText,
                  { color: system.id === systemId ? '#1A1A1A' : colors.text },
                ]}
                numberOfLines={1}
              >
                {system.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Current → New rows */}
      <View style={styles.previewChanges}>
        <View style={styles.previewLabelsRow}>
          <Text style={[styles.previewClusterLabel, { color: colors.textTertiary }]}>Cluster</Text>
          <Text style={[styles.previewValueLabel, { color: colors.textTertiary }]}>Current → New</Text>
        </View>

        {clusters.map((cluster) => {
          const currentVal = Math.round(currentEmphasis[cluster.id] * 10) / 10;
          const newVal = Math.round(newEmphasis[cluster.id] * 10) / 10;
          const delta = newVal - currentVal;
          const deltaSign = delta >= 0 ? '+' : '';
          const hasChange = Math.abs(delta) >= 0.1;

          return (
            <View key={cluster.id} style={styles.previewChangeRow}>
              <Text style={[styles.previewClusterName, { color: colors.text }]}>{cluster.label}</Text>
              <View style={styles.previewValueContainer}>
                <Text style={[styles.previewCurrentValue, { color: colors.textSecondary }]}>
                  {currentVal.toFixed(1)}
                </Text>
                <Text style={[styles.previewArrow, { color: colors.textTertiary }]}> → </Text>
                <Text
                  style={[
                    styles.previewNewValue,
                    { color: hasChange ? colors.tint : colors.text },
                  ]}
                >
                  {newVal.toFixed(1)}
                </Text>
                {hasChange && (
                  <Text
                    style={[
                      styles.previewDelta,
                      { color: delta >= 0 ? '#f5f5f5' : '#6e6e6e' },
                    ]}
                  >
                    {' '}({deltaSign}{delta.toFixed(1)})
                  </Text>
                )}
              </View>
            </View>
          );
        })}

        {/* Total row */}
        <View style={[styles.previewTotalRow, { borderTopColor: colors.divider }]}>
          <Text style={[styles.previewTotalLabel, { color: colors.textSecondary }]}>Total:</Text>
          <Text style={[styles.previewTotalValue, { color: colors.text }]}>
            {currentTotal} → {newTotal}
          </Text>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.previewButtons}>
        <Pressable
          style={[styles.previewButtonCancel, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <Text style={[styles.previewButtonCancelText, { color: colors.text }]}>Cancel</Text>
        </Pressable>
        <Pressable
          style={[styles.previewButtonApply, { backgroundColor: '#ffffff' }]}
          onPress={onApply}
        >
          <Text style={styles.previewButtonApplyText}>Apply Preset</Text>
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// TOAST COMPONENT
// =============================================================================

interface ToastProps {
  message: string;
  colors: typeof Colors.light;
}

function Toast({ message, colors }: ToastProps) {
  return (
    <View style={[styles.toast, { backgroundColor: colors.backgroundSecondary }]}>
      <Text style={[styles.toastText, { color: colors.text }]}>{message}</Text>
    </View>
  );
}

// =============================================================================
// PICKER MODAL
// =============================================================================

interface PickerModalProps {
  visible: boolean;
  title: string;
  options: { id: string; label: string }[];
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  colors: typeof Colors.light;
}

function PickerModal({ visible, title, options, selected, onSelect, onClose, colors }: PickerModalProps) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[styles.modalContent, { backgroundColor: colors.background, paddingBottom: insets.bottom + Spacing.md }]}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
            <Pressable onPress={onClose}>
              <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalScroll}>
            {options.map((option) => (
              <Pressable
                key={option.id}
                style={[styles.modalOption, selected === option.id && { backgroundColor: colors.backgroundSecondary }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onSelect(option.id);
                }}
              >
                <Text style={[styles.modalOptionText, { color: colors.text }]}>{option.label}</Text>
                {selected === option.id && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  hubTabsContainer: { borderBottomWidth: StyleSheet.hairlineWidth },
  hubTabsContent: { paddingHorizontal: Spacing.lg, gap: Spacing.lg },
  hubTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  hubTabActive: { borderBottomWidth: 2 },
  hubTabLabel: { fontSize: 14, fontWeight: '500' },
  hubTabLabelActive: { fontWeight: '600' },
  scrollView: { flex: 1 },
  scrollContent: { padding: Spacing.md },
  sectionLabel: { fontSize: 13, fontWeight: '600', letterSpacing: 0.5, marginBottom: 10, marginLeft: 4, marginTop: Spacing.md },
  card: { borderRadius: BorderRadius.lg, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: Spacing.md },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: Spacing.md, gap: Spacing.sm },
  inputLabel: { fontSize: 15, flex: 1 },
  numericInput: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    minWidth: 80,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  currencyPreview: { fontSize: 13, marginLeft: Spacing.xs },
  selectorRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  selectorValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectorText: { fontSize: 15, fontWeight: '500' },

  // Inline accordion options (for system pickers)
  inlineOptionsList: { borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: 4 },
  inlineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inlineOptionText: { fontSize: 15 },

  // Emphasis section - Collapsible
  emphasisHeaderCard: { marginBottom: Spacing.sm },
  emphasisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  emphasisHeaderTitle: { fontSize: 15, fontWeight: '500' },
  emphasisTotalText: { fontSize: 14, fontWeight: '500' },

  // Total indicator (expanded)
  totalIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  totalIndicatorLabel: { fontSize: 14, fontWeight: '500' },
  totalIndicatorValue: { fontSize: 15, fontWeight: '600' },
  normalizeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: '#ffffff',
  },
  normalizeButtonText: { fontSize: 13, fontWeight: '600', color: '#1A1A1A' },

  // Normalize row (inline within groups card)
  normalizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  normalizeWarning: { fontSize: 14, fontWeight: '500' },

  // Group rows (nested accordion)
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  groupLabel: { fontSize: 15, fontWeight: '500' },
  groupValue: { fontSize: 15, fontWeight: '500' },
  groupSliders: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.sm,
  },

  sliderRow: { padding: Spacing.md },
  sliderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sliderLabel: { fontSize: 15 },
  sliderValue: { fontSize: 15, fontWeight: '600', minWidth: 40, textAlign: 'right' },
  slider: { width: '100%', height: 40 },

  saveContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  saveButton: { height: 50, borderRadius: BorderRadius.lg, alignItems: 'center', justifyContent: 'center' },
  saveButtonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.4)' },
  modalContent: { borderTopLeftRadius: BorderRadius.xl, borderTopRightRadius: BorderRadius.xl, maxHeight: '70%' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalScroll: { maxHeight: 400 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing.md },
  modalOptionText: { fontSize: 16 },

  // Preset Preview styles
  previewContainer: {
    padding: Spacing.md,
  },
  previewHeader: {
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewSubtitle: {
    fontSize: 14,
  },
  previewSystemSelector: {
    marginBottom: Spacing.md,
  },
  previewSystemList: {
    gap: Spacing.xs,
    paddingRight: Spacing.sm,
  },
  previewSystemChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  previewSystemChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewChanges: {
    marginBottom: Spacing.md,
  },
  previewLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  previewClusterLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValueLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewChangeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  previewClusterName: {
    fontSize: 15,
    fontWeight: '500',
  },
  previewValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewCurrentValue: {
    fontSize: 15,
  },
  previewArrow: {
    fontSize: 15,
  },
  previewNewValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  previewDelta: {
    fontSize: 13,
    fontWeight: '500',
  },
  previewTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  previewTotalLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  previewTotalValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  previewButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  previewButtonCancel: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonCancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
  previewButtonApply: {
    flex: 1,
    height: 44,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewButtonApplyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },

  // Toast styles
  toast: {
    position: 'absolute',
    bottom: 120,
    left: Spacing.md,
    right: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
