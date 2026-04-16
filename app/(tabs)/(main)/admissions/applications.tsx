/**
 * Admissions — Applications (President only)
 * Application review queue: filter, stats, list with detail on tap.
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
import { getApplications, formatAidAmount, type ReviewStatus, type Decision } from '@/data/mock-admissions';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

type AppFilter = 'All' | 'New' | 'Under Review' | 'Decision Made' | 'By Program';
const FILTERS: AppFilter[] = ['All', 'New', 'Under Review', 'Decision Made'];

const REVIEW_STATUS_COLOR: Record<ReviewStatus, string> = {
  unread:          '#8A837C',
  'in-review':     CAUTION,
  scored:          CAUTION,
  'decision-ready': '#1A1714',
  decided:         GAIN,
};
const REVIEW_STATUS_LABEL: Record<ReviewStatus, string> = {
  unread:          'New',
  'in-review':     'Under Review',
  scored:          'Scored',
  'decision-ready': 'Ready',
  decided:         'Decided',
};

const DECISION_COLOR: Record<Decision, string> = {
  accepted:  GAIN,
  denied:    HEAT,
  waitlisted: CAUTION,
  deferred:  '#8A837C',
};

export default function ApplicationsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('education:admissions');
  const isPresident = role === roleCycles[0];
  const [activeFilter, setActiveFilter] = useState<AppFilter>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isPresident) router.replace('/(tabs)/(main)/admissions/my-application' as any);
  }, [isPresident, router]);

  if (!isPresident) return null;

  const allApps = getApplications('all');
  const reviewed  = allApps.filter(a => a.reviewStatus !== 'unread').length;
  const pending   = allApps.filter(a => a.reviewStatus === 'unread').length;

  const filtered = useMemo(() => {
    if (activeFilter === 'New') return getApplications('unreviewed');
    if (activeFilter === 'Under Review') return getApplications('inReview');
    if (activeFilter === 'Decision Made') return getApplications('decided');
    return allApps;
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
              <Text style={[s.titlePillText, { color: C.label }]}>Applications</Text>
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

        {/* Stats */}
        <View style={[s.row, { gap: 10, paddingHorizontal: 16, marginBottom: 20 }]}>
          {[
            { label: 'Total',    value: `${allApps.length}`, color: C.label },
            { label: 'Reviewed', value: `${reviewed}`,       color: GAIN },
            { label: 'New',      value: `${pending}`,        color: pending > 0 ? CAUTION : C.label },
            { label: 'Avg Time', value: '3.2d',              color: C.label },
          ].map(stat => (
            <GlassView key={stat.label} tier={1} style={[s.statCard, { flex: 1 }]}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: stat.color }}>{stat.value}</Text>
              <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{stat.label}</Text>
            </GlassView>
          ))}
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

        {/* Application list */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden' }}>
            {filtered.map((app, i) => {
              const statusColor = REVIEW_STATUS_COLOR[app.reviewStatus];
              const statusLabel = REVIEW_STATUS_LABEL[app.reviewStatus];
              const decisionColor = app.decision ? DECISION_COLOR[app.decision] : null;

              return (
                <Pressable
                  key={app.id}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    const aidLine = app.financialAidAmount ? `\nAid Offered: ${formatAidAmount(app.financialAidAmount)}` : '';
                    const missingLine = app.missingItems.length > 0 ? `\nMissing: ${app.missingItems.join(', ')}` : '';
                    const decLine = app.decision ? `\nDecision: ${app.decision.charAt(0).toUpperCase() + app.decision.slice(1)}` : '';
                    Alert.alert(app.studentName, `Program: ${app.program}\nSubmitted: ${app.submissionDate}\nCompleteness: ${app.completeness}%\nReviewer: ${app.reviewerName ?? 'Unassigned'}${missingLine}${decLine}${aidLine}`, [
                      { text: 'Accept', onPress: () => Alert.alert('Accepted', `${app.studentName} accepted — coming soon`) },
                      { text: 'Deny',   style: 'destructive', onPress: () => Alert.alert('Denied', 'Decision recorded') },
                      { text: 'Close',  style: 'cancel' },
                    ]);
                  }}
                  style={({ pressed }) => [
                    s.row,
                    { paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    pressed && { opacity: 0.7 },
                  ]}
                >
                  <View style={[s.avatarCircle, { backgroundColor: `hsl(${(app.id.charCodeAt(3) || 0) * 53 % 360},32%,72%)` }]}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{app.studentInitials}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{app.studentName}</Text>
                    <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>{app.program} · {app.submissionDate}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    {app.decision ? (
                      <View style={[s.stagePill, { backgroundColor: (decisionColor ?? GAIN) + '18', borderColor: (decisionColor ?? GAIN) + '60' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: decisionColor ?? GAIN }}>
                          {app.decision.charAt(0).toUpperCase() + app.decision.slice(1)}
                        </Text>
                      </View>
                    ) : (
                      <View style={[s.stagePill, { backgroundColor: statusColor + '18', borderColor: statusColor + '60' }]}>
                        <Text style={{ fontSize: 10, fontWeight: '600', color: statusColor }}>{statusLabel}</Text>
                      </View>
                    )}
                    <Text style={{ fontSize: 10, color: C.secondary }}>{app.reviewerName ?? 'Unassigned'}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={13} color={C.secondary} />
                </Pressable>
              );
            })}
          </GlassView>
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
    statCard:      { alignItems: 'center', padding: 12, borderRadius: 12 },
    filterPill:    { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
    stagePill:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    avatarCircle:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  });
}
