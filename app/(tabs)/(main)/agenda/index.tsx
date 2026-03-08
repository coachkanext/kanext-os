/**
 * Agenda — Personal timeline + calendar view.
 * Page 0: Rolling timeline with now-line, date sections, time markers.
 * Page 1: Calendar grid with event dots, tap date → jump to timeline.
 * No pinned bubbles row. FAB for adding manual events.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
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
  getAgendaTypeColor,
  formatDateHeader,
  isToday,
  dateKey,
  type PersonalAgendaItem,
} from '@/data/mock-agenda';
import { useOrganization } from '@/context/app-context';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const C = {
  bg: '#000000',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: '#38383A',
  nowLine: '#EF4444',
  surface: '#0B0F14',
};

export default function AgendaScreen() {
  const insets = useSafeAreaInsets();
  const org = useOrganization();
  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
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

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
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

  const renderItem = useCallback(({ item }: { item: PersonalAgendaItem }) => {
    const past = isPastEvent(item);
    const typeColor = getAgendaTypeColor(item.type);

    return (
      <Pressable
        style={[styles.eventRow, past && styles.eventRowPast]}
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

        {/* Color bar */}
        <View style={[styles.colorBar, { backgroundColor: typeColor }]} />

        {/* Content */}
        <View style={styles.eventContent}>
          <Text style={[styles.eventTitle, past && styles.textPast]} numberOfLines={1}>
            {item.title}
          </Text>
          {item.location && (
            <Text style={[styles.eventLocation, past && styles.textPast]} numberOfLines={1}>
              {item.location}
            </Text>
          )}
          {item.isAllDay && (
            <Text style={[styles.allDayBadge, past && styles.textPast]}>All Day</Text>
          )}
        </View>
      </Pressable>
    );
  }, [now]);

  const renderSectionHeader = useCallback(({ section }: { section: { key: string; date: Date } }) => {
    const today = isToday(section.date);
    return (
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionDate, today && styles.sectionDateToday]}>
          {today ? 'Today' : formatDateHeader(section.date)}
        </Text>
        {today && org?.name && (
          <Text style={styles.orgName}>{org.name}</Text>
        )}
      </View>
    );
  }, [org]);

  // Now-line component (rendered between items in today's section)
  const todayKey = dateKey(now);

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
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
            SectionSeparatorComponent={() => <View style={styles.sectionSeparator} />}
            ListHeaderComponent={
              /* Now-line indicator at top if today has events */
              sections.length > 0 && sections[0].key === todayKey ? (
                <View style={styles.nowLineRow}>
                  <View style={styles.nowDot} />
                  <View style={styles.nowLine} />
                  <Text style={styles.nowLabel}>
                    {nowHour > 12 ? nowHour - 12 : nowHour === 0 ? 12 : nowHour}:
                    {nowMinute.toString().padStart(2, '0')} {nowHour >= 12 ? 'PM' : 'AM'}
                  </Text>
                </View>
              ) : null
            }
          />
        </View>

        {/* Page 1: Calendar Grid */}
        <View style={styles.page}>
          <CalendarGrid onDateSelect={handleDateSelect} />
        </View>
      </SwipeableTwoPage>

      {/* FAB — Add Event */}
      <Pressable
        style={[styles.fab, { bottom: insets.bottom + 60 }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          // Would open add event bottom sheet
        }}
      >
        <IconSymbol name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  page: { flex: 1 },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: C.bg,
  },
  sectionDate: {
    fontSize: 17,
    fontWeight: '600',
    color: C.label,
  },
  sectionDateToday: {
    fontSize: 20,
    fontWeight: '700',
  },
  orgName: {
    fontSize: 13,
    color: C.secondary,
    marginTop: 2,
  },

  // Event rows
  eventRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: C.bg,
  },
  eventRowPast: {
    opacity: 0.5,
  },
  timeCol: {
    width: 70,
    alignItems: 'flex-end',
    paddingRight: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    color: C.label,
  },
  endTimeText: {
    fontSize: 12,
    color: C.secondary,
    marginTop: 1,
  },
  colorBar: {
    width: 3,
    borderRadius: 1.5,
    minHeight: 36,
    marginRight: 10,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  eventLocation: {
    fontSize: 13,
    color: C.secondary,
    marginTop: 2,
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
  itemSeparator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: C.separator,
    marginLeft: 82,
  },
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
    color: C.nowLine,
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
