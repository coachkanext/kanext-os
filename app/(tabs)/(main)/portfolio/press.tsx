/**
 * Portfolio — Press screen.
 * Featured hero card for top item + individual cards for the rest.
 */
import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated, useColorScheme, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
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

// Design tokens
const ACCENT_L = '#2563EB';
const ACCENT_D = '#5B9FFF';
const SURF2_L  = '#E8EAF0';
const SURF2_D  = '#252830';
const TSEC_L   = '#6B7085';
const TSEC_D   = '#8A94A8';

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PressScreen() {
  const C      = useColors();
  const scheme = useColorScheme();
  const dark   = scheme === 'dark';
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);
  const router  = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];

  useEffect(() => {
    router.replace('/(tabs)/(main)/portfolio' as any);
  }, [isOwner]);

  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const ACCENT = dark ? ACCENT_D : ACCENT_L;
  const SURF2  = dark ? SURF2_D  : SURF2_L;
  const TSEC   = dark ? TSEC_D   : TSEC_L;

  const [featured, ...rest] = PORTFOLIO_PRESS;

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* ── Top bar ── */}
      <Animated.View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity }]}>
        <View style={s.topBar}>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
            style={s.kBtn}
          >
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

      {/* ── Content ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + TOP_BAR_H + 8,
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 16,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >
        {/* Header */}
        <View style={s.sectionHeaderRow}>
          <Text style={[s.sectionLabel, { color: TSEC }]}>PRESS COVERAGE</Text>
          {isOwner && (
            <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus" size={13} color={ACCENT} />
              <Text style={[s.addBtnText, { color: ACCENT }]}>Add</Text>
            </Pressable>
          )}
        </View>

        {/* ── Featured hero card ── */}
        <FeaturedCard item={featured} C={C} s={s} SURF2={SURF2} />

        {/* ── Regular press cards ── */}
        {rest.map(item => (
          <PressCard key={item.id} item={item} C={C} s={s} SURF2={SURF2} />
        ))}
      </ScrollView>
    </View>
  );
}

// ── Featured card ─────────────────────────────────────────────────────────────

function FeaturedCard({ item, C, s, SURF2 }: { item: PortfolioPress; C: ComponentColors; s: ReturnType<typeof makeStyles>; SURF2: string }) {
  return (
    <GlassView tier={1} style={[s.featuredCard, { marginBottom: 14 }]}>
      <Pressable
        style={[s.featuredBanner, { backgroundColor: C.label }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        {item.bannerUri && (
          <Image source={{ uri: item.bannerUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        )}
        {/* Dark overlay so text stays readable over any photo */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.48)' }]} />
        {/* Top row: pub name + arrow */}
        <View style={s.bannerTopRow}>
          <View style={s.bannerPubGroup}>
            <View style={s.bannerIconCircle}>
              <Text style={s.bannerIconText}>{item.initials}</Text>
            </View>
            <Text style={s.bannerPubName}>{item.publication}</Text>
          </View>
          <IconSymbol name="arrow.up.right" size={15} color="rgba(255,255,255,0.65)" />
        </View>
        {/* Bottom: headline + date */}
        <View style={s.bannerBottomRow}>
          <Text style={s.bannerHeadline}>30 Under 30</Text>
          <Text style={s.bannerDate}>{item.date}</Text>
        </View>
      </Pressable>
      {/* Card body */}
      <View style={[s.featuredBody, { borderTopColor: C.separator }]}>
        <Text style={[s.featuredTitle, { color: C.label }]}>{item.title}</Text>
        <Text style={[s.featuredBlurb, { color: C.secondary }]}>{item.blurb}</Text>
      </View>
    </GlassView>
  );
}

// ── Regular press card ────────────────────────────────────────────────────────

function PressCard({ item, C, s, SURF2 }: { item: PortfolioPress; C: ComponentColors; s: ReturnType<typeof makeStyles>; SURF2: string }) {
  return (
    <GlassView tier={1} style={[s.pressCard, { marginBottom: 14 }]}>
      <Pressable
        style={({ pressed }) => [s.pressRow, pressed && { opacity: 0.75 }]}
        onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
      >
        {/* Icon circle — image when available, initials fallback */}
        <View style={[s.iconCircle, { backgroundColor: SURF2, overflow: 'hidden' }]}>
          {item.thumbUri ? (
            <Image source={{ uri: item.thumbUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <Text style={[s.iconText, { color: C.label }]}>{item.initials}</Text>
          )}
        </View>

        {/* Body */}
        <View style={s.pressBody}>
          <Text style={[s.pubName, { color: C.secondary }]}>{item.publication}</Text>
          <Text style={[s.pressTitle, { color: C.label }]}>{item.title}</Text>
          <Text style={[s.pressBlurb, { color: C.secondary }]} numberOfLines={2}>{item.blurb}</Text>
        </View>

        {/* Trailing */}
        <View style={s.pressTrailing}>
          <Text style={[s.pressDate, { color: C.secondary }]}>{item.date}</Text>
          <IconSymbol name="arrow.up.right" size={13} color={C.secondary} style={{ marginTop: 4 }} />
        </View>
      </Pressable>
    </GlassView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

  // Section header
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
  addBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText:       { fontSize: 13, fontWeight: '500' },

  // ── Featured card ──
  featuredCard: { borderRadius: 14, overflow: 'hidden' },

  featuredBanner: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    gap: 20,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerPubGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bannerIconCircle: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  bannerIconText:  { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },
  bannerPubName:   { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.75)' },
  bannerBottomRow: { gap: 4 },
  bannerHeadline:  { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, color: 'rgba(255,255,255,0.95)' },
  bannerDate:      { fontSize: 12, color: 'rgba(255,255,255,0.50)' },

  featuredBody: {
    paddingHorizontal: 16, paddingVertical: 14,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  featuredTitle: { fontSize: 15, fontWeight: '700', lineHeight: 21, letterSpacing: -0.2 },
  featuredBlurb: { fontSize: 13, lineHeight: 19 },

  // ── Regular card ──
  pressCard: { borderRadius: 14, overflow: 'hidden' },
  pressRow:  { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 14, gap: 12 },

  iconCircle: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  iconText:   { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },

  pressBody:  { flex: 1, gap: 2 },
  pubName:    { fontSize: 11, fontWeight: '500', letterSpacing: 0.2, textTransform: 'uppercase' },
  pressTitle: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  pressBlurb: { fontSize: 12, lineHeight: 17, marginTop: 2 },

  pressTrailing: { alignItems: 'flex-end', flexShrink: 0 },
  pressDate:     { fontSize: 12 },
});
