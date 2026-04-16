import React, { useMemo, useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';
const CAUTION = '#B8943E';

type EligibilityStatus = 'Eligible' | 'At Risk' | 'Ineligible';

const PLAYERS: { name: string; gpa: string; credits: string; status: EligibilityStatus }[] = [
  { name: 'Laolu Kalejaiye', gpa: '3.2 GPA', credits: '62 cr', status: 'Eligible' },
  { name: 'Brandon Williams', gpa: '2.8 GPA', credits: '45 cr', status: 'Eligible' },
  { name: 'Claude McKesey', gpa: '2.4 GPA', credits: '38 cr', status: 'At Risk' },
  { name: 'Nathan Chatelain', gpa: '3.5 GPA', credits: '71 cr', status: 'Eligible' },
  { name: 'Adrian Hernandez', gpa: '2.1 GPA', credits: '29 cr', status: 'At Risk' },
  { name: 'Chris Plantey', gpa: '3.1 GPA', credits: '55 cr', status: 'Eligible' },
  { name: 'Samuel Wall', gpa: '1.9 GPA', credits: '22 cr', status: 'Ineligible' },
  { name: 'Paul Diomande', gpa: '2.9 GPA', credits: '48 cr', status: 'Eligible' },
];

const SCHOLARSHIPS: { name: string; allocation: string }[] = [
  { name: 'Kalejaiye', allocation: 'Full' },
  { name: 'Williams', allocation: 'Full' },
  { name: 'McKesey', allocation: 'Partial (75%)' },
  { name: 'Chatelain', allocation: 'Full' },
  { name: 'Hernandez', allocation: 'Partial (50%)' },
  { name: 'Plantey', allocation: 'Walk-On' },
  { name: 'Wall', allocation: 'Walk-On' },
  { name: 'Diomande', allocation: 'Partial (25%)' },
];

function statusColor(status: EligibilityStatus) {
  if (status === 'Eligible') return GAIN;
  if (status === 'At Risk') return CAUTION;
  return HEAT;
}

export default function SportsCompliance() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole('sports:hub');
  const isHeadCoach = role === roleCycles[0];

  useFocusEffect(
    useCallback(() => {
      resetFooter();
      if (!isHeadCoach) {
        router.replace('/(tabs)/(main)/hub' as any);
      }
    }, [isHeadCoach])
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titleText, { color: C.label }]}>Compliance</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isHeadCoach} />
          </View>
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ELIGIBILITY TRACKER */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>ELIGIBILITY TRACKER</Text>
        <View style={[s.card, { backgroundColor: C.surface, overflow: 'hidden' }]}>
          {PLAYERS.map((p, i) => (
            <View
              key={i}
              style={[
                s.playerRow,
                i < PLAYERS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <Text style={[s.playerName, { color: C.label }]}>{p.name}</Text>
              <Text style={[s.playerStat, { color: C.secondary }]}>{p.gpa}</Text>
              <Text style={[s.playerStat, { color: C.secondary }]}>{p.credits}</Text>
              <View style={[s.statusBadge, { backgroundColor: statusColor(p.status) }]}>
                <Text style={s.statusText}>{p.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* SCHOLARSHIP TRACKER */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>SCHOLARSHIP TRACKER</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={s.scholarshipBar}>
            <View style={[s.barTrack, { backgroundColor: C.separator }]}>
              <View style={[s.barFill, { backgroundColor: GAIN, width: `${(8 / 11) * 100}%` }]} />
            </View>
          </View>
          <Text style={[s.scholarshipLabel, { color: GAIN }]}>8 of 11 scholarships allocated</Text>
          <Text style={[s.scholarshipRemaining, { color: C.secondary }]}>3 remaining</Text>
          <View style={[s.divider, { backgroundColor: C.separator }]} />
          {SCHOLARSHIPS.map((sch, i) => (
            <View key={i} style={s.schRow}>
              <Text style={[s.schName, { color: C.label }]}>{sch.name}</Text>
              <Text style={[s.schAlloc, { color: C.secondary }]}>{sch.allocation}</Text>
            </View>
          ))}
        </View>

        {/* RECRUITING COMPLIANCE */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>RECRUITING COMPLIANCE</Text>
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <View style={s.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.infoTitle, { color: C.label }]}>Contact Period</Text>
              <Text style={[s.infoSub, { color: C.secondary }]}>Current Period: Evaluation (Apr 1 - May 31)</Text>
            </View>
            <View style={[s.activeBadge, { backgroundColor: GAIN }]}>
              <Text style={s.activeBadgeText}>ACTIVE</Text>
            </View>
          </View>
        </View>
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[s.infoTitle, { color: C.label }]}>Official Visits</Text>
          <Text style={[s.infoSub, { color: C.secondary }]}>3 of 5 used</Text>
          <View style={[s.barTrack, { backgroundColor: C.separator, marginTop: 8 }]}>
            <View style={[s.barFill, { backgroundColor: GAIN, width: '60%' }]} />
          </View>
        </View>
        <Pressable
          style={[s.infoCard, { backgroundColor: C.surface }]}
          onPress={() => Alert.alert('Contact Log', 'Viewing all logged contacts...')}
        >
          <View style={s.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.infoTitle, { color: C.label }]}>Contact Log</Text>
              <Text style={[s.infoSub, { color: C.secondary }]}>14 logged contacts this period</Text>
            </View>
            <Text style={[s.viewAll, { color: C.label }]}>View All</Text>
          </View>
        </Pressable>

        {/* NIL COMPLIANCE */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>NIL COMPLIANCE</Text>
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <View style={s.infoRow}>
            <View style={{ flex: 1 }}>
              <Text style={[s.infoTitle, { color: C.label }]}>Active NIL Deals</Text>
              <Text style={[s.infoSub, { color: C.secondary }]}>4 active deals, all disclosed</Text>
            </View>
            <View style={[s.activeBadge, { backgroundColor: GAIN }]}>
              <Text style={s.activeBadgeText}>COMPLIANT</Text>
            </View>
          </View>
        </View>
        <View style={[s.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[s.infoTitle, { color: C.label }]}>Auto-Monitor</Text>
          <Text style={[s.infoSub, { color: C.secondary }]}>Booster conflict monitoring: ON</Text>
          <Text style={[s.infoSub, { color: C.secondary }]}>Last scan: Today 9:15 AM</Text>
        </View>

        {/* GAAC RULES */}
        <View style={s.darkCard}>
          <View style={s.gaacHeader}>
            <Text style={s.gaacTitle}>GAAC RULES</Text>
            <Text style={s.gaacSubtitle}>Gulf Atlantic Athletic Conference Governance</Text>
          </View>
          <Pressable
            style={s.gaacBtn}
            onPress={() => Alert.alert('GAAC Rules', 'Opening rules search...')}
          >
            <Text style={s.gaacBtnText}>Search rules...</Text>
          </Pressable>
          <Pressable
            style={s.gaacBtn}
            onPress={() => Alert.alert('GAAC Rules', 'Viewing key deadlines...')}
          >
            <Text style={s.gaacBtnText}>Key deadlines</Text>
            <IconSymbol name="chevron.right" size={14} color="rgba(255,255,255,0.4)" />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
    kBtn: { width: 44, height: 36, justifyContent: 'center' },
    titlePill: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText: { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { alignItems: 'flex-end' },
    sectionHeader: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.8,
      marginHorizontal: 16, marginBottom: 10, marginTop: 24,
    },
    card: { borderRadius: 14, marginHorizontal: 16 },
    playerRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 12, gap: 8,
    },
    playerName: { flex: 1, fontSize: 14, fontWeight: '500' },
    playerStat: { fontSize: 12, minWidth: 44, textAlign: 'right' },
    statusBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 4 },
    statusText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
    scholarshipBar: { marginBottom: 8 },
    barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
    barFill: { height: 8, borderRadius: 4 },
    scholarshipLabel: { fontSize: 13, fontWeight: '600' },
    scholarshipRemaining: { fontSize: 12, marginTop: 2 },
    divider: { height: StyleSheet.hairlineWidth, marginVertical: 12 },
    schRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
    schName: { fontSize: 13 },
    schAlloc: { fontSize: 13 },
    infoCard: { borderRadius: 12, marginHorizontal: 16, padding: 14, marginBottom: 8 },
    infoRow: { flexDirection: 'row', alignItems: 'center' },
    infoTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
    infoSub: { fontSize: 13 },
    activeBadge: { borderRadius: 5, paddingHorizontal: 7, paddingVertical: 3 },
    activeBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
    viewAll: { fontSize: 13, fontWeight: '600' },
    darkCard: {
      backgroundColor: '#1A1714', borderRadius: 12,
      marginHorizontal: 16, padding: 14, marginTop: 24, gap: 10,
    },
    gaacHeader: { gap: 2 },
    gaacTitle: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
    gaacSubtitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
    gaacBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: 'rgba(255,255,255,0.1)',
    },
    gaacBtnText: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  });
}
