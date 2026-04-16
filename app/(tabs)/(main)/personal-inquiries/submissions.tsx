/**
 * Submissions — Follower's history of proposals sent to this creator.
 * List view with status pills. Tap to see read-only proposal detail.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { KMenuButton } from '@/components/ui/k-menu-button';
import { RolePill } from '@/components/ui/role-pill';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { useDemoRole } from '@/utils/demo-role-store';
import { useScrollHeader } from '@/hooks/use-scroll-header';

const TOP_BAR_H = 52;
const GAIN      = '#5A8A6E';
const CAUTION   = '#B8943E';
const HEAT      = '#B85C5C';

type SubmissionStatus = 'Submitted' | 'Under Review' | 'Accepted' | 'Declined';

type Submission = {
  id: string;
  serviceType: string;
  title: string;
  date: string;
  status: SubmissionStatus;
  company: string;
  email: string;
  budget: string;
  timeline: string;
  description: string;
  creatorResponse?: string;
};

const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 's1',
    serviceType: 'Brand Ambassador',
    title: 'Long-term Nike partnership proposal',
    date: 'Apr 8, 2026',
    status: 'Under Review',
    company: 'Nike',
    email: 'you@email.com',
    budget: '$25K–$50K',
    timeline: 'Q3 2026',
    description: "I'd love to be considered as a brand ambassador for the Nike Training division. My audience is 85% athletes aged 18–34, and I have a track record of driving real conversion for athletic brands.",
  },
  {
    id: 's2',
    serviceType: 'Speaking / Keynote',
    title: 'Creator Economy Summit Keynote',
    date: 'Mar 20, 2026',
    status: 'Accepted',
    company: 'Events Co.',
    email: 'you@email.com',
    budget: '$5K–$10K',
    timeline: 'July 18, 2026',
    description: "Reaching out about a potential keynote at the Creator Economy Summit. I believe the audience would benefit from your perspective on building sustainable creator businesses beyond social media.",
    creatorResponse: "Love this — let's make it happen. I'll have my team follow up with contract details.",
  },
  {
    id: 's3',
    serviceType: '1-on-1 Coaching',
    title: '3-month intensive coaching request',
    date: 'Apr 12, 2026',
    status: 'Submitted',
    company: '',
    email: 'you@email.com',
    budget: '$2K–$5K',
    timeline: 'Starting May 2026',
    description: "I'm a creator with 12K YouTube subscribers looking to break into brand deals. I need help with my pitch deck and outreach strategy. Would love a 3-month program.",
  },
  {
    id: 's4',
    serviceType: 'Sponsored Reel',
    title: 'App launch reel collaboration',
    date: 'Feb 15, 2026',
    status: 'Declined',
    company: 'SomeApp Inc.',
    email: 'you@email.com',
    budget: '$5K–$10K',
    timeline: 'March 2026',
    description: "We're launching a new productivity app and would love a sponsored reel. Reach of 180K on Instagram. Open to creative direction.",
    creatorResponse: "Thanks for reaching out — this one isn't the right fit for my audience right now, but feel free to follow up in Q4.",
  },
];

const STATUS_CONFIG: Record<SubmissionStatus, { color: string }> = {
  Submitted:    { color: '#9C9790'  },
  'Under Review': { color: CAUTION  },
  Accepted:     { color: GAIN       },
  Declined:     { color: HEAT       },
};

export default function SubmissionsScreen() {
  const C       = useColors();
  const insets  = useSafeAreaInsets();
  const topBarH = insets.top + TOP_BAR_H;
  const { opacity, onScroll, scrollEventThrottle } = useScrollHeader(topBarH);
  const [role, cycleRole, roleCycles] = useDemoRole('personal:inquiries');
  const isOwner = role === roleCycles[0];
  const router  = useRouter();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = React.useRef<any>(null);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const selected = MOCK_SUBMISSIONS.find(s => s.id === selectedId) ?? null;

  function goBack() {
    setSelectedId(null);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  // ── Detail view ─────────────────────────────────────────────────────────────

  function renderDetail(sub: Submission) {
    const { color } = STATUS_CONFIG[sub.status];
    return (
      <View style={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 80, paddingTop: 8 }}>
        {/* Back */}
        <Pressable
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goBack(); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 16, paddingVertical: 4 }}
        >
          <IconSymbol name="chevron.left" size={14} color={C.secondary} />
          <Text style={{ fontSize: 14, fontWeight: '500', color: C.secondary }}>Submissions</Text>
        </Pressable>

        {/* Header card */}
        <GlassView tier={1} style={{ borderRadius: 14, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, lineHeight: 22 }}>{sub.title}</Text>
              <Text style={{ fontSize: 12, color: C.secondary }}>{sub.date}</Text>
            </View>
            <View style={{ backgroundColor: `${color}20`, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '700', color }}>{sub.status}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ backgroundColor: C.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                {sub.serviceType}
              </Text>
            </View>
            {sub.budget ? (
              <View style={{ backgroundColor: C.surface, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontSize: 11, fontWeight: '600', color: C.secondary }}>{sub.budget}</Text>
              </View>
            ) : null}
          </View>
        </GlassView>

        {/* Submission details */}
        <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
          Your Proposal
        </Text>
        <GlassView tier={1} style={{ borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
          <View style={{ padding: 14, gap: 10 }}>
            {sub.company ? (
              <DetailRow label="Company" value={sub.company} C={C} />
            ) : null}
            <DetailRow label="Email" value={sub.email} C={C} />
            {sub.timeline ? (
              <DetailRow label="Timeline" value={sub.timeline} C={C} />
            ) : null}
          </View>
          <View style={{ borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator, padding: 14 }}>
            <Text style={{ fontSize: 14, color: C.label, lineHeight: 21 }}>{sub.description}</Text>
          </View>
        </GlassView>

        {/* Creator response */}
        {sub.creatorResponse ? (
          <>
            <Text style={{ fontSize: 11, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 8 }}>
              Creator Response
            </Text>
            <GlassView tier={1} style={{ borderRadius: 14, padding: 14, marginBottom: 16 }}>
              <Text style={{ fontSize: 14, color: C.label, lineHeight: 21 }}>{sub.creatorResponse}</Text>
            </GlassView>
          </>
        ) : null}
      </View>
    );
  }

  // ── List view ───────────────────────────────────────────────────────────────

  function renderList() {
    if (MOCK_SUBMISSIONS.length === 0) {
      return (
        <View style={{ alignItems: 'center', paddingHorizontal: 32, paddingTop: 48, gap: 12 }}>
          <IconSymbol name="tray" size={44} color={C.secondary} />
          <Text style={{ fontSize: 16, fontWeight: '700', color: C.label, textAlign: 'center' }}>
            No submissions yet
          </Text>
          <Text style={{ fontSize: 14, color: C.secondary, textAlign: 'center', lineHeight: 20 }}>
            Head to Collaborate to submit a proposal.
          </Text>
          <Pressable
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.navigate('/(tabs)/(main)/personal-inquiries/collaborate' as any); }}
            style={{ backgroundColor: C.label, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 11, marginTop: 4 }}
          >
            <Text style={{ fontSize: 14, fontWeight: '700', color: C.bg }}>Go to Collaborate</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={{ paddingHorizontal: 16, gap: 10 }}>
        {MOCK_SUBMISSIONS.map(sub => {
          const { color } = STATUS_CONFIG[sub.status];
          return (
            <Pressable
              key={sub.id}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSelectedId(sub.id); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}
              style={({ pressed }) => ({
                backgroundColor: C.surface, borderRadius: 14, padding: 14,
                flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              {/* Service type badge */}
              <View style={{ paddingTop: 2 }}>
                <View style={{ backgroundColor: C.separator, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: C.secondary, textTransform: 'uppercase', letterSpacing: 0.3 }} numberOfLines={1}>
                    {sub.serviceType.split(' ').slice(0, 2).join(' ')}
                  </Text>
                </View>
              </View>

              {/* Title + date */}
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: C.label }} numberOfLines={2}>
                  {sub.title}
                </Text>
                <Text style={{ fontSize: 12, color: C.secondary }}>{sub.date}</Text>
              </View>

              {/* Status pill + chevron */}
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <View style={{ backgroundColor: `${color}20`, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 }}>
                  <Text style={{ fontSize: 11, fontWeight: '700', color }}>{sub.status}</Text>
                </View>
                <IconSymbol name="chevron.right" size={12} color={C.secondary} />
              </View>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // ── Shell ───────────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>

      {/* ── Top Bar ── */}
      <Animated.View style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        paddingTop: insets.top, backgroundColor: C.bg, opacity,
        borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: C.separator,
      }}>
        <View style={{ height: TOP_BAR_H, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }}>
          <View style={{ flex: 1 }}>
            {selected ? (
              <Pressable
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); goBack(); }}
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
              >
                <IconSymbol name="chevron.left" size={20} color={C.label} />
              </Pressable>
            ) : (
              <Pressable onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); openSidePanel(); }}>
                <KMenuButton />
              </Pressable>
            )}
          </View>
          <View style={{ backgroundColor: C.surface, borderRadius: 18, paddingHorizontal: 14, paddingVertical: 6 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.label }}>
              {selected ? 'Proposal' : 'Submissions'}
            </Text>
          </View>
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center' }}>
            <RolePill role={role} onPress={cycleRole} isPrimary={isOwner} />
          </View>
        </View>
      </Animated.View>

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={scrollEventThrottle}
        contentContainerStyle={{ paddingTop: topBarH + 16, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {selected ? renderDetail(selected) : renderList()}
      </ScrollView>
    </View>
  );
}

// ── DetailRow ──────────────────────────────────────────────────────────────────

function DetailRow({ label, value, C }: { label: string; value: string; C: ReturnType<typeof useColors> }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Text style={{ fontSize: 12, fontWeight: '600', color: C.secondary, width: 70 }}>{label}</Text>
      <Text style={{ flex: 1, fontSize: 13, color: C.label }}>{value}</Text>
    </View>
  );
}
