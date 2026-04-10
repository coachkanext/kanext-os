/**
 * Sports Booster Side Panel — support campaigns, NIL, merch, tickets quick nav.
 */

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  BOOSTER_CAMPAIGNS, NIL_DEALS, NIL_OPPORTUNITIES, MERCH_PRODUCTS,
  TICKET_GAMES, FAN_REWARDS, formatCurrency,
} from '@/data/mock-sports-hub';

export function SportsBoosterPanel() {
  const router = useRouter();
  const C = useColors();

  const activeCampaigns = BOOSTER_CAMPAIGNS.filter(c => c.status === 'active');
  const totalRaised     = activeCampaigns.reduce((sum, c) => sum + c.raised, 0);
  const totalGoal       = activeCampaigns.reduce((sum, c) => sum + c.goal, 0);
  const activeNIL       = NIL_DEALS.filter(d => d.status === 'in-progress').length;
  const nilValue        = NIL_DEALS.filter(d => d.status !== 'paid').reduce((sum, d) => sum + d.amount, 0);
  const limitedMerch    = MERCH_PRODUCTS.filter(p => p.isLimited && p.inStock).length;
  const topFan          = FAN_REWARDS[0];

  const navRow = (icon: string, label: string, detail?: string) => (
    <Pressable
      key={label}
      style={({ pressed }) => [s.navRow, pressed && { backgroundColor: C.surfacePressed }]}
      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
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

      {/* Fundraising summary */}
      <View style={{ backgroundColor: '#1A1714', borderRadius: 12, padding: 14, gap: 4 }}>
        <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Campaigns</Text>
        <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 32 }}>{formatCurrency(totalRaised)}</Text>
        <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 2, marginTop: 4 }}>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: '#5A8A6E', width: `${Math.min(100, (totalRaised / totalGoal) * 100)}%` as any }} />
        </View>
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
          {formatCurrency(totalGoal)} goal · {activeCampaigns.length} active
        </Text>
      </View>

      {/* Active campaigns */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Active Campaigns</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {activeCampaigns.map((c, i) => (
          <Pressable
            key={c.id}
            style={({ pressed }) => [
              s.navRow,
              i < activeCampaigns.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              pressed && { backgroundColor: C.surfacePressed },
            ]}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
          >
            <IconSymbol name="heart.fill" size={16} color="#B85C5C" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>{c.name}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <View style={{ flex: 1, height: 3, backgroundColor: C.surfacePressed, borderRadius: 2 }}>
                  <View style={{ height: 3, borderRadius: 2, backgroundColor: C.accent, width: `${Math.min(100, (c.raised / c.goal) * 100)}%` as any }} />
                </View>
                <Text style={{ fontSize: 10, color: C.secondary }}>{formatCurrency(c.raised)}</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={12} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* NIL summary */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>NIL</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[
            { label: 'Active Deals', value: activeNIL.toString(),              color: '#5A8A6E' },
            { label: 'Total Value',  value: formatCurrency(nilValue),          color: C.accent },
            { label: 'Open Opps',    value: NIL_OPPORTUNITIES.length.toString(), color: '#1A1714' },
          ].map(item => (
            <View key={item.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed, borderRadius: 8, paddingVertical: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: item.color }}>{item.value}</Text>
              <Text style={{ fontSize: 9, color: C.secondary, marginTop: 2 }}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tickets */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Upcoming Tickets</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {TICKET_GAMES.map((g, i) => {
          const ga = g.types.find(t => t.label === 'General Admission') ?? g.types[0];
          return (
            <Pressable
              key={g.gameId}
              style={({ pressed }) => [
                s.navRow,
                i < TICKET_GAMES.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}
            >
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#1A171440', alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name="ticket.fill" size={12} color="#1A1714" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }} numberOfLines={1}>vs {g.opponent}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{g.date} · {ga.available} left</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '700', color: C.accent }}>${ga.price}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Fan leaderboard preview */}
      {topFan && (
        <>
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Fan Leaderboard</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: `hsl(${topFan.hue},45%,28%)`, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>#{topFan.rank}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>{topFan.name}</Text>
                <Text style={{ fontSize: 11, color: C.secondary }}>{topFan.points.toLocaleString()} pts · {limitedMerch} limited items in shop</Text>
              </View>
            </View>
          </View>
        </>
      )}

      {/* Quick actions */}
      <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
        {navRow('plus.circle.fill',   'New Campaign')}
        {navRow('ticket.fill',        'Sell Tickets')}
        {navRow('square.and.arrow.up', 'Share Campaign')}
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
