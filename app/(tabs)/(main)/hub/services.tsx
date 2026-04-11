/**
 * Services — Community Hub screen.
 * Pastor: upcoming services list (with status badge), song library row, + FAB.
 * Member: upcoming services (read-only), next service card, past services link.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { openSidePanel } from '@/utils/global-side-panel';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Static mock data ──────────────────────────────────────────────────────────

type ServiceStatus = 'Live' | 'Planning' | 'Complete';

const UPCOMING_SERVICES = [
  { id: 's1', date: 'Sun Apr 13', time: '9:00 AM',  type: 'Sunday AM',   title: 'Walking in Authority',       speaker: 'Dr. Oladipo Kalejaiye',  status: 'Planning' as ServiceStatus },
  { id: 's2', date: 'Sun Apr 13', time: '11:30 AM', type: 'Sunday AM',   title: 'Walking in Authority',       speaker: 'Dr. Oladipo Kalejaiye',  status: 'Planning' as ServiceStatus },
  { id: 's3', date: 'Wed Apr 16', time: '7:00 PM',  type: 'Bible Study', title: 'Romans 9 — Election',        speaker: 'Dr. Nonyelum Kalejaiye', status: 'Planning' as ServiceStatus },
  { id: 's4', date: 'Sun Apr 20', time: '9:00 AM',  type: 'Easter',      title: 'He Is Risen',                speaker: 'Dr. Oladipo Kalejaiye',  status: 'Planning' as ServiceStatus },
  { id: 's5', date: 'Sun Apr 20', time: '11:30 AM', type: 'Easter',      title: 'He Is Risen',                speaker: 'Dr. Oladipo Kalejaiye',  status: 'Planning' as ServiceStatus },
];

const PAST_SERVICES = [
  { id: 'p1', date: 'Sun Apr 6',  time: '10:00 AM', type: 'Easter Sunday', title: 'Easter Sunday', attendance: 612 },
  { id: 'p2', date: 'Wed Apr 2',  time: '7:00 PM',  type: 'Bible Study',   title: 'Romans 8 — No Condemnation', attendance: 184 },
  { id: 'p3', date: 'Sun Mar 30', time: '10:00 AM', type: 'Sunday AM',     title: 'The Foundation', attendance: 589 },
];

const NEXT_SERVICE = UPCOMING_SERVICES[0];
const ORDER_OF_SERVICE = ['Welcome & Announcements', 'Worship Set (3 songs)', 'Tithes & Offering', 'Message', 'Altar Call', 'Benediction'];

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

function statusColor(status: ServiceStatus): string {
  if (status === 'Live')     return GAIN;
  if (status === 'Planning') return CAUTION;
  return '#8A837C';
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function ServicesScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const [role, cycleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const topBarH        = insets.top + TOP_BAR_H;
  const scrollPaddingTop = topBarH + 16;

  // ── Pastor View ──────────────────────────────────────────────────────────────

  const renderPastor = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
    >
      <Text style={[s.secHeader, { color: C.label }]}>Upcoming Services</Text>
      {UPCOMING_SERVICES.map((sv, idx) => (
        <Pressable
          key={sv.id}
          style={[s.serviceCard, { backgroundColor: C.surface }]}
          onPress={() => Alert.alert('Service Planner', 'Service planner coming soon.')}
        >
          <View style={s.serviceCardTop}>
            <View style={{ flex: 1 }}>
              <Text style={[s.serviceTitle, { color: C.label }]}>{sv.title}</Text>
              <Text style={[s.serviceMeta, { color: C.secondary }]}>{sv.date} · {sv.time} · {sv.type}</Text>
              <Text style={[s.serviceSpeaker, { color: C.secondary }]}>{sv.speaker}</Text>
            </View>
            <View style={[s.statusBadge, { backgroundColor: statusColor(sv.status) + '22' }]}>
              <Text style={[s.statusText, { color: statusColor(sv.status) }]}>{sv.status}</Text>
            </View>
          </View>
        </Pressable>
      ))}

      {/* Song Library */}
      <Text style={[s.secHeader, { color: C.label }]}>Song Library</Text>
      <View style={[s.card, { backgroundColor: C.surface }]}>
        <View style={s.libraryRow}>
          <IconSymbol name="music.note.list" size={18} color={C.secondary} />
          <Text style={[s.libraryCount, { color: C.label }]}>32 songs</Text>
          <Pressable
            style={s.libraryLink}
            onPress={() => Alert.alert('Song Library', 'Song library coming soon.')}
          >
            <Text style={[s.libraryLinkText, { color: C.label }]}>View Library</Text>
            <IconSymbol name="chevron.right" size={14} color={C.label} />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );

  // ── Member View ──────────────────────────────────────────────────────────────

  const renderMember = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: scrollPaddingTop, paddingHorizontal: 16, paddingBottom: insets.bottom + 40 }}
    >
      {/* Next Service Card */}
      <Text style={[s.secHeader, { color: C.label }]}>Next Service</Text>
      <View style={[s.nextCard, { backgroundColor: C.surface }]}>
        <Text style={[s.nextTitle, { color: C.label }]}>{NEXT_SERVICE.title}</Text>
        <Text style={[s.nextMeta, { color: C.secondary }]}>{NEXT_SERVICE.date} · {NEXT_SERVICE.time}</Text>
        <Text style={[s.nextSpeaker, { color: C.secondary }]}>{NEXT_SERVICE.speaker}</Text>
        <View style={[s.divider, { backgroundColor: C.separator }]} />
        <Text style={[s.orderLabel, { color: C.secondary }]}>Order of Service</Text>
        {ORDER_OF_SERVICE.map((item, idx) => (
          <View key={item} style={s.orderRow}>
            <Text style={[s.orderNum, { color: C.secondary }]}>{idx + 1}.</Text>
            <Text style={[s.orderItem, { color: C.label }]}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming Services */}
      <Text style={[s.secHeader, { color: C.label }]}>Upcoming Services</Text>
      <View style={[s.card, { backgroundColor: C.surface }]}>
        {UPCOMING_SERVICES.map((sv, idx) => (
          <View
            key={sv.id}
            style={[
              s.upcomingRow,
              idx < UPCOMING_SERVICES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[s.serviceTitle, { color: C.label }]}>{sv.title}</Text>
              <Text style={[s.serviceMeta, { color: C.secondary }]}>{sv.date} · {sv.time}</Text>
            </View>
            <View style={[s.typeBadge, { backgroundColor: C.surfacePressed }]}>
              <Text style={[s.typeText, { color: C.secondary }]}>{sv.type}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Past Services */}
      <Text style={[s.secHeader, { color: C.label }]}>Past Services</Text>
      <Pressable
        style={[s.pastRow, { backgroundColor: C.surface }]}
        onPress={() => Alert.alert('Recordings', 'Recordings are available on KTV.')}
      >
        <IconSymbol name="play.rectangle.fill" size={18} color={C.secondary} />
        <Text style={[s.pastText, { color: C.label }]}>Recordings available on KTV</Text>
        <IconSymbol name="chevron.right" size={14} color={C.secondary} />
      </Pressable>
    </ScrollView>
  );

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      {isPastor ? renderPastor() : renderMember()}

      {/* Top Bar */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Services</Text>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      {/* FAB — Pastor only */}
      {isPastor && (
        <Pressable
          style={[s.fab, { bottom: insets.bottom + 49 + 16, backgroundColor: C.label }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Service', 'Service planner coming soon.'); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    screen:    { flex: 1 },
    topBarWrap:{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
    topBar:    { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16 },
    topBarTitle:{ fontSize: 16, fontWeight: '700', flex: 1, textAlign: 'center' },

    secHeader: { fontSize: 17, fontWeight: '700', marginBottom: 10, marginTop: 4 },

    serviceCard:    { borderRadius: 12, padding: 14, marginBottom: 10 },
    serviceCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    serviceTitle:   { fontSize: 14, fontWeight: '700', marginBottom: 2 },
    serviceMeta:    { fontSize: 12, marginBottom: 2 },
    serviceSpeaker: { fontSize: 12 },
    statusBadge:    { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
    statusText:     { fontSize: 11, fontWeight: '700' },

    card:     { borderRadius: 12, marginBottom: 20, overflow: 'hidden' },
    rowBorder:{ borderBottomWidth: StyleSheet.hairlineWidth },

    libraryRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
    libraryCount:   { flex: 1, fontSize: 15, fontWeight: '600' },
    libraryLink:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
    libraryLinkText:{ fontSize: 14, fontWeight: '600' },

    // Member
    nextCard:    { borderRadius: 12, padding: 16, marginBottom: 20 },
    nextTitle:   { fontSize: 18, fontWeight: '800', marginBottom: 4 },
    nextMeta:    { fontSize: 13, marginBottom: 2 },
    nextSpeaker: { fontSize: 13, marginBottom: 12 },
    divider:     { height: StyleSheet.hairlineWidth, marginBottom: 12 },
    orderLabel:  { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 },
    orderRow:    { flexDirection: 'row', gap: 8, marginBottom: 5 },
    orderNum:    { fontSize: 13, width: 18 },
    orderItem:   { fontSize: 13, flex: 1 },

    upcomingRow: { paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
    typeBadge:   { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
    typeText:    { fontSize: 10, fontWeight: '600' },

    pastRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, padding: 14, marginBottom: 20 },
    pastText:{ flex: 1, fontSize: 14, fontWeight: '500' },

    fab: {
      position: 'absolute', right: 24, width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15, shadowRadius: 6, elevation: 4, zIndex: 20,
    },
  });
}
