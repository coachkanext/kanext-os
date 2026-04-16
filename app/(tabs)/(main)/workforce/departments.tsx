/**
 * Workforce — Departments (CEO only)
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 54;

type Dept = {
  id: string;
  name: string;
  lead: string;
  headcount: number;
  openRoles: number;
  budget: string;
};

const DEPARTMENTS: Dept[] = [
  { id: 'd1', name: 'Engineering',  lead: 'Marcus Rivera',   headcount: 4, openRoles: 1, budget: '$620K' },
  { id: 'd2', name: 'Product',      lead: 'Jordan Kim',      headcount: 2, openRoles: 1, budget: '$280K' },
  { id: 'd3', name: 'Sales',        lead: 'Carlos Mendez',   headcount: 3, openRoles: 1, budget: '$540K' },
  { id: 'd4', name: 'Operations',   lead: 'Tamara West',     headcount: 2, openRoles: 0, budget: '$190K' },
  { id: 'd5', name: 'Executive',    lead: 'Sammy Kalejaiye', headcount: 1, openRoles: 0, budget: '—'     },
];

type ViewMode = 'list' | 'org';

export default function DepartmentsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

  const [viewMode, setViewMode] = useState<ViewMode>('list');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/workforce/contact' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.iconBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Departments</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* View toggle */}
        <View style={[s.segmentRow, { marginHorizontal: 16, backgroundColor: C.surface, borderColor: C.separator }]}>
          {(['list', 'org'] as ViewMode[]).map(v => (
            <Pressable
              key={v}
              style={[s.segment, viewMode === v && { backgroundColor: C.label }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setViewMode(v); }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: viewMode === v ? C.bg : C.secondary }}>
                {v === 'list' ? 'List' : 'Org Chart'}
              </Text>
            </Pressable>
          ))}
        </View>

        {viewMode === 'list' ? (
          <View style={{ marginHorizontal: 16, marginTop: 16, gap: 10 }}>
            {DEPARTMENTS.map(dept => (
              <Pressable
                key={dept.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(dept.name, `Lead: ${dept.lead}\nHeadcount: ${dept.headcount}\nBudget: ${dept.budget}\nOpen Roles: ${dept.openRoles}`);
                }}
              >
                <View style={[s.deptCard, { backgroundColor: C.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{dept.name}</Text>
                    <Text style={{ fontSize: 13, color: C.secondary, marginTop: 3 }}>{dept.lead}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{dept.headcount}</Text>
                    <Text style={{ fontSize: 11, color: C.secondary }}>people</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.secondary} style={{ marginLeft: 12 }} />
                </View>
              </Pressable>
            ))}
          </View>
        ) : (
          /* Org chart placeholder */
          <View style={{ marginHorizontal: 16, marginTop: 24, alignItems: 'center' }}>
            <View style={[s.orgRoot, { backgroundColor: C.label }]}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Sammy Kalejaiye</Text>
              <Text style={{ fontSize: 11, color: C.bg, opacity: 0.65, marginTop: 2 }}>CEO & Founder</Text>
            </View>
            <View style={[s.orgLine, { backgroundColor: C.separator }]} />
            <View style={s.orgRow}>
              {DEPARTMENTS.filter(d => d.id !== 'd5').map((dept, idx, arr) => (
                <View key={dept.id} style={{ alignItems: 'center', flex: 1 }}>
                  <View style={[s.orgCard, { backgroundColor: C.surface, borderColor: C.separator }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.label, textAlign: 'center' }}>{dept.name}</Text>
                    <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2, textAlign: 'center' }}>{dept.headcount} people</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

      </ScrollView>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    segmentRow: {
      flexDirection: 'row', borderRadius: 12, borderWidth: 1,
      overflow: 'hidden', padding: 3,
    },
    segment:    { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', borderRadius: 9 },
    deptCard:   { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
    orgRoot:    { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    orgLine:    { width: 2, height: 24 },
    orgRow:     { flexDirection: 'row', gap: 8, width: '100%' },
    orgCard:    { padding: 10, borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, minHeight: 52, justifyContent: 'center' },
  });
}
