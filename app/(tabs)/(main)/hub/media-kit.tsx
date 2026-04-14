/**
 * Media Kit — auto-generated one-pager.
 * Stats · Demographics · Top Content · Partnerships · Rate Summary · Actions
 * View and share only. No editing, no sub-pages.
 */

import React, { useMemo, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useScrollHeader } from '@/hooks/use-scroll-header';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { RolePill } from '@/components/ui/role-pill';
import { resetFooter } from '@/utils/global-footer-hide';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';

const GAIN    = '#5A8A6E';
const TOP_H   = 44;

// ── Data ──────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '1,247',  label: 'Followers'   },
  { value: '247',    label: 'Subscribers' },
  { value: '38.4K',  label: 'Monthly Reach' },
  { value: '4.8%',   label: 'Eng. Rate'  },
];

const DEMOGRAPHICS = {
  age: [
    { range: '18–24', pct: 22 },
    { range: '25–34', pct: 41 },
    { range: '35–44', pct: 24 },
    { range: '45+',   pct: 13 },
  ],
  gender: { male: 58, female: 42 },
  locations: ['Atlanta', 'Los Angeles', 'New York', 'Houston', 'Chicago'],
};

const TOP_CONTENT = [
  { type: 'VIDEO',   title: 'KaNeXT OS v2.0 — Full Walkthrough',    metric: '12.4K views',  eng: '6.2%' },
  { type: 'VIDEO',   title: 'How I Built My Brand from Zero',        metric: '14.2K views',  eng: '7.1%' },
  { type: 'REEL',    title: 'Top 5 Recruiting Mistakes',             metric: '8.1K views',   eng: '5.4%' },
  { type: 'POST',    title: 'Why every institution needs an OS',     metric: '2.1K likes',   eng: '9.3%' },
  { type: 'VIDEO',   title: 'Behind the Combine: Full Recap',        metric: '6.8K views',   eng: '4.8%' },
];

const PARTNERSHIPS = [
  { brand: 'Nike',          type: 'Sponsored Reel',       year: '2025' },
  { brand: 'Gatorade',      type: 'Brand Ambassador',     year: '2025' },
  { brand: 'Under Armour',  type: 'Sponsored Post',       year: '2024' },
];

const RATES = [
  { service: 'Sponsored Post',       price: '$500'   },
  { service: 'Sponsored Reel',       price: '$750'   },
  { service: 'KTV Video',            price: '$1,200' },
  { service: 'Brand Ambassadorship', price: '$3,000/mo' },
];


// ── Component ─────────────────────────────────────────────────────────────────

export default function MediaKitScreen() {
  const C       = useColors();
  const s       = useMemo(() => makeStyles(C), [C]);
  const insets  = useSafeAreaInsets();
  const router  = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:hub');
  const isOwner = role === roleCycles[0];

  // Kick back to hub profile when role switches to Follower
  useEffect(() => {
    if (!isOwner) router.replace('/(tabs)/(main)/hub' as any);
  }, [isOwner]);

  const topBarH        = insets.top + TOP_H;
  const contentPadTop  = topBarH + 8;

  const { opacity, onScroll: handleScroll, scrollEventThrottle } = useScrollHeader(insets.top + TOP_H);



  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPadTop, paddingBottom: insets.bottom + 65 }}
        onScroll={handleScroll}
        scrollEventThrottle={scrollEventThrottle}
      >

        {/* ── Compact profile header (no card) ── */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 14 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.separator, alignItems: 'center', justifyContent: 'center' }}>
            <IconSymbol name="person.fill" size={20} color={C.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: C.label }}>Sammy Kalejaiye</Text>
            <Text style={{ fontSize: 12, color: C.secondary, marginTop: 1 }}>@sammyk · Atlanta, GA</Text>
          </View>
        </View>

        {/* ── Stat strip ── */}
        <View style={[s.card, { backgroundColor: C.surface, flexDirection: 'row', paddingVertical: 14 }]}>
          {STATS.map((stat, idx) => (
            <View key={stat.label} style={[s.statCell, idx > 0 && { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: C.separator }]}>
              <Text style={[s.statValue, { color: C.label }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Audience snapshot ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Audience</Text>

          {/* Top age brackets — compact tiles */}
          <Text style={[s.fieldLabel, { color: C.muted, marginBottom: 8 }]}>Age</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {[...DEMOGRAPHICS.age].sort((a, b) => b.pct - a.pct).slice(0, 3).map(a => (
              <View key={a.range} style={{ flex: 1, backgroundColor: C.bg, borderRadius: 10, paddingVertical: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '800', color: C.label }}>{a.pct}%</Text>
                <Text style={{ fontSize: 11, color: C.secondary, marginTop: 2 }}>{a.range}</Text>
              </View>
            ))}
          </View>

          {/* Gender — single line */}
          <Text style={[s.fieldLabel, { color: C.muted, marginBottom: 6 }]}>Gender</Text>
          <Text style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>
            {DEMOGRAPHICS.gender.male}% Male · {DEMOGRAPHICS.gender.female}% Female
          </Text>

          {/* Top locations */}
          <Text style={[s.fieldLabel, { color: C.muted, marginBottom: 8 }]}>Top Locations</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {DEMOGRAPHICS.locations.slice(0, 5).map((loc, i) => (
              <View key={loc} style={[s.locationPill, { backgroundColor: C.separator }]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{i + 1}. {loc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Top Content ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Top Content</Text>
          {TOP_CONTENT.map((item, idx) => (
            <Pressable
              key={item.title}
              style={({ pressed }) => [s.contentRow, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }, pressed && { opacity: 0.7 }]}
              onPress={haptic}
            >
              <View style={[s.typeBadge, { backgroundColor: C.bg }]}>
                <Text style={[s.typeText, { color: C.secondary }]}>{item.type}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.contentTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[s.contentMeta, { color: C.secondary }]}>{item.metric} · {item.eng} eng</Text>
              </View>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* ── Partnerships ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Past Partnerships</Text>
          {PARTNERSHIPS.map((p, idx) => (
            <Pressable
              key={p.brand}
              style={({ pressed }) => [s.partnerRow, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }, pressed && { opacity: 0.7 }]}
              onPress={haptic}
            >
              <View style={[s.partnerDot, { backgroundColor: GAIN }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.partnerBrand, { color: C.label }]}>{p.brand}</Text>
                <Text style={[s.partnerType, { color: C.secondary }]}>{p.type}</Text>
              </View>
              <Text style={[s.partnerYear, { color: C.muted }]}>{p.year}</Text>
              <IconSymbol name="chevron.right" size={13} color={C.secondary} />
            </Pressable>
          ))}
        </View>

        {/* ── Rate Summary ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Rate Summary</Text>
          {RATES.map((r, idx) => (
            <View
              key={r.service}
              style={[s.rateRow, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
            >
              <Text style={[s.rateService, { color: C.label }]}>{r.service}</Text>
              <Text style={[s.ratePrice, { color: C.label }]}>{r.price}</Text>
            </View>
          ))}
          <Text style={[s.rateNote, { color: C.muted }]}>Custom packages available on request.</Text>
        </View>

        {/* ── Actions ── */}
        <View style={{ paddingHorizontal: 16, gap: 10, marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Pressable
              style={({ pressed }) => [s.actionBtn, { backgroundColor: C.label, flex: 1 }, pressed && { opacity: 0.8 }]}
              onPress={haptic}
            >
              <IconSymbol name="arrow.down.to.line" size={15} color={C.bg} />
              <Text style={[s.actionBtnText, { color: C.bg }]}>Download PDF</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, flex: 1, borderWidth: 1, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
              onPress={haptic}
            >
              <IconSymbol name="link" size={15} color={C.label} />
              <Text style={[s.actionBtnText, { color: C.label }]}>Copy Link</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [s.actionBtn, { backgroundColor: C.surface, flex: 1, borderWidth: 1, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
              onPress={haptic}
            >
              <IconSymbol name="curlybraces" size={15} color={C.label} />
              <Text style={[s.actionBtnText, { color: C.label }]}>Embed</Text>
            </Pressable>
          </View>

          <Pressable
            style={({ pressed }) => [s.dipsonBar, { backgroundColor: C.surface, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
            onPress={haptic}
          >
            <IconSymbol name="wand.and.stars" size={15} color={C.secondary} />
            <Text style={[s.dipsonText, { color: C.secondary }]} numberOfLines={1}>
              Customize this kit for a specific brand with Dipson…
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* ── Fixed Top Bar ── */}
      <Animated.View style={[s.topBarWrap, { paddingTop: insets.top, opacity }]} pointerEvents="box-none">
        <View style={s.topBar} pointerEvents="box-none">
          <View style={s.topBarSide} pointerEvents="auto">
            <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={12}>
              <Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.5, color: C.label }}>K</Text>
            </Pressable>
          </View>
          <View style={{ flex: 1, alignItems: 'center' }} pointerEvents="none">
            <View style={{ paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: C.separator, backgroundColor: C.surface }}>
              <Text style={{ fontSize: 12, fontWeight: '600', letterSpacing: 0.3, color: C.label }}>Media Kit</Text>
            </View>
          </View>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]} pointerEvents="auto">
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },

  topBarWrap:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  topBar:      { height: TOP_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { width: 80, justifyContent: 'center' },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700' },

  card: {
    marginHorizontal: 16, marginBottom: 12,
    borderRadius: 16, padding: 16,
  },

  sectionLabel: {
    fontSize: 11, fontWeight: '700', letterSpacing: 0.7,
    textTransform: 'uppercase', marginBottom: 14,
  },
  fieldLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },

  statCell: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  statValue: { fontSize: 17, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },


  locationPill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },

  contentRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  typeBadge:    { paddingHorizontal: 7, paddingVertical: 4, borderRadius: 6 },
  typeText:     { fontSize: 9, fontWeight: '800', letterSpacing: 0.4 },
  contentTitle: { fontSize: 13, fontWeight: '600' },
  contentMeta:  { fontSize: 11, marginTop: 2 },

  partnerRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11 },
  partnerDot:  { width: 8, height: 8, borderRadius: 4 },
  partnerBrand:{ fontSize: 14, fontWeight: '600' },
  partnerType: { fontSize: 12, marginTop: 1 },
  partnerYear: { fontSize: 12 },

  rateRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  rateService: { fontSize: 14 },
  ratePrice:   { fontSize: 14, fontWeight: '700' },
  rateNote:    { fontSize: 11, marginTop: 10, fontStyle: 'italic' },

  actionBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12 },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  dipsonBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth,
  },
  dipsonText: { flex: 1, fontSize: 13 },

});
