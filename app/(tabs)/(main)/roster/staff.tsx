import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollFooter } from '@/hooks/use-scroll-footer';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ---------------------------------------------------------------------------
// Types & mock data
// ---------------------------------------------------------------------------

interface StaffMember {
  id: string;
  name: string;
  initials: string;
  title: string;
  department: string;
  hue: string;
  yearsOnStaff: number;
  email: string;
}

const STAFF: StaffMember[] = [
  { id: 's1', name: 'Coach Marcus Reid',  initials: 'MR', title: 'Head Coach',           department: 'Coaching', hue: '#1A1714', yearsOnStaff: 7,  email: 'm.reid@lu.edu'     },
  { id: 's2', name: 'Coach Dana Ortiz',   initials: 'DO', title: 'Asst. Coach – Offense', department: 'Coaching', hue: '#6B8C7A', yearsOnStaff: 4,  email: 'd.ortiz@lu.edu'    },
  { id: 's3', name: 'Coach Terrell King', initials: 'TK', title: 'Asst. Coach – Defense', department: 'Coaching', hue: '#8B7355', yearsOnStaff: 3,  email: 't.king@lu.edu'     },
  { id: 's4', name: 'Brandon Wells',      initials: 'BW', title: 'Director of Ops',       department: 'Ops',      hue: '#7A6B8C', yearsOnStaff: 5,  email: 'b.wells@lu.edu'    },
  { id: 's5', name: 'Alicia Monroe',      initials: 'AM', title: 'Athletic Trainer',       department: 'Medical',  hue: '#B85C5C', yearsOnStaff: 6,  email: 'a.monroe@lu.edu'   },
  { id: 's6', name: 'Dr. James Park',     initials: 'JP', title: 'Team Physician',         department: 'Medical',  hue: '#5A8A6E', yearsOnStaff: 9,  email: 'j.park@lu.edu'     },
  { id: 's7', name: 'Tyler Brooks',       initials: 'TB', title: 'Video Coordinator',      department: 'Analytics',hue: '#8C7A6B', yearsOnStaff: 2,  email: 't.brooks@lu.edu'   },
  { id: 's8', name: 'Sierra Johnson',     initials: 'SJ', title: 'Academic Advisor',       department: 'Academic', hue: '#6B7A8C', yearsOnStaff: 4,  email: 's.johnson@lu.edu'  },
];

const DEPARTMENTS = ['All', 'Coaching', 'Ops', 'Medical', 'Analytics', 'Academic'];

const DEPT_ICONS: Record<string, string> = {
  Coaching:  'person.2.fill',
  Ops:       'briefcase.fill',
  Medical:   'cross.fill',
  Analytics: 'chart.bar.fill',
  Academic:  'book.fill',
};

// ---------------------------------------------------------------------------
// StaffCard
// ---------------------------------------------------------------------------

function StaffCard({ member, C, s }: { member: StaffMember; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  function handlePress() {
    Haptics.selectionAsync();
  }
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.card, { backgroundColor: pressed ? C.surfacePressed : C.surface, borderColor: C.separator }]}
    >
      <View style={[s.avatar, { backgroundColor: member.hue }]}>
        <Text style={[s.avatarText, { color: member.hue === '#1A1714' ? '#FFFFFF' : '#FFFFFF' }]}>{member.initials}</Text>
      </View>
      <View style={s.cardBody}>
        <Text style={[s.memberName, { color: C.label }]} numberOfLines={1}>{member.name}</Text>
        <Text style={[s.memberTitle, { color: C.secondary }]} numberOfLines={1}>{member.title}</Text>
        <View style={[s.deptChip, { backgroundColor: C.separator }]}>
          <Text style={[s.deptChipText, { color: C.secondary }]}>{member.department}</Text>
        </View>
      </View>
      <View style={s.cardRight}>
        <Text style={[s.yearsText, { color: C.secondary }]}>{member.yearsOnStaff}y</Text>
        <IconSymbol name="chevron.right" size={13} color={C.muted} />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export default function StaffScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [activeDept, setActiveDept] = React.useState('All');
  const s = useMemo(() => makeStyles(C), [C]);
  const scrollFooter = useScrollFooter();
  const TOP_BAR_H = 52;
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(
    () => activeDept === 'All' ? STAFF : STAFF.filter(m => m.department === activeDept),
    [activeDept],
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => openSidePanel()} hitSlop={8} style={s.topBarSide}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Staff</Text>
            </View>
          </View>
          <View style={{ width: 44 }} />
        </View>
      </Animated.View>

      {/* Stats strip */}
      <View style={[s.statsStrip, { backgroundColor: C.surface, borderColor: C.separator, marginTop: topBarH }]}>
        <View style={s.statCell}>
          <Text style={[s.statVal, { color: C.label }]}>{STAFF.length}</Text>
          <Text style={[s.statLabel, { color: C.secondary }]}>Total Staff</Text>
        </View>
        {Object.entries(DEPT_ICONS).map(([dept, icon]) => (
          <View key={dept} style={s.statCell}>
            <Text style={[s.statVal, { color: C.label }]}>{STAFF.filter(m => m.department === dept).length}</Text>
            <Text style={[s.statLabel, { color: C.secondary }]}>{dept}</Text>
          </View>
        ))}
      </View>

      {/* Department filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filterRow}
        style={s.filterBar}
      >
        {DEPARTMENTS.map(dept => {
          const active = activeDept === dept;
          return (
            <Pressable
              key={dept}
              onPress={() => { Haptics.selectionAsync(); setActiveDept(dept); }}
              style={[s.filterPill, active ? { backgroundColor: C.activePill } : { backgroundColor: C.surface, borderColor: C.separator }]}
            >
              <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>{dept}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Staff list */}
      <ScrollView
        {...scrollFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[s.listContent, { paddingBottom: insets.bottom + 24 }]}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {filtered.map(member => (
          <StaffCard key={member.id} member={member} C={C} s={s} />
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
  topBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10 },
  topBarSide: { width: 44, alignItems: 'center', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

  statsStrip: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth, paddingVertical: 10 },
  statCell: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500', marginTop: 2, textAlign: 'center' },

  filterBar: { maxHeight: 44 },
  filterRow: { paddingHorizontal: 12, gap: 8, paddingVertical: 8, alignItems: 'center' },
  filterPill: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  filterPillText: { fontSize: 13, fontWeight: '500' },

  listContent: { paddingTop: 8, paddingHorizontal: 16 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 14, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: '700' },
  cardBody: { flex: 1, gap: 2 },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberTitle: { fontSize: 12 },
  deptChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  deptChipText: { fontSize: 10, fontWeight: '600' },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  yearsText: { fontSize: 12, fontWeight: '500' },
});
