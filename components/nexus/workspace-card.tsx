/**
 * Workspace Card — compact card for the conversations panel.
 * Shows workspace title, type icon, thread count, and active blockers.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { NexusWorkspace, WorkspaceType } from '@/types/nexus-v2';

const WORKSPACE_ICONS: Record<WorkspaceType, IconSymbolName> = {
  season_hq: 'trophy.fill',
  program_hq: 'building.2.fill',
  org_hq: 'building.2.fill',
  game_week: 'calendar.badge.clock',
  race_week: 'flag.checkered',
  event_ops: 'calendar.badge.plus',
  sunday_service: 'music.note.list',
  recruiting_board: 'person.badge.plus',
  sponsor_delivery: 'star.fill',
  compliance_readiness: 'shield.checkered',
  fundraising: 'heart.fill',
  dataroom: 'lock.doc.fill',
  case: 'briefcase.fill',
  other: 'folder.fill',
};

interface WorkspaceCardProps {
  workspace: NexusWorkspace;
  isActive?: boolean;
  onPress: (workspace: NexusWorkspace) => void;
}

export function WorkspaceCard({ workspace, isActive, onPress }: WorkspaceCardProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const iconName = WORKSPACE_ICONS[workspace.workspace_type] || 'folder.fill';
  const threadCount = workspace.thread_ids.length;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: isActive ? colors.backgroundSecondary : 'transparent',
          opacity: pressed ? 0.7 : 1,
        },
      ]}
      onPress={() => onPress(workspace)}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundTertiary }]}>
        <IconSymbol name={iconName} size={16} color={accent} />
      </View>
      <View style={styles.content}>
        <ThemedText style={[styles.title, isActive && { fontWeight: '600' }]} numberOfLines={1}>
          {workspace.title}
        </ThemedText>
        <ThemedText style={[styles.meta, { color: colors.textTertiary }]} numberOfLines={1}>
          {threadCount} thread{threadCount !== 1 ? 's' : ''}
          {workspace.pinned_link_chips.length > 0 && ` · ${workspace.pinned_link_chips.length} pinned`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.xs,
    marginVertical: 1,
  },
  iconContainer: {
    width: 30,
    height: 30,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
  },
  meta: {
    fontSize: 12,
    marginTop: 1,
  },
});
