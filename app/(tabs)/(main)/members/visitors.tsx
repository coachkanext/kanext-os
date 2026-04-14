/**
 * Members — Visitors pipeline (Pastor only).
 * Member role redirects to members/index.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';

type VisitorStage = {
  id: string;
  title: string;
  count: number;
  visitors: VisitorEntry[];
};

type VisitorEntry = {
  id: string;
  initials: string;
  name: string;
  hue: number;
  firstVisit: string;
  howHeard?: string;
  followUpStatus?: string;
  extra?: string;
  action: string;
  actionLabel: string;
  converted?: boolean;
};

const STAGES: VisitorStage[] = [
  {
    id: 'new',
    title: 'New',
    count: 2,
    visitors: [
      { id: 'v1', initials: 'KM', name: 'Kevin Mensah',    hue: 120, firstVisit: 'Mar 30', howHeard: 'Member invite',    action: 'welcome', actionLabel: 'Send Welcome' },
      { id: 'v2', initials: 'RA', name: 'Rachel Adeyemi',  hue: 60,  firstVisit: 'Mar 23', howHeard: 'Social media',     action: 'welcome', actionLabel: 'Send Welcome' },
    ],
  },
  {
    id: 'contacted',
    title: 'Contacted',
    count: 3,
    visitors: [
      { id: 'v3', initials: 'PO', name: 'Peter Okafor',    hue: 190, firstVisit: 'Mar 16', followUpStatus: 'Called',     action: 'schedule', actionLabel: 'Schedule Call' },
      { id: 'v4', initials: 'LB', name: 'Linda Brown',     hue: 330, firstVisit: 'Mar 9',  followUpStatus: 'Emailed',    action: 'schedule', actionLabel: 'Schedule Call' },
      { id: 'v5', initials: 'SN', name: 'Samuel Nkrumah',  hue: 280, firstVisit: 'Mar 2',  followUpStatus: 'Texted',     action: 'schedule', actionLabel: 'Schedule Call' },
    ],
  },
  {
    id: 'returning',
    title: 'Returning',
    count: 1,
    visitors: [
      { id: 'v6', initials: 'AB', name: 'Amara Bello',     hue: 45,  firstVisit: 'Feb 22', extra: 'Visited again Apr 6', action: 'group', actionLabel: 'Invite to Group' },
    ],
  },
  {
    id: 'connected',
    title: 'Connected',
    count: 2,
    visitors: [
      { id: 'v7', initials: 'TD', name: 'Tunde Dada',      hue: 240, firstVisit: 'Feb 15', extra: 'Joined Prayer group', action: 'member', actionLabel: 'Add as Member' },
      { id: 'v8', initials: 'IJ', name: 'Ifeoma James',    hue: 170, firstVisit: 'Feb 8',  extra: 'Joined Youth ministry', action: 'member', actionLabel: 'Add as Member' },
    ],
  },
  {
    id: 'converted',
    title: 'Converted',
    count: 1,
    visitors: [
      { id: 'v9', initials: 'CT', name: 'Chidi Thomas',    hue: 155, firstVisit: 'Jan 20', extra: 'Became member Mar 1', action: 'done', actionLabel: '', converted: true },
    ],
  },
];

export default function VisitorsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  const [role, cycleRole, roleCycles] = useDemoRole('community:members');
  const isPastor = role === roleCycles[0];

  const [expanded, setExpanded] = useState<Set<string>>(new Set(['new', 'contacted']));

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/members' as any);
    }
  }, [isPastor, router]));

  const toggleSection = (id: string) => {
    Haptics.selectionAsync();
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAction = (v: VisitorEntry) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (v.action) {
      case 'welcome':  Alert.alert('Send Welcome', `Send a welcome message to ${v.name}?`, [{ text: 'Cancel' }, { text: 'Send' }]); break;
      case 'schedule': Alert.alert('Schedule Call', `Schedule a follow-up call with ${v.name}?`, [{ text: 'Cancel' }, { text: 'Schedule' }]); break;
      case 'group':    Alert.alert('Invite to Group', `Invite ${v.name} to join a small group?`, [{ text: 'Cancel' }, { text: 'Invite' }]); break;
      case 'member':   Alert.alert('Add as Member', `Add ${v.name} as an official member?`, [{ text: 'Cancel' }, { text: 'Add' }]); break;
    }
  };

  if (!isPastor) return null;

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <View style={s.topBarSide}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={12}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Visitors</Text>
            </View>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {STAGES.map(stage => {
          const isOpen = expanded.has(stage.id);
          return (
            <View key={stage.id} style={{ marginBottom: 12 }}>
              {/* Section header */}
              <Pressable
                style={({ pressed }) => [s.stageHeader, { backgroundColor: C.surface }, pressed && { opacity: 0.8 }]}
                onPress={() => toggleSection(stage.id)}
              >
                <Text style={[s.stageTitle, { color: C.label }]}>{stage.title}</Text>
                <View style={[s.stageBadge, { backgroundColor: C.separator }]}>
                  <Text style={[s.stageBadgeText, { color: C.label }]}>{stage.count}</Text>
                </View>
                <IconSymbol name={isOpen ? 'chevron.up' : 'chevron.down'} size={14} color={C.secondary} />
              </Pressable>

              {/* Visitor cards */}
              {isOpen && (
                <View style={[s.card, { backgroundColor: C.surface }]}>
                  {stage.visitors.map((v, idx) => (
                    <View
                      key={v.id}
                      style={[
                        s.visitorRow,
                        idx < stage.visitors.length - 1 && [s.rowBorder, { borderBottomColor: C.separator }],
                      ]}
                    >
                      <View style={[s.avatar, { backgroundColor: `hsl(${v.hue},42%,32%)` }]}>
                        <Text style={s.avatarText}>{v.initials}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[s.visitorName, { color: C.label }]}>{v.name}</Text>
                        <Text style={[s.visitorSub, { color: C.secondary }]}>First visit: {v.firstVisit}</Text>
                        {v.howHeard && <Text style={[s.visitorSub, { color: C.secondary }]}>Via: {v.howHeard}</Text>}
                        {v.followUpStatus && (
                          <View style={[s.statusBadge, { backgroundColor: C.separator }]}>
                            <Text style={[s.statusBadgeText, { color: C.label }]}>{v.followUpStatus}</Text>
                          </View>
                        )}
                        {v.extra && <Text style={[s.visitorSub, { color: C.secondary }]}>{v.extra}</Text>}
                      </View>
                      {v.converted ? (
                        <View style={[s.checkCircle, { backgroundColor: GAIN }]}>
                          <IconSymbol name="checkmark" size={14} color="#fff" />
                        </View>
                      ) : (
                        <Pressable
                          style={[s.actionBtn, { backgroundColor: C.label }]}
                          onPress={() => handleAction(v)}
                        >
                          <Text style={[s.actionBtnText, { color: C.bg }]}>{v.actionLabel}</Text>
                        </Pressable>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:      { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
  titleText:   { fontSize: 13, fontWeight: '700' },

  stageHeader:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginBottom: 2 },
  stageTitle:     { flex: 1, fontSize: 15, fontWeight: '700' },
  stageBadge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  stageBadgeText: { fontSize: 12, fontWeight: '700' },

  card:       { borderRadius: 14, overflow: 'hidden' },
  visitorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  rowBorder:  { borderBottomWidth: StyleSheet.hairlineWidth },

  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },

  visitorName: { fontSize: 14, fontWeight: '600' },
  visitorSub:  { fontSize: 11, marginTop: 2 },

  statusBadge:     { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  statusBadgeText: { fontSize: 10, fontWeight: '600' },

  actionBtn:     { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexShrink: 0 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },

  checkCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
