import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

export default function WalletSettingsScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [autoTopUp, setAutoTopUp] = useState(false);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Wallet Settings</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Balance */}
        <View style={[styles.balanceCard, { backgroundColor: C.surface }]}>
          <Text style={[styles.balanceLabel, { color: C.muted }]}>Balance</Text>
          <Text style={[styles.balanceAmount, { color: C.label }]}>$1,247.50</Text>
          <Text style={styles.apy}>Earning 4.00% APY</Text>
        </View>

        {/* Settings */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>SETTINGS</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Auto Top-Up</Text>
            <Switch
              value={autoTopUp}
              onValueChange={setAutoTopUp}
              trackColor={{ false: 'rgba(0,0,0,0.12)', true: '#111' }}
              thumbColor="#FFF"
            />
          </View>
          {autoTopUp && (
            <>
              <View style={[styles.divider, { backgroundColor: C.separator }]} />
              <Pressable style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label }]}>Threshold</Text>
                <Text style={[styles.rowValue, { color: C.muted }]}>When below $25</Text>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
              <View style={[styles.divider, { backgroundColor: C.separator }]} />
              <Pressable style={styles.row}>
                <Text style={[styles.rowLabel, { color: C.label }]}>Top-up amount</Text>
                <Text style={[styles.rowValue, { color: C.muted }]}>Add $100</Text>
                <IconSymbol name="chevron.right" size={14} color={C.muted} />
              </Pressable>
            </>
          )}
          <View style={[styles.divider, { backgroundColor: C.separator }]} />
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Funding Source</Text>
            <Text style={[styles.rowValue, { color: C.muted }]}>Chase ••4821</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>

        {/* Transaction History */}
        <Text style={[styles.sectionLabel, { color: C.muted }]}>HISTORY</Text>
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          <Pressable style={styles.row}>
            <Text style={[styles.rowLabel, { color: C.label }]}>Transaction History</Text>
            <IconSymbol name="chevron.right" size={14} color={C.muted} />
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F6F6F6' },
  topBar: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 8, paddingVertical: 4, minHeight: 44,
  },
  backBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: 18 },
  title: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '600', color: C.label },
  content: { paddingTop: 24 },
  balanceCard: {
    marginHorizontal: 16, borderRadius: 14, padding: 24, alignItems: 'center',
  },
  balanceLabel: { fontSize: 13, marginBottom: 6 },
  balanceAmount: { fontSize: 36, fontWeight: '700' },
  apy: { fontSize: 13, fontWeight: '600', color: '#22C55E', marginTop: 6 },
  sectionLabel: {
    fontSize: 12, fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: 0.7, paddingHorizontal: 32, paddingTop: 20, paddingBottom: 6,
  },
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 8,
  },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  rowValue: { fontSize: 14 },
});
