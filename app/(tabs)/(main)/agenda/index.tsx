/**
 * Agenda — Now · Plan · Feed
 *
 * Now view (default):
 *   1. Now/Next Hero Card
 *   2. Critical Updates (horizontal scroll)
 *   3. Daily Timeline (starts at current hour)
 *   4. Missed / Overdue (horizontal scroll)
 *   5. Priority Stack (horizontal scroll)
 *   6. Prep Blocks (horizontal scroll)
 *
 * Side panel: left-edge tab, swipe right to open.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AgendaSidePanel } from '@/components/side-panel/agenda-panel';
import {
  NOW_ITEM,
  NEXT_ITEM,
  CRITICAL_UPDATES,
  TIMELINE_BLOCKS,
  MISSED_ITEMS,
  PRIORITY_ITEMS,
  PREP_BLOCKS,
  type NowItem,
  type CriticalUpdate,
  type TimelineBlock,
  type MissedItem,
  type PriorityItem,
  type PrepBlock,
  type AgendaPriority,
  type CriticalChangeType,
  type PrepType,
} from '@/data/mock-agenda-now';

// ─── Constants ────────────────────────────────────────────────────────────────

const PANEL_WIDTH = 0; // computed below via Dimensions
const VIEWS = ['Now', 'Plan', 'Feed'] as const;
type AgendaView = (typeof VIEWS)[number];

const PRIORITY_COLOR: Record<AgendaPriority, string> = {
  critical: '#EF4444',
  high:     '#F97316',
  normal:   '#6B7280',
  low:      '#D1D5DB',
};

const CHANGE_COLOR: Record<CriticalChangeType, string> = {
  cancelled: '#EF4444',
  moved:     '#F97316',
  urgent:    '#EF4444',
  blocked:   '#EAB308',
};

const PREP_ICON: Record<PrepType, any> = {
  film:    'film.fill',
  sermon:  'book.fill',
  meeting: 'person.3.fill',
  class:   'graduationcap.fill',
  content: 'pencil.and.list.clipboard',
};

// ─── View Switcher ────────────────────────────────────────────────────────────

function ViewSwitcher({
  active,
  onChange,
  C,
}: {
  active: AgendaView;
  onChange: (v: AgendaView) => void;
  C: ComponentColors;
}) {
  return (
    <View style={[switcherStyles.track, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
      {VIEWS.map((v) => {
        const isActive = v === active;
        return (
          <Pressable
            key={v}
            style={[
              switcherStyles.segment,
              isActive && [switcherStyles.segmentActive, { backgroundColor: C.bg }],
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onChange(v);
            }}
          >
            <Text
              style={[
                switcherStyles.label,
                { color: isActive ? C.label : C.secondary },
                isActive && switcherStyles.labelActive,
              ]}
            >
              {v}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const switcherStyles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
  },
  segmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: { fontSize: 14, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
});

// ─── Now/Next Hero Card ───────────────────────────────────────────────────────

function NowNextCard({ C }: { C: ComponentColors }) {
  const now = NOW_ITEM;
  const next = NEXT_ITEM;

  return (
    <View style={[heroStyles.card, { backgroundColor: C.bg, borderColor: C.separator }]}>
      {/* Current item */}
      <View style={heroStyles.nowSection}>
        <View style={heroStyles.topRow}>
          <View style={[heroStyles.statusDot, { backgroundColor: '#22C55E' }]} />
          <Text style={[heroStyles.nowLabel, { color: '#22C55E' }]}>NOW</Text>
          <View style={[heroStyles.typeBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[heroStyles.typeBadgeText, { color: C.secondary }]}>
              {now.type.toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={[heroStyles.priorityDot, { backgroundColor: PRIORITY_COLOR[now.priority] }]} />
        </View>

        <Text style={[heroStyles.nowTitle, { color: C.label }]}>{now.title}</Text>

        <View style={heroStyles.metaRow}>
          <IconSymbol name="clock.fill" size={12} color={C.muted} />
          <Text style={[heroStyles.metaText, { color: C.secondary }]}>
            {now.time} – {now.endTime}
          </Text>
          <View style={[heroStyles.orgBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[heroStyles.orgText, { color: C.muted }]}>{now.org}</Text>
          </View>
        </View>

        {now.isLate && (
          <View style={[heroStyles.warningRow, { backgroundColor: 'rgba(239,68,68,0.08)' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
            <Text style={[heroStyles.warningText, { color: '#EF4444' }]}>Running late</Text>
          </View>
        )}
        {now.hasConflict && now.conflictNote && (
          <View style={[heroStyles.warningRow, { backgroundColor: 'rgba(234,179,8,0.08)' }]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EAB308" />
            <Text style={[heroStyles.warningText, { color: '#EAB308' }]}>{now.conflictNote}</Text>
          </View>
        )}
      </View>

      <View style={[heroStyles.divider, { backgroundColor: C.separator }]} />

      {/* Next item */}
      <View style={heroStyles.nextSection}>
        <View style={heroStyles.topRow}>
          <Text style={[heroStyles.nextLabel, { color: C.muted }]}>NEXT</Text>
          <View style={[heroStyles.typeBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[heroStyles.typeBadgeText, { color: C.secondary }]}>
              {next.type.toUpperCase()}
            </Text>
          </View>
          {next.countdownMin != null && (
            <View style={[heroStyles.countdown, { backgroundColor: C.surfacePressed }]}>
              <Text style={[heroStyles.countdownText, { color: C.secondary }]}>
                in {next.countdownMin}m
              </Text>
            </View>
          )}
        </View>
        <Text style={[heroStyles.nextTitle, { color: C.label }]}>{next.title}</Text>
        <View style={heroStyles.metaRow}>
          <IconSymbol name="clock" size={12} color={C.muted} />
          <Text style={[heroStyles.metaText, { color: C.secondary }]}>
            {next.time} – {next.endTime}
          </Text>
          <View style={[heroStyles.orgBadge, { backgroundColor: C.surfacePressed }]}>
            <Text style={[heroStyles.orgText, { color: C.muted }]}>{next.org}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const heroStyles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  nowSection: { padding: 16, gap: 8 },
  nextSection: { padding: 16, gap: 6 },
  divider: { height: StyleSheet.hairlineWidth },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  nowLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  nextLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.5 },
  priorityDot: { width: 8, height: 8, borderRadius: 4 },
  nowTitle: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3 },
  nextTitle: { fontSize: 16, fontWeight: '600', letterSpacing: -0.2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaText: { fontSize: 13 },
  orgBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  orgText: { fontSize: 11, fontWeight: '500' },
  countdown: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  countdownText: { fontSize: 11, fontWeight: '600' },
  warningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  warningText: { fontSize: 12, fontWeight: '500' },
});

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, count, C }: { title: string; count?: number; C: ComponentColors }) {
  return (
    <View style={sectionHeaderStyles.row}>
      <Text style={[sectionHeaderStyles.title, { color: C.muted }]}>{title.toUpperCase()}</Text>
      {count != null && (
        <View style={[sectionHeaderStyles.badge, { backgroundColor: C.surfacePressed }]}>
          <Text style={[sectionHeaderStyles.badgeText, { color: C.secondary }]}>{count}</Text>
        </View>
      )}
    </View>
  );
}

const sectionHeaderStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 11, fontWeight: '600' },
});

// ─── Critical Updates Row ─────────────────────────────────────────────────────

function CriticalUpdatesRow({ C }: { C: ComponentColors }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {CRITICAL_UPDATES.map((u) => (
        <View
          key={u.id}
          style={[
            updateCardStyles.card,
            { backgroundColor: C.bg, borderColor: C.separator, borderLeftColor: CHANGE_COLOR[u.changeType] },
          ]}
        >
          <Text style={[updateCardStyles.changeType, { color: CHANGE_COLOR[u.changeType] }]}>
            {u.changeType.toUpperCase()}
          </Text>
          <Text style={[updateCardStyles.title, { color: C.label }]} numberOfLines={1}>
            {u.title}
          </Text>
          <Text style={[updateCardStyles.detail, { color: C.secondary }]} numberOfLines={1}>
            {u.detail}
          </Text>
          <Pressable
            style={[updateCardStyles.actionBtn, { backgroundColor: C.surfacePressed }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[updateCardStyles.actionText, { color: C.label }]}>{u.action}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const updateCardStyles = StyleSheet.create({
  card: {
    width: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    padding: 14,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  changeType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  title: { fontSize: 14, fontWeight: '600' },
  detail: { fontSize: 12 },
  actionBtn: {
    marginTop: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  actionText: { fontSize: 12, fontWeight: '600' },
});

// ─── Daily Timeline ───────────────────────────────────────────────────────────

function DailyTimeline({ C }: { C: ComponentColors }) {
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();

  const visibleBlocks = TIMELINE_BLOCKS.filter((b) => b.startMin >= currentMin - 30);

  return (
    <View style={timelineStyles.container}>
      {visibleBlocks.map((block, i) => {
        const isNow = block.status === 'in-progress';
        return (
          <View key={block.id} style={timelineStyles.row}>
            {/* Time column */}
            <View style={timelineStyles.timeCol}>
              <Text style={[timelineStyles.time, { color: isNow ? C.label : C.muted }]}>
                {block.time}
              </Text>
              {i < visibleBlocks.length - 1 && (
                <View style={[timelineStyles.line, { backgroundColor: C.separator }]} />
              )}
            </View>

            {/* Block card */}
            <View
              style={[
                timelineStyles.blockCard,
                {
                  backgroundColor: C.bg,
                  borderColor: C.separator,
                  borderLeftColor: PRIORITY_COLOR[block.priority],
                },
                isNow && { borderLeftColor: '#22C55E' },
              ]}
            >
              <View style={timelineStyles.cardTop}>
                <View style={[timelineStyles.typePill, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[timelineStyles.typePillText, { color: C.secondary }]}>
                    {block.type.toUpperCase()}
                  </Text>
                </View>
                {isNow && (
                  <View style={[timelineStyles.nowPill, { backgroundColor: 'rgba(34,197,94,0.1)' }]}>
                    <Text style={[timelineStyles.nowPillText, { color: '#22C55E' }]}>IN PROGRESS</Text>
                  </View>
                )}
              </View>
              <Text style={[timelineStyles.blockTitle, { color: C.label }]}>{block.title}</Text>
              <View style={timelineStyles.blockMeta}>
                <Text style={[timelineStyles.blockTime, { color: C.secondary }]}>
                  {block.time} – {block.endTime}
                </Text>
                <Text style={[timelineStyles.blockOrg, { color: C.muted }]}>{block.org}</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const timelineStyles = StyleSheet.create({
  container: { paddingHorizontal: 16, gap: 0 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  timeCol: { width: 56, alignItems: 'flex-end', paddingTop: 14 },
  time: { fontSize: 11, fontWeight: '600' },
  line: { width: 1, flex: 1, marginTop: 4, marginBottom: -12, alignSelf: 'center' },
  blockCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    padding: 12,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTop: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  typePillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  nowPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5 },
  nowPillText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  blockTitle: { fontSize: 15, fontWeight: '600' },
  blockMeta: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  blockTime: { fontSize: 12 },
  blockOrg: { fontSize: 11 },
});

// ─── Missed / Overdue Row ─────────────────────────────────────────────────────

function MissedRow({ C }: { C: ComponentColors }) {
  const ACTIONS = [
    { icon: 'arrow.clockwise' as const, label: 'Reschedule' },
    { icon: 'checkmark' as const, label: 'Complete' },
    { icon: 'zzz' as const, label: 'Snooze' },
    { icon: 'person.fill.badge.plus' as const, label: 'Delegate' },
    { icon: 'message.fill' as const, label: 'Message' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {MISSED_ITEMS.map((item) => (
        <View
          key={item.id}
          style={[
            missedCardStyles.card,
            { backgroundColor: C.bg, borderColor: C.separator, borderTopColor: '#EF4444' },
          ]}
        >
          <View style={[missedCardStyles.typePill, { backgroundColor: C.surfacePressed }]}>
            <Text style={[missedCardStyles.typeText, { color: C.secondary }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Text style={[missedCardStyles.title, { color: C.label }]} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={[missedCardStyles.time, { color: '#EF4444' }]}>{item.time}</Text>
          <View style={missedCardStyles.actionsRow}>
            {ACTIONS.map((a) => (
              <Pressable
                key={a.label}
                style={[missedCardStyles.actionBtn, { backgroundColor: C.surfacePressed }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name={a.icon} size={13} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const missedCardStyles = StyleSheet.create({
  card: {
    width: 170,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderTopWidth: 3,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  typePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  title: { fontSize: 14, fontWeight: '600' },
  time: { fontSize: 12, fontWeight: '500' },
  actionsRow: { flexDirection: 'row', gap: 6, marginTop: 4 },
  actionBtn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
});

// ─── Priority Stack Row ───────────────────────────────────────────────────────

function PriorityRow({ C }: { C: ComponentColors }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {PRIORITY_ITEMS.map((item) => (
        <View
          key={item.id}
          style={[priorityCardStyles.card, { backgroundColor: C.bg, borderColor: C.separator }]}
        >
          <View style={priorityCardStyles.topRow}>
            <View style={[priorityCardStyles.dot, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
            <Text style={[priorityCardStyles.priorityLabel, { color: PRIORITY_COLOR[item.priority] }]}>
              {item.priority.toUpperCase()}
            </Text>
          </View>
          <Text style={[priorityCardStyles.title, { color: C.label }]} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[priorityCardStyles.typePill, { backgroundColor: C.surfacePressed }]}>
            <Text style={[priorityCardStyles.typeText, { color: C.secondary }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Pressable
            style={[priorityCardStyles.actionBtn, { backgroundColor: C.surfacePressed }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[priorityCardStyles.actionText, { color: C.label }]}>{item.action}</Text>
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

const priorityCardStyles = StyleSheet.create({
  card: {
    width: 160,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  priorityLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  title: { fontSize: 14, fontWeight: '600' },
  typePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  actionBtn: { marginTop: 2, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' },
  actionText: { fontSize: 12, fontWeight: '600' },
});

// ─── Prep Blocks Row ──────────────────────────────────────────────────────────

function PrepRow({ C }: { C: ComponentColors }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
    >
      {PREP_BLOCKS.map((block) => (
        <View
          key={block.id}
          style={[prepCardStyles.card, { backgroundColor: C.bg, borderColor: C.separator }]}
        >
          <View style={prepCardStyles.iconRow}>
            <View style={[prepCardStyles.iconWrap, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={PREP_ICON[block.prepType]} size={16} color={C.secondary} />
            </View>
            <Text style={[prepCardStyles.prepType, { color: C.secondary }]}>
              {block.prepType.toUpperCase()}
            </Text>
          </View>
          <Text style={[prepCardStyles.linkedTo, { color: C.label }]} numberOfLines={2}>
            {block.linkedTo}
          </Text>
          <View style={prepCardStyles.metaRow}>
            <IconSymbol name="clock" size={11} color={C.muted} />
            <Text style={[prepCardStyles.meta, { color: C.muted }]}>{block.time}</Text>
            <Text style={[prepCardStyles.duration, { color: C.muted }]}>· {block.duration}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const prepCardStyles = StyleSheet.create({
  card: {
    width: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconWrap: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  prepType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.6 },
  linkedTo: { fontSize: 14, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { fontSize: 11 },
  duration: { fontSize: 11 },
});

// ─── Now View ─────────────────────────────────────────────────────────────────

function NowView({ C }: { C: ComponentColors }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, gap: 24 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Now/Next Hero */}
      <NowNextCard C={C} />

      {/* 2. Critical Updates */}
      <View>
        <SectionHeader title="Critical Updates" count={CRITICAL_UPDATES.length} C={C} />
        <CriticalUpdatesRow C={C} />
      </View>

      {/* 3. Daily Timeline */}
      <View>
        <SectionHeader title="Today's Timeline" C={C} />
        <DailyTimeline C={C} />
      </View>

      {/* 4. Missed / Overdue */}
      <View>
        <SectionHeader title="Missed / Overdue" count={MISSED_ITEMS.length} C={C} />
        <MissedRow C={C} />
      </View>

      {/* 5. Priority Stack */}
      <View>
        <SectionHeader title="Priority" count={PRIORITY_ITEMS.length} C={C} />
        <PriorityRow C={C} />
      </View>

      {/* 6. Prep Blocks */}
      <View>
        <SectionHeader title="Prep Blocks" count={PREP_BLOCKS.length} C={C} />
        <PrepRow C={C} />
      </View>
    </ScrollView>
  );
}

// ─── Plan View ────────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { day: 'SAT', date: '14', count: 3, hasConflict: false, hasCritical: true },
  { day: 'SUN', date: '15', count: 3, hasConflict: false, hasCritical: true },
  { day: 'MON', date: '16', count: 4, hasConflict: true,  hasCritical: false },
  { day: 'TUE', date: '17', count: 3, hasConflict: false, hasCritical: true },
  { day: 'WED', date: '18', count: 2, hasConflict: false, hasCritical: false },
  { day: 'THU', date: '19', count: 1, hasConflict: false, hasCritical: false },
  { day: 'FRI', date: '20', count: 1, hasConflict: false, hasCritical: true },
];

const UNSCHEDULED = [
  { id: 'u1', title: 'Update Transfer Portal List', type: 'Task', priority: 'high' as AgendaPriority },
  { id: 'u2', title: 'Review Equipment Budget', type: 'Task', priority: 'normal' as AgendaPriority },
  { id: 'u3', title: 'Call D. Carter Follow-Up', type: 'Call', priority: 'high' as AgendaPriority },
];

const PRIORITY_QUEUE = [
  { id: 'pq1', title: 'Submit Compliance Form', type: 'Deadline', priority: 'critical' as AgendaPriority, due: 'Due Tomorrow' },
  { id: 'pq2', title: 'Finalize Spring Roster', type: 'Deadline', priority: 'critical' as AgendaPriority, due: 'Mar 20' },
  { id: 'pq3', title: 'Film Opponent — Howard', type: 'Prep', priority: 'high' as AgendaPriority, due: 'Before Fri' },
  { id: 'pq4', title: 'Recruiting Report — I. Brooks', type: 'Task', priority: 'high' as AgendaPriority, due: 'This Week' },
];

const TEAM_COMMITMENTS = [
  { id: 'tc1', title: 'Team Lift', time: 'Mon 6:00 AM', org: 'Lincoln U', attending: 24 },
  { id: 'tc2', title: 'Morning Practice', time: 'Mon 9:00 AM', org: 'Lincoln U', attending: 28 },
  { id: 'tc3', title: 'Staff Meeting', time: 'Mon 4:00 PM', org: 'Coaching Staff', attending: 8 },
  { id: 'tc4', title: 'Travel Departure', time: 'Tue 3:00 PM', org: 'Lincoln U', attending: 35 },
  { id: 'tc5', title: 'Home Game vs. Howard', time: 'Fri 3:00 PM', org: 'Lincoln U', attending: 40 },
];

const CONFLICTS = [
  { id: 'cf1', title: 'Recruiting Visit overlaps Film Session', time: 'Mon 1–3 PM', severity: 'high' as AgendaPriority },
  { id: 'cf2', title: 'Staff Debrief back-to-back with Recruiting Call', time: 'Sat 9–10 PM', severity: 'normal' as AgendaPriority },
];

const SUGGESTED_BLOCKS = [
  { id: 'sb1', title: 'Film Review Prep', suggestion: 'Open slot Mon 7–9 AM', reason: 'Before morning practice' },
  { id: 'sb2', title: 'Recruiting Outreach', suggestion: 'Open slot Wed 2–4 PM', reason: 'No meetings blocked' },
  { id: 'sb3', title: 'Rest & Recovery', suggestion: 'Thu afternoon', reason: 'High load week' },
];

const PLAN_TEMPLATES = [
  { id: 'pt1', label: 'Game Day', icon: 'sportscourt.fill' as const },
  { id: 'pt2', label: 'Travel Day', icon: 'airplane' as const },
  { id: 'pt3', label: 'Recruiting Visit', icon: 'person.badge.plus' as const },
  { id: 'pt4', label: 'Staff Meeting', icon: 'person.3.fill' as const },
];

function PlanView({ C }: { C: ComponentColors }) {
  const [selectedDay, setSelectedDay] = useState('14');

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, gap: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Week Calendar */}
      <View>
        <SectionHeader title="Week" C={C} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {WEEK_DAYS.map((d) => {
            const isSelected = d.date === selectedDay;
            return (
              <Pressable
                key={d.date}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDay(d.date);
                }}
                style={[
                  planStyles.dayCell,
                  {
                    backgroundColor: isSelected ? C.label : C.surfacePressed,
                    borderColor: C.separator,
                  },
                ]}
              >
                <Text style={[planStyles.dayCellDay, { color: isSelected ? C.bg : C.muted }]}>{d.day}</Text>
                <Text style={[planStyles.dayCellDate, { color: isSelected ? C.bg : C.label }]}>{d.date}</Text>
                {/* density dots */}
                <View style={planStyles.densityRow}>
                  {Array.from({ length: Math.min(d.count, 4) }).map((_, i) => (
                    <View
                      key={i}
                      style={[
                        planStyles.densityDot,
                        {
                          backgroundColor: isSelected
                            ? 'rgba(255,255,255,0.6)'
                            : d.hasCritical
                            ? '#EF4444'
                            : C.muted,
                        },
                      ]}
                    />
                  ))}
                </View>
                {d.hasConflict && (
                  <View style={[planStyles.conflictDot, { backgroundColor: '#F97316' }]} />
                )}
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Unscheduled Queue */}
      <View>
        <SectionHeader title="Unscheduled" count={UNSCHEDULED.length} C={C} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {UNSCHEDULED.map((item) => (
            <View
              key={item.id}
              style={[planStyles.queueCard, { backgroundColor: C.bg, borderColor: C.separator }]}
            >
              <View style={[planStyles.priorityBar2, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
              <View style={planStyles.queueCardInner}>
                <Text style={[planStyles.queueTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
                <View style={[planStyles.typePill, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[planStyles.typeText, { color: C.secondary }]}>{item.type}</Text>
                </View>
                <Pressable
                  style={[planStyles.scheduleBtn, { backgroundColor: C.surfacePressed }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="plus" size={11} color={C.secondary} />
                  <Text style={[planStyles.scheduleBtnText, { color: C.secondary }]}>Schedule</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 3. Priority Queue */}
      <View>
        <SectionHeader title="Priority Queue" count={PRIORITY_QUEUE.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {PRIORITY_QUEUE.map((item) => (
            <Pressable
              key={item.id}
              style={[planStyles.priorityRow, { backgroundColor: C.bg, borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[planStyles.priorityBar3, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
              <View style={planStyles.priorityInfo}>
                <Text style={[planStyles.priorityTitle, { color: C.label }]}>{item.title}</Text>
                <View style={planStyles.priorityMeta}>
                  <View style={[planStyles.typePill, { backgroundColor: C.surfacePressed }]}>
                    <Text style={[planStyles.typeText, { color: C.secondary }]}>{item.type}</Text>
                  </View>
                  <Text style={[planStyles.dueText, { color: item.priority === 'critical' ? '#EF4444' : C.muted }]}>
                    {item.due}
                  </Text>
                </View>
              </View>
              <IconSymbol name="chevron.right" size={12} color={C.muted} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* 4. Team / Org Commitments */}
      <View>
        <SectionHeader title="Team & Org Commitments" count={TEAM_COMMITMENTS.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {TEAM_COMMITMENTS.map((item) => (
            <View
              key={item.id}
              style={[planStyles.commitRow, { backgroundColor: C.bg, borderColor: C.separator }]}
            >
              <View style={planStyles.commitLeft}>
                <Text style={[planStyles.commitTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[planStyles.commitTime, { color: C.muted }]}>{item.time}</Text>
              </View>
              <View style={planStyles.commitRight}>
                <View style={[planStyles.orgPill, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[planStyles.orgText, { color: C.secondary }]}>{item.org}</Text>
                </View>
                <View style={planStyles.attendeeRow}>
                  <IconSymbol name="person.fill" size={11} color={C.muted} />
                  <Text style={[planStyles.attendeeCount, { color: C.muted }]}>{item.attending}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Conflict Detection */}
      <View>
        <SectionHeader title="Conflicts" count={CONFLICTS.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {CONFLICTS.map((item) => (
            <View
              key={item.id}
              style={[
                planStyles.conflictCard,
                {
                  backgroundColor: 'rgba(249,115,22,0.06)',
                  borderColor: '#F97316',
                },
              ]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#F97316" />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[planStyles.conflictTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[planStyles.conflictTime, { color: C.muted }]}>{item.time}</Text>
              </View>
              <Pressable
                style={[planStyles.resolveBtn, { backgroundColor: C.surfacePressed }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={[planStyles.resolveBtnText, { color: C.secondary }]}>Resolve</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* 6. Suggested Blocks */}
      <View>
        <SectionHeader title="Suggested Blocks" C={C} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {SUGGESTED_BLOCKS.map((item) => (
            <View
              key={item.id}
              style={[planStyles.suggestCard, { backgroundColor: C.bg, borderColor: C.separator }]}
            >
              <View style={[planStyles.suggestIcon, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name="sparkles" size={14} color={C.secondary} />
              </View>
              <Text style={[planStyles.suggestTitle, { color: C.label }]}>{item.title}</Text>
              <Text style={[planStyles.suggestSlot, { color: '#6B7280' }]}>{item.suggestion}</Text>
              <Text style={[planStyles.suggestReason, { color: C.muted }]}>{item.reason}</Text>
              <Pressable
                style={[planStyles.addBtn, { backgroundColor: C.label }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={[planStyles.addBtnText, { color: C.bg }]}>Add</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* 7. Templates */}
      <View>
        <SectionHeader title="Templates" C={C} />
        <View style={planStyles.templateGrid}>
          {PLAN_TEMPLATES.map((t) => (
            <Pressable
              key={t.id}
              style={[planStyles.templateBtn, { backgroundColor: C.bg, borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name={t.icon} size={18} color={C.secondary} />
              <Text style={[planStyles.templateLabel, { color: C.label }]}>{t.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const planStyles = StyleSheet.create({
  // Week calendar
  dayCell: {
    width: 56,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: 4,
    position: 'relative',
  },
  dayCellDay: { fontSize: 10, fontWeight: '700', letterSpacing: 0.6 },
  dayCellDate: { fontSize: 18, fontWeight: '700' },
  densityRow: { flexDirection: 'row', gap: 2 },
  densityDot: { width: 5, height: 5, borderRadius: 2.5 },
  conflictDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  // Unscheduled Queue cards
  queueCard: {
    width: 160,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  priorityBar2: { width: 3 },
  queueCardInner: { flex: 1, padding: 12, gap: 8 },
  queueTitle: { fontSize: 13, fontWeight: '600' },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  scheduleBtnText: { fontSize: 11, fontWeight: '600' },

  // Priority Queue rows
  priorityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  priorityBar3: { width: 3, alignSelf: 'stretch' },
  priorityInfo: { flex: 1, paddingVertical: 12, gap: 4 },
  priorityTitle: { fontSize: 14, fontWeight: '600' },
  priorityMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  dueText: { fontSize: 11, fontWeight: '500' },

  // Team commitments
  commitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  commitLeft: { flex: 1, gap: 3 },
  commitTitle: { fontSize: 14, fontWeight: '600' },
  commitTime: { fontSize: 12 },
  commitRight: { alignItems: 'flex-end', gap: 4 },
  orgPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  orgText: { fontSize: 10, fontWeight: '600' },
  attendeeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  attendeeCount: { fontSize: 11 },

  // Conflicts
  conflictCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  conflictTitle: { fontSize: 13, fontWeight: '600' },
  conflictTime: { fontSize: 11 },
  resolveBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  resolveBtnText: { fontSize: 12, fontWeight: '600' },

  // Suggested Blocks
  suggestCard: {
    width: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  suggestTitle: { fontSize: 14, fontWeight: '600' },
  suggestSlot: { fontSize: 12, fontWeight: '500' },
  suggestReason: { fontSize: 11 },
  addBtn: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addBtnText: { fontSize: 12, fontWeight: '700' },

  // Templates
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
  },
  templateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  templateLabel: { fontSize: 13, fontWeight: '600' },

  // Shared
  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  priorityBar: { width: 3, height: 36, borderRadius: 2 },
});

// ─── Feed View ────────────────────────────────────────────────────────────────

const WHAT_CHANGED = [
  { id: 'wc1', event: 'Bus Booking — Away Game', change: 'cancelled', detail: 'Vendor cancelled. Needs rebooking.', time: '2h ago' },
  { id: 'wc2', event: 'Staff Meeting', change: 'moved', detail: 'Moved Mon → Tue 4 PM', time: '3h ago' },
  { id: 'wc3', event: 'Compliance Form Deadline', change: 'urgent', detail: 'Due date confirmed for Mar 15', time: '5h ago' },
];

const COMPLETED_ITEMS = [
  { id: 'ci1', title: 'Morning Practice', time: 'Today 9:00 AM', type: 'Practice' },
  { id: 'ci2', title: 'Recruiting Call — T. Williams', time: 'Today 11:00 AM', type: 'Call' },
  { id: 'ci3', title: 'Equipment Order Submitted', time: 'Today 2:00 PM', type: 'Task' },
  { id: 'ci4', title: 'Film Review — East Regional', time: 'Yesterday', type: 'Prep' },
];

const SLIPPED_ITEMS = [
  { id: 'sl1', title: 'Update Transfer Portal List', originalDue: 'Yesterday', newStatus: 'Unscheduled', priority: 'high' as AgendaPriority },
  { id: 'sl2', title: 'Booster Club Report', originalDue: 'Last Wed', newStatus: 'Deferred to next week', priority: 'normal' as AgendaPriority },
  { id: 'sl3', title: 'Video Content — Highlights Reel', originalDue: 'Mar 10', newStatus: 'No time slot', priority: 'normal' as AgendaPriority },
];

const ORG_ACTIVITY = [
  { id: 'oa1', person: 'A. Thompson', action: 'added Practice to Tue 10 AM', time: '1h ago' },
  { id: 'oa2', person: 'M. Davis', action: 'rescheduled Film Session to Wed', time: '2h ago' },
  { id: 'oa3', person: 'Admin', action: 'posted Compliance reminder', time: '4h ago' },
  { id: 'oa4', person: 'R. Johnson', action: 'marked Scouting Report complete', time: '6h ago' },
];

const APPROVALS_NEEDED = [
  { id: 'an1', title: 'Bus Booking — Away Game', requestedBy: 'Travel Dept', due: 'Today', action: 'Approve' },
  { id: 'an2', title: 'Roster Change — #22 Redshirt', requestedBy: 'A. Thompson', due: 'Tomorrow', action: 'Review' },
  { id: 'an3', title: 'Equipment Purchase — $3,200', requestedBy: 'Equipment Mgr', due: 'Mar 18', action: 'Approve' },
];

const FOLLOW_UPS = [
  { id: 'fu1', title: 'D. Carter — Scholarship Discussion', type: 'Call', flagged: '2d ago', urgent: true },
  { id: 'fu2', title: 'I. Brooks — Campus Visit Feedback', type: 'Message', flagged: 'Yesterday', urgent: false },
  { id: 'fu3', title: 'Booster Club — Spring Donation Ask', type: 'Email', flagged: '3d ago', urgent: false },
];

type FeedChangeType = 'cancelled' | 'moved' | 'urgent';
const FEED_CHANGE_COLOR: Record<FeedChangeType, string> = {
  cancelled: '#EF4444',
  moved:     '#F97316',
  urgent:    '#EAB308',
};

function FeedView({ C }: { C: ComponentColors }) {
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingTop: 16, paddingBottom: 120, gap: 28 }}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. What Changed */}
      <View>
        <SectionHeader title="What Changed" count={WHAT_CHANGED.length} C={C} />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}
        >
          {WHAT_CHANGED.map((item) => {
            const color = FEED_CHANGE_COLOR[item.change as FeedChangeType] ?? '#6B7280';
            return (
              <View
                key={item.id}
                style={[feedStyles.changeCard, { backgroundColor: C.bg, borderColor: C.separator, borderLeftColor: color }]}
              >
                <Text style={[feedStyles.changeType, { color }]}>{item.change.toUpperCase()}</Text>
                <Text style={[feedStyles.changeEvent, { color: C.label }]} numberOfLines={1}>{item.event}</Text>
                <Text style={[feedStyles.changeDetail, { color: C.secondary }]} numberOfLines={2}>{item.detail}</Text>
                <Text style={[feedStyles.changeTime, { color: C.muted }]}>{item.time}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* 2. Completed Items */}
      <View>
        <SectionHeader title="Completed Today" count={COMPLETED_ITEMS.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 0 }}>
          {COMPLETED_ITEMS.map((item, i) => (
            <View
              key={item.id}
              style={[
                feedStyles.completedRow,
                { borderBottomColor: C.separator },
                i === COMPLETED_ITEMS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[feedStyles.checkCircle, { borderColor: '#22C55E', backgroundColor: 'rgba(34,197,94,0.08)' }]}>
                <IconSymbol name="checkmark" size={11} color="#22C55E" />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[feedStyles.completedTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[feedStyles.completedMeta, { color: C.muted }]}>{item.time}</Text>
              </View>
              <View style={[feedStyles.typePill, { backgroundColor: C.surfacePressed }]}>
                <Text style={[feedStyles.typeText, { color: C.secondary }]}>{item.type}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Slipped / Deferred */}
      <View>
        <SectionHeader title="Slipped / Deferred" count={SLIPPED_ITEMS.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {SLIPPED_ITEMS.map((item) => (
            <View
              key={item.id}
              style={[feedStyles.slippedCard, { backgroundColor: C.bg, borderColor: C.separator }]}
            >
              <View style={[feedStyles.slippedBar, { backgroundColor: PRIORITY_COLOR[item.priority] }]} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[feedStyles.slippedTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[feedStyles.slippedDue, { color: C.muted }]}>Was due: {item.originalDue}</Text>
                <Text style={[feedStyles.slippedStatus, { color: '#F97316' }]}>{item.newStatus}</Text>
              </View>
              <Pressable
                style={[feedStyles.rescheduleBtn, { backgroundColor: C.surfacePressed }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <Text style={[feedStyles.rescheduleBtnText, { color: C.secondary }]}>Reschedule</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* 4. Organization Activity */}
      <View>
        <SectionHeader title="Organization Activity" C={C} />
        <View style={{ paddingHorizontal: 16, gap: 0 }}>
          {ORG_ACTIVITY.map((item, i) => (
            <View
              key={item.id}
              style={[
                feedStyles.orgRow,
                { borderBottomColor: C.separator },
                i === ORG_ACTIVITY.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              <View style={[feedStyles.avatarCircle, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name="person.fill" size={13} color={C.muted} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[feedStyles.orgAction, { color: C.label }]}>
                  <Text style={{ fontWeight: '700' }}>{item.person}</Text>
                  {' '}{item.action}
                </Text>
                <Text style={[feedStyles.orgTime, { color: C.muted }]}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Approvals Needed */}
      <View>
        <SectionHeader title="Approvals Needed" count={APPROVALS_NEEDED.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          {APPROVALS_NEEDED.map((item) => (
            <View
              key={item.id}
              style={[feedStyles.approvalCard, { backgroundColor: C.bg, borderColor: C.separator }]}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[feedStyles.approvalTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[feedStyles.approvalFrom, { color: C.muted }]}>
                  From {item.requestedBy} · Due {item.due}
                </Text>
              </View>
              <Pressable
                style={[feedStyles.approveBtn, { backgroundColor: C.label }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
              >
                <Text style={[feedStyles.approveBtnText, { color: C.bg }]}>{item.action}</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* 6. Follow-Up Required */}
      <View>
        <SectionHeader title="Follow-Up Required" count={FOLLOW_UPS.length} C={C} />
        <View style={{ paddingHorizontal: 16, gap: 0 }}>
          {FOLLOW_UPS.map((item, i) => (
            <View
              key={item.id}
              style={[
                feedStyles.followRow,
                { borderBottomColor: C.separator },
                i === FOLLOW_UPS.length - 1 && { borderBottomWidth: 0 },
              ]}
            >
              {item.urgent && (
                <View style={[feedStyles.urgentDot, { backgroundColor: '#EF4444' }]} />
              )}
              <View style={[feedStyles.followIcon, { backgroundColor: C.surfacePressed }]}>
                <IconSymbol name="arrow.turn.up.right" size={13} color={C.secondary} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[feedStyles.followTitle, { color: C.label }]}>{item.title}</Text>
                <Text style={[feedStyles.followMeta, { color: C.muted }]}>
                  {item.type} · Flagged {item.flagged}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 7. Review Summary (Nexus card) */}
      <View style={{ paddingHorizontal: 16 }}>
        <SectionHeader title="Week Review" C={C} />
        <View
          style={[
            feedStyles.nexusCard,
            { backgroundColor: C.bg, borderColor: C.separator },
          ]}
        >
          <View style={feedStyles.nexusHeader}>
            <View style={[feedStyles.nexusIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name="sparkles" size={16} color={C.secondary} />
            </View>
            <Text style={[feedStyles.nexusTitle, { color: C.label }]}>Nexus Weekly Summary</Text>
          </View>
          <Text style={[feedStyles.nexusBody, { color: C.secondary }]}>
            This week you have{' '}
            <Text style={{ fontWeight: '700', color: C.label }}>17 commitments</Text> across 4 orgs.
            {' '}3 items need attention: Compliance Form (due tomorrow), Roster Change pending approval,
            and 2 scheduling conflicts on Monday.{' '}
            <Text style={{ fontWeight: '700', color: '#22C55E' }}>4 tasks completed</Text> today.
          </Text>
          <View style={feedStyles.nexusStats}>
            {[
              { label: 'Completed', value: '4', color: '#22C55E' },
              { label: 'Pending', value: '3', color: '#F97316' },
              { label: 'Slipped', value: '3', color: '#EF4444' },
            ].map((s) => (
              <View key={s.label} style={[feedStyles.nexusStat, { backgroundColor: C.surfacePressed }]}>
                <Text style={[feedStyles.nexusStatValue, { color: s.color }]}>{s.value}</Text>
                <Text style={[feedStyles.nexusStatLabel, { color: C.muted }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const feedStyles = StyleSheet.create({
  // What Changed cards
  changeCard: {
    width: 180,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    padding: 14,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  changeType: { fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  changeEvent: { fontSize: 14, fontWeight: '600' },
  changeDetail: { fontSize: 12 },
  changeTime: { fontSize: 11 },

  // Completed rows
  completedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  completedTitle: { fontSize: 14, fontWeight: '500' },
  completedMeta: { fontSize: 11 },

  // Slipped cards
  slippedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  slippedBar: { width: 3, alignSelf: 'stretch' },
  slippedTitle: { fontSize: 14, fontWeight: '600' },
  slippedDue: { fontSize: 11 },
  slippedStatus: { fontSize: 11, fontWeight: '600' },
  rescheduleBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 12 },
  rescheduleBtnText: { fontSize: 11, fontWeight: '600' },

  // Org activity rows
  orgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatarCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  orgAction: { fontSize: 13, lineHeight: 18 },
  orgTime: { fontSize: 11 },

  // Approval cards
  approvalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  approvalTitle: { fontSize: 14, fontWeight: '600' },
  approvalFrom: { fontSize: 11 },
  approveBtn: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  approveBtnText: { fontSize: 12, fontWeight: '700' },

  // Follow-up rows
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  urgentDot: {
    position: 'absolute',
    left: -8,
    top: '50%',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  followIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  followTitle: { fontSize: 14, fontWeight: '500' },
  followMeta: { fontSize: 11 },

  // Nexus card
  nexusCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  nexusHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nexusIcon: { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  nexusTitle: { fontSize: 15, fontWeight: '700' },
  nexusBody: { fontSize: 14, lineHeight: 21 },
  nexusStats: { flexDirection: 'row', gap: 8 },
  nexusStat: { flex: 1, borderRadius: 10, paddingVertical: 8, alignItems: 'center', gap: 2 },
  nexusStatValue: { fontSize: 20, fontWeight: '800' },
  nexusStatLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.4 },

  // Shared
  typePill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, alignSelf: 'flex-start' },
  typeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeView, setActiveView] = useState<AgendaView>('Now');
  const panelWidth = screenWidth * 0.78;
  const panelTranslateX = useRef(new Animated.Value(0)).current;
  const [panelOpen, setPanelOpen] = useState(false);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    Animated.spring(panelTranslateX, {
      toValue: panelWidth,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [panelTranslateX, panelWidth]);

  const closePanel = useCallback(() => {
    Animated.timing(panelTranslateX, {
      toValue: 0,
      duration: 220,
      useNativeDriver: true,
    }).start(() => setPanelOpen(false));
  }, [panelTranslateX]);

  // Swipe right → open panel
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, gs) =>
          !panelOpen && gs.dx > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderRelease: (_e, gs) => {
          if (gs.dx > 60) openPanel();
        },
      }),
    [panelOpen, openPanel],
  );

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Main content — shifts right when panel opens */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX: panelTranslateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* View switcher */}
        <View style={[styles.switcherWrap, { paddingTop: insets.top + 12 }]}>
          <ViewSwitcher active={activeView} onChange={setActiveView} C={C} />
        </View>

        {/* Content */}
        {activeView === 'Now' && <NowView C={C} />}
        {activeView === 'Plan' && <PlanView C={C} />}
        {activeView === 'Feed' && <FeedView C={C} />}
      </Animated.View>

      {/* Tap-to-dismiss backdrop */}
      {panelOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />
      )}

      {/* Side panel */}
      <AgendaSidePanel
        translateX={panelTranslateX}
        onOpen={openPanel}
        onClose={closePanel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  switcherWrap: { paddingBottom: 12 },
});
