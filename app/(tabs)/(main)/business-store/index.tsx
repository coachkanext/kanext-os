/**
 * Business Store/Revenue — Revenue / Products / Invoices
 * KaNeXT Operations LLC
 */

import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Animated, TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import {
  PRODUCTS, INVOICES, REVENUE_TREND, RECENT_TRANSACTIONS, BIZ_CONTACTS, BIZ_DASHBOARD,
  getContactById,
  formatCurrency, formatDate, invoiceStatusColor, productTypeLabel, daysOverdue,
  type Product, type Invoice, type ProductType, type InvoiceStatus,
} from '@/data/mock-business-ops';

const TOP_BAR_H = 52;
const PILLS_H   = 48;

type StoreTab  = 'Revenue' | 'Products' | 'Invoices';
type StoreRole = 'Admin' | 'Employee';

function pillsForTab(tab: StoreTab): string[] {
  if (tab === 'Products') return ['All', 'Physical', 'Digital', 'Services', 'Subscriptions'];
  if (tab === 'Invoices') return ['All', 'Draft', 'Sent', 'Overdue', 'Paid', 'This Month'];
  return [];
}

function productTypeColor(type: ProductType, C: ComponentColors): string {
  switch (type) {
    case 'physical':     return '#1A1714';
    case 'digital':      return '#5A8A6E';
    case 'service':      return '#1A1714';
    case 'subscription': return '#1A1714';
    default:             return C.muted as string;
  }
}

function invoiceStatusBg(status: InvoiceStatus): string {
  switch (status) {
    case 'paid':    return '#5A8A6E20';
    case 'sent':    return '#1A171420';
    case 'overdue': return '#B85C5C20';
    default:        return 'rgba(45,30,18,0.06)';
  }
}

const PRODUCT_PILL_MAP: Record<string, ProductType | null> = {
  All: null, Physical: 'physical', Digital: 'digital', Services: 'service', Subscriptions: 'subscription',
};

export default function BusinessStoreScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const topBarH = insets.top + TOP_BAR_H;

  const [activeTab,    setActiveTab]    = useState<StoreTab>('Revenue');
  const [role,         setRole]         = useState<StoreRole>('Admin');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsAnim = useRef(new Animated.Value(0)).current;

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const pills = useMemo(() => pillsForTab(activeTab), [activeTab]);

  function togglePills() {
    Haptics.selectionAsync();
    const next = !pillsVisible;
    setPillsVisible(next);
    Animated.timing(pillsAnim, { toValue: next ? 1 : 0, duration: 200, useNativeDriver: false }).start();
  }

  function changeTab(tab: StoreTab) {
    Haptics.selectionAsync();
    setDropdownOpen(false);
    setActiveTab(tab);
    setSelectedPill('All');
    setSelectedProductId(null);
    setSelectedInvoiceId(null);
    const newPills = pillsForTab(tab);
    if (!newPills.length) {
      setPillsVisible(false);
      pillsAnim.setValue(0);
    }
  }

  const contentPaddingTop = topBarH + (pillsVisible ? PILLS_H : 0) + 8;
  const maxRevenue = useMemo(() => Math.max(...REVENUE_TREND.map(r => r.revenue)), []);

  // ── REVENUE ──────────────────────────────────────────────────────────────────

  const categoryBreakdown = useMemo(() => {
    const total = PRODUCTS.reduce((s, p) => s + p.revenue, 0);
    return [
      { label: 'Services',      value: PRODUCTS.filter(p => p.type === 'service').reduce((s, p) => s + p.revenue, 0), color: '#1A1714' },
      { label: 'Subscriptions', value: PRODUCTS.filter(p => p.type === 'subscription').reduce((s, p) => s + p.revenue, 0), color: '#1A1714' },
      { label: 'Hardware',      value: PRODUCTS.filter(p => p.type === 'physical').reduce((s, p) => s + p.revenue, 0), color: '#1A1714' },
    ].map(c => ({ ...c, pct: Math.round((c.value / total) * 100) }));
  }, []);

  const topClients = useMemo(() => BIZ_CONTACTS.filter(c => c.isClient), []);

  function renderRevenue() {
    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 32 }}>

        {/* Key metrics */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingHorizontal: 16, paddingBottom: 4 }}>
          {[
            { label: 'This Month',  value: formatCurrency(BIZ_DASHBOARD.thisMonth.revenue, true),  color: C.green },
            { label: 'This Year',   value: formatCurrency(BIZ_DASHBOARD.thisYear.revenue, true),   color: C.label },
            { label: 'Net Profit',  value: formatCurrency(BIZ_DASHBOARD.thisMonth.profit, true),   color: C.accent },
            { label: 'Outstanding', value: formatCurrency(INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0), true), color: '#1A1714' },
            { label: 'Overdue',     value: formatCurrency(INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0), true), color: C.red },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.metricCard, { gap: 2 }]}>
              <Text style={[s.metricCardNum, { color: m.color }]}>{m.value}</Text>
              <Text style={[s.metricCardLabel, { color: C.secondary as string }]}>{m.label}</Text>
            </GlassView>
          ))}
        </ScrollView>

        {/* Revenue chart */}
        <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginTop: 12 }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue (12 months)</Text>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 80 }}>
            {REVENUE_TREND.map((r, i) => {
              const revH = (r.revenue / maxRevenue) * 80;
              const isLast = i === REVENUE_TREND.length - 1;
              return (
                <View key={r.month} style={{ flex: 1, alignItems: 'center', gap: 2 }}>
                  <View style={{ width: '100%', height: revH, borderRadius: 3, backgroundColor: isLast ? C.accent : C.surfacePressed as string }} />
                  {(i === 0 || i === 5 || i === 11) && (
                    <Text style={[s.chartLabel, { color: C.muted as string }]}>{r.month}</Text>
                  )}
                </View>
              );
            })}
          </View>
        </GlassView>

        {/* Category breakdown */}
        <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginTop: 12 }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Revenue by Category</Text>
          {categoryBreakdown.map((cat, i) => (
            <View key={cat.label} style={[{ paddingVertical: 8 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={[s.row, { marginBottom: 5 }]}>
                <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{cat.label}</Text>
                <Text style={[s.bodyMed, { color: cat.color }]}>{formatCurrency(cat.value, true)}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string, marginLeft: 8, width: 32 }]}>{cat.pct}%</Text>
              </View>
              <View style={[s.progressBarBg, { backgroundColor: C.surfacePressed as string }]}>
                <View style={[s.progressBarFill, { width: `${cat.pct}%` as any, backgroundColor: cat.color }]} />
              </View>
            </View>
          ))}
        </GlassView>

        {/* Top clients */}
        <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginTop: 12 }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Top Clients</Text>
          {topClients.map((c, i) => {
            const clientRevenue = INVOICES.filter(inv => inv.contactId === c.id && inv.status === 'paid').reduce((s, inv) => s + inv.total, 0);
            return (
              <View key={c.id} style={[s.row, { paddingVertical: 10, gap: 12 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
                <View style={[s.avatarMd, { backgroundColor: `hsl(${c.hue},45%,28%)` }]}>
                  <Text style={s.avatarMdText}>{c.initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{c.name}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string }]} numberOfLines={1}>{c.company}</Text>
                </View>
                <Text style={[s.bodyMed, { color: C.accent }]}>{formatCurrency(clientRevenue, true)}</Text>
              </View>
            );
          })}
        </GlassView>

        {/* Recent transactions */}
        <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginTop: 12 }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 10 }]}>Recent Transactions</Text>
          {RECENT_TRANSACTIONS.map((tx, i) => (
            <View key={tx.id} style={[s.row, { paddingVertical: 10, gap: 12 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: `${tx.type === 'income' ? C.green : C.red}20`, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={tx.type === 'income' ? 'arrow.down.left' : 'arrow.up.right'} size={14} color={tx.type === 'income' ? C.green : C.red} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{tx.description}</Text>
                <Text style={[s.bodySmall, { color: C.muted as string }]}>{formatDate(tx.date)} · {tx.category}</Text>
              </View>
              <Text style={[s.bodyMed, { color: tx.type === 'income' ? C.green : C.red }]}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), true)}
              </Text>
            </View>
          ))}
        </GlassView>
      </ScrollView>
    );
  }

  // ── PRODUCTS ─────────────────────────────────────────────────────────────────

  const filteredProducts = useMemo(() => {
    const typeFilter = PRODUCT_PILL_MAP[selectedPill];
    if (!typeFilter) return PRODUCTS;
    return PRODUCTS.filter(p => p.type === typeFilter);
  }, [selectedPill]);

  function renderProductDetail(product: Product) {
    return (
      <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 12 }]}>
        <Pressable onPress={() => setSelectedProductId(null)} style={[s.row, { marginBottom: 12 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary as string} />
          <Text style={[s.bodySmall, { color: C.secondary as string, marginLeft: 4 }]}>Back to Products</Text>
        </Pressable>

        <View style={[s.row, { gap: 12, marginBottom: 14 }]}>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: `${productTypeColor(product.type, C)}20`, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name={product.icon as any} size={22} color={productTypeColor(product.type, C)} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{product.name}</Text>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>{product.description}</Text>
          </View>
          <View style={[s.typeBadge, { backgroundColor: `${productTypeColor(product.type, C)}20`, borderColor: productTypeColor(product.type, C) }]}>
            <Text style={[s.typeBadgeText, { color: productTypeColor(product.type, C) }]}>{productTypeLabel(product.type)}</Text>
          </View>
        </View>

        <View style={[s.row, { gap: 8, marginBottom: 14 }]}>
          {[
            { label: 'Price',    value: formatCurrency(product.price), color: C.accent },
            { label: 'Units',    value: `${product.unitsSold}`, color: C.label },
            { label: 'Revenue',  value: formatCurrency(product.revenue, true), color: C.green },
            ...(product.inventory != null ? [{ label: 'Stock', value: `${product.inventory}`, color: product.inventory < 10 ? C.red : C.label }] : []),
          ].map(m => (
            <View key={m.label} style={[s.dealMetricChip, { flex: 1, backgroundColor: C.surfacePressed as string }]}>
              <Text style={[s.bodyMed, { color: m.color }]}>{m.value}</Text>
              <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 11 }]}>{m.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>Recent Buyers</Text>
        {BIZ_CONTACTS.slice(0, 3).map((c, i) => (
          <View key={c.id} style={[s.row, { paddingVertical: 9, gap: 10 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
            <View style={[s.avatarSm, { backgroundColor: `hsl(${c.hue},45%,28%)` }]}>
              <Text style={s.avatarSmText}>{c.initials}</Text>
            </View>
            <Text style={[s.bodyMed, { color: C.label, flex: 1 }]}>{c.name}</Text>
            <Text style={[s.bodySmall, { color: C.muted as string }]}>{c.company}</Text>
          </View>
        ))}
      </GlassView>
    );
  }

  function renderProducts() {
    if (selectedProductId) {
      const product = PRODUCTS.find(p => p.id === selectedProductId);
      if (product) return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingTop: contentPaddingTop }}>
            {renderProductDetail(product)}
          </View>
        </ScrollView>
      );
    }

    const totalRevenue = PRODUCTS.reduce((s, p) => s + p.revenue, 0);
    const totalUnits   = PRODUCTS.reduce((s, p) => s + p.unitsSold, 0);

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 100 }}>
        {/* Stats bar */}
        <View style={[s.row, { gap: 8, paddingHorizontal: 16, marginBottom: 12 }]}>
          {[
            { label: 'Products',  value: `${PRODUCTS.length}`,               color: C.label },
            { label: 'Revenue',   value: formatCurrency(totalRevenue, true),  color: C.green },
            { label: 'Units Sold',value: `${totalUnits}`,                    color: C.accent },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.dealMetricChip, { flex: 1 }]}>
              <Text style={[s.bodyMed, { color: m.color, fontSize: 16 }]}>{m.value}</Text>
              <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 11 }]}>{m.label}</Text>
            </GlassView>
          ))}
        </View>

        <GlassView tier={1} style={[s.card, { marginHorizontal: 16 }]}>
          {filteredProducts.map((product, i) => (
            <Pressable
              key={product.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedProductId(product.id); }}
              style={({ pressed }) => [
                s.row, { paddingVertical: 12, gap: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                pressed && { backgroundColor: C.surfacePressed as string },
              ]}
            >
              <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: `${productTypeColor(product.type, C)}15`, alignItems: 'center', justifyContent: 'center' }}>
                <IconSymbol name={product.icon as any} size={18} color={productTypeColor(product.type, C)} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={[s.row, { gap: 6 }]}>
                  <Text style={[s.bodyMed, { color: C.label }]} numberOfLines={1}>{product.name}</Text>
                  <View style={[s.typeBadge, { backgroundColor: `${productTypeColor(product.type, C)}15`, borderColor: productTypeColor(product.type, C) }]}>
                    <Text style={[s.typeBadgeText, { color: productTypeColor(product.type, C), fontSize: 9 }]}>{productTypeLabel(product.type)}</Text>
                  </View>
                </View>
                <Text style={[s.bodySmall, { color: C.secondary as string }]}>{product.unitsSold} units · {formatCurrency(product.revenue, true)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={[s.bodyMed, { color: C.accent }]}>{formatCurrency(product.price)}</Text>
                {product.inventory != null && product.inventory < 10 && (
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.red }}>Low stock</Text>
                )}
              </View>
              <IconSymbol name="chevron.right" size={12} color={C.muted as string} />
            </Pressable>
          ))}
        </GlassView>
      </ScrollView>
    );
  }

  // ── INVOICES ─────────────────────────────────────────────────────────────────

  const filteredInvoices = useMemo(() => {
    let list = [...INVOICES];
    // Overdue sorted first
    list.sort((a, b) => {
      if (a.status === 'overdue' && b.status !== 'overdue') return -1;
      if (b.status === 'overdue' && a.status !== 'overdue') return 1;
      return 0;
    });
    if (selectedPill === 'All') return list;
    if (selectedPill === 'This Month') return list.filter(i => i.issueDate.startsWith('2026-03'));
    const map: Record<string, InvoiceStatus> = { Draft: 'draft', Sent: 'sent', Overdue: 'overdue', Paid: 'paid' };
    return list.filter(i => i.status === map[selectedPill]);
  }, [selectedPill]);

  const outstandingAmt = useMemo(
    () => INVOICES.filter(i => i.status === 'sent' || i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    [],
  );
  const overdueAmt = useMemo(
    () => INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0),
    [],
  );
  const paidAmt = useMemo(
    () => INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0),
    [],
  );
  const avgDays = 18;

  function renderInvoiceDetail(invoice: Invoice) {
    const overdueDays = daysOverdue(invoice.dueDate);
    return (
      <GlassView tier={1} style={[s.card, { marginHorizontal: 16, marginBottom: 12 }]}>
        <Pressable onPress={() => setSelectedInvoiceId(null)} style={[s.row, { marginBottom: 12 }]}>
          <IconSymbol name="chevron.left" size={14} color={C.secondary as string} />
          <Text style={[s.bodySmall, { color: C.secondary as string, marginLeft: 4 }]}>Back to Invoices</Text>
        </Pressable>

        <View style={[s.row, { marginBottom: 12 }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.sectionTitle, { color: C.label }]}>{invoice.number}</Text>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>{invoice.company}</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: invoiceStatusBg(invoice.status), borderColor: invoiceStatusColor(invoice.status) }]}>
            <Text style={[s.statusBadgeText, { color: invoiceStatusColor(invoice.status) }]}>{invoice.status}</Text>
          </View>
        </View>

        {invoice.status === 'overdue' && overdueDays > 0 && (
          <View style={{ backgroundColor: `${C.red}15`, borderRadius: 8, padding: 10, marginBottom: 12 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: C.red }}>{overdueDays} days overdue · {invoice.notes}</Text>
          </View>
        )}

        {/* Line items */}
        <Text style={[s.subHeader, { color: C.secondary as string, marginBottom: 8 }]}>Line Items</Text>
        {invoice.lines.map((line, i) => (
          <View key={line.id} style={[
            s.row, { paddingVertical: 9 },
            i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
          ]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.bodyMed, { color: C.label }]}>{line.description}</Text>
              <Text style={[s.bodySmall, { color: C.muted as string }]}>Qty {line.qty} × {formatCurrency(line.unitPrice)}</Text>
            </View>
            <Text style={[s.bodyMed, { color: C.label }]}>{formatCurrency(line.total)}</Text>
          </View>
        ))}
        <View style={[s.row, { paddingTop: 12, marginTop: 4, borderTopWidth: 2, borderTopColor: C.separator as string }]}>
          <Text style={[s.sectionTitle, { color: C.label, flex: 1 }]}>Total</Text>
          <Text style={[s.sectionTitle, { color: C.accent }]}>{formatCurrency(invoice.total)}</Text>
        </View>

        {/* Dates */}
        <View style={{ marginTop: 14, gap: 0 }}>
          {[
            { label: 'Issued', value: formatDate(invoice.issueDate) },
            { label: 'Due',    value: formatDate(invoice.dueDate) },
          ].map((item, i) => (
            <View key={item.label} style={[s.row, { paddingVertical: 9 }, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string }]}>
              <Text style={[s.bodySmall, { color: C.muted as string, width: 80 }]}>{item.label}</Text>
              <Text style={[s.bodyMed, { color: C.label }]}>{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={[s.row, { marginTop: 14, gap: 8 }]}>
          {invoice.status !== 'paid' && (
            <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={[s.actionBtnFill, { flex: 1, backgroundColor: C.accent }]}>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Mark Paid</Text>
            </Pressable>
          )}
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[s.outlineBtn, { flex: 1, borderColor: C.inputBorder as string }]}>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>Send Reminder</Text>
          </Pressable>
          <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
            style={[s.outlineBtn, { flex: 1, borderColor: C.inputBorder as string }]}>
            <Text style={[s.bodySmall, { color: C.secondary as string }]}>Download PDF</Text>
          </Pressable>
        </View>
      </GlassView>
    );
  }

  function renderInvoices() {
    if (selectedInvoiceId) {
      const invoice = INVOICES.find(i => i.id === selectedInvoiceId);
      if (invoice) return (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ paddingTop: contentPaddingTop }}>
            {renderInvoiceDetail(invoice)}
          </View>
        </ScrollView>
      );
    }

    return (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: 100 }}>
        {/* Stats row */}
        <View style={[s.row, { gap: 8, paddingHorizontal: 16, marginBottom: 12, flexWrap: 'wrap' }]}>
          {[
            { label: 'Outstanding', value: formatCurrency(outstandingAmt, true), color: '#1A1714' },
            { label: 'Overdue',     value: formatCurrency(overdueAmt, true),     color: C.red },
            { label: 'Paid YTD',    value: formatCurrency(paidAmt, true),        color: C.green },
            { label: 'Avg Days',    value: `${avgDays}d`,                        color: C.label },
          ].map(m => (
            <GlassView tier={1} key={m.label} style={[s.dealMetricChip, { flex: 1, minWidth: '22%' }]}>
              <Text style={[s.bodyMed, { color: m.color }]}>{m.value}</Text>
              <Text style={[s.bodySmall, { color: C.secondary as string, fontSize: 10 }]}>{m.label}</Text>
            </GlassView>
          ))}
        </View>

        {/* Invoice list */}
        <GlassView tier={1} style={[s.card, { marginHorizontal: 16 }]}>
          {filteredInvoices.map((invoice, i) => {
            const overdueDays = invoice.status === 'overdue' ? daysOverdue(invoice.dueDate) : 0;
            return (
              <Pressable
                key={invoice.id}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedInvoiceId(invoice.id); }}
                style={({ pressed }) => [
                  s.row, { paddingVertical: 12, gap: 12 },
                  i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator as string },
                  pressed && { backgroundColor: C.surfacePressed as string },
                  invoice.status === 'overdue' && { backgroundColor: `${C.red}08` },
                ]}
              >
                <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: invoiceStatusBg(invoice.status), alignItems: 'center', justifyContent: 'center' }}>
                  <IconSymbol name="doc.text.fill" size={16} color={invoiceStatusColor(invoice.status)} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.bodyMed, { color: C.label }]}>{invoice.number}</Text>
                  <Text style={[s.bodySmall, { color: C.secondary as string }]} numberOfLines={1}>{invoice.company}</Text>
                  {overdueDays > 0 && (
                    <Text style={{ fontSize: 11, fontWeight: '600', color: C.red }}>{overdueDays}d overdue</Text>
                  )}
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Text style={[s.bodyMed, { color: invoice.status === 'overdue' ? C.red : C.label }]}>{formatCurrency(invoice.total, true)}</Text>
                  <View style={[s.statusBadge, { backgroundColor: invoiceStatusBg(invoice.status), borderColor: invoiceStatusColor(invoice.status) }]}>
                    <Text style={[s.statusBadgeText, { color: invoiceStatusColor(invoice.status) }]}>{invoice.status}</Text>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={12} color={C.muted as string} />
              </Pressable>
            );
          })}
        </GlassView>
      </ScrollView>
    );
  }

  // ── RENDER ───────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator as string, paddingTop: insets.top }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={s.iconBtn} hitSlop={8}>
            <IconSymbol name="line.3.horizontal" size={20} color={C.label} />
          </Pressable>

          <Pressable
            onPress={() => { Haptics.selectionAsync(); setDropdownOpen(v => !v); }}
            style={[s.dropdownPill, { backgroundColor: C.surface, borderColor: C.separator as string }]}
          >
            <Text style={[s.dropdownPillText, { color: C.label }]}>{activeTab}</Text>
            <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={12} color={C.secondary as string} style={{ marginLeft: 4 }} />
          </Pressable>

          <View style={[s.row, { gap: 8 }]}>
            {pills.length > 0 && (
              <Pressable onPress={togglePills} hitSlop={8} style={s.iconBtn}>
                <IconSymbol
                  name={pillsVisible ? 'line.3.horizontal.decrease.circle.fill' : 'line.3.horizontal.decrease.circle'}
                  size={20} color={pillsVisible ? C.accent : C.label}
                />
              </Pressable>
            )}
            <Pressable onPress={() => { Haptics.selectionAsync(); setRole(r => r === 'Admin' ? 'Employee' : 'Admin'); }}
              style={[s.rolePill, { backgroundColor: C.surface, borderColor: C.separator as string }]}>
              <Text style={[s.rolePillText, { color: C.accent }]}>{role}</Text>
            </Pressable>
          </View>
        </View>

        {pills.length > 0 && (
          <Animated.View style={[s.pillsRow, {
            height: pillsAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILLS_H] }),
            opacity: pillsAnim, overflow: 'hidden', borderBottomColor: C.separator as string,
          }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', gap: 8, paddingHorizontal: 16 }}>
              {pills.map(pill => {
                const active = selectedPill === pill;
                return (
                  <Pressable key={pill} onPress={() => { Haptics.selectionAsync(); setSelectedPill(pill); }}
                    style={[s.pill, { borderColor: active ? C.accent : C.inputBorder as string, backgroundColor: active ? C.accent : 'transparent' }]}>
                    <Text style={[s.pillText, { color: active ? '#fff' : C.secondary as string }]}>{pill}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </Animated.View>
        )}
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <>
          <Pressable style={[StyleSheet.absoluteFill, { zIndex: 150 }]} onPress={() => setDropdownOpen(false)} />
          <View style={[s.dropdown, { top: topBarH, backgroundColor: C.surface, borderColor: C.separator as string }]}>
            {(['Revenue', 'Products', 'Invoices'] as StoreTab[]).map(tab => (
              <Pressable key={tab} onPress={() => changeTab(tab)}
                style={({ pressed }) => [s.dropdownItem, pressed && { backgroundColor: C.surfacePressed as string }, activeTab === tab && { backgroundColor: C.surfacePressed as string }]}>
                <Text style={[s.dropdownItemText, { color: activeTab === tab ? C.accent : C.label }]}>{tab}</Text>
                {activeTab === tab && <IconSymbol name="checkmark" size={14} color={C.accent} />}
              </Pressable>
            ))}
          </View>
        </>
      )}

      {/* Content */}
      {activeTab === 'Revenue'  && renderRevenue()}
      {activeTab === 'Products' && renderProducts()}
      {activeTab === 'Invoices' && renderInvoices()}

      {/* FABs */}
      {activeTab === 'Products' && role === 'Admin' && !selectedProductId && (
        <Pressable onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
          style={[s.fab, { backgroundColor: C.accent, bottom: insets.bottom + 88 }]}>
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}
      {activeTab === 'Invoices' && role === 'Admin' && !selectedInvoiceId && (
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setShowCreateInvoice(true); }}
          style={[s.fab, { backgroundColor: C.accent, bottom: insets.bottom + 88 }]}>
          <IconSymbol name="doc.text.fill" size={18} color="#fff" />
        </Pressable>
      )}
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  iconBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: { flex: 1, marginHorizontal: 10, height: 34, borderRadius: 17, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  dropdownPillText: { fontSize: 14, fontWeight: '700' },
  rolePill: { paddingHorizontal: 12, height: 28, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  rolePillText: { fontSize: 12, fontWeight: '700' },
  pillsRow: { borderBottomWidth: StyleSheet.hairlineWidth },
  pill: { height: 30, paddingHorizontal: 14, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillText: { fontSize: 13, fontWeight: '600' },
  dropdown: { position: 'absolute', left: 16, right: 16, zIndex: 200, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  dropdownItemText: { flex: 1, fontSize: 15, fontWeight: '600' },
  row: { flexDirection: 'row', alignItems: 'center' },
  card: { padding: 16, borderRadius: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  subHeader: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  bodyMed: { fontSize: 14, fontWeight: '600' },
  bodySmall: { fontSize: 13 },
  chartLabel: { fontSize: 9, fontWeight: '500' },
  metricCard: { width: 110, padding: 12, borderRadius: 14, alignItems: 'center' },
  metricCardNum: { fontSize: 16, fontWeight: '800' },
  metricCardLabel: { fontSize: 11, fontWeight: '500' },
  dealMetricChip: { alignItems: 'center', padding: 10, borderRadius: 12 },
  typeBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  typeBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  statusBadge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7, borderWidth: 1 },
  statusBadgeText: { fontSize: 10, fontWeight: '600', textTransform: 'capitalize' },
  progressBarBg: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: 6, borderRadius: 3 },
  avatarMd: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  avatarMdText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  avatarSm: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  avatarSmText: { fontSize: 9, fontWeight: '700', color: '#fff' },
  actionBtn: { padding: 10, borderRadius: 10, alignItems: 'center' },
  actionBtnFill: { height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  outlineBtn: { height: 40, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fab: { position: 'absolute', right: 20, width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 6, elevation: 4 },
});
