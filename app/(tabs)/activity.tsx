/**
 * Activity Screen
 * Universal attention surface - chronological change log.
 * Per spec: Activity answers "What changed?" - awareness only, no work performed.
 */

import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMode, useOperatingRole } from '@/context/app-context';
import {
  getFilteredActivity,
  groupActivityByTime,
  getTimeGroupLabel,
  formatActivityTime,
  getActivityIcon,
  type TimeGroup,
} from '@/data/mock-activity';
import type { ActivityItem } from '@/types';

interface ActivityRowProps {
  item: ActivityItem;
  onPress: () => void;
  colors: typeof Colors.light;
}

function ActivityRow({ item, onPress, colors }: ActivityRowProps) {
  const iconName = getActivityIcon(item.type);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.activityRow,
        {
          backgroundColor: pressed ? colors.backgroundTertiary : colors.card,
        },
      ]}
      onPress={onPress}
    >
      <View style={[styles.iconContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <IconSymbol name={iconName as any} size={18} color={Brand.nexus} />
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <ThemedText style={styles.activityTitle}>{item.title}</ThemedText>
          <ThemedText style={[styles.activityTime, { color: colors.textTertiary }]}>
            {formatActivityTime(item.timestamp)}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.activityDescription, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {item.description}
        </ThemedText>
      </View>
      <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
    </Pressable>
  );
}

interface SectionHeaderProps {
  title: string;
  colors: typeof Colors.light;
}

function SectionHeader({ title, colors }: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
        {title}
      </ThemedText>
    </View>
  );
}

export default function ActivityScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const mode = useMode();
  const role = useOperatingRole();

  const activity = useMemo(() => {
    return getFilteredActivity(mode, role);
  }, [mode, role]);

  const sections = useMemo(() => {
    if (activity.length === 0) return [];

    const grouped = groupActivityByTime(activity);
    const sectionData: { title: string; key: TimeGroup; data: ActivityItem[] }[] = [];

    const order: TimeGroup[] = ['today', 'this_week', 'earlier'];
    for (const group of order) {
      const items = grouped.get(group) || [];
      if (items.length > 0) {
        sectionData.push({
          title: getTimeGroupLabel(group),
          key: group,
          data: items,
        });
      }
    }

    return sectionData;
  }, [activity]);

  const handleActivityPress = (item: ActivityItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // For now, just log the route - navigation will work when routes exist
    console.log('Navigate to:', item.route);
    // router.push(item.route as any);
  };

  const renderItem = ({ item }: { item: ActivityItem }) => (
    <ActivityRow item={item} onPress={() => handleActivityPress(item)} colors={colors} />
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; key: TimeGroup };
  }) => <SectionHeader title={section.title} colors={colors} />;

  const hasActivity = sections.length > 0;

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Activity
        </ThemedText>
      </View>

      {/* Content */}
      {hasActivity ? (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          stickySectionHeadersEnabled
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => (
            <View style={[styles.separator, { backgroundColor: colors.divider }]} />
          )}
          SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <IconSymbol
            name="bell"
            size={48}
            color={colors.textTertiary}
            style={styles.emptyIcon}
          />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nothing new.
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: colors.textTertiary }]}>
            Activity from your organization will appear here.
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  activityContent: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  activityTime: {
    fontSize: 12,
  },
  activityDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 36 + Spacing.sm,
  },
  sectionSeparator: {
    height: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  emptyIcon: {
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  emptyText: {
    fontSize: 17,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});
