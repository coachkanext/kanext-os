import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

const MODES = ['Sports', 'Business', 'Faith', 'Education', 'Personal'];

const ACTIVE_NUMBERS = [
  { mode: 'Sports', number: '+1 (305) 555-0182', status: 'Active' },
  { mode: 'Business', number: '+1 (786) 555-0291', status: 'Active' },
];

export default function PhoneNumbersScreen() {
  const C = useColors();
  const styles = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const activeMap = Object.fromEntries(ACTIVE_NUMBERS.map(n => [n.mode, n]));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="chevron.left" size={20} color={C.label} />
        </Pressable>
        <Text style={styles.title}>Phone Numbers</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.group, { backgroundColor: C.surface }]}>
          {MODES.map((mode, i) => {
            const active = activeMap[mode];
            return (
              <React.Fragment key={mode}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: C.separator }]} />}
                {active ? (
                  <View style={styles.row}>
                    <View style={styles.rowContent}>
                      <Text style={[styles.number, { color: C.label }]}>{active.number}</Text>
                      <View style={styles.badges}>
                        <View style={styles.modePill}>
                          <Text style={styles.modePillText}>{mode}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: '#D1FAE5' }]}>
                          <Text style={[styles.statusText, { color: '#065F46' }]}>{active.status}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  <Pressable style={({ pressed }) => [styles.row, { opacity: pressed ? 0.6 : 1 }]}>
                    <View style={[styles.addIcon, { backgroundColor: C.separator }]}>
                      <IconSymbol name="plus" size={16} color={C.secondary} />
                    </View>
                    <Text style={[styles.addLabel, { color: C.muted }]}>Add {mode} number</Text>
                  </Pressable>
                )}
              </React.Fragment>
            );
          })}
        </View>

        <View style={[styles.infoCard, { backgroundColor: C.surface }]}>
          <Text style={[styles.infoText, { color: C.muted }]}>
            KaNeXT numbers work over WiFi. On-network and international calls are free.
          </Text>
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
  group: { marginHorizontal: 16, borderRadius: 14, overflow: 'hidden' },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowContent: { flex: 1 },
  number: { fontSize: 15, fontWeight: '500' },
  badges: { flexDirection: 'row', gap: 6, marginTop: 4 },
  modePill: {
    backgroundColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  modePillText: { fontSize: 11, fontWeight: '500', color: '#374151' },
  statusBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 11, fontWeight: '600' },
  addIcon: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: 'center', justifyContent: 'center',
  },
  addLabel: { fontSize: 15, fontWeight: '400' },
  infoCard: { marginHorizontal: 16, marginTop: 24, borderRadius: 14, padding: 16 },
  infoText: { fontSize: 13, lineHeight: 18, textAlign: 'center' },
});
