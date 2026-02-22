/**
 * Competition Organization People Tab — 10-tab People Hub.
 * Dashboard, Staff, Officials, Volunteers, Entrant Rosters, Credentials,
 * Assignments, Communications, Reports, Settings.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  ScrollView,
  FlatList,
  TextInput,
  Pressable,
  Switch,
  StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Colors, Spacing, BorderRadius } from '@/constants/theme';
import {
  COMP_PEOPLE_TABS,
  COMP_PEOPLE_SCOPE_CHIPS,
  getCompPeopleData,
  STAFF_STATUS_COLOR,
  OFFICIAL_STATUS_COLOR,
  VOLUNTEER_STATUS_COLOR,
  CREDENTIAL_STATUS_COLOR,
  ASSIGNMENT_STATUS_COLOR,
  COMM_STATUS_COLOR,
  COMM_TYPE_COLOR,
  CREDENTIAL_TYPE_COLOR,
  REPORT_FORMAT_COLOR,
  OFFICIAL_LEVEL_COLOR,
} from '@/data/mock-comp-org-people';
import type {
  CompPeopleTabId,
  PeopleDashboardBlock,
  StaffMember,
  Official,
  Volunteer,
  EntrantRoster,
  Credential,
  Assignment,
  Communication,
  PeopleReport,
  PeopleSettingToggle,
} from '@/data/mock-comp-org-people';

// =============================================================================
// PROPS
// =============================================================================

interface Props {
  colors: typeof Colors.light;
  accentColor: string;
}

// =============================================================================
// SUB-COMPONENTS — Badges
// =============================================================================

function StaffStatusBadge({ status }: { status: StaffMember['status'] }) {
  const fg = STAFF_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>
        {status === 'on-leave' ? 'On Leave' : status}
      </ThemedText>
    </View>
  );
}

function OfficialStatusBadge({ status }: { status: Official['status'] }) {
  const fg = OFFICIAL_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function VolunteerStatusBadge({ status }: { status: Volunteer['status'] }) {
  const fg = VOLUNTEER_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function CredentialStatusBadge({ status }: { status: Credential['status'] }) {
  const fg = CREDENTIAL_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function AssignmentStatusBadge({ status }: { status: Assignment['status'] }) {
  const fg = ASSIGNMENT_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function CommStatusBadge({ status }: { status: Communication['status'] }) {
  const fg = COMM_STATUS_COLOR[status];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{status}</ThemedText>
    </View>
  );
}

function CommTypeBadge({ type }: { type: Communication['type'] }) {
  const fg = COMM_TYPE_COLOR[type];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{type}</ThemedText>
    </View>
  );
}

function CredentialTypeBadge({ type }: { type: Credential['type'] }) {
  const fg = CREDENTIAL_TYPE_COLOR[type];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{type}</ThemedText>
    </View>
  );
}

function FormatBadge({ format }: { format: PeopleReport['format'] }) {
  const fg = REPORT_FORMAT_COLOR[format];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{format}</ThemedText>
    </View>
  );
}

function LevelBadge({ level }: { level: Official['level'] }) {
  const fg = OFFICIAL_LEVEL_COLOR[level];
  return (
    <View style={[s.badge, { backgroundColor: fg + '20' }]}>
      <ThemedText style={[s.badgeText, { color: fg }]}>{level}</ThemedText>
    </View>
  );
}

function EmptyState({ icon, text, colors }: { icon: string; text: string; colors: typeof Colors.light }) {
  return (
    <View style={s.emptyState}>
      <IconSymbol name={icon as any} size={40} color={colors.textTertiary} />
      <ThemedText style={[s.emptyText, { color: colors.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function renderStars(rating: number): string {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return '\u2605'.repeat(full) + (half ? '\u00BD' : '') + '\u2606'.repeat(empty);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function CompPeopleV2({ colors, accentColor }: Props) {
  // === State ===
  const [activeTab, setActiveTab] = useState<CompPeopleTabId>('dashboard');
  const [activeScope, setActiveScope] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Detail sheets
  const [staffDetailVisible, setStaffDetailVisible] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [officialDetailVisible, setOfficialDetailVisible] = useState(false);
  const [selectedOfficial, setSelectedOfficial] = useState<Official | null>(null);
  const [rosterDetailVisible, setRosterDetailVisible] = useState(false);
  const [selectedRoster, setSelectedRoster] = useState<EntrantRoster | null>(null);

  // Settings toggles (local visual state)
  const [settingsState, setSettingsState] = useState<Record<string, boolean>>({});

  // === Data ===
  const scopeLabel = COMP_PEOPLE_SCOPE_CHIPS[activeScope];
  const data = useMemo(() => getCompPeopleData(scopeLabel), [scopeLabel]);

  // Initialize settings state from data
  const effectiveSettings = useMemo(() => {
    const base: Record<string, boolean> = {};
    data.settings.forEach((s) => {
      base[s.id] = settingsState[s.id] !== undefined ? settingsState[s.id] : s.enabled;
    });
    return base;
  }, [data.settings, settingsState]);

  // === Filtered data ===
  const filteredStaff = useMemo(() => {
    if (!searchQuery) return data.staff;
    const q = searchQuery.toLowerCase();
    return data.staff.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.role.toLowerCase().includes(q) ||
        m.department.toLowerCase().includes(q),
    );
  }, [data.staff, searchQuery]);

  const filteredOfficials = useMemo(() => {
    if (!searchQuery) return data.officials;
    const q = searchQuery.toLowerCase();
    return data.officials.filter(
      (o) =>
        o.name.toLowerCase().includes(q) ||
        o.certification.toLowerCase().includes(q) ||
        o.sport.toLowerCase().includes(q),
    );
  }, [data.officials, searchQuery]);

  const filteredVolunteers = useMemo(() => {
    if (!searchQuery) return data.volunteers;
    const q = searchQuery.toLowerCase();
    return data.volunteers.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        v.role.toLowerCase().includes(q) ||
        v.skills.some((sk) => sk.toLowerCase().includes(q)),
    );
  }, [data.volunteers, searchQuery]);

  const filteredRosters = useMemo(() => {
    if (!searchQuery) return data.entrantRosters;
    const q = searchQuery.toLowerCase();
    return data.entrantRosters.filter((r) => r.entrantName.toLowerCase().includes(q));
  }, [data.entrantRosters, searchQuery]);

  const filteredCredentials = useMemo(() => {
    if (!searchQuery) return data.credentials;
    const q = searchQuery.toLowerCase();
    return data.credentials.filter(
      (c) => c.person.toLowerCase().includes(q) || c.type.toLowerCase().includes(q),
    );
  }, [data.credentials, searchQuery]);

  const filteredAssignments = useMemo(() => {
    if (!searchQuery) return data.assignments;
    const q = searchQuery.toLowerCase();
    return data.assignments.filter(
      (a) =>
        a.person.toLowerCase().includes(q) ||
        a.role.toLowerCase().includes(q) ||
        a.event.toLowerCase().includes(q),
    );
  }, [data.assignments, searchQuery]);

  const filteredComms = useMemo(() => {
    if (!searchQuery) return data.communications;
    const q = searchQuery.toLowerCase();
    return data.communications.filter((c) => c.subject.toLowerCase().includes(q));
  }, [data.communications, searchQuery]);

  const filteredReports = useMemo(() => {
    if (!searchQuery) return data.reports;
    const q = searchQuery.toLowerCase();
    return data.reports.filter(
      (r) => r.name.toLowerCase().includes(q) || r.type.toLowerCase().includes(q),
    );
  }, [data.reports, searchQuery]);

  // === Derived stats ===
  const activeStaffCount = useMemo(
    () => data.staff.filter((s) => s.status === 'active').length,
    [data.staff],
  );
  const pendingCredCount = useMemo(
    () => data.credentials.filter((c) => c.status === 'pending').length,
    [data.credentials],
  );
  const pendingAssignmentCount = useMemo(
    () => data.assignments.filter((a) => a.status === 'pending').length,
    [data.assignments],
  );

  // === Callbacks ===
  const handleTabPress = useCallback((tabId: CompPeopleTabId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
  }, []);

  const handleScopePress = useCallback((index: number) => {
    Haptics.selectionAsync();
    setActiveScope(index);
  }, []);

  const handleStaffPress = useCallback((staff: StaffMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedStaff(staff);
    setStaffDetailVisible(true);
  }, []);

  const handleOfficialPress = useCallback((official: Official) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedOfficial(official);
    setOfficialDetailVisible(true);
  }, []);

  const handleRosterPress = useCallback((roster: EntrantRoster) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedRoster(roster);
    setRosterDetailVisible(true);
  }, []);

  const handleSettingToggle = useCallback((id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSettingsState((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  // ===================================================================
  // RENDER — TAB CONTENT
  // ===================================================================

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return renderDashboard();
      case 'staff':
        return renderStaff();
      case 'officials':
        return renderOfficials();
      case 'volunteers':
        return renderVolunteers();
      case 'entrant-rosters':
        return renderEntrantRosters();
      case 'credentials':
        return renderCredentials();
      case 'assignments':
        return renderAssignments();
      case 'communications':
        return renderCommunications();
      case 'reports':
        return renderReports();
      case 'settings':
        return renderSettings();
      default:
        return null;
    }
  };

  // === Tab 1: Dashboard ===
  const renderDashboard = () => (
    <View style={s.tabContent}>
      <View style={s.dashboardGrid}>
        {data.dashboard.map((block) => (
          <View
            key={block.id}
            style={[s.dashboardCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[s.dashIconCircle, { backgroundColor: block.color + '26' }]}>
              <IconSymbol name={block.icon as any} size={16} color={block.color} />
            </View>
            <ThemedText style={[s.dashLabel, { color: colors.textSecondary }]}>
              {block.label}
            </ThemedText>
            <ThemedText style={[s.dashValue, { color: block.color }]}>{block.value}</ThemedText>
            <ThemedText style={[s.dashDelta, { color: colors.textTertiary }]}>
              {block.delta}
            </ThemedText>
          </View>
        ))}
      </View>

      {/* Quick stats below grid */}
      <View style={[s.quickStatsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>
            Active Staff
          </ThemedText>
          <ThemedText style={[s.quickStatValue, { fontVariant: ['tabular-nums'] }]}>
            {activeStaffCount}
          </ThemedText>
        </View>
        <View style={[s.quickStatDivider, { backgroundColor: colors.divider }]} />
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>
            Pending Creds
          </ThemedText>
          <ThemedText
            style={[
              s.quickStatValue,
              {
                color: pendingCredCount > 0 ? '#F59E0B' : colors.text,
                fontVariant: ['tabular-nums'],
              },
            ]}
          >
            {pendingCredCount}
          </ThemedText>
        </View>
        <View style={[s.quickStatDivider, { backgroundColor: colors.divider }]} />
        <View style={s.quickStat}>
          <ThemedText style={[s.quickStatLabel, { color: colors.textSecondary }]}>
            Unconfirmed
          </ThemedText>
          <ThemedText
            style={[
              s.quickStatValue,
              {
                color: pendingAssignmentCount > 0 ? '#EF4444' : colors.text,
                fontVariant: ['tabular-nums'],
              },
            ]}
          >
            {pendingAssignmentCount}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  // === Tab 2: Staff ===
  const renderStaff = () => (
    <FlatList<StaffMember>
      data={filteredStaff}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={<EmptyState icon="person.2" text="No staff members found" colors={colors} />}
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            s.listCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => handleStaffPress(item)}
        >
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {item.avatar}
              </ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <View style={s.staffTopRow}>
                <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                <StaffStatusBadge status={item.status} />
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.role} · {item.department}
              </ThemedText>
              <View style={s.staffContactRow}>
                <Pressable
                  style={({ pressed }) => [s.contactIcon, pressed && { opacity: 0.6 }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="envelope" size={14} color={colors.textTertiary} />
                </Pressable>
                <Pressable
                  style={({ pressed }) => [s.contactIcon, pressed && { opacity: 0.6 }]}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <IconSymbol name="phone" size={14} color={colors.textTertiary} />
                </Pressable>
                <ThemedText style={[s.hireDateText, { color: colors.textTertiary }]}>
                  Hired {item.hireDate}
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
      )}
    />
  );

  // === Tab 3: Officials ===
  const renderOfficials = () => (
    <FlatList<Official>
      data={filteredOfficials}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="shield.checkered" text="No officials found" colors={colors} />
      }
      renderItem={({ item }) => (
        <Pressable
          style={({ pressed }) => [
            s.listCard,
            { backgroundColor: colors.card, borderColor: colors.border },
            pressed && { opacity: 0.85 },
          ]}
          onPress={() => handleOfficialPress(item)}
        >
          <View style={s.listCardInfo}>
            <View style={s.officialTopRow}>
              <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
              <OfficialStatusBadge status={item.status} />
            </View>
            <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
              {item.certification}
            </ThemedText>
            <View style={s.officialMetaRow}>
              <LevelBadge level={item.level} />
              <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.sport}</ThemedText>
              </View>
            </View>
            <View style={s.officialStatsRow}>
              <View style={s.officialStat}>
                <IconSymbol name="sportscourt" size={12} color={colors.textTertiary} />
                <ThemedText style={[s.officialStatText, { color: colors.textSecondary }]}>
                  {item.matchesOfficiated} matches
                </ThemedText>
              </View>
              <View style={s.officialStat}>
                <ThemedText style={[s.ratingText, { color: '#F59E0B' }]}>
                  {renderStars(item.rating)}
                </ThemedText>
                <ThemedText style={[s.ratingNumber, { color: colors.textSecondary }]}>
                  {item.rating.toFixed(1)}
                </ThemedText>
              </View>
            </View>
          </View>
        </Pressable>
      )}
    />
  );

  // === Tab 4: Volunteers ===
  const renderVolunteers = () => (
    <FlatList<Volunteer>
      data={filteredVolunteers}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="hand.raised" text="No volunteers found" colors={colors} />
      }
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.avatarCircle, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.avatarText, { color: accentColor }]}>
                {getInitials(item.name)}
              </ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <View style={s.volunteerTopRow}>
                <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                <VolunteerStatusBadge status={item.status} />
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.role}
              </ThemedText>
              <View style={s.volunteerStatsRow}>
                <View style={s.volunteerStat}>
                  <IconSymbol name="clock" size={12} color={colors.textTertiary} />
                  <ThemedText
                    style={[
                      s.volunteerStatText,
                      { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.hours}h logged
                  </ThemedText>
                </View>
                <View style={s.volunteerStat}>
                  <IconSymbol name="calendar" size={12} color={colors.textTertiary} />
                  <ThemedText
                    style={[
                      s.volunteerStatText,
                      { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.events} events
                  </ThemedText>
                </View>
              </View>
              <View style={s.skillsRow}>
                {item.skills.slice(0, 3).map((skill) => (
                  <View
                    key={skill}
                    style={[s.skillTag, { backgroundColor: colors.backgroundTertiary }]}
                  >
                    <ThemedText style={[s.skillTagText, { color: colors.textSecondary }]}>
                      {skill}
                    </ThemedText>
                  </View>
                ))}
                {item.skills.length > 3 && (
                  <ThemedText style={[s.skillMore, { color: colors.textTertiary }]}>
                    +{item.skills.length - 3}
                  </ThemedText>
                )}
              </View>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 5: Entrant Rosters ===
  const renderEntrantRosters = () => (
    <FlatList<EntrantRoster>
      data={filteredRosters}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="list.bullet.rectangle" text="No entrant rosters found" colors={colors} />
      }
      renderItem={({ item }) => {
        const totalPersonnel = item.playerCount + item.coachCount + item.staffCount;
        return (
          <Pressable
            style={({ pressed }) => [
              s.listCard,
              { backgroundColor: colors.card, borderColor: colors.border },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => handleRosterPress(item)}
          >
            <View style={s.listCardInfo}>
              <View style={s.rosterTopRow}>
                <ThemedText style={s.rosterName}>{item.entrantName}</ThemedText>
                <View style={[s.rosterTotalBadge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText
                    style={[
                      s.rosterTotalText,
                      { color: accentColor, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {totalPersonnel}
                  </ThemedText>
                </View>
              </View>
              <View style={s.rosterCountsRow}>
                <View style={s.rosterCount}>
                  <IconSymbol name="person" size={12} color={colors.textTertiary} />
                  <ThemedText
                    style={[
                      s.rosterCountText,
                      { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.playerCount} players
                  </ThemedText>
                </View>
                <View style={s.rosterCount}>
                  <IconSymbol name="person.badge.shield.checkmark" size={12} color={colors.textTertiary} />
                  <ThemedText
                    style={[
                      s.rosterCountText,
                      { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.coachCount} coaches
                  </ThemedText>
                </View>
                <View style={s.rosterCount}>
                  <IconSymbol name="person.2" size={12} color={colors.textTertiary} />
                  <ThemedText
                    style={[
                      s.rosterCountText,
                      { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                    ]}
                  >
                    {item.staffCount} staff
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={[s.rosterUpdated, { color: colors.textTertiary }]}>
                Updated {item.lastUpdated}
              </ThemedText>
            </View>
          </Pressable>
        );
      }}
    />
  );

  // === Tab 6: Credentials ===
  const renderCredentials = () => (
    <FlatList<Credential>
      data={filteredCredentials}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="person.badge.key" text="No credentials found" colors={colors} />
      }
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.credentialTopRow}>
              <ThemedText style={s.listCardTitle}>{item.person}</ThemedText>
              <CredentialStatusBadge status={item.status} />
            </View>
            <View style={s.credentialTypeRow}>
              <CredentialTypeBadge type={item.type} />
            </View>
            <View style={s.credentialDatesRow}>
              <ThemedText style={[s.credentialDate, { color: colors.textTertiary }]}>
                Issued: {item.issueDate}
              </ThemedText>
              <ThemedText
                style={[
                  s.credentialDate,
                  {
                    color:
                      item.status === 'expired'
                        ? '#EF4444'
                        : item.status === 'revoked'
                          ? '#A1A1AA'
                          : colors.textTertiary,
                  },
                ]}
              >
                Expires: {item.expiryDate}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 7: Assignments ===
  const renderAssignments = () => (
    <FlatList<Assignment>
      data={filteredAssignments}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="calendar.badge.clock" text="No assignments found" colors={colors} />
      }
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View
              style={[
                s.assignmentDateStrip,
                { backgroundColor: ASSIGNMENT_STATUS_COLOR[item.status] + '20' },
              ]}
            >
              <ThemedText
                style={[
                  s.assignmentDateText,
                  { color: ASSIGNMENT_STATUS_COLOR[item.status] },
                ]}
              >
                {item.date.split(',')[0]}
              </ThemedText>
            </View>
            <View style={s.listCardInfo}>
              <View style={s.assignmentTopRow}>
                <ThemedText style={s.listCardTitle}>{item.person}</ThemedText>
                <AssignmentStatusBadge status={item.status} />
              </View>
              <ThemedText style={[s.listCardSub, { color: colors.textSecondary }]}>
                {item.role}
              </ThemedText>
              <ThemedText style={[s.assignmentEvent, { color: colors.textTertiary }]}>
                {item.event}
              </ThemedText>
              <ThemedText style={[s.assignmentDateFull, { color: colors.textTertiary }]}>
                {item.date}
              </ThemedText>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 8: Communications ===
  const renderCommunications = () => (
    <FlatList<Communication>
      data={filteredComms}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="envelope" text="No communications found" colors={colors} />
      }
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardInfo}>
            <View style={s.commTopRow}>
              <ThemedText style={s.commSubject} numberOfLines={2}>
                {item.subject}
              </ThemedText>
              <CommStatusBadge status={item.status} />
            </View>
            <View style={s.commMetaRow}>
              <CommTypeBadge type={item.type} />
              <ThemedText
                style={[
                  s.commRecipients,
                  { color: colors.textSecondary, fontVariant: ['tabular-nums'] },
                ]}
              >
                {item.recipients > 0 ? `${item.recipients} recipients` : 'No recipients'}
              </ThemedText>
            </View>
            <ThemedText style={[s.commDate, { color: colors.textTertiary }]}>
              {item.sentDate || 'Not sent yet'}
            </ThemedText>
          </View>
        </View>
      )}
    />
  );

  // === Tab 9: Reports ===
  const renderReports = () => (
    <FlatList<PeopleReport>
      data={filteredReports}
      keyExtractor={(item) => item.id}
      contentContainerStyle={s.listContent}
      ListEmptyComponent={
        <EmptyState icon="chart.bar.fill" text="No reports found" colors={colors} />
      }
      renderItem={({ item }) => (
        <View style={[s.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.listCardRow}>
            <View style={[s.listIconCircle, { backgroundColor: accentColor + '15' }]}>
              <IconSymbol name="chart.bar.fill" size={16} color={accentColor} />
            </View>
            <View style={s.listCardInfo}>
              <View style={s.reportTopRow}>
                <ThemedText style={s.listCardTitle}>{item.name}</ThemedText>
                <FormatBadge format={item.format} />
              </View>
              <View style={s.reportMetaRow}>
                <View style={[s.badge, { backgroundColor: accentColor + '18' }]}>
                  <ThemedText style={[s.badgeText, { color: accentColor }]}>{item.type}</ThemedText>
                </View>
                <ThemedText style={[s.listCardSub, { color: colors.textTertiary }]}>
                  {item.generatedDate}
                </ThemedText>
              </View>
              <Pressable
                style={({ pressed }) => [
                  s.exportBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="square.and.arrow.up" size={12} color={accentColor} />
                <ThemedText style={[s.exportBtnText, { color: accentColor }]}>Export</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    />
  );

  // === Tab 10: Settings ===
  const renderSettings = () => (
    <View style={s.tabContent}>
      <ThemedText style={[s.settingsHeader, { color: colors.textSecondary }]}>
        People Settings
      </ThemedText>
      <View style={[s.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {data.settings.map((setting, idx) => (
          <React.Fragment key={setting.id}>
            {idx > 0 && (
              <View style={[s.settingsDivider, { backgroundColor: colors.divider }]} />
            )}
            <View style={s.settingsRow}>
              <View style={s.settingsTextCol}>
                <ThemedText style={s.settingsLabel}>{setting.label}</ThemedText>
                <ThemedText style={[s.settingsDesc, { color: colors.textTertiary }]}>
                  {setting.description}
                </ThemedText>
              </View>
              <Switch
                value={effectiveSettings[setting.id] ?? setting.enabled}
                onValueChange={() => handleSettingToggle(setting.id)}
                trackColor={{ false: colors.backgroundTertiary, true: accentColor + '60' }}
                thumbColor={
                  effectiveSettings[setting.id] ?? setting.enabled
                    ? accentColor
                    : colors.textTertiary
                }
              />
            </View>
          </React.Fragment>
        ))}
      </View>
    </View>
  );

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

        {/* Scope chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ flexGrow: 0 }}
          contentContainerStyle={s.scopeBar}
        >
          {COMP_PEOPLE_SCOPE_CHIPS.map((chip, i) => (
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
            placeholder="Search people..."
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

      {/* === Tab Nav === */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.tabBar}
        style={s.tabBarContainer}
      >
        {COMP_PEOPLE_TABS.map((tab) => (
          <Pressable
            key={tab.id}
            style={[
              s.tabPill,
              activeTab === tab.id
                ? { backgroundColor: accentColor }
                : { backgroundColor: colors.backgroundTertiary },
            ]}
            onPress={() => handleTabPress(tab.id)}
          >
            <ThemedText
              style={[
                s.tabPillText,
                { color: activeTab === tab.id ? '#000' : colors.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* === Tab Content === */}
      <View style={s.contentArea}>{renderTabContent()}</View>

      {/* === Staff Detail Bottom Sheet === */}
      <BottomSheet
        visible={staffDetailVisible}
        onClose={() => setStaffDetailVisible(false)}
        title={selectedStaff?.name ?? 'Staff Detail'}
        useModal
      >
        {selectedStaff && (
          <View style={s.detailSheet}>
            <View style={[s.detailAvatarLarge, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.detailAvatarText, { color: accentColor }]}>
                {selectedStaff.avatar}
              </ThemedText>
            </View>
            <ThemedText style={s.detailName}>{selectedStaff.name}</ThemedText>
            <StaffStatusBadge status={selectedStaff.status} />

            <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Role</ThemedText>
              <ThemedText style={s.detailValue}>{selectedStaff.role}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                Department
              </ThemedText>
              <ThemedText style={s.detailValue}>{selectedStaff.department}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Email</ThemedText>
              <ThemedText style={[s.detailValue, { color: accentColor }]}>
                {selectedStaff.email}
              </ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Phone</ThemedText>
              <ThemedText style={s.detailValue}>{selectedStaff.phone}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                Hire Date
              </ThemedText>
              <ThemedText style={s.detailValue}>{selectedStaff.hireDate}</ThemedText>
            </View>

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
                <ThemedText style={[s.detailActionText, { color: accentColor }]}>
                  Email
                </ThemedText>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  s.detailActionBtn,
                  { backgroundColor: accentColor + '15' },
                  pressed && { opacity: 0.7 },
                ]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="phone" size={16} color={accentColor} />
                <ThemedText style={[s.detailActionText, { color: accentColor }]}>Call</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Official Detail Bottom Sheet === */}
      <BottomSheet
        visible={officialDetailVisible}
        onClose={() => setOfficialDetailVisible(false)}
        title={selectedOfficial?.name ?? 'Official Detail'}
        useModal
      >
        {selectedOfficial && (
          <View style={s.detailSheet}>
            <View style={[s.detailAvatarLarge, { backgroundColor: accentColor + '25' }]}>
              <ThemedText style={[s.detailAvatarText, { color: accentColor }]}>
                {getInitials(selectedOfficial.name)}
              </ThemedText>
            </View>
            <ThemedText style={s.detailName}>{selectedOfficial.name}</ThemedText>
            <OfficialStatusBadge status={selectedOfficial.status} />

            <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                Certification
              </ThemedText>
              <ThemedText style={s.detailValue}>{selectedOfficial.certification}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Level</ThemedText>
              <LevelBadge level={selectedOfficial.level} />
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Sport</ThemedText>
              <ThemedText style={s.detailValue}>{selectedOfficial.sport}</ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                Matches
              </ThemedText>
              <ThemedText style={[s.detailValue, { fontVariant: ['tabular-nums'] }]}>
                {selectedOfficial.matchesOfficiated}
              </ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>Rating</ThemedText>
              <View style={s.officialRatingRow}>
                <ThemedText style={[s.ratingText, { color: '#F59E0B' }]}>
                  {renderStars(selectedOfficial.rating)}
                </ThemedText>
                <ThemedText style={[s.ratingNumber, { color: colors.text }]}>
                  {selectedOfficial.rating.toFixed(1)}
                </ThemedText>
              </View>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* === Entrant Roster Detail Bottom Sheet === */}
      <BottomSheet
        visible={rosterDetailVisible}
        onClose={() => setRosterDetailVisible(false)}
        title={selectedRoster?.entrantName ?? 'Roster Detail'}
        useModal
      >
        {selectedRoster && (
          <View style={s.detailSheet}>
            <ThemedText style={s.detailName}>{selectedRoster.entrantName}</ThemedText>

            <View style={[s.detailDivider, { backgroundColor: colors.divider }]} />

            <View style={s.rosterDetailGrid}>
              <View
                style={[
                  s.rosterDetailCard,
                  { backgroundColor: colors.backgroundTertiary },
                ]}
              >
                <ThemedText style={[s.rosterDetailNumber, { color: accentColor }]}>
                  {selectedRoster.playerCount}
                </ThemedText>
                <ThemedText style={[s.rosterDetailLabel, { color: colors.textSecondary }]}>
                  Players
                </ThemedText>
              </View>
              <View
                style={[
                  s.rosterDetailCard,
                  { backgroundColor: colors.backgroundTertiary },
                ]}
              >
                <ThemedText style={[s.rosterDetailNumber, { color: accentColor }]}>
                  {selectedRoster.coachCount}
                </ThemedText>
                <ThemedText style={[s.rosterDetailLabel, { color: colors.textSecondary }]}>
                  Coaches
                </ThemedText>
              </View>
              <View
                style={[
                  s.rosterDetailCard,
                  { backgroundColor: colors.backgroundTertiary },
                ]}
              >
                <ThemedText style={[s.rosterDetailNumber, { color: accentColor }]}>
                  {selectedRoster.staffCount}
                </ThemedText>
                <ThemedText style={[s.rosterDetailLabel, { color: colors.textSecondary }]}>
                  Staff
                </ThemedText>
              </View>
            </View>

            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                Total Personnel
              </ThemedText>
              <ThemedText style={[s.detailValue, { fontVariant: ['tabular-nums'] }]}>
                {selectedRoster.playerCount + selectedRoster.coachCount + selectedRoster.staffCount}
              </ThemedText>
            </View>
            <View style={s.detailRow}>
              <ThemedText style={[s.detailLabel, { color: colors.textSecondary }]}>
                Last Updated
              </ThemedText>
              <ThemedText style={s.detailValue}>{selectedRoster.lastUpdated}</ThemedText>
            </View>
          </View>
        )}
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

  // === Scope Chips ===
  scopeBar: {
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

  // === Tab Bar ===
  tabBarContainer: {
    flexGrow: 0,
    marginTop: Spacing.sm,
  },
  tabBar: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  tabPillText: {
    fontSize: 13,
    fontWeight: '500',
  },

  // === Content Area ===
  contentArea: {
    flex: 1,
    marginTop: Spacing.sm,
  },
  tabContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },

  // === Dashboard ===
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  dashboardCard: {
    flexBasis: '47%',
    flexGrow: 1,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'flex-start',
    gap: 4,
  },
  dashIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginTop: 4,
  },
  dashValue: {
    fontSize: 22,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  dashDelta: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // === Quick Stats ===
  quickStatsRow: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.md,
    padding: Spacing.md,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
  },
  quickStatDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginHorizontal: Spacing.sm,
  },
  quickStatLabel: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  quickStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 2,
  },

  // === List Cards ===
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
    fontWeight: '500',
    flex: 1,
  },
  listCardSub: {
    fontSize: 12,
  },
  listIconCircle: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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

  // === Staff ===
  staffTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  staffContactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  contactIcon: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hireDateText: {
    fontSize: 11,
    marginLeft: 'auto',
  },

  // === Officials ===
  officialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  officialMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  officialStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  officialStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  officialStatText: {
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  ratingText: {
    fontSize: 12,
    letterSpacing: 1,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  officialRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  // === Volunteers ===
  volunteerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  volunteerStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 4,
  },
  volunteerStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  volunteerStatText: {
    fontSize: 12,
  },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  skillTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  skillTagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  skillMore: {
    fontSize: 10,
    fontWeight: '500',
    alignSelf: 'center',
  },

  // === Entrant Rosters ===
  rosterTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  rosterName: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  rosterTotalBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  rosterTotalText: {
    fontSize: 12,
    fontWeight: '700',
  },
  rosterCountsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 6,
  },
  rosterCount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rosterCountText: {
    fontSize: 12,
  },
  rosterUpdated: {
    fontSize: 11,
    marginTop: 4,
  },

  // === Credentials ===
  credentialTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  credentialTypeRow: {
    flexDirection: 'row',
    marginTop: 2,
  },
  credentialDatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  credentialDate: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
  },

  // === Assignments ===
  assignmentDateStrip: {
    width: 48,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  assignmentDateText: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  assignmentTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  assignmentEvent: {
    fontSize: 12,
    marginTop: 2,
  },
  assignmentDateFull: {
    fontSize: 11,
    fontVariant: ['tabular-nums'],
    marginTop: 2,
  },

  // === Communications ===
  commTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  commSubject: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  commMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 4,
  },
  commRecipients: {
    fontSize: 12,
  },
  commDate: {
    fontSize: 11,
    marginTop: 2,
  },

  // === Reports ===
  reportTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  reportMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    marginTop: 4,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // === Settings ===
  settingsHeader: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingsTextCol: {
    flex: 1,
    marginRight: Spacing.sm,
    gap: 2,
  },
  settingsLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingsDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  settingsDivider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md,
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
  detailName: {
    fontSize: 18,
    fontWeight: '700',
  },
  detailDivider: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    alignSelf: 'stretch',
    paddingVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '600',
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

  // === Roster Detail ===
  rosterDetailGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignSelf: 'stretch',
    marginBottom: Spacing.sm,
  },
  rosterDetailCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  rosterDetailNumber: {
    fontSize: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  rosterDetailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginTop: 2,
  },
});
