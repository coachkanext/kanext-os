/**
 * Competition Program V3 — 3-pill ViewBar (Identity | Season | Operations)
 * K-1 Speed League · Commissioner perspective
 * Road-legal supercar/hypercar racing, $10M cap, no prototypes, no BoP.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================

type ViewId = 'identity' | 'season' | 'operations';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'season', label: 'Season' },
  { id: 'operations', label: 'Operations' },
];

const CHAMPIONSHIPS = [
  { id: 'c1', title: 'Driver Championship', leader: 'Carter', points: 156 },
  { id: 'c2', title: 'Constructor Championship', leader: 'KaNeXT Works', points: 248 },
  { id: 'c3', title: 'Crew Championship', leader: 'Team Carter', points: 89 },
  { id: 'c4', title: 'Wildcard Cup', leader: 'TBD', points: 0 },
];

type RaceStatus = 'completed' | 'next' | 'upcoming';

const RACE_CARDS: { id: string; round: string; venue: string; status: RaceStatus; winner?: string }[] = [
  { id: 'r1', round: 'R1', venue: 'Miami', status: 'completed', winner: 'Carter' },
  { id: 'r2', round: 'R2', venue: 'Austin', status: 'completed', winner: 'Verstappen' },
  { id: 'r3', round: 'R3', venue: 'Monza', status: 'completed', winner: 'Hamilton' },
  { id: 'r4', round: 'R4', venue: 'Suzuka', status: 'next' },
  { id: 'r5', round: 'R5', venue: 'Spa', status: 'upcoming' },
  { id: 'r6', round: 'R6', venue: 'Nurburgring', status: 'upcoming' },
  { id: 'r7', round: 'R7', venue: 'Bathurst', status: 'upcoming' },
  { id: 'r8', round: 'R8', venue: 'Dubai', status: 'upcoming' },
];

const RACE_STATUS_COLOR: Record<RaceStatus, string> = {
  completed: '#22C55E',
  next: '#F59E0B',
  upcoming: '#A1A1AA',
};

const RACE_STATUS_LABEL: Record<RaceStatus, string> = {
  completed: 'COMPLETED',
  next: 'NEXT',
  upcoming: 'UPCOMING',
};

const GRID_CATEGORIES = [
  { id: 'g1', label: 'OEM Works', desc: 'Factory-backed manufacturer teams' },
  { id: 'g2', label: 'Premier Tuner', desc: 'Elite aftermarket and tuning houses' },
  { id: 'g3', label: 'League-Owned', desc: 'Operated by K-1 Speed League' },
  { id: 'g4', label: 'KaNeXT Works', desc: 'Commissioner flagship entry' },
];

const WEEKEND_FORMAT = [
  { day: 'Friday', sessions: 'Practice 1 · Practice 2 · Qualifying' },
  { day: 'Saturday', sessions: 'Wildcard Heats · Wildcard Finals' },
  { day: 'Sunday', sessions: 'Grand Prix' },
];

const ENGINE_DYNASTY = [
  { gen: 'K8', desc: 'Naturally aspirated V8 era' },
  { gen: 'K24', desc: 'Twin-turbo hybrid 2.4L era' },
  { gen: 'K248', desc: 'Current — hybrid hypercar powertrain' },
];

type TaskStatus = 'due_soon' | 'overdue' | 'in_progress' | 'upcoming' | 'pending';

const OPS_TASKS: { id: string; title: string; status: TaskStatus; detail: string }[] = [
  { id: 'ot1', title: 'Finalize R4 Suzuka race weekend schedule', status: 'due_soon', detail: 'Due in 3 days' },
  { id: 'ot2', title: 'Review technical bulletin TB-2025-04', status: 'in_progress', detail: 'In review' },
  { id: 'ot3', title: 'Approve marshal travel roster for Suzuka', status: 'due_soon', detail: 'Due in 5 days' },
  { id: 'ot4', title: 'Process penalty appeal — RUF Performance', status: 'overdue', detail: 'Overdue' },
  { id: 'ot5', title: 'Confirm broadcast schedule R4-R8', status: 'upcoming', detail: 'Due next week' },
];

const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  due_soon: '#F59E0B',
  overdue: '#EF4444',
  in_progress: '#1D9BF0',
  upcoming: '#22C55E',
  pending: '#F59E0B',
};

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  due_soon: 'DUE SOON',
  overdue: 'OVERDUE',
  in_progress: 'IN PROGRESS',
  upcoming: 'UPCOMING',
  pending: 'PENDING',
};

const APPROVAL_QUEUE = [
  { id: 'aq1', title: 'Entry application — Hennessey Performance', type: 'Entry' },
  { id: 'aq2', title: 'Technical waiver — McLaren aero package', type: 'Waiver' },
  { id: 'aq3', title: 'Penalty appeal — RUF Performance 5s penalty R3', type: 'Appeal' },
];

const SUZUKA_CHECKLIST = [
  { id: 'sc1', item: 'Venue contract signed', done: true },
  { id: 'sc2', item: 'Safety inspection booked', done: true },
  { id: 'sc3', item: 'Marshal assignments confirmed', done: false },
  { id: 'sc4', item: 'Broadcast truck shipped', done: true },
  { id: 'sc5', item: 'Medical team confirmed', done: false },
  { id: 'sc6', item: 'Timing system calibrated', done: false },
];

const LOGISTICS_SHIPMENTS = [
  { id: 'ls1', item: 'Timing & safety equipment', origin: 'Miami', dest: 'Suzuka', status: 'In Transit' },
  { id: 'ls2', item: 'Podium & signage package', origin: 'Monza warehouse', dest: 'Suzuka', status: 'Shipped' },
];

const BROADCAST_SCHEDULE = [
  { id: 'bs1', round: 'R4 Suzuka', network: 'ESPN', time: 'Sun 2:00 AM ET' },
  { id: 'bs2', round: 'R5 Spa', network: 'Sky Sports F1', time: 'Sun 8:00 AM ET' },
  { id: 'bs3', round: 'R6 Nurburgring', network: 'ESPN', time: 'Sun 9:00 AM ET' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: string;
}

// =============================================================================
// HELPERS
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// VIEW: IDENTITY
// =============================================================================

function IdentityView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* League Card */}
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.brandName, { color: colors.text }]}>K-1 Speed League</ThemedText>
        <ThemedText style={[s.brandTagline, { color: colors.textSecondary }]}>
          "The pinnacle of road-legal motorsport"
        </ThemedText>
        <View style={s.brandMetaRow}>
          <View style={s.brandMetaItem}>
            <ThemedText style={[s.brandMetaLabel, { color: colors.textSecondary }]}>Founded</ThemedText>
            <ThemedText style={[s.brandMetaValue, { color: colors.text }]}>2024</ThemedText>
          </View>
          <View style={s.brandMetaItem}>
            <ThemedText style={[s.brandMetaLabel, { color: colors.textSecondary }]}>HQ</ThemedText>
            <ThemedText style={[s.brandMetaValue, { color: colors.text }]}>Miami, FL</ThemedText>
          </View>
        </View>
      </View>

      {/* Core Philosophy */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CORE PHILOSOPHY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Platform</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>Road-legal supercars/hypercars</ThemedText>
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Build Cap</ThemedText>
          <ThemedText style={[s.detailValue, { color: accentColor }]}>$10M</ThemedText>
        </View>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Prototypes</ThemedText>
          <ThemedText style={[s.detailValue, { color: '#EF4444' }]}>Prohibited</ThemedText>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Balance of Performance</ThemedText>
          <ThemedText style={[s.detailValue, { color: '#EF4444' }]}>None</ThemedText>
        </View>
      </View>

      {/* Championships */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>4 CHAMPIONSHIPS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CHAMPIONSHIPS.map((ch, idx) => (
          <View
            key={ch.id}
            style={[
              s.champRow,
              idx < CHAMPIONSHIPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name="crown.fill" size={14} color={accentColor} />
            <ThemedText style={[s.champTitle, { color: colors.text }]}>{ch.title}</ThemedText>
          </View>
        ))}
      </View>

      {/* Grid Categories */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>GRID STRUCTURE</ThemedText>
      {GRID_CATEGORIES.map((cat) => (
        <View key={cat.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardTitle, { color: colors.text }]}>{cat.label}</ThemedText>
          <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>{cat.desc}</ThemedText>
        </View>
      ))}

      {/* Race Weekend Format */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>WEEKEND FORMAT</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {WEEKEND_FORMAT.map((day, idx) => (
          <View
            key={day.day}
            style={[
              s.weekendRow,
              idx < WEEKEND_FORMAT.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.weekendDay, { color: accentColor }]}>{day.day}</ThemedText>
            <ThemedText style={[s.weekendSessions, { color: colors.textSecondary }]}>{day.sessions}</ThemedText>
          </View>
        ))}
      </View>

      {/* Engine Dynasty */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>ENGINE DYNASTY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {ENGINE_DYNASTY.map((eng, idx) => (
          <View
            key={eng.gen}
            style={[
              s.dynastyRow,
              idx < ENGINE_DYNASTY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.dynastyGen, { color: accentColor }]}>{eng.gen}</ThemedText>
            <ThemedText style={[s.dynastyDesc, { color: colors.textSecondary }]}>{eng.desc}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: SEASON
// =============================================================================

function SeasonView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Championship Standings */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>CHAMPIONSHIP LEADERS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {CHAMPIONSHIPS.map((ch, idx) => (
          <View
            key={ch.id}
            style={[
              s.standingRow,
              idx < CHAMPIONSHIPS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.standingLeft}>
              <IconSymbol name="crown.fill" size={14} color={accentColor} />
              <View style={s.standingInfo}>
                <ThemedText style={[s.standingTitle, { color: colors.textSecondary }]}>{ch.title}</ThemedText>
                <ThemedText style={[s.standingLeader, { color: colors.text }]}>{ch.leader}</ThemedText>
              </View>
            </View>
            {ch.points > 0 ? (
              <ThemedText style={[s.standingPts, { color: accentColor }]}>{ch.points} pts</ThemedText>
            ) : (
              <ThemedText style={[s.standingPts, { color: colors.textTertiary }]}>--</ThemedText>
            )}
          </View>
        ))}
      </View>

      {/* Race Calendar */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>RACE CALENDAR</ThemedText>
      {RACE_CARDS.map((race) => (
        <Pressable
          key={race.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.raceHeader}>
            <View style={[s.roundBadge, { backgroundColor: accentColor + '20' }]}>
              <ThemedText style={[s.roundText, { color: accentColor }]}>{race.round}</ThemedText>
            </View>
            <ThemedText style={[s.raceVenue, { color: colors.text }]}>{race.venue}</ThemedText>
            <StatusBadge label={RACE_STATUS_LABEL[race.status]} color={RACE_STATUS_COLOR[race.status]} />
          </View>
          {race.winner && (
            <View style={s.raceWinnerRow}>
              <IconSymbol name="crown.fill" size={12} color="#1D9BF0" />
              <ThemedText style={[s.raceWinner, { color: colors.textSecondary }]}>
                Winner: {race.winner}
              </ThemedText>
            </View>
          )}
          {race.status === 'next' && (
            <View style={s.raceCountdown}>
              <IconSymbol name="timer" size={12} color="#F59E0B" />
              <ThemedText style={[s.countdownText, { color: '#F59E0B' }]}>Countdown active</ThemedText>
            </View>
          )}
        </Pressable>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// VIEW: OPERATIONS
// =============================================================================

function OperationsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      {/* Tasks */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TASKS ({OPS_TASKS.length})</ThemedText>
      {OPS_TASKS.map((task) => (
        <View key={task.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{task.title}</ThemedText>
            <StatusBadge label={TASK_STATUS_LABEL[task.status]} color={TASK_STATUS_COLOR[task.status]} />
          </View>
        </View>
      ))}

      {/* Approval Queue */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        APPROVAL QUEUE ({APPROVAL_QUEUE.length})
      </ThemedText>
      {APPROVAL_QUEUE.map((item) => (
        <View key={item.id} style={[s.listRow, { borderBottomColor: colors.border }]}>
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            <StatusBadge label={item.type.toUpperCase()} color="#F59E0B" />
          </View>
        </View>
      ))}

      {/* R4 Suzuka Prep Checklist */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        R4 SUZUKA — RACE WEEKEND PREP
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {SUZUKA_CHECKLIST.map((item, idx) => (
          <View
            key={item.id}
            style={[
              s.checklistRow,
              idx < SUZUKA_CHECKLIST.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol
              name={item.done ? 'checkmark.circle.fill' : 'circle.fill'}
              size={16}
              color={item.done ? '#22C55E' : colors.textTertiary}
            />
            <ThemedText style={[s.checklistText, { color: item.done ? colors.textSecondary : colors.text }]}>
              {item.item}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Logistics Tracker */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        LOGISTICS TRACKER
      </ThemedText>
      {LOGISTICS_SHIPMENTS.map((ship) => (
        <View key={ship.id} style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.shipHeader}>
            <IconSymbol name="airplane" size={14} color={accentColor} />
            <ThemedText style={[s.shipItem, { color: colors.text }]}>{ship.item}</ThemedText>
          </View>
          <ThemedText style={[s.shipRoute, { color: colors.textSecondary }]}>
            {ship.origin} → {ship.dest}
          </ThemedText>
          <StatusBadge label={ship.status.toUpperCase()} color="#1D9BF0" />
        </View>
      ))}

      {/* Broadcast Schedule */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        BROADCAST SCHEDULE
      </ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {BROADCAST_SCHEDULE.map((bs, idx) => (
          <View
            key={bs.id}
            style={[
              s.broadcastRow,
              idx < BROADCAST_SCHEDULE.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.broadcastLeft}>
              <ThemedText style={[s.broadcastRound, { color: colors.text }]}>{bs.round}</ThemedText>
              <ThemedText style={[s.broadcastNet, { color: colors.textSecondary }]}>{bs.network}</ThemedText>
            </View>
            <ThemedText style={[s.broadcastTime, { color: colors.textSecondary }]}>{bs.time}</ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function CompProgram({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('identity');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'identity':
        return <IdentityView colors={colors} accentColor={accentColor} />;
      case 'season':
        return <SeasonView colors={colors} accentColor={accentColor} />;
      case 'operations':
        return <OperationsView colors={colors} accentColor={accentColor} />;
    }
  };

  return (
    <View style={s.container}>
      {/* ViewBar */}
      <View style={s.viewBar}>
        {VIEWS.map((v) => {
          const isActive = v.id === activeView;
          return (
            <Pressable
              key={v.id}
              style={[
                s.pill,
                { backgroundColor: isActive ? accentColor : '#2F3336' },
              ]}
              onPress={() => handlePillPress(v.id)}
            >
              <ThemedText
                style={[
                  s.pillText,
                  { color: isActive ? '#000' : colors.textSecondary },
                ]}
              >
                {v.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  container: {
    flex: 1,
  },

  // -- ViewBar --
  viewBar: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: BorderRadius.full,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Scroll --
  scroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section Header --
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
    textTransform: 'uppercase',
  },

  // -- Card --
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 13,
    marginTop: 4,
  },

  // -- Brand --
  brandName: {
    fontSize: 24,
    fontWeight: '800',
  },
  brandTagline: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
  },
  brandMetaRow: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    gap: Spacing.xl,
  },
  brandMetaItem: {
    gap: 2,
  },
  brandMetaLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  brandMetaValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // -- Detail rows --
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
  },
  detailLabel: {
    fontSize: 13,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Championships --
  champRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  champTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },

  // -- Weekend Format --
  weekendRow: {
    paddingVertical: 10,
  },
  weekendDay: {
    fontSize: 13,
    fontWeight: '700',
  },
  weekendSessions: {
    fontSize: 12,
    marginTop: 4,
  },

  // -- Engine Dynasty --
  dynastyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  dynastyGen: {
    fontSize: 14,
    fontWeight: '800',
    width: 44,
  },
  dynastyDesc: {
    fontSize: 13,
    flex: 1,
  },

  // -- Standings --
  standingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  standingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  standingInfo: {
    flex: 1,
  },
  standingTitle: {
    fontSize: 11,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  standingLeader: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  standingPts: {
    fontSize: 15,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Race Cards --
  raceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roundBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  roundText: {
    fontSize: 12,
    fontWeight: '700',
  },
  raceVenue: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  raceWinnerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  raceWinner: {
    fontSize: 13,
  },
  raceCountdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- List rows --
  listRow: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  listRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  listRowTitle: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },

  // -- Badge --
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Checklist --
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
  },
  checklistText: {
    fontSize: 13,
    flex: 1,
  },

  // -- Logistics --
  shipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  shipItem: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  shipRoute: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 22,
  },

  // -- Broadcast --
  broadcastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  broadcastLeft: {
    flex: 1,
  },
  broadcastRound: {
    fontSize: 14,
    fontWeight: '600',
  },
  broadcastNet: {
    fontSize: 12,
    marginTop: 2,
  },
  broadcastTime: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
});
