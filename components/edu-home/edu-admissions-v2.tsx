/**
 * Education Admissions V2 — Orchestrator
 * 3 sub-pills: Pipeline | Programs | Outreach
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { EduAdmissionsPipelineView } from '@/components/edu-home/edu-admissions-pipeline-view';
import { EduAdmissionsProgramsView } from '@/components/edu-home/edu-admissions-programs-view';
import { EduAdmissionsOutreachView } from '@/components/edu-home/edu-admissions-outreach-view';

const PILLS = ['Pipeline', 'Programs', 'Outreach'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function EduAdmissionsV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Pipeline');

  const renderContent = () => {
    switch (activeTab) {
      case 'Pipeline':
        return <EduAdmissionsPipelineView colors={colors} accent={accent} />;
      case 'Programs':
        return <EduAdmissionsProgramsView colors={colors} accent={accent} />;
      case 'Outreach':
        return <EduAdmissionsOutreachView colors={colors} accent={accent} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Bar */}
      <View style={styles.pillBar}>
        {PILLS.map((pill) => (
          <Pressable
            key={pill}
            style={[styles.pill, activeTab === pill && { backgroundColor: accent }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setActiveTab(pill);
            }}
          >
            <ThemedText style={[styles.pillText, { color: activeTab === pill ? '#000' : colors.textSecondary }]}>
              {pill}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  pillBar: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 2, paddingBottom: 10, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillText: { fontSize: 13, fontWeight: '600' },
});
