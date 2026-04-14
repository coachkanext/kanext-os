/**
 * Danger Zone Settings — Ownership transfer, brand archive/delete,
 * and account deactivation/deletion. All destructive actions.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { resetFooter } from '@/utils/global-footer-hide';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 44;
const HEAT    = '#B85C5C';
const CAUTION = '#B8943E';

export default function DangerZoneSettingsScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const s      = useMemo(() => makeStyles(C), [C]);

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); router.back(); }} hitSlop={8} style={s.topBarBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.pillText, { color: C.label }]}>Danger Zone</Text>
            </View>
          </View>
          <View style={s.topBarBtn} />
        </View>
      </Animated.View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 8, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Warning Banner */}
        <View style={[s.warningBanner, { borderColor: HEAT + '44', backgroundColor: HEAT + '11' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <IconSymbol name="exclamationmark.triangle.fill" size={18} color={HEAT} style={{ marginTop: 1 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '800', color: HEAT, marginBottom: 4 }}>Danger Zone</Text>
              <Text style={[s.warningDesc, { color: C.secondary }]}>
                Actions below are permanent or difficult to reverse. Proceed with extreme caution.
              </Text>
            </View>
          </View>
        </View>

        {/* OWNERSHIP */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>OWNERSHIP</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="arrow.triangle.2.circlepath" size={18} color={CAUTION} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: CAUTION }}>Transfer Ownership</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Pass all admin control to another member. You will lose Owner access.
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={CAUTION} />
          </Pressable>
        </GlassView>

        {/* BRAND STATUS */}
        <Text style={[s.sectionLabel, { color: C.secondary }]}>BRAND STATUS</Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="archivebox.fill" size={18} color={CAUTION} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: CAUTION }}>Archive Brand</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Temporarily deactivates your brand. Reversible. Members lose access.
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={CAUTION} />
          </Pressable>
        </GlassView>

        {/* Delete Brand — standalone styled View */}
        <View style={[s.deleteBrandCard, { borderColor: HEAT + '44', backgroundColor: HEAT + '08' }]}>
          <Text style={{ fontSize: 17, fontWeight: '800', color: HEAT, marginBottom: 8 }}>Delete Brand</Text>
          <Text style={[s.deleteBrandDesc, { color: C.secondary }]}>
            Permanently deletes your brand and all associated data. This cannot be undone after a 30-day grace period. Members will lose all access immediately.
          </Text>
          <Pressable
            onPress={() => haptic()}
            style={[s.deleteBtn, { borderColor: HEAT, backgroundColor: HEAT + '22' }]}
          >
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              <IconSymbol name="trash.fill" size={16} color={HEAT} />
              <Text style={{ fontSize: 15, fontWeight: '700', color: HEAT }}>Delete Brand</Text>
            </View>
          </Pressable>
        </View>

        {/* ACCOUNT */}
        <Text style={[s.sectionLabel, { color: C.secondary, marginTop: 32 }]}>ACCOUNT</Text>
        <Text style={[s.accountNote, { color: C.secondary }]}>
          Account actions below affect your entire KaNeXT account, not just this brand.
        </Text>
        <GlassView tier={1} style={s.card}>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface }]}
          >
            <IconSymbol name="pause.circle.fill" size={18} color={CAUTION} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: CAUTION }}>Deactivate Account</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Temporarily disables your account. Reversible.
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={CAUTION} />
          </Pressable>
          <Pressable
            onPress={() => haptic()}
            style={[s.row, { backgroundColor: C.surface, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
          >
            <IconSymbol name="trash.circle.fill" size={18} color={HEAT} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontWeight: '600', color: HEAT }}>Delete Account</Text>
              <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }}>
                Permanently deletes your KaNeXT account. 30-day grace period.
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={13} color={HEAT} />
          </Pressable>
        </GlassView>
      </ScrollView>
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },
    topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
    topBar: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 12, paddingBottom: 6, height: TOP_BAR_H,
    },
    topBarBtn: { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    pill:      { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    pillText:  { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },

    warningBanner: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      borderWidth: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    warningDesc: {
      fontSize: 13,
      lineHeight: 19,
    },

    sectionLabel: {
      fontSize: 11, fontWeight: '700', letterSpacing: 0.6,
      textTransform: 'uppercase',
      paddingHorizontal: 16, marginBottom: 6, marginTop: 24,
    },
    card: { borderRadius: 12, overflow: 'hidden', marginHorizontal: 16 },
    row:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 14 },

    deleteBrandCard: {
      marginHorizontal: 16,
      marginTop: 16,
      borderRadius: 12,
      borderWidth: 1,
      padding: 16,
    },
    deleteBrandDesc: {
      fontSize: 13,
      lineHeight: 19,
      marginBottom: 16,
    },
    deleteBtn: {
      height: 48,
      borderRadius: 10,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },

    accountNote: {
      fontSize: 13,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
  });
}
