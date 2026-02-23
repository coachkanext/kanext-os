/**
 * BusinessOperations — Operations tab for KaNeXT OS Business Mode.
 *
 * Sections:
 *   0 — EntityScopeBar (active entity)
 *   1 — Command Header (status strip)
 *   2 — Top Blockers (Founder/Board only; Board sees critical/high only)
 *   3 — Initiatives Board
 *   4 — Projects
 *   5 — Decision Queue (Founder full; Board review-only)
 *   6 — Ops Feed (reverse-chronological)
 *
 * RBAC (14-level: B0-B13):
 *   Founder (B0/B1) — Full access
 *   Board (B2/B6/B8/B9/B13) — Blockers (critical/high), Initiatives, Projects, Decisions (review)
 *   Investor (B6/B7) — Summary card only (initiative count + project count)
 *   Public — Locked
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette , MODE_ACCENT } from '@/constants/theme';
import { EntityScopeBar } from '@/components/business/entity-scope-bar';
import {
  BizCard,
  BizCardTitle,
  BizSubTabBar,
  BizStatusChip,
  BizAlertCard,
  BizEmptyLock,
  statusColor,
  statusVariant,
} from '@/components/business/business-shared';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { DEFAULT_ENTITY } from '@/data/mock-business-v3';
import {
  TOP_BLOCKERS,
  INITIATIVES,
  PROJECTS,
  DECISION_QUEUE,
  OPS_FEED,
} from '@/data/mock-biz-operations';
import type {
  Blocker,
  Initiative,
  Project,
  DecisionItem,
  OpsFeedItem,
} from '@/data/mock-biz-operations';

// =============================================================================
// TYPES
// =============================================================================


const ACCENT = MODE_ACCENT.business;
interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
  onSwitchTab?: (index: number) => void;
}

const BP = BusinessPalette;

// =============================================================================
// FILTER CHIPS
// =============================================================================

type FilterChip =
  | 'All'
  | 'Blocked'
  | 'Decisions Needed'
  | 'Due <7d'
  | 'Initiative'
  | 'Project'
  | 'People'
  | 'Entity'
  | 'Type';

const FILTER_CHIPS: FilterChip[] = [
  'All',
  'Blocked',
  'Decisions Needed',
  'Due <7d',
  'Initiative',
  'Project',
  'People',
  'Entity',
  'Type',
];

// =============================================================================
// KPI DATA
// =============================================================================

interface OpsKPI {
  id: string;
  label: string;
  value: string;
  color: string;
}

function getOpsKPIs(): OpsKPI[] {
  const topPriorities = INITIATIVES.filter(
    (i) => i.priority === 'critical' || i.priority === 'high',
  ).length;
  const openBlockers = TOP_BLOCKERS.length;
  const atRisk = INITIATIVES.filter((i) => i.status === 'blocked').length +
    PROJECTS.filter((p) => p.status === 'blocked').length;
  const decisionQueue = DECISION_QUEUE.filter((d) => d.status === 'pending').length;
  const dueSoon = PROJECTS.filter((p) => {
    // Simple heuristic: items with "Feb" or "Mar" in dueLabel and < 7d
    return p.dueLabel.includes('Feb') || p.dueLabel.startsWith('Mar 1') || p.dueLabel.startsWith('Mar 5');
  }).length;

  return [
    { id: 'kpi-1', label: 'Top 3 Priorities', value: String(topPriorities), color: BP.champagneGold },
    { id: 'kpi-2', label: 'Open Blockers', value: String(openBlockers), color: BP.red },
    { id: 'kpi-3', label: 'At Risk Initiatives', value: String(atRisk), color: BP.amber },
    { id: 'kpi-4', label: 'Decision Queue', value: String(decisionQueue), color: ACCENT },
    { id: 'kpi-5', label: 'Due <7d', value: String(dueSoon), color: BP.amber },
    { id: 'kpi-6', label: 'Last Updated', value: 'Today', color: BP.emerald },
  ];
}

// =============================================================================
// SEVERITY HELPERS
// =============================================================================

function severityColor(severity: 'critical' | 'high' | 'medium'): string {
  switch (severity) {
    case 'critical':
      return BP.red;
    case 'high':
      return BP.amber;
    case 'medium':
      return BP.platinum;
  }
}

function severityLabel(severity: 'critical' | 'high' | 'medium'): string {
  switch (severity) {
    case 'critical':
      return 'CRITICAL';
    case 'high':
      return 'HIGH';
    case 'medium':
      return 'MEDIUM';
  }
}

// =============================================================================
// PRIORITY HELPERS
// =============================================================================

function priorityColor(
  priority: 'critical' | 'high' | 'medium' | 'low',
): string {
  switch (priority) {
    case 'critical':
      return BP.red;
    case 'high':
      return BP.amber;
    case 'medium':
      return BP.champagneGold;
    case 'low':
      return BP.ash;
  }
}

function priorityLabel(
  priority: 'critical' | 'high' | 'medium' | 'low',
): string {
  switch (priority) {
    case 'critical':
      return 'P0';
    case 'high':
      return 'P1';
    case 'medium':
      return 'P2';
    case 'low':
      return 'P3';
  }
}

// =============================================================================
// DECISION TYPE HELPERS
// =============================================================================

function decisionTypeColor(type: DecisionItem['type']): string {
  switch (type) {
    case 'approval':
      return BP.emerald;
    case 'review':
      return BP.amber;
    case 'escalation':
      return BP.red;
  }
}

function decisionTypeLabel(type: DecisionItem['type']): string {
  switch (type) {
    case 'approval':
      return 'APPROVAL';
    case 'review':
      return 'REVIEW';
    case 'escalation':
      return 'ESCALATION';
  }
}

// =============================================================================
// FEED CATEGORY HELPERS
// =============================================================================

function feedCategoryColor(category: OpsFeedItem['category']): string {
  switch (category) {
    case 'blocker_resolved':
      return BP.emerald;
    case 'initiative_update':
      return BP.champagneGold;
    case 'project_milestone':
      return ACCENT; // precision blue
    case 'decision_made':
      return BP.amber;
    case 'alert':
      return BP.red;
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

// ---- Filter Chips Bar -------------------------------------------------------

function FilterChipsBar({
  activeFilter,
  onSelectFilter,
}: {
  activeFilter: FilterChip;
  onSelectFilter: (chip: FilterChip) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterChipsRow}
      style={s.filterChipsContainer}
    >
      {FILTER_CHIPS.map((chip) => {
        const isActive = chip === activeFilter;
        return (
          <Pressable
            key={chip}
            style={[
              s.filterChip,
              {
                backgroundColor: isActive ? BP.champagneGold + '20' : BP.carbon,
                borderColor: isActive ? BP.champagneGold : BP.graphite,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelectFilter(chip);
            }}
          >
            <ThemedText
              style={[
                s.filterChipText,
                { color: isActive ? BP.champagneGold : BP.ash },
              ]}
            >
              {chip}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ---- KPI Tiles Grid ---------------------------------------------------------

function KPITilesGrid() {
  const kpis = getOpsKPIs();

  return (
    <View style={s.kpiGrid}>
      {kpis.map((kpi) => (
        <View key={kpi.id} style={s.kpiTile}>
          <ThemedText style={[s.kpiTileValue, { color: kpi.color }]}>
            {kpi.value}
          </ThemedText>
          <ThemedText style={s.kpiTileLabel} numberOfLines={1}>
            {kpi.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

// ---- Command Header --------------------------------------------------------

function CommandHeader() {
  const blockerCount = TOP_BLOCKERS.length;
  const initCount = INITIATIVES.length;
  const projCount = PROJECTS.length;

  return (
    <View style={s.commandHeader}>
      <View style={s.commandRow}>
        <View style={s.commandDot} />
        <ThemedText style={s.commandLabel}>Operations:</ThemedText>
        <ThemedText style={s.commandValue}>ACTIVE</ThemedText>
      </View>
      <ThemedText style={s.commandSubtitle}>
        {blockerCount} blockers &middot; {initCount} initiatives &middot;{' '}
        {projCount} projects
      </ThemedText>

      {/* KPI Tiles */}
      <KPITilesGrid />
    </View>
  );
}

// ---- Blocker Row -----------------------------------------------------------

function BlockerRow({ blocker }: { blocker: Blocker }) {
  const [expanded, setExpanded] = useState(false);
  const color = severityColor(blocker.severity);

  return (
    <Pressable
      style={s.blockerRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded((prev) => !prev);
      }}
    >
      <View style={s.blockerTopLine}>
        {/* Severity dot */}
        <View style={[s.severityDot, { backgroundColor: color }]} />

        {/* Title */}
        <ThemedText style={s.blockerTitle} numberOfLines={expanded ? 0 : 1}>
          {blocker.title}
        </ThemedText>

        {/* Days blocked badge */}
        <View style={[s.daysBlockedBadge, { backgroundColor: color + '20' }]}>
          <ThemedText style={[s.daysBlockedText, { color }]}>
            {blocker.daysBlocked}d
          </ThemedText>
        </View>
      </View>

      {/* Owner + category */}
      <View style={s.blockerMeta}>
        <ThemedText style={s.blockerOwner}>{blocker.owner}</ThemedText>
        <ThemedText style={s.blockerSep}>&middot;</ThemedText>
        <ThemedText style={s.blockerCategory}>{blocker.category}</ThemedText>
      </View>

      {/* Impact — shown when expanded */}
      {expanded && (
        <ThemedText style={s.blockerImpact}>{blocker.impact}</ThemedText>
      )}
    </Pressable>
  );
}

// ---- Initiative Card -------------------------------------------------------

function InitiativeCard({ item }: { item: Initiative }) {
  const pColor = priorityColor(item.priority);
  const sColor = statusColor(item.status);

  return (
    <BizCard>
      {/* Header row — name + status chip */}
      <View style={s.initiativeHeader}>
        <ThemedText style={s.initiativeName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <BizStatusChip
          label={item.status.toUpperCase()}
          variant={statusVariant(item.status)}
        />
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            {
              width: `${item.progress}%`,
              backgroundColor: sColor,
            },
          ]}
        />
      </View>

      {/* Meta row */}
      <View style={s.initiativeMeta}>
        <ThemedText style={s.metaText}>{item.owner}</ThemedText>
        <ThemedText style={s.metaSep}>&middot;</ThemedText>
        <ThemedText style={s.metaText}>{item.items} items</ThemedText>
        <ThemedText style={s.metaSep}>&middot;</ThemedText>
        <ThemedText style={s.metaText}>{item.dueLabel}</ThemedText>

        {/* Priority badge */}
        <View
          style={[s.priorityBadge, { backgroundColor: pColor + '18' }]}
        >
          <ThemedText style={[s.priorityBadgeText, { color: pColor }]}>
            {priorityLabel(item.priority)}
          </ThemedText>
        </View>
      </View>
    </BizCard>
  );
}

// ---- Project Card ----------------------------------------------------------

function ProjectCard({ item }: { item: Project }) {
  const pColor = priorityColor(item.priority);
  const sColor = statusColor(item.status);

  return (
    <BizCard>
      {/* Header row */}
      <View style={s.initiativeHeader}>
        <ThemedText style={s.initiativeName} numberOfLines={1}>
          {item.name}
        </ThemedText>
        <BizStatusChip
          label={item.status.toUpperCase()}
          variant={statusVariant(item.status)}
        />
      </View>

      {/* Progress bar */}
      <View style={s.progressTrack}>
        <View
          style={[
            s.progressFill,
            {
              width: `${item.progress}%`,
              backgroundColor: sColor,
            },
          ]}
        />
      </View>

      {/* Meta row */}
      <View style={s.initiativeMeta}>
        <ThemedText style={s.metaText}>{item.owner}</ThemedText>
        <ThemedText style={s.metaSep}>&middot;</ThemedText>
        <ThemedText style={s.metaText}>{item.items} items</ThemedText>
        <ThemedText style={s.metaSep}>&middot;</ThemedText>
        <ThemedText style={s.metaText}>{item.dueLabel}</ThemedText>

        {/* Priority badge */}
        <View
          style={[s.priorityBadge, { backgroundColor: pColor + '18' }]}
        >
          <ThemedText style={[s.priorityBadgeText, { color: pColor }]}>
            {priorityLabel(item.priority)}
          </ThemedText>
        </View>
      </View>
    </BizCard>
  );
}

// ---- Initiative Group (collapsible) -----------------------------------------

function InitiativeGroupHeader({
  name,
  count,
  collapsed,
  onToggle,
}: {
  name: string;
  count: number;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable
      style={s.initiativeGroupHeader}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onToggle();
      }}
    >
      <IconSymbol
        name={collapsed ? 'chevron.right' : 'chevron.down'}
        size={12}
        color={BP.champagneGold}
      />
      <ThemedText style={s.initiativeGroupName} numberOfLines={1}>
        {name}
      </ThemedText>
      <View style={s.initiativeGroupCountBadge}>
        <ThemedText style={s.initiativeGroupCountText}>{count}</ThemedText>
      </View>
    </Pressable>
  );
}

// ---- Decision Row ----------------------------------------------------------

function DecisionRow({ item }: { item: DecisionItem }) {
  const [expanded, setExpanded] = useState(false);
  const typeColor = decisionTypeColor(item.type);

  return (
    <Pressable
      style={s.decisionRow}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setExpanded((prev) => !prev);
      }}
    >
      <View style={s.decisionTopLine}>
        {/* Type badge */}
        <View style={[s.typeBadge, { backgroundColor: typeColor + '18' }]}>
          <ThemedText style={[s.typeBadgeText, { color: typeColor }]}>
            {decisionTypeLabel(item.type)}
          </ThemedText>
        </View>

        {/* Status chip */}
        <BizStatusChip
          label={item.status.toUpperCase()}
          variant={statusVariant(item.status)}
        />
      </View>

      {/* Title */}
      <ThemedText style={s.decisionTitle} numberOfLines={expanded ? 0 : 2}>
        {item.title}
      </ThemedText>

      {/* Meta */}
      <View style={s.decisionMeta}>
        <ThemedText style={s.metaText}>{item.requester}</ThemedText>
        <ThemedText style={s.metaSep}>&middot;</ThemedText>
        <ThemedText style={s.metaText}>Due {item.deadline}</ThemedText>
      </View>

      {/* Impact — expanded */}
      {expanded && (
        <ThemedText style={s.decisionImpact}>{item.impact}</ThemedText>
      )}
    </Pressable>
  );
}

// ---- Feed Row --------------------------------------------------------------

function FeedRow({ item }: { item: OpsFeedItem }) {
  const dotColor = feedCategoryColor(item.category);

  return (
    <View style={s.feedRow}>
      <View style={[s.feedDot, { backgroundColor: dotColor }]} />
      <View style={s.feedContent}>
        <ThemedText style={s.feedText}>{item.text}</ThemedText>
        <ThemedText style={s.feedTimestamp}>{item.timestamp}</ThemedText>
      </View>
    </View>
  );
}

// ---- Retail Summary Card ---------------------------------------------------

function RetailSummaryCard() {
  const activeInitiatives = INITIATIVES.filter(
    (i) => i.status === 'active' || i.status === 'done',
  ).length;
  const activeProjects = PROJECTS.filter(
    (p) => p.status === 'active' || p.status === 'done',
  ).length;

  return (
    <BizCard>
      <BizCardTitle text="Operations Summary" />

      <View style={s.retailGrid}>
        {/* Initiatives stat */}
        <View style={s.retailStat}>
          <IconSymbol
            name="list.bullet.rectangle.fill"
            size={20}
            color={BP.champagneGold}
          />
          <ThemedText style={s.retailStatValue}>{activeInitiatives}</ThemedText>
          <ThemedText style={s.retailStatLabel}>Active Initiatives</ThemedText>
        </View>

        {/* Divider */}
        <View style={s.retailDivider} />

        {/* Projects stat */}
        <View style={s.retailStat}>
          <IconSymbol
            name="folder.fill"
            size={20}
            color={BP.champagneGold}
          />
          <ThemedText style={s.retailStatValue}>{activeProjects}</ThemedText>
          <ThemedText style={s.retailStatLabel}>Active Projects</ThemedText>
        </View>
      </View>

      <ThemedText style={s.retailFootnote}>
        Detailed operations data is available to Founder and Board views.
      </ThemedText>
    </BizCard>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessOperations({ colors, role = 'B1' }: Props) {
  const [activeFilter, setActiveFilter] = useState<FilterChip>('All');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapsed = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // ---------------------------------------------------------------------------
  // RBAC: non-founder, non-board, non-investor — fully locked
  // ---------------------------------------------------------------------------
  if (!isFounder(role) && !isBoardLevel(role) && !isInvestor(role)) {
    return (
      <ScrollView
        style={[s.root, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EntityScopeBar
          entityId={DEFAULT_ENTITY.id}
          entityName={DEFAULT_ENTITY.name}
          entityType={DEFAULT_ENTITY.type}
          status={DEFAULT_ENTITY.status}
          colors={colors}
        />
        <BizEmptyLock
          title="Operations"
          message="Operations details are visible to Founder and Board views."
        />
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    );
  }

  // ---------------------------------------------------------------------------
  // RBAC: Retail investor — summary only
  // ---------------------------------------------------------------------------
  if (isInvestor(role) && !isBoardLevel(role)) {
    return (
      <ScrollView
        style={[s.root, { backgroundColor: colors.background }]}
        contentContainerStyle={s.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <EntityScopeBar
          entityId={DEFAULT_ENTITY.id}
          entityName={DEFAULT_ENTITY.name}
          entityType={DEFAULT_ENTITY.type}
          status={DEFAULT_ENTITY.status}
          colors={colors}
        />
        <CommandHeader />
        <RetailSummaryCard />
        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    );
  }

  // ---------------------------------------------------------------------------
  // RBAC: Founder + Board-level — full operations view
  // ---------------------------------------------------------------------------

  const founderAccess = isFounder(role);

  // Blockers — non-founder board sees only critical/high
  const visibleBlockers = founderAccess
    ? TOP_BLOCKERS
    : TOP_BLOCKERS.filter(
        (b) => b.severity === 'critical' || b.severity === 'high',
      );

  // Decisions — non-founder board sees only review type
  const visibleDecisions = founderAccess
    ? DECISION_QUEUE
    : DECISION_QUEUE.filter((d) => d.type === 'review');

  // ---------------------------------------------------------------------------
  // Filter logic — applies to initiatives + projects
  // ---------------------------------------------------------------------------
  const filteredInitiatives = INITIATIVES.filter((init) => {
    switch (activeFilter) {
      case 'All':
        return true;
      case 'Blocked':
        return init.status === 'blocked';
      case 'Decisions Needed':
        return false; // initiatives don't have decisions
      case 'Due <7d':
        return init.dueLabel.includes('Feb') || init.dueLabel.startsWith('Mar 1') || init.dueLabel.startsWith('Mar 5');
      case 'Initiative':
        return true; // show all initiatives
      case 'Project':
        return false; // hide initiatives in project filter
      case 'People':
        return true; // show all (has owner)
      case 'Entity':
        return true;
      case 'Type':
        return true;
      default:
        return true;
    }
  });

  const filteredProjects = PROJECTS.filter((proj) => {
    switch (activeFilter) {
      case 'All':
        return true;
      case 'Blocked':
        return proj.status === 'blocked';
      case 'Decisions Needed':
        return false;
      case 'Due <7d':
        return proj.dueLabel.includes('Feb') || proj.dueLabel.startsWith('Mar 1') || proj.dueLabel.startsWith('Mar 5');
      case 'Initiative':
        return false; // hide projects in initiative filter
      case 'Project':
        return true; // show all projects
      case 'People':
        return true;
      case 'Entity':
        return true;
      case 'Type':
        return true;
      default:
        return true;
    }
  });

  // Group projects by initiative
  const projectsByInitiative: Record<string, Project[]> = {};
  filteredProjects.forEach((proj) => {
    const key = proj.initiative;
    if (!projectsByInitiative[key]) {
      projectsByInitiative[key] = [];
    }
    projectsByInitiative[key].push(proj);
  });
  const initiativeGroupNames = Object.keys(projectsByInitiative);

  return (
    <ScrollView
      style={[s.root, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* ---- 0. Entity Scope Bar ---- */}
      <EntityScopeBar
        entityId={DEFAULT_ENTITY.id}
        entityName={DEFAULT_ENTITY.name}
        entityType={DEFAULT_ENTITY.type}
        status={DEFAULT_ENTITY.status}
        colors={colors}
      />

      {/* ---- 1. Command Header ---- */}
      <CommandHeader />

      {/* ---- Filter Chips Bar ---- */}
      <FilterChipsBar
        activeFilter={activeFilter}
        onSelectFilter={setActiveFilter}
      />

      {/* ---- 2. Top Blockers ---- */}
      <View style={s.section}>
        <BizCardTitle text="Top Blockers" />
        <BizCard>
          {visibleBlockers.map((blocker, idx) => (
            <React.Fragment key={blocker.id}>
              <BlockerRow blocker={blocker} />
              {idx < visibleBlockers.length - 1 && (
                <View style={s.inCardDivider} />
              )}
            </React.Fragment>
          ))}
          {visibleBlockers.length === 0 && (
            <ThemedText style={s.emptyText}>No active blockers.</ThemedText>
          )}
        </BizCard>
      </View>

      {/* ---- 3. Initiatives Board ---- */}
      <View style={s.section}>
        <BizCardTitle text="Initiatives" />
        {filteredInitiatives.map((init) => (
          <InitiativeCard key={init.id} item={init} />
        ))}
        {filteredInitiatives.length === 0 && (
          <ThemedText style={s.emptyText}>
            No initiatives match the current filter.
          </ThemedText>
        )}
      </View>

      {/* ---- 4. Projects (grouped by initiative) ---- */}
      <View style={s.section}>
        <BizCardTitle text="Projects" />
        {initiativeGroupNames.map((groupName) => {
          const groupProjects = projectsByInitiative[groupName];
          const isCollapsed = !!collapsed[groupName];

          return (
            <View key={groupName} style={s.initiativeGroup}>
              <InitiativeGroupHeader
                name={groupName}
                count={groupProjects.length}
                collapsed={isCollapsed}
                onToggle={() => toggleCollapsed(groupName)}
              />
              {!isCollapsed &&
                groupProjects.map((proj) => (
                  <ProjectCard key={proj.id} item={proj} />
                ))}
            </View>
          );
        })}
        {initiativeGroupNames.length === 0 && (
          <ThemedText style={s.emptyText}>
            No projects match the current filter.
          </ThemedText>
        )}
      </View>

      {/* ---- 5. Decision Queue ---- */}
      <View style={s.section}>
        <BizCardTitle text="Decision Queue" />
        <BizCard>
          {visibleDecisions.map((decision, idx) => (
            <React.Fragment key={decision.id}>
              <DecisionRow item={decision} />
              {idx < visibleDecisions.length - 1 && (
                <View style={s.inCardDivider} />
              )}
            </React.Fragment>
          ))}
          {visibleDecisions.length === 0 && (
            <ThemedText style={s.emptyText}>
              No decisions require your review.
            </ThemedText>
          )}
        </BizCard>
      </View>

      {/* ---- 6. Ops Feed ---- */}
      <View style={s.section}>
        <BizCardTitle text="Ops Feed" />
        <BizCard>
          {OPS_FEED.map((item, idx) => (
            <React.Fragment key={item.id}>
              <FeedRow item={item} />
              {idx < OPS_FEED.length - 1 && (
                <View style={s.inCardDivider} />
              )}
            </React.Fragment>
          ))}
        </BizCard>
      </View>

      {/* Bottom spacer */}
      <View style={{ height: Spacing.xxl }} />
    </ScrollView>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // -- Layout ----------------------------------------------------------------
  root: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  section: {
    marginTop: Spacing.sm,
  },

  // -- Command Header --------------------------------------------------------
  commandHeader: {
    backgroundColor: BP.carbon,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: BP.graphite,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  commandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commandDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: BP.emerald,
  },
  commandLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.ash,
  },
  commandValue: {
    fontSize: 13,
    fontWeight: '700',
    color: BP.emerald,
    letterSpacing: 0.5,
  },
  commandSubtitle: {
    fontSize: 12,
    color: BP.ash,
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
  },

  // -- Blocker Row -----------------------------------------------------------
  blockerRow: {
    paddingVertical: Spacing.sm,
  },
  blockerTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  blockerTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
  },
  daysBlockedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
  },
  daysBlockedText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  blockerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: Spacing.md,
  },
  blockerOwner: {
    fontSize: 12,
    color: BP.ash,
  },
  blockerSep: {
    fontSize: 12,
    color: BP.platinum,
  },
  blockerCategory: {
    fontSize: 12,
    color: BP.ash,
  },
  blockerImpact: {
    fontSize: 12,
    color: BP.ash,
    lineHeight: 18,
    marginTop: Spacing.xs,
    marginLeft: Spacing.md,
    fontStyle: 'italic',
  },

  // -- Initiative / Project Card ---------------------------------------------
  initiativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  initiativeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: BP.smoke,
  },
  progressTrack: {
    height: 4,
    backgroundColor: BP.graphite,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },
  initiativeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: BP.ash,
  },
  metaSep: {
    fontSize: 12,
    color: BP.platinum,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: 'auto',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
  },

  // -- Decision Row ----------------------------------------------------------
  decisionRow: {
    paddingVertical: Spacing.sm,
  },
  decisionTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  decisionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: BP.smoke,
    lineHeight: 19,
  },
  decisionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.xs,
  },
  decisionImpact: {
    fontSize: 12,
    color: BP.ash,
    lineHeight: 18,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  // -- Feed Row --------------------------------------------------------------
  feedRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  feedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 4,
    flexShrink: 0,
  },
  feedContent: {
    flex: 1,
  },
  feedText: {
    fontSize: 13,
    color: BP.smoke,
    lineHeight: 19,
  },
  feedTimestamp: {
    fontSize: 11,
    color: BP.ash,
    marginTop: 2,
  },

  // -- Retail Summary --------------------------------------------------------
  retailGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.lg,
  },
  retailStat: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  retailStatValue: {
    fontSize: 28,
    fontWeight: '700',
    color: BP.champagneGold,
  },
  retailStatLabel: {
    fontSize: 12,
    color: BP.ash,
  },
  retailDivider: {
    width: 1,
    height: 48,
    backgroundColor: BP.graphite,
  },
  retailFootnote: {
    fontSize: 11,
    color: BP.ash,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Filter Chips Bar -------------------------------------------------------
  filterChipsContainer: {
    marginBottom: Spacing.md,
  },
  filterChipsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- KPI Tiles Grid ---------------------------------------------------------
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  kpiTile: {
    width: '30%',
    backgroundColor: BP.graphite + '60',
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 2,
  },
  kpiTileValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  kpiTileLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: BP.ash,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // -- Initiative Group -------------------------------------------------------
  initiativeGroup: {
    marginBottom: Spacing.xs,
  },
  initiativeGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  initiativeGroupName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: BP.champagneGold,
    letterSpacing: 0.2,
  },
  initiativeGroupCountBadge: {
    backgroundColor: BP.graphite,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  initiativeGroupCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: BP.ash,
  },

  // -- Shared ----------------------------------------------------------------
  inCardDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BP.graphite,
    marginVertical: Spacing.xs,
  },
  emptyText: {
    fontSize: 13,
    color: BP.ash,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
