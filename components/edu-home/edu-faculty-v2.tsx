/**
 * Education Faculty V2 — Orchestrator
 * 3 sub-pills: Directory | Departments | Senate
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { EduFacultyDirectoryView } from '@/components/edu-home/edu-faculty-directory-view';
import { EduFacultyDepartmentsView } from '@/components/edu-home/edu-faculty-departments-view';
import { EduFacultySenateView } from '@/components/edu-home/edu-faculty-senate-view';

const PILLS = ['Directory', 'Departments', 'Senate'] as const;
type PillTab = (typeof PILLS)[number];

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

export function EduFacultyV2({ colors, accent }: Props) {
  const [activeTab, setActiveTab] = useState<PillTab>('Directory');

  const renderContent = () => {
    switch (activeTab) {
      case 'Directory':
        return <EduFacultyDirectoryView colors={colors} accent={accent} />;
      case 'Departments':
        return <EduFacultyDepartmentsView colors={colors} accent={accent} />;
      case 'Senate':
        return <EduFacultySenateView colors={colors} accent={accent} />;
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
