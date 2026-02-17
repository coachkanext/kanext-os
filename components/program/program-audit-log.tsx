/**
 * Program Audit Log — Chronological action log.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AUDIT_LOG, AUDIT_ACTION_META } from '@/data/mock-program-v2';

export function ProgramAuditLog() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {AUDIT_LOG.map((entry, index) => {
        const meta = AUDIT_ACTION_META[entry.action];

        return (
          <View key={entry.id} style={styles.entryWrapper}>
            {/* Timeline connector */}
            {index < AUDIT_LOG.length - 1 && (
              <View style={[styles.timelineLine, { backgroundColor: colors.border }]} />
            )}

            <View style={styles.entryRow}>
              {/* Action type icon */}
              <View style={[styles.iconCircle, { backgroundColor: meta.color + '20' }]}>
                <IconSymbol name={meta.icon as any} size={16} color={meta.color} />
              </View>

              {/* Entry content */}
              <View style={styles.entryContent}>
                {/* Type badge + timestamp */}
                <View style={styles.entryHeader}>
                  <View style={[styles.typeBadge, { backgroundColor: meta.color + '15' }]}>
                    <ThemedText style={[styles.typeText, { color: meta.color }]}>
                      {meta.label}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.timestamp, { color: colors.textTertiary }]}>
                    {entry.timestamp}
                  </ThemedText>
                </View>

                {/* Actor */}
                <ThemedText style={[styles.actor, { color: colors.textSecondary }]}>
                  {entry.actor}
                </ThemedText>

                {/* Description */}
                <ThemedText style={[styles.description, { color: colors.text }]}>
                  {entry.description}
                </ThemedText>

                {/* Optional detail */}
                {entry.detail && (
                  <ThemedText style={[styles.detail, { color: colors.textTertiary }]}>
                    {entry.detail}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  entryWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },

  // Timeline
  timelineLine: {
    position: 'absolute',
    left: 18,
    top: 40,
    bottom: -Spacing.md,
    width: 1,
  },

  entryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  // Icon
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Content
  entryContent: {
    flex: 1,
    paddingTop: 2,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  timestamp: {
    fontSize: 11,
  },
  actor: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  detail: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
