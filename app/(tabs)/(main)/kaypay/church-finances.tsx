/**
 * Church Finances — Pastor-only financial overview.
 * Redirects Member to kaypay/index in useFocusEffect.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { KMenuButton } from '@/components/ui/k-menu-button';

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';

const TOP_BAR_H = 52;

interface Fund {
  name: string;
  balance: string;
  restricted: boolean;
}

const FUNDS: Fund[] = [
  { name: 'General / Tithe',  balance: '$72,000', restricted: false },
  { name: 'Building Fund',    balance: '$31,000', restricted: true  },
  { name: 'Missions',         balance: '$8,500',  restricted: true  },
  { name: 'Benevolence',      balance: '$4,200',  restricted: true  },
  { name: 'Youth',            balance: '$2,100',  restricted: false },
  { name: 'Worship',          balance: '$1,800',  restricted: false },
];

interface BudgetRow {
  category: string;
  spent: number;
  budget: number;
}

const BUDGET_ROWS: BudgetRow[] = [
  { category: 'Staff / Payroll', spent: 87000,  budget: 135000 },
  { category: 'Facilities',      spent: 18000,  budget: 24000  },
  { category: 'Ministries',      spent: 12000,  budget: 18000  },
  { category: 'Missions',        spent: 8500,   budget: 12000  },
  { category: 'Operations',      spent: 6000,   budget: 11000  },
];

interface Transaction {
  description: string;
  amount: number;
  isIncome: boolean;
  fund: string;
  date: string;
}

const TRANSACTIONS: Transaction[] = [
  { description: 'Sunday Tithes & Offerings', amount: 12400, isIncome: true,  fund: 'General / Tithe', date: 'Apr 6' },
  { description: 'Online Giving',             amount: 5800,  isIncome: true,  fund: 'General / Tithe', date: 'Apr 7' },
  { description: 'Building Fund Donation',    amount: 3000,  isIncome: true,  fund: 'Building Fund',   date: 'Apr 7' },
  { description: 'Utilities',                 amount: 1850,  isIncome: false, fund: 'Facilities',      date: 'Apr 8' },
  { description: 'Pastoral Salary',           amount: 4500,  isIncome: false, fund: 'Staff / Payroll', date: 'Apr 9' },
  { description: 'Missions Gift',             amount: 800,   isIncome: true,  fund: 'Missions',        date: 'Apr 9' },
];

function fmt(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}K`;
  return `$${n.toLocaleString()}`;
}

function pct(spent: number, budget: number) {
  return Math.min(100, Math.round((spent / budget) * 100));
}

export default function ChurchFinancesScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:kaypay');
  const isPastor = role === roleCycles[0];

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/kaypay' as any);
    }
  }, [isPastor]));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => openSidePanel()} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <Text style={[s.topTitle, { color: C.label }]}>Church Finances</Text>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 12,
          paddingBottom: insets.bottom + 80,
          gap: 14,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Church Balance Card */}
        <View style={[s.balanceCard, { backgroundColor: C.label, marginHorizontal: 16 }]}>
          <Text style={s.balanceLabel}>Church Balance</Text>
          <Text style={s.balanceAmount}>$124,350.00</Text>
          <View style={s.balanceRow}>
            <Text style={[s.balanceIn, { color: GAIN }]}>This Month In: $28.4K</Text>
            <Text style={s.balancePipe}> | </Text>
            <Text style={[s.balanceOut, { color: HEAT }]}>Out: $19.2K</Text>
          </View>
        </View>

        {/* Fund Balances */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Fund Balances</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {FUNDS.map((fund, idx) => (
              <Pressable
                key={fund.name}
                style={[
                  s.fundRow,
                  idx < FUNDS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert(fund.name, `Balance: ${fund.balance}\n${fund.restricted ? 'This is a restricted fund.' : 'Unrestricted fund.'}\n\nView transaction history?`, [
                    { text: 'View History', onPress: () => {} },
                    { text: 'Cancel', style: 'cancel' },
                  ]);
                }}
              >
                <Text style={[s.fundName, { color: C.label }]}>{fund.name}</Text>
                {fund.restricted && (
                  <IconSymbol name="lock.fill" size={12} color={C.secondary} />
                )}
                <Text style={[s.fundBalance, { color: GAIN }]}>{fund.balance}</Text>
                <IconSymbol name="chevron.right" size={13} color={C.secondary} />
              </Pressable>
            ))}
          </View>
        </View>

        {/* Budget vs Actual */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Budget vs Actual</Text>
          <View style={[s.card, { backgroundColor: C.surface, gap: 12 }]}>
            <View style={s.ytdRow}>
              <Text style={[s.ytdLabel, { color: C.secondary }]}>67% YTD Spending</Text>
              <Text style={[s.ytdPct, { color: C.label }]}>67%</Text>
            </View>
            <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
              <View style={[s.progressFill, { backgroundColor: C.label, width: '67%' }]} />
            </View>
            <View style={[s.divider, { backgroundColor: C.separator }]} />
            {BUDGET_ROWS.map((row, idx) => {
              const p = pct(row.spent, row.budget);
              return (
                <View key={row.category} style={[s.budgetRow, idx < BUDGET_ROWS.length - 1 && { marginBottom: 10 }]}>
                  <View style={s.budgetMeta}>
                    <Text style={[s.budgetCat, { color: C.label }]}>{row.category}</Text>
                    <Text style={[s.budgetFigures, { color: C.secondary }]}>
                      {fmt(row.spent)} / {fmt(row.budget)} · {p}%
                    </Text>
                  </View>
                  <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                    <View style={[s.progressFill, { backgroundColor: C.label, width: `${p}%` }]} />
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <Text style={[s.sectionTitle, { color: C.label }]}>Recent Transactions</Text>
          <View style={[s.card, { backgroundColor: C.surface }]}>
            {TRANSACTIONS.map((tx, idx) => (
              <View
                key={tx.description + tx.date}
                style={[
                  s.txRow,
                  idx < TRANSACTIONS.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[s.txDesc, { color: C.label }]}>{tx.description}</Text>
                  <Text style={[s.txMeta, { color: C.secondary }]}>{tx.fund} · {tx.date}</Text>
                </View>
                <Text style={[s.txAmount, { color: tx.isIncome ? GAIN : HEAT }]}>
                  {tx.isIncome ? '+' : '-'}${tx.amount.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Monthly Summary */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={[s.summaryCard, { backgroundColor: C.surface }]}>
            <Text style={[s.summaryTitle, { color: C.label }]}>Monthly Summary</Text>
            <View style={s.summaryRow}>
              <View style={s.summaryCell}>
                <Text style={[s.summaryValue, { color: GAIN }]}>$28.4K</Text>
                <Text style={[s.summarySub, { color: C.secondary }]}>Income</Text>
              </View>
              <View style={[s.summaryDivider, { backgroundColor: C.separator }]} />
              <View style={s.summaryCell}>
                <Text style={[s.summaryValue, { color: HEAT }]}>$19.2K</Text>
                <Text style={[s.summarySub, { color: C.secondary }]}>Expenses</Text>
              </View>
              <View style={[s.summaryDivider, { backgroundColor: C.separator }]} />
              <View style={s.summaryCell}>
                <Text style={[s.summaryValue, { color: GAIN }]}>+$9.2K</Text>
                <Text style={[s.summarySub, { color: C.secondary }]}>Net</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    topTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', paddingBottom: 2 },
    rolePillWrap: { width: 44 + 32, alignItems: 'flex-end', justifyContent: 'center' },

    balanceCard: {
      borderRadius: 20, padding: 24, gap: 8,
    },
    balanceLabel:  { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
    balanceAmount: { color: '#FFFFFF', fontSize: 36, fontWeight: '800', letterSpacing: -0.5 },
    balanceRow:    { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    balanceIn:     { fontSize: 13, fontWeight: '600' },
    balancePipe:   { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
    balanceOut:    { fontSize: 13, fontWeight: '600' },

    sectionTitle: { fontSize: 16, fontWeight: '700' },

    card: { borderRadius: 12, padding: 14 },

    fundRow: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 11,
    },
    fundName:    { flex: 1, fontSize: 14, fontWeight: '600' },
    fundBalance: { fontSize: 14, fontWeight: '700' },

    ytdRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    ytdLabel:   { fontSize: 13 },
    ytdPct:     { fontSize: 14, fontWeight: '700' },

    divider: { height: StyleSheet.hairlineWidth, marginVertical: 4 },

    budgetRow:     { gap: 6 },
    budgetMeta:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
    budgetCat:     { fontSize: 13, fontWeight: '600' },
    budgetFigures: { fontSize: 12 },

    progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
    progressFill:  { height: 6, borderRadius: 3 },

    txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 8 },
    txDesc:   { fontSize: 13, fontWeight: '500' },
    txMeta:   { fontSize: 11, marginTop: 2 },
    txAmount: { fontSize: 14, fontWeight: '700' },

    summaryCard:    { borderRadius: 12, padding: 16, gap: 12 },
    summaryTitle:   { fontSize: 14, fontWeight: '700' },
    summaryRow:     { flexDirection: 'row', alignItems: 'center' },
    summaryCell:    { flex: 1, alignItems: 'center' },
    summaryValue:   { fontSize: 17, fontWeight: '700' },
    summarySub:     { fontSize: 11, marginTop: 2 },
    summaryDivider: { width: StyleSheet.hairlineWidth, height: 36 },
  });
}
