/**
 * Posting Policy — Admin-only. Mode-aware.
 * Non-admins are redirected to social/index via useFocusEffect.
 *
 * Three options: Off / Post Freely / Approval Required (default)
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, Alert, StyleSheet, Animated,
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
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { useMode } from '@/context/app-context';

// ── Types ─────────────────────────────────────────────────────────────────────

type PolicyOption = 'off' | 'free' | 'approval';

interface PolicyDef {
  key: PolicyOption;
  label: string;
  description: string;
}

// ── Role key map ──────────────────────────────────────────────────────────────

const ROLE_KEY_BY_MODE: Record<string, string> = {
  personal:  'personal:social',
  community: 'community:social',
  sports:    'sports:social',
  business:  'business:social',
  education: 'education:social',
};

// ── Mode-specific policy content ──────────────────────────────────────────────

const GAIN = '#5A8A6E';

const POLICIES_BY_MODE: Record<string, PolicyDef[]> = {
  personal: [
    { key: 'off',      label: 'Off',              description: 'Only you can post. Subscribers consume only.' },
    { key: 'free',     label: 'Post Freely',       description: 'Subscribers can post freely. Shows immediately. You can delete any post.' },
    { key: 'approval', label: 'Approval Required', description: 'Subscriber posts go to your queue. You approve before publishing.' },
  ],
  community: [
    { key: 'off',      label: 'Off',              description: 'Only you and leaders can post. Members consume only.' },
    { key: 'free',     label: 'Post Freely',       description: 'Members can post freely. Shows immediately. You can delete any post.' },
    { key: 'approval', label: 'Approval Required', description: 'Member posts go to moderation queue. You approve before publishing.' },
  ],
  sports: [
    { key: 'off',      label: 'Off',              description: 'Only coaches can post. Players consume only.' },
    { key: 'free',     label: 'Post Freely',       description: 'Players can post freely. Shows immediately. You can delete any post.' },
    { key: 'approval', label: 'Approval Required', description: 'Player posts go to review queue. You approve before publishing.' },
  ],
  business: [
    { key: 'off',      label: 'Off',              description: 'Only managers and above can post. Clients consume only.' },
    { key: 'free',     label: 'Post Freely',       description: 'Clients can post freely. Shows immediately. You can delete any post.' },
    { key: 'approval', label: 'Approval Required', description: 'Client posts go to moderation queue. You approve before publishing.' },
  ],
  education: [
    { key: 'off',      label: 'Off',              description: 'Only faculty and admin can post. Students consume only.' },
    { key: 'free',     label: 'Post Freely',       description: 'Students can post freely. Shows immediately. You can delete any post.' },
    { key: 'approval', label: 'Approval Required', description: 'Student posts go to faculty review queue. You approve before publishing.' },
  ],
};

const POLICY_NOTE_BY_MODE: Record<string, Record<PolicyOption, string>> = {
  personal: {
    off:      'Subscribers can browse the feed but will not see a compose button. Only you can create posts.',
    free:     'Subscribers post without review. Monitor the feed and remove anything that violates your guidelines.',
    approval: 'All subscriber submissions land in your queue. Nothing publishes without your approval.',
  },
  community: {
    off:      'Members can browse the feed but will not see a compose button. Only pastors and leaders can create posts.',
    free:     'Members post without review. Monitor the feed regularly and remove anything that violates community guidelines.',
    approval: 'All member submissions land in your drafts queue. Nothing publishes without your explicit approval. Recommended for most communities.',
  },
  sports: {
    off:      'Players can browse the feed but will not see a compose button. Only coaches can create posts.',
    free:     'Players post without review. Monitor the feed and remove anything that does not align with team standards.',
    approval: 'All player submissions land in your review queue. Nothing publishes without your approval. Recommended for programs with social media policies.',
  },
  business: {
    off:      'Clients can browse the feed but will not see a compose button. Only managers and above can create posts.',
    free:     'Clients post without review. Monitor regularly and remove anything off-brand or inappropriate.',
    approval: 'All client submissions land in your moderation queue. Nothing publishes without approval. Recommended for regulated industries.',
  },
  education: {
    off:      'Students can browse the feed but will not see a compose button. Only faculty and administrators can create posts.',
    free:     'Students post without review. Monitor the feed and enforce community standards.',
    approval: 'All student submissions go to faculty review. Nothing publishes without approval. Recommended for most educational institutions.',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function PostingPolicyPage() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const s       = useMemo(() => makeStyles(C), [C]);
  const mode    = useMode();
  const modeKey = mode ?? 'personal';
  const roleKey = ROLE_KEY_BY_MODE[modeKey] ?? 'personal:social';

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey as any);
  const isAdmin = role === roleCycles[0];

  const policies  = POLICIES_BY_MODE[modeKey]  ?? POLICIES_BY_MODE.personal;
  const policyNote = POLICY_NOTE_BY_MODE[modeKey] ?? POLICY_NOTE_BY_MODE.personal;

  const [policy, setPolicy] = useState<PolicyOption>('approval');

  useFocusEffect(useCallback(() => {
    resetFooter();
    if (!isAdmin) {
      router.replace('/(tabs)/(main)/social' as any);
    }
  }, [isAdmin]));

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Policy Saved', `Posting policy set to: ${policies.find(p => p.key === policy)?.label ?? policy}.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, borderBottomWidth: StyleSheet.hairlineWidth, opacity }]}>
        <View style={s.topBar}>
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
            <RolePill role={role} onPress={cycleRole} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={{ paddingTop: insets.top + 52 + 8, paddingBottom: insets.bottom + 100, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        <View style={{ height: 20 }} />

        {/* ── Policy Options ── */}
        <View style={{ gap: 10, marginBottom: 20 }}>
          {policies.map((p) => {
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
          <Text style={[s.noteText, { color: C.secondary }]}>{policyNote[policy]}</Text>
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
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10 },
    topBar: {
      height: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    },
    kBtn:        { width: 44, alignItems: 'flex-start' },
    titleWrap:   { flex: 1, alignItems: 'center' },
    titlePill:   { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1 },
    titleText:   { fontSize: 13, fontWeight: '700' },
    rolePillWrap:{ alignItems: 'flex-end', flexShrink: 0 },

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
