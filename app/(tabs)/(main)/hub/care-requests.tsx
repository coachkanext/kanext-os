/**
 * Care Requests — Community Hub MANAGE screen. Pastor only.
 * Members are redirected to hub/community via useFocusEffect.
 *
 * Filter pills, open requests list, collapsed resolved section, + FAB.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Static mock data ──────────────────────────────────────────────────────────

type RequestType = 'Prayer' | 'Hospital Visit' | 'Counseling' | 'Meal Train' | 'Financial';
type Priority    = 'Urgent' | 'Normal' | 'Low';

const OPEN_REQUESTS = [
  { id: 'cr1', name: 'Marcus T.',    type: 'Hospital Visit' as RequestType, priority: 'Urgent' as Priority,  assignedTo: 'Pastor Davis',   submitted: '2h ago',  detail: 'Admitted to Highland Hospital for emergency surgery.' },
  { id: 'cr2', name: 'Anonymous',    type: 'Prayer'         as RequestType, priority: 'Normal' as Priority,  assignedTo: 'Unassigned',     submitted: '5h ago',  detail: 'Family situation — please pray for peace and restoration.' },
  { id: 'cr3', name: 'Keisha W.',    type: 'Meal Train'     as RequestType, priority: 'Normal' as Priority,  assignedTo: 'Deacon Williams',submitted: '1d ago',  detail: 'Recently had a baby — needs meals for 2 weeks.' },
  { id: 'cr4', name: 'James O.',     type: 'Counseling'     as RequestType, priority: 'Normal' as Priority,  assignedTo: 'Unassigned',     submitted: '1d ago',  detail: 'Grief counseling — lost a parent last week.' },
  { id: 'cr5', name: 'Anonymous',    type: 'Financial'      as RequestType, priority: 'Low'    as Priority,  assignedTo: 'Unassigned',     submitted: '2d ago',  detail: 'Rent assistance needed — behind one month.' },
];

const RESOLVED_REQUESTS = [
  { id: 'rr1', name: 'Sandra B.', type: 'Prayer'         as RequestType, resolvedDate: 'Apr 5' },
  { id: 'rr2', name: 'Trey M.',   type: 'Meal Train'     as RequestType, resolvedDate: 'Apr 3' },
  { id: 'rr3', name: 'Anonymous', type: 'Hospital Visit' as RequestType, resolvedDate: 'Apr 1' },
];

const FILTER_PILLS = ['All', 'Urgent', 'Unassigned', 'Mine'];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

function priorityColor(priority: Priority): string {
  if (priority === 'Urgent') return HEAT;
  if (priority === 'Normal') return CAUTION;
  return '#8A837C';
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function CareRequestsScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [activePill, setActivePill]       = useState('All');
  const [resolvedExpanded, setResolvedExpanded] = useState(false);

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/hub/community' as any);
    }
  }, [isPastor, router]));

  const filteredRequests = useMemo(() => {
    if (activePill === 'Urgent')     return OPEN_REQUESTS.filter(r => r.priority === 'Urgent');
    if (activePill === 'Unassigned') return OPEN_REQUESTS.filter(r => r.assignedTo === 'Unassigned');
    if (activePill === 'Mine')       return OPEN_REQUESTS.filter(r => r.assignedTo === 'Pastor Davis');
    return OPEN_REQUESTS;
  }, [activePill]);

  if (!isPastor) return <View style={[s.screen, { backgroundColor: C.bg }]} />;

  const handleRequestTap = (req: typeof OPEN_REQUESTS[0]) => {
    Alert.alert(
      `${req.name} — ${req.type}`,
      req.detail,
      [
        { text: 'Assign',        onPress: () => Alert.alert('Assign', 'Assignment coming soon.') },
        { text: 'Update Status', onPress: () => Alert.alert('Update Status', 'Status update coming soon.') },
        { text: 'Add Note',      onPress: () => Alert.alert('Add Note', 'Note feature coming soon.') },
        { text: 'Dismiss', style: 'cancel' },
      ]
    );
  };

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Care Requests</Text>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 100 }}
      >
        {/* Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 14 }}
        >
          {FILTER_PILLS.map(pill => {
            const active = pill === activePill;
            return (
              <Pressable
                key={pill}
                style={[s.pill, active ? { backgroundColor: C.label } : { borderColor: C.separator, borderWidth: 1 }]}
                onPress={() => { Haptics.selectionAsync(); setActivePill(pill); }}
              >
                <Text style={[s.pillText, { color: active ? C.bg : C.secondary }]}>{pill}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Open Requests */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.secHeader, { color: C.label }]}>
            Open Requests{filteredRequests.length > 0 ? ` (${filteredRequests.length})` : ''}
          </Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {filteredRequests.length === 0 ? (
              <View style={s.emptyRow}>
                <Text style={[s.emptyText, { color: C.secondary }]}>No requests match this filter.</Text>
              </View>
            ) : (
              filteredRequests.map((req, idx) => (
                <Pressable
                  key={req.id}
                  style={[
                    s.requestRow,
                    idx < filteredRequests.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                  ]}
                  onPress={() => handleRequestTap(req)}
                >
                  <View style={s.requestLeft}>
                    <View style={[s.typeBadge, { backgroundColor: C.surfacePressed }]}>
                      <Text style={[s.typeText, { color: C.secondary }]}>{req.type}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[s.requestName, { color: C.label }]}>{req.name}</Text>
                      <Text style={[s.requestAssigned, { color: C.secondary }]}>
                        {req.assignedTo === 'Unassigned' ? 'Unassigned' : `Assigned: ${req.assignedTo}`}
                      </Text>
                      <Text style={[s.requestTime, { color: C.secondary }]}>{req.submitted}</Text>
                    </View>
                  </View>
                  <View style={[s.priorityBadge, { backgroundColor: priorityColor(req.priority) + '22' }]}>
                    <Text style={[s.priorityText, { color: priorityColor(req.priority) }]}>{req.priority}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>

          {/* Resolved Section (collapsed) */}
          <Pressable
            style={[s.resolvedToggle, { backgroundColor: C.surface }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setResolvedExpanded(v => !v); }}
          >
            <Text style={[s.resolvedToggleText, { color: C.label }]}>
              {RESOLVED_REQUESTS.length} Resolved
            </Text>
            <IconSymbol name={resolvedExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
          </Pressable>

          {resolvedExpanded && (
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {RESOLVED_REQUESTS.map((req, idx) => (
                <View
                  key={req.id}
                  style={[
                    s.resolvedRow,
                    idx < RESOLVED_REQUESTS.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                  ]}
                >
                  <View style={[s.resolvedCheck, { backgroundColor: GAIN + '22' }]}>
                    <IconSymbol name="checkmark" size={12} color={GAIN} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.requestName, { color: C.label }]}>{req.name}</Text>
                    <Text style={[s.requestAssigned, { color: C.secondary }]}>{req.type}</Text>
                  </View>
                  <Text style={[s.requestTime, { color: C.secondary }]}>{req.resolvedDate}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Request', 'Care request form coming soon.'); }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen:     { flex: 1 },
    topBarOuter:{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    topBarTitle:{ fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },

    pill:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    pillText: { fontSize: 13, fontWeight: '500' },

    secHeader: { fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },

    card:     { borderRadius: 12, marginBottom: 12, overflow: 'hidden' },
    rowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },

    emptyRow:  { padding: 16 },
    emptyText: { fontSize: 14 },

    requestRow:  { padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
    requestLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    typeBadge:   { borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' },
    typeText:    { fontSize: 10, fontWeight: '600' },
    requestName: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    requestAssigned: { fontSize: 12, marginBottom: 2 },
    requestTime: { fontSize: 11 },
    priorityBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
    priorityText:  { fontSize: 11, fontWeight: '700' },

    resolvedToggle:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 12, padding: 14, marginBottom: 12 },
    resolvedToggleText: { fontSize: 15, fontWeight: '600' },

    resolvedRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    resolvedCheck:{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },

    fab: {
      position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
    },
  });
}
