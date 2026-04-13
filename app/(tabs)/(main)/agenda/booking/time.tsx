/**
 * Booking Flow — Step 2: Pick a Time
 * Monochrome design system. No blue. No accent.
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColors, type ComponentColors } from '@/hooks/use-colors';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// Available days of week (0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
const AVAILABLE_DOW = new Set([1, 3, 5, 6]); // Mon, Wed, Fri, Sat

const TIME_SLOTS = ['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM'];

const DAY_ABBRS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ── Date generation ───────────────────────────────────────────────────────────

type CalendarDay = {
  key: string;        // 'YYYY-MM-DD'
  dayAbbr: string;    // 'Mon'
  dateNum: number;    // 13
  available: boolean;
};

function generateDays(): CalendarDay[] {
  // Hardcoded start: Apr 13 2026 (today)
  const start = new Date(2026, 3, 13); // month is 0-indexed
  const days: CalendarDay[] = [];

  for (let i = 0; i < 28; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    const year  = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const date  = String(d.getDate()).padStart(2, '0');
    const key   = `${year}-${month}-${date}`;
    const dow   = d.getDay();

    days.push({
      key,
      dayAbbr: DAY_ABBRS[dow],
      dateNum: d.getDate(),
      available: AVAILABLE_DOW.has(dow),
    });
  }

  return days;
}

const CALENDAR_DAYS = generateDays();

// ── Main screen ───────────────────────────────────────────────────────────────

export default function BookingTimeScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    serviceId: string;
    serviceName: string;
    price: string;
    duration: string;
  }>();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const canContinue = selectedDate !== null && selectedTime !== null;

  function handleDatePress(day: CalendarDay) {
    if (!day.available) return;
    Haptics.selectionAsync();
    setSelectedDate(day.key);
    setSelectedTime(null); // reset time when date changes
  }

  function handleTimePress(slot: string) {
    Haptics.selectionAsync();
    setSelectedTime(slot);
  }

  function handleContinue() {
    if (!canContinue) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: '/(tabs)/(main)/agenda/booking/confirm',
      params: {
        serviceId: params.serviceId,
        serviceName: params.serviceName,
        price: params.price,
        duration: params.duration,
        date: selectedDate!,
        time: selectedTime!,
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

          {/* Center pills */}
          <View style={s.topBarCenter}>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.pillText, { color: C.label }]} numberOfLines={1}>
                {params.serviceName ?? 'Service'}
              </Text>
            </View>
            <View style={[s.pill, { backgroundColor: C.surface, borderColor: C.separator, marginLeft: 6 }]}>
              <Text style={[s.pillText, { color: C.label }]}>
                ${params.price ?? '0'}
              </Text>
            </View>
          </View>

          {/* Spacer to balance back button */}
          <View style={s.topBarSpacer} />

        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + TOP_BAR_H + 20, paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Section header ────────────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.secondary }]}>Select a date</Text>

        {/* ── Week strip ────────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.weekStrip}
        >
          {CALENDAR_DAYS.map((day) => {
            const isSelected = selectedDate === day.key;
            return (
              <Pressable
                key={day.key}
                style={s.dayCell}
                onPress={() => handleDatePress(day)}
                disabled={!day.available}
              >
                <Text
                  style={[
                    s.dayAbbr,
                    {
                      color: day.available
                        ? isSelected ? C.activePillText : C.secondary
                        : C.secondary,
                      opacity: day.available ? 1 : 0.3,
                    },
                  ]}
                >
                  {day.dayAbbr}
                </Text>
                <View
                  style={[
                    s.dateNumContainer,
                    isSelected && { backgroundColor: C.activePill },
                  ]}
                >
                  <Text
                    style={[
                      s.dateNum,
                      {
                        color: isSelected
                          ? C.activePillText
                          : day.available
                          ? C.label
                          : C.secondary,
                        opacity: day.available ? 1 : 0.3,
                      },
                    ]}
                  >
                    {day.dateNum}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Time slots ────────────────────────────────────────────────────── */}
        <Text style={[s.sectionHeader, { color: C.secondary, marginTop: 24 }]}>Select a time</Text>

        {selectedDate === null ? (
          <Text style={[s.noDateText, { color: C.secondary }]}>
            Select a date above to see available times
          </Text>
        ) : (
          <View style={s.timeSlotsWrap}>
            {TIME_SLOTS.map((slot) => {
              const isSelected = selectedTime === slot;
              return (
                <Pressable
                  key={slot}
                  style={[
                    s.timeSlot,
                    {
                      backgroundColor: isSelected ? C.activePill : C.surface,
                      borderColor: isSelected ? C.activePill : C.separator,
                    },
                  ]}
                  onPress={() => handleTimePress(slot)}
                >
                  <Text style={[s.timeSlotText, { color: isSelected ? C.activePillText : C.label }]}>
                    {slot}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* ── Continue button ───────────────────────────────────────────────────── */}
      <View style={[s.footerWrap, { paddingBottom: insets.bottom + 16, backgroundColor: C.bg }]}>
        <Pressable
          style={[
            s.continueBtn,
            { backgroundColor: C.label, opacity: canContinue ? 1 : 0.4 },
          ]}
          onPress={handleContinue}
          disabled={!canContinue}
        >
          <Text style={[s.continueBtnText, { color: C.bg }]}>Continue</Text>
        </Pressable>
      </View>

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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    topBarSpacer: {
      width: 44,
    },
    pill: {
      paddingHorizontal: 12,
      paddingVertical: 5,
      borderRadius: 14,
      borderWidth: 1,
      maxWidth: 160,
    },
    pillText: {
      fontSize: 12,
      fontWeight: '600',
    },

    // Scroll
    scrollContent: {
      paddingHorizontal: 16,
    },

    // Section header
    sectionHeader: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 12,
    },

    // Week strip
    weekStrip: {
      gap: 8,
      paddingRight: 4,
    },
    dayCell: {
      alignItems: 'center',
      width: 52,
    },
    dayAbbr: {
      fontSize: 11,
      fontWeight: '600',
      marginBottom: 4,
    },
    dateNumContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dateNum: {
      fontSize: 15,
      fontWeight: '700',
    },

    // No date message
    noDateText: {
      fontSize: 13,
      textAlign: 'center',
      paddingVertical: 20,
    },

    // Time slots
    timeSlotsWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    timeSlot: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 14,
      borderWidth: 1,
    },
    timeSlotText: {
      fontSize: 14,
      fontWeight: '600',
    },

    // Footer / Continue button
    footerWrap: {
      paddingHorizontal: 16,
      paddingTop: 12,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: 'rgba(0,0,0,0.06)',
    },
    continueBtn: {
      height: 48,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    continueBtnText: {
      fontSize: 15,
      fontWeight: '700',
    },
  });
}
