/**
 * Voicemail — Full page. Tap = expand transcription + play.
 * Swipe left = delete. Unheard = bold.
 */

import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated as RNAnimated,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAccentColor } from '@/hooks/use-accent-color';


import { useColors, type ComponentColors } from '@/hooks/use-colors';

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

export default function VoicemailScreen() {
  const insets = useSafeAreaInsets();
  const accent = useAccentColor();
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [heardIds, setHeardIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const visible = VOICEMAILS.filter((v) => !deletedIds.has(v.id));

  const handleExpand = useCallback((id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
    setHeardIds((prev) => new Set(prev).add(id));
  }, []);

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Voicemail</Text>
      </View>

      <ScrollView style={styles.list} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '700', color: C.label },
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
