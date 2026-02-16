/**
 * Event Detail Sheet
 * Bottom sheet shown on event tap in any calendar view.
 */

import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS, formatEventTime, formatDate } from '@/data/calendar-utils';
import type { ProgramCalendarEvent } from '@/types';

interface EventDetailSheetProps {
  visible: boolean;
  onClose: () => void;
  event: ProgramCalendarEvent | null;
  colors: typeof Colors.light;
  router: any;
}

export function EventDetailSheet({ visible, onClose, event, colors, router }: EventDetailSheetProps) {
  if (!event) return <BottomSheet visible={false} onClose={onClose} useModal><View /></BottomSheet>;

  const typeColor = EVENT_TYPE_COLORS[event.type];
  const typeLabel = EVENT_TYPE_LABELS[event.type];

  const navigate = (params: any) => {
    onClose();
    setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      router.push(params);
    }, 200);
  };

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={styles.container}>
        {/* Type badge */}
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '20' }]}>
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
          <ThemedText style={[styles.typeText, { color: typeColor }]}>{typeLabel}</ThemedText>
        </View>

        {/* Title */}
        <ThemedText style={[styles.title, { color: colors.text }]}>{event.title}</ThemedText>

        {/* Time */}
        <View style={styles.infoRow}>
          <IconSymbol name="clock.fill" size={14} color={colors.textTertiary} />
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            {formatDate(event.startDatetime)}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <View style={{ width: 14 }} />
          <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>
            {formatEventTime(event.startDatetime)} – {formatEventTime(event.endDatetime)}
          </ThemedText>
        </View>

        {/* Location */}
        {event.location && (
          <View style={styles.infoRow}>
            <IconSymbol name="mappin" size={14} color={colors.textTertiary} />
            <ThemedText style={[styles.infoText, { color: colors.textSecondary }]}>{event.location}</ThemedText>
          </View>
        )}

        {/* Description */}
        {event.description && (
          <ThemedText style={[styles.description, { color: colors.textSecondary }]}>
            {event.description}
          </ThemedText>
        )}

        {/* Game score */}
        {event.gameScore && (
          <View style={[styles.scoreBadge, { backgroundColor: event.gameScore.startsWith('W') ? '#4CAF5015' : '#EF444415' }]}>
            <ThemedText style={[styles.scoreText, { color: event.gameScore.startsWith('W') ? '#4CAF50' : '#EF4444' }]}>
              {event.gameScore.replace('-', '–')}
            </ThemedText>
          </View>
        )}

        {/* Contextual route */}
        {event.type === 'game' && event.routeTarget && (
          <Pressable
            style={({ pressed }) => [styles.routeBtn, { backgroundColor: colors.backgroundSecondary }, pressed && { opacity: 0.7 }]}
            onPress={() => {
              if (event.gameStatus === 'final') {
                navigate({ pathname: '/coach/game-detail', params: { gameId: event.routeTarget, tab: 'report', espnTab: 'gamecast' } });
              } else {
                navigate({ pathname: '/coach/game-detail', params: { gameId: event.routeTarget } });
              }
            }}
          >
            <IconSymbol name="sportscourt.fill" size={16} color={colors.text} />
            <ThemedText style={[styles.routeBtnText, { color: colors.text }]}>
              {event.gameStatus === 'final' ? 'Open KaNeXTCast' : 'Open in Games'}
            </ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        )}

        {event.type === 'recruiting' && (
          <Pressable
            style={({ pressed }) => [styles.routeBtn, { backgroundColor: colors.backgroundSecondary }, pressed && { opacity: 0.7 }]}
            onPress={() => navigate('/coach/recruiting' as any)}
          >
            <IconSymbol name="person.badge.plus" size={16} color={colors.text} />
            <ThemedText style={[styles.routeBtnText, { color: colors.text }]}>Open in Recruiting</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </Pressable>
        )}

        {/* Read-only indicator */}
        {event.isReadOnly && (
          <ThemedText style={[styles.readOnly, { color: colors.textTertiary }]}>
            This event is auto-generated and cannot be edited.
          </ThemedText>
        )}
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  typeBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, gap: 6, marginBottom: Spacing.md },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  typeText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.3 },
  title: { fontSize: 20, fontWeight: '700', marginBottom: Spacing.md },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 14 },
  description: { fontSize: 14, lineHeight: 20, marginTop: Spacing.md, marginBottom: Spacing.md },
  scoreBadge: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginBottom: Spacing.md },
  scoreText: { fontSize: 16, fontWeight: '800' },
  routeBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: Spacing.md, borderRadius: BorderRadius.lg, gap: 10, marginTop: 4 },
  routeBtnText: { fontSize: 15, fontWeight: '600', flex: 1 },
  readOnly: { fontSize: 11, marginTop: Spacing.md, fontStyle: 'italic' },
});
