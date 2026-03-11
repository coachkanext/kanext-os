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

import { useColors, type ComponentColors } from '@/hooks/use-colors';
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

// ─── Resource Category data ─────────────────────────────────────────────────

const RESOURCE_CATEGORIES: { key: ResourceCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'facilities', label: 'Facilities' },
  { key: 'documents', label: 'Documents' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'assets', label: 'Assets' },
];

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ModeScreen() {
  const insets = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode = state.mode;
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);

  const [pageIndex, setPageIndex] = useState(0);
  const [menuData, setMenuData] = useState<ContextMenuData | null>(null);
  const [deptFilter, setDeptFilter] = useState('All');
  const [resourceFilter, setResourceFilter] = useState<ResourceCategory>('all');

  // Compliance color map (derived from C)
  const COMPLIANCE_COLORS = useMemo(() => ({
    compliant: C.green,
    warning: C.amber,
    overdue: C.red,
  }), [C]);

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
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Dashboard</Text>
            </View>
          </View>
          <ScrollView
            style={s.pageScroll}
            contentContainerStyle={{ paddingBottom: 100 }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {/* Org Header */}
            <View style={s.orgHeader}>
              <Text style={s.orgName}>{orgName}</Text>
              <Text style={s.orgMeta}>{orgLocation} · {roleBadge}</Text>
              <Text style={s.orgCycle}>{cycleName}</Text>
            </View>

            {/* Finance Card */}
            {(() => {
              const { finance } = dashboard;
              const trendIcon = finance.trend === 'up' ? 'arrow.up.right' : finance.trend === 'down' ? 'arrow.down.right' : 'arrow.right';
              const trendColor = finance.trend === 'up' ? C.green : finance.trend === 'down' ? C.red : C.muted;
              return (
                <View style={s.card}>
                  <View style={s.cardHeader}>
                    <Text style={s.cardTitle}>Finance</Text>
                    <IconSymbol name={trendIcon as any} size={14} color={trendColor} />
                  </View>
                  <View style={s.financeRow}>
                    <View style={s.financeStat}>
                      <Text style={s.financeValue}>{finance.revenue}</Text>
                      <Text style={s.financeLabel}>Revenue</Text>
                    </View>
                    <View style={s.financeStat}>
                      <Text style={s.financeValue}>{finance.expenses}</Text>
                      <Text style={s.financeLabel}>Expenses</Text>
                    </View>
                    <View style={s.financeStat}>
                      <Text style={[s.financeValue, { color: C.green }]}>{finance.balance}</Text>
                      <Text style={s.financeLabel}>Balance</Text>
                    </View>
                  </View>
                </View>
              );
            })()}

            {/* Compliance Card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Compliance</Text>
              {dashboard.compliance.map((item, idx) => (
                <View key={item.id} style={[s.complianceRow, idx < dashboard.compliance.length - 1 && s.complianceRowBorder]}>
                  <View style={[s.complianceDot, { backgroundColor: COMPLIANCE_COLORS[item.status] }]} />
                  <Text style={s.complianceLabel}>{item.label}</Text>
                  <Text style={[s.complianceStatus, { color: COMPLIANCE_COLORS[item.status] }]}>
                    {item.status === 'compliant' ? 'OK' : item.status === 'warning' ? 'Warning' : 'Overdue'}
                  </Text>
                </View>
              ))}
            </View>

            {/* Announcements */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Announcements</Text>
            </View>
            {dashboard.announcements.map((a, idx) => (
              <View key={a.id}>
                {idx > 0 && <View style={s.separator} />}
                <View style={s.row}>
                  <View style={s.avatar}>
                    <Text style={s.avatarInitials}>{a.authorInitials}</Text>
                  </View>
                  <View style={s.rowContent}>
                    <Text style={s.rowName} numberOfLines={1}>{a.title}</Text>
                    <Text style={s.rowPreview} numberOfLines={1}>{a.preview}</Text>
                  </View>
                  <Text style={s.rowTimestamp}>{a.timestamp}</Text>
                </View>
              </View>
            ))}

            {/* Deadlines */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Deadlines</Text>
            </View>
            {dashboard.deadlines.map((d, idx) => (
              <View key={d.id}>
                {idx > 0 && <View style={s.separator} />}
                <View style={s.row}>
                  <View style={[s.urgencyDot, { backgroundColor: d.urgent ? C.red : C.muted }]} />
                  <View style={s.rowContent}>
                    <Text style={s.rowName} numberOfLines={1}>{d.title}</Text>
                    <Text style={s.rowPreview}>{d.category}</Text>
                  </View>
                  <Text style={[s.rowTimestamp, d.urgent && { color: C.red }]}>{d.dueDate}</Text>
                </View>
              </View>
            ))}

            {/* Activity */}
            <View style={s.sectionHeader}>
              <Text style={s.sectionTitle}>Activity</Text>
            </View>
            {dashboard.activity.map((a, idx) => (
              <View key={a.id}>
                {idx > 0 && <View style={s.separator} />}
                <View style={s.row}>
                  <View style={s.activityIcon}>
                    <IconSymbol name={a.icon as any} size={16} color={C.secondary} />
                  </View>
                  <View style={s.rowContent}>
                    <Text style={s.rowName} numberOfLines={1}>{a.title}</Text>
                    <Text style={s.rowPreview} numberOfLines={1}>{a.description}</Text>
                  </View>
                  <Text style={s.rowTimestamp}>{a.timestamp}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* ── PAGE 1: PEOPLE ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>People</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterRow}
            >
              {['All', ...departments].map((d) => {
                const isActive = deptFilter === d;
                return (
                  <Pressable
                    key={d}
                    style={[s.filterPill, isActive && s.filterPillActive]}
                    onPress={() => setDeptFilter(d)}
                  >
                    <Text style={[s.filterText, isActive && s.filterTextActive]}>{d}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
                    <Pressable
                      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                      onPress={() => {}}
                      onLongPress={(e) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        longPressPerson(person, e.nativeEvent.pageY);
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
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              console.log('Add person');
            }}
          >
            <IconSymbol name="plus" size={24} color={C.label} />
          </Pressable>
        </View>

        {/* ── PAGE 2: RESOURCES ── */}
        <View style={{ flex: 1 }}>
          <View style={{ paddingTop: 16 }}>
            <View style={s.topBar}>
              <Text style={s.topBarTitle}>Resources</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.filterRow}
            >
              {RESOURCE_CATEGORIES.map((c) => {
                const isActive = resourceFilter === c.key;
                return (
                  <Pressable
                    key={c.key}
                    style={[s.filterPill, isActive && s.filterPillActive]}
                    onPress={() => setResourceFilter(c.key)}
                  >
                    <Text style={[s.filterText, isActive && s.filterTextActive]}>{c.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
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
              filteredResources.map((resource, idx) => {
                const statusColor = resource.status === 'available' ? C.green : resource.status === 'in-use' ? C.amber : C.red;
                const statusLabel = resource.status === 'available' ? 'Available' : resource.status === 'in-use' ? 'In Use' : 'Maintenance';
                return (
                  <View key={resource.id}>
                    {idx > 0 && <View style={s.separator} />}
                    <Pressable
                      style={({ pressed }) => [s.row, pressed && s.rowPressed]}
                      onPress={() => {}}
                      onLongPress={(e) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        longPressResource(resource, e.nativeEvent.pageY);
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
                  </View>
                );
              })
            )}
          </ScrollView>

          {/* FAB: Add Resource */}
          <Pressable
            style={({ pressed }) => [s.fab, pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              console.log('Add resource');
            }}
          >
            <IconSymbol name="plus" size={24} color={C.label} />
          </Pressable>
        </View>
      </SwipeablePages>

      {/* Long-press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

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
    color: C.bg,
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
    backgroundColor: C.green,
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
    backgroundColor: C.surface,
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
    backgroundColor: C.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
