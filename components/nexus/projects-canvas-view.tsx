/**
 * Projects Canvas View
 * Project cards list. Shown when canvasView === 'projects'.
 * Data from spec sampleData.js. Monochrome badges per design tokens.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { useColors, type ComponentColors } from '@/hooks/use-colors';

export interface Project {
  id: string;
  title: string;
  meta: string;
  badge: 'Active' | 'In Review' | 'Draft';
}

export const MOCK_PROJECTS: Project[] = [
  { id: 'p1', title: 'Recruiting Strategy 2026',  meta: '12 chats · 8 artifacts · Lincoln U',  badge: 'Active'    },
  { id: 'p2', title: 'Spring Practice Plan',       meta: '6 chats · 3 artifacts · Lincoln U',   badge: 'Active'    },
  { id: 'p3', title: 'NIL Compliance Review',      meta: '4 chats · 5 artifacts · Lincoln U',   badge: 'In Review' },
  { id: 'p4', title: 'Fundraising Campaign Q2',    meta: '9 chats · 11 artifacts · Lincoln U',  badge: 'Active'    },
  { id: 'p5', title: 'Enrollment Projections',     meta: '3 chats · 2 artifacts · Lincoln U',   badge: 'Draft'     },
];

interface ProjectsCanvasViewProps {
  onSelectProject: (id: string) => void;
}

export function ProjectsCanvasView({ onSelectProject }: ProjectsCanvasViewProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {MOCK_PROJECTS.map((project) => (
        <Pressable
          key={project.id}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: pressed ? C.surfacePressed : C.separator },
          ]}
          onPress={() => onSelectProject(project.id)}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle} numberOfLines={1}>{project.title}</Text>
            <View style={[styles.badge, { backgroundColor: C.surfacePressed }]}>
              <Text style={[styles.badgeText, { color: C.secondary }]}>{project.badge}</Text>
            </View>
          </View>
          <Text style={styles.cardMeta}>{project.meta}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40, gap: 10 },
    card: {
      borderRadius: 14,
      padding: 14,
      gap: 6,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
    },
    cardTitle: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: C.label,
    },
    cardMeta: { fontSize: 12, color: C.secondary },
    badge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    badgeText: { fontSize: 11, fontWeight: '600' },
  });
