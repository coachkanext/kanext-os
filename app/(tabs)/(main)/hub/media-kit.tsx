/**
 * Media Kit — auto-generated one-pager.
 * Stats · Demographics · Top Content · Partnerships · Rate Summary · Actions
 * View and share only. No editing, no sub-pages.
 */

import React, { useMemo, useEffect } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { useDemoRole } from '@/utils/demo-role-store';
import { RolePill } from '@/components/ui/role-pill';
import { resetFooter } from '@/utils/global-footer-hide';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { KMenuButton } from '@/components/ui/k-menu-button';

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

// ── Bar component ─────────────────────────────────────────────────────────────

function AgeBar({ range, pct, C }: { range: string; pct: number; C: ComponentColors }) {
  return (
    <View style={{ marginBottom: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontSize: 12, color: C.secondary }}>{range}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>{pct}%</Text>
      </View>
      <View style={{ height: 5, borderRadius: 3, backgroundColor: C.separator, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%` as any, height: 5, borderRadius: 3, backgroundColor: C.label }} />
      </View>
    </View>
  );
}

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

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  return (
    <View style={[s.screen, { backgroundColor: C.bg }]}>

      {/* ── Content ── */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: contentPadTop, paddingBottom: 40 }}
      >

        {/* ── Identity block ── */}
        <View style={[s.card, { backgroundColor: C.surface, marginTop: 8 }]}>
          <Text style={[s.creatorName, { color: C.label }]}>Sammy Kalejaiye</Text>
          <Text style={[s.creatorHandle, { color: C.secondary }]}>@sammyk · Atlanta, GA</Text>
          <Text style={[s.creatorBio, { color: C.secondary }]} numberOfLines={2}>
            Building the operating system for institutions. Founder of KaNeXT. Sports · Education · Business · Community.
          </Text>
        </View>

        {/* ── Stats ── */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <Text style={[s.sectionLabel, { color: C.secondary, marginBottom: 12 }]}>Audience Stats</Text>
          <View style={s.statsGrid}>
            {STATS.map(stat => (
              <View key={stat.label} style={[s.statCard, { backgroundColor: C.surface }]}>
                <Text style={[s.statValue, { color: C.label }]}>{stat.value}</Text>
                <Text style={[s.statLabel, { color: C.secondary }]}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Demographics ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Demographics</Text>

          {/* Age */}
          <Text style={[s.fieldLabel, { color: C.muted }]}>Age Breakdown</Text>
          <View style={{ marginTop: 8, marginBottom: 14 }}>
            {DEMOGRAPHICS.age.map(a => (
              <AgeBar key={a.range} range={a.range} pct={a.pct} C={C} />
            ))}
          </View>

          {/* Gender */}
          <Text style={[s.fieldLabel, { color: C.muted }]}>Gender</Text>
          <View style={{ height: 8, borderRadius: 4, flexDirection: 'row', overflow: 'hidden', marginTop: 6, marginBottom: 4 }}>
            <View style={{ flex: DEMOGRAPHICS.gender.male, backgroundColor: C.label }} />
            <View style={{ flex: DEMOGRAPHICS.gender.female, backgroundColor: C.separator }} />
          </View>
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.label }} />
              <Text style={{ fontSize: 12, color: C.secondary }}>Male {DEMOGRAPHICS.gender.male}%</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.separator }} />
              <Text style={{ fontSize: 12, color: C.secondary }}>Female {DEMOGRAPHICS.gender.female}%</Text>
            </View>
          </View>

          {/* Locations */}
          <Text style={[s.fieldLabel, { color: C.muted }]}>Top Locations</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {DEMOGRAPHICS.locations.map((loc, i) => (
              <View key={loc} style={[s.locationPill, { backgroundColor: C.separator }]}>
                <Text style={{ fontSize: 12, fontWeight: '600', color: C.label }}>
                  {i + 1}. {loc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Top Content ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Top Content</Text>
          {TOP_CONTENT.map((item, idx) => (
            <View
              key={item.title}
              style={[s.contentRow, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
            >
              <View style={[s.typeBadge, { backgroundColor: C.bg }]}>
                <Text style={[s.typeText, { color: C.secondary }]}>{item.type}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.contentTitle, { color: C.label }]} numberOfLines={1}>{item.title}</Text>
                <Text style={[s.contentMeta, { color: C.secondary }]}>{item.metric} · {item.eng} eng</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Partnerships ── */}
        <View style={[s.card, { backgroundColor: C.surface }]}>
          <Text style={[s.sectionLabel, { color: C.secondary }]}>Past Partnerships</Text>
          {PARTNERSHIPS.map((p, idx) => (
            <View
              key={p.brand}
              style={[s.partnerRow, idx > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}
            >
              <View style={[s.partnerDot, { backgroundColor: GAIN }]} />
              <View style={{ flex: 1 }}>
                <Text style={[s.partnerBrand, { color: C.label }]}>{p.brand}</Text>
                <Text style={[s.partnerType, { color: C.secondary }]}>{p.type}</Text>
              </View>
              <Text style={[s.partnerYear, { color: C.muted }]}>{p.year}</Text>
            </View>
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

          {/* Primary row */}
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

          {/* Dipson bar */}
          <Pressable
            style={({ pressed }) => [s.dipsonBar, { backgroundColor: C.surface, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
            onPress={haptic}
          >
            <IconSymbol name="wand.and.stars" size={15} color={C.secondary} />
            <Text style={[s.dipsonText, { color: C.secondary }]} numberOfLines={1}>
              Customize this kit for a specific brand with Dipson…
            </Text>
          </Pressable>

          {/* Generate Video Kit */}
          <Pressable
            style={({ pressed }) => [s.videoBtn, { backgroundColor: C.surface, borderColor: C.separator }, pressed && { opacity: 0.7 }]}
            onPress={haptic}
          >
            <IconSymbol name="video.fill" size={15} color={C.secondary} />
            <Text style={[s.videoBtnText, { color: C.label }]}>Generate Video Kit</Text>
          </Pressable>

        </View>
      </ScrollView>

      {/* ── Fixed Top Bar ── */}
      <View style={[s.topBarWrap, { paddingTop: insets.top, backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={12} style={s.topBarSide}>
            <KMenuButton />
          </Pressable>
          <Text style={[s.topBarTitle, { color: C.label }]}>Media Kit</Text>
          <View style={[s.topBarSide, { alignItems: 'flex-end' }]}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  screen:      { flex: 1 },

  topBarWrap:  { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100 },
  topBar:      { height: TOP_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 },
  topBarSide:  { minWidth: 44 },
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

  creatorName:   { fontSize: 20, fontWeight: '800', marginBottom: 2 },
  creatorHandle: { fontSize: 13, marginBottom: 8 },
  creatorBio:    { fontSize: 13, lineHeight: 18 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: {
    width: '47.5%', borderRadius: 14,
    paddingVertical: 18, paddingHorizontal: 16,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 28, fontWeight: '800', letterSpacing: -1 },
  statLabel: { fontSize: 12, marginTop: 4 },

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

  videoBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 14, borderRadius: 12, borderWidth: StyleSheet.hairlineWidth },
  videoBtnText: { fontSize: 14, fontWeight: '600' },
});
