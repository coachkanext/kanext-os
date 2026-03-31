/**
 * Education Organization People V2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Directory | Org Chart | Seats & Coverage | Permissions |
 *           Domains | Risk | Invites | Audit | Reports
 * RBAC: E0/E1 (System Owner/President) full 10 tabs, E2–E5 (Provost → Dean) full except Audit,
 *       E6/E7 (Dept Chair/Faculty) Overview + Directory + Org Chart + Seats + Domains,
 *       E8–E11 (Advisor → Student) Overview (limited) + Directory (staff listing only),
 *       E12/E13 (Alumni/Board) locked screen.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel, isStudent, isEnrolled, isPresident } from '@/utils/education-rbac';
import {
  getEduPeopleV2Data,
  PERSON_STATUS_LABELS,
  PERSON_STATUS_COLORS,
  ACCESS_TIER_LABELS,
  ACCESS_TIER_COLORS,
  DOMAIN_LABELS,
  DOMAIN_COLORS,
  DOMAIN_ICONS,
  SEAT_CRITICALITY_LABELS,
  SEAT_CRITICALITY_COLORS,
  COVERAGE_CATEGORY_LABELS,
  COVERAGE_CATEGORY_ICONS,
  AUTHORITY_LABELS,
  AUTHORITY_COLORS,
  SENSITIVE_ACCESS_LABELS,
  SENSITIVE_ACCESS_COLORS,
  RISK_FLAG_LABELS,
  RISK_FLAG_COLORS,
  PERMISSION_SCOPE_LABELS,
  AUDIT_CATEGORY_LABELS,
  AUDIT_CATEGORY_COLORS,
} from '@/data/mock-edu-org-people-v2';
import type {
  EduPerson,
  EduSeat,
  PermissionPackage,
  CoverageScore,
  OrgChartNode,
  AuditEntry,
  Domain,
} from '@/data/mock-edu-org-people-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.education;
const SUB_TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'directory', label: 'Directory' },
  { id: 'org-chart', label: 'Org Chart' },
  { id: 'seats', label: 'Seats & Coverage' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'domains', label: 'Domains' },
  { id: 'risk', label: 'Risk' },
  { id: 'invites', label: 'Invites' },
  { id: 'audit', label: 'Audit' },
  { id: 'reports', label: 'Reports' },
];

const DIRECTORY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'leaders', label: 'Leaders' },
  { id: 'staff', label: 'Staff' },
  { id: 'pending', label: 'Pending' },
  { id: 'inactive', label: 'Inactive' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: EducationRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  const parts = name.replace(/^(Dr\.?|Prof\.?)\s+/i, '').split(' ');
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (parts[0]?.[0] ?? '?').toUpperCase();
}

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const day = d.getDate();
  const hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${month} ${day}, ${h}:${minutes} ${ampm}`;
}

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

function coverageColor(pct: number): string {
  if (pct < 60) return '#B85C5C';
  if (pct < 80) return '#B8943E';
  return '#5A8A6E';
}

// =============================================================================
// LOCAL UI PRIMITIVES
// =============================================================================

function SubTabBar({
  tabs,
  activeId,
  onSelect,
  accentColor,
  colors,
}: {
  tabs: typeof SUB_TABS;
  activeId: string;
  onSelect: (id: string) => void;
  accentColor: string;
  colors: typeof Colors.light;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.subTabRow}
      style={{ flexGrow: 0 }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <Pressable
            key={tab.id}
            style={[
              s.subTab,
              {
                borderBottomColor: isActive ? accentColor : 'transparent',
                borderBottomWidth: isActive ? 2 : 0,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(tab.id);
            }}
          >
            <ThemedText
              style={[
                s.subTabText,
                { color: isActive ? colors.text : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// LOCKED STATE
// =============================================================================

function LockedState({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.lockedContainer}>
      <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
      <ThemedText style={[s.lockedTitle, { color: colors.text }]}>People</ThemedText>
      <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
        This section is restricted. Contact your institution administrator for access.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// OVERVIEW TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
  data,
  role,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  data: ReturnType<typeof getEduPeopleV2Data>;
  role: EducationRoleLens;
}) {
  const tiles = data.overviewTiles;
  const isLeaderLevel = isDeanLevel(role);

  const tileData = [
    { label: 'Total People', value: String(tiles.totalPeople), icon: 'person.3.fill', color: ACCENT },
    { label: 'Active', value: String(tiles.activePeople), icon: 'checkmark.circle.fill', color: '#5A8A6E' },
    { label: 'Vacant Critical Seats', value: String(tiles.vacantCriticalSeats), icon: 'exclamationmark.triangle.fill', color: '#B85C5C' },
    { label: 'Coverage Score', value: `${tiles.coverageScore}%`, icon: 'chart.bar.fill', color: accentColor },
    { label: 'Pending Invites', value: String(tiles.pendingInvites), icon: 'envelope.fill', color: '#B8943E' },
    { label: 'Risk Flags', value: String(tiles.riskFlags), icon: 'exclamationmark.shield.fill', color: ACCENT },
  ];

  // Top 5 coverage gaps
  const allGaps = data.coverageScores
    .filter((cs) => cs.gaps.length > 0)
    .sort((a, b) => a.score - b.score)
    .flatMap((cs) => cs.gaps.map((gap) => ({ gap, category: cs.category, score: cs.score })))
    .slice(0, 5);

  // Flagged people
  const flaggedPeople = data.people.filter((p) => p.riskFlags.length > 0);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Tile Grid */}
      <View style={s.kpiGrid}>
        {tileData.map((tile, i) => {
          // E4 students: hide risk-related tiles
          if (isStudent(role) && (tile.label === 'Risk Flags' || tile.label === 'Vacant Critical Seats')) {
            return null;
          }
          return (
            <View
              key={`tile-${i}`}
              style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            >
              <IconSymbol name={tile.icon as any} size={16} color={tile.color} />
              <ThemedText style={[s.kpiValue, { color: colors.text }]}>{tile.value}</ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{tile.label}</ThemedText>
            </View>
          );
        })}
      </View>

      {/* Coverage Gaps — hidden for students */}
      {!isStudent(role) && allGaps.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Coverage Gaps
          </ThemedText>
          {allGaps.map((item, i) => (
            <View
              key={`gap-${i}`}
              style={[s.alertCard, { backgroundColor: coverageColor(item.score) + '10', borderColor: coverageColor(item.score) + '30' }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={coverageColor(item.score)} />
              <View style={s.alertTextCol}>
                <ThemedText style={[s.alertTitle, { color: colors.text }]} numberOfLines={1}>
                  {COVERAGE_CATEGORY_LABELS[item.category]}
                </ThemedText>
                <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                  {item.gap}
                </ThemedText>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Attention Required — leader level only */}
      {isLeaderLevel && flaggedPeople.length > 0 && (
        <>
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            Attention Required
          </ThemedText>
          {flaggedPeople.map((person) => (
            <View
              key={person.id}
              style={[s.alertCard, { backgroundColor: '#B85C5C10', borderColor: '#B85C5C30' }]}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#B85C5C" />
              <View style={s.alertTextCol}>
                <ThemedText style={[s.alertTitle, { color: colors.text }]} numberOfLines={1}>
                  {person.name}
                </ThemedText>
                <ThemedText style={[s.alertSubtitle, { color: colors.textSecondary }]} numberOfLines={2}>
                  {person.riskFlags.map((f) => RISK_FLAG_LABELS[f]).join(', ')}
                </ThemedText>
              </View>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}

// =============================================================================
// DIRECTORY TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  people,
  role,
  onSelectPerson,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  people: EduPerson[];
  role: EducationRoleLens;
  onSelectPerson: (person: EduPerson) => void;
}) {
  const [filter, setFilter] = useState('all');
  const isLimited = isStudent(role);

  const filtered = useMemo(() => {
    let list = [...people];

    switch (filter) {
      case 'leaders':
        list = list.filter((p) => p.accessTier === 'founder' || p.accessTier === 'executive');
        break;
      case 'staff':
        list = list.filter((p) => p.accessTier === 'operator');
        break;
      case 'pending':
        list = list.filter((p) => p.status === 'invited');
        break;
      case 'inactive':
        list = list.filter((p) => p.status === 'suspended');
        break;
    }

    // Sort: release authority -> critical approvals -> high risk -> A-Z
    list.sort((a, b) => {
      if (a.canReleaseFunds !== b.canReleaseFunds) return a.canReleaseFunds ? -1 : 1;
      if (a.canApprove !== b.canApprove) return a.canApprove ? -1 : 1;
      if (a.riskFlags.length !== b.riskFlags.length) return b.riskFlags.length - a.riskFlags.length;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [people, filter]);

  const renderItem = useCallback(
    ({ item }: { item: EduPerson }) => {
      const tierColor = ACCESS_TIER_COLORS[item.accessTier];
      const statusColor = PERSON_STATUS_COLORS[item.status];
      const initials = getInitials(item.name);
      const hasRisk = item.riskFlags.length > 0;

      return (
        <Pressable
          style={[s.personCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPerson(item);
          }}
        >
          {/* Top Row: Avatar + Info + Status */}
          <View style={s.personCardTop}>
            <View style={[s.personAvatar, { backgroundColor: tierColor + '20' }]}>
              <ThemedText style={[s.personAvatarText, { color: tierColor }]}>{initials}</ThemedText>
            </View>
            <View style={s.personInfoCol}>
              <ThemedText style={[s.personName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.personRole, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.seats.length > 0 ? item.seats.map((seat) => seat.name).join(', ') : ACCESS_TIER_LABELS[item.accessTier]}
              </ThemedText>
            </View>
            <StatusBadge label={PERSON_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
          </View>

          {/* Institution Badges */}
          {item.institutions.length > 0 && (
            <View style={s.institutionRow}>
              {item.institutions.map((inst) => (
                <View key={inst.id} style={[s.institutionBadge, { backgroundColor: accentColor + '15' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{inst.shortName}</ThemedText>
                </View>
              ))}
              <StatusBadge label={ACCESS_TIER_LABELS[item.accessTier].toUpperCase()} color={tierColor} />
            </View>
          )}

          {/* Authority Strip — hidden for students */}
          {!isLimited && (item.canApprove || item.canReleaseFunds || item.sensitiveAccess !== 'low') && (
            <View style={s.authorityStrip}>
              {item.canApprove && (
                <View style={[s.authorityBadge, { backgroundColor: AUTHORITY_COLORS.approve + '20' }]}>
                  <ThemedText style={[s.authorityBadgeText, { color: AUTHORITY_COLORS.approve }]}>
                    {AUTHORITY_LABELS.approve}
                  </ThemedText>
                </View>
              )}
              {item.canReleaseFunds && (
                <View style={[s.authorityBadge, { backgroundColor: AUTHORITY_COLORS.release + '20' }]}>
                  <ThemedText style={[s.authorityBadgeText, { color: AUTHORITY_COLORS.release }]}>
                    {AUTHORITY_LABELS.release}
                  </ThemedText>
                </View>
              )}
              {item.sensitiveAccess !== 'low' && (
                <View style={[s.authorityBadge, { backgroundColor: SENSITIVE_ACCESS_COLORS[item.sensitiveAccess] + '20' }]}>
                  <ThemedText style={[s.authorityBadgeText, { color: SENSITIVE_ACCESS_COLORS[item.sensitiveAccess] }]}>
                    Sensitive: {SENSITIVE_ACCESS_LABELS[item.sensitiveAccess]}
                  </ThemedText>
                </View>
              )}
            </View>
          )}

          {/* Accountability Metrics — hidden for students */}
          {!isLimited && (item.ownsInitiatives > 0 || item.pendingApprovals > 0) && (
            <View style={s.accountabilityRow}>
              <IconSymbol name="shield.checkmark.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.accountabilityText, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.ownsInitiatives > 0 ? `${item.ownsInitiatives} initiatives` : ''}
                {item.ownsInitiatives > 0 && item.pendingApprovals > 0 ? ' | ' : ''}
                {item.pendingApprovals > 0 ? `${item.pendingApprovals} pending approvals` : ''}
              </ThemedText>
            </View>
          )}

          {/* Risk Flags — hidden for students */}
          {!isLimited && hasRisk && (
            <View style={s.riskFlagRow}>
              {item.riskFlags.map((flag, idx) => (
                <View key={`risk-${idx}`} style={[s.riskFlag, { backgroundColor: RISK_FLAG_COLORS[flag] + '18' }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={10} color={RISK_FLAG_COLORS[flag]} />
                  <ThemedText style={[s.riskFlagText, { color: RISK_FLAG_COLORS[flag] }]}>
                    {RISK_FLAG_LABELS[flag]}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, isLimited, onSelectPerson],
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Filter Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
        style={{ flexGrow: 0 }}
      >
        {DIRECTORY_FILTERS.map((f) => {
          const isActive = f.id === filter;
          return (
            <Pressable
              key={f.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFilter(f.id);
              }}
            >
              <ThemedText style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}>
                {f.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="person.3.fill" label="No people found" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// ORG CHART TAB
// =============================================================================

function OrgChartTab({
  colors,
  accentColor,
  orgChart,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  orgChart: OrgChartNode[];
}) {
  // Build node lookup
  const nodesMap = useMemo(() => {
    const map = new Map<string, OrgChartNode>();
    for (const node of orgChart) map.set(node.id, node);
    return map;
  }, [orgChart]);

  // Render tree recursively via flat list with indent
  const flatNodes = useMemo(() => {
    const result: { node: OrgChartNode; depth: number }[] = [];
    function walk(id: string, depth: number) {
      const node = nodesMap.get(id);
      if (!node) return;
      result.push({ node, depth });
      for (const childId of node.children) walk(childId, depth + 1);
    }
    // Start from root (level 0)
    const roots = orgChart.filter((n) => n.level === 0);
    for (const root of roots) walk(root.id, 0);
    // Add any nodes not reached
    for (const n of orgChart) {
      if (!result.find((r) => r.node.id === n.id)) {
        result.push({ node: n, depth: n.level });
      }
    }
    return result;
  }, [orgChart, nodesMap]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {flatNodes.map(({ node, depth }) => {
        const isVacant = node.personName === null;
        const indent = Math.min(depth, 4) * 16;
        return (
          <View
            key={node.id}
            style={[
              s.orgNode,
              {
                backgroundColor: isVacant ? '#B85C5C08' : colors.card,
                borderColor: isVacant ? '#B85C5C40' : colors.border,
                borderLeftColor: node.isCritical ? '#B85C5C' : accentColor,
                borderLeftWidth: 3,
                marginLeft: indent,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.orgNodeName, { color: isVacant ? '#B85C5C' : colors.text }]} numberOfLines={1}>
                {isVacant ? 'VACANT' : node.personName}
              </ThemedText>
              <ThemedText style={[s.orgNodeRole, { color: colors.textSecondary }]} numberOfLines={1}>
                {node.seatName}
              </ThemedText>
              {node.institution && (
                <ThemedText style={[s.orgNodeSeats, { color: colors.textTertiary }]} numberOfLines={1}>
                  {node.institution}
                </ThemedText>
              )}
            </View>
            <View style={s.orgNodeIcons}>
              {node.hasApproveAuthority && (
                <IconSymbol name="checkmark.seal.fill" size={14} color={AUTHORITY_COLORS.approve} />
              )}
              {node.hasReleaseAuthority && (
                <IconSymbol name="dollarsign.circle.fill" size={14} color={AUTHORITY_COLORS.release} />
              )}
              {isVacant && node.isCritical && (
                <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#B85C5C" />
              )}
            </View>
          </View>
        );
      })}

      {orgChart.length === 0 && (
        <EmptyState icon="person.line.dotted.person.fill" label="No org chart data" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// SEATS & COVERAGE TAB
// =============================================================================

function SeatsCoverageTab({
  colors,
  accentColor,
  seats,
  coverageScores,
  onSelectSeat,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  seats: EduSeat[];
  coverageScores: CoverageScore[];
  onSelectSeat: (seat: EduSeat) => void;
}) {
  // Top 5 gaps across all categories
  const topGaps = useMemo(() => {
    return coverageScores
      .sort((a, b) => a.score - b.score)
      .flatMap((cs) => cs.gaps.map((gap) => ({ gap, category: cs.category, score: cs.score })))
      .slice(0, 5);
  }, [coverageScores]);

  const renderSeat = useCallback(
    ({ item }: { item: EduSeat }) => {
      const critColor = SEAT_CRITICALITY_COLORS[item.criticality];
      return (
        <Pressable
          style={[
            s.seatCard,
            {
              backgroundColor: item.isVacant ? '#B85C5C08' : colors.card,
              borderColor: item.isVacant ? '#B85C5C40' : colors.border,
            },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectSeat(item);
          }}
        >
          <View style={s.seatCardHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[s.seatName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.seatScope, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.scope}{item.scopeTarget ? ` — ${item.scopeTarget}` : ''}
              </ThemedText>
            </View>
            <StatusBadge label={SEAT_CRITICALITY_LABELS[item.criticality].toUpperCase()} color={critColor} />
          </View>

          {/* Assigned or Vacant */}
          <View style={s.seatAssignedRow}>
            <IconSymbol
              name={item.isVacant ? 'person.fill.questionmark' as any : 'person.fill' as any}
              size={12}
              color={item.isVacant ? '#B85C5C' : '#5A8A6E'}
            />
            <ThemedText
              style={[s.seatAssignedText, { color: item.isVacant ? '#B85C5C' : colors.text }]}
              numberOfLines={1}
            >
              {item.isVacant ? 'VACANT' : item.assignedName}
            </ThemedText>
          </View>

          {/* Permissions */}
          <View style={s.seatPermRow}>
            {item.permissions.map((perm) => (
              <View key={perm} style={[s.permBadge, { backgroundColor: accentColor + '15' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>
                  {PERMISSION_SCOPE_LABELS[perm]}
                </ThemedText>
              </View>
            ))}
          </View>

          {/* Why it matters */}
          <ThemedText style={[s.seatWhyText, { color: colors.textSecondary }]} numberOfLines={1}>
            {item.whyItMatters}
          </ThemedText>

          {/* Risk notes */}
          {item.riskNotes && (
            <View style={s.seatRiskRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={10} color="#B85C5C" />
              <ThemedText style={[s.seatRiskText, { color: '#B85C5C' }]} numberOfLines={2}>
                {item.riskNotes}
              </ThemedText>
            </View>
          )}
        </Pressable>
      );
    },
    [colors, accentColor, onSelectSeat],
  );

  return (
    <FlatList
      data={seats}
      keyExtractor={(item) => item.id}
      renderItem={renderSeat}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* Coverage Dashboard */}
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
            Coverage Dashboard
          </ThemedText>
          {coverageScores.map((cs) => {
            const pctColor = coverageColor(cs.score);
            return (
              <View
                key={cs.category}
                style={[s.coverageRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={s.coverageRowHeader}>
                  <IconSymbol name={COVERAGE_CATEGORY_ICONS[cs.category] as any} size={14} color={pctColor} />
                  <ThemedText style={[s.coverageArea, { color: colors.text }]}>
                    {COVERAGE_CATEGORY_LABELS[cs.category]}
                  </ThemedText>
                  <ThemedText style={[s.coveragePct, { color: pctColor }]}>{cs.score}%</ThemedText>
                </View>
                <ProgressBar percent={cs.score} color={pctColor} />
              </View>
            );
          })}

          {/* Top 5 Gaps */}
          {topGaps.length > 0 && (
            <>
              <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
                Top Coverage Gaps
              </ThemedText>
              {topGaps.map((item, i) => (
                <View
                  key={`gap-${i}`}
                  style={[s.gapRow, { backgroundColor: coverageColor(item.score) + '10', borderColor: coverageColor(item.score) + '30' }]}
                >
                  <IconSymbol name="exclamationmark.triangle.fill" size={12} color={coverageColor(item.score)} />
                  <ThemedText style={[s.gapText, { color: colors.text }]} numberOfLines={2}>
                    {item.gap}
                  </ThemedText>
                </View>
              ))}
            </>
          )}

          {/* Seat List Header */}
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
            All Seats
          </ThemedText>
        </>
      }
      ListEmptyComponent={
        <EmptyState icon="person.crop.rectangle.stack.fill" label="No seats configured" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PERMISSIONS TAB
// =============================================================================

function PermissionsTab({
  colors,
  accentColor,
  packages,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  packages: PermissionPackage[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleToggle = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {packages.map((pkg) => {
        const isExpanded = expandedId === pkg.id;
        const tierColor = ACCESS_TIER_COLORS[pkg.tier];

        return (
          <Pressable
            key={pkg.id}
            style={[s.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => handleToggle(pkg.id)}
          >
            <View style={s.packageHeader}>
              <View style={[s.packageIcon, { backgroundColor: tierColor + '18' }]}>
                <IconSymbol name="lock.shield.fill" size={18} color={tierColor} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[s.packageLabel, { color: colors.text }]}>{pkg.name}</ThemedText>
                <ThemedText style={[s.packageDesc, { color: colors.textSecondary }]} numberOfLines={isExpanded ? undefined : 2}>
                  {pkg.description}
                </ThemedText>
              </View>
              <StatusBadge label={ACCESS_TIER_LABELS[pkg.tier].toUpperCase()} color={tierColor} />
            </View>

            {isExpanded && (
              <View style={s.packageExpanded}>
                {/* Read Scopes */}
                {pkg.readScopes.length > 0 && (
                  <View style={s.scopeSection}>
                    <ThemedText style={[s.scopeTitle, { color: '#5A8A6E' }]}>Read</ThemedText>
                    {pkg.readScopes.map((scope, i) => (
                      <View key={`r-${i}`} style={s.scopeItem}>
                        <View style={[s.scopeDot, { backgroundColor: '#5A8A6E' }]} />
                        <ThemedText style={[s.scopeText, { color: colors.textSecondary }]}>{scope}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Write Scopes */}
                {pkg.writeScopes.length > 0 && (
                  <View style={s.scopeSection}>
                    <ThemedText style={[s.scopeTitle, { color: ACCENT }]}>Write</ThemedText>
                    {pkg.writeScopes.map((scope, i) => (
                      <View key={`w-${i}`} style={s.scopeItem}>
                        <View style={[s.scopeDot, { backgroundColor: ACCENT }]} />
                        <ThemedText style={[s.scopeText, { color: colors.textSecondary }]}>{scope}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Approve Scopes */}
                {pkg.approveScopes.length > 0 && (
                  <View style={s.scopeSection}>
                    <ThemedText style={[s.scopeTitle, { color: '#B8943E' }]}>Approve</ThemedText>
                    {pkg.approveScopes.map((scope, i) => (
                      <View key={`a-${i}`} style={s.scopeItem}>
                        <View style={[s.scopeDot, { backgroundColor: '#B8943E' }]} />
                        <ThemedText style={[s.scopeText, { color: colors.textSecondary }]}>{scope}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Release Scopes */}
                {pkg.releaseScopes.length > 0 && (
                  <View style={s.scopeSection}>
                    <ThemedText style={[s.scopeTitle, { color: ACCENT }]}>Release</ThemedText>
                    {pkg.releaseScopes.map((scope, i) => (
                      <View key={`rel-${i}`} style={s.scopeItem}>
                        <View style={[s.scopeDot, { backgroundColor: ACCENT }]} />
                        <ThemedText style={[s.scopeText, { color: colors.textSecondary }]}>{scope}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}

                {/* Sensitive Fields */}
                {pkg.sensitiveFields.length > 0 && (
                  <View style={s.scopeSection}>
                    <ThemedText style={[s.scopeTitle, { color: '#B85C5C' }]}>Sensitive Fields</ThemedText>
                    {pkg.sensitiveFields.map((field, i) => (
                      <View key={`sf-${i}`} style={s.sensitiveItem}>
                        <IconSymbol name="exclamationmark.shield.fill" size={10} color="#B85C5C" />
                        <ThemedText style={[s.sensitiveText, { color: '#B85C5C' }]}>{field}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}
          </Pressable>
        );
      })}

      {packages.length === 0 && (
        <EmptyState icon="lock.shield.fill" label="No permission packages" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// DOMAINS TAB
// =============================================================================

function DomainsTab({
  colors,
  accentColor,
  people,
  seats,
  coverageScores,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  people: EduPerson[];
  seats: EduSeat[];
  coverageScores: CoverageScore[];
}) {
  const domains: Domain[] = ['admissions', 'academics', 'housing', 'athletics', 'finance', 'compliance'];

  const domainData = useMemo(() => {
    return domains.map((domain) => {
      const domainPeople = people.filter((p) => p.domains.includes(domain));
      const domainSeats = seats.filter((seat) => seat.approvalDomains.includes(domain));
      const keySeatHolders = domainSeats
        .filter((seat) => !seat.isVacant)
        .map((seat) => seat.assignedName)
        .filter(Boolean)
        .slice(0, 3);
      const vacantCount = domainSeats.filter((seat) => seat.isVacant).length;

      // Find matching coverage category
      const categoryMap: Record<string, string> = {
        admissions: 'admissions',
        academics: 'academic',
        housing: 'student_life',
        athletics: 'athletics',
        finance: 'finance',
        compliance: 'compliance',
      };
      const cs = coverageScores.find((c) => c.category === categoryMap[domain]);

      return {
        domain,
        peopleCount: domainPeople.length,
        keySeatHolders,
        vacantCount,
        coverageScore: cs?.score ?? 0,
      };
    });
  }, [people, seats, coverageScores]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {domainData.map((dd) => {
        const domainColor = DOMAIN_COLORS[dd.domain];
        const pctColor = coverageColor(dd.coverageScore);

        return (
          <View
            key={dd.domain}
            style={[s.domainCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: domainColor, borderLeftWidth: 3 }]}
          >
            <View style={s.domainCardHeader}>
              <IconSymbol name={DOMAIN_ICONS[dd.domain] as any} size={18} color={domainColor} />
              <ThemedText style={[s.domainName, { color: colors.text }]}>
                {DOMAIN_LABELS[dd.domain]}
              </ThemedText>
              <ThemedText style={[s.domainCoverage, { color: pctColor }]}>{dd.coverageScore}%</ThemedText>
            </View>

            <View style={s.domainStats}>
              <ThemedText style={[s.domainStatText, { color: colors.textSecondary }]}>
                {dd.peopleCount} people
              </ThemedText>
              {dd.vacantCount > 0 && (
                <ThemedText style={[s.domainStatText, { color: '#B85C5C' }]}>
                  {dd.vacantCount} vacant seat{dd.vacantCount > 1 ? 's' : ''}
                </ThemedText>
              )}
            </View>

            {dd.keySeatHolders.length > 0 && (
              <ThemedText style={[s.domainHolders, { color: colors.textTertiary }]} numberOfLines={2}>
                Key: {dd.keySeatHolders.join(', ')}
              </ThemedText>
            )}

            <ProgressBar percent={dd.coverageScore} color={pctColor} />
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// RISK TAB
// =============================================================================

function RiskTab({
  colors,
  accentColor,
  people,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  people: EduPerson[];
}) {
  const flaggedPeople = useMemo(() => people.filter((p) => p.riskFlags.length > 0), [people]);

  // Count by type
  const flagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of people) {
      for (const flag of p.riskFlags) {
        counts[flag] = (counts[flag] || 0) + 1;
      }
    }
    return counts;
  }, [people]);

  const riskFlagTypes: Array<{ flag: string; label: string; color: string; count: number }> = [
    { flag: 'over_permissioned', label: RISK_FLAG_LABELS.over_permissioned, color: RISK_FLAG_COLORS.over_permissioned, count: flagCounts['over_permissioned'] || 0 },
    { flag: 'missing_coverage', label: RISK_FLAG_LABELS.missing_coverage, color: RISK_FLAG_COLORS.missing_coverage, count: flagCounts['missing_coverage'] || 0 },
    { flag: 'single_point_failure', label: RISK_FLAG_LABELS.single_point_failure, color: RISK_FLAG_COLORS.single_point_failure, count: flagCounts['single_point_failure'] || 0 },
    { flag: 'privileged_inactive', label: RISK_FLAG_LABELS.privileged_inactive, color: RISK_FLAG_COLORS.privileged_inactive, count: flagCounts['privileged_inactive'] || 0 },
  ];

  const recommendedActions: Record<string, string> = {
    over_permissioned: 'Review and reduce access scope to minimum required permissions.',
    missing_coverage: 'Assign backup personnel or fill vacant seats.',
    single_point_failure: 'Cross-train a second person and document succession plan.',
    privileged_inactive: 'Revoke elevated access or confirm continued need.',
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Risk Flag Counts */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
        Risk Flag Summary
      </ThemedText>
      <View style={s.kpiGrid}>
        {riskFlagTypes.map((rf) => (
          <View
            key={rf.flag}
            style={[s.kpiCard, { backgroundColor: colors.card, borderColor: rf.count > 0 ? rf.color + '40' : colors.border }]}
          >
            <ThemedText style={[s.kpiValue, { color: rf.count > 0 ? rf.color : colors.textTertiary }]}>
              {rf.count}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>{rf.label}</ThemedText>
          </View>
        ))}
      </View>

      {/* Flagged People */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg, marginBottom: Spacing.sm }]}>
        Flagged People
      </ThemedText>
      {flaggedPeople.length === 0 && (
        <EmptyState icon="checkmark.shield.fill" label="No risk flags detected" colors={colors} />
      )}
      {flaggedPeople.map((person) => (
        <View
          key={person.id}
          style={[s.riskPersonCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <ThemedText style={[s.personName, { color: colors.text }]}>{person.name}</ThemedText>
          <ThemedText style={[s.personRole, { color: colors.textSecondary }]}>
            {person.seats.length > 0 ? person.seats.map((seat) => seat.name).join(', ') : ACCESS_TIER_LABELS[person.accessTier]}
          </ThemedText>
          {person.riskFlags.map((flag, idx) => (
            <View key={`flag-${idx}`} style={s.riskDetailRow}>
              <View style={[s.riskFlag, { backgroundColor: RISK_FLAG_COLORS[flag] + '18' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={10} color={RISK_FLAG_COLORS[flag]} />
                <ThemedText style={[s.riskFlagText, { color: RISK_FLAG_COLORS[flag] }]}>
                  {RISK_FLAG_LABELS[flag]}
                </ThemedText>
              </View>
              <ThemedText style={[s.riskRecommendation, { color: colors.textSecondary }]} numberOfLines={2}>
                {recommendedActions[flag]}
              </ThemedText>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// INVITES TAB
// =============================================================================

function InvitesTab({
  colors,
  accentColor,
  people,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  people: EduPerson[];
}) {
  const pendingInvites = useMemo(() => people.filter((p) => p.status === 'invited'), [people]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* Pending Invites */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
        Pending Invites
      </ThemedText>
      {pendingInvites.length === 0 && (
        <View style={[s.placeholderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <IconSymbol name="envelope.fill" size={24} color={colors.textTertiary} />
          <ThemedText style={[s.placeholderText, { color: colors.textSecondary }]}>
            No pending invites
          </ThemedText>
        </View>
      )}
      {pendingInvites.map((person) => (
        <View
          key={person.id}
          style={[s.inviteCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.personName, { color: colors.text }]}>{person.name}</ThemedText>
            <ThemedText style={[s.personRole, { color: colors.textSecondary }]}>{person.email}</ThemedText>
            {person.seats.length > 0 && (
              <ThemedText style={[s.inviteSeat, { color: accentColor }]}>
                Seat: {person.seats.map((seat) => seat.name).join(', ')}
              </ThemedText>
            )}
          </View>
          <StatusBadge label="INVITED" color={PERSON_STATUS_COLORS.invited} />
        </View>
      ))}

      {/* Invite Form Placeholder */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.xl, marginBottom: Spacing.sm }]}>
        Send New Invite
      </ThemedText>
      <View style={[s.formPlaceholder, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <IconSymbol name="person.badge.plus" size={32} color={colors.textTertiary} />
        <ThemedText style={[s.formPlaceholderTitle, { color: colors.text }]}>Invite Form</ThemedText>
        <ThemedText style={[s.formPlaceholderDesc, { color: colors.textSecondary }]}>
          Name, email, scope, seat assignment, permission package, expiration, and note fields will be available here.
        </ThemedText>
        <View style={[s.formPlaceholderButton, { backgroundColor: accentColor + '20', borderColor: accentColor + '40' }]}>
          <ThemedText style={[s.formPlaceholderButtonText, { color: accentColor }]}>Send Invite</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// AUDIT TAB
// =============================================================================

function AuditTab({
  colors,
  accentColor,
  auditLog,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  auditLog: AuditEntry[];
}) {
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'seat_assignment', label: AUDIT_CATEGORY_LABELS.seat_assignment },
    { id: 'permission_change', label: AUDIT_CATEGORY_LABELS.permission_change },
    { id: 'invite', label: AUDIT_CATEGORY_LABELS.invite },
    { id: 'release_authority', label: AUDIT_CATEGORY_LABELS.release_authority },
  ];

  const filtered = useMemo(() => {
    const sorted = [...auditLog].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
    if (categoryFilter === 'all') return sorted;
    return sorted.filter((entry) => entry.category === categoryFilter);
  }, [auditLog, categoryFilter]);

  return (
    <View style={{ flex: 1 }}>
      {/* Category filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterChipRow}
        style={{ flexGrow: 0 }}
      >
        {categories.map((cat) => {
          const isActive = cat.id === categoryFilter;
          return (
            <Pressable
              key={cat.id}
              style={[
                s.filterChip,
                {
                  backgroundColor: isActive ? accentColor + '20' : colors.card,
                  borderColor: isActive ? accentColor + '40' : colors.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setCategoryFilter(cat.id);
              }}
            >
              <ThemedText style={[s.filterChipText, { color: isActive ? accentColor : colors.textSecondary }]}>
                {cat.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={s.tabListContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const catColor = AUDIT_CATEGORY_COLORS[item.category];
          return (
            <View style={[s.auditEntry, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={s.auditEntryHeader}>
                <StatusBadge label={AUDIT_CATEGORY_LABELS[item.category].toUpperCase()} color={catColor} />
                <ThemedText style={[s.auditTimestamp, { color: colors.textTertiary }]}>
                  {formatTimestamp(item.timestamp)}
                </ThemedText>
              </View>
              <ThemedText style={[s.auditAction, { color: colors.text }]}>{item.action}</ThemedText>
              <ThemedText style={[s.auditDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                Target: {item.target} | Actor: {item.actor}
              </ThemedText>
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="doc.text.magnifyingglass" label="No audit entries found" colors={colors} />
        }
      />
    </View>
  );
}

// =============================================================================
// REPORTS TAB
// =============================================================================

function ReportsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const reports = [
    { id: 'coverage', title: 'Coverage Report', description: 'Full seat coverage analysis across all domains and institutions.', icon: 'chart.bar.fill', color: '#5A8A6E' },
    { id: 'permission-audit', title: 'Permission Audit', description: 'Review of all permission packages, access tiers, and sensitive field exposure.', icon: 'lock.shield.fill', color: ACCENT },
    { id: 'seat-utilization', title: 'Seat Utilization', description: 'Filled vs. vacant seats, dual-hat analysis, and succession readiness.', icon: 'person.crop.rectangle.stack.fill', color: ACCENT },
    { id: 'risk-assessment', title: 'Risk Assessment', description: 'Over-permissioned users, single points of failure, and coverage gaps.', icon: 'exclamationmark.shield.fill', color: '#B85C5C' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {reports.map((report) => (
        <View
          key={report.id}
          style={[s.reportCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        >
          <View style={[s.reportIcon, { backgroundColor: report.color + '18' }]}>
            <IconSymbol name={report.icon as any} size={22} color={report.color} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText style={[s.reportTitle, { color: colors.text }]}>{report.title}</ThemedText>
            <ThemedText style={[s.reportDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {report.description}
            </ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={14} color={colors.textTertiary} />
        </View>
      ))}
    </ScrollView>
  );
}

// =============================================================================
// PERSON DETAIL BOTTOM SHEET
// =============================================================================

function PersonDetailSheet({
  visible,
  onClose,
  person,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  person: EduPerson | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!person) return null;

  const tierColor = ACCESS_TIER_COLORS[person.accessTier];
  const statusColor = PERSON_STATUS_COLORS[person.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={person.name} useModal>
      {/* Status + Tier Badges */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={PERSON_STATUS_LABELS[person.status].toUpperCase()} color={statusColor} />
        <StatusBadge label={ACCESS_TIER_LABELS[person.accessTier].toUpperCase()} color={tierColor} />
        {person.institutions.map((inst) => (
          <StatusBadge key={inst.id} label={inst.shortName} color={accentColor} />
        ))}
      </View>

      {/* Seats */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Seats</ThemedText>
        {person.seats.length > 0 ? (
          person.seats.map((seat) => (
            <View key={seat.id} style={s.sheetDetailRow}>
              <IconSymbol name="person.fill" size={12} color={accentColor} />
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
                {seat.name}{seat.scopeTarget ? ` (${seat.scopeTarget})` : ''}
              </ThemedText>
              <StatusBadge label={SEAT_CRITICALITY_LABELS[seat.criticality].toUpperCase()} color={SEAT_CRITICALITY_COLORS[seat.criticality]} />
            </View>
          ))
        ) : (
          <ThemedText style={[s.emptyText, { color: colors.textTertiary, fontSize: 12 }]}>No seats assigned</ThemedText>
        )}
      </View>

      {/* Authority */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Authority & Access</ThemedText>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Can Approve</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: person.canApprove ? '#5A8A6E' : colors.textTertiary }]}>
            {person.canApprove ? 'Yes' : 'No'}
          </ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Can Release Funds</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: person.canReleaseFunds ? '#5A8A6E' : colors.textTertiary }]}>
            {person.canReleaseFunds ? 'Yes' : 'No'}
          </ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Sensitive Access</ThemedText>
          <StatusBadge
            label={SENSITIVE_ACCESS_LABELS[person.sensitiveAccess].toUpperCase()}
            color={SENSITIVE_ACCESS_COLORS[person.sensitiveAccess]}
          />
        </View>
      </View>

      {/* Domains */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Domains</ThemedText>
        <View style={s.sheetBadgeRow}>
          {person.domains.map((domain) => (
            <StatusBadge key={domain} label={DOMAIN_LABELS[domain].toUpperCase()} color={DOMAIN_COLORS[domain]} />
          ))}
        </View>
      </View>

      {/* Accountability */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Accountability</ThemedText>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owns Initiatives</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: accentColor }]}>{person.ownsInitiatives}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Pending Approvals</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: person.pendingApprovals > 0 ? '#B8943E' : colors.textTertiary }]}>
            {person.pendingApprovals}
          </ThemedText>
        </View>
        {person.lastAction && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Action</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]} numberOfLines={1}>
              {person.lastAction}
            </ThemedText>
          </View>
        )}
        {person.lastActionDate && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Last Action Date</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>
              {formatDate(person.lastActionDate)}
            </ThemedText>
          </View>
        )}
      </View>

      {/* Risk Flags */}
      {person.riskFlags.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: '#B85C5C' }]}>Risk Flags</ThemedText>
          {person.riskFlags.map((flag, idx) => (
            <View key={`rf-${idx}`} style={s.sheetDetailRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color={RISK_FLAG_COLORS[flag]} />
              <ThemedText style={[s.sheetDetailValue, { color: RISK_FLAG_COLORS[flag] }]}>
                {RISK_FLAG_LABELS[flag]}
              </ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Contact */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Contact</ThemedText>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Email</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.email}</ThemedText>
        </View>
        {person.phone && (
          <View style={s.sheetDetailRow}>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Phone</ThemedText>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.phone}</ThemedText>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// SEAT DETAIL BOTTOM SHEET
// =============================================================================

function SeatDetailSheet({
  visible,
  onClose,
  seat,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  seat: EduSeat | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!seat) return null;

  const critColor = SEAT_CRITICALITY_COLORS[seat.criticality];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={seat.name} useModal>
      {/* Scope + Criticality */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={seat.scope.toUpperCase()} color={accentColor} />
        {seat.scopeTarget && <StatusBadge label={seat.scopeTarget} color={accentColor} />}
        <StatusBadge label={SEAT_CRITICALITY_LABELS[seat.criticality].toUpperCase()} color={critColor} />
      </View>

      {/* Assigned Person */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Assigned Person</ThemedText>
        <View style={s.sheetDetailRow}>
          <IconSymbol
            name={seat.isVacant ? 'person.fill.questionmark' as any : 'person.fill' as any}
            size={14}
            color={seat.isVacant ? '#B85C5C' : '#5A8A6E'}
          />
          <ThemedText
            style={[s.sheetDetailValue, { color: seat.isVacant ? '#B85C5C' : colors.text }]}
          >
            {seat.isVacant ? 'VACANT' : seat.assignedName}
          </ThemedText>
        </View>
      </View>

      {/* Permissions */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Required Permissions</ThemedText>
        <View style={s.sheetBadgeRow}>
          {seat.permissions.map((perm) => (
            <StatusBadge key={perm} label={PERMISSION_SCOPE_LABELS[perm].toUpperCase()} color={accentColor} />
          ))}
        </View>
      </View>

      {/* Approval Domains */}
      {seat.approvalDomains.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Approval Domains</ThemedText>
          <View style={s.sheetBadgeRow}>
            {seat.approvalDomains.map((domain) => (
              <StatusBadge key={domain} label={DOMAIN_LABELS[domain].toUpperCase()} color={DOMAIN_COLORS[domain]} />
            ))}
          </View>
        </View>
      )}

      {/* Why It Matters */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Why It Matters</ThemedText>
        <ThemedText style={[s.sheetDetailValue, { color: colors.textSecondary }]}>
          {seat.whyItMatters}
        </ThemedText>
      </View>

      {/* Risk Notes */}
      {seat.riskNotes && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: '#B85C5C' }]}>Risk Notes</ThemedText>
          <View style={s.sheetDetailRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#B85C5C" />
            <ThemedText style={[s.sheetDetailValue, { color: '#B85C5C' }]}>
              {seat.riskNotes}
            </ThemedText>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={s.sheetActions}>
        <Pressable
          style={[s.sheetGhostButton, { borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onClose();
          }}
        >
          <ThemedText style={[s.sheetGhostButtonText, { color: colors.textSecondary }]}>Close</ThemedText>
        </Pressable>
      </View>
    </BottomSheet>
  );
}

// =============================================================================
// MAIN EXPORT
// =============================================================================

export function EduOrgPeopleV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: External (E12/E13) locked ===
  if (!isEnrolled(role)) {
    return <LockedState colors={colors} />;
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [selectedPerson, setSelectedPerson] = useState<EduPerson | null>(null);
  const [personSheetVisible, setPersonSheetVisible] = useState(false);
  const [selectedSeat, setSelectedSeat] = useState<EduSeat | null>(null);
  const [seatSheetVisible, setSeatSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduPeopleV2Data(), []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isPresident(role)) return SUB_TABS; // E1: all 10
    if (isDeanLevel(role)) return SUB_TABS.filter((t) => t.id !== 'audit'); // E2: all except audit
    if (isFacultyLevel(role)) return SUB_TABS.filter((t) =>
      t.id === 'overview' || t.id === 'directory' || t.id === 'org-chart' || t.id === 'seats' || t.id === 'domains',
    ); // E3: 5 tabs
    if (isStudent(role)) return SUB_TABS.filter((t) =>
      t.id === 'overview' || t.id === 'directory',
    ); // E4: 2 tabs
    return [];
  }, [role]);

  // === Callbacks ===
  const handleSelectPerson = useCallback((person: EduPerson) => {
    setSelectedPerson(person);
    setPersonSheetVisible(true);
  }, []);

  const handleClosePersonSheet = useCallback(() => {
    setPersonSheetVisible(false);
  }, []);

  const handleSelectSeat = useCallback((seat: EduSeat) => {
    setSelectedSeat(seat);
    setSeatSheetVisible(true);
  }, []);

  const handleCloseSeatSheet = useCallback(() => {
    setSeatSheetVisible(false);
  }, []);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return (
          <OverviewTab colors={colors} accentColor={accentColor} data={data} role={role} />
        );
      case 'directory':
        return (
          <DirectoryTab
            colors={colors}
            accentColor={accentColor}
            people={data.people}
            role={role}
            onSelectPerson={handleSelectPerson}
          />
        );
      case 'org-chart':
        if (!isFacultyLevel(role)) return null;
        return (
          <OrgChartTab colors={colors} accentColor={accentColor} orgChart={data.orgChart} />
        );
      case 'seats':
        if (!isFacultyLevel(role)) return null;
        return (
          <SeatsCoverageTab
            colors={colors}
            accentColor={accentColor}
            seats={data.seats}
            coverageScores={data.coverageScores}
            onSelectSeat={handleSelectSeat}
          />
        );
      case 'permissions':
        if (!isDeanLevel(role)) return null;
        return (
          <PermissionsTab
            colors={colors}
            accentColor={accentColor}
            packages={data.permissionPackages}
          />
        );
      case 'domains':
        if (!isFacultyLevel(role)) return null;
        return (
          <DomainsTab
            colors={colors}
            accentColor={accentColor}
            people={data.people}
            seats={data.seats}
            coverageScores={data.coverageScores}
          />
        );
      case 'risk':
        if (!isDeanLevel(role)) return null;
        return (
          <RiskTab colors={colors} accentColor={accentColor} people={data.people} />
        );
      case 'invites':
        if (!isDeanLevel(role)) return null;
        return (
          <InvitesTab colors={colors} accentColor={accentColor} people={data.people} />
        );
      case 'audit':
        if (!isPresident(role)) return null;
        return (
          <AuditTab colors={colors} accentColor={accentColor} auditLog={data.auditLog} />
        );
      case 'reports':
        if (!isDeanLevel(role)) return null;
        return (
          <ReportsTab colors={colors} accentColor={accentColor} />
        );
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar */}
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Person Detail Bottom Sheet */}
      <PersonDetailSheet
        visible={personSheetVisible}
        onClose={handleClosePersonSheet}
        person={selectedPerson}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Seat Detail Bottom Sheet */}
      <SeatDetailSheet
        visible={seatSheetVisible}
        onClose={handleCloseSeatSheet}
        seat={selectedSeat}
        colors={colors}
        accentColor={accentColor}
      />
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
  contentContainer: {
    flex: 1,
  },

  // -- Locked state --
  lockedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  lockedTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.md,
  },
  lockedMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  // -- Sub-tab bar --
  subTabRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  subTab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  subTabText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Tab scroll containers --
  tabScroll: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  tabListContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },

  // -- Section titles --
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.xs,
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

  // -- Progress bar --
  progressTrack: {
    height: 4,
    backgroundColor: '#2F3336',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: 4,
    borderRadius: 2,
  },

  // -- Empty state --
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyText: {
    fontSize: 14,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  // -- Filter chips --
  filterChipRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
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

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  kpiCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Alert card --
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  alertTextCol: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Person Card (Directory) --
  personCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  personCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  personAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personAvatarText: {
    fontSize: 14,
    fontWeight: '700',
  },
  personInfoCol: {
    flex: 1,
  },
  personName: {
    fontSize: 15,
    fontWeight: '600',
  },
  personRole: {
    fontSize: 12,
    marginTop: 1,
  },

  // -- Institution Row --
  institutionRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  institutionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },

  // -- Authority Strip --
  authorityStrip: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  authorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  authorityBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // -- Accountability Row --
  accountabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: Spacing.sm,
  },
  accountabilityText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Risk Flags --
  riskFlagRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: Spacing.sm,
    flexWrap: 'wrap',
  },
  riskFlag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  riskFlagText: {
    fontSize: 10,
    fontWeight: '600',
  },

  // -- Org Chart Node --
  orgNode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  orgNodeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  orgNodeRole: {
    fontSize: 11,
    marginTop: 1,
  },
  orgNodeSeats: {
    fontSize: 10,
    marginTop: 2,
  },
  orgNodeIcons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  // -- Coverage Row --
  coverageRow: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  coverageRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  coverageArea: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  coveragePct: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Gap Row --
  gapRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  gapText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Seat Card --
  seatCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  seatCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  seatName: {
    fontSize: 14,
    fontWeight: '600',
  },
  seatScope: {
    fontSize: 11,
    marginTop: 1,
  },
  seatAssignedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  seatAssignedText: {
    fontSize: 13,
    fontWeight: '600',
  },
  seatPermRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: Spacing.sm,
    flexWrap: 'wrap',
  },
  permBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  seatWhyText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.xs,
  },
  seatRiskRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 4,
    marginTop: Spacing.xs,
  },
  seatRiskText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Package Card (Permissions) --
  packageCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  packageIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  packageLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  packageDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  packageExpanded: {
    marginTop: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: Spacing.md,
  },
  scopeSection: {
    marginBottom: Spacing.md,
  },
  scopeTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  scopeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  scopeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scopeText: {
    fontSize: 12,
    flex: 1,
  },
  sensitiveItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  sensitiveText: {
    fontSize: 11,
    flex: 1,
  },

  // -- Domain Card --
  domainCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  domainCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  domainName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  domainCoverage: {
    fontSize: 14,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  domainStats: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  domainStatText: {
    fontSize: 12,
    fontWeight: '500',
  },
  domainHolders: {
    fontSize: 11,
    marginBottom: Spacing.sm,
  },

  // -- Risk person card --
  riskPersonCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  riskDetailRow: {
    marginTop: Spacing.sm,
  },
  riskRecommendation: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    marginLeft: 22,
  },

  // -- Invite card --
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  inviteSeat: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },

  // -- Form placeholder --
  formPlaceholder: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  formPlaceholderTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  formPlaceholderDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 17,
  },
  formPlaceholderButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  formPlaceholderButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // -- Placeholder card --
  placeholderCard: {
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  placeholderText: {
    fontSize: 13,
  },

  // -- Audit entry --
  auditEntry: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  auditEntryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  auditTimestamp: {
    fontSize: 10,
    fontWeight: '500',
  },
  auditAction: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  auditDetail: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Report card --
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  reportIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  reportDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Transparency strip --
  transparencyStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  transparencyText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Bottom Sheet --
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    flexWrap: 'wrap',
  },
  sheetSection: {
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sheetSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  sheetDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  sheetDetailLabel: {
    fontSize: 13,
    flex: 1,
  },
  sheetDetailValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  sheetActions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sheetGhostButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sheetGhostButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
