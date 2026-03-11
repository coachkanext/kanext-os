/**
 * CalendarGrid — custom month grid for Agenda page 1.
 * No external library. Arrow navigation, white event dots, today/selected states.
 * Includes context panel below grid with selected date info.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  getAgendaItemsForMonth,
  dateKey,
  isToday,
  getEventsForDate,
  getUniqueTypesForDate,
  deriveSource,
  getSourceIcon,
} from '@/data/mock-agenda';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const FULL_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface CalendarGridProps {
  selectedDate: string | null;
  onSelectedDateChange: (key: string) => void;
  onDateSelect: (dateKey: string) => void;
  onAddEvent?: () => void;
}

export function CalendarGrid({ selectedDate, onSelectedDateChange, onDateSelect, onAddEvent }: CalendarGridProps) {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = React.useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const eventsByDay = useMemo(
    () => getAgendaItemsForMonth(year, month),
    [year, month],
  );

  // Build 42-cell grid (6 rows x 7 cols)
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    const result: { day: number; isCurrentMonth: boolean; dateStr: string }[] = [];

    // Previous month overflow
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrev - i;
      const dt = new Date(year, month - 1, d);
      result.push({ day: d, isCurrentMonth: false, dateStr: dateKey(dt) });
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const dt = new Date(year, month, d);
      result.push({ day: d, isCurrentMonth: true, dateStr: dateKey(dt) });
    }

    // Next month overflow
    const remaining = 42 - result.length;
    for (let d = 1; d <= remaining; d++) {
      const dt = new Date(year, month + 1, d);
      result.push({ day: d, isCurrentMonth: false, dateStr: dateKey(dt) });
    }

    return result;
  }, [year, month]);

  const todayKey = dateKey(today);

  const prevMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDatePress = (cell: { day: number; isCurrentMonth: boolean; dateStr: string }) => {
    onSelectedDateChange(cell.dateStr);
  };

  // Context panel data
  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return getEventsForDate(selectedDate);
  }, [selectedDate]);

  const selectedTypes = useMemo(() => {
    if (!selectedDate) return [];
    return getUniqueTypesForDate(selectedDate);
  }, [selectedDate]);

  const selectedDateObj = useMemo(() => {
    if (!selectedDate) return null;
    const [y, m, d] = selectedDate.split('-').map(Number);
    return new Date(y, m - 1, d);
  }, [selectedDate]);

  const nextEvent = selectedEvents.length > 0 ? selectedEvents[0] : null;
  const isSelectedToday = selectedDate === todayKey;

  const formatFullDate = (date: Date) => {
    return `${FULL_DAYS[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`;
  };

  return (
    <View style={styles.container}>
      {/* Grid area */}
      <View style={styles.gridArea}>
        {/* Header: arrows + month label */}
        <View style={styles.header}>
          <Pressable onPress={prevMonth} hitSlop={12}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <Text style={styles.monthLabel}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <Pressable onPress={nextMonth} hitSlop={12}>
            <IconSymbol name="chevron.right" size={20} color={C.label} />
          </Pressable>
        </View>

        {/* Day labels */}
        <View style={styles.dayRow}>
          {DAYS.map((d, i) => (
            <View key={i} style={styles.dayCell}>
              <Text style={styles.dayLabel}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Grid */}
        {Array.from({ length: 6 }, (_, row) => (
          <View key={row} style={styles.weekRow}>
            {cells.slice(row * 7, row * 7 + 7).map((cell, col) => {
              const isTodayCell = cell.dateStr === todayKey && cell.isCurrentMonth;
              const isSelected = cell.dateStr === selectedDate;
              const events = cell.isCurrentMonth ? eventsByDay.get(cell.day) : undefined;

              return (
                <Pressable
                  key={col}
                  style={styles.dateCell}
                  onPress={() => handleDatePress(cell)}
                >
                  <View
                    style={[
                      styles.dateCircle,
                      isTodayCell && !isSelected && styles.todayCircle,
                      isSelected && styles.selectedCircle,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dateText,
                        !cell.isCurrentMonth && styles.dateTextOverflow,
                        isSelected && styles.dateTextSelected,
                      ]}
                    >
                      {cell.day}
                    </Text>
                  </View>
                  {/* Event dots (max 3) — white only */}
                  {events && events.length > 0 && (
                    <View style={styles.eventDots}>
                      {events.slice(0, 3).map((_, i) => (
                        <View
                          key={i}
                          style={styles.eventDot}
                        />
                      ))}
                    </View>
                  )}
                </Pressable>
              );
            })}
          </View>
        ))}
      </View>

      {/* Context Panel */}
      <View style={styles.contextPanel}>
        <View style={styles.contextDivider} />

        {selectedDate && selectedDateObj ? (
          <>
            {/* Row 1: Date label + count + Today chip */}
            <View style={styles.contextRow1}>
              <Text style={styles.contextDateLabel}>{formatFullDate(selectedDateObj)}</Text>
              <Text style={styles.contextEventCount}>
                {selectedEvents.length} event{selectedEvents.length !== 1 ? 's' : ''}
              </Text>
              {isSelectedToday && (
                <View style={styles.todayChip}>
                  <Text style={styles.todayChipText}>Today</Text>
                </View>
              )}
            </View>

            {/* Row 2: Category chips */}
            {selectedTypes.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll} contentContainerStyle={styles.chipsContent}>
                {selectedTypes.map((type) => (
                  <View key={type} style={styles.categoryChip}>
                    <Text style={styles.categoryChipText}>{type}</Text>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Row 3: Next event hero */}
            {nextEvent ? (
              <View style={styles.heroCard}>
                <Text style={styles.heroLabel}>Next</Text>
                <Text style={styles.heroTitle}>{nextEvent.time} — {nextEvent.title}</Text>
                {nextEvent.location && (
                  <View style={styles.heroLocationRow}>
                    <Text style={styles.heroLocation}>{nextEvent.location}</Text>
                    {(() => {
                      const source = deriveSource(nextEvent);
                      const icon = getSourceIcon(source);
                      if (!icon) return null;
                      return <IconSymbol name={icon as any} size={12} color="#1D9BF0" style={styles.heroSourceIcon} />;
                    })()}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.heroCard}>
                <Text style={styles.heroEmptyTitle}>No events scheduled</Text>
                <Text style={styles.heroEmptySub}>Tap + to add an event</Text>
              </View>
            )}

            {/* Row 4: Action buttons */}
            <View style={styles.actionRow}>
              <Pressable style={styles.actionButton} onPress={() => onDateSelect(selectedDate)}>
                <Text style={styles.actionButtonText}>Open Day</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={onAddEvent}>
                <Text style={styles.actionButtonText}>Add Event</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <View style={styles.contextEmpty}>
            <Text style={styles.contextEmptyText}>Select a date to see details</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    flex: 1,
  },
  gridArea: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: C.label,
  },
  dayRow: {
    flexDirection: 'row',
    paddingBottom: 8,
  },
  dayCell: {
    flex: 1,
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  weekRow: {
    flexDirection: 'row',
  },
  dateCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dateCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCircle: {
    borderWidth: 1.5,
    borderColor: C.label,
  },
  selectedCircle: {
    backgroundColor: C.label,
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  dateTextOverflow: {
    color: C.muted,
  },
  dateTextSelected: {
    color: C.bg,
  },
  eventDots: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 5,
  },
  eventDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.label,
  },

  // Context Panel
  contextPanel: {
    minHeight: '30%',
    backgroundColor: C.surface,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginBottom: 12,
  },
  contextRow1: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  contextDateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
  },
  contextEventCount: {
    fontSize: 13,
    color: C.secondary,
  },
  todayChip: {
    backgroundColor: C.separator,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  todayChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.label,
  },
  chipsScroll: {
    marginBottom: 10,
  },
  chipsContent: {
    gap: 6,
  },
  categoryChip: {
    backgroundColor: C.separator,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '500',
    color: C.label,
    textTransform: 'capitalize',
  },
  heroCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.secondary,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.label,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  heroLocation: {
    fontSize: 13,
    color: C.secondary,
  },
  heroSourceIcon: {
    marginLeft: 2,
  },
  heroEmptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.label,
  },
  heroEmptySub: {
    fontSize: 13,
    color: C.secondary,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: C.separator,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },
  contextEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  contextEmptyText: {
    fontSize: 14,
    color: C.muted,
  },
});
