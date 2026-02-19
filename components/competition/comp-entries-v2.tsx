/**
 * Competition Entries V2 — Orchestrator with 3 sub-pills: Confirmed | Wildcards | Compliance
 * Entry management for the K-1 Racing League.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { CompEntriesConfirmedView } from '@/components/competition/comp-entries-confirmed-view';
import { CompEntriesWildcardsView } from '@/components/competition/comp-entries-wildcards-view';
import { CompEntriesComplianceView } from '@/components/competition/comp-entries-compliance-view';

const PILLS = ['Confirmed', 'Wildcards', 'Compliance'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function CompEntriesV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Confirmed');

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
      {activeTab === 'Confirmed' && <CompEntriesConfirmedView colors={colors} accent={accent} />}
      {activeTab === 'Wildcards' && <CompEntriesWildcardsView colors={colors} accent={accent} />}
      {activeTab === 'Compliance' && <CompEntriesComplianceView colors={colors} accent={accent} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
