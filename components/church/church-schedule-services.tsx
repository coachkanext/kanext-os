/**
 * Church Schedule — Services View
 *
 * All worship services for the active campus.
 * Single vertical scroll grouped by date.
 * Service rows: Time | Type chip | Title + Speaker + Location
 * SERVING badge if user is scheduled to serve.
 * Tap → Event Detail Sheet
 * Jump to This Week button
 *
 * Campus-scoped. Read-only. No inline editing.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, SectionList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { CHURCH_SERVICES, type ChurchService } from '@/data/mock-church-home';
import { ChurchEventDetailSheet } from '@/components/church/church-event-detail-sheet';
import type { ChurchEvent } from '@/data/mock-church-events';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type ServiceTypeLabel = 'Sunday Service' | 'Midweek Service' | 'Special Service';

interface ServiceRow {
  id: string;
  title: string;
  date: string;
  dateObj: Date;
  time: string;
  type: ChurchService['type'];
  typeLabel: ServiceTypeLabel;
  speaker: string;
  topic?: string;
  seriesName?: string;
  location: string;
  isServing: boolean;
  isLocked: boolean;
  raw: ChurchService;
}

interface DaySection {
  dayKey: string;
  dayLabel: string;
  data: ServiceRow[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_CONFIG: Record<ServiceTypeLabel, { color: string; icon: IconSymbolName }> = {
  'Sunday Service': { color: '#1A1714', icon: 'play.circle.fill' },
  'Midweek Service': { color: '#1A1714', icon: 'book.fill' },
  'Special Service': { color: '#B8943E', icon: 'star.fill' },
};

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Location map — services don't have location in ChurchService, derive from type
const SERVICE_LOCATIONS: Record<ChurchService['type'], string> = {
  sunday_morning: 'Main Sanctuary',
  sunday_evening: 'Main Sanctuary',
  midweek: 'Fellowship Hall',
  special: 'Main Sanctuary',
};

// Services with locked times (institutional lock)
const LOCKED_SERVICE_TYPES: Set<ChurchService['type']> = new Set([
  'sunday_morning',
  'midweek',
]);

// =============================================================================
// HELPERS
// =============================================================================

function getServiceTypeLabel(type: ChurchService['type']): ServiceTypeLabel {
  switch (type) {
    case 'sunday_morning':
    case 'sunday_evening':
      return 'Sunday Service';
    case 'midweek':
      return 'Midweek Service';
    case 'special':
      return 'Special Service';
  }
}

function parseDateString(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayLabel(d: Date): string {
  return `${DAY_NAMES[d.getDay()]} \u00B7 ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function getWeekKey(d: Date): string {
  // ISO week start (Monday-based, but we use Sunday for church)
  const sun = new Date(d);
  sun.setDate(sun.getDate() - sun.getDay());
  return getDayKey(sun);
}

/** Demo user serves as Children's Teacher during Sunday morning services */
function isUserServing(svc: ChurchService): boolean {
  return svc.type === 'sunday_morning' && svc.status === 'upcoming';
}

/** Convert ChurchService → ChurchEvent for the detail sheet */
function serviceToChurchEvent(svc: ChurchService): ChurchEvent {
  const dateObj = parseDateString(svc.date);
  // Parse the time string to build start/end dates
  const timeParts = svc.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
  let hours = 0;
  let minutes = 0;
  if (timeParts) {
    hours = parseInt(timeParts[1], 10);
    minutes = parseInt(timeParts[2], 10);
    if (timeParts[3].toUpperCase() === 'PM' && hours !== 12) hours += 12;
    if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
  }

  const startTime = new Date(dateObj);
  startTime.setHours(hours, minutes, 0, 0);
  const endTime = new Date(startTime);
  endTime.setHours(startTime.getHours() + 2); // default 2hr duration

  return {
    id: svc.id,
    orgId: 'org-icc',
    campusId: 'campus-kcc',
    campusName: '2819 Church',
    title: svc.topic ? `${svc.title} — ${svc.topic}` : svc.title,
    description: svc.topic
      ? `${svc.topic}${svc.seriesName ? ` (${svc.seriesName} Series)` : ''}\n\nSpeaker: ${svc.speaker}`
      : `Speaker: ${svc.speaker}`,
    startTime,
    endTime,
    location: SERVICE_LOCATIONS[svc.type],
    type: 'SERVICE',
    status: svc.status === 'upcoming' ? 'upcoming' : 'completed',
    rsvpEnabled: svc.type === 'special',
    visibilityScope: 'PUBLIC',
    isRecurring: svc.type === 'sunday_morning' || svc.type === 'midweek',
    seriesLabel: svc.seriesName ? `Part of ${svc.seriesName} Series` : undefined,
    organizer: svc.speaker,
  };
}

// =============================================================================
// DATA PIPELINE
// =============================================================================

function buildServiceSections(services: ChurchService[]): DaySection[] {
  // Filter to upcoming only (services view shows upcoming schedule)
  const upcoming = services.filter((s) => s.status === 'upcoming');

  // Convert to ServiceRow
  const rows: ServiceRow[] = upcoming.map((svc) => {
    const dateObj = parseDateString(svc.date);
    return {
      id: svc.id,
      title: svc.title,
      date: svc.date,
      dateObj,
      time: svc.time,
      type: svc.type,
      typeLabel: getServiceTypeLabel(svc.type),
      speaker: svc.speaker,
      topic: svc.topic,
      seriesName: svc.seriesName,
      location: SERVICE_LOCATIONS[svc.type],
      isServing: isUserServing(svc),
      isLocked: LOCKED_SERVICE_TYPES.has(svc.type),
      raw: svc,
    };
  });

  // Sort by date then time
  rows.sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

  // Group by day
  const dayMap = new Map<string, ServiceRow[]>();
  for (const row of rows) {
    const key = getDayKey(row.dateObj);
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(row);
  }

  const sections: DaySection[] = [];
  for (const [key, data] of dayMap) {
    sections.push({
      dayKey: key,
      dayLabel: getDayLabel(data[0].dateObj),
      data,
    });
  }

  return sections;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchScheduleServices({ colors, accent }: Props) {
  const [eventSheetVisible, setEventSheetVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const listRef = useRef<SectionList>(null);

  const sections = buildServiceSections(CHURCH_SERVICES);

  // Current week key for jump-to
  const thisWeekKey = getWeekKey(new Date());
  const todayKey = getDayKey(new Date());

  const jumpToThisWeek = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    const idx = sections.findIndex((s) => s.dayKey >= todayKey);
    if (idx >= 0) {
      listRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true });
    }
  }, [sections, todayKey]);

  const handleServiceTap = useCallback((row: ServiceRow) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    setSelectedEvent(serviceToChurchEvent(row.raw));
    setEventSheetVisible(true);
  }, []);

  const renderSectionHeader = useCallback(
    ({ section }: { section: DaySection }) => (
      <View style={[s.dayHeader, { backgroundColor: colors.background }]}>
        <ThemedText style={[s.dayHeaderText, { color: colors.text }]}>
          {section.dayLabel}
        </ThemedText>
      </View>
    ),
    [colors],
  );

  const renderItem = useCallback(
    ({ item }: { item: ServiceRow }) => {
      const typeConf = TYPE_CONFIG[item.typeLabel];
      return (
        <Pressable
          style={({ pressed }) => [
            s.serviceRow,
            { borderBottomColor: colors.border },
            pressed && { opacity: 0.6, backgroundColor: colors.backgroundSecondary },
          ]}
          onPress={() => handleServiceTap(item)}
        >
          {/* Left — Time */}
          <View style={s.timeCol}>
            <ThemedText style={[s.timeText, { color: colors.textSecondary }]}>
              {item.time}
            </ThemedText>
          </View>

          {/* Middle — Type chip */}
          <View style={[s.typeChip, { backgroundColor: typeConf.color + '18' }]}>
            <IconSymbol name={typeConf.icon} size={10} color={typeConf.color} />
            <ThemedText style={[s.typeLabel, { color: typeConf.color }]}>
              {item.typeLabel}
            </ThemedText>
          </View>

          {/* Right — Title + subline */}
          <View style={s.detailCol}>
            <View style={s.titleRow}>
              <ThemedText style={[s.serviceTitle, { color: colors.text }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              {item.isServing && (
                <View style={s.servingBadge}>
                  <ThemedText style={s.servingText}>SERVING</ThemedText>
                </View>
              )}
            </View>
            <View style={s.sublineRow}>
              <ThemedText style={[s.sublineText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.location}
              </ThemedText>
            </View>
            {item.speaker && (
              <ThemedText style={[s.speakerText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.speaker}
              </ThemedText>
            )}
            {item.topic && (
              <ThemedText style={[s.topicText, { color: accent }]} numberOfLines={1}>
                {item.topic}
              </ThemedText>
            )}
          </View>

          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </Pressable>
      );
    },
    [colors, accent, handleServiceTap],
  );

  const keyExtractor = useCallback((item: ServiceRow) => item.id, []);

  return (
    <ThemedView style={s.container}>
      {/* ── Jump to This Week ── */}
      <Pressable
        style={({ pressed }) => [
          s.jumpBtn,
          { backgroundColor: accent + '15' },
          pressed && { opacity: 0.7 },
        ]}
        onPress={jumpToThisWeek}
      >
        <IconSymbol name="arrow.down.to.line" size={12} color={accent} />
        <ThemedText style={[s.jumpText, { color: accent }]}>This Week</ThemedText>
      </Pressable>

      <SectionList
        ref={listRef}
        sections={sections}
        keyExtractor={keyExtractor}
        renderSectionHeader={renderSectionHeader as any}
        renderItem={renderItem as any}
        stickySectionHeadersEnabled
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={
          <View style={s.empty}>
            <IconSymbol name="play.circle.fill" size={32} color="#9C9790" />
            <ThemedText style={[s.emptyTitle, { color: colors.text }]}>No Services</ThemedText>
            <ThemedText style={[s.emptyDesc, { color: colors.textSecondary }]}>
              No upcoming services for your campus.
            </ThemedText>
          </View>
        }
      />

      {/* ── Event Detail Sheet ── */}
      <ChurchEventDetailSheet
        visible={eventSheetVisible}
        onClose={() => setEventSheetVisible(false)}
        event={selectedEvent}
        colors={colors}
        accent={accent}
      />
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: { flex: 1 },

  // Jump to This Week
  jumpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginRight: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  jumpText: { fontSize: 12, fontWeight: '700' },

  // List
  listContent: { paddingBottom: 80 },

  // Day header (sticky)
  dayHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  dayHeaderText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Service row
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },

  // Time column
  timeCol: { width: 72 },
  timeText: { fontSize: 12, fontWeight: '600', letterSpacing: -0.2 },

  // Type chip
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  typeLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Detail column
  detailCol: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  serviceTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2, flex: 1 },
  sublineRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  sublineText: { fontSize: 11, letterSpacing: 0.1 },
  speakerText: { fontSize: 11, letterSpacing: 0.1, marginTop: 1 },
  topicText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1, marginTop: 1 },

  // Serving badge
  servingBadge: {
    backgroundColor: '#5A8A6E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  servingText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.8,
  },

  // Empty state
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  emptyDesc: { fontSize: 13, textAlign: 'center', marginTop: 6 },
});
