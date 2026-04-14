/**
 * Recent Calls — Full page from Phone side panel.
 * Tap = callback. Long press = popup. Swipe left = delete.
 * Filter row: All | Missed | Incoming | Outgoing | Video.
 * Optional filterMode param to show calls for a specific KaNeXT number.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Modal,
  StyleSheet,
  Animated as RNAnimated,
  Animated,
} from 'react-native';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';
import {
  RECENT_CALLS,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  type RecentCall,
  type CallDirection,
} from '@/data/mock-phone';
import { initiateCall } from '@/utils/global-call';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import type { Mode } from '@/types';

type Filter = 'all' | 'missed' | 'incoming' | 'outgoing' | 'video';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'missed', label: 'Missed' },
  { key: 'incoming', label: 'Incoming' },
  { key: 'outgoing', label: 'Outgoing' },
  { key: 'video', label: 'Video' },
];

function getDirectionIcons(C: ComponentColors): Record<CallDirection, { icon: string; color: string }> {
  return {
    incoming: { icon: 'arrow.down.left', color: C.muted },
    outgoing: { icon: 'arrow.up.right', color: C.muted },
    missed: { icon: 'arrow.down.left', color: C.red },
    video: { icon: 'video.fill', color: C.muted },
  };
}

// ── Popup ──

function CallActionPopup({
  visible,
  call,
  onClose,
  accent,
  C,
  styles: popupStyles,
}: {
  visible: boolean;
  call: RecentCall | null;
  onClose: () => void;
  accent: string;
  C: ComponentColors;
  styles: ReturnType<typeof makePopupStyles>;
}) {
  if (!visible || !call) return null;

  const actions = [
    { icon: 'phone.fill', label: 'Audio Call', color: '#5A8A6E', onPress: () => { initiateCall({ contactName: call.name, contactInitials: call.initials, mode: call.mode, type: 'audio' }); onClose(); } },
    { icon: 'video.fill', label: 'Video Call', color: '#5A8A6E', onPress: () => { initiateCall({ contactName: call.name, contactInitials: call.initials, mode: call.mode, type: 'video' }); onClose(); } },
    { icon: 'bubble.left.fill', label: 'Message', color: accent, onPress: onClose },
    { icon: 'person.circle', label: 'View Profile', color: C.secondary, onPress: onClose },
    { icon: 'trash.fill', label: 'Delete', color: C.red, onPress: onClose },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          <View style={popupStyles.callerRow}>
            <View style={popupStyles.avatar}>
              <Text style={popupStyles.initials}>{call.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={popupStyles.name}>{call.name}</Text>
              <Text style={popupStyles.username}>{call.username}</Text>
            </View>
          </View>
          <View style={popupStyles.divider} />
          {actions.map((a) => (
            <Pressable
              key={a.label}
              style={({ pressed }) => [popupStyles.actionRow, pressed && { backgroundColor: 'rgba(255,255,255,0.05)' }]}
              onPress={a.onPress}
            >
              <IconSymbol name={a.icon as any} size={18} color={a.color} />
              <Text style={[popupStyles.actionLabel, { color: a.color }]}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Call row ──

function CallRow({
  call,
  accent,
  onTap,
  onLongPress,
  onDelete,
  C,
  styles: rowStyles,
  directionIcons,
}: {
  call: RecentCall;
  accent: string;
  onTap: (c: RecentCall) => void;
  onLongPress: (c: RecentCall) => void;
  onDelete: (id: string) => void;
  C: ComponentColors;
  styles: ReturnType<typeof makeRowStyles>;
  directionIcons: Record<CallDirection, { icon: string; color: string }>;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const isMissed = call.direction === 'missed';
  const dir = directionIcons[call.direction];
  const badgeColor = MODE_BADGE_COLORS[call.mode];
  const badgeLabel = MODE_BADGE_LABELS[call.mode];

  const renderRightActions = useCallback(
    (_progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({ inputRange: [-80, -40, 0], outputRange: [1, 0.8, 0], extrapolate: 'clamp' });
      return (
        <RNAnimated.View style={[rowStyles.deleteAction, { transform: [{ scale }] }]}>
          <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
        </RNAnimated.View>
      );
    },
    [rowStyles],
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      onSwipeableWillOpen={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onDelete(call.id);
      }}
      overshootRight={false}
    >
      <Pressable
        style={rowStyles.row}
        onPress={() => onTap(call)}
        onLongPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPress(call); }}
        delayLongPress={400}
      >
        <View style={rowStyles.avatar}>
          <Text style={rowStyles.initials}>{call.initials}</Text>
        </View>
        <View style={rowStyles.info}>
          <View style={rowStyles.nameRow}>
            <Text style={[rowStyles.name, isMissed && { color: C.red }]} numberOfLines={1}>{call.name}</Text>
            <View style={[rowStyles.modeBadge, { backgroundColor: badgeColor + '22' }]}>
              <Text style={[rowStyles.modeBadgeText, { color: badgeColor }]}>{badgeLabel}</Text>
            </View>
          </View>
          <View style={rowStyles.meta}>
            <IconSymbol name={dir.icon as any} size={12} color={dir.color} />
            <Text style={[rowStyles.username, isMissed && { color: C.red }]}>{call.username}</Text>
            {call.hasVoicemail && <IconSymbol name="recordingtape" size={12} color={accent} />}
          </View>
        </View>
        <Text style={rowStyles.timestamp}>{call.timestamp}</Text>
      </Pressable>
    </Swipeable>
  );
}

// ── Screen ──

const TOP_BAR_H = 56;

export default function RecentCallsScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const params = useLocalSearchParams<{ filterMode?: string }>();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const rowStyles = useMemo(() => makeRowStyles(C), [C]);
  const popupStyles = useMemo(() => makePopupStyles(C), [C]);
  const directionIcons = useMemo(() => getDirectionIcons(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [filter, setFilter] = useState<Filter>('all');
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [popupCall, setPopupCall] = useState<RecentCall | null>(null);

  const visibleCalls = useMemo(() => {
    let list = RECENT_CALLS.filter((c) => !deletedIds.has(c.id));
    if (params.filterMode) list = list.filter((c) => c.mode === params.filterMode);
    if (filter !== 'all') list = list.filter((c) => c.direction === filter);
    return list;
  }, [deletedIds, filter, params.filterMode]);

  const handleTap = useCallback((call: RecentCall) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: call.name, contactInitials: call.initials, mode: call.mode, type: 'audio' });
  }, []);

  const title = params.filterMode
    ? `${MODE_BADGE_LABELS[params.filterMode as Mode] ?? ''} Calls`
    : 'Recent Calls';

  return (
    <View
      style={styles.container}
    >
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </Animated.View>
      {/* Calls list */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={styles.list}
        contentContainerStyle={[styles.listContent, { paddingTop: insets.top + TOP_BAR_H }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Filter pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <Pressable
              key={f.key}
              style={[styles.filterPill, filter === f.key && { backgroundColor: accent }]}
              onPress={() => setFilter(f.key)}
            >
              <Text style={[styles.filterText, filter === f.key && { color: '#FFFFFF' }]}>{f.label}</Text>
            </Pressable>
          ))}
        </View>
        {visibleCalls.map((call, idx) => (
          <React.Fragment key={call.id}>
            <CallRow
              call={call}
              accent={accent}
              onTap={handleTap}
              onLongPress={setPopupCall}
              onDelete={(id) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDeletedIds((prev) => new Set(prev).add(id)); }}
              C={C}
              styles={rowStyles}
              directionIcons={directionIcons}
            />
            {idx < visibleCalls.length - 1 && <View style={rowStyles.separator} />}
          </React.Fragment>
        ))}
        {visibleCalls.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="phone.fill" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No calls</Text>
          </View>
        )}
      </ScrollView>

      <CallActionPopup visible={popupCall !== null} call={popupCall} onClose={() => setPopupCall(null)} accent={accent} C={C} styles={popupStyles} />
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
  filterRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: C.surface },
  filterText: { fontSize: 13, fontWeight: '600', color: C.secondary },
  list: { flex: 1 },
  listContent: { paddingBottom: 100 },
  emptyState: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },
});

const makeRowStyles = (C: ComponentColors) => StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, gap: 12, backgroundColor: C.bg },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 15, fontWeight: '700', color: C.secondary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 16, fontWeight: '600', color: C.label, flexShrink: 1 },
  modeBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  modeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  username: { fontSize: 13, color: C.muted },
  timestamp: { fontSize: 13, color: C.muted },
  separator: { height: 1, backgroundColor: C.separator, marginLeft: 80 },
  deleteAction: { backgroundColor: C.red, width: 72, alignItems: 'center', justifyContent: 'center' },
});

const makePopupStyles = (C: ComponentColors) => StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  card: { width: '80%', maxWidth: 320, backgroundColor: C.surface, borderRadius: 16, padding: 16 },
  callerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  initials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  name: { fontSize: 16, fontWeight: '600', color: C.label },
  username: { fontSize: 13, color: C.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: C.separator, marginBottom: 4 },
  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4, borderRadius: 8 },
  actionLabel: { fontSize: 15, fontWeight: '500' },
});
