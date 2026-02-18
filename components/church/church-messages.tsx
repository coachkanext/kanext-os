/**
 * Church Messages — 4-view pill-toggled Messages tab.
 * Views: Inbox | Rooms | Requests | Pinned
 *
 * RBAC:
 *   C1/C2 — All 4 views, full admin (approve requests, manage rooms)
 *   C3    — Inbox, Rooms, Requests (staff comms management)
 *   C4    — Inbox, Rooms, Pinned (member access)
 *   C5    — Inbox only (public sermon / message archive)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// RBAC
import type { ChurchRoleLens } from '@/utils/church-rbac';
import {
  isSeniorPastor,
  isElderLevel,
  isStaffLevel,
  isMember,
} from '@/utils/church-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: ChurchRoleLens;
  onSwitchTab?: (index: number) => void;
}

type MessagesView = 'inbox' | 'rooms' | 'requests' | 'pinned';

interface ViewTab {
  id: MessagesView;
  label: string;
}

const ALL_VIEWS: ViewTab[] = [
  { id: 'inbox', label: 'Inbox' },
  { id: 'rooms', label: 'Rooms' },
  { id: 'requests', label: 'Requests' },
  { id: 'pinned', label: 'Pinned' },
];

function getAvailableViews(role: ChurchRoleLens): ViewTab[] {
  // C1/C2: all 4 views
  if (isElderLevel(role)) return ALL_VIEWS;
  // C3: inbox, rooms, requests
  if (role === 'C3') return ALL_VIEWS.filter((v) => v.id !== 'pinned');
  // C4: inbox, rooms, pinned
  if (role === 'C4') return ALL_VIEWS.filter((v) => v.id !== 'requests');
  // C5: inbox only (public sermon/message archive)
  return ALL_VIEWS.filter((v) => v.id === 'inbox');
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Inbox: Sermon Messages ---

type InboxSort = 'recent' | 'series' | 'speaker';

interface SermonMessage {
  id: string;
  type: 'sermon';
  title: string;
  speaker: string;
  date: string;
  series: string;
  seriesColor: string;
  duration: string;
  scripture: string;
  hasNotes: boolean;
}

const SERMONS: SermonMessage[] = [
  { id: 'srm-1', type: 'sermon', title: 'Unshakeable Faith: Week 5', speaker: 'Pastor David', date: 'Feb 16, 2026', series: 'Unshakeable Faith', seriesColor: '#8B5CF6', duration: '42:18', scripture: 'Daniel 3:16-18', hasNotes: true },
  { id: 'srm-2', type: 'sermon', title: 'The Way of Love: Conclusion', speaker: 'Pastor Sarah', date: 'Feb 9, 2026', series: 'The Way of Love', seriesColor: '#EC4899', duration: '38:42', scripture: '1 Corinthians 13:4-8', hasNotes: true },
  { id: 'srm-3', type: 'sermon', title: 'Prayer That Moves Mountains', speaker: 'Elder James', date: 'Feb 2, 2026', series: 'Unshakeable Faith', seriesColor: '#8B5CF6', duration: '45:05', scripture: 'Matthew 17:20', hasNotes: false },
  { id: 'srm-4', type: 'sermon', title: 'The Anchor Holds', speaker: 'Pastor David', date: 'Jan 26, 2026', series: 'Unshakeable Faith', seriesColor: '#8B5CF6', duration: '40:22', scripture: 'Hebrews 6:19-20', hasNotes: true },
  { id: 'srm-5', type: 'sermon', title: 'Walking in the Spirit', speaker: 'Pastor Williams', date: 'Jan 19, 2026', series: 'Life in the Spirit', seriesColor: '#22C55E', duration: '36:48', scripture: 'Galatians 5:16-25', hasNotes: true },
  { id: 'srm-6', type: 'sermon', title: 'The Shield of Faith', speaker: 'Pastor David', date: 'Jan 12, 2026', series: 'Armor of God', seriesColor: '#F59E0B', duration: '41:30', scripture: 'Ephesians 6:16', hasNotes: true },
  { id: 'srm-7', type: 'sermon', title: 'Love Never Fails', speaker: 'Pastor Sarah', date: 'Jan 5, 2026', series: 'The Way of Love', seriesColor: '#EC4899', duration: '39:15', scripture: '1 Corinthians 13:8', hasNotes: false },
  { id: 'srm-8', type: 'sermon', title: 'The Gift of Christmas', speaker: 'Pastor David', date: 'Dec 25, 2025', series: 'Christmas 2025', seriesColor: '#EF4444', duration: '35:40', scripture: 'John 3:16', hasNotes: true },
  { id: 'srm-9', type: 'sermon', title: 'Standing on the Promises', speaker: 'Elder James', date: 'Dec 14, 2025', series: 'Unshakeable Faith', seriesColor: '#8B5CF6', duration: '34:20', scripture: 'Romans 4:18-21', hasNotes: false },
  { id: 'srm-10', type: 'sermon', title: 'The Promise of Emmanuel', speaker: 'Pastor David', date: 'Dec 21, 2025', series: 'Christmas 2025', seriesColor: '#EF4444', duration: '43:10', scripture: 'Isaiah 7:14', hasNotes: true },
];

// --- Inbox: Pastoral Messages ---

type PastoralCategory = 'encouragement' | 'teaching' | 'announcement' | 'update';

interface PastoralMessage {
  id: string;
  type: 'pastoral';
  title: string;
  from: string;
  fromRole: string;
  date: string;
  preview: string;
  category: PastoralCategory;
  isAdminOnly: boolean;
}

const PASTORAL_CATEGORY_COLOR: Record<PastoralCategory, string> = {
  encouragement: '#22C55E',
  teaching: '#3B82F6',
  announcement: '#F59E0B',
  update: '#8B5CF6',
};

const PASTORAL_MESSAGES: PastoralMessage[] = [
  { id: 'pm-1', type: 'pastoral', title: 'A Word of Encouragement for This Season', from: 'Pastor David', fromRole: 'Senior Pastor', date: 'Feb 15, 2026', preview: 'Church family, I want to share something that has been on my heart this week. As we walk through this season of growth together, I am reminded of...', category: 'encouragement', isAdminOnly: false },
  { id: 'pm-2', type: 'pastoral', title: 'Staff Update: Spring Planning', from: 'Lisa Matthews', fromRole: 'Executive Director', date: 'Feb 14, 2026', preview: 'Team, here is our finalized spring calendar with ministry milestones, VBS planning dates, and the missions trip timeline...', category: 'update', isAdminOnly: true },
  { id: 'pm-3', type: 'pastoral', title: 'Prayer Chain: The Johnson Family', from: 'Deacon Rivera', fromRole: 'Deacon', date: 'Feb 13, 2026', preview: 'Please keep the Johnson family in your prayers as they navigate a difficult medical diagnosis. Cards can be sent to...', category: 'encouragement', isAdminOnly: false },
  { id: 'pm-4', type: 'pastoral', title: 'Easter Service Schedule & Volunteer Needs', from: 'Pastor Sarah', fromRole: 'Worship Pastor', date: 'Feb 12, 2026', preview: 'Easter is approaching! We are planning 3 services this year. Here is the schedule and where we still need volunteers...', category: 'announcement', isAdminOnly: false },
  { id: 'pm-5', type: 'pastoral', title: 'New Sermon Series Preview: "Unstoppable"', from: 'Pastor David', fromRole: 'Senior Pastor', date: 'Feb 10, 2026', preview: 'Starting March 1, we kick off a brand-new 6-week series exploring the book of Acts and the early church movement...', category: 'teaching', isAdminOnly: false },
  { id: 'pm-6', type: 'pastoral', title: 'Facilities Budget Q1 Review (Internal)', from: 'Mark Thompson', fromRole: 'Operations Director', date: 'Feb 8, 2026', preview: 'Attached is the Q1 facilities spend report. HVAC replacement is tracking under budget. Parking lot resurfacing moved to Q2...', category: 'update', isAdminOnly: true },
];

// --- Rooms ---

interface ChatRoom {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
  isPublic: boolean;
  isAssigned: boolean; // for C3 filtering
}

const CHAT_ROOMS: ChatRoom[] = [
  { id: 'room-1', name: 'Pastoral Team', icon: 'heart.fill', memberCount: 5, lastMessage: 'Pastor David: Let\'s finalize the counseling schedule for next week.', lastActive: '2h ago', unreadCount: 3, isPublic: false, isAssigned: true },
  { id: 'room-2', name: 'Staff Chat', icon: 'person.3.fill', memberCount: 12, lastMessage: 'Lisa: Reminder — all-staff meeting tomorrow at 10 AM.', lastActive: 'Today', unreadCount: 1, isPublic: false, isAssigned: true },
  { id: 'room-3', name: 'Elder Board', icon: 'shield.fill', memberCount: 8, lastMessage: 'Elder James: Budget review documents uploaded.', lastActive: 'Yesterday', unreadCount: 0, isPublic: false, isAssigned: false },
  { id: 'room-4', name: 'Worship Team', icon: 'music.note.list', memberCount: 15, lastMessage: 'Sarah: Rehearsal moved to Thursday 7 PM this week.', lastActive: '3h ago', unreadCount: 5, isPublic: false, isAssigned: true },
  { id: 'room-5', name: 'Youth Leaders', icon: 'figure.2.arms.open', memberCount: 6, lastMessage: 'Marcus: Lock-in confirmed for March 7. Chaperone list attached.', lastActive: 'Today', unreadCount: 2, isPublic: false, isAssigned: true },
  { id: 'room-6', name: 'Prayer Chain', icon: 'hands.sparkles.fill', memberCount: 20, lastMessage: 'Deacon Rivera: Please add the Martinez family to our list.', lastActive: '1h ago', unreadCount: 4, isPublic: true, isAssigned: true },
  { id: 'room-7', name: 'All Church', icon: 'megaphone.fill', memberCount: 247, lastMessage: 'Pastor David: Happy Sunday, church family! See you tomorrow.', lastActive: '30m ago', unreadCount: 0, isPublic: true, isAssigned: true },
];

// --- Requests ---

type RequestType = 'announcement' | 'email-blast' | 'bulletin-insert' | 'social-media-post';
type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'scheduled';
type UrgencyLevel = 'low' | 'normal' | 'high' | 'urgent';

interface CommunicationRequest {
  id: string;
  from: string;
  subject: string;
  type: RequestType;
  submittedDate: string;
  targetAudience: string;
  urgency: UrgencyLevel;
  status: ApprovalStatus;
  notes?: string;
}

const REQUEST_TYPE_LABEL: Record<RequestType, string> = {
  announcement: 'Announcement',
  'email-blast': 'Email Blast',
  'bulletin-insert': 'Bulletin Insert',
  'social-media-post': 'Social Media',
};

const REQUEST_TYPE_ICON: Record<RequestType, string> = {
  announcement: 'megaphone.fill',
  'email-blast': 'envelope.fill',
  'bulletin-insert': 'doc.text.fill',
  'social-media-post': 'bubble.left.and.bubble.right.fill',
};

const APPROVAL_STATUS_COLOR: Record<ApprovalStatus, string> = {
  pending: '#F59E0B',
  approved: '#22C55E',
  rejected: '#EF4444',
  scheduled: '#3B82F6',
};

const URGENCY_COLOR: Record<UrgencyLevel, string> = {
  low: '#6B7280',
  normal: '#3B82F6',
  high: '#F97316',
  urgent: '#EF4444',
};

const COMMUNICATION_REQUESTS: CommunicationRequest[] = [
  { id: 'req-1', from: 'Pastor Sarah', subject: 'Easter Service Promotion — 3 Services', type: 'email-blast', submittedDate: 'Feb 15, 2026', targetAudience: 'All Members + Contacts', urgency: 'high', status: 'pending', notes: 'Need to send by Feb 20 for max impact.' },
  { id: 'req-2', from: 'Deacon Rivera', subject: 'Baptism Announcement — March 9', type: 'announcement', submittedDate: 'Feb 14, 2026', targetAudience: 'All Church', urgency: 'normal', status: 'approved' },
  { id: 'req-3', from: 'Lisa Matthews', subject: 'Volunteer Drive — Children\'s Ministry', type: 'social-media-post', submittedDate: 'Feb 13, 2026', targetAudience: 'Social Media Followers', urgency: 'normal', status: 'scheduled', notes: 'Scheduled for Feb 18 at 10 AM.' },
  { id: 'req-4', from: 'Marcus Johnson', subject: 'New Small Group Launch — Young Adults', type: 'bulletin-insert', submittedDate: 'Feb 12, 2026', targetAudience: 'Adults 18-30', urgency: 'normal', status: 'pending' },
  { id: 'req-5', from: 'Mark Thompson', subject: 'Holiday Schedule Change — President\'s Day', type: 'announcement', submittedDate: 'Feb 10, 2026', targetAudience: 'Staff + Volunteers', urgency: 'high', status: 'approved' },
  { id: 'req-6', from: 'Elder James', subject: 'Prayer Chain Update — New Format', type: 'email-blast', submittedDate: 'Feb 8, 2026', targetAudience: 'Prayer Chain Members', urgency: 'low', status: 'rejected', notes: 'Needs revision — please clarify opt-in process.' },
  { id: 'req-7', from: 'Pastor David', subject: 'Mission Trip Fundraiser Kickoff', type: 'social-media-post', submittedDate: 'Feb 6, 2026', targetAudience: 'All Members + Public', urgency: 'normal', status: 'scheduled', notes: 'Scheduled for Feb 22. Video asset attached.' },
  { id: 'req-8', from: 'Sarah Kim', subject: 'VBS Registration Open — Summer 2026', type: 'email-blast', submittedDate: 'Feb 4, 2026', targetAudience: 'Families with Children', urgency: 'normal', status: 'pending' },
];

// --- Pinned ---

type PinnedItemType = 'sermon' | 'message' | 'resource';

interface PinnedItem {
  id: string;
  itemType: PinnedItemType;
  title: string;
  author: string;
  datePinned: string;
  originalDate: string;
  description?: string;
}

type PinnedSort = 'date-pinned' | 'date-original' | 'type';

const PINNED_TYPE_ICON: Record<PinnedItemType, string> = {
  sermon: 'play.circle.fill',
  message: 'envelope.fill',
  resource: 'doc.text.fill',
};

const PINNED_TYPE_COLOR: Record<PinnedItemType, string> = {
  sermon: '#8B5CF6',
  message: '#3B82F6',
  resource: '#22C55E',
};

const PINNED_ITEMS: PinnedItem[] = [
  { id: 'pin-1', itemType: 'sermon', title: 'The Gift of Christmas', author: 'Pastor David', datePinned: 'Feb 14, 2026', originalDate: 'Dec 25, 2025', description: 'Powerful Christmas message on John 3:16.' },
  { id: 'pin-2', itemType: 'message', title: 'Easter Service Schedule & Volunteer Needs', author: 'Pastor Sarah', datePinned: 'Feb 12, 2026', originalDate: 'Feb 12, 2026', description: 'Important planning info for Easter weekend.' },
  { id: 'pin-3', itemType: 'sermon', title: 'When Mountains Move', author: 'Pastor David', datePinned: 'Feb 10, 2026', originalDate: 'Jan 26, 2026', description: 'Faith and the impossible — Matthew 17:20.' },
  { id: 'pin-4', itemType: 'resource', title: 'Unshakeable Faith Study Guide', author: 'Teaching Team', datePinned: 'Feb 8, 2026', originalDate: 'Jan 19, 2026', description: 'Small group companion guide for the current series.' },
  { id: 'pin-5', itemType: 'sermon', title: 'The Greatest Commandment', author: 'Pastor David', datePinned: 'Feb 5, 2026', originalDate: 'Jan 12, 2026', description: 'Mark 12:28-34 — love as the foundation.' },
  { id: 'pin-6', itemType: 'message', title: 'A Word of Encouragement for This Season', author: 'Pastor David', datePinned: 'Feb 1, 2026', originalDate: 'Feb 15, 2026', description: 'Pastoral encouragement for the church family.' },
  { id: 'pin-7', itemType: 'resource', title: 'Armor of God Devotional PDF', author: 'Pastor Williams', datePinned: 'Jan 28, 2026', originalDate: 'Aug 1, 2025', description: '7-week daily devotional companion to the Armor of God series.' },
];

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors, count, action }: { title: string; colors: typeof Colors.light; count?: number; action?: string }) {
  return (
    <View style={sh.row}>
      <View style={sh.left}>
        <ThemedText style={[sh.label, { color: colors.textSecondary }]}>{title}</ThemedText>
        {count != null && (
          <View style={[sh.countBadge, { backgroundColor: colors.backgroundTertiary }]}>
            <ThemedText style={[sh.countText, { color: colors.textSecondary }]}>{count}</ThemedText>
          </View>
        )}
      </View>
      {action && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
          <ThemedText style={[sh.action, { color: colors.textTertiary }]}>{action}</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  countBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.full },
  countText: { fontSize: 10, fontWeight: '600' },
  action: { fontSize: 12, fontWeight: '500' },
});

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

// =============================================================================
// VIEW: INBOX
// =============================================================================

function InboxView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [sort, setSort] = useState<InboxSort>('recent');

  // C1/C2/C3 see admin-only messages; C4/C5 see only public
  const visiblePastoral = isStaffLevel(role)
    ? PASTORAL_MESSAGES
    : PASTORAL_MESSAGES.filter((m) => !m.isAdminOnly);

  // Combine for "recent" sort; separate for series/speaker sort
  const allItems: (SermonMessage | PastoralMessage)[] = [...SERMONS, ...visiblePastoral];

  let sortedItems = [...allItems];
  if (sort === 'recent') {
    // Already ordered by date in mock data (most recent first), but interleave
    sortedItems.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return dateB - dateA;
    });
  } else if (sort === 'series') {
    sortedItems.sort((a, b) => {
      const serA = a.type === 'sermon' ? a.series : '~' + a.category;
      const serB = b.type === 'sermon' ? b.series : '~' + b.category;
      return serA.localeCompare(serB);
    });
  } else {
    // speaker
    sortedItems.sort((a, b) => {
      const spkA = a.type === 'sermon' ? a.speaker : a.from;
      const spkB = b.type === 'sermon' ? b.speaker : b.from;
      return spkA.localeCompare(spkB);
    });
  }

  const sortOptions: { id: InboxSort; label: string }[] = [
    { id: 'recent', label: 'Most Recent' },
    { id: 'series', label: 'By Series' },
    { id: 'speaker', label: 'By Speaker' },
  ];

  return (
    <View>
      {/* Sort Pills */}
      <View style={s.moduleContainer}>
        <SectionHeader title="MESSAGES" colors={colors} count={sortedItems.length} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {sortOptions.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                s.filterPill,
                { backgroundColor: sort === opt.id ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSort(opt.id);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: sort === opt.id ? colors.text : colors.textSecondary }]}>
                {opt.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Message List */}
      <View style={s.moduleContainer}>
        <Card colors={colors}>
          {sortedItems.map((item, idx) => {
            if (item.type === 'sermon') {
              return (
                <Pressable
                  key={item.id}
                  style={[
                    s.inboxRow,
                    idx < sortedItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                  ]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  {/* Play button */}
                  <View style={[s.inboxIconWrap, { backgroundColor: '#8B5CF620' }]}>
                    <IconSymbol name="play.fill" size={14} color="#8B5CF6" />
                  </View>

                  {/* Content */}
                  <View style={s.inboxContent}>
                    <ThemedText style={[s.inboxTitle, { color: colors.text }]} numberOfLines={1}>
                      {item.title}
                    </ThemedText>
                    <ThemedText style={[s.inboxMeta, { color: colors.textSecondary }]}>
                      {item.speaker} {'\u00B7'} {item.date}
                    </ThemedText>
                    <View style={s.inboxTagRow}>
                      <View style={[s.seriesBadge, { backgroundColor: item.seriesColor + '20' }]}>
                        <ThemedText style={[s.seriesBadgeText, { color: item.seriesColor }]}>{item.series}</ThemedText>
                      </View>
                      <ThemedText style={[s.inboxScripture, { color: colors.textTertiary }]}>{item.scripture}</ThemedText>
                    </View>
                    <View style={s.inboxFooterRow}>
                      <View style={s.inboxFormatRow}>
                        <View style={[s.formatBadge, { backgroundColor: colors.backgroundTertiary }]}>
                          <IconSymbol name="video.fill" size={9} color={colors.textSecondary} />
                        </View>
                        <View style={[s.formatBadge, { backgroundColor: colors.backgroundTertiary }]}>
                          <IconSymbol name="headphones" size={9} color={colors.textSecondary} />
                        </View>
                        {item.hasNotes && (
                          <View style={[s.formatBadge, { backgroundColor: colors.backgroundTertiary }]}>
                            <IconSymbol name="doc.text.fill" size={9} color={colors.textSecondary} />
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Duration */}
                  <View style={s.inboxRight}>
                    <ThemedText style={[s.inboxDuration, { color: colors.textTertiary }]}>{item.duration}</ThemedText>
                  </View>
                </Pressable>
              );
            }

            // Pastoral message
            return (
              <Pressable
                key={item.id}
                style={[
                  s.inboxRow,
                  idx < sortedItems.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                {/* Icon */}
                <View style={[s.inboxIconWrap, { backgroundColor: PASTORAL_CATEGORY_COLOR[item.category] + '20' }]}>
                  <IconSymbol name="envelope.fill" size={14} color={PASTORAL_CATEGORY_COLOR[item.category]} />
                </View>

                {/* Content */}
                <View style={s.inboxContent}>
                  <ThemedText style={[s.inboxTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={[s.inboxMeta, { color: colors.textSecondary }]}>
                    {item.from} ({item.fromRole}) {'\u00B7'} {item.date}
                  </ThemedText>
                  <ThemedText style={[s.inboxPreview, { color: colors.textTertiary }]} numberOfLines={2}>
                    {item.preview}
                  </ThemedText>
                  <View style={s.inboxTagRow}>
                    <View style={[s.categoryBadge, { backgroundColor: PASTORAL_CATEGORY_COLOR[item.category] + '20' }]}>
                      <ThemedText style={[s.categoryBadgeText, { color: PASTORAL_CATEGORY_COLOR[item.category] }]}>
                        {item.category}
                      </ThemedText>
                    </View>
                    {item.isAdminOnly && (
                      <View style={[s.adminBadge, { backgroundColor: '#EF444420' }]}>
                        <ThemedText style={[s.adminBadgeText, { color: '#EF4444' }]}>STAFF ONLY</ThemedText>
                      </View>
                    )}
                  </View>
                </View>

                {/* Chevron */}
                <View style={s.inboxRight}>
                  <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                </View>
              </Pressable>
            );
          })}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW: ROOMS
// =============================================================================

function RoomsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  // C1/C2: all rooms; C3: assigned rooms; C4: public + their group rooms
  let visibleRooms = CHAT_ROOMS;
  if (role === 'C3') {
    visibleRooms = CHAT_ROOMS.filter((r) => r.isAssigned);
  } else if (role === 'C4') {
    visibleRooms = CHAT_ROOMS.filter((r) => r.isPublic || r.isAssigned);
  }

  // Sort by most recent activity (already sorted in mock data)
  const totalUnread = visibleRooms.reduce((sum, r) => sum + r.unreadCount, 0);

  return (
    <View>
      {/* Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CHAT ROOMS" colors={colors} count={visibleRooms.length} />
        {totalUnread > 0 && (
          <Card colors={colors}>
            <View style={s.roomsSummaryRow}>
              <IconSymbol name="bell.badge.fill" size={16} color="#F59E0B" />
              <ThemedText style={[s.roomsSummaryText, { color: colors.text }]}>
                {totalUnread} unread message{totalUnread !== 1 ? 's' : ''} across {visibleRooms.filter((r) => r.unreadCount > 0).length} room{visibleRooms.filter((r) => r.unreadCount > 0).length !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </Card>
        )}
      </View>

      {/* Rooms List */}
      <View style={s.moduleContainer}>
        <Card colors={colors}>
          {visibleRooms.map((room, idx) => (
            <Pressable
              key={room.id}
              style={[
                s.roomRow,
                idx < visibleRooms.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Room icon */}
              <View style={[s.roomIconWrap, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={room.icon as any} size={16} color={colors.text} />
              </View>

              {/* Room info */}
              <View style={s.roomContent}>
                <View style={s.roomNameRow}>
                  <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>
                    {room.name}
                  </ThemedText>
                  {room.isPublic && (
                    <View style={[s.publicBadge, { backgroundColor: colors.backgroundTertiary }]}>
                      <ThemedText style={[s.publicBadgeText, { color: colors.textTertiary }]}>PUBLIC</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[s.roomMembers, { color: colors.textTertiary }]}>
                  {room.memberCount}{room.memberCount >= 200 ? '+' : ''} member{room.memberCount !== 1 ? 's' : ''} {'\u00B7'} {room.lastActive}
                </ThemedText>
                <ThemedText style={[s.roomLastMsg, { color: colors.textSecondary }]} numberOfLines={1}>
                  {room.lastMessage}
                </ThemedText>
              </View>

              {/* Unread badge */}
              <View style={s.roomRight}>
                {room.unreadCount > 0 ? (
                  <View style={s.unreadBadge}>
                    <ThemedText style={s.unreadBadgeText}>{room.unreadCount}</ThemedText>
                  </View>
                ) : (
                  <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
                )}
              </View>
            </Pressable>
          ))}
        </Card>
      </View>

      {/* Admin actions */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="ROOM MANAGEMENT" colors={colors} />
          <Card colors={colors}>
            <Pressable
              style={s.adminActionRow}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.adminActionIcon, { backgroundColor: '#3B82F620' }]}>
                <IconSymbol name="plus.circle.fill" size={16} color="#3B82F6" />
              </View>
              <ThemedText style={[s.adminActionText, { color: colors.text }]}>Create New Room</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }} />
            <Pressable
              style={s.adminActionRow}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.adminActionIcon, { backgroundColor: '#F59E0B20' }]}>
                <IconSymbol name="person.badge.plus" size={16} color="#F59E0B" />
              </View>
              <ThemedText style={[s.adminActionText, { color: colors.text }]}>Manage Members</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }} />
            <Pressable
              style={s.adminActionRow}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.adminActionIcon, { backgroundColor: '#8B5CF620' }]}>
                <IconSymbol name="gearshape.fill" size={16} color="#8B5CF6" />
              </View>
              <ThemedText style={[s.adminActionText, { color: colors.text }]}>Room Settings</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: REQUESTS
// =============================================================================

function RequestsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [statusFilter, setStatusFilter] = useState<ApprovalStatus | 'all'>('all');

  const filtered = statusFilter === 'all'
    ? COMMUNICATION_REQUESTS
    : COMMUNICATION_REQUESTS.filter((r) => r.status === statusFilter);

  const pendingCount = COMMUNICATION_REQUESTS.filter((r) => r.status === 'pending').length;
  const canApprove = isElderLevel(role);

  const statusOptions: (ApprovalStatus | 'all')[] = ['all', 'pending', 'approved', 'scheduled', 'rejected'];

  return (
    <View>
      {/* Summary KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="COMMUNICATION REQUESTS" colors={colors} count={COMMUNICATION_REQUESTS.length} />
        <Card colors={colors}>
          <View style={s.requestKpiRow}>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#F59E0B' }]}>{pendingCount}</ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
            </View>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#22C55E' }]}>
                {COMMUNICATION_REQUESTS.filter((r) => r.status === 'approved').length}
              </ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>Approved</ThemedText>
            </View>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#3B82F6' }]}>
                {COMMUNICATION_REQUESTS.filter((r) => r.status === 'scheduled').length}
              </ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>Scheduled</ThemedText>
            </View>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#EF4444' }]}>
                {COMMUNICATION_REQUESTS.filter((r) => r.status === 'rejected').length}
              </ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>Rejected</ThemedText>
            </View>
          </View>
        </Card>
      </View>

      {/* Status Filter */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {statusOptions.map((opt) => (
            <Pressable
              key={opt}
              style={[
                s.filterPill,
                { backgroundColor: statusFilter === opt ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setStatusFilter(opt);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: statusFilter === opt ? colors.text : colors.textSecondary }]}>
                {opt === 'all' ? 'All' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Request List */}
      <View style={s.moduleContainer}>
        {filtered.map((req) => (
          <Card key={req.id} colors={colors}>
            {/* Header */}
            <View style={s.reqHeader}>
              <View style={[s.reqTypeIcon, { backgroundColor: colors.backgroundTertiary }]}>
                <IconSymbol name={REQUEST_TYPE_ICON[req.type] as any} size={14} color={colors.text} />
              </View>
              <View style={s.reqHeaderText}>
                <ThemedText style={[s.reqSubject, { color: colors.text }]} numberOfLines={2}>
                  {req.subject}
                </ThemedText>
                <ThemedText style={[s.reqFrom, { color: colors.textSecondary }]}>
                  {req.from} {'\u00B7'} {req.submittedDate}
                </ThemedText>
              </View>
              <View style={[s.statusChip, { backgroundColor: APPROVAL_STATUS_COLOR[req.status] + '20' }]}>
                <View style={[s.statusDot, { backgroundColor: APPROVAL_STATUS_COLOR[req.status] }]} />
                <ThemedText style={[s.statusText, { color: APPROVAL_STATUS_COLOR[req.status] }]}>
                  {req.status}
                </ThemedText>
              </View>
            </View>

            {/* Details */}
            <View style={s.reqDetails}>
              <View style={s.reqDetailRow}>
                <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Type</ThemedText>
                <ThemedText style={[s.reqDetailValue, { color: colors.textSecondary }]}>{REQUEST_TYPE_LABEL[req.type]}</ThemedText>
              </View>
              <View style={s.reqDetailRow}>
                <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Audience</ThemedText>
                <ThemedText style={[s.reqDetailValue, { color: colors.textSecondary }]}>{req.targetAudience}</ThemedText>
              </View>
              <View style={s.reqDetailRow}>
                <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Urgency</ThemedText>
                <ThemedText style={[s.reqDetailValue, { color: URGENCY_COLOR[req.urgency] }]}>
                  {req.urgency.toUpperCase()}
                </ThemedText>
              </View>
              {req.notes && (
                <View style={s.reqDetailRow}>
                  <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Notes</ThemedText>
                  <ThemedText style={[s.reqDetailValue, { color: colors.textSecondary }]} numberOfLines={2}>{req.notes}</ThemedText>
                </View>
              )}
            </View>

            {/* Approval actions — C1/C2 only, for pending requests */}
            {canApprove && req.status === 'pending' && (
              <View style={s.reqActions}>
                <Pressable
                  style={[s.reqActionBtn, { backgroundColor: '#22C55E20' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <IconSymbol name="checkmark" size={12} color="#22C55E" />
                  <ThemedText style={[s.reqActionText, { color: '#22C55E' }]}>Approve</ThemedText>
                </Pressable>
                <Pressable
                  style={[s.reqActionBtn, { backgroundColor: '#EF444420' }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <IconSymbol name="xmark" size={12} color="#EF4444" />
                  <ThemedText style={[s.reqActionText, { color: '#EF4444' }]}>Reject</ThemedText>
                </Pressable>
              </View>
            )}

            {/* Submit CTA for C3 */}
            {role === 'C3' && req.status === 'pending' && (
              <View style={s.reqSubmitHint}>
                <IconSymbol name="clock.fill" size={10} color={colors.textTertiary} />
                <ThemedText style={[s.reqSubmitHintText, { color: colors.textTertiary }]}>
                  Awaiting leadership approval
                </ThemedText>
              </View>
            )}
          </Card>
        ))}
      </View>

      {/* Submit New Request CTA */}
      {isStaffLevel(role) && (
        <View style={s.moduleContainer}>
          <Pressable
            style={[s.submitCta, { backgroundColor: colors.text + '10', borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="plus.circle.fill" size={18} color={colors.text} />
            <ThemedText style={[s.submitCtaText, { color: colors.text }]}>Submit New Request</ThemedText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: PINNED
// =============================================================================

function PinnedView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [sort, setSort] = useState<PinnedSort>('date-pinned');

  let sortedItems = [...PINNED_ITEMS];
  if (sort === 'date-pinned') {
    sortedItems.sort((a, b) => new Date(b.datePinned).getTime() - new Date(a.datePinned).getTime());
  } else if (sort === 'date-original') {
    sortedItems.sort((a, b) => new Date(b.originalDate).getTime() - new Date(a.originalDate).getTime());
  } else {
    // type
    const typeOrder: Record<PinnedItemType, number> = { sermon: 0, message: 1, resource: 2 };
    sortedItems.sort((a, b) => typeOrder[a.itemType] - typeOrder[b.itemType]);
  }

  const sortOptions: { id: PinnedSort; label: string }[] = [
    { id: 'date-pinned', label: 'Date Pinned' },
    { id: 'date-original', label: 'Date Original' },
    { id: 'type', label: 'Type' },
  ];

  // Type counts
  const sermonCount = PINNED_ITEMS.filter((i) => i.itemType === 'sermon').length;
  const messageCount = PINNED_ITEMS.filter((i) => i.itemType === 'message').length;
  const resourceCount = PINNED_ITEMS.filter((i) => i.itemType === 'resource').length;

  return (
    <View>
      {/* Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PINNED ITEMS" colors={colors} count={PINNED_ITEMS.length} />
        <Card colors={colors}>
          <View style={s.pinnedSummaryRow}>
            <View style={s.pinnedSumItem}>
              <View style={[s.pinnedSumDot, { backgroundColor: PINNED_TYPE_COLOR.sermon }]} />
              <ThemedText style={[s.pinnedSumLabel, { color: colors.textSecondary }]}>{sermonCount} Sermon{sermonCount !== 1 ? 's' : ''}</ThemedText>
            </View>
            <View style={s.pinnedSumItem}>
              <View style={[s.pinnedSumDot, { backgroundColor: PINNED_TYPE_COLOR.message }]} />
              <ThemedText style={[s.pinnedSumLabel, { color: colors.textSecondary }]}>{messageCount} Message{messageCount !== 1 ? 's' : ''}</ThemedText>
            </View>
            <View style={s.pinnedSumItem}>
              <View style={[s.pinnedSumDot, { backgroundColor: PINNED_TYPE_COLOR.resource }]} />
              <ThemedText style={[s.pinnedSumLabel, { color: colors.textSecondary }]}>{resourceCount} Resource{resourceCount !== 1 ? 's' : ''}</ThemedText>
            </View>
          </View>
        </Card>
      </View>

      {/* Sort Pills */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {sortOptions.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                s.filterPill,
                { backgroundColor: sort === opt.id ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSort(opt.id);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: sort === opt.id ? colors.text : colors.textSecondary }]}>
                {opt.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Pinned Items List */}
      <View style={s.moduleContainer}>
        {sortedItems.map((item) => (
          <Card key={item.id} colors={colors}>
            <View style={s.pinnedItemRow}>
              {/* Type icon */}
              <View style={[s.pinnedItemIcon, { backgroundColor: PINNED_TYPE_COLOR[item.itemType] + '20' }]}>
                <IconSymbol name={PINNED_TYPE_ICON[item.itemType] as any} size={16} color={PINNED_TYPE_COLOR[item.itemType]} />
              </View>

              {/* Content */}
              <View style={s.pinnedItemContent}>
                <View style={s.pinnedItemNameRow}>
                  <ThemedText style={[s.pinnedItemTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  <View style={[s.pinnedTypeBadge, { backgroundColor: PINNED_TYPE_COLOR[item.itemType] + '20' }]}>
                    <ThemedText style={[s.pinnedTypeText, { color: PINNED_TYPE_COLOR[item.itemType] }]}>
                      {item.itemType}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.pinnedItemAuthor, { color: colors.textSecondary }]}>
                  {item.author}
                </ThemedText>
                {item.description && (
                  <ThemedText style={[s.pinnedItemDesc, { color: colors.textTertiary }]} numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                )}
                <View style={s.pinnedDateRow}>
                  <ThemedText style={[s.pinnedDateLabel, { color: colors.textTertiary }]}>
                    Pinned: {item.datePinned}
                  </ThemedText>
                  <ThemedText style={[s.pinnedDateLabel, { color: colors.textTertiary }]}>
                    {'\u00B7'} Original: {item.originalDate}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Unpin action */}
            <Pressable
              style={[s.unpinBtn, { borderColor: colors.border }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="pin.slash.fill" size={11} color={colors.textSecondary} />
              <ThemedText style={[s.unpinText, { color: colors.textSecondary }]}>Unpin</ThemedText>
            </Pressable>
          </Card>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ChurchMessages({ colors, role = 'C1', onSwitchTab }: Props) {
  const availableViews = getAvailableViews(role);
  const [activeView, setActiveView] = useState<MessagesView>(availableViews[0]?.id ?? 'inbox');

  // If role changes and current view is no longer available, reset
  const currentViewValid = availableViews.some((v) => v.id === activeView);
  const resolvedView = currentViewValid ? activeView : availableViews[0]?.id ?? 'inbox';

  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* View Toggle Pills */}
      {availableViews.length > 1 && (
        <View style={s.pillRow}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillScroll}>
            {availableViews.map((view) => {
              const active = resolvedView === view.id;
              return (
                <Pressable
                  key={view.id}
                  style={[
                    s.pill,
                    {
                      backgroundColor: active ? colors.text : 'transparent',
                      borderColor: active ? colors.text : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setActiveView(view.id);
                  }}
                >
                  <ThemedText style={[s.pillText, { color: active ? colors.background : colors.textSecondary }]}>
                    {view.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Active View */}
      {resolvedView === 'inbox' && <InboxView colors={colors} role={role} />}
      {resolvedView === 'rooms' && <RoomsView colors={colors} role={role} />}
      {resolvedView === 'requests' && <RequestsView colors={colors} role={role} />}
      {resolvedView === 'pinned' && <PinnedView colors={colors} role={role} />}

      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  moduleContainer: { marginBottom: Spacing.lg },
  bottomSpacer: { height: 120 },

  // Card
  card: { borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: StyleSheet.hairlineWidth },

  // Pill toggle
  pillRow: { marginBottom: Spacing.lg },
  pillScroll: { flexDirection: 'row', gap: Spacing.sm, paddingVertical: 2 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  pillText: { fontSize: 13, fontWeight: '600' },

  // Filter pills (sub-view)
  filterScroll: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingVertical: 2 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // Status chip
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'capitalize' },

  // ---- INBOX ----
  inboxRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, gap: 10 },
  inboxIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', paddingLeft: 1, marginTop: 2 },
  inboxContent: { flex: 1 },
  inboxTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  inboxMeta: { fontSize: 11, marginBottom: 4 },
  inboxPreview: { fontSize: 12, lineHeight: 17, marginBottom: 4 },
  inboxTagRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' },
  inboxScripture: { fontSize: 10, fontWeight: '500' },
  inboxFooterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inboxFormatRow: { flexDirection: 'row', gap: 4 },
  inboxRight: { alignItems: 'flex-end', justifyContent: 'center', marginTop: 2 },
  inboxDuration: { fontSize: 12, fontWeight: '500' },

  // Series badge
  seriesBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  seriesBadgeText: { fontSize: 10, fontWeight: '600' },

  // Category badge
  categoryBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  categoryBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },

  // Admin badge
  adminBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  adminBadgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // Format badge
  formatBadge: { width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

  // ---- ROOMS ----
  roomsSummaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  roomsSummaryText: { fontSize: 13, fontWeight: '600' },

  roomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  roomIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roomContent: { flex: 1 },
  roomNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  roomName: { fontSize: 14, fontWeight: '600' },
  roomMembers: { fontSize: 10, marginBottom: 2 },
  roomLastMsg: { fontSize: 12, lineHeight: 16 },
  roomRight: { alignItems: 'center', justifyContent: 'center' },

  publicBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  publicBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  unreadBadge: { backgroundColor: '#3B82F6', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  adminActionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  adminActionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  adminActionText: { flex: 1, fontSize: 14, fontWeight: '600' },

  // ---- REQUESTS ----
  requestKpiRow: { flexDirection: 'row', justifyContent: 'space-around' },
  requestKpi: { alignItems: 'center', minWidth: 60 },
  requestKpiValue: { fontSize: 20, fontWeight: '800' },
  requestKpiLabel: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },

  reqHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  reqTypeIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  reqHeaderText: { flex: 1 },
  reqSubject: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  reqFrom: { fontSize: 11 },

  reqDetails: { gap: 4, marginBottom: Spacing.sm },
  reqDetailRow: { flexDirection: 'row', gap: 8 },
  reqDetailLabel: { fontSize: 11, fontWeight: '500', width: 65 },
  reqDetailValue: { fontSize: 11, flex: 1 },

  reqActions: { flexDirection: 'row', gap: Spacing.sm },
  reqActionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: BorderRadius.md },
  reqActionText: { fontSize: 13, fontWeight: '600' },

  reqSubmitHint: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  reqSubmitHintText: { fontSize: 11 },

  submitCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth },
  submitCtaText: { fontSize: 14, fontWeight: '600' },

  // ---- PINNED ----
  pinnedSummaryRow: { flexDirection: 'row', justifyContent: 'space-around' },
  pinnedSumItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  pinnedSumDot: { width: 8, height: 8, borderRadius: 4 },
  pinnedSumLabel: { fontSize: 12, fontWeight: '500' },

  pinnedItemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: Spacing.sm },
  pinnedItemIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  pinnedItemContent: { flex: 1 },
  pinnedItemNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  pinnedItemTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  pinnedItemAuthor: { fontSize: 11, marginBottom: 2 },
  pinnedItemDesc: { fontSize: 12, lineHeight: 17, marginBottom: 4 },

  pinnedTypeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  pinnedTypeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3, textTransform: 'capitalize' },

  pinnedDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  pinnedDateLabel: { fontSize: 10 },

  unpinBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth },
  unpinText: { fontSize: 11, fontWeight: '600' },
});
