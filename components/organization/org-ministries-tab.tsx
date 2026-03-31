/**
 * Organization Ministries Tab v2 — Church Mode Ministry Directory & Hub
 *
 * Two-view component:
 * 1. Directory view — header, category chips, searchable/filterable ministry cards
 * 2. Ministry Hub — 12-tab detail view when a ministry is selected
 *
 * Plus Filter and Create Ministry bottom sheets.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme'
;
import {
  CATEGORY_CHIPS,
  MINISTRY_SCOPE_CHIPS,
  MINISTRY_HUB_TABS,
  MINISTRIES_FULL,
  MINISTRY_EVENTS_V3,
  MINISTRY_TEACHINGS_V3,
  MINISTRY_PACKS_V3,
  MINISTRY_ACTIONS_V3,
  MINISTRY_RESOURCES_V3,
  MINISTRY_AUDIT_V3,
  filterMinistries,
  sortMinistries,
  getEventsForMinistryV3,
  getTeachingsForMinistryV3,
  getPacksForMinistry,
  getActionsForMinistryV3,
  getResourcesForMinistryV3,
  getAuditForMinistry,
  STATUS_COLOR_MAP,
  CATEGORY_ICON_MAP,
  CATEGORY_COLOR_MAP,
  CREATE_DEFAULTS,
  type MinistryFull,
  type MinistryCategory,
  type MinistryStatus,
  type MinistryHubTabId,
  type MinistryEvent,
  type MinistryTeachingV3,
  type MinistryPack,
  type MinistryActionV3,
  type MinistryResourceV3,
  type MinistryAuditEntry,
  type MinistryVisibility,
  type MinistryJoinPolicy,
  type MinistryFilterState,
} from '@/data/mock-ministries-v3';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const SORT_OPTIONS: { key: MinistryFilterState['sort']; label: string }[] = [
  { key: 'az', label: 'Name A\u2013Z' },
  { key: 'next-event', label: 'Next event soonest' },
  { key: 'recent', label: 'Recently active' },
  { key: 'member-count', label: 'Member count' },
];

const STATUS_OPTIONS: MinistryStatus[] = ['active', 'seasonal', 'paused', 'archived'];

const VISIBILITY_OPTIONS: MinistryVisibility[] = ['private', 'discoverable', 'public-read'];

const JOIN_POLICY_OPTIONS: MinistryJoinPolicy[] = ['invite', 'request', 'open'];

const CATEGORY_OPTIONS = CATEGORY_CHIPS.filter((c) => c.key !== 'all');

/** Resource type icon mapping */
const RESOURCE_TYPE_ICON: Record<string, string> = {
  document: 'doc.fill',
  video: 'play.rectangle.fill',
  audio: 'headphones',
  link: 'link',
  template: 'doc.text.fill',
};

/** Event type badge color mapping */
const EVENT_TYPE_COLOR: Record<string, string> = {
  regular: '#9C9790',
  special: '#1A1714',
  outreach: '#1A1714',
  retreat: '#B8943E',
};

/** Teaching type badge color mapping */
const TEACHING_TYPE_COLOR: Record<string, string> = {
  sermon: '#1A1714',
  lesson: '#1A1714',
  devotional: '#5A8A6E',
  training: '#B8943E',
};

/** Pack status color mapping */
const PACK_STATUS_COLOR: Record<string, string> = {
  active: '#5A8A6E',
  upcoming: '#1A1714',
  completed: '#9C9790',
};

/** Action status icon mapping */
const ACTION_STATUS_ICON_COLOR: Record<string, string> = {
  pending: '#B8943E',
  'in-progress': '#1A1714',
  completed: '#5A8A6E',
};

/** Action type badge color */
const ACTION_TYPE_COLOR: Record<string, string> = {
  discipleship: '#1A1714',
  volunteer: '#1A1714',
  admin: '#9C9790',
};

/** Priority badge color */
const PRIORITY_COLOR: Record<string, string> = {
  high: '#B85C5C',
  medium: '#B8943E',
  low: '#9C9790',
};

/** Audit action icon mapping */
const AUDIT_ACTION_ICON: Record<string, string> = {
  created: 'plus.circle.fill',
  added: 'person.badge.plus',
  updated: 'arrow.triangle.2.circlepath',
  published: 'doc.badge.arrow.up',
  scheduled: 'calendar.badge.plus',
  joined: 'person.fill.checkmark',
  default: 'circle.fill',
};

const AUDIT_ACTION_COLOR: Record<string, string> = {
  created: '#5A8A6E',
  added: '#1A1714',
  updated: '#B8943E',
  published: '#1A1714',
  scheduled: '#1A1714',
  joined: '#1A1714',
  default: '#9C9790',
};

function getAuditActionKey(action: string): string {
  const lower = action.toLowerCase();
  if (lower.startsWith('created')) return 'created';
  if (lower.includes('added')) return 'added';
  if (lower.includes('updated') || lower.includes('changed')) return 'updated';
  if (lower.includes('published')) return 'published';
  if (lower.includes('scheduled')) return 'scheduled';
  if (lower.includes('joined')) return 'joined';
  return 'default';
}

// =============================================================================
// HELPER: INITIALS FROM NAME
// =============================================================================

function getInitials(name: string): string {
  const parts = name.split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// =============================================================================
// MINISTRY CARD (DIRECTORY)
// =============================================================================

function MinistryCard({
  ministry,
  colors,
  accentColor,
  onOpen,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
  accentColor: string;
  onOpen: () => void;
}) {
  const catColor = CATEGORY_COLOR_MAP[ministry.category];
  const catIcon = CATEGORY_ICON_MAP[ministry.category];
  const statusColor = STATUS_COLOR_MAP[ministry.status];

  return (
    <Pressable
      style={[s.ministryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onOpen();
      }}
    >
      {/* Top row: icon + name + status */}
      <View style={s.cardTopRow}>
        <View style={[s.catIconCircle, { backgroundColor: catColor + '26' }]}>
          <IconSymbol name={catIcon as any} size={18} color={catColor} />
        </View>
        <View style={s.cardMidCol}>
          <ThemedText style={[s.cardName, { color: colors.text }]} numberOfLines={1}>
            {ministry.name}
          </ThemedText>
        </View>
        <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
          <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
            {ministry.status.toUpperCase()}
          </ThemedText>
        </View>
      </View>

      {/* Category badge */}
      <View style={[s.categoryBadge, { backgroundColor: catColor + '2E' }]}>
        <ThemedText style={[s.categoryBadgeText, { color: catColor }]}>
          {CATEGORY_CHIPS.find((c) => c.key === ministry.category)?.label ?? ministry.category}
        </ThemedText>
      </View>

      {/* Leader avatars + names */}
      <View style={s.leadersRow}>
        <View style={s.avatarStack}>
          {ministry.leaders.slice(0, 3).map((leader, idx) => (
            <View
              key={leader.id}
              style={[
                s.leaderAvatar,
                {
                  backgroundColor: leader.avatarColor + '30',
                  marginLeft: idx > 0 ? -8 : 0,
                  zIndex: 3 - idx,
                },
              ]}
            >
              <ThemedText style={[s.leaderAvatarText, { color: leader.avatarColor }]}>
                {leader.initials}
              </ThemedText>
            </View>
          ))}
        </View>
        <ThemedText style={[s.leadersText, { color: colors.textSecondary }]} numberOfLines={1}>
          Led by {ministry.leaders.map((l) => l.name.split(' ').slice(-1)[0]).join(', ')}
        </ThemedText>
      </View>

      {/* Next event */}
      {ministry.nextEvent ? (
        <View style={s.nextEventRow}>
          <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
          <ThemedText style={[s.nextEventText, { color: colors.textSecondary }]} numberOfLines={1}>
            {ministry.nextEvent.date} {ministry.nextEvent.time} · {ministry.nextEvent.location}
          </ThemedText>
        </View>
      ) : null}

      {/* Member count */}
      <View style={s.memberRow}>
        <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
        <ThemedText style={[s.memberText, { color: colors.textTertiary }]}>
          {ministry.memberCount} members
        </ThemedText>
      </View>

      {/* Quick actions */}
      <View style={[s.quickActions, { borderTopColor: colors.border }]}>
        <Pressable
          style={[s.quickActionBtn, { backgroundColor: accentColor + '18' }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onOpen();
          }}
        >
          <IconSymbol name="arrow.up.right" size={12} color={accentColor} />
          <ThemedText style={[s.quickActionText, { color: accentColor }]}>Open</ThemedText>
        </Pressable>
        {ministry.hasRoom ? (
          <Pressable
            style={[s.quickActionBtn, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="bubble.left.fill" size={12} color={colors.textSecondary} />
            <ThemedText style={[s.quickActionText, { color: colors.textSecondary }]}>Room</ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          style={[s.quickActionBtn, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
          <ThemedText style={[s.quickActionText, { color: colors.textSecondary }]}>Events</ThemedText>
        </Pressable>
      </View>
    </Pressable>
  );
}

// =============================================================================
// MINISTRY HUB — OVERVIEW TAB
// =============================================================================

function OverviewTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const events = getEventsForMinistryV3(ministry.id);
  const teachings = getTeachingsForMinistryV3(ministry.id);
  const packs = getPacksForMinistry(ministry.id);
  const catColor = CATEGORY_COLOR_MAP[ministry.category];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Description */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>About</ThemedText>
        <ThemedText style={[s.bodyText, { color: colors.textSecondary }]}>
          {ministry.description}
        </ThemedText>
      </View>

      {/* Meeting pattern + next event */}
      {(ministry.meetingPattern || ministry.nextEvent) ? (
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Schedule</ThemedText>
          {ministry.meetingPattern ? (
            <View style={s.infoRow}>
              <IconSymbol name="calendar.badge.clock" size={14} color={colors.textSecondary} />
              <ThemedText style={[s.infoText, { color: colors.textSecondary }]}>
                {ministry.meetingPattern}
              </ThemedText>
            </View>
          ) : null}
          {ministry.nextEvent ? (
            <View style={[s.infoRow, { marginTop: 6 }]}>
              <IconSymbol name="calendar" size={14} color={catColor} />
              <ThemedText style={[s.infoText, { color: colors.text }]}>
                {ministry.nextEvent.title} \u2014 {ministry.nextEvent.date}, {ministry.nextEvent.time}
              </ThemedText>
            </View>
          ) : null}
        </View>
      ) : null}

      {/* Recent activity summary */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Recent Activity</ThemedText>
        <ThemedText style={[s.bodyText, { color: colors.textSecondary }]}>
          Last active: {new Date(ministry.lastActivityAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}
        </ThemedText>
      </View>

      {/* Quick stats */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Quick Stats</ThemedText>
        <View style={s.statsGrid}>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {ministry.memberCount}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Members</ThemedText>
          </View>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {events.length}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Events</ThemedText>
          </View>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {teachings.length}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Teachings</ThemedText>
          </View>
          <View style={[s.statCell, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.statValue, { color: colors.text }]}>
              {packs.length}
            </ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textSecondary }]}>Packs</ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MINISTRY HUB — ROOM TAB
// =============================================================================

function RoomTab({
  ministry,
  colors,
  accentColor,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (ministry.hasRoom) {
    return (
      <View style={s.centeredContainer}>
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, width: '100%' }]}>
          <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Ministry Room</ThemedText>
          <ThemedText style={[s.bodyText, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
            Private discussion space for {ministry.name} leaders and members.
          </ThemedText>
          <Pressable
            style={[s.accentButton, { backgroundColor: accentColor }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="bubble.left.fill" size={16} color="#000" />
            <ThemedText style={s.accentButtonText}>Open Room</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={s.centeredContainer}>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border, width: '100%' }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>No Room Created</ThemedText>
        <ThemedText style={[s.bodyText, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
          This ministry does not have a discussion room yet.
        </ThemedText>
        <Pressable
          style={[s.accentButton, { backgroundColor: accentColor }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="plus" size={16} color="#000" />
          <ThemedText style={s.accentButtonText}>Create Room</ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

// =============================================================================
// MINISTRY HUB — EVENTS TAB
// =============================================================================

function EventsTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const events = getEventsForMinistryV3(ministry.id);

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
      renderItem={({ item }) => {
        const typeColor = EVENT_TYPE_COLOR[item.type] ?? '#9C9790';
        const dateParts = item.date.split('-');
        const month = new Date(item.date + 'T00:00:00').toLocaleString('en-US', { month: 'short' });
        const day = dateParts[2];
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.eventRow}>
              <View style={[s.dateBox, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.dateMonth, { color: colors.textSecondary }]}>
                  {month.toUpperCase()}
                </ThemedText>
                <ThemedText style={[s.dateDay, { color: colors.text }]}>{day}</ThemedText>
              </View>
              <View style={s.eventInfo}>
                <ThemedText style={[s.itemTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
                  {item.time} · {item.location}
                </ThemedText>
                <View style={[s.typeBadge, { backgroundColor: typeColor + '2E', marginTop: 6 }]}>
                  <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                    {item.type.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// MINISTRY HUB — TEACHINGS TAB
// =============================================================================

function TeachingsTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const teachings = getTeachingsForMinistryV3(ministry.id);

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
      renderItem={({ item }) => {
        const typeColor = TEACHING_TYPE_COLOR[item.type] ?? '#9C9790';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.teachingRow}>
              <View style={[s.playIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="play.fill" size={14} color={colors.text} />
              </View>
              <View style={s.teachingInfo}>
                <ThemedText style={[s.itemTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
                  {item.speaker} · {item.duration}
                </ThemedText>
                <View style={s.badgeRow}>
                  {item.series ? (
                    <View style={[s.seriesBadge, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.seriesBadgeText, { color: colors.textSecondary }]}>
                        {item.series}
                      </ThemedText>
                    </View>
                  ) : null}
                  <View style={[s.typeBadge, { backgroundColor: typeColor + '2E' }]}>
                    <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                      {item.type.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// MINISTRY HUB — PACKS TAB
// =============================================================================

function PacksTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const packs = getPacksForMinistry(ministry.id);

  if (packs.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="rectangle.stack.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No packs available
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={packs}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const statusColor = PACK_STATUS_COLOR[item.status] ?? '#9C9790';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.packRow}>
              <View style={[s.packIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name="book.fill" size={16} color={colors.text} />
              </View>
              <View style={s.packInfo}>
                <ThemedText style={[s.itemTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <ThemedText style={[s.itemMeta, { color: colors.textTertiary }]}>
                  {item.lessons} lessons · {item.duration}
                </ThemedText>
                <View style={[s.typeBadge, { backgroundColor: statusColor + '2E', marginTop: 6 }]}>
                  <ThemedText style={[s.typeBadgeText, { color: statusColor }]}>
                    {item.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// MINISTRY HUB — ACTIONS TAB
// =============================================================================

function ActionsTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const actions = getActionsForMinistryV3(ministry.id);

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
      renderItem={({ item }) => {
        const statusIconColor = ACTION_STATUS_ICON_COLOR[item.status] ?? '#9C9790';
        const priorityColor = PRIORITY_COLOR[item.priority] ?? '#9C9790';
        const typeColor = ACTION_TYPE_COLOR[item.type] ?? '#9C9790';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.actionRow}>
              <View style={[s.actionCheckbox, { backgroundColor: statusIconColor + '26' }]}>
                <IconSymbol
                  name={item.status === 'completed' ? 'checkmark.circle.fill' : 'circle.fill'}
                  size={16}
                  color={statusIconColor}
                />
              </View>
              <View style={s.actionInfo}>
                <ThemedText style={[s.itemTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[s.itemMeta, { color: colors.textSecondary }]}>
                  {item.assignee} · Due: {item.dueDate}
                </ThemedText>
                <View style={s.badgeRow}>
                  <View style={[s.typeBadge, { backgroundColor: priorityColor + '2E' }]}>
                    <ThemedText style={[s.typeBadgeText, { color: priorityColor }]}>
                      {item.priority.toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={[s.typeBadge, { backgroundColor: typeColor + '2E' }]}>
                    <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
                      {item.type.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// MINISTRY HUB — PEOPLE TAB
// =============================================================================

function PeopleTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Leaders section */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Leaders</ThemedText>
        {ministry.leaders.map((leader) => (
          <View key={leader.id} style={s.personRow}>
            <View style={[s.personAvatar, { backgroundColor: leader.avatarColor + '30' }]}>
              <ThemedText style={[s.personAvatarText, { color: leader.avatarColor }]}>
                {leader.initials}
              </ThemedText>
            </View>
            <View style={s.personInfo}>
              <ThemedText style={[s.personName, { color: colors.text }]}>{leader.name}</ThemedText>
              <ThemedText style={[s.personRole, { color: colors.textSecondary }]}>{leader.role}</ThemedText>
            </View>
          </View>
        ))}
      </View>

      {/* Members section */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>
          Members ({ministry.members.length})
        </ThemedText>
        {ministry.members.map((member) => (
          <View key={member.id} style={s.personRow}>
            <View style={[s.personAvatar, { backgroundColor: member.avatarColor + '30' }]}>
              <ThemedText style={[s.personAvatarText, { color: member.avatarColor }]}>
                {member.initials}
              </ThemedText>
            </View>
            <View style={s.personInfo}>
              <ThemedText style={[s.personName, { color: colors.text }]}>{member.name}</ThemedText>
              <ThemedText style={[s.personRole, { color: colors.textSecondary }]}>{member.role}</ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MINISTRY HUB — RESOURCES TAB
// =============================================================================

function ResourcesTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const resources = getResourcesForMinistryV3(ministry.id);

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
      renderItem={({ item }) => {
        const icon = RESOURCE_TYPE_ICON[item.type] ?? 'doc.fill';
        return (
          <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.resourceRow}>
              <View style={[s.resourceIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={icon as any} size={16} color={colors.text} />
              </View>
              <View style={s.resourceInfo}>
                <ThemedText style={[s.itemTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[s.itemMeta, { color: colors.textTertiary }]}>
                  {item.date}
                </ThemedText>
              </View>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// MINISTRY HUB — AUDIT TAB
// =============================================================================

function AuditTab({
  ministry,
  colors,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
}) {
  const audit = getAuditForMinistry(ministry.id);

  if (audit.length === 0) {
    return (
      <View style={s.emptyContainer}>
        <IconSymbol name="list.clipboard" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
          No audit entries
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={audit}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabScroll}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const actionKey = getAuditActionKey(item.action);
        const actionColor = AUDIT_ACTION_COLOR[actionKey] ?? AUDIT_ACTION_COLOR.default;
        const actionIcon = AUDIT_ACTION_ICON[actionKey] ?? AUDIT_ACTION_ICON.default;
        return (
          <View style={[s.auditRow, { borderColor: colors.border }]}>
            <View style={[s.auditIconCircle, { backgroundColor: actionColor + '26' }]}>
              <IconSymbol name={actionIcon as any} size={14} color={actionColor} />
            </View>
            <View style={s.auditTextCol}>
              <ThemedText style={[s.auditDesc, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.actor} · {new Date(item.timestamp).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </ThemedText>
            </View>
          </View>
        );
      }}
    />
  );
}

// =============================================================================
// MINISTRY HUB — SETTINGS TAB
// =============================================================================

function SettingsTab({
  ministry,
  colors,
  accentColor,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const [visibility, setVisibility] = useState(ministry.visibility);
  const [joinPolicy, setJoinPolicy] = useState(ministry.joinPolicy);
  const [postingPerm, setPostingPerm] = useState(ministry.postingPermissions);

  const visibilityLabel: Record<MinistryVisibility, string> = {
    private: 'Private',
    discoverable: 'Discoverable',
    'public-read': 'Public Read',
  };

  const joinPolicyLabel: Record<MinistryJoinPolicy, string> = {
    invite: 'Invite Only',
    request: 'Request to Join',
    open: 'Open',
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Visibility */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Visibility</ThemedText>
        <View style={s.pillPickerRow}>
          {VISIBILITY_OPTIONS.map((opt) => {
            const isActive = visibility === opt;
            return (
              <Pressable
                key={opt}
                style={[
                  s.settingPill,
                  { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setVisibility(opt);
                }}
              >
                <ThemedText
                  style={[s.settingPillText, { color: isActive ? '#000' : colors.textSecondary }]}
                >
                  {visibilityLabel[opt]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Join policy */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Join Policy</ThemedText>
        <View style={s.pillPickerRow}>
          {JOIN_POLICY_OPTIONS.map((opt) => {
            const isActive = joinPolicy === opt;
            return (
              <Pressable
                key={opt}
                style={[
                  s.settingPill,
                  { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setJoinPolicy(opt);
                }}
              >
                <ThemedText
                  style={[s.settingPillText, { color: isActive ? '#000' : colors.textSecondary }]}
                >
                  {joinPolicyLabel[opt]}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Posting permissions */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Posting Permissions</ThemedText>
        <View style={s.pillPickerRow}>
          {(['everyone', 'leaders-only', 'admins-only'] as const).map((opt) => {
            const isActive = postingPerm === opt;
            const label = opt === 'everyone' ? 'Everyone' : opt === 'leaders-only' ? 'Leaders' : 'Admins';
            return (
              <Pressable
                key={opt}
                style={[
                  s.settingPill,
                  { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setPostingPerm(opt);
                }}
              >
                <ThemedText
                  style={[s.settingPillText, { color: isActive ? '#000' : colors.textSecondary }]}
                >
                  {label}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Action buttons */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          style={[s.settingsActionBtn, { borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="gear" size={16} color={colors.textSecondary} />
          <ThemedText style={[s.settingsActionText, { color: colors.text }]}>
            Edit Ministry
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.settingsActionBtn, { borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="archivebox" size={16} color={colors.textSecondary} />
          <ThemedText style={[s.settingsActionText, { color: colors.text }]}>
            Archive
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MINISTRY HUB — PLACEHOLDER TAB
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
// MINISTRY HUB (DETAIL VIEW)
// =============================================================================

function MinistryHub({
  ministry,
  colors,
  accentColor,
  onBack,
}: {
  ministry: MinistryFull;
  colors: typeof Colors.light;
  accentColor: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<MinistryHubTabId>('overview');
  const catColor = CATEGORY_COLOR_MAP[ministry.category];
  const catIcon = CATEGORY_ICON_MAP[ministry.category];
  const statusColor = STATUS_COLOR_MAP[ministry.status];

  const visibilityLabel: Record<MinistryVisibility, string> = {
    private: 'Private',
    discoverable: 'Discoverable',
    'public-read': 'Public Read',
  };

  const renderTab = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab ministry={ministry} colors={colors} />;
      case 'room':
        return <RoomTab ministry={ministry} colors={colors} accentColor={accentColor} />;
      case 'events':
        return <EventsTab ministry={ministry} colors={colors} />;
      case 'teachings':
        return <TeachingsTab ministry={ministry} colors={colors} />;
      case 'packs':
        return <PacksTab ministry={ministry} colors={colors} />;
      case 'actions':
        return <ActionsTab ministry={ministry} colors={colors} />;
      case 'people':
        return <PeopleTab ministry={ministry} colors={colors} />;
      case 'resources':
        return <ResourcesTab ministry={ministry} colors={colors} />;
      case 'operations':
        return (
          <PlaceholderTab
            icon="gearshape.fill"
            description="Ministry operations and logistics"
            colors={colors}
          />
        );
      case 'finance':
        return (
          <PlaceholderTab
            icon="dollarsign.circle.fill"
            description="Ministry financial overview"
            colors={colors}
          />
        );
      case 'audit':
        return <AuditTab ministry={ministry} colors={colors} />;
      case 'settings':
        return <SettingsTab ministry={ministry} colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  }, [activeTab, ministry, colors, accentColor]);

  return (
    <View style={s.flex1}>
      {/* === Identity Header === */}
      <View style={s.hubHeader}>
        {/* Back chevron */}
        <Pressable
          style={s.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
        >
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
        </Pressable>

        {/* Large icon circle */}
        <View style={[s.hubIconCircle, { backgroundColor: catColor + '26' }]}>
          <IconSymbol name={catIcon as any} size={22} color={catColor} />
        </View>

        {/* Name + badges */}
        <View style={s.hubIdentityCol}>
          <ThemedText style={[s.hubName, { color: colors.text }]} numberOfLines={1}>
            {ministry.name}
          </ThemedText>
          <View style={s.hubBadgeRow}>
            <View style={[s.categoryBadge, { backgroundColor: catColor + '2E' }]}>
              <ThemedText style={[s.categoryBadgeText, { color: catColor }]}>
                {CATEGORY_CHIPS.find((c) => c.key === ministry.category)?.label ?? ministry.category}
              </ThemedText>
            </View>
            <View style={[s.typeBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.typeBadgeText, { color: colors.textSecondary }]}>
                {visibilityLabel[ministry.visibility].toUpperCase()}
              </ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: statusColor + '2E' }]}>
              <ThemedText style={[s.statusBadgeText, { color: statusColor }]}>
                {ministry.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>

      {/* Leaders */}
      <View style={s.hubLeadersRow}>
        <View style={s.avatarStack}>
          {ministry.leaders.slice(0, 3).map((leader, idx) => (
            <View
              key={leader.id}
              style={[
                s.leaderAvatar,
                {
                  backgroundColor: leader.avatarColor + '30',
                  marginLeft: idx > 0 ? -8 : 0,
                  zIndex: 3 - idx,
                },
              ]}
            >
              <ThemedText style={[s.leaderAvatarText, { color: leader.avatarColor }]}>
                {leader.initials}
              </ThemedText>
            </View>
          ))}
        </View>
        <ThemedText style={[s.hubLeadersText, { color: colors.textSecondary }]} numberOfLines={1}>
          {ministry.leaders.map((l) => l.name).join(', ')}
        </ThemedText>
      </View>

      {/* Summary line */}
      <View style={s.hubSummaryRow}>
        {ministry.meetingPattern ? (
          <View style={s.infoRow}>
            <IconSymbol name="calendar.badge.clock" size={12} color={colors.textTertiary} />
            <ThemedText style={[s.hubSummaryText, { color: colors.textTertiary }]}>
              {ministry.meetingPattern}
            </ThemedText>
          </View>
        ) : null}
        {ministry.nextEvent ? (
          <View style={[s.infoRow, { marginTop: 2 }]}>
            <IconSymbol name="calendar" size={12} color={colors.textSecondary} />
            <ThemedText style={[s.hubSummaryText, { color: colors.textSecondary }]}>
              Next: {ministry.nextEvent.date}, {ministry.nextEvent.time}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {/* Primary actions row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hubActionsRow}
      >
        {ministry.hasRoom ? (
          <Pressable
            style={[s.hubActionBtn, { backgroundColor: accentColor + '18' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="bubble.left.fill" size={14} color={accentColor} />
            <ThemedText style={[s.hubActionText, { color: accentColor }]}>Open Room</ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          style={[s.hubActionBtn, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="person.badge.plus" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.hubActionText, { color: colors.textSecondary }]}>
            {ministry.joinPolicy === 'open' ? 'Join' : 'Request'}
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.hubActionBtn, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="square.and.arrow.up" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.hubActionText, { color: colors.textSecondary }]}>Share</ThemedText>
        </Pressable>
        <Pressable
          style={[s.hubActionBtn, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setActiveTab('settings');
          }}
        >
          <IconSymbol name="gear" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.hubActionText, { color: colors.textSecondary }]}>Settings</ThemedText>
        </Pressable>
      </ScrollView>

      {/* === 12-tab pill nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabPillRow}
      >
        {MINISTRY_HUB_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.id);
              }}
            >
              <ThemedText
                style={[s.tabPillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* === Tab content === */}
      <View style={s.flex1}>{renderTab()}</View>
    </View>
  );
}

// =============================================================================
// FILTER BOTTOM SHEET
// =============================================================================

function FilterSheet({
  visible,
  onClose,
  colors,
  accentColor,
  filterState,
  onApply,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accentColor: string;
  filterState: {
    sort: MinistryFilterState['sort'];
    statuses: MinistryStatus[];
    categories: MinistryCategory[];
    visibility: MinistryVisibility[];
  };
  onApply: (state: {
    sort: MinistryFilterState['sort'];
    statuses: MinistryStatus[];
    categories: MinistryCategory[];
    visibility: MinistryVisibility[];
  }) => void;
}) {
  const [localSort, setLocalSort] = useState(filterState.sort);
  const [localStatuses, setLocalStatuses] = useState<MinistryStatus[]>(filterState.statuses);
  const [localCategories, setLocalCategories] = useState<MinistryCategory[]>(filterState.categories);
  const [localVisibility, setLocalVisibility] = useState<MinistryVisibility[]>(filterState.visibility);

  const toggleStatus = useCallback((status: MinistryStatus) => {
    setLocalStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status],
    );
  }, []);

  const toggleCategory = useCallback((cat: MinistryCategory) => {
    setLocalCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }, []);

  const toggleVisibility = useCallback((vis: MinistryVisibility) => {
    setLocalVisibility((prev) =>
      prev.includes(vis) ? prev.filter((v) => v !== vis) : [...prev, vis],
    );
  }, []);

  const handleClear = useCallback(() => {
    setLocalSort('az');
    setLocalStatuses([]);
    setLocalCategories([]);
    setLocalVisibility([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply({
      sort: localSort,
      statuses: localStatuses,
      categories: localCategories,
      visibility: localVisibility,
    });
    onClose();
  }, [localSort, localStatuses, localCategories, localVisibility, onApply, onClose]);

  const visibilityLabel: Record<MinistryVisibility, string> = {
    private: 'Private',
    discoverable: 'Discoverable',
    'public-read': 'Public-read',
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Ministries" useModal>
      {/* Sort */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text }]}>Sort</ThemedText>
      {SORT_OPTIONS.map((opt) => {
        const isActive = localSort === opt.key;
        return (
          <Pressable
            key={opt.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setLocalSort(opt.key);
            }}
          >
            <View
              style={[
                s.radioOuter,
                { borderColor: isActive ? accentColor : colors.textTertiary },
              ]}
            >
              {isActive ? (
                <View style={[s.radioInner, { backgroundColor: accentColor }]} />
              ) : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Status */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Status
      </ThemedText>
      {STATUS_OPTIONS.map((status) => {
        const isChecked = localStatuses.includes(status);
        const sColor = STATUS_COLOR_MAP[status];
        return (
          <Pressable
            key={status}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleStatus(status);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? (
                <IconSymbol name="checkmark" size={12} color="#000" />
              ) : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: sColor }]} />
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Category */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Category
      </ThemedText>
      {CATEGORY_OPTIONS.map((chip) => {
        const isChecked = localCategories.includes(chip.key as MinistryCategory);
        const catColor = CATEGORY_COLOR_MAP[chip.key as MinistryCategory];
        return (
          <Pressable
            key={chip.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleCategory(chip.key as MinistryCategory);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? (
                <IconSymbol name="checkmark" size={12} color="#000" />
              ) : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: catColor }]} />
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {chip.label}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Visibility */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Visibility
      </ThemedText>
      {VISIBILITY_OPTIONS.map((vis) => {
        const isChecked = localVisibility.includes(vis);
        return (
          <Pressable
            key={vis}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggleVisibility(vis);
            }}
          >
            <View
              style={[
                s.checkboxOuter,
                {
                  borderColor: isChecked ? accentColor : colors.textTertiary,
                  backgroundColor: isChecked ? accentColor : 'transparent',
                },
              ]}
            >
              {isChecked ? (
                <IconSymbol name="checkmark" size={12} color="#000" />
              ) : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {visibilityLabel[vis]}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Action buttons */}
      <View style={s.filterActions}>
        <Pressable
          style={[s.filterGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleClear();
          }}
        >
          <ThemedText style={[s.filterGhostText, { color: colors.textSecondary }]}>
            Clear
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.filterApplyButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleApply();
          }}
        >
          <ThemedText style={s.filterApplyText}>Apply</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// CREATE MINISTRY BOTTOM SHEET
// =============================================================================

function CreateMinistrySheet({
  visible,
  onClose,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MinistryCategory>('discipleship');
  const [visibility, setVisibility] = useState<MinistryVisibility>('discoverable');
  const [joinPolicy, setJoinPolicy] = useState<MinistryJoinPolicy>('request');
  const [createRoom, setCreateRoom] = useState(CREATE_DEFAULTS.createRoom);
  const [createEvents, setCreateEvents] = useState(CREATE_DEFAULTS.createEventsCalendar);
  const [createPacks, setCreatePacks] = useState(CREATE_DEFAULTS.createPacksCollection);
  const [createResources, setCreateResources] = useState(CREATE_DEFAULTS.createResourcesCollection);

  const visibilityLabel: Record<MinistryVisibility, string> = {
    private: 'Private',
    discoverable: 'Discoverable',
    'public-read': 'Public-read',
  };

  const joinPolicyLabel: Record<MinistryJoinPolicy, string> = {
    invite: 'Invite',
    request: 'Request',
    open: 'Open',
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Ministry" useModal>
      {/* Ministry Name */}
      <ThemedText style={[s.formLabel, { color: colors.text }]}>Ministry Name</ThemedText>
      <TextInput
        style={[s.formInput, { color: colors.text, backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
        placeholder="Enter ministry name..."
        placeholderTextColor={colors.textTertiary}
        value={name}
        onChangeText={setName}
      />

      {/* Category */}
      <ThemedText style={[s.formLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Category
      </ThemedText>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.formPillRow}
      >
        {CATEGORY_OPTIONS.map((chip) => {
          const isActive = category === chip.key;
          const catColor = CATEGORY_COLOR_MAP[chip.key as MinistryCategory];
          return (
            <Pressable
              key={chip.key}
              style={[
                s.formPill,
                { backgroundColor: isActive ? catColor : colors.backgroundTertiary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCategory(chip.key as MinistryCategory);
              }}
            >
              <ThemedText
                style={[s.formPillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Primary Leader */}
      <ThemedText style={[s.formLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Primary Leader
      </ThemedText>
      <Pressable
        style={[s.formSelectBtn, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <ThemedText style={[s.formSelectText, { color: colors.textTertiary }]}>
          Select leader\u2026
        </ThemedText>
        <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
      </Pressable>

      {/* Visibility */}
      <ThemedText style={[s.formLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Visibility
      </ThemedText>
      <View style={s.formPillRow}>
        {VISIBILITY_OPTIONS.map((opt) => {
          const isActive = visibility === opt;
          return (
            <Pressable
              key={opt}
              style={[
                s.formPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setVisibility(opt);
              }}
            >
              <ThemedText
                style={[s.formPillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {visibilityLabel[opt]}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Join Policy */}
      <ThemedText style={[s.formLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Join Policy
      </ThemedText>
      <View style={s.formPillRow}>
        {JOIN_POLICY_OPTIONS.map((opt) => {
          const isActive = joinPolicy === opt;
          return (
            <Pressable
              key={opt}
              style={[
                s.formPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setJoinPolicy(opt);
              }}
            >
              <ThemedText
                style={[s.formPillText, { color: isActive ? '#000' : colors.textSecondary }]}
              >
                {joinPolicyLabel[opt]}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Defaults toggles */}
      <ThemedText style={[s.formLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Defaults
      </ThemedText>
      <View style={[s.toggleRow, { borderColor: colors.border }]}>
        <ThemedText style={[s.toggleLabel, { color: colors.text }]}>Room</ThemedText>
        <Switch value={createRoom} onValueChange={setCreateRoom} trackColor={{ true: accentColor }} />
      </View>
      <View style={[s.toggleRow, { borderColor: colors.border }]}>
        <ThemedText style={[s.toggleLabel, { color: colors.text }]}>Events</ThemedText>
        <Switch value={createEvents} onValueChange={setCreateEvents} trackColor={{ true: accentColor }} />
      </View>
      <View style={[s.toggleRow, { borderColor: colors.border }]}>
        <ThemedText style={[s.toggleLabel, { color: colors.text }]}>Packs</ThemedText>
        <Switch value={createPacks} onValueChange={setCreatePacks} trackColor={{ true: accentColor }} />
      </View>
      <View style={[s.toggleRow, { borderColor: colors.border }]}>
        <ThemedText style={[s.toggleLabel, { color: colors.text }]}>Resources</ThemedText>
        <Switch value={createResources} onValueChange={setCreateResources} trackColor={{ true: accentColor }} />
      </View>

      {/* Create button */}
      <Pressable
        style={[s.createMinistryBtn, { backgroundColor: accentColor, marginTop: Spacing.lg }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onClose();
        }}
      >
        <ThemedText style={s.createMinistryBtnText}>Create Ministry</ThemedText>
      </Pressable>
    </BottomSheet>
  );
}

// =============================================================================
// DIRECTORY HEADER (ListHeaderComponent)
// =============================================================================

function DirectoryHeader({
  colors,
  accentColor,
  search,
  onSearchChange,
  activeScope,
  onScopeChange,
  activeCategory,
  onCategoryChange,
  onFilterPress,
  onCreatePress,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  search: string;
  onSearchChange: (text: string) => void;
  activeScope: string;
  onScopeChange: (scope: string) => void;
  activeCategory: MinistryCategory | 'all';
  onCategoryChange: (cat: MinistryCategory | 'all') => void;
  onFilterPress: () => void;
  onCreatePress: () => void;
}) {
  return (
    <View>
      {/* Title row */}
      <View style={s.headerRow}>
        <ThemedText style={[s.headerTitle, { color: colors.text }]}>Ministries</ThemedText>
        <View style={s.headerActions}>
          <Pressable
            style={[s.iconButton, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onFilterPress();
            }}
          >
            <IconSymbol name="slider.horizontal.3" size={16} color={colors.textSecondary} />
          </Pressable>
          <Pressable
            style={[s.newButton, { backgroundColor: accentColor }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onCreatePress();
            }}
          >
            <IconSymbol name="plus" size={14} color="#000" />
            <ThemedText style={s.newButtonText}>New Ministry</ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Scope chip bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.scopeChipRow}
      >
        {MINISTRY_SCOPE_CHIPS.map((chip) => {
          const isActive = chip.key === activeScope;
          return (
            <Pressable
              key={chip.key}
              style={[
                s.scopeChip,
                {
                  backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onScopeChange(chip.key);
              }}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Search bar */}
      <View style={s.searchContainer}>
        <View
          style={[
            s.searchBar,
            { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
          ]}
        >
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search ministries\u2026"
            placeholderTextColor={colors.textTertiary}
            value={search}
            onChangeText={onSearchChange}
          />
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.categoryChipRow}
      >
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = activeCategory === chip.key;
          return (
            <Pressable
              key={chip.key}
              style={[
                s.categoryChip,
                {
                  backgroundColor: isActive ? accentColor : colors.backgroundTertiary,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCategoryChange(chip.key as MinistryCategory | 'all');
              }}
            >
              <ThemedText
                style={[
                  s.categoryChipText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {chip.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function OrgMinistriesTab({ colors, accentColor }: Props) {
  // === State ===
  const [search, setSearch] = useState('');
  const [activeScope, setActiveScope] = useState('all');
  const [activeCategory, setActiveCategory] = useState<MinistryCategory | 'all'>('all');
  const [selectedMinistry, setSelectedMinistry] = useState<MinistryFull | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [filterSort, setFilterSort] = useState<MinistryFilterState['sort']>('az');
  const [filterStatuses, setFilterStatuses] = useState<MinistryStatus[]>([]);
  const [filterCategories, setFilterCategories] = useState<MinistryCategory[]>([]);
  const [filterVisibility, setFilterVisibility] = useState<MinistryVisibility[]>([]);

  // === Derived data ===
  const processedMinistries = useMemo(() => {
    // Combine category from chip bar and filter sheet categories
    const effectiveCategory = activeCategory !== 'all' ? activeCategory : 'all';
    let result = filterMinistries(
      MINISTRIES_FULL,
      search,
      effectiveCategory,
      activeScope,
      filterStatuses,
    );

    // Also apply filter sheet category filter if set
    if (filterCategories.length > 0 && activeCategory === 'all') {
      result = result.filter((m) => filterCategories.includes(m.category));
    }

    // Apply visibility filter
    if (filterVisibility.length > 0) {
      result = result.filter((m) => filterVisibility.includes(m.visibility));
    }

    return sortMinistries(result, filterSort);
  }, [search, activeScope, activeCategory, filterSort, filterStatuses, filterCategories, filterVisibility]);

  const handleApplyFilter = useCallback(
    (state: {
      sort: MinistryFilterState['sort'];
      statuses: MinistryStatus[];
      categories: MinistryCategory[];
      visibility: MinistryVisibility[];
    }) => {
      setFilterSort(state.sort);
      setFilterStatuses(state.statuses);
      setFilterCategories(state.categories);
      setFilterVisibility(state.visibility);
    },
    [],
  );

  // === Ministry Hub view ===
  if (selectedMinistry) {
    return (
      <MinistryHub
        ministry={selectedMinistry}
        colors={colors}
        accentColor={accentColor}
        onBack={() => setSelectedMinistry(null)}
      />
    );
  }

  // === Directory view ===
  return (
    <View style={s.flex1}>
      <FlatList
        data={processedMinistries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <DirectoryHeader
            colors={colors}
            accentColor={accentColor}
            search={search}
            onSearchChange={setSearch}
            activeScope={activeScope}
            onScopeChange={setActiveScope}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            onFilterPress={() => setShowFilter(true)}
            onCreatePress={() => setShowCreate(true)}
          />
        }
        renderItem={({ item }) => (
          <MinistryCard
            ministry={item}
            colors={colors}
            accentColor={accentColor}
            onOpen={() => setSelectedMinistry(item)}
          />
        )}
        ListEmptyComponent={
          <View style={s.emptyContainer}>
            <IconSymbol name="hands.sparkles.fill" size={32} color={colors.textTertiary} />
            <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>
              No ministries match your search
            </ThemedText>
          </View>
        }
      />

      {/* === Bottom Sheets === */}
      <FilterSheet
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        colors={colors}
        accentColor={accentColor}
        filterState={{
          sort: filterSort,
          statuses: filterStatuses,
          categories: filterCategories,
          visibility: filterVisibility,
        }}
        onApply={handleApplyFilter}
      />
      <CreateMinistrySheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        colors={colors}
        accentColor={accentColor}
      />
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  flex1: {
    flex: 1,
  },

  // === Header area ===
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  newButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#000',
  },

  // === Scope chips ===
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // === Search ===
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
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

  // === Category chips ===
  categoryChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // === Ministry card ===
  ministryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    marginHorizontal: Spacing.md,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  catIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  cardMidCol: {
    flex: 1,
    marginRight: Spacing.sm,
    justifyContent: 'center',
    paddingTop: 6,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: 6,
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  leadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  avatarStack: {
    flexDirection: 'row',
  },
  leaderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: {
    fontSize: 9,
    fontWeight: '700',
  },
  leadersText: {
    fontSize: 12,
    flex: 1,
  },
  nextEventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  nextEventText: {
    fontSize: 12,
    flex: 1,
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  memberText: {
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.md,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // === Tab pills ===
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // === List ===
  listContent: {
    paddingBottom: 120,
  },

  // === Hub header ===
  hubHeader: {
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
  hubIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubIdentityCol: {
    flex: 1,
  },
  hubName: {
    fontSize: 18,
    fontWeight: '700',
  },
  hubBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  hubLeadersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginBottom: 4,
  },
  hubLeadersText: {
    fontSize: 12,
    flex: 1,
  },
  hubSummaryRow: {
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  hubSummaryText: {
    fontSize: 12,
  },
  hubActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  hubActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: BorderRadius.md,
  },
  hubActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // === Tab content shared ===
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // === Stats grid ===
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  statCell: {
    flex: 1,
    minWidth: '40%',
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

  // === Events ===
  eventRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateMonth: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },

  // === Teachings ===
  teachingRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  playIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teachingInfo: {
    flex: 1,
  },
  seriesBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
  },
  seriesBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // === Packs ===
  packRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  packIcon: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packInfo: {
    flex: 1,
  },

  // === Actions ===
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionInfo: {
    flex: 1,
  },

  // === People ===
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  personAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: '600',
  },
  personRole: {
    fontSize: 12,
    marginTop: 1,
  },

  // === Resources ===
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
  resourceInfo: {
    flex: 1,
  },

  // === Audit ===
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  auditIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  auditTextCol: {
    flex: 1,
  },
  auditDesc: {
    fontSize: 14,
    fontWeight: '600',
  },
  auditMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // === Accent button ===
  accentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  accentButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // === Settings tab ===
  pillPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  settingPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  settingPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  settingsActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsActionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // === Centered container ===
  centeredContainer: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
  },

  // === Placeholder ===
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

  // === Empty ===
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

  // === Filter sheet ===
  filterSectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  filterOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
  },
  filterOptionText: {
    fontSize: 14,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  checkboxOuter: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  filterActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  filterGhostButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  filterGhostText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterApplyButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
  },
  filterApplyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },

  // === Create ministry sheet ===
  formLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  formInput: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 44,
    fontSize: 14,
  },
  formPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  formPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  formPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formSelectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    height: 44,
  },
  formSelectText: {
    fontSize: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  createMinistryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  createMinistryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});
