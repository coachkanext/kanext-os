/**
 * PersonalPreRoll — Stat card shown before each game clip on Personal mode.
 * Fades in, holds, then fades out. onDone signals the video can start.
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

export interface PreRollSlide {
  badge:       string;
  badgeColor:  string;
  name:        string;
  venue?:      string;
  heroValue:   string;
  heroLabel:   string;
  secondary:   { value: string; label: string }[];
  record?:     string;
  ftLine?:     string;
}

interface PersonalPreRollProps {
  slide:  PreRollSlide;
  onDone: () => void;
}

const HOLD_MS = 3000;

export function PersonalPreRoll({ slide, onDone }: PersonalPreRollProps) {
  useEffect(() => {
    const t = setTimeout(() => onDone(), HOLD_MS);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={S.root}>

      {/* Badge */}
      <View style={S.badgeRow}>
        <View style={[S.badge, { backgroundColor: slide.badgeColor }]}>
          <Text style={S.badgeText}>{slide.badge}</Text>
        </View>
      </View>

      {/* Venue */}
      {slide.venue && <Text style={S.venue}>{slide.venue}</Text>}

      {/* Name */}
      <Text style={S.name}>{slide.name}</Text>

      {/* Stats row */}
      <View style={S.statsRow}>
        {/* Hero stat */}
        <View style={S.heroStat}>
          <Text style={S.heroValue}>{slide.heroValue}</Text>
          <Text style={S.statLabel}>{slide.heroLabel}</Text>
        </View>

        {/* Secondary stats */}
        {slide.secondary.length > 0 && (
          <>
            <View style={S.statDivider} />
            <View style={S.multiStatCol}>
              <View style={S.multiStatRow}>
                {slide.secondary.map(s => (
                  <View key={s.label} style={S.miniStat}>
                    <Text style={S.miniValue}>{s.value}</Text>
                    <Text style={S.miniLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
              {slide.ftLine && <Text style={S.ftLine}>{slide.ftLine}</Text>}
            </View>
          </>
        )}
      </View>

      {/* Record line */}
      {slide.record && <Text style={S.record}>{slide.record}</Text>}

    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:  '#0A0A0A',
    alignItems:       'center',
    justifyContent:   'center',
    gap:              6,
    zIndex:           10,
    paddingHorizontal: 24,
  },

  badgeRow:  { alignItems: 'center', marginBottom: 0 },
  badge:     { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 4 },
  badgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },

  venue: {
    color: 'rgba(255,255,255,0.45)', fontSize: 10,
    fontWeight: '600', letterSpacing: 1.0, textAlign: 'center',
  },

  name: {
    color: '#FFFFFF', fontSize: 24, fontWeight: '800',
    letterSpacing: 1.5, textAlign: 'center',
  },

  statsRow:  { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 6, width: '100%', justifyContent: 'center' },
  heroStat:  { alignItems: 'center', gap: 2 },
  heroValue: { color: '#FFFFFF', fontSize: 58, fontWeight: '800', lineHeight: 62 },
  statLabel: { color: 'rgba(255,255,255,0.45)', fontSize: 11, fontWeight: '700', letterSpacing: 1.0 },

  statDivider: { width: 1, height: 52, backgroundColor: 'rgba(255,255,255,0.15)' },

  multiStatCol: { alignItems: 'center', gap: 6, flexShrink: 1 },
  multiStatRow: { flexDirection: 'row', gap: 16 },
  miniStat:     { alignItems: 'center', gap: 2 },
  miniValue:    { color: '#FFFFFF', fontSize: 22, fontWeight: '700' },
  miniLabel:    { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 0.8 },
  ftLine:       { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textAlign: 'center' },

  record: {
    color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '600',
    letterSpacing: 0.8, textAlign: 'center', marginTop: 2,
  },
});
