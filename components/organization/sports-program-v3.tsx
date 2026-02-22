/**
 * Sports Program V3 — 3-pill ViewBar (Identity | Teams | Operations)
 * Carroll Men's Basketball · NAIA Frontier Conference
 * Head Coach / GM perspective. Inline mock data, no DrillMode.
 */
import React, { useState, useCallback } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

// =============================================================================
// TYPES & MOCK DATA
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
type ViewId = 'identity' | 'teams' | 'operations';

const VIEWS: { id: ViewId; label: string }[] = [
  { id: 'identity', label: 'Identity' },
  { id: 'teams', label: 'Teams' },
  { id: 'operations', label: 'Operations' },
];

const SYSTEM_IDENTITY = {
  offense: { label: 'Motion Spread', code: 'OSIE-03' },
  defense: { label: 'Pack Line', code: 'DSIE-07' },
};

const TEAMS = [
  {
    id: 't1',
    name: 'Varsity',
    coach: 'Coach Dan Pearson',
    players: 18,
    record: '12-8',
    icon: 'sportscourt.fill' as const,
  },
  {
    id: 't2',
    name: 'Development Team 1',
    coach: 'Coach Darius Hill',
    players: 14,
    record: '8-4',
    icon: 'sportscourt' as const,
  },
  {
    id: 't3',
    name: 'Development Team 2',
    coach: 'Coach Terrence Williams',
    players: 12,
    record: '6-6',
    icon: 'sportscourt' as const,
  },
];

type TaskStatus = 'due_tomorrow' | 'overdue' | 'in_progress' | 'upcoming';

const TASKS: { id: string; title: string; status: TaskStatus; detail: string }[] = [
  { id: 'op1', title: 'Update travel roster for Jan 25 game', status: 'due_tomorrow', detail: 'Due tomorrow' },
  { id: 'op2', title: 'Order replacement jerseys — Home set', status: 'upcoming', detail: 'Due Jan 20' },
  { id: 'op3', title: 'Submit compliance report Q2', status: 'overdue', detail: 'Overdue' },
  { id: 'op4', title: 'Schedule recruiting calls — Jan batch', status: 'in_progress', detail: 'In progress' },
  { id: 'op5', title: 'Arrange hotel for Savannah road trip', status: 'upcoming', detail: 'Due Jan 22' },
];

const APPROVALS = [
  { id: 'ap1', title: 'Equipment purchase', amount: '$1,200' },
  { id: 'ap2', title: 'Road trip meal budget', amount: '$800' },
  { id: 'ap3', title: 'Transfer release request — James Cole', amount: '' },
];

const TRIPS = [
  { id: 'tr1', destination: '@ Savannah', date: 'Jan 25', transport: 'Bus', hotel: 'Holiday Inn' },
  { id: 'tr2', destination: '@ Tampa', date: 'Feb 1', transport: 'Bus', hotel: 'Marriott' },
];

const TASK_STATUS_COLOR: Record<TaskStatus, string> = {
  due_tomorrow: '#F59E0B',
  overdue: '#EF4444',
  in_progress: ACCENT,
  upcoming: '#22C55E',
};

const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  due_tomorrow: 'DUE TOMORROW',
  overdue: 'OVERDUE',
  in_progress: 'IN PROGRESS',
  upcoming: 'UPCOMING',
};

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
      {/* Program Info */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PROGRAM</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.cardTitle, { color: colors.text }]}>KaNeXT Men's Basketball</ThemedText>
        <ThemedText style={[s.cardSub, { color: colors.textSecondary }]}>
          Carroll College
        </ThemedText>
      </View>

      {/* Colors */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>PROGRAM COLORS</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.colorRow}>
          <View style={[s.colorSwatch, { backgroundColor: ACCENT }]} />
          <View style={s.colorInfo}>
            <ThemedText style={[s.colorName, { color: colors.text }]}>Carroll Purple</ThemedText>
            <ThemedText style={[s.colorHex, { color: colors.textSecondary }]}>{ACCENT}</ThemedText>
          </View>
        </View>
        <View style={[s.colorRow, { marginTop: 10 }]}>
          <View style={[s.colorSwatch, { backgroundColor: '#F59E0B' }]} />
          <View style={s.colorInfo}>
            <ThemedText style={[s.colorName, { color: colors.text }]}>Gold</ThemedText>
            <ThemedText style={[s.colorHex, { color: colors.textSecondary }]}>#F59E0B</ThemedText>
          </View>
        </View>
      </View>

      {/* Mission */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>MISSION</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.missionText, { color: colors.text }]}>
          "Building champions on and off the court through discipline, faith, and excellence."
        </ThemedText>
      </View>

      {/* Conference & Governing Body */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>AFFILIATION</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.detailRow}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Conference</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>NAIA · Frontier Conference</ThemedText>
        </View>
        <View style={[s.detailRow, { borderBottomWidth: 0 }]}>
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Governing Body</ThemedText>
          <ThemedText style={[s.detailValue, { color: colors.text }]}>NAIA</ThemedText>
        </View>
      </View>

      {/* System Identity */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>SYSTEM IDENTITY</ThemedText>
      <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.systemRow}>
          <IconSymbol name="sportscourt.fill" size={16} color={accentColor} />
          <View style={s.systemInfo}>
            <ThemedText style={[s.systemLabel, { color: colors.textSecondary }]}>Offense</ThemedText>
            <ThemedText style={[s.systemValue, { color: colors.text }]}>
              {SYSTEM_IDENTITY.offense.label}
            </ThemedText>
            <ThemedText style={[s.systemCode, { color: colors.textTertiary }]}>
              {SYSTEM_IDENTITY.offense.code}
            </ThemedText>
          </View>
        </View>
        <View style={[s.systemRow, { marginTop: 12 }]}>
          <IconSymbol name="shield.fill" size={16} color={accentColor} />
          <View style={s.systemInfo}>
            <ThemedText style={[s.systemLabel, { color: colors.textSecondary }]}>Defense</ThemedText>
            <ThemedText style={[s.systemValue, { color: colors.text }]}>
              {SYSTEM_IDENTITY.defense.label}
            </ThemedText>
            <ThemedText style={[s.systemCode, { color: colors.textTertiary }]}>
              {SYSTEM_IDENTITY.defense.code}
            </ThemedText>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// VIEW: TEAMS
// =============================================================================

function TeamsView({ colors, accentColor }: { colors: typeof Colors.light; accentColor: string }) {
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TEAMS</ThemedText>
      {TEAMS.map((team) => (
        <Pressable
          key={team.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => Haptics.selectionAsync()}
        >
          <View style={s.teamHeader}>
            <IconSymbol name={team.icon} size={20} color={accentColor} />
            <ThemedText style={[s.teamName, { color: colors.text }]}>{team.name}</ThemedText>
            <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
          </View>
          <View style={[s.teamMeta, { borderTopColor: colors.border }]}>
            <View style={s.teamMetaItem}>
              <IconSymbol name="person.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.teamMetaText, { color: colors.textSecondary }]}>{team.coach}</ThemedText>
            </View>
            <View style={s.teamMetaItem}>
              <IconSymbol name="person.3.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.teamMetaText, { color: colors.textSecondary }]}>{team.players} players</ThemedText>
            </View>
            <View style={s.teamMetaItem}>
              <IconSymbol name="chart.bar.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.teamMetaText, { color: colors.textSecondary }]}>{team.record}</ThemedText>
            </View>
          </View>
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
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary }]}>TASKS</ThemedText>
      {TASKS.map((task) => (
        <View
          key={task.id}
          style={[s.listRow, { borderBottomColor: colors.border }]}
        >
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]}>{task.title}</ThemedText>
            <StatusBadge label={TASK_STATUS_LABEL[task.status]} color={TASK_STATUS_COLOR[task.status]} />
          </View>
        </View>
      ))}

      {/* Approvals */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        APPROVALS PENDING
      </ThemedText>
      {APPROVALS.map((item) => (
        <View
          key={item.id}
          style={[s.listRow, { borderBottomColor: colors.border }]}
        >
          <View style={s.listRowContent}>
            <ThemedText style={[s.listRowTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {item.amount ? (
              <ThemedText style={[s.amountText, { color: accentColor }]}>{item.amount}</ThemedText>
            ) : (
              <StatusBadge label="PENDING" color="#F59E0B" />
            )}
          </View>
        </View>
      ))}

      {/* Upcoming Trips */}
      <ThemedText style={[s.sectionHeader, { color: colors.textSecondary, marginTop: 20 }]}>
        UPCOMING TRIPS
      </ThemedText>
      {TRIPS.map((trip) => (
        <View
          key={trip.id}
          style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={s.tripHeader}>
            <IconSymbol name="airplane" size={16} color={accentColor} />
            <ThemedText style={[s.tripDest, { color: colors.text }]}>{trip.destination}</ThemedText>
            <ThemedText style={[s.tripDate, { color: colors.textSecondary }]}>{trip.date}</ThemedText>
          </View>
          <ThemedText style={[s.tripDetail, { color: colors.textSecondary }]}>
            {trip.transport} · {trip.hotel}
          </ThemedText>
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function SportsProgram({ colors, accentColor, role }: Props) {
  const [activeView, setActiveView] = useState<ViewId>('identity');

  const handlePillPress = useCallback((id: ViewId) => {
    Haptics.selectionAsync();
    setActiveView(id);
  }, []);

  const renderContent = () => {
    switch (activeView) {
      case 'identity':
        return <IdentityView colors={colors} accentColor={accentColor} />;
      case 'teams':
        return <TeamsView colors={colors} accentColor={accentColor} />;
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
    backgroundColor: '#0B0F14',
    borderColor: '#2F3336',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 13,
  },

  // -- Colors --
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatch: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  colorInfo: {
    flex: 1,
  },
  colorName: {
    fontSize: 14,
    fontWeight: '600',
  },
  colorHex: {
    fontSize: 12,
    marginTop: 2,
  },

  // -- Mission --
  missionText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
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

  // -- System Identity --
  systemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  systemInfo: {
    flex: 1,
  },
  systemLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  systemValue: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  systemCode: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Teams --
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  teamMeta: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 6,
  },
  teamMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  teamMetaText: {
    fontSize: 13,
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

  // -- Amounts --
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Trips --
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tripDest: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  tripDate: {
    fontSize: 12,
  },
  tripDetail: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 24,
  },
});
