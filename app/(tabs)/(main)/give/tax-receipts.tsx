/**
 * Tax Receipts — Pastor only (MANAGE section).
 * Redirects Member to give/index in useFocusEffect.
 * Search bar, member list with "Send Receipt" button, Annual Statement Export at bottom.
 */

import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert, TextInput } from 'react-native';
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

const TOP_BAR_H = 52;

const MEMBERS = [
  { name: 'Marcus Johnson', email: 'marcus@example.com', ytd: 3600  },
  { name: 'Aisha Williams', email: 'aisha@example.com',  ytd: 2400  },
  { name: 'David Chen',     email: 'david@example.com',  ytd: 6000  },
  { name: 'Sarah Thompson', email: 'sarah@example.com',  ytd: 900   },
  { name: 'James Okafor',   email: 'james@example.com',  ytd: 1200  },
];

export default function TaxReceiptsScreen() {
  const C      = useColors();
  const s      = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, cycleRole, roleCycles] = useDemoRole('community:give');
  const isPastor = role === roleCycles[0];
  const [search, setSearch] = useState('');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/give' as any);
    }
  }, [isPastor]));

  const filtered = MEMBERS.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <Pressable style={s.kBtn} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8}>
          <KMenuButton />
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Tax Receipts</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingHorizontal: 16, paddingBottom: insets.bottom + 80, gap: 12 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Search */}
        <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <IconSymbol name="magnifyingglass" size={15} color={C.secondary} />
          <TextInput
            style={[s.searchInput, { color: C.label }]}
            placeholder="Search members..."
            placeholderTextColor={C.secondary}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
        </View>

        {/* Member list */}
        <View style={[s.listCard, { backgroundColor: C.surface }]}>
          {filtered.map((m, i) => (
            <View
              key={m.name}
              style={[
                s.memberRow,
                i < filtered.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator },
              ]}
            >
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={[s.memberName, { color: C.label }]}>{m.name}</Text>
                <Text style={[s.memberEmail, { color: C.secondary }]}>{m.email} · YTD ${m.ytd.toLocaleString()}</Text>
              </View>
              <Pressable
                style={[s.sendBtn, { backgroundColor: C.label }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  Alert.alert('Receipt Sent', `Tax receipt sent to ${m.name} at ${m.email}.`, [{ text: 'OK' }]);
                }}
              >
                <Text style={[s.sendBtnText, { color: C.bg }]}>Send</Text>
              </Pressable>
            </View>
          ))}
          {filtered.length === 0 && (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <Text style={[s.memberEmail, { color: C.secondary }]}>No members found.</Text>
            </View>
          )}
        </View>

        {/* Annual Statement Export */}
        <Pressable
          style={[s.exportBtn, { backgroundColor: C.label }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Alert.alert('Annual Statements', 'Sending 2025 annual giving statements to all members...', [{ text: 'OK' }]);
          }}
        >
          <IconSymbol name="doc.text.fill" size={16} color={C.bg} />
          <Text style={[s.exportBtnText, { color: C.bg }]}>Export Annual Statements</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:    { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingBottom: 10, paddingHorizontal: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    kBtn:         { width: 44, height: 36, justifyContent: 'center' },
    titlePill:    { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:    { fontSize: 13, fontWeight: '700' },
    rolePillWrap: { width: 44 + 32, alignItems: 'flex-end', justifyContent: 'center' },

    searchBar: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10,
    },
    searchInput: { flex: 1, fontSize: 14 },

    listCard:    { borderRadius: 12, overflow: 'hidden' },
    memberRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
    memberName:  { fontSize: 14, fontWeight: '600' },
    memberEmail: { fontSize: 12 },
    sendBtn:     { borderRadius: 10, paddingVertical: 6, paddingHorizontal: 14 },
    sendBtnText: { fontSize: 13, fontWeight: '600' },

    exportBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 14 },
    exportBtnText:{ fontSize: 15, fontWeight: '700' },
  });
}
