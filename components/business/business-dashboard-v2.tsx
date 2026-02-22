/**
 * Business Dashboard V2 — 7-block RBAC-gated Business Mode home dashboard.
 * Default demo role: B1 (Founder / CEO) — full access.
 *
 * Blocks:
 *   0 — Hero Video (pinned walkthrough)
 *   1 — Context Snapshot (6 KPI chips)
 *   2 — Today + Next
 *   3 — Alerts Strip
 *   4 — Quick Actions (CEO execution grid)
 *   5 — Feed Preview
 *   6 — Pinned Shelf
 */

import React from 'react';
import {
  View,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

// RBAC
import {
  isFounder,
  isBoardLevel,
  isInvestor,
  getMetricVisibility,
} from '@/utils/business-rbac';
import type { BusinessRoleLens, MetricVisibility } from '@/utils/business-rbac';

// =============================================================================
// TYPES
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  role?: BusinessRoleLens;
  onSwitchTab?: (index: number) => void;
}

// =============================================================================
// INLINE MOCK DATA
// =============================================================================

// --- Block 1: Context Snapshot KPIs ---

interface KPIChip {
  id: string;
  label: string;
  exactValue: string;
  bandedValue: string;
  icon: string;
  /** If true, hidden for retail/public roles */
  founderOnly?: boolean;
  /** Optional dot color for status indicators */
  dotColor?: string;
}

const CONTEXT_KPIS: KPIChip[] = [
  {
    id: 'cash',
    label: 'Cash',
    exactValue: '$142K',
    bandedValue: '$100K\u2013$200K',
    icon: 'dollarsign.circle.fill',
  },
  {
    id: 'runway',
    label: 'Runway',
    exactValue: '7.2 mo',
    bandedValue: '6\u20139 mo',
    icon: 'clock.fill',
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    exactValue: '$1.5M \u00B7 5 active',
    bandedValue: '',
    icon: 'chart.line.uptrend.xyaxis',
    founderOnly: true,
  },
  {
    id: 'build',
    label: 'Build',
    exactValue: '4/6 On Track',
    bandedValue: '4/6 On Track',
    icon: 'hammer.fill',
  },
  {
    id: 'compliance',
    label: 'Compliance',
    exactValue: 'Green',
    bandedValue: 'Green',
    icon: 'checkmark.shield.fill',
    dotColor: '#22C55E',
  },
  {
    id: 'rails',
    label: 'Rails',
    exactValue: 'Green',
    bandedValue: 'Green',
    icon: 'creditcard.fill',
    dotColor: '#22C55E',
  },
];

// --- Block 2: Today + Next ---

interface TodayItem {
  id: string;
  title: string;
  badge?: string;
  owner: string;
  time: string;
}

const TODAY_ITEMS: TodayItem[] = [
  {
    id: 'td-1',
    title: 'Board Pack Review Prep',
    badge: 'DECISION',
    owner: 'Alex M.',
    time: '10:00 AM',
  },
  {
    id: 'td-2',
    title: 'Trademark Filing Due',
    badge: 'DUE TODAY',
    owner: 'Legal',
    time: '5:00 PM',
  },
  {
    id: 'td-3',
    title: 'Investor Update Draft Due',
    badge: 'INVESTOR',
    owner: 'Alex M.',
    time: '3:00 PM',
  },
];

interface NextItem {
  id: string;
  title: string;
  participants: string;
  countdown: string;
  readiness: string;
  readinessColor: string;
}

const NEXT_ITEM: NextItem = {
  id: 'next-1',
  title: 'Board Meeting',
  participants: 'PBD / Tom',
  countdown: '3 days',
  readiness: 'At Risk',
  readinessColor: '#F59E0B',
};

// --- Block 3: Alerts Strip ---

type AlertSeverity = 'blocker' | 'approval' | 'due_24h' | 'rails_exception' | 'compliance' | 'investor_risk' | 'partner_risk' | 'people_risk';

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  type: string;
  title: string;
  owner: string;
  time: string;
}

const ALERTS: AlertItem[] = [
  {
    id: 'al-1',
    severity: 'blocker',
    type: 'BLOCKER',
    title: 'Payment rails KYC not finalized',
    owner: 'Ops',
    time: 'Overdue',
  },
  {
    id: 'al-2',
    severity: 'approval',
    type: 'APPROVAL',
    title: 'Vendor payout batch \u2014 $48,200',
    owner: 'Finance',
    time: '2h ago',
  },
  {
    id: 'al-3',
    severity: 'due_24h',
    type: 'DUE <24H',
    title: 'Trademark filing deadline',
    owner: 'Legal',
    time: 'Today 5 PM',
  },
  {
    id: 'al-4',
    severity: 'rails_exception',
    type: 'RAILS',
    title: 'ACH return \u2014 invalid account',
    owner: 'Treasury',
    time: '4h ago',
  },
  {
    id: 'al-5',
    severity: 'compliance',
    type: 'COMPLIANCE',
    title: 'Updated financial model needed',
    owner: 'Finance',
    time: 'This week',
  },
  {
    id: 'al-6',
    severity: 'investor_risk',
    type: 'INVESTOR',
    title: 'PBD follow-up call prep incomplete',
    owner: 'Alex M.',
    time: 'Tomorrow',
  },
  {
    id: 'al-7',
    severity: 'partner_risk',
    type: 'PARTNER',
    title: 'Vendor SLA breach \u2014 API uptime below 99%',
    owner: 'Partnerships',
    time: '1d ago',
  },
  {
    id: 'al-8',
    severity: 'people_risk',
    type: 'PEOPLE',
    title: 'Key hire onboarding incomplete \u2014 3 days overdue',
    owner: 'HR',
    time: '2d ago',
  },
];

const ALERT_SEVERITY_COLOR: Record<AlertSeverity, string> = {
  blocker: '#EF4444',
  approval: '#F59E0B',
  due_24h: '#F59E0B',
  rails_exception: '#EF4444',
  compliance: '#3B82F6',
  investor_risk: '#8B5CF6',
  partner_risk: '#F97316',
  people_risk: '#EC4899',
};

// --- Block 4: Quick Actions ---

interface QuickActionItem {
  id: string;
  label: string;
  icon: string;
}

const QUICK_ACTIONS_FOUNDER: QuickActionItem[] = [
  { id: 'qa-board-pack', label: 'Open Board Pack', icon: 'doc.richtext.fill' },
  { id: 'qa-investor-update', label: 'Create Investor Update', icon: 'envelope.fill' },
  { id: 'qa-ops-command', label: 'Open Ops Command', icon: 'gearshape.2.fill' },
  { id: 'qa-finance', label: 'Open Finance', icon: 'dollarsign.circle.fill' },
  { id: 'qa-payment-rails', label: 'Open Payment Rails', icon: 'creditcard.fill' },
  { id: 'qa-compliance', label: 'Open Compliance', icon: 'checkmark.shield.fill' },
  { id: 'qa-people', label: 'Open People', icon: 'person.2.fill' },
  { id: 'qa-data-room', label: 'Open Data Room', icon: 'folder.fill' },
  { id: 'qa-create-request', label: 'Create Request', icon: 'plus.circle.fill' },
  { id: 'qa-pin-hero', label: 'Pin Hero Video', icon: 'pin.fill' },
];

const QUICK_ACTIONS_BOARD: QuickActionItem[] = [
  { id: 'qa-view-board', label: 'View Board Pack', icon: 'doc.richtext.fill' },
  { id: 'qa-submit-request', label: 'Submit Board Request', icon: 'plus.circle.fill' },
  { id: 'qa-review-approvals', label: 'Review Approvals', icon: 'checkmark.circle.fill' },
  { id: 'qa-view-milestones', label: 'View Milestones', icon: 'flag.fill' },
];

const QUICK_ACTIONS_RETAIL: QuickActionItem[] = [
  { id: 'qa-view-updates', label: 'View Updates', icon: 'envelope.fill' },
  { id: 'qa-rsvp', label: 'RSVP Office Hours', icon: 'calendar' },
  { id: 'qa-request-info', label: 'Request Info', icon: 'questionmark.circle.fill' },
];

const QUICK_ACTIONS_PUBLIC: QuickActionItem[] = [
  { id: 'qa-view-company', label: 'View Company', icon: 'building.2.fill' },
  { id: 'qa-watch-featured', label: 'Watch Featured', icon: 'play.rectangle.fill' },
];

function getQuickActions(role: BusinessRoleLens): QuickActionItem[] {
  if (isFounder(role)) return QUICK_ACTIONS_FOUNDER;
  if (role === 'B2b') return QUICK_ACTIONS_BOARD;
  if (role === 'B2a') return QUICK_ACTIONS_RETAIL;
  return QUICK_ACTIONS_PUBLIC;
}

// --- Block 5: Feed Preview ---

interface FeedItem {
  id: string;
  text: string;
  timestamp: string;
  category: 'approval' | 'board' | 'media' | 'compliance' | 'milestone' | 'investor_update' | 'public';
}

const FEED_ITEMS: FeedItem[] = [
  { id: 'f-1', text: 'Approval granted: Vendor payout batch', timestamp: '2h ago', category: 'approval' },
  { id: 'f-2', text: 'Board request submitted: Partnership diligence', timestamp: '3h ago', category: 'board' },
  { id: 'f-3', text: 'New demo clip published', timestamp: '4h ago', category: 'media' },
  { id: 'f-4', text: 'Compliance task completed: EIN verification', timestamp: '5h ago', category: 'compliance' },
  { id: 'f-5', text: 'Milestone moved to At Risk: Series A close', timestamp: '6h ago', category: 'milestone' },
  { id: 'f-6', text: 'Investor update drafted for Q4', timestamp: '7h ago', category: 'investor_update' },
  { id: 'f-7', text: 'Payment rails connected: Mercury ACH', timestamp: '8h ago', category: 'compliance' },
  { id: 'f-8', text: 'Term sheet uploaded to Data Room', timestamp: '1d ago', category: 'board' },
  { id: 'f-9', text: 'Public company page updated', timestamp: '1d ago', category: 'public' },
  { id: 'f-10', text: 'Budget model v3 published', timestamp: '2d ago', category: 'milestone' },
];

const FEED_CATEGORY_VISIBILITY: Record<string, BusinessRoleLens[]> = {
  approval: ['B1'],
  board: ['B1', 'B2b'],
  media: ['B1', 'B2a', 'B2b', 'B3', 'B4'],
  compliance: ['B1'],
  milestone: ['B1', 'B2a', 'B2b'],
  investor_update: ['B1', 'B2a', 'B2b'],
  public: ['B1', 'B2a', 'B2b', 'B3', 'B4', 'B5'],
};

function getVisibleFeed(role: BusinessRoleLens): FeedItem[] {
  return FEED_ITEMS.filter((item) => {
    const allowed = FEED_CATEGORY_VISIBILITY[item.category];
    return allowed ? allowed.includes(role) : false;
  });
}

// --- Block 6: Pinned Shelf ---

interface PinnedItem {
  id: string;
  title: string;
  icon: string;
  badge?: string;
  badgeColor?: string;
  targetTab?: number;
}

const PINNED_SHELF: PinnedItem[] = [
  { id: 'pin-1', title: 'Board Room', icon: 'person.3.fill', badge: 'DUE SOON', badgeColor: '#F59E0B', targetTab: 5 },
  { id: 'pin-2', title: 'Fundraising Workspace', icon: 'briefcase.fill', targetTab: 8 },
  { id: 'pin-3', title: 'Term Sheet', icon: 'doc.text.fill', badge: 'BLOCKER', badgeColor: '#EF4444', targetTab: 8 },
  { id: 'pin-4', title: 'Budget', icon: 'dollarsign.circle.fill', targetTab: 3 },
  { id: 'pin-5', title: 'Settlement Queue', icon: 'creditcard.fill', badge: 'DUE SOON', badgeColor: '#F59E0B', targetTab: 4 },
];

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
  onPress,
}: {
  label: string;
  icon: string;
  colors: typeof Colors.light;
  onPress?: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.ctaButton,
        { borderColor: colors.borderStrong, opacity: pressed ? 0.7 : 1 },
      ]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={14} color={colors.textSecondary} />
      <ThemedText style={[s.ctaLabel, { color: colors.textSecondary }]}>{label}</ThemedText>
    </Pressable>
  );
}

// =============================================================================
// BLOCK 0 — HERO VIDEO
// =============================================================================

function HeroVideoBlock({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  const colorScheme = useColorScheme() ?? 'light';
  const c = Colors[colorScheme];

  // CTA by role
  let ctaLabel = 'Open Media/Proof';
  if (!isFounder(role) && isBoardLevel(role)) {
    ctaLabel = 'Open Board Pack Media';
  } else if (isInvestor(role) && !isBoardLevel(role)) {
    ctaLabel = 'Investor Updates';
  } else if (!isFounder(role) && !isInvestor(role)) {
    ctaLabel = 'Watch Featured';
  }

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={s.heroContainer}>
      <Pressable
        style={({ pressed }) => [
          s.heroCard,
          { backgroundColor: '#1a1a2e', opacity: pressed ? 0.9 : 1 },
        ]}
        onPress={handlePress}
      >
        {/* PINNED badge */}
        <View style={s.pinnedBadge}>
          <IconSymbol name="pin.fill" size={10} color="#fff" />
          <ThemedText style={s.pinnedText}>PINNED</ThemedText>
        </View>

        {/* Center play icon */}
        <View style={s.playOverlay}>
          <View style={s.playCircle}>
            <IconSymbol name="play.fill" size={28} color="#fff" />
          </View>
        </View>

        {/* Duration badge */}
        <View style={s.durationBadge}>
          <ThemedText style={s.durationText}>3:42</ThemedText>
        </View>

        {/* Bottom overlay */}
        <View style={s.bottomOverlay}>
          <ThemedText style={s.heroTitle} numberOfLines={2}>
            KaNeXT OS v2 {'\u2014'} Live Demo Walkthrough
          </ThemedText>
          <ThemedText style={s.heroSubtitle} numberOfLines={1}>
            Pinned by CEO {'\u00B7'} Updated Feb 17 {'\u00B7'} 3:42
          </ThemedText>
        </View>
      </Pressable>

      {/* CTA row */}
      <Pressable
        style={({ pressed }) => [
          s.heroCTARow,
          { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.8 : 1 },
        ]}
        onPress={handlePress}
      >
        <IconSymbol name="play.rectangle.fill" size={16} color={c.text} />
        <ThemedText style={[s.heroCTAText, { color: c.text }]}>{ctaLabel}</ThemedText>
        <IconSymbol name="chevron.right" size={12} color={c.textSecondary} />
      </Pressable>
    </View>
  );
}

// =============================================================================
// BLOCK 1 — CONTEXT SNAPSHOT (6 KPI CHIPS)
// =============================================================================

function ContextSnapshot({ colors, role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  const metricVis = getMetricVisibility(role);
  const visibleKPIs = CONTEXT_KPIS.filter((kpi) => {
    // Pipeline is hidden for retail/public
    if (kpi.founderOnly && !isFounder(role) && !isBoardLevel(role)) return false;
    return true;
  });

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="CONTEXT SNAPSHOT" colors={colors} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.kpiScroll}
      >
        {visibleKPIs.map((kpi) => {
          const displayValue =
            metricVis === 'exact'
              ? kpi.exactValue
              : metricVis === 'banded'
                ? kpi.bandedValue || kpi.exactValue
                : kpi.exactValue;

          return (
            <View
              key={kpi.id}
              style={[s.kpiChip, { backgroundColor: colors.backgroundTertiary, borderColor: colors.border }]}
            >
              <View style={s.kpiChipHeader}>
                {kpi.dotColor ? (
                  <View style={[s.kpiDot, { backgroundColor: kpi.dotColor }]} />
                ) : (
                  <IconSymbol name={kpi.icon as any} size={12} color={colors.textSecondary} />
                )}
                <ThemedText style={[s.kpiChipLabel, { color: colors.textSecondary }]}>
                  {kpi.label}
                </ThemedText>
              </View>
              <ThemedText style={[s.kpiChipValue, { color: colors.text }]} numberOfLines={1}>
                {displayValue}
              </ThemedText>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// BLOCK 2 — TODAY + NEXT
// =============================================================================

function TodayNextBlock({ colors, role: _role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="TODAY + NEXT" colors={colors} />
      <View style={s.todayNextRow}>
        {/* TODAY card */}
        <View style={[s.todayCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Today</ThemedText>
          {TODAY_ITEMS.map((item) => (
            <View key={item.id} style={s.todayItem}>
              <View style={s.todayItemTop}>
                <ThemedText style={[s.todayItemTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.title}
                </ThemedText>
                {item.badge && (
                  <View style={[s.decisionBadge, { backgroundColor: '#F59E0B20' }]}>
                    <ThemedText style={[s.decisionBadgeText, { color: '#F59E0B' }]}>
                      {item.badge}
                    </ThemedText>
                  </View>
                )}
              </View>
              <ThemedText style={[s.todayItemMeta, { color: colors.textSecondary }]}>
                {item.owner} {'\u00B7'} {item.time}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* NEXT card */}
        <View style={[s.nextCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.cardHeading, { color: colors.text }]}>Next</ThemedText>
          <ThemedText style={[s.nextTitle, { color: colors.text }]} numberOfLines={2}>
            {NEXT_ITEM.title} {'\u2014'} {NEXT_ITEM.participants}
          </ThemedText>
          <View style={s.nextCountdownRow}>
            <IconSymbol name="clock.fill" size={12} color={colors.textSecondary} />
            <ThemedText style={[s.nextCountdown, { color: colors.text }]}>
              {NEXT_ITEM.countdown}
            </ThemedText>
          </View>
          <View style={s.nextReadinessRow}>
            <ThemedText style={[s.nextReadinessLabel, { color: colors.textSecondary }]}>
              Readiness:
            </ThemedText>
            <View style={[s.readinessBadge, { backgroundColor: NEXT_ITEM.readinessColor + '20' }]}>
              <ThemedText style={[s.readinessBadgeText, { color: NEXT_ITEM.readinessColor }]}>
                {NEXT_ITEM.readiness}
              </ThemedText>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 3 — ALERTS STRIP
// =============================================================================

function AlertsStrip({ colors, role: _role }: { colors: typeof Colors.light; role: BusinessRoleLens }) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="ALERTS" colors={colors} />
      <Card colors={colors}>
        {ALERTS.map((alert, idx) => (
          <View
            key={alert.id}
            style={[
              s.alertRow,
              idx < ALERTS.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
          >
            {/* Severity dot */}
            <View style={[s.alertDot, { backgroundColor: ALERT_SEVERITY_COLOR[alert.severity] }]} />

            {/* Type badge */}
            <View
              style={[
                s.alertTypeBadge,
                { backgroundColor: ALERT_SEVERITY_COLOR[alert.severity] + '20' },
              ]}
            >
              <ThemedText
                style={[s.alertTypeBadgeText, { color: ALERT_SEVERITY_COLOR[alert.severity] }]}
              >
                {alert.type}
              </ThemedText>
            </View>

            {/* Content */}
            <View style={s.alertContent}>
              <ThemedText style={[s.alertTitle, { color: colors.text }]} numberOfLines={1}>
                {alert.title}
              </ThemedText>
              <ThemedText style={[s.alertMeta, { color: colors.textSecondary }]}>
                {alert.owner} {'\u00B7'} {alert.time}
              </ThemedText>
            </View>
          </View>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 4 — QUICK ACTIONS (CEO EXECUTION GRID)
// =============================================================================

const QUICK_ACTION_TAB_MAP: Record<string, number> = {
  'qa-board-pack': 5,
  'qa-investor-update': 5,
  'qa-ops-command': 2,
  'qa-finance': 3,
  'qa-payment-rails': 4,
  'qa-compliance': 6,
  'qa-people': 2,
  'qa-data-room': 8,
};

function QuickActionsGrid({
  colors,
  role,
  onSwitchTab,
}: {
  colors: typeof Colors.light;
  role: BusinessRoleLens;
  onSwitchTab?: (index: number) => void;
}) {
  const actions = getQuickActions(role);

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="QUICK ACTIONS" colors={colors} />
      <View style={s.actionGrid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              s.actionTile,
              {
                backgroundColor: colors.backgroundTertiary,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const tabIndex = QUICK_ACTION_TAB_MAP[action.id];
              if (tabIndex != null && onSwitchTab) {
                onSwitchTab(tabIndex);
              }
            }}
          >
            <IconSymbol name={action.icon as any} size={20} color={colors.textSecondary} />
            <ThemedText style={[s.actionTileLabel, { color: colors.text }]} numberOfLines={2}>
              {action.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// =============================================================================
// BLOCK 5 — FEED PREVIEW
// =============================================================================

const FEED_CATEGORY_TAB_MAP: Record<string, number> = {
  approval: 3,
  board: 5,
  media: 7,
  compliance: 6,
  milestone: 2,
  investor_update: 5,
  public: 7,
};

function FeedPreview({
  colors,
  role,
  onSwitchTab,
}: {
  colors: typeof Colors.light;
  role: BusinessRoleLens;
  onSwitchTab?: (index: number) => void;
}) {
  const visibleFeed = getVisibleFeed(role).slice(0, 10);

  if (visibleFeed.length === 0) return null;

  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="FEED" colors={colors} />
      <Card colors={colors}>
        {visibleFeed.map((item, idx) => (
          <Pressable
            key={item.id}
            style={[
              s.feedRow,
              idx < visibleFeed.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: colors.border,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              const tabIndex = FEED_CATEGORY_TAB_MAP[item.category];
              if (tabIndex != null && onSwitchTab) {
                onSwitchTab(tabIndex);
              }
            }}
          >
            <View style={s.feedTextBlock}>
              <ThemedText style={[s.feedText, { color: colors.text }]} numberOfLines={1}>
                {item.text}
              </ThemedText>
              <ThemedText style={[s.feedTimestamp, { color: colors.textTertiary }]}>
                {item.timestamp}
              </ThemedText>
            </View>
            <IconSymbol name="chevron.right" size={10} color={colors.textTertiary} />
          </Pressable>
        ))}
      </Card>
    </View>
  );
}

// =============================================================================
// BLOCK 6 — PINNED SHELF
// =============================================================================

function PinnedShelf({
  colors,
  role: _role,
  onSwitchTab,
}: {
  colors: typeof Colors.light;
  role: BusinessRoleLens;
  onSwitchTab?: (index: number) => void;
}) {
  return (
    <View style={s.moduleContainer}>
      <SectionHeader title="PINNED" colors={colors} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.pinnedScroll}
      >
        {PINNED_SHELF.map((item) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              s.pinnedCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (item.targetTab != null && onSwitchTab) {
                onSwitchTab(item.targetTab);
              }
            }}
          >
            <IconSymbol name={item.icon as any} size={24} color={colors.textSecondary} />
            <ThemedText style={[s.pinnedTitle, { color: colors.text }]} numberOfLines={2}>
              {item.title}
            </ThemedText>
            {item.badge && (
              <View style={[s.shelfBadge, { backgroundColor: (item.badgeColor ?? '#F59E0B') + '20' }]}>
                <ThemedText style={[s.shelfBadgeText, { color: item.badgeColor ?? '#F59E0B' }]}>
                  {item.badge}
                </ThemedText>
              </View>
            )}
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BusinessDashboardV2({ colors, role = 'B1', onSwitchTab }: Props) {
  return (
    <ScrollView
      style={[s.container, { backgroundColor: colors.background }]}
      contentContainerStyle={s.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Block 0 — Hero Video */}
      <HeroVideoBlock colors={colors} role={role} />

      {/* Block 1 — Context Snapshot */}
      <ContextSnapshot colors={colors} role={role} />

      {/* Block 2 — Today + Next */}
      <TodayNextBlock colors={colors} role={role} />

      {/* Block 3 — Alerts Strip */}
      {(isFounder(role) || isBoardLevel(role)) && (
        <AlertsStrip colors={colors} role={role} />
      )}

      {/* Block 4 — Quick Actions */}
      <QuickActionsGrid colors={colors} role={role} onSwitchTab={onSwitchTab} />

      {/* Block 5 — Feed Preview */}
      <FeedPreview colors={colors} role={role} onSwitchTab={onSwitchTab} />

      {/* Block 6 — Pinned Shelf */}
      {(isFounder(role) || isBoardLevel(role)) && (
        <PinnedShelf colors={colors} role={role} onSwitchTab={onSwitchTab} />
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

  // ---- Block 0: Hero Video ----
  heroContainer: {
    marginBottom: Spacing.lg,
  },
  heroCard: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2,
  },
  pinnedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  playCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 3,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 52,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  durationText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 14,
    paddingBottom: 12,
    paddingTop: 30,
    zIndex: 2,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  heroSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 3,
  },
  heroCTARow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  heroCTAText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },

  // ---- Block 1: Context Snapshot KPIs ----
  kpiScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  kpiChip: {
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kpiChipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 4,
  },
  kpiDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  kpiChipLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  kpiChipValue: {
    fontSize: 14,
    fontWeight: '700',
  },

  // ---- Block 2: Today + Next ----
  todayNextRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  todayCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  nextCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
  },
  todayItem: {
    marginBottom: Spacing.sm,
  },
  todayItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  todayItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  decisionBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  decisionBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  todayItemMeta: {
    fontSize: 11,
  },
  nextTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: Spacing.sm,
    lineHeight: 18,
  },
  nextCountdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  nextCountdown: {
    fontSize: 14,
    fontWeight: '700',
  },
  nextReadinessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextReadinessLabel: {
    fontSize: 11,
  },
  readinessBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  readinessBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ---- Block 3: Alerts Strip ----
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
  },
  alertDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  alertTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  alertTypeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
    lineHeight: 17,
  },
  alertMeta: {
    fontSize: 11,
  },

  // ---- Block 4: Quick Actions Grid ----
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionTile: {
    width: '31%',
    aspectRatio: 1.1,
    borderRadius: BorderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  actionTileLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },

  // ---- Block 5: Feed Preview ----
  feedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  feedTextBlock: {
    flex: 1,
  },
  feedText: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  feedTimestamp: {
    fontSize: 11,
  },

  // ---- Block 6: Pinned Shelf ----
  pinnedScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  pinnedCard: {
    width: 120,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pinnedTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 16,
  },
  shelfBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  shelfBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
