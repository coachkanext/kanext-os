/**
 * Ministries Hub v2
 * Ministry directory grid + 10-tab detail hub per ministry.
 * Tabs: Overview | Events | Teachings | Resources | Actions | People | Room | Packs | Audit | Settings
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  MINISTRIES_V2,
  MINISTRY_EVENTS,
  MINISTRY_TEACHINGS,
  MINISTRY_RESOURCES,
  MINISTRY_ACTIONS,
  getEventsForMinistry,
  getTeachingsForMinistry,
  getResourcesForMinistry,
  getActionsForMinistry,
  type MinistryV2,
  type MinistryV2Event,
  type MinistryTeaching,
  type MinistryResource,
  type MinistryAction,
} from '@/data/mock-ministries';

// =============================================================================
// DETAIL TABS
// =============================================================================

type DetailTab =
  | 'overview'
  | 'events'
  | 'teachings'
  | 'resources'
  | 'actions'
  | 'people'
  | 'room'
  | 'packs'
  | 'audit'
  | 'settings';

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'events', label: 'Events' },
  { id: 'teachings', label: 'Teachings' },
  { id: 'resources', label: 'Resources' },
  { id: 'actions', label: 'Actions' },
  { id: 'people', label: 'People' },
  { id: 'room', label: 'Room' },
  { id: 'packs', label: 'Packs' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

// =============================================================================
// HELPER: STATUS BADGE
// =============================================================================

function StatusBadge({ status, colors }: { status: string; colors: typeof Colors.light }) {
  const statusColor =
    status === 'active' || status === 'completed'
      ? '#22C55E'
      : status === 'planning' || status === 'in-progress'
        ? '#F59E0B'
        : status === 'seasonal'
          ? '#6AA9FF'
          : colors.textTertiary;

  return (
    <View style={[s.badge, { backgroundColor: statusColor + '18' }]}>
      <ThemedText style={[s.badgeText, { color: statusColor }]}>
        {status.toUpperCase()}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// HELPER: PRIORITY BADGE
// =============================================================================

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const color = priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#8F8F8F';
  return (
    <View style={[s.badge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{priority.toUpperCase()}</ThemedText>
    </View>
  );
}

// =============================================================================
// HELPER: EVENT TYPE BADGE
// =============================================================================

function EventTypeBadge({ type }: { type: 'regular' | 'special' | 'outreach' }) {
  const color = type === 'regular' ? '#8F8F8F' : type === 'special' ? '#7A5CFF' : '#14B8A6';
  return (
    <View style={[s.badge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{type.toUpperCase()}</ThemedText>
    </View>
  );
}

// =============================================================================
// DIRECTORY VIEW
// =============================================================================

function MinistryCard({
  ministry,
  colors,
  onPress,
}: {
  ministry: MinistryV2;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[s.gridCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[s.colorAccent, { backgroundColor: ministry.color }]} />
      <View style={s.gridCardContent}>
        <ThemedText style={[s.gridName, { color: colors.text }]} numberOfLines={1}>
          {ministry.name}
        </ThemedText>
        <ThemedText style={[s.gridLeader, { color: colors.textSecondary }]} numberOfLines={1}>
          {ministry.leader}
        </ThemedText>
        <ThemedText style={[s.gridMeta, { color: colors.textTertiary }]}>
          {ministry.memberCount} members
        </ThemedText>
        {ministry.meetingDay && (
          <ThemedText style={[s.gridMeta, { color: colors.textTertiary }]} numberOfLines={1}>
            {ministry.meetingDay} {ministry.meetingTime ? `at ${ministry.meetingTime}` : ''}
          </ThemedText>
        )}
        <View style={{ marginTop: 6 }}>
          <StatusBadge status={ministry.status} colors={colors} />
        </View>
      </View>
    </Pressable>
  );
}

function DirectoryView({
  colors,
  onSelectMinistry,
}: {
  colors: typeof Colors.light;
  onSelectMinistry: (ministry: MinistryV2) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.directoryScroll}>
      <View style={s.grid}>
        {MINISTRIES_V2.map((ministry) => (
          <MinistryCard
            key={ministry.id}
            ministry={ministry}
            colors={colors}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectMinistry(ministry);
            }}
          />
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ ministry, colors }: { ministry: MinistryV2; colors: typeof Colors.light }) {
  const events = getEventsForMinistry(ministry.id);
  const actions = getActionsForMinistry(ministry.id);
  const pendingActions = actions.filter((a) => a.status !== 'completed');

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Description */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>About</ThemedText>
        <ThemedText style={[s.bodyText, { color: colors.textSecondary }]}>
          {ministry.description}
        </ThemedText>
      </View>

      {/* Leader Card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>Leader</ThemedText>
        <View style={s.leaderRow}>
          <View style={[s.avatar, { backgroundColor: ministry.color + '20' }]}>
            <ThemedText style={[s.avatarText, { color: ministry.color }]}>
              {ministry.leaderInitials}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.leaderName, { color: colors.text }]}>
              {ministry.leader}
            </ThemedText>
            <ThemedText style={[s.leaderRole, { color: colors.textSecondary }]}>
              Ministry Leader
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>Quick Stats</ThemedText>
        <View style={s.statsGrid}>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {ministry.memberCount}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Members</ThemedText>
          </View>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>{events.length}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>
              Upcoming Events
            </ThemedText>
          </View>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {pendingActions.length}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>
              Pending Actions
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Meeting Schedule */}
      {ministry.meetingDay && (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]}>Meeting Schedule</ThemedText>
          <View style={s.scheduleRow}>
            <IconSymbol name="calendar" size={16} color={colors.textSecondary} />
            <ThemedText style={[s.scheduleText, { color: colors.textSecondary }]}>
              {ministry.meetingDay}
              {ministry.meetingTime ? ` at ${ministry.meetingTime}` : ''}
            </ThemedText>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// =============================================================================
// EVENTS TAB
// =============================================================================

function EventsTab({ ministry, colors }: { ministry: MinistryV2; colors: typeof Colors.light }) {
  const events = getEventsForMinistry(ministry.id);

  if (events.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="calendar" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No upcoming events
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={events}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.rowBetween}>
            <ThemedText style={[s.itemTitle, { color: colors.text }]}>{item.title}</ThemedText>
            <EventTypeBadge type={item.type} />
          </View>
          <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
            {item.date} at {item.time}
          </ThemedText>
          <View style={s.locationRow}>
            <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.itemMeta, { color: colors.textTertiary }]}>
              {item.location}
            </ThemedText>
          </View>
        </View>
      )}
    />
  );
}

// =============================================================================
// TEACHINGS TAB
// =============================================================================

function TeachingsTab({ ministry, colors }: { ministry: MinistryV2; colors: typeof Colors.light }) {
  const teachings = getTeachingsForMinistry(ministry.id);

  if (teachings.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="book.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No teachings available
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={teachings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.itemTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
            {item.speaker} · {item.date} · {item.duration}
          </ThemedText>
          {item.series && (
            <View style={[s.seriesTag, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.seriesTagText, { color: colors.textSecondary }]}>
                {item.series}
              </ThemedText>
            </View>
          )}
        </View>
      )}
    />
  );
}

// =============================================================================
// RESOURCES TAB
// =============================================================================

function ResourcesTab({ ministry, colors }: { ministry: MinistryV2; colors: typeof Colors.light }) {
  const resources = getResourcesForMinistry(ministry.id);

  const resourceIcon = (type: MinistryResource['type']): string => {
    switch (type) {
      case 'document':
        return 'doc.fill';
      case 'video':
        return 'play.rectangle.fill';
      case 'audio':
        return 'headphones';
      case 'link':
        return 'link';
      default:
        return 'doc.fill';
    }
  };

  if (resources.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="folder.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No resources available
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={resources}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.resourceRow}>
            <View style={[s.resourceIcon, { backgroundColor: colors.backgroundTertiary }]}>
              <IconSymbol name={resourceIcon(item.type) as any} size={16} color={colors.text} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.itemTitle, { color: colors.text }]}>{item.title}</ThemedText>
              <ThemedText style={[s.itemMeta, { color: colors.textTertiary }]}>{item.date}</ThemedText>
            </View>
          </View>
        </View>
      )}
    />
  );
}

// =============================================================================
// ACTIONS TAB
// =============================================================================

function ActionsTab({ ministry, colors }: { ministry: MinistryV2; colors: typeof Colors.light }) {
  const actions = getActionsForMinistry(ministry.id);

  if (actions.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="checkmark.circle.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No action items
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={actions}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.itemTitle, { color: colors.text }]}>{item.title}</ThemedText>
          <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
            {item.assignee} · Due: {item.dueDate}
          </ThemedText>
          <View style={s.badgeRow}>
            <PriorityBadge priority={item.priority} />
            <StatusBadge status={item.status} colors={colors} />
          </View>
        </View>
      )}
    />
  );
}

// =============================================================================
// PLACEHOLDER TABS
// =============================================================================

function PlaceholderTab({
  title,
  icon,
  description,
  colors,
}: {
  title: string;
  icon: string;
  description: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.placeholderContainer}>
      <View style={[s.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name={icon as any} size={36} color={colors.textTertiary} />
        <ThemedText style={[s.placeholderTitle, { color: colors.text }]}>Coming Soon</ThemedText>
        <ThemedText style={[s.placeholderDesc, { color: colors.textSecondary }]}>
          {description}
        </ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// DETAIL HUB
// =============================================================================

function DetailHub({
  ministry,
  colors,
  onBack,
}: {
  ministry: MinistryV2;
  colors: typeof Colors.light;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const pillScrollRef = useRef<ScrollView>(null);

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab ministry={ministry} colors={colors} />;
      case 'events':
        return <EventsTab ministry={ministry} colors={colors} />;
      case 'teachings':
        return <TeachingsTab ministry={ministry} colors={colors} />;
      case 'resources':
        return <ResourcesTab ministry={ministry} colors={colors} />;
      case 'actions':
        return <ActionsTab ministry={ministry} colors={colors} />;
      case 'people':
        return (
          <PlaceholderTab
            title="People"
            icon="person.3.fill"
            description="View and manage ministry team members and volunteers."
            colors={colors}
          />
        );
      case 'room':
        return (
          <PlaceholderTab
            title="Room"
            icon="bubble.left.and.bubble.right.fill"
            description="Ministry discussion room for team communication."
            colors={colors}
          />
        );
      case 'packs':
        return (
          <PlaceholderTab
            title="Packs"
            icon="rectangle.stack.fill"
            description="Downloadable resource packs and materials."
            colors={colors}
          />
        );
      case 'audit':
        return (
          <PlaceholderTab
            title="Audit"
            icon="list.clipboard"
            description="Ministry activity audit trail and compliance log."
            colors={colors}
          />
        );
      case 'settings':
        return (
          <PlaceholderTab
            title="Settings"
            icon="gear"
            description="Ministry configuration, roles, and permissions."
            colors={colors}
          />
        );
      default:
        return null;
    }
  }, [activeTab, ministry, colors]);

  return (
    <View style={s.flex1}>
      {/* Header */}
      <View style={s.detailHeader}>
        <Pressable
          style={s.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
        >
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
        </Pressable>
        <View style={[s.headerAccent, { backgroundColor: ministry.color }]} />
        <ThemedText style={[s.detailTitle, { color: colors.text }]} numberOfLines={1}>
          {ministry.name}
        </ThemedText>
      </View>

      {/* Pill Nav */}
      <ScrollView
        ref={pillScrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pillRow}
      >
        {DETAIL_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <ThemedText
                style={[s.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tab Content */}
      <View style={s.flex1}>{renderTab()}</View>
    </View>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function MinistriesHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedMinistry, setSelectedMinistry] = useState<MinistryV2 | null>(null);

  if (selectedMinistry) {
    return (
      <DetailHub
        ministry={selectedMinistry}
        colors={colors}
        onBack={() => setSelectedMinistry(null)}
      />
    );
  }

  return (
    <DirectoryView
      colors={colors}
      onSelectMinistry={(ministry) => setSelectedMinistry(ministry)}
    />
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  // Directory
  directoryScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  gridCard: {
    width: '48.5%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  colorAccent: {
    height: 4,
    width: '100%',
  },
  gridCardContent: {
    padding: Spacing.sm,
  },
  gridName: {
    fontSize: 14,
    fontWeight: '700',
  },
  gridLeader: {
    fontSize: 12,
    marginTop: 2,
  },
  gridMeta: {
    fontSize: 11,
    marginTop: 2,
  },

  // Detail Header
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAccent: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },

  // Pill Nav
  pillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Cards
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Tab Scroll
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Leader
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  leaderRole: {
    fontSize: 12,
    marginTop: 1,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statCell: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 2,
    textAlign: 'center',
  },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  scheduleText: {
    fontSize: 14,
  },

  // List Items
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },

  // Badges
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Series Tag
  seriesTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 8,
  },
  seriesTagText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Resources
  resourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  resourceIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },

  // Placeholder
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  placeholderCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.sm,
  },
  placeholderDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: Spacing.xs,
    lineHeight: 18,
  },
});
