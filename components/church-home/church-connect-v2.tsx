/**
 * Church Connect V2 — Orchestrator
 * 3 sub-pills: Pipeline | Groups | Visitors
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';

import { ChurchConnectPipelineView } from '@/components/church-home/church-connect-pipeline-view';
import { ChurchConnectGroupsView } from '@/components/church-home/church-connect-groups-view';
import { ChurchConnectVisitorsView } from '@/components/church-home/church-connect-visitors-view';

// =============================================================================
// PILLS
// =============================================================================

const PILLS = ['Pipeline', 'Groups', 'Visitors'] as const;
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

export function ChurchConnectV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Pipeline');

  const handlePillPress = useCallback((pill: PillTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(pill);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'Pipeline':
        return <ChurchConnectPipelineView colors={colors} accent={accent} />;
      case 'Groups':
        return <ChurchConnectGroupsView colors={colors} accent={accent} />;
      case 'Visitors':
        return <ChurchConnectVisitorsView colors={colors} accent={accent} />;
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
