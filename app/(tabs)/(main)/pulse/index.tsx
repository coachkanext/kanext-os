/**
 * Pulse — single source of truth for all alerts across all brands.
 * Sections: Needs Attention → Messages → Upcoming → Money.
 * Tap to expand inline. Swipe left=Read/Dismiss, right=Pin. Long-press context menu.
 */

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, TextInput, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';

import { useColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';
import { updatePulseBadge } from '@/utils/global-pulse-badge';

// ── Types ─────────────────────────────────────────────────────────────────────

type ActivityType =
  | 'call' | 'message' | 'room' | 'email' | 'calendar' | 'payment'
  | 'rbac' | 'deadline' | 'document' | 'payment_failed';

type SectionKey = 'attention' | 'messages' | 'upcoming' | 'money';

type PulseItem = {
  id:                   string;
  brandId:              string;
  type:                 ActivityType;
  description:          string;
  preview?:             string;
  timestamp:            Date;
  isRead:               boolean;
  count?:               number;
  subItems?:            { id: string; description: string; timestamp: Date }[];
  route?:               string;
  roomName?:            string;
  location?:            string;
  amount?:              string;
  // Upcoming
  eventSubtype?:        'meeting' | 'game' | 'event';
  attendees?:           string[];
  // RBAC
  requesterName?:       string;
  permissionRequested?: string;
  // Deadline / document
  dueDate?:             string;
  docName?:             string;
  expiryDate?:          string;
  // Payment
  failureReason?:       string;
  invoiceNumber?:       string;
  paymentFrom?:         string;
  paymentTo?:           string;
};

// ── Brand / type data ─────────────────────────────────────────────────────────

const BRANDS = [
  { id: 'kanext',     name: 'KaNeXT',              initials: 'KN', color: '#D97757' },
  { id: 'lincoln',    name: 'Lincoln University',   initials: 'LU', color: '#003A63' },
  { id: 'basketball', name: "LU Men's Basketball",  initials: 'BB', color: '#990000' },
  { id: 'iccla',      name: 'ICCLA',               initials: 'IC', color: '#1D9BF0' },
  { id: 'sammy',      name: 'Sammy Kalejaiye',      initials: 'SK', color: '#5A8A6E' },
];

const TYPE_ICONS: Record<ActivityType, string> = {
  call:           'phone.fill',
  message:        'message.fill',
  room:           'bubble.left.and.bubble.right.fill',
  email:          'envelope.fill',
  calendar:       'calendar',
  payment:        'dollarsign.circle.fill',
  rbac:           'person.badge.key.fill',
  deadline:       'flag.fill',
  document:       'doc.fill',
  payment_failed: 'exclamationmark.circle.fill',
};

const SECTION_META: Record<SectionKey, string> = {
  attention: 'NEEDS ATTENTION',
  messages:  'MESSAGES',
  upcoming:  'UPCOMING',
  money:     'MONEY',
};

const SECTION_ORDER: SectionKey[] = ['attention', 'messages', 'upcoming', 'money'];

function sectionFor(item: PulseItem): SectionKey {
  const attn: ActivityType[] = ['call', 'email', 'rbac', 'deadline', 'document', 'payment_failed'];
  if (attn.includes(item.type)) return 'attention';
  if (item.type === 'message' || item.type === 'room') return 'messages';
  if (item.type === 'calendar') return 'upcoming';
  return 'money';
}

// ── Seed data ─────────────────────────────────────────────────────────────────

function ago(m: number) { return new Date(Date.now() - m * 60_000); }

const SEED_ITEMS: PulseItem[] = [
  // ── Needs Attention ──
  {
    id: 'na-call-1', brandId: 'lincoln', type: 'call', isRead: false, timestamp: ago(12),
    description: 'Sarah Chen — 3 missed calls', count: 3,
    subItems: [
      { id: 'na-c1a', description: 'Missed call · Sarah Chen', timestamp: ago(12) },
      { id: 'na-c1b', description: 'Missed call · Sarah Chen', timestamp: ago(25) },
      { id: 'na-c1c', description: 'Missed call · Sarah Chen', timestamp: ago(47) },
    ],
    route: '/(tabs)/(main)/phone',
  },
  {
    id: 'na-email-1', brandId: 'basketball', type: 'email', isRead: false, timestamp: ago(28),
    description: 'NAIA Eligibility Office — Spring Roster Deadline',
    preview: 'Please submit your final roster by Friday or your season eligibility may be affected.',
    route: '/(tabs)/(main)/messages',
  },
  {
    id: 'na-rbac-1', brandId: 'kanext', type: 'rbac', isRead: false, timestamp: ago(55),
    description: 'Jordan Dean requesting analytics access',
    requesterName: 'Jordan Dean',
    permissionRequested: 'Analytics Dashboard — View & Export',
    preview: 'Jordan is requesting access to the Analytics Dashboard with View & Export permissions.',
  },
  {
    id: 'na-fail-1', brandId: 'kanext', type: 'payment_failed', isRead: false, timestamp: ago(90),
    description: 'Payment failed · $1,200',
    preview: 'To Lincoln University · Monthly retainer · Insufficient funds',
    amount: '$1,200.00', failureReason: 'Insufficient funds', paymentTo: 'Lincoln University',
    route: '/(tabs)/(main)/store',
  },
  {
    id: 'na-dead-1', brandId: 'basketball', type: 'deadline', isRead: false, timestamp: ago(1680),
    description: 'Scouting report — 2 days overdue',
    preview: 'Friday pre-game scouting report for Howard University',
    dueDate: '2 days ago',
    route: '/(tabs)/(main)/agenda',
  },
  {
    id: 'na-doc-1', brandId: 'basketball', type: 'document', isRead: true, timestamp: ago(240),
    description: 'Coaching License expiring in 7 days',
    docName: '2025-26 Coaching License — NAIA Division II',
    expiryDate: 'March 26, 2026',
    route: '/(tabs)/(main)/media',
  },
  // ── Messages ──
  {
    id: 'msg-1', brandId: 'basketball', type: 'message', isRead: false, timestamp: ago(3),
    description: 'Coach Thompson',
    preview: 'Practice tomorrow at 6am sharp. Full attendance required.',
    route: '/(tabs)/(main)/messages',
  },
  {
    id: 'msg-2', brandId: 'kanext', type: 'message', isRead: true, timestamp: ago(155),
    description: 'Jordan Dean',
    preview: 'Hey, can you review the new deck before the call?',
    route: '/(tabs)/(main)/messages',
  },
  {
    id: 'msg-3', brandId: 'kanext', type: 'room', isRead: true, timestamp: ago(200),
    description: '#general · Alex Ramos',
    preview: 'Heads up — deploys are paused until further notice.',
    roomName: 'general',
    route: '/(tabs)/(main)/messages',
  },
  // ── Upcoming ──
  {
    id: 'up-1', brandId: 'iccla', type: 'calendar', isRead: false, timestamp: ago(95),
    description: 'Board Review',
    preview: 'Today · 3:00 PM · Conference Room B',
    location: 'Conference Room B', eventSubtype: 'meeting',
    attendees: ['Marcus Reid', 'Patricia Nguyen', 'David Osei', 'You'],
    route: '/(tabs)/(main)/agenda',
  },
  {
    id: 'up-2', brandId: 'basketball', type: 'calendar', isRead: true, timestamp: ago(130),
    description: 'LU vs Howard',
    preview: 'Saturday · 7:00 PM · Burr Gymnasium',
    location: 'Burr Gymnasium', eventSubtype: 'game',
    route: '/(tabs)/(main)/agenda',
  },
  // ── Money ──
  {
    id: 'mon-1', brandId: 'kanext', type: 'payment', isRead: false, timestamp: ago(45),
    description: 'Payment received · $500',
    preview: 'From Alex Kim · KaNeXT · Invoice #4821',
    amount: '$500.00', paymentFrom: 'Alex Kim', invoiceNumber: 'INV-4821',
    route: '/(tabs)/(main)/store',
  },
  {
    id: 'mon-2', brandId: 'kanext', type: 'payment', isRead: true, timestamp: ago(310),
    description: 'Payment sent · $1,200',
    preview: 'To Lincoln University · Monthly retainer',
    amount: '$1,200.00', paymentTo: 'Lincoln University',
    route: '/(tabs)/(main)/store',
  },
];

const NEW_ITEM: PulseItem = {
  id: 'live-1', brandId: 'sammy', type: 'message', isRead: false,
  timestamp: new Date(), description: 'Sammy Kalejaiye',
  preview: "Just checking in — how's everything going with the project?",
  route: '/(tabs)/(main)/messages',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(d: Date): string {
  const m = Math.floor((Date.now() - d.getTime()) / 60_000);
  if (m < 1)  return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const days = Math.floor(h / 24);
  if (days === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function brandById(id: string) { return BRANDS.find(b => b.id === id) ?? BRANDS[0]; }

type QuickAction = { label: string; onPress: () => void };

function getQuickAction(item: PulseItem, onNavigate: (r: string) => void): QuickAction | null {
  switch (item.type) {
    case 'call':           return { label: 'Call Back', onPress: () => item.route && onNavigate(item.route) };
    case 'email':          return { label: 'Reply',     onPress: () => item.route && onNavigate(item.route) };
    case 'deadline':       return { label: 'Open',      onPress: () => item.route && onNavigate(item.route) };
    case 'document':       return { label: 'View',      onPress: () => item.route && onNavigate(item.route) };
    case 'payment_failed': return { label: 'Retry',     onPress: () => {} };
    default:               return null;
  }
}

// ── ActionBtn ─────────────────────────────────────────────────────────────────

function ActionBtn({ label, icon, accent, danger, C, onPress }: {
  label: string; icon: string; accent?: boolean; danger?: boolean;
  C: ReturnType<typeof useColors>; onPress: () => void;
}) {
  const bg = accent ? C.accent : danger ? C.red : C.surfacePressed;
  const fg = (accent || danger) ? '#fff' : C.label;
  return (
    <Pressable
      style={({ pressed }) => [s.actionBtn, { backgroundColor: bg, opacity: pressed ? 0.7 : 1 }]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={14} color={fg} />
      <Text style={[s.actionBtnText, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

// ── InlineExpanded ────────────────────────────────────────────────────────────

function InlineExpanded({ item, C, onNavigate, onDismiss }: {
  item:       PulseItem;
  C:          ReturnType<typeof useColors>;
  onNavigate: (route: string) => void;
  onDismiss:  (id: string) => void;
}) {
  const [reply, setReply] = useState('');
  const isMessage  = item.type === 'message' || item.type === 'room';
  const isCall     = item.type === 'call';
  const isEmail    = item.type === 'email';
  const isCalendar = item.type === 'calendar';
  const isPayment  = item.type === 'payment';
  const isRBAC     = item.type === 'rbac';
  const isDeadline = item.type === 'deadline';
  const isDocument = item.type === 'document';
  const isFailed   = item.type === 'payment_failed';

  const handleSend = () => {
    if (!reply.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReply('');
  };

  return (
    <View style={[s.expandedCard, { backgroundColor: C.surface, borderColor: C.separator }]}>

      {/* Full preview / body text */}
      {item.preview && (
        <Text style={[s.expandedBody, { color: C.label }]}>{item.preview}</Text>
      )}

      {/* Call: missed call times */}
      {isCall && item.subItems && (
        <View style={s.subList}>
          {item.subItems.map(sub => (
            <View key={sub.id} style={s.subRow}>
              <IconSymbol name="phone.fill" size={12} color={C.muted} />
              <Text style={[s.subText, { color: C.secondary, flex: 1 }]}>{sub.description}</Text>
              <Text style={[s.subText, { color: C.muted }]}>{fmtTime(sub.timestamp)}</Text>
            </View>
          ))}
        </View>
      )}

      {/* RBAC: requester + permission */}
      {isRBAC && item.permissionRequested && (
        <View style={[s.metaBlock, { backgroundColor: C.surfacePressed, borderRadius: 8 }]}>
          <Text style={[s.metaLabel, { color: C.muted }]}>Permission requested</Text>
          <Text style={[s.metaValue, { color: C.label }]}>{item.permissionRequested}</Text>
        </View>
      )}

      {/* Deadline: due date */}
      {isDeadline && item.dueDate && (
        <View style={s.metaRow}>
          <IconSymbol name="clock.fill" size={12} color={C.red} />
          <Text style={[s.metaText, { color: C.red }]}>Due {item.dueDate}</Text>
        </View>
      )}

      {/* Document: doc name + expiry */}
      {isDocument && (
        <>
          {item.docName    && <Text style={[s.expandedBody, { color: C.label }]}>{item.docName}</Text>}
          {item.expiryDate && (
            <View style={s.metaRow}>
              <IconSymbol name="clock.fill" size={12} color={C.red} />
              <Text style={[s.metaText, { color: C.red }]}>Expires {item.expiryDate}</Text>
            </View>
          )}
        </>
      )}

      {/* Failed payment: amount + reason */}
      {isFailed && (
        <>
          {item.amount       && <Text style={[s.amountText, { color: C.label }]}>{item.amount}</Text>}
          {item.failureReason && (
            <View style={s.metaRow}>
              <IconSymbol name="exclamationmark.circle.fill" size={12} color={C.red} />
              <Text style={[s.metaText, { color: C.red }]}>{item.failureReason}</Text>
            </View>
          )}
        </>
      )}

      {/* Calendar: location + attendees */}
      {isCalendar && (
        <>
          {item.location && (
            <View style={s.metaRow}>
              <IconSymbol name="location.fill" size={12} color={C.muted} />
              <Text style={[s.metaText, { color: C.secondary }]}>{item.location}</Text>
            </View>
          )}
          {item.attendees && item.attendees.length > 0 && (
            <Text style={[s.metaText, { color: C.secondary }]}>
              {item.attendees.join(' · ')}
            </Text>
          )}
        </>
      )}

      {/* Payment: amount */}
      {isPayment && item.amount && (
        <Text style={[s.amountText, { color: C.label }]}>{item.amount}</Text>
      )}

      {/* Inline reply (messages + rooms) */}
      {isMessage && (
        <View style={[s.replyRow, { borderTopColor: C.separator }]}>
          <TextInput
            style={[s.replyInput, { color: C.label, backgroundColor: C.bg, borderColor: C.inputBorder }]}
            placeholder={item.roomName ? `Reply in #${item.roomName}` : 'Reply…'}
            placeholderTextColor={C.muted}
            value={reply}
            onChangeText={setReply}
            returnKeyType="send"
            onSubmitEditing={handleSend}
          />
          <Pressable
            style={[s.replySend, { backgroundColor: reply.trim() ? C.label : C.surfacePressed }]}
            onPress={handleSend}
            disabled={!reply.trim()}
          >
            <IconSymbol name="arrow.up" size={14} color={reply.trim() ? C.bg : C.muted} />
          </Pressable>
        </View>
      )}

      {/* Action buttons */}
      <View style={s.actionRow}>
        {isCall && (
          <>
            <ActionBtn label="Call Back"    icon="phone.fill"                   accent C={C} onPress={() => item.route && onNavigate(item.route)} />
            <ActionBtn label="Message"      icon="message.fill"                 C={C}  onPress={() => item.route && onNavigate(item.route)} />
          </>
        )}
        {isEmail && (
          <>
            <ActionBtn label="Reply"        icon="arrowshape.turn.up.left.fill" accent C={C} onPress={() => item.route && onNavigate(item.route)} />
            <ActionBtn label="Open Email"   icon="envelope.fill"                C={C}  onPress={() => item.route && onNavigate(item.route)} />
          </>
        )}
        {isRBAC && (
          <>
            <ActionBtn label="Approve"      icon="checkmark.circle.fill"        accent C={C} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDismiss(item.id); }} />
            <ActionBtn label="Deny"         icon="xmark.circle.fill"            danger C={C} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onDismiss(item.id); }} />
          </>
        )}
        {isDeadline && (
          <ActionBtn   label="Open"         icon="arrow.up.right.square"        accent C={C} onPress={() => item.route && onNavigate(item.route)} />
        )}
        {isDocument && (
          <>
            <ActionBtn label="View"         icon="doc.fill"                     C={C}  onPress={() => item.route && onNavigate(item.route)} />
            <ActionBtn label="Renew"        icon="arrow.clockwise"              accent C={C} onPress={() => {}} />
          </>
        )}
        {isFailed && (
          <>
            <ActionBtn label="Retry"        icon="arrow.clockwise"              accent C={C} onPress={() => {}} />
            <ActionBtn label="Contact Support" icon="questionmark.circle.fill"  C={C}  onPress={() => {}} />
          </>
        )}
        {isCalendar && item.eventSubtype === 'meeting' && (
          <>
            <ActionBtn label="Join"         icon="video.fill"                   accent C={C} onPress={() => {}} />
            <ActionBtn label="Reschedule"   icon="calendar.badge.clock"         C={C}  onPress={() => {}} />
            <ActionBtn label="Decline"      icon="xmark.circle.fill"            danger C={C} onPress={() => onDismiss(item.id)} />
          </>
        )}
        {isCalendar && item.eventSubtype === 'game' && (
          <>
            <ActionBtn label="View Roster"  icon="person.3.fill"                C={C}  onPress={() => item.route && onNavigate(item.route)} />
            <ActionBtn label="Game Plan"    icon="list.bullet.clipboard.fill"   C={C}  onPress={() => {}} />
          </>
        )}
        {isCalendar && (!item.eventSubtype || item.eventSubtype === 'event') && (
          <ActionBtn   label="View Details" icon="info.circle.fill"             C={C}  onPress={() => item.route && onNavigate(item.route)} />
        )}
        {isPayment && (
          <>
            <ActionBtn label="View Receipt" icon="doc.text.fill"                C={C}  onPress={() => item.route && onNavigate(item.route)} />
            <ActionBtn label="Send Thanks"  icon="hand.thumbsup.fill"           C={C}  onPress={() => {}} />
            <ActionBtn label="Dispute"      icon="exclamationmark.triangle.fill" danger C={C} onPress={() => {}} />
          </>
        )}
      </View>
    </View>
  );
}

// ── PulseItemRow ──────────────────────────────────────────────────────────────

function PulseItemRow({ item, isExpanded, pinned, onPress, onLongPress,
  onMarkRead, onDismiss, onPin, onNavigate, C }: {
  item:        PulseItem;
  isExpanded:  boolean;
  pinned:      boolean;
  onPress:     () => void;
  onLongPress: () => void;
  onMarkRead:  (id: string) => void;
  onDismiss:   (id: string) => void;
  onPin:       (id: string) => void;
  onNavigate:  (route: string) => void;
  C:           ReturnType<typeof useColors>;
}) {
  const brand       = brandById(item.brandId);
  const quickAction = getQuickAction(item, onNavigate);

  const renderRightActions = () => (
    <View style={s.swipeRight}>
      <Pressable style={[s.swipeAction, { backgroundColor: C.accent }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onMarkRead(item.id); }}>
        <IconSymbol name="checkmark" size={16} color="#fff" />
        <Text style={s.swipeLabel}>Read</Text>
      </Pressable>
      <Pressable style={[s.swipeAction, { backgroundColor: C.secondary + 'aa' }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onDismiss(item.id); }}>
        <IconSymbol name="xmark" size={16} color="#fff" />
        <Text style={s.swipeLabel}>Dismiss</Text>
      </Pressable>
    </View>
  );

  const renderLeftActions = () => (
    <Pressable style={[s.swipeAction, { backgroundColor: pinned ? '#888' : '#F59E0B', width: 72 }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPin(item.id); }}>
      <IconSymbol name={pinned ? 'pin.slash.fill' : 'pin.fill'} size={16} color="#fff" />
      <Text style={s.swipeLabel}>{pinned ? 'Unpin' : 'Pin'}</Text>
    </Pressable>
  );

  return (
    <View>
      <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}
        overshootRight={false} overshootLeft={false}>
        <Pressable
          style={({ pressed }) => [s.row, pressed && { backgroundColor: C.surfacePressed }]}
          onPress={onPress}
          onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(); }}
          delayLongPress={400}
        >
          {/* Unread dot */}
          <View style={s.dotCol}>
            {!item.isRead && <View style={[s.dot, { backgroundColor: C.accent }]} />}
          </View>

          {/* Brand avatar */}
          <View style={[s.avatar, { backgroundColor: brand.color }]}>
            <Text style={s.avatarText}>{brand.initials}</Text>
            {(item.count ?? 0) > 1 && (
              <View style={[s.countBadge, { backgroundColor: C.accent }]}>
                <Text style={s.countText}>{item.count}</Text>
              </View>
            )}
          </View>

          {/* Content: description (bold) + brand+type subtitle + preview */}
          <View style={s.content}>
            <Text style={[s.description, { color: C.label }, !item.isRead && s.bold]} numberOfLines={1}>
              {item.description}
            </Text>
            <View style={s.subtitleLine}>
              <Text style={[s.brandName, { color: C.secondary }]} numberOfLines={1}>{brand.name}</Text>
              <IconSymbol name={TYPE_ICONS[item.type] as any} size={10} color={C.muted} />
              {pinned && <IconSymbol name="pin.fill" size={9} color={C.accent} />}
            </View>
            {item.preview && !isExpanded && (
              <Text style={[s.preview, { color: C.secondary }]} numberOfLines={1}>{item.preview}</Text>
            )}
          </View>

          {/* Right column: timestamp + optional quick-action pill */}
          <View style={s.rightCol}>
            <Text style={[s.timestamp, { color: C.muted }]}>{fmtTime(item.timestamp)}</Text>
            {quickAction && (
              <Pressable
                style={[s.quickBtn, { backgroundColor: C.accent }]}
                onPress={quickAction.onPress}
              >
                <Text style={s.quickBtnText}>{quickAction.label}</Text>
              </Pressable>
            )}
          </View>
        </Pressable>
      </Swipeable>

      {isExpanded && (
        <InlineExpanded item={item} C={C} onNavigate={onNavigate} onDismiss={onDismiss} />
      )}
    </View>
  );
}

// ── SectionBlock ──────────────────────────────────────────────────────────────

const MAX_SHOWN = 3;

function SectionBlock({ sectionKey, items, expandedId, pinnedIds, onToggle, onLongPress,
  onMarkRead, onDismiss, onPin, onNavigate, showAll, onToggleSeeAll, C }: {
  sectionKey:     SectionKey;
  items:          PulseItem[];
  expandedId:     string | null;
  pinnedIds:      Set<string>;
  onToggle:       (id: string) => void;
  onLongPress:    (item: PulseItem) => void;
  onMarkRead:     (id: string) => void;
  onDismiss:      (id: string) => void;
  onPin:          (id: string) => void;
  onNavigate:     (route: string) => void;
  showAll:        boolean;
  onToggleSeeAll: (key: SectionKey) => void;
  C:              ReturnType<typeof useColors>;
}) {
  if (items.length === 0) return null;
  const shown   = showAll ? items : items.slice(0, MAX_SHOWN);
  const hasMore = items.length > MAX_SHOWN;

  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <Text style={[s.sectionLabel, { color: C.muted }]}>{SECTION_META[sectionKey]}</Text>
        {hasMore && (
          <Pressable hitSlop={8} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onToggleSeeAll(sectionKey); }}>
            <Text style={[s.seeAll, { color: C.accent }]}>{showAll ? 'Show less' : 'See all'}</Text>
          </Pressable>
        )}
      </View>

      <View style={[s.sectionBody, { borderColor: C.separator }]}>
        {shown.map((item, i) => (
          <View key={item.id}>
            {i > 0 && <View style={[s.divider, { backgroundColor: C.separator, marginLeft: 64 }]} />}
            <PulseItemRow
              item={item}
              isExpanded={expandedId === item.id}
              pinned={pinnedIds.has(item.id)}
              onPress={() => onToggle(item.id)}
              onLongPress={() => onLongPress(item)}
              onMarkRead={onMarkRead}
              onDismiss={onDismiss}
              onPin={onPin}
              onNavigate={onNavigate}
              C={C}
            />
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PulseScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [items,            setItems]           = useState<PulseItem[]>(SEED_ITEMS);
  const [expandedId,       setExpandedId]      = useState<string | null>(null);
  const [ctxItem,          setCtxItem]         = useState<PulseItem | null>(null);
  const [showNewPill,      setShowNewPill]      = useState(false);
  const [mutedBrands,      setMutedBrands]     = useState<Set<string>>(new Set());
  const [mutedTypes,       setMutedTypes]      = useState<Set<ActivityType>>(new Set());
  const [pinnedIds,        setPinnedIds]       = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set());

  const scrollRef      = useRef<any>(null);
  const lastScrollY    = useRef(0);
  const isScrolledDown = useRef(false);

  // Sync badge counts whenever items change
  useEffect(() => { updatePulseBadge(items); }, [items]);

  // Real-time new item after 6 seconds
  useEffect(() => {
    const t = setTimeout(() => {
      setItems(prev => [{ ...NEW_ITEM, timestamp: new Date() }, ...prev]);
      if (isScrolledDown.current) setShowNewPill(true);
    }, 6_000);
    return () => clearTimeout(t);
  }, []);

  // Visible items (muted filters only)
  const filtered = useMemo(() => items.filter(item =>
    !mutedBrands.has(item.brandId) && !mutedTypes.has(item.type)
  ), [items, mutedBrands, mutedTypes]);

  // Sections — pinned items float to top within section
  const sections = useMemo(() => {
    const map: Record<SectionKey, PulseItem[]> = { attention: [], messages: [], upcoming: [], money: [] };
    filtered.forEach(item => map[sectionFor(item)].push(item));
    SECTION_ORDER.forEach(key => {
      map[key].sort((a, b) => {
        const pa = pinnedIds.has(a.id) ? 0 : 1;
        const pb = pinnedIds.has(b.id) ? 0 : 1;
        if (pa !== pb) return pa - pb;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });
    });
    return map;
  }, [filtered, pinnedIds]);

  const onScroll = useCallback((e: any) => {
    const y  = e.nativeEvent.contentOffset.y;
    const dy = y - lastScrollY.current;
    if (dy > 4)       hideFooter();
    else if (dy < -4) showFooter();
    lastScrollY.current    = y;
    isScrolledDown.current = y > 150;
    if (y < 100 && showNewPill) setShowNewPill(false);
  }, [showNewPill]);

  const markAsRead = useCallback((id: string) => {
    setItems(p => p.map(i => i.id === id ? { ...i, isRead: true } : i));
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems(p => p.filter(i => i.id !== id));
    setExpandedId(prev => prev === id ? null : prev);
  }, []);

  const togglePin = useCallback((id: string) => {
    setPinnedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId(prev => prev === id ? null : id);
    markAsRead(id);
  }, [markAsRead]);

  const handleNavigate = useCallback((route: string) => {
    router.push({ pathname: route } as any);
  }, [router]);

  const toggleSeeAll = useCallback((key: SectionKey) => {
    setExpandedSections(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });
  }, []);

  const ctxActions = ctxItem ? [
    { icon: 'checkmark.circle',      label: 'Mark as Read',   onPress: () => { markAsRead(ctxItem.id); setCtxItem(null); } },
    { icon: pinnedIds.has(ctxItem.id) ? 'pin.slash.fill' : 'pin.fill',
                                     label: pinnedIds.has(ctxItem.id) ? 'Unpin' : 'Pin',
                                                               onPress: () => { togglePin(ctxItem.id); setCtxItem(null); } },
    { icon: 'speaker.slash',         label: 'Mute this brand', onPress: () => { setMutedBrands(s => new Set(s).add(ctxItem.brandId)); setCtxItem(null); } },
    { icon: 'bell.slash',            label: 'Mute this type',  onPress: () => { setMutedTypes(s => new Set(s).add(ctxItem.type)); setCtxItem(null); } },
    { icon: 'arrow.up.right.square', label: 'Open in brand',   onPress: () => { if (ctxItem.route) handleNavigate(ctxItem.route); setCtxItem(null); } },
    { icon: 'xmark.circle',          label: 'Dismiss',         onPress: () => { dismiss(ctxItem.id); setCtxItem(null); }, destructive: true },
  ] : [];

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <View style={[s.titlePill, { backgroundColor: C.surface }]}>
          <Text style={[s.titleText, { color: C.label }]}>Pulse</Text>
        </View>
      </View>

      {/* ── "New activity" pill ── */}
      {showNewPill && (
        <Pressable style={[s.newPill, { backgroundColor: C.label }]}
          onPress={() => { scrollRef.current?.scrollTo({ y: 0, animated: true }); setShowNewPill(false); }}>
          <IconSymbol name="arrow.up" size={12} color={C.bg} />
          <Text style={[s.newPillText, { color: C.bg }]}>New activity</Text>
        </Pressable>
      )}

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <View style={s.empty}>
          <IconSymbol name="bolt.fill" size={40} color={C.muted} />
          <Text style={[s.emptyTitle, { color: C.label }]}>You're all caught up</Text>
          <Text style={[s.emptySubtitle, { color: C.muted }]}>No new activity</Text>
        </View>
      ) : (
        <ScrollView ref={scrollRef} onScroll={onScroll} scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 49 + 16 }}>
          {SECTION_ORDER.map(key => (
            <SectionBlock key={key} sectionKey={key} items={sections[key]}
              expandedId={expandedId} pinnedIds={pinnedIds}
              onToggle={toggleExpand} onLongPress={setCtxItem}
              onMarkRead={markAsRead} onDismiss={dismiss} onPin={togglePin}
              onNavigate={handleNavigate}
              showAll={expandedSections.has(key)} onToggleSeeAll={toggleSeeAll}
              C={C} />
          ))}
        </ScrollView>
      )}

      {/* ── Context menu ── */}
      <BottomSheet visible={!!ctxItem} onClose={() => setCtxItem(null)} useModal backgroundColor={C.bg}>
        {ctxItem && (
          <>
            <View style={[s.ctxPreview, { borderBottomColor: C.separator }]}>
              <View style={[s.ctxAvatar, { backgroundColor: brandById(ctxItem.brandId).color }]}>
                <Text style={s.ctxAvatarText}>{brandById(ctxItem.brandId).initials}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.ctxBrand, { color: C.secondary }]}>{brandById(ctxItem.brandId).name}</Text>
                <Text style={[s.ctxDesc, { color: C.label }]} numberOfLines={2}>{ctxItem.description}</Text>
              </View>
            </View>
            <View style={{ paddingBottom: 24 }}>
              {ctxActions.map(({ icon, label, onPress, destructive }, i) => (
                <View key={label}>
                  {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 54 }} />}
                  <Pressable
                    style={({ pressed }) => [s.ctxRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); }}
                  >
                    <View style={{ width: 34, alignItems: 'center' }}>
                      <IconSymbol name={icon as any} size={20} color={destructive ? C.red : C.label} />
                    </View>
                    <Text style={{ fontSize: 16, color: destructive ? C.red : C.label, marginLeft: 14 }}>{label}</Text>
                  </Pressable>
                </View>
              ))}
            </View>
          </>
        )}
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  topBar:    { alignItems: 'center', paddingHorizontal: 8, paddingBottom: 10 },
  titlePill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  titleText: { fontSize: 15, fontWeight: '600' },

  newPill:     { position: 'absolute', top: 100, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, zIndex: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 6 },
  newPillText: { fontSize: 13, fontWeight: '600' },

  section:       { marginTop: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingBottom: 8 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.6 },
  seeAll:        { fontSize: 13, fontWeight: '500' },
  sectionBody:   { borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth },

  row:         { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 12 },
  dotCol:      { width: 14, alignItems: 'center', paddingTop: 18, flexShrink: 0 },
  dot:         { width: 7, height: 7, borderRadius: 4 },
  avatar:      { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginRight: 12 },
  avatarText:  { fontSize: 13, fontWeight: '700', color: '#fff' },
  countBadge:  { position: 'absolute', top: -3, right: -3, minWidth: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  countText:   { fontSize: 10, fontWeight: '700', color: '#fff' },

  content:      { flex: 1, minWidth: 0 },
  description:  { fontSize: 14, lineHeight: 19, marginBottom: 2 },
  bold:         { fontWeight: '700' },
  subtitleLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 2 },
  brandName:    { fontSize: 12, fontWeight: '500', flexShrink: 1 },
  preview:      { fontSize: 13, lineHeight: 18 },

  rightCol:     { alignItems: 'flex-end', paddingLeft: 8, paddingTop: 2, gap: 6, flexShrink: 0 },
  timestamp:    { fontSize: 12 },
  quickBtn:     { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  quickBtnText: { fontSize: 11, fontWeight: '600', color: '#fff' },

  swipeRight:  { flexDirection: 'row' },
  swipeAction: { width: 76, alignItems: 'center', justifyContent: 'center', gap: 4 },
  swipeLabel:  { fontSize: 11, fontWeight: '600', color: '#fff' },

  divider: { height: StyleSheet.hairlineWidth },

  expandedCard: { marginHorizontal: 14, marginBottom: 8, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 14, gap: 10 },
  expandedBody: { fontSize: 14, lineHeight: 21 },

  subList: { gap: 6 },
  subRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subText: { fontSize: 13 },

  metaBlock: { padding: 10, gap: 3 },
  metaLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  metaValue: { fontSize: 14 },
  metaRow:   { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText:  { fontSize: 13 },
  amountText:{ fontSize: 24, fontWeight: '700' },

  replyRow:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth },
  replyInput: { flex: 1, fontSize: 14, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  replySend:  { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

  actionRow:     { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  actionBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 80 },
  emptyTitle:   { fontSize: 18, fontWeight: '600' },
  emptySubtitle:{ fontSize: 14 },

  ctxPreview:   { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, marginBottom: 4 },
  ctxAvatar:    { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  ctxAvatarText:{ fontSize: 13, fontWeight: '700', color: '#fff' },
  ctxBrand:     { fontSize: 12, marginBottom: 2 },
  ctxDesc:      { fontSize: 14, fontWeight: '500', lineHeight: 19 },
  ctxRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
});
