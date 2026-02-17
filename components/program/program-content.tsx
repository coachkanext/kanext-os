/**
 * Program Content — Full Program OS hub with 7-page pill nav.
 * Views: Overview | People | Teams | Seasons | System | Permissions | Audit
 * "System" renders the existing ProgramContextSection unchanged.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ProgramOverview } from '@/components/program/program-overview';
import { ProgramPeople } from '@/components/program/program-people';
import { ProgramTeams } from '@/components/program/program-teams';
import { ProgramSeasons } from '@/components/program/program-seasons';
import { ProgramContextSection } from '@/components/program-context-section';
import { ProgramPermissions } from '@/components/program/program-permissions';
import { ProgramAuditLog } from '@/components/program/program-audit-log';

const PROGRAM_VIEWS = [
  { id: 'overview', label: 'Overview' },
  { id: 'people', label: 'People' },
  { id: 'teams', label: 'Teams' },
  { id: 'seasons', label: 'Seasons' },
  { id: 'system', label: 'System' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'audit', label: 'Audit' },
] as const;

type ProgramView = typeof PROGRAM_VIEWS[number]['id'];

export function ProgramContent() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeView, setActiveView] = useState<ProgramView>('overview');

  return (
    <View style={styles.container}>
      {/* Pill Navigation */}
      <View style={[styles.pillBar, { borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillScroll}
        >
          {PROGRAM_VIEWS.map((view) => {
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
        {activeView === 'overview' && <ProgramOverview />}
        {activeView === 'people' && <ProgramPeople />}
        {activeView === 'teams' && <ProgramTeams />}
        {activeView === 'seasons' && <ProgramSeasons />}
        {activeView === 'system' && (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.systemScroll}
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled
          >
            <ProgramContextSection />
          </ScrollView>
        )}
        {activeView === 'permissions' && <ProgramPermissions />}
        {activeView === 'audit' && <ProgramAuditLog />}
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
  systemScroll: {
    paddingBottom: 40,
  },
});
