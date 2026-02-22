/**
 * Biz Deals V2 — Orchestrator with 3 sub-pills: Pipeline | Contacts | Activity
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { BizDealsPipelineView } from '@/components/biz-home/biz-deals-pipeline-view';
import { BizDealsContactsView } from '@/components/biz-home/biz-deals-contacts-view';
import { BizDealsActivityView } from '@/components/biz-home/biz-deals-activity-view';

const PILLS = ['Pipeline', 'Contacts', 'Activity'] as const;
type DealsPill = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function BizDealsV2({ colors, accent }: Props) {
  const [activePill, setActivePill] = useState<DealsPill>('Pipeline');

  const renderContent = () => {
    switch (activePill) {
      case 'Pipeline':
        return <BizDealsPipelineView colors={colors} accent={accent} />;
      case 'Contacts':
        return <BizDealsContactsView colors={colors} accent={accent} />;
      case 'Activity':
        return <BizDealsActivityView colors={colors} accent={accent} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Sub-Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => {
          const isActive = activePill === pill;
          return (
            <Pressable
              key={pill}
              style={[styles.pill, isActive && { backgroundColor: accent }]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActivePill(pill);
              }}
            >
              <ThemedText
                style={[styles.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {pill}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#2F3336',
  },
  pillText: { fontSize: 12, fontWeight: '600' },
});
