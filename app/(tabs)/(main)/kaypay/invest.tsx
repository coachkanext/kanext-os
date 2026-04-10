/**
 * KayPay — Invest screen
 * Personal mode · mode-agnostic · Savings goals + APY + Dipson + Transactions
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Constants ─────────────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

// ── Data ──────────────────────────────────────────────────────────────────────

const SAVINGS_GOALS = [
  { name: 'Tax Reserve',    target: 3000,  current: 1240, autoSave: '30% of earnings', color: CAUTION },
  { name: 'Equipment Fund', target: 2500,  current: 820,  autoSave: '$50/week',         color: GAIN    },
  { name: 'Emergency Fund', target: 10000, current: 2760, autoSave: null,               color: HEAT    },
] as const;

const APY_ROWS = [
  { label: 'Current APY',       value: '4.00%',    colorKey: 'gain',      bold: true  },
  { label: 'Earned this month', value: '$12.43',   colorKey: 'label',     bold: true  },
  { label: 'Earned all time',   value: '$86.19',   colorKey: 'label',     bold: true  },
  { label: 'Balance earning',   value: '$2,340.50',colorKey: 'secondary', bold: false },
] as const;

const TRANSACTIONS = [
  { goal: 'Tax Reserve',    amount: '+$234.00', dir: 'in',  date: 'Apr 1',  auto: true  },
  { goal: 'Equipment Fund', amount: '+$50.00',  dir: 'in',  date: 'Mar 28', auto: true  },
  { goal: 'Tax Reserve',    amount: '+$156.00', dir: 'in',  date: 'Mar 15', auto: true  },
  { goal: 'Emergency Fund', amount: '-$200.00', dir: 'out', date: 'Mar 10', auto: false },
  { goal: 'Equipment Fund', amount: '+$50.00',  dir: 'in',  date: 'Mar 1',  auto: true  },
] as const;

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function InvestScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('personal:kaypay');
  const isOwner = role === roleCycles[0];

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <View style={[s.topBar, {
        paddingTop: insets.top,
        height: insets.top + TOP_BAR_H,
        backgroundColor: C.bg,
        borderBottomColor: C.separator,
      }]}>
        <Pressable
          style={s.iconBtn}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
        >
          <KMenuButton />
        </Pressable>

        <Text style={{ fontSize: 17, fontWeight: '700', color: C.label }}>Invest</Text>

        <View style={{ marginRight: 4 }}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} accentColor={C.label} />
        </View>
      </View>

      {/* ── Scroll Content ──────────────────────────────────────────────────── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 16,
          paddingBottom: insets.bottom + 100,
        }}
      >

        {/* ── 1. Total Invested Hero ──────────────────────────────────────── */}
        <View style={[s.hero, { marginHorizontal: 16, backgroundColor: C.label }]}>
          <Text style={s.heroLabel}>Total Invested</Text>
          <Text style={s.heroAmount}>$4,820.00</Text>
          <Text style={{ fontSize: 14, fontWeight: '600', color: GAIN }}>+4.2% all time</Text>
        </View>

        {/* ── 2. Savings Goals ────────────────────────────────────────────── */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <View style={[s.row, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Text style={[s.sectionTitle, { color: C.label }]}>Savings Goals</Text>
            <Pressable onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Alert.alert('Create Goal', 'Coming soon');
            }}>
              <Text style={{ fontSize: 14, fontWeight: '600', color: C.secondary }}>+ Create Goal</Text>
            </Pressable>
          </View>

          <View style={{ gap: 12 }}>
            {SAVINGS_GOALS.map(goal => {
              const pct = Math.round((goal.current / goal.target) * 100);
              const pctWidth = Math.min(pct, 100);
              return (
                <Pressable
                  key={goal.name}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    Alert.alert('Goal detail coming soon');
                  }}
                >
                  <View style={[s.goalCard, { backgroundColor: C.surface }]}>
                    <View style={[s.row, { justifyContent: 'space-between', marginBottom: 4 }]}>
                      <Text style={{ fontSize: 16, fontWeight: '700', color: C.label }}>{goal.name}</Text>
                      <Text style={{ fontSize: 13, color: C.secondary }}>/ ${goal.target.toLocaleString()}.00</Text>
                    </View>

                    <Text style={{ fontSize: 28, fontWeight: '800', color: goal.color, marginBottom: 10 }}>
                      ${goal.current.toLocaleString()}.00
                    </Text>

                    <View style={[s.progressTrack, { backgroundColor: C.separator }]}>
                      <View style={[s.progressFill, { width: `${pctWidth}%` as any, backgroundColor: goal.color }]} />
                    </View>

                    <View style={[s.row, { justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }]}>
                      <Text style={{ fontSize: 12, color: C.secondary }}>{pct}% complete</Text>
                      {goal.autoSave != null && (
                        <View style={[s.autoChip, { borderColor: C.separator }]}>
                          <IconSymbol name="clock.fill" size={11} color={GAIN} />
                          <Text style={{ fontSize: 11, fontWeight: '600', color: GAIN, marginLeft: 4 }}>
                            Auto-saving {goal.autoSave}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── 3. APY Earnings ─────────────────────────────────────────────── */}
        <View style={[s.apyCard, { marginTop: 24, marginHorizontal: 16, backgroundColor: C.surface }]}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>APY Earnings</Text>
          {APY_ROWS.map((row, idx) => {
            const valueColor =
              row.colorKey === 'gain'      ? GAIN        :
              row.colorKey === 'secondary' ? C.secondary :
              C.label;
            return (
              <View key={row.label}>
                <View style={[s.row, { justifyContent: 'space-between', paddingVertical: 11 }]}>
                  <Text style={{ fontSize: 14, color: C.label }}>{row.label}</Text>
                  <Text style={{ fontSize: 14, fontWeight: row.bold ? '700' : '400', color: valueColor }}>
                    {row.value}
                  </Text>
                </View>
                {idx < APY_ROWS.length - 1 && (
                  <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator }} />
                )}
              </View>
            );
          })}
        </View>

        {/* ── 4. Ask Dipson ───────────────────────────────────────────────── */}
        <View style={{ marginTop: 24, paddingHorizontal: 16 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Ask Dipson</Text>
          <View style={{ gap: 10 }}>
            {[
              'How much should I save for taxes this quarter?',
              'Set up auto-save 30% of product sales to Tax Reserve',
            ].map(chip => (
              <Pressable
                key={chip}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Dipson', 'Opening Dipson...');
                }}
              >
                <View style={[s.dipsonChip, { backgroundColor: C.surface, borderColor: C.separator }]}>
                  <Text style={{ fontSize: 13, fontStyle: 'italic', color: C.secondary }}>{chip}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        {/* ── 5. Transaction History ──────────────────────────────────────── */}
        <View style={{ marginTop: 24, paddingHorizontal: 16, paddingBottom: 40 }}>
          <Text style={[s.sectionTitle, { color: C.label, marginBottom: 12 }]}>Transaction History</Text>
          <View>
            {TRANSACTIONS.map((tx, idx) => (
              <View
                key={idx}
                style={[
                  s.txRow,
                  {
                    borderBottomColor: C.separator,
                    borderBottomWidth: idx < TRANSACTIONS.length - 1 ? StyleSheet.hairlineWidth : 0,
                  },
                ]}
              >
                <View style={[s.txIcon, {
                  backgroundColor: tx.dir === 'in' ? 'rgba(90,138,110,0.12)' : 'rgba(184,92,92,0.12)',
                }]}>
                  <IconSymbol
                    name={tx.dir === 'in' ? 'arrow.down' : 'arrow.up'}
                    size={14}
                    color={tx.dir === 'in' ? GAIN : HEAT}
                  />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }}>{tx.goal}</Text>
                  <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>{tx.date}</Text>
                </View>

                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: tx.dir === 'in' ? GAIN : HEAT }}>
                    {tx.amount}
                  </Text>
                  <View style={[s.txBadge, { borderColor: C.separator, backgroundColor: C.surface }]}>
                    <Text style={{ fontSize: 10, fontWeight: '600', color: C.secondary }}>
                      {tx.auto ? 'Auto' : 'Manual'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBar: {
      position: 'absolute',
      top: 0, left: 0, right: 0,
      zIndex: 100,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingHorizontal: 12,
      paddingBottom: 8,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    iconBtn: { width: 40, alignItems: 'center' },
    row:     { flexDirection: 'row', alignItems: 'center' },
    hero: {
      borderRadius: 20,
      padding: 24,
      alignItems: 'center',
      gap: 8,
    },
    heroLabel: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.65)',
      fontWeight: '500',
    },
    heroAmount: {
      fontSize: 40,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    sectionTitle: { fontSize: 17, fontWeight: '700' },
    goalCard:     { borderRadius: 12, padding: 16 },
    progressTrack: { height: 4, borderRadius: 2, overflow: 'hidden' },
    progressFill:  { height: 4, borderRadius: 2 },
    autoChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      borderWidth: StyleSheet.hairlineWidth,
    },
    apyCard:    { borderRadius: 12, padding: 16 },
    dipsonChip: { borderRadius: 10, padding: 12, borderWidth: StyleSheet.hairlineWidth },
    txRow:  { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    txIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    txBadge: {
      borderWidth: StyleSheet.hairlineWidth,
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
  });
}
