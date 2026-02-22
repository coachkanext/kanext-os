/**
 * Universal Series Sheet — Competition Mode
 * Series "truth page" with 12 RBAC-gated tabs.
 * This is the CONTENT component — the parent handles the bottom sheet wrapper.
 */

import React, { useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import {
  type SeriesObject,
  type TeamStanding,
  type OpsTask,
  type SponsorDeliverable,
  type RuleCategory,
  type EventObject,
  type PayoutItem,
  type ComplianceEntity,
  TEAM_STANDINGS,
  RULE_CATEGORIES,
  OPS_TASKS,
  SPONSOR_DELIVERABLES,
  EVENT_LIST,
  PAYOUT_ITEMS,
  COMPLIANCE_ENTITIES,
  COMPLIANCE_SUMMARIES,
  STAFF_DIRECTORY,
  ANNOUNCEMENTS,
} from '@/data/mock-competition-v2';

import {
  type CompetitionRoleLens,
  type SeriesTab,
  getSeriesSheetTabs,
  isFullAccess,
} from '@/utils/competition-rbac';

// =============================================================================
// PROPS
// =============================================================================

interface UniversalSeriesSheetProps {
  series: SeriesObject;
  roleLens: CompetitionRoleLens;
  onClose: () => void;
  onSelectEntrant?: (id: string) => void;
  onSelectEvent?: (id: string) => void;
}

// =============================================================================
// STATUS / FORMAT HELPERS
// =============================================================================

const FORMAT_COLORS: Record<string, string> = {
  league: '#1D9BF0',
  tournament: '#F59E0B',
};

const STATUS_COLORS: Record<string, string> = {
  preseason: '#A1A1AA',
  live: '#22C55E',
  completed: '#52525B',
  upcoming: '#1D9BF0',
};

const OPS_READINESS_ITEMS = [
  { key: 'credentials', label: 'Credentials', ok: true },
  { key: 'venue', label: 'Track/Venue', ok: true },
  { key: 'scrutineering', label: 'Scrutineering', ok: false },
  { key: 'broadcast', label: 'Broadcast', ok: false },
  { key: 'safety', label: 'Safety', ok: true },
  { key: 'payouts', label: 'Payouts', ok: false },
] as const;

const DELIVERABLE_STATUS_COLORS: Record<string, string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  overdue: '#EF4444',
  delivered: '#1D9BF0',
};

const PAYOUT_STATUS_COLORS: Record<string, string> = {
  released: '#22C55E',
  pending: '#F59E0B',
  hold: '#EF4444',
  locked: '#A1A1AA',
};

const COMPLIANCE_STATUS_COLORS: Record<string, string> = {
  approved: '#22C55E',
  pending: '#F59E0B',
  flagged: '#EF4444',
  expired: '#A1A1AA',
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  upcoming: '#1D9BF0',
  live: '#22C55E',
  completed: '#A1A1AA',
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UniversalSeriesSheet({
  series,
  roleLens,
  onClose,
  onSelectEntrant,
  onSelectEvent,
}: UniversalSeriesSheetProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const tabs = useMemo(() => getSeriesSheetTabs(roleLens), [roleLens]);
  const [activeTab, setActiveTab] = useState<SeriesTab>(tabs[0]?.id ?? 'dashboard');

  const fullAccess = isFullAccess(roleLens);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ================================================================== */}
      {/* HEADER */}
      {/* ================================================================== */}
      <SeriesHeader
        series={series}
        roleLens={roleLens}
        colors={colors}
        fullAccess={fullAccess}
        onClose={onClose}
      />

      {/* ================================================================== */}
      {/* TAB BAR */}
      {/* ================================================================== */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBar}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <Pressable
              key={tab.id}
              style={[
                styles.tabPill,
                {
                  backgroundColor: isActive ? '#FFFFFF' : colors.card,
                  borderColor: isActive ? '#FFFFFF' : colors.border,
                },
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <ThemedText
                style={[
                  styles.tabPillText,
                  { color: isActive ? '#000000' : colors.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* ================================================================== */}
      {/* TAB CONTENT */}
      {/* ================================================================== */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'dashboard' && (
          <DashboardTab series={series} colors={colors} fullAccess={fullAccess} />
        )}
        {activeTab === 'standings' && (
          <StandingsTab colors={colors} onSelectEntrant={onSelectEntrant} />
        )}
        {activeTab === 'calendar' && <CalendarTab colors={colors} />}
        {activeTab === 'events' && (
          <EventsTab colors={colors} series={series} onSelectEvent={onSelectEvent} />
        )}
        {activeTab === 'ops' && <OpsTab colors={colors} />}
        {activeTab === 'rules' && <RulesTab colors={colors} />}
        {activeTab === 'tech_compliance' && <TechComplianceTab colors={colors} />}
        {activeTab === 'finance' && <FinanceTab colors={colors} series={series} />}
        {activeTab === 'payment_rails' && <PaymentRailsTab colors={colors} />}
        {activeTab === 'venues' && <VenuesTab colors={colors} />}
        {activeTab === 'sponsors' && <SponsorsTab colors={colors} />}
        {activeTab === 'media' && <MediaTab colors={colors} />}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// HEADER
// =============================================================================

function SeriesHeader({
  series,
  roleLens,
  colors,
  fullAccess,
  onClose,
}: {
  series: SeriesObject;
  roleLens: CompetitionRoleLens;
  colors: typeof Colors.light;
  fullAccess: boolean;
  onClose: () => void;
}) {
  return (
    <View style={[styles.header, { borderBottomColor: colors.border }]}>
      {/* Top row: name + close */}
      <View style={styles.headerTopRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={[styles.seriesName, { color: colors.text }]}>
            {series.name}
          </ThemedText>
          <ThemedText style={[styles.seasonLabel, { color: colors.textSecondary }]}>
            {series.season} · {series.currentPhase}
          </ThemedText>
        </View>
        <Pressable onPress={onClose} hitSlop={12}>
          <IconSymbol name="xmark" size={20} color={colors.textSecondary} />
        </Pressable>
      </View>

      {/* Pills: format + status */}
      <View style={styles.pillRow}>
        <View
          style={[
            styles.formatPill,
            { backgroundColor: (FORMAT_COLORS[series.format] ?? '#A1A1AA') + '1A' },
          ]}
        >
          <ThemedText
            style={[
              styles.formatPillText,
              { color: FORMAT_COLORS[series.format] ?? '#A1A1AA' },
            ]}
          >
            {series.format === 'league' ? 'League' : 'Tournament'}
          </ThemedText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: (STATUS_COLORS[series.status] ?? '#A1A1AA') + '1A' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: STATUS_COLORS[series.status] ?? '#A1A1AA' },
            ]}
          />
          <ThemedText
            style={[
              styles.statusPillText,
              { color: STATUS_COLORS[series.status] ?? '#A1A1AA' },
            ]}
          >
            {series.status.charAt(0).toUpperCase() + series.status.slice(1)}
          </ThemedText>
        </View>
      </View>

      {/* Next key date */}
      <ThemedText style={[styles.nextDate, { color: colors.textSecondary }]}>
        {series.nextKeyDate}
      </ThemedText>

      {/* Quick chips: RBAC-gated for C1/C2 */}
      {fullAccess && (
        <View style={styles.quickChipRow}>
          {series.opsBlockers > 0 && (
            <View style={[styles.quickChip, { backgroundColor: '#EF444422' }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
              <ThemedText style={[styles.quickChipText, { color: '#EF4444' }]}>
                {series.opsBlockers} Ops Blocker{series.opsBlockers > 1 ? 's' : ''}
              </ThemedText>
            </View>
          )}
          <View
            style={[
              styles.quickChip,
              {
                backgroundColor: series.financeReady ? '#22C55E22' : '#F59E0B22',
              },
            ]}
          >
            <IconSymbol
              name="dollarsign.circle.fill"
              size={12}
              color={series.financeReady ? '#22C55E' : '#F59E0B'}
            />
            <ThemedText
              style={[
                styles.quickChipText,
                { color: series.financeReady ? '#22C55E' : '#F59E0B' },
              ]}
            >
              {series.financeReady ? 'Finance Ready' : 'Finance Pending'}
            </ThemedText>
          </View>
          {series.complianceIncidents > 0 && (
            <View style={[styles.quickChip, { backgroundColor: '#F59E0B22' }]}>
              <IconSymbol name="shield.fill" size={12} color="#F59E0B" />
              <ThemedText style={[styles.quickChipText, { color: '#F59E0B' }]}>
                {series.complianceIncidents} Compliance
              </ThemedText>
            </View>
          )}
        </View>
      )}

      {/* Action icons */}
      <View style={styles.actionRow}>
        <ActionIcon icon="square.and.arrow.up" label="Share" colors={colors} />
        <ActionIcon icon="bubble.left.fill" label="Msg Ops" colors={colors} />
        <ActionIcon icon="doc.badge.plus" label="Request" colors={colors} />
        <ActionIcon icon="doc.fill" label="Export" colors={colors} />
      </View>
    </View>
  );
}

function ActionIcon({
  icon,
  label,
  colors,
}: {
  icon: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={styles.actionIconWrap}>
      <View style={[styles.actionIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      </View>
      <ThemedText style={[styles.actionIconLabel, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// DASHBOARD TAB
// =============================================================================

function DashboardTab({
  series,
  colors,
  fullAccess,
}: {
  series: SeriesObject;
  colors: typeof Colors.light;
  fullAccess: boolean;
}) {
  const blockers = OPS_TASKS.filter((t) => t.status === 'blocker');
  const upcomingDeliverables = SPONSOR_DELIVERABLES.filter((d) => d.status !== 'delivered');
  const incidents = series.complianceIncidents;

  return (
    <View>
      {/* A) Today/Next Block */}
      <SectionCard title="Today / Next" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          {series.nextKeyDate}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          {series.entrantsCount} entrants · {series.eventsCount} events · {series.currentPhase}
        </ThemedText>
      </SectionCard>

      {/* B) Ops Readiness Strip */}
      {fullAccess && (
        <SectionCard title="Ops Readiness" colors={colors}>
          <View style={styles.opsReadinessStrip}>
            {OPS_READINESS_ITEMS.map((item) => (
              <View key={item.key} style={styles.opsReadinessItem}>
                <ThemedText
                  style={[
                    styles.opsReadinessIcon,
                    { color: item.ok ? '#22C55E' : '#F59E0B' },
                  ]}
                >
                  {item.ok ? '\u2705' : '\u26A0\uFE0F'}
                </ThemedText>
                <ThemedText style={[styles.opsReadinessLabel, { color: colors.textSecondary }]}>
                  {item.label}
                </ThemedText>
              </View>
            ))}
          </View>
        </SectionCard>
      )}

      {/* C) Integrity / Incidents */}
      <SectionCard title="Integrity / Incidents" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock
            label="Open Incidents"
            value={String(incidents)}
            color={incidents > 0 ? '#F59E0B' : '#22C55E'}
            colors={colors}
          />
          <StatBlock
            label="Blockers"
            value={String(blockers.length)}
            color={blockers.length > 0 ? '#EF4444' : '#22C55E'}
            colors={colors}
          />
          <StatBlock
            label="Entrants"
            value={String(series.entrantsCount)}
            color="#FFFFFF"
            colors={colors}
          />
        </View>
      </SectionCard>

      {/* D) Sponsor Delivery Health */}
      <SectionCard title="Sponsor Delivery Health" colors={colors}>
        {upcomingDeliverables.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            All deliverables completed
          </ThemedText>
        ) : (
          upcomingDeliverables.map((d) => (
            <View
              key={d.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.deliverableStatusDot,
                  { backgroundColor: DELIVERABLE_STATUS_COLORS[d.status] ?? '#A1A1AA' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {d.sponsorName}: {d.title}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  Due: {d.dueDate} · {d.owner}
                </ThemedText>
              </View>
              <ThemedText
                style={[
                  styles.statusLabel,
                  { color: DELIVERABLE_STATUS_COLORS[d.status] ?? '#A1A1AA' },
                ]}
              >
                {d.status.replace('_', ' ').toUpperCase()}
              </ThemedText>
            </View>
          ))
        )}
      </SectionCard>

      {/* E) Media / Broadcast */}
      <SectionCard title="Media / Broadcast" colors={colors}>
        <ThemedText style={[styles.bodyText, { color: colors.text }]}>
          Broadcast package: {blockers.some((b) => b.department === 'Broadcast') ? 'Pending' : 'Locked'}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          Media Director: Maria Rodriguez · Broadcast Producer: TBD
        </ThemedText>
      </SectionCard>

      {/* Action Buttons */}
      {fullAccess && (
        <View style={styles.actionButtonGrid}>
          <ActionButton label="Open Event Ops" icon="flag.fill" colors={colors} />
          <ActionButton label="Open Approvals Queue" icon="checkmark.seal" colors={colors} />
          <ActionButton label="Open Broadcast Room" icon="play.rectangle.fill" colors={colors} />
          <ActionButton label="Open Sponsor Room" icon="building.2.fill" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// STANDINGS TAB
// =============================================================================

function StandingsTab({
  colors,
  onSelectEntrant,
}: {
  colors: typeof Colors.light;
  onSelectEntrant?: (id: string) => void;
}) {
  return (
    <View>
      <SectionCard title="Team Championship Standings" colors={colors}>
        {/* Table header */}
        <View style={[styles.tableHeader, { borderBottomColor: colors.border }]}>
          <ThemedText style={[styles.tableHeaderCell, styles.rankCol, { color: colors.textTertiary }]}>
            #
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.nameCol, { color: colors.textTertiary }]}>
            Team
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.numCol, { color: colors.textTertiary }]}>
            Pts
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.numCol, { color: colors.textTertiary }]}>
            Wins
          </ThemedText>
          <ThemedText style={[styles.tableHeaderCell, styles.numCol, { color: colors.textTertiary }]}>
            Pen
          </ThemedText>
        </View>

        {/* Table rows */}
        {TEAM_STANDINGS.map((team) => (
          <Pressable
            key={team.teamId}
            style={[styles.tableRow, { borderBottomColor: colors.border }]}
            onPress={() => onSelectEntrant?.(team.teamId)}
          >
            <ThemedText style={[styles.tableCell, styles.rankCol, { color: colors.textSecondary }]}>
              {team.position}
            </ThemedText>
            <View style={[styles.nameCol, { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
              <View style={[styles.teamColorDot, { backgroundColor: team.teamColor }]} />
              <ThemedText style={[styles.tableCell, { color: colors.text }]} numberOfLines={1}>
                {team.teamName}
              </ThemedText>
            </View>
            <ThemedText style={[styles.tableCell, styles.numCol, { color: colors.text, fontWeight: '600' }]}>
              {team.points}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.numCol, { color: colors.textSecondary }]}>
              {team.wins}
            </ThemedText>
            <ThemedText style={[styles.tableCell, styles.numCol, { color: colors.textSecondary }]}>
              {team.reliability}%
            </ThemedText>
          </Pressable>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// CALENDAR TAB
// =============================================================================

const CALENDAR_EVENTS = [
  { id: 'cal-1', title: 'Round 1 · Laguna Seca GP', date: 'Jun 20-22, 2026', status: 'completed' },
  { id: 'cal-2', title: 'Round 2 · Portland Thunder Classic', date: 'Jul 28 - Aug 2, 2026', status: 'live' },
  { id: 'cal-3', title: 'Round 3 · Portland GP', date: 'Aug 15-17, 2026', status: 'upcoming' },
  { id: 'cal-4', title: 'Round 4 · COTA Endurance', date: 'Sep 5-7, 2026', status: 'upcoming' },
  { id: 'cal-5', title: 'Round 5 · Road Atlanta Challenge', date: 'Sep 26-28, 2026', status: 'upcoming' },
  { id: 'cal-6', title: 'Round 6 · Barber Invitational', date: 'Oct 10-12, 2026', status: 'upcoming' },
  { id: 'cal-7', title: 'Round 7 · Virginia Classic', date: 'Oct 31 - Nov 2, 2026', status: 'upcoming' },
  { id: 'cal-8', title: 'Round 8 · Lonestar GP (Finale)', date: 'Nov 14-16, 2026', status: 'upcoming' },
];

function CalendarTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Season Calendar" colors={colors}>
        {CALENDAR_EVENTS.map((evt) => (
          <View
            key={evt.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.calendarStatusBar,
                { backgroundColor: EVENT_STATUS_COLORS[evt.status] ?? '#A1A1AA' },
              ]}
            />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {evt.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {evt.date}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: EVENT_STATUS_COLORS[evt.status] ?? '#A1A1AA' },
              ]}
            >
              {evt.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// EVENTS TAB
// =============================================================================

function EventsTab({
  colors,
  series,
  onSelectEvent,
}: {
  colors: typeof Colors.light;
  series: SeriesObject;
  onSelectEvent?: (id: string) => void;
}) {
  const events = EVENT_LIST.filter((e) => e.seriesId === series.id);

  return (
    <View>
      <SectionCard title="Events" colors={colors}>
        {events.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No events for this series
          </ThemedText>
        ) : (
          events.map((evt) => (
            <Pressable
              key={evt.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
              onPress={() => onSelectEvent?.(evt.id)}
            >
              <View
                style={[
                  styles.eventStatusDot,
                  { backgroundColor: EVENT_STATUS_COLORS[evt.status] ?? '#A1A1AA' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {evt.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {evt.venue} · {evt.location}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {evt.dateRange} · {evt.sessionsCount} sessions
                </ThemedText>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <ThemedText
                  style={[
                    styles.statusLabel,
                    { color: EVENT_STATUS_COLORS[evt.status] ?? '#A1A1AA' },
                  ]}
                >
                  {evt.status.toUpperCase()}
                </ThemedText>
                {evt.opsBlockers > 0 && (
                  <ThemedText style={[styles.captionText, { color: '#EF4444' }]}>
                    {evt.opsBlockers} blocker{evt.opsBlockers > 1 ? 's' : ''}
                  </ThemedText>
                )}
              </View>
            </Pressable>
          ))
        )}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// OPS TAB (C1/C2 ONLY)
// =============================================================================

function OpsTab({ colors }: { colors: typeof Colors.light }) {
  const blockers = OPS_TASKS.filter((t) => t.status === 'blocker');
  const openTasks = OPS_TASKS.filter((t) => t.status === 'open');
  const doneTasks = OPS_TASKS.filter((t) => t.status === 'done');

  return (
    <View>
      {/* Blockers */}
      <SectionCard title="Blockers" colors={colors}>
        {blockers.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No blockers
          </ThemedText>
        ) : (
          blockers.map((task) => (
            <OpsTaskRow key={task.id} task={task} colors={colors} />
          ))
        )}
      </SectionCard>

      {/* Open Tasks */}
      <SectionCard title="Open Tasks" colors={colors}>
        {openTasks.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            All tasks complete
          </ThemedText>
        ) : (
          openTasks.map((task) => (
            <OpsTaskRow key={task.id} task={task} colors={colors} />
          ))
        )}
      </SectionCard>

      {/* Completed */}
      <SectionCard title="Completed" colors={colors}>
        {doneTasks.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            No completed tasks yet
          </ThemedText>
        ) : (
          doneTasks.map((task) => (
            <OpsTaskRow key={task.id} task={task} colors={colors} />
          ))
        )}
      </SectionCard>
    </View>
  );
}

function OpsTaskRow({ task, colors }: { task: OpsTask; colors: typeof Colors.light }) {
  const statusColor =
    task.status === 'blocker' ? '#EF4444' : task.status === 'done' ? '#22C55E' : '#F59E0B';

  return (
    <View style={[styles.listRow, { borderBottomColor: colors.border }]}>
      <View style={[styles.opsStatusBadge, { backgroundColor: statusColor + '22' }]}>
        <ThemedText style={[styles.opsStatusText, { color: statusColor }]}>
          {task.status.toUpperCase()}
        </ThemedText>
      </View>
      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
        <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
          {task.title}
        </ThemedText>
        <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
          {task.owner} · {task.department} · Due: {task.deadline}
        </ThemedText>
        {task.impactFlags.length > 0 && (
          <View style={styles.flagRow}>
            {task.impactFlags.map((flag) => (
              <View key={flag} style={[styles.impactFlag, { backgroundColor: '#EF444422' }]}>
                <ThemedText style={[styles.impactFlagText, { color: '#EF4444' }]}>
                  {flag}
                </ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// =============================================================================
// RULES TAB
// =============================================================================

function RulesTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Rule Categories" colors={colors}>
        {RULE_CATEGORIES.map((cat) => (
          <View
            key={cat.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {cat.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {cat.purpose}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                Last updated: {cat.lastUpdated} · {cat.activeDirectives} active directive{cat.activeDirectives !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <View
              style={[
                styles.visibilityBadge,
                {
                  backgroundColor:
                    cat.visibility === 'public' ? '#22C55E22' : '#F59E0B22',
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.visibilityText,
                  {
                    color: cat.visibility === 'public' ? '#22C55E' : '#F59E0B',
                  },
                ]}
              >
                {cat.visibility.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// TECH & COMPLIANCE TAB (C1/C2 ONLY)
// =============================================================================

function TechComplianceTab({ colors }: { colors: typeof Colors.light }) {
  const flaggedEntities = COMPLIANCE_ENTITIES.filter((e) => e.status === 'flagged' || e.status === 'expired');
  const pendingEntities = COMPLIANCE_ENTITIES.filter((e) => e.status === 'pending');

  return (
    <View>
      {/* Inspection Requirements / Flagged */}
      <SectionCard title="Flagged / Expired Items" colors={colors}>
        {flaggedEntities.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            All items compliant
          </ThemedText>
        ) : (
          flaggedEntities.map((entity) => (
            <View
              key={entity.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.complianceDot,
                  { backgroundColor: COMPLIANCE_STATUS_COLORS[entity.status] ?? '#A1A1AA' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {entity.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {entity.type} · {entity.teamName}
                </ThemedText>
                {entity.notes && (
                  <ThemedText style={[styles.captionText, { color: '#EF4444' }]}>
                    {entity.notes}
                  </ThemedText>
                )}
              </View>
              <ThemedText
                style={[
                  styles.statusLabel,
                  { color: COMPLIANCE_STATUS_COLORS[entity.status] ?? '#A1A1AA' },
                ]}
              >
                {entity.status.toUpperCase()}
              </ThemedText>
            </View>
          ))
        )}
      </SectionCard>

      {/* Pending Items */}
      <SectionCard title="Pending Review" colors={colors}>
        {pendingEntities.length === 0 ? (
          <ThemedText style={[styles.emptyText, { color: colors.textTertiary }]}>
            Nothing pending
          </ThemedText>
        ) : (
          pendingEntities.map((entity) => (
            <View
              key={entity.id}
              style={[styles.listRow, { borderBottomColor: colors.border }]}
            >
              <View
                style={[
                  styles.complianceDot,
                  { backgroundColor: COMPLIANCE_STATUS_COLORS[entity.status] ?? '#A1A1AA' },
                ]}
              />
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                  {entity.name}
                </ThemedText>
                <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                  {entity.type} · {entity.teamName} · Expires: {entity.expiresAt}
                </ThemedText>
                {entity.notes && (
                  <ThemedText style={[styles.captionText, { color: '#F59E0B' }]}>
                    {entity.notes}
                  </ThemedText>
                )}
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Compliance Doc Checklist */}
      <SectionCard title="Compliance Summary" colors={colors}>
        {COMPLIANCE_SUMMARIES.map((summary) => (
          <View
            key={summary.workspace}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name={summary.icon as any} size={18} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {summary.label}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {summary.approved} approved · {summary.pending} pending · {summary.flagged} flagged
              </ThemedText>
            </View>
            <ThemedText style={[styles.bodyText, { color: colors.text }]}>
              {summary.total}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// FINANCE TAB (C1/C2 ONLY)
// =============================================================================

function FinanceTab({
  colors,
  series,
}: {
  colors: typeof Colors.light;
  series: SeriesObject;
}) {
  return (
    <View>
      <SectionCard title="Revenue Overview" colors={colors}>
        <View style={styles.financeGrid}>
          <FinanceCard
            label="Total Revenue"
            value="$2.4M"
            subtitle="Season to date"
            color="#22C55E"
            colors={colors}
          />
          <FinanceCard
            label="Sponsorship"
            value="$1.6M"
            subtitle="3 sponsors active"
            color="#1D9BF0"
            colors={colors}
          />
        </View>
      </SectionCard>

      <SectionCard title="Expense Overview" colors={colors}>
        <View style={styles.financeGrid}>
          <FinanceCard
            label="Total Expenses"
            value="$1.8M"
            subtitle="Season to date"
            color="#EF4444"
            colors={colors}
          />
          <FinanceCard
            label="Prize Pool"
            value="$600K"
            subtitle="Allocated across 8 events"
            color="#F59E0B"
            colors={colors}
          />
        </View>
      </SectionCard>

      <SectionCard title="Budget Health" colors={colors}>
        <View style={styles.statRow}>
          <StatBlock label="Net" value="+$600K" color="#22C55E" colors={colors} />
          <StatBlock label="Runway" value="16 wks" color="#1D9BF0" colors={colors} />
          <StatBlock
            label="Status"
            value={series.financeReady ? 'Ready' : 'Pending'}
            color={series.financeReady ? '#22C55E' : '#F59E0B'}
            colors={colors}
          />
        </View>
      </SectionCard>
    </View>
  );
}

function FinanceCard({
  label,
  value,
  subtitle,
  color,
  colors,
}: {
  label: string;
  value: string;
  subtitle: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[styles.financeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
      <ThemedText style={[styles.financeValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
        {subtitle}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// PAYMENT RAILS TAB (C1/C2 ONLY)
// =============================================================================

function PaymentRailsTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Payout Status" colors={colors}>
        {PAYOUT_ITEMS.map((item) => (
          <View
            key={item.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.payoutStatusBadge,
                { backgroundColor: (PAYOUT_STATUS_COLORS[item.status] ?? '#A1A1AA') + '22' },
              ]}
            >
              <ThemedText
                style={[
                  styles.payoutStatusText,
                  { color: PAYOUT_STATUS_COLORS[item.status] ?? '#A1A1AA' },
                ]}
              >
                {item.status.toUpperCase()}
              </ThemedText>
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.entrantName}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {item.amount} · Gates: {item.gatesCleared}/{item.gatesTotal}
              </ThemedText>
              {item.reason && (
                <ThemedText style={[styles.captionText, { color: '#F59E0B' }]}>
                  {item.reason}
                </ThemedText>
              )}
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// VENUES TAB
// =============================================================================

const VENUE_LIST = [
  { id: 'v-1', name: 'Laguna Seca Raceway', location: 'Monterey, CA', capacity: '8,500', surface: 'Asphalt', certification: 'FIA Grade C' },
  { id: 'v-2', name: 'Portland International Raceway', location: 'Portland, OR', capacity: '12,000', surface: 'Asphalt', certification: 'FIA Grade C' },
  { id: 'v-3', name: 'COTA Karting Circuit', location: 'Austin, TX', capacity: '15,000', surface: 'Asphalt', certification: 'FIA Grade B' },
  { id: 'v-4', name: 'Road Atlanta', location: 'Braselton, GA', capacity: '10,000', surface: 'Asphalt', certification: 'FIA Grade C' },
  { id: 'v-5', name: 'Barber Motorsports Park', location: 'Birmingham, AL', capacity: '9,000', surface: 'Asphalt', certification: 'FIA Grade C' },
  { id: 'v-6', name: 'Virginia International Raceway', location: 'Alton, VA', capacity: '7,000', surface: 'Asphalt', certification: 'FIA Grade C' },
];

function VenuesTab({ colors }: { colors: typeof Colors.light }) {
  return (
    <View>
      <SectionCard title="Venues" colors={colors}>
        {VENUE_LIST.map((venue) => (
          <View
            key={venue.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="mappin.and.ellipse" size={18} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {venue.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {venue.location} · Capacity: {venue.capacity}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                {venue.surface} · {venue.certification}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// SPONSORS TAB
// =============================================================================

function SponsorsTab({ colors }: { colors: typeof Colors.light }) {
  const sponsors = [
    { id: 'sp-1', name: 'Nike', tier: 'Title Sponsor', deliverables: 4, delivered: 2, status: 'active' },
    { id: 'sp-2', name: 'Red Bull', tier: 'Energy Partner', deliverables: 3, delivered: 2, status: 'active' },
    { id: 'sp-3', name: 'Pirelli', tier: 'Technical Partner', deliverables: 2, delivered: 1, status: 'renewal' },
  ];

  return (
    <View>
      <SectionCard title="Sponsor Partners" colors={colors}>
        {sponsors.map((sponsor) => (
          <View
            key={sponsor.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {sponsor.name}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {sponsor.tier}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textTertiary }]}>
                Deliverables: {sponsor.delivered}/{sponsor.deliverables} complete
              </ThemedText>
            </View>
            <View
              style={[
                styles.sponsorStatusBadge,
                {
                  backgroundColor:
                    sponsor.status === 'active' ? '#22C55E22' : '#F59E0B22',
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.sponsorStatusText,
                  {
                    color: sponsor.status === 'active' ? '#22C55E' : '#F59E0B',
                  },
                ]}
              >
                {sponsor.status.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </SectionCard>

      {/* Upcoming Deliverables */}
      <SectionCard title="Upcoming Deliverables" colors={colors}>
        {SPONSOR_DELIVERABLES.map((d) => (
          <View
            key={d.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <View
              style={[
                styles.deliverableStatusDot,
                { backgroundColor: DELIVERABLE_STATUS_COLORS[d.status] ?? '#A1A1AA' },
              ]}
            />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {d.sponsorName}: {d.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                Due: {d.dueDate} · Owner: {d.owner}
              </ThemedText>
            </View>
            <ThemedText
              style={[
                styles.statusLabel,
                { color: DELIVERABLE_STATUS_COLORS[d.status] ?? '#A1A1AA' },
              ]}
            >
              {d.status.replace('_', ' ').toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// MEDIA TAB
// =============================================================================

function MediaTab({ colors }: { colors: typeof Colors.light }) {
  const broadcastInfo = [
    { id: 'br-1', label: 'Primary Broadcast', value: 'K-1 Racing Live Stream' },
    { id: 'br-2', label: 'Secondary', value: 'YouTube · K1Racing Channel' },
    { id: 'br-3', label: 'Commentary Team', value: 'Alex Turner, Maria Rodriguez' },
    { id: 'br-4', label: 'Production', value: 'In-house · 6 cameras + drone' },
  ];

  const contentSchedule = [
    { id: 'cs-1', title: 'Pre-Race Build-Up Package', time: 'Sun 12:00 PM', status: 'scheduled' },
    { id: 'cs-2', title: 'Grid Walk Live Stream', time: 'Sun 1:30 PM', status: 'scheduled' },
    { id: 'cs-3', title: 'Race Broadcast', time: 'Sun 2:00 PM', status: 'scheduled' },
    { id: 'cs-4', title: 'Post-Race Highlights Reel', time: 'Sun 5:00 PM', status: 'scheduled' },
    { id: 'cs-5', title: 'Driver Interview Package', time: 'Sun 6:00 PM', status: 'scheduled' },
  ];

  return (
    <View>
      <SectionCard title="Broadcast Info" colors={colors}>
        {broadcastInfo.map((item) => (
          <View
            key={item.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <ThemedText style={[styles.mediaLabel, { color: colors.textSecondary }]}>
              {item.label}
            </ThemedText>
            <ThemedText style={[styles.mediaValue, { color: colors.text }]}>
              {item.value}
            </ThemedText>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Content Schedule" colors={colors}>
        {contentSchedule.map((item) => (
          <View
            key={item.id}
            style={[styles.listRow, { borderBottomColor: colors.border }]}
          >
            <IconSymbol name="play.rectangle.fill" size={16} color={colors.textSecondary} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <ThemedText style={[styles.listRowTitle, { color: colors.text }]}>
                {item.title}
              </ThemedText>
              <ThemedText style={[styles.captionText, { color: colors.textSecondary }]}>
                {item.time}
              </ThemedText>
            </View>
            <ThemedText style={[styles.statusLabel, { color: '#1D9BF0' }]}>
              {item.status.toUpperCase()}
            </ThemedText>
          </View>
        ))}
      </SectionCard>
    </View>
  );
}

// =============================================================================
// SHARED UI COMPONENTS
// =============================================================================

function SectionCard({
  title,
  colors,
  children,
}: {
  title: string;
  colors: typeof Colors.light;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>{title}</ThemedText>
      {children}
    </View>
  );
}

function StatBlock({
  label,
  value,
  color,
  colors,
}: {
  label: string;
  value: string;
  color: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={styles.statBlock}>
      <ThemedText style={[styles.statValue, { color }]}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ActionButton({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={[styles.actionButton, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <IconSymbol name={icon as any} size={16} color={colors.textSecondary} />
      <ThemedText style={[styles.actionButtonText, { color: colors.textSecondary }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  // Header
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  seriesName: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  seasonLabel: {
    fontSize: 13,
    marginTop: 2,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  formatPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  formatPillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
  },
  nextDate: {
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  quickChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: Spacing.lg,
    marginTop: Spacing.md,
  },
  actionIconWrap: {
    alignItems: 'center',
    gap: 4,
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconLabel: {
    fontSize: 10,
  },

  // Tab bar
  tabBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Scroll content
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },

  // Section card
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },

  // Text styles
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
  },
  captionText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  // Ops readiness
  opsReadinessStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  opsReadinessItem: {
    alignItems: 'center',
    gap: 2,
    minWidth: 64,
  },
  opsReadinessIcon: {
    fontSize: 16,
  },
  opsReadinessLabel: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Stat row
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statBlock: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // List row
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  listRowTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Deliverable status dot
  deliverableStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Calendar
  calendarStatusBar: {
    width: 3,
    height: 32,
    borderRadius: 2,
  },

  // Events
  eventStatusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Standings table
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  tableHeaderCell: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tableCell: {
    fontSize: 13,
  },
  rankCol: {
    width: 28,
  },
  nameCol: {
    flex: 1,
  },
  numCol: {
    width: 48,
    textAlign: 'right',
  },
  teamColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Ops
  opsStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  opsStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  flagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  impactFlag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  impactFlagText: {
    fontSize: 9,
    fontWeight: '600',
  },

  // Rules
  visibilityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  visibilityText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Compliance
  complianceDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // Finance
  financeGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  financeCard: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: 2,
  },
  financeValue: {
    fontSize: 20,
    fontWeight: '700',
  },

  // Payment rails
  payoutStatusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    minWidth: 60,
    alignItems: 'center',
  },
  payoutStatusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Sponsors
  sponsorStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  sponsorStatusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Media
  mediaLabel: {
    fontSize: 12,
    fontWeight: '600',
    width: 100,
  },
  mediaValue: {
    fontSize: 13,
    flex: 1,
  },

  // Action buttons
  actionButtonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
