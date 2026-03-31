/**
 * EvidenceQueue — Evidence items pending review.
 * Tab row (All/Pending/Reviewed/Flagged), evidence cards with
 * player info, type badge, status badge, and description.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { EVIDENCE_QUEUE, type EvidenceStatus, type EvidenceType } from '@/data/mock-development-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const TABS: { key: string; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'reviewed', label: 'Reviewed' },
  { key: 'flagged', label: 'Flagged' },
];

const STATUS_COLORS: Record<EvidenceStatus, string> = {
  pending: Brand.warning,
  reviewed: Brand.success,
  flagged: Brand.error,
};

const TYPE_ICONS: Record<EvidenceType, string> = {
  clip: 'video.fill',
  stat: 'chart.bar',
  note: 'doc.text.fill',
};

const TYPE_LABELS: Record<EvidenceType, string> = {
  clip: 'Clip',
  stat: 'Stat',
  note: 'Note',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function EvidenceQueue() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [activeTab, setActiveTab] = useState('all');

  const filteredEvidence = useMemo(() => {
    if (activeTab === 'all') return EVIDENCE_QUEUE;
    return EVIDENCE_QUEUE.filter((e) => e.status === activeTab);
  }, [activeTab]);

  const handleTabPress = (tab: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Tab Row */}
      <View style={styles.tabRow}>
        {TABS.map((tab) => {
          const isActive = tab.key === activeTab;
          const count =
            tab.key === 'all'
              ? EVIDENCE_QUEUE.length
              : EVIDENCE_QUEUE.filter((e) => e.status === tab.key).length;

          return (
            <Pressable
              key={tab.key}
              style={[
                styles.tab,
                { borderColor: colors.border },
                isActive && styles.tabActive,
              ]}
              onPress={() => handleTabPress(tab.key)}
            >
              <ThemedText style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
              </ThemedText>
              <ThemedText style={[styles.tabCount, isActive && styles.tabCountActive]}>
                {count}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Evidence Cards */}
      {filteredEvidence.map((item) => {
        const statusColor = STATUS_COLORS[item.status];
        const typeIcon = TYPE_ICONS[item.type];
        const typeLabel = TYPE_LABELS[item.type];

        return (
          <View
            key={item.id}
            style={[styles.evidenceCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            {/* Header Row */}
            <View style={styles.evidenceHeader}>
              <View style={styles.evidenceIdentity}>
                <ThemedText style={[styles.evidencePlayer, { color: colors.text }]}>
                  {item.playerName}
                </ThemedText>
                <ThemedText style={[styles.evidencePlanItem, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.planItemTitle}
                </ThemedText>
              </View>
              <View style={styles.evidenceBadges}>
                {/* Type Badge */}
                <View style={[styles.typeBadge, { backgroundColor: colors.backgroundTertiary }]}>
                  <IconSymbol name={typeIcon as any} size={10} color={colors.textSecondary} />
                  <ThemedText style={[styles.typeBadgeText, { color: colors.textSecondary }]}>
                    {typeLabel}
                  </ThemedText>
                </View>
                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                  <ThemedText style={[styles.statusBadgeText, { color: statusColor }]}>
                    {item.status}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Description */}
            <ThemedText style={[styles.evidenceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            {/* Date */}
            <ThemedText style={[styles.evidenceDate, { color: colors.textTertiary }]}>
              {item.date}
            </ThemedText>
          </View>
        );
      })}

      {filteredEvidence.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No evidence items in this category
          </ThemedText>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },

  // Tab row
  tabRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.md,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#0B0F14',
    borderWidth: 1,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabTextActive: {
    color: '#000000',
  },
  tabCount: {
    fontSize: 10,
    fontWeight: '600',
    color: '#9C9790',
    marginTop: 1,
  },
  tabCountActive: {
    color: '#52525B',
  },

  // Evidence card
  evidenceCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  evidenceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  evidenceIdentity: {
    flex: 1,
    minWidth: 0,
  },
  evidencePlayer: {
    fontSize: 14,
    fontWeight: '600',
  },
  evidencePlanItem: {
    fontSize: 12,
    marginTop: 2,
  },
  evidenceBadges: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Description
  evidenceDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: Spacing.sm,
  },

  // Date
  evidenceDate: {
    fontSize: 10,
    marginTop: 6,
  },

  // Empty
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
