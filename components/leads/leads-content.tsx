/**
 * Leads — 3-page swipeable layout for business mode.
 * Page 0: Pipeline — Kanban board with 6 stages.
 * Page 1: Contacts — filterable contact list with sort.
 * Page 2: Activity — feed with follow-ups, responses, new leads.
 * Identical SwipeablePages / LongPressContextMenu patterns as Prospects.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  PIPELINE_STAGES,
  PIPELINE_SUMMARY,
  getDealsByStage,
  formatDealValue,
  getContacts,
  getActivities,
  ACTIVITY_SUMMARY,
  type LeadDeal,
  type LeadPipelineStage,
  type ContactFilter,
  type ContactSort,
  type ContactItem,
  type ActivityFilter,
  type ActivityItem,
} from '@/data/mock-leads-screen';

import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const COLUMN_WIDTH = Dimensions.get('window').width * 0.72;

// ─── Page Top Bar ──────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ───────────────────────────────────────────────

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

// ─── FAB ───────────────────────────────────────────────────────────────────

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
      <IconSymbol name="plus" size={24} color={C.label} />
    </Pressable>
  );
}

// ─── Pipeline Summary Card ────────────────────────────────────────────────

function PipelineSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>PIPELINE</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{PIPELINE_SUMMARY.dealCount} deals</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{formatDealValue(PIPELINE_SUMMARY.totalValue)}</Text>
          <Text style={s.summaryPosLabel}>Total Value</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{PIPELINE_SUMMARY.dealsWonThisMonth}</Text>
          <Text style={s.summaryPosLabel}>Won This Mo.</Text>
        </View>
        <View style={s.summaryPosItem}>
          <Text style={s.summaryPosCount}>{PIPELINE_SUMMARY.conversionRate}%</Text>
          <Text style={s.summaryPosLabel}>Conversion</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Deal Card (Kanban) ───────────────────────────────────────────────────

function DealCard({
  deal,
  onLongPress,
}: {
  deal: LeadDeal;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const PRIORITY_COLORS: Record<string, string> = {
    hot: C.red,
    warm: C.amber,
    cold: C.blue,
  };
  const priorityColor = PRIORITY_COLORS[deal.priority];

  return (
    <Pressable
      style={({ pressed }) => [s.dealCard, pressed && { opacity: 0.85 }]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.dealCardHeader}>
        <Text style={s.dealCardContact} numberOfLines={1}>{deal.contactName}</Text>
        <View style={[s.priorityPill, { backgroundColor: priorityColor + '22' }]}>
          <Text style={[s.priorityPillText, { color: priorityColor }]}>{deal.priority}</Text>
        </View>
      </View>
      <Text style={s.dealCardCompany} numberOfLines={1}>{deal.companyName}</Text>
      <Text style={s.dealCardTitle} numberOfLines={1}>{deal.title}</Text>
      <Text style={s.dealCardValue}>{formatDealValue(deal.value)}</Text>
      <View style={s.dealCardFooter}>
        <Text style={s.dealCardMeta}>{deal.daysInStage}d in stage</Text>
        <Text style={s.dealCardDot}>&middot;</Text>
        <Text style={s.dealCardMeta}>{deal.lastActivity}</Text>
      </View>
      <View style={s.dealCardBottom}>
        <View style={s.ownerCircle}>
          <Text style={s.ownerInitials}>{deal.ownerInitials}</Text>
        </View>
        <Text style={s.dealCardNextAction} numberOfLines={1}>{deal.nextActionDue}</Text>
      </View>
    </Pressable>
  );
}

// ─── Contact Row ──────────────────────────────────────────────────────────

function ContactRow({
  contact,
  onLongPress,
}: {
  contact: ContactItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const TYPE_COLORS: Record<string, string> = {
    lead: C.blue,
    client: C.green,
    partner: C.purple,
    vendor: C.amber,
    investor: '#1A1714',
  };
  const typeColor = TYPE_COLORS[contact.type] || C.muted;

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.contactAvatar}>
        <Text style={s.contactInitials}>{contact.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.contactNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{contact.name}</Text>
          <View style={[s.typeBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.typeBadgeText, { color: typeColor }]}>{contact.type}</Text>
          </View>
        </View>
        <Text style={s.contactTitle} numberOfLines={1}>{contact.title} · {contact.company}</Text>
        {contact.activeDealTitle && (
          <View style={s.contactDealRow}>
            <IconSymbol name="briefcase.fill" size={10} color={C.muted} />
            <Text style={s.contactDealText} numberOfLines={1}>
              {contact.activeDealTitle} · {formatDealValue(contact.activeDealValue!)}
            </Text>
          </View>
        )}
        <Text style={s.contactLastInteraction}>{contact.lastInteraction}</Text>
      </View>
    </Pressable>
  );
}

// ─── Activity Item ────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, string> = {
  followUp: 'phone.arrow.up.right',
  response: 'envelope.fill',
  newLead: 'person.badge.plus',
  dealMoved: 'arrow.right.circle.fill',
  meetingScheduled: 'calendar',
  dealWon: 'checkmark.seal.fill',
  dealLost: 'xmark.seal.fill',
};

function ActivityRow({
  item,
  onLongPress,
}: {
  item: ActivityItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const ACTIVITY_COLORS: Record<string, string> = {
    followUp: C.amber,
    response: C.blue,
    newLead: C.green,
    dealMoved: C.purple,
    meetingScheduled: C.blue,
    dealWon: C.green,
    dealLost: C.red,
  };
  const iconName = ACTIVITY_ICONS[item.type] || 'circle.fill';
  const color = ACTIVITY_COLORS[item.type] || C.muted;

  return (
    <Pressable
      style={({ pressed }) => [
        s.activityRow,
        pressed && s.rowPressed,
        item.isOverdue && s.activityOverdue,
        item.isDone && s.activityDone,
      ]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={[s.activityIconWrap, { backgroundColor: color + '22' }]}>
        <IconSymbol name={iconName as any} size={16} color={color} />
      </View>
      <View style={s.activityContent}>
        <View style={s.activityTopRow}>
          <Text style={s.activityName} numberOfLines={1}>{item.contactName}</Text>
          <Text style={[s.activityTimestamp, item.isOverdue && { color: C.red }]}>{item.timestamp}</Text>
        </View>
        <Text style={s.activityCompany}>{item.company}</Text>
        <Text style={s.activityDescription} numberOfLines={2}>{item.description}</Text>
        {item.dealName && (
          <View style={s.activityDealRow}>
            <IconSymbol name="briefcase.fill" size={10} color={C.muted} />
            <Text style={s.activityDealText} numberOfLines={1}>
              {item.dealName}{item.dealValue ? ` · ${formatDealValue(item.dealValue)}` : ''}
            </Text>
          </View>
        )}
        {/* Quick action pills for follow-ups */}
        {item.type === 'followUp' && !item.isDone && (
          <View style={s.quickActions}>
            <Pressable style={s.quickPill}><Text style={s.quickPillText}>Call</Text></Pressable>
            <Pressable style={s.quickPill}><Text style={s.quickPillText}>Message</Text></Pressable>
            <Pressable style={s.quickPill}><Text style={s.quickPillText}>Snooze</Text></Pressable>
            <Pressable style={[s.quickPill, { backgroundColor: C.green + '22' }]}><Text style={[s.quickPillText, { color: C.green }]}>Done</Text></Pressable>
          </View>
        )}
        {/* Quick action pills for new leads */}
        {item.type === 'newLead' && (
          <View style={s.quickActions}>
            <Pressable style={[s.quickPill, { backgroundColor: C.blue + '22' }]}><Text style={[s.quickPillText, { color: C.blue }]}>Add to Pipeline</Text></Pressable>
            <Pressable style={s.quickPill}><Text style={s.quickPillText}>Message</Text></Pressable>
            <Pressable style={s.quickPill}><Text style={s.quickPillText}>Call</Text></Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}

// ─── Sort Row ─────────────────────────────────────────────────────────────

function SortRow({
  sort,
  onSort,
}: {
  sort: ContactSort;
  onSort: (key: ContactSort) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const sortOptions: { key: ContactSort; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'lastContact', label: 'Last Contact' },
    { key: 'company', label: 'Company' },
    { key: 'type', label: 'Type' },
    { key: 'dealValue', label: 'Deal Value' },
  ];

  return (
    <View style={s.sortRow}>
      <Text style={s.sortLabel}>Sort by:</Text>
      {sortOptions.map((opt) => (
        <Pressable
          key={opt.key}
          onPress={() => onSort(opt.key)}
          style={[s.sortOption, sort === opt.key && s.sortOptionActive]}
        >
          <Text style={[s.sortOptionText, sort === opt.key && s.sortOptionTextActive]}>{opt.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Filter Data ──────────────────────────────────────────────────────────

const CONTACT_FILTERS: { key: ContactFilter; label: string }[] = [
  { key: 'all',      label: 'All' },
  { key: 'lead',     label: 'Leads' },
  { key: 'client',   label: 'Clients' },
  { key: 'partner',  label: 'Partners' },
  { key: 'vendor',   label: 'Vendors' },
  { key: 'investor', label: 'Investors' },
];

const ACTIVITY_FILTERS: { key: ActivityFilter; label: string }[] = [
  { key: 'all',       label: 'All' },
  { key: 'dueToday',  label: 'Due Today' },
  { key: 'overdue',   label: 'Overdue' },
  { key: 'responses', label: 'Responses' },
  { key: 'newLeads',  label: 'New Leads' },
];

// ─── Main Component ──────────────────────────────────────────────────────

export function LeadsContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);

  // Contacts state
  const [contactFilter, setContactFilter] = useState<ContactFilter>('all');
  const [contactSort, setContactSort] = useState<ContactSort>('name');

  // Activity state
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');

  // ── Data ──
  const contacts = useMemo(
    () => getContacts(contactFilter, contactSort),
    [contactFilter, contactSort],
  );

  const activities = useMemo(
    () => getActivities(activityFilter),
    [activityFilter],
  );

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Deal ──
  const longPressDeal = useCallback((deal: LeadDeal, pageY: number) => {
    setMenuData({
      title: deal.title,
      subtitle: `${deal.contactName} · ${deal.companyName} · ${formatDealValue(deal.value)}`,
      initials: deal.ownerInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit Deal', icon: 'pencil' },
        { key: 'move', label: 'Move Stage', icon: 'arrow.right.circle' },
        { key: 'won', label: 'Mark Won', icon: 'checkmark.seal.fill' },
        { key: 'lost', label: 'Mark Lost', icon: 'xmark.seal.fill' },
        { key: 'delete', label: 'Delete', icon: 'trash.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Contact ──
  const longPressContact = useCallback((contact: ContactItem, pageY: number) => {
    setMenuData({
      title: contact.name,
      subtitle: `${contact.title} · ${contact.company}`,
      initials: contact.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'deal', label: 'Add Deal', icon: 'plus.circle.fill' },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Activity ──
  const longPressActivity = useCallback((item: ActivityItem, pageY: number) => {
    setMenuData({
      title: item.contactName,
      subtitle: item.description,
      initials: item.contactInitials,
      pageY,
      actions: [
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'snooze', label: 'Snooze', icon: 'clock.fill' },
        { key: 'dismiss', label: 'Dismiss', icon: 'xmark.circle.fill' },
        { key: 'note', label: 'Add Note', icon: 'note.text' },
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
        {/* ── PAGE 0: PIPELINE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Pipeline" />
          </View>

          {/* Summary card */}
          <PipelineSummaryCard />

          {/* Horizontal Kanban */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.kanbanScroll}
            decelerationRate="fast"
            snapToInterval={COLUMN_WIDTH + 12}
          >
            {PIPELINE_STAGES.map(({ stage, color }) => {
              const deals = getDealsByStage(stage);
              const stageTotal = deals.reduce((sum, d) => sum + d.value, 0);
              return (
                <View key={stage} style={[s.column, { width: COLUMN_WIDTH }]}>
                  {/* Column header */}
                  <View style={s.columnHeader}>
                    <View style={[s.stageIndicator, { backgroundColor: color }]} />
                    <Text style={s.columnTitle}>{stage}</Text>
                    <View style={[s.countBadge, { backgroundColor: color + '20' }]}>
                      <Text style={[s.countText, { color }]}>{deals.length}</Text>
                    </View>
                    <Text style={s.columnValue}>{formatDealValue(stageTotal)}</Text>
                  </View>

                  {/* Deal cards */}
                  <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.columnContent}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                  >
                    {deals.length === 0 ? (
                      <View style={s.emptyColumn}>
                        <Text style={s.emptyText}>No deals</Text>
                      </View>
                    ) : (
                      deals.map((deal) => (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          onLongPress={(pageY) => longPressDeal(deal, pageY)}
                        />
                      ))
                    )}
                    <View style={{ height: 100 }} />
                  </ScrollView>
                </View>
              );
            })}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: CONTACTS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Contacts" />
            <FilterPills items={CONTACT_FILTERS} active={contactFilter} onSelect={setContactFilter} />
            <SortRow sort={contactSort} onSort={setContactSort} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {contacts.map((contact, idx) => (
              <View key={contact.id}>
                {idx > 0 && <View style={s.separator} />}
                <ContactRow
                  contact={contact}
                  onLongPress={(pageY) => longPressContact(contact, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 2: ACTIVITY ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Activity" />
            {/* Summary header */}
            <View style={s.activitySummary}>
              <Text style={s.activitySummaryText}>
                {ACTIVITY_SUMMARY.followUpsDue} follow-ups due · {ACTIVITY_SUMMARY.responsesReceived} responses · {ACTIVITY_SUMMARY.newLeadsCount} new leads
              </Text>
            </View>
            <FilterPills items={ACTIVITY_FILTERS} active={activityFilter} onSelect={setActivityFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {activities.map((item, idx) => (
              <View key={item.id}>
                {idx > 0 && <View style={s.separator} />}
                <ActivityRow
                  item={item}
                  onLongPress={(pageY) => longPressActivity(item, pageY)}
                />
              </View>
            ))}
          </ScrollView>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────

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

  // Summary card
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  summaryBadge: {
    backgroundColor: C.blue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.blue,
  },
  summaryPositions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryPosItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryPosCount: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryPosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },

  // Kanban
  kanbanScroll: { paddingHorizontal: 16, paddingTop: 4, gap: 12 },
  column: { flex: 1 },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10, paddingHorizontal: 2 },
  stageIndicator: { width: 4, height: 16, borderRadius: 2 },
  columnTitle: { fontSize: 13, fontWeight: '700', color: C.label, flex: 1 },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { fontSize: 11, fontWeight: '800' },
  columnValue: { fontSize: 11, fontWeight: '600', color: C.muted },
  columnContent: { gap: 8 },
  emptyColumn: { padding: 20, borderRadius: 10, borderWidth: 1, borderStyle: 'dashed', borderColor: C.separator, alignItems: 'center' },
  emptyText: { fontSize: 12, color: C.muted },

  // Deal card
  dealCard: {
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 14,
  },
  dealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  dealCardContact: { fontSize: 14, fontWeight: '600', color: C.label, flex: 1 },
  dealCardCompany: { fontSize: 12, color: C.muted, marginBottom: 6 },
  dealCardTitle: { fontSize: 13, fontWeight: '500', color: C.secondary, marginBottom: 6 },
  dealCardValue: { fontSize: 18, fontWeight: '800', color: C.label, marginBottom: 6 },
  dealCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 6 },
  dealCardMeta: { fontSize: 11, color: C.muted },
  dealCardDot: { fontSize: 11, color: C.muted },
  dealCardBottom: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  ownerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ownerInitials: { fontSize: 8, fontWeight: '700', color: C.secondary },
  dealCardNextAction: { fontSize: 11, color: C.muted, flex: 1 },
  priorityPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  priorityPillText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },

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

  // Contact row
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeBadgeText: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  contactTitle: { fontSize: 12, color: C.muted, marginTop: 2 },
  contactDealRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  contactDealText: { fontSize: 11, color: C.secondary },
  contactLastInteraction: { fontSize: 11, color: C.muted, marginTop: 2 },

  // Activity row
  activityRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  activityOverdue: {
    borderLeftWidth: 3,
    borderLeftColor: C.red,
  },
  activityDone: {
    opacity: 0.5,
  },
  activityIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: { flex: 1, marginLeft: 12 },
  activityTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityName: { fontSize: 15, fontWeight: '600', color: C.label, flex: 1 },
  activityTimestamp: { fontSize: 11, color: C.muted },
  activityCompany: { fontSize: 12, color: C.muted, marginTop: 1 },
  activityDescription: { fontSize: 13, color: C.secondary, marginTop: 3 },
  activityDealRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  activityDealText: { fontSize: 11, color: C.muted },
  activitySummary: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  activitySummaryText: {
    fontSize: 13,
    color: C.secondary,
    fontWeight: '500',
  },

  // Quick action pills
  quickActions: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  quickPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.label,
  },

  // Sort row
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  sortLabel: {
    fontSize: 12,
    color: C.muted,
  },
  sortOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortOptionActive: {
    backgroundColor: C.surface,
  },
  sortOptionText: {
    fontSize: 12,
    color: C.muted,
  },
  sortOptionTextActive: {
    color: C.label,
    fontWeight: '600',
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
