/**
 * Bookings — Follower view.
 * Select a service to book with the creator.
 * Monochrome design system. No blue. No accent.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
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
import { useMode } from '@/context/app-context';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Semantic colors ───────────────────────────────────────────────────────────

const GAIN    = '#5A8A6E';
const CAUTION = '#B8943E';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;

// ── Types ─────────────────────────────────────────────────────────────────────

type AppMode = 'personal' | 'business' | 'education' | 'community' | 'sports';

type Service = {
  id: string;
  name: string;
  category: string;
  duration: string;
  price: number;
  description: string;
  bookedCount: number;
  rating: number;
  popular: boolean;
};

// ── Data ──────────────────────────────────────────────────────────────────────

const BOOKING_TITLE_BY_MODE: Record<AppMode, string> = {
  personal:  'Book a Session',
  business:  'Book a Meeting',
  education: 'Schedule Office Hours',
  community: 'Book a Pastoral Meeting',
  sports:    'Schedule Training Time',
};

const SERVICES_BY_MODE: Record<AppMode, Service[]> = {
  personal: [
    { id: 'p1', name: '1:1 Coaching Session',     category: 'coaching',   duration: '60 min', price: 150, description: 'Personalized strategy session for your creative business. Deep dive into your goals and build a clear plan.',        bookedCount: 47, rating: 4.9, popular: true  },
    { id: 'p2', name: 'Brand Strategy Call',       category: 'strategy',   duration: '45 min', price: 120, description: 'Deep dive into your brand positioning and growth plan. Walk away with clarity and a concrete next step.',          bookedCount: 31, rating: 4.8, popular: false },
    { id: 'p3', name: 'Content Audit Review',      category: 'review',     duration: '30 min', price: 75,  description: 'Review of your content strategy with actionable feedback you can apply right away.',                              bookedCount: 24, rating: 4.7, popular: false },
    { id: 'p4', name: 'Resume / Portfolio Review', category: 'review',     duration: '30 min', price: 60,  description: 'Professional review of your creative portfolio with written feedback and recommendations.',                       bookedCount: 18, rating: 4.6, popular: false },
  ],
  business: [
    { id: 'b1', name: 'Consultation Call',         category: 'consulting', duration: '60 min', price: 200, description: 'One-on-one strategy session with our team to understand your needs and explore solutions.',                       bookedCount: 38, rating: 4.9, popular: true  },
    { id: 'b2', name: 'Product Demo',              category: 'demo',       duration: '45 min', price: 0,   description: 'A live walkthrough of our product tailored to your use case. See how we can solve your specific challenges.',     bookedCount: 55, rating: 4.8, popular: false },
    { id: 'b3', name: 'Partnership Discussion',    category: 'consulting', duration: '60 min', price: 0,   description: 'Explore collaboration and partnership opportunities with our business development team.',                         bookedCount: 22, rating: 4.7, popular: false },
    { id: 'b4', name: 'Onboarding Session',        category: 'onboarding', duration: '30 min', price: 150, description: 'Guided onboarding to get your team up and running quickly with personalized setup support.',                     bookedCount: 19, rating: 4.8, popular: false },
  ],
  education: [
    { id: 'e1', name: 'Office Hours',              category: 'advising',   duration: '30 min', price: 0,   description: 'Drop-in time with faculty to get questions answered and receive course guidance.',                               bookedCount: 62, rating: 4.9, popular: true  },
    { id: 'e2', name: 'Academic Advising',         category: 'advising',   duration: '45 min', price: 0,   description: 'One-on-one session to plan your course schedule and academic path with your advisor.',                           bookedCount: 44, rating: 4.8, popular: false },
    { id: 'e3', name: 'Tutoring Session',          category: 'tutoring',   duration: '60 min', price: 40,  description: 'Focused tutoring on specific topics or assignments. Come prepared with questions or materials.',                 bookedCount: 31, rating: 4.7, popular: false },
    { id: 'e4', name: 'Career Counseling',         category: 'advising',   duration: '45 min', price: 0,   description: 'Career planning session covering internships, job searches, and professional development.',                      bookedCount: 27, rating: 4.8, popular: false },
  ],
  community: [
    { id: 'c1', name: 'Pastoral Counseling',       category: 'pastoral',   duration: '60 min', price: 0,   description: 'A private, supportive conversation with a pastoral team member for guidance and encouragement.',                 bookedCount: 34, rating: 5.0, popular: true  },
    { id: 'c2', name: 'Leadership Meeting',        category: 'leadership', duration: '45 min', price: 0,   description: 'Meet with our leadership team to discuss community initiatives, vision, and your involvement.',                  bookedCount: 21, rating: 4.9, popular: false },
    { id: 'c3', name: 'Prayer Session',            category: 'pastoral',   duration: '30 min', price: 0,   description: 'Scheduled time for personal prayer and reflection with a team member.',                                          bookedCount: 48, rating: 5.0, popular: false },
    { id: 'c4', name: 'Volunteer Orientation',     category: 'onboarding', duration: '60 min', price: 0,   description: 'Introduction to our volunteer programs, expectations, and next steps to get involved.',                         bookedCount: 17, rating: 4.8, popular: false },
  ],
  sports: [
    { id: 's1', name: 'Individual Training',       category: 'training',   duration: '60 min', price: 0,   description: 'One-on-one training session focused on your specific skill development goals.',                                  bookedCount: 41, rating: 4.9, popular: true  },
    { id: 's2', name: 'Film Review Session',       category: 'review',     duration: '45 min', price: 0,   description: 'Review game or practice film with coaching staff to identify areas for improvement.',                            bookedCount: 28, rating: 4.8, popular: false },
    { id: 's3', name: 'Recruiting Call',           category: 'recruiting', duration: '30 min', price: 0,   description: 'Connect with coaching staff about your recruiting profile, highlights, and next steps.',                         bookedCount: 19, rating: 4.9, popular: false },
    { id: 's4', name: 'Skills Assessment',         category: 'training',   duration: '60 min', price: 0,   description: 'Formal evaluation of your current skill set with detailed feedback and a development plan.',                    bookedCount: 15, rating: 4.8, popular: false },
  ],
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function categoryBorderColor(category: string, labelColor: string): string {
  if (['coaching', 'training', 'leadership', 'pastoral'].includes(category)) return labelColor;
  if (['strategy', 'advising', 'tutoring', 'consulting', 'recruiting'].includes(category)) return GAIN;
  return CAUTION;
}

function applyFilter(services: Service[], tab: string): Service[] {
  if (tab === 'Popular') return services.filter(s => s.popular);
  if (tab === 'All') return services;
  return services.filter(s => s.category.toLowerCase() === tab.toLowerCase());
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
        <Text style={[s.servicePrice, { color: C.label }]}>{service.price === 0 ? 'Free' : '$' + service.price}</Text>
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
  const mode = useMode();
  const _rk = mode === 'sports' ? 'sports:agenda' : mode === 'community' ? 'community:agenda' : mode === 'education' ? 'education' : mode === 'business' ? 'business' : 'personal:agenda';
  const [role, cycleRole] = useDemoRole(_rk);
  const [activeFilter, setActiveFilter] = useState<string>('All');

  const activeServices = SERVICES_BY_MODE[mode as AppMode] ?? SERVICES_BY_MODE.personal;
  const filterTabs = useMemo(() => {
    const categories = [...new Set(activeServices.map(s => s.category))];
    return ['All', 'Popular', ...categories.map(c => c.charAt(0).toUpperCase() + c.slice(1))];
  }, [activeServices]);

  useEffect(() => { setActiveFilter('All'); }, [mode]);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const filtered = useMemo(() => applyFilter(activeServices, activeFilter), [activeServices, activeFilter]);

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
            {BOOKING_TITLE_BY_MODE[mode as AppMode] ?? 'Book a Session'} with Sammy
          </Text>
        </View>

        {/* ── Filter pills ──────────────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.filterRow}
          style={s.filterBar}
        >
          {filterTabs.map(tab => {
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
