/**
 * KayPay — Tax Center
 * YTD earnings/spending, quarterly estimates, tax reserve, 1099 docs, export.
 * Personal mode · KayPay tile · Owner + Follower views.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View, Text, StyleSheet, Pressable, ScrollView, Alert, Animated,
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
import { useMode } from '@/context/app-context';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 54;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';
// ── Static data ───────────────────────────────────────────────────────────────

const OWNER_CATEGORIES = [
  { cat: 'Subscriptions',    amount: '$3,300.00' },
  { cat: 'Digital Products', amount: '$2,450.00' },
  { cat: 'Brand Deals',      amount: '$1,800.00' },
  { cat: 'Services',         amount: '$720.00'   },
  { cat: 'Tips',             amount: '$420.00'   },
  { cat: 'Affiliate',        amount: '$247.00'   },
];

const FOLLOWER_CATEGORIES = [
  { cat: 'Subscriptions',    amount: '$175.00' },
  { cat: 'Digital Products', amount: '$209.99' },
  { cat: 'Tips Sent',        amount: '$47.00'  },
  { cat: 'Services',         amount: '$55.24'  },
];

const DOC_ROWS = [
  { id: 'd1', title: '1099-K (2025)'   },
  { id: 'd2', title: '1099-K (2024)'   },
  { id: 'd3', title: '1099-NEC (2024)' },
];

const EXPORT_ROWS = [
  { id: 'e1', label: 'Export All Transactions',     isLast: false },
  { id: 'e2', label: 'Export Earnings by Category', isLast: false },
  { id: 'e3', label: 'Export Expenses',             isLast: true  },
];

// ── Helper ────────────────────────────────────────────────────────────────────

const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function TaxScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const mode = useMode();
  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:kaypay' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:kaypay';
  const [role, cycleRole, roleCycles] = useDemoRole(_rk);
  const isOwner = role === roleCycles[0];

  const totalTopH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(totalTopH);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  // ── Owner View ──────────────────────────────────────────────────────────

  const ownerView = (
    <>
      {/* 1. YTD Earnings Summary */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>YTD Earnings Summary</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={[s.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>2026 Year-to-Date</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: GAIN }}>$8,937.00</Text>
          </View>
          {OWNER_CATEGORIES.map((item, idx) => (
            <View
              key={item.cat}
              style={[
                s.row,
                {
                  borderBottomWidth: idx < OWNER_CATEGORIES.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                },
              ]}
            >
              <Text style={{ fontSize: 15, color: C.secondary }}>{item.cat}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{item.amount}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 2. Estimated Quarterly Tax */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Estimated Quarterly Tax</Text>
        <View style={[s.card, { backgroundColor: C.surface, padding: 16 }]}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, marginBottom: 4 }}>Q2 2026 Estimate</Text>
          <Text style={{ fontSize: 28, fontWeight: '700', color: HEAT }}>$2,009.33</Text>
          <Text style={{ fontSize: 14, color: C.secondary, marginTop: 2 }}>Due: June 15, 2026</Text>
          <Pressable
            onPress={() => { tap(); Alert.alert('KPay', 'Redirecting to IRS payment portal…'); }}
            style={({ pressed }) => ({
              backgroundColor: HEAT,
              borderRadius: 10,
              marginTop: 12,
              paddingVertical: 12,
              alignItems: 'center',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '600' }}>Pay Estimated Tax</Text>
          </Pressable>
          <Text style={{ fontSize: 12, color: C.secondary, marginTop: 10 }}>
            Based on 22.5% effective rate
          </Text>
        </View>
      </View>

      {/* 3. Tax Reserve */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Tax Reserve</Text>
        <View style={[s.card, { backgroundColor: C.surface, padding: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label, flex: 1, paddingRight: 8 }}>
              Tax Reserve (Savings Goal)
            </Text>
            <Text style={{ fontSize: 14, fontWeight: '700', color: GAIN }}>$1,240.00 saved</Text>
          </View>
          <View style={{ height: 4, borderRadius: 2, backgroundColor: C.separator, overflow: 'hidden', marginBottom: 8 }}>
            <View style={{ width: '41%', height: '100%', backgroundColor: GAIN, borderRadius: 2 }} />
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text style={{ fontSize: 12, color: C.secondary }}>41% of $3,000 target</Text>
            <View style={{ backgroundColor: GAIN + '22', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '600', color: GAIN }}>30% of earnings auto-saved</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN, marginBottom: 8 }}>On Track ✓</Text>
          <Pressable onPress={() => tap()}>
            <Text style={{ fontSize: 13, color: C.secondary }}>View in Invest →</Text>
          </Pressable>
        </View>
      </View>

      {/* 4. 1099 Documents */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>1099 Documents</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {DOC_ROWS.map((doc, idx) => (
            <View
              key={doc.id}
              style={[s.row, {
                borderBottomWidth: idx < DOC_ROWS.length - 1 ? StyleSheet.hairlineWidth : 0,
                borderBottomColor: C.separator,
              }]}
            >
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{doc.title}</Text>
              <Text style={{ fontSize: 13, fontWeight: '600', color: GAIN, marginRight: 10 }}>Ready</Text>
              <Pressable onPress={() => { tap(); Alert.alert('KPay', `Downloading ${doc.title}…`); }}>
                <IconSymbol name="arrow.down.circle" size={22} color={GAIN} />
              </Pressable>
            </View>
          ))}
        </View>
      </View>

      {/* 5. Export for Accountant */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Export for Accountant</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          {EXPORT_ROWS.map((row) => (
            <Pressable
              key={row.id}
              onPress={() => { tap(); Alert.alert('KPay', 'Generating export…'); }}
              style={({ pressed }) => ([
                s.row,
                {
                  backgroundColor: pressed ? C.separator : 'transparent',
                  borderBottomWidth: row.isLast ? 0 : StyleSheet.hairlineWidth,
                  borderBottomColor: C.separator,
                },
              ])}
            >
              <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>{row.label}</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* 6. Filing Status */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Filing Status</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Pressable
            onPress={() => tap()}
            style={({ pressed }) => ([
              s.row,
              {
                backgroundColor: pressed ? C.separator : 'transparent',
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: C.separator,
              },
            ])}
          >
            <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Filing Status</Text>
            <Text style={{ fontSize: 14, color: C.secondary, marginRight: 6 }}>Single</Text>
            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
          <View style={s.row}>
            <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Tax Year</Text>
            <Text style={{ fontSize: 14, color: C.secondary }}>2026</Text>
          </View>
        </View>
      </View>
    </>
  );

  // ── Follower View ───────────────────────────────────────────────────────

  const followerView = (
    <>
      {/* 1. YTD Spending Summary */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>YTD Spending Summary</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <View style={[s.row, { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator }]}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>2026 Year-to-Date</Text>
            <Text style={{ fontSize: 20, fontWeight: '700', color: C.label }}>$487.23</Text>
          </View>
          {FOLLOWER_CATEGORIES.map((item, idx) => (
            <View
              key={item.cat}
              style={[
                s.row,
                {
                  borderBottomWidth: idx < FOLLOWER_CATEGORIES.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: C.separator,
                },
              ]}
            >
              <Text style={{ fontSize: 15, color: C.secondary }}>{item.cat}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>{item.amount}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 2. Tax Deductions */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Tax Deductions</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Pressable
            onPress={() => { tap(); Alert.alert('KPay', 'Review your potential business deductions.'); }}
            style={({ pressed }) => ([
              s.row,
              {
                backgroundColor: pressed ? C.separator : 'transparent',
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: C.separator,
              },
            ])}
          >
            <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Business Expenses</Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: CAUTION, marginRight: 6 }}>$209.99</Text>
            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
          <View style={{ padding: 12 }}>
            <Text style={{ fontSize: 12, color: C.secondary, lineHeight: 17 }}>
              3 purchases may qualify as business deductions. Consult your tax advisor.
            </Text>
          </View>
        </View>
      </View>

      {/* 3. Export */}
      <View>
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Export</Text>
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Pressable
            onPress={() => { tap(); Alert.alert('KPay', 'Generating CSV export…'); }}
            style={({ pressed }) => ([
              s.row,
              {
                backgroundColor: pressed ? C.separator : 'transparent',
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: C.separator,
              },
            ])}
          >
            <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Download Purchase History (CSV)</Text>
            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
          <Pressable
            onPress={() => { tap(); Alert.alert('KPay', 'Generating PDF export…'); }}
            style={({ pressed }) => ([
              s.row,
              { backgroundColor: pressed ? C.separator : 'transparent' },
            ])}
          >
            <Text style={{ fontSize: 15, color: C.label, flex: 1 }}>Download Purchase History (PDF)</Text>
            <IconSymbol name="chevron.right" size={13} color={C.secondary} />
          </Pressable>
        </View>
      </View>
    </>
  );

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { backgroundColor: C.bg, borderBottomColor: C.separator, paddingTop: insets.top, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { tap(); openSidePanel(); }} style={{ width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' }}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Tax Center</Text>
            </View>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{
          paddingTop: totalTopH + 16,
          paddingBottom: insets.bottom + 40,
          gap: 20,
        }}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        showsVerticalScrollIndicator={false}
      >
        {isOwner ? ownerView : followerView}
      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
    titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    card: { marginHorizontal: 16, borderRadius: 12, overflow: 'hidden' },
    sectionHeader: {
      fontSize: 12, fontWeight: '600', letterSpacing: 0.5,
      textTransform: 'uppercase', paddingHorizontal: 16,
      marginBottom: 6,
    },
    row: {
      height: 50, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
  });
}
