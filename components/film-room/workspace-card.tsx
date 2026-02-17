/**
 * WorkspaceCard — Film workspace card with color strip, status, participants.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getWorkspaceStatusColor,
  getWorkspaceStatusLabel,
  type Workspace,
} from '@/data/mock-sports-workspaces';

interface WorkspaceCardProps {
  workspace: Workspace;
}

export function WorkspaceCard({ workspace }: WorkspaceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const statusColor = getWorkspaceStatusColor(workspace.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.cardElevated : colors.card },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[styles.colorStrip, { backgroundColor: workspace.colorStrip }]} />
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {workspace.title}
          </ThemedText>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
            <ThemedText style={[styles.statusText, { color: statusColor }]}>
              {getWorkspaceStatusLabel(workspace.status)}
            </ThemedText>
          </View>
        </View>

        {/* Owner */}
        <ThemedText style={[styles.owner, { color: colors.textSecondary }]}>
          {workspace.owner}
        </ThemedText>

        {/* Participants */}
        <View style={styles.participantsRow}>
          {workspace.participants.map((p, i) => (
            <View
              key={i}
              style={[
                styles.participantAvatar,
                { backgroundColor: p.color, marginLeft: i === 0 ? 0 : -6 },
              ]}
            >
              <ThemedText style={styles.participantInitials}>{p.initials}</ThemedText>
            </View>
          ))}
          <ThemedText style={[styles.participantCount, { color: colors.textTertiary }]}>
            {workspace.participants.length}
          </ThemedText>
        </View>

        {/* Linked Objects */}
        <View style={styles.chipRow}>
          {workspace.linkedObjects.map((obj) => (
            <View key={obj} style={[styles.linkedChip, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[styles.linkedText, { color: colors.textSecondary }]}>{obj}</ThemedText>
            </View>
          ))}
        </View>

        {/* Meta */}
        <View style={styles.metaRow}>
          <ThemedText style={[styles.metaText, { color: colors.textTertiary }]}>
            {workspace.clipCount} clips
          </ThemedText>
          <View style={styles.metaDot} />
          <ThemedText style={[styles.metaText, { color: colors.textTertiary }]}>
            {workspace.lastActivity}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  colorStrip: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.sm + 4,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
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
  owner: {
    fontSize: 12,
  },
  participantsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  participantAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#000',
  },
  participantInitials: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
  },
  participantCount: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  linkedChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  linkedText: {
    fontSize: 10,
    fontWeight: '500',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#424242',
  },
});
