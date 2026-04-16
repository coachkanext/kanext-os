/**
 * Admissions — Pipeline (President only)
 * Enrollment funnel: Inquiry → Applied → Under Review → Accepted → Deposited → Enrolled.
 * Prospect list with stage filter pills.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol }    from '@/components/ui/icon-symbol';
import { KMenuButton }   from '@/components/ui/k-menu-button';
import { RolePill }      from '@/components/ui/role-pill';
import { GlassView }     from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel }  from '@/utils/global-side-panel';
import { resetFooter }    from '@/utils/global-footer-hide';
import { useDemoRole }    from '@/utils/demo-role-store';
import { APPLICANTS, type EnrollmentStage } from '@/data/mock-admissions';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

// Spec numbers: 45 inquiries, 30 applied, 15 under review, 12 accepted, 8 deposited, 6 enrolled
const FUNNEL_STAGES = [
  { label: 'Inquiry',      count: 45, color: '#8A837C' },
  { label: 'Applied',      count: 30, color: '#6B7280' },
  { label: 'Under Review', count: 15, color: CAUTION   },
  { label: 'Accepted',     count: 12, color: GAIN      },
  { label: 'Deposited',    count:  8, color: GAIN      },
  { label: 'Enrolled',     count:  6, color: GAIN      },
];

const METRICS = [
  { label: 'Total Prospects',       value: '120' },
  { label: 'Inquiry → Applied',     value: '67%' },
  { label: 'Accepted → Enrolled',   value: '50%' },
  { label: 'Avg: Apply → Enroll',   value: '48d' },
];

type FilterPill = 'All' | 'Inquiry' | 'Applied' | 'Under Review' | 'Accepted' | 'Deposited' | 'Enrolled' | 'Denied' | 'Withdrawn';
const FILTERS: FilterPill[] = ['All', 'Inquiry', 'Applied', 'Under Review', 'Accepted', 'Deposited', 'Enrolled'];

const REVIEWER_MAP: Record<string, string> = {
  ap1: 'Sarah Chen', ap2: 'Marcus Webb', ap3: 'Dr. Patel',
  ap4: 'Sarah Chen', ap5: 'Dr. Harper', ap6: 'Dr. Collins',
  ap7: 'Prof. Lane', ap8: 'Dr. Harper', ap9: 'Dr. Collins',
  ap10: 'Dr. Patel', ap11: 'Dr. Harper', ap12: 'Dr. Patel',
  ap13: 'Prof. Lane', ap14: 'Dr. Harper', ap15: 'Dr. Collins',
  ap16: 'Dr. Patel', ap17: 'Prof. Lane', ap18: 'Dr. Harper',
  ap19: 'Dr. Collins', ap20: 'Sarah Chen', ap21: 'Marcus Webb',
};

const STAGE_DISPLAY: Partial<Record<EnrollmentStage, string>> = {
  Admitted: 'Accepted',
};

function stageColor(stage: EnrollmentStage): string {
  if (stage === 'Admitted' || stage === 'Deposited' || stage === 'Enrolled') return GAIN;
  if (stage === 'Under Review') return CAUTION;
  return '#8A837C';
}

export default function PipelineScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('education:admissions');
  const isPresident = role === roleCycles[0];
  const [activeFilter, setActiveFilter] = useState<FilterPill>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isPresident) router.replace('/(tabs)/(main)/admissions/my-application' as any);
  }, [isPresident, router]);

  if (!isPresident) return null;

  const maxCount = Math.max(...FUNNEL_STAGES.map(s => s.count));

  const filteredApplicants = useMemo(() => {
    if (activeFilter === 'All') return APPLICANTS;
    // "Accepted" pill maps to "Admitted" in data
    const targetStage = activeFilter === 'Accepted' ? 'Admitted' : activeFilter as EnrollmentStage;
    return APPLICANTS.filter(a => a.stage === targetStage);
  }, [activeFilter]);

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable style={s.iconBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Pipeline</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isPresident} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: totalTopH + 16, paddingBottom: insets.bottom + 100 }}
      >

        {/* Funnel visualization */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Enrollment Funnel</Text>
          <GlassView tier={1} style={{ borderRadius: 14, padding: 16 }}>
            {FUNNEL_STAGES.map((stage, i) => {
              const barWidth = (stage.count / maxCount) * 100;
              const nextStage = FUNNEL_STAGES[i + 1];
              const convRate = nextStage ? Math.round((nextStage.count / stage.count) * 100) : null;

              return (
                <View key={stage.label}>
                  <View style={[s.row, { marginBottom: 6 }]}>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, width: 110 }}>{stage.label}</Text>
                    <View style={{ flex: 1, height: 20, backgroundColor: C.separator, borderRadius: 4, overflow: 'hidden', marginHorizontal: 8 }}>
                      <View style={{ width: `${barWidth}%`, height: 20, backgroundColor: stage.color, borderRadius: 4 }} />
                    </View>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: stage.color, width: 28, textAlign: 'right' }}>{stage.count}</Text>
                  </View>
                  {convRate !== null && (
                    <View style={[s.row, { marginBottom: 6, marginLeft: 8 }]}>
                      <IconSymbol name="chevron.down" size={10} color={C.secondary} />
                      <Text style={{ fontSize: 10, color: C.secondary, marginLeft: 4 }}>{convRate}% → {nextStage.label}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </GlassView>
        </View>

        {/* Filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}
        >
          {FILTERS.map(f => {
            const active = activeFilter === f;
            return (
              <Pressable
                key={f}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(f); }}
                style={[s.filterPill, { backgroundColor: active ? C.label : C.surface, borderColor: active ? C.label : C.separator }]}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: active ? C.bg : C.label }}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Prospect list */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {filteredApplicants.length === 0 ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <Text style={{ fontSize: 14, color: C.secondary }}>No prospects in this stage</Text>
              </View>
            ) : (
              filteredApplicants.map((ap, i) => {
                const displayStage = STAGE_DISPLAY[ap.stage] ?? ap.stage;
                const sColor = stageColor(ap.stage);
                const reviewer = REVIEWER_MAP[ap.id] ?? 'Unassigned';

                return (
                  <Pressable
                    key={ap.id}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      Alert.alert(ap.name, `Program: ${ap.intendedMajor}\nStage: ${displayStage}\nGPA: ${ap.gpa}\nLocation: ${ap.location}\nReviewer: ${reviewer}`);
                    }}
                    style={({ pressed }) => [
                      s.row,
                      { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View style={[s.avatarCircle, { backgroundColor: `hsl(${(ap.id.charCodeAt(2) || 0) * 47 % 360},35%,72%)` }]}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{ap.initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{ap.name}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{ap.intendedMajor}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <View style={[s.stagePill, { backgroundColor: sColor + '18', borderColor: sColor + '60' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: sColor }}>{displayStage}</Text>
                      </View>
                      <Text style={{ fontSize: 10, color: C.secondary }}>{reviewer}</Text>
                    </View>
                    <IconSymbol name="chevron.right" size={13} color={C.secondary} />
                  </Pressable>
                );
              })
            )}
          </GlassView>
        </View>

        {/* Pipeline metrics */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Cycle Metrics</Text>
          <View style={[s.row, { flexWrap: 'wrap', gap: 10 }]}>
            {METRICS.map(m => (
              <GlassView key={m.label} tier={1} style={{ width: '47%', borderRadius: 12, padding: 12, alignItems: 'center' }}>
                <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{m.value}</Text>
                <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2, textAlign: 'center' }}>{m.label}</Text>
              </GlassView>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:          { flex: 1 },
    topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    sectionTitle:  { fontSize: 17, fontWeight: '700' },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    stagePill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    avatarCircle:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  });
}
