/**
 * Email Thread — document layout (not chat bubbles).
 * Sender info, subject, full body, collapsible thread emails,
 * Reply / Reply All / Forward footer.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { useAccentColor } from '@/hooks/use-accent-color';
import { BottomSheet } from '@/components/ui/bottom-sheet';

// ── Types ────────────────────────────────────────────────────────────────────

type EmailMessage = {
  id: string;
  from: string;
  fromEmail: string;
  initials: string;
  isMe: boolean;
  timestamp: Date;
  body: string;
  attachments?: { name: string; size: string; icon: string }[];
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function fmtDateFull(d: Date): string {
  return d.toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' }) +
    ' at ' + d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function fmtDate(d: Date): string {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  const time = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (diffDays === 0) return time;
  if (diffDays === 1) return `Yesterday`;
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function buildThread(from: string, subject: string, preview: string): EmailMessage[] {
  const slug = from.toLowerCase().replace(/\s+/g, '.');
  const initials = from.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return [
    {
      id: 'orig',
      from,
      fromEmail: `${slug}@org.com`,
      initials,
      isMe: false,
      timestamp: new Date(Date.now() - 48 * 3_600_000),
      body:
        `${preview}\n\nPlease review the attached documents and let us know if you have any questions or require additional information. We would appreciate a response by the end of the week.\n\nThank you for your time and cooperation.\n\nBest regards,\n${from}`,
      attachments: [
        { name: 'Document.pdf', size: '2.4 MB', icon: 'doc.fill' },
        { name: 'Report_Q1.xlsx', size: '840 KB', icon: 'tablecells.fill' },
      ],
    },
    {
      id: 're1',
      from: 'You',
      fromEmail: 'you@kanext.com',
      initials: 'ME',
      isMe: true,
      timestamp: new Date(Date.now() - 24 * 3_600_000),
      body: "Thanks for reaching out. I've reviewed the initial details and I'll get back to you with a full response shortly.",
    },
    {
      id: 're2',
      from,
      fromEmail: `${slug}@org.com`,
      initials,
      isMe: false,
      timestamp: new Date(Date.now() - 3 * 3_600_000),
      body: `Appreciate the quick reply. Just following up to make sure everything is clear. Please confirm receipt and let us know your timeline.\n\n${from}`,
    },
  ];
}

// ── Avatar (expanded) ─────────────────────────────────────────────────────────

function Avatar({ initials, isMe, accent, C }: {
  initials: string; isMe: boolean;
  accent: string; C: ReturnType<typeof useColors>;
}) {
  return (
    <View style={[s.avatar, { backgroundColor: isMe ? accent + '22' : C.surface }]}>
      <Text style={[s.avatarText, { color: isMe ? accent : C.label }]}>{initials}</Text>
    </View>
  );
}

// ── Attachment chip ───────────────────────────────────────────────────────────

function AttachmentChip({ name, size, icon, C }: {
  name: string; size: string; icon: string;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      style={[s.attachChip, { backgroundColor: C.surface, borderColor: C.separator }]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <IconSymbol name={icon as any} size={20} color={C.accent} />
      <View style={{ flex: 1 }}>
        <Text style={[s.attachName, { color: C.label }]} numberOfLines={1}>{name}</Text>
        <Text style={[s.attachSize, { color: C.muted }]}>{size}</Text>
      </View>
      <IconSymbol name="arrow.down.circle" size={18} color={C.muted} />
    </Pressable>
  );
}

// ── Expanded email ────────────────────────────────────────────────────────────

function EmailExpanded({ email, accent, C, onCollapse }: {
  email: EmailMessage; accent: string;
  C: ReturnType<typeof useColors>;
  onCollapse: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);
  return (
    <View style={[s.emailCard, { borderColor: C.separator }]}>
      {/* Sender row — tap to collapse */}
      <Pressable style={s.senderRow} onPress={onCollapse} hitSlop={4}>
        <Avatar initials={email.initials} isMe={email.isMe} accent={accent} C={C} />
        <View style={{ flex: 1 }}>
          <View style={s.senderTopRow}>
            <Text style={[s.senderName, { color: C.label }]}>{email.from}</Text>
            <Text style={[s.emailDate, { color: C.muted }]}>{fmtDate(email.timestamp)}</Text>
          </View>
          <Pressable onPress={() => setShowDetails(v => !v)} hitSlop={8}>
            <View style={s.toRow}>
              <Text style={[s.toLabel, { color: C.muted }]}>
                {showDetails ? email.fromEmail : 'to me'}
              </Text>
              <IconSymbol
                name={showDetails ? 'chevron.up' : 'chevron.down'}
                size={11}
                color={C.muted}
              />
            </View>
          </Pressable>
          {showDetails && (
            <Text style={[s.detailLine, { color: C.muted }]}>to: you@kanext.com</Text>
          )}
        </View>
        <Pressable hitSlop={12} onPress={(e) => { e.stopPropagation?.(); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
          <IconSymbol name="ellipsis" size={18} color={C.muted} />
        </Pressable>
      </Pressable>

      {/* Body */}
      <Text style={[s.bodyText, { color: C.label }]}>{email.body}</Text>

      {/* Attachments */}
      {email.attachments && email.attachments.length > 0 && (
        <View style={[s.attachSection, { borderTopColor: C.separator }]}>
          <Text style={[s.attachHeader, { color: C.muted }]}>
            {email.attachments.length} attachment{email.attachments.length !== 1 ? 's' : ''}
          </Text>
          {email.attachments.map(a => (
            <AttachmentChip key={a.name} {...a} C={C} />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Collapsed email — single tight row ───────────────────────────────────────

function EmailCollapsed({ email, onExpand, C }: {
  email: EmailMessage; onExpand: () => void;
  C: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.collapsedRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onExpand(); }}
    >
      <View style={[s.avatarSm, { backgroundColor: C.surface }]}>
        <Text style={[s.avatarSmText, { color: C.label }]}>{email.initials}</Text>
      </View>
      <Text style={[s.collapsedFrom, { color: C.label }]} numberOfLines={1}>{email.from}</Text>
      <Text style={[s.collapsedPreview, { color: C.muted }]} numberOfLines={1}>
        {email.body.split('\n')[0]}
      </Text>
      <Text style={[s.collapsedDate, { color: C.muted }]}>{fmtDate(email.timestamp)}</Text>
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function EmailThreadScreen() {
  const C = useColors();
  const accent = useAccentColor();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { subject, from, preview } =
    useLocalSearchParams<{
      threadId: string;
      subject: string;
      from: string;
      initials: string;
      preview: string;
      timestamp: string;
    }>();

  const thread = useMemo(
    () => buildThread(from ?? 'Sender', subject ?? '(No subject)', preview ?? ''),
    [from, subject, preview],
  );

  // Latest email expanded by default; older ones collapsed
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    () => new Set([thread[thread.length - 1].id]),
  );

  const [menuVisible, setMenuVisible] = useState(false);
  const [starred,     setStarred]     = useState(false);
  const [unread,      setUnread]      = useState(false);

  const toggle = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Nav bar: back circle + spacer + three-dots circle ── */}
      <View style={[s.nav, { paddingTop: insets.top }]}>
        <Pressable
          style={[s.navCircle, { backgroundColor: C.surfacePressed }]}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol name="chevron.left" size={17} color={C.label} />
        </Pressable>
        <View style={{ flex: 1 }} />
        <Pressable
          style={[s.navCircle, { backgroundColor: C.surfacePressed }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMenuVisible(true); }}
        >
          <IconSymbol name="ellipsis" size={17} color={C.label} />
        </Pressable>
      </View>

      {/* ── Subject + count (below nav, inside scroll) ── */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 49 + 72 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[s.subject, { color: C.label }]}>{subject ?? '(No subject)'}</Text>
        <Text style={[s.threadCount, { color: C.muted }]}>
          {thread.length} messages
        </Text>

        {/* Thread emails — oldest first */}
        {thread.map((email, i) => {
          const isExpanded = expandedIds.has(email.id);
          const isLast = i === thread.length - 1;
          return (
            <View key={email.id}>
              {isExpanded ? (
                <EmailExpanded email={email} accent={accent} C={C} onCollapse={() => toggle(email.id)} />
              ) : (
                <EmailCollapsed email={email} onExpand={() => toggle(email.id)} C={C} />
              )}
              {!isLast && <View style={[s.divider, { backgroundColor: C.separator }]} />}
            </View>
          );
        })}
      </ScrollView>

      {/* ── Footer: Reply / Reply All / Forward ── */}
      <View style={[s.footer, { borderTopColor: C.separator, paddingBottom: insets.bottom + 49 + 4 }]}>
        {([
          { icon: 'arrowshape.turn.up.left',   label: 'Reply',     mode: 'reply'     },
          { icon: 'arrowshape.turn.up.left.2', label: 'Reply All', mode: 'reply-all' },
          { icon: 'arrowshape.turn.up.right',  label: 'Forward',   mode: 'forward'   },
        ] as const).map(({ icon, label, mode }) => (
          <Pressable
            key={label}
            style={({ pressed }) => [s.footerBtn, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const orig = thread[0];
              router.push({
                pathname: '/(tabs)/(main)/messages/new-email',
                params: {
                  mode,
                  originalFrom: orig.from,
                  originalFromEmail: orig.fromEmail,
                  originalDate: fmtDateFull(orig.timestamp),
                  originalBody: orig.body,
                  originalSubject: subject ?? '',
                  originalAttachments: JSON.stringify(orig.attachments ?? []),
                },
              } as any);
            }}
          >
            <IconSymbol name={icon} size={19} color={C.secondary} />
            <Text style={[s.footerLabel, { color: C.secondary }]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      {/* ── Thread options menu ── */}
      <BottomSheet
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        useModal
        backgroundColor={C.bg}
      >
        <View style={{ paddingBottom: 24 }}>
          {([
            { icon: starred ? 'star.fill' : 'star',       label: starred ? 'Unstar' : 'Star',  onPress: () => { setStarred(v => !v); setMenuVisible(false); } },
            { icon: 'envelope.badge',                      label: unread  ? 'Mark as Read' : 'Mark as Unread', onPress: () => { setUnread(v => !v); setMenuVisible(false); } },
            { icon: 'clock',                               label: 'Snooze',        onPress: () => setMenuVisible(false) },
            { icon: 'archivebox',                          label: 'Archive',       onPress: () => { setMenuVisible(false); router.back(); } },
            { icon: 'exclamationmark.octagon',             label: 'Move to Spam',  onPress: () => { setMenuVisible(false); router.back(); } },
            { icon: 'printer',                             label: 'Print',         onPress: () => setMenuVisible(false) },
            { icon: 'trash',                               label: 'Delete',        onPress: () => { setMenuVisible(false); router.back(); }, destructive: true },
          ] as const).map(({ icon, label, onPress, destructive }, i) => (
            <View key={label}>
              {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 54 }} />}
              <Pressable
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 20, paddingVertical: 14,
                  backgroundColor: pressed ? C.surfacePressed : 'transparent',
                })}
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
      </BottomSheet>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root:   { flex: 1 },

  // Nav bar — circles only
  nav:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingBottom: 8 },
  navCircle:    { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },

  // Scroll
  scroll:         { flex: 1 },
  scrollContent:  { paddingHorizontal: 16, paddingTop: 12 },

  // Subject + count
  subject:      { fontSize: 22, fontWeight: '700', lineHeight: 28, marginBottom: 3 },
  threadCount:  { fontSize: 13, marginBottom: 18 },

  // Expanded email card
  emailCard:    { borderWidth: StyleSheet.hairlineWidth, borderRadius: 14, overflow: 'hidden' },
  senderRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14, paddingBottom: 10 },
  senderTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  senderName:   { fontSize: 15, fontWeight: '600', flex: 1 },
  emailDate:    { fontSize: 12, flexShrink: 0 },
  toRow:        { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  toLabel:      { fontSize: 13 },
  detailLine:   { fontSize: 12, marginTop: 2 },

  avatar:       { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:   { fontSize: 13, fontWeight: '700' },
  bodyText:     { fontSize: 15, lineHeight: 23, paddingHorizontal: 14, paddingBottom: 20 },

  attachSection:  { borderTopWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 8 },
  attachHeader:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase', marginBottom: 2 },
  attachChip:     { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, padding: 10 },
  attachName:     { fontSize: 13, fontWeight: '500' },
  attachSize:     { fontSize: 11, marginTop: 1 },

  // Collapsed email — single tight row (no card)
  collapsedRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 2, borderRadius: 8 },
  avatarSm:       { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarSmText:   { fontSize: 10, fontWeight: '700' },
  collapsedFrom:  { fontSize: 14, fontWeight: '600', width: 100, flexShrink: 0 },
  collapsedPreview: { flex: 1, fontSize: 13 },
  collapsedDate:  { fontSize: 12, flexShrink: 0 },

  // Divider between emails
  divider:      { height: StyleSheet.hairlineWidth, marginVertical: 2 },

  // Footer
  footer:       { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 6 },
  footerBtn:    { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8, borderRadius: 8 },
  footerLabel:  { fontSize: 12, fontWeight: '400' },
});
