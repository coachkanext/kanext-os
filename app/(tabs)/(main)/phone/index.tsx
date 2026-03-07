/**
 * Phone — Landing view is a recent calls list.
 * Tap row = call back. Long press = action popup. Swipe left = delete.
 * Side panel (swipe right) holds contacts, favorites, voicemail, dial pad, etc.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  missed: '#EF4444',
  separator: 'rgba(255,255,255,0.08)',
};

const DIRECTION_ICONS: Record<CallDirection, { icon: string; color: string }> = {
  incoming: { icon: 'arrow.down.left', color: C.muted },
  outgoing: { icon: 'arrow.up.right', color: C.muted },
  missed: { icon: 'arrow.down.left', color: C.missed },
  video: { icon: 'video.fill', color: C.muted },
};

// ── Long-press action popup ──

interface CallAction {
  icon: string;
  label: string;
  color?: string;
  onPress: () => void;
}

function CallActionPopup({
  visible,
  call,
  onClose,
  accent,
}: {
  visible: boolean;
  call: RecentCall | null;
  onClose: () => void;
  accent: string;
}) {
  if (!visible || !call) return null;

  const actions: CallAction[] = [
    { icon: 'phone.fill', label: 'Audio Call', color: '#34D399', onPress: () => { initiateCall({ contactName: call.name, contactInitials: call.initials, mode: call.mode, type: 'audio' }); onClose(); } },
    { icon: 'video.fill', label: 'Video Call', color: '#34D399', onPress: () => { initiateCall({ contactName: call.name, contactInitials: call.initials, mode: call.mode, type: 'video' }); onClose(); } },
    { icon: 'bubble.left.fill', label: 'Message', color: accent, onPress: onClose },
    { icon: 'person.circle', label: 'View Profile', color: C.secondary, onPress: onClose },
    { icon: 'trash.fill', label: 'Delete from Recents', color: C.missed, onPress: onClose },
  ];

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
      <Pressable style={popupStyles.backdrop} onPress={onClose}>
        <View style={popupStyles.card}>
          {/* Caller info */}
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

          {/* Actions */}
          {actions.map((action) => (
            <Pressable
              key={action.label}
              style={({ pressed }) => [
                popupStyles.actionRow,
                pressed && { backgroundColor: 'rgba(255,255,255,0.05)' },
              ]}
              onPress={action.onPress}
            >
              <IconSymbol name={action.icon as any} size={18} color={action.color ?? C.label} />
              <Text style={[popupStyles.actionLabel, { color: action.color ?? C.label }]}>
                {action.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

// ── Swipeable call row ──

function CallRow({
  call,
  accent,
  onTap,
  onLongPress,
  onDelete,
}: {
  call: RecentCall;
  accent: string;
  onTap: (call: RecentCall) => void;
  onLongPress: (call: RecentCall) => void;
  onDelete: (id: string) => void;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const isMissed = call.direction === 'missed';
  const dir = DIRECTION_ICONS[call.direction];
  const badgeColor = MODE_BADGE_COLORS[call.mode];
  const badgeLabel = MODE_BADGE_LABELS[call.mode];

  const renderRightActions = useCallback(
    (_progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({
        inputRange: [-80, -40, 0],
        outputRange: [1, 0.8, 0],
        extrapolate: 'clamp',
      });
      return (
        <RNAnimated.View style={[rowStyles.deleteAction, { transform: [{ scale }] }]}>
          <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
        </RNAnimated.View>
      );
    },
    [],
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      onSwipeableWillOpen={() => onDelete(call.id)}
      overshootRight={false}
    >
      <Pressable
        style={rowStyles.row}
        onPress={() => onTap(call)}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onLongPress(call);
        }}
        delayLongPress={400}
      >
        {/* Avatar */}
        <View style={rowStyles.avatar}>
          <Text style={rowStyles.initials}>{call.initials}</Text>
        </View>

        {/* Info */}
        <View style={rowStyles.info}>
          <View style={rowStyles.nameRow}>
            <Text
              style={[rowStyles.name, isMissed && { color: C.missed }]}
              numberOfLines={1}
            >
              {call.name}
            </Text>
            <View style={[rowStyles.modeBadge, { backgroundColor: badgeColor + '22' }]}>
              <Text style={[rowStyles.modeBadgeText, { color: badgeColor }]}>
                {badgeLabel}
              </Text>
            </View>
          </View>
          <View style={rowStyles.meta}>
            <IconSymbol name={dir.icon as any} size={12} color={dir.color} />
            <Text style={[rowStyles.username, isMissed && { color: C.missed }]}>
              {call.username}
            </Text>
            {call.hasVoicemail && (
              <IconSymbol name="recordingtape" size={12} color={accent} />
            )}
          </View>
        </View>

        {/* Timestamp */}
        <Text style={rowStyles.timestamp}>{call.timestamp}</Text>
      </Pressable>
    </Swipeable>
  );
}

// ── Main screen ──

export default function PhoneScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();

  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [popupCall, setPopupCall] = useState<RecentCall | null>(null);

  const visibleCalls = RECENT_CALLS.filter((c) => !deletedIds.has(c.id));

  const handleTap = useCallback((call: RecentCall) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({
      contactName: call.name,
      contactInitials: call.initials,
      mode: call.mode,
      type: 'audio',
    });
  }, []);

  const handleLongPress = useCallback((call: RecentCall) => {
    setPopupCall(call);
  }, []);

  const handleDelete = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDeletedIds((prev) => new Set(prev).add(id));
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Phone</Text>
      </View>

      {/* Recent calls list */}
      <RNAnimated.ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {visibleCalls.map((call, idx) => (
          <React.Fragment key={call.id}>
            <CallRow
              call={call}
              accent={accent}
              onTap={handleTap}
              onLongPress={handleLongPress}
              onDelete={handleDelete}
            />
            {idx < visibleCalls.length - 1 && <View style={rowStyles.separator} />}
          </React.Fragment>
        ))}

        {visibleCalls.length === 0 && (
          <View style={styles.emptyState}>
            <IconSymbol name="phone.fill" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No recent calls</Text>
          </View>
        )}
      </RNAnimated.ScrollView>

      {/* Long-press action popup */}
      <CallActionPopup
        visible={popupCall !== null}
        call={popupCall}
        onClose={() => setPopupCall(null)}
        accent={accent}
      />
    </View>
  );
}

// ── Styles ──

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: C.label,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: C.muted,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: C.bg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 15,
    fontWeight: '700',
    color: C.secondary,
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
    flexShrink: 1,
  },
  modeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  username: {
    fontSize: 13,
    color: C.muted,
  },
  timestamp: {
    fontSize: 13,
    color: C.muted,
  },
  separator: {
    height: 1,
    backgroundColor: C.separator,
    marginLeft: 80,
  },
  deleteAction: {
    backgroundColor: '#EF4444',
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const popupStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  card: {
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#0B0F14',
    borderRadius: 16,
    padding: 16,
  },
  callerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 14,
    fontWeight: '700',
    color: C.secondary,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: C.label,
  },
  username: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: C.separator,
    marginBottom: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
});
