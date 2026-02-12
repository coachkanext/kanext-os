/**
 * Program Resources Screen
 * Tier 1: Scholarships + NIL Pool (always visible)
 * Tier 2: Budgets, Staff Coverage, Facilities Access (under "More Program Resources")
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { TabFooter } from '@/components/tab-footer';

// Storage keys
const SCHOLARSHIPS_KEY = 'kx:scholarships';
const NIL_POOL_KEY = 'kx:nilPool';
const PROGRAM_RESOURCES_KEY = 'kx:programResources';

// Default values
const DEFAULT_SCHOLARSHIPS = { used: 7.5, total: 11.0 };
const DEFAULT_NIL_POOL = { total: 150000, committed: 50000 };
const DEFAULT_RESOURCES = {
  // Budgets
  recruitingBudget: { total: 0, spent: 0 },
  travelBudget: { total: 0, spent: 0 },
  performanceBudget: { total: 0, spent: 0 },
  // Staff
  coachesCurrent: 0,
  coachesMax: 0,
  athleticTrainer: 0,
  strengthConditioning: 0,
  videoFilm: 0,
  operations: 0,
  // Facilities - Training/Practice
  dedicatedPracticeGym: false,
  sharedPracticeGym: false,
  gymAccess247: false,
  shootingMachines: false,
  filmRoom: false,
  // Facilities - Strength/Recovery
  weightRoomAccess: false,
  dedicatedStrengthArea: false,
  recoveryTools: false,
  trainingRoom: false,
};

export default function ProgramResourcesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Tier 1 state
  const [scholarships, setScholarships] = useState(DEFAULT_SCHOLARSHIPS);
  const [nilPool, setNilPool] = useState(DEFAULT_NIL_POOL);

  // Tier 2 expanded state
  const [tier2Expanded, setTier2Expanded] = useState(false);

  // Tier 2 resources state
  const [resources, setResources] = useState(DEFAULT_RESOURCES);

  // Load data on focus
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const savedScholarships = await AsyncStorage.getItem(SCHOLARSHIPS_KEY);
          if (savedScholarships) {
            setScholarships(JSON.parse(savedScholarships));
          }

          const savedNilPool = await AsyncStorage.getItem(NIL_POOL_KEY);
          if (savedNilPool) {
            setNilPool(JSON.parse(savedNilPool));
          }

          const savedResources = await AsyncStorage.getItem(PROGRAM_RESOURCES_KEY);
          if (savedResources) {
            setResources({ ...DEFAULT_RESOURCES, ...JSON.parse(savedResources) });
          }
        } catch (e) {
          console.error('Failed to load program resources:', e);
        }
      };
      loadData();
    }, [])
  );

  // Format currency
  const formatCurrency = (value: number): string => {
    if (!value && value !== 0) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Format decimal
  const formatDecimal = (value: number): string => {
    return value % 1 === 0 ? value.toFixed(1) : value.toString();
  };

  // Parse currency input
  const parseCurrency = (value: string): number => {
    return parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  };

  // Update resource field
  const updateResource = (key: keyof typeof resources, value: any) => {
    setResources(prev => ({ ...prev, [key]: value }));
  };

  // Update budget field
  const updateBudget = (
    budgetKey: 'recruitingBudget' | 'travelBudget' | 'performanceBudget',
    field: 'total' | 'spent',
    value: string
  ) => {
    const numValue = parseCurrency(value);
    setResources(prev => ({
      ...prev,
      [budgetKey]: { ...prev[budgetKey], [field]: numValue },
    }));
  };

  // Save all data
  const saveAll = async () => {
    try {
      await AsyncStorage.setItem(PROGRAM_RESOURCES_KEY, JSON.stringify(resources));
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
    } catch (e) {
      console.error('Failed to save program resources:', e);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  // Generate Tier 2 summary line
  const getTier2Summary = (): string => {
    const parts: string[] = [];
    if (resources.recruitingBudget.total > 0) {
      parts.push(`Recruiting ${formatCurrency(resources.recruitingBudget.total - resources.recruitingBudget.spent)}`);
    }
    if (resources.travelBudget.total > 0) {
      parts.push(`Travel ${formatCurrency(resources.travelBudget.total - resources.travelBudget.spent)}`);
    }
    if (resources.performanceBudget.total > 0) {
      parts.push(`Performance ${formatCurrency(resources.performanceBudget.total - resources.performanceBudget.spent)}`);
    }
    if (resources.coachesMax > 0) {
      parts.push(`Coaches ${resources.coachesCurrent}/${resources.coachesMax}`);
    }
    if (resources.athleticTrainer > 0) {
      parts.push(`AT ${resources.athleticTrainer}`);
    }
    if (resources.strengthConditioning > 0) {
      parts.push(`S&C ${resources.strengthConditioning}`);
    }
    return parts.length > 0 ? parts.join(' • ') : '';
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate({ pathname: '/(tabs)/index', params: { hubTab: '2' } } as any);
          }}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.tint} />
        </Pressable>
        <ThemedText style={styles.headerTitle}>Program Resources</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== TIER 1: Always Visible ===== */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          KEY CONSTRAINTS
        </ThemedText>
        <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
          {/* Scholarships Row */}
          <View style={styles.tier1Row}>
            <ThemedText style={[styles.tier1Label, { color: colors.textSecondary }]}>
              Scholarships
            </ThemedText>
            <ThemedText style={[styles.tier1Value, { color: colors.text }]}>
              {formatDecimal(scholarships.used)} / {formatDecimal(scholarships.total)}
            </ThemedText>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* NIL Pool Row */}
          <View style={styles.tier1Row}>
            <ThemedText style={[styles.tier1Label, { color: colors.textSecondary }]}>
              NIL Pool
            </ThemedText>
            <ThemedText style={[styles.tier1Value, { color: colors.text }]}>
              {formatCurrency(nilPool.total)} / {formatCurrency(nilPool.committed)} / {formatCurrency(nilPool.total - nilPool.committed)}
            </ThemedText>
          </View>
        </View>

        {/* ===== MORE PROGRAM RESOURCES (Tier 2 Entry) ===== */}
        <Pressable
          style={({ pressed }) => [
            styles.tier2Toggle,
            { backgroundColor: pressed ? colors.backgroundTertiary : colors.backgroundSecondary },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setTier2Expanded(!tier2Expanded);
          }}
        >
          <View style={styles.tier2ToggleContent}>
            <ThemedText style={[styles.tier2ToggleLabel, { color: colors.text }]}>
              More Program Resources
            </ThemedText>
            {!tier2Expanded && getTier2Summary() && (
              <ThemedText style={[styles.tier2Summary, { color: colors.textTertiary }]} numberOfLines={1}>
                {getTier2Summary()}
              </ThemedText>
            )}
          </View>
          <IconSymbol
            name={tier2Expanded ? 'chevron.up' : 'chevron.down'}
            size={16}
            color={colors.textSecondary}
          />
        </Pressable>

        {/* ===== TIER 2: Expanded Content ===== */}
        {tier2Expanded && (
          <>
            {/* SECTION A: Budgets */}
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              BUDGETS
            </ThemedText>

            {/* A1: Recruiting Budget */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Recruiting Budget
              </ThemedText>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Total ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.recruitingBudget.total > 0 ? resources.recruitingBudget.total.toString() : ''}
                  onChangeText={(v) => updateBudget('recruitingBudget', 'total', v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Spent ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.recruitingBudget.spent > 0 ? resources.recruitingBudget.spent.toString() : ''}
                  onChangeText={(v) => updateBudget('recruitingBudget', 'spent', v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Remaining ($)</ThemedText>
                <ThemedText style={[styles.readonlyValue, { color: colors.text }]}>
                  {resources.recruitingBudget.total > 0
                    ? formatCurrency(Math.max(0, resources.recruitingBudget.total - resources.recruitingBudget.spent))
                    : '—'}
                </ThemedText>
              </View>
            </View>

            {/* A2: Travel Budget */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Travel Budget
              </ThemedText>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Total ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.travelBudget.total > 0 ? resources.travelBudget.total.toString() : ''}
                  onChangeText={(v) => updateBudget('travelBudget', 'total', v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Spent ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.travelBudget.spent > 0 ? resources.travelBudget.spent.toString() : ''}
                  onChangeText={(v) => updateBudget('travelBudget', 'spent', v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Remaining ($)</ThemedText>
                <ThemedText style={[styles.readonlyValue, { color: colors.text }]}>
                  {resources.travelBudget.total > 0
                    ? formatCurrency(Math.max(0, resources.travelBudget.total - resources.travelBudget.spent))
                    : '—'}
                </ThemedText>
              </View>
            </View>

            {/* A3: Performance Budget */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Performance Budget
              </ThemedText>
              <ThemedText style={[styles.helperText, { color: colors.textTertiary }]}>
                Training, recovery, nutrition, athlete care
              </ThemedText>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Total ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.performanceBudget.total > 0 ? resources.performanceBudget.total.toString() : ''}
                  onChangeText={(v) => updateBudget('performanceBudget', 'total', v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Spent ($)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.performanceBudget.spent > 0 ? resources.performanceBudget.spent.toString() : ''}
                  onChangeText={(v) => updateBudget('performanceBudget', 'spent', v)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Remaining ($)</ThemedText>
                <ThemedText style={[styles.readonlyValue, { color: colors.text }]}>
                  {resources.performanceBudget.total > 0
                    ? formatCurrency(Math.max(0, resources.performanceBudget.total - resources.performanceBudget.spent))
                    : '—'}
                </ThemedText>
              </View>
            </View>

            {/* SECTION B: Staff Coverage */}
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              STAFF COVERAGE
            </ThemedText>

            {/* B1: Coaches */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Coaches (Capacity)
              </ThemedText>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Current</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.coachesCurrent > 0 ? resources.coachesCurrent.toString() : ''}
                  onChangeText={(v) => updateResource('coachesCurrent', parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Max</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.coachesMax > 0 ? resources.coachesMax.toString() : ''}
                  onChangeText={(v) => updateResource('coachesMax', parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            {/* B2: Support Roles */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Support Roles (Counts)
              </ThemedText>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Athletic Trainer (AT)</ThemedText>
                <TextInput
                  style={[styles.inputSmall, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.athleticTrainer > 0 ? resources.athleticTrainer.toString() : ''}
                  onChangeText={(v) => updateResource('athleticTrainer', parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Strength & Conditioning</ThemedText>
                <TextInput
                  style={[styles.inputSmall, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.strengthConditioning > 0 ? resources.strengthConditioning.toString() : ''}
                  onChangeText={(v) => updateResource('strengthConditioning', parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Video / Film</ThemedText>
                <TextInput
                  style={[styles.inputSmall, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.videoFilm > 0 ? resources.videoFilm.toString() : ''}
                  onChangeText={(v) => updateResource('videoFilm', parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
              <View style={styles.budgetRow}>
                <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Operations</ThemedText>
                <TextInput
                  style={[styles.inputSmall, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
                  value={resources.operations > 0 ? resources.operations.toString() : ''}
                  onChangeText={(v) => updateResource('operations', parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.textTertiary}
                />
              </View>
            </View>

            {/* SECTION C: Facilities Access */}
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              FACILITIES ACCESS
            </ThemedText>

            {/* C1: Training / Practice */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Training / Practice
              </ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Dedicated Practice Gym</ThemedText>
                <Switch
                  value={resources.dedicatedPracticeGym}
                  onValueChange={(v) => updateResource('dedicatedPracticeGym', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Shared Practice Gym</ThemedText>
                <Switch
                  value={resources.sharedPracticeGym}
                  onValueChange={(v) => updateResource('sharedPracticeGym', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>24/7 Gym Access</ThemedText>
                <Switch
                  value={resources.gymAccess247}
                  onValueChange={(v) => updateResource('gymAccess247', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Shooting Machines</ThemedText>
                <Switch
                  value={resources.shootingMachines}
                  onValueChange={(v) => updateResource('shootingMachines', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Film Room</ThemedText>
                <Switch
                  value={resources.filmRoom}
                  onValueChange={(v) => updateResource('filmRoom', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
            </View>

            {/* C2: Strength / Recovery */}
            <View style={[styles.card, { backgroundColor: colors.backgroundSecondary }]}>
              <ThemedText style={[styles.cardTitle, { color: colors.text }]}>
                Strength / Recovery
              </ThemedText>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Weight Room Access</ThemedText>
                <Switch
                  value={resources.weightRoomAccess}
                  onValueChange={(v) => updateResource('weightRoomAccess', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Dedicated Strength Area</ThemedText>
                <Switch
                  value={resources.dedicatedStrengthArea}
                  onValueChange={(v) => updateResource('dedicatedStrengthArea', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Recovery Tools</ThemedText>
                <Switch
                  value={resources.recoveryTools}
                  onValueChange={(v) => updateResource('recoveryTools', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
              <View style={styles.toggleRow}>
                <ThemedText style={[styles.toggleLabel, { color: colors.text }]}>Training Room (AT space)</ThemedText>
                <Switch
                  value={resources.trainingRoom}
                  onValueChange={(v) => updateResource('trainingRoom', v)}
                  trackColor={{ false: colors.border, true: colors.tint }}
                />
              </View>
            </View>
          </>
        )}

        {/* Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: pressed ? colors.tint + 'DD' : colors.tint },
          ]}
          onPress={saveAll}
        >
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </Pressable>
      </ScrollView>
      <TabFooter activeTab="Home" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  helperText: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  tier1Row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  tier1Label: {
    fontSize: 14,
    fontWeight: '500',
  },
  tier1Value: {
    fontSize: 14,
    fontWeight: '400',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  tier2Toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  tier2ToggleContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  tier2ToggleLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  tier2Summary: {
    fontSize: 12,
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    flex: 1,
  },
  input: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: 100,
    textAlign: 'right',
  },
  inputSmall: {
    fontSize: 14,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    width: 60,
    textAlign: 'center',
  },
  readonlyValue: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 100,
    textAlign: 'right',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 14,
    flex: 1,
  },
  saveButton: {
    marginTop: Spacing.lg,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
