/**
 * Parish — 3-page swipeable layout for church mode.
 * Page 0: Services — next service hero, filter pills, service list.
 * Page 1: Sermons — series hero, filter pills, sermon list.
 * Page 2: Care — section pills, prayer/visits/milestones/follow-up/discipleship.
 * Identical SwipeablePages / LongPressContextMenu patterns as Office/Campus.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  NEXT_SERVICE,
  CURRENT_SERIES,
  PRAYER_REQUESTS,
  VISITS,
  MILESTONES,
  FOLLOW_UPS,
  DISCIPLESHIP,
  getServices,
  getSermons,
  type ServiceItem,
  type ServiceFilter,
  type ServiceStatus,
  type ServiceType,
  type SermonItem,
  type SermonFilter,
  type CareSection,
  type PrayerStatus,
  type VisitLocation,
  type MilestoneType,
  type FollowUpStage,
  type DiscipleshipStage,
} from '@/data/mock-parish';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const SERVICE_STATUS_COLORS: Record<ServiceStatus, string> = {
  planning: '#F59E0B',
  ready: '#22C55E',
  completed: '#3B82F6',
};

const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  planning: 'Planning',
  ready: 'Ready',
  completed: 'Completed',
};

const SERVICE_TYPE_COLORS: Record<ServiceType, string> = {
  'sunday-morning': '#3B82F6',
  'wednesday-night': '#8B5CF6',
  'special-event': '#F59E0B',
  holiday: '#22C55E',
};

const PRAYER_STATUS_COLORS: Record<PrayerStatus, string> = {
  active: '#3B82F6',
  answered: '#22C55E',
  ongoing: '#F59E0B',
};

const PRAYER_STATUS_LABELS: Record<PrayerStatus, string> = {
  active: 'Active',
  answered: 'Answered',
  ongoing: 'Ongoing',
};

const VISIT_LOCATION_COLORS: Record<VisitLocation, string> = {
  hospital: '#EF4444',
  home: '#3B82F6',
  office: '#F59E0B',
  other: '#52525B',
};

const VISIT_LOCATION_LABELS: Record<VisitLocation, string> = {
  hospital: 'Hospital',
  home: 'Home',
  office: 'Office',
  other: 'Other',
};

const MILESTONE_TYPE_COLORS: Record<MilestoneType, string> = {
  baptism: '#3B82F6',
  salvation: '#22C55E',
  dedication: '#F59E0B',
  marriage: '#EC4899',
  membership: '#8B5CF6',
};

const MILESTONE_TYPE_LABELS: Record<MilestoneType, string> = {
  baptism: 'Baptism',
  salvation: 'Salvation',
  dedication: 'Dedication',
  marriage: 'Marriage',
  membership: 'Membership',
};

const FOLLOW_UP_STAGE_COLORS: Record<FollowUpStage, string> = {
  'first-visit': '#F59E0B',
  contacted: '#E8A317',
  'second-visit': '#A3B518',
  connected: '#5DC726',
  member: '#22C55E',
};

const FOLLOW_UP_STAGE_LABELS: Record<FollowUpStage, string> = {
  'first-visit': 'First Visit',
  contacted: 'Contacted',
  'second-visit': 'Second Visit',
  connected: 'Connected',
  member: 'Member',
};

const DISCIPLESHIP_STAGE_COLORS: Record<DiscipleshipStage, string> = {
  'new-believer': '#F59E0B',
  foundations: '#E8A317',
  'small-group': '#A3B518',
  serving: '#5DC726',
  leading: '#22C55E',
};

const DISCIPLESHIP_STAGE_LABELS: Record<DiscipleshipStage, string> = {
  'new-believer': 'New Believer',
  foundations: 'Foundations',
  'small-group': 'Small Group',
  serving: 'Serving',
  leading: 'Leading',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Next Service Card ──────────────────────────────────────────────────────

function NextServiceCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.nextServiceCard}>
      <View style={s.nextServiceHeader}>
        <Text style={s.nextServiceLabel}>NEXT SERVICE</Text>
        <View style={s.countdownBadge}>
          <Text style={s.countdownText}>{NEXT_SERVICE.countdown}</Text>
        </View>
      </View>
      <Text style={s.nextServiceDate}>{NEXT_SERVICE.date}</Text>
      <View style={s.nextServiceMeta}>
        <Text style={s.nextServiceTime}>{NEXT_SERVICE.time}</Text>
        <Text style={s.nextServiceDot}>·</Text>
        <Text style={s.nextServiceLocation}>{NEXT_SERVICE.location}</Text>
      </View>
    </View>
  );
}

// ─── Service Row ────────────────────────────────────────────────────────────

function ServiceRow({
  service,
  onLongPress,
}: {
  service: ServiceItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = SERVICE_STATUS_COLORS[service.status];
  const statusLabel = SERVICE_STATUS_LABELS[service.status];
  const typeColor = SERVICE_TYPE_COLORS[service.serviceType];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.serviceIcon}>
        <View style={[s.serviceTypeDot, { backgroundColor: typeColor }]} />
      </View>
      <View style={s.rowContent}>
        <View style={s.serviceNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{service.typeLabel}</Text>
          {service.isNext && (
            <View style={s.nextBadge}>
              <Text style={s.nextBadgeText}>Next</Text>
            </View>
          )}
        </View>
        <Text style={s.serviceMeta}>{service.date} · {service.time} · {service.location}</Text>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

// ─── Series Hero ────────────────────────────────────────────────────────────

function SeriesHero() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={[s.seriesHero, { backgroundColor: CURRENT_SERIES.artwork + '22' }]}>
      <View style={[s.seriesArtwork, { backgroundColor: CURRENT_SERIES.artwork }]}>
        <Text style={s.seriesArtworkText}>{CURRENT_SERIES.title.charAt(0)}</Text>
      </View>
      <View style={s.seriesInfo}>
        <Text style={s.seriesTitle}>{CURRENT_SERIES.title}</Text>
        <Text style={s.seriesProgress}>
          Week {CURRENT_SERIES.currentWeek} of {CURRENT_SERIES.totalWeeks}
        </Text>
      </View>
    </View>
  );
}

// ─── Sermon Row ─────────────────────────────────────────────────────────────

function SermonRow({
  sermon,
  onLongPress,
}: {
  sermon: SermonItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.speakerAvatar}>
        <Text style={s.speakerInitials}>{sermon.speakerInitials}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{sermon.title}</Text>
        <View style={s.sermonMetaRow}>
          <Text style={s.sermonMeta}>{sermon.datePreached}</Text>
          {sermon.seriesName && (
            <>
              <Text style={s.sermonDot}>·</Text>
              <Text style={s.sermonSeries} numberOfLines={1}>{sermon.seriesName}</Text>
            </>
          )}
          {sermon.isGuest && (
            <View style={s.guestBadge}>
              <Text style={s.guestBadgeText}>Guest</Text>
            </View>
          )}
        </View>
        <View style={s.sermonMetaRow}>
          <Text style={s.sermonScripture}>{sermon.scriptureRef}</Text>
          <Text style={s.sermonDot}>·</Text>
          <Text style={s.sermonDuration}>{sermon.duration}</Text>
        </View>
      </View>
    </Pressable>
  );
}

// ─── Prayer Row ─────────────────────────────────────────────────────────────

function PrayerRow({ request }: { request: typeof PRAYER_REQUESTS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = PRAYER_STATUS_COLORS[request.status];
  const statusLabel = PRAYER_STATUS_LABELS[request.status];

  return (
    <View style={s.careRow}>
      <View style={[s.careAvatar, request.urgent && { borderWidth: 2, borderColor: C.red }]}>
        <Text style={s.careInitials}>{request.memberInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.careNameRow}>
          <Text style={s.careName}>{request.memberName}</Text>
          {request.urgent && (
            <View style={s.urgentDot} />
          )}
        </View>
        <Text style={s.careDescription} numberOfLines={2}>{request.requestText}</Text>
        <View style={s.careMetaRow}>
          <Text style={s.careDate}>{request.dateSubmitted}</Text>
          <View style={[s.careStatusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[s.careStatusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Visit Row ──────────────────────────────────────────────────────────────

function VisitRow({ visit }: { visit: typeof VISITS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const locColor = VISIT_LOCATION_COLORS[visit.location];
  const locLabel = VISIT_LOCATION_LABELS[visit.location];

  return (
    <View style={s.careRow}>
      <View style={s.careAvatar}>
        <Text style={s.careInitials}>{visit.memberInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.careName}>{visit.memberName}</Text>
        <Text style={s.careDescription} numberOfLines={1}>{visit.reason}</Text>
        <View style={s.careMetaRow}>
          <Text style={s.careDate}>{visit.date}</Text>
          <View style={[s.careStatusBadge, { backgroundColor: locColor + '22' }]}>
            <Text style={[s.careStatusText, { color: locColor }]}>{locLabel}</Text>
          </View>
          {visit.hasFollowUp && (
            <View style={s.followUpIndicator}>
              <Text style={s.followUpIndicatorText}>Follow-up</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Milestone Row ──────────────────────────────────────────────────────────

function MilestoneRow({ milestone }: { milestone: typeof MILESTONES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = MILESTONE_TYPE_COLORS[milestone.type];
  const typeLabel = MILESTONE_TYPE_LABELS[milestone.type];

  return (
    <View style={s.careRow}>
      <View style={s.careAvatar}>
        <Text style={s.careInitials}>{milestone.memberInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.careName}>{milestone.memberName}</Text>
        <View style={s.careMetaRow}>
          <Text style={s.careDate}>{milestone.date}</Text>
          <View style={[s.careStatusBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.careStatusText, { color: typeColor }]}>{typeLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Follow-Up Row ──────────────────────────────────────────────────────────

function FollowUpRow({ entry }: { entry: typeof FOLLOW_UPS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const stageColor = FOLLOW_UP_STAGE_COLORS[entry.stage];
  const stageLabel = FOLLOW_UP_STAGE_LABELS[entry.stage];

  return (
    <View style={s.careRow}>
      <View style={s.careAvatar}>
        <Text style={s.careInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.careName}>{entry.name}</Text>
        <View style={s.careMetaRow}>
          <Text style={s.careDate}>{entry.dateVisited}</Text>
          <View style={[s.careStatusBadge, { backgroundColor: stageColor + '22' }]}>
            <Text style={[s.careStatusText, { color: stageColor }]}>{stageLabel}</Text>
          </View>
          <Text style={s.careAssigned}>{entry.assignedTo}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Discipleship Row ───────────────────────────────────────────────────────

function DiscipleshipRow({ entry }: { entry: typeof DISCIPLESHIP[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const stageColor = DISCIPLESHIP_STAGE_COLORS[entry.stage];
  const stageLabel = DISCIPLESHIP_STAGE_LABELS[entry.stage];

  return (
    <View style={s.careRow}>
      <View style={s.careAvatar}>
        <Text style={s.careInitials}>{entry.memberInitials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.careName}>{entry.memberName}</Text>
        <View style={s.careMetaRow}>
          <View style={[s.careStatusBadge, { backgroundColor: stageColor + '22' }]}>
            <Text style={[s.careStatusText, { color: stageColor }]}>{stageLabel}</Text>
          </View>
          <Text style={s.careDate}>{entry.classesCompleted} classes</Text>
          {entry.mentorName && (
            <Text style={s.careAssigned}>{entry.mentorName}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Section Header ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─── FAB ────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

// ─── Filter Data ────────────────────────────────────────────────────────────

const SERVICE_FILTERS: { key: ServiceFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'completed', label: 'Completed' },
];

const SERMON_FILTERS: { key: SermonFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'current-series', label: 'Current Series' },
  { key: 'past-series', label: 'Past Series' },
  { key: 'standalone', label: 'Standalone' },
  { key: 'guest', label: 'Guest Speakers' },
];

const CARE_SECTIONS: { key: CareSection; label: string }[] = [
  { key: 'prayer', label: 'Prayer' },
  { key: 'visits', label: 'Visits' },
  { key: 'milestones', label: 'Milestones' },
  { key: 'follow-up', label: 'Follow-Up' },
  { key: 'discipleship', label: 'Discipleship' },
];

// ─── Main Component ─────────────────────────────────────────────────────────

export function ParishContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [sermonFilter, setSermonFilter] = useState<SermonFilter>('all');
  const [careSection, setCareSection] = useState<CareSection>('prayer');

  // ── Data ──
  const filteredServices = useMemo(() => getServices(serviceFilter), [serviceFilter]);
  const filteredSermons = useMemo(() => getSermons(sermonFilter), [sermonFilter]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Service ──
  const longPressService = useCallback((service: ServiceItem, pageY: number) => {
    setMenuData({
      title: service.typeLabel,
      subtitle: `${service.date} · ${service.time}`,
      initials: service.serviceType === 'sunday-morning' ? 'SM' : service.serviceType === 'wednesday-night' ? 'WN' : 'SV',
      pageY,
      actions: [
        { key: 'duplicate', label: 'Duplicate', icon: 'doc.on.doc.fill' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Sermon ──
  const longPressSermon = useCallback((sermon: SermonItem, pageY: number) => {
    setMenuData({
      title: sermon.title,
      subtitle: `${sermon.datePreached} · ${sermon.speakerName}`,
      initials: sermon.speakerInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
      >
        {/* ── PAGE 0: SERVICES ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Services" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <NextServiceCard />
            <View style={{ marginTop: 4 }}>
              <FilterPills items={SERVICE_FILTERS} active={serviceFilter} onSelect={setServiceFilter} />
            </View>
            {filteredServices.map((service, idx) => (
              <View key={service.id}>
                {idx > 0 && <View style={s.separator} />}
                <ServiceRow
                  service={service}
                  onLongPress={(pageY) => longPressService(service, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: SERMONS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Sermons" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <SeriesHero />
            <FilterPills items={SERMON_FILTERS} active={sermonFilter} onSelect={setSermonFilter} />
            {filteredSermons.map((sermon, idx) => (
              <View key={sermon.id}>
                {idx > 0 && <View style={s.separator} />}
                <SermonRow
                  sermon={sermon}
                  onLongPress={(pageY) => longPressSermon(sermon, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          {pageIndex === 1 && <FAB onPress={() => {}} />}
        </View>

        {/* ── PAGE 2: CARE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Care" />
            <FilterPills items={CARE_SECTIONS} active={careSection} onSelect={setCareSection} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {careSection === 'prayer' && (
              <>
                <SectionHeader title="Prayer Requests" />
                {PRAYER_REQUESTS.map((request) => (
                  <PrayerRow key={request.id} request={request} />
                ))}
              </>
            )}
            {careSection === 'visits' && (
              <>
                <SectionHeader title="Pastoral Visits" />
                {VISITS.map((visit) => (
                  <VisitRow key={visit.id} visit={visit} />
                ))}
              </>
            )}
            {careSection === 'milestones' && (
              <>
                <SectionHeader title="Milestones" />
                {MILESTONES.map((milestone) => (
                  <MilestoneRow key={milestone.id} milestone={milestone} />
                ))}
              </>
            )}
            {careSection === 'follow-up' && (
              <>
                <SectionHeader title="New Visitor Follow-Up" />
                {FOLLOW_UPS.map((entry) => (
                  <FollowUpRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {careSection === 'discipleship' && (
              <>
                <SectionHeader title="Discipleship Pathway" />
                {DISCIPLESHIP.map((entry) => (
                  <DiscipleshipRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Next service card
  nextServiceCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  nextServiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  nextServiceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  countdownBadge: {
    backgroundColor: C.blue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  countdownText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.blue,
  },
  nextServiceDate: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
    marginBottom: 4,
  },
  nextServiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextServiceTime: {
    fontSize: 14,
    fontWeight: '500',
    color: C.secondary,
  },
  nextServiceDot: {
    fontSize: 14,
    color: C.muted,
  },
  nextServiceLocation: {
    fontSize: 14,
    color: C.muted,
  },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Service row
  serviceIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTypeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  serviceNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  serviceMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
  nextBadge: { backgroundColor: C.blue + '22', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  nextBadgeText: { fontSize: 10, fontWeight: '600', color: C.blue },

  // Status badge (shared)
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Series hero
  seriesHero: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  seriesArtwork: {
    width: 52,
    height: 52,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seriesArtworkText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  seriesInfo: { flex: 1 },
  seriesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: C.label,
    marginBottom: 4,
  },
  seriesProgress: {
    fontSize: 13,
    color: C.secondary,
  },

  // Sermon row
  speakerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  speakerInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  sermonMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  sermonMeta: { fontSize: 13, color: C.muted },
  sermonDot: { fontSize: 13, color: C.muted },
  sermonSeries: { fontSize: 13, color: C.secondary, flex: 1 },
  sermonScripture: { fontSize: 12, fontWeight: '500', color: C.secondary },
  sermonDuration: { fontSize: 12, color: C.muted },
  guestBadge: { backgroundColor: C.amber + '22', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  guestBadgeText: { fontSize: 9, fontWeight: '700', color: C.amber },

  // Care rows (shared)
  careRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  careAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  careInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  careNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  careName: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  careDescription: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
    lineHeight: 18,
  },
  careMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  careDate: {
    fontSize: 12,
    color: C.muted,
  },
  careStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  careStatusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  careAssigned: {
    fontSize: 12,
    color: C.secondary,
  },
  urgentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.red,
  },
  followUpIndicator: {
    backgroundColor: C.amber + '22',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  followUpIndicatorText: {
    fontSize: 9,
    fontWeight: '600',
    color: C.amber,
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
