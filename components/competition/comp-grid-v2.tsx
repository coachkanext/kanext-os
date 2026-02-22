/**
 * Competition Grid V2 — Orchestrator with 3 sub-pills: Teams | Drivers | Crew
 * Shows the full grid of teams, drivers, and crew for the KaNeXT Racing League.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CompGridTeamsView } from '@/components/competition/comp-grid-teams-view';
import { CompGridDriversView } from '@/components/competition/comp-grid-drivers-view';
import { CompGridCrewView } from '@/components/competition/comp-grid-crew-view';

const PILLS = ['Teams', 'Drivers', 'Crew'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompGridV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Teams');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[styles.pill, activeTab === pill && { backgroundColor: accent }]}
            onPress={() => setActiveTab(pill)}
          >
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#000' : colors.textSecondary }]}>
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'Teams' && <CompGridTeamsView colors={colors} accent={accent} />}
      {activeTab === 'Drivers' && <CompGridDriversView colors={colors} accent={accent} />}
      {activeTab === 'Crew' && <CompGridCrewView colors={colors} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#2F3336' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
