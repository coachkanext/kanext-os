/**
 * Business Store Side Panel — Revenue / Products / Invoices nav.
 */

import React, { useState, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors } from '@/hooks/use-colors';
import { closeSidePanel } from '@/utils/global-side-panel';
import {
  PRODUCTS, INVOICES, BIZ_DASHBOARD,
  formatCurrency, daysOverdue, invoiceStatusColor,
} from '@/data/mock-business-ops';

export function BusinessStorePanel() {
  const C = useColors();
  const [role, setRole] = useState<'Admin' | 'Employee'>('Admin');
  const isAdmin = role === 'Admin';

  const outstanding = useMemo(
    () => INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    [],
  );
  const overdueInvoices = useMemo(() => INVOICES.filter(i => i.status === 'overdue'), []);
  const overdueAmt      = overdueInvoices.reduce((s, i) => s + i.total, 0);

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
        {(['Admin', 'Employee'] as const).map(r => (
          <Pressable key={r} onPress={() => { Haptics.selectionAsync(); setRole(r); }}
            style={[s.roleBtn, r === role && { backgroundColor: C.accent }]}>
            <Text style={[s.roleBtnText, { color: r === role ? '#fff' : C.secondary }]}>{r}</Text>
          </Pressable>
        ))}
      </View>

      {isAdmin ? (
        <>
          {/* Revenue banner */}
          <View style={{ backgroundColor: '#1A1714', borderRadius: 12, padding: 14, gap: 4 }}>
            <Text style={{ fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.55)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Revenue This Month</Text>
            <Text style={{ fontSize: 28, fontWeight: '900', color: '#fff', lineHeight: 32 }}>{formatCurrency(BIZ_DASHBOARD.thisMonth.revenue, true)}</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Profit: {formatCurrency(BIZ_DASHBOARD.thisMonth.profit, true)} · Expenses: {formatCurrency(BIZ_DASHBOARD.thisMonth.expenses, true)}</Text>
          </View>

          {/* Invoice stats */}
          <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[
                { label: 'Outstanding', value: formatCurrency(outstanding, true),  color: '#1A1714' },
                { label: 'Overdue',     value: formatCurrency(overdueAmt, true),   color: C.red },
                { label: 'Products',    value: PRODUCTS.length.toString(),         color: C.accent },
              ].map(m => (
                <View key={m.label} style={{ flex: 1, alignItems: 'center', backgroundColor: C.surfacePressed as string, borderRadius: 8, paddingVertical: 8 }}>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: m.color }}>{m.value}</Text>
                  <Text style={{ fontSize: 9, color: C.secondary, marginTop: 2 }}>{m.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Overdue invoices */}
          {overdueInvoices.length > 0 && (
            <>
              <Text style={[s.sectionHeader, { color: C.secondary }]}>Overdue</Text>
              <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
                {overdueInvoices.map((inv, i) => {
                  const days = daysOverdue(inv.dueDate);
                  return (
                    <Pressable key={inv.id} style={({ pressed }) => [
                      s.navRow,
                      i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                      pressed && { backgroundColor: C.surfacePressed },
                    ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                      <IconSymbol name="exclamationmark.circle.fill" size={14} color={C.red} />
                      <View style={{ flex: 1 }}>
                        <Text style={[s.navLabel, { color: C.label, flex: 0 }]} numberOfLines={1}>{inv.company}</Text>
                        <Text style={{ fontSize: 10, color: C.red }}>{days}d overdue</Text>
                      </View>
                      <Text style={[s.navDetail, { color: C.red, fontWeight: '700' }]}>{formatCurrency(inv.total, true)}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          )}

          {/* Navigate */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('chart.line.uptrend.xyaxis', 'Revenue')}
            {navRow('storefront.fill',           'Products', `${PRODUCTS.length} items`)}
            {navRow('doc.text.fill',             'Invoices', `${INVOICES.length} total`)}
          </View>

          {/* Quick actions */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Actions</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('plus.circle.fill', 'Create Invoice')}
            {navRow('doc.text.fill',    'Export Report')}
          </View>
        </>
      ) : (
        <>
          {/* Product catalog shortcut */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Products</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {PRODUCTS.slice(0, 4).map((p, i) => (
              <Pressable key={p.id} style={({ pressed }) => [
                s.navRow,
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
                pressed && { backgroundColor: C.surfacePressed },
              ]} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); closeSidePanel(); }}>
                <Text style={[s.navLabel, { color: C.label }]} numberOfLines={1}>{p.name}</Text>
                <Text style={[s.navDetail, { color: C.accent }]}>{formatCurrency(p.price)}</Text>
              </Pressable>
            ))}
          </View>

          {/* Navigate */}
          <Text style={[s.sectionHeader, { color: C.secondary }]}>Navigate</Text>
          <View style={{ backgroundColor: C.surface, borderRadius: 12, overflow: 'hidden' }}>
            {navRow('storefront.fill', 'Products')}
            {navRow('doc.text.fill',  'My Invoices')}
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
