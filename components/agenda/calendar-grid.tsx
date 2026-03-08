/**
 * CalendarGrid — custom month grid for Agenda page 1.
 * No external library. Arrow navigation, event dots, today/selected states.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { getAgendaItemsForMonth, getAgendaTypeColor, dateKey } from '@/data/mock-agenda';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface CalendarGridProps {
  onDateSelect: (dateKey: string) => void;
}

export function CalendarGrid({ onDateSelect }: CalendarGridProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

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
    setSelectedDate(cell.dateStr);
    onDateSelect(cell.dateStr);
  };

  return (
    <View style={styles.container}>
      {/* Header: arrows + month label */}
      <View style={styles.header}>
        <Pressable onPress={prevMonth} hitSlop={12}>
          <IconSymbol name="chevron.left" size={20} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.monthLabel}>
          {MONTH_NAMES[month]} {year}
        </Text>
        <Pressable onPress={nextMonth} hitSlop={12}>
          <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
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
            const isToday = cell.dateStr === todayKey && cell.isCurrentMonth;
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
                    isToday && !isSelected && styles.todayCircle,
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
                {/* Event dots (max 3) */}
                {events && events.length > 0 && (
                  <View style={styles.eventDots}>
                    {events.slice(0, 3).map((ev, i) => (
                      <View
                        key={i}
                        style={[
                          styles.eventDot,
                          { backgroundColor: getAgendaTypeColor(ev.type) },
                        ]}
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
  );
}

const styles = StyleSheet.create({
  container: {
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
    color: '#FFFFFF',
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
    color: '#52525B',
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
    borderColor: '#FFFFFF',
  },
  selectedCircle: {
    backgroundColor: '#FFFFFF',
  },
  dateText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  dateTextOverflow: {
    color: '#52525B',
  },
  dateTextSelected: {
    color: '#000000',
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
  },
});
