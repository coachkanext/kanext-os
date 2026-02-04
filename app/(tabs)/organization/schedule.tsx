/**
 * Schedule Screen
 * Academic calendar for Education mode.
 */

import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable, SectionList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, ModeColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  ACADEMIC_CALENDAR,
  ACADEMIC_TERMS,
  formatCalendarEventDate,
  getCalendarEventTypeLabel,
  formatTermDates,
  getTermStatusLabel,
} from '@/data/mock-education';
import type { AcademicCalendarEvent, AcademicTerm } from '@/types';

// =============================================================================
// COMPONENTS
// =============================================================================

interface EventRowProps {
  event: AcademicCalendarEvent;
  colors: typeof Colors.light;
  accentColor: string;
}

function EventRow({ event, colors, accentColor }: EventRowProps) {
  return (
    <View style={[styles.eventRow, { backgroundColor: colors.card }]}>
      <View style={[styles.eventDate, { backgroundColor: accentColor + '15' }]}>
        <ThemedText style={[styles.eventMonth, { color: accentColor }]}>
          {event.date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
        </ThemedText>
        <ThemedText style={[styles.eventDay, { color: accentColor }]}>
          {event.date.getDate()}
        </ThemedText>
      </View>
      <View style={styles.eventInfo}>
        <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
        <ThemedText style={[styles.eventType, { color: colors.textSecondary }]}>
          {getCalendarEventTypeLabel(event.type)}
        </ThemedText>
        {event.description && (
          <ThemedText style={[styles.eventDesc, { color: colors.textTertiary }]}>
            {event.description}
          </ThemedText>
        )}
        {event.endDate && event.endDate.getTime() !== event.date.getTime() && (
          <ThemedText style={[styles.eventRange, { color: colors.textTertiary }]}>
            {formatCalendarEventDate(event)}
          </ThemedText>
        )}
      </View>
    </View>
  );
}

interface TermSummaryProps {
  term: AcademicTerm;
  colors: typeof Colors.light;
  accentColor: string;
}

function TermSummary({ term, colors, accentColor }: TermSummaryProps) {
  const isCurrent = term.status === 'current';

  return (
    <View
      style={[
        styles.termSummary,
        {
          backgroundColor: colors.card,
          borderColor: isCurrent ? accentColor : colors.border,
          borderWidth: isCurrent ? 2 : 1,
        },
      ]}
    >
      <View style={styles.termHeader}>
        <ThemedText style={styles.termName}>{term.name}</ThemedText>
        <View
          style={[
            styles.termStatusBadge,
            { backgroundColor: isCurrent ? accentColor : colors.backgroundSecondary },
          ]}
        >
          <ThemedText
            style={[
              styles.termStatusText,
              { color: isCurrent ? '#FFFFFF' : colors.textSecondary },
            ]}
          >
            {getTermStatusLabel(term.status)}
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.termDates, { color: colors.textSecondary }]}>
        {formatTermDates(term)}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ScheduleScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const modeColors = ModeColors.education;

  // Group events by month
  const sections = useMemo(() => {
    const sorted = [...ACADEMIC_CALENDAR].sort(
      (a, b) => a.date.getTime() - b.date.getTime()
    );

    const grouped = sorted.reduce(
      (acc, event) => {
        const monthYear = event.date.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        });
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }
        acc[monthYear].push(event);
        return acc;
      },
      {} as Record<string, AcademicCalendarEvent[]>
    );

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <ThemedText type="title" style={styles.headerTitle}>
            Academic Calendar
          </ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
            2025-2026 Academic Year
          </ThemedText>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Terms Overview */}
        <View style={styles.termsSection}>
          <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
            TERMS
          </ThemedText>
          {ACADEMIC_TERMS.map((term) => (
            <TermSummary
              key={term.id}
              term={term}
              colors={colors}
              accentColor={modeColors.primary}
            />
          ))}
        </View>

        {/* Calendar Events */}
        <ThemedText style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          KEY DATES
        </ThemedText>
        {sections.map((section) => (
          <View key={section.title} style={styles.monthSection}>
            <ThemedText style={[styles.monthTitle, { color: colors.textSecondary }]}>
              {section.title}
            </ThemedText>
            {section.data.map((event) => (
              <EventRow
                key={event.id}
                event={event}
                colors={colors}
                accentColor={modeColors.primary}
              />
            ))}
          </View>
        ))}
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
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },

  // Terms
  termsSection: {
    marginBottom: Spacing.md,
  },
  termSummary: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  termName: {
    fontSize: 16,
    fontWeight: '600',
  },
  termStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  termStatusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  termDates: {
    fontSize: 13,
    marginTop: 4,
  },

  // Month Section
  monthSection: {
    marginBottom: Spacing.lg,
  },
  monthTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  // Event Row
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  eventDate: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  eventMonth: {
    fontSize: 10,
    fontWeight: '600',
  },
  eventDay: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventType: {
    fontSize: 12,
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 13,
    marginTop: 4,
  },
  eventRange: {
    fontSize: 12,
    marginTop: 4,
  },
});
