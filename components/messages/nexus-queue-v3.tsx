/**
 * NexusQueueV3 — Nexus escalation SectionList.
 * "Unanswered" section (FIFO) + "Answered" section (most recent first).
 * Empty state: "All caught up. Nexus has the answers."
 */

import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, SectionList } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getNexusEscalations } from '@/data/mock-messages-v3';
import { NexusEscalationRowV3 } from '@/components/messages/nexus-escalation-row-v3';
import type { Mode, NexusEscalationV3 } from '@/types';

interface NexusQueueV3Props {
  mode: Mode;
  onSelectEscalation: (escalation: NexusEscalationV3) => void;
}

export function NexusQueueV3({ mode, onSelectEscalation }: NexusQueueV3Props) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const sections = useMemo(() => {
    const all = getNexusEscalations(mode);
    const unanswered = all
      .filter((e) => e.status === 'unanswered')
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime()); // FIFO
    const answered = all
      .filter((e) => e.status === 'answered')
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); // Most recent first

    return [
      { title: 'Unanswered', data: unanswered },
      { title: 'Answered', data: answered },
    ].filter((s) => s.data.length > 0);
  }, [mode]);

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

  if (sections.length === 0) {
    return (
      <View style={styles.emptyState}>
        <IconSymbol name="checkmark.circle" size={32} color="#22C55E" />
        <ThemedText style={[styles.emptyTitle, { color: colors.text }]}>
          All caught up
        </ThemedText>
        <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
          Nexus has the answers.
        </ThemedText>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled
    />
  );
}

const styles = StyleSheet.create({
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
