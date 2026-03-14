/**
 * Phone — Calls · Meetings · Contacts
 * Matches KaNeXT_Phone_Spec_Final + kanext-phone-v2.html prototype.
 *
 * Layout:
 *   Segmented control (Calls / Meetings / Contacts)
 *   Canvas (scrollable, view-dependent)
 *
 * Side panel: Context Scope → Voicemail → Settings
 * Swipe right → open panel. No swipe between views.
 * Floating dialer FAB (Calls only) → opens dialer bottom sheet.
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Animated,
  PanResponder,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { LongPressContextMenu, type ContextMenuData } from '@/components/ui/long-press-context-menu';
import { initiateCall } from '@/utils/global-call';
import { hideFooter, showFooter } from '@/utils/global-footer-hide';

// ─── Color palette ────────────────────────────────────────────────────────────

const RED    = '#D93636';
const GREEN  = '#2D9E42';
const ORANGE = '#C97B08';

// ─── Panel mock data ──────────────────────────────────────────────────────────

const PANEL_SCOPES = [
  { key: 'this-org',  label: 'This Org',        count: 'Lincoln U' },
  { key: 'all-mode',  label: 'All Orgs in Mode', count: '3 orgs'   },
  { key: 'all-modes', label: 'All Modes',         count: '5 orgs'   },
];

const VOICEMAILS = [
  {
    key: 'vm1',
    name: 'Coach Davis',
    time: '2h ago',
    transcript: '"Hey, wanted to check on the film notes for the WR group. Call me back when..."',
  },
  {
    key: 'vm2',
    name: 'J. Williams (Recruit)',
    time: 'Yesterday',
    transcript: '"Hi Coach, this is Jamal. I had a question about my official visit next..."',
  },
];

// ─── Calls view data ──────────────────────────────────────────────────────────

const FAVORITES = [
  { key: 'mt', initials: 'MT', name: 'Mike T.',     role: 'AD',      online: true  },
  { key: 'cd', initials: 'CD', name: 'Coach D.',    role: 'DC',      online: false },
  { key: 'jw', initials: 'JW', name: 'J. Williams', role: 'Recruit', online: false },
  { key: 'sr', initials: 'SR', name: 'S. Roberts',  role: 'OC',      online: true  },
  { key: 'pj', initials: 'PJ', name: 'P. Johnson',  role: 'Trainer', online: false },
  { key: 'lm', initials: 'LM', name: 'L. Martin',   role: 'Booster', online: false },
  { key: 'kd', initials: 'KD', name: 'K. Davis',    role: 'HC',      online: false },
];

const MISSED_PRIORITY = [
  { key: 'mp1', urgency: 'crit' as const, typeLabel: 'Missed · 3x', title: "President's Office",  meta: 'Called 3 times today',    action: 'Call Back' },
  { key: 'mp2', urgency: 'warn' as const, typeLabel: 'Missed',      title: 'Recruit — D. Carter', meta: '11:20 AM · No voicemail', action: 'Call Back' },
  { key: 'mp3', urgency: 'crit' as const, typeLabel: 'Urgent',      title: 'Compliance Office',   meta: 'Voicemail · 9:15 AM',     action: 'Listen'    },
];

type CallType = 'missed' | 'incoming' | 'outgoing';
const RECENT_CALLS_DATA: { key: string; initials: string; name: string; callType: CallType; badge: string; meta: string; time: string }[] = [
  { key: 'r1', initials: 'PO', name: "President's Office",  callType: 'missed',   badge: 'Lincoln U',      meta: '3 calls', time: '10:45 AM'  },
  { key: 'r2', initials: 'DC', name: 'D. Carter (Recruit)', callType: 'missed',   badge: 'Pipeline',       meta: '',        time: '11:20 AM'  },
  { key: 'r3', initials: 'CO', name: 'Compliance Office',   callType: 'missed',   badge: 'Lincoln U',      meta: 'VM',      time: '9:15 AM'   },
  { key: 'r4', initials: 'SR', name: 'S. Roberts',          callType: 'incoming', badge: 'Lincoln U · OC', meta: '',        time: '9:02 AM'   },
  { key: 'r5', initials: 'MT', name: 'Mike Thompson',       callType: 'outgoing', badge: 'Lincoln U · AD', meta: '',        time: '8:30 AM'   },
  { key: 'r6', initials: 'CD', name: 'Coach Davis',         callType: 'incoming', badge: 'Lincoln U · DC', meta: 'VM',      time: 'Yesterday' },
];

// ─── Meetings view data ───────────────────────────────────────────────────────

const STARTING_SOON = [
  {
    key: 'ms1',
    countdown: 'Starts in 18 min',
    title: 'Film Review — WR Group',
    time: '10:00 AM',
    badge: 'Lincoln U',
    participants: 6,
    avatars: ['SR', 'CD', 'PJ', '+3'],
  },
];

const SCHEDULED_TODAY = [
  { key: 'mt1', title: 'Recruit Call — J. Williams', time: '12:00 PM', badge: 'Pipeline', participants: 2 },
  { key: 'mt2', title: 'Academic Review',             time: '3:00 PM',  badge: 'Lincoln U', participants: 8 },
];

const RECURRING_ROOMS = [
  { key: 'rr1', name: 'Staff Meeting Room',  meta: 'Weekly · Coaching Staff'       },
  { key: 'rr2', name: 'Recruiting Room',     meta: 'Persistent · Recruiting Staff' },
  { key: 'rr3', name: 'Leadership Huddle',   meta: 'Daily · Senior Staff'          },
];

const RECORDINGS = [
  { key: 'rec1', name: 'Staff Sync — Mar 13',               meta: '45 min · Transcript ready' },
  { key: 'rec2', name: 'Recruit Call — K. Brown — Mar 12',  meta: '22 min · Summary ready'    },
];

// ─── Contacts view data ───────────────────────────────────────────────────────

const FREQUENT_CONTACTS = [
  { key: 'fc1', initials: 'MT', name: 'Mike Thompson', role: 'Athletic Director · Lincoln U'       },
  { key: 'fc2', initials: 'CD', name: 'Coach Davis',   role: 'Defensive Coordinator · Lincoln U'  },
  { key: 'fc3', initials: 'SR', name: 'S. Roberts',    role: 'Offensive Coordinator · Lincoln U'  },
];

const COACHING_CONTACTS = [
  { key: 'p1', initials: 'PJ', name: 'P. Johnson', role: 'Head Trainer' },
  { key: 'p2', initials: 'TW', name: 'T. Williams', role: 'WR Coach'   },
  { key: 'p3', initials: 'RB', name: 'R. Brown',    role: 'RB Coach'   },
];

// ─── Dialer keys ──────────────────────────────────────────────────────────────

const DIALER_KEYS = [
  { digit: '1', sub: '' },   { digit: '2', sub: 'ABC' }, { digit: '3', sub: 'DEF'  },
  { digit: '4', sub: 'GHI' },{ digit: '5', sub: 'JKL' }, { digit: '6', sub: 'MNO'  },
  { digit: '7', sub: 'PQRS'},{ digit: '8', sub: 'TUV' }, { digit: '9', sub: 'WXYZ' },
  { digit: '✱', sub: '' },   { digit: '0', sub: '+'   }, { digit: '#', sub: ''     },
];

// ─── Phone Side Panel ─────────────────────────────────────────────────────────

function PhoneSidePanel({
  translateX,
  panelWidth,
  onOpen,
  onClose,
}: {
  translateX: Animated.Value;
  panelWidth: number;
  onOpen: () => void;
  onClose: () => void;
}) {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const [activeScope, setActiveScope] = useState('this-org');

  const panelTranslate = translateX.interpolate({
    inputRange: [0, panelWidth],
    outputRange: [-panelWidth, 0],
    extrapolate: 'clamp',
  });

  return (
    <>
      {/* Left-edge visible tab */}
      <Pressable
        style={[panelS.tab, { top: insets.top + 80, backgroundColor: C.surface, borderColor: C.separator }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onOpen(); }}
      >
        <IconSymbol name="chevron.right" size={10} color={C.muted} />
      </Pressable>

      {/* Slide-in panel */}
      <Animated.View
        style={[
          panelS.panel,
          {
            width: panelWidth,
            backgroundColor: C.bg,
            borderRightColor: C.separator,
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            transform: [{ translateX: panelTranslate }],
          },
        ]}
      >
        {/* Header */}
        <View style={[panelS.header, { borderBottomColor: C.separator }]}>
          <Text style={[panelS.title, { color: C.label }]}>Phone</Text>
          <Pressable onPress={onClose} hitSlop={8}>
            <IconSymbol name="xmark" size={16} color={C.secondary} />
          </Pressable>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 20, paddingBottom: 36 }}
          showsVerticalScrollIndicator={false}
        >
          {/* 1. Context Scope */}
          <Text style={[panelS.sectionTitle, { color: C.muted }]}>CONTEXT SCOPE</Text>
          {PANEL_SCOPES.map(scope => {
            const isActive = activeScope === scope.key;
            return (
              <Pressable
                key={scope.key}
                style={[
                  panelS.scopeBtn,
                  { borderColor: isActive ? C.label : C.separator },
                  isActive && { backgroundColor: 'rgba(0,0,0,0.03)' },
                ]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setActiveScope(scope.key); }}
              >
                <Text style={[panelS.scopeLabel, { color: isActive ? C.label : C.secondary, fontWeight: isActive ? '600' : '500' }]}>
                  {scope.label}
                </Text>
                <View style={[panelS.scopeCount, { backgroundColor: C.surfacePressed }]}>
                  <Text style={[panelS.scopeCountText, { color: C.muted }]}>{scope.count}</Text>
                </View>
              </Pressable>
            );
          })}

          <View style={[panelS.divider, { backgroundColor: C.separator }]} />

          {/* 2. Voicemail */}
          <View style={panelS.vmHeader}>
            <Text style={[panelS.sectionTitle, { color: C.muted, marginBottom: 0 }]}>VOICEMAIL</Text>
            <View style={panelS.vmBadge}>
              <Text style={panelS.vmBadgeText}>2</Text>
            </View>
          </View>
          <View style={{ height: 10 }} />
          {VOICEMAILS.map(vm => (
            <View key={vm.key} style={[panelS.vmItem, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              <View style={panelS.vmTop}>
                <Text style={[panelS.vmName, { color: C.label }]}>{vm.name}</Text>
                <Text style={[panelS.vmTime, { color: C.muted }]}>{vm.time}</Text>
              </View>
              <Text style={[panelS.vmTranscript, { color: C.secondary }]} numberOfLines={2}>
                {vm.transcript}
              </Text>
              <View style={panelS.vmActions}>
                {['Play', 'Call Back', 'Message'].map(action => (
                  <Pressable
                    key={action}
                    style={[panelS.vmBtn, { borderColor: C.separator }]}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <Text style={[panelS.vmBtnText, { color: C.secondary }]}>{action}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ))}

          <View style={[panelS.divider, { backgroundColor: C.separator }]} />

          {/* 3. Settings */}
          <Text style={[panelS.sectionTitle, { color: C.muted }]}>SETTINGS</Text>
          {['Call Routing', 'Voicemail Rules', 'Blocked / Spam'].map(item => (
            <Pressable
              key={item}
              style={[panelS.settingsBtn, { backgroundColor: C.surfacePressed }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[panelS.settingsBtnText, { color: C.label }]}>{item}</Text>
              <IconSymbol name="chevron.right" size={14} color={C.muted} />
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>
    </>
  );
}

const panelS = StyleSheet.create({
  tab: {
    position: 'absolute', left: 0, width: 18, height: 48,
    borderTopRightRadius: 10, borderBottomRightRadius: 10,
    borderWidth: 1, borderLeftWidth: 0,
    alignItems: 'center', justifyContent: 'center', zIndex: 100,
  },
  panel: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    borderRightWidth: StyleSheet.hairlineWidth, zIndex: 200,
    shadowColor: '#000', shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.12, shadowRadius: 16, elevation: 20,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth,
  },
  title: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3 },
  sectionTitle: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
  divider: { height: 1, marginVertical: 20 },
  scopeBtn: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 6,
  },
  scopeLabel: { flex: 1, fontSize: 12.5 },
  scopeCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  scopeCountText: { fontSize: 11, fontWeight: '600' },
  vmHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  vmBadge: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: RED, alignItems: 'center', justifyContent: 'center',
  },
  vmBadgeText: { fontSize: 10, fontWeight: '700', color: '#fff' },
  vmItem: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 8 },
  vmTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  vmName: { fontSize: 13, fontWeight: '600' },
  vmTime: { fontSize: 11 },
  vmTranscript: { fontSize: 12, lineHeight: 17, marginBottom: 8 },
  vmActions: { flexDirection: 'row', gap: 6 },
  vmBtn: { paddingHorizontal: 9, paddingVertical: 4, borderWidth: 1, borderRadius: 7 },
  vmBtnText: { fontSize: 10.5, fontWeight: '500' },
  settingsBtn: { flexDirection: 'row', alignItems: 'center', padding: 11, borderRadius: 10, marginBottom: 6 },
  settingsBtnText: { flex: 1, fontSize: 13, fontWeight: '500' },
});

// ─── Segmented Control ────────────────────────────────────────────────────────

type PhoneView = 'Calls' | 'Meetings' | 'Contacts';
const PHONE_VIEWS: PhoneView[] = ['Calls', 'Meetings', 'Contacts'];

function ViewSwitcher({ active, onChange, C }: { active: PhoneView; onChange: (v: PhoneView) => void; C: ComponentColors }) {
  return (
    <View style={[switcherS.track, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
      {PHONE_VIEWS.map(v => {
        const isActive = v === active;
        return (
          <Pressable
            key={v}
            style={[switcherS.segment, isActive && [switcherS.segmentActive, { backgroundColor: C.bg }]]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onChange(v); }}
          >
            <Text style={[switcherS.label, { color: isActive ? C.label : C.secondary }, isActive && switcherS.labelActive]}>
              {v}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const switcherS = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: 12, padding: 3, marginHorizontal: 20 },
  segment: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segmentActive: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 4, elevation: 2,
  },
  label: { fontSize: 13.5, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});

// ─── Section Label ────────────────────────────────────────────────────────────

function SLabel({ title, C, first }: { title: string; C: ComponentColors; first?: boolean }) {
  return (
    <Text style={[slabelS.text, { color: C.muted, marginTop: first ? 6 : 22 }]}>
      {title.toUpperCase()}
    </Text>
  );
}

const slabelS = StyleSheet.create({
  text: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginBottom: 10 },
});

// ─── Calls View ───────────────────────────────────────────────────────────────

function CallsView({
  C,
  onCallInitiate,
  onLongPressRecent,
}: {
  C: ComponentColors;
  onCallInitiate: (name: string, initials: string) => void;
  onLongPressRecent: (item: typeof RECENT_CALLS_DATA[0], pageY: number) => void;
}) {
  return (
    <>
      {/* Favorites */}
      <SLabel title="Favorites" C={C} first />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 14, paddingBottom: 8 }}
      >
        {FAVORITES.map(fav => (
          <Pressable
            key={fav.key}
            style={callS.favItem}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCallInitiate(fav.name, fav.initials); }}
          >
            <View style={[callS.favAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              <Text style={[callS.favInitials, { color: C.secondary }]}>{fav.initials}</Text>
              {fav.online && <View style={[callS.favOnline, { borderColor: C.bg }]} />}
            </View>
            <Text style={[callS.favName, { color: C.secondary }]} numberOfLines={1}>{fav.name}</Text>
            <Text style={[callS.favRole, { color: C.muted }]}>{fav.role}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Missed / Priority */}
      <SLabel title="Missed / Priority" C={C} />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 4 }}
      >
        {MISSED_PRIORITY.map(mp => (
          <View key={mp.key} style={[callS.missedCard, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
            <Text style={[callS.missedType, { color: mp.urgency === 'crit' ? RED : ORANGE }]}>{mp.typeLabel}</Text>
            <Text style={[callS.missedTitle, { color: C.label }]}>{mp.title}</Text>
            <Text style={[callS.missedMeta, { color: C.secondary }]}>{mp.meta}</Text>
            <Pressable
              style={[callS.missedAction, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[callS.missedActionText, { color: C.label }]}>{mp.action}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>

      {/* Recent Calls */}
      <SLabel title="Recent" C={C} />
      {RECENT_CALLS_DATA.map((call, idx) => {
        const isMissed   = call.callType === 'missed';
        const isIncoming = call.callType === 'incoming';
        const arrowIcon  = isMissed || isIncoming ? 'arrow.down.left' : 'arrow.up.right';
        const arrowColor = isMissed ? RED : isIncoming ? GREEN : C.muted;
        return (
          <View key={call.key}>
            {idx > 0 && <View style={[callS.separator, { backgroundColor: C.separator }]} />}
            <Pressable
              style={callS.recentRow}
              onLongPress={(e) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onLongPressRecent(call, e.nativeEvent.pageY); }}
              delayLongPress={400}
            >
              <View style={[callS.recentAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
                <Text style={[callS.recentInitials, { color: C.secondary }]}>{call.initials}</Text>
              </View>
              <View style={callS.recentInfo}>
                <Text style={[callS.recentName, { color: isMissed ? RED : C.label }]} numberOfLines={1}>
                  {call.name}
                </Text>
                <View style={callS.recentMeta}>
                  <IconSymbol name={arrowIcon as any} size={11} color={arrowColor} />
                  <View style={[callS.badge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
                    <Text style={[callS.badgeText, { color: C.secondary }]}>{call.badge}</Text>
                  </View>
                  {call.meta ? <Text style={[callS.metaText, { color: C.secondary }]}>{call.meta}</Text> : null}
                </View>
              </View>
              <View style={callS.recentRight}>
                <Text style={[callS.recentTime, { color: C.muted }]}>{call.time}</Text>
                <Pressable
                  style={[callS.callBtn, { borderColor: C.separator }]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCallInitiate(call.name, call.initials); }}
                >
                  <IconSymbol name="phone.fill" size={14} color={C.secondary} />
                </Pressable>
              </View>
            </Pressable>
          </View>
        );
      })}
      <View style={{ height: 100 }} />
    </>
  );
}

const callS = StyleSheet.create({
  favItem: { alignItems: 'center', gap: 5, width: 62 },
  favAvatar: {
    width: 52, height: 52, borderRadius: 26,
    borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', position: 'relative',
  },
  favInitials: { fontSize: 17, fontWeight: '600' },
  favOnline: {
    position: 'absolute', bottom: 1, right: 1, width: 11, height: 11,
    borderRadius: 5.5, backgroundColor: GREEN, borderWidth: 2,
  },
  favName: { fontSize: 10.5, fontWeight: '500', textAlign: 'center', maxWidth: 62 },
  favRole: { fontSize: 9, textAlign: 'center' },
  missedCard: {
    minWidth: 170, maxWidth: 200, borderWidth: 1, borderRadius: 14,
    padding: 13, gap: 4,
  },
  missedType: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
  missedTitle: { fontSize: 13.5, fontWeight: '500', lineHeight: 18 },
  missedMeta: { fontSize: 11.5, marginBottom: 6 },
  missedAction: { paddingHorizontal: 11, paddingVertical: 5, borderWidth: 1, borderRadius: 8, alignSelf: 'flex-start' },
  missedActionText: { fontSize: 11, fontWeight: '600' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  recentAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  recentInitials: { fontSize: 13, fontWeight: '600' },
  recentInfo: { flex: 1, minWidth: 0 },
  recentName: { fontSize: 14, fontWeight: '500', marginBottom: 2 },
  recentMeta: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 5 },
  badgeText: { fontSize: 10.5, fontWeight: '500' },
  metaText: { fontSize: 11.5 },
  recentRight: { alignItems: 'flex-end', gap: 6 },
  recentTime: { fontSize: 11.5 },
  callBtn: { width: 34, height: 34, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
});

// ─── Meetings View ────────────────────────────────────────────────────────────

function MeetingsView({ C }: { C: ComponentColors }) {
  return (
    <>
      {/* Starting Soon */}
      <SLabel title="Starting Soon" C={C} first />
      {STARTING_SOON.map(m => (
        <View key={m.key} style={[mtgS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
          <Text style={[mtgS.countdown, { color: ORANGE }]}>{m.countdown}</Text>
          <View style={mtgS.cardTop}>
            <Text style={[mtgS.cardTitle, { color: C.label }]}>{m.title}</Text>
            <Text style={[mtgS.cardTime, { color: C.muted }]}>{m.time}</Text>
          </View>
          <View style={mtgS.cardMeta}>
            <View style={[mtgS.badge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[mtgS.badgeText, { color: C.secondary }]}>{m.badge}</Text>
            </View>
            <Text style={[mtgS.cardParticipants, { color: C.secondary }]}>{m.participants} participants</Text>
          </View>
          <View style={mtgS.avatarRow}>
            {m.avatars.map((a, i) => (
              <View key={i} style={[mtgS.participantAvatar, { backgroundColor: C.surfacePressed, borderColor: C.bg }]}>
                <Text style={[mtgS.participantText, { color: C.secondary }]}>{a}</Text>
              </View>
            ))}
          </View>
          <Pressable
            style={[mtgS.joinBtn, { backgroundColor: GREEN }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          >
            <Text style={mtgS.joinBtnText}>Join Now</Text>
          </Pressable>
        </View>
      ))}

      {/* Scheduled Today */}
      <SLabel title="Scheduled Today" C={C} />
      {SCHEDULED_TODAY.map(m => (
        <View key={m.key} style={[mtgS.card, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
          <View style={mtgS.cardTop}>
            <Text style={[mtgS.cardTitle, { color: C.label }]}>{m.title}</Text>
            <Text style={[mtgS.cardTime, { color: C.muted }]}>{m.time}</Text>
          </View>
          <View style={[mtgS.cardMeta, { marginBottom: 10 }]}>
            <View style={[mtgS.badge, { backgroundColor: 'rgba(0,0,0,0.05)' }]}>
              <Text style={[mtgS.badgeText, { color: C.secondary }]}>{m.badge}</Text>
            </View>
            <Text style={[mtgS.cardParticipants, { color: C.secondary }]}>{m.participants} participants</Text>
          </View>
          <Pressable
            style={[mtgS.joinBtn, { backgroundColor: C.surfacePressed, borderWidth: 1, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Text style={[mtgS.joinBtnText, { color: C.label }]}>View Details</Text>
          </Pressable>
        </View>
      ))}

      {/* Start Meeting */}
      <SLabel title="Start Meeting" C={C} />
      <View style={mtgS.startRow}>
        {[
          { label: 'Video Room', sub: 'Start instantly', icon: 'video.fill' },
          { label: 'Audio Room', sub: 'Voice only',      icon: 'phone.fill' },
        ].map(btn => (
          <Pressable
            key={btn.label}
            style={[mtgS.startBtn, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <IconSymbol name={btn.icon as any} size={24} color={C.label} />
            <Text style={[mtgS.startLabel, { color: C.label }]}>{btn.label}</Text>
            <Text style={[mtgS.startSub, { color: C.muted }]}>{btn.sub}</Text>
          </Pressable>
        ))}
      </View>

      {/* Recurring Rooms */}
      <SLabel title="Recurring Rooms" C={C} />
      {RECURRING_ROOMS.map((room, idx) => (
        <View key={room.key}>
          {idx > 0 && <View style={[mtgS.separator, { backgroundColor: C.separator }]} />}
          <View style={mtgS.roomRow}>
            <View style={[mtgS.roomIcon, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              <IconSymbol name="person.2.fill" size={16} color={C.secondary} />
            </View>
            <View style={mtgS.roomInfo}>
              <Text style={[mtgS.roomName, { color: C.label }]}>{room.name}</Text>
              <Text style={[mtgS.roomMeta, { color: C.secondary }]}>{room.meta}</Text>
            </View>
            <Pressable
              style={[mtgS.roomJoin, { borderColor: C.separator }]}
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            >
              <Text style={[mtgS.roomJoinText, { color: C.label }]}>Join</Text>
            </Pressable>
          </View>
        </View>
      ))}

      {/* Recordings */}
      <SLabel title="Recordings" C={C} />
      {RECORDINGS.map((rec, idx) => (
        <View key={rec.key}>
          {idx > 0 && <View style={[mtgS.separator, { backgroundColor: C.separator }]} />}
          <Pressable style={mtgS.roomRow} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
            <View style={[mtgS.recIcon, { backgroundColor: 'rgba(217,54,54,0.06)' }]}>
              <IconSymbol name="play.circle.fill" size={16} color={RED} />
            </View>
            <View style={mtgS.roomInfo}>
              <Text style={[mtgS.roomName, { color: C.label }]}>{rec.name}</Text>
              <Text style={[mtgS.roomMeta, { color: C.secondary }]}>{rec.meta}</Text>
            </View>
          </Pressable>
        </View>
      ))}

      <View style={{ height: 80 }} />
    </>
  );
}

const mtgS = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 8 },
  countdown: { fontSize: 11, fontWeight: '600', marginBottom: 5 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 },
  cardTitle: { fontSize: 14, fontWeight: '600', lineHeight: 19, flex: 1, marginRight: 8 },
  cardTime: { fontSize: 12, flexShrink: 0 },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  badge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  badgeText: { fontSize: 11, fontWeight: '500' },
  cardParticipants: { fontSize: 12 },
  avatarRow: { flexDirection: 'row', marginBottom: 10 },
  participantAvatar: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center', marginLeft: -8,
  },
  participantText: { fontSize: 9, fontWeight: '600' },
  joinBtn: { paddingVertical: 7, borderRadius: 9, alignItems: 'center' },
  joinBtnText: { fontSize: 12, fontWeight: '600', color: '#fff' },
  startRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  startBtn: { flex: 1, padding: 14, borderWidth: 1, borderRadius: 12, alignItems: 'center', gap: 5 },
  startLabel: { fontSize: 12, fontWeight: '600' },
  startSub: { fontSize: 10 },
  separator: { height: StyleSheet.hairlineWidth },
  roomRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11 },
  roomIcon: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  recIcon:  { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  roomInfo: { flex: 1, minWidth: 0 },
  roomName: { fontSize: 13.5, fontWeight: '500' },
  roomMeta: { fontSize: 11.5, marginTop: 1 },
  roomJoin: { paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderRadius: 8 },
  roomJoinText: { fontSize: 11, fontWeight: '600' },
});

// ─── Contacts View ────────────────────────────────────────────────────────────

function ContactsView({ C, onCallInitiate }: { C: ComponentColors; onCallInitiate: (name: string, initials: string) => void }) {
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['coaching']);

  const toggleGroup = (key: string) => {
    setExpandedGroups(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  return (
    <>
      {/* Search bar */}
      <View style={[contS.searchBar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
        <IconSymbol name="magnifyingglass" size={16} color={C.muted} />
        <Text style={[contS.searchPlaceholder, { color: C.muted }]}>Search people, orgs, teams...</Text>
      </View>

      {/* Frequent */}
      <SLabel title="Frequent" C={C} first />
      {FREQUENT_CONTACTS.map((contact, idx) => (
        <View key={contact.key}>
          {idx > 0 && <View style={[contS.separator, { backgroundColor: C.separator }]} />}
          <View style={contS.contactRow}>
            <View style={[contS.contactAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
              <Text style={[contS.contactInitials, { color: C.secondary }]}>{contact.initials}</Text>
            </View>
            <View style={contS.contactInfo}>
              <Text style={[contS.contactName, { color: C.label }]}>{contact.name}</Text>
              <Text style={[contS.contactRole, { color: C.secondary }]} numberOfLines={1}>{contact.role}</Text>
            </View>
            <View style={contS.contactActions}>
              <Pressable
                style={[contS.contactBtn, { borderColor: C.separator }]}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCallInitiate(contact.name, contact.initials); }}
              >
                <IconSymbol name="phone.fill" size={15} color={C.secondary} />
              </Pressable>
              <Pressable
                style={[contS.contactBtn, { borderColor: C.separator }]}
                onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              >
                <IconSymbol name="video.fill" size={15} color={C.secondary} />
              </Pressable>
            </View>
          </View>
        </View>
      ))}

      {/* Org Groups */}
      <SLabel title="Lincoln University" C={C} />
      {[
        { key: 'coaching', label: 'Coaching Staff', count: 8  },
        { key: 'admin',    label: 'Administration', count: 12 },
        { key: 'roster',   label: 'Roster',         count: 85 },
      ].map(group => {
        const isExpanded = expandedGroups.includes(group.key);
        return (
          <View key={group.key} style={contS.orgGroup}>
            <Pressable
              style={contS.orgHeader}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); toggleGroup(group.key); }}
            >
              <IconSymbol name={isExpanded ? 'chevron.down' : 'chevron.right'} size={12} color={C.secondary} />
              <Text style={[contS.orgHeaderText, { color: C.label }]}>{group.label}</Text>
              <Text style={[contS.orgCount, { color: C.muted }]}>{group.count}</Text>
            </Pressable>
            {isExpanded && group.key === 'coaching' && COACHING_CONTACTS.map((contact, idx) => (
              <View key={contact.key}>
                {idx > 0 && <View style={[contS.separator, { backgroundColor: C.separator }]} />}
                <View style={contS.contactRow}>
                  <View style={[contS.contactAvatar, { backgroundColor: C.surfacePressed, borderColor: C.separator }]}>
                    <Text style={[contS.contactInitials, { color: C.secondary }]}>{contact.initials}</Text>
                  </View>
                  <View style={contS.contactInfo}>
                    <Text style={[contS.contactName, { color: C.label }]}>{contact.name}</Text>
                    <Text style={[contS.contactRole, { color: C.secondary }]}>{contact.role}</Text>
                  </View>
                  <View style={contS.contactActions}>
                    <Pressable
                      style={[contS.contactBtn, { borderColor: C.separator }]}
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onCallInitiate(contact.name, contact.initials); }}
                    >
                      <IconSymbol name="phone.fill" size={15} color={C.secondary} />
                    </Pressable>
                    <Pressable
                      style={[contS.contactBtn, { borderColor: C.separator }]}
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                    >
                      <IconSymbol name="video.fill" size={15} color={C.secondary} />
                    </Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
        );
      })}
      <View style={{ height: 80 }} />
    </>
  );
}

const contS = StyleSheet.create({
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderRadius: 12, padding: 10, marginBottom: 4,
  },
  searchPlaceholder: { fontSize: 14 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  contactRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 12 },
  contactAvatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  contactInitials: { fontSize: 13, fontWeight: '600' },
  contactInfo: { flex: 1, minWidth: 0 },
  contactName: { fontSize: 14, fontWeight: '500', marginBottom: 1 },
  contactRole: { fontSize: 12 },
  contactActions: { flexDirection: 'row', gap: 6 },
  contactBtn: { width: 34, height: 34, borderWidth: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  orgGroup: { marginBottom: 2 },
  orgHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 10 },
  orgHeaderText: { flex: 1, fontSize: 13, fontWeight: '600' },
  orgCount: { fontSize: 11, fontWeight: '500' },
});

// ─── Dialer Sheet ─────────────────────────────────────────────────────────────

function DialerSheet({ visible, onClose, C }: { visible: boolean; onClose: () => void; C: ComponentColors }) {
  const [dialNum, setDialNum] = useState('');

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal>
      <View style={dialerS.display}>
        <Text style={[dialerS.displayText, { color: dialNum ? C.label : C.muted }]}>
          {dialNum || 'Enter number'}
        </Text>
      </View>
      <View style={dialerS.grid}>
        {DIALER_KEYS.map(k => (
          <Pressable
            key={k.digit}
            style={[dialerS.key, { backgroundColor: C.surfacePressed }]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setDialNum(prev => prev + k.digit); }}
          >
            <Text style={[dialerS.keyNum, { color: C.label }]}>{k.digit}</Text>
            {k.sub ? <Text style={[dialerS.keySub, { color: C.muted }]}>{k.sub}</Text> : null}
          </Pressable>
        ))}
      </View>
      <View style={dialerS.bottom}>
        <Pressable
          style={dialerS.deleteBtn}
          onPress={() => setDialNum(prev => prev.slice(0, -1))}
        >
          <IconSymbol name="delete.left" size={22} color={C.secondary} />
        </Pressable>
        <Pressable
          style={[dialerS.callBtn, { backgroundColor: GREEN }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
        >
          <IconSymbol name="phone.fill" size={26} color="#fff" />
        </Pressable>
        <Pressable
          style={[dialerS.callBtn, { backgroundColor: C.label }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); onClose(); }}
        >
          <IconSymbol name="video.fill" size={26} color={C.bg} />
        </Pressable>
      </View>
    </BottomSheet>
  );
}

const dialerS = StyleSheet.create({
  display: { alignItems: 'center', justifyContent: 'center', minHeight: 44, marginBottom: 16 },
  displayText: { fontSize: 28, fontWeight: '300', letterSpacing: 0.04 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', maxWidth: 280, alignSelf: 'center', gap: 8, marginBottom: 16 },
  key: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    // 3 per row in 280px with gap 8: (280 - 8*2) / 3 = 88 → but we let flexWrap handle it
    flexBasis: '30%',
  },
  keyNum: { fontSize: 24, fontWeight: '500', lineHeight: 28 },
  keySub: { fontSize: 8, fontWeight: '600', letterSpacing: 0.12, marginTop: 1 },
  bottom: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, maxWidth: 280, alignSelf: 'center' },
  deleteBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  callBtn: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PhoneScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();

  const [activeView, setActiveView]     = useState<PhoneView>('Calls');
  const [dialerVisible, setDialerVisible] = useState(false);
  const [menuData, setMenuData]         = useState<ContextMenuData | null>(null);

  const panelWidth      = screenWidth * 0.78;
  const panelTranslateX = useRef(new Animated.Value(0)).current;
  const [panelOpen, setPanelOpen] = useState(false);

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    Animated.spring(panelTranslateX, { toValue: panelWidth, tension: 65, friction: 11, useNativeDriver: true }).start();
  }, [panelTranslateX, panelWidth]);

  const closePanel = useCallback(() => {
    Animated.timing(panelTranslateX, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => setPanelOpen(false));
  }, [panelTranslateX]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, gs) => !panelOpen && gs.dx > 20 && Math.abs(gs.dx) > Math.abs(gs.dy) * 1.5,
        onPanResponderRelease: (_e, gs) => { if (gs.dx > 60) openPanel(); },
      }),
    [panelOpen, openPanel],
  );

  const lastScrollY = useRef(0);
  const handleScroll = useCallback((e: any) => {
    const y = e.nativeEvent.contentOffset.y;
    if (y > lastScrollY.current + 10) hideFooter();
    else if (y < lastScrollY.current - 10) showFooter();
    lastScrollY.current = y;
    if (y <= 0) showFooter();
  }, []);

  const handleCallInitiate = useCallback((name: string, initials: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    initiateCall({ contactName: name, contactInitials: initials, mode: 'sports', type: 'audio' });
  }, []);

  const handleLongPressRecent = useCallback((item: typeof RECENT_CALLS_DATA[0], pageY: number) => {
    setMenuData({
      title: item.name,
      subtitle: item.badge,
      initials: item.initials,
      pageY,
      actions: [
        { key: 'audio',   label: 'Audio Call',           icon: 'phone.fill'            },
        { key: 'video',   label: 'Video Call',            icon: 'video.fill'            },
        { key: 'message', label: 'Message',               icon: 'bubble.left.fill'      },
        { key: 'delete',  label: 'Delete from Recents',   icon: 'trash.fill', destructive: true },
      ],
      onAction: (key) => {
        if (key === 'audio') handleCallInitiate(item.name, item.initials);
      },
    });
  }, [handleCallInitiate]);

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>
      {/* Main content (shifts when panel opens) */}
      <Animated.View
        style={[styles.content, { transform: [{ translateX: panelTranslateX }] }]}
        {...panResponder.panHandlers}
      >
        {/* Segmented control */}
        <View style={{ paddingTop: insets.top + 12, paddingBottom: 0 }}>
          <ViewSwitcher active={activeView} onChange={setActiveView} C={C} />
        </View>

        {/* Canvas */}
        <ScrollView
          style={styles.canvas}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          {activeView === 'Calls'    && <CallsView    C={C} onCallInitiate={handleCallInitiate} onLongPressRecent={handleLongPressRecent} />}
          {activeView === 'Meetings' && <MeetingsView C={C} />}
          {activeView === 'Contacts' && <ContactsView C={C} onCallInitiate={handleCallInitiate} />}
        </ScrollView>
      </Animated.View>

      {/* Backdrop (tap to close panel) */}
      {panelOpen && <Pressable style={StyleSheet.absoluteFill} onPress={closePanel} />}

      {/* Side panel */}
      <PhoneSidePanel
        translateX={panelTranslateX}
        panelWidth={panelWidth}
        onOpen={openPanel}
        onClose={closePanel}
      />

      {/* Floating dialer FAB — Calls view only */}
      {activeView === 'Calls' && !dialerVisible && (
        <Pressable
          style={[styles.fab, { bottom: insets.bottom + 90, backgroundColor: GREEN }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setDialerVisible(true); }}
        >
          <IconSymbol name="circle.grid.3x3.fill" size={26} color="#fff" />
        </Pressable>
      )}

      {/* Dialer bottom sheet */}
      <DialerSheet visible={dialerVisible} onClose={() => setDialerVisible(false)} C={C} />

      {/* Long press context menu */}
      <LongPressContextMenu data={menuData} onClose={() => setMenuData(null)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
  canvas: { flex: 1 },
  fab: {
    position: 'absolute',
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 50,
  },
});
