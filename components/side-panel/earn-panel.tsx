/**
 * Earn Side Panel — revenue command center tools.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { closeSidePanel } from '@/utils/global-side-panel';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { EARN_STATS, PRODUCTS, formatMoney, formatMoneyFull } from '@/data/mock-earn';

export function EarnPanel() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);

  const close = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    closeSidePanel();
  };

  const topProducts = PRODUCTS.slice(0, 3);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: C.accent + '20' }]}>
          <IconSymbol name="dollarsign.circle.fill" size={18} color={C.accent} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={[styles.headerName, { color: C.label }]}>Earn</Text>
          <Text style={[styles.headerSub, { color: C.secondary }]}>
            {formatMoneyFull(EARN_STATS.balance)} available
          </Text>
        </View>
      </View>

      {/* Quick Stats */}
      <View style={[styles.statsRow, { backgroundColor: C.surface, borderRadius: 12 }]}>
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: C.label }]}>{formatMoney(EARN_STATS.thisMonth)}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Today's Rev.</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: C.separator }]} />
        <View style={styles.statCell}>
          <Text style={[styles.statValue, { color: C.label }]}>{formatMoney(EARN_STATS.pendingBalance)}</Text>
          <Text style={[styles.statLabel, { color: C.secondary }]}>Pending</Text>
        </View>
      </View>

      {/* Navigate */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>NAVIGATE</Text>
        {[
          { icon: 'chart.line.uptrend.xyaxis', label: 'Earnings'  },
          { icon: 'bag.fill',                  label: 'Products'  },
          { icon: 'banknote.fill',             label: 'Payouts'   },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={close}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={15} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>

      {/* Top Products */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>TOP PRODUCTS</Text>
        {topProducts.map(p => (
          <Pressable
            key={p.id}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={close}
          >
            <Text style={{ fontSize: 20 }}>{p.thumbEmoji}</Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={[styles.navLabel, { color: C.label }]} numberOfLines={1}>{p.title}</Text>
              <Text style={[styles.navSub, { color: C.muted }]}>{p.salesCount} sales</Text>
            </View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.accent }}>{formatMoney(p.revenue)}</Text>
          </Pressable>
        ))}
      </View>

      {/* Quick Payout */}
      <View style={styles.section}>
        <Pressable
          style={({ pressed }) => [styles.payoutBtn, { backgroundColor: C.accent, opacity: pressed ? 0.85 : 1 }]}
          onPress={close}
        >
          <IconSymbol name="arrow.down.circle.fill" size={16} color="#fff" />
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Withdraw {formatMoneyFull(EARN_STATS.balance)}</Text>
        </Pressable>
      </View>

      {/* Tools */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: C.secondary }]}>TOOLS</Text>
        {[
          { icon: 'tag.fill',             label: 'Pricing Manager'  },
          { icon: 'doc.text.fill',        label: 'Tax Center'       },
          { icon: 'person.2.fill',        label: 'Subscriber Health'},
          { icon: 'gear',                 label: 'Payout Settings'  },
        ].map(item => (
          <Pressable
            key={item.label}
            style={({ pressed }) => [styles.navRow, { backgroundColor: pressed ? C.surfacePressed : 'transparent' }]}
            onPress={close}
          >
            <View style={[styles.navIcon, { backgroundColor: C.surfacePressed }]}>
              <IconSymbol name={item.icon as any} size={15} color={C.label} />
            </View>
            <Text style={[styles.navLabel, { color: C.label }]}>{item.label}</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container:   { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingBottom: 20, marginBottom: 4,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
  },
  iconBadge:   { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerName:  { fontSize: 15, fontWeight: '700' },
  headerSub:   { fontSize: 12, marginTop: 1 },
  statsRow:    { flexDirection: 'row', marginTop: 16, padding: 12 },
  statCell:    { flex: 1, alignItems: 'center' },
  statValue:   { fontSize: 16, fontWeight: '700' },
  statLabel:   { fontSize: 10, marginTop: 2 },
  statDivider: { width: StyleSheet.hairlineWidth, height: '100%' },
  section:     { marginTop: 20 },
  sectionTitle:{ fontSize: 11, fontWeight: '700', letterSpacing: 0.6, marginBottom: 8 },
  navRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 8, borderRadius: 10, paddingHorizontal: 2,
  },
  navIcon:  { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  navLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  navSub:   { fontSize: 11, marginTop: 1 },
  payoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 12, paddingVertical: 12,
  },
});
