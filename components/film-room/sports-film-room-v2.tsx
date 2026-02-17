/**
 * SportsFilmRoomV2 — 4-tab pill nav: Workspaces | Cutups | Assignments | Notes
 * RBAC-gated tabs via getVideoSectionVisibility.
 */

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, FlatList } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { WorkspaceCard } from '@/components/film-room/workspace-card';
import { CutupTemplateCard } from '@/components/film-room/cutup-template-card';
import { AssignmentRow } from '@/components/film-room/assignment-row';
import { FilmNoteRow } from '@/components/film-room/film-note-row';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getVideoSectionVisibility, type SportsRoleLens, type VideoSection } from '@/utils/sports-rbac';
import {
  MOCK_WORKSPACES,
  MOCK_CUTUP_TEMPLATES,
  MOCK_FILM_ASSIGNMENTS,
  MOCK_FILM_NOTES,
} from '@/data/mock-sports-workspaces';

type FilmTab = 'workspaces' | 'cutups' | 'assignments' | 'notes';

interface TabDef {
  key: FilmTab;
  label: string;
  rbacSection: VideoSection;
}

const ALL_TABS: TabDef[] = [
  { key: 'workspaces', label: 'Workspaces', rbacSection: 'filmroom_workspaces' },
  { key: 'cutups', label: 'Cutups', rbacSection: 'filmroom_cutups' },
  { key: 'assignments', label: 'Assignments', rbacSection: 'filmroom_assignments' },
  { key: 'notes', label: 'Notes', rbacSection: 'filmroom_notes' },
];

const DEFAULT_ROLE: SportsRoleLens = 'R1';

export function SportsFilmRoomV2() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const role = DEFAULT_ROLE;

  const visibleTabs = useMemo(
    () => ALL_TABS.filter((t) => getVideoSectionVisibility(t.rbacSection, role) !== 'hidden'),
    [role],
  );

  const [activeTab, setActiveTab] = useState<FilmTab>(visibleTabs[0]?.key ?? 'workspaces');

  const handleTabPress = (tab: FilmTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'workspaces':
        return (
          <FlatList
            data={MOCK_WORKSPACES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <WorkspaceCard workspace={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'cutups':
        return (
          <ScrollView contentContainerStyle={styles.gridContent} showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {MOCK_CUTUP_TEMPLATES.map((template) => (
                <CutupTemplateCard key={template.id} template={template} />
              ))}
            </View>
          </ScrollView>
        );
      case 'assignments':
        return (
          <FlatList
            data={MOCK_FILM_ASSIGNMENTS}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AssignmentRow assignment={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'notes':
        return (
          <FlatList
            data={MOCK_FILM_NOTES}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <FilmNoteRow note={item} />}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Pill Nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillRow}
        style={styles.pillScroll}
      >
        {visibleTabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              style={[
                styles.pill,
                { backgroundColor: active ? '#fff' : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <ThemedText
                style={[styles.pillText, { color: active ? '#000' : colors.textSecondary }]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      <View style={styles.contentArea}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pillScroll: {
    flexGrow: 0,
    paddingVertical: Spacing.sm,
  },
  pillRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  pill: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  gridContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm + 4,
  },
});
