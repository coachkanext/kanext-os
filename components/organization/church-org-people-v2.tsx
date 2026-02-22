/**
 * Church Organization People — Directory, org chart, roles, permissions, safeguards.
 * Sub-tabs: Directory | Org Chart | Roles | Permissions | Safeguards
 * RBAC: C1/C2 full access, C3 Directory + Org Chart only, C4/C5 locked.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { ChurchRoleLens } from '@/utils/church-rbac';
import { isStaffLevel, isElderLevel } from '@/utils/church-rbac';
import {
  getChurchPeopleData,
  LANE_LABELS,
  LANE_COLORS,
  AUTHORITY_LABELS,
  AUTHORITY_COLORS,
  BG_CHECK_LABELS,
  BG_CHECK_COLORS,
} from '@/data/mock-church-org-people';
import type {
  ChurchPerson,
  OrgChartNode,
  SeatCoverageRow,
  PermissionPackageInfo,
  AuditLogEntry,
  SafeguardEntry,
} from '@/data/mock-church-org-people';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.church;
const SUB_TABS = [
  { id: 'directory', label: 'Directory' },
  { id: 'org-chart', label: 'Org Chart' },
  { id: 'roles', label: 'Roles' },
  { id: 'permissions', label: 'Permissions' },
  { id: 'safeguards', label: 'Safeguards' },
];

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: ChurchRoleLens;
}

// =============================================================================
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  const parts = name.replace(/^(Pastor|Elder|Dr\.?)\s+/i, '').split(' ');
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

function getHierarchyDepth(
  personId: string,
  nodesMap: Map<string, OrgChartNode>,
  visited = new Set<string>(),
): number {
  if (visited.has(personId)) return 0;
  visited.add(personId);
  const node = nodesMap.get(personId);
  if (!node || !node.reportsTo) return 0;
  return 1 + getHierarchyDepth(node.reportsTo, nodesMap, visited);
}

// =============================================================================
// EMPTY STATE
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// STATUS BADGE
// =============================================================================

function StatusBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[s.badge, { backgroundColor: color + '20' }]}>
      <ThemedText style={[s.badgeText, { color }]}>{label}</ThemedText>
    </View>
  );
}

// =============================================================================
// PROGRESS BAR
// =============================================================================

function ProgressBar({ percent, color }: { percent: number; color: string }) {
  const clamped = Math.min(Math.max(percent, 0), 100);
  return (
    <View style={s.progressTrack}>
      <View style={[s.progressFill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

// =============================================================================
// SUB-TAB BAR
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

// =============================================================================
// LOCKED STATE
// =============================================================================

function LockedState({ colors }: { colors: typeof Colors.light }) {
  return (
    <View style={s.lockedContainer}>
      <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
      <ThemedText style={[s.lockedTitle, { color: colors.text }]}>People</ThemedText>
      <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
        This section is restricted. Contact church staff for access.
      </ThemedText>
    </View>
  );
}

// =============================================================================
// DIRECTORY TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  people,
  onSelectPerson,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  people: ChurchPerson[];
  onSelectPerson: (person: ChurchPerson) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ChurchPerson }) => {
      const laneColor = LANE_COLORS[item.lane];
      const initials = item.avatar || getInitials(item.name);
      const hasRisk = item.riskFlags.length > 0;

      return (
        <Pressable
          style={[s.personCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPerson(item);
          }}
        >
          {/* Top Row: Avatar + Info + Lane Badge */}
          <View style={s.personCardTop}>
            <View style={[s.personAvatar, { backgroundColor: laneColor + '20' }]}>
              <ThemedText style={[s.personAvatarText, { color: laneColor }]}>{initials}</ThemedText>
            </View>
            <View style={s.personInfoCol}>
              <ThemedText style={[s.personName, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.personRole, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.role}
              </ThemedText>
            </View>
            <View style={[s.personLaneBadge, { backgroundColor: laneColor + '18' }]}>
              <ThemedText style={[s.badgeText, { color: laneColor }]}>
                {LANE_LABELS[item.lane].toUpperCase()}
              </ThemedText>
            </View>
          </View>

          {/* Authority Strip */}
          {item.authority.length > 0 && (
            <View style={s.authorityStrip}>
              {item.authority.map((auth) => (
                <View
                  key={auth}
                  style={[s.authorityBadge, { backgroundColor: AUTHORITY_COLORS[auth] + '20' }]}
                >
                  <ThemedText style={[s.authorityBadgeText, { color: AUTHORITY_COLORS[auth] }]}>
                    {AUTHORITY_LABELS[auth]}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Accountability Line */}
          {item.ministriesOwned.length > 0 && (
            <View style={s.accountabilityRow}>
              <IconSymbol name="shield.checkmark.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.accountabilityText, { color: colors.textSecondary }]} numberOfLines={1}>
                Owns: {item.ministriesOwned.join(', ')}
              </ThemedText>
            </View>
          )}

          {/* Risk Flags */}
          {hasRisk && (
            <View style={s.riskFlagRow}>
              {item.riskFlags.map((flag, idx) => (
                <View key={`risk-${idx}`} style={[s.riskFlag, { backgroundColor: '#EF444418' }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={10} color="#EF4444" />
                  <ThemedText style={[s.riskFlagText, { color: '#EF4444' }]}>{flag}</ThemedText>
                </View>
              ))}
            </View>
          )}
        </Pressable>
      );
    },
    [colors, onSelectPerson],
  );

  return (
    <FlatList
      data={people}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.3.fill" label="No people found" colors={colors} />
      }
    />
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
  // Group by lane
  const lanes = useMemo(() => {
    const laneOrder: Array<OrgChartNode['lane']> = [
      'clergy',
      'ministry_leadership',
      'operations',
      'finance',
      'volunteers',
    ];
    const grouped = new Map<string, OrgChartNode[]>();
    for (const lane of laneOrder) {
      grouped.set(lane, []);
    }
    for (const node of orgChart) {
      const list = grouped.get(node.lane);
      if (list) list.push(node);
    }
    return laneOrder
      .map((lane) => ({
        lane,
        label: LANE_LABELS[lane],
        color: LANE_COLORS[lane],
        nodes: grouped.get(lane) || [],
      }))
      .filter((g) => g.nodes.length > 0);
  }, [orgChart]);

  // Build a lookup for depth computation
  const nodesMap = useMemo(() => {
    const map = new Map<string, OrgChartNode>();
    for (const node of orgChart) {
      map.set(node.personId, node);
    }
    return map;
  }, [orgChart]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {lanes.map((group) => (
        <View key={group.lane} style={s.laneSection}>
          {/* Lane Header */}
          <View style={s.laneHeader}>
            <View style={[s.laneColorBar, { backgroundColor: group.color }]} />
            <ThemedText style={[s.laneName, { color: colors.text }]}>{group.label}</ThemedText>
            <View style={[s.badge, { backgroundColor: group.color + '20' }]}>
              <ThemedText style={[s.laneCount, { color: group.color }]}>{group.nodes.length}</ThemedText>
            </View>
          </View>

          {/* Lane Nodes */}
          {group.nodes.map((node) => {
            const depth = getHierarchyDepth(node.personId, nodesMap);
            const indent = Math.min(depth, 3) * 16;
            return (
              <View
                key={node.personId}
                style={[
                  s.orgNode,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                    borderLeftColor: group.color,
                    borderLeftWidth: 3,
                    marginLeft: indent,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <ThemedText style={[s.orgNodeName, { color: colors.text }]} numberOfLines={1}>
                    {node.name}
                  </ThemedText>
                  <ThemedText style={[s.orgNodeRole, { color: colors.textSecondary }]} numberOfLines={1}>
                    {node.role}
                  </ThemedText>
                  {node.seats.length > 0 && (
                    <ThemedText style={[s.orgNodeSeats, { color: colors.textTertiary }]} numberOfLines={1}>
                      Seats: {node.seats.join(', ')}
                    </ThemedText>
                  )}
                </View>
                {node.safeguardIcons.length > 0 && (
                  <View style={s.safeguardIconRow}>
                    {node.safeguardIcons.map((icon, idx) => (
                      <IconSymbol
                        key={`sg-${idx}`}
                        name={icon as any}
                        size={14}
                        color={accentColor}
                      />
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ))}

      {orgChart.length === 0 && (
        <EmptyState icon="person.line.dotted.person.fill" label="No org chart data" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ROLES TAB (Roles & Coverage)
// =============================================================================

function RolesTab({
  colors,
  accentColor,
  seatCoverage,
  tiles,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  seatCoverage: SeatCoverageRow[];
  tiles: {
    totalPeople: number;
    criticalSeatsFilled: string;
    vacantLeadership: number;
    youthCareAccess: number;
  };
}) {
  const coverageColor = (pct: number) => {
    if (pct < 70) return '#EF4444';
    if (pct < 90) return '#F59E0B';
    return '#22C55E';
  };

  const renderCoverageRow = useCallback(
    ({ item }: { item: SeatCoverageRow }) => {
      const pctColor = coverageColor(item.coverage);
      return (
        <View style={[s.coverageRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.coverageArea, { color: colors.text }]}>{item.area}</ThemedText>
          <ProgressBar percent={item.coverage} color={pctColor} />
          <View style={s.coverageStats}>
            <ThemedText style={[s.coverageStatText, { color: colors.textSecondary }]}>
              {item.criticalSeats} critical
            </ThemedText>
            <ThemedText style={[s.coverageStatText, { color: '#22C55E' }]}>
              {item.filled} filled
            </ThemedText>
            <ThemedText style={[s.coverageStatText, { color: item.vacant > 0 ? '#EF4444' : colors.textTertiary }]}>
              {item.vacant} vacant
            </ThemedText>
          </View>
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={seatCoverage}
      keyExtractor={(item) => item.area}
      renderItem={renderCoverageRow}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* KPI Grid */}
          <View style={s.kpiGrid}>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: accentColor }]}>{tiles.criticalSeatsFilled}</ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Critical Seats Filled</ThemedText>
            </View>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: '#EF4444' }]}>{tiles.vacantLeadership}</ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Vacant Leadership</ThemedText>
            </View>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: '#22C55E' }]}>{tiles.youthCareAccess}</ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Youth/Care Coverage</ThemedText>
            </View>
            <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.kpiValue, { color: accentColor }]}>{tiles.totalPeople}</ThemedText>
              <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total People</ThemedText>
            </View>
          </View>

          {/* Section Title */}
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
            Seat Coverage by Area
          </ThemedText>
        </>
      }
      ListEmptyComponent={
        <EmptyState icon="person.crop.rectangle.stack.fill" label="No coverage data" colors={colors} />
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
  auditLog,
  onSelectPackage,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  packages: PermissionPackageInfo[];
  auditLog: AuditLogEntry[];
  onSelectPackage: (pkg: PermissionPackageInfo) => void;
}) {
  const renderPackage = useCallback(
    ({ item }: { item: PermissionPackageInfo }) => (
      <Pressable
        style={[s.packageCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectPackage(item);
        }}
      >
        {/* Header: Icon + Label + Count */}
        <View style={s.packageHeader}>
          <View style={[s.packageIcon, { backgroundColor: accentColor + '18' }]}>
            <IconSymbol name={item.icon as any} size={18} color={accentColor} />
          </View>
          <ThemedText style={[s.packageLabel, { color: colors.text }]}>{item.label}</ThemedText>
          <View style={[s.packageCount, { backgroundColor: accentColor + '20' }]}>
            <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.memberCount}</ThemedText>
          </View>
        </View>

        {/* Description */}
        <ThemedText style={[s.packageDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </ThemedText>

        {/* Capabilities (first 3) */}
        {item.capabilities.slice(0, 3).map((cap, idx) => (
          <View key={`cap-${idx}`} style={s.capabilityItem}>
            <View style={[s.capabilityDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[s.capabilityText, { color: colors.textSecondary }]} numberOfLines={1}>
              {cap}
            </ThemedText>
          </View>
        ))}
        {item.capabilities.length > 3 && (
          <ThemedText style={[s.capabilityText, { color: colors.textTertiary, marginLeft: 14, marginTop: 2 }]}>
            +{item.capabilities.length - 3} more...
          </ThemedText>
        )}

        {/* Sensitive Fields (first 2) */}
        {item.sensitiveFields.length > 0 && (
          <View style={{ marginTop: Spacing.sm }}>
            {item.sensitiveFields.slice(0, 2).map((field, idx) => (
              <View key={`sf-${idx}`} style={s.sensitiveItem}>
                <IconSymbol name="exclamationmark.shield.fill" size={10} color="#EF4444" />
                <ThemedText style={[s.sensitiveText, { color: '#EF4444' }]} numberOfLines={1}>
                  {field}
                </ThemedText>
              </View>
            ))}
            {item.sensitiveFields.length > 2 && (
              <ThemedText style={[s.sensitiveText, { color: '#EF444480', marginLeft: 14, marginTop: 2 }]}>
                +{item.sensitiveFields.length - 2} more sensitive fields
              </ThemedText>
            )}
          </View>
        )}
      </Pressable>
    ),
    [colors, accentColor, onSelectPackage],
  );

  return (
    <FlatList
      data={packages}
      keyExtractor={(item) => item.id}
      renderItem={renderPackage}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListFooterComponent={
        auditLog.length > 0 ? (
          <View style={s.auditSection}>
            <ThemedText style={[s.auditTitle, { color: colors.text }]}>Recent Audit Log</ThemedText>
            {auditLog.slice(0, 6).map((entry) => (
              <View
                key={entry.id}
                style={[s.auditEntry, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <ThemedText style={[s.auditTimestamp, { color: colors.textTertiary }]}>
                  {formatTimestamp(entry.timestamp)}
                </ThemedText>
                <ThemedText style={[s.auditAction, { color: colors.text }]}>
                  {entry.actor} — {entry.action}
                </ThemedText>
                <ThemedText style={[s.auditDetail, { color: colors.textSecondary }]} numberOfLines={2}>
                  {entry.target}: {entry.detail}
                </ThemedText>
              </View>
            ))}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <EmptyState icon="lock.shield.fill" label="No permission packages" colors={colors} />
      }
    />
  );
}

// =============================================================================
// SAFEGUARDS TAB
// =============================================================================

function SafeguardsTab({
  colors,
  accentColor,
  safeguards,
  people,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  safeguards: SafeguardEntry[];
  people: ChurchPerson[];
}) {
  // Summary tiles
  const youthCount = useMemo(() => safeguards.filter((s) => s.youthAccess).length, [safeguards]);
  const careCount = useMemo(() => safeguards.filter((s) => s.careAccess).length, [safeguards]);
  const financeCount = useMemo(() => safeguards.filter((s) => s.financeAccess).length, [safeguards]);
  const missingAck = useMemo(
    () => safeguards.filter((s) => !s.safeguardAcknowledged || s.backgroundCheck === 'expired' || s.backgroundCheck === 'pending').length,
    [safeguards],
  );

  const renderSafeguardRow = useCallback(
    ({ item }: { item: SafeguardEntry }) => {
      const bgColor = BG_CHECK_COLORS[item.backgroundCheck];
      const bgLabel = BG_CHECK_LABELS[item.backgroundCheck];
      const hasMissing =
        !item.safeguardAcknowledged ||
        item.backgroundCheck === 'expired' ||
        item.backgroundCheck === 'pending';

      return (
        <View
          style={[
            s.safeguardRow,
            {
              backgroundColor: colors.card,
              borderColor: hasMissing ? '#EF444440' : colors.border,
            },
          ]}
        >
          <View style={s.safeguardPerson}>
            <ThemedText style={[s.safeguardName, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <ThemedText style={[s.safeguardRole, { color: colors.textSecondary }]} numberOfLines={1}>
              {item.role}
            </ThemedText>
          </View>

          {/* Access Icons */}
          <View style={s.safeguardIcons}>
            {/* Youth */}
            <IconSymbol
              name={'figure.and.child.holdinghands' as any}
              size={14}
              color={item.youthAccess ? '#22C55E' : colors.textTertiary}
              style={item.youthAccess ? s.safeguardIconActive : s.safeguardIconInactive}
            />
            {/* Care */}
            <IconSymbol
              name={'heart.fill' as any}
              size={14}
              color={item.careAccess ? '#22C55E' : colors.textTertiary}
              style={item.careAccess ? s.safeguardIconActive : s.safeguardIconInactive}
            />
            {/* Finance */}
            <IconSymbol
              name={'dollarsign.circle.fill' as any}
              size={14}
              color={item.financeAccess ? '#22C55E' : colors.textTertiary}
              style={item.financeAccess ? s.safeguardIconActive : s.safeguardIconInactive}
            />
          </View>

          {/* BG Check Badge */}
          <StatusBadge label={bgLabel.toUpperCase()} color={bgColor} />

          {/* Safeguard Acknowledged */}
          {item.safeguardAcknowledged ? (
            <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
          ) : (
            <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#EF4444" />
          )}
        </View>
      );
    },
    [colors],
  );

  return (
    <FlatList
      data={safeguards}
      keyExtractor={(item) => item.personId}
      renderItem={renderSafeguardRow}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <>
          {/* Summary Tiles */}
          <View style={s.safeguardTilesRow}>
            <View style={[s.safeguardTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.safeguardTileValue, { color: ACCENT }]}>{youthCount}</ThemedText>
              <ThemedText style={[s.safeguardTileLabel, { color: colors.textSecondary }]}>Youth Access</ThemedText>
            </View>
            <View style={[s.safeguardTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.safeguardTileValue, { color: ACCENT }]}>{careCount}</ThemedText>
              <ThemedText style={[s.safeguardTileLabel, { color: colors.textSecondary }]}>Care Access</ThemedText>
            </View>
            <View style={[s.safeguardTile, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <ThemedText style={[s.safeguardTileValue, { color: '#22C55E' }]}>{financeCount}</ThemedText>
              <ThemedText style={[s.safeguardTileLabel, { color: colors.textSecondary }]}>Finance Access</ThemedText>
            </View>
            <View style={[s.safeguardTile, { backgroundColor: colors.card, borderColor: missingAck > 0 ? '#EF444440' : colors.border }]}>
              <ThemedText style={[s.safeguardTileValue, { color: '#EF4444' }]}>{missingAck}</ThemedText>
              <ThemedText style={[s.safeguardTileLabel, { color: colors.textSecondary }]}>Missing Items</ThemedText>
            </View>
          </View>

          {/* Section Title */}
          <ThemedText style={[s.sectionTitle, { color: colors.text, marginBottom: Spacing.sm }]}>
            Personnel Safeguard Status
          </ThemedText>
        </>
      }
      ListEmptyComponent={
        <EmptyState icon="shield.checkmark.fill" label="No safeguard data" colors={colors} />
      }
    />
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
  person: ChurchPerson | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!person) return null;

  const laneColor = LANE_COLORS[person.lane];
  const bgCheckColor = BG_CHECK_COLORS[person.backgroundCheck];
  const bgCheckLabel = BG_CHECK_LABELS[person.backgroundCheck];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={person.name} useModal>
      {/* Role + Lane Badge */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={person.role.toUpperCase()} color={accentColor} />
        <StatusBadge label={LANE_LABELS[person.lane].toUpperCase()} color={laneColor} />
      </View>

      {/* Authority */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Authority</ThemedText>
        <View style={s.sheetBadgeRow}>
          {person.authority.map((auth) => (
            <StatusBadge key={auth} label={AUTHORITY_LABELS[auth].toUpperCase()} color={AUTHORITY_COLORS[auth]} />
          ))}
        </View>
        {person.authority.length === 0 && (
          <ThemedText style={[s.emptyText, { color: colors.textTertiary, fontSize: 12 }]}>No authority assigned</ThemedText>
        )}
      </View>

      {/* Ministries Owned */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Ministries Owned</ThemedText>
        {person.ministriesOwned.length > 0 ? (
          person.ministriesOwned.map((ministry, idx) => (
            <View key={`min-${idx}`} style={s.sheetDetailRow}>
              <IconSymbol name="heart.fill" size={12} color={accentColor} />
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{ministry}</ThemedText>
            </View>
          ))
        ) : (
          <ThemedText style={[s.emptyText, { color: colors.textTertiary, fontSize: 12 }]}>None</ThemedText>
        )}
      </View>

      {/* Access & Safeguards */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Access & Safeguards</ThemedText>

        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Youth Access</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: person.youthAccess ? '#22C55E' : colors.textTertiary }]}>
            {person.youthAccess ? 'Yes' : 'No'}
          </ThemedText>
        </View>

        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Care Access</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: person.careAccess ? '#22C55E' : colors.textTertiary }]}>
            {person.careAccess ? 'Yes' : 'No'}
          </ThemedText>
        </View>

        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Finance Access</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: person.financeAccess ? '#22C55E' : colors.textTertiary }]}>
            {person.financeAccess ? 'Yes' : 'No'}
          </ThemedText>
        </View>

        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Background Check</ThemedText>
          <StatusBadge label={bgCheckLabel.toUpperCase()} color={bgCheckColor} />
        </View>

        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Safeguard Acknowledged</ThemedText>
          {person.safeguardAcknowledged ? (
            <IconSymbol name="checkmark.circle.fill" size={16} color="#22C55E" />
          ) : (
            <IconSymbol name="xmark.circle.fill" size={16} color="#EF4444" />
          )}
        </View>
      </View>

      {/* Risk Flags */}
      {person.riskFlags.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: '#EF4444' }]}>Risk Flags</ThemedText>
          {person.riskFlags.map((flag, idx) => (
            <View key={`rf-${idx}`} style={s.sheetDetailRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={12} color="#EF4444" />
              <ThemedText style={[s.sheetDetailValue, { color: '#EF4444' }]}>{flag}</ThemedText>
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
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Phone</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.phone}</ThemedText>
        </View>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Join Date</ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.joinDate}</ThemedText>
        </View>
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
// PERMISSION DETAIL BOTTOM SHEET
// =============================================================================

function PermissionDetailSheet({
  visible,
  onClose,
  pkg,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  pkg: PermissionPackageInfo | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!pkg) return null;

  return (
    <BottomSheet visible={visible} onClose={onClose} title={pkg.label} useModal>
      {/* Description */}
      <ThemedText style={[s.packageDesc, { color: colors.textSecondary, marginBottom: Spacing.md }]}>
        {pkg.description}
      </ThemedText>

      {/* Capabilities */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Capabilities</ThemedText>
        {pkg.capabilities.map((cap, idx) => (
          <View key={`cap-${idx}`} style={s.capabilityItem}>
            <View style={[s.capabilityDot, { backgroundColor: '#22C55E' }]} />
            <ThemedText style={[s.capabilityText, { color: colors.textSecondary }]}>{cap}</ThemedText>
          </View>
        ))}
      </View>

      {/* Sensitive Fields */}
      {pkg.sensitiveFields.length > 0 && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <ThemedText style={[s.sheetSectionTitle, { color: '#EF4444' }]}>Sensitive Fields</ThemedText>
          {pkg.sensitiveFields.map((field, idx) => (
            <View key={`sf-${idx}`} style={s.sensitiveItem}>
              <IconSymbol name="exclamationmark.shield.fill" size={12} color="#EF4444" />
              <ThemedText style={[s.sensitiveText, { color: '#EF4444' }]}>{field}</ThemedText>
            </View>
          ))}
        </View>
      )}

      {/* Member Count */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Members</ThemedText>
        <View style={s.sheetDetailRow}>
          <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>
            People with this package
          </ThemedText>
          <ThemedText style={[s.sheetDetailValue, { color: accentColor }]}>{pkg.memberCount}</ThemedText>
        </View>
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
// MAIN EXPORT
// =============================================================================

export function ChurchOrgPeople({ colors, accentColor, role = 'C1' }: Props) {
  // === RBAC Gate: C4/C5 locked ===
  if (!isStaffLevel(role)) {
    return <LockedState colors={colors} />;
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('directory');
  const [selectedPerson, setSelectedPerson] = useState<ChurchPerson | null>(null);
  const [personSheetVisible, setPersonSheetVisible] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PermissionPackageInfo | null>(null);
  const [packageSheetVisible, setPackageSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getChurchPeopleData(), []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (isElderLevel(role)) return SUB_TABS;
    if (isStaffLevel(role)) return SUB_TABS.filter((t) => t.id === 'directory' || t.id === 'org-chart');
    return []; // C4/C5 shouldn't see this tab at all
  }, [role]);

  // === Callbacks ===
  const handleSelectPerson = useCallback((person: ChurchPerson) => {
    setSelectedPerson(person);
    setPersonSheetVisible(true);
  }, []);

  const handleClosePersonSheet = useCallback(() => {
    setPersonSheetVisible(false);
  }, []);

  const handleSelectPackage = useCallback((pkg: PermissionPackageInfo) => {
    setSelectedPackage(pkg);
    setPackageSheetVisible(true);
  }, []);

  const handleClosePackageSheet = useCallback(() => {
    setPackageSheetVisible(false);
  }, []);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'directory':
        return (
          <DirectoryTab
            colors={colors}
            accentColor={accentColor}
            people={data.people}
            onSelectPerson={handleSelectPerson}
          />
        );
      case 'org-chart':
        return (
          <OrgChartTab
            colors={colors}
            accentColor={accentColor}
            orgChart={data.orgChart}
          />
        );
      case 'roles':
        if (!isElderLevel(role)) return null;
        return (
          <RolesTab
            colors={colors}
            accentColor={accentColor}
            seatCoverage={data.seatCoverage}
            tiles={data.tiles}
          />
        );
      case 'permissions':
        if (!isElderLevel(role)) return null;
        return (
          <PermissionsTab
            colors={colors}
            accentColor={accentColor}
            packages={data.permissionPackages}
            auditLog={data.auditLog}
            onSelectPackage={handleSelectPackage}
          />
        );
      case 'safeguards':
        if (!isElderLevel(role)) return null;
        return (
          <SafeguardsTab
            colors={colors}
            accentColor={accentColor}
            safeguards={data.safeguards}
            people={data.people}
          />
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

      {/* Permission Detail Bottom Sheet */}
      <PermissionDetailSheet
        visible={packageSheetVisible}
        onClose={handleClosePackageSheet}
        pkg={selectedPackage}
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
  flex1: {
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
  personLaneBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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

  // -- Lane Section (Org Chart) --
  laneSection: {
    marginBottom: Spacing.lg,
  },
  laneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  laneColorBar: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  laneName: {
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  laneCount: {
    fontSize: 11,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },

  // -- Org Node --
  orgNode: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  orgNodeIndented: {
    marginLeft: 16,
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
  safeguardIconRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  // -- KPI Grid (Roles) --
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

  // -- Coverage Row (Roles) --
  coverageRow: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  coverageArea: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  coverageStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  coverageStatText: {
    fontSize: 11,
    fontWeight: '500',
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
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
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
    flex: 1,
  },
  packageCount: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  packageDesc: {
    fontSize: 12,
    lineHeight: 17,
  },

  // -- Capability Item --
  capabilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  capabilityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  capabilityText: {
    fontSize: 12,
    flex: 1,
  },

  // -- Sensitive Item --
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

  // -- Audit Section --
  auditSection: {
    marginTop: Spacing.lg,
  },
  auditTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  auditEntry: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  auditTimestamp: {
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
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

  // -- Safeguard Tiles Row --
  safeguardTilesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  safeguardTile: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  safeguardTileValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  safeguardTileLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
  },

  // -- Safeguard Row --
  safeguardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  safeguardPerson: {
    flex: 1,
  },
  safeguardName: {
    fontSize: 13,
    fontWeight: '600',
  },
  safeguardRole: {
    fontSize: 11,
    marginTop: 1,
  },
  safeguardIcons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  safeguardIconActive: {
    opacity: 1,
  },
  safeguardIconInactive: {
    opacity: 0.3,
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
