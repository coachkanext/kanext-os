/**
 * Subscribers — Personal Hub Owner management screen.
 * Tap a subscriber row to open their full profile (tier history, spend, engagement, actions).
 * Back button in top bar returns to the list.
 * Owner-only screen: no role cycling.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { GlassView } from '@/components/ui/glass-view';
import { useColors, type ComponentColors } from '@/hooks/use-colors';
import { openSidePanel } from '@/utils/global-side-panel';
import { resetFooter } from '@/utils/global-footer-hide';
import { KMenuButton } from '@/components/ui/k-menu-button';

const TOP_BAR_H = 44;
const GAIN      = '#5A8A6E';
const HEAT      = '#B85C5C';
const CAUTION   = '#B8943E';

type TierId = 'free' | 'supporter' | 'inner-circle';

type Tier = { id: TierId; name: string; price: number; count: number; revenue: number; perks: string[] };
type Subscriber = {
  id: string; name: string; initials: string; tier: TierId;
  joinDate: string; spent: number; lastActive: string; history: string[];
  engagement: { liked: number; comments: number; viewed: number; interactions: string[] };
};
type AtRisk = { id: string; name: string; initials: string; tier: TierId; action: string; date: string };
type GrowthPoint = { label: string; total: number; free: number; paid: number };

const TIERS: Tier[] = [
  { id: 'free',      name: 'Free',      price: 0,  count: 1000, revenue: 0,    perks: ['Access to public posts', 'Public community feed', 'Free newsletter'] },
  { id: 'supporter', name: 'Supporter', price: 10, count: 197,  revenue: 1970, perks: ['Everything in Free', 'Exclusive monthly Q&A', 'Early access to content', 'Members-only community'] },
  { id: 'inner-circle', name: 'Inner Circle', price: 25, count: 50, revenue: 1250, perks: ['Everything in Supporter', 'Private community channel', 'Monthly 1-on-1 check-in', 'Inner Circle event invitations', 'Direct DM access'] },
];

const SUBSCRIBERS: Subscriber[] = [
  {
    id: 'u1', name: 'Jordan Williams', initials: 'JW', tier: 'inner-circle',
    joinDate: 'Jan 12, 2024', spent: 875, lastActive: '2d ago',
    history: ['Joined Free → Jan 2024', 'Upgraded to Supporter → Feb 2024', 'Upgraded to Inner Circle → Apr 2024'],
    engagement: { liked: 142, comments: 38, viewed: 94,
      interactions: ['Liked "How I Built My Brand from Zero" · 2d ago', 'Commented on "Top 5 Recruiting Mistakes" · 4d ago', 'Watched KTV: "Behind the Combine" · 5d ago', 'Renewed Inner Circle subscription · 1wk ago', 'Liked "Atlanta Workout Recap" · 1wk ago'] },
  },
  {
    id: 'u2', name: 'Marcus Webb', initials: 'MW', tier: 'supporter',
    joinDate: 'Feb 3, 2024', spent: 210, lastActive: '5d ago',
    history: ['Joined Free → Feb 2024', 'Upgraded to Supporter → Mar 2024'],
    engagement: { liked: 67, comments: 14, viewed: 43,
      interactions: ['Liked "Speed Training Tips" · 5d ago', 'Viewed "Recruiting Guide" · 1wk ago', 'Commented on "Combine Prep" · 1wk ago', 'Liked "Brand Building 101" · 2wk ago', 'Renewed Supporter · Mar 2024'] },
  },
  {
    id: 'u3', name: 'Nia Thompson', initials: 'NT', tier: 'supporter',
    joinDate: 'Feb 18, 2024', spent: 180, lastActive: '1d ago',
    history: ['Joined Supporter → Feb 2024'],
    engagement: { liked: 89, comments: 22, viewed: 61,
      interactions: ['Liked "Atlanta Workout Recap" · 1d ago', 'Commented on "Mindset Monday" · 3d ago', 'Watched KTV: "Combine Prep" · 5d ago', 'Liked "Brand Building 101" · 1wk ago', 'Viewed "Recruiting Guide PDF" · 1wk ago'] },
  },
  {
    id: 'u4', name: 'Devon Carter', initials: 'DC', tier: 'inner-circle',
    joinDate: 'Mar 1, 2024', spent: 750, lastActive: '3d ago',
    history: ['Joined Supporter → Mar 2024', 'Upgraded to Inner Circle → Mar 2024'],
    engagement: { liked: 118, comments: 31, viewed: 77,
      interactions: ['Liked "Speed Training Tips" · 3d ago', 'Viewed "Speed & Agility Program" · 3d ago', 'Commented on "Behind the Combine" · 5d ago', 'Renewed Inner Circle · Mar 2024', 'Liked "How I Built My Brand" · 2wk ago'] },
  },
  {
    id: 'u5', name: 'Aaliyah Foster', initials: 'AF', tier: 'free',
    joinDate: 'Mar 5, 2024', spent: 0, lastActive: '12d ago',
    history: ['Joined Free → Mar 2024'],
    engagement: { liked: 12, comments: 2, viewed: 9,
      interactions: ['Liked "Mindset Monday" · 12d ago', 'Viewed "How I Built My Brand" · 2wk ago', 'Liked "Atlanta Workout Recap" · 3wk ago', 'Joined Free tier · Mar 2024', 'Viewed public feed · Mar 2024'] },
  },
  {
    id: 'u6', name: 'Chris Okonkwo', initials: 'CO', tier: 'supporter',
    joinDate: 'Mar 10, 2024', spent: 120, lastActive: '8d ago',
    history: ['Joined Free → Mar 2024', 'Upgraded to Supporter → Mar 2024'],
    engagement: { liked: 44, comments: 9, viewed: 28,
      interactions: ['Liked "Combine Prep Guide" · 8d ago', 'Commented on "Speed Training" · 2wk ago', 'Viewed "Top 5 Recruiting Mistakes" · 2wk ago', 'Upgraded to Supporter · Mar 2024', 'Liked "Brand Building 101" · Mar 2024'] },
  },
  {
    id: 'u7', name: 'Priya Menon', initials: 'PM', tier: 'free',
    joinDate: 'Mar 22, 2024', spent: 0, lastActive: '20d ago',
    history: ['Joined Free → Mar 2024'],
    engagement: { liked: 5, comments: 0, viewed: 4,
      interactions: ['Viewed "How I Built My Brand" · 20d ago', 'Liked "Atlanta Workout Recap" · 3wk ago', 'Viewed public feed · Mar 2024', 'Joined Free tier · Mar 2024', 'Liked a post · Mar 2024'] },
  },
  {
    id: 'u8', name: 'Tyler Banks', initials: 'TB', tier: 'supporter',
    joinDate: 'Apr 1, 2024', spent: 30, lastActive: '1d ago',
    history: ['Joined Supporter → Apr 2024'],
    engagement: { liked: 21, comments: 6, viewed: 15,
      interactions: ['Liked "Mindset Monday" · 1d ago', 'Commented on "Speed Tips" · 2d ago', 'Viewed "Recruiting Guide" · 5d ago', 'Subscribed to Supporter · Apr 1', 'Liked "How I Built My Brand" · Apr 2024'] },
  },
];

const AT_RISK: AtRisk[] = [
  { id: 'r1', name: 'Taylor Reed',  initials: 'TR', tier: 'supporter', action: 'No activity in 28 days', date: 'Mar 29' },
  { id: 'r2', name: 'James Park',   initials: 'JP', tier: 'inner-circle', action: 'Downgraded from Inner Circle', date: 'Apr 1'  },
  { id: 'r3', name: 'Sandra Miles', initials: 'SM', tier: 'supporter', action: 'Cancelled subscription', date: 'Apr 3'  },
];

const GROWTH_DATA: GrowthPoint[] = [
  { label: 'Mar 7',  total: 1150, free: 968,  paid: 182 },
  { label: 'Mar 10', total: 1163, free: 978,  paid: 185 },
  { label: 'Mar 13', total: 1178, free: 989,  paid: 189 },
  { label: 'Mar 16', total: 1191, free: 996,  paid: 195 },
  { label: 'Mar 19', total: 1205, free: 1005, paid: 200 },
  { label: 'Mar 22', total: 1214, free: 1010, paid: 204 },
  { label: 'Mar 25', total: 1226, free: 1020, paid: 206 },
  { label: 'Mar 28', total: 1237, free: 1029, paid: 208 },
  { label: 'Mar 31', total: 1244, free: 1035, paid: 209 },
  { label: 'Apr 3',  total: 1247, free: 1000, paid: 247 },
];

type EditForm = { name: string; price: string; perks: string[]; visible: boolean };

function tierBadgeColors(tier: string, C: ComponentColors): { bg: string; text: string } {
  if (tier === 'inner-circle') return { bg: GAIN + '22',    text: GAIN    };
  if (tier === 'supporter')    return { bg: CAUTION + '22', text: CAUTION };
  return { bg: C.separator, text: C.secondary };
}

function tierLabel(tier: string): string {
  if (tier === 'inner-circle') return 'Inner Circle';
  if (tier === 'supporter') return 'Supporter';
  return 'Free';
}

export default function SubscribersScreen() {
  const C      = useColors();
  const insets = useSafeAreaInsets();
  const s      = useMemo(() => makeStyles(C), [C]);

  const topBarH           = insets.top + TOP_BAR_H;
  const contentPaddingTop = topBarH + 8;

  const [selectedSub,    setSelectedSub]    = useState<Subscriber | null>(null);
  const [expandedTierId, setExpandedTierId] = useState<string | null>(null);
  const [editForms, setEditForms] = useState<Record<string, EditForm>>(() => {
    const forms: Record<string, EditForm> = {};
    TIERS.forEach(t => { forms[t.id] = { name: t.name, price: String(t.price), perks: [...t.perks], visible: true }; });
    return forms;
  });

  const [subFilter,   setSubFilter]   = useState<'All' | 'Free' | 'Supporter' | 'Inner Circle'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [chartFilter, setChartFilter] = useState<'Total' | 'Free' | 'Paid'>('Total');
  const [chartWidth,  setChartWidth]  = useState(0);

  useFocusEffect(useCallback(() => { resetFooter(); }, []));

  const haptic = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  const filteredSubs = useMemo(() => {
    let list = SUBSCRIBERS;
    if (subFilter !== 'All') {
      const key = (subFilter === 'Inner Circle' ? 'inner-circle' : subFilter.toLowerCase()) as TierId;
      list = list.filter(s => s.tier === key);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(s => s.name.toLowerCase().includes(q));
    }
    return list;
  }, [subFilter, searchQuery]);

  const updateForm = (id: string, patch: Partial<EditForm>) =>
    setEditForms(prev => ({ ...prev, [id]: { ...prev[id], ...patch } }));

  const updatePerk = (tierId: string, index: number, value: string) => {
    const perks = [...editForms[tierId].perks]; perks[index] = value; updateForm(tierId, { perks });
  };
  const deletePerk = (tierId: string, index: number) =>
    updateForm(tierId, { perks: editForms[tierId].perks.filter((_, i) => i !== index) });
  const addPerk = (tierId: string) =>
    updateForm(tierId, { perks: [...editForms[tierId].perks, ''] });

  const chartValues = useMemo(() => {
    const key = chartFilter.toLowerCase() as 'total' | 'free' | 'paid';
    return GROWTH_DATA.map(d => d[key]);
  }, [chartFilter]);

  const chartMax = useMemo(() => Math.max(...chartValues), [chartValues]);
  const chartMin = useMemo(() => Math.min(...chartValues), [chartValues]);
  const chartMid = useMemo(() => Math.round((chartMax + chartMin) / 2), [chartMax, chartMin]);

  const CHART_H  = 120;
  const DOT_SIZE = 5;
  const PAD_LEFT = 40;
  const PAD_BOT  = 24;

  const plotPoints = useMemo(() => {
    if (!chartWidth || chartWidth <= PAD_LEFT) return [];
    const usableW = chartWidth - PAD_LEFT - 8;
    const usableH = CHART_H - PAD_BOT - 8;
    const range   = chartMax - chartMin || 1;
    return chartValues.map((v, i) => ({
      x: PAD_LEFT + (i / (chartValues.length - 1)) * usableW,
      y: 8 + (1 - (v - chartMin) / range) * usableH,
      v,
    }));
  }, [chartValues, chartWidth, chartMax, chartMin]);

  // ── Tier Card ─────────────────────────────────────────────────────────────

  const renderTierCard = (tier: Tier) => {
    const isExpanded = expandedTierId === tier.id;
    const form       = editForms[tier.id];
    return (
      <GlassView key={tier.id} tier={1} style={s.tierCard}>
        <View style={s.tierHeaderRow}>
          <View>
            <Text style={[s.tierName, { color: C.label }]}>{tier.name}</Text>
            <Text style={[s.tierPrice, { color: C.secondary }]}>
              {tier.price === 0 ? '$0/mo' : `$${tier.price}/mo`}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 3 }}>
            <Text style={[s.tierCount, { color: C.label }]}>{tier.count.toLocaleString()}</Text>
            {tier.revenue > 0 && (
              <Text style={[{ fontSize: 13, fontWeight: '600', color: GAIN }]}>${tier.revenue.toLocaleString()}/mo</Text>
            )}
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: C.separator, marginVertical: 12 }]} />

        <View style={{ gap: 8 }}>
          {tier.perks.map((perk, i) => (
            <View key={i} style={s.perkRow}>
              <IconSymbol name="checkmark" size={13} color={GAIN} />
              <Text style={[{ fontSize: 14, flex: 1, color: C.label }]}>{perk}</Text>
            </View>
          ))}
        </View>

        <View style={[s.divider, { backgroundColor: C.separator, marginTop: 12, marginBottom: 12 }]} />

        <Pressable
          style={[s.editTierBtn, { backgroundColor: C.bg, borderColor: C.separator }]}
          onPress={() => { haptic(); setExpandedTierId(prev => prev === tier.id ? null : tier.id); }}
        >
          <Text style={[{ fontSize: 13, fontWeight: '600', color: C.label }]}>Edit Tier</Text>
        </Pressable>

        {isExpanded && (
          <View style={{ marginTop: 12 }}>
            <View style={[s.divider, { backgroundColor: C.separator, marginBottom: 16 }]} />
            <Text style={[s.editLabel, { color: C.secondary }]}>Tier Name</Text>
            <TextInput
              style={[s.editInput, { backgroundColor: C.surface, borderColor: C.separator, color: C.label }]}
              value={form.name}
              onChangeText={v => updateForm(tier.id, { name: v })}
              placeholderTextColor={C.secondary}
            />
            <Text style={[s.editLabel, { color: C.secondary, marginTop: 12 }]}>Monthly Price ($)</Text>
            <TextInput
              style={[s.editInput, { backgroundColor: C.surface, borderColor: C.separator, color: C.label }]}
              value={form.price}
              onChangeText={v => updateForm(tier.id, { price: v })}
              placeholderTextColor={C.secondary}
              keyboardType="numeric"
            />
            <Text style={[s.editLabel, { color: C.secondary, marginTop: 16 }]}>Perks</Text>
            {form.perks.map((perk, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <TextInput
                  style={[s.editInput, { flex: 1, backgroundColor: C.surface, borderColor: C.separator, color: C.label }]}
                  value={perk}
                  onChangeText={v => updatePerk(tier.id, i, v)}
                  placeholderTextColor={C.secondary}
                  placeholder="Perk description"
                />
                <Pressable onPress={() => { haptic(); deletePerk(tier.id, i); }} hitSlop={8}>
                  <IconSymbol name="trash" size={16} color={HEAT} />
                </Pressable>
              </View>
            ))}
            <Pressable
              style={[s.addPerkBtn, { borderColor: C.separator }]}
              onPress={() => { haptic(); addPerk(tier.id); }}
            >
              <IconSymbol name="plus" size={14} color={C.secondary} />
              <Text style={[{ fontSize: 13, fontWeight: '600', color: C.secondary }]}>Add Perk</Text>
            </Pressable>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <Text style={[s.editLabel, { color: C.secondary, marginTop: 0 }]}>Visibility</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {[true, false].map(v => (
                  <Pressable
                    key={String(v)}
                    style={[s.visPill, form.visible === v
                      ? { backgroundColor: C.label, borderColor: C.label }
                      : { backgroundColor: C.surface, borderColor: C.separator }]}
                    onPress={() => { haptic(); updateForm(tier.id, { visible: v }); }}
                  >
                    <Text style={[{ fontSize: 13, fontWeight: '600' }, { color: form.visible === v ? C.bg : C.secondary }]}>
                      {v ? 'Active' : 'Hidden'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <Pressable
              style={[s.saveBtn, { backgroundColor: C.label }]}
              onPress={() => { haptic(); setExpandedTierId(null); }}
            >
              <Text style={[{ fontSize: 14, fontWeight: '700', color: C.bg }]}>Save Changes</Text>
            </Pressable>
          </View>
        )}
      </GlassView>
    );
  };

  // ── Subscriber Row ────────────────────────────────────────────────────────

  const renderSubscriberRow = (sub: Subscriber) => {
    const badge = tierBadgeColors(sub.tier, C);
    return (
      <Pressable
        key={sub.id}
        onPress={() => { haptic(); setSelectedSub(sub); }}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <GlassView tier={1} style={s.subCard}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={[s.avatar, { backgroundColor: C.bg, borderColor: C.separator }]}>
              <Text style={[{ fontSize: 13, fontWeight: '700', color: C.label }]}>{sub.initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <Text style={[{ fontSize: 15, fontWeight: '600', color: C.label }]}>{sub.name}</Text>
                <View style={[s.tierBadgePill, { backgroundColor: badge.bg }]}>
                  <Text style={[{ fontSize: 11, fontWeight: '700', color: badge.text }]}>{tierLabel(sub.tier)}</Text>
                </View>
              </View>
              <Text style={[{ fontSize: 12, color: C.secondary, marginTop: 2 }]}>
                Joined {sub.joinDate}  ·  {sub.lastActive}
              </Text>
            </View>
            {sub.spent > 0 && (
              <Text style={[{ fontSize: 13, fontWeight: '700', color: C.label }]}>${sub.spent}</Text>
            )}
          </View>
        </GlassView>
      </Pressable>
    );
  };

  // ── Subscriber Detail ─────────────────────────────────────────────────────

  const renderDetail = (sub: Subscriber) => {
    const badge = tierBadgeColors(sub.tier, C);
    return (
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={{ alignItems: 'center', paddingTop: 20, paddingBottom: 4, paddingHorizontal: 16 }}>
          <View style={[s.detailAvatar, { backgroundColor: C.surface, borderColor: C.separator }]}>
            <Text style={[{ fontSize: 22, fontWeight: '800', color: C.label }]}>{sub.initials}</Text>
          </View>
          <Text style={[{ fontSize: 20, fontWeight: '700', color: C.label, marginTop: 12 }]}>{sub.name}</Text>
          <View style={[s.tierBadgePill, { backgroundColor: badge.bg, marginTop: 6, paddingHorizontal: 12, paddingVertical: 4 }]}>
            <Text style={[{ fontSize: 13, fontWeight: '700', color: badge.text }]}>{tierLabel(sub.tier)} Member</Text>
          </View>
          <Text style={[{ fontSize: 13, color: C.secondary, marginTop: 6 }]}>Joined {sub.joinDate}</Text>
        </View>

        {/* Stats Row */}
        <GlassView tier={1} style={{ marginHorizontal: 16, marginTop: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row' }}>
            {[
              { value: `$${sub.spent}`,                    label: 'Lifetime Spend' },
              { value: sub.lastActive,                      label: 'Last Active'    },
              { value: String(sub.engagement.viewed),       label: 'Posts Viewed'   },
            ].map((stat, i) => (
              <React.Fragment key={stat.label}>
                {i > 0 && <View style={[{ width: 1, marginHorizontal: 8, backgroundColor: C.separator }]} />}
                <View style={{ flex: 1, alignItems: 'center' }}>
                  <Text style={[{ fontSize: 16, fontWeight: '800', color: C.label }]}>{stat.value}</Text>
                  <Text style={[{ fontSize: 11, marginTop: 3, color: C.secondary }]}>{stat.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </View>
        </GlassView>

        {/* Tier History */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Tier History</Text>
          <GlassView tier={1} style={{ overflow: 'hidden', borderRadius: 12 }}>
            {sub.history.map((entry, i) => (
              <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <View style={[{ width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
                  { backgroundColor: i === sub.history.length - 1 ? GAIN : C.muted }]} />
                <Text style={[{ fontSize: 14, color: C.label, flex: 1 }]}>{entry}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Engagement */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <Text style={[s.sectionHeader, { color: C.label }]}>Engagement</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {[
              { icon: 'heart.fill',  value: sub.engagement.liked,    label: 'Liked'    },
              { icon: 'bubble.left', value: sub.engagement.comments,  label: 'Comments' },
              { icon: 'eye.fill',    value: sub.engagement.viewed,    label: 'Viewed'   },
            ].map(stat => (
              <GlassView key={stat.label} tier={1} style={{ flex: 1, alignItems: 'center', padding: 14, gap: 4 }}>
                <IconSymbol name={stat.icon as any} size={17} color={C.secondary} />
                <Text style={[{ fontSize: 18, fontWeight: '800', color: C.label }]}>{stat.value}</Text>
                <Text style={[{ fontSize: 11, color: C.secondary }]}>{stat.label}</Text>
              </GlassView>
            ))}
          </View>

          <Text style={[{ fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, color: C.secondary, marginBottom: 8 }]}>
            Last 5 Interactions
          </Text>
          <GlassView tier={1} style={{ overflow: 'hidden', borderRadius: 12 }}>
            {sub.engagement.interactions.map((item, i) => (
              <View key={i} style={[{ paddingHorizontal: 14, paddingVertical: 12 },
                i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: C.separator }]}>
                <Text style={[{ fontSize: 13, color: C.label, lineHeight: 18 }]}>{item}</Text>
              </View>
            ))}
          </GlassView>
        </View>

        {/* Actions */}
        <View style={{ paddingHorizontal: 16, marginTop: 24 }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
            <Pressable
              style={[s.actionBtn, { backgroundColor: C.label, flex: 1 }]}
              onPress={() => haptic()}
            >
              <IconSymbol name="paperplane.fill" size={15} color={C.bg} />
              <Text style={[{ fontSize: 14, fontWeight: '700', color: C.bg }]}>Message</Text>
            </Pressable>
            <Pressable
              style={[s.actionBtn, { backgroundColor: C.surface, borderWidth: 1, borderColor: C.separator, flex: 1 }]}
              onPress={() => haptic()}
            >
              <IconSymbol name="gift.fill" size={15} color={C.label} />
              <Text style={[{ fontSize: 14, fontWeight: '700', color: C.label }]}>Gift</Text>
            </Pressable>
          </View>
          <Pressable
            style={[s.actionBtn, { backgroundColor: HEAT + '15', borderWidth: 1, borderColor: HEAT + '44' }]}
            onPress={() => haptic()}
          >
            <IconSymbol name="person.fill.badge.minus" size={15} color={HEAT} />
            <Text style={[{ fontSize: 14, fontWeight: '700', color: HEAT }]}>Remove Subscriber</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>
      {/* Top Bar */}
      <View style={[s.topBar, { height: topBarH, paddingTop: insets.top, backgroundColor: C.bg, borderBottomColor: C.separator }]}>
        {selectedSub ? (
          <Pressable onPress={() => { haptic(); setSelectedSub(null); }} hitSlop={8} style={s.topBarBtn}>
            <IconSymbol name="chevron.left" size={20} color={C.label} />
          </Pressable>
        ) : (
          <Pressable onPress={() => { haptic(); openSidePanel(); }} hitSlop={8} style={s.topBarBtn}>
            <KMenuButton />
          </Pressable>
        )}
        <View style={[s.titlePill, { backgroundColor: C.surface, borderColor: C.separator }]}>
          <Text style={[{ fontSize: 14, fontWeight: '700', color: C.label }]} numberOfLines={1}>
            {selectedSub ? selectedSub.name : 'Subscribers'}
          </Text>
        </View>
        <View style={s.topBarBtn} />
      </View>

      {/* List — always mounted so scroll position is preserved on back */}
      <View
        style={[{ flex: 1 }, selectedSub !== null && { opacity: 0 }]}
        pointerEvents={selectedSub !== null ? 'none' : 'auto'}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: contentPaddingTop, paddingBottom: insets.bottom + 80 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 1. MRR Card */}
          <GlassView tier={1} style={s.mrrCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <Text style={[{ fontSize: 32, fontWeight: '800', color: C.label }]}>$3,220/mo</Text>
              <View style={[{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, backgroundColor: GAIN }]}>
                <Text style={[{ color: '#fff', fontSize: 12, fontWeight: '600' }]}>+8.3%</Text>
              </View>
            </View>
            <View style={[s.divider, { backgroundColor: C.separator }]} />
            <Text style={[{ fontSize: 13, marginTop: 10, color: C.secondary }]}>
              Free: 1,000  ·  Supporter: 197  ·  Inner Circle: 50
            </Text>
          </GlassView>

          {/* 2. Tier Cards */}
          <View style={{ marginHorizontal: 16, gap: 12, marginTop: 20 }}>
            {TIERS.map(renderTierCard)}
          </View>

          {/* 3. Subscriber List */}
          <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Text style={[s.sectionHeader, { color: C.label }]}>Subscribers</Text>
              <Pressable onPress={() => haptic()} hitSlop={8}>
                <Text style={[{ fontSize: 14, fontWeight: '500', color: C.secondary }]}>Sort</Text>
              </Pressable>
            </View>

            <View style={[s.searchBar, { backgroundColor: C.surface, borderColor: C.separator }]}>
              <IconSymbol name="magnifyingglass" size={16} color={C.secondary} />
              <TextInput
                style={[{ flex: 1, fontSize: 14, height: '100%', color: C.label, marginLeft: 8 }]}
                placeholder="Search subscribers…"
                placeholderTextColor={C.secondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}
              contentContainerStyle={{ flexDirection: 'row', gap: 6, paddingRight: 4 }}>
              {(['All', 'Free', 'Supporter', 'Inner Circle'] as const).map(f => {
                const active = subFilter === f;
                return (
                  <Pressable key={f}
                    style={[s.filterPill, active
                      ? { backgroundColor: C.label, borderColor: C.label }
                      : { backgroundColor: C.surface, borderColor: C.separator }]}
                    onPress={() => { haptic(); setSubFilter(f); }}>
                    <Text style={[{ fontSize: 13, fontWeight: '600' }, { color: active ? C.bg : C.secondary }]}>{f}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <View style={{ gap: 8 }}>{filteredSubs.map(renderSubscriberRow)}</View>
          </View>

          {/* 4. At Risk */}
          <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
            <Text style={[s.sectionHeader, { color: C.label }]}>At Risk</Text>
            <View style={{ gap: 8 }}>
              {AT_RISK.map(item => {
                const badge = tierBadgeColors(item.tier, C);
                return (
                  <GlassView key={item.id} tier={1} style={{ padding: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <Text style={[{ fontSize: 15, fontWeight: '600', color: C.label }]}>{item.name}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[s.tierBadgePill, { backgroundColor: badge.bg }]}>
                          <Text style={[{ fontSize: 11, fontWeight: '700', color: badge.text }]}>{tierLabel(item.tier)}</Text>
                        </View>
                        <IconSymbol name="arrow.down" size={14} color={HEAT} style={{ marginLeft: 6 }} />
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text style={[{ fontSize: 13, color: C.secondary }]}>{item.action}</Text>
                      <Text style={[{ fontSize: 12, color: C.secondary }]}>{item.date}</Text>
                    </View>
                  </GlassView>
                );
              })}
            </View>
          </View>

          {/* 5. Growth Chart */}
          <View style={{ paddingHorizontal: 16, marginTop: 28 }}>
            <Text style={[s.sectionHeader, { color: C.label }]}>Subscriber Growth</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}
              contentContainerStyle={{ flexDirection: 'row', gap: 6 }}>
              {(['Total', 'Free', 'Paid'] as const).map(f => {
                const active = chartFilter === f;
                return (
                  <Pressable key={f}
                    style={[s.filterPill, active
                      ? { backgroundColor: C.label, borderColor: C.label }
                      : { backgroundColor: C.surface, borderColor: C.separator }]}
                    onPress={() => { haptic(); setChartFilter(f); }}>
                    <Text style={[{ fontSize: 13, fontWeight: '600' }, { color: active ? C.bg : C.secondary }]}>{f}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <GlassView tier={1} style={{ padding: 12 }}>
              <View
                style={[{ position: 'relative', overflow: 'hidden' }, { height: CHART_H }]}
                onLayout={e => setChartWidth(e.nativeEvent.layout.width)}
              >
                <Text style={[{ position: 'absolute', left: 0, top: 4, fontSize: 10, fontWeight: '500', width: 36, color: C.secondary }]}>
                  {chartMax.toLocaleString()}
                </Text>
                <Text style={[{ position: 'absolute', left: 0, fontSize: 10, fontWeight: '500', width: 36, color: C.secondary, top: CHART_H / 2 - PAD_BOT / 2 }]}>
                  {chartMid.toLocaleString()}
                </Text>
                {plotPoints.length > 1 && plotPoints.slice(0, -1).map((pt, i) => {
                  const next  = plotPoints[i + 1];
                  const dx    = next.x - pt.x;
                  const dy    = next.y - pt.y;
                  const len   = Math.sqrt(dx * dx + dy * dy);
                  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                  return (
                    <View key={`l${i}`} style={{
                      position: 'absolute', left: pt.x, top: pt.y,
                      width: len, height: 1.5, backgroundColor: C.label, opacity: 0.35,
                      transform: [{ rotate: `${angle}deg` }],
                    }} />
                  );
                })}
                {plotPoints.map((pt, i) => (
                  <View key={`d${i}`} style={{
                    position: 'absolute', backgroundColor: C.label,
                    left: pt.x - DOT_SIZE / 2, top: pt.y - DOT_SIZE / 2,
                    width: DOT_SIZE, height: DOT_SIZE, borderRadius: DOT_SIZE / 2,
                  }} />
                ))}
                {plotPoints.length > 0 && (
                  <>
                    <Text style={[{ position: 'absolute', fontSize: 10, fontWeight: '500', color: C.secondary, width: 34, textAlign: 'center', left: plotPoints[0].x - 17, top: CHART_H - PAD_BOT + 4 }]}>
                      {GROWTH_DATA[0].label}
                    </Text>
                    <Text style={[{ position: 'absolute', fontSize: 10, fontWeight: '500', color: C.secondary, width: 34, textAlign: 'center', left: plotPoints[plotPoints.length - 1].x - 17, top: CHART_H - PAD_BOT + 4 }]}>
                      {GROWTH_DATA[GROWTH_DATA.length - 1].label}
                    </Text>
                  </>
                )}
              </View>
            </GlassView>
          </View>
        </ScrollView>
      </View>

      {/* Detail — overlays the list when a subscriber is selected */}
      {selectedSub !== null && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: C.bg }]}>
          {renderDetail(selectedSub)}
        </View>
      )}
    </View>
  );
}

function makeStyles(C: ComponentColors) {
  return StyleSheet.create({
    root:        { flex: 1 },
    topBar: {
      position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100,
      flexDirection: 'row', alignItems: 'flex-end',
      paddingHorizontal: 12, paddingBottom: 6,
      borderBottomWidth: StyleSheet.hairlineWidth,
    },
    topBarBtn:    { width: 40, height: 32, alignItems: 'center', justifyContent: 'center' },
    titlePill:    { flex: 1, alignItems: 'center', justifyContent: 'center', height: 32, borderRadius: 16, borderWidth: 1, marginHorizontal: 10 },
    divider:      { height: StyleSheet.hairlineWidth },
    mrrCard:      { marginHorizontal: 16, marginTop: 16, padding: 16 },
    tierCard:     { padding: 16 },
    tierHeaderRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    tierName:     { fontSize: 17, fontWeight: '700' },
    tierPrice:    { fontSize: 13, marginTop: 3 },
    tierCount:    { fontSize: 20, fontWeight: '800' },
    perkRow:      { flexDirection: 'row', alignItems: 'center', gap: 7 },
    editTierBtn:  { height: 36, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    editLabel:    { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
    editInput:    { height: 40, borderRadius: 8, borderWidth: 1, paddingHorizontal: 12, fontSize: 14 },
    addPerkBtn:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, borderWidth: 1, borderRadius: 8, justifyContent: 'center', marginTop: 4, marginBottom: 16 },
    visPill:      { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
    saveBtn:      { height: 42, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
    sectionHeader: { fontSize: 17, fontWeight: '700', marginBottom: 12 },
    searchBar:    { height: 38, borderRadius: 10, borderWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, marginBottom: 10 },
    filterPill:   { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, borderWidth: 1 },
    subCard:      { padding: 14 },
    avatar:       { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
    detailAvatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
    tierBadgePill: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
    actionBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, height: 44, borderRadius: 12 },
    muted:        { color: C.muted },
  });
}
