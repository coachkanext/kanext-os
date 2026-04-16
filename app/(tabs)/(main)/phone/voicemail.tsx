/**
 * Voicemail — Full page. Tap = expand transcription + play.
 * Swipe left = delete. Unheard = bold.
 */

import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated as RNAnimated,
  Animated,
} from 'react-native';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useAccentColor } from '@/hooks/use-accent-color';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useFocusEffect, useRouter } from 'expo-router';

import {
  VOICEMAILS,
  MODE_BADGE_COLORS,
  MODE_BADGE_LABELS,
  type Voicemail,
} from '@/data/mock-phone';

function VoicemailRow({
  vm,
  accent,
  isHeard,
  onExpand,
  expanded,
  onDelete,
  C,
  styles,
}: {
  vm: Voicemail;
  accent: string;
  isHeard: boolean;
  onExpand: () => void;
  expanded: boolean;
  onDelete: () => void;
  C: ComponentColors;
  styles: ReturnType<typeof makeStyles>;
}) {
  const swipeRef = useRef<Swipeable>(null);
  const badgeColor = MODE_BADGE_COLORS[vm.mode];

  const renderRightActions = useCallback(
    (_progress: RNAnimated.AnimatedInterpolation<number>, dragX: RNAnimated.AnimatedInterpolation<number>) => {
      const scale = dragX.interpolate({ inputRange: [-80, -40, 0], outputRange: [1, 0.8, 0], extrapolate: 'clamp' });
      return (
        <RNAnimated.View style={[styles.deleteAction, { transform: [{ scale }] }]}>
          <IconSymbol name="trash.fill" size={20} color="#FFFFFF" />
        </RNAnimated.View>
      );
    },
    [styles],
  );

  return (
    <Swipeable
      ref={swipeRef}
      renderRightActions={renderRightActions}
      rightThreshold={60}
      onSwipeableWillOpen={() => onDelete()}
      overshootRight={false}
    >
      <Pressable style={styles.vmRow} onPress={onExpand}>
        <View style={styles.vmHeader}>
          <View style={styles.vmAvatar}>
            <Text style={styles.vmInitials}>{vm.callerInitials}</Text>
          </View>
          <View style={styles.vmInfo}>
            <View style={styles.vmNameRow}>
              <Text style={[styles.vmName, !isHeard && styles.vmNameBold]} numberOfLines={1}>
                {vm.callerName}
              </Text>
              <View style={[styles.badge, { backgroundColor: badgeColor + '22' }]}>
                <Text style={[styles.badgeText, { color: badgeColor }]}>
                  {MODE_BADGE_LABELS[vm.mode]}
                </Text>
              </View>
            </View>
            <Text style={styles.vmMeta}>{vm.duration} · {vm.timestamp}</Text>
            {!expanded && (
              <Text style={styles.vmPreview} numberOfLines={1}>{vm.transcription}</Text>
            )}
          </View>
          <Pressable
            hitSlop={8}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <IconSymbol name="play.circle.fill" size={28} color={accent} />
          </Pressable>
        </View>

        {expanded && (
          <View style={styles.transcriptionWrap}>
            <Text style={styles.transcriptionLabel}>Nexus Transcription</Text>
            <Text style={styles.transcriptionText}>{vm.transcription}</Text>
          </View>
        )}
      </Pressable>
    </Swipeable>
  );
}

const TOP_BAR_H = 52;

export default function VoicemailScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaytv');
  const isOwner = role === roleCycles[0];
  const router = useRouter();
  const isOwnerRef = useRef(isOwner);
  useEffect(() => {
    if (isOwnerRef.current === isOwner) return;
    isOwnerRef.current = isOwner;
    router.navigate('/(tabs)/(main)/phone' as any);
  }, [isOwner]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [heardIds, setHeardIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visible = VOICEMAILS.filter((v) => !deletedIds.has(v.id));

  const handleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setHeardIds((prev) => new Set(prev).add(id));
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Voicemail</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={styles.list}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {visible.map((vm, idx) => (
          <React.Fragment key={vm.id}>
            <VoicemailRow
              vm={vm}
              accent={accent}
              isHeard={heardIds.has(vm.id)}
              expanded={expandedId === vm.id}
              onExpand={() => handleExpand(vm.id)}
              onDelete={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setDeletedIds((prev) => new Set(prev).add(vm.id));
              }}
              C={C}
              styles={styles}
            />
            {idx < visible.length - 1 && <View style={styles.separator} />}
          </React.Fragment>
        ))}

        {visible.length === 0 && (
          <View style={styles.empty}>
            <IconSymbol name="recordingtape" size={36} color={C.muted} />
            <Text style={styles.emptyText}>No voicemails</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  topBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  list: { flex: 1 },
  separator: { height: 1, backgroundColor: C.separator, marginLeft: 76 },

  vmRow: { paddingHorizontal: 20, paddingVertical: 14 },
  vmHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vmAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  vmInitials: { fontSize: 14, fontWeight: '700', color: C.secondary },
  vmInfo: { flex: 1 },
  vmNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  vmName: { fontSize: 16, fontWeight: '400', color: C.label, flexShrink: 1 },
  vmNameBold: { fontWeight: '700' },
  vmMeta: { fontSize: 13, color: C.muted, marginTop: 2 },
  vmPreview: { fontSize: 13, color: C.secondary, marginTop: 4, fontStyle: 'italic' },

  badge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  badgeText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.3 },

  transcriptionWrap: { marginTop: 12, marginLeft: 56, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: 'rgba(255,255,255,0.12)' },
  transcriptionLabel: { fontSize: 11, fontWeight: '600', color: C.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 },
  transcriptionText: { fontSize: 14, color: C.secondary, lineHeight: 20 },

  deleteAction: { backgroundColor: C.red, width: 72, alignItems: 'center', justifyContent: 'center' },
  empty: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },
});
