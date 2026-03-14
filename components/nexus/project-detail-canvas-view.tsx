/**
 * Project Detail Canvas View
 * Title, description, files/instructions pills, related chats.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { formatTimestamp } from '@/data/mock-nexus';
import { MOCK_PROJECTS } from './projects-canvas-view';
import type { Conversation } from '@/types';

const PROJECT_DESCRIPTIONS: Record<string, string> = {
  'p1': 'Focus on Class of 2027 WR and DB prospects for Lincoln University. Prioritize athletes with KR scores above 75.',
  'p2': 'Weekly practice schedules, drill sets, and performance tracking for the spring season.',
  'p3': 'Review NIL agreements, eligibility documentation, and compliance reporting for Lincoln U.',
  'p4': 'Donor outreach, campaign materials, and fundraising performance for Q2.',
  'p5': 'Enrollment trend analysis and projections for upcoming academic year planning.',
};

type Pill = 'files' | 'instructions';

interface Props {
  projectId: string | null;
  conversations: Conversation[];
  onSelectConversation: (id: string) => void;
}

export function ProjectDetailCanvasView({ projectId, conversations, onSelectConversation }: Props) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const [activePill, setActivePill] = useState<Pill>('files');

  const project = MOCK_PROJECTS.find((p) => p.id === projectId);

  if (!project) {
    return (
      <View style={[styles.container, { alignItems: 'center', paddingTop: 80 }]}>
        <Text style={styles.notFound}>Project not found</Text>
      </View>
    );
  }

  const description = PROJECT_DESCRIPTIONS[project.id] ?? 'No description available.';
  const relatedConvs = conversations.slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{project.title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>

      {/* Pills */}
      <View style={styles.pillsRow}>
        {(['files', 'instructions'] as Pill[]).map((pill) => (
          <Pressable
            key={pill}
            style={[
              styles.pill,
              {
                backgroundColor: activePill === pill ? C.surface : 'transparent',
                borderColor: activePill === pill ? C.divider : C.divider,
              },
            ]}
            onPress={() => setActivePill(pill)}
          >
            <Text style={styles.pillIcon}>{pill === 'files' ? '📄' : '📝'}</Text>
            <Text style={[styles.pillLabel, { color: activePill === pill ? C.label : C.secondary }]}>
              {pill.charAt(0).toUpperCase() + pill.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={[styles.pillContent, { borderColor: C.divider }]}>
        <Text style={styles.pillContentText}>
          {activePill === 'files'
            ? 'No files attached yet. Add files to this project to reference them in chats.'
            : 'No instructions set. Add custom instructions to guide Nexus for this project.'}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>RELATED CHATS</Text>

      {relatedConvs.length === 0 ? (
        <Text style={styles.emptyChats}>No chats yet</Text>
      ) : (
        relatedConvs.map((conv) => (
          <Pressable
            key={conv.id}
            style={({ pressed }) => [
              styles.chatRow,
              { backgroundColor: pressed ? C.separator : 'transparent' },
            ]}
            onPress={() => onSelectConversation(conv.id)}
          >
            <View style={styles.chatRowContent}>
              <Text style={styles.chatRowTitle} numberOfLines={1}>{conv.title}</Text>
              <Text style={styles.chatRowMeta}>{formatTimestamp(conv.updatedAt)}</Text>
            </View>
            <IconSymbol name="chevron.right" size={14} color={C.secondary} />
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: C.bg },
    content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },
    notFound: { fontSize: 15, color: C.secondary },
    header: { marginBottom: 16, gap: 6 },
    title: { fontSize: 20, fontWeight: '700', color: C.label },
    description: { fontSize: 13, lineHeight: 19, color: C.secondary },
    pillsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
    },
    pillIcon: { fontSize: 13 },
    pillLabel: { fontSize: 13, fontWeight: '500' },
    pillContent: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 10,
      padding: 14,
      marginBottom: 20,
    },
    pillContentText: { fontSize: 13, lineHeight: 19, color: C.secondary },
    sectionLabel: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      color: C.secondary,
      marginBottom: 4,
    },
    emptyChats: { fontSize: 14, color: C.secondary, paddingTop: 8 },
    chatRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: C.divider,
      gap: 8,
    },
    chatRowContent: { flex: 1, gap: 3 },
    chatRowTitle: { fontSize: 15, fontWeight: '500', color: C.label },
    chatRowMeta: { fontSize: 12, color: C.secondary },
  });
