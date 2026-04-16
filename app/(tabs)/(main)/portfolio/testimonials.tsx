/**
 * Portfolio — Testimonials screen.
 */
import React, { useCallback, useEffect, useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
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
import { PORTFOLIO_TESTIMONIALS, type PortfolioTestimonial } from '@/data/mock-portfolio';

const CAUTION = '#B8943E';
const TOP_BAR_H = 52;

export default function TestimonialsScreen() {
  const C = useColors();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => makeStyles(C), [C]);
  const router  = useRouter();
  const [role, cycleRole, roleCycles] = useDemoRole('personal:portfolio');
  const isOwner = role === roleCycles[0];

  useEffect(() => {
    router.replace('/(tabs)/(main)/portfolio' as any);
  }, [isOwner]);

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
              <Text style={[s.titlePillText, { color: C.label }]}>Testimonials</Text>
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
          <Text style={[s.sectionLabel, { color: C.secondary }]}>CLIENT TESTIMONIALS</Text>
          {isOwner && (
            <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus" size={13} color={C.secondary} />
              <Text style={[s.addBtnText, { color: C.secondary }]}>Add</Text>
            </Pressable>
          )}
        </View>

        {PORTFOLIO_TESTIMONIALS.map(t => (
          <TestimonialCard key={t.id} t={t} C={C} s={s} />
        ))}
      </ScrollView>
    </View>
  );
}

function TestimonialCard({ t, C, s }: { t: PortfolioTestimonial; C: ComponentColors; s: ReturnType<typeof makeStyles> }) {
  return (
    <GlassView tier={1} style={[s.card, { marginBottom: 12 }]}>
      <Text style={[s.quoteDecor, { color: C.separator }]}>&ldquo;</Text>
      <Text style={[s.quote, { color: C.label }]}>{t.quote}</Text>
      <View style={[s.divider, { backgroundColor: C.separator }]} />
      <View style={s.footer}>
        <View style={{ flex: 1 }}>
          <Text style={[s.name, { color: C.label }]}>{t.name}</Text>
          <Text style={[s.role, { color: C.secondary }]}>{t.title} · {t.company}</Text>
        </View>
        <View style={s.starsRow}>
          {Array.from({ length: 5 }).map((_, i) => (
            <IconSymbol key={i} name={i < t.stars ? 'star.fill' : 'star'} size={13} color={i < t.stars ? CAUTION : C.separator} />
          ))}
        </View>
      </View>
    </GlassView>
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
  card: { borderRadius: 14, overflow: 'hidden', padding: 16 },
  quoteDecor: { fontSize: 52, fontWeight: '800', lineHeight: 44, marginBottom: -4 },
  quote: { fontSize: 15, fontStyle: 'italic', lineHeight: 23, marginBottom: 14 },
  divider: { height: StyleSheet.hairlineWidth, marginBottom: 12 },
  footer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  name: { fontSize: 13, fontWeight: '700', marginBottom: 2 },
  role: { fontSize: 12 },
  starsRow: { flexDirection: 'row', gap: 3, paddingTop: 2 },
});
