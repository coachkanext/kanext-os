/**
 * NexusWelcome — Empty state shown before the first message in a chat.
 * Matches claude.ai's centered greeting + suggestion chip grid.
 */

import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import * as Haptics from 'expo-haptics';

import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Suggestion sets ───────────────────────────────────────────────────────────

const SUGGESTIONS = [
  'What is KaNeXT?',
  'How does the platform work?',
  'Walk me through the capital raise',
  'What makes this defensible?',
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h >= 5  && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}

// ── Component ─────────────────────────────────────────────────────────────────

interface NexusWelcomeProps {
  /** Called when user taps a suggestion chip — sends immediately */
  onSend: (text: string) => void;
  /** Optional name shown in greeting */
  userName?: string;
  /** Controls which suggestion set to show */
  mode?: 'sports' | 'business' | 'education';
}

export function NexusWelcome({ onSend, userName, mode = 'sports' }: NexusWelcomeProps) {
  const C    = useColors();
  const S    = useMemo(() => makeStyles(C), [C]);

  const suggestions = SUGGESTIONS;

  const greetText = userName
    ? `Good ${greeting()}, ${userName}`
    : `Good ${greeting()}`;

  return (
    <View style={S.root}>
      {/* Dipson icon */}
      <Image
        source={require('@/assets/nexus-icon.png')}
        style={{ width: 96, height: 96, tintColor: C.label, marginBottom: 8 }}
        resizeMode="contain"
      />

      {/* Greeting */}
      <Text style={[S.greeting, { color: C.label }]}>{greetText}</Text>
      <Text style={[S.subtitle, { color: C.secondary }]}>
        How can I help you today?
      </Text>

      {/* Suggestion chips — 2×2 grid */}
      <View style={S.grid}>
        {suggestions.map(s => (
          <Pressable
            key={s}
            style={({ pressed }) => [
              S.chip,
              {
                backgroundColor: C.surface,
                borderColor:     C.separator,
                opacity:         pressed ? 0.7 : 1,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onSend(s);
            }}
          >
            <Text style={[S.chipText, { color: C.label }]} numberOfLines={2}>
              {s}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const makeStyles = (C: ComponentColors) =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
      paddingBottom: 80,
      gap: 10,
    },
    iconWrap: {
      width: 88,
      height: 88,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    greeting: {
      fontSize: 20,
      fontWeight: '600',
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: 16,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      justifyContent: 'center',
      maxWidth: 340,
    },
    chip: {
      width: '47%',
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      paddingHorizontal: 14,
      paddingVertical: 14,
      minHeight: 60,
      justifyContent: 'center',
    },
    chipText: {
      fontSize: 14,
      lineHeight: 19,
    },
  });
