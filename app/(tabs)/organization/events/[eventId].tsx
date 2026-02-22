/**
 * Event Hub / Term Detail Screen
 * Shows details about a specific academic term or calendar event.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme'
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getTermById,
  getEventsForTerm,
  formatTermDates,
  formatCalendarEventDate,
  getCalendarEventTypeLabel,
  getTermStatusLabel,
  ACADEMIC_CALENDAR,
} from '@/data/mock-education';
import type { AcademicTerm, AcademicCalendarEvent } from '@/types';

// =============================================================================
// HELPERS
// =============================================================================

function getEventTypeIcon(type: AcademicCalendarEvent['type']): IconSymbolName {
  const icons: Record<AcademicCalendarEvent['type'], IconSymbolName> = {
    semester_start: 'play.fill',
    semester_end: 'stop.fill',
    add_drop: 'pencil',
    midterms: 'doc.text.fill',
    finals: 'checkmark.seal.fill',
    break: 'sun.max.fill',
    holiday: 'star.fill',
    commencement: 'graduationcap.fill',
    registration: 'calendar.badge.plus',
    other: 'calendar',
  };
  return icons[type] || 'calendar';
}

function getEventTypeColor(type: AcademicCalendarEvent['type'], modeColor: string): string {
  switch (type) {
    case 'finals':
    case 'midterms':
      return '#EF4444';
    case 'break':
    case 'holiday':
      return accent;
    case 'commencement':
      return '#F59E0B';
    case 'registration':
      return modeColor;
    default:
      return modeColor;
  }
}

// =============================================================================
// COMPONENTS
// =============================================================================

interface EventRowProps {
  event: AcademicCalendarEvent;
  colors: typeof Colors.light;
  modeColor: string;
}

function EventRow({ event, colors, modeColor }: EventRowProps) {
  const eventColor = getEventTypeColor(event.type, modeColor);
  const icon = getEventTypeIcon(event.type);

  return (
    <View style={[styles.eventRow, { backgroundColor: colors.card }]}>
      <View style={[styles.eventIcon, { backgroundColor: eventColor + '15' }]}>
        <IconSymbol name={icon} size={18} color={eventColor} />
      </View>
      <View style={styles.eventContent}>
        <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
        <ThemedText style={[styles.eventDate, { color: colors.textSecondary }]}>
          {formatCalendarEventDate(event)}
        </ThemedText>
        {event.description && (
          <ThemedText style={[styles.eventDesc, { color: colors.textTertiary }]} numberOfLines={2}>
            {event.description}
          </ThemedText>
        )}
      </View>
      <View style={[styles.eventTypeBadge, { backgroundColor: eventColor + '15' }]}>
        <ThemedText style={[styles.eventTypeText, { color: eventColor }]}>
          {getCalendarEventTypeLabel(event.type)}
        </ThemedText>
      </View>
    </View>
  );
}

interface TermHeaderProps {
  term: AcademicTerm;
  colors: typeof Colors.light;
  modeColor: string;
}

function TermHeader({ term, colors, modeColor }: TermHeaderProps) {
  const statusColors: Record<AcademicTerm['status'], string> = {
    current: colors.success,
    upcoming: modeColor,
    completed: colors.textTertiary,
  };
  const statusColor = statusColors[term.status];

  return (
    <View style={[styles.termHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.termHeaderTop}>
        <View style={[styles.termIcon, { backgroundColor: modeColor + '15' }]}>
          <IconSymbol name="book.fill" size={24} color={modeColor} />
        </View>
        <View style={styles.termInfo}>
          <ThemedText style={styles.termName}>{term.name}</ThemedText>
          <ThemedText style={[styles.termYear, { color: colors.textSecondary }]}>
            {term.academicYear} Academic Year
          </ThemedText>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
          <ThemedText style={[styles.statusText, { color: statusColor }]}>
            {getTermStatusLabel(term.status)}
          </ThemedText>
        </View>
      </View>

      <View style={[styles.termDates, { borderTopColor: colors.divider }]}>
        <View style={styles.dateItem}>
          <IconSymbol name="calendar" size={16} color={colors.textTertiary} />
          <ThemedText style={[styles.dateLabel, { color: colors.textTertiary }]}>Start</ThemedText>
          <ThemedText style={styles.dateValue}>
            {term.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </ThemedText>
        </View>
        <View style={[styles.dateDivider, { backgroundColor: colors.divider }]} />
        <View style={styles.dateItem}>
          <IconSymbol name="calendar" size={16} color={colors.textTertiary} />
          <ThemedText style={[styles.dateLabel, { color: colors.textTertiary }]}>End</ThemedText>
          <ThemedText style={styles.dateValue}>
            {term.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function EventHubScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  const modeColor = ModeColors.education.primary;

  // Check if this is a term ID or calendar event ID
  const term = getTermById(eventId);
  const calendarEvent = !term ? ACADEMIC_CALENDAR.find((e) => e.id === eventId) : null;
  const termEvents = term ? getEventsForTerm(term.id) : [];

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // If neither found, show error state
  if (!term && !calendarEvent) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>Not Found</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <IconSymbol name="exclamationmark.triangle" size={48} color={colors.textTertiary} />
          <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
            Event not found
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  // Single calendar event view
  if (calendarEvent) {
    const eventColor = getEventTypeColor(calendarEvent.type, modeColor);
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={handleBack} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={20} color={colors.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>Event Details</ThemedText>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.eventDetail, { backgroundColor: colors.card }]}>
            <View style={[styles.eventDetailIcon, { backgroundColor: eventColor + '15' }]}>
              <IconSymbol name={getEventTypeIcon(calendarEvent.type)} size={32} color={eventColor} />
            </View>
            <ThemedText style={styles.eventDetailTitle}>{calendarEvent.title}</ThemedText>
            <ThemedText style={[styles.eventDetailDate, { color: colors.textSecondary }]}>
              {formatCalendarEventDate(calendarEvent)}
            </ThemedText>
            <View style={[styles.eventDetailBadge, { backgroundColor: eventColor + '15' }]}>
              <ThemedText style={[styles.eventDetailType, { color: eventColor }]}>
                {getCalendarEventTypeLabel(calendarEvent.type)}
              </ThemedText>
            </View>
            {calendarEvent.description && (
              <ThemedText style={[styles.eventDetailDesc, { color: colors.textSecondary }]}>
                {calendarEvent.description}
              </ThemedText>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    );
  }

  // Term detail view
  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Term Details</ThemedText>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Term Header Card */}
        <TermHeader term={term!} colors={colors} modeColor={modeColor} />

        {/* Term Events */}
        {termEvents.length > 0 && (
          <View style={styles.eventsSection}>
            <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
              KEY DATES
            </ThemedText>
            <View style={styles.eventsList}>
              {termEvents
                .sort((a, b) => a.date.getTime() - b.date.getTime())
                .map((event) => (
                  <EventRow key={event.id} event={event} colors={colors} modeColor={modeColor} />
                ))}
            </View>
          </View>
        )}

        {/* No Events */}
        {termEvents.length === 0 && (
          <View style={styles.noEvents}>
            <IconSymbol name="calendar" size={32} color={colors.textTertiary} />
            <ThemedText style={[styles.noEventsText, { color: colors.textSecondary }]}>
              No key dates scheduled for this term
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.xs,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Term Header
  termHeader: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  termHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
  },
  termIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  termInfo: {
    flex: 1,
  },
  termName: {
    fontSize: 20,
    fontWeight: '700',
  },
  termYear: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  termDates: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingVertical: Spacing.md,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  dateLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  dateDivider: {
    width: 1,
    height: '80%',
    alignSelf: 'center',
  },

  // Events Section
  eventsSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  eventsList: {
    gap: Spacing.sm,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 13,
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  eventTypeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    marginLeft: Spacing.sm,
  },
  eventTypeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },

  // Single Event Detail
  eventDetail: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  eventDetailIcon: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  eventDetailTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  eventDetailDate: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  eventDetailBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  eventDetailType: {
    fontSize: 13,
    fontWeight: '600',
  },
  eventDetailDesc: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.lg,
    lineHeight: 22,
  },

  // Empty / No Events
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    marginTop: Spacing.md,
  },
  noEvents: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  noEventsText: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
});
