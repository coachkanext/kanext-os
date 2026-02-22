/**
 * Entities Hub v2
 * Entity directory with search/filter + 10-tab detail hub per entity.
 * Tabs: Overview | Projects | Tasks | Opportunities | People | Documents | Rooms | Reports | Audit | Settings
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  ENTITIES,
  ENTITY_PROJECTS,
  ENTITY_TASKS,
  ENTITY_OPPORTUNITIES,
  ENTITY_CONTACTS,
  getProjectsForEntity,
  getTasksForEntity,
  getOpportunitiesForEntity,
  getContactsForEntity,
  getEntitiesByType,
  type Entity,
  type EntityProject,
  type EntityTask,
  type EntityOpportunity,
  type EntityContact,
} from '@/data/mock-entities';

// =============================================================================
// CONSTANTS
// =============================================================================

type DetailTab =
  | 'overview'
  | 'projects'
  | 'tasks'
  | 'opportunities'
  | 'people'
  | 'documents'
  | 'rooms'
  | 'reports'
  | 'audit'
  | 'settings';

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'projects', label: 'Projects' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'people', label: 'People' },
  { id: 'documents', label: 'Documents' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'reports', label: 'Reports' },
  { id: 'audit', label: 'Audit' },
  { id: 'settings', label: 'Settings' },
];

type FilterType = 'all' | 'company' | 'department' | 'team' | 'project';

const FILTER_OPTIONS: { id: FilterType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'company', label: 'Companies' },
  { id: 'department', label: 'Departments' },
  { id: 'team', label: 'Teams' },
  { id: 'project', label: 'Projects' },
];

const STAGE_COLORS: Record<EntityOpportunity['stage'], string> = {
  prospect: '#A1A1AA',
  qualified: '#1D9BF0',
  proposal: '#F59E0B',
  negotiation: '#1D9BF0',
  'closed-won': '#22C55E',
  'closed-lost': '#EF4444',
};

// =============================================================================
// HELPER: STATUS BADGE
// =============================================================================

function StatusBadge({ status, colors }: { status: string; colors: typeof Colors.light }) {
  const statusColor =
    status === 'active' || status === 'completed' || status === 'closed-won'
      ? '#22C55E'
      : status === 'planning' || status === 'in-progress' || status === 'on-hold'
        ? '#F59E0B'
        : status === 'archived' || status === 'closed-lost'
          ? '#EF4444'
          : colors.textTertiary;

  return (
    <View style={[s.badge, { backgroundColor: statusColor + '18' }]}>
      <ThemedText style={[s.badgeText, { color: statusColor }]}>
        {status.toUpperCase().replace('-', ' ')}
      </ThemedText>
    </View>
  );
}

function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const color = priority === 'high' ? '#EF4444' : priority === 'medium' ? '#F59E0B' : '#A1A1AA';
  return (
    <View style={[s.badge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{priority.toUpperCase()}</ThemedText>
    </View>
  );
}

function TypeBadge({ type, colors }: { type: Entity['type']; colors: typeof Colors.light }) {
  const color =
    type === 'company'
      ? '#FFFFFF'
      : type === 'department'
        ? '#1D9BF0'
        : type === 'team'
          ? '#22C55E'
          : '#F59E0B';
  return (
    <View style={[s.badge, { backgroundColor: color + '18' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{type.toUpperCase()}</ThemedText>
    </View>
  );
}

// =============================================================================
// DIRECTORY VIEW
// =============================================================================

function EntityCard({
  entity,
  colors,
  onPress,
}: {
  entity: Entity;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[s.entityCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
    >
      <View style={[s.entityAccentStrip, { backgroundColor: entity.color }]} />
      <View style={s.entityCardContent}>
        <View style={s.entityCardTop}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.entityName, { color: colors.text }]}>{entity.name}</ThemedText>
            <ThemedText style={[s.entityLead, { color: colors.textSecondary }]}>
              {entity.lead}
            </ThemedText>
          </View>
          <TypeBadge type={entity.type} colors={colors} />
        </View>
        <View style={s.entityCardBottom}>
          <ThemedText style={[s.entityMeta, { color: colors.textTertiary }]}>
            {entity.headCount} people
          </ThemedText>
          {entity.revenue != null && (
            <ThemedText style={[s.entityRevenue, { color: '#22C55E' }]}>
              ${entity.revenue.toLocaleString()}
            </ThemedText>
          )}
          <StatusBadge status={entity.status} colors={colors} />
        </View>
      </View>
    </Pressable>
  );
}

function DirectoryView({
  colors,
  onSelectEntity,
}: {
  colors: typeof Colors.light;
  onSelectEntity: (entity: Entity) => void;
}) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredEntities = useMemo(() => {
    let result = ENTITIES;
    if (filter !== 'all') {
      result = result.filter((e) => e.type === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.lead.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [filter, search]);

  return (
    <View style={s.flex1}>
      {/* Search */}
      <View style={s.searchContainer}>
        <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search entities..."
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterPillRow}
      >
        {FILTER_OPTIONS.map((opt) => {
          const isActive = opt.id === filter;
          return (
            <Pressable
              key={opt.id}
              style={[
                s.pill,
                {
                  backgroundColor: isActive ? '#fff' : colors.backgroundTertiary,
                  borderColor: isActive ? '#fff' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(opt.id);
              }}
            >
              <ThemedText
                style={[s.pillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Entity List */}
      <FlatList
        data={filteredEntities}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.directoryScroll}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <EntityCard
            entity={item}
            colors={colors}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectEntity(item);
            }}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <IconSymbol name="building.2" size={32} color={colors.textTertiary} />
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
              No entities match your search
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({ entity, colors }: { entity: Entity; colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Description */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.rowBetween}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]}>About</ThemedText>
          <TypeBadge type={entity.type} colors={colors} />
        </View>
        <ThemedText style={[s.bodyText, { color: colors.textSecondary }]}>
          {entity.description}
        </ThemedText>
      </View>

      {/* Lead Card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>Lead</ThemedText>
        <View style={s.leaderRow}>
          <View style={[s.avatar, { backgroundColor: entity.color + '20' }]}>
            <ThemedText style={[s.avatarText, { color: entity.color }]}>
              {entity.leadInitials}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.leaderName, { color: colors.text }]}>{entity.lead}</ThemedText>
            <ThemedText style={[s.leaderRole, { color: colors.textSecondary }]}>
              {entity.type === 'company' ? 'Founder & CEO' : `${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)} Lead`}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Key Info */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textTertiary }]}>Status</ThemedText>
          <StatusBadge status={entity.status} colors={colors} />
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textTertiary }]}>Head Count</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>
            {entity.headCount} people
          </ThemedText>
        </View>
        {entity.revenue != null && (
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textTertiary }]}>Revenue</ThemedText>
            <ThemedText style={[s.detailValue, { color: '#22C55E' }]}>
              ${entity.revenue.toLocaleString()}
            </ThemedText>
          </View>
        )}
        {entity.founded && (
          <View style={s.detailRow}>
            <ThemedText style={[s.detailLabel, { color: colors.textTertiary }]}>Founded</ThemedText>
            <ThemedText style={[s.detailValue, { color: colors.text }]}>{entity.founded}</ThemedText>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// PROJECTS TAB
// =============================================================================

function ProjectsTab({ entity, colors }: { entity: Entity; colors: typeof Colors.light }) {
  const projects = getProjectsForEntity(entity.id);

  if (projects.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="rectangle.stack" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No projects yet
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={projects}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const statusColor =
          item.status === 'active'
            ? '#22C55E'
            : item.status === 'completed'
              ? '#1D9BF0'
              : item.status === 'on-hold'
                ? '#F59E0B'
                : '#A1A1AA';

        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.rowBetween}>
              <ThemedText style={[s.itemTitle, { color: colors.text }]}>{item.name}</ThemedText>
              <StatusBadge status={item.status} colors={colors} />
            </View>
            <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
              {item.lead} · Due: {item.deadline}
            </ThemedText>
            {/* Progress Bar */}
            <View style={s.progressRow}>
              <View style={[s.progressBarBg, { backgroundColor: colors.backgroundTertiary }]}>
                <View
                  style={[
                    s.progressBarFill,
                    { backgroundColor: statusColor, width: `${item.progress}%` },
                  ]}
                />
              </View>
              <ThemedText style={[s.progressText, { color: colors.textSecondary }]}>
                {item.progress}%
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// TASKS TAB
// =============================================================================

function TasksTab({ entity, colors }: { entity: Entity; colors: typeof Colors.light }) {
  const tasks = getTasksForEntity(entity.id);

  if (tasks.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="checkmark.circle.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No tasks assigned
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={tasks}
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
// OPPORTUNITIES TAB
// =============================================================================

function OpportunitiesTab({ entity, colors }: { entity: Entity; colors: typeof Colors.light }) {
  const opportunities = getOpportunitiesForEntity(entity.id);

  if (opportunities.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="dollarsign.circle.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No opportunities tracked
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={opportunities}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stageColor = STAGE_COLORS[item.stage];
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.rowBetween}>
              <ThemedText style={[s.itemTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <ThemedText style={[s.oppValue, { color: '#22C55E' }]}>
                ${item.value.toLocaleString()}
              </ThemedText>
            </View>
            <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
              {item.contact} · Close: {item.closeDate}
            </ThemedText>
            <View style={[s.stageBadge, { backgroundColor: stageColor + '18' }]}>
              <ThemedText style={[s.badgeText, { color: stageColor }]}>
                {item.stage.toUpperCase().replace('-', ' ')}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// PEOPLE TAB
// =============================================================================

function PeopleTab({ entity, colors }: { entity: Entity; colors: typeof Colors.light }) {
  const contacts = getContactsForEntity(entity.id);

  if (contacts.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="person.3.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No contacts added
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={contacts}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.contactRow}>
            <View style={[s.avatar, { backgroundColor: entity.color + '20' }]}>
              <ThemedText style={[s.avatarText, { color: entity.color }]}>
                {item.initials}
              </ThemedText>
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.leaderName, { color: colors.text }]}>{item.name}</ThemedText>
              <ThemedText style={[s.leaderRole, { color: colors.textSecondary }]}>
                {item.role}
              </ThemedText>
              <ThemedText style={[s.contactEmail, { color: colors.textTertiary }]}>
                {item.email}
              </ThemedText>
            </View>
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
  icon,
  description,
  colors,
}: {
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
  entity,
  colors,
  onBack,
}: {
  entity: Entity;
  colors: typeof Colors.light;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab entity={entity} colors={colors} />;
      case 'projects':
        return <ProjectsTab entity={entity} colors={colors} />;
      case 'tasks':
        return <TasksTab entity={entity} colors={colors} />;
      case 'opportunities':
        return <OpportunitiesTab entity={entity} colors={colors} />;
      case 'people':
        return <PeopleTab entity={entity} colors={colors} />;
      case 'documents':
        return (
          <PlaceholderTab
            icon="doc.fill"
            description="Entity documents, contracts, and file storage."
            colors={colors}
          />
        );
      case 'rooms':
        return (
          <PlaceholderTab
            icon="bubble.left.and.bubble.right.fill"
            description="Team discussion rooms and channels."
            colors={colors}
          />
        );
      case 'reports':
        return (
          <PlaceholderTab
            icon="chart.bar.fill"
            description="Performance reports, analytics, and dashboards."
            colors={colors}
          />
        );
      case 'audit':
        return (
          <PlaceholderTab
            icon="list.clipboard"
            description="Entity activity audit trail and compliance log."
            colors={colors}
          />
        );
      case 'settings':
        return (
          <PlaceholderTab
            icon="gear"
            description="Entity configuration, roles, and permissions."
            colors={colors}
          />
        );
      default:
        return null;
    }
  }, [activeTab, entity, colors]);

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
        <View style={[s.headerAccent, { backgroundColor: entity.color }]} />
        <ThemedText style={[s.detailTitle, { color: colors.text }]} numberOfLines={1}>
          {entity.name}
        </ThemedText>
      </View>

      {/* Pill Nav */}
      <ScrollView
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

export function EntitiesHub() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  if (selectedEntity) {
    return (
      <DetailHub
        entity={selectedEntity}
        colors={colors}
        onBack={() => setSelectedEntity(null)}
      />
    );
  }

  return (
    <DirectoryView
      colors={colors}
      onSelectEntity={(entity) => setSelectedEntity(entity)}
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

  // Search
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 40,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    height: '100%',
  },

  // Filter Pills
  filterPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },

  // Directory
  directoryScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // Entity Card
  entityCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  entityAccentStrip: {
    width: 4,
  },
  entityCardContent: {
    flex: 1,
    padding: Spacing.md,
  },
  entityCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  entityName: {
    fontSize: 16,
    fontWeight: '700',
  },
  entityLead: {
    fontSize: 13,
    marginTop: 2,
  },
  entityCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  entityMeta: {
    fontSize: 12,
  },
  entityRevenue: {
    fontSize: 13,
    fontWeight: '700',
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

  // Leader / Avatar
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

  // Detail Rows (Overview)
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // List Items
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
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

  // Stage Badge (Opportunities)
  stageBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    marginTop: 8,
  },
  oppValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // Progress Bar (Projects)
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    borderRadius: 3,
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },

  // Contacts
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  contactEmail: {
    fontSize: 12,
    marginTop: 2,
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
