/**
 * Competition Dashboard V2 — 14 RBAC-gated modules for the Adidas 3SSB Mode.
 * Modules are conditionally rendered based on CompetitionRoleLens (C1–C4).
 * Default demo role: league_admin (C1) — full access.
 */

import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';

// RBAC utilities
import {
  mapRoleToCompetitionLens,
  getDashboardModules,
  canSeeModule,
  getQuickActions,
  isFullAccess,
} from '@/utils/competition-rbac';
import type { CompetitionRoleLens, DashboardModule, QuickAction } from '@/utils/competition-rbac';

// Competition v2 data
import {
  TEAM_STANDINGS,
  OPS_TASKS,
  ANNOUNCEMENTS,
  STAFF_DIRECTORY,
  COMPLIANCE_AUDIT_LOG,
  SPONSOR_DELIVERABLES,
  STANDINGS_GATES,
  SERIES_LIST,
  EVENT_LIST,
} from '@/data/mock-competition-v2';
import type {
  TeamStanding,
  OpsTask,
  Announcement,
  StaffMember,
  ComplianceAuditEntry,
  SponsorDeliverable,
} from '@/data/mock-competition-v2';

// Broadcast hero
import { CompetitionHeroVideoCard } from '@/components/dashboard/competition-hero-video-card';

// CEO competition data
import {
  CEO_NOW,
  CEO_APPROVALS,
  HARD_GATES,
  AGENDA_SESSIONS,
  SEVERITY_COLOR,
} from '@/data/mock-ceo-competition';
import type { CEONowItem, HardGate } from '@/data/mock-ceo-competition';

// =============================================================================
// TYPES
// =============================================================================


const ACCENT = MODE_ACCENT.competition;
interface Props {
  colors: typeof Colors.light;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const roleLens: CompetitionRoleLens = mapRoleToCompetitionLens('league_admin');
const modules = getDashboardModules(roleLens);
const quickActions = getQuickActions(roleLens);

const SEVERITY_ICON: Record<string, string> = {
  urgent: 'exclamationmark.triangle.fill',
  important: 'exclamationmark.circle.fill',
  info: 'info.circle.fill',
};

const SEVERITY_BADGE_COLOR: Record<string, string> = {
  urgent: '#EF4444',
  important: '#F59E0B',
  info: ACCENT,
};

const AUDIENCE_COLOR: Record<string, string> = {
  staff: ACCENT,
  teams: ACCENT,
  public: '#22C55E',
};

const TASK_STATUS_COLOR: Record<string, string> = {
  blocker: '#EF4444',
  open: '#F59E0B',
  done: '#22C55E',
};

const GATE_COLOR: Record<string, string> = {
  cleared: '#22C55E',
  pending: '#F59E0B',
  blocked: '#EF4444',
};

const DELIVERABLE_STATUS_COLOR: Record<string, string> = {
  on_track: '#22C55E',
  at_risk: '#F59E0B',
  overdue: '#EF4444',
  delivered: ACCENT,
};

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[s.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      {children}
    </View>
  );
}

function CTAButton({
  label,
  icon,
  colors,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={[s.ctaButton, { borderColor: colors.borderStrong }]}>
      <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />
      <ThemedText style={[s.ctaLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </Pressable>
  );
}

function KPITile({
  value,
  label,
  colors,
}: {
  value: string;
  label: string;
  colors: typeof Colors.light;
}) {
  return (
    <View style={[s.kpiTile, { backgroundColor: colors.backgroundTertiary }]}>
      <ThemedText style={[s.kpiValue, { color: colors.text }]}>{value}</ThemedText>
      <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

function ActionChip({
  action,
  colors,
}: {
  action: QuickAction;
  colors: typeof Colors.light;
}) {
  return (
    <Pressable style={[s.chip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
      <IconSymbol name={action.icon as any} size={14} color={colors.textSecondary} />
      <ThemedText style={[s.chipLabel, { color: colors.text }]}>{action.label}</ThemedText>
    </Pressable>
  );
}

function LiveDot() {
  return <View style={s.liveDot} />;
}

// =============================================================================
// MODULE 1 — Competition Header
// =============================================================================

function CompetitionHeader({ colors }: { colors: typeof Colors.light }) {
  const series = SERIES_LIST[0];
  return (
    <View style={s.moduleContainer}>
      {/* Logo placeholder + title */}
      <View style={s.headerRow}>
        <View style={[s.logoPlaceholder, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="flag.checkered" size={28} color={colors.text} />
        </View>
        <View style={s.headerTextBlock}>
          <ThemedText style={[s.headerTitle, { color: colors.text }]}>
            {series?.name ?? '3 Stripes Select Basketball'}
          </ThemedText>
          <ThemedText style={[s.headerSubtitle, { color: colors.textSecondary }]}>
            League {'\u00B7'} Motorsport {'\u00B7'} International
          </ThemedText>
        </View>
      </View>

      {/* KPI tiles */}
      <View style={s.kpiRow}>
        <KPITile value="16" label="Entries" colors={colors} />
        <KPITile value="8" label="Events" colors={colors} />
        <KPITile value="Mid-Season" label="Phase" colors={colors} />
        <KPITile value="2" label="Broadcasts" colors={colors} />
      </View>

      {/* Quick action chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipScroll}>
        {quickActions.map((qa) => (
          <ActionChip key={qa.id} action={qa} colors={colors} />
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// MODULE 2 — Today + Next
// =============================================================================

function TodayNext({ colors }: { colors: typeof Colors.light }) {
  const nowItems = CEO_NOW.slice(0, 2);
  const nextGate = HARD_GATES.find((g) => g.status === 'upcoming') ?? HARD_GATES[0];

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="TODAY + NEXT" colors={colors} />

      {/* Today block */}
      <Card colors={colors}>
        <ThemedText style={[s.cardHeading, { color: colors.text }]}>Today</ThemedText>
        {nowItems.map((item: CEONowItem) => (
          <View key={item.id} style={s.todayItem}>
            <IconSymbol
              name={item.icon as any}
              size={16}
              color={item.urgency === 'critical' ? '#EF4444' : item.urgency === 'high' ? '#F59E0B' : colors.textSecondary}
            />
            <View style={s.todayText}>
              <ThemedText style={[s.todayLabel, { color: colors.text }]}>{item.label}</ThemedText>
              <ThemedText style={[s.todayDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.detail}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>

      {/* Next milestone */}
      {nextGate && (
        <Card colors={colors}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Next Milestone</ThemedText>
          <View style={s.todayItem}>
            <View style={[s.gateDot, { backgroundColor: GATE_COLOR[nextGate.status] ?? colors.textTertiary }]} />
            <View style={s.todayText}>
              <ThemedText style={[s.todayLabel, { color: colors.text }]}>{nextGate.title}</ThemedText>
              <ThemedText style={[s.todayDetail, { color: colors.textSecondary }]}>
                {nextGate.deadline} {'\u00B7'} {nextGate.owner}
              </ThemedText>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// MODULE 3 — Live Status Panel
// =============================================================================

function LiveStatusPanel({ colors }: { colors: typeof Colors.light }) {
  const liveSessions = AGENDA_SESSIONS.filter((sess) => sess.liveState === 'live');
  const alerts = CEO_NOW.filter((n) => n.urgency === 'critical');

  // Only show when there is live content
  if (liveSessions.length === 0 && alerts.length === 0) return null;

  return (
    <View style={s.moduleContainer}>
      <View style={s.liveSectionRow}>
        <LiveDot />
        <SectionHeader title="LIVE NOW" colors={colors} />
      </View>

      {/* Live sessions */}
      <Card colors={colors}>
        {liveSessions.map((session) => (
          <View key={session.id} style={s.liveSessionRow}>
            <IconSymbol name={session.icon as any} size={16} color="#EF4444" />
            <View style={s.todayText}>
              <ThemedText style={[s.todayLabel, { color: colors.text }]}>{session.name}</ThemedText>
              <ThemedText style={[s.todayDetail, { color: colors.textSecondary }]}>
                {session.time} {'\u00B7'} {session.track}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>

      {/* Alerts strip */}
      {alerts.length > 0 && (
        <Card colors={colors}>
          <ThemedText style={[s.cardHeading, { color: '#EF4444' }]}>Alerts</ThemedText>
          {alerts.map((a) => (
            <View key={a.id} style={s.alertRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#EF4444" />
              <ThemedText style={[s.alertText, { color: colors.text }]} numberOfLines={2}>
                {a.label} {'\u2014'} {a.detail}
              </ThemedText>
            </View>
          ))}
        </Card>
      )}

      {/* Quick buttons */}
      <View style={s.quickButtonRow}>
        <CTAButton label="Open Live Ops" icon="antenna.radiowaves.left.and.right" colors={colors} />
        <CTAButton label="Post Update" icon="megaphone.fill" colors={colors} />
        <CTAButton label="Message Staff" icon="envelope.fill" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// MODULE 4 — Format Snapshot
// =============================================================================

function FormatSnapshot({ colors }: { colors: typeof Colors.light }) {
  const stages = [
    { label: 'Registration', icon: 'person.badge.plus', detail: 'Entry & credentials verified' },
    { label: 'Qualifying', icon: 'stopwatch.fill', detail: 'Q1/Q2/Q3 knockout format' },
    { label: 'Race Day', icon: 'flag.checkered', detail: '65 laps — feature race' },
  ];

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="FORMAT SNAPSHOT" colors={colors} />
      <Card colors={colors}>
        <ThemedText style={[s.cardHeading, { color: colors.text }]}>How it works</ThemedText>

        {/* Stages */}
        {stages.map((stage, i) => (
          <View key={stage.label} style={s.stageRow}>
            <View style={s.stageIndicator}>
              <View style={[s.stageCircle, { backgroundColor: colors.backgroundTertiary, borderColor: colors.borderStrong }]}>
                <IconSymbol name={stage.icon as any} size={14} color={colors.text} />
              </View>
              {i < stages.length - 1 && <View style={[s.stageLine, { backgroundColor: colors.border }]} />}
            </View>
            <View style={s.stageContent}>
              <ThemedText style={[s.stageLabel, { color: colors.text }]}>{stage.label}</ThemedText>
              <ThemedText style={[s.stageDetail, { color: colors.textSecondary }]}>{stage.detail}</ThemedText>
            </View>
          </View>
        ))}

        {/* Points system */}
        <View style={[s.pointsSummary, { borderTopColor: colors.border }]}>
          <ThemedText style={[s.pointsTitle, { color: colors.textSecondary }]}>Points System</ThemedText>
          <ThemedText style={[s.pointsBody, { color: colors.textSecondary }]}>
            P1: 25 pts {'\u00B7'} P2: 18 {'\u00B7'} P3: 15 {'\u00B7'} Pole: +3 {'\u00B7'} Fastest Lap: +1
          </ThemedText>
        </View>

        {/* Eligibility */}
        <View style={[s.eligibilityNote, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="info.circle.fill" size={14} color={colors.textSecondary} />
          <ThemedText style={[s.eligibilityText, { color: colors.textSecondary }]}>
            Minimum 8 of 12 rounds required for championship eligibility. Driver lineup declared 48h before each event.
          </ThemedText>
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// MODULE 5 — Standings / Bracket
// =============================================================================

function StandingsBracket({ colors }: { colors: typeof Colors.light }) {
  const topEight = TEAM_STANDINGS.slice(0, 8);

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="STANDINGS" colors={colors} />
      <Card colors={colors}>
        {/* Table header */}
        <View style={s.standingsHeaderRow}>
          <ThemedText style={[s.standingsColRank, s.colHeader, { color: colors.textTertiary }]}>#</ThemedText>
          <ThemedText style={[s.standingsColName, s.colHeader, { color: colors.textTertiary }]}>Team</ThemedText>
          <ThemedText style={[s.standingsColPts, s.colHeader, { color: colors.textTertiary }]}>PTS</ThemedText>
          <ThemedText style={[s.standingsColWins, s.colHeader, { color: colors.textTertiary }]}>W</ThemedText>
          <ThemedText style={[s.standingsColGap, s.colHeader, { color: colors.textTertiary }]}>Gap</ThemedText>
        </View>

        {topEight.map((team: TeamStanding, idx: number) => (
          <View
            key={team.teamId}
            style={[
              s.standingsRow,
              idx < topEight.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <ThemedText style={[s.standingsColRank, { color: colors.textSecondary }]}>{team.position}</ThemedText>
            <View style={[s.standingsColName, s.standingsNameCell]}>
              <View style={[s.teamDot, { backgroundColor: team.teamColor }]} />
              <ThemedText style={[s.teamNameText, { color: colors.text }]} numberOfLines={1}>
                {team.teamName}
              </ThemedText>
            </View>
            <ThemedText style={[s.standingsColPts, { color: colors.text }]}>{team.points}</ThemedText>
            <ThemedText style={[s.standingsColWins, { color: colors.textSecondary }]}>{team.wins}</ThemedText>
            <ThemedText style={[s.standingsColGap, { color: team.gap === 'Leader' ? '#22C55E' : colors.textSecondary }]}>
              {team.gap}
            </ThemedText>
          </View>
        ))}
      </Card>

      <CTAButton label="Open Full Standings" icon="chart.bar.fill" colors={colors} />
    </View>
  );
}

// =============================================================================
// MODULE 6 — Schedule Snapshot
// =============================================================================

function ScheduleSnapshot({ colors }: { colors: typeof Colors.light }) {
  const upcomingSessions = AGENDA_SESSIONS.filter((sess) => sess.liveState === 'not_started').slice(0, 5);

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="SCHEDULE" colors={colors} />
      <Card colors={colors}>
        {upcomingSessions.map((session, idx) => (
          <View
            key={session.id}
            style={[
              s.scheduleRow,
              idx < upcomingSessions.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name={session.icon as any} size={16} color={colors.textSecondary} />
            <View style={s.scheduleText}>
              <ThemedText style={[s.scheduleLabel, { color: colors.text }]}>{session.name}</ThemedText>
              <ThemedText style={[s.scheduleTime, { color: colors.textSecondary }]}>
                {session.time} {'\u00B7'} {session.track}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>

      <CTAButton label="Open Calendar" icon="calendar" colors={colors} />
    </View>
  );
}

// =============================================================================
// MODULE 7 — Media + Storylines
// =============================================================================

function MediaStorylines({ colors }: { colors: typeof Colors.light }) {
  const headlines = [
    {
      id: 'h-1',
      title: 'Vasquez vs Patel: Championship gap narrows to 22 points',
      subtitle: 'Can Patel close the gap in the final 3 rounds?',
      icon: 'trophy.fill',
    },
    {
      id: 'h-2',
      title: 'Williams tire blow-out sparks safety review',
      subtitle: 'All teams ordered to check pressures. Pirelli batch under analysis.',
      icon: 'exclamationmark.triangle.fill',
    },
    {
      id: 'h-3',
      title: 'Shadow GP engine seal saga — decision before race day',
      subtitle: 'Commissioner must rule on engine swap before Sunday.',
      icon: 'wrench.and.screwdriver.fill',
    },
  ];

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="MEDIA + STORYLINES" colors={colors} />

      {headlines.map((h) => (
        <Card key={h.id} colors={colors}>
          <View style={s.headlineRow}>
            <IconSymbol name={h.icon as any} size={18} color={colors.textSecondary} />
            <View style={s.headlineText}>
              <ThemedText style={[s.headlineTitle, { color: colors.text }]}>{h.title}</ThemedText>
              <ThemedText style={[s.headlineSubtitle, { color: colors.textSecondary }]}>{h.subtitle}</ThemedText>
            </View>
          </View>
        </Card>
      ))}

      {isFullAccess(roleLens) && (
        <View style={s.quickButtonRow}>
          <CTAButton label="Post Highlight" icon="play.rectangle.fill" colors={colors} />
          <CTAButton label="Publish Recap" icon="doc.text.fill" colors={colors} />
        </View>
      )}
    </View>
  );
}

// =============================================================================
// MODULE 8 — Announcements
// =============================================================================

function AnnouncementsModule({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="ANNOUNCEMENTS" colors={colors} />

      {ANNOUNCEMENTS.map((ann: Announcement) => (
        <Card key={ann.id} colors={colors}>
          <View style={s.announcementRow}>
            <IconSymbol
              name={(SEVERITY_ICON[ann.severity] ?? 'info.circle.fill') as any}
              size={16}
              color={SEVERITY_BADGE_COLOR[ann.severity] ?? colors.textSecondary}
            />
            <View style={s.announcementText}>
              <View style={s.announcementHeader}>
                <ThemedText style={[s.announcementTitle, { color: colors.text }]} numberOfLines={1}>
                  {ann.title}
                </ThemedText>
                <View style={[s.audienceBadge, { backgroundColor: (AUDIENCE_COLOR[ann.audience] ?? colors.textTertiary) + '20' }]}>
                  <ThemedText style={[s.audienceBadgeText, { color: AUDIENCE_COLOR[ann.audience] ?? colors.textTertiary }]}>
                    {ann.audience.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.announcementContent, { color: colors.textSecondary }]} numberOfLines={2}>
                {ann.content}
              </ThemedText>
              <ThemedText style={[s.announcementDate, { color: colors.textTertiary }]}>{ann.postedAt}</ThemedText>
            </View>
          </View>
        </Card>
      ))}
    </View>
  );
}

// =============================================================================
// MODULE 9 — Ops Taskboard (C1/C2 only)
// =============================================================================

function OpsTaskboard({ colors }: { colors: typeof Colors.light }) {
  const now = OPS_TASKS.filter((t) => t.status === 'blocker');
  const today = OPS_TASKS.filter((t) => t.status === 'open' && t.deadline.startsWith('Today'));
  const thisWeek = OPS_TASKS.filter((t) => t.status === 'open' && !t.deadline.startsWith('Today'));

  const renderColumn = (title: string, tasks: OpsTask[]) => {
    if (tasks.length === 0) return null;
    return (
      <View style={s.opsColumn}>
        <ThemedText style={[s.opsColumnTitle, { color: colors.textSecondary }]}>{title}</ThemedText>
        {tasks.map((task) => (
          <View key={task.id} style={[s.opsTaskCard, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
            <View style={s.opsTaskHeader}>
              <View style={[s.taskStatusDot, { backgroundColor: TASK_STATUS_COLOR[task.status] ?? colors.textTertiary }]} />
              <ThemedText style={[s.opsTaskTitle, { color: colors.text }]} numberOfLines={2}>
                {task.title}
              </ThemedText>
            </View>
            <ThemedText style={[s.opsTaskMeta, { color: colors.textSecondary }]}>
              {task.owner} {'\u00B7'} {task.deadline}
            </ThemedText>
            {task.impactFlags.length > 0 && (
              <View style={s.impactRow}>
                {task.impactFlags.map((flag) => (
                  <View key={flag} style={[s.impactBadge, { backgroundColor: '#EF444420' }]}>
                    <ThemedText style={[s.impactBadgeText, { color: '#EF4444' }]}>{flag}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="OPS TASKBOARD" colors={colors} />
      <Card colors={colors}>
        {renderColumn('NOW', now)}
        {renderColumn('TODAY', today)}
        {renderColumn('THIS WEEK', thisWeek)}
      </Card>

      <View style={s.quickButtonRow}>
        <CTAButton label="Add Task" icon="plus.circle.fill" colors={colors} />
        <CTAButton label="Assign" icon="person.badge.plus" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// MODULE 10 — Staff + Contacts
// =============================================================================

function StaffContacts({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="STAFF + CONTACTS" colors={colors} />
      <Card colors={colors}>
        {STAFF_DIRECTORY.map((member: StaffMember, idx: number) => (
          <View
            key={member.id}
            style={[
              s.staffRow,
              idx < STAFF_DIRECTORY.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.staffAvatar, { backgroundColor: colors.backgroundTertiary }]}>
              <ThemedText style={[s.staffInitials, { color: colors.text }]}>
                {member.name.split(' ').map((n) => n[0]).join('')}
              </ThemedText>
            </View>
            <View style={s.staffInfo}>
              <ThemedText style={[s.staffName, { color: colors.text }]}>{member.name}</ThemedText>
              <ThemedText style={[s.staffRole, { color: colors.textSecondary }]}>
                {member.role} {'\u00B7'} {member.department}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// MODULE 11 — Officials / Compliance (C1/C2 only)
// =============================================================================

function OfficialsCompliance({ colors }: { colors: typeof Colors.light }) {
  const incidents = COMPLIANCE_AUDIT_LOG.filter((e) => e.action === 'Flagged').length;
  const pending = COMPLIANCE_AUDIT_LOG.filter((e) => e.action === 'Pending').length;
  const eligibility = COMPLIANCE_AUDIT_LOG.filter((e) => e.workspace === 'eligibility').length;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="OFFICIALS / COMPLIANCE" colors={colors} />
      <Card colors={colors}>
        <View style={s.complianceKPIRow}>
          <View style={s.complianceKPIItem}>
            <ThemedText style={[s.complianceKPIValue, { color: '#EF4444' }]}>{incidents}</ThemedText>
            <ThemedText style={[s.complianceKPILabel, { color: colors.textSecondary }]}>Flagged</ThemedText>
          </View>
          <View style={[s.complianceDivider, { backgroundColor: colors.border }]} />
          <View style={s.complianceKPIItem}>
            <ThemedText style={[s.complianceKPIValue, { color: '#F59E0B' }]}>{pending}</ThemedText>
            <ThemedText style={[s.complianceKPILabel, { color: colors.textSecondary }]}>Pending</ThemedText>
          </View>
          <View style={[s.complianceDivider, { backgroundColor: colors.border }]} />
          <View style={s.complianceKPIItem}>
            <ThemedText style={[s.complianceKPIValue, { color: colors.text }]}>{eligibility}</ThemedText>
            <ThemedText style={[s.complianceKPILabel, { color: colors.textSecondary }]}>Eligibility</ThemedText>
          </View>
        </View>
      </Card>

      <View style={s.quickButtonRow}>
        <CTAButton label="Open Incident Log" icon="exclamationmark.triangle.fill" colors={colors} />
        <CTAButton label="Open Eligibility Queue" icon="person.text.rectangle" colors={colors} />
      </View>
    </View>
  );
}

// =============================================================================
// MODULE 12 — Sponsors + Revenue
// =============================================================================

function SponsorsRevenue({ colors }: { colors: typeof Colors.light }) {
  const sponsors = [
    { name: 'Nike', type: 'Title Sponsor', color: '#FFFFFF' },
    { name: 'Red Bull', type: 'Energy Partner', color: '#EF4444' },
    { name: 'Pirelli', type: 'Tire Supplier', color: '#F59E0B' },
  ];

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="SPONSORS + REVENUE" colors={colors} />

      {/* Sponsor tiles */}
      <View style={s.sponsorRow}>
        {sponsors.map((sp) => (
          <View key={sp.name} style={[s.sponsorTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[s.sponsorIcon, { backgroundColor: sp.color + '20' }]}>
              <ThemedText style={[s.sponsorLetter, { color: sp.color }]}>{sp.name[0]}</ThemedText>
            </View>
            <ThemedText style={[s.sponsorName, { color: colors.text }]}>{sp.name}</ThemedText>
            <ThemedText style={[s.sponsorType, { color: colors.textSecondary }]}>{sp.type}</ThemedText>
          </View>
        ))}
      </View>

      {/* Revenue card — C1 only */}
      {roleLens === 'CO1' && (
        <Card colors={colors}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Revenue YTD</ThemedText>
          <View style={s.revenueGrid}>
            <View style={s.revenueItem}>
              <ThemedText style={[s.revenueValue, { color: colors.text }]}>$1.9M</ThemedText>
              <ThemedText style={[s.revenueLabel, { color: colors.textSecondary }]}>Ticketing</ThemedText>
            </View>
            <View style={s.revenueItem}>
              <ThemedText style={[s.revenueValue, { color: colors.text }]}>$1.6M</ThemedText>
              <ThemedText style={[s.revenueLabel, { color: colors.textSecondary }]}>Sponsorship</ThemedText>
            </View>
            <View style={s.revenueItem}>
              <ThemedText style={[s.revenueValue, { color: colors.text }]}>$0.8M</ThemedText>
              <ThemedText style={[s.revenueLabel, { color: colors.textSecondary }]}>Media</ThemedText>
            </View>
            <View style={s.revenueItem}>
              <ThemedText style={[s.revenueValue, { color: '#22C55E' }]}>$4.8M</ThemedText>
              <ThemedText style={[s.revenueLabel, { color: colors.textSecondary }]}>Total YTD</ThemedText>
            </View>
          </View>
        </Card>
      )}
    </View>
  );
}

// =============================================================================
// MODULE 13 — Governance (C1 only)
// =============================================================================

function GovernanceModule({ colors }: { colors: typeof Colors.light }) {
  const pendingApprovals = CEO_APPROVALS.filter((a) => a.status === 'pending');

  const boardDocs = [
    { id: 'bd-1', label: '2026 Season Rulebook', icon: 'doc.text.fill' },
    { id: 'bd-2', label: 'Cost Cap Regulations', icon: 'dollarsign.circle.fill' },
    { id: 'bd-3', label: 'Board Meeting Minutes — Jul 2026', icon: 'doc.richtext.fill' },
  ];

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="GOVERNANCE" colors={colors} />

      {/* Board docs */}
      <Card colors={colors}>
        <ThemedText style={[s.cardHeading, { color: colors.text }]}>Board Documents</ThemedText>
        {boardDocs.map((doc, idx) => (
          <View
            key={doc.id}
            style={[
              s.docRow,
              idx < boardDocs.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name={doc.icon as any} size={16} color={colors.textSecondary} />
            <ThemedText style={[s.docLabel, { color: colors.text }]}>{doc.label}</ThemedText>
            <IconSymbol name="chevron.right" size={12} color={colors.textTertiary} />
          </View>
        ))}
      </Card>

      {/* Approvals queue */}
      <Card colors={colors}>
        <View style={s.approvalHeaderRow}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Approvals Queue</ThemedText>
          <View style={[s.approvalCountBadge, { backgroundColor: '#EF444420' }]}>
            <ThemedText style={[s.approvalCountText, { color: '#EF4444' }]}>{pendingApprovals.length}</ThemedText>
          </View>
        </View>
        {pendingApprovals.slice(0, 3).map((ap, idx) => (
          <View
            key={ap.id}
            style={[
              s.approvalRow,
              idx < Math.min(pendingApprovals.length, 3) - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={s.approvalContent}>
              <ThemedText style={[s.approvalTitle, { color: colors.text }]} numberOfLines={1}>
                {ap.title}
              </ThemedText>
              <ThemedText style={[s.approvalMeta, { color: colors.textSecondary }]}>
                {ap.requestedBy} {'\u00B7'} {ap.requestDate}
                {ap.amount ? ` \u00B7 ${ap.amount}` : ''}
              </ThemedText>
            </View>
            <View style={[s.urgencyBadge, { backgroundColor: (SEVERITY_COLOR[ap.urgency] ?? colors.textTertiary) + '20' }]}>
              <ThemedText style={[s.urgencyBadgeText, { color: SEVERITY_COLOR[ap.urgency] ?? colors.textTertiary }]}>
                {ap.urgency.toUpperCase()}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// MODULE 14 — Audit Trail (C1/C2 only)
// =============================================================================

function AuditTrailModule({ colors }: { colors: typeof Colors.light }) {
  const recentAudit = COMPLIANCE_AUDIT_LOG.slice(0, 5);

  const actionColor = (action: string): string => {
    switch (action) {
      case 'Flagged': return '#EF4444';
      case 'Approved': return '#22C55E';
      case 'Submitted': return ACCENT;
      case 'Pending': return '#F59E0B';
      case 'Initiated': return ACCENT;
      default: return '#A1A1AA';
    }
  };

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="AUDIT TRAIL" colors={colors} />
      <Card colors={colors}>
        {recentAudit.map((entry: ComplianceAuditEntry, idx: number) => (
          <View
            key={entry.id}
            style={[
              s.auditRow,
              idx < recentAudit.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <View style={[s.auditActionBadge, { backgroundColor: actionColor(entry.action) + '20' }]}>
              <ThemedText style={[s.auditActionText, { color: actionColor(entry.action) }]}>
                {entry.action.toUpperCase()}
              </ThemedText>
            </View>
            <View style={s.auditContent}>
              <ThemedText style={[s.auditEntity, { color: colors.text }]} numberOfLines={1}>
                {entry.entity}
              </ThemedText>
              <ThemedText style={[s.auditDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                {entry.details}
              </ThemedText>
              <ThemedText style={[s.auditMeta, { color: colors.textTertiary }]}>
                {entry.actor} {'\u00B7'} {entry.timestamp}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function CompetitionDashboardV2({ colors }: Props) {
  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Module 0 — Broadcast Hero */}
      <CompetitionHeroVideoCard roleLens={roleLens} />

      {/* Module 1 — Competition Header */}
      {canSeeModule('header', roleLens) && (
        <CompetitionHeader colors={colors} />
      )}

      {/* Module 2 — Today + Next */}
      {canSeeModule('today_next', roleLens) && (
        <TodayNext colors={colors} />
      )}

      {/* Module 3 — Live Status Panel */}
      {canSeeModule('live_status', roleLens) && (
        <LiveStatusPanel colors={colors} />
      )}

      {/* Module 4 — Format Snapshot */}
      {canSeeModule('format_snapshot', roleLens) && (
        <FormatSnapshot colors={colors} />
      )}

      {/* Module 5 — Standings / Bracket */}
      {canSeeModule('standings_bracket', roleLens) && (
        <StandingsBracket colors={colors} />
      )}

      {/* Module 6 — Schedule Snapshot */}
      {canSeeModule('schedule_snapshot', roleLens) && (
        <ScheduleSnapshot colors={colors} />
      )}

      {/* Module 7 — Media + Storylines */}
      {canSeeModule('media_storylines', roleLens) && (
        <MediaStorylines colors={colors} />
      )}

      {/* Module 8 — Announcements */}
      {canSeeModule('announcements', roleLens) && (
        <AnnouncementsModule colors={colors} />
      )}

      {/* Module 9 — Ops Taskboard (C1/C2 only) */}
      {canSeeModule('ops_taskboard', roleLens) && (
        <OpsTaskboard colors={colors} />
      )}

      {/* Module 10 — Staff + Contacts */}
      {canSeeModule('staff_contacts', roleLens) && (
        <StaffContacts colors={colors} />
      )}

      {/* Module 11 — Officials / Compliance (C1/C2 only) */}
      {canSeeModule('officials_compliance', roleLens) && (
        <OfficialsCompliance colors={colors} />
      )}

      {/* Module 12 — Sponsors + Revenue */}
      {canSeeModule('sponsors_revenue', roleLens) && (
        <SponsorsRevenue colors={colors} />
      )}

      {/* Module 13 — Governance (C1 only) */}
      {canSeeModule('governance', roleLens) && (
        <GovernanceModule colors={colors} />
      )}

      {/* Module 14 — Audit Trail (C1/C2 only) */}
      {canSeeModule('audit_trail', roleLens) && (
        <AuditTrailModule colors={colors} />
      )}

      {/* Bottom spacer */}
      <View style={s.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  moduleContainer: {
    marginBottom: Spacing.lg,
  },
  bottomSpacer: {
    height: 120,
  },

  // Section header
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },

  // Card
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  cardHeading: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  // Header module
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  logoPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: Spacing.md,
  },
  headerTextBlock: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
  },

  // KPI tiles
  kpiRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  kpiTile: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 11,
  },

  // Chips
  chipScroll: {
    flexDirection: 'row',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Today + Next
  todayItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  todayText: {
    flex: 1,
  },
  todayLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  todayDetail: {
    fontSize: 12,
    lineHeight: 17,
  },
  gateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
  },

  // Live status
  liveSectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveSessionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  alertText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  quickButtonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // CTA button
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  ctaLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Format stages
  stageRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  stageIndicator: {
    width: 32,
    alignItems: 'center',
  },
  stageCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  stageLine: {
    width: 1,
    flex: 1,
    minHeight: 16,
  },
  stageContent: {
    flex: 1,
    marginLeft: Spacing.sm,
    paddingBottom: Spacing.md,
  },
  stageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  stageDetail: {
    fontSize: 12,
  },
  pointsSummary: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    marginTop: Spacing.sm,
  },
  pointsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  pointsBody: {
    fontSize: 12,
    lineHeight: 17,
  },
  eligibilityNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  eligibilityText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },

  // Standings table
  standingsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#2F3336',
    marginBottom: Spacing.xs,
  },
  standingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  colHeader: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  standingsColRank: {
    width: 28,
    fontSize: 13,
    textAlign: 'center',
  },
  standingsColName: {
    flex: 1,
    fontSize: 14,
  },
  standingsNameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  standingsColPts: {
    width: 48,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  standingsColWins: {
    width: 32,
    fontSize: 13,
    textAlign: 'center',
  },
  standingsColGap: {
    width: 56,
    fontSize: 12,
    textAlign: 'right',
  },
  teamDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  teamNameText: {
    flex: 1,
    fontSize: 14,
  },

  // Schedule
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  scheduleText: {
    flex: 1,
  },
  scheduleLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 12,
  },

  // Media headlines
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  headlineText: {
    flex: 1,
  },
  headlineTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 19,
  },
  headlineSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },

  // Announcements
  announcementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  announcementText: {
    flex: 1,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  announcementTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  audienceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  audienceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  announcementContent: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 11,
  },

  // Ops taskboard
  opsColumn: {
    marginBottom: Spacing.md,
  },
  opsColumnTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: Spacing.sm,
  },
  opsTaskCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: StyleSheet.hairlineWidth,
  },
  opsTaskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  taskStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  opsTaskTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  opsTaskMeta: {
    fontSize: 11,
    marginLeft: 16,
  },
  impactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 6,
    marginLeft: 16,
  },
  impactBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  impactBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Staff
  staffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  staffAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  staffInitials: {
    fontSize: 13,
    fontWeight: '600',
  },
  staffInfo: {
    flex: 1,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  staffRole: {
    fontSize: 12,
  },

  // Compliance KPI
  complianceKPIRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  complianceKPIItem: {
    alignItems: 'center',
    flex: 1,
  },
  complianceKPIValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  complianceKPILabel: {
    fontSize: 12,
  },
  complianceDivider: {
    width: 1,
    height: 40,
  },

  // Sponsors
  sponsorRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  sponsorTile: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  sponsorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  sponsorLetter: {
    fontSize: 18,
    fontWeight: '700',
  },
  sponsorName: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  sponsorType: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Revenue
  revenueGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  revenueItem: {
    width: '47%',
    marginBottom: Spacing.xs,
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  revenueLabel: {
    fontSize: 12,
  },

  // Governance docs
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 12,
  },
  docLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },

  // Approvals
  approvalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  approvalCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  approvalCountText: {
    fontSize: 12,
    fontWeight: '700',
  },
  approvalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  approvalContent: {
    flex: 1,
  },
  approvalTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  approvalMeta: {
    fontSize: 11,
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  urgencyBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Audit trail
  auditRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  auditActionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    marginTop: 2,
  },
  auditActionText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  auditContent: {
    flex: 1,
  },
  auditEntity: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  auditDetail: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 4,
  },
  auditMeta: {
    fontSize: 11,
  },
});
