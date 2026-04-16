/**
 * Inquiries — Pipeline (CEO only)
 * Sales pipeline with alert cards, collapsible stage groups, deal detail
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import {
  DEALS, getContactById, getEmployeeById,
  formatCurrency, formatDate, stageColor,
  type Deal, type DealStage,
} from '@/data/mock-business-ops';

const TOP_BAR_H = 54;
const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

const PIPELINE_STAGES: DealStage[] = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'];

function dealStageBg(stage: DealStage): string {
  const m: Record<DealStage, string> = {
    New:         'rgba(26,23,20,0.06)',
    Qualified:   'rgba(26,23,20,0.06)',
    Proposal:    'rgba(26,23,20,0.06)',
    Negotiation: 'rgba(184,148,62,0.10)',
    Won:         'rgba(90,138,110,0.10)',
    Lost:        'rgba(184,92,92,0.10)',
  };
  return m[stage];
}

export default function PipelineScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  const [role, cycleRole, roleCycles] = useDemoRole('business:inquiries');
  const isCEO = role === roleCycles[0];

  const [selectedDealId,  setSelectedDealId]  = useState<string | null>(null);
  const [collapsedStages, setCollapsedStages] = useState<Set<DealStage>>(new Set(['Won', 'Lost']));

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  useEffect(() => {
    if (!isCEO) router.replace('/(tabs)/(main)/inquiries/support' as any);
  }, [isCEO, router]);

  if (!isCEO) return null;

  function toggleStage(stage: DealStage) {
    Haptics.selectionAsync();
    setCollapsedStages(prev => {
      const next = new Set(prev);
      next.has(stage) ? next.delete(stage) : next.add(stage);
      return next;
    });
  }

  const activePipelineValue = DEALS
    .filter(d => d.stage !== 'Won' && d.stage !== 'Lost')
    .reduce((s, d) => s + d.value, 0);

  const closingSoon = DEALS.filter(d => {
    if (d.stage === 'Won' || d.stage === 'Lost') return false;
    const close = new Date(d.expectedClose);
    const today = new Date('2026-04-15');
    const diff  = (close.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7 && diff >= 0;
  });

  const overdueFollowUps = DEALS.filter(d => {
    if (d.stage === 'Won' || d.stage === 'Lost') return false;
    const last = new Date(d.lastActivity);
    const today = new Date('2026-04-15');
    return (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24) > 7;
  });

  function renderDealDetail(deal: Deal) {
    const contact  = getContactById(deal.contactId);
    const assignee = getEmployeeById(deal.assigneeId);
    return (
      <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 12 }]}>
        <Pressable onPress={() => setSelectedDealId(null)} style={[s.row, { marginBottom: 12 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary} />
          <Text style={[s.bodySmall, { color: C.secondary, marginLeft: 4 }]}>Back to Pipeline</Text>
        </Pressable>

        <View style={[s.row, { marginBottom: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{deal.title}</Text>
            <Text style={[s.bodySmall, { color: C.secondary }]}>{deal.company}</Text>
          </View>
          <View style={[s.stageBadge, { backgroundColor: dealStageBg(deal.stage), borderColor: stageColor(deal.stage) }]}>
            <Text style={[s.stageBadgeText, { color: stageColor(deal.stage) }]}>{deal.stage}</Text>
          </View>
        </View>

        <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
          {[
            { label: 'Value', value: formatCurrency(deal.value, true), color: C.label },
            { label: 'Close', value: formatDate(deal.expectedClose),  color: C.label },
            { label: 'Prob',  value: `${deal.probability}%`,          color: deal.probability > 60 ? GAIN : C.secondary },
          ].map(m => (
            <View key={m.label} style={[s.metricChip, { flex: 1, backgroundColor: C.surface }]}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: m.color }}>{m.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary }}>{m.label}</Text>
            </View>
          ))}
        </View>

        {[
          { label: 'Contact',       value: contact?.name ?? '—' },
          { label: 'Assignee',      value: assignee?.name ?? '—' },
          { label: 'Last Activity', value: formatDate(deal.lastActivity) },
          { label: 'Notes',         value: deal.notes },
        ].map((item, i) => (
          <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
            <Text style={{ fontSize: 13, color: C.secondary, width: 100 }}>{item.label}</Text>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label, flex: 1 }} numberOfLines={2}>{item.value}</Text>
          </View>
        ))}

        <View style={[s.row, { marginTop: 14, gap: 8 }]}>
          {[
            { label: 'Log Activity', icon: 'pencil' },
            { label: 'Move Stage',   icon: 'arrow.right.circle' },
            { label: 'Mark Won',     icon: 'checkmark.seal' },
          ].map(a => (
            <Pressable key={a.label} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[s.outlineBtn, { flex: 1, gap: 4, borderColor: C.separator }]}>
              <IconSymbol name={a.icon as any} size={14} color={C.label} />
              <Text style={{ fontSize: 11, color: C.secondary }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </GlassView>
    );
  }

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
        {selectedDealId ? (
          (() => {
            const deal = DEALS.find(d => d.id === selectedDealId);
            return deal ? renderDealDetail(deal) : null;
          })()
        ) : (
          <>
            {/* Stats row */}
            <View style={[s.row, { gap: 8, paddingHorizontal: 16, marginBottom: 12 }]}>
              {[
                { label: 'Pipeline',     value: formatCurrency(activePipelineValue, true) },
                { label: 'Open Deals',   value: `${DEALS.filter(d => d.stage !== 'Won' && d.stage !== 'Lost').length}` },
                { label: 'Closing Soon', value: `${closingSoon.length}` },
              ].map(m => (
                <View key={m.label} style={[s.metricChip, { flex: 1, backgroundColor: C.surface }]}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{m.value}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* Alert: Closing This Week */}
            {closingSoon.length > 0 && (
              <View style={[s.alertCard, { borderLeftColor: CAUTION, backgroundColor: CAUTION + '10', marginHorizontal: 16, marginBottom: 10 }]}>
                <View style={s.row}>
                  <IconSymbol name="clock.badge.exclamationmark" size={15} color={CAUTION} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: CAUTION, marginLeft: 6 }}>Closing This Week</Text>
                </View>
                {closingSoon.map(d => (
                  <Pressable key={d.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDealId(d.id); }}>
                    <Text style={{ fontSize: 13, color: C.label, marginTop: 4 }}>{d.title} — {formatCurrency(d.value, true)}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Alert: Overdue Follow-Ups */}
            {overdueFollowUps.length > 0 && (
              <View style={[s.alertCard, { borderLeftColor: HEAT, backgroundColor: HEAT + '10', marginHorizontal: 16, marginBottom: 12 }]}>
                <View style={s.row}>
                  <IconSymbol name="exclamationmark.circle.fill" size={15} color={HEAT} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: HEAT, marginLeft: 6 }}>Overdue Follow-Ups</Text>
                </View>
                {overdueFollowUps.slice(0, 3).map(d => (
                  <Pressable key={d.id} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDealId(d.id); }}>
                    <Text style={{ fontSize: 13, color: C.label, marginTop: 4 }}>{d.title} — no activity in 7+ days</Text>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Stage groups */}
            {PIPELINE_STAGES.map(stage => {
              const stageDeals = DEALS.filter(d => d.stage === stage);
              if (stageDeals.length === 0) return null;
              const isCollapsed = collapsedStages.has(stage);
              const stageVal    = stageDeals.reduce((acc, d) => acc + d.value, 0);
              return (
                <View key={stage} style={{ marginHorizontal: 16, marginBottom: 10 }}>
                  <Pressable
                    onPress={() => toggleStage(stage)}
                    style={[s.stageHeader, { backgroundColor: dealStageBg(stage), borderLeftColor: stageColor(stage) }]}
                  >
                    <View style={[s.row, { gap: 8, flex: 1 }]}>
                      <View style={[s.stageDot, { backgroundColor: stageColor(stage) }]} />
                      <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{stage}</Text>
                      <View style={[s.countBadge, { backgroundColor: stageColor(stage) }]}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{stageDeals.length}</Text>
                      </View>
                    </View>
                    <Text style={{ fontSize: 13, color: C.secondary, marginRight: 8 }}>{formatCurrency(stageVal, true)}</Text>
                    <IconSymbol name={isCollapsed ? 'chevron.down' : 'chevron.up'} size={12} color={C.secondary} />
                  </Pressable>

                  {!isCollapsed && (
                    <GlassView tier={1} style={{ borderRadius: 12, overflow: 'hidden' }}>
                      {stageDeals.map((deal, i) => {
                        const contact = getContactById(deal.contactId);
                        return (
                          <Pressable
                            key={deal.id}
                            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedDealId(deal.id); }}
                            style={({ pressed }) => [
                              s.row, { padding: 14, gap: 12 },
                              i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                              pressed && { opacity: 0.7 },
                            ]}
                          >
                            <View style={[s.avatarMd, { backgroundColor: C.label }]}>
                              <Text style={{ fontSize: 11, fontWeight: '700', color: C.bg }}>{contact?.initials ?? '??'}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{deal.title}</Text>
                              <Text style={{ fontSize: 12, color: C.secondary }} numberOfLines={1}>{deal.company}</Text>
                            </View>
                            <View style={{ alignItems: 'flex-end', gap: 3 }}>
                              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{formatCurrency(deal.value, true)}</Text>
                              <Text style={{ fontSize: 11, color: C.secondary }}>Close {formatDate(deal.expectedClose)}</Text>
                            </View>
                            <IconSymbol name="chevron.right" size={12} color={C.secondary} />
                          </Pressable>
                        );
                      })}
                    </GlassView>
                  )}
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* FAB */}
      {!selectedDealId && (
        <Pressable
          style={[s.fab, { backgroundColor: C.label, bottom: insets.bottom + 72 }]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Alert.alert('New Deal', 'Coming soon'); }}
        >
          <IconSymbol name="plus" size={22} color={C.bg} />
        </Pressable>
      )}

    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
    iconBtn:       { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    row:           { flexDirection: 'row', alignItems: 'center' },
    card:          { padding: 16, borderRadius: 16 },
    sectionTitle:  { fontSize: 15, fontWeight: '700' },
    bodySmall:     { fontSize: 13 },
    metricChip:    { alignItems: 'center', padding: 10, borderRadius: 12 },
    alertCard:     { borderLeftWidth: 3, borderRadius: 10, padding: 12, marginBottom: 4 },
    stageHeader:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderLeftWidth: 3, marginBottom: 6 },
    stageDot:      { width: 8, height: 8, borderRadius: 4 },
    stageBadge:    { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
    stageBadgeText:{ fontSize: 11, fontWeight: '600' },
    countBadge:    { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 8, marginLeft: 4 },
    avatarMd:      { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
    outlineBtn:    { height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
    fab: {
      position: 'absolute', right: 20,
      width: 52, height: 52, borderRadius: 26,
      alignItems: 'center', justifyContent: 'center',
      shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4,
    },
  });
}
