/**
 * Workforce — Hiring (CEO only)
 * Open positions + Kanban applicant pipeline
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
  Alert,
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

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';
const HEAT    = '#B85C5C';

type PositionStatus = 'Open' | 'Interviewing' | 'Offer Sent' | 'Filled';

type Position = {
  id: string;
  title: string;
  department: string;
  posted: string;
  applicants: number;
  status: PositionStatus;
};

const POSITIONS: Position[] = [
  { id: 'p1', title: 'Frontend Developer',      department: 'Engineering', posted: 'Mar 15', applicants: 5, status: 'Interviewing' },
  { id: 'p2', title: 'Sales Associate',          department: 'Sales',       posted: 'Mar 28', applicants: 3, status: 'Open'         },
  { id: 'p3', title: 'Content Marketing Lead',   department: 'Product',     posted: 'Apr 2',  applicants: 2, status: 'Open'         },
];

const STATUS_COLOR: Record<PositionStatus, string> = {
  'Open':        GAIN,
  'Interviewing': CAUTION,
  'Offer Sent':  CAUTION,
  'Filled':      HEAT,
};

type Stage = 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Hired';

type Applicant = {
  id: string;
  name: string;
  position: string;
  stage: Stage;
  daysInStage: number;
};

const APPLICANTS: Applicant[] = [
  { id: 'a1', name: 'Tyler Nguyen',    position: 'Frontend Developer',    stage: 'Applied',    daysInStage: 2  },
  { id: 'a2', name: 'Bianca Osei',     position: 'Frontend Developer',    stage: 'Screening',  daysInStage: 4  },
  { id: 'a3', name: 'Kenji Watanabe',  position: 'Frontend Developer',    stage: 'Interview',  daysInStage: 1  },
  { id: 'a4', name: 'Elena Vasquez',   position: 'Frontend Developer',    stage: 'Interview',  daysInStage: 3  },
  { id: 'a5', name: 'Omar Hassan',     position: 'Frontend Developer',    stage: 'Offer',      daysInStage: 1  },
  { id: 'a6', name: 'Serena Park',     position: 'Sales Associate',       stage: 'Applied',    daysInStage: 5  },
  { id: 'a7', name: 'Dante Reyes',     position: 'Sales Associate',       stage: 'Screening',  daysInStage: 2  },
  { id: 'a8', name: 'Nia Blackwell',   position: 'Sales Associate',       stage: 'Applied',    daysInStage: 1  },
  { id: 'a9', name: 'James Okoro',     position: 'Content Marketing Lead',stage: 'Applied',    daysInStage: 3  },
  { id: 'a10',name: 'Sofia Lundberg',  position: 'Content Marketing Lead',stage: 'Screening',  daysInStage: 2  },
];

const STAGES: Stage[] = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired'];

export default function HiringScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business');
  const isCEO = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/workforce/contact' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.iconBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Hiring</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isCEO} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Open Positions */}
        <View style={{ paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Open Positions</Text>
          <View style={{ gap: 10 }}>
            {POSITIONS.map(pos => (
              <Pressable
                key={pos.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(pos.title, `${pos.department} · Posted ${pos.posted}\n${pos.applicants} applicants`);
                }}
              >
                <View style={[s.posCard, { backgroundColor: C.surface }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{pos.title}</Text>
                    <Text style={{ fontSize: 13, color: C.secondary, marginTop: 3 }}>{pos.department} · Posted {pos.posted}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{pos.applicants} applicants</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 8 }}>
                    <View style={[s.statusPill, { borderColor: STATUS_COLOR[pos.status] + '60', backgroundColor: STATUS_COLOR[pos.status] + '18' }]}>
                      <Text style={{ fontSize: 11, fontWeight: '600', color: STATUS_COLOR[pos.status] }}>{pos.status}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={14} color={C.secondary} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Pipeline Kanban */}
        <View style={{ marginTop: 28, paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Applicant Pipeline</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 10, paddingBottom: 8 }}
        >
          {STAGES.map(stage => {
            const cards = APPLICANTS.filter(a => a.stage === stage);
            return (
              <View key={stage} style={[s.kanbanCol, { backgroundColor: C.surface }]}>
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.secondary, marginBottom: 10, letterSpacing: 0.5 }}>
                  {stage.toUpperCase()} ({cards.length})
                </Text>
                {cards.map(a => (
                  <Pressable
                    key={a.id}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Alert.alert(a.name, `${a.position}\n${a.daysInStage}d in ${a.stage}`); }}
                  >
                    <View style={[s.kanbanCard, { backgroundColor: C.bg, borderColor: C.separator }]}>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{a.name}</Text>
                      <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{a.position}</Text>
                      <Text style={{ fontSize: 10, color: C.secondary, marginTop: 4 }}>{a.daysInStage}d in stage</Text>
                    </View>
                  </Pressable>
                ))}
                {cards.length === 0 && (
                  <View style={[s.emptyCol, { borderColor: C.separator }]}>
                    <Text style={{ fontSize: 12, color: C.secondary }}>—</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>

      </ScrollView>

      {/* FAB */}
      <Pressable
        style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('Create Position', 'Coming soon'); }}
      >
        <IconSymbol name="plus" size={22} color={C.bg} />
      </Pressable>

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    posCard:       { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12 },
    statusPill:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    kanbanCol:     { width: 160, borderRadius: 12, padding: 12 },
    kanbanCard:    { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, padding: 10, marginBottom: 8 },
    emptyCol:      { borderRadius: 8, borderWidth: StyleSheet.hairlineWidth, padding: 10, alignItems: 'center' },
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8,
      elevation: 4,
    },
  });
}
