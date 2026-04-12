/**
 * Community Hub — ICCLA Church Overview.
 * Matches Personal Hub profile page pattern exactly:
 * photo cover → floating top bar → overlapping avatar → identity → metrics → sections.
 * Senior Leader: full church view (services, ministries, leadership, giving, announcements).
 * Member: member-focused view (next service, my groups, announcements, quick access).
 * K button opens side panel for deeper navigation.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const TOP_BAR_H   = 52;
const AVATAR_SIZE = 80;
const AVATAR_OVR  = AVATAR_SIZE / 2;

// ─── Data ─────────────────────────────────────────────────────────────────────

const CHURCH = {
  name:      'ICCLA',
  location:  'Hawthorne, CA',
  type:      'Interdenominational · Pentecostal',
  members:   420,
  ministries:10,
};

const SERVICES = [
  { icon: 'sun.max.fill',      name: 'Sunday Service',  time: 'Sun 10:00 AM', location: 'Main Sanctuary' },
  { icon: 'book.fill',         name: 'Bible Study',     time: 'Wed 7:00 PM',  location: 'Fellowship Hall' },
  { icon: 'hands.sparkles.fill',name: 'Prayer Meeting', time: 'Fri 6:30 AM',  location: 'Prayer Room'    },
];

const MINISTRIES = [
  { name: 'Worship Team',        leader: 'Pastor Nony',  members: 24 },
  { name: 'Youth Ministry',      leader: 'Tobi A.',      members: 48 },
  { name: "Children's Church",   leader: 'Sister Ada',   members: 36 },
  { name: "Men's Fellowship",    leader: 'Bro. Emeka',   members: 32 },
  { name: "Women's Ministry",    leader: 'Sis. Grace',   members: 41 },
  { name: 'Prayer Ministry',     leader: 'Deacon James', members: 28 },
  { name: 'Evangelism',          leader: 'Elder Paul',   members: 19 },
  { name: 'Hospitality',         leader: 'Sis. Ruth',    members: 22 },
  { name: 'Media & Tech',        leader: 'Bro. David',   members: 12 },
  { name: 'Missions & Outreach', leader: 'Pastor Dipo',  members: 15 },
];

const ANNOUNCEMENTS = [
  { title: 'Easter Sunday Service', date: 'Apr 20', body: 'Special sunrise service at 6:00 AM + main service at 10:00 AM.' },
  { title: "Women's Conference",    date: 'Apr 26', body: "Annual Women's Conference — register by Apr 18." },
  { title: 'Building Fund Update',  date: 'Apr 10', body: "We've reached 65% of our $250K building renovation goal!" },
];

const LEADERSHIP = [
  { name: 'Pastor Dipo Kalejaiye', role: 'Senior Pastor'    },
  { name: 'Pastor Nony Kalejaiye', role: 'Associate Pastor' },
  { name: 'Elder James Thompson',  role: 'Board Chairman'   },
];

const GIVING = {
  monthly: '$18,420',
  goal:    '$22,000',
  pct:     84,
  campaign:'Building Fund: 65% of $250K',
};

const MY_GROUPS = [
  { name: "Men's Fellowship", nextMeeting: 'Sat Apr 12, 9:00 AM' },
  { name: 'Media & Tech',     nextMeeting: 'Mon Apr 14, 6:00 PM' },
];

// ─── Section Header ───────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: any }) {
  return (
    <Text style={[s.sh, { color: C.secondary }]}>{title}</Text>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CommunityHub() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, toggleRole, roleCycles] = useDemoRole('community:hub');
  const isLeader = role === roleCycles[0];

  const COVER_H = 220 + insets.top + TOP_BAR_H;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Floating top bar ─────────────────────────────────────────────── */}
      <View style={[s.topBar, { paddingTop: insets.top, height: insets.top + TOP_BAR_H }]}>
        <KMenuButton onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} />
        <View style={s.topCenter}>
          <Text style={s.topTitle}>Hub</Text>
        </View>
        <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* ── Cover photo + overlapping avatar ─────────────────────────── */}
        <View style={{ position: 'relative', marginBottom: AVATAR_OVR + 12 }}>
          <View style={{ height: COVER_H, overflow: 'hidden' }}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/church-gathering/900/500' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 70, backgroundColor: 'rgba(0,0,0,0.40)' }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.20)' }} />
          </View>
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <View style={[s.avatar, { backgroundColor: C.surface, borderColor: C.bg }]}>
              <Text style={s.avatarEmoji}>✝️</Text>
            </View>
          </View>
        </View>

        {/* ── Identity ─────────────────────────────────────────────────── */}
        <View style={[s.identity, { paddingHorizontal: 20 }]}>
          <Text style={[s.name, { color: C.label }]}>{CHURCH.name}</Text>
          <Text style={[s.handle, { color: C.secondary }]}>{CHURCH.location}</Text>
          <Text style={[s.bio, { color: C.label }]}>{CHURCH.type}</Text>
        </View>

        {/* ── Key metrics + action row ──────────────────────────────────── */}
        <View style={[s.metricActionRow, { paddingHorizontal: 20, borderColor: C.separator }]}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{CHURCH.members}</Text>{' Members  ·  '}
            <Text style={{ fontWeight: '700', color: C.label }}>{CHURCH.ministries}</Text>{' Min.  ·  '}
            <Text style={{ fontWeight: '700', color: GAIN }}>{GIVING.pct}%</Text>{' Goal'}
          </Text>
          <Pressable
            style={[s.editBtn, { borderColor: C.separator }]}
            onPress={() => go('/(tabs)/(main)/give')}
          >
            <Text style={[s.editBtnText, { color: C.label }]}>{isLeader ? 'Dashboard' : 'Give Now'}</Text>
          </Pressable>
        </View>

        {/* ── Upcoming event badge ──────────────────────────────────────── */}
        <View style={[s.badgeRow, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
          <View style={[s.badge, { backgroundColor: GAIN + '18', borderColor: GAIN + '44' }]}>
            <Text style={[s.badgeText, { color: GAIN }]}>🌅 Easter Sunday Service · Apr 20</Text>
          </View>
        </View>

        {isLeader ? (
          <>
            {/* SERVICES */}
            <View style={s.section}>
              <SH title="Services" C={C} />
              {SERVICES.map((sv, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name={sv.icon as any} size={16} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{sv.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{sv.time} · {sv.location}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* MINISTRIES */}
            <View style={s.section}>
              <SH title="Ministries" C={C} />
              {MINISTRIES.map((m, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => go('/(tabs)/(main)/members')}
                >
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>
                      {m.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{m.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{m.leader} · {m.members} members</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
                </Pressable>
              ))}
            </View>

            {/* ANNOUNCEMENTS */}
            <View style={s.section}>
              <SH title="Announcements" C={C} />
              {ANNOUNCEMENTS.map((a, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={[s.cardTitle, { color: C.label, flex: 1 }]}>{a.title}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary }]}>{a.date}</Text>
                  </View>
                  <Text style={[s.cardMeta, { color: C.secondary, lineHeight: 18 }]}>{a.body}</Text>
                </View>
              ))}
            </View>

            {/* LEADERSHIP */}
            <View style={s.section}>
              <SH title="Leadership" C={C} />
              {LEADERSHIP.map((l, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>
                      {l.name.split(' ').filter(w => !['Pastor','Elder','Deacon'].includes(w)).slice(0, 2).map(w => w[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{l.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{l.role}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* GIVING */}
            <View style={s.section}>
              <SH title="Giving" C={C} />
              <View style={[s.card, { backgroundColor: C.surface }]}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{GIVING.monthly}</Text>
                  <Text style={[s.cardMeta, { color: C.secondary }]}>/ {GIVING.goal} goal</Text>
                </View>
                <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                  <View style={[s.progressFill, { backgroundColor: GAIN, width: `${GIVING.pct}%` }]} />
                </View>
                <Text style={[s.cardMeta, { color: C.secondary, marginTop: 8 }]}>{GIVING.campaign}</Text>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* NEXT SERVICE */}
            <View style={s.section}>
              <SH title="Next Service" C={C} />
              <View style={[s.card, { backgroundColor: C.surface }]}>
                <Text style={[s.cardTitle, { color: C.label }]}>Sunday Service</Text>
                <Text style={[s.cardMeta, { color: C.secondary, marginTop: 3 }]}>Sun Apr 13 · 10:00 AM · Main Sanctuary</Text>
                <View style={[{ marginTop: 10, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: GAIN + '22', alignSelf: 'flex-start' }]}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: GAIN }}>Easter Sunday Apr 20 — Special Service</Text>
                </View>
              </View>
            </View>

            {/* MY GROUPS */}
            <View style={s.section}>
              <SH title="My Groups" C={C} />
              {MY_GROUPS.map((g, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>
                      {g.name.split(' ').slice(0, 2).map(w => w[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{g.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>Next: {g.nextMeeting}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* ANNOUNCEMENTS */}
            <View style={s.section}>
              <SH title="Announcements" C={C} />
              {ANNOUNCEMENTS.slice(0, 2).map((a, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, marginBottom: 8 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                    <Text style={[s.cardTitle, { color: C.label, flex: 1 }]}>{a.title}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary }]}>{a.date}</Text>
                  </View>
                  <Text style={[s.cardMeta, { color: C.secondary, lineHeight: 18 }]}>{a.body}</Text>
                </View>
              ))}
            </View>

            {/* QUICK ACCESS */}
            <View style={s.section}>
              <SH title="Quick Access" C={C} />
              {[
                { icon: 'heart.fill',    label: 'Give Now',       sub: 'Tithes & offerings',           route: '/(tabs)/(main)/give'    },
                { icon: 'calendar',      label: 'Events',         sub: 'Upcoming church events',        route: '/(tabs)/(main)/agenda'  },
                { icon: 'person.2.fill', label: 'All Ministries', sub: `${CHURCH.ministries} active`,   route: '/(tabs)/(main)/members' },
              ].map(item => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => go(item.route)}
                >
                  <View style={[s.iconBox, { backgroundColor: C.separator }]}>
                    <IconSymbol name={item.icon as any} size={16} color={C.label} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{item.label}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{item.sub}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={14} color={C.muted as string} />
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle:  { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  avatarEmoji: { fontSize: 36 },

  identity:  { marginBottom: 14 },
  name:      { fontSize: 20, fontWeight: '700', marginBottom: 2 },
  handle:    { fontSize: 14, marginBottom: 6 },
  bio:       { fontSize: 14, lineHeight: 20, opacity: 0.85 },

  metricActionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, marginBottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  editBtn:     { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  editBtnText: { fontSize: 13, fontWeight: '600' },

  badgeRow: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth, borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
  badge:     { borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 6, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, fontWeight: '700' },

  section: { paddingHorizontal: 20, marginBottom: 28 },

  sh: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase',
    marginBottom: 12, marginTop: 4,
  },

  card:      { borderRadius: 12, padding: 14, marginBottom: 0 },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  cardMeta:  { fontSize: 12 },

  iconBox: {
    width: 36, height: 36, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },

  personAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  personInitials: { fontSize: 12, fontWeight: '700' },

  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill:  { height: 6, borderRadius: 3 },
});
