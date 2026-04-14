/**
 * Business Hub — KaNeXT Company Overview.
 * Matches Personal Hub profile page pattern exactly:
 * photo cover → floating top bar → overlapping avatar → identity → metrics → sections.
 * CEO: full company view (active projects, pipeline, team, top clients).
 * Customer: client portal (my projects, invoices, quick access).
 * K button opens side panel for deeper navigation.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Image, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
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

const COMPANY = {
  name:    'KaNeXT',
  location:'Miami, FL',
  bio:     'Building the OS for institutions',
  team:    13,
  mrr:     '$49K',
};

const ACTIVE_PROJECTS = [
  { name: 'KaNeXT OS v2.0',        client: 'Internal',      health: 'green', progress: 78 },
  { name: 'LU Athletics Platform', client: 'Lincoln Univ.', health: 'green', progress: 62 },
  { name: 'ICCLA Community App',   client: 'ICCLA',         health: 'amber', progress: 44 },
  { name: 'Player Pool Engine',    client: 'Internal',      health: 'green', progress: 15 },
];

const PIPELINE = [
  { stage: 'Prospecting', count: 8,  value: '$124K' },
  { stage: 'Proposal',    count: 4,  value: '$89K'  },
  { stage: 'Negotiation', count: 2,  value: '$42K'  },
  { stage: 'Closed Won',  count: 11, value: '$287K' },
];

const TEAM_MEMBERS = [
  { name: 'Sammy Kalejaiye', role: 'CEO & Founder',    ood: false, oodNote: '' },
  { name: 'Marcus Reed',     role: 'Lead Engineer',    ood: false, oodNote: '' },
  { name: 'Laolu Kalejaiye', role: 'Product Designer', ood: false, oodNote: '' },
  { name: 'Aisha Johnson',   role: 'Head of Sales',    ood: true,  oodNote: 'OOO until Apr 14' },
];

const TOP_CLIENTS = [
  { name: 'Lincoln University', mrr: '$4,200', since: 'Jan 2024', health: 'green' },
  { name: 'ICCLA Church',       mrr: '$1,800', since: 'Mar 2024', health: 'amber' },
  { name: 'Bay Area Academy',   mrr: '$2,400', since: 'Nov 2023', health: 'green' },
];

const MY_PROJECTS = [
  { name: 'LU Athletics Platform', due: 'May 15', progress: 62 },
  { name: 'Recruiting Module v2',  due: 'Jun 1',  progress: 15 },
];

const MY_INVOICES = [
  { number: 'INV-0042', amount: '$4,200', paid: true,  due: 'Apr 1' },
  { number: 'INV-0043', amount: '$4,200', paid: false, due: 'May 1' },
];

function healthColor(h: string): string {
  return h === 'green' ? GAIN : h === 'amber' ? CAUTION : HEAT;
}
function progressColor(p: number): string {
  return p >= 70 ? GAIN : p >= 40 ? CAUTION : HEAT;
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SH({ title, C }: { title: string; C: any }) {
  return (
    <Text style={[s.sh, { color: C.secondary }]}>{title}</Text>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function BusinessHub() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [role, toggleRole, roleCycles] = useDemoRole('business:hub');
  const isCEO = role === roleCycles[0];

  const COVER_H = 220 + insets.top + TOP_BAR_H;
  const activeCount = ACTIVE_PROJECTS.filter(p => p.progress > 14).length;

  useFocusEffect(useCallback(() => { resetFooter(); }, []));
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(insets.top + TOP_BAR_H + 10);

  const go = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Floating top bar ─────────────────────────────────────────────── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, height: insets.top + TOP_BAR_H, opacity }]}>
        <View style={s.topBar}>
          <KMenuButton onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} />
          <View style={s.topCenter}>
            <Text style={s.topTitle}>Hub</Text>
          </View>
          <RolePill role={role} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleRole(); }} />
        </View>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* ── Cover photo + overlapping avatar ─────────────────────────── */}
        <View style={{ position: 'relative', marginBottom: AVATAR_OVR + 12 }}>
          <View style={{ height: COVER_H, overflow: 'hidden' }}>
            <Image
              source={{ uri: 'https://picsum.photos/seed/modern-office/900/500' }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top + 70, backgroundColor: 'rgba(0,0,0,0.40)' }} />
            <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.20)' }} />
          </View>
          <View style={{ position: 'absolute', bottom: -AVATAR_OVR, left: 20 }}>
            <View style={[s.avatar, { backgroundColor: C.surface, borderColor: C.bg }]}>
              <Text style={[s.avatarK, { color: C.label }]}>K</Text>
            </View>
          </View>
        </View>

        {/* ── Identity ─────────────────────────────────────────────────── */}
        <View style={[s.identity, { paddingHorizontal: 20 }]}>
          <Text style={[s.name, { color: C.label }]}>{COMPANY.name}</Text>
          <Text style={[s.handle, { color: C.secondary }]}>{COMPANY.location}</Text>
          <Text style={[s.bio, { color: C.label }]}>{COMPANY.bio}</Text>
        </View>

        {/* ── Key metrics + action row ──────────────────────────────────── */}
        <View style={[s.metricActionRow, { paddingHorizontal: 20, borderColor: C.separator }]}>
          <Text style={{ fontSize: 14, color: C.secondary }}>
            <Text style={{ fontWeight: '700', color: C.label }}>{COMPANY.team}</Text>{' Team  ·  '}
            <Text style={{ fontWeight: '700', color: GAIN }}>{COMPANY.mrr}</Text>{' MRR  ·  '}
            <Text style={{ fontWeight: '700', color: C.label }}>{activeCount}</Text>{' Active'}
          </Text>
          <Pressable
            style={[s.editBtn, { borderColor: C.separator }]}
            onPress={() => isCEO ? go('/(tabs)/(main)/hub/reports') : go('/(tabs)/(main)/inquiries')}
          >
            <Text style={[s.editBtnText, { color: C.label }]}>{isCEO ? 'Reports' : 'Request'}</Text>
          </Pressable>
        </View>

        {/* ── Status badge ─────────────────────────────────────────────── */}
        <View style={[s.badgeRow, { borderTopColor: C.separator, borderBottomColor: C.separator }]}>
          <View style={[s.badge, { backgroundColor: GAIN + '18', borderColor: GAIN + '44' }]}>
            <Text style={[s.badgeText, { color: GAIN }]}>🏢 SWS Champion Tech Stack · 2024–2025</Text>
          </View>
        </View>

        {isCEO ? (
          <>
            {/* ACTIVE PROJECTS */}
            <View style={s.section}>
              <SH title="Active Projects" C={C} />
              {ACTIVE_PROJECTS.map((p, i) => (
                <Pressable
                  key={i}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => {}}
                >
                  <View style={[s.healthDot, { backgroundColor: healthColor(p.health), marginTop: 4 }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{p.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 2 }]}>{p.client}</Text>
                    <View style={[s.progressTrack, { backgroundColor: C.separator, marginTop: 8 }]}>
                      <View style={[s.progressFill, { backgroundColor: progressColor(p.progress), width: `${p.progress}%` }]} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: progressColor(p.progress), marginTop: 2 }}>{p.progress}%</Text>
                </Pressable>
              ))}
            </View>

            {/* PIPELINE */}
            <View style={s.section}>
              <SH title="Pipeline" C={C} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
                {PIPELINE.map((pl, i) => (
                  <View key={i} style={[s.pipelineCard, { backgroundColor: C.surface, marginRight: 8 }]}>
                    <Text style={[s.pipelineValue, { color: C.label }]}>{pl.value}</Text>
                    <Text style={[s.pipelineCount, { color: C.secondary }]}>{pl.count} deals</Text>
                    <Text style={[s.pipelineStage, { color: C.secondary }]}>{pl.stage}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            {/* TEAM */}
            <View style={s.section}>
              <SH title="Team" C={C} />
              {TEAM_MEMBERS.map((m, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.personAvatar, { backgroundColor: C.separator }]}>
                    <Text style={[s.personInitials, { color: C.label }]}>
                      {m.name.split(' ').map(w => w[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{m.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>{m.ood ? m.oodNote : m.role}</Text>
                  </View>
                  {m.ood && (
                    <View style={[s.ooBadge, { backgroundColor: CAUTION + '22' }]}>
                      <Text style={[s.ooBadgeText, { color: CAUTION }]}>OOO</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>

            {/* TOP CLIENTS */}
            <View style={s.section}>
              <SH title="Top Clients" C={C} />
              {TOP_CLIENTS.map((c, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.healthDot, { backgroundColor: healthColor(c.health) }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{c.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>Since {c.since}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: GAIN }}>{c.mrr}/mo</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* MY PROJECTS */}
            <View style={s.section}>
              <SH title="My Projects" C={C} />
              {MY_PROJECTS.map((p, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 }]}>
                  <View style={[s.healthDot, { backgroundColor: progressColor(p.progress), marginTop: 4 }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{p.name}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 2 }]}>Due {p.due}</Text>
                    <View style={[s.progressTrack, { backgroundColor: C.separator, marginTop: 8 }]}>
                      <View style={[s.progressFill, { backgroundColor: progressColor(p.progress), width: `${p.progress}%` }]} />
                    </View>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: progressColor(p.progress), marginTop: 2 }}>{p.progress}%</Text>
                </View>
              ))}
            </View>

            {/* INVOICES */}
            <View style={s.section}>
              <SH title="Invoices" C={C} />
              {MY_INVOICES.map((inv, i) => (
                <View key={i} style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.label }]}>{inv.number}</Text>
                    <Text style={[s.cardMeta, { color: C.secondary, marginTop: 1 }]}>Due {inv.due}</Text>
                  </View>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label, marginRight: 8 }}>{inv.amount}</Text>
                  <View style={[s.invBadge, { backgroundColor: inv.paid ? GAIN + '22' : CAUTION + '22' }]}>
                    <Text style={[s.invBadgeText, { color: inv.paid ? GAIN : CAUTION }]}>
                      {inv.paid ? 'Paid' : 'Due'}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* QUICK ACCESS */}
            <View style={s.section}>
              <SH title="Quick Access" C={C} />
              {[
                { icon: 'envelope.fill', label: 'Contact Team',    sub: 'Send us a message',  route: '/(tabs)/(main)/inquiries' },
                { icon: 'doc.fill',      label: 'Documents',       sub: 'Contracts & files',  route: ''                         },
                { icon: 'calendar',      label: 'Schedule a Call', sub: 'Book a meeting',      route: ''                        },
              ].map(item => (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [s.card, { backgroundColor: C.surface, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 }, pressed && { opacity: 0.8 }]}
                  onPress={() => item.route ? go(item.route) : undefined}
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

  topBarOuter: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
  },
  topBar: {
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 10,
  },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle:  { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },

  avatar: {
    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
    borderWidth: 3, alignItems: 'center', justifyContent: 'center',
  },
  avatarK: { fontSize: 32, fontWeight: '900' },

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

  healthDot:  { width: 8, height: 8, borderRadius: 4 },

  personAvatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  personInitials: { fontSize: 12, fontWeight: '700' },

  ooBadge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  ooBadgeText: { fontSize: 11, fontWeight: '700' },

  pipelineCard: {
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    alignItems: 'center', gap: 2, minWidth: 100,
  },
  pipelineValue: { fontSize: 16, fontWeight: '800' },
  pipelineCount: { fontSize: 11 },
  pipelineStage: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8 },

  progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill:  { height: 4, borderRadius: 2 },

  invBadge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  invBadgeText: { fontSize: 11, fontWeight: '700' },
});
