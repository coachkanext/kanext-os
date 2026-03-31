/**
 * Education Organization Rooms v2 — 3-view sub-tab hub.
 * Sub-tabs: Directory | Domain Map | Governance Rooms
 * RBAC: E0–E5 full, E6/E7 Directory+Domain Map, E8–E11 Directory only (filtered), E12/E13 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import type { EducationRoleLens } from '@/utils/education-rbac';
import { isDeanLevel, isFacultyLevel, isStudent, isEnrolled } from '@/utils/education-rbac';
import {
  getEduRoomsV2Data,
  ROOM_TYPE_LABELS,
  ROOM_TYPE_COLORS,
  ROOM_DOMAIN_LABELS,
  ROOM_DOMAIN_COLORS,
  ROOM_DOMAIN_ICONS,
  ROOM_STATUS_LABELS,
  ROOM_STATUS_COLORS,
  ROOM_ACCESS_LABELS,
  ROOM_ACCESS_COLORS,
  ROOM_SCOPE_LABELS,
  ROOM_SCOPE_COLORS,
  INCIDENT_SEVERITY_COLORS,
  INCIDENT_SEVERITY_LABELS,
} from '@/data/mock-edu-org-rooms-v2';
import type { EduOrgRoom, RoomDomain } from '@/data/mock-edu-org-rooms-v2';

// =============================================================================
// CONSTANTS
// =============================================================================

const SUB_TABS = [
  { id: 'directory', label: 'Directory' },
  { id: 'domain-map', label: 'Domain Map' },
  { id: 'governance', label: 'Governance Rooms' },
];

const DOMAIN_ORDER: RoomDomain[] = ['admissions', 'academics', 'campus', 'athletics', 'financial', 'policies'];

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

function formatDate(dateStr: string): string {
  if (!dateStr) return '--';
  const parts = dateStr.split('-');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[parseInt(parts[1], 10) - 1] || parts[1];
  const day = parseInt(parts[2], 10);
  return `${month} ${day}`;
}

/** Triage sort: incidents → urgent approvals → deadlines → governance → recency */
function triageSortRooms(rooms: EduOrgRoom[]): EduOrgRoom[] {
  return [...rooms].sort((a, b) => {
    // 1. Incidents first (by severity)
    const severityRank: Record<string, number> = { critical: 0, high: 1, medium: 2 };
    const aIsIncident = a.type === 'incident' ? 1 : 0;
    const bIsIncident = b.type === 'incident' ? 1 : 0;
    if (aIsIncident !== bIsIncident) return bIsIncident - aIsIncident;
    if (aIsIncident && bIsIncident) {
      const aRank = severityRank[a.incident?.severity ?? 'medium'] ?? 3;
      const bRank = severityRank[b.incident?.severity ?? 'medium'] ?? 3;
      if (aRank !== bRank) return aRank - bRank;
    }

    // 2. Rooms with urgent items
    if (a.urgentItems !== b.urgentItems) return b.urgentItems - a.urgentItems;

    // 3. Rooms with pending items (deadlines proxy)
    if (a.pendingItems !== b.pendingItems) return b.pendingItems - a.pendingItems;

    // 4. Governance rooms bubble up
    const govTypes = ['governance', 'committee'];
    const aIsGov = govTypes.includes(a.type) ? 1 : 0;
    const bIsGov = govTypes.includes(b.type) ? 1 : 0;
    if (aIsGov !== bIsGov) return bIsGov - aIsGov;

    // 5. By activity recency
    return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
  });
}

// =============================================================================
// LOCAL PRIMITIVES
// =============================================================================

function EmptyState({ icon, label, colors }: { icon: string; label: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyContainer}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{label}</ThemedText>
    </View>
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

function ScopeStrip({
  room,
  colors,
}: {
  room: EduOrgRoom;
  colors: typeof Colors.light;
}) {
  return (
    <View style={s.scopeStrip}>
      <StatusBadge label={ROOM_SCOPE_LABELS[room.scope].toUpperCase()} color={ROOM_SCOPE_COLORS[room.scope]} />
      <StatusBadge label={ROOM_DOMAIN_LABELS[room.domain].toUpperCase()} color={ROOM_DOMAIN_COLORS[room.domain]} />
      <StatusBadge label={ROOM_TYPE_LABELS[room.type].toUpperCase()} color={ROOM_TYPE_COLORS[room.type]} />
      <StatusBadge label={ROOM_ACCESS_LABELS[room.access].toUpperCase()} color={ROOM_ACCESS_COLORS[room.access]} />
    </View>
  );
}

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
// DIRECTORY SUB-TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  rooms,
  role,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  rooms: EduOrgRoom[];
  role: EducationRoleLens;
  onSelect: (room: EduOrgRoom) => void;
}) {
  const filteredRooms = useMemo(() => {
    let list = rooms;
    // Student (E11): filter out incident, governance, committee types and confidential access
    if (isStudent(role)) {
      list = list.filter(
        (r) => r.type !== 'incident' && r.type !== 'governance' && r.type !== 'committee' && r.access !== 'confidential',
      );
    }
    return triageSortRooms(list);
  }, [rooms, role]);

  const renderItem = useCallback(
    ({ item }: { item: EduOrgRoom }) => {
      const typeColor = ROOM_TYPE_COLORS[item.type];
      const statusColor = ROOM_STATUS_COLORS[item.status];
      const hasUrgent = item.urgentItems > 0;
      const isIncident = item.type === 'incident';

      return (
        <Pressable
          style={[
            s.roomCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            isIncident && { borderLeftWidth: 3, borderLeftColor: INCIDENT_SEVERITY_COLORS[item.incident?.severity ?? 'medium'] },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelect(item);
          }}
        >
          {/* Header */}
          <View style={s.roomCardTop}>
            <View style={[s.roomTypeDot, { backgroundColor: typeColor }]} />
            <View style={s.roomCardTextCol}>
              <ThemedText style={[s.roomName, { color: colors.text }]} numberOfLines={1}>{item.name}</ThemedText>
              {item.institution && (
                <ThemedText style={[s.roomInstitution, { color: colors.textTertiary }]}>{item.institution}</ThemedText>
              )}
            </View>
            <StatusBadge label={ROOM_STATUS_LABELS[item.status].toUpperCase()} color={statusColor} />
          </View>

          {/* Badge strip */}
          <ScopeStrip room={item} colors={colors} />

          {/* Incident severity */}
          {isIncident && item.incident && (
            <View style={s.incidentRow}>
              <IconSymbol name="exclamationmark.triangle.fill" size={14} color={INCIDENT_SEVERITY_COLORS[item.incident.severity]} />
              <ThemedText style={[s.incidentText, { color: INCIDENT_SEVERITY_COLORS[item.incident.severity] }]}>
                {INCIDENT_SEVERITY_LABELS[item.incident.severity]} Severity
              </ThemedText>
            </View>
          )}

          {/* Activity / meta */}
          <View style={[s.roomMeta, { borderTopColor: colors.border }]}>
            <View style={s.roomMetaLeft}>
              <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
              <ThemedText style={[s.roomMetaText, { color: colors.textSecondary }]}>{item.memberCount}</ThemedText>
              <ThemedText style={[s.roomMetaText, { color: colors.textTertiary }]}>·</ThemedText>
              <ThemedText style={[s.roomMetaText, { color: colors.textSecondary }]}>{item.owner}</ThemedText>
            </View>
            <View style={s.roomMetaRight}>
              {item.pendingItems > 0 && (
                <View style={[s.pendingPill, { backgroundColor: hasUrgent ? '#B85C5C20' : accentColor + '20' }]}>
                  <ThemedText style={[s.pendingPillText, { color: hasUrgent ? '#B85C5C' : accentColor }]}>
                    {item.pendingItems} pending{hasUrgent ? ` (${item.urgentItems} urgent)` : ''}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelect],
  );

  return (
    <FlatList
      data={filteredRooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={<EmptyState icon="door.left.hand.open" label="No rooms available" colors={colors} />}
    />
  );
}

// =============================================================================
// DOMAIN MAP SUB-TAB
// =============================================================================

function DomainMapTab({
  colors,
  accentColor,
  rooms,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  rooms: EduOrgRoom[];
}) {
  const domainGroups = useMemo(() => {
    const groups: Record<RoomDomain, EduOrgRoom[]> = {
      admissions: [],
      academics: [],
      campus: [],
      athletics: [],
      financial: [],
      policies: [],
    };
    for (const room of rooms) {
      groups[room.domain].push(room);
    }
    return groups;
  }, [rooms]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Domain Coverage</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Rooms organized by operational domain
      </ThemedText>

      {DOMAIN_ORDER.map((domain) => {
        const domainRooms = domainGroups[domain];
        const domainColor = ROOM_DOMAIN_COLORS[domain];
        const domainIcon = ROOM_DOMAIN_ICONS[domain];
        const domainLabel = ROOM_DOMAIN_LABELS[domain];
        const activeCount = domainRooms.filter((r) => r.status === 'active').length;
        const coveragePct = rooms.length > 0 ? Math.round((domainRooms.length / rooms.length) * 100) : 0;

        return (
          <View key={domain} style={[s.domainCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* Domain header */}
            <View style={s.domainHeader}>
              <View style={s.domainHeaderLeft}>
                <IconSymbol name={domainIcon as any} size={18} color={domainColor} />
                <View style={s.domainHeaderText}>
                  <ThemedText style={[s.domainName, { color: colors.text }]}>{domainLabel}</ThemedText>
                  <ThemedText style={[s.domainCount, { color: colors.textSecondary }]}>
                    {domainRooms.length} room{domainRooms.length !== 1 ? 's' : ''} · {activeCount} active
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.domainCoverage, { color: domainColor }]}>{coveragePct}%</ThemedText>
            </View>

            {/* Coverage bar */}
            <ProgressBar percent={coveragePct} color={domainColor} />

            {/* Room list */}
            {domainRooms.length > 0 ? (
              <View style={s.domainRoomList}>
                {domainRooms.map((room) => (
                  <View key={room.id} style={[s.domainRoomRow, { borderBottomColor: colors.border }]}>
                    <View style={[s.domainRoomDot, { backgroundColor: ROOM_TYPE_COLORS[room.type] }]} />
                    <View style={s.domainRoomTextCol}>
                      <ThemedText style={[s.domainRoomName, { color: colors.text }]} numberOfLines={1}>
                        {room.name}
                      </ThemedText>
                      <ThemedText style={[s.domainRoomMeta, { color: colors.textTertiary }]}>
                        {ROOM_TYPE_LABELS[room.type]}{room.institution ? ` · ${room.institution}` : ' · Org'}
                      </ThemedText>
                    </View>
                    {room.pendingItems > 0 && (
                      <ThemedText style={[s.domainRoomPending, { color: room.urgentItems > 0 ? '#B85C5C' : colors.textSecondary }]}>
                        {room.pendingItems}
                      </ThemedText>
                    )}
                  </View>
                ))}
              </View>
            ) : (
              <ThemedText style={[s.domainEmptyText, { color: colors.textTertiary }]}>No rooms in this domain</ThemedText>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// =============================================================================
// GOVERNANCE ROOMS SUB-TAB
// =============================================================================

function GovernanceTab({
  colors,
  accentColor,
  rooms,
  onSelect,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  rooms: EduOrgRoom[];
  onSelect: (room: EduOrgRoom) => void;
}) {
  const governanceRooms = useMemo(() => {
    const filtered = rooms.filter((r) => r.type === 'governance' || r.type === 'committee');
    // Sort by next meeting date (soonest first)
    return [...filtered].sort((a, b) => {
      const aDate = a.governance?.nextMeeting ?? '9999-12-31';
      const bDate = b.governance?.nextMeeting ?? '9999-12-31';
      return aDate.localeCompare(bDate);
    });
  }, [rooms]);

  // KPI aggregation
  const totals = useMemo(() => {
    let decisions = 0;
    let approvals = 0;
    let documents = 0;
    for (const r of governanceRooms) {
      if (r.governance) {
        decisions += r.governance.pendingDecisions;
        approvals += r.governance.pendingApprovals;
        documents += r.governance.documentsCount;
      }
    }
    return { decisions, approvals, documents, count: governanceRooms.length };
  }, [governanceRooms]);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* KPI Row */}
      <View style={s.kpiRow}>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: colors.text }]}>{totals.count}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Rooms</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: totals.decisions > 0 ? '#B8943E' : colors.text }]}>{totals.decisions}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Decisions</ThemedText>
        </View>
        <View style={[s.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <ThemedText style={[s.kpiValue, { color: totals.approvals > 0 ? '#B85C5C' : colors.text }]}>{totals.approvals}</ThemedText>
          <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Approvals</ThemedText>
        </View>
      </View>

      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>Governance & Committee Rooms</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        Sorted by next meeting date
      </ThemedText>

      {governanceRooms.map((room) => {
        const typeColor = ROOM_TYPE_COLORS[room.type];
        const gov = room.governance;

        return (
          <Pressable
            key={room.id}
            style={[s.govCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSelect(room);
            }}
          >
            {/* Header */}
            <View style={s.govCardTop}>
              <View style={[s.govTypeDot, { backgroundColor: typeColor }]} />
              <View style={s.govCardTextCol}>
                <ThemedText style={[s.govName, { color: colors.text }]} numberOfLines={1}>{room.name}</ThemedText>
                <ThemedText style={[s.govOwner, { color: colors.textTertiary }]}>
                  {room.owner}{room.institution ? ` · ${room.institution}` : ' · Org-wide'}
                </ThemedText>
              </View>
              <StatusBadge label={ROOM_TYPE_LABELS[room.type].toUpperCase()} color={typeColor} />
            </View>

            {/* Governance details */}
            {gov && (
              <View style={s.govDetailsGrid}>
                <View style={[s.govDetailItem, { backgroundColor: colors.background }]}>
                  <IconSymbol name="calendar" size={14} color={accentColor} />
                  <View>
                    <ThemedText style={[s.govDetailValue, { color: colors.text }]}>{formatDate(gov.nextMeeting)}</ThemedText>
                    <ThemedText style={[s.govDetailLabel, { color: colors.textSecondary }]}>Next Meeting</ThemedText>
                  </View>
                </View>
                <View style={[s.govDetailItem, { backgroundColor: colors.background }]}>
                  <IconSymbol name="questionmark.circle.fill" size={14} color="#B8943E" />
                  <View>
                    <ThemedText style={[s.govDetailValue, { color: colors.text }]}>{gov.pendingDecisions}</ThemedText>
                    <ThemedText style={[s.govDetailLabel, { color: colors.textSecondary }]}>Decisions</ThemedText>
                  </View>
                </View>
                <View style={[s.govDetailItem, { backgroundColor: colors.background }]}>
                  <IconSymbol name="checkmark.circle.fill" size={14} color="#B85C5C" />
                  <View>
                    <ThemedText style={[s.govDetailValue, { color: colors.text }]}>{gov.pendingApprovals}</ThemedText>
                    <ThemedText style={[s.govDetailLabel, { color: colors.textSecondary }]}>Approvals</ThemedText>
                  </View>
                </View>
                <View style={[s.govDetailItem, { backgroundColor: colors.background }]}>
                  <IconSymbol name="doc.fill" size={14} color={accentColor} />
                  <View>
                    <ThemedText style={[s.govDetailValue, { color: colors.text }]}>{gov.documentsCount}</ThemedText>
                    <ThemedText style={[s.govDetailLabel, { color: colors.textSecondary }]}>Documents</ThemedText>
                  </View>
                </View>
              </View>
            )}

            {/* Member + scope badges */}
            <View style={[s.govMeta, { borderTopColor: colors.border }]}>
              <View style={s.govMetaLeft}>
                <IconSymbol name="person.2.fill" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.govMetaText, { color: colors.textSecondary }]}>{room.memberCount} members</ThemedText>
              </View>
              <View style={s.govMetaBadges}>
                <StatusBadge label={ROOM_SCOPE_LABELS[room.scope].toUpperCase()} color={ROOM_SCOPE_COLORS[room.scope]} />
                <StatusBadge label={ROOM_ACCESS_LABELS[room.access].toUpperCase()} color={ROOM_ACCESS_COLORS[room.access]} />
              </View>
            </View>
          </Pressable>
        );
      })}

      {governanceRooms.length === 0 && (
        <EmptyState icon="building.columns.fill" label="No governance rooms" colors={colors} />
      )}
    </ScrollView>
  );
}

// =============================================================================
// ROOM DETAIL BOTTOM SHEET
// =============================================================================

function RoomDetailSheet({
  visible,
  onClose,
  room,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  room: EduOrgRoom | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!room) return null;

  const typeColor = ROOM_TYPE_COLORS[room.type];
  const statusColor = ROOM_STATUS_COLORS[room.status];
  const isIncident = room.type === 'incident';
  const isGov = room.type === 'governance' || room.type === 'committee';

  return (
    <BottomSheet visible={visible} onClose={onClose} title={room.name} useModal>
      {/* === Overview Section === */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Overview</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>{room.description}</ThemedText>

        <View style={s.sheetBadgeRow}>
          <StatusBadge label={ROOM_TYPE_LABELS[room.type].toUpperCase()} color={typeColor} />
          <StatusBadge label={ROOM_STATUS_LABELS[room.status].toUpperCase()} color={statusColor} />
          <StatusBadge label={ROOM_SCOPE_LABELS[room.scope].toUpperCase()} color={ROOM_SCOPE_COLORS[room.scope]} />
          <StatusBadge label={ROOM_DOMAIN_LABELS[room.domain].toUpperCase()} color={ROOM_DOMAIN_COLORS[room.domain]} />
          <StatusBadge label={ROOM_ACCESS_LABELS[room.access].toUpperCase()} color={ROOM_ACCESS_COLORS[room.access]} />
        </View>

        {isIncident && room.incident && (
          <View style={s.sheetIncidentRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={INCIDENT_SEVERITY_COLORS[room.incident.severity]} />
            <ThemedText style={[s.sheetIncidentText, { color: INCIDENT_SEVERITY_COLORS[room.incident.severity] }]}>
              {INCIDENT_SEVERITY_LABELS[room.incident.severity]} Severity Incident
            </ThemedText>
          </View>
        )}

        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.owner}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.memberCount}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Members</ThemedText>
          </View>
          {room.institution && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.institution}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Institution</ThemedText>
            </View>
          )}
          {room.department && (
            <View style={s.sheetDetailItem}>
              <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{room.department}</ThemedText>
              <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Department</ThemedText>
            </View>
          )}
        </View>
      </View>

      {/* === Work Section === */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Work</ThemedText>
        <View style={s.sheetWorkRow}>
          <View style={[s.sheetWorkItem, { backgroundColor: colors.background }]}>
            <ThemedText style={[s.sheetWorkValue, { color: room.pendingItems > 0 ? accentColor : colors.text }]}>
              {room.pendingItems}
            </ThemedText>
            <ThemedText style={[s.sheetWorkLabel, { color: colors.textSecondary }]}>Pending Items</ThemedText>
          </View>
          <View style={[s.sheetWorkItem, { backgroundColor: colors.background }]}>
            <ThemedText style={[s.sheetWorkValue, { color: room.urgentItems > 0 ? '#B85C5C' : colors.text }]}>
              {room.urgentItems}
            </ThemedText>
            <ThemedText style={[s.sheetWorkLabel, { color: colors.textSecondary }]}>Urgent Items</ThemedText>
          </View>
        </View>

        {isGov && room.governance && (
          <View style={s.sheetGovGrid}>
            <View style={s.sheetGovItem}>
              <IconSymbol name="calendar" size={14} color={accentColor} />
              <ThemedText style={[s.sheetGovText, { color: colors.text }]}>
                Next Meeting: {formatDate(room.governance.nextMeeting)}
              </ThemedText>
            </View>
            <View style={s.sheetGovItem}>
              <IconSymbol name="questionmark.circle.fill" size={14} color="#B8943E" />
              <ThemedText style={[s.sheetGovText, { color: colors.text }]}>
                {room.governance.pendingDecisions} Pending Decision{room.governance.pendingDecisions !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <View style={s.sheetGovItem}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#B85C5C" />
              <ThemedText style={[s.sheetGovText, { color: colors.text }]}>
                {room.governance.pendingApprovals} Pending Approval{room.governance.pendingApprovals !== 1 ? 's' : ''}
              </ThemedText>
            </View>
            <View style={s.sheetGovItem}>
              <IconSymbol name="doc.fill" size={14} color={accentColor} />
              <ThemedText style={[s.sheetGovText, { color: colors.text }]}>
                {room.governance.documentsCount} Document{room.governance.documentsCount !== 1 ? 's' : ''}
              </ThemedText>
            </View>
          </View>
        )}
      </View>

      {/* === Queue Section === */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Queue</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textTertiary }]}>
          Work queue items will appear here when connected to live data.
        </ThemedText>
      </View>

      {/* === Notes Section === */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Notes</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textTertiary }]}>
          Room notes and pinned messages will appear here when connected to live data.
        </ThemedText>
      </View>

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

export function EduOrgRoomsV2({ colors, accentColor, role = 'E1' }: Props) {
  // === RBAC Gate: External (E12/E13) locked ===
  if (!isEnrolled(role)) {
    return (
      <View style={s.lockContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockTitle, { color: colors.text }]}>Rooms</ThemedText>
        <ThemedText style={[s.lockText, { color: colors.textSecondary }]}>
          Room access is not available for public users
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('directory');
  const [selectedRoom, setSelectedRoom] = useState<EduOrgRoom | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

  // === Data ===
  const data = useMemo(() => getEduRoomsV2Data(), []);

  // === Callbacks ===
  const handleSelectRoom = useCallback((room: EduOrgRoom) => {
    setSelectedRoom(room);
    setSheetVisible(true);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  // E1/E2: full (Directory + Domain Map + Governance)
  // E3: Directory + Domain Map (governance locked)
  // E4: Directory only
  const visibleSubTabs = useMemo(() => {
    if (isDeanLevel(role)) return SUB_TABS;
    if (isFacultyLevel(role)) return SUB_TABS.filter((t) => t.id === 'directory' || t.id === 'domain-map');
    // E4
    return SUB_TABS.filter((t) => t.id === 'directory');
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'directory':
        return (
          <DirectoryTab
            colors={colors}
            accentColor={accentColor}
            rooms={data.rooms}
            role={role}
            onSelect={handleSelectRoom}
          />
        );
      case 'domain-map':
        if (!isFacultyLevel(role)) return null;
        return <DomainMapTab colors={colors} accentColor={accentColor} rooms={data.rooms} />;
      case 'governance':
        if (!isDeanLevel(role)) return null;
        return <GovernanceTab colors={colors} accentColor={accentColor} rooms={data.rooms} onSelect={handleSelectRoom} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      <SubTabBar
        tabs={visibleSubTabs}
        activeId={activeSubTab}
        onSelect={setActiveSubTab}
        accentColor={accentColor}
        colors={colors}
      />
      <View style={s.contentContainer}>
        {renderContent()}
      </View>
      <RoomDetailSheet
        visible={sheetVisible}
        onClose={handleCloseSheet}
        room={selectedRoom}
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
  container: { flex: 1 },
  contentContainer: { flex: 1 },

  // Locked
  lockContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
  lockTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.md },
  lockText: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm },

  // Sub-tab bar
  subTabRow: { flexDirection: 'row', paddingHorizontal: Spacing.md, gap: Spacing.md },
  subTab: { paddingHorizontal: 14, paddingVertical: 10 },
  subTabText: { fontSize: 13, fontWeight: '600' },

  // Scroll containers
  tabScroll: { padding: Spacing.md, paddingBottom: 120 },
  tabListContent: { padding: Spacing.md, paddingBottom: 120 },

  // Section titles
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.xs },
  sectionSubtitle: { fontSize: 12, marginBottom: Spacing.md },

  // Empty state
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl },
  emptyText: { fontSize: 14, marginTop: Spacing.sm, textAlign: 'center' },

  // Badge
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: BorderRadius.sm },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Progress bar
  progressTrack: { height: 4, backgroundColor: '#9C9790', borderRadius: 2, overflow: 'hidden', marginBottom: Spacing.sm },
  progressFill: { height: 4, borderRadius: 2 },

  // Scope strip
  scopeStrip: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.sm },

  // KPI
  kpiRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  kpiCard: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, borderWidth: 1 },
  kpiValue: { fontSize: 22, fontWeight: '700', fontVariant: ['tabular-nums'] },
  kpiLabel: { fontSize: 11, marginTop: 2 },

  // =========================================================================
  // DIRECTORY — Room Card
  // =========================================================================
  roomCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  roomCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  roomTypeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  roomCardTextCol: { flex: 1 },
  roomName: { fontSize: 14, fontWeight: '600' },
  roomInstitution: { fontSize: 12, marginTop: 2 },
  incidentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  incidentText: { fontSize: 12, fontWeight: '600' },
  roomMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  roomMetaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  roomMetaRight: { flexDirection: 'row', alignItems: 'center' },
  roomMetaText: { fontSize: 11 },
  pendingPill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: BorderRadius.full },
  pendingPillText: { fontSize: 10, fontWeight: '600' },

  // =========================================================================
  // DOMAIN MAP
  // =========================================================================
  domainCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  domainHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  domainHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  domainHeaderText: {},
  domainName: { fontSize: 15, fontWeight: '700' },
  domainCount: { fontSize: 11, marginTop: 2 },
  domainCoverage: { fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  domainRoomList: { marginTop: Spacing.xs },
  domainRoomRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 6, borderBottomWidth: StyleSheet.hairlineWidth },
  domainRoomDot: { width: 8, height: 8, borderRadius: 4 },
  domainRoomTextCol: { flex: 1 },
  domainRoomName: { fontSize: 13, fontWeight: '500' },
  domainRoomMeta: { fontSize: 11, marginTop: 1 },
  domainRoomPending: { fontSize: 11, fontWeight: '700', fontVariant: ['tabular-nums'] },
  domainEmptyText: { fontSize: 12, marginTop: Spacing.xs },

  // =========================================================================
  // GOVERNANCE ROOMS
  // =========================================================================
  govCard: { borderRadius: BorderRadius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  govCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  govTypeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  govCardTextCol: { flex: 1 },
  govName: { fontSize: 14, fontWeight: '600' },
  govOwner: { fontSize: 12, marginTop: 2 },
  govDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.sm },
  govDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.md },
  govDetailValue: { fontSize: 13, fontWeight: '700', fontVariant: ['tabular-nums'] },
  govDetailLabel: { fontSize: 10 },
  govMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth },
  govMetaLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  govMetaText: { fontSize: 11 },
  govMetaBadges: { flexDirection: 'row', gap: 6 },

  // =========================================================================
  // BOTTOM SHEET
  // =========================================================================
  sheetSection: { paddingBottom: Spacing.md, marginBottom: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  sheetSectionTitle: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: Spacing.sm },
  sheetBodyText: { fontSize: 13, lineHeight: 19, marginBottom: Spacing.sm },
  sheetBadgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  sheetIncidentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.sm },
  sheetIncidentText: { fontSize: 13, fontWeight: '600' },
  sheetDetailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginTop: Spacing.sm },
  sheetDetailItem: { width: '45%' },
  sheetDetailValue: { fontSize: 14, fontWeight: '600' },
  sheetDetailLabel: { fontSize: 11, marginTop: 1 },
  sheetWorkRow: { flexDirection: 'row', gap: Spacing.sm },
  sheetWorkItem: { flex: 1, alignItems: 'center', paddingVertical: Spacing.sm, borderRadius: BorderRadius.md },
  sheetWorkValue: { fontSize: 20, fontWeight: '700', fontVariant: ['tabular-nums'] },
  sheetWorkLabel: { fontSize: 10, marginTop: 2 },
  sheetGovGrid: { marginTop: Spacing.sm, gap: Spacing.xs },
  sheetGovItem: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: 4 },
  sheetGovText: { fontSize: 13 },
  sheetActions: { gap: Spacing.sm, marginTop: Spacing.sm },
  sheetGhostButton: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: BorderRadius.md, borderWidth: 1 },
  sheetGhostButtonText: { fontSize: 14, fontWeight: '600' },
});
