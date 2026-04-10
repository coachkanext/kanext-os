/**
 * Community Give Side Panel — admin navigation + giving summary.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  GIVING_CAMPAIGNS, MY_RECURRING_GIFTS, MY_PLEDGES, GIVING_TRANSACTIONS,
  ADMIN_DASHBOARD, formatCurrency, getFundById,
} from '@/data/mock-give';

export function CommunityGivePanel() {
  const router = useRouter();
  const C = useColors();

  const myTx       = GIVING_TRANSACTIONS.filter(t => t.isMe);
  const total2026  = myTx.filter(t => t.date.startsWith('2026')).reduce((acc, t) => acc + t.amount, 0);
  const activeCampaigns = GIVING_CAMPAIGNS.filter(c => c.status === 'active');

  const navRow = (icon: string, label: string, detail?: string, onPress?: () => void) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); }}
    >
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>
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

      <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />

      {/* Giving summary */}
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 8 }}>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>This Month</Text>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {([
            { label: 'Total',    value: formatCurrency(ADMIN_DASHBOARD.thisMonth.total), color: C.accent },
            { label: 'Givers',   value: ADMIN_DASHBOARD.thisMonth.givers.toString(),     color: '#5A8A6E' },
            { label: 'Avg Gift', value: formatCurrency(ADMIN_DASHBOARD.thisMonth.avgGift), color: C.label },
          ] as const).map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed, borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '800', color: item.color }}>{item.value}</Text>
              <Text style={{ fontSize: 8, color: C.secondary, textAlign: 'center', marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* My giving */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>My Giving</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, color: C.secondary }}>2026 Year to Date</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{formatCurrency(total2026)}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 11, color: C.secondary }}>Recurring</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#5A8A6E', textAlign: 'right' }}>
              {MY_RECURRING_GIFTS.filter(r => r.status === 'active').length} active
            </Text>
          </View>
        </View>

        {/* Active recurring gifts */}
        {MY_RECURRING_GIFTS.filter(r => r.status === 'active').map((rg, i) => (
          <Pressable
            key={rg.id}
            style={({ pressed }) => [
              { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
              i < MY_RECURRING_GIFTS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              pressed && { backgroundColor: C.surfacePressed },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#5A8A6E' }} />
            <Text style={{ flex: 1, fontSize: 13, color: C.label }}>
              {formatCurrency(rg.amount)}/mo — {getFundById(rg.fundId).name}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Active pledges */}
      {MY_PLEDGES.length > 0 && (
        <>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>My Pledges</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {MY_PLEDGES.map((pledge, i) => {
              const campaign = GIVING_CAMPAIGNS.find(c => c.id === pledge.campaignId);
              const pct = Math.min(100, Math.round((pledge.fulfilledAmount / pledge.totalPledged) * 100));
              return (
                <View
                  key={pledge.id}
                  style={{
                    paddingHorizontal: 14, paddingVertical: 12, gap: 6,
                    borderBottomWidth: i < MY_PLEDGES.length - 1 ? StyleSheet.hairlineWidth : 0,
                    borderBottomColor: C.separator,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{campaign?.name}</Text>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                    <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${pct}%` as any }} />
                  </View>
                  <Text style={{ fontSize: 11, color: C.secondary }}>
                    {formatCurrency(pledge.fulfilledAmount)} / {formatCurrency(pledge.totalPledged)} · {pct}%
                  </Text>
                </View>
              );
            })}
          </View>
        </>
      )}

      {/* Actions */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('doc.text.fill',           'Tax Receipt')}
        {navRow('arrow.up.circle.fill',    'Export Giving Report')}
        {navRow('plus.circle.fill',        'New Campaign')}
      </View>

      {/* Settings */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Settings</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('creditcard',        'Payment Methods')}
        {navRow('building.columns',  'Fund Management')}
        {navRow('bell',              'Giving Notifications')}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  sectionHeader: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', paddingVertical: 6 },
  navRow:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  navLabel:      { flex: 1, fontSize: 14, fontWeight: '500' },
  navDetail:     { fontSize: 12 },
});
