/**
 * Agenda — Now · Plan · Feed
 * Matches KaNeXT_Agenda_Spec_Final + kanext-agenda-v2.html prototype.
 *
 * Layout:
 *   Segmented control (Now / Plan / Feed)
 *   Filter bar (collapsed by default)
 *   Date indicator bar (shown when non-today date selected)
 *   Canvas (scrollable, view-dependent)
 *
 * Side panel: Context Scope → Date Navigation → Quick Add
 * Swipe right → open panel. No swipe between views.
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
  type AgendaPriority,
  type CriticalChangeType,
  type PrepType,
} from '@/data/mock-agenda-now';

// ─── Color palette (matches HTML prototype) ───────────────────────────────────

const RED    = '#D93636';
const GREEN  = '#2D9E42';
const ORANGE = '#C97B08';
const PURPLE = '#7C5CFC';

const PRIORITY_COLOR: Record<AgendaPriority, string> = {
  critical: RED,
  high:     ORANGE,
  normal:   'rgba(0,0,0,0.18)',
  low:      'rgba(0,0,0,0.10)',
};

const CHANGE_COLOR: Record<CriticalChangeType, string> = {
  cancelled: RED,
  moved:     ORANGE,
  urgent:    RED,
  blocked:   ORANGE,
};

const PREP_ICON: Record<PrepType, any> = {
  film:    'film.fill',
  sermon:  'book.fill',
  meeting: 'person.3.fill',
  class:   'graduationcap.fill',
  content: 'pencil.and.list.clipboard',
};

// ─── Filter bar ───────────────────────────────────────────────────────────────

type FilterKey = 'all' | 'events' | 'tasks' | 'meetings' | 'prep' | 'follow-ups' | 'deadlines' | 'my-items' | 'team';
const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all',        label: 'All'        },
  { key: 'events',     label: 'Events'     },
  { key: 'tasks',      label: 'Tasks'      },
  { key: 'meetings',   label: 'Meetings'   },
  { key: 'prep',       label: 'Prep'       },
  { key: 'follow-ups', label: 'Follow-ups' },
  { key: 'deadlines',  label: 'Deadlines'  },
  { key: 'my-items',   label: 'My Items'   },
  { key: 'team',       label: 'Team'       },
];

function FilterBar({ C }: { C: ComponentColors }) {
  const [open, setOpen]         = useState(false);
  const [active, setActive]     = useState<FilterKey[]>(['all']);

  const nonAllCount = active.filter(k => k !== 'all').length;

  const toggleChip = (key: FilterKey) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (key === 'all') {
      setActive(['all']);
      return;
    }
    setActive(prev => {
      const without = prev.filter(k => k !== 'all');
      if (without.includes(key)) {
        const next = without.filter(k => k !== key);
        return next.length === 0 ? ['all'] : next;
      }
      return [...without, key];
    });
  };

  return (
    <View>
      <View style={filterStyles.row}>
        <Pressable
          style={[filterStyles.toggle, open && { borderColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setOpen(o => !o);
          }}
        >
          <IconSymbol name="line.3.horizontal.decrease" size={14} color={C.secondary} />
          <Text style={[filterStyles.toggleText, { color: C.secondary }]}>Filter</Text>
        </Pressable>
        {nonAllCount > 0 && (
          <View style={[filterStyles.countBadge, { backgroundColor: C.label }]}>
            <Text style={[filterStyles.countText, { color: C.bg }]}>{nonAllCount}</Text>
          </View>
        )}
        {open && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 5, paddingRight: 4 }}
            style={{ flex: 1 }}
          >
            {FILTER_CHIPS.map(f => {
              const isActive = active.includes(f.key);
              return (
                <Pressable
                  key={f.key}
                  style={[filterStyles.chip, isActive && { borderColor: C.label }]}
                  onPress={() => toggleChip(f.key)}
                >
                  <Text style={[filterStyles.chipText, { color: isActive ? C.label : C.secondary }]}>
                    {f.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const filterStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, gap: 6 },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    flexShrink: 0,
  },
  toggleText: { fontSize: 12, fontWeight: '500' },
  countBadge: {
    width: 16, height: 16, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  countText: { fontSize: 10, fontWeight: '700' },
  chip: {
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 18,
    borderColor: 'rgba(0,0,0,0.12)',
  },
  chipText: { fontSize: 11, fontWeight: '500' },
});

// ─── View Switcher ────────────────────────────────────────────────────────────

const VIEWS = ['Now', 'Plan', 'Feed'] as const;
type AgendaView = (typeof VIEWS)[number];

function ViewSwitcher({ active, onChange, C }: { active: AgendaView; onChange: (v: AgendaView) => void; C: ComponentColors }) {
  return (
    <View style={[switcherStyles.track, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
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
            <Text style={[switcherStyles.label, { color: isActive ? C.label : C.secondary }, isActive && switcherStyles.labelActive]}>
              {v}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const switcherStyles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 12, padding: 3, marginHorizontal: 20 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segmentActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  label: { fontSize: 13.5, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});

// ─── Section Label ────────────────────────────────────────────────────────────

function SLabel({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={[slabelStyles.text, { color: C.muted }]}>{title.toUpperCase()}</Text>
  );
}
const slabelStyles = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10, marginTop: 22 },
});

// ─── Now/Next Hero Card ───────────────────────────────────────────────────────

function HeroCard({ C }: { C: ComponentColors }) {
  const now  = NOW_ITEM;
  const next = NEXT_ITEM;
  return (
    <View style={[heroS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
      {/* NOW */}
      <View style={heroS.top}>
        <View style={{ flex: 1 }}>
          <Text style={[heroS.lbl, { color: C.muted }]}>Now</Text>
          <Text style={[heroS.title, { color: C.label }]}>{now.title}</Text>
          <View style={heroS.metaRow}>
            <Text style={[heroS.metaTime, { color: C.secondary }]}>{now.time} – {now.endTime}</Text>
            <View style={[heroS.badge, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
              <Text style={[heroS.badgeText, { color: C.secondary }]}>{now.org}</Text>
            </View>
            <View style={[heroS.badge, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
              <Text style={[heroS.badgeText, { color: C.secondary }]}>{now.type}</Text>
            </View>
          </View>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={[heroS.countdown, { color: C.label }]}>{now.countdownMin ?? 12}</Text>
          <Text style={[heroS.cdLbl, { color: C.muted }]}>min left</Text>
        </View>
      </View>

      <View style={[heroS.div, { backgroundColor: C.separator }]} />

      {/* NEXT */}
      <View style={heroS.nextRow}>
        <View style={{ flex: 1 }}>
          <Text style={[heroS.nextLbl, { color: C.muted }]}>Next</Text>
          <Text style={[heroS.nextTitle, { color: C.secondary }]}>{next.title}</Text>
        </View>
        <Text style={[heroS.nextTime, { color: C.muted }]}>{next.time}</Text>
      </View>

      {now.hasConflict && now.conflictNote && (
        <View style={[heroS.conflict, { backgroundColor: 'rgba(217,54,54,0.06)' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={13} color={RED} />
          <Text style={[heroS.conflictText, { color: RED }]}>{now.conflictNote}</Text>
        </View>
      )}
    </View>
  );
}
const heroS = StyleSheet.create({
  card: {
    borderRadius: 16, borderWidth: StyleSheet.hairlineWidth,
    padding: 18, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  top: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  lbl: { fontSize: 10, fontWeight: '600', letterSpacing: 0.7, textTransform: 'uppercase', marginBottom: 5 },
  title: { fontSize: 17, fontWeight: '600', lineHeight: 22, marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  metaTime: { fontSize: 12.5 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontWeight: '500' },
  countdown: { fontSize: 30, fontWeight: '300', letterSpacing: -0.5, lineHeight: 34 },
  cdLbl: { fontSize: 10, marginTop: 2 },
  div: { height: 1, marginVertical: 14 },
  nextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nextLbl: { fontSize: 10, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase', marginBottom: 3 },
  nextTitle: { fontSize: 14, fontWeight: '500' },
  nextTime: { fontSize: 12 },
  conflict: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, padding: 8, borderRadius: 8 },
  conflictText: { fontSize: 11.5, fontWeight: '500', flex: 1 },
});

// ─── H-Scroll Card ────────────────────────────────────────────────────────────

function HCard({
  typeLabel, typeColor, title, meta, action, C,
}: {
  typeLabel: string; typeColor: string; title: string; meta: string; action: string; C: ComponentColors;
}) {
  return (
    <View style={[hcardS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
      <Text style={[hcardS.type, { color: typeColor }]}>{typeLabel.toUpperCase()}</Text>
      <Text style={[hcardS.title, { color: C.label }]} numberOfLines={2}>{title}</Text>
      <Text style={[hcardS.meta, { color: C.secondary }]} numberOfLines={1}>{meta}</Text>
      <Pressable
        style={[hcardS.btn, { borderColor: C.separator }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        <Text style={[hcardS.btnText, { color: C.label }]}>{action}</Text>
      </Pressable>
    </View>
  );
}
const hcardS = StyleSheet.create({
  card: {
    minWidth: 185, maxWidth: 210, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    padding: 13, gap: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1,
  },
  type: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },
  title: { fontSize: 13.5, fontWeight: '500', lineHeight: 18 },
  meta: { fontSize: 11.5, marginBottom: 6 },
  btn: { alignSelf: 'flex-start', paddingHorizontal: 11, paddingVertical: 5, borderWidth: 1, borderRadius: 8 },
  btnText: { fontSize: 11, fontWeight: '600' },
});

// ─── Timeline Block ───────────────────────────────────────────────────────────

const TL_BORDER: Record<string, string> = {
  event:   '#333',
  meeting: GREEN,
  task:    ORANGE,
  prep:    'rgba(0,0,0,0.22)',
};

function TimelineRow({ block, showLine, C }: { block: typeof TIMELINE_BLOCKS[0]; showLine: boolean; C: ComponentColors }) {
  const isNow = block.status === 'in-progress';
  const borderColor = isNow ? GREEN : (TL_BORDER[block.type] ?? 'rgba(0,0,0,0.12)');
  return (
    <View style={tlS.row}>
      <View style={tlS.timeCol}>
        <Text style={[tlS.time, { color: isNow ? C.label : C.muted }]}>{block.time}</Text>
        {showLine && <View style={[tlS.line, { backgroundColor: 'rgba(0,0,0,0.06)' }]} />}
      </View>
      <View style={[tlS.block, { backgroundColor: C.surfacePressed, borderColor: C.separator, borderLeftColor: borderColor }]}>
        <Text style={[tlS.blockTitle, { color: C.label }]}>{block.title}</Text>
        <View style={tlS.blockMeta}>
          <Text style={[tlS.blockTime, { color: C.secondary }]}>{block.time} – {block.endTime}</Text>
          <View style={[tlS.badge, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
            <Text style={[tlS.badgeText, { color: C.secondary }]}>{block.org}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
const tlS = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12, minHeight: 68, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.04)' },
  timeCol: { width: 50, alignItems: 'flex-end', paddingTop: 7 },
  time: { fontSize: 11.5, fontWeight: '500' },
  line: { width: 1, flex: 1, marginTop: 4, alignSelf: 'center' },
  block: {
    flex: 1, borderRadius: 11, borderWidth: StyleSheet.hairlineWidth, borderLeftWidth: 3,
    padding: 10, gap: 4, marginVertical: 5,
  },
  blockTitle: { fontSize: 13.5, fontWeight: '500' },
  blockMeta: { flexDirection: 'row', gap: 7, alignItems: 'center' },
  blockTime: { fontSize: 11.5 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontSize: 10, fontWeight: '500' },
});

// ─── Now View ─────────────────────────────────────────────────────────────────

function NowView({ C }: { C: ComponentColors }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {/* 1. Now/Next Hero */}
      <HeroCard C={C} />

      {/* 2. Critical Updates */}
      <SLabel title="Critical Updates" C={C} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {CRITICAL_UPDATES.map(u => (
          <HCard key={u.id} typeLabel={u.changeType} typeColor={CHANGE_COLOR[u.changeType]} title={u.title} meta={u.detail} action={u.action} C={C} />
        ))}
      </ScrollView>

      {/* 3. Today Timeline */}
      <SLabel title="Today" C={C} />
      <View style={[nowS.nowLine, { backgroundColor: RED }]} />
      {TIMELINE_BLOCKS.map((block, i) => (
        <TimelineRow key={block.id} block={block} showLine={i < TIMELINE_BLOCKS.length - 1} C={C} />
      ))}

      {/* 4. Missed / Overdue */}
      <SLabel title="Missed / Overdue" C={C} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {MISSED_ITEMS.map(item => (
          <HCard key={item.id} typeLabel={item.status === 'overdue' ? 'Overdue' : 'Missed'} typeColor={RED} title={item.title} meta={item.time} action="Reschedule" C={C} />
        ))}
      </ScrollView>

      {/* 5. Priority Stack */}
      <SLabel title="Priority Stack" C={C} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {PRIORITY_ITEMS.map(item => (
          <HCard key={item.id} typeLabel={item.priority} typeColor={PRIORITY_COLOR[item.priority]} title={item.title} meta={item.type} action={item.action} C={C} />
        ))}
      </ScrollView>

      {/* 6. Prep Blocks */}
      <SLabel title="Prep Blocks" C={C} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 4 }}>
        {PREP_BLOCKS.map(block => (
          <HCard key={block.id} typeLabel={block.prepType + ' Prep'} typeColor={C.secondary} title={block.linkedTo} meta={'Before ' + block.time} action="Review" C={C} />
        ))}
      </ScrollView>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}
const nowS = StyleSheet.create({
  nowLine: { height: 2, marginVertical: 4, marginLeft: 62, borderRadius: 1 },
});

// ─── Plan View ────────────────────────────────────────────────────────────────

const WEEK_CELLS = [
  { day: 'S', date: 9,  events: [] },
  { day: 'M', date: 10, events: ['Staff mtg', 'Recruit'] },
  { day: 'T', date: 11, events: ['Practice'] },
  { day: 'W', date: 12, events: ['Film', 'AD call'] },
  { day: 'T', date: 13, events: ['Game day'] },
  { day: 'F', date: 14, events: ['Travel'] },
  { day: 'S', date: 15, events: ['Recovery'], isToday: true },
];

const PLAN_SECTIONS: { title: string; dotColor?: string; items: { pri: 'crit' | 'high' | 'norm' | 'suggest'; text: string; sub: string }[] }[] = [
  {
    title: 'Unscheduled',
    items: [
      { pri: 'crit',    text: 'Compliance docs',         sub: 'Due today' },
      { pri: 'high',    text: 'Update depth chart',      sub: 'Due today' },
      { pri: 'norm',    text: 'Travel itinerary review', sub: 'Due tomorrow' },
    ],
  },
  {
    title: 'Conflicts',
    items: [
      { pri: 'crit', text: 'Film Review overlaps Recruit Call', sub: 'Thu 10:00 – 10:45 vs 10:15' },
    ],
  },
  {
    title: 'Nexus Suggestions',
    items: [
      { pri: 'suggest', text: 'Add focus block Wed 2–4 PM',    sub: 'No meetings, deep work window' },
      { pri: 'suggest', text: 'Move recruit call to 11 AM',    sub: 'Resolves overlap with film review' },
    ],
  },
  {
    title: 'Templates',
    items: [
      { pri: 'norm', text: 'Game Day Template',         sub: '' },
      { pri: 'norm', text: 'Recruiting Day Template',   sub: '' },
      { pri: 'norm', text: 'Weekly Reset Template',     sub: '' },
    ],
  },
];

function PlanView({ C }: { C: ComponentColors }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      <Text style={[slabelStyles.text, { color: C.muted, marginTop: 0 }]}>WEEK OF MARCH 9 – 15</Text>

      {/* Week grid */}
      <View style={planS.weekGrid}>
        {/* Headers */}
        {WEEK_CELLS.map((c, i) => (
          <View key={`h${i}`} style={planS.wkHdr}>
            <Text style={[planS.wkHdrText, { color: c.isToday ? C.label : C.muted }]}>{c.day}</Text>
          </View>
        ))}
        {/* Cells */}
        {WEEK_CELLS.map((c, i) => (
          <View key={`c${i}`} style={[planS.wkCell, { backgroundColor: C.surfacePressed }, c.isToday && { borderWidth: 1.5, borderColor: C.label }]}>
            <Text style={[planS.wkNum, { color: c.isToday ? C.label : C.secondary }]}>{c.date}</Text>
            {c.events.map((ev, j) => (
              <View key={j} style={[planS.wkEv, { backgroundColor: 'rgba(0,0,0,0.06)' }]}>
                <Text style={[planS.wkEvText, { color: C.secondary }]} numberOfLines={1}>{ev}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Plan sections */}
      {PLAN_SECTIONS.map((section) => (
        <View key={section.title} style={[planS.sec, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
          <Text style={[planS.secTitle, { color: C.label }]}>{section.title}</Text>
          {section.items.map((item, i) => (
            <View key={i} style={[planS.item, { borderBottomColor: C.separator }, i === section.items.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={[planS.dot, {
                backgroundColor:
                  item.pri === 'crit'    ? RED    :
                  item.pri === 'high'    ? ORANGE :
                  item.pri === 'suggest' ? PURPLE :
                  'rgba(0,0,0,0.18)',
              }]} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={[planS.itemText, { color: item.pri === 'crit' ? RED : C.label }]}>{item.text}</Text>
                {!!item.sub && <Text style={[planS.itemSub, { color: C.secondary }]}>{item.sub}</Text>}
              </View>
            </View>
          ))}
        </View>
      ))}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const planS = StyleSheet.create({
  weekGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, marginBottom: 16 },
  wkHdr: { width: '14.28%', alignItems: 'center', paddingVertical: 6 },
  wkHdrText: { fontSize: 10, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
  wkCell: { width: '14.28%', minHeight: 74, borderRadius: 7, padding: 3 },
  wkNum: { fontSize: 11, fontWeight: '600', textAlign: 'center', paddingBottom: 3 },
  wkEv: { width: '100%', marginBottom: 2, paddingHorizontal: 3, paddingVertical: 2, borderRadius: 3 },
  wkEvText: { fontSize: 8.5, fontWeight: '500' },
  sec: {
    borderRadius: 14, borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10,
  },
  secTitle: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginTop: 5, flexShrink: 0 },
  itemText: { fontSize: 13 },
  itemSub: { fontSize: 11, marginTop: 1 },
});

// ─── Feed View ────────────────────────────────────────────────────────────────

type FeedDotType = 'change' | 'done' | 'slip' | 'info' | 'approve';
const DOT_COLOR: Record<FeedDotType, string> = {
  change:  ORANGE,
  done:    GREEN,
  slip:    RED,
  info:    'rgba(0,0,0,0.18)',
  approve: PURPLE,
};

const FEED_DATA: { section: string; items: { dot: FeedDotType; title: string; meta: string; time: string }[] }[] = [
  {
    section: 'What Changed',
    items: [
      { dot: 'change', title: 'Booster Luncheon cancelled',         meta: 'Venue unavailable · Was 12:00 PM today', time: '32m ago' },
      { dot: 'change', title: 'Academic Review moved to 3 PM',      meta: 'Was 1:30 PM · Room change',              time: '1h ago'  },
      { dot: 'info',   title: 'AD added budget call request',        meta: 'Needs scheduling · Urgent',              time: '2h ago'  },
    ],
  },
  {
    section: 'Completed',
    items: [
      { dot: 'done', title: 'Morning walkthrough complete', meta: 'Finished at 8:15 AM',          time: '8:15 AM'  },
      { dot: 'done', title: 'Roster updates submitted',    meta: 'Sent to compliance office',     time: 'Yesterday'},
    ],
  },
  {
    section: 'Slipped',
    items: [
      { dot: 'slip', title: 'Film notes to DC — overdue', meta: 'Was due yesterday', time: '1d late' },
    ],
  },
  {
    section: 'Organization Activity',
    items: [
      { dot: 'info', title: 'A. Thompson added Practice to Tue',   meta: 'Lincoln U · Coaching Staff', time: '1h ago' },
      { dot: 'info', title: 'M. Davis rescheduled Film to Wed',    meta: 'Coaching Staff',             time: '2h ago' },
    ],
  },
  {
    section: 'Approvals Needed',
    items: [
      { dot: 'approve', title: 'Nexus wants to reschedule recruit call', meta: 'Move to 11 AM to resolve conflict', time: 'Pending' },
    ],
  },
  {
    section: 'Follow-Up Required',
    items: [
      { dot: 'info', title: 'Send recap to coaching staff', meta: 'From: Staff Sync this morning', time: 'Action' },
    ],
  },
];

function FeedView({ C }: { C: ComponentColors }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
      {FEED_DATA.map((group, gi) => (
        <View key={group.section}>
          <SLabel title={group.section} C={C} />
          {group.items.map((item, i) => (
            <View
              key={i}
              style={[feedS.item, { borderBottomColor: C.separator }, i === group.items.length - 1 && { borderBottomWidth: 0 }]}
            >
              <View style={[feedS.dot, { backgroundColor: DOT_COLOR[item.dot], marginTop: 5 }]} />
              <View style={feedS.content}>
                <Text style={[feedS.title, { color: C.label }]}>{item.title}</Text>
                <Text style={[feedS.meta, { color: C.secondary }]}>{item.meta}</Text>
              </View>
              <Text style={[feedS.time, { color: C.muted }]}>{item.time}</Text>
            </View>
          ))}
        </View>
      ))}

      {/* Review Summary (Nexus card) */}
      <View style={[feedS.reviewCard, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        <Text style={[feedS.reviewLbl, { color: C.muted }]}>NEXUS REVIEW</Text>
        <Text style={[feedS.reviewTitle, { color: C.label }]}>Today So Far</Text>
        <Text style={[feedS.reviewText, { color: C.secondary }]}>
          1 event completed, 1 cancelled, 1 moved. You have a conflict at 10:15 that needs resolution.
          Compliance docs are critical and due by 1 PM. Film notes to DC are overdue from yesterday.
          Suggest addressing the recruit call overlap first, then tackling compliance docs in the 1 PM block.
        </Text>
      </View>

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const feedS = StyleSheet.create({
  item: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    paddingVertical: 13, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  dot: { width: 7, height: 7, borderRadius: 3.5, flexShrink: 0 },
  content: { flex: 1, minWidth: 0, gap: 2 },
  title: { fontSize: 13.5, fontWeight: '500', lineHeight: 19 },
  meta: { fontSize: 11.5 },
  time: { fontSize: 11, flexShrink: 0, marginTop: 3 },
  reviewCard: { marginTop: 20, borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 6 },
  reviewLbl: { fontSize: 10, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  reviewTitle: { fontSize: 13, fontWeight: '600' },
  reviewText: { fontSize: 13, lineHeight: 20 },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AgendaScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeView, setActiveView]     = useState<AgendaView>('Now');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const panelWidth      = screenWidth * 0.78;
  const panelTranslateX = useRef(new Animated.Value(0)).current;
  const [panelOpen, setPanelOpen] = useState(false);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    Animated.spring(panelTranslateX, { toValue: panelWidth, tension: 65, friction: 11, useNativeDriver: true }).start();
  }, [panelTranslateX, panelWidth]);

  const closePanel = useCallback(() => {
    Animated.timing(panelTranslateX, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setPanelOpen(false));
  }, [panelTranslateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, gs) => !panelOpen && gs.dx > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderRelease: (_e, gs) => { if (gs.dx > 60) openPanel(); },
      }),
    [panelOpen, openPanel],
  );

  const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      <Animated.View
        style={[styles.content, { transform: [{ translateX: panelTranslateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Segmented control */}
        <View style={{ paddingTop: insets.top + 12, paddingBottom: 0 }}>
          <ViewSwitcher active={activeView} onChange={setActiveView} C={C} />
        </View>

        {/* Filter bar */}
        <FilterBar C={C} />

        {/* Date indicator */}
        {selectedDate && (
          <View style={[styles.dateIndicator, { backgroundColor: 'rgba(0,0,0,0.04)' }]}>
            <IconSymbol name="calendar" size={14} color={C.secondary} />
            <Text style={[styles.dateIndicatorText, { color: C.label }]}>
              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][selectedDate.getDay()]},{' '}
              {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getDate()}
            </Text>
            <Pressable
              style={[styles.dateIndicatorClose, { backgroundColor: 'rgba(0,0,0,0.06)' }]}
              onPress={() => setSelectedDate(null)}
            >
              <Text style={[styles.dateCloseText, { color: C.secondary }]}>✕</Text>
            </Pressable>
          </View>
        )}

        {/* Canvas */}
        <View style={styles.canvas}>
          {activeView === 'Now'  && <NowView  C={C} />}
          {activeView === 'Plan' && <PlanView C={C} />}
          {activeView === 'Feed' && <FeedView C={C} />}
        </View>
      </Animated.View>

      {/* Backdrop */}
      {panelOpen && <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />}

      {/* Side panel */}
      <AgendaSidePanel
        translateX={panelTranslateX}
        onOpen={openPanel}
        onClose={closePanel}
        onDateSelect={setSelectedDate}
        selectedDate={selectedDate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  canvas: { flex: 1, paddingHorizontal: 20, paddingTop: 10 },
  dateIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 20,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
  },
  dateIndicatorText: { flex: 1, fontSize: 13, fontWeight: '500' },
  dateIndicatorClose: { width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  dateCloseText: { fontSize: 12 },
});
