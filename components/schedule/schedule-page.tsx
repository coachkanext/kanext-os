/**
 * Schedule Page — Agenda-first timeline view
 *
 * Route: SportsHome → Schedule tab (PagerView page)
 *
 * Tabs: Agenda (default) | Games | Team
 * Only Agenda is implemented in this spec.
 *
 * RBAC: Assistant Coach / Recruiting Coordinator (execution-level).
 * Can: View full program schedule, propose changes via Nexus,
 *      add/cancel/modify events via governed workflow.
 * Cannot: Override institutional blackout windows, modify compliance-bound
 *         events, edit locked events, bypass confirmation workflow.
 *
 * Agenda is a timeline view, not a control panel.
 * No inline editing. Nexus is the only write surface.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Text, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAccentColor } from '@/hooks/use-accent-color';
import { MOCK_CALENDAR_EVENTS } from '@/data/mock-calendar-events';
import { KaNeXT_GAMES } from '@/data/fmu';
import {
  EVENT_TYPE_COLORS,
  EVENT_TYPE_LABELS,
  gamesToCalendarEvents,
  formatEventTime,
  isSameDay,
} from '@/data/calendar-utils';
import type { ProgramCalendarEvent, ProgramCalendarEventType } from '@/types';

// =============================================================================
// CONSTANTS
// =============================================================================

type ScheduleTab = 'agenda' | 'games' | 'team';

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Type chip labels used in the spec
const TYPE_CHIP_LABELS: Record<ProgramCalendarEventType, string> = {
  game: 'Game',
  practice: 'Practice',
  lift: 'Lift',
  travel: 'Travel',
  meeting: 'Film',
  recruiting: 'Recruit',
  academic: 'Academic',
  admin_deadline: 'Admin',
};

// =============================================================================
// DATA PREPARATION
// =============================================================================

interface DaySection {
  title: string;
  date: Date;
  data: ProgramCalendarEvent[];
}

function buildAgendaSections(events: ProgramCalendarEvent[]): DaySection[] {
  // Sort all events by start time
  const sorted = [...events].sort(
    (a, b) => a.startDatetime.getTime() - b.startDatetime.getTime(),
  );

  // Group by day
  const dayMap = new Map<string, { date: Date; events: ProgramCalendarEvent[] }>();
  for (const ev of sorted) {
    const key = `${ev.startDatetime.getFullYear()}-${ev.startDatetime.getMonth()}-${ev.startDatetime.getDate()}`;
    if (!dayMap.has(key)) {
      dayMap.set(key, { date: ev.startDatetime, events: [] });
    }
    dayMap.get(key)!.events.push(ev);
  }

  // Convert to SectionList data
  const sections: DaySection[] = [];
  for (const [, { date, events }] of dayMap) {
    sections.push({
      title: formatDayHeader(date),
      date,
      data: events,
    });
  }
  return sections;
}

function formatDayHeader(d: Date): string {
  return `${DAY_NAMES[d.getDay()]} · ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
}

function formatTimeRange(start: Date, end: Date): string {
  return `${formatEventTime(start)}–${formatEventTime(end)}`.replace(/ /g, '').toLowerCase();
}

// =============================================================================
// PROPS
// =============================================================================

interface SchedulePageProps {
  colors: typeof Colors.light;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function SchedulePage({ colors: propColors }: SchedulePageProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = propColors ?? Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();

  // ── Tab State ──
  const [activeTab, setActiveTab] = useState<ScheduleTab>('agenda');

  // ── Event Detail State ──
  const [selectedEvent, setSelectedEvent] = useState<ProgramCalendarEvent | null>(null);

  // ── Sticky Day Header ──
  const [visibleDay, setVisibleDay] = useState<string>('');

  // ── Merge mock events + game events ──
  const allEvents = useMemo(() => {
    const gameEvents = gamesToCalendarEvents(KaNeXT_GAMES);
    return [...MOCK_CALENDAR_EVENTS, ...gameEvents];
  }, []);

  // ── Sections for agenda ──
  const sections = useMemo(() => buildAgendaSections(allEvents), [allEvents]);

  // ── Today index for scroll-to ──
  const today = useMemo(() => new Date(), []);
  const todayKey = `${DAY_NAMES[today.getDay()]} · ${MONTH_NAMES[today.getMonth()]} ${today.getDate()}`;
  const sectionListRef = useRef<SectionList>(null);

  const scrollToToday = useCallback(() => {
    const idx = sections.findIndex(s => isSameDay(s.date, today));
    if (idx >= 0 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: idx,
        itemIndex: 0,
        animated: true,
        viewOffset: 0,
      });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [sections, today]);

  // ══════════════════════════════════════════════════════════════════════════════
  // EVENT DETAIL VIEW
  // ══════════════════════════════════════════════════════════════════════════════

  if (selectedEvent) {
    const ev = selectedEvent;
    const typeColor = EVENT_TYPE_COLORS[ev.type];
    const isLocked = ev.isReadOnly === true;
    const isGame = ev.type === 'game';
    const statusLabel = isGame
      ? ev.gameStatus === 'final' ? 'Completed' : ev.gameStatus === 'live' ? 'Live' : 'Scheduled'
      : 'Scheduled';

    return (
      <View style={[styles.root, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.stickyHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <Pressable
            onPress={() => setSelectedEvent(null)}
            hitSlop={12}
            style={styles.backBtn}
          >
            <IconSymbol name="chevron.left" size={20} color={accent} />
          </Pressable>
          <Text style={[styles.detailHeaderTitle, { color: colors.text }]} numberOfLines={1}>
            {ev.title}
          </Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Type badge + locked */}
          <View style={styles.detailBadgeRow}>
            <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
              <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
              <Text style={[styles.typeBadgeText, { color: typeColor }]}>
                {EVENT_TYPE_LABELS[ev.type]}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: colors.card }]}>
              <Text style={[styles.statusBadgeText, { color: colors.textSecondary }]}>{statusLabel}</Text>
            </View>
            {isLocked && (
              <View style={[styles.lockedBadge, { backgroundColor: Brand.warning + '20' }]}>
                <IconSymbol name="lock.fill" size={10} color={Brand.warning} />
                <Text style={[styles.lockedBadgeText, { color: Brand.warning }]}>LOCKED</Text>
              </View>
            )}
          </View>

          {/* Date / Time */}
          <DetailRow
            icon="calendar"
            label="Date"
            value={`${DAY_NAMES[ev.startDatetime.getDay()]}, ${MONTH_NAMES[ev.startDatetime.getMonth()]} ${ev.startDatetime.getDate()}, ${ev.startDatetime.getFullYear()}`}
            colors={colors}
            accent={accent}
          />
          <DetailRow
            icon="clock.fill"
            label="Time"
            value={formatTimeRange(ev.startDatetime, ev.endDatetime)}
            colors={colors}
            accent={accent}
          />

          {/* Location */}
          {ev.location && (
            <DetailRow
              icon="mappin.circle.fill"
              label="Location"
              value={ev.location}
              colors={colors}
              accent={accent}
            />
          )}

          {/* Game score */}
          {isGame && ev.gameScore && (
            <DetailRow
              icon="sportscourt.fill"
              label="Score"
              value={ev.gameScore}
              colors={colors}
              accent={accent}
            />
          )}

          {/* Description / Notes */}
          {ev.description && (
            <>
              <Text style={[styles.detailSectionLabel, { color: colors.textTertiary }]}>NOTES</Text>
              <View style={[styles.detailNotesCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.detailNotes, { color: colors.textSecondary }]}>{ev.description}</Text>
              </View>
            </>
          )}

          {/* Linked entities */}
          {ev.routeTarget && (
            <>
              <Text style={[styles.detailSectionLabel, { color: colors.textTertiary }]}>LINKED</Text>
              <Pressable
                style={[styles.linkedCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="link" size={14} color={accent} />
                <Text style={[styles.linkedText, { color: accent }]}>{ev.routeTarget}</Text>
                <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
              </Pressable>
            </>
          )}

          {/* Actions */}
          <View style={[styles.detailActions, { marginTop: Spacing.lg }]}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: accent }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="brain" size={16} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>Open in Nexus</Text>
            </Pressable>
          </View>

          {/* RBAC note */}
          <Text style={[styles.detailFooter, { color: colors.textTertiary }]}>
            All modifications route through Nexus.
          </Text>
        </ScrollView>
      </View>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // MAIN RENDER
  // ══════════════════════════════════════════════════════════════════════════════

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>

      {/* ═══════ STICKY HEADER ═══════ */}
      <View style={[styles.topHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.topTitle, { color: colors.text }]}>Schedule</Text>
      </View>

      {/* ═══════ TABS ═══════ */}
      <View style={[styles.pillBar, { borderBottomColor: colors.border }]}>
        {(['agenda', 'games', 'team'] as ScheduleTab[]).map(tab => {
          const isActive = activeTab === tab;
          const label = tab === 'agenda' ? 'Agenda' : tab === 'games' ? 'Games' : 'Team';
          return (
            <Pressable
              key={tab}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? accent + '20' : colors.card,
                  borderColor: isActive ? accent : colors.border,
                },
              ]}
              onPress={() => {
                setActiveTab(tab);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.pillText, { color: isActive ? accent : colors.textSecondary }]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* ═══════ TAB CONTENT ═══════ */}
      {activeTab === 'agenda' ? (
        <>
          {/* ═══════ BLOCK 1 — STICKY DAY HEADER ═══════ */}
          <View style={[styles.dayHeader, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
            <Text style={[styles.dayHeaderText, { color: colors.text }]}>
              {visibleDay || todayKey}
            </Text>
            <Pressable onPress={scrollToToday} hitSlop={8} style={styles.jumpToday}>
              <Text style={[styles.jumpTodayText, { color: accent }]}>Jump to Today</Text>
            </Pressable>
          </View>

          {/* ═══════ BLOCK 2 — AGENDA LIST ═══════ */}
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={item => item.id}
            stickySectionHeadersEnabled={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
            onViewableItemsChanged={useCallback(({ viewableItems }: any) => {
              if (viewableItems.length > 0) {
                const first = viewableItems[0];
                if (first.section) {
                  setVisibleDay(first.section.title);
                }
              }
            }, [])}
            viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
            renderSectionHeader={({ section }) => (
              <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
                <Text style={[styles.sectionHeaderText, { color: colors.textSecondary }]}>
                  {section.title}
                </Text>
              </View>
            )}
            renderItem={({ item }) => {
              const typeColor = EVENT_TYPE_COLORS[item.type];
              const isGame = item.type === 'game';
              return (
                <Pressable
                  style={[styles.eventRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => {
                    setSelectedEvent(item);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  {/* Left: Time */}
                  <View style={styles.eventTimeCol}>
                    <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
                      {formatTimeRange(item.startDatetime, item.endDatetime)}
                    </Text>
                  </View>

                  {/* Middle: Type chip */}
                  <View style={[styles.typeChip, { backgroundColor: typeColor + '18' }]}>
                    <View style={[styles.typeChipDot, { backgroundColor: typeColor }]} />
                    <Text style={[styles.typeChipText, { color: typeColor }]}>
                      {TYPE_CHIP_LABELS[item.type]}
                    </Text>
                  </View>

                  {/* Right: Title + subline */}
                  <View style={styles.eventInfo}>
                    <Text style={[styles.eventTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.location && (
                      <Text style={[styles.eventSubline, { color: colors.textTertiary }]} numberOfLines={1}>
                        {item.location}
                        {isGame && item.gameStatus === 'final' && item.gameScore
                          ? ` · ${item.gameScore}`
                          : ''}
                      </Text>
                    )}
                  </View>
                </Pressable>
              );
            }}
          />
        </>
      ) : (
        /* Games / Team placeholder */
        <View style={styles.placeholderContainer}>
          <Text style={[styles.placeholderTitle, { color: colors.text }]}>Coming Soon</Text>
          <Text style={[styles.placeholderSub, { color: colors.textSecondary }]}>
            {activeTab === 'games' ? 'Games' : 'Team'} tab is under development.
          </Text>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function DetailRow({
  icon, label, value, colors, accent,
}: {
  icon: string;
  label: string;
  value: string;
  colors: typeof Colors.light;
  accent: string;
}) {
  return (
    <View style={styles.detailRow}>
      <IconSymbol name={icon as any} size={14} color={accent} />
      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  root: { flex: 1 },

  // ── Top Header ──
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
  topTitle: { fontSize: 18, fontWeight: '800' },

  // ── Pill Tabs ──
  pillBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 13, fontWeight: '600' },

  // ── Day Header (Block 1) ──
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dayHeaderText: { fontSize: 14, fontWeight: '700' },
  jumpToday: {},
  jumpTodayText: { fontSize: 12, fontWeight: '600' },

  // ── Section Headers ──
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: 16,
    paddingBottom: 6,
  },
  sectionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },

  // ── Event Row ──
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  eventTimeCol: { width: 80 },
  eventTime: { fontSize: 11, fontWeight: '600' },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeChipDot: { width: 6, height: 6, borderRadius: 3 },
  typeChipText: { fontSize: 10, fontWeight: '700' },
  eventInfo: { flex: 1 },
  eventTitle: { fontSize: 13, fontWeight: '600' },
  eventSubline: { fontSize: 11, marginTop: 2 },

  // ── Scroll ──
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.md, paddingTop: Spacing.sm },

  // ── Placeholder ──
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  placeholderSub: { fontSize: 14, textAlign: 'center', paddingHorizontal: 40 },

  // ── Event Detail ──
  stickyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderBottomWidth: StyleSheet.hairlineWidth,
    minHeight: 56,
  },
  backBtn: {
    width: 36,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  detailHeaderTitle: { fontSize: 15, fontWeight: '700', flex: 1, textAlign: 'center' },

  detailBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeBadgeText: { fontSize: 11, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  lockedBadgeText: { fontSize: 10, fontWeight: '700' },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    width: 50,
  },
  detailValue: { fontSize: 13, fontWeight: '600', flex: 1 },

  detailSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: Spacing.lg,
    marginBottom: 8,
  },
  detailNotesCard: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  detailNotes: { fontSize: 13, lineHeight: 20 },

  linkedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  linkedText: { fontSize: 13, fontWeight: '600', flex: 1 },

  detailActions: { gap: 8 },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  actionBtnText: { fontSize: 14, fontWeight: '700' },

  detailFooter: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
