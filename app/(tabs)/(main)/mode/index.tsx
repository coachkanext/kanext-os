/**
 * Mode — 3-page swipeable layout. Footer icon position 5. Mode-aware data.
 * Page 0 (default): Dashboard — org header, finance, compliance, announcements, deadlines, activity.
 * Page 1: People — department filter pills, grouped people list, FAB.
 * Page 2: Resources — resource category pills, filtered list, FAB.
 * 3 dots at top. Swipe right on page 0 = side panel.
 * FAB on pages 1 and 2.
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
import { useAppContext } from '@/context/app-context';
import {
  getDashboardByMode,
  getPeopleByMode,
  getDepartmentsByMode,
  getResourcesByMode,
  type OrgPerson,
  type OrgResource,
  type ResourceCategory,
} from '@/data/mock-mode';
import { openSidePanel } from '@/utils/global-side-panel';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

const C = {
  bg: '#000000',
  surface: '#0B0F14',
  label: '#FFFFFF',
  secondary: '#A1A1AA',
  muted: '#52525B',
  separator: 'rgba(255,255,255,0.08)',
  online: '#34C759',
  blueSteel: '#3B82F6',
  green: '#22C55E',
  amber: '#F59E0B',
  red: '#EF4444',
};

// ─── Page Top Bar ────────────────────────────────────────────────────────────

function PageTopBar({ title }: { title: string }) {
  return (
    <View style={s.topBar}>
      <Text style={s.topBarTitle}>{title}</Text>
    </View>
  );
}

// ─── Department Pills (Page 1) ──────────────────────────────────────────────

function DepartmentPills({
  departments,
  active,
  onSelect,
}: {
  departments: string[];
  active: string;
  onSelect: (d: string) => void;
}) {
  const all = ['All', ...departments];
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {all.map((d) => {
        const isActive = active === d;
        return (
          <Pressable
            key={d}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(d)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{d}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Resource Category Pills (Page 2) ───────────────────────────────────────

const RESOURCE_CATEGORIES: { key: ResourceCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'documents', label: 'Documents' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'assets', label: 'Assets' },
];

function ResourceCategoryPills({
  active,
  onSelect,
}: {
  active: ResourceCategory;
  onSelect: (c: ResourceCategory) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={s.filterRow}
    >
      {RESOURCE_CATEGORIES.map((c) => {
        const isActive = active === c.key;
        return (
          <Pressable
            key={c.key}
            style={[s.filterPill, isActive && s.filterPillActive]}
            onPress={() => onSelect(c.key)}
          >
            <Text style={[s.filterText, isActive && s.filterTextActive]}>{c.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

// ─── Org Header ──────────────────────────────────────────────────────────────

function OrgHeader({ orgName, location, role, cycle }: {
  orgName: string;
  location: string;
  role: string;
  cycle: string;
}) {
  return (
    <View style={s.orgHeader}>
      <Text style={s.orgName}>{orgName}</Text>
      <Text style={s.orgMeta}>{location} · {role}</Text>
      <Text style={s.orgCycle}>{cycle}</Text>
    </View>
  );
}

// ─── Finance Card ────────────────────────────────────────────────────────────

function FinanceCard({ revenue, expenses, balance, trend }: {
  revenue: string; expenses: string; balance: string; trend: 'up' | 'down' | 'flat';
}) {
  const trendIcon = trend === 'up' ? 'arrow.up.right' : trend === 'down' ? 'arrow.down.right' : 'arrow.right';
  const trendColor = trend === 'up' ? C.green : trend === 'down' ? C.red : C.muted;
  return (
    <View style={s.card}>
      <View style={s.cardHeader}>
        <Text style={s.cardTitle}>Finance</Text>
        <IconSymbol name={trendIcon as any} size={14} color={trendColor} />
      </View>
      <View style={s.financeRow}>
        <View style={s.financeStat}>
          <Text style={s.financeValue}>{revenue}</Text>
          <Text style={s.financeLabel}>Revenue</Text>
        </View>
        <View style={s.financeStat}>
          <Text style={s.financeValue}>{expenses}</Text>
          <Text style={s.financeLabel}>Expenses</Text>
        </View>
        <View style={s.financeStat}>
          <Text style={[s.financeValue, { color: C.green }]}>{balance}</Text>
          <Text style={s.financeLabel}>Balance</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Compliance Card ─────────────────────────────────────────────────────────

const COMPLIANCE_COLORS = { compliant: C.green, warning: C.amber, overdue: C.red };

function ComplianceCard({ items }: { items: { id: string; label: string; status: 'compliant' | 'warning' | 'overdue' }[] }) {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>Compliance</Text>
      {items.map((item, idx) => (
        <View key={item.id} style={[s.complianceRow, idx < items.length - 1 && s.complianceRowBorder]}>
          <View style={[s.complianceDot, { backgroundColor: COMPLIANCE_COLORS[item.status] }]} />
          <Text style={s.complianceLabel}>{item.label}</Text>
          <Text style={[s.complianceStatus, { color: COMPLIANCE_COLORS[item.status] }]}>
            {item.status === 'compliant' ? 'OK' : item.status === 'warning' ? 'Warning' : 'Overdue'}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Announcement Row ────────────────────────────────────────────────────────

function AnnouncementRow({ title, preview, timestamp, authorInitials }: {
  title: string; preview: string; timestamp: string; authorInitials: string;
}) {
  return (
    <View style={s.row}>
      <View style={s.avatar}>
        <Text style={s.avatarInitials}>{authorInitials}</Text>
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{title}</Text>
        <Text style={s.rowPreview} numberOfLines={1}>{preview}</Text>
      </View>
      <Text style={s.rowTimestamp}>{timestamp}</Text>
    </View>
  );
}

// ─── Deadline Row ────────────────────────────────────────────────────────────

function DeadlineRow({ title, dueDate, category, urgent }: {
  title: string; dueDate: string; category: string; urgent: boolean;
}) {
  return (
    <View style={s.row}>
      <View style={[s.urgencyDot, { backgroundColor: urgent ? C.red : C.muted }]} />
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{title}</Text>
        <Text style={s.rowPreview}>{category}</Text>
      </View>
      <Text style={[s.rowTimestamp, urgent && { color: C.red }]}>{dueDate}</Text>
    </View>
  );
}

// ─── Activity Row ────────────────────────────────────────────────────────────

function ActivityRow({ title, description, timestamp, icon }: {
  title: string; description: string; timestamp: string; icon: string;
}) {
  return (
    <View style={s.row}>
      <View style={s.activityIcon}>
        <IconSymbol name={icon as any} size={16} color={C.secondary} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{title}</Text>
        <Text style={s.rowPreview} numberOfLines={1}>{description}</Text>
      </View>
      <Text style={s.rowTimestamp}>{timestamp}</Text>
    </View>
  );
}

// ─── Person Row ──────────────────────────────────────────────────────────────

function PersonRow({
  person,
  onPress,
  onLongPress,
}: {
  person: OrgPerson;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onPress={onPress}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.personAvatar}>
        <Text style={s.personInitials}>{person.initials}</Text>
        {person.online && <View style={s.onlineDot} />}
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{person.name}</Text>
        <Text style={s.personRole}>{person.role}</Text>
      </View>
      <View style={s.deptBadge}>
        <Text style={s.deptBadgeText}>{person.department}</Text>
      </View>
    </Pressable>
  );
}

// ─── Resource Row ────────────────────────────────────────────────────────────

function ResourceRow({
  resource,
  onPress,
  onLongPress,
}: {
  resource: OrgResource;
  onPress: () => void;
  onLongPress: (pageY: number) => void;
}) {
  const statusColor = resource.status === 'available' ? C.green : resource.status === 'in-use' ? C.amber : C.red;
  const statusLabel = resource.status === 'available' ? 'Available' : resource.status === 'in-use' ? 'In Use' : 'Maintenance';
  return (
    <Pressable
      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
      onPress={onPress}
      onLongPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onLongPress(e.nativeEvent.pageY);
      }}
      delayLongPress={400}
    >
      <View style={s.resourceIcon}>
        <IconSymbol name={resource.icon as any} size={18} color={C.label} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowName} numberOfLines={1}>{resource.name}</Text>
        <Text style={s.rowPreview} numberOfLines={1}>{resource.description}</Text>
      </View>
      <View style={[s.statusBadge, { backgroundColor: statusColor + '22' }]}>
        <Text style={[s.statusBadgeText, { color: statusColor }]}>{statusLabel}</Text>
      </View>
    </Pressable>
  );
}

// ─── FAB ─────────────────────────────────────────────────────────────────────

function FAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress();
      }}
    >
      <IconSymbol name="plus" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ModeScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = state.mode;

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [deptFilter, setDeptFilter] = useState('All');
  const [resourceFilter, setResourceFilter] = useState<ResourceCategory>('all');

  // ── Data ──
  const dashboard = useMemo(() => getDashboardByMode(mode), [mode]);
  const departments = useMemo(() => getDepartmentsByMode(mode), [mode]);
  const allPeople = useMemo(() => getPeopleByMode(mode), [mode]);
  const allResources = useMemo(() => getResourcesByMode(mode), [mode]);

  // Filter people by department
  const filteredPeople = useMemo(() => {
    if (deptFilter === 'All') return allPeople;
    return allPeople.filter((p) => p.department === deptFilter);
  }, [allPeople, deptFilter]);

  // Group people by department
  const groupedPeople = useMemo(() => {
    const map: Record<string, OrgPerson[]> = {};
    for (const p of filteredPeople) {
      if (!map[p.department]) map[p.department] = [];
      map[p.department].push(p);
    }
    return Object.entries(map);
  }, [filteredPeople]);

  // Filter resources by category
  const filteredResources = useMemo(() => {
    if (resourceFilter === 'all') return allResources;
    return allResources.filter((r) => r.category === resourceFilter);
  }, [allResources, resourceFilter]);

  // ── Scroll footer hide ──
  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  // ── Long press: People ──
  const longPressPerson = useCallback((person: OrgPerson, pageY: number) => {
    setMenuData({
      title: person.name,
      subtitle: `${person.department} · ${person.role}`,
      initials: person.initials,
      pageY,
      actions: [
        { key: 'message', label: 'Message', icon: 'bubble.left.fill' },
        { key: 'audio', label: 'Audio Call', icon: 'phone.fill' },
        { key: 'video', label: 'Video Call', icon: 'video.fill' },
        { key: 'profile', label: 'View Profile', icon: 'person.fill' },
        { key: 'role', label: 'Change Role', icon: 'pencil' },
        { key: 'remove', label: 'Remove from Org', icon: 'trash.fill', destructive: true },
      ],
      onAction: (_key) => {
        // Placeholder — actions deferred
      },
    });
  }, []);

  // ── Long press: Resources ──
  const longPressResource = useCallback((resource: OrgResource, pageY: number) => {
    setMenuData({
      title: resource.name,
      subtitle: resource.description,
      initials: resource.icon ? undefined : resource.name.substring(0, 2).toUpperCase(),
      isSquircle: true,
      pageY,
      actions: [
        { key: 'view', label: 'View Details', icon: 'eye.fill' },
        { key: 'edit', label: 'Edit', icon: 'pencil' },
        { key: 'share', label: 'Share', icon: 'square.and.arrow.up' },
        { key: 'archive', label: 'Archive', icon: 'archivebox.fill', destructive: true },
      ],
      onAction: (_key) => {
        // Placeholder — actions deferred
      },
    });
  }, []);

  // ── Context values ──
  const orgName = state.organization?.name ?? 'Organization';
  const orgLocation = state.organization?.location ?? '';
  const roleBadge = state.activeView?.derived_role_badge ?? state.operatingRole;
  const cycleName = state.cycle?.name ?? '';

  return (
    <View style={[s.container, { paddingTop: insets.top }]}>
      {/* 3-page swipeable: Dashboard | People | Resources */}
      <SwipeablePages
        activeIndex={pageIndex}
        onPageChange={setPageIndex}
        onEdgeRight={openSidePanel}
      >
        {/* ── PAGE 0: DASHBOARD ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Dashboard" />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Org Header */}
            <OrgHeader orgName={orgName} location={orgLocation} role={roleBadge} cycle={cycleName} />

            {/* Finance Card */}
            <FinanceCard
              revenue={dashboard.finance.revenue}
              expenses={dashboard.finance.expenses}
              balance={dashboard.finance.balance}
              trend={dashboard.finance.trend}
            />

            {/* Compliance Card */}
            <ComplianceCard items={dashboard.compliance} />

            {/* Announcements */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Announcements</Text>
            </View>
            {dashboard.announcements.map((a, idx) => (
              <View key={a.id}>
                {idx > 0 && <View style={s.separator} />}
                <AnnouncementRow
                  title={a.title}
                  preview={a.preview}
                  timestamp={a.timestamp}
                  authorInitials={a.authorInitials}
                />
              </View>
            ))}

            {/* Deadlines */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Deadlines</Text>
            </View>
            {dashboard.deadlines.map((d, idx) => (
              <View key={d.id}>
                {idx > 0 && <View style={s.separator} />}
                <DeadlineRow
                  title={d.title}
                  dueDate={d.dueDate}
                  category={d.category}
                  urgent={d.urgent}
                />
              </View>
            ))}

            {/* Activity */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Activity</Text>
            </View>
            {dashboard.activity.map((a, idx) => (
              <View key={a.id}>
                {idx > 0 && <View style={s.separator} />}
                <ActivityRow
                  title={a.title}
                  description={a.description}
                  timestamp={a.timestamp}
                  icon={a.icon}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: PEOPLE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="People" />
            <DepartmentPills departments={departments} active={deptFilter} onSelect={setDeptFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {groupedPeople.map(([dept, people]) => (
              <View key={dept}>
                <View style={s.deptHeader}>
                  <Text style={s.deptHeaderText}>{dept}</Text>
                </View>
                {people.map((person, i) => (
                  <View key={person.id}>
                    {i > 0 && <View style={s.separator} />}
                    <PersonRow
                      person={person}
                      onPress={() => {}}
                      onLongPress={(pageY) => longPressPerson(person, pageY)}
                    />
                  </View>
                ))}
              </View>
            ))}
            {filteredPeople.length === 0 && (
              <View style={s.emptyState}>
                <IconSymbol name="person.3.fill" size={36} color={C.muted} />
                <Text style={s.emptyText}>No people in this department</Text>
              </View>
            )}
          </ScrollView>

          {/* FAB: Add Person */}
          <FAB onPress={() => console.log('Add person')} />
        </View>

        {/* ── PAGE 2: RESOURCES ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <PageTopBar title="Resources" />
            <ResourceCategoryPills active={resourceFilter} onSelect={setResourceFilter} />
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {filteredResources.length === 0 ? (
              <View style={s.emptyState}>
                <IconSymbol name="shippingbox.fill" size={36} color={C.muted} />
                <Text style={s.emptyText}>No resources</Text>
              </View>
            ) : (
              filteredResources.map((resource, idx) => (
                <View key={resource.id}>
                  {idx > 0 && <View style={s.separator} />}
                  <ResourceRow
                    resource={resource}
                    onPress={() => {}}
                    onLongPress={(pageY) => longPressResource(resource, pageY)}
                  />
                </View>
              ))
            )}
          </ScrollView>

          {/* FAB: Add Resource */}
          <FAB onPress={() => console.log('Add resource')} />
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
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

  // Org Header
  orgHeader: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  orgName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.label,
  },
  orgMeta: {
    fontSize: 14,
    color: C.secondary,
    marginTop: 4,
  },
  orgCycle: {
    fontSize: 13,
    color: C.muted,
    marginTop: 2,
  },

  // Cards
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: C.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.label,
  },

  // Finance
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeStat: {
    alignItems: 'center',
    flex: 1,
  },
  financeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: C.label,
  },
  financeLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
  },

  // Compliance
  complianceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  complianceRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.separator,
  },
  complianceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  complianceLabel: {
    flex: 1,
    fontSize: 14,
    color: C.label,
  },
  complianceStatus: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Section headers
  sectionHeader: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: C.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
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
  rowPreview: { fontSize: 13, color: C.muted, marginTop: 1 },
  rowTimestamp: { fontSize: 11, color: C.muted },

  // Avatars
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: { fontSize: 14, fontWeight: '700', color: C.secondary },

  // Urgency dot (deadlines)
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Activity icon
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Person row
  personAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  personInitials: { fontSize: 14, fontWeight: '600', color: C.label },
  personRole: { fontSize: 13, color: C.muted, marginTop: 1 },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: C.online,
    borderWidth: 2,
    borderColor: C.bg,
  },

  // Department badge
  deptBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  deptBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: C.muted,
  },

  // Department headers (People page)
  deptHeader: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 4,
    backgroundColor: C.bg,
  },
  deptHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.secondary,
  },

  // Resource row
  resourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Status badge
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Separator
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 72 },

  // Empty state
  emptyState: { alignItems: 'center', paddingTop: 120, gap: 12 },
  emptyText: { fontSize: 16, color: C.muted },

  // FAB
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: C.blueSteel,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
