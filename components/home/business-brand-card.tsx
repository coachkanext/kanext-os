import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Animated, StyleSheet, Image } from 'react-native';

// ── Slides ────────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    headline: 'Institutional\nOperating System',
    sub: 'KaNeXT · Built for institutions',
  },
  {
    headline: '5 Modes\n1 Architecture',
    sub: 'Athletics · Business · Education · Community · Personal',
  },
  {
    headline: 'Intelligence.\nOperations.\nGrowth.',
    sub: 'One platform. Every institution.',
  },
  {
    headline: '250,000+',
    sub: 'Athletes in the intelligence database',
  },
  {
    headline: '50+ Intelligence\nDomains',
    sub: '400+ files · 27+ sport-specific domains',
  },
];

const FADE_MS = 450;
const HOLD_MS = 2800;

// ── Component ─────────────────────────────────────────────────────────────────
export function BusinessBrandCard({ totalHeight }: { totalHeight: number }) {
  const [idx, setIdx] = useState(0);
  const opacity     = useRef(new Animated.Value(0)).current;
  const translateY  = useRef(new Animated.Value(14)).current;

  useEffect(() => {
    opacity.setValue(0);
    translateY.setValue(14);

    Animated.parallel([
      Animated.timing(opacity,     { toValue: 1, duration: FADE_MS, useNativeDriver: true }),
      Animated.timing(translateY,  { toValue: 0, duration: FADE_MS, useNativeDriver: true }),
    ]).start(() => {
      const hold = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: FADE_MS, useNativeDriver: true }).start(() => {
          setIdx(prev => (prev + 1) % SLIDES.length);
        });
      }, HOLD_MS);
      return () => clearTimeout(hold);
    });
  }, [idx]);

  const slide = SLIDES[idx];

  return (
    <View style={[s.root, { height: totalHeight }]}>

      {/* ── Background K watermark ── */}
      <Image
        source={require('@/assets/images/kanext-logo.png')}
        style={s.watermark}
        resizeMode="contain"
      />

      {/* ── Animated slide content ── */}
      <Animated.View style={[s.content, { opacity, transform: [{ translateY }] }]}>
        <Text style={s.headline}>{slide.headline}</Text>
        <View style={s.divider} />
        <Text style={s.sub}>{slide.sub}</Text>
      </Animated.View>

      {/* ── Bottom bar ── */}
      <View style={s.bottomBar}>
        <Text style={s.wordmark}>KaNeXT</Text>
        <View style={s.dotRow}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[s.dot, i === idx && s.dotActive]} />
          ))}
        </View>
      </View>

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const BG       = '#0D0B09';
const CARBON   = '#F0E8DC';
const EMBER    = '#8B2500';

const s = StyleSheet.create({
  root: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  watermark: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    opacity: 0.04,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  headline: {
    fontSize: 38,
    fontWeight: '800',
    color: CARBON,
    textAlign: 'center',
    letterSpacing: -0.8,
    lineHeight: 46,
  },
  divider: {
    width: 36,
    height: 2,
    backgroundColor: EMBER,
    borderRadius: 1,
    marginVertical: 14,
  },
  sub: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(240,232,220,0.45)',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  wordmark: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(240,232,220,0.30)',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(240,232,220,0.18)',
  },
  dotActive: {
    width: 16,
    backgroundColor: 'rgba(240,232,220,0.65)',
  },
});
