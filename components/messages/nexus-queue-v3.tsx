/**
 * NexusQueueV3 — Program Q&A + Escalation Queue.
 * 3 filter pills: Questions (all) | Escalations | Answered.
 * Context label at top, SectionList filtered by active pill.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet, SectionList, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getNexusEscalations } from '@/data/mock-messages-v3';
import { NexusEscalationRowV3 } from '@/components/messages/nexus-escalation-row-v3';
import type { Mode, NexusEscalationV3 } from '@/types';

type FilterPill = 'questions' | 'escalations' | 'answered';

const PILLS: { id: FilterPill; label: string }[] = [
  { id: 'questions', label: 'Questions' },
  { id: 'escalations', label: 'Escalations' },
  { id: 'answered', label: 'Answered' },
];

interface NexusQueueV3Props {
  mode: Mode;
  onSelectEscalation: (escalation: NexusEscalationV3) => void;
}

export function NexusQueueV3({ mode, onSelectEscalation }: NexusQueueV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const [activePill, setActivePill] = useState<FilterPill>('questions');

  const allItems = useMemo(() => getNexusEscalations(mode), [mode]);

  const filteredItems = useMemo(() => {
    switch (activePill) {
      case 'escalations':
        return allItems.filter((e) => e.status === 'escalated');
      case 'answered':
        return allItems.filter((e) => e.status === 'answered_by_nexus' || e.status === 'answered_by_coach');
      case 'questions':
      default:
        return allItems;
    }
  }, [allItems, activePill]);

  const sections = useMemo(() => {
    if (activePill === 'questions') {
      const unanswered = filteredItems
        .filter((e) => e.status === 'unanswered' || e.status === 'escalated')
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
      const answered = filteredItems
        .filter((e) => e.status === 'answered_by_nexus' || e.status === 'answered_by_coach')
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return [
        { title: 'Open', data: unanswered },
        { title: 'Resolved', data: answered },
      ].filter((s) => s.data.length > 0);
    }

    // Escalations and Answered: single section, newest first
    const sorted = [...filteredItems].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    if (sorted.length === 0) return [];
    const sectionTitle = activePill === 'escalations' ? 'Escalated' : 'Resolved';
    return [{ title: sectionTitle, data: sorted }];
  }, [filteredItems, activePill]);

  const renderItem = useCallback(
    ({ item }: { item: NexusEscalationV3 }) => (
      <NexusEscalationRowV3
        escalation={item}
        onPress={() => onSelectEscalation(item)}
      />
    ),
    [onSelectEscalation],
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: { title: string } }) => (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <ThemedText style={[styles.sectionTitle, { color: colors.textTertiary }]}>
          {section.title}
        </ThemedText>
      </View>
    ),
    [colors],
  );

  const pillCounts = useMemo(() => ({
    questions: allItems.length,
    escalations: allItems.filter((e) => e.status === 'escalated').length,
    answered: allItems.filter((e) => e.status === 'answered_by_nexus' || e.status === 'answered_by_coach').length,
  }), [allItems]);

  return (
    <View style={styles.wrapper}>
      {/* Context label */}
      <View style={styles.contextRow}>
        <IconSymbol name="sparkles" size={14} color={accent} />
        <ThemedText style={[styles.contextLabel, { color: colors.textTertiary }]}>
          {mode === 'church' ? 'Church · ICC · ICCLA · Member' : mode === 'business' ? 'Business · Org' : mode === 'education' ? 'Education · Institution' : mode === 'competition' ? 'Competition · League' : 'Sports · Org · Program'}
        </ThemedText>
      </View>

      {/* Filter pills */}
      <View style={styles.pillRow}>
        {PILLS.map((pill) => {
          const isActive = activePill === pill.id;
          const count = pillCounts[pill.id];
          return (
            <Pressable
              key={pill.id}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? accent : colors.backgroundSecondary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActivePill(pill.id);
              }}
            >
              <ThemedText
                style={[
                  styles.pillText,
                  { color: isActive ? '#fff' : colors.textSecondary },
                ]}
              >
                {pill.label}
              </ThemedText>
              {count > 0 && (
                <View style={[styles.pillBadge, { backgroundColor: isActive ? 'rgba(255,255,255,0.3)' : colors.backgroundTertiary }]}>
                  <ThemedText style={[styles.pillBadgeText, { color: isActive ? '#fff' : colors.textTertiary }]}>
                    {count}
                  </ThemedText>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* List or empty state */}
      {sections.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="checkmark.circle" size={32} color="#22C55E" />
          <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
            {activePill === 'escalations' ? 'No escalations' : activePill === 'answered' ? 'No resolved questions' : 'All caught up'}
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            {activePill === 'escalations' ? 'All questions are handled.' : activePill === 'answered' ? 'Resolved answers will appear here.' : 'Nexus has the answers.'}
          </ThemedText>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 4,
  },
  contextLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  pillRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  pillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  pillBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: 100,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xl * 3,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
  },
});
