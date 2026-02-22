/**
 * Competition Organization Series Tab — 10-tab Series Hub.
 * Dashboard, Active Series, Formats, Seasons, Entrants, Standings, Calendar, Awards, History, Settings.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, TextInput, Pressable, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import {
  COMP_SERIES_TABS,
  COMP_SERIES_SCOPE_CHIPS,
  SERIES_STATUS_COLOR,
  ENTRANT_STATUS_COLOR,
  SEASON_STATUS_COLOR,
  FORMAT_TYPE_LABEL,
  CALENDAR_EVENT_COLOR,
  AWARD_CATEGORY_COLOR,
  getCompSeriesData,
} from '@/data/mock-comp-org-series';
import type {
  CompSeriesTabId,
  SeriesDashboardBlock,
  ActiveSeries,
  SeriesFormat,
  Season,
  SeriesEntrant,
  StandingsEntry,
  CalendarEvent,
  Award,
  HistoryRecord,
  SeriesSettingToggle,
} from '@/data/mock-comp-org-series';

// =============================================================================
// PROPS
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function formDotColor(result: 'W' | 'L' | 'D'): string {
  switch (result) {
    case 'W': return '#22C55E';
    case 'L': return '#EF4444';
    case 'D': return '#A1A1AA';
  }
}

function calendarEventLabel(type: CalendarEvent['type']): string {
  switch (type) {
    case 'match': return 'MATCH';
    case 'ceremony': return 'CEREMONY';
    case 'deadline': return 'DEADLINE';
    case 'media': return 'MEDIA';
    case 'rest-day': return 'REST DAY';
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getCompSeriesData>;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Cards */}
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Overview</ThemedText>
      <View style={s.kpiGrid}>
        {data.dashboard.map((block: SeriesDashboardBlock) => (
          <View
            key={block.id}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={s.kpiHeader}>
              <IconSymbol name={block.icon as any} size={18} color={block.color} />
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>
                {block.label}
              </ThemedText>
            </View>
            <ThemedText style={[s.kpiValue, { color: colors.text }]}>{block.value}</ThemedText>
            <ThemedText style={[s.kpiDelta, { color: colors.textTertiary }]}>{block.delta}</ThemedText>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Quick Actions
      </ThemedText>
      <View style={s.quickActionsGrid}>
        {data.quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={[s.quickActionIconCircle, { backgroundColor: action.color + '18' }]}>
              <IconSymbol name={action.icon as any} size={20} color={action.color} />
            </View>
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]} numberOfLines={1}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {/* Recent Activity */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recent Activity
      </ThemedText>
      <View style={[s.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.recentActivity.map((item, index) => (
          <View
            key={item.id}
            style={[
              s.activityRow,
              index < data.recentActivity.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.activityDot, { backgroundColor: accentColor }]} />
            <View style={s.activityTextCol}>
              <ThemedText style={[s.activityText, { color: colors.text }]} numberOfLines={2}>
                {item.text}
              </ThemedText>
              <ThemedText style={[s.activityTime, { color: colors.textTertiary }]}>
                {item.time}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// ACTIVE SERIES TAB
// =============================================================================

function ActiveSeriesTab({
  colors,
  accentColor,
  data,
  onSelectSeries,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ActiveSeries[];
  onSelectSeries: (series: ActiveSeries) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = SERIES_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.seriesCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectSeries(item);
            }}
          >
            {/* Top row: name + status */}
            <View style={s.seriesCardTop}>
              <View style={s.seriesCardInfo}>
                <View style={[s.seriesLogoCircle, { backgroundColor: stColor + '30' }]}>
                  <ThemedText style={[s.seriesLogoText, { color: stColor }]}>
                    {item.shortName}
                  </ThemedText>
                </View>
                <View style={s.seriesCardMid}>
                  <ThemedText style={[s.seriesCardName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <View style={s.seriesCardBadgeRow}>
                    <StatusBadge label={item.format.toUpperCase()} color={accentColor} />
                    <StatusBadge label={item.status.toUpperCase()} color={stColor} />
                  </View>
                </View>
              </View>
            </View>

            {/* Details */}
            <View style={[s.seriesCardDetails, { borderTopColor: colors.border }]}>
              <View style={s.seriesDetailItem}>
                <ThemedText style={[s.seriesDetailValue, { color: colors.text }]}>
                  {item.entrantCount}
                </ThemedText>
                <ThemedText style={[s.seriesDetailLabel, { color: colors.textTertiary }]}>
                  Entrants
                </ThemedText>
              </View>
              <View style={s.seriesDetailItem}>
                <ThemedText style={[s.seriesDetailValue, { color: colors.text }]}>
                  {item.matchCount}
                </ThemedText>
                <ThemedText style={[s.seriesDetailLabel, { color: colors.textTertiary }]}>
                  Matches
                </ThemedText>
              </View>
              <View style={s.seriesDetailItem}>
                <ThemedText style={[s.seriesDetailValue, { color: colors.text }]}>
                  {item.prize}
                </ThemedText>
                <ThemedText style={[s.seriesDetailLabel, { color: colors.textTertiary }]}>
                  Prize
                </ThemedText>
              </View>
            </View>

            {/* Current round + dates */}
            <View style={s.seriesCardFooter}>
              <ThemedText style={[s.seriesRound, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.currentRound}
              </ThemedText>
              <ThemedText style={[s.seriesDates, { color: colors.textTertiary }]}>
                {item.startDate} \u2013 {item.endDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="sportscourt.fill" label="No active series" colors={colors} />
      }
    />
  );
}

// =============================================================================
// FORMATS TAB
// =============================================================================

function FormatsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: SeriesFormat[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const typeLabel = FORMAT_TYPE_LABEL[item.type];
        return (
          <View style={[s.formatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={s.formatHeader}>
              <ThemedText style={[s.formatName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <StatusBadge label={typeLabel.toUpperCase()} color={accentColor} />
            </View>
            <ThemedText style={[s.formatDescription, { color: colors.textSecondary }]}>
              {item.description}
            </ThemedText>
            <View style={[s.formatMeta, { borderTopColor: colors.border }]}>
              <View style={s.formatMetaItem}>
                <IconSymbol name="person.3.fill" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.formatMetaText, { color: colors.textSecondary }]}>
                  Max {item.maxEntrants}
                </ThemedText>
              </View>
              <View style={s.formatMetaItem}>
                <IconSymbol name="arrow.up.arrow.down" size={14} color={colors.textTertiary} />
                <ThemedText style={[s.formatMetaText, { color: colors.textSecondary }]}>
                  {item.tiebreakers.length} tiebreaker{item.tiebreakers.length !== 1 ? 's' : ''}
                </ThemedText>
              </View>
            </View>
            {/* Tiebreakers list */}
            <View style={s.tiebreakerList}>
              {item.tiebreakers.map((tb, idx) => (
                <View key={idx} style={s.tiebreakerRow}>
                  <ThemedText style={[s.tiebreakerIndex, { color: colors.textTertiary }]}>
                    {idx + 1}.
                  </ThemedText>
                  <ThemedText style={[s.tiebreakerText, { color: colors.textSecondary }]}>
                    {tb}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="rectangle.stack.fill" label="No formats configured" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SEASONS TAB
// =============================================================================

function SeasonsTab({
  colors,
  accentColor,
  data,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: Season[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = SEASON_STATUS_COLOR[item.status];
        return (
          <Pressable
            style={[s.seasonCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <View style={s.seasonCardTop}>
              <View style={s.seasonCardInfo}>
                <ThemedText style={[s.seasonYear, { color: accentColor }]}>
                  {item.year}
                </ThemedText>
                <ThemedText style={[s.seasonName, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
              </View>
              <StatusBadge label={item.status.toUpperCase()} color={stColor} />
            </View>
            <View style={[s.seasonCardBottom, { borderTopColor: colors.border }]}>
              <View style={s.seasonStat}>
                <ThemedText style={[s.seasonStatValue, { color: colors.text }]}>
                  {item.seriesCount}
                </ThemedText>
                <ThemedText style={[s.seasonStatLabel, { color: colors.textTertiary }]}>
                  Series
                </ThemedText>
              </View>
              <ThemedText style={[s.seasonDates, { color: colors.textSecondary }]}>
                {item.startDate} \u2013 {item.endDate}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="calendar" label="No seasons found" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ENTRANTS TAB
// =============================================================================

function EntrantsTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: SeriesEntrant[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => {
        const stColor = ENTRANT_STATUS_COLOR[item.status];
        return (
          <View style={[s.entrantRow, { borderBottomColor: colors.border }]}>
            {/* Seed */}
            <ThemedText style={[s.entrantSeed, { color: colors.textTertiary }]}>
              #{item.seed}
            </ThemedText>

            {/* Name + short */}
            <View style={s.entrantNameCol}>
              <ThemedText style={[s.entrantName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.entrantShort, { color: colors.textTertiary }]}>
                {item.shortName}
              </ThemedText>
            </View>

            {/* Record */}
            <View style={s.entrantRecordCol}>
              <ThemedText style={[s.entrantRecord, { color: colors.text }]}>
                {item.wins}-{item.losses}-{item.draws}
              </ThemedText>
              <ThemedText style={[s.entrantPoints, { color: colors.textSecondary }]}>
                {item.points} pts
              </ThemedText>
            </View>

            {/* GD */}
            <ThemedText
              style={[
                s.entrantGD,
                { color: item.gd > 0 ? '#22C55E' : item.gd < 0 ? '#EF4444' : colors.textTertiary },
              ]}
            >
              {item.gd > 0 ? '+' : ''}{item.gd}
            </ThemedText>

            {/* Status */}
            <StatusBadge label={item.status.toUpperCase()} color={stColor} />
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="person.3.fill" label="No entrants registered" colors={colors} />
      }
    />
  );
}

// =============================================================================
// STANDINGS TAB
// =============================================================================

function StandingsTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: StandingsEntry[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={[s.standingsHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.standingsHeaderRank, { color: colors.textTertiary }]}>#</ThemedText>
          <ThemedText style={[s.standingsHeaderName, { color: colors.textTertiary }]}>Team</ThemedText>
          <ThemedText style={[s.standingsHeaderStat, { color: colors.textTertiary }]}>W</ThemedText>
          <ThemedText style={[s.standingsHeaderStat, { color: colors.textTertiary }]}>L</ThemedText>
          <ThemedText style={[s.standingsHeaderStat, { color: colors.textTertiary }]}>D</ThemedText>
          <ThemedText style={[s.standingsHeaderStat, { color: colors.textTertiary }]}>Pts</ThemedText>
          <ThemedText style={[s.standingsHeaderStat, { color: colors.textTertiary }]}>GD</ThemedText>
          <ThemedText style={[s.standingsHeaderForm, { color: colors.textTertiary }]}>Form</ThemedText>
          <ThemedText style={[s.standingsHeaderStreak, { color: colors.textTertiary }]}>Str</ThemedText>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[s.standingsRow, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.standingsRank, { color: colors.textSecondary }]}>
            {item.rank}
          </ThemedText>
          <ThemedText style={[s.standingsName, { color: colors.text }]} numberOfLines={1}>
            {item.shortName}
          </ThemedText>
          <ThemedText style={[s.standingsStat, { color: colors.text }]}>{item.wins}</ThemedText>
          <ThemedText style={[s.standingsStat, { color: colors.text }]}>{item.losses}</ThemedText>
          <ThemedText style={[s.standingsStat, { color: colors.text }]}>{item.draws}</ThemedText>
          <ThemedText style={[s.standingsPts, { color: colors.text }]}>{item.points}</ThemedText>
          <ThemedText
            style={[
              s.standingsGD,
              { color: item.gd > 0 ? '#22C55E' : item.gd < 0 ? '#EF4444' : colors.textTertiary },
            ]}
          >
            {item.gd > 0 ? '+' : ''}{item.gd}
          </ThemedText>
          <View style={s.formDotsContainer}>
            {item.form.map((result, idx) => (
              <View
                key={idx}
                style={[s.formDot, { backgroundColor: formDotColor(result) }]}
              />
            ))}
          </View>
          <ThemedText style={[s.standingsStreak, { color: colors.textSecondary }]}>
            {item.streak}
          </ThemedText>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="tablecells.fill" label="No standings data" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CALENDAR TAB
// =============================================================================

function CalendarTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: CalendarEvent[];
}) {
  // Group by date
  const grouped = useMemo(() => {
    const groups: { date: string; events: CalendarEvent[] }[] = [];
    let currentDate = '';
    data.forEach((event) => {
      if (event.date !== currentDate) {
        currentDate = event.date;
        groups.push({ date: currentDate, events: [event] });
      } else {
        groups[groups.length - 1].events.push(event);
      }
    });
    return groups;
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.date}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => (
        <View style={s.calendarGroup}>
          {/* Date header */}
          <View style={s.calendarDateHeader}>
            <View style={[s.calendarDateBadge, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.calendarDateText, { color: colors.text }]}>
                {formatDate(group.date)}
              </ThemedText>
            </View>
          </View>
          {/* Events */}
          {group.events.map((event, idx) => {
            const evColor = CALENDAR_EVENT_COLOR[event.type];
            return (
              <View
                key={event.id}
                style={[
                  s.calendarEventCard,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  idx < group.events.length - 1 && { marginBottom: Spacing.sm },
                ]}
              >
                <View style={[s.calendarEventStripe, { backgroundColor: evColor }]} />
                <View style={s.calendarEventContent}>
                  <View style={s.calendarEventTop}>
                    <ThemedText style={[s.calendarEventTitle, { color: colors.text }]} numberOfLines={1}>
                      {event.title}
                    </ThemedText>
                    <StatusBadge label={calendarEventLabel(event.type)} color={evColor} />
                  </View>
                  <ThemedText style={[s.calendarEventSeries, { color: colors.textSecondary }]}>
                    {event.series}
                  </ThemedText>
                  {event.venue !== '\u2014' && (
                    <View style={s.calendarVenueRow}>
                      <IconSymbol name="mappin.and.ellipse" size={12} color={colors.textTertiary} />
                      <ThemedText style={[s.calendarVenueText, { color: colors.textTertiary }]}>
                        {event.venue}
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="calendar" label="No events scheduled" colors={colors} />
      }
    />
  );
}

// =============================================================================
// AWARDS TAB
// =============================================================================

function AwardsTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: Award[];
}) {
  // Group by category
  const grouped = useMemo(() => {
    const categories: Award['category'][] = ['individual', 'team', 'special'];
    return categories.map((cat) => ({
      category: cat,
      awards: data.filter((a) => a.category === cat),
    })).filter((g) => g.awards.length > 0);
  }, [data]);

  return (
    <FlatList
      data={grouped}
      keyExtractor={(item) => item.category}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item: group }) => {
        const catColor = AWARD_CATEGORY_COLOR[group.category];
        const catLabel = group.category === 'individual' ? 'Individual Awards'
          : group.category === 'team' ? 'Team Awards'
          : 'Special Awards';
        return (
          <View style={s.awardGroup}>
            <View style={s.awardGroupHeader}>
              <View style={[s.awardCategoryDot, { backgroundColor: catColor }]} />
              <ThemedText style={[s.awardGroupTitle, { color: colors.text }]}>
                {catLabel}
              </ThemedText>
              <ThemedText style={[s.awardGroupCount, { color: colors.textTertiary }]}>
                {group.awards.length}
              </ThemedText>
            </View>
            {group.awards.map((award) => (
              <View
                key={award.id}
                style={[s.awardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.awardCardTop}>
                  <View style={[s.awardIconCircle, { backgroundColor: catColor + '18' }]}>
                    <IconSymbol name="crown.fill" size={16} color={catColor} />
                  </View>
                  <View style={s.awardCardInfo}>
                    <ThemedText style={[s.awardName, { color: colors.text }]} numberOfLines={1}>
                      {award.name}
                    </ThemedText>
                    <ThemedText style={[s.awardRecipient, { color: colors.textSecondary }]} numberOfLines={1}>
                      {award.recipient}
                    </ThemedText>
                  </View>
                </View>
                <View style={s.awardCardMeta}>
                  <ThemedText style={[s.awardSeries, { color: colors.textTertiary }]}>
                    {award.series}
                  </ThemedText>
                  <ThemedText style={[s.awardDate, { color: colors.textTertiary }]}>
                    {award.date}
                  </ThemedText>
                </View>
                <ThemedText style={[s.awardSeason, { color: colors.textTertiary }]}>
                  {award.season}
                </ThemedText>
              </View>
            ))}
          </View>
        );
      }}
      ListEmptyComponent={
        <EmptyState icon="crown.fill" label="No awards recorded" colors={colors} />
      }
    />
  );
}

// =============================================================================
// HISTORY TAB
// =============================================================================

function HistoryTab({
  colors,
  data,
}: {
  colors: typeof Colors.light;
  data: HistoryRecord[];
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.historyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.historySeason, { color: colors.text }]}>{item.season}</ThemedText>

          <View style={s.historyRow}>
            <View style={s.historyItem}>
              <IconSymbol name="crown.fill" size={14} color="#F59E0B" />
              <View style={s.historyItemText}>
                <ThemedText style={[s.historyLabel, { color: colors.textTertiary }]}>
                  Champion
                </ThemedText>
                <ThemedText style={[s.historyValue, { color: colors.text }]} numberOfLines={1}>
                  {item.champion}
                </ThemedText>
              </View>
            </View>
            <View style={s.historyItem}>
              <IconSymbol name="star.fill" size={14} color="#A1A1AA" />
              <View style={s.historyItemText}>
                <ThemedText style={[s.historyLabel, { color: colors.textTertiary }]}>
                  Runner-Up
                </ThemedText>
                <ThemedText style={[s.historyValue, { color: colors.text }]} numberOfLines={1}>
                  {item.runnerUp}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={s.historyRow}>
            <View style={s.historyItem}>
              <IconSymbol name="person.fill" size={14} color={ACCENT} />
              <View style={s.historyItemText}>
                <ThemedText style={[s.historyLabel, { color: colors.textTertiary }]}>
                  MVP
                </ThemedText>
                <ThemedText style={[s.historyValue, { color: colors.text }]} numberOfLines={1}>
                  {item.mvp}
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={[s.historyStats, { borderTopColor: colors.border }]}>
            <View style={s.historyStatItem}>
              <ThemedText style={[s.historyStatNumber, { color: colors.text }]}>
                {item.totalMatches}
              </ThemedText>
              <ThemedText style={[s.historyStatLabel, { color: colors.textTertiary }]}>
                Matches
              </ThemedText>
            </View>
            <View style={s.historyStatItem}>
              <ThemedText style={[s.historyStatNumber, { color: colors.text }]}>
                {item.totalGoals}
              </ThemedText>
              <ThemedText style={[s.historyStatLabel, { color: colors.textTertiary }]}>
                Goals
              </ThemedText>
            </View>
            <View style={s.historyStatItem}>
              <ThemedText style={[s.historyStatNumber, { color: colors.text }]}>
                {item.totalMatches > 0 ? (item.totalGoals / item.totalMatches).toFixed(1) : '0.0'}
              </ThemedText>
              <ThemedText style={[s.historyStatLabel, { color: colors.textTertiary }]}>
                Goals/Match
              </ThemedText>
            </View>
          </View>
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="clock.fill" label="No history records" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SETTINGS TAB
// =============================================================================

function SettingsTab({
  colors,
  accentColor,
  data,
  onToggle,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: SeriesSettingToggle[];
  onToggle: (id: string) => void;
}) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <View style={[s.settingRow, { borderBottomColor: colors.border }]}>
          <View style={s.settingInfo}>
            <ThemedText style={[s.settingLabel, { color: colors.text }]}>{item.label}</ThemedText>
            <ThemedText style={[s.settingDescription, { color: colors.textTertiary }]}>
              {item.description}
            </ThemedText>
          </View>
          <Switch
            value={item.enabled}
            onValueChange={() => onToggle(item.id)}
            trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
            thumbColor={item.enabled ? accentColor : colors.textTertiary}
          />
        </View>
      )}
      ListEmptyComponent={
        <EmptyState icon="gear" label="No settings available" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SERIES DETAIL BOTTOM SHEET
// =============================================================================

function SeriesDetailSheet({
  visible,
  onClose,
  series,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  series: ActiveSeries | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!series) return null;

  const stColor = SERIES_STATUS_COLOR[series.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={series.name} useModal>
      {/* Status + format */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={series.status.toUpperCase()} color={stColor} />
        <StatusBadge label={series.format.toUpperCase()} color={accentColor} />
      </View>

      {/* KPIs */}
      <View style={[s.sheetKpiRow, { borderColor: colors.border }]}>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{series.entrantCount}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Entrants</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{series.matchCount}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Matches</ThemedText>
        </View>
        <View style={s.sheetKpiItem}>
          <ThemedText style={[s.sheetKpiValue, { color: colors.text }]}>{series.prize}</ThemedText>
          <ThemedText style={[s.sheetKpiLabel, { color: colors.textTertiary }]}>Prize</ThemedText>
        </View>
      </View>

      {/* Current round */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Current Round</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {series.currentRound}
        </ThemedText>
      </View>

      {/* Dates */}
      <View style={[s.sheetSection, { borderColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Schedule</ThemedText>
        <ThemedText style={[s.sheetSectionBody, { color: colors.textSecondary }]}>
          {series.startDate} \u2013 {series.endDate}
        </ThemedText>
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetActionButton, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onClose();
          }}
        >
          <ThemedText style={s.sheetActionButtonText}>View Full Series</ThemedText>
        </Pressable>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>
            Dismiss
          </ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompSeriesV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompSeriesTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeries, setSelectedSeries] = useState<ActiveSeries | null>(null);
  const [showSeriesDetail, setShowSeriesDetail] = useState(false);

  // Settings state (local toggle tracking)
  const [settingOverrides, setSettingOverrides] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_SERIES_SCOPE_CHIPS[activeScope] ?? 'All Series';
  const data = useMemo(() => getCompSeriesData(scopeLabel), [scopeLabel]);

  // Settings with overrides applied
  const settingsWithOverrides = useMemo(() => {
    return data.settings.map((setting) => ({
      ...setting,
      enabled: settingOverrides[setting.id] !== undefined
        ? settingOverrides[setting.id]
        : setting.enabled,
    }));
  }, [data.settings, settingOverrides]);

  // === Filtered data based on search ===
  const filteredActiveSeries = useMemo(() => {
    if (!searchQuery.trim()) return data.activeSeries;
    const q = searchQuery.toLowerCase();
    return data.activeSeries.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.shortName.toLowerCase().includes(q) ||
        s.format.toLowerCase().includes(q),
    );
  }, [data.activeSeries, searchQuery]);

  const filteredEntrants = useMemo(() => {
    if (!searchQuery.trim()) return data.entrants;
    const q = searchQuery.toLowerCase();
    return data.entrants.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q),
    );
  }, [data.entrants, searchQuery]);

  const filteredStandings = useMemo(() => {
    if (!searchQuery.trim()) return data.standings;
    const q = searchQuery.toLowerCase();
    return data.standings.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.shortName.toLowerCase().includes(q),
    );
  }, [data.standings, searchQuery]);

  const filteredCalendar = useMemo(() => {
    if (!searchQuery.trim()) return data.calendar;
    const q = searchQuery.toLowerCase();
    return data.calendar.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        e.series.toLowerCase().includes(q) ||
        e.venue.toLowerCase().includes(q),
    );
  }, [data.calendar, searchQuery]);

  const filteredAwards = useMemo(() => {
    if (!searchQuery.trim()) return data.awards;
    const q = searchQuery.toLowerCase();
    return data.awards.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.recipient.toLowerCase().includes(q) ||
        a.series.toLowerCase().includes(q),
    );
  }, [data.awards, searchQuery]);

  const filteredFormats = useMemo(() => {
    if (!searchQuery.trim()) return data.formats;
    const q = searchQuery.toLowerCase();
    return data.formats.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.type.toLowerCase().includes(q) ||
        f.description.toLowerCase().includes(q),
    );
  }, [data.formats, searchQuery]);

  const filteredSeasons = useMemo(() => {
    if (!searchQuery.trim()) return data.seasons;
    const q = searchQuery.toLowerCase();
    return data.seasons.filter(
      (sn) =>
        sn.name.toLowerCase().includes(q) ||
        String(sn.year).includes(q),
    );
  }, [data.seasons, searchQuery]);

  const filteredHistory = useMemo(() => {
    if (!searchQuery.trim()) return data.history;
    const q = searchQuery.toLowerCase();
    return data.history.filter(
      (h) =>
        h.season.toLowerCase().includes(q) ||
        h.champion.toLowerCase().includes(q) ||
        h.runnerUp.toLowerCase().includes(q) ||
        h.mvp.toLowerCase().includes(q),
    );
  }, [data.history, searchQuery]);

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompSeriesTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleSelectSeries = useCallback((series: ActiveSeries) => {
    setSelectedSeries(series);
    setShowSeriesDetail(true);
  }, []);

  const handleToggleSetting = useCallback((id: string) => {
    setSettingOverrides((prev) => {
      const currentVal = prev[id] !== undefined
        ? prev[id]
        : data.settings.find((s) => s.id === id)?.enabled ?? false;
      return { ...prev, [id]: !currentVal };
    });
  }, [data.settings]);

  // === Tab content renderer ===
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab colors={colors} accentColor={accentColor} data={data} />;
      case 'active-series':
        return (
          <ActiveSeriesTab
            colors={colors}
            accentColor={accentColor}
            data={filteredActiveSeries}
            onSelectSeries={handleSelectSeries}
          />
        );
      case 'formats':
        return <FormatsTab colors={colors} accentColor={accentColor} data={filteredFormats} />;
      case 'seasons':
        return <SeasonsTab colors={colors} accentColor={accentColor} data={filteredSeasons} />;
      case 'entrants':
        return <EntrantsTab colors={colors} data={filteredEntrants} />;
      case 'standings':
        return <StandingsTab colors={colors} data={filteredStandings} />;
      case 'calendar':
        return <CalendarTab colors={colors} data={filteredCalendar} />;
      case 'awards':
        return <AwardsTab colors={colors} data={filteredAwards} />;
      case 'history':
        return <HistoryTab colors={colors} data={filteredHistory} />;
      case 'settings':
        return (
          <SettingsTab
            colors={colors}
            accentColor={accentColor}
            data={settingsWithOverrides}
            onToggle={handleToggleSetting}
          />
        );
      default:
        return null;
    }
  };

  // === Render ===
  return (
    <View style={s.container}>
      {/* Sub-tab pill bar */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.tabPillRow}
      >
        {COMP_SERIES_TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                s.tabPill,
                { backgroundColor: isActive ? accentColor : colors.backgroundTertiary },
              ]}
              onPress={() => handleTabPress(tab.id)}
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

      {/* Scope chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.scopeChipRow}
      >
        {COMP_SERIES_SCOPE_CHIPS.map((chip, index) => {
          const isActive = index === activeScope;
          return (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                { backgroundColor: isActive ? accentColor + '20' : colors.backgroundTertiary },
                isActive && { borderColor: accentColor, borderWidth: 1 },
              ]}
              onPress={() => handleScopePress(index)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: isActive ? accentColor : colors.textSecondary },
                ]}
              >
                {chip}
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
            placeholder="Search\u2026"
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={8}
            >
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Tab content */}
      <View style={s.contentContainer}>
        {renderTabContent()}
      </View>

      {/* Series Detail Bottom Sheet */}
      <SeriesDetailSheet
        visible={showSeriesDetail}
        onClose={() => setShowSeriesDetail(false)}
        series={selectedSeries}
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
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
  },

  // ── Tab pills ──
  tabPillRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
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

  // ── Scope chips ──
  scopeChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 12,
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

  // ── Tab scroll containers ──
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // ── Section titles ──
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },

  // ── Badges ──
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

  // ── Empty state ──
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // ── Dashboard: KPI ──
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiCard: {
    width: '48%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    flexGrow: 1,
    flexBasis: '46%',
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  kpiLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiDelta: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Dashboard: Quick Actions ──
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 80,
  },
  quickActionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Dashboard: Activity ──
  activityCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
  },
  activityTextCol: {
    flex: 1,
  },
  activityText: {
    fontSize: 13,
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Active Series ──
  seriesCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  seriesCardTop: {
    padding: Spacing.md,
  },
  seriesCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  seriesLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesLogoText: {
    fontSize: 12,
    fontWeight: '700',
  },
  seriesCardMid: {
    flex: 1,
  },
  seriesCardName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  seriesCardBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  seriesCardDetails: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  seriesDetailItem: {
    flex: 1,
    alignItems: 'center',
  },
  seriesDetailValue: {
    fontSize: 16,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  seriesDetailLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  seriesCardFooter: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  seriesRound: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  seriesDates: {
    fontSize: 12,
    marginTop: 2,
  },

  // ── Formats ──
  formatCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  formatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  formatName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: Spacing.sm,
  },
  formatDescription: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: Spacing.sm,
  },
  formatMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  formatMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  formatMetaText: {
    fontSize: 12,
  },
  tiebreakerList: {
    paddingLeft: 4,
  },
  tiebreakerRow: {
    flexDirection: 'row',
    gap: 6,
    paddingVertical: 2,
  },
  tiebreakerIndex: {
    fontSize: 12,
    fontWeight: '600',
    width: 18,
    textAlign: 'right',
  },
  tiebreakerText: {
    fontSize: 12,
    flex: 1,
  },

  // ── Seasons ──
  seasonCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  seasonCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  seasonCardInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  seasonYear: {
    fontSize: 24,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  seasonName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  seasonCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  seasonStat: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  seasonStatValue: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  seasonStatLabel: {
    fontSize: 12,
  },
  seasonDates: {
    fontSize: 12,
  },

  // ── Entrants ──
  entrantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  entrantSeed: {
    width: 28,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
  entrantNameCol: {
    flex: 1,
  },
  entrantName: {
    fontSize: 14,
    fontWeight: '500',
  },
  entrantShort: {
    fontSize: 11,
    marginTop: 1,
  },
  entrantRecordCol: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  entrantRecord: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  entrantPoints: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    marginTop: 1,
  },
  entrantGD: {
    width: 30,
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'right',
  },

  // ── Standings ──
  standingsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
    gap: 2,
  },
  standingsHeaderRank: {
    width: 24,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  standingsHeaderName: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
  },
  standingsHeaderStat: {
    width: 26,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  standingsHeaderForm: {
    width: 56,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  standingsHeaderStreak: {
    width: 28,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  standingsRank: {
    width: 24,
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  standingsName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
  },
  standingsStat: {
    width: 26,
    fontSize: 12,
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  standingsPts: {
    width: 26,
    fontSize: 12,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  standingsGD: {
    width: 26,
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
  formDotsContainer: {
    flexDirection: 'row',
    width: 56,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  formDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  standingsStreak: {
    width: 28,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },

  // ── Calendar ──
  calendarGroup: {
    marginBottom: Spacing.md,
  },
  calendarDateHeader: {
    marginBottom: Spacing.sm,
  },
  calendarDateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
  },
  calendarDateText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calendarEventCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  calendarEventStripe: {
    width: 4,
  },
  calendarEventContent: {
    flex: 1,
    padding: Spacing.sm,
  },
  calendarEventTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  calendarEventTitle: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: Spacing.sm,
  },
  calendarEventSeries: {
    fontSize: 12,
    marginBottom: 2,
  },
  calendarVenueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calendarVenueText: {
    fontSize: 11,
  },

  // ── Awards ──
  awardGroup: {
    marginBottom: Spacing.lg,
  },
  awardGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  awardCategoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  awardGroupTitle: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  awardGroupCount: {
    fontSize: 13,
    fontWeight: '600',
  },
  awardCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  awardCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 6,
  },
  awardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  awardCardInfo: {
    flex: 1,
  },
  awardName: {
    fontSize: 14,
    fontWeight: '600',
  },
  awardRecipient: {
    fontSize: 13,
    marginTop: 1,
  },
  awardCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  awardSeries: {
    fontSize: 12,
  },
  awardDate: {
    fontSize: 12,
  },
  awardSeason: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── History ──
  historyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  historySeason: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  historyRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    flex: 1,
  },
  historyItemText: {
    flex: 1,
  },
  historyLabel: {
    fontSize: 11,
  },
  historyValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  historyStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  historyStatItem: {
    alignItems: 'center',
  },
  historyStatNumber: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  historyStatLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // ── Settings ──
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 17,
  },

  // ── Series Detail Sheet ──
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sheetKpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  sheetKpiItem: {
    alignItems: 'center',
  },
  sheetKpiValue: {
    fontSize: 20,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  sheetKpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  sheetSection: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  sheetSectionBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  sheetActionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  sheetActionButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
