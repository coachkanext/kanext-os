/**
 * Portfolio — Credentials screen.
 * Each credential gets its own surface-1 card. Icon in surface-2 circle.
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
import { PORTFOLIO_CREDENTIALS } from '@/data/mock-portfolio';

const TOP_BAR_H = 52;

// Design tokens
const ACCENT_L = '#2563EB';
const ACCENT_D = '#5B9FFF';
const SURF2_L  = '#E8EAF0';
const SURF2_D  = '#252830';
const TSEC_L   = '#6B7085';
const TSEC_D   = '#8A94A8';

export default function CredentialsScreen() {
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
              <Text style={[s.titlePillText, { color: C.label }]}>Credentials</Text>
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
          <Text style={[s.sectionLabel, { color: TSEC }]}>CREDENTIALS</Text>
          {isOwner && (
            <Pressable style={s.addBtn} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <IconSymbol name="plus" size={13} color={ACCENT} />
              <Text style={[s.addBtnText, { color: ACCENT }]}>Add</Text>
            </Pressable>
          )}
        </View>

        {/* Individual cards */}
        {PORTFOLIO_CREDENTIALS.map(cred => (
          <GlassView key={cred.id} tier={1} style={[s.credCard, { marginBottom: 14 }]}>
            {/* Cover image */}
            {cred.coverUri && (
              <View style={s.credCover}>
                <Image source={{ uri: cred.coverUri }} style={StyleSheet.absoluteFill} resizeMode="cover" />
                <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.38)' }]} />
                {/* Year badge top-right */}
                <View style={s.credYearBadge}>
                  <Text style={s.credYearBadgeText}>{cred.year}</Text>
                </View>
                {/* Icon circle bottom-left */}
                <View style={[s.credIconCircle, { backgroundColor: 'rgba(255,255,255,0.18)' }]}>
                  <IconSymbol name={cred.icon as any} size={18} color="rgba(255,255,255,0.95)" />
                </View>
              </View>
            )}
            {/* Text row */}
            <View style={s.credRow}>
              <View style={{ flex: 1 }}>
                <Text style={[s.credTitle, { color: C.label }]}>{cred.title}</Text>
                <Text style={[s.credSub, { color: C.secondary }]}>{cred.issuer}</Text>
              </View>
              {!cred.coverUri && (
                <Text style={[s.credYear, { color: C.secondary }]}>{cred.year}</Text>
              )}
            </View>
          </GlassView>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (C: ComponentColors) => StyleSheet.create({
  root: { flex: 1 },

  topBarOuter:   { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  topBar:        { height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 },
  kBtn:          { width: 44, height: 44, alignItems: 'flex-start', justifyContent: 'center' },
  titlePill:     { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
  titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
  rolePillWrap:  { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionLabel:     { fontSize: 11, fontWeight: '700', letterSpacing: 0.9, textTransform: 'uppercase' },
  addBtn:           { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addBtnText:       { fontSize: 13, fontWeight: '500' },

  credCard:  { borderRadius: 14, overflow: 'hidden' },
  credCover: { width: '100%', aspectRatio: 16 / 7, overflow: 'hidden', justifyContent: 'flex-end', padding: 12 },
  credRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14, gap: 12 },

  credIconCircle:      { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  credYearBadge:       { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  credYearBadgeText:   { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.90)', letterSpacing: 0.3 },

  credTitle: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  credSub:   { fontSize: 12 },
  credYear:  { fontSize: 12, fontWeight: '500' },
});
