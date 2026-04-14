/**
 * Community Outreach — index.
 * Pastor: Pipeline funnel with collapsible stages, overdue cards, funnel stats.
 * Member (Visitor): Invite a Friend + share buttons + My Invites + Upcoming Events.
 */

import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ──────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TODAY   = 'Apr 10';

// ── Mock data ─────────────────────────────────────────────────────────────────

const OVERDUE_PROSPECTS = [
  { id: 'od1', name: 'Priya Sharma',   source: 'Walk-In',       overdueDays: 11, hue: 160 },
  { id: 'od2', name: 'Layla Ibrahim',  source: 'Community Event', overdueDays: 25, hue: 110 },
];

const PIPELINE_STAGES = [
  {
    id: 'explorer',
    label: 'Explorer',
    count: 3,
    prospects: [
      { id: 'p1', name: 'Michael Torres',  source: 'Website',       dateEntered: 'Apr 1',  assigned: 'Elder James',  nextDue: 'Apr 12', hue: 200 },
      { id: 'p2', name: 'Zara Osei',       source: 'Member Invite', dateEntered: 'Apr 3',  assigned: 'Pastor E.',    nextDue: 'Apr 14', hue: 50  },
      { id: 'p3', name: 'Ben Ortiz',       source: 'Website',       dateEntered: 'Apr 7',  assigned: 'Deacon Paul',  nextDue: 'Apr 18', hue: 290 },
    ],
  },
  {
    id: 'first_visit',
    label: 'First Visit',
    count: 8,
    prospects: [
      { id: 'p4', name: 'Henry Mensah',    source: 'Member Invite', dateEntered: 'Mar 30', assigned: 'Deacon Paul',  nextDue: 'Apr 6',  hue: 290 },
      { id: 'p5', name: 'Alicia Ford',     source: 'Social',        dateEntered: 'Apr 2',  assigned: 'Elder James',  nextDue: 'Apr 13', hue: 340 },
      { id: 'p6', name: 'Samuel Okeke',    source: 'Walk-In',       dateEntered: 'Apr 5',  assigned: 'Pastor E.',    nextDue: 'Apr 15', hue: 30  },
    ],
  },
  {
    id: 'connected',
    label: 'Connected',
    count: 6,
    prospects: [
      { id: 'p7', name: 'Andre Williams',  source: 'Member Invite', dateEntered: 'Mar 16', assigned: 'Pastor E.',    nextDue: 'Apr 9',  hue: 340 },
      { id: 'p8', name: 'Kim Santos',      source: 'Social',        dateEntered: 'Mar 20', assigned: 'Elder James',  nextDue: 'Apr 11', hue: 120 },
    ],
  },
  {
    id: 'followup',
    label: 'Follow-Up Sent',
    count: 7,
    prospects: [
      { id: 'p9', name: 'Layla Ibrahim',   source: 'Community Event', dateEntered: 'Mar 9', assigned: 'Deacon Paul', nextDue: 'Mar 16', hue: 110 },
      { id: 'p10', name: 'Priya Sharma',   source: 'Walk-In',         dateEntered: 'Mar 23', assigned: 'Elder James', nextDue: 'Mar 30', hue: 160 },
    ],
  },
  {
    id: 'returned',
    label: 'Returned',
    count: 4,
    prospects: [
      { id: 'p11', name: 'Taiwo Adesanya', source: 'Member Invite', dateEntered: 'Mar 5',  assigned: 'Pastor E.',    nextDue: 'Apr 12', hue: 200 },
    ],
  },
  {
    id: 'joined_group',
    label: 'Joined Group',
    count: 4,
    prospects: [
      { id: 'p12', name: 'Amara Diallo',   source: 'Website',       dateEntered: 'Feb 28', assigned: 'Elder James',  nextDue: 'Apr 15', hue: 60  },
    ],
  },
  {
    id: 'became_member',
    label: 'Became Member',
    count: 2,
    prospects: [
      { id: 'p13', name: 'Chris Adeyemi',  source: 'Member Invite', dateEntered: 'Feb 1',  assigned: 'Pastor E.',    nextDue: '—',      hue: 120 },
    ],
  },
];

const MY_INVITES = [
  { id: 'i1', name: 'Chris Adeyemi',  status: 'Joined',  hue: 120 },
  { id: 'i2', name: 'Dana Morrison',  status: 'Visited', hue: 60  },
  { id: 'i3', name: 'Frank Nwosu',    status: 'Invited', hue: 200 },
];

const MEMBER_EVENTS = [
  { id: 'e1', name: 'Community BBQ',    date: 'Apr 20', location: 'Church Grounds'   },
  { id: 'e2', name: 'Easter Drive',     date: 'Apr 13', location: 'Main Auditorium'  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function inviteStatusStyle(status: string, C: ComponentColors) {
  if (status === 'Joined')  return { bg: GAIN,    text: '#fff'       };
  if (status === 'Visited') return { bg: CAUTION, text: '#fff'       };
  return { bg: C.separator, text: C.secondary };
}

function isOverdue(nextDue: string): boolean {
  if (nextDue === '—') return false;
  return nextDue < TODAY;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function OutreachIndexScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();

  const [role, cycleRole, roleCycles] = useDemoRole('community:outreach');
  const isPastor = role === roleCycles[0];

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['explorer', 'first_visit']));

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const toggleStage = (id: string) => {
    Haptics.selectionAsync();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Pastor Pipeline view ───────────────────────────────────────────────────

  function renderPastorView() {
    return (
      <>
        {/* Funnel stats row */}
        <View style={s.statsRow}>
          {[
            { label: 'Total Prospects', value: '34',  color: C.label  },
            { label: 'Conversion Rate', value: '18%', color: GAIN     },
            { label: 'New This Month',  value: '7',   color: CAUTION  },
          ].map(stat => (
            <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }]}>
              <Text style={[s.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Overdue follow-ups */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Overdue Follow-Ups</Text>
        {OVERDUE_PROSPECTS.map(p => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [
              s.overdueCard,
              { backgroundColor: C.surface, borderLeftColor: HEAT },
              pressed && { opacity: 0.85 },
            ]}
            onPress={() => Alert.alert(
              p.name,
              `Source: ${p.source}\nOverdue by ${p.overdueDays} days`,
              [{ text: 'View' }, { text: 'Dismiss', style: 'cancel' }],
            )}
          >
            <View style={[s.avatar, { backgroundColor: `hsl(${p.hue},42%,32%)` }]}>
              <Text style={s.avatarText}>{p.name.split(' ').map(w => w[0]).join('').slice(0, 2)}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[s.prospectName, { color: C.label }]}>{p.name}</Text>
              <View style={[s.sourceBadge, { backgroundColor: C.separator }]}>
                <Text style={[s.sourceBadgeText, { color: C.label }]}>{p.source}</Text>
              </View>
            </View>
            <Text style={[s.overdueDays, { color: HEAT }]}>Overdue {p.overdueDays}d</Text>
          </Pressable>
        ))}

        {/* Stage sections */}
        <Text style={[s.sectionTitle, { color: C.secondary, marginTop: 20 }]}>Pipeline Stages</Text>
        {PIPELINE_STAGES.map(stage => {
          const isOpen = expanded.has(stage.id);
          return (
            <View key={stage.id} style={{ marginBottom: 10 }}>
              <Pressable
                style={({ pressed }) => [
                  s.stageHeader,
                  { backgroundColor: C.surface },
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => toggleStage(stage.id)}
              >
                <Text style={[s.stageLabel, { color: C.label }]}>{stage.label}</Text>
                <View style={[s.stageBadge, { backgroundColor: C.separator }]}>
                  <Text style={[s.stageBadgeText, { color: C.label }]}>{stage.count}</Text>
                </View>
                <IconSymbol
                  name={isOpen ? 'chevron.up' : 'chevron.down'}
                  size={14}
                  color={C.secondary}
                />
              </Pressable>

              {isOpen && stage.prospects.length > 0 && (
                <View style={[s.card, { backgroundColor: C.surface }]}>
                  {stage.prospects.map((p, idx) => (
                    <Pressable
                      key={p.id}
                      style={({ pressed }) => [
                        s.prospectRow,
                        pressed && { backgroundColor: C.bg },
                        idx < stage.prospects.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                      ]}
                      onPress={() => Alert.alert(
                        p.name,
                        `Source: ${p.source}\nEntered: ${p.dateEntered}\nAssigned: ${p.assigned}\nNext action due: ${p.nextDue}`,
                        [{ text: 'OK' }],
                      )}
                    >
                      <View style={[s.avatar, { backgroundColor: `hsl(${p.hue},42%,32%)` }]}>
                        <Text style={s.avatarText}>
                          {p.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                        </Text>
                      </View>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={[s.prospectName, { color: C.label }]}>{p.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                          <View style={[s.sourceBadge, { backgroundColor: C.separator }]}>
                            <Text style={[s.sourceBadgeText, { color: C.label }]}>{p.source}</Text>
                          </View>
                          <Text style={[s.prospectSub, { color: C.secondary }]}>{p.assigned}</Text>
                        </View>
                        <Text style={[s.prospectSub, { color: C.secondary }]}>
                          Entered {p.dateEntered}
                        </Text>
                        <Text style={[s.prospectSub, { color: isOverdue(p.nextDue) ? HEAT : C.secondary }]}>
                          Next action due {p.nextDue}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </View>
              )}

              {isOpen && stage.prospects.length === 0 && (
                <View style={[s.emptyStage, { backgroundColor: C.surface }]}>
                  <Text style={[s.emptyStageText, { color: C.secondary }]}>
                    {stage.count} prospects — tap to manage
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 100 }} />
      </>
    );
  }

  // ── Member (Visitor) Invite view ───────────────────────────────────────────

  function renderMemberView() {
    return (
      <>
        {/* Invite a Friend card */}
        <View style={[s.inviteCard, { backgroundColor: C.surface }]}>
          <Text style={[s.inviteTitle, { color: C.label }]}>Invite a Friend</Text>
          <Text style={[s.inviteDesc, { color: C.secondary }]}>
            Share your personal invite link and track who joins through you
          </Text>

          {/* Share buttons row */}
          <View style={s.shareRow}>
            {['Text', 'Email', 'Social'].map(method => (
              <Pressable
                key={method}
                style={({ pressed }) => [
                  s.shareBtn,
                  { backgroundColor: C.surface, borderColor: C.separator },
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(`Share via ${method}`, `Opening ${method.toLowerCase()} share…`);
                }}
              >
                <Text style={[s.shareBtnText, { color: C.label }]}>{method}</Text>
              </Pressable>
            ))}
          </View>

          {/* Referral stat */}
          <View style={s.referralRow}>
            <IconSymbol name="person.2.fill" size={13} color={C.secondary} />
            <Text style={[s.referralText, { color: C.secondary }]}>
              3 people visited through your link
            </Text>
          </View>
        </View>

        {/* My Invites */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>My Invites</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {MY_INVITES.map((inv, idx) => {
            const st = inviteStatusStyle(inv.status, C);
            return (
              <View
                key={inv.id}
                style={[
                  s.inviteRow,
                  idx < MY_INVITES.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                ]}
              >
                <View style={[s.avatar, { backgroundColor: `hsl(${inv.hue},42%,32%)` }]}>
                  <Text style={s.avatarText}>
                    {inv.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                  </Text>
                </View>
                <Text style={[s.inviteeName, { color: C.label }]}>{inv.name}</Text>
                <View style={[s.statusBadge, { backgroundColor: st.bg }]}>
                  <Text style={[s.statusBadgeText, { color: st.text }]}>{inv.status}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Upcoming Events */}
        <Text style={[s.sectionTitle, { color: C.secondary }]}>Upcoming Events</Text>
        {MEMBER_EVENTS.map(evt => (
          <View key={evt.id} style={[s.eventCard, { backgroundColor: C.surface }]}>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[s.eventName, { color: C.label }]}>{evt.name}</Text>
              <Text style={[s.eventDetail, { color: C.secondary }]}>
                {evt.date} · {evt.location}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              <Pressable
                style={[s.eventBtn, { backgroundColor: C.label }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('RSVP', `RSVP confirmed for ${evt.name}`);
                }}
              >
                <Text style={[s.eventBtnText, { color: C.bg }]}>RSVP</Text>
              </Pressable>
              <Pressable
                style={[s.eventBtn, { backgroundColor: C.surface, borderColor: C.separator, borderWidth: 1 }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Volunteer', `Sign up to volunteer for ${evt.name}?`, [
                    { text: 'Cancel' },
                    { text: 'Sign Up' },
                  ]);
                }}
              >
                <Text style={[s.eventBtnText, { color: C.label }]}>Volunteer</Text>
              </Pressable>
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSidePanel();
              }}
              hitSlop={12}
            >
              <KMenuButton />
            </Pressable>
          </View>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titlePillText, { color: C.label }]}>
              {isPastor ? 'Pipeline' : 'Invite'}
            </Text>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} accentColor={C.label} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingBottom: 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isPastor ? renderPastorView() : renderMemberView()}
      </ScrollView>

      {/* FAB — Pastor only */}
      {isPastor && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 70 }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Add Prospect', 'Open new prospect form?', [
              { text: 'Cancel' },
              { text: 'Open' },
            ]);
          }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:     { flex: 1 },
  topBarWrap: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:     { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide: { width: 80, justifyContent: 'center' },
  titlePill: {
    flex: 1,
    alignSelf: 'center',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  titlePillText: { fontSize: 13, fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard:  { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 3, textAlign: 'center' },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  overdueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
  },
  overdueDays: { fontSize: 12, fontWeight: '700' },

  stageHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginBottom: 2 },
  stageLabel:     { flex: 1, fontSize: 15, fontWeight: '700' },
  stageBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  stageBadgeText: { fontSize: 12, fontWeight: '700' },

  card:         { borderRadius: 14, overflow: 'hidden', marginBottom: 4 },
  prospectRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 12, padding: 14 },
  rowBorder:    { borderBottomWidth: StyleSheet.hairlineWidth },
  avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText:   { fontSize: 12, fontWeight: '800', color: '#fff' },
  prospectName: { fontSize: 14, fontWeight: '600' },
  prospectSub:  { fontSize: 11, marginTop: 1 },
  sourceBadge:     { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  sourceBadgeText: { fontSize: 10, fontWeight: '600' },

  emptyStage:     { borderRadius: 12, padding: 14, alignItems: 'center', marginBottom: 4 },
  emptyStageText: { fontSize: 13 },

  // Member view
  inviteCard:  { borderRadius: 14, padding: 16, marginBottom: 16 },
  inviteTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6 },
  inviteDesc:  { fontSize: 13, lineHeight: 18, marginBottom: 14 },

  shareRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  shareBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  shareBtnText: { fontSize: 13, fontWeight: '600' },

  referralRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  referralText: { fontSize: 12 },

  inviteRow:    { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  inviteeName:  { flex: 1, fontSize: 14, fontWeight: '600' },
  statusBadge:     { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8 },
  statusBadgeText: { fontSize: 12, fontWeight: '600' },

  eventCard:    { borderRadius: 14, padding: 14, marginBottom: 10 },
  eventName:    { fontSize: 15, fontWeight: '700' },
  eventDetail:  { fontSize: 13 },
  eventBtn:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 10 },
  eventBtnText: { fontSize: 13, fontWeight: '600' },

  fab: {
    position: 'absolute',
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
});
