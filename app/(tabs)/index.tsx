/**
 * Home Screen
 * Mode-aware dashboard showing contextual information.
 * Per spec: Home displays key stats and quick actions for the current mode.
 */

import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, TextInput, Modal } from 'react-native';
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
// Note: PROGRAMS and INSTITUTION imported for future use
import { COMPANY_METRICS, formatCurrency } from '@/data/mock-enterprise';
import { CAMPUSES, MESSAGES } from '@/data/mock-church';
import { getCurrentTerm, getUpcomingEvents, INSTITUTIONAL_METRICS } from '@/data/mock-education';

// =============================================================================
// SYSTEM EMPHASIS CONSTANTS & TYPES (from program-context.tsx)
// =============================================================================

// Fixed section totals (locked at 58/42 split, always sum to 100)
const OFFENSE_TOTAL = 58;
const DEFENSE_TOTAL = 42;

// Offensive System presets (raw weights for S/F/P, will be normalized to sum to 58)
const OFFENSIVE_SYSTEMS = [
  { id: 'spread-pnr', label: 'Spread Pick-and-Roll', weights: { shooting: 20, finishing: 18, playmaking: 20 } },
  { id: '5-out', label: '5-Out Motion', weights: { shooting: 24, finishing: 14, playmaking: 20 } },
  { id: 'pace-space', label: 'Pace & Space', weights: { shooting: 26, finishing: 14, playmaking: 18 } },
  { id: 'motion', label: 'Motion / Read & React', weights: { shooting: 18, finishing: 16, playmaking: 24 } },
  { id: 'dribble-drive', label: 'Dribble Drive', weights: { shooting: 16, finishing: 24, playmaking: 18 } },
  { id: 'princeton', label: 'Princeton', weights: { shooting: 16, finishing: 16, playmaking: 26 } },
  { id: 'post-centric', label: 'Post-Centric / Inside-Out', weights: { shooting: 16, finishing: 26, playmaking: 16 } },
  { id: 'moreyball', label: 'Moreyball', weights: { shooting: 28, finishing: 18, playmaking: 12 } },
  { id: 'heliocentric', label: 'Heliocentric', weights: { shooting: 20, finishing: 16, playmaking: 22 } },
];

// Defensive System presets (raw weights for OBD/TD/Reb/Phys, will be normalized to sum to 42)
const DEFENSIVE_SYSTEMS = [
  { id: 'containment', label: 'Containment Man', weights: { onBallDefense: 12, teamDefense: 10, rebounding: 12, physical: 8 } },
  { id: 'pack-line', label: 'Pack Line', weights: { onBallDefense: 8, teamDefense: 14, rebounding: 12, physical: 8 } },
  { id: 'pressure-man', label: 'Pressure Man / Denial', weights: { onBallDefense: 16, teamDefense: 8, rebounding: 10, physical: 8 } },
  { id: 'switch', label: 'Switch Everything', weights: { onBallDefense: 11, teamDefense: 11, rebounding: 10, physical: 10 } },
  { id: 'ice', label: 'ICE / No-Middle', weights: { onBallDefense: 12, teamDefense: 12, rebounding: 10, physical: 8 } },
  { id: 'zone', label: 'Zone (Structured)', weights: { onBallDefense: 6, teamDefense: 16, rebounding: 12, physical: 8 } },
  { id: 'matchup-zone', label: 'Matchup Zone / Hybrid', weights: { onBallDefense: 8, teamDefense: 14, rebounding: 12, physical: 8 } },
  { id: 'press', label: 'Press / Pressure Defense', weights: { onBallDefense: 14, teamDefense: 8, rebounding: 10, physical: 10 } },
];

const TEMPO_OPTIONS = ['Slow', 'Medium', 'Fast'];
const PRIMARY_ENGINE_POSITIONS = ['PG', 'CG', 'Wing', 'Forward', 'Big'];

// Backend storage format (7 clusters)
interface EmphasisProfile {
  shooting: number;
  finishing: number;
  playmaking: number;
  onBallDefense: number;
  teamDefense: number;
  rebounding: number;
  physical: number;
}

// UI display format (8 sliders)
interface UIEmphasisProfile {
  shooting: number;
  finishing: number;
  playmaking: number;
  onBallDefense: number;
  teamDefense: number;
  offensiveRebounding: number;
  defensiveRebounding: number;
  physical: number;
}

// Section totals (locked at 58/42)
interface SectionTotals {
  offense: number;  // Always 58
  defense: number;  // Always 42
}

// =============================================================================
// NORMALIZATION FUNCTIONS
// =============================================================================

function applyOffensePreset(
  systemId: string,
  _currentSectionTotals: SectionTotals,
  currentUIEmphasis: UIEmphasisProfile
): { sectionTotals: SectionTotals; uiEmphasis: UIEmphasisProfile; emphasis: EmphasisProfile } {
  const system = OFFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? OFFENSIVE_SYSTEMS[0];
  const { weights } = system;
  const rawSum = weights.shooting + weights.finishing + weights.playmaking;

  // Normalize weights to sum to exactly OFFENSE_TOTAL (58)
  const scale = OFFENSE_TOTAL / rawSum;
  const shooting = Math.round(weights.shooting * scale * 10) / 10;
  const finishing = Math.round(weights.finishing * scale * 10) / 10;
  let playmaking = Math.round(weights.playmaking * scale * 10) / 10;

  // Fix rounding errors - ensure sum is exactly 58
  const offSum = shooting + finishing + playmaking;
  const diff = Math.round((OFFENSE_TOTAL - offSum) * 10) / 10;
  playmaking = Math.round((playmaking + diff) * 10) / 10;

  // Section totals are always fixed at 58/42
  const newSectionTotals: SectionTotals = {
    offense: OFFENSE_TOTAL,
    defense: DEFENSE_TOTAL,
  };

  // Offense preset does NOT touch defense clusters - keep them unchanged
  const newUIEmphasis: UIEmphasisProfile = {
    shooting,
    finishing,
    playmaking,
    onBallDefense: currentUIEmphasis.onBallDefense,
    teamDefense: currentUIEmphasis.teamDefense,
    offensiveRebounding: currentUIEmphasis.offensiveRebounding,
    defensiveRebounding: currentUIEmphasis.defensiveRebounding,
    physical: currentUIEmphasis.physical,
  };

  return {
    sectionTotals: newSectionTotals,
    uiEmphasis: newUIEmphasis,
    emphasis: uiToBackend(newUIEmphasis),
  };
}

function applyDefensePreset(
  systemId: string,
  _currentSectionTotals: SectionTotals,
  currentUIEmphasis: UIEmphasisProfile
): { sectionTotals: SectionTotals; uiEmphasis: UIEmphasisProfile; emphasis: EmphasisProfile } {
  const system = DEFENSIVE_SYSTEMS.find((s) => s.id === systemId) ?? DEFENSIVE_SYSTEMS[0];
  const { weights } = system;
  const rawSum = weights.onBallDefense + weights.teamDefense + weights.rebounding + weights.physical;

  // Normalize weights to sum to exactly DEFENSE_TOTAL (42)
  const scale = DEFENSE_TOTAL / rawSum;
  const onBallDefense = Math.round(weights.onBallDefense * scale * 10) / 10;
  const teamDefense = Math.round(weights.teamDefense * scale * 10) / 10;
  const rebounding = Math.round(weights.rebounding * scale * 10) / 10;
  let physical = Math.round(weights.physical * scale * 10) / 10;

  // Fix rounding errors - ensure sum is exactly 42
  const defSum = onBallDefense + teamDefense + rebounding + physical;
  const diff = Math.round((DEFENSE_TOTAL - defSum) * 10) / 10;
  physical = Math.round((physical + diff) * 10) / 10;

  // Section totals are always fixed at 58/42
  const newSectionTotals: SectionTotals = {
    offense: OFFENSE_TOTAL,
    defense: DEFENSE_TOTAL,
  };

  // Split rebounding into offensive/defensive (keep current ratio or 50/50)
  const currentRebTotal = currentUIEmphasis.offensiveRebounding + currentUIEmphasis.defensiveRebounding;
  const rebSplit = currentRebTotal > 0
    ? currentUIEmphasis.offensiveRebounding / currentRebTotal
    : 0.5;
  const offReb = Math.round(rebounding * rebSplit * 10) / 10;
  const defReb = Math.round((rebounding - offReb) * 10) / 10;

  // Defense preset does NOT touch offense clusters - keep them unchanged
  const newUIEmphasis: UIEmphasisProfile = {
    shooting: currentUIEmphasis.shooting,
    finishing: currentUIEmphasis.finishing,
    playmaking: currentUIEmphasis.playmaking,
    onBallDefense,
    teamDefense,
    offensiveRebounding: offReb,
    defensiveRebounding: defReb,
    physical,
  };

  return {
    sectionTotals: newSectionTotals,
    uiEmphasis: newUIEmphasis,
    emphasis: uiToBackend(newUIEmphasis),
  };
}

function getDefaultSectionTotals(): SectionTotals {
  return { offense: OFFENSE_TOTAL, defense: DEFENSE_TOTAL };
}

function getDefaultEmphasis(): EmphasisProfile {
  // Offense: 58 split evenly among 3 clusters (19.3 each)
  // Defense: 42 split among 4 clusters (10.5 each)
  return {
    shooting: 19.3,
    finishing: 19.3,
    playmaking: 19.4, // +0.1 to sum to 58
    onBallDefense: 10.5,
    teamDefense: 10.5,
    rebounding: 10.5,
    physical: 10.5,
  };
}

function getDefaultUIEmphasis(): UIEmphasisProfile {
  // Offense: 58 split evenly among 3 clusters
  // Defense: 42 split among 4 clusters (rebounding split 50/50)
  return {
    shooting: 19.3,
    finishing: 19.3,
    playmaking: 19.4,
    onBallDefense: 10.5,
    teamDefense: 10.5,
    offensiveRebounding: 5.3,
    defensiveRebounding: 5.2,
    physical: 10.5,
  };
}

function backendToUI(emphasis: EmphasisProfile, reboundingSplit: number = 0.5): UIEmphasisProfile {
  const offReb = Math.round(emphasis.rebounding * reboundingSplit * 10) / 10;
  const defReb = Math.round((emphasis.rebounding - offReb) * 10) / 10;
  return {
    shooting: emphasis.shooting,
    finishing: emphasis.finishing,
    playmaking: emphasis.playmaking,
    onBallDefense: emphasis.onBallDefense,
    teamDefense: emphasis.teamDefense,
    offensiveRebounding: offReb,
    defensiveRebounding: defReb,
    physical: emphasis.physical,
  };
}

function uiToBackend(uiEmphasis: UIEmphasisProfile): EmphasisProfile {
  return {
    shooting: uiEmphasis.shooting,
    finishing: uiEmphasis.finishing,
    playmaking: uiEmphasis.playmaking,
    onBallDefense: uiEmphasis.onBallDefense,
    teamDefense: uiEmphasis.teamDefense,
    rebounding: Math.round((uiEmphasis.offensiveRebounding + uiEmphasis.defensiveRebounding) * 10) / 10,
    physical: uiEmphasis.physical,
  };
}

function calculateReboundingSplit(offReb: number, defReb: number): number {
  const total = offReb + defReb;
  if (total === 0) return 0.5;
  return offReb / total;
}

function getGroupTotals(uiEmphasis: UIEmphasisProfile): SectionTotals {
  return {
    offense: Math.round((uiEmphasis.shooting + uiEmphasis.finishing + uiEmphasis.playmaking) * 10) / 10,
    defense: Math.round((uiEmphasis.onBallDefense + uiEmphasis.teamDefense + uiEmphasis.offensiveRebounding + uiEmphasis.defensiveRebounding + uiEmphasis.physical) * 10) / 10,
  };
}

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

// Program Context preview data (defaults, will be overridden by persisted state)
const DEFAULT_SCHOLARSHIPS = { used: 7.5, total: 11.0 };
const DEFAULT_NIL_POOL = { total: 150000, committed: 50000 };

// Program Context storage key (shared with program-context.tsx)
const PROGRAM_CONTEXT_KEY = 'kx:programContext';

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

// Storage keys for quick edit values
const SCHOLARSHIPS_KEY = 'kx:scholarships';
const NIL_POOL_KEY = 'kx:nilPool';

function SportsHome() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  // Scholarships state (used/total with decimals)
  const [scholarships, setScholarships] = useState(DEFAULT_SCHOLARSHIPS);
  const [scholarshipsExpanded, setScholarshipsExpanded] = useState(false);
  const [editScholarshipsUsed, setEditScholarshipsUsed] = useState('');
  const [editScholarshipsTotal, setEditScholarshipsTotal] = useState('');

  // NIL Pool state (total/committed)
  const [nilPool, setNilPool] = useState(DEFAULT_NIL_POOL);
  const [nilPoolExpanded, setNilPoolExpanded] = useState(false);
  const [editNilTotal, setEditNilTotal] = useState('');
  const [editNilCommitted, setEditNilCommitted] = useState('');

  // ===== SYSTEMS STATE =====
  const [offensiveSystem, setOffensiveSystem] = useState('spread-pnr');
  const [defensiveSystem, setDefensiveSystem] = useState('pressure-man');
  const [tempo, setTempo] = useState('Fast');
  const [primaryEnginePosition, setPrimaryEnginePosition] = useState('PG');

  // UI emphasis state (8 sliders)
  const [uiEmphasis, setUIEmphasis] = useState<UIEmphasisProfile>(getDefaultUIEmphasis);
  // Section totals (locked by preset)
  const [sectionTotals, setSectionTotals] = useState<SectionTotals>(getDefaultSectionTotals);
  // Backend emphasis (for persistence)
  const [emphasis, setEmphasis] = useState<EmphasisProfile>(getDefaultEmphasis);
  // Rebounding split ratio
  const [reboundingSplit, setReboundingSplit] = useState(0.5);

  // Inline accordion pickers for Offensive/Defensive systems
  const [expandedSystemPicker, setExpandedSystemPicker] = useState<'offensive' | 'defensive' | null>(null);
  // Preview states for system pickers
  const [previewOffenseSystem, setPreviewOffenseSystem] = useState<string | null>(null);
  const [previewDefenseSystem, setPreviewDefenseSystem] = useState<string | null>(null);
  const [showTempoPicker, setShowTempoPicker] = useState(false);
  const [showEnginePicker, setShowEnginePicker] = useState(false);
  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load all persisted data on focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          // Load program context (includes systems + emphasis)
          const savedContext = await AsyncStorage.getItem(PROGRAM_CONTEXT_KEY);
          if (savedContext) {
            const parsed = JSON.parse(savedContext);

            // Load systems
            setOffensiveSystem(parsed.offensiveSystem ?? 'spread-pnr');
            setDefensiveSystem(parsed.defensiveSystem ?? 'pressure-man');
            setTempo(parsed.tempo ?? 'Fast');
            setPrimaryEnginePosition(parsed.primaryEnginePosition ?? 'PG');

            // Load emphasis
            if (parsed.emphasis) {
              setEmphasis(parsed.emphasis);
              setUIEmphasis(backendToUI(parsed.emphasis, parsed.reboundingSplit ?? 0.5));
              setReboundingSplit(parsed.reboundingSplit ?? 0.5);
            }

            // Load section totals
            if (parsed.sectionTotals) {
              setSectionTotals(parsed.sectionTotals);
            } else if (parsed.emphasis) {
              // Derive from emphasis for migration
              const uiEmp = backendToUI(parsed.emphasis, parsed.reboundingSplit ?? 0.5);
              setSectionTotals(getGroupTotals(uiEmp));
            }
          }

          // Load scholarships
          const savedScholarships = await AsyncStorage.getItem(SCHOLARSHIPS_KEY);
          if (savedScholarships) {
            setScholarships(JSON.parse(savedScholarships));
          }

          // Load NIL Pool
          const savedNilPool = await AsyncStorage.getItem(NIL_POOL_KEY);
          if (savedNilPool) {
            setNilPool(JSON.parse(savedNilPool));
          }
        } catch (e) {
          console.error('Failed to load data:', e);
        }
      };
      loadData();
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

  // Format decimal for scholarships display
  const formatDecimal = (value: number): string => {
    return value % 1 === 0 ? value.toFixed(1) : value.toString();
  };

  // Toggle Scholarships inline edit
  const toggleScholarshipsEdit = () => {
    if (!scholarshipsExpanded) {
      // Opening - populate edit fields
      setEditScholarshipsUsed(scholarships.used.toString());
      setEditScholarshipsTotal(scholarships.total.toString());
    }
    setScholarshipsExpanded(!scholarshipsExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Save Scholarships (inline)
  const saveScholarships = async () => {
    const used = parseFloat(editScholarshipsUsed) || 0;
    const total = parseFloat(editScholarshipsTotal) || 0;

    // Validation: used <= total
    if (used > total) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const newScholarships = { used, total };
    setScholarships(newScholarships);
    await AsyncStorage.setItem(SCHOLARSHIPS_KEY, JSON.stringify(newScholarships));
    setScholarshipsExpanded(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Toggle NIL Pool inline edit
  const toggleNilPoolEdit = () => {
    if (!nilPoolExpanded) {
      // Opening - populate edit fields
      setEditNilTotal(nilPool.total.toString());
      setEditNilCommitted(nilPool.committed.toString());
    }
    setNilPoolExpanded(!nilPoolExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Save NIL Pool (inline)
  const saveNilPool = async () => {
    const total = parseFloat(editNilTotal.replace(/[^0-9.]/g, '')) || 0;
    const committed = parseFloat(editNilCommitted.replace(/[^0-9.]/g, '')) || 0;

    // Validation: committed <= total
    if (committed > total) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    const newNilPool = { total, committed };
    setNilPool(newNilPool);
    await AsyncStorage.setItem(NIL_POOL_KEY, JSON.stringify(newNilPool));
    setNilPoolExpanded(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // ===== SYSTEMS HANDLERS =====

  // Show toast and auto-hide after 2 seconds
  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2000);
  }, []);

  // Save systems state to AsyncStorage
  const saveSystemsState = useCallback(async (updates: Partial<{
    offensiveSystem: string;
    defensiveSystem: string;
    tempo: string;
    primaryEnginePosition: string;
    emphasis: EmphasisProfile;
    reboundingSplit: number;
    sectionTotals: SectionTotals;
  }>) => {
    try {
      const savedContext = await AsyncStorage.getItem(PROGRAM_CONTEXT_KEY);
      const current = savedContext ? JSON.parse(savedContext) : {};
      const updated = { ...current, ...updates };
      await AsyncStorage.setItem(PROGRAM_CONTEXT_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save systems state:', e);
    }
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

  // Toggle inline accordion for system pickers
  const toggleSystemPicker = useCallback((picker: 'offensive' | 'defensive') => {
    setExpandedSystemPicker((prev) => {
      if (prev === picker) {
        setPreviewOffenseSystem(null);
        setPreviewDefenseSystem(null);
        return null;
      } else {
        if (picker === 'offensive') {
          setPreviewOffenseSystem(offensiveSystem);
          setPreviewDefenseSystem(null);
        } else {
          setPreviewDefenseSystem(defensiveSystem);
          setPreviewOffenseSystem(null);
        }
        return picker;
      }
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [offensiveSystem, defensiveSystem]);

  // Handle offensive system option tap
  const handleOffensiveSystemTap = useCallback((systemId: string) => {
    setPreviewOffenseSystem(systemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Apply offensive system preset
  const handleOffensiveSystemApply = useCallback(async () => {
    if (!previewOffenseSystem) return;

    const result = applyOffensePreset(previewOffenseSystem, sectionTotals, uiEmphasis);

    setOffensiveSystem(previewOffenseSystem);
    setEmphasis(result.emphasis);
    setUIEmphasis(result.uiEmphasis);
    setSectionTotals(result.sectionTotals);

    const newReboundingSplit = calculateReboundingSplit(result.uiEmphasis.offensiveRebounding, result.uiEmphasis.defensiveRebounding);
    setReboundingSplit(newReboundingSplit);

    await saveSystemsState({
      offensiveSystem: previewOffenseSystem,
      emphasis: result.emphasis,
      reboundingSplit: newReboundingSplit,
      sectionTotals: result.sectionTotals,
    });

    setPreviewOffenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Offense ${result.sectionTotals.offense}% applied`);
  }, [previewOffenseSystem, sectionTotals, uiEmphasis, saveSystemsState, showToast]);

  // Cancel offensive preview
  const handleOffensiveSystemCancel = useCallback(() => {
    setPreviewOffenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle defensive system option tap
  const handleDefensiveSystemTap = useCallback((systemId: string) => {
    setPreviewDefenseSystem(systemId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Apply defensive system preset
  const handleDefensiveSystemApply = useCallback(async () => {
    if (!previewDefenseSystem) return;

    const result = applyDefensePreset(previewDefenseSystem, sectionTotals, uiEmphasis);

    setDefensiveSystem(previewDefenseSystem);
    setEmphasis(result.emphasis);
    setUIEmphasis(result.uiEmphasis);
    setSectionTotals(result.sectionTotals);

    const newReboundingSplit = calculateReboundingSplit(result.uiEmphasis.offensiveRebounding, result.uiEmphasis.defensiveRebounding);
    setReboundingSplit(newReboundingSplit);

    await saveSystemsState({
      defensiveSystem: previewDefenseSystem,
      emphasis: result.emphasis,
      reboundingSplit: newReboundingSplit,
      sectionTotals: result.sectionTotals,
    });

    setPreviewDefenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Defense ${result.sectionTotals.defense}% applied`);
  }, [previewDefenseSystem, sectionTotals, uiEmphasis, saveSystemsState, showToast]);

  // Cancel defensive preview
  const handleDefensiveSystemCancel = useCallback(() => {
    setPreviewDefenseSystem(null);
    setExpandedSystemPicker(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  // Handle tempo change
  const handleTempoChange = useCallback(async (newTempo: string) => {
    setTempo(newTempo);
    setShowTempoPicker(false);
    await saveSystemsState({ tempo: newTempo });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [saveSystemsState]);

  const offensiveSystemLabel = OFFENSIVE_SYSTEMS.find((s) => s.id === offensiveSystem)?.label || 'Select';
  const defensiveSystemLabel = DEFENSIVE_SYSTEMS.find((s) => s.id === defensiveSystem)?.label || 'Select';
  const isHeliocentric = offensiveSystem === 'heliocentric';

  const handleTabPress = (route: string | null) => {
    if (route) {
      router.push(route as any);
    }
    // If route is null (Home tab), stay on current screen
  };

  return (
    <View style={styles.sportsHomeContainer}>
      {/* ===== STICKY TABS ===== */}
      <TeamHubTabs colors={colors} onTabPress={handleTabPress} />

      {/* ===== SCROLLABLE CONTENT ===== */}
      <ScrollView
        style={styles.sportsScrollView}
        contentContainerStyle={styles.sportsScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== 1) TEAM IDENTITY BLOCK (centered) ===== */}
      <View style={styles.teamStateSection}>
        {/* Team Logo Placeholder */}
        <View style={[styles.teamLogo, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={[styles.teamLogoText, { color: colors.textSecondary }]}>
            LU
          </ThemedText>
        </View>

        {/* Big Rating - 84 large + KR badge */}
        <View style={styles.ratingRow}>
          <ThemedText style={styles.ratingNumber}>
            {DEMO_TEAM_STATE.rating}
          </ThemedText>
          <View style={[styles.krBadge, { backgroundColor: colors.backgroundSecondary }]}>
            <ThemedText style={[styles.krLabel, { color: colors.textSecondary }]}>KR</ThemedText>
          </View>
        </View>

        {/* Meta Line */}
        <ThemedText style={[styles.metaLine, { color: colors.textSecondary }]}>
          Independent · SWS · 25–26
        </ThemedText>

        {/* Record Line */}
        <ThemedText style={[styles.recordLine, { color: colors.textTertiary }]}>
          Overall 9–8 · Conf 7–0 · 1st
        </ThemedText>
      </View>

      {/* ===== 2) Current Status (no title) ===== */}
      <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Next Game */}
        <View style={styles.statusRow}>
          <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Next Game
          </ThemedText>
          <ThemedText style={[styles.statusValue, { color: colors.text }]}>
            Missouri Western · Sat, Feb 8 2:00 PM · Home
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        {/* Last Game */}
        <View style={styles.statusRow}>
          <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Last Game
          </ThemedText>
          <ThemedText style={[styles.statusValue, { color: colors.text }]}>
            W 78–65 vs Northwest Missouri
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        {/* Today */}
        <View style={styles.statusRow}>
          <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Today
          </ThemedText>
          <ThemedText style={[styles.statusValue, { color: colors.text }]}>
            Practice 3:30 PM • Film 6:00 PM
          </ThemedText>
        </View>
        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        {/* Availability */}
        <View style={styles.statusRow}>
          <ThemedText style={[styles.statusLabel, { color: colors.textSecondary }]}>
            Availability
          </ThemedText>
          <ThemedText style={[styles.statusValue, { color: colors.text }]}>
            12 Available · 2 Out · 1 Questionable
          </ThemedText>
        </View>
      </View>

      {/* ===== 3) TEAM IDENTITY ===== */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        TEAM IDENTITY
      </ThemedText>
      <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Offensive System - Inline Accordion */}
        <Pressable
          style={styles.contextRowTappable}
          onPress={() => toggleSystemPicker('offensive')}
        >
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Offensive System
          </ThemedText>
          <ThemedText style={[styles.contextValueText, { color: colors.text }]}>
            {offensiveSystemLabel}
          </ThemedText>
        </Pressable>

        {/* Inline Offensive System Options OR Preview */}
        {expandedSystemPicker === 'offensive' && (
          <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
            {previewOffenseSystem === null ? (
              OFFENSIVE_SYSTEMS.map((system) => (
                <Pressable
                  key={system.id}
                  style={[
                    styles.inlineOption,
                    offensiveSystem === system.id && { backgroundColor: colors.background },
                  ]}
                  onPress={() => handleOffensiveSystemTap(system.id)}
                >
                  <ThemedText
                    style={[
                      styles.inlineOptionText,
                      { color: offensiveSystem === system.id ? colors.tint : colors.text },
                    ]}
                  >
                    {system.label}
                  </ThemedText>
                  {offensiveSystem === system.id && (
                    <IconSymbol name="checkmark" size={16} color={colors.tint} />
                  )}
                </Pressable>
              ))
            ) : (
              <PresetPreview
                type="offensive"
                systemId={previewOffenseSystem}
                systemLabel={OFFENSIVE_SYSTEMS.find((s) => s.id === previewOffenseSystem)?.label || ''}
                currentEmphasis={emphasis}
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
            <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />
            <Pressable
              style={styles.contextRowTappable}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowEnginePicker(true);
              }}
            >
              <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
                Primary Engine Position
              </ThemedText>
              <ThemedText style={[styles.contextValueText, { color: colors.text }]}>
                {primaryEnginePosition}
              </ThemedText>
            </Pressable>
          </>
        )}

        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        {/* Defensive System - Inline Accordion */}
        <Pressable
          style={styles.contextRowTappable}
          onPress={() => toggleSystemPicker('defensive')}
        >
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Defensive System
          </ThemedText>
          <ThemedText style={[styles.contextValueText, { color: colors.text }]}>
            {defensiveSystemLabel}
          </ThemedText>
        </Pressable>

        {/* Inline Defensive System Options OR Preview */}
        {expandedSystemPicker === 'defensive' && (
          <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
            {previewDefenseSystem === null ? (
              DEFENSIVE_SYSTEMS.map((system) => (
                <Pressable
                  key={system.id}
                  style={[
                    styles.inlineOption,
                    defensiveSystem === system.id && { backgroundColor: colors.background },
                  ]}
                  onPress={() => handleDefensiveSystemTap(system.id)}
                >
                  <ThemedText
                    style={[
                      styles.inlineOptionText,
                      { color: defensiveSystem === system.id ? colors.tint : colors.text },
                    ]}
                  >
                    {system.label}
                  </ThemedText>
                  {defensiveSystem === system.id && (
                    <IconSymbol name="checkmark" size={16} color={colors.tint} />
                  )}
                </Pressable>
              ))
            ) : (
              <PresetPreview
                type="defensive"
                systemId={previewDefenseSystem}
                systemLabel={DEFENSIVE_SYSTEMS.find((s) => s.id === previewDefenseSystem)?.label || ''}
                currentEmphasis={emphasis}
                newEmphasis={calculateDefensePreview(previewDefenseSystem)}
                onCancel={handleDefensiveSystemCancel}
                onApply={handleDefensiveSystemApply}
                onSelectDifferent={handleDefensiveSystemTap}
                colors={colors}
              />
            )}
          </View>
        )}

        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        {/* Tempo - Inline Accordion */}
        <Pressable
          style={styles.contextRowTappable}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowTempoPicker((prev) => !prev);
          }}
        >
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Tempo
          </ThemedText>
          <ThemedText style={[styles.contextValueText, { color: colors.text }]}>
            {tempo}
          </ThemedText>
        </Pressable>

        {/* Inline Tempo Options */}
        {showTempoPicker && (
          <View style={[styles.inlineOptionsList, { borderTopColor: colors.divider }]}>
            {TEMPO_OPTIONS.map((t) => (
              <Pressable
                key={t}
                style={[
                  styles.inlineOption,
                  tempo === t && { backgroundColor: colors.background },
                ]}
                onPress={() => handleTempoChange(t)}
              >
                <ThemedText
                  style={[
                    styles.inlineOptionText,
                    { color: tempo === t ? colors.tint : colors.text },
                  ]}
                >
                  {t}
                </ThemedText>
                {tempo === t && (
                  <IconSymbol name="checkmark" size={16} color={colors.tint} />
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* ===== 4) RECRUITMENT ===== */}
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        RECRUITMENT
      </ThemedText>
      <View style={[styles.contextCard, { backgroundColor: colors.backgroundSecondary }]}>
        {/* Scholarships Row - Tappable to expand */}
        <Pressable
          style={({ pressed }) => [
            styles.contextRowTappable,
            pressed && !scholarshipsExpanded && { backgroundColor: colors.backgroundTertiary },
          ]}
          onPress={toggleScholarshipsEdit}
        >
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            Scholarships
          </ThemedText>
          <ThemedText style={[styles.contextValueText, { color: colors.text }]}>
            {formatDecimal(scholarships.used)} / {formatDecimal(scholarships.total)}
          </ThemedText>
        </Pressable>

        {/* Scholarships Inline Edit */}
        {scholarshipsExpanded && (
          <View style={[styles.inlineEditSection, { borderTopColor: colors.divider }]}>
            <View style={styles.inlineEditField}>
              <ThemedText style={[styles.inlineEditLabel, { color: colors.textSecondary }]}>
                Used
              </ThemedText>
              <TextInput
                style={[styles.inlineEditInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editScholarshipsUsed}
                onChangeText={setEditScholarshipsUsed}
                keyboardType="decimal-pad"
                placeholder="7.5"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.inlineEditField}>
              <ThemedText style={[styles.inlineEditLabel, { color: colors.textSecondary }]}>
                Total
              </ThemedText>
              <TextInput
                style={[styles.inlineEditInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editScholarshipsTotal}
                onChangeText={setEditScholarshipsTotal}
                keyboardType="decimal-pad"
                placeholder="11.0"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.inlineEditField}>
              <ThemedText style={[styles.inlineEditLabel, { color: colors.textSecondary }]}>
                Remaining
              </ThemedText>
              <ThemedText style={[styles.inlineEditReadonly, { color: colors.text }]}>
                {formatDecimal(Math.max(0, (parseFloat(editScholarshipsTotal) || 0) - (parseFloat(editScholarshipsUsed) || 0)))}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.inlineSaveButton, { backgroundColor: colors.tint }]}
              onPress={saveScholarships}
            >
              <ThemedText style={styles.inlineSaveText}>Save</ThemedText>
            </Pressable>
          </View>
        )}

        <View style={[styles.contextDivider, { backgroundColor: colors.divider }]} />

        {/* NIL Pool Row - Tappable to expand */}
        <Pressable
          style={({ pressed }) => [
            styles.contextRowTappable,
            pressed && !nilPoolExpanded && { backgroundColor: colors.backgroundTertiary },
          ]}
          onPress={toggleNilPoolEdit}
        >
          <ThemedText style={[styles.contextLabel, { color: colors.textSecondary }]}>
            NIL Pool
          </ThemedText>
          <ThemedText style={[styles.contextValueText, { color: colors.text }]}>
            {formatCurrencyValue(nilPool.total - nilPool.committed)} remaining
          </ThemedText>
        </Pressable>

        {/* NIL Pool Inline Edit */}
        {nilPoolExpanded && (
          <View style={[styles.inlineEditSection, { borderTopColor: colors.divider }]}>
            <View style={styles.inlineEditField}>
              <ThemedText style={[styles.inlineEditLabel, { color: colors.textSecondary }]}>
                Total ($)
              </ThemedText>
              <TextInput
                style={[styles.inlineEditInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editNilTotal}
                onChangeText={setEditNilTotal}
                keyboardType="number-pad"
                placeholder="150000"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.inlineEditField}>
              <ThemedText style={[styles.inlineEditLabel, { color: colors.textSecondary }]}>
                Committed ($)
              </ThemedText>
              <TextInput
                style={[styles.inlineEditInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                value={editNilCommitted}
                onChangeText={setEditNilCommitted}
                keyboardType="number-pad"
                placeholder="50000"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <View style={styles.inlineEditField}>
              <ThemedText style={[styles.inlineEditLabel, { color: colors.textSecondary }]}>
                Remaining ($)
              </ThemedText>
              <ThemedText style={[styles.inlineEditReadonly, { color: colors.text }]}>
                {formatCurrencyValue(Math.max(0, (parseFloat(editNilTotal.replace(/[^0-9.]/g, '')) || 0) - (parseFloat(editNilCommitted.replace(/[^0-9.]/g, '')) || 0)))}
              </ThemedText>
            </View>
            <Pressable
              style={[styles.inlineSaveButton, { backgroundColor: colors.tint }]}
              onPress={saveNilPool}
            >
              <ThemedText style={styles.inlineSaveText}>Save</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      {/* Modal for Primary Engine Position */}
      <Modal visible={showEnginePicker} transparent animationType="slide" onRequestClose={() => setShowEnginePicker(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowEnginePicker(false)} />
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
              <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                Primary Engine Position
              </ThemedText>
              <Pressable onPress={() => setShowEnginePicker(false)}>
                <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {PRIMARY_ENGINE_POSITIONS.map((pos) => (
                <Pressable
                  key={pos}
                  style={[styles.modalOption, primaryEnginePosition === pos && { backgroundColor: colors.backgroundSecondary }]}
                  onPress={async () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setPrimaryEnginePosition(pos);
                    setShowEnginePicker(false);
                    await saveSystemsState({ primaryEnginePosition: pos });
                  }}
                >
                  <ThemedText style={[styles.modalOptionText, { color: colors.text }]}>{pos}</ThemedText>
                  {primaryEnginePosition === pos && <IconSymbol name="checkmark" size={18} color={colors.tint} />}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Toast notification */}
      {toastMessage && (
        <View style={[styles.toast, { backgroundColor: colors.backgroundSecondary }]}>
          <ThemedText style={[styles.toastText, { color: colors.text }]}>{toastMessage}</ThemedText>
        </View>
      )}
      </ScrollView>
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
  const clusters =
    type === 'offensive'
      ? [
          { id: 'shooting' as const, label: 'Shooting' },
          { id: 'finishing' as const, label: 'Finishing' },
          { id: 'playmaking' as const, label: 'Playmaking' },
        ]
      : [
          { id: 'onBallDefense' as const, label: 'On-Ball Defense' },
          { id: 'teamDefense' as const, label: 'Team Defense' },
          { id: 'rebounding' as const, label: 'Rebounding' },
          { id: 'physical' as const, label: 'Physical' },
        ];

  return (
    <View style={styles.previewContainer}>
      {/* Header */}
      <View style={styles.previewHeader}>
        <ThemedText style={[styles.previewTitle, { color: colors.text }]}>Preview changes</ThemedText>
        <ThemedText style={[styles.previewSubtitle, { color: colors.textSecondary }]}>
          Current → New (Totals stay 100)
        </ThemedText>
      </View>

      {/* System selector */}
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
              <ThemedText
                style={[
                  styles.previewSystemChipText,
                  { color: system.id === systemId ? '#1A1A1A' : colors.text },
                ]}
                numberOfLines={1}
              >
                {system.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Current → New rows */}
      <View style={styles.previewChanges}>
        <View style={styles.previewLabelsRow}>
          <ThemedText style={[styles.previewClusterLabel, { color: colors.textTertiary }]}>Cluster</ThemedText>
          <ThemedText style={[styles.previewValueLabel, { color: colors.textTertiary }]}>Current → New</ThemedText>
        </View>

        {clusters.map((cluster) => {
          const currentVal = Math.round(currentEmphasis[cluster.id] * 10) / 10;
          const newVal = Math.round(newEmphasis[cluster.id] * 10) / 10;
          const delta = newVal - currentVal;
          const deltaSign = delta >= 0 ? '+' : '';
          const hasChange = Math.abs(delta) >= 0.1;

          return (
            <View key={cluster.id} style={styles.previewChangeRow}>
              <ThemedText style={[styles.previewClusterName, { color: colors.text }]}>{cluster.label}</ThemedText>
              <View style={styles.previewValueContainer}>
                <ThemedText style={[styles.previewCurrentValue, { color: colors.textSecondary }]}>
                  {currentVal.toFixed(1)}
                </ThemedText>
                <ThemedText style={[styles.previewArrow, { color: colors.textTertiary }]}> → </ThemedText>
                <ThemedText
                  style={[
                    styles.previewNewValue,
                    { color: hasChange ? colors.tint : colors.text },
                  ]}
                >
                  {newVal.toFixed(1)}
                </ThemedText>
                {hasChange && (
                  <ThemedText
                    style={[
                      styles.previewDelta,
                      { color: delta >= 0 ? '#4CAF50' : '#F44336' },
                    ]}
                  >
                    {' '}({deltaSign}{delta.toFixed(1)})
                  </ThemedText>
                )}
              </View>
            </View>
          );
        })}

        {/* Total row */}
        <View style={[styles.previewTotalRow, { borderTopColor: colors.divider }]}>
          <ThemedText style={[styles.previewTotalLabel, { color: colors.textSecondary }]}>Total:</ThemedText>
          <ThemedText style={[styles.previewTotalValue, { color: colors.text }]}>100 → 100</ThemedText>
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.previewButtons}>
        <Pressable
          style={[styles.previewButtonCancel, { borderColor: colors.border }]}
          onPress={onCancel}
        >
          <ThemedText style={[styles.previewButtonCancelText, { color: colors.text }]}>Cancel</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.previewButtonApply, { backgroundColor: '#D4AF37' }]}
          onPress={onApply}
        >
          <ThemedText style={styles.previewButtonApplyText}>Apply Preset</ThemedText>
        </Pressable>
      </View>
    </View>
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

  // Sports mode handles its own scroll (sticky header)
  if (mode === 'sports') {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <SportsHome />
      </ThemedView>
    );
  }

  // Other modes use shared ScrollView wrapper
  const renderModeContent = () => {
    switch (mode) {
      case 'enterprise':
        return <EnterpriseHome />;
      case 'church':
        return <ChurchHome />;
      case 'education':
        return <EducationHome />;
      default:
        return <EnterpriseHome />;
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

  // Sports Home (sticky header layout)
  sportsHomeContainer: {
    flex: 1,
  },
  sportsScrollView: {
    flex: 1,
  },
  sportsScrollContent: {
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
  },
  hubTabsContent: {
    paddingHorizontal: Spacing.lg,
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
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingNumber: {
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 64,
  },
  krBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  krLabel: {
    fontSize: 14,
    fontWeight: '600',
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
  contextRowTappable: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
  },
  contextValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  contextValueText: {
    fontSize: 14,
    fontWeight: '400',
  },

  // Inline Edit Section (expand/collapse within card)
  inlineEditSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  inlineEditField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.md,
  },
  inlineEditLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  inlineEditInput: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: 100,
    textAlign: 'right',
  },
  inlineEditReadonly: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 100,
    textAlign: 'right',
  },
  inlineSaveButton: {
    marginTop: Spacing.xs,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  inlineSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  // Status Row (for Current Status card)
  statusRow: {
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    gap: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '400',
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

  // ===== SYSTEMS STYLES =====

  // Inline options list
  inlineOptionsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: 4,
  },
  inlineOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  inlineOptionText: {
    fontSize: 15,
  },

  // Emphasis section
  emphasisHeaderCard: {
    marginBottom: Spacing.sm,
  },
  emphasisHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  emphasisHeaderTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  emphasisTotalText: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Group rows
  groupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  groupLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  groupValue: {
    fontSize: 15,
    fontWeight: '500',
  },
  groupSliders: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingLeft: Spacing.sm,
  },

  // Slider rows
  sliderRow: {
    padding: Spacing.md,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 15,
  },
  sliderValue: {
    fontSize: 15,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
  },

  // Preset Preview
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

  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  modalOptionText: {
    fontSize: 16,
  },

  // Toast
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
