/**
 * Booking Flow — Step 4: Confirmation / Success
 * No top bar. Full-screen centered layout.
 * Monochrome design system. No blue. No accent.
 * gain green (#5A8A6E) used ONLY for the checkmark icon — semantic status indicator.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Semantic status color ──────────────────────────────────────────────────────

const GAIN_GREEN = '#5A8A6E'; // semantic data value — status indicator only

// ── Main screen ───────────────────────────────────────────────────────────────

export default function BookingSuccessScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    price: string;
    duration: string;
    date: string;
    time: string;
    pending: string;
  }>();

  const isPending = params.pending === 'true';

  function handleAddToCalendar() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Calendar integration stub
  }

  function handleMessage() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Messaging stub
  }

  function handleDone() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace('/(tabs)/(main)/hub' as any);
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      <View
        style={[
          s.content,
          {
            paddingTop: insets.top + 60,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >

        {/* ── Checkmark circle ─────────────────────────────────────────────── */}
        <View style={[s.checkCircle, { backgroundColor: C.surface }]}>
          <IconSymbol name="checkmark" size={36} color={GAIN_GREEN} weight="bold" />
        </View>

        {/* ── Headline ─────────────────────────────────────────────────────── */}
        <Text style={[s.headline, { color: C.label }]}>
          {isPending ? 'Booking Requested' : 'Booking Confirmed!'}
        </Text>

        {/* ── Pending subtitle ─────────────────────────────────────────────── */}
        {isPending && (
          <Text style={[s.pendingSubtitle, { color: C.secondary }]}>
            Pending creator approval. You'll be charged when confirmed.
          </Text>
        )}

        {/* ── Summary ──────────────────────────────────────────────────────── */}
        <Text style={[s.summary, { color: C.secondary }]}>
          {params.serviceName ?? 'Session'} with Sammy Kalejaiye
        </Text>

        {/* ── Date + time ──────────────────────────────────────────────────── */}
        <Text style={[s.datetime, { color: C.secondary }]}>
          {params.date ?? ''}{params.date && params.time ? '  ·  ' : ''}{params.time ?? ''}
        </Text>

        {/* ── Action buttons ────────────────────────────────────────────────── */}
        <View style={s.buttonsWrap}>

          {/* Add to Calendar */}
          <Pressable
            style={[s.outlineBtn, { borderColor: C.separator }]}
            onPress={handleAddToCalendar}
          >
            <Text style={[s.outlineBtnText, { color: C.label }]}>Add to Calendar</Text>
          </Pressable>

          {/* Message creator */}
          <Pressable
            style={[s.outlineBtn, { borderColor: C.separator }]}
            onPress={handleMessage}
          >
            <Text style={[s.outlineBtnText, { color: C.label }]}>
              Message Sammy Kalejaiye
            </Text>
          </Pressable>

          {/* Done — filled */}
          <Pressable
            style={[s.filledBtn, { backgroundColor: C.label }]}
            onPress={handleDone}
          >
            <Text style={[s.filledBtnText, { color: C.bg }]}>Done</Text>
          </Pressable>

        </View>

      </View>
    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: {
      flex: 1,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },

    // Checkmark
    checkCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Headline
    headline: {
      fontSize: 24,
      fontWeight: '800',
      textAlign: 'center',
      marginTop: 24,
    },

    // Pending subtitle
    pendingSubtitle: {
      fontSize: 13,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 19,
    },

    // Summary
    summary: {
      fontSize: 15,
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 22,
    },

    // Date + time
    datetime: {
      fontSize: 14,
      textAlign: 'center',
      marginTop: 4,
    },

    // Buttons
    buttonsWrap: {
      width: '100%',
      marginTop: 40,
      gap: 12,
    },
    outlineBtn: {
      width: '100%',
      height: 48,
      borderRadius: 14,
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    outlineBtnText: {
      fontSize: 15,
      fontWeight: '600',
    },
    filledBtn: {
      width: '100%',
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filledBtnText: {
      fontSize: 15,
      fontWeight: '600',
    },
  });
}
