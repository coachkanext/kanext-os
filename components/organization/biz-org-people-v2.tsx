/**
 * Business Organization People Tab — 4-tab People Hub.
 * Directory | Org Chart | Roles & Coverage | Permissions
 * With RBAC, signature authority, role seats, and permission packages.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius, BusinessPalette } from '@/constants/theme';
import { BizCard, BizSubTabBar, BizStatusChip, BizEmptyLock, statusVariant } from '@/components/business/business-shared';
import type { BusinessRoleLens } from '@/utils/business-rbac';
import { isFounder, isBoardLevel, isInvestor } from '@/utils/business-rbac';
import { useBusiness } from '@/context/business-context';
import type { CrossTabLink } from '@/data/biz-org-shared-types';
import {
  KANEXT_HOLDCO,
  KANEXT_OPSCO,
  KANEXT_IP,
  SEEDED_ENTITY_NAMES,
} from '@/data/biz-org-shared-types';
import {
  BIZ_PEOPLE_TABS,
  BIZ_PEOPLE_SCOPE_CHIPS,
  DEPARTMENT_CHIPS,
  PERSON_STATUS_COLOR,
  PERSON_STATUS_LABEL,
  SIGNATURE_AUTHORITY_COLOR,
  SIGNATURE_AUTHORITY_LABEL,
  RBAC_LEVEL_COLOR,
  RBAC_LEVEL_LABEL,
  ORG_LEVEL_ORDER,
  ORG_LEVEL_COLOR,
  getBizPeopleData,
  getVacantCriticalCount,
  getVacantCount,
  getFilledCount,
  getCoveragePercent,
  getPackageById,
  COVERAGE_SCORES,
} from '@/data/mock-biz-org-people';
import type {
  BizPeopleTabId,
  BizPerson,
  RoleSeat,
  PermissionPackage,
  OrgChartNode,
  OrgChartLevel,
  RBACLevel,
  SignatureAuthority,
  CoverageCategory,
} from '@/data/mock-biz-org-people';

const BP = BusinessPalette;

// =============================================================================
// COVERAGE DASHBOARD HELPERS
// =============================================================================

const COVERAGE_SCORES_FALLBACK: Record<string, { filled: number; total: number }> = {
  exec: { filled: 3, total: 3 },
  finance: { filled: 2, total: 3 },
  rails: { filled: 2, total: 2 },
  compliance: { filled: 1, total: 2 },
  ops: { filled: 4, total: 5 },
  media: { filled: 1, total: 2 },
};

const COVERAGE_CATEGORY_LABELS: Record<string, string> = {
  exec: 'Executive',
  finance: 'Finance',
  rails: 'Rails',
  compliance: 'Compliance',
  ops: 'Operations',
  media: 'Media',
};

function getCoverageColor(filled: number, total: number): string {
  if (total === 0) return '#A1A1AA';
  const pct = (filled / total) * 100;
  if (pct >= 80) return '#22C55E';
  if (pct >= 50) return '#F59E0B';
  return '#EF4444';
}

const SENSITIVE_ACCESS_COLOR: Record<string, string> = {
  full: '#EF4444',
  partial: '#F59E0B',
  none: '#A1A1AA',
};

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: BusinessRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  if (name === 'VACANT') return '?';
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function matchesSearch(text: string, query: string): boolean {
  return text.toLowerCase().includes(query.toLowerCase());
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function PersonStatusBadge({ status }: { status: BizPerson['status'] }) {
  const fg = PERSON_STATUS_COLOR[status];
  const label = PERSON_STATUS_LABEL[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{label}</ThemedText>
    </View>
  );
}

function SignatureAuthorityBadge({ authority }: { authority: SignatureAuthority }) {
  const fg = SIGNATURE_AUTHORITY_COLOR[authority];
  const label = SIGNATURE_AUTHORITY_LABEL[authority];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{label}</ThemedText>
    </View>
  );
}

function RBACBadge({ level }: { level: RBACLevel }) {
  const fg = RBAC_LEVEL_COLOR[level];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{level}</ThemedText>
    </View>
  );
}

function RBACFullBadge({ level }: { level: RBACLevel }) {
  const fg = RBAC_LEVEL_COLOR[level];
  const label = RBAC_LEVEL_LABEL[level];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{level} — {label}</ThemedText>
    </View>
  );
}

function OrgLevelBadge({ level }: { level: OrgChartLevel }) {
  const fg = ORG_LEVEL_COLOR[level];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{level}</ThemedText>
    </View>
  );
}

function EntityBadge({ name, accentColor }: { name: string; accentColor: string }) {
  return (
    <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
      <ThemedText style={[s.badgeText, { color: accentColor }]}>{name}</ThemedText>
    </View>
  );
}

function VacantBadge() {
  return (
    <View style={[s.badge, { backgroundColor: '#EF4444' + '20' }]}>
      <ThemedText style={[s.badgeText, { color: '#EF4444' }]}>VACANT</ThemedText>
    </View>
  );
}

function CriticalBadge() {
  return (
    <View style={[s.badge, { backgroundColor: '#EF4444' + '20' }]}>
      <ThemedText style={[s.badgeText, { color: '#EF4444' }]}>CRITICAL</ThemedText>
    </View>
  );
}

function PermissionTag({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.permTag, { backgroundColor: color + '12' }]}>
      <ThemedText style={[s.permTagText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function BizOrgPeopleV2({ colors, accentColor, role = 'B1' }: Props) {
  // === RBAC Gate: non-founder/board/investor locked ===
  if (!isFounder(role) && !isBoardLevel(role) && !isInvestor(role)) {
    return <BizEmptyLock title="People" message="This section is restricted. Contact the Founder for access." />;
  }

  // === Entity Scope ===
  const { selectedEntityId } = useBusiness();
  // TODO: Wire entity scoping — filter people by selectedEntityId when
  // person records gain `entityIds` or `primaryEntityId` fields.
  // Currently, entity scoping is handled via the scope chips + getBizPeopleData().

  // === State ===
  const [activeTab, setActiveTab] = useState<BizPeopleTabId>('directory');
  const [activeScope, setActiveScope] = useState(0);
  const [activeDepartment, setActiveDepartment] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Detail sheets
  const [personDetailVisible, setPersonDetailVisible] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<BizPerson | null>(null);
  const [roleDetailVisible, setRoleDetailVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleSeat | null>(null);
  const [packageDetailVisible, setPackageDetailVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PermissionPackage | null>(null);

  // Org Chart expand state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['ppl-001']));

  // === Data ===
  const scopeLabel = BIZ_PEOPLE_SCOPE_CHIPS[activeScope];
  const data = useMemo(() => getBizPeopleData(scopeLabel), [scopeLabel]);

  // === Filtered people (triage-first sort) ===
  const filteredPeople = useMemo(() => {
    let result = data.people;
    const deptLabel = DEPARTMENT_CHIPS[activeDepartment];
    if (deptLabel !== 'All') {
      result = result.filter((p) => p.department === deptLabel);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          matchesSearch(p.name, q) ||
          matchesSearch(p.title, q) ||
          matchesSearch(p.department, q) ||
          matchesSearch(p.entityName, q) ||
          matchesSearch(p.role, q),
      );
    }
    // Triage-first sort:
    // 1. canRelease === true
    // 2. accountability.approvalsPending > 0
    // 3. riskFlags.length > 0
    // 4. Then alphabetical
    result = [...result].sort((a, b) => {
      const aRelease = (a as any).canRelease ? 1 : 0;
      const bRelease = (b as any).canRelease ? 1 : 0;
      if (aRelease !== bRelease) return bRelease - aRelease;

      const aPending = (a as any).accountability?.approvalsPending ?? 0;
      const bPending = (b as any).accountability?.approvalsPending ?? 0;
      const aHasPending = aPending > 0 ? 1 : 0;
      const bHasPending = bPending > 0 ? 1 : 0;
      if (aHasPending !== bHasPending) return bHasPending - aHasPending;

      const aRisk = ((a as any).riskFlags?.length ?? 0) > 0 ? 1 : 0;
      const bRisk = ((b as any).riskFlags?.length ?? 0) > 0 ? 1 : 0;
      if (aRisk !== bRisk) return bRisk - aRisk;

      return a.name.localeCompare(b.name);
    });
    return result;
  }, [data.people, activeDepartment, searchQuery]);

  // === Filtered role seats ===
  const filteredSeats = useMemo(() => {
    let result = data.roleSeats;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          matchesSearch(s.title, q) ||
          matchesSearch(s.department, q) ||
          matchesSearch(s.entityName, q) ||
          (s.holderName ? matchesSearch(s.holderName, q) : matchesSearch('vacant', q)),
      );
    }
    return result;
  }, [data.roleSeats, searchQuery]);

  // === Filtered permission packages ===
  const filteredPackages = useMemo(() => {
    let result = data.permissionPackages;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          matchesSearch(p.name, q) ||
          matchesSearch(p.description, q) ||
          matchesSearch(p.rbacLevel, q),
      );
    }
    return result;
  }, [data.permissionPackages, searchQuery]);

  // === Org chart grouped by level ===
  const orgChartByLevel = useMemo(() => {
    const grouped: Record<OrgChartLevel, OrgChartNode[]> = {
      'C-Suite': [],
      'VP': [],
      'Director': [],
      'Manager': [],
      'IC': [],
    };
    data.orgChart.forEach((node) => {
      grouped[node.level].push(node);
    });
    return grouped;
  }, [data.orgChart]);

  // === Derived stats ===
  const vacantCriticalCount = useMemo(() => getVacantCriticalCount(data.roleSeats), [data.roleSeats]);
  const vacantCount = useMemo(() => getVacantCount(data.roleSeats), [data.roleSeats]);
  const filledCount = useMemo(() => getFilledCount(data.roleSeats), [data.roleSeats]);
  const coveragePercent = useMemo(() => getCoveragePercent(data.roleSeats), [data.roleSeats]);
  const activeCount = useMemo(() => data.people.filter((p) => p.status === 'active').length, [data.people]);
  const onLeaveCount = useMemo(() => data.people.filter((p) => p.status === 'on_leave').length, [data.people]);

  // === Callbacks ===
  const handleTabSelect = useCallback((tabId: string) => {
    setActiveTab(tabId as BizPeopleTabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleDepartmentPress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveDepartment(index);
  }, []);

  const handlePersonPress = useCallback((person: BizPerson) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPerson(person);
    setPersonDetailVisible(true);
  }, []);

  const handleRolePress = useCallback((seat: RoleSeat) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRole(seat);
    setRoleDetailVisible(true);
  }, []);

  const handlePackagePress = useCallback((pkg: PermissionPackage) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPackage(pkg);
    setPackageDetailVisible(true);
  }, []);

  const handleToggleExpand = useCallback((nodeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  // ===================================================================
  // RENDER — SUB-TAB CONTENT
  // ===================================================================

  const allSubTabs = BIZ_PEOPLE_TABS.map((t) => ({ id: t.id, label: t.label }));
  const subTabs = useMemo(() => {
    if (isFounder(role)) return allSubTabs;
    if (isBoardLevel(role)) return allSubTabs; // Board: all tabs, read-only
    // Investor (non-board): directory only (limited view)
    return allSubTabs.filter((t) => t.id === 'directory');
  }, [role, allSubTabs]);

  // ===================================================================
  // TAB 1: DIRECTORY
  // ===================================================================

  const renderDirectory = () => (
    <View style={s.tabContent}>
      {/* Department filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0 }}
        contentContainerStyle={s.chipRow}
      >
        {DEPARTMENT_CHIPS.map((chip, i) => (
          <Pressable
            key={chip}
            style={[
              s.filterChip,
              i === activeDepartment
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleDepartmentPress(i)}
          >
            <ThemedText
              style={[
                s.filterChipText,
                { color: i === activeDepartment ? '#000' : colors.textSecondary },
              ]}
            >
              {chip}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* People count summary */}
      <View style={[s.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.summaryStat}>
          <ThemedText style={[s.summaryStatLabel, { color: colors.textSecondary }]}>
            Active
          </ThemedText>
          <ThemedText style={[s.summaryStatValue, { color: '#22C55E', fontVariant: ['tabular-nums'] }]}>
            {activeCount}
          </ThemedText>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: colors.divider }]} />
        <View style={s.summaryStat}>
          <ThemedText style={[s.summaryStatLabel, { color: colors.textSecondary }]}>
            On Leave
          </ThemedText>
          <ThemedText style={[s.summaryStatValue, { color: '#F59E0B', fontVariant: ['tabular-nums'] }]}>
            {onLeaveCount}
          </ThemedText>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: colors.divider }]} />
        <View style={s.summaryStat}>
          <ThemedText style={[s.summaryStatLabel, { color: colors.textSecondary }]}>
            Total
          </ThemedText>
          <ThemedText style={[s.summaryStatValue, { fontVariant: ['tabular-nums'] }]}>
            {data.people.length}
          </ThemedText>
        </View>
      </View>

      {/* People list */}
      <FlatList<BizPerson>
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={<EmptyState icon="person.2" text="No people found" colors={colors} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              s.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handlePersonPress(item)}
          >
            <View style={s.listCardRow}>
              <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
                <ThemedText style={[s.avatarText, { color: accentColor }]}>
                  {item.avatarInitials}
                </ThemedText>
              </View>
              <View style={s.listCardInfo}>
                <View style={s.topRow}>
                  <ThemedText style={s.listCardTitle} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <PersonStatusBadge status={item.status} />
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                  {item.title}
                </ThemedText>
                <View style={s.metaRow}>
                  <RBACBadge level={item.rbacLevel} />
                  <EntityBadge name={item.entityName} accentColor={accentColor} />
                </View>
                <View style={s.metaRow}>
                  <View style={s.roleLabelRow}>
                    <IconSymbol name="person.badge.key" size={11} color={colors.textTertiary} />
                    <ThemedText style={[s.roleLabelText, { color: colors.textTertiary }]}>
                      {item.role}
                    </ThemedText>
                  </View>
                  {item.signatureAuthority !== 'none' && (
                    <SignatureAuthorityBadge authority={item.signatureAuthority} />
                  )}
                </View>

                {/* Authority strip — only for Founder / Board-level roles */}
                {(isFounder(role) || isBoardLevel(role)) && (
                  <View style={s.authorityStrip}>
                    <View style={s.authorityItem}>
                      <View style={[s.authorityDot, { backgroundColor: item.canApprove ? '#22C55E' : '#EF4444' }]} />
                      <ThemedText style={[s.authorityLabel, { color: colors.textTertiary }]}>
                        Approve: {item.canApprove ? '\u2713' : '\u2717'}
                      </ThemedText>
                    </View>
                    <View style={[s.authoritySep, { backgroundColor: colors.divider }]} />
                    <View style={s.authorityItem}>
                      <View style={[s.authorityDot, { backgroundColor: item.canRelease ? '#F59E0B' : '#A1A1AA' }]} />
                      <ThemedText style={[s.authorityLabel, { color: item.canRelease ? '#F59E0B' : colors.textTertiary }]}>
                        Release: {item.canRelease ? '\u2713' : '\u2717'}
                      </ThemedText>
                    </View>
                    <View style={[s.authoritySep, { backgroundColor: colors.divider }]} />
                    <View style={s.authorityItem}>
                      <View style={[s.authorityDot, { backgroundColor: SENSITIVE_ACCESS_COLOR[item.sensitiveAccess] }]} />
                      <ThemedText style={[s.authorityLabel, { color: SENSITIVE_ACCESS_COLOR[item.sensitiveAccess] }]}>
                        Sensitive: {item.sensitiveAccess === 'full' ? 'Full' : item.sensitiveAccess === 'partial' ? 'Partial' : 'None'}
                      </ThemedText>
                    </View>
                  </View>
                )}

                {/* Risk flags — only for Founder */}
                {isFounder(role) && item.riskFlags && item.riskFlags.length > 0 && (
                  <View style={s.riskFlagsRow}>
                    {item.riskFlags.map((flag) => (
                      <View key={flag} style={s.riskFlagChip}>
                        <ThemedText style={s.riskFlagText}>{flag}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  // ===================================================================
  // TAB 2: ORG CHART
  // ===================================================================

  const renderOrgChart = () => (
    <ScrollView style={s.tabContentScroll} contentContainerStyle={s.tabContentPadded}>
      {/* Coverage stats */}
      <View style={[s.summaryRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.summaryStat}>
          <ThemedText style={[s.summaryStatLabel, { color: colors.textSecondary }]}>
            Filled
          </ThemedText>
          <ThemedText style={[s.summaryStatValue, { color: '#22C55E', fontVariant: ['tabular-nums'] }]}>
            {filledCount}
          </ThemedText>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: colors.divider }]} />
        <View style={s.summaryStat}>
          <ThemedText style={[s.summaryStatLabel, { color: colors.textSecondary }]}>
            Vacant
          </ThemedText>
          <ThemedText style={[s.summaryStatValue, { color: '#EF4444', fontVariant: ['tabular-nums'] }]}>
            {vacantCount}
          </ThemedText>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: colors.divider }]} />
        <View style={s.summaryStat}>
          <ThemedText style={[s.summaryStatLabel, { color: colors.textSecondary }]}>
            Coverage
          </ThemedText>
          <ThemedText style={[s.summaryStatValue, { color: accentColor, fontVariant: ['tabular-nums'] }]}>
            {coveragePercent}%
          </ThemedText>
        </View>
      </View>

      {/* Tree by level */}
      {ORG_LEVEL_ORDER.map((level) => {
        const nodes = orgChartByLevel[level];
        if (nodes.length === 0) return null;
        return (
          <View key={level} style={s.orgLevelSection}>
            <View style={s.orgLevelHeader}>
              <OrgLevelBadge level={level} />
              <ThemedText style={[s.orgLevelCount, { color: colors.textTertiary }]}>
                {nodes.length} {nodes.length === 1 ? 'seat' : 'seats'}
              </ThemedText>
            </View>

            {nodes.map((node) => {
              const isExpanded = node.personId ? expandedNodes.has(node.personId) : false;
              const hasReports = node.directReportIds.length > 0;

              return (
                <View key={node.personId ?? node.title} style={s.orgNodeWrapper}>
                  <Pressable
                    style={({ pressed }) => [
                      s.orgNodeCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: node.vacant
                          ? '#EF4444' + '40'
                          : colors.border,
                        borderStyle: node.vacant ? 'dashed' as any : 'solid' as any,
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                    onPress={() => {
                      if (node.personId && hasReports) {
                        handleToggleExpand(node.personId);
                      } else if (node.personId) {
                        const person = data.people.find((p) => p.id === node.personId);
                        if (person) handlePersonPress(person);
                      }
                    }}
                  >
                    <View style={s.orgNodeRow}>
                      <View
                        style={[
                          s.avatarCircle,
                          {
                            backgroundColor: node.vacant
                              ? '#EF4444' + '15'
                              : accentColor + '25',
                          },
                        ]}
                      >
                        <ThemedText
                          style={[
                            s.avatarText,
                            {
                              color: node.vacant ? '#EF4444' : accentColor,
                            },
                          ]}
                        >
                          {node.vacant ? '?' : getInitials(node.name)}
                        </ThemedText>
                      </View>
                      <View style={s.orgNodeInfo}>
                        <View style={s.orgNodeNameRow}>
                          {node.vacant ? (
                            <VacantBadge />
                          ) : (
                            <ThemedText style={s.orgNodeName} numberOfLines={1}>
                              {node.name}
                            </ThemedText>
                          )}
                          {node.critical && node.vacant && <CriticalBadge />}
                        </View>
                        <ThemedText style={[s.orgNodeTitle, { color: colors.textSecondary }]}>
                          {node.title}
                        </ThemedText>
                        <EntityBadge name={node.entityName} accentColor={accentColor} />
                      </View>
                      {hasReports && (
                        <View style={s.expandIndicator}>
                          <IconSymbol
                            name={isExpanded ? 'chevron.down' : 'chevron.right'}
                            size={14}
                            color={colors.textTertiary}
                          />
                          <ThemedText style={[s.reportCountText, { color: colors.textTertiary }]}>
                            {node.directReportIds.length}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </Pressable>

                  {/* Expanded direct reports */}
                  {isExpanded && hasReports && (
                    <View style={s.directReportsContainer}>
                      {node.directReportIds.map((reportId) => {
                        const reportNode = data.orgChart.find((n) => n.personId === reportId);
                        if (!reportNode) return null;
                        return (
                          <Pressable
                            key={reportId}
                            style={({ pressed }) => [
                              s.directReportCard,
                              {
                                backgroundColor: colors.card,
                                borderColor: colors.border,
                              },
                              pressed && { opacity: 0.85 },
                            ]}
                            onPress={() => {
                              const person = data.people.find((p) => p.id === reportId);
                              if (person) handlePersonPress(person);
                            }}
                          >
                            <View style={s.orgNodeRow}>
                              <View style={[s.avatarCircleSmall, { backgroundColor: accentColor + '20' }]}>
                                <ThemedText style={[s.avatarTextSmall, { color: accentColor }]}>
                                  {getInitials(reportNode.name)}
                                </ThemedText>
                              </View>
                              <View style={s.orgNodeInfo}>
                                <ThemedText style={s.directReportName} numberOfLines={1}>
                                  {reportNode.name}
                                </ThemedText>
                                <ThemedText style={[s.directReportTitle, { color: colors.textSecondary }]}>
                                  {reportNode.title}
                                </ThemedText>
                              </View>
                              <OrgLevelBadge level={reportNode.level} />
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );

  // ===================================================================
  // TAB 3: ROLES & COVERAGE
  // ===================================================================

  // Coverage scores data (use exported COVERAGE_SCORES, fallback to inline)
  const coverageScores = COVERAGE_SCORES ?? COVERAGE_SCORES_FALLBACK;
  const coverageEntries = Object.entries(coverageScores);

  const renderRoles = () => (
    <View style={s.tabContent}>
      {/* Coverage Dashboard — 2x3 grid of category cards */}
      <View style={[s.coverageDashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.coverageDashboardTitle, { color: colors.textSecondary }]}>
          COVERAGE DASHBOARD
        </ThemedText>
        <View style={s.coverageGrid}>
          {coverageEntries.map(([key, val]) => {
            const pct = val.total > 0 ? Math.round((val.filled / val.total) * 100) : 0;
            const barColor = getCoverageColor(val.filled, val.total);
            return (
              <View key={key} style={[s.coverageGridCell, { backgroundColor: colors.backgroundTertiary }]}>
                <ThemedText style={[s.coverageGridLabel, { color: colors.textSecondary }]}>
                  {COVERAGE_CATEGORY_LABELS[key] ?? key}
                </ThemedText>
                <ThemedText style={[s.coverageGridFraction, { color: colors.text, fontVariant: ['tabular-nums'] }]}>
                  {val.filled}/{val.total}
                </ThemedText>
                <View style={[s.coverageGridBar, { backgroundColor: colors.border }]}>
                  <View style={[s.coverageGridBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                </View>
                <ThemedText style={[s.coverageGridPct, { color: barColor, fontVariant: ['tabular-nums'] }]}>
                  {pct}%
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>

      {/* Coverage summary */}
      <View style={[s.coverageSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.coverageHeader}>
          <ThemedText style={[s.coverageTitle, { color: colors.textSecondary }]}>
            ROLE COVERAGE
          </ThemedText>
          <ThemedText style={[s.coveragePercent, { color: accentColor, fontVariant: ['tabular-nums'] }]}>
            {coveragePercent}%
          </ThemedText>
        </View>
        <View style={[s.coverageBar, { backgroundColor: colors.backgroundTertiary }]}>
          <View
            style={[
              s.coverageBarFill,
              {
                width: `${coveragePercent}%`,
                backgroundColor: coveragePercent >= 80 ? '#22C55E' : coveragePercent >= 60 ? '#F59E0B' : '#EF4444',
              },
            ]}
          />
        </View>
        <View style={s.coverageStatsRow}>
          <ThemedText style={[s.coverageStat, { color: colors.textSecondary }]}>
            <ThemedText style={[s.coverageStatValue, { color: '#22C55E' }]}>{filledCount}</ThemedText> filled
          </ThemedText>
          <ThemedText style={[s.coverageStat, { color: colors.textSecondary }]}>
            <ThemedText style={[s.coverageStatValue, { color: '#EF4444' }]}>{vacantCount}</ThemedText> vacant
          </ThemedText>
          <ThemedText style={[s.coverageStat, { color: colors.textSecondary }]}>
            <ThemedText style={[s.coverageStatValue, { color: '#EF4444' }]}>{vacantCriticalCount}</ThemedText> critical open
          </ThemedText>
        </View>
      </View>

      {/* Role seats list */}
      <FlatList<RoleSeat>
        data={filteredSeats}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={<EmptyState icon="person.badge.key" text="No role seats found" colors={colors} />}
        renderItem={({ item }) => {
          const isVacant = item.holder === null;
          return (
            <Pressable
              style={({ pressed }) => [
                s.roleCard,
                {
                  backgroundColor: colors.card,
                  borderColor: isVacant && item.critical ? '#EF4444' + '60' : colors.border,
                },
                pressed && { opacity: 0.85 },
              ]}
              onPress={() => handleRolePress(item)}
            >
              <View style={s.roleCardTop}>
                <View style={s.roleCardTitleRow}>
                  <ThemedText style={s.roleCardTitle} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  {item.critical && <CriticalBadge />}
                </View>
                <ThemedText style={[s.roleCardDept, { color: colors.textSecondary }]}>
                  {item.department}
                </ThemedText>
              </View>

              <View style={[s.roleDivider, { backgroundColor: colors.divider }]} />

              <View style={s.roleCardBody}>
                {/* Holder */}
                <View style={s.roleDetailRow}>
                  <ThemedText style={[s.roleDetailLabel, { color: colors.textTertiary }]}>
                    Holder
                  </ThemedText>
                  {isVacant ? (
                    <VacantBadge />
                  ) : (
                    <ThemedText style={[s.roleDetailValue, { color: colors.text }]}>
                      {item.holderName}
                    </ThemedText>
                  )}
                </View>

                {/* Entity */}
                <View style={s.roleDetailRow}>
                  <ThemedText style={[s.roleDetailLabel, { color: colors.textTertiary }]}>
                    Entity
                  </ThemedText>
                  <EntityBadge name={item.entityName} accentColor={accentColor} />
                </View>

                {/* Signature Authority */}
                <View style={s.roleDetailRow}>
                  <ThemedText style={[s.roleDetailLabel, { color: colors.textTertiary }]}>
                    Signature
                  </ThemedText>
                  <SignatureAuthorityBadge authority={item.signatureAuthority} />
                </View>

                {/* Required Permissions */}
                <View style={s.rolePermRow}>
                  <ThemedText style={[s.roleDetailLabel, { color: colors.textTertiary }]}>
                    Permissions
                  </ThemedText>
                  <View style={s.permTagsWrap}>
                    {item.requiredPermissions.map((perm) => (
                      <PermissionTag
                        key={perm}
                        label={perm.replace(/_/g, ' ')}
                        color={accentColor}
                      />
                    ))}
                  </View>
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );

  // ===================================================================
  // TAB 4: PERMISSIONS
  // ===================================================================

  const renderPermissions = () => (
    <View style={s.tabContent}>
      <FlatList<PermissionPackage>
        data={filteredPackages}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={s.listContent}
        ListEmptyComponent={<EmptyState icon="lock.shield" text="No permission packages found" colors={colors} />}
        renderItem={({ item }) => (
          <Pressable
            style={({ pressed }) => [
              s.pkgCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handlePackagePress(item)}
          >
            {/* Header */}
            <View style={s.pkgCardHeader}>
              <View style={s.pkgCardTitleRow}>
                <View style={[s.pkgIconCircle, { backgroundColor: RBAC_LEVEL_COLOR[item.rbacLevel] + '20' }]}>
                  <IconSymbol name="lock.shield" size={14} color={RBAC_LEVEL_COLOR[item.rbacLevel]} />
                </View>
                <View style={s.pkgCardTitleCol}>
                  <ThemedText style={s.pkgCardTitle} numberOfLines={1}>
                    {item.name}
                  </ThemedText>
                  <RBACFullBadge level={item.rbacLevel} />
                </View>
              </View>
            </View>

            {/* Description */}
            <ThemedText style={[s.pkgDescription, { color: colors.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            <View style={[s.roleDivider, { backgroundColor: colors.divider }]} />

            {/* Tab Access */}
            <View style={s.pkgSection}>
              <ThemedText style={[s.pkgSectionLabel, { color: colors.textTertiary }]}>
                TAB ACCESS
              </ThemedText>
              <View style={s.permTagsWrap}>
                {item.tabAccess.map((tab) => (
                  <PermissionTag key={tab} label={tab} color={accentColor} />
                ))}
              </View>
            </View>

            {/* Actions */}
            <View style={s.pkgSection}>
              <ThemedText style={[s.pkgSectionLabel, { color: colors.textTertiary }]}>
                ACTIONS
              </ThemedText>
              <View style={s.pkgActionsCol}>
                {item.actions.map((action) => (
                  <View key={action} style={s.pkgActionRow}>
                    <IconSymbol name="checkmark.circle.fill" size={12} color="#22C55E" />
                    <ThemedText style={[s.pkgActionText, { color: colors.textSecondary }]}>
                      {action}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </Pressable>
        )}
      />
    </View>
  );

  // ===================================================================
  // TAB CONTENT SWITCH
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'directory':
        return renderDirectory();
      case 'org-chart':
        if (!isBoardLevel(role)) return null;
        return renderOrgChart();
      case 'roles':
        if (!isBoardLevel(role)) return null;
        return renderRoles();
      case 'permissions':
        if (!isBoardLevel(role)) return null;
        return renderPermissions();
      default:
        return null;
    }
  };

  // ===================================================================
  // PERSON DETAIL BOTTOM SHEET
  // ===================================================================

  const renderPersonDetail = () => {
    if (!selectedPerson) return null;
    const pkg = getPackageById(selectedPerson.permissionPackage);
    const reportsToName = selectedPerson.reportsTo
      ? data.people.find((p) => p.id === selectedPerson.reportsTo)?.name ?? 'N/A'
      : 'None (Top Level)';
    const directReportNames = selectedPerson.directReports
      .map((id) => data.people.find((p) => p.id === id)?.name)
      .filter(Boolean) as string[];

    return (
      <View style={s.detailSheet}>
        {/* Avatar + Name */}
        <View style={[s.detailAvatarLarge, { backgroundColor: accentColor + '25' }]}>
          <ThemedText style={[s.detailAvatarText, { color: accentColor }]}>
            {selectedPerson.avatarInitials}
          </ThemedText>
        </View>
        <ThemedText style={s.detailName}>{selectedPerson.name}</ThemedText>
        <ThemedText style={[s.detailSubtitle, { color: colors.textSecondary }]}>
          {selectedPerson.title}
        </ThemedText>
        <View style={s.detailBadgeRow}>
          <PersonStatusBadge status={selectedPerson.status} />
          <RBACBadge level={selectedPerson.rbacLevel} />
          {selectedPerson.signatureAuthority !== 'none' && (
            <SignatureAuthorityBadge authority={selectedPerson.signatureAuthority} />
          )}
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Contact Section */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          CONTACT
        </ThemedText>
        <View style={s.detailRow}>
          <IconSymbol name="envelope" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Email</ThemedText>
          <ThemedText style={[s.detailValue, { color: accentColor }]} numberOfLines={1}>
            {selectedPerson.email}
          </ThemedText>
        </View>
        <View style={s.detailRow}>
          <IconSymbol name="phone" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Phone</ThemedText>
          <ThemedText style={s.detailValue} numberOfLines={1}>
            {selectedPerson.phone}
          </ThemedText>
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Role History Section */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          ROLE INFO
        </ThemedText>
        <View style={s.detailRow}>
          <IconSymbol name="person.badge.key" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Role</ThemedText>
          <ThemedText style={s.detailValue}>{selectedPerson.role}</ThemedText>
        </View>
        <View style={s.detailRow}>
          <IconSymbol name="calendar" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Start Date</ThemedText>
          <ThemedText style={s.detailValue}>{selectedPerson.startDate}</ThemedText>
        </View>
        <View style={s.detailRow}>
          <IconSymbol name="arrow.up" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Reports To</ThemedText>
          <ThemedText style={s.detailValue} numberOfLines={1}>{reportsToName}</ThemedText>
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Assigned Entity Section */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          ASSIGNED ENTITY
        </ThemedText>
        <View style={s.detailRow}>
          <IconSymbol name="building.2" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
          <EntityBadge name={selectedPerson.entityName} accentColor={accentColor} />
        </View>
        <View style={s.detailRow}>
          <IconSymbol name="person.text.rectangle" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Department</ThemedText>
          <ThemedText style={s.detailValue}>{selectedPerson.department}</ThemedText>
        </View>

        {/* Direct Reports */}
        {directReportNames.length > 0 && (
          <>
            <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />
            <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
              DIRECT REPORTS ({directReportNames.length})
            </ThemedText>
            {directReportNames.map((name) => (
              <View key={name} style={s.directReportRow}>
                <View style={[s.avatarCircleSmall, { backgroundColor: accentColor + '15' }]}>
                  <ThemedText style={[s.avatarTextSmall, { color: accentColor }]}>
                    {getInitials(name)}
                  </ThemedText>
                </View>
                <ThemedText style={[s.directReportText, { color: colors.text }]}>{name}</ThemedText>
              </View>
            ))}
          </>
        )}

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Permission Package Section */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          PERMISSION PACKAGE
        </ThemedText>
        {pkg ? (
          <View style={[s.detailPkgCard, { backgroundColor: colors.backgroundTertiary }]}>
            <View style={s.detailPkgHeader}>
              <ThemedText style={s.detailPkgName}>{pkg.name}</ThemedText>
              <RBACBadge level={pkg.rbacLevel} />
            </View>
            <ThemedText style={[s.detailPkgDesc, { color: colors.textSecondary }]} numberOfLines={2}>
              {pkg.description}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[s.detailValue, { color: colors.textTertiary }]}>
            No package assigned
          </ThemedText>
        )}

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Signature Authorities Section */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          SIGNATURE AUTHORITY
        </ThemedText>
        <View style={s.detailRow}>
          <IconSymbol name="signature" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Level</ThemedText>
          <SignatureAuthorityBadge authority={selectedPerson.signatureAuthority} />
        </View>

        {/* Actions */}
        <View style={s.detailActions}>
          <Pressable
            style={({ pressed }) => [
              s.detailActionBtn,
              { backgroundColor: accentColor + '15' },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="envelope" size={16} color={accentColor} />
            <ThemedText style={[s.detailActionText, { color: accentColor }]}>Email</ThemedText>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              s.detailActionBtn,
              { backgroundColor: accentColor + '15' },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name="pencil" size={16} color={accentColor} />
            <ThemedText style={[s.detailActionText, { color: accentColor }]}>Edit</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  };

  // ===================================================================
  // ROLE DETAIL BOTTOM SHEET
  // ===================================================================

  const renderRoleDetail = () => {
    if (!selectedRole) return null;
    return (
      <View style={s.detailSheet}>
        <View style={[s.detailIconLarge, { backgroundColor: accentColor + '20' }]}>
          <IconSymbol name="person.badge.key" size={28} color={accentColor} />
        </View>
        <ThemedText style={s.detailName}>{selectedRole.title}</ThemedText>
        <ThemedText style={[s.detailSubtitle, { color: colors.textSecondary }]}>
          {selectedRole.department}
        </ThemedText>
        <View style={s.detailBadgeRow}>
          {selectedRole.critical && <CriticalBadge />}
          <SignatureAuthorityBadge authority={selectedRole.signatureAuthority} />
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Holder */}
        <View style={s.detailRow}>
          <IconSymbol name="person" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Holder</ThemedText>
          {selectedRole.holder ? (
            <ThemedText style={s.detailValue}>{selectedRole.holderName}</ThemedText>
          ) : (
            <VacantBadge />
          )}
        </View>

        {/* Entity */}
        <View style={s.detailRow}>
          <IconSymbol name="building.2" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Entity</ThemedText>
          <EntityBadge name={selectedRole.entityName} accentColor={accentColor} />
        </View>

        {/* Signature Authority */}
        <View style={s.detailRow}>
          <IconSymbol name="signature" size={14} color={colors.textTertiary} />
          <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Signature</ThemedText>
          <SignatureAuthorityBadge authority={selectedRole.signatureAuthority} />
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Required Permissions */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          REQUIRED PERMISSIONS
        </ThemedText>
        <View style={s.permTagsWrap}>
          {selectedRole.requiredPermissions.map((perm) => (
            <PermissionTag
              key={perm}
              label={perm.replace(/_/g, ' ')}
              color={accentColor}
            />
          ))}
        </View>

        {/* Actions */}
        <View style={s.detailActions}>
          {selectedRole.holder === null ? (
            <Pressable
              style={({ pressed }) => [
                s.detailActionBtn,
                { backgroundColor: '#22C55E' + '15' },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="person.badge.plus" size={16} color="#22C55E" />
              <ThemedText style={[s.detailActionText, { color: '#22C55E' }]}>Assign Person</ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                s.detailActionBtn,
                { backgroundColor: accentColor + '15' },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <IconSymbol name="pencil" size={16} color={accentColor} />
              <ThemedText style={[s.detailActionText, { color: accentColor }]}>Edit Role</ThemedText>
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  // ===================================================================
  // PACKAGE DETAIL BOTTOM SHEET
  // ===================================================================

  const renderPackageDetail = () => {
    if (!selectedPackage) return null;
    const assignedPeople = data.people.filter((p) => p.permissionPackage === selectedPackage.id);

    return (
      <View style={s.detailSheet}>
        <View
          style={[
            s.detailIconLarge,
            { backgroundColor: RBAC_LEVEL_COLOR[selectedPackage.rbacLevel] + '20' },
          ]}
        >
          <IconSymbol
            name="lock.shield"
            size={28}
            color={RBAC_LEVEL_COLOR[selectedPackage.rbacLevel]}
          />
        </View>
        <ThemedText style={s.detailName}>{selectedPackage.name}</ThemedText>
        <RBACFullBadge level={selectedPackage.rbacLevel} />

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Description */}
        <ThemedText style={[s.pkgDetailDesc, { color: colors.textSecondary }]}>
          {selectedPackage.description}
        </ThemedText>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Tab Access */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          TAB ACCESS ({selectedPackage.tabAccess.length})
        </ThemedText>
        <View style={s.permTagsWrap}>
          {selectedPackage.tabAccess.map((tab) => (
            <PermissionTag key={tab} label={tab} color={accentColor} />
          ))}
        </View>

        <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

        {/* Actions */}
        <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
          PERMITTED ACTIONS ({selectedPackage.actions.length})
        </ThemedText>
        <View style={s.pkgActionsCol}>
          {selectedPackage.actions.map((action) => (
            <View key={action} style={s.pkgActionRow}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#22C55E" />
              <ThemedText style={[s.pkgActionTextLarge, { color: colors.text }]}>
                {action}
              </ThemedText>
            </View>
          ))}
        </View>

        {/* Assigned people */}
        {assignedPeople.length > 0 && (
          <>
            <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />
            <ThemedText style={[s.detailSectionHeader, { color: colors.textTertiary }]}>
              ASSIGNED TO ({assignedPeople.length})
            </ThemedText>
            {assignedPeople.map((person) => (
              <View key={person.id} style={s.directReportRow}>
                <View style={[s.avatarCircleSmall, { backgroundColor: accentColor + '15' }]}>
                  <ThemedText style={[s.avatarTextSmall, { color: accentColor }]}>
                    {person.avatarInitials}
                  </ThemedText>
                </View>
                <View style={s.assignedPersonInfo}>
                  <ThemedText style={[s.directReportText, { color: colors.text }]}>
                    {person.name}
                  </ThemedText>
                  <ThemedText style={[s.assignedPersonTitle, { color: colors.textTertiary }]}>
                    {person.title}
                  </ThemedText>
                </View>
              </View>
            ))}
          </>
        )}
      </View>
    );
  };

  // ===================================================================
  // RENDER — MAIN
  // ===================================================================

  return (
    <View style={s.container}>
      {/* === Header === */}
      <View style={s.header}>
        <View style={s.headerTop}>
          <ThemedText style={s.headerTitle}>People</ThemedText>
          <View style={s.headerActions}>
            <Pressable
              style={({ pressed }) => [
                s.createBtn,
                { backgroundColor: accentColor },
                pressed && { opacity: 0.8 },
              ]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            >
              <IconSymbol name="plus" size={14} color="#000" />
              <ThemedText style={s.createBtnText}>Add Person</ThemedText>
            </Pressable>
          </View>
        </View>

        {/* Entity scope chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={s.chipRow}
        >
          {BIZ_PEOPLE_SCOPE_CHIPS.map((chip, i) => (
            <Pressable
              key={chip}
              style={[
                s.scopeChip,
                i === activeScope
                  ? { backgroundColor: accentColor }
                  : { backgroundColor: colors.backgroundTertiary },
              ]}
              onPress={() => handleScopePress(i)}
            >
              <ThemedText
                style={[
                  s.scopeChipText,
                  { color: i === activeScope ? '#000' : colors.textSecondary },
                ]}
              >
                {chip}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* Search bar */}
        <View style={[s.searchBar, { backgroundColor: colors.backgroundTertiary }]}>
          <IconSymbol name="magnifyingglass" size={16} color={colors.textTertiary} />
          <TextInput
            style={[s.searchInput, { color: colors.text }]}
            placeholder="Search people, roles, packages..."
            placeholderTextColor={colors.textTertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <IconSymbol name="xmark.circle.fill" size={16} color={colors.textTertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* === Sub-Tab Bar === */}
      <View style={s.subTabContainer}>
        <BizSubTabBar
          tabs={subTabs}
          activeId={activeTab}
          onSelect={handleTabSelect}
        />
      </View>

      {/* === Tab Content === */}
      <ScrollView
        style={s.contentArea}
        contentContainerStyle={s.contentAreaInner}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>

      {/* === Person Detail Bottom Sheet === */}
      <BottomSheet
        visible={personDetailVisible}
        onClose={() => setPersonDetailVisible(false)}
        title={selectedPerson?.name ?? 'Person Detail'}
        useModal
      >
        {renderPersonDetail()}
      </BottomSheet>

      {/* === Role Detail Bottom Sheet === */}
      <BottomSheet
        visible={roleDetailVisible}
        onClose={() => setRoleDetailVisible(false)}
        title={selectedRole?.title ?? 'Role Detail'}
        useModal
      >
        {renderRoleDetail()}
      </BottomSheet>

      {/* === Permission Package Detail Bottom Sheet === */}
      <BottomSheet
        visible={packageDetailVisible}
        onClose={() => setPackageDetailVisible(false)}
        title={selectedPackage?.name ?? 'Permission Package'}
        useModal
      >
        {renderPackageDetail()}
      </BottomSheet>
    </View>
  );
}

// =============================================================================
// STYLES
// =============================================================================

const s = StyleSheet.create({
  // === Layout ===
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  createBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#000',
  },

  // === Scope / Filter Chips ===
  chipRow: {
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  scopeChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  scopeChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // === Search ===
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 36,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },

  // === Sub-Tab Bar ===
  subTabContainer: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.sm,
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
  },
  contentAreaInner: {
    paddingBottom: Spacing.xxl,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tabContentScroll: {
    flex: 1,
  },
  tabContentPadded: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  listContent: {
    gap: Spacing.sm,
  },

  // === Summary Row ===
  summaryRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  summaryStat: {
    flex: 1,
    alignItems: 'center',
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.sm,
  },
  summaryStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  summaryStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },

  // === List Cards (Directory) ===
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  listCardRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  listCardInfo: {
    flex: 1,
    gap: 4,
  },
  listCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  roleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  roleLabelText: {
    fontSize: 11,
  },

  // === Avatar ===
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 12,
    fontWeight: '700',
  },
  avatarCircleSmall: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarTextSmall: {
    fontSize: 10,
    fontWeight: '700',
  },

  // === Badges ===
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // === Permission Tags ===
  permTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.md,
  },
  permTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  permTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  // === Org Chart ===
  orgLevelSection: {
    marginBottom: Spacing.md,
  },
  orgLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  orgLevelCount: {
    fontSize: 11,
  },
  orgNodeWrapper: {
    marginBottom: Spacing.sm,
  },
  orgNodeCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  orgNodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  orgNodeInfo: {
    flex: 1,
    gap: 3,
  },
  orgNodeNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orgNodeName: {
    fontSize: 14,
    fontWeight: '600',
  },
  orgNodeTitle: {
    fontSize: 12,
  },
  expandIndicator: {
    alignItems: 'center',
    gap: 2,
  },
  reportCountText: {
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  directReportsContainer: {
    marginLeft: Spacing.lg,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: '#2F3336',
    paddingLeft: Spacing.sm,
  },
  directReportCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  directReportName: {
    fontSize: 13,
    fontWeight: '500',
  },
  directReportTitle: {
    fontSize: 11,
  },

  // === Roles & Coverage ===
  coverageSummaryCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  coverageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  coverageTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coveragePercent: {
    fontSize: 22,
    fontWeight: '800',
  },
  coverageBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  coverageBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  coverageStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  coverageStat: {
    fontSize: 12,
  },
  coverageStatValue: {
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  roleCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  roleCardTop: {
    gap: 2,
  },
  roleCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  roleCardDept: {
    fontSize: 12,
  },
  roleDivider: {
    height: StyleSheet.hairlineWidth,
  },
  roleCardBody: {
    gap: Spacing.sm,
  },
  roleDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleDetailLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  roleDetailValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  rolePermRow: {
    gap: Spacing.xs,
  },

  // === Permission Packages ===
  pkgCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  pkgCardHeader: {
    gap: 4,
  },
  pkgCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  pkgIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pkgCardTitleCol: {
    flex: 1,
    gap: 4,
  },
  pkgCardTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  pkgDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  pkgSection: {
    gap: Spacing.xs,
  },
  pkgSectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  pkgActionsCol: {
    gap: 6,
  },
  pkgActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pkgActionText: {
    fontSize: 12,
  },
  pkgActionTextLarge: {
    fontSize: 13,
  },

  // === Empty State ===
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: 240,
  },

  // === Detail Bottom Sheet ===
  detailSheet: {
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  detailAvatarLarge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailAvatarText: {
    fontSize: 22,
    fontWeight: '700',
  },
  detailIconLarge: {
    width: 64,
    height: 64,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailName: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailSubtitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: Spacing.xs,
  },
  detailSectionHeader: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 4,
    gap: Spacing.sm,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
    textAlign: 'right',
  },
  detailPkgCard: {
    alignSelf: 'stretch',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    gap: 6,
  },
  detailPkgHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  detailPkgName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  detailPkgDesc: {
    fontSize: 12,
    lineHeight: 17,
  },
  pkgDetailDesc: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  directReportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    gap: Spacing.sm,
    paddingVertical: 4,
  },
  directReportText: {
    fontSize: 13,
    fontWeight: '500',
  },
  assignedPersonInfo: {
    flex: 1,
  },
  assignedPersonTitle: {
    fontSize: 11,
  },
  detailActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  detailActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: BorderRadius.lg,
  },
  detailActionText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // === Authority Strip (Directory card enhancement) ===
  authorityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#2F3336',
    gap: 6,
  },
  authorityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  authorityLabel: {
    fontSize: 10,
    fontWeight: '500',
  },
  authoritySep: {
    width: StyleSheet.hairlineWidth,
    height: 12,
  },

  // === Risk Flags (Directory card enhancement) ===
  riskFlagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  riskFlagChip: {
    backgroundColor: '#EF4444' + '18',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  riskFlagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EF4444',
  },

  // === Coverage Dashboard (Roles & Coverage tab) ===
  coverageDashboardCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  coverageDashboardTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  coverageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  coverageGridCell: {
    width: '30.5%' as any,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    gap: 4,
  },
  coverageGridLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  coverageGridFraction: {
    fontSize: 16,
    fontWeight: '700',
  },
  coverageGridBar: {
    width: '100%',
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  coverageGridBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  coverageGridPct: {
    fontSize: 12,
    fontWeight: '700',
  },
});
