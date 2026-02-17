/**
 * Development Content — Full Development OS hub with 6-view pill nav.
 * Views: Home | Weekly | Groups | Drills | Evidence | Transfer
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DevHome } from '@/components/development/dev-home';
import { WeeklyPlanBuilder } from '@/components/development/weekly-plan-builder';
import { PositionGroupBoard } from '@/components/development/position-group-board';
import { DrillLibrary } from '@/components/development/drill-library';
import { EvidenceQueue } from '@/components/development/evidence-queue';
import { TransferTracker } from '@/components/development/transfer-tracker';

const DEV_VIEWS = [
  { id: 'home', label: 'Home' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'groups', label: 'Groups' },
  { id: 'drills', label: 'Drills' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'transfer', label: 'Transfer' },
] as const;

type DevView = typeof DEV_VIEWS[number]['id'];

export function DevelopmentContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeView, setActiveView] = useState<DevView>('home');

  return (
    <View style={styles.container}>
      {/* Pill Navigation */}
      <View style={[styles.pillBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillScroll}
        >
          {DEV_VIEWS.map((view) => {
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
        {activeView === 'home' && <DevHome />}
        {activeView === 'weekly' && <WeeklyPlanBuilder />}
        {activeView === 'groups' && <PositionGroupBoard />}
        {activeView === 'drills' && <DrillLibrary />}
        {activeView === 'evidence' && <EvidenceQueue />}
        {activeView === 'transfer' && <TransferTracker />}
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
