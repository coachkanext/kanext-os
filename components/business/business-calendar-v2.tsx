/**
 * Business Calendar V2 — RBAC-gated calendar with 5 object types,
 * agenda view, and category/status filtering.
 * Default demo role: founder (B1) — full access.
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
  TextInput,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';

// RBAC utilities
import {
  isFounder,
  isBoardLevel,
  isInvestor,
} from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

type ViewMode = 'day' | 'week' | 'month';

type CalendarCategory =
  | 'board'
  | 'fundraising'
  | 'product'
  | 'operations'
  | 'sales'
  | 'finance'
  | 'rails'
  | 'compliance'
  | 'people'
  | 'public';

type EventStatus = 'on_track' | 'at_risk' | 'blocked' | 'done';

type CalendarObjectType =
  | 'meeting'
  | 'milestone'
  | 'deadline'
  | 'approval_window'
  | 'commitment';

interface CalendarEvent {
  id: string;
  title: string;
  category: CalendarCategory;
  status: EventStatus;
  objectType: CalendarObjectType;
  owner: string;
  dueLabel: string;
  dueHours: number; // hours until due (for sorting)
  decisionRequired: boolean;
  prepAssets: number;
  // Meeting fields
  attendeesCount?: number;
  location?: string;
  outcomeRequired?: boolean;
  // Milestone fields
  dependencyCount?: number;
  proofAssetLink?: string;
  progressPercent?: number;
  // Deadline fields
  severity?: 'critical' | 'high' | 'medium';
  impactText?: string;
  artifactRequired?: boolean;
  // Approval Window fields
  opensAt?: string;
  closesAt?: string;
  approverRoles?: string[];
  linkedQueue?: string;
  // Commitment fields
  counterparty?: string;
  deliverableCount?: number;
  riskFlag?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const VIEW_MODES: { key: ViewMode; label: string }[] = [
  { key: 'day', label: 'Day' },
  { key: 'week', label: 'Week' },
  { key: 'month', label: 'Month' },
];

const CATEGORY_CONFIG: Record<CalendarCategory, { label: string; color: string; icon: string }> = {
  board: { label: 'Board', color: '#8B5CF6', icon: 'person.3.fill' },
  fundraising: { label: 'Fundraising', color: '#EC4899', icon: 'banknote.fill' },
  product: { label: 'Product', color: '#14B8A6', icon: 'app.fill' },
  operations: { label: 'Operations', color: '#6B7280', icon: 'gearshape.fill' },
  sales: { label: 'Sales', color: '#F97316', icon: 'cart.fill' },
  finance: { label: 'Finance', color: '#22C55E', icon: 'dollarsign.circle.fill' },
  rails: { label: 'Rails', color: '#3B82F6', icon: 'arrow.left.arrow.right.circle.fill' },
  compliance: { label: 'Compliance', color: '#F59E0B', icon: 'checkmark.shield.fill' },
  people: { label: 'People', color: '#A855F7', icon: 'person.2.fill' },
  public: { label: 'Public', color: '#06B6D4', icon: 'globe' },
};

const STATUS_CONFIG: Record<EventStatus, { label: string; color: string }> = {
  on_track: { label: 'On Track', color: '#22C55E' },
  at_risk: { label: 'At Risk', color: '#F59E0B' },
  blocked: { label: 'Blocked', color: '#EF4444' },
  done: { label: 'Done', color: '#3B82F6' },
};

const OBJECT_TYPE_LABELS: Record<CalendarObjectType, string> = {
  meeting: 'Meeting',
  milestone: 'Milestone',
  deadline: 'Deadline',
  approval_window: 'Approval Window',
  commitment: 'Commitment',
};

// =============================================================================
// MOCK CALENDAR EVENTS
// =============================================================================

const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Board Pack Review (PBD/Tom)',
    category: 'board',
    status: 'on_track',
    objectType: 'meeting',
    owner: 'SK',
    dueLabel: '3 days',
    dueHours: 72,
    decisionRequired: true,
    prepAssets: 2,
    attendeesCount: 4,
    location: 'Zoom — Board Room',
    outcomeRequired: true,
  },
  {
    id: 'cal-2',
    title: 'Investor Follow-up Calls Block',
    category: 'fundraising',
    status: 'on_track',
    objectType: 'meeting',
    owner: 'SK',
    dueLabel: 'This week',
    dueHours: 96,
    decisionRequired: false,
    prepAssets: 1,
    attendeesCount: 3,
    location: 'Google Meet (3 calls)',
    outcomeRequired: false,
  },
  {
    id: 'cal-3',
    title: 'OS Demo v2 Cut (Video)',
    category: 'product',
    status: 'at_risk',
    objectType: 'milestone',
    owner: 'SK',
    dueLabel: '5 days',
    dueHours: 120,
    decisionRequired: false,
    prepAssets: 3,
    dependencyCount: 2,
    proofAssetLink: 'demo-v2-cut-final.mp4',
    progressPercent: 72,
  },
  {
    id: 'cal-4',
    title: 'Month-End Close',
    category: 'finance',
    status: 'on_track',
    objectType: 'deadline',
    owner: 'Finance Lead',
    dueLabel: '4 days',
    dueHours: 96,
    decisionRequired: false,
    prepAssets: 4,
    severity: 'high',
    impactText: 'Blocks investor reporting + board pack financials section',
    artifactRequired: true,
  },
  {
    id: 'cal-5',
    title: 'Payout Batch Approval Window',
    category: 'rails',
    status: 'on_track',
    objectType: 'approval_window',
    owner: 'Ops Lead',
    dueLabel: 'Opens tomorrow',
    dueHours: 24,
    decisionRequired: true,
    prepAssets: 1,
    opensAt: 'Feb 18 · 9:00 AM',
    closesAt: 'Feb 18 · 5:00 PM',
    approverRoles: ['Founder', 'Finance Lead'],
    linkedQueue: 'Payout Queue (12 pending)',
  },
  {
    id: 'cal-6',
    title: 'Trademark Filing Deadline',
    category: 'compliance',
    status: 'blocked',
    objectType: 'deadline',
    owner: 'Legal Counsel',
    dueLabel: '<24h',
    dueHours: 18,
    decisionRequired: true,
    prepAssets: 2,
    severity: 'critical',
    impactText: 'Missing filing risks loss of priority date — impacts IP pack and investor confidence',
    artifactRequired: true,
  },
  {
    id: 'cal-7',
    title: 'Broadcast Partner Check-in',
    category: 'sales',
    status: 'on_track',
    objectType: 'commitment',
    owner: 'BD Lead',
    dueLabel: '6 days',
    dueHours: 144,
    decisionRequired: false,
    prepAssets: 1,
    counterparty: 'StreamVision Media',
    deliverableCount: 3,
    riskFlag: false,
  },
  {
    id: 'cal-8',
    title: 'Live Demo Office Hours',
    category: 'public',
    status: 'on_track',
    objectType: 'meeting',
    owner: 'SK',
    dueLabel: '5 days',
    dueHours: 120,
    decisionRequired: false,
    prepAssets: 0,
    attendeesCount: 25,
    location: 'YouTube Live + Discord',
    outcomeRequired: false,
  },
];

// =============================================================================
// RBAC CATEGORY FILTER
// =============================================================================

function getVisibleCategories(role: BusinessRoleLens): CalendarCategory[] {
  if (isFounder(role)) {
    return ['board', 'fundraising', 'product', 'operations', 'sales', 'finance', 'rails', 'compliance', 'people', 'public'];
  }
  if (isBoardLevel(role)) {
    return ['board', 'fundraising', 'product', 'finance'];
  }
  if (isInvestor(role)) {
    return ['fundraising', 'product', 'public'];
  }
  // B3/B4 — Public
  return ['public'];
}

function getVisibleEvents(role: BusinessRoleLens, events: CalendarEvent[]): CalendarEvent[] {
  const cats = getVisibleCategories(role);
  const filtered = events.filter((e) => cats.includes(e.category));

  if (isFounder(role)) return filtered;

  if (isBoardLevel(role)) {
    // Board sees Board + Fundraising + Major Milestones + Top Risk Deadlines
    return filtered.filter((e) => {
      if (e.category === 'board' || e.category === 'fundraising') return true;
      if (e.objectType === 'milestone') return true;
      if (e.objectType === 'deadline' && (e.severity === 'critical' || e.severity === 'high')) return true;
      return false;
    });
  }

  if (isInvestor(role)) {
    // Retail: investor updates, public demos, office hours, milestones
    return filtered.filter((e) => {
      if (e.category === 'public') return true;
      if (e.objectType === 'milestone') return true;
      if (e.category === 'fundraising' && e.objectType === 'meeting') return true;
      return false;
    });
  }

  // Public: public launches, demos, community events
  return filtered.filter((e) => e.category === 'public');
}

function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    // Blocked first
    if (a.status === 'blocked' && b.status !== 'blocked') return -1;
    if (b.status === 'blocked' && a.status !== 'blocked') return 1;
    // Decision-required second
    if (a.decisionRequired && !b.decisionRequired) return -1;
    if (b.decisionRequired && !a.decisionRequired) return 1;
    // Due <24h third
    if (a.dueHours < 24 && b.dueHours >= 24) return -1;
    if (b.dueHours < 24 && a.dueHours >= 24) return 1;
    // By due time
    return a.dueHours - b.dueHours;
  });
}

// =============================================================================
// SHARED SUB-COMPONENTS
// =============================================================================

function SectionHeader({ title, colors }: { title: string; colors: typeof Colors.light }) {
  return (
    <ThemedText style={[st.sectionLabel, { color: colors.textSecondary }]}>
      {title}
    </ThemedText>
  );
}

function Card({ colors, children }: { colors: typeof Colors.light; children: React.ReactNode }) {
  return (
    <View style={[st.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
    <Pressable style={[st.ctaButton, { borderColor: colors.borderStrong }]}>
      <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />
      <ThemedText style={[st.ctaLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </Pressable>
  );
}

function PillTab({
  label,
  active,
  colors,
  onPress,
}: {
  label: string;
  active: boolean;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        st.pillTab,
        {
          backgroundColor: active ? colors.text : colors.backgroundTertiary,
          borderColor: active ? colors.text : colors.border,
        },
      ]}
    >
      <ThemedText
        style={[
          st.pillTabLabel,
          { color: active ? colors.background : colors.textSecondary },
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

function CategoryChip({
  category,
  active,
  colors,
  onPress,
}: {
  category: CalendarCategory;
  active: boolean;
  colors: typeof Colors.light;
  onPress: () => void;
}) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <Pressable
      onPress={onPress}
      style={[
        st.categoryChip,
        {
          backgroundColor: active ? cfg.color + '20' : colors.backgroundTertiary,
          borderColor: active ? cfg.color : colors.border,
        },
      ]}
    >
      <IconSymbol name={cfg.icon as any} size={12} color={active ? cfg.color : colors.textSecondary} />
      <ThemedText
        style={[
          st.categoryChipLabel,
          { color: active ? cfg.color : colors.textSecondary },
        ]}
      >
        {cfg.label}
      </ThemedText>
    </Pressable>
  );
}

function StatusChip({ status }: { status: EventStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <View style={[st.statusChip, { backgroundColor: cfg.color + '20' }]}>
      <ThemedText style={[st.statusChipText, { color: cfg.color }]}>
        {cfg.label}
      </ThemedText>
    </View>
  );
}

function CategoryTag({ category }: { category: CalendarCategory }) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <View style={[st.categoryTag, { backgroundColor: cfg.color + '18' }]}>
      <ThemedText style={[st.categoryTagText, { color: cfg.color }]}>
        {cfg.label}
      </ThemedText>
    </View>
  );
}

function DuePill({ label, dueHours, colors }: { label: string; dueHours: number; colors: typeof Colors.light }) {
  const urgent = dueHours < 24;
  const soon = dueHours < 48;
  const bg = urgent ? '#EF444420' : soon ? '#F59E0B20' : colors.backgroundTertiary;
  const fg = urgent ? '#EF4444' : soon ? '#F59E0B' : colors.textSecondary;

  return (
    <View style={[st.duePill, { backgroundColor: bg }]}>
      <IconSymbol name="clock.fill" size={10} color={fg} />
      <ThemedText style={[st.duePillText, { color: fg }]}>{label}</ThemedText>
    </View>
  );
}

function SeverityBadge({ severity }: { severity: 'critical' | 'high' | 'medium' }) {
  const color = severity === 'critical' ? '#EF4444' : severity === 'high' ? '#F59E0B' : '#3B82F6';
  return (
    <View style={[st.severityBadge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[st.severityBadgeText, { color }]}>
        {severity.toUpperCase()}
      </ThemedText>
    </View>
  );
}

// =============================================================================
// OBJECT TYPE DETAIL RENDERERS
// =============================================================================

function MeetingDetails({ event, colors }: { event: CalendarEvent; colors: typeof Colors.light }) {
  return (
    <View style={st.objectDetails}>
      <View style={st.objectDetailRow}>
        <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
        <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
          {event.attendeesCount} attendees
        </ThemedText>
      </View>
      {event.location && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="location.fill" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.location}
          </ThemedText>
        </View>
      )}
      {event.outcomeRequired && (
        <View style={[st.outcomeBadge, { backgroundColor: '#8B5CF620' }]}>
          <IconSymbol name="checkmark.circle.fill" size={10} color="#8B5CF6" />
          <ThemedText style={[st.outcomeBadgeText, { color: '#8B5CF6' }]}>Outcome Required</ThemedText>
        </View>
      )}
    </View>
  );
}

function MilestoneDetails({ event, colors }: { event: CalendarEvent; colors: typeof Colors.light }) {
  const progress = event.progressPercent ?? 0;
  return (
    <View style={st.objectDetails}>
      {event.dependencyCount !== undefined && event.dependencyCount > 0 && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="link" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            {event.dependencyCount} dependencies
          </ThemedText>
        </View>
      )}
      {event.proofAssetLink && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="doc.fill" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {event.proofAssetLink}
          </ThemedText>
        </View>
      )}
      {/* Progress bar */}
      <View style={st.progressContainer}>
        <View style={[st.progressTrack, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              st.progressFill,
              {
                width: `${progress}%`,
                backgroundColor: progress >= 80 ? '#22C55E' : progress >= 50 ? '#F59E0B' : '#EF4444',
              },
            ]}
          />
        </View>
        <ThemedText style={[st.progressText, { color: colors.textSecondary }]}>
          {progress}%
        </ThemedText>
      </View>
    </View>
  );
}

function DeadlineDetails({ event, colors }: { event: CalendarEvent; colors: typeof Colors.light }) {
  return (
    <View style={st.objectDetails}>
      {event.severity && <SeverityBadge severity={event.severity} />}
      {event.impactText && (
        <ThemedText style={[st.impactText, { color: colors.textSecondary }]} numberOfLines={2}>
          {event.impactText}
        </ThemedText>
      )}
      {event.artifactRequired && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="doc.badge.plus" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            Artifact required for completion
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function ApprovalWindowDetails({ event, colors }: { event: CalendarEvent; colors: typeof Colors.light }) {
  return (
    <View style={st.objectDetails}>
      <View style={st.approvalTimeRow}>
        <View style={st.objectDetailRow}>
          <IconSymbol name="play.fill" size={10} color="#22C55E" />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            Opens: {event.opensAt}
          </ThemedText>
        </View>
        <View style={st.objectDetailRow}>
          <IconSymbol name="stop.fill" size={10} color="#EF4444" />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            Closes: {event.closesAt}
          </ThemedText>
        </View>
      </View>
      {event.approverRoles && event.approverRoles.length > 0 && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="person.badge.key.fill" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            Approvers: {event.approverRoles.join(', ')}
          </ThemedText>
        </View>
      )}
      {event.linkedQueue && (
        <View style={[st.linkedQueueBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="tray.full.fill" size={12} color={colors.textSecondary} />
          <ThemedText style={[st.linkedQueueText, { color: colors.textSecondary }]}>
            {event.linkedQueue}
          </ThemedText>
        </View>
      )}
    </View>
  );
}

function CommitmentDetails({ event, colors }: { event: CalendarEvent; colors: typeof Colors.light }) {
  return (
    <View style={st.objectDetails}>
      {event.counterparty && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="building.2.fill" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            {event.counterparty}
          </ThemedText>
        </View>
      )}
      {event.deliverableCount !== undefined && (
        <View style={st.objectDetailRow}>
          <IconSymbol name="list.bullet" size={12} color={colors.textTertiary} />
          <ThemedText style={[st.objectDetailText, { color: colors.textSecondary }]}>
            {event.deliverableCount} deliverables
          </ThemedText>
        </View>
      )}
      {event.riskFlag && (
        <View style={[st.riskFlagBadge, { backgroundColor: '#EF444420' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={10} color="#EF4444" />
          <ThemedText style={[st.riskFlagText, { color: '#EF4444' }]}>Risk Flagged</ThemedText>
        </View>
      )}
    </View>
  );
}

function ObjectTypeDetails({ event, colors }: { event: CalendarEvent; colors: typeof Colors.light }) {
  switch (event.objectType) {
    case 'meeting':
      return <MeetingDetails event={event} colors={colors} />;
    case 'milestone':
      return <MilestoneDetails event={event} colors={colors} />;
    case 'deadline':
      return <DeadlineDetails event={event} colors={colors} />;
    case 'approval_window':
      return <ApprovalWindowDetails event={event} colors={colors} />;
    case 'commitment':
      return <CommitmentDetails event={event} colors={colors} />;
    default:
      return null;
  }
}

// =============================================================================
// AGENDA ROW
// =============================================================================

function AgendaRow({
  event,
  colors,
  isLast,
}: {
  event: CalendarEvent;
  colors: typeof Colors.light;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        st.agendaRow,
        !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
      ]}
    >
      {/* Top row: due pill + title */}
      <View style={st.agendaTopRow}>
        <DuePill label={event.dueLabel} dueHours={event.dueHours} colors={colors} />
        <View style={st.agendaTitleBlock}>
          <ThemedText style={[st.agendaTitle, { color: colors.text }]} numberOfLines={2}>
            {event.title}
          </ThemedText>
        </View>
      </View>

      {/* Tags row: category + status + object type */}
      <View style={st.agendaTagRow}>
        <CategoryTag category={event.category} />
        <StatusChip status={event.status} />
        <View style={[st.objectTypeBadge, { backgroundColor: colors.backgroundTertiary }]}>
          <ThemedText style={[st.objectTypeText, { color: colors.textSecondary }]}>
            {OBJECT_TYPE_LABELS[event.objectType]}
          </ThemedText>
        </View>
      </View>

      {/* Meta row: owner + indicators */}
      <View style={st.agendaMetaRow}>
        <View style={st.ownerRow}>
          <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
          <ThemedText style={[st.ownerText, { color: colors.textSecondary }]}>
            {event.owner}
          </ThemedText>
        </View>
        <View style={st.indicatorRow}>
          {event.prepAssets > 0 && (
            <View style={st.indicatorItem}>
              <IconSymbol name="paperclip" size={12} color={colors.textTertiary} />
              <ThemedText style={[st.indicatorText, { color: colors.textTertiary }]}>
                {event.prepAssets}
              </ThemedText>
            </View>
          )}
          {event.decisionRequired && (
            <View style={[st.decisionBadge, { backgroundColor: '#8B5CF620' }]}>
              <IconSymbol name="hammer.fill" size={10} color="#8B5CF6" />
              <ThemedText style={[st.decisionBadgeText, { color: '#8B5CF6' }]}>Decision</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* Object-type-specific details */}
      <ObjectTypeDetails event={event} colors={colors} />
    </View>
  );
}

// =============================================================================
// HEADER AREA
// =============================================================================

function CalendarHeader({
  colors,
  role,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  activeCategories,
  toggleCategory,
  visibleCategories,
}: {
  colors: typeof Colors.light;
  role: BusinessRoleLens;
  viewMode: ViewMode;
  setViewMode: (v: ViewMode) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  activeCategories: Set<CalendarCategory>;
  toggleCategory: (c: CalendarCategory) => void;
  visibleCategories: CalendarCategory[];
}) {
  return (
    <View style={st.headerArea}>
      {/* View toggle pills */}
      <View style={st.viewToggleRow}>
        {VIEW_MODES.map((mode) => (
          <PillTab
            key={mode.key}
            label={mode.label}
            active={viewMode === mode.key}
            colors={colors}
            onPress={() => setViewMode(mode.key)}
          />
        ))}
      </View>

      {/* Search bar + Today + Add */}
      <View style={st.searchRow}>
        <View style={[st.searchBar, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <IconSymbol name="magnifyingglass" size={14} color={colors.textTertiary} />
          <TextInput
            style={[st.searchInput, { color: colors.text }]}
            placeholder="Search events..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <Pressable style={[st.todayButton, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}>
          <ThemedText style={[st.todayButtonText, { color: colors.textSecondary }]}>Today</ThemedText>
        </Pressable>
        {isFounder(role) && (
          <Pressable style={[st.addButton, { backgroundColor: colors.text }]}>
            <IconSymbol name="plus" size={16} color={colors.background} />
          </Pressable>
        )}
      </View>

      {/* Category filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.categoryScroll} contentContainerStyle={st.categoryScrollContent}>
        {visibleCategories.map((cat) => (
          <CategoryChip
            key={cat}
            category={cat}
            active={activeCategories.has(cat)}
            colors={colors}
            onPress={() => toggleCategory(cat)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// CALENDAR STATS STRIP
// =============================================================================

function CalendarStats({ events, colors }: { events: CalendarEvent[]; colors: typeof Colors.light }) {
  const blocked = events.filter((e) => e.status === 'blocked').length;
  const atRisk = events.filter((e) => e.status === 'at_risk').length;
  const decisions = events.filter((e) => e.decisionRequired).length;
  const dueSoon = events.filter((e) => e.dueHours < 48).length;

  return (
    <View style={st.statsRow}>
      <View style={[st.statTile, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[st.statValue, { color: events.length > 0 ? colors.text : colors.textTertiary }]}>
          {events.length}
        </ThemedText>
        <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>Total</ThemedText>
      </View>
      <View style={[st.statTile, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[st.statValue, { color: blocked > 0 ? '#EF4444' : colors.textTertiary }]}>
          {blocked}
        </ThemedText>
        <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>Blocked</ThemedText>
      </View>
      <View style={[st.statTile, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[st.statValue, { color: atRisk > 0 ? '#F59E0B' : colors.textTertiary }]}>
          {atRisk}
        </ThemedText>
        <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>At Risk</ThemedText>
      </View>
      <View style={[st.statTile, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[st.statValue, { color: decisions > 0 ? '#8B5CF6' : colors.textTertiary }]}>
          {decisions}
        </ThemedText>
        <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>Decisions</ThemedText>
      </View>
      <View style={[st.statTile, { backgroundColor: colors.backgroundTertiary }]}>
        <ThemedText style={[st.statValue, { color: dueSoon > 0 ? '#F59E0B' : colors.textTertiary }]}>
          {dueSoon}
        </ThemedText>
        <ThemedText style={[st.statLabel, { color: colors.textSecondary }]}>{'Due <48h'}</ThemedText>
      </View>
    </View>
  );
}

// =============================================================================
// AGENDA LIST
// =============================================================================

function AgendaList({
  events,
  colors,
}: {
  events: CalendarEvent[];
  colors: typeof Colors.light;
}) {
  if (events.length === 0) {
    return (
      <Card colors={colors}>
        <View style={st.emptyState}>
          <IconSymbol name="calendar.badge.checkmark" size={32} color={colors.textTertiary} />
          <ThemedText style={[st.emptyStateText, { color: colors.textSecondary }]}>
            No events match your filters
          </ThemedText>
        </View>
      </Card>
    );
  }

  return (
    <Card colors={colors}>
      {events.map((event, idx) => (
        <AgendaRow
          key={event.id}
          event={event}
          colors={colors}
          isLast={idx === events.length - 1}
        />
      ))}
    </Card>
  );
}

// =============================================================================
// UPCOMING WEEK PREVIEW (compact mini-calendar summary)
// =============================================================================

function WeekPreview({ events, colors }: { events: CalendarEvent[]; colors: typeof Colors.light }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  // Distribute events across the week for visual display
  const dayBuckets: CalendarEvent[][] = days.map((_, i) => {
    return events.filter((e) => {
      const bucket = Math.floor(e.dueHours / 24);
      return bucket === i;
    });
  });

  return (
    <View style={st.moduleContainer}>
      <SectionHeader title="WEEK AT A GLANCE" colors={colors} />
      <Card colors={colors}>
        <View style={st.weekRow}>
          {days.map((day, i) => {
            const count = dayBuckets[i].length;
            const hasBlocked = dayBuckets[i].some((e) => e.status === 'blocked');
            const hasDecision = dayBuckets[i].some((e) => e.decisionRequired);
            const isToday = i === 0;
            return (
              <View key={day} style={st.weekDay}>
                <ThemedText
                  style={[
                    st.weekDayLabel,
                    { color: isToday ? colors.text : colors.textSecondary },
                    isToday && st.weekDayLabelToday,
                  ]}
                >
                  {day}
                </ThemedText>
                <View
                  style={[
                    st.weekDayDot,
                    {
                      backgroundColor:
                        count === 0
                          ? 'transparent'
                          : hasBlocked
                            ? '#EF4444'
                            : hasDecision
                              ? '#8B5CF6'
                              : '#22C55E',
                    },
                  ]}
                />
                <ThemedText style={[st.weekDayCount, { color: count > 0 ? colors.textSecondary : colors.textTertiary }]}>
                  {count > 0 ? count : '\u2014'}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

// =============================================================================
// EVENT TYPE LEGEND
// =============================================================================

function EventTypeLegend({ colors }: { colors: typeof Colors.light }) {
  const types: { type: CalendarObjectType; icon: string }[] = [
    { type: 'meeting', icon: 'person.2.fill' },
    { type: 'milestone', icon: 'flag.fill' },
    { type: 'deadline', icon: 'exclamationmark.circle.fill' },
    { type: 'approval_window', icon: 'checkmark.seal.fill' },
    { type: 'commitment', icon: 'handshake.fill' },
  ];

  return (
    <View style={st.moduleContainer}>
      <SectionHeader title="EVENT TYPES" colors={colors} />
      <Card colors={colors}>
        {types.map((t, idx) => (
          <View
            key={t.type}
            style={[
              st.legendRow,
              idx < types.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
            ]}
          >
            <IconSymbol name={t.icon as any} size={14} color={colors.textSecondary} />
            <ThemedText style={[st.legendLabel, { color: colors.text }]}>
              {OBJECT_TYPE_LABELS[t.type]}
            </ThemedText>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// QUICK ACTIONS
// =============================================================================

function QuickActionsBar({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View style={st.quickActionsRow}>
      {isFounder(role) && (
        <>
          <CTAButton label="New Meeting" icon="person.2.fill" colors={colors} />
          <CTAButton label="New Milestone" icon="flag.fill" colors={colors} />
          <CTAButton label="New Deadline" icon="exclamationmark.circle.fill" colors={colors} />
        </>
      )}
      {isBoardLevel(role) && !isFounder(role) && (
        <CTAButton label="View Board Schedule" icon="calendar" colors={colors} />
      )}
      {isInvestor(role) && !isBoardLevel(role) && (
        <CTAButton label="View Investor Events" icon="calendar" colors={colors} />
      )}
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessCalendarV2({ colors, role = 'B1' }: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategories, setActiveCategories] = useState<Set<CalendarCategory>>(new Set());

  const visibleCategories = useMemo(() => getVisibleCategories(role), [role]);

  const toggleCategory = (cat: CalendarCategory) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const filteredEvents = useMemo(() => {
    let events = getVisibleEvents(role, CALENDAR_EVENTS);

    // Category filter
    if (activeCategories.size > 0) {
      events = events.filter((e) => activeCategories.has(e.category));
    }

    // Search filter
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.owner.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q)
      );
    }

    return sortEvents(events);
  }, [activeCategories, searchQuery]);

  return (
    <ScrollView
      style={[st.container, { backgroundColor: colors.background }]}
      contentContainerStyle={st.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Entity Scope Bar */}
      <EntityScopeBar
        entityId="kanext-holdco"
        entityName="KaNeXT HoldCo"
        entityType="HoldCo"
        status="active"
        colors={colors}
      />

      {/* Header: View toggle, search, category filters */}
      <CalendarHeader
        colors={colors}
        role={role}
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeCategories={activeCategories}
        toggleCategory={toggleCategory}
        visibleCategories={visibleCategories}
      />

      {/* Calendar Stats Strip */}
      <CalendarStats events={filteredEvents} colors={colors} />

      {/* Week Preview */}
      <WeekPreview events={filteredEvents} colors={colors} />

      {/* Agenda List */}
      <View style={st.moduleContainer}>
        <SectionHeader title="AGENDA" colors={colors} />
        <AgendaList events={filteredEvents} colors={colors} />
      </View>

      {/* Event Type Legend */}
      <EventTypeLegend colors={colors} />

      {/* Quick Actions */}
      <View style={st.moduleContainer}>
        <SectionHeader title="QUICK ACTIONS" colors={colors} />
        <QuickActionsBar colors={colors} role={role} />
      </View>

      {/* Bottom spacer */}
      <View style={st.bottomSpacer} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const st = StyleSheet.create({
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

  // Header area
  headerArea: {
    marginBottom: Spacing.md,
  },

  // View toggle pills
  viewToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  pillTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillTabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Search row
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 0,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  todayButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Category chips
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryScrollContent: {
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  categoryChipLabel: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statTile: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    textAlign: 'center',
  },

  // Status chip
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusChipText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Category tag
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Due pill
  duePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  duePillText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Severity badge
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginBottom: 6,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  // Object type badge
  objectTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  objectTypeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Agenda row
  agendaRow: {
    paddingVertical: Spacing.md,
  },
  agendaTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  agendaTitleBlock: {
    flex: 1,
  },
  agendaTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
  },
  agendaTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  agendaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  ownerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ownerText: {
    fontSize: 12,
  },
  indicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  indicatorText: {
    fontSize: 11,
  },

  // Decision badge
  decisionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  decisionBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Object details
  objectDetails: {
    marginTop: 4,
    paddingLeft: 4,
  },
  objectDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  objectDetailText: {
    fontSize: 12,
    flex: 1,
  },

  // Meeting: outcome badge
  outcomeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  outcomeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Milestone: progress bar
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 11,
    fontWeight: '600',
    width: 36,
    textAlign: 'right',
  },

  // Deadline: impact text
  impactText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 6,
  },

  // Approval window: time row
  approvalTimeRow: {
    marginBottom: 4,
  },

  // Approval window: linked queue badge
  linkedQueueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  linkedQueueText: {
    fontSize: 12,
    flex: 1,
  },

  // Commitment: risk flag badge
  riskFlagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  riskFlagText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // Week Preview
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  weekDayLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  weekDayLabelToday: {
    fontWeight: '700',
  },
  weekDayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  weekDayCount: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Legend
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  legendLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Quick actions
  quickActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
