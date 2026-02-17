/**
 * BusinessOperations — Operations tab for KaNeXT OS Business Mode.
 *
 * Sections:
 *   0 — EntityScopeBar (active entity)
 *   1 — Command Header (status strip)
 *   2 — Top Blockers (B1/B2b only; B2b sees critical/high only)
 *   3 — Initiatives Board
 *   4 — Projects
 *   5 — Decision Queue (B1 full; B2b review-only)
 *   6 — Ops Feed (reverse-chronological)
 *
 * RBAC:
 *   B1  — Full access
 *   B2b — Blockers (critical/high), Initiatives, Projects, Decisions (review)
 *   B2a — Summary card only (initiative count + project count)
 *   B3  — Locked
 */

import React, { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
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

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
}

const BP = BusinessPalette;

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
      return '#6AA9FF'; // precision blue
    case 'decision_made':
      return BP.amber;
    case 'alert':
      return BP.red;
  }
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

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
  // ---------------------------------------------------------------------------
  // RBAC: B3/B4/B5 — fully locked
  // ---------------------------------------------------------------------------
  if (role === 'B3' || role === 'B4' || role === 'B5') {
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
  // RBAC: B2a — retail summary only
  // ---------------------------------------------------------------------------
  if (role === 'B2a') {
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
  // RBAC: B1 (Founder) + B2b (Board) — full operations view
  // ---------------------------------------------------------------------------

  const founderAccess = isFounder(role);

  // Blockers — B2b sees only critical/high
  const visibleBlockers = founderAccess
    ? TOP_BLOCKERS
    : TOP_BLOCKERS.filter(
        (b) => b.severity === 'critical' || b.severity === 'high',
      );

  // Decisions — B2b sees only review type
  const visibleDecisions = founderAccess
    ? DECISION_QUEUE
    : DECISION_QUEUE.filter((d) => d.type === 'review');

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
        {INITIATIVES.map((init) => (
          <InitiativeCard key={init.id} item={init} />
        ))}
      </View>

      {/* ---- 4. Projects ---- */}
      <View style={s.section}>
        <BizCardTitle text="Projects" />
        {PROJECTS.map((proj) => (
          <ProjectCard key={proj.id} item={proj} />
        ))}
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
