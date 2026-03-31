/**
 * Sports Organization People v2 — 10-view sub-tab hub.
 * Sub-tabs: Overview | Directory | Staff | Players | Recruits | Medical | Roles & Access | Onboarding | Contacts | Admin
 * RBAC: R1 full 10-tab, R2 Overview + Directory + Players, R3 all except Admin + Roles & Access, R4/R5 locked.
 */
import React, { useState, useCallback, useMemo } from 'react';
import { View, ScrollView, FlatList, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius , MODE_ACCENT } from '@/constants/theme';
import type { SportsRoleLens } from '@/utils/sports-rbac';
import { canSeeSensitive, canSeeCoachActions, canSeeAdminActions } from '@/utils/sports-rbac';
import {
  PEOPLE_SUB_TABS,
  DIRECTORY,
  STAFF_SEATS,
  PLAYER_AVAILABILITY,
  RECRUIT_RECORDS,
  MEDICAL_ENTRIES,
  ROLE_ASSIGNMENTS,
  ONBOARDING_CASES,
  EXTERNAL_CONTACTS,
  getPeopleOverview,
  PERSON_TYPE_LABELS,
  PERSON_TYPE_COLORS,
  PERSON_STATUS_LABELS,
  PERSON_STATUS_COLORS,
  WORKLOAD_LABELS,
  WORKLOAD_COLORS,
  AVAILABILITY_LABELS,
  AVAILABILITY_COLORS,
  RECRUIT_STAGE_LABELS,
  RECRUIT_STAGE_COLORS,
  MEDICAL_TYPE_LABELS,
  MEDICAL_TYPE_COLORS,
  MEDICAL_SEVERITY_LABELS,
  MEDICAL_SEVERITY_COLORS,
  MEDICAL_STATUS_LABELS,
  MEDICAL_STATUS_COLORS,
} from '@/data/mock-sports-org-people-v2';
import type {
  PersonRecord,
  StaffSeat,
  PlayerAvailability,
  RecruitRecord,
  MedicalEntry,
  RoleAssignment,
  OnboardingCase,
  ContactRecord,
} from '@/data/mock-sports-org-people-v2';

// =============================================================================
// CONSTANTS
// =============================================================================


const ACCENT = MODE_ACCENT.sports;
const SUB_TABS = PEOPLE_SUB_TABS.map((t) => ({ id: t.id, label: t.label }));

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
  role?: SportsRoleLens;
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
// OVERVIEW SUB-TAB
// =============================================================================

function OverviewTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const overview = useMemo(() => getPeopleOverview(), []);

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      {/* People Summary Card */}
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <ThemedText style={[s.overviewCardTitle, { color: colors.text }]}>People Summary</ThemedText>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {overview.totalPeople}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Total People</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#5A8A6E' }]}>
              {overview.activePeople}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.pendingPeople > 0 ? '#B8943E' : '#5A8A6E' }]}>
              {overview.pendingPeople}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Pending</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {overview.coverageScore}%
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Staff Coverage</ThemedText>
          </View>
        </View>
      </View>

      {/* Staff Status Strip */}
      <View style={[s.statusStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#5A8A6E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.filledStaffSeats}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Filled</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#B85C5C' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.vacantStaffSeats}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Vacant</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: '#B8943E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.overloadedStaff}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Overloaded</ThemedText>
        </View>
      </View>

      {/* Player Availability */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Player Availability
      </ThemedText>
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#5A8A6E' }]}>
              {overview.playersAvailable}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Available</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#B8943E' }]}>
              {overview.playersLimited}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Limited</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: '#B85C5C' }]}>
              {overview.playersUnavailable}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Unavailable</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: ACCENT }]}>
              {overview.playersOnHold}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Hold</ThemedText>
          </View>
        </View>
      </View>

      {/* Recruiting & Medical */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Recruiting & Medical
      </ThemedText>
      <View style={[s.overviewCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.kpiGrid}>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: accentColor }]}>
              {overview.activeRecruits}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Active Recruits</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.recruitsAtRisk > 0 ? '#B85C5C' : '#5A8A6E' }]}>
              {overview.recruitsAtRisk}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>At Risk</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.activeMedicalCases > 0 ? '#B8943E' : '#5A8A6E' }]}>
              {overview.activeMedicalCases}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>Medical Cases</ThemedText>
          </View>
          <View style={s.kpiItem}>
            <ThemedText style={[s.kpiValue, { color: overview.highSeverityCases > 0 ? '#B85C5C' : '#5A8A6E' }]}>
              {overview.highSeverityCases}
            </ThemedText>
            <ThemedText style={[s.kpiLabel, { color: colors.textSecondary }]}>High Severity</ThemedText>
          </View>
        </View>
      </View>

      {/* Governance */}
      <ThemedText style={[s.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Governance
      </ThemedText>
      <View style={[s.statusStrip, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: overview.overPermissionedRoles > 0 ? '#B8943E' : '#5A8A6E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.overPermissionedRoles}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Over-Permissioned</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: overview.onboardingBlockers > 0 ? '#B85C5C' : '#5A8A6E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.onboardingBlockers}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Onboard Blockers</ThemedText>
        </View>
        <View style={s.statusStripItem}>
          <View style={[s.statusDot, { backgroundColor: overview.staleContacts > 0 ? '#B8943E' : '#5A8A6E' }]} />
          <ThemedText style={[s.statusCount, { color: colors.text }]}>{overview.staleContacts}</ThemedText>
          <ThemedText style={[s.statusLabel, { color: colors.textSecondary }]}>Stale Contacts</ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

// =============================================================================
// DIRECTORY SUB-TAB
// =============================================================================

function DirectoryTab({
  colors,
  accentColor,
  onSelectPerson,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectPerson: (person: PersonRecord) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PersonRecord }) => {
      const typeColor = PERSON_TYPE_COLORS[item.type];
      const typeLabel = PERSON_TYPE_LABELS[item.type];
      const statusColor = PERSON_STATUS_COLORS[item.status];
      const statusLabel = PERSON_STATUS_LABELS[item.status];
      const initials = item.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectPerson(item);
          }}
        >
          <View style={s.directoryRow}>
            <View style={[s.avatarCircle, { backgroundColor: item.avatarColor }]}>
              <ThemedText style={s.avatarText}>{initials}</ThemedText>
            </View>
            <View style={s.directoryTextCol}>
              <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedText style={[s.listCardSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
                {item.role}
              </ThemedText>
            </View>
            <View style={s.directoryBadges}>
              <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
              <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectPerson],
  );

  return (
    <FlatList
      data={DIRECTORY}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.crop.rectangle.stack.fill" label="No directory entries" colors={colors} />
      }
    />
  );
}

// =============================================================================
// STAFF SUB-TAB
// =============================================================================

function StaffTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: StaffSeat }) => {
      const workloadColor = WORKLOAD_COLORS[item.workload];
      const workloadLabel = WORKLOAD_LABELS[item.workload];
      const isVacant = item.name === null;

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {item.isCritical && (
              <StatusBadge label="CRITICAL" color="#B85C5C" />
            )}
          </View>
          <View style={s.staffNameRow}>
            <ThemedText
              style={[
                s.staffName,
                { color: isVacant ? '#B85C5C' : colors.text },
              ]}
            >
              {isVacant ? 'VACANT' : item.name}
            </ThemedText>
            <StatusBadge label={workloadLabel.toUpperCase()} color={workloadColor} />
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.department}</ThemedText>
            </View>
            {item.backup && (
              <View style={s.listCardMetaItem}>
                <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>Backup: {item.backup}</ThemedText>
              </View>
            )}
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={STAFF_SEATS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.2.fill" label="No staff seats" colors={colors} />
      }
    />
  );
}

// =============================================================================
// PLAYERS SUB-TAB
// =============================================================================

function PlayersTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: PlayerAvailability }) => {
      const availColor = AVAILABILITY_COLORS[item.availability];
      const availLabel = AVAILABILITY_LABELS[item.availability];

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <View style={s.playerNameRow}>
              <View style={[s.jerseyBadge, { backgroundColor: accentColor + '20' }]}>
                <ThemedText style={[s.jerseyText, { color: accentColor }]}>#{item.jerseyNumber}</ThemedText>
              </View>
              <View style={s.playerTextCol}>
                <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
                  {item.name}
                </ThemedText>
                <ThemedText style={[s.listCardSubtitle, { color: colors.textSecondary }]}>
                  {item.position}
                </ThemedText>
              </View>
            </View>
            <StatusBadge label={availLabel.toUpperCase()} color={availColor} />
          </View>
          {item.clearances.length > 0 && (
            <View style={s.clearancesRow}>
              {item.clearances.map((clearance) => (
                <View key={clearance} style={[s.clearanceChip, { backgroundColor: '#5A8A6E20' }]}>
                  <ThemedText style={[s.clearanceChipText, { color: '#5A8A6E' }]}>
                    {clearance.toUpperCase()}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          {item.holdReason && (
            <View style={[s.holdReasonRow, { borderTopColor: colors.border }]}>
              <IconSymbol name="exclamationmark.triangle.fill" size={11} color="#B8943E" />
              <ThemedText style={[s.holdReasonText, { color: colors.textSecondary }]} numberOfLines={2}>
                {item.holdReason}
              </ThemedText>
            </View>
          )}
          {item.nextAction !== 'None' && (
            <View style={s.listCardMeta}>
              <View style={s.listCardMetaItem}>
                <IconSymbol name="arrow.right.circle.fill" size={11} color={colors.textTertiary} />
                <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]} numberOfLines={1}>
                  {item.nextAction}
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={PLAYER_AVAILABILITY}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="figure.basketball" label="No players" colors={colors} />
      }
    />
  );
}

// =============================================================================
// RECRUITS SUB-TAB
// =============================================================================

function RecruitsTab({
  colors,
  accentColor,
  onSelectRecruit,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectRecruit: (recruit: RecruitRecord) => void;
}) {
  const renderItem = useCallback(
    ({ item }: { item: RecruitRecord }) => {
      const stageColor = RECRUIT_STAGE_COLORS[item.stage];
      const stageLabel = RECRUIT_STAGE_LABELS[item.stage];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectRecruit(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            <View style={s.recruitBadges}>
              <StatusBadge label={stageLabel.toUpperCase()} color={stageColor} />
              {item.riskFlag && (
                <StatusBadge label="AT RISK" color="#B85C5C" />
              )}
            </View>
          </View>
          <ThemedText style={[s.listCardSubtitle, { color: colors.textSecondary }]}>
            {item.position} — {item.school}
          </ThemedText>
          <View style={[s.listCardMeta, { marginTop: Spacing.sm }]}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="person.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.ownerCoach}</ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                Last: {formatDate(item.lastTouch)}
              </ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="arrow.right.circle.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                Next: {formatDate(item.nextTouch)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectRecruit],
  );

  return (
    <FlatList
      data={RECRUIT_RECORDS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="person.badge.plus" label="No recruits" colors={colors} />
      }
    />
  );
}

// =============================================================================
// MEDICAL SUB-TAB
// =============================================================================

function MedicalTab({
  colors,
  accentColor,
  onSelectMedical,
}: {
  colors: typeof Colors.light;
  accentColor: string;
  onSelectMedical: (entry: MedicalEntry) => void;
}) {
  const sorted = useMemo(() => {
    const statusOrder: Record<string, number> = { active: 0, resolved: 1 };
    const sevOrder: Record<string, number> = { high: 0, moderate: 1, low: 2 };
    return [...MEDICAL_ENTRIES].sort((a, b) => {
      const sDiff = statusOrder[a.status] - statusOrder[b.status];
      if (sDiff !== 0) return sDiff;
      return sevOrder[a.severity] - sevOrder[b.severity];
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MedicalEntry }) => {
      const typeColor = MEDICAL_TYPE_COLORS[item.type];
      const typeLabel = MEDICAL_TYPE_LABELS[item.type];
      const sevColor = MEDICAL_SEVERITY_COLORS[item.severity];
      const sevLabel = MEDICAL_SEVERITY_LABELS[item.severity];
      const statusColor = MEDICAL_STATUS_COLORS[item.status];
      const statusLabel = MEDICAL_STATUS_LABELS[item.status];

      return (
        <Pressable
          style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onSelectMedical(item);
          }}
        >
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.player}
            </ThemedText>
            <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
            <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
          </View>
          <ThemedText style={[s.descriptionText, { color: colors.textSecondary }]} numberOfLines={2}>
            {item.description}
          </ThemedText>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="cross.case.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.provider}</ThemedText>
            </View>
          </View>
        </Pressable>
      );
    },
    [colors, accentColor, onSelectMedical],
  );

  return (
    <FlatList
      data={sorted}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="cross.case.fill" label="No medical entries" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ROLES & ACCESS SUB-TAB
// =============================================================================

function RolesAccessTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: RoleAssignment }) => {
      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.person}
            </ThemedText>
            {item.overPermissioned && (
              <StatusBadge label="OVER-PERMISSIONED" color="#B8943E" />
            )}
          </View>
          <View style={s.listCardBadgeRow}>
            <StatusBadge label={item.role.toUpperCase()} color={accentColor} />
            <StatusBadge label={`TIER ${item.accessTier}`} color={ACCENT} />
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                Reviewed: {formatDate(item.lastReviewed)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={ROLE_ASSIGNMENTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="lock.shield.fill" label="No role assignments" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ONBOARDING SUB-TAB
// =============================================================================

function OnboardingTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: OnboardingCase }) => {
      const percent = item.totalSteps > 0 ? Math.round((item.completedSteps / item.totalSteps) * 100) : 0;
      const isBlocked = item.blockers.length > 0;
      const barColor = isBlocked ? '#B8943E' : accentColor;

      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.person}
            </ThemedText>
            {isBlocked && (
              <StatusBadge label={`${item.blockers.length} BLOCKER${item.blockers.length > 1 ? 'S' : ''}`} color="#B85C5C" />
            )}
          </View>
          <ThemedText style={[s.listCardSubtitle, { color: colors.textSecondary }]}>
            {item.type}
          </ThemedText>
          <View style={s.onboardingProgressRow}>
            <ThemedText style={[s.onboardingProgressText, { color: colors.text }]}>
              {item.completedSteps} / {item.totalSteps} steps
            </ThemedText>
            <ThemedText style={[s.onboardingProgressPercent, { color: barColor }]}>
              {percent}%
            </ThemedText>
          </View>
          <ProgressBar percent={percent} color={barColor} />
          {isBlocked && (
            <View style={[s.blockersSection, { borderTopColor: colors.border }]}>
              <ThemedText style={[s.blockersTitle, { color: colors.textTertiary }]}>Blockers:</ThemedText>
              {item.blockers.map((blocker, i) => (
                <View key={`${item.id}-blocker-${i}`} style={s.blockerRow}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={10} color="#B85C5C" />
                  <ThemedText style={[s.blockerText, { color: colors.textSecondary }]} numberOfLines={1}>
                    {blocker}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                Due: {formatDate(item.dueDate)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={ONBOARDING_CASES}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="arrow.right.circle.fill" label="No onboarding cases" colors={colors} />
      }
    />
  );
}

// =============================================================================
// CONTACTS SUB-TAB
// =============================================================================

function ContactsTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const renderItem = useCallback(
    ({ item }: { item: ContactRecord }) => {
      return (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardHeader}>
            <ThemedText style={[s.listCardTitle, { color: colors.text }]} numberOfLines={1}>
              {item.name}
            </ThemedText>
            {item.isStale && (
              <StatusBadge label="STALE" color="#B8943E" />
            )}
          </View>
          <ThemedText style={[s.listCardSubtitle, { color: colors.textSecondary }]}>
            {item.role}
          </ThemedText>
          <View style={[s.listCardMeta, { marginTop: Spacing.sm }]}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="building.2.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.organization}</ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="phone.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.phone}</ThemedText>
            </View>
          </View>
          <View style={s.listCardMeta}>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="envelope.fill" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>{item.email}</ThemedText>
            </View>
            <View style={s.listCardMetaItem}>
              <IconSymbol name="calendar" size={11} color={colors.textTertiary} />
              <ThemedText style={[s.listCardMetaText, { color: colors.textTertiary }]}>
                Verified: {formatDate(item.lastVerified)}
              </ThemedText>
            </View>
          </View>
        </View>
      );
    },
    [colors, accentColor],
  );

  return (
    <FlatList
      data={EXTERNAL_CONTACTS}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={s.tabListContent}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={
        <EmptyState icon="phone.fill" label="No external contacts" colors={colors} />
      }
    />
  );
}

// =============================================================================
// ADMIN SUB-TAB
// =============================================================================

function AdminTab({
  colors,
  accentColor,
}: {
  colors: typeof Colors.light;
  accentColor: string;
}) {
  const adminActions = [
    { id: 'pa-1', label: 'Manage Directory', icon: 'person.crop.rectangle.stack.fill' },
    { id: 'pa-2', label: 'Staff Planning', icon: 'person.2.fill' },
    { id: 'pa-3', label: 'Access Review', icon: 'lock.shield.fill' },
    { id: 'pa-4', label: 'Export Reports', icon: 'arrow.down.doc.fill' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.tabScroll}>
      <ThemedText style={[s.sectionTitle, { color: colors.text }]}>People Administration</ThemedText>
      <ThemedText style={[s.sectionSubtitle, { color: colors.textSecondary }]}>
        People administration tools
      </ThemedText>
      <View style={s.quickActionGrid}>
        {adminActions.map((action) => (
          <Pressable
            key={action.id}
            style={[s.quickActionCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={action.icon as any} size={22} color={accentColor} />
            <ThemedText style={[s.quickActionLabel, { color: colors.text }]}>{action.label}</ThemedText>
          </Pressable>
        ))}
      </View>
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
  person: PersonRecord | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!person) return null;

  const typeColor = PERSON_TYPE_COLORS[person.type];
  const typeLabel = PERSON_TYPE_LABELS[person.type];
  const statusColor = PERSON_STATUS_COLORS[person.status];
  const statusLabel = PERSON_STATUS_LABELS[person.status];
  const initials = person.name.split(' ').map((n) => n[0]).join('').slice(0, 2);

  return (
    <BottomSheet visible={visible} onClose={onClose} title={person.name} useModal>
      {/* Avatar + Badges */}
      <View style={s.sheetAvatarRow}>
        <View style={[s.sheetAvatarCircle, { backgroundColor: person.avatarColor }]}>
          <ThemedText style={s.sheetAvatarText}>{initials}</ThemedText>
        </View>
        <View style={s.sheetBadgeRow}>
          <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
          <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
        </View>
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.name}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Name</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.role}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Role</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.email}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Email</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{person.phone}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Phone</ThemedText>
          </View>
        </View>
      </View>

      {/* Status */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
          </ThemedText>
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
// RECRUIT DETAIL BOTTOM SHEET
// =============================================================================

function RecruitDetailSheet({
  visible,
  onClose,
  recruit,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  recruit: RecruitRecord | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!recruit) return null;

  const stageColor = RECRUIT_STAGE_COLORS[recruit.stage];
  const stageLabel = RECRUIT_STAGE_LABELS[recruit.stage];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={recruit.name} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={stageLabel.toUpperCase()} color={stageColor} />
        <StatusBadge label={recruit.position.toUpperCase()} color={accentColor} />
        {recruit.riskFlag && (
          <StatusBadge label="AT RISK" color="#B85C5C" />
        )}
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{recruit.name}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Name</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{recruit.position}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Position</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{recruit.school}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>School</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{recruit.ownerCoach}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Owner Coach</ThemedText>
          </View>
        </View>
      </View>

      {/* Pipeline Stage */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Pipeline Stage</ThemedText>
        <View style={s.sheetWorkflowRow}>
          {(['prospect', 'contacted', 'visit-scheduled', 'offered', 'committed', 'signed'] as const).map((stage) => {
            const sColor = RECRUIT_STAGE_COLORS[stage];
            const isCurrent = recruit.stage === stage;
            const stageIdx = ['prospect', 'contacted', 'visit-scheduled', 'offered', 'committed', 'signed'].indexOf(stage);
            const currentIdx = ['prospect', 'contacted', 'visit-scheduled', 'offered', 'committed', 'signed'].indexOf(recruit.stage);
            const isPast = stageIdx < currentIdx;
            return (
              <View key={stage} style={s.sheetWorkflowStep}>
                <View
                  style={[
                    s.sheetWorkflowDot,
                    {
                      backgroundColor: isCurrent || isPast ? sColor : colors.border,
                      borderColor: isCurrent ? sColor : 'transparent',
                      borderWidth: isCurrent ? 2 : 0,
                    },
                  ]}
                />
                {isCurrent && (
                  <ThemedText style={[s.sheetWorkflowLabel, { color: sColor }]}>
                    {RECRUIT_STAGE_LABELS[stage]}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Timeline */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Timeline</ThemedText>
        <View style={s.sheetListRow}>
          <IconSymbol name="calendar" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Last Contact</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {formatDate(recruit.lastTouch)}
            </ThemedText>
          </View>
        </View>
        <View style={s.sheetListRow}>
          <IconSymbol name="arrow.right.circle.fill" size={14} color={accentColor} />
          <View style={s.sheetListTextCol}>
            <ThemedText style={[s.sheetListTitle, { color: colors.text }]}>Next Touch</ThemedText>
            <ThemedText style={[s.sheetListSubtitle, { color: colors.textSecondary }]}>
              {formatDate(recruit.nextTouch)}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Risk Flag */}
      {recruit.riskFlag && (
        <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
          <View style={s.sheetListRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#B85C5C" />
            <ThemedText style={[s.sheetBodyText, { color: '#B85C5C' }]}>
              This recruit has been flagged as at-risk
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
// MEDICAL DETAIL BOTTOM SHEET
// =============================================================================

function MedicalDetailSheet({
  visible,
  onClose,
  entry,
  colors,
  accentColor,
}: {
  visible: boolean;
  onClose: () => void;
  entry: MedicalEntry | null;
  colors: typeof Colors.light;
  accentColor: string;
}) {
  if (!entry) return null;

  const typeColor = MEDICAL_TYPE_COLORS[entry.type];
  const typeLabel = MEDICAL_TYPE_LABELS[entry.type];
  const sevColor = MEDICAL_SEVERITY_COLORS[entry.severity];
  const sevLabel = MEDICAL_SEVERITY_LABELS[entry.severity];
  const statusColor = MEDICAL_STATUS_COLORS[entry.status];
  const statusLabel = MEDICAL_STATUS_LABELS[entry.status];

  return (
    <BottomSheet visible={visible} onClose={onClose} title={entry.player} useModal>
      {/* Badge Row */}
      <View style={s.sheetBadgeRow}>
        <StatusBadge label={typeLabel.toUpperCase()} color={typeColor} />
        <StatusBadge label={sevLabel.toUpperCase()} color={sevColor} />
        <StatusBadge label={statusLabel.toUpperCase()} color={statusColor} />
      </View>

      {/* Details */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Details</ThemedText>
        <View style={s.sheetDetailsGrid}>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{entry.player}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Player</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: typeColor }]}>{typeLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Type</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: sevColor }]}>{sevLabel}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Severity</ThemedText>
          </View>
          <View style={s.sheetDetailItem}>
            <ThemedText style={[s.sheetDetailValue, { color: colors.text }]}>{entry.provider}</ThemedText>
            <ThemedText style={[s.sheetDetailLabel, { color: colors.textSecondary }]}>Provider</ThemedText>
          </View>
        </View>
      </View>

      {/* Description */}
      <View style={[s.sheetSection, { borderBottomColor: colors.border }]}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Description</ThemedText>
        <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
          {entry.description}
        </ThemedText>
      </View>

      {/* Status */}
      <View style={s.sheetSection}>
        <ThemedText style={[s.sheetSectionTitle, { color: colors.text }]}>Status</ThemedText>
        <View style={s.sheetListRow}>
          <View style={[s.timelineDot, { backgroundColor: statusColor }]} />
          <ThemedText style={[s.sheetBodyText, { color: colors.textSecondary }]}>
            Current: {statusLabel}
          </ThemedText>
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

export function SportsOrgPeopleV2({ colors, accentColor, role = 'R3' }: Props) {
  // === RBAC Gate: non-coaching roles locked ===
  if (!canSeeCoachActions(role)) {
    return (
      <View style={s.lockedContainer}>
        <IconSymbol name="lock.fill" size={40} color={colors.textTertiary} />
        <ThemedText style={[s.lockedTitle, { color: colors.text }]}>People</ThemedText>
        <ThemedText style={[s.lockedMessage, { color: colors.textSecondary }]}>
          People information is not available for your role
        </ThemedText>
      </View>
    );
  }

  // === State ===
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [drillMode, setDrillMode] = useState(false);
  const [selectedPerson, setSelectedPerson] = useState<PersonRecord | null>(null);
  const [personSheetVisible, setPersonSheetVisible] = useState(false);
  const [selectedRecruit, setSelectedRecruit] = useState<RecruitRecord | null>(null);
  const [recruitSheetVisible, setRecruitSheetVisible] = useState(false);
  const [selectedMedical, setSelectedMedical] = useState<MedicalEntry | null>(null);
  const [medicalSheetVisible, setMedicalSheetVisible] = useState(false);

  // === Callbacks ===
  const handleSelectPerson = useCallback((person: PersonRecord) => {
    setSelectedPerson(person);
    setPersonSheetVisible(true);
  }, []);

  const handleClosePersonSheet = useCallback(() => {
    setPersonSheetVisible(false);
  }, []);

  const handleSelectRecruit = useCallback((recruit: RecruitRecord) => {
    setSelectedRecruit(recruit);
    setRecruitSheetVisible(true);
  }, []);

  const handleCloseRecruitSheet = useCallback(() => {
    setRecruitSheetVisible(false);
  }, []);

  const handleSelectMedical = useCallback((entry: MedicalEntry) => {
    setSelectedMedical(entry);
    setMedicalSheetVisible(true);
  }, []);

  const handleCloseMedicalSheet = useCallback(() => {
    setMedicalSheetVisible(false);
  }, []);

  // === RBAC-aware sub-tabs ===
  const visibleSubTabs = useMemo(() => {
    if (canSeeSensitive(role)) return SUB_TABS; // R0-R3: full 10 tabs
    if (role === 'R4') {
      // R4 (Assistant Coach/RC): all except Admin, Roles & Access
      return SUB_TABS.filter(
        (t) => t.id !== 'admin' && t.id !== 'roles-access',
      );
    }
    // Non-coaching roles already handled by locked gate above
    return SUB_TABS;
  }, [role]);

  // === Sub-tab content ===
  const renderContent = () => {
    switch (activeSubTab) {
      case 'overview':
        return <OverviewTab colors={colors} accentColor={accentColor} />;
      case 'directory':
        return (
          <DirectoryTab
            colors={colors}
            accentColor={accentColor}
            onSelectPerson={handleSelectPerson}
          />
        );
      case 'staff':
        return <StaffTab colors={colors} accentColor={accentColor} />;
      case 'players':
        return <PlayersTab colors={colors} accentColor={accentColor} />;
      case 'recruits':
        return (
          <RecruitsTab
            colors={colors}
            accentColor={accentColor}
            onSelectRecruit={handleSelectRecruit}
          />
        );
      case 'medical':
        return (
          <MedicalTab
            colors={colors}
            accentColor={accentColor}
            onSelectMedical={handleSelectMedical}
          />
        );
      case 'roles-access':
        return <RolesAccessTab colors={colors} accentColor={accentColor} />;
      case 'onboarding':
        return <OnboardingTab colors={colors} accentColor={accentColor} />;
      case 'contacts':
        return <ContactsTab colors={colors} accentColor={accentColor} />;
      case 'admin':
        return <AdminTab colors={colors} accentColor={accentColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={s.container}>
      {/* Sub-tab bar — hidden until drill mode */}
      {drillMode ? (
        <>
          <Pressable
            style={[s.overviewBackBar, { borderBottomColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setDrillMode(false);
              setActiveSubTab('overview');
            }}
          >
            <IconSymbol name="chevron.left" size={14} color={accentColor} />
            <ThemedText style={[s.overviewBackText, { color: accentColor }]}>Overview</ThemedText>
          </Pressable>
          <SubTabBar
            tabs={visibleSubTabs}
            activeId={activeSubTab}
            onSelect={setActiveSubTab}
            accentColor={accentColor}
            colors={colors}
          />
        </>
      ) : null}

      {/* Content */}
      <View style={s.contentContainer}>
        {renderContent()}
      </View>

      {/* Explore bar — overview-only mode */}
      {!drillMode && (
        <Pressable
          style={[s.exploreBar, { backgroundColor: accentColor }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setDrillMode(true);
          }}
        >
          <IconSymbol name="rectangle.grid.1x2.fill" size={16} color="#FFFFFF" />
          <ThemedText style={s.exploreBarText}>Explore All Sections</ThemedText>
          <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Person Detail Bottom Sheet */}
      <PersonDetailSheet
        visible={personSheetVisible}
        onClose={handleClosePersonSheet}
        person={selectedPerson}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Recruit Detail Bottom Sheet */}
      <RecruitDetailSheet
        visible={recruitSheetVisible}
        onClose={handleCloseRecruitSheet}
        recruit={selectedRecruit}
        colors={colors}
        accentColor={accentColor}
      />

      {/* Medical Detail Bottom Sheet */}
      <MedicalDetailSheet
        visible={medicalSheetVisible}
        onClose={handleCloseMedicalSheet}
        entry={selectedMedical}
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
  overviewBackBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  overviewBackText: {
    fontSize: 14,
    fontWeight: '600',
  },
  exploreBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  exploreBarText: {
    color: '#FFFFFF',
    fontSize: 15,
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
  sectionSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.md,
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

  // -- Overview Card --
  overviewCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  overviewCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },

  // -- KPI Grid --
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  kpiItem: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  kpiLabel: {
    fontSize: 11,
    marginTop: 2,
  },

  // -- Status Strip --
  statusStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },
  statusStripItem: {
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusCount: {
    fontSize: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  statusLabel: {
    fontSize: 11,
  },

  // -- List Card (generic) --
  listCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  listCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listCardTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  listCardSubtitle: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  listCardBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: Spacing.sm,
  },
  listCardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  listCardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  listCardMetaText: {
    fontSize: 11,
  },

  // -- Directory --
  directoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  directoryTextCol: {
    flex: 1,
  },
  directoryBadges: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 4,
  },

  // -- Description text --
  descriptionText: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: Spacing.sm,
  },

  // -- Staff --
  staffNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  staffName: {
    fontSize: 14,
    fontWeight: '600',
  },

  // -- Player --
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  playerTextCol: {
    flex: 1,
  },
  jerseyBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  jerseyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  clearancesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.sm,
  },
  clearanceChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  clearanceChipText: {
    fontSize: 8,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  holdReasonRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  holdReasonText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  // -- Recruit --
  recruitBadges: {
    flexDirection: 'row',
    gap: 4,
  },

  // -- Onboarding --
  onboardingProgressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  onboardingProgressText: {
    fontSize: 12,
    fontWeight: '500',
  },
  onboardingProgressPercent: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  blockersSection: {
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.sm,
  },
  blockersTitle: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  blockerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  blockerText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  // -- Quick Actions --
  quickActionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  quickActionCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
  },

  // -- Bottom Sheet --
  sheetAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  sheetBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
  sheetBodyText: {
    fontSize: 13,
    lineHeight: 19,
  },
  sheetDetailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  sheetDetailItem: {
    width: '45%',
  },
  sheetDetailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  sheetDetailLabel: {
    fontSize: 11,
    marginTop: 1,
  },
  sheetListRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 6,
  },
  sheetListTextCol: {
    flex: 1,
  },
  sheetListTitle: {
    fontSize: 13,
    fontWeight: '500',
  },
  sheetListSubtitle: {
    fontSize: 11,
    marginTop: 1,
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
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },

  // -- Workflow (Recruit Pipeline) --
  sheetWorkflowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Spacing.sm,
  },
  sheetWorkflowStep: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  sheetWorkflowDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  sheetWorkflowLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
