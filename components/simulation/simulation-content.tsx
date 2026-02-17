/**
 * Simulation Content — Full Simulation OS hub with 4-view pill nav.
 * Views: Home | New Sim | Compare | Saved
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { SimHome } from '@/components/simulation/sim-home';
import { ScenarioBuilder } from '@/components/simulation/scenario-builder';
import { ComparisonView } from '@/components/simulation/comparison-view';
import { SimResultView } from '@/components/simulation/sim-result-view';

const SIM_VIEWS = [
  { id: 'home', label: 'Home' },
  { id: 'new-sim', label: 'New Sim' },
  { id: 'compare', label: 'Compare' },
  { id: 'saved', label: 'Saved' },
] as const;

type SimView = typeof SIM_VIEWS[number]['id'];

export function SimulationContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeView, setActiveView] = useState<SimView>('home');

  return (
    <View style={styles.container}>
      {/* Pill Navigation */}
      <View style={[styles.pillBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillScroll}
        >
          {SIM_VIEWS.map((view) => {
            const active = activeView === view.id;
            return (
              <Pressable
                key={view.id}
                style={[
                  styles.pill,
                  {
                    backgroundColor: active ? '#fff' : colors.backgroundTertiary,
                    borderColor: active ? '#fff' : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setActiveView(view.id);
                }}
              >
                <ThemedText style={[styles.pillText, { color: active ? '#000' : colors.textSecondary }]}>
                  {view.label}
                </ThemedText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeView === 'home' && <SimHome />}
        {activeView === 'new-sim' && <ScenarioBuilder />}
        {activeView === 'compare' && <ComparisonView />}
        {activeView === 'saved' && <SimResultView />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 8,
  },
  pillScroll: {
    paddingHorizontal: Spacing.md,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
});
