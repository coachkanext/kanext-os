/**
 * Booking Flow — Step 3: Confirm & Pay
 * Monochrome design system. No blue. No accent.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// ── Detail row ────────────────────────────────────────────────────────────────

type DetailRowProps = {
  iconName: string;
  label: string;
  value: string;
  bold?: boolean;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
};

function DetailRow({ iconName, label, value, bold = false, C, s }: DetailRowProps) {
  return (
    <View style={s.detailRow}>
      <View style={s.detailLeft}>
        <IconSymbol name={iconName as any} size={15} color={C.secondary} />
        <Text style={[s.detailLabel, { color: C.secondary }]}>{label}</Text>
      </View>
      <Text style={[s.detailValue, { color: C.label, fontWeight: bold ? '700' : '500' }]}>
        {value}
      </Text>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function BookingConfirmScreen() {
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
  }>();

  const [note, setNote] = useState('');

  function handleBook() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.replace({
      pathname: '/(tabs)/(main)/agenda/booking/success',
      params: {
        serviceId: params.serviceId,
        serviceName: params.serviceName,
        price: params.price,
        duration: params.duration,
        date: params.date,
        time: params.time,
      },
    });
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ──────────────────────────────────────────────────────────── */}
      <View style={[s.topBarOuter, { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        <View style={s.topBar}>

          {/* Back */}
          <Pressable
            style={s.topBarBack}
            onPress={() => {
              Haptics.selectionAsync();
              router.back();
            }}
            hitSlop={8}
          >
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>

          {/* Title */}
          <View style={s.topBarCenter}>
            <Text style={[s.topBarTitle, { color: C.label }]}>Confirm Booking</Text>
          </View>

          {/* Spacer */}
          <View style={s.topBarSpacer} />

        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Confirmation card ─────────────────────────────────────────────── */}
        <View style={[s.confirmCard, { backgroundColor: C.surface }]}>

          {/* Creator row */}
          <View style={s.creatorRow}>
            <View style={[s.creatorAvatar, { backgroundColor: C.separator }]} />
            <View style={s.creatorInfo}>
              <Text style={[s.creatorName, { color: C.label }]}>Sammy Kalejaiye</Text>
              <Text style={[s.creatorHandle, { color: C.secondary }]}>@sammyk</Text>
            </View>
          </View>

          {/* Separator */}
          <View style={[s.separator, { backgroundColor: C.separator }]} />

          {/* Detail rows */}
          <DetailRow
            iconName="calendar"
            label="Service"
            value={params.serviceName ?? '—'}
            C={C}
            s={s}
          />
          <DetailRow
            iconName="clock"
            label="Duration"
            value={params.duration ?? '—'}
            C={C}
            s={s}
          />
          <DetailRow
            iconName="calendar.badge.clock"
            label="Date"
            value={params.date ?? '—'}
            C={C}
            s={s}
          />
          <DetailRow
            iconName="clock.fill"
            label="Time"
            value={params.time ?? '—'}
            C={C}
            s={s}
          />
          <DetailRow
            iconName="dollarsign.circle"
            label="Total"
            value={`$${params.price ?? '0'}`}
            bold
            C={C}
            s={s}
          />

        </View>

        {/* ── Notes field ───────────────────────────────────────────────────── */}
        <TextInput
          style={[s.notesInput, { backgroundColor: C.surface, color: C.label }]}
          placeholder="Add a note for the creator..."
          placeholderTextColor={C.secondary}
          multiline
          value={note}
          onChangeText={setNote}
          textAlignVertical="top"
        />

        {/* ── Book button ───────────────────────────────────────────────────── */}
        <Pressable
          style={[s.bookBtn, { backgroundColor: C.label }]}
          onPress={handleBook}
        >
          <Text style={[s.bookBtnText, { color: C.bg }]}>
            Book and Pay · ${params.price ?? '0'}
          </Text>
        </Pressable>

        {/* ── Payment note ──────────────────────────────────────────────────── */}
        <Text style={[s.paymentNote, { color: C.secondary }]}>
          Payment processed securely through KPay
        </Text>

      </ScrollView>

    </View>
  );
}

// ── makeStyles ────────────────────────────────────────────────────────────────

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root: { flex: 1 },

    // Top bar
    topBarOuter: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBar: {
      height: TOP_BAR_H,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
    },
    topBarBack: {
      width: 44,
      height: TOP_BAR_H,
      justifyContent: 'center',
    },
    topBarCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarTitle: {
      fontSize: 16,
      fontWeight: '700',
    },
    topBarSpacer: {
      width: 44,
    },

    // Scroll
    scrollContent: {
      paddingHorizontal: 16,
    },

    // Confirmation card
    confirmCard: {
      borderRadius: 16,
      padding: 20,
      marginBottom: 12,
    },

    // Creator row
    creatorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    creatorAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
    },
    creatorInfo: {
      gap: 2,
    },
    creatorName: {
      fontSize: 15,
      fontWeight: '700',
    },
    creatorHandle: {
      fontSize: 12,
    },

    // Separator
    separator: {
      height: StyleSheet.hairlineWidth,
      marginVertical: 16,
    },

    // Detail rows
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    detailLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    detailLabel: {
      fontSize: 14,
    },
    detailValue: {
      fontSize: 14,
      flexShrink: 1,
      textAlign: 'right',
      marginLeft: 16,
    },

    // Notes input
    notesInput: {
      borderRadius: 12,
      padding: 14,
      marginBottom: 20,
      minHeight: 80,
      fontSize: 14,
      lineHeight: 20,
    },

    // Book button
    bookBtn: {
      height: 52,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    bookBtnText: {
      fontSize: 16,
      fontWeight: '700',
    },

    // Payment note
    paymentNote: {
      fontSize: 11,
      textAlign: 'center',
      marginTop: 10,
    },
  });
}
