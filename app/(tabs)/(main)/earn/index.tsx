/**
 * Personal Earn — creator revenue command center.
 * Earnings (dashboard) / Products (storefront) / Payouts (money out).
 */

import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet,
  Animated, TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import {
  EARN_STATS, CHART_BY_PERIOD, SOURCE_BREAKDOWN, TRANSACTIONS,
  PRODUCTS, PRODUCT_SALES, PAYOUTS, FEE_TABLE, SOURCE_COLORS, KAYPAY_CURRENT_BALANCE,
  type Product, type RevenueSource, type ChartPeriod,
  formatMoney, formatMoneyFull, formatDate, formatRelative, getChartMax, getCapitalPoints,
} from '@/data/mock-earn';

// ── Constants ─────────────────────────────────────────────────────────────────

type Tab = 'Earnings' | 'Products' | 'Payouts';
const TABS: Tab[] = ['Earnings', 'Products', 'Payouts'];
const TOP_BAR_H   = 52;
const PILL_ROW_H  = 48;

const TAB_PILLS: Record<Tab, string[]> = {
  Earnings: ['All', 'Subscriptions', 'Tips', 'Sales', 'Deals', 'Content'],
  Products: ['All', 'Digital', 'Courses', 'Exclusive', 'Merch', 'Tips'],
  Payouts:  ['All', 'Completed', 'Pending', 'This Month', 'This Year'],
};

const PAYOUT_SCHEDULES = ['Instant', 'Daily', 'Weekly', 'Monthly'] as const;

// ── Revenue Bar Chart ─────────────────────────────────────────────────────────

function RevenueChart({
  period, onPeriodChange, C,
}: {
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
  C: ReturnType<typeof useColors>;
}) {
  const data   = CHART_BY_PERIOD[period];
  const maxVal = getChartMax(data);
  const CHART_H = 100;

  return (
    <View>
      {/* Period pills */}
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 14 }}>
        {(['Daily', 'Weekly', 'Monthly'] as ChartPeriod[]).map(p => (
          <Pressable
            key={p}
            onPress={() => { onPeriodChange(p); Haptics.selectionAsync(); }}
            style={{
              paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14,
              backgroundColor: period === p ? C.label : C.surface,
              borderWidth: 1, borderColor: period === p ? C.label : C.inputBorder,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: period === p ? C.bg : C.secondary }}>{p}</Text>
          </Pressable>
        ))}
      </View>

      {/* Bars */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: CHART_H + 22, gap: 4 }}>
        {data.map((pt, i) => {
          const barH = Math.max(4, (pt.value / maxVal) * CHART_H);
          const isLast = i === data.length - 1;
          return (
            <View key={pt.label} style={{ flex: 1, alignItems: 'center' }}>
              {/* Value above bar for last (current) */}
              {isLast && (
                <Text style={{ fontSize: 9, fontWeight: '700', color: C.accent, marginBottom: 2 }}>
                  {formatMoney(pt.value)}
                </Text>
              )}
              <View
                style={{
                  width: '100%',
                  height: barH,
                  borderRadius: 5,
                  backgroundColor: isLast ? C.accent : C.accent + '50',
                  marginBottom: 4,
                }}
              />
              <Text style={{ fontSize: 9, color: C.muted }}>{pt.label}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── Drilldown Sheet (transactions by source) ─────────────────────────────────

function DrilldownSheet({
  source, visible, onClose, C,
}: {
  source: RevenueSource | null;
  visible: boolean;
  onClose: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const txns = useMemo(() =>
    source ? TRANSACTIONS.filter(t => t.source === source) : [],
    [source]
  );
  const total = txns.reduce((s, t) => s + t.amount, 0);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={source ?? ''}>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: C.secondary }}>TOTAL THIS MONTH</Text>
        <Text style={{ fontSize: 28, fontWeight: '800', color: C.label, marginTop: 4 }}>{formatMoneyFull(total)}</Text>
      </View>
      {txns.map((tx, idx) => (
        <View key={tx.id} style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingVertical: 10,
          borderBottomWidth: idx < txns.length - 1 ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: C.separator,
        }}>
          <Text style={{ fontSize: 13, color: C.label, flex: 1 }} numberOfLines={1}>{tx.description}</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#5A8A6E' }}>+{formatMoneyFull(tx.amount)}</Text>
            <Text style={{ fontSize: 10, color: C.muted }}>{formatRelative(tx.date)}</Text>
          </View>
        </View>
      ))}
      {txns.length === 0 && (
        <Text style={{ textAlign: 'center', color: C.muted, paddingVertical: 20 }}>No transactions</Text>
      )}
    </BottomSheet>
  );
}

// ── Product Detail Sheet ───────────────────────────────────────────────────────

function ProductDetailSheet({
  product, visible, onClose, C,
}: {
  product: Product | null;
  visible: boolean;
  onClose: () => void;
  C: ReturnType<typeof useColors>;
}) {
  if (!product) return <BottomSheet visible={false} onClose={onClose} useModal title="Product"><View /></BottomSheet>;
  const sales = PRODUCT_SALES[product.id] ?? [];
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={product.title}>
      {/* Thumb + stats */}
      <View style={{ alignItems: 'center', marginBottom: 16 }}>
        <View style={{
          width: 80, height: 80, borderRadius: 20,
          backgroundColor: `hsl(${product.thumbHue},35%,85%)`,
          alignItems: 'center', justifyContent: 'center', marginBottom: 8,
        }}>
          <Text style={{ fontSize: 36 }}>{product.thumbEmoji}</Text>
        </View>
        <Text style={{ fontSize: 13, color: C.secondary }}>{product.type} · {product.recurring ? 'Recurring' : 'One-time'}</Text>
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
        {[
          { label: 'Price',    value: formatMoneyFull(product.price) },
          { label: 'Sales',    value: `${product.salesCount}`        },
          { label: 'Revenue',  value: formatMoney(product.revenue)   },
        ].map(s => (
          <View key={s.label} style={{ flex: 1, backgroundColor: C.surface, borderRadius: 10, padding: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{s.value}</Text>
            <Text style={{ fontSize: 10, color: C.secondary, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <Text style={{ fontSize: 13, color: C.label, lineHeight: 20 }}>{product.description}</Text>
      </View>
      {sales.length > 0 && (
        <>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>RECENT BUYERS</Text>
          {sales.map(s => (
            <View key={s.buyerName} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <View style={{
                width: 32, height: 32, borderRadius: 16,
                backgroundColor: `hsl(${s.hue},35%,75%)`,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#fff' }}>{s.buyerInitials}</Text>
              </View>
              <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{s.buyerName}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#5A8A6E' }}>+{formatMoneyFull(s.amount)}</Text>
            </View>
          ))}
        </>
      )}
    </BottomSheet>
  );
}

// ── Create Product Sheet ───────────────────────────────────────────────────────

function CreateProductSheet({ visible, onClose, C }: {
  visible: boolean; onClose: () => void; C: ReturnType<typeof useColors>;
}) {
  const [title, setTitle]   = useState('');
  const [price, setPrice]   = useState('');
  const [type, setType]     = useState('Digital');
  const [desc, setDesc]     = useState('');
  const inputStyle = {
    backgroundColor: C.surface, borderRadius: 10, padding: 12,
    fontSize: 14, color: C.label, borderWidth: 1, borderColor: C.inputBorder,
    marginBottom: 12,
  };
  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="New Product">
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>TITLE</Text>
      <TextInput style={inputStyle} placeholder="e.g. Photography Preset Pack" placeholderTextColor={C.muted} value={title} onChangeText={setTitle} />

      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>PRICE ($)</Text>
      <TextInput style={inputStyle} placeholder="0.00" placeholderTextColor={C.muted} keyboardType="decimal-pad" value={price} onChangeText={setPrice} />

      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>TYPE</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {['Digital', 'Course', 'Exclusive', 'Merch', 'Tips'].map(t => (
          <Pressable
            key={t}
            onPress={() => setType(t)}
            style={{
              paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16,
              backgroundColor: type === t ? C.accent : C.surface,
              borderWidth: 1, borderColor: type === t ? C.accent : C.inputBorder,
            }}
          >
            <Text style={{ fontSize: 12, fontWeight: '600', color: type === t ? '#fff' : C.secondary }}>{t}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 6 }}>DESCRIPTION</Text>
      <TextInput
        style={{ ...inputStyle, minHeight: 80, textAlignVertical: 'top' }}
        placeholder="What does this include?"
        placeholderTextColor={C.muted}
        multiline
        value={desc}
        onChangeText={setDesc}
      />

      <Pressable
        onPress={onClose}
        style={({ pressed }) => ({
          backgroundColor: C.accent, borderRadius: 12, paddingVertical: 14,
          alignItems: 'center', opacity: pressed ? 0.85 : 1,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Create Product</Text>
      </Pressable>
    </BottomSheet>
  );
}

// ── KayPay Transfer Sheet ──────────────────────────────────────────────────────

function KayPayTransferSheet({ visible, onClose, onCashOut, C }: {
  visible: boolean;
  onClose: () => void;
  onCashOut: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const [stage, setStage] = useState<'confirm' | 'success'>('confirm');
  const points = getCapitalPoints(EARN_STATS.balance);

  // Reset to confirm when sheet opens
  React.useEffect(() => { if (visible) setStage('confirm'); }, [visible]);

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title={stage === 'success' ? ' ' : 'Add to KayPay'} snapPoints={['50%', '75%']}>
      {stage === 'confirm' ? (
        <>
          {/* Balance */}
          <View style={{ alignItems: 'center', paddingVertical: 8, marginBottom: 16 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, letterSpacing: 0.4 }}>AVAILABLE BALANCE</Text>
            <Text style={{ fontSize: 44, fontWeight: '800', color: C.label, marginTop: 6, letterSpacing: -1 }}>{formatMoneyFull(EARN_STATS.balance)}</Text>
          </View>

          {/* Capital Points incentive */}
          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 10,
            backgroundColor: C.accent + '12', borderRadius: 14, padding: 14, marginBottom: 20,
            borderWidth: 1, borderColor: C.accent + '25',
          }}>
            <Text style={{ fontSize: 22 }}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>
                Earn {points.toLocaleString()} Capital Points
              </Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Points unlock rewards inside KaNeXT
              </Text>
            </View>
          </View>

          {/* Primary action */}
          <Pressable
            onPress={() => setStage('success')}
            style={({ pressed }) => ({
              backgroundColor: C.accent, borderRadius: 14, paddingVertical: 16,
              alignItems: 'center', opacity: pressed ? 0.85 : 1, marginBottom: 10,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>
              Add {formatMoneyFull(EARN_STATS.balance)} to KayPay
            </Text>
            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.8, marginTop: 2 }}>Instant · No fees</Text>
          </Pressable>

          {/* Secondary escape hatch */}
          <Pressable
            onPress={() => { onClose(); setTimeout(onCashOut, 350); }}
            style={{ alignItems: 'center', paddingVertical: 10 }}
          >
            <Text style={{ fontSize: 13, color: C.muted }}>Cash out to bank instead →</Text>
          </Pressable>
        </>
      ) : (
        /* Success state */
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <IconSymbol name="checkmark.circle.fill" size={64} color="#5A8A6E" />
          <Text style={{ fontSize: 22, fontWeight: '800', color: C.label, marginTop: 16 }}>
            {formatMoneyFull(EARN_STATS.balance)} added!
          </Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginTop: 4 }}>Your KayPay balance has been updated</Text>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: C.accent + '12', borderRadius: 12, padding: 12, marginTop: 20,
          }}>
            <Text style={{ fontSize: 20 }}>🎯</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>
              {points.toLocaleString()} Capital Points earned
            </Text>
          </View>

          <Text style={{ fontSize: 12, color: C.muted, marginTop: 12, textAlign: 'center' }}>
            New KayPay balance: {formatMoneyFull(KAYPAY_CURRENT_BALANCE + EARN_STATS.balance)}
          </Text>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({
              marginTop: 24, backgroundColor: C.accent, borderRadius: 14,
              paddingVertical: 14, paddingHorizontal: 48, opacity: pressed ? 0.85 : 1,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Done</Text>
          </Pressable>
        </View>
      )}
    </BottomSheet>
  );
}

// ── Cash Out Sheet ─────────────────────────────────────────────────────────────

function CashOutSheet({ visible, onClose, C }: {
  visible: boolean; onClose: () => void; C: ReturnType<typeof useColors>;
}) {
  const [schedule, setSchedule] = useState<'Instant' | 'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  return (
    <BottomSheet visible={visible} onClose={onClose} useModal title="Cash Out to Bank" snapPoints={['55%', '80%']}>
      {/* Balance */}
      <View style={{ backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 16, alignItems: 'center' }}>
        <Text style={{ fontSize: 11, color: C.secondary }}>AMOUNT</Text>
        <Text style={{ fontSize: 36, fontWeight: '800', color: C.label, marginTop: 4 }}>{formatMoneyFull(EARN_STATS.balance)}</Text>
      </View>

      {/* No-points notice — informational, not guilt */}
      <Text style={{ fontSize: 12, color: C.muted, textAlign: 'center', marginBottom: 16 }}>
        Bank transfers don't earn Capital Points
      </Text>

      {/* Bank account */}
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>DESTINATION</Text>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        backgroundColor: C.surface, borderRadius: 12, padding: 14, marginBottom: 16,
      }}>
        <IconSymbol name="building.columns.fill" size={22} color={C.secondary} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Chase Bank ···4821</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>Checking · Primary</Text>
        </View>
        <Pressable style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.surfacePressed, borderRadius: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Change</Text>
        </Pressable>
      </View>

      {/* Schedule */}
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8 }}>TRANSFER SCHEDULE</Text>
      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
        {(['Instant', 'Daily', 'Weekly', 'Monthly'] as const).map(s => (
          <Pressable
            key={s}
            onPress={() => setSchedule(s)}
            style={{
              flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10,
              backgroundColor: schedule === s ? C.label : C.surface,
              borderWidth: 1, borderColor: schedule === s ? C.label : C.inputBorder,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: '600', color: schedule === s ? C.bg : C.secondary }}>{s}</Text>
          </Pressable>
        ))}
      </View>
      {schedule === 'Instant' && (
        <Text style={{ fontSize: 11, color: C.muted, marginBottom: 12 }}>Instant transfers: 1.5% fee applies</Text>
      )}

      <Pressable
        onPress={onClose}
        style={({ pressed }) => ({
          marginTop: 8, borderRadius: 14, paddingVertical: 15,
          alignItems: 'center', opacity: pressed ? 0.85 : 1,
          borderWidth: 1.5, borderColor: C.label, backgroundColor: C.label,
        })}
      >
        <Text style={{ fontSize: 15, fontWeight: '700', color: C.bg }}>Cash Out {formatMoneyFull(EARN_STATS.balance)}</Text>
      </Pressable>
    </BottomSheet>
  );
}

// ── Earnings Tab ───────────────────────────────────────────────────────────────

function EarningsTab({
  pill, onAddToKayPay, onCashOut, onSourcePress, C,
}: {
  pill: string;
  onAddToKayPay: () => void;
  onCashOut: () => void;
  onSourcePress: (src: RevenueSource) => void;
  C: ReturnType<typeof useColors>;
}) {
  const [chartPeriod, setChartPeriod] = useState<ChartPeriod>('Monthly');

  const txns = useMemo(() => {
    if (pill === 'All') return TRANSACTIONS;
    return TRANSACTIONS.filter(t => t.source === pill);
  }, [pill]);

  const statCards = [
    { label: 'This Month', value: formatMoneyFull(EARN_STATS.thisMonth),        sub: `+${EARN_STATS.growthPct}% vs last month` },
    { label: 'Subscribers', value: `${EARN_STATS.subscriberCount}`,             sub: 'Active members' },
    { label: 'Growth',      value: `+${EARN_STATS.growthPct}%`,                 sub: 'vs last month' },
    { label: 'Lifetime',    value: formatMoney(EARN_STATS.lifetimeEarnings),     sub: 'Total earned' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Balance hero */}
      <View style={{ alignItems: 'center', paddingVertical: 24, marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: C.secondary, fontWeight: '600', letterSpacing: 0.4 }}>AVAILABLE BALANCE</Text>
        <Text style={{ fontSize: 48, fontWeight: '800', color: C.label, marginTop: 4, letterSpacing: -1 }}>
          {formatMoneyFull(EARN_STATS.balance)}
        </Text>
        {EARN_STATS.pendingBalance > 0 && (
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
            + {formatMoneyFull(EARN_STATS.pendingBalance)} pending
          </Text>
        )}
        <View style={{ width: '100%', gap: 8, marginTop: 14, paddingHorizontal: 8 }}>
          <Pressable
            onPress={onAddToKayPay}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              backgroundColor: C.accent, paddingVertical: 12, borderRadius: 14, opacity: pressed ? 0.85 : 1,
            })}
          >
            <IconSymbol name="creditcard.fill" size={15} color="#fff" />
            <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Add to KayPay Balance</Text>
          </Pressable>
          <Pressable
            onPress={onCashOut}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              paddingVertical: 11, borderRadius: 14, opacity: pressed ? 0.85 : 1,
              borderWidth: 1.5, borderColor: C.inputBorder,
            })}
          >
            <IconSymbol name="building.columns" size={15} color={C.secondary} />
            <Text style={{ fontSize: 14, fontWeight: '500', color: C.secondary }}>Cash Out to Bank</Text>
          </Pressable>
        </View>
      </View>

      {/* Stats cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 2 }}>
          {statCards.map(sc => (
            <View key={sc.label} style={{
              width: 130, backgroundColor: C.surface, borderRadius: 14, padding: 14,
            }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.label }}>{sc.value}</Text>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, marginTop: 4 }}>{sc.label}</Text>
              <Text style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{sc.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Chart */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 16, marginBottom: 20 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 12 }}>Revenue Over Time</Text>
        <RevenueChart period={chartPeriod} onPeriodChange={setChartPeriod} C={C} />
      </View>

      {/* Revenue breakdown by source */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 10 }}>This Month by Source</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {SOURCE_BREAKDOWN.map((src, idx) => (
          <Pressable
            key={src.source}
            onPress={() => onSourcePress(src.source)}
            style={({ pressed }) => ({
              flexDirection: 'row', alignItems: 'center', gap: 12,
              paddingHorizontal: 14, paddingVertical: 12,
              backgroundColor: pressed ? C.surfacePressed : 'transparent',
              borderBottomWidth: idx < SOURCE_BREAKDOWN.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            })}
          >
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: SOURCE_COLORS[src.source], flexShrink: 0 }} />
            <Text style={{ flex: 1, fontSize: 14, color: C.label }}>{src.source}</Text>
            {/* Mini bar */}
            <View style={{ width: 60, height: 4, backgroundColor: C.bg, borderRadius: 2, overflow: 'hidden' }}>
              <View style={{ width: `${src.pct}%`, height: '100%', borderRadius: 2, backgroundColor: SOURCE_COLORS[src.source] }} />
            </View>
            <Text style={{ width: 50, fontSize: 13, fontWeight: '700', color: C.label, textAlign: 'right' }}>{formatMoney(src.amount)}</Text>
            <Text style={{ width: 30, fontSize: 11, color: C.muted, textAlign: 'right' }}>{src.pct}%</Text>
            <IconSymbol name="chevron.right" size={12} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* Recent transactions */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 10 }}>Recent Transactions</Text>
      {txns.slice(0, 12).map((tx, idx) => (
        <View key={tx.id} style={{
          flexDirection: 'row', alignItems: 'center', gap: 12,
          paddingVertical: 10,
          borderBottomWidth: idx < Math.min(txns.length, 12) - 1 ? StyleSheet.hairlineWidth : 0,
          borderBottomColor: C.separator,
        }}>
          <View style={{
            width: 36, height: 36, borderRadius: 18,
            backgroundColor: SOURCE_COLORS[tx.source] + '20',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <IconSymbol name={tx.icon as any} size={16} color={SOURCE_COLORS[tx.source]} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 13, color: C.label }} numberOfLines={1}>{tx.description}</Text>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>{formatRelative(tx.date)}</Text>
          </View>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#5A8A6E' }}>+{formatMoneyFull(tx.amount)}</Text>
        </View>
      ))}
      <View style={{ height: 16 }} />
    </ScrollView>
  );
}

// ── Product Sparkline ─────────────────────────────────────────────────────────

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data, 1);
  const H = 22;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: H }}>
      {data.map((v, i) => (
        <View key={i} style={{
          width: 4, borderRadius: 2,
          height: Math.max(2, (v / max) * H),
          backgroundColor: i === data.length - 1 ? color : color + '55',
        }} />
      ))}
    </View>
  );
}

// ── Products Tab ───────────────────────────────────────────────────────────────

const PRODUCT_SECTIONS: { title: string; types: Product['type'][] }[] = [
  { title: 'Digital Products', types: ['Digital', 'Exclusive', 'Tips'] },
  { title: 'Courses',          types: ['Course']                        },
  { title: 'Services',         types: ['Service']                       },
  { title: 'Physical',         types: ['Physical', 'Merch']             },
];

const SUGGESTED: Record<string, { emoji: string; title: string; desc: string }> = {
  'Digital Products': { emoji: '📦', title: 'Create a digital download', desc: 'eBooks, templates, presets, or any downloadable file' },
  'Courses':          { emoji: '🎓', title: 'Offer a course or coaching', desc: 'Video lessons, live cohorts, 1-on-1 sessions' },
  'Services':         { emoji: '🛠', title: 'List a service',             desc: 'Design, consulting, writing, or any skill you sell' },
  'Physical':         { emoji: '👕', title: 'Sell physical products',     desc: 'Merch, prints, branded gear shipped to fans' },
};

function ProductsTab({
  pill, onProductPress, C,
}: {
  pill: string;
  onProductPress: (p: Product) => void;
  C: ReturnType<typeof useColors>;
}) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleSection = useCallback((title: string) => {
    Haptics.selectionAsync();
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title); else next.add(title);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    if (pill === 'All') return PRODUCTS;
    return PRODUCTS.filter(p => p.type === pill || (pill === 'Courses' && p.type === 'Course'));
  }, [pill]);

  // Stats
  const totalRevenue = PRODUCTS.reduce((s, p) => s + p.revenue, 0);
  const totalSold    = PRODUCTS.reduce((s, p) => s + p.salesCount, 0);
  const bestSeller   = [...PRODUCTS].sort((a, b) =>
    (b.salesTrend[b.salesTrend.length - 1] ?? 0) - (a.salesTrend[a.salesTrend.length - 1] ?? 0)
  )[0];

  const statCards = [
    { label: 'Products',     value: `${PRODUCTS.length}`,       icon: 'square.grid.2x2' },
    { label: 'Total Revenue',value: formatMoney(totalRevenue),   icon: 'dollarsign.circle' },
    { label: 'Total Sold',   value: `${totalSold}`,             icon: 'bag' },
    { label: 'Best Seller',  value: bestSeller?.title ?? '—',   icon: 'star' },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

      {/* Stats summary bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 2 }}>
          {statCards.map(sc => (
            <View key={sc.label} style={{
              width: 130, backgroundColor: C.surface, borderRadius: 14, padding: 14,
            }}>
              <IconSymbol name={sc.icon as any} size={16} color={C.accent} />
              <Text style={{ fontSize: 15, fontWeight: '800', color: C.label, marginTop: 6 }} numberOfLines={1}>{sc.value}</Text>
              <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{sc.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Category sections */}
      {PRODUCT_SECTIONS.map(sec => {
        const sectionProducts = filtered.filter(p => sec.types.includes(p.type));
        const isCollapsed = collapsed.has(sec.title);
        const hasProducts = sectionProducts.length > 0;

        return (
          <View key={sec.title} style={{ marginBottom: 4 }}>
            {/* Section header */}
            <Pressable
              onPress={() => toggleSection(sec.title)}
              style={({ pressed }) => ({
                flexDirection: 'row', alignItems: 'center',
                paddingVertical: 10, marginBottom: 8,
                borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
                backgroundColor: pressed ? C.surfacePressed : C.bg,
              })}
            >
              <Text style={{ flex: 1, fontSize: 13, fontWeight: '700', color: C.label }}>{sec.title}</Text>
              <Text style={{ fontSize: 11, color: C.muted, marginRight: 6 }}>{sectionProducts.length}</Text>
              <IconSymbol name={isCollapsed ? 'chevron.right' : 'chevron.down'} size={13} color={C.muted} />
            </Pressable>

            {!isCollapsed && (
              <>
                {sectionProducts.map(product => {
                  const lastVal = product.salesTrend[product.salesTrend.length - 1] ?? 0;
                  const prevVal = product.salesTrend[product.salesTrend.length - 2] ?? lastVal;
                  const trendUp = lastVal >= prevVal;
                  const isBest = product.id === bestSeller?.id;
                  const trendColor = trendUp ? C.green : C.red;

                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => onProductPress(product)}
                      style={({ pressed }) => ({
                        flexDirection: 'row', alignItems: 'center', gap: 12,
                        backgroundColor: pressed ? C.surfacePressed : C.surface,
                        borderRadius: 14, padding: 12, marginBottom: 8,
                      })}
                    >
                      {/* Thumbnail 64×64 */}
                      <View style={{
                        width: 64, height: 64, borderRadius: 16, flexShrink: 0,
                        backgroundColor: `hsl(${product.thumbHue},35%,85%)`,
                        alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Text style={{ fontSize: 30 }}>{product.thumbEmoji}</Text>
                      </View>

                      {/* Info */}
                      <View style={{ flex: 1, minWidth: 0, gap: 3 }}>
                        {/* Name + best seller star */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          <Text style={{ flex: 1, fontSize: 14, fontWeight: '700', color: C.label }} numberOfLines={1}>
                            {product.title}
                          </Text>
                          {isBest && <IconSymbol name="star.fill" size={12} color="#D97757" />}
                        </View>

                        {/* Type badge + price */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: C.surfacePressed }}>
                            <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>{product.type}</Text>
                          </View>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>
                            {product.price === 0 ? 'Free' : formatMoneyFull(product.price)}
                          </Text>
                        </View>

                        {/* Sales count + earned */}
                        <Text style={{ fontSize: 11, color: C.secondary }}>
                          {product.salesCount} {product.recurring ? 'subscribers' : 'sold'}
                          {product.revenue > 0 ? ` · ${formatMoney(product.revenue)} earned` : ''}
                        </Text>
                      </View>

                      {/* Sparkline + trend */}
                      <View style={{ alignItems: 'flex-end', gap: 4 }}>
                        <Sparkline data={product.salesTrend} color={trendColor} />
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                          <IconSymbol
                            name={trendUp ? 'arrow.up.right' : 'arrow.down.right'}
                            size={10}
                            color={trendColor}
                          />
                          <Text style={{ fontSize: 10, fontWeight: '600', color: trendColor }}>
                            {trendUp ? 'Up' : 'Down'}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}

                {/* Suggestion card for empty sections */}
                {!hasProducts && SUGGESTED[sec.title] && (
                  <View style={{
                    borderRadius: 14, borderWidth: 1.5, borderColor: C.inputBorder,
                    borderStyle: 'dashed', padding: 16, marginBottom: 8,
                    flexDirection: 'row', alignItems: 'center', gap: 12,
                  }}>
                    <Text style={{ fontSize: 32 }}>{SUGGESTED[sec.title].emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{SUGGESTED[sec.title].title}</Text>
                      <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{SUGGESTED[sec.title].desc}</Text>
                    </View>
                    <Pressable
                      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                      style={({ pressed }) => ({
                        paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10,
                        backgroundColor: pressed ? C.surfacePressed : C.accent + '15',
                        borderWidth: 1, borderColor: C.accent + '40',
                      })}
                    >
                      <Text style={{ fontSize: 12, fontWeight: '700', color: C.accent }}>Create</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

// ── Payouts Tab ────────────────────────────────────────────────────────────────

function PayoutsTab({
  pill, onAddToKayPay, onCashOut, C,
}: {
  pill: string;
  onAddToKayPay: () => void;
  onCashOut: () => void;
  C: ReturnType<typeof useColors>;
}) {
  const [bankSchedule, setBankSchedule] = useState<'Instant' | 'Daily' | 'Weekly' | 'Monthly'>('Weekly');

  const payouts = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const yearStart  = new Date(now.getFullYear(), 0, 1);
    if (pill === 'Completed') return PAYOUTS.filter(p => p.status === 'Completed');
    if (pill === 'Pending')   return PAYOUTS.filter(p => p.status === 'Pending');
    if (pill === 'This Month') return PAYOUTS.filter(p => p.date >= monthStart);
    if (pill === 'This Year')  return PAYOUTS.filter(p => p.date >= yearStart);
    return PAYOUTS;
  }, [pill]);

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* ── Available Balance Card ── */}
      <View style={{ backgroundColor: C.accent + '12', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: C.accent + '25' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.accent, letterSpacing: 0.4 }}>AVAILABLE TO WITHDRAW</Text>
        <Text style={{ fontSize: 44, fontWeight: '800', color: C.label, marginTop: 6, letterSpacing: -1 }}>{formatMoneyFull(EARN_STATS.balance)}</Text>
        {EARN_STATS.pendingBalance > 0 && (
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 4 }}>
            + {formatMoneyFull(EARN_STATS.pendingBalance)} clearing in 1–2 days
          </Text>
        )}

        {/* Primary: KayPay */}
        <Pressable
          onPress={onAddToKayPay}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 16, backgroundColor: C.accent, borderRadius: 12,
            paddingVertical: 14, opacity: pressed ? 0.85 : 1,
          })}
        >
          <IconSymbol name="creditcard.fill" size={16} color="#fff" />
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff' }}>Add to KayPay Balance</Text>
            <Text style={{ fontSize: 11, color: '#fff', opacity: 0.75 }}>Instant · Earn Capital Points</Text>
          </View>
        </Pressable>

        {/* Secondary: Bank */}
        <Pressable
          onPress={onCashOut}
          style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            marginTop: 8, borderRadius: 12, paddingVertical: 12, opacity: pressed ? 0.7 : 1,
            borderWidth: 1.5, borderColor: 'rgba(139,99,67,0.25)',
          })}
        >
          <IconSymbol name="building.columns" size={15} color={C.secondary} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.secondary }}>Cash Out to Bank</Text>
        </Pressable>
      </View>

      {/* ── Send To ── */}
      <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 8, letterSpacing: 0.5 }}>SEND TO</Text>

      {/* KayPay — always first, permanent */}
      <View style={{
        backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 12,
        borderWidth: 1.5, borderColor: C.accent + '30',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.accent + '15', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconSymbol name="creditcard.fill" size={20} color={C.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>KayPay Balance</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>Current: {formatMoneyFull(KAYPAY_CURRENT_BALANCE)}</Text>
          </View>
          <View style={{ paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: '#5A8A6E' + '20' }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: '#5A8A6E' }}>Instant · Free</Text>
          </View>
        </View>
        {/* Capital Points incentive */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 12 }}>
          <Text style={{ fontSize: 13 }}>🎯</Text>
          <Text style={{ fontSize: 12, color: C.secondary }}>
            Earn Capital Points when you keep your balance in KayPay
          </Text>
        </View>
      </View>

      {/* Bank accounts */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: C.surfacePressed, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <IconSymbol name="building.columns.fill" size={20} color={C.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }}>Chase Bank ···4821</Text>
            <Text style={{ fontSize: 12, color: C.secondary }}>Checking · 1–2 business days</Text>
          </View>
          <Pressable style={{ paddingHorizontal: 10, paddingVertical: 5, backgroundColor: C.surfacePressed, borderRadius: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>Change</Text>
          </Pressable>
        </View>
        <Pressable style={({ pressed }) => ({
          flexDirection: 'row', alignItems: 'center', gap: 10,
          padding: 14, backgroundColor: pressed ? C.surfacePressed : 'transparent',
        })}>
          <IconSymbol name="plus.circle" size={20} color={C.accent} />
          <Text style={{ fontSize: 14, color: C.accent, fontWeight: '500' }}>Add Bank Account</Text>
        </Pressable>
      </View>

      {/* ── Bank Transfer Schedule ── */}
      <View style={{ backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 20 }}>
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, marginBottom: 2 }}>BANK TRANSFER SCHEDULE</Text>
        <Text style={{ fontSize: 11, color: C.muted, marginBottom: 10 }}>KayPay transfers are always instant</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Instant', 'Daily', 'Weekly', 'Monthly'] as const).map(s => (
            <Pressable
              key={s}
              onPress={() => setBankSchedule(s)}
              style={{
                flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 10,
                backgroundColor: bankSchedule === s ? C.label : C.bg,
                borderWidth: 1, borderColor: bankSchedule === s ? C.label : C.inputBorder,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '600', color: bankSchedule === s ? C.bg : C.secondary }}>{s}</Text>
            </Pressable>
          ))}
        </View>
        {bankSchedule === 'Instant' && (
          <Text style={{ fontSize: 11, color: C.muted, marginTop: 8 }}>Instant bank transfers: 1.5% fee applies</Text>
        )}
      </View>

      {/* ── Payout History ── */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 10 }}>Payout History</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {payouts.map((payout, idx) => {
          const isKayPay = payout.destination === 'KayPay';
          return (
            <View key={payout.id} style={{
              paddingHorizontal: 14, paddingVertical: 12,
              borderBottomWidth: idx < payouts.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: C.separator,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  backgroundColor: isKayPay ? C.accent + '15' : C.surfacePressed,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <IconSymbol
                    name={isKayPay ? 'creditcard.fill' : 'building.columns.fill'}
                    size={18}
                    color={isKayPay ? C.accent : C.secondary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: C.label }}>
                    {isKayPay ? 'KayPay Balance' : payout.bankName ?? 'Bank Transfer'}
                  </Text>
                  <Text style={{ fontSize: 11, color: C.muted }}>{formatDate(payout.date)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{formatMoneyFull(payout.amount)}</Text>
                  <View style={{
                    marginTop: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6,
                    backgroundColor: isKayPay ? '#5A8A6E' + '20' : payout.status === 'Completed' ? C.surface : C.accent + '20',
                  }}>
                    <Text style={{
                      fontSize: 10, fontWeight: '700',
                      color: isKayPay ? '#5A8A6E' : payout.status === 'Completed' ? C.secondary : C.accent,
                    }}>
                      {isKayPay ? 'Instant' : payout.status}
                    </Text>
                  </View>
                </View>
              </View>
              {/* Capital Points earned row */}
              {isKayPay && payout.capitalPointsEarned && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6, marginLeft: 48 }}>
                  <Text style={{ fontSize: 12 }}>🎯</Text>
                  <Text style={{ fontSize: 11, color: C.secondary }}>
                    {payout.capitalPointsEarned.toLocaleString()} Capital Points earned
                  </Text>
                </View>
              )}
            </View>
          );
        })}
        {payouts.length === 0 && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 13, color: C.muted }}>No payouts yet</Text>
          </View>
        )}
      </View>

      {/* ── Tax Documents ── */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 10 }}>Tax Documents</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 20 }}>
        {[
          { label: '2025 1099-K', sub: 'Available Jan 31, 2026' },
          { label: '2025 Annual Earnings Statement', sub: 'Year-end summary' },
        ].map((doc, idx) => (
          <Pressable key={doc.label} style={({ pressed }) => ({
            flexDirection: 'row', alignItems: 'center', gap: 12,
            paddingHorizontal: 14, paddingVertical: 12,
            backgroundColor: pressed ? C.surfacePressed : 'transparent',
            borderBottomWidth: idx === 0 ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: C.separator,
          })}>
            <IconSymbol name="doc.text.fill" size={18} color={C.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: C.label }}>{doc.label}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{doc.sub}</Text>
            </View>
            <IconSymbol name="arrow.down.circle" size={18} color={C.accent} />
          </Pressable>
        ))}
      </View>

      {/* ── Fee Breakdown ── */}
      <Text style={{ fontSize: 13, fontWeight: '700', color: C.label, marginBottom: 10 }}>Fee Breakdown</Text>
      <View style={{ backgroundColor: C.surface, borderRadius: 14, overflow: 'hidden', marginBottom: 24 }}>
        <View style={{ flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }}>
          <Text style={{ flex: 2, fontSize: 10, fontWeight: '700', color: C.secondary }}>TYPE</Text>
          <Text style={{ flex: 1, fontSize: 10, fontWeight: '700', color: C.secondary, textAlign: 'center' }}>KAYNEXT</Text>
          <Text style={{ flex: 1, fontSize: 10, fontWeight: '700', color: C.secondary, textAlign: 'center' }}>YOU KEEP</Text>
        </View>
        {FEE_TABLE.map((fee, idx) => (
          <View key={fee.type} style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 14, paddingVertical: 10,
            borderBottomWidth: idx < FEE_TABLE.length - 1 ? StyleSheet.hairlineWidth : 0,
            borderBottomColor: C.separator,
          }}>
            <Text style={{ flex: 2, fontSize: 12, color: C.label }}>{fee.type}</Text>
            <Text style={{ flex: 1, fontSize: 12, color: C.secondary, textAlign: 'center' }}>{fee.kanextFee}</Text>
            <Text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#5A8A6E', textAlign: 'center' }}>{fee.netPct}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────────

export default function EarnScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;

  const [tab, setTab]             = useState<Tab>('Earnings');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showPills, setShowPills] = useState(false);
  const [selectedPill, setSelectedPill] = useState('All');
  const pillsRevealAnim = useRef(new Animated.Value(0)).current;

  // Sheet state
  const [kayPayOpen, setKayPayOpen]             = useState(false);
  const [cashOutOpen, setCashOutOpen]           = useState(false);
  const [selectedSource, setSelectedSource]     = useState<RevenueSource | null>(null);
  const [drilldownOpen, setDrilldownOpen]       = useState(false);
  const [selectedProduct, setSelectedProduct]   = useState<Product | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [createProductOpen, setCreateProductOpen] = useState(false);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const togglePills = () => {
    const next = !showPills;
    setShowPills(next);
    Animated.timing(pillsRevealAnim, {
      toValue: next ? 1 : 0, duration: 200, useNativeDriver: false,
    }).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const pillRowH = pillsRevealAnim.interpolate({ inputRange: [0, 1], outputRange: [0, PILL_ROW_H] });

  const switchTab = (t: Tab) => {
    setTab(t);
    setDropdownOpen(false);
    setSelectedPill('All');
  };

  const scrollPadTop = topBarH + (showPills ? PILL_ROW_H : 0) + 8;
  const pills = TAB_PILLS[tab];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* Top Bar */}
      <View style={[styles.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg }]}>
        <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} style={styles.topBtn}>
          <IconSymbol name="line.3.horizontal" size={22} color={C.label} />
        </Pressable>

        <View style={{ flex: 1, alignItems: 'center' }}>
          <Pressable
            onPress={() => { setDropdownOpen(o => !o); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            style={[styles.dropdownPill, { backgroundColor: C.surfacePressed, borderColor: C.inputBorder }]}
          >
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>{tab}</Text>
            <IconSymbol name={dropdownOpen ? 'chevron.up' : 'chevron.down'} size={11} color={C.muted} />
          </Pressable>
        </View>

        <Pressable onPress={togglePills} style={styles.topBtn}>
          <IconSymbol name="line.3.horizontal.decrease" size={20} color={showPills ? C.accent : C.label} />
        </Pressable>
      </View>

      {/* Dropdown */}
      {dropdownOpen && (
        <View style={[styles.dropdown, { top: topBarH + 4, backgroundColor: C.surface, borderColor: C.inputBorder }]}>
          {TABS.map(t => (
            <Pressable
              key={t}
              onPress={() => switchTab(t)}
              style={({ pressed }) => [styles.dropdownItem, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            >
              <Text style={{ fontSize: 14, fontWeight: tab === t ? '700' : '500', color: tab === t ? C.accent : C.label }}>{t}</Text>
              {tab === t && <IconSymbol name="checkmark" size={13} color={C.accent} />}
            </Pressable>
          ))}
        </View>
      )}

      {/* Filter Pills */}
      <Animated.View style={[styles.pillRow, { height: pillRowH, top: topBarH, backgroundColor: C.bg }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
          {pills.map(pill => (
            <Pressable
              key={pill}
              onPress={() => { setSelectedPill(pill); Haptics.selectionAsync(); }}
              style={[styles.pill, {
                backgroundColor: selectedPill === pill ? C.label : C.surface,
                borderColor: selectedPill === pill ? C.label : C.inputBorder,
              }]}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: selectedPill === pill ? C.bg : C.secondary }}>
                {pill}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {/* Dismiss dropdown overlay */}
      {dropdownOpen && (
        <Pressable style={StyleSheet.absoluteFill} onPress={() => setDropdownOpen(false)} />
      )}

      {/* Tab Content */}
      <View style={{ flex: 1, paddingTop: scrollPadTop, paddingHorizontal: 16 }}>
        {tab === 'Earnings' && (
          <EarningsTab
            pill={selectedPill}
            onAddToKayPay={() => setKayPayOpen(true)}
            onCashOut={() => setCashOutOpen(true)}
            onSourcePress={(src) => { setSelectedSource(src); setDrilldownOpen(true); }}
            C={C}
          />
        )}
        {tab === 'Products' && (
          <ProductsTab
            pill={selectedPill}
            onProductPress={(p) => { setSelectedProduct(p); setProductDetailOpen(true); }}
            C={C}
          />
        )}
        {tab === 'Payouts' && (
          <PayoutsTab
            pill={selectedPill}
            onAddToKayPay={() => setKayPayOpen(true)}
            onCashOut={() => setCashOutOpen(true)}
            C={C}
          />
        )}
      </View>

      {/* FAB — Products tab */}
      {tab === 'Products' && (
        <Pressable
          onPress={() => { setCreateProductOpen(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); }}
          style={[styles.fab, { backgroundColor: C.accent, bottom: insets.bottom + 80 }]}
        >
          <IconSymbol name="plus" size={22} color="#fff" />
        </Pressable>
      )}

      {/* Sheets */}
      <KayPayTransferSheet visible={kayPayOpen} onClose={() => setKayPayOpen(false)} onCashOut={() => setCashOutOpen(true)} C={C} />
      <CashOutSheet visible={cashOutOpen} onClose={() => setCashOutOpen(false)} C={C} />
      <DrilldownSheet source={selectedSource} visible={drilldownOpen} onClose={() => setDrilldownOpen(false)} C={C} />
      <ProductDetailSheet product={selectedProduct} visible={productDetailOpen} onClose={() => setProductDetailOpen(false)} C={C} />
      <CreateProductSheet visible={createProductOpen} onClose={() => setCreateProductOpen(false)} C={C} />
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'flex-end',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  topBtn: { width: 40, height: 36, alignItems: 'center', justifyContent: 'center' },
  dropdownPill: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, borderWidth: 1.5,
  },
  dropdown: {
    position: 'absolute', left: 16, right: 16, zIndex: 99,
    borderRadius: 14, borderWidth: 1, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 6,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 13,
  },
  pillRow: {
    position: 'absolute', left: 0, right: 0, zIndex: 9, overflow: 'hidden',
    justifyContent: 'center',
  },
  pillScroll: { paddingHorizontal: 16, gap: 8, alignItems: 'center' },
  pill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, borderWidth: 1 },
  fab: {
    position: 'absolute', right: 20,
    width: 52, height: 52, borderRadius: 26,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18, shadowRadius: 6, elevation: 6,
  },
});
