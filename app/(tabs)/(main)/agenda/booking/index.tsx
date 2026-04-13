/**
 * Bookings — Follower view.
 * Select a service to book with the creator.
 * Monochrome design system. No blue. No accent.
 */

import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { openSidePanel } from '@/utils/global-side-panel';
import { openDipsonSheet } from '@/utils/global-dipson-sheet';
import { resetFooter } from '@/utils/global-footer-hide';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Semantic colors ───────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// ── Types ─────────────────────────────────────────────────────────────────────

type ServiceCategory = 'coaching' | 'strategy' | 'review';
type FilterTab = 'All' | 'Popular' | 'Coaching' | 'Strategy' | 'Reviews';

type Service = {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: string;
  price: number;
  description: string;
  bookedCount: number;
  rating: number;
  popular: boolean;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const FILTER_TABS: FilterTab[] = ['All', 'Popular', 'Coaching', 'Strategy', 'Reviews'];

const SERVICES: Service[] = [
  {
    id: '1',
    name: '1:1 Coaching Session',
    category: 'coaching',
    duration: '60 min',
    price: 150,
    description: 'Personalized strategy session for your creative business. Deep dive into your goals and build a clear plan.',
    bookedCount: 47,
    rating: 4.9,
    popular: true,
  },
  {
    id: '2',
    name: 'Brand Strategy Call',
    category: 'strategy',
    duration: '45 min',
    price: 120,
    description: 'Deep dive into your brand positioning and growth plan. Walk away with clarity and a concrete next step.',
    bookedCount: 31,
    rating: 4.8,
    popular: false,
  },
  {
    id: '3',
    name: 'Content Audit Review',
    category: 'review',
    duration: '30 min',
    price: 75,
    description: 'Review of your content strategy with actionable feedback you can apply right away.',
    bookedCount: 24,
    rating: 4.7,
    popular: false,
  },
  {
    id: '4',
    name: 'Resume / Portfolio Review',
    category: 'review',
    duration: '30 min',
    price: 60,
    description: 'Professional review of your creative portfolio with written feedback and recommendations.',
    bookedCount: 18,
    rating: 4.6,
    popular: false,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function categoryBorderColor(category: ServiceCategory, labelColor: string): string {
  switch (category) {
    case 'coaching': return labelColor;
    case 'strategy': return GAIN;
    case 'review':   return CAUTION;
  }
}

function applyFilter(services: Service[], tab: FilterTab): Service[] {
  switch (tab) {
    case 'Popular':  return services.filter(s => s.popular);
    case 'Coaching': return services.filter(s => s.category === 'coaching');
    case 'Strategy': return services.filter(s => s.category === 'strategy');
    case 'Reviews':  return services.filter(s => s.category === 'review');
    default:         return services;
  }
}

// ── Star row ──────────────────────────────────────────────────────────────────

function StarRow({ rating, s }: { rating: number; s: ReturnType<typeof makeStyles> }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <View style={s.starRow}>
      {Array.from({ length: 5 }, (_, i) => (
        <IconSymbol
          key={i}
          name={i < full ? 'star.fill' : (!full && half && i === full) || (half && i === full) ? 'star.leadinghalf.filled' : 'star'}
          size={11}
          color={CAUTION}
        />
      ))}
      <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
    </View>
  );
}

// ── Service card ──────────────────────────────────────────────────────────────

function ServiceCard({
  service,
  C,
  s,
  onPress,
}: {
  service: Service;
  C: ComponentColors;
  s: ReturnType<typeof makeStyles>;
  onPress: () => void;
}) {
  const borderColor = categoryBorderColor(service.category, C.label);

  return (
    <Pressable
      style={({ pressed }) => [
        s.card,
        {
          backgroundColor: C.surface,
          borderLeftColor: borderColor,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
      onPress={onPress}
    >
      {/* Most Popular badge */}
      {service.popular && (
        <View style={[s.popularBadge, { backgroundColor: C.label }]}>
          <Text style={[s.popularBadgeText, { color: C.bg }]}>Most Popular</Text>
        </View>
      )}

      {/* Top row: name + price */}
      <View style={s.cardTopRow}>
        <Text style={[s.serviceName, { color: C.label }]} numberOfLines={1}>
          {service.name}
        </Text>
        <Text style={[s.servicePrice, { color: C.label }]}>${service.price}</Text>
      </View>

      {/* Duration pill */}
      <View style={[s.durationPill, { backgroundColor: C.separator }]}>
        <Text style={[s.durationText, { color: C.secondary }]}>{service.duration}</Text>
      </View>

      {/* Description */}
      <Text style={[s.serviceDesc, { color: C.secondary }]} numberOfLines={2}>
        {service.description}
      </Text>

      {/* Social proof */}
      <View style={s.proofRow}>
        <IconSymbol name="person.2.fill" size={12} color={C.secondary} />
        <Text style={[s.bookedText, { color: C.secondary }]}>{service.bookedCount} booked</Text>
        <View style={[s.proofDot, { backgroundColor: C.separator }]} />
        <StarRow rating={service.rating} s={s} />
      </View>
    </Pressable>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function BookingSelectServiceScreen() {
  const C = useColors();
  const s = useMemo(() => makeStyles(C), [C]);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader();
  const [role, cycleRole] = useDemoRole('personal:agenda');
  const [activeFilter, setActiveFilter] = useState<FilterTab>('All');

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => applyFilter(SERVICES, activeFilter), [activeFilter]);

  function handleServicePress(item: Service) {
    Haptics.selectionAsync();
    router.push({
      pathname: '/(tabs)/(main)/agenda/booking/time',
      params: {
        serviceId: item.id,
        serviceName: item.name,
        price: item.price,
        duration: item.duration,
      },
    });
  }

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.topBarOuter,
          { paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator, opacity },
        ]}
      >
        <View style={s.topBar}>
          <Pressable
            style={s.kBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}
            hitSlop={8}
          >
            <KMenuButton />
          </Pressable>

          <View style={{ flex: 1, alignItems: 'center' }}>
            <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <Text style={[s.titlePillText, { color: C.label }]}>Bookings</Text>
            </View>
          </View>

          <View style={s.rolePillWrap}>
            <RolePill role={role} onPress={cycleRole} isPrimary={false} />
          </View>
        </View>
      </Animated.View>

      {/* ── Scrollable content ────────────────────────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.scrollContent,
          { paddingTop: insets.top + TOP_BAR_H + 16, paddingBottom: insets.bottom + 80 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
      >

        {/* ── Creator identity block ────────────────────────────────────────── */}
        <View style={[s.identityBlock, { backgroundColor: C.surface }]}>
          <View style={s.identityRow}>
            <View style={[s.creatorAvatar, { backgroundColor: C.separator }]}>
              <IconSymbol name="person.fill" size={22} color={C.secondary} />
            </View>
            <View style={s.identityMeta}>
              <Text style={[s.creatorName, { color: C.label }]}>Sammy Kalejaiye</Text>
              <Text style={[s.creatorHandle, { color: C.secondary }]}>@sammyk</Text>
            </View>
          </View>
          <Text style={[s.identityTagline, { color: C.secondary }]}>
            Book a session with Sammy
          </Text>
        </View>

        {/* ── Filter pills ──────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
          style={s.filterBar}
        >
          {FILTER_TABS.map(tab => {
            const active = activeFilter === tab;
            return (
              <Pressable
                key={tab}
                style={[
                  s.filterPill,
                  active
                    ? { backgroundColor: C.activePill }
                    : { backgroundColor: C.surface, borderColor: C.separator },
                ]}
                onPress={() => { Haptics.selectionAsync(); setActiveFilter(tab); }}
              >
                <Text style={[s.filterPillText, { color: active ? C.activePillText : C.secondary }]}>
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Service cards ─────────────────────────────────────────────────── */}
        <View style={s.cardList}>
          {filtered.map(item => (
            <ServiceCard
              key={item.id}
              service={item}
              C={C}
              s={s}
              onPress={() => handleServicePress(item)}
            />
          ))}
        </View>

        {/* ── Dipson nudge ──────────────────────────────────────────────────── */}
        <Pressable
          style={[s.dipsonNudge, { backgroundColor: C.surface }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            openDipsonSheet("I can help you pick the right session based on what you need.");
          }}
        >
          <IconSymbol name="sparkles" size={15} color={C.secondary} />
          <Text style={[s.dipsonNudgeText, { color: C.secondary }]}>
            Not sure which session is right for you?
          </Text>
          <Text style={[s.dipsonLink, { color: C.label }]}>Ask Dipson</Text>
          <IconSymbol name="chevron.right" size={12} color={C.secondary} />
        </Pressable>

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
      paddingHorizontal: 12,
    },
    kBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    titlePill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14, borderWidth: 1 },
    titlePillText: { fontSize: 12, fontWeight: '600', letterSpacing: 0.3 },
    rolePillWrap: { width: 80, alignItems: 'flex-end', justifyContent: 'center' },

    // Scroll
    scrollContent: { paddingHorizontal: 16 },

    // Creator identity block
    identityBlock: {
      borderRadius: 14,
      padding: 16,
      marginBottom: 14,
    },
    identityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8,
    },
    creatorAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },
    identityMeta: { gap: 2 },
    creatorName: { fontSize: 16, fontWeight: '700' },
    creatorHandle: { fontSize: 13 },
    identityTagline: { fontSize: 14, lineHeight: 20 },

    // Filter bar
    filterBar: { maxHeight: 44, marginBottom: 14 },
    filterRow: { gap: 8, alignItems: 'center', paddingVertical: 6 },
    filterPill: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 14,
      borderWidth: 1,
    },
    filterPillText: { fontSize: 13, fontWeight: '500' },

    // Card list
    cardList: { gap: 10, marginBottom: 20 },

    // Service card
    card: {
      borderRadius: 14,
      padding: 16,
      borderLeftWidth: 3,
    },
    popularBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 10,
    },
    popularBadgeText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 8,
    },
    serviceName: { fontSize: 17, fontWeight: '700', flex: 1 },
    servicePrice: { fontSize: 20, fontWeight: '800' },

    durationPill: {
      alignSelf: 'flex-start',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
      marginBottom: 10,
    },
    durationText: { fontSize: 12, fontWeight: '500' },

    serviceDesc: { fontSize: 13, lineHeight: 19, marginBottom: 12 },

    // Social proof
    proofRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    bookedText: { fontSize: 12 },
    proofDot: { width: 3, height: 3, borderRadius: 1.5 },
    starRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
    ratingText: { fontSize: 12, color: C.secondary, marginLeft: 3 },

    // Dipson nudge
    dipsonNudge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderRadius: 12,
      padding: 14,
    },
    dipsonNudgeText: { flex: 1, fontSize: 13 },
    dipsonLink: { fontSize: 13, fontWeight: '600' },
  });
}
