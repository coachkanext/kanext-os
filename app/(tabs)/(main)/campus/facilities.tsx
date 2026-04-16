/**
 * Campus — Facilities (both roles).
 * President: management view — facility list, occupancy, edit controls.
 * Student:   booking view — available now, book a space, My Reservations.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
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

type FacilityType = 'Academic' | 'Library' | 'Athletics' | 'Common';
type Facility = {
  id: string; name: string; type: FacilityType;
  hours: string; status: 'Open' | 'Closed';
  capacity: number; occupancy: number;
  icon: string; bookable: boolean;
};

const FACILITIES: Facility[] = [
  { id: '1', name: 'Main Building',             type: 'Academic',  hours: 'Mon–Fri 7AM–10PM', status: 'Open',   capacity: 200, occupancy: 63, icon: 'building.2.fill',        bookable: false },
  { id: '2', name: 'George E. Johnson Library', type: 'Library',   hours: 'Mon–Thu 8AM–9PM',  status: 'Open',   capacity: 80,  occupancy: 42, icon: 'books.vertical.fill',    bookable: true  },
  { id: '3', name: 'Athletic Center',           type: 'Athletics', hours: 'Mon–Fri 6AM–9PM',  status: 'Open',   capacity: 150, occupancy: 28, icon: 'figure.run',             bookable: true  },
  { id: '4', name: 'Science Lab',               type: 'Academic',  hours: 'Mon–Fri 9AM–6PM',  status: 'Open',   capacity: 30,  occupancy: 67, icon: 'flask.fill',             bookable: false },
  { id: '5', name: 'Student Lounge',            type: 'Common',    hours: 'Daily 8AM–10PM',   status: 'Open',   capacity: 60,  occupancy: 18, icon: 'person.2.fill',          bookable: false },
];

type Priority = 'High' | 'Medium' | 'Low';
type MaintenanceRequest = { id: string; title: string; location: string; reported: string; priority: Priority };
const MAINTENANCE: MaintenanceRequest[] = [
  { id: '1', title: 'HVAC unit malfunction',     location: 'Science Lab',    reported: 'Apr 12', priority: 'High'   },
  { id: '2', title: 'Broken projector',           location: 'Room 204',       reported: 'Apr 14', priority: 'Medium' },
  { id: '3', title: 'Leaky faucet',               location: 'Restroom B1',    reported: 'Apr 15', priority: 'Low'    },
];
const PRIORITY_COLOR: Record<Priority, string> = { High: '#B85C5C', Medium: '#B8943E', Low: '#5A8A6E' };

type Reservation = { id: string; facility: string; date: string; time: string };
const MY_RESERVATIONS: Reservation[] = [
  { id: '1', facility: 'George E. Johnson Library', date: 'Apr 18', time: '2:00 PM – 4:00 PM' },
  { id: '2', facility: 'Athletic Center',           date: 'Apr 20', time: '7:00 AM – 8:00 AM' },
];

function OccupancyBar({ pct, C }: { pct: number; C: ComponentColors }) {
  const color = pct >= 85 ? HEAT : pct >= 60 ? CAUTION : GAIN;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ flex: 1, height: 4, backgroundColor: C.separator, borderRadius: 2, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: 4, backgroundColor: color, borderRadius: 2 }} />
      </View>
      <Text style={{ fontSize: 11, fontWeight: '600', color, width: 30, textAlign: 'right' }}>{pct}%</Text>
    </View>
  );
}

export default function FacilitiesScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('education:campus');
  const isPresident = role === roleCycles[0];

  const [reservations, setReservations] = useState<Reservation[]>(MY_RESERVATIONS);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const openFacilities = FACILITIES.filter(f => f.status === 'Open');
  const bookable       = FACILITIES.filter(f => f.bookable && f.status === 'Open');

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
              <Text style={[s.titleText, { color: C.label }]}>Facilities</Text>
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
      >
        {isPresident ? (
          <View style={{ paddingHorizontal: 16 }}>
            {/* Stats */}
            <View style={[s.statsCard, { backgroundColor: C.surface }]}>
              {[
                { label: 'Facilities', value: String(FACILITIES.length) },
                { label: 'Open Now',   value: String(openFacilities.length), color: GAIN },
                { label: 'Total Cap.', value: String(FACILITIES.reduce((a, f) => a + f.capacity, 0)) },
              ].map((stat, idx, arr) => (
                <View key={stat.label} style={[s.statCol, idx < arr.length - 1 && [s.statBorder, { borderRightColor: C.separator }]]}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: stat.color ?? C.label }}>{stat.value}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
                </View>
              ))}
            </View>

            {/* Facility list */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>All Facilities</Text>
            {FACILITIES.map((facility, idx) => (
              <View
                key={facility.id}
                style={[s.facilityCard, { backgroundColor: C.surface }, idx > 0 && { marginTop: 8 }]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <View style={[s.facilityIcon, { backgroundColor: C.bg }]}>
                    <IconSymbol name={facility.icon as any} size={18} color={C.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{facility.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{facility.type} · {facility.hours}</Text>
                  </View>
                  <View style={[s.statusBadge, { backgroundColor: facility.status === 'Open' ? GAIN + '22' : HEAT + '22', borderColor: facility.status === 'Open' ? GAIN : HEAT }]}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: facility.status === 'Open' ? GAIN : HEAT }}>{facility.status.toUpperCase()}</Text>
                  </View>
                </View>
                <View style={{ marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>Occupancy ({facility.capacity} cap)</Text>
                    <Pressable
                      onPress={() => Alert.alert('Edit Hours', `Update hours for ${facility.name}`)}
                    >
                      <Text style={{ fontSize: 12, color: C.secondary, textDecorationLine: 'underline' }}>Edit hours</Text>
                    </Pressable>
                  </View>
                  <OccupancyBar pct={facility.occupancy} C={C} />
                </View>
              </View>
            ))}

            {/* Maintenance Requests */}
            <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 20 }]}>Maintenance Requests ({MAINTENANCE.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {MAINTENANCE.map((req, idx) => (
                <View
                  key={req.id}
                  style={[s.row, idx < MAINTENANCE.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                >
                  <View style={[s.facilityIcon, { backgroundColor: PRIORITY_COLOR[req.priority] + '22' }]}>
                    <IconSymbol name="wrench.and.screwdriver" size={16} color={PRIORITY_COLOR[req.priority]} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{req.title}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{req.location} · Reported {req.reported}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <View style={[s.statusBadge, { backgroundColor: PRIORITY_COLOR[req.priority] + '22', borderColor: PRIORITY_COLOR[req.priority] }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: PRIORITY_COLOR[req.priority] }}>{req.priority.toUpperCase()}</Text>
                    </View>
                    <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert('Assign Request', `Assign maintenance team to: ${req.title} at ${req.location}`); }}>
                      <Text style={{ fontSize: 12, color: C.secondary, textDecorationLine: 'underline' }}>Assign</Text>
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          /* ── Student view ── */
          <View style={{ paddingHorizontal: 16 }}>
            {/* My Reservations */}
            {reservations.length > 0 && (
              <>
                <Text style={[s.sectionLabel, { color: C.secondary }]}>My Reservations ({reservations.length})</Text>
                <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
                  {reservations.map((res, idx) => (
                    <View
                      key={res.id}
                      style={[s.row, idx < reservations.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                    >
                      <View style={[s.facilityIcon, { backgroundColor: C.bg }]}>
                        <IconSymbol name="calendar" size={16} color={C.secondary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{res.facility}</Text>
                        <Text style={{ fontSize: 12, color: C.secondary }}>{res.date} · {res.time}</Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          Alert.alert('Cancel Reservation', `Cancel your booking at ${res.facility}?`, [
                            { text: 'Cancel Booking', style: 'destructive', onPress: () => setReservations(prev => prev.filter(r => r.id !== res.id)) },
                            { text: 'Keep', style: 'cancel' },
                          ]);
                        }}
                      >
                        <IconSymbol name="xmark.circle" size={20} color={C.secondary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </>
            )}

            {/* Available Now */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Available Now ({openFacilities.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface, marginBottom: 20 }]}>
              {openFacilities.map((facility, idx) => (
                <View
                  key={facility.id}
                  style={[s.row, idx < openFacilities.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                >
                  <View style={[s.facilityIcon, { backgroundColor: C.bg }]}>
                    <IconSymbol name={facility.icon as any} size={16} color={C.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{facility.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{facility.hours}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <View style={[s.statusBadge, { backgroundColor: GAIN + '22', borderColor: GAIN }]}>
                      <Text style={{ fontSize: 10, fontWeight: '700', color: GAIN }}>OPEN</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: C.secondary }}>{facility.occupancy}% full</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Book a Space */}
            <Text style={[s.sectionLabel, { color: C.secondary }]}>Book a Space ({bookable.length})</Text>
            <View style={[s.card, { backgroundColor: C.surface }]}>
              {bookable.map((facility, idx) => (
                <Pressable
                  key={facility.id}
                  style={[s.row, idx < bookable.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }]]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert(`Book ${facility.name}`, 'Select a date and time slot:', [
                      { text: 'Today 2–4 PM',   onPress: () => setReservations(prev => [...prev, { id: String(Date.now()), facility: facility.name, date: 'Today', time: '2:00 PM – 4:00 PM' }]) },
                      { text: 'Tomorrow 10 AM', onPress: () => setReservations(prev => [...prev, { id: String(Date.now()), facility: facility.name, date: 'Tomorrow', time: '10:00 AM – 12:00 PM' }]) },
                      { text: 'Cancel', style: 'cancel' },
                    ]);
                  }}
                >
                  <View style={[s.facilityIcon, { backgroundColor: C.bg }]}>
                    <IconSymbol name={facility.icon as any} size={16} color={C.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{facility.name}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary }}>{facility.occupancy}% occupied · {facility.capacity} cap</Text>
                  </View>
                  <View style={[s.bookBtn, { backgroundColor: C.label }]}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Book</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:       { flex: 1 },
  topBarOuter:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:       { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:    { fontSize: 13, fontWeight: '700' },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 8 },
  row:          { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  statsCard:    { flexDirection: 'row', borderRadius: 14, overflow: 'hidden', marginBottom: 20 },
  statCol:      { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statBorder:   { borderRightWidth: StyleSheet.hairlineWidth },
  facilityCard: { borderRadius: 14, padding: 14, marginBottom: 0 },
  facilityIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statusBadge:  { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  bookBtn:      { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8 },
});
