/**
 * Alert Detail — bottom sheet showing full alert detail with actions.
 */

import React from 'react';
import { View, StyleSheet, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Spacing, BorderRadius } from '@/constants/theme';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getSeverityColor, getSourceTagColor, formatMessageTime } from '@/data/mock-messages';
import type { AlertItem } from '@/data/mock-messages';

interface AlertDetailProps {
  alert: AlertItem;
  onResolve: () => void;
  onAssign: () => void;
  onSnooze: () => void;
  onEscalate: () => void;
}

export function AlertDetail({ alert, onResolve, onAssign, onSnooze, onEscalate }: AlertDetailProps) {
  const severityColor = getSeverityColor(alert.severity);
  const sourceColor = getSourceTagColor(alert.sourceTag);

  const handleAction = (action: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    action();
  };

  const handleDeepLink = (label: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Navigate', `Opening: ${label}`);
  };

  return (
    <View style={styles.container}>
      {/* Severity + Title */}
      <View style={styles.headerRow}>
        <View style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}>
          <ThemedText style={[styles.severityText, { color: severityColor }]}>
            {alert.severity.toUpperCase()}
          </ThemedText>
        </View>
        {alert.escalated && (
          <View style={styles.escalatedBadge}>
            <ThemedText style={styles.escalatedText}>Escalated</ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.title}>{alert.title}</ThemedText>

      {alert.description && (
        <ThemedText style={styles.description}>{alert.description}</ThemedText>
      )}

      {/* Meta */}
      <View style={styles.metaRow}>
        <View style={[styles.sourceTag, { backgroundColor: sourceColor.bg }]}>
          <ThemedText style={[styles.sourceText, { color: sourceColor.text }]}>{alert.sourceTag}</ThemedText>
        </View>
        <ThemedText style={styles.timestamp}>{formatMessageTime(alert.timestamp)}</ThemedText>
      </View>

      {alert.assignedTo && (
        <View style={styles.assignedRow}>
          <ThemedText style={styles.assignedLabel}>Assigned to:</ThemedText>
          <ThemedText style={styles.assignedName}>{alert.assignedTo}</ThemedText>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, styles.resolveBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => handleAction(onResolve)}
        >
          <ThemedText style={styles.resolveBtnText}>
            {alert.resolved ? 'Resolved' : 'Resolve'}
          </ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => handleAction(onAssign)}
        >
          <ThemedText style={styles.actionBtnText}>Assign</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => handleAction(onSnooze)}
        >
          <ThemedText style={styles.actionBtnText}>Snooze 24h</ThemedText>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
          onPress={() => handleAction(onEscalate)}
        >
          <ThemedText style={styles.actionBtnText}>Escalate</ThemedText>
        </Pressable>
      </View>

      {/* History Timeline */}
      {alert.history && alert.history.length > 0 && (
        <View style={styles.historySection}>
          <ThemedText style={styles.historyTitle}>History</ThemedText>
          {alert.history.map((entry, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={styles.historyContent}>
                <ThemedText style={styles.historyAction}>{entry.action}</ThemedText>
                <ThemedText style={styles.historyTime}>{formatMessageTime(entry.timestamp)}</ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Deep Link Actions */}
      <View style={styles.deepLinkSection}>
        <ThemedText style={styles.deepLinkTitle}>Quick Actions</ThemedText>
        <View style={styles.deepLinkRow}>
          <Pressable
            style={({ pressed }) => [styles.deepLinkBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleDeepLink('View in Feed')}
          >
            <IconSymbol name="text.bubble.fill" size={14} color="#1D9BF0" />
            <ThemedText style={styles.deepLinkText}>View in Feed</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.deepLinkBtn, { opacity: pressed ? 0.7 : 1 }]}
            onPress={() => handleDeepLink('Open Chat')}
          >
            <IconSymbol name="bubble.left.fill" size={14} color="#1D9BF0" />
            <ThemedText style={styles.deepLinkText}>Open Chat</ThemedText>
          </Pressable>
          {(alert.sourceTag === 'Player Dev' || alert.sourceTag === 'Culture') && (
            <Pressable
              style={({ pressed }) => [styles.deepLinkBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleDeepLink('View Player')}
            >
              <IconSymbol name="person.fill" size={14} color="#1D9BF0" />
              <ThemedText style={styles.deepLinkText}>View Player</ThemedText>
            </Pressable>
          )}
          {alert.sourceTag === 'Recruiting' && (
            <Pressable
              style={({ pressed }) => [styles.deepLinkBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={() => handleDeepLink('View Recruit')}
            >
              <IconSymbol name="person.badge.plus" size={14} color="#1D9BF0" />
              <ThemedText style={styles.deepLinkText}>View Recruit</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.sm,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  severityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  escalatedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#F59E0B20',
  },
  escalatedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F59E0B',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#aaa',
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.sm,
  },
  sourceTag: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  sourceText: {
    fontSize: 12,
    color: '#A1A1AA',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#A1A1AA',
  },
  assignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.md,
  },
  assignedLabel: {
    fontSize: 13,
    color: '#A1A1AA',
  },
  assignedName: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: Spacing.lg,
    marginTop: Spacing.sm,
  },
  actionBtn: {
    backgroundColor: '#0B0F14',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  resolveBtn: {
    backgroundColor: '#FFFFFF',
  },
  resolveBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  historySection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#0B0F14',
    paddingTop: Spacing.md,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: Spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: Spacing.sm,
  },
  historyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#333',
    marginTop: 5,
  },
  historyContent: {
    flex: 1,
  },
  historyAction: {
    fontSize: 13,
    color: '#FFFFFF',
  },
  historyTime: {
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
  },
  deepLinkSection: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#0B0F14',
    paddingTop: Spacing.md,
    marginTop: Spacing.sm,
  },
  deepLinkTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#A1A1AA',
    marginBottom: Spacing.sm,
  },
  deepLinkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  deepLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0B0F14',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  deepLinkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#1D9BF0',
  },
});
