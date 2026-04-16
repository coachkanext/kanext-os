/**
 * Business Hub — Team screen. CEO only.
 * Company directory: who's doing what.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type MemberStatus = 'Available' | 'Busy' | 'Out';
type TeamMember = { id: string; name: string; initials: string; role: string; department: string; projects: string[]; status: MemberStatus };

const TEAM: TeamMember[] = [
  { id: '1', name: 'Jordan Davis',   initials: 'JD', role: 'CEO',               department: 'Executive',   projects: ['KaNeXT OS v2.0 Launch', 'Nike Partnership Deck'], status: 'Busy'      },
  { id: '2', name: 'Alex Rivera',    initials: 'AR', role: 'Creative Director',  department: 'Design',      projects: ['Brand Identity Refresh', 'Coaching App Integration'], status: 'Available' },
  { id: '3', name: 'Maya Kim',       initials: 'MK', role: 'Data Analyst',       department: 'Analytics',   projects: ['Q1 Analytics Report'],                             status: 'Available' },
  { id: '4', name: 'Luis Martinez',  initials: 'LM', role: 'Product Manager',    department: 'Product',     projects: ['Nike Partnership Deck', 'Q1 Analytics Report'],    status: 'Busy'      },
  { id: '5', name: 'Casey Brooks',   initials: 'CB', role: 'Engineer',           department: 'Engineering', projects: ['KaNeXT OS v2.0 Launch'],                           status: 'Available' },
  { id: '6', name: 'Dana Okafor',    initials: 'DO', role: 'Account Manager',    department: 'Sales',       projects: [],                                                  status: 'Out'       },
];

const STATUS_COLORS: Record<MemberStatus, string> = {
  Available: GAIN,
  Busy:      CAUTION,
  Out:       HEAT,
};

const DEPT_FILTERS = ['All', 'Executive', 'Design', 'Analytics', 'Product', 'Engineering', 'Sales'] as const;
type DeptFilter = typeof DEPT_FILTERS[number];

export default function BizTeamScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/hub/business' as any);
  }, [isCEO]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [query, setQuery]   = useState('');
  const [dept, setDept]     = useState<DeptFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let items = TEAM;
    if (dept !== 'All') items = items.filter(m => m.department === dept);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    }
    return items;
  }, [query, dept]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Team</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator, marginBottom: 12 }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search team..."
            placeholderTextColor={C.secondary}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={15} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {/* Dept filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 7 }}>
          {DEPT_FILTERS.map(f => {
            const active = dept === f;
            return (
              <Pressable
                key={f}
                style={[s.filterPill, active
                  ? { backgroundColor: C.activePill, borderColor: C.activePill }
                  : { backgroundColor: C.surface, borderColor: C.separator }
                ]}
                onPress={() => { Haptics.selectionAsync(); setDept(f); }}
              >
                <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Team cards */}
        {filtered.map(member => {
          const statusColor = STATUS_COLORS[member.status];
          return (
            <Pressable
              key={member.id}
              style={({ pressed }) => [s.memberCard, { backgroundColor: C.surface, opacity: pressed ? 0.75 : 1 }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <View style={[s.avatar, { backgroundColor: C.separator }]}>
                <Text style={[s.avatarText, { color: C.label }]}>{member.initials}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[s.memberName, { color: C.label }]}>{member.name}</Text>
                  <View style={[s.statusDot, { backgroundColor: statusColor }]} />
                  <Text style={[s.statusText, { color: statusColor }]}>{member.status}</Text>
                </View>
                <Text style={[s.memberRole, { color: C.secondary }]}>{member.role} · {member.department}</Text>
                {member.projects.length > 0 && (
                  <Text style={[s.projectsText, { color: C.secondary }]} numberOfLines={1}>
                    {member.projects.join(', ')}
                  </Text>
                )}
              </View>

              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>
          );
        })}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Text style={[s.emptyText, { color: C.secondary }]}>No team members found</Text>
          </View>
        )}

        {/* Invite */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, opacity: pressed ? 0.6 : 1 })}
        >
          <IconSymbol name="person.badge.plus" size={18} color={C.secondary} />
          <Text style={{ fontSize: 14, color: C.secondary }}>Invite Member</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  searchInput: { flex: 1, fontSize: 15, padding: 0 },
  filterPill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: '800' },
  memberName: { fontSize: 15, fontWeight: '700' },
  memberRole: { fontSize: 12, marginTop: 2 },
  projectsText: { fontSize: 11, marginTop: 3 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: '600' },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
