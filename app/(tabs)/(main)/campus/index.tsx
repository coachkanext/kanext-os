/**
 * Campus — Students (President) / Directory (Student).
 * President: admin management — search, filter pills, student list with GPA indicators, at-risk alerts, FAB.
 * Student:   directory view — browse students + faculty by name/program.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, TextInput, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
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

type Standing = 'Good' | 'AtRisk' | 'Honors';
type Student = {
  id: string; name: string; initials: string; level: string; program: string;
  gpa: number; standing: Standing; international?: boolean;
};

const STUDENTS: Student[] = [
  { id: '1', name: 'Laolu Kalejaiye',  initials: 'LK', level: 'Senior',   program: 'Business Administration',  gpa: 3.8, standing: 'Honors' },
  { id: '2', name: 'Lincoln Thompson', initials: 'LT', level: 'Junior',   program: 'Diagnostic Imaging',       gpa: 2.1, standing: 'AtRisk' },
  { id: '3', name: 'Marcus Webb',      initials: 'MW', level: 'Freshman', program: 'MBA',                      gpa: 3.5, standing: 'Honors' },
  { id: '4', name: 'Jordan Williams',  initials: 'JW', level: 'Sophomore',program: 'International Business',   gpa: 3.2, standing: 'Good',  international: true },
  { id: '5', name: 'DeShawn Coleman',  initials: 'DC', level: 'Graduate', program: 'Doctor of Business Admin', gpa: 3.7, standing: 'Good' },
  { id: '6', name: 'Priya Sharma',     initials: 'PS', level: 'Junior',   program: 'Intl Business & Finance',  gpa: 2.0, standing: 'AtRisk', international: true },
  { id: '7', name: 'Brandon Okafor',   initials: 'BO', level: 'Senior',   program: 'Business Administration',  gpa: 3.9, standing: 'Honors' },
  { id: '8', name: 'Tavion Howard',    initials: 'TH', level: 'Freshman', program: 'Diagnostic Imaging',       gpa: 3.1, standing: 'Good' },
];

type Filter = 'all' | 'undergraduate' | 'graduate' | 'doctoral' | 'at-risk' | 'honors' | 'international' | 'new';
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all',           label: 'All' },
  { key: 'undergraduate', label: 'Undergraduate' },
  { key: 'graduate',      label: 'Graduate' },
  { key: 'doctoral',      label: 'Doctoral' },
  { key: 'at-risk',       label: 'At-Risk' },
  { key: 'honors',        label: 'Honors' },
  { key: 'international', label: 'International' },
  { key: 'new',           label: 'New' },
];

const STANDING_COLOR: Record<Standing, string> = {
  Good:   GAIN,
  AtRisk: HEAT,
  Honors: CAUTION,
};

const AT_RISK = STUDENTS.filter(s => s.standing === 'AtRisk');

export default function CampusIndexScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:campus');
  const isPresident = role === roleCycles[0];

  const [query,  setQuery]  = useState('');
  const [filter, setFilter] = useState<Filter>('all');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => {
    let list = STUDENTS;
    switch (filter) {
      case 'undergraduate': list = list.filter(st => ['Freshman','Sophomore','Junior','Senior'].includes(st.level)); break;
      case 'graduate':      list = list.filter(st => st.level === 'Graduate'); break;
      case 'doctoral':      list = list.filter(st => st.program.toLowerCase().includes('doctor')); break;
      case 'at-risk':       list = list.filter(st => st.standing === 'AtRisk'); break;
      case 'honors':        list = list.filter(st => st.standing === 'Honors'); break;
      case 'international': list = list.filter(st => st.international === true); break;
      case 'new':           list = list.filter(st => st.level === 'Freshman'); break;
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(st => st.name.toLowerCase().includes(q) || st.program.toLowerCase().includes(q));
    }
    return list;
  }, [filter, query]);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <View style={{ flex: 1, justifyContent: 'center' }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>{isPresident ? 'Students' : 'Directory'}</Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPresident} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 12, paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search */}
        <View style={[s.searchRow, { backgroundColor: C.surface }]}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder={isPresident ? 'Search students...' : 'Search students & faculty...'}
            placeholderTextColor={C.secondary}
            style={[s.searchInput, { color: C.label }]}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <IconSymbol name="xmark.circle.fill" size={16} color={C.secondary} />
            </Pressable>
          )}
        </View>

        {isPresident ? (
          <>
            {/* Stats row */}
            <View style={s.statsRow}>
              {[
                { label: 'Total',    value: '436' },
                { label: 'At-Risk',  value: String(AT_RISK.length), color: HEAT },
                { label: 'Honors',   value: String(STUDENTS.filter(x => x.standing === 'Honors').length), color: CAUTION },
                { label: 'New',      value: String(STUDENTS.filter(x => x.level === 'Freshman').length) },
              ].map((stat, idx, arr) => (
                <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }, idx < arr.length - 1 && s.statCardBorder]}>
                  <Text style={{ fontSize: 20, fontWeight: '800', color: stat.color ?? C.label }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
              {FILTERS.map(f => (
                <Pressable
                  key={f.key}
                  onPress={() => { setFilter(f.key); Haptics.selectionAsync(); }}
                  style={[s.filterPill, { backgroundColor: filter === f.key ? C.label : C.surface, borderColor: C.separator }]}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: filter === f.key ? C.bg : C.secondary }}>{f.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* At-risk alerts (shown only on "all" / "at-risk" filters) */}
            {(filter === 'all' || filter === 'at-risk') && AT_RISK.length > 0 && (
              <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
                <Text style={[s.sectionLabel, { color: C.secondary }]}>At-Risk Alerts</Text>
                {AT_RISK.map((st, idx) => (
                  <Pressable
                    key={st.id}
                    style={[s.alertCard, { backgroundColor: C.surface, borderLeftColor: HEAT, borderBottomColor: C.separator },
                      idx < AT_RISK.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth }]}
                    onPress={() => Alert.alert(st.name, `GPA: ${st.gpa}\nProgram: ${st.program}\nStatus: Academic At-Risk\n\nReach out to schedule an advising session.`, [
                      { text: 'Send Message', onPress: () => {} },
                      { text: 'Dismiss', style: 'cancel' },
                    ])}
                  >
                    <View style={[s.initials, { backgroundColor: '#B85C5C22' }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: HEAT }}>{st.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{st.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{st.program} · GPA {st.gpa.toFixed(1)}</Text>
                    </View>
                    <View style={[s.standingBadge, { backgroundColor: '#B85C5C22', borderColor: HEAT }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: HEAT }}>AT-RISK</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Student list */}
            <View style={{ paddingHorizontal: 16 }}>
              <Text style={[s.sectionLabel, { color: C.secondary }]}>
                {filtered.length === STUDENTS.length ? `All Students (${filtered.length})` : `${filtered.length} Result${filtered.length !== 1 ? 's' : ''}`}
              </Text>
              <View style={[s.card, { backgroundColor: C.surface }]}>
                {filtered.length === 0 ? (
                  <View style={{ padding: 20, alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, color: C.secondary }}>No students match this filter.</Text>
                  </View>
                ) : filtered.map((st, idx) => (
                  <Pressable
                    key={st.id}
                    style={[s.studentRow, idx < filtered.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                    onPress={() => Alert.alert(st.name, `Level: ${st.level}\nProgram: ${st.program}\nGPA: ${st.gpa.toFixed(1)}\nStanding: ${st.standing}${st.international ? '\nInternational Student' : ''}`)}
                  >
                    <View style={[s.initials, { backgroundColor: C.bg }]}>
                      <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary }}>{st.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{st.name}</Text>
                        {st.international && (
                          <View style={[s.intlBadge, { borderColor: C.separator }]}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: C.secondary }}>INTL</Text>
                          </View>
                        )}
                      </View>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{st.level} · {st.program}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>GPA {st.gpa.toFixed(1)}</Text>
                      <View style={[s.standingDot, { backgroundColor: STANDING_COLOR[st.standing] + '22', borderColor: STANDING_COLOR[st.standing] }]}>
                        <Text style={{ fontSize: 9, fontWeight: '700', color: STANDING_COLOR[st.standing] }}>
                          {st.standing === 'AtRisk' ? 'AT-RISK' : st.standing.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </>
        ) : (
          /* ── Student directory view ── */
          <View style={{ paddingHorizontal: 16 }}>
            {/* Faculty section */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Faculty & Staff</Text>
            <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {[
                { name: 'Dr. Gerald J. Williams', initials: 'GW', role: 'President',             dept: 'Administration' },
                { name: 'Dr. Maria Chen',         initials: 'MC', role: 'Dean of Business',      dept: 'Business School' },
                { name: 'Prof. James Adeyemi',    initials: 'JA', role: 'Associate Professor',   dept: 'Diagnostic Imaging' },
                { name: 'Dr. Aisha Thompson',     initials: 'AT', role: 'Director of Advising',  dept: 'Student Affairs' },
              ].map((f, idx, arr) => (
                <Pressable
                  key={f.name}
                  style={[s.studentRow, idx < arr.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(f.name, `${f.role}\n${f.dept}`)}
                >
                  <View style={[s.initials, { backgroundColor: '#3A2E1A22' }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#3A2E1A' }}>{f.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{f.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{f.role} · {f.dept}</Text>
                  </View>
                  <IconSymbol name="envelope" size={16} color={C.secondary} />
                </Pressable>
              ))}
            </View>

            {/* Students section */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Students ({STUDENTS.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {STUDENTS.map((st, idx) => (
                <Pressable
                  key={st.id}
                  style={[s.studentRow, idx < STUDENTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => Alert.alert(st.name, `${st.level} · ${st.program}`)}
                >
                  <View style={[s.initials, { backgroundColor: C.bg }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary }}>{st.initials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{st.name}</Text>
                      {st.international && (
                        <View style={[s.intlBadge, { borderColor: C.separator }]}>
                          <Text style={{ fontSize: 9, fontWeight: '700', color: C.secondary }}>INTL</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{st.level} · {st.program}</Text>
                  </View>
                  <IconSymbol name="envelope" size={16} color={C.secondary} />
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* FAB — President only */}
      {isPresident && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 64 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Add Student', 'Open enrollment form to add a new student record.'); }}
        >
          <IconSymbol name="plus" size={24} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:        { flex: 1 },
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:     { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:     { fontSize: 13, fontWeight: '700' },
  sectionLabel:  { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:          { borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  studentRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12 },
  rowBorder:     { borderBottomWidth: StyleSheet.hairlineWidth },
  initials:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  standingBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  standingDot:   { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 5, borderWidth: 1 },
  intlBadge:     { paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, borderWidth: 1 },
  statsRow:      { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  statCard:      { flex: 1, backgroundColor: 'transparent', alignItems: 'center', paddingVertical: 12, borderRadius: 12 },
  statCardBorder:{},
  filterScroll:  { marginBottom: 16 },
  filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, flexShrink: 0 },
  alertCard:     { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderLeftWidth: 3 },
  searchRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  searchInput:   { flex: 1, fontSize: 15 },
  fab:           { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6, elevation: 4 },
});
