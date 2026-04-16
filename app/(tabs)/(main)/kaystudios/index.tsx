/**
 * KPlay Browse — Mode-aware content library.
 * KaNeXT-curated content. Same for all roles within a mode.
 */

import React, { useCallback } from 'react';
import {
  View, Text, Pressable, ScrollView, StyleSheet, Animated, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAppContext } from '@/context/app-context';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

// ── Constants ─────────────────────────────────────────────────────────────────

const TOP_BAR_H = 52;
const SCREEN_W  = Dimensions.get('window').width;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

// ── Types & Data ──────────────────────────────────────────────────────────────

type KPType = 'Course' | 'Game' | 'Simulation' | 'Challenge' | 'Quiz' | 'Flashcards' | 'Tool';

type ContentItem = {
  id: string;
  title: string;
  subtitle: string;
  type: KPType;
  price: string;
  coverBg: string;
  coverText: string;
  featured?: boolean;
};

const TYPE_BADGE: Record<string, { bg: string; label: string }> = {
  Course:     { bg: GAIN,      label: 'Course'    },
  Quiz:       { bg: '#1A1714', label: 'Quiz'      },
  Game:       { bg: CAUTION,   label: 'Game'      },
  Simulation: { bg: '#9C9790', label: 'Sim'       },
  Challenge:  { bg: HEAT,      label: 'Challenge' },
  Flashcards: { bg: GAIN,      label: 'Cards'     },
  Tool:       { bg: '#9C9790', label: 'Tool'      },
};

const CONTENT: Record<string, ContentItem[]> = {
  personal: [
    { id: 'p1', title: 'Creator Masterclass: Zero to 10K', subtitle: '8 modules · 4.2 hours',            type: 'Course',     price: '$149',    coverBg: '#0D0B09', coverText: '#E08B6A', featured: true },
    { id: 'p2', title: 'College Basketball GM',            subtitle: 'Build a dynasty from scratch',      type: 'Game',       price: '$9.99',   coverBg: '#132639', coverText: '#F0E8DC', featured: true },
    { id: 'p3', title: 'Basketball IQ Test',               subtitle: 'Scheme knowledge for coaches',      type: 'Quiz',       price: 'Free',    coverBg: '#142236', coverText: '#9BB8D4' },
    { id: 'p4', title: 'NIL for Athletes: The Full Playbook', subtitle: '6 modules · 3 hours',           type: 'Course',     price: '$79',     coverBg: '#2C1E3A', coverText: '#C4B0E0' },
    { id: 'p5', title: 'Brand Deal Simulator',             subtitle: 'Negotiate like a pro creator',      type: 'Simulation', price: 'Free',    coverBg: '#1A1714', coverText: '#E8C97A' },
    { id: 'p6', title: '30-Day Creator Challenge',         subtitle: '30 days of consistent posting',     type: 'Challenge',  price: 'Free',    coverBg: '#1C2E24', coverText: '#A8D4BE' },
  ],
  sports: [
    { id: 's1', title: 'College Basketball GM',            subtitle: 'Build a dynasty from scratch',      type: 'Game',       price: '$9.99',   coverBg: '#132639', coverText: '#F0E8DC', featured: true },
    { id: 's2', title: 'Basketball IQ Course',             subtitle: 'Scheme mastery for all positions',  type: 'Course',     price: 'Included',coverBg: '#1A2E4A', coverText: '#9BB8D4', featured: true },
    { id: 's3', title: 'Spread PnR Playbook Walkthrough',  subtitle: 'Film study · 12 plays',             type: 'Course',     price: 'Included',coverBg: '#142236', coverText: '#D4C4B0' },
    { id: 's4', title: 'NIL Financial Literacy',           subtitle: 'Contracts, taxes, and brand deals', type: 'Course',     price: 'Included',coverBg: '#1C3020', coverText: '#A8D4B8' },
    { id: 's5', title: 'Media Training 101',               subtitle: 'On-camera confidence for athletes', type: 'Course',     price: 'Included',coverBg: '#261D17', coverText: '#D4C4B0' },
    { id: 's6', title: 'GAAC Tournament Bracket Challenge',subtitle: 'Compete with your team',            type: 'Challenge',  price: 'Free',    coverBg: '#2C1818', coverText: '#E8B8B8' },
  ],
  business: [
    { id: 'b1', title: 'Real Estate Tycoon',               subtitle: 'Build a property portfolio',        type: 'Game',       price: 'Free',    coverBg: '#1E3A28', coverText: '#A8D4B8', featured: true },
    { id: 'b2', title: 'KaNeXT Certified Admin',           subtitle: 'Platform mastery certification',    type: 'Course',     price: '$99',     coverBg: '#1A1714', coverText: '#D4C4B0', featured: true },
    { id: 'b3', title: 'ROI Calculator',                   subtitle: 'Campaign and investment returns',   type: 'Tool',       price: 'Free',    coverBg: '#132639', coverText: '#9BB8D4' },
    { id: 'b4', title: 'Institution Builder',              subtitle: 'Scale your org from the ground up', type: 'Game',       price: 'Free',    coverBg: '#261D17', coverText: '#E8C97A' },
    { id: 'b5', title: 'College Basketball GM',            subtitle: 'Build a dynasty from scratch',      type: 'Game',       price: '$9.99',   coverBg: '#132639', coverText: '#F0E8DC' },
  ],
  education: [
    { id: 'e1', title: 'New Student Orientation 2026',     subtitle: 'Required · 8 modules',              type: 'Course',     price: 'Included',coverBg: '#3A2E1A', coverText: '#F0E8DC', featured: true },
    { id: 'e2', title: 'Diagnostic Imaging Career Pathways',subtitle: 'Simulate your future career',      type: 'Simulation', price: 'Free',    coverBg: '#1A2E4A', coverText: '#9BB8D4', featured: true },
    { id: 'e3', title: 'Academic Integrity Module',        subtitle: 'Required · 3 modules',              type: 'Course',     price: 'Included',coverBg: '#1C3020', coverText: '#A8D4B8' },
    { id: 'e4', title: 'BUSN 301 Study Deck',              subtitle: '40 cards · Spaced repetition',      type: 'Flashcards', price: 'Free',    coverBg: '#261D17', coverText: '#D4C4B0' },
    { id: 'e5', title: 'GPA Calculator',                   subtitle: 'Plan your semester',                type: 'Tool',       price: 'Free',    coverBg: '#142236', coverText: '#9BB8D4' },
    { id: 'e6', title: 'Lincoln University History Trivia',subtitle: '20 questions about your school',    type: 'Quiz',       price: 'Free',    coverBg: '#2A1E0E', coverText: '#E8C97A' },
  ],
  community: [
    { id: 'c1', title: 'Rooted: Discover Your Place',      subtitle: 'Finding your purpose in community', type: 'Course',     price: 'Free',    coverBg: '#1C3020', coverText: '#A8D4B8', featured: true },
    { id: 'c2', title: '30-Day Prayer Challenge',          subtitle: 'Build a daily prayer habit',        type: 'Challenge',  price: 'Free',    coverBg: '#1E1A30', coverText: '#C4B8E0', featured: true },
    { id: 'c3', title: 'ICCLA Bible Trivia',               subtitle: 'Test your scripture knowledge',     type: 'Quiz',       price: 'Free',    coverBg: '#142236', coverText: '#9BB8D4' },
    { id: 'c4', title: 'Books of the Bible Speed Challenge',subtitle: 'How fast can you name them all?',  type: 'Challenge',  price: 'Free',    coverBg: '#2A1E0E', coverText: '#E8C97A' },
    { id: 'c5', title: 'Sheepfold Volunteer Safety Training',subtitle: 'Required for all volunteers',     type: 'Course',     price: 'Free',    coverBg: '#1A1714', coverText: '#D4C4B0' },
    { id: 'c6', title: 'Scripture Memory: Psalms',         subtitle: '30 cards · Key verses',             type: 'Flashcards', price: 'Free',    coverBg: '#1C1A10', coverText: '#D4C09A' },
  ],
};

// ── FeaturedCard ──────────────────────────────────────────────────────────────

function FeaturedCard({ item }: { item: ContentItem }) {
  const badge = TYPE_BADGE[item.type] ?? TYPE_BADGE.Game;
  return (
    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, width: SCREEN_W - 48, marginRight: 12 })}>
      <View style={{ width: SCREEN_W - 48, height: 180, borderRadius: 14, backgroundColor: item.coverBg, overflow: 'hidden', justifyContent: 'flex-end', padding: 14 }}>
        <View style={{ position: 'absolute', top: 10, left: 10, backgroundColor: badge.bg, borderRadius: 5, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontSize: 10, fontWeight: '700', color: '#fff' }}>{badge.label}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <View style={{ flex: 1, marginRight: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: item.coverText, lineHeight: 21 }} numberOfLines={2}>{item.title}</Text>
            <Text style={{ fontSize: 12, color: item.coverText, opacity: 0.7, marginTop: 3 }} numberOfLines={1}>{item.subtitle}</Text>
          </View>
          <View style={{ backgroundColor: 'rgba(0,0,0,0.35)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: '#fff' }}>{item.price}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ── ContentRow ────────────────────────────────────────────────────────────────

function ContentRow({ item, C }: { item: ContentItem; C: ComponentColors }) {
  const badge = TYPE_BADGE[item.type] ?? TYPE_BADGE.Game;
  return (
    <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.88 : 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 })}>
      <View style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: item.coverBg, justifyContent: 'flex-end', padding: 6, marginRight: 14, flexShrink: 0 }}>
        <View style={{ backgroundColor: badge.bg, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 2, alignSelf: 'flex-start' }}>
          <Text style={{ fontSize: 8, fontWeight: '700', color: '#fff' }}>{badge.label}</Text>
        </View>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: '600', color: C.label }} numberOfLines={1}>{item.title}</Text>
        <Text style={{ fontSize: 12, color: C.secondary, marginTop: 2 }} numberOfLines={1}>{item.subtitle}</Text>
        <Text style={{ fontSize: 12, fontWeight: '600', color: C.label, marginTop: 4 }}>{item.price}</Text>
      </View>
      <Text style={{ fontSize: 20, color: C.secondary, marginLeft: 8 }}>›</Text>
    </Pressable>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function KPlayBrowseScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const { state } = useAppContext();
  const mode    = state.activeContext?.mode ?? state.mode ?? 'personal';
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);

  const roleKey = `${mode}:kaystudios` as any;
  const [role, cycleRole, roleCycles] = useDemoRole(roleKey);
  const isAdmin = role === roleCycles[0];

  const items    = CONTENT[mode] ?? CONTENT.personal;
  const featured = items.filter(i => i.featured);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, backgroundColor: C.bg, opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
              <KMenuButton />
            </Pressable>
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6, borderWidth: StyleSheet.hairlineWidth, borderColor: C.separator }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>Browse</Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isAdmin} />
          </View>
        </View>
      </Animated.View>

      {/* ── Content ── */}
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 20, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >

        {/* Featured */}
        {featured.length > 0 && (
          <View style={{ marginBottom: 28 }}>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 12 }}>
              Featured
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
              {featured.map(item => <FeaturedCard key={item.id} item={item} />)}
            </ScrollView>
          </View>
        )}

        {/* All Content */}
        <View>
          <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, paddingHorizontal: 16, marginBottom: 4 }}>
            All Content
          </Text>
          {items.map((item, i) => (
            <View key={item.id}>
              {i > 0 && <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: C.separator, marginLeft: 94 }} />}
              <ContentRow item={item} C={C} />
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}
