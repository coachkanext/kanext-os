/**
 * Posting Policy — Community Mode, Pastor only.
 * Members are redirected to social/index via useFocusEffect.
 *
 * Three options: Off / Post Freely / Approval Required (default)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';

// ── Types ─────────────────────────────────────────────────────────────────────

type PolicyOption = 'off' | 'free' | 'approval';

// ── Policy definitions ────────────────────────────────────────────────────────

const GAIN = '#5A8A6E';

const POLICIES: { key: PolicyOption; label: string; description: string }[] = [
  {
    key: 'off',
    label: 'Off',
    description: 'Only you and leaders can post. Members consume only.',
  },
  {
    key: 'free',
    label: 'Post Freely',
    description: 'Members can post freely. Shows immediately. You can delete any post.',
  },
  {
    key: 'approval',
    label: 'Approval Required',
    description: 'Member posts go to moderation queue. You approve before publishing.',
  },
];

const POLICY_NOTE: Record<PolicyOption, string> = {
  off:      'Members can browse the feed but will not see a compose button. Only pastors and leaders can create posts.',
  free:     'Members post without review. Monitor the feed regularly and remove anything that violates community guidelines.',
  approval: 'All member submissions land in your drafts queue. Nothing publishes without your explicit approval. Recommended for most communities.',
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PostingPolicyPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const s       = useMemo(() => makeStyles(C), [C]);

  const [role, cycleRole, roleCycles] = useDemoRole('community:social');
  const isPastor = role === roleCycles[0];

  const [policy, setPolicy] = useState<PolicyOption>('approval');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isPastor) {
      router.replace('/(tabs)/(main)/social' as any);
    }
  }, [isPastor]));

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Policy Saved', `Posting policy set to: ${POLICIES.find(p => p.key === policy)?.label ?? policy}.`);
  };

  const topBarH = insets.top + 52;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg }]}>
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
          style={s.kBtn}
        >
          <KMenuButton />
        </Pressable>
        <View style={s.titleWrap}>
          <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[s.titleText, { color: C.label }]}>Posting Policy</Text>
          </View>
        </View>
        <View style={s.rolePillWrap}>
          <RolePill role={role} onPress={cycleRole} isPrimary={isPastor} />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Policy Options ── */}
        <View style={{ gap: 10, marginBottom: 20 }}>
          {POLICIES.map((p) => {
            const selected = policy === p.key;
            return (
              <Pressable
                key={p.key}
                onPress={() => { Haptics.selectionAsync(); setPolicy(p.key); }}
                style={({ pressed }) => [
                  s.optionRow,
                  { backgroundColor: C.surface, borderColor: selected ? C.label : C.separator },
                  pressed && { opacity: 0.8 },
                ]}
              >
                <IconSymbol
                  name={selected ? 'checkmark.circle.fill' : 'circle'}
                  size={22}
                  color={selected ? GAIN : C.secondary}
                />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.optionLabel, { color: C.label }]}>{p.label}</Text>
                  <Text style={[s.optionDesc, { color: C.secondary }]}>{p.description}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* ── Note Card ── */}
        <View style={[s.noteCard, { backgroundColor: C.surface }]}>
          <Text style={[s.noteText, { color: C.secondary }]}>{POLICY_NOTE[policy]}</Text>
        </View>

      </ScrollView>

      {/* ── Save Button ───────────────────────────────────────────────────── */}
      <View style={[s.saveWrap, { paddingBottom: insets.bottom + 61, backgroundColor: C.bg }]}>
        <Pressable
          onPress={handleSave}
          style={({ pressed }) => [s.saveBtn, { backgroundColor: C.label, opacity: pressed ? 0.8 : 1 }]}
        >
          <Text style={[s.saveBtnText, { color: C.bg }]}>Save Policy</Text>
        </Pressable>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0,
      zIndex: 10, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    },
    kBtn:        { width: 40, alignItems: 'center' },
    titleWrap:   { flex: 1, alignItems: 'center' },
    titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:   { fontSize: 13, fontWeight: '700' },
    rolePillWrap:{ alignItems: 'flex-end' },

    optionRow: {
      flexDirection: 'row', alignItems: 'flex-start', gap: 14,
      padding: 14, borderRadius: 14, borderWidth: 1.5,
    },
    optionLabel: { fontSize: 15, fontWeight: '600' },
    optionDesc:  { fontSize: 13, lineHeight: 18 },

    noteCard: { borderRadius: 12, padding: 14, marginTop: 4 },
    noteText:  { fontSize: 13, lineHeight: 19 },

    saveWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 49 },
    saveBtn:  { borderRadius: 12, paddingVertical: 15, alignItems: 'center' },
    saveBtnText: { fontSize: 15, fontWeight: '700' },
  });
}
