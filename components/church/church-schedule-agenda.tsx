/**
 * Church Schedule — Agenda View
 *
 * Single vertical scroll grouped by day.
 * Sticky day headers: DAY · MMM D
 * Event rows: Time | Type chip | Title + Location + Ministry
 * Tap → Event Detail Sheet
 * Jump to Today button
 *
 * Campus-scoped. Ministry-membership filtered.
 * No inline editing — Nexus is the only write surface.
 */

import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, Pressable, SectionList } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ImpactFeedbackStyle } from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing } from '@/constants/theme';
import {
  CHURCH_CALENDAR_EVENTS,
  type ProgramCalendarEvent,
} from '@/data/mock-church-home';
import { ChurchEventDetailSheet } from '@/components/church/church-event-detail-sheet';
import { getEnrichedEvent, fromCalendarEvent, type ChurchEvent } from '@/data/mock-church-events';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accent: string;
}

type AgendaEventType = 'SERVICE' | 'MINISTRY' | 'OUTREACH' | 'MEETING' | 'OTHER';

interface AgendaEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  location: string;
  type: AgendaEventType;
  ministryName?: string;
  isAllDay?: boolean;
  calendarEvent: ProgramCalendarEvent;
}

interface DaySection {
  dayKey: string;
  dayLabel: string; // e.g. "SUN · Mar 3"
  data: AgendaEvent[];
}

// =============================================================================
// CONSTANTS
// =============================================================================

const TYPE_CONFIG: Record<AgendaEventType, { label: string; color: string; icon: IconSymbolName }> = {
  SERVICE: { label: 'Service', color: '#1A1714', icon: 'play.circle.fill' },
  MINISTRY: { label: 'Ministry', color: '#5A8A6E', icon: 'heart.fill' },
  OUTREACH: { label: 'Outreach', color: '#B8943E', icon: 'hand.raised.fill' },
  MEETING: { label: 'Meeting', color: '#1A1714', icon: 'person.3.fill' },
  OTHER: { label: 'Event', color: '#9C9790', icon: 'calendar' },
};

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// =============================================================================
// HELPERS — TYPE CLASSIFICATION
// =============================================================================

function classifyEvent(ce: ProgramCalendarEvent): AgendaEventType {
  const t = ce.title.toLowerCase();
  if (t.includes('worship') || t.includes('bible study') || t.includes('baptism') || t.includes('prayer') || t.includes('good friday') || t.includes('easter sunday') || t.includes('peniel') || t.includes('fasting')) return 'SERVICE';
  if (t.includes('outreach') || t.includes('community outreach')) return 'OUTREACH';
  if (t.includes('kingdom builders') || t.includes('connect group leaders')) return 'MEETING';
  if (t.includes('catalyst') || t.includes('formation kids') || t.includes('ignite') || t.includes('single') || t.includes('choir') || t.includes('rooted') || t.includes('rhythms') || t.includes('serve')) return 'MINISTRY';
  return 'OTHER';
}

function getMinistryName(ce: ProgramCalendarEvent): string | undefined {
  const t = ce.title.toLowerCase();
  if (t.includes('catalyst')) return 'Catalyst Youth';
  if (t.includes('formation kids')) return 'Formation Kids';
  if (t.includes('ignite')) return 'Ignite Youth';
  if (t.includes('single')) return 'Single & Purposeful';
  if (t.includes('choir') || t.includes('worship team')) return 'Worship Team';
  if (t.includes('rooted')) return 'Rooted';
  if (t.includes('outreach')) return 'Outreach & Evangelism';
  if (t.includes('kingdom builders')) return 'Kingdom Builders';
  if (t.includes('connect group')) return 'Connect Groups';
  if (t.includes('prayer')) return 'SATURATE';
  return undefined;
}

// =============================================================================
// HELPERS — DATE FORMATTING
// =============================================================================

function getDayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getDayLabel(d: Date): string {
  return `${DAY_NAMES[d.getDay()]} \u00B7 ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function formatTime(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? 'p' : 'a';
  const hr = h % 12 || 12;
  return m === 0 ? `${hr}${ampm}` : `${hr}:${String(m).padStart(2, '0')}${ampm}`;
}

function formatTimeRange(start: Date, end: Date): string {
  return `${formatTime(start)}\u2013${formatTime(end)}`;
}

// =============================================================================
// DATA PIPELINE
// =============================================================================

function buildAgendaSections(events: ProgramCalendarEvent[]): DaySection[] {
  // Filter to public events only (campus-scoped in v1 — all campus-kcc)
  const visible = events.filter((e) => e.visibilityScope === 'all_program');

  // Convert to AgendaEvent
  const agendaEvents: AgendaEvent[] = visible.map((ce) => ({
    id: ce.id,
    title: ce.title,
    startTime: ce.startDatetime,
    endTime: ce.endDatetime,
    location: ce.location || '',
    type: classifyEvent(ce),
    ministryName: getMinistryName(ce),
    calendarEvent: ce,
  }));

  // Sort by start time
  agendaEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Group by day
  const dayMap = new Map<string, AgendaEvent[]>();
  for (const ev of agendaEvents) {
    const key = getDayKey(ev.startTime);
    if (!dayMap.has(key)) dayMap.set(key, []);
    dayMap.get(key)!.push(ev);
  }

  // Convert to sections
  const sections: DaySection[] = [];
  for (const [key, data] of dayMap) {
    sections.push({
      dayKey: key,
      dayLabel: getDayLabel(data[0].startTime),
      data,
    });
  }

  return sections;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function ChurchScheduleAgenda({ colors, accent }: Props) {
  const [eventSheetVisible, setEventSheetVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ChurchEvent | null>(null);
  const listRef = useRef<SectionList>(null);

  const sections = buildAgendaSections(CHURCH_CALENDAR_EVENTS);

  // Find the section index closest to today
  const todayKey = getDayKey(new Date());

  const jumpToToday = useCallback(() => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    // Find first section that is today or in the future
    const idx = sections.findIndex((s) => s.dayKey >= todayKey);
    if (idx >= 0) {
      listRef.current?.scrollToLocation({ sectionIndex: idx, itemIndex: 0, animated: true });
    }
  }, [sections, todayKey]);

  const handleEventTap = useCallback((ev: AgendaEvent) => {
    Haptics.impactAsync(ImpactFeedbackStyle.Light);
    const enriched = getEnrichedEvent(ev.id) || fromCalendarEvent(ev.calendarEvent);
    setSelectedEvent(enriched);
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
    ({ item }: { item: AgendaEvent }) => {
      const typeConf = TYPE_CONFIG[item.type];
      return (
        <Pressable
          style={({ pressed }) => [
            s.eventRow,
            { borderBottomColor: colors.border },
            pressed && { opacity: 0.6, backgroundColor: colors.backgroundSecondary },
          ]}
          onPress={() => handleEventTap(item)}
        >
          {/* Left — Time */}
          <View style={s.timeCol}>
            <ThemedText style={[s.timeText, { color: colors.textSecondary }]}>
              {formatTimeRange(item.startTime, item.endTime)}
            </ThemedText>
          </View>

          {/* Middle — Type chip */}
          <View style={[s.typeChip, { backgroundColor: typeConf.color + '18' }]}>
            <IconSymbol name={typeConf.icon} size={10} color={typeConf.color} />
            <ThemedText style={[s.typeLabel, { color: typeConf.color }]}>
              {typeConf.label}
            </ThemedText>
          </View>

          {/* Right — Title + subline */}
          <View style={s.detailCol}>
            <ThemedText style={[s.eventTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            <View style={s.sublineRow}>
              {item.location ? (
                <ThemedText style={[s.sublineText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {item.location}
                </ThemedText>
              ) : null}
              {item.ministryName && (
                <ThemedText style={[s.ministryTag, { color: accent }]} numberOfLines={1}>
                  {item.ministryName}
                </ThemedText>
              )}
            </View>
          </View>

          <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
        </Pressable>
      );
    },
    [colors, accent, handleEventTap],
  );

  const keyExtractor = useCallback((item: AgendaEvent) => item.id, []);

  return (
    <ThemedView style={s.container}>
      {/* ── Jump to Today ── */}
      <Pressable
        style={({ pressed }) => [
          s.jumpBtn,
          { backgroundColor: accent + '15' },
          pressed && { opacity: 0.7 },
        ]}
        onPress={jumpToToday}
      >
        <IconSymbol name="arrow.down.to.line" size={12} color={accent} />
        <ThemedText style={[s.jumpText, { color: accent }]}>Today</ThemedText>
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
            <IconSymbol name="calendar" size={32} color="#9C9790" />
            <ThemedText style={[s.emptyTitle, { color: colors.text }]}>No Events</ThemedText>
            <ThemedText style={[s.emptyDesc, { color: colors.textSecondary }]}>
              There are no scheduled events for your campus.
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

  // Jump to Today
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

  // Event row
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },

  // Time column
  timeCol: { width: 80 },
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
  typeLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  // Detail column
  detailCol: { flex: 1 },
  eventTitle: { fontSize: 14, fontWeight: '700', letterSpacing: -0.2 },
  sublineRow: { flexDirection: 'row', gap: 6, marginTop: 2 },
  sublineText: { fontSize: 11, letterSpacing: 0.1 },
  ministryTag: { fontSize: 11, fontWeight: '600', letterSpacing: 0.1 },

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
