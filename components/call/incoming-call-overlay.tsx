/**
 * Incoming Call Overlay — Full-screen overlay for incoming calls.
 * Three buttons: Decline (red), Accept Audio (green), Accept Video (green camera).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  subscribeIncomingCall,
  acceptIncomingCall,
  declineIncomingCall,
  type IncomingCall,
} from '@/utils/global-call';
import { MODE_BADGE_COLORS, MODE_BADGE_LABELS } from '@/data/mock-phone';

export function IncomingCallOverlay() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [call, setCall] = useState<IncomingCall | null>(null);

  useEffect(() => subscribeIncomingCall(setCall), []);

  if (!call) return null;

  const badgeColor = MODE_BADGE_COLORS[call.mode];
  const badgeLabel = MODE_BADGE_LABELS[call.mode];

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Caller info */}
      <View style={styles.center}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{call.contactInitials}</Text>
        </View>
        <Text style={styles.name}>{call.contactName}</Text>
        <View style={[styles.badge, { backgroundColor: badgeColor + '33' }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>
            {badgeLabel} Call
          </Text>
        </View>
        <Text style={styles.status}>Incoming Call...</Text>
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        {/* Decline */}
        <Pressable
          style={styles.actionWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            declineIncomingCall();
          }}
        >
          <View style={[styles.actionBtn, { backgroundColor: C.red }]}>
            <IconSymbol name="phone.down.fill" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Decline</Text>
        </Pressable>

        {/* Accept Audio */}
        <Pressable
          style={styles.actionWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            acceptIncomingCall('audio');
          }}
        >
          <View style={[styles.actionBtn, { backgroundColor: C.green }]}>
            <IconSymbol name="phone.fill" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Audio</Text>
        </Pressable>

        {/* Accept Video */}
        <Pressable
          style={styles.actionWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            acceptIncomingCall('video');
          }}
        >
          <View style={[styles.actionBtn, { backgroundColor: C.green }]}>
            <IconSymbol name="video.fill" size={28} color="#FFFFFF" />
          </View>
          <Text style={styles.actionLabel}>Video</Text>
        </Pressable>
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.bg,
    zIndex: 25000,
    justifyContent: 'space-between',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  initials: {
    fontSize: 36,
    fontWeight: '700',
    color: C.secondary,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: C.label,
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  status: {
    fontSize: 16,
    color: C.secondary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 36,
    paddingBottom: 40,
  },
  actionWrap: {
    alignItems: 'center',
    gap: 8,
  },
  actionBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    fontSize: 13,
    color: C.secondary,
  },
});
