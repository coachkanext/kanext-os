/**
 * SportsRequestCard — Request card with type badge, impact flags, status, audit trail.
 */

import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getRequestTypeColor,
  getRequestTypeLabel,
  getRequestStatusColor,
  getImpactFlagLabel,
  type SportsRequest,
} from '@/data/mock-sports-messages';

interface SportsRequestCardProps {
  request: SportsRequest;
}

export function SportsRequestCard({ request }: SportsRequestCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const typeColor = getRequestTypeColor(request.type);
  const statusColor = getRequestStatusColor(request.status);
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded((prev) => !prev);
      }}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '1A' }]}>
          <ThemedText style={[styles.typeText, { color: typeColor }]}>
            {getRequestTypeLabel(request.type)}
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {request.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Title */}
      <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {request.title}
      </ThemedText>

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={[styles.submitterAvatar, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[styles.submitterInitials, { color: colors.text }]}>
            {request.submitterInitials}
          </ThemedText>
        </View>
        <ThemedText style={[styles.submitter, { color: colors.textSecondary }]}>
          {request.submitter}
        </ThemedText>
        <ThemedText
          style={[
            styles.dueDate,
            { color: request.isOverdue ? '#EF4444' : colors.textTertiary },
          ]}
        >
          Due: {request.dueDate}{request.isOverdue ? ' (OVERDUE)' : ''}
        </ThemedText>
      </View>

      {/* Impact flags */}
      {request.impactFlags.length > 0 && (
        <View style={styles.flagRow}>
          <ThemedText style={[styles.flagLabel, { color: colors.textTertiary }]}>Blocks:</ThemedText>
          {request.impactFlags.map((flag) => (
            <View key={flag} style={[styles.flagChip, { backgroundColor: '#EF4444' + '1A' }]}>
              <ThemedText style={[styles.flagText, { color: '#EF4444' }]}>
                {getImpactFlagLabel(flag)}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Expandable audit trail */}
      {expanded && request.auditTrail.length > 0 && (
        <View style={[styles.auditTrail, { borderTopColor: colors.border }]}>
          <ThemedText style={[styles.auditTitle, { color: colors.textTertiary }]}>
            AUDIT TRAIL
          </ThemedText>
          {request.auditTrail.map((entry, i) => (
            <View key={i} style={styles.auditEntry}>
              <View style={[styles.auditDot, { backgroundColor: colors.textTertiary }]} />
              <ThemedText style={[styles.auditText, { color: colors.textSecondary }]}>
                {entry.action} by {entry.by} — {entry.date}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Expand indicator */}
      <View style={styles.expandRow}>
        <IconSymbol
          name={expanded ? 'chevron.up' : 'chevron.down'}
          size={10}
          color={colors.textTertiary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    gap: 6,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  typeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitterAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitterInitials: {
    fontSize: 8,
    fontWeight: '700',
  },
  submitter: {
    fontSize: 12,
    flex: 1,
  },
  dueDate: {
    fontSize: 11,
    fontWeight: '500',
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  flagLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  flagChip: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: BorderRadius.sm,
  },
  flagText: {
    fontSize: 9,
    fontWeight: '600',
  },
  auditTrail: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 6,
    marginTop: 2,
    gap: 4,
  },
  auditTitle: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  auditEntry: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  auditDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 5,
  },
  auditText: {
    fontSize: 11,
    lineHeight: 15,
    flex: 1,
  },
  expandRow: {
    alignItems: 'center',
    marginTop: 2,
  },
});
