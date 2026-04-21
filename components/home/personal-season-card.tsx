/**
 * PersonalSeasonCard — 4-slide season breakdown for pill 1.
 * Each level (D1 / NAIA / USCAA / ALL) gets its own 3.5s card.
 * Tap anywhere to pause / resume. Story-style dot progress at bottom.
 * After last slide → calls onDone (VideoHero advances to pill 2).
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';

const SLIDE_MS = 3500;

interface Slide {
  badge:      string;
  badgeColor: string;
  gp:         number;
  ppg:        string;
  threeP:     string;
  rpg:        string;
  apg:        string;
  disclaimer?: string;
}

const SLIDES: Slide[] = [
  {
    badge: 'SEASON AVG', badgeColor: '#8B2500', gp: 15,
    ppg: '27.3', threeP: '.355', rpg: '2.9', apg: '2.9',
    disclaimer: '8 games w/o individual stats  ·  23 GP total  ·  15–8 record',
  },
  { badge: 'D1',    badgeColor: '#0D2137', gp:  5, ppg: '22.4', threeP: '.372', rpg: '2.2', apg: '2.0' },
  { badge: 'NAIA',  badgeColor: '#1A1714', gp:  5, ppg: '31.8', threeP: '.296', rpg: '4.0', apg: '2.6' },
  { badge: 'USCAA', badgeColor: '#1A1714', gp:  5, ppg: '27.8', threeP: '.414', rpg: '2.6', apg: '4.0' },
];

export function PersonalSeasonCard({ onDone }: { onDone: () => void }) {
  const [slideIdx, setSlideIdx] = useState(0);
  const [paused, setPaused]     = useState(false);

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const startRef     = useRef(Date.now());
  const remainingRef = useRef(SLIDE_MS);
  const slideIdxRef  = useRef(0);
  slideIdxRef.current = slideIdx;

  const scheduleAdvance = (ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => {
      const next = slideIdxRef.current + 1;
      if (next >= SLIDES.length) {
        onDone();
      } else {
        setSlideIdx(next);
        remainingRef.current = SLIDE_MS;
        scheduleAdvance(SLIDE_MS);
      }
    }, ms);
  };

  useEffect(() => {
    remainingRef.current = SLIDE_MS;
    scheduleAdvance(SLIDE_MS);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleTap = () => {
    if (!paused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      remainingRef.current = Math.max(0, SLIDE_MS - (Date.now() - startRef.current));
      setPaused(true);
    } else {
      scheduleAdvance(remainingRef.current);
      setPaused(false);
    }
  };

  const handleDotPress = useCallback((idx: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSlideIdx(idx);
    remainingRef.current = SLIDE_MS;
    setPaused(false);
    scheduleAdvance(SLIDE_MS);
  }, []);

  const slide = SLIDES[slideIdx];

  return (
    <View style={S.root}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap} />

      {/* Badge + GP */}
      <View style={S.badgeRow}>
        <View style={[S.badge, { backgroundColor: slide.badgeColor }]}>
          <Text style={S.badgeText}>{slide.badge}</Text>
        </View>
        <Text style={S.gpText}>{slide.gp} GP</Text>
      </View>

      {/* Name */}
      <Text style={S.name}>LAOLU KALEJAIYE</Text>

      {/* Stats row — mirrors game pre-roll layout */}
      <View style={S.statsRow}>
        <View style={S.heroStat}>
          <Text style={S.heroValue}>{slide.ppg}</Text>
          <Text style={S.heroLabel}>PPG</Text>
        </View>

        <View style={S.statDivider} />

        <View style={S.secondaryCols}>
          {[
            { value: slide.threeP, label: '3P%' },
            { value: slide.rpg,    label: 'RPG' },
            { value: slide.apg,    label: 'APG' },
          ].map(s => (
            <View key={s.label} style={S.miniStat}>
              <Text style={S.miniValue}>{s.value}</Text>
              <Text style={S.miniLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ALL disclaimer */}
      {slide.disclaimer ? (
        <Text style={S.disclaimer}>{slide.disclaimer}</Text>
      ) : (
        <View style={S.disclaimerSpacer} />
      )}

      {/* Story-style dot progress */}
      <View style={S.dotsRow}>
        {SLIDES.map((_, i) => (
          <Pressable
            key={i}
            onPress={() => handleDotPress(i)}
            hitSlop={10}
            style={[S.dot, i < slideIdx ? S.dotDone : i === slideIdx ? S.dotActive : S.dotPending]}
          />
        ))}
      </View>

      {/* Pause indicator */}
      {paused && (
        <View style={S.pauseBadge} pointerEvents="none">
          <IconSymbol name="pause.fill" size={14} color="rgba(255,255,255,0.85)" />
        </View>
      )}
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:   '#0A0A0A',
    alignItems:        'center',
    justifyContent:    'center',
    gap:               5,
    zIndex:            10,
    paddingHorizontal: 24,
  },

  badgeRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  badge:     { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  gpText:    { color: 'rgba(255,255,255,0.40)', fontSize: 10, fontWeight: '600', letterSpacing: 0.6 },

  name: {
    color: '#FFFFFF', fontSize: 22, fontWeight: '800',
    letterSpacing: 1.5, textAlign: 'center',
  },

  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: 20, marginTop: 4, width: '100%', justifyContent: 'center',
  },

  heroStat:  { alignItems: 'center', gap: 2 },
  heroValue: { color: '#FFFFFF', fontSize: 52, fontWeight: '800', lineHeight: 56 },
  heroLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.0 },

  statDivider: { width: 1, height: 48, backgroundColor: 'rgba(255,255,255,0.15)' },

  secondaryCols: { flexDirection: 'row', gap: 16, flexShrink: 1 },
  miniStat:      { alignItems: 'center', gap: 2 },
  miniValue:     { color: '#FFFFFF', fontSize: 20, fontWeight: '700' },
  miniLabel:     { color: 'rgba(255,255,255,0.45)', fontSize: 9, fontWeight: '700', letterSpacing: 0.8 },

  disclaimer: {
    color: 'rgba(255,255,255,0.35)', fontSize: 9,
    fontWeight: '600', letterSpacing: 0.4,
    textAlign: 'center', marginTop: 4,
  },
  disclaimerSpacer: { height: 14 },

  // Story dots
  dotsRow: {
    flexDirection: 'row', gap: 5, marginTop: 10,
  },
  dot: {
    height: 3, borderRadius: 2, width: 28,
  },
  dotDone:    { backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive:  { backgroundColor: '#FFFFFF' },
  dotPending: { backgroundColor: 'rgba(255,255,255,0.20)' },

  pauseBadge: {
    position: 'absolute', top: 10, right: 12,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center', justifyContent: 'center',
  },
});
