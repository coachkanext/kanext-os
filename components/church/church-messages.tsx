/**
 * Church Messages — 4-view pill-toggled Messages tab.
 * Views: Inbox | Rooms | Requests | Pinned
 *
 * SPEC v2 Changes:
 *   Inbox   → Thread-based unified inbox (not sermon archive)
 *   Rooms   → Audience scope, posting permissions, moderation toggle
 *   Requests → Pastoral intake forms (not comms approvals)
 *   Pinned  → Auto-pin concept (emergency / service-change / manual)
 *
 * RBAC:
 *   C1/C2 — All 4 views, full admin (approve requests, manage rooms)
 *   C3    — Inbox, Rooms, Requests (staff comms management)
 *   C4    — Inbox, Rooms, Pinned (member access)
 *   C5    — Inbox only (limited thread view)
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
  if (isElderLevel(role)) return ALL_VIEWS;
  if (role === 'C3') return ALL_VIEWS.filter((v) => v.id !== 'pinned');
  if (role === 'C4') return ALL_VIEWS.filter((v) => v.id !== 'requests');
  return ALL_VIEWS.filter((v) => v.id === 'inbox');
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Inbox: Thread-based message list ---

type ThreadPriority = 'emergency' | 'schedule-change' | 'standard';
type ThreadCategory = 'announcement' | 'ministry' | 'direct' | 'staff' | 'prayer';
type InboxFilter = 'all' | 'announcements' | 'my-ministries' | 'direct' | 'staff' | 'unread';

interface MessageThread {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  priority: ThreadPriority;
  category: ThreadCategory;
  senderAvatar?: string;
  mentioned?: boolean;
  visibleTo: 'all' | 'members' | 'staff' | 'leadership';
}

const MESSAGE_THREADS: MessageThread[] = [
  { id: 'th-1', name: 'EMERGENCY: Severe Weather Alert', lastMessage: 'All evening services cancelled tonight. Stay safe, church family.', timestamp: '10m ago', unreadCount: 1, priority: 'emergency', category: 'announcement', visibleTo: 'all' },
  { id: 'th-2', name: 'Service Time Change — Feb 22', lastMessage: 'Sunday service moved to 11:00 AM due to facility maintenance.', timestamp: '2h ago', unreadCount: 1, priority: 'schedule-change', category: 'announcement', visibleTo: 'all' },
  { id: 'th-3', name: 'Pastor David', lastMessage: 'Can you review the Easter service run sheet? I attached the latest draft.', timestamp: '3h ago', unreadCount: 2, priority: 'standard', category: 'direct', mentioned: true, visibleTo: 'staff' },
  { id: 'th-4', name: 'Worship Ministry', lastMessage: 'Rehearsal moved to Thursday 7 PM. Chart for "How Great Is Our God" uploaded.', timestamp: '4h ago', unreadCount: 3, priority: 'standard', category: 'ministry', visibleTo: 'members' },
  { id: 'th-5', name: 'Staff Announcements', lastMessage: 'All-staff meeting tomorrow 10 AM. Agenda: Easter planning, VBS dates, budget.', timestamp: '5h ago', unreadCount: 1, priority: 'standard', category: 'staff', visibleTo: 'staff' },
  { id: 'th-6', name: 'Children\'s Ministry', lastMessage: 'We still need 2 volunteers for Sunday nursery. Please reach out if available!', timestamp: '6h ago', unreadCount: 0, priority: 'standard', category: 'ministry', visibleTo: 'members' },
  { id: 'th-7', name: 'New Sermon Series: Unshakeable Faith', lastMessage: 'Starting this Sunday — 8-week journey through Hebrews 11.', timestamp: '8h ago', unreadCount: 0, priority: 'standard', category: 'announcement', visibleTo: 'all' },
  { id: 'th-8', name: 'Elder Board', lastMessage: 'Budget review docs uploaded. Please review before Thursday call.', timestamp: '1d ago', unreadCount: 0, priority: 'standard', category: 'staff', visibleTo: 'leadership' },
  { id: 'th-9', name: 'Prayer Chain', lastMessage: 'Please add the Martinez family to our prayer list — medical situation.', timestamp: '1d ago', unreadCount: 2, priority: 'standard', category: 'prayer', visibleTo: 'members' },
  { id: 'th-10', name: 'Youth Ministry', lastMessage: 'Lock-in confirmed for March 7! Chaperone sign-up in lobby Sunday.', timestamp: '1d ago', unreadCount: 0, priority: 'standard', category: 'ministry', visibleTo: 'members' },
  { id: 'th-11', name: 'Building Fund Update', lastMessage: '$780K of $1M raised. Phase 2 construction starts March 1.', timestamp: '2d ago', unreadCount: 0, priority: 'standard', category: 'announcement', visibleTo: 'all' },
  { id: 'th-12', name: 'Lisa Matthews', lastMessage: 'Spring calendar finalized. Attaching ministry milestone tracker.', timestamp: '2d ago', unreadCount: 0, priority: 'standard', category: 'direct', visibleTo: 'staff' },
];

const PRIORITY_ORDER: Record<ThreadPriority, number> = { emergency: 0, 'schedule-change': 1, standard: 2 };
const PRIORITY_COLOR: Record<ThreadPriority, string> = { emergency: '#EF4444', 'schedule-change': '#F59E0B', standard: '#3B82F6' };
const CATEGORY_ICON: Record<ThreadCategory, string> = {
  announcement: 'megaphone.fill',
  ministry: 'heart.fill',
  direct: 'person.fill',
  staff: 'person.3.fill',
  prayer: 'hands.sparkles.fill',
};

function filterThreadsByRole(threads: MessageThread[], role: ChurchRoleLens): MessageThread[] {
  return threads.filter((t) => {
    if (t.visibleTo === 'all') return true;
    if (t.visibleTo === 'members' && role !== 'C5') return true;
    if (t.visibleTo === 'staff' && isStaffLevel(role)) return true;
    if (t.visibleTo === 'leadership' && isElderLevel(role)) return true;
    return false;
  });
}

function sortThreads(threads: MessageThread[]): MessageThread[] {
  return [...threads].sort((a, b) => {
    // Emergency first
    const priDiff = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priDiff !== 0) return priDiff;
    // Mentions
    if (a.mentioned && !b.mentioned) return -1;
    if (!a.mentioned && b.mentioned) return 1;
    // Unread
    if (a.unreadCount > 0 && b.unreadCount === 0) return -1;
    if (a.unreadCount === 0 && b.unreadCount > 0) return 1;
    // Recency (mock: already ordered)
    return 0;
  });
}

function matchesFilter(thread: MessageThread, filter: InboxFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'unread') return thread.unreadCount > 0;
  if (filter === 'announcements') return thread.category === 'announcement';
  if (filter === 'my-ministries') return thread.category === 'ministry';
  if (filter === 'direct') return thread.category === 'direct';
  if (filter === 'staff') return thread.category === 'staff';
  return true;
}

// --- Rooms ---

type AudienceScope = 'Public' | 'Church-wide' | 'Ministry' | 'Leadership' | 'Custom';

interface ChatRoom {
  id: string;
  name: string;
  icon: string;
  memberCount: number;
  lastMessage: string;
  lastActive: string;
  unreadCount: number;
  audienceScope: AudienceScope;
  postingPermissions: 'anyone' | 'admins-only' | 'approved-members';
  moderationEnabled: boolean;
  isAssigned: boolean;
}

const CHAT_ROOMS: ChatRoom[] = [
  { id: 'room-1', name: 'Pastoral Team', icon: 'heart.fill', memberCount: 5, lastMessage: 'Pastor David: Let\'s finalize the counseling schedule for next week.', lastActive: '2h ago', unreadCount: 3, audienceScope: 'Leadership', postingPermissions: 'anyone', moderationEnabled: false, isAssigned: true },
  { id: 'room-2', name: 'Staff Chat', icon: 'person.3.fill', memberCount: 12, lastMessage: 'Lisa: Reminder — all-staff meeting tomorrow at 10 AM.', lastActive: 'Today', unreadCount: 1, audienceScope: 'Ministry', postingPermissions: 'anyone', moderationEnabled: false, isAssigned: true },
  { id: 'room-3', name: 'Elder Board', icon: 'shield.fill', memberCount: 8, lastMessage: 'Elder James: Budget review documents uploaded.', lastActive: 'Yesterday', unreadCount: 0, audienceScope: 'Leadership', postingPermissions: 'anyone', moderationEnabled: true, isAssigned: false },
  { id: 'room-4', name: 'Worship Team', icon: 'music.note.list', memberCount: 15, lastMessage: 'Sarah: Rehearsal moved to Thursday 7 PM this week.', lastActive: '3h ago', unreadCount: 5, audienceScope: 'Ministry', postingPermissions: 'anyone', moderationEnabled: false, isAssigned: true },
  { id: 'room-5', name: 'Youth Leaders', icon: 'figure.2.arms.open', memberCount: 6, lastMessage: 'Marcus: Lock-in confirmed for March 7. Chaperone list attached.', lastActive: 'Today', unreadCount: 2, audienceScope: 'Ministry', postingPermissions: 'approved-members', moderationEnabled: true, isAssigned: true },
  { id: 'room-6', name: 'Prayer Chain', icon: 'hands.sparkles.fill', memberCount: 20, lastMessage: 'Deacon Rivera: Please add the Martinez family to our list.', lastActive: '1h ago', unreadCount: 4, audienceScope: 'Church-wide', postingPermissions: 'anyone', moderationEnabled: false, isAssigned: true },
  { id: 'room-7', name: 'All Church', icon: 'megaphone.fill', memberCount: 247, lastMessage: 'Pastor David: Happy Sunday, church family! See you tomorrow.', lastActive: '30m ago', unreadCount: 0, audienceScope: 'Public', postingPermissions: 'admins-only', moderationEnabled: true, isAssigned: true },
];

const SCOPE_COLOR: Record<AudienceScope, string> = {
  Public: '#22C55E',
  'Church-wide': '#3B82F6',
  Ministry: '#8B5CF6',
  Leadership: '#F59E0B',
  Custom: '#6B7280',
};

// --- Requests: Pastoral Intake ---

type PastoralRequestType = 'pastoral-meeting' | 'volunteer-interest' | 'baptism-membership' | 'counseling' | 'facility-room' | 'question-leadership';
type RequestStatus = 'new' | 'assigned' | 'in-progress' | 'closed';
type PrivacyRouting = 'pastor-only' | 'leaders-only' | 'staff';

interface PastoralRequest {
  id: string;
  from: string;
  type: PastoralRequestType;
  subject: string;
  submittedDate: string;
  status: RequestStatus;
  privacy: PrivacyRouting;
  assignedTo?: string;
  slaHours: number;
  elapsedHours: number;
  notes?: string;
}

const REQUEST_TYPE_LABEL: Record<PastoralRequestType, string> = {
  'pastoral-meeting': 'Pastoral Meeting',
  'volunteer-interest': 'Volunteer Interest',
  'baptism-membership': 'Baptism / Membership',
  'counseling': 'Counseling',
  'facility-room': 'Facility / Room',
  'question-leadership': 'Question for Leadership',
};

const REQUEST_TYPE_ICON: Record<PastoralRequestType, string> = {
  'pastoral-meeting': 'person.fill',
  'volunteer-interest': 'hand.raised.fill',
  'baptism-membership': 'drop.fill',
  'counseling': 'heart.text.square.fill',
  'facility-room': 'building.2.fill',
  'question-leadership': 'questionmark.circle.fill',
};

const STATUS_COLOR: Record<RequestStatus, string> = {
  new: '#3B82F6',
  assigned: '#F59E0B',
  'in-progress': '#8B5CF6',
  closed: '#22C55E',
};

const PRIVACY_LABEL: Record<PrivacyRouting, string> = {
  'pastor-only': 'Pastor Only',
  'leaders-only': 'Leaders Only',
  'staff': 'Staff',
};

const PASTORAL_REQUESTS: PastoralRequest[] = [
  { id: 'req-1', from: 'Maria Santos', type: 'counseling', subject: 'Family counseling request — confidential', submittedDate: 'Feb 17, 2026', status: 'new', privacy: 'pastor-only', slaHours: 48, elapsedHours: 12 },
  { id: 'req-2', from: 'James Wilson', type: 'baptism-membership', subject: 'Interested in baptism — new believer', submittedDate: 'Feb 16, 2026', status: 'assigned', privacy: 'staff', assignedTo: 'Pastor Sarah', slaHours: 48, elapsedHours: 28 },
  { id: 'req-3', from: 'Sarah Kim', type: 'volunteer-interest', subject: 'Want to serve in Children\'s Ministry', submittedDate: 'Feb 15, 2026', status: 'in-progress', privacy: 'staff', assignedTo: 'Lisa Matthews', slaHours: 48, elapsedHours: 52, notes: 'Background check in progress.' },
  { id: 'req-4', from: 'David & Ruth Chen', type: 'pastoral-meeting', subject: 'Marriage enrichment discussion', submittedDate: 'Feb 14, 2026', status: 'assigned', privacy: 'pastor-only', assignedTo: 'Pastor Williams', slaHours: 48, elapsedHours: 72 },
  { id: 'req-5', from: 'Marcus Johnson', type: 'facility-room', subject: 'Reserve fellowship hall for youth event Mar 7', submittedDate: 'Feb 13, 2026', status: 'in-progress', privacy: 'staff', assignedTo: 'Mark Thompson', slaHours: 48, elapsedHours: 96 },
  { id: 'req-6', from: 'Rebecca Martinez', type: 'question-leadership', subject: 'How to start a new small group?', submittedDate: 'Feb 12, 2026', status: 'closed', privacy: 'staff', assignedTo: 'Deacon Rivera', slaHours: 48, elapsedHours: 120, notes: 'Connected with small group coordinator.' },
  { id: 'req-7', from: 'Thomas Green', type: 'baptism-membership', subject: 'Transfer membership from Grace Community', submittedDate: 'Feb 10, 2026', status: 'closed', privacy: 'staff', assignedTo: 'Pastor David', slaHours: 48, elapsedHours: 168, notes: 'Membership approved by elder board.' },
  { id: 'req-8', from: 'Anonymous', type: 'counseling', subject: 'Struggling with anxiety — need prayer and guidance', submittedDate: 'Feb 18, 2026', status: 'new', privacy: 'pastor-only', slaHours: 48, elapsedHours: 4 },
];

// --- Pinned: with auto-pin concept ---

type PinSource = 'emergency' | 'service-change' | 'manual';

interface PinnedItem {
  id: string;
  title: string;
  description: string;
  source: PinSource;
  pinDate: string;
  expiresDate?: string;
  isActive: boolean;
}

const PIN_SOURCE_COLOR: Record<PinSource, string> = {
  emergency: '#EF4444',
  'service-change': '#F59E0B',
  manual: '#3B82F6',
};

const PIN_SOURCE_LABEL: Record<PinSource, string> = {
  emergency: 'EMERGENCY',
  'service-change': 'SERVICE CHANGE',
  manual: 'PINNED',
};

const PINNED_ITEMS: PinnedItem[] = [
  { id: 'pin-1', title: 'Severe Weather Alert — Evening Services Cancelled', description: 'All evening activities cancelled tonight due to severe weather warnings. Stay home and stay safe.', source: 'emergency', pinDate: 'Feb 18, 2026', isActive: true },
  { id: 'pin-2', title: 'Service Time Change — Feb 22', description: 'Sunday service moved to 11:00 AM due to facility maintenance. Regular time resumes Mar 1.', source: 'service-change', pinDate: 'Feb 16, 2026', expiresDate: 'Feb 23, 2026', isActive: true },
  { id: 'pin-3', title: 'Easter Service Schedule & Volunteer Needs', description: 'Three services planned: 8 AM, 10 AM, 12 PM. Volunteer sign-up in lobby or online.', source: 'manual', pinDate: 'Feb 12, 2026', isActive: true },
  { id: 'pin-4', title: 'Building Fund Milestone — $780K of $1M', description: 'Phase 2 construction begins March 1. Thank you for your faithful generosity!', source: 'manual', pinDate: 'Feb 10, 2026', isActive: true },
  { id: 'pin-5', title: 'New Sermon Series: Unshakeable Faith', description: '8-week journey through Hebrews 11. Study guides available at info table.', source: 'manual', pinDate: 'Feb 8, 2026', isActive: true },
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
// VIEW: INBOX (thread-based)
// =============================================================================

function InboxView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [filter, setFilter] = useState<InboxFilter>('all');

  const roleFiltered = filterThreadsByRole(MESSAGE_THREADS, role);
  const filtered = roleFiltered.filter((t) => matchesFilter(t, filter));
  const sorted = sortThreads(filtered);

  const filterOptions: { id: InboxFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'announcements', label: 'Announcements' },
    { id: 'my-ministries', label: 'My Ministries' },
    { id: 'direct', label: 'Direct' },
    ...(isStaffLevel(role) ? [{ id: 'staff' as InboxFilter, label: 'Staff' }] : []),
    { id: 'unread', label: 'Unread' },
  ];

  const totalUnread = roleFiltered.reduce((sum, t) => sum + t.unreadCount, 0);

  return (
    <View>
      {/* Summary */}
      {totalUnread > 0 && (
        <View style={s.moduleContainer}>
          <Card colors={colors}>
            <View style={s.summaryRow}>
              <IconSymbol name="bell.badge.fill" size={16} color="#3B82F6" />
              <ThemedText style={[s.summaryText, { color: colors.text }]}>
                {totalUnread} unread message{totalUnread !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </Card>
        </View>
      )}

      {/* Filter Chips */}
      <View style={s.moduleContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterScroll}>
          {filterOptions.map((opt) => (
            <Pressable
              key={opt.id}
              style={[
                s.filterPill,
                { backgroundColor: filter === opt.id ? colors.text + '15' : 'transparent', borderColor: colors.border },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(opt.id);
              }}
            >
              <ThemedText style={[s.filterPillText, { color: filter === opt.id ? colors.text : colors.textSecondary }]}>
                {opt.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Thread List */}
      <View style={s.moduleContainer}>
        <SectionHeader title="MESSAGES" colors={colors} count={sorted.length} />
        <Card colors={colors}>
          {sorted.map((thread, idx) => (
            <Pressable
              key={thread.id}
              style={[
                s.threadRow,
                idx < sorted.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              {/* Category icon */}
              <View style={[s.threadIconWrap, { backgroundColor: PRIORITY_COLOR[thread.priority] + '15' }]}>
                <IconSymbol name={CATEGORY_ICON[thread.category] as any} size={14} color={PRIORITY_COLOR[thread.priority]} />
              </View>

              {/* Content */}
              <View style={s.threadContent}>
                <View style={s.threadNameRow}>
                  <ThemedText
                    style={[s.threadName, { color: colors.text, fontWeight: thread.unreadCount > 0 ? '700' : '600' }]}
                    numberOfLines={1}
                  >
                    {thread.name}
                  </ThemedText>
                  {thread.priority !== 'standard' && (
                    <View style={[s.priorityBadge, { backgroundColor: PRIORITY_COLOR[thread.priority] + '20' }]}>
                      <ThemedText style={[s.priorityText, { color: PRIORITY_COLOR[thread.priority] }]}>
                        {thread.priority === 'emergency' ? 'EMERGENCY' : 'SCHEDULE'}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText
                  style={[s.threadPreview, { color: thread.unreadCount > 0 ? colors.text : colors.textSecondary }]}
                  numberOfLines={1}
                >
                  {thread.lastMessage}
                </ThemedText>
              </View>

              {/* Right: timestamp + unread */}
              <View style={s.threadRight}>
                <ThemedText style={[s.threadTimestamp, { color: colors.textTertiary }]}>{thread.timestamp}</ThemedText>
                {thread.unreadCount > 0 && (
                  <View style={s.unreadBadge}>
                    <ThemedText style={s.unreadBadgeText}>{thread.unreadCount}</ThemedText>
                  </View>
                )}
                {thread.mentioned && thread.unreadCount === 0 && (
                  <View style={[s.mentionDot, { backgroundColor: '#F59E0B' }]} />
                )}
              </View>
            </Pressable>
          ))}
        </Card>
      </View>
    </View>
  );
}

// =============================================================================
// VIEW: ROOMS (with audience scope, posting permissions, moderation)
// =============================================================================

function RoomsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  let visibleRooms = CHAT_ROOMS;
  if (role === 'C3') {
    visibleRooms = CHAT_ROOMS.filter((r) => r.isAssigned);
  } else if (role === 'C4') {
    visibleRooms = CHAT_ROOMS.filter((r) => r.audienceScope === 'Public' || r.audienceScope === 'Church-wide' || r.isAssigned);
  } else if (role === 'C5') {
    visibleRooms = CHAT_ROOMS.filter((r) => r.audienceScope === 'Public');
  }

  const totalUnread = visibleRooms.reduce((sum, r) => sum + r.unreadCount, 0);

  return (
    <View>
      {/* Summary */}
      <View style={s.moduleContainer}>
        <SectionHeader title="CHAT ROOMS" colors={colors} count={visibleRooms.length} />
        {totalUnread > 0 && (
          <Card colors={colors}>
            <View style={s.summaryRow}>
              <IconSymbol name="bell.badge.fill" size={16} color="#F59E0B" />
              <ThemedText style={[s.summaryText, { color: colors.text }]}>
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
                  <View style={[s.scopeBadge, { backgroundColor: SCOPE_COLOR[room.audienceScope] + '20' }]}>
                    <ThemedText style={[s.scopeBadgeText, { color: SCOPE_COLOR[room.audienceScope] }]}>
                      {room.audienceScope.toUpperCase()}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText style={[s.roomMembers, { color: colors.textTertiary }]}>
                  {room.memberCount}{room.memberCount >= 200 ? '+' : ''} member{room.memberCount !== 1 ? 's' : ''} {'\u00B7'} {room.lastActive}
                  {room.moderationEnabled ? ' \u00B7 Moderated' : ''}
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

      {/* Admin actions — C1/C2 */}
      {isElderLevel(role) && (
        <View style={s.moduleContainer}>
          <SectionHeader title="ROOM MANAGEMENT" colors={colors} />
          <Card colors={colors}>
            <Pressable style={s.adminActionRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[s.adminActionIcon, { backgroundColor: '#3B82F620' }]}>
                <IconSymbol name="plus.circle.fill" size={16} color="#3B82F6" />
              </View>
              <ThemedText style={[s.adminActionText, { color: colors.text }]}>Create New Room</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }} />
            <Pressable style={s.adminActionRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[s.adminActionIcon, { backgroundColor: '#F59E0B20' }]}>
                <IconSymbol name="person.badge.plus" size={16} color="#F59E0B" />
              </View>
              <ThemedText style={[s.adminActionText, { color: colors.text }]}>Manage Members & Permissions</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
            <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }} />
            <Pressable style={s.adminActionRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <View style={[s.adminActionIcon, { backgroundColor: '#8B5CF620' }]}>
                <IconSymbol name="gearshape.fill" size={16} color="#8B5CF6" />
              </View>
              <ThemedText style={[s.adminActionText, { color: colors.text }]}>Room Settings & Moderation</ThemedText>
              <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
            </Pressable>
          </Card>
        </View>
      )}
    </View>
  );
}

// =============================================================================
// VIEW: REQUESTS (Pastoral Intake)
// =============================================================================

function RequestsView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>('all');

  // Privacy filtering: counseling only visible to pastor-level
  const roleFiltered = PASTORAL_REQUESTS.filter((r) => {
    if (r.privacy === 'pastor-only' && role !== 'C1') return false;
    if (r.privacy === 'leaders-only' && !isElderLevel(role)) return false;
    return true;
  });

  const filtered = statusFilter === 'all'
    ? roleFiltered
    : roleFiltered.filter((r) => r.status === statusFilter);

  const newCount = roleFiltered.filter((r) => r.status === 'new').length;
  const canAssign = isElderLevel(role);

  const statusOptions: (RequestStatus | 'all')[] = ['all', 'new', 'assigned', 'in-progress', 'closed'];

  return (
    <View>
      {/* Summary KPIs */}
      <View style={s.moduleContainer}>
        <SectionHeader title="PASTORAL REQUESTS" colors={colors} count={roleFiltered.length} />
        <Card colors={colors}>
          <View style={s.requestKpiRow}>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#3B82F6' }]}>{newCount}</ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>New</ThemedText>
            </View>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#F59E0B' }]}>
                {roleFiltered.filter((r) => r.status === 'assigned').length}
              </ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>Assigned</ThemedText>
            </View>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#8B5CF6' }]}>
                {roleFiltered.filter((r) => r.status === 'in-progress').length}
              </ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>In Progress</ThemedText>
            </View>
            <View style={s.requestKpi}>
              <ThemedText style={[s.requestKpiValue, { color: '#22C55E' }]}>
                {roleFiltered.filter((r) => r.status === 'closed').length}
              </ThemedText>
              <ThemedText style={[s.requestKpiLabel, { color: colors.textSecondary }]}>Closed</ThemedText>
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
                {opt === 'all' ? 'All' : opt === 'in-progress' ? 'In Progress' : opt.charAt(0).toUpperCase() + opt.slice(1)}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Request List */}
      <View style={s.moduleContainer}>
        {filtered.map((req) => {
          const slaOverdue = req.elapsedHours > req.slaHours && req.status !== 'closed';
          return (
            <Card key={req.id} colors={colors}>
              {/* Header */}
              <View style={s.reqHeader}>
                <View style={[s.reqTypeIcon, { backgroundColor: STATUS_COLOR[req.status] + '15' }]}>
                  <IconSymbol name={REQUEST_TYPE_ICON[req.type] as any} size={14} color={STATUS_COLOR[req.status]} />
                </View>
                <View style={s.reqHeaderText}>
                  <ThemedText style={[s.reqSubject, { color: colors.text }]} numberOfLines={2}>
                    {req.subject}
                  </ThemedText>
                  <ThemedText style={[s.reqFrom, { color: colors.textSecondary }]}>
                    {req.from} {'\u00B7'} {req.submittedDate}
                  </ThemedText>
                </View>
                <View style={[s.statusChip, { backgroundColor: STATUS_COLOR[req.status] + '20' }]}>
                  <View style={[s.statusDot, { backgroundColor: STATUS_COLOR[req.status] }]} />
                  <ThemedText style={[s.statusText, { color: STATUS_COLOR[req.status] }]}>
                    {req.status === 'in-progress' ? 'IN PROGRESS' : req.status.toUpperCase()}
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
                  <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Privacy</ThemedText>
                  <ThemedText style={[s.reqDetailValue, { color: colors.textSecondary }]}>{PRIVACY_LABEL[req.privacy]}</ThemedText>
                </View>
                {req.assignedTo && (
                  <View style={s.reqDetailRow}>
                    <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Assigned</ThemedText>
                    <ThemedText style={[s.reqDetailValue, { color: colors.textSecondary }]}>{req.assignedTo}</ThemedText>
                  </View>
                )}
                <View style={s.reqDetailRow}>
                  <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>SLA</ThemedText>
                  <ThemedText style={[s.reqDetailValue, { color: slaOverdue ? '#EF4444' : colors.textSecondary }]}>
                    {slaOverdue ? `OVERDUE (${req.elapsedHours}h / ${req.slaHours}h)` : `${req.elapsedHours}h / ${req.slaHours}h`}
                  </ThemedText>
                </View>
                {req.notes && (
                  <View style={s.reqDetailRow}>
                    <ThemedText style={[s.reqDetailLabel, { color: colors.textTertiary }]}>Notes</ThemedText>
                    <ThemedText style={[s.reqDetailValue, { color: colors.textSecondary }]} numberOfLines={2}>{req.notes}</ThemedText>
                  </View>
                )}
              </View>

              {/* Assign action — C1/C2, for new requests */}
              {canAssign && req.status === 'new' && (
                <View style={s.reqActions}>
                  <Pressable
                    style={[s.reqActionBtn, { backgroundColor: '#3B82F620' }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  >
                    <IconSymbol name="person.badge.plus" size={12} color="#3B82F6" />
                    <ThemedText style={[s.reqActionText, { color: '#3B82F6' }]}>Assign</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[s.reqActionBtn, { backgroundColor: '#22C55E20' }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                  >
                    <IconSymbol name="checkmark" size={12} color="#22C55E" />
                    <ThemedText style={[s.reqActionText, { color: '#22C55E' }]}>Respond</ThemedText>
                  </Pressable>
                </View>
              )}
            </Card>
          );
        })}
      </View>

      {/* Submit New Request CTA */}
      {isMember(role) && (
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
// VIEW: PINNED (with auto-pin concept)
// =============================================================================

function PinnedView({ colors, role }: { colors: typeof Colors.light; role: ChurchRoleLens }) {
  const activeItems = PINNED_ITEMS.filter((p) => p.isActive);

  // Sort: emergency first, then service-change, then manual
  const sourceOrder: Record<PinSource, number> = { emergency: 0, 'service-change': 1, manual: 2 };
  const sorted = [...activeItems].sort((a, b) => sourceOrder[a.source] - sourceOrder[b.source]);

  return (
    <View>
      <View style={s.moduleContainer}>
        <SectionHeader title="PINNED ITEMS" colors={colors} count={sorted.length} />

        {/* Auto-pin explanation */}
        <Card colors={colors}>
          <View style={s.autoPinInfo}>
            <IconSymbol name="info.circle.fill" size={14} color={colors.textTertiary} />
            <ThemedText style={[s.autoPinText, { color: colors.textTertiary }]}>
              Emergency posts and service changes are auto-pinned while active.
            </ThemedText>
          </View>
        </Card>
      </View>

      {/* Pinned Items */}
      <View style={s.moduleContainer}>
        {sorted.map((item) => (
          <Card key={item.id} colors={colors}>
            <View style={s.pinnedItemRow}>
              {/* Source badge */}
              <View style={[s.pinnedSourceBadge, { backgroundColor: PIN_SOURCE_COLOR[item.source] + '20' }]}>
                <ThemedText style={[s.pinnedSourceText, { color: PIN_SOURCE_COLOR[item.source] }]}>
                  {PIN_SOURCE_LABEL[item.source]}
                </ThemedText>
              </View>

              {/* Content */}
              <View style={s.pinnedItemContent}>
                <ThemedText style={[s.pinnedItemTitle, { color: colors.text }]} numberOfLines={2}>
                  {item.title}
                </ThemedText>
                <ThemedText style={[s.pinnedItemDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                  {item.description}
                </ThemedText>
                <View style={s.pinnedDateRow}>
                  <ThemedText style={[s.pinnedDateLabel, { color: colors.textTertiary }]}>
                    Pinned: {item.pinDate}
                  </ThemedText>
                  {item.expiresDate && (
                    <ThemedText style={[s.pinnedDateLabel, { color: colors.textTertiary }]}>
                      {' \u00B7 '}Expires: {item.expiresDate}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>

            {/* Unpin action — only for manual pins and elder+ roles */}
            {item.source === 'manual' && isElderLevel(role) && (
              <Pressable
                style={[s.unpinBtn, { borderColor: colors.border }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <IconSymbol name="pin.slash.fill" size={11} color={colors.textSecondary} />
                <ThemedText style={[s.unpinText, { color: colors.textSecondary }]}>Unpin</ThemedText>
              </Pressable>
            )}
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

  // Filter pills
  filterScroll: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm, paddingVertical: 2 },
  filterPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: BorderRadius.full, borderWidth: StyleSheet.hairlineWidth },
  filterPillText: { fontSize: 12, fontWeight: '600' },

  // Summary row
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  summaryText: { fontSize: 13, fontWeight: '600' },

  // Status chip
  statusChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  // ---- INBOX: Thread rows ----
  threadRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  threadIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  threadContent: { flex: 1 },
  threadNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  threadName: { fontSize: 14, flex: 1 },
  threadPreview: { fontSize: 12, lineHeight: 16 },
  threadRight: { alignItems: 'flex-end', gap: 4 },
  threadTimestamp: { fontSize: 10, fontWeight: '500' },
  priorityBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  priorityText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

  unreadBadge: { backgroundColor: '#3B82F6', minWidth: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 5 },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  mentionDot: { width: 8, height: 8, borderRadius: 4 },

  // ---- ROOMS ----
  roomRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  roomIconWrap: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roomContent: { flex: 1 },
  roomNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 1 },
  roomName: { fontSize: 14, fontWeight: '600' },
  roomMembers: { fontSize: 10, marginBottom: 2 },
  roomLastMsg: { fontSize: 12, lineHeight: 16 },
  roomRight: { alignItems: 'center', justifyContent: 'center' },

  scopeBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: BorderRadius.sm },
  scopeBadgeText: { fontSize: 8, fontWeight: '700', letterSpacing: 0.3 },

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

  submitCta: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: BorderRadius.lg, borderWidth: StyleSheet.hairlineWidth },
  submitCtaText: { fontSize: 14, fontWeight: '600' },

  // ---- PINNED ----
  autoPinInfo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  autoPinText: { fontSize: 12, flex: 1 },

  pinnedItemRow: { gap: Spacing.sm },
  pinnedSourceBadge: { alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: BorderRadius.sm },
  pinnedSourceText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },
  pinnedItemContent: { gap: 4 },
  pinnedItemTitle: { fontSize: 14, fontWeight: '600' },
  pinnedItemDesc: { fontSize: 12, lineHeight: 17 },
  pinnedDateRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  pinnedDateLabel: { fontSize: 10 },

  unpinBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.md, borderWidth: StyleSheet.hairlineWidth, marginTop: Spacing.sm },
  unpinText: { fontSize: 11, fontWeight: '600' },
});
