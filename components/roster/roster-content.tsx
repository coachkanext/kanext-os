/**
 * Roster — 3-page swipeable layout for sports mode.
 * Page 0: Players — summary card, position filter pills, player list.
 * Page 1: Management — section pills, scholarships/eligibility/health/squads/housing/NIL/compliance.
 * Page 2: Board — pipeline stages as vertical sections with prospect cards.
 * Identical SwipeablePages / LongPressContextMenu patterns as Parish/Campus/Office.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { SwipeablePages } from '@/components/ui/swipeable-two-page';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import {
  ROSTER_SUMMARY,
  SCHOLARSHIP_ENTRIES,
  ELIGIBILITY_ENTRIES,
  HEALTH_ENTRIES,
  SQUAD_ENTRIES,
  HOUSING_ENTRIES,
  NIL_ENTRIES,
  COMPLIANCE_ITEMS,
  PIPELINE_COUNTS,
  getPlayers,
  getProspectsByStage,
  type RosterPlayerItem,
  type PlayerFilter,
  type PlayerSort,
  type ManagementSection,
  type ProspectFilter,
  type PipelineStage,
  type ScholarshipType,
  type EligibilityStatus,
  type HealthStatus,
  type SquadType,
  type NILStatus,
  type ComplianceStatus,
  type ProspectCard as ProspectCardType,
} from '@/data/mock-roster-screen';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ── Color Maps ──

const SCHOLARSHIP_COLORS: Record<ScholarshipType, string> = {
  full: '#22C55E',
  partial: '#F59E0B',
  'walk-on': '#A1A1AA',
};

const SCHOLARSHIP_LABELS: Record<ScholarshipType, string> = {
  full: 'Full',
  partial: 'Partial',
  'walk-on': 'Walk-on',
};

const ELIGIBILITY_COLORS: Record<EligibilityStatus, string> = {
  eligible: '#22C55E',
  warning: '#F59E0B',
  ineligible: '#EF4444',
};

const ELIGIBILITY_LABELS: Record<EligibilityStatus, string> = {
  eligible: 'Eligible',
  warning: 'Warning',
  ineligible: 'Ineligible',
};

const HEALTH_COLORS: Record<HealthStatus, string> = {
  healthy: '#22C55E',
  'day-to-day': '#F59E0B',
  out: '#EF4444',
};

const HEALTH_LABELS: Record<HealthStatus, string> = {
  healthy: 'Healthy',
  'day-to-day': 'Day-to-Day',
  out: 'Out',
};

const SQUAD_COLORS: Record<SquadType, string> = {
  varsity: '#3B82F6',
  jv: '#8B5CF6',
  practice: '#F59E0B',
  redshirt: '#A1A1AA',
  inactive: '#52525B',
};

const SQUAD_LABELS: Record<SquadType, string> = {
  varsity: 'Varsity',
  jv: 'JV',
  practice: 'Practice',
  redshirt: 'Redshirt',
  inactive: 'Inactive',
};

const NIL_STATUS_COLORS: Record<NILStatus, string> = {
  active: '#22C55E',
  pending: '#F59E0B',
  completed: '#3B82F6',
  expired: '#A1A1AA',
};

const NIL_STATUS_LABELS: Record<NILStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  completed: 'Completed',
  expired: 'Expired',
};

const COMPLIANCE_STATUS_COLORS: Record<ComplianceStatus, string> = {
  approved: '#22C55E',
  'under-review': '#F59E0B',
  flagged: '#EF4444',
};

const COMPLIANCE_STATUS_LABELS: Record<ComplianceStatus, string> = {
  approved: 'Approved',
  'under-review': 'Under Review',
  flagged: 'Flagged',
};

const COMPLIANCE_ITEM_COLORS: Record<'ok' | 'warning' | 'violation', string> = {
  ok: '#22C55E',
  warning: '#F59E0B',
  violation: '#EF4444',
};

const PIPELINE_COLORS: Record<PipelineStage, string> = {
  watching: '#A1A1AA',
  contacted: '#F59E0B',
  visited: '#3B82F6',
  offered: '#8B5CF6',
  committed: '#22C55E',
};

const PIPELINE_LABELS: Record<PipelineStage, string> = {
  watching: 'Watching',
  contacted: 'Contacted',
  visited: 'Visited',
  offered: 'Offered',
  committed: 'Committed',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Filter Pills (generic) ────────────────────────────────────────────────

function FilterPills<T extends string>({
  items,
  active,
  onSelect,
}: {
  items: { key: T; label: string }[];
  active: T;
  onSelect: (key: T) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {items.map((item) => {
        const isActive = active === item.key;
        return (
          <Pressable
            key={item.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(item.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{item.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Roster Summary Card ─────────────────────────────────────────────────────

function RosterSummaryCard() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const positions: Array<{ key: string; count: number }> = [
    { key: 'PG', count: ROSTER_SUMMARY.positionBreakdown.PG },
    { key: 'CG', count: ROSTER_SUMMARY.positionBreakdown.CG },
    { key: 'W',  count: ROSTER_SUMMARY.positionBreakdown.W },
    { key: 'F',  count: ROSTER_SUMMARY.positionBreakdown.F },
    { key: 'B',  count: ROSTER_SUMMARY.positionBreakdown.B },
  ];

  return (
    <View style={s.summaryCard}>
      <View style={s.summaryHeader}>
        <Text style={s.summaryLabel}>ROSTER</Text>
        <View style={s.summaryBadge}>
          <Text style={s.summaryBadgeText}>{ROSTER_SUMMARY.totalPlayers} players</Text>
        </View>
      </View>
      <View style={s.summaryPositions}>
        {positions.map((p) => (
          <View key={p.key} style={s.summaryPosItem}>
            <Text style={s.summaryPosCount}>{p.count}</Text>
            <Text style={s.summaryPosLabel}>{p.key}</Text>
          </View>
        ))}
      </View>
      <View style={s.summaryFooter}>
        <Text style={s.summaryScholarship}>
          {ROSTER_SUMMARY.scholarshipCount} scholarships
        </Text>
      </View>
    </View>
  );
}

// ─── Player Row ──────────────────────────────────────────────────────────────

function PlayerRow({
  player,
  onLongPress,
}: {
  player: RosterPlayerItem;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const scholarshipColor = SCHOLARSHIP_COLORS[player.scholarship];
  const eligibilityColor = ELIGIBILITY_COLORS[player.eligibility];
  const healthColor = HEALTH_COLORS[player.health];

  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.playerAvatar}>
        <Text style={s.playerInitials}>{player.initials}</Text>
      </View>
      <View style={s.rowContent}>
        <View style={s.playerNameRow}>
          <Text style={s.rowName} numberOfLines={1}>{player.name}</Text>
          <Text style={s.jerseyNumber}>#{player.jerseyNumber}</Text>
        </View>
        <View style={s.playerMetaRow}>
          <View style={[s.positionPill, { backgroundColor: '#3B82F6' + '22' }]}>
            <Text style={[s.positionPillText, { color: '#3B82F6' }]}>{player.position}</Text>
          </View>
          <Text style={s.playerMeta}>{player.classYear}</Text>
          <Text style={s.playerDot}>·</Text>
          <Text style={s.playerMeta}>{player.height} · {player.weight}lb</Text>
        </View>
        <View style={s.playerMetaRow}>
          <View style={[s.microBadge, { backgroundColor: scholarshipColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: scholarshipColor }]}>{SCHOLARSHIP_LABELS[player.scholarship]}</Text>
          </View>
          <View style={[s.statusDot, { backgroundColor: eligibilityColor }]} />
          <View style={[s.statusDot, { backgroundColor: healthColor }]} />
        </View>
      </View>
      <View style={s.krContainer}>
        <Text style={s.krValue}>{player.krRating}</Text>
        <Text style={s.krLabel}>KR</Text>
      </View>
    </Pressable>
  );
}

// ─── Scholarship Row ─────────────────────────────────────────────────────────

function ScholarshipRow({ entry }: { entry: typeof SCHOLARSHIP_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const typeColor = SCHOLARSHIP_COLORS[entry.type];
  const statusColor = entry.status === 'active' ? '#22C55E' : entry.status === 'expiring' ? '#F59E0B' : '#3B82F6';
  const statusLabel = entry.status === 'active' ? 'Active' : entry.status === 'expiring' ? 'Expiring' : 'Renewed';

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.playerName}</Text>
        <View style={s.mgmtMetaRow}>
          <View style={[s.microBadge, { backgroundColor: typeColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: typeColor }]}>{SCHOLARSHIP_LABELS[entry.type]}</Text>
          </View>
          <Text style={s.mgmtMeta}>{entry.amount}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>Renewal: {entry.renewalDate}</Text>
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </View>
  );
}

// ─── Eligibility Row ─────────────────────────────────────────────────────────

function EligibilityRow({ entry }: { entry: typeof ELIGIBILITY_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = ELIGIBILITY_COLORS[entry.status];
  const statusLabel = ELIGIBILITY_LABELS[entry.status];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.playerName}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>GPA: {entry.gpa.toFixed(1)}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{entry.creditsCompleted}/{entry.creditsNeeded} credits</Text>
        </View>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </View>
  );
}

// ─── Health Row ──────────────────────────────────────────────────────────────

function HealthRow({ entry }: { entry: typeof HEALTH_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = HEALTH_COLORS[entry.status];
  const statusLabel = HEALTH_LABELS[entry.status];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.playerName}</Text>
        {entry.injuryDetail && (
          <Text style={s.mgmtDescription} numberOfLines={1}>{entry.injuryDetail}</Text>
        )}
        <View style={s.mgmtMetaRow}>
          <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          {entry.returnTimeline && (
            <Text style={s.mgmtMeta}>Return: {entry.returnTimeline}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// ─── Squad Section ───────────────────────────────────────────────────────────

function SquadSection() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const squads: Array<SquadType> = ['varsity', 'jv', 'practice', 'redshirt', 'inactive'];

  return (
    <>
      {squads.map((squad) => {
        const entries = SQUAD_ENTRIES.filter((e) => e.squad === squad);
        if (entries.length === 0) return null;
        const color = SQUAD_COLORS[squad];
        return (
          <View key={squad}>
            <View style={s.squadHeader}>
              <View style={[s.statusDot, { backgroundColor: color }]} />
              <Text style={s.squadHeaderText}>{SQUAD_LABELS[squad]}</Text>
              <Text style={s.squadCount}>{entries.length}</Text>
            </View>
            {entries.map((entry) => (
              <View key={entry.id} style={s.squadRow}>
                <View style={s.mgmtAvatar}>
                  <Text style={s.mgmtInitials}>{entry.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.mgmtName}>{entry.playerName}</Text>
                  <View style={s.mgmtMetaRow}>
                    <View style={[s.microBadge, { backgroundColor: '#3B82F6' + '22' }]}>
                      <Text style={[s.microBadgeText, { color: '#3B82F6' }]}>{entry.position}</Text>
                    </View>
                    <Text style={s.mgmtMeta}>{entry.classYear}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      })}
    </>
  );
}

// ─── Housing Row ─────────────────────────────────────────────────────────────

function HousingRow({ entry }: { entry: typeof HOUSING_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const rentColor = entry.rentStatus === 'paid' ? '#22C55E' : entry.rentStatus === 'overdue' ? '#EF4444' : '#F59E0B';
  const rentLabel = entry.rentStatus === 'paid' ? 'Paid' : entry.rentStatus === 'overdue' ? 'Overdue' : 'Due';

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.playerName}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{entry.building}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>Room {entry.room}</Text>
        </View>
        {entry.roommate && (
          <Text style={s.mgmtDescription}>Roommate: {entry.roommate}</Text>
        )}
      </View>
      {entry.rentStatus && (
        <View style={[s.statusBadge, { backgroundColor: rentColor + '22' }]}>
          <Text style={[s.statusBadgeText, { color: rentColor }]}>{rentLabel}</Text>
        </View>
      )}
    </View>
  );
}

// ─── NIL Row ─────────────────────────────────────────────────────────────────

function NILRow({ entry }: { entry: typeof NIL_ENTRIES[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const nilColor = NIL_STATUS_COLORS[entry.nilStatus];
  const nilLabel = NIL_STATUS_LABELS[entry.nilStatus];
  const compColor = COMPLIANCE_STATUS_COLORS[entry.complianceStatus];
  const compLabel = COMPLIANCE_STATUS_LABELS[entry.complianceStatus];

  return (
    <View style={s.mgmtRow}>
      <View style={s.mgmtAvatar}>
        <Text style={s.mgmtInitials}>{entry.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.mgmtName}>{entry.playerName}</Text>
        <Text style={s.mgmtDescription} numberOfLines={1}>{entry.dealName} — {entry.brandName}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={[s.mgmtMeta, { color: '#FFFFFF', fontWeight: '600' }]}>{entry.dealValue}</Text>
          <View style={[s.microBadge, { backgroundColor: nilColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: nilColor }]}>{nilLabel}</Text>
          </View>
          <View style={[s.microBadge, { backgroundColor: compColor + '22' }]}>
            <Text style={[s.microBadgeText, { color: compColor }]}>{compLabel}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── Compliance Row ──────────────────────────────────────────────────────────

function ComplianceRow({ item }: { item: typeof COMPLIANCE_ITEMS[0] }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const statusColor = COMPLIANCE_ITEM_COLORS[item.status];

  return (
    <View style={s.mgmtRow}>
      <View style={[s.complianceIndicator, { backgroundColor: statusColor }]} />
      <View style={{ flex: 1 }}>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{item.category}</Text>
        </View>
        <Text style={s.mgmtName}>{item.metric}</Text>
        <View style={s.mgmtMetaRow}>
          <Text style={[s.mgmtMeta, { color: statusColor, fontWeight: '600' }]}>{item.current}</Text>
          <Text style={s.mgmtDot}>/</Text>
          <Text style={s.mgmtMeta}>{item.limit}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Prospect Card View ──────────────────────────────────────────────────────

function ProspectCardView({
  prospect,
  onLongPress,
}: {
  prospect: ProspectCardType;
  onLongPress: (pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.prospectCard, pressed && s.rowPressed]}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.prospectAvatar}>
        <Text style={s.prospectInitials}>{prospect.initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={s.playerNameRow}>
          <Text style={s.mgmtName}>{prospect.name}</Text>
          <View style={[s.positionPill, { backgroundColor: '#3B82F6' + '22' }]}>
            <Text style={[s.positionPillText, { color: '#3B82F6' }]}>{prospect.position}</Text>
          </View>
        </View>
        <View style={s.mgmtMetaRow}>
          <Text style={s.mgmtMeta}>{prospect.currentSchool}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{prospect.level}</Text>
          <Text style={s.mgmtDot}>·</Text>
          <Text style={s.mgmtMeta}>{prospect.classYear}</Text>
        </View>
        <View style={s.mgmtMetaRow}>
          {prospect.inPortal && (
            <View style={[s.microBadge, { backgroundColor: '#8B5CF6' + '22' }]}>
              <Text style={[s.microBadgeText, { color: '#8B5CF6' }]}>Portal</Text>
            </View>
          )}
          <Text style={s.prospectAction}>{prospect.lastAction}</Text>
        </View>
      </View>
      <View style={s.krContainer}>
        <Text style={s.krValue}>{prospect.krRating}</Text>
        <Text style={s.krLabel}>KR</Text>
      </View>
    </Pressable>
  );
}

// ─── Pipeline Section ────────────────────────────────────────────────────────

function PipelineSection({
  stage,
  prospects,
  onLongPress,
}: {
  stage: PipelineStage;
  prospects: ProspectCardType[];
  onLongPress: (prospect: ProspectCardType, pageY: number) => void;
}) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const color = PIPELINE_COLORS[stage];
  const label = PIPELINE_LABELS[stage];

  if (prospects.length === 0) return null;

  return (
    <View>
      <View style={s.pipelineHeader}>
        <View style={[s.statusDot, { backgroundColor: color }]} />
        <Text style={s.pipelineHeaderText}>{label}</Text>
        <View style={[s.pipelineCountBadge, { backgroundColor: color + '22' }]}>
          <Text style={[s.pipelineCountText, { color }]}>{prospects.length}</Text>
        </View>
      </View>
      {prospects.map((prospect) => (
        <ProspectCardView
          key={prospect.id}
          prospect={prospect}
          onLongPress={(pageY) => onLongPress(prospect, pageY)}
        />
      ))}
    </View>
  );
}

// ─── Section Header ──────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <View style={s.sectionHeader}>
      <Text style={s.sectionHeaderText}>{title}</Text>
    </View>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color={C.label} />
    </Pressable>
  );
}

// ─── Filter Data ─────────────────────────────────────────────────────────────

const PLAYER_FILTERS: { key: PlayerFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'PG',  label: 'PG' },
  { key: 'CG',  label: 'CG' },
  { key: 'W',   label: 'W' },
  { key: 'F',   label: 'F' },
  { key: 'B',   label: 'B' },
];

const MGMT_SECTIONS: { key: ManagementSection; label: string }[] = [
  { key: 'scholarships', label: 'Scholarships' },
  { key: 'eligibility',  label: 'Eligibility' },
  { key: 'health',       label: 'Health' },
  { key: 'squads',       label: 'Squads' },
  { key: 'housing',      label: 'Housing' },
  { key: 'nil',          label: 'NIL' },
  { key: 'compliance',   label: 'Compliance' },
];

const PROSPECT_FILTERS: { key: ProspectFilter; label: string }[] = [
  { key: 'all',         label: 'All' },
  { key: 'by-position', label: 'By Position' },
  { key: 'by-class',    label: 'By Class' },
  { key: 'by-level',    label: 'By Level' },
  { key: 'portal',      label: 'Portal Only' },
];

const PIPELINE_STAGES: PipelineStage[] = ['watching', 'contacted', 'visited', 'offered', 'committed'];

// ─── Main Component ──────────────────────────────────────────────────────────

export function RosterContent() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [playerFilter, setPlayerFilter] = useState<PlayerFilter>('all');
  const [playerSort] = useState<PlayerSort>('kr');
  const [mgmtSection, setMgmtSection] = useState<ManagementSection>('scholarships');
  const [prospectFilter, setProspectFilter] = useState<ProspectFilter>('all');

  // ── Data ──
  const filteredPlayers = useMemo(() => getPlayers(playerFilter, playerSort), [playerFilter, playerSort]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: Player ──
  const longPressPlayer = useCallback((player: RosterPlayerItem, pageY: number) => {
    setMenuData({
      title: player.name,
      subtitle: `#${player.jerseyNumber} · ${player.position} · ${player.classYear}`,
      initials: player.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'inactive', label: 'Move to Inactive', icon: 'archivebox.fill' },
        { key: 'transfer', label: 'Transfer', icon: 'arrow.right', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  // ── Long press: Prospect ──
  const longPressProspect = useCallback((prospect: ProspectCardType, pageY: number) => {
    setMenuData({
      title: prospect.name,
      subtitle: `${prospect.position} · ${prospect.currentSchool} · ${prospect.level}`,
      initials: prospect.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'call', label: 'Call', icon: 'phone.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'notes', label: 'Add Notes', icon: 'doc.badge.plus' },
        { key: 'remove', label: 'Remove from Board', icon: 'trash.fill', destructive: true },
      ],
      onAction: () => {},
    });
  }, []);

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: PLAYERS ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Players" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            <RosterSummaryCard />
            <View style={{ marginTop: 4 }}>
              <FilterPills items={PLAYER_FILTERS} active={playerFilter} onSelect={setPlayerFilter} />
            </View>
            {filteredPlayers.map((player, idx) => (
              <View key={player.id}>
                {idx > 0 && <View style={s.separator} />}
                <PlayerRow
                  player={player}
                  onLongPress={(pageY) => longPressPlayer(player, pageY)}
                />
              </View>
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>

        {/* ── PAGE 1: MANAGEMENT ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Management" />
            <FilterPills items={MGMT_SECTIONS} active={mgmtSection} onSelect={setMgmtSection} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {mgmtSection === 'scholarships' && (
              <>
                <SectionHeader title="Scholarships" />
                {SCHOLARSHIP_ENTRIES.map((entry) => (
                  <ScholarshipRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'eligibility' && (
              <>
                <SectionHeader title="Academic Eligibility" />
                {ELIGIBILITY_ENTRIES.map((entry) => (
                  <EligibilityRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'health' && (
              <>
                <SectionHeader title="Health & Injuries" />
                {HEALTH_ENTRIES.map((entry) => (
                  <HealthRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'squads' && (
              <>
                <SectionHeader title="Squad Assignments" />
                <SquadSection />
              </>
            )}
            {mgmtSection === 'housing' && (
              <>
                <SectionHeader title="Player Housing" />
                {HOUSING_ENTRIES.map((entry) => (
                  <HousingRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'nil' && (
              <>
                <SectionHeader title="NIL Deals" />
                {NIL_ENTRIES.map((entry) => (
                  <NILRow key={entry.id} entry={entry} />
                ))}
              </>
            )}
            {mgmtSection === 'compliance' && (
              <>
                <SectionHeader title="Compliance Dashboard" />
                {COMPLIANCE_ITEMS.map((item) => (
                  <ComplianceRow key={item.id} item={item} />
                ))}
              </>
            )}
          </ScrollView>
        </View>

        {/* ── PAGE 2: BOARD ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Board" />
            <FilterPills items={PROSPECT_FILTERS} active={prospectFilter} onSelect={setProspectFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {PIPELINE_STAGES.map((stage) => (
              <PipelineSection
                key={stage}
                stage={stage}
                prospects={getProspectsByStage(stage)}
                onLongPress={longPressProspect}
              />
            ))}
          </ScrollView>
          <FAB onPress={() => {}} />
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  pageScroll: { flex: 1 },

  // Top bar
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  topBarTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Filter pills
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 4,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: C.surface,
  },
  filterPillActive: {
    backgroundColor: C.label,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
  },
  filterTextActive: {
    color: '#000000',
  },

  // Summary card
  summaryCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.surface,
    borderRadius: 12,
    padding: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
    letterSpacing: 0.5,
  },
  summaryBadge: {
    backgroundColor: C.blue + '22',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.blue,
  },
  summaryPositions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  summaryPosItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryPosCount: {
    fontSize: 20,
    fontWeight: '700',
    color: C.label,
  },
  summaryPosLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: C.secondary,
  },
  summaryFooter: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: C.separator,
    paddingTop: 10,
  },
  summaryScholarship: {
    fontSize: 13,
    color: C.muted,
  },

  // Shared row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  rowPressed: {
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  rowContent: { flex: 1, marginLeft: 12, marginRight: 8 },
  rowName: { fontSize: 16, fontWeight: '500', color: C.label },

  // Player row
  playerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  playerNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  jerseyNumber: { fontSize: 13, fontWeight: '600', color: C.muted },
  playerMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  playerMeta: { fontSize: 12, color: C.muted },
  playerDot: { fontSize: 12, color: C.muted },
  positionPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  positionPillText: { fontSize: 10, fontWeight: '700' },
  microBadge: { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3 },
  microBadgeText: { fontSize: 9, fontWeight: '700' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  krContainer: { alignItems: 'center', minWidth: 36 },
  krValue: { fontSize: 18, fontWeight: '700', color: C.label },
  krLabel: { fontSize: 9, fontWeight: '600', color: C.muted },

  // Management rows
  mgmtRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 10,
  },
  mgmtAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mgmtInitials: {
    fontSize: 11,
    fontWeight: '700',
    color: C.label,
  },
  mgmtName: {
    fontSize: 15,
    fontWeight: '500',
    color: C.label,
  },
  mgmtDescription: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },
  mgmtMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  mgmtMeta: {
    fontSize: 12,
    color: C.muted,
  },
  mgmtDot: {
    fontSize: 12,
    color: C.muted,
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  statusBadgeText: { fontSize: 11, fontWeight: '600' },

  // Squad section
  squadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  squadHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.label,
    flex: 1,
  },
  squadCount: {
    fontSize: 12,
    fontWeight: '600',
    color: C.secondary,
  },
  squadRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 10,
  },

  // Compliance
  complianceIndicator: {
    width: 4,
    height: '100%' as any,
    borderRadius: 2,
    minHeight: 40,
  },

  // Prospect card
  prospectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 16,
    paddingRight: 12,
    backgroundColor: C.bg,
  },
  prospectAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  prospectInitials: { fontSize: 12, fontWeight: '700', color: C.secondary },
  prospectAction: { fontSize: 11, color: C.muted },

  // Pipeline section
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pipelineHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    flex: 1,
  },
  pipelineCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pipelineCountText: {
    fontSize: 11,
    fontWeight: '600',
  },

  // Section header
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 68 },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blue,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
