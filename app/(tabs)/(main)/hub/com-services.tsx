/**
 * Community Services — ICCLA.
 * Pastor: This Sunday hero, OOS (collapsible), Sermon Prep, Volunteer Scheduling, Check-In (live only), Past Services.
 * Member: Next Service card, Last Sermon card, Sermon Notes space, Upcoming Services list.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ─── Data ──────────────────────────────────────────────────────────────────────────────────

const THIS_SUNDAY = {
  date:                'Sunday, April 20, 2026',
  time:                '11:00 AM',
  location:            'Main Sanctuary',
  sermonTitle:         'He Is Risen',
  speaker:             'Pastor Dipo Kalejaiye',
  scripture:           'Luke 24:1–12',
  volunteersConfirmed: 24,
  volunteersNeeded:    30,
};

const ORDER_OF_SERVICE = [
  { id: '1', name: 'Pre-Service Prayer',     person: 'Deacon James', duration: '15 min', notes: 'Prayer room opens at 8:30 AM',                      mediaCue: 'Soft instrumental'    },
  { id: '2', name: 'Opening Worship',        person: 'Pastor Nony',  duration: '20 min', notes: '3 songs: Resurrecting, Glorious, Because He Lives', mediaCue: 'Worship deck slide 1'  },
  { id: '3', name: 'Welcome & Announcements',person: 'Elder Paul',   duration: '5 min',  notes: 'Welcome first-time visitors',                       mediaCue: 'Welcome slide'         },
  { id: '4', name: 'Tithes & Offering',      person: 'Bro. Emeka',  duration: '10 min', notes: 'Offering envelopes available',                      mediaCue: 'Giving slide'          },
  { id: '5', name: 'Special Music',          person: 'Choir',        duration: '8 min',  notes: 'Easter anthem',                                    mediaCue: 'Choir spotlight'       },
  { id: '6', name: 'Sermon',                 person: 'Pastor Dipo', duration: '40 min', notes: 'Luke 24:1–12 · "He Is Risen"',                     mediaCue: 'Scripture slides'      },
  { id: '7', name: 'Altar Call',             person: 'Pastor Dipo', duration: '15 min', notes: 'Extended for Easter',                              mediaCue: 'Altar call music'      },
  { id: '8', name: 'Closing Worship',        person: 'Pastor Nony',  duration: '10 min', notes: 'Communion during worship',                         mediaCue: 'Communion slides'      },
  { id: '9', name: 'Benediction',            person: 'Pastor Dipo', duration: '5 min',  notes: '',                                                 mediaCue: ''                     },
];

const VOLUNTEER_AREAS = [
  { area: 'Greeters',             scheduled: 'Sis. Ada, Bro. Tunde', status: 'confirmed' as const },
  { area: 'Ushers',               scheduled: 'Bro. Sam, Bro. Chidi', status: 'confirmed' as const },
  { area: 'Worship Team',         scheduled: 'Pastor Nony + 6',      status: 'confirmed' as const },
  { area: "Children's/Sheepfold", scheduled: 'Sis. Ruth (1 gap)',    status: 'gap'       as const },
  { area: 'Youth/Fresh Fire',     scheduled: 'David Eze',            status: 'confirmed' as const },
  { area: 'Nursery',              scheduled: 'Pending',              status: 'pending'   as const },
  { area: 'Parking',              scheduled: 'Bro. Lekan',           status: 'confirmed' as const },
  { area: 'Sound/Media',          scheduled: 'Ksticks',              status: 'confirmed' as const },
  { area: 'Setup/Teardown',       scheduled: 'Bro. Felix + 2',       status: 'confirmed' as const },
];

const PAST_SERVICES = [
  { date: 'Apr 13, 2026', type: 'Sunday Morning', attendance: 312, sermon: 'Palm Sunday: The King Comes'     },
  { date: 'Apr 9, 2026',  type: 'Wednesday Night', attendance: 87,  sermon: 'Lenten Devotional: The Garden'  },
  { date: 'Apr 6, 2026',  type: 'Sunday Morning', attendance: 298, sermon: 'Preparing Our Hearts for Easter' },
];

const UPCOMING_SERVICES = [
  { date: 'Apr 20', day: 'Sunday',    time: '11:00 AM', type: 'Easter Sunday Service' },
  { date: 'Apr 23', day: 'Wednesday', time: '7:00 PM',  type: 'Wednesday Bible Study' },
  { date: 'Apr 27', day: 'Sunday',    time: '11:00 AM', type: 'Sunday Morning Service' },
  { date: 'Apr 30', day: 'Wednesday', time: '7:00 PM',  type: 'Wednesday Bible Study'  },
];

const LAST_SERMON = {
  title:     'Palm Sunday: The King Comes',
  scripture: 'Matthew 21:1–11',
  date:      'April 13, 2026',
  pastor:    'Pastor Dipo Kalejaiye',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: ComponentColors }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 12 }}>
      {title}
    </Text>
  );
}

function ProgressBar({ pct, color, C }: { pct: number; color: string; C: ComponentColors }) {
  return (
    <View style={{ height: 5, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: color, width: `${Math.min(pct, 100)}%` as any }} />
    </View>
  );
}

// ─── Main ───────────────────────────────────────────────────────────────────────────────────

export default function ComServicesScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(C), [C]);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isPastor = role === roleCycles[0];
  const [oosExpanded, setOosExpanded] = useState(false);
  const [sermonNotes, setSermonNotes] = useState('');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const volPct = Math.round((THIS_SUNDAY.volunteersConfirmed / THIS_SUNDAY.volunteersNeeded) * 100);
  const volColor = volPct >= 90 ? GAIN : volPct >= 70 ? CAUTION : HEAT;

  const statusColor = (s: 'confirmed' | 'pending' | 'gap') =>
    s === 'confirmed' ? GAIN : s === 'pending' ? CAUTION : HEAT;
  const statusLabel = (s: 'confirmed' | 'pending' | 'gap') =>
    s === 'confirmed' ? 'Confirmed' : s === 'pending' ? 'Pending' : 'Gap';

  // ── PASTOR VIEW ────────────────────────────────────────────────────────────────────
  const renderPastor = () => (
    <>
      {/* THIS SUNDAY HERO */}
      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <SH title="This Sunday" C={C} />
        <View style={styles.card}>
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginBottom: 2 }}>{THIS_SUNDAY.sermonTitle}</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>{THIS_SUNDAY.scripture}</Text>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSymbol name="calendar" size={12} color={C.secondary} />
              <Text style={{ fontSize: 12, color: C.secondary }}>{THIS_SUNDAY.date}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <IconSymbol name="clock" size={12} color={C.secondary} />
              <Text style={{ fontSize: 12, color: C.secondary }}>{THIS_SUNDAY.time}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IconSymbol name="person.fill" size={12} color={C.secondary} />
            <Text style={{ fontSize: 12, color: C.secondary }}>{THIS_SUNDAY.speaker} · {THIS_SUNDAY.location}</Text>
          </View>
          {/* Volunteer coverage bar */}
          <View style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
              <Text style={{ fontSize: 12, color: C.secondary }}>Volunteer Coverage</Text>
              <Text style={{ fontSize: 12, fontWeight: '700', color: volColor }}>
                {THIS_SUNDAY.volunteersConfirmed}/{THIS_SUNDAY.volunteersNeeded} filled
              </Text>
            </View>
            <ProgressBar pct={volPct} color={volColor} C={C} />
          </View>
        </View>
      </View>

      {/* ORDER OF SERVICE */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Order of Service" C={C} />
        <Pressable
          style={[styles.card, { flexDirection: 'row', alignItems: 'center' }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setOosExpanded(v => !v); }}
        >
          <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>
            {oosExpanded ? 'Hide Order of Service' : `View Order of Service (${ORDER_OF_SERVICE.length} elements)`}
          </Text>
          <IconSymbol name={oosExpanded ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
        </Pressable>

        {oosExpanded && ORDER_OF_SERVICE.map((item, i) => (
          <View key={item.id} style={[styles.card, { marginBottom: 6 }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
              <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: C.label }}>{i + 1}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: C.label }}>{item.name}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{item.duration}</Text>
            </View>
            <Text style={{ fontSize: 12, color: C.secondary, marginBottom: 2 }}>👤 {item.person}</Text>
            {item.notes ? <Text style={{ fontSize: 12, color: C.muted, marginBottom: 2 }}>{item.notes}</Text> : null}
            {item.mediaCue ? <Text style={{ fontSize: 11, color: C.muted, fontStyle: 'italic' }}>🎬 {item.mediaCue}</Text> : null}
          </View>
        ))}

        {/* Template actions */}
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <Pressable style={[styles.outlineBtn, { flex: 1 }]}>
            <IconSymbol name="doc.on.doc" size={13} color={C.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Copy Last Week</Text>
          </Pressable>
          <Pressable style={[styles.outlineBtn, { flex: 1 }]}>
            <IconSymbol name="doc.plaintext" size={13} color={C.secondary} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Templates</Text>
          </Pressable>
        </View>
      </View>

      {/* SERMON PREP */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Sermon Prep" C={C} />
        <View style={styles.card}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 4 }}>Scripture</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 12 }}>{THIS_SUNDAY.scripture} — Luke 24:1–12</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 4 }}>Key Points</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 2 }}>1. The stone is rolled away — God removes what we cannot</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 2 }}>2. They remembered His words — faith is rooted in His promises</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>3. Go and tell — the resurrection demands a response</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 4 }}>Illustrations</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 12 }}>Empty tomb vs. full life. The women who showed up.</Text>
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.label, marginBottom: 4 }}>Application / Altar Call</Text>
          <Text style={{ fontSize: 13, color: C.secondary }}>What stone do you need rolled away today?</Text>
        </View>
        <Pressable style={[styles.outlineBtn, { marginTop: 8 }]}>
          <IconSymbol name="sparkles" size={13} color={C.secondary} />
          <Text style={{ fontSize: 13, fontWeight: '600', color: C.secondary }}>Dipson: Help me find an illustration</Text>
        </Pressable>
      </View>

      {/* VOLUNTEER SCHEDULING */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Volunteer Scheduling" C={C} />
        {VOLUNTEER_AREAS.map((v, i) => {
          const col = statusColor(v.status);
          return (
            <View key={i} style={[styles.card, { marginBottom: 6, flexDirection: 'row', alignItems: 'center' }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, marginBottom: 2 }}>{v.area}</Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{v.scheduled}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ backgroundColor: col + '20', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color: col }}>{statusLabel(v.status)}</Text>
                </View>
                {v.status !== 'confirmed' && (
                  <Pressable style={{ backgroundColor: C.label, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 }}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>Assign</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* CHECK-IN (live on service day only — shown as preview here) */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Check-In" C={C} />
        <View style={[styles.card, { backgroundColor: C.separator + '44' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: HEAT }} />
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.secondary }}>Live on service day only</Text>
          </View>
          <Text style={{ fontSize: 12, color: C.muted }}>Real-time check-in, first-time visitor flags, and children's check-in will appear here during an active service.</Text>
        </View>
      </View>

      {/* PAST SERVICES */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Past Services" C={C} />
        {PAST_SERVICES.map((svc, i) => (
          <Pressable key={i} style={[styles.card, { marginBottom: 6, flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{svc.sermon}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{svc.type} · {svc.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 4 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{svc.attendance}</Text>
              <Text style={{ fontSize: 10, color: C.muted }}>attended</Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={C.muted} style={{ marginLeft: 8 }} />
          </Pressable>
        ))}
      </View>
    </>
  );

  // ── MEMBER VIEW ───────────────────────────────────────────────────────────────────────────
  const renderMember = () => (
    <>
      {/* NEXT SERVICE */}
      <View style={{ marginTop: 20, marginBottom: 28 }}>
        <SH title="Next Service" C={C} />
        <View style={styles.card}>
          <Text style={{ fontSize: 20, fontWeight: '800', color: C.label, marginBottom: 4 }}>Easter Sunday Service</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginBottom: 10 }}>He Is Risen · Luke 24:1–12</Text>
          <View style={{ flexDirection: 'row', gap: 14, flexWrap: 'wrap' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <IconSymbol name="calendar" size={13} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary }}>Sunday, April 20, 2026</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <IconSymbol name="clock" size={13} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary }}>11:00 AM</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <IconSymbol name="location.fill" size={13} color={C.secondary} />
              <Text style={{ fontSize: 13, color: C.secondary }}>Main Sanctuary</Text>
            </View>
          </View>
          <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
            <Text style={{ fontSize: 13, color: C.secondary }}>Speaker: Pastor Dipo Kalejaiye</Text>
          </View>
        </View>
      </View>

      {/* LAST SERMON */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Last Sermon" C={C} />
        <View style={styles.card}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, marginBottom: 2 }}>{LAST_SERMON.title}</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 6 }}>{LAST_SERMON.scripture} · {LAST_SERMON.date}</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 14 }}>{LAST_SERMON.pastor}</Text>
          <Pressable style={{ backgroundColor: C.label, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>Watch on KTV</Text>
          </Pressable>
        </View>
      </View>

      {/* SERMON NOTES */}
      <View style={{ marginBottom: 28 }}>
        <SH title="My Sermon Notes" C={C} />
        <View style={[styles.card, { padding: 0 }]}>
          <TextInput
            style={{ fontSize: 14, color: C.label, padding: 14, minHeight: 120, textAlignVertical: 'top' }}
            placeholder="Your notes are private and saved to this sermon..."
            placeholderTextColor={C.muted}
            multiline
            value={sermonNotes}
            onChangeText={setSermonNotes}
          />
        </View>
      </View>

      {/* UPCOMING SERVICES */}
      <View style={{ marginBottom: 28 }}>
        <SH title="Upcoming Services" C={C} />
        {UPCOMING_SERVICES.map((svc, i) => (
          <View key={i} style={[styles.card, { marginBottom: 6, flexDirection: 'row', alignItems: 'center' }]}>
            <View style={{ width: 48, alignItems: 'center', marginRight: 12 }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary, textTransform: 'uppercase' }}>{svc.day.slice(0, 3)}</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{svc.date.split(' ')[1]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>{svc.type}</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{svc.time}</Text>
            </View>
          </View>
        ))}
      </View>
    </>
  );

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>

      {/* ── Top bar ── */}
      <Animated.View style={[styles.topBar, { paddingTop: insets.top, opacity }]}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Services</Text>
            </View>
          </View>
          <View style={{ width: 80, alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H, paddingBottom: 120, paddingHorizontal: 16 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {isPastor ? renderPastor() : renderMember()}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1 },
  topBar:    { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, backgroundColor: C.bg },
  card:      { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8 },
  outlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: C.separator, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
});
