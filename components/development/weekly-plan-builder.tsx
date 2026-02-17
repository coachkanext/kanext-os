/**
 * WeeklyPlanBuilder — Week view with color-coded session blocks.
 * Shows the current week label, 7 day cards in a scrollable column,
 * each day with session blocks showing type, title, time, duration, and focus.
 */

import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, Brand } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CURRENT_WEEKLY_PLAN, type SessionType } from '@/data/mock-development-v2';

// =============================================================================
// SESSION COLORS
// =============================================================================

const SESSION_COLORS: Record<SessionType, string> = {
  practice: Brand.precision,   // #6AA9FF
  lift: Brand.warning,         // #F59E0B
  film: '#7A5CFF',
  individual: Brand.success,   // #22C55E
  rest: '#424242',
};

// =============================================================================
// SESSION ICONS (SF Symbol names mapped in icon-symbol.tsx)
// =============================================================================

const SESSION_ICONS: Record<SessionType, string> = {
  practice: 'sportscourt.fill',
  lift: 'figure.mind.and.body',
  film: 'film',
  individual: 'person.fill',
  rest: 'sun.max.fill',
};

// =============================================================================
// COMPONENT
// =============================================================================

export function WeeklyPlanBuilder() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const plan = CURRENT_WEEKLY_PLAN;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
    >
      {/* Week Header */}
      <View style={styles.weekHeader}>
        <ThemedText style={[styles.weekLabel, { color: colors.text }]}>
          {plan.weekLabel}: {plan.startDate}\u2013{plan.endDate}
        </ThemedText>
      </View>

      {/* Day Cards */}
      {plan.days.map((day) => (
        <View
          key={day.day}
          style={[styles.dayCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          {/* Day Header */}
          <View style={styles.dayHeader}>
            <ThemedText style={[styles.dayName, { color: colors.text }]}>
              {day.day}
            </ThemedText>
            <ThemedText style={[styles.dayDate, { color: colors.textTertiary }]}>
              {day.date}
            </ThemedText>
          </View>

          {/* Session Blocks */}
          {day.sessions.length === 0 ? (
            <ThemedText style={[styles.emptyDay, { color: colors.textTertiary }]}>
              No sessions scheduled
            </ThemedText>
          ) : (
            day.sessions.map((session) => {
              const sessionColor = SESSION_COLORS[session.type];
              const iconName = SESSION_ICONS[session.type];

              return (
                <View
                  key={session.id}
                  style={[
                    styles.sessionBlock,
                    { borderLeftColor: sessionColor, backgroundColor: sessionColor + '10' },
                  ]}
                >
                  <View style={styles.sessionTopRow}>
                    <View style={[styles.sessionIcon, { backgroundColor: sessionColor + '20' }]}>
                      <IconSymbol name={iconName as any} size={14} color={sessionColor} />
                    </View>
                    <View style={styles.sessionInfo}>
                      <ThemedText style={[styles.sessionTitle, { color: colors.text }]} numberOfLines={1}>
                        {session.title}
                      </ThemedText>
                      <View style={styles.sessionMeta}>
                        <ThemedText style={[styles.sessionTime, { color: colors.textSecondary }]}>
                          {session.time}
                        </ThemedText>
                        <ThemedText style={[styles.sessionDot, { color: colors.textTertiary }]}>
                          {'\u00B7'}
                        </ThemedText>
                        <ThemedText style={[styles.sessionDuration, { color: colors.textSecondary }]}>
                          {session.duration}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={[styles.typeBadge, { backgroundColor: sessionColor + '20' }]}>
                      <ThemedText style={[styles.typeBadgeText, { color: sessionColor }]}>
                        {session.type}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Focus or Notes */}
                  {(session.focus || session.notes) && (
                    <ThemedText
                      style={[styles.sessionFocus, { color: colors.textTertiary }]}
                      numberOfLines={2}
                    >
                      {session.focus || session.notes}
                    </ThemedText>
                  )}
                </View>
              );
            })
          )}
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: 40,
  },

  // Week header
  weekHeader: {
    marginBottom: Spacing.md,
  },
  weekLabel: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Day card
  dayCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  dayName: {
    fontSize: 15,
    fontWeight: '700',
  },
  dayDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyDay: {
    fontSize: 12,
    fontStyle: 'italic',
    paddingVertical: Spacing.xs,
  },

  // Session block
  sessionBlock: {
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginBottom: 6,
  },
  sessionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionInfo: {
    flex: 1,
    minWidth: 0,
  },
  sessionTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  sessionTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  sessionDot: {
    fontSize: 11,
  },
  sessionDuration: {
    fontSize: 11,
    fontWeight: '500',
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Focus text
  sessionFocus: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
    marginLeft: 36, // align with text after icon
  },
});
