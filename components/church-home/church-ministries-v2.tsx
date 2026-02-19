/**
 * Church Ministries V2 — Orchestrator
 * 3 sub-pills: Active | Leaders | Schedule
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

import { ChurchMinistriesActiveView } from '@/components/church-home/church-ministries-active-view';
import { ChurchMinistriesLeadersView } from '@/components/church-home/church-ministries-leaders-view';
import { ChurchMinistriesScheduleView } from '@/components/church-home/church-ministries-schedule-view';

// =============================================================================
// PILLS
// =============================================================================

const PILLS = ['Active', 'Leaders', 'Schedule'] as const;
type PillTab = (typeof PILLS)[number];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchMinistriesV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Active');

  const handlePillPress = useCallback((pill: PillTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(pill);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Active':
        return <ChurchMinistriesActiveView colors={colors} accent={accent} />;
      case 'Leaders':
        return <ChurchMinistriesLeadersView colors={colors} accent={accent} />;
      case 'Schedule':
        return <ChurchMinistriesScheduleView colors={colors} accent={accent} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => {
          const isActive = activeTab === pill;
          return (
            <Pressable
              key={pill}
              style={[
                styles.pill,
                isActive && { backgroundColor: accent },
              ]}
              onPress={() => handlePillPress(pill)}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
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

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 2,
    paddingBottom: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
