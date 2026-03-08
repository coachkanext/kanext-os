/**
 * Agenda — Personal timeline + calendar view.
 * Page 0: Rolling timeline with now-line, date sections, focal highlights.
 * Page 1: Calendar grid with white event dots, context panel.
 * Monochrome event rows — no colored category bars. Source icons for auto-pulled events.
 */

import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  SectionList,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { SwipeableTwoPage } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { CalendarGrid } from '@/components/agenda/calendar-grid';
import {
  getAgendaItemsByDate,
  formatDateHeader,
  dateKey,
  getNextUpcomingEvent,
  getCurrentEvent,
  deriveSource,
  getSourceIcon,
  type PersonalAgendaItem,
} from '@/data/mock-agenda';
import { useOrganization, useMode } from '@/context/app-context';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const C = {
  bg: '#000000',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: '#2F3336',
  nowLine: '#FFFFFF',
  surface: '#0B0F14',
  blueSteel: '#1D9BF0',
};

export default function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const org = useOrganization();
  const mode = useMode();
  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [calendarSelectedDate, setCalendarSelectedDate] = useState<string | null>(null);
  const sectionListRef = useRef<SectionList>(null);

  // Build sections from grouped agenda data
  const sections = useMemo(() => {
    const byDate = getAgendaItemsByDate();
    const result: { key: string; date: Date; data: PersonalAgendaItem[] }[] = [];
    byDate.forEach((items, key) => {
      result.push({ key, date: items[0].date, data: items });
    });
    return result;
  }, []);

  // Current time for now-line
  const now = new Date();
  const nowHour = now.getHours();
  const nowMinute = now.getMinutes();
  const todayKey = dateKey(now);

  // Next upcoming & current event
  const nextUpcoming = useMemo(() => getNextUpcomingEvent(), []);
  const currentEvent = useMemo(() => getCurrentEvent(), []);

  // Auto-scroll to today on mount
  const lastScrollY = useRef(0);
  const skipNextScroll = useRef(true);
  useEffect(() => {
    const idx = sections.findIndex((s) => s.key === todayKey);
    if (idx >= 0 && sectionListRef.current) {
      sectionListRef.current.scrollToLocation({
        sectionIndex: idx,
        itemIndex: 0,
        animated: false,
      });
    }
    setTimeout(() => { skipNextScroll.current = false; }, 500);
  }, []);

  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (skipNextScroll.current) {
      lastScrollY.current = y;
      return;
    }
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleDateSelect = useCallback((selectedKey: string) => {
    setPageIndex(0);
    // Find section index and scroll to it
    const idx = sections.findIndex((s) => s.key === selectedKey);
    if (idx >= 0 && sectionListRef.current) {
      setTimeout(() => {
        sectionListRef.current?.scrollToLocation({
          sectionIndex: idx,
          itemIndex: 0,
          animated: true,
        });
      }, 300); // wait for page transition
    }
  }, [sections]);

  const handleAddEvent = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Would open add event bottom sheet
  }, []);

  const handleLongPress = useCallback((item: PersonalAgendaItem, pageY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuData({
      title: item.title,
      subtitle: `${item.time}${item.endTime ? ` - ${item.endTime}` : ''}`,
      initials: item.title.charAt(0),
      isSquircle: false,
      pageY,
      actions: [
        { key: 'view', label: 'View Details', icon: 'eye.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'remind', label: 'Set Reminder', icon: 'bell.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: (_key) => {
        // Actions would be wired to backend
      },
    });
  }, []);

  const isPastEvent = (item: PersonalAgendaItem) => {
    return item.date.getTime() < now.getTime();
  };

  const isNextUpcoming = (item: PersonalAgendaItem) => {
    return nextUpcoming?.id === item.id;
  };

  const isCurrentEvent = (item: PersonalAgendaItem) => {
    return currentEvent?.id === item.id;
  };

  const renderItem = useCallback(({ item }: { item: PersonalAgendaItem }) => {
    const past = isPastEvent(item);
    const isNext = isNextUpcoming(item);
    const isCurrent = isCurrentEvent(item);
    const source = deriveSource(item);
    const sourceIcon = getSourceIcon(source);

    return (
      <Pressable
        style={[
          styles.eventRow,
          past && styles.eventRowPast,
          isNext && styles.eventRowNext,
          isCurrent && styles.eventRowCurrent,
        ]}
        onLongPress={(e) => handleLongPress(item, e.nativeEvent.pageY)}
        delayLongPress={400}
      >
        {/* Time column */}
        <View style={styles.timeCol}>
          <Text style={[styles.timeText, past && styles.textPast]}>{item.time}</Text>
          {item.endTime && (
            <Text style={[styles.endTimeText, past && styles.textPast]}>{item.endTime}</Text>
          )}
        </View>

        {/* Content */}
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, past && styles.textPast]} numberOfLines={1}>
            {item.title}
          </Text>
          {(item.location || sourceIcon) && (
            <View style={styles.locationRow}>
              {item.location && (
                <Text style={[styles.eventLocation, past && styles.textPast]} numberOfLines={1}>
                  {item.location}
                </Text>
              )}
              {sourceIcon && (
                <IconSymbol name={sourceIcon as any} size={12} color={C.blueSteel} style={styles.sourceIcon} />
              )}
            </View>
          )}
          {item.isAllDay && (
            <Text style={[styles.allDayBadge, past && styles.textPast]}>All Day</Text>
          )}
        </View>
      </Pressable>
    );
  }, [now, nextUpcoming, currentEvent]);

  const renderSectionHeader = useCallback(({ section }: { section: { key: string; date: Date } }) => {
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionDate}>
          {formatDateHeader(section.date)}
        </Text>
      </View>
    );
  }, []);

  // Mode label for org context line
  const modeLabel = mode.charAt(0).toUpperCase() + mode.slice(1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <SwipeableTwoPage
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* Page 0: Rolling Timeline */}
        <View style={styles.page}>
          <SectionList
            ref={sectionListRef}
            sections={sections}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={{ paddingTop: 8, paddingBottom: 120 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
            ListHeaderComponent={
              <View>
                {/* "Next up" summary strip */}
                <View style={styles.summaryStrip}>
                  <Text style={styles.summaryLabel}>Next</Text>
                  {nextUpcoming ? (
                    <Text style={styles.summaryValue} numberOfLines={1}>
                      {nextUpcoming.title} — {nextUpcoming.time}
                    </Text>
                  ) : (
                    <Text style={styles.summaryValue}>No more events today</Text>
                  )}
                </View>

                {/* Org context line */}
                <View style={styles.orgContextLine}>
                  <View style={styles.modeBadge}>
                    <Text style={styles.modeBadgeText}>{modeLabel}</Text>
                  </View>
                  {org?.name && (
                    <Text style={styles.orgContextText}>{org.name}</Text>
                  )}
                </View>

                {/* Now-line indicator */}
                <View style={styles.nowLineRow}>
                  <View style={styles.nowDot} />
                  <View style={styles.nowLine} />
                  <Text style={styles.nowLabel}>
                    {nowHour > 12 ? nowHour - 12 : nowHour === 0 ? 12 : nowHour}:
                    {nowMinute.toString().padStart(2, '0')} {nowHour >= 12 ? 'PM' : 'AM'}
                  </Text>
                </View>
              </View>
            }
          />
        </View>

        {/* Page 1: Calendar Grid */}
        <View style={styles.page}>
          <CalendarGrid
            selectedDate={calendarSelectedDate}
            onSelectedDateChange={setCalendarSelectedDate}
            onDateSelect={handleDateSelect}
            onAddEvent={handleAddEvent}
          />
        </View>
      </SwipeableTwoPage>

      {/* FAB — Add Event */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 60 }]}
        onPress={handleAddEvent}
      >
        <IconSymbol name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  page: { flex: 1, backgroundColor: '#000000' },

  // Summary strip
  summaryStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: C.secondary,
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
  },

  // Org context line
  orgContextLine: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 8,
  },
  modeBadge: {
    backgroundColor: C.surface,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.label,
  },
  orgContextText: {
    fontSize: 13,
    color: C.secondary,
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 8,
    backgroundColor: C.bg,
  },
  sectionDate: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
  },

  // Event rows
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: C.bg,
  },
  eventRowPast: {
    opacity: 0.5,
  },
  eventRowNext: {
    backgroundColor: C.surface,
    borderRadius: 10,
    marginHorizontal: 8,
    paddingHorizontal: 12,
  },
  eventRowCurrent: {
    borderLeftWidth: 2,
    borderLeftColor: C.label,
  },
  timeCol: {
    width: 60,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.label,
  },
  endTimeText: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 1,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.label,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 13,
    color: C.secondary,
  },
  sourceIcon: {
    marginLeft: 2,
  },
  allDayBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
    marginTop: 2,
  },
  textPast: {
    color: C.muted,
  },

  // Separators
  sectionSeparator: {
    height: 0,
  },

  // Now-line
  nowLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  nowDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.nowLine,
  },
  nowLine: {
    flex: 1,
    height: 1,
    backgroundColor: C.nowLine,
    marginHorizontal: 6,
  },
  nowLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A1A1AA',
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#0B0F14',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
