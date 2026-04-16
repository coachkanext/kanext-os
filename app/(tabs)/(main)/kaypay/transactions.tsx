/**
 * Transactions — Full transaction history with search, filter pills,
 * summary stats, and grouped date sections for KayPay.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { GlassView } from '@/components/ui/glass-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useMode } from '@/context/app-context';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Module-level semantic constants ───────────────────────────────────────────

const GAIN = '#5A8A6E';
const HEAT = '#B85C5C';

// ── Types ─────────────────────────────────────────────────────────────────────

type TransactionType = 'Income' | 'Expense' | 'Transfer' | 'Savings';

interface Transaction {
  id: string;
  icon: string;
  merchant: string;
  type: TransactionType;
  amount: string;
  time: string;
  category: string;
}

interface TransactionGroup {
  label: string;
  data: Transaction[];
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const TRANSACTION_GROUPS: TransactionGroup[] = [
  {
    label: 'Today',
    data: [
      { id: 't1',  icon: 'arrow.down.circle.fill', merchant: '@james_okonkwo',    type: 'Income',   amount: '+$25.00',  time: '2:14 PM',  category: 'Transfer'       },
      { id: 't2',  icon: 'bag.fill',               merchant: 'Whole Foods',       type: 'Expense',  amount: '-$42.50',  time: '11:30 AM', category: 'Groceries'      },
      { id: 't3',  icon: 'play.rectangle.fill',    merchant: 'Netflix',           type: 'Expense',  amount: '-$15.99',  time: '9:00 AM',  category: 'Subscriptions'  },
      { id: 't4',  icon: 'star.fill',              merchant: 'KaNeXT Inner Circle', type: 'Income', amount: '+$25.00',  time: '12:00 AM', category: 'Subscription'   },
    ],
  },
  {
    label: 'Yesterday',
    data: [
      { id: 't5',  icon: 'fuelpump.fill',          merchant: 'Shell Gas',         type: 'Expense',  amount: '-$68.20',  time: '6:45 PM',  category: 'Transportation' },
      { id: 't6',  icon: 'arrow.up.circle.fill',   merchant: 'Sarah K.',          type: 'Transfer', amount: '-$50.00',  time: '3:20 PM',  category: 'Transfer'       },
      { id: 't7',  icon: 'fork.knife',             merchant: 'Chipotle',          type: 'Expense',  amount: '-$14.75',  time: '1:05 PM',  category: 'Food'           },
    ],
  },
  {
    label: 'March 28',
    data: [
      { id: 't8',  icon: 'arrow.down.circle.fill', merchant: '@tech_laolu',       type: 'Income',   amount: '+$100.00', time: '4:00 PM',  category: 'Transfer'       },
      { id: 't9',  icon: 'creditcard.fill',        merchant: 'Amazon',            type: 'Expense',  amount: '-$32.00',  time: '2:30 PM',  category: 'Shopping'       },
      { id: 't10', icon: 'cross.fill',             merchant: 'CVS Pharmacy',      type: 'Expense',  amount: '-$8.99',   time: '10:00 AM', category: 'Health'         },
    ],
  },
  {
    label: 'March 27',
    data: [
      { id: 't11', icon: 'building.2.fill',        merchant: 'Rent — Apr',        type: 'Expense',  amount: '-$850.00', time: 'Auto',     category: 'Housing'        },
      { id: 't12', icon: 'arrow.down.circle.fill', merchant: '@lincoln_cole',     type: 'Income',   amount: '+$75.00',  time: '11:20 AM', category: 'Transfer'       },
      { id: 't13', icon: 'applelogo',              merchant: 'Apple One',         type: 'Expense',  amount: '-$19.95',  time: '12:00 AM', category: 'Subscriptions'  },
    ],
  },
];

const FILTER_PILLS = ['All', 'Income', 'Expenses', 'Transfers', 'Savings'] as const;
type FilterPill = typeof FILTER_PILLS[number];

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TransactionsPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const TOP_BAR_H = insets.top + 54;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(TOP_BAR_H);

  const mode = useMode();
  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:kaypay' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:kaypay';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const [filter, setFilter]   = useState<FilterPill>('All');
  const [searchText, setSearchText] = useState('');

  const styles = useMemo(() => makeStyles(C), [C]);

  // ── Filter logic ──────────────────────────────────────────────────────────

  const filteredGroups = useMemo<TransactionGroup[]>(() => {
    if (filter === 'Savings') return [];

    const typeMap: Partial<Record<FilterPill, TransactionType>> = {
      Income:    'Income',
      Expenses:  'Expense',
      Transfers: 'Transfer',
    };
    const typeFilter = typeMap[filter];

    const query = searchText.trim().toLowerCase();

    return TRANSACTION_GROUPS
      .map(group => ({
        ...group,
        data: group.data.filter(tx => {
          const matchesType = typeFilter ? tx.type === typeFilter : true;
          const matchesSearch = query
            ? tx.merchant.toLowerCase().includes(query) ||
              tx.category.toLowerCase().includes(query)
            : true;
          return matchesType && matchesSearch;
        }),
      }))
      .filter(group => group.data.length > 0);
  }, [filter, searchText]);

  // ── Summary stats (All filter only) ─────────────────────────────────────

  const summaryStats = useMemo(() => {
    let income   = 0;
    let expenses = 0;
    TRANSACTION_GROUPS.forEach(group =>
      group.data.forEach(tx => {
        const raw = parseFloat(tx.amount.replace(/[^0-9.]/g, ''));
        if (tx.amount.startsWith('+')) income   += raw;
        else                           expenses += raw;
      }),
    );
    return { income, expenses, net: income - expenses };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleFilterPress = useCallback((pill: FilterPill) => {
    Haptics.selectionAsync();
    setFilter(pill);
  }, []);

  // ── JSX ──────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <Animated.View style={[styles.topBarOuter, { height: TOP_BAR_H, paddingTop: insets.top, backgroundColor: C.bg, opacity }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              openSidePanel();
            }}
            style={styles.topBarLeft}
          >
            <KMenuButton />
          </Pressable>

          <View style={styles.topBarCenter}>
            <View style={[styles.staticPill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[styles.staticPillText, { color: C.label }]}>Transactions</Text>
            </View>
          </View>

          <View style={styles.topBarRight}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scroll Content ──────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: TOP_BAR_H + 16, paddingBottom: insets.bottom + 80 },
        ]}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Search Bar ──────────────────────────────────────────────────── */}
        <GlassView tier={2} style={styles.searchBar}>
          <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
          <TextInput
            style={[styles.searchInput, { color: C.label }]}
            placeholder="Search transactions"
            placeholderTextColor={C.secondary}
            value={searchText}
            onChangeText={setSearchText}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </GlassView>

        {/* ── Filter Pills ─────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsRow}
          style={styles.pillsScroll}
        >
          {FILTER_PILLS.map(pill => {
            const active = filter === pill;
            return (
              <Pressable
                key={pill}
                onPress={() => handleFilterPress(pill)}
                style={[
                  styles.filterPill,
                  active
                    ? { backgroundColor: C.activePill }
                    : { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator },
                ]}
              >
                <Text style={[
                  styles.filterPillText,
                  { color: active ? C.activePillText : C.secondary },
                ]}>
                  {pill}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Summary Row (All only) ───────────────────────────────────────── */}
        {filter === 'All' && (
          <GlassView tier={1} style={styles.summaryCard}>
            <View style={styles.summaryCol}>
              <Text style={[styles.summaryValue, { color: GAIN }]}>
                ${summaryStats.income.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.summaryLabel, { color: C.secondary }]}>Income</Text>
            </View>

            <View style={[styles.summarySep, { backgroundColor: C.separator }]} />

            <View style={styles.summaryCol}>
              <Text style={[styles.summaryValue, { color: HEAT }]}>
                ${summaryStats.expenses.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.summaryLabel, { color: C.secondary }]}>Expenses</Text>
            </View>

            <View style={[styles.summarySep, { backgroundColor: C.separator }]} />

            <View style={styles.summaryCol}>
              <Text style={[styles.summaryValue, { color: summaryStats.net >= 0 ? GAIN : HEAT }]}>
                {summaryStats.net >= 0 ? '+' : '-'}${Math.abs(summaryStats.net).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
              </Text>
              <Text style={[styles.summaryLabel, { color: C.secondary }]}>Net</Text>
            </View>
          </GlassView>
        )}

        {/* ── Savings Empty State ──────────────────────────────────────────── */}
        {filter === 'Savings' && (
          <View style={styles.emptyState}>
            <IconSymbol name="banknote" size={36} color={C.secondary} />
            <Text style={[styles.emptyTitle, { color: C.label }]}>No savings transactions yet</Text>
            <Text style={[styles.emptySubtitle, { color: C.secondary }]}>
              Savings activity will appear here once you start saving.
            </Text>
          </View>
        )}

        {/* ── Grouped Transaction List ─────────────────────────────────────── */}
        {filteredGroups.length === 0 && filter !== 'Savings' ? (
          <View style={styles.emptyState}>
            <IconSymbol name="magnifyingglass" size={36} color={C.secondary} />
            <Text style={[styles.emptyTitle, { color: C.label }]}>No transactions found</Text>
            <Text style={[styles.emptySubtitle, { color: C.secondary }]}>
              Try adjusting your search or filter.
            </Text>
          </View>
        ) : (
          filteredGroups.map(group => (
            <View key={group.label} style={styles.groupSection}>
              {/* Section header */}
              <Text style={[styles.groupHeader, { color: C.secondary }]}>
                {group.label.toUpperCase()}
              </Text>

              {/* Transaction rows */}
              <View style={[styles.groupCard, { backgroundColor: C.surface }]}>
                {group.data.map((tx, idx) => {
                  const isPositive = tx.amount.startsWith('+');
                  const amountColor = isPositive ? GAIN : HEAT;
                  const dividerLeft = 16 + 38 + 12;

                  return (
                    <View key={tx.id}>
                      <Pressable
                        onPress={() => Haptics.selectionAsync()}
                        style={({ pressed }) => [
                          styles.txRow,
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        {/* Icon circle */}
                        <View style={[styles.txIconCircle, { backgroundColor: C.surface }]}>
                          <IconSymbol
                            name={tx.icon as any}
                            size={16}
                            color={C.secondary}
                          />
                        </View>

                        {/* Merchant + category/time */}
                        <View style={styles.txInfo}>
                          <Text style={[styles.txMerchant, { color: C.label }]} numberOfLines={1}>
                            {tx.merchant}
                          </Text>
                          <Text style={[styles.txMeta, { color: C.secondary }]} numberOfLines={1}>
                            {tx.category} · {tx.time}
                          </Text>
                        </View>

                        {/* Amount */}
                        <Text style={[styles.txAmount, { color: amountColor }]}>
                          {tx.amount}
                        </Text>
                      </Pressable>

                      {idx < group.data.length - 1 && (
                        <View
                          style={[
                            styles.hairline,
                            { backgroundColor: C.separator, marginLeft: dividerLeft },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },

    // ── Top bar ──────────────────────────────────────────────────────────────
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      paddingHorizontal: 16,
      paddingBottom: 8,
      flex: 1,
    },
    topBarLeft: {
      width: 40,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarCenter: {
      flex: 1,
      alignItems: 'center',
    },
    topBarRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    staticPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 18,
      borderWidth: 1.5,
    },
    staticPillText: {
      fontSize: 13,
      fontWeight: '700',
    },

    // ── Scroll ───────────────────────────────────────────────────────────────
    scrollContent: {
      paddingHorizontal: 16,
    },

    // ── Search bar ───────────────────────────────────────────────────────────
    searchBar: {
      height: 42,
      borderRadius: 21,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      gap: 8,
      marginBottom: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      paddingVertical: 0,
    },

    // ── Filter pills ──────────────────────────────────────────────────────────
    pillsScroll: {
      marginBottom: 16,
    },
    pillsRow: {
      gap: 8,
      paddingRight: 4,
    },
    filterPill: {
      borderRadius: 16,
      paddingHorizontal: 14,
      paddingVertical: 7,
    },
    filterPillText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // ── Summary card ─────────────────────────────────────────────────────────
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
    },
    summaryCol: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    summaryLabel: {
      fontSize: 11,
    },
    summarySep: {
      width: 1,
      height: 32,
    },

    // ── Empty state ───────────────────────────────────────────────────────────
    emptyState: {
      alignItems: 'center',
      paddingTop: 60,
      paddingHorizontal: 24,
      gap: 10,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '600',
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 13,
      lineHeight: 18,
      textAlign: 'center',
    },

    // ── Group section ─────────────────────────────────────────────────────────
    groupSection: {
      marginBottom: 20,
    },
    groupHeader: {
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    groupCard: {
      borderRadius: 12,
      overflow: 'hidden',
    },

    // ── Transaction row ───────────────────────────────────────────────────────
    txRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 12,
    },
    txIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    txInfo: {
      flex: 1,
      gap: 3,
    },
    txMerchant: {
      fontSize: 14,
      fontWeight: '600',
    },
    txMeta: {
      fontSize: 12,
    },
    txAmount: {
      fontSize: 14,
      fontWeight: '700',
    },

    // ── Hairline ──────────────────────────────────────────────────────────────
    hairline: {
      height: StyleSheet.hairlineWidth,
    },
  });
}
