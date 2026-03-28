/**
 * NexusProjectSection — Collapsible "Projects" section inside the sidebar.
 * Shows project folders and a "Create Project" link.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, Pressable, StyleSheet, Alert, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import type { NexusProject } from '@/services/nexus/nexus-chat-storage';

// ── Component ─────────────────────────────────────────────────────────────────

interface NexusProjectSectionProps {
  projects:        NexusProject[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
  onCreateProject: (name: string) => void;
}

export function NexusProjectSection({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
}: NexusProjectSectionProps) {
  const C            = useColors();
  const S            = useMemo(() => makeStyles(C), [C]);
  const [expanded, setExpanded] = useState(true);

  const handleCreate = () => {
    if (Platform.OS === 'ios') {
      Alert.prompt(
        'New Project',
        'Enter a name for this project',
        (name) => {
          if (name?.trim()) {
            onCreateProject(name.trim());
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        },
        'plain-text',
        '',
      );
    } else {
      // Android: use a simple confirmation dialog (full project creation sheet coming later)
      onCreateProject('New Project');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  return (
    <View style={S.section}>
      {/* Section header */}
      <Pressable
        style={({ pressed }) => [
          S.header,
          { opacity: pressed ? 0.7 : 1 },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setExpanded(v => !v);
        }}
      >
        <Text style={[S.headerText, { color: C.secondary }]}>PROJECTS</Text>
        <IconSymbol
          name={expanded ? 'chevron.down' : 'chevron.right'}
          size={12}
          color={C.muted}
        />
      </Pressable>

      {/* Project list */}
      {expanded && (
        <>
          {projects.length === 0 && (
            <Text style={[S.emptyHint, { color: C.muted }]}>
              No projects yet
            </Text>
          )}

          {projects.map(project => (
            <Pressable
              key={project.id}
              style={({ pressed }) => [
                S.projectRow,
                activeProjectId === project.id && { backgroundColor: C.surfacePressed },
                { opacity: pressed ? 0.7 : 1 },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Toggle: tap active project to clear filter
                onSelectProject(
                  activeProjectId === project.id ? null : project.id
                );
              }}
            >
              <IconSymbol name="folder" size={16} color={C.muted} />
              <Text
                style={[
                  S.projectName,
                  { color: activeProjectId === project.id ? C.label : C.secondary },
                  activeProjectId === project.id && { fontWeight: '500' },
                ]}
                numberOfLines={1}
              >
                {project.name}
              </Text>
              {(project.chatIds?.length ?? 0) > 0 && (
                <Text style={[S.chatCount, { color: C.muted }]}>
                  {project.chatIds!.length}
                </Text>
              )}
            </Pressable>
          ))}

          {/* Create Project */}
          <Pressable
            style={({ pressed }) => [
              S.createLink,
              { opacity: pressed ? 0.6 : 1 },
            ]}
            onPress={handleCreate}
          >
            <IconSymbol name="plus" size={13} color={C.accent} />
            <Text style={[S.createText, { color: C.accent }]}>
              Create Project
            </Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    section: {
      paddingVertical: 4,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    headerText: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
    },
    emptyHint: {
      fontSize: 13,
      paddingHorizontal: 16,
      paddingVertical: 6,
    },
    projectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 16,
      paddingVertical: 10,
      minHeight: 44,
    },
    projectName: {
      flex: 1,
      fontSize: 15,
    },
    chatCount: {
      fontSize: 12,
    },
    createLink: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    createText: {
      fontSize: 13,
    },
  });
