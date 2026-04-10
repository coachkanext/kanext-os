/**
 * Business Inquiries Side Panel — Pipeline / Contacts / Campaigns nav.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  DEALS, CAMPAIGNS, BIZ_DASHBOARD,
  formatCurrency, stageColor,
  type DealStage,
} from '@/data/mock-business-ops';

const STAGES: DealStage[] = ['New', 'Qualified', 'Proposal', 'Negotiation'];

export function InquiriesPanel() {
  const router = useRouter();
  const C = useColors();
  const [role, setRole] = useState<'Admin' | 'Sales' | 'Employee'>('Admin');
  const isPrivileged = role === 'Admin' || role === 'Sales';

  const openDeals   = DEALS.filter(d => d.stage !== 'Won' && d.stage !== 'Lost');
  const pipelineVal = openDeals.reduce((s, d) => s + d.value, 0);

  const closingSoon = useMemo(() => DEALS.filter(d => {
    if (d.stage === 'Won' || d.stage === 'Lost') return false;
    const close = new Date(d.expectedClose);
    const today = new Date('2026-03-26');
    return (close.getTime() - today.getTime()) / (1000 * 60 * 60 * 24) <= 14;
  }), []);

  const stageBreakdown = STAGES.map(stage => ({
    stage,
    count: DEALS.filter(d => d.stage === stage).length,
    value: DEALS.filter(d => d.stage === stage).reduce((s, d) => s + d.value, 0),
  }));
  const maxStageVal = Math.max(...stageBreakdown.map(s => s.value), 1);

  const myDeals = DEALS.filter(d => d.assigneeId === 'e01' && d.stage !== 'Won' && d.stage !== 'Lost').slice(0, 3);

  const navRow = (icon: string, label: string, detail?: string) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
    >
      <IconSymbol name={icon as any} size={16} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>

      {/* Role toggle */}
      <View style={[s.roleRow, { backgroundColor: C.surfacePressed as string }]}>
        {(['Admin', 'Sales', 'Employee'] as const).map(r => (
          <Pressable key={r} onPress={() => { Haptics.selectionAsync(); setRole(r); }}
            style={[s.roleBtn, r === role && { backgroundColor: C.accent }]}>
            <Text style={[s.roleBtnText, { color: r === role ? '#fff' : C.secondary }]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {isPrivileged ? (
        <>
          {/* ── Home ── */}
          <Pressable
            style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              closeSidePanel();
              router.setParams({ manage: undefined });
            }}
          >
            <IconSymbol name="house.fill" size={18} color={C.secondary} />
            <Text style={[s.navLabel, { color: C.label }]}>Home</Text>
          </Pressable>

          {/* Pipeline snapshot */}
          <View style={{ backgroundColor: '#1A1714', borderRadius: 12, padding: 14, gap: 6 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Pipeline</Text>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#fff', lineHeight: 30 }}>{formatCurrency(pipelineVal, true)}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>{openDeals.length} open deals · {BIZ_DASHBOARD.pipeline.closingSoon} closing soon</Text>
          </View>

          {/* Stage bars */}
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, gap: 6 }}>
            {stageBreakdown.map(item => (
              <View key={item.stage} style={{ gap: 3 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, flex: 1 }}>{item.stage}</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>{item.count} · {formatCurrency(item.value, true)}</Text>
                </View>
                <View style={{ height: 4, backgroundColor: C.surfacePressed as string, borderRadius: 2 }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: stageColor(item.stage), width: `${(item.value / maxStageVal) * 100}%` as any }} />
                </View>
              </View>
            ))}
          </View>

          {/* Closing this week */}
          {closingSoon.length > 0 && (
            <>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>Closing Within 14 Days</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                {closingSoon.slice(0, 3).map((deal, i) => (
                  <Pressable key={deal.id} style={({ pressed }) => [
                    s.navRow,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                    pressed && { backgroundColor: C.surfacePressed },
                  ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stageColor(deal.stage) }} />
                    <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{deal.company}</Text>
                    <Text style={[s.navDetail, { color: C.accent }]}>{formatCurrency(deal.value, true)}</Text>
                  </Pressable>
                ))}
              </View>
            </>
          )}

          {/* Quick actions */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('plus.circle.fill',      'New Deal')}
            {navRow('person.fill.badge.plus','Add Contact')}
          </View>
        </>
      ) : (
        <>
          {/* My deals */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>My Deals</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {myDeals.length === 0 && (
              <Text style={[s.navLabel, { color: C.muted, padding: 14 }]}>No active deals</Text>
            )}
            {myDeals.map((deal, i) => (
              <Pressable key={deal.id} style={({ pressed }) => [
                s.navRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: stageColor(deal.stage) }} />
                <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{deal.title}</Text>
                <Text style={[s.navDetail, { color: C.accent }]}>{formatCurrency(deal.value, true)}</Text>
              </Pressable>
            ))}
          </View>

        </>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 6 },
  navRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:     { fontSize: 12 },
  roleRow:       { flexDirection: 'row', borderRadius: 10, padding: 3, gap: 2 },
  roleBtn:       { flex: 1, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  roleBtnText:   { fontSize: 13, fontWeight: '700' },
});
