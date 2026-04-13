/**
 * Portfolio — Press screen.
 */
import React, { useCallback, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { RolePill } from '@/components/ui/role-pill';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { PORTFOLIO_PRESS, type PortfolioPress } from '@/data/mock-portfolio';

const TOP_BAR_H = 52;

function hsl(hue: number, s = 35, l = 58, a = 1): string {
  return `hsla(${hue}, ${s}%, ${l}%, ${a})`;
}

export default function PressScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C), [C]);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }} hitSlop={8} style={s.kBtn}>
            <KMenuButton />
          </Pressable>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Press</Text>
            </View>
          </View>
          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>PRESS COVERAGE</Text>
          {isOwner && (
            <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus" size={13} color={C.secondary} />
              <Text style={[s.addBtnText, { color: C.secondary }]}>Add</Text>
            </Pressable>
          )}
        </View>

        <GlassView tier={1} style={s.card}>
          {PORTFOLIO_PRESS.map((item, idx) => (
            <PressRow key={item.id} item={item} isFirst={idx === 0} C={C} s={s} />
          ))}
        </GlassView>
      </ScrollView>
    </View>
  );
}

function PressRow({ item, isFirst, C, s }: { item: PortfolioPress; isFirst: boolean; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <Pressable
      style={({ pressed }) => [
        s.pressRow,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator },
        pressed && { opacity: 0.7 },
      ]}
      onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
    >
      <View style={[s.pressIconCircle, { backgroundColor: hsl(item.hue, 30, 60, 0.15) }]}>
        <Text style={[s.pressInitials, { color: hsl(item.hue, 35, 40, 0.85) }]}>{item.initials}</Text>
      </View>
      <View style={s.pressBody}>
        <Text style={[s.pressTitle, { color: C.label }]} numberOfLines={2}>{item.title}</Text>
        <Text style={[s.pressSub, { color: C.secondary }]}>{item.publication}</Text>
      </View>
      <View style={s.pressTrailing}>
        <Text style={[s.pressDate, { color: C.secondary }]}>{item.date}</Text>
        <IconSymbol name="arrow.up.right" size={13} color={C.secondary} style={{ marginTop: 4 }} />
      </View>
    </Pressable>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },
  topBarOuter: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar: { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn: { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.9 },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText: { fontSize: 13, fontWeight: '500' },
  card: { borderRadius: 12, overflow: 'hidden' },
  pressRow: { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  pressIconCircle: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  pressInitials: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  pressBody: { flex: 1 },
  pressTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20, marginBottom: 3 },
  pressSub: { fontSize: 12 },
  pressTrailing: { alignItems: 'flex-end', flexShrink: 0 },
  pressDate: { fontSize: 12 },
});
