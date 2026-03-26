/**
 * Education Fund Side Panel — admin/donor navigation + giving summary.
 */

import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  FUND_CAMPAIGNS, MY_RECURRING_GIFTS, MY_PLEDGE, FUND_TRANSACTIONS,
  ADMIN_DASHBOARD, SCHOLARSHIPS, formatCurrency, getFundById, lifetimeGiving,
} from '@/data/mock-fund';

export function EduFundPanel() {
  const C = useColors();
  const [role, setRole] = useState<'Admin' | 'Donor'>('Admin');

  const myTx      = FUND_TRANSACTIONS.filter(t => t.isMe);
  const total2026 = myTx.filter(t => t.date.startsWith('2026')).reduce((acc, t) => acc + t.amount, 0);
  const activeCampaigns    = FUND_CAMPAIGNS.filter(c => c.status === 'active');
  const pendingScholarships = SCHOLARSHIPS.filter(s => s.status === 'reviewing').length;

  // 5-dot alumni engagement score (1–5)
  const engagementScore = Math.min(5, Math.max(1, Math.floor(lifetimeGiving() / 200)));

  const navRow = (icon: string, label: string, detail?: string, badgeCount?: number, onPress?: () => void) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress?.(); closeSidePanel(); }}
    >
      <IconSymbol name={icon as any} size={18} color={C.secondary} />
      <Text style={[s.navLabel, { color: C.label }]}>{label}</Text>
      {detail && <Text style={[s.navDetail, { color: C.muted }]}>{detail}</Text>}
      {badgeCount != null && badgeCount > 0 && (
        <View style={{ backgroundColor: '#E8884A', borderRadius: 8, minWidth: 18, height: 18, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>{badgeCount}</Text>
        </View>
      )}
      <IconSymbol name="chevron.right" size={12} color={C.muted} />
    </Pressable>
  );

  return (
    <View style={{ gap: 8 }}>
      {/* Role toggle */}
      <View style={{ flexDirection: 'row', backgroundColor: C.surface, borderRadius: 10, padding: 3, marginBottom: 4 }}>
        {(['Admin', 'Donor'] as const).map(r => {
          const active = role === r;
          return (
            <Pressable
              key={r}
              style={{ flex: 1, paddingVertical: 7, borderRadius: 8, alignItems: 'center', backgroundColor: active ? C.bg : 'transparent' }}
              onPress={() => { Haptics.selectionAsync(); setRole(r); }}
            >
              <Text style={{ fontSize: 13, fontWeight: active ? '700' : '500', color: active ? C.label : C.secondary }}>{r}</Text>
            </Pressable>
          );
        })}
      </View>

      {role === 'Admin' ? (
        <>
          {/* This Month stats */}
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, gap: 8 }}>
            <Text style={[s.sectionHeader, { color: C.secondary }]}>This Month</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {([
                { label: 'Raised',    value: formatCurrency(ADMIN_DASHBOARD.thisMonth.total),   color: C.accent },
                { label: 'Donors',    value: ADMIN_DASHBOARD.thisMonth.donors.toString(),       color: '#5A8A6E' },
                { label: 'Alumni %',  value: `${ADMIN_DASHBOARD.thisMonth.alumniRate}%`,       color: C.label },
              ] as const).map(item => (
                <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed, borderRadius: 8, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: item.color }}>{item.value}</Text>
                  <Text style={{ fontSize: 8, color: C.secondary, textAlign: 'center', marginTop: 2 }}>{item.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Navigate */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('dollarsign.circle.fill',   'Make a Gift',     undefined)}
            {navRow('megaphone.fill',           'Campaigns',       `${activeCampaigns.length} active`)}
            {navRow('clock.arrow.circlepath',   'Giving History',  `${FUND_TRANSACTIONS.length} gifts`)}
          </View>

          {/* Pending Scholarships */}
          {pendingScholarships > 0 && (
            <>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>Scholarships</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                {navRow('graduationcap.fill', 'Review Applications', undefined, pendingScholarships)}
              </View>
            </>
          )}

          {/* Actions */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('plus.circle.fill',        'New Campaign')}
            {navRow('arrow.up.circle.fill',    'Export Report')}
            {navRow('doc.text.fill',           'Tax Receipts')}
          </View>

          {/* Settings */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Settings</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('creditcard',        'Payment Methods')}
            {navRow('banknote',          'Fund Management')}
            {navRow('graduationcap',     'Scholarships')}
            {navRow('bell',              'Notifications')}
          </View>
        </>
      ) : (
        <>
          {/* My Giving */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>My Giving</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            <View style={{ padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator, gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <View>
                  <Text style={{ fontSize: 13, color: C.secondary }}>Lifetime Giving</Text>
                  <Text style={{ fontSize: 22, fontWeight: '800', color: C.label }}>{formatCurrency(lifetimeGiving())}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 11, color: C.secondary, marginBottom: 4 }}>Engagement</Text>
                  <View style={{ flexDirection: 'row', gap: 3 }}>
                    {Array.from({ length: 5 }, (_, i) => (
                      <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < engagementScore ? '#5A8A6E' : C.separator }} />
                    ))}
                  </View>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: C.muted }}>2026 YTD: {formatCurrency(total2026)}</Text>
            </View>

            {/* Active recurring */}
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

          {/* Pledge */}
          {MY_PLEDGE && (
            <>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>My Pledge</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, gap: 6 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>
                  {FUND_CAMPAIGNS.find(c => c.id === MY_PLEDGE.campaignId)?.name}
                </Text>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator }}>
                  <View style={{ height: 4, borderRadius: 2, backgroundColor: C.accent, width: `${Math.min(100, Math.round((MY_PLEDGE.fulfilledAmount / MY_PLEDGE.totalPledged) * 100))}%` as any }} />
                </View>
                <Text style={{ fontSize: 11, color: C.secondary }}>
                  {formatCurrency(MY_PLEDGE.fulfilledAmount)} / {formatCurrency(MY_PLEDGE.totalPledged)}
                </Text>
              </View>
            </>
          )}

          {/* Navigate */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('dollarsign.circle.fill', 'Make a Gift')}
            {navRow('megaphone.fill',         'Campaigns',   `${activeCampaigns.length} active`)}
            {navRow('clock.arrow.circlepath', 'My History',  `${myTx.length} gifts`)}
          </View>

          {/* Actions */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('doc.text.fill',           'Tax Receipt')}
            {navRow('creditcard',              'Payment Methods')}
            {navRow('graduationcap.fill',      'Scholarships')}
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
});
