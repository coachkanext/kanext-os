/**
 * Moderation Queue — Owner-only.
 * Review flagged posts, reported members, and pending approval items.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { resetFooter } from '@/utils/global-footer-hide';
import { useOwnerGuard } from '@/hooks/use-owner-guard';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterId = 'all' | 'flagged' | 'reported' | 'pending';
type ReasonType = 'Spam' | 'Harassment' | 'Off-Topic' | 'Inappropriate';

interface FlaggedItem {
  id: string;
  itemType: 'flagged';
  reporterName: string;
  timeAgo: string;
  reason: ReasonType;
  postText: string;
  postAuthor: string;
}

interface ReportedItem {
  id: string;
  itemType: 'reported';
  reporterName: string;
  timeAgo: string;
  reason: ReasonType;
  memberName: string;
  memberHandle: string;
  memberTier: string;
  memberJoined: string;
  activitySummary: string;
}

type QueueItem = FlaggedItem | ReportedItem;

// ─── Demo Data ────────────────────────────────────────────────────────────────

const INITIAL_ITEMS: QueueItem[] = [
  {
    id: 'q1',
    itemType: 'flagged',
    reporterName: 'Isaiah Grant',
    timeAgo: '3h ago',
    reason: 'Off-Topic',
    postText: 'Anyone want to buy my old PS5? DM me 🎮 Got a great deal for ya',
    postAuthor: 'Jordan Mensah',
  },
  {
    id: 'q2',
    itemType: 'reported',
    reporterName: 'Chioma Obi',
    timeAgo: '1d ago',
    reason: 'Spam',
    memberName: 'Blessing Eze',
    memberHandle: '@blessingeze',
    memberTier: 'Free Community',
    memberJoined: 'Joined 4mo ago',
    activitySummary: '2 posts flagged this month',
  },
];

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'all',      label: 'All' },
  { id: 'flagged',  label: 'Flagged Posts' },
  { id: 'reported', label: 'Reported Members' },
  { id: 'pending',  label: 'Pending Approval' },
];

// ─── Reason Badge ─────────────────────────────────────────────────────────────

function ReasonBadge({ reason }: { reason: ReasonType }) {
  const C = useColors();
  const isHeat = reason === 'Spam' || reason === 'Harassment' || reason === 'Inappropriate';
  const color = isHeat ? C.heat : C.caution;
  return (
    <View style={[rb.badge, { borderColor: color }]}>
      <Text style={[rb.label, { color }]}>{reason}</Text>
    </View>
  );
}

const rb = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: StyleSheet.hairlineWidth, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  label: { fontSize: 11, fontWeight: '600' },
});

// ─── Action Button ────────────────────────────────────────────────────────────

function ActionBtn({
  label,
  color,
  onPress,
}: {
  label: string;
  color?: string;
  onPress: () => void;
}) {
  const C = useColors();
  const borderColor = color || C.label;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [ab.btn, { borderColor }, pressed && { opacity: 0.7 }]}
    >
      <Text style={[ab.label, { color: borderColor }]}>{label}</Text>
    </Pressable>
  );
}

const ab = StyleSheet.create({
  btn:   { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 7, borderWidth: StyleSheet.hairlineWidth },
  label: { fontSize: 13, fontWeight: '600' },
});

// ─── Flagged Post Card ────────────────────────────────────────────────────────

function FlaggedPostCard({ item, onResolve }: { item: FlaggedItem; onResolve: (id: string) => void }) {
  const C = useColors();

  const handleApprove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onResolve(item.id);
  };

  const handleRemove = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Remove Post?', 'This will permanently delete the content.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => onResolve(item.id) },
    ]);
  };

  const handleWarn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Warning Sent', `A warning has been sent to ${item.postAuthor} via Dipson.`);
    onResolve(item.id);
  };

  return (
    <View style={[fc.card, { backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 10 }]}>
      <View style={fc.reporterRow}>
        <View style={[fc.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={14} color={C.secondary} />
        </View>
        <Text style={[fc.reporterText, { color: C.label }]}>
          Reported by <Text style={{ fontWeight: '700' }}>{item.reporterName}</Text>
        </Text>
        <Text style={[fc.timeText, { color: C.secondary }]}>{item.timeAgo}</Text>
      </View>

      <ReasonBadge reason={item.reason} />

      <View style={[fc.postPreview, { backgroundColor: C.bg, borderColor: C.separator }]}>
        <Text style={[fc.postAuthor, { color: C.secondary }]}>{item.postAuthor}</Text>
        <Text style={[fc.postText, { color: C.label }]} numberOfLines={3}>{item.postText}</Text>
      </View>

      <View style={fc.actions}>
        <ActionBtn label="Approve" onPress={handleApprove} />
        <ActionBtn label="Remove" color={C.heat} onPress={handleRemove} />
        <ActionBtn label="Warn" color={C.caution} onPress={handleWarn} />
      </View>
    </View>
  );
}

const fc = StyleSheet.create({
  card:        { borderRadius: 14, padding: 14, gap: 10 },
  reporterRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:      { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reporterText:{ flex: 1, fontSize: 13 },
  timeText:    { fontSize: 12 },
  postPreview: { borderRadius: 10, padding: 10, borderWidth: StyleSheet.hairlineWidth, gap: 4 },
  postAuthor:  { fontSize: 12, fontWeight: '600' },
  postText:    { fontSize: 13, lineHeight: 18 },
  actions:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

// ─── Reported Member Card ─────────────────────────────────────────────────────

function ReportedMemberCard({ item, onResolve }: { item: ReportedItem; onResolve: (id: string) => void }) {
  const C = useColors();

  const handleDismiss = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onResolve(item.id);
  };

  const handleWarn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Warning Sent', `A warning has been sent to ${item.memberName} via Dipson.`);
    onResolve(item.id);
  };

  const handleSuspend = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('Suspend Member?', `${item.memberName} will be temporarily restricted from posting.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Suspend', style: 'destructive', onPress: () => onResolve(item.id) },
    ]);
  };

  const handleBan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Alert.alert(
      `Ban ${item.memberName}?`,
      'They will lose access to all spaces and community content. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Ban', style: 'destructive', onPress: () => onResolve(item.id) },
      ]
    );
  };

  return (
    <View style={[rm.card, { backgroundColor: C.surface, marginHorizontal: 16, marginBottom: 10 }]}>
      <View style={rm.reporterRow}>
        <View style={[rm.avatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={14} color={C.secondary} />
        </View>
        <Text style={[rm.reporterText, { color: C.label }]}>
          Reported by <Text style={{ fontWeight: '700' }}>{item.reporterName}</Text>
        </Text>
        <Text style={[rm.timeText, { color: C.secondary }]}>{item.timeAgo}</Text>
      </View>

      <ReasonBadge reason={item.reason} />

      <View style={[rm.memberCard, { backgroundColor: C.bg, borderColor: C.separator }]}>
        <View style={[rm.memberAvatar, { backgroundColor: C.separator }]}>
          <IconSymbol name="person.fill" size={18} color={C.secondary} />
        </View>
        <View style={rm.memberInfo}>
          <Text style={[rm.memberName, { color: C.label }]}>{item.memberName}</Text>
          <Text style={[rm.memberMeta, { color: C.secondary }]}>{item.memberHandle} · {item.memberTier}</Text>
          <Text style={[rm.memberMeta, { color: C.secondary }]}>{item.memberJoined}</Text>
        </View>
      </View>

      <Text style={[rm.activity, { color: C.secondary }]}>{item.activitySummary}</Text>

      <View style={rm.actions}>
        <ActionBtn label="Dismiss" onPress={handleDismiss} />
        <ActionBtn label="Warn" color={C.caution} onPress={handleWarn} />
        <ActionBtn label="Suspend" color={C.caution} onPress={handleSuspend} />
        <ActionBtn label="Ban" color={C.heat} onPress={handleBan} />
      </View>
    </View>
  );
}

const rm = StyleSheet.create({
  card:         { borderRadius: 14, padding: 14, gap: 10 },
  reporterRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:       { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  reporterText: { flex: 1, fontSize: 13 },
  timeText:     { fontSize: 12 },
  memberCard:   { borderRadius: 10, padding: 10, borderWidth: StyleSheet.hairlineWidth, flexDirection: 'row', gap: 10, alignItems: 'center' },
  memberAvatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  memberInfo:   { flex: 1, gap: 2 },
  memberName:   { fontSize: 14, fontWeight: '700' },
  memberMeta:   { fontSize: 12 },
  activity:     { fontSize: 13 },
  actions:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  const C = useColors();
  return (
    <View style={es.container}>
      <IconSymbol name="checkmark.circle" size={40} color={C.secondary} />
      <Text style={[es.heading, { color: C.label }]}>All clear</Text>
      <Text style={[es.sub, { color: C.secondary }]}>No items to review.</Text>
    </View>
  );
}

const es = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 32 },
  heading:   { fontSize: 17, fontWeight: '600' },
  sub:       { fontSize: 14, textAlign: 'center' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ModerationScreen() {
  const insets = useSafeAreaInsets();
  const C = useColors();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:network');
  const isOwner = role === roleCycles[0];
  const guardedCycle = useOwnerGuard(role, roleCycles, cycleRole, '/(tabs)/(main)/network');
  const [items, setItems] = useState<QueueItem[]>(INITIAL_ITEMS);
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  if (!isOwner) return null;

  const handleResolve = (id: string) => setItems(prev => prev.filter(i => i.id !== id));

  const filteredItems = items.filter(i => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'flagged') return i.itemType === 'flagged';
    if (activeFilter === 'reported') return i.itemType === 'reported';
    return false;
  });

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8, borderBottomColor: C.separator, backgroundColor: C.bg }]}>
        <Pressable onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>

        <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[s.titleText, { color: C.label }]}>Moderation</Text>
        </View>

        <RolePill role={role} onPress={guardedCycle} isPrimary={isOwner} />
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[s.filterRow, { borderBottomColor: C.separator }]}
        contentContainerStyle={s.filterContent}
      >
        {FILTERS.map(f => {
          const active = activeFilter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => setActiveFilter(f.id)}
              style={[
                s.filterPill,
                active
                  ? { backgroundColor: C.label }
                  : { borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator },
              ]}
            >
              <Text style={[s.filterPillText, { color: active ? C.bg : C.label }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <EmptyState />
      ) : (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: 49 + insets.bottom + 24 }}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.map(item => {
            if (item.itemType === 'flagged') {
              return <FlaggedPostCard key={item.id} item={item as FlaggedItem} onResolve={handleResolve} />;
            }
            return <ReportedMemberCard key={item.id} item={item as ReportedItem} onResolve={handleResolve} />;
          })}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1 },
  topBar:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  titlePill:      { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: StyleSheet.hairlineWidth },
  titleText:      { fontSize: 15, fontWeight: '600' },
  filterRow:      { flexGrow: 0, borderBottomWidth: StyleSheet.hairlineWidth },
  filterContent:  { paddingHorizontal: 16, paddingVertical: 10, gap: 8, flexDirection: 'row' },
  filterPill:     { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  filterPillText: { fontSize: 13, fontWeight: '600' },
});
