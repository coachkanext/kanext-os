/**
 * Organization Series Tab v2 — Series Hub for Competition Mode Organization.
 *
 * Directory view with filterable series cards, deep-dive Series Hub with
 * 16-tab pill nav, and Filter / Create bottom sheets.
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
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  SERIES_SCOPE_CHIPS,
  SERIES_HUB_TABS,
  SERIES_LIST,
  filterSeries,
  sortSeries,
  getParticipantsForSeries,
  getGamesForSeries,
  getVenuesForSeries,
  getRoomsForSeries,
  getStaffForSeries,
  getAuditForSeries,
  STATUS_COLOR_MAP,
  TYPE_ICON_MAP,
  TYPE_COLOR_MAP,
  LEVEL_COLOR_MAP,
  CREATE_DEFAULTS,
  type SeriesFull,
  type SeriesType,
  type SeriesLevel,
  type SeriesStatus,
  type SeriesHubTabId,
  type SeriesParticipant,
  type SeriesGame,
  type SeriesVenue,
  type SeriesRoom,
  type SeriesStaff,
  type SeriesAuditEntry,
  type SeriesFilterState,
} from '@/data/mock-series-v2';

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

const SORT_OPTIONS: { key: SeriesFilterState['sort']; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming soonest' },
  { key: 'recent', label: 'Recently active' },
  { key: 'watched', label: 'Most watched' },
  { key: 'az', label: 'A\u2013Z' },
];

const TYPE_OPTIONS: { key: SeriesType; label: string }[] = [
  { key: 'league', label: 'League' },
  { key: 'tournament', label: 'Tournament' },
  { key: 'showcase', label: 'Showcase' },
  { key: 'circuit', label: 'Circuit' },
];

const LEVEL_OPTIONS: { key: SeriesLevel; label: string }[] = [
  { key: 'prep', label: 'Prep' },
  { key: 'college', label: 'College' },
  { key: 'international', label: 'International' },
  { key: 'pro', label: 'Pro' },
  { key: 'mixed', label: 'Mixed' },
];

const STATUS_OPTIONS: { key: SeriesStatus; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'live', label: 'Live' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'archived', label: 'Archived' },
];

/** Display-friendly label for SeriesType */
function typeLabel(t: SeriesType): string {
  switch (t) {
    case 'league': return 'League';
    case 'tournament': return 'Tournament';
    case 'showcase': return 'Showcase';
    case 'circuit': return 'Circuit';
  }
}

/** Display-friendly label for SeriesLevel */
function levelLabel(l: SeriesLevel): string {
  switch (l) {
    case 'prep': return 'Prep';
    case 'college': return 'College';
    case 'international': return 'International';
    case 'pro': return 'Pro';
    case 'mixed': return 'Mixed';
  }
}

/** Display-friendly label for SeriesStatus */
function statusLabel(st: SeriesStatus): string {
  switch (st) {
    case 'upcoming': return 'UPCOMING';
    case 'live': return 'LIVE';
    case 'in-progress': return 'IN PROGRESS';
    case 'completed': return 'COMPLETED';
    case 'archived': return 'ARCHIVED';
  }
}

/** Format season window */
function formatSeasonWindow(sw: { start: string; end: string }): string {
  const fmt = (d: string) => {
    const dt = new Date(d + 'T00:00:00');
    return dt.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };
  const s = fmt(sw.start);
  const e = fmt(sw.end);
  return s === e ? s : `${s} \u2013 ${e}`;
}

/** Keys for CREATE_DEFAULTS iteration */
const CREATE_DEFAULTS_KEYS = Object.keys(CREATE_DEFAULTS) as (keyof typeof CREATE_DEFAULTS)[];

const CREATE_DEFAULTS_LABELS: Record<keyof typeof CREATE_DEFAULTS, string> = {
  opsRoom: 'Create Ops Room',
  officialsRoom: 'Create Officials Room',
  mediaRoom: 'Create Media Room',
  teamRepsRoom: 'Create Team Reps Room',
  venueOpsRoom: 'Create Venue Ops Room',
  complianceTemplate: 'Apply Compliance Template',
  paymentRailsScope: 'Enable Payment Rails Scope',
};

// =============================================================================
// AUDIT ACTION HELPERS
// =============================================================================

const AUDIT_ACTION_ICON: Record<string, string> = {
  created: 'plus.circle.fill',
  added: 'person.badge.plus',
  seeded: 'arrow.up.arrow.down',
  published: 'doc.fill',
  assigned: 'person.fill',
  completed: 'checkmark.circle.fill',
  filed: 'doc.badge.plus',
  default: 'circle.fill',
};

const AUDIT_ACTION_COLOR: Record<string, string> = {
  created: '#22C55E',
  added: '#1D9BF0',
  seeded: '#F59E0B',
  published: '#1D9BF0',
  assigned: '#1D9BF0',
  completed: '#22C55E',
  filed: '#1D9BF0',
  default: '#A1A1AA',
};

function getAuditActionKey(action: string): string {
  const lower = action.toLowerCase();
  if (lower.includes('created')) return 'created';
  if (lower.includes('added') || lower.includes('registered')) return 'added';
  if (lower.includes('seeded') || lower.includes('bracket')) return 'seeded';
  if (lower.includes('published') || lower.includes('schedule')) return 'published';
  if (lower.includes('assigned') || lower.includes('staff')) return 'assigned';
  if (lower.includes('completed') || lower.includes('game')) return 'completed';
  if (lower.includes('filed') || lower.includes('compliance') || lower.includes('media')) return 'filed';
  return 'default';
}

// =============================================================================
// SERIES CARD
// =============================================================================

function SeriesCard({
  series,
  colors,
  accentColor,
  onPress,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
  accentColor: string;
  onPress: () => void;
}) {
  const stColor = STATUS_COLOR_MAP[series.status];
  const tColor = TYPE_COLOR_MAP[series.type];
  const lColor = LEVEL_COLOR_MAP[series.level];

  return (
    <Pressable
      style={[s.seriesCard, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
    >
      {/* Top row: logo + name + status */}
      <View style={s.cardTopRow}>
        <View style={[s.logoCircle, { backgroundColor: series.avatarColor }]}>
          <ThemedText style={s.logoText}>{series.shortName}</ThemedText>
        </View>

        <View style={s.cardMidColumn}>
          <ThemedText style={[s.seriesName, { color: colors.text }]} numberOfLines={1}>
            {series.name}
          </ThemedText>

          {/* Type + Level badges */}
          <View style={s.badgeRow}>
            <View style={[s.badge, { backgroundColor: tColor + '2E' }]}>
              <ThemedText style={[s.badgeText, { color: tColor }]}>
                {typeLabel(series.type).toUpperCase()}
              </ThemedText>
            </View>
            <View style={[s.badge, { backgroundColor: lColor + '2E' }]}>
              <ThemedText style={[s.badgeText, { color: lColor }]}>
                {levelLabel(series.level).toUpperCase()}
              </ThemedText>
            </View>
          </View>

          {/* Current stage line */}
          <ThemedText
            style={[s.currentStage, { color: colors.textSecondary }]}
            numberOfLines={1}
          >
            {series.currentStageLine}
          </ThemedText>

          {/* Ops director + counts */}
          <ThemedText style={[s.opsLine, { color: colors.textTertiary }]} numberOfLines={1}>
            Ops Director: {series.opsDirector.name} {'\u00B7'} Teams: {series.teamCount} {'\u00B7'} Games: {series.gameCount}
          </ThemedText>

          {/* Compliance pulse */}
          {series.compliancePulse ? (
            <View style={s.compliancePulseRow}>
              <View
                style={[
                  s.complianceDot,
                  {
                    backgroundColor:
                      series.compliancePulse.toLowerCase().includes('100%')
                        ? '#22C55E'
                        : '#F59E0B',
                  },
                ]}
              />
              <ThemedText style={[s.compliancePulseText, { color: colors.textTertiary }]}>
                {series.compliancePulse}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {/* Status badge */}
        <View style={[s.statusBadge, { backgroundColor: stColor + '2E' }]}>
          <ThemedText style={[s.statusBadgeText, { color: stColor }]}>
            {statusLabel(series.status)}
          </ThemedText>
        </View>
      </View>

      {/* Quick actions row */}
      <View style={[s.quickActionsRow, { borderTopColor: colors.border }]}>
        <Pressable
          style={s.quickActionBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onPress();
          }}
        >
          <ThemedText style={[s.quickActionText, { color: accentColor }]}>Open</ThemedText>
        </Pressable>
        <Pressable
          style={s.quickActionBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <ThemedText style={[s.quickActionText, { color: colors.textSecondary }]}>
            Schedule
          </ThemedText>
        </Pressable>
        {series.hasOpsRoom ? (
          <Pressable
            style={s.quickActionBtn}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <ThemedText style={[s.quickActionText, { color: colors.textSecondary }]}>
              Ops Room
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

// =============================================================================
// SERIES HUB — TAB CONTENT
// =============================================================================

function HubTabContent({
  tab,
  series,
  colors,
  accentColor,
}: {
  tab: SeriesHubTabId;
  series: SeriesFull;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  switch (tab) {
    // ── Overview ──
    case 'overview':
      return <OverviewTab series={series} colors={colors} accentColor={accentColor} />;
    case 'schedule':
      return <ScheduleTab series={series} colors={colors} />;
    case 'standings':
      return <StandingsTab series={series} colors={colors} />;
    case 'bracket-stages':
      return <BracketTab series={series} colors={colors} />;
    case 'participants':
      return <ParticipantsTab series={series} colors={colors} />;
    case 'venues':
      return <VenuesTab series={series} colors={colors} />;
    case 'staff':
      return <StaffTab series={series} colors={colors} />;
    case 'rooms':
      return <RoomsTab series={series} colors={colors} accentColor={accentColor} />;
    case 'operations':
      return <PlaceholderTab icon="gear" label="Series operations and logistics" colors={colors} />;
    case 'finance':
      return <PlaceholderTab icon="dollarsign.circle.fill" label="Series financial overview" colors={colors} />;
    case 'payment-rails':
      return <PlaceholderTab icon="lock.fill" label="Series payment processing" colors={colors} />;
    case 'compliance':
      return <ComplianceTab series={series} colors={colors} />;
    case 'media':
      return <MediaTab series={series} colors={colors} accentColor={accentColor} />;
    case 'reports':
      return <PlaceholderTab icon="chart.bar.fill" label="Series performance reports" colors={colors} />;
    case 'audit':
      return <AuditTab series={series} colors={colors} />;
    case 'settings':
      return <SettingsTab colors={colors} />;
    default:
      return null;
  }
}

// === Overview Tab ===

function OverviewTab({
  series,
  colors,
  accentColor,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const participants = useMemo(() => getParticipantsForSeries(series.id), [series.id]);
  const games = useMemo(() => getGamesForSeries(series.id), [series.id]);
  const staff = useMemo(() => getStaffForSeries(series.id), [series.id]);
  const venues = useMemo(() => getVenuesForSeries(series.id), [series.id]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Description */}
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.hubBody, { color: colors.textSecondary }]}>
          {series.description}
        </ThemedText>
      </View>

      {/* Current Stage */}
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Current Stage</ThemedText>
        <ThemedText style={[s.hubBody, { color: colors.textSecondary, fontStyle: 'italic' }]}>
          {series.currentStageLine}
        </ThemedText>
      </View>

      {/* Season Window */}
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Season Window</ThemedText>
        <ThemedText style={[s.hubBody, { color: colors.textSecondary }]}>
          {formatSeasonWindow(series.seasonWindow)}
        </ThemedText>
      </View>

      {/* Key Stats */}
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Key Stats</ThemedText>
        <View style={s.statsGrid}>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>{participants.length}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textTertiary }]}>Teams</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>{games.length}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textTertiary }]}>Games</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>{staff.length}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textTertiary }]}>Staff</ThemedText>
          </View>
          <View style={s.statItem}>
            <ThemedText style={[s.statNumber, { color: colors.text }]}>{venues.length}</ThemedText>
            <ThemedText style={[s.statLabel, { color: colors.textTertiary }]}>Venues</ThemedText>
          </View>
        </View>
      </View>

      {/* Compliance Pulse */}
      {series.compliancePulse ? (
        <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Compliance</ThemedText>
          <View style={s.compliancePulseRow}>
            <View
              style={[
                s.complianceDot,
                {
                  backgroundColor: series.compliancePulse.toLowerCase().includes('100%')
                    ? '#22C55E'
                    : '#F59E0B',
                },
              ]}
            />
            <ThemedText style={[s.hubBody, { color: colors.textSecondary }]}>
              {series.compliancePulse}
            </ThemedText>
          </View>
        </View>
      ) : null}

      {/* Ops Director */}
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Ops Director</ThemedText>
        <View style={s.opsDirectorRow}>
          <View style={[s.staffAvatar, { backgroundColor: series.opsDirector.avatarColor + '30' }]}>
            <ThemedText style={[s.staffInitials, { color: series.opsDirector.avatarColor }]}>
              {series.opsDirector.initials}
            </ThemedText>
          </View>
          <View style={s.staffInfo}>
            <ThemedText style={[s.staffName, { color: colors.text }]}>
              {series.opsDirector.name}
            </ThemedText>
            <ThemedText style={[s.staffRole, { color: colors.textTertiary }]}>
              {series.opsDirector.role}
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// === Schedule Tab ===

function ScheduleTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const games = useMemo(() => getGamesForSeries(series.id), [series.id]);

  const gameStatusColor = (st: SeriesGame['status']): string => {
    switch (st) {
      case 'scheduled': return '#1D9BF0';
      case 'live': return '#EF4444';
      case 'final': return '#22C55E';
    }
  };

  return (
    <FlatList
      data={games}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const gColor = gameStatusColor(item.status);
        return (
          <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.scheduleTopRow}>
              <View style={[s.badge, { backgroundColor: gColor + '2E' }]}>
                <ThemedText style={[s.badgeText, { color: gColor }]}>
                  {item.status.toUpperCase()}
                </ThemedText>
              </View>
              <ThemedText style={[s.stageLabel, { color: colors.textTertiary }]}>
                {item.stage}
              </ThemedText>
            </View>
            <ThemedText style={[s.scheduleDatetime, { color: colors.textSecondary }]}>
              {item.date} {'\u00B7'} {item.time}
            </ThemedText>
            <ThemedText style={[s.scheduleMatchup, { color: colors.text }]}>
              {item.homeTeam} vs {item.awayTeam}
            </ThemedText>
            <ThemedText style={[s.scheduleVenue, { color: colors.textTertiary }]}>
              {item.venue}{item.court ? ` \u00B7 ${item.court}` : ''}
            </ThemedText>
            {item.status === 'final' || item.status === 'live' ? (
              <ThemedText style={[s.scheduleScore, { color: colors.text }]}>
                {item.homeScore} \u2013 {item.awayScore}
              </ThemedText>
            ) : null}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="calendar" label="No games scheduled" colors={colors} />
      }
    />
  );
}

// === Standings Tab ===

function StandingsTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const participants = useMemo(
    () =>
      getParticipantsForSeries(series.id).sort((a, b) => {
        const pctA = a.wins + a.losses > 0 ? a.wins / (a.wins + a.losses) : 0;
        const pctB = b.wins + b.losses > 0 ? b.wins / (b.wins + b.losses) : 0;
        return pctB - pctA;
      }),
    [series.id],
  );

  if (series.type !== 'league') {
    return (
      <View style={s.placeholderContainer}>
        <IconSymbol name="tablecells" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
          Standings not applicable for {typeLabel(series.type).toLowerCase()} format
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item, index }) => {
        const pct = item.wins + item.losses > 0
          ? (item.wins / (item.wins + item.losses)).toFixed(3)
          : '.000';
        return (
          <View style={[s.standingsRow, { borderColor: colors.border }]}>
            <ThemedText style={[s.standingsRank, { color: colors.textTertiary }]}>
              {index + 1}
            </ThemedText>
            <View style={[s.standingsDot, { backgroundColor: item.avatarColor }]} />
            <ThemedText style={[s.standingsName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText style={[s.standingsRecord, { color: colors.textSecondary }]}>
              {item.wins}-{item.losses}
            </ThemedText>
            <ThemedText style={[s.standingsPct, { color: colors.textTertiary }]}>
              {pct}
            </ThemedText>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="tablecells" label="No standings data" colors={colors} />
      }
    />
  );
}

// === Bracket / Stages Tab ===

function BracketTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const participants = useMemo(() => getParticipantsForSeries(series.id), [series.id]);

  if (series.type === 'league') {
    return (
      <View style={s.placeholderContainer}>
        <IconSymbol name="tablecells.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
          Round Robin — see Standings
        </ThemedText>
      </View>
    );
  }

  if (series.type === 'showcase') {
    return (
      <View style={s.placeholderContainer}>
        <IconSymbol name="star.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
          Session-based — see Schedule
        </ThemedText>
      </View>
    );
  }

  if (series.type === 'circuit') {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
        <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Circuit Stops</ThemedText>
          <ThemedText style={[s.hubBody, { color: colors.textSecondary, fontStyle: 'italic' }]}>
            {series.currentStageLine}
          </ThemedText>
        </View>
        {participants.length > 0 ? (
          <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>
              Point Leaders
            </ThemedText>
            {participants.slice(0, 8).map((p, idx) => (
              <View key={p.id} style={s.bracketParticipantRow}>
                <ThemedText style={[s.standingsRank, { color: colors.textTertiary }]}>
                  {idx + 1}
                </ThemedText>
                <View style={[s.standingsDot, { backgroundColor: p.avatarColor }]} />
                <ThemedText style={[s.standingsName, { color: colors.text }]} numberOfLines={1}>
                  {p.name}
                </ThemedText>
                <ThemedText style={[s.standingsRecord, { color: colors.textSecondary }]}>
                  {p.wins}-{p.losses}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null}
      </ScrollView>
    );
  }

  // Tournament bracket visualization placeholder
  const seeded = [...participants].sort((a, b) => (a.seed ?? 99) - (b.seed ?? 99));

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Bracket</ThemedText>
        {seeded.map((p) => (
          <View key={p.id} style={s.bracketParticipantRow}>
            {p.seed != null ? (
              <ThemedText style={[s.bracketSeed, { color: colors.textTertiary }]}>
                #{p.seed}
              </ThemedText>
            ) : (
              <View style={s.bracketSeedPlaceholder} />
            )}
            <View style={[s.standingsDot, { backgroundColor: p.avatarColor }]} />
            <ThemedText style={[s.standingsName, { color: colors.text }]} numberOfLines={1}>
              {p.name}
            </ThemedText>
            <ThemedText style={[s.standingsRecord, { color: colors.textSecondary }]}>
              {p.wins}-{p.losses}
            </ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// === Participants Tab ===

function ParticipantsTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const participants = useMemo(() => getParticipantsForSeries(series.id), [series.id]);

  return (
    <FlatList
      data={participants}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.participantRow, { borderColor: colors.border }]}>
          {item.seed != null ? (
            <ThemedText style={[s.bracketSeed, { color: colors.textTertiary }]}>
              #{item.seed}
            </ThemedText>
          ) : null}
          <View style={[s.standingsDot, { backgroundColor: item.avatarColor }]} />
          <ThemedText style={[s.participantName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <ThemedText style={[s.standingsRecord, { color: colors.textSecondary }]}>
            {item.wins}-{item.losses}
          </ThemedText>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="person.3.fill" label="No participants" colors={colors} />
      }
    />
  );
}

// === Venues Tab ===

function VenuesTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const venues = useMemo(() => getVenuesForSeries(series.id), [series.id]);

  return (
    <FlatList
      data={venues}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.venueName, { color: colors.text }]}>{item.name}</ThemedText>
          <ThemedText style={[s.venueLocation, { color: colors.textSecondary }]}>
            {item.location}
          </ThemedText>
          <ThemedText style={[s.venueMeta, { color: colors.textTertiary }]}>
            {item.courts} court{item.courts !== 1 ? 's' : ''} {'\u00B7'} Capacity: {item.capacity.toLocaleString()}
          </ThemedText>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="mappin.and.ellipse" label="No venues" colors={colors} />
      }
    />
  );
}

// === Staff Tab ===

function StaffTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const staffList = useMemo(() => getStaffForSeries(series.id), [series.id]);

  return (
    <FlatList
      data={staffList}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.staffRow, { borderColor: colors.border }]}>
          <View style={[s.staffAvatar, { backgroundColor: item.avatarColor + '30' }]}>
            <ThemedText style={[s.staffInitials, { color: item.avatarColor }]}>
              {item.initials}
            </ThemedText>
          </View>
          <ThemedText style={[s.staffNameInline, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </ThemedText>
          <View style={[s.roleBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[s.roleBadgeText, { color: colors.textSecondary }]}>
              {item.role}
            </ThemedText>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="person.3.fill" label="No staff assigned" colors={colors} />
      }
    />
  );
}

// === Rooms Tab ===

function RoomsTab({
  series,
  colors,
  accentColor,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const rooms = useMemo(() => getRoomsForSeries(series.id), [series.id]);

  return (
    <FlatList
      data={rooms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.roomRow, { borderColor: colors.border }]}>
          <IconSymbol name={item.icon as any} size={18} color={colors.textSecondary} />
          <ThemedText style={[s.roomTitle, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </ThemedText>
          <ThemedText style={[s.roomMemberCount, { color: colors.textTertiary }]}>
            {item.memberCount} members
          </ThemedText>
          {item.unreadCount > 0 ? (
            <View style={[s.unreadBadge, { backgroundColor: accentColor }]}>
              <ThemedText style={s.unreadBadgeText}>{item.unreadCount}</ThemedText>
            </View>
          ) : null}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="bubble.left.fill" label="No rooms" colors={colors} />
      }
    />
  );
}

// === Compliance Tab ===

function ComplianceTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {series.compliancePulse ? (
        <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>
            Compliance Pulse
          </ThemedText>
          <View style={s.compliancePulseRow}>
            <View
              style={[
                s.complianceDot,
                {
                  backgroundColor: series.compliancePulse.toLowerCase().includes('100%')
                    ? '#22C55E'
                    : '#F59E0B',
                },
              ]}
            />
            <ThemedText style={[s.hubBody, { color: colors.textSecondary }]}>
              {series.compliancePulse}
            </ThemedText>
          </View>
        </View>
      ) : null}
      <View style={s.placeholderContainer}>
        <IconSymbol name="shield.checkmark.fill" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
          Compliance rules and uploads
        </ThemedText>
      </View>
    </ScrollView>
  );
}

// === Media Tab ===

function MediaTab({
  series,
  colors,
  accentColor,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (series.hasMediaRoom) {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
        <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Media Room</ThemedText>
          <Pressable
            style={[s.openMediaButton, { backgroundColor: accentColor + '18' }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="video.fill" size={16} color={accentColor} />
            <ThemedText style={[s.openMediaText, { color: accentColor }]}>
              Open Media Room
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={s.placeholderContainer}>
      <IconSymbol name="video.fill" size={32} color={colors.textTertiary} />
      <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
        Series media management
      </ThemedText>
    </View>
  );
}

// === Audit Tab ===

function AuditTab({
  series,
  colors,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
}) {
  const entries = useMemo(() => getAuditForSeries(series.id), [series.id]);

  return (
    <FlatList
      data={entries}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const actionKey = getAuditActionKey(item.action);
        const iconName = AUDIT_ACTION_ICON[actionKey] ?? AUDIT_ACTION_ICON.default;
        const iconColor = AUDIT_ACTION_COLOR[actionKey] ?? AUDIT_ACTION_COLOR.default;
        return (
          <View style={[s.auditRow, { borderColor: colors.border }]}>
            <View style={[s.auditIconCircle, { backgroundColor: iconColor + '26' }]}>
              <IconSymbol name={iconName as any} size={14} color={iconColor} />
            </View>
            <View style={s.auditTextColumn}>
              <ThemedText style={[s.auditDescription, { color: colors.text }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {item.actor} {'\u00B7'} {item.timestamp}
              </ThemedText>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="list.clipboard" label="No audit entries" colors={colors} />
      }
    />
  );
}

// === Settings Tab ===

function SettingsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <View style={[s.hubCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.hubSectionTitle, { color: colors.text }]}>Settings</ThemedText>
        <Pressable
          style={[s.settingsButton, { borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="gear" size={16} color={colors.textSecondary} />
          <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>
            Edit Series
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.settingsButton, { borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="archivebox" size={16} color={colors.textSecondary} />
          <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>
            Archive
          </ThemedText>
        </Pressable>
        <Pressable
          style={[s.settingsButton, { borderColor: colors.border }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="person.fill" size={16} color={colors.textSecondary} />
          <ThemedText style={[s.settingsButtonText, { color: colors.text }]}>
            Change Ops Director
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
}

// === Placeholder Tab ===

function PlaceholderTab({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.placeholderContainer}>
      <IconSymbol name={icon as any} size={32} color={colors.textTertiary} />
      <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </View>
  );
}

// === Empty State ===

function EmptyState({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={32} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// SERIES HUB (DETAIL PAGE)
// =============================================================================

function SeriesHub({
  series,
  colors,
  accentColor,
  onBack,
}: {
  series: SeriesFull;
  colors: typeof Colors.light;
  accentColor: string;
  onBack: () => void;
}) {
  const [activeTab, setActiveTab] = useState<SeriesHubTabId>('overview');
  const stColor = STATUS_COLOR_MAP[series.status];
  const tColor = TYPE_COLOR_MAP[series.type];
  const lColor = LEVEL_COLOR_MAP[series.level];

  return (
    <View style={s.flex1}>
      {/* Identity Header */}
      <View style={s.hubHeader}>
        <Pressable
          style={s.backButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onBack();
          }}
        >
          <IconSymbol name="chevron.left" size={18} color={colors.text} />
        </Pressable>

        <View style={[s.hubLogoCircle, { backgroundColor: series.avatarColor }]}>
          <ThemedText style={s.hubLogoText}>{series.shortName}</ThemedText>
        </View>

        <View style={s.hubHeaderInfo}>
          <ThemedText style={[s.hubHeaderName, { color: colors.text }]} numberOfLines={1}>
            {series.name}
          </ThemedText>

          <View style={s.hubHeaderBadgeRow}>
            <View style={[s.badge, { backgroundColor: tColor + '2E' }]}>
              <ThemedText style={[s.badgeText, { color: tColor }]}>
                {typeLabel(series.type).toUpperCase()}
              </ThemedText>
            </View>
            <View style={[s.badge, { backgroundColor: lColor + '2E' }]}>
              <ThemedText style={[s.badgeText, { color: lColor }]}>
                {levelLabel(series.level).toUpperCase()}
              </ThemedText>
            </View>
            <View style={[s.statusBadge, { backgroundColor: stColor + '2E' }]}>
              <ThemedText style={[s.statusBadgeText, { color: stColor }]}>
                {statusLabel(series.status)}
              </ThemedText>
            </View>
          </View>

          <ThemedText style={[s.hubSeasonWindow, { color: colors.textTertiary }]}>
            {formatSeasonWindow(series.seasonWindow)}
          </ThemedText>
        </View>
      </View>

      {/* Primary actions row */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.hubActionsRow}
      >
        {series.hasOpsRoom ? (
          <Pressable
            style={[s.hubActionPill, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="gear" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.hubActionText, { color: colors.text }]}>Open Ops Room</ThemedText>
          </Pressable>
        ) : null}
        {series.hasMediaRoom ? (
          <Pressable
            style={[s.hubActionPill, { backgroundColor: colors.backgroundTertiary }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="video.fill" size={14} color={colors.textSecondary} />
            <ThemedText style={[s.hubActionText, { color: colors.text }]}>Open Media</ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          style={[s.hubActionPill, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="square.and.arrow.up" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.hubActionText, { color: colors.text }]}>Share</ThemedText>
        </Pressable>
        <Pressable
          style={[s.hubActionPill, { backgroundColor: colors.backgroundTertiary }]}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <IconSymbol name="gear" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.hubActionText, { color: colors.text }]}>Settings</ThemedText>
        </Pressable>
      </ScrollView>

      {/* 16-tab pill nav */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabPillRow}
      >
        {SERIES_HUB_TABS.map((tab) => {
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
                style={[
                  s.tabPillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Tab content */}
      <View style={s.flex1}>
        <HubTabContent
          tab={activeTab}
          series={series}
          colors={colors}
          accentColor={accentColor}
        />
      </View>
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
    sort: SeriesFilterState['sort'];
    types: SeriesType[];
    levels: SeriesLevel[];
    statuses: SeriesStatus[];
  };
  onApply: (state: {
    sort: SeriesFilterState['sort'];
    types: SeriesType[];
    levels: SeriesLevel[];
    statuses: SeriesStatus[];
  }) => void;
}) {
  const [localSort, setLocalSort] = useState(filterState.sort);
  const [localTypes, setLocalTypes] = useState<SeriesType[]>(filterState.types);
  const [localLevels, setLocalLevels] = useState<SeriesLevel[]>(filterState.levels);
  const [localStatuses, setLocalStatuses] = useState<SeriesStatus[]>(filterState.statuses);

  const toggle = <T,>(arr: T[], val: T, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    setter((prev) => (prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]));
  };

  const handleClear = useCallback(() => {
    setLocalSort('upcoming');
    setLocalTypes([]);
    setLocalLevels([]);
    setLocalStatuses([]);
  }, []);

  const handleApply = useCallback(() => {
    onApply({ sort: localSort, types: localTypes, levels: localLevels, statuses: localStatuses });
    onClose();
  }, [localSort, localTypes, localLevels, localStatuses, onApply, onClose]);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="Filter Series" useModal>
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
              {isActive ? <View style={[s.radioInner, { backgroundColor: accentColor }]} /> : null}
            </View>
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Type */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Type
      </ThemedText>
      {TYPE_OPTIONS.map((opt) => {
        const isChecked = localTypes.includes(opt.key);
        const tColor = TYPE_COLOR_MAP[opt.key];
        return (
          <Pressable
            key={opt.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggle(localTypes, opt.key, setLocalTypes);
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
              {isChecked ? <IconSymbol name="checkmark" size={12} color="#000" /> : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: tColor }]} />
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {opt.label}
            </ThemedText>
          </Pressable>
        );
      })}

      {/* Level */}
      <ThemedText style={[s.filterSectionLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Level
      </ThemedText>
      {LEVEL_OPTIONS.map((opt) => {
        const isChecked = localLevels.includes(opt.key);
        const lColor = LEVEL_COLOR_MAP[opt.key];
        return (
          <Pressable
            key={opt.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggle(localLevels, opt.key, setLocalLevels);
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
              {isChecked ? <IconSymbol name="checkmark" size={12} color="#000" /> : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: lColor }]} />
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
      {STATUS_OPTIONS.map((opt) => {
        const isChecked = localStatuses.includes(opt.key);
        const sColor = STATUS_COLOR_MAP[opt.key];
        return (
          <Pressable
            key={opt.key}
            style={s.filterOptionRow}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              toggle(localStatuses, opt.key, setLocalStatuses);
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
              {isChecked ? <IconSymbol name="checkmark" size={12} color="#000" /> : null}
            </View>
            <View style={[s.filterDot, { backgroundColor: sColor }]} />
            <ThemedText style={[s.filterOptionText, { color: colors.text }]}>
              {opt.label}
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
// CREATE SERIES BOTTOM SHEET
// =============================================================================

function CreateSeriesSheet({
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
  const [selectedType, setSelectedType] = useState<SeriesType>('league');
  const [selectedLevel, setSelectedLevel] = useState<SeriesLevel>('college');
  const [defaults, setDefaults] = useState<Record<string, boolean>>(
    Object.fromEntries(CREATE_DEFAULTS_KEYS.map((k) => [k, CREATE_DEFAULTS[k]])),
  );

  const toggleDefault = useCallback((key: string) => {
    setDefaults((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <BottomSheet visible={visible} onClose={onClose} title="New Series" useModal>
      {/* Series Name */}
      <ThemedText style={[s.createLabel, { color: colors.text }]}>Series Name</ThemedText>
      <TextInput
        style={[
          s.createInput,
          {
            color: colors.text,
            backgroundColor: colors.backgroundTertiary,
            borderColor: colors.border,
          },
        ]}
        placeholder="Enter series name\u2026"
        placeholderTextColor={colors.textTertiary}
      />

      {/* Type picker */}
      <ThemedText style={[s.createLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Type
      </ThemedText>
      <View style={s.createPillRow}>
        {TYPE_OPTIONS.map((opt) => {
          const isActive = selectedType === opt.key;
          const tColor = TYPE_COLOR_MAP[opt.key];
          return (
            <Pressable
              key={opt.key}
              style={[
                s.createPill,
                {
                  backgroundColor: isActive ? tColor + '2E' : colors.backgroundTertiary,
                  borderColor: isActive ? tColor + '60' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedType(opt.key);
              }}
            >
              <ThemedText
                style={[
                  s.createPillText,
                  { color: isActive ? tColor : colors.textSecondary },
                ]}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Level picker */}
      <ThemedText style={[s.createLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Level
      </ThemedText>
      <View style={s.createPillRow}>
        {LEVEL_OPTIONS.map((opt) => {
          const isActive = selectedLevel === opt.key;
          const lColor = LEVEL_COLOR_MAP[opt.key];
          return (
            <Pressable
              key={opt.key}
              style={[
                s.createPill,
                {
                  backgroundColor: isActive ? lColor + '2E' : colors.backgroundTertiary,
                  borderColor: isActive ? lColor + '60' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedLevel(opt.key);
              }}
            >
              <ThemedText
                style={[
                  s.createPillText,
                  { color: isActive ? lColor : colors.textSecondary },
                ]}
              >
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Season Window (mock) */}
      <ThemedText style={[s.createLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Season Window
      </ThemedText>
      <View
        style={[
          s.createMockField,
          { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
        ]}
      >
        <ThemedText style={[s.createMockFieldText, { color: colors.textSecondary }]}>
          Jan 2026 {'\u2013'} Jun 2026
        </ThemedText>
      </View>

      {/* Ops Director (mock) */}
      <ThemedText style={[s.createLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Ops Director
      </ThemedText>
      <Pressable
        style={[
          s.createMockField,
          { backgroundColor: colors.backgroundTertiary, borderColor: colors.border },
        ]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <ThemedText style={[s.createMockFieldText, { color: colors.textTertiary }]}>
          Select ops director\u2026
        </ThemedText>
      </Pressable>

      {/* Defaults toggles */}
      <ThemedText style={[s.createLabel, { color: colors.text, marginTop: Spacing.md }]}>
        Defaults
      </ThemedText>
      {CREATE_DEFAULTS_KEYS.map((key) => (
        <View key={key} style={s.createDefaultRow}>
          <ThemedText style={[s.createDefaultLabel, { color: colors.textSecondary }]}>
            {CREATE_DEFAULTS_LABELS[key]}
          </ThemedText>
          <Switch
            value={defaults[key]}
            onValueChange={() => toggleDefault(key)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={defaults[key] ? accentColor : colors.textTertiary}
          />
        </View>
      ))}

      {/* Create button */}
      <Pressable
        style={[s.createSeriesButton, { backgroundColor: accentColor }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onClose();
        }}
      >
        <ThemedText style={s.createSeriesButtonText}>Create Series</ThemedText>
      </Pressable>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function OrgSeriesTab({ colors, accentColor }: Props) {
  // ── State ──
  const [activeScope, setActiveScope] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<SeriesFull | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const [filterSort, setFilterSort] = useState<SeriesFilterState['sort']>('upcoming');
  const [filterTypes, setFilterTypes] = useState<SeriesType[]>([]);
  const [filterLevels, setFilterLevels] = useState<SeriesLevel[]>([]);
  const [filterStatuses, setFilterStatuses] = useState<SeriesStatus[]>([]);

  // ── Derived data ──
  const processedSeries = useMemo(() => {
    const filtered = filterSeries(SERIES_LIST, search, activeScope, filterTypes, filterLevels, filterStatuses);
    return sortSeries(filtered, filterSort);
  }, [search, activeScope, filterTypes, filterLevels, filterStatuses, filterSort]);

  const handleApplyFilter = useCallback(
    (state: {
      sort: SeriesFilterState['sort'];
      types: SeriesType[];
      levels: SeriesLevel[];
      statuses: SeriesStatus[];
    }) => {
      setFilterSort(state.sort);
      setFilterTypes(state.types);
      setFilterLevels(state.levels);
      setFilterStatuses(state.statuses);
    },
    [],
  );

  // ── If series hub selected ──
  if (selectedSeries) {
    return (
      <SeriesHub
        series={selectedSeries}
        colors={colors}
        accentColor={accentColor}
        onBack={() => setSelectedSeries(null)}
      />
    );
  }

  // ── Directory view ──
  return (
    <View style={s.flex1}>
      <FlatList
        data={processedSeries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={s.headerArea}>
            {/* Row: Title + filter + new */}
            <View style={s.headerRow}>
              <ThemedText style={[s.headerTitle, { color: colors.text }]}>Series</ThemedText>
              <View style={s.headerActions}>
                <Pressable
                  style={[s.iconButton, { backgroundColor: colors.backgroundTertiary }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowFilter(true);
                  }}
                >
                  <IconSymbol name="slider.horizontal.3" size={16} color={colors.textSecondary} />
                </Pressable>
                <Pressable
                  style={[s.newButton, { backgroundColor: accentColor }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setShowCreate(true);
                  }}
                >
                  <IconSymbol name="plus" size={14} color="#000" />
                  <ThemedText style={s.newButtonText}>New Series</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Scope chip bar */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.scopeChipRow}
            >
              {SERIES_SCOPE_CHIPS.map((chip) => {
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
                      setActiveScope(chip.key);
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
                  placeholder="Search series\u2026"
                  placeholderTextColor={colors.textTertiary}
                  value={search}
                  onChangeText={setSearch}
                />
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <SeriesCard
            series={item}
            colors={colors}
            accentColor={accentColor}
            onPress={() => setSelectedSeries(item)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="sportscourt.fill"
            label="No series match your search"
            colors={colors}
          />
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
          types: filterTypes,
          levels: filterLevels,
          statuses: filterStatuses,
        }}
        onApply={handleApplyFilter}
      />
      <CreateSeriesSheet
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

  // ── Header area ──
  headerArea: {
    paddingTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
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

  // ── Scope chips ──
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

  // ── Search ──
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

  // ── Series card ──
  seriesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  logoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardMidColumn: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  seriesName: {
    fontSize: 17,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  currentStage: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  opsLine: {
    fontSize: 12,
    marginTop: 3,
  },
  compliancePulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  complianceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  compliancePulseText: {
    fontSize: 11,
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

  // ── Quick actions ──
  quickActionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  quickActionBtn: {
    paddingVertical: 4,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // ── List ──
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: 120,
  },

  // ── Tab pills ──
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
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

  // ── Series Hub ──
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
  hubLogoCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubLogoText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  hubHeaderInfo: {
    flex: 1,
  },
  hubHeaderName: {
    fontSize: 18,
    fontWeight: '700',
  },
  hubHeaderBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  hubSeasonWindow: {
    fontSize: 12,
    marginTop: 3,
  },
  hubActionsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  hubActionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  hubActionText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Hub tab content ──
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  hubCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  hubSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  hubBody: {
    fontSize: 14,
    lineHeight: 20,
  },

  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // Ops director
  opsDirectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  staffAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitials: {
    fontSize: 12,
    fontWeight: '700',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '600',
  },
  staffRole: {
    fontSize: 12,
  },

  // Schedule
  scheduleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  stageLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleDatetime: {
    fontSize: 13,
    marginBottom: 2,
  },
  scheduleMatchup: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  scheduleVenue: {
    fontSize: 12,
  },
  scheduleScore: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginTop: 4,
  },

  // Standings
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  standingsRank: {
    width: 24,
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  standingsDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  standingsName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  standingsRecord: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  standingsPct: {
    width: 44,
    fontSize: 13,
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },

  // Bracket
  bracketParticipantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  bracketSeed: {
    width: 28,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  bracketSeedPlaceholder: {
    width: 28,
  },

  // Participants
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  participantName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Venues
  venueName: {
    fontSize: 15,
    fontWeight: '600',
  },
  venueLocation: {
    fontSize: 13,
    marginTop: 2,
  },
  venueMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Staff
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  staffNameInline: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Rooms
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  roomTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  roomMemberCount: {
    fontSize: 12,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000',
  },

  // Media
  openMediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  openMediaText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Audit
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
  auditTextColumn: {
    flex: 1,
  },
  auditDescription: {
    fontSize: 14,
    fontWeight: '500',
  },
  auditMeta: {
    fontSize: 12,
    marginTop: 2,
  },

  // Settings
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  settingsButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Placeholder
  placeholderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  placeholderText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
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

  // ── Filter sheet ──
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

  // ── Create sheet ──
  createLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
  },
  createInput: {
    height: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
  },
  createPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  createPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  createPillText: {
    fontSize: 13,
    fontWeight: '600',
  },
  createMockField: {
    height: 40,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    justifyContent: 'center',
  },
  createMockFieldText: {
    fontSize: 14,
  },
  createDefaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  createDefaultLabel: {
    fontSize: 14,
    flex: 1,
    marginRight: Spacing.sm,
  },
  createSeriesButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  createSeriesButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
});
