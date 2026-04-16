/**
 * Business Hub — Clients screen. CEO only.
 * Client directory and relationship management.
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

type ClientStatus = 'Active' | 'Past';
type BizClient = { id: string; name: string; initials: string; contact: string; activeProjects: number; revenue: number; lastInteraction: string; status: ClientStatus };

const CLIENTS: BizClient[] = [
  { id: '1', name: 'Nike',                initials: 'NK', contact: 'Sarah Chen',     activeProjects: 2, revenue: 84000, lastInteraction: '2 days ago',  status: 'Active' },
  { id: '2', name: 'Gatorade',            initials: 'GT', contact: 'Marcus Johnson', activeProjects: 1, revenue: 42000, lastInteraction: '1 week ago',  status: 'Active' },
  { id: '3', name: 'Forbes',              initials: 'FB', contact: 'Alex Rivera',    activeProjects: 0, revenue: 28000, lastInteraction: '3 weeks ago', status: 'Past'   },
  { id: '4', name: 'Under Armour',        initials: 'UA', contact: 'Jordan Kim',     activeProjects: 0, revenue: 19500, lastInteraction: '2 months ago',status: 'Past'   },
  { id: '5', name: 'ESPN Digital',        initials: 'ES', contact: 'Taylor Brooks',  activeProjects: 1, revenue: 55000, lastInteraction: 'Yesterday',   status: 'Active' },
];

const FILTERS: (ClientStatus | 'All')[] = ['All', 'Active', 'Past'];

export default function BizClientsScreen() {
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
  const [filter, setFilter] = useState<ClientStatus | 'All'>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let items = CLIENTS;
    if (filter !== 'All') items = items.filter(c => c.status === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(c => c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q));
    }
    return items;
  }, [query, filter]);

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
              <Text style={[s.titlePillText, { color: C.label }]}>Clients</Text>
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
            placeholder="Search clients..."
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

        {/* Filter pills */}
        <View style={{ flexDirection: 'row', gap: 7, marginBottom: 16 }}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                style={[s.filterPill, active
                  ? { backgroundColor: C.activePill, borderColor: C.activePill }
                  : { backgroundColor: C.surface, borderColor: C.separator }
                ]}
                onPress={() => { Haptics.selectionAsync(); setFilter(f); }}
              >
                <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Client cards */}
        {filtered.map(client => (
          <Pressable
            key={client.id}
            style={({ pressed }) => [s.clientCard, { backgroundColor: C.surface, opacity: pressed ? 0.75 : 1 }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            {/* Avatar */}
            <View style={[s.avatar, { backgroundColor: C.separator }]}>
              <Text style={[s.avatarText, { color: C.label }]}>{client.initials}</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={[s.clientName, { color: C.label }]}>{client.name}</Text>
                {client.status === 'Past' && (
                  <View style={[s.pastBadge, { backgroundColor: C.separator }]}>
                    <Text style={[s.pastBadgeText, { color: C.secondary }]}>Past</Text>
                  </View>
                )}
              </View>
              <Text style={[s.contactName, { color: C.secondary }]}>{client.contact}</Text>
              <View style={s.statsRow}>
                <Text style={[s.stat, { color: C.secondary }]}>
                  <Text style={{ color: client.activeProjects > 0 ? GAIN : C.secondary, fontWeight: '700' }}>{client.activeProjects}</Text>
                  {' '}active
                </Text>
                <Text style={[s.statDot, { color: C.secondary }]}>·</Text>
                <Text style={[s.stat, { color: C.secondary }]}>
                  <Text style={{ color: C.label, fontWeight: '700' }}>${client.revenue.toLocaleString()}</Text>
                  {' '}revenue
                </Text>
                <Text style={[s.statDot, { color: C.secondary }]}>·</Text>
                <Text style={[s.stat, { color: C.secondary }]}>{client.lastInteraction}</Text>
              </View>
            </View>

            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
        ))}

        {filtered.length === 0 && (
          <View style={s.emptyState}>
            <Text style={[s.emptyText, { color: C.secondary }]}>No clients found</Text>
          </View>
        )}

        {/* Add Client */}
        <Pressable
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, opacity: pressed ? 0.6 : 1 })}
        >
          <IconSymbol name="plus.circle" size={18} color={C.secondary} />
          <Text style={{ fontSize: 14, color: C.secondary }}>Add Client</Text>
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
  clientCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: '800' },
  clientName: { fontSize: 15, fontWeight: '700' },
  contactName: { fontSize: 12, marginTop: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 5 },
  stat: { fontSize: 12 },
  statDot: { fontSize: 12 },
  pastBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  pastBadgeText: { fontSize: 10, fontWeight: '600' },
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: { fontSize: 14 },
});
