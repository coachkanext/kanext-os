/**
 * Business Hub — Projects screen.
 * CEO: all projects, filter pills, ⋯ actions, New Project.
 * Client: only their projects + Approve/Request Changes deliverables.
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
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

type ProjectStatus = 'Active' | 'On Hold' | 'Completed';
type BizProject = { id: string; name: string; client: string; status: ProjectStatus; progress: number; dueDate: string; members: string[] };

const ALL_PROJECTS: BizProject[] = [
  { id: '1', name: 'KaNeXT OS v2.0 Launch',     client: 'Internal',  status: 'Active',    progress: 72,  dueDate: 'May 15', members: ['JD','AR','MK'] },
  { id: '2', name: 'Nike Partnership Deck',      client: 'Nike',      status: 'Active',    progress: 45,  dueDate: 'Apr 28', members: ['JD','LM'] },
  { id: '3', name: 'Brand Identity Refresh',     client: 'Gatorade',  status: 'On Hold',   progress: 30,  dueDate: 'Jun 1',  members: ['AR'] },
  { id: '4', name: 'Q1 Analytics Report',        client: 'Forbes',    status: 'Completed', progress: 100, dueDate: 'Mar 31', members: ['MK','LM'] },
  { id: '5', name: 'Coaching App Integration',   client: 'Nike',      status: 'Active',    progress: 58,  dueDate: 'May 30', members: ['JD','AR'] },
];

const CLIENT_PROJECTS = ALL_PROJECTS.filter(p => p.client === 'Nike');

const CLIENT_DELIVERABLES = [
  { id: 'a', label: 'Creative Brief v2' },
  { id: 'b', label: 'Brand Guidelines PDF' },
];

const FILTERS: ('All' | ProjectStatus)[] = ['All', 'Active', 'On Hold', 'Completed'];

function statusStyle(status: ProjectStatus, C: ComponentColors) {
  if (status === 'Active')   return { bg: GAIN + '28',    text: GAIN    };
  if (status === 'On Hold')  return { bg: CAUTION + '28', text: CAUTION };
  return { bg: C.separator, text: C.secondary };
}

export default function BizProjectsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO  = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [filter, setFilter] = useState<'All' | ProjectStatus>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const projects = isCEO ? ALL_PROJECTS : CLIENT_PROJECTS;
  const filtered = useMemo(() => {
    if (filter === 'All') return projects;
    return projects.filter(p => p.status === filter);
  }, [projects, filter]);

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
              <Text style={[s.titlePillText, { color: C.label }]}>Projects</Text>
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
      >
        {/* CEO filter pills */}
        {isCEO && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }} contentContainerStyle={{ gap: 7 }}>
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
          </ScrollView>
        )}

        {/* Project cards */}
        {filtered.map(item => {
          const sc = statusStyle(item.status, C);
          return (
            <View key={item.id} style={[s.card, { backgroundColor: C.surface }]}>
              {/* Card header */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={[s.cardTitle, { color: C.label }]}>{item.name}</Text>
                  {isCEO && <Text style={[s.cardClient, { color: C.secondary }]}>{item.client}</Text>}
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={[s.statusPill, { backgroundColor: sc.bg }]}>
                    <Text style={[s.statusText, { color: sc.text }]}>{item.status}</Text>
                  </View>
                  {isCEO && (
                    <Pressable hitSlop={8} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
                      <IconSymbol name="ellipsis" size={15} color={C.secondary} />
                    </Pressable>
                  )}
                </View>
              </View>

              {/* Progress bar */}
              <View style={{ height: 4, backgroundColor: C.separator, borderRadius: 2, marginTop: 12 }}>
                <View style={{ height: 4, width: `${item.progress}%`, backgroundColor: item.progress === 100 ? GAIN : C.label, borderRadius: 2 }} />
              </View>

              {/* Footer */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                <Text style={[s.dueText, { color: C.secondary }]}>Due {item.dueDate} · {item.progress}%</Text>
                <View style={{ flexDirection: 'row', gap: 4 }}>
                  {item.members.map(m => (
                    <View key={m} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: C.label }}>{m}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Client: deliverables */}
              {!isCEO && (
                <View style={[s.delivSection, { borderTopColor: C.separator }]}>
                  <Text style={[s.delivHeader, { color: C.secondary }]}>Deliverables</Text>
                  {CLIENT_DELIVERABLES.map(d => (
                    <View key={d.id} style={s.delivRow}>
                      <Text style={[s.delivLabel, { color: C.label }]} numberOfLines={1}>{d.label}</Text>
                      <View style={{ flexDirection: 'row', gap: 6 }}>
                        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={[s.delivBtn, { backgroundColor: GAIN + '28' }]}>
                          <Text style={[s.delivBtnText, { color: GAIN }]}>Approve</Text>
                        </Pressable>
                        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)} style={[s.delivBtn, { backgroundColor: HEAT + '28' }]}>
                          <Text style={[s.delivBtnText, { color: HEAT }]}>Request Changes</Text>
                        </Pressable>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* CEO: New Project */}
        {isCEO && (
          <Pressable
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
            style={({ pressed }) => [s.newProjectRow, { backgroundColor: C.surface, opacity: pressed ? 0.7 : 1 }]}
          >
            <IconSymbol name="plus.circle" size={16} color={C.secondary} />
            <Text style={{ fontSize: 14, color: C.secondary }}>New Project</Text>
          </Pressable>
        )}
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
  filterPill: { paddingHorizontal: 13, paddingVertical: 6, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.2 },
  card: { borderRadius: 12, padding: 14, marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 2 },
  cardClient: { fontSize: 13 },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '600' },
  dueText: { fontSize: 12 },
  delivSection: { marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  delivHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  delivRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  delivLabel: { fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },
  delivBtn: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  delivBtnText: { fontSize: 11, fontWeight: '600' },
  newProjectRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 14 },
});
